# The Adult Edition — build sources (not published)

This folder sits outside `aog-deploy/`, so Netlify never serves it.

| Page | Address | How it is made |
|---|---|---|
| `adult-edition.html` | `/adult` | Hand-written. Run `stamp.py` after editing a copy that still has `@@FIRSTPAINT@@`. |
| `adult-workbook.html` | `/adult/workbook` | Hand-written (same stamp). Every page is open; Sessions 7–12 say to check in first. |
| `adult-curriculum.html` | `/adult/curriculum` | `python3 adult-build/build_curriculum.py /path/to/book6.json` — the whole manual, open |
| `adult-anchors.html` | `/adult/anchors` | `python3 adult-build/build_anchors.py /path/to/book6.json` |
| `adult-sessions.html` | `/adult/sessions` | `python3 adult-build/build_sessions.py --book /path/to/book6.json` — open, no key |

`book6.json` is the whole facilitator manual, the source the pages are built from. It is not committed;
it travels in the Adult Edition zip, made by `parse_book6.py` from `AoG_Book6_Adult_Edition_ENHANCED.docx`.

- **Nothing is locked** (Jimmy, 2026-10-10: "ITS ALL FREE ... Nothing is locked"). The console has no key
  and no encryption, and the workbook has no word for Sessions 7–12.
- The workbook sends only through the facilitator's own link (`?dest=`), made on the console's
  first panel. There is no fallback Sheet. The Arrival Letter and Backpack lines are never sent.
