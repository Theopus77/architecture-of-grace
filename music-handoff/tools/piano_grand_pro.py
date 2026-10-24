# AOG-GRAND-PRO-V1 (2026-10-23) — Jimmy wants the Studio pro-grade everywhere. The Piano's grand (audio/piano/grand2/,
# piano_stereo_sets.py) kept 8 s of a low note down to 2.5 s of a high one and faded the last 35 %, so a held C4 was gone
# by 5 s; it used 3 of Salamander's 16 strength layers (4, 8, 12), with no release noises.
# This builds audio/piano/grand3/ from the same recordings (Salamander Grand Piano V3, Alexander Holm, CC BY 3.0):
#   - six strength layers: 2, 5, 8, 11, 14 and 16 (the loudest), every minor third A0 to C8, both microphones; the page
#     calls them a b c d e f (files <note><letter>.mp3)
#   - each note keeps its own recording up to a sustain loop near the end of the file (40 % of the file long, the 20 %
#     before it the crossfade), so it can ring as long as the real one: the page joins the loop (bakeLoop, after the
#     file is decoded, so the decoder's timing never matters) and lets it die away at the note's own measured rate
#     (dB a second, from the whole recording) down to 72 dB under its peak. Nothing is faded in the file.
#   - from the crossfade on, the recording is levelled (its own decay taken out, measured over that part), so the loop
#     does not jump in level each time round; the page puts the long decay back from that moment
#   - the six strengths of a note start at the same instant: each is lined up on the middle one (the lag, within 4 ms,
#     where their first 60 ms agree best below 2 kHz), so when the page plays two of them blended they add up, not
#     cancel; how alike each neighbouring pair is (their first 400 ms, K-weighted) is measured, so the page can keep a
#     blend exactly as loud as either one (GRAND_PRO.r)
#   - every note's middle layer (8) as loud as the grand's middle layer was on the page before (its file, the page's own
#     levelling, measure(), and its even trim, EVENP), so the room's level stays where it is; each other layer a fixed
#     step from it, Salamander's own average over the 30 notes (soft stays soft, the loudest really loud); every file
#     10 dB under that (FILE_DB; the page lifts it back), so no hammer is ever cut off in the file
#   - Salamander's release noises (rel, the dampers landing; SFZ level −37 dB) for the same 30 notes, and its pedal
#     noises (pedalD, pedalU; −20 and −19 dB), at their places beside the notes
#   - 44,100 Hz stereo MP3 at 128 kbps, as grand2
#
#   python3 piano_grand_pro.py [--sal DIR] [--jobs 3]
#     --sal: Salamander's Samples folder (default $AOG_SALAMANDER, else /home/user/sfzinstruments/salamandergrandpiano/
#            Samples), a clone of https://github.com/sfzinstruments/SalamanderGrandPiano: keep it out of the repo
#     $AOG_GRAND_CACHE: a file to keep each recording's loudness in between runs (outside the repo)
# Writes the page's GRAND_PRO (between its markers in music-piano.html) and piano_grand_pro.json beside this file:
#   lift (dB), D[layer] (its step from the middle layer, dB), k[note] = [crossfade starts, loop starts, crossfade (s)],
#   f[file] = [loop ends (s), decay (dB a second), end (s)], r[note] = {pair: how alike, −1 … 1}.
import os, sys, json, math
import numpy as np
from multiprocessing import Pool
from scipy.signal import butter, sosfiltfilt
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from piano_stereo_sets import decode, encode, loud_db, kweight, pb_midi, pb_best_lag, pb_shift, SR, PIANO, PEAK_CAP

SAL = os.environ.get("AOG_SALAMANDER", "/home/user/sfzinstruments/salamandergrandpiano/Samples")
if "--sal" in sys.argv:
    SAL = sys.argv[sys.argv.index("--sal") + 1]
