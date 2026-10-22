/* AOG-LISTENBACK-V1 (2026-10-22) — the payoff moment. Jimmy wants the Recording Studio to be a showstopper for his
   13-year-old: when a teen has made something, one tap plays the song back on the whole screen, with the song's title and
   the artist's name, like a real release, and lets them share it with friends.

   The Studio (the-studio.html, made by _work/music/make_studio_page.py) fetches this file the first time ▶ Listen back is
   pressed (on My Track's sheet, and as a one-line link after + Add to My Track) and calls AOGListenBack.open(api).

   What it shows (a <dialog> over the Studio; the room behind stays exactly where it was, only quiet):
     - the artist name, asked the first time (one short field and Done), kept on this device (aog.studio.artist.v1),
       changeable later with ✎ Change; the song title is the Mixing Desk's own (SONG.name, "My song" when it has none);
     - a cover made from the song: a calm two-colour gradient and the title's initials, drawn the same way every time from
       the title (nothing moves);
     - the title, "by <artist>", the key and tempo in small type, Play / Pause, a bar with the time that moves only while
       the song plays (and can be dragged), Share it, and Back to the studio.

   How it plays: My Track as the desk bounces it out of sight (the Studio's backing(), as ♫ Play along and ● Record use it:
   every track through the whole desk, offline), played on the Studio's own sound (an AudioContext the Studio made inside
   the tap and registered with AOGVU.own). So the screen never has to switch to the desk, Pause and the bar are exact, and
   the sound rests (suspended) whenever nothing plays.

   How it shares: the same bounce, levelled exactly as the desk's Send it out levels its file (the desk's loudOfW and
   outLevel: −14 LUFS, true peak under −1 dB; wavBufW at the desk's chosen bit depth), as <title>.wav; then the device's
   share sheet with the message "<title> by <artist> — made in the Recording Studio at architectureofgrace.com". A device
   with no share sheet for files gets the file as a download instead.

   Silent until used: nothing runs until it opens; while open, a frame loop runs only while the song plays; it stops when
   paused, at the end, when the page is hidden or hushed, and on close. Escape or Back to the studio closes it. */
