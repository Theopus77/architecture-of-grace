# The Band's saxophone: Weresax by Karoryfer Samples (CC0), an alto saxophone recorded chromatically from D-flat 3 to
# A-flat 5, soft and loud, two microphones, two takes. Every other note, the condenser microphone, the first take; held
# for 5 s like the others (the library's own loop carries a note on if it is shorter), the quiet before it trimmed, each
# layer brought to the same loudness as the other players', faded out, mono 32 kHz MP3.
import os, struct, subprocess, json, numpy as np
SRC="/home/user/sfzinstruments/karoryfer.weresax/Samples/alto"; HERE=os.path.dirname(os.path.abspath(__file__)); OUT=os.path.join(HERE,"out","sax"); SR=32000
NAMES=["c","db","d","eb","e","f","gb","g","ab","a","bb","b"]
def name(m): return "%s%d"%(NAMES[m%12], m//12-2)          # the library's octave numbers: 49 is db2, 60 is c3
def loops(path):
    b=open(path,"rb").read(); i=12; sr=44100
    while i+8<=len(b):
        cid=b[i:i+4]; n=struct.unpack("<I",b[i+4:i+8])[0]; d=b[i+8:i+8+n]
        if cid==b"fmt ": sr=struct.unpack("<I",d[4:8])[0]
        if cid==b"smpl" and struct.unpack("<I",d[28:32])[0]>0: lp=struct.unpack("<IIIIII",d[36:60]); return lp[2]/sr, lp[3]/sr
        i+=8+n+(n&1)
    return None
def load(p):
    return np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32).astype(np.float64)
def onset(x):
    pk=np.max(np.abs(x)); i=int(np.argmax(np.abs(x)>pk*0.03)); return max(0,i-int(0.005*SR))
TARGET={"s":-26.0,"l":-18.0}
notes=list(range(49,81,2))+[80]
os.makedirs(OUT,exist_ok=True); made=[]
for m in notes:
    for lay,dyn in (("s","p"),("l","f")):
        p=os.path.join(SRC,"%s_%s_rr1_cnd.wav"%(name(m),dyn))
        if not os.path.exists(p): print("missing",p); continue
        x=load(p); lp=loops(p); o=onset(x); x=x[o:]
        want=int(5.0*SR)
        if len(x)<want and lp:                                # carry the note on with its own loop, crossfaded at the seam
            a=int(lp[0]*SR)-o; b=min(len(x), int(lp[1]*SR)-o); seg=x[a:b]; xf=int(0.03*SR)
            while len(x)<want and len(seg)>2*xf:
                ramp=np.linspace(0,1,xf); tail=x[-xf:]*(1-ramp)+seg[:xf]*ramp
                x=np.concatenate([x[:-xf], tail, seg[xf:]])
        x=x[:want]
        s=x[int(0.05*SR):int(0.8*SR)]; r=float(np.sqrt(np.mean(s*s)+1e-12))
        g=10**((TARGET[lay]-20*np.log10(r))/20); g=min(g, 0.95/max(1e-6,np.max(np.abs(x)))); x=x*g
        fo=int(0.4*SR); x[-fo:]*=np.linspace(1,0,fo)**2; fi=int(0.002*SR); x[:fi]*=np.linspace(0,1,fi)
        f=os.path.join(OUT,"%d%s.mp3"%(m,lay))
        subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-codec:a","libmp3lame","-b:a","64k",f],input=x.astype(np.float32).tobytes(),check=True)
        made.append((m,lay,round(len(x)/SR,2)))
print(len(made),"files", made[:4], "...", made[-2:])
tot=sum(os.path.getsize(os.path.join(OUT,f)) for f in os.listdir(OUT)); print("%.2f MB"%(tot/1e6))
