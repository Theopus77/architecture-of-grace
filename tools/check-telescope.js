#!/usr/bin/env node
/* AOG TELESCOPE CHECK — Jimmy (2026-10-12): "a quantum leap forward … a BIG LEAP" in the Telescope. The Telescope
   (telescope.html, /telescope) now works out the real sky (aog-telescope-astro.js), reads a star catalog
   (aog-telescope-catalog.js, data/sky/), shows a star map (aog-telescope-map.js) and draws the eyepiece as it really
   looks tonight (aog-telescope-real.js), with four telescopes, the air and the sky glow. A change could quietly make it
   teach something wrong, or make the plain eyepiece slow. This checks:
     · the astronomy against published values (each one cited below),
     · every one of the bench's original targets still draws, with no errors,
     · silent until used: the catalog and the map load only when the star map or "Real sky" is opened; nothing asks
       for animation frames while idle; stars never twinkle on their own; leaving the map lets WebGL go,
     · the star map: it opens, finds things, shows a card, "Point the telescope" turns once and opens the eyepiece
       on it (instant with reduce motion), an object below the horizon says when it rises, "Use my location" is asked
       only when tapped, a typed place is checked,
     · the four telescopes, the air and the sky glow change what the eyepiece can show, truthfully,
     · iPhone and iPad, English and Spanish, no sideways scroll.
       node tools/check-telescope.js            (add --shots DIR to save pictures of the views)
   Exit code 1 when anything fails. Run it after any change to telescope.html or aog-telescope-*.js. */
const path = require("path"), fs = require("fs"), http = require("http"), cp = require("child_process");
let pw; try { pw = require("playwright"); } catch (e) { pw = require(cp.execSync("npm root -g").toString().trim() + "/playwright"); }
const ROOT = path.join(__dirname, "..", "aog-deploy");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".webp": "image/webp", ".jpg": "image/jpeg", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split("?")[0].split("#")[0]);
  let f = path.join(ROOT, u);
  if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html";
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r);
});
const SHOTS = (() => { const i = process.argv.indexOf("--shots"); return i > 0 ? process.argv[i + 1] : null; })();
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fails++; };
const wait = ms => new Promise(o => setTimeout(o, ms));
const TD = 69.2e3;                                   /* ΔT: Meeus's examples are in dynamical time */

