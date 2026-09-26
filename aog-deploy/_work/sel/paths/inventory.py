#!/usr/bin/env python3
"""Every lesson's steps and minutes, per room → _work/sel/paths/inventory.json.
Read-only over the lesson pages. Run from aog-deploy/."""
import re, json, html
ROOMS = ["12", "18", "36", "104", "207"]
def text(x): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip()
inv = {}
for r in ROOMS:
    s = open(f"room-{r}-lessons.html", encoding="utf8").read()
    s = re.sub(r"<svg.*?</svg>", "", s, flags=re.S)
    out = {}
    for m in re.finditer(r'<section class="lesson[^"]*" id="(u\d+l\d+[a-z]?)"[^>]*>(.*?)</section>', s, flags=re.S):
        lid, body = m.group(1), m.group(2)
        head = re.search(r'<div class="lhead">(.*?)<div class="lchips"', body, flags=re.S)
        title = text(head.group(1)) if head else lid
        dur = re.search(r'DURATION(.{0,200}?)</div>', text(body[:3000]) and body, flags=re.S)
        durt = text(dur.group(1))[:60] if dur else ""
        steps = []
        for st in re.finditer(r'<div class="step[^"]*"><span class="sn">(.*?)</span><span class="st">(.*?)</span><span class="sm">(.*?)</span></div>(.*?)(?=<div class="step|<div class="box (?:exit|cards)|<div class="wchip|\Z)', body, flags=re.S):
            n, t, mm, rest = st.groups()
            steps.append({"n": text(n), "title": text(t), "min": text(mm), "words": len(text(rest).split())})
        boxes = [text(b)[:60] for b in re.findall(r'<div class="box ([a-z]+)"', body)]
        out[lid] = {"title": title, "duration": durt, "steps": steps, "boxes": re.findall(r'<div class="box ([a-z]+)"', body)}
    inv[r] = out
    print("room", r, len(out), "lessons,", sum(len(v["steps"]) for v in out.values()), "steps; no-step lessons:", [k for k, v in out.items() if not v["steps"]][:8])
json.dump(inv, open("_work/sel/paths/inventory.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
