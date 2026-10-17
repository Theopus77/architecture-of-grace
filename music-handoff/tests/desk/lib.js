/* The desk tests' shared helpers (music-handoff/tests/desk/*.js, ports 9340–9349): a server, the routes, takes made in the
   page (studio/more.js's TAKE, plus an anti-phase right side), the bounce helpers (studio/more.js's HELP), the site's own
   contrast and calm probes, and an iPhone / iPad look in light and dark. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
const SRC = fs.readFileSync(path.join(__dirname, "..", "studio", "more.js"), "utf8");
const TAKE = SRC.slice(SRC.indexOf("const TAKE = `") + 14, SRC.indexOf("})`;", SRC.indexOf("const TAKE = `")) + 2)
  .replace('o.ch === "L" ? 0 : Math.round(x)', 'o.ch === "L" ? 0 : Math.round(o.inv ? -x : x)')
  .replace("bpm: 100,", "bpm: o.bpm || 100,").replace("2.4 * o.bars", "(o.bpm ? 240 / o.bpm : 2.4) * o.bars");
const h0 = SRC.indexOf("const HELP = `") + 14, HELP = SRC.slice(h0, SRC.indexOf("})();`;", h0) + 5).replace("return T; })();", `
  T.peak = (name, t0, t1) => { const b = T.B[name]; let m = 0; for (let i = Math.max(0, Math.round(t0 * sr)); i < Math.min(b.L.length, Math.round(t1 * sr)); i++) m = Math.max(m, Math.abs(b.L[i]), Math.abs(b.R[i])); return m; };
  T.energy = (name, t0, t1) => { const b = T.B[name]; let s = 0; for (let i = Math.max(0, Math.round(t0 * sr)); i < Math.min(b.L.length, Math.round(t1 * sr)); i++) s += b.L[i] * b.L[i] + b.R[i] * b.R[i]; return s; };
  T.hz = (name, t, w) => { const d = T.B[name].L, a = Math.round(t * sr), n = Math.round(w * sr); let up = 0, f = -1, l = -1;
    for (let i = a + 1; i < a + n; i++) if (d[i - 1] < 0 && d[i] >= 0) { const x = i - 1 + d[i - 1] / (d[i - 1] - d[i]); if (f < 0) f = x; l = x; up++; } return (up - 1) / ((l - f) / sr); };
  return T; })();`);
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
let OLD = null;
function oldPage() { if (OLD === null) { try { OLD = cp.execSync("git -C " + JSON.stringify(ROOT) + " show origin/main:aog-deploy/music-studio.html", { maxBuffer: 64 << 20 }).toString(); } catch (e) { OLD = ""; } } return OLD; }
async function routes(ctx, before) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  if (before && oldPage()) await ctx.route(/music-studio-before\.html/, r => r.fulfill({ body: OLD, contentType: "text/html" }));
}
const add = (p, o) => p.evaluate(`(${TAKE})(${JSON.stringify(o)})`);
const NM = { guitar: "Guitar take", bass: "Bass take", piano: "Piano take", drums: "Drum take" };
async function put(p, n, track, from) {
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => { const o = [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm); return o ? o.value : null; }, NM[from || "guitar"] + " " + n);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 40000 });
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const ready = p => p.waitForFunction(() => window.__aogStudio && window.__aogDeskPro && !__aogStudio.S.decoding && __aogStudio.SONG.tracks.every(x => !x.clip || __aogStudio.BUF.has(x.clip.id)), null, { timeout: 30000 });
async function launch(extra) { return pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"].concat(extra || []) }); }
/* an iPhone and an iPad, light and dark: setup(page) opens what is to be looked at; then it must fit (nothing sideways),
   read (the contrast probe), be calm (the calm probe) and have buttons a finger can press (44 px) inside `sel` */
async function looks(b, U, setup, sel, name) {
  for (const [dev, theme] of [["iPad (gen 7)", "light"], ["iPad (gen 7)", "dark"], ["iPhone 13", "light"], ["iPhone 13", "dark"], ["iPhone 13 landscape", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(600); await ready(m);
    await setup(m);
    await m.waitForTimeout(200);
    const f = await m.evaluate(sel => { const r = el => el.getBoundingClientRect(), btn = [...document.querySelectorAll(sel)].filter(x => x.offsetParent && (x.tagName === "BUTTON" || x.tagName === "SELECT"));
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, n: btn.length, small: btn.filter(x => r(x).height < 44 || r(x).width < 44).map(x => x.id || x.textContent.slice(0, 20)).join(","),
        fs: Math.min(16, ...[...document.querySelectorAll(sel)].filter(x => x.offsetParent && (x.tagName === "SELECT" || x.tagName === "INPUT") && x.type !== "range").map(x => parseFloat(getComputedStyle(x).fontSize))) }; }, sel);
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    ok(f.sw <= f.iw && !f.small && f.fs >= 16 && f.n > 0 && !pc.length && !pk.length, `${name}: ${dev}, ${theme}: fits (${f.sw} ≤ ${f.iw}), ${f.n} controls a finger can press${f.small ? " (too small: " + f.small + ")" : ""}, boxes ${f.fs}px, reads (${pc.length} unreadable ${JSON.stringify(pc.slice(0, 2))}), calm (${pk.join("; ") || "ok"})`);
    await cx.close();
  }
}
function done(b, srv) { ok(errs.length === 0, "no page errors " + errs.slice(0, 4).join(" | ")); console.log(fails ? fails + " FAILED" : "ALL PASS"); return b.close().then(() => { srv.close(); process.exit(fails ? 1 : 0); }); }
module.exports = { pw, fs, path, ROOT, PROBE, CALM, TAKE, HELP, ok, errs, watch, routes, add, put, near, ready, launch, looks, done, oldPage, srv: port => require("../srv.js")(port), get fails() { return fails; } };
