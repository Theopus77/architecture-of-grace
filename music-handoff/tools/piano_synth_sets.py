#!/usr/bin/env python3
"""The piano's four synthesizer sounds, played by real analog synthesizers (AOG-PIANO-SYNTH-V1, 2026-10-04).

Jimmy: "REAL EVERYTHING if possible". The '70s string synth, the warm synth, the '80s synth brass and the synth lead were
a 1983 transistor organ (Karoryfer's Caveman Cosmonaut) voiced like synthesizers. Now each one is a real analog
synthesizer, recorded from the hardware note by note, by Modular Samples (modularsamples.com), who give their libraries
to everyone as public domain:

  strsynth  Roland Jupiter-4 (1978), its "PWM Strings" patch           github.com/publicsamples/Roland-Jupiter-4
  pad       Roland Jupiter-4 (1978), its "JP4 Normans Pad" patch       (the same library)
  brass     Roland JX-3P (1983), its "Brassy" patch, in stereo         github.com/publicsamples/Roland-JX-3P
            (the JX-3P's own chorus makes its two channels differ)
  lead      Roland JX-3P (1983), its "Buzzy Lead" patch                (the same library)

  License (each repository's LICENSE file, the Unlicense): "This is free and unencumbered content released into the
  public domain. Anyone is free to copy, modify, publish, use, compile, sell, or distribute this content, either in
  source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means."

The recordings sit in each repository's release (zip archives of 0.6 to 1 GB, some split in parts). Only the notes
used are read out of them, by HTTP range requests, and kept in a cache (AOG_SYNTH_CACHE, default: the scratch folder).

The Jupiter-4 records its notes in two identical channels (measured: they agree 99.99 %): one channel is kept (the left).
The JX-3P's "Buzzy Lead" is one channel. "Brassy" keeps both channels as recorded: nothing is added together.

What each note gets, in the format of the piano's other held sets (piano_real_sets.py):
  - the recording nearest the note (most of these patches sound an octave under the key they were recorded on: the
    pitch of every recording is measured, and the note is chosen by the pitch it sounds); retuned to A = 440 by
    resampling (both channels alike), measured again in the finished file the way the page's check measures it
  - a note every third key, C1 to C7; where the synthesizer's recorded range stops (C1 to C6 on most patches; C2 to C7
    on "Brassy"), its last recording is moved in pitch
  - the rumble under the note taken out (a high-pass at a third of its pitch)
  - a held note repeats from loop[0] to its own end (SETS.ends): the end is chosen within 2 to 3.4 s of the start (1.4 s for a
    recording moved far up, which it plays fast), where
    the recording matches itself best; from the loop's start on, the note is that stretch repeated, joined over 50 ms
    (250 ms where a chorus keeps the sound moving, so short stretches never match) by the gains that keep its level for how alike the two sides are; the half second before the end pre-faded so the
    page's own blend rebuilds the note (piano_real_sets.make_loop). A recording that slowly fades while held has the
    fade evened out from its loop's start (a straight line in decibels, measured), so the loop holds one level
  - every note of a set at one loudness (K-weighted, loudest 400 ms, -21 dB); peaks under 0.93
  - MP3 at 44,100 Hz: one channel at 96 kbps, or two channels at 128 kbps ("Brassy")

usage:  python3 music-handoff/tools/piano_synth_sets.py [--only strsynth,pad,brass,lead]
Writes aog-deploy/audio/piano/<dir>/ and music-handoff/tools/piano_synth_sets.json (the SETS entries for the page, and
where every file came from). Needs numpy, scipy and ffmpeg with libmp3lame.
"""
import os, sys, io, re, json, math, argparse, zipfile, subprocess, urllib.request, urllib.parse
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import piano_real_sets as P                      # the shared helpers: resampling, pitch, levels, loops, MP3s

SR = P.SR
REPO = P.REPO
OUT = os.path.join(REPO, "aog-deploy", "audio", "piano")
MANIFEST = os.path.join(HERE, "piano_synth_sets.json")
CACHE = os.environ.get("AOG_SYNTH_CACHE", "/tmp/claude-0/-home-user-architecture-of-grace/007b86b8-89fa-5b41-87cd-28069b45d25f/scratchpad/synthcache")
LEVEL_DB = -21.0
PEAK_MAX = 0.93
LICENSE = ("The Unlicense: \"This is free and unencumbered content released into the public domain. Anyone is free to copy, "
           "modify, publish, use, compile, sell, or distribute this content ... for any purpose, commercial or "
           "non-commercial, and by any means.\"")

