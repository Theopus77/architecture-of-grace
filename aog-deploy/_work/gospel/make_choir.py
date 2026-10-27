# AOG-GOSPEL-V1 (2026-10-26) — Jimmy: "Can you make gospel vocal samples for the studio".
# The Gospel Choir record (39-gospel-choir.mp3): sixteen choir samples in C, one on each pad, sung by twenty real singers.
#
# The voices are VocalSet (Julia Wilkins, Prem Seetharaman, Alison Wahl and Bryan Pardo, ISMIR 2018), CC BY 4.0: every
# singer's "long straight" held notes on the vowels a (aah), e, i (ee), o (oh) and u (ooh), as kept in
# github.com/mblackman/vocalset-vowel-voicebanks (source/vocalset/<singer>_long_straight_<vowel>.wav, 100 files). The
# women hold C4, C5 and F5; the men C3 (a little flat), C4 and F4. Each note a chord needs is moved there from the
# singer's nearest held note by TD-PSOLA (music-handoff/tools/band/psola.py: the pitch moves, the vowel stays as sung),
# never more than 6.3 semitones. Nothing in it is a computer's voice: only where each singer sings is changed.
#
# The choir: sopranos (f1 f2 f3 f4 f6 f7 f9), altos (the mezzos f5 f8, and sopranos when needed), tenors (m2 m3 m7 m9 m11)
# and basses (m1 m4 m5 m6 m8 m10), up to four on a part, no singer on two parts at once. Each singer is a hair off the
# others, as in a real choir (up to 7 cents, up to 25 ms, 1.5 dB), and stands in their own place left to right. A small
# church room (1.7 s) is added, the same for every pad.
#
# Run:  python3 make_choir.py <folder with the 100 VocalSet files>
# Out:  ../../audio/crate/39-gospel-choir.mp3 and gospel-choir.json (its crate entry; add_to_crate.py puts it in crate.json)
import os, sys, json, subprocess, numpy as np
from scipy import signal
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "music-handoff", "tools", "band"))
import psola
SR = psola.SR; SRU = psola.SRU; OUTSR = 44100
SRC = sys.argv[1]
OUT = os.path.join(HERE, "..", "..", "audio", "crate")
rng = np.random.default_rng(39)

