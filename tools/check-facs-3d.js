#!/usr/bin/env node
/* AOG-FCS-3D-V1 (2026-10-12) — every link from the FACS course into the 3D rooms uses an id the rooms know.
 *
 *   node tools/check-facs-3d.js
 *
 * Reads the ids from aog-deploy/_work/engine3d/CONTRACT.md (the Addendum: Kitchen actions, Preloaded recipes,
 * Sewing moves), then checks every /kitchen-lab#… and /sewing-lab#… link in the FACS course pages (fcs-u*.html,
 * facs-course.html), the FACS room pages (fc*.html), fcs-shop.html and the course sources (_work/fcs):
 *   /kitchen-lab#skill-<action>   /kitchen-lab#<recipe>   /sewing-lab#<move>   (or the room with no #)
 * It also fails on a hash link to the old addresses (/kitchen#…, /sewing#…): /kitchen is the 2D bench.
 * When the 3D pages exist (kitchen.html, sewing.html, aog-kitchen*.js, aog-sewing*.js), it warns about any
 * contract id they never mention. Exit 1 on any problem. */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "aog-deploy");
const contract = fs.readFileSync(path.join(ROOT, "_work", "engine3d", "CONTRACT.md"), "utf8");
const add = contract.slice(contract.indexOf("# Addendum"));

function between(a, b) {
  const i = add.indexOf(a); if (i < 0) throw new Error("CONTRACT.md: cannot find " + a);
  const j = add.indexOf(b, i + a.length); if (j < 0) throw new Error("CONTRACT.md: cannot find " + b);
  return add.slice(i + a.length, j);
}
function ids(text) {
  return text.replace(/\([^)]*\)/g, "").split(/[,.\n]/)
    .map(p => p.replace(/^[^:]*:/, m => (/^[\sA-Za-z ]+:$/.test(m) ? "" : m)).trim())
    .map(p => p.split(/\s+/)[0]).filter(w => /^[a-z][a-z-]*[a-z]$/.test(w || ""));
}
const ACTIONS = new Set(ids(between("FACS links to them)", "Preloaded recipes")));
const RECIPES = new Set(ids(between("with allergens marked):", "Each step names")));
const MOVES = new Set(ids(between("SEWING animates them; FACS links to them)", "The stitches are drawn")));
for (const [name, set, min] of [["kitchen actions", ACTIONS, 25], ["recipes", RECIPES, 9], ["sewing moves", MOVES, 20]])
  if (set.size < min) { console.error(`CONTRACT.md: read only ${set.size} ${name} — the parser needs a look`); process.exit(1); }

const files = [];
for (const f of fs.readdirSync(ROOT))
  if (/^(fcs-u\d+|facs-course|fc\d+-[\w-]+|fcs-shop)\.html$/.test(f)) files.push(path.join(ROOT, f));
const src = path.join(ROOT, "_work", "fcs");
for (const f of fs.readdirSync(src)) if (/\.(json|py)$/.test(f)) files.push(path.join(src, f));

const problems = [], seen = { kitchen: new Set(), sewing: new Set() };
let n = 0;
for (const f of files) {
  const t = fs.readFileSync(f, "utf8"), rel = path.relative(path.join(ROOT, ".."), f);
  for (const m of t.matchAll(/\/(kitchen-lab|sewing-lab)(?:#([^"'\s<>)\\]*))?/g)) {
    n++;
    const room = m[1], h = m[2];
    if (h === undefined || h === "") continue;
    if (room === "kitchen-lab") {
      const ok = h.startsWith("skill-") ? ACTIONS.has(h.slice(6)) : RECIPES.has(h);
      if (!ok) problems.push(`${rel}: /kitchen-lab#${h} is not a kitchen skill or recipe in the contract`);
      else seen.kitchen.add(h);
    } else {
      if (!MOVES.has(h)) problems.push(`${rel}: /sewing-lab#${h} is not a sewing move in the contract`);
      else seen.sewing.add(h);
    }
  }
  for (const m of t.matchAll(/["'(]\/(kitchen|sewing)#([\w-]+)/g))
    problems.push(`${rel}: /${m[1]}#${m[2]} uses the old address; the 3D rooms are /kitchen-lab and /sewing-lab`);
}

// every FACS room page that has the block has it once
for (const f of files.filter(f => /\/fc\d+-[\w-]+\.html$/.test(f))) {
  const c = (fs.readFileSync(f, "utf8").match(/<!-- AOG-FCS-3D-V1: Watch it in 3D -->/g) || []).length;
  if (c > 1) problems.push(`${path.basename(f)}: the Watch it in 3D block appears ${c} times`);
}

// soft check: the 3D pages, once built, mention every contract id
const warn = [];
const bundle = ["kitchen.html", "aog-kitchen.js", "aog-kitchen-recipes.js", "aog-kitchen3d.js"].map(f => path.join(ROOT, f)).filter(fs.existsSync);
if (bundle.length) {
  const all = bundle.map(f => fs.readFileSync(f, "utf8")).join("\n");
  for (const h of seen.kitchen) { const id = h.replace(/^skill-/, ""); if (!all.includes(id)) warn.push(`the 3D Kitchen never mentions "${id}" (linked as #${h})`); }
}
const sbundle = ["sewing.html", "aog-sewing.js", "aog-sewing-moves.js", "aog-sewing3d.js"].map(f => path.join(ROOT, f)).filter(fs.existsSync);
if (sbundle.length) {
  const all = sbundle.map(f => fs.readFileSync(f, "utf8")).join("\n");
  for (const h of seen.sewing) if (!all.includes(h)) warn.push(`the 3D Sewing Room never mentions "${h}"`);
}

for (const w of warn) console.log("  note: " + w);
if (problems.length) { console.log(`FACS 3D links: ${problems.length} problem(s)`); for (const p of problems) console.log("  - " + p); process.exit(1); }
console.log(`FACS 3D links OK · ${n} links in ${files.length} files · ${seen.kitchen.size} kitchen ids and ${seen.sewing.size} sewing ids used · contract: ${ACTIONS.size} skills, ${RECIPES.size} recipes, ${MOVES.size} moves`);