J4 = "https://github.com/publicsamples/Roland-Jupiter-4"
JX = "https://github.com/publicsamples/Roland-JX-3P"
ZIPS = {
    "jp4misc": [J4 + "/releases/download/1.0/Misc.zip.001", J4 + "/releases/download/1.0/Misc.zip.002"],
    "jp4pads": [J4 + "/releases/download/1.0/Pads.zip.%03d" % i for i in (1, 2, 3, 4)],
    "jx3p": [JX + "/releases/download/1.0/RolandJX-3P.zip.%03d" % i for i in (1, 2, 3)],
}
RAW = "https://raw.githubusercontent.com/publicsamples/%s/master/%s"

# name: dir, archive, folder in it, how a file names its key, keys -> sounding (semitones), channel, loop start P0 (s),
#       the synthesizer and patch, the repository
DEFS = {
    "strsynth": dict(dir="synthstr", zip="jp4misc", folder="Misc/Audio/PWM Strings-SAMPLES/", key=r"PWM Strings-(\d+)-127",
                     off=-12, chan="left", P0=1.0, synth="Roland Jupiter-4 (1978)", patch="PWM Strings", repo=J4),
    "pad": dict(dir="synthpad", zip="jp4pads", folder="Pads/Audio/JP4 Normans Pad/", key=r"Normans Pad-(\d+)-127",
                off=-12, chan="left", P0=1.5, synth="Roland Jupiter-4 (1978)", patch="JP4 Normans Pad", repo=J4),
    "brass": dict(dir="synthbrass", zip="jx3p", folder="RolandJX-3P/Audio/Brassy/", sfz=("Roland-JX-3P", "SFZ/Brassy.sfz"),
                  off=0, chan="stereo", P0=1.25, synth="Roland JX-3P (1983)", patch="Brassy", repo=JX),
    "lead": dict(dir="synthlead", zip="jx3p", folder="RolandJX-3P/Audio/Buzzy Lead/", key=r"/(\d+)[A-G]#?-?\d+-[A-Z0-9]+\.aif$",
                 off=-12, chan="left", P0=0.8, synth="Roland JX-3P (1983)", patch="Buzzy Lead", repo=JX),
}
LMIN, LMAX = 2.0, 3.4
LMIN_SHORT = 1.4


# ══════════════════════════════════════════════════════════════════════════
#  reading members of a remote zip (HTTP range requests), into the cache
# ══════════════════════════════════════════════════════════════════════════
class HTTPFile(io.RawIOBase):
    def __init__(self, url):
        self.url, self.pos, self.cache = url, 0, {}
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "aog-build"})
        with urllib.request.urlopen(req, timeout=120) as r:
            self.size = int(r.headers["Content-Length"])
    def seekable(self): return True
    def readable(self): return True
    def tell(self): return self.pos
    def seek(self, off, whence=0):
        self.pos = off if whence == 0 else (self.pos + off if whence == 1 else self.size + off)
        return self.pos
    def _get(self, a, b):
        req = urllib.request.Request(self.url, headers={"Range": "bytes=%d-%d" % (a, b - 1), "User-Agent": "aog-build"})
        err = None
        for _ in range(5):
            try:
                with urllib.request.urlopen(req, timeout=300) as r:
                    return r.read()
            except Exception as e:
                err = e
        raise err
    def read(self, n=-1):
        if n is None or n < 0:
            n = self.size - self.pos
        n = min(n, self.size - self.pos)
        if n <= 0:
            return b""
        BLK = 1 << 16
        if n < BLK:                                   # small reads (the zip's directory): 64 KB blocks, kept
            out, p = b"", self.pos
            while len(out) < n:
                b = p // BLK
                if b not in self.cache:
                    self.cache[b] = self._get(b * BLK, min(self.size, (b + 1) * BLK))
                take = self.cache[b][p - b * BLK:p - b * BLK + (n - len(out))]
                if not take:
                    break
                out += take; p += len(take)
            self.pos = p
            return out
        d = self._get(self.pos, self.pos + n)
        self.pos += len(d)
        return d
    def readinto(self, b):
        d = self.read(len(b)); b[:len(d)] = d; return len(d)


