#!/usr/bin/env python3
"""Apply the approved series editorial pass to the six novel JSON files."""
import json, html, re, sys, copy

BASE = '/home/user/architecture-of-grace/aog-deploy/novels/'
BOOKS = ['room-12', 'room-18', 'room-36', 'room-104', 'room-207', 'the-dwelling']
BOOKNAME = {'room-12': 'Book 1', 'room-18': 'Book 2', 'room-36': 'Book 3',
            'room-104': 'Book 4', 'room-207': 'Book 5', 'the-dwelling': 'Book 6'}

data = {b: json.load(open(BASE + b + '.json')) for b in BOOKS}
orig = copy.deepcopy(data)
NOTES = [
'', '## Judgment calls made while applying', '',
'- Book 1 ch 14/27 letters: aligned to December → May per the decision (not the report\'s "January Maya" option). "On the last Friday of school" → "On the last Friday of May"; every "June Maya/Marcus/Darius" signature and "June handwriting" → May; "since January" → "since December".',
'- Book 1 ch 22: used novels.md wording ("the way first grade worked") rather than room-12.md\'s "the way things worked".',
'- Book 1 ch 23: used novels.md wording for the phone line ("doesn\'t wave back … They did not hear you.") rather than room-12.md\'s alternative.',
'- Book 1 ch 17 / ch 22 / Book 2 ch 4, 6, 20 charts and tables: pipe tables and fused chart lines were turned into one line per row, joined with an em dash ("Inside you — Between people"); the JSON has no table block kind.',
'- Book 2 ch 10: Hannah → Tasha in every project scene, including the lunch exchange about the drawings (Tasha comes over to the table); Hannah keeps the lunch table. Ch 16 journal: "I cried in front of Tasha and Devon"; item 5 → "Tasha is okay. Devon is okay. Hannah and I are still best friends."',
'- Book 3 ch 3: the parents\'-divorce sentence was deleted (first option) since the next sentence already carries the grandmother\'s illness.',
'- Book 3 ch 13: took the simpler option (letters stay sealed; "reading" → "remembering"; the two hand-back paragraphs deleted).',
'- Book 3 ch 14 Sofia-going-still: used "Marcus, who sat next to her" (the ch 14 alternative) because the next sentence continues with Marcus; ch 3 watcher of Kezia → Theo.',
'- Book 3 ch 1: also changed "who I will see in second period" (Maya) → "fourth period" to match the new schedule line.',
'- Book 3 ch 17: Jordan\'s "for five years" → "for six years" to match "when Jordan was six".',
'- Book 3 ch 22: the two "nineteen years" lines about the end-of-year naming ritual were left; the fix text concerns the letter assignment (ch 7).',
'- Book 3 Note: the Wall sentence now reads "By the end of seventh grade, the Wall will go with them — Ms. Calloway will move it, the summer between seventh and eighth grade, to the eighth-grade hallway." (novels.md and room-36.md agree).',
'- Book 4 Kezia\'s grandmother: took the second option (a line in Book 4 ch 9: "her grandmother, whose memory had steadied after a frightening year in seventh grade") because the first option (dropping Book 3\'s dementia arc) is a rewrite, and the report\'s own ch 21 fix keeps that arc.',
'- Book 4 ch 9/13/18/21: renamed the high-school counselor Ms. Wong → Ms. Okafor everywhere in Book 4 (17 places; Books 5–6 never name her).',
'- Book 4 ch 11: Cole → Tyler in all 40 places in that chapter. Coach Henley → Coach Marsh in all 20 places in Book 4 (ch 18, 20, 21).',
'- Book 4 ch 14: "Iris had been my best friend since the first week of first grade" (not "since kindergarten") to match the Book 2 ch 7 fix, since Amara moved to town just before first grade. The later "Iris did not, in the first weeks of school, have a friend group" sentence was left.',
'- Book 4 ch 15: "Pull over" scene moved to the bench outside Mason\'s; also "sat in the car" → "sat there" and "sit in a car" → "sit on a bench". Used "saving my allowance for it" (§1.14 wording, the first occurrence).',
'- Book 4 ch 19: all six "eleven years" → "thirteen years" (the report lists three); 1973/2026 sentence and "May 2026" caption de-dated per §1.17; Book 3 "Summer 23…" and "in 2034" likewise. Book 5 "COVID" and "1978" were left (the report names no replacement).',
'- Book 4 ch 21: dropped the redundant locker sentence (first option).',
'- Book 5 ch 10: the Aaliyah paragraph was replaced and the seven "fifteen years from now" lines deleted, so the "fifteen"→"fourteen" and "random Tuesday" fixes in that passage no longer apply; the remaining "Aaliyah, fifteen" (ch 25, 26) → fourteen.',
'- Book 5 ch 6: "She read everything I wrote, for three years." and "it had taken her until eleventh grade" are not in the text; nothing to change.',
'- Book 5 ch 7/15: Ms. Lou → Mr. Ortiz with he/him; ch 27 "fifteen years" (Maya, ×2) → thirteen.',
'- Book 5 ch 12: "since you were three" ×2 → six, "for fifteen years" ×3 → twelve (Amara only; Kezia\'s "fifteen years" in ch 9 and Sofia\'s parents\' "since you were three" in ch 21 untouched).',
'- Book 5 ch 24: also "Marcus said, Mia. Saturday." → "Friday" to match ch 23/25.',
'- Book 5 ch 28: Kezia\'s "fellow nurse" left (the report calls it acceptable).',
'- Book 5 ch 16 "— Theo" and Book 4 ch 9 "— Kezia" sign-offs removed (first option in Voice 6).',
'- Book 5 splits: 57 mid-sentence paragraph pairs merged (scan: a "p" block ending without terminal punctuation followed by a "p" block starting lowercase), including the examples the report lists.',
'- Book 6 ch 1 note about the bicycle uses the report\'s first option ("his sister Aaliyah — and, it turned out, somebody else").',
'- Book 6 ch 9: kept "— Mia had moved back there by then —" with Baltimore, since ch 7 has her relocating.',
'- Book 6 ch 11: every later she/her about the wronged neighbour became he/him (blocks 6–13), not only the ones the report quotes.',
'- Book 6 ch 12: "Kezia\'s father was not a good father." → the report\'s sentence plus "He was not a good father." so the paragraph still flows.',
'- Book 6 Closing Words: removed the duplicate "— J.A.R." block before the text; the three closing caption lines were left as they are (they render as captions).',
'- Book 6 front matter: the 988 line is a new paragraph at the end of "A Note", before the signature.',
'', '## Noticed, not changed (not in the approved list)', '',
'- Book 5 ch 25: "The first time the full count had been in the same room in nine years" still conflicts with Mia\'s Book 3 visits.',
'- Book 5 ch 2: "She had walked into freshman year and she had been Amara" still follows the new seventh-grade line.',
]
log = []        # (book, chapter, before, after)
missing = []    # (book, chapter, find, reason)
counts = {b: 0 for b in BOOKS}


def esc(s):
    return html.escape(s, quote=False)


def strip(h):
    return html.unescape(re.sub(r'<[^>]+>', '', h))


def secs(book, sec):
    d = data[book]
    if sec is None:
        return list(range(len(d['sections'])))
    if isinstance(sec, int):
        return [sec]
    if sec.startswith('='):
        out = [i for i, s in enumerate(d['sections']) if s['title'] == sec[1:]]
    else:
        out = [i for i, s in enumerate(d['sections']) if sec.lower() in s['title'].lower()]
    if not out:
        raise SystemExit(f'no section {sec!r} in {book}')
    return out


def label(book, si):
    s = data[book]['sections'][si]
    k = s.get('kicker') or s['kind']
    return f"{k} {s['title']}".strip()


def set_block(book, si, b, t_new):
    """Set t and h for a block consistently."""
    b['t'] = t_new
    b['h'] = esc(t_new)


def replace_in_block(b, find, repl):
    """Replace in t and h; return number of replacements or -1 on h failure."""
    n = b['t'].count(find)
    if n == 0:
        return 0
    b['t'] = b['t'].replace(find, repl)
    h = b['h']
    if '<' not in h:
        b['h'] = esc(b['t'])
        return n
    hf, hr = esc(find), esc(repl)
    if h.count(hf) == n:
        b['h'] = h.replace(hf, hr)
        return n
    # tags inside the find span: rebuild h by re-applying <em> spans is not
    # possible generically; fall back to a tag-preserving regex replace.
    pat = ''.join(re.escape(esc(c)) + r'(?:</?em>)*' for c in find)
    m = list(re.finditer(pat, h))
    if len(m) == n:
        # keep any tags found inside the span at the end of the replacement
        def sub(mo):
            tags = re.findall(r'</?em>', mo.group(0))
            return hr + ''.join(tags)
        b['h'] = re.sub(pat, sub, h)
        return n
    return -1


def R(book, sec, find, repl, n=1):
    """Replace `find` with `repl` exactly n times across the given section(s)."""
    total = 0
    for si in secs(book, sec):
        s = data[book]['sections'][si]
        for b in s['blocks']:
            if 't' not in b:
                continue
            if find in b['t']:
                k = replace_in_block(b, find, repl)
                if k < 0:
                    raise SystemExit(f'h mismatch in {book} {label(book, si)}: {find[:60]!r}')
                total += k
                log.append((book, label(book, si), find, repl))
    if total != n:
        missing.append((book, sec, find, f'expected {n}, found {total}'))
        if total:
            # roll back would be complex; abort so the author can adjust
            raise SystemExit(f'count mismatch {book} {sec!r} {find[:70]!r}: expected {n}, found {total}')
    else:
        counts[book] += n


def find_block(book, sec, prefix):
    for si in secs(book, sec):
        s = data[book]['sections'][si]
        for bi, b in enumerate(s['blocks']):
            if b.get('t', '').startswith(prefix):
                return si, bi
    return None, None


