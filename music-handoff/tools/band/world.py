# The Band's world instruments and solo voices (AOG-BAND-WORLD-V1, 2026-10-13). Jimmy: "DO them all." A sitar, a koto,
# an erhu, a pan flute, a didgeridoo, and a singer's "oohs and aahs" (a woman and a man).
#
# What is a recording, and from where (every one free to share; nothing non-commercial, nothing unknown):
#   sitar      Dr. Narayan Bhagawan Raikar's sitar, 26 plucked notes, CC0 1.0, in the Discord SFZ GM Bank
#              (github.com/sfzinstruments/Discord-SFZ-GM-Bank, "Discord GM/Melodic/105-Sitar/Str01.flac" … Str26)
#   erhu       "AliExpress Erhu" by D. Smolken (Karoryfer Samples), CC0 1.0 (github.com/sfzinstruments/aliexpress-erhu,
#              Samples/sus/*_rr1.wav and Samples/stac/*_rr1.wav)
#   didgeridoo the Versilian Community Sample Library (VCSL, Versilian Studios), CC0 1.0 (github.com/sgossner/VCSL,
#              "Aerophones/Lip Aerophones/Didgeridoo/Didgeridoo1_Sus2_Main.wav" and "…_Phrase8_Main.wav")
#   voices     VocalSet (Julia Wilkins, Prem Seetharaman, Alison Wahl and Bryan Pardo, ISMIR 2018), CC BY 4.0: the
#              "long straight" vowels "a" and "u" of singer f8 (a mezzo-soprano) and m6 (a baritone), as kept in
#              github.com/mblackman/vocalset-vowel-voicebanks ("source/vocalset/f8_long_straight_a.wav" …)
# What is made here, because no recording we may share was found (the page says so):
#   koto       a plucked-string model (a waveguide string plucked near the bridge with a pick, a bright decay, a slight
#              pitch fall as the string settles, and the body's wood), 13 notes
#   panflute   a stopped-pipe model (a hollow, mostly odd-harmonic tone, the breath around it, a soft "t" at the start,
#              a slow breath vibrato), 12 notes
#
# Get the recordings (only these files; the libraries are large), e.g. with a blobless sparse clone of each repository,
# then copy them into one folder laid out as:
#   <src>/sitar/Str01.flac … Str26.flac
#   <src>/erhu_sus/erhu_<note>_sus_rr1.wav (and rr2, unused)   <src>/erhu_stac/erhu_<note>_stac_rr1.wav (rr2-4 unused)
#   <src>/didg/Didgeridoo1_Sus2_Main.wav, Didgeridoo1_Phrase8_Main.wav
#   <src>/vocalset/f8_long_straight_a.wav, f8_long_straight_u.wav, m6_long_straight_a.wav, m6_long_straight_u.wav
#   python3 world.py <aog-deploy/audio/band> <src>
#
# Players (audio/band/<player>/<note>s.mp3, short notes <note>t.mp3), made the way bagpipes.py and sax2.py made theirs:
#   sitar              every plucked note as recorded (26, C2 to G5); one microphone (the two channels are the same);
#                      the quiet before the pick trimmed; it rings until it has died away by 50 dB, at most 6 s
#   erhu               held notes (20, D4 to A5) and short notes (20) from the louder channel (the close pair is out of
#                      phase: added together, a note could lose 20 dB in one band); the page adds the vibrato (as the
#                      library's own instrument does) and, for "with slides", a slide up into each note
#   koto, panflute     made here, every three semitones (koto C3 to C6, pan flute G3 to E6)
#   didgeridoo         the steady drone (Sus2, from 0.6 s), one microphone, made into a held note on G#1, B1, D2 and F2
#                      by changing its speed (never more than 5 semitones), so the keys reach every home note, 7 s
#   didgeridoo_rhythm  the same, from the rhythmic phrase (Phrase8: the player's breath and voice pulse in the drone), 11.5 s
#   voice_f_aa/uu      singer f8's three held notes on each vowel (C4, C5, F5 as sung), moved by TD-PSOLA (psola.py: the
#   voice_m_aa/uu      pitch moves, the vowel stays as sung) to every three semitones, never more than 6.3 semitones:
#                      the woman A3 to A5, the man A2 to F#4; each keeps its note's own start, held part and end
# - levels: held notes by their loudest 0.4 s in the first 2.5 s (-18 dB), plucks by their loudest 0.15 s (-21 dB), as
#   process2.py; if a player's peak would pass 0.95, its notes come down together
# - mono, 32 kHz, MP3 64 kbps (short notes 80 kbps)
# - tuning: every finished file is measured (tune.py) and the manifest corrects each one 3 cents or more off, as sax2.py
# - the manifest: these players are written into audio/band/manifest.json (added, or replaced where they are); every
#   other player stays exactly as it was. Re-run this after a merge touches the manifest: it puts its players back.
import os, re, sys, json, shutil, subprocess, numpy as np
from scipy import signal
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tune, psola
SR = 32000
BAND = sys.argv[1]; SRC = sys.argv[2]
ONLY = sys.argv[3].split(",") if len(sys.argv) > 3 else None
PC = {"c": 0, "db": 1, "d": 2, "eb": 3, "e": 4, "f": 5, "gb": 6, "g": 7, "ab": 8, "a": 9, "bb": 10, "b": 11}

