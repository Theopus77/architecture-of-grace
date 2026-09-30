# The Sheet script

- `aog-deploy/AoG-Sheet-Sync-Code.gs` is the copy people download and paste into Apps Script. It has no comments.
- `AoG-Sheet-Sync-Code.annotated.gs` (this folder) is the same code with every note. It is not published.

Edit the annotated copy, then make the plain copy from it with terser (`compress:false, mangle:false`,
`comments:false`), run prettier, and put `// Architecture of Grace · Sheet sync · v<N>` on top. Both must compile
to the same code. Keep `SCRIPT_VERSION` in step with `GS_V` in `dashboard.html` and `EXPECTED` in `index.html`.
