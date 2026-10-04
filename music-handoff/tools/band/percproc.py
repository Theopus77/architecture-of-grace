# The Band's percussion, from VS Chamber Orchestra: Community Edition (CC0), made the way process2.py makes the others:
# mono, 32 kHz, MP3, the quiet before each note trimmed, each brought to one loudness, faded at the end.
#   timpani:      five drums. Held notes are the drum's rolls (soft and loud); short notes are single hits, which ring up
#                 to 3 s. Each drum's pitch (its principal tone, which the ear hears) is measured from the spectrum;
#                 the files carry the nearest note's number, and finalize2.py tunes each one
#   xylophone, glockenspiel, marimba: one strength; every note rings out (up to 3 s; the glockenspiel 5 s)
#   kit:          the unpitched pieces, soft and loud hits keeping their natural difference: bass drum, snare drum and
#                 its roll, suspended cymbal, triangle, tambourine
import os, sys, json, subprocess, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); RAW=os.path.join(HERE,"raw2perc"); OUT=os.path.join(HERE,"out2"); SR=32000
def load(p):
    x=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32).astype(np.float64)
    pk=np.max(np.abs(x)); i=int(np.argmax(np.abs(x)>pk*0.03)); return x[max(0,i-int(0.005*SR)):]
def loudest(x, w):
    n=int(w*SR)
    if len(x)<=n: return float(np.sqrt(np.mean(x*x)+1e-12))
    c=np.concatenate([[0.0],np.cumsum(x*x)]); return float(np.sqrt(np.max(c[n:]-c[:-n])/n+1e-12))
def ring_end(x, maxs, db=-50):
    fr=int(0.02*SR); n=min(len(x), int(maxs*SR))//fr
    env=np.array([np.sqrt(np.mean(x[i*fr:(i+1)*fr]**2)+1e-15) for i in range(n)])
    pk=env.max(); quiet=np.where(env<pk*10**(db/20))[0]; quiet=quiet[quiet>int(0.1/0.02)]
    return int(min(len(x), (quiet[0]+1)*fr if len(quiet) else n*fr))
def principal(x, a, b, lo=60, hi=330):
    """the drum's (1,1) mode: the low peak p with the strongest company at 1.5 p and 2 p"""
    seg=x[int(a*SR):int(b*SR)]; N=1<<18
    S=np.abs(np.fft.rfft(seg*np.hanning(len(seg)),N)); fr=np.arange(len(S))*SR/N
    idx=np.where((fr>lo)&(fr<hi))[0]; loc=[i for i in idx[1:-1] if S[i]>S[i-1] and S[i]>=S[i+1]]
    loc.sort(key=lambda i:-S[i]); loc=loc[:12]; top=S[loc[0]]; best=None
    for i in loc:
        p=fr[i]
        def near(r):
            w=(fr>p*r*0.96)&(fr<p*r*1.04); return float(S[w].max()) if w.any() else 0.0
        sc=S[i]/top+near(1.5)/top+0.6*near(2.0)/top
        if best is None or sc>best[0]: best=(sc,p)
    p=best[1]; w=(fr>p*0.985)&(fr<p*1.015); j=np.where(w)[0][np.argmax(S[w])]
    y0,y1,y2=np.log(S[j-1]),np.log(S[j]),np.log(S[j+1]); off=0.5*(y0-y2)/(y0-2*y1+y2)
    return (j+off)*SR/N
