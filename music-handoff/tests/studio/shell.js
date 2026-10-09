/* AOG-STUDIO-SHELL-V1 — STUDIO-HANDOFF §04–§06 and §31, Jimmy's second pick: one house. /the-studio opens on the Drum
   Machine, playable, inside the frame, with the room's own site bar and doors stood down; the address says the room.
   A door changes the room; Back goes to the room before; a link inside a room to another room changes the room in the
   Studio (no page inside the page); any other page opens over the Studio. My Track marks a layer only when its room has
   sent something (a take in the Mixing Desk's list, or a recording on its shelf): visiting marks nothing, a take sent
   from inside a room marks it at once, and moving to the Bass keeps the marks. Open in its own tab points at the room's
   own address. /bass and /mixing-desk on their own still show their own bar and doors. Spanish follows into the room.
   iPhone, iPad and a computer, light and dark: the frame fills the screen with no page scroll, nothing sideways, the
   Studio and the room inside it readable and calm; no page errors. Port 9249. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const PORT = 9249, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const OUTD = process.env.AOG_SHOTS || fs.mkdtempSync(path.join(os.tmpdir(), "shell-"));
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => { pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message)); }); }
async function routes(ctx) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  const R = { "the-studio": "the-studio.html", bass: "music-bass.html", "mixing-desk": "music-studio.html", piano: "music-piano.html", "drum-machine": "music-pads.html" };
  await ctx.route(/\/(the-studio|bass|mixing-desk|piano|drum-machine)(\?[^#]*)?$/, r => {
    const k = new URL(r.request().url()).pathname.slice(1); r.fulfill({ path: path.join(ROOT, R[k]), contentType: "text/html" }); });
}
const inner = p => p.frames().find(f => f.parentFrame() === p.mainFrame());
async function arrived(p, file) {
  await p.waitForFunction(f => { const fr = document.getElementById("room"), d = fr.contentDocument;
    return fr.getAttribute("data-file") === "/" + f && d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && d.location.pathname.endsWith(f); }, file, { timeout: 20000 });
  await p.waitForTimeout(400);
}
const state = p => p.evaluate(() => ({ hash: location.hash, title: document.title, cur: (document.querySelector(".sh-doors a[aria-current]") || {}).textContent,
  marks: [...document.querySelectorAll("#mtList li")].map(li => { const el = li.firstElementChild; return el.classList.contains("mix") ? el.textContent.trim() : el.querySelector("span").textContent + (el.classList.contains("on") ? " ✓" : " —"); }).join(" | "), own: document.getElementById("own").getAttribute("href") }));

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* 1 · a computer: the Studio opens on the Drum Machine, playable */
  const c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage(); await p.goto(U + "the-studio"); await arrived(p, "music-pads.html");
  let s = await state(p);
  ok(s.hash === "#pads" && s.cur === "Drum Machine" && s.title === "The Recording Studio · The Drum Machine — Architecture of Grace", "it opens on the Drum Machine: " + JSON.stringify(s));
  let f = inner(p);
  const pads = await f.evaluate(() => ({ pads: document.querySelectorAll(".pads button.pad[data-p]").length,
    bar: [...document.querySelectorAll(".aogtop,.labdoors")].map(e => getComputedStyle(e).display) }));
  ok(pads.pads >= 16 && pads.bar.every(d => d === "none"), "the pads are there to play, and the room's own bar and doors step aside: " + JSON.stringify(pads));
  ok(s.marks === "Drums — | Kit — | Piano — | Guitar — | Bass — | Band — | Turntables — | Voice — | Live guitar — | Live bass —", "My Track starts empty: " + s.marks);
  ok(s.own === "/drum-machine", "Open in its own tab points at /drum-machine");

  /* 2 · a take sent from inside the piano marks Piano at once */
  await p.click('.sh-doors a[data-room="piano"]'); await arrived(p, "music-piano.html");
  s = await state(p);
  ok(s.hash === "#piano" && s.marks.startsWith("Drums — | Kit — | Piano —"), "visiting the piano marks nothing: " + s.marks);
  f = inner(p);
  await f.evaluate(async () => { const n = 44100, ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab), w = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true); v.setUint32(24, 44100, true); v.setUint32(28, 176400, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 4, true);
    for (let i = 0; i < n; i++) { const x = Math.round(8000 * Math.sin(i / 20)); v.setInt16(44 + i * 4, x, true); v.setInt16(46 + i * 4, x, true); }
    await AOGHandoff.add(AOGHandoff.INBOX, { from: "piano", n: 1, name: { en: "Piano take 1", es: "Toma de piano 1" }, sec: 1, bpm: 100, at: Date.now(), take: true, wav: new Blob([ab], { type: "audio/wav" }) }, { key: "shell|1" }); });
  await p.waitForFunction(() => !!document.querySelector('#mtList .lay.on[data-layer="piano"]'), null, { timeout: 8000 });
  ok(true, "a take sent from the piano marks Piano ✓ at once");
  /* AOG-MYTRACK-V1: a take recorded on the piano inside the Studio is added with + Add to My Track */
  f = inner(p);
  await f.evaluate(async () => { await REC.toggle(); });
  await p.waitForTimeout(250);
  await f.evaluate(() => noteOn("k", 60, 0.7)); await p.waitForTimeout(700); await f.evaluate(() => noteOff("k", 60));
  await f.evaluate(() => REC.toggle());
  await f.waitForFunction(() => REC.takes.length && !REC.closing, null, { timeout: 8000 });
  const add = await f.evaluate(() => { const b = document.querySelector("[data-aogrec-studio]"); return b && b.textContent; });
  ok(add === "+ Add to My Track", "inside the Studio, a take's send reads: " + add);
  const nIn = await p.evaluate(async () => (await AOGHandoff.list(AOGHandoff.INBOX)).items.length);
  await f.click("[data-aogrec-studio]");
  await f.waitForFunction(() => /Added to My Track/.test(document.getElementById("recLine").textContent), null, { timeout: 8000 });
  ok((await f.textContent("#recLine")).trim() === "Added to My Track. Open the Mixing Desk" && await p.evaluate(async () => (await AOGHandoff.list(AOGHandoff.INBOX)).items.length) === nIn + 1,
    "+ Add to My Track writes through the Mixing Desk's list, and says so");
  ok(await p.evaluate(() => [...document.querySelectorAll("#mtAdd option")].map(o => o.textContent).join(" | ")) === "+ Add a layer | The Drum Machine | The Drum Kit | The Piano ✓ | The Guitar | The Bass | The Band | The Turntables",
    "+ Add a layer lists the rooms in song order, and marks the ones already there");

  /* 3 · moving to the Bass keeps My Track; Back goes to the piano */
  await p.selectOption("#mtAdd", "bass"); await arrived(p, "music-bass.html");
  s = await state(p);
  ok(s.hash === "#bass" && s.cur === "Bass" && /Piano ✓/.test(s.marks) && s.own === "/bass" && await p.inputValue("#mtAdd") === "", "+ Add a layer › The Bass goes to the Bass, and Piano is still marked: " + s.marks);
  await p.goBack(); await arrived(p, "music-piano.html");
  ok((await state(p)).hash === "#piano", "Back goes to the piano");

  /* 4 · a link inside a room: to another room, the Studio changes room; to any other page, it opens over the Studio */
  f = inner(p);
  await f.evaluate(() => { const a = document.createElement("a"); a.href = "/mixing-desk"; a.id = "tlink"; a.textContent = "Open the Mixing Desk"; document.body.appendChild(a); });
  await f.click("#tlink"); await arrived(p, "music-studio.html");
  s = await state(p);
  ok(s.hash === "#studio" && s.cur === "Mixing Desk" && p.url().endsWith("/the-studio#studio"), "a link to the Mixing Desk inside a room changes the room: " + JSON.stringify(s));
  ok(await inner(p).evaluate(() => !document.querySelector("#room")), "no Studio inside the Studio");
  f = inner(p);
  await f.evaluate(() => { const a = document.createElement("a"); a.href = "/privacy.html"; a.id = "plink"; a.textContent = "x"; document.body.appendChild(a); });
  await Promise.all([p.waitForURL(/privacy/, { timeout: 10000 }).catch(() => {}), f.click("#plink")]);
  ok(/privacy/.test(p.url()), "any other page opens over the Studio: " + p.url());

  /* 5 · a room on its own address keeps its own bar and doors */
  for (const r of ["bass", "mixing-desk"]) {
    await p.goto(U + r); await p.waitForTimeout(1500);
    const own = await p.evaluate(() => ({ inStudio: document.documentElement.classList.contains("in-studio"), doors: !!document.querySelector(".labdoors") && getComputedStyle(document.querySelector(".labdoors")).display !== "none",
      bar: !!document.querySelector(".aogtop") && getComputedStyle(document.querySelector(".aogtop")).display !== "none" }));
    ok(!own.inStudio && own.doors && own.bar, `/${r} on its own keeps its own bar and doors: ` + JSON.stringify(own));
  }

  /* 6 · Spanish follows into the room */
  await p.goto(U + "the-studio#guitar"); await arrived(p, "music-guitar.html");
  await p.click('.aogtop-lang button:has-text("ES")');
  await p.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.getAttribute("lang") === "es"; }, null, { timeout: 15000 });
  s = await state(p);
  ok(s.cur === "Guitarra" && /guitarra/i.test(s.title) && (await p.textContent("#tpMix")) === "Mezclar ›" && s.marks.startsWith("Ritmos —"), "Spanish, in the Studio and in the room: " + JSON.stringify(s));
  await p.click('.aogtop-lang button:has-text("EN")'); await p.waitForTimeout(800);
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* 7 · iPhone, iPad and a computer, light and dark */
  for (const [dev, theme, room] of [["iPhone 13", "light", "bass"], ["iPhone 13", "dark", "pads"], ["iPad (gen 7)", "light", "studio"], ["iPad (gen 7)", "dark", "piano"], ["Desktop", "dark", "decks"]]) {
    const o = dev === "Desktop" ? { viewport: { width: 1366, height: 900 }, colorScheme: theme } : { ...pw.devices[dev], colorScheme: theme };
    const cx = await b.newContext(o); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "the-studio#" + room);
    const file = { bass: "music-bass.html", pads: "music-pads.html", studio: "music-studio.html", piano: "music-piano.html", decks: "music-decks.html" }[room];
    await arrived(m, file); await m.waitForTimeout(800);
    const fit = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), fr = document.getElementById("room"), mt = document.getElementById("mt"),
      btn = [...document.querySelectorAll(".sh-doors a, #mtList a, #mtList .lay, #mtAdd, #own")].filter(x => x.offsetParent);
      return { iw: innerWidth, ih: innerHeight, sw: document.scrollingElement.scrollWidth, sh: document.scrollingElement.scrollHeight, frame: Math.round(r(fr).height), mtBottom: Math.round(r(mt).bottom),
        minBtn: Math.min(...btn.map(x => Math.round(r(x).height))), cur: !!document.querySelector(".sh-doors a[aria-current]") && r(document.querySelector(".sh-doors a[aria-current]")).right <= innerWidth + 1 }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    const fi = inner(m), ipc = await fi.evaluate(`(${PROBE})()`), ipk = await fi.evaluate(`(${CALM})()`);
    ok(fit.sw <= fit.iw && fit.sh <= fit.ih + 1 && fit.mtBottom <= fit.ih + 1 && fit.frame >= 380 && fit.minBtn >= 44 && fit.cur && !pc.length && !pk.length && !ipc.length && !ipk.length,
      `${dev}, ${theme}, ${room}: fits (${JSON.stringify(fit)}), the Studio reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"}), the room reads (${ipc.length} ${JSON.stringify(ipc.slice(0, 2))}) and is calm (${ipk.join("; ") || "ok"})`);
    await m.screenshot({ path: path.join(OUTD, `shell-${dev.split(" ")[0].toLowerCase()}-${theme}-${room}.png`) });
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the phone, the iPad or the computer " + errs.join(" | "));
  console.log("shots: " + OUTD);
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
