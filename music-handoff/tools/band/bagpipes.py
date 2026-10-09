# The Band's bagpipes (AOG-BAND-BAGPIPES-V1, 2026-10-09). Jimmy: "I don't believe we have the BAG PIPES as a musical
# option do we?" … "1." (a real recording, as every other player is). These are a real Great Highland bagpipe:
# "Great Highland bagpipe samples" by IowaSpaceWizard on Freesound (pack 29644), Creative Commons 0 (public domain),
# every file: the chanter's nine notes, Low G, Low A, B, C, D, E, F, High G, High A (527278 527276 527269 527268 527275
# 527274 527273 527277 527272) and the drones (527270). The page's "high quality preview" of each (MP3, 128 kbps) is
# what is used; get them with:
#   for id in 527268 527269 527270 527272 527273 527274 527275 527276 527277 527278; do
#     u=$(curl -sL https://freesound.org/s/$id/ | grep -o 'https://cdn.freesound.org/previews/[^"]*-hq.mp3' | head -1)
#     curl -sL "$u" -o $id.mp3; done
#
# Two players, made the way sax2.py made the saxophones:
#   bagpipe         the chanter: each of its nine notes held, one strength (a bagpipe has no loud and soft), 5 s
#   bagpipe_drones  the drones: the one recording (the tenor drones, with the bass drone an octave under), made into a
#                   held note every three semitones from E3 to E4 by changing its speed (no more than 4 semitones from
#                   where it was played), so a drone can be held under a tune in any key
# - the drones are tuned by their loudest sound, the tenor drones (near 250 Hz); a third drone in the recording sits a
#   little flat of them, as on many bagpipes, and is kept
# - a Highland bagpipe is tuned well above the orchestra's A (its "A" sounds near 488 Hz, a quarter-tone flat of B):
#   every note is measured and named for the note it is nearest, and the page is told how far off it is in cents, so
#   the bagpipes play in tune with the rest of the band
# - the quiet before the note is trimmed; held notes keep 5 s (0.4 s fade); the drones are taken from their steady part
# - every note is brought to one loudness, measured from 0.25 s to 2.5 s (-18 dB); the drones sit 4 dB under (-22 dB)
# - mono, 32 kHz, MP3 64 kbps
#   python3 bagpipes.py <aog-deploy/audio/band> <the folder of the ten .mp3 files>
import os, sys, json, shutil, subprocess, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tune
SR=32000
BAND=sys.argv[1]; SRC=sys.argv[2]
CHANTER={527278:"Low G",527276:"Low A",527269:"B",527268:"C",527275:"D",527274:"E",527273:"F",527277:"High G",527272:"High A"}
DRONES=527270
def load(path):
    pcm=subprocess.run(["ffmpeg","-v","error","-i",path,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout
    return np.frombuffer(pcm,dtype=np.float32).astype(np.float64)
def onset(x):
    pk=np.max(np.abs(x)); i=int(np.argmax(np.abs(x)>pk*0.03)); return max(0,i-int(0.005*SR))
def spectrum(x):
    seg=x[int(1*SR):int(4*SR)]; X=np.abs(np.fft.rfft(seg*np.hanning(len(seg)))); f=np.fft.rfftfreq(len(seg),1/SR); return X, f
def strongest(x, lo, hi):
    """the frequency with the most energy between lo and hi (Hz), from 1 s to 4 s"""
    X,f=spectrum(x); m=(f>lo)&(f<hi); return float(f[m][np.argmax(X[m])])
def fundamental(x, lo, hi):
    """the lowest strong peak between lo and hi (within 12 dB of the strongest): a note's own pitch, not an overtone
    that happens to be louder (the chanter's Low A and B have a louder octave)"""
    X,f=spectrum(x); m=(f>lo)&(f<hi); Xm, fm = X[m], f[m]; top=np.max(Xm)
    pk=[i for i in range(1,len(Xm)-1) if Xm[i]>Xm[i-1] and Xm[i]>Xm[i+1] and Xm[i]>top*10**(-12/20)]
    return float(fm[pk[0]]) if pk else float(fm[np.argmax(Xm)])
def midi(f): return 69+12*np.log2(f/440)
def level(x): b=x[int(0.25*SR):int(2.5*SR)]; return 20*np.log10(np.sqrt(np.mean(b*b))+1e-12)
def speed(x, semis):
    """the same recording played faster or slower (as a tape would), so its pitch moves by `semis`"""
    r=2**(semis/12); n=int(len(x)/r); t=np.arange(n)*r; return np.interp(t, np.arange(len(x)), x)
def write(inst, name, x, target):
    x=x[:int(5.0*SR)].copy(); x*=10**((target-level(x))/20)
    fo=int(0.4*SR); x[-fo:]*=np.linspace(1,0,fo)**2; fi=int(0.004*SR); x[:fi]*=np.linspace(0,1,fi)
    pk=float(np.max(np.abs(x)))
    if pk>0.95: x*=0.95/pk
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-codec:a","libmp3lame","-b:a","64k",
        os.path.join(BAND,inst,name+".mp3")],input=x.astype(np.float32).tobytes(),check=True)
for inst in ("bagpipe","bagpipe_drones"):
    d=os.path.join(BAND,inst)
    if os.path.isdir(d): shutil.rmtree(d)
    os.makedirs(d)
made={"bagpipe":[], "bagpipe_drones":[]}
# the chanter
for sid,nm in CHANTER.items():
    x=load(os.path.join(SRC,"%d.mp3"%sid)); x=x[onset(x):]
    f=fundamental(x, 380, 1100); n=int(round(midi(f)))
    write("bagpipe", "%ds"%n, x, -18.0); made["bagpipe"].append((n, nm, f))
# the drones: the tenor drones' pitch, then a held note every three semitones from E3 (52) to E4 (64)
x=load(os.path.join(SRC,"%d.mp3"%DRONES)); x=x[onset(x):]; x=x[int(9.75*SR):]         # the drones' steady stretch (their pitch wanders for the first few seconds)
f=strongest(x, 400, 600)/2; m0=midi(f)   # the loud tenor drones (their octave is the drones' strongest sound; one drone sits a little flat)
for n in range(52, 65, 3):
    y=speed(x, n-m0); write("bagpipe_drones", "%ds"%n, y, -22.0); made["bagpipe_drones"].append((n, "drones", 440*2**((n-69)/12)))
# the tuning, measured on the finished files, and the manifest
man=json.load(open(os.path.join(BAND,"manifest.json")),object_pairs_hook=dict)
for inst, rows in made.items():
    tunes={}; notes=sorted(n for n,_,_ in rows)
    for n,nm,f in sorted(rows):
        y=load(os.path.join(BAND,inst,"%ds.mp3"%n))
        h,sp,cnt=tune.heard(y, n, "held")
        if h is None: h=(tune.finalize_yin(y, n)-n)*100
        c=int(round(h))
        if abs(c)>=3: tunes["%ds"%n]=c
        print("%-15s %-7s %3d  %+5.0f cents%s"%(inst, nm, n, h, "  (corrected)" if abs(c)>=3 else ""))
    man[inst]={"sus":notes,"susL":[],"stac":[],"tune":tunes}
with open(os.path.join(BAND,"manifest.json"),"w") as fh: json.dump(man, fh, separators=(",",":"))
for inst in made:
    d=os.path.join(BAND,inst); print(inst, len(os.listdir(d)), "files,", round(sum(os.path.getsize(os.path.join(d,f)) for f in os.listdir(d))/1024), "KB")
