# HANDOFF: play the instruments sideways on an iPhone and an iPad (written 2026-10-04)

The site owner is Jimmy, a special-education teacher. The site is static and lives in `aog-deploy/`; Netlify publishes it from `main`. **Read `CLAUDE.md` at the repo root first**, then `music-handoff/HANDOFF.md` (how the music bench fits together, the tests, how a deploy is done). This file covers one new feature only.

## 1. What Jimmy asked for, in his words

> "When you turn the iPhone or iPad horizontally, you can play the guitar or bass like a real instrument. Same with standing bass and whatever instruments could fit this idea."

So: turn the device sideways and the instrument fills the screen, and you play it with your hands the way you would the real thing. Upright (portrait) stays exactly as it is today.

## 2. Before you start: check what is live

On 2026-10-04 the previous session had one more deploy in flight: the last real piano sounds (organs, synths, accordion, choir, music box, toy piano) on `claude/amp-pianoreal`, and a fuller Rhodes recording. Run `git fetch origin && git log --oneline -6 origin/main`. If those are not in `main` yet, check with Jimmy before you build on the piano page, so you do not fight that branch. Start your work from `main`.

## 3. What to build, instrument by instrument

Build in this order and ship each one when it is tested; Jimmy prefers seeing progress.

1. **Guitar** (`_work/music/strings_page.html` → `python3 make_strings.py` builds `music-guitar.html` and `music-bass.html`; never edit the built pages).
   - Sideways, the neck runs the full width of the screen, nut on the left, frets getting closer together towards the right, six strings across, low E at the bottom (as you see your own guitar when you look down at it). A left-handed switch flips it.
   - One hand frets: touch a string between frets to hold that note; several fingers can hold a chord shape. A strum strip on the right (or over the sound hole area) takes the other hand: a swipe down or up across the strings strums whatever is held, in the order and speed of the swipe; a tap on one string plucks it.
   - Slide a held finger along a string to slide; push it across the string to bend; wiggle to vibrato. Solo mode (`aog-solo.js`) already does bends, vibrato, slides, hammer-ons, tapping and the whammy through the hooks listed in its own report; reuse them, do not duplicate them.
   - The chord pads, sound menu and amp stay one tap away (a small drawer or button), not on the playing surface.
2. **Bass**: the same page with four strings and the bass's sounds; plucking with two fingers (alternate taps on the strip), slap and pop where the slap sounds are chosen (the engine already has thumb and pop).
3. **Upright (standing) bass**: when the upright sound is picked, the neck is drawn without frets: a smooth fingerboard with dots only where a player marks positions. Notes follow the finger exactly (slides glide). The real upright set is pitch-only (`s` null), so map by pitch.
4. **Piano** (`music-piano.html`, keyboard `#kbd`, `buildKeys()`): sideways, a full-width keyboard (about two octaves on a phone, three to four on an iPad), keys sized for fingers, multi-touch chords, a slide strip or arrows to move up and down an octave.
5. **Drum machine** (`music-drums.html`, pads `.pad`): sideways, the pads become a drum kit seen from the drummer's seat: kick and hi-hat low, snare in the middle, toms in an arc, cymbals at the top. The same 8 voices; nothing else changes.
6. **The Band** (`_work/music/band_*` → `make_band.py`; keys `buildKeys()`): harp as strings you sweep; marimba, xylophone and glockenspiel as bars; the rest keep the keyboard.
7. Leave the turntables and the Studio as they are unless Jimmy asks.

## 4. The standing orders that matter most here

- **Calm** (`check-calm.js`): nothing moves on its own, no endless animation, no surprise sound, no sideways scroll, no rubber-band. A string can show it is ringing while it sounds and stop when it stops; nothing loops forever.
- **Design for the iPhone first**, then the iPad, then a computer. A computer has no orientation, so it keeps today's layout (offer the play view behind a button only if it is easy).
- **Readable text** (`check-contrast.js`) in light and dark, and **plain words in English and Spanish** for every label and hint (for example "Turn your phone sideways to play" / "Gira tu teléfono para tocar", shown once, quietly, in portrait).
- **Drop-downs, not walls of tabs** for any choice of four or more.
- On screen, sounds keep their style names, never a player's name.

## 5. Technical notes (iOS Safari is the target)

