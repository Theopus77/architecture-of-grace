# FDR's speeches (AOG-FDR-V1, 2026-10-06)

Jimmy asked for "important political or Christ like speeches that can be cut up for records". Two records of
Franklin D. Roosevelt's own voice, from the FDR Library's online recordings (fdrlibrary.org/utterancesfdr):

- `26-the-d-day-prayer.mp3`: the D-Day Prayer (June 6, 1944), sixteen lines from "Almighty God" to
  "Thy will be done, Almighty God. Amen." The prayer's text (FDR Library) was aligned word by word to the
  recording with pocketsphinx (`align.py` -> `al290.json`); each pad is one line, cut at its first and last word.
- `27-fdr-words-of-courage.mp3`: sixteen lines from the First Inaugural (1933: "the only thing we have to fear is
  fear itself"), the Address to Congress (1941: "a date which will live in infamy", "in their righteous might",
  "so help us God") and the 1941 State of the Union (the four freedoms). These broadcasts are too noisy for
  word alignment, so each line was placed from the recognizer's word times, phrase searches (`kws.py`) and the
  dips in the sound between phrases (see `fdrbuild.py` for the times).

`fdrbuild.py` builds both; `fdr.json` is their crate entry (kind "speech": the Turntables show them in their own
Speeches box). The recordings are U.S. government works, listed by the National Archives as unrestricted.
