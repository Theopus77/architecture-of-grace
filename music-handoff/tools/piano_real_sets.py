# AOG-PIANO-REAL-V1 (2026-10-04) — Jimmy: "Also are ALL instruments sounds real?" Eight more of the piano's sounds become
# recordings, made the way piano_vsco_sets.py made the harp, the marimba and the soft strings: mono, 44,100 Hz, 96 kbps MP3,
# a note every few semitones, the quiet moment before the note trimmed, each note shortened and faded, the notes of an
# instrument brought to one level, and each note's pitch measured and, if it is off, the note retuned (resampled).
#
#   python3 piano_real_sets.py <aog-deploy/audio/piano> <VCSL clone> <aog-deploy/audio/band/flute>
#
# Sources (all CC0 1.0):
#   Versilian Community Sample Library (VCSL), https://github.com/sgossner/VCSL — the harpsichord (the English one, a
#   Zuckermann kit harpsichord, "Normal": the brightest and cleanest of the five in the middle of the keyboard), the pipe
#   organ (the loud registration, a full chorus; sampled by Simon Dalzell of Ivy Audio), the vibraphone (soft mallets),
#   the glockenspiel (loud), the tubular bells ("Tubular Bells 2", the louder strokes), the kalimba from Tanzania, and a
#   recording of a real Yamaha TX81Z playing its "FM Piano" patch (the loud layer).
#   VS Chamber Orchestra: Community Edition, through The Band's own notes in the repo (audio/band/flute/*s.mp3): the flute,
#   soft and held, without vibrato (the page's tape gives it its wobble).
#
# What is new beside piano_vsco_sets.py:
#   · every source is read through ffmpeg (24-bit, 48 kHz and MP3 sources as well), and the two microphones are lined up
#     (the lag that matches them best, at most 3 ms) before they are mixed, so the mix does not hollow the sound out;
#   · each library names its octaves its own way, so every note's octave was measured, not read from its name: the
#     harpsichord, the vibraphone, the glockenspiel and the kalimba sound an octave above their names; the organ, the bells
#     and the FM piano sound as named;
#   · bars and tines (vibraphone, glockenspiel, kalimba) are tuned by their lowest partial; the bells by their strike note,
#     which the ear hears an octave below their fourth partial; everything else by its whole row of partials;
#   · the two held sounds (organ, flute) loop: each note's loop is a whole number of its own waves long (the length that
#     makes the end match the start best), so the page can join it with a straight crossfade and nothing dips or swells.
#     The lengths are printed for the page (SETS[...].ends).
#   · the whole set is levelled together: if one note's sharpest instant would pass 0.93, every note comes down with it.
import os, sys, json, subprocess, tempfile
import numpy as np
from scipy.signal import resample_poly, butter, sosfilt, lfilter

OUT, VCSL, FLUTE = sys.argv[1], sys.argv[2], sys.argv[3]
SR = 44100
NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}

HS = "Chordophones/Zithers/Harpsichord, English/Sustains/Normal/ZuckermannKitHarpsi_Normal_Sus_%s_rr1.wav"
PO = "Aerophones/Edge-blown Aerophones/Pipe Organ/Loud/Rode_Man3Open_%s.wav"
VB = "Idiophones/Struck Idiophones/Vibraphone/Soft Mallets/Vibes_soft_%s_v2_rr1_Main.wav"
GL = "Idiophones/Struck Idiophones/Glockenspiel/glock_loud_%s_01.wav"
TB = "Idiophones/Struck Idiophones/Tubular Bells 2/TB_hit_%s.wav"
KT = "Idiophones/Plucked Idiophones/Kalimba, Tanzania/MBira3_pluck_Main_%s_50_100_rr2.wav"
FM = "Electrophones/TX81Z/FM Piano/FMPiano_%s_vl3.wav"


def nm(name, octave_up=0):
    """a library's note name (C4 = 60; anything after an underscore is left out) as a MIDI note, with octave_up octaves added"""
    name = name.split("_")[0]
    p = name.rstrip("0123456789")
    return 12 * (int(name[len(p):]) + 1) + NOTE[p] + 12 * octave_up


