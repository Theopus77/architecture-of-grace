# AOG-BAND-HIFI-V1 (2026-10-23) — every Band player made again from its original recordings at 44.1 kHz, as the Piano and
# the Guitar are. Jimmy wants the Studio pro-grade everywhere; an audit found the Band's files at 32 kHz (64 kbps mono for
# the saxophones, flutes, folk, classroom and world players; 96-112 kbps stereo for VS Chamber Orchestra), their treble
# stopping at 13.5-15 kHz.
#
# Each builder is run again exactly as it was written, at 44.1 kHz (bandio.py: AOG_BAND_SR), keeping both microphones
# where it used one of a stereo pair (AOG_BAND_STEREO), into a stage folder outside the site, with float WAVs beside its
# files (AOG_BAND_RAW). Then "finish" takes every staged note and:
#   - lines it up with the file the page plays now (the same take, the same cut: the cross-correlation of the two must be
#     0.9 or more within 30 ms, else it stops and says so; the computer-made players and the voices, made again by
#     PSOLA, must be as long instead), and brings it to that file's loudness exactly (K-weighted, as the level tests hear
#     it, under 15.5 kHz where both have sound, so the treble added does not change the level; a note made stereo is as
#     loud on its two sides as the one microphone was on both), so every trim the page holds (PLAYER, manifest lvl and
#     lvk, the C chord's level) stays true
#   - writes it once, as MP3 at 44.1 kHz and 128 kbps a channel, like the Guitar's (one channel at 128 kbps; a stereo note
#     at 256: at 128 kbps for two channels, as the Piano's grand is, the encoder dropped the top octave of half the
#     stereo notes whose source has sound there, and at 256 none), stereo where the source is stereo,
#     into a new folder <the player's folder>/hq (the old files are cached a year under their names, and the Drum Machine
#     still plays them, music-pads.html)
#   - measures its tuning (tune.py, as its builder did; cents_played: as the page plays it, corrected) and gives the page a
#     correction for every note 1 cent or more off
#     (the builders' line was 3), so every note plays within half a cent of where tune.py hears it; these go into the
#     manifest's "tq" ("tune" stays the old files' own, as the Drum Machine still plays those), and make_band.py gives the
#     Band page tq as its tune
#   - measures where its treble stops (treble() below), against the source recording's own
# and the manifest gets each player's new "dir" and "tq" (nothing else changes: notes, loud notes, short notes, tune, lvl,
# lvk, sources). The page decodes at 44.1 kHz now (band_script.js loadInst), so the treble is heard.
#
# Sources (where each builder says how to get them): VSCO 2 CE (/home/user/sgossner/vsco-2-ce, a partial clone: the
# builders read it with git), VCSL (/home/user/sgossner/VCSL), Weresax (/home/user/sfzinstruments/karoryfer.weresax),
# ganjo, aliexpress-erhu, spanish-classical-guitar, vocalset-vowel-voicebanks and Discord-SFZ-GM-Bank (under SRC below).
# Not made again: the bagpipes. Their source is Freesound's own 128 kbps MP3 preview (the WAVs need a Freesound login,
# not reachable from here), so there is nothing better to make them from; they stay as they are.
#
#   python3 hifi.py prep                    lay the sources out the way folk.py and world.py read them
#   python3 hifi.py build [family,...]      vsco sax sax2 folk classroom world (all when none is named)
#   python3 hifi.py finish [player,...]     into aog-deploy/audio/band/<dir>/hq, the manifest, hifi_report.json
#   python3 hifi.py retune [player,...]     the tuning of the finished files again, into the report and the manifest's tq
#   python3 hifi.py relevel [player,...]    every finished note written again, as loud as the old file when decoded
#   python3 hifi.py measure                 the treble of every note again (finished, old, source), into the report
#   python3 hifi.py report                  the table: old and new size, treble, tuning, per player
import os, sys, json, glob, shutil, subprocess, numpy as np
from multiprocessing import Pool
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", "..", "..", "aog-deploy"))
BAND = os.path.join(ROOT, "audio", "band")
STAGE = os.environ.get("AOG_HIFI_STAGE", "/home/user/aog-band-hifi-stage")
SRC = os.environ.get("AOG_HIFI_SRC", "/home/user/aog-band-src")
VSCO = "/home/user/sgossner/vsco-2-ce"
VCSL = "/home/user/sgossner/VCSL"
SR = 44100
KBPS = 128             # a channel
REPORT = os.path.join(HERE, "hifi_report.json")
ENV = dict(os.environ, AOG_BAND_SR=str(SR), AOG_BAND_STEREO="1", AOG_BAND_RAW="1", AOG_BAND_KBPS="320")
# family: the players it makes
FAMILIES = {
    "vsco": ["trumpet", "trombone", "horn", "tuba", "flute", "clarinet", "oboe", "bassoon", "trumpet_vib", "trumpet_harmon",
             "trumpet_straight", "trombone_vib", "horn_mute", "piccolo", "flute_vib", "oboe_vib", "bassoon_vib", "contrabass",
             "violins_pizz", "violas_pizz", "cellos_pizz", "contrabass_pizz", "harp", "timpani", "marimba", "xylophone",
             "glockenspiel", "kit", "violins", "violas", "cellos"],
    "sax": ["sax"],
    "sax2": ["tenor", "tenor_vib", "soprano"],
    "folk": ["harmonica", "fiddle", "banjo", "mandolin", "mandolin_trem", "dobro", "steel", "melodica"],
    "classroom": ["recorder", "recorder_alto", "ukulele", "boomwhackers"],
    "world": ["sitar", "erhu", "koto", "panflute", "didgeridoo", "didgeridoo_rhythm", "voice_f_aa", "voice_f_uu", "voice_m_aa", "voice_m_uu"],
}
LEFT = {"bagpipe": "its source is Freesound's 128 kbps MP3 preview; the original WAVs need a Freesound login",
        "bagpipe_drones": "made from the same Freesound 128 kbps MP3 preview as the chanter"}
