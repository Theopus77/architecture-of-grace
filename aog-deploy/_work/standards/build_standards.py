#!/usr/bin/env python3
"""AOG-STANDARDS-V1 · 2026-09-25

Jimmy: "With all the curriculum being built I should have all the state
standards and the such for all the curriculum on this page as well."

Reads _work/standards/<course>.json (one per course, written from the course
outlines) and emits:
  aog-standards-data.js   window.AOG_STANDARDS — every course, unit and code
  standards-crosswalk.html  the printable crosswalk (standards.html is the SEL Standards & Alignment page), one section per course
The dashboard's Alignment tab renders its "Academic standards" cards from the
data file (aog-standards.js). Re-run after editing any JSON:
  python3 _work/standards/build_standards.py
"""
import json, os, html, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = json.load(open(os.path.join(HERE, "outlines.json"), encoding="utf-8"))

BAND = {"k-2": "Grades K–2", "3-5": "Grades 3–5", "6-8": "Grades 6–8", "9-10": "Grades 9–10", "11-12": "Grades 11–12", "": ""}

COURSES = [
    # key, display name, subject line, hub page, unit page pattern, short slug pattern
    ("sci",  "Science",                    "K–12 · 27 units",          "science-course.html",        "sci-u{n}.html",  "sci{n}"),
    ("mth",  "Mathematics",                "K–12 · 27 units",          "math-course.html",           "mth-u{n}.html",  "mth{n}"),
    ("ela",  "English Language Arts",      "K–12 · 24 units",          "english-course.html",        "ela-u{n}.html",  "ela{n}"),
    ("ss",   "Social Studies",             "K–12 · 24 units",          "social-studies-course.html", "ssc-u{n}.html",  "ssc{n}"),
    ("ush",  "U.S. History",               "Grades 6–8 · 10 units",    "us-history.html",            "ush-u{n}.html",  "ush{n}"),
    ("econ", "Economics",                  "High school · 8 units",    "economics-hub.html",         "ec{n}",          "ec{n}"),
    ("spa",  "Spanish",                    "K–12 · 20 units",          "spanish-hub.html",           "spa-u{n}.html",  "spa{n}"),
    ("facs", "Family & Consumer Sciences", "K–12 · 20 units",          "facs-hub.html",              "fc{n}",          "fc{n}"),
]

# titles for the two courses that have no outline.py
EXTRA_TITLES = {
    "econ": {1: "Scarcity, Choice and Opportunity Cost", 2: "Supply, Demand and the Market", 3: "Prices, Controls and Market Failure",
             4: "Competition, Firms and Market Structure", 5: "Measuring the Economy", 6: "The Business Cycle and Fiscal Policy",
             7: "Money, Banking and the Federal Reserve", 8: "Trade, Taxes and the World Economy"},
    "facs": {1: "Kitchen Safety and Sanitation", 2: "Knife Skills", 3: "Measuring and Reading a Recipe", 4: "Hand Sewing", 5: "The Sewing Machine",
             6: "Fabric, Fibers and Patterns", 7: "Cooking Methods and Heat", 8: "Nutrition and Meal Planning", 9: "Food Science — What Happens When You Cook",
             10: "Child Development and Care", 11: "Independent Living and Money", 12: "Capstone — Plan, Cost, Produce",
             13: "Clean Hands", 14: "Hot, Cold and Sharp", 15: "Everyday Food and Sometimes Food", 16: "A Job Done to the End",
             17: "Measure It Right", 18: "The Needle and the Button", 19: "Money and Choices", 20: "Plan It, Cook It, Clean It Up"},
}
EXTRA_BANDS = {"econ": lambda n: "9-10",
               # the FACS hub's own bands: 1–4 grades 6–8, 5–8 grades 9–10, 9–12 grades 11–12, 13–16 K–2, 17–20 grades 3–5
               "facs": lambda n: ("6-8" if n <= 4 else "9-10" if n <= 8 else "11-12" if n <= 12 else "k-2" if n <= 16 else "3-5")}


