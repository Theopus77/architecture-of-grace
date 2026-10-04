# AOG-PIANO-STEREO-V1 (2026-10-04) — Jimmy: "The violins sound fake." … "REAL EVERYTHING if possible".
# The piano's recorded sounds were made by mixing each recording's two microphones into one channel. Where the two
# microphones stood apart, their sound agrees only partly (measured: the soft strings' violins about 0 %, the grand 59 %),
# so adding them cancels some pitches and strengthens others, differently on every note, and on a held note the
# cancelling moves: the hollow, phasey sound of a cheap sample keyboard.
# This builds those sets again from the same takes, in true stereo, the way music-handoff/tools/band/strings_stereo.py
# rebuilt The Band's violins:
#   - both microphones kept, left and right, as recorded (nothing added together, nothing shifted)
#   - every decision the set's own builder made (where the note starts, its tuning, its length, its filters, its fades,
#     where a held note loops) is made again here the same way, from the same one-channel mix that builder listened to,
#     and then done to both channels alike
#   - every note brought to the loudness of the file it replaces (K-weighted, its loudest 400 ms, the two channels'
#     average), so the page's levels stay as they were
#   - 44,100 Hz stereo, MP3 at 128 kbps
#   - into new folders (audio/piano/<set>2/), since the old files are cached for a year under their own names
#
#   python3 piano_stereo_sets.py <set>[,<set>…]  [--sources DIR]
#     strings harp marimba           as piano_vsco_sets.py made them (VS Chamber Orchestra 2 CE)
#     harpsichord pipeorgan glockenspiel bells kalimba
#                                    as piano_vcsl_sets.py made them (VCSL)
#     flute                          as piano_vcsl_sets.py made it, from the VS Chamber Orchestra takes The Band's soft
#                                    flute notes were made from (that builder read The Band's one-channel files)
#     grand upright                  as the first piano build made them (piano_build.py, kept below: Salamander, VSCO 2 CE)
#     theatre accordion              as piano_real_sets.py made them
#   --sources: the folder holding piano_real_sets.py's source clones (accordion); the VSCO 2 CE and VCSL clones are
#   read from /home/user/sgossner/, Salamander from /home/user/sfzinstruments/salamandergrandpiano.
# Prints every note's gain against its old file, its peak, its tuning in each channel, and (held sets) the loop ends for
# the page's SETS[...].ends.
import os, sys, json, math, re, subprocess
import numpy as np
from scipy.signal import resample as fft_resample, resample_poly, butter, sosfilt, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", "..", "aog-deploy"))
PIANO = os.path.join(ROOT, "audio", "piano")
VSCO = "/home/user/sgossner/vsco-2-ce"
VCSL = "/home/user/sgossner/VCSL"
SALAMANDER = "/home/user/sfzinstruments/salamandergrandpiano/Samples"
SR = 44100
KBPS = 128
PEAK_CAP = 0.97
NEW = lambda name: name + "2"
REPORT = {}


# ══════════════════════════════════════════════════════════════════════════
#  sound in and out
# ══════════════════════════════════════════════════════════════════════════
def git_bytes(repo, path):
    return subprocess.run(["git", "-C", repo, "show", "HEAD:" + path], capture_output=True, check=True).stdout


def decode(raw_or_path, ch=2, sr=SR):
    """any audio (bytes or a path) → float64 (frames, ch) at sr, through ffmpeg"""
    if isinstance(raw_or_path, bytes):
        args, inp = ["-i", "-"], raw_or_path
    else:
        args, inp = ["-i", raw_or_path], None
    pcm = subprocess.run(["ffmpeg", "-v", "error"] + args + ["-ac", str(ch), "-ar", str(sr), "-f", "f32le", "-"],
                         input=inp, capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).astype(np.float64).reshape(-1, ch)


def channels_of(raw):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=channels", "-of", "csv=p=0", "-"],
                         input=raw, capture_output=True, check=True).stdout.decode()
    return int(out.strip().split("\n")[0])


def encode(x, dst):
    """stereo, 44,100 Hz, 128 kbps MP3 (LAME's most careful mode)"""
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-codec:a", "libmp3lame", "-b:a", "%dk" % KBPS, "-compression_level", "0", "-ar", str(SR), "-ac", "2", dst],
                   input=np.clip(x, -1, 1).astype(np.float32).tobytes(), check=True)


def old_file(name, key):
    return decode(os.path.join(PIANO, name, key + ".mp3"), ch=1)[:, 0]


