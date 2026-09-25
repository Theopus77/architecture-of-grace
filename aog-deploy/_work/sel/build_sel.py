#!/usr/bin/env python3
"""
AOG-SEL-V1 — the SEL Lessons pages (Rooms 12, 18, 36, 104, 207) on the course
engine. Jimmy: "I want a facelift to my SEL curriculum. JUST THE PRESENTATION,
DO NOT CHANGE ANY OF THE CURRICULUM ITSELF, just the interactive engine that it
sits on."

So: the 33 <section class="lesson"> blocks of each room's original Lessons page
(kept in _work/sel/src/room-NN-lessons.orig.html) are lifted BYTE FOR BYTE and
set inside the same chrome the subject courses wear — the site bar, the mast,
a room jump, the unit rail, a drawn unit banner, a lesson strip with ticks, the
contents drawer, prev/next, Listen, print, EN/ES chrome. Nothing inside a
lesson is touched; the builder asserts that on every run.

Also builds room-NN-cards.html — the Scenario Cards, on their own interactive
page (Jimmy: "Can the scenario cards get their own interactive page like the
other tools?") — from _work/sel/cards_NN.json, transcribed verbatim from the
Book 1–5 card decks.

Run from aog-deploy/:  python3 _work/sel/build_sel.py
"""
import re, json, html, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
DEPLOY = HERE.parent.parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
import build_course as BC
from build_course import CSS as COURSE_CSS, ICO, span
try:
    from banners_sel import BANNERS, CREDITS
except Exception:
    BANNERS, CREDITS = {}, {}

E = lambda s: html.escape(str(s if s is not None else ""), quote=True)
SITE = "https://architectureofgrace.org"

ROOMS = [
 dict(n=12,  book=1, bookname="The Foundation", grades="K–2",   es="K–2",   level="Early childhood"),
 dict(n=18,  book=2, bookname="The Framework",  grades="3–5",   es="3–5",   level="Upper elementary"),
 dict(n=36,  book=3, bookname="The Interior",   grades="6–8",   es="6–8",   level="Middle school"),
 dict(n=104, book=4, bookname="The Facade",     grades="9–10",  es="9–10",  level="High school"),
 dict(n=207, book=5, bookname="The Capstone",   grades="11–12", es="11–12", level="High school"),
]
BY_N = {r["n"]: r for r in ROOMS}
UNIT_COLORS = {"u1": "#17646B", "u2": "#6B4696", "u3": "#A63A2B", "u4": "#8A6A1F"}
UNIT_COLORS_DARK = {"u1": "#5FB8B0", "u2": "#B99AD9", "u3": "#E08573", "u4": "#D9B45C"}

# ─────────────────────────────────────────────────────────────────── parse the original
def parse(n):
    src = (HERE / "src" / ("room-%d-lessons.orig.html" % n)).read_text(encoding="utf-8")
    d = {}
    d["title"] = re.search(r"<title>(.*?)</title>", src, re.S).group(1)
    d["desc"] = re.search(r'<meta name="description" content="([^"]*)"', src).group(1)
    d["og"] = (re.search(r'og:image" content="([^"]*)"', src) or [None, SITE + "/og-prep.png?v=1"])[1]
    d["ogalt"] = (re.search(r'og:image:alt" content="([^"]*)"', src) or [None, ""])[1]
    d["tag"] = re.search(r'<p class="tag">(.*?)</p>', src, re.S).group(1).strip()
    d["mats"] = re.findall(r'<div class="mats">(.*?)</div>', src, re.S)[0]
    d["mats"] = re.findall(r'<a href="([^"]*)">(.*?)</a>', d["mats"])
    # the select: unit labels and lesson labels, in order
    sel = re.search(r'<select id="lessonSel"[^>]*>(.*?)</select>', src, re.S).group(1)
    groups = []
    for g in re.finditer(r'<optgroup label="([^"]*)">(.*?)</optgroup>', sel, re.S):
        opts = re.findall(r'<option value="([^"]*)">(.*?)</option>', g.group(2), re.S)
        groups.append((g.group(1), opts))
    d["groups"] = groups
    d["order"] = [v for _, opts in groups for v, _ in opts]
    d["label"] = {v: html.unescape(t.strip()) for _, opts in groups for v, t in opts}
    # the sections, verbatim, in document order
    secs = []
    for m in re.finditer(r'<section class="lesson (u\d)" id="([a-z0-9]+)" hidden>(.*?)</section>\n', src, re.S):
        secs.append(dict(unit=m.group(1), id=m.group(2), inner=m.group(3), raw=m.group(0)))
    d["sections"] = secs
    assert [s["id"] for s in secs] == d["order"], "sections and select disagree for room %d" % n
    d["chartdoor"] = json.loads(re.search(r"var CHARTDOOR=(\{.*?\});", src, re.S).group(1))
    d["wstab_tab"] = re.search(r'wsTab\.innerHTML="([^"]*)"', src).group(1)
    d["wstab_direct"] = re.search(r'wsTab\.textContent="([^"]*)"', src).group(1)
    # the content CSS: the original rules that style what is inside a lesson
    css = re.search(r"<style>(.*?)</style>", src, re.S).group(1)
    a = css.index(".lchips{"); b = css.index("footer{")
    d["content_css"] = css[a:b]
    return d

