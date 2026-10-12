# Split a song: on the shelf (AOG-STEMS-SHELF-V1, 2026-10-12)

Jimmy: "Take this off the website. Let us shelf it for the time being."

Split a song into its parts (drums, bass, voice and the rest) is hidden on the site and its heavy files are kept here,
outside `aog-deploy/`, so Netlify does not publish them.

- `models/stems/scnet-v1/` – the SCNet model (MIT), 11.9 MB, with its CREDITS.
- `vendor/onnxruntime-web-1.30.0/` – onnxruntime-web (MIT), 40 MB.

The code stays in the site but is never loaded or shown: `aog-stems.js`, `aog-stems-ai.js`, and the callers in
`music-decks.html`, `aog-learn-ui.js` and `music-studio.html`. Each caller has `STEMS_ON = false` (the Mixing Desk:
`#splitBlk` hidden). The Turntables' CSS hides `.prow`, `[data-pline]`, `.pcrow` and `.pmore`.

To bring it back:
1. `git mv shelf/stems-ai/models aog-deploy/models` and
   `git mv shelf/stems-ai/vendor/onnxruntime-web-1.30.0 aog-deploy/vendor/`.
2. Set `STEMS_ON = true` in `music-decks.html` and `aog-learn-ui.js`, and remove the hiding CSS rule there
   (AOG-STEMS-SHELF-V1). In `music-studio.html`, remove `hidden style="display:none"` from `#splitBlk`.
3. Put `stems/split`, `stems/ai` and `stems/real` back in ALL in `music-handoff/tests/run.sh`.
4. Run `python3 tools/build-fast.py`, the stems tests and the usual checks, then bump the cache.

Known when shelved: on Jimmy's iPad the parts sounded bad. A 48 kHz resampling fault was found and fixed (#442), but
the fix was not heard on the iPad before the shelf. Listening clips: `music-handoff/stems-listen/`.
