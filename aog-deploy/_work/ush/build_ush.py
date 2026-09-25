#!/usr/bin/env python3
"""
AOG-USH-V1 — U.S. History, Grades 6–8. Builds the course from the ten unit
JSON files (u1.json … u10.json, the shape in SPEC.md):

    us-history.html           the course contents — every unit, chapter,
                              section and numbered lesson, with progress ticks
    ush-u1.html … ush-u10.html  one page per unit: banner, intro, big question,
                              timeline, chapter by chapter (story → sections →
                              lessons), reviews, the wrap-up, practice rooms

Everything is rendered here, at build time, so a page reads with JS off and
prints as a book. The JS on the page only wires the interactive parts:
checks, reviews, the test, the word match, key-word pop-ups, Listen, the
contents drawer, progress. No external requests of any kind.

Run:  python3 _work/ush/build_ush.py      (from aog-deploy/)
Then: python3 _work/jump/inject_jump.py   (adds the jump menu script + optgroup)
      python3 _work/cards/inject_cards.py (no cards here; harmless)

Jimmy: "follow this format [Units → Chapters → Sections → numbered lessons]
… nothing gets lost, but the face needs a facelift."
"""
import json, os, re, sys, html
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEPLOY = HERE.parent.parent
sys.path.insert(0, str(HERE))
from outline import LINKS            # unit → [(href, label)]
try:
    from banners import banner, CREDITS
except Exception:                     # banners.py lands separately; build still works
    def banner(n):
        return ('<svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Unit banner" focusable="false">'
                '<defs><linearGradient id="ubf%d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b4a72"/><stop offset="1" stop-color="#0A1E33"/></linearGradient></defs>'
                '<rect width="1200" height="420" fill="url(#ubf%d)"/></svg>' % (n, n))
    CREDITS = {}

SITE = "https://architectureofgrace.org"
UNIT_SHORT = {1:"Early Encounters",2:"English Settlement",3:"A New Nation",4:"The Early Republic",
              5:"Pushing National Boundaries",6:"Civil War and Reconstruction",7:"America on the Move",
              8:"Twentieth-Century Crises",9:"Postwar America",10:"America in a Changing World"}

E = lambda s: html.escape(str(s if s is not None else ""), quote=True)

def kw(text, words):
    """*key word* → a pop-up button carrying its definition."""
    defs = {w["w"].lower(): w["d"] for w in words}
    def rep(m):
        w = m.group(1)
        d = defs.get(w.lower())
        if d is None:
            for k, v in defs.items():
                if k in w.lower() or w.lower() in k: d = v; break
        if d is None: return "<em>%s</em>" % E(w)
        return '<button type="button" class="kw" data-def="%s">%s</button>' % (E(d), E(w))
    return re.sub(r"\*([^*]+)\*", rep, E(text)).replace("&#x27;", "’")

# ─────────────────────────────────────────────────────────────────── the jump menu
def jump_block():
    """The same optgroup select every social-studies page carries, lifted from
    s13 — the jump injector rewrites the 6–8 group on every page afterwards."""
    src = (DEPLOY / "s13-world-before-1500.html").read_text(encoding="utf-8")
    m = re.search(r'<div class="jump no-print">.*?</select>\s*</label>\s*</div>', src, re.S)
    if not m:
        m = re.search(r'<div class="jump no-print">.*?</select>.*?</div>', src, re.S)
    blk = m.group(0)
    # s13 marks itself as the current page; un-mark it and restore its real value.
    blk = blk.replace('<option value="" selected>Social Studies 6–8 · The World Before 1500</option>',
                      '<option value="s13-world-before-1500.html">The World Before 1500</option>')
    return blk

def mark_current(blk, value, text):
    """Put the course's own eleven options at the head of the 6–8 group, in the
    exact form _work/jump/inject_jump.py writes on every other page, and make
    THIS page the selected entry (value="" selected — the site's convention)."""
    IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
    opts = [("us-history.html", "U.S. History · Course contents", "")]
    opts += [("ush-u%d.html" % k, "Unit %d · %s" % (k, UNIT_SHORT[k]), IND) for k in range(1, 11)]
    rows = []
    for v, t, ind in opts:
        if v == value:
            rows.append('<option value="" selected>U.S. History 6–8 · %s</option>' % t.replace("U.S. History · ", ""))
        else:
            rows.append('<option value="%s">%s%s</option>' % (v, ind, t))
    head = '<optgroup label="Social Studies · Grades 6–8">'
    return blk.replace(head, head + "\n" + "\n".join(rows), 1)