# how each player's notes are measured for tuning (tune.py's kinds); short notes ("t") are always "short"
PLUCK = {"violins_pizz", "violas_pizz", "cellos_pizz", "contrabass_pizz", "harp", "banjo", "mandolin", "dobro", "sitar", "koto", "ukulele", "boomwhackers"}
BAR = {"marimba", "xylophone", "glockenspiel"}
MADE = {"koto", "panflute", "melodica", "boomwhackers"}          # made by computer: no take to line up with, a new one is made
# made again from the same sung notes by TD-PSOLA (psola.py), which places its grains four times finer than the file's
# rate: at 44.1 kHz the grains land elsewhere, so the wave is not the old one sample for sample (the note, its length and
# its loudness are); these are checked by length, not by lining up
REMADE = MADE | {"voice_f_aa", "voice_f_uu", "voice_m_aa", "voice_m_uu"}
LAG = 0.03 * 44100     # the same take may start a cycle or two apart (its onset found at 3 % of a peak measured anew)


def stage_band(name):
    """a stage folder holding a copy of the manifest, for a builder that writes BAND/<player>/ and the manifest"""
    d = os.path.join(STAGE, name); os.makedirs(d, exist_ok=True)
    shutil.copy(os.path.join(BAND, "manifest.json"), os.path.join(d, "manifest.json"))
    return d


def run(cmd, **kw):
    print("$", " ".join(cmd), flush=True)
    subprocess.run(cmd, env=dict(ENV, **kw), check=True, cwd=HERE)