def DEL(book, sec, prefix, n=1):
    """Delete n consecutive blocks starting at the block whose t starts with prefix."""
    si, bi = find_block(book, sec, prefix)
    if si is None:
        missing.append((book, sec, prefix, 'block to delete not found'))
        return
    s = data[book]['sections'][si]
    removed = s['blocks'][bi:bi + n]
    del s['blocks'][bi:bi + n]
    for b in removed:
        log.append((book, label(book, si), b.get('t', str(b)), '(deleted)'))
    counts[book] += n


def INS(book, sec, prefix, kind, text, before=False):
    si, bi = find_block(book, sec, prefix)
    if si is None:
        missing.append((book, sec, prefix, 'anchor block for insert not found'))
        return
    s = data[book]['sections'][si]
    nb = {'k': kind, 't': text, 'h': esc(text)}
    s['blocks'].insert(bi if before else bi + 1, nb)
    log.append((book, label(book, si), '(inserted)', text))
    counts[book] += 1


def SPLIT(book, sec, prefix, parts, kind='p'):
    """Replace one block (t starts with prefix) with several blocks."""
    si, bi = find_block(book, sec, prefix)
    if si is None:
        missing.append((book, sec, prefix, 'block to split not found'))
        return
    s = data[book]['sections'][si]
    old = s['blocks'][bi]
    new = [{'k': kind, 't': p, 'h': esc(p)} for p in parts]
    s['blocks'][bi:bi + 1] = new
    log.append((book, label(book, si), old['t'], ' / '.join(parts)))
    counts[book] += 1


def SETKIND(book, sec, prefix, kind):
    si, bi = find_block(book, sec, prefix)
    if si is None:
        missing.append((book, sec, prefix, 'block not found'))
        return
    b = data[book]['sections'][bi and si]['blocks'][bi]
    log.append((book, label(book, si), f"[{b['k']}] {b['t']}", f"[{kind}] {b['t']}"))
    b['k'] = kind
    counts[book] += 1


def CAPTION(book, sec_idx, find, repl):
    s = data[book]['sections'][sec_idx]
    for b in s['blocks']:
        if b['k'] == 'c' and b['t'] == find:
            set_block(book, sec_idx, b, repl)
            log.append((book, label(book, sec_idx), find, repl))
            counts[book] += 1
            return
    missing.append((book, sec_idx, find, 'caption not found'))


def TABLE(book, sec, header_prefix):
    """Convert a run of markdown-table `p` blocks into readable lines."""
    si, bi = find_block(book, sec, header_prefix)
    if si is None:
        missing.append((book, sec, header_prefix, 'table not found'))
        return
    bl = data[book]['sections'][si]['blocks']
    j = bi
    new = []
    olds = []
    while j < len(bl) and bl[j].get('t', '').startswith('|'):
        t = bl[j]['t']
        olds.append(t)
        cells = [c.strip() for c in t.strip().strip('|').split('|')]
        if all(set(c) <= set('-') for c in cells):
            j += 1
            continue
        new.append(' — '.join(cells))
        j += 1
    bl[bi:j] = [{'k': 'p', 't': x, 'h': esc(x)} for x in new]
    log.append((book, label(book, si), ' | '.join(olds)[:120] + '…', ' / '.join(new)))
    counts[book] += 1


B1, B2, B3, B4, B5, B6 = BOOKS

# ---------------------------------------------------------------- Book 1 ---
# 1.14 Book 1
R(B1, 'When It', 'the day before kindergarten started for Aaliyah', 'the day before preschool started for Aaliyah')
R(B1, 'When It', 'I am sorry I was mean to you before you started kindergarten.', 'I am sorry I was mean to you before you started preschool.')
# Future-self letters: December -> May (decision)
R(B1, 'Unit 2 Wrap-Up', 'At the end of January, Ms. Calloway gave each kid', 'At the end of December, Ms. Calloway gave each kid')
R(B1, 'Unit 2 Wrap-Up', 'write a letter to yourself in June. The you that will exist in June, at the end of this school year.', 'write a letter to yourself in May. The you that will exist in May, at the end of this school year.')
R(B1, 'Unit 2 Wrap-Up', 'In June — on the very last day of school — I am going to give them back.', 'In May — on the last Friday of school — I am going to give them back.')
R(B1, 'Unit 2 Wrap-Up', 'Dear June Maya. I am proud of you for looking up.', 'Dear May Maya. I am proud of you for looking up.')
R(B1, 'Unit 2 Wrap-Up', '— November Maya. PS. Be nice to Grandma.', '— December Maya. PS. Be nice to Grandma.')
R(B1, 'Year-End Celebration', 'On the last Friday of school, Ms. Calloway opened the bottom drawer', 'On the last Friday of May, Ms. Calloway opened the bottom drawer')
R(B1, 'Year-End Celebration', 'She had not looked at the envelopes since January.', 'She had not looked at the envelopes since December.')
R(B1, 'Year-End Celebration', 'do you remember, in January, when you wrote letters to your future selves?', 'do you remember, in December, when you wrote letters to your future selves?')
R(B1, 'Year-End Celebration', 'read what November-Maya had written.', 'read what December-Maya had written.')
R(B1, 'Year-End Celebration', 'Dear June Maya. I am proud of you for looking up.', 'Dear May Maya. I am proud of you for looking up.')
R(B1, 'Year-End Celebration', '— November Maya. PS. Be nice to Grandma.', '— December Maya. PS. Be nice to Grandma.')
R(B1, 'Year-End Celebration', 'at the bottom of November-Maya\'s letter: Dear November Maya.', 'at the bottom of December-Maya\'s letter: Dear December Maya.')
R(B1, 'Year-End Celebration', 'We are good. — June Maya.', 'We are good. — May Maya.')
R(B1, 'Year-End Celebration', 'in his June handwriting:', 'in his May handwriting:')
R(B1, 'Year-End Celebration', 'I love you. — June Marcus.', 'I love you. — May Marcus.')
R(B1, 'Year-End Celebration', 'That is okay. — June Darius.', 'That is okay. — May Darius.')
# ch 10 / 9 / 5 / 15 / 24 / 22 / 18
R(B1, 'Saying Sorry', 'But here, six days later, Marcus was sitting', 'But here, three days later, Marcus was sitting')
R(B1, 'Saying Sorry', 'had not thought about the LEGO in five and a half days', 'had not thought about the LEGO in three days')
R(B1, 'Carrying Too Much', 'a thing he had said to her over the weekend', 'a thing he had done to her over the weekend')
R(B1, 'Oops vs', 'That was the first Oops on the wall.', 'That was the first Oops a child put on the wall.')
R(B1, 'Your Hurt Is Real', 'The other red stickers were Jordan and a kid we have not really talked about yet named Theo.', 'The other red stickers were Jordan and Theo.')
R(B1, 'Small Acts', 'Vincent — a kid in Room 12 who we have not talked about, because Vincent is one of the quieter kids —', 'Vincent — a kid from the other first-grade class who eats at their lunch table —')
R(B1, 'What Does Grace', 'anything other than the way kindergarten worked', 'anything other than the way first grade worked')
R(B1, 'Forgiveness Takes Time', 'Lily and Mia have been best friends since they were three, because their moms are best friends', 'Lily and Mia have been best friends since before they could walk, because their moms are best friends')
# 1.13 retirement
R(B1, 'Grace in Community', 'on the night, eleven years from now, when she retired', 'on the night, thirteen years from now, when she retired')
# 1.15 / Voice 2
R(B1, 'Year-End Celebration', '(She still has it. She is forty-three now, and she still has it. We will talk about it more in Book Five.)', '(She still has it. She is grown up now, and she still has it.)')
# 1.16
R(B1, 'Closing Words', 'Books Two through Five are forthcoming.', 'Books Two through Six are forthcoming.')
# Voice 1, 3
R(B1, 'Being Kind to Myself', 'It will follow them, in different forms, all the way through Book Five, when they are seventeen and eighteen and about to leave home, and they will still be doing it then.', 'It will follow them for years, even when they are big and about to leave home.')
R(B1, 'Benefit of the Doubt', 'It saves you, on average, about eight unnecessary mad feelings per day. Multiply that by 365. Multiply that by a lifetime.', 'It saves you a lot of mad feelings. Every day. For your whole life.')
# Safety
R(B1, 'Forgiving Is Not', 'Loving them does not mean you have to be in danger.', 'Loving them does not mean you have to be unsafe.')
R(B1, 'Benefit of the Doubt', 'bumps into you, doesn\'t text back, doesn\'t say hi', 'bumps into you, doesn\'t wave back, doesn\'t say hi')
R(B1, 'Benefit of the Doubt', 'They thought you were mad at them. Their phone was off. They forgot.', 'They thought you were mad at them. They did not hear you. They forgot.')
# Book 3 ch 12/15 (Theo's sister Lena) -> Book 1 ch 21
R(B1, 'Unit 3 Wrap-Up', 'I forgive my brother for breaking my LEGO Star Wars. He did not really break it on purpose.', 'I forgive my sister for breaking my LEGO Star Wars. She did not really break it on purpose.')
# room-12.md §7 judgment call: Marcus's card
R(B1, 'Year-End Celebration', 'You came in throwing LEGOs and you are leaving as a brother', 'You came in knocking over block towers and you are leaving as a brother')
# Part caption
CAPTION(B1, 17, 'February. March. The middle gets colder before it gets', 'February. March. The middle gets colder before it gets warmer.')
# Charts
SPLIT(B1, 'Saying Sorry', 'A REAL SORRY HAS THREE PARTS 1. I NAME WHAT I DID.', ['A REAL SORRY HAS THREE PARTS', '1. I NAME WHAT I DID.'])
SPLIT(B1, 'Forgiving Is Not', 'FORGIVENESS TRUST', ['FORGIVENESS — TRUST'])
SPLIT(B1, 'Forgiving Is Not', 'Inside you Between people For YOUR peace', [
    'Inside you — Between people',
    'For YOUR peace — For SAFETY',
    'You can give it alone — The other person has to earn it',
    'A gift you give yourself — Never owed',
    '"Forgiveness," said Sammy, "is INSIDE you. It is something you do for your own peace. You do not need the other person\'s permission. You do not need them to ask for it. You can just decide, in your own heart, to put the weight down."'])
