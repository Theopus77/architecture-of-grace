/* AOG-SOLO-BASSLICKS-V1 (2026-10-18) — Jimmy: "Add some bass licks", then "A lot!"

   The Bass's licks for Solo mode ("Licks to try", aog-solo.js), loaded only when Solo opens on the Bass. Each lick is
   written against chords, not frets, so it follows the song's key and major or minor and lands on the chord's own notes:

     chords: "1 4 5 1*1"  a chord a bar (4 beats) unless *n says how many beats. The number is the step of the key's
             scale it is built on (major or natural minor); b or # in front counts from the major scale (b7 is the flat
             seven chord in both). After it: m M 7 m7 M7 d7 (dominant 7) o (diminished) m7b5; none = the key's own chord.
             A second line, cm, is used in a minor key when it is given.
     notes:  each note is how it sits on the chord, how long, and how it is played:
             1 3 5 7 = the chord's root, third, fifth and seventh; 2 4 6 9 = the key's scale above the root; 8 = the octave;
             b3 #4 b7 … = that many steps from the root counted on the major scale (blue notes, passing notes);
             , = an octave down, ' = an octave up; r = a rest; x = a dead note on the note before;
             < and > = a half step below or above the next note; [ and ] = the key's scale note below or above the next;
             w h q e s t = whole, half, quarter, eighth, sixteenth, triplet eighth (. adds half); the length carries on;
             S thumb slap, P pop, g dead note, H hammer-on, O pull-off, T tap, / slide in, \ fall away, ~ slide from the
             note before (same string), v vibrato (V wide), B a half-step bend, - short, _ held full, ! a passing note on
             purpose, @E @A @D @G on that string.
   compile() turns a lick into the notes playLick() plays (the guitar's format: string, fret, beats), placed in one
   five-fret hand position (open strings too, near the nut) in the right octave for the four strings; check() tests the
   numbers: the range, every note in the hand position, the chord's notes on beats 1 and 3, the key's notes everywhere
   else unless a note passes by a half step or a whole step on purpose. */
