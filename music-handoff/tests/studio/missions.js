/* AOG-MISSIONS-V1 (2026-10-22) — Missions, remix challenges and "Why it works" in the Recording Studio (aog-missions.js; the
   ticks and the listening in the-studio.html; the events from aog-recorder.js, aog-song.js, aog-micbooth.js, aog-listenback.js,
   aog-quickstart.js). Jimmy wants a reason for his 13-year-old to come back. Nothing is ever locked.
   · nothing of aog-missions.js loads before it is needed (still after a quiet wait, and with ✦ Start a song's sheet open);
   · missions tick from the real thing: ✦ Start a song (a vibe), a tap in the room while ♫ Play along plays, ● Record and
     ■ Stop in the Drum Machine, + Add to My Track, ▶ Listen back (its last line), Share it, a step tapped on the Drum Machine,
     a fader at the Mixing Desk, ♩ Song's +, a lick made by the room's recorder (REC.addTake), and the aog-studio-did event
     from the Studio's window and from a room's (a bad name is ignored);
   · the line that says a mission is done is calm: a tick, no animation, it stays where it is, still there seconds later; it is
     readable and fits; the next Studio key puts it away; inside the vocal booth when that is open;
   · the sheet: 12 missions with how and why, the done ones ticked; 6 remix challenges ticked by hand (and unticked); readable,
     calm, fits an iPhone (390×664 and 390×844), an iPad and a computer, every key 44 px or more, nothing sideways;
   · the ticks stay after a reload (and the file is not fetched again until needed); Start the missions again asks first,
     then clears them;
   · an iPhone in Spanish (dark), an iPad in English (light) and a computer; no page errors. Port 9631. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy"), PORT = 9631, srv = require("../srv.js")(PORT);
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const W = ms => new Promise(r => setTimeout(r, ms));
async function setup(b, o, lang, theme) {
  const ctx = await b.newContext({ ...o, colorScheme: theme, serviceWorkers: "block", acceptDownloads: true }); const errs = [], asked = [];
  ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
  ctx.on("request", r => { if (/aog-missions\.js/.test(r.url())) asked.push(r.url()); });
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  await ctx.addInitScript(([l, th]) => { try { if (!sessionStorage.getItem("t")) { localStorage.clear(); sessionStorage.setItem("t", "1"); } localStorage.setItem("aog.lang", l);
    localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); } catch (e) {} }, [lang, theme]);
  await ctx.addInitScript(TXT);
  return { ctx, errs, asked };
}
const ST = p => p.evaluate(() => window.AOGMissions ? AOGMissions.state() : null);
const done = async p => ((await ST(p)) || { done: [] }).done;
const frame = (p, re) => p.frames().find(x => re.test(x.url()));
/* the slip: where it is, what it says, how it looks */
/* the words as read, the site's emoji pictures (aog-grace.js) read as their characters */
const TXT = () => { window.__txt = el => [...el.childNodes].map(n => n.nodeType === 3 ? n.nodeValue : n.tagName === "IMG" ? (n.alt || "") : n.nodeType === 1 ? window.__txt(n) : "").join(""); };
const slipView = p => p.evaluate(() => { const s = document.getElementById("msDone"); if (!s || s.hidden) return null;
  const r = s.getBoundingClientRect(), cs = getComputedStyle(s), bs = [...s.querySelectorAll("button")];
  return { text: __txt(s), host: s.parentNode.className || s.parentNode.id, r: [r.left, r.top, r.right, r.bottom].map(Math.round), iw: innerWidth, ih: innerHeight,
    anim: cs.animationName, trans: cs.transitionDuration, min: Math.min(...bs.map(b => Math.round(Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height)))),
    tick: !!s.querySelector(".ms-tk"), sw: document.scrollingElement.scrollWidth }; });
