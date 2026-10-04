# AOG-BAND-STEREO-ALL-V1 (2026-10-04) — Jimmy: "there are few fake instruments left right? Fake, meaning the sound is not
# authentic."
# Every Band player made from VS Chamber Orchestra: Community Edition (CC0) was made by process.py, process2.py or
# percproc.py, which mixed the library's two microphones into one channel. The two microphones stand apart, so their
# sound often disagrees (a flute's left and right agree at -0.46, a tuba's at -0.33, a marimba's at 0.15). Adding them
# cancels some pitches and strengthens others, differently on every note, and moves with vibrato: the hollow, phasey
# sound of a cheap sample keyboard. strings_stereo.py fixed the violin, viola and cello sections. This does the same for
# every other player from that library: brass, woodwinds, double bass, the plucked strings, harp and percussion.
#   - the same recordings: each old file is matched to the take it was made from (the take whose one-channel mix
#     lines up best with the old file), and the matches are kept in band_stereo_sources.json
#   - both microphones kept, left and right, as recorded (nothing added together)
#   - cut exactly as before: the same start, the same length (held 5 s; short 0.9 s; a pluck, a drum or a bar rings as
#     long as it did) and the same fade at the end
#   - every note brought to the loudness of the note it replaces, measured the way its old builder measured it, so the
#     page's levels stay as they were; no peak above 0.97
#   - 32 kHz (the rate the page decodes at), stereo, MP3 at 112 kbps held and 96 kbps short, plucked and struck
#   - the tuning measured again from the new files (both microphones; the page corrects 3 cents or more)
#   - into new folders (audio/band/<player>2/), since the old files are cached for a year under their own names
# Two microphones are twice the memory once the page has opened the files. So in a big group (brass, woodwinds, the bebop
# and cool jazz groups, the marching band and the orchestra) the page keeps one microphone of these players, the left
# one, brought to the loudness of the two (band_script.js: leftOnly), and each group needs what it needed before. One
# microphone alone sounds as recorded; only the two added together sounded hollow.
# "map" and "build" read the old one-channel files; they were removed once the new ones were in. To run them again, put
# the old folders back from the commit before (git checkout 7804f700 -- aog-deploy/audio/band/<player>).
#
#   python3 band_stereo.py corr            how much each player's two microphones agree (a few takes each)
#   python3 band_stereo.py map             find the take behind every old file (needs the old folders; writes
#                                          band_stereo_sources.json)
#   python3 band_stereo.py build [p,q]     write aog-deploy/audio/band/<player>2 and the manifest's "dir" and "tune"
import os, re, sys, json, subprocess, numpy as np
from multiprocessing import Pool
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tune
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", "..", "..", "aog-deploy"))
BAND = os.path.join(ROOT, "audio", "band")
REPO = "/home/user/sgossner/vsco-2-ce"
SRC = os.path.join(HERE, "band_stereo_sources.json")
SR = 32000
# player: (old builder, held kind, held folder, short folder). Builders: "p1" process.py, "p2" process2.py, "perc" percproc.py
PLAYERS = {
    "trumpet":          ("p1", "held",  "Brass/Trumpet/sus",              "Brass/Trumpet/stac"),
    "trombone":         ("p1", "held",  "Brass/Tenor Trombone/sus",       "Brass/Tenor Trombone/stac"),
    "horn":             ("p1", "held",  "Brass/F Horn/sus",               "Brass/F Horn/stac"),
    "tuba":             ("p1", "held",  "Brass/Tuba/sus",                 "Brass/Tuba/stac"),
    "flute":            ("p1", "held",  "Woodwinds/Flute/susNV",          "Woodwinds/Flute/stac"),
    "clarinet":         ("p1", "held",  "Woodwinds/Clarinet/susLong",     "Woodwinds/Clarinet/stac"),
    "oboe":             ("p1", "held",  "Woodwinds/Oboe/Sus",             "Woodwinds/Oboe/Stacc"),
    "bassoon":          ("p1", "held",  "Woodwinds/Bassoon/sus",          "Woodwinds/Bassoon/stac"),
    "trumpet_vib":      ("p2", "held",  "Brass/Trumpet/susvib",           None),
    "trumpet_harmon":   ("p2", "held",  "Brass/Trumpet/harmonM-sus",      None),
    "trumpet_straight": ("p2", "held",  "Brass/Trumpet/straightM-sus",    None),
    "trombone_vib":     ("p2", "held",  "Brass/Tenor Trombone/vib",       None),
    "horn_mute":        ("p2", "held",  "Brass/F Horn/mute",              None),
    "piccolo":          ("p2", "held",  "Woodwinds/Piccolo/Sus",          "Woodwinds/Piccolo/Stac"),
    "flute_vib":        ("p2", "held",  "Woodwinds/Flute/susvib",         None),
    "oboe_vib":         ("p2", "held",  "Woodwinds/Oboe/Vib",             None),
    "bassoon_vib":      ("p2", "held",  "Woodwinds/Bassoon/vib",          None),
    "contrabass":       ("p2", "held",  "Strings/Solo Contrabass/SusVib", "Strings/Solo Contrabass/Spic"),
    "violins_pizz":     ("p2", "pluck", "Strings/Violin Section/Pizz",    None),
    "violas_pizz":      ("p2", "pluck", "Strings/Viola Section/pizz",     None),
    "cellos_pizz":      ("p2", "pluck", "Strings/Cello Section/pizzT",    None),
    "contrabass_pizz":  ("p2", "pluck", "Strings/Solo Contrabass/Pizz",   None),
    "harp":             ("p2", "pluck", "Strings/Harp",                   None),
    "timpani":          ("perc", "drum", "Percussion/Timpani",            None),
    "marimba":          ("perc", "bar",  "Percussion/Marimba",            None),
    "xylophone":        ("perc", "bar",  "Percussion/Xylo",               None),
    "glockenspiel":     ("perc", "bar",  "Percussion/Glock",              None),
    "kit":              ("perc", "kit",  "Percussion",                    None),
}
# the library has no French horn notes between C4 and D5: psola.py made three from its C4 and D5 (note: (from, semitones))
PSOLA = {"horn": {63: (60, 3), 66: (60, 6), 70: (74, -4)}}
BORROW = {"trumpet_vib": "trumpet", "trombone_vib": "trombone", "flute_vib": "flute", "oboe_vib": "oboe", "bassoon_vib": "bassoon"}
# the kit's pieces: the family of takes each was picked from, how long it may ring (percproc.py)
KIT = {"bd": (r"^Percussion/BDrumNewhit_", 2.0), "sn": (r"^Percussion/Snare2-HitSN_", 1.2), "cy": (r"^Percussion/susCymb1-hitstick_", 4.0),
       "tri": (r"^Percussion/Triangle3-Hit_", 3.0), "tamb": (r"^Percussion/Tamb1-Hit_", 1.0), "roll": (r"^Percussion/Snare2-rollSN_", 5.0)}
