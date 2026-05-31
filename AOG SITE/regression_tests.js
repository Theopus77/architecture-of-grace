/**
 * Architecture of Grace · Universal Check-In — automated regression suite
 * ----------------------------------------------------------------------
 * Run this after ANY edit to index.html, before you publish.
 *
 *   1. One-time setup:   npm install jsdom
 *   2. Run:              node regression_tests.js path/to/index.html
 *                        (defaults to ./index.html if no path is given)
 *
 * Exit code 0 = all good. Non-zero = something regressed; read the FAIL lines.
 *
 * These tests lock in the behavior we built. If you intentionally change a
 * behavior, update the matching test so the suite stays meaningful.
 */
const fs = require("fs");
const path = require("path");

let JSDOM;
try { ({ JSDOM } = require("jsdom")); }
catch (e) {
  console.error("Missing dependency. Run:  npm install jsdom\n");
  process.exit(2);
}

const FILE = process.argv[2] || "index.html";
if (!fs.existsSync(FILE)) {
  console.error("Cannot find file: " + FILE + "\nPass the path, e.g.:  node regression_tests.js index.html");
  process.exit(2);
}
const html = fs.readFileSync(FILE, "utf8");

let pass = 0, fail = 0;
const ok = (cond, msg) => { cond ? (pass++, console.log("  PASS " + msg)) : (fail++, console.log("  FAIL " + msg)); };
const group = (name) => console.log("\n• " + name);

// ----------------------------------------------------------------------
// 1. Static structure checks (no browser needed)
// ----------------------------------------------------------------------
group("Structure");
const opens = (html.match(/<div/g) || []).length;
const closes = (html.match(/<\/div>/g) || []).length;
ok(opens === closes, "<div> tags balanced (" + opens + "/" + closes + ")");
ok((html.match(/<section/g) || []).length === (html.match(/<\/section>/g) || []).length, "<section> tags balanced");

// JS parses (extract <script> blocks and Function-check them)
const scripts = (html.match(/<script>([\s\S]*?)<\/script>/g) || [])
  .map(b => b.replace(/^<script>/, "").replace(/<\/script>$/, "")).join("\n");
let jsOk = true;
try { new Function(scripts); } catch (e) { jsOk = false; console.log("    JS parse error: " + e.message); }
ok(jsOk, "JavaScript parses without syntax errors");

// Storage keys must NOT change — renaming them orphans every saved response.
ok(/aogScreener\.v2\.results/.test(html), "results storage key intact (aogScreener.v2.results)");
ok(/aogScreener\.v2\.lang/.test(html), "language storage key intact (aogScreener.v2.lang)");

// Mode internal values must stay rapid/depth (display labels are Quick/Thorough).
ok(/data-mode="rapid"/.test(html) && /data-mode="depth"/.test(html), "internal mode values rapid/depth intact");

// Participant-facing wording: no "screener" leaking to families.
ok(!/universal screener/i.test(html), "no participant-facing 'universal screener' text");

// Accessibility guarantees (static)
ok(/prefers-reduced-motion/.test(html), "reduced-motion support present");
ok(/:focus-visible/.test(html), "keyboard focus indicator (:focus-visible) present");
ok(/for="studentId"/.test(html) && /for="grade"/.test(html) && /for="window"/.test(html), "form labels linked to controls (for=)");

// ----------------------------------------------------------------------
// 2. Behavioral checks (in a simulated browser)
// ----------------------------------------------------------------------
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable", url: "http://localhost/", pretendToBeVisual: true });