SPLIT(B1, 'What Does Grace', 'Kindness you CHOOSE to give To somebody', [
    'Kindness you CHOOSE to give',
    'To somebody who did not EARN it',
    'Because the world is hard for everybody',
    'And softness, freely given, makes it less hard',
    'The class was quiet.'])

# ---------------------------------------------------------------- Book 2 ---
# 1.7 Mia in Room 18
R(B2, 'Who Am I', 'Mia was not there.', 'Mia was not there yet. Marcus looked at the door. He waited. Then, a minute after the bell, Mia slid in, out of breath, and dropped into the last empty seat, and Marcus felt something in his chest un-clench that he had not known was clenched.')
DEL(B2, 'Who Am I', 'Marcus looked under the tables. He looked at the door.', 3)
R(B2, 'Who Am I', 'Marcus, Amara, Sofia, Priya, Darius, Jordan, Maya, Theo, Kezia — for one beat, her eyes had something in them, and then she moved on. (Mia was down the hall.)', 'Marcus, Amara, Sofia, Priya, Darius, Jordan, Maya, Theo, Mia, Kezia — for one beat, her eyes had something in them, and then she moved on.')
R(B2, 'Unit Two Reflection', 'a Friday in late January — when Mia', 'a Friday in the first week of February — when Mia')
R(B2, 'Unit Two Reflection', 'It is in late January. The truck is loaded.', 'It is in the first week of February. The truck is loaded.')
R(B2, 'Unit Two Reflection', 'She will come back in Book Five, when the cohort is in high school and Sofia finds a way to invite her to a reunion.', 'She will come back, for visits, in the books to come.')
R(B2, 'Unit Two Reflection', 'Mr. Tate\'s line that Marcus told us about:', 'Mr. Tate\'s line that Mia told us about:')
# 1.13 Ms. Calloway tenure
R(B2, None, 'She had learned, in fourteen years, that the act of writing', 'She had learned, in sixteen years, that the act of writing')
R(B2, None, 'I have been teaching SEL in this school for fourteen years. I have done this project — the Grace Gap project — for ten of those years.', 'I have been teaching in this school for sixteen years, and doing this project — the Grace Gap project — since I moved to SEL.')
# 1.14 Book 2
R(B2, 'Who Am I', 'Marcus remembered his first one, in first grade, with the words I HAVE A SISTER, AALIYAH, AGE 3 in big crooked letters along one of the branches.', 'Marcus remembered the first day of first grade, when a frog puppet had asked him one thing, and he had said I have a sister. Her name is Aaliyah and she is THREE.')
R(B2, 'Who Am I', 'But the Web she was handing out today had five branches, not the three he remembered:', 'The Web she was handing out today asked for more than one thing:')
R(B2, 'Who Am I', 'you might notice this Web is a little different from the one some of you did in first grade. It has a new branch this year. Things I\'m Still Figuring Out.', 'This Web has a branch on it that I would not have given you in first grade. Things I\'m Still Figuring Out.')
R(B2, None, 'Grumpy Gus was a third-grader name for a six-year-old\'s voice.', 'Grumpy Gus was a first-grader name for the voice.')
R(B2, None, 'Iris had been Amara\'s best friend since they were five — they had moved to this town in the same month, they had been in kindergarten together', 'Iris had been Amara\'s best friend since the first week of first grade — they had moved to this town in the same month')
R(B2, None, 'she had only just moved to this town a few years before', 'she had only just moved to this town the year before')
R(B2, None, '"I think — Mom said her family moved to Ohio. To Cincinnati."', '"I think — you said her family moved to Ohio. To Cincinnati."')
R(B2, None, '"I think Mom has her mom\'s email."', '"I think you have her mom\'s email."')
R(B2, None, 'I have been mad a lot since Biscuit died last year.', 'I have been mad a lot since Biscuit died two years ago.')
R(B2, None, 'My dad has been sad about Biscuit for a year, like me.', 'My dad has been sad about Biscuit for two years, like me.')
R(B2, None, 'Priya, in nine and three-quarters years of being alive', 'Priya, in eight and three-quarters years of being alive')
# Hannah -> Tasha in the ch. 10 project scenes
R(B2, 'Weight of Self-Criticism', 'Priya, Hannah (her best friend), and a kid named Devon were supposed to make the poster together.', 'Priya, Devon, and a girl named Tasha were supposed to make the poster together.')
R(B2, 'Weight of Self-Criticism', 'She had decided to let Hannah and Devon do the drawings', 'She had decided to let Tasha and Devon do the drawings')
R(B2, 'Weight of Self-Criticism', 'But Hannah\'s drawings were small and faint.', 'But Tasha\'s drawings were small and faint.')
R(B2, 'Weight of Self-Criticism', 'Hannah is silent because she is also mad at you.', 'Tasha is silent because she is also mad at you.')
R(B2, 'Weight of Self-Criticism', 'Hannah said, "Pri, are you okay?"', 'Tasha said, "Pri, are you okay?"')
R(B2, 'Weight of Self-Criticism', 'Devon thinks I am annoying and Hannah thinks I am annoying', 'Devon thinks I am annoying and Tasha thinks I am annoying')
R(B2, 'Weight of Self-Criticism', '"The friends. Hannah and Devon."', '"The group. Tasha and Devon."')
R(B2, 'Weight of Self-Criticism', 'Real Hannah and real Devon are eating their lunch right now', 'Real Tasha and real Devon are eating their lunch right now')
R(B2, 'Weight of Self-Criticism', 'Hannah said, "Do you want me to be more careful about my drawings? Are mine bad?"', 'Tasha, from the next table, came over, looking worried, and said, "Do you want me to be more careful about my drawings? Are mine bad?"')
R(B2, 'Weight of Self-Criticism', 'Priya said, "Hannah, your drawings are good.', 'Priya said, "Tasha, your drawings are good.')
R(B2, 'Weight of Self-Criticism', 'Hannah said, "Yes. That would actually help.', 'Tasha said, "Yes. That would actually help.')
R(B2, 'Weight of Self-Criticism', 'Hannah\'s drawings — gone over at the end in marker so they were bolder — were lovely. The teacher gave them an A. Devon high-fived Priya. Hannah hugged her.', 'Tasha\'s drawings — gone over at the end in marker so they were bolder — were lovely. The teacher gave them an A. Devon high-fived Priya. Tasha hugged her.')
R(B2, None, '1. I cried in front of Hannah and Devon and the world did not end.', '1. I cried in front of Tasha and Devon and the world did not end.')
R(B2, None, '5. Hannah is okay. We are okay. We are still best friends. The Inner Critic lied about that.', '5. Tasha is okay. Devon is okay. Hannah and I are still best friends. The Inner Critic lied about that.')
R(B2, None, 'in front of nine other kids.', 'in front of twenty-five other kids.')
R(B2, None, 'My grandma chose me every single day for the last five years.', 'My grandma chose me every single day for the last three years.', 2)
R(B2, None, 'is going to have his Mr. Tate meeting at the start of Part Two', 'is going to have his meeting with his parents at the start of Part Two')
R(B2, None, 'We are going to come back to Marcus\'s lie in Chapter Twelve. The week between today and Chapter Twelve', 'We are going to come back to Marcus\'s lie in Chapter Nine. The week between today and Chapter Nine')
R(B2, 'Why People Hurt', 'we will talk about how to spot them in Chapter Twenty-Three.', 'we will talk about how to spot them in Chapter Twenty-Seven.')
R(B2, 'Why People Hurt', 'We will talk about it more in Chapter Twenty-Three."', 'We will talk about it more in Chapter Twenty-Seven."')
R(B2, None, 'That is Chapter Thirty.', 'That is Chapter Thirty-One.')
R(B2, None, 'she had been waiting for it for three years, in different forms', 'she had been waiting for it for two years, in different forms')
R(B2, None, 'All ten of them are building boundaries.', 'All ten of them — Mia in Pittsburgh too — are building boundaries.')
R(B2, None, 'She picked up her chalk and continued the lesson.', 'She picked up her marker and continued the lesson.')
# 1.16
R(B2, 'Closing Words', 'By the time you finish Book Five, you will have', 'By the time you finish Book Six, you will have')
R(B2, 'Closing Words', 'By the end of all five books, you will have', 'By the end of all six books, you will have')
R(B2, 'Closing Words', 'Books Three, Four, and Five are forthcoming.', 'Books Three through Six are forthcoming.')
R(B2, 'Closing Words', 'They will be eleven and twelve in the next book. They will be fourteen and fifteen in the one after that. They will be seventeen and eighteen in the last one.', 'They will be twelve and thirteen in the next book. They will be fourteen and fifteen in the one after that. They will be seventeen and eighteen in the one after that. And then, in the last one, they will be grown.')
# 1.15
R(B2, 'Unit Two Reflection', 'She still has it. She is in her twenties now.', 'She still has it. She is in her forties now.')
# 2. typos
CAPTION(B2, 10, 'November through January. The cold months. The', 'November through January. The cold months. The heavy ones.')
R(B2, None, 'Move is happening because grown-ups made grown-up decisions.', 'The move is happening because grown-ups made grown-up decisions.')
R(B2, None, 'Lego pirate ship', 'LEGO pirate ship', 2)
TABLE(B2, None, '| INNER CRITIC | INNER COACH |')
TABLE(B2, None, '| GUILT — useful | SHAME — lying |')
TABLE(B2, None, '| FORGIVENESS | TRUST |')
DEL(B2, 'Grace Gap Assignment', 'Launch')
# 3. safety
R(B2, None, 'was the HIGHEST RISK lesson of Unit Two.', 'was the hardest lesson of Unit Two.')
R(B2, None, 'This is the second HIGHEST RISK lesson.', 'This is the second hardest lesson.')
# 4. voice 4
R(B2, None, 'Marcus would say it to himself in a hospital waiting room in tenth grade. Priya would say it', 'Priya would say it')

