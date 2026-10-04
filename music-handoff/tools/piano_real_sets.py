#!/usr/bin/env python3
"""The piano bench's last sounds that were built on the page, made from real recordings instead.

Sixteen sample sets for aog-deploy/music-piano.html, in the format of the recorded sets it already has
(see piano_vsco_sets.py): one folder per set under aog-deploy/audio/piano/, one MP3 per note and layer named
<midi><layer>.mp3 (layer s, m or l), mono, 44,100 samples a second, 96 kbps; the quiet moment before the note
trimmed; each note retuned to A = 440 by resampling (the measured offset is baked in); each set's notes brought to
one loudness (K-weighted, loudest 400 ms) with the soft and loud layers 5 dB under and 4 dB over the middle one.

Every set covers the keys the page plays (C1 to C7, MIDI 24 to 96) with no more than three semitones between
recorded notes, so no key is played more than one semitone away from its recording. Where the instrument itself
stops short of that range, the end notes are its own lowest or highest recording moved in pitch (resampled); the
manifest says which.

Held sounds (organs, accordion, choir, synths) loop on the page between loop[0] and loop[1] seconds, the way the
soft strings do: the page's bakeLoop() blends the half second before loop[1] into the half second before loop[0]
with an equal-power (cos/sin) crossfade. Here every held note is made exactly periodic over that loop, and the half
second before loop[1] is pre-faded (by tan(pi/4 - w/2)) so that the page's own blend rebuilds the note exactly:
no seam, no swell, whether or not the browser's MP3 decoder removes the encoder delay (designed for the middle of
the two cases; off by at most 0.35 dB for 0.1 s at either end). Steady tones are retuned to a whole number of
cycles per loop (within 2 cents) so the loop's own seam falls on a matching cycle.

What each set is made from (all real recordings; licenses checked in each repository):
  epreed     Wurlitzer EP200 (Greg Sullivan E-Pianos, CC BY 3.0): mp, f and ff as s, m, l
  accordion  Button Accordion HN, a Hohner (FreePats, CC0)
  celesta    stamperadam's celesta (Freesound pack 6166, via Virtual Playing Orchestra 3; CC0): soft as m, hard as l
  steel      jSteelDrum v2, a Trinidad tenor pan (Jeff Learman; Unlicense, public domain): layers 2, 3 and 5 of 5
  clav       Yamaha TX81Z "Clavisynth" patch, sampled from the hardware (VCSL, CC0): vl1, vl2, vl3 as s, m, l
  organ, gospel, rockorgan, strsynth, pad, brass, lead
             Unitra B-11 transistor organ (Karoryfer Caveman Cosmonaut, CC0), voices chosen and mixed per set
  theatre    the Quiet manual of Simon Dalzell's pipe organ (VS Chamber Orchestra: Community Edition, CC0),
             stopped flutes at 16', 8' and 4'
  choir      one singer on "ah" (Karoryfer Hadzi-Fia, from sfzinstruments/legato_vocal_tutorial, CC0), four takes
             layered per note
  musicbox, toy
             the celesta above (soft and short; hard, short and a little out of tune)

usage:
  python3 music-handoff/tools/piano_real_sets.py --sources <dir with the clones> [--fetch] [--only a,b] [--out DIR]
  --fetch clones any missing source (blobless, sparse) at the commit listed in SOURCES.
Writes the MP3s and music-handoff/tools/piano_real_sets.json (the SETS entries for the page, and where every file
came from). Needs python3 with numpy and scipy, and ffmpeg with libmp3lame.
"""
import os, sys, json, math, argparse, subprocess, tempfile, re
import numpy as np
from scipy.signal import butter, sosfilt, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
SR = 44100
KEY_LO, KEY_HI = 24, 96                      # the page's keyboard: C1 to C7
LOOP_X = 0.5                                 # the page's bakeLoop crossfade, seconds
DEC_DELAY = 1105 / SR                        # MP3 encoder + decoder delay a browser may or may not remove
PEAK_MAX = 0.93

