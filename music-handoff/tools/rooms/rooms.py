# Real rooms (AOG-REAL-ROOMS-V1, 2026-10-11). Jimmy's 5: "Real rooms. Today every reverb is a made-up decay. Free (CC0)
# recordings of real halls, plates and churches would make the reverb sound like real spaces."
#
# Six impulse responses (the sound of a real space answering one sharp sound: a balloon, a click, or a sine sweep worked
# back into a click), every one given to everyone under Creative Commons 0 (public domain) on Freesound. The licence was
# read on each sound's own page. The page's "high quality preview" of each (MP3, 128 kbps) is what is used; get them with:
#   for id in 585740 733144 423866 240593 560377 131034; do
#     u=$(curl -sL https://freesound.org/s/$id/ | grep -o 'https://cdn.freesound.org/previews/[^"]*-hq.mp3' | head -1)
#     curl -sL "$u" -o $id.mp3; done
#
#   small   585740  "IR_Chamber_Stereo.wav" by Nox_Sound: a small chamber (room), Zoom H5, stereo
#   studio  733144  "STUDIO A (COLLEGE RECORDING STUDIO) IR REVERB" by djericmark: a 10 s sine sweep, stereo
#   hall    423866  "IR Liverpool Philharmonic Hall.wav" by johnnyguitar01: the concert hall, stereo
#   church  240593  "notredamenyc2014impulseresponse_01.flac" by pushkin: Notre Dame, New York City, X/Y pair (stereo)
#   plate   560377  "1000 Liter Wine Tank Plate Spring Impulse" by manysound: a steel wine tank played like a plate
#                   reverb (two transducers on the tank, a Blumlein pair inside; no real plate is CC0), stereo
#   spring  131034  "Roland RE-301 Spring Reverb Impulse" by 0e0: the spring tank in a Roland RE-301 (1977), mono
#
# What is done to each:
# - read at 44,100 samples a second (stereo kept stereo: left and right as they were recorded; the spring is mono)
# - DC taken out (the mean, then a gentle 12 Hz high-pass)
# - the quiet before the direct sound trimmed (1 ms kept); the direct sound itself (its first 3 ms) taken out (silence,
#   then a 2 ms fade in), so the reverb send adds the room, not a second, slightly late copy of the dry sound (which would
#   add to the dry sound in step and make it louder); the room's first echoes keep their time after it
# - the plate and the spring are made shorter (an extra decay, "shape"): the tank rings for ten seconds, and the spring's
#   recording ends in a long hiss; both now die away like a plate (about 2.5 s) and a spring (about 1.3 s)
# - the tail ends where it meets the recording's noise (or 75 dB down), with a gentle fade over its last part, and no
#   longer than the limit for its kind (the small room 1.5 s, the studio 1 s, the hall and the plate 3 s, the church 4 s)
# - every file brought to one loudness (the same energy), so switching rooms does not jump in level; the pages also even
#   each one to the reverb it replaces
# - 16-bit WAV (dither from a fixed seed, so the same sources make the same files)
# It prints each file's length and its decay time (RT60, from the Schroeder backward integral, T30 or T20).
#   python3 rooms.py <aog-deploy/audio/rooms> <the folder of the six .mp3 files>
import os, sys, subprocess, wave, numpy as np
SR=44100
OUT=sys.argv[1]; SRC=sys.argv[2]
#        id        source  channels  limit (s)  shape (an extra decay: the RT60 it would have alone, s)
ROOMS=[("small",  585740, 2, 1.5, None),
       ("studio", 733144, 2, 1.0, None),
       ("hall",   423866, 2, 3.0, None),
       ("church", 240593, 2, 4.0, None),
       ("plate",  560377, 2, 3.0, 3.6),
       ("spring", 131034, 1, 2.5, 2.0)]