# ---------------------------------------------------------------- Book 3 ---
# 1.3 Maya's family
R(B3, None, 'who had mentioned it to Maya\'s parents at the conferences', 'who had mentioned it to Maya\'s grandmother at the conferences')
R(B3, None, 'Have you shown your parents?', 'Have you shown your grandmother?')
R(B3, 'Grace Challenge', 'Maya offered to help her younger brother with his math homework on Tuesday. He had been struggling with fractions. He had cried about it on Monday. Maya — who had spent most of seventh grade in too much shame about her own math to even look at her brother\'s homework — pulled out a chair next to him on Tuesday, and helped him with three problems, and did not roll her eyes once, even though he asked the same question four times. The act took twenty minutes. Her brother gave her a hug afterwards that she will, for the rest of her life, remember.',
  'Maya offered to help Bea, the second-grader she had found crying in a bathroom in third grade and had kept an eye on ever since, with her math homework on Tuesday. Bea had been struggling with fractions. She had cried about it on Monday. Maya — who had spent most of seventh grade in too much shame about her own math to even look at anybody else\'s homework — pulled out a chair next to her on Tuesday, and helped her with three problems, and did not roll her eyes once, even though Bea asked the same question four times. The act took twenty minutes. Bea gave her a hug afterwards that Maya will, for the rest of her life, remember.')
# 1.5 Kezia's family
R(B3, None, 'The fact that her parents have been getting a divorce for the last fourteen months, depending on which day of the week it is. ', '')
R(B3, 'Grace Challenge', 'On Wednesday, Kezia\'s mom told Kezia that her grandmother had, in fact, seen the text, and had asked Kezia\'s mom who Kezia was, and Kezia\'s mom had said that is your granddaughter, Mom, and Kezia\'s grandmother had said oh, that lovely girl, tell her I love her too. Kezia\'s mom told Kezia this on Wednesday at dinner.',
  'On Wednesday, Kezia\'s aunt told Kezia that her grandmother had, in fact, seen the text, and had asked her aunt who Kezia was, and her aunt had said that is your granddaughter, Mom, and Kezia\'s grandmother had said oh, that lovely girl, tell her I love her too. Her aunt told Kezia this on Wednesday at dinner.')
R(B3, None, 'she would visit her grandmother on Sunday afternoons regardless of whether her grandmother knew who Kezia was on any given Sunday. Kezia had been, all year, going to her grandmother\'s on weekends but had been, sometimes, finding reasons to skip when she suspected it would be a bad day.',
  'she would sit with her grandmother on Sunday afternoons, instead of finding reasons to be out of the house, regardless of whether her grandmother knew who Kezia was on any given Sunday. Kezia had been, all year, finding reasons to be out on weekends when she suspected it would be a bad day.')
# 1.8 Mr. Patel
R(B3, '=A Note Before You Begin', 'who has been teaching seventh-grade English in this district for nineteen years and who has, in the last four of those years, been the cohort\'s most important adult', 'who has been teaching in this district for nineteen years, the last three of them in seventh-grade English, and who has, since the cohort\'s third-grade year, been the cohort\'s most important adult')
R(B3, None, 'since fifth grade, when he had been the cohort\'s main teacher for a year. He had then moved up to seventh grade.', 'since third grade, when he had been the cohort\'s homeroom teacher. He had then moved up, first to fifth and then to seventh.')
R(B3, None, 'I have known you since you were six.', 'I have known you since you were eight.')
R(B3, None, 'He had been doing this letter assignment, with seventh-graders, for nineteen years.', 'He had been doing this letter assignment for nineteen years, with third-graders and now seventh-graders.')
# 1.10 custodian rename
R(B3, 'Mia Comes Home', 'Mr. Ortiz', 'Mr. Delgado', 3)
R(B3, 'Mia Comes Home', 'hello-to-Mr.-Ortiz', 'hello-to-Mr.-Delgado')
R(B3, 'Last Day', 'Mr. Ortiz', 'Mr. Delgado', 1)
# 1.14 Book 3
R(B3, None, 'has been working with Dr. Pam Mendel, his therapist, for two years', 'has been working with Dr. Pam Mendel, his therapist, for four years')
R(B3, None, 'Jordan, two floors up, in second period social studies', 'Jordan, at the other end of the second floor, in second period social studies')
R(B3, 'Mask & the Mirror', 'The cohort, in this first period, was four of them', 'The cohort, in this second period, was four of them')
R(B3, 'Mask & the Mirror', 'Maya and Jordan in second period, Sofia and Darius in fourth, Kezia in fifth.', 'Maya and Jordan in fourth period, Sofia and Darius in sixth, Kezia in seventh.')
R(B3, 'Mask & the Mirror', 'who is not in this section but who I will see in second period', 'who is not in this section but who I will see in fourth period')
R(B3, None, 'I am eight. I am the most resilient unit in this house.', 'I am nine. I am the most resilient unit in this house.')
R(B3, None, 'The cohort has been twelve years of not doing this.', 'The cohort has been six years of not doing this.')
R(B3, None, 'the eleven years of being her brother.', 'the eight years of being her brother.')
R(B3, None, 'plus the rest of the twenty-three seventh-graders Mr. Patel had', 'plus the rest of the nineteen seventh-graders Mr. Patel had')
R(B3, None, 'Dr. Pam taught you a word in late September. The word is load-bearing.', 'Dr. Pam has a word for it. The word is load-bearing.')
R(B3, None, 'Ms. Calloway had named the Inner Critic for them in fourth grade', 'Ms. Calloway had named the Inner Critic for them in third grade')
# ch 13 letters stay sealed until May
R(B3, 'Built So Far (Part Two)', 'The cohort, this morning, is doing something they will do every December for the rest of seventh grade — they are reading the letter they wrote to themselves at the end of Part One, the October letters that Mr. Patel kept in the drawer.',
  'The cohort, this morning, is doing something Mr. Patel does every December — not reading the October letters, which stay sealed in the drawer until May, but writing a one-paragraph note to the October self, which he adds to the envelope.')
DEL(B3, 'Built So Far (Part Two)', 'Mr. Patel handed the letters back at the start of class, sealed', 2)
R(B3, 'Built So Far (Part Two)', 'Amara, in the second row, is reading her October letter, and her face is doing something complicated.', 'Amara, in the second row, is remembering her October letter, and her face is doing something complicated.')
R(B3, 'Built So Far (Part Two)', 'she reads that line and something', 'she remembers that line and something')
R(B3, 'Built So Far (Part Two)', 'Jordan is reading his October letter and laughing', 'Jordan is remembering his October letter and laughing')
R(B3, 'Built So Far (Part Two)', 'Maya is reading her October letter', 'Maya is remembering her October letter')
R(B3, 'Built So Far (Part Two)', 'Darius is reading his October letter', 'Darius is remembering his October letter')
R(B3, 'Built So Far (Part Two)', 'Kezia is reading her October letter', 'Kezia is remembering her October letter')
R(B3, 'Built So Far (Part Two)', 'Marcus is reading his October letter', 'Marcus is remembering his October letter')
R(B3, 'Built So Far (Part Two)', 'The cohort, watching them read the October letters in silence, is doing what the cohort always does when given this kind of prompt. They are reading.', 'The cohort, watching them remember the October letters in silence, is doing what the cohort always does when given this kind of prompt. They are remembering.')
# ch 14
R(B3, None, 'Sofia had been Mia\'s NYE call for six years.', 'Sofia had been Mia\'s NYE call for three years.')
R(B3, None, 'The cohort, for six years, had not cut Mia\'s midnight call short.', 'The cohort, for three years, had not cut Mia\'s midnight call short.')
R(B3, None, 'an NYE moment that Sofia had been part of for six years.', 'an NYE moment that Sofia had been part of for three years.')
R(B3, None, 'been doing the acknowledge, repair, commit, move on practice since fourth grade.', 'been doing the acknowledge, repair, commit, move on practice since third grade, and had kept it up in Pittsburgh.')
# ch 3 / 14 watcher
R(B3, None, 'Marcus, who has been the cohort\'s most attentive watcher of Kezia since first grade, has been waiting for her to tell him more.', 'Theo, who has been the cohort\'s most attentive watcher of Kezia since first grade, has been waiting for her to tell him more.')
R(B3, None, 'Marcus, who has been the cohort\'s most reliable detector of Sofia going still since first grade, did not say anything immediately.', 'Marcus, who sat next to her, did not say anything immediately.')
# ch 21 / 22
R(B3, 'Mia Comes Home', 'The cohort dog — Marcus had brought Pepper for the afternoon, because Pepper had taken to coming to cohort gatherings in the last year and the cohort had decided he was a member.', 'The cohort dog — Darius had brought Pepper for the afternoon, because Pepper had taken to coming to cohort gatherings in the last year and the cohort had decided she was a member.')
R(B3, 'Last Day', 'Pepper, under the booth — Marcus had brought Pepper, because the diner allowed dogs on the patio extension that the booth opened onto — was eating fries that Darius was sneaking him.', 'Pepper, under the booth — Darius had brought Pepper, because the diner allowed dogs on the patio extension that the booth opened onto — was eating fries that Darius was sneaking her.')
R(B3, 'Mia Comes Home', 'Marcus\'s mother brought down a tray of grilled cheese sandwiches.', 'Sofia\'s mother brought down a tray of grilled cheese sandwiches.')
R(B3, 'Mia Comes Home', 'would have eleven people at the table.', 'would have ten people at the table.')
R(B3, 'Last Day', 'Aaliyah, his sister, had noticed this.', 'Imani, his sister, had noticed this.')
R(B3, 'Last Day', 'Marcus ordered milkshakes for the table — eight, not counting Mia, because Mia could not have a milkshake through a phone but Marcus put a ninth on the order as a joke.', 'Marcus ordered milkshakes for the table — nine, not counting Mia, because Mia could not have a milkshake through a phone but Marcus put a tenth on the order as a joke.')
R(B3, 'Last Day', 'Nine milkshakes, she said. One for the phone.', 'Ten milkshakes, she said. One for the phone.')
R(B3, 'Last Day', 'on Mother\'s Day, which had been the previous Sunday', 'on Mother\'s Day, which had been three weeks before')
R(B3, 'Last Day', 'I want you to know that the Wall is going with you to high school. Ms. Calloway is moving it to the eighth-grade hallway over the summer.', 'I want you to know that the Wall is going with you to eighth grade, and after that to high school. Ms. Calloway is moving it to the eighth-grade hallway over the summer.')
R(B3, '=A Note Before You Begin', 'By the end of seventh grade, when the cohort leaves for high school, the Wall will go with them', 'By the end of seventh grade, the Wall will go with them')
R(B3, '=A Note Before You Begin', 'I am going to be in the book more than I was in Book Four. Less than I was in Books One and Two.', 'I am going to be in the book less than I was in Books One and Two, and more than I will be in Book Four.')
R(B3, 'Mask & the Mirror', 'something a little mean about a girl named Hannah in the year above them', 'something a little mean about a girl named Hannah in their year — Priya\'s Hannah')
# ch 17 / ch 2 Jordan at six
R(B3, None, 'Jordan, from age seven onward, had learned', 'Jordan, from age six onward, had learned')
R(B3, None, 'Jordan had decided, at seven, without anyone telling him to', 'Jordan had decided, at six, without anyone telling him to')
R(B3, None, 'But Jordan\'s father, when Jordan was seven, had done a thing that Jordan had been carrying — quietly, without naming it, even to Dr. Pam — for five years.', 'But Jordan\'s father, when Jordan was six, had done a thing that Jordan had been carrying — quietly, without naming it, even to Dr. Pam — for six years.')
R(B3, None, 'a name on a thing he has been doing for seven years.', 'a name on a thing he has been doing for six years.')
# 1.15 / 1.17
R(B3, None, 'It is in his desk drawer in 2034.', 'It is in his desk drawer still, thirty years on.')
R(B3, None, 'Summer 23. Fall 23. Winter 23.', 'Summer. Fall. Winter.')
# Mia's grandparents
R(B3, None, 'She called her grandfather in Florida, who she had not called in two months.', 'She called her great-uncle in Florida, who she had not called in two months.')
R(B3, None, 'Mia in her grandmother\'s old room at her uncle\'s house.', 'Mia in her grandparents\' spare room.')
# 2. typos
R(B3, None, 'The cohort had not, anyone of them, screenshotted', 'The cohort had not, any one of them, screenshotted')
R(B3, None, 'Mr. Patel has not collected anything in the year that has made him as proud as the cohort he is currently teaching.', 'Mr. Patel has not, in nineteen years, had a class that has made him as proud as the cohort he is currently teaching.')
# 4. voice 5
R(B3, None, 'the kind of light venom that twelve-year-old girls have a particular skill for', 'the kind of light venom that twelve-year-olds have a particular skill for')

