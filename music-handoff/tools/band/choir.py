# The Band's choir (AOG-BAND-CHOIR-V1, 2026-10-27). Jimmy: "I only have 4 sound in the voices. I lost the choir voices as
# well." Two players for the Voices, Choir · "aah" (choir_aa) and Choir · "ooh" (choir_uu): a real choir on every note, sung
# by the twenty singers of VocalSet (Julia Wilkins, Prem Seetharaman, Alison Wahl and Bryan Pardo, ISMIR 2018), CC BY 4.0, as
# kept in github.com/mblackman/vocalset-vowel-voicebanks (source/vocalset/<singer>_long_straight_<a|u>.wav), the same
# recordings the Gospel Choir record is made from (aog-deploy/_work/gospel/make_choir.py).
#
# Each note, every three semitones from A2 to A5, is sung by up to six singers at once: the men alone below E3, the women
# alone above F#4, men and women together between. Each singer's nearest held note is moved to the note by TD-PSOLA
# (psola.py: the pitch moves, the vowel stays as sung; never more than 6.3 semitones, as the solo voices), made 5.4 s long from its own steady
# part (as world.py's hold_longer), a hair off the others (up to 6 cents and 30 ms, as a choir is), each as loud as the
# next. Every note is brought to one level (K-weighted, the loudest 400 ms in its first 2.6 s), and its last 0.4 s fades.
# Mono, 32 kHz, MP3 64 kbps, as the Band's other players: audio/band/<player>/<note>s.mp3. Each finished note is measured
# (tune.py) and the manifest corrects one 3 cents or more off. The manifest gets the two players (added, or replaced where
# they are); every other player stays exactly as it was.
#
# Run:  python3 choir.py <aog-deploy/audio/band> <folder with the VocalSet files> [player,player,...]   (only those)
import os, sys, json, subprocess, numpy as np
from scipy import signal
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import psola
SR = psola.SR; SRU = psola.SRU
BAND, SRC = sys.argv[1], sys.argv[2]
rng = np.random.default_rng(2027)
NOTES = list(range(45, 82, 3))
WOMEN = ["f%d" % i for i in range(1, 10)]; MEN = ["m%d" % i for i in range(1, 12)]

def midi(f): return 69 + 12 * np.log2(f / 440)
def sung_notes(x, fem):
    """the held notes of a VocalSet long tone: [(start s, end s, midi as sung)] (as world.py)"""
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
    return [r for r in joined if r[1] - r[0] >= 1.2]

def hold_longer(y, n, secs):
    """made longer from its own steady part (as world.py): laid again where its wave lines up, blended over 0.1 s"""
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

def kw(y):
    """K-weighted, as the tests' measure.inc: a 60 Hz high-pass and +4 dB above 1.5 kHz; the loudest 400 ms (dB)"""
    def rbj(kind, f, q, db):
        A = 10 ** (db / 40); w = 2 * np.pi * f / SR; al = np.sin(w) / (2 * q); c = np.cos(w)
        if kind == "hp": b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]; a = [1 + al, -2 * c, 1 - al]
        else:
            sq = 2 * np.sqrt(A) * al
            b = [A * ((A + 1) + (A - 1) * c + sq), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - sq)]
            a = [(A + 1) - (A - 1) * c + sq, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - sq]
        return np.array(b) / a[0], np.array(a) / a[0]
    for k in (("hp", 60, 0.5, 0), ("sh", 1500, 0.707, 4)): b, a = rbj(*k); y = signal.lfilter(b, a, y)
    n = int(0.4 * SR); q = np.concatenate([[0.0], np.cumsum(y * y)])
    return 10 * np.log10(np.max(q[n:] - q[:-n]) / n + 1e-12)

def onset(x, frac=0.03):
    pk = np.max(np.abs(x)); i = int(np.argmax(np.abs(x) > pk * frac)); return max(0, i - int(0.005 * SR))

LEN = 5.4; TARGET = -18.0
import tune
# AOG-BAND-CHOIR-V2 (2026-10-27; Jimmy chose more vowels, the women's and men's choirs, and the choir in the Piano room):
# player, vowel, who sings, notes. "mixed" is the men below E3, the women above F#4, both between.
PLAYERS = [("choir_aa", "a", "mixed", NOTES), ("choir_uu", "u", "mixed", NOTES), ("choir_oh", "o", "mixed", NOTES),
           ("choir_eh", "e", "mixed", NOTES), ("choir_ee", "i", "mixed", NOTES),
           ("choir_w", "a", "women", list(range(54, 82, 3))), ("choir_m", "o", "men", list(range(42, 70, 3)))]