dom.window.addEventListener("load", () => {
  const w = dom.window, d = w.document;
  const $ = (s) => d.querySelector(s);
  const ctxBtn = (c) => d.querySelector('#ctxToggle .ctx-opt[data-ctx="' + c + '"]');
  const lbl = () => d.getElementById("lblStudentId");
  const inp = () => d.getElementById("studentId");
  const grade = d.getElementById("grade");
  const gopt = (v) => Array.prototype.find.call(grade.options, o => o.value === v);

  // -- Home / School de-identification toggle --
  group("Home / School toggle");
  ok(ctxBtn("school").classList.contains("active"), "default context is School (privacy-safe)");
  ok(!ctxBtn("home").classList.contains("active"), "Home not active by default");
  ok(/Student ID code/i.test(lbl().textContent), "School label reads 'Student ID code'");
  ok(/code you assign/i.test(inp().getAttribute("placeholder")), "School placeholder: a code you assign, not a name");
  ctxBtn("home").click();
  ok(ctxBtn("home").classList.contains("active") && !ctxBtn("school").classList.contains("active"), "clicking Home flips active state");
  ok(/Name or ID/i.test(lbl().textContent), "Home label reads 'Name or ID'");
  ctxBtn("school").click();

  // -- Spanish translation of participant UI --
  group("Bilingual (participant side)");
  if (typeof w.setLang === "function") {
    w.setLang("es");
    ok(/ID del estudiante/i.test(lbl().textContent), "ES: School label translates");
    ctxBtn("home").click();
    ok(/Nombre o ID/i.test(lbl().textContent), "ES: Home label translates");
    ctxBtn("school").click();
    w.setLang("en");
  } else { ok(false, "setLang function present"); }

  // -- Mode-aware grade band --
  group("Mode-aware grade band");
  ok(gopt("Adult").hidden && gopt("Adult").disabled, "School: Adult band hidden");
  ok(gopt("College").hidden && gopt("College").disabled, "School: College band hidden");
  ok(!gopt("K").disabled, "School: K-12 bands available");
  ctxBtn("home").click();
  ok(!gopt("Adult").hidden && !gopt("Adult").disabled, "Home: Adult band available");
  ok(!gopt("College").hidden, "Home: College band available");
  grade.value = "Adult";
  ctxBtn("school").click();
  ok(grade.value === "", "switching Home->School clears an Adult selection");

  // -- Honest sync status --
  group("Honest sync status");
  const KEY = "aogScreener.v2.results";
  const seed = (a) => w.localStorage.setItem(KEY, JSON.stringify(a));
  const Rec = (synced) => ({ timestamp: String(Math.random()), studentId: "S" + Math.random(), synced });
  if (typeof w.renderSyncStatus === "function") {
    // local-only
    w.localStorage.removeItem("aog.sync.enabled");
    seed([Rec(null), Rec(null)]);
    w.renderSyncStatus();
    ok(/Private/.test(d.getElementById("hdrSyncPillText").textContent), "local-only: header says Private");
    ok(/2 responses saved/.test(d.getElementById("syncCounts").textContent), "local-only: shows saved count");
    // sync on, some waiting -> honest amber + counts, never false green
    w.localStorage.setItem("aog.sync.enabled", "1");
    seed([Rec(true), Rec(false), Rec(false)]);
    w.renderSyncStatus();
    ok(/2 waiting to send/.test(d.getElementById("hdrSyncPillText").textContent), "waiting: header surfaces 'waiting to send'");
    ok(d.getElementById("hdrSyncPill").className.includes("backend-offline"), "waiting: pill not falsely green");
    ok(/not that the sheet received it/.test(d.getElementById("syncStatusDetail").textContent), "detail is honest (sent != confirmed received)");
    w.localStorage.removeItem("aog.sync.enabled");
  } else { ok(false, "renderSyncStatus function present"); }

  // -- Accessibility (keyboard + screen reader) --
  group("Accessibility");
  ok(d.getElementById("modeGrid").getAttribute("role") === "radiogroup", "mode picker is a radiogroup");
  const mcards = [...d.querySelectorAll("#modeGrid .mode-card")];
  ok(mcards.every(c => c.getAttribute("role") === "radio" && c.getAttribute("tabindex") === "0"), "mode cards are focusable radios");
  const rapidCard = mcards.find(c => c.dataset.mode === "rapid");
  rapidCard.dispatchEvent(new w.KeyboardEvent("keydown", { key: " ", bubbles: true }));
  ok(rapidCard.getAttribute("aria-checked") === "true", "Space selects a mode card (aria-checked updates)");
  if (typeof w.setLang === "function") {
    w.setLang("es"); ok(d.documentElement.getAttribute("lang") === "es", "language switch updates <html lang>");
    w.setLang("en");
  }

  // -- Dashboard language (independent EN/ES, Pass 1+) --
  group("Dashboard language");
  if (typeof w.applyDashLang === "function" && typeof w.setDashLang === "function") {
    const tabOv = () => d.querySelector('.tab[data-tab="overview"]');
    const band  = () => d.querySelector('[data-dl="dl_band_red"]');
    w.setDashLang("es");
    ok(tabOv().textContent === "Resumen", "ES: dashboard tab translates (Overview -> Resumen)");
    ok(band() && band().textContent === "Necesita apoyo (0\u201349)", "ES: score-band label translates");
    ok(w.localStorage.getItem("aogScreener.v2.dashlang") === "es", "dashLang persists to its own key");
    // INDEPENDENCE: participant language must NOT flip the dashboard
    w.setDashLang("en");
    if (typeof w.setLang === "function") { w.setLang("es"); }
    ok(tabOv().textContent === "Overview", "participant ES does NOT flip the dashboard (stays EN)");
    if (typeof w.setLang === "function") { w.setLang("en"); }
    w.setDashLang("en");
    ok(tabOv().textContent === "Overview", "EN restores dashboard tab labels");
  } else { ok(false, "applyDashLang / setDashLang functions present"); }

  // -- Dashboard language: dynamic content (Pass 2) --
  group("Dashboard language \u2014 dynamic content");
  if (typeof w.setDashLang === "function" && typeof w.renderHome === "function") {
    const rec = { studentId:"S-7", grade:"3", window:"Fall", mode:"rapid", normA:18, normB:82, normC:74,
      normComposite:44, tier:"High Risk", trustedAdultFlag:true, timestamp:new Date().toISOString(),
      raw:[0,0,2,0,2,2,2,2,2,2,2,2,2,2,2,2,2,0],
      intensities:[2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      reflections:["x","",""], closingWord:"y" };
    w.localStorage.setItem("aogScreener.v2.results", JSON.stringify([rec]));
    w.setDashLang("es");
    const st = d.getElementById("studentTable").innerHTML;
    ok(/Estado/.test(st) && /Necesita apoyo/.test(st), "ES: student table headers + tier translate");
    ok(/R\u00e1pido/.test(st) && !/>rapid</.test(st), "ES: mode shows display label, never raw 'rapid'");
    ok(/Regulaci\u00f3n emocional/.test(d.getElementById("domainSummary").innerHTML), "ES: overview domain card translates");
    d.getElementById("homeFilterStudent").value = "S-7"; w.renderHome();
    ok(/Iniciadores de conversaci\u00f3n|Qu\u00e9 hacer ahora/.test(d.getElementById("homeReport").innerHTML), "ES: conversation guide translates");
    w.setDashLang("en");
    ok(/Status/.test(d.getElementById("studentTable").innerHTML), "EN restores dynamic table headers");
    w.localStorage.removeItem("aogScreener.v2.results");
  } else { ok(false, "renderHome present for dynamic-language checks"); }

  console.log("\n----------------------------------------");
  console.log(pass + " passed, " + fail + " failed");
  console.log("----------------------------------------");
  process.exit(fail ? 1 : 0);
});

// Safety net: if load never fires.
setTimeout(() => { console.log("\nTimed out waiting for page load."); process.exit(fail ? 1 : 3); }, 15000);