# ══════════════════════════════════════════════════════════════════════════
#  loudness, the same measure the builders used: K-weighted, the loudest 400 ms
# ══════════════════════════════════════════════════════════════════════════
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
        d = lfilter(k[0], k[1], d, axis=0)
    return d


def loud_db(x, win=0.4):
    """x mono (n,) or stereo (n, 2): the loudest win seconds of its K-weighted power (the channels' average)"""
    k = kweight(x) ** 2
    p = k.mean(axis=1) if k.ndim > 1 else k
    n = int(win * SR)
    if len(p) <= n:
        return 10 * np.log10(p.mean() + 1e-15)
    c = np.concatenate([[0.0], np.cumsum(p)])
    return 10 * np.log10(np.max(c[n:] - c[:-n]) / n + 1e-15)


def match_and_write(name, key, y, info):
    """bring y (stereo) to the loudness of the old file it replaces, keep its sharpest instant under PEAK_CAP, write it"""
    old = old_file(name, key)
    ref, now = loud_db(old), loud_db(y)
    g = 10 ** ((ref - now) / 20)
    y = y * g
    pk = float(np.max(np.abs(y)))
    capped = 0.0
    if pk > PEAK_CAP:
        capped = 20 * math.log10(PEAK_CAP / pk)
        y *= PEAK_CAP / pk
    dst = os.path.join(PIANO, NEW(name), key + ".mp3")
    encode(y, dst)
    back = decode(dst)
    # the encoder trims the very top of the sound, which the K-weighting counts: measured again as written, and the
    # difference made up once (within the peak cap)
    miss = ref - loud_db(back)
    if abs(miss) > 0.05:
        k = min(10 ** (miss / 20), PEAK_CAP / max(1e-9, float(np.max(np.abs(y)))))
        y = y * k; g *= k
        encode(y, dst)
        back = decode(dst)
    a, b = back[:, 0], back[:, 1]
    n = min(len(a), int(2.0 * SR))
    corr = float(np.dot(a[:n], b[:n]) / (np.linalg.norm(a[:n]) * np.linalg.norm(b[:n]) + 1e-12))
    r = dict(info, key=key, gain_db=round(20 * math.log10(g), 2), peak=round(min(pk, PEAK_CAP), 3), capped_db=round(capped, 2),
             sec_old=round(len(old) / SR, 2), sec=round(len(y) / SR, 2), lr_corr=round(corr, 2),
             level_after=round(loud_db(back) - ref, 2), kb=os.path.getsize(dst) // 1024)
    REPORT.setdefault(name, []).append(r)
    print("%-12s %5s  gain %+6.2f dB  peak %.3f%s  %.2f s (old %.2f)  L/R corr %.2f  level vs old %+.2f dB%s" % (
        name, key, r["gain_db"], r["peak"], "  (lowered %.2f dB)" % capped if capped else "", r["sec"], r["sec_old"], corr,
        r["level_after"], ("  " + info["note"]) if info.get("note") else ""), flush=True)
    return back


# ══════════════════════════════════════════════════════════════════════════
#  tuning, measured again from the files as written (each channel), against the old file
# ══════════════════════════════════════════════════════════════════════════
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


def cents(d, midi, how, a, z):
    """piano_vcsl_sets.py's meter: harm = its row of partials (weighted median), bar = its lowest partial, bell = half its
    fourth partial; from a to z seconds after the note starts"""
    pk = np.abs(d).max(); on = int(np.argmax(np.abs(d) > pk * 0.03))
    seg = d[on + int(a * SR): on + int(z * SR)]
    n = 1 << 19
    S = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), n))
    f = 440.0 * 2 ** ((midi - 69) / 12)
    if how == "bar":
        r = peak_near(S, n, f, 80); return None if r is None else 1200 * np.log2(r[0] / f)
    if how == "bell":
        r = peak_near(S, n, 2 * f, 100); return None if r is None else 1200 * np.log2(r[0] / (2 * f))
    est = []
    for k in range(1, 7):
        r = peak_near(S, n, k * f, 60)
        if r is None:
            break
        est.append((r[0] / k, r[1]))
    if not est:
        return None
    mx = max(e[1] for e in est)
    est = sorted(e for e in est if e[1] > 0.08 * mx)
    w = np.array([e[1] for e in est]); fr = np.array([e[0] for e in est]); c = np.cumsum(w)
    return 1200 * np.log2(fr[np.searchsorted(c, c[-1] / 2)] / f)


