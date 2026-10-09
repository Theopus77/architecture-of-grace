/* The rooms reach for the ceiling (Jimmy, 2026-10-09: "1, 3, 2, 4").
   1 · AOG-ROOMS-ROOM-V1: inside the Recording Studio every room sits in the dim control room (its page takes the room's
       colour), and a menu on a dark panel is the desk's dark window with gold type (class aog-hw), on a room's own page too.
   2 · AOG-FINISH-*-V1: the piano's lacquer, gold name, velvet and keys that go down; the guitar's and bass's rosewood, pearl,
       bone and wound strings; the Drum Machine's rubber pads that glow when hit; the Band's keys like the piano's.
   4 · AOG-STUDIO-FIRST-V2: in the Studio the piano, guitar, bass and band open on the instrument, its line on a paper slip.
   3 · AOG-STUDIO-ROOM-SOUND-V1: one Room knob (Dry, Small room, Studio, Hall), beside Record and in the Studio's bar; the
       room adds a tail to what you hear and to your takes; it starts Dry; the turntables stay dry.
   Readable and calm on an iPad and an iPhone, light and dark; nothing sideways. No page errors. Port 9261. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9261, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
}
const ROOMS = ["pads", "kit", "piano", "guitar", "bass", "band", "decks"];
async function inRoom(m, room) {
  await m.goto(U + "the-studio#" + room);
  await m.waitForFunction(r => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio"); }, room, { timeout: 20000 });
  await m.waitForTimeout(1800);
  return m.frames().find(x => x.parentFrame() === m.mainFrame());
}
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  for (const [dev, theme] of [["iPad (gen 7) landscape", "light"], ["iPad (gen 7) landscape", "dark"], ["iPhone 13", "light"], ["iPhone 13", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage();
    for (const room of ROOMS) {
      const f = await inRoom(m, room);
      const r = await f.evaluate(() => {
        const bg = getComputedStyle(document.body).backgroundColor;
        /* every menu that shows: on a dark panel it is the dark window with gold type; on a light card it keeps its look */
        const shown = [...document.querySelectorAll("select")].filter(s => s.getClientRects().length && !s.closest(".sp-keep"));
        const wrong = shown.filter(s => { if (!s.classList.contains("aog-hw")) return false; const c = getComputedStyle(s); return c.backgroundColor !== "rgb(18, 19, 22)" || c.color !== "rgb(246, 227, 180)"; }).length;
        return { bg, menus: shown.length, hw: shown.filter(s => s.classList.contains("aog-hw")).length, wrong, sw: document.scrollingElement.scrollWidth <= innerWidth + 1 };
      });
      const pc = await f.evaluate(`(${PROBE})()`), pk = await f.evaluate(`(${CALM})()`), sp = await m.evaluate(`(${PROBE})()`);
      /* 4 · AOG-STUDIO-FIRST-V2: the keyboard and string rooms open on their instrument, with their line on a paper slip under it */
      if (["piano", "guitar", "bass", "band"].includes(room)) {
        const fs2 = await f.evaluate(r => { const inst = document.getElementById(r === "guitar" || r === "bass" ? "neckBox" : "kbd"), blk = inst && inst.parentNode,
          h2 = blk && [...blk.children].find(e => e.tagName === "H2"), kids = blk ? [...blk.children] : [], slip = [...document.querySelectorAll(".aog-slip")].find(e => e.getClientRects().length);
          const strip = document.getElementById("chordStrip");
          /* AOG-CHORDS-BY-NECK-V1: the chord buttons sit right above the instrument */
          return { top: kids.indexOf(inst) <= kids.indexOf(h2) + 3, chords: !!strip && strip.getClientRects().length > 0 && kids.indexOf(strip) === kids.indexOf(inst) - 1, slip: !!slip && kids.indexOf(slip) > kids.indexOf(inst),
            paper: slip ? getComputedStyle(slip).backgroundColor : "" }; }, room);
        ok(fs2.top && fs2.chords && fs2.slip && fs2.paper === "rgb(247, 240, 225)", `${dev}, ${theme}, ${room}: the instrument opens the room, its chords right above it, its line on a paper slip under it: ${JSON.stringify(fs2)}`);
      }
      const needHw = dev.startsWith("iPad") && room !== "kit";
      ok(r.bg === "rgb(23, 17, 12)" && !r.wrong && (!needHw || r.hw > 0) && r.sw && !pc.length && !sp.length && !pk.length,
        `${dev}, ${theme}, ${room}: in the control room (${r.bg}), ${r.hw} of ${r.menus} menus dark with gold type, readable (${pc.length + sp.length} ${JSON.stringify(pc.concat(sp).slice(0, 2))}), calm (${pk.join("; ") || "ok"}), nothing sideways (${r.sw})`);
    }
    await cx.close();
  }
  /* 2 · each instrument its own finish */
  const fc = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(fc); await routes(fc);
  const fp = await fc.newPage();
  await fp.goto(U + "music-piano.html"); await fp.waitForTimeout(1500);
  const pf = await fp.evaluate(async () => { const w = document.querySelector("#kbd .wk"), plate = getComputedStyle(document.querySelector(".plate b"));
    w.classList.add("down"); await new Promise(r => setTimeout(r, 300)); const t = getComputedStyle(w).transform; w.classList.remove("down");
    return { felt: getComputedStyle(document.getElementById("kbd"), "::before").backgroundImage.includes("gradient"), gold: plate.color, serif: /Fraunces/.test(plate.fontFamily), down: t }; });
  ok(pf.felt && pf.gold === "rgb(231, 199, 126)" && pf.serif && /matrix\(1, 0, 0, 1, 0, 2\)/.test(pf.down), "the piano: velvet over the keys, its name in gold leaf, a pressed key goes down: " + JSON.stringify(pf));
  for (const g of ["music-guitar.html", "music-bass.html"]) {
    await fp.goto(U + g); await fp.waitForTimeout(1500);
    const nf = await fp.evaluate(() => { const q = s => document.querySelector("#neckBox " + s); return { wood: getComputedStyle(q(".nk-wood")).fill, pearl: getComputedStyle(q(".nk-inlay")).fill, nut: q(".nk-nut") ? getComputedStyle(q(".nk-nut")).fill : "url(#aogBone)", wound: getComputedStyle(q(".nk-str:not(.plain)")).stroke }; });
    ok(/aogRose/.test(nf.wood) && /aogPearl/.test(nf.pearl) && /aogBone/.test(nf.nut) && /aogWound/.test(nf.wound), `${g}: a rosewood board, pearl dots, a bone nut, wound strings: ${JSON.stringify(nf)}`);
  }
  await fp.goto(U + "music-pads.html"); await fp.waitForTimeout(1500);
  const pd = await fp.evaluate(async () => { const p = document.querySelector("#pads .pad"); const a = getComputedStyle(p).backgroundImage; p.classList.add("hit"); await new Promise(r => setTimeout(r, 400)); const h = getComputedStyle(p).boxShadow; p.classList.remove("hit"); return { rubber: /radial-gradient/.test(a), glow: /255, 200, 90/.test(h) }; });
  ok(pd.rubber && pd.glow, "the Drum Machine: rubber pads that glow gold from underneath when hit: " + JSON.stringify(pd));
  await fp.goto(U + "music-band.html"); await fp.waitForTimeout(1500);
  const bd = await fp.evaluate(() => { const o = document.querySelector("#kbd .wk.out"), w = document.querySelector("#kbd .wk:not(.out):not(.lit)"); return { ivory: getComputedStyle(w).backgroundColor, grey: o ? getComputedStyle(o).backgroundImage : "" }; });
  ok(bd.ivory === "rgb(246, 240, 226)" && /207, 202, 192/.test(bd.grey), "the Band: ivory keys like the piano's, out-of-range keys still grey: " + JSON.stringify(bd));
  await fc.close();

  /* on its own page a room keeps its paper, and its menus on dark panels are dark too */
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage();
  await p.goto(U + "music-piano.html"); await p.waitForTimeout(1800);
  const own = await p.evaluate(() => ({ bg: getComputedStyle(document.body).backgroundColor, kind: document.getElementById("spKind").classList.contains("aog-hw") }));
  ok(own.bg !== "rgb(23, 17, 12)" && own.kind, "the piano on its own page keeps its paper; its Kind menu is the dark window: " + JSON.stringify(own));

  /* 3 · AOG-STUDIO-ROOM-SOUND-V1: one room knob; Dry to start; the room adds a tail to what you hear and to your takes */
  const knob = () => p.evaluate(() => { const k = document.querySelector(".aogroom"), rb = document.getElementById("recBtn"); return { here: !!k && k.parentNode === rb.parentNode, name: k && k.querySelector("b").textContent, lab: k && k.getAttribute("aria-label") }; });
  let k0 = await knob();
  ok(k0.here && k0.name === "Dry" && /^Room sound: Dry\. Tap to change it\.$/.test(k0.lab), "the room knob sits beside Record and starts Dry: " + JSON.stringify(k0));
  await p.click(".aogroom"); k0 = await knob();
  ok(k0.name === "Small room" && await p.evaluate(() => localStorage.getItem("aog.room.v1")) === "1", "a tap turns it one step: " + k0.name);
  const tail = async () => {
    await p.mouse.click(5, 400).catch(() => {});
    await p.evaluate(() => { window.__wl = []; for (const ch of AOGRoom.chains) { const a = ch.ctx.createAnalyser(); a.fftSize = 2048; ch.wet.connect(a); const d = new Float32Array(2048);
      (function f() { a.getFloatTimeDomainData(d); let m = 0; for (const v of d) m = Math.max(m, Math.abs(v)); window.__wl.push(m); if (window.__wl.length < 400) requestAnimationFrame(f); })(); } });
    await p.keyboard.down("KeyA"); await p.waitForTimeout(150); await p.keyboard.up("KeyA"); await p.waitForTimeout(900);
    return p.evaluate(() => ({ wet: Math.max(0, ...window.__wl), on: AOGRoom.chains.map(c => c.on).join() }));
  };
  await p.evaluate(() => AOGRoom.set(0)); const dry = await tail();
  await p.evaluate(() => AOGRoom.set(3)); const hall = await tail();
  ok(dry.wet === 0 && /^false/.test(dry.on) && hall.wet > 0.05 && /^true/.test(hall.on), `Dry adds nothing (${dry.wet}); the Hall rings on (${hall.wet.toFixed(3)})`);
  /* a take carries the room: the recorder hears the same room */
  await p.evaluate(() => AOGStudioRec.toggle()); await p.waitForTimeout(400);
  await p.keyboard.down("KeyA"); await p.waitForTimeout(150); await p.keyboard.up("KeyA"); await p.waitForTimeout(800);
  await p.evaluate(() => AOGStudioRec.toggle()); await p.waitForTimeout(1500);
  const rc = await p.evaluate(() => ({ n: AOGRoom.chains.length, on: AOGRoom.chains.map(c => c.on).join(), take: AOGStudioRec.last() }));
  ok(rc.n === 2 && rc.on === "true,true" && rc.take && rc.take.sec > 0.5, "a take is recorded through the same room: " + JSON.stringify(rc));
  /* Spanish, and the Studio's bar has the same knob, in step with the room */
  await p.evaluate(() => { const b = document.getElementById("langBtn"); if (b) b.click(); }); await p.waitForTimeout(500);
  ok((await knob()).name === "Sala grande", "in Spanish: " + (await knob()).name);
  await p.evaluate(() => { const b = document.getElementById("langBtn"); if (b) b.click(); AOGRoom.set(0); });
  await c.close();
  const s2 = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(s2); await routes(s2);
  const q = await s2.newPage(); const f = await inRoom(q, "piano");
  const bar = await q.evaluate(() => { const k = document.querySelector("#tpVu .aogroom"); return k && !k.hidden && k.querySelector("b").textContent; });
  await q.click("#tpVu .aogroom"); await q.click("#tpVu .aogroom"); await q.waitForTimeout(400);
  const roomNow = await f.evaluate(() => AOGRoom.presets[AOGRoom.get()].en);
  ok(bar === "Dry" && roomNow === "Studio", `the Studio's bar has the knob (${bar}); turning it there turns the room's (${roomNow})`);
  await q.click('.sh-doors a[data-room="decks"]'); await q.waitForTimeout(2500);
  ok(await q.evaluate(() => document.querySelector("#tpVu .aogroom").hidden), "the turntables stay dry, so the knob steps aside there");
  await q.evaluate(() => localStorage.setItem("aog.room.v1", "0"));
  await s2.close();
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
