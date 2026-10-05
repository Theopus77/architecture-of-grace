# Scripture records (AOG-SCRIPTURE-V1, 2026-10-05)

Jimmy: "Produce some of the best scripture verses … that talk about sanctification
and how Jesus is the only way. King James is fine for the moment."

Two records for the Turntables and the Beat Lab's Chops bank, eight KJV verses each:

- `12-be-ye-holy.mp3`: sanctification (Lev 20:7, Ps 51:10, Ezek 36:26, John 17:17,
  1 Thess 4:7, 1 Thess 5:23, Heb 10:10, 1 Pet 1:16)
- `13-the-only-way.mp3`: Jesus is the only way (Isa 43:11, Isa 45:22, Isa 53:5,
  John 14:6, John 10:9, Acts 4:12, 1 Tim 2:5, John 3:16)

The voices are LibriVox volunteers' KJV readings (public domain), downloaded from
archive.org. The text is Project Gutenberg's KJV (`kjv10.txt`, public domain).

How they were made (scratch work lives outside the repo; the steps):

1. `find.py`: estimates where a verse falls in a chapter recording from the text
   before it, then recognizes ±75 s of speech (pocketsphinx) and finds the stretch
   that best matches the verse.
2. `refine.py`: snaps each verse's start and end to the reader's pauses
   (`OVR` holds the hand-checked ones) and re-recognizes the cut -> `refined.json`.
3. `split.py`: cuts each verse in two at the pause nearest its colon or comma
   -> `split.json`. Each half is one pad.
4. `build.py`: each verse levelled to the same loudness, 0.9 s between verses,
   64 kbps mono mp3, and `scripture.json` (verse starts = deck cues; phrases = pads).
5. `verify.py`: recognizes every phrase in the finished record to check the cuts.

`../crate/make_crate.py` appends `scripture.json` to `crate.json`, so rebuilding the
music crate keeps these records.

Licensing: KJV text and LibriVox recordings are public domain. If the ESV is used
later, the official ESV audio may not be chopped; someone must record the reading,
and the Crossway notice must be shown (up to 500 verses may be quoted).

## The Lord's Prayer (AOG-SCRIPTURE-V2, 2026-10-05)

Jimmy: "The Lord's prayers in English and Spanish."

- `14-the-lords-prayer.mp3`: Matthew 6:9–13, KJV, read by Michael Packard.
- `15-el-padrenuestro.mp3`: Mateo 6:9–13, Reina-Valera 1909, read by Joyfull.

`prayer.py` makes both. Each is one take, cut into sixteen lines at the reader's pauses
(each cut snaps to the quietest 10 ms within 0.25 s), with eight cues for the decks.
There is no Spanish speech model here, so the Spanish cuts were placed by matching
the reading's sounds and pauses line by line, then checked to sit in silence.

## Sed santos and El único camino (AOG-SCRIPTURE-V3, 2026-10-05)

Jimmy: "You can do the other version in Spanish as well."

- `16-sed-santos.mp3` and `17-el-unico-camino.mp3`: the same sixteen verses as Be Ye Holy and
  The Only Way, Reina-Valera 1909, read mostly by Joyfull (LibriVox). Scripts in `es/`.

There is no Spanish speech model here, so `es/esfind.py` turns each verse's Spanish spelling into
speech sounds (ARPAbet), recognizes the reading's sounds with pocketsphinx's phone recognizer, and
finds the best local match (Smith-Waterman). `es/rvsplit.py` cuts each verse in two at the
pause nearest its phrase break. Every start, end and cut was then checked against the loudness of
each 10 ms (`es/emap.py`): a verse must begin and end in a pause, and its cut must fall where the
text says. Four matches ran into the next verse (John 3:16, Isaiah 45:22, Isaiah 53:5) or began a
phrase early (1 Peter 1:16, checked by finding the end of verse 15); their fixed times are in
`es/final.json`. Isaiah 43:11 is short, so it was found together with verse 10.