/* ── 1. the astronomy, straight from the engine (it runs in Node too) ── */
function astronomy() {
  const A = require(path.join(ROOT, "aog-telescope-astro.js"));
  const at = (y, mo, d, h, mi, lat, lon) => A.at(Date.UTC(y, mo - 1, d, h, mi || 0), lat || 0, lon || 0);
  /* Meeus, Astronomical Algorithms (2nd ed.), Example 47.a: the Moon on 1992 April 12, 0h TD:
     geometric longitude 133.162655°, latitude −3.229126°, distance 368409.7 km */
  const m = A.moonEcliptic((2448724.5 - 2451545) / 36525);
  ok(Math.abs(m.lam - 133.162655) < 0.01 && Math.abs(m.bet + 3.229126) < 0.01 && Math.abs(m.dist - 368409.7) < 50,
    `the Moon's place (Meeus Ex. 47.a): λ ${m.lam.toFixed(3)}°, β ${m.bet.toFixed(3)}°, ${Math.round(m.dist)} km`);
  /* Meeus Example 53.a: the optical libration on 1992 April 12, 0h TD: l′ = −1.206°, b′ = +4.194° */
  let c = A.at(Date.UTC(1992, 3, 12) - TD, 0, 0), mo = A.moon(c);
  ok(Math.abs(mo.libL + 1.206) < 0.1 && Math.abs(mo.libB - 4.194) < 0.1, `the Moon's libration (Meeus Ex. 53.a): l ${mo.libL.toFixed(2)}°, b ${mo.libB.toFixed(2)}°`);
  /* a known full Moon: 2024 January 25, 17:54 UTC (USNO). A known new Moon: the total solar eclipse of 2024 April 8,
     total over Carbondale, Illinois at about 18:59 UTC — the Moon sits on the Sun. */
  c = at(2024, 1, 25, 17, 54); const full = A.moon(c).illum;
  c = A.at(Date.UTC(2024, 3, 8, 18, 59), 37.73, -89.22); const sep = A.angle(A.moon(c).v, A.sun(c).v) * 60, newk = A.moon(c).illum;
  ok(full > 0.99 && newk < 0.01 && sep < 5, `Moon phase: full on 2024 Jan 25 (${(full * 100).toFixed(1)}% lit); the 2024 eclipse over Carbondale: Moon on the Sun (${sep.toFixed(1)}′ apart, ${(newk * 100).toFixed(2)}% lit)`);
  /* the Sun at noon on the March equinox (2024 March 20) at 40°N stands 90° − 40° = 50° up */
  const e = A.events(Date.UTC(2024, 2, 20), 40, 0, "sun");
  ok(Math.abs(e.maxAlt - 50) < 0.6, `noon Sun on the equinox at 40°N: ${e.maxAlt.toFixed(2)}° up (about 50°)`);
  /* Meeus Example 25.a: the Sun on 1992 October 13, 0h TD: RA 198.38083°, Dec −7.78507° (of date; J2000 differs ≤ 0.15°) */
  c = A.at(Date.UTC(1992, 9, 13) - TD, 0, 0); const s = A.sun(c);
  ok(Math.abs(s.ra - 198.38083) < 0.3 && Math.abs(s.dec + 7.78507) < 0.3, `the Sun (Meeus Ex. 25.a): RA ${s.ra.toFixed(2)}°, Dec ${s.dec.toFixed(2)}°`);
  /* Meeus Example 33.a: Venus on 1992 December 20, 0h TD: RA 21h04m41.5s = 316.173°, Dec −18°53′17″ = −18.888°;
     Example 41.a: lit fraction 0.647 */
  c = A.at(Date.UTC(1992, 11, 20) - TD, 0, 0); const v = A.planet(c, "venus");
  ok(Math.abs(v.ra - 316.173) < 1 && Math.abs(v.dec + 18.888) < 1 && Math.abs(v.illum - 0.647) < 0.01,
    `Venus (Meeus Ex. 33.a, 41.a): RA ${v.ra.toFixed(2)}°, Dec ${v.dec.toFixed(2)}°, ${(v.illum * 100).toFixed(1)}% lit`);
  /* Meeus Example 44.a: Jupiter's moons on 1992 December 16, 0h UT (low accuracy): X −3.44 +7.44 +1.24 +7.08;
     Y +0.21 +0.25 +0.65 +1.10 (Jupiter radii) */
  const jm = A.jupiterMoons(2448972.5), WX = [-3.44, 7.44, 1.24, 7.08], WY = [0.21, 0.25, 0.65, 1.10];
  ok(jm.every((q, i) => Math.abs(q.X - WX[i]) < 0.05 && Math.abs(q.Y - WY[i]) < 0.05), `Jupiter's four moons (Meeus Ex. 44.a): X ${jm.map(q => q.X.toFixed(2)).join(" ")}`);
  /* Meeus Example 45.a: Saturn's rings on 1992 December 16, 0h TD: B = 16.442°; and edge-on (B ≈ 0) on 2025 March 23 */
  c = A.at(Date.UTC(1992, 11, 16) - TD, 0, 0); const B = A.planet(c, "saturn").ringB;
  c = at(2025, 3, 23, 12); const B0 = A.planet(c, "saturn").ringB;
  ok(Math.abs(B - 16.442) < 0.3 && Math.abs(B0) < 0.5, `Saturn's ring tilt (Meeus Ex. 45.a): ${B.toFixed(2)}°; edge-on in March 2025: ${B0.toFixed(2)}°`);
  /* the great conjunction of 2020 December 21: Jupiter and Saturn 6.1′ apart (about 18h UT) */
  c = at(2020, 12, 21, 18); const gc = A.angle(A.planet(c, "jupiter").v, A.planet(c, "saturn").v) * 60;
  ok(Math.abs(gc - 6.1) < 1.5, `the great conjunction of 2020: Jupiter and Saturn ${gc.toFixed(1)}′ apart (6.1′)`);
  /* Mars at its closest on 2025 January 12: 0.642 AU, 14.6″ across */
  c = at(2025, 1, 12, 0); const md = A.planet(c, "mars").diam;
  ok(Math.abs(md - 14.6) < 0.3, `Mars's size by distance: ${md.toFixed(1)}″ on 2025 Jan 12 (14.6″)`);
  return A;
}

