# AOG-GOSPEL-V1 (2026-10-26) — Jimmy: "Can you make gospel vocal samples for the studio".
# The Jubilee Voices record (40-jubilee-voices.mp3): the Fisk Jubilee Singers on records from 1909 to 1924, the opening of
# sixteen spirituals (the songs gospel grew from), one on each pad.
#
# Every record is a Library of Congress National Jukebox transfer, kept at archive.org (archive.org/details/<id>) and marked
# public domain there. Records made before 1926 are public domain in the United States (the Music Modernization Act), and
# the songs are traditional. Each pad is the record's first sung line: from the singers' first note to their first breath
# after 3.5 s (or, with no breath before 8 s, the quietest moment there). In the Great Gettin' Up Mornin' takes its second
# line (12.35 s), as a pop of the old disc sits in the first. Speech recognition cannot follow singing this old, so each
# pad is named by its song, not by the words sung; the opening line of a spiritual is almost always its title line.
#
# Cleaned gently, so the voices stay as they were: the rumble under 80 Hz and the hiss over 7.5 kHz taken off, the clicks
# of the old disc smoothed (adeclick, then declick() for the few it leaves), the steady surface noise lowered by 10 dB
# (afftdn). Each pad set to the same loudness, and checked for any pop left (a peak over 8 times the sound around it).
#
# Run:  python3 make_jubilee.py <folder with the records, named <id>.mp3>
# Out:  ../../audio/crate/40-jubilee-voices.mp3 and jubilee-voices.json (its crate entry; add_to_crate.py puts it in crate.json)
import os, sys, json, subprocess, numpy as np
from scipy import signal
HERE = os.path.dirname(os.path.abspath(__file__)); SR = 44100
SRC = sys.argv[1]; OUT = os.path.join(HERE, "..", "..", "audio", "crate")

SONGS = [   # archive.org id, start s, end s (the opening line, found at the singers' breaths), song, year
    ("loc-jukebox-128141-swing-low-sweet-chariot",            1.79,  7.29, "Swing Low, Sweet Chariot", 1909),
    ("loc-jukebox-128182-roll-jordan-roll",                   0.74,  8.12, "Roll, Jordan, Roll", 1909),
    ("loc-jukebox-128180-little-david-play-on-yo-harp",       2.25,  6.66, "Little David, Play on Your Harp", 1909),
    ("loc-jukebox-128142-i-couldn-t-hear-nobody-pray",        0.98,  7.09, "I Couldn't Hear Nobody Pray", 1909),
    ("loc-jukebox-128181-there-is-a-balm-in-gilead",          0.25,  5.59, "There Is a Balm in Gilead", 1909),
    ("loc-jukebox-653180-good-news-the-chariot-s-coming",     3.96, 10.05, "Good News, the Chariot's Coming", 1916),
    ("loc-jukebox-653173-the-great-camp-meeting",             3.12,  8.57, "The Great Camp Meeting", 1916),
    ("loc-jukebox-653176-brethren-rise",                      4.08, 10.36, "Brethren, Rise", 1916),
    ("loc-jukebox-652464-in-the-great-gettin-up-mawnin",     12.35, 17.25, "In the Great Gettin' Up Mornin'", 1916),
    ("loc-jukebox-665138-i-want-to-be-ready",                 3.17,  8.56, "I Want to Be Ready", 1920),
    ("loc-jukebox-665185-were-you-there",                     3.27,  8.53, "Were You There?", 1920),
    ("loc-jukebox-665209-i-ain-t-goin-to-study-war-no-more",  3.23,  7.03, "I Ain't Goin' to Study War No More", 1920),
    ("loc-jukebox-665212-i-done-done-what-you-told-me-to-do", 3.48, 10.28, "I Done Done What You Told Me to Do", 1920),
    ("loc-jukebox-665188-you-hear-the-lambs-a-cryin",         3.84,  9.00, "You Hear the Lambs a-Cryin'", 1920),
    ("loc-jukebox-665131-i-know-i-have-another-building",     3.10, 10.86, "I Know I Have Another Building", 1920),
    ("loc-jukebox-673481-hope-i-ll-join-the-band",            2.11,  8.11, "Hope I'll Join the Band", 1924),
]
# the name on the pad: short, so it fits a phone's pad (the whole title is the Turntables' cue label)
SHORT = {"Swing Low, Sweet Chariot": "Swing Low", "Roll, Jordan, Roll": "Roll, Jordan, Roll", "Little David, Play on Your Harp": "Little David", "I Couldn't Hear Nobody Pray": "Hear Nobody Pray", "There Is a Balm in Gilead": "Balm in Gilead", "Good News, the Chariot's Coming": "Good News", "The Great Camp Meeting": "Camp Meeting", "Brethren, Rise": "Brethren, Rise", "In the Great Gettin' Up Mornin'": "Gettin' Up Mornin'", "I Want to Be Ready": "Want to Be Ready", "Were You There?": "Were You There?", "Study War No More": "Study War No More", "I Done Done What You Told Me to Do": "I Done Done", "You Hear the Lambs a-Cryin'": "Lambs a-Cryin'", "I Know I Have Another Building": "Another Building", "Hope I'll Join the Band": "Join the Band", "I Ain't Goin' to Study War No More": "Study War No More"}
CLEAN = "highpass=f=80:poles=2,adeclick=w=55:o=75,afftdn=nr=10:nf=-38:tn=1,lowpass=f=7500:poles=2"

