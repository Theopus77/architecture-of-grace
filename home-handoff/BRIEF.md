# The front page's doors: the drawing brief

The front page has fifteen doors with a pencil drawing on each. The Recording
Studio's door is Jimmy's drawing from "The Music Rooms" sheet
(`music-handoff/art/drawings/the-music-rooms.jpg`). The other fourteen are
older computer renders. This brief asks for fourteen new drawings in the same
hand, so every door matches the Studio.

## How to make them

1. Make the two sheets below with the same tool and style as "The Music Rooms".
   Paste a prompt as it is. Attach `the-music-rooms.jpg` as the style
   reference if the tool takes one.
2. Save the sheets as `home-1.jpg` and `home-2.jpg` (any size; 1700 px or more
   wide is best).
3. Run, from the repo:

       python3 tools/home-doors.py home-1.jpg home-2.jpg

   It cuts each drawing out and makes the banners. Look at
   `home-handoff/preview.jpg`. If every drawing sits on the right door, run it
   again with `--apply`. That points the front page and the Explore menu at the
   new drawings and bumps `sw.js`.
4. Run `node tools/check-contrast.js index.html` and
   `node tools/check-calm.js index.html`, then commit.

One drawing can be redone alone: name the file after its door (`faith.jpg`,
`contact.png` ...) and pass it to the tool.

The old banners stay. Other pages still use them.

## The style (the same for both sheets)

> Detailed graphite pencil drawing on warm cream paper, in the style of the
> attached "The Music Rooms" sheet: fine cross-hatching, soft shading, crisp
> outlines, each object drawn in three-quarter view from slightly above, with a
> light hand-hatched shadow under it. Black and grey pencil only, no colour.
> A plain cream background with nothing behind the objects. Each drawing is a
> small still life of real objects, set apart from the others with clear
> space. A small navy serif label under each drawing. No people, faces, hands
> or animals. No words, letters or numbers inside the drawings, except where a
> subject below asks for one.

## Sheet 1: "The House · 1" (4 across, 2 rows)

> A sheet titled "The House" in a navy serif, with eight pencil still lifes in
> two rows of four, read left to right:
>
> 1. **Today**: an open journal with a pencil lying across its pages, and a
>    small round hand mirror standing beside it.
> 2. **Daily Drafts**: a tear-off desk calendar showing a large "1", a small
>    stack of index cards and a pencil.
> 3. **The Lab Bench**: a classic brass-and-steel student microscope, a small
>    stoppered bottle and a glass slide.
> 4. **Check-in**: a metal watering can beside a small clay pot with a young
>    seedling.
> 5. **Conversation Starters**: a round teapot, two mugs and a small stack of
>    blank question cards on a table.
> 6. **The Courses**: a small stone archway, a stack of three hardback books
>    and a globe on a stand.
> 7. **SEL**: an oval mirror on a stand, a small potted sprout and a pencil.
> 8. **Faith & Texts**: an old book lying open on a wooden lectern, a rolled
>    scroll and a clay oil lamp with a small flame. The pages show only faint
>    lines, never real writing.

## Sheet 2: "The House · 2" (4 across, 2 rows; the last row has three)

> A sheet titled "The House" in a navy serif, with seven pencil still lifes,
> four in the top row and three below, read left to right:
>
> 1. **Families**: a porch lantern, a potted plant and a folded note.
> 2. **Educator Dashboard**: an open planner with ruled pages, a cup of
>    pencils and an apple.
> 3. **The Standards Crosswalk**: a long rolled chart, a sheet with a ruled
>    table, a wooden ruler and a pencil.
> 4. **Professional Development**: a stack of books, round reading glasses
>    folded on top, and a coffee mug.
> 5. **Privacy & your data**: a closed book with a small padlock on its strap
>    and an old key lying beside it.
> 6. **Contact**: a sealed envelope, a fountain pen and a small inkwell.
> 7. **Quiet Space**: a lit candle in a low holder, a small mended bowl and a
>    smooth stone.

The tool reads the sheets in this order: sheet 1 gives Today to Faith & Texts,
sheet 2 gives Families to Quiet Space. If a sheet comes back with the drawings
in another order, save each drawing alone under its door's name instead.

## Rules the drawings keep

- Faith & Texts: objects only. No God, no prophet, no figure of any kind, and no
  writing that looks like real words or verses.
- No people anywhere, so every learner can see themself in the room.
- Calm pictures: nothing frightening, no clutter, one main object and one or two
  beside it.