const sheetView = p => p.evaluate(() => { const s = document.getElementById("msSheet"); if (!s || s.hidden) return null;
  const r = s.getBoundingClientRect(), bs = [...s.querySelectorAll("button")];
  return { r: [r.left, r.top, r.right, r.bottom].map(Math.round), iw: innerWidth, ih: innerHeight, sw: document.scrollingElement.scrollWidth, side: s.scrollWidth <= s.clientWidth + 1,
    min: Math.min(...bs.map(b => Math.round(Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height)))),
    inside: bs.every(b => { const q = b.getBoundingClientRect(); return q.left >= r.left - 1 && q.right <= r.right + 1; }),
    items: s.querySelectorAll(".ms-it").length, ticked: s.querySelectorAll(".ms-it.ms-done").length, why: [...s.querySelectorAll(".ms-why")].every(x => /Why it works:|Por qué funciona:/.test(x.textContent) && x.textContent.length > 30),
    tabs: [...s.querySelectorAll(".ms-tab")].map(x => x.textContent + (x.getAttribute("aria-pressed") === "true" ? "*" : "")), h: s.querySelector("h2").textContent,
    next: (s.querySelector(".ms-next .ms-can") || {}).textContent || "", line: s.querySelector("#msLine").textContent, focus: document.activeElement && (document.activeElement.id || document.activeElement.getAttribute("data-tab")) }; });
/* Listen back: its mission line, and whether every key and the cover are on the screen */
const lbFit = p => p.evaluate(() => { const d = document.getElementById("lbDlg"), l = document.getElementById("msLb"), vis = e => !!(e && e.getClientRects().length && getComputedStyle(e).display !== "none");
  const inV = e => { const r = e.getBoundingClientRect(); return r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1; };
  const bt = [...d.querySelectorAll("button")].filter(vis);
  return { line: vis(l) && !l.hidden ? __txt(l) : "", inDlg: !!(l && d.contains(l)), allIn: bt.every(inV) && inV(document.getElementById("lbCover")), side: d.scrollWidth <= d.clientWidth + 1 }; });