- iOS Safari cannot lock orientation (`screen.orientation.lock` is not supported) and an iPhone cannot make a normal element full screen (only video). Use `@media (orientation: landscape)` together with a height limit (for example `and (max-height: 540px)` for phones; iPads need their own rule), plus `matchMedia(...).addEventListener("change", …)` for anything scripted.
- Size the play surface with `100dvh` / `100dvw` and keep clear of the notch and home bar with `env(safe-area-inset-left|right|bottom)` (needs `viewport-fit=cover` in the viewport meta: check each page before adding it).
- **Zoom:** `aog-calm.css` sets `body { zoom: .94 }` from 700 px wide and `.85` from 1000 px, and a sideways iPhone is about 844 px wide, so the page would be zoomed while you play, and touches land away from the strings. Pages with a canvas are exempt (`body:has(canvas) { zoom: 1 !important; }`, AOG-CANVAS-TRUE-V1). Exempt the play view the same way (for example `body.aog-play { zoom: 1 !important; }` in the page's own CSS); do not change the shared rule.
- Touch: Pointer Events with `touch-action: none` on the playing surface only (the rest of the page must still scroll), `-webkit-user-select: none`, `-webkit-touch-callout: none`; track every pointer by `pointerId` for chords; never use `click` on the surface (300 ms and one finger only).
- Audio: resume the AudioContext on the first touch (each page's `ctx()` already does); schedule notes at `ac.currentTime` with no extra lookahead for touches. The recorded guitar and bass sets load when their sound is picked; the made string plays until they arrive (see the strings engine notes in `HANDOFF.md`).
- Keep the portrait page untouched: the play view should be an added layer that reads and drives the same state (`S`, `FINGERS`, the voices), so Record, Send to the Studio and the lessons keep working sideways too.

## 6. Where the current code is

- Guitar and bass neck: an SVG `#neck` in `#neckBox` (viewBox 330×300), driven by `bindNeck()`, `neckHit()`, `litNeck()` and the `FINGERS` map in `strings_page.html`; notes start in `makeVoice(c, ch, id, m, v, when, s)` and slide with the voice's `glide(m2, at)`.
- Solo mode: `aog-solo.js`, joined to the page by nine small AOG-SOLO-V1 hooks.
- Piano keys: `#kbd`, `buildKeys()` in `music-piano.html`. Band keys: `buildKeys()` in `band_script.js`. Drum pads: `.pad` in `music-drums.html`.

## 7. Tests

- Add a suite per instrument under `music-handoff/tests/play/` and list them in `run.sh` (each suite has its own fixed 99xx port; never run two copies of `run.sh` at once).
- Test in Playwright as an iPhone sideways (`viewport: {width: 844, height: 390}`, `isMobile: true`, `hasTouch: true`) and an iPad sideways (`1180 × 820`), plus portrait to prove nothing changed. Real multi-touch needs the DevTools protocol (`Input.dispatchTouchEvent` with several touch points).
- Check: the right note for each string and fret (pitch measured, as `strings/real.js` does), a chord held with several fingers, a strum's order and spacing, a slide and a bend gliding, no sideways scroll, no zoom on the play view, the safe-area margins, Spanish, and no page errors. Then the full `bash music-handoff/tests/run.sh`.
- Checks before any push: `node tools/check-contrast.js <pages>` and `node tools/check-calm.js <pages>` (page names as they sit in `aog-deploy/`, without the folder), and both with no arguments if you touch a shared file.
- Nothing here can run real Safari. Say so in each report, and ask Jimmy to try each instrument on his iPhone and iPad after it ships.

## 8. Deploy

As in `HANDOFF.md` §7: all suites and checks pass; bump `const CACHE` in `aog-deploy/sw.js` with a one-line ALL-CAPS comment; commit with the two attribution lines; push `claude/drum-pads-touch-keys`; PR to `main`; merge with method merge and the full head SHA; reset the branch to `origin/main`.

## 9. Questions worth one short message to Jimmy (only if they block you)

- Left-handed players: a switch, or follow the device's rotation direction?
- Should the play view also offer the lessons' lit notes (follow-along), or stay a free instrument first?

## 10. Status (2026-10-04, end of the session that built it): AOG-PLAY-V1, all six done

| Instrument | Where | What sideways does |
|---|---|---|
| Guitar, bass | `_work/music/strings_page.html` (→ `make_strings.py`), `aog-solo.js` | The page's own neck (`#neckBox`) moves into `#playView` and is drawn again by `buildPlayNeck()`: nut on the left, real fret spacing (`fretD(k)=1-2^(-k/12)`), low string at the bottom, ~9 frets on a phone, 10 on an iPad; a STRUM (PLUCK) strip on the right. A held fret is silent; the strip sounds each string crossed, in order, spaced by the swipe; a ringing string follows its top finger (hammer-on, slide, bend, vibrato: `pvRetune`), a lifted finger mutes it (or pulls off). With no fingers down, the guitar's strum plays the chord in your hand (`shapeChord()`). Drawer (☰ Chords and sounds): sound, key, six chord pads, Chords/Solo, Play the chords, Left-handed (`aog.<inst>.play.v1`). Upright and fretless sounds (`rec` upright/ergo) have no frets: the pitch follows the finger, settling on a note within an eighth of a step (`inTune`). Solo mode keeps its hooks; `aog-solo.js` now draws with the page's `neckXY/neckY/neckSpan/neckStrum`, so its lit scale, bends and whammy (on the strip) land right sideways. A computer gets "⤢ Play on the whole screen" (Esc closes). |
| Drum machine | `music-drums.html` (`dkSvg`, `dkSync`) | On the bench or Meet the drums: a kit from the drummer's seat (`#kitView`): kick and closed hat low, snare with its rim around it in the middle, tom above, open hat and bell as cymbals at the top, clap on a pad where the floor tom stands. Each piece has `data-pad`, so `bind()` gives it the pads' own touch (rolls too). The kit widens to fill a phone. Play the beat, Record a take. |
| The Band | `_work/music/band_*` (→ `make_band.py`) | `#kbd` moves into `#playView`: two octaves on a phone, three on an iPad. Harp: strings tuned to the song's key (C red, F blue), swept in order. Marimba, xylophone, glockenspiel: bars, sharps behind, low bars longer. |
| Piano | `music-piano.html` | `#kbd` moves into `#playView` on the bench only (not Lessons, Meet …): two octaves on a phone, three on an iPad. Its diff applies cleanly on top of `claude/amp-pianoreal` (checked with `git apply --check`). |

Shared rules: sideways = `(orientation: landscape) and (pointer: coarse)`; ✕ Close gives the page back until the device is turned again; `body.aog-play { zoom: 1 !important }` in each page's own CSS (aog-calm.css untouched); safe-area padding on the play view; one quiet "Turn your phone/tablet sideways …" line upright, until the first time it is turned. Answers to §9, chosen without blocking: left-handed is a switch in the drawer; the lessons' lit notes and the pale chord dots keep showing in the play view (it is the same neck and keys).

Tests: `music-handoff/tests/play/strings.js` (9965), `play/drums.js` (9967), `play/band.js` (9968), `play/piano.js` (9966), all in `run.sh`. **Not yet tried in real Safari, on a real iPhone or iPad.** Ask Jimmy to try each instrument sideways, with two hands.

### Added the same day, from Jimmy's next message

- "How can we make it so it is extremely easy to go back and forth from chords to single notes" → **AOG-CHORDSTRIP-V1**: the six chords in one row right on top of the neck and the keys (`.cstrip`, `paintStrips()`), upright and sideways, on the guitar, bass, piano and The Band. Sideways on the guitar and bass, **♪ Notes** (a fret plays when touched; the default) or **✋ Hold + strum** (silent frets, strum on the strip), one tap apart. The drawer is now just ☰ Sounds.
- "A lot of the How the chords are played sounds, sound like fake instruments" → **AOG-FEEL-V1** (`feel(k,i)` in each page): every pattern note a few ms early or late, a little softer or louder, a piano chord rolled up from the bottom, each Band player on their own; seeded per bar. The grid tests run with `window.AOG_FEEL_OFF=true`; `tests/play/feel.js` checks the feel. And `claude/amp-pianoreal` is merged in (the organs, synths, accordion, choir, music box and toy piano on real recordings).
- "Make the drums look more authentic and real" → **AOG-KIT-REAL-V1**: `realKit()` in `music-drums.html` draws a real kit (lacquered shells, chrome hoops and lugs, coated heads, brass cymbals with lathe rings, hi-hats on a stand, the kick's front head, a rubber pad for the clap) for Meet the drums and the kit sideways.
