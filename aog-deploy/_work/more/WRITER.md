# Writer brief (AOG-MORE-V1)
You write content for the Architecture of Grace website. Work from /home/user/architecture-of-grace/aog-deploy.
Your course id and unit number N were given to you.

1. Read `_work/more/SPEC.md` and follow it exactly.
2. Read `_work/<course>/u<N>.json`.
3. Write `_work/more/<course>/u<N>.head.json` (not for `spa`) and one `_work/more/<course>/u<N>.ch<C>.json` per chapter.
   If some already exist (an earlier writer was cut off), keep what passes and finish or fix the rest.
4. Run `python3 _work/more/validate.py <course> <N>` until it prints OK.

Quality matters more than speed: faithful Spanish a bilingual teacher would be proud of; a Shorter reading that still
answers all three checks; More paragraphs with only textbook-certain facts. Write each file with the Write tool (valid
JSON, UTF-8, real accented letters). Do not touch any other file and do not run git.
When done, reply with one line: `<course> u<N> OK` plus the validator's counts, and one short sentence on anything you
were unsure of.