/* a page with a fixed place and time (Chicago unless told), a frame counter and a location counter */
function initScript(o) {
  o = o || {};
  const place = { city: o.city || "chicago", name: o.name || "Chicago, Illinois", lat: o.lat || 41.88, lon: o.lon || -87.63, tz: "America/Chicago", mode: o.ms ? "set" : "now", ms: o.ms || 0, view: o.view || null };
  return `(() => {
    try {
      ${o.keep ? "" : `localStorage.clear();`}
      localStorage.setItem("scope.place.v1", ${JSON.stringify(JSON.stringify(place))});
      localStorage.setItem("scope.sky.v1", ${JSON.stringify(JSON.stringify(Object.assign({ teacher: "open" }, o.lang ? { lang: o.lang } : {})))});
      localStorage.setItem("scope.optics.v1", ${JSON.stringify(JSON.stringify(Object.assign({ scope: "r90", seeing: "avg", bortle: 4 }, o.opt || {})))});
    } catch (e) {}
    window.__raf = 0; const r = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = f => { window.__raf++; return r(f); };
    window.__geo = 0;
    try { if (navigator.geolocation) { const g = navigator.geolocation; g.getCurrentPosition = (ok, no) => { window.__geo++; ok({ coords: { latitude: 40.1164, longitude: -88.2434 } }); }; } } catch (e) {}
  })();`;
}