def prep():
    """the folders folk.py and world.py read, laid out as their headers say, from the clones"""
    os.makedirs(SRC, exist_ok=True)
    link = lambda a, b: os.path.islink(b) or os.path.exists(b) or os.symlink(a, b)
    link(VCSL, os.path.join(SRC, "VCSL"))
    vio = os.path.join(SRC, "VSCO", "Strings", "Solo Violin")
    names = subprocess.run(["git", "-C", VSCO, "ls-tree", "-r", "--name-only", "HEAD", "--", "Strings/Solo Violin"], capture_output=True, text=True, check=True).stdout.split("\n")
    for n in names:
        if not n.lower().endswith(".wav"): continue
        dst = os.path.join(SRC, "VSCO", n)
        if os.path.exists(dst): continue
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(dst, "wb") as fh: subprocess.run(["git", "-C", VSCO, "show", "HEAD:" + n], stdout=fh, check=True)
    w = os.path.join(SRC, "world"); os.makedirs(w, exist_ok=True)
    link(os.path.join(SRC, "discord", "Discord GM", "Melodic", "105-Sitar"), os.path.join(w, "sitar"))
    link(os.path.join(SRC, "aliexpress-erhu", "Samples", "sus"), os.path.join(w, "erhu_sus"))
    link(os.path.join(SRC, "aliexpress-erhu", "Samples", "stac"), os.path.join(w, "erhu_stac"))
    link(os.path.join(VCSL, "Aerophones", "Lip Aerophones", "Didgeridoo"), os.path.join(w, "didg"))
    link(os.path.join(SRC, "vocalset", "source", "vocalset"), os.path.join(w, "vocalset"))
    print("sources laid out under", SRC, "(Solo Violin files:", len(glob.glob(os.path.join(vio, "*", "*.wav"))), ")")


def build(fams):
    py = sys.executable
    for f in fams:
        if f == "vsco":
            out = os.path.join(STAGE, "vsco")
            run([py, "band_stereo.py", "build"], AOG_BAND_OUT=out)
            run([py, "strings_stereo.py"], AOG_BAND_OUT=out)
        elif f == "sax":
            run([py, "sax.py"], AOG_BAND_OUT=os.path.join(STAGE, "sax", "sax"))
        elif f == "sax2":
            run([py, "sax2.py", stage_band("sax2"), VCSL])
        elif f == "folk":
            run([py, "folk.py", stage_band("folk"), SRC, os.path.join(ROOT, "audio", "guitar")])
        elif f == "classroom":
            run([py, "classroom.py", stage_band("classroom"), VCSL, os.path.join(SRC, "spanish-classical-guitar")])
        elif f == "world":
            run([py, "world.py", stage_band("world"), os.path.join(SRC, "world")])
        else:
            raise SystemExit("no family " + f)


os.environ["AOG_BAND_SR"] = str(SR)                   # tune.py measures at this rate
sys.path.insert(0, HERE)
import tune
from scipy import signal


def pcm(path, ch=None):
    """a file at 44.1 kHz as (n, channels), every channel it has (or ch of them)"""
    n = ch or int(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=channels", "-of", "csv=p=0", path],
                                 capture_output=True, text=True, check=True).stdout.strip())
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", str(n), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, n)


def treble(x, within=75):
    """where the treble stops (Hz): the highest frequency at which the note's long-term spectrum (Welch, 8192 points, 5.4 Hz
    a bin) is within 75 dB of its strongest part: where the note's own sound stops. An MP3 encoder's low-pass, or a file
    made at 32 kHz, is a cliff far deeper than that; a recording's own air and overtones fade gently above it, so a note
    with nothing up there (a tuba's low note) stops where its sound does. (90 dB would find a 32 kHz file's resampling
    residue, about 90 dB down, above its 16 kHz edge.) A stereo note: each microphone on its own, the higher of the two
    (the old one-microphone files were the left one; two microphones apart, added together, would cancel some treble).
    The report also keeps the source's top within 60 dB ("src_air"): treble plain enough that an encoder keeps it, the
    notes bandt/hifi.js holds to 16 kHz."""
    if len(x) < 8192: x = np.concatenate([x, np.zeros((8192 - len(x), x.shape[1]))])
    f, p = signal.welch(x, SR, nperseg=8192, axis=0)
    use = f > 40; top = 0.0
    for ch in range(p.shape[1]):
        db = 10 * np.log10(p[:, ch] + 1e-30)
        ok = np.where(use & (db > db[use].max() - within))[0]
        if len(ok): top = max(top, float(f[ok[-1]]))
    return top


