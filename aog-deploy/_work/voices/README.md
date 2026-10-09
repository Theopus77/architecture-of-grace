# Famous voices (AOG-VOICES-V1, 2026-10-09)

Jimmy: "Removing ourselves from the biblical and presidential speeches, what other famous speeches / voices can we
gather onto the vinyl", then "Everything except NASA". Four records, sixteen lines each, one line per pad, all read by
LibriVox volunteers (public domain):

- `35-great-speeches.mp3`: Patrick Henry ("Give me liberty, or give me death!"), Danton ("Dare, dare again, always
  dare"), Luther ("Here I stand"), Logan's Lament, Susan B. Anthony ("Are women persons?"). `speeches.py`.
- `36-poems-with-a-beat.mp3`: Casey at the Bat, O Captain! My Captain!, Paul Revere's Ride, The Raven. `poems.py`.
  Invictus was left out: archive.org only returns an error page for its files.
- `37-shakespeare.mp3`: Henry V, Julius Caesar, Romeo and Juliet, Macbeth, "All the world's a stage". `shakespeare.py`.
  Hamlet was left out: its Act 3 files never finished downloading from here.
- `38-voces-en-espanol.mp3`: Don Quijote (the opening, the windmills), Bécquer (Rimas XXI, XXIII, LIII), Rubén Darío
  (Canción de otoño en primavera, Marcha triunfal), José Martí (Tres héroes, Versos sencillos V). `spanish.py`.

The English lines were placed from pocketsphinx word times (`../fdr/tx.py`) and phrase searches (`../fdr/kws.py`), then
checked by running the recognizer again on every cut pad. There is no Spanish speech model here, so each Spanish line
was found by its sounds (`../scripture/es/esfind.py`, scanned over the reading) and then checked against the reader's
pauses: a line must start and end in a pause, and its pieces must fall where the poem's lines fall. A last check matches
every finished pad against all sixteen lines; fourteen pick their own line. Rima XXI's first line and Rima XXIII do not
(the sound matcher hears these readers poorly), so they were placed by the pauses between their neighbours, which match
strongly (Rima XXII's "¿Cómo vive esa rosa…" sits right between them). Two readers agree on the same layout.

Run `python3 build.py` from the scratch folder that holds `fv/` (the downloaded readings) and `build3.py`; it writes the
four records and `voices.json` (their crate entries, kind "speech": the Turntables show them in the Speeches box, the
Drum Machine puts them on bank D) to `out/`. `../crate/make_crate.py` adds `voices.json` to the crate.
