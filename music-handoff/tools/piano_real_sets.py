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
  organ, gospel, rockorgan
             Unitra B-11 transistor organ (Karoryfer Caveman Cosmonaut, CC0), voices chosen and mixed per set
             (strsynth, pad, brass and lead were made here from it too; since AOG-PIANO-SYNTH-V1 they are real analog
             synthesizers, made by piano_synth_sets.py)
  theatre    the Quiet manual of Simon Dalzell's pipe organ (VS Chamber Orchestra: Community Edition, CC0),
             stopped flutes at 16', 8' and 4'
  choir      one singer on "ah" (Karoryfer Hadzi-Fia, from sfzinstruments/legato_vocal_tutorial, CC0), four takes
             layered per note
  toy        AOG-PIANO-TOYBOX-V1: a real 1950s Michelsonne toy piano (Freesound pack 4565 by beskhu, CC BY 4.0),
             30 keys one after another, C4 to F6, each key keeping up to 4 cents of its own tuning
  musicbox   AOG-PIANO-TOYBOX-V1: a real music box's comb (Freesound pack 4540 by folkman, CC0), 16 notes of D major,
             D5 to E7, each tooth plucked on its own
             (both were the celesta, voiced another way, until 2026-10-05; Freesound's own MP3 copies are used,
             the files anyone can download without an account; see FREESOUND below)

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

# AOG-PIANO-TOYBOX-V1 (2026-10-05): sources on Freesound. Each pack's license, as its sound pages state it:
#   beskhu, "Michelsonne piano toy" (https://freesound.org/people/beskhu/packs/4565/): "Attribution 4.0. You are free
#     to share (to copy, distribute and transmit) and to remix (to adapt and modify) as long as you credit the author
#     of the sound." (https://creativecommons.org/licenses/by/4.0/). The pack: "multisample pack of a collection
#     piano toy from the 50's (MICHELSONNE)"; mono, 44,100 Hz, 24 bit.
#   folkman, "Music Box In the Key of D" (https://freesound.org/people/folkman/packs/4540/): Creative Commons 0
#     (https://creativecommons.org/publicdomain/zero/1.0/). "I recorded 16 notes from a music box. I waited for the
#     motor to loose juice then I wound it forward manually so I could record each separate note chromatically.
#     There are two octaves plus one note." Mono, 44,100 Hz, 16 bit.
# The files are Freesound's high-quality MP3 previews (the same recordings; the original WAV/AIFF needs a login),
# fetched by --fetch from cdn.freesound.org. key: (folder, pack page, author, license, user id, {midi: sound id})
FREESOUND = {
    "michelsonne": ("freesound.beskhu.michelsonne", "https://freesound.org/people/beskhu/packs/4565/", "beskhu",
                    "https://creativecommons.org/licenses/by/4.0/", 1031833,
                    {60 + i: 70700 + i for i in range(30)}),      # "Michelsonne 60 C3 f" … "Michelsonne 89 F5 f":
                                                                   # the number is the MIDI note it sounds
    "musicbox": ("freesound.folkman.musicbox", "https://freesound.org/people/folkman/packs/4540/", "folkman",
                 "https://creativecommons.org/publicdomain/zero/1.0/", 1022894,
                 {74: 70181, 76: 70184, 78: 70173, 79: 70174, 81: 70175, 83: 70177, 85: 70179, 86: 70182,
                  88: 70185, 90: 70187, 91: 70188, 93: 70176, 95: 70178, 97: 70180, 98: 70183, 100: 70186}),
    # folkman's names go "MUSIC BOX D 1" … "MUSIC BOX E 3" up the D major scale; measured, they sound D5 to E7
}
# a set rebuilt from new recordings gets a new folder (the old files stay cached for a year)
FOLDER = {"toy": "toy2", "musicbox": "musicbox2"}


def fs_files(key):
    """{midi: path} of a Freesound pack's notes"""
    folder, _, _, _, uid, ids = FREESOUND[key]
    return {m: os.path.join(SRC_ROOT, folder, "%d.mp3" % i) for m, i in ids.items()}


def fs_prepped(key):
    """{midi: path} of a Freesound pack's notes, ready to build from: each file starts right on the strike (it was cut
    there before upload), so an MP3 made from it smears a little of the strike in front. Each gets 5 ms of silence
    before it and its first 3 milliseconds eased in (too short to hear on a struck rod or tooth), kept as a WAV
    beside the download"""
    out = {}
    for m, path in fs_files(key).items():
        wav = path[:-4] + ".lead3.wav"
        if not os.path.exists(wav):
            x = load(path)
            k = int(0.003 * SR)
            x[:k] *= (np.sin(np.linspace(0, np.pi / 2, k)) ** 2)[:, None]
            x = np.concatenate([np.zeros((int(0.005 * SR), x.shape[1])), x])
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", str(x.shape[1]),
                            "-i", "-", "-c:a", "pcm_f32le", wav], input=x.astype(np.float32).tobytes(), check=True)
        out[m] = wav
    return out


def soft_attack(y, hz=7000.0, hold=0.004, ramp=0.006):
    """the first 4 ms of a strike without its top above 7 kHz, coming back over the next 6 ms: a recording cut right on
    the strike otherwise makes the MP3 smear a little of it before the note"""
    from scipy.signal import sosfiltfilt
    low = sosfiltfilt(butter(4, hz / (SR / 2), "low", output="sos"), y)
    t = (np.arange(len(y)) - onset_of(y)) / SR
    w = np.sin(np.clip((t - hold) / ramp, 0, 1) * np.pi / 2) ** 2
    return low + (y - low) * w


