#!/usr/bin/env python3
"""AOG-STANDARDS-V2 · 2026-09-28   (V1 · 2026-09-25)

Jimmy: "The crosswalk is supposed to incorporate EVERYTHING, not just the SEL
material."  One front door, /standards ("Standards & Alignment"), for every
part of the site: the academic courses, the SEL lessons, the faith-text
courses, Daily Drafts, the hands-on benches, the practice rooms, and the
framework documents for schools.

Reads
  _work/standards/outlines.json      every course's units (export_outlines.py)
  _work/standards/<course>.json      the unit-by-unit crosswalk, one per course
  _work/standards/benches.json       the hands-on benches, by lesson group
  _work/standards/drafts.json        Daily Drafts subjects and their course
  <course>-u<N>.html                 the "Practice rooms" doors on every unit page
Writes
  aog-standards-data.js     window.AOG_STANDARDS — courses, benches, drafts, rooms
  standards-crosswalk.html  the printable tables: every course and bench, unit by unit
  standards.html            only the regions between <!-- AOG-HUB:x --> and
                            <!-- /AOG-HUB:x -->; everything else is hand-written
The dashboard's Alignment tab renders its "Academic standards" cards from the
data file (aog-standards.js). Re-run after editing any JSON:
  python3 _work/standards/export_outlines.py     # when a course outline changes
  python3 _work/standards/build_standards.py
"""
import json, os, re, html, datetime, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = json.load(open(os.path.join(HERE, "outlines.json"), encoding="utf-8"))

BAND = {"k-2": "Grades K–2", "3-5": "Grades 3–5", "6-8": "Grades 6–8", "9-10": "Grades 9–10", "11-12": "Grades 11–12", "": ""}
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12", "": ""}
BAND_ORDER = ["k-2", "3-5", "6-8", "9-10", "11-12"]
BAND_LO = {"k-2": "K", "3-5": "3", "6-8": "6", "9-10": "9", "11-12": "11"}
BAND_HI = {"k-2": "2", "3-5": "5", "6-8": "8", "9-10": "10", "11-12": "12"}

COURSES = [
    # key, group, name EN, name ES, hub page, unit page pattern, short slug pattern, fallback slug pattern (older room pages)
    ("sci", "academic", "Science",                    "Ciencias",                                  "science-course.html",          "sci-u{n}.html", "sci{n}", None),
    ("mth", "academic", "Mathematics",                "Matemáticas",                               "math-course.html",             "mth-u{n}.html", "mth{n}", None),
    ("ela", "academic", "English Language Arts",      "Lengua y Literatura (inglés)",              "english-course.html",          "ela-u{n}.html", "ela{n}", None),
    ("ss",  "academic", "Social Studies",             "Estudios Sociales",                         "social-studies-course.html",   "ssc-u{n}.html", "ssc{n}", None),
    ("ush", "academic", "U.S. History",               "Historia de EE. UU.",                       "us-history.html",              "ush-u{n}.html", "ush{n}", None),
    ("eco", "academic", "Economics",                  "Economía",                                  "economics-course.html",        "eco-u{n}.html", "eco{n}", "ec{n}"),
    ("wcs", "academic", "World Cultures & Societies", "Culturas y Sociedades del Mundo",           "world-cultures-course.html",   "wcs-u{n}.html", "wcs{n}", None),
    ("med", "academic", "Medicine & Health",          "Medicina y Salud",                          "medicine-health-course.html",  "med-u{n}.html", "med{n}", None),
    ("spt", "academic", "Sports History",             "Historia del deporte",                      "sports-course.html",           "spt-u{n}.html", "spt{n}", None),
    ("mar", "academic", "The Measured Step",          "El paso medido",                            "martial-arts-course.html",     "mar-u{n}.html", "mar{n}", None),
    ("rel", "academic", "World Religions",            "Religiones del Mundo",                      "religions-course.html",        "rel-u{n}.html", "rel{n}", "r{n}"),
    ("spa", "academic", "Spanish",                    "Español",                                   "spanish-course.html",          "spa-u{n}.html", "spa{n}", None),
    ("fcs", "academic", "Family & Consumer Sciences", "Ciencias de la Familia y del Consumidor",   "facs-course.html",             "fcs-u{n}.html", "fcs{n}", None),
    ("bib", "faith",    "The Bible",                  "La Biblia",                                 "bible-course.html",            "bib-u{n}.html", "bib{n}", None),
    ("heb", "faith",    "The Hebrew Bible",           "La Biblia hebrea",                          "hebrew-bible-course.html",     "heb-u{n}.html", "heb{n}", None),
    ("qur", "faith",    "The Qur’an",                 "El Corán",                                  "quran-course.html",            "qur-u{n}.html", "qur{n}", None),
    ("tal", "faith",    "The Talmud",                 "El Talmud",                                 "talmud-course.html",           "tal-u{n}.html", "tal{n}", None),
    ("hin", "faith",    "Hindu Texts",                "Textos hindúes",                            "hindu-texts-course.html",      "hin-u{n}.html", "hin{n}", None),
    ("bud", "faith",    "Buddhist Texts",             "Textos budistas",                           "buddhist-texts-course.html",   "bud-u{n}.html", "bud{n}", None),
    ("chn", "faith",    "Chinese Classics",           "Clásicos chinos",                           "chinese-classics-course.html", "chn-u{n}.html", "chn{n}", None),
    ("unr", "faith",    "The Unseen Realm",           "El reino invisible",                        "unseen-realm-course.html",     "unr-u{n}.html", "unr{n}", None),
]
HUB_FALLBACK = {"eco": "economics-hub.html", "rel": "religions-hub.html", "fcs": "facs-hub.html", "spa": "spanish-hub.html"}
UNIT_PREFIX = {c[5].split("-u")[0]: c[0] for c in COURSES}          # "ssc" -> "ss"
BENCH_SLUGS = {"/microscope", "/telescope", "/waves", "/drums", "/decks", "/turntables", "/kitchen"}