# ── the sources: folder, repository, commit, sparse paths ──
SOURCES = {
    "wurli": ("GregSullivan.E-Pianos", "https://github.com/sfzinstruments/GregSullivan.E-Pianos",
              "8c3e581acda3594b553948ff0222d4f84a698376", ["/LICENSE", "/README.md", "/Wurlitzer EP200/"]),
    "accordion": ("freepats.button-accordion-HN", "https://github.com/freepats/button-accordion-HN",
                  "d70d16456fd99305d1c24c612b205ab38846eb0f", None),
    "celesta": ("VPO3.celesta", "https://github.com/open-soundfonts/Virtual_Playing_Orchestra_3",
                "b0afa0f570e0e33c83da9bc4e626a4a239714dff", ["/Keys/celesta.sfz", "/libs/stamperadam/", "/README.md"]),
    "steel": ("jlearman.SteelDrum", "https://github.com/sfzinstruments/jlearman.SteelDrum",
              "dc15a36ad69a43b0d240fcbd0cc78fbc61b2b47e", None),
    "clav": ("VCSL.TX81Z-Clavisynth", "https://github.com/sgossner/VCSL",
             "c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e", ["/LICENSE", "/README.md", "/Electrophones/TX81Z/"]),
    "caveman": ("karoryfer.caveman-cosmonaut", "https://github.com/sfzinstruments/karoryfer.caveman-cosmonaut",
                "9de9bcfcbc6d2b20bea5c1116cd07a310febc339", None),
    "voice": ("legato_vocal_tutorial", "https://github.com/sfzinstruments/legato_vocal_tutorial",
              "fac6461ee4c7f498b23246eced644616fa58d2ec", ["/LICENSE", "/readme.txt", "/Samples/vowel_sustain/"]),
    "pipes": ("VSCO2CE.organ", "https://github.com/sgossner/VSCO-2-CE",
              "440300901dfe9275fd84e0b7763af1f8443ae62e", ["/Keys/Organ/", "/README.md", "/LICENSE", "/Readme.txt"]),
}
SRC_ROOT = None


def src(key, *parts):
    return os.path.join(SRC_ROOT, SOURCES[key][0], *parts)


def fetch(root):
    """clone each missing source: blobless, sparse where a path list is given, then check out the pinned commit"""
    os.makedirs(root, exist_ok=True)
    for key, (folder, url, commit, paths) in SOURCES.items():
        d = os.path.join(root, folder)
        if os.path.isdir(d):
            continue
        subprocess.run(["git", "clone", "-q", "--filter=blob:none", "--no-checkout", url, d], check=True)
        if paths:
            subprocess.run(["git", "-C", d, "sparse-checkout", "set", "--no-cone"] + paths, check=True)
        subprocess.run(["git", "-C", d, "checkout", "-q", commit], check=True)


# ══════════════════════════════════════════════════════════════════════════
#  sound in and out
# ══════════════════════════════════════════════════════════════════════════
def load(path):
    """any audio file → float64 array (frames, channels) at 44,100 Hz"""
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=channels",
                          "-of", "csv=p=0", path], capture_output=True, text=True, check=True).stdout
    ch = int(out.strip().split(",")[0])
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, ch)


def to_mono(x):
    """two microphones → one: the second is moved by the delay (within 3 ms) that lines it up best with the first"""
    if x.shape[1] == 1:
        return x[:, 0].copy()
    a, b = x[:, 0], x[:, 1]
    n = min(len(a), int(1.5 * SR))
    ml = int(0.003 * SR)
    N = 1 << int(math.ceil(math.log2(2 * n)))
    c = np.fft.irfft(np.fft.rfft(a[:n], N) * np.conj(np.fft.rfft(b[:n], N)), N)
    c = np.concatenate([c[-ml:], c[:ml + 1]])
    lag = int(np.argmax(c)) - ml               # b lags a by -lag
    if lag > 0:
        b = np.concatenate([np.zeros(lag), b[:-lag]])
    elif lag < 0:
        b = np.concatenate([b[-lag:], np.zeros(-lag)])
    return 0.5 * (a + b)


def write_mp3(path, y):
    """mono, 44,100 Hz, 96 kbps MP3 (LAME's most careful mode), with the gapless header browsers use to drop the
    encoder delay"""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    y = np.clip(y, -1, 1).astype(np.float32)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-codec:a", "libmp3lame", "-b:a", "96k", "-compression_level", "0", "-ar", str(SR), "-ac", "1",
                    path], input=y.tobytes(), check=True)