(function () {
  "use strict";
  if (window.AOGListenBack) return;
  var D = document, KEY = "aog.studio.artist.v1";
  var W = {
    getting: ["Getting your song ready…", "Preparando tu canción…"],
    play: ["▶ Play", "▶ Tocar"], pause: ["❚❚ Pause", "❚❚ Pausa"],
    share: ["Share it", "Compártela"], making: ["Making the file…", "Haciendo el archivo…"],
    back: ["Back to the studio", "Volver al estudio"],
    by: ["by {a}", "de {a}"], noArtist: ["+ Add your artist name", "+ Añade tu nombre de artista"],
    edit: ["✎ Change", "✎ Cambiar"], editAria: ["Change the artist name or the song title", "Cambiar el nombre de artista o el título"],
    askH: ["Put your name on it", "Ponle tu nombre"],
    askSay: ["This name goes on your songs. It stays on this device.", "Este nombre va en tus canciones. Se queda en este aparato."],
    artistL: ["Your artist name", "Tu nombre de artista"], titleL: ["Song title", "Título de la canción"], done: ["Done", "Listo"],
    myName: ["My song", "Mi canción"],
    empty: ["Nothing on My Track yet. Record in a room, then press + Add to My Track.", "Todavía no hay nada en mi pista. Graba en una sala y luego pulsa + Añadir a mi pista."],
    silent: ["There is no sound to share yet. Turn a track up at the Mixing Desk.", "Todavía no hay sonido para compartir. Sube una pista en la mesa de mezclas."],
    shared: ["Sent. Nice work!", "Enviada. ¡Buen trabajo!"],
    again: ["Your file is ready. Press Share it again to send it.", "Tu archivo está listo. Pulsa Compártela otra vez para enviarlo."],
    saved: ["Saved as {n}. Send it to a friend from your downloads.", "Guardada como {n}. Envíala a un amigo desde tus descargas."],
    fail: ["That did not work. Try again.", "No funcionó. Inténtalo otra vez."],
    msg: ["{t} by {a} — made in the Recording Studio at architectureofgrace.com", "{t}, de {a} — hecha en el estudio de grabación de architectureofgrace.com"],
    msgNo: ["{t} — made in the Recording Studio at architectureofgrace.com", "{t} — hecha en el estudio de grabación de architectureofgrace.com"],
    where: ["Where the song is", "Dónde va la canción"], of: ["{a} of {b}", "{a} de {b}"],
    tempo: ["{n} beats a minute", "{n} pulsos por minuto"], major: ["major", "mayor"], minor: ["minor", "menor"],
    cover: ["Cover of {t}", "Portada de {t}"], dlg: ["Listen back", "Escúchala"]
  };
  var A = null, S = { open: false, tok: 0, bk: null, ready: false, buf: null, src: null, g: null, on: false, pos: 0, t0: 0, dur: 0, raf: 0,
    shown: -1, drag: false, want: false, ask: false, busy: false, file: null, fileOf: null, line: "", fill: {}, name: "", restT: 0, mo: null };
  var el = {};
  function es() { return A && A.es ? A.es() : (D.documentElement.getAttribute("lang") || "en").indexOf("es") === 0; }
  function w(k, f) { var x = W[k][es() ? 1 : 0]; for (var n in (f || {})) x = x.split("{" + n + "}").join(f[n]); return x; }
  function txt(e, t) { if (e.textContent !== t) e.textContent = t; }
  function att(e, k, v) { if (e.getAttribute(k) !== v) e.setAttribute(k, v); }
  function clock(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  function artist() { try { var v = localStorage.getItem(KEY); return v === null ? null : String(v); } catch (e) { return null; } }
  function setArtist(v) { try { localStorage.setItem(KEY, String(v || "").trim().slice(0, 40)); } catch (e) {} }
  function title() { return S.name || w("myName"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function slug(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40); }
  function desk() { try { return A.desk(); } catch (e) { return null; } }
  function readName() {
    var n = "";
    try { var dw = desk(); if (dw) n = dw.__aogStudio.SONG.name || ""; else { var sg = JSON.parse(localStorage.getItem("aog.studio.v1") || "null"); n = (sg && sg.name) || ""; } } catch (e) {}
    S.name = String(n).trim();
  }

  /* the cover: two colours and the initials, the same every time for the same title (a small hash of it) */
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function initials(t) {
    var ws = String(t).split(/\s+/).map(function (x) { var m = x.match(/[A-Za-z0-9À-ɏͰ-ϿЀ-ӿ]/); return m ? m[0] : ""; }).filter(Boolean);
    return (ws.length ? (ws[0] + (ws[1] || "")) : "♪").toUpperCase();
  }
  function hue(t) { return hash(t.toLowerCase()) % 360; }
  function coverSvg(t, a) {
    var h = hash(t.toLowerCase()), h1 = h % 360, h2 = (h1 + 40 + (h >>> 9) % 90) % 360;
    var cx = 22 + (h >>> 3) % 56, cy = 18 + (h >>> 11) % 44, r = 26 + (h >>> 17) % 16;
    return '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="lbGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + h1 + ',36%,30%)"/><stop offset="1" stop-color="hsl(' + h2 + ',32%,15%)"/></linearGradient></defs>' +
      '<rect width="100" height="100" fill="url(#lbGrad)"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="hsl(' + h2 + ',40%,58%)" fill-opacity=".16"/>' +
      '<circle cx="' + (100 - cx) + '" cy="' + (100 - cy * 0.6) + '" r="' + Math.round(r * 0.55) + '" fill="hsl(' + h1 + ',45%,62%)" fill-opacity=".12"/>' +
      '<text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="34" fill="#f8eedb">' + esc(initials(t)) + "</text>" +
      (a ? '<text x="50" y="90" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="5.6" letter-spacing=".6" fill="#f8eedb" fill-opacity=".9">' + esc(a.toUpperCase().slice(0, 28)) + "</text>" : "") +
      "</svg>";
  }

  var CSS = [
    "dialog.lb{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;color:#f4ead6;background:#120e0a;overflow:auto;overscroll-behavior:contain;-webkit-text-size-adjust:100%}",
    "dialog.lb:not([open]){display:none}",
    "dialog.lb::backdrop{background:#120e0a}",
    ".lb-wrap{box-sizing:border-box;min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;",
    "padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));",
    "background:linear-gradient(180deg,hsl(var(--lb-h,30) 22% 15%) 0,#120e0a 75%)}",
    ".lb-cover{flex:0 0 auto;width:min(72vw,36vh,360px);aspect-ratio:1/1;border-radius:10px;overflow:hidden;background:#2a241d;box-shadow:0 18px 44px rgba(0,0,0,.55),0 0 0 1px rgba(255,236,200,.08)}",
    ".lb-cover svg{display:block}",
    ".lb-side{box-sizing:border-box;width:min(100%,30rem);display:flex;flex-direction:column;align-items:stretch;gap:10px;text-align:center}",
    ".lb-show,.lb-ask{display:flex;flex-direction:column;gap:10px}",
    ".lb-show[hidden],.lb-ask[hidden],.lb [hidden]{display:none!important}",
    "#lbTitle{margin:0;font:600 clamp(1.6rem,6.4vw,2.6rem)/1.08 Fraunces,Georgia,serif!important;letter-spacing:-.01em!important;color:#fff8ea!important;overflow-wrap:anywhere}",
    ".lb-by{margin:0;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:2px 8px;font:500 1.15rem/1.25 Inter,system-ui,sans-serif;color:#efe2c6}",
    ".lb-small{margin:0;font:600 .92rem/1.3 Inter,system-ui,sans-serif;color:#d2c4a8;letter-spacing:.01em}",
    ".lb-small:empty{display:none}",
    ".lb-time{display:flex;align-items:center;gap:10px}",
    "#lbPos{flex:1 1 auto;min-width:0;height:44px;margin:0;accent-color:#e2b55c;background:transparent;cursor:pointer}",
    "#lbClock{flex:0 0 auto;min-width:6.6em;text-align:right;font:700 .95rem/1 Inter,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#efe2c6}",
    ".lb-btns{display:flex;gap:10px}",
    ".lb-b{flex:1 1 0;min-width:0;min-height:50px;display:inline-flex;align-items:center;justify-content:center;gap:.4rem;padding:0 1rem;border-radius:10px;border:1px solid #050403;",
    "background:linear-gradient(#36302a,#2a251f 45%,#1d1915);color:#f4ead6;font:700 1rem/1.15 Inter,system-ui,sans-serif;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;",
    "box-shadow:inset 0 1px 0 rgba(255,240,215,.13),0 2px 0 #050403}",
    ".lb-b:disabled{opacity:.7;cursor:default}",
    ".lb-go{background:linear-gradient(#f6e2a8,#e6c06a 50%,#d2a548);color:#231704;border-color:#5e4512}",
    ".lb-share{color:#f3d48e}",
    ".lb-back{flex:0 0 auto;width:100%}",
    ".lb-link{min-height:44px;padding:0 .85rem;border:1px solid rgba(243,212,142,.45);border-radius:999px;background:transparent;color:#f3d48e;font:700 .95rem/1 Inter,system-ui,sans-serif;cursor:pointer;touch-action:manipulation}",
    ".lb-line{margin:0;min-height:1.3em;font:italic 500 1rem/1.35 Fraunces,Georgia,serif;color:#efe2c6}",
    ".lb-line:empty{display:none}",
    "#lbAskH{margin:0;font:600 1.5rem/1.15 Fraunces,Georgia,serif!important;letter-spacing:0!important;color:#fff8ea!important}",
    ".lb-ask p{margin:0;color:#e2d5ba;font:500 1rem/1.35 Inter,system-ui,sans-serif}",
    ".lb-ask label{display:flex;flex-direction:column;gap:4px;text-align:left;font:700 .95rem/1.2 Inter,system-ui,sans-serif;color:#f4ead6}",
    ".lb-ask input{min-height:48px;box-sizing:border-box;width:100%;padding:0 .8rem;border-radius:9px;border:1.5px solid #b98f3e;background:#FFFDF8;color:#0A1E33;font:600 18px/1.2 Inter,system-ui,sans-serif}",
    ".lb-ask input::placeholder{color:#5f5a52}",
    ".lb-b:focus-visible,.lb-link:focus-visible,#lbPos:focus-visible,.lb-ask input:focus-visible{outline:3px solid #e2b55c;outline-offset:2px}",
    /* an iPad and a computer: the cover beside the words */
    "@media (min-width:800px) and (min-height:520px){.lb-wrap{flex-direction:row;gap:44px}.lb-cover{width:min(42vw,62vh,440px)}.lb-side{width:28rem;text-align:left}.lb-by{justify-content:flex-start}}",
    /* a phone on its side: the cover beside the words, everything a little smaller */
    "@media (orientation:landscape) and (max-height:519px){.lb-wrap{flex-direction:row;gap:22px;padding-top:max(10px,env(safe-area-inset-top));padding-bottom:max(10px,env(safe-area-inset-bottom))}",
    ".lb-cover{width:min(56vh,38vw)}.lb-side{width:min(26rem,56vw);gap:6px;text-align:left}.lb-show,.lb-ask{gap:6px}.lb-by{justify-content:flex-start;font-size:1rem}",
    "#lbTitle{font-size:1.5rem!important}#lbAskH{font-size:1.2rem!important}.lb-ask p{font-size:.92rem}.lb-b{min-height:46px}.lb-ask input{min-height:44px}}",
    "@media print{dialog.lb{display:none}}"
  ].join("\n");

  function build() {
    if (el.dlg) return;
    var st = D.createElement("style"); st.id = "aogListenBackCss"; st.textContent = CSS; D.head.appendChild(st);
    var d = D.createElement("dialog"); d.className = "lb"; d.id = "lbDlg"; d.setAttribute("aria-labelledby", "lbTitle");
    d.innerHTML = '<div class="lb-wrap"><div class="lb-cover" id="lbCover" role="img"></div><div class="lb-side">' +
      '<form class="lb-ask" id="lbAsk" hidden novalidate><h2 id="lbAskH"></h2><p id="lbAskSay"></p>' +
      '<label><span id="lbArtistL"></span><input id="lbArtist" type="text" maxlength="40" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="next"></label>' +
      '<label><span id="lbNameL"></span><input id="lbName" type="text" maxlength="80" autocomplete="off" autocapitalize="sentences" spellcheck="false" enterkeyhint="done"></label>' +
      '<button type="submit" class="lb-b lb-go" id="lbDone"></button></form>' +
      '<div class="lb-show" id="lbShow"><h2 id="lbTitle"></h2><p class="lb-by"><span id="lbBy"></span><button type="button" class="lb-link" id="lbEdit"></button></p>' +
      '<p class="lb-small" id="lbSmall"></p>' +
      '<div class="lb-time" id="lbTime"><input type="range" id="lbPos" min="0" max="1000" step="1" value="0"><span id="lbClock" aria-hidden="true">0:00 / 0:00</span></div>' +
      '<div class="lb-btns" id="lbBtns"><button type="button" class="lb-b lb-go" id="lbPlay"></button><button type="button" class="lb-b lb-share" id="lbShare"></button></div>' +
      '<p class="lb-line" id="lbLine" aria-live="polite"></p></div>' +
      '<button type="button" class="lb-b lb-back" id="lbBack"></button></div></div>';
    D.body.appendChild(d);
    ["Cover", "Ask", "AskH", "AskSay", "ArtistL", "Artist", "NameL", "Name", "Done", "Show", "Title", "By", "Edit", "Small", "Time", "Pos", "Clock", "Btns", "Play", "Share", "Line", "Back"]
      .forEach(function (k) { el[k] = D.getElementById("lb" + k); });
    el.dlg = d;
    /* the Studio passes every key on to the room; inside this view the keys stay here */
    ["keydown", "keyup"].forEach(function (t) { d.addEventListener(t, function (e) { e.stopPropagation(); }); });
    d.addEventListener("cancel", function (e) { e.preventDefault(); close(); });   /* Escape */
    el.Back.addEventListener("click", close);
    el.Play.addEventListener("click", function () { if (S.on) pause(); else { S.want = true; play(); } });
    el.Share.addEventListener("click", share);
    el.Edit.addEventListener("click", function () { askOpen(true); });
    el.Ask.addEventListener("submit", function (e) { e.preventDefault(); askDone(); });
    el.Artist.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); el.Name.focus(); } });
    el.Pos.addEventListener("input", function () { S.drag = true; var p = (+el.Pos.value / 1000) * S.dur; txt(el.Clock, clock(p) + " / " + clock(S.dur)); });
    el.Pos.addEventListener("change", function () { S.drag = false; seek((+el.Pos.value / 1000) * S.dur); });
    D.addEventListener("visibilitychange", function () { if (D.hidden && S.on) pause(); });
    window.addEventListener("pagehide", function () { if (S.on) pause(); });
    window.addEventListener("aog-hush", function (e) { if (e.detail && e.detail.on && S.on) pause(); });   /* AOG-SILENT-V1 */
  }

  function say(k, f) { S.line = k || ""; S.fill = f || {}; paint(); }
  function keyLine() {
    var s = null, N = null; try { s = A.song(); N = A.notes(); } catch (e) {}
    var parts = [];
    if (s && s.hasKey && N) parts.push(N[es() ? "es" : "en"][s.key] + " " + w(s.minor ? "minor" : "major"));
    var bpm = s && s.hasBpm ? s.bpm : S.bk && S.bk.bpm;
    if (bpm > 0) parts.push(w("tempo", { n: Math.round(bpm) }));
    return parts.join(" · ");
  }
  function paint() {
    if (!el.dlg) return;
    var t = title(), a = artist() || "", has = !!S.bk, empty = S.ready && !S.bk && !S.err;
    att(el.dlg, "lang", es() ? "es" : "en");
    el.dlg.style.setProperty("--lb-h", String(hue(t)));
    var cv = t + "|" + a; if (el.Cover.getAttribute("data-k") !== cv) { el.Cover.innerHTML = coverSvg(t, a); el.Cover.setAttribute("data-k", cv); }
    att(el.Cover, "aria-label", w("cover", { t: t }));
    txt(el.Title, t);
    txt(el.By, a ? w("by", { a: a }) : ""); el.By.hidden = !a;
    txt(el.Edit, a ? w("edit") : w("noArtist")); att(el.Edit, "aria-label", a ? w("editAria") : w("noArtist"));
    txt(el.Small, has ? keyLine() : "");
    el.Time.hidden = !has; el.Btns.hidden = empty;
    txt(el.Play, !S.ready ? w("getting") : S.on ? w("pause") : w("play"));
    el.Play.disabled = !has; att(el.Play, "aria-pressed", S.on ? "true" : "false");
    txt(el.Share, S.busy ? w("making") : w("share")); el.Share.disabled = !has || S.busy;
    att(el.Pos, "aria-label", w("where"));
    txt(el.Back, w("back"));
    txt(el.AskH, w("askH")); txt(el.AskSay, w("askSay")); txt(el.ArtistL, w("artistL")); txt(el.NameL, w("titleL")); txt(el.Done, w("done"));
    att(el.Name, "placeholder", w("myName"));
    var ln = empty ? w("empty") : S.line ? w(S.line, S.fill) : "";
    txt(el.Line, ln);
    tick(true);
  }

  /* ── playing: the bounce on the Studio's own sound ── */
  function ctx() { try { return A.ac(); } catch (e) { return null; } }
  function now() { var c = ctx(); if (!S.on || !c) return S.pos; return Math.min(S.dur, Math.max(0, c.currentTime - S.t0)); }
  function tick(force) {
    if (!el.dlg || !S.dur) { if (el.Clock) txt(el.Clock, "0:00 / 0:00"); return; }
    var p = now(), v = Math.round((p / S.dur) * 1000);
    if (!S.drag && +el.Pos.value !== v) el.Pos.value = v;
    var sec = Math.floor(p);
    if (force || sec !== S.shown) { S.shown = sec; if (!S.drag) txt(el.Clock, clock(p) + " / " + clock(S.dur)); att(el.Pos, "aria-valuetext", w("of", { a: clock(p), b: clock(S.dur) })); }
  }
  function loop() {
    if (S.raf) return;
    var f = function () { S.raf = 0; if (!S.on || !S.open || D.hidden) return; tick(false); S.raf = requestAnimationFrame(f); };
    S.raf = requestAnimationFrame(f);
  }
  function rest() {   /* the sound rests whenever nothing plays */
    clearTimeout(S.restT);
    S.restT = setTimeout(function () { var c = ctx(); try { if (!S.on && c && c.state === "running") c.suspend(); } catch (e) {} }, 150);
  }
  function stopSrc() {
    var s = S.src, g = S.g, c = ctx(); S.src = null; S.g = null; if (!s) return;
    try { var t = c.currentTime; g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + 0.04); s.stop(t + 0.05); } catch (e) { try { s.stop(); } catch (e2) {} }
  }
  function play() {
    var c = ctx(); if (!S.bk || S.on || !c || !S.open) return;
    clearTimeout(S.restT);
    if (!S.buf) { S.buf = c.createBuffer(2, S.bk.L.length, S.bk.sr); S.buf.copyToChannel(S.bk.L, 0); S.buf.copyToChannel(S.bk.R || S.bk.L, 1); }
    try { if (c.state !== "running") c.resume(); } catch (e) {}
    if (S.pos >= S.dur - 0.05) S.pos = 0;
    var src = c.createBufferSource(), g = c.createGain(); src.buffer = S.buf; src.connect(g); g.connect(c.destination);
    var at = c.currentTime + 0.04; src.start(at, S.pos); S.t0 = at - S.pos;
    S.src = src; S.g = g; S.on = true;
    src.onended = function () { if (S.src !== src) return; S.src = null; S.g = null; S.on = false; S.pos = 0; rest(); paint(); };
    paint(); loop();
  }
  function pause() {
    if (!S.on) return;
    S.pos = now(); stopSrc(); S.on = false; S.want = false;
    if (S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; }
    rest(); paint();
  }
  function seek(p) {
    S.pos = Math.max(0, Math.min(S.dur, p || 0));
    if (S.on) { stopSrc(); S.on = false; play(); } else tick(true);
  }

  /* ── sharing: the file the desk's Send it out would make, from the same bounce ── */
  function fileName() { return (slug(title()) || slug(w("myName")) || "song") + ".wav"; }
  async function makeFile() {
    var dw = desk(), st = dw && dw.__aogStudio, bk = S.bk;
    if (!st || !st.loudOfW || !st.outLevel || !st.wavBufW) throw new Error("no desk");
    var ld = await st.loudOfW(bk.L, bk.R || bk.L, bk.sr);
    if (!(ld && ld.tp > 0.001)) return null;   /* nothing above −60 dB: as the desk's Send it out, no file */
    var r = st.outLevel(ld), ab = await st.wavBufW(bk.L, bk.R || bk.L, bk.sr, r.g, st.bits ? st.bits() : 16);
    var f = new File([ab], fileName(), { type: "audio/wav" });
    S.file = f; S.fileOf = bk; return f;
  }
  function download(f) {
    try {
      var u = URL.createObjectURL(f), a = D.createElement("a"); a.href = u; a.download = f.name; a.rel = "noopener"; a.style.display = "none";
      el.dlg.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
      say("saved", { n: f.name });
    } catch (e) { say("fail"); }
  }
  async function share() {
    if (S.busy || !S.bk) return;
    var f = S.file && S.fileOf === S.bk && S.file.name === fileName() ? S.file : null, fresh = !f;
    if (!f) {
      S.busy = true; say("");
      try { f = await makeFile(); } catch (e) { f = undefined; }
      S.busy = false;
      if (f === undefined) { say("fail"); return; }
      if (!f) { say("silent"); return; }
      paint();
    }
    var a = artist() || "", msg = a ? w("msg", { t: title(), a: a }) : w("msgNo", { t: title() });
    var can = false; try { can = !!(navigator.share && (!navigator.canShare || navigator.canShare({ files: [f] }))); } catch (e) { can = false; }
    if (!can) { download(f); return; }
    try { await navigator.share({ files: [f], title: title(), text: msg }); say("shared"); }
    catch (e) {
      if (e && e.name === "AbortError") say("");
      else if (e && e.name === "NotAllowedError" && fresh) say("again");   /* making the file took the tap's moment: one more tap sends it */
      else download(f);
    }
  }

  /* ── the artist name (and the song's title), asked the first time ── */
  function askOpen(on) {
    S.ask = !!on; el.Ask.hidden = !on; el.Show.hidden = !!on;
    if (on) { el.Artist.value = artist() || ""; el.Name.value = S.name; paint(); try { (el.Artist.value ? el.Name : el.Artist).focus(); } catch (e) {} }
    else { paint(); try { el.Play.focus(); } catch (e) {} }
  }
  function askDone() {
    setArtist(el.Artist.value);
    var nm = String(el.Name.value || "").trim().slice(0, 80);
    if (nm !== S.name) {
      S.name = nm;
      /* the desk's own song name box, as if typed there (it saves the song) */
      try { var dw = desk(), box = dw && dw.document.getElementById("songName"); if (box) { box.value = nm; box.dispatchEvent(new dw.Event("input", { bubbles: true })); } } catch (e) {}
    }
    askOpen(false);
    if (S.want && S.bk && !S.on) play();
  }

  function load() {
    var my = ++S.tok;
    S.bk = null; S.buf = null; S.ready = false; S.err = false; S.dur = 0; S.pos = 0; paint();
    Promise.resolve().then(function () { return A.backing(); }).then(function (bk) {
      if (my !== S.tok || !S.open) return;
      S.ready = true; S.bk = bk && bk.L && bk.L.length ? bk : null; S.dur = S.bk ? S.bk.L.length / S.bk.sr : 0;
      var typed = S.name; readName(); if (S.ask && typed && !S.name) S.name = typed;
      paint();
      if (S.bk && S.want && !S.ask) play(); else rest();
    }, function () { if (my !== S.tok || !S.open) return; S.ready = true; S.err = true; say("fail"); rest(); });
  }
  function open(api) {
    A = api; build();
    if (S.open) return;
    S.open = true; S.on = false; S.line = ""; S.want = true; S.file = null; S.fileOf = null;
    readName();
    try { A.room(true); } catch (e) {}   /* the room behind goes quiet, and wakes as it was on the way back */
    var first = artist() === null;
    el.Ask.hidden = !first; el.Show.hidden = first; S.ask = first;
    paint();
    try { el.dlg.showModal(); } catch (e) { el.dlg.setAttribute("open", ""); }
    try { S.mo = new MutationObserver(function () { paint(); }); S.mo.observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
    if (first) { rest(); try { el.Artist.focus(); } catch (e) {} } else { try { el.Play.focus(); } catch (e) {} }
    load();
  }
  function close() {
    if (!S.open) return;
    S.open = false; S.tok++;
    stopSrc(); S.on = false; S.want = false; S.pos = 0;
    if (S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; }
    S.buf = null; S.bk = null; rest();
    if (S.mo) { S.mo.disconnect(); S.mo = null; }
    try { el.dlg.close(); } catch (e) { el.dlg.removeAttribute("open"); }
    try { A.room(false); } catch (e) {}
    try { var o = A.opener && A.opener(); if (o) o.focus(); } catch (e) {}
    try { if (A.done) A.done(); } catch (e) {}
  }
  window.AOGListenBack = {
    open: open, close: close,
    /* read only, for the Studio's tests (music-handoff/tests/studio/listenback.js) */
    state: function () { var c = ctx(); return { open: S.open, ready: S.ready, has: !!S.bk, on: S.on, pos: now(), dur: S.dur, ask: S.ask, ac: c && c.state, raf: !!S.raf, line: el.Line ? el.Line.textContent : "", file: S.file ? S.file.name : "" }; }
  };
})();
