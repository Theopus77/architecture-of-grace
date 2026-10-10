# The Adult Edition — build sources (not published)

This folder sits outside `aog-deploy/`, so Netlify never serves it.

| Page | Address | How it is made |
|---|---|---|
| `adult-edition.html` | `/adult` | Hand-written. Run `stamp.py` after editing a copy that still has `@@FIRSTPAINT@@`. |
| `adult-workbook.html` | `/adult/workbook` | Hand-written (same stamp). The gate word is stored as a hash: `GATE = h32(word)`. |
| `adult-anchors.html` | `/adult/anchors` | `python3 adult-build/build_anchors.py /path/to/book6.json` |
| `adult-sessions.html` | `/adult/sessions` | `python3 adult-build/build_sessions.py --key <key> --gate <word> --book /path/to/book6.json` |

`book6.json` is the whole facilitator manual. **It is never committed** (this repo is public; the
console is encrypted precisely so the manual is not). It travels in the Adult Edition zip, made by
`parse_book6.py` from `AoG_Book6_Adult_Edition_ENHANCED.docx`.

- **The facilitator key and the workbook word are never written in this repo** (it is public; the key
  is what keeps the manual private). Jimmy holds both. Change the key by rebuilding the console.
- The workbook word for Sessions 7–12 appears only inside the encrypted console. To change it, rebuild the console with `--gate <word>` AND put `h32(<word>)` in the workbook's `GATE`.
- The workbook sends only through the facilitator's own link (`?dest=`), made on the console's
  first panel. There is no fallback Sheet. The Arrival Letter and Backpack lines are never sent.