# ---------------------------------------------------------------- Book 4 ---
# 1.2 Pepper
R(B4, None, 'Pepper would, four years from now, be nine and slowing down. Pepper would, four years from now, die.', 'Pepper would, three years from now, be nine and slowing down. Pepper would, three years from now, die.')
# 1.3 Maya's household (ch 19)
R(B4, 'Grandfather', 'the basement at her own house where she lived with her mother', 'the basement she had grown up in, under her grandmother\'s kitchen')
R(B4, 'Grandfather', 'Maya was at her grandmother\'s house, which she had been at most Sundays since fall', 'Maya was at her grandmother\'s house, where she had lived since she was five')
R(B4, 'Grandfather', 'a mother who will, eventually — she is not all the way there yet, but she will be — a mother who is going to support you going to art school.', 'a mother who is, slowly, finding her way back, and who will — someday — be able to say of course, go.')
R(B4, 'Grandfather', 'Talk to your grandmother. Talk to your mother.', 'Talk to your grandmother.')
R(B4, 'Grandfather', 'The making had not ended in 1973. The making was continuing in 2026, with the same brush, in a different basement, in a different generation, in a different city.', 'The making had not ended with him. The making was continuing today, with the same brush, in the same basement, in a different generation.')
R(B4, 'Grandfather', 'until he died, when Maya was three.', 'until he died, when Maya was one.')
R(B4, 'Grandfather', 'a widow for eleven years', 'a widow for thirteen years')
R(B4, 'Grandfather', 'I have not opened it in eleven years.', 'I have not opened it in thirteen years.')
R(B4, 'Grandfather', 'The box had been there for eleven years.', 'The box had been there for thirteen years.')
R(B4, 'Grandfather', 'I have been thinking about this for eleven years. I have not, in those eleven years, known the right answer.', 'I have been thinking about this for thirteen years. I have not, in those thirteen years, known the right answer.')
R(B4, 'Grandfather', 'He died eleven years ago.', 'He died thirteen years ago.')
R(B4, 'Grandfather', 'Augusto Rivera, 1925-2013, untitled landscape, 1973.', 'Augusto Rivera, 1940–2013, untitled landscape, 1973.')
R(B4, 'Grandfather', 'Augusto had died at eighty-eight', 'Augusto had died at seventy-three')
R(B4, 'Grandfather', 'He worked at the steel mill for forty years.', 'He worked at the steel mill for thirty-five years.')
R(B4, None, 'Grandfather\'s brush, May 2026', 'Grandfather\'s brush, May')
# 1.5 Kezia's grandmother memory (Book 4 ch 9)
R(B4, None, 'The person had written to Kezia\'s grandmother. The letter had not asked for anything.', 'The person had written to Kezia\'s grandmother — her grandmother, whose memory had steadied after a frightening year in seventh grade. The letter had not asked for anything.')
# 1.9 Marcus / Aaliyah (ch 15, 21)
R(B4, 'Aaliyah', 'The August 14 tradition was eight years old by this point — Marcus had been doing it since he was seven', 'The August 14 tradition was four years old by this point — Marcus had been doing it since he was ten')
R(B4, 'Aaliyah', 'Eight years. Eight ice cream trips.', 'Four years. Four ice cream trips.')
R(B4, 'Aaliyah', 'had taken her every August 14 since he was seven.', 'had taken her every August 14 since he was ten.')
R(B4, 'Aaliyah', 'nine times now, including today.', 'five times now, including today.')
R(B4, None, 'on August 14 every year since Marcus was seven', 'on August 14 every year since Marcus was ten')
R(B4, 'Aaliyah', 'About the next day, when he had told their parents.', 'About the two years it took him to tell their parents.')
R(B4, 'Aaliyah', 'the ten-year-old story that he had been carrying since he was six', 'the eight-year-old story that he had been carrying since he was six')
R(B4, 'Aaliyah', 'Aaliyah, at ten, had said, Marcus. Pull over. Take a minute.', 'Aaliyah, at ten, had said, Marcus. Sit down a minute.')
R(B4, 'Aaliyah', 'Marcus had pulled over.', 'They had sat on the bench outside Mason\'s.')
R(B4, 'Aaliyah', 'They had sat in the car for ten minutes.', 'They had sat there for ten minutes.')
R(B4, 'Aaliyah', 'could sit in a car with a crying older brother', 'could sit on a bench with a crying older brother')
R(B4, 'Aaliyah', 'Marcus drove her home.', 'They walked home.')
R(B4, 'Aaliyah', 'I have been mom-and-dad savings for it for, like, six months.', 'I have been saving my allowance for it for, like, six months.')
# 1.10 art teacher / coach names
R(B4, None, 'Maya had said, Mrs. Yates. She taught us color theory in sixth grade.', 'Maya had said, Ms. Henley. She taught us color theory in sixth grade.')
R(B4, None, 'Coach Henley', 'Coach Marsh', 20)
# 1.12 Amara / Iris (ch 14)
R(B4, 'Old Story', 'In second grade, there was a girl named Iris. Iris was new.', 'In second grade, there was a girl named Iris. Iris had been my best friend since the first week of first grade.')
R(B4, 'Old Story', 'I went up to Iris. I sat with her at lunch. I started a friendship with her. The friendship lasted, in some form, for the rest of second grade. That was the thing I have been credited for in the bench-sign story.', 'I kept sitting with her. Then, in January, she moved away. The apology came a year later, in a letter. That was the thing I have been credited for.')
R(B4, 'Old Story', 'The full version, which I have not told anybody before,', 'The full version, which I have not told anybody in this much detail before,')
R(B4, 'Old Story', 'Amara — Amara is me, I am writing this — saw the cohort', 'I saw the cohort')
# 1.13 Ms. Calloway
R(B4, None, 'who had been reading kid emails for thirty years', 'who had been reading kid emails for twenty years')
R(B4, None, 'I have been doing this work for thirty years.', 'I have been doing this work for twenty years.')
R(B4, None, 'Ms. Calloway has been doing this for thirty years.', 'Ms. Calloway has been doing this for twenty years.')
R(B4, '=A Note Before You Begin', 'by Year 4 of being in their lives', 'by Year 9 of being in their lives')
R(B4, '=A Note Before You Begin', 'She does freshman English and senior English.', 'She does freshman English, and — for seniors — the Capstone block that lives inside senior English.')
# 1.14 Book 4
R(B4, '=A Note Before You Begin', 'Twenty-two chapters in four parts.', 'Twenty-one chapters in four parts.')
R(B4, None, 'The book has fifteen chapters left.', 'The book has fourteen chapters left.')
R(B4, None, 'The book has eleven chapters left.', 'The book has ten chapters left.')
R(B4, None, 'only five chapters — because freshmen', 'only four chapters — because freshmen')
R(B4, None, 'Part Four has two chapters left.', 'Part Four has one chapter left.')
R(B4, 'First Day', 'I am in the freshman hallway. My locker is three down from Theo\'s. Ms. Calloway', 'I am in the freshman hallway. Ms. Calloway')
R(B4, 'First Day', 'I have been drawing one for the last four years.', 'I have been drawing one for the last six years.')
R(B4, 'First Day', 'I have been drawing one since fifth grade.', 'I have been drawing one since the summer before third grade.')
R(B4, None, 'Amara walked to fourth period — English, with Ms. Calloway. She was, by then, twelve minutes late. She walked in quietly. The class was already going. Ms. Calloway was at the board.', 'Amara walked to fourth period — history. She was, by then, twelve minutes late. She walked in quietly. The class was already going. Mr. Salinas was at the board.')
R(B4, None, 'Ms. Calloway looked at Amara when she walked in. Ms. Calloway did not say anything. Ms. Calloway just gave Amara a small look', 'Mr. Salinas looked at Amara when she walked in. Mr. Salinas did not say anything. Mr. Salinas just gave Amara a small look')
R(B4, None, 'Jordan was in the same English section but had stayed back to ask Ms. Calloway something', 'Jordan had stayed back after third period to ask a teacher something')
R(B4, None, 'Hannah, who is Priya\'s best friend from a different middle school, joined when we were eight.', 'Hannah, who is Priya\'s best friend, joined when we were eight, from the class down the hall.')
R(B4, None, 'looking at the bench in the back corner of the playground', 'looking at the bench outside the gym')
R(B4, None, 'Sometimes — like all of seventh grade — we did not meet at all', 'Sometimes — like most of eighth grade — we did not meet at all')
R(B4, None, 'She is, I have learned over six years, one of the best listeners', 'She is, I have learned over five years, one of the best listeners')
R(B4, None, 'Ms. Wong', 'Ms. Okafor', 17)
R(B4, None, 'You told us about the lie about the bike when you were six.', 'You told us about the lie about the bike when you were eight.')
R(B4, None, 'The cohort knows the version of me that, at six, told my parents about the bike.', 'The cohort knows the version of me that, at eight, told my parents about a lie from when he was six.')
R(B4, None, 'The pattern I had set on that January Sunday', 'The pattern I had set on that January Wednesday')
R(B4, 'Party', 'Cole', 'Tyler', 40)
R(B4, None, 'There are eleven of them now, including some from before she really knew how to draw.', 'There are five of them now, including some from before she really knew how to draw.')
R(B4, None, 'I felt seen by a friend I had not been in the same room with for nine years.', 'I felt seen by a friend I had not been in the same room with for two years.')
R(B4, None, 'Jordan had been, at nine, the kid who had not yet started seeing Dr. Pam — the funny mask', 'Jordan had been, at nine, only a few months into seeing Dr. Pam, and had not told her about Ben — the funny mask')
R(B4, None, 'I live in Ohio now. I am in eighth grade.', 'I live in Ohio now. I am in ninth grade.')
R(B4, None, 'and I am writing this for me, in March — this was the teacher version of coaching.', 'and I am writing this for me, in April — this was the teacher version of coaching.')
R(B4, 'The Last Day', 'Eight of them. Plus Hannah. Plus Olivia. Ten total.', 'Nine of them. Plus Hannah. Plus Olivia. Eleven total.')
R(B4, 'The Last Day', 'Ten kids walking to an ice cream place', 'Eleven kids walking to an ice cream place')
R(B4, 'The Last Day', 'Mr. Mason saw the ten of them come in.', 'Mr. Mason saw the eleven of them come in.')
R(B4, 'The Last Day', 'Ten kids at a table.', 'Eleven kids at a table.')
R(B4, 'The Last Day', 'had been working with the Wall for thirteen years.', 'had been working with the Wall for twelve years.')
R(B4, 'The Last Day', 'The Mistake Wall, in October of senior year, moved up to Room 207', 'The Mistake Wall, in August of senior year, moved up to Room 207')
R(B4, 'Closing Words', 'First grade. Third grade. Eighth grade. Ninth grade. Twelfth grade. The bookend years.', 'First grade. Third grade. Seventh grade. Ninth grade. Twelfth grade. The bookend years.')
R(B4, 'Closing Words', 'if this is the last of the five for you', 'if this is the last of the six for you')
# 2. typos
R(B4, None, 'Sofia texted back: . So glad. Talk later. I love you.', 'Sofia texted back: Kez. So glad. Talk later. I love you.')
R(B4, None, 'Coach Marsh sounds like a guy.', 'Coach Marsh sounds like a good guy.')
R(B4, None, 'She read, over the course of the year, what other cohort kids had written.', 'She learned, over the course of the afternoon, what other cohort kids had written.')
# Voice 6: drop the third-person sign-off
DEL(B4, 'Kezia', '— Kezia')