# ─────────────────────────────────────────────────────────────────── shared head
def head(title, desc, path, extra_css=""):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>/* .30eg: begin in light. Dark only when this device chose it - the stored choice, never the OS setting, decides. Same key as every Interior page. */
(function(){{var t="light";try{{if(localStorage.getItem("aog.interior.ws.v1.theme")==="dark")t="dark";}}catch(e){{}}document.documentElement.setAttribute("data-theme",t);}})();</script>
<title>{E(title)} — Architecture of Grace</title>
<meta name="description" content="{E(desc)}">
<!-- ═══ AOG ICONS + LINK PREVIEW · managed block · .30k0 ═══ -->
<link rel="canonical" href="{SITE}/{path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Architecture of Grace">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="{E(title)} — Architecture of Grace">
<meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{SITE}/{path}">
<meta property="og:image" content="{SITE}/og-prep.png?v=1">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A link card for the grades 6–8 U.S. History course at Architecture of Grace.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{E(title)} — Architecture of Grace">
<meta name="twitter:description" content="{E(desc)}">
<meta name="twitter:image" content="{SITE}/og-prep.png?v=1">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0A1E33">
<meta name="apple-mobile-web-app-title" content="Grace">
<meta name="application-name" content="Architecture of Grace">
<!-- ═══ END AOG ICONS + LINK PREVIEW ═══ -->
<!-- AOG-USH-V1 — built by _work/ush/build_ush.py from _work/ush/u*.json. Do not hand-edit; edit the JSON or the builder and re-run. -->
<!-- No external requests of any kind. Every byte this page needs is in this file (aog-topbar.js and aog-jump.js are same-origin; a 404 changes nothing but the bar and the menu). -->
<style>
{CSS}
{extra_css}
</style>
</head>
'''

# ─────────────────────────────────────────────────────────────────── CSS
CSS = r"""
/* ══ TOKENS ══ the Interior set (light is the base; dark redefines tokens only)
   plus the course's own: navy #0A1E33, a flag red for the badges, the hub's
   brown accent, and a serif stack for the book voice. */
:root{
  --ground:#F5F1E8; --field:#FFFFFF; --field-2:#EFEAE0; --field-3:#E7E0D2;
  --ink:#1D2733; --ink-soft:#57626F; --ink-faint:#5F6B78;
  --navy:#0A1E33; --navy-2:#1B3A5F; --gold:#B8893A; --gold-deep:#7A5C1F;
  --red:#A8323A; --red-deep:#7E1F26; --acc:#7A5230; --acc-soft:#EFE3D6;
  --rule:rgba(29,39,51,.16); --rule-soft:rgba(29,39,51,.08);
  --lift:0 1px 0 rgba(255,255,255,.7), 0 20px 44px -30px rgba(29,39,51,.55);
  --lift-sm:0 1px 2px rgba(29,39,51,.07), 0 8px 20px -16px rgba(29,39,51,.4);
  --a:#4A3A8C; --a-wash:rgba(74,58,140,.07);
  --good:#2E6B4F; --good-wash:rgba(46,107,79,.12);
  --caution:#9A3412; --caution-wash:rgba(154,52,18,.09); --focus:#B8893A;
  --paper:#FBF7EE; --paper-line:rgba(122,82,48,.22);
  --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --cond:"Avenir Next Condensed","Helvetica Neue","Arial Narrow","Roboto Condensed",Impact,sans-serif;
  --on-navy:#F5F1E8;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --ground:#12161C; --field:#1A2029; --field-2:#222A34; --field-3:#2A333F;
    --ink:#E9EEF4; --ink-soft:#A3AFBC; --ink-faint:#84909D;
    --navy:#0A1E33; --navy-2:#9CC2E8; --gold:#D6A852; --gold-deep:#D6A852;
    --red:#E07078; --red-deep:#B24A52; --acc:#D0A46B; --acc-soft:#3A2E22;
    --rule:rgba(233,238,244,.18); --rule-soft:rgba(233,238,244,.09);
    --lift:0 1px 0 rgba(233,238,244,.04), 0 24px 54px -32px rgba(0,0,0,.95);
    --lift-sm:0 1px 2px rgba(0,0,0,.5), 0 10px 24px -18px rgba(0,0,0,.9);
    --a:#A99BE8; --a-wash:rgba(169,155,232,.12);
    --good:#79C79E; --good-wash:rgba(121,199,158,.16);
    --caution:#F0A07C; --caution-wash:rgba(240,160,124,.12); --focus:#D6A852;
    --paper:#232A33; --paper-line:rgba(214,168,82,.28);
  }
}
:root[data-theme="dark"]{
  --ground:#12161C; --field:#1A2029; --field-2:#222A34; --field-3:#2A333F;
  --ink:#E9EEF4; --ink-soft:#A3AFBC; --ink-faint:#84909D;
  --navy:#0A1E33; --navy-2:#9CC2E8; --gold:#D6A852; --gold-deep:#D6A852;
  --red:#E07078; --red-deep:#B24A52; --acc:#D0A46B; --acc-soft:#3A2E22;
  --rule:rgba(233,238,244,.18); --rule-soft:rgba(233,238,244,.09);
  --lift:0 1px 0 rgba(233,238,244,.04), 0 24px 54px -32px rgba(0,0,0,.95);
  --lift-sm:0 1px 2px rgba(0,0,0,.5), 0 10px 24px -18px rgba(0,0,0,.9);
  --a:#A99BE8; --a-wash:rgba(169,155,232,.12);
  --good:#79C79E; --good-wash:rgba(121,199,158,.16);
  --caution:#F0A07C; --caution-wash:rgba(240,160,124,.12); --focus:#D6A852;
  --paper:#232A33; --paper-line:rgba(214,168,82,.28);
}
*{box-sizing:border-box}
html,body{margin:0}
html{scroll-behavior:smooth}
@media (prefers-reduced-motion: reduce){ html{scroll-behavior:auto} *,*::before,*::after{animation:none!important;transition:none!important} }
body{background:var(--ground); color:var(--ink); font:17px/1.6 var(--sans); -webkit-text-size-adjust:100%}
.wrap{max-width:1040px; margin:0 auto; padding:18px 16px 90px}
h1,h2,h3,h4{line-height:1.15; margin:0 0 .3em; font-family:var(--serif)}
p{margin:.4em 0}
button{font:inherit; color:inherit}
a{color:var(--navy-2)}
:focus-visible{outline:3px solid var(--focus); outline-offset:2px}
.vh{position:absolute!important; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap}
.mast{display:flex; justify-content:space-between; align-items:flex-start; gap:10px; flex-wrap:wrap}
.mast .k{font:700 .78rem/1.3 var(--sans); letter-spacing:.12em; text-transform:uppercase; color:var(--gold-deep)}
.mast h1{font-size:2.1rem; letter-spacing:-.01em}
.mast .row{display:flex; gap:8px}
.chipbtn{min-height:48px; padding:8px 16px; border:1px solid var(--rule); border-radius:999px; background:var(--field); cursor:pointer; font-weight:700; font-size:.92rem}
.deck{color:var(--ink-soft); max-width:66ch}
.hubline{margin:.2em 0 0; font-size:.95rem}
.hubline a{font-weight:700; text-decoration:none}
.hubline a:hover{text-decoration:underline}
.jump{margin:14px 0 4px}
.jump label{display:grid; gap:6px; font-weight:700; font-size:.9rem; color:var(--ink-soft)}
.jump select{min-height:48px; border:1px solid var(--rule); border-radius:12px; background:var(--field); padding:8px 12px; font:inherit; color:var(--ink); max-width:100%}

/* ══ THE UNIT RAIL ══ ten numbered doors, sticky under the site bar */
.rail{position:sticky; top:var(--aogbar-h,52px); z-index:30; margin:10px -16px 0; padding:8px 16px; background:color-mix(in srgb, var(--ground) 88%, transparent); backdrop-filter:saturate(1.2) blur(10px); -webkit-backdrop-filter:saturate(1.2) blur(10px); border-bottom:1px solid var(--rule-soft)}
.rail .in{display:flex; gap:6px; align-items:center; overflow-x:auto; scrollbar-width:none; -ms-overflow-style:none; padding-bottom:2px}
.rail .in::-webkit-scrollbar{display:none}
.rail .k{flex:0 0 auto; font:700 .7rem var(--sans); letter-spacing:.14em; text-transform:uppercase; color:var(--ink-faint); margin-right:4px}
.rail a{flex:0 0 auto; display:inline-flex; align-items:center; justify-content:center; min-width:44px; min-height:44px; padding:0 12px; border-radius:999px; border:1px solid var(--rule); background:var(--field); color:var(--ink); text-decoration:none; font:800 .95rem var(--cond); letter-spacing:.04em}
.rail a[aria-current="page"]{background:var(--navy); border-color:var(--navy); color:var(--on-navy)}
.rail a:hover{border-color:var(--navy-2)}
.rail .sp{flex:1 0 8px}
.rail .drawerbtn{flex:0 0 auto; min-height:44px; padding:0 14px; border-radius:999px; border:1px solid var(--rule); background:var(--field); font-weight:700; font-size:.88rem; cursor:pointer; display:inline-flex; gap:8px; align-items:center}
.rail .drawerbtn svg{width:16px; height:16px}

/* ══ THE BANNER ══ a drawn scene, the unit number, a huge condensed title */
.spread{position:relative; margin:18px 0 0; border-radius:22px; overflow:hidden; background:#0A1E33; color:#F5F1E8; box-shadow:var(--lift); min-height:300px; isolation:isolate}
.spread .scene{position:absolute; inset:0; z-index:0}
.spread .scene svg{width:100%; height:100%; display:block}
.spread::after{content:""; position:absolute; inset:0; z-index:1; background:linear-gradient(180deg, rgba(10,30,51,0) 30%, rgba(10,30,51,.55) 62%, rgba(10,30,51,.94) 100%); pointer-events:none}
.spread .txt{position:relative; z-index:2; padding:clamp(120px,26vw,220px) clamp(18px,4vw,40px) clamp(20px,3vw,30px); display:grid; gap:6px}
.spread .unum{display:inline-flex; align-items:baseline; gap:10px; font:800 .82rem var(--sans); letter-spacing:.22em; text-transform:uppercase; color:#F5F1E8}
.spread .unum b{display:inline-flex; align-items:center; justify-content:center; min-width:44px; height:44px; padding:0 10px; border-radius:8px; background:var(--red); color:#fff; font:800 1.4rem var(--cond); letter-spacing:.02em; box-shadow:inset 0 1px 0 rgba(255,255,255,.35), 0 4px 0 #5A151B, 0 8px 16px rgba(0,0,0,.35)}
.spread h2.ut{font:800 clamp(2.2rem,7.6vw,5.4rem)/0.95 var(--cond); letter-spacing:-.01em; margin:0; text-transform:uppercase; color:#F5F1E8; text-shadow:0 2px 0 rgba(0,0,0,.35), 0 12px 30px rgba(0,0,0,.45); max-width:14ch}
.spread .years{font:600 clamp(1rem,2.4vw,1.35rem) var(--serif); font-style:italic; color:#EBD9A8; letter-spacing:.02em}
.spread .credit{position:absolute; right:14px; bottom:10px; z-index:2; font:italic 500 .7rem var(--serif); color:rgba(245,241,232,.55); max-width:46%; text-align:right; line-height:1.25}
.contents .spread .credit{display:none}
@media(max-width:720px){.spread .credit{display:none}}
.contents .spread{min-height:240px; border-radius:18px}
.contents .spread .txt{padding-top:clamp(90px,18vw,150px)}
.contents .spread h2.ut{font-size:clamp(1.9rem,6vw,4.2rem)}
.contents .spread a.enter{position:absolute; right:clamp(14px,3vw,28px); bottom:clamp(16px,3vw,26px); z-index:3; display:inline-flex; align-items:center; gap:8px; min-height:48px; padding:0 18px; border-radius:999px; background:#F5F1E8; color:#0A1E33; text-decoration:none; font:800 .92rem var(--sans); letter-spacing:.04em; box-shadow:0 6px 18px rgba(0,0,0,.35)}
.contents .spread a.enter:hover{background:#fff}

/* ══ THE BOOK VOICE ══ */
.intro{margin:22px 0 0; display:grid; grid-template-columns:1.4fr 1fr; gap:18px; align-items:start}
@media(max-width:820px){.intro{grid-template-columns:1fr}}
.intro .lead p{font-size:1.06rem; line-height:1.65}
.intro .lead p:first-child::first-letter{font:800 3.6rem/0.85 var(--serif); float:left; margin:.1em .12em 0 0; color:var(--red)}
.bigq{background:var(--navy); color:var(--on-navy); border-radius:16px; padding:18px 20px 20px; box-shadow:var(--lift); position:relative; overflow:hidden}
.bigq::before{content:"?"; position:absolute; right:-10px; top:-30px; font:800 9rem/1 var(--serif); color:rgba(255,255,255,.06)}
.bigq .k{font:700 .72rem var(--sans); letter-spacing:.18em; text-transform:uppercase; color:#EBD9A8; margin-bottom:6px}
.bigq p{font:600 1.22rem/1.35 var(--serif); margin:0}
.tl{margin:20px 0 0}
.tl .k{font:700 .74rem var(--sans); letter-spacing:.16em; text-transform:uppercase; color:var(--gold-deep); margin-bottom:8px}
.tl .track{display:flex; gap:0; overflow-x:auto; padding:10px 4px 14px; scroll-snap-type:x proximity; position:relative}
.tl .track::before{content:""; position:absolute; left:0; right:0; top:29px; height:3px; background:linear-gradient(90deg, var(--red), var(--gold)); border-radius:3px}
.tl .pin{flex:0 0 200px; scroll-snap-align:start; padding:0 12px 0 0; position:relative}
.tl .pin::before{content:""; position:absolute; left:0; top:22px; width:16px; height:16px; border-radius:50%; background:var(--field); border:4px solid var(--red); box-shadow:0 0 0 3px var(--ground)}
.tl .pin .y{font:800 1.3rem/1 var(--cond); letter-spacing:.02em; color:var(--red); margin:0 0 14px 26px}
.tl .pin .t{font-size:.9rem; line-height:1.4; color:var(--ink-soft); margin:0 0 0 2px; padding-top:6px; border-top:1px dashed var(--rule)}

/* ══ CHAPTER OPENER ══ */
.chap{margin:36px 0 0; scroll-margin-top:70px}
.chead{display:grid; grid-template-columns:auto 1fr; gap:16px; align-items:center; padding:18px 0 14px; border-top:3px solid var(--navy); border-bottom:1px solid var(--rule)}
:root[data-theme="dark"] .chead{border-top-color:var(--gold)}
.badge{display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; border-radius:14px; background:var(--red); color:#fff; font:800 2rem var(--cond); box-shadow:inset 0 1px 0 rgba(255,255,255,.35), 0 5px 0 #5A151B, 0 10px 18px rgba(0,0,0,.25); flex:0 0 auto}
.chead .tab{display:inline-block; font:800 .7rem var(--sans); letter-spacing:.24em; text-transform:uppercase; background:var(--navy); color:var(--on-navy); padding:4px 10px; border-radius:4px 4px 0 0}
:root[data-theme="dark"] .chead .tab{background:var(--gold); color:#12161C}
.chead h2{font-size:clamp(1.5rem,3.6vw,2.2rem); margin:.15em 0 0}
.chead .yrs{font:italic 600 1rem var(--serif); color:var(--ink-soft)}
.cq{margin:12px 0 0; padding:12px 16px; border-left:4px solid var(--gold); background:var(--field-2); border-radius:0 12px 12px 0; font:600 1.05rem/1.4 var(--serif)}
.cq .k{display:block; font:700 .7rem var(--sans); letter-spacing:.16em; text-transform:uppercase; color:var(--gold-deep); margin-bottom:4px}
.story{margin:16px 0 0; background:var(--paper); border:1px solid var(--paper-line); border-radius:16px; padding:20px 22px 18px; box-shadow:var(--lift-sm); position:relative; background-image:repeating-linear-gradient(0deg, transparent 0 27px, rgba(122,82,48,.06) 27px 28px)}
.story .k{font:700 .7rem var(--sans); letter-spacing:.2em; text-transform:uppercase; color:var(--red); margin-bottom:6px}
.story h3{font-size:1.5rem; margin:0 0 .2em}
.story .kick{font:italic 1.05rem/1.45 var(--serif); color:var(--ink-soft); margin:0 0 .8em}
.story p.sp{font-size:1.02rem; line-height:1.68; max-width:70ch}
.story .think{margin-top:12px; padding:10px 14px; background:var(--a-wash); border-radius:10px; font-weight:600}
.story .think .k2{font:700 .68rem var(--sans); letter-spacing:.16em; text-transform:uppercase; color:var(--a); display:block; margin-bottom:2px}

/* ══ SECTIONS AND LESSONS ══ */
.sec{margin:26px 0 0}
.sec .sh{display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; padding-bottom:6px; border-bottom:2px solid var(--rule)}
.sec .sh .sn{font:800 .74rem var(--sans); letter-spacing:.2em; text-transform:uppercase; color:var(--red)}
.sec .sh h3{font-size:1.35rem; margin:0}
.les{margin:16px 0 0; background:var(--field); border:1px solid var(--rule); border-radius:16px; box-shadow:var(--lift-sm); scroll-margin-top:70px; overflow:hidden}
.les .lh{display:grid; grid-template-columns:auto 1fr auto; gap:12px; align-items:center; padding:12px 16px; background:var(--field-2); border-bottom:1px solid var(--rule-soft)}
.les .ln{display:inline-flex; align-items:center; justify-content:center; min-width:52px; height:36px; padding:0 8px; border-radius:8px; background:var(--navy); color:var(--on-navy); font:800 1.05rem var(--cond); letter-spacing:.04em}
:root[data-theme="dark"] .les .ln{background:var(--gold); color:#12161C}
.les .lh h4{font-size:1.2rem; margin:0}
.les .tick{width:26px; height:26px; border-radius:50%; border:2px solid var(--rule); display:inline-flex; align-items:center; justify-content:center; font-size:.8rem; color:transparent; background:var(--field)}
.les.done .tick{background:var(--good); border-color:var(--good); color:#fff}
.les .body{padding:14px 16px 16px; display:grid; grid-template-columns:minmax(0,1.5fr) minmax(0,1fr); gap:16px}
@media(max-width:820px){.les .body{grid-template-columns:1fr}}
.main-idea{padding:10px 14px; border-radius:10px; background:var(--acc-soft); border-left:4px solid var(--acc); font:600 1rem/1.4 var(--serif); color:var(--ink)}
.main-idea .k{display:block; font:700 .66rem var(--sans); letter-spacing:.16em; text-transform:uppercase; color:var(--acc); margin-bottom:2px}
.reading p{font-size:1.02rem; line-height:1.68; max-width:68ch}
.kw{display:inline; padding:0 .12em; margin:0; border:0; border-bottom:2px solid var(--gold); background:linear-gradient(transparent 62%, rgba(184,137,58,.22) 62%); border-radius:2px; cursor:pointer; font:inherit; font-weight:700; color:var(--ink); line-height:inherit; position:relative}
.kw:hover{background:linear-gradient(transparent 55%, rgba(184,137,58,.35) 55%)}
.kwpop{position:absolute; z-index:40; left:0; top:calc(100% + 8px); min-width:240px; max-width:320px; padding:10px 12px; background:var(--navy); color:var(--on-navy); border-radius:10px; font:400 .92rem/1.45 var(--sans); box-shadow:0 12px 30px rgba(0,0,0,.35); text-align:left; white-space:normal}
.kwpop::before{content:""; position:absolute; top:-6px; left:14px; width:12px; height:12px; background:var(--navy); transform:rotate(45deg)}
.kwpop.right{left:auto; right:0}
.kwpop.right::before{left:auto; right:14px}
.words{margin-top:6px; padding:12px 14px; border:1px dashed var(--rule); border-radius:12px; background:var(--field-2)}
.words .k{font:700 .68rem var(--sans); letter-spacing:.16em; text-transform:uppercase; color:var(--gold-deep); margin-bottom:6px}
.words dl{margin:0; display:grid; gap:6px}
.words dt{font-weight:800; font-family:var(--serif)}
.words dd{margin:0 0 2px; font-size:.93rem; color:var(--ink-soft)}
.lbtns{display:flex; gap:8px; flex-wrap:wrap; margin-top:10px}
.lbtn{min-height:44px; padding:8px 14px; border-radius:999px; border:1px solid var(--rule); background:var(--field); cursor:pointer; font-weight:700; font-size:.88rem; display:inline-flex; align-items:center; gap:8px}
.lbtn svg{width:16px; height:16px}
.lbtn[aria-pressed="true"]{background:var(--navy); color:var(--on-navy); border-color:var(--navy)}
:root[data-theme="dark"] .lbtn[aria-pressed="true"]{background:var(--gold); color:#12161C; border-color:var(--gold)}

/* the look panel: a source on parchment, a bar chart, a scenario */
.look{border-radius:14px; padding:14px 16px 16px; position:relative; overflow:hidden}
.look .k{font:700 .66rem var(--sans); letter-spacing:.18em; text-transform:uppercase; margin-bottom:6px; display:flex; gap:8px; align-items:center}
.look .k svg{width:16px; height:16px}
.look h5{font:800 1.1rem/1.25 var(--serif); margin:0 0 .4em}
.look .prompt{margin-top:10px; padding-top:8px; border-top:1px dashed var(--rule); font-weight:600; font-size:.95rem}
.look.source{background:var(--paper); border:1px solid var(--paper-line); background-image:radial-gradient(120% 80% at 100% 0%, rgba(184,137,58,.10), transparent 60%)}
.look.source .k{color:var(--acc)}
.look.source blockquote{margin:0; padding:2px 0 0 16px; border-left:3px solid var(--gold); font:italic 1.05rem/1.55 var(--serif)}
.look.source blockquote::before{content:"“"; font:800 2.4rem/0 var(--serif); color:var(--gold); vertical-align:-.35em; margin-right:2px}
.look.source cite{display:block; margin-top:8px; font:600 .84rem var(--sans); color:var(--ink-soft); font-style:normal}
.look.data{background:var(--field-2); border:1px solid var(--rule-soft)}
.look.data .k{color:var(--navy-2)}
.look.data svg.chart{width:100%; height:auto; display:block; margin-top:4px}
.look.data .cite{font:600 .8rem var(--sans); color:var(--ink-faint); margin-top:6px}
.look.think{background:var(--a-wash); border:1px solid rgba(74,58,140,.18)}
.look.think .k{color:var(--a)}
.look.think p.sc{font-size:.98rem; line-height:1.55}
.chart text{font:600 11px var(--sans); fill:var(--ink-soft)}
.chart .val{fill:var(--ink); font-weight:800}
.chart rect.bar{fill:var(--navy-2)}
:root[data-theme="dark"] .chart rect.bar{fill:var(--gold)}
.chart line.ax{stroke:var(--rule); stroke-width:1}

/* checks */
.checks{margin-top:14px; padding:12px 14px 6px; border-top:1px solid var(--rule-soft); grid-column:1/-1}
.checks .k{font:700 .7rem var(--sans); letter-spacing:.18em; text-transform:uppercase; color:var(--navy-2); margin-bottom:8px; display:flex; justify-content:space-between; gap:8px; align-items:center}
.checks .score{font:800 .9rem var(--cond); letter-spacing:.06em; color:var(--good); min-width:3ch; text-align:right}
.q{margin:0 0 12px; padding:10px 12px 12px; border-radius:12px; background:var(--field-2); border:1px solid var(--rule-soft)}
.q .qq{font-weight:700; margin:0 0 8px; line-height:1.4}
.q .qn{display:inline-block; min-width:1.6em; color:var(--red); font:800 1rem var(--cond)}
.opts{display:grid; gap:6px; margin:0; padding:0; list-style:none}
@media(min-width:820px){.q.wide .opts{grid-template-columns:1fr 1fr}}
.opt{min-height:44px; width:100%; text-align:left; padding:9px 12px; border:1px solid var(--rule); border-radius:10px; background:var(--field); cursor:pointer; font-size:.97rem; display:flex; gap:10px; align-items:flex-start; line-height:1.35}
.opt .l{flex:0 0 22px; height:22px; border-radius:50%; border:1.5px solid var(--rule); display:inline-flex; align-items:center; justify-content:center; font:800 .72rem var(--sans); color:var(--ink-soft); margin-top:1px}
.opt:hover{border-color:var(--navy-2)}
.opt[data-st="right"]{border-color:var(--good); background:var(--good-wash); font-weight:700}
.opt[data-st="right"] .l{background:var(--good); border-color:var(--good); color:#fff}
.opt[data-st="tried"]{opacity:.5}
.opt[data-st="tried"] .l{background:var(--caution-wash); border-color:var(--caution); color:var(--caution)}
.opt:disabled{cursor:default}
.why{margin:8px 0 0; padding:8px 12px; border-radius:8px; background:var(--good-wash); color:var(--ink); font-size:.93rem; line-height:1.45}
.why b{color:var(--good)}
.why[hidden]{display:none}
.say{font-size:.92rem; color:var(--caution); margin:6px 0 0; min-height:1.3em; font-weight:600}

/* chapter review + unit test */
.review{margin:24px 0 0; background:var(--field); border:1px solid var(--rule); border-radius:16px; box-shadow:var(--lift-sm); overflow:hidden}
.review > .rh{display:flex; gap:12px; align-items:center; justify-content:space-between; padding:12px 16px; background:var(--navy); color:var(--on-navy)}
:root[data-theme="dark"] .review > .rh{background:var(--field-3); color:var(--ink)}
.review > .rh .k{font:800 .74rem var(--sans); letter-spacing:.2em; text-transform:uppercase}
.review > .rh h3{font-size:1.15rem; margin:0; color:inherit}
.review .rscore{font:800 1.4rem var(--cond); letter-spacing:.04em; min-width:5ch; text-align:right}
.review .rbody{padding:14px 16px 8px}
.review .rfoot{padding:8px 16px 16px; display:flex; gap:10px; flex-wrap:wrap; align-items:center}
.btn{min-height:48px; padding:10px 20px; border-radius:12px; border:1px solid var(--rule); background:var(--field); cursor:pointer; font-weight:700}
.btn-a{background:var(--navy); border-color:var(--navy); color:var(--on-navy)}
:root[data-theme="dark"] .btn-a{background:var(--gold); border-color:var(--gold); color:#12161C}
.verdict{font-weight:700; color:var(--ink-soft)}

/* ══ WRAP-UP ══ */
.wrap-up{margin:40px 0 0}
.wrap-up .wh{display:grid; grid-template-columns:auto 1fr; gap:16px; align-items:center; padding:18px 0 14px; border-top:3px solid var(--red); border-bottom:1px solid var(--rule)}
.wrap-up .wh .badge{background:var(--navy); box-shadow:inset 0 1px 0 rgba(255,255,255,.2), 0 5px 0 #05101C, 0 10px 18px rgba(0,0,0,.25); font-size:1.4rem}
:root[data-theme="dark"] .wrap-up .wh .badge{background:var(--gold); color:#12161C; box-shadow:inset 0 1px 0 rgba(255,255,255,.35), 0 5px 0 #7A5C1F}
.wrap-up .wh h2{font-size:clamp(1.5rem,3.6vw,2.1rem); margin:.1em 0 0}
.match{margin-top:16px; background:var(--field); border:1px solid var(--rule); border-radius:16px; padding:14px 16px 16px; box-shadow:var(--lift-sm)}
.match .mh{display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:8px}
.match .mh h3{font-size:1.15rem; margin:0}
.match .mscore{font:800 1.1rem var(--cond); color:var(--good)}
.mgrid{display:grid; grid-template-columns:1fr 1fr; gap:10px}
@media(max-width:640px){.mgrid{grid-template-columns:1fr}}
.mcol{display:grid; gap:8px; align-content:start}
.mcol .ck{font:700 .68rem var(--sans); letter-spacing:.16em; text-transform:uppercase; color:var(--ink-faint)}
.mt{min-height:48px; text-align:left; padding:10px 12px; border-radius:10px; border:1.5px solid var(--rule); background:var(--field-2); cursor:pointer; font-size:.95rem; line-height:1.35}
.mt.w{font-weight:800; font-family:var(--serif); font-size:1.02rem}
.mt[aria-pressed="true"]{border-color:var(--navy-2); background:var(--a-wash)}
.mt.ok{border-color:var(--good); background:var(--good-wash); opacity:.75; cursor:default}
.mt.no{animation:shake .3s}
@keyframes shake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.write{margin-top:16px; background:var(--paper); border:1px solid var(--paper-line); border-radius:16px; padding:16px 18px 18px; box-shadow:var(--lift-sm)}
.write h3{font-size:1.15rem; margin:0 0 .3em}
.write .wp{font:600 1.05rem/1.5 var(--serif)}
.write ul{margin:.4em 0 .6em; padding-left:1.2em}
.write li{margin:.25em 0; font-size:.95rem}
.write textarea{width:100%; min-height:200px; padding:12px 14px; border:1px solid var(--rule); border-radius:12px; background:var(--field); color:var(--ink); font:1rem/1.6 var(--serif); resize:vertical}
.write .wfoot{display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-top:8px}
.write .wc{font:700 .84rem var(--sans); color:var(--ink-faint)}
.rooms{margin-top:16px; background:var(--field); border:1px solid var(--rule); border-radius:16px; padding:14px 16px; box-shadow:var(--lift-sm)}
.rooms h3{font-size:1.15rem; margin:0 0 .2em}
.rooms p{color:var(--ink-soft); font-size:.95rem; margin:0 0 .6em}
.rooms .doors{display:flex; gap:8px; flex-wrap:wrap}
.rooms .door{display:inline-flex; align-items:center; min-height:44px; padding:8px 14px; border:1px solid var(--rule); border-radius:999px; background:var(--field-2); color:var(--ink); font:600 .88rem var(--sans); text-decoration:none}
.rooms .door:hover{border-color:var(--acc)}
.pager2{display:flex; justify-content:space-between; gap:10px; margin:28px 0 0; flex-wrap:wrap}
.pager2 a{display:inline-flex; align-items:center; gap:8px; min-height:48px; padding:0 16px; border-radius:12px; border:1px solid var(--rule); background:var(--field); color:var(--ink); text-decoration:none; font-weight:700}
.pager2 a:hover{border-color:var(--navy-2)}
.pager2 a .s{display:block; font:700 .66rem var(--sans); letter-spacing:.16em; text-transform:uppercase; color:var(--ink-faint)}

/* ══ THE CONTENTS DRAWER ══ chapters → sections → lessons, on the phone */
.drawer{position:fixed; inset:0; z-index:60; display:none}
.drawer[data-open="1"]{display:block}
.drawer .scrim{position:absolute; inset:0; background:rgba(10,30,51,.5); backdrop-filter:blur(3px)}
.drawer .sheet{position:absolute; right:0; top:0; bottom:0; width:min(420px,92vw); background:var(--field); box-shadow:-10px 0 40px rgba(0,0,0,.35); display:flex; flex-direction:column; animation:slidein .28s cubic-bezier(.2,.8,.2,1)}
@keyframes slidein{from{transform:translateX(30px);opacity:0}}
.drawer .dh{display:flex; justify-content:space-between; align-items:center; padding:12px 14px 10px; border-bottom:1px solid var(--rule)}
.drawer .dh b{font:800 .8rem var(--sans); letter-spacing:.16em; text-transform:uppercase; color:var(--gold-deep)}
.drawer .dh button{min-width:44px; min-height:44px; border-radius:999px; border:1px solid var(--rule); background:var(--field-2); cursor:pointer; font-size:1.2rem}
.drawer nav{overflow:auto; padding:8px 8px 20px}
.drawer nav a{display:block; padding:9px 10px; border-radius:8px; color:var(--ink); text-decoration:none; font-size:.95rem; min-height:44px; display:flex; align-items:center; gap:8px}
.drawer nav a:hover{background:var(--field-2)}
.drawer nav .dc{margin:8px 0 2px; padding:6px 10px; font:800 .95rem var(--serif); border-bottom:1px solid var(--rule-soft)}
.drawer nav .dc .b{display:inline-flex; width:26px; height:26px; border-radius:6px; background:var(--red); color:#fff; align-items:center; justify-content:center; font:800 .85rem var(--cond); margin-right:8px}
.drawer nav .ds{padding:6px 10px 2px; font:800 .66rem var(--sans); letter-spacing:.16em; text-transform:uppercase; color:var(--red)}
.drawer nav a .n{font:800 .8rem var(--cond); color:var(--ink-faint); min-width:2.4em}
.drawer nav a .t2{display:inline-block; width:10px; height:10px; border-radius:50%; border:1.5px solid var(--rule); margin-left:auto; flex:0 0 auto}
.drawer nav a.done .t2{background:var(--good); border-color:var(--good)}

/* ══ CONTENTS PAGE ══ */
.contents .search{margin:16px 0 0; display:grid; gap:6px}
.contents .search label{font-weight:700; font-size:.9rem; color:var(--ink-soft)}
.contents .search .box{position:relative}
.contents .search input{width:100%; min-height:52px; padding:10px 14px 10px 46px; border:1px solid var(--rule); border-radius:14px; background:var(--field); color:var(--ink); font:1.02rem var(--sans); box-shadow:var(--lift-sm)}
.contents .search svg{position:absolute; left:16px; top:50%; transform:translateY(-50%); width:20px; height:20px; color:var(--ink-faint)}
.contents .search .hits{font:700 .82rem var(--sans); color:var(--ink-faint); min-height:1.2em}
.contents .stat{display:flex; gap:14px; flex-wrap:wrap; margin:10px 0 0; align-items:center}
.contents .stat .n{font:800 1.5rem var(--cond); color:var(--red)}
.contents .stat .l{font:700 .74rem var(--sans); letter-spacing:.12em; text-transform:uppercase; color:var(--ink-faint)}
.contents .prog{height:8px; border-radius:6px; background:var(--field-3); overflow:hidden; flex:1 1 120px; min-width:120px}
.contents .prog i{display:block; height:100%; width:0; background:linear-gradient(90deg, var(--red), var(--gold)); border-radius:6px; transition:width .4s}
.unit-spread{margin:30px 0 0; scroll-margin-top:70px}
.unit-spread .body{margin-top:14px}
.cchap{margin:18px 0 0; background:var(--field); border:1px solid var(--rule); border-radius:16px; box-shadow:var(--lift-sm); overflow:hidden}
.cchap .ch{display:grid; grid-template-columns:auto 1fr; gap:14px; align-items:center; padding:14px 16px; background:var(--field-2); border-bottom:1px solid var(--rule-soft)}
.cchap .ch .badge{width:52px; height:52px; font-size:1.6rem}
.cchap .ch .tab{display:inline-block; font:800 .64rem var(--sans); letter-spacing:.22em; text-transform:uppercase; background:var(--navy); color:var(--on-navy); padding:3px 8px; border-radius:4px 4px 0 0}
:root[data-theme="dark"] .cchap .ch .tab{background:var(--gold); color:#12161C}
.cchap .ch h3{font-size:1.25rem; margin:.1em 0 0}
.cchap .ch .yrs{font:italic 600 .92rem var(--serif); color:var(--ink-soft)}
.cchap .st{padding:10px 16px 0; font:italic .95rem/1.45 var(--serif); color:var(--ink-soft)}
.cchap .st b{font-style:normal; color:var(--red); font-family:var(--sans); font-size:.7rem; letter-spacing:.16em; text-transform:uppercase; margin-right:6px}
.csec{padding:8px 16px 4px}
.csec .sn{font:800 .7rem var(--sans); letter-spacing:.2em; text-transform:uppercase; color:var(--red); margin:8px 0 4px}
.csec .sn span{color:var(--ink); font:700 .95rem var(--serif); letter-spacing:0; text-transform:none; margin-left:8px}
.lrow{display:flex; align-items:center; gap:10px; min-height:44px; padding:5px 8px; border-radius:8px; color:var(--ink); text-decoration:none; font-size:.98rem}
.lrow:hover{background:var(--field-2)}
.lrow .n{font:800 .9rem var(--cond); color:var(--ink-faint); min-width:2.6em; letter-spacing:.02em}
.lrow .tk{margin-left:auto; width:22px; height:22px; border-radius:50%; border:2px solid var(--rule); flex:0 0 auto; display:inline-flex; align-items:center; justify-content:center; color:transparent; font-size:.7rem}
.lrow.done .tk{background:var(--good); border-color:var(--good); color:#fff}
.lrow[hidden]{display:none}
.csec[data-empty="1"], .cchap[data-empty="1"], .unit-spread[data-empty="1"]{display:none}
.cwrap{padding:10px 16px 14px; display:flex; gap:8px; flex-wrap:wrap; border-top:1px dashed var(--rule-soft); margin-top:6px}
.cwrap a{display:inline-flex; align-items:center; min-height:40px; padding:0 12px; border-radius:999px; border:1px solid var(--rule); background:var(--field-2); color:var(--ink); text-decoration:none; font:600 .84rem var(--sans)}
.cwrap a:hover{border-color:var(--navy-2)}
.teach{margin-top:28px; border:1.5px solid var(--gold); border-radius:14px; background:var(--field)}
.teach summary{cursor:pointer; list-style:none; min-height:48px; display:flex; align-items:center; padding:10px 16px; font-weight:700; font-size:.92rem; color:var(--gold-deep)}
.teach summary::-webkit-details-marker{display:none}
.teach .inner{padding:4px 16px 16px; display:grid; gap:10px; font-size:.93rem; color:var(--ink-soft)}
.teach .inner p{margin:0}
footer.foot{margin-top:40px; font-size:.86rem; color:var(--ink-faint); max-width:70ch}

/* ══ PRINT ══ the book, on paper */
@media print{
  body{background:#fff; color:#111; font-size:11.5pt}
  .wrap{max-width:none; padding:0}
  .rail,.jump,.mast .row,.hubline,.lbtns,.drawer,.checks,.review .rfoot,.pager2,.teach,.contents .search,.contents .stat,.spread .credit,.spread a.enter,.aogj-btn,.aogj-panel{display:none!important}
  .spread{min-height:0; border-radius:0; box-shadow:none; background:#0A1E33!important; -webkit-print-color-adjust:exact; print-color-adjust:exact; break-inside:avoid}
  .spread .txt{padding:40pt 20pt 16pt}
  .chap{break-before:page}
  .les,.story,.look,.q,.review{break-inside:avoid; box-shadow:none}
  .les .body{grid-template-columns:1fr}
  .kw{border-bottom:1px solid #999; background:none; font-weight:700}
  .kwpop{display:none!important}
  .opt{border:1px solid #999; background:#fff}
  .why{display:block!important; border:1px dashed #999; background:#fff}
  .why.pr{display:none!important}
  .write textarea{min-height:320pt; border:1px solid #999}
  a{color:inherit; text-decoration:none}
}
"""

# ─────────────────────────────────────────────────────────────────── icons
ICO = {
 "speak": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
 "list": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none"/></svg>',
 "quote": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 7h4v6H8.5A2.5 2.5 0 0 0 6 15.5V17H4v-1.5A5.5 5.5 0 0 1 7 10.6V7zm9 0h4v6h-2.5a2.5 2.5 0 0 0-2.5 2.5V17h-2v-1.5a5.5 5.5 0 0 1 3-4.9V7z"/></svg>',
 "bars": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="6" width="4" height="15" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>',
 "think": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.5 1 2.5h6c0-1 .3-1.9 1-2.5A6 6 0 0 0 12 3z"/></svg>',
 "search": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
 "check": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>',
}

def span(en, es=None, cls=""):
    es = en if es is None else es
    c = ' class="%s"' % cls if cls else ""
    return '<span%s data-en="%s" data-es="%s">%s</span>' % (c, E(en), E(es), E(en))

# ─────────────────────────────────────────────────────────────────── pieces
def bar_chart(look):
    rows = look["rows"]; vals = [float(r[1]) for r in rows]
    W, H, L, B, T = 520, 240, 44, 34, 14
    n = len(rows); mx = max(vals) or 1
    gap = 10; bw = (W - L - 12 - gap*(n-1)) / n
    def fmt(v):
        return ("%d" % v) if float(v).is_integer() else ("%.1f" % v).rstrip("0").rstrip(".")
    out = ['<svg class="chart" viewBox="0 0 %d %d" role="img" aria-label="%s">' % (W, H, E(look.get("title","")))]
    out.append('<line class="ax" x1="%d" y1="%d" x2="%d" y2="%d"/>' % (L, H-B, W-8, H-B))
    for i, (lab, v) in enumerate(zip([r[0] for r in rows], vals)):
        x = L + i*(bw+gap); h = (H-B-T-16) * (v/mx); y = H-B-h
        out.append('<rect class="bar" x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="3"/>' % (x, y, bw, h))
        out.append('<text class="val" x="%.1f" y="%.1f" text-anchor="middle">%s</text>' % (x+bw/2, y-5, fmt(v)))
        out.append('<text x="%.1f" y="%d" text-anchor="middle">%s</text>' % (x+bw/2, H-B+16, E(lab)))
    out.append('<text x="%d" y="%d" text-anchor="start" font-size="10">%s</text>' % (L, H-4, E(look.get("unit",""))))
    out.append('</svg>')
    return "".join(out)

def look_panel(look):
    t = look.get("type","think")
    if t == "source":
        cite = look.get("cite","") + (" (paraphrased)" if look.get("paraphrase") else "")
        return ('<aside class="look source"><div class="k">%s%s</div><h5>%s</h5><blockquote>%s</blockquote><cite>%s</cite><p class="prompt">%s</p></aside>'
                % (ICO["quote"], span("From the source","De la fuente"), E(look.get("title","")), E(look.get("text","")), E(cite), E(look.get("prompt",""))))
    if t == "data":
        return ('<aside class="look data"><div class="k">%s%s</div><h5>%s</h5>%s<p class="cite">%s</p><p class="prompt">%s</p></aside>'
                % (ICO["bars"], span("Read the numbers","Lee los números"), E(look.get("title","")), bar_chart(look), E(look.get("cite","")), E(look.get("prompt",""))))
    return ('<aside class="look think"><div class="k">%s%s</div><h5>%s</h5><p class="sc">%s</p><p class="prompt">%s</p></aside>'
            % (ICO["think"], span("Think it through","Piénsalo"), E(look.get("title","")), E(look.get("text","")), E(look.get("prompt",""))))

def question(q, qid, i, wide=False):
    letters = "ABCD"
    opts = "".join('<li><button type="button" class="opt" data-i="%d"><span class="l">%s</span><span>%s</span></button></li>'
                   % (j, letters[j], E(c)) for j, c in enumerate(q["choices"]))
    return ('<div class="q%s" data-q="%s" data-a="%d"><p class="qq"><span class="qn">%d.</span> %s</p><ul class="opts">%s</ul>'
            '<p class="say" aria-live="polite"></p><div class="why" hidden><b>%s</b> %s</div></div>'
            % (" wide" if wide else "", qid, int(q["a"]), i+1, E(q["q"]), opts, span("Why:","Por qué:"), E(q.get("why",""))))

def lesson_html(u, c, li, sec_i, l, num):
    lid = "l%d-%d" % (c["n"], num)
    words = l.get("words", [])
    reading = "".join("<p>%s</p>" % kw(p, words) for p in l["reading"])
    wl = "".join("<dt>%s</dt><dd>%s</dd>" % (E(w["w"]), E(w["d"])) for w in words)
    checks = "".join(question(q, "%s-c%d" % (lid, j), j) for j, q in enumerate(l["check"]))
    return f'''