def decode_mp3(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def measure_mp3(path):
    d = decode_mp3(path)
    pk = np.max(np.abs(d))
    return onset_of(d) / SR, float(np.max(np.abs(d[:4])) / pk)


def write_struck(path, y):
    """a note that starts with a strike: written, then decoded and measured as the page measures it. A slow strike
    whose onset lands past 1.6 ms loses a little of the silence in front; if the MP3's pre-echo lifts the very first
    samples over 0.6% of the peak, a little silence is added in front until it does not. Returns (onset s, head)."""
    L = int(0.0008 * SR)
    for _ in range(3):
        write_mp3(path, y)
        on, head = measure_mp3(path)
        if on <= 0.0016:
            break
        cut = int((on - 0.0009) * SR)
        y = np.concatenate([y[cut:], np.zeros(cut)])
        y[:L] *= np.sin(np.linspace(0, np.pi / 2, L)) ** 2
        y[0] = 0.0
    if head <= 0.006:
        return on, head
    best = (head, 0, on)

    def shifted(sh):
        if sh >= 0:
            return np.concatenate([np.zeros(sh), y])[:len(y)]
        z = np.concatenate([y[-sh:], np.zeros(-sh)])
        k = max(2, L + sh)
        z[:k] *= np.sin(np.linspace(0, np.pi / 2, k)) ** 2
        z[0] = 0.0
        return z
    for sh in (4, 8, -6, 12, 16, -12, 20, 24, 28, 32, 36, 40):
        write_mp3(path, shifted(sh))
        on2, head2 = measure_mp3(path)
        if 0.0003 <= on2 <= 0.00195 and head2 < best[0]:
            best = (head2, sh, on2)
        if 0.0003 <= on2 <= 0.00195 and head2 <= 0.006:
            return on2, head2
    write_mp3(path, shifted(best[1]))
    return best[2], best[0]


# ══════════════════════════════════════════════════════════════════════════
#  resampling: a Kaiser-windowed sinc read at any positions (pitch moves, vibrato, scoops)
# ══════════════════════════════════════════════════════════════════════════
def sinc_read(x, pos, rate, zc=32, beta=8.6):
    """y[n] = x at fractional position pos[n]; rate = how fast pos advances (>1: higher pitch, so the band is
    narrowed to keep it clean)"""
    pos = np.asarray(pos, dtype=np.float64)
    fc = 0.97 * min(1.0, 1.0 / max(rate, 1e-9))
    half = int(math.ceil(zc / fc))
    k = np.arange(-half + 1, half + 1)
    out = np.zeros(len(pos))
    N = len(x)
    xp = np.concatenate([np.zeros(half + 1), x, np.zeros(half + 1)])
    step = max(256, int(3_000_000 / len(k)))
    i0all = np.floor(pos).astype(np.int64)
    for s in range(0, len(pos), step):
        i0 = i0all[s:s + step]
        fr = pos[s:s + step] - i0
        t = fr[:, None] - k[None, :]
        u = np.clip(t / half, -1, 1)
        h = fc * np.sinc(fc * t) * np.i0(beta * np.sqrt(1 - u * u)) / np.i0(beta)
        idx = i0[:, None] + k[None, :] + half + 1
        idx = np.clip(idx, 0, len(xp) - 1)
        out[s:s + step] = np.sum(xp[idx] * h, axis=1)
    return out


def resample(x, ratio, n_out=None):
    """read x `ratio` times as fast (ratio 2 = an octave up, half as long)"""
    if n_out is None:
        n_out = int((len(x) - 1) / ratio) + 1
    return sinc_read(x, np.arange(n_out) * ratio, ratio)


# ══════════════════════════════════════════════════════════════════════════
#  measuring
# ══════════════════════════════════════════════════════════════════════════
def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def onset_of(y, thr=0.03):
    pk = np.max(np.abs(y))
    return int(np.argmax(np.abs(y) > thr * pk))


def kweight(d):
    """the K-weighting the other sets use (a 60 Hz high-pass and a 4 dB shelf over 1.5 kHz)"""
    def rbj(kind, f, Q, dB):
        w = 2 * np.pi * f / SR; cw = np.cos(w); al = np.sin(w) / (2 * Q); A = 10 ** (dB / 40)
        if kind == "hp":
            b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]; a = [1 + al, -2 * cw, 1 - al]
        else:
            sq = 2 * np.sqrt(A) * al
            b = [A * ((A + 1) + (A - 1) * cw + sq), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - sq)]
            a = [(A + 1) - (A - 1) * cw + sq, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - sq]
        return np.array(b) / a[0], np.array(a) / a[0]
    for k in (rbj("hp", 60, 0.5, 0), rbj("hs", 1500, 0.7, 4)):
        d = lfilter(k[0], k[1], d)
    return d


def kw_level(y, t1=None):
    """K-weighted level of the loudest 400 ms (dB), the way the other sets were levelled"""
    seg = y if t1 is None else y[:int(t1 * SR)]
    kw = kweight(seg) ** 2
    W, hop = int(0.4 * SR), int(0.05 * SR)
    if len(kw) <= W:
        return 10 * np.log10(kw.mean() + 1e-15)
    c = np.concatenate([[0], np.cumsum(kw)])
    best = max((c[i + W] - c[i]) / W for i in range(0, len(kw) - W, hop))
    return 10 * np.log10(best + 1e-15)


def spectrum(seg, n=None):
    if n is None:
        n = 1 << max(18, int(math.ceil(math.log2(4 * len(seg)))))
    return np.abs(np.fft.rfft(seg * np.hanning(len(seg)), n)), n


