/* ══ AOG-DRUM-REAL-V1 (2026-10-04) — RECORDED DRUM KITS FOR THE DRUM MACHINE ═══════════════════════════════════
   Jimmy: "I would love an authentic Drum kit as well." Five kits, P to T, made from one real kit: Big Rusty Drums by
   Karoryfer Samples (CC0), a big early-1980s Szpaderski kit from Poland (24" kick, 14x8 snare, 14", 15", 18" and 22"
   toms, Sabian hats and cymbals), recorded with close and overhead microphones. Each kit is the same recordings mixed
   and processed another way (microphones, EQ, compression, a room, tuning, how long each sound rings), ahead of time,
   into audio/drums/<kit>/ (mono MP3, 96 kbps, as the piano's). Credits: audio/drums/CREDITS.txt.
   The five follow the drummers Jimmy named, and are called by their style, never by the player: P a polished studio
   session kit (dry, a snare for ghost notes), Q a huge room (the open kick, a ringing snare, the far microphones),
   R big-band swing (a small kick tuned up, a crisp snare, the hi-hat foot, a dark ride and a sizzle), S prog rock
   (three toms tuned a fourth apart on pads 5 to 7), T groove metal (a clicky kick for double-kick runs, a big snare).

   · A kit downloads only when it is picked (0.4 to 0.7 MB), with one calm line while it gets ready.
   · Every pad has three ways to be hit (soft, normal, accent), each its own recording, and a second take of the
     sounds a beat uses most, so a pad played twice in a row does not sound copied. On kits P, Q and T an accent on
     the ride plays its bell; on Q, R, S and T an accent on the snare is a rimshot.
   · The machine treats a recorded kit as a built-in kit, like A to I: it never uses the ten seconds of sample memory.
     Pads 1 and 2 leave raw and pads 3 to 8 pass the machine's filter, as a sample does. The era dial plays it as the
     twelve-bit 26,040 Hz machine heard it (1987) or as recorded (2026).
   · The page keeps all its own logic; it asks this file five things: is this a recorded kit (has), get it ready
     (load), send its hits to an engine (post), which recording does this hit play (route), and what to show (label,
     padNames, lineHtml, decorate, creditHtml). ════════════════════════════════════════════════════════════════════ */
