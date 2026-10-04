# -*- coding: utf-8 -*-
"""AOG-STRINGS-REAL-V1 (2026-10-04) — the guitar's recorded sets, from the free (CC0) libraries to aog-deploy/audio/guitar/.

Jimmy: "Can we get real instrument sounds for the guitar and bass?"

  python3 build_guitar_sets.py <sources> [set ...]

<sources> holds the clones (git clone --depth 1):
  bg/      https://github.com/sfzinstruments/karoryfer.black-and-green-guitars   (CC0; LICENSE)
           (that repository's .gitattributes says "* text eol=crlf", which breaks every WAV on checkout: put "* -text"
           in bg/.git/info/attributes and check the Samples out again)
  martin/  the 15 WAVs of "026-Acoustic Guitar (steel)" from https://github.com/sfzinstruments/Discord-SFZ-GM-Bank
           (a 2017 Martin HD28 by Jeff Learman; "License: Creative Commons CC0" in its .sfz, as that bank's README says)
  nylon/   https://github.com/freepats/spanish-classical-guitar   (CC0; LICENSE and README)

The format (shared with the bass sets): each set is aog-deploy/audio/guitar/<id>/ with set.json and mono MP3s
(44.1 kHz, 128 kbps). Each file starts at the pluck (at most 2 ms before it), keeps its natural decay up to a length
that fits the note (never more than 6 s) and ends with a 30 ms fade. The loudness steps between velocity layers stay;
within a layer every zone is brought to one loudness. In set.json: m = the note recorded, c = cents off it (measured,
YIN), s = string (null: these libraries were recorded note by note, not string by string), v = velocity layer
(1 = softest), r = round robin, k = sus | stac, g = a linear trim; vel = each layer's lower bound on the page's 0-1
velocity; noise = release noises.
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "..", "..", "aog-deploy", "audio", "guitar"))
TUNING = [40, 45, 50, 55, 59, 64]


# ── audio ────────────────────────────────────────────────────────────────────────────────────────────────────────
def load(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).astype(np.float64)


def db(x):
    return 20 * np.log10(np.maximum(1e-12, x))


def env(x, win=0.01):
    n = int(win * SR)
    m = len(x) // n
    return np.sqrt(np.mean(x[:m * n].reshape(m, n) ** 2, axis=1) + 1e-24)


def onset(x):
    """the pluck: where the string starts to sound. A pick (or a nail) first presses the string for 10 to 40 ms, a quiet
    scrape 22 to 45 dB under the note, before it lets the string go; a file that started there played its note that late.
    So: the first millisecond as loud as 18 dB under the loudest sample of the first 300 ms, and in it the first sample
    within 20 dB of that (the scrape's own peaks stay under it)"""
    pk = np.max(np.abs(x[:int(0.3 * SR)]))
    w = int(0.001 * SR)
    cs = np.concatenate([[0.0], np.cumsum(x * x)])
    e = np.sqrt((cs[w:] - cs[:-w]) / w)
    k = int(np.argmax(e >= pk * 10 ** (-18 / 20)))
    seg = np.abs(x[k:k + w])
    return k + int(np.argmax(seg >= pk * 0.1))


def first_sound(x):
    """the first sample above 2% of the loudest"""
    pk = np.max(np.abs(x))
    return int(np.argmax(np.abs(x) > pk * 0.02))


def yin(x, t, f0):
    P0 = SR / f0
    lo, hi = int(P0 / 1.08), int(np.ceil(P0 * 1.08))
    W = int(np.ceil(P0 * 3))
    a = int(t * SR)
    if a + W + hi + 2 > len(x):
        return float("nan")
    seg = x[a:a + W + hi + 2]
    D = np.array([0.0] + [np.dot(seg[:W] - seg[tau:tau + W], seg[:W] - seg[tau:tau + W]) for tau in range(1, hi + 2)])
    C = np.ones(hi + 2)
    run = 0.0
    for tau in range(1, hi + 2):
        run += D[tau]
        C[tau] = D[tau] * tau / (run or 1e-20)
    best = lo + int(np.argmin(C[lo:hi + 1]))
    y0, y1, y2 = C[best - 1], C[best], C[best + 1]
    den = y0 - 2 * y1 + y2
    return SR / (best + (0.5 * (y0 - y2) / den if den > 0 else 0))


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def cents(x, m, t0, t1, step=0.02):
    """the median pitch over t0..t1 seconds after the start, in cents against note m"""
    out = []
    t = t0
    while t <= t1:
        f = yin(x, t, mtof(m))
        if f == f:
            out.append(1200 * np.log2(f / mtof(m)))
        t += step
    return float(np.median(out)) if out else float("nan"), (float(np.min(out)), float(np.max(out))) if out else (0, 0)


def rms(x, a, b):
    s = x[int(a * SR):int(b * SR)]
    return float(np.sqrt(np.mean(s * s) + 1e-24))


def trim(x, cap, floor_db=-55.0, fade_in=0.0005, at=None):
    """from 1.5 ms before the pluck to where the note has died away (floor_db under its loudest) or cap seconds, with a
    fade in over the quiet moment before the pluck (1 ms at most; fade_in seconds when a recording starts right on the
    pluck, so its first sample is never a click) and a 30 ms fade out. at: where the pluck is, when not found by onset()
    (a release noise has no pluck: its first sound, 2% of its loudest)"""
    o = onset(x) if at is None else at(x)
    a = max(0, o - int(0.0015 * SR))
    y = x[a:].copy()
    e = db(env(y) / np.max(env(y)))
    alive = np.where(e > floor_db)[0]
    n = min(len(y), int(cap * SR), int(((alive[-1] + 1) if len(alive) else len(e)) * 0.01 * SR) + int(0.03 * SR))
    y = y[:n]
    fi = max(min(int(0.001 * SR), o - a), int(fade_in * SR))
    if fi > 1:
        y[:fi] *= 0.5 - 0.5 * np.cos(np.pi * np.arange(fi) / fi)
    fo = int(0.03 * SR)
    y[-fo:] *= 0.5 + 0.5 * np.cos(np.pi * np.arange(fo) / fo)
    return y


def loop_out(x, ls, le, cap):
    """a looped recording (the Martin): the recording up to its loop, then the loop played on and fading at the rate the
    note was already fading in the second before it, so the note rings out as the library's own player would ring it"""
    head = x[:le + 1]
    e = db(env(x[max(0, ls - SR):ls]))
    t = np.arange(len(e)) * 0.01
    slope = np.polyfit(t, e, 1)[0] if len(e) > 10 else -8.0
    slope = float(np.clip(slope, -30.0, -3.0))       # dB a second
    need = int(cap * SR) + SR
    loop = x[ls:le + 1]
    parts = [head]
    total = len(head)
    while total < need:
        parts.append(loop)
        total += len(loop)
    y = np.concatenate(parts)[:need]
    g = np.ones(len(y))
    tt = (np.arange(len(y)) - ls) / SR
    g[ls:] = 10 ** (slope * tt[ls:] / 20)
    return y * g, slope


def encode(y, path):
    with tempfile.NamedTemporaryFile(suffix=".f32", delete=False) as f:
        f.write(y.astype(np.float32).tobytes())
        tmp = f.name
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", tmp,
                    "-c:a", "libmp3lame", "-b:a", "128k", "-ar", str(SR), "-ac", "1", path], check=True)
    os.unlink(tmp)


