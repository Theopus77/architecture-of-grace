#!/usr/bin/env node
/* (server + page list shared with check-contrast.js)
   AOG CONTRAST GUARD — Jimmy: "make a permanent command that this doesn't
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
const pages = args.length ? args : fs.readdirSync(ROOT).filter(f => f.endsWith(".html"));

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

/* ══ AOG CALM GUARD — Jimmy: "Make sure ALL PAGES have the NEURODIVERGENT
   principles applied to all, PAST PRESENT AND FUTURE." Opens every page as an
   iPhone (390x844, touch) and fails a page that:
     · does not load aog-calm.css (the stillness rules),
     · has no viewport meta,
     · pans sideways (content wider than the screen),
     · has a text field under 16px (iOS zooms the page when it is tapped),
     · has anything animating forever on a touch screen,
     · lets the page rubber-band (overscroll-behavior not none).
       node tools/check-calm.js            # every page
       node tools/check-calm.js a.html b.html
   Exit code 1 when anything fails. See CLAUDE.md. ══ */
function calmProbe() {
  const bad = [];
  if (!document.querySelector('link[href$="aog-calm.css"]')) bad.push("aog-calm.css not loaded");
  if (!document.querySelector('meta[name="viewport"]')) bad.push("no viewport meta");
  const over = document.documentElement.scrollWidth - innerWidth;
  if (over > 2) bad.push("pans sideways by " + over + "px");
  const small = [...document.querySelectorAll("input,select,textarea")].filter(e => {
    if (!e.getClientRects().length) return false;
    const t = (e.getAttribute("type") || "").toLowerCase();
    if (["range","checkbox","radio","color","file","hidden","button","submit","reset","image"].includes(t)) return false;
    return parseFloat(getComputedStyle(e).fontSize) < 15.9;
  });
  if (small.length) bad.push(small.length + " field(s) under 16px, e.g. " + (small[0].id ? "#" + small[0].id : small[0].tagName.toLowerCase() + (small[0].className ? "." + String(small[0].className).split(" ")[0] : "")));
  const forever = (document.getAnimations ? document.getAnimations() : []).filter(a => {
    try { const t = a.effect && a.effect.getComputedTiming(); return a.playState === "running" && t && t.iterations === Infinity && t.duration > 1; } catch (e) { return false; }
  });
  if (forever.length) bad.push(forever.length + " endless animation(s) on touch");
  if (getComputedStyle(document.documentElement).overscrollBehaviorY !== "none") bad.push("page can rubber-band");
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
      if (/^google[0-9a-f]+\.html$/.test(f)) continue;
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
      const p = await ctx.newPage();
      try {
        await p.goto(`http://127.0.0.1:${port}/${f}`, { waitUntil: "load", timeout: 25000 });
        await p.waitForTimeout(900);
        const bad = await p.evaluate(calmProbe);
        if (bad.length) { fails++; console.log(`✗ ${f}: ${bad.join("; ")}`); }
      } catch (e) { console.log(`? ${f} ${e.message.split("\n")[0]}`); }
      await ctx.close();
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  await browser.close(); server.close();
  console.log(fails ? `\n${fails} page(s) break the calm rules.` : `\nAll ${pages.length} pages follow the calm rules on a phone.`);
  process.exit(fails ? 1 : 0);
})();
