# How the new players' notes are tuned. YIN, as finalize.py measures it (its difference function, searched within
# 1.5 semitones of the note), on 60 ms windows (or three cycles, if longer), every 10 ms, over the part of the note
# the ear takes its pitch from:
#   held notes:  0.25 s to 2.5 s, past the attack (a brass player often slides up into the note in its first
#                quarter second), the middle value, louder windows counted more (vibrato swings around it)
#   short notes and plucks: from 20 ms, while the note is within 20 dB of its loudest, up to 0.6 s; the middle value
#   finalize.py's own reading (one window, 0.06-0.56 s) is kept next to it for comparison
import numpy as np
SR=32000
def yin_window(seg, m, W):
    f=440*2**((m-69)/12); P=SR/f; lo=int(P*2**(-1.5/12))-1; hi=int(P*2**(1.5/12))+2
    if len(seg)<W+hi+1: return None
    d=np.array([np.sum((seg[:W]-seg[t:t+W])**2) for t in range(lo,hi+1)])
    i=int(np.argmin(d)); t=lo+i
    if i==0 or i==len(d)-1: return None
    den=d[i-1]-2*d[i]+d[i+1]
    if den!=0: t+=0.5*(d[i-1]-d[i+1])/den
    return 69+12*np.log2(SR/t/440)
def finalize_yin(x, m):
    f=440*2**((m-69)/12); P=SR/f; lo=int(P*2**(-1.5/12))-1; hi=int(P*2**(1.5/12))+2
    a=int(0.06*SR); W=int(min(0.5*SR, max(4*hi, len(x)-a-hi-1)))
    if W<2*hi: a=0; W=len(x)-hi-1
    seg=x[a:a+W+hi]; d=np.array([np.sum((seg[:W]-seg[t:t+W])**2) for t in range(lo,hi+1)])
    i=int(np.argmin(d)); t=lo+i
    if 0<i<len(d)-1: t+=0.5*(d[i-1]-d[i+1])/(d[i-1]-2*d[i]+d[i+1])
    return 69+12*np.log2(SR/t/440)
def windows(x, m, a, b, step=0.01, floor_db=None):
    P=SR/(440*2**((m-69)/12)); W=int(max(0.06*SR, 3*P)); hi=int(P*2**(1.5/12))+2
    lv=[]; t=a
    while int(t*SR)+W+hi+1<=len(x) and t<=b:
        s=int(t*SR); lv.append((t, float(np.sqrt(np.mean(x[s:s+W]**2))+1e-12))); t+=step
    if not lv: return []
    top=max(l for _,l in lv); out=[]
    for t,l in lv:
        if floor_db is not None and 20*np.log10(l/top)<floor_db: continue
        s=int(t*SR); v=yin_window(x[s:s+W+hi+1], m, W)
        if v is not None: out.append((v,l))
    return out
def wmedian(vals, wts):
    vals=np.asarray(vals); wts=np.asarray(wts); o=np.argsort(vals); cw=np.cumsum(wts[o]); return float(vals[o][np.searchsorted(cw, cw[-1]/2)])
def around(x, m, semis=4.0):
    """the note's own band only (zero phase): a drum's other modes are not harmonics of its pitch, so YIN would follow
    them; within four semitones of the note there is only the drum's principal tone, the pitch the ear hears"""
    f=440*2**((m-69)/12); N=len(x); X=np.fft.rfft(x); fr=np.fft.rfftfreq(N,1/SR)
    lo,hi=f*2**(-semis/12), f*2**(semis/12)
    w=np.clip(np.minimum((fr-lo*0.9)/(lo*0.1), (hi*1.1-fr)/(hi*0.1)),0,1)
    return np.fft.irfft(X*w, N)
def peak_near(x, m, a, b, semis=0.8):
    """the strongest spectral peak within `semis` of note m, over a..b seconds (Hz)"""
    seg=x[int(a*SR):int(b*SR)]
    if len(seg)<4096: seg=x[:int(1.0*SR)]
    N=1<<18; S=np.abs(np.fft.rfft(seg*np.hanning(len(seg)),N)); fr=np.arange(len(S))*SR/N
    f=440*2**((m-69)/12); w=np.where((fr>f*2**(-semis/12))&(fr<f*2**(semis/12)))[0]; j=w[np.argmax(S[w])]
    y0,y1,y2=np.log(S[j-1]+1e-12),np.log(S[j]+1e-12),np.log(S[j+1]+1e-12); den=y0-2*y1+y2
    return (j+(0.5*(y0-y2)/den if den else 0))*SR/N
def bar_heard(x, m, held):
    """a drum or a mallet bar: their other modes are not harmonics of the pitch, so YIN would follow them. The
    fundamental is found in the spectrum, everything more than a semitone from it is set aside, and YIN measures what
    is left, over a roll's steady part or a hit's first second. Returns (cents from m, spread, windows, spectral cents)"""
    a,b=(0.25,2.5) if held else (0.03,1.0)
    f=peak_near(x, m, a, b)
    y=around(x, 69+12*np.log2(f/440), 1.0)
    w=windows(y, m, a, b, 0.01, None if held else -25)
    if not w: return None, None, 0, (69+12*np.log2(f/440)-m)*100
    v=[q for q,_ in w]; l=[q for _,q in w]; c0=wmedian(v,l)              # louder moments count more, as the ear hears them
    sp=float(np.sqrt(np.average((np.array(v)-c0)**2, weights=np.array(l))))*100
    return (c0-m)*100, sp, len(v), (69+12*np.log2(f/440)-m)*100
def drum_heard(x, m, held):
    c,sp,n,spec=bar_heard(x, m, held); return c,sp,n
def heard(x, m, kind):
    """(cents the note sounds from m, spread in cents, number of windows), by the part of the note the ear uses"""
    if kind=="held":
        w=windows(x, m, 0.25, 2.5, 0.01)
        if len(w)<5: w=windows(x, m, 0.02, 2.5, 0.01, -20)
        if not w: return None, None, 0
        v=[a for a,_ in w]; l=[b for _,b in w]; c=wmedian(v,l)
    else:
        w=windows(x, m, 0.02, 0.6, 0.01, -20)
        if not w: return None, None, 0
        v=[a for a,_ in w]; c=float(np.median(v)); l=[1]*len(v)
    sp=float(np.sqrt(np.average((np.array(v)-c)**2, weights=np.array(l))))
    return (c-m)*100, sp*100, len(v)
