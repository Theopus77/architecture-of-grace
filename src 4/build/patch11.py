#!/usr/bin/env python3
SRC = "index_v10.html"
OUT = "index_v11.html"
with open(SRC, "r", encoding="utf-8") as fh:
    s = fh.read()

def replace_once(hay, old, new, label):
    n = hay.count(old)
    if n != 1:
        raise SystemExit(f"[FAIL] {label}: expected 1 match, found {n}")
    return hay.replace(old, new, 1)

BTN = ('      <button type="button" class="btn" style="margin-top:6px;" '
       'onclick="if(typeof openGuide===\'function\')openGuide();">'
       '<span data-i18n="fw_ed_cta">Open the Educator Guide &amp; Library</span> '
       '<span class="btn-arrow">&rarr;</span></button>')

def card(href, ic, tkey, t, skey, sub):
    return (
      f'          <a class="edu-sample-card" href="{href}" target="_blank" rel="noopener">\n'
      f'            <span class="es-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ic}</svg></span>\n'
      f'            <span class="es-t" data-i18n="{tkey}">{t}</span>\n'
      f'            <span class="es-s" data-i18n="{skey}">{sub}</span>\n'
      f'            <span class="es-go" data-i18n="edu_s_open">Open PDF ↗</span>\n'
      f'          </a>\n')

IC_ANCHOR = '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>'
IC_SCEN = '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
IC_WORK = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/>'
IC_DRAW = '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>'

BLOCK = (
  '\n      <!-- "Inside a lesson" — real free samplers, surfaced on the Educator landing -->\n'
  '      <div class="edu-sample">\n'
  '        <div class="es-ey" data-i18n="edu_s_ey">See it first · Free</div>\n'
  '        <h3 data-i18n="edu_s_h">Inside a lesson</h3>\n'
  '        <p class="es-lead" data-i18n="edu_s_lead">Every lesson ships as a small package — anchor charts, scenario cards, worksheets, and drawing activities. Open any sampler below; no code, no sign-up.</p>\n'
  '        <div class="edu-sample-grid">\n'
  + card('files/AoG-Anchor-Charts-Preview.pdf', IC_ANCHOR, 'edu_s_anchor_t', 'Anchor Charts', 'edu_s_anchor_s', 'The visual that anchors the lesson')
  + card('files/AoG-Scenario-Cards-K12-Sampler.pdf', IC_SCEN, 'edu_s_scenario_t', 'Scenario Cards', 'edu_s_scenario_s', 'Real moments to talk through')
  + card('files/AoG-Worksheets-K12-Sampler.pdf', IC_WORK, 'edu_s_worksheet_t', 'Worksheets', 'edu_s_worksheet_s', 'Reflect, practice, apply')
  + card('files/AoG-Drawing-Activities-K2-Sampler.pdf', IC_DRAW, 'edu_s_drawing_t', 'Drawing Activities', 'edu_s_drawing_s', 'Make the idea their own')
  + '        </div>\n'
  '        <a class="edu-sample-cta" href="files/AoG-Sample-Lesson-Book-1.pdf" target="_blank" rel="noopener" data-i18n="edu_s_cta">Open a full free sample lesson · PDF →</a>\n'
  '      </div>')

s = replace_once(s, BTN, BTN + BLOCK, "educator sample package")

with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(s)
print("[OK] wrote", OUT)