<article class="les" id="{lid}" data-lid="{lid}">
  <div class="lh"><span class="ln">{c["n"]}.{num}</span><h4>{E(l["title"])}</h4><span class="tick" aria-hidden="true">{ICO["check"]}</span></div>
  <div class="body">
    <div>
      <div class="main-idea"><span class="k">{span("Main idea","Idea principal")}</span>{E(l["mainIdea"])}</div>
      <div class="reading">{reading}</div>
      <div class="lbtns no-print">
        <button type="button" class="lbtn listen" data-for="{lid}" aria-pressed="false">{ICO["speak"]}{span("Listen","Escuchar")}</button>
      </div>
    </div>
    <div>
      {look_panel(l["look"])}
      <div class="words"><div class="k">{span("Words to know","Palabras clave")}</div><dl>{wl}</dl></div>
    </div>
    <div class="checks" data-lesson="{lid}">
      <div class="k">{span("Check yourself","Compruébalo")}<span class="score" data-score aria-live="polite"></span></div>
      {checks}
    </div>
  </div>
</article>'''

def chapter_html(u, c):
    st = c["story"]
    story = "".join('<p class="sp">%s</p>' % E(p) for p in st["paragraphs"])
    secs = []
    num = 0
    for si, s in enumerate(c["sections"]):
        les = []
        for l in s["lessons"]:
            num += 1
            les.append(lesson_html(u, c, len(les), si, l, num))
        secs.append('<section class="sec" id="s%d-%d"><div class="sh"><span class="sn">%s %d</span><h3>%s</h3></div>%s</section>'
                    % (c["n"], si+1, span("Section","Sección"), si+1, E(s["title"]), "".join(les)))
    review = "".join(question(q, "r%d-%d" % (c["n"], j), j, wide=True) for j, q in enumerate(c["review"]))
    return f'''