def lowpass(x, hz=13000):   # zero phase, 8th order (16th, both ways)
    b, a = signal.butter(8, hz / (SR / 2), "low")
    return signal.filtfilt(b, a, x, axis=0)


def line_up(new, old):
    """(correlation, lag in samples) of the two notes' left channels over their first 1.5 s, both under 13 kHz"""
    a = lowpass(new[:int(1.6 * SR), :1])[:, 0]; b = lowpass(old[:int(1.6 * SR), :1])[:, 0]
    n = min(len(a), len(b), int(1.5 * SR)); a = a[:n]; b = b[:n]
    N = 1 << int(np.ceil(np.log2(2 * n)))
    c = np.fft.irfft(np.fft.rfft(a, N) * np.conj(np.fft.rfft(b, N)), N)
    L = int(0.03 * SR); lags = np.concatenate([c[:L], c[-L:]])
    j = int(np.argmax(lags)); lag = j if j < L else j - 2 * L
    return float(lags[j] / np.sqrt(np.sum(a * a) * np.sum(b * b) + 1e-20)), lag


def kind_of(player, key):
    if player == "kit": return None
    if player == "boomwhackers": return None                       # made at its exact pitch (classroom.py)
    if player == "timpani": return "drum_hit" if key.endswith("t") else "drum_roll"
    if key.endswith("t"): return "short"
    if player in BAR: return "bar"
    if player in PLUCK: return "pluck"
    return "held"


def cents(x, n, kind, player=None):
    """tune.py's reading, as each player's own builder took it: VS Chamber Orchestra's two microphones each measured and
    the two averaged (band_stereo.py); every other stereo player by its left microphone, the one its builder measured (the
    right one of the didgeridoo's rhythm, breath and voice pulsing in the drone, reads 20-30 cents flat to YIN)"""
    out = []
    for ch in (range(x.shape[1]) if player is None or player in FAMILIES["vsco"] else [0]):
        y = x[:int(5 * SR), ch]
        if kind in ("drum_hit", "drum_roll", "bar"):
            c, sp, k = tune.drum_heard(y, n, kind == "drum_roll")
        else:
            c, sp, k = tune.heard(y, n, "held" if kind == "held" else "short")
            if c is None: c = (tune.finalize_yin(y, n) - n) * 100
        if c is not None: out.append(c)
    return float(np.mean(out)) if out else None


def cents_played(x, n, kind, player):
    """where tune.py hears the note once the page plays it corrected: the correction from cents(), then the file played at
    that speed (band-limited, as a browser's resampler is meant to be) and measured again, the rest added, twice. A held
    note reads the same either way; a note whose pitch moves (a pluck settling, a timpani roll, the didgeridoo's breathing
    rhythm) is measured over a slightly shorter or longer stretch once sped up, and its reading moves by up to a few cents"""
    c = cents(x, n, kind, player)
    if c is None: return None
    for _ in range(2):
        r = 2 ** (-c / 1200)
        d = cents(signal.resample(x, int(round(len(x) / r)), axis=0), n, kind, player)
        if d is None or abs(d) < 0.05: break
        c += d
    return c


def staged(player):
    fam = next(f for f, ps in FAMILIES.items() if player in ps)
    return os.path.join(STAGE, fam, player)


def kw_power(x, n):
    """how loud a note is as the Band's level tests hear it (bandt/measure.inc: a 60 Hz high-pass and a +4 dB shelf above
    1.5 kHz, the channels added, a one-channel file heard on both sides, its loudest 400 ms in the first 2.6 s), under
    15.5 kHz, where the old 32 kHz files have sound too (the treble added above is the gain, not a change of level). Two
    microphones even each other out, so a note made stereo is steadier than its one microphone was: its loudest moment,
    the one the tests hear, is what is matched"""
    m = min(n, int(2.6 * SR))
    y = lowpass(x[:m], 15500)
    for b, a in (rbj("hp", 60, 0.5, 0), rbj("hs", 1500, 0.7, 4)): y = signal.lfilter(b, a, y, axis=0)
    sq = np.sum(y ** 2, axis=1) * (2 if x.shape[1] == 1 else 1)
    W, hop = int(0.4 * SR), int(0.05 * SR)
    if len(sq) <= W: return float(np.mean(sq))
    c = np.concatenate([[0.0], np.cumsum(sq)])
    return float(max(c[a + W] - c[a] for a in range(0, len(sq) - W + 1, hop)) / W)