# (MIDI note it will be, source, MIDI note the source sounds as recorded): each note stays the note it is
def same(path, names, up, fmt=None):
    out = []
    for n in names:
        s = nm(n, up)
        out.append((s, path % (fmt(n) if fmt else n), s))
    return out


SETS = {
    # every whole tone the library has, A#1 to E6
    "harpsichord": dict(kind="pluck", pitch="harm", onset=0.10, files=same(HS, ["A#0", "C1", "D1", "E1", "F#1", "G#1", "A#1", "C2", "D2", "E2", "F#2",
        "G#2", "A#2", "C3", "D3", "E3", "F#3", "G#3", "A#3", "C4", "D4", "E4", "F#4", "G#4", "A#4", "C5", "D5", "E5"], 1)),
    # every minor third the library has, C1 to C6; held notes, looped from 1.4 s, each loop 1.2 to 2.6 s long
    "pipeorgan": dict(kind="hold", pitch="harm", loop=(1.4, 1.2, 2.6), files=same(PO, ["C1", "D#1", "F#1", "A1", "C2", "D#2", "F#2", "A2", "C3", "D#3",
        "F#3", "A3", "C4", "D#4", "F#4", "A4", "C5", "D#5", "F#5", "A5", "C6"], 0)),
    # F3 to E6, every note the library has (the soft mallets, the louder stroke)
    "vibraphone": dict(kind="bar", pitch="bar", files=same(VB, ["F2", "A2", "C3", "E3", "G3", "B3", "D4", "F4", "A4", "C5", "E5"], 1)),
    # G5 to C8, the six notes the library has
    "glockenspiel": dict(kind="bar", pitch="bar", files=same(GL, ["G4", "C5", "G5", "C6", "G#6", "C7"], 1)),
    # C4 to F5, every note the library has (the white keys), the louder strokes
    "bells": dict(kind="bell", pitch="bell", files=same(TB, ["C4", "D4_2", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5_2", "F5"], 0,
        fmt=lambda n: n.replace("_", "_v4_") if "_" in n else n + "_v4_1")),
    # the Tanzanian kalimba's tines, G#2 to C#7: one tine every two to five semitones. Its tines are tuned the traditional
    # way, up to about 60 cents from the piano's notes, and each is retuned to its name. Some upper tines make a neighbour
    # ring with them, a few cents away; where two tines share a note the one whose neighbour is quieter is used, and A#4 and
    # C#5 (each rings with a neighbour as loud as itself) are left out for the clean B4
    "kalimba": dict(kind="tine", pitch="bar", files=same(KT, ["G#1_k11", "C#2_k10", "D#2_k14", "F2_k9alt", "G2_k15", "A#2_k8", "C#3_k16", "D#3_k7",
        "F3_k17", "G3_k6", "A#3_k18", "C#4_k5", "D#4_k4", "F4_k3", "G4_k22", "B4_k23", "E5_k25", "G#5_k26", "C#6_k27"], 1)),
    # every major third the library has, E1 to C7 (the loud layer: the bright, glassy one)
    "fmpiano": dict(kind="ep", pitch="harm", files=same(FM, ["E1", "G#1", "C2", "E2", "G#2", "C3", "E3", "G#3", "C4", "E4", "G#4", "C5", "E5", "G#5",
        "C6", "E6", "G#6", "C7"], 0)),
    # The Band's flute (VSCO 2 CE), soft, held, without vibrato: every note it has, C4 to C7; held notes, looped from 1.2 s,
    # each loop 2.0 to 2.8 s long (The Band's notes fade out after 4.5 s, so the loops end before that)
    "flute": dict(kind="hold", pitch="harm", loop=(1.2, 2.0, 2.8), files=[(m, "%ds" % m, m) for m in [60, 64, 69, 72, 76, 81, 84, 88, 93, 96]]),
}


def length_for(kind, m):
    if kind == "pluck":                  # harpsichord: the bass rings long, the treble is short
        return 5.0 if m <= 40 else 4.2 if m <= 52 else 3.4 if m <= 64 else 2.6 if m <= 76 else 2.1
    if kind == "bar":                    # vibraphone and glockenspiel ring a long time
        return 4.5 if m <= 64 else 4.0 if m <= 76 else 3.2 if m <= 88 else 2.4
    if kind == "bell":
        return 6.0 if m <= 65 else 5.2 if m <= 72 else 4.4
    if kind == "tine":
        return 2.6 if m <= 55 else 2.1 if m <= 70 else 1.7
    if kind == "ep":
        return 5.0 if m <= 40 else 4.2 if m <= 56 else 3.4 if m <= 72 else 2.6
    return None                          # held: set by the loop


def load(path):
    """float64 mono at 44.1 kHz; two microphones are lined up before they are mixed"""
    raw = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", path, "-f", "f32le", "-acodec", "pcm_f32le", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    ch = int(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=channels", "-of", "csv=p=0", path],
                            capture_output=True, text=True, check=True).stdout.strip().split("\n")[0])
    d = np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, ch)
    if ch == 1:
        return d[:, 0]
    L, R = d[:, 0], d[:, 1]
    pk = np.abs(d).max(axis=1)
    on = int(np.argmax(pk > pk.max() * 0.03))
    a, z = on, min(len(L), on + int(0.25 * SR))
    best, blag = -2.0, 0
    for lag in range(-int(0.003 * SR), int(0.003 * SR) + 1):
        if a + lag < 0 or z + lag > len(R):
            continue
        x, y = L[a:z], R[a + lag:z + lag]
        c = np.dot(x, y) / (np.linalg.norm(x) * np.linalg.norm(y) + 1e-12)
        if c > best:
            best, blag = c, lag
    return 0.5 * (L + np.roll(R, -blag))