def exists(rel):
    return os.path.exists(os.path.join(ROOT, rel))


def exists_glob(prefix):
    """an older room page such as ec1-scarcity-and-choice.html or r10-religion-and-the-world.html"""
    return any(f.startswith(prefix + "-") and f.endswith(".html") for f in os.listdir(ROOT))


def redirects():
    m = {}
    for line in open(os.path.join(ROOT, "_redirects"), encoding="utf-8"):
        p = line.split()
        if len(p) >= 2 and p[0].startswith("/") and not line.lstrip().startswith("#"):
            m.setdefault(p[0], p[1])
    return m


REDIR = redirects()


def resolves(href):
    """True when a site path would load a page on Netlify: a redirect rule or a file (pretty URL)."""
    p = href.split("#")[0].split("?")[0]
    if not p or p == "/": return True
    if p in REDIR:
        t = REDIR[p].split("?")[0]
        return t.startswith("http") or exists(t.lstrip("/"))
    return exists(p.lstrip("/")) or exists(p.lstrip("/") + ".html")


def unit_link(upat, spat, fpat, n):
    f = upat.format(n=n)
    if exists(f):
        slug = "/" + spat.format(n=n)
        return slug if REDIR.get(slug, "").lstrip("/") == f else "/" + f
    if fpat and exists_glob(fpat.format(n=n)):
        return "/" + fpat.format(n=n)
    return ""


def span(bands):
    bs = [b for b in BAND_ORDER if b in bands]
    if not bs: return ""
    lo, hi = BAND_LO[bs[0]], BAND_HI[bs[-1]]
    return ("K–12" if (lo, hi) == ("K", "12") else "%s–%s" % (lo, hi))


def load_course(key):
    p = os.path.join(HERE, key + ".json")
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else None


def build():
    data = []
    for key, group, name, name_es, hub, upat, spat, fpat in COURSES:
        cw = load_course(key)
        if not cw or key not in OUT:
            print("  (no crosswalk or outline yet)", key)
            continue
        by_n = {u["n"]: u.get("standards", []) for u in cw.get("units", [])}
        units = []
        for u in OUT[key]["units"]:
            units.append({"n": u["n"], "title": u["title"], "band": BAND.get(u.get("band", ""), ""), "bandKey": u.get("band", ""),
                          "strand": u.get("strand", "") or u.get("years", ""), "link": unit_link(upat, spat, fpat, u["n"]),
                          "standards": by_n.get(u["n"], [])})
        hub_page = hub if exists(hub) else HUB_FALLBACK.get(key, hub)
        ncodes = sum(len(u["standards"]) for u in units)
        sp = span({u["bandKey"] for u in units})
        g = "Grades " + sp if sp and sp != "K–12" else sp
        g_es = "Grados " + sp if sp and sp != "K–12" else sp
        data.append({"key": key, "group": group, "name": name, "nameEs": name_es,
                     "subject": "%s · %d units" % (g, len(units)), "subjectEs": "%s · %d unidades" % (g_es, len(units)),
                     "hub": "/" + hub_page.replace(".html", ""), "hubExists": exists(hub_page),
                     "framework": cw.get("framework", {}), "units": units, "codes": ncodes,
                     "unmapped": sum(1 for u in units if not u["standards"])})
        print("  %-5s %-8s %2d units  %3d codes  %s" % (key, group, len(units), ncodes, cw.get("framework", {}).get("short", "")))
    return data


def benches():
    p = os.path.join(HERE, "benches.json")
    b = json.load(open(p, encoding="utf-8"))["benches"] if os.path.exists(p) else []
    for x in b:
        x["codes"] = sum(len(g["standards"]) for g in x["groups"])
        print("  bench %-10s %2d groups %3d codes" % (x["key"], len(x["groups"]), x["codes"]))
    return b


