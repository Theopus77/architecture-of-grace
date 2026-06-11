#!/usr/bin/env python3
SRC = "index_v4.html"
OUT = "index_v5.html"
with open(SRC, "r", encoding="utf-8") as fh:
    s = fh.read()

def replace_once(hay, old, new, label):
    n = hay.count(old)
    if n != 1:
        raise SystemExit(f"[FAIL] {label}: expected 1 match, found {n}")
    return hay.replace(old, new, 1)

# Scope the "Go deeper" CTA strictly to the ACTIVE screen so it never navigates
# away: on the workplace page it scrolls to the in-page check-in (#wpLaunch); on
# the choose page it scrolls to the check-in doors (.aog-checkins). Stays put.
OLD = ("event.preventDefault(); "
       "var _el=document.getElementById('wpLaunch'); "
       "if(_el){_el.scrollIntoView({behavior:'smooth',block:'start'});} "
       "else if(typeof startAdult==='function'){startAdult();}")
NEW = ("event.preventDefault(); "
       "var _a=document.querySelector('.screen.active'); "
       "var _el=_a&&(_a.querySelector('#wpLaunch')||_a.querySelector('.aog-checkins')); "
       "if(_el){_el.scrollIntoView({behavior:'smooth',block:'start'});}")
s = replace_once(s, OLD, NEW, "scope go-deeper to active screen")

with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(s)
print("[OK] wrote", OUT)
