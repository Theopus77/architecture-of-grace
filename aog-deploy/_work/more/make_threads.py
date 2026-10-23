#!/usr/bin/env python3
"""AOG-THREADS-V1 — /threads: Big Questions that run through many courses, young to old.

    python3 _work/more/make_threads.py      (from aog-deploy/; after the curators' pick_*.json change, or new Spanish)

Reads _work/more/threads/pick_*.json (made by curator agents from THREADS.md) and writes threads.html: one closed card
per question; opened, its lessons from every course, grouped by age from K–2 to adults, each a link straight to the
lesson. Spanish titles come from _work/more/<course>/ when a unit has them."""
import html, json, re
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORK = HERE.parent
DEPLOY = WORK.parent
E = lambda s: html.escape(str(s), quote=True)

THREADS = [l for l in (HERE / "threads" / "THREADS.md").read_text().split("\n") if re.match(r"\| [a-z]+ \|", l)]
THREADS = [[c.strip() for c in l.strip("|").split("|")] for l in THREADS]
BANDS = [("k-2", "Ages 5–8 · Grades K–2", "5 a 8 años · Grados K–2"), ("3-5", "Ages 8–11 · Grades 3–5", "8 a 11 años · Grados 3–5"),
         ("6-8", "Ages 11–14 · Grades 6–8", "11 a 14 años · Grados 6–8"), ("9-10", "Ages 14–16 · Grades 9–10", "14 a 16 años · Grados 9–10"),
         ("11-12", "Ages 16–18 · Grades 11–12", "16 a 18 años · Grados 11–12"), ("adult", "Adults", "Adultos")]
PER_BAND = 6

def sp(en, es): return '<span data-en="%s" data-es="%s">%s</span>' % (E(en), E(es), E(en))

def main():
    pages = {}
    for l in (HERE / "pages.txt").read_text().split("\n"):
        p = l.split()
        if len(p) == 3: pages[(p[0], int(p[1]))] = p[2]
    names = {}
    for f in (DEPLOY / "course-data").glob("*-plan.json"):
        j = json.load(open(f, encoding="utf-8")); names[j["c"]] = (j["name"], j["namee"])
    units, es_units = {}, {}
    def lesson(c, n, lid):
        if (c, n) not in units:
            units[(c, n)] = json.load(open(WORK / c / ("u%d.json" % n), encoding="utf-8"))
        U = units[(c, n)]
        m = re.fullmatch(r"l(\d+)-(\d+)", lid)
        if not m: return None
        cn, k = int(m.group(1)), int(m.group(2))
        for ch in U["chapters"]:
            if ch["n"] != cn: continue
            num = 0
            for si, s in enumerate(ch["sections"]):
                for li, l in enumerate(s["lessons"]):
                    num += 1
                    if num == k:
                        te = ""
                        cf = HERE / c / ("u%d.ch%d.json" % (n, cn))
                        if cf.exists():
                            try: te = json.load(open(cf, encoding="utf-8"))["sections"][si]["lessons"][li].get("title", "")
                            except Exception: te = ""
                        return dict(t=l["title"], te=te, band=U.get("band") or "6-8", ut=U["title"])
        return None
    picks = {t[0]: [] for t in THREADS}
    for f in sorted((HERE / "threads").glob("pick_*.json")):
        J = json.load(open(f, encoding="utf-8"))
        for tid, lst in J.items():
            if tid in picks: picks[tid].extend(lst)
    cards, total = [], 0
    for tid, en, es in THREADS:
        seen, rows = set(), {b[0]: [] for b in BANDS}
        for p in picks[tid]:
            try: c, n, lid = p["c"], int(p["u"]), p["lid"]
            except Exception: continue
            if (c, n, lid) in seen or (c, n) not in pages: continue
            L = lesson(c, n, lid)
            if not L: continue
            seen.add((c, n, lid))
            rows.setdefault(L["band"], []).append((c, n, lid, L, p.get("why", ""), p.get("why_es", "")))
        body, count = [], 0
        for b, ben, bes in BANDS:
            r = rows.get(b, [])
            # spread across courses: round robin by course, then cap
            byc = {}
            for x in r: byc.setdefault(x[0], []).append(x)
            spread = []
            while any(byc.values()) and len(spread) < PER_BAND:
                for c in list(byc):
                    if byc[c] and len(spread) < PER_BAND: spread.append(byc[c].pop(0))
            if not spread: continue
            count += len(spread)
            items = "".join('<li><a href="/%s#%s"><span class="c">%s</span><b>%s</b></a><span class="why">%s</span></li>' % (
                E(pages[(c, n)]), E(lid), sp(names.get(c, (c, c))[0], names.get(c, (c, c))[1]), sp(L["t"], L["te"] or L["t"]), sp(why, why_es or why))
                for c, n, lid, L, why, why_es in spread)
            body.append('<h3>%s</h3><ul>%s</ul>' % (sp(ben, bes), items))
        if not count: continue
        total += count
        cards.append('<details class="q" id="%s"><summary><span class="qq">%s</span><span class="n">%s</span></summary><div class="in">%s</div></details>' % (
            tid, sp(en, es), sp("%d lessons" % count, "%d lecciones" % count), "".join(body)))
    page = TEMPLATE.replace("__CARDS__", "\n".join(cards)).replace("__N__", str(len(cards)))
    (DEPLOY / "threads.html").write_text(page, encoding="utf-8")
    print("threads.html:", len(cards), "questions,", total, "lessons")