def peak_near(S, n, f, span_c=60):
    lo = int(f * 2 ** (-span_c / 1200) * n / SR)
    hi = int(f * 2 ** (span_c / 1200) * n / SR) + 1
    if hi >= len(S) - 1 or lo < 1:
        return None
    i = lo + int(np.argmax(S[lo:hi]))
    a, b, c = np.log(S[i - 1] + 1e-15), np.log(S[i] + 1e-15), np.log(S[i + 1] + 1e-15)
    den = a - 2 * b + c
    p = 0.5 * (a - c) / den if den != 0 else 0.0
    return (i + p) * SR / n, S[i]


def pitch_harm(y, f_guess, t0, t1, ks=(1, 2, 3, 4, 5, 6), span_c=60):
    """the fundamental from the peaks near k*f (each divided by k), weighted by strength; strong peaks only"""
    seg = y[int(t0 * SR):int(t1 * SR)]
    S, n = spectrum(seg)
    est = []
    for k in ks:
        r = peak_near(S, n, k * f_guess, span_c)
        if r:
            est.append((r[0] / k, r[1]))
    mx = max(e[1] for e in est)
    est = [e for e in est if e[1] > 0.1 * mx]
    w = np.array([e[1] for e in est]); f = np.array([e[0] for e in est])
    return float(np.sum(w * f) / np.sum(w))


def pitch_centroid(y, f_guess, t0, t1, ks=(1, 2, 3, 4), span_c=45):
    """two reeds a little apart (an accordion): the power-weighted mean frequency around each harmonic, over k"""
    seg = y[int(t0 * SR):int(t1 * SR)]
    S, n = spectrum(seg)
    P = S ** 2
    num = den = 0.0
    for k in ks:
        lo = int(k * f_guess * 2 ** (-span_c / 1200) * n / SR); hi = int(k * f_guess * 2 ** (span_c / 1200) * n / SR) + 1
        if hi >= len(P):
            break
        fr = np.arange(lo, hi + 1) * SR / n
        pw = P[lo:hi + 1]
        fk = np.sum(fr * pw) / np.sum(pw)
        num += np.sum(pw) * fk / k
        den += np.sum(pw)
    return float(num / den)


def pitch_as_checked(y, n, method):
    """the pitch of a finished struck note exactly as music-handoff/tests/pianosets.js measures it: from 30 ms
    after the onset for 0.35 to 0.7 s (longer for low notes), by the set's method"""
    on = onset_of(y)
    a = on + int(round(0.03 * SR))
    b = min(len(y) - int(round(0.05 * SR)), on + int(round(max(0.35, min(0.7, 60 / mtof(n))) * SR)))
    seg = y[a:b]
    if method == "centroid":
        return pitch_centroid(seg, mtof(n), 0, len(seg) / SR, ks=(1, 2, 3, 4), span_c=60)
    ks = (1,) if method == "fund" else (1, 2, 3, 4, 5, 6)
    return pitch_harm(seg, mtof(n), 0, len(seg) / SR, ks=ks, span_c=60)


def period_exact(y, f0, a, b):
    """the period of a steady tone to a tiny fraction of a sample: the lag near a whole number of cycles
    (spanning most of [a, b] seconds) where the tone best matches itself"""
    P = SR / f0
    A, B = int(a * SR), int(b * SR)
    W = int(min(0.25 * SR, (B - A) * 0.3))
    M = int((B - A - W - 4 * P) / P)
    if M < 4:
        return P
    lag0 = M * P
    x0 = y[A:A + W]
    best = None
    lo, hi = int(lag0 - 0.5 * P), int(lag0 + 0.5 * P) + 1
    cs = []
    for L in range(lo, hi + 1):
        x1 = y[A + L:A + L + W]
        cs.append(np.dot(x0, x1) / math.sqrt(np.dot(x0, x0) * np.dot(x1, x1) + 1e-30))
    cs = np.array(cs)
    i = int(np.argmax(cs))
    t = lo + i
    if 0 < i < len(cs) - 1:
        den = cs[i - 1] - 2 * cs[i] + cs[i + 1]
        if den != 0:
            t += 0.5 * (cs[i - 1] - cs[i + 1]) / den
    return t / M


def decay_rate(y, t0, t1):
    """dB per second of a decaying note between t0 and t1 (a straight line through its 50 ms levels)"""
    w = int(0.05 * SR)
    a, b = int(t0 * SR), int(t1 * SR)
    seg = y[a:b]
    n = len(seg) // w
    if n < 4:
        return None
    r = np.sqrt(np.mean(seg[:n * w].reshape(n, w) ** 2, axis=1))
    db = 20 * np.log10(r + 1e-12)
    t = (np.arange(n) + 0.5) * 0.05
    slope = np.polyfit(t, db, 1)[0]
    return float(slope)


# ══════════════════════════════════════════════════════════════════════════
#  shaping
# ══════════════════════════════════════════════════════════════════════════
def hp(y, fc, order=2):
    return sosfilt(butter(order, max(10.0, fc), "highpass", fs=SR, output="sos"), y)