def declick(y, at_from=0.02, hz=8000.0, cut_hz=2000.0, over_db=9.0, passes=4):
    """a music box's mechanism ticks now and then as the drum turns (a pin brushing a tooth, the stop): short bursts
    high above the note. A burst is found as pianosets.js listens for a click: a 1 ms window whose sound above 8 kHz
    is more than over_db louder than every window in the 70 ms around it (3 ms either side left out). There, and only
    there, the sound above 2 kHz (a tick reaches down that far, more so on a tooth moved down in pitch) is brought down until
    the burst is no louder than its surroundings, smoothly. The note itself is left as recorded"""
    from scipy.signal import sosfiltfilt
    det = y.copy()                                    # the checker's own filter: two RBJ high-pass biquads
    for _ in range(2):
        w0 = 2 * np.pi * hz / SR; cw = np.cos(w0); al = np.sin(w0) / (2 * np.sqrt(0.5)); a0 = 1 + al
        det = lfilter([(1 + cw) / 2 / a0, -(1 + cw) / a0, (1 + cw) / 2 / a0], [1, -2 * cw / a0, (1 - al) / a0], det)
    low = sosfiltfilt(butter(4, cut_hz / (SR / 2), "low", output="sos"), y)
    high = y - low
    w = int(0.001 * SR)
    nw = len(y) // w
    for _ in range(passes):
        e = np.sqrt(np.mean(det[:nw * w].reshape(nw, w) ** 2, axis=1)) + 1e-12
        g = np.ones(nw)
        for i in range(int(at_from * SR) // w, nw):
            nb = np.concatenate([e[max(0, i - 35):max(0, i - 3)], e[i + 4:i + 36]])
            if len(nb) < 10:
                continue
            ref = np.max(nb)
            if e[i] > ref * 10 ** (over_db / 20):
                g[i] = ref / e[i]
        if np.all(g == 1):
            break
        gp = np.pad(g, 2, mode="edge")                    # the cut widened by 2 ms each side first, then smoothed, so
        g = np.min([gp[i:i + nw] for i in range(5)], axis=0)  # the smoothing never lifts the tick back up
        g = np.convolve(np.pad(g, 2, mode="edge"), np.hanning(5) / np.hanning(5).sum(), mode="valid")
        gs = np.interp(np.arange(len(y)), np.arange(nw) * w + w / 2, g)
        high = high * gs
        det = det * gs
    return low + high


def fetch_freesound(root):
    for key, (folder, page, author, lic, uid, ids) in FREESOUND.items():
        d = os.path.join(root, folder)
        os.makedirs(d, exist_ok=True)
        for m, i in ids.items():
            p = os.path.join(d, "%d.mp3" % i)
            if not os.path.exists(p):
                url = "https://cdn.freesound.org/previews/%d/%d_%d-hq.mp3" % (i // 1000, i, uid)
                subprocess.run(["curl", "-sSLf", "--retry", "4", "-o", p, url], check=True)


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
    fetch_freesound(root)


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


# AOG-PIANO-TOYBOX-V1: the toy piano's and the music box's strikes are sharper than any other set's; at 96 kbps the MP3's
# noise in the block of the strike reaches 2% of the peak, before the note starts. At 160 kbps it stays under 0.5%
KBPS = {"toy": 160, "musicbox": 160}
_KBPS = [96]


def write_mp3(path, y):
    """mono, 44,100 Hz, 96 kbps MP3 (LAME's most careful mode), with the gapless header browsers use to drop the
    encoder delay"""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    y = np.clip(y, -1, 1).astype(np.float32)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-codec:a", "libmp3lame", "-b:a", "%dk" % _KBPS[0], "-compression_level", "0", "-ar", str(SR), "-ac", "1",
                    path], input=y.tobytes(), check=True)


def decode_mp3(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def measure_mp3(path):
    d = decode_mp3(path)
    pk = np.max(np.abs(d))
    return onset_of(d) / SR, float(np.max(np.abs(d[:4])) / pk)


def write_struck(path, y, max_cut=None):
    """a note, written, then decoded and measured as the page measures it. A slow start whose onset lands past
    1.6 ms loses a little of the silence in front (a held note at most 2 ms in all: its loop allows that); if the
    MP3's pre-echo lifts the very first samples over 0.6% of the peak, a little silence is added in front until it
    does not. Returns (onset s, head)."""
    L = int(0.0008 * SR)
    budget = int(max_cut * SR) if max_cut else 10 ** 9
    for _ in range(3):
        write_mp3(path, y)
        on, head = measure_mp3(path)
        if on <= 0.0016 or budget <= 0:
            break
        cut = min(budget, int((on - 0.0009) * SR))
        budget -= cut
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
    # last resort: the fade-in reaches a little into the strike (0.3, 0.6, then 0.9 ms past the onset), which
    # rounds its very first instant and gives the MP3 less to smear forward
    if best[0] > 0.008:
        i = onset_of(y)
        # AOG-PIANO-TOYBOX-V1: a recording cut right on its strike may need a little longer (up to 4 ms, still a strike)
        for extra in (0.0003, 0.0006, 0.0009, 0.0015, 0.0025, 0.004):
            k = i + int(extra * SR)
            z = y.copy()
            z[:k] *= np.sin(np.linspace(0, np.pi / 2, k)) ** 2
            write_mp3(path, z)
            on2, head2 = measure_mp3(path)
            if 0.0003 <= on2 <= 0.00195 and head2 <= 0.008:
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
    if method == "centre":          # a pan note rings as two close partials: the ear hears the middle of the pair
        return pitch_centroid(seg, mtof(n), 0, len(seg) / SR, ks=(1,), span_c=60)
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
    p = os.path.join(OUT, FOLDER.get(setname, setname), "%d%s.mp3" % (n, layer))
    _KBPS[0] = KBPS.get(setname, 96)
    on, head = write_struck(p, y, max_cut=None if struck else 0.002)
    meta = dict(meta, onset_ms=round(1000 * on, 2), first_samples=round(head, 4))
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
               method="harm", env=None, post=None):
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
        if post is not None:
            y = post(y)
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
    os.makedirs(os.path.join(OUT, FOLDER.get(name, name)), exist_ok=True)
    for fn in os.listdir(os.path.join(OUT, FOLDER.get(name, name))):
        if fn.endswith(".mp3"):
            os.unlink(os.path.join(OUT, FOLDER.get(name, name), fn))
    REPORT[name] = {"files": {}}
    for (n, layer), (y, meta) in sorted(files.items()):
        y, lvl = level_to(y, targets[layer])
        pk = float(np.max(np.abs(y)))
        if pk > PEAK_MAX:
            y *= PEAK_MAX / pk
        meta = dict(meta, level_db=round(lvl, 1), peak=round(min(pk, PEAK_MAX), 3),
                    trimmed_db=round(20 * math.log10(min(1.0, PEAK_MAX / pk)), 1))
        note_file(name, n, layer, y, meta, struck=not (extra and "loop" in extra))
    entry = {"dir": "/audio/piano/%s/" % FOLDER.get(name, name), "layers": layers, "even": True, "notes": notes}
    if extra:
        entry.update(extra)
    REPORT[name]["sets_entry"] = entry
    size = sum(os.path.getsize(os.path.join(OUT, FOLDER.get(name, name), f)) for f in os.listdir(os.path.join(OUT, FOLDER.get(name, name))))
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


