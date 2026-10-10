# -*- coding: utf-8 -*-
"""build_charts.py — adult-charts.html (/adult/charts), the twelve interactive anchor charts (AOG-ADULT-CHARTS-V1).

    python3 adult-build/build_charts.py /path/to/book6.json

Jimmy (2026-10-10): "I dont see any interactive anchor charts or lesson pages on the Adult SEL." Built the way the
rooms' anchor charts work: a skeleton first, then the reveals, then what the room said out loud. Every line on a
chart is the manual's own: the anchor concept, sentence by sentence, and the session's "Write on the board" items.
What the group says is typed in and kept on this device (localStorage aog.adult.charts.v1).
"""
import io, os, re, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import build_curriculum as C

BOARD_START = re.compile(r"^(Write (each )?on (the|a) (board|flipchart)|Write on the board)")
BOARD_ITEM = re.compile(r"^([A-Z][A-Z \-/']{3,}:|\d\.\s|STEP \d\.|SIGN \d\.|MOVE \d\.|THE [A-Z]+:)")
SENT = re.compile(r"(?:(?<=[.!?])|(?<=[.!?][\"”'’]))\s+(?=[A-Z0-9\"“‘'])")

def sentences(paras):
    out = []
    for t in paras:
        for part in re.split(r"\s+(?=\d\.\s)", t):           # the Compact's numbered clauses, one line each
            part = part.strip()
            if not part: continue
            if re.match(r"^\d\.\s", part): out.append(re.sub(r"\s+", " ", part)); continue
            out += [x.strip() for x in SENT.split(part) if x.strip()]
    return out

def split_item(t):
    t = re.sub(r"\s+", " ", t).strip()
    m = re.match(r"^((?:STEP|SIGN|MOVE) \d\.\s*[^.]*\.)\s*(.*)$", t) or re.match(r"^([A-Z][A-Z \-/']{3,}:)\s*(.*)$", t) \
        or re.match(r"^(\d\.\s[^.]*\.)\s*(.*)$", t)
    return (m.group(1), m.group(2)) if m else (t, "")

def chart(s):
    board, on = [], False
    for st in s["steps"]:
        for b in st["blocks"]:
            if b["k"] != "p": on = False; continue
            if BOARD_START.match(b["t"]): on = True; continue
            if on and BOARD_ITEM.match(b["t"]): board.append(split_item(b["t"])); continue
            on = False
    n = s["n"]; p, rom, nm = C.PH[n]
    pr = [b["label"] for st in s["steps"] for b in st["blocks"] if b["k"] == "practice"]
    return {"n": n, "p": p, "phase": "Phase %s · %s" % (rom, nm), "title": C.title_case(s.get("anchor_title") or s["title"]),
            "session": s["title"], "words": s["meta"].get("Key Vocabulary", ""), "lines": sentences(s.get("anchor") or []),
            "board": [{"l": a, "r": b} for a, b in board], "practice": C.title_case(pr[0]) if pr else ""}

def main(path):
    D = C.load(path)
    charts = [chart(s) for s in D["sessions"]]
    opts = ""
    for c in charts:
        n = c["n"]
        if n in (1, 4, 7, 11): opts += ("</optgroup>" if n > 1 else "") + '<optgroup label="%s">' % C.E(c["phase"])
        opts += '<option value="%d">%d · %s</option>' % (n, n, C.E(c["title"]))
    opts += "</optgroup>"
    data = json.dumps(charts, ensure_ascii=False).replace("</", "<\\/")
    tpl = io.open(os.path.join(HERE, "charts_shell.html"), encoding="utf-8").read()
    fp = io.open(os.path.join(HERE, "head_firstpaint.txt"), encoding="utf-8").read().rstrip("\n")
    out = tpl.replace("@@FIRSTPAINT@@", fp).replace("@@OPTIONS@@", opts).replace("@@DATA@@", data)
    io.open(os.path.join(ROOT, "aog-deploy", "adult-charts.html"), "w", encoding="utf-8").write(out)
    print("built adult-charts.html", len(out), "bytes;", sum(len(c["lines"]) for c in charts), "lines,", sum(len(c["board"]) for c in charts), "board items")

if __name__ == "__main__":
    main(sys.argv[1])