def tuning(name, key, midi, back, how, a, z):
    old = old_file(name, key)
    co = cents(old, midi, how, a, z)
    cl, cr = cents(back[:, 0], midi, how, a, z), cents(back[:, 1], midi, how, a, z)
    cm = cents(back.mean(axis=1), midi, how, a, z)
    r = REPORT[name][-1]
    r.update(cents_old=None if co is None else round(co, 1), cents_L=None if cl is None else round(cl, 1),
             cents_R=None if cr is None else round(cr, 1), cents_mix=None if cm is None else round(cm, 1))
    print("%-12s %5s  tuning: old %s, now L %s R %s (both %s) cents" % (name, key, r["cents_old"], r["cents_L"], r["cents_R"], r["cents_mix"]))


# ══════════════════════════════════════════════════════════════════════════
#  1 · piano_vsco_sets.py: the harp, the marimba and the soft strings
# ══════════════════════════════════════════════════════════════════════════
H = "Strings/Harp/KSHarp_%s.wav"
M = "Percussion/Marimba/Marimba_hit_Outrigger_%s_loud_01.wav"
VC = "Strings/Cello Section/susvib/susvib_%s_v1_1.wav"
VA = "Strings/Viola Section/susvib/ViolaEns_susvib_%s_v1_1.wav"
VN = "Strings/Violin Section/susVib/VlnEns_susVib_%s_v1.wav"
VSCO_SETS = {
  "harp": dict(kind="pluck", files=[
      (28, H % "E1_f", 28), (35, H % "B1_mf", 35), (38, H % "D2_mf", 38), (41, H % "F2_mf", 41), (45, H % "A2_mf", 45),
      (48, H % "C3_mf", 48), (52, H % "E3_mf", 52), (55, H % "G3_mf", 55), (59, H % "B3_mf", 59), (62, H % "D4_mf", 62),
      (65, H % "F4_mf", 65), (69, H % "A4_mf", 69), (72, H % "C5_mf", 72), (76, H % "E5_mf", 76), (79, H % "G5_mf", 79),
      (83, H % "B5_mf", 83), (86, H % "D6_mf", 86), (89, H % "F6_mf", 89), (93, H % "A6_mf", 93), (98, H % "D7_f", 98),
      (101, H % "F7_f", 101)]),
  "marimba": dict(kind="mallet", files=[
      (41, M % "F1", 41), (48, M % "C2", 48), (55, M % "G2", 55), (59, M % "B2", 59), (65, M % "F3", 65),
      (72, M % "C4", 72), (79, M % "G4", 79), (83, M % "B4", 83), (89, M % "F5", 89), (96, M % "C6", 96)]),
  "strings": dict(kind="bow", files=[
      (36, VC % "C1", 36), (40, VC % "E1", 40), (43, VC % "G1", 43), (47, VC % "B1", 47), (50, VC % "D2", 50),
      (53, VC % "F2", 53), (57, VC % "A2", 57), (59, VA % "B2", 59), (62, VA % "D3", 62), (65, VA % "F3", 65),
      (69, VA % "A3", 69), (72, VN % "C4", 72), (76, VN % "E4", 76), (79, VN % "G4", 79), (83, VN % "B4", 83),
      (86, VN % "D5", 86)]),
}


def vsco_wav(path):
    """as piano_vsco_sets.py read it (scipy's wav reader, 16- or 24-bit), both channels kept"""
    import io
    from scipy.io import wavfile
    sr, d = wavfile.read(io.BytesIO(git_bytes(VSCO, path)))
    if d.dtype == np.int16:
        d = d.astype(np.float64) / 32768.0
    elif d.dtype == np.int32:
        d = d.astype(np.float64) / 2147483648.0
    else:
        d = d.astype(np.float64)
    if d.ndim == 1:
        d = np.stack([d, d], axis=1)
    if sr != SR:
        d = fft_resample(d, int(round(len(d) * SR / sr)), axis=0)
    return d


