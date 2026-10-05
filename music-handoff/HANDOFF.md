# HANDOFF: the music bench (written 2026-10-04)

The site owner is Jimmy, a special-education teacher. The site is static and lives in `aog-deploy/`; Netlify publishes that folder. **Read `CLAUDE.md` at the repo root first.** Its standing orders apply to every page you touch:
- readable text, checked by `tools/check-contrast.js`;
- calm pages for neurodivergent learners, checked by `tools/check-calm.js`: iPhone first, no endless motion, nothing plays on its own;
- plain words in English **and** Spanish;
- drop-downs, not walls of tabs;
- bump `sw.js` CACHE on every deploy.

This file is for a NEW session taking over the music work. Everything below can be checked in the repo.

> **State of the helper branches:** the session that wrote this file merged all of them into `claude/drum-pads-touch-keys` and deployed them together (see §1 and §4). Check with `git log --oneline -12 origin/main`. Start new work from `main`.

---

## 1. Where things stand

| What | Where | State |
|---|---|---|
| Live site | `main` | The amp (PR #265), then every helper branch in one deploy (§4): the Studio; the piano's 34 sounds; The Band's 46 (strings, percussion, Orchestra, jazz); guitar 44 and bass 25 sounds on a 44.1 kHz string; 21 guitar and 19 bass ways to play; 44 chord patterns on all four tools; Solo mode; 20 drum kits (P–T recorded); a take sent to a drum pad; the turntables as three decks and a mixer, with their picture guide redrawn. |
| The amp and pedals | `aog-amp.js`, `aog-amp-worklet.js` | 16 amps, 9 cabinets, 19 guitar pedals (15 on the bass), a 10-band EQ. |
| Helper branches | `origin/claude/amp-*` | All merged. The branches stay on GitHub as a record; do not merge them again. |

The working branch for music is `claude/drum-pads-touch-keys`. After every deploy it is reset to `origin/main`, keeping the same name.

## 2. Jimmy's requests, in his words, and where each one went

1. "May the guitar and bass get a Amplifier … the worlds best that has guitar pedals … attached … part of the two engines" → **done** (§3).
2. "There is NO distortion for the METAL guitar chords" → **done**. The distortion runs on the audio thread, not in the browser's WaveShaper; a held chord keeps its level for 2 s. Not yet heard on Jimmy's iPad.
3. "I want more ways to play chords on the guitar as well as bass … metal style sounds (like Pantera / lamb of god)" → **done**: 21 guitar and 19 bass ways to play, in groups; the metal sounds (metal, thrash, doom, heavy riffs, progressive metal, groove-metal lead) and a metal bass.
4. "Can all instruments have MULTIPLE VERSIONS OF HOW THEY SOUND? … a lot more" → **done**: piano 34 sounds, The Band 46, guitar 44, bass 25, drum machine 20 kits.
5. "send the sounds from the instruments to the drum machine as samples. Not just for the pads" → **done**: ● Record on any tool, then send the take to a drum pad (the `drumsample` shelf).
6. Jimmy's uploaded handoff "fix the guitar and the bass" → **done**: one string at 44.1 kHz, a pick that clicks, in-tune notes, sounds that differ, a synth bass that thumps; bass lines that leave the root, strum gaps of 15–40 ms, picking order; a held pad draws its shape.
   - **Note:** that handoff's "Do not add a pedalboard / cabinet / new amp / new sounds" lines were written *before* Jimmy asked for the amp and pedals. The amp stays.
7. "Think about Led Zeppelin, Aerosmith, AC/DC, Black Sabbath, Opeth, when making the sounds" → **done**: 22 new guitar and 12 new bass sounds, 5 new amps. On screen, sounds are named by style and feel, never by band or player; the inspiration is in each sound's code comment.
8. "I would love an authentic Drum kit" → **done**: kits P to T are a real kit, recorded (Big Rusty Drums by Karoryfer Samples, CC0), in five styles, each with a starter beat. A kit downloads only when it is picked.
9. "Could a state of the art Recording studio be built?" → **done**: `music-studio.html`, route `/studio`, in every music tool's menu and on the science hub.
10. Record exists on every music tool (piano, guitar, bass, band, drum machine): `aog-recorder.js`.
11. "Can one of the agents make the ORCHESTRA tab, where everyone plays!" → **done**: "Orchestra · everyone plays" on The Band.
12. "We need a string and percussion section!" → **done**: strings (violins, violas, cellos, contrabass, harp) and percussion from VSCO 2 CE; both join the Orchestra.
13. "Les Claypool, Buckethead, Van Halen, Flea … Stevie Ray Vaughan, Jimi Hendrix, the list can go on and on" → **done**: their sounds (by style) and new pedals: vibe, octave fuzz, pitch shifter, rotating speaker, envelope filter, treble booster, a vintage fuzz and a tape echo.
14. "In guitar there should be a solo mode as well! BLOW my mind" → **done**: Solo mode (`aog-solo.js`), §5.
15. "yes I want how it is played increase and start a chord pattern increased!!!!" → **done**: 44 chord patterns in five groups on the guitar, bass, piano and band (the 18 old ids unchanged); lesson 7 of Mastering the Piano lists them all.
16. "Start the DJ turntables agent now too" (Frankie Knuckles, DJ Shadow, Carl Cox) → **done**: three decks and a three-channel mixer, pads, loops and slip on the beat, EQ kills, a filter, beat-timed echo, reverb and flanger, and four records made on the page (house, techno, trip-hop, disco edit), named by style.

### Jimmy's list of influences (2026-10-04): "These are some of influences the instruments should get their sounds from"

On screen, sounds are named by style, never by player.

| Instrument | Players | Where it went |
|---|---|---|
| Guitar | Dimebag Darrell, Jimi Hendrix, Eddie Van Halen (plus Zeppelin, Aerosmith, AC/DC, Sabbath, Opeth, Buckethead, Stevie Ray Vaughan from earlier) | **tones**: done |
| Bass | Jaco Pastorius (fretless lead), James Jamerson (flatwound Motown), Flea (slap) (plus Les Claypool) | **tones**: done |
| Drums | Vinnie Paul, John Bonham, Buddy Rich, Neil Peart, Jeff Porcaro: kit voicings, plus starter beats in their spirit (a half-time shuffle, the big "Levee" room groove, big-band swing, a groove-metal double kick, a prog beat) | **drumkit**: done (kits P–T) |
| Brass | Louis Armstrong, Miles Davis (Harmon mute), Dizzy Gillespie | **band**: done (jazz styles) |
| Woodwinds | Charlie Parker (alto), John Coltrane (tenor), Wayne Shorter (soprano). Tenor and soprano only if real recordings or a convincing voicing exist | **band**: done (jazz styles) |
| DJs | Frankie Knuckles (house), DJ Shadow (sampling, turntablism), Carl Cox (techno, three decks) | **dj**: done |

## 3. The amp (AOG-AMP-V1): live since #265

The files:
- `aog-deploy/aog-amp-worklet.js`: the AudioWorklet that bends the wave, four times oversampled (a 64-tap Kaiser FIR, 90 dB clean round trip). In order: pickup resonance → gate, compressor, wah, octave → overdrive, distortion, fuzz → 1–4 preamp stages → the real treble–middle–bass tone stack (solved from the circuit, checked against Yeh & Smith) or bass shelves → a power amp with sag → presence and depth. In Node it exports `AmpCore` (the tests use it).
- `aog-deploy/aog-amp.js`:
  - `MODELS`: 12 guitar amps and 4 bass amps, each with `make(knobs)`, a cabinet, and `out`/`lvl` loudness calibrations;
  - `CABS`: 9 minimum-phase impulses made from speaker curves;
  - `PEDALS`: 19 pedals; a pedal with `kind:"guitar"` is hidden on the bass page (the bass shows 15);
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

## 4. The helper branches: all merged

Each helper worked in its own worktree and pushed `origin/claude/amp-<name>`. All of them are merged into `claude/drum-pads-touch-keys` and deployed together. The branches stay on GitHub as a record.

| Branch | What it brought | Merge commit |
|---|---|---|
| `claude/amp-ways` | 21 guitar and 19 bass ways to play, in groups; bass lines that leave the root; strum gaps; **44 chord patterns** | `6a2027e0` |
| `claude/amp-studio` | The Studio: 8 tracks, mixer, sends, master, bounce, the `studiobench` shelf | `b2fc90f3` |
| `claude/amp-piano` | 34 piano sounds (some recorded from VSCO 2 CE); the seven older ones levelled to the grand | `e102efdf` |
| `claude/amp-drums` | Send a recorded take to a drum pad (`drumsample` shelf); kits J to O | `6e0f3839` |
| `claude/amp-band` | The Band: strings and percussion, Orchestra, muted and vibrato brass, jazz styles | `fd0c4c0e` |
| `claude/amp-stringfix` | One string at 44.1 kHz, the pick click, pitch, sounds that differ, the synth bass | `c61d66c7` |
| `claude/amp-tones` | 5 amps, a 4×10 cabinet, 6 pedals, a vintage fuzz and a tape echo; 22 guitar and 12 bass sounds; 3 new sound groups | `f50fe60b` |
| `claude/amp-drumkit` | Recorded kits P to T, a starter beat each (`aog-drumkit.js`, `audio/drums/*`) | `67f68cea` |
| `claude/amp-solo` | Solo mode (`aog-solo.js`) | `fe9b8e38` |
| `claude/amp-dj` | The turntables as a three-deck DJ instrument (`aog-dj.js`, `aog-vinyl-worklet.js`, `music-decks.html` rewritten) | `2a383519` |
| `claude/amp-decksguide` | The turntables picture guide, `decks-guide.html`, redrawn for three decks | (see §1) |

After the merges, the lead session:
- copied the 44 patterns into `music-piano.html` and `_work/music/band_script.js`, gave **Heroic** its own chords (Am C G D; it had copied Minor groove), and listed all 44 in lesson 7 of Mastering the Piano (`make_mastering_piano.py`);
- added the new lead sounds to Solo mode's sound menu (`LEADS` in `aog-solo.js`);
- put the Studio in every music tool's menu and on the science hub's five unit lists;
- made one `sw.js` CACHE bump for the whole batch.

If you ever merge more work into the generated pages (`music-guitar.html`, `music-bass.html`, `music-band.html`): take either side, then regenerate from the sources with `make_strings.py` or `make_band.py`.

## 5. The music bench, how it fits together

| Tool | File(s) | Notes |
|---|---|---|
| Drum machine | `music-drums.html`, `aog-drumkit.js` | SP-1200 model. Kits A–O are made on the page; P–T are a recorded kit (`audio/drums/<style>/`, loaded only when picked, two kept in memory). Memory: 10 s for user samples, 26,040 Hz, 12-bit. Chord pads, a take on any pad, kit undo. |
| Turntables | `music-decks.html`, `aog-dj.js`, `aog-vinyl-worklet.js` | Three decks (one at a time on a phone, from the Show menu) and a three-channel mixer. The crate: `audio/crate/*.mp3` plus four records made on the page in a Worker. Reads every shelf. A limiter keeps every mix under −1 dBFS. |
| Studio | `music-studio.html` (`/studio`) | 8 tracks, a mixer with sends, a master, bounce. Takes what you made on the other tools from their shelves and from "Takes sent here" (the `studioinbox` list); its bounce goes on the `studiobench` shelf for the turntables. |
| Piano | `music-piano.html` | Hand-written, except LESSONS (`_work/music/make_piano_lessons.py`). Lessons: `piano-lessons.html`, `mastering-piano.html` (`make_mastering_piano.py`). |
| Guitar and bass | `_work/music/strings_page.html` → `make_strings.py`; `aog-solo.js` | One source, `GTR` true or false. Solo mode lives in `aog-solo.js` and joins the page through nine small AOG-SOLO-V1 hooks; in Chords mode every hook returns false. |
| The Band | `_work/music/band_head.html` + `band_script.js` → `make_band.py` | VSCO 2 CE recordings plus Weresax (CC0). |

Shared files:
- `aog-recorder.js`: ● Record. Only the tool's own sound, never a microphone; 3 takes. Each take: Save as .wav, Send to the turntables, Send to the drum machine (not on the drum machine), Send to the Studio (AOG-STUDIO-SEND-V1). The turntables keep their own Record, with Send to the Studio too.
- `aog-handoff.js`: the IndexedDB shelves:
  - `drumbench`: the drum machine's bounce;
  - `keysbench`: the piano;
  - `guitarbench` and `bassbench`;
  - `bandbench`;
  - `drumtake`: a take from the drum machine's recorder;
  - `chordpads`;
  - `drumsample`: a take from any tool, for a drum pad;
  - `studiobench`: the Studio's bounce;
  - `studioinbox`: a LIST, not a shelf (AOG-STUDIO-INBOX-V1): every take sent to the Studio, newest first, at most 16; the 17th pushes out the oldest and the Studio names it. `add`/`list`/`item`/`remove`; one record per take (`studioinbox/<id>`, with its .wav) plus an index (`studioinbox`), written in one transaction. Same database, store and version as the shelves.
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

The recorded guitars and basses (AOG-STRINGS-REAL-V1) are in `audio/guitar/<set>/` and `audio/bass/<set>/`: a `set.json` and mono MP3s each, built by `music-handoff/tools/strings/build_guitar_sets.py` and `music-handoff/tools/bass/build_bass_sets.py`. A sound plays one when it names it (`rec:"green"` in `_work/music/strings_page.html`); `rout` is its level on the recordings, `rrel` how loud the hand's sound is when a note is let go (measured through the sound's own amp), `rclick` the made pick's click on a fingered recording, `rslap`/`rpop` the slap sounds' recorded thumb and pop, `rglide` a fretless's slower slide. Every guitar and bass sound now plays recordings: the bass sets are growly (with Swagbass's muted slaps), upright, ergo (the fretless sounds) and, for the two synth sounds, synthbass and acidbass: a real Roland SH-2 analog synthesizer (Modular Samples, public domain, the Unlicense), four strengths each, played as recorded (`"play":"straight"` in set.json; `recSynthStraight`), built by `music-handoff/tools/bass/build_synth_bass_sets.py` (AOG-BASS-SYNTH-V1; the organ set cosmo is gone). Rebuild the others with `build_bass_sets.py --only growly|upright|ergo|slaps`. The piano's string synth, warm synth, synth brass and synth lead are real analog synthesizers too (a Jupiter-4 and a JX-3P, same library): `music-handoff/tools/piano_synth_sets.py`, then `piano_synth_page.py` writes their SETS entries (AOG-PIANO-SYNTH-V1). Solo mode's band plays green and growly once Play is pressed (`aog-solo.js`, `BAND_SET`, `BAND_RT`, `BAND_MIX`; `REAL.room` sets how many sets a device keeps). The files are cached for a year (`_headers`): when any of them changes, bump `REAL.ver` in `strings_page.html`.