PC = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
NOTE = re.compile(r"_([A-G]#?)(-?\d)(?=[_.])", re.I)
_FILES = None


def files():
    global _FILES
    if _FILES is None:
        out = subprocess.run(["git", "-C", REPO, "ls-tree", "-r", "--name-only", "HEAD"], capture_output=True, text=True, check=True).stdout
        _FILES = [x for x in out.split("\n") if x.lower().endswith(".wav")]
    return _FILES


def named(f):
    m = NOTE.search(os.path.basename(f))
    return None if not m else (int(m.group(2)) + 1) * 12 + PC[m.group(1).upper()]


def git_pcm(path, ch):
    raw = subprocess.run(["git", "-C", REPO, "show", "HEAD:" + path], capture_output=True, check=True).stdout
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "-", "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], input=raw, capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, dtype=np.float32).astype(np.float64)
    return x if ch == 1 else x.reshape(-1, 2)


def mp3(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).astype(np.float64)


def onset(x):
    """as the old builders: 5 ms before the first sample above 3 % of the loudest (of the one-channel mix)"""
    a = np.abs(x); pk = a.max(); i = int(np.argmax(a > pk * 0.03)); return max(0, i - int(0.005 * SR))


def loudest(p, w):
    """the loudest stretch of w seconds of a power curve (mean square per sample)"""
    n = int(w * SR)
    if len(p) <= n:
        return float(np.sqrt(np.mean(p) + 1e-15))
    c = np.concatenate([[0.0], np.cumsum(p)])
    return float(np.sqrt(np.max(c[n:] - c[:-n]) / n + 1e-15))


def ring_end(x, maxs, db=-50):
    """where a pluck or a stroke has died away by db (20 ms steps), at most maxs seconds (process2.py, percproc.py)"""
    fr = int(0.02 * SR); n = min(len(x), int(maxs * SR)) // fr
    env = np.array([np.sqrt(np.mean(x[i * fr:(i + 1) * fr] ** 2) + 1e-15) for i in range(n)])
    pk = env.max(); quiet = np.where(env < pk * 10 ** (db / 20))[0]; quiet = quiet[quiet > int(0.1 / 0.02)]
    return int(min(len(x), (quiet[0] + 1) * fr if len(quiet) else n * fr))


