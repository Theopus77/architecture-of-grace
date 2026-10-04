# HANDOFF: the music bench (written 2026-10-04)

The site owner is Jimmy, a special-education teacher. The site is static and lives in `aog-deploy/`; Netlify publishes that folder. **Read `CLAUDE.md` at the repo root first.** Its standing orders apply to every page you touch:
- readable text, checked by `tools/check-contrast.js`;
- calm pages for neurodivergent learners, checked by `tools/check-calm.js`: iPhone first, no endless motion, nothing plays on its own;
- plain words in English **and** Spanish;
- drop-downs, not walls of tabs;
- bump `sw.js` CACHE on every deploy.

This file is for a NEW session taking over the music work. Everything below can be checked in the repo.

> **Before you merge anything:** the session that wrote this file may still be merging the helper branches itself. Run `git fetch origin && git log --oneline -8 origin/claude/drum-pads-touch-keys`. If the newest commits already merge the `claude/amp-*` branches, start from there.

---

## 1. Where things stand

| What | Where | State |
|---|---|---|
| Live site | `main` | Everything up to PR **#265**: the amp, pedals, cabinets and EQ; 22 guitar and 13 bass sounds; the metal distortion fix (on top of #264's saxophone, pads 1–6 and the piano's 16 ways). |
| The amp and pedals | live since #265 (`aog-amp.js`, `aog-amp-worklet.js`) | Deployed 2026-10-04. |
| Nine helper branches | `origin/claude/amp-*` | Each helper agent pushes its branch when it finishes. See §4. |

The working branch for music is `claude/drum-pads-touch-keys`. After every deploy it is reset to `origin/main`, keeping the same name.

## 2. Jimmy's open requests, in his words

1. "May the guitar and bass get a Amplifier … the worlds best that has guitar pedals … attached … part of the two engines" → **built** (§3).
2. "There is NO distortion for the METAL guitar chords" → **fixed** in the amp. The distortion now runs on the audio thread, not in the browser's WaveShaper; a held chord keeps its level for 2 s. Not yet heard on Jimmy's iPad.
3. "I want more ways to play chords on the guitar as well as bass … metal style sounds (like Pantera / lamb of god)" → the **ways** branch; the metal sounds are built.
4. "Can all instruments have MULTIPLE VERSIONS OF HOW THEY SOUND? … a lot more" → guitar 22 and bass 13 (built). Piano, Band and drum kits are on helper branches.
5. "send the sounds from the instruments to the drum machine as samples. Not just for the pads" → the **drums** branch.
6. Jimmy's uploaded handoff "fix the guitar and the bass" → the **stringfix** branch (string engine, the six sounds, synth bass) and the **ways** branch (bass lines that leave the root, strum gaps 15–40 ms, picking order).
   - **Note:** that handoff's "Do not add a pedalboard / cabinet / new amp / new sounds" lines were written *before* Jimmy asked for the amp and pedals. The amp stays. Everything else in that handoff is being followed.