(function(root){
"use strict";
const MAJ=[0,2,4,5,7,9,11], MIN=[0,2,3,5,7,8,10], MAJINT=[0,2,4,5,7,9,11,12,14];
const MIX=[0,2,4,5,7,9,10], DOR=[0,2,3,5,7,9,10];
const QT={maj:[0,4,7], min:[0,3,7], dim:[0,3,6], dom7:[0,4,7,10], maj7:[0,4,7,11], m7:[0,3,7,10], m7b5:[0,3,6,10]};
const DUR={w:4, h:2, q:1, e:0.5, s:0.25, t:1/3};
const TUNE=[28,33,38,43], MAXF=15, SPAN=4;

/* ══ the licks: [id, group, chords, notes, extra] ══════════════════════════════════════════════════════════════════ */
const RAW=[
/* rock */
["b_rk8","rock","1 1 1*1","1e 1 1 1 1 1 1 1 | 1 1 1 1 5 5 8 8 | 1q_"],
["b_rk15","rock","1 4 1*1","1e 1 5 5 1 1 5 5 | 1 1 5, 5, 1 1 5, [ | 1q_"],
["b_rkoct","rock","1 4*2 5*2 1*1","1e 8 1 8 1 8 1 8 | 1 8 1 8 1 8 1 8 | 1q_"],
["b_rkwalk","rock","1 4 1*1","1e 1 1 1 1 1 2 3 | 1 1 1 1 5 4 3 2 | 1q_"],
["b_rkstop","rock","1 1 1*1","1q- re 1e 5q 8q | re 6e 5q 3q 2e 1e | 1q_"],
["b_rkb7","rock","1 b7 4 1*1","1e 1 1 1 1 1 5 5 | 1, 1, 1, 1, 1, 1, 3, 3, | 1 1 1 1 1 1 5, [ | 1q_"],
/* blues (a swing feel) */
["b_blbox","blues","1d7 4d7 1*2","1q 3 5 6 | 1, 3, 5, 6, | 1h_",{cm:"1m7 4m7 1*2"}],
["b_blshuf","blues","1d7 1d7 1*1","1e 1 3 3 5 5 6 6 | 7 7 6 6 5 5 3 3 | 1q_",{cm:"1m7 1m7 1*1", sw:0.66}],
["b_blturn","blues","1d7 5d7 1*2","1q 3 5 < | 1 3, 5, < | 1h_",{cm:"1m7 5d7 1*2"}],
["b_blclimb","blues","1d7 1d7 1*2","1q 2 3 #4! | 5 6 7 8 | 1h_",{cm:"1m7 1m7 1*2"}],
["b_blroll","blues","1d7 4d7 1*2","1t 3 5 6 5 3 1 3 5 6 5 3 | 1 3 5 6 5 3 1 3 5 6 5 3 | 1h_",{cm:"1m7 4m7 1*2"}],
["b_blrest","blues","1d7 1d7 1*2","1e 3 5 6 7 6 5 3 | 1q rq 5,e 6,e 7,e <e | 1h_",{cm:"1m7 1m7 1*2", sw:0.66}],
/* funk: slap and pop with dead notes */
["b_fkoct","funk","1d7 1d7 1*1","1sS xg 8P xg 1S rs 8P 1S 1S xg 8P xg 5S rs 7P 8P | 1S xg 8P xg 1S rs 8P 1S 1S xg 8P 7P 5S xg 8P xg | 1qS",{cm:"1m7 1m7 1*1", slap:1}],
["b_fkghost","funk","1d7 1d7 1*1","1s rs 1 xg 8 xg 7 5 1 rs 1 xg 4 #4! 5 xg | 1 rs 1 xg 8 xg 7 5 3 rs 5 xg 7 xg 5 3 | 1q",{cm:"1m7 1m7 1*1"}],
["b_fkone","funk","1d7 1d7 1*1","1e.S 1sS re 5,e 7,e 1e re 8eP | 1e.S 1sS re 5,e 7,e 1e 5,e 6,e | 1qS",{cm:"1m7 1m7 1*1", slap:1}],
["b_fkham","funk","1d7 1d7 1*1","1sS xg 1 2 3H xg 5 8P 1S xg 1 2 3H 5 7P 8P | 1S xg 1 2 3H xg 5 8P 7P xg 5 xg 3 xg 2 xg | 1qS",{cm:"1m7 1m7 1*1", slap:1}],
["b_fkdead","funk","1d7 1d7 1*1","1sS xg xg 1S xg xg 8P xg 1S xg xg 1S 5S xg 7P 8P | 1S xg xg 1S xg xg 8P xg 1S xg xg 1S 5S 6S 7P 8P | 1qS",{cm:"1m7 1m7 1*1", slap:1}],
["b_fkvamp","funk","1d7 4d7 1*1","1e. 1s re 5,e 7,e 1e 2e 3e | 1e. 1s re 5,e 7,e 1e 3e 2e | 1q",{cm:"1m7 4d7 1*1"}],
/* Motown and soul */
["b_mowalk","motown","1*2 6*2 4*2 5*2 1*2","1e. 1s 5,e <e | 1,e. 1,s 3,e <e | 1e. 1s 5,e <e | 1e. 1s 5,e <e | 1h_"],
["b_mosync","motown","1 4 1*2","1e. 3s 5e 6e 8e. 6s 5e 3e | 1e. 3s 5e 3e 1e. 5,s 6,e <e | 1h_"],
["b_morun","motown","1 4 5 1*2","1q 5,e 6,e 1e 2e #2e! 3e | 1q 5,e 6,e 1e 3e 2e <e | 1q 5,e 6,e 1e 6,e 5,e <e | 1h_"],
["b_moriff","motown","1 4 1*2","1q. 1e 3e 5e 6e 5e | 1q. 1e 3e 5e 6e 5e | 1h_"],
["b_mostax","motown","1d7 4d7 1*2","1e re 8e 1e 7e 5e 6e 5e | 1e re 8e 1e 7,e 5,e 6,e <e | 1h_",{cm:"1m7 4m7 1*2"}],
["b_moupdn","motown","1 5 1*2","1e. 1s 3e 5e 8e 5e 3e 2e | 1,e. 1,s 3,e 5,e 1e 6,e 5,e 3,e | 1h_"],
/* reggae and dub */
["b_rgdrop","reggae","1 4 1*2","rq 1e 1e 3q 5,q | rq 1e 1e 3q 2q | 1h_"],
["b_rgdub","reggae","1 1 1*2","1q.v 5,e 1h | rq 3e 2e 1q 5,q | 1hv"],
["b_rgstep","reggae","1 b7 1*2","1e 1 re 1e 5,e 6,e 7,e 1e | 1,e 1, re 1,e 5,e 5,e 3,e 3,e | 1h_"],
["b_rgbounce","reggae","1 4 1*2","1e.- 1s re 1e- 3e- re 5e- re | 1e.- 1s re 1e- 3e- re 5e- re | 1h_"],
["b_rgspace","reggae","1 4 1*2","rh 1e 2e 3e 5e | 1q rq 3e 2e 1e 7,e | 1h_"],
["b_rgslide","reggae","1 4 1*2","1q./ 5,e 1h | 1q./ 5,e 1h\\ | 1h_"],
/* jazz: walking over two, five, one */
["b_jzwalk","jazz","27 5d7 17 1*2","1q 2 3 5 | 1 7, 5, 3, | 1 3 5 6 | 8h_"],
["b_jzchrom","jazz","27 5d7 17 1*2","1q 3 5 < | 1 7, 5, < | 1 2 3 < | 1h_"],
["b_jzdown","jazz","27 5d7 17 1*2","8q 7 5 3 | 1 7, 5, 3, | 1 7, 5, 6, | 1h_"],
["b_jzturn","jazz","17*2 6d7*2 27*2 5d7*2 1*2","1q 3 | 1 > | 1 < | 1 < | 1h_"],
["b_jztwo","jazz","27 5d7 17 1*2","1h 5,q. <e | 1h 5,q. <e | 1h 5,h | 1h_",{sw:0.66}],
["b_jzblues","jazz","1d7 4d7 1d7 1*2","1q 3 5 6 | 1, 3, 5, < | 1 b3! 3 5 | 1h_",{cm:"1m7 4m7 1m7 1*2"}],
["b_jzskip","jazz","27 5d7 17 1*2","1q 2 3e xg 5e <e | 1q 7, 5,e xg 3,e 2,e | 1q 2 3e xg 5e 3e | 1h_",{sw:0.66}],
/* Latin: tumbao, bossa */
["b_lttumb","latin","1 4 5 1*2","rq. 5,q. 4,q | rq. 5,q. 2q | rq. 5,q. 4,q | 1h_"],
["b_ltbossa","latin","27 5d7 17 1*2","1q. 5,h re | 1q. 5,h re | 1q. 5,h re | 1h_"],
["b_ltsamba","latin","1 5d7 1*2","1e. 1s 5,e. 5,s 1e. 1s 5,e. 5,s | 1e. 1s 5,e. 5,s 1e. 1s 5,e. <s | 1h_"],
["b_ltcumbia","latin","1 5 1*2","1q. 5,e 5,q. 6,e | 1,q. 5,e 5,q. <e | 1h_"],
["b_lttres","latin","1 4 5 1*2","1q. 1q. 5,q | 1q. 1q. 5,q | 1q. 1q. 3,q | 1h_"],
["b_ltbwalk","latin","17 27*2 5d7*2 1*2","1q. 5,h re | 1q. 5,e 1q. <e | 1h_"],
/* metal: gallops, chugs */
["b_mgal","metal","1 b6 b7 1*2","1e- 1s- 1s- 1e- 1s- 1s- 1e- 1s- 1s- 1e- 1s- 1s- | 1,e- 1,s- 1,s- 1,e- 1,s- 1,s- 1,e- 1,s- 1,s- 1,e- 1,s- 1,s- | 1,e- 1,s- 1,s- 1,e- 1,s- 1,s- 1,e- 1,s- 1,s- 1,e- 1,s- 1,s- | 1h_"],
["b_mchug","metal","1 1 1*2","1s- 1- 1- 1- 1- 1- b2! 1- 1- 1- 1- 1- 3 2 b2! 1- | 1 1 1 1 1 1 b2! 1 1 1 1 1 3 2 b2! 1- | 1h_"],
["b_mdoom","metal","1 1 1*2","1hV 3q 2q | 1h.V b2q! | 1hV"],
["b_mthrash","metal","1 1 1*2","1s- 1- 1- 1- 7,- 7,- 7,- 7,- 1- 1- 1- 1- b2! b2! 1- 1- | 1 1 1 1 3 3 3 3 5 5 5 5 3 3 2 2 | 1h_"],
["b_mbreak","metal","1 1 1*2","1e- re 1s- 1s- re 1e- re 7,e- 6,e- | 1e- re 1s- 1s- re 1e- re b2e!- 1e- | 1h_"],
["b_mpedal","metal","1 1 1*2","1e 3 1 4 1 5 1 4 | 1 3 1 2 1 b2! 1 7, | 1h_"],
/* country: root and five */
["b_cnalt","country","1 4 5 1*2","1q 5, 1 5, | 1 5, 1 5, | 1 5, 1 5, | 1h_"],
["b_cnwalk","country","1 4 1*2","1q 5, 1e 2e 3q | 1q 5, 1e 7,e 6,q | 1h_"],
["b_cndown","country","1 6 1*2","1q 5, 1 7, | 1, 5,, 1, < | 1h_"],
["b_cnbg","country","1 1 1*2","1e 2 3 4 5 6 5 3 | 1q 5, 1h | 1h_"],
["b_cnstep","country","1 5 1*2","1q 5, 3 5, | 1, 5, 3, 2, | 1h_"],
["b_cnchrom","country","1 5 1*2","1q 5, 3e 4e #4q! | 1q 5, 3,e 2,e <q | 1h_"],
/* disco: octaves */
["b_dsoct","disco","1*2 6*2 4*2 5*2 1*2","1e 8 1 8 | 1, 1 1, 1 | 1, 1 1, 1 | 1, 1 1, 1 | 1h_"],
["b_dsgal","disco","1 4 1*2","1e 8s 8 1e 8s 8 1e 8s 8 1e 8s 8 | 1e 8s 8 1e 8s 8 1e 8s 8 1e 8s 8 | 1h_"],
["b_dswalk","disco","1 4 1*2","1e 8 1 8 1 8 2 3 | 1 8 1 8 1 8 3 2 | 1h_"],
["b_dsseven","disco","17 47 1*2","1e 8 1 8 7 8 5 8 | 1 8 1 8 7 8 5 8 | 1h_"],
["b_dsrun","disco","1 1 1*2","1e 8 1 8 1 8 1 8 | 1 8 1 8 1s 2 3 5 6 5 3 2 | 1h_"],
["b_dsfifth","disco","1 4 5 1*2","1e 8 5 8 1 8 5 8 | 1 8 5 8 1 8 5 8 | 1 8 5 8 1 8 5 8 | 1h_"],
/* hip-hop and R&B: slides, low notes */
["b_hhsub","hiphop","1 6 1*2","1h.v 5,e 6,e | 1,h.v 5,e 7,e | 1hv"],
["b_hhglide","hiphop","17 17 1*2","1q. 7,e 1q~ 5,q | 1q. 3e 5h~ | 1h_"],
["b_hhbounce","hiphop","1 4 1*2","1e. 1s rs 5,s 6,e 1q 3e 2e | 1e. 1s rs 5,s 6,e 1q 3e 2e | 1h_"],
["b_hh808","hiphop","1 6 1*2","1q. 1s 1s re 1e 7,e 6,e~ | 1,h.v re <e | 1h_"],
["b_hhrnb","hiphop","17 47 1*2","1e. 5,s 7,e 1e 3q 2e 1e | 1e. 5,s 7,e 1e 3q 2e <e | 1h_"],
["b_hhboom","hiphop","1 1 1*2","1e. 1s rq 1e. 5,s 7,e re | 1e. 1s rq 1e. 3s 2e re | 1h_",{sw:0.58}],
/* gospel */
["b_gs4s4","gospel","1 4*2 #4o*2 5d7 1*2","1q 3 5 3 | 1 3 1 3 | 1 3 5 7 | 1h_"],
["b_gscircle","gospel","1*2 6d7*2 27*2 5d7*2 1*2","1e 3 5 < | 1 7, 5, 3, | 1 3 5 < | 1 7, 5, 3, | 1h_"],
["b_gsrun","gospel","1 1*2","8e 7s 6 5e 4s 3 1e 7,s 6, 5,e 6,s 7, | 1h_"],
["b_gsshout","gospel","1d7 4d7 1*2","1e 1 b3! 3 5 5 6 5 | 1 1 b3! 3 5 5 6 5 | 1h_",{cm:"1m7 4m7 1*2"}],
["b_gsturn","gospel","1*2 3d7*2 67*2 27*1 5d7*1 1*2","1q 3 | 1 < | 1 5, | 1 | 1 | 1h_"],
["b_gschurch","gospel","1 4 1*2","1q 5,e 6,e 1q 3q | 1q 5,e 6,e 1q <q | 1h_"],
/* punk */
["b_pk8","punk","1 4 5 1*2","1e 1 1 1 1 1 1 1 | 1 1 1 1 1 1 1 1 | 1 1 1 1 1 1 1 1 | 1h_"],
["b_pkpop","punk","1*2 5*2 6*2 4*2 1*2","1e 1 1 1 | 1 1 1 1 | 1 1 1 1 | 1 1 1 1 | 1h_"],
["b_pkoct","punk","1 4 1*2","1e 1 1 1 8 8 1 1 | 1 1 1 1 8 8 1 1 | 1h_"],
["b_pkdown","punk","1*2 b7*2 b6*2 5*2 1*2","1e 1 1 1 | 1, 1, 1, 1, | 1, 1, 1, 1, | 1, 1, 1, < | 1h_"],
["b_pkfast","punk","1 4 1*2","1s 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 | 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 | 1h_"],
["b_pkmelo","punk","1 6 4 5 1*2","1e 1 1 1 5 5 6 7 | 1 1 1 1 5, 5, 6, 7, | 1 1 1 1 3 3 2 < | 1 1 1 1 5, 5, 4, 3, | 1h_"],
/* pop */
["b_poroots","pop","1 5 6 4 1*2","1q. 1e 1q 3e <e | 1q. 1e 1q 7,e <e | 1q. 1e 1q 7,e <e | 1q. 1e 1q 5,e <e | 1h_"],
["b_poballad","pop","1*2 5*2 6*2 67*2 4 1*2","1h 3,h | 1,h 7,,h | 1,q 3, 5, 3, | 1h_"],
["b_popush","pop","1 4 6 5 1*2","1e. 1s re 5,e 1q 3e 5e | 1e. 1s re 5,e 1q 3,e 5,e | 1,e. 1,s re 3,e 1,q 3,e 5,e | 1,e. 1,s re 3,e 1,q 5,e <e | 1h_"],
["b_populse","pop","6 4 1 5 1*2","1,e 1, 1, 1, 1, 1, 1, 1 | 1, 1, 1, 1, 1, 1, 1, 1 | 1 1 1 1 1 1 1 8 | 1, 1, 1, 1, 1, 1, 1, < | 1h_"],
["b_posing","pop","1 4 5 1*2","1q 3e 2e 3q 5e 6e | 1q 3e 2e 3q 5e 6e | 1q 3e 2e 3q 2e 1e | 1h_"],
["b_poarp","pop","1 4 6 5 1*2","1e 5 8 5 1 5 8 5 | 1, 5, 1 5, 1, 5, 1 5, | 1, 5, 1 5, 1, 5, 1 5, | 1, 5, 1 5, 1, 5, 3, 2, | 1h_"],
/* neo-soul */
["b_nsslide","neosoul","17 47 1*2","1q./ 5,e 7,q 1q~ | 1q./ 5,e 7,q 1q~ | 1h_"],
["b_ns9","neosoul","17 47 1*2","1e 5 8 9H 8O 7 5 3 | 1 5 8 9H 8O 7 5 3 | 1h_"],
["b_nsghost","neosoul","27 5d7 17 1*2","1e. xs 5,e 6,e 7,e 1e xs 3s <e | 1e. xs 5,e 6,e 7,e 5,e 4,e 3,e | 1e. xs 5,e 6,e 7,e 1e xs 3s <e | 1h_"],
["b_nshigh","neosoul","17 47 1*2","8q.v 7e 5q 3q | 8q.v 7e 5q 6q | 8hv"],
["b_nschrom","neosoul","17 47 1*2","8e 7 b7! 6 5 #4! 4 3 | 1q 3,e 5,e 7,q <q | 1h_"],
["b_nsham","neosoul","17 47 1*2","1s 2H 1O 7, 5,e 1e 3e 4H 3O <e | 1s 2H 1O 7, 5,e 1e 3e 4H 3O <e | 1h_"],
/* Afrobeat */
["b_afvamp","afro","1d7 1d7 1*2","1s rs rs 1s rs 5,s rs 7,s 1s rs 3s rs 5s rs 3s 1s | 1s rs rs 1s rs 5,s rs 7,s 1s rs 3s rs 5s rs 3s 1s | 1h_",{cm:"1m7 1m7 1*2"}],
["b_afrun","afro","1d7 1d7 1*2","1e. 7,s 1e 2e 3e 5e 4e 3e | 1e. 7,s 1e 2e 3e 5e 4e 2e | 1h_",{cm:"1m7 1m7 1*2"}],
["b_afoct","afro","1d7 1d7 1*2","1s rs 8s rs rs 8s 7s rs 1s rs 8s rs 5s rs 7s rs | 1s rs 8s rs rs 8s 7s rs 1s rs 8s rs 5s rs 3s rs | 1h_",{cm:"1m7 1m7 1*2"}],
["b_aftwo","afro","1d7 4d7 1*2","1e. 1s re 5,e 7,e 1e re 3e | 1e. 1s re 5,e 7,e 1e re 3,e | 1h_",{cm:"1m7 4d7 1*2"}],
["b_afspace","afro","1d7 1d7 1*2","1e re re 5,e rq 1e 7,e | 1e re re 5,e rq 3e 2e | 1h_",{cm:"1m7 1m7 1*2"}],
["b_afroll","afro","1d7 1d7 1*2","1s 1 3 1 5 1 7 1 8 1 7 1 5 1 3 1 | 1 1 3 1 5 1 7 1 8 1 7 1 5 1 3 1 | 1h_",{cm:"1m7 1m7 1*2"}],
/* drum and bass */
["b_dnroll","dnb","1 4 1*2","1e 1s 5,s re 7,e 1e 1s 3s 5e 3e | 1e 1s 5,s re 7,e 1e 1s 3s 5e 3e | 1h_"],
["b_dnlong","dnb","1 6 1*2","1h.v 7,e 1e~ | 1,h.v 5,e 6,e | 1hv"],
["b_dnstep","dnb","1 1 1*2","1h re 1e 5,e 7,e | 1h re 1e 3e 2e | 1h_"],
["b_dnjump","dnb","1 1 1*2","1e. 8s 1e. 8s 1e 7,e 1e 5,e | 1e. 8s 1e. 8s 1e 7,e 1e 5,e | 1h_"],
["b_dnliquid","dnb","17 47 1*2","1q 5e 7e 8q~ 7e 5e | 1q 5e 7e 8q~ 7e 5e | 1h_"],
["b_dnsync","dnb","1 6 1*2","1e. 1e. 1e 5,e. 7,e. 1e | 1,e. 1,e. 1,e 5,e. 3,e. <e | 1h_"],
/* slap showcase */
["b_slbasic","slap","1d7 1d7 1*1","1eS 8P 1S 8P 5S 7P 8P 5S | 1S 8P 1S 8P 5S 7P 8P 5S | 1qS",{cm:"1m7 1m7 1*1", slap:1}],
["b_slghost","slap","1d7 1d7 1*1","1sS xg 8P xg 1S xg 8P 1S xg 1S 8P xg 7P xg 5S xg | 1S xg 8P xg 1S xg 8P 1S xg 1S 8P xg 7P 8P 5S xg | 1qS",{cm:"1m7 1m7 1*1", slap:1}],
["b_slham","slap","1d7 1d7 1*1","1sS 2H 1S 8P 1S 2H 1S 8P 5S 6H 5S 8P 7P 8P 5S 3S | 1S 2H 1S 8P 1S 2H 1S 8P 5S 6H 5S 8P 7P 8P 5S 3S | 1qS",{cm:"1m7 1m7 1*1", slap:1}],
["b_slround","slap","1d7*2 4d7*2 1d7*2 5d7*2 1*1","1sS xg 8P xg 1S 8P xg >S | 1,S xg 1P xg 1,S 1P xg <S | 1S xg 8P xg 1S 8P xg >S | 1,S xg 1P xg 1,S 1P xg <S | 1qS",{cm:"1m7*2 4m7*2 1m7*2 5d7*2 1*1", slap:1}],
["b_sltrip","slap","1d7 1d7 1*1","1tS 8P 8P 1S 8P 8P 1S 8P 8P 5S 7P 8P | 1S 8P 8P 1S 8P 8P 1S 8P 8P 5S 7P 8P | 1qS",{cm:"1m7 1m7 1*1", slap:1}],
["b_slpull","slap","1d7 1d7 1*1","1sS xg 8P 7O 5S xg 1S xg 1S xg 8P 7O 5S 6S 7P 8P | 1S xg 8P 7O 5S xg 1S xg 1S xg 8P 7O 5S 6S 7P 8P | 1qS",{cm:"1m7 1m7 1*1", slap:1}],
/* fills: turnarounds and runs into the next chord */
["b_fiup","fills","1 4*2","1e 1 1 1 1s 5, 6, 7, 1 2 #2! 3 | 1h_"],
["b_fidown","fills","1 5*2","1e 1 1 1 8s 7 6 5 4 3 2 1 | 1,h_"],
["b_fiarp","fills","1 1*2","1q 1q 1s 3 5 8 7 5 3 2 | 1h_"],
["b_fichrom","fills","1 5*2","1q 1q 1e 3e 4e #4e! | 1h_"],
["b_fitrip","fills","1 1*2","1q 1q 1t 2 3 5 6 7 | 8h_"],
["b_fiblues","fills","1d7*2 4d7*2 1d7*2 5d7*2 1*2","1e 3 5 6 | 1 3 5 3 | 1 3 4 #4! | 1 5, 7, < | 1h_",{cm:"1m7*2 4m7*2 1m7*2 5d7*2 1*2"}],
["b_fitop","fills","1 1*2","8e 7 5 3 1 5, 6, 7, | 1h_"],
/* AOG-SOLO-BASSLICKS-ROCK-V1 (2026-10-18) — Jimmy: "DIME BAG DARRELL or Kirk Hammett type of licks … Van Halen, Kiss, etc..
   Make the bass and guitar pages match." Original lines in the style of those bands' bass players (never a real song's
   line); no player or band is named on screen. */
/* arena rock (in the style of Kiss's bassist): driving eighths, walk-ups into the change, octave pumps, big simple hooks */
["b_ardrive","arena","1 b7 4 1*1","1e 1 1 1 1 1 5, 6, | 1 1 1 1 1 1 2 3 | 1 1 1 1 3 3 5 5 | 1q_"],
["b_arwalk","arena","1 4 5 1*1","1q 1e 1 1 1 2 3 | 1q 1e 1 1 1 2 3 | 1q 1e 1 1 1 2 3 | 8q_"],
["b_aroct","arena","1 4 1 5 1*1","1e 8 1 8 1 8 5 3 | 1 8 1 8 1 8 5 3 | 1 8 1 8 1 8 5 3 | 1 8 1 8 1 8 2 < | 8q_"],
["b_arhook","arena","1 b6 b7 1*1","1q. 1e 5,q 1q | 1q. 1e 5,q 1q | 1q. 1e 5,q 3q | 1q_"],
["b_arshout","arena","1*2 5*2 6*2 4*2 1*1","1e 1 1 1 | 1 1 1 1 | 1 1 1 1 | 1 1 3 < | 8q_"],
["b_arrun","arena","1 5 1*1","1e 1 1 1 1 1 1 1 | 1 1 1 1 1s 2 3 4 5 4 3 2 | 8q_"],
/* 80s hard rock (in the style of Van Halen's bassist): steady eighths, root-fifth-octave, pedal tones, hammer-on fills, a tap */
["b_h8drive","hard80","1 4 1 5 1*1","1e 1 1 1 1 1 1 1 | 1 1 1 1 1 1 1 1 | 1 1 1 1 1 1 1 1 | 1 1 1 1 1 1 2 < | 8q_"],
["b_h8158","hard80","1 4 5 1*1","1e 5 8 5 1 5 8 5 | 1 5 8 5 1 5 8 5 | 1 5 8 5 1 5 3 2 | 1q_"],
["b_h8pedal","hard80","1 b7 1*1","1e 1 3 1 5 1 4 1 | 1, 1, 3, 1, 5, 1, 2, 1, | 1q_"],
["b_h8ham","hard80","1 4 1*1","1e 1 1 1 1 2H 3H 5 | 1 1 1 1 1 2H 3H 5 | 1q_"],
["b_h8tap","hard80","1 1 1*1","1s 3 5 8T 5 3 1 3 5 8T 5 3 1 3 5 8T | 8T 5 3 1 3 5 8T 5 3 1 3 5 8T 7 5 < | 8q_"],
["b_h8chorus","hard80","1 6 4 5 1*1","1e 1 1 1 1 1 5, 6, | 1, 1, 1, 1, 1, 1, 3, 2, | 1 1 1 1 1 1 3 2 | 1 1 1 1 3 3 2 < | 8q_"],
/* thrash metal (in the style of Metallica's bassists): fast gallops, chromatic runs, melodic minor lines, a classical arpeggio */
["b_thgal","thrash","1 1 1*1","1e 1s 1 b2e! b2s! b2! 1e 1s 1 1e 1s 1 | 1e 1s 1 1e 1s 1 3e 3s 3 2e 2s 2 | 1q_"],
["b_thclimb","thrash","1 1 1*1","1s 1 1 1 1 1 b2! 2 3 3 3 3 3 3 4 #4! | 5 5 5 5 5 5 b6! 5 3 3 3 3 2 2 b2! b2! | 1q_"],
["b_thmel","thrash","1 b6 b7 1*2","1q 3e 5e 8q 7e 5e | 3q 1e 3e 5q. 3e | 5q 3e 2e 1q 5,q | 1h_"],
["b_tharp","thrash","1 4 5 1*2","1s 3 5 8 5 3 1 3 5 8 5 3 1 3 5 3 | 5, 1 3 5 3 1 5, 1 3 5 3 1 5, 1 3 1 | 5, 1 3 5 3 1 5, 1 3 5 3 1 5, 1 2 < | 8h_",{cm:"1m 4m 5M 1*2"}],
["b_thrun","thrash","1 1 1*1","8s 8 8 7 b7! 6 b6! 5 5 5 5 5 #4! 4 3 3 | 3 3 3 2 b2! 1 1 1 1 1 1 1 1 1 1 1 | 1q_"],
["b_thdrive","thrash","1 b7 b6 5M 1*1","1e 1 1 1 8 1 1 1 | 1, 1, 1, 1, 1 1, 1, 1, | 1, 1, 1, 1, 1 1, 1, 1, | 1, 1, 1, 1, 3, 3, 2, < | 1q_"],
/* groove metal (in the style of Pantera's bassist): low riffs locked to the kick, dead notes, slides, bends, half steps */
["b_grlock","groove","1 1 1*1","1e 1s 1s re 1e- xg 1e b2e! 1e | 1e 1s 1s re 1e- xg 3e 2e b2e! | 1q_"],
["b_grslide","groove","1 1 1*1","1q/ 1s- 1s- re 1e- 3e- 4e #4e! | 5q/ 5s- 5s- re 5e- 4e- 3e 2e | 1q_"],
["b_grbend","groove","1 1 1*1","1e 1 3B 1 1 1 4B 1 | 1 1 3B 1 5 4 3 2 | 1q_"],
["b_grdead","groove","1 1 1*1","1s xg 1 xg 1 xg b2! 1 rs 1 xg 1 5, 6, b7,! 7, | 1 xg 1 xg 1 xg b2! 1 rs 1 3 2 b2! 1 xg xg | 1q_"],
["b_grhalf","groove","1*2 b2*2 1*2 b7*2 1*1","1e. 1s re 1e | 1e. 1s re 1e | 1e. 1s re 1e | 1,e. 1,s re <e | 1q_"],
["b_grswing","groove","1 1 1*1","1e- re 1s 1s b3e! 3e- 1e- 5,e <e | 1e- re 1s 1s b3e! 3e- 1e- 4eB 3e | 1q_"],
/* shred and tapping: taps, fast hammer-ons and pull-offs, arpeggio runs */
["b_shtap","shred","1 4 1*1","1s 5 8T 5 1 5 8T 5 3 5 8T 5 1 5 8T 5 | 1 5 8T 5 1 5 8T 5 3 5 8T 5 1 5 8T 5 | 1q_"],
["b_shleg","shred","1 1 1*1","1s 2H 3H 2O 1 3 5 6H 5O 3 5 8 9H 8O 5 3 | 1 2H 3H 2O 1 3 5 6H 5O 3 2 1 2 3 b2! 1 | 1q_"],
["b_sharp","shred","1 6 4 5 1*1","1t 3 5 8 5 3 1 3 5 8 5 3 | 1, 3, 5, 1 5, 3, 1, 3, 5, 1 5, 3, | 5, 1 3 5 3 1 5, 1 3 5 3 1 | 5, 1 3 5 3 1 5, 1 3 5 2 < | 8q_"],
["b_sh2hand","shred","1 1 1*1","1s 5T 8T 5T 1 5T 8T 9T 8 5T 3 5T 8T 7T 5 3 | 1 5T 8T 5T 1 5T 8T 9T 8 7T 5T 3T 2 3 b2! 1 | 1q_"],
["b_shtrip","shred","1 1 1*1","1t 2H 3H 2O 1 2H 3H 5 3 2 1 2 | 3 5 6H 5O 3 2 1 2 3 2 1 2 | 1q_"],
["b_shscale","shred","1 5 1*1","1s 2 3 4 3 4 5 6 5 6 7 8 7 8 9 8 | 1 2 3 4 3 4 5 6 5 4 3 2 1 2 3 2 | 8q_"],
/* slow and singing: long notes, vibrato, gentle slides like a fretless */
["b_slsing","slow","1 4 5 1*2","8hV 5q 6q | 5hV 3q 2q | 3hV 1h~ | 8h_"],
["b_slglide","slow","1 6 4 5 1*2","1hV 3q 2q~ | 1hV 3q 2q~ | 1hV 3q 2q~ | 1hV 3q 2q | 1h_"],
["b_slcry","slow","1 4 1*2","3hV 5q 3q | 1hV 3q 2qB | 1h_"],
["b_slballad","slow","1*2 5*2 6*2 4*2 1*2","8hV | 3hV | 1qV 3q | 1q 3q | 8h_"],
["b_slsoft","slow","1 4 1*2","1q 2H 3hV | 1q 2H 3hV | 1h_"],
["b_slseven","slow","17 47 1*2","8hV 7h | 5hV 3q 2q | 1h_"],
/* surf: driving eighths, tremolo sixteenths, gallops, slides and half steps */
["b_sfdrive","surf","1 4 5d7 1*2","1e 1 3 1 5 1 3 1 | 1 1 3 1 5 1 3 1 | 1 1 3 1 5 3 2 < | 8h_",{cm:"1m 4m 5d7 1*2"}],
["b_sftrem","surf","1 4 1*2","1s 1 1 1 1 1 1 1 3 3 3 3 3 3 3 3 | 1 1 1 1 1 1 1 1 3 3 3 3 2 2 2 2 | 1h_"],
["b_sfstep","surf","1 4 5 1*2","1e 1 1 1 1 2 b3! 3 | 1 1 1 1 1 2 b3! 3 | 1 1 1 1 3 2 b2! 1 | 1h_"],
["b_sfgal","surf","1 4 1*2","1e 1s 1 1e 1s 1 5,e 5,s 5, 6,e 6,s 6, | 1e 1s 1 1e 1s 1 5,e 5,s 5, 6,e 6,s 6, | 1h_"],
["b_sfdown","surf","1 b7 b6 5M 1*2","1e 1 5, 1 1 1 5, 1 | 1 1 5, 1 1 1 5, 1 | 1 1 5, 1 1 1 5, 1 | 1 1 5, 1 3 3 2 < | 8h_"],
["b_sftwang","surf","1 4 1*2","1q 5,e 6,e 1q\\ 5,q | 1q 5,e 6,e 1q\\ 3q | 1h_"]
];
const GROUPS=[["rock"],["blues"],["funk"],["motown"],["reggae"],["jazz"],["latin"],["metal"],["country"],["disco"],["hiphop"],["gospel"],["punk"],["pop"],["neosoul"],["afro"],["dnb"],["slap"],["fills"],
  ["arena"],["hard80"],["thrash"],["groove"],["shred"],["slow"],["surf"]]
  .map(([g])=>[g, RAW.filter(r=>r[1]===g).map(r=>r[0])]);
const ORDER=[].concat(...GROUPS.map(g=>g[1]));
const LICKS={}; RAW.forEach(([id, g, ch, n, x])=>{ LICKS[id]=Object.assign({id, g, ch, n}, x||{}); });

/* ══ the words: the groups, each lick's name and its one line, English and Spanish ══════════════════════════════════ */
const W={
  lgb_rock:["Rock","Rock"], lgb_blues:["Blues","Blues"], lgb_funk:["Funk","Funk"], lgb_motown:["Motown and soul","Motown y soul"],
  lgb_reggae:["Reggae and dub","Reggae y dub"], lgb_jazz:["Jazz","Jazz"], lgb_latin:["Latin","Latino"], lgb_metal:["Metal","Metal"],
  lgb_country:["Country","Country"], lgb_disco:["Disco","Disco"], lgb_hiphop:["Hip-hop and R&B","Hip-hop y R&B"], lgb_gospel:["Gospel","Gospel"],
  lgb_punk:["Punk","Punk"], lgb_pop:["Pop","Pop"], lgb_neosoul:["Neo-soul","Neo-soul"], lgb_afro:["Afrobeat","Afrobeat"],
  lgb_dnb:["Drum and bass","Drum and bass"], lgb_slap:["Slap showcase","Lo mejor del slap"], lgb_fills:["Fills and turnarounds","Rellenos y vueltas"],
  lgb_arena:["Arena rock","Rock de estadio"], lgb_hard80:["80s hard rock","Hard rock de los 80"], lgb_thrash:["Thrash metal","Thrash metal"],
  lgb_groove:["Groove metal","Groove metal"], lgb_shred:["Shred and tapping","Velocidad y tapping"], lgb_slow:["Slow and singing","Lentas y cantadas"], lgb_surf:["Surf","Surf"],
  tg_s:["slap","slap"], tg_P:["pop","pop"],
  b_rk8:["Eighth-note drive","Corcheas que empujan","Even eighth notes on the home note, then up to the fifth and the octave.","Corcheas parejas en la nota casa; luego sube a la quinta y a la octava."],
  b_rk15:["Root and fifth","Raíz y quinta","The home note and its fifth, then the same shape on the four chord.","La nota casa y su quinta; luego la misma figura en el acorde cuatro."],
  b_rkoct:["Octave pump","Octavas que bombean","Low and high home notes in turn, the same jump on every chord.","Nota casa grave y aguda por turnos, el mismo salto en cada acorde."],
  b_rkwalk:["Walk up to the four","Subida al cuatro","Eighths on the home note, climb into the four chord, then walk back down.","Corcheas en la nota casa, sube al acorde cuatro y luego baja caminando."],
  b_rkstop:["Riff with rests","Riff con silencios","Short notes with rests between, then a climb down to home.","Notas cortas con silencios entre ellas; luego baja hasta casa."],
  b_rkb7:["Flat seven rock","Rock con séptima bemol","Home, down to the flat seven chord, then the four, and home.","Casa, baja al acorde de séptima bemol, luego el cuatro y a casa."],
  b_blbox:["Walking blues box","Caja de blues que camina","Up the box one note a beat: root, third, fifth, sixth. Then the four chord.","Sube por la caja una nota por tiempo: raíz, tercera, quinta, sexta. Luego el acorde cuatro."],
  b_blshuf:["Shuffle boogie","Boogie con shuffle","Swinging pairs up to the flat seven and back down: the classic boogie.","Pares con swing hasta la séptima bemol y de vuelta: el boogie clásico."],
  b_blturn:["Blues turnaround","Vuelta de blues","The end of a blues: up the home chord, over to the five chord, a half step home.","El final de un blues: sube por el acorde casa, pasa al acorde cinco y medio tono a casa."],
  b_blclimb:["Climb to the octave","Subida hasta la octava","One note a beat, all the way up the scale to the high home note.","Una nota por tiempo, subiendo por la escala hasta la nota casa aguda."],
  b_blroll:["Slow blues roll","Blues lento que rueda","Three notes a beat, rolling up the chord and back. Slow and heavy.","Tres notas por tiempo, subiendo por el acorde y de vuelta. Lento y pesado."],
  b_blrest:["Riff with a rest","Riff con un silencio","Up the chord and down, a rest, then low notes walk back home.","Sube por el acorde y baja, un silencio, y las notas graves vuelven a casa."],
  b_fkoct:["Octave pops","Pops de octava","Thumb on the low note, pop the octave, with dead notes between.","Pulgar en la nota grave, pop en la octava, con notas muertas entre medio."],
  b_fkghost:["Ghost-note groove","Groove con notas fantasma","Busy sixteenths with soft dead notes in the gaps.","Semicorcheas movidas con notas muertas suaves en los huecos."],
  b_fkone:["On the one","En el uno","A big low note on beat one, then space, the low fifth and the flat seven.","Una nota grave fuerte en el uno; luego espacio, la quinta grave y la séptima bemol."],
  b_fkham:["Hammer-on funk","Funk con ligados","Slap the low note, then hammer from the second up to the third.","Slap en la nota grave; luego liga de la segunda a la tercera."],
  b_fkdead:["Dead-note sixteenths","Semicorcheas muertas","Keep the hand moving: real notes on the thumb, dead notes in between.","La mano no para: notas reales con el pulgar y notas muertas entre medio."],
  b_fkvamp:["Two-chord funk vamp","Vamp de funk en dos acordes","A short, bouncy figure on the home chord, then the same on the four chord.","Una figura corta y saltarina en el acorde casa; luego la misma en el acorde cuatro."],
  b_mowalk:["Motown chord walk","Paseo Motown por los acordes","The root of each chord, a jump to the fifth, then a half step into the next.","La raíz de cada acorde, un salto a la quinta y medio tono hacia el siguiente."],
  b_mosync:["Dotted soul line","Línea de soul con puntillo","Long-short pairs up the chord to the octave and back. Bright and busy.","Pares largo-corto que suben por el acorde hasta la octava y vuelven. Alegre y movida."],
  b_morun:["Motown run with half steps","Carrera Motown con semitonos","Each chord gets its root, a quick dip below, then half steps into the next.","Cada acorde tiene su raíz, una bajada rápida y luego semitonos hacia el siguiente."],
  b_moriff:["Sweet soul riff","Riff dulce de soul","A long home note, then up the chord with a little turn at the top.","Una nota casa larga; luego sube por el acorde con una vuelta pequeña arriba."],
  b_mostax:["Memphis groove","Groove de Memphis","Home, a rest, the octave, then down through the flat seven.","Casa, un silencio, la octava y luego baja por la séptima bemol."],
  b_moupdn:["Soul line up and down","Línea de soul que sube y baja","Up the chord to the octave and down by step, on the home chord and the five.","Sube por el acorde hasta la octava y baja por pasos, en el acorde casa y en el cinco."],
  b_rgdrop:["One-drop line","Línea de one drop","Rest on beat one, then a short, round line that lands with the drum on three.","Silencio en el uno; luego una línea corta y redonda que cae con el tambor en el tres."],
  b_rgdub:["Deep dub","Dub profundo","Very low and slow. Long notes with lots of space between.","Muy grave y lento. Notas largas con mucho espacio entre ellas."],
  b_rgstep:["Steppers","Steppers","Busy eighths over a steady kick, from home to the flat seven chord.","Corcheas movidas sobre un bombo constante, de casa al acorde de séptima bemol."],
  b_rgbounce:["Rockers bounce","Rebote rockers","Short notes that bounce, with gaps, like a ball on the floor.","Notas cortas que rebotan, con huecos, como una pelota en el suelo."],
  b_rgspace:["Space, then a phrase","Espacio y luego una frase","Half a bar of silence, then a short phrase up the scale. Let the space speak.","Medio compás de silencio y luego una frase corta que sube. Deja que el espacio hable."],
  b_rgslide:["Dub slides","Deslizamientos de dub","Slide into each long note, and let the last one fall away.","Desliza hacia cada nota larga y deja caer la última."],
  b_jzwalk:["Two-five-one walk","Paseo dos-cinco-uno","One note a beat over the two, five and one chords. Each root on its first beat.","Una nota por tiempo sobre los acordes dos, cinco y uno. Cada raíz en su primer tiempo."],
  b_jzchrom:["Chromatic approach walk","Paseo con semitonos","Walk up each chord, then step a half step into the next one.","Camina por cada acorde y entra medio tono al siguiente."],
  b_jzdown:["Walking down","Paseo hacia abajo","Walk down each chord from the top, landing on each root.","Baja por cada acorde desde arriba y cae en cada raíz."],
  b_jzturn:["Jazz turnaround","Vuelta de jazz","Four chords, two beats each: the root, then a note that leans into the next.","Cuatro acordes de dos tiempos: la raíz y luego una nota que se inclina al siguiente."],
  b_jztwo:["Swing two-feel","Swing a dos","Two notes a bar, root and fifth, with a little swing step into each chord.","Dos notas por compás, raíz y quinta, con un pasito con swing hacia cada acorde."],
  b_jzblues:["Jazz blues walk","Paseo de jazz blues","A walking line over a jazz blues, with a blue note on the way up.","Una línea que camina sobre un blues de jazz, con una nota blue en la subida."],
  b_jzskip:["Walk with dead-note skips","Paseo con notas muertas","Walk up each chord, with a soft dead note skipped in before the top.","Camina por cada acorde, con una nota muerta suave antes de llegar arriba."],
  b_lttumb:["Tumbao","Tumbao","The Latin bass: rest on beat one, then notes that come in early for the next chord.","El bajo latino: silencio en el uno y luego notas que llegan antes al siguiente acorde."],
  b_ltbossa:["Bossa root and fifth","Bossa: raíz y quinta","Bossa nova: the root, then the fifth a little early, on each chord.","Bossa nova: la raíz y luego la quinta un poco antes, en cada acorde."],
  b_ltsamba:["Samba drive","Samba que empuja","Low notes that bounce on every beat, with a quick note just before each.","Notas graves que rebotan en cada tiempo, con una nota rápida justo antes."],
  b_ltcumbia:["Cumbia","Cumbia","A strong root, then two fifths, rocking between two chords.","Una raíz fuerte y luego dos quintas, meciéndose entre dos acordes."],
  b_lttres:["Tresillo","Tresillo","Three, three, two: the Caribbean rhythm under many Latin and pop songs.","Tres, tres, dos: el ritmo del Caribe debajo de muchas canciones latinas y pop."],
  b_ltbwalk:["Bossa with a walk home","Bossa que camina a casa","Root and fifth on the home chord, then two quick chords that walk you home.","Raíz y quinta en el acorde casa; luego dos acordes rápidos que te llevan a casa."],
  b_mgal:["Gallop","Galope","One long, two short, again and again, like a horse running, over three chords.","Una larga y dos cortas, una y otra vez, como un caballo que corre, sobre tres acordes."],
  b_mchug:["Chugs and the dark half step","Golpes y el semitono oscuro","Fast, short notes on the low home note, with a dark half step above it.","Notas rápidas y cortas en la nota casa grave, con un semitono oscuro encima."],
  b_mdoom:["Doom crawl","Doom que se arrastra","Very slow and heavy. Long low notes, a dark half step and a wide shake.","Muy lento y pesado. Notas graves largas, un semitono oscuro y un vibrato ancho."],
  b_mthrash:["Thrash sixteenths","Semicorcheas de thrash","Fast, even notes that never stop, stepping around the home note.","Notas rápidas y parejas que no paran, moviéndose alrededor de la nota casa."],
  b_mbreak:["Breakdown","Parte pesada","Heavy hits with silence between. Let the space hit as hard as the notes.","Golpes pesados con silencio entre ellos. Que el espacio golpee tan fuerte como las notas."],
  b_mpedal:["Pedal riff","Riff con pedal","The low home note between every note of a fast riff.","La nota casa grave entre cada nota de un riff rápido."],
  b_cnalt:["Root-five boom-chick","Raíz y quinta, bum-chic","Root, then the low fifth, back and forth on each chord.","Raíz y luego la quinta grave, de un lado a otro en cada acorde."],
  b_cnwalk:["Country walk-up","Subida country","Root and fifth, then three quick steps up into the next chord.","Raíz y quinta; luego tres pasos rápidos que suben al siguiente acorde."],
  b_cndown:["Walk down to six","Bajada al seis","Root and fifth, a step down into the six chord, and home.","Raíz y quinta, un paso abajo hacia el acorde seis, y a casa."],
  b_cnbg:["Bluegrass run","Carrera de bluegrass","A quick run up the scale and back, then the root and fifth.","Una carrera rápida que sube por la escala y vuelve; luego raíz y quinta."],
  b_cnstep:["Two-step","Two-step","The dance-floor beat: root, low fifth, third, low fifth, chord to chord.","El ritmo para bailar: raíz, quinta grave, tercera, quinta grave, de acorde en acorde."],
  b_cnchrom:["Half steps to the five","Semitonos al cinco","Root and fifth, then a climb of half steps up to the five chord.","Raíz y quinta; luego una subida de semitonos hasta el acorde cinco."],
  b_dsoct:["Disco octaves","Octavas de disco","The disco sound: low and high octaves, bouncing on every chord.","El sonido disco: octavas grave y aguda que rebotan en cada acorde."],
  b_dsgal:["Octave gallop","Octavas al galope","The low note, then two quick high ones, every beat.","La nota grave y luego dos agudas rápidas, en cada tiempo."],
  b_dswalk:["Octaves with a walk","Octavas que caminan","Octaves, then two steps up into the next chord.","Octavas y luego dos pasos que suben al siguiente acorde."],
  b_dsseven:["Octaves with the seventh","Octavas con la séptima","Octaves, then down to the seventh and the fifth, the high note bouncing between.","Octavas y luego baja a la séptima y a la quinta, con la nota aguda rebotando entre medio."],
  b_dsrun:["Octaves and a run","Octavas y una carrera","Octaves for a bar, then a fast run up and down.","Octavas durante un compás y luego una carrera rápida arriba y abajo."],
  b_dsfifth:["Octave and fifth","Octava y quinta","Root, octave, fifth, octave: a wider bounce on each chord.","Raíz, octava, quinta, octava: un rebote más amplio en cada acorde."],
  b_hhsub:["Long sub notes","Notas sub largas","Long, low notes that shake a little, with two short notes to move on.","Notas largas y graves que tiemblan un poco, con dos notas cortas para avanzar."],
  b_hhglide:["Slide up to the beat","Desliza hacia el tiempo","Slide up into the notes on beats one and three.","Desliza hacia las notas de los tiempos uno y tres."],
  b_hhbounce:["R&B bounce","Rebote de R&B","A bouncy line with a quick pickup into beat three.","Una línea que rebota con una nota rápida antes del tiempo tres."],
  b_hh808:["808 slides","Deslizamientos de 808","Short low hits, a slide down, then one long note, like an 808.","Golpes graves y cortos, un deslizamiento hacia abajo y luego una nota larga, como una 808."],
  b_hhrnb:["Smooth R&B line","Línea suave de R&B","Smooth steps around each chord, with the seventh just below the root.","Pasos suaves alrededor de cada acorde, con la séptima justo debajo de la raíz."],
  b_hhboom:["Boom-bap bounce","Rebote boom bap","Notes that follow a hip-hop kick drum, with a little swing.","Notas que siguen al bombo del hip-hop, con un poco de swing."],
  b_gs4s4:["Four, sharp four, five","Cuatro, cuatro sostenido, cinco","The church climb: four, then sharp four, then five, each with its own chord.","La subida de iglesia: cuatro, cuatro sostenido y cinco, cada uno con su acorde."],
  b_gscircle:["Round the circle","Por el círculo","Up each chord, then a half step into the next, round the circle home.","Sube por cada acorde y luego medio tono al siguiente, dando la vuelta hasta casa."],
  b_gsrun:["Gospel run down","Carrera de gospel","A fast run down the scale from the high home note, then back up home.","Una carrera rápida que baja por la escala desde la nota casa aguda y vuelve a casa."],
  b_gsshout:["Shout bass","Bajo de shout","Fast and joyful: through the blue third up to the fifth.","Rápido y alegre: pasa por la tercera blue hasta la quinta."],
  b_gsturn:["Gospel turnaround","Vuelta de gospel","Down the circle of chords, a root on each, back home.","Baja por el círculo de acordes, una raíz en cada uno, de vuelta a casa."],
  b_gschurch:["Church walk","Paseo de iglesia","A slow, warm walk: the root, a dip below, and the third of each chord.","Un paseo lento y cálido: la raíz, una bajada y la tercera de cada acorde."],
  b_pk8:["Punk eighths","Corcheas de punk","Fast eighth notes on the root of each chord. Keep it tight.","Corcheas rápidas en la raíz de cada acorde. Bien justas."],
  b_pkpop:["Pop-punk roots","Raíces de pop punk","Eighths on four chords, two beats each: the pop-punk pattern.","Corcheas en cuatro acordes de dos tiempos: el patrón del pop punk."],
  b_pkoct:["Punk octave jump","Salto de octava punk","Root four times, jump to the octave and back.","La raíz cuatro veces, salta a la octava y vuelve."],
  b_pkdown:["Walk down four chords","Bajada de cuatro acordes","Down four chords, root notes all the way, a step into home.","Baja por cuatro acordes, raíces todo el tiempo, y un paso hacia casa."],
  b_pkfast:["Fast sixteenths","Semicorcheas rápidas","Very fast, even notes on the root. Rest your hand between bars.","Notas muy rápidas y parejas en la raíz. Descansa la mano entre compases."],
  b_pkmelo:["Melodic punk line","Línea melódica de punk","Driving eighths that climb at the end of each bar into the next chord.","Corcheas que empujan y suben al final de cada compás hacia el siguiente acorde."],
  b_poroots:["Pop roots","Raíces de pop","The four-chord song: roots, then a half step into each new chord.","La canción de cuatro acordes: raíces y medio tono hacia cada acorde nuevo."],
  b_poballad:["Ballad walk-down","Bajada de balada","Slow, one step down at a time under four chords, then up and home.","Lento, un paso abajo cada vez bajo cuatro acordes; luego sube y a casa."],
  b_popush:["Pop with a push","Pop con empuje","Short notes that push ahead of the beat, then up the chord.","Notas cortas que empujan antes del tiempo y luego suben por el acorde."],
  b_populse:["Pulse with an octave","Pulso con una octava","Steady eighths on each root, with a jump to the octave at the end of the bar.","Corcheas constantes en cada raíz, con un salto a la octava al final del compás."],
  b_posing:["Singing bass line","Línea de bajo que canta","A bass line like a melody: small steps around each chord's third.","Una línea de bajo como una melodía: pasos pequeños alrededor de la tercera de cada acorde."],
  b_poarp:["Up and down the chord","Arriba y abajo por el acorde","Root, fifth, octave, fifth, gently rocking on each chord.","Raíz, quinta, octava, quinta, meciéndose suave en cada acorde."],
  b_nsslide:["Lazy slides","Deslizamientos relajados","Slide into the root, then slide up from the seventh. Relaxed and late.","Desliza hacia la raíz y luego sube deslizando desde la séptima. Relajada y tarde."],
  b_ns9:["Ninths and hammer-ons","Novenas y ligados","Up to the octave, hammer on to the ninth, pull back, and walk down.","Sube a la octava, liga a la novena, vuelve soltando y baja caminando."],
  b_nsghost:["Ghost-note pocket","Bolsillo con notas fantasma","Laid back, with soft dead notes in the gaps and a half step into each chord.","Relajado, con notas muertas suaves en los huecos y medio tono hacia cada acorde."],
  b_nshigh:["High and singing","Aguda y cantada","Up high, slow notes with a gentle shake, coming down the chord.","Arriba, notas lentas con un vibrato suave, bajando por el acorde."],
  b_nschrom:["Chromatic slide down","Bajada cromática","From the high home note down by half steps, then up the four chord.","Desde la nota casa aguda baja por semitonos; luego sube por el acorde cuatro."],
  b_nsham:["Hammer and pull","Ligar y soltar","Quick hammer-ons and pull-offs around the root, then around the third.","Ligados rápidos arriba y abajo alrededor de la raíz y luego de la tercera."],
  b_afvamp:["Afrobeat vamp","Vamp de afrobeat","A short, catchy figure that repeats, with gaps the drums fill.","Una figura corta y pegadiza que se repite, con huecos que llena la batería."],
  b_afrun:["Afrobeat run","Carrera de afrobeat","Up from the root by step, a jump to the fifth, then back down.","Sube por pasos desde la raíz, salta a la quinta y vuelve a bajar."],
  b_afoct:["Octave interlock","Octavas que encajan","Low root, high octave in the gaps, and the seventh: a line that locks with the drums.","Raíz grave, octava aguda en los huecos y la séptima: una línea que encaja con la batería."],
  b_aftwo:["Two-chord groove","Groove de dos acordes","The same bouncy shape on the home chord and the four chord.","La misma figura saltarina en el acorde casa y en el acorde cuatro."],
  b_afspace:["Space groove","Groove con espacio","Few notes, lots of space. Each note lands where the drums leave room.","Pocas notas y mucho espacio. Cada nota cae donde la batería deja sitio."],
  b_afroll:["Rolling sixteenths","Semicorcheas que ruedan","Even sixteenths, the root between every note, up the chord and back.","Semicorcheas parejas, la raíz entre cada nota, subiendo por el acorde y volviendo."],
  b_dnroll:["Rolling line","Línea que rueda","A fast line that rolls around the root and keeps moving forward.","Una línea rápida que rueda alrededor de la raíz y siempre avanza."],
  b_dnlong:["Long low notes","Notas largas y graves","Long, deep notes that shake, with a quick slide back up.","Notas largas y profundas que tiemblan, con un deslizamiento rápido hacia arriba."],
  b_dnstep:["Two-step line","Línea de dos pasos","A long note on one, then a short burst that follows the kick drum.","Una nota larga en el uno y luego una ráfaga corta que sigue al bombo."],
  b_dnjump:["Jump-up","Jump-up","The root with quick jumps to the octave, then down to the seventh and fifth.","La raíz con saltos rápidos a la octava; luego baja a la séptima y a la quinta."],
  b_dnliquid:["Liquid line","Línea líquida","Smooth and singing: up to the seventh, slide to the octave, and back down.","Suave y cantada: sube a la séptima, desliza a la octava y vuelve a bajar."],
  b_dnsync:["Off-beat sub","Sub a contratiempo","Three, three, two in fast notes: the root, then the fifth and the seventh.","Tres, tres, dos en notas rápidas: la raíz y luego la quinta y la séptima."],
  b_slbasic:["Thumb and pop","Pulgar y pop","Thumb the low note, pop the octave. Slap bass starts here.","Pulgar en la nota grave, pop en la octava. El slap empieza aquí."],
  b_slghost:["Slap with dead notes","Slap con notas muertas","Sixteenths: thumb, dead note, pop, dead note. Keep the hand bouncing.","Semicorcheas: pulgar, nota muerta, pop, nota muerta. Que la mano rebote."],
  b_slham:["Thumb and hammer-on","Pulgar y ligado","Thumb a note, hammer on the next one up, then pop the octave.","Pulgar en una nota, liga la siguiente y luego pop en la octava."],
  b_slround:["Octave pops round the chords","Pops de octava por los acordes","Thumb and pop octaves on four chords, with a half step into each one.","Octavas con pulgar y pop en cuatro acordes, con medio tono hacia cada uno."],
  b_sltrip:["Slap triplets","Tresillos de slap","Thumb, pop, pop: three even notes in every beat.","Pulgar, pop, pop: tres notas parejas en cada tiempo."],
  b_slpull:["Pop and pull-off","Pop y ligado hacia abajo","Pop the octave and pull off to the note below it, then thumb back down.","Pop en la octava y suelta hacia la nota de abajo; luego vuelve con el pulgar."],
  b_fiup:["Run up into the four","Carrera hacia el cuatro","Eighths on the root, then fast sixteenths up into the four chord.","Corcheas en la raíz y luego semicorcheas rápidas que suben al acorde cuatro."],
  b_fidown:["Run down to the five","Carrera hacia el cinco","Eighths on the root, then down the whole scale and drop to the five chord.","Corcheas en la raíz; luego baja toda la escala y cae al acorde cinco."],
  b_fiarp:["End of the bar fill","Relleno al final del compás","Two plain beats, then a quick arpeggio up and a run down home.","Dos tiempos sencillos; luego un arpegio rápido que sube y una carrera que baja a casa."],
  b_fichrom:["Half steps into the five","Semitonos hacia el cinco","Up from the root through the third and fourth, then a half step into the five chord.","Sube desde la raíz por la tercera y la cuarta; luego medio tono hacia el acorde cinco."],
  b_fitrip:["Triplet run up","Carrera de tresillos","Two beats, then threes up the scale to the high home note.","Dos tiempos y luego tresillos que suben por la escala hasta la nota casa aguda."],
  b_fiblues:["Blues turnaround fill","Relleno de vuelta de blues","Four chords, two beats each, ending with the five chord's step back home.","Cuatro acordes de dos tiempos que terminan con el paso del acorde cinco de vuelta a casa."],
  b_fitop:["Down from the top","Desde arriba","From the high home note, down the chord and the scale to the low one.","Desde la nota casa aguda, baja por el acorde y la escala hasta la grave."],
  b_ardrive:["Stadium eighths","Corcheas de estadio","Steady eighths on each root, with a short climb into each new chord.","Corcheas parejas en cada raíz, con una subida corta hacia cada acorde nuevo."],
  b_arwalk:["Walk-up into the change","Subida hacia el cambio","A long root, quick eighths, then two steps up into the next chord.","Una raíz larga, corcheas rápidas y luego dos pasos que suben al siguiente acorde."],
  b_aroct:["Octaves and a hook","Octavas y un gancho","Low and high roots in turn, then the fifth and the third round off each bar.","Raíz grave y aguda por turnos; luego la quinta y la tercera cierran cada compás."],
  b_arhook:["Big simple hook","Gancho grande y sencillo","Long-short roots and a drop to the low fifth. Easy to sing along.","Raíces largo-corto y una bajada a la quinta grave. Fácil de cantar."],
  b_arshout:["Sing-along roots","Raíces para cantar","Eighths on four quick chords, then a half step up to the high home note.","Corcheas en cuatro acordes rápidos y luego medio tono hasta la nota casa aguda."],
  b_arrun:["Run into the chorus","Carrera hacia el estribillo","A bar of eighths, then a fast run up and down on the five chord.","Un compás de corcheas y luego una carrera rápida arriba y abajo en el acorde cinco."],
  b_h8drive:["Eighth-note engine","Motor de corcheas","Even eighths on the root of four chords. Steady and strong under the guitar.","Corcheas parejas en la raíz de cuatro acordes. Firme y fuerte bajo la guitarra."],
  b_h8158:["Root, fifth, octave","Raíz, quinta, octava","Up to the octave and back on each chord, then down by step to home.","Sube a la octava y vuelve en cada acorde; luego baja por pasos a casa."],
  b_h8pedal:["Pedal tone","Nota pedal","The home note between every note of a climbing line, then the same on the flat seven chord.","La nota casa entre cada nota de una línea que sube; luego lo mismo en el acorde de séptima bemol."],
  b_h8ham:["Hammer-on fill","Relleno con ligados","Steady eighths, then hammer on from the root up to the third.","Corcheas firmes y luego liga desde la raíz hasta la tercera."],
  b_h8tap:["Tapped octave","Octava con tapping","Fast notes up the chord, with the high octave tapped by the other hand.","Notas rápidas por el acorde, con la octava aguda tocada con tapping de la otra mano."],
  b_h8chorus:["Chorus drive","Empuje del estribillo","Eighths on four chords. Each bar ends with a short step into the next.","Corcheas en cuatro acordes. Cada compás termina con un paso corto hacia el siguiente."],
  b_thgal:["Gallop with a dark step","Galope con un paso oscuro","One long, two short, fast, with a half step above the root.","Una larga y dos cortas, rápido, con medio tono encima de la raíz."],
  b_thclimb:["Chromatic climb","Subida cromática","Fast sixteenths that climb by half steps to the fifth, then come back down.","Semicorcheas rápidas que suben por semitonos hasta la quinta y vuelven a bajar."],
  b_thmel:["Melodic minor line","Línea melódica en menor","A singing line up and down each chord. It sounds best in minor.","Una línea que canta, arriba y abajo por cada acorde. Suena mejor en menor."],
  b_tharp:["Classical arpeggios","Arpegios clásicos","Fast broken chords, like old music for strings. Each chord rolls up and down.","Acordes desplegados rápidos, como música antigua para cuerdas. Cada acorde sube y baja."],
  b_thrun:["Chromatic run down","Bajada cromática","From the high home note down by half steps, then keep driving the low root.","Desde la nota casa aguda baja por semitonos; luego sigue empujando en la raíz grave."],
  b_thdrive:["Fast roots down four chords","Raíces rápidas por cuatro acordes","Fast eighths walking down four chords, then a half step home.","Corcheas rápidas que bajan por cuatro acordes y luego medio tono a casa."],
  b_grlock:["Lock with the kick","Pegado al bombo","Short, heavy notes that hit with the kick drum, and a half step above the root.","Notas cortas y pesadas que caen con el bombo, y medio tono encima de la raíz."],
  b_grslide:["Slide and stab","Deslizar y golpear","Slide into the root, short stabs, then half steps up to the fifth.","Desliza hacia la raíz, golpes cortos y luego semitonos hasta la quinta."],
  b_grbend:["Bend and grind","Estirar y apretar","A low riff with a small bend on the third and on the fourth.","Un riff grave con un pequeño bend en la tercera y en la cuarta."],
  b_grdead:["Dead-note chug","Golpes con notas muertas","Sixteenths on the low root, dead notes between, and a half step above.","Semicorcheas en la raíz grave, notas muertas entre medio y medio tono encima."],
  b_grhalf:["Half-step heavy riff","Riff pesado de semitonos","The root, up a half step and back, then down and up into home.","La raíz, sube medio tono y vuelve; luego baja y sube hasta casa."],
  b_grswing:["Loose heavy groove","Groove suelto y pesado","A loose, heavy groove that slips up into the third, like the blues.","Un groove suelto y pesado que resbala hacia la tercera, como un blues."],
  b_shtap:["Tap the octave","Tapping en la octava","Root, fifth and a tapped octave, fast and even.","Raíz, quinta y una octava con tapping, rápido y parejo."],
  b_shleg:["Fast hammer-ons and pull-offs","Ligados rápidos","Up the scale with hammer-ons, back with pull-offs, string to string.","Sube por la escala con ligados y vuelve soltando, de cuerda en cuerda."],
  b_sharp:["Triplet arpeggios","Arpegios en tresillos","Up and down each chord in threes, over four chords.","Arriba y abajo por cada acorde de tres en tres, sobre cuatro acordes."],
  b_sh2hand:["Two-hand tapping","Tapping a dos manos","Both hands on the neck: the root below, tapped notes above it.","Las dos manos en el mástil: la raíz abajo y notas con tapping encima."],
  b_shtrip:["Triplet legato","Legato en tresillos","Smooth threes with hammer-ons and pull-offs around the root.","Tresillos suaves con ligados arriba y abajo alrededor de la raíz."],
  b_shscale:["Scale run","Carrera por la escala","Fast sixteenths up the scale in small loops, then down on the five chord.","Semicorcheas rápidas que suben por la escala en pequeños bucles; luego bajan en el acorde cinco."],
  b_slsing:["Singing high line","Línea aguda que canta","Long, high notes with vibrato, stepping down chord by chord.","Notas largas y agudas con vibrato, bajando de acorde en acorde."],
  b_slglide:["Fretless glide","Deslizamiento sin trastes","A long root, the third, then a slow slide down a step, like a bass with no frets.","Una raíz larga, la tercera y luego un deslizamiento lento un paso abajo, como un bajo sin trastes."],
  b_slcry:["Slow cry","Lamento lento","Long notes with a wide shake, and a small bend at the end.","Notas largas con un vibrato ancho y un pequeño bend al final."],
  b_slballad:["Ballad line","Línea de balada","One long note on each chord, moving gently, then home.","Una nota larga en cada acorde, moviéndose con calma, y luego a casa."],
  b_slsoft:["Soft hammer-ons","Ligados suaves","The root, a gentle hammer-on up to the third, and a long shake.","La raíz, un ligado suave hasta la tercera y un vibrato largo."],
  b_slseven:["Gentle sevenths","Séptimas suaves","High notes that rest on the seventh, then walk down home.","Notas agudas que descansan en la séptima y luego bajan a casa."],
  b_sfdrive:["Surf drive","Empuje surf","Root, third and fifth in fast eighths, riding three chords.","Raíz, tercera y quinta en corcheas rápidas, sobre tres acordes."],
  b_sftrem:["Tremolo sixteenths","Semicorcheas en trémolo","Very fast, even notes on the root and the third, like a wave.","Notas muy rápidas y parejas en la raíz y la tercera, como una ola."],
  b_sfstep:["Half-step pickups","Entradas por semitonos","Eighths on each root, then a half step up into the third.","Corcheas en cada raíz y luego medio tono hacia la tercera."],
  b_sfgal:["Surf gallop","Galope surf","One long, two short, on the root, the fifth and the sixth.","Una larga y dos cortas en la raíz, la quinta y la sexta."],
  b_sfdown:["Surf walk-down","Bajada surf","Root and low fifth on four chords walking down, then a half step home.","Raíz y quinta grave en cuatro acordes que bajan; luego medio tono a casa."],
  b_sftwang:["Twang and fall","Twang y caída","A dip to the low fifth, then let the root fall away.","Una bajada a la quinta grave; luego deja caer la raíz."]
};
const WORDS={};
Object.keys(W).forEach(k=>{ const v=W[k];
  if(v.length===2) WORDS[k]={en:v[0], es:v[1]};
  else { WORDS["lk_"+k]={en:v[0], es:v[1]}; WORDS["ld_"+k]={en:v[2], es:v[3]}; } });

/* ══ chords ═══════════════════════════════════════════════════════════════════════════════════════════════════════ */
function parseChords(spec, minor){
  const SC=minor?MIN:MAJ, out=[]; let t=0;
  spec.trim().split(/\s+/).forEach(tok=>{
    const m=/^([b#]?)([1-7])(m7b5|M7|m7|d7|7|m|M|o)?(?:\*([\d.]+))?$/.exec(tok); if(!m) throw new Error("chord "+tok);
    const d=+m[2]-1, rt=m[1] ? (MAJ[d]+(m[1]==="b"?-1:1)+12)%12 : SC[d], idx=SC.indexOf(rt);
    const dia=k=>(SC[(idx+k)%7]-SC[idx]+12)%12;
    const tri=idx<0 ? "maj" : dia(2)===4 ? "maj" : dia(4)===6 ? "dim" : "min";
    let q=tri;
    switch(m[3]){
      case "m": q="min"; break; case "M": q="maj"; break; case "m7": q="m7"; break; case "M7": q="maj7"; break;
      case "d7": q="dom7"; break; case "o": q="dim"; break; case "m7b5": q="m7b5"; break;
      case "7": q=idx<0 ? "dom7" : tri==="maj" ? (dia(6)===11?"maj7":"dom7") : tri==="min" ? "m7" : "m7b5"; break;
    }
    const len=m[4]!=null ? +m[4] : 4;
    const band=(q==="dim"||q==="m7b5") ? {off:(rt+3)%12, q:"min"} : {off:rt, q};
    out.push({t0:t, t1:t+len, root:rt, q, idx, tones:QT[q], band}); t+=len;
  });
  return out;
}
function chordAt(chs, t){ let c=chs[0]; for(const x of chs){ if(x.t0<=t+1e-6) c=x; } return c; }
/* a step of the key's scale above the chord's root (k = 0 is the root); a root outside the key: Mixolydian or Dorian */
function step(c, k, minor){
  if(c.idx>=0){ const SC=minor?MIN:MAJ, i=c.idx+k; return SC[i%7]+12*Math.floor(i/7)-SC[c.idx]; }
  const T=c.tones[1]===3 ? DOR : MIX; return T[k%7]+12*Math.floor(k/7);
}

/* ══ notes ════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const TOK=/^(r|x|<|>|\[|\]|[b#]?[1-9])([,']*)([whqest]\.?)?([SPgHOTvVB~!_\-\/\\]*)(@[EADG])?$/;
function parseNotes(spec){
  const out=[]; let t=0, dur=0.5;
  spec.trim().split(/\s+/).forEach(tok=>{
    if(tok==="|") return;
    const m=TOK.exec(tok); if(!m) throw new Error("note "+tok);
    if(m[3]){ dur=DUR[m[3][0]]*(m[3].length>1?1.5:1); }
    const p=m[1], oct=(m[2].match(/'/g)||[]).length-(m[2].match(/,/g)||[]).length, mods=m[4]||"";
    const e={t:+t.toFixed(6), slot:dur, p, oct, mods, str:m[5]?"EADG".indexOf(m[5][1]):-1};
    if(p!=="r") out.push(e);
    t+=dur;
  });
  return {list:out, beats:+t.toFixed(6)};
}
function scaleBelow(rel, minor, dir){
  const SC=minor?MIN:MAJ; for(let i=1;i<=2;i++){ const r=rel+dir*i; if(SC.indexOf(((r%12)+12)%12)>=0) return r; } return rel+dir;
}
/* the lick in the key: each note's pitch above the key's home note (rel), its chord, its kind */
/* AOG-LICKS-SONG-V1: ov.chs = other chords to play the lick over (the song's, a bar each); each note keeps its part on the
   new chord, and the chord's root moves the shortest way from where the lick's own chord had it. ov.pad: whole bars. */
function resolve(def, minor, ov){
  ov=ov||{};
  const own=parseChords(minor && def.cm ? def.cm : def.ch, minor), P=parseNotes(def.n), L=P.list;
  const chs=ov.chs ? ov.chs.map(c=>Object.assign({}, c, {tones:c.tones.slice()})) : own;
  let chordBeats=chs[chs.length-1].t1;
  if(ov.pad){ const B=bars4(P.beats); P.beats=B; if(!ov.chs) chordBeats=B; }
  if(chs[chs.length-1].t1<P.beats) chs[chs.length-1].t1=P.beats;
  let prev=null;
  L.forEach(e=>{
    const c=chordAt(chs, e.t), oc=chordAt(own, e.t); e.chord=c; e.ocI=own.indexOf(oc);
    const near0=oc.root+((c.root-oc.root+18)%12)-6;   /* the new root, the shortest way from the lick's own */
    if(ov.chs && c._base==null) c._base=near0;   /* by chord: one place for the whole of a new chord */
    const base=ov.chs ? (ov.mode==="own" ? near0 : c._base) : c.root;
    const g=e.mods.indexOf("g")>=0 || e.p==="x";
    e.k=g?"g":e.mods.indexOf("H")>=0?"h":e.mods.indexOf("O")>=0?"o":e.mods.indexOf("~")>=0?"h":e.mods.indexOf("T")>=0?"t":e.mods.indexOf("P")>=0?"P":e.mods.indexOf("S")>=0?"s":"p";
    e.slide=e.mods.indexOf("~")>=0?"from":e.mods.indexOf("/")>=0?"in":e.mods.indexOf("\\")>=0?"fall":"";
    e.pop=e.mods.indexOf("P")>=0; e.thumb=e.mods.indexOf("S")>=0;
    e.pass=e.mods.indexOf("!")>=0;
    if(e.p==="x"){ if(!prev) throw new Error("x first"); e.rel=prev.rel; e.str=prev.str; }
    else if(/^[<>\[\]]$/.test(e.p)){ e.appr=e.p; }
    else {
      const n=+e.p.slice(-1), acc=e.p.length>1?e.p[0]:"";
      let iv;
      if(acc) iv=MAJINT[n-1]+(acc==="b"?-1:1);
      else if(n===1) iv=0; else if(n===8) iv=12;
      else if(n===3) iv=(c.tones[1]===3||c.tones[1]===4) ? c.tones[1] : step(c, 2, minor);
      else if(n===5) iv=c.tones[2];
      else if(n===7) iv=c.tones[3]!=null ? c.tones[3] : step(c, 6, minor);
      else if(n===9) iv=step(c, 1, minor)+12;
      else iv=step(c, n-1, minor);
      e.rel=base+iv+12*e.oct;
    }
    prev=e;
  });
  if(ov.fit) fitFix(L, chs, minor, false);
  /* the leaning notes, from the note after them */
  for(let i=L.length-1;i>=0;i--){ const e=L[i]; if(!e.appr) continue;
    const nx=L[i+1]; if(!nx || nx.rel==null) throw new Error("approach at the end");
    e.rel = e.appr==="<" ? nx.rel-1 : e.appr===">" ? nx.rel+1 : scaleBelow(nx.rel, minor, e.appr==="[" ? -1 : 1);
    e.rel+=12*e.oct; }
  L.forEach((e,i)=>{ if(e.p==="x" && e.rel==null) e.rel=L[i-1].rel; });
  if(ov.fit) fitFix(L, chs, minor, true);
  return {chs, L, beats:P.beats, chordBeats};
}

/* ══ AOG-LICKS-SONG-V1 (Jimmy, 2026-10-19: licks "to use them within my own creations / songs"): a lick on your chords ══ */
const pcm=x=>((x%12)+12)%12;
function bars4(beats){ return Math.max(4, Math.ceil(beats/4-1e-6)*4); }
function strongAt(t){ return Math.abs(t/2-Math.round(t/2))<1e-6; }
/* the numbers check() asks for, kept on the new chords: beats 1 and 3 on the chord's notes; the rest in the key or the
   chord, or passing by step on purpose; the end on its chord's root. A note that would break one moves to the nearest
   note that keeps it; a dead note stays where the note before it is. */
function fitFix(L, chs, minor, after){
  const SC=minor?MIN:MAJ, inKey=r=>SC.indexOf(pcm(r))>=0, tone=(c,r)=>c.tones.some(x=>pcm(c.root+x)===pcm(r));
  /* the nearest note that keeps the numbers, a step toward the middle of the lick first (so it does not grow wider) */
  const rs=L.filter(e=>e.rel!=null).map(e=>e.rel), mid=(Math.min(...rs)+Math.max(...rs))/2;
  const lo=Math.min(...rs), hi=Math.max(...rs);
  const near=(r, f)=>{ const g=r<mid?1:-1, edge=r<=lo+1||r>=hi-1;   /* at the lick's edge: inward only, as far as it takes */
    const ds=edge ? [0,g,2*g,3*g,4*g,5*g,6*g,-g,-2*g,-3*g] : [0,g,-g,2*g,-2*g,3*g,-3*g,4*g,-4*g,5*g,-5*g,6];
    for(const d of ds) if(f(r+d)) return r+d; return r; };
  const real=L.filter(e=>e.p!=="x");
  if(!after){
    real.forEach((e,i)=>{ if(e.appr) return;
      /* a moved note does not land on the note beside it (the line keeps moving where it moved) */
      const pv=real[i-1], nx=real[i+1], apart=r=>!(pv && pv.rel===r && pv.rel!==e.rel) && !(nx && nx.rel===r && nx.rel!==e.rel);
      const go=f=>{ const a=near(e.rel, r=>f(r) && apart(r)); e.rel=f(a) ? a : near(e.rel, f); };
      if(strongAt(e.t)){ if(!tone(e.chord, e.rel)) go(r=>tone(e.chord, r)); }
      else if(!inKey(e.rel) && !tone(e.chord, e.rel) && !e.pass) go(r=>inKey(r)||tone(e.chord, r)); });
    const last=real[real.length-1];
    if(last && !last.appr && pcm(last.rel)!==pcm(last.chord.root)) last.rel=near(last.rel, r=>pcm(r)===pcm(last.chord.root));
  } else {
    real.forEach((e,i)=>{ if(inKey(e.rel) || tone(e.chord, e.rel)) return; const nx=real[i+1];
      if(!(e.pass||e.appr) || !nx || Math.abs(nx.rel-e.rel)>2 || strongAt(e.t)){ e.rel=near(e.rel, r=>inKey(r)||tone(e.chord, r)); e.pass=false; e.appr=null; } });
  }
  L.forEach((e,i)=>{ if(e.p==="x" && i>0) e.rel=L[i-1].rel; });
}
/* the room's chords ({off, q, iv}) as a lick's chords, a bar each, from bar `from`, for `bars` bars (as aog-guitar-licks.js) */
function songChords(prog, minor, bars, from){
  const SC=minor?MIN:MAJ, out=[];
  for(let j=0;j<bars;j++){
    const p=prog[(((from||0)+j)%prog.length+prog.length)%prog.length], rt=pcm(p.off), idx=SC.indexOf(rt);
    /* the chord's own notes as it is: its third (or a sus chord's 2nd or 4th; a power chord takes the key's third), its
       fifth (♭5, ♯5 too) and its seventh */
    const iv=new Set((p.iv||[0,4,7]).map(pcm)), dia3=idx>=0 ? pcm(SC[(idx+2)%7]-SC[idx]) : 4;
    const third=iv.has(4) ? 4 : iv.has(3) ? 3 : iv.has(5) ? 5 : iv.has(2) ? 2 : dia3;
    const fifth=iv.has(7) ? 7 : iv.has(6) ? 6 : iv.has(8) ? 8 : 7, sev=iv.has(10) ? 10 : iv.has(11) ? 11 : (third===3 && fifth===6 && iv.has(9)) ? 9 : -1;
    const tones=[0, third, fifth].concat(sev>=0 ? [sev] : []), key=tones.join(",");
    const q=({"0,4,7":"maj","0,3,7":"min","0,3,6":"dim","0,4,7,10":"dom7","0,4,7,11":"maj7","0,3,7,10":"m7","0,3,6,10":"m7b5"})[key] || (third===2||third===5 ? "sus" : fifth===8 ? "aug" : "other");
    out.push({t0:j*4, t1:j*4+4, root:rt, q, idx, tones, band:{off:p.off, q:p.q||q}});
  }
  return out;
}

/* ══ where the hand goes: one position (five frets, and the open strings near the nut), each note on a string ═══ */
function place(L, w, rootM, oct, tuning, maxf){
  const T=tuning||TUNE, MF=maxf||MAXF;
  const ok=f=>f>=0 && f<=MF && ((f>=w && f<=w+SPAN) || (f===0 && w<=2));
  const cands=L.map((e,i)=>{
    const m=rootM+e.rel+12*oct; e.m=m; const out=[];
    for(let s=0;s<T.length;s++){
      const f=m-T[s]; if(!ok(f)) continue;
      if(e.str>=0 && s!==e.str) continue;
      if(e.thumb && s>1) continue;
      if(e.pop && s<2) continue;
      if(e.slide==="in" && !(f-2>=1 && ok(f-2))) continue;
      if(e.slide==="fall" && !(f-2>=1 && ok(f-2))) continue;
      if(e.slide==="from" && f===0) continue;
      out.push({s, f});
    }
    return out;
  });
  if(cands.some(c=>!c.length)) return null;
  /* the fewest moves: a dynamic programme over the strings */
  let row=cands[0].map(c=>({c, cost:c.f*0.02, back:null}));
  const rows=[row];
  for(let i=1;i<L.length;i++){
    const e=L[i], pe=L[i-1], legato=e.k==="h"||e.k==="o", next=[];
    cands[i].forEach(c=>{
      let best=null;
      rows[i-1].forEach(p=>{
        if(legato || e.slide==="from"){ if(p.c.s!==c.s) return;
          if(e.slide==="from"){ if(p.c.f===c.f || p.c.f===0) return; }
          else if(e.k==="h" && !(c.f>p.c.f)) return;
          else if(e.k==="o" && !(c.f<p.c.f)) return; }
        let k=p.cost+Math.abs(c.s-p.c.s)*1.0+(c.f>0&&p.c.f>0?Math.abs(c.f-p.c.f)*0.35:0.4);
        if(pe.m===e.m && c.s!==p.c.s) k+=3;
        if(e.k==="g" && c.s!==p.c.s) k+=2;
        if(!best || k<best.cost) best={c, cost:k, back:p};
      });
      if(best) next.push(best);
    });
    if(!next.length) return null;
    rows.push(next);
  }
  let end=rows[rows.length-1].reduce((a,b)=>b.cost<a.cost?b:a), path=[];
  for(let p=end;p;p=p.back) path.unshift(p.c);
  return {path, cost:end.cost};
}

/* the whole lick, ready to play: the guitar licks' own note format (t, s, f, d in beats; k; sl; b; v) */
/* AOG-LICKS-SONG-V1: o.chords (songChords) puts it on other chords (whole bars, check()'s numbers kept); o.pad: whole bars */
function compile(def, o){
  o=o||{};
  /* on other chords: each new chord in one place; else each of the lick's own chords moved on its own */
  if(o.chords && !o.mode) return compile(def, Object.assign({}, o, {mode:"chord"})) || compile(def, Object.assign({}, o, {mode:"own"})); const key=((o.key||0)%12+12)%12, minor=!!o.minor, T=o.tuning||TUNE, MF=o.maxf||MAXF;
  const R=resolve(def, minor, {chs:o.chords, mode:o.mode, pad:o.pad||!!o.chords, fit:!!o.chords}), L=R.L, rootM=T[0]+((key-(T[0]%12))%12+12)%12;
  const pref=def.oct||0;
  const inRange=(list, oct)=>{ const lo=Math.min(...list.map(e=>rootM+e.rel+12*oct)), hi=Math.max(...list.map(e=>rootM+e.rel+12*oct)); return lo>=T[0] && hi<=T[T.length-1]+MF; };
  const search=()=>{ let best=null;
    for(const oct of [pref, pref-1, pref+1, pref+2, pref-2]){
      if(!inRange(L, oct)) continue;
      for(let w=1; w<=MF-SPAN; w++){
        const pl=place(L, w, rootM, oct, T, MF); if(!pl) continue;
        const score=pl.cost+w*0.3+Math.abs(oct-pref)*8;
        if(!best || score<best.score) best={score, w, oct, path:pl.path};
      }
      if(best) break;
    }
    if(best) place(L, best.w, rootM, best.oct, T, MF);
    return best; };
  /* (a bar, or the part of a bar under one of the lick's own chords, is one stretch) */
  /* on other chords, when no one hand position holds it all: a position a bar, as near the one before as it can be
     (free: each bar may also sit an octave from the one before) */
  const bySeg=(free, unit)=>{ unit=unit||4;   /* unit: beats a stretch at most (a long run may move the hand twice a bar) */
    const key0=L.map(e=>Math.floor(e.t/unit+1e-9)*100+e.ocI); for(let i=L.length-2;i>=0;i--) if(L[i].appr) key0[i]=key0[i+1];   /* a leaning note goes with the note it leans on */
    const segOf=e=>key0[L.indexOf(e)], ks=[...new Set(L.map(segOf))].sort((a,b)=>a-b), segs=ks.map(k=>L.filter(e=>segOf(e)===k));
    segs.forEach((sg,i)=>{ if(!i) return; const e=sg[0]; if(e.k==="h"||e.k==="o") e.k="p"; if(e.slide==="from") e.slide=""; });
    for(const oct0 of [pref, pref-1, pref+1, pref+2, pref-2]){
      if(!free && !inRange(L, oct0)) continue;
      let prevW=null, prevO=oct0; const out=[];
      for(const sg of segs){
        let b=null;
        for(const oct of free ? [prevO, prevO-1, prevO+1, prevO-2, prevO+2] : [oct0]){ if(!inRange(sg, oct)) continue;
          for(let w=1; w<=MF-SPAN; w++){ const pl=place(sg, w, rootM, oct, T, MF); if(!pl) continue;
            const sc=pl.cost+(prevW==null ? w*0.3 : Math.abs(w-prevW)*0.5)+Math.abs(oct-prevO)*8; if(!b || sc<b.sc) b={sc, w, oct, path:pl.path}; } }
        if(!b){ out.length=0; break; }
        out.push({sg, w:b.w, oct:b.oct, path:b.path}); prevW=b.w; prevO=b.oct;
      }
      if(out.length===segs.length){ out.forEach(g=>place(g.sg, g.w, rootM, g.oct, T, MF));
        const path=[], wOf=[]; out.forEach(g=>{ g.path.forEach(x=>path.push(x)); g.sg.forEach(()=>wOf.push(g.w)); });
        return {w:out[0].w, oct:oct0, path, wOf}; }
      if(free) break;
    }
    return null; };
  let best=search();
  if(!best && o.chords) best=bySeg(false)||bySeg(false, 2)||bySeg(false, 1);
  if(!best && o.chords){ L.forEach(e=>{ if(e.k==="h"||e.k==="o") e.k="p"; if(e.slide==="from") e.slide=""; }); best=search()||bySeg(false)||bySeg(false, 2)||bySeg(false, 1); }
  if(!best && o.chords) best=bySeg(true)||bySeg(true, 2)||bySeg(true, 1);
  /* and last: a note that leaps more than the hand reaches comes an octave nearer (into 17 half steps); a leaning note
     still leans on the note after it */
  if(!best && o.chords){
    const rs=L.map(e=>e.rel); let lo0=Math.min(...rs), bestLo=lo0, moved=1e9;
    for(let lo=Math.min(...rs); lo<=Math.max(...rs); lo++){ const mv=rs.filter(r=>r<lo || r>lo+16).length; if(mv<moved){ moved=mv; bestLo=lo; } }
    L.forEach(e=>{ while(e.rel<bestLo) e.rel+=12; while(e.rel>bestLo+16) e.rel-=12; });
    for(let i=L.length-1;i>=0;i--){ const e=L[i], nx=L[i+1]; if(!e.appr || !nx) continue;
      e.rel = e.appr==="<" ? nx.rel-1 : e.appr===">" ? nx.rel+1 : scaleBelow(nx.rel, minor, e.appr==="[" ? -1 : 1); }
    L.forEach((e,i)=>{ if(e.p==="x" && i>0) e.rel=L[i-1].rel; });
    best=search()||bySeg(false)||bySeg(false, 2)||bySeg(false, 1)||bySeg(true); }
  if(!best) return null;
  const sw=def.sw||0, warp=x=>{ if(!sw) return x; const b=Math.floor(x+1e-9), fr=x-b; return b+(fr<=0.5 ? fr/0.5*sw : sw+(fr-0.5)/0.5*(1-sw)); };
  const notes=L.map((e,i)=>{
    const {s, f}=best.path[i], nx=L[i+1], legNext=nx && (nx.k==="h"||nx.k==="o"||nx.slide==="from");
    const fullLen=!nx || legNext || e.mods.indexOf("_")>=0, frac=e.mods.indexOf("-")>=0 ? 0.45 : fullLen ? 1 : 0.9;
    const t0=warp(e.t), t1=warp(e.t+e.slot*frac), d=+(t1-t0).toFixed(4);
    const n={t:+t0.toFixed(4), s, f, d, tb:e.t, tm:e.m, rel:e.rel};
    if(e.k!=="p") n.k=e.k;
    if(e.slide==="in"){ n.f=f-2; n.sl=[f, 0, Math.min(0.18, e.slot*0.4)]; }
    if(e.slide==="fall"){ n.sl=[f-2, d*0.55, d*0.35]; }
    if(e.slide==="from"){ const pf=best.path[i-1].f; n.f=pf; n.sl=[f, 0, Math.min(0.2, e.slot*0.5)]; }
    if(e.mods.indexOf("B")>=0) n.b=[1, 0.1, 0.25];
    if(/[vV]/.test(e.mods)){ n.v=Math.min(0.35, e.slot*0.4); if(e.mods.indexOf("V")>=0) n.vw=1.8; }
    if(e.pass) n.pass=1; if(e.appr) n.appr=e.appr;
    n.chord=R.chs.indexOf(e.chord);
    if(best.wOf) n.w=best.wOf[i];   /* AOG-LICKS-SONG-V1: the hand position of the note's bar */
    return n;
  });
  return {id:def.id, notes, chords:R.chs.map(c=>({t0:c.t0, t1:c.t1, root:c.root, q:c.q, tones:c.tones.slice(), band:c.band})), beats:R.beats, w:best.w, oct:best.oct,
    chordBeats:R.chordBeats, slap:!!def.slap, key, minor};
}

/* ══ the numbers: what a lick must be in every key ═══════════════════════════════════════════════════════════════ */
function check(C, o){
  o=o||{}; const T=o.tuning||TUNE, MF=o.maxf||MAXF, bad=[];
  if(!C){ return ["does not fit on the neck"]; }
  if(Math.abs(C.chordBeats-C.beats)>1e-6) bad.push(`the notes last ${C.beats} beats, the chords ${C.chordBeats}`);
  const SC=C.minor?MIN:MAJ; let W=C.w; const inPos=f=>(f>=W && f<=W+SPAN) || (f===0 && W<=2);
  C.notes.forEach((n,i)=>{
    const end=n.sl?n.sl[0]:n.f; W=n.w!=null?n.w:C.w;   /* AOG-LICKS-SONG-V1: on other chords a note may say its own (its bar's) */
    [n.f, end].forEach(f=>{ if(!inPos(f)) bad.push(`note ${i} fret ${f} outside frets ${W}-${W+SPAN}`); });
    const tm=n.sl && n.sl[1]===0 ? T[n.s]+n.sl[0] : T[n.s]+n.f;
    if(tm!==n.tm && !(n.sl && n.sl[1]>0)) bad.push(`note ${i} plays ${tm}, wrote ${n.tm}`);
    if(n.tm<T[0] || n.tm>T[T.length-1]+MF) bad.push(`note ${i} out of range (${n.tm})`);
    if(n.k==="g") return;
    const c=C.chords[n.chord], pc=((n.tm-C.key)%12+12)%12, chordPcs=c.tones.map(x=>(c.root+x)%12);
    const inKey=SC.indexOf(pc)>=0, isTone=chordPcs.indexOf(pc)>=0;
    const strong=Math.abs(n.tb/2-Math.round(n.tb/2))<1e-6;
    if(strong && !isTone) bad.push(`note ${i} at beat ${n.tb} is not in the chord`);
    if(!inKey && !isTone){
      const nx=C.notes.slice(i+1).find(x=>x.k!=="g");
      if(!(n.pass||n.appr)) bad.push(`note ${i} (${n.tm}) is outside the key and the chord`);
      else if(!nx || Math.abs(nx.tm-n.tm)>2) bad.push(`note ${i} passes to nothing near it`);
    }
    if(n.appr && strong) bad.push(`note ${i} leans on a strong beat`);
  });
  return bad;
}

const API={GROUPS, ORDER, LICKS, WORDS, compile, check, parseChords, songChords, bars4, _resolve:resolve};
if(typeof module!=="undefined" && module.exports) module.exports=API; else root.AOGBassLicks=API;
})(typeof window!=="undefined"?window:this);