def rbj(kind, f, q, db):
    w = 2 * np.pi * f / SR; cw = np.cos(w); al = np.sin(w) / (2 * q); A = 10 ** (db / 40)
    if kind == "hp": b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]; a = [1 + al, -2 * cw, 1 - al]
    else:
        sq = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * cw + sq), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - sq)]
        a = [(A + 1) - (A - 1) * cw + sq, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - sq]
    return np.array(b) / a[0], np.array(a) / a[0]


def encode_level(new, old, dst):
    """new written to dst as an MP3 that decodes exactly as loud as old (kw_power: K-weighted, as the level tests hear it,
    under 15.5 kHz). A note made stereo (a builder had used one microphone) is as loud on the two sides together as the
    one microphone was on both. The encoder itself takes about 0.45 dB off (libmp3lame from float samples, as it did for
    the old files too), so the decoded file is measured and written once more with that put back, until it is within
    0.03 dB. Returns (decoded file, gain dB, dB taken off a peak that would pass 0.999)"""
    n = min(len(new), len(old))
    po = kw_power(old, n); g = np.sqrt(po / max(kw_power(new, n), 1e-20)); lim = 0.0
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    for _ in range(4):
        y = new * g
        pk = float(np.max(np.abs(y)))
        if pk > 0.999: lim = 20 * np.log10(0.999 / pk); y = y * (0.999 / pk)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", str(y.shape[1]), "-i", "-", "-codec:a", "libmp3lame", "-b:a", "%dk" % (KBPS * y.shape[1]), dst],
                       input=np.ascontiguousarray(y, dtype=np.float32).tobytes(), check=True)
        fin = pcm(dst); m = min(len(fin), n)
        off = kw_power(old, m) / max(kw_power(fin, m), 1e-20)
        if abs(10 * np.log10(off)) < 0.03 or lim: break
        g *= np.sqrt(off)
    return fin, 20 * np.log10(g), lim


def finish_one(job):
    player, key, src_wav, old_mp3, dst = job
    new = pcm(src_wav); old = pcm(old_mp3)
    r, lag = line_up(new, old)
    fin, gdb, lim = encode_level(new, old, dst); y = fin; g = 10 ** (gdb / 20)
    k = kind_of(player, key); c = None if k is None else cents_played(fin, int(key[:-1]) if key[:-1].isdigit() else 60, k, player)
    return {"player": player, "key": key, "ch": y.shape[1], "match": round(r, 3), "lag": lag, "gain_db": round(20 * np.log10(g), 2), "limited_db": round(lim, 2),
            "sec": round(len(y) / SR, 3), "old_sec": round(len(old) / SR, 3), "cents": None if c is None else round(c, 2),
            "treble": round(treble(fin)), "old_treble": round(treble(old)), "src_treble": round(treble(new)), "src_air": round(treble(new, 60)),
            "kb": round(os.path.getsize(dst) / 1024, 1), "old_kb": round(os.path.getsize(old_mp3) / 1024, 1)}