def lp(y, fc, order=2):
    return sosfilt(butter(order, min(fc, 0.45 * SR), "lowpass", fs=SR, output="sos"), y)


def trim_start(y, lead=0.0008):
    """start the file 0.8 ms before the note's onset (3% of its peak, as the page finds it); the bit before the
    onset fades in, so the file starts from silence (a recording cut closer than that gets a little silence first)"""
    i = onset_of(y)
    L = int(lead * SR)
    if i < L:
        y = np.concatenate([np.zeros(L - i), y])
        i = L
    s = i - L
    y = y[s:].copy()
    y[:L] *= np.sin(np.linspace(0, np.pi / 2, L)) ** 2
    y[0] = 0.0
    return y


def fade_out(y, sec):
    n = min(len(y), int(sec * SR))
    if n > 1:
        y[-n:] *= np.cos(np.linspace(0, np.pi / 2, n)) ** 2
    y[-1] = 0.0
    return y


def extend_decay(y, f0, cut, length, rate_db_s):
    """a note cut off while it still sounds: its last few cycles carry on, dying away at the rate the recording was
    dying away (a sustain loop under an envelope, as a sampler plays it)"""
    P = SR / f0
    K = max(2, int(round(0.12 * SR / P)))
    best = None
    for k in range(K, K + 40):                    # a loop of k cycles that is (nearly) a whole number of samples
        e = abs(k * P - round(k * P))
        if best is None or e < best[0]:
            best = (e, k)
        if e < 0.02:
            break
    Lp = int(round(best[1] * P))
    end = cut - int(0.01 * SR)
    ls = end - 2 * Lp
    if ls < int(0.05 * SR):
        return y[:cut]
    alpha = -rate_db_s / 20 * math.log(10) / SR              # per sample, natural log, positive = decaying
    t = np.arange(len(y))
    seg = y[ls:ls + 2 * Lp] * np.exp(alpha * (np.arange(2 * Lp)))   # flattened: the decay taken out
    w = np.hanning(2 * Lp + 1)[:-1]
    n = int(length * SR)
    ext = np.zeros(n + 2 * Lp)
    j = 0
    while ls + j * Lp < n:
        p = ls + j * Lp
        q = min(len(ext), p + 2 * Lp)
        ext[p:q] += (seg * w)[:q - p]
        j += 1
    ext = ext[:n]
    env = np.exp(-alpha * (np.arange(n) - ls))
    ext *= env
    out = np.zeros(n)
    m = min(cut, n)
    out[:m] = y[:m]
    xa, xb = ls + Lp, end                                     # blend from the recording into its continuation
    if xb > xa:
        g = np.sin(np.linspace(0, np.pi / 2, xb - xa)) ** 2
        out[xa:xb] = out[xa:xb] * (1 - g) + ext[xa:xb] * g
    out[xb:] = ext[xb:]
    return out


def level_to(y, target_db, t1=None):
    lvl = kw_level(y, t1)
    return y * 10 ** ((target_db - lvl) / 20), lvl


# ══════════════════════════════════════════════════════════════════════════
#  the grid of notes
# ══════════════════════════════════════════════════════════════════════════
def grid(offset=0):
    """every third key from C1 (offset moves it up one or two keys); always reaching past both ends by <= 1 key"""
    lo = KEY_LO + offset
    notes = list(range(lo, KEY_HI + 2, 3))
    if notes[0] > KEY_LO + 1:
        notes.insert(0, notes[0] - 3)
    if notes[-1] < KEY_HI - 1:
        notes.append(notes[-1] + 3)
    return notes


def nearest(reals, n):
    """the recorded note nearest to n (the lower one on a tie)"""
    return min(reals, key=lambda r: (abs(r - n), r))


REPORT = {}


def record(setname, info):
    REPORT.setdefault(setname, {"files": {}})
    REPORT[setname].update(info)


def note_file(setname, n, layer, y, meta, struck=True):
    p = os.path.join(OUT, setname, "%d%s.mp3" % (n, layer))
    if struck:
        on, head = write_struck(p, y)
        meta = dict(meta, onset_ms=round(1000 * on, 2), first_samples=round(head, 4))
    else:
        write_mp3(p, y)
    REPORT.setdefault(setname, {"files": {}})["files"]["%d%s" % (n, layer)] = meta
    return p


def name_midi(s):
    m = re.match(r"^([a-gA-G])([#b]?)(-?\d)$", s)
    pc = {"c": 0, "d": 2, "e": 4, "f": 5, "g": 7, "a": 9, "b": 11}[m.group(1).lower()]
    pc += {"#": 1, "b": -1, "": 0}[m.group(2)]
    return 12 * (int(m.group(3)) + 1) + pc