# ---------------------------------------------------------------- Book 5 ---
# 1.6 Mia
R(B5, None, 'We have not been in the same room in nine years.', 'We have not been in the same room for more than a few days at a time in nine years.')
R(B5, None, 'Marcus had not seen Mia since they were nine.', 'Marcus had not seen Mia since the summer visit two years ago.')
# 1.9 August 14
R(B5, 'Lie Marcus', 'He did not tell her why. Aaliyah, fifteen, sometimes wondered why her brother bought her ice cream on a random Tuesday in August every year. She did not ask. She figured he had his reasons. She ate the ice cream.', 'He had told her why, the August she was ten. She had told him to put it down. He had, mostly. He still bought the ice cream. She still ate it.')
DEL(B5, 'Lie Marcus', 'Aaliyah will, fifteen years from now, ask Marcus', 8)
R(B5, None, 'Marcus had never told anybody.', 'Marcus had never told the cohort — only Aaliyah, and Amara.')
R(B5, None, 'Aaliyah, fifteen, did not ask why anymore. Aaliyah had figured out, somewhere along the way, that it was a tradition.', 'Aaliyah, fourteen, did not ask why anymore. She had known why since she was ten, and had decided, since then, that it was theirs.')
# 1.10 Ms. Lou -> Mr. Ortiz
R(B5, 'Maya Has Been Painting', 'her art teacher — a woman named Ms. Lou who had taken Maya under her wing in tenth grade and who Maya had come to trust', 'her art teacher — Mr. Ortiz, who had let her into Art II as a freshman against the rules and had been quietly opening doors ever since, and who Maya had come to trust')
R(B5, 'Maya Has Been Painting', 'Ms. Lou had come over on a Saturday in March. She had spent two hours in the basement.', 'Mr. Ortiz had come over on a Saturday in March. He had spent two hours in the basement.')
R(B5, 'Maya Has Been Painting', 'When Ms. Lou had come back upstairs, she had looked at Maya for a long time.', 'When Mr. Ortiz had come back upstairs, he had looked at Maya for a long time.')
R(B5, 'Maya Has Been Painting', 'She had said:', 'He had said:')
R(B5, 'Maya Has Been Painting', 'She had left a single piece of paper on the kitchen table.', 'He had left a single piece of paper on the kitchen table.')
R(B5, 'Maya Has Been Painting', 'Ms. Lou\'s careful handwriting', 'Mr. Ortiz\'s careful handwriting')
R(B5, 'Maya Has Been Painting', 'Ms. Lou', 'Mr. Ortiz', 4)
R(B5, 'Conversation with My Mother', 'the one Ms. Lou had described', 'the one Mr. Ortiz had described')
# 1.11 Theo's camera
R(B5, None, 'he had it slung over his shoulder for the first time in his life. He had no idea what he was doing.', 'he had it slung over his shoulder for the first time as a student instead of the yearbook kid. He had been photographing other people\'s moments for three years. He had never, until now, been told to make a picture of his own.')
# 1.12 Amara
R(B5, 'First Day', 'Yellow has been Amara\'s color since maybe ninth grade. I do not remember when it started.', 'Yellow has been Amara\'s color since the bench sign in third grade. I do not remember when it stopped being a joke.')
R(B5, 'Five Questions', 'She remembered, suddenly, the first day of seventh grade.', 'She remembered, suddenly, the first day of sixth grade.')
R(B5, 'Five Questions', 'She had said amaaaara, two syllables, hard.', 'She had said Amaara, two syllables, hard.')
R(B5, 'Five Questions', 'She had spent that whole year, and most of eighth grade, being Amaara', 'She had spent that whole year being Amaara')
R(B5, 'Five Questions', 'She had stopped doing it in ninth grade.', 'She had stopped doing it in seventh grade, in Mr. Patel\'s room, on purpose.')
R(B5, 'Five Questions', 'I did it in ninth grade.', 'I did it in seventh grade.')
R(B5, 'Five Questions', 'She has been the steady person in my life since I was three.', 'She has been the steady person in my life since I was six.')
R(B5, '=The Letter', 'since you were three', 'since you were six', 2)
R(B5, '=The Letter', 'for fifteen years', 'for twelve years', 3)
R(B5, '=The Letter', 'her grandmother was seventy and that the years', 'her grandmother was seventy-six and that the years')
R(B5, '=The Letter', 'I have been alive for seventy years.', 'I have been alive for seventy-six years.')
R(B5, 'Scattering', 'She drove with her grandmother and her mother to her east-coast college', 'She drove with her mother to her east-coast college')
# 1.13 Ms. Calloway
R(B5, None, 'reading bodies in classrooms for thirty years', 'reading bodies in classrooms for twenty-five years')
R(B5, None, 'Ms. Calloway, who has been doing this for thirty years, knows what she is doing.', 'Ms. Calloway, who has been doing this for twenty-five years, knows what she is doing.')
R(B5, None, 'I have done this with twelve senior classes before yours.', 'I have done this with three senior classes before yours.')
R(B5, None, 'I have watched thirteen years of graduation speeches at this school.', 'I have watched four years of graduation speeches at this school, and more than that before.')
R(B5, None, 'This is what Ms. Calloway did, every February, for thirteen years.', 'This is what Ms. Calloway did, every February, for as long as she had had seniors.')
R(B5, 'First Day', 'I noticed she switched to navy sometime around seventh grade. The green one is, I think, retired.', 'I noticed she switched to navy sometime around fifth grade. She wore the green one again, for one fall, when we were freshmen; I think it is retired now.')
# 1.14 Book 5
R(B5, 'First Day', 'which scratches are from my brother\'s class', 'which scratches are from Aaliyah\'s future class')
R(B5, 'First Day', 'was about Aaliyah. I do not remember what it said exactly. I was seven. Something about a sister and a hot wheel and a small theft, probably.', 'was about a block tower I knocked over. The second one was about Aaliyah. I was six. Something about a sister and a LEGO I should not have thrown.')
R(B5, 'First Day', 'a sister named Aaliyah who is fifteen and a sophomore at this school', 'a sister named Aaliyah who is fourteen and a freshman at this school')
R(B5, None, 'Aaliyah, in the audience at fifteen, was crying.', 'Aaliyah, in the audience at fourteen, was crying.')
R(B5, 'First Day', 'Pepper is eight now.', 'Pepper is nine now.')
R(B5, 'First Day', 'I have a comic I started drawing in fifth grade and have continued, off and on, for eight years.', 'I have a comic I started drawing the summer before third grade and have continued, off and on, for ten years.')
R(B5, 'Pepper', 'She had come into the family in fourth grade, after Biscuit died.', 'She had come into the family in third grade, in May, two years after Biscuit died.')
R(B5, 'Pepper', 'She had been there in fifth grade when he had been so mad about Biscuit', 'She had been there in fourth grade when he had been so mad about Biscuit')
R(B5, 'Funny Kid', 'In ninth grade I wrote a short story.', 'In ninth grade I wrote a short story I was willing to show a teacher.')
R(B5, 'Funny Kid', 'my ninth-grade English teacher — Ms. Diaz', 'my tenth-grade English teacher — Ms. Diaz')
R(B5, 'Maya Has Been Painting', 'reserved a chair for Maya at the table every day for fifteen years', 'reserved a chair for Maya at the table every day for thirteen years')
R(B5, 'Conversation with My Mother', 'I have been waiting for you, in some part of me, since I was four.', 'I have been waiting for you, in some part of me, since I was five.')
R(B5, 'August Fourteenth', 'Maya who had been making art in a basement for fifteen years', 'Maya who had been making art in a basement for thirteen years')
R(B5, 'August Fourteenth', 'the work I did in the basement for fifteen years', 'the work I did in the basement for thirteen years')
R(B5, 'Letter Kezia Wrote', 'I have friends. I have ten of them.', 'I have friends. I have nine of them.')
R(B5, None, 'her three other grandchildren — my cousins — who are all younger than me.', 'her three other grandchildren — my cousins — who are all younger than me — the older cousin who gave me Meditations is on my dad\'s side.')
R(B5, 'Cohort Dinner', 'We were going to be: Boston (Priya was the only one going east, technically — Theo', 'We were going to be: Vermont (Priya and Amara were the two going east — Theo')
R(B5, 'Cohort Dinner', 'Priya said, I am farther than Amara. Boston is farther.', 'Priya said, I am farther than Amara. Vermont is farther.')
R(B5, 'August Fourteenth', 'Priya said, I flew. From Boston.', 'Priya said, I flew. From Vermont.')
R(B5, 'Cohort Dinner', 'hosted for the ten of us in eighth grade', 'hosted for the nine of us, plus Mia on speakerphone, in eighth grade')
R(B5, None, 'The book has eight chapters left.', 'The book has seven chapters left.')
R(B5, 'Mia Returns', 'which I have kept on my nightstand since I was eight.', 'which I have kept on my nightstand since I was nine.')
R(B5, 'Mia Returns', 'Sofia\'s basement on Saturday and I am going to eat', 'Sofia\'s basement on Friday and I am going to eat')
R(B5, 'Mia Returns', 'at Sofia\'s basement on Saturday night. The cohort dinner.', 'at Sofia\'s basement on Friday night. The cohort dinner.')
R(B5, 'Airport', 'Marcus said, Mia. Saturday. Sofia\'s basement.', 'Marcus said, Mia. Friday. Sofia\'s basement.')
R(B5, 'Airport', 'The nine of them were in Mia\'s grandmother\'s living room.', 'The ten of them were in Mia\'s grandmother\'s living room.')
R(B5, 'Scattering', 'Theo took photographs of Mr. Patel and Mrs. Yamashita, who he visited at the elementary school in late July to say goodbye.', 'Theo took photographs of Mrs. Yamashita, who he visited at the elementary school in late July to say goodbye, and of Mr. Patel, in his garden.')
R(B5, 'August Fourteenth', 'A year and almost two months later, on August fourteenth', 'Almost a year later, on August fourteenth')
R(B5, 'August Fourteenth', 'Mr. Tate had retired the previous spring.', 'Mr. Tate had retired two springs before.')
R(B5, 'The Road', 'Theo would marry the sophomore he had started dating, eventually.', 'Theo would not marry the sophomore; he would marry, at twenty-five, a woman he had not yet met.')
R(B5, 'The Road', 'Darius would marry his college girlfriend, who he would meet in his sophomore year.', 'Darius would marry a woman who sold him a dog.')
R(B5, 'The Road', 'Mia would marry, in her thirties, a colleague in Pittsburgh.', 'Mia would marry a man who fixed the espresso machine at her coffee place.')
# 1.4 the brush (ch 26)
R(B5, 'Scattering', 'The object was a paintbrush. The paintbrush had been Maya\'s grandfather\'s. Maya had not known her grandfather had painted. Her mother said, Maya. He did not paint a lot. He painted, sometimes, in the basement. I found this in the attic last month. I think he would have wanted you to have it.', 'The object was a small sketchbook. It had been Maya\'s grandfather\'s — one of the ones from the box behind the furnace that had not gone into the show. Her mother said, Maya. Your grandmother gave me this one to give you. I wanted it to come from me.')
R(B5, 'Scattering', 'Maya took the paintbrush.', 'Maya took the sketchbook.')
R(B5, 'Scattering', 'It was old. The bristles were worn. The handle had her grandfather\'s small worn fingerprints in the wood.', 'It was old. The pages were soft at the corners. The pencil lines had her grandfather\'s small careful hand in them.')
R(B5, 'Scattering', 'Maya brought the paintbrush home. She put it in the basement studio next to her own brushes.', 'Maya brought the sketchbook home. She put it in the basement studio next to her own sketchbooks.')
R(B5, 'Scattering', 'the way Pepper had at nine years ago.', 'the way Pepper had, nine years ago.')
# 1.16
R(B5, '=A Note Before You Begin', 'This is the last book.', 'This is the last book about the kids as kids.')
R(B5, 'Closing Words', 'About this book. About all five.', 'About this book. About all of them so far.')
R(B5, 'Closing Words', 'Room 207: The Year We Walked Out is the fifth and final book in The Architecture of Grace series.', 'Room 207: The Year We Walked Out is the fifth book in The Architecture of Grace series. The sixth, The Dwelling, follows them into adulthood.')
DEL(B5, 'Closing Words', 'END OF THE ARCHITECTURE OF GRACE NOVEL SERIES')
R(B5, 'Closing Words', 'a boy telling his parents the truth about a stolen LEGO at six', 'a boy telling his parents, at eight, the truth about a lie he told at six')
# 2. typos
CAPTION(B5, 10, 'November through January. The hard months. The', 'November through January. The hard months. The quiet ones.')
CAPTION(B5, 19, 'March through April. The decision months. The', 'March through April. The decision months. The forgiving ones.')
CAPTION(B5, 26, 'May and June. The last weeks. The graduation. And — in', 'May and June. The last weeks. The graduation. And — in August — the return.')
R(B5, None, 'and that would be fine.* I do not want to do that anymore.', 'and that would be fine. I do not want to do that anymore.')
R(B5, None, 'I will add slowly.* She said, good.', 'I will add slowly. She said, good.')
R(B5, 'Mid-Year', 'She looked at us.', 'She looked at them.')
DEL(B5, 'Theo, Who Has Always', '— Theo')
# 3. safety
R(B5, None, 'The boy had been seen by professionals within an hour. He was okay.', 'The boy had been seen by professionals within an hour. He got help, and kept getting it. He was okay.')
# 4. voice 8
R(B5, 'Mid-Year', ' — J.A.R., in the back of the room, watching (Just kidding. J.A.R. is not in the room. The narrator is gone. But the narrator, for one moment in the last sentence of Part Two, allowed himself a small visible re-emergence to say: yes. The cohort is doing the work. The architecture is holding.)', '')