def struck_set(name, layer_src, measure, lengths, pitch="fund", grid_notes=None, note_opts=None, extra_meta=None,
               pick=None):
    """a set of struck or plucked notes. layer_src: {layer: {recorded midi: path}}; measure(x, r) → the
    recording's true frequency; lengths(n, layer) → seconds; note_opts(n, layer) → extra decay_note options;
    pick(layer, n, recorded) → which recording a note is made from (the nearest, unless given)"""
    notes = grid_notes or best_grid([sorted(v) for v in layer_src.values()])
    files, cache = {}, {}
    for layer, reals in layer_src.items():
        rs = sorted(reals)
        for n in notes:
            r = pick(layer, n, rs) if pick else nearest(rs, n)
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
    # a pan's note often rings as two close partials (about 15 cents apart, nearly as strong, and which is stronger
    # can change as it rings): each note is tuned by the middle of the pair, the pitch the ear hears
    struck_set("steel", layer_src, fund_measure(0.04, 0.5),
               lambda n, l: 2.2 if n < 60 else 2.4 if n < 72 else 2.0 if n < 84 else 1.6,
               pitch="centre", note_opts=lambda n, l: {"fade_frac": 0.4})


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
#  held notes (organs, accordion, choir, synths): the page loops them
# ══════════════════════════════════════════════════════════════════════════
def rbj_lowpass(fc, q):
    w = 2 * np.pi * min(fc, 0.45 * SR) / SR; cw = np.cos(w); al = np.sin(w) / (2 * q)
    b = np.array([(1 - cw) / 2, 1 - cw, (1 - cw) / 2]); a = np.array([1 + al, -2 * cw, 1 - al])
    return b / a[0], a / a[0]


def tv_lowpass(y, fc_of_t, q=0.7, block=32):
    """a low-pass whose cutoff moves with time (fc_of_t: seconds → Hz), its settings renewed every 32 samples"""
    out = np.empty_like(y)
    zi = np.zeros(2)
    for s in range(0, len(y), block):
        b, a = rbj_lowpass(fc_of_t((s + block / 2) / SR), q)
        out[s:s + block], zi = lfilter(b, a, y[s:s + block], zi=zi)
    return out


def loud_phase(x, s0, period):
    """a start point within one cycle after s0 (samples) where the wave is near its largest, 0.3 ms early: a note
    that starts there is under way at once, even a slow low one"""
    a = int(s0)
    seg = np.abs(x[a:a + int(period) + 2])
    return a + max(0, int(np.argmax(seg)) - int(0.0003 * SR))