(function (root) {
  "use strict";
  var BASE = "/audio/drums/", VER = "1";
  var HI = 44100, LO = 26040;
  /* A pad: the name it shows, the file it plays (name-s / name-m / name-h, numbered when there are two or more takes),
     and how many takes each layer has: [soft, normal, hard]. hat:1 = it shuts the open hat, as a foot does. */
  function P(name, n, extra) { var o = { name: name, n: n }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  /* the five kits, after the drummers Jimmy named; on screen they go by style, never by player */
  var KITS = {
    P: { dir: "studio", en: "Kit P · studio session, dry", es: "Kit P · sesión de estudio, seca",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("XSTICK", [1, 1, 1]), tom: P("FLOOR", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    Q: { dir: "bigroom", en: "Kit Q · big room rock", es: "Kit Q · rock en sala grande",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("HITOM", [1, 1, 1]), tom: P("FLOOR", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    R: { dir: "bigband", en: "Kit R · big-band swing", es: "Kit R · swing de big band",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("PEDAL", [1, 2, 1], { hat: 1 }), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("SIZZLE", [1, 1, 1]) } },
    S: { dir: "prog", en: "Kit S · prog rock, many toms", es: "Kit S · rock progresivo, muchos toms",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("HITOM", [1, 1, 1]), tom: P("MIDTOM", [1, 1, 1]), rim: P("FLOOR", [1, 1, 1]), bell: P("CRASH", [1, 1, 1]) } },
    T: { dir: "groovemetal", en: "Kit T · groove metal", es: "Kit T · groove metal",
      pads: { kick: P("KICK", [1, 4, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("CHINA", [1, 1, 1]), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } }
  };
  var IDS = ["P", "Q", "R", "S", "T"];
  var LAYERS = ["s", "m", "h"];

  /* Beats to start from, one per kit, in the same shape as the machine's own (1 = a hit, 2 = an accent, 3 = soft).
     The prog beat has a second part, a bar of 7 (14 steps): it goes in the next part, and the two play in turn. */
  var STARTERS = [
    { id: "halfshuffle", en: "Half-time shuffle", es: "Shuffle a medio tiempo", kit: "P", bpm: 86, swing: 0.67,
      map: { kick: [2,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0], snare: [0,3,0,0,0,3,0,0,2,3,0,0,0,3,0,0], ch: [2,0,1,0,2,0,1,0,2,0,1,0,2,0,1,0] } },
    { id: "bigroom", en: "Big heavy room groove", es: "Groove pesado de sala grande", kit: "Q", bpm: 72, swing: 0.54,
      map: { kick: [2,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0], oh: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0] } },
    { id: "bigband", en: "Big-band swing", es: "Swing de big band", kit: "R", bpm: 160, swing: 0.67,
      map: { rim: [1,0,0,0,2,0,1,0,1,0,0,0,2,0,1,0], clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], kick: [3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0], snare: [0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0] } },
    { id: "groovemetal", en: "Groove metal, double kick", es: "Groove metal con doble bombo", kit: "T", bpm: 120, swing: 0.50,
      map: { kick: [1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], rim: [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0] } },
    { id: "prog47", en: "Prog rock in two parts (4, then 7)", es: "Rock progresivo en dos partes (4 y luego 7)", kit: "S", bpm: 132, swing: 0.50,
      map: { kick: [2,0,0,0,0,0,1,0,2,0,1,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0] },
      parts: [{ len: 14, map: { kick: [2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0], ch: [1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0],
        clap: [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0], tom: [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0], rim: [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0], bell: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] } }] }
  ];
  /* a beat in parts: part 2 goes in the next part of the song, and the track plays them in turn. Put my beat back
     returns that part and the track as they were; a one-part beat picked afterwards stops the track again. */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function parts(p, api) {
    var S = api.S;
    if (!p || !p.parts) {
      if (S.__realParts) { if (S.undo) S.undo.realTrack = { list: S.track.slice(), on: S.trackOn }; S.trackOn = false; S.__realParts = false; }
      return;
    }
    var base = S.seg, next = base + 1 < api.SEGS ? base + 1 : base - 1, sg = S.segs[next];
    var keep = { seg: next, grid: clone(sg.grid), off: clone(sg.off || api.emptyOff()), len: sg.len || 16, bpm: sg.bpm, swing: sg.swing };
    var track = { list: S.track.slice(), on: !!S.trackOn };
    if (!S.undo && (api.hitsIn(sg.grid) > 0 || S.track.length))
      S.undo = { seg: base, grid: api.emptyGrid(), off: api.emptyOff(), len: 16, bpm: S.bpm, swing: S.swing, bank: S.bank };
    if (S.undo) { S.undo.realParts = [keep]; S.undo.realTrack = track; }
    var q = p.parts[0], g = api.emptyGrid();
    Object.keys(q.map).forEach(function (k) { if (g[k]) g[k] = q.map[k].slice(); });
    S.segs[next] = { grid: g, off: api.emptyOff(), len: q.len || 16, bpm: q.bpm || p.bpm || S.bpm, swing: api.snapSwing(q.swing != null ? q.swing : (p.swing != null ? p.swing : S.swing)) };
    S.track = [base, next]; S.trackOn = true; S.trkI = 0; S.__realParts = true;
  }
  function unparts(u, S) {
    if (!u) return;
    if (u.realParts) u.realParts.forEach(function (k) { S.segs[k.seg] = { grid: k.grid, off: k.off, len: k.len, bpm: k.bpm, swing: k.swing }; });
    if (u.realTrack) { S.track = u.realTrack.list; S.trackOn = u.realTrack.on; }
    S.__realParts = false;
  }

  var WORDS = {
    group:   { en: "Recorded drums", es: "Batería grabada" },
    loading: { en: "Getting the recorded drums ready…", es: "Preparando la batería grabada…" },
    failed:  { en: "The recorded drums did not load. Check the internet, then pick the kit again.",
               es: "La batería grabada no se cargó. Revisa el internet y vuelve a elegir el kit." },
    credit:  { en: "Kits P to T are a real drum kit: Big Rusty Drums by Karoryfer Samples (CC0).",
               es: "Los kits P a T son una batería de verdad: Big Rusty Drums de Karoryfer Samples (CC0)." },
    credits: { en: "Full credits", es: "Créditos completos" }
  };
  function w(k, lang) { var o = WORDS[k]; return o ? (lang === "es" ? o.es : o.en) : k; }

  function has(b) { return Object.prototype.hasOwnProperty.call(KITS, b); }
  function label(b) { var k = KITS[b]; return k ? [k.en, k.es] : ["", ""]; }
  function padNames(b) { var k = KITS[b], o = {}; if (!k) return o; for (var id in k.pads) o[id] = k.pads[id].name; return o; }
  function files(b, id) {
    var k = KITS[b], p = k && k.pads[id], out = {};
    if (!p) return out;
    var base = p.name.toLowerCase();
    LAYERS.forEach(function (lay, i) {
      var n = p.n[i], list = [];
      for (var j = 1; j <= n; j++) list.push(base + "-" + lay + (n > 1 ? j : ""));
      out[lay] = list;
    });
    return out;
  }

  /* ── getting a kit ready ─────────────────────────────────────────────────── */
  var STATE = {};     /* bank → {state: "loading" | "ready" | "failed", got, total} */
  var DATA = {};      /* bank → pad → layer → [{lo: 26,040 Hz twelve-bit, hi: 44,100 Hz}] */
  var JOBS = {};
  var ORDER = [];     /* banks asked for, the latest last: two stay ready, so a phone keeps its memory */
  var KEEP = 2;
  var STORES = null;  /* the page's kit stores, ROMK and HIK, and its twelve-bit rounding */

  function decodeWith(dec, ab) {
    return new Promise(function (ok, no) { var r = dec.decodeAudioData(ab, ok, no); if (r && r.then) r.then(ok, no); });
  }
  function onsetAt(d, sr) {           /* the hit, 2 ms early: whatever silence the decoder added in front is dropped */
    var pk = 0, i;
    for (i = 0; i < d.length; i++) { var a = d[i] < 0 ? -d[i] : d[i]; if (a > pk) pk = a; }
    var thr = pk * 0.01; i = 0;
    while (i < d.length && Math.abs(d[i]) < thr) i++;
    return Math.max(0, i - Math.round(0.002 * sr)) / sr;
  }
  function slice(d, sr, t, len) {
    var a = Math.round(t * sr), n = Math.max(64, Math.round(len * sr)), o = new Float32Array(n);
    o.set(d.subarray(a, Math.min(d.length, a + n)));
    return o;
  }
  function setState(b, s) { STATE[b] = s; paintLines(); }
  function forget(b) {
    delete DATA[b]; delete JOBS[b]; delete STATE[b];
    if (STORES) { delete STORES.rom[b]; delete STORES.hi[b]; }
  }
  function load(b, rom, hi, q12) {
    if (!has(b)) return Promise.resolve();
    STORES = { rom: rom, hi: hi, q12: q12 };
    var at = ORDER.indexOf(b); if (at >= 0) ORDER.splice(at, 1); ORDER.push(b);
    if (JOBS[b]) return JOBS[b];
    var kit = KITS[b], jobs = [];
    Object.keys(kit.pads).forEach(function (id) {
      var f = files(b, id);
      LAYERS.forEach(function (lay) { f[lay].forEach(function (name, j) { jobs.push({ id: id, lay: lay, j: j, name: name }); }); });
    });
    var OC = root.OfflineAudioContext || root.webkitOfflineAudioContext;
    if (!OC || !root.fetch) { setState(b, { state: "failed", got: 0, total: jobs.length }); return Promise.resolve(); }
    var decHi = new OC(1, 1, HI), decLo = new OC(1, 1, LO);
    var got = {}, n = 0, bad = 0, idx = 0;
    setState(b, { state: "loading", got: 0, total: jobs.length });
    function worker() {
      if (idx >= jobs.length) return Promise.resolve();
      var jb = jobs[idx++];
      return fetch(BASE + kit.dir + "/" + jb.name + ".mp3?v=" + VER)
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then(function (ab) { return Promise.all([decodeWith(decHi, ab.slice(0)), decodeWith(decLo, ab)]); })
        .then(function (two) { got[jb.id + "/" + jb.lay + "/" + jb.j] = { h: two[0].getChannelData(0), l: two[1].getChannelData(0) }; })
        .catch(function () { bad++; })
        .then(function () { n++; if (STATE[b]) STATE[b].got = n; return worker(); });
    }
    var job = Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]).then(function () {
      if (bad) { forget(b); setState(b, { state: "failed", got: n - bad, total: jobs.length }); return; }
      var data = {}, r = rom[b] || (rom[b] = {}), h = hi[b] || (hi[b] = {});
      Object.keys(kit.pads).forEach(function (id) {
        var f = files(b, id), first = got[id + "/m/0"];
        var len = first.h.length / HI - onsetAt(first.h, HI);          /* every take of a pad is as long as its first normal one */
        data[id] = {};
        LAYERS.forEach(function (lay) {
          data[id][lay] = f[lay].map(function (name, j) {
            var g = got[id + "/" + lay + "/" + j], t = onsetAt(g.h, HI);
            return { hi: slice(g.h, HI, t, len), lo: q12(slice(g.l, LO, t, len)) };
          });
        });
        r[id] = data[id].m[0].lo; h[id] = data[id].m[0].hi;
      });
      DATA[b] = data;
      setState(b, { state: "ready", got: n, total: jobs.length });
      var keep = ORDER.slice(-KEEP);                 /* the two kits asked for last stay; an older one is let go */
      Object.keys(DATA).forEach(function (k) { if (k !== b && keep.indexOf(k) < 0) forget(k); });
    });
    JOBS[b] = job;
    return job;
  }

  /* ── playing it ──────────────────────────────────────────────────────────── */
  function vid(b, id, lay, j) { return b + ":" + id + ":" + lay + j; }
  /* every take of this pad goes to the engine under its own name; any other recorded kit's takes of the pad are cleared */
  function post(port, b, id, cut) {
    if (!port || !has(b) || !DATA[b] || !DATA[b][id] || !cut) return;
    var sent = port.__aogReal || (port.__aogReal = {});
    Object.keys(sent).forEach(function (v) {
      var p = v.split(":"); if (p[1] === id && p[0] !== b) { port.postMessage({ type: "clear", id: v }); delete sent[v]; }
    });
    LAYERS.forEach(function (lay) {
      DATA[b][id][lay].forEach(function (tk, j) {
        var lo = cut(tk.lo), hi = cut(tk.hi), v = vid(b, id, lay, j);
        port.postMessage({ type: "kit", id: v, rate: LO, samples: lo.buffer, hi: hi.buffer, hiRate: HI }, [lo.buffer, hi.buffer]);
        sent[v] = 1;
      });
    });
  }
  var RR = {};
  function layerOf(accent) { return (accent === 2 || accent === true) ? "h" : accent === 3 ? "s" : "m"; }
  function pick(b, id, accent) {
    var lay = layerOf(accent), p = KITS[b].pads[id], n = p ? p.n[LAYERS.indexOf(lay)] : 0;
    if (!n) { lay = "m"; n = p ? p.n[1] : 1; }
    var key = b + id + lay, j = (RR[key] || 0) % n; RR[key] = j + 1;
    return { lay: lay, j: j };
  }
  /* which recording this hit plays: the layer by how hard it is struck, the take in turn */
  function route(m, b, id, accent) {
    if (!has(b)) return m;
    var p = KITS[b].pads[id], k = pick(b, id, accent);
    m.id = vid(b, id, k.lay, k.j);
    if (p && p.hat) m.choke = 1;
    return m;
  }
  /* without the sampler engine (a very old browser, or the first tap before it starts): play the recording directly */
  function playDirect(ac, dest, b, id, t0, accent, level) {
    var d = DATA[b] && DATA[b][id]; if (!d || !ac || !dest) return;
    var k = pick(b, id, accent), tk = d[k.lay] && d[k.lay][k.j]; if (!tk) return;
    try {
      var buf = ac.createBuffer(1, tk.hi.length, HI); buf.getChannelData(0).set(tk.hi);
      var s = ac.createBufferSource(), g = ac.createGain();
      s.buffer = buf; g.gain.value = Math.max(0, Math.min(1, level == null ? 0.46 : level));
      s.connect(g); g.connect(dest); s.start(Math.max(t0 || 0, ac.currentTime));
    } catch (e) {}
  }

  /* ── what the page shows ─────────────────────────────────────────────────── */
  var LANG = "en", BANK = "";
  function lineText(b, lang) {
    var s = STATE[b];
    if (!has(b) || !s) return "";
    if (s.state === "loading") return w("loading", lang);
    if (s.state === "failed") return w("failed", lang);
    return "";
  }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function lineHtml(b, lang) {
    if (!has(b)) return "";
    LANG = lang || "en"; BANK = b;
    var t = lineText(b, LANG);
    return '<span class="realkit-line" role="status" data-realkit-line="' + b + '"' + (t ? "" : " hidden") + ">" + esc(t) + "</span>";
  }
  function paintLines() {
    var d = root.document; if (!d) return;
    Array.prototype.forEach.call(d.querySelectorAll("[data-realkit-line]"), function (el) {
      var t = lineText(el.getAttribute("data-realkit-line"), LANG);
      if (el.textContent !== t) el.textContent = t;
      el.hidden = !t;
    });
  }
  /* the recorded kits sit together under their own heading in the Sounds menu */
  function decorate(doc, lang) {
    LANG = lang || LANG;
    var g = w("group", LANG);
    Array.prototype.forEach.call((doc || root.document).querySelectorAll("[data-bank],[data-simple-bank]"), function (el) {
      var b = el.getAttribute("data-bank") || el.getAttribute("data-simple-bank");
      if (has(b)) el.setAttribute("data-aog-group", g);
    });
    paintLines();
  }
  function creditHtml(lang) {
    return "<p>" + esc(w("credit", lang)) + ' <a href="/audio/drums/CREDITS.txt">' + esc(w("credits", lang)) + "</a></p>";
  }
  /* the line's look: one quiet line under the row, in the machine's warm ink, readable on its dark case */
  function style() {
    var d = root.document; if (!d || d.getElementById("aogRealKitCss")) return;
    var s = d.createElement("style"); s.id = "aogRealKitCss";
    s.textContent = ".realkit-line{flex:1 1 100%;color:#ffd9a8;font-size:.9rem;line-height:1.35;margin:.2rem 0 0;letter-spacing:0;text-transform:none;font-weight:600}" +
      ".realkit-line[hidden]{display:none}";
    (d.head || d.documentElement).appendChild(s);
  }
  try { style(); } catch (e) {}

  root.AOGDrumKit = {
    ids: IDS.slice(), starters: STARTERS, parts: parts, unparts: unparts, has: has, label: label, padNames: padNames, files: files,
    load: load, post: post, route: route, playDirect: playDirect, state: function (b) { return STATE[b] || null; },
    ready: function (b) { return !!DATA[b]; }, lineHtml: lineHtml, decorate: decorate, creditHtml: creditHtml, words: WORDS
  };
})(window);