def drafts(data):
    p = os.path.join(HERE, "drafts.json")
    d = json.load(open(p, encoding="utf-8"))["subjects"] if os.path.exists(p) else []
    by = {c["key"]: c for c in data}
    for s in d:
        c = by.get(s.get("course"))
        s["bands"] = []
        if c and not s.get("family"):
            for b in BAND_ORDER:
                us = [u for u in c["units"] if u["bandKey"] == b]
                if us: s["bands"].append({"band": b, "units": len(us), "codes": sum(len(u["standards"]) for u in us)})
    return d


def rooms(data):
    """Every "Practice rooms" door on every unit page: the room, and the units it belongs to."""
    titles = {(c["key"], u["n"]): u["title"] for c in data for u in c["units"]}
    names = {c["key"]: c["name"] for c in data}
    skip = re.compile(r"^/(drops/|[a-z-]+-course$|religions(#.*)?$|economics$|us-history$|bible$|hebrew-bible$|quran$|talmud$|"
                      r"(" + "|".join(sorted(UNIT_PREFIX)) + r")\d+$)")
    found = collections.OrderedDict()
    for f in sorted(os.listdir(ROOT), key=lambda s: [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", s)]):
        m = re.match(r"^([a-z]+)-u(\d+)\.html$", f)
        if not m or m.group(1) not in UNIT_PREFIX: continue
        key, n = UNIT_PREFIX[m.group(1)], int(m.group(2))
        s = open(os.path.join(ROOT, f), encoding="utf-8").read()
        sec = re.search(r'<section class="rooms">(.*?)</section>', s, re.S)
        if not sec: continue
        for href, t in re.findall(r'<a class="door" href="([^"]+)">([^<]*)</a>', sec.group(1)):
            if skip.match(href) or href.split("#")[0].split("?")[0] in BENCH_SLUGS: continue
            r = found.setdefault(href, {"href": href, "title": html.unescape(t), "units": [], "resolves": resolves(href)})
            if (key, n) not in [(x["course"], x["n"]) for x in r["units"]]:
                r["units"].append({"course": key, "n": n, "title": titles.get((key, n), "")})
    out = list(found.values())
    for r in out:
        cnt = collections.Counter(x["course"] for x in r["units"])
        r["home"] = sorted(cnt, key=lambda k: (-cnt[k], [c["key"] for c in data].index(k)))[0]
    bad = [r["href"] for r in out if not r["resolves"]]
    print("  rooms: %d practice rooms from the unit pages%s" % (len(out), ("; NOT RESOLVING: " + ", ".join(bad)) if bad else ""))
    return out


def esc(s):
    return html.escape(str(s or ""), quote=True)


def bi(en, es, tag="span", cls=""):
    """one bilingual leaf: aog-topbar.js swaps data-en / data-es"""
    c = (' class="%s"' % cls) if cls else ""
    return '<%s%s data-en="%s" data-es="%s">%s</%s>' % (tag, c, esc(en), esc(es), esc(en), tag)


# ─────────────────────────── the printable crosswalk ───────────────────────────
def course_section(c):
    fw = c["framework"]
    rows = []
    for u in c["units"]:
        title = '<a href="%s">%s</a>' % (esc(u["link"]), esc(u["title"])) if u["link"] else esc(u["title"])
        codes = "".join('<li><code>%s</code> %s</li>' % (esc(s.get("code")), esc(s.get("text"))) for s in u["standards"]) \
            or '<li class="none">— not yet mapped —</li>'
        rows.append('<tr id="%s-u%d"><td class="u"><span class="n">Unit %d</span>%s<div class="meta">%s%s</div></td><td><ul>%s</ul></td></tr>'
                    % (c["key"], u["n"], u["n"], title, esc(u["band"]), (" · " + esc(u["strand"])) if u["strand"] else "", codes))
    hub = ('<a class="btn" href="%s">%s</a>' % (esc(c["hub"]), bi("Open the course", "Abrir el curso"))) if c["hubExists"] else ""
    return '''
<section class="course" id="%(key)s">
  <div class="c-head">
    <div><div class="eyebrow">%(subject)s</div><h2>%(name)s</h2>
    <p class="fw"><strong>%(fwname)s</strong>%(fwshort)s</p>
    <p class="note">%(fwnote)s</p></div>
    <div class="c-acts">%(hub)s<a class="btn ghost" href="#top">%(top)s</a></div>
  </div>
  <details class="ufold"><summary>%(unitsbtn)s</summary><table><thead><tr><th>%(th1)s</th><th>%(th2)s</th></tr></thead><tbody>%(rows)s</tbody></table></details>
</section>''' % dict(key=c["key"], subject=bi(c["subject"], c["subjectEs"]), name=bi(c["name"], c["nameEs"]), fwname=esc(fw.get("name", "")),
                     fwshort=(" (" + esc(fw.get("short")) + ")") if fw.get("short") else "", fwnote=esc(fw.get("note", "")), hub=hub,
                     unitsbtn=bi("Show every unit and standard", "Mostrar cada unidad y estándar"), top=bi("Top", "Arriba"), th1=bi("Unit", "Unidad"), th2=bi("Standards this unit addresses", "Estándares que aborda esta unidad"), rows="".join(rows))


def bench_rows(b, anchor=True):
    rows = []
    for g in b["groups"]:
        codes = "".join('<li><code>%s</code> %s</li>' % (esc(s["code"]), esc(s["text"])) for s in g["standards"])
        rows.append('<tr%s><td class="u"><span class="n">%s %s</span>%s</td><td><ul>%s</ul></td></tr>'
                    % ((' id="%s-g%d"' % (b["key"], g["n"])) if anchor else "", "Lessons" if "–" in g["lessons"] else "Lesson", esc(g["lessons"]), esc(g["title"]), codes))
    return "".join(rows)


def bench_section(b):
    fw = b["framework"]
    return '''
<section class="course" id="bench-%(key)s">
  <div class="c-head">
    <div><div class="eyebrow">%(eyebrow)s</div><h2>%(name)s</h2>
    <p class="fw"><strong>%(fwname)s</strong> (%(fwshort)s)</p>
    <p class="note">%(fwnote)s</p></div>
    <div class="c-acts"><a class="btn" href="%(page)s">%(open)s</a><a class="btn ghost" href="#top">%(top)s</a></div>
  </div>
  <details class="ufold"><summary>%(unitsbtn)s</summary><table><thead><tr><th>%(th1)s</th><th>%(th2)s</th></tr></thead><tbody>%(rows)s</tbody></table></details>
</section>''' % dict(key=b["key"], eyebrow=bi("Hands-on bench · %d lessons" % b["lessonCount"], "Mesa práctica · %d lecciones" % b["lessonCount"]),
                     name=esc(b["name"]), fwname=esc(fw["name"]), fwshort=esc(fw["short"]), fwnote=esc(fw["note"]), page=esc(b["page"]),
                     open=bi("Open the bench", "Abrir la mesa"), unitsbtn=bi("Show every unit and standard", "Mostrar cada unidad y estándar"), top=bi("Top", "Arriba"), th1=bi("Lessons", "Lecciones"),
                     th2=bi("Standards these lessons address", "Estándares que abordan estas lecciones"), rows=bench_rows(b))


HEAD_FIRST = ('<style id="aog-first-paint">/* AOG-ONE-PAINT-V1 (2026-09-27) — Jimmy: moving between units was "very choppy, makes me sick". The page now shows once, fully built: it waits on its paper colour until the shared scripts and fonts are in (aog-sketch.js adds .aog-ready), and never longer than ~1 s even if a script fails. No fade, no motion. */'
              'html{background:#F7F2E6}html[data-theme="dark"]{background:#0A1E33}html:not(.aog-ready) body{visibility:hidden;animation:aogOnePaint 0s linear 1.1s forwards}@keyframes aogOnePaint{to{visibility:visible}}@media print{html:not(.aog-ready) body{visibility:visible;animation:none}}</style>'
              '<script>/* AOG-LIGHT-START-V1 — Jimmy: "All pages should start in light mode." Light unless this site was switched to dark. */(function(){var h=document.documentElement;if(!h.getAttribute("data-theme"))h.setAttribute("data-theme","light");})();</script>')


LEDE_EN = ('Every course and hands-on bench, unit by unit, with the standards it addresses. Mapped by the course author; '
           'use it beside your district’s own review. The front door for everything is <a href="/standards">Standards &amp; Alignment</a>.')
LEDE_ES = ('Cada curso y cada mesa práctica, unidad por unidad, con los estándares que aborda. Lo alineó el autor del curso; '
           'úsalo junto a la revisión de tu distrito. La entrada para todo es <a href="/standards">Estándares y alineación</a>.')


def page_html(data, bs, today):
    total_units = sum(len(c["units"]) for c in data)
    total_codes = sum(c["codes"] for c in data)
    opts = "".join('<a href="#%s" data-aog-group="%s">%s</a>' % (c["key"], "Academic courses" if c["group"] == "academic" else "Faith & texts", esc(c["name"])) for c in data) \
        + "".join('<a href="#bench-%s" data-aog-group="Hands-on benches">%s</a>' % (b["key"], esc(b["name"])) for b in bs)
    secs = ['<h2 class="grp" id="academic">%s</h2>' % bi("Academic courses", "Cursos académicos")]
    secs += [course_section(c) for c in data if c["group"] == "academic"]
    secs += ['<h2 class="grp" id="faith">%s</h2>' % bi("Faith & texts", "Fe y textos")]
    secs += [course_section(c) for c in data if c["group"] == "faith"]
    secs += ['<h2 class="grp" id="benches">%s</h2>' % bi("Hands-on benches", "Mesas prácticas")]
    secs += [bench_section(b) for b in bs]
    tpl = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">@@first@@
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>(function(){var t="light";try{if(localStorage.getItem("aog.theme.lightstart.v1")==="1"&&localStorage.getItem("aog.interior.ws.v1.theme")==="dark")t="dark";}catch(e){}document.documentElement.setAttribute("data-theme",t);})();</script>
<title>Standards Crosswalk — Architecture of Grace</title>
<meta name="description" content="Every Architecture of Grace course and hands-on bench mapped, unit by unit, to the standards it addresses: NGSS, the Illinois Learning Standards, C3, NHES, ACTFL, CEE, the National Core Arts Standards and the National FCS Standards.">
<link rel="canonical" href="https://architectureofgrace.org/standards-crosswalk">
<link rel="icon" href="/favicon.ico" sizes="any">
<meta name="theme-color" content="#0A1E33">
<!-- AOG-STANDARDS-V2 — built by _work/standards/build_standards.py from _work/standards/*.json. Do not hand-edit; edit the JSON and re-run. -->
<style>
:root{--ground:#F5F1E8;--field:#FFFFFF;--field-2:#EFEAE0;--ink:#1D2733;--ink-soft:#57626F;--ink-faint:#5F6B78;--navy:#0A1E33;--navy-2:#1B3A5F;--gold:#B8893A;--gold-deep:#7A5C1F;--rule:#DDD4C3;--serif:Fraunces,"Cormorant Garamond",Georgia,serif;--sans:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
html[data-theme="dark"]{--ground:#0A1E33;--field:#13314F;--field-2:#0F2A45;--ink:#F4EEE2;--ink-soft:#C8D4E2;--ink-faint:#A9B8CA;--gold:#F2C964;--gold-deep:#F2C964;--rule:rgba(244,238,226,.16)}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);line-height:1.5}
a{color:inherit}
.ufold{margin-top:10px;border:1.5px solid var(--rule);border-radius:14px;background:var(--field);color:var(--ink)}
.ufold>summary{cursor:pointer;min-height:44px;padding:11px 16px;font-weight:700;font-size:16px;color:var(--ink)}
.ufold[open]>summary{border-bottom:1.5px solid var(--rule)}
@media print{.ufold>summary{display:none}.ufold{border:0}}
header.page{background:var(--navy);color:#F4EEE2;padding:56px 16px 44px}
header.page .in{max-width:1040px;margin:0 auto}
header.page .eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#F2C964;font-weight:700}
header.page h1{font-family:var(--serif);font-weight:600;font-size:clamp(30px,4.6vw,46px);line-height:1.08;margin:8px 0 12px;color:#F4EEE2}
header.page .lede{font-size:16px;color:#C8D4E2;max-width:70ch;margin:0 0 14px}
header.page .lede a{color:#F2C964;font-weight:700}
header.page .nav{font-size:13px;color:#C8D4E2}
header.page .nav a{color:#F2C964;text-decoration:none;font-weight:700;margin-right:10px}
header.page .aogdd{color:#F4EEE2}
main{max-width:1040px;margin:0 auto;padding:12px 16px 60px}
.stats{display:flex;gap:18px;flex-wrap:wrap;margin:22px 0 6px;font-size:13px;color:var(--ink-soft)}
.stats b{font-family:var(--serif);font-size:22px;color:var(--gold-deep);margin-right:6px}
h2.grp{font-family:var(--serif);font-weight:600;font-size:22px;margin:46px 0 0;padding:10px 0 0;border-top:3px solid var(--gold);color:var(--gold-deep);letter-spacing:.02em}
section.course{margin:34px 0 0;padding-top:26px;border-top:1px solid var(--rule)}
.c-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;flex-wrap:wrap}
.eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold-deep);font-weight:700}
h2{font-family:var(--serif);font-weight:600;font-size:28px;margin:4px 0 6px}
.fw{margin:0 0 4px;font-size:14px}
.note{margin:0;font-size:12.5px;color:var(--ink-soft);max-width:72ch}
.c-acts{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
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
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;background:var(--field-2);color:var(--navy-2);border-radius:6px;padding:2px 7px;margin-right:6px;white-space:normal;overflow-wrap:anywhere}
html[data-theme="dark"] code{color:#F2C964}
@media (max-width:560px){td.u{width:40%}table{font-size:13px}td{padding:10px 6px}}
footer.foot{max-width:1040px;margin:0 auto;padding:0 16px 40px;font-size:12px;color:var(--ink-faint)}
@media print{header.page{background:#fff;color:#000;padding:0 0 12px}header.page h1,header.page .lede,header.page .nav{color:#000}header.page .eyebrow{color:#7A5C1F}.c-acts,.nav{display:none}section.course{break-before:page}code{background:#eee;color:#000}body{background:#fff;color:#000}}
</style>
</head>
<body>
<script src="/aog-topbar.js"></script>
<a id="top"></a>
<header class="page">
  <div class="in">
    <div class="eyebrow">@@eyebrow@@</div>
    <h1>@@h1@@</h1>
    <p class="lede">@@lede@@</p>
    <nav class="nav" aria-label="Courses" data-aog-dropdown="Go to|Ir a">@@opts@@</nav>
  </div>
</header>
<main>
  <div class="stats"><span><b>@@nc@@</b>@@lc@@</span><span><b>@@nu@@</b>@@lu@@</span><span><b>@@ncodes@@</b>@@ls@@</span><span><b>@@nb@@</b>@@lb@@</span><span>@@upd@@ @@today@@</span></div>
  @@secs@@
</main>
<footer class="foot">Architecture of Grace · Standards crosswalk · NGSS is a registered trademark of WestEd; Common Core State Standards © NGA Center and CCSSO; C3 Framework © NCSS; NHES © SHAPE America / American Cancer Society; National Core Arts Standards © SEADAE; ACTFL World-Readiness Standards © ACTFL; CEE standards © Council for Economic Education; National Standards for FCS Education © NASAFACS. Codes are cited for alignment; the wording beside each code is this site's own summary. None of these bodies has reviewed or endorsed this curriculum.</footer>
<script src="/aog-grace.js" defer></script>
<script src="/aog-dropdowns.js" defer></script>
<script>/* One subject at a time (Jimmy: "I don't like the one major scroll"): each table folds away; a link to a subject or unit opens it. */
(function(){function op(){var id=location.hash.slice(1);if(!id)return;var el=document.getElementById(id);if(!el)return;var d=el.matches("section.course")?el.querySelector("details.ufold"):el.closest("details.ufold");if(d&&!d.open){d.open=true;el.scrollIntoView();}}
op();window.addEventListener("hashchange",op);
window.addEventListener("beforeprint",function(){document.querySelectorAll("details.ufold").forEach(function(d){d.open=true;});});})();</script>
</body>
</html>
'''
    rep = dict(first=HEAD_FIRST, opts=opts, nc=len(data), nu=total_units, ncodes=total_codes, nb=len(bs), today=today, secs="".join(secs),
               eyebrow=bi("Standards & Alignment · the full tables", "Estándares y alineación · las tablas completas"),
               h1=bi("Standards Crosswalk", "Cruce con los estándares"),
               lede=('<span data-en="%s" data-es="%s">%s</span>' % (esc(LEDE_EN), esc(LEDE_ES), LEDE_EN)),
               lc=bi("courses", "cursos"), lu=bi("units", "unidades"), ls=bi("standards cited", "estándares citados"), lb=bi("hands-on benches", "mesas prácticas"),
               upd=bi("Updated", "Actualizado"))
    for k, v in rep.items():
        tpl = tpl.replace("@@" + k + "@@", str(v))
    return tpl


# ─────────────────────────── the /standards hub regions ───────────────────────────
def course_cards(cs):
    out = []
    for c in cs:
        fw = c["framework"]
        out.append('<article class="ccard"><h3>%s</h3><p class="cmeta">%s</p><p class="cfw"><code>%s</code></p>'
                   '<p class="cnum"><b>%d</b> %s</p><p class="cacts"><a class="hbtn" href="/standards-crosswalk#%s">%s</a>%s</p></article>'
                   % (bi(c["name"], c["nameEs"]), bi(c["subject"], c["subjectEs"]), esc(fw.get("short", "")), c["codes"],
                      bi("standards cited", "estándares citados"), c["key"], bi("Every unit and standard", "Cada unidad y estándar"),
                      ('<a class="hbtn ghost" href="%s">%s</a>' % (esc(c["hub"]), bi("Open the course", "Abrir el curso"))) if c["hubExists"] else ""))
    return '<div class="cgrid">' + "".join(out) + '</div>'


def region_academic(data):
    cs = [c for c in data if c["group"] == "academic"]
    nu, nc = sum(len(c["units"]) for c in cs), sum(c["codes"] for c in cs)
    return ('<p class="hcount">%s</p>' % bi("%d courses · %d units · %d standards cited" % (len(cs), nu, nc),
                                            "%d cursos · %d unidades · %d estándares citados" % (len(cs), nu, nc))) + course_cards(cs)


def region_faith(data):
    cs = [c for c in data if c["group"] == "faith"]
    nu, nc = sum(len(c["units"]) for c in cs), sum(c["codes"] for c in cs)
    return ('<p class="hcount">%s</p>' % bi("%d courses · %d units · %d standards cited" % (len(cs), nu, nc),
                                            "%d cursos · %d unidades · %d estándares citados" % (len(cs), nu, nc))) + course_cards(cs)


def region_benches(bs):
    out = []
    for b in bs:
        fw = b["framework"]
        out.append('<h3 class="bh">%s <span class="bsub">%s</span></h3><p class="bfw"><code>%s</code> %s</p>'
                   '<div class="tblwrap"><table class="tbl xw"><thead><tr><th>%s</th><th>%s</th></tr></thead><tbody>%s</tbody></table></div>'
                   '<p class="cacts"><a class="hbtn" href="%s">%s</a><a class="hbtn ghost" href="%s">%s</a></p>'
                   % (esc(b["name"]), bi("%d lessons" % b["lessonCount"], "%d lecciones" % b["lessonCount"]), esc(fw["short"]), esc(fw["note"]),
                      bi("Lessons", "Lecciones"), bi("Standards", "Estándares"), bench_rows(b, anchor=False),
                      esc(b["page"]), bi("Open the bench", "Abrir la mesa"), esc(b["lessonsPage"]), bi("The lesson sheets", "Las hojas de lecciones")))
    return "".join(out)


def region_drafts(ds, data):
    by = {c["key"]: c for c in data}
    how = {"built": ("Made fresh each day from skill patterns for the grade.", "Se crean cada día con patrones de destrezas del grado."),
           "bank": ("Chosen from question sets written for each grade band, on the course’s topics.", "Se eligen de grupos de preguntas escritos para cada banda de grados, sobre los temas del curso."),
           "prompt": ("A short writing task for the day.", "Una tarea corta de escritura para el día.")}
    rows = []
    for s in ds:
        c = by.get(s.get("course"))
        if s.get("family"):
            std = '%s <span class="sub">%s</span>' % (esc(s["family"]), bi("Family only. These items are not tagged to single codes.", "Solo la familia. Estas preguntas no llevan códigos sueltos."))
        elif c:
            bands = " · ".join("%s: %d" % (span({x["band"]}), x["codes"]) for x in s["bands"])
            std = '<code>%s</code> <a href="/standards-crosswalk#%s">%s</a><span class="sub">%s</span>' % (
                esc(c["framework"].get("short", "")), c["key"], bi("The %s standards, band by band" % c["name"], "Los estándares de %s, por bandas" % c["nameEs"]),
                esc(bands))
        else:
            std = "—"
        grades = span({x["band"] for x in s["bands"]}) or span({u["bandKey"] for u in c["units"]}) if c else "K–12"
        rows.append('<tr><td><a href="/drops/%s">%s</a></td><td>%s</td><td>%s</td><td>%s</td></tr>'
                    % (esc(s["s"]), bi(s["en"], s["es"]), esc(grades), bi(*how[s["how"]]), std))
    return ('<div class="tblwrap"><table class="tbl xw"><thead><tr><th>%s</th><th>%s</th><th>%s</th><th>%s</th></tr></thead><tbody>%s</tbody></table></div>'
            % (bi("Subject", "Materia"), bi("Grades", "Grados"), bi("How the day's lines are made", "Cómo se hacen las líneas del día"),
               bi("Standards they draw on", "Estándares en los que se basan"), "".join(rows)))


def region_rooms(rs, data):
    by = collections.OrderedDict((c["key"], []) for c in data)
    names = {c["key"]: (c["name"], c["nameEs"]) for c in data}
    for r in rs: by[r["home"]].append(r)
    out = []
    for k, lst in by.items():
        if not lst: continue
        items = []
        for r in lst:
            us = collections.OrderedDict()
            for x in r["units"]: us.setdefault(x["course"], []).append(x)
            parts = []
            for ck, xs in us.items():
                links = ", ".join('<a href="/standards-crosswalk#%s-u%d">%d</a>' % (ck, x["n"], x["n"]) for x in sorted(xs, key=lambda x: x["n"]))
                parts.append('%s %s' % (bi("%s unit%s" % (names[ck][0], "s" if len(xs) > 1 else ""), "%s, unidad%s" % (names[ck][1], "es" if len(xs) > 1 else "")), links))
            items.append('<li><a class="rm" href="%s">%s</a><span class="sub">%s %s</span></li>' % (esc(r["href"]), esc(r["title"]), bi("Standards of:", "Estándares de:"), " · ".join(parts)))
        out.append('<h3 class="bh">%s <span class="bsub">%s</span></h3><ul class="rooms">%s</ul>'
                   % (bi(names[k][0], names[k][1]), bi("%d rooms" % len(lst), "%d salas" % len(lst)), "".join(items)))
    return "".join(out)


def region_glance(data, bs, ds, rs):
    ac = [c for c in data if c["group"] == "academic"]; fc = [c for c in data if c["group"] == "faith"]
    def cnt(cs): return sum(len(c["units"]) for c in cs), sum(c["codes"] for c in cs)
    au, acodes = cnt(ac); fu, fcodes = cnt(fc)
    blessons = sum(b["lessonCount"] for b in bs); bcodes = sum(b["codes"] for b in bs); bgroups = sum(len(b["groups"]) for b in bs)
    rows = [
        ("academic", ("Academic courses", "Cursos académicos"), ("%d courses · %d units · %d standards" % (len(ac), au, acodes), "%d cursos · %d unidades · %d estándares" % (len(ac), au, acodes)),
         ("NGSS, Illinois ELA, Math and Social Science, C3, NHES, ACTFL, CEE, FCS", "NGSS, Illinois ELA, Matemáticas y Ciencias Sociales, C3, NHES, ACTFL, CEE, FCS")),
        ("sel", ("SEL lessons", "Lecciones SEL"), ("140 lessons · 75 Illinois SEL benchmarks", "140 lecciones · 75 estándares SEL de Illinois"), ("CASEL, Illinois SEL", "CASEL, SEL de Illinois")),
        ("faith", ("Faith & texts", "Fe y textos"), ("%d courses · %d units · %d standards" % (len(fc), fu, fcodes), "%d cursos · %d unidades · %d estándares" % (len(fc), fu, fcodes)),
         ("Common Core reading, C3, Illinois SS 9–12, teaching about religion", "Lectura Common Core, C3, Illinois SS 9–12, enseñar sobre religión")),
        ("drafts", ("Daily Drafts", "Daily Drafts"), ("%d subjects · K–12" % len(ds), "%d materias · K–12" % len(ds)), ("The standards of each subject's course", "Los estándares del curso de cada materia")),
        ("benches", ("Hands-on benches", "Mesas prácticas"), ("%d benches · %d lessons · %d standards" % (len(bs), blessons, bcodes), "%d mesas · %d lecciones · %d estándares" % (len(bs), blessons, bcodes)),
         ("NGSS, National Core Arts (Music), FCS", "NGSS, Artes (Música), FCS")),
        ("rooms", ("Practice rooms", "Salas de práctica"), ("%d rooms, each tied to its units" % len(rs), "%d salas, cada una unida a sus unidades" % len(rs)), ("The standards of the units they belong to", "Los estándares de sus unidades")),
        ("frameworks", ("Frameworks for schools", "Marcos para escuelas"), ("6 documents", "6 documentos"), ("Illinois SEL, CASEL, restorative practices, the matrices", "SEL de Illinois, CASEL, prácticas restaurativas, las matrices")),
        ("iep", ("IEP · MTSS · Danielson", "IEP · MTSS · Danielson"), ("5 documents", "5 documentos"), ("Danielson, MTSS, IDEA, consent and PPRA", "Danielson, MTSS, IDEA, consentimiento y PPRA")),
    ]
    trs = "".join('<tr><td><a href="#%s" data-go="%s"><b>%s</b></a></td><td>%s</td><td>%s</td></tr>' % (k, k, bi(*n), bi(*w), bi(*f)) for k, n, w, f in rows)
    return ('<div class="tblwrap"><table class="tbl"><thead><tr><th>%s</th><th>%s</th><th>%s</th></tr></thead><tbody>%s</tbody></table></div>'
            % (bi("Part of the site", "Parte del sitio"), bi("What is mapped", "Qué está alineado"), bi("Against", "Con"), trs))


def region_stats(data, bs):
    nu, nc = sum(len(c["units"]) for c in data), sum(c["codes"] for c in data)
    return bi("%d courses · %d units · %d standards cited, plus %d hands-on benches and the 140 SEL lessons."
              % (len(data), nu, nc, len(bs)),
              "%d cursos · %d unidades · %d estándares citados, más %d mesas prácticas y las 140 lecciones SEL."
              % (len(data), nu, nc, len(bs)), "p", "hstats")


def fill_hub(regions):
    p = os.path.join(ROOT, "standards.html")
    s = open(p, encoding="utf-8").read()
    for k, v in regions.items():
        a, b = "<!-- AOG-HUB:%s -->" % k, "<!-- /AOG-HUB:%s -->" % k
        i, j = s.find(a), s.find(b)
        if i < 0 or j < 0:
            print("  (standards.html has no region %s)" % k); continue
        s = s[:i + len(a)] + v + s[j:]
    open(p, "w", encoding="utf-8").write(s)


def main():
    print("standards crosswalk")
    data = build()
    bs = benches()
    ds = drafts(data)
    rs = rooms(data)
    today = datetime.date.today().isoformat()
    slim = [{k: v for k, v in c.items()} for c in data]
    for c in slim:
        c["units"] = [{k: v for k, v in u.items() if k != "bandKey"} for u in c["units"]]
    js = ("/* AOG-STANDARDS-V2 · built %s by _work/standards/build_standards.py — do not hand-edit */\n"
          "window.AOG_STANDARDS = %s;\n") % (today, json.dumps({"built": today, "courses": slim, "benches": bs,
                                                                 "drafts": [{k: s[k] for k in ("s", "en", "es", "course", "how") if k in s} for s in ds],
                                                                 "rooms": [{k: r[k] for k in ("href", "title", "home", "units")} for r in rs]},
                                                                ensure_ascii=False, separators=(",", ":")))
    open(os.path.join(ROOT, "aog-standards-data.js"), "w", encoding="utf-8").write(js)
    open(os.path.join(ROOT, "standards-crosswalk.html"), "w", encoding="utf-8").write(page_html(data, bs, today))
    fill_hub({"stats": region_stats(data, bs), "glance": region_glance(data, bs, ds, rs), "academic": region_academic(data),
              "faith": region_faith(data), "drafts": region_drafts(ds, data), "benches": region_benches(bs), "rooms": region_rooms(rs, data)})
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
    nu, nc = sum(len(c["units"]) for c in data), sum(c["codes"] for c in data)
    print("wrote aog-standards-data.js, standards-crosswalk.html, standards.html hub — %d courses · %d units · %d standards cited · %d benches (%d codes) · %d rooms"
          % (len(data), nu, nc, len(bs), sum(b["codes"] for b in bs), len(rs)))


if __name__ == "__main__":
    main()
