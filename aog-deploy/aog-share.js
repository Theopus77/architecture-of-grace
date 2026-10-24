/* AOG-SHARE-V1 (2026-10-22) — ✉ Send to a friend, in the Recording Studio. Jimmy wants the Studio to be a showstopper for his
   13-year-old: the buzz comes when friends hear the song and can join in ("make a beat and then send it to my buddy to rap
   over it"). Listen back (aog-listenback.js) fetches this file the first time ✉ Send to a friend is pressed; a Studio opened
   from a beat link (/the-studio?beat=…) fetches it to open the beat. Nothing of it loads before.

   Two plain choices:
   1. Send the song: a small sound file that plays in any messaging app. My Track as Listen back plays it (the desk's bounce),
      levelled as the desk's Send it out levels its file (loudOfW → outLevel: −14 LUFS, true peak under −1 dB), then made
      small in the browser with WebCodecs: AAC in an .m4a where the browser can make AAC (Safari 26 on iPhone and iPad, Chrome
      and Edge on a Mac, Windows, Android), else Opus in an .m4a (Chrome on Linux, Firefox). A browser with neither (an iPhone
      before iOS 26) gets the levelled .wav, as Share it makes. The message is Listen back's own.
      AOG-EXPORT-PRO-V1 (2026-10-23): aog-export.js (fetched then) makes the file: the same codecs, now with the lossy ceiling
      (−1.5 dBTP before, and under −1 dBTP once decoded) and the tags (title, artist, album, year, tempo, key); the .wav is tagged too.
   2. Send the beat: a link, https://architectureofgrace.com/the-studio?beat=<code>. The code is the song's recipe: the Drum
      Machine's banks A to C (kits; the chords' and the bass's instrument, key, scale, range, pattern), their hits and pad
      settings, bars, tempo, swing, the song's key and the title. No recordings, nothing personal (not the artist's name).
      JSON, squeezed with CompressionStream("deflate-raw") ("z…"), or as it is ("j…") where that is missing; base64url.
   A beat link opening: the code is read and CLEANED first (a link is never trusted: whitelisted names, clamped numbers,
   capped sizes, anything unknown dropped; the Drum Machine checks every name again against what it has), the song takes the
   tempo and key (AOGSong), the Drum Machine (in sight) takes the beat and puts its loop on My Track (AOGPadsSetup.load), so
   the Vocal Booth has it to rap over (AOG-VOCAL-V1), and one warm line says what to do. Nothing plays until a key is pressed. A broken link
   gets one kind line, and the Studio opens as usual.
   The Studio is told: window "aog-studio-did" {what:"shared"} when a send is handed off, {what:"remixopened"} when a beat
   link has opened. Test: music-handoff/tests/studio/share.js. */
