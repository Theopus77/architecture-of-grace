#!/usr/bin/env python3
"""Pull each novel out of its PDF, word for word, into novels/<key>.json for
aog-novel.js. Nothing is rewritten: lines are joined back into the paragraphs
the PDF broke them from, page numbers and the invisible TOC anchors are dropped,
and that is all. Run from aog-deploy/:  python3 _work/sel/novels/extract_novels.py"""
import json, re, sys, os
import pymupdf

BOOKS = [
  ("room-12",  "files/AoG-Book1-Room12-DIGITAL.pdf",  "Room 12",  "The Year We Met Sammy",          "Book 1 · Grades K–2"),
  ("room-18",  "files/AoG-Book2-Room18-DIGITAL.pdf",  "Room 18",  "The Year of the Inner Critic",   "Book 2 · Grades 3–5"),
  ("room-36",  "files/AoG-Book3-Room36-DIGITAL.pdf",  "Room 36",  "The Year of Two Voices",         "Book 3 · Grades 6–8"),
  ("room-104", "files/AoG-Book4-Room104-DIGITAL.pdf", "Room 104", "The Year We Looked Up",          "Book 4 · Grades 9–10"),
  ("room-207", "files/AoG-Book5-Room207-DIGITAL.pdf", "Room 207", "The Year We Walked Out",         "Book 5 · Grades 11–12"),
  ("the-dwelling", "files/AoG_Book6_The_Dwelling_DIGITAL.pdf", "The Dwelling", "The Years We Kept Coming Back", "Book 6 · Adults"),
]

def lines_of(page):
    out = []
    for b in page.get_text("rawdict")["blocks"]:
        if b["type"] != 0: continue
        for l in b["lines"]:
            chars = [c for s in l["spans"] for c in s["chars"]]
            t = ""
            for i, c in enumerate(chars):
                if i and c["c"] != " " and chars[i-1]["c"] != " ":
                    gap = c["bbox"][0] - chars[i-1]["bbox"][2]
                    if gap > 0.09 * l["spans"][0]["size"]: t += " "     # a word gap the PDF squeezed below a space
                t += c["c"]
            if not t.strip(): continue
            sz = max(s["size"] for s in l["spans"])
            out.append({"t": t, "x": l["bbox"][0], "y": l["bbox"][1], "x1": l["bbox"][2], "sz": round(sz, 1),
                        "italic": all(("Italic" in s["font"] or (s["flags"] & 2)) for s in l["spans"])})
    out.sort(key=lambda r: (round(r["y"]), r["x"]))
    return out

def join(par):
    """glue the wrapped lines of one paragraph back together"""
    s = ""
    for t in par:
        t = t.strip()
        if not s: s = t; continue
        if s.endswith("-") and not s.endswith(" -"):
            a = s.split()[-1][:-1]; b = re.split(r"[^A-Za-z]", t)[0]
            whole = (a + b).lower()
            if a and b and whole in VOCAB and (a.lower() + "-" + b.lower()) not in VOCAB: s = s[:-1] + t   # "as-" + "signs" was one word
            else: s += t                                                                                  # "third-" + "grader" keeps its hyphen
        else: s += " " + t
    return re.sub(r"\s+", " ", s).strip()

VOCAB = set()
def learn(pdf):
    for pg in pymupdf.open(pdf):
        for w in re.findall(r"[A-Za-z][A-Za-z'’-]*", pg.get_text("text")): VOCAB.add(w.lower())

