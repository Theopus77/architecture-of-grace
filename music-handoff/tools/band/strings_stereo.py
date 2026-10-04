# AOG-BAND-STEREO-STRINGS-V1 (2026-10-04) — Jimmy: "The violins sound fake."
# The Band's violin, viola and cello sections were made with process2.py, which mixed the library's two microphones into
# one channel. The two microphones stand apart (their sound agrees only about 25 %), so adding them together cancels some
# pitches and strengthens others, differently on every note: the hollow, phasey sound of a cheap sample keyboard.
# This builds them again from the same recordings (VS Chamber Orchestra: Community Edition, CC0), in true stereo:
#   - both microphones kept, left and right, as recorded (nothing added together)
#   - the quiet before the note trimmed (as process2.py: 3 % of the loudest, less 5 ms)
#   - held notes keep 6.5 s, not 5, fading over their last 0.5 s; short notes (spiccato) keep 0.9 s, fading over 0.1 s
#   - every note brought to the loudness of the note it replaces (the same moment: its loudest 0.4 s in the first 2.5 s
#     for a held note, its loudest 0.15 s for a short one), so the page's levels stay as they were
#   - 32 kHz (the rate the page decodes at), stereo, MP3 at 112 kbps held and 96 kbps short
#   - into new folders (audio/band/<player>2/), since the old files are cached for a year under their own names
#
#   python3 strings_stereo.py            (from anywhere; writes aog-deploy/audio/band/violins2, violas2, cellos2)
import os, re, sys, json, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tune
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", "..", "..", "aog-deploy"))
REPO = "/home/user/sgossner/vsco-2-ce"
SR = 32000
INST = {   # held folder, soft strength, loud strength (as fetch2.py picked them); short notes as choices.json picked them
    "violins": ("Strings/Violin Section/susVib", 1, 2),
    "violas":  ("Strings/Viola Section/susvib", 1, 2),
    "cellos":  ("Strings/Cello Section/susvib", 1, 3),
}
PC = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
RX = re.compile(r"_([A-G]#?)(-?\d)(?:_v(\d))?(?:_(?:rr)?(\d))?\.wav$", re.I)
MAN = json.load(open(os.path.join(ROOT, "audio", "band", "manifest.json")))
CHOICES = json.load(open(os.path.join(HERE, "choices.json")))


def git_ls(path):
    out = subprocess.run(["git", "-C", REPO, "ls-tree", "-r", "--name-only", "HEAD", "--", path], capture_output=True, text=True, check=True).stdout
    return [x for x in out.split("\n") if x.lower().endswith(".wav")]


def git_wav(path):
    raw = subprocess.run(["git", "-C", REPO, "show", "HEAD:" + path], capture_output=True, check=True).stdout
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "-", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], input=raw, capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).astype(np.float64).reshape(-1, 2)


def mp3_mono(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).astype(np.float64)


def loudest(p, w):
    """the loudest stretch of w seconds of a power curve (mean square per sample)"""
    n = int(w * SR)
    if len(p) <= n:
        return float(np.sqrt(np.mean(p) + 1e-15))
    c = np.concatenate([[0.0], np.cumsum(p)])
    return float(np.sqrt(np.max(c[n:] - c[:-n]) / n + 1e-15))


def trim_onset(x):
    a = np.max(np.abs(x), axis=1); pk = a.max(); i = int(np.argmax(a > pk * 0.03))
    return x[max(0, i - int(0.005 * SR)):]


def encode(x, dst, kbps):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "libmp3lame", "-b:a", "%dk" % kbps, dst],
                   input=x.astype(np.float32).tobytes(), check=True)


def build():
    report = []
    for inst, (held, sv, lv) in INST.items():
        man = MAN[inst]; out = os.path.join(ROOT, "audio", "band", inst + "2"); os.makedirs(out, exist_ok=True)
        files = {}
        for f in git_ls(held):
            m = RX.search(os.path.basename(f))
            if m: files[((int(m.group(2)) + 1) * 12 + PC[m.group(1).upper()], int(m.group(3) or 1))] = f
        # the library names its notes an octave or two away from how they sound: the offset that makes its notes the page's
        named = sorted(set(n for n, v in files))
        off = next(o for o in (12, 24, 0, -12) if sorted(n + o for n in named) == sorted(man["sus"]))
        jobs = []
        for n in man["sus"]:
            vs = sorted(v for nn, v in files if nn == n - off)
            for lay, want in (("s", sv), ("l", lv)):
                if lay == "l" and n not in man["susL"]:
                    continue
                v = want if want in vs else (vs[0] if lay == "s" else vs[-1])
                jobs.append(("%d%s" % (n, lay), files[(n - off, v)], "held"))
        for k, src in CHOICES[inst]["stac"].items():       # "43m": the library's own number, an octave or so off
            n = int(k[:-1]) + off
            if n in man["stac"]:
                jobs.append(("%dt" % n, src, "short"))
        for key, src, kind in jobs:
            x = trim_onset(git_wav(src))
            keep, fade, win, kb = (6.5, 0.5, 0.4, 112) if kind == "held" else (0.9, 0.1, 0.15, 96)
            x = x[:int(keep * SR)].copy()
            if len(x) > int(fade * SR):
                fl = int(fade * SR); x[-fl:] *= (0.5 * (1 + np.cos(np.linspace(0, np.pi, fl))))[:, None]
            x[:int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))[:, None]
            # the loudness of the note it replaces, at the same moment
            old = mp3_mono(os.path.join(ROOT, "audio", "band", inst, key + ".mp3"))
            ref = loudest(old[:int(2.5 * SR)] ** 2, win) if kind == "held" else loudest(old ** 2, win)
            pw = np.mean(x ** 2, axis=1)
            now = loudest(pw[:int(2.5 * SR)], win) if kind == "held" else loudest(pw, win)
            x *= ref / now
            pk = float(np.max(np.abs(x)))
            if pk > 0.97:
                x *= 0.97 / pk
            encode(x, os.path.join(out, key + ".mp3"), kb)
            n = int(key[:-1]); c, _, _ = tune.heard(x[:int(5 * SR), 0], n, "held" if kind == "held" else "short")
            report.append({"inst": inst, "key": key, "src": os.path.basename(src), "gain_db": round(20 * np.log10(ref / now), 1), "peak": round(min(pk, 0.97), 3),
                           "cents": None if c is None else round(c, 1), "page_tune": man["tune"].get(key, 0), "sec": round(len(x) / SR, 2),
                           "kb": os.path.getsize(os.path.join(out, key + ".mp3")) // 1024})
        print(inst, "octave offset", off, "files", len(jobs))
    for r in report:
        flag = "" if r["cents"] is None or abs(r["cents"] - r["page_tune"]) < 4 else "   <- tuning differs"
        print(r, flag)
    print("total KB", sum(r["kb"] for r in report))


if __name__ == "__main__":
    build()
