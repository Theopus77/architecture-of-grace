"""Where every recording comes from (AOG-DRUM-REAL-V2), and how one is read.

A source is "<lib>:<path inside that library's repository>", e.g. "virt:Samples/oh/snare/oh_snare_center_vl24.flac".
A file is looked for in the local clones first (LOCAL, set AOG_DRUM_SRC_<LIB> to move one), then in the cache
(AOG_DRUM_CACHE), and fetched once from raw.githubusercontent.com when it is in neither. Every library here was given
to everyone under CC0 1.0 Universal (public domain); the LICENSE file of each was read in the clone:

  brd    Big Rusty Drums, Karoryfer Samples                     (kits P to T, and J)
  virt   Virtuosity Drums, Versilian Studios + Karoryfer        (a Boston drum shop's club kit: Austin McMahon)
  swirly Swirly Drums, Karoryfer Samples                        (a brush kit)
  gogo   Gogodze Phu Vol II, Karoryfer Samples                  (a kit tuned like a 1973 record)
  vcsl   Versilian Community Sample Library, Versilian Studios  (hand percussion, claps, marching drums, bells)
  vsco   VS Chamber Orchestra 2: Community Edition, Versilian   (the double bass, the upright piano)
  gm     Discord SFZ GM Bank: jRhodes GM by Jeff Learman (CC0)  (a 1977 Rhodes Mark I)
  voice  legato_vocal_tutorial: the "a" of Hadzi-Fia, Karoryfer (one singer)

AOG-DRUM-909-V1 (2026-10-05): one more kind of source, not CC0 but CC BY 4.0 (credit given):
  fs     a sound on Freesound, "fs:<user>/<sound id>_<user id>": Freesound's high-quality MP3 copy of it (the original
         WAV needs a login), from cdn.freesound.org. Used for kit L: "TR-909 JGB pack" (pack 1643), sampled by Janne
         G:son Berg from his own Roland TR-909 and posted by altemark under Creative Commons Attribution 4.0
         (https://creativecommons.org/licenses/by/4.0/). Its sound pages say: "Sampled by Janne G:son Berg from his old
         909. Cut up and organized by me. Here his the original readme.txt Janne distributed with the wav: Sampled in
         one session from my (now sold) 909. 24 bit, 44.1 kHz. Feel free to use the samples for whatever you like."
"""
import os, subprocess, urllib.request, urllib.parse
import numpy as np

SR = 44100
SCR = "/tmp/claude-0/-home-user-architecture-of-grace/007b86b8-89fa-5b41-87cd-28069b45d25f/scratchpad"
REPO = {   # GitHub repository and branch, for files not on this machine
    "brd": ("sfzinstruments/karoryfer.big-rusty-drums", "main"),
    "virt": ("sfzinstruments/virtuosity_drums", "master"),
    "swirly": ("sfzinstruments/karoryfer.swirly-drums", "main"),
    "gogo": ("sfzinstruments/karoryfer.gogodze-phu-vol-ii", "master"),
    "vcsl": ("sgossner/VCSL", "master"),
    "vsco": ("sgossner/VSCO-2-CE", "master"),
    "gm": ("sfzinstruments/Discord-SFZ-GM-Bank", "master"),
    "voice": ("sfzinstruments/legato_vocal_tutorial", "master"),
}
LOCAL = {   # clones already on this machine (sparse: only some folders)
    "brd": SCR + "/agent-drumkit/src/karoryfer.big-rusty-drums",
    "virt": SCR + "/sources/virtuosity_drums",
    "swirly": SCR + "/sources/karoryfer.swirly-drums",
    "gogo": SCR + "/sources/karoryfer.gogodze-phu-vol-ii",
    "vcsl": "/home/user/sgossner/VCSL",
    "vsco": "/home/user/sgossner/vsco-2-ce",
    "gm": SCR + "/sources/Discord-SFZ-GM-Bank",
    "voice": SCR + "/sources/legato_vocal_tutorial",
}
for k in list(LOCAL):
    LOCAL[k] = os.environ.get("AOG_DRUM_SRC_" + k.upper(), LOCAL[k])
CACHE = os.environ.get("AOG_DRUM_CACHE", SCR + "/drumsreal/cache")