def exists(rel):
    return os.path.exists(os.path.join(ROOT, rel))


def load_course(key):
    p = os.path.join(HERE, key + ".json")
    if not os.path.exists(p):
        return None
    return json.load(open(p, encoding="utf-8"))


def build():
    data = []
    for key, name, subj, hub, upat, spat in COURSES:
        cw = load_course(key)
        if not cw:
            print("  (no crosswalk yet)", key)
            continue
        by_n = {u["n"]: u.get("standards", []) for u in cw.get("units", [])}
        units = []
        if key in OUT:
            src = OUT[key]["units"]
            for u in src:
                page = upat.format(n=u["n"])
                units.append({"n": u["n"], "title": u["title"], "band": BAND.get(u.get("band", ""), ""),
                              "strand": u.get("strand", "") or u.get("years", ""),
                              "link": "/" + spat.format(n=u["n"]) if exists(page) else "",
                              "standards": by_n.get(u["n"], [])})
        else:
            for n, title in EXTRA_TITLES[key].items():
                page = upat.format(n=n)
                units.append({"n": n, "title": title, "band": BAND[EXTRA_BANDS[key](n)], "strand": "",
                              "link": "/" + spat.format(n=n) if exists(page + (".html" if not page.endswith(".html") else "")) or exists_glob(page) else "",
                              "standards": by_n.get(n, [])})
        ncodes = sum(len(u["standards"]) for u in units)
        data.append({"key": key, "name": name, "subject": subj, "hub": "/" + hub.replace(".html", ""),
                     "hubExists": exists(hub), "framework": cw.get("framework", {}), "units": units, "codes": ncodes})
        print("  %-5s %2d units  %3d codes  %s" % (key, len(units), ncodes, cw.get("framework", {}).get("short", "")))
    return data


def exists_glob(prefix):
    d = os.listdir(ROOT)
    return any(f.startswith(prefix + "-") and f.endswith(".html") for f in d)


def esc(s):
    return html.escape(str(s or ""), quote=True)


def page_html(data, today):
    total_units = sum(len(c["units"]) for c in data)
    total_codes = sum(c["codes"] for c in data)
    secs = []
    nav = " · ".join('<a href="#%s">%s</a>' % (c["key"], esc(c["name"])) for c in data)
    for c in data:
        fw = c["framework"]
        rows = []
        for u in c["units"]:
            title = '<a href="%s">%s</a>' % (esc(u["link"]), esc(u["title"])) if u["link"] else esc(u["title"])
            codes = "".join('<li><code>%s</code> %s</li>' % (esc(s.get("code")), esc(s.get("text"))) for s in u["standards"]) or '<li class="none">— not yet mapped —</li>'
            rows.append('<tr><td class="u"><span class="n">Unit %d</span>%s<div class="meta">%s%s</div></td><td><ul>%s</ul></td></tr>'
                        % (u["n"], title, esc(u["band"]), (" · " + esc(u["strand"])) if u["strand"] else "", codes))
        secs.append('''
<section class="course" id="%(key)s">
  <div class="c-head">
    <div><div class="eyebrow">%(subject)s</div><h2>%(name)s</h2>
    <p class="fw"><strong>%(fwname)s</strong>%(fwshort)s</p>
    <p class="note">%(fwnote)s</p></div>
    <div class="c-acts">%(hub)s<a class="btn ghost" href="#top">Top</a></div>
  </div>
  <table><thead><tr><th>Unit</th><th>Standards this unit addresses</th></tr></thead><tbody>%(rows)s</tbody></table>
</section>''' % dict(key=c["key"], subject=esc(c["subject"]), name=esc(c["name"]), fwname=esc(fw.get("name", "")),
                     fwshort=(" (" + esc(fw.get("short")) + ")") if fw.get("short") else "", fwnote=esc(fw.get("note", "")),
                     hub=('<a class="btn" href="%s">Open the course</a>' % esc(c["hub"])) if c["hubExists"] else "", rows="".join(rows)))
    tpl = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>(function(){var t="light";try{if(localStorage.getItem("aog.interior.ws.v1.theme")==="dark")t="dark";}catch(e){}document.documentElement.setAttribute("data-theme",t);})();</script>
