# Gospel voices (AOG-GOSPEL-V1, 2026-10-26)

Jimmy: "Can you make gospel vocal samples for the studio". Two records in the turntables' crate, sixteen samples each,
one on each pad (kind "gospel": the Turntables show them in their own Gospel voices box, the Drum Machine puts them on
bank D, its chops bank, with pads 17 to 24 playing them two at a time):

- `39-gospel-choir.mp3`, Gospel Choir: a choir in C made from the twenty real singers of VocalSet (CC BY 4.0). "Oh!"
  hits on C, F, Am7 and F/G; "Aah" swells on Cmaj9 and Fmaj9; "Ooh" pads on C6/9 and Dm9; the Amen chords (F to C);
  the parts coming in one at a time; the women alone and the men alone; a walk-up (C, C/E, F, F#dim7, C/G) and a call
  home (F/G to C) at 100 BPM; a high "Ee!"; the big ending. `make_choir.py`.
- `40-jubilee-voices.mp3`, Jubilee Voices: a line from each of sixteen spirituals sung by the Fisk Jubilee Singers on
  records from 1909 to 1924 (Library of Congress National Jukebox, public domain). Each pad is named by its song.
  `make_jubilee.py`.

Get the sources into one scratch folder each:

- VocalSet: `source/vocalset/<singer>_long_straight_<vowel>.wav` for singers f1–f9 and m1–m11 and vowels a e i o u
  (100 files) from raw.githubusercontent.com/mblackman/vocalset-vowel-voicebanks/main/.
- The Fisk records: each id in `SONGS` (make_jubilee.py) from archive.org/download/<id>/ (its one .mp3), saved as
  `<id>.mp3`.

Then `python3 make_choir.py <vocalset folder>`, `python3 make_jubilee.py <fisk folder>` (each writes its record and its
crate entry) and `python3 add_to_crate.py`. If a record changes length or level, measure it again with
`music-handoff/tests/pads/level.js --table` and copy its new trim into LEVEL.rec in `music-pads.html`.

Neither was heard by a person before it went up: the chords were checked by their notes (every pad holds the notes of its
chord), the cuts by pictures of the sound and by a check for pops. Listen, and change a cut in `SONGS` if a line starts or
ends badly.