def load(path, ch=None, sr=SR):
    """mono at sr; ch picks one channel (0 left, 1 right), else the two are averaged"""
    af = ["-af", "pan=mono|c0=c%d" % ch] if ch is not None else ["-ac", "1"]
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path] + af + ["-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).astype(np.float64)
def onset(x, sr=SR, frac=0.03):
    pk = np.max(np.abs(x)); i = int(np.argmax(np.abs(x) > pk * frac)); return max(0, i - int(0.005 * sr))
def loudest(x, w):
    """the loudest stretch of w seconds (RMS), by a running sum"""
    n = int(w * SR); q = np.concatenate([[0.0], np.cumsum(x * x)])
    if len(x) <= n: return float(np.sqrt(q[-1] / max(1, len(x)) + 1e-12))
    return float(np.sqrt(np.max(q[n:] - q[:-n]) / n + 1e-12))
def ring_end(x, most):
    """where a pluck has died away by 50 dB (or `most` seconds)"""
    n = int(0.05 * SR); q = np.concatenate([[0.0], np.cumsum(x * x)]); env = np.sqrt(np.maximum(q[n:] - q[:-n], 0) / n + 1e-12); top = np.max(env)
    k = np.where(env > top * 10 ** (-50 / 20))[0]; end = int(k[-1]) if len(k) else len(x)
    return min(end, int(most * SR), len(x))
def speed(x, semis):
    """the same recording played faster or slower (as a tape would), band-limited, so its pitch moves by `semis`"""
    r = 2 ** (semis / 12); return signal.resample(x, int(round(len(x) / r)))
def midi(f): return 69 + 12 * np.log2(f / 440)

# ── the koto and the pan flute, made here ──────────────────────────────────────────────────────────────────────────
def koto(m, dur=5.0, seed=1):
    """a waveguide string: a delay line one period long, a gentle loss filter (bright: the highs fade slowly), plucked
    a twelfth of the way from the bridge with a hard pick; the string settles a few cents flat of where it starts; the
    wood of the long body colours it (a few broad resonances); the far side of the bridge rings very softly with it"""
    rng = np.random.default_rng(1000 + m + seed)
    fs = SR * 2; f0 = 440 * 2 ** ((m - 69) / 12); N = int(dur * fs)
    # the pick: a short, bright burst, shaped by where it strikes (a comb a twelfth of the string)
    P = fs / f0; L = int(P)
    burst = rng.standard_normal(L) * np.hanning(L) ** 0.3
    pos = max(1, int(P / 12)); burst = burst - np.concatenate([np.zeros(pos), burst[:-pos]])
    b, a = signal.butter(1, min(0.95, 9000 / (fs / 2)), "low"); burst = signal.lfilter(b, a, burst); burst -= np.mean(burst)
    exc = np.zeros(N); exc[:L] = burst
    # decay: T60 from about 6 s (low) to 2.2 s (high); the loss filter (a two-point average) keeps the highs bright
    t60 = np.interp(m, [48, 84], [6.0, 2.2]); g = 10 ** (-3 / (t60 * f0))
    bw = float(np.interp(m, [48, 84], [0.12, 0.06]))         # its weight on the sample before: the smaller, the brighter
    # a hard pick stretches the string: it starts 9 cents sharp and settles within 40 ms (the delay line shortens a little)
    n_ = np.arange(N); D = P / 2 ** (9.0 * np.exp(-n_ / (0.04 * fs)) / 1200) - bw
    # the fraction of a sample is a first-order all-pass (it keeps the highs, where a straight-line read would dull them)
    y = np.zeros(N); ap = 0.0; ap1 = 0.0
    for n in range(N):
        Di = int(D[n]); fr = D[n] - Di
        if fr < 0.1: Di -= 1; fr += 1.0
        a = (1 - fr) / (1 + fr); k = n - Di
        u0 = y[k] if k >= 0 else 0.0; u1 = y[k - 1] if k >= 1 else 0.0
        v = a * u0 + u1 - a * ap; ap1, ap = ap, v
        y[n] = exc[n] + g * ((1 - bw) * v + bw * ap1)
    # the body: broad wooden resonances, and the bridge's far side, a quiet ring an octave and a fifth up
    body = np.zeros_like(y)
    for fc, q, gdb in ((190, 3.0, 4.0), (420, 3.5, 3.0), (980, 2.5, 2.0), (2300, 2.0, 1.5)):
        bb, aa = signal.iirpeak(fc / (fs / 2), q); body += signal.lfilter(bb, aa, y) * (10 ** (gdb / 20) - 1)
    y = y + 0.6 * body
    t = np.arange(N) / fs
    far = 0.035 * np.sin(2 * np.pi * f0 * 3 * t) * np.exp(-t / 1.4) * (1 - np.exp(-t / 0.05))
    y = y + far * np.max(np.abs(y))
    y = signal.resample_poly(y, 1, 2)
    return y
def panflute(m, dur=5.0, seed=1):
    """a stopped pipe: the fundamental strong, the odd harmonics under it (a closed pipe), a trace of the even ones;
    breath noise around the note's own pitch and a soft hiss above, strongest as the note starts; a "t" of air at the
    start; the pitch rises the last few cents into place; a slow, gentle breath vibrato after the start"""
    rng = np.random.default_rng(2000 + m + seed)
    N = int(dur * SR); t = np.arange(N) / SR; f0 = 440 * 2 ** ((m - 69) / 12)
    att = 1 - np.exp(-t / 0.045)
    rel = np.ones(N)
    # the breath: a slow wander of the level (about 1 dB) and, after 0.5 s, a gentle vibrato (4.6 Hz, 7 cents)
    wander = signal.lfilter(*signal.butter(2, 1.2 / (SR / 2)), rng.standard_normal(N)); wander /= (np.std(wander) + 1e-9)
    lev = 10 ** (0.6 * wander / 20)
    vib_amt = np.clip((t - 0.5) / 0.6, 0, 1) * 7.0
    scoop = -22.0 * np.exp(-t / 0.05)
    cents = scoop + vib_amt * np.sin(2 * np.pi * 4.6 * t)
    ph = 2 * np.pi * np.cumsum(f0 * 2 ** (cents / 1200)) / SR
    hm = {1: 1.0, 2: 0.045, 3: 0.16, 4: 0.015, 5: 0.05, 7: 0.018, 9: 0.007}
    top = SR / 2 * 0.9
    tone = sum(a * np.sin(k * ph) for k, a in hm.items() if k * f0 < top)
    noise = rng.standard_normal(N)
    bb, aa = signal.iirpeak(min(0.98, f0 / (SR / 2)), 6.0); breath = signal.lfilter(bb, aa, noise); breath /= (np.std(breath) + 1e-9)
    hb, ha = signal.butter(2, min(0.98, 2500 / (SR / 2)), "high"); hiss = signal.lfilter(hb, ha, noise); hiss /= (np.std(hiss) + 1e-9)
    chiff_env = np.exp(-t / 0.03) * (1 - np.exp(-t / 0.002))
    cb, ca = signal.butter(2, [min(0.97, f0 * 2 / (SR / 2)), min(0.98, f0 * 6 / (SR / 2))], "band"); chiff = signal.lfilter(cb, ca, noise); chiff /= (np.std(chiff) + 1e-9)
    air = 0.10 + 0.25 * np.exp(-t / 0.12)
    y = (tone * att * lev) + breath * 0.075 * air / 0.10 * att * lev + hiss * 0.018 * (0.6 + 0.4 * np.exp(-t / 0.2)) * lev + chiff * 0.22 * chiff_env
    return y * rel

# ── the voices: PSOLA from the sung notes ──────────────────────────────────────────────────────────────────────────
def sung_notes(x, fem):
    """the three held notes of a VocalSet long tone: [(start s, end s, midi as sung)]"""
    fmin, fmax = (150, 1000) if fem else (70, 500)
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
    # notes split by a wobble join again (the same pitch, a short gap)
    joined = []
    for r in res:
        if joined and abs(joined[-1][2] - r[2]) < 0.4 and r[0] - joined[-1][1] < 0.4: joined[-1] = (joined[-1][0], r[1], (joined[-1][2] + r[2]) / 2)
        else: joined.append(r)
    return joined
VOICES = {   # player: (file, singer is a woman, the notes to make)
    "voice_f_aa": ("f8_long_straight_a.wav", True, list(range(57, 82, 3))),
    "voice_f_uu": ("f8_long_straight_u.wav", True, list(range(57, 82, 3))),
    "voice_m_aa": ("m6_long_straight_a.wav", False, list(range(45, 67, 3))),
    "voice_m_uu": ("m6_long_straight_u.wav", False, list(range(45, 67, 3))),
}

# ── making the files ───────────────────────────────────────────────────────────────────────────────────────────────
made = {}      # player: [(note, kind "s"/"t", array, measure "held"/"pluck"/"short", level target)]
def add(inst, n, k, x, meas):
    made.setdefault(inst, []).append([n, k, x, meas])
def want(inst): return ONLY is None or inst in ONLY

if want("sitar"):
    NOTES = [36, 38, 40, 41, 43, 45, 47, 48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79]
    for i, n in enumerate(NOTES, 1):
        x = load(os.path.join(SRC, "sitar", "Str%02d.flac" % i), 0); x = x[onset(x):]
        x = x[:ring_end(x, 6.0)]; add("sitar", n, "s", x, "pluck")
if want("erhu"):
    for kind, sub, k in (("sus", "erhu_sus", "s"), ("stac", "erhu_stac", "t")):
        for f in sorted(os.listdir(os.path.join(SRC, sub))):
            mt = re.match(r"erhu_([a-g]b?)(\d)_%s_rr1\.wav$" % kind, f)
            if not mt: continue
            n = 12 * int(mt.group(2)) + PC[mt.group(1)]          # the library names D4 "d5"
            x = load(os.path.join(SRC, sub, f), 1); x = x[onset(x):]
            x = x[:int((5.0 if k == "s" else 0.9) * SR)]
            add("erhu", n, k, x, "held" if k == "s" else "short")
if want("koto"):
    for n in range(48, 85, 3): add("koto", n, "s", koto(n), "pluck")
if want("panflute"):
    for n in range(55, 89, 3): add("panflute", n, "s", panflute(n), "held")
for inst, fn, start, length in (("didgeridoo", "Didgeridoo1_Sus2_Main.wav", 0.6, 7.0), ("didgeridoo_rhythm", "Didgeridoo1_Phrase8_Main.wav", 0.15, 11.5)):
    if not want(inst): continue
    x = load(os.path.join(SRC, "didg", fn), 0); x = x[onset(x):]
    x = x[int(start * SR):]
    h, _, _ = tune.heard(x, 37, "held"); m0 = 37 + (h or 0) / 100
    for n in (32, 35, 38, 41):
        y = speed(x, n - m0)[:int(length * SR)]
        fi = int(0.06 * SR); y[:fi] *= np.linspace(0, 1, fi) ** 2       # the drone was cut from its middle: a soft start
        add(inst, n, "s", y, "held")
for inst, (fn, fem, targets) in VOICES.items():
    if not want(inst): continue
    raw = load(os.path.join(SRC, "vocalset", fn), None)
    notes = sung_notes(raw, fem)
    print(inst, "sung:", " ".join("%.2f-%.2fs %.2f" % r for r in notes))
    xs = psola.load(os.path.join(SRC, "vocalset", fn), psola.SRU)
    for n in targets:
        a, b, m = min(notes, key=lambda r: abs(r[2] - n))
        seg = xs[int(max(0, a - 0.06) * psola.SRU):int((b + 0.15) * psola.SRU)]
        seg = np.concatenate([np.zeros(int(2.5 * psola.SRU / (440 * 2 ** ((m - 69) / 12)))), seg[psola.onset(seg, psola.SRU):]])   # room for the first cycles
        y = psola.down(psola.psola(seg, m, n - m)) if abs(n - m) > 0.02 else psola.down(seg)
        y = y[onset(y):]
        print("   %-11s %d from %.2f (%+.2f semitones), %.2f s" % (inst, n, m, n - m, len(y) / SR))
        add(inst, n, "s", y[:int(5.0 * SR)], "held")

TARGET = {"held": -18.0, "pluck": -21.0, "short": -17.0}
for inst, rows in made.items():
    for r in rows:
        x = r[2]; meas = r[3]
        lv = loudest(x[:int(2.5 * SR)], 0.4) if meas == "held" else loudest(x, 0.15)
        r.append(10 ** ((TARGET[meas] - 20 * np.log10(lv)) / 20))
    room = min(20 * np.log10(0.95 / max(1e-6, np.max(np.abs(r[2])) * r[4])) for r in rows)
    shift = min(0.0, room)
    d = os.path.join(BAND, inst)
    if os.path.isdir(d): shutil.rmtree(d)
    os.makedirs(d)
    for r in rows:
        n, k, x, meas, g = r
        x = x * g * 10 ** (shift / 20)
        fo = int((0.4 if meas == "held" else 0.3 if meas == "pluck" else 0.1) * SR); fo = min(fo, len(x) // 3)
        x = x.copy(); x[-fo:] *= np.linspace(1, 0, fo) ** 2
        fi = int(0.002 * SR); x[:fi] *= np.linspace(0, 1, fi)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-codec:a", "libmp3lame",
                        "-b:a", "80k" if meas == "short" else "64k", os.path.join(d, "%d%s.mp3" % (n, k))], input=x.astype(np.float32).tobytes(), check=True)
    print("%-18s brought down %.1f dB so every peak stays under 0.95" % (inst, -shift))

