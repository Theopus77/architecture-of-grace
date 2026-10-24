# AOG-BAND-HIFI-V1 (2026-10-23) — what every Band builder shares: the rate it works at, how it reads a recording (one
# microphone or both), and how it writes a file. Jimmy wants the Studio pro-grade everywhere; the Band's files had been made
# at 32 kHz (64 kbps mono for the newer players, 96-112 kbps stereo for VS Chamber Orchestra), so their treble stopped at
# 13.5-15 kHz, under the Piano and the Guitar (44.1 kHz, 128 kbps).
#
#   AOG_BAND_SR=44100     the builders work at this rate (default 32000, as they were written)
#   AOG_BAND_STEREO=1     a builder that used one microphone of a stereo pair (sax2, folk, classroom, world) keeps both,
#                         left and right as recorded; every level, onset and tuning is still measured on the left one, so
#                         the cut and the gain are exactly what they were (M below)
#   AOG_BAND_RAW=1        beside each MP3 a builder writes, the same samples as 32-bit float WAV (<name>.wav): hifi.py
#                         encodes from those once, so no file is encoded twice
#   AOG_BAND_KBPS=128     every MP3 at this rate (default: the rate the builder asks for)
# hifi.py sets all four; run without them, every builder makes exactly what it made before.
import os, subprocess, numpy as np
SR = int(os.environ.get("AOG_BAND_SR", "32000"))
STEREO = os.environ.get("AOG_BAND_STEREO") == "1"
RAW = os.environ.get("AOG_BAND_RAW") == "1"
KBPS = int(os.environ.get("AOG_BAND_KBPS", "0") or 0)


def load(path, ch=0, sr=None, stereo=None):
    """a recording at the builder's rate: one channel (ch 0 left, 1 right, None the two averaged) or, with stereo (or
    AOG_BAND_STEREO when stereo is None and ch is 0), both channels as an (n, 2) array (a one-channel file gives one)"""
    sr = sr or SR
    st = STEREO if stereo is None else stereo
    if st and ch == 0:
        n = int(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=channels", "-of", "csv=p=0", path],
                               capture_output=True, text=True, check=True).stdout.strip() or 1)
        if n >= 2:
            pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-af", "pan=stereo|c0=c0|c1=c1", "-ar", str(sr), "-f", "f32le", "-"],
                                 capture_output=True, check=True).stdout
            return np.frombuffer(pcm, dtype=np.float32).astype(np.float64).reshape(-1, 2)
    af = ["-af", "pan=mono|c0=c%d" % ch] if ch is not None else ["-ac", "1"]
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path] + af + ["-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).astype(np.float64)


def M(x):
    """what is measured: the left microphone of a stereo note (the one the builders always measured), or the note itself"""
    return x if x.ndim == 1 else x[:, 0]


def ramp(x, a, b, shape):
    """multiply x[a:b] by shape (one value per sample), on every channel"""
    if x.ndim == 1: x[a:b] *= shape
    else: x[a:b] *= shape[:, None]
    return x


def fades(x, fo, fi):
    """the builders' end and start: the last fo samples fade out (squared), the first fi fade in (straight)"""
    fo = min(fo, len(x) // 3)
    if fo > 0: ramp(x, len(x) - fo, len(x), np.linspace(1, 0, fo) ** 2)
    if fi > 0: ramp(x, 0, fi, np.linspace(0, 1, fi))
    return x


def mp3(x, dst, kbps, sr=None):
    """write x (one channel, or (n, 2)) as an MP3 at kbps (or AOG_BAND_KBPS), and with AOG_BAND_RAW its float WAV beside it"""
    sr = sr or SR
    ch = 1 if x.ndim == 1 else x.shape[1]
    data = np.ascontiguousarray(x, dtype=np.float32).tobytes()
    if RAW:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", str(ch), "-i", "-", "-c:a", "pcm_f32le", dst[:-4] + ".wav"],
                       input=data, check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", str(ch), "-i", "-", "-codec:a", "libmp3lame",
                    "-b:a", "%dk" % (KBPS or kbps), dst], input=data, check=True)
