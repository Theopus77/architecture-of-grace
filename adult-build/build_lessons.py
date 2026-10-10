# -*- coding: utf-8 -*-
"""build_lessons.py — adult-lessons.html (/adult/lessons), the twelve lessons one at a time (AOG-ADULT-LESSONS-V1).

    python3 adult-build/build_lessons.py /path/to/book6.json

Jimmy (2026-10-10): "I dont see any interactive anchor charts or lesson pages on the Adult SEL." The rooms each
have a lessons page that teaches one lesson at a time; this is the Adult Edition's. Each lesson is the session,
verbatim (build_curriculum.session_html: the lesson scripts, the steps, the checks, the practice), under its
phase's pencil drawing, with "I taught this" kept on the device and links to the participant page and the chart.
"""
import io, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import build_curriculum as C

PIC = {1: ("page-pd-adult-sel", "Pencil drawing: a stone base with four pillars"),
       2: ("page-pd-trauma", "Pencil drawing: a window beside a sprouting plant"),
       3: ("page-pd-pathway", "Pencil drawing: stepping stones leading to a small plant"),
       4: ("page-pd-culture", "Pencil drawing: chairs in a circle around a young plant")}

def lesson_html(s):
    n = s["n"]; p, rom, nm = C.PH[n]
    pic, alt = PIC[p]
    body = C.session_html(s)
    body = body.replace('<section class="sess p%d" id="s%d" data-n="%d">' % (p, n, n), "", 1)
    body = re.sub(r'<header class="shd">.*?</header>', "", body, count=1, flags=re.S)
    body = body[: body.rfind("</section>")]
    hero = ('<figure class="hero p%d"><picture><source type="image/webp" srcset="/img/banners/%s-pencil-900.webp 900w, /img/banners/%s-pencil-1600.webp 1600w" sizes="(min-width:900px) 900px, 100vw">'
            '<img src="/img/banners/%s-pencil-900.jpg" width="1600" height="560" alt="" decoding="async" loading="%s"></picture>'
            '<figcaption class="hcap"><span class="hk">Lesson %d · Phase %s · %s</span><span class="ht">%s</span><span class="hc">%s</span></figcaption>'
            '<span class="halt">%s</span></figure>') % (p, pic, pic, pic, "eager" if n == 1 else "lazy", n, rom, nm, C.E(s["title"]), C.care(s.get("flagline")), C.E(alt))
    foot = ('<div class="lfoot no-print"><button type="button" class="btn taught" data-taught="%d" aria-pressed="false">I taught this lesson</button>'
            '<a class="btn" href="/adult/workbook?s=%d">The participant page →</a><a class="btn" href="/adult/charts#s%d">The anchor chart →</a></div>') % (n, n, n)
    return '<article class="lesson sess p%d" id="s%d" data-n="%d" hidden>%s%s%s</article>' % (p, n, n, hero, body, foot)

def main(path):
    D = C.load(path)
    opts = ""
    for s in D["sessions"]:
        n = s["n"]
        if n in (1, 4, 7, 11): opts += ("</optgroup>" if n > 1 else "") + '<optgroup label="Phase %s · %s">' % (C.PH[n][1], C.PH[n][2])
        opts += '<option value="%d">Lesson %d · %s</option>' % (n, n, C.E(s["title"]))
    opts += "</optgroup>"
    cur_tpl = io.open(os.path.join(HERE, "curriculum_shell.html"), encoding="utf-8").read()
    css = re.search(r"<style>(.*?)</style>", cur_tpl, re.S).group(1)
    tpl = io.open(os.path.join(HERE, "lessons_shell.html"), encoding="utf-8").read()
    fp = io.open(os.path.join(HERE, "head_firstpaint.txt"), encoding="utf-8").read().rstrip("\n")
    out = (tpl.replace("@@FIRSTPAINT@@", fp).replace("@@SESSIONCSS@@", css).replace("@@OPTIONS@@", opts)
              .replace("@@LESSONS@@", "\n".join(lesson_html(s) for s in D["sessions"]))
              .replace("@@CLOSING@@", C.E(D["extra"].get("closing_exit") or "")))
    io.open(os.path.join(ROOT, "aog-deploy", "adult-lessons.html"), "w", encoding="utf-8").write(out)
    print("built adult-lessons.html", len(out), "bytes")

if __name__ == "__main__":
    main(sys.argv[1])