# ── the sets ─────────────────────────────────────────────────────────────────────────────────────────────────────
NAMES = {"c": 0, "db": 1, "d": 2, "eb": 3, "e": 4, "f": 5, "gb": 6, "g": 7, "ab": 8, "a": 9, "bb": 10, "b": 11}


def bg_name(m):
    """Black And Green Guitars name their notes an octave up: twang_e3 is MIDI 40"""
    inv = {v: k for k, v in NAMES.items()}
    return "%s%d" % (inv[m % 12], m // 12)


def cap_for(m):
    """how long a note may ring: the low strings longest (seconds)"""
    return 4.6 if m < 50 else 3.8 if m < 62 else 3.0 if m < 70 else 2.4


def kw_db(x):
    """K-weighted loudness, the loudest 400 ms of the first 1.5 s (as the page's level check hears a strum)"""
    from scipy.signal import lfilter
    from math import tan, pi
    f0, G, Q = 1681.974450955533, 3.999843853973347, 0.7071752369554196
    K = tan(pi * f0 / SR); Vh = 10 ** (G / 20); Vb = Vh ** 0.4996667741545416; a0 = 1 + K / Q + K * K
    y = lfilter([(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0], [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0], x[:int(1.5 * SR)])
    f0, Q = 38.13547087602444, 0.5003270373238773
    K = tan(pi * f0 / SR); a0 = 1 + K / Q + K * K
    y = lfilter([1, -2, 1], [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0], y)
    W = min(int(0.4 * SR), len(y)); cs = np.concatenate([[0], np.cumsum(y * y)])
    return 10 * np.log10(max((cs[s + W] - cs[s]) / W for s in range(0, len(y) - W + 1, int(0.01 * SR))) + 1e-12)


def centroid(x, a=0.0, b=0.3):
    s = x[int(a * SR):int(b * SR)]
    S = np.abs(np.fft.rfft(s * np.hanning(len(s)))) ** 2
    f = np.fft.rfftfreq(len(s), 1 / SR)
    return float(np.sum(S * f) / np.sum(S + 1e-30))


def choose(cands, n):
    """the n takes of a note that sound most alike (brightness and loudness, once levelled), near the note's usual
    brightness: a strum that comes round again then sounds like the same player, never a copy"""
    import itertools
    feats = []
    for r, y in cands:
        yy = y / rms(y, 0.0115, 0.2615)
        feats.append((r, np.log2(centroid(yy)), kw_db(yy)))
    if len(feats) <= n:
        return [f[0] for f in feats]
    med = float(np.median([f[1] for f in feats]))
    best = None
    for combo in itertools.combinations(feats, n):
        cs = [f[1] for f in combo]; ks = [f[2] for f in combo]
        score = (max(cs) - min(cs)) + (max(ks) - min(ks)) / 2 + 0.5 * abs(float(np.mean(cs)) - med)
        if best is None or score < best[0]:
            best = (score, [f[0] for f in combo])
    return sorted(best[1])


def build_bg(src, color, out, name, rr_top=67):
    """green or black: 15 zones three half steps apart (E2 to B♭5), mf and f, two takes up to rr_top (the two of the
    library's four that sound most alike); short notes (staccato, the hand stopping the string) for chugs; four release
    noises"""
    zm = list(range(40, 83, 3))
    raw = {}
    for m in zm:
        for v, lay in ((1, "mf"), (2, "f")):
            cands = []
            for r in (1, 2, 3, 4):
                p = os.path.join(src, "Samples", color, "ord", "twang_%s_%s_rr%d.wav" % (bg_name(m), lay, r))
                if os.path.exists(p):
                    cands.append((r, trim(load(p), cap_for(m))))
            keep = choose(cands, 2 if m <= rr_top else 1)
            for i, r in enumerate(keep):
                y = dict(cands)[r]
                c, rng = cents(y, m, 0.12, min(0.7, len(y) / SR - 0.1))
                raw[(m, v, i + 1)] = (y, c, rng, "twang_%s_%s_rr%d.wav" % (bg_name(m), lay, r))
    stac = {}
    for m in range(40, 68, 3):
        cands = []
        for r in (1, 2, 3, 4):
            p = os.path.join(src, "Samples", color, "stac", "staccato_%s_rr%d.wav" % (bg_name(m), r))
            if os.path.exists(p):
                cands.append((r, trim(load(p), 0.6, -50.0)))
        for i, r in enumerate(choose(cands, 2)):
            y = dict(cands)[r]
            c, rng = cents(y, m, 0.06, min(0.16, len(y) / SR - 0.06), 0.01)
            stac[(m, i + 1)] = (y, c, rng, "staccato_%s_rr%d.wav" % (bg_name(m), r))
    rel = []
    for r in (1, 2, 3, 4):
        p = os.path.join(src, "Samples", color, "rel", "release_%s_rr%d.wav" % (bg_name(50), r))
        rel.append((trim(load(p), 0.7, -50.0, 0.004, at=first_sound), os.path.basename(p)))
    return finish(out, raw, stac, rel, name, vel=[0, 0.6],
                  source="Black And Green Guitars by Karoryfer Samples",
                  url="https://github.com/sfzinstruments/karoryfer.black-and-green-guitars")


def build_martin(src, out, name):
    """the steel-string acoustic: 15 notes (E2 to B5), one take each, recorded to be looped; rung out from its loop"""
    raw = {}
    for p in sorted(os.listdir(src)):
        mm = re.match(r"MartinGM2_(\d+)_", p)
        if not mm:
            continue
        m = int(mm.group(1))
        path = os.path.join(src, p)
        ls, le = smpl_loop(path)
        x = load(path)
        cap = 4.6 if m < 50 else 3.6 if m < 62 else 2.8 if m < 70 else 2.2
        y, slope = loop_out(x, ls, le, cap)
        y = trim(y, cap, -50.0)
        c, rng = cents(y, m, 0.12, min(0.7, len(y) / SR - 0.1))
        raw[(m, 1, 1)] = (y, c, rng, p)
    return finish(out, raw, {}, [], name, vel=[0], source="Martin HD28 by Jeff Learman (Discord SFZ GM Bank)",
                  url="https://github.com/sfzinstruments/Discord-SFZ-GM-Bank")


def build_nylon(src, out, name):
    """the classical guitar: the open strings and the notes between, never more than three half steps apart"""
    raw = {}
    pick = [40, 43, 45, 48, 50, 52, 55, 57, 59, 61, 64, 67, 70, 73, 76, 79, 82]
    inv = {0: "C", 1: "C#", 2: "D", 3: "D#", 4: "E", 5: "F", 6: "F#", 7: "G", 8: "G#", 9: "A", 10: "A#", 11: "B"}
    for m in pick:
        p = os.path.join(src, "samples", "%s%d.flac" % (inv[m % 12], m // 12 - 1))
        cap = 4.6 if m < 50 else 3.6 if m < 62 else 2.8 if m < 70 else 2.2
        y = trim(load(p), cap, -55.0)
        c, rng = cents(y, m, 0.12, min(0.7, len(y) / SR - 0.1))
        raw[(m, 1, 1)] = (y, c, rng, os.path.basename(p))
    return finish(out, raw, {}, [], name, vel=[0], source="Spanish Classical Guitar by Roberto (FreePats)",
                  url="https://github.com/freepats/spanish-classical-guitar")


def smpl_loop(path):
    import struct
    d = open(path, "rb").read()
    i = 12
    while i + 8 <= len(d):
        cid = d[i:i + 4]
        sz = struct.unpack("<I", d[i + 4:i + 8])[0]
        body = d[i + 8:i + 8 + sz]
        if cid == b"smpl" and struct.unpack("<I", body[28:32])[0] > 0:
            _, typ, st, en, frac, cnt = struct.unpack("<IIIIII", body[36:60])
            return st, en
        i += 8 + sz + (sz & 1)
    raise SystemExit("no loop in " + path)


# ── levels, files and set.json ───────────────────────────────────────────────────────────────────────────────────
TOP = -19.0          # dBFS: the loudest layer's held notes, over 10-260 ms after the pluck (the page's own string sits there)


def finish(out, raw, stac, rel, name, vel, source, url):
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        if f.endswith(".mp3"):
            os.unlink(os.path.join(out, f))
    layers = sorted(set(v for (_, v, _) in raw))
    lvl = {k: rms(y, 0.0115, 0.2615) for k, (y, *_r) in raw.items()}
    # each layer's own loudness (the median over the neck), and the step between layers, as recorded
    med = {v: float(np.median([db(l) for (m, vv, r), l in lvl.items() if vv == v])) for v in layers}
    target = {v: TOP + (med[v] - med[layers[-1]]) for v in layers}
    zones, report = [], []
    for (m, v, r), (y, c, rng, src) in sorted(raw.items()):
        gain = 10 ** ((target[v] - db(lvl[(m, v, r)])) / 20)
        z = y * gain
        g = 1.0
        pk = np.max(np.abs(z))
        if pk > 0.89:                                     # keep 1 dB clear of full scale; the rest goes in g
            g = pk / 0.89
            z /= g
        f = "z%02d_v%d_r%d.mp3" % (m, v, r)
        encode(z, os.path.join(out, f))
        zones.append({"f": f, "m": m, "c": round(c, 1), "s": None, "v": v, "r": r, "k": "sus", "g": round(g, 3)})
        report.append((f, src, round(c, 1), [round(x, 1) for x in rng], round(len(z) / SR, 2), round(db(gain), 1)))
    if stac:
        # short notes: as loud at the pick as a held note of the loud layer (its first 60 ms)
        sus_short = np.median([db(rms(y, 0.0015, 0.0615)) + (target[v] - db(lvl[(m, v, r)]))
                               for (m, v, r), (y, *_r) in raw.items() if v == layers[-1]])
        for (m, r), (y, c, rng, src) in sorted(stac.items()):
            gain = 10 ** ((sus_short - db(rms(y, 0.0015, 0.0615))) / 20)
            z = y * gain
            g = 1.0
            pk = np.max(np.abs(z))
            if pk > 0.89:
                g = pk / 0.89
                z /= g
            f = "m%02d_r%d.mp3" % (m, r)
            encode(z, os.path.join(out, f))
            zones.append({"f": f, "m": m, "c": round(c, 1), "s": None, "v": 1, "r": r, "k": "stac", "g": round(g, 3)})
            report.append((f, src, round(c, 1), [round(x, 1) for x in rng], round(len(z) / SR, 2), round(db(gain), 1)))
    noise = []
    if rel:
        # a release noise sits as far under a held note as it does in the library (the held notes' level, mf)
        for i, (y, src) in enumerate(rel):
            gain = 10 ** ((target[layers[-1]] - med[layers[-1]]) / 20)      # the same step as the held notes got
            z = y * gain
            f = "rel_r%d.mp3" % (i + 1)
            encode(z, os.path.join(out, f))
            noise.append({"f": f, "k": "release", "r": i + 1, "g": 1.0})
            report.append((f, src, None, None, round(len(z) / SR, 2), round(db(gain), 1)))
    meta = {"id": os.path.basename(out), "instrument": "guitar", "name": name, "source": source,
            "license": "CC0-1.0", "tuning": TUNING, "zones": zones, "vel": vel, "noise": noise, "maxShift": 3}
    with open(os.path.join(out, "set.json"), "w") as f:
        json.dump(meta, f, ensure_ascii=False, separators=(",", ":"))
    size = sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out))
    print("%s: %d files, %.2f MB, layers %s (recorded steps %s dB)" % (out, len(zones) + len(noise), size / 1e6,
          layers, [round(med[v] - med[layers[-1]], 1) for v in layers]))
    for r in report:
        print("   ", r)
    return size


if __name__ == "__main__":
    src = sys.argv[1]
    want = sys.argv[2:] or ["green", "black", "steel", "nylon"]
    total = 0
    if "green" in want:
        total += build_bg(os.path.join(src, "bg"), "green", os.path.join(OUT, "green"),
                          {"en": "Green hollow-body electric guitar", "es": "Guitarra eléctrica verde de caja hueca"})
    if "black" in want:
        total += build_bg(os.path.join(src, "bg"), "black", os.path.join(OUT, "black"),
                          {"en": "Black hollow-body electric guitar", "es": "Guitarra eléctrica negra de caja hueca"})
    if "steel" in want:
        total += build_martin(os.path.join(src, "martin"), os.path.join(OUT, "steel"),
                              {"en": "Steel-string acoustic guitar", "es": "Guitarra acústica de cuerdas de acero"})
    if "nylon" in want:
        total += build_nylon(os.path.join(src, "nylon"), os.path.join(OUT, "nylon"),
                             {"en": "Classical guitar, nylon strings", "es": "Guitarra clásica, cuerdas de nailon"})
    print("all: %.2f MB" % (total / 1e6))