def finish(only):
    man = json.load(open(os.path.join(BAND, "manifest.json")))
    players = [p for f in FAMILIES.values() for p in f if (not only or p in only)]
    jobs = []
    for p in players:
        old_dir = man[p].get("dir", p)
        if old_dir.endswith("/hq"): old_dir = old_dir[:-3]
        sd = staged(p)
        have = sorted(f[:-4] for f in os.listdir(sd) if f.endswith(".wav"))
        want = sorted(f[:-4] for f in os.listdir(os.path.join(BAND, old_dir)) if f.endswith(".mp3"))
        # the page's files (a vibrato player's short notes are the plain player's: stacDir)
        miss = [k for k in want if k not in have]
        if miss: raise SystemExit("%s: the stage has no %s" % (p, miss))
        for k in want:
            jobs.append((p, k, os.path.join(sd, k + ".wav"), os.path.join(BAND, old_dir, k + ".mp3"), os.path.join(BAND, old_dir, "hq", k + ".mp3")))
    print(len(jobs), "notes", flush=True)
    with Pool(4) as pool:
        rows = list(pool.imap(finish_one, jobs, chunksize=4))
    rep = json.load(open(REPORT)) if os.path.exists(REPORT) else {"notes": []}
    rep["notes"] = [r for r in rep["notes"] if r["player"] not in players] + rows
    bad = [r for r in rows if (r["match"] < 0.9 or abs(r["lag"]) >= LAG) if r["player"] not in REMADE]
    bad += [r for r in rows if r["player"] in REMADE and abs(r["sec"] - r["old_sec"]) > 0.15]
    for r in bad: print("DOES NOT LINE UP", r)
    for p in players:
        rs = [r for r in rows if r["player"] == p]; m = man[p]
        old_dir = m.get("dir", p); old_dir = old_dir[:-3] if old_dir.endswith("/hq") else old_dir
        m["dir"] = old_dir + "/hq"
    tq(man, rows, players)
    json.dump(man, open(os.path.join(BAND, "manifest.json"), "w"), separators=(",", ":"))
    rep["left"] = LEFT
    json.dump(rep, open(REPORT, "w"), indent=0)
    report(players)
    if bad: raise SystemExit("%d notes did not line up with the files they replace" % len(bad))


def tq(man, rows, players):
    """the manifest's "tq": the tuning of the files in "dir" (hq), every note 1 cent or more off. "tune" stays the old
    files' (the Drum Machine still plays them, music-pads.html reads it); make_band.py gives the Band page tq as its tune"""
    for p in players:
        t = {}
        for r in rows:
            if r["player"] == p and r["cents"] is not None and abs(round(r["cents"])) >= 1: t[r["key"]] = int(round(r["cents"]))
        man[p]["tq"] = t
    for p, m in man.items():                       # a vibrato player's short notes are the plain player's: their tuning too
        b = m.get("stacDir")
        if b and "tq" in man.get(b, {}) and "tq" in m:
            m["tq"] = {k: v for k, v in m["tq"].items() if not k.endswith("t")}
            m["tq"].update({k: v for k, v in man[b]["tq"].items() if k.endswith("t")})


def retune_one(r):
    man = json.load(open(os.path.join(BAND, "manifest.json")))
    k = kind_of(r["player"], r["key"])
    c = None if k is None else cents_played(pcm(os.path.join(BAND, man[r["player"]]["dir"], r["key"] + ".mp3")), int(r["key"][:-1]), k, r["player"])
    return dict(r, cents=None if c is None else round(c, 2))


def retune(only):
    """the tuning of the finished files again (after a change to cents()), into the report and the manifest's tq"""
    rep = json.load(open(REPORT)); man = json.load(open(os.path.join(BAND, "manifest.json")))
    players = only or sorted(set(r["player"] for r in rep["notes"]))
    todo = [r for r in rep["notes"] if r["player"] in players]
    with Pool(4) as pool:
        done = list(pool.imap(retune_one, todo, chunksize=4))
    rep["notes"] = [r for r in rep["notes"] if r["player"] not in players] + done
    tq(man, rep["notes"], players)
    json.dump(man, open(os.path.join(BAND, "manifest.json"), "w"), separators=(",", ":"))
    json.dump(rep, open(REPORT, "w"), indent=0)
    report(players)


def relevel_one(r):
    man = json.load(open(os.path.join(BAND, "manifest.json")))
    d = man[r["player"]]["dir"]; od = d[:-3]
    if r["key"].endswith("t") and man[r["player"]].get("stacDir"): return r
    new = pcm(os.path.join(staged(r["player"]), r["key"] + ".wav")); old = pcm(os.path.join(BAND, od, r["key"] + ".mp3"))
    fin, gdb, lim = encode_level(new, old, os.path.join(BAND, d, r["key"] + ".mp3"))
    return dict(r, gain_db=round(gdb, 2), limited_db=round(lim, 2), kb=round(os.path.getsize(os.path.join(BAND, d, r["key"] + ".mp3")) / 1024, 1),
                treble=round(treble(fin)), old_treble=round(treble(old)), src_treble=round(treble(new)), src_air=round(treble(new, 60)))