7. "Think about Led Zeppelin, Aerosmith, AC/DC, Black Sabbath, Opeth, when making the sounds" → the **tones** branch for guitar and bass; the **drumkit** branch for drum voicings. On screen, sounds are named by genre, never by band.
8. "I would love an authentic Drum kit" → the **drumkit** branch: recorded acoustic kits, CC0 or CC-BY.
9. "Could a state of the art Recording studio be built?" → the **studio** branch: a new page `music-studio.html`, route `/studio`.
10. Record already exists on every music tool (piano, guitar, bass, band, drum machine): `aog-recorder.js`, deployed in #263.
11. "Can one of the agents make the ORCHESTRA tab, where everyone plays!" (The Band, on his iPad) → the **band** branch: "Orchestra · everyone plays", in its own group in the Instrument drop-down, orchestrated by section and leveled like the rest.
12. "We need a string and percussion section!" → the **band** branch: strings (violins, violas, cellos, contrabass, harp) and a percussion section from VSCO 2 CE (timpani, mallets, concert snare, bass drum, cymbal, triangle, tambourine…). The unpitched instruments play the beat of the chosen way to play. Both join the Orchestra.
13. "Les Claypool, Buckethead, Van Halen, Flea … Stevie Ray Vaughan, Jimi Hendrix, the list can go on and on" → the **tones** branch: more sounds, plus new pedals (Uni-Vibe, octave-up fuzz, pitch-shift whammy, rotating speaker, a bass envelope filter).
14. "In guitar there should be a solo mode as well! BLOW my mind" → the **solo** branch. Solo mode on the neck:
    - the scale lit for the key, the blue note marked;
    - bends, vibrato, hammer-ons, two-hand tapping, a pinch-harmonic squeal, a whammy bar, a killswitch, and feedback bloom on high gain;
    - a backing band (rhythm guitar on its own rig, a bass line, the user's drum beat or a built-in one);
    - licks to copy, with each note lit;
    - a lead-sound picker;
    - slap and pop on the bass. Most of it lives in `aog-solo.js`.
15. "yes I want how it is played increase and start a chord pattern increased!!!!" (the guitar page) → the **ways** branch: more ways to play, and chord patterns 18 → 44 in five groups (Pop, rock and folk · Rock and metal · Soul, funk and dance · Blues and jazz · Minor and moody). The 18 old ids are unchanged. **At merge, copy the same PRESETS and PRESET_GROUPS into `music-piano.html` and `_work/music/band_script.js`**, so all four tools offer the same patterns. Leave the piano lessons alone: they use the old ids.

## 3. The amp (AOG-AMP-V1): live since #265

The files:
- `aog-deploy/aog-amp-worklet.js`: the AudioWorklet that bends the wave, four times oversampled (a 64-tap Kaiser FIR, 90 dB clean round trip). In order: pickup resonance → gate, compressor, wah, octave → overdrive, distortion, fuzz → 1–4 preamp stages → the real treble–middle–bass tone stack (solved from the circuit, checked against Yeh & Smith) or bass shelves → a power amp with sag → presence and depth. In Node it exports `AmpCore` (the tests use it).
- `aog-deploy/aog-amp.js`:
  - `MODELS`: 7 guitar amps and 4 bass amps, each with `make(knobs)`, a cabinet, and `out`/`lvl` loudness calibrations;
  - `CABS`: 8 minimum-phase impulses made from speaker curves;
  - `PEDALS`: 13 pedals;
  - `coreParams(state)`, which turns knobs into worklet numbers;
  - `create(ctx,{kind})`: the rig, with the cabinet, 10-band EQ, chorus, phaser, flanger, tremolo, delay and reverb as Web Audio nodes, and a WaveShaper fallback for a browser without AudioWorklet;
  - `ui(host, opts)`: the panel (amp head, two rows of pedals, ten upright EQ faders, Put this sound back).
- The worklet loads from `/aog-amp-worklet.js`. Before any offline render, `await AOGAmp.load(offlineCtx)`.

On the pages:
- The guitar and bass pages are generated: edit `aog-deploy/_work/music/strings_page.html`, then run `python3 make_strings.py` in that folder.
- Every sound plays voices → `ch.amp` → rig → `ch.post` (gain `SOUNDS[id].out`) → bus and room.
- `SOUNDS[id].rig` is the sound's preset. A user's changes are kept per sound in `localStorage["aog.<guitar|bass>.amp.v1"]`.

Measured:
- every C chord is within 0.5 dB of the grand piano's −8.62 dB;
- the high-gain amps hold a chord within about 1 dB for 2 s;
- the amp costs about 5–8% of one CPU core.

## 4. The helper branches (merge these)

There are nine. Each was cut from `470e18a2` (main) or `63d8440a` (the amp), worked in its own worktree, and pushes to `origin/claude/amp-<name>`:

| Branch | Job | Files it changes |
|---|---|---|
| `claude/amp-piano` | 16+ new piano sounds (some from VSCO 2 CE recordings: harp, marimba…) | `music-piano.html`, `audio/piano/*`, `_headers` |
| `claude/amp-band` | The Band: strings and percussion sections, muted and vibrato brass, ensembles, and **Orchestra · everyone plays** | `_work/music/band_*`, `music-band.html`, `audio/band/*`, `_headers`, maybe `science-hub.html` |
| `claude/amp-drums` | Send a recorded take to a drum pad | `aog-recorder.js`, `music-drums.html` |
| `claude/amp-ways` | ~18–20 guitar and 16+ bass ways to play; bass lines leave the root; strum gaps; **44 chord patterns** (copy them to the piano and band at merge) | `strings_page.html` (rhythm parts only) and the 2 generated pages |
| `claude/amp-stringfix` | Jimmy's handoff: a 44.1 kHz string, pick burst, pitch, sounds that disagree, synth bass | `strings_page.html` (engine, voices, existing SOUNDS values, neck drawing) |
| `claude/amp-tones` | Zeppelin, Aerosmith, AC/DC, Sabbath and Opeth-style guitar and bass sounds; new amp models and pedals | `aog-amp.js`, `aog-amp-worklet.js`, new SOUNDS entries appended after `doom` and `acid` |
| `claude/amp-drumkit` | Recorded acoustic drum kits and voicings | `aog-drumkit.js` (new), `music-drums.html` (tagged AOG-DRUM-REAL-V1), `audio/drums/*`, `_headers` |
| `claude/amp-solo` | Solo mode on the guitar (and slap and pop on the bass) | `aog-solo.js` (new), small AOG-SOLO-V1 hooks in `strings_page.html` |
| `claude/amp-studio` | The Studio: 8 tracks, mixer, sends, master, bounce, `studiobench` shelf | `music-studio.html` (new), `_redirects` |

How to merge:
1. `git fetch origin`
2. Merge each branch into the working branch. Use `git log origin/claude/amp-X` to see whether it has landed. A branch that is missing may still be running in the old session; check with Jimmy.
3. Conflicts you should expect:
   - **The generated pages** (`music-guitar.html`, `music-bass.html`, `music-band.html`): take either side, then regenerate from the merged sources with `make_strings.py` or `make_band.py`.
   - **`strings_page.html`**: ways, stringfix and tones were told to keep to separate regions. Read each hunk.
   - **`_headers`** (piano, band, drumkit): keep every new folder's lines.
   - **`music-drums.html`** (drums and drumkit): keep both.
   - **`science-hub.html`**: the guitar and bass card text changed in the amp commit; the band card may change on the band branch.
4. **Wire the studio.** The studio agent's final message lists the exact edits. Do them by hand:
   - `aog-topbar.js`: the Lab Bench `items` list in `EX`, plus the colour map near `"/band":"#8A6A16"`;
   - each music page's `navHtml()` tools list: `strings_page.html`, `music-piano.html`, the `_work/music/band_*` sources, `music-drums.html`, `music-decks.html`;
   - the science hub cards;
   - `aog-room-map.js`;
   - the home page's Lab Bench card;
   - the turntables' `studiobench` row.

## 5. The music bench, how it fits together

| Tool | File(s) | Notes |
|---|---|---|
| Drum machine | `music-drums.html` | SP-1200 model. Kits A–I are made on the page. Memory: 10 s for user samples, 26,040 Hz, 12-bit. Chord pads and kit undo. |
| Turntables | `music-decks.html` | Reads the shelves. |
| Piano | `music-piano.html` | Hand-written, except LESSONS (`_work/music/make_piano_lessons.py`). Lessons: `piano-lessons.html`, `mastering-piano.html` (`make_mastering_piano.py`). |
| Guitar and bass | `_work/music/strings_page.html` → `make_strings.py` | One source, `GTR` true or false. |
| The Band | `_work/music/band_head.html` + `band_script.js` → `make_band.py` | VSCO 2 CE recordings plus Weresax (CC0). |

Shared files:
- `aog-recorder.js`: ● Record. Only the tool's own sound, never a microphone; 3 takes.
- `aog-handoff.js`: the IndexedDB shelves:
  - `drumbench`: the drum machine's bounce;
  - `keysbench`: the piano;
  - `guitarbench` and `bassbench`;
  - `bandbench`;
  - `drumtake`: a take from the drum machine's recorder;
  - `chordpads`;
  - planned: `drumsample` and `studiobench`.
- `aog-amp*.js`.
- Site wiring:
  - `aog-topbar.js`;
  - `aog-room-map.js`;
  - `_redirects`;
  - `_headers`;
  - `index.html`;
  - `science-hub.html` (five units list the music tools);
  - `_work/course/dash_catalog.py` (dashboard).

**The loudness standard.** A C major chord (C4, E4 and G4 at 0.74, plus C3 at 0.74×0.85), rendered offline through the page's own chain *before the compressor*, K-weighted, loudest 400 ms (`window.__kw`, in `tests/bandt/measure.inc`), comes out at **−8.62 dB**, the grand piano's level. Every sound on every tool is set within ±0.5 dB of it.

The samples come from:
- the VSCO 2 CE clone at `/home/user/sgossner/vsco-2-ce`;
- `/home/user/sfzinstruments/*` (Salamander grand, Weresax).

On a new container, re-clone them only if you need new recordings. Every source is credited in `audio/*/CREDITS.txt`.

## 6. Tests

`music-handoff/tests/` holds every suite, copied from the old session's scratchpad. Run them with:

```
bash music-handoff/tests/run.sh              # all of them, about 25 minutes, one at a time
bash music-handoff/tests/run.sh amp/b1 amp/b2 strings/st
node music-handoff/tests/amp/t3.js           # each amp's distortion and compression across Gain (Node, no browser)
```

- Playwright and Chromium are installed globally: `require(execSync("npm root -g")+"/playwright")`. Never run `playwright install`.
- Each suite uses a fixed 99xx port. **Never run two copies at once.**
- `AOG_ROOT` points the server at another checkout.

Before any push:
- `node tools/check-contrast.js <pages>` and `node tools/check-calm.js <pages>`;
- with no arguments (the whole site) after changing a shared file.

## 7. How "deploy" is done here

1. All suites pass, plus the contrast and calm checks.
2. Bump `const CACHE` in `aog-deploy/sw.js`: the next `m729x`, with a one-line ALL-CAPS comment saying what changed, and the old line kept as a comment.
3. Commit. The message ends with these two lines:
   ```
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   Claude-Session: <the session link>
   ```
   Put no model names anywhere else.
4. `git push -u origin claude/drum-pads-touch-keys`
5. Open a PR to `main`. The body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)` and the session link.
6. Merge with method **merge** and `expectedHeadSha` set to the full 40-character head SHA.
7. `git fetch origin main && git checkout -B claude/drum-pads-touch-keys origin/main`

**Never erase** `aog.sync.url`, `aog.sync.key` or `aog.sync.writekey` in localStorage, except through Disconnect or Delete everything.

## 8. Known risks and next ideas

- **Not yet heard on an iPad.** No WebKit browser is available here. Ask Jimmy to try the metal sound and the amp on his iPad after the deploy.
- **Flanger.** Chrome clamps a delay inside a feedback loop to one render quantum (2.7 ms), so it cannot sweep through zero. Moving it into the worklet would fix that.
- **Download size.** The new recordings (piano, band, drum kits) load only when a sound is picked. Keep it that way.
- **Next for the studio:** "Send to the studio" buttons in `aog-recorder.js`; a second clip per track. Never a microphone.