ONLY = sys.argv[3].split(",") if len(sys.argv) > 3 else None
def heard(y, n):
    h, sp, cnt = tune.heard(y, n, "held")
    return h if h is not None else (tune.finalize_yin(y, n) - n) * 100
made = {}; tunes_of = {}
for player, v, who, NOTES_P in PLAYERS:
    if ONLY and player not in ONLY: continue
    rng = np.random.default_rng(sum(map(ord, player)))          # each choir its own, the same every time it is made
    notes = {}; raw = {}
    for s in WOMEN + MEN:
        f = os.path.join(SRC, "%s_long_straight_%s.wav" % (s, v))
        if not os.path.exists(f): continue
        notes[s] = sung_notes(psola.load(f, SR), s.startswith("f")); raw[s] = psola.load(f, SRU)
    d = os.path.join(BAND, player); os.makedirs(d, exist_ok=True)
    tunes = {}
    for n in NOTES_P:
        pool = WOMEN if who == "women" else MEN if who == "men" else MEN if n < 52 else WOMEN if n > 66 else WOMEN + MEN
        cands = []
        for s in pool:
            for j, (a, b, m) in enumerate(notes.get(s, [])):
                if abs(n - m) <= 6.3: cands.append((abs(n - m) - 0.002 * (b - a), s, j))
        best = {}
        for c in sorted(cands):
            if c[1] not in best: best[c[1]] = c
        pick = sorted(best.values())[:6]
        if len(pick) < 3: raise SystemExit("%s %d: only %d singers" % (player, n, len(pick)))
        mix = np.zeros(int((LEN + 0.2) * SR))
        for _, s, j in pick:
            a, b, m = notes[s][j]; xs = raw[s]
            seg = xs[int(max(0, a - 0.06) * SRU):int((b + 0.12) * SRU)]
            seg = np.concatenate([np.zeros(int(2.5 * SRU / (440 * 2 ** ((m - 69) / 12)))), seg[psola.onset(seg, SRU):]])
            cents = rng.uniform(-6, 6) / 100
            y = psola.down(psola.psola(seg, m, n - m + cents)); y = y[onset(y):]
            y = hold_longer(y, n, LEN + 0.6)[:int((LEN + 0.15) * SR)]
            y = y / (np.sqrt(np.mean(y[:int(2.0 * SR)] ** 2)) + 1e-9) * 10 ** (rng.uniform(-1, 1) / 20)
            at = int(rng.uniform(0, 0.03) * SR); mix[at:at + len(y)] += y[:len(mix) - at]
        # in tune as heard (tune.py): the whole note moved by the cents it is off, so every room plays it true
        c = heard(mix[:int(LEN * SR)], n)
        if abs(c) >= 0.5:
            r = 2 ** (-c / 1200); mix = np.interp(np.arange(int(LEN * SR)) * r, np.arange(len(mix)), mix)   # read slower to lower a sharp note
        mix = mix[:int(LEN * SR)]
        mix *= 10 ** ((TARGET - kw(mix[:int(2.6 * SR)])) / 20)
        pk = np.max(np.abs(mix))
        if pk > 0.95: mix *= 0.95 / pk
        fo = int(0.4 * SR); mix[-fo:] *= np.linspace(1, 0, fo) ** 2; fi = int(0.002 * SR); mix[:fi] *= np.linspace(0, 1, fi)
        path = os.path.join(d, "%ds.mp3" % n)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-codec:a", "libmp3lame", "-b:a", "64k",
                        path], input=mix.astype(np.float32).tobytes(), check=True)
        h = int(round(heard(psola.load(path, SR), n)))
        if abs(h) >= 3: tunes["%ds" % n] = h               # what is still off, the page corrects
        print("%s %d: %s · was %+.0f cents, now %+d" % (player, n, " ".join("%s%+.1f" % (s, n - notes[s][j][2]) for _, s, j in pick), c, h), flush=True)
    made[player] = NOTES_P; tunes_of[player] = tunes

man = json.load(open(os.path.join(BAND, "manifest.json")), object_pairs_hook=dict)
for player, sus in made.items():
    man[player] = {"sus": sus, "susL": [], "stac": [], "tune": tunes_of[player], "lvl": {}}
open(os.path.join(BAND, "manifest.json"), "w").write(json.dumps(man))   # as the file is kept (default spacing)
print("manifest: %s" % ", ".join(made))