<section class="chap" id="ch{c["n"]}">
  <div class="chead"><span class="badge" aria-hidden="true">{c["n"]}</span>
    <div><span class="tab">{span("Chapter","Capítulo")}</span><h2>{E(c["title"])}</h2><div class="yrs">{E(c["years"])}</div></div>
  </div>
  <div class="cq"><span class="k">{span("Big question","Gran pregunta")}</span>{E(c["bigQuestion"])}</div>
  <article class="story">
    <div class="k">{span("The story","La historia")}</div>
    <h3>{E(st["title"])}</h3>
    <p class="kick">{E(st["kicker"])}</p>
    {story}
    <div class="think"><span class="k2">{span("Talk about it","Coméntalo")}</span>{E(st["think"])}</div>
  </article>
  {"".join(secs)}
  <section class="review" data-review="r{c["n"]}" id="rev{c["n"]}">
    <div class="rh"><div><div class="k">{span("Chapter review","Repaso del capítulo")}</div><h3>{E(c["title"])}</h3></div><div class="rscore" data-rscore aria-live="polite">0 / {len(c["review"])}</div></div>
    <div class="rbody">{review}</div>
    <div class="rfoot"><button type="button" class="btn reset-r">{span("Try again","Otra vez")}</button><span class="verdict" data-verdict></span></div>
  </section>
