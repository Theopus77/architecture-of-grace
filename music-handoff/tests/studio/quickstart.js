/* AOG-QUICKSTART-V1 (2026-10-22) — ✦ Start a song. Jimmy wants the Studio to be a showstopper for his 13-year-old: open it,
   tap one key, pick a vibe, and in a few seconds a beat, chords and a bass are playing, and the Piano's lit keys all fit.
   1 · The key is on the Studio's first screen, on the top line, with Back, the name and EN | ES (an iPhone, Spanish; an iPad,
       English). Nothing of aog-quickstart.js loads before it is pressed. It opens a sheet, "Pick a vibe", with six big
       choices, each with one plain line; the sheet fits the screen, every key is 44 px or more, readable and calm, light
       and dark; Escape (or Not now) puts it away.
   2 · Each vibe (Trap, Drill, Lo-fi, Pop, Rock, House), tapped: a new Drum Machine loop (beat, chords and bass, four bars,
       at the vibe's tempo) is on My Track and on the desk's track 1; ♫ Play along is on, round and round, its sound running;
       you are in the Piano; the Piano shows the song's key and its scale is lit (the vibe's pentatonic); the song
       (AOGSong) has the vibe's tempo and key; the line says "Your beat is playing. Play the lit keys — every one fits."
       The Drum Machine's banks hold the beat (A), the chord pattern (B) and the bass (C) in the vibe's key.
   No page errors. Port 9497. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "../../../aog-deploy"), PORT = 9497, srv = require("../srv.js")(PORT);
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const W = ms => new Promise(r => setTimeout(r, ms));
const ONLY = process.env.QS_ONLY ? process.env.QS_ONLY.split(",") : null;   /* QS_ONLY=pop,house node quickstart.js — just those */
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const DEV = [["iPhone", { ...pw.devices["iPhone 13"], viewport: { width: 390, height: 664 } }, "es", "dark"], ["iPad", { ...pw.devices["iPad Pro 11"], viewport: { width: 820, height: 1180 } }, "en", "light"]];
  for (const [nm, dev, lang, theme] of DEV) {
    const ctx = await b.newContext({ ...dev, colorScheme: theme, serviceWorkers: "block" }); const errs = [], asked = [];
    ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
    ctx.on("request", r => { if (/aog-quickstart\.js/.test(r.url())) asked.push(Date.now()); });
    await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
    await ctx.addInitScript(([l, th]) => { try { if (!sessionStorage.getItem("t")) { localStorage.clear(); sessionStorage.setItem("t", "1"); } localStorage.setItem("aog.lang", l);
      localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); } catch (e) {} }, [lang, theme]);
    const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio`);
    await W(4000);
    /* 1 · the key, and the sheet */
    const key = await p.evaluate(() => { const k = document.getElementById("qsOpen"), r = k.getBoundingClientRect(), R = s => document.querySelector(s).getBoundingClientRect();
      const mid = x => x.top + x.height / 2, ys = [R("#shBack"), R(".sh-top h1"), R(".sh-lang"), r].map(mid);
      return { t: (k.querySelector("img[alt='✦']") ? "✦ " : "") + k.textContent.trim(), h: Math.round(r.height), w: Math.round(r.width), inView: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, oneLine: Math.max(...ys) - Math.min(...ys) < 6,
        sw: document.scrollingElement.scrollWidth, iw: innerWidth, loaded: !!window.AOGQuickstart, room: location.hash }; });
    ok(key.inView && key.oneLine && key.h >= 44 && key.sw <= key.iw && !key.loaded && !asked.length && /^✦\s*/.test(key.t) && key.t.replace(/^✦\s*/, "") === (lang === "es" ? "Empieza una canción" : "Start a song"),
      `${nm}: ✦ Start a song is on the first screen, on the top line, 44 px or more; nothing of it loaded yet: ` + JSON.stringify(key));
    await p.tap("#qsOpen"); await W(1200);
    const sh = await p.evaluate(() => { const s = document.getElementById("qsSheet"), r = s.getBoundingClientRect(), bs = [...s.querySelectorAll("button")];
      return { open: !s.hidden, h: s.querySelector("h2").textContent, r: [r.left, r.top, r.right, r.bottom].map(Math.round), iw: innerWidth, ih: innerHeight,
        vibes: [...s.querySelectorAll("#qsList button b")].map(x => x.textContent).join(" | "), lines: [...s.querySelectorAll("#qsList button span")].every(x => x.textContent.length > 8),
        min: Math.min(...bs.map(x => Math.round(Math.min(x.getBoundingClientRect().width, x.getBoundingClientRect().height)))),
        inside: bs.every(x => { const q = x.getBoundingClientRect(); return q.left >= r.left && q.right <= r.right + 1 && q.bottom <= innerHeight; }),
        exp: document.getElementById("qsOpen").getAttribute("aria-expanded"), focus: document.activeElement && document.activeElement.getAttribute("data-vibe") }; });
    const pc = await p.evaluate(`(${PROBE})()`), pk = await p.evaluate(`(${CALM})()`);
    ok(sh.open && sh.vibes === "Trap | Drill | Lo-fi | Pop | Rock | House" && sh.lines && sh.min >= 44 && sh.inside && sh.r[0] >= 0 && sh.r[2] <= sh.iw && sh.r[3] <= sh.ih && sh.exp === "true" && sh.focus === "trap"
      && (lang === "es" ? sh.h === "Elige un estilo" : sh.h === "Pick a vibe") && !pc.length && !pk.length,
      `${nm}, ${theme}: the sheet: "${sh.h}", six big choices with a plain line each, it fits, 44 px keys, readable and calm: ` + JSON.stringify({ ...sh, pc: pc.slice(0, 3), pk }));
    await p.keyboard.press("Escape"); await W(300);
    ok(await p.evaluate(() => document.getElementById("qsSheet").hidden && document.activeElement && document.activeElement.id === "qsOpen"), `${nm}: Escape puts the sheet away`);
    /* 2 · every vibe */
    const VIBES = await p.evaluate(() => AOGQuickstart.VIBES);
    for (const v of VIBES) {
      if (ONLY && ONLY.indexOf(v.id) < 0) continue;
      const before = await p.evaluate(async () => { const r = await AOGHandoff.list(AOGHandoff.INBOX); return ((r && r.items) || []).filter(x => x.from === "pads").map(x => x.id); });
      const t0 = Date.now();
      await p.tap("#qsOpen"); await W(400);
      await p.tap(`#qsList button[data-vibe="${v.id}"]`);
      const making = await p.evaluate(() => document.getElementById("qsLine").textContent);
      await p.waitForFunction(() => !AOGQuickstart.busy(), null, { timeout: 90000 }).catch(() => {});
      const sec = ((Date.now() - t0) / 1000).toFixed(1);
      await W(800);
      const s = await p.evaluate(async (old) => {
        const r = await AOGHandoff.list(AOGHandoff.INBOX), items = ((r && r.items) || []).filter(x => x.from === "pads" && old.indexOf(x.id) < 0);
        const desk = [...document.querySelectorAll("iframe.sh-room")].find(f => f.getAttribute("data-file") === "/music-studio.html");
        const dw = desk && desk.contentWindow, T = dw && dw.__aogStudio ? dw.__aogStudio.SONG.tracks : [];
        const pf = document.getElementById("room"), P = pf.contentWindow && pf.contentWindow.AOGPianoScale;
        /* the loop sounds: loud enough to hear, never clipped (its peak and its average level) */
        let lv = null; try { const it = await AOGHandoff.item(AOGHandoff.INBOX, items[0].id), ab = await it.wav.arrayBuffer(), O = new OfflineAudioContext(2, 1, 44100), bf = await O.decodeAudioData(ab);
          let pk = 0, sq = 0; const d = bf.getChannelData(0); for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > pk) pk = v; sq += d[i] * d[i]; }
          lv = { peak: Math.round(pk * 100) / 100, rms: Math.round(Math.sqrt(sq / d.length) * 1000) / 1000, sec: Math.round(bf.duration * 100) / 100 }; } catch (e) { lv = { err: String(e) }; }
        return { lv: lv, added: items.map(x => ({ bpm: x.bpm, bars: x.bars, loop: !!x.loop })), onDesk: items.length ? T.findIndex(x => x.clip && x.clip.tid === items[items.length - 1].id) : -2,
          along: AOGStudioShell.along(), room: location.hash, piano: P ? P.get() : null, song: AOGSong.get(), line: document.getElementById("tpLine").textContent,
          sheet: !document.getElementById("qsSheet").hidden };
      }, before);
      const pads = p.frames().find(x => /music-pads/.test(x.url()));
      const banks = pads ? await pads.evaluate(() => { const n = b => S.ev.filter(e => e.b === b).length;
        return { beat: S.beat && S.beat.id, a: n(0), b: n(1), c: n(2), d: n(3), pat: S.banks[1].pat, keyB: S.banks[1].key, keyC: S.banks[2].key, scB: S.banks[1].scale, instB: S.banks[1].inst, instC: S.banks[2].inst, bpm: S.bpm, bars: S.bars,
          roots: [...new Set(S.ev.filter(e => e.b === 2).map(e => padDefs(2)[e.p].notes[0] % 12))].sort((x, y) => x - y),
          chordRoots: [...new Set(S.ev.filter(e => e.b === 1).map(e => padDefs(1)[e.p].notes[0] % 12))].sort((x, y) => x - y) }; }) : null;
      const said = lang === "es" ? "Tu ritmo está sonando. Toca las teclas iluminadas: todas encajan." : "Your beat is playing. Play the lit keys — every one fits.";
      ok(/Haciendo tu ritmo|Making your beat/.test(making), `${nm}, ${v.id}: while it works the sheet says "${making}"`);
      ok(s.added.length === 1 && s.added[0].bpm === v.bpm && s.added[0].bars === 4 && s.added[0].loop && s.onDesk === 0,
        `${nm}, ${v.id}: a new four-bar Drum Machine loop at ${v.bpm} is on My Track, on the desk's track 1 (${sec} s): ` + JSON.stringify({ added: s.added, onDesk: s.onDesk }));
      ok(s.lv && s.lv.peak > 0.2 && s.lv.peak <= 1 && s.lv.rms > 0.03 && Math.abs(s.lv.sec - 16 * 60 / v.bpm) < 0.05, `${nm}, ${v.id}: the loop sounds, four bars long, loud and never clipped: ` + JSON.stringify(s.lv));
      ok(banks && banks.beat === v.beat && banks.a > 8 && banks.b >= 4 && banks.c >= 4 && banks.pat === v.pat && banks.keyB === v.key && banks.keyC === v.key && banks.scB === (v.minor ? "minor" : "major")
        && banks.instB === v.chords && banks.instC === v.bass && banks.bpm === v.bpm && banks.bars === 4 && JSON.stringify(banks.roots) === JSON.stringify(banks.chordRoots),
        `${nm}, ${v.id}: the Drum Machine holds the beat, the chords and a bass on the chords' roots: ` + JSON.stringify(banks));
      ok(s.along.on && s.along.loop && s.along.ac === "running" && s.room === "#piano" && !s.sheet,
        `${nm}, ${v.id}: ♫ Play along is on, round and round, and you are in the Piano: ` + JSON.stringify({ along: s.along, room: s.room }));
      ok(s.piano && s.piano.key === v.key && s.piano.minor === v.minor && s.piano.scale === v.scale && s.piano.lit >= 5,
        `${nm}, ${v.id}: the Piano is in the song's key, its scale lit: ` + JSON.stringify(s.piano));
      ok(s.song && s.song.bpm === v.bpm && s.song.key === v.key && s.song.minor === v.minor && s.line === said,
        `${nm}, ${v.id}: the song is ${v.bpm}, key ${v.key}${v.minor ? " minor" : " major"}, and the line says "${s.line}"`);
    }
    /* Play along stops as before, and its sound rests */
    await p.tap("#tpAlong"); await W(700);
    const a = await p.evaluate(() => AOGStudioShell.along());
    ok(!a.on && a.ac === "suspended", `${nm}: ■ Stop stops it and its sound rests: ` + JSON.stringify(a));
    ok(errs.length === 0, `${nm}: no page errors ` + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
