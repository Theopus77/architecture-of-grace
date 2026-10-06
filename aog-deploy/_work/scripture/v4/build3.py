# AOG-SCRIPTURE-V4: four themes in English (KJV) and Spanish (Reina-Valera 1909), and the Lord's Prayer from Luke 11.
import json, re, subprocess, os, numpy as np
from find import wav
from refine import rms, runs
import en2, es2texts
SR=44100
EN={k:json.load(open(f"r2/m_{k}.json")) for k in [v[0] for v in en2.V] if os.path.exists(f"r2/m_{k}.json")}
ES=json.load(open("r2/es_pos.json"))
def syl(s): return len(re.findall(r"[aeiouyáéíóú]+", s.lower()))
def pos(vid, lang):
    if lang=="en": r=EN[vid]; return r["file"], r["rstart"], r["rend"], r["text"]
    r=ES[vid]; return r["file"], r["start"], r["end"], es2texts.T[vid]
def cut_at(f, s, e, frac, win=0.9):
    r=rms(wav(f)); a,b=int(s*100),int(e*100); seg=r[a:b]; pk=np.percentile(seg,95); want=frac*(b-a)
    rr=[(x,y) for x,y in runs(seg<pk-28) if y-x>=12 and 0.12*len(seg)<(x+y)/2<0.9*len(seg)]
    if rr:
        x,y=min(rr,key=lambda q:abs((q[0]+q[1])/2-want))
        if abs((x+y)/2-want)<win*100: return s+(x+y)/200
    w0=max(0,int(want)-25); w1=min(len(seg),int(want)+25); return s+(w0+int(np.argmin(seg[w0:w1])))/100
def snap(f,t,w=0.15):
    r=rms(wav(f)); c=int(t*100); k=int(w*100); return (c-k+int(np.argmin(r[c-k:c+k+1])))/100
def load(f,s,e):
    p=subprocess.run(["ffmpeg","-v","error","-ss",f"{s:.3f}","-t",f"{e-s:.3f}","-i",f,"-af","highpass=f=70","-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True)
    return np.frombuffer(p.stdout,np.float32).copy()
def level(a):
    n=int(0.01*SR); a[:n]*=np.linspace(0,1,n); m=int(0.05*SR); a[-m:]*=np.linspace(1,0,m)
    fr=a[:len(a)//441*441].reshape(-1,441); r=np.sqrt((fr**2).mean(1)); act=r[r>r.max()*0.1]
    return a*min(10**(-20/20)/np.sqrt((act**2).mean()), 10**(-1.5/20)/np.abs(a).max())
def verses_record(lang, items):
    out=[np.zeros(int(0.35*SR),np.float32)]; t=0.35; ph=[]; vs=[]
    for vid,ref,ref_es,mark,l1,l2 in items:
        f,s,e,txt=pos(vid,lang); i=txt.find(mark); assert i>0,(vid,mark)
        for l in (l1,l2): assert l.lower().replace("’","'") in txt.lower().replace("’","'"), (vid,l)
        c=snap(f,CUT[(vid,lang)],0.08) if (vid,lang) in CUT else cut_at(f,s,e,syl(txt[:i])/syl(txt))
        a=level(load(f,s-0.04,e+0.10)); cut=c-s+0.04
        vs.append({"ref":ref,"ref_es":ref_es,"at":round(t,3),"text":txt})
        R=ref if lang=="en" else ref_es
        ph.append([round(t,3),round(cut,3),l1,R]); ph.append([round(t+cut,3),round(len(a)/SR-cut,3),l2,R])
        out.append(a); t+=len(a)/SR; out.append(np.zeros(int(0.9*SR),np.float32)); t+=0.9
    return np.concatenate(out), ph, vs
def lines_record(f, s, e, cuts, labels, cue_idx, refs, R):
    a=level(load(f,s-0.04,e+0.10)); lead=0.35; y=np.concatenate([np.zeros(int(lead*SR),np.float32),a,np.zeros(int(0.5*SR),np.float32)])
    off=lead-(s-0.04); edges=[s-0.04]+[snap(f,c) for c in cuts]+[e+0.10]
    ph=[[round(edges[i]+off,3),round(edges[i+1]-edges[i],3),labels[i],R] for i in range(len(labels))]
    vs=[{"ref":refs[k][0],"ref_es":refs[k][1],"at":ph[i][0],"text":labels[i]} for k,i in enumerate(cue_idx)]
    return y, ph, vs
def write(fn, y, title, artist="LibriVox volunteers"):
    out=f"out/{fn}.mp3"
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-c:a","libmp3lame","-b:a","64k","-id3v2_version","3",
        "-metadata",f"title={title}","-metadata",f"artist={artist}","-metadata","comment=Readings from LibriVox, public domain.",out],input=y.tobytes(),check=True)
    return os.path.getsize(out)
EOF=None
# cuts placed by hand from the pauses and word times (see README)
CUT={("ps46_10","en"):443.45,("ps100_1","en"):149.72,("eph6_15","en"):684.55,("ps46_10","es"):234.34}
