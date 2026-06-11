#!/usr/bin/env python3
import re
SRC = "index_v3.html"
OUT = "index_v4.html"
with open(SRC, "r", encoding="utf-8") as fh:
    s = fh.read()

def replace_once(hay, old, new, label):
    n = hay.count(old)
    if n != 1:
        raise SystemExit(f"[FAIL] {label}: expected 1 match, found {n}")
    return hay.replace(old, new, 1)

# 1) "Go deeper with the full check-in" CTA: stop rerouting to the workplace
#    page; scroll to the full check-in already on this page (#wpLaunch), with a
#    fallback to the grown-up check-in if that anchor isn't present.
OLD_CTA = ('    var ctaHtml = "<a href=\\"#\\" class=\\"tk-go2\\" onclick=\\"event.preventDefault(); '
           "if(typeof openWorkplaceCheckin==='function'){openWorkplaceCheckin();}"
           "else if(typeof openWorkplace==='function'){openWorkplace();}"
           '\\">" + ctaLabel + " <span aria-hidden=\\"true\\">&rarr;</span></a>";')
NEW_CTA = ('    var ctaHtml = "<a href=\\"#\\" class=\\"tk-go2\\" onclick=\\"event.preventDefault(); '
           "var _el=document.getElementById('wpLaunch'); "
           "if(_el){_el.scrollIntoView({behavior:'smooth',block:'start'});} "
           "else if(typeof startAdult==='function'){startAdult();}"
           '\\">" + ctaLabel + " <span aria-hidden=\\"true\\">&rarr;</span></a>";')
s = replace_once(s, OLD_CTA, NEW_CTA, "go-deeper CTA stays on page")

# 2) Remove the hero subtitle line that "doesn't mesh"
before = len(s)
s = re.sub(r'\n\s*<p class="hyb-onesent"[^>]*>.*?</p>', '', s, count=1, flags=re.S)
if len(s) == before:
    raise SystemExit("[FAIL] hyb-onesent paragraph not removed")

with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(s)
print("[OK] wrote", OUT)