def extract(key, pdf):
    d = pymupdf.open(pdf)
    W = d[0].rect.width
    dwelling = key == "the-dwelling"
    BODY = 12.0 if dwelling else 11.0
    CH = 20.9 if dwelling else 23.0
    PART = 25.9 if dwelling else 27.0
    NOTE = 21.9 if dwelling else 21.0
    left = None      # the body's left margin, measured
    # measure the two body x-starts (flush and indented)
    from collections import Counter
    xs = Counter()
    for pg in d:
        for r in lines_of(pg):
            if abs(r["sz"] - BODY) < .3: xs[round(r["x"])] += 1
    flush, indent = sorted([x for x, _ in xs.most_common(2)])
    chapters = []   # {kind: note|part|chapter, title, kicker, blocks:[...]}
    cur = None
    par = []; par_kind = "p"
    def flush_par():
        nonlocal par
        if par and cur is not None:
            cur["blocks"].append({"k": par_kind, "t": join(par)})
        par = []
    started = False
    pending_kicker = ""
    prev = None      # the last body line seen, to tell a real paragraph break from a typesetter's indent
    for pn, pg in enumerate(d):
        if pn < 2: continue                      # cover + copyright
        rows = lines_of(pg)
        # skip the contents pages: every row until the first NOTE-sized heading
        for r in rows:
            t = r["t"].strip(); sz = r["sz"]
            if re.fullmatch(r"\d+", t) and abs(r["x"] - W/2) < 20: continue   # page number
            if sz <= 3: continue                                               # ⟦TOC⟧ anchors
            if "⟦" in t or "⟧" in t: continue
            if not started:
                if abs(sz - NOTE) < .3: started = True
                else: continue
            if abs(sz - NOTE) < .3:
                flush_par(); cur = {"kind": "note", "title": t, "kicker": "", "blocks": []}; chapters.append(cur); continue
            if abs(sz - PART) < .3:
                if cur and cur["kind"] == "part" and not cur["blocks"] and cur.get("_open"):
                    cur["title"] = join([cur["title"], t]); continue
                flush_par(); cur = {"kind": "part", "title": t, "kicker": pending_kicker, "blocks": [], "_open": True}; chapters.append(cur); pending_kicker = ""; continue
            if abs(sz - CH) < .3:
                if cur and cur["kind"] == "chapter" and not cur["blocks"] and cur.get("_open"):
                    cur["title"] = join([cur["title"], t]); continue
                flush_par(); cur = {"kind": "chapter", "title": t, "kicker": pending_kicker, "blocks": [], "_open": True}; chapters.append(cur); pending_kicker = ""; continue
            # small-caps kickers: "P A R T  O N E", "C H A P T E R  T W O" — spaced capitals above the heading they name
            squeezed = re.sub(r"\s+", "", t)
            if re.fullmatch(r"(?:PART|CHAPTER)[A-Z-]*", squeezed) and sz < CH and len(t) <= 48:
                pending_kicker = re.sub(r"^(PART|CHAPTER)", r"\1 ", squeezed); continue
            if t == "◦" and cur is None: continue
            if cur is None: continue
            if cur["kind"] == "part" and (abs(sz - 15) < .3 or abs(sz - 14.3) < .3):
                # the part's question, one or two centred lines
                if cur["blocks"] and cur["blocks"][-1]["k"] == "q": cur["blocks"][-1]["t"] = join([cur["blocks"][-1]["t"], t])
                else: cur["blocks"].append({"k": "q", "t": t})
                continue
            cur["_open"] = False
            if set(t) <= set("◆◦*• "):
                flush_par(); cur["blocks"].append({"k": "break"}); continue
            # a fresh paragraph starts at the indent, or after a break/heading; centred lines stand alone
            centred = abs((r["x"] + r["x1"]) / 2 - W/2) < 6 and r["x"] > flush + 20
            if centred:
                flush_par(); par_kind = "c"; par = [t]; flush_par(); par_kind = "p"; continue
            # Book 5's typesetter sometimes indents the middle of a sentence ("It was" / "nine years ago."):
            # a new paragraph needs the line before it to have ended one
            closed = (prev is None) or re.search(r"""[.!?:;"”’'…)\]]$""", prev["t"].strip()) or par_kind == "c"
            if round(r["x"]) >= indent - 2 and round(r["x"]) <= indent + 30 and (closed or not par):
                flush_par(); par_kind = "p"; par = [t]
            elif round(r["x"]) > indent + 30:
                flush_par(); par_kind = "c"; par = [t]
            else:
                if not par: par_kind = "p"
                par.append(t)
            prev = r
        # a page ends: the paragraph may continue on the next page, so no flush here
    flush_par()
    for c in chapters: c.pop("_open", None)
    return chapters

def main():
    os.makedirs("novels", exist_ok=True)
    for key, pdf, room, title, band in BOOKS: learn(pdf)
    for key, pdf, room, title, band in BOOKS:
        ch = extract(key, pdf)
        n = sum(1 for c in ch if c["kind"] == "chapter")
        words = sum(len(b["t"].split()) for c in ch for b in c["blocks"] if "t" in b)
        data = {"key": key, "room": room, "title": title, "band": band, "author": "James Anthony Ramsden",
                "pdf": "/" + pdf, "sections": ch}
        with open(f"novels/{key}.json", "w", encoding="utf8") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        print(f"{key:14} {len(ch):3} sections, {n:2} chapters, {words:6} words")

if __name__ == "__main__": main()