def relevel(only):
    """every finished note written again at the level that decodes as loud as the old file (after a change to
    encode_level), keeping its tuning (a level does not move a pitch); its treble measured again"""
    rep = json.load(open(REPORT))
    todo = [r for r in rep["notes"] if not only or r["player"] in only]
    with Pool(4) as pool:
        done = {(r["player"], r["key"]): r for r in pool.imap(relevel_one, todo, chunksize=4)}
    rep["notes"] = [done.get((r["player"], r["key"]), r) for r in rep["notes"]]
    json.dump(rep, open(REPORT, "w"), indent=0)
    report(only)


def measure_one(r):
    man = json.load(open(os.path.join(BAND, "manifest.json")))
    d = man[r["player"]]["dir"]; od = d[:-3]
    sd = staged(r["player"])
    return dict(r, treble=round(treble(pcm(os.path.join(BAND, d, r["key"] + ".mp3")))), old_treble=round(treble(pcm(os.path.join(BAND, od, r["key"] + ".mp3")))),
                src_treble=round(treble(pcm(os.path.join(sd, r["key"] + ".wav")))), src_air=round(treble(pcm(os.path.join(sd, r["key"] + ".wav")), 60)))


def measure():
    """the treble of every finished note, its old file and its staged source again (after a change to treble())"""
    rep = json.load(open(REPORT))
    with Pool(4) as pool:
        rep["notes"] = list(pool.imap(measure_one, rep["notes"], chunksize=8))
    json.dump(rep, open(REPORT, "w"), indent=0)
    report()


def report(players=None):
    """per player: notes, channels, old and new size, the median where the treble stops (old file, new file, source), how
    many notes have plain treble in the source (within 60 dB past 16.5 kHz) and how many of those the new file carries past
    16 kHz, the worst line-up, the median gain, the widest tuning correction"""
    rep = json.load(open(REPORT)); rows = rep["notes"]
    ps = players or [p for f in FAMILIES.values() for p in f]
    print("%-18s %3s %2s %7s %7s %6s %6s %6s %7s %6s %5s %5s" % ("player", "n", "ch", "old KB", "new KB", "old Hz", "new Hz", "src Hz", "16k+", "match", "gain", "tune"))
    for p in ps:
        rs = [r for r in rows if r["player"] == p]
        if not rs: continue
        med = lambda k: int(np.median([r[k] for r in rs]))
        air = [r for r in rs if r.get("src_air", 0) >= 16500]
        print("%-18s %3d %2d %7.0f %7.0f %6d %6d %6d %7s %6.3f %+5.1f %5s" % (p, len(rs), rs[0]["ch"], sum(r["old_kb"] for r in rs), sum(r["kb"] for r in rs),
              med("old_treble"), med("treble"), med("src_treble"), "%d/%d" % (sum(1 for r in air if r["treble"] >= 16000), len(air)),
              min(r["match"] for r in rs), float(np.median([r["gain_db"] for r in rs])),
              "-" if all(r["cents"] is None for r in rs) else "%.0f" % max(abs(r["cents"]) for r in rs if r["cents"] is not None)))
    print("total: old %.1f MB, new %.1f MB" % (sum(r["old_kb"] for r in rows if r["player"] in ps) / 1024, sum(r["kb"] for r in rows if r["player"] in ps) / 1024))
    for p, why in rep.get("left", {}).items(): print("left as it was:", p, "-", why)


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "report"
    arg = sys.argv[2].split(",") if len(sys.argv) > 2 else None
    if what == "prep": prep()
    elif what == "build": build(arg or list(FAMILIES))
    elif what == "finish": finish(arg)
    elif what == "measure": measure()
    elif what == "relevel": relevel(arg)
    elif what == "retune": retune(arg)
    elif what == "report": report()
