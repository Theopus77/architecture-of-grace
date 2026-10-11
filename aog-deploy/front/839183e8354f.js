
/* ═══ PECS FACE ART (build .30db) ═══════════════════════════════════════════
   Hand-drawn cartoon faces for the two face categories (Feelings, Sensations),
   keyed by the emoji each card already carries — the emoji stays the card's
   IDENTITY (it rides the strip records, the ES lookup and the old inline
   handlers), the face is only how that identity is DRAWN. Every render
   surface (library, strip, print window, Show-to-Teacher overlay) draws
   through aogPecsIcon(), so a strip built before this build still gets its
   faces. One consistent character across all twenty face cards — same skin,
   same hair — because a PECS reader must read the EXPRESSION, never a new
   character.
   Each svg is width/height 1em so the existing font-size spans (36px grid,
   28px strip, 32px print) size it with zero CSS changes.
   ⚠ .30db originally kept the object cards (Needs, Places, People, Sensory
   Needs) as emoji ("a bus gains nothing from a face"). Jimmy saw the faces
   on his iPad on 2026-08-31 and asked for the whole deck to match — so
   AOG_PECS_OBJECTS below (build .30dd) draws the rest in the same hand.
   The one-character rule still binds every card that SHOWS the child;
   People cards are the deliberate exception, because Teacher and Nurse are
   identity cards and identity requires a different person. */
