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
nearly identical, stay as they are. The builders apply this rule themselves
(tools/drumkits/build.py and pt/build_pt.py, AOG-DRUM-STEREO-V1); the per-pad numbers below are
theirs (2nd-order 2 kHz high-pass; kit T's kick includes its beater click from the overheads).

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
| **D** dusty | | | | | rebuilt: 5 of 8 pads stereo, folder dusty2 |
| | THUMP (kick) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | CRACK (snare) | +0.97 | +0.97 | -0.1 dB | nearly identical sides: as it was |
| | SHAKER (ch) | +0.03 | -0.02 | -2.9 dB | STEREO |
| | TAMB (oh) | -0.18 | -0.18 | -3.9 dB | STEREO |
| | CLAP (clap) | +1.00 | +1.00 | -0.0 dB | nearly identical sides: as it was |
| | TIMBAL (tom) | +0.48 | +0.03 | -1.7 dB | STEREO |
| | BLOCK (rim) | +0.40 | +0.25 | -1.7 dB | STEREO |
| | TRIANG (bell) | -0.39 | -0.37 | -4.9 dB | STEREO (trim -1.7 dB) |
| **E** boombap | | | | | rebuilt: 5 of 8 pads stereo, folder boombap2 |
| | KICK (kick) | +0.99 | +0.35 | -0.1 dB | STEREO |
| | SNARE (snare) | +0.96 | +0.82 | -0.2 dB | nearly identical sides: as it was |
| | HAT (ch) | +0.67 | +0.65 | -1.2 dB | STEREO |
| | OPEN (oh) | +0.67 | +0.59 | -1.2 dB | STEREO |
| | CLAP (clap) | +0.71 | +0.69 | -0.7 dB | STEREO |
| | LOWTOM (tom) | +0.96 | +0.54 | -0.2 dB | nearly identical sides: as it was |
| | STICK (rim) | +0.78 | +0.63 | -0.8 dB | STEREO |
| | SCRTCH (bell) | +0.98 | +0.96 | -0.1 dB | nearly identical sides: as it was |
| **G** lofi | | | | | stays (mono microphones) |
| | SOFT (kick) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | BRUSH (snare) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | TICK (ch) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | SIZZLE (oh) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | CLAP (clap) | +1.00 | +1.00 | -0.0 dB | mono microphones: as it was |
| | TOM (tom) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | RIM (rim) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | KEYS (bell) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| **H** latin | | | | | rebuilt: 7 of 8 pads stereo, folder latin2 |
| | BOMBO (kick) | +0.99 | +0.88 | -0.0 dB | nearly identical sides: as it was |
| | TIMBAL (snare) | +0.34 | -0.05 | -2.0 dB | STEREO |
| | GUIRO (ch) | +0.10 | +0.06 | -2.6 dB | STEREO |
| | SHAKER (oh) | -0.01 | -0.01 | -3.1 dB | STEREO |
| | CLAVE (clap) | +0.15 | +0.02 | -2.4 dB | STEREO |
| | CONGA (tom) | +0.86 | +0.49 | -0.5 dB | STEREO |
| | BONGO (rim) | -0.12 | +0.28 | -3.5 dB | STEREO |
| | AGOGO (bell) | -0.72 | -0.04 | -8.2 dB | STEREO |
| **I** live | | | | | rebuilt: 8 of 8 pads stereo, folder live2 |
| | KICK (kick) | +1.00 | +0.29 | -0.0 dB | STEREO |
| | SNARE (snare) | +0.82 | +0.51 | -0.6 dB | STEREO |
| | HAT (ch) | +0.11 | +0.07 | -2.6 dB | STEREO |
| | OPEN (oh) | -0.05 | -0.04 | -3.2 dB | STEREO |
| | XSTICK (clap) | +0.61 | +0.62 | -1.3 dB | STEREO |
| | FLOOR (tom) | +0.88 | -0.08 | -0.3 dB | STEREO |
| | RIDE (rim) | -0.00 | +0.08 | -3.0 dB | STEREO |
| | CRASH (bell) | -0.05 | -0.06 | -3.2 dB | STEREO |
| **J** arena | | | | | rebuilt: 7 of 8 pads stereo, folder arena2 |
| | KICK (kick) | +0.93 | +0.49 | -0.3 dB | STEREO |
| | SNARE (snare) | +0.81 | +0.49 | -0.7 dB | STEREO |
| | HAT (ch) | +0.31 | +0.31 | -2.3 dB | STEREO |
| | OPEN (oh) | +0.46 | +0.38 | -1.9 dB | STEREO |
| | CLAPS (clap) | +0.73 | +0.66 | -0.6 dB | STEREO |
| | TOM (tom) | +0.86 | +0.30 | -0.6 dB | STEREO |
| | STOMP (rim) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | CRASH (bell) | -0.10 | +0.06 | -3.7 dB | STEREO |
| **K** jazzbrush | | | | | rebuilt: 1 of 8 pads stereo, folder jazzbrush2 |
| | KICK (kick) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | BRUSH (snare) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | CHICK (ch) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | SWISH (oh) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | SLAP (clap) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | TOM (tom) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | RIDE (rim) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | BASS (bell) | +0.77 | +0.08 | -0.6 dB | STEREO |
| **M** reggae | | | | | rebuilt: 5 of 7 pads stereo, folder reggae2 |
| | KICK (kick) | +1.00 | +0.88 | -0.0 dB | nearly identical sides: as it was |
| | SNARE (snare) | +0.96 | +0.89 | -0.2 dB | nearly identical sides: as it was |
| | HAT (ch) | +0.10 | +0.08 | -2.6 dB | STEREO (trim -0.6 dB) |
| | OPEN (oh) | -0.17 | -0.12 | -3.8 dB | STEREO |
| | TOM (tom) | +0.96 | +0.20 | -0.1 dB | STEREO |
| | XSTICK (rim) | +0.50 | +0.77 | -2.0 dB | STEREO |
| | SKANK (bell) | +0.29 | +0.17 | -1.4 dB | STEREO |
| **N** afrobeat | | | | | rebuilt: 5 of 8 pads stereo, folder afrobeat2 |
| | KICK (kick) | +1.00 | +0.93 | -0.0 dB | nearly identical sides: as it was |
| | SNARE (snare) | +0.97 | +0.91 | -0.1 dB | nearly identical sides: as it was |
| | SHAKER (ch) | +0.08 | +0.08 | -2.7 dB | STEREO (trim -0.8 dB) |
| | OPEN (oh) | -0.17 | -0.12 | -3.8 dB | STEREO |
| | DJEMBE (clap) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | CONGA (tom) | +0.85 | +0.65 | -0.4 dB | STEREO |
| | STICKS (rim) | -0.21 | -0.19 | -4.0 dB | STEREO |
| | BELL (bell) | -0.46 | -0.03 | -5.3 dB | STEREO |
| **O** marching | | | | | rebuilt: 6 of 8 pads stereo, folder marching2 |
| | BASS (kick) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | SNARE (snare) | +0.67 | -0.03 | -0.8 dB | STEREO |
| | CLICK (ch) | +0.08 | -0.01 | -2.7 dB | STEREO |
| | CYMBAL (oh) | +0.64 | +0.44 | -0.9 dB | STEREO |
| | ROLL (clap) | +0.74 | +0.10 | -0.6 dB | STEREO |
| | TENOR (tom) | +0.10 | -0.01 | -2.6 dB | STEREO |
| | RIM (rim) | +0.06 | -0.04 | -2.8 dB | STEREO |
| | BELLS (bell) | +0.91 | +0.91 | -0.2 dB | nearly identical sides: as it was |
| **P** studio | | | | | rebuilt: 5 of 8 pads stereo, folder studio2 |
| | KICK (kick) | +0.99 | +0.56 | -0.0 dB | nearly identical sides: as it was |
| | SNARE (snare) | +0.99 | +0.95 | -0.0 dB | nearly identical sides: as it was |
| | HAT (ch) | +0.78 | +0.77 | -0.5 dB | STEREO (trim -0.7 dB) |
| | OPEN (oh) | +0.75 | +0.69 | -0.6 dB | STEREO |
| | XSTICK (clap) | +0.86 | +0.74 | -0.3 dB | STEREO |
| | FLOOR (tom) | +0.98 | +0.70 | -0.0 dB | nearly identical sides: as it was |
| | RIDE (rim) | +0.24 | +0.24 | -2.1 dB | STEREO |
| | CRASH (bell) | -0.10 | +0.06 | -3.5 dB | STEREO |
| **Q** bigroom | | | | | rebuilt: 7 of 8 pads stereo, folder bigroom2 |
| | KICK (kick) | +0.89 | +0.35 | -0.3 dB | STEREO |
| | SNARE (snare) | +0.91 | +0.65 | -0.2 dB | nearly identical sides: as it was |
| | HAT (ch) | +0.26 | +0.26 | -2.0 dB | STEREO |
| | OPEN (oh) | +0.23 | +0.14 | -2.1 dB | STEREO |
| | HITOM (clap) | +0.70 | -0.08 | -0.7 dB | STEREO |
| | FLOOR (tom) | +0.85 | +0.17 | -0.3 dB | STEREO |
| | RIDE (rim) | +0.10 | +0.13 | -2.6 dB | STEREO |
| | CRASH (bell) | -0.15 | +0.03 | -3.7 dB | STEREO |
| **R** bigband | | | | | rebuilt: 7 of 8 pads stereo, folder bigband2 |
| | KICK (kick) | +0.94 | +0.37 | -0.1 dB | STEREO |
| | SNARE (snare) | +0.98 | +0.86 | -0.1 dB | nearly identical sides: as it was |
| | HAT (ch) | +0.69 | +0.66 | -0.7 dB | STEREO (trim -0.8 dB) |
| | OPEN (oh) | +0.63 | +0.52 | -0.9 dB | STEREO |
| | PEDAL (clap) | +0.73 | +0.71 | -0.6 dB | STEREO (trim -1.1 dB) |
| | TOM (tom) | +0.91 | +0.09 | -0.2 dB | STEREO |
| | RIDE (rim) | +0.20 | +0.19 | -2.2 dB | STEREO |
| | SIZZLE (bell) | +0.28 | +0.29 | -2.0 dB | STEREO |
| **S** prog | | | | | rebuilt: 6 of 8 pads stereo, folder prog2 |
| | KICK (kick) | +0.99 | +0.35 | -0.0 dB | STEREO |
| | SNARE (snare) | +0.97 | +0.86 | -0.1 dB | nearly identical sides: as it was |
| | HAT (ch) | +0.67 | +0.65 | -0.8 dB | STEREO |
| | OPEN (oh) | +0.55 | +0.48 | -1.1 dB | STEREO |
| | HITOM (clap) | +0.91 | +0.09 | -0.2 dB | STEREO |
| | MIDTOM (tom) | +0.90 | +0.37 | -0.2 dB | STEREO |
| | FLOOR (rim) | +0.96 | +0.54 | -0.1 dB | nearly identical sides: as it was |
| | CRASH (bell) | -0.04 | +0.09 | -3.2 dB | STEREO |
| **T** groovemetal | | | | | left exactly as it is, by request (its kick is being rebuilt elsewhere); 7 of 8 pads would qualify for stereo |
| | KICK (kick) | +0.98 | -0.11 | 0.0 dB | as it was |
| | SNARE (snare) | +0.80 | +0.49 | -0.4 dB | as it was |
| | HAT (ch) | +0.80 | +0.78 | -0.5 dB | as it was |
| | OPEN (oh) | +0.72 | +0.64 | -0.7 dB | as it was |
| | CHINA (clap) | +0.39 | +0.30 | -1.6 dB | as it was |
| | TOM (tom) | +0.96 | +0.61 | -0.1 dB | as it was |
| | RIDE (rim) | +0.30 | +0.27 | -1.9 dB | as it was |
| | CRASH (bell) | -0.04 | +0.09 | -3.2 dB | as it was |
| **U** jazzclub | | | | | rebuilt: 8 of 8 pads stereo, folder jazzclub2 |
| | KICK (kick) | +1.00 | +0.20 | -0.0 dB | STEREO |
| | SNARE (snare) | +0.77 | +0.40 | -0.6 dB | STEREO |
| | HAT (ch) | +0.11 | +0.07 | -2.6 dB | STEREO |
| | OPEN (oh) | +0.00 | +0.01 | -3.0 dB | STEREO |
| | PEDAL (clap) | +0.17 | +0.02 | -2.3 dB | STEREO (trim -0.6 dB) |
| | TOM (tom) | +0.95 | +0.12 | -0.1 dB | STEREO |
| | RIDE (rim) | -0.02 | +0.09 | -3.1 dB | STEREO (trim -0.6 dB) |
| | CRASH (bell) | -0.07 | -0.06 | -3.3 dB | STEREO |
| **V** brushes | | | | | stays (mono microphones) |
| | KICK (kick) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | SNARE (snare) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | CHICK (ch) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | OPEN (oh) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | STIR (clap) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | TOM (tom) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | RIDE (rim) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | FLUTTR (bell) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| **W** funk | | | | | rebuilt: 6 of 8 pads stereo, folder funk2 |
| | KICK (kick) | +1.00 | +0.95 | -0.0 dB | nearly identical sides: as it was |
| | SNARE (snare) | +0.97 | +0.92 | -0.1 dB | nearly identical sides: as it was |
| | HAT (ch) | +0.10 | +0.08 | -2.6 dB | STEREO (trim -0.7 dB) |
| | OPEN (oh) | -0.03 | +0.00 | -3.2 dB | STEREO |
| | XSTICK (clap) | +0.64 | +0.84 | -1.5 dB | STEREO |
| | TOM (tom) | +0.76 | +0.20 | -0.6 dB | STEREO |
| | RIDE (rim) | -0.04 | +0.12 | -3.2 dB | STEREO |
| | CRASH (bell) | -0.11 | +0.02 | -3.5 dB | STEREO |
| **X** vintage70 | | | | | rebuilt: 1 of 8 pads stereo, folder vintage70-2 |
| | KICK (kick) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | SNARE (snare) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | HAT (ch) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | OPEN (oh) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | TOM (clap) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | FLOOR (tom) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | PEDAL (rim) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | CRASH (bell) | -0.10 | +0.06 | -3.7 dB | STEREO |
| **Y** break | | | | | rebuilt: 1 of 8 pads stereo, folder break2 |
| | KICK (kick) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | SNARE (snare) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | HAT (ch) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | OPEN (oh) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | XSTICK (clap) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | TOM (tom) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | FLOOR (rim) | +1.00 | +1.00 | 0.0 dB | mono microphones: as it was |
| | CRASH (bell) | -0.10 | +0.06 | -3.7 dB | STEREO |

## What was rebuilt (AOG-DRUM-STEREO-V1)

- **Guitar and bass: nothing.** Every source is mono.
- **Drums: 17 kits** (D E H I J K M N O P Q R S U W X Y) got their stereo pads rebuilt from the
  same takes, with the same mix, shaping, lengths and fades, both sides kept. Mono pads are byte
  for byte the old files. New folders: `<old name>2` (X: `vintage70-2`); the old folders are
  removed. Kits G (lo-fi) and V (brush ballad) use mono microphones only and stay. Kit T (groove
  metal) stays exactly as it was, by request.
- Files: a stereo pad is a 192 kbps joint-stereo MP3 (96 kbps a side, the mono files' rate),
  44.1 kHz. 192 kbps was chosen by measuring the coding error on a crash, a ride, a hi-hat, a
  tambourine, a shaker and a triangle: at 128 or 160 kbps each side came out 2 to 7 dB noisier
  than the 96 kbps mono file; at 192 kbps they match it.
- Levels: each stereo file was brought to the loudness of the file it replaces as both decode
  (K-weighted, loudest 400 ms; stereo = the average of the two sides' power), within 0.2 dB.
  Then every pad of those kits was measured through the drum machine itself (calib.js, a normal
  hit, 1987) before and after: nine pads (D triangle; M, N, P, R, W closed hat; R hi-hat foot;
  U hi-hat foot and ride) came out 0.6 to 1.7 dB louder, because the 8.5 kHz filter chip on
  pads 3 to 8 keeps more of a stereo cymbal than of the old one-channel mix (whose low partials
  had partly cancelled). STEREO_TRIM sets them back; afterwards every pad and the rock beat sit
  within 0.4 dB of where they were.
- Download per kit: 0.31 to 1.30 MB (was 0.20 to 0.71 MB). Decoded memory per kit, page and
  engine together: 13.9 to 59.7 MB (was 8.8 to 32.6 MB); the machine keeps two kits ready.
- A phone or speaker that plays one channel adds the two sides back together, so there a
  rebuilt cymbal sounds as before, a little quieter; through headphones or two speakers it
  sounds as it was recorded.
