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
    html=read("base.html"); css=read(os.path.join("modules","mtss.css")); js=read(os.path.join("modules","mtss.js"))
    AIDE=('<button class="btn btn-secondary btn-sm" onclick="if(typeof showScreen===\'function\'){showScreen(\'screen-teacher-tools\');}" style="border-color:var(--gold);color:var(--gold);">\U0001f9f0 Aide Tools</button>')
    BTN=(AIDE+'\n        <button class="btn btn-secondary btn-sm" type="button" onclick="if(window.aogOpenMTSS)aogOpenMTSS();" style="border-color:var(--navy);color:var(--navy);">MTSS Report</button>')
    html=once(html,AIDE,BTN,"MTSS button")
    html=once(html,"</head>",'<style id="mtss-styles">\n'+css+'\n</style>\n</head>',"MTSS css")
    i=html.rfind("</body>")
    html=html[:i]+'<!-- MTSS REPORTS -->\n<script>\n'+js+'\n</script>\n'+html[i:]
    v=datetime.datetime.now().strftime("%Y.%m.%d.%H%M")
    html=re.sub(r'20\d\d\.\d\d\.\d\d\.\d{4}',v,html)
    os.makedirs(DIST,exist_ok=True)
    open(os.path.join(DIST,"index.html"),"w",encoding="utf-8").write(html)
    open(os.path.join(DIST,"sw.js"),"w",encoding="utf-8").write(re.sub(r'20\d\d\.\d\d\.\d\d\.\d{4}',v,read("sw.js")))
    print("[OK] build",v)
if __name__=="__main__": main()