def kweight(d):
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


def loudest(seg, win=0.4, hop=0.05):
    kw = kweight(seg) ** 2
    W = int(win * SR); hop = int(hop * SR)
    best = max(kw[i:i + W].mean() for i in range(0, max(1, len(kw) - W), hop))
    return 10 * np.log10(best + 1e-15)


def soften_tick(seg, crest_db=9.0):
    """a kalimba's thumb can strike its tine with a sharp tick, a millisecond or two far louder than the note. The page turns
    down any recorded note whose sharpest instant would pass 0.85, which would leave those tines quieter than the rest; so
    the tick alone is held to crest_db above the note's own loudest 100 ms (a fast limiter: it reacts half a millisecond
    early and lets go over 10 ms), and the note itself is left as it is"""
    ceil = 10 ** ((loudest(seg, 0.1, 0.01) + crest_db) / 20)
    a = np.abs(seg)
    if a.max() <= ceil:
        return seg
    from scipy.ndimage import maximum_filter1d
    env = maximum_filter1d(a, size=2 * int(0.0005 * SR) + 1)
    need = np.minimum(1.0, ceil / np.maximum(env, 1e-12))
    rel = 1 - np.exp(-1 / (0.010 * SR)); att = 1 - np.exp(-1 / (0.0005 * SR))
    g = need.copy()
    for i in range(1, len(g)):                       # forwards: let go slowly
        g[i] = min(need[i], g[i - 1] + (1 - g[i - 1]) * rel)
    for i in range(len(g) - 2, -1, -1):              # backwards: start turning down a moment before the tick
        g[i] = min(g[i], g[i + 1] + (1 - g[i + 1]) * att)
    return seg * g


def peak_near(S, n, f, cents):
    lo = int(f * 2 ** (-cents / 1200) * n / SR); hi = int(f * 2 ** (cents / 1200) * n / SR) + 1
    if hi >= len(S) - 1 or lo < 1:
        return None
    i = lo + int(np.argmax(S[lo:hi])); p = 0.0
    if 0 < i < len(S) - 1:
        al, be, ga = np.log(S[i - 1] + 1e-15), np.log(S[i] + 1e-15), np.log(S[i + 1] + 1e-15)
        den = al - 2 * be + ga
        p = 0.5 * (al - ga) / den if den != 0 else 0.0
    return (i + p) * SR / n, S[i]


