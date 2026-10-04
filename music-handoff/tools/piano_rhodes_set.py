# AOG-PIANO-RHODES-V1 (2026-10-04) — Jimmy: "Swap it in" (the fuller Rhodes recording for the warm electric piano).
# Builds aog-deploy/audio/piano/rhodes/ from jRhodes3d, Jeff Learman's own 1977 Rhodes Mark I Stage 73, the mono set:
# fifteen notes, F1 to C7, each played at five strengths. The page's piano format, as piano_vsco_sets.py and
# piano_real_sets.py make it: mono, 44,100 Hz, 96 kbps MP3, "<MIDI><layer>.mp3" with layers s (soft), m and l (loud),
# the quiet moment before the note trimmed, each note shortened and faded (longer low, shorter high, like the grand),
# and each note's pitch measured and, if it is more than 5 cents off, the note retuned (resampled).
#
#   python3 piano_rhodes_set.py <jRhodes3d clone> <aog-deploy/audio/piano/rhodes>
#
# License of the samples: CC BY-NC 4.0 (credit Jeff Learman; non-commercial use only); everything else in the
# library CC0. The site is free and sells nothing. Credited in audio/piano/CREDITS.txt.
import os, sys, json, subprocess, tempfile
import numpy as np
from scipy.signal import resample_poly

SRC, OUT = sys.argv[1], sys.argv[2]
SR = 44100
NOTES = [(29, "F1"), (35, "B1"), (40, "E2"), (45, "A2"), (50, "D3"), (55, "G3"), (59, "B3"), (62, "D4"), (65, "F4"),
         (71, "B4"), (76, "E5"), (81, "A5"), (86, "D6"), (91, "G6"), (96, "C7")]
LAYERS = {"s": [5], "m": [3, 4], "l": [1, 2]}   # the library's _5 is its softest stroke, _1 its hardest; its top notes
                                               # have no _3 (from B4) or _1 (from A5), so they take the next one


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def f0_cents(x, midi):
    """the note's offset from its MIDI pitch, in cents: autocorrelation over 0.25-1.0 s, refined by parabola"""
    want = 440.0 * 2 ** ((midi - 69) / 12)
    seg = x[int(0.25 * SR):int(1.0 * SR)]
    seg = seg - seg.mean()
    lo, hi = int(SR / (want * 1.12)), int(SR / (want / 1.12)) + 2
    best, bl = -1e9, lo
    n = len(seg)
    for lag in range(max(2, lo), min(hi, n // 2)):
        v = np.dot(seg[:n - lag], seg[lag:]) / (n - lag)
        if v > best:
            best, bl = v, lag
    def ac(l):
        return np.dot(seg[:n - l], seg[l:]) / (n - l)
    a, b, c = ac(bl - 1), ac(bl), ac(bl + 1)
    den = a - 2 * b + c
    shift = 0.5 * (a - c) / den if den else 0.0
    f = SR / (bl + shift)
    return 1200 * np.log2(f / want)


def keep_seconds(midi):
    return 6.0 if midi <= 50 else (4.5 if midi <= 71 else 3.0)


def build():
    os.makedirs(OUT, exist_ok=True)
    report = []
    for midi, name in NOTES:
        for lay, ks in LAYERS.items():
            k = next(k for k in ks if os.path.exists(os.path.join(SRC, "jRhodes3d-mono", "A_%03d__%s_%d.flac" % (midi, name, k))))
            x = load(os.path.join(SRC, "jRhodes3d-mono", "A_%03d__%s_%d.flac" % (midi, name, k)))
            pk = np.max(np.abs(x))
            i = int(np.argmax(np.abs(x) >= pk * 0.03))           # the note starts where it first reaches 3 % of its peak
            x = x[max(0, i - int(0.002 * SR)):]                   # with 2 ms before it, as the page expects
            c = f0_cents(x, midi)
            if abs(c) > 5:                                       # retune: play it slower (sharp) or faster (flat)
                up, down = int(round(10000 * 2 ** (c / 1200))), 10000
                x = resample_poly(x, up, down)
            keep = keep_seconds(midi)
            x = x[:int(keep * SR)]
            fade = int(min(len(x), (0.8 if midi <= 50 else 0.6 if midi <= 71 else 0.4) * SR))
            x[-fade:] *= 0.5 * (1 + np.cos(np.linspace(0, np.pi, fade)))
            x[:int(0.0005 * SR)] *= np.linspace(0, 1, int(0.0005 * SR))   # no click at the very first sample
            peak = np.max(np.abs(x))
            if peak > 0.93:
                x *= 0.93 / peak
            with tempfile.NamedTemporaryFile(suffix=".f32", delete=False) as t:
                t.write(x.astype(np.float32).tobytes())
                tmp = t.name
            dst = os.path.join(OUT, "%d%s.mp3" % (midi, lay))
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", tmp,
                            "-c:a", "libmp3lame", "-b:a", "96k", dst], check=True)
            os.unlink(tmp)
            c2 = f0_cents(load(dst)[int(0.0):], midi)
            report.append({"note": midi, "layer": lay, "from": k, "cents_before": round(c, 1), "cents_after": round(c2, 1),
                           "seconds": round(len(x) / SR, 2), "bytes": os.path.getsize(dst)})
    total = sum(r["bytes"] for r in report)
    print(json.dumps({"files": len(report), "bytes": total,
                      "worst_cents_after": max(abs(r["cents_after"]) for r in report)}, indent=1))
    for r in report:
        print(r)


if __name__ == "__main__":
    build()
