#!/usr/bin/env python3
"""Build novels/<key>.json from Jimmy's manuscripts (.docx), word for word,
with the italics the PDFs could not give us. Same JSON the PDF extractor
made (extract_novels.py), so aog-novel.js needs no change:

  sections: [{kind: note|part|chapter, kicker, title, blocks:[{k, t, h}]}]
    k = p (paragraph) | c (centred line) | i (a whole line in italics)
      | q (the part's question) | sig (a right-aligned signature) | break
    t = the plain words (read aloud)      h = the same with <em> for italics

Run from aog-deploy/:  python3 _work/sel/novels/extract_docx.py <folder with the .docx files>"""
import json, re, sys, os, glob, html
import docx
from docx.enum.text import WD_ALIGN_PARAGRAPH as A

BOOKS = [
  ("room-12",  "Book_1", "Room 12",  "The Year We Met Sammy",         "Book 1 · Grades K–2",  "/files/AoG-Book1-Room12-DIGITAL.pdf"),
  ("room-18",  "Book_2", "Room 18",  "The Year of the Inner Critic",  "Book 2 · Grades 3–5",  "/files/AoG-Book2-Room18-DIGITAL.pdf"),
  ("room-36",  "Book_3", "Room 36",  "The Year of Two Voices",        "Book 3 · Grades 6–8",  "/files/AoG-Book3-Room36-DIGITAL.pdf"),
  ("room-104", "Book_4", "Room 104", "The Year We Looked Up",         "Book 4 · Grades 9–10", "/files/AoG-Book4-Room104-DIGITAL.pdf"),
  ("room-207", "Book_5", "Room 207", "The Year We Walked Out",        "Book 5 · Grades 11–12","/files/AoG-Book5-Room207-DIGITAL.pdf"),
  ("the-dwelling", "Book6", "The Dwelling", "The Years We Kept Coming Back", "Book 6 · Adults", "/files/AoG_Book6_The_Dwelling_DIGITAL.pdf"),
]
ORN = {"◆ ◆ ◆", "◆", "———", "—", "○", "◦", "* * *"}

def runs_html(p):
    """the paragraph's words, italics kept as <em>"""
    out = []; cur_it = None
    for r in p.runs:
        t = r.text
        if not t: continue
        it = bool(r.italic) or (r.font and r.font.italic)
        if it != cur_it:
            if cur_it: out.append("</em>")
            if it: out.append("<em>")
            cur_it = it
        out.append(html.escape(t, quote=False))
    if cur_it: out.append("</em>")
    s = "".join(out)
    s = re.sub(r"</em>(\s*)<em>", r"\1", s)               # neighbouring italic runs become one
    return s.strip()

def whole_italic(p):
    rs = [r for r in p.runs if r.text.strip()]
    return bool(rs) and all(bool(r.italic) or (r.font and r.font.italic) for r in rs)

def paras(d):
    for p in d.paragraphs:
        if p.text.strip(): yield p