# ─────────────────────────────────────────────────────────────────── CSS
SEL_CSS = r"""
/* ══ AOG-SEL-V1 ══ the lesson's own styles, on the course tokens. The rules
   below the aliases are the original Lessons page's content rules, verbatim
   except that --navy (a link blue there) maps to --navy-2 here. */
:root{ --bg:var(--ground); --card:var(--field); --line:var(--rule); --sub:var(--ink-soft); --chip:var(--field-2);
  --brass:var(--gold-deep); --brass-soft:var(--acc-soft); --risk:var(--caution); --risk-soft:var(--caution-wash);
  --good-soft:var(--good-wash); --shadow:var(--lift-sm);
  --u1:#17646B; --u2:#6B4696; --u3:#A63A2B; --u4:#8A6A1F }
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){ --u1:#5FB8B0; --u2:#B99AD9; --u3:#E08573; --u4:#D9B45C } }
:root[data-theme="dark"]{ --u1:#5FB8B0; --u2:#B99AD9; --u3:#E08573; --u4:#D9B45C }
section.lesson h2{border-bottom:0!important}
section.lesson[hidden]{display:none}
__CONTENT_CSS__

/* ══ the engine around the lesson ══ */
.rail a[data-unit]{--uc:var(--u1)} .rail a[data-unit="u2"]{--uc:var(--u2)} .rail a[data-unit="u3"]{--uc:var(--u3)} .rail a[data-unit="u4"]{--uc:var(--u4)}
.rail a[aria-current="page"][data-unit]{background:var(--uc); border-color:var(--uc); color:#fff}
.rail a.ws{font:700 .84rem var(--sans); letter-spacing:.02em}
.spread .scene[hidden]{display:none}
.spread .unum b.ws{font-size:1.1rem}
.lstrip{margin:14px 0 0; display:flex; gap:6px; align-items:center; overflow-x:auto; scrollbar-width:none; padding-bottom:4px}
.lstrip::-webkit-scrollbar{display:none}
.lstrip[hidden]{display:none}
.lstrip .k{flex:0 0 auto; font:700 .7rem var(--sans); letter-spacing:.14em; text-transform:uppercase; color:var(--ink-faint); margin-right:4px}
.lstrip a{flex:0 0 auto; position:relative; display:inline-flex; align-items:center; justify-content:center; gap:6px; min-width:44px; min-height:44px; padding:0 12px; border-radius:12px; border:1px solid var(--rule); background:var(--field); color:var(--ink); text-decoration:none; font:800 .92rem var(--cond); letter-spacing:.04em}
.lstrip a[aria-current="page"]{background:var(--navy); border-color:var(--navy); color:var(--on-navy)}
:root[data-theme="dark"] .lstrip a[aria-current="page"]{background:var(--gold); border-color:var(--gold); color:#12161C}
.lstrip a .t2{width:9px; height:9px; border-radius:50%; border:1.5px solid var(--rule); display:inline-block}
.lstrip a.done .t2{background:var(--good); border-color:var(--good)}
.lstrip a.ov{font:700 .8rem var(--sans)}
.lescard{margin:16px 0 0; background:var(--field); border:1px solid var(--rule); border-radius:16px; box-shadow:var(--lift-sm); overflow:hidden; scroll-margin-top:70px}
.lescard .lh{display:grid; grid-template-columns:auto 1fr auto; gap:12px; align-items:center; padding:12px 16px; background:var(--field-2); border-bottom:1px solid var(--rule-soft)}
@media(max-width:640px){.lescard .lh{grid-template-columns:auto 1fr} .lescard .lh .tools{grid-column:1/-1}}
.lescard .ln{display:inline-flex; align-items:center; justify-content:center; min-width:52px; height:36px; padding:0 10px; border-radius:8px; background:var(--navy); color:var(--on-navy); font:800 1.05rem var(--cond); letter-spacing:.04em}
:root[data-theme="dark"] .lescard .ln{background:var(--gold); color:#12161C}
.lescard .lh h4{font-size:1.15rem; margin:0}
.lescard .lh .sub{display:block; font:700 .68rem var(--sans); letter-spacing:.14em; text-transform:uppercase; color:var(--ink-faint); margin-top:2px}
.lescard .tools{display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end}
.lescard .body{padding:6px 18px 20px}
.lescard .body > section.lesson{margin-top:6px}
.lescard .lhead{display:none}   /* the unit chip and "Lesson n" line: the header row above carries them now */
.tickbtn .tk{width:20px; height:20px; border-radius:50%; border:2px solid var(--rule); display:inline-flex; align-items:center; justify-content:center; color:transparent; font-size:.7rem}
.tickbtn[aria-pressed="true"] .tk{background:var(--good); border-color:var(--good); color:#fff}
.tickbtn[aria-pressed="true"]{border-color:var(--good)}
.botdoor{margin:22px 0 0; display:flex; gap:10px; flex-wrap:wrap; justify-content:center}
.wstab,.cardsdoor{display:inline-flex; align-items:center; min-height:48px; border:1px solid var(--rule); border-left:4px solid var(--gold); background:var(--field); color:var(--ink); border-radius:12px; padding:0 18px; font:800 .92rem var(--sans); text-decoration:none}
.wstab:hover,.cardsdoor:hover{border-color:var(--gold)}
.wstab[aria-current="true"]{background:var(--field-2)}
.cardsdoor{border-left-color:var(--a)}
.cardsdoor[hidden]{display:none}
.drawer nav .dc .b[data-unit="u1"]{background:var(--u1)} .drawer nav .dc .b[data-unit="u2"]{background:var(--u2)} .drawer nav .dc .b[data-unit="u3"]{background:var(--u3)} .drawer nav .dc .b[data-unit="u4"]{background:var(--u4)}
.drawer nav a[aria-current="page"]{background:var(--field-2); font-weight:700}
.teach .mats{display:flex; gap:8px; flex-wrap:wrap}
.teach .mats a{display:inline-flex; align-items:center; min-height:40px; padding:0 12px; border-radius:999px; border:1px solid var(--rule); background:var(--field-2); color:var(--ink); text-decoration:none; font:600 .84rem var(--sans)}
@media print{
  .lstrip,.lescard .tools,.botdoor,.teach{display:none!important}
  .lescard{border:0; box-shadow:none} .lescard .lh{background:#fff; border-bottom:2px solid #000}
  .step,.box,.duo-col,.kv{break-inside:avoid; box-shadow:none}
}
"""

# ─────────────────────────────────────────────────────────────────── scenario cards CSS
CARDS_CSS = r"""
/* ══ AOG-SEL-CARDS-V1 ══ the Scenario Cards: a deck you can deal from */
.deckintro{margin:18px 0 0; display:grid; grid-template-columns:1.4fr 1fr; gap:18px; align-items:start}
@media(max-width:820px){.deckintro{grid-template-columns:1fr}}
.deckintro .lead p{font-size:1.02rem; line-height:1.6}
.filters{margin:18px 0 0; display:flex; gap:8px; flex-wrap:wrap; align-items:center}
.filters .k{font:700 .7rem var(--sans); letter-spacing:.14em; text-transform:uppercase; color:var(--ink-faint); margin-right:4px}
.fchip{min-height:44px; padding:6px 14px; border-radius:999px; border:1px solid var(--rule); background:var(--field); cursor:pointer; font-weight:700; font-size:.88rem; display:inline-flex; align-items:center; gap:8px}
.fchip[aria-pressed="true"]{background:var(--navy); color:var(--on-navy); border-color:var(--navy)}
:root[data-theme="dark"] .fchip[aria-pressed="true"]{background:var(--gold); color:#12161C; border-color:var(--gold)}
.fchip .dot{width:10px; height:10px; border-radius:50%; background:var(--uc,var(--navy))}
.deal{margin-left:auto}
.lessonblk{margin:26px 0 0; scroll-margin-top:70px}
.lessonblk .sh{display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; padding-bottom:6px; border-bottom:2px solid var(--rule)}
.lessonblk .sh .sn{font:800 .74rem var(--sans); letter-spacing:.2em; text-transform:uppercase; color:var(--uc)}
.lessonblk .sh h3{font-size:1.3rem; margin:0}
.lessonblk[hidden]{display:none}
.cards{margin-top:12px; display:grid; grid-template-columns:1fr 1fr; gap:14px}
@media(max-width:760px){.cards{grid-template-columns:1fr}}
.card{background:var(--field); border:1px solid var(--rule); border-top:6px solid var(--uc); border-radius:16px; box-shadow:var(--lift-sm); padding:14px 16px 16px; display:flex; flex-direction:column; gap:8px; scroll-margin-top:70px; position:relative}
.card[hidden]{display:none}
.card .ch{display:flex; justify-content:space-between; gap:10px; align-items:center}
.card .code{display:inline-flex; align-items:center; height:28px; padding:0 10px; border-radius:6px; background:var(--uc); color:#fff; font:800 .82rem var(--cond); letter-spacing:.08em}
.card .risk{font:800 .8rem var(--sans); color:var(--caution)}
.card h4{font-size:1.15rem; margin:0}
.card .k{font:700 .66rem var(--sans); letter-spacing:.18em; text-transform:uppercase; color:var(--uc); margin-top:4px}
.card .sit{font:1.02rem/1.6 var(--serif); margin:0}
.card ol{margin:0; padding-left:1.3em; display:grid; gap:4px}
.card ol li{font-size:.97rem; line-height:1.45}
.card .note{margin:0; font:italic .9rem/1.45 var(--serif); color:var(--ink-soft); padding:8px 10px; border-left:3px solid var(--gold); background:var(--field-2); border-radius:0 8px 8px 0}
.card .concept{font:600 .9rem var(--sans); color:var(--navy-2); margin:0}
.card .cf{display:flex; gap:8px; flex-wrap:wrap; margin-top:auto; padding-top:8px}
.card .tick{position:absolute; right:14px; top:-3px; width:26px; height:26px; border-radius:50%; border:2px solid var(--rule); background:var(--field); color:transparent; font-size:.8rem; display:inline-flex; align-items:center; justify-content:center; cursor:pointer}
.card.used .tick{background:var(--good); border-color:var(--good); color:#fff}
/* the table: one card, big, for the board */
.board{position:fixed; inset:0; z-index:70; display:none; background:rgba(10,30,51,.6); backdrop-filter:blur(4px)}
.board[data-open="1"]{display:block}
.board .sheet{position:absolute; inset:calc(var(--aogbar-h,52px) + 14px) clamp(8px,4vw,60px) clamp(8px,3vh,28px); background:var(--field); color:var(--ink); border-radius:22px; box-shadow:0 30px 80px rgba(0,0,0,.5); display:flex; flex-direction:column; overflow:hidden; border-top:10px solid var(--uc)}
.board .bh{display:flex; justify-content:space-between; align-items:center; gap:10px; padding:12px 18px; border-bottom:1px solid var(--rule); flex-wrap:wrap}
.board .bh .code{display:inline-flex; align-items:center; height:32px; padding:0 12px; border-radius:6px; background:var(--uc); color:#fff; font:800 .95rem var(--cond); letter-spacing:.08em}
.board .bh h3{font-size:1.2rem; margin:0; flex:1}
.board .bh button{min-width:44px; min-height:44px; border-radius:999px; border:1px solid var(--rule); background:var(--field-2); cursor:pointer; font-size:1.1rem}
.board .bb{flex:1; overflow:auto; padding:clamp(16px,4vw,40px)}
.board .bb .k{font:700 .78rem var(--sans); letter-spacing:.2em; text-transform:uppercase; color:var(--uc); margin-bottom:8px}
.board .bb .sit{font:clamp(1.3rem,3vw,2.1rem)/1.45 var(--serif); margin:0 0 24px; max-width:34ch}
.board .bb ol{margin:0; padding-left:1.2em; display:grid; gap:14px; max-width:40ch}
.board .bb ol li{font:600 clamp(1.05rem,2.2vw,1.5rem)/1.4 var(--sans)}
.board .bb ol li[hidden]{display:none}
.board .bb .note{margin:24px 0 0; font:italic 1rem/1.5 var(--serif); color:var(--ink-soft); border-left:3px solid var(--gold); padding-left:12px; max-width:60ch}
.board .bf{display:flex; gap:8px; flex-wrap:wrap; padding:12px 18px; border-top:1px solid var(--rule); background:var(--field-2)}
@media print{
  .filters,.board,.card .cf,.card .tick,.lstrip{display:none!important}
  .cards{grid-template-columns:1fr 1fr; gap:10mm}
  .card{break-inside:avoid; border:1px solid #000; border-top:6px solid #000; box-shadow:none; min-height:110mm}
  .lessonblk{break-before:page}
  .lessonblk:first-of-type{break-before:auto}
}
"""

