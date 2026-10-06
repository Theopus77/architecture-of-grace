# JFK's and Reagan's speeches (AOG-SPEECHES-V1, 2026-10-06)

Jimmy picked "JFK and Reagan" for the next speech records. Four records, sixteen lines each, one line per pad:

- `28-jfk-ask-not.mp3`: the Inaugural Address (January 20, 1961), from "a celebration of freedom" to "God's work must truly
  be our own", with "ask not what your country can do for you". JFK Library recording on archive.org
  (`JohnF.KennedyInauguralAddress`, marked public domain).
- `29-jfk-we-choose-the-moon.mp3`: the Rice University address (September 12, 1962), from "we stand in need of all three"
  to "we're going to climb it", with "we choose to go to the Moon … not because they are easy, but because they are hard".
  Film on archive.org (`president-john-f.-kennedy-09-12-1962`, marked public domain); the sound track was taken from it.
- `30-reagan-challenger.mp3`: the address to the nation on the Challenger (January 28, 1986), from "a day for mourning and
  remembering" to "slipped the surly bonds of earth to touch the face of God". Reagan Library recording, National Archives
  ID 7087577 (reagan-PP6028B.mp3), unrestricted.
- `31-reagan-tear-down-this-wall.mp3`: the Brandenburg Gate address (June 12, 1987), from "Ich hab noch einen Koffer in
  Berlin" to "the wall cannot withstand freedom", with "Mr. Gorbachev, open this gate" and "tear down this wall". Reagan
  Library recording, National Archives ID 7087579 (reagan-PP7163C.mp3), unrestricted. Only the second "Mr. Gorbachev"
  is used: the first is under the applause.
- `32-trump-prayer-breakfast.mp3`: Donald J. Trump at the National Prayer Breakfast, U.S. Capitol (February 6, 2025),
  from "faith in God has always been the ultimate source of strength" to "bring God back into our lives", with Paul's "let us
  not grow weary of doing good". White House video on archive.org (`youtube-lW7J_pDS584`).
- `33-trump-america-is-back.mp3`: the Address to a Joint Session of Congress (March 4, 2025), from "America is back" to "the
  golden age of America has only just begun". White House video on archive.org (`youtube-XkFKNkAEzQ8`). Jimmy asked for
  "any President Trump"; these two were the White House's own recordings reachable from here (whitehouse.gov,
  trumplibrary.gov and YouTube are not). `trump.py` holds their lines.

The presidential libraries' own sites are not reachable from the build machine; the National Archives catalog
(catalog.archives.gov/proxy/records/search) and archive.org are. Each line was placed from pocketsphinx word times
(`fdr/tx.py`), phrase searches (`fdr/kws.py`) and the dips in the sound between phrases, then checked by running the
recognizer again on every cut pad. `build.py` (with `berlin.py`) builds all four into `out/` and writes `speeches.json`,
their crate entries (kind "speech": the Turntables show them in the Speeches box, the Drum Machine puts them on bank D).