TEMPLATE = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><style id="aog-first-paint">/* AOG-ONE-PAINT-V1 */html{background:#F7F2E6}html[data-theme="dark"]{background:#0A1E33}html:not(.aog-ready) body{visibility:hidden;animation:aogOnePaint 0s linear 1.1s forwards}@keyframes aogOnePaint{to{visibility:visible}}@media print{html:not(.aog-ready) body{visibility:visible;animation:none}}</style>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>(function(){var t="light";try{if(localStorage.getItem("aog.theme.lightstart.v1")==="1"&&localStorage.getItem("aog.interior.ws.v1.theme")==="dark")t="dark";}catch(e){}document.documentElement.setAttribute("data-theme",t);})();</script>
<title>Big Questions — Architecture of Grace</title>
<meta name="description" content="Big questions that run through every course: what makes a rule fair, how we know what is true, what we owe each other. Follow one question from kindergarten to adults. Free, in English and Spanish.">
<link rel="canonical" href="https://architectureofgrace.com/threads">
<meta property="og:title" content="Big Questions — Architecture of Grace">
<meta property="og:description" content="Follow one big question across every course, from kindergarten to adults.">
<meta property="og:url" content="https://architectureofgrace.com/threads">
<meta property="og:image" content="https://architectureofgrace.com/og-prep.png?v=1">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta name="theme-color" content="#0A1E33">
<!-- ═══ AOG-THREADS-V1 (2026-10-23) · /threads (also /big-questions). Built by _work/more/make_threads.py from the curators'
     picks (_work/more/threads/). Do not hand-edit; change the picks or the builder and run it again. Saves nothing. ═══ -->
<style>
:root{--ground:#F5F1E8;--field:#FFFFFF;--field-2:#EFEAE0;--ink:#1D2733;--ink-soft:#57626F;--navy:#0A1E33;--gold-deep:#7A5C1F;--acc:#7A5230;
  --rule:rgba(29,39,51,.16);--focus:#B8893A;--serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;--sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
:root[data-theme="dark"]{--ground:#12161C;--field:#1A2029;--field-2:#222A34;--ink:#E9EEF4;--ink-soft:#A3AFBC;--gold-deep:#D6A852;--acc:#D0A46B;--rule:rgba(233,238,244,.18);--focus:#D6A852}
*{box-sizing:border-box}
html{background:var(--ground)}
body{margin:0;background:var(--ground);color:var(--ink);font:17px/1.55 var(--sans)}
header.hero{background:linear-gradient(180deg,#12314F,#0A1E33);color:#F4EEE2;padding:26px 16px 28px}
.hero-in{max-width:880px;margin:0 auto}
.ey{font:800 12px/1.3 var(--sans);letter-spacing:.18em;text-transform:uppercase;color:#F2C964;margin:0 0 6px}
h1{font:600 clamp(30px,6vw,44px)/1.1 var(--serif);margin:0 0 8px;color:#F4EEE2}
.lede{color:#D5DEE8;margin:0;max-width:620px}
main{max-width:880px;margin:0 auto;padding:18px 16px 70px}
details.q{background:var(--field);border:1.5px solid var(--rule);border-radius:18px;margin:0 0 12px}
details.q>summary{cursor:pointer;list-style:none;min-height:56px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px}
details.q>summary::-webkit-details-marker{display:none}
details.q .qq{font:600 clamp(19px,4vw,22px)/1.3 var(--serif)}
details.q .n{flex:0 0 auto;font:700 14px var(--sans);color:var(--ink-soft)}
details.q .in{padding:0 16px 14px}
details.q h3{font:800 12px/1.3 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--gold-deep);margin:14px 0 6px}
details.q ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
details.q li{background:var(--field-2);border-radius:12px;padding:10px 12px}
details.q li a{display:block;color:var(--ink);text-decoration:none;min-height:24px}
details.q li a b{display:block;font:700 17px/1.35 var(--serif)}
details.q li a:hover b{text-decoration:underline}
details.q .c{display:block;font:700 12px/1.3 var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--acc)}
details.q .why{display:block;font-size:15px;color:var(--ink-soft);margin-top:2px}
summary:focus-visible,a:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
.note{font-size:15px;color:var(--ink-soft);margin-top:18px}
@media print{header.hero{display:none}details.q{border:0;break-inside:avoid}details.q .in{display:block}html,body{background:#fff;color:#000}}
</style>
</head>
<body>
<script src="/aog-topbar.js"></script>
<header class="hero"><div class="hero-in">
  <p class="ey"><span data-en="Every course · Every age" data-es="Todos los cursos · Todas las edades">Every course · Every age</span></p>
  <h1><span data-en="Big questions" data-es="Grandes preguntas">Big questions</span></h1>
  <p class="lede"><span data-en="Some questions run through every subject. Pick one. Follow it from kindergarten to adults, one lesson at a time." data-es="Algunas preguntas aparecen en todas las materias. Elige una. Síguela desde el kínder hasta los adultos, una lección a la vez.">Some questions run through every subject. Pick one. Follow it from kindergarten to adults, one lesson at a time.</span></p>
</div></header>
<main id="main">
__CARDS__
<p class="note"><span data-en="Each lesson opens in its course. Good for a family talk, a class discussion, or your own reading." data-es="Cada lección se abre en su curso. Sirve para una charla en familia, una conversación en clase o tu propia lectura.">Each lesson opens in its course. Good for a family talk, a class discussion, or your own reading.</span></p>
</main>
<script src="/aog-grace.js" defer></script>
</body>
</html>
'''

if __name__ == "__main__":
    main()
