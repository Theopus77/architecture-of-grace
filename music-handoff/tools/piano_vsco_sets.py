# AOG-PIANO-STEREO-V1 (2026-10-04): the sets this made in one channel are now made in stereo, from the same takes, by
# piano_stereo_sets.py (into audio/piano/<set>2/); this program is kept as the record of how each note is cut.
# Harp, marimba and soft strings for the piano bench, from VS Chamber Orchestra: Community Edition (CC0).
# Made the way the piano sets were made: mono, 44,100 Hz, 96 kbps MP3, a note every few semitones,
# the quiet moment before the note trimmed, each note shortened and faded, the notes brought to one level.
# Added here: each note's pitch is measured and, if it is off, the note is retuned (resampled).
import os, sys, json, subprocess, tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]                      # .../aog-deploy/audio/piano
SR = 44100

H = "Strings/Harp/KSHarp_%s.wav"
M = "Percussion/Marimba/Marimba_hit_Outrigger_%s_loud_01.wav"
VC = "Strings/Cello Section/susvib/susvib_%s_v1_1.wav"
VA = "Strings/Viola Section/susvib/ViolaEns_susvib_%s_v1_1.wav"
VN = "Strings/Violin Section/susVib/VlnEns_susVib_%s_v1.wav"

# (target midi, source file, sounding midi of the source as recorded)
SETS = {
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


def load(path):
    sr, d = wavfile.read(path)
    if d.dtype == np.int16:
        d = d.astype(np.float64) / 32768.0
    elif d.dtype == np.int32:
        d = d.astype(np.float64) / 2147483648.0
    else:
        d = d.astype(np.float64)
    if d.ndim > 1:
        d = d.mean(axis=1)
    if sr != SR:
        d = resample(d, int(round(len(d) * SR / sr)))
    return d


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
    from scipy.signal import lfilter
    for k in (rbj("hp", 60, 0.5, 0), rbj("hs", 1500, 0.7, 4)):
        d = lfilter(k[0], k[1], d)
    return d


def cents_off(d, onset, midi, kind):
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


def length_for(kind, m):
    if kind == "pluck":
        return 5.0 if m <= 41 else 4.5 if m <= 59 else 3.5 if m <= 76 else 2.6 if m <= 89 else 2.0
    if kind == "mallet":
        return 3.0 if m <= 55 else 2.2 if m <= 72 else 1.6
    return 5.6                           # bowed: the page loops 2.4 s to 5.4 s


def main():
    report = {}
    for name, spec in SETS.items():
        kind = spec["kind"]
        os.makedirs(os.path.join(OUT, name), exist_ok=True)
        notes = []
        for target, src, sounding in spec["files"]:
            d = load(os.path.join(HERE, src))
            pk = np.abs(d).max()
            onset = int(np.argmax(np.abs(d) > pk * 0.03))
            dev = cents_off(d, onset, sounding, kind)
            shift = (target - sounding) * 100 + dev        # cents the recording sits above where it should
            start = max(0, onset - int(0.005 * SR))
            L = length_for(kind, target)
            seg = d[start: start + int((L * 2 ** (abs(shift) / 1200) + 0.2) * SR)]
            if abs(shift) > 2:                              # retune: stretch (to lower) or squeeze (to raise)
                seg = resample(seg, int(round(len(seg) * 2 ** (shift / 1200))))
            n = int(L * SR)
            seg = np.concatenate([seg, np.zeros(max(0, n - len(seg)))])[:n]
            # below the note: no rumble or thump from the room (a gentle high-pass under the fundamental); the quiet low
            # harp strings were recorded softly, so above their tone only hiss is left: a low-pass takes it away
            f0 = 440.0 * 2 ** ((target - 69) / 12)
            from scipy.signal import butter, sosfilt
            hp = max(20.0, f0 * (0.35 if kind == "mallet" else 0.5))
            seg = sosfilt(butter(2, hp, "highpass", fs=SR, output="sos"), seg)
            if kind == "pluck" and target <= 55:
                seg = sosfilt(butter(2, 5000.0 if target <= 45 else 7000.0, "lowpass", fs=SR, output="sos"), seg)
            # level: the loudest 400 ms, K-weighted, brought to one target for the whole set
            kw = kweight(seg) ** 2
            W = int(0.4 * SR); hop = int(0.05 * SR)
            best = max(kw[i:i + W].mean() for i in range(0, max(1, len(kw) - W), hop))
            lvl = 10 * np.log10(best + 1e-15)
            target_db = {"pluck": -21.0, "mallet": -21.0, "bow": -22.0}[kind]
            g = 10 ** ((target_db - lvl) / 20)
            seg = seg * g
            p2 = np.abs(seg).max()
            if p2 > 0.93:
                seg *= 0.93 / p2
            # the start: 5 ms of lead-in faded in; the end: a gentle fade (bowed notes are looped before it)
            fi = int(0.005 * SR); seg[:fi] *= np.sin(np.linspace(0, np.pi / 2, fi)) ** 2
            fo = int((0.6 if kind != "bow" else 0.15) * SR); seg[-fo:] *= np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
                wavfile.write(tf.name, SR, (np.clip(seg, -1, 1) * 32767).astype(np.int16))
                out = os.path.join(OUT, name, "%dm.mp3" % target)
                subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", tf.name, "-codec:a", "libmp3lame",
                                "-b:a", "96k", "-ar", str(SR), "-ac", "1", out], check=True)
                os.unlink(tf.name)
            notes.append(target)
            print("%-8s %3d  from %-52s off %+6.1f cents  level %+6.1f dB -> %+5.1f  peak %.2f  %.1f s" % (
                name, target, os.path.basename(src), shift, lvl, target_db, min(0.93, p2), L))
        report[name] = notes
    print(json.dumps(report))


main()