</section>'''

def unit_page(u, all_units):
    n = u["n"]
    title = "Unit %d · %s" % (n, u["title"])
    desc = "U.S. History, grades 6–8. Unit %d, %s (%s): %d chapters, %d lessons with readings, key words, sources, checks, chapter reviews and a unit test." % (
        n, u["title"], u["years"], len(u["chapters"]), sum(len(s["lessons"]) for c in u["chapters"] for s in c["sections"]))
    rail = "".join('<a href="ush-u%d.html"%s title="%s">%d</a>' % (k, ' aria-current="page"' if k == n else "", E(UNIT_SHORT[k]), k) for k in range(1, 11))
    intro = "".join("<p>%s</p>" % E(p) for p in u["intro"])
    tl = "".join('<div class="pin"><div class="y">%s</div><p class="t">%s</p></div>' % (E(t["y"]), E(t["t"])) for t in u["timeline"])
    chapters = "".join(chapter_html(u, c) for c in u["chapters"])
    # wrap-up
    w = u["wrap"]
    words = w["words"]
    wbtn = "".join('<button type="button" class="mt w" data-k="%d">%s</button>' % (i, E(x["w"])) for i, x in enumerate(words))
    dbtn = "".join('<button type="button" class="mt d" data-k="%d">%s</button>' % (i, E(x["d"])) for i, x in enumerate(words))
    test = "".join(question(q, "t%d-%d" % (n, j), j, wide=True) for j, q in enumerate(w["test"]))
    tips = "".join("<li>%s</li>" % E(t) for t in w["write"]["tips"])
    rooms = LINKS.get(n, [])
    rooms_html = ""
    if rooms:
        rooms_html = '<section class="rooms"><h3>%s</h3><p>%s</p><div class="doors">%s</div></section>' % (
            span("Practice rooms","Salas de práctica"),
            span("Rooms already on the site that belong to this unit — cards, quizzes, a lab.", "Salas del sitio que pertenecen a esta unidad: tarjetas, quizzes, un laboratorio."),
            "".join('<a class="door" href="%s">%s</a>' % (E(h), E(lab)) for h, lab in rooms))
    # drawer nav
    dn = []
    for c in u["chapters"]:
        dn.append('<div class="dc"><span class="b">%d</span>%s</div>' % (c["n"], E(c["title"])))
        num = 0
        for si, s in enumerate(c["sections"]):
            dn.append('<div class="ds">%s %d · %s</div>' % (span("Section","Sección"), si+1, E(s["title"])))
            for l in s["lessons"]:
                num += 1
                dn.append('<a href="#l%d-%d" data-lid="l%d-%d"><span class="n">%d.%d</span>%s<span class="t2"></span></a>' % (c["n"], num, c["n"], num, c["n"], num, E(l["title"])))
        dn.append('<a href="#rev%d"><span class="n">✓</span>%s</a>' % (c["n"], span("Chapter review","Repaso del capítulo")))
    dn.append('<a href="#wrap"><span class="n">★</span>%s</a>' % span("Unit wrap-up","Cierre de la unidad"))
    prev_a = '<a href="ush-u%d.html"><span>‹</span><span><span class="s">%s</span>%s</span></a>' % (n-1, span("Previous unit","Unidad anterior"), E(UNIT_SHORT[n-1])) if n > 1 else '<a href="us-history.html"><span>‹</span><span><span class="s">%s</span>%s</span></a>' % (span("Course","Curso"), span("Contents","Contenido"))
    next_a = '<a href="ush-u%d.html"><span><span class="s">%s</span>%s</span><span>›</span></a>' % (n+1, span("Next unit","Unidad siguiente"), E(UNIT_SHORT[n+1])) if n < 10 else '<a href="us-history.html"><span><span class="s">%s</span>%s</span><span>›</span></a>' % (span("Course","Curso"), span("Back to contents","Volver al contenido"))
    jb = mark_current(jump_block(), "ush-u%d.html" % n, "")
    credit = CREDITS.get(n, "")
    body = f'''<body>
