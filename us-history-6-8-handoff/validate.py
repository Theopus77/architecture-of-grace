#!/usr/bin/env python3
"""Validate one unit file:  python3 validate.py u3.json
Prints OK with counts, or every problem found (exit 1)."""
import json, sys, re

errs = []
def E(path, msg): errs.append(f"{path}: {msg}")

def s(v, path, lo=1, hi=100000):
    if not isinstance(v, str) or not v.strip(): E(path, "must be a non-empty string"); return
    if len(v) < lo: E(path, f"too short ({len(v)} < {lo} chars)")
    if len(v) > hi: E(path, f"too long ({len(v)} > {hi} chars)")
    if re.search(r"<[a-zA-Z/]", v): E(path, "no HTML tags; use plain text (use *word* for bold key words only in reading)")

def mc(q, path):
    if not isinstance(q, dict): E(path, "must be an object"); return
    s(q.get("q"), path + ".q", 10, 300)
    ch = q.get("choices")
    if not (isinstance(ch, list) and len(ch) == 4): E(path, "choices must be a list of exactly 4"); ch = []
    for i, c in enumerate(ch): s(c, f"{path}.choices[{i}]", 1, 160)
    if len(set(ch)) != len(ch): E(path, "duplicate choices")
    a = q.get("a")
    if not (isinstance(a, int) and 0 <= a <= 3): E(path, "a must be the index 0-3 of the right choice")
    s(q.get("why"), path + ".why", 10, 300)

def words(ws, path, lo, hi):
    if not (isinstance(ws, list) and lo <= len(ws) <= hi): E(path, f"need {lo}-{hi} words"); return
    for i, w in enumerate(ws):
        if not isinstance(w, dict): E(f"{path}[{i}]", "must be {w,d}"); continue
        s(w.get("w"), f"{path}[{i}].w", 2, 60); s(w.get("d"), f"{path}[{i}].d", 10, 220)

u = json.load(open(sys.argv[1]))
nlessons = 0; nq = 0
s(u.get("title"), "title"); s(u.get("years"), "years")
if not isinstance(u.get("n"), int): E("n", "unit number int")
intro = u.get("intro")
if not (isinstance(intro, list) and 2 <= len(intro) <= 3): E("intro", "2-3 paragraphs")
else:
    for i, p in enumerate(intro): s(p, f"intro[{i}]", 200, 900)
s(u.get("bigQuestion"), "bigQuestion", 20, 200)
tl = u.get("timeline")
if not (isinstance(tl, list) and 8 <= len(tl) <= 12): E("timeline", "8-12 events")
else:
    for i, t in enumerate(tl):
        s(t.get("y"), f"timeline[{i}].y", 3, 12); s(t.get("t"), f"timeline[{i}].t", 10, 140)