def load(path, ch):
    pcm=subprocess.run(["ffmpeg","-v","error","-i",path,"-ac",str(ch),"-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout
    return np.frombuffer(pcm,dtype=np.float32).astype(np.float64).reshape(-1,ch).T.copy()
def highpass(x, hz):
    a=np.exp(-2*np.pi*hz/SR); y=np.zeros_like(x); px=0.0; py=0.0
    for i in range(len(x)): py=a*(py+x[i]-px); px=x[i]; y[i]=py
    return y
def envelope(x, ms=20):
    e=(x*x).mean(0); w=max(1,int(ms/1000*SR)); return np.convolve(e, np.ones(w)/w, "same")
def rt60(x):
    """the decay time: the Schroeder backward integral of the energy, the slope from -5 dB to -35 dB (T30), or to -25 dB
    (T20) when the recording is not that deep, as seconds to fall 60 dB"""
    e=(x*x).mean(0); edc=np.cumsum(e[::-1])[::-1]; edc=10*np.log10(edc/edc[0]+1e-30)
    for lo in (-35,-25):
        i=np.where(edc<=-5)[0]; j=np.where(edc<=lo)[0]
        if len(i) and len(j):
            t=np.arange(i[0],j[0])/SR; k=np.polyfit(t, edc[i[0]:j[0]], 1)[0]; return -60/k, ("T30" if lo==-35 else "T20")
    return None, "-"
def write(path, x, seed):
    r=np.random.default_rng(seed); ch=x.shape[0]
    q=np.round(x*32767+(r.random(x.shape)-r.random(x.shape))).clip(-32768,32767).astype("<i2")
    with wave.open(path,"wb") as w: w.setnchannels(ch); w.setsampwidth(2); w.setframerate(SR); w.writeframes(q.T.tobytes())
os.makedirs(OUT, exist_ok=True)
made=[]
for k,(rid,sid,ch,limit,shape) in enumerate(ROOMS):
    x=load(os.path.join(SRC,"%d.mp3"%sid), ch)
    x-=x.mean(1,keepdims=True); x=np.array([highpass(c, 12) for c in x])
    a=np.abs(x).max(0); pk=a.max(); on=int(np.argmax(a>pk*0.1)); st=max(0,on-int(0.001*SR))
    x=x[:,st:]; f=on-st
    d=int(0.003*SR); x[:,:f+d]=0                                    # the direct sound taken out (the room's answer keeps its time)
    sm=int(0.002*SR); x[:,f+d:f+d+sm]*=np.linspace(0,1,sm)
    if shape: x*=np.exp(-6.9*np.arange(x.shape[1])/SR/shape)
    env=envelope(x); top=env.max(); i0=int(np.argmax(env))
    tail=env[int(len(env)*0.9):]; live=tail[tail>top*1e-12]
    floor=max(live.mean() if len(live) else 0, top*10**(-75/10))
    above=np.where(env[i0:]>floor*4)[0]; end=min(i0+(above[-1] if len(above) else len(env)), int(limit*SR))
    x=x[:,:end]; fo=int(min(0.3*end, 0.6*SR)); x[:,-fo:]*=np.cos(np.linspace(0,np.pi/2,fo))**2
    made.append((rid,sid,x))
# one loudness: every file the same energy (per channel), the loudest peak at 0.9
E=lambda x: float((x*x).sum(1).mean())
g=min(0.9*np.sqrt(E(x))/np.abs(x).max() for _,_,x in made)   # the energy every file can reach (its square root)
for k,(rid,sid,x) in enumerate(made):
    y=x*(g/np.sqrt(E(x))); write(os.path.join(OUT,rid+".wav"), y, 1000+k)
    rt,how=rt60(y); kb=os.path.getsize(os.path.join(OUT,rid+".wav"))/1024
    print("%-7s %6d  %d ch  %.2f s  RT60 %.2f s (%s)  peak %.2f  %4.0f KB"%(rid, sid, y.shape[0], y.shape[1]/SR, rt, how, np.abs(y).max(), kb))
print("total %.0f KB"%(sum(os.path.getsize(os.path.join(OUT,r+".wav")) for r,_,_,_,_ in ROOMS)/1024))