def build(key, f):
    d = docx.Document(f)
    ps = list(paras(d))
    dwelling = key == "the-dwelling"
    sections = []; cur = None; pending_kicker = ""
    started = False
    i = 0
    def style(p): return (p.style.name if p.style else "") or ""
    def centred(p): return p.paragraph_format.alignment == A.CENTER
    def add(kind, title, kicker=""):
        nonlocal cur
        cur = {"kind": kind, "title": title, "kicker": kicker, "blocks": []}; sections.append(cur)
    while i < len(ps):
        p = ps[i]; t = p.text.strip(); st = style(p)
        if not started:
            if (not dwelling and st == "Heading 2") or (dwelling and centred(p) and t == "A Note"):
                started = True
            else:
                i += 1; continue
        if not dwelling:
            if st == "Heading 1":                       # PART ONE (Book 5 puts the title in the heading and PART ONE just above it)
                if re.fullmatch(r"PART [A-Z]+", t.upper()):
                    kick = t.upper(); title = ps[i+1].text.strip(); i += 2
                else:
                    kick = ps[i-1].text.strip().upper() if re.fullmatch(r"PART [A-Z]+", ps[i-1].text.strip().upper()) else ""
                    title = t; i += 1
                    if cur and cur["blocks"] and cur["blocks"][-1].get("t", "").upper() == kick: cur["blocks"].pop()
                add("part", title, kick)
                # the question, an ornament, the tagline
                while i < len(ps) and style(ps[i]) not in ("Heading 1", "Heading 2") and not (centred(ps[i]) and whole_italic(ps[i]) and re.match(r"^Chapter ", ps[i].text.strip())):
                    q = ps[i]; qt = q.text.strip()
                    if qt in ORN: i += 1; continue
                    kind = "q" if not any(b["k"] == "q" for b in cur["blocks"]) else "c"
                    cur["blocks"].append({"k": kind, "t": qt, "h": runs_html(q)}); i += 1
                continue
            if st == "Heading 2":
                add("chapter" if pending_kicker else "note", t, pending_kicker); pending_kicker = ""; i += 1; continue
            if centred(p) and re.fullmatch(r"Chapter [A-Za-z-]+", t):
                pending_kicker = t.upper(); i += 1; continue
        else:
            if centred(p) and re.fullmatch(r"PART [A-Z]+", t):
                kick = t; i += 1
                while ps[i].text.strip() in ORN: i += 1
                add("part", ps[i].text.strip(), kick); i += 1
                while i < len(ps) and centred(ps[i]) and not re.fullmatch(r"CHAPTER [A-Z-]+", ps[i].text.strip()):
                    q = ps[i]; qt = q.text.strip(); i += 1
                    if qt in ORN: continue
                    kind = "q" if not any(b["k"] == "q" for b in cur["blocks"]) else "c"
                    cur["blocks"].append({"k": kind, "t": qt, "h": runs_html(q)})
                continue
            if centred(p) and re.fullmatch(r"CHAPTER [A-Z-]+", t):
                kick = t; i += 1
                add("chapter", ps[i].text.strip(), kick); i += 1; continue
            if centred(p) and t in ("A Note", "Closing Words") and (cur is None or cur["title"] != t):
                add("note", t); i += 1; continue
        if cur is None: i += 1; continue
        # body
        if t in ORN:
            if cur["blocks"] and cur["blocks"][-1]["k"] != "break": cur["blocks"].append({"k": "break"})
            i += 1; continue
        al = p.paragraph_format.alignment
        if al == A.RIGHT: k = "sig"
        elif centred(p): k = "c"
        elif whole_italic(p): k = "i"
        else: k = "p"
        cur["blocks"].append({"k": k, "t": re.sub(r"\s+", " ", t), "h": re.sub(r"\s+", " ", runs_html(p))})
        i += 1
    # an ornament right after a heading is decoration, not a scene break
    for s in sections:
        while s["blocks"] and s["blocks"][0]["k"] == "break": s["blocks"].pop(0)
        while s["blocks"] and s["blocks"][-1]["k"] == "break": s["blocks"].pop()
    return sections

def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else "."
    for key, tag, room, title, band, pdf in BOOKS:
        fs = [f for f in glob.glob(os.path.join(folder, "*.docx")) if tag in os.path.basename(f)]
        if not fs: print("no manuscript for", key); continue
        secs = build(key, fs[0])
        n = sum(1 for s in secs if s["kind"] == "chapter")
        words = sum(len(b["t"].split()) for s in secs for b in s["blocks"] if "t" in b)
        ital = sum(b["h"].count("<em>") for s in secs for b in s["blocks"] if "h" in b)
        data = {"key": key, "room": room, "title": title, "band": band, "author": "James Anthony Ramsden", "pdf": pdf, "sections": secs}
        json.dump(data, open(f"novels/{key}.json", "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
        print(f"{key:14} {len(secs):3} sections, {n:2} chapters, {words:6} words, {ital:4} italic runs")

if __name__ == "__main__": main()
