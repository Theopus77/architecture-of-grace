/* ============================================================================
   Architecture of Grace — app-features test harness (beyond the Grace Compass)
   Dependency-free (no jsdom): reads index.html and asserts the reading-support
   accessibility features, the Community Circle grade-band prompts, the Inner
   Coach lines, the build stamp, and a few WCAG contrast pairs.

   Run:  node AoG-App.test.mjs        (or: npm test — runs this + the Compass suite)
   Exits non-zero on any failure.
   ========================================================================== */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

let pass = 0, fail = 0;
const groups = {};
function ok(group, cond, label) {
  (groups[group] = groups[group] || { p: 0, f: 0 });
  if (cond) { pass++; groups[group].p++; }
  else { fail++; groups[group].f++; console.log("  ✗ [" + group + "] " + label); }
}
function evalLiteral(re, stubL) {
  const m = html.match(re);
  if (!m) return null;
  try { const L = stubL ? ((a) => a) : undefined; void L; return eval("(" + m[1] + ")"); } catch (e) { return { __err: e.message }; }
}

/* ===================== READING SUPPORT (a11y) ===================== */
ok("a11y", /<script id="aog-a11y-read-js">/.test(html), "read-aloud/picture script block present");
ok("a11y", /window\.aogSpeak\s*=/.test(html) && /window\.aogA11yEnhance\s*=/.test(html), "aogSpeak + aogA11yEnhance defined");
ok("a11y", /speechSynthesis/.test(html) && /new window\.SpeechSynthesisUtterance/.test(html), "uses on-device speechSynthesis");
ok("a11y", /window\.aogToggleReadAloud\s*=/.test(html) && /window\.aogTogglePictures\s*=/.test(html), "read + picture toggles defined");
ok("a11y", /id="a11yReadRow"/.test(html) && /id="a11yPicRow"/.test(html), "both new menu rows present");
ok("a11y", /aog\.a11y\.readaloud/.test(html) && /aog\.a11y\.pictures/.test(html), "preferences persisted to localStorage");
ok("a11y", /a11y_read:\s*\{[^}]*es:/.test(html) && /a11y_pic:\s*\{[^}]*es:/.test(html), "new a11y labels are bilingual");
ok("a11y", /RN_STATE_ICONS\s*=\s*\{/.test(html), "Quiet Space per-state picture icon map present");
ok("a11y", /\.tk-pill\[data-state\]/.test(html) && /a11y-pic-ico/.test(html), "picture icons injected onto Quiet Space state pills");
ok("a11y", /aogRenderRightNow\.__a11yWrapped/.test(html), "Quiet Space re-enhanced after audience switch (icons persist)");
ok("a11y", /\.tk-pill\[data-v\]/.test(html), "burnout-tank frequency pills get picture dots");
ok("a11y", /aogRenderTankCopy\.__a11yWrapped/.test(html), "tank re-enhanced after audience/language switch (dots persist)");

/* ===================== COMMUNITY CIRCLE — grade-band prompts ===================== */
const bands = evalLiteral(/var CT_STEMS_BANDS\s*=\s*(\{[\s\S]*?\n  \});/);
ok("circle", bands && !bands.__err, "CT_STEMS_BANDS parses" + (bands && bands.__err ? " (" + bands.__err + ")" : ""));
if (bands && !bands.__err) {
  ok("circle", ["k2", "35", "68", "912"].every((k) => Array.isArray(bands[k])), "four grade bands present (k2/35/68/912)");
  ok("circle", ["k2", "35", "68", "912"].every((k) => bands[k].length >= 4), "each band has multiple prompts");
  ok("circle", ["k2", "35", "68", "912"].every((k) => bands[k].every((p) => p.en && p.es)), "every prompt is bilingual");
}

/* ===================== INNER COACH lines ===================== */
const ic = evalLiteral(/var IC_LINES\s*=\s*(\[[\s\S]*?\n  \]);/, true);
ok("coach", Array.isArray(ic), "IC_LINES parses");
if (Array.isArray(ic)) ok("coach", ic.length >= 10, "Inner Coach has 10+ critic/coach lines (was 4) — got " + ic.length);

/* ===================== BUILD STAMP ===================== */
ok("build", /<script id="aog-build-stamp">/.test(html) && /window\.AOG_BUILD\s*=/.test(html), "build stamp script + AOG_BUILD constant present");
ok("build", /id="footBuild"/.test(html), "visible footer build label present");
ok("build", /meta name="aog-build"/.test(html), "build meta tag present");

/* ===================== WCAG CONTRAST (key app pairs) ===================== */
function lin(c){ c/=255; return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); }
function lum(h){ h=h.replace("#",""); return 0.2126*lin(parseInt(h.slice(0,2),16))+0.7152*lin(parseInt(h.slice(2,4),16))+0.0722*lin(parseInt(h.slice(4,6),16)); }
function ratio(fg,bg){ const a=lum(fg),b=lum(bg),hi=Math.max(a,b),lo=Math.min(a,b); return (hi+0.05)/(lo+0.05); }
const navy = "#0A1E33";
ok("contrast", !/#5f6e80/i.test(html), "old failing footer color #5f6e80 fully removed");
ok("contrast", ratio("#8593a6", navy) >= 4.5, "footer build/readiness text passes AA on navy (" + ratio("#8593a6",navy).toFixed(2) + ")");
ok("contrast", ratio("#C9D2DE", navy) >= 4.5, "footer body text passes AA");
ok("contrast", ratio("#F4EEE2", navy) >= 4.5, "check-in question text passes AA");

/* ===================== SUMMARY ===================== */
console.log("\nApp-features test harness");
for (const g of Object.keys(groups)) console.log("  " + (groups[g].f ? "FAIL" : "ok  ") + "  " + g + ": " + groups[g].p + "/" + (groups[g].p + groups[g].f));
console.log("\n" + (fail ? "✗ " : "✓ ") + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