# ══════════════════════════════════════════════════════════════════════════
#  struck and plucked notes (they die away by themselves)
# ══════════════════════════════════════════════════════════════════════════
def high_shelf(y, f, db, q=0.7):
    w = 2 * np.pi * f / SR; cw = np.cos(w); al = np.sin(w) / (2 * q); A = 10 ** (db / 40); sq = 2 * np.sqrt(A) * al
    b = [A * ((A + 1) + (A - 1) * cw + sq), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - sq)]
    a = [(A + 1) - (A - 1) * cw + sq, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - sq]
    return lfilter(np.array(b) / a[0], np.array(a) / a[0], y)


def decay_note(x, f_src, n, length, detune_c=0.0, extend=False, fade_frac=0.3, hp_frac=0.5, lp_hz=None, shelf=None,
               method="harm", env=None):
    """one recorded note (mono, at its own pitch f_src) → note n: retuned, trimmed, shortened and faded. Then
    measured as the checker measures it and retuned once more if needed (a struck pan or bar glides a little in
    pitch as it dies away, so where it is measured matters; this makes the builder and the checker agree)."""
    f_t = mtof(n) * 2 ** (detune_c / 1200)
    ratio = f_t / f_src

    def make(ratio):
        need = int((length + 0.3) * SR * ratio) + 64
        y = resample(x[:need], ratio)
        y = hp(y, max(20.0, hp_frac * f_t))                    # the filters first: they move the onset a little
        if lp_hz:
            y = lp(y, lp_hz)
        if ratio > 2 ** (4 / 12):              # a note moved well up: its strike noise would land where a real
            y = lp(y, 14000.0)                 # one has none, and an MP3 smears it before the note
        if shelf:
            y = high_shelf(y, *shelf)
        y = trim_start(y)
        if extend and len(y) < int(length * SR):
            cut = len(y) - int(0.004 * SR)
            rate = decay_rate(y, 0.45 * cut / SR, cut / SR - 0.02)
            rate = min(-1.5, rate if rate is not None else -6.0)       # never let a note hang on forever
            y = extend_decay(y, f_t, cut, length, rate)
        y = y[:int(length * SR)]
        if len(y) < int(length * SR):
            y = np.concatenate([y, np.zeros(int(length * SR) - len(y))])
        if env is not None:
            y = y * env(np.arange(len(y)) / SR)
        return fade_out(y, max(0.15, fade_frac * length))

    y = make(ratio)
    for _ in range(2):
        res = 1200 * math.log2(pitch_as_checked(y, n, method) / f_t)
        if abs(res) < 0.4:
            break
        ratio *= 2 ** (-res / 1200)
        y = make(ratio)
    return y


LAYER_DB = {"s": -26.0, "m": -21.0, "l": -17.0}      # the soft and loud layers 5 dB under and 4 dB over the middle


def finish_set(name, notes, layers, files, targets=LAYER_DB, extra=None):
    """bring every file of a set to its layer's level (K-weighted, loudest 400 ms), keep the peaks under 0.93,
    write the MP3s and the manifest entry"""
    os.makedirs(os.path.join(OUT, name), exist_ok=True)
    for fn in os.listdir(os.path.join(OUT, name)):
        if fn.endswith(".mp3"):
            os.unlink(os.path.join(OUT, name, fn))
    REPORT[name] = {"files": {}}
    for (n, layer), (y, meta) in sorted(files.items()):
        y, lvl = level_to(y, targets[layer])
        pk = float(np.max(np.abs(y)))
        if pk > PEAK_MAX:
            y *= PEAK_MAX / pk
        meta = dict(meta, level_db=round(lvl, 1), peak=round(min(pk, PEAK_MAX), 3),
                    trimmed_db=round(20 * math.log10(min(1.0, PEAK_MAX / pk)), 1))
        note_file(name, n, layer, y, meta, struck=not (extra and "loop" in extra))
    entry = {"dir": "/audio/piano/%s/" % name, "layers": layers, "even": True, "notes": notes}
    if extra:
        entry.update(extra)
    REPORT[name]["sets_entry"] = entry
    size = sum(os.path.getsize(os.path.join(OUT, name, f)) for f in os.listdir(os.path.join(OUT, name)))
    REPORT[name]["bytes"] = size
    print("%-10s %d notes x %d layers  %.2f MB" % (name, len(notes), len(layers), size / 1e6))