def vsco_cents_off(d, onset, midi, kind):
    f_exp = 440.0 * 2 ** ((midi - 69) / 12)
    a, z = (0.8, 3.0) if kind == "bow" else (0.04, 0.6)
    seg = d[onset + int(a * SR): onset + int(z * SR)]
    n = 1 << 19
    S = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), n))
    est = []
    kmax = 1 if kind == "mallet" else 6
    for k in range(1, kmax + 1):
        lo = int(k * f_exp * 2 ** (-60 / 1200) * n / SR); hi = int(k * f_exp * 2 ** (60 / 1200) * n / SR) + 1
        if hi >= len(S) - 1:
            break
        i = lo + int(np.argmax(S[lo:hi]))
        p = 0.0
        if 0 < i < len(S) - 1:
            al, be, ga = np.log(S[i - 1] + 1e-15), np.log(S[i] + 1e-15), np.log(S[i + 1] + 1e-15)
            den = al - 2 * be + ga
            p = 0.5 * (al - ga) / den if den != 0 else 0.0
        est.append(((i + p) * SR / n / k, S[i]))
    mx = max(e[1] for e in est)
    est = [e for e in est if e[1] > 0.08 * mx]
    est.sort()
    w = np.array([e[1] for e in est]); f = np.array([e[0] for e in est])
    c = np.cumsum(w); f0 = f[np.searchsorted(c, c[-1] / 2)]
    return 1200 * np.log2(f0 / f_exp)


def vsco_length(kind, m):
    if kind == "pluck":
        return 5.0 if m <= 41 else 4.5 if m <= 59 else 3.5 if m <= 76 else 2.6 if m <= 89 else 2.0
    if kind == "mallet":
        return 3.0 if m <= 55 else 2.2 if m <= 72 else 1.6
    return 5.6


def build_vsco(name):
    spec = VSCO_SETS[name]; kind = spec["kind"]
    for target, src, sounding in spec["files"]:
        st = vsco_wav(src)
        d = st.mean(axis=1)                                   # the mix piano_vsco_sets.py listened to
        pk = np.abs(d).max()
        onset = int(np.argmax(np.abs(d) > pk * 0.03))
        dev = vsco_cents_off(d, onset, sounding, kind)
        shift = (target - sounding) * 100 + dev
        start = max(0, onset - int(0.005 * SR))
        L = vsco_length(kind, target)
        seg = st[start: start + int((L * 2 ** (abs(shift) / 1200) + 0.2) * SR)]
        if abs(shift) > 2:
            seg = fft_resample(seg, int(round(len(seg) * 2 ** (shift / 1200))), axis=0)
        n = int(L * SR)
        seg = np.concatenate([seg, np.zeros((max(0, n - len(seg)), 2))])[:n]
        f0 = 440.0 * 2 ** ((target - 69) / 12)
        hpf = max(20.0, f0 * (0.35 if kind == "mallet" else 0.5))
        seg = sosfilt(butter(2, hpf, "highpass", fs=SR, output="sos"), seg, axis=0)
        if kind == "pluck" and target <= 55:
            seg = sosfilt(butter(2, 5000.0 if target <= 45 else 7000.0, "lowpass", fs=SR, output="sos"), seg, axis=0)
        fi = int(0.005 * SR); seg[:fi] *= (np.sin(np.linspace(0, np.pi / 2, fi)) ** 2)[:, None]
        fo = int((0.6 if kind != "bow" else 0.15) * SR); seg[-fo:] *= (np.cos(np.linspace(0, np.pi / 2, fo)) ** 2)[:, None]
        key = "%dm" % target
        back = match_and_write(name, key, seg, {"src": src, "shift_cents": round(shift, 1)})
        a, z = (0.8, 3.0) if kind == "bow" else (0.04, 0.6)
        tuning(name, key, target, back, "bar" if kind == "mallet" else "harm", a, z)


BUILDERS = {"strings": build_vsco, "harp": build_vsco, "marimba": build_vsco}


def main():
    names = sys.argv[1].split(",")
    for nm in names:
        BUILDERS[nm](nm)
        rs = REPORT[nm]
        size = sum(os.path.getsize(os.path.join(PIANO, NEW(nm), f)) for f in os.listdir(os.path.join(PIANO, NEW(nm))))
        print("%-12s %d files, %.2f MB; gain %+.1f to %+.1f dB; %d lowered for peak; L/R corr %.2f to %.2f" % (
            nm, len(rs), size / 1e6, min(r["gain_db"] for r in rs), max(r["gain_db"] for r in rs),
            sum(1 for r in rs if r["capped_db"]), min(r["lr_corr"] for r in rs), max(r["lr_corr"] for r in rs)))
    out = os.environ.get("AOG_STEREO_REPORT")
    if out:
        old = json.load(open(out)) if os.path.exists(out) else {}
        old.update(REPORT)
        json.dump(old, open(out, "w"), indent=1)


if __name__ == "__main__":
    main()