# ── which takes an old file can have come from ──
def offset(names, want):
    """the library names its notes an octave or two away from how they sound: the offset that fits the page's notes best"""
    return max((-24, -12, 0, 12, 24), key=lambda o: (len(set(n + o for n in names) & set(want)), -abs(o)))


def candidates(player, key):
    b, kind, held, short = PLAYERS[player]
    F = files()
    if player == "kit":
        piece = re.match(r"[a-z]+", key).group(0)
        return [f for f in F if re.search(KIT[piece][0], f)]
    if player == "timpani":
        return [f for f in F if f.startswith(held + "/") and (("_Hit_" in f) if key.endswith("t") else ("Roll" in f))]
    n = int(key[:-1]); folder = short if key.endswith("t") else held
    fs = [f for f in F if f.startswith(folder + "/")]
    man = json.load(open(os.path.join(BAND, "manifest.json")))[player]
    want = man["stac"] if key.endswith("t") else man["sus"]
    off = offset([named(f) for f in fs if named(f) is not None], want)
    return [f for f in fs if named(f) is not None and abs(named(f) + off - n) <= 1]


def match(a, b):
    """how well two one-channel takes line up: the best normalised cross-correlation within 60 ms, over the first 1.5 s"""
    a = a[onset(a):][:int(1.5 * SR)]; b = b[onset(b):][:int(1.5 * SR)]
    n = min(len(a), len(b)); a = a[:n]; b = b[:n]
    N = 1 << int(np.ceil(np.log2(2 * n)))
    c = np.fft.irfft(np.fft.rfft(a, N) * np.conj(np.fft.rfft(b, N)), N)
    L = int(0.06 * SR); lags = np.concatenate([c[:L], c[-L:]])
    j = int(np.argmax(lags)); lag = j if j < L else j - 2 * L
    return float(lags[j] / np.sqrt(np.sum(a * a) * np.sum(b * b) + 1e-15)), lag


def map_one(args):
    player, key = args
    old = mp3(os.path.join(BAND, player, key + ".mp3"))
    rows = []
    for f in candidates(player, key):
        s, lag = match(old, git_pcm(f, 1))
        rows.append((s, f, lag))
    rows.sort(reverse=True)
    return player, key, rows[:3]


def do_map(only):
    jobs = []
    for p in PLAYERS:
        if only and p not in only: continue
        for f in sorted(os.listdir(os.path.join(BAND, p))):
            if f.endswith(".mp3"): jobs.append((p, f[:-4]))
    have = json.load(open(SRC)) if os.path.exists(SRC) else {}
    with Pool(4) as pool:
        for player, key, rows in pool.imap(map_one, jobs):
            if not rows:
                if int(key[:-1]) not in PSOLA.get(player, {}): print("NO CANDIDATES", player, key)
                continue
            best = rows[0]; second = rows[1][0] if len(rows) > 1 else 0
            flag = "" if best[0] > 0.8 and best[0] - second > 0.1 else "   <- check"
            print("%-16s %-6s %.3f (next %.3f) lag %+5d  %s%s" % (player, key, best[0], second, best[2], os.path.basename(best[1]), flag), flush=True)
            have.setdefault(player, {})[key] = {"src": best[1], "match": round(best[0], 3), "next": round(second, 3)}
    for player, notes in PSOLA.items():               # psola.py's notes come from the takes of the notes they were made from
        if only and player not in only: continue
        for n, (frm, semis) in notes.items():
            for lay in "slt":
                if os.path.exists(os.path.join(BAND, player, "%d%s.mp3" % (n, lay))):
                    have[player]["%d%s" % (n, lay)] = dict(have[player]["%d%s" % (frm, lay)], psola=[frm, semis])
    json.dump(have, open(SRC, "w"), indent=1)


# ── how much the two microphones agree ──
def corr_one(path):
    x = git_pcm(path, 2); x = x[onset(x.mean(axis=1)):][:int(2.0 * SR)]
    l, r = x[:, 0] - x[:, 0].mean(), x[:, 1] - x[:, 1].mean()
    return float(np.sum(l * r) / np.sqrt(np.sum(l * l) * np.sum(r * r) + 1e-15))