# ── epreed: Wurlitzer EP200 ──
def build_epreed():
    d = src("wurli", "Wurlitzer EP200", "Samples")
    layers = {"s": "mp", "m": "f", "l": "ff"}
    reals = {}
    for fn in os.listdir(d):
        m = re.match(r"^([a-g]b?\d)(pp|mp|f|ff)\.flac$", fn)
        if m:
            reals.setdefault(m.group(2), {})[name_midi(m.group(1))] = os.path.join(d, fn)
    # the ff layer has no recordings above G5: its top notes are the f layer's, as in the instrument's own mapping
    for k, v in reals["f"].items():
        if k > 80:
            reals["ff"].setdefault(k, v)
    notes = grid(0)
    files = {}
    cache = {}
    for layer, dyn in layers.items():
        rs = sorted(reals[dyn])
        for n in notes:
            r = nearest(rs, n)
            path = reals[dyn][r]
            if path not in cache:
                x = to_mono(load(path))
                i = onset_of(x)
                f = pitch_harm(x, mtof(r), i / SR + 0.05, min(len(x) / SR - 0.02, i / SR + 0.6))
                cache[path] = (x, f)
            x, f = cache[path]
            L = 4.0 if n <= 33 else 3.4 if n <= 45 else 2.8 if n <= 57 else 2.2 if n <= 69 else 1.7 if n <= 81 else 1.3
            if layer == "s":
                L *= 0.85
            y = decay_note(x, f, n, L, extend=True, fade_frac=0.35, method="harm")
            files[(n, layer)] = (y, {"from": os.path.relpath(path, SRC_ROOT), "recorded": r,
                                     "source_cents": round(1200 * math.log2(f / mtof(r)), 1),
                                     "shift_semitones": round(12 * math.log2(mtof(n) / f), 2), "seconds": round(L, 2)})
    finish_set("epreed", notes, ["s", "m", "l"], files)
    REPORT["epreed"]["pitch"] = "harm"


def best_grid(real_sets):
    """the every-third-key grid (of three possible) whose notes sit closest to the recordings of every layer"""
    best = None
    for off in (0, 1, 2):
        g = grid(off)
        cost = 0
        for reals in real_sets:
            lo, hi = min(reals), max(reals)
            for n in g:
                if lo - 1 <= n <= hi + 1:
                    d = abs(nearest(reals, n) - n)
                    cost += d + 3 * max(0, d - 2)
        if best is None or cost < best[0]:
            best = (cost, g)
    return best[1]


def struck_set(name, layer_src, measure, lengths, pitch="fund", grid_notes=None, note_opts=None, extra_meta=None):
    """a set of struck or plucked notes. layer_src: {layer: {recorded midi: path}}; measure(x, r) → the
    recording's true frequency; lengths(n, layer) → seconds; note_opts(n, layer) → extra decay_note options"""
    notes = grid_notes or best_grid([sorted(v) for v in layer_src.values()])
    files, cache = {}, {}
    for layer, reals in layer_src.items():
        rs = sorted(reals)
        for n in notes:
            r = nearest(rs, n)
            path = reals[r]
            if path not in cache:
                x = to_mono(load(path))
                cache[path] = (x, measure(x, r))
            x, f = cache[path]
            opts = note_opts(n, layer) if note_opts else {}
            L = lengths(n, layer)
            y = decay_note(x, f, n, L, method=pitch, **opts)
            meta = {"from": os.path.relpath(path, SRC_ROOT), "recorded": r,
                    "source_cents": round(1200 * math.log2(f / mtof(r)), 1),
                    "shift_semitones": round(12 * math.log2(mtof(n) / f), 2), "seconds": round(L, 2)}
            if opts.get("detune_c"):
                meta["detune_c"] = opts["detune_c"]
            if extra_meta:
                meta.update(extra_meta(n, layer))
            files[(n, layer)] = (y, meta)
    finish_set(name, notes, sorted(layer_src, key="sml".index), files)
    REPORT[name]["pitch"] = pitch


def fund_measure(t0=0.04, t1=0.6):
    """a struck bar or pan: its strongest, lowest partial is the note"""
    def m(x, r):
        i = onset_of(x)
        return pitch_harm(x, mtof(r), i / SR + t0, min(len(x) / SR - 0.02, i / SR + t1), ks=(1,), span_c=70)
    return m


# ── celesta: stamperadam's celesta (Freesound pack 6166), as mapped by Virtual Playing Orchestra 3 ──
CELESTA_FILES = {"c4": 60, "e4": 64, "g4": 68, "e5": 76, "g5": 80, "c6": 84, "e6": 88, "g6": 92, "c7": 96, "e7": 100,
                 "g7": 105}   # the library's "g" notes sound G sharp (its top one, A); measured, as its own mapping has them


def celesta_sources():
    d = src("celesta", "libs", "stamperadam", "samples", "celesta")
    out = {"soft": {}, "hard": {}}
    for nm, midi in CELESTA_FILES.items():
        for kind in ("soft", "hard"):
            p = os.path.join(d, "%s-%s-PB.wav" % (nm, kind))
            if os.path.exists(p):
                out[kind][midi] = p
    # the library has no soft C4; its own mapping plays the hard one there, and so does this set below E4
    out["soft"][60] = out["hard"][60]
    return out


