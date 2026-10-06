# AOG-KICK-RATTLE-V1 (2026-10-06) — Jimmy: "On a certain beat one hears a spring before the snare hits." A drum kit's snare
# wires buzz when the kick drum is struck, and the kick microphones hear it: a hiss that rings on for a third of a second.
# Where a beat puts a kick two sixteenths before the snare (Boom bap: beat 4), that buzz runs straight into the snare and
# sounds like a spring. Here each kick keeps its whole sound for its first 50 ms (the beater and the punch); then only
# what is above 1.8 kHz (the wires) fades away by 110 ms, and the drum itself rings on as recorded. Run once per kit whose
# kicks buzz (the after-120 ms hiss above 2 kHz louder than 48 dB under the kick's body); the files are saved in place,
# same channels, rate and bit rate, and aog-drumkit.js VER is raised so browsers fetch them again.
#   python3 kick_rattle.py <aog-deploy/audio/drums> bigroom2 arena2 …
import sys, os, glob, subprocess, json
import numpy as np
from scipy.signal import butter, sosfiltfilt
SR = 44100
KEEP, GONE, CUT = 0.050, 0.110, 1800.0
def probe(p):
    o = json.loads(subprocess.run(["ffprobe","-v","quiet","-show_streams","-of","json",p],capture_output=True,check=True).stdout)["streams"][0]
    return int(o["channels"]), int(o.get("bit_rate") or 96000)
def load(p, ch):
    x = np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac",str(ch),"-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32).astype(np.float64)
    return x.reshape(-1, ch)
def save(p, y, ch, br):
    tmp = p + ".tmp.mp3"
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac",str(ch),"-i","-","-codec:a","libmp3lame","-b:a",str(round(br/1000))+"k",tmp],
                   input=y.astype(np.float32).tobytes(), check=True)
    os.replace(tmp, p)
def rattle(x):
    """the hiss above 2 kHz from 120 to 300 ms, against the kick's body (below 300 Hz, first 60 ms), in dB"""
    m = x.mean(axis=1)
    def band(a, b, lo, hi):
        s = m[int(a*SR):int(b*SR)]; X = np.abs(np.fft.rfft(s*np.hanning(len(s))))**2; f = np.fft.rfftfreq(len(s), 1/SR)
        return 10*np.log10(X[(f>=lo)&(f<hi)].sum()+1e-12)
    return band(0.12, 0.30, 2000, SR/2) - band(0, 0.06, 0, 300)
def clean(x):
    hi = sosfiltfilt(butter(4, CUT, "hp", fs=SR, output="sos"), x, axis=0)
    t = np.arange(len(x))/SR
    g = np.where(t<KEEP, 1.0, np.where(t>GONE, 0.0, 0.5+0.5*np.cos(np.pi*(t-KEEP)/(GONE-KEEP))))
    y = x - hi*(1-g)[:, None]
    pk = np.abs(x).max(); yp = np.abs(y).max()
    return y*(pk/yp) if yp > pk else y          # never louder at its peak than the recording was
if __name__ == "__main__":
    root, kits = sys.argv[1], sys.argv[2:]
    for k in kits:
        for p in sorted(glob.glob(os.path.join(root, k, "kick-*.mp3"))):
            ch, br = probe(p); x = load(p, ch); before = rattle(x)
            y = clean(x); save(p, y, ch, br)
            print("%-28s %d ch %3d kbps · buzz %5.1f → %5.1f dB" % (k+"/"+os.path.basename(p), ch, br//1000, before, rattle(load(p, ch))))