def steady_read(x, f_src, f_out, n_out, s0=0.1, s1=None, pm=None, loop=None, div=1):
    """an endless held tone from a short recording: read at the speed that moves f_src to f_out, and before the
    recording ends, jump back a whole number of its cycles (div notes' worth each: 2 when a 16' tone makes the
    real cycle two notes long), or by its own loop when it has one, with a 30 ms blend. The read starts at a loud
    point of the wave. pm: an optional speed multiplier per output sample (a vibrato, a scoop)."""
    rho = f_out / f_src
    XW = int(0.03 * SR)
    if loop:
        S0, Lam = float(loop[0]), float(loop[1] - loop[0])
    else:
        S1 = (s1 if s1 else len(x) / SR - 0.05) * SR
        P = div * SR / f_src
        S0 = float(loud_phase(x, s0 * SR, P))
        Lam = int((S1 - S0 - XW) // P) * P
    if pm is None:
        u = S0 + np.arange(n_out) * rho
        rate = rho
    else:
        u = S0 + np.concatenate([[0.0], np.cumsum(rho * pm[:n_out - 1])])
        rate = rho * float(np.max(pm))
    r = S0 + np.mod(u - S0, Lam)
    out = sinc_read(x, r, rate)
    near = r > S0 + Lam - XW
    if np.any(near):
        B = sinc_read(x, r[near] - Lam, rate)
        w = np.sin((r[near] - (S0 + Lam - XW)) / XW * np.pi / 2) ** 2
        out[near] = out[near] * (1 - w) + B * w
    return out


def corr(a, b):
    return float(np.dot(a, b) / math.sqrt(np.dot(a, a) * np.dot(b, b) + 1e-30))


def make_loop(y, P0, L, a, z, W=0.05, search=None):
    """make a held note exactly periodic with period L from P0 on, for the page's loop [a, z] (z = a + L):
    - the last W seconds before P0 + L are blended into the W seconds before P0, with gains that keep the level
      steady for how alike the two are (linear when they match, equal-power when they do not); with search=(lo,
      hi), P0 is first moved within [lo, hi] to where the two match best;
    - that cycle repeats to the end;
    - the half second before z is pre-faded by tan(pi/4 - w/2), so that the page's own equal-power blend of it
      with the half second before a gives back the note exactly (designed for an MP3 decoder delay half way
      between 0 and 25 ms, the two cases browsers show);
    - after z, silence."""
    n_total = int(round((z + 0.06) * SR))
    out, rho, p0 = periodize(y, P0, L, n_total, W, search)
    if p0 > a - LOOP_X - DEC_DELAY - 0.004:
        raise ValueError("cycle starts too late for the loop")
    return page_prefade(out, z), rho, p0


def periodize(y, P0, L, n_total, W=0.05, search=None):
    """y made exactly periodic with period L from P0 on (see make_loop), n_total samples long"""
    Ls, Ws = int(round(L * SR)), int(round(W * SR))
    P0s = int(round(P0 * SR))
    if search:
        best = None
        for p in range(int(search[0] * SR), int(search[1] * SR) + 1, int(0.001 * SR)):
            if p + Ls > len(y) or p < Ws:
                continue
            r = corr(y[p + Ls - Ws:p + Ls], y[p - Ws:p])
            if best is None or r > best[0]:
                best = (r, p)
        P0s = best[1]
    if P0s + Ls > len(y):
        raise ValueError("note too short for its loop")
    A, B = y[P0s + Ls - Ws:P0s + Ls], y[P0s - Ws:P0s]
    rho = max(0.0, min(1.0, corr(A, B)))
    gb = np.sin(np.linspace(0, np.pi / 2, Ws)) ** 2
    ga = -rho * gb + np.sqrt(np.maximum(0.0, 1 - gb * gb * (1 - rho * rho)))
    out = np.zeros(n_total)
    out[:P0s + Ls] = y[:P0s + Ls]
    out[P0s + Ls - Ws:P0s + Ls] = ga * A + gb * B
    cyc = out[P0s:P0s + Ls].copy()
    pos = P0s + Ls
    while pos < n_total:
        k = min(Ls, n_total - pos)
        out[pos:pos + k] = cyc[:k]
        pos += k
    return out, rho, P0s / SR


def page_prefade(out, z):
    """the half second before z pre-faded for the page's own loop blend (see make_loop); silence after z"""
    t = np.arange(len(out)) / SR
    w = np.clip((t + DEC_DELAY / 2 - (z - LOOP_X)) / LOOP_X, 0, 1) * np.pi / 2
    out = out * np.tan(np.pi / 4 - w / 2)
    out[int(round(z * SR)):] = 0.0
    return out


def pick_loop_len(freqs_divs, lo, hi):
    """the loop length (a multiple of 10 ms, so it is a whole number of samples at 44,100 and 32,000 Hz) that lets
    every held note make a whole number of its slowest cycles per loop with the least retuning. freqs_divs: for
    each note, (its frequency, D) where its slowest cycle is D notes long (2 when a voice carries a 16' tone)."""
    best = None
    for L in np.arange(lo, hi + 1e-9, 0.01):
        err = max(abs(1200 * math.log2(D * round(f * L / D) / (f * L))) for f, D in freqs_divs)
        if best is None or err < best[0]:
            best = (err, round(float(L), 2))
    return best[1], best[0]


def attack_env(t, rise, pre=0.0, shape="cos"):
    """0 → 1 over `rise` seconds (raised cosine, or linear); with pre > 0 the sound first steps up to `pre` within
    0.8 ms, so a slow swell still starts at once (the page finds a note's start at 3% of its peak)"""
    if shape == "lin":
        e = np.clip(t / rise, 0, 1)
    else:
        e = np.sin(np.clip(t / rise, 0, 1) * np.pi / 2) ** 2
    if pre:
        e = np.maximum(e, pre * np.clip(t / 0.0008, 0, 1))
    return e


# ── the Unitra B-11 (Karoryfer Caveman Cosmonaut): one recording per voice and key, G3 to C7, held ──
CAVE_SUB = {"flutes": 2, "trombone": 2, "all_all_all": 2}      # voices with a 16' undertone: a cycle is two notes long


def cave_files(voice):
    d = src("caveman", "Samples")
    out = {}
    for fn in os.listdir(d):
        m = re.match(r"^%s_([a-g]b?\d)\.wav$" % voice, fn)
        if m:
            out[name_midi(m.group(1))] = os.path.join(d, fn)
    return out


_CAVE = {}


def cave_note(voice, r):
    """a Caveman recording: mono, and its exact frequency (its whole cycle, two notes long for a voice with a 16'
    tone, measured over the recording's length)"""
    key = (voice, r)
    if key not in _CAVE:
        x = to_mono(load(cave_files(voice)[r]))
        f0 = pitch_harm(x, mtof(r), 0.1, min(1.5, len(x) / SR - 0.05), ks=(1, 2, 3, 4, 5, 6))
        div = CAVE_SUB.get(voice, 1)
        P = period_exact(x, f0 / div, 0.1, len(x) / SR - 0.05)
        _CAVE[key] = (x, div * SR / P)
    return _CAVE[key]


def held_set(name, comps, lengths=None, env=None, post=None, P0=0.25, Lrange=(3.0, 4.5), detune=None, vib=None,
             level_db=-22.0, pitch="harm", describe=None):
    """a held organ-family sound from Caveman voices. comps: [(voice, octave offset in keys, gain dB)]. Every note
    is retuned to a whole number of cycles per loop, so the loop needs no blend of its own beyond a 50 ms touch.
    detune(n, L) → the extra steps (in 1/L Hz, per component) that spread two voices a little apart; vib(t) → a
    speed multiplier (vibrato); env(t) → the attack; post(y) → filters."""
    notes = grid(0)
    # the longest cycle in a note: a voice played an octave down, or one with its own 16' tone, puts a tone an
    # octave under the note, so its cycle is two notes long; anything lower is taken out (the high-pass below)
    D = 2 if any(c[1] < 0 or (c[1] == 0 and c[0] in CAVE_SUB) for c in comps) else 1
    divs = [(mtof(n), D) for n in notes]
    L, err = pick_loop_len(divs, *Lrange)
    a = round(P0 + LOOP_X + DEC_DELAY + 0.01, 2)
    z = round(a + L, 2)
    files = {}
    for n, (f, D) in zip(notes, divs):
        N = D * round(f * L / D)
        fq = N / L
        n_out = int(round((P0 + L + 0.05) * SR))
        pm = vib(np.arange(n_out) / SR) if vib else None
        y = np.zeros(n_out)
        used = []
        for ci, comp in enumerate(comps):
            voice, oc, g = comp[:3]
            lpm = comp[3] if len(comp) > 3 else None
            files_v = cave_files(voice)
            r = nearest(sorted(files_v), n + oc)
            x, fs = cave_note(voice, r)
            steps = detune(n, L)[ci] if detune else 0
            k = N * 2 ** (oc / 12)                   # octaves stay exact; a fifth or a twelfth is its own whole
            if oc % 12:                               # number of cycles per loop (tempered, as on a Hammond)
                k = round(k)
            fc = (k + steps) / L
            c = steady_read(x, fs, fc, n_out, pm=pm, div=CAVE_SUB.get(voice, 1))
            if lpm:                                   # softened towards the plain tone of a drawbar
                c = lp(c, lpm * fc / CAVE_SUB.get(voice, 1))
            y += 10 ** (g / 20) * c
            used.append({"voice": voice, "keys_from_note": oc, "from": os.path.relpath(files_v[r], SRC_ROOT),
                         "recorded": r, "source_cents": round(1200 * math.log2(fs / mtof(r)), 1),
                         "shift_semitones": round(12 * math.log2(fc / fs), 2), "gain_db": g,
                         "lowpass_x": lpm, "cents_from_key": round(1200 * math.log2(fc / mtof(n + oc)), 2)})
        y = hp(y, max(20.0, 0.35 * f), order=4)     # nothing under the 16' tone (a voice played an octave down
        if post:                                     # brings its own 16' two octaves under the note: out)
            y = post(y, n)
        t = np.arange(len(y)) / SR
        y *= env(t) if env else attack_env(t, 0.008)
        y[0] = 0.0
        y = trim_start(y)                             # starts 0.8 ms before the page hears it (a filtered or
        y = np.concatenate([y, np.zeros(max(0, n_out - len(y)))])[:n_out]   # mixed start can cross late)
        y, rho, p0 = make_loop(y, P0, L, a, z)
        files[(n, "m")] = (y, {"components": used, "loop_cents": round(1200 * math.log2(fq / f), 2),
                               "seam_match": round(rho, 4)})
    finish_set(name, notes, ["m"], files, targets={"m": level_db}, extra={"loop": [a, z]})
    REPORT[name]["pitch"] = pitch
    REPORT[name]["loop_note"] = ("held notes repeat from %.2f s to %.2f s; every note is retuned by at most %.1f cents "
                                 "to fit a whole number of cycles in the loop" % (a, z, err))
    if describe:
        REPORT[name]["made_from"] = describe


# The B-11's 'flutes' and 'all' voices beat slowly inside one recording (the first holds a tempered 2 2/3' quint a
# cent from the 8' tone's own third harmonic, the second celeste voices 21 cents either side), so no loop can repeat
# them seamlessly. Its other voices are perfectly steady ('trombone' is a 16' reed: it sounds an octave under its
# key). A drawbar organ is several steady tones at set pitches; so are these organs: the B-11's clarinet voice,
# softened towards a plain tone, recorded on the keys an octave under, a fifth over, on, an octave over (and more)
# the note, like drawbars 16', 5 1/3', 8', 4' ... Each is retuned to a whole number of cycles per loop on its own,
# so the sum loops exactly even where two of them beat (a tempered fifth, as on a Hammond).
DRAWBAR = {"16": -12, "5.33": 7, "8": 0, "4": 12, "2.67": 19, "2": 24}


def bars(voice, levels, lpm):
    return [(voice, DRAWBAR[k], db, lpm) for k, db in levels]


def build_organ():
    """rock and jazz organ: three drawbars out (16', 5 1/3', 8') and the 4' a little under, as the page's organ"""
    held_set("organ", bars("clarinet", [("16", 0.0), ("5.33", 0.0), ("8", 0.0), ("4", -6.0)], 1.2),
             describe="Caveman Cosmonaut 'clarinet' voice, softened, on four keys at once like drawbars 16', 5 1/3', 8' "
                      "and 4'")


def build_gospel():
    """gospel organ, every tone out: drawbars 16' to 2', brighter, with the violin voice on top (the page's fast
    spinning speaker does the rest)"""
    held_set("gospel", bars("clarinet", [("16", 0.0), ("8", 0.0), ("5.33", -2.0), ("4", -2.0), ("2.67", -5.0),
                                         ("2", -5.0)], 1.6) + [("violin", 0, -9.0)],
             describe="Caveman Cosmonaut 'clarinet' voice on six keys at once like drawbars 16' to 2', with the 'violin' "
                      "voice")


def build_rockorgan():
    """the '70s rock organ: 16', 5 1/3', 8' and 4' all out and a little 2 2/3', as the page's, with the trumpet voice
    for bite (the page's amplifier makes it growl)"""
    held_set("rockorgan", bars("clarinet", [("16", 0.0), ("5.33", 0.0), ("8", 0.0), ("4", 0.0), ("2.67", -12.0)], 1.4)
             + [("trompette", 0, -12.0)],
             describe="Caveman Cosmonaut 'clarinet' voice on five keys at once like drawbars 16', 5 1/3', 8', 4' and a "
                      "little 2 2/3', with the 'trompette' voice")


# ── theatre: the Quiet manual of Simon Dalzell's pipe organ (VS Chamber Orchestra: Community Edition) ──
def pipe_files():
    d = src("pipes", "Keys", "Organ", "Quiet")
    out = {}
    for fn in os.listdir(d):
        m = re.match(r"^NT5_Man3Quiet_(\d+)_rr1\.wav$", fn)
        if m:
            out[int(m.group(1)) - 86] = os.path.join(d, fn)     # 122 is C2 (measured), every third key to C7
    return out


_PIPE = {}


def pipe_note(r):
    """one pipe recording: mono, from the moment the pipe speaks, and its exact frequency (over its steady part)"""
    if r not in _PIPE:
        x = to_mono(load(pipe_files()[r]))
        x = x[max(0, onset_of(x) - int(0.001 * SR)):]
        f0 = pitch_harm(x, mtof(r), 1.5, 6.0, ks=(1, 2, 3))
        _PIPE[r] = (x, SR / period_exact(x, f0, 1.5, 8.0))
    return _PIPE[r]


def build_theatre():
    """the cinema organ: stopped flute pipes (a tibia's cousin) at 16', 8', 4' and 2' together; past the top pipe a
    rank breaks back an octave, as organ ranks do. The page's tremulant, shared by all the notes, makes it tremble."""
    reals = sorted(pipe_files())
    comps = [(-12, -5.0), (0, 0.0), (12, -4.5), (24, -10.0)]
    notes = grid(0)
    D = 2
    L, err = pick_loop_len([(mtof(n), D) for n in notes], 3.0, 4.5)
    P0lo, P0hi = 1.0, 1.25
    a = round(P0hi + LOOP_X + DEC_DELAY + 0.01, 2)
    z = round(a + L, 2)
    files = {}
    for n in notes:
        f = mtof(n)
        N = D * round(f * L / D)
        n_out = int(round((P0hi + L + 0.15) * SR))
        y = np.zeros(n_out)
        used = []
        for oc, g in comps:
            k = n + oc
            while k > reals[-1] + 1:
                k -= 12
            r = nearest(reals, k)
            x, fs = pipe_note(r)
            fc = N * 2 ** ((k - n) / 12) / L
            ratio = fc / fs
            c = resample(x[:int(n_out * ratio) + 64], ratio)[:n_out]
            y[:len(c)] += 10 ** (g / 20) * c
            used.append({"rank": {-12: "16'", 0: "8'", 12: "4'", 24: "2'"}[oc], "key": k,
                         "from": os.path.relpath(pipe_files()[r], SRC_ROOT), "recorded": r,
                         "source_cents": round(1200 * math.log2(fs / mtof(r)), 1),
                         "shift_semitones": round(12 * math.log2(fc / fs), 2), "gain_db": g})
        y = hp(y, max(20.0, 0.35 * f), order=4)
        y = trim_start(y)
        y = np.concatenate([y, np.zeros(max(0, n_out - len(y)))])
        y, rho, p0 = make_loop(y, P0lo, L, a, z, W=0.1, search=(P0lo, P0hi))
        files[(n, "m")] = (y, {"ranks": used, "loop_cents": round(1200 * math.log2(N / L / f), 2),
                               "seam_match": round(rho, 4), "cycle_start": round(p0, 3)})
    finish_set("theatre", notes, ["m"], files, targets={"m": -22.0}, extra={"loop": [a, z]})
    REPORT["theatre"]["pitch"] = "harm"
    REPORT["theatre"]["loop_note"] = ("held notes repeat from %.2f s to %.2f s; every note is retuned by at most %.1f "
                                      "cents to fit a whole number of cycles in the loop" % (a, z, err))
    REPORT["theatre"]["made_from"] = "VSCO 2 CE pipe organ, Quiet manual (stopped flutes), at 16', 8', 4' and 2'"


# ── accordion: Button Accordion HN, a Hohner (FreePats) ──
def accordion_regions():
    """the instrument's own mapping: each recording's key (an octave under its file name) and its loop"""
    d = src("accordion")
    txt = open(os.path.join(d, "PRESET Button Accordion HN tuned.sfz"), encoding="utf-8").read()
    txt = txt.split("trigger=release")[0]
    out = {}
    for m in re.finditer(r"sample=(.+?\.flac)\s+pitch_keycenter=(\d+).*?loop_start=(\d+)\s+loop_end=(\d+)", txt, re.S):
        out[int(m.group(2))] = (os.path.join(d, m.group(1).strip()), int(m.group(3)), int(m.group(4)))
    return out


def sampler_read(x, ratio, ls, le, n_out, xw=0.02):
    """a recording played from its start at `ratio` speed; past its loop end it goes round its loop (ls to le, in
    samples), with a short blend each time"""
    Lam = float(le - ls)
    XW = int(xw * SR)
    u = np.arange(n_out) * ratio
    r = np.where(u < le, u, ls + np.mod(u - ls, Lam))
    out = sinc_read(x, r, ratio)
    near = r > le - XW
    if np.any(near):
        B = sinc_read(x, r[near] - Lam, ratio)
        w = np.sin((r[near] - (le - XW)) / XW * np.pi / 2) ** 2
        out[near] = out[near] * (1 - w) + B * w
    return out


def build_accordion():
    """two reeds per note, tuned apart (the accordion's shimmer): each note tuned by the middle of the two; held
    notes go round the instrument's own loops, then the page's loop"""
    regs = accordion_regions()
    reals = sorted(regs)
    notes = best_grid([reals])
    L = 2.0
    P0lo, P0hi = 0.22, 0.6
    a = round(P0hi + LOOP_X + DEC_DELAY + 0.01, 2)
    z = round(a + L, 2)
    files, cache = {}, {}
    for n in notes:
        r = nearest(reals, n)
        path, ls, le = regs[r]
        if path not in cache:
            x = to_mono(load(path))
            cache[path] = (x, pitch_centroid(x, mtof(r), ls / SR, le / SR, ks=(1, 2, 3, 4), span_c=60))
        x, fm = cache[path]
        f = mtof(n)
        ratio = f / fm
        n_out = int(round((z + 0.1) * SR))

        def make(ratio):
            y = sampler_read(x, ratio, ls, le, n_out)
            y = hp(y, 0.5 * f)
            if ratio > 2 ** (4 / 12):
                y = lp(y, 14000.0)
            y = trim_start(y)
            y = np.concatenate([y, np.zeros(max(0, n_out - len(y)))])
            return make_loop(y, P0lo, L, a, z, W=0.4, search=(P0lo, P0hi))
        for _ in range(3):                 # the finished note measured as the checker measures it, and retuned
            y, rho, p0 = make(ratio)
            res = 1200 * math.log2(pitch_centroid(y, f, a, z - 0.6, ks=(1, 2, 3, 4), span_c=60) / f)
            if abs(res) < 0.5:
                break
            ratio *= 2 ** (-res / 1200)
        files[(n, "m")] = (y, {"from": os.path.relpath(path, SRC_ROOT), "recorded": r,
                               "source_cents": round(1200 * math.log2(fm / mtof(r)), 1),
                               "shift_semitones": round(12 * math.log2(f / fm), 2), "seam_match": round(rho, 4),
                               "cycle_start": round(p0, 3)})
    finish_set("accordion", notes, ["m"], files, targets={"m": -22.0}, extra={"loop": [a, z]})
    REPORT["accordion"]["pitch"] = "centroid"
    REPORT["accordion"]["made_from"] = "FreePats Button Accordion HN (a Hohner), its one register"


# ── AOG-PIANO-TOYBOX-V1: the music box and the toy piano, real ones (they were the celesta, voiced another way) ──
def build_musicbox():
    """music box: a real music box's comb (folkman, Freesound pack 4540, CC0), one tooth at a time, sixteen notes of D
    major from D5 to E7, so no key is more than a semitone from a tooth; the keys below D5 and above E7 are its lowest
    and highest teeth moved in pitch. Each tooth rings as long as it did, gently faded; the mechanism's little ticks
    above the note are taken out (declick)"""
    struck_set("musicbox", {"m": fs_prepped("musicbox")}, fund_measure(),
               lambda n, l: 3.0 if n < 74 else 2.6 if n < 86 else 2.2 if n < 98 else 1.8,
               note_opts=lambda n, l: {"fade_frac": 0.45, "post": lambda y: soft_attack(declick(y))})
    REPORT["musicbox"]["made_from"] = ("folkman, 'Music Box In the Key of D' (Freesound pack 4540, CC0): 16 teeth, "
                                       "D5 to E7, D major")


def build_toy():
    """toy piano: a real 1950s Michelsonne toy piano (beskhu, Freesound pack 4565, CC BY 4.0), every key from C4 to
    F6; the keys below and above are its own end keys moved in pitch. Each key is brought within 4 cents of true:
    a toy piano's rods are never quite in tune, so each keeps what it had, up to 4 cents either way"""
    files = fs_prepped("michelsonne")
    meas = fund_measure()
    own = {}

    def detune(n):
        r = nearest(sorted(files), n)
        if r not in own:
            x = to_mono(load(files[r]))
            own[r] = 1200 * math.log2(meas(x, r) / mtof(r))
        return float(max(-4.0, min(4.0, round(own[r]))))
    struck_set("toy", {"m": files}, meas,
               lambda n, l: 2.4 if n < 60 else 2.0 if n < 72 else 1.7 if n < 84 else 1.4,
               note_opts=lambda n, l: {"fade_frac": 0.4, "detune_c": detune(n), "post": soft_attack})
    REPORT["toy"]["made_from"] = ("beskhu, 'Michelsonne piano toy' (Freesound pack 4565, CC BY 4.0): a 1950s "
                                  "Michelsonne toy piano, 30 keys, C4 to F6")


# ── choir: one singer on "ah" (Karoryfer Hadzi-Fia), four of his takes per note, as four singers ──
def yin_track(x, f_guess, hop=0.005, span=4.0, thr=0.15):
    """the length of one cycle (samples) every `hop` seconds, searched within `span` semitones of f_guess (YIN);
    where the voice is silent the guess stands"""
    P = SR / f_guess
    lo, hi = max(2, int(P * 2 ** (-span / 12))), int(P * 2 ** (span / 12)) + 2
    W = int(max(2.5 * hi, 0.025 * SR))
    hs = int(hop * SR)
    n = max(1, (len(x) - W - hi) // hs)
    out = np.full(n, P)
    N = 1 << int(math.ceil(math.log2(W + hi + 1)))
    pk = np.max(np.abs(x))
    for k in range(n):
        a = k * hs
        seg = x[a:a + W + hi]
        if np.max(np.abs(seg)) < 0.02 * pk:
            continue
        w0 = seg[:W]
        r = np.fft.irfft(np.conj(np.fft.rfft(w0, N)) * np.fft.rfft(seg, N), N)[:hi + 1]
        cs = np.concatenate([[0], np.cumsum(seg ** 2)])
        e0 = cs[W]
        et = cs[np.arange(hi + 1) + W] - cs[np.arange(hi + 1)]
        d = e0 + et - 2 * r
        d[0] = 0
        cm = np.ones(hi + 1)
        c = np.cumsum(d[1:])
        cm[1:] = d[1:] * np.arange(1, hi + 1) / np.maximum(c, 1e-20)
        t = None
        for tau in range(lo, hi):
            if cm[tau] < thr and cm[tau] <= cm[tau + 1]:
                t = tau
                break
        if t is None:
            t = lo + int(np.argmin(cm[lo:hi]))
        if 0 < t < hi:
            den = cm[t - 1] - 2 * cm[t] + cm[t + 1]
            out[k] = t + (0.5 * (cm[t - 1] - cm[t + 1]) / den if den != 0 else 0.0)
        else:
            out[k] = t
    return out, hs


def pitch_marks(x, track, hs):
    """one mark per cycle, each at the same point of its cycle: the first on the strongest peak of the first
    cycle, each next one where its cycle best matches the one before"""
    T = lambda i: track[min(len(track) - 1, max(0, int(i // hs)))]
    p0 = T(onset_of(x))
    first = max(onset_of(x), int(p0) + 2)            # a whole cycle in, so the first mark has a cycle before it
    i = first + int(np.argmax(np.abs(x[first:first + int(1.5 * p0)])))
    M = [i]
    while True:
        p = T(M[-1])
        h = int(p // 2)
        c = int(round(M[-1] + p))
        rr = max(2, int(p / 6))
        if c + rr + h + 2 >= len(x) or M[-1] - h < 0:
            break
        ref = x[M[-1] - h:M[-1] + h]
        cc = np.correlate(x[c - rr - h:c + rr + h], ref, "valid")
        M.append(c - rr + int(np.argmax(cc)))
    return np.array(M)


def mark_periods(marks):
    """each cycle's length from one mark to the next (a stray mark, more than 30% off its neighbours, is replaced
    by their median)"""
    p = np.diff(marks).astype(float)
    p = np.append(p, p[-1])
    med = np.array([np.median(p[max(0, i - 4):i + 5]) for i in range(len(p))])
    bad = np.abs(p / med - 1) > 0.3
    p[bad] = med[bad]
    return p


def psola(x, marks, periods, ratio_of_t, n_out):
    """TD-PSOLA: the voice's own cycles (two cycles long, Hann-windowed, around each mark) laid down again at the
    new pitch; the vowel (the formants) stays as it was. ratio_of_t(t seconds) → the pitch change there."""
    y = np.zeros(n_out + 4 * int(np.max(periods)) + 8)
    t = float(marks[0])
    j = 0
    while t < min(n_out, marks[-1]):
        while j + 1 < len(marks) and abs(marks[j + 1] - t) <= abs(marks[j] - t):
            j += 1
        a = marks[j]
        p = int(round(periods[j]))
        rt = ratio_of_t(t / SR)
        if a - p >= 0 and a + p + 1 <= len(x):
            ts = int(round(t))
            if ts - p >= 0:
                y[ts - p:ts + p + 1] += x[a - p:a + p + 1] * np.hanning(2 * p + 1) / rt
        t += periods[j] / rt
    y[:marks[0]] = x[:marks[0]]                       # the breath before the first cycle, as it was
    return y[:n_out]


VOICE_NAMES = {}


def voice_files():
    d = src("voice", "Samples", "vowel_sustain", "a")
    out = {}
    for fn in os.listdir(d):
        m = re.match(r"^vowel_a_([a-g]b?\d)\.wav$", fn)
        if m:
            out[name_midi(m.group(1)) - 12] = os.path.join(d, fn)    # he sings an octave under the file names
    return out


_VOICE = {}


def voice_take(r):
    """one take: mono, from its onset; its cycle track; its marks; its pitch, smoothed over 0.6 s (the slow drift,
    which the choir's tuning removes; the faster wobble of the voice stays)"""
    if r not in _VOICE:
        x = to_mono(load(voice_files()[r]))
        x = x[max(0, onset_of(x) - int(0.002 * SR)):]
        # his pitch sits up to 60 cents flat of the file's name: find it first, then track it
        seg0 = x[int(0.5 * SR):int(2.5 * SR)]
        f_est = pitch_harm(seg0, mtof(r), 0, len(seg0) / SR, ks=(1, 2, 3, 4), span_c=90)
        track, hs = yin_track(x, f_est)
        marks = pitch_marks(x, track, hs)
        periods = mark_periods(marks)
        # the pitch at each moment, from the marks themselves (so the shifted voice lands where it should), smoothed
        # over 0.6 s; sampled every 5 ms
        tt = np.arange(0, len(x), int(0.005 * SR))
        p_at = np.interp(tt, marks, periods)
        k = max(1, int(0.6 / 0.005))
        p_s = np.convolve(np.pad(p_at, (k // 2, k - k // 2 - 1), mode="edge"), np.ones(k) / k, mode="valid")
        _VOICE[r] = (x, marks, periods, SR / p_s, f_est)
    return _VOICE[r]


def build_choir():
    """a small choir on "ah": for each note, four takes of the one real singer (his four recordings nearest the
    note), each moved to the note by PSOLA (his vowel stays), a few cents apart and a few milliseconds apart, each
    looped on its own; high notes get the vowel's resonances lifted a little (towards a higher voice)"""
    vf = voice_files()
    # his two lowest takes (C2, C sharp 2) are too rough (a creaky voice) to follow cycle by cycle: left out
    reals = [r for r in sorted(vf) if r >= 38]
    notes = grid(0)
    L = 2.4
    P0lo, P0hi = 0.7, 1.0
    a = round(P0hi + LOOP_X + DEC_DELAY + 0.01, 2)
    z = round(a + L, 2)
    n_total = int(round((z + 0.06) * SR))
    DET = [-4.0, -1.0, 2.0, 5.0]                    # a few cents apart (their own wobble does the rest)
    DLY = [0.0, 0.009, 0.017, 0.026]
    LVL = [0.0, -2.0, -4.0, -6.0]                   # not all equally loud, so they do not beat to silence
    files = {}
    for n in notes:
        f = mtof(n)
        takes = sorted(reals, key=lambda r: (abs(r - n), r))[:4]
        phi = 1.0 + 0.2 * min(1.0, max(0.0, (n - 62) / 22.0))      # vowel resonances lifted up to 20% at C6 and up
        singers = []
        for i, r in enumerate(takes):
            x, marks, periods, f_s, f_est = voice_take(r)
            target = f * 2 ** (DET[i] / 1200) / phi
            def ratio_of_t(t, f_s=f_s, target=target):
                return target / f_s[min(len(f_s) - 1, int(t / 0.005))]
            n_need = int(round((P0hi + L + 0.15) * SR * phi)) + 64
            y = psola(x, marks, periods, ratio_of_t, min(len(x), n_need))
            if phi != 1.0:
                y = resample(y, phi)
            y = hp(y, max(20.0, 0.5 * f))
            y = trim_start(y)
            y = np.concatenate([np.zeros(int(DLY[i] * SR)), y])
            y *= 10 ** ((-22.0 + LVL[i] - kw_level(y)) / 20)
            singers.append((r, i, y))
        # a sung note starts with a breath: the four together start where the page will hear them start (3% of
        # their peak), less 0.8 ms, so every singer moves earlier by the same amount, before each is looped
        m = max(len(s[2]) for s in singers)
        pre = np.zeros(m)
        for r, i, y in singers:
            pre[:len(y)] += y
        cut = max(0, onset_of(pre) - int(0.0008 * SR))
        mix = np.zeros(n_total)
        used = []
        for r, i, y in singers:
            y = y[cut:]
            y, rho, p0 = periodize(y, P0lo, L, n_total, W=0.25, search=(P0lo, P0hi))
            mix += y
            used.append({"take": os.path.relpath(vf[r], SRC_ROOT), "sings": r, "detune_cents": DET[i],
                         "delay_ms": round(1000 * DLY[i]), "seam_match": round(rho, 3), "cycle_start": round(p0, 3)})
        mix[:int(0.0008 * SR)] *= np.sin(np.linspace(0, np.pi / 2, int(0.0008 * SR))) ** 2   # the singers' own
        mix[0] = 0.0                                                                           # soft start stays
        mix = page_prefade(mix, z)
        files[(n, "m")] = (mix, {"singers": used, "vowel_lift": round(phi, 3)})
    finish_set("choir", notes, ["m"], files, targets={"m": -22.0}, extra={"loop": [a, z]})
    REPORT["choir"]["pitch"] = "centroid"
    REPORT["choir"]["made_from"] = ("Karoryfer Hadzi-Fia 'a' vowel (one singer, from sfzinstruments/"
                                    "legato_vocal_tutorial): four takes per note, moved by PSOLA")


# ══════════════════════════════════════════════════════════════════════════
# AOG-PIANO-SYNTH-V1 (2026-10-04): strsynth, pad, brass and lead are real analog synthesizers now: piano_synth_sets.py
BUILDERS = ["epreed", "celesta", "steel", "clav", "organ", "gospel", "rockorgan",
            "theatre", "accordion", "choir", "musicbox", "toy"]
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
