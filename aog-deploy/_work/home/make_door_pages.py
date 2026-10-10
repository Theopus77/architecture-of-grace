# -*- coding: utf-8 -*-
"""AOG-DOOR-PAGES-V1 (2026-10-10) — /sel and /courses, their own pages.

Jimmy: "Can you make a direct link icon to … the SEL curriculum, the courses …" and then "They should have their own
address." On the front page, SEL and The Courses are doors that open a panel of links. This script copies each panel
out of index.html into a page of its own, so each has an address (/sel, /courses) and its own Home Screen icon
(sel.webmanifest, courses.webmanifest). The front page keeps its panels; this page is the same list, read from them.
When a panel changes in index.html, run this again:

  python3 _work/home/make_door_pages.py        (from aog-deploy/)
"""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))

PAGES = {
    "sel": dict(file="sel.html", pic="sel12-u1-pencil-900", short="SEL",
                title=("SEL · Social-Emotional Language", "SEL · Lenguaje socioemocional"),
                line=("Words for feelings. Calm tools beside them. Pick a room for your grade.",
                      "Palabras para los sentimientos. Herramientas de calma al lado. Elige el salón de tu grado.")),
    "courses": dict(file="courses.html", pic="door-courses-pencil-900", short="Courses",
                    title=("The Courses", "Los cursos"),
                    line=("Math, science, English and more. Pictures first. Pick a course.",
                          "Matemáticas, ciencias, inglés y más. Imágenes primero. Elige un curso.")),
}

def panel(src, k):
    i = src.index('id="aogdnList-%s"' % k); i = src.rfind("<div", 0, i)
    d = 0
    for m in re.finditer(r"<(/?)div\b", src[i:]):
        d += -1 if m.group(1) else 1
        if d == 0:
            return src[i:i + m.end() + src[i + m.end():].index(">") + 1]
    raise SystemExit("panel %s not closed" % k)

def body_of(blk):
    ul = blk[blk.index("<ul"):blk.rindex("</ul>") + 5]
    ul = re.sub(r'\sonclick="[^"]*"', "", ul)
    ul = ul.replace('href="#tools"', 'href="/calm"')            # the calm tools: their own address (AOG-CALM-APP-V1)
    ul = ul.replace('aria-controls="aogdnBand', 'aria-controls="dpBand').replace('id="aogdnBand', 'id="dpBand')
    return ul

CSS = """
:root{--ink:#0A1E33;--soft:#46525f;--paper:#FBF8F1;--card:#FFFFFF;--line:#DDD5C3;--gold:#C9A24A;--wash:#F3EEE2}
:root[data-theme="dark"]{--ink:#EEF2F6;--soft:#B9C3CE;--paper:#11161C;--card:#18202A;--line:#2E3946;--wash:#202a35}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ink:#EEF2F6;--soft:#B9C3CE;--paper:#11161C;--card:#18202A;--line:#2E3946;--wash:#202a35}}
html,body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.5 "Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
main{max-width:64rem;margin:0 auto;padding:18px 16px 56px}
.dp-top{display:grid;gap:14px;align-items:center;margin:0 0 20px}
.dp-pic{border-radius:16px;overflow:hidden;border:1px solid var(--line);background:#f3eee2}
.dp-pic img{display:block;width:100%;height:auto}
h1{font-family:"Fraunces",Georgia,serif;font-size:clamp(1.6rem,4vw,2.2rem);line-height:1.12;margin:0 0 6px;color:var(--ink)}
.dp-line{margin:0;color:var(--soft);font-size:1.05rem}
@media (min-width:760px){.dp-top{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}}
.aogdn-rows{list-style:none;margin:0;padding:0}
.aogdn-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));gap:12px}
.aogdn-cards>li{min-width:0}
.aogdn-cards>li.aogdn-fold{grid-column:1/-1}
.aogdn-cards a,.aogdn-flab{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;box-sizing:border-box;padding:8px 14px 8px 8px;
  border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--ink);text-decoration:none;font-family:inherit;font-size:1rem;font-weight:600;line-height:1.3;text-align:left;cursor:pointer}
.aogdn-flab{font-weight:700}
.aogdn-cards a:hover,.aogdn-flab:hover{border-color:var(--gold)}
.aogdn-cards a:focus-visible,.aogdn-flab:focus-visible{outline:3px solid var(--gold);outline-offset:2px}
.aogdn-cpic{flex:0 0 auto;width:72px;height:48px;border-radius:9px;overflow:hidden;background:#f3eee2}
.aogdn-cpic img{display:block;width:100%;height:100%;object-fit:cover}
.aogdn-flab .aogdn-chev{margin-left:auto;flex:0 0 auto;transition:none}
.aogdn-flab[aria-expanded="true"]{border-color:var(--gold);box-shadow:inset 0 0 0 1px var(--gold)}
.aogdn-flab[aria-expanded="true"] .aogdn-chev{transform:rotate(180deg)}
.aogdn-inner{display:grid;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));gap:10px;padding:10px 0 6px 12px;border-left:3px solid var(--gold);margin:0 0 4px 6px}
.aogdn-inner a{background:var(--wash)}
.aogdn-fold[hidden]{display:none}
"""

JS = """<script>
/* a group (Room 12 · Grades K-2 …) opens and closes in place */
document.querySelectorAll(".aogdn-flab").forEach(function(b){
  var f = document.getElementById(b.getAttribute("aria-controls")); if(!f) return;
  b.setAttribute("aria-expanded", f.hidden ? "false" : "true");
  b.addEventListener("click", function(){ var open = f.hidden; f.hidden = !open; b.setAttribute("aria-expanded", open ? "true" : "false"); });
});
</script>"""

def page(k, p, ul):
    t_en, t_es = p["title"]; l_en, l_es = p["line"]
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{t_en} — Architecture of Grace</title>
<meta name="description" content="{l_en}">
<meta name="theme-color" content="#0A1E33">
<!-- AOG-DOOR-PAGES-V1 · AOG-HOME-APPS-V1 (2026-10-10). MADE BY _work/home/make_door_pages.py from the front page's
     "{k}" panel: edit the panel in index.html (or this script's words), then run it. -->
<link rel="manifest" href="/{k}.webmanifest">
<link rel="apple-touch-icon" href="/app-{k}-touch.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="{p['short']}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="stylesheet" href="/aog-calm.css">
<style>{CSS}</style>
</head>
<body>
<main>
  <div class="dp-top">
    <div><h1 data-en="{t_en}" data-es="{t_es}">{t_en}</h1>
    <p class="dp-line" data-en="{l_en}" data-es="{l_es}">{l_en}</p></div>
    <div class="dp-pic"><picture><source type="image/webp" srcset="/img/banners/{p['pic']}.webp"><img src="/img/banners/{p['pic']}.jpg" alt="" width="900" height="315" decoding="async"></picture></div>
  </div>
  {ul}
</main>
{JS}
<script src="/aog-grace.js" defer></script>
<script src="/aog-topbar.js"></script>
</body>
</html>
"""

def build():
    src = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    for k, p in PAGES.items():
        out = page(k, p, body_of(panel(src, k)))
        open(os.path.join(ROOT, p["file"]), "w", encoding="utf-8").write(out)
        print(p["file"], "written")

if __name__ == "__main__":
    build()