def build_celesta():
    s = celesta_sources()
    struck_set("celesta", {"m": s["soft"], "l": s["hard"]}, fund_measure(),
               lambda n, l: 3.0 if n < 72 else 2.6 if n < 84 else 2.2,
               note_opts=lambda n, l: {"fade_frac": 0.4})


# ── steel drums: jSteelDrum v2, a Trinidad tenor pan (Jeff Learman) ──
def steel_sources():
    d = src("steel", "flac")
    names = os.listdir(d)
    out = {}
    # its five strengths; this set keeps the 2nd, 3rd and 5th as soft, middle and hard, from the same files the
    # instrument's own mapping plays: the newer recordings (jsdb_) for the lower octave's first three strengths,
    # the first recordings (SteelDrum_, whose "4" is the top strength) for everything else
    for layer, tag in (("s", "2"), ("m", "3"), ("l", "4")):
        out[layer] = {}
        for midi in range(60, 84):
            pref = "jsdb_%03d_" % midi if (midi < 72 and layer != "l") else "SteelDrum_%03d_" % midi
            out[layer][midi] = [os.path.join(d, f) for f in names
                                if f.startswith(pref) and re.search(r"_%s(-\d+)?\.flac$" % tag, f)]
    return out


def typical_take(takes, r):
    """of a note's takes, the one whose brightness is nearest the middle of them all"""
    if len(takes) == 1:
        return takes[0]
    cs = []
    for p in takes:
        x = to_mono(load(p))
        i = onset_of(x)
        seg = x[i:i + int(0.3 * SR)]
        S, n = spectrum(seg)
        fr = np.arange(len(S)) * SR / n
        cs.append(float(np.sum(fr * S ** 2) / np.sum(S ** 2)))
    med = float(np.median(cs))
    return takes[int(np.argmin([abs(c - med) for c in cs]))]


def build_steel():
    s = steel_sources()
    layer_src = {layer: {m: typical_take(t, m) for m, t in d.items()} for layer, d in s.items()}
    struck_set("steel", layer_src, fund_measure(0.04, 0.5),
               lambda n, l: 2.2 if n < 60 else 2.4 if n < 72 else 2.0 if n < 84 else 1.6,
               note_opts=lambda n, l: {"fade_frac": 0.4})


# ── clav: the Yamaha TX81Z's "Clavisynth" patch, sampled from the hardware (VCSL) ──
def build_clav():
    d = src("clav", "Electrophones", "TX81Z", "Clavisynth")
    layer_src = {"s": {}, "m": {}, "l": {}}
    for fn in os.listdir(d):
        m = re.match(r"^Clavisynth_([A-G]#?\d)_vl([123])\.wav$", fn)
        if m:
            # the files are named two octaves under the notes they sound ("8va", in Yamaha's octave numbering)
            midi = name_midi(m.group(1)) + 24
            layer_src["sml"[int(m.group(2)) - 1]][midi] = os.path.join(d, fn)
    def measure(x, r):
        i = onset_of(x)
        return pitch_harm(x, mtof(r), i / SR + 0.03, min(len(x) / SR - 0.02, i / SR + 0.4), ks=(1, 2, 3))
    struck_set("clav", layer_src, measure, lambda n, l: 2.0 if n < 48 else 1.6 if n < 72 else 1.1,
               pitch="harm", note_opts=lambda n, l: {"fade_frac": 0.45})


# ══════════════════════════════════════════════════════════════════════════
BUILDERS = ["epreed", "celesta", "steel", "clav"]
OUT = os.path.join(REPO, "aog-deploy", "audio", "piano")
MANIFEST = os.path.join(HERE, "piano_real_sets.json")


def main():
    global SRC_ROOT, OUT
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--sources", default=os.environ.get("AOG_SOURCES", ""), help="folder holding the clones")
    ap.add_argument("--out", default=OUT)
    ap.add_argument("--only", default="", help="comma-separated set names")
    ap.add_argument("--fetch", action="store_true", help="clone missing sources first")
    a = ap.parse_args()
    if not a.sources:
        ap.error("--sources is required (or set AOG_SOURCES)")
    SRC_ROOT, OUT = os.path.abspath(a.sources), os.path.abspath(a.out)
    if a.fetch:
        fetch(SRC_ROOT)
    names = [s for s in a.only.split(",") if s] or BUILDERS
    man = {"sets": {}}
    if os.path.exists(MANIFEST):
        man = json.load(open(MANIFEST))
    for name in names:
        globals()["build_" + name]()
        man["sets"][name] = REPORT[name]
        man["sets"] = {k: man["sets"][k] for k in BUILDERS if k in man["sets"]}
        with open(MANIFEST, "w") as f:
            json.dump(man, f, indent=1, sort_keys=False)
            f.write("\n")


if __name__ == "__main__":
    main()
