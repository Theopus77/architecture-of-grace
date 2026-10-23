# The Book 3 novel in Spanish (AOG-R36-V1)
Source: `aog-deploy/novels/room-36.json` → `sections[i]` (kind, title, kicker, blocks[{k, t, h}]).
For each section index i you are given, write `aog-deploy/novels/room-36.es/s<i>.json`: the same object, translated:
- `kind` unchanged; `title` and `kicker` in Spanish; `blocks`: same count, same order, same `k`; `t` = the Spanish plain
  text; `h` = the same Spanish with the SAME inline HTML tags as the English `h` (only <em>, <strong>, <br> etc. as they
  appear; never add others). `k: "break"` blocks stay exactly as they are.
- Literary Spanish for 11–14-year-olds and their families: neutral Latin American Spanish, warm, natural dialogue (tú
  between kids; usted where an adult and child would use it), faithful — never add, cut, soften or change a fact, a
  name, an event, a feeling or a safety line. Keep names as they are (Amara, Marcus, Priya, Kezia, Darius, Mr. Patel →
  "el señor Patel", Ms. Calloway → "la señora Calloway"). Keep "Room 36" as "el Salón 36". Crisis numbers unchanged.
- The curriculum's key terms, the same everywhere: the Mask / the Mirror → la Máscara / el Espejo; the Internal Critic →
  el Crítico Interior; the Friend Test → la Prueba del Amigo; the Compassionate Witness → el Testigo Compasivo; the
  Digital Backpack → la Mochila Digital; the Letter of Release → la Carta de Liberación; Grace → la gracia; the Grace
  Challenge → el Reto de la Gracia; Charitable Interpretation → la Interpretación Generosa; the Wall → el Muro;
  guilt / shame → culpa / vergüenza; Impact vs. Intent → Impacto vs. Intención.
- Check: `python3 _work/sel/r36/novel_es_check.py <i> [<i> …]` (from aog-deploy/) must print OK for each.
- Write each file with the Write tool (UTF-8, real accents), or a long section in parts merged by a small script in the
  scratchpad. Touch no other file; no git. Reply with one line per section: `s<i> OK`.