OUT = os.path.join(PIANO, "grand3")
OLD = os.path.join(PIANO, "grand2")
PAGE = os.path.normpath(os.path.join(HERE, "..", "..", "aog-deploy", "music-piano.html"))
LAYERS = [2, 5, 8, 11, 14, 16]
LETTER = {2: "a", 5: "b", 8: "c", 11: "d", 14: "e", 16: "f"}
PAIRS = ["ab", "bc", "cd", "de", "ef", "ac"]        # neighbours (a phone keeps five: a and c meet there)
NAMES = ["A0"] + ["%s%d" % (n, o) for o in range(1, 8) for n in ["C", "D#", "F#", "A"]] + ["C8"]
ENV = 0.05          # s, the envelope's step
FILE_DB = -10.0
# the grand's even trims as the page had them for its middle layer before this build (EVENP.grand.m, AOG-LEVEL-EVEN-V1):
# part of the level the room was set to
OLD_EVEN_M = "SWNYVPLJKQJONNPMPLQOYlTY\\eSSSS"


def a_min(m):
    """the slowest a note may die away (dB a second): 60 dB in 80 s at A0 down to 8 s at C8, so a recording whose end
    reaches its noise floor is not read as ringing for ever"""
    return 60.0 / (80.0 * (0.1 ** ((m - 21) / 87.0)))


def keep(m):
    """how much of each recording the file holds (the loop sits in its last 40 %)"""
    return 6.0 if m < 36 else 5.0 if m < 48 else 4.5 if m < 60 else 4.0 if m < 72 else 3.0 if m < 84 else 2.2


def env_db(x):
    p = (x ** 2).mean(axis=1); n = int(ENV * SR); m = len(p) // n
    return 10 * np.log10(p[:m * n].reshape(m, n).mean(axis=1) + 1e-20)


def onset(x):
    """where the hammer lands (as the first build: the microphones lined up, 3 % of the loudest, less 2 ms)"""
    L, R = x[:, 0], x[:, 1]
    mono = (L + pb_shift(R, pb_best_lag(L, R))) * 0.5
    pk = np.max(np.abs(mono))
    return max(0, int(np.argmax(np.abs(mono) > pk * 0.03)) - int(0.002 * SR))


LP2K = butter(4, 2000, "low", fs=SR, output="sos")


def lined_up(x, on, ref, reach=int(0.004 * SR), win=int(0.06 * SR)):
    """the start that lines this recording up with the middle one (ref: its first win samples, below 2 kHz)"""
    lo = max(0, on - reach)
    seg = sosfiltfilt(LP2K, x[lo:on + reach + win + 64].mean(axis=1))
    best, bl = -2.0, 0
    for k in range(-reach, reach + 1):
        a = seg[k + on - lo: k + on - lo + win]
        if len(a) < win:
            continue
        r = float(np.dot(a, ref) / (np.linalg.norm(a) * np.linalg.norm(ref) + 1e-12))
        if r > best:
            best, bl = r, k
    return max(0, on + bl), best


def slope(e, t0, t1, floor):
    """dB a second over [t0, t1) of the envelope, where it stands 12 dB or more over the recording's floor"""
    i0, i1 = int(t0 / ENV), min(len(e), int(t1 / ENV))
    t = np.arange(i0, i1) * ENV; y = e[i0:i1]
    ok = y > floor + 12
    if ok.sum() < 6:
        return None
    return float(np.polyfit(t[ok], y[ok], 1)[0])


def page_level_old():
    """how loud the page played the old middle layer of each note (its file, measure()'s levelling, its even trim)"""
    out = {}
    for k, nm in enumerate(NAMES):
        m = pb_midi(nm)
        x = decode(os.path.join(OLD, "%dm.mp3" % m))
        pk = np.max(np.abs(x)); thr = pk * 0.03
        i0 = int(np.argmax((np.abs(x) >= thr).any(axis=1)))
        n = min(len(x) - i0, int(0.3 * SR))
        db = 10 * math.log10((x[i0:i0 + n] ** 2).sum() / 2 / max(1, n) + 1e-12)
        g = max(-6, min(18, (-19 - db) * 0.7))                       # measure(): LAYER_TARGET.m = −19, 70 % of the way
        ev = 2 * (ord(OLD_EVEN_M[k]) - 79) / 10                       # tenths of a dB
        out[m] = loud_db(x) + g + ev
    return out