var AOG_PECS_FACES = (function () {
  var SKIN = '#F8C9A2', LINE = '#7A4A28', HAIRC = '#503421', INK = '#2B1B10', MOUTH = '#7A3B2E';
  var HEAD = '<circle cx="32" cy="35" r="21" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="2"/>';
  var HAIR = '<path d="M11.5 32 C12 16 22 12.5 32 12.5 C42 12.5 52 16 52.5 32 C48 21 41 19 32 19 C23 19 16 21 11.5 32 Z" fill="' + HAIRC + '"/>';
  var BLUSH = '<ellipse cx="20" cy="42" rx="4" ry="2.5" fill="#F3A27E" opacity=".7"/><ellipse cx="44" cy="42" rx="4" ry="2.5" fill="#F3A27E" opacity=".7"/>';
  function wrap(inner) { return '<svg viewBox="0 0 64 64" width="1em" height="1em" style="display:block;margin:0 auto" aria-hidden="true" focusable="false">' + inner + '</svg>'; }
  function st(d, c, w) { return '<path d="' + d + '" fill="none" stroke="' + (c || HAIRC) + '" stroke-width="' + (w || 2.2) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function dots(r) { return '<circle cx="24.5" cy="34" r="' + r + '" fill="' + INK + '"/><circle cx="39.5" cy="34" r="' + r + '" fill="' + INK + '"/>'; }
  var BROWS = st('M20 28 Q24.5 25.5 29 28') + st('M35 28 Q39.5 25.5 44 28');
  var SADBROWS = st('M20 29.5 Q24.5 28.5 29 26.5') + st('M35 26.5 Q39.5 28.5 44 29.5');
  var KNITBROWS = st('M20 27.5 L28 29.5') + st('M44 27.5 L36 29.5');
  var SLEEPYEYES = st('M20.5 34 Q24.5 36.5 28.5 34', INK, 2.4) + st('M35.5 34 Q39.5 36.5 43.5 34', INK, 2.4);
  var CALMEYES = st('M20.5 33.5 Q24.5 35.8 28.5 33.5', INK, 2.4) + st('M35.5 33.5 Q39.5 35.8 43.5 33.5', INK, 2.4);
  var SQUEEZEEYES = st('M21.5 31.5 L27 34.5 L21.5 37.5', INK, 2.2) + st('M42.5 31.5 L37 34.5 L42.5 37.5', INK, 2.2);
  var WAVYMOUTH = st('M25.5 46.5 Q28.7 44.5 32 46.5 Q35.3 48.5 38.5 46.5', MOUTH, 2.4);
  return {
    /* ── Feelings ── */
    '😊': wrap(HEAD + HAIR + BLUSH + BROWS + dots(2.7) + st('M23 42 Q32 50.5 41 42', MOUTH, 2.6)),
    '😢': wrap(HEAD + HAIR + SADBROWS + dots(2.7) + st('M26 48 Q32 43 38 48', MOUTH, 2.6) +
      '<path d="M20.5 40.5 Q23.5 45.5 20.5 48 Q17.5 45.5 20.5 40.5 Z" fill="#8FC4EC" stroke="#4E92C8" stroke-width="1.2"/>'),
    '😡': wrap(HEAD + '<circle cx="32" cy="35" r="21" fill="#E8756A" opacity=".22"/>' + HAIR + BLUSH +
      st('M20 26.5 L28.5 30.5', '#3E2617', 2.6) + st('M44 26.5 L35.5 30.5', '#3E2617', 2.6) + dots(2.4) +
      st('M25 47.5 Q32 43.5 39 47.5', MOUTH, 2.6) + st('M49 20 L52 17 M52 21 L55 18', '#B84A39', 2)),
    '😨': wrap(HEAD + HAIR + st('M19.5 24.5 Q24.5 22 29.5 24.5') + st('M34.5 24.5 Q39.5 22 44.5 24.5') +
      '<circle cx="24.5" cy="34" r="4.8" fill="#fff" stroke="' + INK + '" stroke-width="1.4"/><circle cx="39.5" cy="34" r="4.8" fill="#fff" stroke="' + INK + '" stroke-width="1.4"/><circle cx="24.5" cy="35" r="1.9" fill="' + INK + '"/><circle cx="39.5" cy="35" r="1.9" fill="' + INK + '"/>' +
      '<ellipse cx="32" cy="47" rx="4" ry="3.2" fill="#6B2E24"/>' +
      '<path d="M50 22 Q53 26.5 50 29 Q47 26.5 50 22 Z" fill="#8FC4EC"/>'),
    '😕': wrap(HEAD + HAIR + st('M20 29.5 Q24.5 28.8 29 29.5') + st('M35 25.5 Q39.5 23.5 44 25.8') + dots(2.7) +
      st('M25 46.5 Q28.5 44 32 46 Q35.5 48 39.5 45', MOUTH, 2.5) +
      st('M50 15 Q50 11.5 53.5 11.5 Q57 11.5 57 15 Q57 17.6 53.8 18.6 L53.8 21', '#8A5A38', 2) +
      '<circle cx="53.8" cy="25" r="1.5" fill="#8A5A38"/>'),
    '😭': wrap(HEAD + HAIR + SADBROWS + st('M20.5 33 Q24.5 36.5 28.5 33', INK, 2.4) + st('M35.5 33 Q39.5 36.5 43.5 33', INK, 2.4) +
      '<path d="M25.5 44 Q32 42.5 38.5 44 Q37.5 51.5 32 51.5 Q26.5 51.5 25.5 44 Z" fill="#6B2E24"/>' +
      st('M21.5 38 Q20.5 44 20 48.5', '#8FC4EC', 3) + st('M42.5 38 Q43.5 44 44 48.5', '#8FC4EC', 3)),
    '😴': wrap(HEAD + HAIR + BLUSH + st('M20 28.5 Q24.5 27.5 29 28.5') + st('M35 28.5 Q39.5 27.5 44 28.5') + SLEEPYEYES +
      '<ellipse cx="32" cy="46.5" rx="2.6" ry="3" fill="#6B2E24"/>' +
      st('M45 12 L51 12 L45 18 L51 18', '#8A5A38', 2.2) + st('M53 20 L57.5 20 L53 24.5 L57.5 24.5', '#8A5A38', 1.8)),
    '🤧': wrap(HEAD + HAIR + BLUSH + SADBROWS + SLEEPYEYES +
      '<circle cx="32" cy="39.5" r="3.2" fill="#E8756A" stroke="#C25548" stroke-width="1.2"/>' +
      st('M25.5 47.5 Q28.7 45.5 32 47.5 Q35.3 49.5 38.5 47.5', MOUTH, 2.4)),
    '🥳': wrap(HEAD + HAIR +
      '<path d="M40.5 4.5 L47.5 17.5 L33.5 14.5 Z" fill="#D9A33B" stroke="#B8862F" stroke-width="1.2"/><circle cx="40.5" cy="4.5" r="2.2" fill="#B84A39"/>' +
      BLUSH + BROWS + dots(3) +
      '<path d="M22.5 41.5 Q32 52.5 41.5 41.5 Z" fill="#6B2E24"/><path d="M24.5 42.2 Q32 44.5 39.5 42.2 L38.6 45 Q32 47 25.4 45 Z" fill="#fff"/>' +
      '<circle cx="9" cy="14" r="1.7" fill="#B84A39"/><circle cx="14" cy="6" r="1.5" fill="#4E92C8"/><circle cx="55" cy="28" r="1.6" fill="#6FA05C"/><circle cx="8" cy="26" r="1.4" fill="#D9A33B"/>'),
    '😐': wrap(HEAD + HAIR + BLUSH + st('M20 28.5 Q24.5 27.5 29 28.5') + st('M35 28.5 Q39.5 27.5 44 28.5') + CALMEYES +
      st('M27 45.5 Q32 48.5 37 45.5', MOUTH, 2.4)),
    /* ── Sensations ── */
    '🔊': wrap(HEAD + HAIR + KNITBROWS + SQUEEZEEYES + WAVYMOUTH +
      '<circle cx="12.5" cy="36" r="6" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="2"/><circle cx="51.5" cy="36" r="6" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="2"/>' +
      st('M5.5 27 Q2.5 36 5.5 45', '#B8862F', 2) + st('M58.5 27 Q61.5 36 58.5 45', '#B8862F', 2)),
    '💡': wrap(HEAD + HAIR +
      '<path d="M17 23.5 Q32 18.5 47 23.5 L47 27.5 Q32 22.5 17 27.5 Z" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="1.8"/>' +
      st('M21 34.2 L28 34.2', INK, 2.6) + st('M36 34.2 L43 34.2', INK, 2.6) +
      st('M26 47 Q32 45 38 47', MOUTH, 2.4) +
      '<circle cx="11" cy="11" r="4.5" fill="#F2C14E" stroke="#D9A33B" stroke-width="1.5"/>' +
      st('M11 2.5 L11 5 M2.5 11 L5 11 M17 5 L18.8 3.2 M17 17 L18.8 18.8 M4.5 3.5 L6 5', '#D9A33B', 1.8)),
    '🥵': wrap(HEAD + '<circle cx="32" cy="35" r="21" fill="#E8756A" opacity=".25"/>' + HAIR + BLUSH + SADBROWS + SLEEPYEYES +
      '<ellipse cx="32" cy="47" rx="4.6" ry="3.6" fill="#6B2E24"/>' +
      '<path d="M50 20 Q53 24.5 50 27 Q47 24.5 50 20 Z" fill="#8FC4EC"/><path d="M14 20 Q17 24.5 14 27 Q11 24.5 14 20 Z" fill="#8FC4EC"/>' +
      st('M27 9 Q25 6 27 3', '#E8756A', 2) + st('M37 9 Q39 6 37 3', '#E8756A', 2)),
    '🥶': wrap('<circle cx="32" cy="35" r="21" fill="#F3D9C3" stroke="#7A90A8" stroke-width="2"/><circle cx="32" cy="35" r="21" fill="#8FC4EC" opacity=".18"/>' + HAIR + SADBROWS + dots(2.6) +
      st('M24.5 46.5 L27.5 44.8 L30.5 47 L33.5 44.8 L36.5 47 L39.5 45.2', '#4E7FB5', 2.4) +
      '<ellipse cx="20" cy="42" rx="4" ry="2.5" fill="#A8C8E8" opacity=".8"/><ellipse cx="44" cy="42" rx="4" ry="2.5" fill="#A8C8E8" opacity=".8"/>' +
      st('M7 30 Q5.5 35 7 40', '#7FA8D0', 2) + st('M57 30 Q58.5 35 57 40', '#7FA8D0', 2) +
      st('M52 6 L52 18 M46 12 L58 12 M47.8 7.8 L56.2 16.2 M56.2 7.8 L47.8 16.2', '#7FA8D0', 1.7)),
    '🌀': wrap(HEAD + HAIR + st('M19.5 26 Q24.5 24 29.5 26.5') + st('M34.5 26.5 Q39.5 24 44.5 26') +
      '<path d="M28 34 a3.4 3.4 0 1 1 -3.4 -3.4 a2.1 2.1 0 1 1 -2.1 2.1" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M43 34 a3.4 3.4 0 1 1 -3.4 -3.4 a2.1 2.1 0 1 1 -2.1 2.1" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>' +
      WAVYMOUTH + st('M9 16 Q16 7 27 6', '#B8862F', 2) + st('M55 16 Q48 7 37 6', '#B8862F', 2)),
    '🤢': wrap(HEAD + '<path d="M12.5 39 Q22 44 32 44 Q42 44 51.5 39 Q48 53 32 56 Q16 53 12.5 39 Z" fill="#A8C97F" opacity=".5"/>' + HAIR + SADBROWS +
      st('M21 33 Q24.5 34.8 28 33', INK, 2.3) + st('M36 33 Q39.5 34.8 43 33', INK, 2.3) +
      st('M25.5 48 Q28.7 46 32 48 Q35.3 50 38.5 48', '#5B7A3E', 2.4) +
      '<ellipse cx="20" cy="42" rx="4" ry="2.5" fill="#9BBF6E" opacity=".7"/><ellipse cx="44" cy="42" rx="4" ry="2.5" fill="#9BBF6E" opacity=".7"/>'),
    '⚡': wrap(HEAD + HAIR + st('M20 26.5 L28.5 30') + st('M44 26.5 L35.5 30') +
      st('M21 34.5 L28 34.5', INK, 2.4) + '<circle cx="39.5" cy="34" r="2.6" fill="' + INK + '"/>' +
      '<rect x="24.5" y="43.5" width="15" height="5" rx="2.4" fill="#fff" stroke="' + MOUTH + '" stroke-width="1.8"/>' +
      st('M29.5 43.5 L29.5 48.5 M34.5 43.5 L34.5 48.5', MOUTH, 1.4) +
      '<path d="M51 6 L45.5 15.5 L49.5 15.5 L44.5 24.5 L53.5 13.5 L49.5 13.5 Z" fill="#F2C14E" stroke="#B8862F" stroke-width="1.2"/>'),
    '😣': wrap(HEAD + HAIR + KNITBROWS + SQUEEZEEYES +
      st('M25 47 Q27.3 45 29.6 47 Q31.9 49 34.2 47 Q36.5 45 38.8 47', MOUTH, 2.3) +
      '<circle cx="17.5" cy="40" r="1.4" fill="#E8756A"/><circle cx="20.5" cy="43" r="1.2" fill="#E8756A"/><circle cx="16.5" cy="44.5" r="1.2" fill="#E8756A"/>' +
      st('M49 36 L54 33 M49.5 41 L54.5 39', '#B8862F', 1.8)),
    '👃': wrap(HEAD + HAIR + KNITBROWS + st('M20.5 33 Q24.5 35.8 28.5 33', INK, 2.4) + st('M35.5 33 Q39.5 35.8 43.5 33', INK, 2.4) +
      '<ellipse cx="32" cy="40.5" rx="5.6" ry="4.2" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="1.8"/>' +
      st('M28 38.5 Q32 37 36 38.5', LINE, 1.4) + st('M28.5 42.5 Q32 43.8 35.5 42.5', LINE, 1.4) +
      st('M26 49.5 Q32 47 38 49.5', MOUTH, 2.4) +
      st('M10 14 Q12 10.5 10 7 M15.5 16 Q17.5 12 15.5 8', '#8FAF60', 2.2)),
    '🌫️': wrap(HEAD + HAIR +
      '<circle cx="13.5" cy="26" r="5.5" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="2"/><circle cx="50.5" cy="26" r="5.5" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="2"/>' +
      st('M19.5 25 Q24.5 23 29.5 25.5') + st('M34.5 25.5 Q39.5 23 44.5 25') +
      '<circle cx="24.5" cy="34" r="4.2" fill="#fff" stroke="' + INK + '" stroke-width="1.5"/><circle cx="39.5" cy="34" r="4.2" fill="#fff" stroke="' + INK + '" stroke-width="1.5"/><circle cx="25.5" cy="34.6" r="1.6" fill="' + INK + '"/><circle cx="38.5" cy="34.6" r="1.6" fill="' + INK + '"/>' +
      WAVYMOUTH +
      '<circle cx="20" cy="8" r="4.5" fill="#C9CFD6" opacity=".85"/><circle cx="28" cy="6" r="5.2" fill="#D8DDE3" opacity=".85"/><circle cx="37" cy="7" r="4.8" fill="#C9CFD6" opacity=".85"/><circle cx="44" cy="9" r="3.8" fill="#D8DDE3" opacity=".85"/>')
  };
})();
/* ═══ PECS OBJECT & PEOPLE ART (build .30dd) ════════════════════════════════
   The rest of the deck, drawn in the same hand as the faces: same palette,
   same 64×64 grid, same rounded line, keyed by the emoji each card already
   carries. A key shared across categories draws once for both homes on
   purpose (💧 Water in Needs and Sensory Needs, 🏃 Gym and Movement,
   🪑 Office and Sit Down) — one thing, one picture, wherever it appears. */
var AOG_PECS_OBJECTS = (function () {
  var SKIN = '#F8C9A2', LINE = '#7A4A28', HAIRC = '#503421', INK = '#2B1B10', MOUTH = '#7A3B2E';
  var GOLD = '#D9A33B', GOLDD = '#B8862F', CREAM = '#FBF3E2', BLUE = '#8FC4EC', BLUED = '#4E92C8',
      RED = '#B84A39', GREEN = '#6FA05C', GREEND = '#4E7A3F', NAVY = '#3E5375', WOOD = '#8A5A38';
  function wrap(inner) { return '<svg viewBox="0 0 64 64" width="1em" height="1em" style="display:block;margin:0 auto" aria-hidden="true" focusable="false">' + inner + '</svg>'; }
  function st(d, c, w) { return '<path d="' + d + '" fill="none" stroke="' + (c || LINE) + '" stroke-width="' + (w || 2.2) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  /* The same child as the face cards, at any size. Head drawn about (0,0),
     radius 10, hair swept the same way; `face` overrides the default
     dot-eyes-and-smile; `hair` recolors it for the People cards only. */
  function head(x, y, s, face, hair) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<circle cx="0" cy="0" r="10" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="1.7"/>' +
      '<path d="M-9.6 -1.5 C-9.3 -8.9 -4.7 -10.6 0 -10.6 C4.7 -10.6 9.3 -8.9 9.6 -1.5 C7.5 -6.5 4.2 -7.5 0 -7.5 C-4.2 -7.5 -7.5 -6.5 -9.6 -1.5 Z" fill="' + (hair || HAIRC) + '"/>' +
      (face || ('<circle cx="-3.5" cy="-.3" r="1.25" fill="' + INK + '"/><circle cx="3.5" cy="-.3" r="1.25" fill="' + INK + '"/>' +
        '<path d="M-3.2 3.8 Q0 6.4 3.2 3.8" fill="none" stroke="' + MOUTH + '" stroke-width="1.35" stroke-linecap="round"/>')) +
      '</g>';
  }
  /* Full-size head for the sensory cards that ARE the child — same geometry
     as the face cards (cx32 cy35 r21) so they sit level in the grid. */
  var BIGHEAD = '<circle cx="32" cy="35" r="21" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="2"/>' +
    '<path d="M11.5 32 C12 16 22 12.5 32 12.5 C42 12.5 52 16 52.5 32 C48 21 41 19 32 19 C23 19 16 21 11.5 32 Z" fill="' + HAIRC + '"/>';
  var CALM = st('M20.5 33.5 Q24.5 35.8 28.5 33.5', INK, 2.4) + st('M35.5 33.5 Q39.5 35.8 43.5 33.5', INK, 2.4);
  var SLEEPY = st('M20.5 34 Q24.5 36.5 28.5 34', INK, 2.4) + st('M35.5 34 Q39.5 36.5 43.5 34', INK, 2.4);
  var DOTS = '<circle cx="24.5" cy="34" r="2.7" fill="' + INK + '"/><circle cx="39.5" cy="34" r="2.7" fill="' + INK + '"/>';
  function thumb(up) {
    var hand = '<path d="M25 28 L38 28 Q47 28 47 35 L46 44 Q45.5 51 38.5 51 L27 51 Q22 51 22 46 L22 33 Q22 28 25 28 Z" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="2.2"/>' +
      '<path d="M25 28 Q24 16 29.5 13.5 Q34.5 11.5 35.5 17 L36.5 28" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      st('M35 35 L46 35 M35 40.5 L46 40.5 M35 46 L44.5 46', LINE, 1.5) +
      '<rect x="10" y="30" width="10" height="21" rx="3" fill="' + BLUED + '" stroke="' + NAVY + '" stroke-width="1.8"/>';
    return up ? hand : '<g transform="translate(64 64) rotate(180)">' + hand + '</g>';
  }
  return {
    /* ── Needs ── */
    '🚹': wrap('<rect x="17" y="8" width="30" height="48" rx="3.5" fill="' + CREAM + '" stroke="' + LINE + '" stroke-width="2.2"/>' +
      '<circle cx="41.5" cy="33" r="2.4" fill="' + GOLDD + '"/>' +
      '<rect x="24" y="16" width="16" height="17" rx="2.5" fill="#fff" stroke="' + GOLDD + '" stroke-width="1.8"/>' +
      '<circle cx="32" cy="21" r="2.6" fill="' + INK + '"/>' + st('M32 24.5 L32 29 M32 25.5 L28.5 28.5 M32 25.5 L35.5 28.5 M32 29 L29.5 32 M32 29 L34.5 32', INK, 1.7)),
    '💧': wrap('<path d="M21.5 18 L42.5 18 L40 53 L24 53 Z" fill="#fff" stroke="' + LINE + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M23.2 33 L40.8 33 L39.3 51.2 L24.7 51.2 Z" fill="' + BLUE + '"/>' +
      st('M23.2 33 Q28 30.8 32 33 Q36 35.2 40.8 33', BLUED, 2) +
      '<path d="M47 8 Q51.5 14.5 47 18 Q42.5 14.5 47 8 Z" fill="' + BLUE + '" stroke="' + BLUED + '" stroke-width="1.4"/>'),
    '🍞': wrap('<path d="M10.5 29 Q10.5 17.5 23 17.5 L46 17.5 Q54.5 17.5 54.5 25.5 Q54.5 31 49.5 32 L49.5 44 Q49.5 48.5 45 48.5 L15 48.5 Q10.5 48.5 10.5 44 Z" fill="#E8B36B" stroke="' + LINE + '" stroke-width="2.2"/>' +
      st('M49.5 32 Q44 33.5 43 44', LINE, 1.6) +
      st('M18 30 Q21 25.5 25.5 28 M29 27 Q32 22.5 36.5 25', '#B8813F', 2)),
    '💪': wrap(head(32, 14, 1) +
      '<path d="M25 24 Q32 21 39 24 L41.5 42 L22.5 42 Z" fill="' + BLUE + '" stroke="' + BLUED + '" stroke-width="1.8"/>' +
      st('M25.5 26.5 L13 15.5 M38.5 26.5 L51 15.5', LINE, 2.6) +
      '<circle cx="11.5" cy="13.5" r="3" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="1.5"/><circle cx="52.5" cy="13.5" r="3" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="1.5"/>' +
      st('M27 42 L26 55 M37 42 L38 55', LINE, 2.6) +
      st('M5 22 L8.5 24.5 M59 22 L55.5 24.5 M4 30 L8 30 M60 30 L56 30', GOLDD, 2)),
    '🤝': wrap('<path d="M4 33 Q12 27.5 21 30.5 L34 35.5 Q37 37 36 40 Q35 42.8 31.5 42 L22 39.5 Q11 41.5 4 38.5 Z" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="2"/>' +
      '<path d="M60 33 Q52 27.5 43 30.5 L30 35.5 Q27 37 28 40 Q29 42.8 32.5 42 L42 39.5 Q53 41.5 60 38.5 Z" fill="#EDB68C" stroke="' + LINE + '" stroke-width="2"/>' +
      '<rect x="2" y="27" width="8" height="14" rx="2.5" fill="' + BLUED + '" stroke="' + NAVY + '" stroke-width="1.6"/>' +
      '<rect x="54" y="27" width="8" height="14" rx="2.5" fill="' + GOLD + '" stroke="' + GOLDD + '" stroke-width="1.6"/>' +
      st('M24 20 L26.5 24 M32 17.5 L32 22.5 M40 20 L37.5 24', GOLDD, 2)),
    '🤐': wrap(BIGHEAD + st('M20 28.5 Q24.5 27.5 29 28.5') + st('M35 28.5 Q39.5 27.5 44 28.5') + CALM +
      '<rect x="23" y="43.5" width="18" height="6" rx="3" fill="#fff" stroke="' + MOUTH + '" stroke-width="1.8"/>' +
      st('M26.5 43.5 L26.5 49.5 M30 43.5 L30 49.5 M33.5 43.5 L33.5 49.5 M37 43.5 L37 49.5', MOUTH, 1.3) +
      '<circle cx="42.5" cy="46.5" r="2.2" fill="' + GOLDD + '"/>'),
    '📖': wrap('<path d="M32 17 Q21 11.5 9.5 14.5 L9.5 46.5 Q21 43.5 32 49 Q43 43.5 54.5 46.5 L54.5 14.5 Q43 11.5 32 17 Z" fill="#fff" stroke="' + LINE + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      st('M32 17 L32 49', LINE, 2) +
      st('M15 22 Q22 20.5 27 22.5 M15 28.5 Q22 27 27 29 M15 35 Q22 33.5 27 35.5 M37 22.5 Q42 20.5 49 22 M37 29 Q42 27 49 28.5 M37 35.5 Q42 33.5 49 35', '#9AA5B8', 1.7)),
    '✏️': wrap('<path d="M42 10 L52 20 L26 46 L14 50 L18 38 Z" fill="' + GOLD + '" stroke="' + GOLDD + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M18 38 L26 46 L14 50 Z" fill="' + SKIN + '" stroke="' + GOLDD + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M16.2 43.8 L14 50 L20.2 47.8 Z" fill="' + INK + '"/>' +
      '<path d="M42 10 L52 20 L48.5 23.5 L38.5 13.5 Z" fill="' + RED + '" stroke="' + GOLDD + '" stroke-width="1.6"/>' +
      st('M28 56 Q36 52 42 55.5 Q48 59 56 55', BLUED, 2.4)),
    '🎮': wrap('<path d="M18 22 L46 22 Q56 22 57 34 Q58 44 50 45 Q45 45.5 42 40 L22 40 Q19 45.5 14 45 Q6 44 7 34 Q8 22 18 22 Z" fill="' + NAVY + '" stroke="' + INK + '" stroke-width="2"/>' +
      st('M19 28 L19 36 M15 32 L23 32', '#fff', 2.6) +
      '<circle cx="43" cy="29" r="2.6" fill="' + GOLD + '"/><circle cx="49" cy="34" r="2.6" fill="' + RED + '"/>'),
    '🛏️': wrap(st('M8 20 L8 52 M56 32 L56 52', WOOD, 3) +
      '<rect x="8" y="36" width="48" height="10" rx="3" fill="' + CREAM + '" stroke="' + LINE + '" stroke-width="2"/>' +
      '<rect x="11" y="28" width="14" height="9" rx="4" fill="#fff" stroke="' + LINE + '" stroke-width="1.8"/>' +
      head(19, 25, 0.75, '<path d="M-3.6 -.5 Q-1.8 1 0 -.5" fill="none" stroke="' + INK + '" stroke-width="1.4" stroke-linecap="round"/><path d="M1.5 -.5 Q3.3 1 5.1 -.5" fill="none" stroke="' + INK + '" stroke-width="1.4" stroke-linecap="round"/><path d="M-1 4.2 Q.8 5.6 2.6 4.2" fill="none" stroke="' + MOUTH + '" stroke-width="1.3" stroke-linecap="round"/>') +
      '<path d="M27 30 Q42 26 54 30 L54 36 L27 36 Z" fill="' + BLUE + '" stroke="' + BLUED + '" stroke-width="1.8"/>' +
      st('M42 12 L48 12 L42 18 L48 18 M51 8 L55.5 8 L51 12.5 L55.5 12.5', WOOD, 1.9)),
    /* ── Actions ── */
    '👍': wrap(thumb(true)),
    '👎': wrap(thumb(false)),
    '⏸️': wrap('<path d="M22 8 L42 8 L56 22 L56 42 L42 56 L22 56 L8 42 L8 22 Z" fill="#C25548" stroke="#8E352A" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M26 40 L26 26 Q26 23.5 28.2 23.5 Q30 23.5 30 26 L30 21 Q30 18.5 32.2 18.5 Q34 18.5 34 21 L34 25 Q34.5 23 36.5 23.3 Q38.5 23.6 38.5 26 L38.5 36 Q38.5 44 32 44 Q27.5 44 26 40 Z" fill="#fff" stroke="#8E352A" stroke-width="1.6" stroke-linejoin="round"/>'),
    '▶️': wrap('<circle cx="32" cy="32" r="22" fill="' + GREEN + '" stroke="' + GREEND + '" stroke-width="2.2"/>' +
      '<path d="M26 21 L45 32 L26 43 Z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>'),
    '💬': wrap('<path d="M10 15 Q10 10.5 14.5 10.5 L49.5 10.5 Q54 10.5 54 15 L54 35 Q54 39.5 49.5 39.5 L27 39.5 L15.5 51 L18 39.5 L14.5 39.5 Q10 39.5 10 35 Z" fill="#fff" stroke="' + LINE + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<circle cx="23" cy="25" r="2.6" fill="' + INK + '"/><circle cx="32" cy="25" r="2.6" fill="' + INK + '"/><circle cx="41" cy="25" r="2.6" fill="' + INK + '"/>'),
    '🤟': wrap('<path d="M20 52 L20 30 Q20 27 22.5 27 Q25 27 25 30 L25 20 Q25 17 27.5 17 Q30 17 30 20 L30 16 Q30 13 32.5 13 Q35 13 35 16 L35 21 Q35 18.5 37.5 18.7 Q40 19 40 21.8 L40 38 Q40 50 31 52 Z" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="2.1" stroke-linejoin="round"/>' +
      st('M25 30 L25 34 M30 20 L30 32 M35 21 L35 32', LINE, 1.5) +
      '<circle cx="49" cy="17" r="9.5" fill="' + GOLD + '" stroke="' + GOLDD + '" stroke-width="1.8"/>' +
      st('M49 11.5 L49 22.5 M43.5 17 L54.5 17', '#fff', 2.8)),
    '🚫': wrap('<circle cx="32" cy="32" r="22" fill="#F0F6E8" stroke="' + GREEND + '" stroke-width="2.4"/>' +
      st('M21 33 L29 41 L44 24', GREEND, 4.2)),
    '🔂': wrap(st('M46.5 24 A18 18 0 1 0 49.5 38', LINE, 3.2) +
      '<path d="M44 12 L52 26 L37 26 Z" fill="' + LINE + '"/>'),
    '👉': wrap('<path d="M8 28 Q8 24 12 24 L26 24 L26 22 Q26 18 30 18 L52 18 Q55 18 55 21 Q55 24 52 24 L34 24 L34 28" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="2.1" stroke-linejoin="round"/>' +
      '<path d="M8 28 L8 42 Q8 46 12 46 L30 46 Q40 46 42 38 Q43 33 40 30 L34 28 L26 28 L8 28 Z" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="2.1" stroke-linejoin="round"/>' +
      st('M34 28 L34 34 M28 30 L28 36', LINE, 1.5) +
      st('M50 30 L56 30 M49 36 L54 36', GOLDD, 2)),
    '👫': wrap(head(20, 18, 0.95) + head(44, 18, 0.95, null, WOOD) +
      '<path d="M13 30 Q20 27 27 30 L28.5 44 L11.5 44 Z" fill="' + BLUED + '" stroke="' + NAVY + '" stroke-width="1.6"/>' +
      '<path d="M37 30 Q44 27 51 30 L52.5 44 L35.5 44 Z" fill="' + GOLD + '" stroke="' + GOLDD + '" stroke-width="1.6"/>' +
      st('M26 32 L32 37 L38 32', LINE, 2.4) +
      st('M15 44 L14 55 M25 44 L25 55 M39 44 L39 55 M49 44 L50 55', LINE, 2.4)),
    /* ── Places ── */
    '🏫': wrap('<path d="M7 28 L32 11 L57 28 Z" fill="' + GOLD + '" stroke="' + GOLDD + '" stroke-width="2" stroke-linejoin="round"/>' +
      st('M32 11 L32 3 L40 5 L32 8', RED, 2) +
      '<rect x="11" y="28" width="42" height="26" fill="' + CREAM + '" stroke="' + LINE + '" stroke-width="2.2"/>' +
      '<rect x="26.5" y="38" width="11" height="16" rx="1.5" fill="' + GOLDD + '" stroke="' + LINE + '" stroke-width="1.6"/>' +
      '<rect x="15" y="33" width="8" height="8" fill="' + BLUE + '" stroke="' + LINE + '" stroke-width="1.5"/><rect x="41" y="33" width="8" height="8" fill="' + BLUE + '" stroke="' + LINE + '" stroke-width="1.5"/>'),
    '🚽': wrap('<rect x="19" y="9" width="20" height="14" rx="2.5" fill="#fff" stroke="' + LINE + '" stroke-width="2.1"/>' +
      '<circle cx="29" cy="16" r="2" fill="' + BLUE + '"/>' +
      '<path d="M16 27 L46 27 Q47.5 39 37.5 43.5 L37 51 L26 51 L25.5 43.5 Q14.5 39 16 27 Z" fill="#fff" stroke="' + LINE + '" stroke-width="2.1" stroke-linejoin="round"/>' +
      '<ellipse cx="31" cy="28.5" rx="12" ry="3.4" fill="#EAF3FA" stroke="' + LINE + '" stroke-width="1.6"/>'),
    '🏃': wrap(head(28, 12, 0.85) +
      '<path d="M23 21 Q29 18.5 34 22 L37.5 34 L26 33 Z" fill="' + RED + '" stroke="#8E352A" stroke-width="1.6"/>' +
      st('M26.5 24 L15 28.5 M33.5 23 L43 15.5', LINE, 2.6) +
      st('M32 33.5 L44 40 L41.5 51 M28.5 33.5 L23 45 L11.5 46.5', LINE, 2.6) +
      st('M5 17 L11 17 M3 24 L9 24 M5 31 L10 31', GOLDD, 2)),
    '🍽️': wrap('<circle cx="36" cy="35" r="17" fill="#fff" stroke="' + LINE + '" stroke-width="2.1"/>' +
      '<circle cx="36" cy="35" r="11.5" fill="' + CREAM + '" stroke="#E4D6BC" stroke-width="1.5"/>' +
      '<path d="M27 37.5 L45 29 L45 41 Z" fill="#E8B36B" stroke="' + LINE + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      st('M11 18 L11 30 M8 18 L8 25 Q8 27.5 11 27.5 Q14 27.5 14 25 L14 18 M11 30 L11 48', LINE, 2) +
      st('M54 18 Q51 26 54 30 L54 48', LINE, 2)),
    '📚': wrap('<rect x="13" y="42" width="38" height="9" rx="2" fill="' + BLUED + '" stroke="' + NAVY + '" stroke-width="1.8"/>' +
      '<rect x="16" y="33" width="33" height="9" rx="2" fill="' + GOLD + '" stroke="' + GOLDD + '" stroke-width="1.8"/>' +
      '<rect x="19" y="24" width="27" height="9" rx="2" fill="#B47049" stroke="' + LINE + '" stroke-width="1.8"/>' +
      st('M20 46.5 L44 46.5 M22 37.5 L43 37.5 M25 28.5 L40 28.5', '#fff', 1.6)),
    '🏠': wrap('<path d="M8 30 L32 10 L56 30" fill="none" stroke="#9A6F4E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M13 27 L32 12 L51 27 L51 53 L13 53 Z" fill="' + CREAM + '" stroke="' + LINE + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<rect x="27" y="37" width="10" height="16" rx="1.5" fill="' + GOLDD + '" stroke="' + LINE + '" stroke-width="1.6"/>' +
      '<circle cx="34.5" cy="45.5" r="1.2" fill="' + INK + '"/>' +
      '<rect x="17.5" y="32" width="7.5" height="7.5" fill="' + BLUE + '" stroke="' + LINE + '" stroke-width="1.5"/><rect x="39" y="32" width="7.5" height="7.5" fill="' + BLUE + '" stroke="' + LINE + '" stroke-width="1.5"/>'),
    '🌿': wrap('<circle cx="51" cy="12" r="6.5" fill="#F2C14E" stroke="' + GOLDD + '" stroke-width="1.6"/>' +
      st('M51 2.5 L51 5 M60.5 12 L58 12 M57.5 5.5 L55.8 7.2 M57.5 18.5 L55.8 16.8', GOLDD, 1.8) +
      '<path d="M28.5 52 L28.5 40 Q28.5 36 32 36 L32 52 Z" fill="' + WOOD + '"/>' +
      '<circle cx="30" cy="24" r="12.5" fill="' + GREEN + '"/><circle cx="19.5" cy="30" r="9" fill="#7FAF6C"/><circle cx="40" cy="30" r="9" fill="#7FAF6C"/>' +
      st('M6 54 Q18 50.5 32 54 Q46 57.5 58 54', GREEND, 2.4)),
    '🪑': wrap('<rect x="17" y="9" width="7" height="30" rx="3.5" fill="' + GOLDD + '" stroke="' + LINE + '" stroke-width="1.8"/>' +
      '<rect x="15" y="35" width="32" height="7" rx="3.5" fill="' + GOLD + '" stroke="' + GOLDD + '" stroke-width="1.8"/>' +
      st('M19 42 L17 56 M44 42 L46 56 M43 42 L43 50', LINE, 2.6)),
    '🦷': wrap('<rect x="13" y="21" width="38" height="28" rx="4.5" fill="#fff" stroke="' + LINE + '" stroke-width="2.2"/>' +
      '<path d="M26 21 L26 16.5 Q26 14 28.5 14 L35.5 14 Q38 14 38 16.5 L38 21" fill="none" stroke="' + LINE + '" stroke-width="2.2"/>' +
      '<path d="M29 27 L35 27 L35 32 L40 32 L40 38 L35 38 L35 43 L29 43 L29 38 L24 38 L24 32 L29 32 Z" fill="' + RED + '"/>'),
    '🚗': wrap('<rect x="7" y="20" width="50" height="24" rx="5" fill="' + GOLD + '" stroke="' + GOLDD + '" stroke-width="2.2"/>' +
      '<rect x="12" y="25" width="8.5" height="8" rx="1.5" fill="#fff" stroke="' + GOLDD + '" stroke-width="1.5"/><rect x="24" y="25" width="8.5" height="8" rx="1.5" fill="#fff" stroke="' + GOLDD + '" stroke-width="1.5"/><rect x="36" y="25" width="8.5" height="8" rx="1.5" fill="#fff" stroke="' + GOLDD + '" stroke-width="1.5"/>' +
      st('M7 37.5 L57 37.5', GOLDD, 1.8) +
      '<circle cx="19" cy="45" r="5.5" fill="' + INK + '"/><circle cx="19" cy="45" r="2" fill="#C9CFD6"/>' +
      '<circle cx="45" cy="45" r="5.5" fill="' + INK + '"/><circle cx="45" cy="45" r="2" fill="#C9CFD6"/>' +
      '<rect x="50" y="25" width="7" height="8" rx="1.5" fill="#DCEBF7" stroke="' + GOLDD + '" stroke-width="1.5"/>'),
    /* ── People — identity cards, so each IS a different person ── */
    '🧑‍🏫': wrap('<rect x="33" y="7" width="24" height="17" rx="2" fill="#3E5A4A" stroke="' + LINE + '" stroke-width="1.8"/>' +
      st('M37 13 Q42 11 46 13 M37 18 L52 18', '#fff', 1.5) +
      head(21, 27, 1.3, '<circle cx="-3.5" cy="-.3" r="2.6" fill="none" stroke="' + INK + '" stroke-width="1.1"/><circle cx="3.5" cy="-.3" r="2.6" fill="none" stroke="' + INK + '" stroke-width="1.1"/><path d="M-1 -.3 L1 -.3" stroke="' + INK + '" stroke-width="1.1"/><circle cx="-3.5" cy="-.3" r="1" fill="' + INK + '"/><circle cx="3.5" cy="-.3" r="1" fill="' + INK + '"/><path d="M-3 4 Q0 6.2 3 4" fill="none" stroke="' + MOUTH + '" stroke-width="1.3" stroke-linecap="round"/>', '#6B4A2E') +
      '<path d="M5 57 Q21 42 37 57 Z" fill="' + BLUED + '" stroke="' + NAVY + '" stroke-width="1.8"/>' +
      st('M36 44 L46 32', LINE, 2.4) + '<circle cx="47.5" cy="30.5" r="2.6" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="1.4"/>'),
    '🧑‍🤝‍🧑': wrap(head(20, 22, 1.05) + head(44, 22, 1.05, null, WOOD) +
      '<path d="M7 54 Q20 41 33 54 Z" fill="' + GOLD + '" stroke="' + GOLDD + '" stroke-width="1.8"/>' +
      '<path d="M31 54 Q44 41 57 54 Z" fill="' + BLUED + '" stroke="' + NAVY + '" stroke-width="1.8"/>'),
    '👪': wrap(head(21, 19, 1.3, null, '#6B4A2E') + head(45, 30, 0.9) +
      '<path d="M4 57 Q21 40 38 57 Z" fill="' + NAVY + '" stroke="' + INK + '" stroke-width="1.8"/>' +
      '<path d="M34 57 Q45 47 56 57 Z" fill="' + GOLD + '" stroke="' + GOLDD + '" stroke-width="1.8"/>' +
      st('M34 44 Q41 39 47 41.5', LINE, 2.4)),
    '🧑‍⚕️': wrap('<path d="M9 21 Q21 11 33 21 L31.5 26 L10.5 26 Z" fill="#fff" stroke="' + LINE + '" stroke-width="1.8"/>' +
      '<path d="M19 15.5 L23 15.5 L23 17.5 L25 17.5 L25 21.5 L23 21.5 L23 23.5 L19 23.5 L19 21.5 L17 21.5 L17 17.5 L19 17.5 Z" fill="' + RED + '" transform="translate(0 -1)"/>' +
      head(21, 33, 1.25, null, '#845B36') +
      '<path d="M5 57 Q21 44 37 57 Z" fill="#fff" stroke="#B9C2CE" stroke-width="1.8"/>' +
      st('M40 34 Q46 30 50 34 M50 34 L50 42', '#5B6B7E', 2) + '<circle cx="50" cy="45" r="3.4" fill="none" stroke="#5B6B7E" stroke-width="2"/>'),
    '👮': wrap('<path d="M9 20 Q21 10 33 20 L33 24 L9 24 Z" fill="' + NAVY + '" stroke="' + INK + '" stroke-width="1.8"/>' +
      '<path d="M9 24 L33 24 L31 28 L11 28 Z" fill="#2E4058" stroke="' + INK + '" stroke-width="1.5"/>' +
      '<path d="M21 14 L22.4 17 L25.6 17.3 L23.2 19.4 L23.9 22.5 L21 20.9 L18.1 22.5 L18.8 19.4 L16.4 17.3 L19.6 17Z" fill="' + GOLD + '"/>' +
      head(21, 35, 1.2, null, HAIRC) +
      '<path d="M5 57 Q21 45 37 57 Z" fill="' + NAVY + '" stroke="' + INK + '" stroke-width="1.8"/>' +
      '<circle cx="13" cy="53" r="2.6" fill="' + GOLD + '" stroke="' + GOLDD + '" stroke-width="1.2"/>'),
    '🧑‍💻': wrap(head(21, 24, 1.25, null, '#3E2A1A') +
      '<path d="M5 57 Q21 44 37 57 Z" fill="' + GREEN + '" stroke="' + GREEND + '" stroke-width="1.8"/>' +
      st('M13 47 L20 55 M29 47 L22 55', '#fff', 1.8) +
      '<rect x="17.5" y="51" width="9" height="11" rx="1.5" fill="#fff" stroke="' + GOLDD + '" stroke-width="1.6"/>' +
      st('M19.5 55 L24.5 55 M19.5 58 L24.5 58', '#9AA5B8', 1.2) +
      st('M42 30 L54 30 M48 24 L48 36 M42 42 L54 42 M42 48 L50 48', GOLDD, 2)),
    /* ── Sensory Needs ── */
    '🎧': wrap(BIGHEAD + st('M20 28.5 Q24.5 27.5 29 28.5') + st('M35 28.5 Q39.5 27.5 44 28.5') + CALM +
      '<path d="M25.5 45.5 Q32 49.5 38.5 45.5" fill="none" stroke="' + MOUTH + '" stroke-width="2.4" stroke-linecap="round"/>' +
      st('M10 30 Q11 8 32 8 Q53 8 54 30', NAVY, 4) +
      '<rect x="5" y="27" width="11" height="17" rx="5.5" fill="' + NAVY + '" stroke="' + INK + '" stroke-width="1.8"/>' +
      '<rect x="48" y="27" width="11" height="17" rx="5.5" fill="' + NAVY + '" stroke="' + INK + '" stroke-width="1.8"/>'),
    '🤫': wrap(BIGHEAD + st('M20 28 Q24.5 26.5 29 28') + st('M35 28 Q39.5 26.5 44 28') + CALM +
      '<ellipse cx="32" cy="46" rx="3" ry="2.2" fill="' + MOUTH + '"/>' +
      '<rect x="29.3" y="38" width="5.4" height="17" rx="2.7" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="1.8"/>' +
      st('M44 18 Q47 15 46 11 M50 22 Q53 19 52.5 15', GOLDD, 1.9)),
    '🌑': wrap('<circle cx="32" cy="32" r="23" fill="#2E3A55"/>' +
      '<path d="M38 12 Q28 18 28 32 Q28 46 38 52 Q24 52 17.5 42 Q11 32 17.5 22 Q24 12 38 12 Z" fill="#F2E6B8"/>' +
      '<path d="M45 20 L46.2 23 L49.2 23.3 L47 25.3 L47.6 28.2 L45 26.7 L42.4 28.2 L43 25.3 L40.8 23.3 L43.8 23 Z" fill="#F2E6B8"/>' +
      '<circle cx="49" cy="36" r="1.6" fill="#F2E6B8"/><circle cx="43" cy="46" r="1.3" fill="#F2E6B8"/>'),
    '🫂': wrap(BIGHEAD + st('M20 28.5 Q24.5 27.5 29 28.5') + st('M35 28.5 Q39.5 27.5 44 28.5') + SLEEPY +
      '<path d="M25.5 46 Q32 49.5 38.5 46" fill="none" stroke="' + MOUTH + '" stroke-width="2.3" stroke-linecap="round"/>' +
      '<path d="M8 62 Q9 50 18 47 L46 47 Q55 50 56 62 Z" fill="' + BLUED + '" stroke="' + NAVY + '" stroke-width="1.8"/>' +
      '<path d="M12 50 Q30 44 49 55" fill="none" stroke="' + NAVY + '" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M52 50 Q34 44 15 55" fill="none" stroke="#6FA3D8" stroke-width="3.4" stroke-linecap="round"/>' +
      '<circle cx="49.5" cy="55.5" r="3.2" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="1.4"/>' +
      '<circle cx="15.5" cy="55.5" r="3.2" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="1.4"/>'),
    '🧸': wrap('<circle cx="15" cy="15" r="7.5" fill="#C98F5F" stroke="' + LINE + '" stroke-width="2"/><circle cx="49" cy="15" r="7.5" fill="#C98F5F" stroke="' + LINE + '" stroke-width="2"/>' +
      '<circle cx="15" cy="15" r="3.4" fill="#E8B48E"/><circle cx="49" cy="15" r="3.4" fill="#E8B48E"/>' +
      '<circle cx="32" cy="33" r="22" fill="#C98F5F" stroke="' + LINE + '" stroke-width="2.2"/>' +
      '<ellipse cx="32" cy="42" rx="9.5" ry="7.5" fill="' + CREAM + '"/>' +
      '<circle cx="24.5" cy="30" r="2.6" fill="' + INK + '"/><circle cx="39.5" cy="30" r="2.6" fill="' + INK + '"/>' +
      '<path d="M29 40 Q32 38 35 40 L32 43.5 Z" fill="' + INK + '"/>' +
      st('M32 43.5 L32 46 M32 46 Q29 49 26.5 47.5 M32 46 Q35 49 37.5 47.5', INK, 1.6)),
    '🚪': wrap('<rect x="12" y="8" width="28" height="48" rx="2" fill="#EFE6D2" stroke="' + LINE + '" stroke-width="2.2"/>' +
      '<path d="M40 8 L54 14 L54 60 L40 56 Z" fill="' + GOLDD + '" stroke="' + LINE + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="43.5" cy="35" r="1.8" fill="' + CREAM + '"/>' +
      st('M17 32 L31 32 M26 26 L32 32 L26 38', GREEND, 2.8)),
    '⏳': wrap(st('M18 8 L46 8 M18 56 L46 56', GOLDD, 3.4) +
      '<path d="M21 11 L43 11 Q43 24 34.5 30 L34.5 34 Q43 40 43 53 L21 53 Q21 40 29.5 34 L29.5 30 Q21 24 21 11 Z" fill="#EAF3FA" stroke="' + LINE + '" stroke-width="2"/>' +
      '<path d="M25 14 L39 14 Q38 22 32 26.5 Q26 22 25 14 Z" fill="' + GOLD + '"/>' +
      '<path d="M24 51 L40 51 Q39 43 32 39 Q25 43 24 51 Z" fill="' + GOLD + '"/>' +
      st('M32 30 L32 38', GOLDD, 1.6))
  };
})();
function aogPecsIcon(i) { return AOG_PECS_FACES[i] || AOG_PECS_OBJECTS[i] || i; }
window.aogPecsIcon = aogPecsIcon;

var PECS_LIBRARY = {
  "Feelings": [
    {i:"😊",l:"Happy"},{i:"😢",l:"Sad"},{i:"😡",l:"Angry"},{i:"😨",l:"Scared"},
    {i:"😕",l:"Confused"},{i:"😭",l:"Hurt"},{i:"😴",l:"Tired"},{i:"🤧",l:"Sick"},
    {i:"🥳",l:"Excited"},{i:"😐",l:"Calm"}
  ],
  "Needs": [
    {i:"🚹",l:"Bathroom"},{i:"💧",l:"Water"},{i:"🍞",l:"Food"},{i:"💪",l:"Break"},
    {i:"🤝",l:"Help"},{i:"🤐",l:"Quiet"},{i:"📖",l:"Read"},{i:"✏️",l:"Work"},
    {i:"🎮",l:"Play"},{i:"🛏️",l:"Rest"}
  ],
  "Actions": [
    {i:"👍",l:"Yes"},{i:"👎",l:"No"},{i:"⏸️",l:"Stop"},{i:"▶️",l:"Go"},
    {i:"💬",l:"Talk"},{i:"🤟",l:"More"},{i:"🚫",l:"Done"},{i:"🔂",l:"Again"},
    {i:"👉",l:"That"},{i:"👫",l:"Together"}
  ],
  "Places": [
    {i:"🏫",l:"Class"},{i:"🚽",l:"Bathroom"},{i:"🏃",l:"Gym"},{i:"🍽️",l:"Lunch"},
    {i:"📚",l:"Library"},{i:"🏠",l:"Home"},{i:"🌿",l:"Outside"},{i:"🪑",l:"Office"},
    {i:"🦷",l:"Nurse"},{i:"🚗",l:"Bus"}
  ],
  "People": [
    {i:"🧑‍🏫",l:"Teacher"},{i:"🧑‍🤝‍🧑",l:"Friend"},{i:"👪",l:"Family"},
    {i:"🧑‍⚕️",l:"Nurse"},{i:"👮",l:"Helper"},{i:"🧑‍💻",l:"Aide"}
  ]
};
var pecsActiveCategory = Object.keys(PECS_LIBRARY)[0];
var pecsStrip = [];
function pecsRenderTabs() {
  var t = document.getElementById('pecsTabs'); if (!t) return;
  t.innerHTML = Object.keys(PECS_LIBRARY).map(function(cat) {
    return '<button class="pecs-tab' + (cat===pecsActiveCategory?' active':'') + '" onclick="pecsSetCategory(\'' + cat + '\')">' + cat + '</button>';
  }).join('');
}
function pecsRenderLibrary() {
  var lib = document.getElementById('pecsLibrary'); if (!lib) return;
  var cards = PECS_LIBRARY[pecsActiveCategory] || [];
  lib.innerHTML = cards.map(function(c) {
    return '<button class="pecs-card" onclick="pecsAddToStrip(\'' + c.i + '\',\'' + c.l + '\')" aria-label="' + c.l + '"><span class="pecs-card-icon">' + aogPecsIcon(c.i) + '</span><span class="pecs-card-label">' + c.l + '</span></button>';
  }).join('');
}
function pecsRenderStrip() {
  var s = document.getElementById('pecsStrip'); if (!s) return;
  if (!pecsStrip.length) { s.innerHTML = '<span class="pecs-empty-strip">Tap cards below to build a message ↓</span>'; return; }
  s.innerHTML = pecsStrip.map(function(c,i) {
    return '<div class="pecs-strip-card"><button class="remove-btn" onclick="pecsRemove(' + i + ')" aria-label="Remove ' + c.l + '">✕</button><span class="pecs-card-icon" style="font-size:28px">' + aogPecsIcon(c.i) + '</span><span class="pecs-card-label">' + c.l + '</span></div>';
  }).join('');
}
window.pecsSetCategory = function(cat) { pecsActiveCategory=cat; pecsRenderTabs(); pecsRenderLibrary(); };
window.pecsAddToStrip  = function(icon,label) { pecsStrip.push({i:icon,l:label}); pecsRenderStrip(); };
window.pecsRemove      = function(i) { pecsStrip.splice(i,1); pecsRenderStrip(); };
window.pecsClearStrip  = function() { pecsStrip=[]; pecsRenderStrip(); };
window.pecsSpeakStrip  = function() {
  if (!pecsStrip.length || !('speechSynthesis' in window)) return;
  var cards = document.querySelectorAll('#pecsStrip .pecs-strip-card');
  var u = new SpeechSynthesisUtterance(pecsStrip.map(function(c){ return c.l; }).join('. '));
  u.rate=0.85; u.pitch=1.1;
  var wi = 0;
  u.onboundary = function(ev){
    if (ev.name && ev.name !== 'word') return;
    cards.forEach(function(c){ c.classList.remove('speaking-highlight'); });
    if (cards[wi]) cards[wi].classList.add('speaking-highlight');
    wi++;
  };
  u.onend = function(){
    cards.forEach(function(c){ c.classList.remove('speaking-highlight'); });
    if (window.GraceAudio) GraceAudio.playSuccess();
  };
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
};
window.pecsPrintStrip = function() {
  if (!pecsStrip.length) { alert('Add cards to the strip first.'); return; }
  var win = window.open('');
  var cards = pecsStrip.map(function(c) {
    return '<div style="display:inline-flex;flex-direction:column;align-items:center;border:2px solid #D9A33B;border-radius:8px;padding:10px 8px;margin:6px;min-width:70px;font-family:sans-serif;"><span style="font-size:32px">' + aogPecsIcon(c.i) + '</span><span style="font-size:11px;font-weight:600;margin-top:4px;">' + c.l + '</span></div>';
  }).join('');
  win.document.write('<html><body style="font-family:sans-serif;padding:20px;"><h2 style="color:#0A1E33">My Message</h2><div style="display:flex;flex-wrap:wrap;">' + cards + '</div></body></html>');
  win.document.close(); win.print();
};

window.open60SecRead = function() {
  if (typeof showScreen === 'function') { showScreen('screen-welcome'); }
};

/* Hook showScreen to init PECS and close tool modal on navigation */
function _installToolScreenHook() {
  var _s = typeof showScreen === 'function' ? showScreen : null;
  if (!_s) return;
  window.showScreen = function(id) {
    _s(id);
    window.scrollTo(0, 0);

    /* Force all reveal elements in the newly active screen visible.
       IntersectionObserver never fires on hidden screens, leaving them
       stuck at opacity:0 and causing blank space. Adding .in bypasses
       the observer and uses the same mechanism the app itself uses. */
    var activeScreen = document.getElementById(id);
    if (activeScreen) {
      activeScreen.querySelectorAll('.reveal').forEach(function(el) {
        el.classList.add('in');
      });
    }
    /* Also run after a short delay to catch any dynamically inserted content */
    setTimeout(function() {
      var s = document.getElementById(id);
      if (s) s.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
    }, 80);

    /* Always hide voices first, then re-show only on welcome */
    var voices = document.getElementById('welcomeVoices');
    if (voices) {
      if (id === 'screen-welcome' && voices.getAttribute('data-voices-loaded') === '1') {
        voices.style.display = '';
      } else {
        voices.style.display = 'none';
      }
    }

    var toolScreens = ['screen-teacher-tools', 'screen-pecs'];
    if (toolScreens.indexOf(id) > -1) {
      document.body.classList.add('tool-screen-open');
    } else {
      document.body.classList.remove('tool-screen-open');
    }
    var m = document.getElementById('toolModal');
    if (m && id !== 'screen-teacher-tools') m.classList.remove('open');
    if (id === 'screen-pecs') {
      setTimeout(function() { pecsRenderTabs(); pecsRenderLibrary(); pecsRenderStrip(); }, 100);
    }
  };
}
/* Try immediately, then again after load in case showScreen loads late */
_installToolScreenHook();
window.addEventListener('load', _installToolScreenHook);