# ─────────────────────────────────────────────────────────────────── helpers
def head(title, desc, path, og, ogalt, extra_css):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>/* .30eg: begin in light. Dark only when this device chose it. Same key as every Interior page. */
(function(){{var t="light";try{{if(localStorage.getItem("aog.interior.ws.v1.theme")==="dark")t="dark";}}catch(e){{}}document.documentElement.setAttribute("data-theme",t);}})();</script>
<title>{title}</title>
<meta name="description" content="{desc}">
<!-- ═══ AOG ICONS + LINK PREVIEW · managed block · .30k0 ═══ -->
<link rel="canonical" href="{SITE}/{path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Architecture of Grace">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{SITE}/{path}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{ogalt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{og}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0A1E33">
<meta name="apple-mobile-web-app-title" content="Grace">
<meta name="application-name" content="Architecture of Grace">
<!-- ═══ END AOG ICONS + LINK PREVIEW ═══ -->
<!-- AOG-SEL-V1 — built by _work/sel/build_sel.py. The lesson material is the original Lessons page's, byte for byte (kept in _work/sel/src); only the engine around it is designed. Do not hand-edit; edit the builder and re-run. -->
<!-- No external requests of any kind. Every byte this page needs is in this file (aog-topbar.js is same-origin; a 404 changes nothing but the bar). -->
<style>
{COURSE_CSS}
{extra_css}
</style>
</head>
'''

def room_jump(cur_n, cur_page):
    """The Jump to another room select: every room's Lessons, then this room's doors."""
    rows = []
    rows.append('<optgroup label="SEL · The rooms">')
    for r in ROOMS:
        v = "room-%d-lessons.html" % r["n"]
        rows.append('<option value="%s"%s>Room %d · Grades %s · The Lessons</option>' % (v, ' selected' if (r["n"] == cur_n and cur_page == "lessons") else "", r["n"], r["grades"]))
    rows.append('</optgroup>')
    rows.append('<optgroup label="Room %d">' % cur_n)
    doors = [("room-%d-curriculum.html" % cur_n, "The curriculum"), ("room-%d-lessons.html" % cur_n, "The Lessons"), ("room-%d-cards.html" % cur_n, "Scenario cards"),
             ("room-%d-workbook.html" % cur_n, "The companion workbook"), (charts_page(cur_n), "Anchor charts")]
    for v, t in doors:
        sel = ' selected' if (cur_page == "cards" and "cards" in v) else ""
        rows.append('<option value="%s"%s>%s</option>' % (v, sel, t))
    rows.append('</optgroup>')
    return '<div class="jump no-print"><label>%s<select id="roomSel">%s</select></label></div>' % (span("Jump to another room", "Ir a otro salón"), "\n".join(rows))

def charts_page(n):
    return "AoG-Anchor-Charts.html" if n == 36 else "AoG-Anchor-Charts-%d.html" % n

def unit_titles(d):
    """u1..u4 → the unit title from the select's optgroup label ("Unit 1 · Identity & …")."""
    out = {}
    for label, opts in d["groups"]:
        m = re.match(r"Unit (\d) · (.*)", label)
        if m: out["u" + m.group(1)] = html.unescape(m.group(2))
    return out

def scene(key):
    return BANNERS.get(key, '<svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice"><rect width="1200" height="420" fill="#0A1E33"/></svg>')

# ─────────────────────────────────────────────────────────────────── the Lessons page
def lessons_page(r):
    n = r["n"]; d = parse(n)
    ut = unit_titles(d)
    grades = r["grades"]
    title = "Room %d — The Lessons · Architecture of Grace" % n
    # the rail: units + worksheets
    rail = "".join('<a href="?l=%s" data-unit="%s" data-show="%s" title="%s">%s</a>' % (u, u, u, E(ut[u]), u[1]) for u in ("u1", "u2", "u3", "u4"))
    rail += '<a href="?l=worksheets" class="ws" data-unit="worksheets" data-show="worksheets">%s</a>' % span("Worksheets", "Hojas de trabajo")
    # the spreads: one scene per unit, plus the worksheets screen reusing unit 1's scene
    scenes = "".join('<div class="scene" data-scene="%s" hidden aria-hidden="true">%s</div>' % (u, scene("%d-%s" % (n, u[1]))) for u in ("u1", "u2", "u3", "u4"))
    credits = json.dumps({u: CREDITS.get("%d-%s" % (n, u[1]), "") for u in ("u1", "u2", "u3", "u4")})
    # the lesson strips, one per unit
    strips = []
    for u in ("u1", "u2", "u3", "u4"):
        ids = [i for i in d["order"] if i == u or (i.startswith(u + "l"))]
        pills = []
        for i in ids:
            if i == u:
                pills.append('<a href="?l=%s" class="ov" data-show="%s">%s</a>' % (i, i, span("Overview", "Resumen")))
            else:
                ln = i.split("l")[1]
                pills.append('<a href="?l=%s" data-show="%s" data-lid="%s" title="%s">L%s<span class="t2"></span></a>' % (i, i, i, E(d["label"][i]), ln))
        strips.append('<nav class="lstrip no-print" data-strip="%s" hidden aria-label="Lessons"><span class="k">%s</span>%s</nav>' % (u, span("Lesson", "Lección"), "".join(pills)))
    # every section, verbatim
    body_secs = "".join(s["raw"] for s in d["sections"])
    # drawer
    dn = ['<a href="?l=worksheets" data-show="worksheets"><span class="n">✎</span>%s</a>' % span("The interactive worksheets", "Las hojas de trabajo interactivas")]
    for u in ("u1", "u2", "u3", "u4"):
        dn.append('<div class="dc"><span class="b" data-unit="%s">%s</span>%s</div>' % (u, u[1], E(ut[u])))
        dn.append('<a href="?l=%s" data-show="%s"><span class="n">—</span>%s</a>' % (u, u, span("Unit overview", "Resumen de la unidad")))
        for i in d["order"]:
            if i.startswith(u + "l"):
                ln = i.split("l")[1]
                lab = re.sub(r"^L\d+ · ", "", d["label"][i])
                dn.append('<a href="?l=%s" data-show="%s" data-lid="%s"><span class="n">%s.%s</span>%s<span class="t2"></span></a>' % (i, i, i, u[1], ln, lab))
    labels = {i: dict(unit=s["unit"], title=re.sub(r"^L\d+ · ", "", d["label"][i]), num=(("%s.%s" % (i[1], i.split("l")[1])) if "l" in i[1:] else "")) for i, s in zip(d["order"], d["sections"])}
    for i in labels:
        if i == "worksheets": labels[i]["unit"] = "worksheets"
    mats = "".join('<a href="%s">%s</a>' % (E(h), t) for h, t in d["mats"])
    jb = room_jump(n, "lessons")
    body = f'''<body>
<script src="/aog-topbar.js"></script>
<script src="/aog-grace.js" defer></script>
<div class="wrap">
<header class="mast">
  <div>
    <div class="k">{span("The Interior — SEL · Room %d ·" % n, "El Interior — SEL · Salón %d ·" % n)}<span class="k" style="margin-left:6px">{span("Book %d · %s · Grades %s" % (r["book"], r["bookname"], grades), "Libro %d · Grados %s" % (r["book"], r["es"]))}</span></div>
    <h1 data-en="Room {n} · The Lessons" data-es="Salón {n} · Las lecciones">Room {n} · The Lessons</h1>
    <p class="deck">{d["tag"]}</p>
    <p class="hubline no-print"><a id="hubLink" href="room-{n}-curriculum.html">{span("← Room %d, the curriculum" % n, "← Salón %d, el currículo" % n)}</a></p>
  </div>
  <div class="row no-print">
    <button class="chipbtn" id="langBtn" type="button">Español</button>
    <button class="chipbtn" id="themeBtn" type="button" data-en="Dark" data-es="Oscuro">Dark</button>
  </div>
</header>

<main id="main">
{jb}
<nav class="rail no-print" aria-label="Units"><div class="in"><span class="k">{span("Unit","Unidad")}</span>{rail}<span class="sp"></span><button type="button" class="drawerbtn" id="drawerBtn" aria-controls="drawer" aria-expanded="false">{ICO["list"]}{span("Contents","Contenido")}</button></div></nav>

<section class="spread" aria-labelledby="ut" id="spread">
  {scenes}
  <div class="credit" id="credit"></div>
  <div class="txt">
    <div class="unum"><b id="unum">1</b><span id="ukind">{span("Unit","Unidad")}</span></div>
    <h2 class="ut" id="ut"></h2>
    <div class="years">{span("Room %d · Grades %s · %s" % (n, grades, r["level"]), "Salón %d · Grados %s" % (n, r["es"]))}</div>
  </div>
</section>

{"".join(strips)}

<article class="lescard" id="lescard">
  <div class="lh">
    <span class="ln" id="lnum">1.1</span>
    <div><h4 id="ltitle"></h4><span class="sub" id="lsub"></span></div>
    <div class="tools no-print">
      <button type="button" class="lbtn tickbtn" id="tickBtn" aria-pressed="false"><span class="tk">✓</span><span>{span("Taught","Enseñada")}</span></button>
      <button type="button" class="lbtn listen" id="listenBtn" aria-pressed="false">{ICO["speak"]}<span>{span("Listen","Escuchar")}</span></button>
      <button type="button" class="lbtn" id="printBtn">{span("Print this lesson","Imprimir esta lección")}</button>
    </div>
  </div>
  <div class="body">
{body_secs}
  </div>
</article>

<!-- .30gf / .30gp: the doors stay at the BOTTOM of the page (Jimmy: "I was talking about bringing this to the bottom of the page, not the top."). The chart door builds the lesson's anchor chart; the cards door opens the lesson's scenario cards. -->
<div class="botdoor no-print">
  <a id="wsTab" class="wstab" href="?l=worksheets" data-mode="tab" aria-current="false">{d["wstab_tab"]}</a>
  <a id="cardsDoor" class="cardsdoor" href="room-{n}-cards.html" hidden>{span("This lesson’s scenario cards — the deck →", "Las tarjetas de escenario de esta lección →")}</a>
</div>

<nav class="pager2 no-print" aria-label="Lessons"><a href="#" id="prevA"><span>‹</span><span><span class="s">{span("Previous","Anterior")}</span><span id="prevT"></span></span></a><a href="#" id="nextA"><span><span class="s">{span("Next","Siguiente")}</span><span id="nextT"></span></span><span>›</span></a></nav>

<details class="teach no-print"><summary>{span("For the teacher","Para el docente")}</summary><div class="inner">
  <p>{span("Every lesson is here word for word as the Book %d master prints it. Pick a unit on the rail, then a lesson; the tick marks a lesson taught and stays on this device only. Nothing typed here leaves the room." % r["book"], "Cada lección está aquí palabra por palabra como la imprime el libro %d. Elige una unidad y luego una lección; la marca señala una lección enseñada y se guarda solo en este dispositivo." % r["book"])}</p>
  <div class="mats">{mats}<a href="room-{n}-cards.html">{span("Scenario cards","Tarjetas de escenario")}</a></div>
</div></details>

<footer class="foot">{span("Architecture of Grace · Room %d · Book %d · %s · Grades %s · the banners are drawn scenes, not photographs." % (n, r["book"], r["bookname"], grades), "Architecture of Grace · Salón %d · Libro %d · Grados %s · los banners son escenas dibujadas, no fotografías." % (n, r["book"], r["es"]))}</footer>
</main>
</div>

<div class="drawer" id="drawer" data-open="0" role="dialog" aria-modal="true" aria-label="Contents">
  <div class="scrim" data-close></div>
  <div class="sheet"><div class="dh"><b>{span("Room %d · contents" % n, "Salón %d · contenido" % n)}</b><button type="button" data-close aria-label="Close">✕</button></div><nav>{"".join(dn)}</nav></div>
</div>

<script>
{JS_LESSONS.replace("__KEY__", "aog.interior.ws.v1.sel%d" % n).replace("__ORDER__", json.dumps(d["order"])).replace("__LABELS__", json.dumps(labels, ensure_ascii=False)).replace("__UNITS__", json.dumps(ut, ensure_ascii=False)).replace("__CHARTDOOR__", json.dumps(d["chartdoor"])).replace("__CHARTPAGE__", charts_page(n)).replace("__WSTAB_TAB__", json.dumps(d["wstab_tab"])).replace("__WSTAB_DIRECT__", json.dumps(d["wstab_direct"])).replace("__CREDITS__", credits).replace("__ROOM__", str(n))}
</script>
</body>
</html>
'''
    page = head(title, d["desc"], "lessons%d" % n, d["og"], d["ogalt"], SEL_CSS.replace("__CONTENT_CSS__", d["content_css"].replace("var(--navy)", "var(--navy-2)"))) + body
    # the promise: every lesson section is in the page byte for byte
    for s in d["sections"]:
        assert s["raw"] in page, "section %s changed in room %d" % (s["id"], n)
    out = DEPLOY / ("room-%d-lessons.html" % n)
    out.write_text(page, encoding="utf-8")
    print("wrote %s %d bytes · %d sections verbatim" % (out.name, len(page.encode("utf-8")), len(d["sections"])))

JS_LESSONS = r"""
(function(){
"use strict";
/* AOG-SEL-V1 — the wiring for one room's Lessons page. Every lesson was set at
   build time, verbatim; this only chooses which one shows and remembers ticks. */
var KEY="__KEY__", ORDER=__ORDER__, L=__LABELS__, UNITS=__UNITS__, CHARTDOOR=__CHARTDOOR__, CREDITS=__CREDITS__;
function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||"{}")||{}; }catch(e){ return {}; } }
var d=load(); d.done=d.done||{};
function persist(){ try{ localStorage.setItem(KEY, JSON.stringify(d)); }catch(e){} }
var lang="en";
function T(en,es){ return lang==="es"?es:en; }
function paintLang(){
  document.documentElement.setAttribute("lang", lang);
  Array.prototype.forEach.call(document.querySelectorAll("[data-en]"), function(el){
    var v=el.getAttribute(lang==="es"?"data-es":"data-en"); if(v==null) return;
    if(v.indexOf("<b>")>-1) el.innerHTML=v; else el.textContent=v;
  });
  var lb=document.getElementById("langBtn"); if(lb) lb.textContent=(lang==="es")?"English":"Español";
  paintHead(cur);
}
document.getElementById("langBtn").addEventListener("click", function(){ lang=(lang==="es")?"en":"es"; paintLang(); });
document.getElementById("themeBtn").addEventListener("click", function(){
  var t=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";
  document.documentElement.setAttribute("data-theme", t);
  try{ localStorage.setItem("aog.interior.ws.v1.theme", t); }catch(e){}
});
var cur=ORDER[0];
function unitOf(id){ return L[id].unit; }
function sec(id){ return document.getElementById(id); }
function paintHead(id){
  var u=unitOf(id), ln=document.getElementById("lnum"), lt=document.getElementById("ltitle"), ls=document.getElementById("lsub");
  var un=document.getElementById("unum"), uk=document.getElementById("ukind"), ut=document.getElementById("ut"), cr=document.getElementById("credit");
  Array.prototype.forEach.call(document.querySelectorAll(".spread .scene"), function(s){ s.hidden = s.getAttribute("data-scene")!==(u==="worksheets"?"u1":u); });
  if(u==="worksheets"){
    un.textContent="✎"; un.className="ws"; uk.textContent=T("Room __ROOM__","Salón __ROOM__"); ut.textContent=T("The Worksheets","Las hojas de trabajo"); cr.textContent=CREDITS.u1||"";
    ln.textContent="✎"; lt.textContent=T("The interactive worksheets","Las hojas de trabajo interactivas"); ls.textContent="";
  } else {
    un.textContent=u.slice(1); un.className=""; uk.textContent=T("Unit","Unidad"); ut.textContent=UNITS[u]; cr.textContent=CREDITS[u]||"";
    if(L[id].num){ ln.textContent=L[id].num; lt.textContent=L[id].title; ls.textContent=T("Unit "+u.slice(1)+" · Lesson "+id.split("l")[1], "Unidad "+u.slice(1)+" · Lección "+id.split("l")[1]); }
    else { ln.textContent=u.slice(1); lt.textContent=UNITS[u]; ls.textContent=T("Unit overview","Resumen de la unidad"); }
  }
  var tb=document.getElementById("tickBtn"); tb.hidden=!L[id].num; tb.setAttribute("aria-pressed", String(!!d.done[id]));
  var i=ORDER.indexOf(id), p=ORDER[(i-1+ORDER.length)%ORDER.length], nx=ORDER[(i+1)%ORDER.length];
  document.getElementById("prevT").textContent=L[p].num?("L"+p.split("l")[1]+" · "+L[p].title):(L[p].unit==="worksheets"?T("Worksheets","Hojas de trabajo"):T("Unit "+p.slice(1)+" overview","Resumen de la unidad "+p.slice(1)));
  document.getElementById("nextT").textContent=L[nx].num?("L"+nx.split("l")[1]+" · "+L[nx].title):(L[nx].unit==="worksheets"?T("Worksheets","Hojas de trabajo"):T("Unit "+nx.slice(1)+" overview","Resumen de la unidad "+nx.slice(1)));
  document.getElementById("prevA").setAttribute("href","?l="+p); document.getElementById("nextA").setAttribute("href","?l="+nx);
}
function paintTicks(){
  Array.prototype.forEach.call(document.querySelectorAll("[data-lid]"), function(a){ a.classList.toggle("done", !!d.done[a.getAttribute("data-lid")]); });
}
function show(id, push){
  if(ORDER.indexOf(id)<0) id=ORDER[0];
  cur=id; var u=unitOf(id);
  ORDER.forEach(function(x){ sec(x).hidden=(x!==id); });
  Array.prototype.forEach.call(document.querySelectorAll(".rail a[data-unit]"), function(a){ if(a.getAttribute("data-unit")===u) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  Array.prototype.forEach.call(document.querySelectorAll(".lstrip"), function(s){ s.hidden=(s.getAttribute("data-strip")!==u); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-show]"), function(a){ if(a.getAttribute("data-show")===id) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  paintHead(id);
  /* .30gp — the bottom door builds the CHART on a lesson, opens the Worksheets screen elsewhere */
  var wsTab=document.getElementById("wsTab"), c=CHARTDOOR[id];
  wsTab.setAttribute("aria-current", String(id==="worksheets"));
  if(c){ wsTab.setAttribute("data-mode","direct"); wsTab.setAttribute("href","__CHARTPAGE__#"+c); wsTab.textContent=__WSTAB_DIRECT__; }
  else { wsTab.setAttribute("data-mode","tab"); wsTab.setAttribute("href","?l=worksheets"); wsTab.innerHTML=__WSTAB_TAB__; }
  var cd=document.getElementById("cardsDoor"); var hasCards=!!sec(id).querySelector(".box.cards");
  cd.hidden=!hasCards; cd.setAttribute("href","room-__ROOM__-cards.html#"+id);
  try{ var q=new URLSearchParams(location.search); q.set("l",id); (push?history.pushState:history.replaceState).call(history,null,"","?"+q.toString()); }catch(e){}
  stopSpeak();
  if(push){ var top=document.getElementById("spread").getBoundingClientRect().top+window.pageYOffset-60; window.scrollTo({top:Math.max(0,top),behavior:"smooth"}); }
}
document.addEventListener("click", function(ev){
  var a=ev.target.closest("a[data-show]"); if(!a) return;
  ev.preventDefault(); show(a.getAttribute("data-show"), true); closeDrawer();
});
document.getElementById("wsTab").addEventListener("click", function(e){ var w=e.currentTarget; if(w.getAttribute("data-mode")==="tab"){ e.preventDefault(); show("worksheets",true); } });
document.getElementById("prevA").addEventListener("click", function(e){ e.preventDefault(); show(ORDER[(ORDER.indexOf(cur)-1+ORDER.length)%ORDER.length], true); });
document.getElementById("nextA").addEventListener("click", function(e){ e.preventDefault(); show(ORDER[(ORDER.indexOf(cur)+1)%ORDER.length], true); });
document.getElementById("tickBtn").addEventListener("click", function(){ if(d.done[cur]) delete d.done[cur]; else d.done[cur]=1; persist(); paintTicks(); paintHead(cur); });
document.getElementById("printBtn").addEventListener("click", function(){ window.print(); });
window.addEventListener("popstate", function(){ var q=new URLSearchParams(location.search); show(q.get("l")||ORDER[1], false); });

/* ── Listen: the lesson, read aloud (speechSynthesis; quiet if absent) ── */
var speaking=false, lb=document.getElementById("listenBtn");
function stopSpeak(){ try{ window.speechSynthesis && window.speechSynthesis.cancel(); }catch(e){} speaking=false; lb.setAttribute("aria-pressed","false"); }
if(!("speechSynthesis" in window)) lb.hidden=true;
lb.addEventListener("click", function(){
  if(speaking){ stopSpeak(); return; }
  var s=sec(cur), parts=[];
  Array.prototype.forEach.call(s.querySelectorAll("h2,h3,h4,p,li,.step,.blab,.openq,.kvr,td"), function(el){ var t=(el.innerText||el.textContent||"").replace(/\s+/g," ").trim(); if(t) parts.push(t); });
  var u=new SpeechSynthesisUtterance(parts.join(". ")); u.lang="en-US"; u.rate=.95;
  u.onend=function(){ speaking=false; lb.setAttribute("aria-pressed","false"); };
  speaking=true; lb.setAttribute("aria-pressed","true"); window.speechSynthesis.speak(u);
});

/* ── the contents drawer ── */
var drawer=document.getElementById("drawer"), dBtn=document.getElementById("drawerBtn"), lastFocus=null;
function openDrawer(){ lastFocus=document.activeElement; drawer.setAttribute("data-open","1"); dBtn.setAttribute("aria-expanded","true"); document.body.style.overflow="hidden"; var f=drawer.querySelector('nav a[aria-current="page"]')||drawer.querySelector("nav a"); if(f) f.focus(); }
function closeDrawer(){ if(drawer.getAttribute("data-open")!=="1") return; drawer.setAttribute("data-open","0"); dBtn.setAttribute("aria-expanded","false"); document.body.style.overflow=""; if(lastFocus) lastFocus.focus(); }
dBtn.addEventListener("click", function(){ drawer.getAttribute("data-open")==="1"?closeDrawer():openDrawer(); });
drawer.addEventListener("click", function(ev){ if(ev.target.closest("[data-close]")) closeDrawer(); });
document.addEventListener("keydown", function(ev){ if(ev.key==="Escape") closeDrawer(); });

/* the room jump */
var rs=document.getElementById("roomSel"); if(rs){ rs.addEventListener("change", function(){ if(rs.value) location.href=rs.value; }); }

paintTicks();
var q=new URLSearchParams(location.search); show(q.get("l")||"u1", false);
})();
"""

# ─────────────────────────────────────────────────────────────────── the Scenario Cards page
def cards_page(r):
    n = r["n"]
    src = HERE / ("cards_%d.json" % n)
    if not src.exists():
        print("cards_%d.json not there yet — skipping the cards page" % n); return
    C = json.loads(src.read_text(encoding="utf-8"))
    d = parse(n); ut = unit_titles(d)
    title = "Room %d — Scenario Cards · Architecture of Grace" % n
    total = sum(len(u["cards"]) for u in C["units"])
    desc = "The %d scenario cards of Room %d (Grades %s), on one interactive page: a situation and its discussion questions for every lesson — deal one to the board, reveal the questions one at a time, read it aloud, print the deck." % (total, n, r["grades"])
    rail = "".join('<a href="#unit-%d" data-unit="u%d" title="%s">%d</a>' % (u["n"], u["n"], E(u["title"]), u["n"]) for u in C["units"])
    scenes = '<div class="scene" aria-hidden="true">%s</div>' % scene("%d-1" % n)
    how = "".join("<p>%s</p>" % E(p) for p in C.get("howToUse", []))
    blocks = []
    for u in C["units"]:
        uc = "u%d" % u["n"]
        blocks.append('<section class="unit-spread" id="unit-%d" style="--uc:var(--%s)"><div class="bandhead"><span class="bk">%s %d</span><h2>%s</h2><p class="bd">%d %s</p></div>' % (
            u["n"], uc, span("Unit", "Unidad"), u["n"], E(u["title"]), len(u["cards"]), span("cards", "tarjetas")))
        by_lesson = {}
        for c in u["cards"]:
            by_lesson.setdefault(c.get("lesson") or 0, []).append(c)
        for ln in sorted(by_lesson):
            cs = by_lesson[ln]
            lid = "u%dl%s" % (u["n"], ln) if ln else "u%d" % u["n"]
            lt = cs[0].get("lessonTitle") or ""
            blocks.append('<div class="lessonblk" id="%s" data-unit="%s"><div class="sh"><span class="sn">%s</span><h3>%s</h3></div><div class="cards">' % (
                lid, uc, span("Lesson %s" % ln, "Lección %s" % ln) if ln else span("Unit", "Unidad"), E(lt)))
            for c in cs:
                qs = "".join("<li>%s</li>" % E(q) for q in c.get("questions", []))
                risk = '<span class="risk" title="risk-flagged">%s</span>' % E(c["risk"]) if c.get("risk") else ""
                note = '<p class="note"><b>%s</b> %s</p>' % (span("Teacher note — not read to students.", "Nota para el docente — no se lee a los estudiantes."), E(c["teacherNote"])) if c.get("teacherNote") else ""
                concept = '<p class="concept">%s</p>' % E(c["concept"]) if c.get("concept") else ""
                extra = "".join('<div class="k">%s</div><p class="sit" style="font-size:.95rem">%s</p>' % (E(k), E(v)) for k, v in (c.get("extra") or {}).items())
                kind = c.get("kind") or "scenario"
                cid = "c-" + (re.sub(r"[^A-Za-z0-9]+", "-", c["code"]).strip("-").lower() or ("%s-%s-%d" % (lid, kind, cs.index(c) + 1)))
                codechip = ('<span class="code">%s</span>' % E(c["code"])) if c.get("code") else ('<span class="code" style="background:var(--gold-deep)">%s</span>' % (span("Family connection","Conexión familiar") if kind == "family" else span("Compliance note","Nota de cumplimiento") if kind == "compliance" else span("Card","Tarjeta")))
                who = ('<span class="k" style="margin-top:0">%s</span>' % E(c["character"])) if c.get("character") else ""
                blocks.append(f'''<article class="card" id="{cid}" data-code="{E(c["code"] or "")}" data-risk="{E(c.get("risk",""))}" data-unit="{uc}">
  <button type="button" class="tick" data-used="{cid}" title="Mark used">✓</button>
  <div class="ch">{codechip}{risk}</div>
  <h4>{E(c.get("title") or lt)}</h4>{who}
  <div class="k">{span("The situation","La situación")}</div>
  <p class="sit">{E(c["situation"])}</p>
  {('<div class="k">' + span("Discussion questions","Preguntas para conversar") + '</div><ol>' + qs + '</ol>') if qs else ''}
  {concept}{extra}{note}
  <div class="cf no-print"><button type="button" class="lbtn deal1" data-deal="{cid}">{ICO["list"]}<span>{span("Put on the board","Poner en la pizarra")}</span></button><button type="button" class="lbtn listen1" data-say="{cid}">{ICO["speak"]}<span>{span("Listen","Escuchar")}</span></button></div>
</article>''')
            blocks.append('</div></div>')
        blocks.append('</section>')
    jb = room_jump(n, "cards")
    body = f'''<body>
<script src="/aog-topbar.js"></script>
<script src="/aog-grace.js" defer></script>
<div class="wrap contents">
<header class="mast">
  <div>
    <div class="k">{span("The Interior — SEL · Room %d ·" % n, "El Interior — SEL · Salón %d ·" % n)}<span class="k" style="margin-left:6px">{span("Book %d · %s · Grades %s" % (r["book"], r["bookname"], r["grades"]), "Libro %d · Grados %s" % (r["book"], r["es"]))}</span></div>
    <h1 data-en="Room {n} · Scenario Cards" data-es="Salón {n} · Tarjetas de escenario">Room {n} · Scenario Cards</h1>
    <p class="deck">{span("Every scenario card of the deck, by unit and lesson — a real situation and its discussion questions. Put one on the board and reveal the questions one at a time, deal a random card from a unit, tick the ones you have used, or print the deck two to a page.", "Todas las tarjetas de escenario del mazo, por unidad y lección — una situación real y sus preguntas. Pon una en la pizarra y revela las preguntas una por una, reparte una al azar, marca las usadas o imprime el mazo.")}</p>
    <p class="hubline no-print"><a href="room-{n}-lessons.html">{span("← Room %d, the lessons" % n, "← Salón %d, las lecciones" % n)}</a></p>
  </div>
  <div class="row no-print">
    <button class="chipbtn" id="langBtn" type="button">Español</button>
    <button class="chipbtn" id="themeBtn" type="button" data-en="Dark" data-es="Oscuro">Dark</button>
  </div>
</header>

<main id="main">
{jb}
<nav class="rail no-print" aria-label="Units"><div class="in"><span class="k">{span("Unit","Unidad")}</span>{rail}<span class="sp"></span><button type="button" class="lbtn" id="printDeck">{span("Print the deck","Imprimir el mazo")}</button></div></nav>

<section class="spread" aria-labelledby="ut">
  {scenes}
  <div class="txt">
    <div class="unum"><b>{total}</b>{span("cards","tarjetas")}</div>
    <h2 class="ut" id="ut">{span("Scenario Cards","Tarjetas de escenario")}</h2>
    <div class="years">{span("Room %d · Grades %s · two cards a lesson" % (n, r["grades"]), "Salón %d · Grados %s" % (n, r["es"]))}</div>
  </div>
</section>

<div class="deckintro">
  <div class="lead">{how}</div>
  <aside class="bigq"><div class="k">{span("Deal a card","Reparte una tarjeta")}</div><p>{span("Pick a unit and let the deck choose — one random card, straight to the board.","Elige una unidad y deja que el mazo decida — una tarjeta al azar, directo a la pizarra.")}</p>
    <div class="lbtns" style="margin-top:10px">{"".join('<button type="button" class="lbtn dealu" data-unit="u%d" style="background:var(--field);color:var(--ink)">%s %d</button>' % (u["n"], span("Unit","Unidad"), u["n"]) for u in C["units"])}</div></aside>
</div>

<div class="filters no-print" role="group" aria-label="Filters"><span class="k">{span("Show","Mostrar")}</span>
  {"".join('<button type="button" class="fchip funit" data-unit="u%d" aria-pressed="true" style="--uc:var(--u%d)"><span class="dot"></span>%s %d</button>' % (u["n"], u["n"], span("Unit","Unidad"), u["n"]) for u in C["units"])}
  <button type="button" class="fchip" id="hideRisk" aria-pressed="false">{span("Hide ★★ cards","Ocultar tarjetas ★★")}</button>
  <button type="button" class="fchip" id="hideUsed" aria-pressed="false">{span("Hide used","Ocultar usadas")}</button>
</div>

{"".join(blocks)}

<details class="teach no-print"><summary>{span("For the teacher","Para el docente")}</summary><div class="inner">
  <p>{span("The cards are the Book %d deck word for word. “Put on the board” opens one card large, with the questions hidden until you reveal them; Listen reads the situation and the questions aloud; a tick marks a card used on this device only. Print gives the deck two cards to a page, one lesson per sheet." % r["book"], "Las tarjetas son el mazo del libro %d palabra por palabra. “Poner en la pizarra” abre una tarjeta en grande, con las preguntas ocultas hasta revelarlas; Escuchar la lee en voz alta; la marca señala una tarjeta usada solo en este dispositivo." % r["book"])}</p>
  <div class="mats"><a href="room-{n}-lessons.html">{span("The Lessons","Las lecciones")}</a><a href="room-{n}-curriculum.html">{span("The curriculum","El currículo")}</a><a href="room-{n}-workbook.html">{span("The companion workbook","El cuaderno")}</a><a href="{charts_page(n)}">{span("Anchor charts","Carteles de anclaje")}</a></div>
</div></details>
<footer class="foot">{span("Architecture of Grace · Room %d · Book %d · %s · Grades %s · the banner is a drawn scene." % (n, r["book"], r["bookname"], r["grades"]), "Architecture of Grace · Salón %d · Libro %d · Grados %s." % (n, r["book"], r["es"]))}</footer>
</main>
</div>

<div class="board" id="board" data-open="0" role="dialog" aria-modal="true" aria-label="Scenario card">
  <div class="sheet" id="boardSheet">
    <div class="bh"><span class="code" id="bCode"></span><h3 id="bTitle"></h3><button type="button" id="bListen" class="lbtn" aria-pressed="false">{ICO["speak"]}<span>{span("Listen","Escuchar")}</span></button><button type="button" id="bClose" aria-label="Close">✕</button></div>
    <div class="bb"><div class="k">{span("The situation","La situación")}</div><p class="sit" id="bSit"></p><div class="k" id="bQk">{span("Discussion questions","Preguntas para conversar")}</div><ol id="bQs"></ol><p class="note" id="bNote" hidden></p></div>
    <div class="bf"><button type="button" class="btn btn-a" id="bNext">{span("Reveal the next question","Revelar la siguiente pregunta")}</button><button type="button" class="btn" id="bAll">{span("Show all","Mostrar todas")}</button><button type="button" class="btn" id="bDeal">{span("Another card from this unit","Otra tarjeta de esta unidad")}</button><button type="button" class="btn" id="bUsed">{span("Mark used","Marcar usada")}</button></div>
  </div>
</div>

<script>
{JS_CARDS.replace("__KEY__", "aog.interior.ws.v1.selcards%d" % n)}
</script>
</body>
</html>
'''
    page = head(title, E(desc), "cards%d" % n, d["og"], d["ogalt"], CARDS_CSS) + body
    out = DEPLOY / ("room-%d-cards.html" % n)
    out.write_text(page, encoding="utf-8")
    print("wrote %s %d bytes · %d cards" % (out.name, len(page.encode("utf-8")), total))

JS_CARDS = r"""
(function(){
"use strict";
var KEY="__KEY__";
function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||"{}")||{}; }catch(e){ return {}; } }
var d=load(); d.used=d.used||{};
function persist(){ try{ localStorage.setItem(KEY, JSON.stringify(d)); }catch(e){} }
var lang="en"; function T(en,es){ return lang==="es"?es:en; }
function paintLang(){
  document.documentElement.setAttribute("lang", lang);
  Array.prototype.forEach.call(document.querySelectorAll("[data-en]"), function(el){ var v=el.getAttribute(lang==="es"?"data-es":"data-en"); if(v==null) return; if(v.indexOf("<b>")>-1) el.innerHTML=v; else el.textContent=v; });
  var lb=document.getElementById("langBtn"); if(lb) lb.textContent=(lang==="es")?"English":"Español";
}
document.getElementById("langBtn").addEventListener("click", function(){ lang=(lang==="es")?"en":"es"; paintLang(); });
document.getElementById("themeBtn").addEventListener("click", function(){ var t=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark"; document.documentElement.setAttribute("data-theme", t); try{ localStorage.setItem("aog.interior.ws.v1.theme", t); }catch(e){} });
var rs=document.getElementById("roomSel"); if(rs){ rs.addEventListener("change", function(){ if(rs.value) location.href=rs.value; }); }
document.getElementById("printDeck").addEventListener("click", function(){ window.print(); });

/* ticks and filters */
var units={}, hideRisk=false, hideUsed=false;
Array.prototype.forEach.call(document.querySelectorAll(".funit"), function(b){ units[b.getAttribute("data-unit")]=true; });
function paint(){
  Array.prototype.forEach.call(document.querySelectorAll(".card"), function(c){
    var id=c.id, on=units[c.getAttribute("data-unit")];
    c.classList.toggle("used", !!d.used[id]);
    if(hideRisk && c.getAttribute("data-risk")==="★★") on=false;
    if(hideUsed && d.used[id]) on=false;
    c.hidden=!on;
  });
  Array.prototype.forEach.call(document.querySelectorAll(".lessonblk"), function(b){ b.hidden = !b.querySelector(".card:not([hidden])"); });
  Array.prototype.forEach.call(document.querySelectorAll(".unit-spread"), function(s){ s.setAttribute("data-empty", s.querySelector(".card:not([hidden])")?"0":"1"); });
}
document.addEventListener("click", function(ev){
  var f=ev.target.closest(".funit"); if(f){ var u=f.getAttribute("data-unit"); units[u]=!units[u]; f.setAttribute("aria-pressed", String(units[u])); paint(); return; }
  var t=ev.target.closest(".tick"); if(t){ var id=t.getAttribute("data-used"); if(d.used[id]) delete d.used[id]; else d.used[id]=1; persist(); paint(); return; }
});
document.getElementById("hideRisk").addEventListener("click", function(){ hideRisk=!hideRisk; this.setAttribute("aria-pressed", String(hideRisk)); paint(); });
document.getElementById("hideUsed").addEventListener("click", function(){ hideUsed=!hideUsed; this.setAttribute("aria-pressed", String(hideUsed)); paint(); });

/* Listen: a card, read aloud */
var speaking=null;
function stopSpeak(){ try{ window.speechSynthesis && window.speechSynthesis.cancel(); }catch(e){} if(speaking){ speaking.setAttribute("aria-pressed","false"); speaking=null; } }
function cardText(c){ var qs=Array.prototype.map.call(c.querySelectorAll("ol li"), function(l){ return l.textContent; }); return [c.querySelector("h4").textContent, c.querySelector(".sit").textContent].concat(qs).join(". "); }
function say(btn, text){
  if(!("speechSynthesis" in window)) return;
  if(speaking===btn){ stopSpeak(); return; }
  stopSpeak(); var u=new SpeechSynthesisUtterance(text); u.lang="en-US"; u.rate=.95;
  u.onend=function(){ if(speaking===btn){ speaking.setAttribute("aria-pressed","false"); speaking=null; } };
  speaking=btn; btn.setAttribute("aria-pressed","true"); window.speechSynthesis.speak(u);
}
document.addEventListener("click", function(ev){ var b=ev.target.closest(".listen1"); if(!b) return; say(b, cardText(document.getElementById(b.getAttribute("data-say")))); });

/* the board: one card, large; questions revealed one at a time */
var board=document.getElementById("board"), sheet=document.getElementById("boardSheet"), shown=null, lastFocus=null, qi=0;
function deal(id){
  var c=document.getElementById(id); if(!c) return; shown=c; qi=0;
  sheet.style.setProperty("--uc", "var(--"+c.getAttribute("data-unit")+")");
  document.getElementById("bCode").textContent=c.getAttribute("data-code");
  document.getElementById("bTitle").textContent=c.querySelector("h4").textContent;
  document.getElementById("bSit").textContent=c.querySelector(".sit").textContent;
  var ol=document.getElementById("bQs"); ol.innerHTML="";
  Array.prototype.forEach.call(c.querySelectorAll("ol li"), function(l){ var li=document.createElement("li"); li.textContent=l.textContent; li.hidden=true; ol.appendChild(li); });
  var nq=c.querySelectorAll("ol li").length; document.getElementById("bQk").hidden=!nq; document.getElementById("bNext").hidden=!nq; document.getElementById("bAll").hidden=!nq;
  var note=c.querySelector(".note"), bn=document.getElementById("bNote"); if(note){ bn.textContent=note.textContent; bn.hidden=false; } else bn.hidden=true;
  lastFocus=document.activeElement; board.setAttribute("data-open","1"); document.body.style.overflow="hidden"; (nq?document.getElementById("bNext"):document.getElementById("bClose")).focus();
}
function closeBoard(){ board.setAttribute("data-open","0"); document.body.style.overflow=""; stopSpeak(); if(lastFocus) lastFocus.focus(); }
document.addEventListener("click", function(ev){ var b=ev.target.closest(".deal1"); if(b) deal(b.getAttribute("data-deal")); });
function randomFrom(u){ var cs=Array.prototype.filter.call(document.querySelectorAll('.card[data-unit="'+u+'"]'), function(c){ return !d.used[c.id]; }); if(!cs.length) cs=Array.prototype.slice.call(document.querySelectorAll('.card[data-unit="'+u+'"]')); if(!cs.length) return; deal(cs[Math.floor(Math.random()*cs.length)].id); }
Array.prototype.forEach.call(document.querySelectorAll(".dealu"), function(b){ b.addEventListener("click", function(){ randomFrom(b.getAttribute("data-unit")); }); });
document.getElementById("bDeal").addEventListener("click", function(){ if(shown) randomFrom(shown.getAttribute("data-unit")); });
document.getElementById("bNext").addEventListener("click", function(){ var li=document.getElementById("bQs").querySelectorAll("li"); if(qi<li.length){ li[qi].hidden=false; qi++; } });
document.getElementById("bAll").addEventListener("click", function(){ var li=document.getElementById("bQs").querySelectorAll("li"); Array.prototype.forEach.call(li, function(l){ l.hidden=false; }); qi=li.length; });
document.getElementById("bUsed").addEventListener("click", function(){ if(shown){ d.used[shown.id]=1; persist(); paint(); } });
document.getElementById("bClose").addEventListener("click", closeBoard);
board.addEventListener("click", function(ev){ if(ev.target===board) closeBoard(); });
document.getElementById("bListen").addEventListener("click", function(){ if(shown) say(this, cardText(shown)); });
document.addEventListener("keydown", function(ev){ if(board.getAttribute("data-open")!=="1") return; if(ev.key==="Escape") closeBoard(); if(ev.key===" "||ev.key==="ArrowRight"){ ev.preventDefault(); document.getElementById("bNext").click(); } });

paint();
/* a lesson link from the Lessons page lands on that lesson's cards */
if(location.hash){ var tgt=document.getElementById(location.hash.slice(1)); if(tgt) setTimeout(function(){ tgt.scrollIntoView({block:"start"}); }, 50); }
})();
"""

def build():
    for r in ROOMS:
        lessons_page(r)
        cards_page(r)

if __name__ == "__main__":
    build()