# Mid-sentence paragraph splits: merge p-blocks that end without terminal
# punctuation when the next p-block starts lowercase.
merged = 0
for si, s in enumerate(data[B5]['sections']):
    bl = s['blocks']
    i = 0
    while i < len(bl) - 1:
        a, b = bl[i], bl[i + 1]
        if (a['k'] == 'p' and b['k'] == 'p' and a.get('t') and b.get('t')
                and a['t'].rstrip()[-1] not in '.!?"”’)…:—' and b['t'][0].islower()):
            joined_t = a['t'].rstrip() + ' ' + b['t']
            joined_h = a['h'].rstrip() + ' ' + b['h']
            log.append((B5, label(B5, si), a['t'][-40:] + ' | ' + b['t'][:40], '(merged into one paragraph)'))
            a['t'], a['h'] = joined_t, joined_h
            del bl[i + 1]
            merged += 1
            continue
        i += 1
counts[B5] += merged

# ---------------------------------------------------------------- Book 6 ---
# 1.1 Aaliyah stays the sister; the wronged neighbour is Jaylen
R(B6, 'Whole Truth', 'there was a girl named Aaliyah, a neighbor, a year younger, and there was a small theft', 'there was a boy named Jaylen, a neighbor, a year older, who had been riding with them, and there was a small theft')
R(B6, 'Whole Truth', 'the lie was that Marcus said Aaliyah had broken the bike, when in truth Marcus had broken it himself and was afraid, and Aaliyah got blamed', 'the lie was that Marcus said Jaylen had broken the bike, when in truth Marcus had broken it himself and was afraid, and Jaylen got blamed')
R(B6, 'Whole Truth', 'his mother took him for ice cream at Mason’s, not as a reward', 'he started taking Aaliyah for ice cream at Mason’s, not as a reward')
R(B6, 'Whole Truth', 'It was never with Aaliyah.', 'It was never with Jaylen.')
R(B6, 'Whole Truth', 'Aaliyah’s family moved away when Marcus was nine. He never told her.', 'Jaylen’s family moved away when Marcus was nine. He never told him.')
R(B6, 'Whole Truth', 'the actual girl who had been blamed for breaking a bicycle she did not break', 'the actual boy who had been blamed for breaking a bicycle he did not break')
R(B6, 'Whole Truth', 'the one place Aaliyah could not see it.', 'the one place Jaylen could not see it.')
R(B6, 'Whole Truth', 'the exact size of a girl named Aaliyah.', 'the exact size of a boy named Jaylen.')
R(B6, 'Whole Truth', 'He found her at twenty-five.', 'He found him at twenty-five.')
R(B6, 'Whole Truth', 'She was findable. She was a grown woman now, living two states away', 'He was findable. He was a grown man now, living two states away')
R(B6, 'Whole Truth', 'He sat with her name and her contact information for four months.', 'He sat with his name and his contact information for four months.')
R(B6, 'Whole Truth', '“I never told Aaliyah. Everybody thinks I fixed it. I fixed it with my mom. I never fixed it with her. She got blamed for something I did and she never found out it wasn’t her, and I’ve known where she is for four months', '“I never told Jaylen. Everybody thinks I fixed it. I fixed it with my mom. I never fixed it with him. He got blamed for something I did and he never found out it wasn’t him, and I’ve known where he is for four months')
R(B6, 'Whole Truth', '“Because what if she doesn’t remember? What if I’ve been carrying this my whole life and to her it’s nothing? Then it was never about her at all.', '“Because what if he doesn’t remember? What if I’ve been carrying this my whole life and to him it’s nothing? Then it was never about him at all.')
R(B6, 'Whole Truth', '“Maybe it is just about you. Maybe she doesn’t remember. But you’re not telling her so she’ll remember. You’re telling her so you can stop being a person who let it stand. The confession isn’t for her memory.', '“Maybe it is just about you. Maybe he doesn’t remember. But you’re not telling him so he’ll remember. You’re telling him so you can stop being a person who let it stand. The confession isn’t for his memory.')
R(B6, 'Whole Truth', 'She wrote back. This is the part of the book I find almost unbearable, in the good way. She wrote back, and she did remember — not the bicycle, exactly, but the feeling, the feeling of being blamed for a thing she knew she had not done and not being believed, a feeling that, she wrote, had stayed with her in a shape she had never been able to name', 'He wrote back. This is the part of the book I find almost unbearable, in the good way. He wrote back, and he did remember — not the bicycle, exactly, but the feeling, the feeling of being blamed for a thing he knew he had not done and not being believed, a feeling that, he wrote, had stayed with him in a shape he had never been able to name')
R(B6, 'Whole Truth', 'She had carried it too.', 'He had carried it too.')
R(B6, 'Whole Truth', 'That’s the thing I needed and never got, she wrote.', 'That’s the thing I needed and never got, he wrote.')
R(B6, 'Room With No Number', 'the one about a bicycle and a girl named Aaliyah and a thing he said when he was six that was not true.', 'the one about a bicycle and his sister Aaliyah — and, it turned out, somebody else — and a thing he said when he was six that was not true.')
R(B6, 'Ms. Calloway', 'They told her about Marcus and Aaliyah, the whole story', 'They told her about Marcus and Jaylen, the whole story')
# 1.2 Pepper / Hope
R(B6, 'Room With No Number', 'Pepper had died in October of the year before, an old dog by then, gone the gentle way old dogs go, and Darius had said at last year’s dinner that he was not going to get another one,', 'Pepper had died in October of their senior year, and Hope, the dog who came after, had stayed his parents’ dog. Sergeant was the first dog that was Darius’s own again. Darius had said at last year’s dinner that he was not going to get another one of his own,')
# 1.5 Kezia's father
R(B6, 'Line She Held', 'Kezia’s father was not a good father.', 'The person Kezia had written to at eighteen — the one who had never been allowed in her grandmother’s house — was her father. I have kept that word out of five books because she kept it out; she is ready for it now. He was not a good father.')
R(B6, 'Line She Held', 'She had cut him off at twenty-two. Cleanly. With cause.', 'She had written him the letter at eighteen and left the door, as she put it, unlocked but not open.')
R(B6, 'Line She Held', 'the line I held for fourteen years was the right line', 'the line I held my whole life was the right line')
# 1.6 Mia's city
R(B6, 'Room With No Number', 'Mia flew in from Pittsburgh.', 'Mia flew in from Baltimore.')
R(B6, 'The Doors', 'She had moved to Pittsburgh for a job in a hospital’s communications office', 'She had moved to Baltimore for a job in a hospital’s communications office')
R(B6, 'Year Mia Did Not Come', 'He drove to Pittsburgh — Mia had moved back there by then —', 'He drove to Baltimore — Mia had moved back there by then —')
# 1.12 yellow
R(B6, 'Room With No Number', 'She had started wearing yellow in college and none of them knew exactly why and all of them had decided, privately, that it suited her', 'She had been wearing yellow since the bench sign in third grade, and all of them knew exactly why, and all of them had decided, privately, that it suited her')
# 1.14 Book 6
R(B6, 'Quiet Work', 'At the August fourteenth dinner the year Maya was thirty-four', 'At the August fourteenth dinner the year Maya was twenty-eight')
R(B6, 'The Doors', 'because Ms. Calloway had taught them, in the third grade, to look up', 'because Ms. Calloway had taught them, in the first grade, to look up')
R(B6, 'Quiet Work', 'one lesson in particular, the third-grade lesson, the look up lesson. Ms. Calloway had stopped a class once, in the third grade, and pointed at Maya, who was drawing instead of listening, and instead of scolding her she had said to the whole room: Look up. See what Maya’s doing? She’s making something.', 'one lesson in particular, the first-grade lesson, the look up lesson. Ms. Calloway had stopped a class once, in the first grade, and held up a picture Maya had drawn of a small girl looking up, and said to the whole room: Look up. See what Maya did? She’s making something.')
R(B6, 'Quiet Work', 'where nine people had been looking up at her since the third grade', 'where nine people had been looking up at her since the first grade')
R(B6, 'Stone You Cannot', 'the point of the going-around was to set the stone in the middle of the circle where everyone could see it, so you weren’t the only one holding it.', 'the point was to put the stone in a basket on the windowsill, where you could see it and did not have to carry it, so you weren’t the only one holding it.')
R(B6, None, 'Lena', 'Nora', 10)
R(B6, '=Theo', 'a small anxious thing named Biscuit who had taken over the lap-attendance duty', 'a small anxious thing named, on purpose, Biscuit, after the first dog Darius ever lost, who had taken over the lap-attendance duty')
# 2. Closing Words: duplicate signature before the text
DEL(B6, 'Closing Words', '— J.A.R.')
# 3. safety
R(B6, 'The Helper', 'Sofia got better. Slowly, the way it actually goes, with help that was clinical', 'Sofia got better. She saw a doctor and started treatment. Slowly, the way it actually goes, with help that was clinical')
INS(B6, '=A Note', 'Read carefully. I am still here, for a few more pages.', 'p', 'One more thing, before the book begins. There is a hard year in these pages. If you are in one yourself, in the United States you can call or text 988, the Suicide and Crisis Lifeline, any hour of any day. You do not have to hold it by yourself.')
# 4. voice 9
R(B6, '=Theo', 'He married again, eventually, at thirty-six, a woman named Priya — no, I am teasing, that would be too neat, and this book does not do neat. He married a woman named Carol', 'He married again, eventually, at thirty-six, a woman named Carol')