def cut(path, a, b):
    """the line with a little air either side, cleaned, mono"""
    pre, post = 0.06, 0.18
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-af", CLEAN, "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout          # the whole record cleaned, so the noise is learned from all of it
    x = np.frombuffer(pcm, dtype=np.float32).astype(np.float64)
    y = x[int(max(0, a - pre) * SR):int((b + post) * SR)].copy()
    fi = int(0.03 * SR); fo = int(0.16 * SR)
    y[:fi] *= np.linspace(0, 1, fi) ** 2; y[-fo:] *= np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
    return y

def declick(y):
    """the clicks adeclick leaves (a spike a few samples wide, far over the sound around it): each bridged by a straight
    line over 1.5 ms either side, which the ear cannot hear in a voice"""
    w = int(0.4 * SR); env = np.sqrt(np.convolve(y * y, np.ones(w) / w, "same")) + 1e-6
    d = np.abs(np.diff(y, prepend=y[0])); dm = np.convolve(d, np.ones(441) / 441, "same") + 1e-6
    hits = np.where((np.abs(y) > 5 * env) & (d > 8 * dm))[0]; r = int(0.0015 * SR); fixed = 0; last = -10 * r
    for i in hits:
        if i - last < 2 * r or i - r < 1 or i + r >= len(y) - 1: continue
        y[i - r:i + r + 1] = np.linspace(y[i - r - 1], y[i + r + 1], 2 * r + 1); last = i; fixed += 1
    return y, fixed

def kweight(y):
    def rbj(kind, f, q, db):
        A = 10 ** (db / 40); w = 2 * np.pi * f / SR; al = np.sin(w) / (2 * q); c = np.cos(w)
        if kind == "hp": b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]; a = [1 + al, -2 * c, 1 - al]
        else:
            sq = 2 * np.sqrt(A) * al
            b = [A * ((A + 1) + (A - 1) * c + sq), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - sq)]
            a = [(A + 1) - (A - 1) * c + sq, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - sq]
        return np.array(b) / a[0], np.array(a) / a[0]
    for k in (("hp", 60, 0.5, 0), ("shelf", 1500, 0.707, 4)): b, a = rbj(*k); y = signal.lfilter(b, a, y)
    n = int(0.4 * SR); q = np.concatenate([[0.0], np.cumsum(y * y)])
    return 10 * np.log10(np.max(q[n:] - q[:-n]) / n + 1e-12)

TARGET = -17.0; GAP = 0.45
out = [np.zeros(int(0.35 * SR))]; t = 0.35; phrases = []
for sid, a, b, name, year in SONGS:
    y, fixed = declick(cut(os.path.join(SRC, sid + ".mp3"), a, b))
    y *= 10 ** ((TARGET - kweight(y)) / 20)
    # a pop left by the old disc: a peak far over the sound around it (checked here, so a bad cut is never kept)
    w = int(0.4 * SR); env = np.sqrt(np.convolve(y * y, np.ones(w) / w, "same")) + 1e-6
    crest = float(np.max(np.abs(y) / env))
    if crest > 8: raise SystemExit("%s: a pop (a peak %.1f times the sound around it)" % (name, crest))
    pk = np.max(np.abs(y))
    if pk > 0.89: y *= 0.89 / pk
    print("%-36s %.2f s  peak %.2f  %.1f dB  crest %.1f  clicks mended %d" % (name, len(y) / SR, np.max(np.abs(y)), kweight(y), crest, fixed), flush=True)
    phrases.append([round(t, 3), round(len(y) / SR, 3), SHORT[name], "%s (%d)" % (name, year), sid])
    out.append(y); t += len(y) / SR
    out.append(np.zeros(int(GAP * SR))); t += GAP
rec = np.concatenate(out)
fn = "40-jubilee-voices.mp3"; path = os.path.join(OUT, fn)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "80k",
                "-id3v2_version", "3", "-metadata", "title=Jubilee Voices", "-metadata", "artist=Fisk Jubilee Singers",
                "-metadata", "comment=Records from 1909 to 1924, Library of Congress National Jukebox, public domain.", path],
               input=rec.astype(np.float32).tobytes(), check=True)
CUE = [0, 1, 2, 5, 7, 9, 10, 15]       # the Turntables' eight pads
entry = {"file": fn, "title": "Jubilee Voices", "title_es": "Voces del jubileo (en inglés)", "bpm": 0, "kind": "gospel",
         "version": "1909–1924", "style": "Spirituals, the roots of gospel", "style_es": "Espirituales, las raíces del góspel", "bars": 0,
         "seconds": round(len(rec) / SR, 1), "bytes": os.path.getsize(path),
         "line": "The Fisk Jubilee Singers on records from 1909 to 1924. A line from a spiritual on each pad.",
         "line_es": "Los Fisk Jubilee Singers en discos de 1909 a 1924. Una línea de un espiritual en cada pad.",
         "verses": [{"ref": phrases[i][3], "ref_es": phrases[i][3], "at": phrases[i][0], "text": phrases[i][2]} for i in CUE],
         "phrases": [p[:4] for p in phrases]}
json.dump(entry, open(os.path.join(HERE, "jubilee-voices.json"), "w"), indent=1, ensure_ascii=False)
print(fn, entry["seconds"], "s", entry["bytes"], "bytes")
