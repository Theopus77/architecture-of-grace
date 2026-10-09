# AOG-VOICES-V1 (2026-10-09): famous voices beyond the Bible and the presidents, read by LibriVox volunteers (public domain).
# Jimmy: "Removing ourselves from the biblical and presidential speeches, what other famous speeches / voices can we
# gather onto the vinyl" — then "Everything except NASA". Run from the scratch folder that holds fv/ (see README.md).
import sys, json, os, subprocess, numpy as np
sys.path.insert(0,"/tmp/claude-0/sc")
from build3 import load, level, snap, SR
def record(A, pads, gap=0.55):
    out=[np.zeros(int(0.35*SR),np.float32)]; t=0.35; ph=[]
    for f,s,e,label,ref in pads:
        s2,e2=snap(A+f,s,0.12),snap(A+f,e,0.12)
        a=level(load(A+f,s2-0.03,e2+0.06))
        ph.append([round(t,3),round(len(a)/SR,3),label,ref]); out.append(a); t+=len(a)/SR
        out.append(np.zeros(int(gap*SR),np.float32)); t+=gap
    return np.concatenate(out), ph
def write(fn, y, title):
    out=f"out/{fn}.mp3"
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-c:a","libmp3lame","-b:a","64k","-id3v2_version","3",
        "-metadata",f"title={title}","-metadata","artist=LibriVox volunteers","-metadata","comment=Readings from LibriVox, public domain.",out],input=y.tobytes(),check=True)
    return os.path.getsize(out)
meta=[]
def make(A, fn, pads, cue, title, title_es, version, style, style_es, line, line_es, ref_es={}):
    y,ph=record(A, pads)
    size=write(fn,y,title)
    meta.append({"file":fn+".mp3","title":title,"title_es":title_es,"bpm":0,"kind":"speech","version":version,
      "style":style,"style_es":style_es,"bars":0,"seconds":round(len(y)/SR,1),"bytes":size,"line":line,"line_es":line_es,
      "verses":[{"ref":pads[i][4],"ref_es":ref_es.get(pads[i][4],pads[i][4]),"at":ph[i][0],"text":ph[i][2]} for i in cue],"phrases":ph})
    print(fn, round(len(y)/SR,1), "s", [(p[2],round(p[1],1)) for p in ph])
here=os.path.dirname(os.path.abspath(__file__))
for part in ["speeches.py","poems.py","shakespeare.py","spanish.py"]:
    p=os.path.join(here,part)
    if os.path.exists(p): exec(open(p).read())
json.dump(meta,open("out/voices.json","w"),indent=1,ensure_ascii=False)
