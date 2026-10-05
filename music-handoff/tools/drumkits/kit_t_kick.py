# Kit T (groove metal) kick, made again from Big Rusty Drums (Karoryfer Samples, CC0): the 24-inch kick's own microphone,
# with a touch of the snare microphone for the beater's attack (both single microphones: nothing spaced is added together).
# A metal kick: a firm punch at 60-100 Hz, the boxy middle (300-500 Hz) taken down a little, not scooped away, the beater
# click brought up at 3-5 kHz, and a short, tight decay for fast double-kick runs. The body between 100 and 1000 Hz stays,
# so a phone or iPad speaker (which cannot play the deepest notes) still hears a drum, not a stick.
#   python3 kit_t_kick.py <folder of Big Rusty kick takes: kick_vl<v>_rr<r>.flac and sn_vl<v>_rr<r>.flac, from
#                          Samples/kick_24/kick/kick and .../sn of github.com/sfzinstruments/karoryfer.big-rusty-drums>
#                          <aog-deploy/audio/drums/groovemetal>
# (Jimmy, 2026-10-04: "Groove metal kick drum still sounds like a STICK!" The first kick kept the drum's deepest notes
#  and the click, with the body between cut away; a phone or iPad speaker plays neither the deepest notes, so only the
#  click was left.) Tuned up 4 semitones; each hit as loud as the kick it replaces (K-weighted, loudest 100 ms).
import numpy as np, subprocess, sys, json, os
SRC, OUT = sys.argv[1], sys.argv[2]
from scipy.signal import lfilter, butter, sosfilt
SR=44100
import os
TUNE=4; LS_F=55; LS_G=-6; PUNCH_F=100; PUNCH_G=5; BODY_F=190; BODY_G=3; CLICK_F=4000; CLICK_G=9   # semitones up; dB
def load(p):
    return np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32).astype(np.float64)
def peq(x, f0, g, q, kind="peak"):
    A=10**(g/40); w=2*np.pi*f0/SR; a=np.sin(w)/(2*q); c=np.cos(w)
    if kind=="peak": b=[1+a*A,-2*c,1-a*A]; d=[1+a/A,-2*c,1-a/A]
    elif kind=="low":
        s=np.sqrt(A); b=[A*((A+1)-(A-1)*c+2*s*a),2*A*((A-1)-(A+1)*c),A*((A+1)-(A-1)*c-2*s*a)]; d=[(A+1)+(A-1)*c+2*s*a,-2*((A-1)+(A+1)*c),(A+1)+(A-1)*c-2*s*a]
    else:
        s=np.sqrt(A); b=[A*((A+1)+(A-1)*c+2*s*a),-2*A*((A-1)+(A+1)*c),A*((A+1)+(A-1)*c-2*s*a)]; d=[(A+1)-(A-1)*c+2*s*a,2*((A-1)-(A+1)*c),(A+1)-(A-1)*c-2*s*a]
    return lfilter(np.array(b)/d[0], np.array(d)/d[0], x)
def kweight(x):
    y=peq(x,1500,4,0.7,"high"); return sosfilt(butter(2,38,"hp",fs=SR,output="sos"),y)
def loud(x, w=0.1):
    y=kweight(x)**2; n=int(w*SR); c=np.concatenate([[0],np.cumsum(y)]); return 10*np.log10(np.max(c[n:]-c[:-n])/n+1e-15)
def make(v, r):
    k=load(os.path.join(SRC, "kick_vl%d_rr%d.flac"%(v,r))); s=load(os.path.join(SRC, "sn_vl%d_rr%d.flac"%(v,r)))
    x=k+0.18*s
    from scipy.signal import resample_poly
    x=resample_poly(x, 100, int(round(100*2**(TUNE/12))))        # tuned up, as the library's own tune control does
    x=sosfilt(butter(2,40,"hp",fs=SR,output="sos"),x)
    x=peq(x,LS_F,LS_G,0.7,"low"); x=peq(x,PUNCH_F,PUNCH_G,1.0); x=peq(x,BODY_F,BODY_G,1.2); x=peq(x,400,-4.0,0.9)
    x=peq(x,CLICK_F,CLICK_G,1.1); x=peq(x,9000,2.0,0.7,"high")
    a=np.abs(x); i=int(np.argmax(a>a.max()*0.05)); x=x[max(0,i-int(0.001*SR)):]
    n=int(0.42*SR); x=x[:n].copy(); t=np.arange(n)/SR
    x*=np.where(t<0.16,1.0,np.exp(-(t-0.16)/0.07))                 # tight: the drum's ring let go after 160 ms
    f=int(0.03*SR); x[-f:]*=np.linspace(1,0,f)
    return x
old={}
def oldload(name): return load(os.path.join(OUT, "%s.mp3"%name))   # the kick it replaces (bring the old files back from git 7804f700 to run again)
plan={"kick-s":(6,1),"kick-m1":(10,1),"kick-m2":(10,2),"kick-m3":(10,3),"kick-m4":(10,4),"kick-h1":(14,1),"kick-h2":(14,2)}
rep=[]
for name,(v,r) in plan.items():
    x=make(v,r); ref=loud(oldload(name)); g=10**((ref-loud(x))/20); x*=g
    pk=np.max(np.abs(x))
    if pk>0.89: x*=0.89/pk
    out=os.path.join(OUT, "%s.mp3"%name)
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-codec:a","libmp3lame","-b:a","128k",out],input=x.astype(np.float32).tobytes(),check=True)
    rep.append((name, round(ref,1), round(loud(load(out)),1), round(float(pk*min(1,0.89/pk)),2)))
print(rep)