class Parts(io.RawIOBase):
    """a zip split into parts (.001, .002, ...): the parts read as one file"""
    def __init__(self, urls):
        self.parts = [HTTPFile(u) for u in urls]; self.size = sum(p.size for p in self.parts); self.pos = 0
    def seekable(self): return True
    def readable(self): return True
    def tell(self): return self.pos
    def seek(self, off, whence=0):
        self.pos = off if whence == 0 else (self.pos + off if whence == 1 else self.size + off)
        return self.pos
    def read(self, n=-1):
        if n is None or n < 0:
            n = self.size - self.pos
        out, base = b"", 0
        for p in self.parts:
            if len(out) >= n:
                break
            if self.pos < base + p.size:
                p.seek(self.pos - base)
                d = p.read(min(n - len(out), base + p.size - self.pos)); out += d; self.pos += len(d)
            base += p.size
        return out
    def readinto(self, b):
        d = self.read(len(b)); b[:len(d)] = d; return len(d)


_Z = {}
def archive(key):
    if key not in _Z:
        _Z[key] = zipfile.ZipFile(Parts(ZIPS[key]))
    return _Z[key]


def members(key, folder):
    return [i for i in archive(key).infolist() if i.filename.startswith(folder) and not i.is_dir()
            and i.filename.lower().endswith((".aif", ".aiff", ".wav")) and "/." not in i.filename]


def cached(key, info):
    p = os.path.join(CACHE, key, info.filename)
    if not (os.path.exists(p) and os.path.getsize(p) == info.file_size):
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with archive(key).open(info) as s, open(p + ".part", "wb") as d:
            d.write(s.read())
        os.replace(p + ".part", p)
    return p


def raw_text(repo, path):
    p = os.path.join(CACHE, "raw", repo, path)
    if not os.path.exists(p):
        os.makedirs(os.path.dirname(p), exist_ok=True)
        data = urllib.request.urlopen(RAW % (repo, urllib.parse.quote(path)), timeout=120).read()
        open(p, "wb").write(data)
    return open(p, encoding="utf-8", errors="replace").read()


def recordings(name):
    """{key: zip member} for a patch"""
    d = DEFS[name]
    ms = members(d["zip"], d["folder"])
    out = {}
    if "sfz" in d:                                    # the files are not named by key: the library's own mapping says
        s = raw_text(*d["sfz"])
        by = {m.filename.rsplit("/", 1)[-1]: m for m in ms}
        for g in s.split("<group>"):
            k = re.search(r"\bkey=(\d+)", g); f = re.search(r"sample=(.*?\.aif)", g)
            if k and f and f.group(1).rsplit("/", 1)[-1] in by:
                out[int(k.group(1))] = by[f.group(1).rsplit("/", 1)[-1]]
    else:
        for m in ms:
            k = re.search(d["key"], m.filename)
            if k:
                out.setdefault(int(k.group(1)), m)
    return out


# ══════════════════════════════════════════════════════════════════════════
#  one note
# ══════════════════════════════════════════════════════════════════════════
def load(path, chan):
    x = P.load(path)                                  # (frames, channels) float64 at 44.1 kHz
    if x.shape[1] == 2:
        a, b = x[:, 0], x[:, 1]
        agree = float(np.dot(a, b) / math.sqrt(np.dot(a, a) * np.dot(b, b) + 1e-30))
    else:
        agree = 1.0
    if chan == "left" or x.shape[1] == 1:
        return x[:, :1].copy(), agree
    return x[:, :2].copy(), agree


def mono_view(y):
    """for measuring only (where a note starts, its pitch, how alike two moments are): the channels' mean"""
    return y.mean(axis=1)


def usable_end(m, f):
    """seconds of the recording before its key was let go: after the first second, the first 50 ms whose level is 4 dB
    under the level 0.3 s before it (a held note's own slow fade is far slower than that; the release is fast)"""
    w = int(0.05 * SR)
    n = len(m) // w
    e = 20 * np.log10(np.sqrt(np.mean(m[:n * w].reshape(n, w) ** 2, axis=1)) + 1e-12)
    for i in range(int(1.0 / 0.05), n):
        if e[i] < e[i - 6] - 4.0:
            return (i - 6) * 0.05
    return n * 0.05 - 0.05


def even_out(y, P0, z):
    """a held note that slowly fades: from P0 on, the fade (a straight line in dB, fitted from P0 to z) taken out"""
    m = mono_view(y)
    w = int(0.05 * SR)
    a, b = int(P0 * SR), min(len(m), int(z * SR))
    n = (b - a) // w
    if n < 8:
        return y, 0.0
    lv = 20 * np.log10(np.sqrt(np.mean(m[a:a + n * w].reshape(n, w) ** 2, axis=1)) + 1e-12)
    t = (np.arange(n) + 0.5) * 0.05
    slope = float(np.polyfit(t, lv, 1)[0])
    tt = np.arange(len(m)) / SR - P0
    g = 10 ** (-slope * np.clip(tt, 0, None) / 20)
    return y * g[:, None], slope


