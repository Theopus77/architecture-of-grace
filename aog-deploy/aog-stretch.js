/* AOG-STRETCH-PRO-V1 (2026-10-23, Jimmy: the Studio pro-grade everywhere) — the Mixing Desk's time-stretch that keeps
   every hit where it belongs. The desk's first stretch (WSOLA in 40 ms windows, music-studio.html wsola and
   aog-desk-warp.js) laid drum hits 7–14 ms late and took up to 6 dB off their peaks. This one:
   1 · finds every onset (spectral flux on a linked mono mix, then the attack's first half-millisecond from the
       sound's edge), so left and right always move together and the image never wobbles;
   2 · copies each hit untouched, from 2 ms before its attack to 25 ms after, at exactly its new time
       (round(onset / speed)), so it lands to the sample with its full punch;
   3 · stretches only the steady sound between the hits, with WSOLA in 23 ms windows that look ±12 ms for the best
       match (normalised, coarse at a quarter rate, then to the sample); the window before a hit is chosen to match
       both what came before it and the hit, so the seams are smooth;
   4 · ends on the recording's own last samples, and is exactly round(length / speed) long.
   The page loads this file the first time a recording is stretched; the work runs in a Worker made from this file's
   own text (AOGStretch.run), which lets go after 20 s of rest. In node: require("./aog-stretch.js").stretch(...).
   Tests: music-handoff/tests/unit/stretch.js (node), music-handoff/tests/studio/stretch.js (the desk). */
