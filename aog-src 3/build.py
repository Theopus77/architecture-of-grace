#!/usr/bin/env python3
import os, re, datetime, sys
HERE=os.path.dirname(os.path.abspath(__file__)); DIST=os.path.join(HERE,"dist")
def read(p):
    with open(os.path.join(HERE,p),encoding="utf-8") as f: return f.read()
def once(h,old,new,label):
    n=h.count(old)
    if n!=1: sys.exit(f"[FAIL] {label}: {n}")
    return h.replace(old,new,1)
def main():
    html=read("base.html")
    mcss=read("modules/mtss.css"); mjs=read("modules/mtss.js"); bcss=read("modules/bling.css"); bjs=read("modules/bling.js")
    pcss=read("modules/polish.css"); pjs=read("modules/polish.js")
    tcss=read("modules/tools.css"); tjs=read("modules/tools.js")
    AIDE=('<button class="btn btn-secondary btn-sm" onclick="if(typeof showScreen===\'function\'){showScreen(\'screen-teacher-tools\');}" style="border-color:var(--gold);color:var(--gold);">\U0001f9f0 Aide Tools</button>')
    BTN=(AIDE+'\n        <button class="btn btn-sm" type="button" onclick="if(window.aogOpenMTSS)aogOpenMTSS();" style="background:var(--gold);border-color:var(--gold);color:var(--navy);font-weight:800;display:inline-flex;align-items:center;gap:6px;"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>MTSS Report</button>')
    html=once(html,AIDE,BTN,"MTSS button")
    html=once(html,"</head>",'<style id="mtss-styles">\n'+mcss+'\n</style>\n<style id="aog-bling-styles">\n'+bcss+'\n</style>\n<style id="aog-polish-styles">\n'+pcss+'\n</style>\n<style id="aog-tools-styles">\n'+tcss+'\n</style>\n</head>',"styles")
    i=html.rfind("</body>")
    html=html[:i]+'<!-- MTSS REPORTS -->\n<script>\n'+mjs+'\n</script>\n<!-- AOG BLING -->\n<script>\n'+bjs+'\n</script>\n<!-- AOG POLISH -->\n<script>\n'+pjs+'\n</script>\n<!-- AOG TOOLS -->\n<script>\n'+tjs+'\n</script>\n'+html[i:]
    v=datetime.datetime.now().strftime("%Y.%m.%d.%H%M"); html=re.sub(r'20\d\d\.\d\d\.\d\d\.\d{4}',v,html)
    os.makedirs(DIST,exist_ok=True)
    open(os.path.join(DIST,"index.html"),"w",encoding="utf-8").write(html)
    open(os.path.join(DIST,"sw.js"),"w",encoding="utf-8").write(re.sub(r'20\d\d\.\d\d\.\d\d\.\d{4}',v,read("sw.js")))
    print("[OK] build",v)
if __name__=="__main__": main()