# the tuning, measured on the finished files, and the manifest
man = json.load(open(os.path.join(BAND, "manifest.json")), object_pairs_hook=dict)
for inst, rows in made.items():
    tunes = {}; sus = sorted(r[0] for r in rows if r[1] == "s"); stac = sorted(r[0] for r in rows if r[1] == "t")
    for n, k, x, meas, g in sorted(rows, key=lambda r: (r[1], r[0])):
        y = load(os.path.join(BAND, inst, "%d%s.mp3" % (n, k)))
        kind = "held" if meas == "held" else "pluck"
        h, sp, cnt = tune.heard(y, n, kind)
        if h is None: h = (tune.finalize_yin(y, n) - n) * 100
        c = int(round(h))
        if abs(c) >= 3: tunes["%d%s" % (n, k)] = c
        print("%-18s %3d%s  %+5.0f cents%s" % (inst, n, k, h, "  (corrected)" if abs(c) >= 3 else ""))
    man[inst] = {"sus": sus, "susL": [], "stac": stac, "tune": tunes}
with open(os.path.join(BAND, "manifest.json"), "w") as fh: json.dump(man, fh, separators=(",", ":"))
for inst in made:
    d = os.path.join(BAND, inst); print(inst, len(os.listdir(d)), "files,", round(sum(os.path.getsize(os.path.join(d, f)) for f in os.listdir(d)) / 1024), "KB")
