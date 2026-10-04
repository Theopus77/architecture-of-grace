"""Look at recordings before choosing them: loudness, peak, how long they ring, how bright, the pitch.
usage: python3 survey.py <source> [<source> ...]     (sources as in sources.py, e.g. vcsl:Idiophones/...wav)
       python3 survey.py --glob vcsl 'Idiophones/Struck Idiophones/Claps/*'   (a pattern over the local clone/cache)"""
import sys, os, glob
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sources, dsp
from dsp import SR

def onset(x, thr_db=-40.0):
    pk = np.max(np.abs(x)) + 1e-12
    idx = np.nonzero(np.abs(x) >= pk * 10 ** (thr_db / 20))[0]
    return int(idx[0]) if len(idx) else 0

def ring(x, floor_db=-50.0, win=512):
    pk = np.max(np.abs(x)) + 1e-12; n = len(x) // win
    if n == 0:
        return len(x) / SR
    r = np.sqrt(np.mean(x[: n * win].reshape(n, win) ** 2, axis=1))
    above = np.nonzero(r >= pk * 10 ** (floor_db / 20))[0]
    return ((above[-1] + 1) * win) / SR if len(above) else 0.0

def centroid(x):
    seg = x[: int(0.3 * SR)]
    sp = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))) ** 2; f = np.fft.rfftfreq(len(seg), 1 / SR)
    return float(np.sum(sp * f) / (np.sum(sp) + 1e-20))

def stats(src):
    x = sources.load(src); o = onset(x); y = x[o:]
    return dict(lu=dsp.momentary(y), pk=dsp.peak_db(y), lead=o / SR, ring=ring(y), cen=centroid(y),
                f0=dsp.pitch_hz(y, 30, 1500, 0.02, 0.4), dur=len(x) / SR)

def show(src):
    try:
        s = stats(src)
        print(f"{src[-70:]:70s} LU {s['lu']:6.1f} pk {s['pk']:6.1f} ring {s['ring']:5.2f}s dur {s['dur']:5.2f} "
              f"lead {s['lead']*1000:5.1f}ms cen {s['cen']:6.0f}Hz f0 {s['f0']:6.1f}")
    except Exception as e:
        print(f"{src[-70:]:70s} ERROR {e}")

if __name__ == "__main__":
    a = sys.argv[1:]
    if a and a[0] == "--glob":
        lib, pat = a[1], a[2]
        roots = [sources.LOCAL[lib], os.path.join(sources.CACHE, lib)]
        seen = set()
        for r in roots:
            for p in sorted(glob.glob(os.path.join(r, pat))):
                rel = os.path.relpath(p, r)
                if rel not in seen:
                    seen.add(rel); show(lib + ":" + rel)
    else:
        for s in a:
            show(s)
