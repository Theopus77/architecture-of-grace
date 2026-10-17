/* AOG-ROOMS-COMPACT-V1 — Jimmy, 2026-10-17: "I feel like there is A LOT of scrolling on the studio pages (I am referring to the
   guitar page… but it could be for all)." Inside the Recording Studio a room fits its first screen; everything else waits
   behind one More menu (aog-labdoors.js).
   1 · On an iPhone on its side (844×390) and an iPad upright and sideways (820×1180, 1180×820), in each of the seven rooms
       the thing you play is wholly on the first screen, without scrolling: the neck, the keys, the pads, the kit, the two
       records and the crossfader. On an iPad a room is at most two screens long with nothing open; nothing runs off sideways.
   2 · More, on an iPad sideways: nothing is open on a first visit; every part opens from the menu and shows, Close folds
       it away, and the part you opened is open again after a reload. Any chord (piano, guitar, bass, band) is folded on a
       first visit, opens with one tap and is remembered.
   3 · Readable (tools/check-contrast.js's probe) in light and dark, with nothing open and with each part open; calm
       (tools/check-calm.js's probe) on the first screen.
   4 · Spanish: the menu speaks Spanish.
   No page errors. Port 9372. Run: node music-handoff/tests/rooms/compact.js */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9372, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
const FILE = { pads: "music-pads.html", kit: "music-kit.html", piano: "music-piano.html", guitar: "music-guitar.html", bass: "music-bass.html", band: "music-band.html", decks: "music-decks.html" };
/* the playing surface: every part of each list that is drawn must be wholly on the first screen (the kit and the strings play
   in their own whole-screen view on a phone on its side; that view is then the surface) */
