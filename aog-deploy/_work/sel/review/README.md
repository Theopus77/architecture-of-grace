# The SEL curriculum review — 2026-09-26

Jimmy: "Since we have the team together — the top 1% — LET US review and edit the
curriculum material as well!"

Six editors read everything: one per room (curriculum page, all 28 lessons, the
scenario cards, the companion workbook, the worksheets, the anchor charts, and the
room's novel) and one who read all six novels as a series. Their full reports sit
beside this file. Every finding carries an exact quote and the proposed replacement.

## What has been applied (on the branch, one commit per room)

Only rows the editors marked **sure**: wrong names, wrong chapters, wrong numbers,
broken sentences, dangling references, placeholder text, spellings, timing that
did not add up. The review's exact wording was used. Nothing marked "judgment
call" was touched. The novels' text was not touched.

| Room | Applied | Held for Jimmy |
|---|---|---|
| 12 (K–2) | Crosswalk and marker guide match the novel (Ch. 15 Priya, Ch. 23 Sofia/Wyatt, Ch. 25, Real Sorry = did/hurt/change, basket on the windowsill, first *student* card); 14 crosswalk rows use the lesson's own title; dangling "Section 1.6 / Section 4"; unbalanced quotes; card Unit 4 renumbered so lesson doors work; 34 cards; ★★ on cards 3-E/3-F; workbook Ms. Calloway wore the backpack; charts PPRA labels | Future-self letters: novel says January→June, lessons/workbook/charts say December→May — pick one. ★ headers and crisis line on 2.4, 2.5, 3.5, 4.7. K–2 fit of several cards (group text, "charitable interpretation", "counselor encouraged him to forgive"). |
| 18 (3–5) | Crosswalk and marker guide were written against an earlier draft (fourth grade, "Ch. 34", scenes that are not in the book); they now match the novel, with real lesson and chart names and links; the four unit crosswalk tables on the lessons page regenerated; December letters; WS8 debrief timing; "Do not tell anyone"; eight full minutes | **The scenario-card deck and the cards embedded in the lessons disagree under the same IDs** (1-K, 1-L, 4-E…4-L: different characters). Pick the canonical deck; the workbook why-notes quote the lesson versions. Softenings: "impoverished models of compassion at home", "autistic brains", "Nadia is a perfectionist". |
| 36 (6–8) | Crosswalk matches the novel (seven-day Grace Challenge, Mia in May, eighth grade next year); Letter of Release template is the novel's four sections; one boundary formula; star levels; U2·L7 timing and journals; U4·L6 duplicate; U4·L2's missing Cards step; US spellings; card 1-E restored; card codes; dashes | **"Grace Gap" has two incompatible definitions** (crosswalk/workbook vs U4·L6 lesson and chart). "Toxic perfectionism" on w5. "Stops eating properly" card cue. |
| 104 (9–10) | Crosswalk matches the novel (Pepper does not die in Book 4; the brush is Maya's; Ch. 4, 8, 9, 11, 13, 14, 17, 18, 19, 20); truncated headings; five step headings split on a quote; "The Façade"; three-step Pause; U4·L6 writing time; index-card ritual scripted; card unit names | **The crosswalk, routing tables and Unit 3–4 card deck cite lessons, charts and cards that do not exist** on the lessons page (a different edition). Two Identity Shields and two Backpack Audits ship in the same lessons. ★ flags look inverted (Ch. 1/3 flagged; the Ch. 13 Wall cards unflagged). 16 of 56 cards are about seniors/college. |
| 207 (11–12) | See the Room 207 report; applied rows are listed in that commit | Crosswalk describes a different novel (see report §2); the card deck follows an older lesson list; Unit 2 has two names; three Compass of Integrity layouts; permanent-chart drift; U2·L3 indicator rule under-weights self-harm. |

Two things were fixed at once, before the reports were even compiled, because they
were safety matters: six worksheets that say "never collected" carried a FINISHED
station that sent the work to the teacher (now they send nothing), and the Room 12
drawing sheets sent the drawing with FINISHED (now only the typed answers go).

The workbook answer keys were A on 177 of 181 questions across the five rooms. They
are re-keyed by `_work/sel/workbook_shuffle.py` (words unchanged; letters, why-notes
and printed keys re-lettered together).

## The novels — yours to decide

The series editor's report (novels.md, ~120 items) is an error pass, not a rewrite.
None of it has been applied: it is your fiction. The ones that matter most:

1. **Book 6 turns Aaliyah into a neighbour** who moved away; in Books 1–5 she is
   Marcus's sister. A fix that keeps the chapter's mechanism is proposed.
2. **Pepper dies twice** (Book 5 senior year; Book 6 "the year before" they were 22),
   and Hope the puppy is forgotten.
3. **Maya's household** flips between grandmother and mother/parents; a brother
   appears once; the grandfather's brush is given twice by two people.
4. **Kezia's family** changes shape three times; Book 6 names a father and re-opens a
   line Book 5 closed.
5. **Mia** moves to a city "where she knew no one" — Pittsburgh, where she grew up.
6. Teacher tenures and roles drift (Ms. Calloway 14 vs 30 years; Mr. Patel's history).
7. Arithmetic: ages, grades, "five books" when there are six, chapters-left counts.
8. Five part captions are truncated mid-sentence; a few stray asterisks.
9. Safety: Books 4–6 self-harm content follows safe messaging; two small additions
   suggested (clinical care made explicit for Sofia; a 988 line in Book 6's front).

When you decide, say "apply the novel fixes" (all, or by number) and they go into
the manuscripts' JSON with the same care as the room edits.
