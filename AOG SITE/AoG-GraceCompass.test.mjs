/* ============================================================================
   Architecture of Grace — Grace Compass test harness
   Dependency-free. Loads the live Grace Compass blocks straight out of
   index.html and asserts mapping, ES coverage, audience modes, risk flags,
   accessibility semantics, and the no-school-names rule.

   Run:  node AoG-GraceCompass.test.mjs      (or: npm test)
   Exits non-zero on any failure.
   ========================================================================== */
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

/* ---- pull a <script id="..."> body out of the file ---- */
function block(id) {
  const m = html.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)</script>'));
  if (!m) throw new Error("Missing required block: #" + id);
  return m[1];
}

/* ---- shared sandbox mirroring the app globals the engine depends on ---- */
const ctx = {
  console,
  window: {},
  dashLang: "en",
  DT: (en, es) => (ctx.dashLang === "es" ? es : en),
  aogGradeToBand: (g) => {
    if (g == null) return null;
    const s = String(g).trim().toUpperCase();
    if (s === "K" || s === "PK" || s === "TK" || s.indexOf("KIND") === 0) return "K–2";
    const n = parseInt(s, 10);
    if (isNaN(n)) return null;
    if (n <= 2) return "K–2"; if (n <= 5) return "3–5"; if (n <= 8) return "6–8";
    if (n <= 10) return "9–10"; return "11–12";
  },
  aogLowestDomainKey: (a, b, c) => {
    const d = { A: a || 0, B: b || 0, C: c || 0 };
    return Object.keys(d).sort((x, y) => d[x] - d[y])[0];
  },
};
ctx.window.aogMatchTools = () => ["breathing", "grounding", "take5", "calmjar", "movement", "coreg"];
vm.createContext(ctx);
for (const id of ["aog-gc-data", "aog-gc-es-data", "aog-gc-es-data2", "aog-gc-adult", "aog-gc-engine"]) {
  vm.runInContext(block(id), ctx, { filename: id + ".js" });
}
const GC = ctx.window.aogGraceCompass;
const setLang = (l) => { ctx.dashLang = l; };

/* ---- tiny assert framework ---- */
let pass = 0, fail = 0;
const groups = {};
function ok(group, cond, label) {
  (groups[group] = groups[group] || { p: 0, f: 0 });
  if (cond) { pass++; groups[group].p++; }
  else { fail++; groups[group].f++; console.log("  ✗ [" + group + "] " + label); }
}

/* ===================== DATA INTEGRITY ===================== */
const X = ctx.window.AOG_CROSSWALK, ES = ctx.window.AOG_CROSSWALK_ES, S = ctx.window.AOG_SESSIONS;
ok("data", Array.isArray(X) && X.length === 81, "81 crosswalk rows");
ok("data", S && S.length === 12, "12 Practitioner sessions");
ok("data", Object.keys(ES).length === 81, "ES overlay has 81 entries");
ok("data", X.every((r) => r.b && r.dom && r.theme && r.lesson && r.scene && r.chart && r.neuro), "every row has all fields");
ok("data", X.filter((r) => !ES[r.b + "|" + r.lesson]).length === 0, "every row has an ES translation (no gaps)");
const enKeys = new Set(X.map((r) => r.b + "|" + r.lesson));
ok("data", Object.keys(ES).every((k) => enKeys.has(k)), "no orphan ES keys");
ok("data", ["A", "B", "C", "ALL"].includes.bind(["A", "B", "C", "ALL"]) && X.every((r) => ["A", "B", "C", "ALL"].includes(r.dom)), "domains are A/B/C/ALL");

/* ===================== MAPPING / TRACEABILITY ===================== */
const ava = GC({ studentId: "Ava R.", grade: "3", normA: 42, normB: 71, normC: 80 });
ok("mapping", /Traceable to:/.test(ava), "practitioner output is traceable to a crosswalk row");
ok("mapping", /My Regulation Toolkit/.test(ava), "Ava (low A) maps to the Regulation Toolkit");
ok("mapping", (ava.match(/class="gc-tool"/g) || []).length <= 5, "curated tools capped at ≤5");
ok("mapping", GC({ grade: "7", normA: 40, normB: 82, normC: 80 }).includes("foundational anchor"), "nearest-band fallback fires (6-8 domain A)");
ok("mapping", GC({ grade: "Adult", population: "adult", normA: 80, normB: 60, normC: 78 }) === GC({ grade: "Adult", population: "adult", normA: 80, normB: 60, normC: 78 }), "adult render is deterministic");
ok("mapping", /Practitioner Edition · Session 7/.test(GC({ grade: "Adult", population: "adult", normA: 80, normB: 79, normC: 36 })), "adult low-C routes to Session 7");