def best_loop(m, P0, lo, hi, W=0.05):
    """the loop length in [lo, hi] (1 ms steps, then to the sample) where the 50 ms before P0 + L best matches the
    50 ms before P0"""
    Ws, p = int(W * SR), int(P0 * SR)
    ref = m[p - Ws:p]
    best = (-2, None)
    for L in range(int(lo * SR), int(hi * SR) + 1, int(0.001 * SR)):
        r = P.corr(m[p + L - Ws:p + L], ref)
        if r > best[0]:
            best = (r, L)
    c, L0 = best
    for L in range(L0 - 22, L0 + 23):
        r = P.corr(m[p + L - Ws:p + L], ref)
        if r > c:
            c, L0 = r, L
    return L0 / SR, c


def pitch_in_loop(y, n, a, z):
    """the note's pitch as the page's check reads a held set (precs.js: "harm", from loop[0] to loop's end - 0.6 s,
    counted from the note's start)"""
    m = mono_view(y)
    on = P.onset_of(m)
    seg = m[on + int(a * SR):on + int((z - 0.6) * SR)]
    return P.pitch_harm(seg, P.mtof(n), 0, len(seg) / SR, ks=(1, 2, 3, 4, 5, 6), span_c=60)


def write(path, y):
    """mono at 96 kbps (as the other sets), or stereo at 128 kbps; then decoded and measured as the page does"""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if y.shape[1] == 1:
        on, head = P.write_struck(path, y[:, 0], max_cut=0.002)
        return on, head
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-codec:a", "libmp3lame", "-b:a", "128k", "-compression_level", "0", "-ar", str(SR), "-ac", "2", path],
                   input=np.clip(y, -1, 1).astype(np.float32).tobytes(), check=True)
    d = decode(path)
    m = np.abs(d).max(axis=1)
    pk = m.max()
    on = int(np.argmax(m >= 0.03 * pk))
    return on / SR, float(m[:4].max() / pk)


def decode(path):
    ch = P.load(path).shape[1]
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, ch)


def kw_level(y):
    """K-weighted, loudest 400 ms; two channels: their mean power"""
    k = np.stack([P.kweight(y[:, c]) ** 2 for c in range(y.shape[1])], axis=1).mean(axis=1)
    W, hop = int(0.4 * SR), int(0.05 * SR)
    c = np.concatenate([[0], np.cumsum(k)])
    best = max((c[i + W] - c[i]) / W for i in range(0, len(k) - W, hop))
    return 10 * np.log10(best + 1e-15)


