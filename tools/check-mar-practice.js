#!/usr/bin/env node
/*
 * AOG-MAR-PRACTICE-V1 (2026-10-12) — the Practice strand of The Measured Step.
 *
 *   node tools/check-mar-practice.js
 *
 * For every built unit page (aog-deploy/mar-u1.html … mar-u17.html) it checks:
 *   - the page has a "Practice the Moves" section with a safety lesson and at least two move lessons;
 *   - every move lesson has numbered steps, "What helps:", "Stay safe:" and a "Watch it in 3D" button to /dojo#<id>;
 *   - every link to the Dojo uses an id from the moves table in aog-deploy/_work/engine3d/CONTRACT.md, and only
 *     an id the contract's "Bands" allow for the unit's band (read from aog-deploy/_work/mar/u<n>.json);
 *   - the other-side doors use ?side=left.
 * No browser needed. Exit 1 on any problem.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DEPLOY = path.join(ROOT, "aog-deploy");
const contract = fs.readFileSync(path.join(DEPLOY, "_work/engine3d/CONTRACT.md"), "utf8");

// ── the moves table: | id | English | Español | from |
const IDS = new Set();
for (const line of contract.split("\n")) {
  const m = /^\|\s*([a-z0-9][a-z0-9-]*)\s*\|[^|]+\|[^|]+\|[^|]+\|\s*$/.exec(line);
  if (m && m[1] !== "id") IDS.add(m[1]);
}
// ── the bands paragraph: "Bands (…): K–2: a, b, … 3–5 adds … 6–8 adds … 9–12 adds …"
const bp = /Bands \(what a lesson for that band may ask\):([\s\S]*?)\n\n/.exec(contract);
if (!bp) { console.error("CONTRACT.md: no Bands paragraph found"); process.exit(1); }
const parts = bp[1].split(/(K–2:|3–5 adds|6–8 adds|9–12 adds)/);
const ADD = {};
for (let i = 1; i < parts.length; i += 2) {
  const key = parts[i].replace(/:| adds/g, "").trim();
  const body = parts[i + 1].replace(/\([^)]*\)/g, "");
  ADD[key] = body.split(/[,.]/).map(s => s.trim()).filter(s => /^[a-z0-9-]+$/.test(s));
}
const order = ["K–2", "3–5", "6–8", "9–12"];
const ALLOWED = {}; let acc = [];
for (const k of order) { acc = acc.concat(ADD[k] || []); ALLOWED[k] = new Set(acc); }
const BAND = { "k-2": "K–2", "3-5": "3–5", "6-8": "6–8", "9-10": "9–12", "11-12": "9–12" };

const problems = [];
const bad = (f, msg) => problems.push(f + ": " + msg);
for (const k of order) for (const id of ALLOWED[k]) if (!IDS.has(id)) bad("CONTRACT.md", `band ${k} names '${id}', not in the moves table`);

const strip = s => s.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
let units = 0, lessons = 0, links = 0;
for (let n = 1; n <= 99; n++) {
  const page = path.join(DEPLOY, `mar-u${n}.html`);
  const src = path.join(DEPLOY, `_work/mar/u${n}.json`);
  if (!fs.existsSync(page) || !fs.existsSync(src)) break;
  units++;
  const f = `mar-u${n}.html`;
  const band = BAND[JSON.parse(fs.readFileSync(src, "utf8")).band];
  const html = fs.readFileSync(page, "utf8");
  const ok = ALLOWED[band];

  // the practice section: <section class="sec" …><h3>Practice the Moves</h3> … </section>
  const sm = /<section class="sec" id="s\d+-\d+"><div class="sh">[\s\S]*?<h3>Practice the Moves<\/h3><\/div>([\s\S]*?)<\/section>\s*<section class="review"/.exec(html);
  if (!sm) { bad(f, "no 'Practice the Moves' section"); continue; }
  const arts = sm[1].split('<article class="les"').slice(1);
  if (arts.length < 3) bad(f, `practice section has ${arts.length} lessons; needs a safety lesson and at least two moves`);
  arts.forEach((a, i) => {
    lessons++;
    const title = strip((/<h4>([\s\S]*?)<\/h4>/.exec(a) || [, "?"])[1]);
    const paras = [...a.matchAll(/<div class="reading">([\s\S]*?)<\/div>/g)].map(m => m[1]).join("");
    const ps = [...paras.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m => strip(m[1]));
    const steps = ps.filter(p => /^\d+\. /.test(p));
    if (steps.length < 3) bad(f, `'${title}': fewer than 3 numbered steps`);
    if (!ps.some(p => p.startsWith("What helps:"))) bad(f, `'${title}': no "What helps:"`);
    if (!ps.some(p => p.startsWith("Stay safe:"))) bad(f, `'${title}': no "Stay safe:"`);
    const t = /<a class="lbtn try" href="([^"]+)">/.exec(a);
    if (!t) { bad(f, `'${title}': no Dojo button`); return; }
    if (i === 0 ? !/^\/dojo(#[a-z0-9-]+)?$/.test(t[1]) : !/^\/dojo#[a-z0-9-]+$/.test(t[1])) bad(f, `'${title}': button goes to ${t[1]}`);
  });

  // every Dojo link on the page
  for (const m of html.matchAll(/href="(\/dojo[^"]*)"/g)) {
    links++;
    const href = m[1];
    const u = /^\/dojo(\?side=left)?(?:#([a-z0-9-]+)(\?side=left)?)?$/.exec(href);
    if (!u) { bad(f, `Dojo link in an unknown form: ${href}`); continue; }
    const id = u[2];
    if (!id) continue;
    if (!IDS.has(id)) bad(f, `Dojo link to '${id}', which is not in the contract's moves table`);
    else if (!ok.has(id)) bad(f, `Dojo link to '${id}', which band ${band} does not allow`);
  }
}

if (!units) bad("aog-deploy", "no mar-u*.html pages found");
if (problems.length) {
  console.log(`check-mar-practice: ${problems.length} problem(s)`);
  for (const p of problems) console.log(" - " + p);
  process.exit(1);
}
console.log(`check-mar-practice: OK · ${units} unit pages · ${lessons} practice lessons · ${links} Dojo links · ${IDS.size} moves in the contract`);