<script src="/aog-topbar.js"></script>
<div class="wrap">
<header class="mast">
  <div>
    <div class="k">{span("The Interior — Social Studies · U.S. History 6–8","El Interior — Estudios Sociales · Historia de EE. UU. 6–8")}</div>
    <h1 data-en="{E(title)}" data-es="{E("Unidad %d · %s" % (n, u["title"]))}">{E(title)}</h1>
    <p class="deck">{span("A unit of the course: the story, then chapter by chapter — sections, numbered lessons, a source or the numbers to read, three checks each — a review per chapter, and the wrap-up at the end.","Una unidad del curso: la historia, y luego capítulo por capítulo — secciones, lecciones numeradas, una fuente o los números, tres comprobaciones cada una — un repaso por capítulo y el cierre al final.")}</p>
    <p class="hubline no-print"><a id="hubLink" href="us-history.html">{span("← U.S. History, the whole course","← Historia de EE. UU., el curso completo")}</a></p>
  </div>
  <div class="row no-print">
    <button class="chipbtn" id="langBtn" type="button">Español</button>
    <button class="chipbtn" id="themeBtn" type="button" data-en="Dark" data-es="Oscuro">Dark</button>
  </div>
</header>

<main id="main">
{jb}
<nav class="rail no-print" aria-label="Units"><div class="in"><span class="k">{span("Unit","Unidad")}</span>{rail}<span class="sp"></span><button type="button" class="drawerbtn" id="drawerBtn" aria-controls="drawer" aria-expanded="false">{ICO["list"]}{span("Contents","Contenido")}</button></div></nav>

<section class="spread" aria-labelledby="ut">
  <div class="scene" aria-hidden="true">{banner(n)}</div>
  {'<div class="credit">' + E(credit) + '</div>' if credit else ''}
  <div class="txt">
    <div class="unum"><b>{n}</b>{span("Unit","Unidad")}</div>
    <h2 class="ut" id="ut">{E(u["title"])}</h2>
    <div class="years">{E(u["years"])}</div>
  </div>
</section>

<div class="intro">
  <div class="lead">{intro}</div>
  <aside class="bigq"><div class="k">{span("The big question","La gran pregunta")}</div><p>{E(u["bigQuestion"])}</p></aside>
</div>

<section class="tl" aria-label="Timeline"><div class="k">{span("On the timeline","En la línea del tiempo")}</div><div class="track">{tl}</div></section>

{chapters}

<section class="wrap-up" id="wrap">
  <div class="wh"><span class="badge" aria-hidden="true">★</span><div><span class="tab" style="display:inline-block;font:800 .7rem var(--sans);letter-spacing:.24em;text-transform:uppercase;color:var(--red)">{span("Unit wrap-up","Cierre de la unidad")}</span><h2>{E(u["title"])}</h2></div></div>

  <section class="match" id="match">
    <div class="mh"><h3>{span("Twelve words, twelve meanings","Doce palabras, doce significados")}</h3><span class="mscore" data-mscore aria-live="polite">0 / {len(words)}</span></div>
    <p class="deck">{span("Tap a word, then tap its meaning. A right pair locks in green.","Toca una palabra y luego su significado. Un par correcto se fija en verde.")}</p>
    <div class="mgrid"><div class="mcol"><span class="ck">{span("Words","Palabras")}</span>{wbtn}</div><div class="mcol"><span class="ck">{span("Meanings","Significados")}</span>{dbtn}</div></div>
    <div class="rfoot" style="padding:10px 0 0"><button type="button" class="btn" id="matchReset">{span("Shuffle and restart","Barajar y reiniciar")}</button></div>
  </section>

  <section class="review" data-review="t{n}" id="test">
    <div class="rh"><div><div class="k">{span("Unit test","Examen de la unidad")}</div><h3>{span("Fifteen questions across the unit","Quince preguntas de toda la unidad")}</h3></div><div class="rscore" data-rscore aria-live="polite">0 / {len(w["test"])}</div></div>
    <div class="rbody">{test}</div>
    <div class="rfoot"><button type="button" class="btn reset-r">{span("Try again","Otra vez")}</button><span class="verdict" data-verdict></span></div>
  </section>

  <section class="write" id="write">
    <h3>{span("Write it","Escríbelo")}</h3>
    <p class="wp">{E(w["write"]["prompt"])}</p>
    <ul>{tips}</ul>
    <label class="vh" for="writeBox">{span("Your writing","Tu escrito")}</label>
    <textarea id="writeBox" data-key="write" placeholder="Start with your claim…"></textarea>
    <div class="wfoot no-print"><span class="wc" data-wc>0 words</span><button type="button" class="btn" id="printWrite">{span("Print this page","Imprimir esta página")}</button><span class="wc">{span("Saved on this device as you type.","Se guarda en este dispositivo mientras escribes.")}</span></div>
  </section>

  {rooms_html}
</section>

<nav class="pager2 no-print" aria-label="Units">{prev_a}{next_a}</nav>

<details class="teach no-print"><summary>{span("For the teacher","Para el docente")}</summary><div class="inner">
  <p>{span("Every lesson keeps its own three checks; a lesson is ticked when all three are right. Chapter reviews and the unit test score on the page and remember the score on this device only. Nothing leaves the room.","Cada lección tiene sus tres comprobaciones; se marca cuando las tres están bien. Los repasos y el examen puntúan en la página y recuerdan la puntuación solo en este dispositivo. Nada sale del aula.")}</p>
  <p>{span("Print this page for a paper copy of the readings, the sources, the words and the questions; the answers print as dashed boxes under each question.","Imprime esta página para tener en papel las lecturas, las fuentes, las palabras y las preguntas; las respuestas se imprimen en cajas punteadas bajo cada pregunta.")}</p>
  <p>{span("Fact-check notes for this course live in the handoff: quotes marked (paraphrased) were set that way on purpose.","Las notas de verificación de este curso están en el traspaso: las citas marcadas (parafraseado) se pusieron así a propósito.")}</p>
</div></details>

<footer class="foot">{span("Architecture of Grace · U.S. History, Grades 6–8 · original text following the arc of a standard course · the banner is a drawn scene, not a photograph.","Architecture of Grace · Historia de EE. UU., grados 6–8 · texto original que sigue el arco de un curso estándar · el banner es una escena dibujada, no una fotografía.")}</footer>
</main>
</div>

<div class="drawer" id="drawer" data-open="0" role="dialog" aria-modal="true" aria-label="Contents">
  <div class="scrim" data-close></div>
  <div class="sheet"><div class="dh"><b>{span("Unit contents","Contenido de la unidad")}</b><button type="button" data-close aria-label="Close">✕</button></div><nav>{"".join(dn)}</nav></div>
</div>