def cents_off(d, onset, midi, how, kind):
    """how far (in cents) the note sits above midi: harm = its row of partials (each partial's frequency over its number,
    a weighted median), bar = its lowest partial, bell = half its fourth partial (the strike note the ear hears)"""
    f_exp = 440.0 * 2 ** ((midi - 69) / 12)
    a, z = {"hold": (0.6, 2.6), "pluck": (0.05, 0.8), "ep": (0.05, 1.0), "bar": (0.04, 0.6), "bell": (0.05, 1.0), "tine": (0.02, 0.4)}[kind]
    seg = d[onset + int(a * SR): onset + int(z * SR)]
    n = 1 << 19
    S = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), n))
    if how == "bar":
        return 1200 * np.log2(peak_near(S, n, f_exp, 80)[0] / f_exp)
    if how == "bell":
        return 1200 * np.log2(peak_near(S, n, 2 * f_exp, 100)[0] / (2 * f_exp))
    est = []
    for k in range(1, 7):
        r = peak_near(S, n, k * f_exp, 60)
        if r is None:
            break
        est.append((r[0] / k, r[1]))
    mx = max(e[1] for e in est)
    est = sorted(e for e in est if e[1] > 0.08 * mx)
    w = np.array([e[1] for e in est]); f = np.array([e[0] for e in est]); c = np.cumsum(w)
    return 1200 * np.log2(f[np.searchsorted(c, c[-1] / 2)] / f_exp)


def retune(seg, cents):
    """stretch (to lower) or squeeze (to raise) by this many cents: a polyphase resampler, so the ends do not wrap round"""
    r = 2 ** (cents / 1200)
    D = 10000
    U = int(round(r * D))
    return resample_poly(seg, U, D, window=("kaiser", 10.0))


def loop_end(seg, a, lmin, lmax, x=0.5):
    """the loop end, from a+lmin to a+lmax, whose half second before it matches the half second before a best (the
    normalised correlation, for every length at once, by FFT; then to a fraction of a sample by the peak's shape). A held
    organ chord keeps moving a little (its ranks beat, the room answers), so the best match is looked for over more than a
    second of lengths, not just at one: it is a whole number of the note's waves and lands where the slow beats line up too."""
    A = int(round(a * SR)); X = int(round(x * SR))
    ref = seg[A - X:A]
    lo, hi = A + int(round(lmin * SR)), A + int(round(lmax * SR))
    reg = seg[lo - X:hi]
    n = 1 << int(np.ceil(np.log2(len(reg) + X)))
    c = np.fft.irfft(np.fft.rfft(reg, n) * np.conj(np.fft.rfft(ref, n)), n)[:len(reg) - X + 1]
    e = np.sqrt(np.maximum(np.convolve(reg ** 2, np.ones(X), "valid"), 1e-20))
    rho = c / (e * np.linalg.norm(ref) + 1e-12)
    i = int(np.argmax(rho)); p = 0.0
    if 0 < i < len(rho) - 1:
        al, be, ga = rho[i - 1], rho[i], rho[i + 1]
        den = al - 2 * be + ga
        p = 0.5 * (al - ga) / den if den != 0 else 0.0
    return (lo + i + p) / SR, float(rho[i])