(function () {
  "use strict";
  if (window.AOGShare) return;
  var D = document, ORIGIN = "https://architectureofgrace.com";
  var W = {
    h: ["Send to a friend", "Enviar a un amigo"],
    song: ["Send the song", "Enviar la canción"],
    songSay: ["A small sound file. It plays in any messaging app.", "Un archivo de sonido pequeño. Se oye en cualquier app de mensajes."],
    beat: ["Send the beat", "Enviar el ritmo"],
    beatSay: ["A link to your Drum Machine beat. Your friend hears it and adds a part.", "Un enlace a tu ritmo de la caja de ritmos. Tu amigo lo oye y añade su parte."],
    close: ["Close", "Cerrar"],
    making: ["Making a small file…", "Haciendo un archivo pequeño…"],
    sent: ["Sent. Nice work!", "Enviada. ¡Buen trabajo!"], sentBeat: ["Sent. Nice work!", "Enviado. ¡Buen trabajo!"],
    again: ["Your file is ready. Press Send the song again.", "Tu archivo está listo. Pulsa Enviar la canción otra vez."],
    saved: ["Saved as {n}. Send it to a friend from your downloads.", "Guardada como {n}. Envíala a un amigo desde tus descargas."],
    silent: ["There is no sound to send yet. Turn a track up at the Mixing Desk.", "Todavía no hay sonido para enviar. Sube una pista en la mesa de mezclas."],
    noBeat: ["There is no beat yet. Make one on the Drum Machine first.", "Todavía no hay ritmo. Haz uno en la caja de ritmos primero."],
    tooBig: ["This beat is too long for a link. Try fewer bars.", "Este ritmo es demasiado largo para un enlace. Prueba con menos compases."],
    copied: ["Link copied. Paste it in a message to a friend.", "Enlace copiado. Pégalo en un mensaje a un amigo."],
    showLink: ["Copy this link and send it to a friend.", "Copia este enlace y mándaselo a un amigo."],
    linkL: ["Your beat's link", "El enlace de tu ritmo"], copy: ["Copy", "Copiar"],
    fail: ["That did not work. Try again.", "No funcionó. Inténtalo otra vez."],
    msg: ["{t} by {a} — made in the Recording Studio at architectureofgrace.com", "{t}, de {a} — hecha en el estudio de grabación de architectureofgrace.com"],
    msgNo: ["{t} — made in the Recording Studio at architectureofgrace.com", "{t} — hecha en el estudio de grabación de architectureofgrace.com"],
    beatMsg: ["{t}: a beat I made in the Recording Studio at architectureofgrace.com. Open it, press Play, and add your part.",
      "{t}: un ritmo que hice en el estudio de grabación de architectureofgrace.com. Ábrelo, pulsa Tocar y añade tu parte."],
    myBeat: ["My beat", "Mi ritmo"],
    /* a beat link opening */
    getting: ["Getting your friend's beat ready…", "Preparando el ritmo de tu amigo…"],
    welcome: ["A friend sent you a beat. Press Play to hear it, or open the Vocal Booth to rap over it.",
      "Un amigo te mandó un ritmo. Pulsa ▶ Tocar para oírlo, o abre la cabina de voz para rapear encima."],
    bad: ["That beat link did not open. Ask your friend to send it again.", "Ese enlace de ritmo no se abrió. Pídele a tu amigo que lo mande otra vez."],
    badLoad: ["Your friend's beat did not load. Open the link again.", "El ritmo de tu amigo no cargó. Abre el enlace otra vez."]
  };
  var A = null, el = {}, S = { open: false, line: "", fill: {}, file: null, fileOf: null, filePr: null, busy: false, want: false, link: "", linkErr: "", showLink: false, kind: "", arrived: null, at: "" };
  function es() { return A && A.es ? A.es() : (D.documentElement.getAttribute("lang") || "en").indexOf("es") === 0; }
  function w(k, f) { var x = W[k][es() ? 1 : 0]; for (var n in (f || {})) x = x.split("{" + n + "}").join(f[n]); return x; }
  function txt(e, t) { if (e.textContent !== t) e.textContent = t; }
  function did(what) { try { window.dispatchEvent(new CustomEvent("aog-studio-did", { detail: { what: what } })); } catch (e) {} }
  function slug(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40); }
  function clampI(v, a, b, d) { v = Math.round(+v); return isFinite(v) ? Math.max(a, Math.min(b, v)) : d; }

  /* ══ the beat's code: JSON → deflate-raw → base64url ══ */
  function b64u(bytes) { var s = "", i, CH = 0x8000; for (i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH)); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function unb64u(s) { var b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), o = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) o[i] = b.charCodeAt(i); return o; }
  async function through(bytes, stream, cap) {
    var rd = new Blob([bytes]).stream().pipeThrough(stream).getReader(), parts = [], n = 0;
    for (;;) { var r = await rd.read(); if (r.done) break; n += r.value.length; if (cap && n > cap) { try { rd.cancel(); } catch (e) {} throw new Error("too big"); } parts.push(r.value); }
    var o = new Uint8Array(n), at = 0; parts.forEach(function (p) { o.set(p, at); at += p.length; }); return o;
  }
  async function encode(obj) {
    var raw = new TextEncoder().encode(JSON.stringify(obj));
    if (window.CompressionStream) { try { return "z" + b64u(await through(raw, new CompressionStream("deflate-raw"))); } catch (e) {} }
    return "j" + b64u(raw);
  }
  var MAXCODE = 16000, MAXJSON = 262144;
  async function decode(code) {
    code = String(code || "").trim();
    if (code.length < 8 || code.length > MAXCODE || !/^[zj][A-Za-z0-9_-]+$/.test(code)) throw new Error("bad code");
    var bytes = unb64u(code.slice(1));
    if (code[0] === "z") { if (!window.DecompressionStream) throw new Error("no inflate"); bytes = await through(bytes, new DecompressionStream("deflate-raw"), MAXJSON); }
    if (bytes.length > MAXJSON) throw new Error("too big");
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  }

  /* ══ the recipe: made from the Drum Machine, and cleaned before anything uses it ══ */
  var BARS = [1, 2, 3, 4, 8, 12, 16], SWING = [50, 54, 58, 62, 66], MAXEV = 4000, NP = 24;
  var ID = /^[A-Za-z0-9_-]{1,40}$/, INSTID = /^[a-z]:[a-z0-9_-]{1,32}$/;
  function padsFrame() {
    var f = D.querySelector('iframe.sh-room[data-file="/music-pads.html"]');
    try { return f && f.contentWindow && f.contentWindow.AOGPadsSetup && f.contentWindow.AOGPadsSetup.recipe ? f.contentWindow.AOGPadsSetup : null; } catch (e) { return null; }
  }
  /* the Drum Machine not open: what it keeps on this device (the same shape its recipe() gives) */
  function fromStore() {
    var s = null; try { s = JSON.parse(localStorage.getItem("aog.pads.v1") || "null"); } catch (e) {}
    if (!s || !Array.isArray(s.banks) || s.banks.length < 3) return null;
    var A0 = s.banks[0] || {}, B = s.banks[1] || {}, C = s.banks[2] || {}, L = (s.bars || 2) * 384, pads = {};
    Object.keys(s.pads || {}).forEach(function (k) { var o = s.pads[k] || {}; if (/^[012]:\d+$/.test(k)) pads[k] = { vol: o.vol == null ? 100 : o.vol, tune: o.tune || 0, pan: o.pan || 0 }; });
    return { bpm: s.bpm, swing: s.swing, bars: s.bars, kits: [A0.kitA, A0.kitB, A0.kitC],
      chords: { inst: B.inst, key: B.key, scale: B.scale, oct: B.oct, pat: B.pat || "" }, bass: { inst: C.inst, key: C.key, scale: C.scale, oct: C.oct },
      beat: "", ev: (s.ev || []).filter(function (e) { return e && e.b >= 0 && e.b < 3 && e.t < L; }), pads: pads };
  }
  function songKey(r) {
    var g = null; try { g = window.AOGSong && AOGSong.get(); } catch (e) {}
    if (g && g.hasKey) return { key: g.key, minor: !!g.minor };
    var sc = String(r.chords && r.chords.scale || ""); return { key: (r.chords && r.chords.key) | 0, minor: /^(minor|natmin)$/.test(sc) };
  }
  /* the compact form that travels in the link */
  function pack(r, title) {
    var k = songKey(r), e = [], pd = [];
    r.ev.slice(0, MAXEV).forEach(function (x) { e.push(x.b | 0, x.p | 0, x.t | 0, Math.round((+x.v || 0.8) * 100), x.len | 0); });
    Object.keys(r.pads || {}).forEach(function (key) { var m = /^([012]):(\d+)$/.exec(key), o = r.pads[key]; if (!m || !o) return;
      if ((o.vol == null || o.vol === 100) && !o.tune && !o.pan) return; pd.push([+m[1], +m[2], o.vol == null ? 100 : o.vol, o.tune || 0, o.pan || 0]); });
    var o = { v: 1, n: String(title || "").slice(0, 60), bpm: r.bpm, sw: r.swing, bars: r.bars, key: k.key, mi: k.minor ? 1 : 0, k: r.kits,
      c: [r.chords.inst, r.chords.key, r.chords.scale, r.chords.oct, r.chords.pat || ""], a: [r.bass.inst, r.bass.key, r.bass.scale, r.bass.oct], e: e };
    if (r.beat) o.bt = r.beat;
    if (pd.length) o.pd = pd;
    return o;
  }
  /* never trust a link: only what is known, in range, and not too much */
  function clean(o) {
    if (!o || typeof o !== "object" || Array.isArray(o) || o.v !== 1) return null;
    var bars = BARS.indexOf(o.bars) >= 0 ? o.bars : 4, L = bars * 384;
    var sw = +o.sw, swing = isFinite(sw) && sw >= 50 && sw <= 75 ? SWING.reduce(function (a, b) { return Math.abs(b - sw) < Math.abs(a - sw) ? b : a; }, 50) : 50;
    var name = typeof o.n === "string" ? o.n.replace(/[\u0000-\u001f\u007f-\u009f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 60) : "";
    var kits = [0, 1, 2].map(function (i) { var v = Array.isArray(o.k) ? o.k[i] : ""; return typeof v === "string" && /^[A-Za-z0-9_-]{1,12}$/.test(v) ? v : ""; });
    function bank(a, pat) {
      if (!Array.isArray(a)) return null;
      var b = { inst: typeof a[0] === "string" && INSTID.test(a[0]) ? a[0] : "", key: clampI(a[1], 0, 11, 0), scale: typeof a[2] === "string" && ID.test(a[2]) ? a[2] : "", oct: clampI(a[3], 1, 5, 3) };
      if (pat) b.pat = typeof a[4] === "string" && /^[A-Za-z0-9_-]{0,40}$/.test(a[4]) ? a[4] : "";
      return b;
    }
    var ev = [], e = Array.isArray(o.e) ? o.e : [];
    for (var i = 0; i + 4 < e.length && i < MAXEV * 5; i += 5) {
      var b = e[i], p = e[i + 1], t = e[i + 2], v = e[i + 3], len = e[i + 4];
      if (![b, p, t, v, len].every(function (x) { return typeof x === "number" && isFinite(x) && Math.floor(x) === x; })) continue;
      if (b < 0 || b > 2 || p < 0 || p >= NP || t < 0 || t >= L || v < 1 || v > 100 || len < 0) continue;
      ev.push({ b: b, p: p, t: t, v: v / 100, len: Math.min(len, L) });
    }
    if (!ev.length) return null;
    var pads = {};
    (Array.isArray(o.pd) ? o.pd : []).slice(0, 3 * NP).forEach(function (x) {
      if (!Array.isArray(x) || x.length < 5 || !x.every(function (n) { return typeof n === "number" && isFinite(n); })) return;
      if (x[0] < 0 || x[0] > 2 || x[1] < 0 || x[1] >= NP || x[0] % 1 || x[1] % 1) return;
      pads[x[0] + ":" + x[1]] = { vol: clampI(x[2] / 5, 0, 30, 20) * 5, tune: clampI(x[3], -12, 12, 0), pan: clampI(x[4] / 10, -10, 10, 0) * 10 };
    });
    return { name: name, bpm: clampI(o.bpm, 60, 180, 90), swing: swing, bars: bars, key: clampI(o.key, 0, 11, 0), minor: o.mi === 1 || o.mi === true,
      kits: kits, chords: bank(o.c, true), bass: bank(o.a, false), beat: typeof o.bt === "string" && ID.test(o.bt) ? o.bt : "", ev: ev, pads: pads };
  }
  async function makeLink() {
    var P = padsFrame(), r = null;
    try { r = P ? P.recipe() : fromStore(); } catch (e) { r = fromStore(); }
    if (!r || !r.ev || !r.ev.length) return { err: "noBeat" };
    var name = (A && A.named && A.named()) || "";
    var code = await encode(pack(r, name));
    if (code.length > MAXCODE) return { err: "tooBig" };
    return { url: ORIGIN + "/the-studio?beat=" + code, code: code, title: name };
  }

  /* ══ the song, made small: AOG-EXPORT-PRO-V1 (aog-export.js, fetched the first time) makes it: AAC 128 kb/s, else Opus 96 kb/s,
     in an .m4a, its true peak under −1 dBTP once decoded, with the song's name, the artist, the tempo and the key inside ══ */
  var XP = null;
  function exportJs() {
    if (window.AOGExport) return Promise.resolve(window.AOGExport);
    if (!XP) XP = new Promise(function (ok) { var s = D.createElement("script"); s.src = "/aog-export.js"; s.onload = function () { ok(window.AOGExport || null); }; s.onerror = function () { XP = null; ok(null); }; D.head.appendChild(s); });
    return XP;
  }
  function title() { return A && A.title ? A.title() : w("myBeat"); }
  async function makeSong() {
    var bk = A.bk, dw = A.desk && A.desk(), st = dw && dw.__aogStudio;
    if (!bk || !bk.L || !st || !st.loudOfW || !st.outLevel) throw new Error("no desk");
    var Lc = bk.L, Rc = bk.R || bk.L, ld = await st.loudOfW(Lc, Rc, bk.sr);
    if (!(ld && ld.tp > 0.001)) return null;   /* nothing above −60 dB: as the desk's Send it out, no file */
    var lv = st.outLevel(ld), g = lv.g, base = slug(title()) || "song", small = null, X = await exportJs();
    var tg = { title: title(), artist: A.artist ? A.artist() : "", es: es() };
    if (X) { try { small = await X.small(Lc, Rc, bk.sr, g, { title: tg.title, artist: tg.artist, es: tg.es, tpDb: lv.tpDb }); } catch (e) { small = null; } }
    if (small) { S.kind = small.kind; return new File([small.blob], base + ".m4a", { type: "audio/mp4" }); }
    S.kind = "wav";   /* a browser that makes neither AAC nor Opus: the levelled .wav, tagged */
    var ab = await st.wavBufW(Lc, Rc, bk.sr, g, st.bits ? st.bits() : 16), f = new File([ab], base + ".wav", { type: "audio/wav" });
    if (X) { try { f = await X.wav(f, f.name, tg); } catch (e) {} }
    return f;
  }
  function songReady() {
    if (S.file && S.fileOf === A.bk) return Promise.resolve(S.file);
    if (!S.filePr) {
      var bk = A.bk;
      S.filePr = makeSong().then(function (f) { S.filePr = null; if (A.bk === bk) { S.file = f; S.fileOf = bk; } return f; }, function (e) { S.filePr = null; throw e; });
    }
    return S.filePr;
  }

  /* ══ handing over ══ */
  function canFiles(f) { try { return !!(navigator.share && (!navigator.canShare || navigator.canShare({ files: [f] }))); } catch (e) { return false; } }
  function download(f) {
    var u = URL.createObjectURL(f), a = D.createElement("a"); a.href = u; a.download = f.name; a.rel = "noopener"; a.style.display = "none";
    (el.dlg || D.body).appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
    say("saved", { n: f.name }); did("shared");
  }
  async function sendSong(fresh) {
    var f = S.file; if (!f) return;
    var a = A.artist ? A.artist() : "", msg = a ? w("msg", { t: title(), a: a }) : w("msgNo", { t: title() });
    if (!canFiles(f) && f.type === "audio/mp4") { var f2 = new File([f], f.name, { type: "audio/x-m4a" }); if (canFiles(f2)) f = f2; }
    if (!canFiles(f)) { download(f); return; }
    try { await navigator.share({ files: [f], title: title(), text: msg }); say("sent"); did("shared"); }
    catch (e) {
      if (e && e.name === "AbortError") say("");
      else if (e && e.name === "NotAllowedError" && fresh) say("again");   /* making the file took the tap's moment: one more tap sends it */
      else download(f);
    }
  }
  function songTap() {
    if (S.busy) { S.want = true; return; }
    if (S.file && S.fileOf === A.bk) { sendSong(false); return; }
    S.busy = true; S.want = true; say("making");
    songReady().then(function (f) {
      S.busy = false;
      if (!f) { S.want = false; say("silent"); return; }
      say(""); if (S.want) { S.want = false; sendSong(true); }
    }, function () { S.busy = false; S.want = false; say("fail"); });
  }
  async function beatTap() {
    S.showLink = false;
    var L = S.linkPr ? await S.linkPr : null;
    if (!L || L.err) L = await makeLink().catch(function () { return { err: "fail" }; });
    if (L.err) { say(L.err); return; }
    S.link = L.url;
    var t = L.title || w("myBeat"), text = w("beatMsg", { t: t });
    if (navigator.share) {
      try { await navigator.share({ title: t, text: text, url: L.url }); say("sentBeat"); did("shared"); return; }
      catch (e) { if (e && e.name === "AbortError") { say(""); return; } }
    }
    try { await navigator.clipboard.writeText(text + " " + L.url); say("copied"); did("shared"); return; } catch (e) {}
    S.showLink = true; say("showLink");   /* no share sheet and no clipboard: the link in a box to copy by hand */
  }

  /* ══ the sheet: a small paper card over Listen back ══ */
  var CSS = [
    "dialog.shr{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;background:transparent;color:#1f1a12;overflow:auto;overscroll-behavior:contain}",
    "dialog.shr:not([open]){display:none}",
    "dialog.shr::backdrop{background:rgba(8,6,4,.72)}",
    ".shr-wrap{box-sizing:border-box;min-height:100%;display:flex;align-items:center;justify-content:center;",
    "padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left))}",
    ".shr-card{box-sizing:border-box;width:min(100%,30rem);padding:1rem;border-radius:10px;background:#f4ecdb;color:#1f1a12;box-shadow:0 18px 44px rgba(0,0,0,.6),0 0 0 1px #050403;display:flex;flex-direction:column;gap:10px}",
    "#shrH{margin:0;font:600 1.35rem/1.2 Fraunces,Georgia,serif!important;letter-spacing:0!important;color:#1f1a12!important}",
    ".shr-pick{flex:1 1 auto;min-width:0;min-height:76px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:.2rem;padding:.6rem .85rem;",
    "border-radius:10px;border:1.5px solid #2a251f;background:#2a251f;color:#f4ead6;text-align:left;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;box-shadow:0 2px 0 #050403}",
    ".shr-pick b{font:800 1.15rem/1.15 Inter,system-ui,sans-serif;color:#f3d48e}",
    ".shr-pick span{font:500 .95rem/1.3 Inter,system-ui,sans-serif;color:#f4ead6;overflow-wrap:anywhere}",
    ".shr-pick:disabled{cursor:default}",
    ".shr-pick:active{transform:translateY(1px);box-shadow:0 1px 0 #050403}",
    "#shrLine{margin:0;font:700 1rem/1.35 Inter,system-ui,sans-serif;color:#1f1a12}",
    "#shrLine:empty{display:none}",
    ".shr-link{display:flex;flex-direction:column;gap:4px;font:700 .95rem/1.2 Inter,system-ui,sans-serif;color:#1f1a12}",
    ".shr-link[hidden]{display:none}",
    ".shr-row{display:flex;gap:8px}",
    "#shrLink{flex:1 1 auto;min-width:0;min-height:48px;box-sizing:border-box;padding:0 .7rem;border-radius:9px;border:1.5px solid #8a6a2c;background:#fffdf8;color:#0a1e33;font:500 16px/1.2 Inter,system-ui,sans-serif}",
    ".shr-b{flex:0 0 auto;min-height:48px;min-width:44px;padding:0 1rem;border-radius:9px;border:1px solid #8e7d5c;background:#fffaf0;color:#1f1a12;font:800 1rem/1 Inter,system-ui,sans-serif;cursor:pointer;touch-action:manipulation}",
    "#shrClose{width:100%}",
    "dialog.shr button:focus-visible,#shrLink:focus-visible{outline:3px solid #b9822a;outline-offset:2px}",
    "@media (orientation:landscape) and (max-height:519px){.shr-card{width:min(100%,40rem);gap:6px;padding:.75rem}.shr-picks{display:flex;gap:8px}.shr-pick{min-height:64px}#shrH{font-size:1.15rem!important}}",
    ".shr-picks{display:flex;flex-direction:column;gap:8px}",
    "@media (orientation:landscape) and (max-height:519px){.shr-picks{flex-direction:row}}",
    "@media print{dialog.shr{display:none}}"
  ].join("\n");
  function build() {
    if (el.dlg) return;
    var st = D.createElement("style"); st.id = "aogShareCss"; st.textContent = CSS; D.head.appendChild(st);
    var d = D.createElement("dialog"); d.className = "shr"; d.id = "shrDlg"; d.setAttribute("aria-labelledby", "shrH");
    d.innerHTML = '<div class="shr-wrap"><div class="shr-card"><h2 id="shrH"></h2><div class="shr-picks">' +
      '<button type="button" class="shr-pick" id="shrSong"><b id="shrSongB"></b><span id="shrSongS"></span></button>' +
      '<button type="button" class="shr-pick" id="shrBeat"><b id="shrBeatB"></b><span id="shrBeatS"></span></button></div>' +
      '<p id="shrLine" role="status" aria-live="polite"></p>' +
      '<label class="shr-link" id="shrLinkBox" hidden><span id="shrLinkL"></span><span class="shr-row"><input id="shrLink" type="text" readonly spellcheck="false"><button type="button" class="shr-b" id="shrCopy"></button></span></label>' +
      '<button type="button" class="shr-b" id="shrClose"></button></div></div>';
    (D.body).appendChild(d);
    ["H", "Song", "SongB", "SongS", "Beat", "BeatB", "BeatS", "Line", "LinkBox", "LinkL", "Link", "Copy", "Close"].forEach(function (k) { el[k] = D.getElementById("shr" + k); });
    el.dlg = d;
    ["keydown", "keyup"].forEach(function (t) { d.addEventListener(t, function (e) { e.stopPropagation(); }); });   /* the Studio passes keys to the room; not from here */
    d.addEventListener("cancel", function (e) { e.preventDefault(); e.stopPropagation(); close(); });
    d.addEventListener("click", function (e) { if (e.target === d || (e.target.classList && e.target.classList.contains("shr-wrap"))) close(); });
    el.Close.addEventListener("click", close);
    el.Song.addEventListener("click", songTap);
    el.Beat.addEventListener("click", beatTap);
    el.Copy.addEventListener("click", function () { try { el.Link.focus(); el.Link.select(); D.execCommand && D.execCommand("copy"); } catch (e) {} say("copied"); did("shared"); });
  }
  function say(k, f) { S.line = k || ""; S.fill = f || {}; paint(); }
  function paint() {
    if (!el.dlg) return;
    el.dlg.setAttribute("lang", es() ? "es" : "en");
    txt(el.H, w("h")); txt(el.SongB, w("song")); txt(el.SongS, S.busy ? w("making") : w("songSay")); txt(el.BeatB, w("beat")); txt(el.BeatS, w("beatSay"));
    txt(el.Close, w("close")); txt(el.LinkL, w("linkL")); txt(el.Copy, w("copy"));
    el.Song.setAttribute("aria-busy", S.busy ? "true" : "false");
    el.LinkBox.hidden = !S.showLink; if (S.showLink && el.Link.value !== S.link) el.Link.value = S.link;
    txt(el.Line, S.line && S.line !== "making" ? w(S.line, S.fill) : "");
  }
  function open(api) {
    A = api; build();
    if (S.open) return;
    S.open = true; S.line = ""; S.showLink = false; S.want = false;
    if (S.fileOf !== A.bk) { S.file = null; S.fileOf = null; }
    paint();
    try { el.dlg.showModal(); } catch (e) { el.dlg.setAttribute("open", ""); }
    try { el.Song.focus(); } catch (e) {}
    /* both are made now, so a tap on either hands it over at once (a share sheet wants the tap's own moment) */
    S.linkPr = makeLink().catch(function () { return { err: "fail" }; });
    if (A.bk) songReady().catch(function () {});
    try { S.mo = new MutationObserver(paint); S.mo.observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
  }
  function close() {
    if (!S.open) return;
    S.open = false; S.want = false;
    if (S.mo) { S.mo.disconnect(); S.mo = null; }
    try { el.dlg.close(); } catch (e) { el.dlg.removeAttribute("open"); }
    try { if (A.opener) A.opener.focus(); } catch (e) {}
  }

  /* ══ a beat link opening in the Studio ══ */
  async function arrive(code, sh) {
    S.at = "getting";
    var r = null;
    try { r = clean(await decode(code)); } catch (e) { r = null; }
    if (!r) {   /* the line waits for the Studio to have settled (its first paint clears the line), then says it once */
      await sh.withRoom("pads", function () {}, function (pw) { return pw.AOGPadsSetup && pw.AOGPadsSetup.ready(); }).catch(function () {});
      S.at = "bad"; sh.line(W.bad[0], W.bad[1]); return false;
    }
    sh.line(W.getting[0], W.getting[1]);
    try { if (window.AOGSong) AOGSong.set({ bpm: r.bpm, key: r.key, minor: r.minor }); } catch (e) {}
    try {
      var res = await sh.withRoom("pads", function (pw) { return pw.AOGPadsSetup.load(r); }, function (pw) { return pw.AOGPadsSetup && pw.AOGPadsSetup.load && pw.AOGPadsSetup.ready(); });
      S.arrived = { name: r.name, bpm: r.bpm, bars: r.bars, key: r.key, minor: r.minor, n: res && res.n, sec: res && res.sec };
    } catch (e) { S.at = "badLoad"; sh.line(W.badLoad[0], W.badLoad[1]); return false; }
    try { if (sh.refresh) sh.refresh(); } catch (e) {}
    S.at = "welcome"; sh.line(W.welcome[0], W.welcome[1]);
    did("remixopened");
    return true;
  }

  window.AOGShare = {
    open: open, close: close, arrive: arrive,
    /* for the tests (music-handoff/tests/studio/share.js) and nothing else */
    _t: { encode: encode, decode: decode, clean: clean, pack: pack, makeLink: makeLink },
    state: function () { return { open: S.open, line: el.Line ? el.Line.textContent : "", busy: S.busy, kind: S.kind, file: S.file ? S.file.name : "", link: S.link, at: S.at, arrived: S.arrived }; }
  };
})();