<script>
{JS_UNIT.replace("__UNIT__", str(n))}
</script>
<script src="/aog-jump.js" defer></script>
</body>
</html>
'''
    return head(title, desc, "ush%d" % n) + body

# ─────────────────────────────────────────────────────────────────── the unit JS
JS_UNIT = r"""
(function(){
"use strict";
/* AOG-USH-V1 — the wiring for one unit page. Everything on the page was
   rendered at build time; this only makes it answer back. */
var KEY = "aog.interior.ws.v1.ush__UNIT__";
function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||"{}")||{}; }catch(e){ return {}; } }
var d = load(); d.q = d.q||{}; d.les = d.les||{}; d.write = d.write||"";
var pT; function persist(){ if(pT) clearTimeout(pT); pT = setTimeout(function(){ try{ localStorage.setItem(KEY, JSON.stringify(d)); }catch(e){} }, 300); }
var lang = "en";
function T(en, es){ return lang==="es" ? es : en; }
function paintLang(){
  document.documentElement.setAttribute("lang", lang);
  Array.prototype.forEach.call(document.querySelectorAll("[data-en]"), function(el){
    var v = el.getAttribute(lang==="es" ? "data-es" : "data-en");
    if(v==null) return;
    if(v.indexOf("<b>")>-1) el.innerHTML = v; else el.textContent = v;
  });
  var lb = document.getElementById("langBtn");
  if(lb) lb.textContent = (lang==="es") ? "English" : "Español";
  paintScores(); paintWC();
}
document.getElementById("langBtn").addEventListener("click", function(){ lang = (lang==="es") ? "en" : "es"; paintLang(); });
document.getElementById("themeBtn").addEventListener("click", function(){
  var cur = document.documentElement.getAttribute("data-theme")==="dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", cur);
  try{ localStorage.setItem("aog.interior.ws.v1.theme", cur); }catch(e){}
});

/* ── questions: checks, reviews, the test ── */
function qState(q){ return d.q[q.getAttribute("data-q")] || null; }
function paintQ(q){
  var st = qState(q), a = +q.getAttribute("data-a");
  var opts = q.querySelectorAll(".opt");
  Array.prototype.forEach.call(opts, function(o){
    var i = +o.getAttribute("data-i");
    o.removeAttribute("data-st"); o.disabled = false;
    if(st){ if(st.tried && st.tried.indexOf(i)>-1) o.setAttribute("data-st","tried"); if(st.done){ o.disabled = true; if(i===a) o.setAttribute("data-st","right"); } }
  });
  q.querySelector(".why").hidden = !(st && st.done);
  q.querySelector(".say").textContent = "";
}
function answer(q, i){
  var a = +q.getAttribute("data-a"), id = q.getAttribute("data-q");
  var st = d.q[id] || (d.q[id] = {tried:[], done:false, first:null});
  if(st.done) return;
  if(st.first===null) st.first = (i===a);
  if(i===a){ st.done = true; }
  else if(st.tried.indexOf(i)<0){ st.tried.push(i); }
  persist(); paintQ(q);
  if(i!==a) q.querySelector(".say").textContent = T("Not that one — read the lesson again and try another.","Esa no — vuelve a leer la lección y prueba otra.");
  paintScores();
}
document.addEventListener("click", function(ev){
  var o = ev.target.closest(".opt"); if(!o || o.disabled) return;
  var q = o.closest(".q"); if(!q) return;
  answer(q, +o.getAttribute("data-i"));
});
function paintScores(){
  /* per lesson: 3 checks → tick */
  Array.prototype.forEach.call(document.querySelectorAll(".checks"), function(c){
    var qs = c.querySelectorAll(".q"), n = qs.length, k = 0;
    Array.prototype.forEach.call(qs, function(q){ var s = qState(q); if(s && s.done) k++; });
    var sc = c.querySelector("[data-score]"); if(sc) sc.textContent = k ? (k+" / "+n) : "";
    var les = c.closest(".les"), lid = c.getAttribute("data-lesson");
    var done = (k===n);
    if(les) les.classList.toggle("done", done);
    if(done && !d.les[lid]){ d.les[lid] = 1; persist(); }
    var dl = document.querySelector('.drawer a[data-lid="'+lid+'"]'); if(dl) dl.classList.toggle("done", done);
  });
  /* reviews and the test: first-try score */
  Array.prototype.forEach.call(document.querySelectorAll(".review"), function(r){
    var qs = r.querySelectorAll(".q"), n = qs.length, k = 0, seen = 0;
    Array.prototype.forEach.call(qs, function(q){ var s = qState(q); if(s){ if(s.done) seen++; if(s.first) k++; } });
    r.querySelector("[data-rscore]").textContent = k+" / "+n;
    var v = r.querySelector("[data-verdict]");
    if(seen===n){
      var pct = k/n;
      v.textContent = pct>=.9 ? T("Strong. You own this chapter.","Fuerte. Este capítulo es tuyo.") : pct>=.7 ? T("Good — reread the ones you missed on the first try.","Bien — vuelve a leer las que fallaste al primer intento.") : T("Read the story and the main ideas again, then try again.","Vuelve a leer la historia y las ideas principales, y prueba otra vez.");
    } else v.textContent = "";
  });
}
Array.prototype.forEach.call(document.querySelectorAll(".reset-r"), function(b){
  b.addEventListener("click", function(){
    var r = b.closest(".review");
    Array.prototype.forEach.call(r.querySelectorAll(".q"), function(q){ delete d.q[q.getAttribute("data-q")]; paintQ(q); });
    persist(); paintScores();
    r.querySelector(".rbody").scrollIntoView({behavior:"smooth", block:"start"});
  });
});
Array.prototype.forEach.call(document.querySelectorAll(".q"), paintQ);
paintScores();

/* ── key words: tap the word, read the meaning ── */
var openPop = null;
function closePop(){ if(openPop){ openPop.remove(); openPop = null; } }
document.addEventListener("click", function(ev){
  var k = ev.target.closest(".kw");
  if(!k){ if(!ev.target.closest(".kwpop")) closePop(); return; }
  var was = openPop && openPop.parentNode===k;
  closePop(); if(was) return;
  var p = document.createElement("span"); p.className = "kwpop"; p.setAttribute("role","tooltip"); p.textContent = k.getAttribute("data-def");
  k.appendChild(p); openPop = p;
  var r = p.getBoundingClientRect(); if(r.right > window.innerWidth - 8) p.classList.add("right");
});
document.addEventListener("keydown", function(ev){ if(ev.key==="Escape"){ closePop(); closeDrawer(); } });

/* ── Listen: the reading, read aloud (speechSynthesis; quiet if absent) ── */
var speaking = null;
function stopSpeak(){ try{ window.speechSynthesis && window.speechSynthesis.cancel(); }catch(e){} if(speaking){ speaking.setAttribute("aria-pressed","false"); speaking = null; } }
Array.prototype.forEach.call(document.querySelectorAll(".listen"), function(b){
  if(!("speechSynthesis" in window)){ b.hidden = true; return; }
  b.addEventListener("click", function(){
    if(speaking===b){ stopSpeak(); return; }
    stopSpeak();
    var les = document.getElementById(b.getAttribute("data-for"));
    var txt = [les.querySelector("h4").textContent, les.querySelector(".main-idea").textContent].concat(
      Array.prototype.map.call(les.querySelectorAll(".reading p"), function(p){ return p.textContent; })).join(". ");
    var u = new SpeechSynthesisUtterance(txt); u.lang = (lang==="es") ? "es-ES" : "en-US"; u.rate = .95;
    u.onend = function(){ if(speaking===b){ speaking.setAttribute("aria-pressed","false"); speaking = null; } };
    speaking = b; b.setAttribute("aria-pressed","true");
    window.speechSynthesis.speak(u);
  });
});

/* ── the contents drawer ── */
var drawer = document.getElementById("drawer"), dBtn = document.getElementById("drawerBtn"), lastFocus = null;
function openDrawer(){ lastFocus = document.activeElement; drawer.setAttribute("data-open","1"); dBtn.setAttribute("aria-expanded","true"); document.body.style.overflow = "hidden"; var f = drawer.querySelector("nav a"); if(f) f.focus(); }
function closeDrawer(){ if(drawer.getAttribute("data-open")!=="1") return; drawer.setAttribute("data-open","0"); dBtn.setAttribute("aria-expanded","false"); document.body.style.overflow = ""; if(lastFocus) lastFocus.focus(); }
dBtn.addEventListener("click", function(){ drawer.getAttribute("data-open")==="1" ? closeDrawer() : openDrawer(); });
drawer.addEventListener("click", function(ev){ if(ev.target.closest("[data-close]") || ev.target.closest("nav a")) closeDrawer(); });
Array.prototype.forEach.call(drawer.querySelectorAll("nav a[data-lid]"), function(a){ if(d.les[a.getAttribute("data-lid")]) a.classList.add("done"); });

/* ── the word match ── */
(function(){
  var box = document.getElementById("match"); if(!box) return;
  var wcol = box.querySelector(".mcol:first-child"), dcol = box.querySelector(".mcol:last-child");
  var pickW = null, pickD = null, got = 0, total = box.querySelectorAll(".mt.w").length;
  function shuffle(col){
    var items = Array.prototype.slice.call(col.querySelectorAll(".mt"));
    for(var i=items.length-1;i>0;i--){ var j = Math.floor(Math.random()*(i+1)); var t = items[i]; items[i]=items[j]; items[j]=t; }
    items.forEach(function(it){ it.classList.remove("ok","no"); it.setAttribute("aria-pressed","false"); it.disabled = false; col.appendChild(it); });
  }
  function score(){ box.querySelector("[data-mscore]").textContent = got+" / "+total; }
  function reset(){ pickW = pickD = null; got = 0; shuffle(wcol); shuffle(dcol); score(); }
  box.addEventListener("click", function(ev){
    var b = ev.target.closest(".mt"); if(!b || b.classList.contains("ok")) return;
    if(b.classList.contains("w")){ if(pickW) pickW.setAttribute("aria-pressed","false"); pickW = b; }
    else { if(pickD) pickD.setAttribute("aria-pressed","false"); pickD = b; }
    b.setAttribute("aria-pressed","true");
    if(pickW && pickD){
      if(pickW.getAttribute("data-k")===pickD.getAttribute("data-k")){
        pickW.classList.add("ok"); pickD.classList.add("ok"); pickW.disabled = pickD.disabled = true; got++; score();
        if(got===total){ box.querySelector("[data-mscore]").textContent = got+" / "+total+" ✓"; }
      } else {
        pickW.classList.add("no"); pickD.classList.add("no");
        var a = pickW, c = pickD; setTimeout(function(){ a.classList.remove("no"); c.classList.remove("no"); }, 320);
      }
      pickW.setAttribute("aria-pressed","false"); pickD.setAttribute("aria-pressed","false"); pickW = pickD = null;
    }
  });
  document.getElementById("matchReset").addEventListener("click", reset);
  reset();
})();

/* ── the writing task ── */
var wb = document.getElementById("writeBox");
function paintWC(){ var n = (wb.value.match(/\S+/g)||[]).length; document.querySelector("[data-wc]").textContent = n + (lang==="es" ? " palabras" : " words"); }
wb.value = d.write || ""; paintWC();
wb.addEventListener("input", function(){ d.write = wb.value; persist(); paintWC(); });
document.getElementById("printWrite").addEventListener("click", function(){ window.print(); });

/* the jump select, as every page wires it */
var jumpSel = document.getElementById("jumpSel");
if(jumpSel){ jumpSel.addEventListener("change", function(){ if(jumpSel.value) location.href = jumpSel.value; }); }

/* .30fg: the way out — the site bar hides #langBtn/#themeBtn itself and clicks them */
window.addEventListener("hashchange", closePop);
})();
"""

# ─────────────────────────────────────────────────────────────────── the contents page
def contents_page(units):
    rail = "".join('<a href="#u%d" title="%s">%d</a>' % (u["n"], E(u["title"]), u["n"]) for u in units)
    total_lessons = sum(len(s["lessons"]) for u in units for c in u["chapters"] for s in c["sections"])
    total_ch = sum(len(u["chapters"]) for u in units)
    spreads = []
    for u in units:
        n = u["n"]
        chs = []
        for c in u["chapters"]:
            secs = []
            num = 0
            for si, s in enumerate(c["sections"]):
                rows = []
                for l in s["lessons"]:
                    num += 1
                    rows.append('<a class="lrow" href="ush-u%d.html#l%d-%d" data-lid="ush%d:l%d-%d" data-s="%s"><span class="n">%d.%d</span><span class="t">%s</span><span class="tk" aria-hidden="true">%s</span></a>'
                                % (n, c["n"], num, n, c["n"], num, E((l["title"]+" "+l["mainIdea"]).lower()), c["n"], num, E(l["title"]), ICO["check"]))
                secs.append('<div class="csec"><div class="sn">%s %d<span>%s</span></div>%s</div>' % (span("Section","Sección"), si+1, E(s["title"]), "".join(rows)))
            chs.append(f'''<article class="cchap">
  <div class="ch"><span class="badge" aria-hidden="true">{c["n"]}</span><div><span class="tab">{span("Chapter","Capítulo")}</span><h3><a href="ush-u{n}.html#ch{c["n"]}" style="color:inherit;text-decoration:none">{E(c["title"])}</a></h3><div class="yrs">{E(c["years"])}</div></div></div>
  <p class="st"><b>{span("The story","La historia")}</b>{E(c["story"]["title"])} — {E(c["story"]["kicker"])}</p>
  {"".join(secs)}
  <div class="cwrap"><a href="ush-u{n}.html#rev{c["n"]}">{span("Chapter review · 8 questions","Repaso del capítulo · 8 preguntas")}</a></div>