def make(name, spec, report):
    kind = spec["kind"]
    os.makedirs(os.path.join(OUT, name), exist_ok=True)
    notes, segs = [], []
    for target, src, sounding in spec["files"]:
        path = os.path.join(FLUTE, src + ".mp3") if name == "flute" else os.path.join(VCSL, src)
        d = load(path)
        pk = np.abs(d).max()
        onset = int(np.argmax(np.abs(d) > pk * spec.get("onset", 0.03)))      # the harpsichord's low keys knock before they pluck
        dev = cents_off(d, onset, sounding, spec["pitch"], kind)
        shift = (target - sounding) * 100 + dev
        start = max(0, onset - int(0.005 * SR))
        L = length_for(kind, target) if kind != "hold" else spec["loop"][0] + spec["loop"][2] + 0.3
        seg = d[start: start + int((L * 2 ** (abs(shift) / 1200) + 0.3) * SR)]
        if abs(shift) > 1:
            seg = retune(seg, shift)
        n = int(L * SR)
        seg = np.concatenate([seg, np.zeros(max(0, n - len(seg)))])[:n]
        # below the note: no rumble from the room or the organ's blower (a gentle high-pass under the lowest partial)
        f0 = 440.0 * 2 ** ((target - 69) / 12)
        hp = max(20.0, f0 * (0.35 if kind in ("bar", "bell", "tine") else 0.5))
        seg = sosfilt(butter(2, hp, "highpass", fs=SR, output="sos"), seg)
        if kind == "tine":
            seg = soften_tick(seg)
        notes.append(target)
        segs.append((target, src, dev, seg))
    # one level for the whole instrument: each note's loudest 400 ms, K-weighted, to the target; if any note's sharpest
    # instant would then pass 0.93, the target comes down for all of them, so they stay even
    target_db = {"pluck": -21.0, "bar": -21.0, "bell": -22.0, "tine": -21.0, "ep": -21.0, "hold": -22.0}[kind]
    lv = [loudest(s) for (_, _, _, s) in segs]
    worst = max(np.abs(s).max() * 10 ** ((target_db - l) / 20) for (_, _, _, s), l in zip(segs, lv))
    if worst > 0.93:
        target_db += 20 * np.log10(0.93 / worst)
    ends = {}
    size = 0
    for (target, src, dev, seg), l in zip(segs, lv):
        seg = seg * 10 ** ((target_db - l) / 20)
        fi = int(0.005 * SR); seg[:fi] *= np.sin(np.linspace(0, np.pi / 2, fi)) ** 2
        loopinfo = ""
        if kind == "hold":
            # the note ends a quarter second after its own loop end (room enough for any decoder's start delay), with a
            # short fade that playing never reaches
            e, c = loop_end(seg, *spec["loop"])
            ends[target] = round(e, 5)
            seg = seg[:int((e + 0.25) * SR)]
            loopinfo = "  loop %.1f-%.5f s (match %.3f)" % (spec["loop"][0], e, c)
        fo = int((0.06 if kind == "hold" else 0.6) * SR); seg[-fo:] *= np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
        out = os.path.join(OUT, name, "%dm.mp3" % target)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
            pcm = (np.clip(seg, -1, 1) * 32767).astype(np.int16).tobytes()
            subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                            "-codec:a", "libmp3lame", "-b:a", "96k", "-ar", str(SR), "-ac", "1", out], input=pcm, check=True)
            os.unlink(tf.name)
        size += os.path.getsize(out)
        print("%-12s %3d  from %-46s off %+6.1f cents  level %+6.1f dB -> %+5.1f  peak %.2f  %.1f s%s" % (
            name, target, os.path.basename(src)[:46], dev, l, target_db, np.abs(seg).max(), len(seg) / SR, loopinfo))
    report[name] = {"notes": sorted(notes), "bytes": size}
    if ends:
        report[name]["ends"] = ends


def check(name, spec, report):
    """every file as written (the MP3, decoded again): its pitch, measured the same way, against the note it is"""
    offs = []
    for m in report[name]["notes"]:
        d = load(os.path.join(OUT, name, "%dm.mp3" % m))
        onset = int(np.argmax(np.abs(d) > np.abs(d).max() * spec.get("onset", 0.03)))
        offs.append(cents_off(d, onset, m, spec["pitch"], spec["kind"]))
    report[name]["cents"] = [round(min(offs), 1), round(max(offs), 1)]
    print("%-12s as written: every note between %+.1f and %+.1f cents" % (name, min(offs), max(offs)))


def main():
    only = sys.argv[4].split(",") if len(sys.argv) > 4 else list(SETS)
    report = {}
    for name in only:
        make(name, SETS[name], report)
        check(name, SETS[name], report)
    print(json.dumps(report))


main()
