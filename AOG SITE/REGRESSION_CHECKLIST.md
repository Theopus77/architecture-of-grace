# Before You Publish — Quick Check

A 5-minute walk-through to catch anything broken **before** it goes live. Do this every time you're about to drag a new `index.html` onto Netlify. Open the file in your browser first (double-click it, or drag it into a Chrome tab) and click through the list.

If something here doesn't behave the way it's described, **don't publish** — flag it and we'll fix it.

---

## Part A · The 5-minute browser check

**1. It opens.**
The welcome screen loads — you see "How are you doing, really?" No blank page, no error.

**2. Language toggle.**
Click **ES**. The participant text turns to Spanish. Click **EN**, it comes back. (The educator dashboard stays English on purpose — that's expected.)

**3. The two doors work.**
- "Explore the Guide & Library" opens the Guide with **no** code prompt.
- "Educator Access · Results" asks for the code (`educator`) before showing results.

**4. Home / School toggle (the privacy control).**
In the "About you" box:
- It opens on **School** (navy pill on the left).
- **School** shows the label **"Student ID code"** and the note about not entering full names.
- Click **Home** → label changes to **"Name or ID"** and the note changes to the "stays on this device" wording.
- The navy highlight moves to whichever side you picked.

**5. Grade band is mode-aware.**
- In **School**, open the "Grade or age band" list → it stops at **12** (no College/Adult).
- Switch to **Home**, open it again → **College** and **Adult** are now there.

**6. The name-guard.**
In **School** mode, type a full name like `Jamie Ramsden` in the code field and press Begin → you get a gentle "that looks like a full name" warning. Type initials like `J.R.` → no warning, it lets you through.

**7. Take one check-in each way.**
Pick **Quick**, finish it. Then start over, pick **Thorough**, and confirm it asks the short written reflections. Both should reach a closing screen.

**8. Results show up.**
Open **Educator Access** (code `educator`) → the **Overview, Students, Home View, Growth, Export** tabs all load. On **Export**, download the CSV and confirm it opens with your responses in it.

**9. Sync status reads honestly** (Distribute tab).
The card should say responses are **saved here and sent** — never that delivery is "confirmed." If syncing is on and something is waiting, the little pill up top says "**… waiting to send**" rather than a falsely reassuring green.

---

## Part B · After you deploy

**10. Load the live site** (aog-checkin.netlify.app) and confirm the change you just made is actually there (e.g., the new wording shows up). Browsers cache — if it looks old, refresh with **Cmd-Shift-R**.

**11. Old results survive.** Responses are saved per-browser, so anything saved before is still there after a deploy. A deploy never wipes saved data.

---

## Part C · For a developer or agent (optional, one command)

An automated version of most of Part A lives in `regression_tests.js`. From a folder with Node installed:

```
npm install jsdom          # one time only
node regression_tests.js   path/to/index.html
```

Green = safe. Any FAIL line names exactly what regressed. Re-run it after any code change.

---

## The three golden rules (don't let these slip)

1. **Never rename the storage keys** `aogScreener.v2.results` or `aogScreener.v2.lang`. Renaming them makes every previously saved response disappear.
2. **Keep the internal mode values `rapid` and `depth`.** The labels people see ("Quick" / "Thorough") can change freely, but those two code words must not — saved records and the dashboard depend on them.
3. **The file must be named exactly `index.html`** in both GitHub and on Netlify, or the live site shows "Not Found."