</article>''')
        credit = CREDITS.get(n, "")
        spreads.append(f'''<section class="unit-spread" id="u{n}" data-unit="{n}">
<div class="spread" aria-labelledby="ut{n}">
  <div class="scene" aria-hidden="true">{banner(n)}</div>
  {'<div class="credit">' + E(credit) + '</div>' if credit else ''}
  <div class="txt"><div class="unum"><b>{n}</b>{span("Unit","Unidad")}</div><h2 class="ut" id="ut{n}">{E(u["title"])}</h2><div class="years">{E(u["years"])}</div></div>
  <a class="enter" href="ush-u{n}.html">{span("Open the unit","Abrir la unidad")} →</a>
</div>
<div class="body">
  {"".join(chs)}
  <div class="cwrap" style="border:0;padding-left:0;padding-right:0"><a href="ush-u{n}.html#match">{span("Twelve-word match","Doce palabras")}</a><a href="ush-u{n}.html#test">{span("Unit test · 15 questions","Examen · 15 preguntas")}</a><a href="ush-u{n}.html#write">{span("Write it","Escríbelo")}</a></div>
</div>
</section>''')
    jb = mark_current(jump_block(), "us-history.html", "")
    title = "U.S. History, Grades 6–8"
    desc = "A free U.S. history course for grades 6–8: ten units, %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. Original text, built for students with IEPs and English learners." % (total_ch, total_lessons)
    body = f'''<body>
<script src="/aog-topbar.js"></script>
<div class="wrap contents">
<header class="mast">
  <div>
    <div class="k">{span("The Interior — Social Studies · Grades 6–8","El Interior — Estudios Sociales · Grados 6–8")}</div>
    <h1 data-en="U.S. History" data-es="Historia de EE. UU.">U.S. History</h1>
    <p class="deck">{span("The whole course on one page: ten units, each with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.","Todo el curso en una página: diez unidades, cada una con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones.")}</p>
    <p class="hubline no-print"><a id="hubLink" href="social-studies-hub.html">{span("← Social Studies, every band","← Estudios Sociales, cada banda")}</a></p>
  </div>
  <div class="row no-print">
    <button class="chipbtn" id="langBtn" type="button">Español</button>
    <button class="chipbtn" id="themeBtn" type="button" data-en="Dark" data-es="Oscuro">Dark</button>
  </div>
</header>

<main id="main">
{jb}
<nav class="rail no-print" aria-label="Units"><div class="in"><span class="k">{span("Unit","Unidad")}</span>{rail}</div></nav>

<div class="stat no-print">
  <span><span class="n">10</span> <span class="l">{span("units","unidades")}</span></span>
  <span><span class="n">{total_ch}</span> <span class="l">{span("chapters","capítulos")}</span></span>
  <span><span class="n">{total_lessons}</span> <span class="l">{span("lessons","lecciones")}</span></span>
  <span class="prog" aria-hidden="true"><i id="progBar"></i></span>
  <span><span class="n" id="progN">0</span> <span class="l">{span("done","hechas")}</span></span>
</div>

<div class="search no-print">
  <label for="lsearch">{span("Find a lesson","Busca una lección")}</label>
  <div class="box">{ICO["search"]}<input id="lsearch" type="search" autocomplete="off" placeholder="Try “Constitution” or “railroad”"></div>
  <div class="hits" id="hits" aria-live="polite"></div>
</div>

{"".join(spreads)}

<details class="teach no-print"><summary>{span("For the teacher","Para el docente")}</summary><div class="inner">
  <p>{span("The course follows the arc of a standard junior-high U.S. history textbook — units, chapters, sections, numbered lessons — in original text written at a grade 6–8 reading level. Every lesson has a main idea, a three- or four-paragraph reading with key words you can tap, a source, a data table or a scenario to think through, and three checks.","El curso sigue el arco de un libro de texto estándar de historia de EE. UU. de secundaria — unidades, capítulos, secciones, lecciones numeradas — en texto original al nivel de lectura de 6.º a 8.º. Cada lección tiene una idea principal, una lectura de tres o cuatro párrafos con palabras clave, una fuente, una tabla de datos o un escenario, y tres comprobaciones.")}</p>
  <p>{span("Progress ticks live on this device only. Print any unit page for a paper copy.","Las marcas de progreso viven solo en este dispositivo. Imprime cualquier unidad para tener una copia en papel.")}</p>
</div></details>

<footer class="foot">{span("Architecture of Grace · U.S. History, Grades 6–8 · original text following the arc of a standard course · banners are drawn scenes.","Architecture of Grace · Historia de EE. UU., grados 6–8 · texto original que sigue el arco de un curso estándar · los banners son escenas dibujadas.")}</footer>
</main>
</div>
<script>
{JS_CONTENTS}
</script>
<script src="/aog-jump.js" defer></script>
</body>
</html>
'''
    return head(title, desc, "us-history") + body

JS_CONTENTS = r"""
(function(){
"use strict";
var lang = "en";
function paintLang(){
  document.documentElement.setAttribute("lang", lang);
  Array.prototype.forEach.call(document.querySelectorAll("[data-en]"), function(el){
    var v = el.getAttribute(lang==="es" ? "data-es" : "data-en"); if(v==null) return;
    if(v.indexOf("<b>")>-1) el.innerHTML = v; else el.textContent = v;
  });
  var lb = document.getElementById("langBtn"); if(lb) lb.textContent = (lang==="es") ? "English" : "Español";
  paintHits();
}
document.getElementById("langBtn").addEventListener("click", function(){ lang = (lang==="es") ? "en" : "es"; paintLang(); });
document.getElementById("themeBtn").addEventListener("click", function(){
  var cur = document.documentElement.getAttribute("data-theme")==="dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", cur);
  try{ localStorage.setItem("aog.interior.ws.v1.theme", cur); }catch(e){}
});
/* progress ticks: read every unit's record */
var rows = document.querySelectorAll(".lrow"), done = 0;
for(var n=1;n<=10;n++){
  var rec = {}; try{ rec = JSON.parse(localStorage.getItem("aog.interior.ws.v1.ush"+n)||"{}")||{}; }catch(e){}
  var les = rec.les||{};
  for(var k in les){ var a = document.querySelector('.lrow[data-lid="ush'+n+':'+k+'"]'); if(a){ a.classList.add("done"); done++; } }
}
document.getElementById("progN").textContent = done;
document.getElementById("progBar").style.width = (rows.length ? Math.round(100*done/rows.length) : 0) + "%";
/* the lesson search */
var inp = document.getElementById("lsearch"), hits = document.getElementById("hits"), cur = "";
function norm(s){ return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,""); }
function paintHits(){
  if(!cur){ hits.textContent = ""; return; }
  var n = document.querySelectorAll(".lrow:not([hidden])").length;
  hits.textContent = n + (lang==="es" ? " lecciones" : " lessons") + (lang==="es" ? " para “" : " for “") + cur + "”";
}
function filter(){
  cur = inp.value.trim(); var q = norm(cur);
  Array.prototype.forEach.call(rows, function(a){ a.hidden = !!q && norm(a.getAttribute("data-s")).indexOf(q) < 0; });
  Array.prototype.forEach.call(document.querySelectorAll(".csec"), function(s){ s.setAttribute("data-empty", s.querySelector(".lrow:not([hidden])") ? "0" : "1"); });
  Array.prototype.forEach.call(document.querySelectorAll(".cchap"), function(c){ c.setAttribute("data-empty", c.querySelector(".lrow:not([hidden])") ? "0" : "1"); });
  Array.prototype.forEach.call(document.querySelectorAll(".unit-spread"), function(u){ u.setAttribute("data-empty", (q && !u.querySelector(".lrow:not([hidden])")) ? "1" : "0"); });
  paintHits();
}
inp.addEventListener("input", filter);
var jumpSel = document.getElementById("jumpSel");
if(jumpSel){ jumpSel.addEventListener("change", function(){ if(jumpSel.value) location.href = jumpSel.value; }); }
})();
"""

# ─────────────────────────────────────────────────────────────────── main
def main():
    units = [json.load(open(HERE / ("u%d.json" % i), encoding="utf-8")) for i in range(1, 11)]
    for u in units:
        out = DEPLOY / ("ush-u%d.html" % u["n"])
        out.write_text(unit_page(u, units), encoding="utf-8")
        print("wrote", out.name, out.stat().st_size, "bytes")
    out = DEPLOY / "us-history.html"
    out.write_text(contents_page(units), encoding="utf-8")
    print("wrote", out.name, out.stat().st_size, "bytes")

if __name__ == "__main__":
    main()