chs = u.get("chapters") or []
if not chs: E("chapters", "missing")
for ci, c in enumerate(chs):
    P = f"chapters[{ci}]"
    for k, lo, hi in (("title", 3, 80), ("years", 4, 20), ("bigQuestion", 20, 200)): s(c.get(k), f"{P}.{k}", lo, hi)
    if not isinstance(c.get("n"), int): E(P + ".n", "chapter number int")
    st = c.get("story") or {}
    s(st.get("title"), P + ".story.title", 5, 90); s(st.get("kicker"), P + ".story.kicker", 20, 200)
    ps = st.get("paragraphs")
    if not (isinstance(ps, list) and 4 <= len(ps) <= 6): E(P + ".story.paragraphs", "4-6 paragraphs")
    else:
        for i, p in enumerate(ps): s(p, f"{P}.story.paragraphs[{i}]", 200, 900)
    s(st.get("think"), P + ".story.think", 20, 250)
    secs = c.get("sections") or []
    if not (3 <= len(secs) <= 4): E(P + ".sections", "3-4 sections")
    for si, sec in enumerate(secs):
        SP = f"{P}.sections[{si}]"
        s(sec.get("title"), SP + ".title", 3, 70)
        ls = sec.get("lessons") or []
        if not (2 <= len(ls) <= 4): E(SP + ".lessons", "2-4 lessons")
        for li, l in enumerate(ls):
            LP = f"{SP}.lessons[{li}]"; nlessons += 1
            s(l.get("title"), LP + ".title", 3, 70)
            s(l.get("mainIdea"), LP + ".mainIdea", 30, 220)
            rd = l.get("reading")
            if not (isinstance(rd, list) and 3 <= len(rd) <= 4): E(LP + ".reading", "3-4 paragraphs")
            else:
                for i, p in enumerate(rd): s(p, f"{LP}.reading[{i}]", 180, 800)
            words(l.get("words"), LP + ".words", 2, 5)
            lk = l.get("look") or {}
            t = lk.get("type")
            if t not in ("source", "data", "think"): E(LP + ".look.type", "source | data | think")
            s(lk.get("title"), LP + ".look.title", 4, 90)
            s(lk.get("prompt"), LP + ".look.prompt", 15, 260)
            if t == "source":
                s(lk.get("text"), LP + ".look.text", 20, 520); s(lk.get("cite"), LP + ".look.cite", 8, 200)
                if lk.get("paraphrase") not in (True, False): E(LP + ".look.paraphrase", "true or false required on sources")
            elif t == "data":
                rows = lk.get("rows")
                if not (isinstance(rows, list) and 3 <= len(rows) <= 8): E(LP + ".look.rows", "3-8 [label, number] rows")
                else:
                    for i, r in enumerate(rows):
                        if not (isinstance(r, list) and len(r) == 2 and isinstance(r[0], str) and isinstance(r[1], (int, float))): E(f"{LP}.look.rows[{i}]", "[label, number]")
                s(lk.get("unit"), LP + ".look.unit", 1, 40); s(lk.get("cite"), LP + ".look.cite", 8, 200)
            elif t == "think":
                s(lk.get("text"), LP + ".look.text", 60, 600)
            chk = l.get("check")
            if not (isinstance(chk, list) and len(chk) == 3): E(LP + ".check", "exactly 3 questions")
            else:
                for i, q in enumerate(chk): mc(q, f"{LP}.check[{i}]"); nq += 1
    rv = c.get("review")
    if not (isinstance(rv, list) and len(rv) == 8): E(P + ".review", "exactly 8 questions")
    else:
        for i, q in enumerate(rv): mc(q, f"{P}.review[{i}]"); nq += 1
w = u.get("wrap") or {}
words(w.get("words"), "wrap.words", 12, 12)
t = w.get("test")
if not (isinstance(t, list) and len(t) == 15): E("wrap.test", "exactly 15 questions")
else:
    for i, q in enumerate(t): mc(q, f"wrap.test[{i}]"); nq += 1
wr = w.get("write") or {}
s(wr.get("prompt"), "wrap.write.prompt", 40, 400)
tips = wr.get("tips")
if not (isinstance(tips, list) and 3 <= len(tips) <= 5): E("wrap.write.tips", "3-5 tips")
else:
    for i, p in enumerate(tips): s(p, f"wrap.write.tips[{i}]", 10, 200)

# answer-position balance: a quiz where the answer is always B teaches nothing
from collections import Counter
pos = Counter()
def walk(x):
    if isinstance(x, dict):
        if "choices" in x and isinstance(x.get("a"), int): pos[x["a"]] += 1
        for v in x.values(): walk(v)
    elif isinstance(x, list):
        for v in x: walk(v)
walk(u)
tot = sum(pos.values()) or 1
for k in range(4):
    if pos[k] / tot > 0.35 or pos[k] / tot < 0.15: E("answers", f"right-answer positions unbalanced {dict(pos)} — aim for ~25% each")

if errs:
    print(f"{len(errs)} PROBLEM(S):"); [print(" -", e) for e in errs[:80]]; sys.exit(1)
print(f"OK · unit {u['n']} · {len(chs)} chapters · {nlessons} lessons · {nq} questions · positions {dict(pos)}")
