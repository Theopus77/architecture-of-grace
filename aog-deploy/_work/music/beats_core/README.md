# Perfecting the drum beats (AOG-BEATS-PERFECT-V1)

Jimmy, 2026-10-19: "I don't necessary need NEW or MORE beats, just the drum beats edited and more perfected."

The Drum Machine's and the Drum Kit's 95 beats (87 in ten groups and the 8 famous styles) live here, one file per family:
rockpop (rock, pop, metal), funkhiphop (funk, hip-hop), jazzworld (jazz, world), latincarib (latin, carib), electronic
(electronic, and the 8 `styles`). `python3 make_beats_core.py` makes `aog-deploy/aog-beats.js`; `node check_core.js` checks
them against `_original.json` (never edit `_original.json` or `_base.json`; the 10 "First beats" in `_base.json` stay as they are).

## What to keep
- The same beats: same `id`, `grp`, `en` and `es` names (saved songs and lessons find them by these). The style named must
  still be what you hear.
- Rock, funk, jazz and latin beats (and the styles `funk` and `latin`, and `militarymarch`) stay on 16 sixteenths a bar
  (res 4): the Drum Kit's play-along lessons time the player against them.

## What to make better
- **The right sound on the right pad.** The eight pads are different sounds on every kit: `node check_core.js --pads`
  lists them (on kit I `rim` is the RIDE and `bell` the CRASH; on D `rim` is a wood BLOCK; on DS `rim` is a COWBELL; on TR
  `bell` is an 808 BOOM). Many old beats were written as if `bell` were always a cowbell or `rim` a cross-stick. Put each
  part on the pad that really makes that sound on the beat's kit, or choose the kit whose pads fit.
- **A kit the Drum Machine can bring** (every pad a recording; `--pads` lists them; not A, C, F, L, M). Pick the one
  that makes this style hit hardest.
- **Feel:** accents (2) on the strong hits, ghost notes (3) where a real player leaves them, hats that breathe
  (loud-soft), kick and snare that lock. Real tempo (60 … 180).
- **Phrasing:** 2 or 4 bars (`parts`, up to 3) where the style moves over a phrase; bar 4 a fill or change that lifts
  back into bar 1; a crash on the 1 after a fill where the kit has one. A beat that is perfect as one bar may stay one bar.
- **Grid** (`res`): 4 sixteenths; 3 eighth-note triplets (shuffles, 12/8); 6 sixteenth triplets (trap and drill rolls);
  8 thirty-second notes (rolls, blasts). Every row has 4 × res steps. Swing (0.5–0.75) only on res 4: it delays the in-between sixteenths; add `"swing8": true` to swing the eighth notes instead (a jazz ride, a shuffle). `len` (a short bar,
  e.g. 12 for a bar of 3) only on res 4, no hits past it.
- **Words:** a better one-sentence `about` in English and Spanish when the beat changed: plain everyday words, what it is
  and what to listen for. No artist, drummer, band or song names. Original patterns in the style, never a famous record's
  beat copied note for note.

Hits: 0 nothing, 1 a hit, 2 an accent, 3 a soft hit. Drums: kick, snare, ch, oh, clap, tom, rim, bell.