const SURF = {
  pads: ["#pads"], kit: ["#sideKit, #pageKit"], piano: ["#kbd"], guitar: ["#neckBox"], bass: ["#neckBox"], band: ["#kbd"],
  decks: [".decks .deck .platter", "#xf"]
};
const IPH = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const IPAD = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const DEV = {
  "iPhone sideways": { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, userAgent: IPH },
  "iPad upright": { viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, userAgent: IPAD },
  "iPad sideways": { viewport: { width: 1180, height: 820 }, isMobile: true, hasTouch: true, userAgent: IPAD }
};
async function context(b, dev, theme) {
  const c = await b.newContext({ ...DEV[dev], colorScheme: theme });
  c.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message)));
  await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await c.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  await c.addInitScript(th => { try { localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
  return c;
}
/* open the Studio in a room, fresh, and wait until the room is in it */
async function open(c, id) {
  if (c.__p) await c.__p.close({ runBeforeUnload: false }).catch(() => {});
  const p = c.__p = await c.newPage();
  await p.goto(U + "the-studio#" + id, { waitUntil: "commit" });
  await p.waitForFunction(f => { const fr = document.getElementById("room"), d = fr && fr.contentDocument;
    return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && d.location.pathname.endsWith(f); }, FILE[id], { timeout: 60000 });
  await p.waitForTimeout(1800);
  return (await p.$("#room")).contentFrame();
}
const where = (f, groups) => f.evaluate(groups => {
  const vis = e => { const s = getComputedStyle(e), q = e.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && q.width > 2 && q.height > 2; };
  return groups.map(sel => { const els = [...document.querySelectorAll(sel)].filter(vis);
    return { sel, n: els.length, inside: els.length > 0 && els.every(e => { const q = e.getBoundingClientRect(); return q.top >= -1 && q.left >= -1 && q.bottom <= innerHeight + 1 && q.right <= innerWidth + 1; }),
      at: els.map(e => { const q = e.getBoundingClientRect(); return Math.round(q.top) + "–" + Math.round(q.bottom); }).join(",") }; });
}, groups);
const page = f => f.evaluate(() => ({ ih: innerHeight, screens: +(document.scrollingElement.scrollHeight / innerHeight).toFixed(2),
  wide: document.scrollingElement.scrollWidth > innerWidth + 1, y: scrollY,
  more: (() => { const s = document.getElementById("aogMoreSel"); return s ? { v: s.value, n: s.options.length, on: document.querySelectorAll("[data-aog-on]").length } : null; })() }));
/* what the menu can open, and whether that part shows */
const parts = f => f.evaluate(() => [...document.getElementById("aogMoreSel").options].map(o => [o.value, o.textContent]).filter(o => o[0]));
const shows = (f, k) => f.evaluate(k => {
  const vis = e => { const s = getComputedStyle(e), q = e.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && q.height > 2; };
  const els = [...document.querySelectorAll('[data-aog-sec="' + k + '"]')];
  return { all: els.length, on: els.filter(e => e.hasAttribute("data-aog-on")).length, seen: els.filter(vis).length,
    others: [...document.querySelectorAll("[data-aog-sec]")].filter(e => e.getAttribute("data-aog-sec") !== k && vis(e)).length };
}, k);
const pick = async (f, k) => { await f.selectOption("#aogMoreSel", k); await f.waitForTimeout(450); };

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* 1 · the instrument on the first screen */
  for (const dev of Object.keys(DEV)) {
    const c = await context(b, dev, "light");
    for (const id of Object.keys(FILE)) {
      const f = await open(c, id), w = await where(f, SURF[id]), pg = await page(f);
      ok(w.every(x => x.inside), `${dev}, ${id}: the thing you play is wholly on the first screen (${w.map(x => x.sel + " " + x.at).join("; ")} of ${pg.ih})`);
      if (dev.startsWith("iPad")) {
        ok(pg.screens <= 2 && !pg.wide && pg.y === 0, `${dev}, ${id}: the room is ${pg.screens} screens long (at most 2), nothing runs off sideways, it starts at the top`);
        ok(pg.more && pg.more.v === "" && pg.more.on === 0 && pg.more.n > 2, `${dev}, ${id}: More is there with nothing open on a first visit: ${JSON.stringify(pg.more)}`);
      }
      if (dev === "iPhone sideways") {
        const pk = await f.evaluate(`(${CALM})()`);
        ok(!pk.length && !pg.wide, `${dev}, ${id}: calm, nothing sideways (${pk.join("; ") || "ok"})`);
      }
    }
    await c.close();
  }

  /* 2, 3 · More and Any chord on an iPad sideways, readable in light and dark */
  for (const theme of ["light", "dark"]) {
    const c = await context(b, "iPad sideways", theme);
    for (const id of Object.keys(FILE)) {
      let f = await open(c, id);
      let pc = await f.evaluate(`(${PROBE})()`), pk = await f.evaluate(`(${CALM})()`);
      ok(!pc.length && !pk.length, `${theme}, ${id}: the first screen reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
      const list = await parts(f);
      for (const [k, name] of list) {
        await pick(f, k);
        const s = await shows(f, k);
        pc = await f.evaluate(`(${PROBE})()`);
        ok(s.on === s.all && s.seen > 0 && s.others === 0 && !pc.length, `${theme}, ${id}: More → ${name} opens it (${s.seen} of ${s.all} shown, nothing else) and it reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))})`);
      }
      await pick(f, "");
      const shut = await f.evaluate(() => [...document.querySelectorAll("[data-aog-sec]")].filter(e => getComputedStyle(e).display !== "none").length);
      ok(shut === 0 && list.length > 1, `${theme}, ${id}: Close folds every part away again (${list.length} parts in the menu)`);
      if (theme === "light") {
        /* the part you opened is open again after a reload; Close is remembered too */
        const k = list[list.length - 1][0];
        await pick(f, k); f = await open(c, id);
        let s = await shows(f, k), v = await f.evaluate(() => document.getElementById("aogMoreSel").value);
        ok(v === k && s.seen > 0, `${id}: after a reload ${k} is open again (${v})`);
        await pick(f, ""); f = await open(c, id);
        v = await f.evaluate(() => document.getElementById("aogMoreSel").value);
        ok(v === "" && (await page(f)).more.on === 0, `${id}: after Close and a reload, nothing is open`);
        if (/^(piano|guitar|bass|band)$/.test(id)) {
          const any = () => f.evaluate(() => { const r = document.getElementById("anyRoots"), b = document.getElementById("aogAnyBtn");
            return { shown: !!r && r.getBoundingClientRect().height > 2, exp: b && b.getAttribute("aria-expanded"), say: b && b.textContent.trim() }; });
          let a = await any();
          ok(!a.shown && a.exp === "false" && a.say === "Any chord", `${id}: Any chord is folded on a first visit: ${JSON.stringify(a)}`);
          await f.click("#aogAnyBtn"); await f.waitForTimeout(250); a = await any();
          const sr = await where(f, SURF[id]);
          ok(a.shown && a.exp === "true", `${id}: one tap opens Any chord's roots: ${JSON.stringify(a)} (the instrument then at ${sr[0].at})`);
          f = await open(c, id); a = await any();
          ok(a.shown, `${id}: Any chord stays open after a reload`);
          await f.click("#aogAnyBtn"); await f.waitForTimeout(250); a = await any();
          ok(!a.shown, `${id}: and folds again with one tap`);
        }
      }
    }
    await c.close();
  }

  /* 4 · Spanish */
  {
    const c = await context(b, "iPad sideways", "light");
    const f = await open(c, "guitar"), p = c.__p;
    await p.click('.sh-lang [data-lang="es"]'); await p.waitForTimeout(1500);
    const es = await f.evaluate(() => ({ l: document.querySelector("#aogMore .aog-more-l").textContent, first: document.getElementById("aogMoreSel").options[0].textContent,
      any: document.getElementById("aogAnyBtn").textContent.trim(), names: [...document.getElementById("aogMoreSel").options].map(o => o.textContent) }));
    ok(es.l === "Más" && es.first === "Elige…" && es.any === "Cualquier acorde" && es.names.indexOf("Cómo tocar") >= 0, "in Spanish: " + JSON.stringify(es));
    await p.click('.sh-lang [data-lang="en"]'); await p.waitForTimeout(500);
    await c.close();
  }

  ok(!errs.length, "no page errors" + (errs.length ? ": " + errs.slice(0, 4).join(" | ") : ""));
  await b.close(); srv.close();
  console.log(fails ? fails + " failed" : "all passed");
  process.exit(fails ? 1 : 0);
})();
