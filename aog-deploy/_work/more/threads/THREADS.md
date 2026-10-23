# Big Questions: threads across the courses (AOG-THREADS-V1, 2026-10-23)

Jimmy: "DO them all … showstopper for the young to the old." Some questions run through many courses. /threads shows
each one with lessons from many courses, from K–2 to adults, so a learner (or a teacher, or a family) can follow one
question across subjects.

| id | English | Español |
|---|---|---|
| fair | What makes a rule fair? | ¿Qué hace justa una regla? |
| true | How do we know what is true? | ¿Cómo sabemos qué es verdad? |
| owe | What do we owe each other? | ¿Qué nos debemos unos a otros? |
| change | How do people change the world? | ¿Cómo cambian el mundo las personas? |
| origins | Where do we come from? | ¿De dónde venimos? |
| care | How do we take care of body and mind? | ¿Cómo cuidamos el cuerpo y la mente? |
| goodlife | What makes a good life? | ¿Qué hace buena una vida? |
| disagree | How do people live together when they disagree? | ¿Cómo convivimos cuando no estamos de acuerdo? |
| work | How do work and money shape our lives? | ¿Cómo marcan nuestra vida el trabajo y el dinero? |
| patterns | How do patterns help us understand the world? | ¿Cómo nos ayudan los patrones a entender el mundo? |
| brave | What does it mean to be brave? | ¿Qué significa ser valiente? |
| earth | How do we care for the earth? | ¿Cómo cuidamos la Tierra? |

## Curator's job
You get an index file, one lesson per line: `course|unit|lesson id|band|title — main idea`.
For each thread, choose the lessons in your index that answer that question **directly and strongly** (a reader of the
lesson would say "yes, this is about that question"). Rules:
- At most 2 lessons per course per band for a thread; prefer spreading across bands (K–2 … 11–12, adult) and courses.
- Aim for 6–20 lessons per thread from your index; fewer is fine if the fit is weak. Never force a fit.
- Faith and texts courses are described, never preached: choose a lesson for what it teaches about the question.
- Write `why`: one short plain sentence (≤ 14 words) saying how the lesson answers the question, in English, and the
  same in Spanish (`why_es`). Neuro-affirming, neutral, no opinion.
Write `_work/more/threads/pick_<group>.json` (your group letter is given to you):
```json
{"fair": [{"c": "ss", "u": 3, "lid": "l5-2", "why": "…", "why_es": "…"}], "true": […], …}
```
Every thread id must be present (an empty list is fine). Check the JSON loads with python before you finish.
Reply with one line: counts per thread.