/* ===================== AUDIENCE MODES ===================== */
const prac = GC({ grade: "9", normA: 40, normB: 80, normC: 78 });          // practitioner, has a ★ row
const self = GC({ grade: "9", normA: 40, normB: 80, normC: 78 }, { self: true });
ok("self-mode", /gc-riskbanner/.test(prac) && /gc-store/.test(prac) && /Neuro-affirming/.test(prac) && /Traceable to/.test(prac), "practitioner view keeps protocols+store+neuro+citation");
ok("self-mode", !/gc-riskbanner/.test(self), "student self: no risk banner");
ok("self-mode", !/gc-store/.test(self), "student self: no storefront link");
ok("self-mode", !/Neuro-affirming/.test(self) && !/Anchor chart/.test(self) && !/Traceable to/.test(self), "student self: no teacher text / chart / citation");
ok("self-mode", /Your next step/.test(self) && /A story that meets you here/.test(self) && /Take this home/.test(self), "student self: 3 warm labels");
ok("self-mode", !/Right now · regulation tools/.test(self), "student self: clinical 'Right now' label dropped (no redundancy)");
const adultSelf = GC({ grade: "Adult", population: "adult", normA: 80, normB: 79, normC: 36 }, { self: true });
ok("self-mode", /gc-store/.test(adultSelf) && /Practitioner Edition · Session/.test(adultSelf), "adult self: full Practitioner compass (self flag ignored)");

/* ===================== BILINGUAL ===================== */
setLang("es");
const avaEs = GC({ grade: "3", normA: 42, normB: 71, normC: 80 });
ok("i18n", /Traducción provisional/.test(avaEs), "ES mode shows provisional-translation tag");
ok("i18n", /Trazable a:/.test(avaEs), "ES citation localized");
ok("i18n", /Tu siguiente paso/.test(GC({ grade: "3", normA: 42, normB: 71, normC: 80 }, { self: true })), "ES student self labels localized");
setLang("en");

/* ===================== RISK FLAGS (Phase 3) ===================== */
ok("risk", /gc-riskbanner gc-rb-1/.test(prac) && /gc-headflag/.test(prac), "★ scene shows banner + header flag (practitioner)");
ok("risk", /High risk — pre-session and post-session/.test(GC({ grade: "Adult", population: "adult", normA: 80, normB: 79, normC: 36 })), "★★ adult session shows consultation protocol");

/* ===================== ACCESSIBILITY SEMANTICS ===================== */
ok("a11y", /role="region" aria-label="Grace Compass guidance"/.test(prac), "panel is a labelled region");
ok("a11y", /gc-score-pill [^"]*" role="img" aria-label="Score 40 of 100 · needs support"/.test(prac), "score pill has accessible band label (not color-only)");
ok("a11y", /gc-compass" aria-hidden="true"/.test(prac), "decorative compass glyph hidden from SR");
ok("a11y", /gc-tool" role="button"/.test(prac) && /gc-tool-ic" aria-hidden="true"/.test(prac), "tool chips are buttons with hidden emoji");
ok("a11y", /gc-rb-flag" aria-hidden="true"/.test(prac), "decorative ★ in risk banner hidden (text conveys it)");

/* ===================== SAFETY / HYGIENE ===================== */
ok("hygiene", !/darien/i.test(html), "no school names in the file");
ok("hygiene", /body > \*:not\(#mtssOverlay\):not\(#printReport\)\{display:none/.test(html), "PDF print-isolation rule present");
ok("hygiene", /id="aog-printreport-relocate"/.test(html), "printReport relocated to body for print isolation");
ok("hygiene", html.split('id="aog-gc-engine"').length === 2, "exactly one engine block");

/* ===================== SUMMARY ===================== */
console.log("\nGrace Compass test harness");
for (const g of Object.keys(groups)) console.log("  " + (groups[g].f ? "FAIL" : "ok  ") + "  " + g + ": " + groups[g].p + "/" + (groups[g].p + groups[g].f));
console.log("\n" + (fail ? "✗ " : "✓ ") + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