def build(name):
    d = DEFS[name]
    recs = recordings(name)
    keys = sorted(recs)
    sounding = {k: k + d["off"] for k in keys}
    notes = P.grid(0)
    P0 = d["P0"]
    a = round(P0 + P.LOOP_X + P.DEC_DELAY + 0.01, 2)
    out_dir = os.path.join(OUT, d["dir"])
    os.makedirs(out_dir, exist_ok=True)
    for f in os.listdir(out_dir):
        if f.endswith(".mp3"):
            os.unlink(os.path.join(out_dir, f))
    files, ends, info = {}, {}, {}
    for n in notes:
        # the recording nearest the note that was held long enough for the loop (a few were let go early: then the
        # next nearest, at most 2 keys further)
        f_t = P.mtof(n)
        for k in sorted(keys, key=lambda k: (abs(sounding[k] - n), k)):
            if abs(sounding[k] - n) > abs(min(sounding.values(), key=lambda s: abs(s - n)) - n) + 2:
                raise SystemExit("%s %d: no recording near it was held long enough" % (name, n))
            src = cached(d["zip"], recs[k])
            x, agree = load(src, d["chan"])
            f_guess = P.mtof(sounding[k])
            mx = mono_view(x)
            f_src = P.pitch_harm(mx, f_guess, 1.0, min(3.0, len(mx) / SR - 0.2), ks=(1, 2, 3, 4, 5, 6), span_c=60)
            held = usable_end(mx, f_src)
            ratio = f_t / f_src
            hi = min(LMAX, held / ratio - P0 - 0.08)
            lo = LMIN if hi >= LMIN else LMIN_SHORT        # a note moved far up plays its recording fast: a shorter loop
            if hi >= lo:
                break
            print("%-8s %2d: key %d was let go after %.1f s, too soon for the loop" % (name, n, k, held))

        def make(ratio):
            need = int((P0 + hi + 0.2) * SR * ratio) + 64
            y = np.stack([P.resample(x[:need, c], ratio) for c in range(x.shape[1])], axis=1)
            y = np.stack([P.hp(y[:, c], max(20.0, 0.33 * f_t), order=4) for c in range(y.shape[1])], axis=1)
            m = mono_view(y)
            on = P.onset_of(m)
            L8 = int(0.0008 * SR)
            if on < L8:
                y = np.concatenate([np.zeros((L8 - on, y.shape[1])), y]); on = L8
            y = y[on - L8:].copy()
            y[:L8] *= (np.sin(np.linspace(0, np.pi / 2, L8)) ** 2)[:, None]
            y[0] = 0.0
            y, slope = even_out(y, P0, P0 + hi)
            # a chorus (the JX-3P's) keeps moving, so two 50 ms stretches rarely match: then the loop is chosen, and
            # joined, over 250 ms, where the chorus's slow sweep lines up
            XW = 0.05
            L, rho0 = best_loop(mono_view(y), P0, lo, hi, W=XW)
            if rho0 < 0.9:
                XW = 0.25
                L, rho0 = best_loop(mono_view(y), P0, lo, hi, W=XW)
            z = round(a + L, 6)
            n_total = int(round((z + 0.06) * SR))
            chans, rhos = [], []
            for c in range(y.shape[1]):
                o, rho, _ = P.periodize(y[:, c], P0, L, n_total, W=XW)
                chans.append(P.page_prefade(o, z)); rhos.append(rho)
            return np.stack(chans, axis=1), z, L, slope, min(rhos)

        y, z, L, slope, rho = make(ratio)
        for _ in range(3):                             # tuned as the page's check hears it
            res = 1200 * math.log2(pitch_in_loop(y, n, a, z) / f_t)
            if abs(res) < 0.5:
                break
            ratio *= 2 ** (-res / 1200)
            y, z, L, slope, rho = make(ratio)
        lvl = kw_level(y)
        y *= 10 ** ((LEVEL_DB - lvl) / 20)
        pk = float(np.abs(y).max())
        if pk > PEAK_MAX:
            y *= PEAK_MAX / pk
        path = os.path.join(out_dir, "%dm.mp3" % n)
        on, head = write(path, y)
        back = decode(path)
        cents = 1200 * math.log2(pitch_in_loop(back, n, a, z) / f_t)
        ends[n] = round(z, 6)
        rel = recs[k].filename
        files["%dm" % n] = {"from": "%s release 1.0: %s" % (d["repo"].split("/")[-1], rel), "recorded_key": k,
                             "sounds": sounding[k], "source_cents": round(1200 * math.log2(f_src / f_guess), 1),
                             "shift_semitones": round(12 * math.log2(f_t / f_src), 2), "channels": y.shape[1],
                             "channels_agree": round(agree, 4), "held_s": round(held, 2), "fade_evened_db_s": round(slope, 2),
                             "loop": [a, round(z, 4)], "seam_match": round(rho, 4), "level_db": round(lvl, 1),
                             "peak": round(min(pk, PEAK_MAX), 3), "cents_after": round(cents, 2),
                             "onset_ms": round(1000 * on, 2), "first_samples": round(head, 4)}
        print("%-8s %2d <- key %2d (sounds %2d, %+5.1f c)  shift %+6.2f st  loop %.2f-%.3f  seam %.3f  fade %+.2f dB/s  "
              "%d ch  tuned %+.2f c" % (name, n, k, sounding[k], files["%dm" % n]["source_cents"],
                                        files["%dm" % n]["shift_semitones"], a, z, rho, slope, y.shape[1], cents), flush=True)
    entry = {"dir": "/audio/piano/%s/" % d["dir"], "layers": ["m"], "even": True, "loop": [a, max(ends.values())],
             "ends": {str(n): ends[n] for n in notes}, "notes": notes}
    size = sum(os.path.getsize(os.path.join(out_dir, f)) for f in os.listdir(out_dir))
    print("%s: %d notes, %.2f MB" % (name, len(notes), size / 1e6))
    return {"sets_entry": entry, "pitch": "harm", "bytes": size, "files": files,
            "made_from": "%s, its \"%s\" patch, recorded from the hardware by Modular Samples (%s), public domain (%s)"
                         % (d["synth"], d["patch"], d["repo"], LICENSE)}


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--only", default="", help="comma-separated: strsynth,pad,brass,lead")
    a = ap.parse_args()
    try:
        man = json.load(open(MANIFEST))
    except (OSError, ValueError):
        man = {"sets": {}}
    for name in (a.only.split(",") if a.only else list(DEFS)):
        man["sets"][name] = build(name)
        with open(MANIFEST, "w") as fh:
            json.dump(man, fh, indent=1)


if __name__ == "__main__":
    main()
