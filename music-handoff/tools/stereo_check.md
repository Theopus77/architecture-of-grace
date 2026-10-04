# Stereo check: guitar, bass and the recorded drum kits (2026-10-04)

Jimmy asked whether fake instruments are left, then: "REAL EVERYTHING if possible".
The Band's violins sounded fake because their builder added the two microphones of a stereo
recording into one channel. When two microphones stand apart they hear the sound a little
differently (low L/R correlation); adding them cancels some frequencies and not others, a hollow,
phasey sound. This file records the same check for the guitar, the bass and the drum machine.

How it was measured (scripts in the helper's scratch, numbers below):
- every source recording was fetched again from the URL its builder names (GitHub);
- **corr** = L/R correlation of the hit or note (notes: 0.3 to 1.5 s after the pluck; drums: the
  pad's length, at most 1 s, from the hit), **hi** = the same above 2 kHz (cymbals, snare wires,
  the click of a beater), **loss** = how much quieter (L+R)/2 is than the two channels on their own
  (0 dB: nothing lost; -3 dB: the two sides have nothing in common; below -3 dB: they cancel);
- for a drum pad, the would-be stereo pad is the builder's own microphone mix of its normal hit,
  kept in two channels (a mono microphone sits in the middle, a stereo pair keeps its sides).

Rule: a pad is rebuilt in true stereo when corr < 0.9, or hi < 0.5 (the top end is where adding
the sides changes the sound most). Pads made only from mono microphones, or whose sides are
nearly identical, stay as they are.

## Guitar (music-guitar.html) and bass (music-bass.html)

Every source recording these sets use is **mono** (one channel), so adding channels never
happened: nothing was lost, nothing to rebuild. Files checked (channels, sample rate):

| Set | Library (URL in the builder) | Files checked | Channels |
|---|---|---|---|
| guitar/green | karoryfer.black-and-green-guitars | Samples/green/ord/twang_e3_f_rr1, twang_bb5_f_rr1, stac/staccato_e3_rr1, rel/release_d4_rr1 | 1 (mono), 44.1 kHz |
| guitar/black | karoryfer.black-and-green-guitars | Samples/black/ord/twang_e4_mf_rr2, stac/staccato_e3_rr1, rel/release_d4_rr2 | 1 (mono), 44.1 kHz |
| guitar/steel | Discord-SFZ-GM-Bank, 026-Acoustic Guitar (steel) | MartinGM2_040__E2_1, MartinGM2_064__E4_1 | 1 (mono), 44.1 kHz |
| guitar/nylon | freepats/spanish-classical-guitar | samples/E2, E4, C6 (.flac) | 1 (mono), 44.1 kHz |
| bass/growly | karoryfer.growlybass (+ swagbass slaps) | sustain/e2_p_rr3, a3_f_rr2, staccato/e2_staccato_rr5, release/a4_rel_rr1, scrape/scrape_1_rr1, swagbass noises/noise_mutedslap_rr1 | 1 (mono), 44.1 kHz |
| bass/upright | dsmolken.double-bass + karoryfer.meatbass | pizz/pizz_eb1_mb, pizz_a3_fa, noises/pizz_noise_mute_d, meatbass Samples/pizz/gb1_vl3_rr4, c2_vl3_rr1 | 1 (mono), 44.1 kHz |
| bass/ergo | karoryfer.ergo (+ Smolken mutes) | ergo/pizz/Eb1_3_mf, C2_1_mf, A3_1 | 1 (mono), 44.1 kHz |
| bass/cosmo | karoryfer.caveman-cosmonaut | Samples/bass_16_2_a2, bass_8_c2 | 1 (mono), 44.1 kHz |

## Drum machine (music-drums.html): the source microphones

| Library | Microphones | Channels | corr (range) | hi | loss |
|---|---|---|---|---|---|
| Big Rusty Drums | kick, snare top/bottom, close (cl) | mono | | | |
| Big Rusty Drums | overheads (oh): kick | stereo | +0.41 to +0.59 | -0.04 | -1.0 to -1.6 dB |
| Big Rusty Drums | oh: snare centre / rimshot | stereo | +0.42 to +0.50 | +0.01 | -1.3 to -1.5 dB |
| Big Rusty Drums | oh: sidestick, toms | stereo | +0.03 to +0.36 | 0.0 | -1.7 to -2.9 dB |
| Big Rusty Drums | oh: hi-hats (all), ride, sizzle, China | stereo | -0.08 to +0.08 | about 0 | -2.8 to -3.4 dB |
| Big Rusty Drums | oh: crash | stereo | -0.23 | +0.03 | -4.1 dB |
| Virtuosity Drums | kick mic, snare mic, lo-fi | mono (48 kHz) | | | |
| Virtuosity Drums | overheads: kick / toms | stereo | +0.87 to +0.97 | -0.13 to +0.05 | -0.1 to -0.3 dB |
| Virtuosity Drums | overheads: snare | stereo | +0.51 (-0.34 to +0.78) | +0.11 | -1.4 dB |
| Virtuosity Drums | overheads: hi-hat, ride, crash | stereo | -0.14 to 0.00 | about 0 | -3.0 to -3.7 dB |
| Virtuosity Drums | room: kick / toms / snare | stereo | +0.67 to +0.91 | +0.14 to +0.34 | -0.2 to -0.8 dB |
| Virtuosity Drums | room: hi-hat, ride, crash | stereo | +0.03 to +0.22 | about 0 | -2.2 to -2.9 dB |
| Virtuosity Drums | percussion (timbales), mid | stereo | +0.42, +0.69 | 0.00, +0.31 | -1.8, -0.8 dB |
| Swirly Drums | every piece | mono | | | |
| Gogodze Phu Vol II | every microphone (kick, snare, side, front, oh, window, retro) | mono | | | |
| VCSL | agogô | stereo | -0.48 | -0.02 | -6.7 dB |
| VCSL | tambourines, triangles, cowbells, claves, woodblock, shakers, cabasa, güiro, bongos | stereo | -0.16 to +0.09 | -0.16 to +0.18 | -2.7 to -3.9 dB |
| VCSL | marching snare, tenor drum, Snare Modern 3 | stereo | 0.00 to +0.36 | about 0 | -1.8 to -3.0 dB |
| VCSL | clash cymbals, Snare Modern 1 | stereo | +0.58, +0.78 | +0.47, +0.12 | -1.1, -0.5 dB |
| VCSL | congas, claps, glockenspiel, bass drum | stereo | +0.82 to +0.99 | +0.59 to +0.85 | 0 to -0.6 dB |
| VSCO 2 CE | double bass pizz; upright piano | stereo | +0.66; +0.19 | -0.05; +0.22 | -1.0; -3.3 dB |
| jRhodes GM | Rhodes | mono | | | |
| legato_vocal_tutorial | the singer's "a" | stereo | +0.98 | +0.90 | 0.0 dB |

## Drum machine: each pad (the normal hit, as the builder mixes it)

| Kit | Pad | corr | hi | loss | Decision |
|---|---|---|---|---|---|
| **D** dusty | | | | | rebuild: 5 of 8 pads stereo |
| | THUMP (kick) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | CRACK (snare) | +0.94 | +0.95 | -0.1 dB | stays mono |
| | SHAKER (ch) | +0.03 | -0.02 | -2.9 dB | stereo |
| | TAMB (oh) | -0.18 | -0.18 | -3.9 dB | stereo |
| | CLAP (clap) | +1.00 | +1.00 | -0.0 dB | stays mono |
| | TIMBAL (tom) | +0.48 | +0.04 | -1.7 dB | stereo |
| | BLOCK (rim) | +0.40 | +0.25 | -1.7 dB | stereo |
| | TRIANG (bell) | -0.39 | -0.39 | -4.9 dB | stereo |
| **E** boombap | | | | | rebuild: 6 of 8 pads stereo |
| | KICK (kick) | +0.98 | +0.21 | -0.1 dB | stereo |
| | SNARE (snare) | +0.93 | +0.67 | -0.2 dB | stays mono |
| | HAT (ch) | +0.50 | +0.47 | -1.2 dB | stereo |
| | OPEN (oh) | +0.53 | +0.41 | -1.2 dB | stereo |
| | CLAP (clap) | +0.71 | +0.69 | -0.7 dB | stereo |
| | LOWTOM (tom) | +0.93 | +0.38 | -0.2 dB | stereo |
| | STICK (rim) | +0.66 | +0.46 | -0.8 dB | stereo |
| | SCRTCH (bell) | +0.97 | +0.82 | -0.1 dB | stays mono |
| **G** lofi | | | | | stays (all mono or nearly identical) |
| | SOFT (kick) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | BRUSH (snare) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | TICK (ch) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | SIZZLE (oh) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | CLAP (clap) | +1.00 | +1.00 | -0.0 dB | stays mono |
| | TOM (tom) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | RIM (rim) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | KEYS (bell) | +1.00 | +1.00 | 0.0 dB | stays mono |
| **H** latin | | | | | rebuild: 7 of 8 pads stereo |
| | BOMBO (kick) | +0.99 | +0.89 | -0.0 dB | stays mono |
| | TIMBAL (snare) | +0.34 | -0.05 | -2.0 dB | stereo |
| | GUIRO (ch) | +0.10 | +0.08 | -2.6 dB | stereo |
| | SHAKER (oh) | -0.01 | -0.01 | -3.1 dB | stereo |
| | CLAVE (clap) | +0.15 | +0.09 | -2.4 dB | stereo |
| | CONGA (tom) | +0.86 | +0.50 | -0.5 dB | stereo |
| | BONGO (rim) | -0.12 | +0.30 | -3.5 dB | stereo |
| | AGOGO (bell) | -0.72 | -0.04 | -8.2 dB | stereo |
| **I** live | | | | | rebuild: 8 of 8 pads stereo |
| | KICK (kick) | +1.00 | +0.26 | -0.0 dB | stereo |
| | SNARE (snare) | +0.76 | +0.36 | -0.6 dB | stereo |
| | HAT (ch) | +0.11 | +0.06 | -2.6 dB | stereo |
| | OPEN (oh) | -0.05 | -0.07 | -3.2 dB | stereo |
| | XSTICK (clap) | +0.49 | +0.45 | -1.3 dB | stereo |
| | FLOOR (tom) | +0.88 | -0.07 | -0.3 dB | stereo |
| | RIDE (rim) | -0.00 | +0.08 | -3.0 dB | stereo |
| | CRASH (bell) | -0.05 | -0.07 | -3.2 dB | stereo |
| **J** arena | | | | | rebuild: 7 of 8 pads stereo |
| | KICK (kick) | +0.88 | +0.35 | -0.3 dB | stereo |
| | SNARE (snare) | +0.69 | +0.32 | -0.7 dB | stereo |
| | HAT (ch) | +0.18 | +0.17 | -2.3 dB | stereo |
| | OPEN (oh) | +0.29 | +0.21 | -1.9 dB | stereo |
| | CLAPS (clap) | +0.73 | +0.68 | -0.6 dB | stereo |
| | TOM (tom) | +0.77 | +0.20 | -0.6 dB | stereo |
| | STOMP (rim) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | CRASH (bell) | -0.16 | +0.03 | -3.7 dB | stereo |
| **K** jazzbrush | | | | | rebuild: 1 of 8 pads stereo |
| | KICK (kick) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | BRUSH (snare) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | CHICK (ch) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | SWISH (oh) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | SLAP (clap) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | TOM (tom) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | RIDE (rim) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | BASS (bell) | +0.77 | +0.02 | -0.6 dB | stereo |
| **M** reggae | | | | | rebuild: 5 of 7 pads stereo |
| | KICK (kick) | +1.00 | +0.79 | -0.0 dB | stays mono |
| | SNARE (snare) | +0.93 | +0.79 | -0.2 dB | stays mono |
| | HAT (ch) | +0.10 | +0.07 | -2.6 dB | stereo |
| | OPEN (oh) | -0.17 | -0.14 | -3.8 dB | stereo |
| | TOM (tom) | +0.96 | +0.25 | -0.1 dB | stereo |
| | XSTICK (rim) | +0.25 | +0.60 | -2.0 dB | stereo |
| | SKANK (bell) | +0.49 | +0.01 | -1.4 dB | stereo |
| **N** afrobeat | | | | | rebuild: 5 of 8 pads stereo |
| | KICK (kick) | +1.00 | +0.87 | -0.0 dB | stays mono |
| | SNARE (snare) | +0.93 | +0.83 | -0.1 dB | stays mono |
| | SHAKER (ch) | +0.08 | +0.08 | -2.7 dB | stereo |
| | OPEN (oh) | -0.17 | -0.14 | -3.8 dB | stereo |
| | DJEMBE (clap) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | CONGA (tom) | +0.85 | +0.64 | -0.4 dB | stereo |
| | STICKS (rim) | -0.21 | -0.21 | -4.0 dB | stereo |
| | BELL (bell) | -0.46 | -0.00 | -5.3 dB | stereo |
| **O** marching | | | | | rebuild: 6 of 8 pads stereo |
| | BASS (kick) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | SNARE (snare) | +0.67 | -0.03 | -0.8 dB | stereo |
| | CLICK (ch) | +0.08 | -0.02 | -2.7 dB | stereo |
| | CYMBAL (oh) | +0.64 | +0.46 | -0.9 dB | stereo |
| | ROLL (clap) | +0.75 | +0.12 | -0.6 dB | stereo |
| | TENOR (tom) | +0.10 | -0.03 | -2.6 dB | stereo |
| | RIM (rim) | +0.06 | -0.04 | -2.8 dB | stereo |
| | BELLS (bell) | +0.91 | +0.91 | -0.2 dB | stays mono |
| **P** studio | | | | | rebuild: 5 of 8 pads stereo |
| | KICK (kick) | +0.99 | +0.58 | -0.0 dB | stays mono |
| | SNARE (snare) | +0.99 | +0.94 | -0.0 dB | stays mono |
| | HAT (ch) | +0.78 | +0.77 | -0.5 dB | stereo |
| | OPEN (oh) | +0.75 | +0.68 | -0.6 dB | stereo |
| | XSTICK (clap) | +0.86 | +0.74 | -0.3 dB | stereo |
| | FLOOR (tom) | +0.98 | +0.72 | -0.0 dB | stays mono |
| | RIDE (rim) | +0.24 | +0.24 | -2.1 dB | stereo |
| | CRASH (bell) | -0.10 | +0.06 | -3.5 dB | stereo |
| **Q** bigroom | | | | | rebuild: 7 of 8 pads stereo |
| | KICK (kick) | +0.89 | +0.38 | -0.3 dB | stereo |
| | SNARE (snare) | +0.91 | +0.62 | -0.2 dB | stays mono |
| | HAT (ch) | +0.26 | +0.25 | -2.0 dB | stereo |
| | OPEN (oh) | +0.23 | +0.15 | -2.1 dB | stereo |
| | HITOM (clap) | +0.70 | -0.08 | -0.7 dB | stereo |
| | FLOOR (tom) | +0.85 | +0.18 | -0.3 dB | stereo |
| | RIDE (rim) | +0.10 | +0.12 | -2.6 dB | stereo |
| | CRASH (bell) | -0.15 | +0.03 | -3.7 dB | stereo |
| **R** bigband | | | | | rebuild: 7 of 8 pads stereo |
| | KICK (kick) | +0.94 | +0.39 | -0.1 dB | stereo |
| | SNARE (snare) | +0.98 | +0.85 | -0.1 dB | stays mono |
| | HAT (ch) | +0.69 | +0.66 | -0.7 dB | stereo |
| | OPEN (oh) | +0.63 | +0.52 | -0.9 dB | stereo |
| | PEDAL (clap) | +0.73 | +0.70 | -0.6 dB | stereo |
| | TOM (tom) | +0.91 | +0.11 | -0.2 dB | stereo |
| | RIDE (rim) | +0.20 | +0.19 | -2.2 dB | stereo |
| | SIZZLE (bell) | +0.28 | +0.29 | -2.0 dB | stereo |
| **S** prog | | | | | rebuild: 6 of 8 pads stereo |
| | KICK (kick) | +0.99 | +0.37 | -0.0 dB | stereo |
| | SNARE (snare) | +0.97 | +0.85 | -0.1 dB | stays mono |
| | HAT (ch) | +0.67 | +0.64 | -0.8 dB | stereo |
| | OPEN (oh) | +0.55 | +0.49 | -1.1 dB | stereo |
| | HITOM (clap) | +0.91 | +0.11 | -0.2 dB | stereo |
| | MIDTOM (tom) | +0.90 | +0.38 | -0.2 dB | stereo |
| | FLOOR (rim) | +0.96 | +0.55 | -0.1 dB | stays mono |
| | CRASH (bell) | -0.04 | +0.09 | -3.2 dB | stereo |
| **T** groovemetal | | | | | rebuild: 6 of 8 pads stereo |
| | KICK (kick) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | SNARE (snare) | +0.80 | +0.48 | -0.4 dB | stereo |
| | HAT (ch) | +0.80 | +0.78 | -0.5 dB | stereo |
| | OPEN (oh) | +0.72 | +0.63 | -0.7 dB | stereo |
| | CHINA (clap) | +0.39 | +0.31 | -1.6 dB | stereo |
| | TOM (tom) | +0.96 | +0.61 | -0.1 dB | stays mono |
| | RIDE (rim) | +0.30 | +0.27 | -1.9 dB | stereo |
| | CRASH (bell) | -0.04 | +0.09 | -3.2 dB | stereo |
| **U** jazzclub | | | | | rebuild: 8 of 8 pads stereo |
| | KICK (kick) | +1.00 | +0.19 | -0.0 dB | stereo |
| | SNARE (snare) | +0.73 | +0.28 | -0.6 dB | stereo |
| | HAT (ch) | +0.11 | +0.06 | -2.6 dB | stereo |
| | OPEN (oh) | +0.00 | +0.00 | -3.0 dB | stereo |
| | PEDAL (clap) | +0.17 | +0.02 | -2.3 dB | stereo |
| | TOM (tom) | +0.95 | +0.14 | -0.1 dB | stereo |
| | RIDE (rim) | -0.02 | +0.08 | -3.1 dB | stereo |
| | CRASH (bell) | -0.07 | -0.07 | -3.3 dB | stereo |
| **V** brushes | | | | | stays (all mono or nearly identical) |
| | KICK (kick) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | SNARE (snare) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | CHICK (ch) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | OPEN (oh) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | STIR (clap) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | TOM (tom) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | RIDE (rim) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | FLUTTR (bell) | +1.00 | +1.00 | 0.0 dB | stays mono |
| **W** funk | | | | | rebuild: 6 of 8 pads stereo |
| | KICK (kick) | +1.00 | +0.90 | -0.0 dB | stays mono |
| | SNARE (snare) | +0.95 | +0.84 | -0.1 dB | stays mono |
| | HAT (ch) | +0.10 | +0.07 | -2.6 dB | stereo |
| | OPEN (oh) | -0.03 | -0.00 | -3.2 dB | stereo |
| | XSTICK (clap) | +0.42 | +0.70 | -1.5 dB | stereo |
| | TOM (tom) | +0.76 | +0.24 | -0.6 dB | stereo |
| | RIDE (rim) | -0.04 | +0.10 | -3.2 dB | stereo |
| | CRASH (bell) | -0.11 | +0.01 | -3.5 dB | stereo |
| **X** vintage70 | | | | | rebuild: 1 of 8 pads stereo |
| | KICK (kick) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | SNARE (snare) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | HAT (ch) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | OPEN (oh) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | TOM (clap) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | FLOOR (tom) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | PEDAL (rim) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | CRASH (bell) | -0.16 | +0.03 | -3.7 dB | stereo |
| **Y** break | | | | | rebuild: 1 of 8 pads stereo |
| | KICK (kick) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | SNARE (snare) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | HAT (ch) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | OPEN (oh) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | XSTICK (clap) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | TOM (tom) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | FLOOR (rim) | +1.00 | +1.00 | 0.0 dB | stays mono |
| | CRASH (bell) | -0.16 | +0.03 | -3.7 dB | stereo |