<title>Standards Crosswalk — Architecture of Grace</title>
<meta name="description" content="Every Architecture of Grace course mapped, unit by unit, to the standards it addresses: NGSS, the Illinois Learning Standards for ELA, Mathematics and Social Science, ACTFL, CEE and the National FCS Standards.">
<link rel="canonical" href="https://architectureofgrace.org/standards-crosswalk">
<link rel="icon" href="/favicon.ico" sizes="any">
<meta name="theme-color" content="#0A1E33">
<!-- AOG-STANDARDS-V1 — built by _work/standards/build_standards.py from _work/standards/*.json. Do not hand-edit; edit the JSON and re-run. -->
<style>
:root{--ground:#F5F1E8;--field:#FFFFFF;--field-2:#EFEAE0;--ink:#1D2733;--ink-soft:#57626F;--ink-faint:#5F6B78;--navy:#0A1E33;--navy-2:#1B3A5F;--gold:#B8893A;--gold-deep:#7A5C1F;--rule:#DDD4C3;--serif:Fraunces,"Cormorant Garamond",Georgia,serif;--sans:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
html[data-theme="dark"]{--ground:#0A1E33;--field:#13314F;--field-2:#0F2A45;--ink:#F4EEE2;--ink-soft:#C8D4E2;--ink-faint:#A9B8CA;--gold:#F2C964;--gold-deep:#F2C964;--rule:rgba(244,238,226,.16)}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);line-height:1.5}
a{color:inherit}
header.page{background:var(--navy);color:#F4EEE2;padding:56px 16px 44px}
header.page .in{max-width:1040px;margin:0 auto}
header.page .eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#F2C964;font-weight:700}
header.page h1{font-family:var(--serif);font-weight:600;font-size:clamp(30px,4.6vw,46px);line-height:1.08;margin:8px 0 12px;color:#F4EEE2}
header.page .lede{font-size:16px;color:#C8D4E2;max-width:70ch;margin:0 0 14px}
header.page .nav{font-size:13px;color:#C8D4E2}
header.page .nav a{color:#F2C964;text-decoration:none;font-weight:700}
header.page .nav a:hover{text-decoration:underline}
main{max-width:1040px;margin:0 auto;padding:12px 16px 60px}
.stats{display:flex;gap:18px;flex-wrap:wrap;margin:22px 0 6px;font-size:13px;color:var(--ink-soft)}
.stats b{font-family:var(--serif);font-size:22px;color:var(--gold-deep);margin-right:6px}
section.course{margin:34px 0 0;padding-top:26px;border-top:1px solid var(--rule)}
.c-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;flex-wrap:wrap}
.eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold-deep);font-weight:700}
h2{font-family:var(--serif);font-weight:600;font-size:28px;margin:4px 0 6px}
.fw{margin:0 0 4px;font-size:14px}
.note{margin:0;font-size:12.5px;color:var(--ink-soft);max-width:72ch}
.c-acts{display:flex;gap:8px;align-items:center}
.btn{display:inline-block;font-size:12.5px;font-weight:700;color:#fff;background:var(--navy-2);border-radius:999px;padding:8px 16px;text-decoration:none;border:1px solid transparent}
.btn.ghost{color:var(--ink);background:transparent;border-color:var(--rule)}
table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13.5px}
th{text-align:left;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);padding:0 10px 8px;border-bottom:2px solid var(--gold)}
td{vertical-align:top;padding:12px 10px;border-bottom:1px solid var(--rule)}
td.u{width:34%}
td.u .n{display:block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-deep);font-weight:800}
td.u a{font-family:var(--serif);font-size:16px;text-decoration:none;font-weight:600}
td.u a:hover{text-decoration:underline}
td.u .meta{font-size:12px;color:var(--ink-soft);margin-top:2px}
td ul{margin:0;padding-left:0;list-style:none}
td li{margin:0 0 5px;padding-left:0}
td li.none{color:var(--ink-faint);font-style:italic}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;background:var(--field-2);color:var(--navy-2);border-radius:6px;padding:2px 7px;margin-right:6px;white-space:nowrap}
html[data-theme="dark"] code{color:#F2C964}
footer.foot{max-width:1040px;margin:0 auto;padding:0 16px 40px;font-size:12px;color:var(--ink-faint)}
@media print{header.page{background:#fff;color:#000;padding:0 0 12px}header.page h1,header.page .lede,header.page .nav{color:#000}header.page .eyebrow{color:#7A5C1F}.c-acts,.nav{display:none}section.course{break-before:page}code{background:#eee;color:#000}body{background:#fff;color:#000}}
</style>
</head>
<body>
<script src="/aog-topbar.js"></script>
<a id="top"></a>
<header class="page">
  <div class="in">
    <div class="eyebrow">Alignment · every course</div>
    <h1>Standards Crosswalk</h1>
    <p class="lede">Every course, unit by unit, against the standards it addresses. Mapped by the course author; use it beside your district's own review.</p>
    <div class="nav">@@nav@@</div>
  </div>
</header>
<main>
  <div class="stats"><span><b>@@nc@@</b>courses</span><span><b>@@nu@@</b>units</span><span><b>@@ncodes@@</b>standards cited</span><span>Updated @@today@@</span></div>
  @@secs@@
</main>
<footer class="foot">Architecture of Grace · Standards crosswalk · NGSS is a registered trademark of WestEd; Common Core State Standards © NGA Center and CCSSO; ACTFL World-Readiness Standards © ACTFL; CEE standards © Council for Economic Education; National Standards for FCS Education © NASAFACS. Codes are cited for alignment; the wording beside each code is this site's own summary.</footer>
<script src="/aog-grace.js" defer></script>
</body>
</html>
'''
    for k, v in dict(nav=nav, nc=len(data), nu=total_units, ncodes=total_codes, today=today, secs="".join(secs)).items():
        tpl = tpl.replace("@@" + k + "@@", str(v))
    return tpl


def main():
    print("standards crosswalk")
    data = build()
    today = datetime.date.today().isoformat()
    js = ("/* AOG-STANDARDS-V1 · built %s by _work/standards/build_standards.py — do not hand-edit */\n"
          "window.AOG_STANDARDS = %s;\n") % (today, json.dumps({"built": today, "courses": data}, ensure_ascii=False, separators=(",", ":")))
    open(os.path.join(ROOT, "aog-standards-data.js"), "w", encoding="utf-8").write(js)
    open(os.path.join(ROOT, "standards-crosswalk.html"), "w", encoding="utf-8").write(page_html(data, today))
    # plumbing: the pretty URL and the sitemap line, once each
    rd = os.path.join(ROOT, "_redirects")
    r = open(rd, encoding="utf-8").read()
    if "/standards-crosswalk " not in r:
        r = r.rstrip("\n") + "\n/standards-crosswalk        /standards-crosswalk.html                 200\n"
        open(rd, "w", encoding="utf-8").write(r)
    sm = os.path.join(ROOT, "sitemap.xml")
    s = open(sm, encoding="utf-8").read()
    if "/standards-crosswalk</loc>" not in s:
        s = s.replace("</urlset>", "  <url><loc>https://architectureofgrace.org/standards-crosswalk</loc><lastmod>%s</lastmod><priority>0.8</priority></url>\n</urlset>" % today)
        open(sm, "w", encoding="utf-8").write(s)
    print("wrote aog-standards-data.js, standards-crosswalk.html")


if __name__ == "__main__":
    main()