/* a Drum Machine loop on My Track (as studio/listenback.js does) */
async function loop(p) {
  await p.evaluate(() => AOGStudioShell.go("pads")); await W(3500);
  const f = p.frames().find(x => /music-pads/.test(x.url()));
  await f.waitForFunction(() => document.querySelectorAll("#grpSel option").length > 3, null, { timeout: 30000 });
  await f.evaluate(async () => { startBeat("boombap"); document.getElementById("bounceBtn").click();
    for (let i = 0; i < 160; i++) { const r = await AOGHandoff.list(AOGHandoff.INBOX); if (r && r.items && r.items.some(x => x.from === "pads" && x.sec > 0)) break; await new Promise(r => setTimeout(r, 250)); }
    try { stopBeat && stopBeat(); } catch (e) {} });
  await W(1500);
}
/* My Track's sheet (a phone, an upright iPad), opened when it is not open; a wide screen has My Track in the bar */
async function sheetMT(p) { if (await p.evaluate(() => !!document.getElementById("mtOpen").offsetParent && !document.getElementById("mt").classList.contains("mt-open"))) { await p.click("#mtOpen"); await W(250); } }
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* ═══ an iPhone in Safari (390×664), Spanish, dark: the whole path ═══ */
  { const { ctx, errs, asked } = await setup(b, { ...pw.devices["iPhone 13"], viewport: { width: 390, height: 664 } }, "es", "dark");
    const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#pads`); await W(4000);
    /* 1 · nothing of it loaded */
    let k = await p.evaluate(() => ({ t: document.getElementById("msOpen").textContent, loaded: !!window.AOGMissions, sheet: !!document.getElementById("msSheet"), slip: !!document.getElementById("msDone") }));
    await W(3000);
    ok(!k.loaded && !k.sheet && !k.slip && !asked.length && k.t === "Misiones · 0 de 12" && !(await p.evaluate(() => !!window.AOGMissions)),
      `iPhone: nothing of aog-missions.js is loaded before it is needed, after a quiet wait too; My Track's key says "${k.t}"`);
    /* 2 · ✦ Start a song: its sheet has the Missions line; a vibe starts the song and ticks "started" */
    await p.tap("#qsOpen"); await W(900);
    const qm = await p.evaluate(() => { const b = document.getElementById("qsMs"), r = b && b.getBoundingClientRect(); return b ? { t: b.textContent, h: Math.round(r.height), in: r.bottom <= innerHeight && r.right <= innerWidth } : null; });
    ok(qm && qm.t === "Misiones · 0 de 12" && qm.h >= 44 && qm.in && !asked.length, `iPhone: ✦ Start a song's sheet has "${qm && qm.t}" as its last line (44 px, on the screen); nothing fetched yet`);
    await p.tap('#qsList button[data-vibe="lofi"]');
    await p.waitForFunction(() => window.AOGQuickstart && !AOGQuickstart.busy(), null, { timeout: 90000 }).catch(() => {});
    await p.waitForFunction(() => window.AOGMissions && AOGMissions.state().done.indexOf("started") >= 0, null, { timeout: 10000 }).catch(() => {});
    await W(500);
    let s = await ST(p), v = await slipView(p);
    ok(s && s.done.join() === "started" && asked.length === 1 && v && /Misión cumplida: empezaste una canción\./.test(v.text) && /Siguiente: Activa ♫ Toca encima/.test(v.text),
      `iPhone: a vibe picked ticks "I can start a song", and one warm line says so and what is next: "${v && v.text}"`);
    ok(v && v.tick && v.anim === "none" && /^0s/.test(v.trans) && v.host === "sh-main" && v.r[0] >= 0 && v.r[2] <= v.iw && v.min >= 44 && v.sw <= v.iw,
      `iPhone: the line is calm (a tick, no animation), sits just above the desk, fits, its keys 44 px: ${JSON.stringify(v)}`);
    let pc = await p.evaluate(`(${PROBE})()`), pk = await p.evaluate(`(${CALM})()`);
    ok(!pc.length && !pk.length, `iPhone, dark: the line reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and the page is calm (${pk.join("; ") || "ok"})`);
    await W(3000); const v2 = await slipView(p);
    ok(v2 && JSON.stringify(v2.r) === JSON.stringify(v.r), `iPhone: three seconds later it is still there, and has not moved`);
    /* 3 · a tap in the room while ♫ Play along plays */
    const along = await p.evaluate(() => AOGStudioShell.along().on);
    const fr = await p.evaluate(() => { const r = document.getElementById("room").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.7 }; });
    await p.mouse.click(fr.x, fr.y); await W(900);
    s = await ST(p); v = await slipView(p);
    ok(along && s.done.indexOf("playedalong") >= 0 && v && /tocaste encima de tu ritmo/.test(v.text), `iPhone: a tap in the Piano while ♫ Play along plays ticks "I can play over my beat" (a tap in the room leaves the line): "${v && v.text}"`);
    /* 4 · ● Record and ■ Stop in the Drum Machine, then + Add to My Track */
    await p.tap('.sh-doors a[data-room="pads"]'); await W(3000);
    ok(!(await slipView(p)), "iPhone: the next Studio key (a door) puts the line away");
    const pads = frame(p, /music-pads/);
    await pads.waitForFunction(() => document.querySelectorAll("#grpSel option").length > 3, null, { timeout: 30000 });
    await pads.evaluate(() => { if (!SEQ.on) document.getElementById("playBtn").click(); }); await W(600);
    await p.tap("#tpRec"); await W(3000); await p.tap("#tpRec");
    await p.waitForFunction(() => !document.getElementById("tpAdd").hidden, null, { timeout: 15000 }).catch(() => {});
    await p.waitForFunction(() => AOGMissions.state().done.indexOf("recorded") >= 0, null, { timeout: 5000 }).catch(() => {});
    v = await slipView(p);
    ok((await done(p)).indexOf("recorded") >= 0 && v && /grabaste una toma/.test(v.text) && /Pulsa \+ Añadir a mi pista|pulsa \+ Añadir a mi pista/.test(v.text),
      `iPhone: ● Record and ■ Stop in the Drum Machine tick "I can record a take" (the room's recorder says so): "${v && v.text}"`);
    await pads.evaluate(() => { if (SEQ.on) document.getElementById("playBtn").click(); });
    await p.tap("#tpAdd");
    await p.waitForFunction(() => AOGMissions.state().done.indexOf("added") >= 0, null, { timeout: 15000 }).catch(() => {});
    await W(400); v = await slipView(p);
    ok((await done(p)).indexOf("added") >= 0 && v && /tu toma está en mi pista/.test(v.text), `iPhone: + Add to My Track ticks "I can add a take to My Track": "${v && v.text}"`);
    /* 5 · ▶ Listen back: ticked, and its last line says so; Share it ticks "send it to a friend" */
    await sheetMT(p);
    k = await p.evaluate(() => { const b = document.getElementById("msOpen"), r = b.getBoundingClientRect(); return { t: b.textContent, h: Math.round(r.height), vis: !!b.offsetParent, in: r.right <= innerWidth && r.bottom <= innerHeight }; });
    ok(k.vis && k.h >= 44 && k.in && k.t === "Misiones · 4 de 12", `iPhone: My Track's sheet ends with "${k.t}", 44 px, on the screen`);
    await p.click("#mtLb");
    await p.waitForFunction(() => { const d = document.getElementById("lbDlg"); return d && d.open; }, null, { timeout: 15000 });
    await p.fill("#lbArtist", "DJ Theo"); await p.fill("#lbName", "Noche"); await p.click("#lbDone");
    await p.waitForFunction(() => AOGListenBack.state().on, null, { timeout: 30000 }).catch(() => {});
    await W(500); s = await ST(p);
    let lbv = await lbFit(p);
    ok(s.done.indexOf("listenedback") >= 0 && lbv.line === "" && lbv.allIn && lbv.side && !(await slipView(p)),
      `iPhone 390×664 (Safari's bars): ▶ Listen back ticks its mission; there is no room for another line, so Listen back stays as it was and fits: ${JSON.stringify(lbv)}`);
    await p.evaluate(() => { navigator.share = async () => {}; navigator.canShare = () => true; });
    await p.click("#lbShare");
    await p.waitForFunction(() => AOGMissions.state().done.indexOf("shared") >= 0, null, { timeout: 30000 }).catch(() => {});
    ok((await done(p)).indexOf("shared") >= 0, `iPhone: Share it ticks "I can send my song to a friend"`);
    await p.click("#lbBack"); await W(500);
    v = await slipView(p);
    ok(v && /Misión cumplida: enviaste tu canción a un amigo\./.test(v.text) && v.host === "sh-main", `iPhone: back in the Studio, the line says the mission done in Listen back: "${v && v.text}"`);
    /* 6 · the event: from the Studio's window, from a room's, a bad name; a lick from the room's recorder */
    await p.evaluate(() => window.dispatchEvent(new CustomEvent("aog-studio-did", { detail: { what: "nonsense" } })));
    await p.evaluate(() => window.dispatchEvent(new CustomEvent("aog-studio-did", { detail: { what: "remixopened" } }))); await W(300);
    s = await ST(p); v = await slipView(p);
    ok(s.done.indexOf("remixopened") >= 0 && s.done.indexOf("nonsense") < 0 && v && /abriste el ritmo de un amigo/.test(v.text), `iPhone: aog-studio-did "remixopened" on the Studio's window ticks it (a bad name is ignored): "${v && v.text}"`);
    await frame(p, /music-pads/).evaluate(() => window.dispatchEvent(new CustomEvent("aog-studio-did", { detail: { what: "sang" } }))); await W(300);
    ok((await done(p)).indexOf("sang") >= 0, "iPhone: the same event on a room's own window is passed on (sang)");
    await p.evaluate(() => AOGStudioShell.go("piano")); await W(3500);
    const lick = await frame(p, /music-piano/).evaluate(() => { const sr = 44100, n = sr, h = new ArrayBuffer(44 + n * 4), d = new DataView(h);
      const S = (o, t) => { for (let i = 0; i < t.length; i++) d.setUint8(o + i, t.charCodeAt(i)); };
      S(0, "RIFF"); d.setUint32(4, 36 + n * 4, true); S(8, "WAVE"); S(12, "fmt "); d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 2, true); d.setUint32(24, sr, true); d.setUint32(28, sr * 4, true); d.setUint16(32, 4, true); d.setUint16(34, 16, true); S(36, "data"); d.setUint32(40, n * 4, true);
      return !!REC.addTake(new Blob([h], { type: "audio/wav" }), { sec: 1, bpm: 78 }); });
    await W(500);
    ok(lick && (await done(p)).indexOf("lick") >= 0, "iPhone: a take the room makes itself (a lick, REC.addTake) ticks \"I can record a lick\"");
    /* 7 · a step on the Drum Machine; a fader at the Mixing Desk; ♩ Song's + */
    await p.evaluate(() => AOGStudioShell.go("pads")); await W(2500);
    await frame(p, /music-pads/).click("#steps .st >> nth=3");
    await W(500);
    ok((await done(p)).indexOf("ownbeat") >= 0, "iPhone: a step tapped on the Drum Machine ticks \"I can make my own beat\"");
    await p.tap('.sh-doors a[data-room="studio"]'); await W(4000);
    const dk = frame(p, /music-studio/);
    await dk.waitForFunction(() => document.querySelectorAll("#mixer input[type=range]").length > 0, null, { timeout: 20000 });
    await dk.evaluate(() => { const r = document.querySelector('#mixer input[type=range][data-k="vol"]') || document.querySelector("#mixer input[type=range]"); r.value = String(Math.max(+r.min || 0, +r.value - 10)); r.dispatchEvent(new Event("input", { bubbles: true })); });
    await W(500);
    ok((await done(p)).indexOf("mixed") >= 0, "iPhone: a fader moved at the Mixing Desk ticks \"I can change a level\"");
    await sheetMT(p); await p.click("#tpSong"); await W(300); await p.click("#songUp"); await W(400);
    ok((await done(p)).indexOf("songchanged") >= 0, "iPhone: ♩ Song's + ticks \"I can change the tempo or the key\"");
    await p.click("#songDone"); await W(200);
    /* 8 · the sheet: missions, then challenges by hand */
    await sheetMT(p); await p.click("#msOpen"); await W(500);
    let sv = await sheetView(p);
    ok(sv && sv.items === 12 && sv.ticked === 12 && sv.why && sv.tabs[0] === "Misiones · 12 de 12*" && sv.h === "Misiones y retos" && sv.focus === "m",
      `iPhone: the sheet lists 12 missions, all ticked here, each with its "why": ${JSON.stringify({ items: sv && sv.items, ticked: sv && sv.ticked, tabs: sv && sv.tabs })}`);
    ok(sv && sv.r[0] >= 0 && sv.r[2] <= sv.iw && sv.r[3] <= sv.ih && sv.min >= 44 && sv.inside && sv.side && sv.sw <= sv.iw, `iPhone 390×664: the sheet fits, 44 px keys, nothing sideways: ${JSON.stringify({ r: sv && sv.r, min: sv && sv.min })}`);
    pc = await p.evaluate(`(${PROBE})()`); pk = await p.evaluate(`(${CALM})()`);
    ok(!pc.length && !pk.length, `iPhone, dark: the sheet reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await p.click('[data-tab="c"]'); await W(200);
    sv = await sheetView(p);
    ok(sv.items === 6 && sv.ticked === 0 && sv.why && sv.tabs[1] === "Retos de remezcla · 0 de 6*", `iPhone: six remix challenges, none ticked, each with how and why: ${JSON.stringify(sv.tabs)}`);
    await p.click('[data-ch="minor"]'); await W(150); await p.click('[data-ch="three"]'); await W(150);
    sv = await sheetView(p); s = await ST(p);
    ok(s.ch.join() === "three,minor" && sv.ticked === 2 && sv.line === "Buen trabajo. Reto cumplido: Solo tres sonidos." && sv.tabs[1] === "Retos de remezcla · 2 de 6*",
      `iPhone: "Lo hice ✓" ticks a challenge by hand, with a warm line: "${sv.line}"`);
    await p.click('[data-ch="three"]'); await W(150); s = await ST(p);
    ok(s.ch.join() === "minor", "iPhone: a second tap unticks it");
    pc = await p.evaluate(`(${PROBE})()`);
    ok(!pc.length, `iPhone: the challenges read (${pc.length} ${JSON.stringify(pc.slice(0, 2))})`);
    await p.keyboard.press("Escape"); await W(200);
    ok(!(await ST(p)).open, "iPhone: Escape puts the sheet away");
    /* 9 · after a reload: the ticks are kept, and nothing is fetched until it is needed */
    const before = asked.length;
    await p.reload(); await W(4500);
    k = await p.evaluate(() => ({ t: document.getElementById("msOpen").textContent, loaded: !!window.AOGMissions, saved: JSON.parse(localStorage.getItem("aog.studio.missions.v1")) }));
    ok(!k.loaded && asked.length === before && k.t === "Misiones · 12 de 12" && Object.keys(k.saved.done).length === 12 && Object.keys(k.saved.ch).join() === "minor",
      `iPhone: after a reload the ticks are kept ("${k.t}", challenge minor) and the file waits until needed`);
    /* 10 · Start the missions again: asks first, then clears */
    await sheetMT(p); await p.click("#msOpen"); await W(600);
    await p.click("#msReset"); await W(200);
    const askT = await p.evaluate(() => document.querySelector("#msSheet .ms-foot p").textContent);
    sv = await sheetView(p);
    ok(/Borrar todas las marcas/.test(askT) && (await ST(p)).done.length === 12 && sv.min >= 44, `iPhone: Start the missions again asks first: "${askT}"`);
    await p.click("#msNo"); await W(150);
    ok((await ST(p)).done.length === 12, "iPhone: Keep my ticks keeps them");
    await p.click("#msReset"); await W(150); await p.click("#msYes"); await W(300);
    s = await ST(p); k = await p.evaluate(() => ({ t: document.getElementById("msOpen").textContent, saved: JSON.parse(localStorage.getItem("aog.studio.missions.v1")) }));
    sv = await sheetView(p);
    ok(!s.done.length && !s.ch.length && k.t === "Misiones · 0 de 12" && !Object.keys(k.saved.done).length && sv.line === "Borradas. Tu primera misión está lista." && sv.next.indexOf("Puedo empezar una canción.") === 0,
      `iPhone: Yes, start again clears every tick: "${k.t}", "${sv.line}"`);
    ok(errs.length === 0, "iPhone: no page errors " + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }

  /* ═══ an iPad (820×1180, then on its side), English, light; the booth; a computer ═══ */
  { const { ctx, errs, asked } = await setup(b, { viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true }, "en", "light");
    const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#piano`); await W(4000);
    ok(!asked.length && !(await p.evaluate(() => !!window.AOGMissions)), "iPad: nothing of aog-missions.js loaded before it is needed");
    await p.evaluate(() => window.dispatchEvent(new CustomEvent("aog-studio-did", { detail: { what: "remixopened" } })));
    await p.waitForFunction(() => !!document.getElementById("msDone") && !document.getElementById("msDone").hidden, null, { timeout: 10000 }).catch(() => {});
    let v = await slipView(p);
    ok(v && /^✓Mission done: you opened a friend's beat to add to it\.Next: Press ✦ Start a song and pick a vibe\.Missions · 1 of 12✕$/.test(v.text) && v.min >= 44 && v.r[2] <= v.iw && v.anim === "none",
      `iPad, English: "${v && v.text}"`);
    let pc = await p.evaluate(`(${PROBE})()`);
    ok(!pc.length, `iPad, light: the line reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))})`);
    await p.click("#msDoneSee"); await W(500);
    let sv = await sheetView(p);
    ok(sv && !(await slipView(p)) && sv.items === 12 && sv.ticked === 1 && sv.next === "I can start a song.Next" && sv.r[2] <= sv.iw && sv.r[3] <= sv.ih && sv.min >= 44 && sv.inside && sv.side,
      `iPad: the line's Missions key opens the sheet (the line goes away); it fits: ${JSON.stringify({ r: sv && sv.r, next: sv && sv.next })}`);
    pc = await p.evaluate(`(${PROBE})()`); const pk = await p.evaluate(`(${CALM})()`);
    ok(!pc.length && !pk.length, `iPad, light: the sheet reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await p.click("#msClose"); await W(200);
    ok(!(await ST(p)).open, "iPad: Done puts the sheet away");
    /* inside the vocal booth: the line is in the booth */
    await p.click("#shMic"); await p.waitForFunction(() => window.AOGMicBooth && AOGMicBooth.state().open, null, { timeout: 10000 }); await W(800);
    await p.evaluate(() => window.dispatchEvent(new CustomEvent("aog-studio-did", { detail: { what: "sang" } }))); await W(400);
    v = await slipView(p);
    const vb = await p.evaluate(() => { const s = document.getElementById("msDone"), r = s.getBoundingClientRect(), bs = [...document.querySelectorAll("#aogMicBooth button")].filter(x => x.offsetParent);
      return { inBooth: !!s.closest("#aogMicBooth"), vis: r.height > 20 && r.bottom <= innerHeight + 400, small: bs.filter(x => x.getBoundingClientRect().height < 44).map(x => x.id || x.textContent) }; });
    ok(v && vb.inBooth && !vb.small.length && /you recorded your voice/.test(v.text), `iPad: with the booth open, the line is inside the booth: ${JSON.stringify({ ...vb, text: v && v.text })}`);
    pc = await p.evaluate(`(${PROBE})()`);
    ok(!pc.length, `iPad: the booth with the line reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))})`);
    await p.keyboard.press("Escape"); await W(500);
    /* an iPad on its side: My Track is in the bar, the key with it */
    await p.setViewportSize({ width: 1180, height: 820 }); await W(800);
    let bar = await p.evaluate(() => { const k = document.getElementById("msTop"), r = k.getBoundingClientRect(), row = document.getElementById("mtRow").getBoundingClientRect(), top = document.querySelector(".sh-top"), h1 = document.querySelector(".sh-top h1").getBoundingClientRect();
      const keys = [...document.querySelectorAll("#mtRow .tp-b, #mtAdd")].map(x => { const q = x.getBoundingClientRect(); return { id: x.id, w: Math.round(q.width), h: Math.round(q.height), sw: x.scrollWidth, cw: x.clientWidth }; });
      return { t: k.textContent, vis: !!k.offsetParent, inBar: !!document.getElementById("msOpen").offsetParent, h: Math.round(r.height), right: Math.round(r.right), iw: innerWidth, row: Math.round(row.right), sw: document.scrollingElement.scrollWidth,
        top: Math.round(top.getBoundingClientRect().height), h1: Math.round(h1.height), topFit: top.scrollWidth <= top.clientWidth + 1, cut: keys.filter(x => x.sw > x.cw + 1).map(x => x.id), keys }; });
    ok(bar.vis && !bar.inBar && bar.h >= 44 && bar.right <= bar.iw && bar.sw <= bar.iw && bar.topFit && bar.top < 64 && bar.h1 < 34 && !bar.cut.length && bar.t === "Missions · 2 of 12",
      `iPad on its side (1180×820): "${bar.t}" sits on the top line (My Track's bar is full), one line high, nothing cut or sideways: ${JSON.stringify(bar)}`);
    await p.setViewportSize({ width: 1440, height: 900 }); await W(800);
    bar = await p.evaluate(() => { const k = document.getElementById("msTop"), r = k.getBoundingClientRect(), top = document.querySelector(".sh-top");
      return { t: k.textContent, vis: !!k.offsetParent, h: Math.round(r.height), right: Math.round(r.right), iw: innerWidth, sw: document.scrollingElement.scrollWidth, top: Math.round(top.getBoundingClientRect().height) }; });
    ok(bar.vis && bar.h >= 44 && bar.right <= bar.iw && bar.sw <= bar.iw && bar.top < 64, `a computer (1440×900): the key on the top line fits: ${JSON.stringify(bar)}`);
    await p.click("#msTop"); await W(400);
    sv = await sheetView(p);
    ok(sv && sv.r[2] <= sv.iw && sv.r[3] <= sv.ih && sv.min >= 44 && sv.inside, `a computer: the sheet fits: ${JSON.stringify(sv && sv.r)}`);
    await p.keyboard.press("Escape"); await W(200);
    ok(errs.length === 0, "iPad and computer: no page errors " + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }

  /* ═══ an iPhone (390×844), English, light: the sheet and the challenges fit ═══ */
  { const { ctx, errs } = await setup(b, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, "en", "light");
    const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#guitar`); await W(3500);
    await sheetMT(p); await p.click("#msOpen"); await W(600);
    let sv = await sheetView(p);
    ok(sv && sv.r[0] >= 0 && sv.r[2] <= sv.iw && sv.r[3] <= sv.ih && sv.min >= 44 && sv.inside && sv.side && sv.tabs.join() === "Missions · 0 of 12*,Remix challenges · 0 of 6" && sv.next === "I can start a song.Next",
      `iPhone 390×844, English: the sheet fits: ${JSON.stringify({ r: sv && sv.r, tabs: sv && sv.tabs })}`);
    await p.click('[data-tab="c"]'); await W(200); await p.click('[data-ch="lockin"]'); await W(200);
    sv = await sheetView(p);
    ok(sv.line === "Nice work. Challenge done: Kick and bass together." && sv.min >= 44 && sv.inside, `iPhone, English: a challenge ticked: "${sv.line}"`);
    let pc = await p.evaluate(`(${PROBE})()`);
    ok(!pc.length, `iPhone, light: the challenges read (${pc.length} ${JSON.stringify(pc.slice(0, 2))})`);
    await p.keyboard.press("Escape"); await W(200);
    /* ▶ Listen back with room for its last line: the mission done, then (opened again) the next one */
    await loop(p);
    await sheetMT(p); await p.click("#mtLb");
    await p.waitForFunction(() => { const d = document.getElementById("lbDlg"); return d && d.open; }, null, { timeout: 15000 });
    await p.fill("#lbArtist", "Ava"); await p.click("#lbDone");
    await p.waitForFunction(() => AOGListenBack.state().on, null, { timeout: 30000 }).catch(() => {});
    await W(600);
    let lbv = await lbFit(p);
    ok(lbv.inDlg && lbv.allIn && lbv.side && /^✓ Mission done: you listened back to your song\. Next: Press ✦ Start a song and pick a vibe\.$/.test(lbv.line),
      `iPhone 390×844: ▶ Listen back ticks its mission and says so as its own last line, all on the screen: ${JSON.stringify(lbv)}`);
    pc = await p.evaluate(`(${PROBE})()`);
    ok(!pc.length, `iPhone: Listen back with its mission line reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))})`);
    await p.click("#lbBack"); await W(400);
    ok(!(await slipView(p)), "iPhone: said once: back in the Studio, the line is not said again");
    await sheetMT(p); await p.click("#mtLb");
    await p.waitForFunction(() => window.AOGListenBack && AOGListenBack.state().open, null, { timeout: 15000 }); await W(800);
    lbv = await lbFit(p);
    ok(/^Next mission: Press ✦ Start a song and pick a vibe\.$/.test(lbv.line) && lbv.allIn, `iPhone: opened again, its last line is the next mission: "${lbv.line}"`);
    await p.keyboard.press("Escape"); await W(300);
    ok(errs.length === 0, "iPhone 390×844: no page errors " + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