# ── where each singer holds a note (start s, end s, midi as sung), found as world.py's sung_notes does ─────────────
def midi(f): return 69 + 12 * np.log2(f / 440)
def sung_notes(x, fem):
    fmin, fmax = (150, 1100) if fem else (65, 520)
    hop = 0.01; win = 0.05; out = []; cur = []; t = 0.0
    while t + win < len(x) / SR:
        s = int(t * SR); seg = x[s:s + int(win * SR)]
        W = len(seg) // 2; lo = int(SR / fmax); hi = min(int(SR / fmin), W - 1)
        d = np.array([np.sum((seg[:W] - seg[k:k + W]) ** 2) for k in range(1, hi + 1)])
        cm = d * np.arange(1, len(d) + 1) / np.maximum(np.cumsum(d), 1e-12)
        idx = [i for i in range(lo - 1, len(cm)) if cm[i] < 0.12]
        mm = None
        if idx and np.sqrt(np.mean(seg ** 2)) > 1e-3:
            i = idx[0]
            while i + 1 < len(cm) and cm[i + 1] < cm[i]: i += 1
            mm = midi(SR / (i + 1))
        if mm is not None and cur and abs(mm - np.median([c[1] for c in cur[-20:]])) < 0.5: cur.append((t, mm))
        else:
            if len(cur) >= 80: out.append(cur)
            cur = [(t, mm)] if mm is not None else []
        t += hop
    if len(cur) >= 80: out.append(cur)
    res = []
    for c in out:
        ms = np.array([q[1] for q in c]); k = len(ms)
        res.append((c[0][0], c[-1][0] + win, float(np.median(ms[k // 5:k - k // 5]))))
    joined = []
    for r in res:
        if joined and abs(joined[-1][2] - r[2]) < 0.4 and r[0] - joined[-1][1] < 0.4: joined[-1] = (joined[-1][0], r[1], (joined[-1][2] + r[2]) / 2)
        else: joined.append(r)
    return [r for r in joined if r[1] - r[0] >= 0.8]

SINGERS = ["f%d" % i for i in range(1, 10)] + ["m%d" % i for i in range(1, 12)]
PARTS = {"S": ["f1", "f2", "f3", "f4", "f6", "f7", "f9"], "A": ["f5", "f8", "f2", "f4", "f6", "f9", "f3", "f1", "f7"],
         "T": ["m2", "m3", "m7", "m11", "m9"], "B": ["m1", "m4", "m5", "m6", "m8", "m10"]}
NEXT = {"S": "A", "A": "S", "T": "B", "B": "T"}
PAN = {s: p for s, p in zip(SINGERS, np.linspace(-0.4, 0.4, len(SINGERS)))}
# a choir stands sopranos left, altos left of centre, tenors right of centre, basses right (kept near the middle, so a
# sample of one part alone still sits near the centre)
for part, lo, hi in (("S", -0.45, -0.15), ("A", -0.2, 0.1), ("T", -0.05, 0.25), ("B", 0.15, 0.45)):
    for i, s in enumerate(PARTS[part][:4]):
        PAN.setdefault(s, 0); PAN[s] = lo + (hi - lo) * i / 3
NOTES = {}; RAW = {}
def notes_of(s, v):
    k = (s, v)
    if k not in NOTES:
        f = os.path.join(SRC, "%s_long_straight_%s.wav" % (s, v))
        NOTES[k] = sung_notes(psola.load(f, SR), s.startswith("f")) if os.path.exists(f) else []
        RAW[k] = psola.load(f, SRU) if os.path.exists(f) else None
    return NOTES[k]

MOVED = {}
def moved(s, v, j, n):
    """singer s's held note j on vowel v, moved to midi n (from its own start to its own end, 32 kHz)"""
    k = (s, v, j, n)
    if k not in MOVED:
        a, b, m = notes_of(s, v)[j]; xs = RAW[(s, v)]
        seg = xs[int(max(0, a - 0.06) * SRU):int((b + 0.12) * SRU)]
        P = 2.5 * SRU / (440 * 2 ** ((m - 69) / 12))
        seg = np.concatenate([np.zeros(int(P)), seg[psola.onset(seg, SRU):]])
        y = psola.down(psola.psola(seg, m, n - m)) if abs(n - m) > 0.02 else psola.down(seg)
        MOVED[k] = y[psola.onset(y):]
    return MOVED[k]

def cast(chord, v, need):
    """who sings each note of a chord: chord is [(part, midi, how many)], need the seconds each must hold"""
    used = set(); out = []
    for part, n, many in chord:
        cands = []
        pool = PARTS[part] + [s for s in PARTS[NEXT[part]] if s not in PARTS[part]]   # a part short of singers borrows
        for s in pool:
            if s in used: continue
            for j, (a, b, m) in enumerate(notes_of(s, v)):
                if abs(n - m) <= 6.3 and b - a >= min(need, 1.4): cands.append((abs(n - m) + 0.15 * pool.index(s), s, j))
        best = {}
        for c in sorted(cands):
            if c[1] not in best: best[c[1]] = c
        pick = sorted(best.values())[:many]
        if len(pick) < min(2, many): raise SystemExit("not enough singers for %s %d on %s (need %.1f s): %s" % (part, n, v, need, pick))
        for _, s, j in pick: used.add(s); out.append((part, n, s, j))
    return out

def place(dst, y, at, pan, g):
    i = int(round(at * SR)); y = y[:max(0, dst.shape[1] - i)]
    th = (pan + 1) * np.pi / 4; dst[0, i:i + len(y)] += y * g * np.cos(th); dst[1, i:i + len(y)] += y * g * np.sin(th)

def hold_longer(y, n, secs):
    """a held note made longer from its own steady part, as world.py does for the erhu: the stretch from 0.6 s to just
    before its own fade is laid again and again, each time where its wave lines up best with what came before (searched
    over one wave), blended over 0.1 s, to secs seconds; then its own end"""
    W = int(0.05 * SR); env = np.array([np.sqrt(np.mean(y[a:a + W] ** 2)) for a in range(0, len(y) - W, W)])
    mid = np.median(env[int(0.4 * SR / W):max(int(0.4 * SR / W) + 2, int(len(env) * 0.85))])
    e = int(np.where(env >= 0.6 * mid)[0][-1]) * W
    A = int(0.6 * SR); Z = e - int(0.1 * SR); X = int(0.1 * SR); P = int(round(SR / (440 * 2 ** ((n - 69) / 12))))
    if Z - A < int(0.5 * SR): A = max(int(0.35 * SR), Z - int(0.5 * SR))
    if Z - A < 3 * X or Z >= secs * SR: return y
    out = y[:Z].copy()
    while len(out) < (secs - 0.5) * SR:
        tail = out[-X:]; best, bk = -2, A
        for k in range(A, A + P + 1):
            seg = y[k:k + X]; r = float(np.dot(tail, seg) / np.sqrt(np.dot(tail, tail) * np.dot(seg, seg) + 1e-20))
            if r > best: best, bk = r, k
        u = np.linspace(0, 1, X); seg = y[bk:Z]
        out = np.concatenate([out[:-X], out[-X:] * (1 - u) + seg[:X] * u, seg[X:]])
    u = np.linspace(0, 1, X); seg = y[Z - X:Z + int(0.5 * SR)]
    return np.concatenate([out[:-X], out[-X:] * (1 - u) + seg[:X] * u, seg[X:]])

def detune(y, cents):
    if abs(cents) < 0.5: return y
    r = 2 ** (cents / 1200); n = int(round(len(y) / r))
    return np.interp(np.arange(n) * r, np.arange(len(y)), y)

def env(n, hold, rel, swell=None, att=0.0):
    """1 for `hold` seconds, then a smooth release of `rel` seconds; swell=(from, seconds) rises from that level"""
    t = np.arange(n) / SR; e = np.ones(n)
    if att > 0: e *= np.clip(t / att, 0, 1) ** 1.5
    if swell: e *= swell[0] + (1 - swell[0]) * (0.5 - 0.5 * np.cos(np.pi * np.clip(t / swell[1], 0, 1)))
    r = np.clip((t - hold) / rel, 0, 1); e *= np.cos(np.pi / 2 * r) ** 2
    return e

def sing(dst, at, chord, v, hold, rel=0.25, swell=None, steady=False, part_at=None, tight=0.025):
    """one chord: every singer starts within `tight` s of `at` (or at part_at[part]), holds, then lets go"""
    need = hold + rel + (0.35 if steady else 0) + 0.05
    for part, n, s, j in cast(chord, v, need):
        y = moved(s, v, j, n)
        if len(y) < (need + 0.1) * SR: y = hold_longer(y, n, need + 0.6)
        if steady: k = int(0.35 * SR); y = y[k:]               # from the held part, not the singer's own start
        st = at + (part_at or {}).get(part, 0) + rng.uniform(0, tight)
        h = hold - (part_at or {}).get(part, 0)
        y = detune(y, rng.uniform(-7, 7))[:int((h + rel) * SR)]
        e = env(len(y), h, rel, swell, att=0.12 if steady else 0.0)
        g = 10 ** (rng.uniform(-1.5, 1.5) / 20) / np.sqrt(np.mean(y[:int(min(len(y), 0.6 * SR))] ** 2) + 1e-9)
        place(dst, y * e, st, PAN[s], g * 0.06)

# ── the room: a small church, 1.7 s, the same on every pad ───────────────────────────────────────────────────────
def room():
    n = int(2.2 * SR); t = np.arange(n) / SR; ir = np.zeros((2, n))
    for c in range(2):
        x = rng.standard_normal(n) * np.exp(-6.91 * t / 1.7)
        b, a = signal.butter(1, 4500 / (SR / 2)); x = signal.lfilter(b, a, x)
        x[:int(0.022 * SR)] = 0
        for d, g in ((0.011, 0.5), (0.017, 0.35), (0.023, 0.3), (0.031, 0.22)):
            x[int((d + 0.002 * c) * SR)] += g * 6
        ir[c] = x / np.sqrt(np.sum(x * x))
    return ir
IR = room()
def churched(dry, wet_db=-9.5):
    w = np.stack([signal.fftconvolve(dry[0], IR[0])[:dry.shape[1]], signal.fftconvolve(dry[1], IR[1])[:dry.shape[1]]])
    b, a = signal.butter(2, 150 / (SR / 2), "high"); w = signal.lfilter(b, a, w)
    return dry + w * (10 ** (wet_db / 20)) * np.sqrt(np.mean(dry ** 2) / (np.mean(w ** 2) + 1e-12))

def kweight(x):
    """K-weighted, as measure.inc and world.py's kw: a 60 Hz high-pass and a +4 dB shelf above 1.5 kHz; the loudest 400 ms"""
    def rbj(kind, f, q, db):
        A = 10 ** (db / 40); w = 2 * np.pi * f / SR; al = np.sin(w) / (2 * q); c = np.cos(w)
        if kind == "hp": b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]; a = [1 + al, -2 * c, 1 - al]
        else:
            sq = 2 * np.sqrt(A) * al
            b = [A * ((A + 1) + (A - 1) * c + sq), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - sq)]
            a = [(A + 1) - (A - 1) * c + sq, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - sq]
        return np.array(b) / a[0], np.array(a) / a[0]
    y = x.mean(axis=0) if x.ndim == 2 else x
    for k in (("hp", 60, 0.5, 0), ("shelf", 1500, 0.707, 4)): b, a = rbj(*k); y = signal.lfilter(b, a, y)
    n = int(0.4 * SR); q = np.concatenate([[0.0], np.cumsum(y * y)])
    return 10 * np.log10(np.max(q[n:] - q[:-n]) / n + 1e-12) if len(y) > n else 10 * np.log10(np.mean(y * y) + 1e-12)

# ── the chords (midi), in C ────────────────────────────────────────────────────────────────────────────────────────
def ch(*parts): return [(p, n, k) for p, n, k in parts]
C     = ch(("S", 72, 3), ("A", 67, 3), ("T", 64, 3), ("B", 48, 3))
F     = ch(("S", 72, 3), ("A", 69, 3), ("T", 65, 3), ("B", 53, 3))
Am7   = ch(("S", 76, 3), ("A", 72, 3), ("T", 67, 3), ("B", 45, 3))
FoG   = ch(("S", 72, 3), ("A", 69, 3), ("T", 65, 3), ("B", 43, 3))          # F over G: the gospel "sus" before home
Cmaj9 = ch(("S", 74, 2), ("S", 71, 2), ("A", 67, 3), ("T", 64, 3), ("B", 48, 3))
Fmaj9 = ch(("S", 76, 2), ("S", 79, 2), ("A", 69, 3), ("T", 64, 3), ("B", 53, 3))
C69   = ch(("S", 76, 2), ("S", 74, 2), ("A", 69, 3), ("T", 64, 2), ("T", 60, 1), ("B", 48, 3))
Dm9   = ch(("S", 76, 2), ("S", 72, 2), ("A", 69, 3), ("T", 65, 3), ("B", 50, 3))
CE    = ch(("S", 72, 3), ("A", 67, 3), ("T", 64, 3), ("B", 52, 3))
Fdim  = ch(("S", 72, 3), ("A", 69, 3), ("T", 63, 3), ("B", 54, 3))          # F sharp diminished 7
CG    = ch(("S", 72, 3), ("A", 67, 3), ("T", 64, 3), ("B", 55, 3))
BIGC  = ch(("S", 76, 2), ("S", 72, 2), ("A", 67, 3), ("T", 64, 2), ("T", 60, 2), ("B", 48, 3))
WOMEN = ch(("S", 79, 2), ("S", 74, 2), ("A", 72, 2), ("A", 67, 2))
MEN   = ch(("T", 60, 2), ("T", 55, 2), ("B", 48, 2), ("B", 43, 2))
HIGH  = ch(("S", 79, 3), ("S", 76, 3), ("A", 72, 3))

def pad(fn, secs):
    dst = np.zeros((2, int(secs * SR))); fn(dst); return dst
BEAT = 60 / 100      # the walk-up and the call move at 100 beats a minute
PADS = [   # label, reference (en, es), what it does
    ("Oh! · C",          ("Choir hit", "Golpe del coro"),          lambda d: sing(d, 0, C, "o", 0.42, 0.2)),
    ("Oh! · F",          ("Choir hit", "Golpe del coro"),          lambda d: sing(d, 0, F, "o", 0.42, 0.2)),
    ("Oh! · Am7",        ("Choir hit", "Golpe del coro"),          lambda d: sing(d, 0, Am7, "o", 0.42, 0.2)),
    ("Oh! · F/G",        ("Choir hit", "Golpe del coro"),          lambda d: sing(d, 0, FoG, "o", 0.42, 0.2)),
    ("Aah · Cmaj9",      ("Swell", "Crece"),                       lambda d: sing(d, 0, Cmaj9, "a", 2.3, 0.45, swell=(0.25, 1.6), steady=True)),
    ("Aah · Fmaj9",      ("Swell", "Crece"),                       lambda d: sing(d, 0, Fmaj9, "a", 2.3, 0.45, swell=(0.25, 1.6), steady=True)),
    ("Ooh · C6/9",       ("Soft pad", "Fondo suave"),              lambda d: sing(d, 0, C69, "u", 2.4, 0.5, steady=True)),
    ("Ooh · Dm9",        ("Soft pad", "Fondo suave"),              lambda d: sing(d, 0, Dm9, "u", 2.4, 0.5, steady=True)),
    ("Amen · F→C",       ("The Amen chords", "Los acordes del amén"), lambda d: (sing(d, 0, F, "a", 0.95, 0.12), sing(d, 0.98, C, "e", 1.6, 0.45))),
    ("Aah · B T A S",    ("One part at a time", "Una voz a la vez"), lambda d: sing(d, 0, C, "a", 2.7, 0.45, steady=True, part_at={"B": 0, "T": 0.45, "A": 0.9, "S": 1.35})),
    ("Ooh · women",      ("High voices", "Voces agudas"),          lambda d: sing(d, 0, WOMEN, "u", 2.0, 0.45, steady=True)),
    ("Oh · men",         ("Low voices", "Voces graves"),           lambda d: sing(d, 0, MEN, "o", 1.6, 0.4)),
    ("Ooh · C→C/G",      ("Walk-up, 100 BPM", "Subida, 100 BPM"),  lambda d: [sing(d, i * BEAT, X, "u", BEAT - 0.06 if i < 4 else 1.2, 0.1 if i < 4 else 0.45) for i, X in enumerate((C, CE, F, Fdim, CG))]),
    ("Oh! Oh! · F/G→C",  ("Call home, 100 BPM", "Llamada a casa, 100 BPM"), lambda d: (sing(d, 0, FoG, "o", 0.4, 0.15), sing(d, BEAT, C, "o", 0.9, 0.3))),
    ("Ee! · high",       ("High hit", "Golpe agudo"),              lambda d: sing(d, 0, HIGH, "i", 0.5, 0.25)),
    ("Aah · C, all",     ("The big ending", "El gran final"),      lambda d: sing(d, 0, BIGC, "a", 2.6, 0.7, swell=(0.55, 1.2))),
]
LENS = [1.6, 1.6, 1.6, 1.6, 4.0, 4.0, 4.0, 4.0, 4.0, 4.4, 3.6, 3.2, 4.4, 2.6, 1.8, 4.6]

TARGET = -17.0          # every pad as loud as the next (K-weighted, loudest 400 ms)
GAP = 0.45
out = [np.zeros((2, int(0.35 * SR)))]; t = 0.35; phrases = []
for (label, ref, fn), secs in zip(PADS, LENS):
    y = churched(pad(fn, secs))
    # its tail: the room rings out, then a short fade to silence
    nz = np.where(np.max(np.abs(y), axis=0) > np.max(np.abs(y)) * 10 ** (-60 / 20))[0]
    y = y[:, :min(y.shape[1], int(nz[-1]) + int(0.05 * SR))]
    fo = int(0.12 * SR); y[:, -fo:] *= np.linspace(1, 0, fo) ** 2
    y *= 10 ** ((TARGET - kweight(y)) / 20)
    pk = np.max(np.abs(y))
    if pk > 0.89: y *= 0.89 / pk
    print("%-18s %.2f s  peak %.2f  %.1f dB" % (label, y.shape[1] / SR, np.max(np.abs(y)), kweight(y)), flush=True)
    phrases.append([round(t, 3), round(y.shape[1] / SR, 3), label, ref[0], ref[1]])
    out.append(y); t += y.shape[1] / SR
    out.append(np.zeros((2, int(GAP * SR)))); t += GAP
rec = np.concatenate(out, axis=1)
fn = "39-gospel-choir.mp3"; path = os.path.join(OUT, fn)
pcm = np.ascontiguousarray(rec.T).astype(np.float32).tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-ar", str(OUTSR), "-c:a", "libmp3lame",
                "-b:a", "112k", "-id3v2_version", "3", "-metadata", "title=Gospel Choir", "-metadata", "artist=VocalSet singers (CC BY 4.0)",
                "-metadata", "comment=Made for Architecture of Grace from VocalSet (Wilkins, Seetharaman, Wahl, Pardo, 2018), CC BY 4.0.", path],
               input=pcm, check=True)
CUE = [0, 4, 6, 8, 9, 12, 13, 15]       # the Turntables' eight pads
entry = {"file": fn, "title": "Gospel Choir", "title_es": "Coro góspel", "bpm": 0, "kind": "gospel", "version": "VocalSet",
         "style": "Gospel choir samples, in C", "style_es": "Muestras de coro góspel, en Do", "bars": 0,
         "seconds": round(rec.shape[1] / SR, 1), "bytes": os.path.getsize(path),
         "line": "A gospel choir in C: hits, swells, the Amen chords and a walk-up. One sample on each pad.",
         "line_es": "Un coro góspel en Do: golpes, crescendos, los acordes del amén y una subida. Una muestra en cada pad.",
         "verses": [{"ref": phrases[i][3], "ref_es": phrases[i][4], "at": phrases[i][0], "text": phrases[i][2]} for i in CUE],
         "phrases": [p[:4] for p in phrases]}
json.dump(entry, open(os.path.join(HERE, "gospel-choir.json"), "w"), indent=1, ensure_ascii=False)
print(fn, entry["seconds"], "s", entry["bytes"], "bytes")