(function (root) {
  "use strict";
  /* everything the Worker needs lives inside make(): it is sent to the Worker as text */
  function make() {
    var VERSION = "AOG-STRETCH-PRO-V1";

    /* ── a small FFT (radix 2, in place) for the onset finder ── */
    var FT = {};
    function fftTab(N) {
      if (FT[N]) return FT[N];
      var rev = new Uint32Array(N), cs = new Float32Array(N / 2), sn = new Float32Array(N / 2), b = Math.log2(N) | 0;
      for (var i = 0; i < N; i++) { var r = 0, x = i; for (var k = 0; k < b; k++) { r = (r << 1) | (x & 1); x >>= 1; } rev[i] = r; }
      for (var j = 0; j < N / 2; j++) { cs[j] = Math.cos(2 * Math.PI * j / N); sn[j] = -Math.sin(2 * Math.PI * j / N); }
      return (FT[N] = { rev: rev, cs: cs, sn: sn });
    }
    function fft(re, im) {
      var N = re.length, T = fftTab(N), rev = T.rev, i, t;
      for (i = 0; i < N; i++) { var r = rev[i]; if (r > i) { t = re[i]; re[i] = re[r]; re[r] = t; t = im[i]; im[i] = im[r]; im[r] = t; } }
      for (var size = 2; size <= N; size <<= 1) {
        var half = size >> 1, step = N / size;
        for (var s = 0; s < N; s += size) {
          for (var j = 0, k = 0; j < half; j++, k += step) {
            var a = s + j, b2 = a + half, wr = T.cs[k], wi = T.sn[k];
            var xr = re[b2] * wr - im[b2] * wi, xi = re[b2] * wi + im[b2] * wr;
            re[b2] = re[a] - xr; im[b2] = im[a] - xi; re[a] += xr; im[a] += xi;
          }
        }
      }
    }

    function monoOf(X) {
      var nch = X.length, n = X[0].length, m = new Float32Array(n), g = 1 / nch;
      for (var c = 0; c < nch; c++) { var x = X[c]; for (var i = 0; i < n; i++) m[i] += x[i] * g; }
      return m;
    }

    /* ── 1 · the onsets: positive log-spectral flux, picked against its neighbourhood, then placed to the
       half-millisecond at the attack's edge (where the sound's high end first climbs a quarter of the way up) ── */
    function onsets(m, sr) {
      /* the flux listens at half rate (a pair of samples averaged) in 23 ms frames every 5.8 ms; one real FFT each */
      var n = m.length, Dn = sr >= 32000 ? 2 : 1, asr = sr / Dn, na = Math.floor(n / Dn), aa = Dn === 1 ? m : new Float32Array(na);
      if (Dn === 2) for (var i0 = 0; i0 < na; i0++) aa[i0] = 0.5 * (m[2 * i0] + m[2 * i0 + 1]);
      var N = asr > 33000 ? 1024 : 512, hop = N >> 2, half = N >> 1, M = half;
      var K = Math.floor((na + half) / hop) + 1, f = new Float32Array(K), en = new Float32Array(K);
      var w = new Float32Array(N); for (var j = 0; j < N; j++) w[j] = 0.5 - 0.5 * Math.cos(2 * Math.PI * j / N);
      var tr = new Float32Array(M), ti = new Float32Array(M); for (j = 0; j < M; j++) { tr[j] = Math.cos(2 * Math.PI * j / N); ti[j] = -Math.sin(2 * Math.PI * j / N); }
      var zr = new Float32Array(M), zi = new Float32Array(M), lm = new Float32Array(M), pl = new Float32Array(M);
      var sc = 4 / N, G = 1000, emax = 0;
      for (var k = 0; k < K; k++) {
        var a = k * hop - half, e = 0;
        for (j = 0; j < M; j++) {
          var q0 = a + 2 * j, v0 = q0 >= 0 && q0 < na ? aa[q0] * w[2 * j] : 0, v1 = q0 + 1 >= 0 && q0 + 1 < na ? aa[q0 + 1] * w[2 * j + 1] : 0;
          zr[j] = v0; zi[j] = v1; e += v0 * v0 + v1 * v1;
        }
        en[k] = e; if (e > emax) emax = e;
        if (e < 1e-14) { f[k] = 0; pl.fill(0); continue; }
        fft(zr, zi);
        var fl = 0;
        for (var b = 1; b < M; b++) {
          var c2 = M - b, er = 0.5 * (zr[b] + zr[c2]), ei = 0.5 * (zi[b] - zi[c2]), or = 0.5 * (zi[b] + zi[c2]), oi = -0.5 * (zr[b] - zr[c2]);
          var xr = er + tr[b] * or - ti[b] * oi, xi = ei + tr[b] * oi + ti[b] * or;
          var l = Math.log(1 + G * sc * Math.sqrt(xr * xr + xi * xi)), d = l - pl[b]; if (d > 0) fl += d; lm[b] = l;
        }
        var tmp = pl; pl = lm; lm = tmp;
        f[k] = fl;
      }
      var fmax = 0; for (k = 0; k < K; k++) if (f[k] > fmax) fmax = f[k];
      if (!(fmax > 0)) return [];
      var picks = [], minGap = Math.round(0.04 * asr / hop), back = Math.max(4, Math.round(0.06 * asr / hop)), fwd = Math.max(2, Math.round(0.017 * asr / hop));
      for (k = 0; k < K; k++) {
        var fk = f[k]; if (fk < 0.04 * fmax || en[k] < emax * 1e-6) continue;
        var isMax = true; for (j = Math.max(0, k - 2); j <= Math.min(K - 1, k + 2); j++) if (j !== k && (f[j] > fk || (f[j] === fk && j < k))) { isMax = false; break; }
        if (!isMax) continue;
        var s = 0, c = 0; for (j = Math.max(0, k - back); j <= Math.min(K - 1, k + fwd); j++) if (j !== k) { s += f[j]; c++; }
        var mean = c ? s / c : 0;
        if (fk < 1.5 * mean + 0.02 * fmax) continue;
        if (picks.length && k - picks[picks.length - 1].k < minGap) { if (fk > picks[picks.length - 1].s) picks[picks.length - 1] = { k: k, s: fk }; continue; }
        picks.push({ k: k, s: fk });
      }
      /* the attack's edge, from the high end of the sound (its first difference) in half-millisecond blocks */
      var B = Math.max(8, Math.round(0.0005 * sr)), nB = Math.ceil(n / B), env = new Float32Array(nB);
      for (var bi = 0; bi < nB; bi++) { var s2 = 0, i0 = bi * B, i1 = Math.min(n, i0 + B); for (var i = Math.max(1, i0); i < i1; i++) { var dd = m[i] - m[i - 1]; s2 += dd < 0 ? -dd : dd; } env[bi] = s2; }
      var out = [], last = -1e9;
      for (var p = 0; p < picks.length; p++) {
        var c0 = picks[p].k * hop * Dn, lo = Math.max(0, Math.floor((c0 - (half + hop) * Dn) / B)), hi = Math.min(nB - 1, Math.ceil((c0 + half * Dn) / B));
        var P = lo; for (bi = lo; bi <= hi; bi++) if (env[bi] > env[P]) P = bi;
        var bl = Math.max(0, lo - Math.round(0.01 * sr / B)), arr = []; for (bi = bl; bi < lo; bi++) arr.push(env[bi]);
        var base = 0; if (arr.length) { arr.sort(function (x, y) { return x - y; }); base = arr[arr.length >> 1]; }
        base = Math.min(base, env[P]);
        var thr = base + 0.25 * (env[P] - base), jb = P;
        while (jb - 1 >= lo && env[jb - 1] > thr) jb--;
        var at = jb * B;
        if (at - last < 0.03 * sr) continue;
        /* a hit rises: its first 6 ms hold at least 3 times the energy of any 6 ms in the 35 ms before it (in the high
           end or in all of it), so a held note's own wobble, vibrato or a vowel's change is never taken for a hit */
        if (rise(m, at, sr, true) < 3 && rise(m, at, sr, false) < 3) continue;
        out.push({ at: at, s: picks[p].s / fmax }); last = at;
      }
      return out;
    }

    function rise(m, at, sr, hf) {
      var W = Math.round(0.006 * sr), n = m.length;
      function en(a, b) { var s = 0; for (var t = Math.max(1, a); t < Math.min(n, b); t++) { var v = hf ? m[t] - m[t - 1] : m[t]; s += v * v; } return s; }
      var post = en(at, at + W), pre = 0, step = W >> 1;
      for (var e = at - Math.round(0.002 * sr); e >= at - Math.round(0.035 * sr) && e - W >= 0; e -= step) pre = Math.max(pre, en(e - W, e));
      return at - W < 0 || pre <= 0 ? Infinity : post / pre;
    }

    /* ── 2 · the stretch ── */
    function stretch(X, sr, sp, opt) {
      opt = opt || {};
      var nch = X.length, n = X[0].length, outN = Math.max(1, Math.round(n / sp));
      if (Math.abs(sp - 1) < 1e-9) return { out: X.map(function (x) { return Float32Array.from(x); }), onsets: [], outN: n };
      var H = Math.max(64, Math.round((opt.win || 0.0116) * sr)), N = 2 * H, tol = Math.round((opt.tol || 0.012) * sr);
      var pre = Math.round(0.002 * sr), post = Math.round(0.025 * sr), minPost = Math.round(0.006 * sr);
      var m = monoOf(X);
      var ons = opt.locks === false ? [] : onsets(m, sr);
      /* the hits' zones in the output: [z0, z1) copied untouched, offset D (output = input + D) */
      var Z = [];
      for (var i = 0; i < ons.length; i++) {
        var o = ons[i].at, O = Math.round(o / sp);
        if (O >= outN - 1) continue;
        Z.push({ o: o, D: O - o, z0: Math.max(0, O - pre), z1: Math.min(outN, O + post), O: O, s: ons[i].s });
      }
      /* the end: the recording's own last samples (dropped if a hit needs the room) */
      Z.push({ o: n, D: outN - n, z0: outN - 1, z1: outN, O: outN, s: -1, end: true });
      /* room between zones: no window may touch two (a gap of N); merge equal offsets, else shorten, else drop the weaker */
      var changed = true;
      while (changed) {
        changed = false;
        for (i = 0; i + 1 < Z.length && !changed; i++) {
          var A = Z[i], Bz = Z[i + 1];
          if (Bz.z0 - A.z1 >= N) continue;
          changed = true;
          if (!Bz.end && Math.abs(A.D - Bz.D) <= 1) { A.z1 = Math.max(A.z1, Bz.z1); Z.splice(i + 1, 1); continue; }
          A.z1 = Math.max(Math.min(A.z1, A.O + minPost), Bz.z0 - N);
          if (Bz.z0 - A.z1 >= N) continue;
          Z.splice(Bz.end || A.s >= Bz.s ? i + 1 : i, 1);
        }
      }
      /* frames: forced (inside a zone's reach) or free; the anchors of the free frames' nominal map */
      var nF = Math.ceil(outN / H), forced = new Int32Array(nF).fill(-1);
      for (var zi = 0; zi < Z.length; zi++) {
        var z = Z[zi], k0 = Math.max(0, Math.floor((z.z0 - N) / H) + 1), k1 = Math.min(nF - 1, Math.ceil(z.z1 / H) - 1);
        for (var k = k0; k <= k1; k++) { var op = k * H; if (op < z.z1 && op + N > z.z0 && forced[k] < 0) forced[k] = zi; }
      }
      var ax = [0], ay = [0];
      for (k = 0; k < nF; k++) if (forced[k] >= 0 && (k === 0 || forced[k - 1] !== forced[k] || k === nF - 1 || forced[k + 1] !== forced[k])) {
        var op2 = k * H, y2 = op2 - Z[forced[k]].D; if (op2 > ax[ax.length - 1]) { ax.push(op2); ay.push(y2); } else { ay[ay.length - 1] = y2; } }
      if (outN > ax[ax.length - 1]) { ax.push(outN); ay.push(n); }
      var Y = []; for (var c = 0; c < nch; c++) Y.push(new Float32Array(outN + N));
      var W = new Float32Array(N); for (var j = 0; j < N; j++) W[j] = 0.5 - 0.5 * Math.cos(2 * Math.PI * j / N);
      /* the search listens to a quarter-rate copy of the mono mix (11 kHz), then to the sample around the best place */
      var Q = Math.max(2, Math.round(opt.q || sr / 11025)), mq = Math.floor(n / Q), Dq = new Float32Array(mq + 1);
      for (i = 0; i < mq; i++) { var o4 = i * Q, sq = 0; for (j = 0; j < Q; j++) sq += m[o4 + j]; Dq[i] = sq; }
      var Hq = Math.floor(H / Q), tq = Math.max(1, Math.floor(tol / Q)), ai = 0, prev = 0;
      /* a free window never reaches into a hit's attack (no early echo of it) nor starts on the hit before it */
      var LZ = Z.filter(function (z) { return !z.end; }), zn = 0, after = Math.round(0.002 * sr);
      function dot(A, a, b, len) { var s0 = 0, s1 = 0, s2 = 0, s3 = 0, t = 0; for (; t + 3 < len; t += 4) { s0 += A[a + t] * A[b + t]; s1 += A[a + t + 1] * A[b + t + 1]; s2 += A[a + t + 2] * A[b + t + 2]; s3 += A[a + t + 3] * A[b + t + 3]; } for (; t < len; t++) s0 += A[a + t] * A[b + t]; return s0 + s1 + s2 + s3; }
      for (k = 0; k < nF; k++) {
        var op3 = k * H, pos;
        if (forced[k] >= 0) pos = op3 - Z[forced[k]].D;
        else {
          while (ai + 1 < ax.length - 1 && ax[ai + 1] <= op3) ai++;
          var x0 = ax[ai], x1 = ax[ai + 1], nom = Math.round(ay[ai] + (ay[ai + 1] - ay[ai]) * (op3 - x0) / Math.max(1, x1 - x0));
          while (zn < LZ.length && LZ[zn].z0 <= op3) zn++;
          var bHi = Math.max(0, Math.min(n - N, zn < LZ.length ? LZ[zn].o - pre - N : n - N)), bLo = Math.min(bHi, zn > 0 ? LZ[zn - 1].o + after : 0);
          nom = Math.max(bLo, Math.min(bHi, nom));
          if (k === 0) pos = nom;
          else {
            var tgt = prev + H, nk = k + 1 < nF && forced[k + 1] >= 0 ? (k + 1) * H - Z[forced[k + 1]].D : -1;
            var useNext = nk >= 0 && nk + H <= n;
            if (tgt < 0 || tgt + H > n || nom + tol + N >= n) pos = nom;
            else {
              var lo = Math.max(Math.ceil(bLo / Q), Math.floor(nom / Q) - tq), hi = Math.min(mq - 2 * Hq - 1, Math.floor(bHi / Q), Math.floor(nom / Q) + tq);
              var tg = Math.floor(tgt / Q), ng = useNext ? Math.floor(nk / Q) : -1;
              var et1 = 0, et2 = 0; for (j = 0; j < Hq; j++) { et1 += Dq[tg + j] * Dq[tg + j]; if (useNext) et2 += Dq[ng + j] * Dq[ng + j]; }
              var bq = Math.max(lo, Math.min(hi, Math.round(nom / Q))), best = -Infinity;
              if (hi >= lo) {
                var e1 = 0, e2 = 0; for (j = 0; j < Hq; j++) { e1 += Dq[lo + j] * Dq[lo + j]; e2 += Dq[lo + Hq + j] * Dq[lo + Hq + j]; }
                for (var q = lo; q <= hi; q++) {
                  if (q > lo) { var a1 = Dq[q - 1], b1 = Dq[q + Hq - 1], c1 = Dq[q + 2 * Hq - 1]; e1 += b1 * b1 - a1 * a1; e2 += c1 * c1 - b1 * b1; }
                  var v1 = dot(Dq, tg, q, Hq), v2 = 0;
                  var sc1 = v1 / Math.sqrt(Math.max(1e-20, e1 * et1)), sc = sc1;
                  if (useNext) { v2 = dot(Dq, ng, q + Hq, Hq); sc += v2 / Math.sqrt(Math.max(1e-20, e2 * et2)); }
                  if (et1 < 1e-18 && (!useNext || et2 < 1e-18)) sc = -Math.abs(q * Q - nom);
                  if (sc > best + 1e-9) { best = sc; bq = q; }
                }
              }
              var fb = -Infinity, fp = Math.max(bLo, Math.min(bHi, bq * Q)), f1 = dot(m, tgt, tgt, H), f2 = useNext ? dot(m, nk, nk, H) : 0;
              for (var q2 = Math.max(bLo, bq * Q - Q + 1); q2 <= Math.min(bHi, n - N - 1, bq * Q + Q - 1); q2++) {
                var s3 = dot(m, q2, tgt, H) / Math.sqrt(Math.max(1e-20, dot(m, q2, q2, H) * f1));
                if (useNext) s3 += dot(m, q2 + H, nk, H) / Math.sqrt(Math.max(1e-20, dot(m, q2 + H, q2 + H, H) * f2));
                if (s3 > fb) { fb = s3; fp = q2; }
              }
              pos = fp;
            }
          }
        }
        /* overlap-add, the same place in every channel */
        for (c = 0; c < nch; c++) {
          var x = X[c], y = Y[c], j0 = Math.max(0, -pos), j1 = Math.min(N, n - pos);
          if (k === 0) { for (j = j0; j < j1; j++) y[op3 + j] += x[pos + j] * (j < H ? 1 : W[j]); }
          else for (j = j0; j < j1; j++) y[op3 + j] += x[pos + j] * W[j];
        }
        prev = pos;
      }
      return { out: Y.map(function (y) { return y.slice(0, outN); }), onsets: Z.filter(function (z) { return !z.end; }).map(function (z) { return z.o; }), outN: outN };
    }
    return { VERSION: VERSION, stretch: stretch, onsets: function (X, sr) { return onsets(Array.isArray(X) ? monoOf(X) : X, sr); } };
  }

  var E = make();
  /* ── the Worker, made from make()'s own text; it lets go after 20 s of rest ── */
  var WK = { w: null, url: "", n: 0, q: new Map(), idle: 0, broken: false };
  var stats = { worker: 0, here: 0 };
  function workerOn() {
    if (WK.w) return WK.w;
    if (WK.broken || typeof Worker === "undefined" || typeof Blob === "undefined" || typeof URL === "undefined" || !URL.createObjectURL) return null;
    try {
      if (!WK.url) WK.url = URL.createObjectURL(new Blob(["var E=(" + make.toString() + ")();\nonmessage=function(e){var d=e.data||{};try{var r=E.stretch(d.ch,d.sr,d.sp,d.opt);postMessage({id:d.id,out:r.out,onsets:r.onsets},r.out.map(function(a){return a.buffer;}));}catch(err){postMessage({id:d.id,out:null,err:String(err&&err.message||err)});}};"], { type: "text/javascript" }));
      WK.w = new Worker(WK.url);
    } catch (e) { WK.broken = true; return null; }
    WK.w.onmessage = function (e) { var d = e.data || {}, f = WK.q.get(d.id); if (f) { WK.q.delete(d.id); f(d); } rest(); };
    WK.w.onerror = function () { var l = Array.from(WK.q.values()); WK.q.clear(); try { WK.w.terminate(); } catch (e) {} WK.w = null; WK.broken = true; l.forEach(function (f) { f(null); }); };
    return WK.w;
  }
  function rest() { clearTimeout(WK.idle); WK.idle = setTimeout(function () { if (WK.w && !WK.q.size) { try { WK.w.terminate(); } catch (e) {} WK.w = null; } }, 20000); }
  /* run(channels, sr, speed, opt) → Promise of {out: [Float32Array …], onsets}; the channels are copied, never moved */
  function run(ch, sr, sp, opt) {
    var w = workerOn();
    if (!w) return Promise.reject(new Error("no worker"));
    clearTimeout(WK.idle);
    var id = ++WK.n, copy = ch.map(function (a) { return a.slice(); });
    return new Promise(function (ok, no) {
      WK.q.set(id, function (d) { if (!d || !d.out) return no(new Error(d && d.err || "stretch")); stats.worker++; ok({ out: d.out, onsets: d.onsets }); });
      w.postMessage({ id: id, ch: copy, sr: sr, sp: sp, opt: opt || null }, copy.map(function (a) { return a.buffer; }));
    });
  }
  function stop() { clearTimeout(WK.idle); if (WK.w) { try { WK.w.terminate(); } catch (e) {} WK.w = null; } var l = Array.from(WK.q.values()); WK.q.clear(); l.forEach(function (f) { f(null); }); }
  var api = { VERSION: E.VERSION, stretch: function (X, sr, sp, opt) { stats.here++; return E.stretch(X, sr, sp, opt); }, onsets: E.onsets, run: run, stop: stop, stats: stats, busy: function () { return WK.q.size; } };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AOGStretch = api;
})(typeof self !== "undefined" ? self : this);
