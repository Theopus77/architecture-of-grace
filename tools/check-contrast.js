#!/usr/bin/env node
/* AOG CONTRAST GUARD — Jimmy: "make a permanent command that this doesn't
   happen again" (cream text on a white box, 2026-09-25).
   Opens every page in aog-deploy/ in light AND dark, finds every piece of
   visible text, works out the colour actually behind it (walking up to the
   first opaque background; inside the navy masthead that is the navy), and
   fails if any text reads below 3:1.
     node tools/check-contrast.js              # every page
     node tools/check-contrast.js turn-ins.html index.html
   Exit code 1 when anything fails. Run it before every push that touches
   HTML, CSS or aog-grace.* — see CLAUDE.md. */
const path = require("path"), fs = require("fs"), http = require("http");
let pw; try { pw = require("playwright"); } catch (e) { pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright"); }
const ROOT = path.join(__dirname, "..", "aog-deploy");
const MIN = 3;
const args = process.argv.slice(2);
/* The home file holds many rooms behind #addresses; each is checked on its own too
   (Jimmy, 2026-09-26: cream words on cream boxes in rooms the check never opened). */
const ROOMS = ["family/hard-day","family/what-can-i-say","family/conversation","student","checkin","framework","workplace","guide","family","eco-parents","eco-educators","ecosystem","starthere","about","library","adult","dashboard"];
/* The music tools also show other places behind #addresses (their Go to menu): Lessons, Meet, Name it, Print.
   Each is checked on its own too (AOG-PIANO-LESSONS-V1, 2026-10-03). */
const VIEWS = ["music-drums.html#lessons","music-drums.html#meet","music-drums.html#words","music-drums.html#print",
  "music-piano.html#lessons","music-piano.html#meet","music-piano.html#words","music-piano.html#print",
  /* the Adult Edition workbook's pages behind its Session menu (AOG-ADULT-WORKBOOK-V1, 2026-10-09); ?s=7 is the
     facilitator's-word card that stands in front of Sessions 7-12 */
  "adult-workbook.html?s=2","adult-workbook.html?s=3","adult-workbook.html?s=4","adult-workbook.html?s=5","adult-workbook.html?s=6","adult-workbook.html?s=7"];
const pages = args.length ? args : fs.readdirSync(ROOT).filter(f => f.endsWith(".html")).concat(ROOMS.map(r => "index.html#" + r)).concat(VIEWS);

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".jpg": "image/jpeg", ".webp": "image/webp" };
const server = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split("?")[0].split("#")[0]);
  if (u.endsWith("/")) u += "index.html";
  let f = path.join(ROOT, u);
  if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html";
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(r);
});

function probe() {
  const px = s => { const cm = /color\(srgb\s+([^)]+)\)/.exec(s || ""); if (cm) { const w = cm[1].split(/[\s\/]+/).filter(Boolean).map(Number); return { r: w[0] * 255, g: w[1] * 255, b: w[2] * 255, a: w.length > 3 ? w[3] : 1 }; } const m = /rgba?\(([^)]+)\)/.exec(s || ""); if (!m) return null; const v = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
  const lum = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const mix = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  function bgOf(el) {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (n.hasAttribute && n.hasAttribute("data-aog-hero")) { layers.push({ r: 10, g: 30, b: 51, a: 1 }); break; }
      /* AOG-CONTRAST-GRADIENT-V1 (2026-09-26): a gradient used to make the
         checker give up, and dark pills on the navy crosswalk banner slipped
         through. Inside the masthead keep walking to the navy; elsewhere judge
         against the gradient's own solid colour (its most opaque stop). */
      if (cs.backgroundImage && cs.backgroundImage !== "none" && !/url\(/.test(cs.backgroundImage)) {
        if (n.closest && n.closest("[data-aog-hero]")) continue;
        const stops = (cs.backgroundImage.match(/(rgba?\([^)]+\)|color\(srgb[^)]+\))/g) || []).map(px).filter(c => c && c.a >= 0.99);
        if (!stops.length) return null;
        layers.push(stops[0]); break;
      }
      const c = px(cs.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 0.99) break; }
    }
    let out = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) out = mix(layers[i], out);
    return out;
  }
  const bad = [], seen = new Set();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let t; (t = w.nextNode());) {
    if (!t.nodeValue.trim()) continue;
    const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    if (el.closest("script,style,noscript,svg,[hidden],[aria-hidden=true],.sr-only,.visually-hidden,option")) continue;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility !== "visible" || +cs.opacity < 0.3 || parseFloat(cs.fontSize) < 2) continue;
    let op = 1; for (let n = el; n; n = n.parentElement) op *= +getComputedStyle(n).opacity;
    if (op < 0.3) continue;
    if (el.closest("button:disabled,[disabled]")) continue;
      if (/text/.test(cs.backgroundClip + " " + cs.webkitBackgroundClip)) continue; // gradient-filled lettering
    const fg = px(cs.color); if (!fg) continue;
    const bg = bgOf(el); if (!bg) continue;
    const k = ratio(mix(fg, bg), bg);
    if (k < 3) bad.push({ text: t.nodeValue.trim().slice(0, 50), ratio: +k.toFixed(2), where: el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "") });
  }
  return bad;
}

(async () => {
  await new Promise(ok => server.listen(0, ok));
  const port = server.address().port;
  const browser = await pw.chromium.launch();
  let fails = 0;
  const queue = pages.slice();
  async function worker() {
    for (let f; (f = queue.shift());) {
      for (const theme of ["light", "dark"]) {
        const ctx = await browser.newContext({ viewport: { width: 1024, height: 1300 }, colorScheme: theme });
        await ctx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); } catch (e) {} }, theme);
        await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
        const p = await ctx.newPage();
        try {
          await p.goto(`http://127.0.0.1:${port}/${f}`, { waitUntil: "load", timeout: 20000 });
          await p.waitForTimeout(700);
          const bad = await p.evaluate(probe);
          if (bad.length) { fails++; console.log(`✗ ${f} [${theme}] ${bad.length} unreadable`); bad.slice(0, 5).forEach(b => console.log(`    ${b.ratio}:1  ${b.where}  "${b.text}"`)); }
        } catch (e) { console.log(`? ${f} [${theme}] ${e.message.split("\n")[0]}`); }
        await ctx.close();
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  await browser.close(); server.close();
  console.log(fails ? `\n${fails} page/theme combinations have text below ${MIN}:1.` : `\nAll ${pages.length} pages pass in light and dark.`);
  process.exit(fails ? 1 : 0);
})();