# ------------------------------------------------------------ sanity pass ---
report = []
for b in BOOKS:
    d = data[b]
    bad = 0
    for s in d['sections']:
        for blk in s['blocks']:
            if 't' in blk:
                if strip(blk['h']) != blk['t']:
                    bad += 1
                    print('MISMATCH', b, s['title'], blk['t'][:60])
    wo = sum(len(blk['t'].split()) for s in orig[b]['sections'] for blk in s['blocks'] if 't' in blk)
    wn = sum(len(blk['t'].split()) for s in d['sections'] for blk in s['blocks'] if 't' in blk)
    report.append((b, wo, wn, bad))
    json.dumps(d)  # valid

if '--write' in sys.argv:
    for b in BOOKS:
        with open(BASE + b + '.json', 'w', encoding='utf-8') as f:
            json.dump(data[b], f, ensure_ascii=False, separators=(',', ':'))
    # change log
    lines = ['# Applied edits — series editorial pass (novels)', '',
             'Applied from `_work/sel/review/novels.md` (all items), `room-12.md` §7, `room-36.md` (novel row) and `room-207.md` (stray asterisks).',
             'Every edit was made identically in the block\'s `t` and `h` fields.', '']
    lines.append('## Counts')
    lines.append('')
    lines.append('| Book | edits | words before | words after | t/h mismatches |')
    lines.append('|---|---|---|---|---|')
    for b, wo, wn, bad in report:
        lines.append(f'| {BOOKNAME[b]} ({b}.json) | {counts[b]} | {wo} | {wn} | {bad} |')
    lines.append(f'\nBook 5 mid-sentence paragraph splits merged: {merged}.\n')
    cur = None
    for b, ch, before, after in log:
        if b != cur:
            lines.append(f'\n## {BOOKNAME[b]} — {b}.json\n')
            cur = b
        bf = before if len(before) <= 110 else before[:107] + '…'
        af = after if len(after) <= 110 else after[:107] + '…'
        lines.append(f'- {ch}: "{bf}" → "{af}"')
    lines.append('\n## Not found / not applied\n')
    for m in missing:
        lines.append(f'- {BOOKNAME[m[0]]} {m[1]!r}: "{m[2][:90]}" — {m[3]}')
    lines.extend(NOTES)
    open('/home/user/architecture-of-grace/aog-deploy/_work/sel/review/applied-novels.md', 'w').write('\n'.join(lines) + '\n')

for r in report:
    print('%-12s words %6d -> %6d (%+d)  mismatches %d  edits %d' % (r[0], r[1], r[2], r[2] - r[1], r[3], counts[r[0]]))
print('merged splits:', merged)
print('missing:', len(missing))
for m in missing:
    print('  ', m)