def path_of(src):
    """the local file for a source, fetched into the cache the first time"""
    lib, rel = src.split(":", 1)
    if lib == "fs":
        sid, uid = rel.split("/")[1].split("_")
        c = os.path.join(CACHE, "fs", rel + ".mp3")
        if not (os.path.isfile(c) and os.path.getsize(c) > 200):
            os.makedirs(os.path.dirname(c), exist_ok=True)
            url = "https://cdn.freesound.org/previews/%d/%s_%s-hq.mp3" % (int(sid) // 1000, sid, uid)
            subprocess.run(["curl", "-sSLf", "--retry", "4", "-o", c + ".part", url], check=True)
            os.replace(c + ".part", c)
        return c
    p = os.path.join(LOCAL[lib], rel)
    if os.path.isfile(p) and os.path.getsize(p) > 200:
        return p
    c = os.path.join(CACHE, lib, rel)
    if os.path.isfile(c) and os.path.getsize(c) > 200:
        return c
    repo, br = REPO[lib]
    url = "https://raw.githubusercontent.com/%s/%s/%s" % (repo, br, urllib.parse.quote(rel))
    os.makedirs(os.path.dirname(c), exist_ok=True)
    tmp = c + ".part"
    with urllib.request.urlopen(url, timeout=120) as r, open(tmp, "wb") as f:
        f.write(r.read())
    os.replace(tmp, c)
    return c


_cache = {}
def load(src):
    """a source as mono float64 at 44.1 kHz (stereo pairs are averaged; 48 kHz files resampled with soxr). Used only
    for the pads whose microphones are mono or nearly identical on both sides (see build.py, AOG-DRUM-STEREO-V1)"""
    if src in _cache:
        return _cache[src]
    p = path_of(src)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-af", "aresample=resampler=soxr:precision=28",
                          "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    _cache[src] = a
    return a


_cache2 = {}
def load2(src):
    """AOG-DRUM-STEREO-V1: a source in two channels, float64 (n, 2) at 44.1 kHz: a stereo pair as recorded (left and
    right never added together), a mono microphone as two equal sides (it sits in the middle)"""
    if src in _cache2:
        return _cache2[src]
    p = path_of(src)
    ch = int(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=channels", "-of", "csv=p=0", p],
                            capture_output=True, text=True, check=True).stdout.strip().split("\n")[0].split(",")[0])
    if ch == 1:
        a = load(src)
        a = np.stack([a, a], axis=1)
    else:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-af", "aresample=resampler=soxr:precision=28",
                              "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
        a = np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, 2)
    _cache2[src] = a
    return a


def channels(src):
    p = path_of(src)
    return int(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=channels", "-of", "csv=p=0", p],
                              capture_output=True, text=True, check=True).stdout.strip().split("\n")[0].split(",")[0])


def exists(src):
    try:
        path_of(src)
        return True
    except Exception:
        return False


# ---------- names inside each library ----------
def brd(piece_tpl, vl, rr, mic):
    """Big Rusty: e.g. brd('snare_14/center/{mic}/sn_center_vl{vl}_rr{rr}.flac', 8, 1, 'btm')"""
    return "brd:Samples/" + piece_tpl.format(mic=mic, vl=vl, rr=rr)

def virt(art, vl, mic, rr=None, ext="flac"):
    """Virtuosity: art like 'snare_center', 'kick_snon', 'hh_closed', 'ride_bell', 'htom_center';
    mic 'oh', 'room', 'mid', 'lofi', 'kickmic' or 'snaremic'"""
    folder = art.split("_")[0]
    name = "%s_%s_vl%d%s.%s" % (mic, art, vl, ("_rr%d" % rr) if rr else "", ext)
    return "virt:Samples/%s/%s/%s" % (mic, folder, name)

def gogo(art, vl, rr, mic):
    """Gogodze Phu Vol II: art 'ks' kick, 'sc' snare centre, 'se' edge, 'ss' side, 'th'/'tm'/'tl' toms,
    'hc' closed, 'ht' tight, 'hl' loose, 'hh' half, 'ho' open, 'hf' foot; mic 'kick', 'snare', 'side', 'front',
    'oh', 'wndw' or 'retro'"""
    return "gogo:Samples/%s_mic/%s_vl%d_rr%d.wav" % (mic, art, vl, rr)