(async () => {
  console.log("── the astronomy ──");
  const A = astronomy();
  await new Promise(o => server.listen(0, o)); const port = server.address().port, BASE = `http://127.0.0.1:${port}/telescope.html`;
  const b = await pw.chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });   // WebGL for the star map
  async function open(vp, touch, hash, o, extra) {
    const ctx = await b.newContext(Object.assign({ viewport: vp, isMobile: !!touch, hasTouch: !!touch, timezoneId: "America/Chicago" }, extra || {}));
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
    await ctx.addInitScript(initScript(o));
    const p = await ctx.newPage(); p.errs = [];
    p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) p.errs.push(m.text()); });
    await p.goto(BASE + (hash ? "#" + hash : ""), { waitUntil: "load" }); await wait(600);
    return p;
  }
  const files = p => p.evaluate(() => performance.getEntriesByType("resource").map(e => e.name));
  const SKYFILES = /aog-telescope-(astro|catalog|real|map)\.js|stars\.bin|sky\.json|milkyway\.png/;
  const focus = p => p.evaluate(() => { for (let k = 0; k <= 100; k++) { S.lab.coarse = k; S.lab.fine = 50; if (focusBand(S.lab) === "in") break; } paint(); });
  /* how much of the eyepiece is lit (0…1), read from the canvas */
  const lit = p => p.evaluate(() => { const c = document.getElementById("eyecanvas"); if (!c) return -1; const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let n = 0, all = 0; for (let i = 0; i < d.length; i += 16) { all++; if (d[i] + d[i + 1] + d[i + 2] > 60) n++; } return n / all; });
  const shot = async (p, sel, name) => { if (!SHOTS) return; const el = sel ? await p.$(sel) : null; await (el || p).screenshot({ path: path.join(SHOTS, name + ".png") }); };

  /* ── 2. the plain bench: as fast as before, every original target draws ── */
  console.log("── the bench ──");
  let p = await open({ width: 1280, height: 900 }, false, "lab", { lab: { cap: false, locked: true, ep: 25, target: "moon", sky: "night", coarse: 42, fine: 50, eyeTwist: 22, panX: 0, panY: 0 } });
  await wait(1500);
  ok(!(await files(p)).some(u => SKYFILES.test(u)), "the plain eyepiece loads no star catalog, no sky engine and no map");
  const r0 = await p.evaluate(() => window.__raf); await wait(2500);
  ok(await p.evaluate(() => window.__raf) === r0 && await p.evaluate(() => TWINKLE === false), "the eyepiece asks for no frames while idle, and the stars do not twinkle on their own");
  const TARGETS = ["moon", "sea", "jupiter", "saturn", "mars", "venus", "uranus", "orion", "pleiades", "dcluster", "andromeda", "m13", "ring", "m27", "mizar", "albireo", "split", "pair", "sun"];
  const bad = [];
  for (const t of TARGETS) {
    await p.evaluate(t => { const L = S.lab; L.target = t; L.cap = false; L.filter = t === "sun"; L.ep = ["jupiter", "saturn", "mars", "venus", "uranus", "ring", "split", "pair", "mizar"].includes(t) ? 6 : 25; L.barlow = false; L.sky = "night"; L.locked = true; centerTarget(t); }, t);
    await focus(p); await wait(250);
    const v = await lit(p); if (!(v > 0.0004)) bad.push(t + " " + v.toFixed(4));
  }
  ok(!bad.length && !p.errs.length, `all ${TARGETS.length} original targets draw in the eyepiece` + (bad.length ? " — dark: " + bad.join(", ") : "") + (p.errs.length ? " — " + p.errs[0] : ""));
  /* the lessons still open their controls: every lesson card has its buttons */
  const lessons = await p.evaluate(() => { const out = []; for (let i = 0; i < STAIR.length; i++) { setLessonPick(i); paint(); const n = document.querySelectorAll("#lessons [data-act]").length; if (!n) out.push(i + 1); } setLessonPick(0); paint(); return { n: STAIR.length, empty: out }; });
  ok(lessons.n >= 36 && !lessons.empty.length, `all ${lessons.n} lessons still show their buttons at the eyepiece` + (lessons.empty.length ? " — none on " + lessons.empty.join(", ") : ""));

  /* ── 3. the four telescopes, the air and the sky glow ── */
  console.log("── telescopes, air, sky glow ──");
  const optics = await p.evaluate(() => {
    const out = {}, L = S.lab;
    Object.assign(L, { target: "m13", ep: 10, barlow: false, cap: false, filter: false, locked: true }); centerTarget("m13");
    const count = () => { let n = 0; const real = window.airy; window.airy = function (c, x, y, m, col) { if (m + AIRY_SHIFT * (m > 3 ? 1 : 0.4) < 12.6) n++; return real.apply(this, arguments); };
      for (let k = 0; k <= 100; k++) { L.coarse = k; L.fine = 50; if (focusBand(L) === "in") break; } paint(); requestEye(); return new Promise(o => setTimeout(() => { window.airy = real; o(n); }, 400)); };
    return (async () => {
      for (const sc of ["r90", "n130", "d200", "obs"]) { OPT.scope = sc; setScope(); out[sc] = { mm: SCOPE.mm, dawes: SCOPE.dawes, lim: limitMag(), mag: magOf(L), note: fieldNote() }; }
      OPT.scope = "r90"; setScope();
      OPT.bortle = 1; out.dark = { lim: limitMag(), stars: await count(), note: fieldNote() };
      OPT.bortle = 9; out.city = { lim: limitMag(), stars: await count(), note: fieldNote() };
      OPT.bortle = 4; out.base = await count();
      OPT.seeing = "steady"; setScope(); out.steady = SCOPE.seeing; OPT.seeing = "shaky"; setScope(); out.shaky = SCOPE.seeing; OPT.seeing = "avg"; setScope();
      return out;
    })();
  });
  ok(Math.abs(optics.r90.lim - 11.6) < 0.1 && optics.d200.lim > optics.r90.lim + 1.5 && optics.obs.lim > optics.d200.lim + 2,
    `bigger glass shows fainter stars: 90 mm to magnitude ${optics.r90.lim.toFixed(1)}, 8-inch ${optics.d200.lim.toFixed(1)}, 1 m ${optics.obs.lim.toFixed(1)}`);
  ok(Math.abs(optics.r90.dawes - 1.29) < 0.01 && Math.abs(optics.d200.dawes - 0.571) < 0.01 && optics.obs.mag === 8000 / 10,
    `bigger glass splits finer (Dawes 116 ÷ mm): 90 mm ${optics.r90.dawes.toFixed(2)}″, 8-inch ${optics.d200.dawes.toFixed(2)}″; the 1 m with the 10 mm is ${optics.obs.mag}×`);
  ok(/120×/.test(optics.d200.note) && /800×/.test(optics.obs.note) && /bigger, not sharper|air, not the glass/.test(optics.obs.note), "each telescope's note does its own sums, and past its useful power the big one says it gets bigger, not sharper");
  ok(optics.dark.stars > optics.base && optics.base > optics.city.stars && optics.dark.lim > optics.city.lim + 3 && /City sky/.test(optics.city.note),
    `the sky glow is honest: M13's field shows ${optics.dark.stars} stars under the darkest sky, ${optics.base} at the edge of the country, ${optics.city.stars} in the inner city`);
  ok(optics.steady < 1.6 && optics.shaky > 1.6, `the air: steady ${optics.steady}″, shaky ${optics.shaky}″ of blur`);
  await p.context().close();

  /* ── 4. the star map: on demand, still, and let go ── */
  console.log("── the star map ──");
  const DEC = Date.UTC(2026, 11, 16, 3, 0);            /* 9 PM in Chicago, 2026 December 15: Orion is up in the east */
  p = await open({ width: 1280, height: 900 }, false, "home", { ms: DEC, view: { az: 120, alt: 35, fov: 90 } });
  ok(!(await files(p)).some(u => SKYFILES.test(u)), "the welcome page loads none of the sky");
  await p.evaluate(() => { location.hash = "#sky"; });
  await p.waitForFunction(() => window.AOGMap && window.AOGMap.isOpen() && +(document.querySelector(".sky-stage") || { dataset: {} }).dataset.renders > 0, null, { timeout: 20000 });
  await wait(1200);
  const f2 = await files(p);
  ok(/stars\.bin/.test(f2.join(" ")) && /aog-telescope-map\.js/.test(f2.join(" ")), "opening the star map loads the catalog and the map");
  const st = await p.evaluate(() => ({ gl: !!window.AOGMap.state().gl, n: window.AOGSkyData.data().n, cons: window.AOGSkyData.data().con.length, dso: window.AOGSkyData.data().dso.length }));
  ok(st.gl && st.n > 8000 && st.cons >= 88 && st.dso > 100, `the map draws with WebGL: ${st.n} stars, ${st.cons} constellations, ${st.dso} deep-sky objects`);
  /* Polaris stands as high as you are far north (Chicago 41.88°N) */
  const pol = await p.evaluate(() => { const K = window.AOGSkyData, A = window.AOGAstro, i = K.data().hip[11767], c = A.at(K.now(), 41.88, -87.63); return A.horiz(c, K.starVec(i)).alt; });
  ok(Math.abs(pol - 41.88) < 1.2, `Polaris is ${pol.toFixed(1)}° up from Chicago (latitude 41.9°)`);
  /* Orion: Betelgeuse up in the east at 9 PM in mid-December */
  const ori = await p.evaluate(() => { const K = window.AOGSkyData, A = window.AOGAstro, i = K.data().hip[27989], c = A.at(K.now(), K.ST.lat, K.ST.lon), h = A.horiz(c, K.starVec(i)); return { alt: h.alt, az: h.az, name: K.name("star:" + i, "en") }; });
  ok(ori.alt > 10 && ori.alt < 40 && ori.az > 70 && ori.az < 120, `${ori.name} is ${ori.alt.toFixed(0)}° up at azimuth ${ori.az.toFixed(0)}° (east) at 9 PM on December 15 in Chicago`);
  await shot(p, ".sky-stage", "map-orion-chicago");
  const idle = await p.evaluate(() => [window.__raf, +document.querySelector(".sky-stage").dataset.renders]); await wait(2500);
  const idle2 = await p.evaluate(() => [window.__raf, +document.querySelector(".sky-stage").dataset.renders]);
  ok(idle[0] === idle2[0] && idle[1] === idle2[1], "the map is still while nobody touches it (no frames asked, nothing redrawn)");
  ok(await p.evaluate(() => window.__geo) === 0, "the map never asks for your location on its own");
  const tn = await p.evaluate(() => [...document.querySelectorAll(".sky-tonight [data-go]")].map(b => b.textContent));
  ok(tn.length >= 5 && tn.some(x => /Moon|Saturn|Pleiades/.test(x)), `"Up after dark" lists what is up: ${tn.slice(0, 5).join(", ")}`);
  /* drag the sky: it turns, and redraws only while moving */
  const box = await (await p.$(".sky-stage")).boundingBox();
  const az0 = await p.evaluate(() => window.AOGMap.state().az);
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down(); await p.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2, { steps: 6 }); await p.mouse.up(); await wait(300);
  ok(Math.abs(await p.evaluate(() => window.AOGMap.state().az) - az0) > 5, "dragging the map turns the sky");
  /* Find → a card → Point the telescope: one turn, then the eyepiece on it */
  await p.selectOption(".sky-find", "saturn"); await wait(300);
  const card = await p.evaluate(() => { const c = document.querySelector(".sky-card"); return c && !c.hidden ? c.textContent : ""; });
  ok(/Saturn/.test(card) && /Point the telescope/.test(card) && /Sets/.test(card), "Find picks Saturn and its card says where it is and when it sets");
  await p.click(".sky-point");
  const animated = await p.evaluate(() => !!(window.AOGMap.state() && window.AOGMap.state().anim));
  await p.waitForFunction(() => location.hash === "#lab", null, { timeout: 8000 }); await wait(900);
  const after = await p.evaluate(() => ({ t: S.lab.target, real: OPT.real, released: window.AOGMap.released || 0, open: window.AOGMap.isOpen() }));
  ok(animated && after.t === "saturn" && after.real, "Point the telescope turns the map once and opens the eyepiece on Saturn, in the real sky");
  ok(after.released >= 1 && !after.open, "leaving the map lets WebGL go");
  await focus(p); await wait(500);
  const sat = await p.evaluate(() => ({ note: fieldNote(), line: (document.querySelector(".realline") || {}).textContent || "" }));
  ok(/tipped/.test(sat.note) && /Saturn: \d+° up/.test(sat.line), `the eyepiece shows tonight's Saturn: "${sat.line.replace(" Star map ›", "")}"`);
  ok(!p.errs.length, "no errors on the map" + (p.errs.length ? " — " + p.errs[0] : ""));
  await p.context().close();

  /* reduce motion: pointing is instant */
  p = await open({ width: 1280, height: 900 }, false, "sky", { ms: DEC }, { reducedMotion: "reduce" });
  await p.waitForFunction(() => window.AOGMap && window.AOGMap.isOpen(), null, { timeout: 20000 });
  const still = await p.evaluate(() => { window.AOGMap.pointAt("jupiter"); return !window.AOGMap.state() || !window.AOGMap.state().anim; });
  await p.waitForFunction(() => location.hash === "#lab", null, { timeout: 5000 });
  ok(still, "with reduce motion, pointing jumps straight there (no moving turn)");
  await p.context().close();

  /* below the horizon: the eyepiece says when it rises; a place can be picked, typed, or (only when tapped) asked for */
  p = await open({ width: 1280, height: 900 }, false, "sky", { ms: Date.UTC(2026, 11, 16, 18, 0) });   /* noon in Chicago */
  await p.waitForFunction(() => window.AOGMap && window.AOGMap.isOpen(), null, { timeout: 20000 });
  const sid = await p.evaluate(() => { const K = window.AOGSkyData, A = window.AOGAstro, c = A.at(K.now(), K.ST.lat, K.ST.lon); return ["dso:M42", "dso:M45", "jupiter", "saturn", "dso:M31"].find(id => A.horiz(c, K.vec(c, id)).alt < -5); });
  await p.selectOption(".sky-city", "springfield"); await wait(200);
  ok(/Springfield/.test(await p.textContent(".sky-when")), "picking a city moves the sky there (Springfield, Illinois)");
  await p.click(".sky-typed summary"); await p.fill(".sky-lat", "123"); await p.click(".sky-use");
  ok(/−90|-90/.test(await p.textContent(".sky-locmsg")), "a latitude past 90° is turned down with a plain message");
  await p.fill(".sky-lat", "40.11"); await p.fill(".sky-lon", "-88.24"); await p.click(".sky-use");
  ok(await p.evaluate(() => Math.abs(window.AOGSkyData.ST.lat - 40.11) < 1e-6), "a typed latitude and longitude are used");
  await p.click(".sky-loc"); await wait(200);
  ok(await p.evaluate(() => window.__geo) === 1, "Use my location asks only when tapped");
  await p.evaluate(id => window.AOGMap.pointAt(id), sid);
  await p.waitForFunction(() => location.hash === "#lab", null, { timeout: 8000 }); await wait(800);
  const below = await p.evaluate(() => fieldNote());
  ok(/below the horizon/.test(below) && /rises at|does not rise/.test(below), `an object below the horizon says so: "${below}"`);
  await p.context().close();

  /* the real eyepiece: the Moon tonight, Jupiter with its moons; the bench's own targets still draw in the real sky */
  console.log("── the real eyepiece ──");
  const realEye = async (target, ep, ms, opt, name) => {
    const q = await open({ width: 1280, height: 900 }, false, "lab", { ms, opt: Object.assign({ real: true }, opt || {}), lab: { cap: false, locked: true, ep, target, sky: "night", coarse: 42, fine: 50, eyeTwist: 22, panX: 0, panY: 0 } });
    await q.waitForFunction(() => window.AOGReal && window.AOGSkyData && window.AOGSkyData.ready(), null, { timeout: 20000 });
    await q.evaluate(([t, ep]) => { Object.assign(S.lab, { cap: false, locked: true, ep, target: t, barlow: false, filter: false, sky: "night" }); centerTarget(t); }, [target, ep]); await focus(q); await wait(700);
    const out = { lit: await lit(q), note: await q.evaluate(() => fieldNote()), errs: q.errs.slice() };
    await shot(q, ".eye-wrap", name); await q.context().close(); return out;
  };
  const moon = await realEye("moon", 25, Date.UTC(2026, 11, 16, 0, 0), {}, "eye-moon-tonight");
  ok(moon.lit > 0.05 && /% lit/.test(moon.note) && !moon.errs.length, "the Moon tonight: its real phase and libration (" + (moon.note.match(/\d+% lit \([^)]*\)/) || [""])[0] + ")" + (moon.errs[0] ? " — " + moon.errs[0] : ""));
  const jup = await realEye("jupiter", 10, Date.UTC(2026, 11, 16, 10, 0), {}, "eye-jupiter-moons");
  ok(jup.lit > 0.0005 && /Io, Europa/.test(jup.note) && !jup.errs.length, "Jupiter with its four moons where they are tonight");
  await realEye("saturn", 6, Date.UTC(2026, 11, 16, 1, 0), { scope: "d200", seeing: "steady" }, "eye-saturn-8inch");
  for (const b of [1, 9]) await realEye("orion", 25, Date.UTC(2026, 11, 16, 6, 0), { bortle: b }, "eye-orion-bortle" + b);
  const q = await open({ width: 1280, height: 900 }, false, "lab", { ms: Date.UTC(2026, 11, 16, 6, 0), opt: { real: true }, lab: { cap: false, locked: true, ep: 25, target: "moon", sky: "night", coarse: 42, fine: 50, panX: 0, panY: 0 } });
  await q.waitForFunction(() => window.AOGReal && window.AOGSkyData && window.AOGSkyData.ready(), null, { timeout: 20000 });
  const realBad = [];
  for (const t of TARGETS) {
    await q.evaluate(t => { const L = S.lab; L.target = t; L.cap = false; L.locked = true; L.barlow = false; L.filter = t === "sun"; L.ep = 25; centerTarget(t); }, t); await focus(q); await wait(150);
    const v = await lit(q), n = await q.evaluate(() => fieldNote());
    if (!(v > 0.0004) && !/horizon|Sun is up/.test(n)) realBad.push(t);
  }
  ok(!realBad.length && !q.errs.length, `in the real sky every original target draws, or says it is below the horizon` + (realBad.length ? " — dark: " + realBad.join(", ") : "") + (q.errs[0] ? " — " + q.errs[0] : ""));
  await q.context().close();

  /* ── 5. phones and tablets, English and Spanish ── */
  console.log("── iPhone and iPad ──");
  for (const [name, vp] of [["iPhone", { width: 390, height: 844 }], ["iPad", { width: 820, height: 1180 }]]) {
    for (const lang of ["en", "es"]) {
      const ph = await open(vp, true, "sky", { ms: DEC, lang });
      await ph.waitForFunction(() => window.AOGMap && window.AOGMap.isOpen(), null, { timeout: 20000 }); await wait(500);
      const r = { sky: await ph.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1) };
      const words = await ph.textContent(".skypage");
      r.words = lang === "es" ? /Esta noche/.test(words) && /Buscar/.test(words) : /Tonight/.test(words) && /Find/.test(words);
      r.touch = await ph.evaluate(() => getComputedStyle(document.querySelector(".sky-stage")).touchAction === "none");
      await shot(ph, null, `map-${name}-${lang}`);
      for (const h of ["lab", "home"]) { await ph.evaluate(h => { location.hash = "#" + h; }, h); await wait(500); r[h] = await ph.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1); }
      ok(r.sky && r.lab && r.home && r.words && r.touch && !ph.errs.length, `${name} ${lang.toUpperCase()}: map, eyepiece and bench fit with no sideways scroll; a finger on the sky turns the sky` + (ph.errs[0] ? " — " + ph.errs[0] : ""));
      await ph.context().close();
    }
  }

  await b.close(); server.close();
  console.log(fails ? `\n${fails} check(s) failed.` : "\nThe telescope passes.");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
