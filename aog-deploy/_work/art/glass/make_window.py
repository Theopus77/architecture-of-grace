#!/usr/bin/env python3
"""AOG-SKETCH-GLASS-V1 (2026-09-27) — Jimmy: "Get rid of the rose on the main pages; combine a sketch
idea with the stained glass material for data points for students."
Writes the home hero's pencil-sketched window (an inline SVG: graphite tracery over washes of jewel
glass, still, decorative) and the "Your window" row of six glass panes that show a student's own
progress, counted on this device only. Replaces <picture id="aogHeroRose"> in index.html. Idempotent.
Run from aog-deploy/:  python3 _work/art/glass/make_window.py"""
import math, re, random
random.seed(7)
C, R = 330, 300
GLASS = ["#2F63B8", "#B8457A", "#2E8B57", "#B87A12", "#7B4FA0", "#1F8080", "#A8323E", "#3F4AA6"]
def P(a, r): return (C + r * math.cos(a), C + r * math.sin(a))
def f(x): return "%.1f" % x
def sketch(d, w=2.0, op=.9):
    # a pencil line: drawn twice, the second pass a hair off, like a hand going over it again
    return ('<path d="%s" fill="none" stroke="#E9E3D3" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round" opacity="%s"/>'
            '<path d="%s" fill="none" stroke="#E9E3D3" stroke-width="%.1f" stroke-linecap="round" opacity="%.2f" transform="translate(%.1f %.1f) rotate(%.2f %d %d)"/>'
            % (d, w, op, d, w * .55, op * .55, random.uniform(-1.4, 1.4), random.uniform(-1.4, 1.4), random.uniform(-.5, .5), C, C))
def circ(r): return "M%s %s a%s %s 0 1 0 %s 0 a%s %s 0 1 0 %s 0" % (f(C - r), f(C), f(r), f(r), f(2 * r), f(r), f(r), f(-2 * r))
panes, lines = [], []
N = 12
# glass: the centre, twelve petals, twelve roundels
panes.append('<circle cx="%d" cy="%d" r="78" fill="#B87A12"/>' % (C, C))
for i in range(N):
    a0, a1 = 2 * math.pi * i / N, 2 * math.pi * (i + 1) / N
    am = (a0 + a1) / 2
    x0, y0 = P(a0, 84); x1, y1 = P(a1, 84); xo, yo = P(am, 214); c0 = P(a0 + .06, 190); c1 = P(a1 - .06, 190)
    d = "M%s %s Q%s %s %s %s Q%s %s %s %s Z" % (f(x0), f(y0), f(c0[0]), f(c0[1]), f(xo), f(yo), f(c1[0]), f(c1[1]), f(x1), f(y1))
    panes.append('<path d="%s" fill="%s"/>' % (d, GLASS[i % len(GLASS)]))
    lines.append(sketch(d, 2.4))
    rx, ry = P(am + math.pi / N, 250)
    panes.append('<circle cx="%s" cy="%s" r="34" fill="%s"/>' % (f(rx), f(ry), GLASS[(i + 3) % len(GLASS)]))
    lines.append(sketch(circ(34).replace("M%s %s" % (f(C - 34), f(C)), "M%s %s" % (f(rx - 34), f(ry))), 2.0))
for r in (R, 286, 84, 78):
    lines.append(sketch(circ(r), 2.6 if r == R else 1.6))
# hatching: soft pencil shading over the glass, one direction, like a quick study
hatch = ('<pattern id="sgHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">'
         '<line x1="0" y1="0" x2="0" y2="7" stroke="#0A1E33" stroke-width="2.2" opacity=".35"/></pattern>')
svg = ('<svg id="aogHeroRose" class="aog-fade aog-sketch-window" viewBox="0 0 660 660" aria-hidden="true" focusable="false" role="presentation">'
       '<defs>%s<filter id="sgWobble"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/>'
       '<feDisplacementMap in="SourceGraphic" scale="4"/></filter></defs>'
       '<g opacity=".78">%s</g><circle cx="%d" cy="%d" r="%d" fill="url(#sgHatch)"/>'
       '<g filter="url(#sgWobble)">%s</g></svg>') % (hatch, "".join(panes), C, C, R, "".join(lines))

PANES = [  # id, English, Spanish, glass
 ("les", "Lessons done", "Lecciones hechas", "#1F4E8C"),
 ("unit", "Units started", "Unidades empezadas", "#1F6B4A"),
 ("right", "Checks right", "Respuestas correctas", "#8A2A3A"),
 ("course", "Courses explored", "Cursos explorados", "#6A4A12"),
 ("streak", "Daily Drafts streak", "Racha de Daily Drafts", "#4A2F7A"),
 ("write", "Pieces of writing", "Escritos", "#1F6363"),
]
cells = "".join(
 '<li class="sg-pane" style="--g:%s"><b id="sgv-%s">0</b><span data-en="%s" data-es="%s">%s</span></li>' % (g, k, en, es, en)
 for k, en, es, g in PANES)
