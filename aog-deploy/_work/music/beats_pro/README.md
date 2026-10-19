# Elite beats (AOG-BEATS-ELITE-V1)

Jimmy, 2026-10-19: "Produce some of the dopest and BEST hitting drum beat out there … we are no where near the ceiling."

Each family writes one file here, `<family>.json`; `make_beats_pro.py` joins them into `aog-deploy/aog-beats-pro.js`
(window.AOGBeatsPro), which the Drum Machine (music-pads.html) and the Drum Kit (music-kit.html) add to their beat menus.
`node check_beats.js` checks every file. Run it until it says ALL PASS.

## A family file

    { "groups": { "eltrap": { "en": "Elite · Trap, drill and phonk", "es": "Élite · Trap, drill y phonk" } },
      "beats": [ { "id": "el_trap_ice", "grp": "eltrap",
                   "en": "Ice-cold trap", "es": "Trap helado",
                   "kit": "TR", "bpm": 140, "res": 8,
                   "about": { "en": "One plain sentence: what it is and what to listen for.", "es": "…" },
                   "map":   { "kick": [...], "snare": [...], "ch": [...], "oh": [...], "clap": [...], "tom": [...], "rim": [...], "bell": [...] },
                   "parts": [ { "map": { ... } }, { "map": { ... } }, { "map": { ... } } ] } ] }

- **Drums (8 pads):** kick, snare, ch (closed hat), oh (open hat), clap, tom, rim, bell (cowbell / ride bell / shaker:
  whatever the kit puts on that pad). Leave a drum out when it does not play.
- **Hits:** 0 nothing, 1 a hit, 2 an accent (hard), 3 a soft hit (a ghost note). Ghost notes and accents are what
  make a beat breathe: use them.
- **res — steps per beat (quarter note):** 4 = sixteenths (the default; 16 steps a bar), 3 = eighth-note triplets
  (12 a bar: shuffles, 12/8, swing), 6 = sixteenth triplets (24 a bar: trap and drill hat rolls, triplet fills),
  8 = thirty-second notes (32 a bar: hat rolls, blast beats, snare rolls). Every row in a beat has 4 × res steps.
- **swing** (0.5 straight … 0.75 hard): only with res 4; it delays every second sixteenth.
- **parts:** up to 3 more bars after `map` (so a beat is 1, 2 or 4 bars; 3 parts = 4 bars). Bar 4 is where the
  fill goes. Same res for every bar.
- **bpm** 50 … 200 (drum and bass at 170 is fine). Half-time feels are written at the real tempo.
- **kit:** one of the kit letters listed by `node check_beats.js --kits` (every pad a recording, so the Drum Machine can bring it; not L 909 or M reggae: for 808 and house sounds use TR trap, DS disco, RG reggaeton or JG jungle). Pick the one that fits.
- **Words:** name and one-sentence `about` in English and Spanish, plain everyday words (CLAUDE.md "Plain words").
  No artist, producer, drummer or song names anywhere a person reads. Everything original: never copy a famous
  song's beat note for note; write in the style.
- **ids:** `el_<family>_<word>`, unique.