def write(x, inst, name, fo, br):
    fo=min(int(fo*SR),len(x)//3); x=x.copy(); x[-fo:]*=np.linspace(1,0,fo)**2; fi=int(0.002*SR); x[:fi]*=np.linspace(0,1,fi)
    d=os.path.join(OUT,inst); os.makedirs(d,exist_ok=True)
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-codec:a","libmp3lame","-b:a",br,os.path.join(d,name+".mp3")],input=x.astype(np.float32).tobytes(),check=True)
def even(items):
    """items: (x, target dB, measure seconds); one shift for all, so no peak passes 0.95"""
    gs=[10**((t-20*np.log10(loudest(x,w)))/20) for x,t,w in items]
    room=min(20*np.log10(0.95/(np.max(np.abs(x))*g)) for (x,t,w),g in zip(items,gs))
    s=10**(min(0.0,room)/20); return [x*g*s for (x,t,w),g in zip(items,gs)], min(0.0,room)
info={"kinds":{}, "pitch":{}, "shift_db":{}}
# ── timpani ──
T=[]
for drum in range(1,6):
    hit=load(os.path.join(RAW,"Timpani__Timpani%d_Hit_v3_rr1_Sum.wav"%drum))
    rs=[f for f in sorted(os.listdir(RAW)) if f.startswith("Timpani__Rolls__Timpani%d_Roll"%drum)]
    soft=load(os.path.join(RAW,rs[0])); loud=load(os.path.join(RAW,rs[-1]))
    ph=principal(hit,0.05,1.5); ps=principal(soft,1.0,5.0); pl=principal(loud,1.0,5.0)
    mh=69+12*np.log2(ph/440); mr=69+12*np.log2(np.sqrt(ps*pl)/440)
    T.append((drum,hit,soft,loud,int(round(mh)),int(round(mr)),mh,69+12*np.log2(ps/440),69+12*np.log2(pl/440),rs))
labels_t=[t[4] for t in T]; labels_r=[t[5] for t in T]
assert len(set(labels_t))==5 and len(set(labels_r))==5, (labels_t, labels_r)
items=[]
for drum,hit,soft,loud,nt,nr,mh,ms,ml,rs in T:
    hit=hit[:ring_end(hit,3.0)]; soft=soft[:int(5*SR)]; loud=loud[:int(5*SR)]
    items+= [(soft,-26.0,0.4),(loud,-18.0,0.4),(hit,-17.0,0.15)]
xs,sh=even(items); info["shift_db"]["timpani"]=round(sh,2)
for k,(drum,hit,soft,loud,nt,nr,mh,ms,ml,rs) in enumerate(T):
    write(xs[3*k],"timpani","%ds"%nr,0.4,"64k"); write(xs[3*k+1],"timpani","%dl"%nr,0.4,"64k"); write(xs[3*k+2],"timpani","%dt"%nt,0.3,"64k")
    info["pitch"]["timpani/%dt"%nt]=round(mh,3); info["pitch"]["timpani/%ds"%nr]=round(ms,3); info["pitch"]["timpani/%dl"%nr]=round(ml,3)
    print("drum %d: hit %.2f -> %dt; rolls %.2f / %.2f -> %d (%s)"%(drum,mh,nt,ms,ml,nr,", ".join(rs)))
info["kinds"]["timpani"]="drum"
# ── mallets: the names are an octave under the sound (measured: the strongest peak is the fundamental) ──
PC={"C":0,"C#":1,"D":2,"D#":3,"E":4,"F":5,"F#":6,"G":7,"G#":8,"A":9,"A#":10,"B":11}
import re
for inst,prefix,maxs in (("xylophone","Xylo__",3.0),("glockenspiel","Glock__",5.0),("marimba","Marimba__",3.0)):
    fs=[f for f in sorted(os.listdir(RAW)) if f.startswith(prefix)]
    items=[]; names=[]
    for f in fs:
        m=re.search(r"_([A-G]#?)(\d)(?:_|\.wav)",f); n=(int(m.group(2))+1)*12+PC[m.group(1)]+12
        x=load(os.path.join(RAW,f)); x=x[:ring_end(x,maxs,-55)]
        items.append((x,-21.0,0.15)); names.append(n)
    xs,sh=even(items); info["shift_db"][inst]=round(sh,2); info["kinds"][inst]="bar"
    for x,n in zip(xs,names): write(x,inst,"%ds"%n,0.3,"64k")
    print(inst, sorted(names), "brought down %.1f dB"%-sh)
# ── kit: soft and loud hits of each piece keep their natural difference (one gain per piece, set by the loud hit) ──
KIT={"bd":("BDrumNewhit_v3_rr1_Sum.wav","BDrumNewhit_v6_rr1_Sum.wav",2.0),
     "sn":("Snare2-HitSN_v3_rr1_Sum.wav","Snare2-HitSN_v7_rr1_Sum.wav",1.2),
     "cy":("susCymb1-hitstick_mp_rr1.wav","susCymb1-hitstick_f_rr1.wav",4.0),
     "tri":("Triangle3-Hit_v1_rr1_Sum.wav","Triangle3-Hit_v2_rr1_Sum.wav",3.0),
     "tamb":("Tamb1-Hit_v1_rr1_Sum.wav","Tamb1-Hit_v2_rr1_Sum.wav",1.0)}
hits={}
for piece,(fs,fl,maxs) in KIT.items():
    s=load(os.path.join(RAW,fs)); l=load(os.path.join(RAW,fl)); s=s[:ring_end(s,maxs,-50)]; l=l[:ring_end(l,maxs,-50)]
    g=10**((-21.0-20*np.log10(loudest(l,0.05)))/20); g=min(g, 0.95/max(np.max(np.abs(l)),np.max(np.abs(s))))
    write(s*g,"kit",piece+"1",0.15,"64k"); write(l*g,"kit",piece+"2",0.15,"64k"); hits[piece]=[piece+"1",piece+"2"]
    print("kit",piece,"%.2f / %.2f s"%(len(s)/SR,len(l)/SR))
roll=load(os.path.join(RAW,"Snare2-rollSN_v3_rr1_Sum.wav"))[:int(5*SR)]
g=10**((-21.0-20*np.log10(loudest(roll,0.4)))/20); g=min(g,0.95/np.max(np.abs(roll)))
write(roll*g,"kit","roll1",0.4,"64k"); hits["roll"]=["roll1"]
info["kinds"]["kit"]="kit"; info["hits"]=hits
json.dump(info, open(os.path.join(OUT,"percussion.json"),"w"), indent=1)
tot=sum(os.path.getsize(os.path.join(OUT,i,f)) for i in ("timpani","xylophone","glockenspiel","marimba","kit") for f in os.listdir(os.path.join(OUT,i)))
print("percussion %.2f MB"%(tot/1e6))