row = ('<section id="aogYourWindow" class="aog-fade" aria-labelledby="sgTitle">'
  '<h2 id="sgTitle" data-en="Your window" data-es="Tu ventana">Your window</h2>'
  '<ul class="sg-panes">%s</ul>'
  '<p class="sg-note" data-en="Each pane fills in as you learn. It is counted on this device only and never sent anywhere." '
  'data-es="Cada panel se llena mientras aprendes. Se cuenta solo en este aparato y nunca se envía a ningún lugar.">'
  'Each pane fills in as you learn. It is counted on this device only and never sent anywhere.</p></section>') % cells
css = '''<style id="aog-sketch-glass">
/* AOG-SKETCH-GLASS-V1 (2026-09-27) — the rose is gone: a pencil-sketched window of jewel glass sits
   behind the name, and "Your window" shows a student's own progress in six glass panes. Still. */
@media screen{
  #aogHeroRose.aog-sketch-window{height:auto;aspect-ratio:1}
  #aogYourWindow{position:relative;z-index:1;max-width:760px;margin:26px auto 0;padding:0 16px;text-align:center}
  #aogYourWindow h2{font:600 15px/1.2 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#F2C964;margin:0 0 12px}
  .sg-panes{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
  .sg-pane{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;min-height:112px;padding:26px 8px 12px;
    color:#F7F2E6;background:linear-gradient(180deg,rgba(255,255,255,.10),rgba(0,0,0,.18)),repeating-linear-gradient(38deg,rgba(10,30,51,.22) 0 2px,transparent 2px 7px),var(--g);
    border:2px solid #E9E3D3;border-radius:52px 52px 8px 8px;box-shadow:0 10px 24px -14px rgba(0,0,0,.8)}
  .sg-pane::before{content:"";position:absolute;inset:-4px -3px -3px -4px;border:1.2px solid rgba(233,227,211,.55);border-radius:inherit;transform:rotate(-.8deg);pointer-events:none}
  .sg-pane b{font:700 30px/1 Fraunces,Georgia,serif;color:#FFFFFF}
  .sg-pane span{font:600 13px/1.25 system-ui,sans-serif;color:#F7F2E6}
  .sg-note{font-size:14px;line-height:1.45;color:#E9E3D3;margin:12px auto 0;max-width:46ch}
  @media (max-width:720px){ .sg-panes{grid-template-columns:repeat(3,1fr);gap:10px} .sg-pane{min-height:100px} }
}
@media print{ #aogYourWindow{display:none} }
</style>'''
js = '''<script id="aog-sketch-glass-js">
/* AOG-SKETCH-GLASS-V1 — count what this device already keeps; read only, nothing is written or sent. */
(function(){
  function run(){
    var les=0, unit=0, right=0, write=0, courses={}, streak=0;
    try{
      for(var i=0;i<localStorage.length;i++){
        var k=localStorage.key(i), m=/^aog\\.interior\\.ws\\.v1\\.([a-z]+)(\\d+)$/.exec(k||"");
        if(!m) continue;
        var d={}; try{ d=JSON.parse(localStorage.getItem(k))||{}; }catch(e){}
        var l=0, q=0, x;
        for(x in (d.les||{})) if(d.les[x]) l++;
        for(x in (d.q||{})) if(d.q[x] && d.q[x].done && d.q[x].first===true) q++; else if(d.q[x] && d.q[x].done) q++;
        if(l||q||d.write){ unit++; courses[m[1]]=1; }
        les+=l; right+=q; if(d.write && String(d.write).trim()) write++;
      }
      var last=localStorage.getItem("aog.drops.last")||"", s=+(localStorage.getItem("aog.drops.streak")||0);
      var day=864e5, t=new Date(); t.setHours(0,0,0,0);
      if(last){ var ld=new Date(last+"T00:00:00"); if(t-ld<=day) streak=s; }
      if(localStorage.getItem("aog.drops.write")) write++;
    }catch(e){}
    var v={les:les,unit:unit,right:right,course:Object.keys(courses).length,streak:streak,write:write};
    for(var id in v){ var el=document.getElementById("sgv-"+id); if(el) el.textContent=v[id]; }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",run); else run();
})();
</script>'''
p = "index.html"; s = open(p, encoding="utf-8").read()
s = re.sub(r'<picture id="aogHeroRose".*?</picture>|<svg id="aogHeroRose".*?</svg>', lambda m: svg, s, count=1, flags=re.S)
s = re.sub(r'<section id="aogYourWindow".*?</section>', "", s, flags=re.S)
s = re.sub(r'<style id="aog-sketch-glass">.*?</style>\n?', "", s, flags=re.S)
s = re.sub(r'<script id="aog-sketch-glass-js">.*?</script>\n?', "", s, flags=re.S)
i = s.index('class="ofh-lede"'); j = s.index("\n", i)
s = s[:j + 1] + row + "\n" + s[j + 1:]
s = s.replace("</head>", css + "\n" + js + "\n</head>", 1)
open(p, "w", encoding="utf-8").write(s)
print("sketched window and Your window written")