def best_end(y, A, X, lo, hi):
    """the loop's end in [lo, hi] (samples) where the X samples before it are most like the X before A"""
    ref = y[A - X:A].mean(axis=1); seg = y[lo - X:hi].mean(axis=1)
    nf = 1 << int(math.ceil(math.log2(len(seg) + len(ref))))
    c = np.fft.irfft(np.fft.rfft(seg, nf) * np.conj(np.fft.rfft(ref, nf)), nf)[:len(seg) - X + 1]
    e2 = np.concatenate([[0.0], np.cumsum(seg ** 2)]); en = e2[X:] - e2[:-X]
    r = c / np.sqrt(en[:len(c)] * (ref ** 2).sum() + 1e-20)
    j = int(np.argmax(r))
    return lo + j, float(r[j])


def build_note(job):
    nm, Tm, D = job
    m = pb_midi(nm)
    kp = keep(m); Ls, Xs = 0.4 * kp, 0.2 * kp
    tF = kp - Ls - Xs; A = int(round((kp - Ls) * SR)); X = int(round(Xs * SR))
    F, lines, Y, g8 = {}, [], {}, None
    ref = None
    for v in [8] + [w for w in LAYERS if w != 8]:          # the middle one first: the others line up on it
        x = decode(os.path.join(SAL, "%sv%d.flac" % (nm, v)))
        on = onset(x); match = 1.0
        if ref is None:
            ref = sosfiltfilt(LP2K, x[max(0, on - 200):on + int(0.06 * SR) + 264].mean(axis=1))[on - max(0, on - 200):on - max(0, on - 200) + int(0.06 * SR)]
        else:
            on, match = lined_up(x, on, ref)
        x = x[on:]
        e = env_db(x); pk = float(e.max())
        floor = float(np.percentile(e[int(len(e) * 0.6):], 5)) if len(e) > 20 else pk - 80
        a_long = slope(e, tF, min(len(e) * ENV - 0.6, tF + 12.0), floor)
        a_loc = slope(e, tF, kp, floor)
        a_long = -a_long if a_long is not None else 6.0
        a_loc = -a_loc if a_loc is not None else a_long
        a_long = max(a_min(m), min(40.0, a_long)); a_loc = max(0.0, min(60.0, a_loc))
        n = int((kp + 0.08) * SR)
        if len(x) < n:
            x = np.concatenate([x, np.zeros((n - len(x), 2))])
        y = x[:n].copy()
        i0 = int(tF * SR); t = np.arange(n - i0) / SR
        y[i0:] *= (10 ** (a_loc * t / 20))[:, None]                    # levelled from the crossfade on
        B, r = best_end(y, A, X, int((kp - 0.08 * kp) * SR), int(kp * SR))
        y = y[:B + int(0.06 * SR)]
        g = 10 ** ((Tm + D[v] + FILE_DB - loud_db(y[:int(1.5 * SR)])) / 20)
        y *= g
        capped = 0.0
        p = float(np.max(np.abs(y)))
        if p > PEAK_CAP:
            capped = 20 * math.log10(PEAK_CAP / p); y *= PEAK_CAP / p
        if v == 8:
            g8 = g
        key = "%d%s" % (m, LETTER[v])
        dst = os.path.join(OUT, key + ".mp3")
        encode(y, dst)
        Y[LETTER[v]] = y[:int(0.4 * SR)]
        lf = float(e[int(tF / ENV)] - pk) if int(tF / ENV) < len(e) else -60.0
        end = round(min(45.0, max(kp, tF + (72 + lf) / a_long)), 2)
        F[key] = [round(B / SR, 5), round(a_long, 2), end] + ([round(-capped, 2)] if capped else [])
        lines.append("%3d v%-2d  lined up %.2f  decay %5.2f dB/s (in the loop %5.2f)  loop match %.3f  rings %5.1f s  %s%d KB" % (
            m, v, match, a_long, a_loc, r, end, ("peak lowered %.1f dB  " % capped) if capped else "", os.path.getsize(dst) // 1024))
    # how alike neighbouring strengths are, as the ear weighs them (K-weighted), over their first 400 ms
    K = {L: kweight(Y[L]) for L in Y}
    R = {}
    for pr in PAIRS:
        a, b = K[pr[0]], K[pr[1]]
        R[pr] = round(float((a * b).sum() / math.sqrt((a * a).sum() * (b * b).sum() + 1e-20)), 3)
    lines.append("%3d      neighbours alike: %s" % (m, " ".join("%s %.2f" % (k, R[k]) for k in PAIRS)))
    return m, [round(tF, 4), round(A / SR, 5), round(X / SR, 4)], F, R, g8, lines


def write_page(meta):
    """the page's GRAND_PRO, between its two markers in music-piano.html"""
    A, Z = "/* AOG-GRAND-PRO-V1 data start */\n", "\n/* AOG-GRAND-PRO-V1 data end */"
    s = open(PAGE, encoding="utf-8").read(); i, j = s.index(A), s.index(Z)
    body = "const GRAND_PRO=" + json.dumps({k: meta[k] for k in ["lift", "D", "k", "f", "r"]}, separators=(",", ":"), sort_keys=True) + ";"
    open(PAGE, "w", encoding="utf-8").write(s[:i + len(A)] + body + s[j:])
    print("written into", PAGE)


def main():
    jobs = int(sys.argv[sys.argv.index("--jobs") + 1]) if "--jobs" in sys.argv else 3
    os.makedirs(OUT, exist_ok=True)
    print("the old middle layer, as the page set it …", flush=True)
    T = page_level_old()
    cache = os.environ.get("AOG_GRAND_CACHE")
    C = json.load(open(cache)) if cache and os.path.exists(cache) else {}
    for nm in NAMES:
        for v in LAYERS:
            k = "%sv%d" % (nm, v)
            if k not in C:
                C[k] = loud_db(decode(os.path.join(SAL, k + ".flac")))
    if cache:
        json.dump(C, open(cache, "w"))
    D = {v: float(np.mean([C["%sv%d" % (nm, v)] - C["%sv8" % nm] for nm in NAMES])) for v in LAYERS}
    print("layer steps (dB from layer 8):", {v: round(D[v], 2) for v in LAYERS}, flush=True)
    K, F, R, G8 = {}, {}, {}, []
    with Pool(jobs) as pool:
        for m, k, f, r, g8, lines in pool.imap(build_note, [(nm, T[pb_midi(nm)], D) for nm in NAMES]):
            K[str(m)] = k; F.update(f); R[str(m)] = r; G8.append(g8)
            print("\n".join(lines), flush=True)
    # the release noises and the pedal, at their SFZ levels beside the notes (the notes' own gain, layer 8's median)
    g8 = float(np.median(G8))
    for nm in NAMES:
        m = pb_midi(nm)
        encode(decode(os.path.join(SAL, "rel%d.flac" % (m - 20))) * 10 ** (-37 / 20) * g8, os.path.join(OUT, "rel%d.mp3" % m))
    for nm, lv in [("pedalD1", -20), ("pedalD2", -20), ("pedalU1", -19), ("pedalU2", -19)]:
        x = decode(os.path.join(SAL, nm + ".flac")) * 10 ** (lv / 20) * g8
        e = env_db(x); pk = e.max(); last = np.where(e > pk - 60)[0]
        x = x[:min(len(x), (int(last[-1]) + 2) * int(ENV * SR))]
        n = min(len(x), int(0.3 * SR)); x[-n:] *= np.linspace(1, 0, n)[:, None]
        encode(x, os.path.join(OUT, nm + ".mp3"))
    tot = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    mid = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT) if f[0].isdigit() and f.endswith("c.mp3"))
    print("grand3: %d files, %.2f MB in all; the middle strength, c (the first to load) %.2f MB" % (len(os.listdir(OUT)), tot / 1e6, mid / 1e6))
    meta = {"lift": -FILE_DB, "D": {LETTER[v]: round(D[v], 2) for v in LAYERS}, "k": K, "f": F, "r": R}
    json.dump(meta, open(os.path.join(HERE, "piano_grand_pro.json"), "w"), indent=0, sort_keys=True)
    write_page(meta)


if __name__ == "__main__":
    main()