def do_corr(only):
    srcs = json.load(open(SRC))
    for p, keys in srcs.items():
        if only and p not in only: continue
        ks = sorted(keys)[::max(1, len(keys) // 5)][:5]
        cs = [corr_one(keys[k]["src"]) for k in ks]
        print("%-16s L/R correlation %+.2f  (%s)" % (p, float(np.mean(cs)), ", ".join("%s %+.2f" % (k, c) for k, c in zip(ks, cs))), flush=True)


# ── the new files ──
def recipe(player, key):
    """(length in samples or None for 'measure it', ring seconds, ring dB, fade s, loudness: (window s, first s or None,
    'rms' for process.py's fixed 0.05-0.8 s), MP3 kbps, tuning kind)"""
    b, kind, held, short = PLAYERS[player]
    if player == "kit":
        piece = re.match(r"[a-z]+", key).group(0)
        if piece == "roll": return dict(keep=5.0, fade=0.4, win=0.4, kb=112, tk=None)
        return dict(ring=(KIT[piece][1], -50), fade=0.15, win=0.05, kb=96, tk=None)
    if player == "timpani":
        if key.endswith("t"): return dict(ring=(3.0, -50), fade=0.3, win=0.15, kb=96, tk="drum_hit")
        return dict(keep=5.0, fade=0.4, win=0.4, kb=112, tk="drum_roll")     # percproc.py: its loudest 0.4 s anywhere
    if kind == "bar":
        return dict(ring=(5.0 if player == "glockenspiel" else 3.0, -55), fade=0.3, win=0.15, kb=96, tk="bar")
    if key.endswith("t"):
        return dict(keep=0.9, fade=0.1, win=0.15, kb=96, tk="short")
    if kind == "pluck":
        return dict(ring=(5.0 if player == "harp" else 3.0, -50), fade=0.3, win=0.15, kb=96, tk="pluck")
    if b == "p1":
        return dict(keep=5.0, fade=0.4, rms=(0.05, 0.8), kb=112, tk="held")
    return dict(keep=5.0, fade=0.4, win=0.4, first=2.5, kb=112, tk="held")


def level(p, r):
    """the loudness of a power curve p (mean square per sample) the way its old builder measured it"""
    if "rms" in r:
        a, b = r["rms"]; s = p[int(a * SR):int(min(b, len(p) / SR) * SR)]; return float(np.sqrt(np.mean(s) + 1e-12))
    if "first" in r: p = p[:int(r["first"] * SR)]
    return loudest(p, r["win"])


def measure_tune(x, n, tk):
    out = []
    for ch in (0, 1):
        y = x[:int(5 * SR), ch]
        if tk in ("drum_hit", "drum_roll", "bar"):
            c, sp, k = tune.drum_heard(y, n, tk == "drum_roll")
        else:
            c, sp, k = tune.heard(y, n, tk)
            if c is None: c = (tune.finalize_yin(y, n) - n) * 100
        if c is not None: out.append(c)
    return float(np.mean(out)) if out else None


def psola_stereo(src, frm, semis):
    """psola.py's pitch move, on both microphones: the cycles are found in the one-channel mix (as psola.py found them)
    and the same grains are taken from each microphone, so left and right stay together"""
    import psola as P
    raw = subprocess.run(["git", "-C", REPO, "show", "HEAD:" + src], capture_output=True, check=True).stdout
    dec = lambda ch: np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", "-", "-ac", str(ch), "-ar", str(P.SRU), "-f", "f32le", "-"], input=raw,
                                                  capture_output=True, check=True).stdout, dtype=np.float32).astype(np.float64)
    m = dec(1); st = dec(2).reshape(-1, 2); n0 = min(len(m), len(st)); m = m[:n0]; st = st[:n0]
    i = P.onset(m, P.SRU); m = m[i:]; st = st[i:]
    t32, hop = P.period_track(m[::P.UP], frm); track = t32 * P.UP; hop *= P.UP; M = P.marks(m, track, hop); ratio = 2 ** (semis / 12)
    T = lambda i: track[min(len(track) - 1, int(i // hop))]
    y = np.zeros((len(m) + 4 * int(track.max()), 2)); t = float(M[0])
    while t < M[-1]:
        k = int(np.argmin(np.abs(M - t))); a = M[k]; p = int(round(T(a)))
        if a - p < 0 or a + p + 1 > len(m): t += T(t) / ratio; continue
        g = np.hanning(2 * p + 1)[:, None]; ts = int(round(t))
        y[ts - p:ts + p + 1] += st[a - p:a + p + 1] * g
        t += T(a) / ratio
    y[:M[0]] = st[:M[0]]
    y /= ratio
    y = y[:len(m)]
    return np.stack([P.down(y[:, 0]), P.down(y[:, 1])], axis=1)


def build_one(args):
    player, key, src, ps = args
    r = recipe(player, key)
    if ps:                                            # made by psola.py: it already starts at the note
        x = psola_stereo(src, *ps); mono = x.mean(axis=1)
    else:
        mono = git_pcm(src, 1); st = git_pcm(src, 2)
        n0 = min(len(mono), len(st)); mono = mono[:n0]; st = st[:n0]
        i = onset(mono); mono = mono[i:]; x = st[i:].copy()
    end = ring_end(mono, *r["ring"]) if "ring" in r else int(r["keep"] * SR)
    x = x[:end]
    fo = min(int(r["fade"] * SR), len(x) // 3); x[-fo:] *= (np.linspace(1, 0, fo) ** 2)[:, None]
    fi = int(0.002 * SR); x[:fi] *= np.linspace(0, 1, fi)[:, None]
    old = mp3(os.path.join(BAND, player, key + ".mp3"))
    ref = level(old ** 2, r); now = level(np.mean(x ** 2, axis=1), r)
    g = ref / now; x *= g
    same = match(old, x.mean(axis=1))[0]             # the new file's two microphones together line up with the old file
    pk = float(np.max(np.abs(x))); lim = 0.0
    if pk > 0.97:
        x *= 0.97 / pk; lim = 20 * np.log10(0.97 / pk)
    out = os.path.join(BAND, player + "2"); os.makedirs(out, exist_ok=True); dst = os.path.join(out, key + ".mp3")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "libmp3lame", "-b:a", "%dk" % r["kb"], dst],
                   input=x.astype(np.float32).tobytes(), check=True)
    c = None if r["tk"] is None else measure_tune(x, int(key[:-1]), r["tk"])
    return {"player": player, "key": key, "src": src, "psola": ps, "same": round(same, 3), "gain_db": round(20 * np.log10(g), 1), "limited_db": round(lim, 2),
            "sec": round(len(x) / SR, 3), "old_sec": round(len(old) / SR, 3), "cents": None if c is None else round(c, 1), "kb": os.path.getsize(dst) / 1024,
            "old_kb": os.path.getsize(os.path.join(BAND, player, key + ".mp3")) / 1024}


def do_build(only):
    srcs = json.load(open(SRC)); man = json.load(open(os.path.join(BAND, "manifest.json")))
    jobs = [(p, k, v["src"], v.get("psola")) for p, keys in srcs.items() if (not only or p in only) for k, v in sorted(keys.items())]
    with Pool(4) as pool:
        rep = list(pool.imap(build_one, jobs))
    json.dump(rep, open(os.path.join(HERE, "band_stereo_report.json"), "w"), indent=0)
    for p in sorted(set(r["player"] for r in rep), key=list(PLAYERS).index):
        rs = [r for r in rep if r["player"] == p]
        m = man[p]; m["dir"] = p + "2"
        old_tune = dict(m["tune"])
        m["tune"] = {k: v for k, v in m["tune"].items() if k.endswith("t") and p in BORROW}     # borrowed short notes: below
        for r in rs:
            if r["cents"] is not None and abs(round(r["cents"])) >= 3: m["tune"][r["key"]] = int(round(r["cents"]))
        moved = [(r["key"], old_tune.get(r["key"], 0), m["tune"].get(r["key"], 0)) for r in rs if abs(old_tune.get(r["key"], 0) - m["tune"].get(r["key"], 0)) > 8]
        print("%-16s %3d files  %6.0f KB (was %5.0f)  gain %+.1f..%+.1f dB  limited %d (most %.2f dB)  lines up with the old file %.3f..  length off by >40 ms: %s  tuning moved >8 cents: %s" % (
            p, len(rs), sum(r["kb"] for r in rs), sum(r["old_kb"] for r in rs), min(r["gain_db"] for r in rs), max(r["gain_db"] for r in rs),
            sum(1 for r in rs if r["limited_db"] < 0), min(r["limited_db"] for r in rs), min(r["same"] for r in rs),
            [(r["key"], r["sec"], r["old_sec"]) for r in rs if abs(r["sec"] - r["old_sec"]) > 0.04], moved), flush=True)
    for v, b in BORROW.items():                       # the vibrato players borrow the plain player's short notes and their tuning
        man[v]["tune"] = {k: x for k, x in man[v]["tune"].items() if not k.endswith("t")}
        man[v]["tune"].update({k: x for k, x in man[b]["tune"].items() if k.endswith("t")})
    json.dump(man, open(os.path.join(BAND, "manifest.json"), "w"), separators=(",", ":"))
    print("total KB new %.0f, old %.0f" % (sum(r["kb"] for r in rep), sum(r["old_kb"] for r in rep)))


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "build"
    only = sys.argv[2].split(",") if len(sys.argv) > 2 else None
    {"map": do_map, "corr": do_corr, "build": do_build}[what](only)