## 6. Tests

`music-handoff/tests/` holds every suite, copied from the old session's and the helpers' scratchpads. Run them with:

```
bash music-handoff/tests/run.sh              # all of them, about 45 minutes, one at a time
bash music-handoff/tests/run.sh amp/b1 amp/b2 strings/st
node music-handoff/tests/amp/t3.js           # each amp's distortion and compression across Gain (Node, no browser)
```

What the newer suites cover:
- `amp/b1` (every sound's C chord within 0.5 dB of the grand, the panel, a reload), `amp/b2` (every pedal and amp model);
- `strings/sfix` (the 44.1 kHz string: pitch, the pick click, steel against nylon, fingers against pick, the synth's thump, held pads), `strings/sways` (the ways to play), `strings/sdecks` (the tools menu on every music page, with the Studio);
- `strings/real` (the recorded guitars and basses: a set loads only when picked, the made string plays until it is in, every note in tune, no clicks, layers, takes, mutes, bends, taps, the pick on the fingered bass, the hand's sound under the note on every sound, on time with any MP3 decoder, a phone), `strings/bassets` (the bass sets' files; Node and ffmpeg, no browser);
- `solo/s1` (the panel and the lit scale on an iPhone, an iPad and a computer), `solo/s2` (bends, vibrato, hammer-ons, tap, squeal, whammy, kill, feedback, slap and pop, the keys), `solo/s3` (the backing band in time, the licks);
- `realkit` (kits P to T: loading, every pad soft to accent, takes, levels against kit A, the era dial, TRIM, the starter beats, Send to the turntables, a reload, Spanish, a phone);
- `ppat` (all 44 chord patterns on the piano, in five groups, in English and Spanish);
- `dj/d0` (the turntables' engine and the four records, in Node), `dj/d1` (three decks in sync), `dj/d2` (loops, pads, slip, to the sample), `dj/d3` (EQ, filter, effects), `dj/d4` (phone, iPad and computer layouts, Spanish, contrast, keyboard), `dj/d5` (frame rate on a slowed iPad);
- `studio/send` (Send to the Studio from the piano, the drum machine, the guitar twice, the bass, The Band and the turntables; Takes sent here, newest first; two guitar takes on two tracks, played and mixed; a reload; the 17th take; Remove; Spanish; an iPhone in light and dark; an iPad). Port 9241.

- Playwright and Chromium are installed globally: `require(execSync("npm root -g")+"/playwright")`. Never run `playwright install`.
- Each suite uses a fixed 99xx port. **Never run two copies at once.**
- `AOG_ROOT` points the server at another checkout.

Before any push:
- `node tools/check-contrast.js <pages>` and `node tools/check-calm.js <pages>`. Name the pages as they sit in `aog-deploy/` (`music-band.html`, not `aog-deploy/music-band.html`): a path the server cannot find opens an empty page, which the contrast check passes without looking;
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

## 7b. Played sideways (AOG-PLAY-V1, 2026-10-04)

Turn a phone or tablet on its side and the guitar, bass, piano, The Band and the drum machine fill the screen to be played with both hands. See `music-handoff/LANDSCAPE-HANDOFF.md` §10 for how each is built and tested (`tests/play/*`).

## 8. Known risks and next ideas

- **Not yet heard on an iPad or in Safari.** No WebKit browser is available here. Ask Jimmy to try on his iPad:
  - the metal sound and the amp;
  - a recorded drum kit (P to T): it is decoded with `decodeAudioData` on OfflineAudioContexts at 44,100 and 26,040 Hz;
  - Solo mode's slap and pop on the bass (a pop arrives 20–60 ms after the slap starts).
- **Phone memory.** Each recorded kit takes about 10–16 MB decoded, plus a copy in the audio engine; two stay loaded.
- **Pitch shifter.** It lags the note by 8–39 ms and chords shimmer a little, as on the real pedal.
- **Browsers without AudioWorklet.** The fallback amp has no envelope filter, pitch shifter, octave fuzz or vibe; the treble booster only adds gain there.
- **Flanger.** Chrome clamps a delay inside a feedback loop to one render quantum (2.7 ms), so it cannot sweep through zero. Moving it into the worklet would fix that.
- **Solo mode.** Licks are guitar only, and a lick moves the hand's window to its box.
- **Download size.** The new recordings (piano, band, drum kits) load only when a sound is picked. Keep it that way.
- **Next for the studio:** a second clip per track. (Send to the Studio from every tool, the turntables' mix included, is done: AOG-STUDIO-SEND-V1.) Never a microphone.
