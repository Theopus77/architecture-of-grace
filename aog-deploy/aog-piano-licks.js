/* AOG-PIANO-LICKS-V1 (2026-10-19) — Jimmy: "start some agents on the piano and band licks as well that follow the same
   style of the guitar and bass licks." AOG-LICKS-SONG-V1 (Jimmy, 2026-10-19: "I could use them for in making a song
   without much modification of my own").

   The Piano room's licks ("Licks to try", right under the keys of music-piano.html), loaded only the first time the
   block is opened. Like the Guitar's and the Bass's (aog-guitar-licks.js, aog-bass-licks.js), each lick is written
   against chords, not keys, so it follows the song's key and major or minor and lands on the chord's own notes:

     chords: "1 4 5 1*2"  a chord a bar (4 beats) unless *n says how many beats. The number is the step of the key's
             scale it is built on (major or natural minor); b, # or n (natural) in front counts from the major scale.
             After it: m M 7 m7 M7 d7 (dominant 7) d9 M9 m9 6 m6 s4 (sus 4) o (diminished) m7b5; none = the key's own.
             cm: another chord line for a minor key; nm / nl: another right-hand / left-hand line for a minor key.
     notes:  each note is how it sits on the chord, how long, and how it is played:
             1 3 5 7 = the chord's root, third, fifth and seventh; 2 4 6 9 = the chord's own (a sixth, a ninth, a sus
             fourth) or the key's scale above the root; 8 = the octave; b3 #4 n6 … = that many steps from the root counted
             on the major scale (blue notes, passing notes); , = an octave down, ' = an octave up; r = a rest;
             < and > = a half step below or above the next note; [ and ] = the key's scale note below or above the next;
             w h q e s t f = whole, half, quarter, eighth, sixteenth, triplet eighth, triplet sixteenth (. adds half);
             the length carries on to the next note.
             3+5 = keys at once: a double note (thirds, sixths), an octave (1+8), a chord (1+3+5).
             How (after the length): ~ a crush (the key a half step below, struck just before), G a glide up the
             key's scale into it, R rolled from the bottom up, T a tremolo between its lowest and highest key, P held
             to the end of its chord, A an accent, - short, _ held full, ! a passing note on purpose.
     lh:     the left hand's own line, the same way; without one the left hand holds each chord softly.
   compile() places the right hand around the middle of the keys and the left hand below it, all on three octaves (a
   computer and an iPad show every key at once; a phone shows two, and they follow the right hand). Every lick lasts
   whole bars and starts on beat 1, so Repeat joins it end to start with no gap. Fit to my chords maps each bar onto the
   song's chord (the room's pattern): every note keeps its job on the new chord, and a note that no longer fits moves to
   the nearest that does. check() tests the numbers: whole bars, on the keys, three octaves, the chord's notes on beats
   1 and 3, the key's notes everywhere else unless a note passes by a half or whole step on purpose, and each hand's last
   note on its chord's root. */
(function(root){
"use strict";
const MAJ=[0,2,4,5,7,9,11], MIN=[0,2,3,5,7,8,10], MAJINT=[0,2,4,5,7,9,11,12,14];
const MIX=[0,2,4,5,7,9,10], DOR=[0,2,3,5,7,9,10];
const QT={maj:[0,4,7], min:[0,3,7], dim:[0,3,6], dom7:[0,4,7,10], maj7:[0,4,7,11], m7:[0,3,7,10], m7b5:[0,3,6,10],
  maj6:[0,4,7,9], m6:[0,3,7,9], dom9:[0,4,7,10,14], maj9:[0,4,7,11,14], m9:[0,3,7,10,14], sus4:[0,5,7]};
const DUR={w:4, h:2, q:1, e:0.5, s:0.25, t:1/3, f:1/6};

/* ══ the licks: [id, group, chords, right hand, extra] ═══════════════════════════════════════════════════════════════
   extra: lh (the left hand's own line; without one the left hand holds each chord softly, or comp: "h" "q" "s", or
   comp:0 for none), cm / nm / nl (the chords, the right hand, the left hand in a minor key), sw (swing: where the and
   falls, 0.5 to 0.7), o / lo (the right / left hand an octave higher (1) or lower (-1) than usual). */
const RAW=[
/* blues */
["p_blcrush","blues","1d7 4d7 1d7","5e 3~ 1 b7, 1q 3e 5 | 1e 3~ 5 6 b7q 6e 5 | 8q. b7e 5q 1q",{cm:"1m7 4m7 1m7", sw:0.64}],
["p_blturn","blues","1d7 1d7*2 5d7*2 1","1'+b7e 1'+6 1'+b6! 1'+5 1'+b7 1'+6 1'+b6! 1'+5 | 1q 3 5, >q | 1+3+5wR",
  {cm:"1m7 1m7*2 5d7*2 1", nm:"1'+5e 1'+b6 1'+n6! 1'+b7 1'+5 1'+b6 1'+n6! 1'+b7 | 1q 3 5, >q | 1+3+5wR", sw:0.64}],
["p_blshuf","blues","1d7 4d7 1","1+5e 1+6 1+5 1+6 1+b7 1+6 1+5 1+6 | 1+5 1+6 1+5 1+6 1+b7 1+6 1+5 1+6 | 1+5h_ rh",{cm:"1m7 4m7 1", sw:0.66}],
["p_bltrem","blues","1d7 4d7 1","3+8hT 5+8hT | 3+8hT 1+5hT | 1+8wT",{cm:"1m7 4m7 1"}],
["p_blnote","blues","1d7 4d7 1","rq 3e~ 5 b7q 6e 5 | 3e~ 1 b7, 1 3q 1 | 1w_",{cm:"1m7 4m7 1", sw:0.64}],
["p_bloct","blues","1d7 4d7 1","1+8q 3+3' 5+5' 6+6'e 5+5' | 1+8q 3+3' 5+5' 3+3' | 1+8w",{cm:"1m7 4m7 1"}],
["p_blslow","blues","1d7 4d7 1","5t 6 5 3~ 1 3 5 6 5 3 1 3 | 1 3 5 6 5 3 1 3 5 6 5 3 | 1w_",{cm:"1m7 4m7 1"}],
/* boogie-woogie: the left hand walks */
["p_bwwalk","boogie","1d7 4d7 1d7 5d7 1","re 3+b7 rq re 3+b7 rq | re 3+b7 rq re 3+b7 rq | re 3+b7 rq re 3+b7 rq | re 3+b7 rq re 3+b7 rq | 1+3+5h_ rh",
  {lh:"1e 3 5 6 b7 6 5 3 | 1 3 5 6 b7 6 5 3 | 1 3 5 6 b7 6 5 3 | 1 3 5 6 b7 6 5 3 | 1h_ rh", cm:"1m7 4m7 1m7 5d7 1", sw:0.64}],
["p_bwoct","boogie","1d7 4d7 1","1'+3'hT 5+8hT | 1'+3'hT 5+8hT | 1+8h_ rh",{lh:"1e 8 3 8 5 8 6 8 | 1 8 3 8 5 8 6 8 | 1h_ rh", cm:"1m7 4m7 1", sw:0.64}],
["p_bwroll","boogie","1d7 4d7 1","5t 6 5 3 1 3 5 6 5 3 1 3 | 5 6 5 3 1 3 5 6 5 3 1 3 | 1h_ rh",{lh:"1e 5 6 5 b7 5 6 5 | 1 5 6 5 b7 5 6 5 | 1h_ rh", cm:"1m7 4m7 1", sw:0.64}],
["p_bwcross","boogie","1d7 1d7 1","5+8e 5+8 5+8 b3+5! 3+5 3+5 1+5 1+5 | 5+8 5+8 5+8 b3+5! 3+5 3+5 1+5 1+5 | 1+5h_ rh",
  {lh:"1e 3 5 6 b7 6 5 3 | 1 3 5 6 b7 6 5 3 | 1h_ rh", cm:"1m7 1m7 1", nm:"5+8e 5+8 5+8 4+5 3+5 3+5 1+5 1+5 | 5+8 5+8 5+8 4+5 3+5 3+5 1+5 1+5 | 1+5h_ rh", sw:0.64}],
["p_bwdown","boogie","1d7 4d7 1","8e b7 6 5 3 5 3 1 | 8 b7 6 5 3 5 3 1 | 1h_ rh",{lh:"1q 5 b7 5 | 1 5 b7 5 | 1h_ rh", cm:"1m7 4m7 1", sw:0.64}],
["p_bwintro","boogie","5d7 5d7 1","b7e 5 4 b3! 3 1 3 5 | b7 5 4 3 1 3 5 3 | 1h_ rh",{lh:"1e 3 5 6 b7 6 5 3 | 1 3 5 6 b7 6 5 3 | 1h_ rh", cm:"5d7 5d7 1", sw:0.64}],
["p_bwend","boogie","1d7 1","1+3e 1+3 b3+5! 3+5 1+5 1+5 1+6 1+b7 | 1+3+8h_ rh",{lh:"1e 3 5 6 b7 6 5 3 | 1h_ rh", cm:"1m7 1", nm:"1+3e 1+3 3+4 3+5 1+5 1+5 1+b6 1+b7 | 1+3+8h_ rh", sw:0.64}],
/* rock and roll */
["p_rkpound","rock","1 4 5 1","1+3+5e 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5h_ rh",
  {lh:"1e 1 1 1 1 1 1 1 | 1 1 1 1 1 1 1 1 | 1 1 1 1 1 1 1 1 | 1h_ rh"}],
["p_rkglide","rock","1 1","rh 8hG | 1+3+5qA 1+3+5 1+3+5h_",{lh:"1q 5, 1 5, | 1h_ rh"}],
["p_rktrip","rock","1 4 1","1+3+5t 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5h_ rh",{lh:"1q 5, 1 5, | 1 5, 1 5, | 1h_ rh"}],
["p_rkriff","rock","1 b7 4 1","1+5e 1+5 1+6 1+5 1+5 1+5 1+6 1+5 | 1+5 1+5 1+6 1+5 1+5 1+5 1+6 1+5 | 1+5 1+5 1+6 1+5 1+5 1+5 1+6 1+5 | 1+5h_ rh",{lh:"1e 1 1 1 1 1 1 1 | 1 1 1 1 1 1 1 1 | 1 1 1 1 1 1 1 1 | 1h_ rh"}],
["p_rkoct","rock","1 4 5 1","8+8'e 5+5' 3+3' 5+5' 8+8' 5+5' 3+3' 1+1' | 8+8' 5+5' 3+3' 5+5' 8+8' 5+5' 3+3' 1+1' | 5+5' 3+3' 2+2' 3+3' 5+5' 3+3' 2+2' 1+1' | 1+1'h_ rh",{comp:"q"}],
["p_rkballad","rock","1 5 6 4 1","3+5q 3+5 3+5 3+5 | 3+5 3+5 3+5 3+5 | 3+5 3+5 3+5 3+5 | 3+5 3+5 3+5 3+5 | 1+3+5wR",{lh:"1h 5,h | 1h 5,h | 1h 5,h | 1h 5,h | 1w"}],
["p_rkstop","rock","1 1 4 1","1+3+5q- rq rh | 1+3+5q- rq rh | 1+3+5q- rq 1+3+5q- rq | 1+3+5wG",{lh:"1q- rq rh | 1q- rq rh | 1q- rq 1q- rq | 1w"}],
/* gospel */
["p_gsamen","gospel","4 1","1+3+5qR 2+4+6 1+3+5 2+4+6 | 3+5+8wRP",{lh:"1h 5,h | 1w"}],
["p_gsrun","gospel","1 1","8e 6 5 3~ 1 6, 5, 6, | 1+3+5wR",{comp:"h"}],
["p_gssix","gospel","1 4 1","3+8e <+< 3+8 5+3' 3+8q 1+6e 3+8 | 3+8e <+< 3+8 5+3' 3+8q 1+6e 3+8 | 1+3+5wR",{nm:"3+8e 2+7 3+8 5+3' 3+8q 1+6e 3+8 | 3+8e 2+7 3+8 5+3' 3+8q 1+6e 3+8 | 1+3+5wR"}],
["p_gsfour","gospel","1s4*2 1*2 4s4*2 4*2 1","1+4+5h 1+3+5h | 1+4+5h 1+3+5h | 1+3+5+8wR",{lh:"1h 1h | 1h 1h | 1w"}],
["p_gsshout","gospel","1d7 4d7 1","1+3e 1+3 b3+5! 3+5 1+3 1+3 b3+5! 3+5 | 1+3 1+3 b3+5! 3+5 1+3 1+3 b3+5! 3+5 | 1+3+5h_ rh",
  {cm:"1m7 4m7 1", nm:"1+3e 1+3 4+5 3+5 1+3 1+3 4+5 3+5 | 1+3 1+3 4+5 3+5 1+3 1+3 4+5 3+5 | 1+3+5h_ rh", lh:"1e 1' 5 1' 1 1' 5 1' | 1 1' 5 1' 1 1' 5 1' | 1h_ rh", sw:0.62}],
["p_gswalkup","gospel","1*2 1d7*2 4 1","1+3+5q 1+3+5 1+3+b7 1+3+b7 | 1+3+5q 2+4+6 1+3+5 1+3+5 | 1+3+5wR",{lh:"1q 2 3 <q | 1q 3 5 6 | 1w"}],
["p_gscry","gospel","6m 2m 5d7 1","3q 5 3~ 1 | 3 5 3 1 | 5 4 3 2 | 1wP",{comp:"h"}],
/* jazz: two, five, one */
["p_jzbebop","jazz","27 5d7 17 1","1e 3 5 7 8 7 6 5 | 3 4 #4! 5 b7 6 b6! 5 | 3 1 2 3 5 7 9 7 | 8w",{sw:0.62}],
["p_jzencl","jazz","27 5d7 17 1","5q ]e [ 3q 1 | 7q ]e [ 5q 3 | 1q ]e [ 3q 5 | 8w",{sw:0.62}],
["p_jzshell","jazz","27 5d7 17 1","5e 7 9 7 5 3 1 3 | 5 7 9 7 5 4 3 < | 3 5 7 9 8 7 5 3 | 1w",{lh:"1+7h 1+7h | 1+7h 1+7h | 1+7h 1+7h | 1w", sw:0.62}],
["p_jzblock","jazz","17 6m7 27 5d7 1","3+5+7+8q 3+5+7+8 3+5+7+8 3+5+7+8 | 3+5+7+8 3+5+7+8 3+5+7+8 3+5+7+8 | 3+5+7+8 3+5+7+8 3+5+7+8 3+5+7+8 | 3+5+7+8 3+5+7+8 3+5+7+8 3+5+7+8 | 1+3+5+7wR",{lh:"1h 5,h | 1h 5,h | 1h 5,h | 1h 5,h | 1w"}],
["p_jzwalk","jazz","27 5d7 17 1","3q 5 7 9 | 7 5 3 < | 3 5 7 5 | 8w",{lh:"1q 2 3 5 | 1 7, 5, 3, | 1 3 5 3 | 1w", sw:0.62}],
["p_jzturn","jazz","17*2 6d7*2 27*2 5d7*2 1","3e 5 7 < | 3 5 7 < | 3 5 7 < | 3 5 7 < | 1wR",{sw:0.62}],
["p_jzoct","jazz","27 5d7 17 1","5+5'q 7+7' 8+8'h | 7+7'q 5+5' 3+3'h | 5+5'q 7+7' 3+3'h | 1+1'w",{comp:"h"}],
/* stride and ragtime */
["p_ststride","stride","1 4 5d7 1","3+5q 3+5 5+8 5+8 | 3+5 3+5 5+8 5+8 | 3+7 3+7 5+8 5+8 | 1+3+5wR",{lh:"1q 1+3+5 5, 1+3+5 | 1 1+3+5 5, 1+3+5 | 1 1+3+7 5, 1+3+7 | 1w"}],
["p_strag","stride","1 1d7 4 1","5e 6 5 3 8q 5 | b7e 6 5 3 1q 5 | 3e 5 6 5 8q 6 | 8w",{lh:"1q 3+5+8 5, 3+5+8 | 1 3+5+b7 5, 3+5+b7 | 1 3+5+8 5, 3+5+8 | 1w", sw:0.55}],
["p_stbreak","stride","1 5d7 1","8e. 5s 3e. 1s 5e. 3s 1e. 5,s | 7e. 5s 3e. 1s 5e. 3s 1e. 5,s | 1w",{lh:"1q 1+3+5 5, 1+3+5 | 1 1+3+7 5, 1+3+7 | 1w"}],
["p_stoct","stride","1 4 1","1+8e 3+3' 5+5' 3+3' 1+8q 3+3' | 1+8e 3+3' 5+5' 3+3' 1+8q 3+3' | 1+8w",{lh:"1q 3+5+8 5, 3+5+8 | 1 3+5+8 5, 3+5+8 | 1w"}],
["p_stwalk","stride","1 6d7 2d7 5d7 1","3q 5 3 1 | 3 5 3 1 | 3 5 3 1 | 3 5 3 < | 1w",{lh:"1q 3+5+8 5, 3+5+8 | 1 3+5+b7 5, 3+5+b7 | 1 3+5+b7 5, 3+5+b7 | 1 3+5+b7 5, 3+5+b7 | 1w"}],
["p_stsyn","stride","1 4 1","5e 8 rq 5e 8 rq | 5e 8 rq 5e 8 rq | 1+3+5w",{lh:"1q 3+5+8 5, 3+5+8 | 1 3+5+8 5, 3+5+8 | 1w"}],
["p_stcake","stride","1 5d7 1","3e 5 8 5 3 5 8 5 | 3 5 7 5 3 5 7 5 | 1w",{lh:"1q 3+5+8 5, 3+5+8 | 1 3+5+7 5, 3+5+7 | 1w", sw:0.55}],
/* New Orleans */
["p_nofats","nola","1 4 1","1+3+5t 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5w",
  {lh:"1q 1 5, 1 | 1 1 5, 1 | 1w"}],
["p_norumba","nola","1d7 4d7 1","3+5e. 3+5s re 3+5 rq 3+5 | 3+5e. 3+5s re 3+5 rq 3+5 | 1+3+5w",{lh:"1q. 3e 5q 3 | 1q. 3e 5q 3 | 1w", cm:"1m7 4m7 1"}],
["p_noroll","nola","1d7 1","1t 3 5 8 5 3 1 3 5 8 5 3 | 1w",{lh:"1q 5, 1 5, | 1w", cm:"1m7 1"}],
["p_notrem","nola","1d7 4d7 1","3+5hT 3+6hT | 3+5hT 3+6hT | 1+3+5wR",{lh:"1q. 3e 5q 3 | 1q. 3e 5q 3 | 1w", cm:"1m7 4m7 1"}],
["p_nocall","nola","1d7 4d7 1","8e 5 6 5 3~ 1 rq | 8e 5 6 5 3~ 1 rq | 1w",{lh:"1q 3 5 6 | 1 3 5 6 | 1w", cm:"1m7 4m7 1", sw:0.62}],
["p_nosecond","nola","1d7 5d7 1","1+3e. 1+3s re 1+3 rq 3+5 | 1+3e. 1+3s re 1+3 rq 3+5 | 1+3+5w",{lh:"1q. 5e 1q. 5e | 1q. 5e 1q. 5e | 1w", cm:"1m7 5d7 1"}],
["p_nostep","nola","1 4 5 1","1e 3 5 6 5 3 1 re | 1e 3 5 6 5 3 1 re | 1e 3 5 6 5 3 1 re | 1w",{lh:"1q 5, 1 5, | 1 5, 1 5, | 1 5, 1 5, | 1w"}],
/* funk */
["p_fkclav","funk","1d7 1d7 1","1+3s r 1+3 r 3+5 r 1+3 1+3 r 1+3 r 3+5 1+3 r 1+3 r | 1+3 r 1+3 r 3+5 r 1+3 1+3 r 1+3 r 3+5 1+3 r 1+3 r | 1+3w",{lh:"1e. 1s re 5,e 1e. 1s re 5,e | 1e. 1s re 5,e 1e. 1s re 5,e | 1w", cm:"1m7 1m7 1"}],
["p_fkstab","funk","1d7 4d7 1","3+5+7e- re re 3+5+7- re 3+5+7- 3+5+7- re | 3+5+7- re re 3+5+7- re 3+5+7- 3+5+7- re | 1+3+5w",{lh:"1e. 1s re 1e 5,e. 7,s re 1e | 1e. 1s re 1e 5,e. 7,s re 1e | 1w", cm:"1m7 4m7 1"}],
["p_fkline","funk","1d7 1d7 1","1s b3! 3 5 b7 5 3 1 rs 1 b3! 3 5 6 5 3 | 1 b3! 3 5 b7 5 3 1 rs 1 b3! 3 5 6 5 3 | 1w",{lh:"1e. 1s re 5,e 1e. 1s re 5,e | 1e. 1s re 5,e 1e. 1s re 5,e | 1w", cm:"1m7 1m7 1", nm:"1s 2 3 5 b7 5 3 1 rs 1 2 3 5 4 5 3 | 1 2 3 5 b7 5 3 1 rs 1 2 3 5 4 5 3 | 1w"}],
["p_fkghost","funk","1d7 1d7 1","5+8e- re 5+8s- 5+8- re 3+5e- re 3+5s- 3+5- re | 5+8e- re 5+8s- 5+8- re 3+5e- re 3+5s- 3+5- re | 1+5w",{lh:"1e. 1s re 5,e 1e. 1s re 5,e | 1e. 1s re 5,e 1e. 1s re 5,e | 1w", cm:"1m7 1m7 1"}],
["p_fkoct","funk","1d7 1d7 1","1+8s r r 1+8 r 5+5' r b7+b7' 1+8 r r 1+8 r 5+5' 6+6' 5+5' | 1+8 r r 1+8 r 5+5' r b7+b7' 1+8 r r 1+8 r 5+5' 6+6' 5+5' | 1+8w",{comp:"s", cm:"1m7 1m7 1"}],
["p_fkvamp","funk","1d9 4d9 1","3+5+7+9e- re 3+5+7+9- re rq 3+5+7+9e- re | 3+5+7+9- re 3+5+7+9- re rq 3+5+7+9e- re | 1+3+5w",{lh:"1e. 1s re 5,e 7,e 1e re 5,e | 1e. 1s re 5,e 7,e 1e re 5,e | 1w", cm:"1m9 4m9 1"}],
["p_fkrun","funk","1d7 1","8s 7 5 4 3 1 5, 7, 1 3 4 5 7 8 7 5 | 8w",{comp:"s", cm:"1m7 1"}],
/* Motown and soul */
["p_mohook","motown","1 4 1","1+8q. 3+3'e 5+5'q 3+3' | 5+5'q. 3+3'e 1+8q 3+3' | 1+8w"],
["p_mostep","motown","1*2 6m*2 4*2 5*2 1","3+5e 3+5 3+5 3+5 | 3+5 3+5 3+5 3+5 | 3+5 3+5 3+5 3+5 | 3+5 3+5 3+5 3+5 | 1+3+5wR",{lh:"1q 5, | 1 5, | 1 5, | 1 5, | 1w"}],
["p_mogos","motown","1 4 1","8e 6 5 3 5q 3 | 8e 6 5 3 5q 3 | 1+3+5wR"],
["p_mopulse","motown","1 6m 4 5 1","1+3+5e- 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- | 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- | 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- | 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- 1+3+5- | 1+3+5w",{lh:"1q 1 1 1 | 1 1 1 1 | 1 1 1 1 | 1 1 1 1 | 1w"}],
["p_mosweet","motown","1 4 5 1","5q 6e 5 3q 1 | 1q 3e 5 8q 5 | 5q 4e 3 1q 2 | 1w"],
["p_mostax","motown","1d7 4d7 1","1+3e re 1+3 b3+5! 3+5 re 1+3 re | 1+3 re 1+3 b3+5! 3+5 re 1+3 re | 1+3w",{cm:"1m7 4m7 1", nm:"1+3e re 1+3 4+5 3+5 re 1+3 re | 1+3 re 1+3 4+5 3+5 re 1+3 re | 1+3w", lh:"1e re 8 1 7, 5, 6, 5, | 1 re 8 1 7, 5, 6, 5, | 1w"}],
["p_moturn","motown","1 6m 2m 5 1","3q 1 5, 1 | 3 1 5, 1 | 3 1 5, 1 | 3 2 1 < | 1w"],
/* neo-soul */
["p_nsnine","neosoul","1M9 4M9 1M9","3+5+7+9wR | 3+5+7+9wR | 1+3+5+9wR",{lh:"1w | 1w | 1w", cm:"1m9 4m9 1m9"}],
["p_nsdrift","neosoul","27 5d7 1M9","5e 7 9 7 5q 3 | 7e 9 8 7 5q 3 | 1w",{sw:0.6, cm:"2m7b5 5d7 1m9"}],
["p_nsgrace","neosoul","1M9 4M9 1","9e 8 7 5 3q~ 5 | 9e 8 7 5 3q~ 1 | 1w",{cm:"1m9 4m9 1"}],
["p_nslazy","neosoul","1M7 4M7 1","rq 3e 5 7q 9 | rq 3e 5 7q 5 | 1w",{sw:0.62, cm:"1m7 4m7 1"}],
["p_nschrom","neosoul","1M9 6m9 1","3+7q <+<e 3+7 5+9q 3+7 | 3+7q <+<e 3+7 5+9q 3+7 | 1+5w",{cm:"1m9 6M9 1"}],
["p_nsghost","neosoul","27 5d7 17 1","5e. 3s 1e 7, 1q 3 | 7e. 5s 3e 1 5,q 7, | 1e 3 5 7 8q 7 | 8w",{lh:"1+7h 1+7h | 1+7h 1+7h | 1+7h 1+7h | 1w"}],
["p_nsrise","neosoul","4M7 3m7 2m7 1M9 1","3+7q 5+9 3+7 5+9 | 3+7 5+9 3+7 5+9 | 3+7 5+9 3+7 5+9 | 3+7 5+9 3+7 5+9 | 1+5w",{lh:"1w | 1w | 1w | 1w | 1w", cm:"b6M7 5m7 4m7 1m9 1"}],
/* hip-hop and R&B */
["p_hhlofi","hiphop","2m7 5m7 1M7 1","3+5+7wR | 3+5+7wR | 3+5+7wR | 1+3+5wR",{lh:"1w | 1w | 1w | 1w", cm:"4m7 5m7 1m7 1"}],
["p_hhbell","hiphop","1 6m 1","5q 3e 5 rh | 5q 3e 5 rh | 1w",{comp:"h"}],
["p_hhrnb","hiphop","17 47 1","3e 5 7 9 7q 5 | 3e 5 7 9 7q 3 | 1w",{sw:0.6}],
["p_hhloop","hiphop","1m7 4m7 1m7 4m7 1","5e 3 1 3 5 3 1 3 | 5 3 1 3 5 3 1 3 | 5 3 1 3 5 3 1 3 | 5 3 1 3 5 3 1 3 | 1w",{lh:"1h. rq | 1h. rq | 1h. rq | 1h. rq | 1w"}],
["p_hhsoul","hiphop","1M7 6m7 1","1+3+5+7q. 1+3+5+7e rh | 1+3+5+7q. 1+3+5+7e rh | 1+3+5w",{lh:"1q. 5,e rh | 1q. 5,e rh | 1w", cm:"1m7 6M7 1"}],
["p_hhfall","hiphop","1 4 1","8e 7 5 3 1q 2 | 8e 7 5 3 1q 3 | 1w",{sw:0.6}],
["p_hhsus","hiphop","1s4*2 1*2 1","1+4+5h 1+3+5h | 1+3+5w",{lh:"1w | 1w"}],
/* Latin and salsa montuno */
["p_ltmont","latin","1 4 5 1","1+8e 3+3' 1+8 5+5' re 3+3' 1+8 5+5' | 1+8 3+3' 1+8 5+5' re 3+3' 1+8 5+5' | 1+8 3+3' 1+8 5+5' re 3+3' 1+8 5+5' | 1+8w",{lh:"rq. 5,q. 1q | rq. 5,q. 1q | rq. 5,q. 1q | 1w"}],
["p_ltguaj","latin","1 5d7 1","5+8e re 3+5 5+8 re 3+5 1+3 3+5 | 5+7 re 3+5 5+7 re 3+5 1+3 3+5 | 1+3+5w",{lh:"rq. 5,q. 1q | rq. 5,q. 1q | 1w"}],
["p_ltbossa","latin","27 5d7 17 1","3+5+7q. 3+5+7e rq 3+5+7 | 3+5+7q. 3+5+7e rq 3+5+7 | 3+5+7q. 3+5+7e rq 3+5+7 | 1+3+5wR",{lh:"1q. 5,e 1q. 5,e | 1q. 5,e 1q. 5,e | 1q. 5,e 1q. 5,e | 1w"}],
["p_ltcha","latin","1 5 1","5e 5 3 3 1q 3 | 5e 5 3 3 1q 3 | 1w",{lh:"1q 5, 1e 1 5,q | 1 5, 1e 1 5,q | 1w"}],
["p_ltoct","latin","1 4 1","1+8e re 1+8 re 3+3' re 5+5' 3+3' | 1+8 re 1+8 re 3+3' re 5+5' 3+3' | 1+8w",{lh:"rq. 5,q. 1q | rq. 5,q. 1q | 1w"}],
["p_lttango","latin","1m 5d7 1m","1+3+5q. 1+3+5e 1+3+5q 1+3+5 | 1+3+5q. 1+3+5e 1+3+5q 1+3+5 | 1+3+5w",{lh:"1q. 1e 1q 5, | 1q. 1e 1q 5, | 1w"}],
["p_ltrun","latin","1 5d7 1","1e 2 3 5 3 2 1 5, | 7, 1 2 4 5 4 2 7, | 1w",{lh:"rq. 5,q. 1q | rq. 5,q. 1q | 1w"}],
/* reggae and ska */
["p_rgskank","reggae","1 4 1","re 1+3+5e- re 1+3+5- re 1+3+5- re 1+3+5- | re 1+3+5- re 1+3+5- re 1+3+5- re 1+3+5- | 1+3+5w",{lh:"1h. 5,q | 1h. 5,q | 1w"}],
["p_rgbubble","reggae","1 4 1","re 1+3+5e re 1+3+5 rq 1+3+5 | re 1+3+5e re 1+3+5 rq 1+3+5 | 1+3+5w",{lh:"1e. 1s re 1 5,q 5, | 1e. 1s re 1 5,q 5, | 1w"}],
["p_rgska","reggae","1 4 5 1","re 3+5- re 3+5- re 3+5- re 3+5- | re 3+5- re 3+5- re 3+5- re 3+5- | re 3+5- re 3+5- re 3+5- re 3+5- | 1+3+5w",{lh:"1q 5, 1 5, | 1 5, 1 5, | 1 5, 1 5, | 1w"}],
["p_rgmel","reggae","1 4 1","5q 3e 1 rq 3e 5 | 5q 3e 1 rq 5e 3 | 1w",{comp:"h"}],
["p_rgdub","reggae","1m 4m 1m","re 1+3+5e- rq re 1+3+5- rq | re 1+3+5- rq re 1+3+5- rq | 1+3+5w",{lh:"1h. 5,q | 1h. 5,q | 1w"}],
["p_rgrock","reggae","1 b7 1","re 1+3+5e- re 1+3+5- re 1+3+5- re 1+3+5- | re 1+3+5- re 1+3+5- re 1+3+5- re 1+3+5- | 1+3+5w",{lh:"1e 1 rq 1e 5, rq | 1e 1 rq 1e 5, rq | 1w"}],
["p_rglick","reggae","1 4 1","8e 7 5 3 5q 3 | 1e 3 5 6 5q 3 | 1w",{comp:"s"}],
/* Afrobeat and highlife */
["p_afhigh","afro","1 4 5 1","5e 3 5 8 5 3 1 3 | 5 3 5 8 5 3 1 3 | 5 3 5 7 5 3 2 3 | 1w",{comp:"h"}],
["p_afvamp","afro","1m7 1m7 1","1+5s r r 1+5 r 3+7 r 1+5 r r 1+5 r 3+7 r 1+5 r | 1+5 r r 1+5 r 3+7 r 1+5 r r 1+5 r 3+7 r 1+5 r | 1+5w",{lh:"1e. 5,s re 7,e 1e. 5,s re 7,e | 1e. 5,s re 7,e 1e. 5,s re 7,e | 1w"}],
["p_afbell","afro","1 4 1","1+8e re 1+8 re 1+8 1+8 re 1+8 | re 1+8 re 1+8 1+8 re 1+8 re | 1+8w",{comp:"h"}],
["p_afrun","afro","1 1","1s 2 3 5 6 5 3 2 1 2 3 5 6 5 3 2 | 1w",{comp:"h"}],
["p_afcall","afro","1m7 4m7 1m7","5q 3e 1 rh | 5q 3e 5 rh | 1w",{lh:"1e. 5,s re 7,e 1e. 5,s re 7,e | 1e. 5,s re 7,e 1e. 5,s re 7,e | 1w"}],
["p_afdouble","afro","1 5 1","3+5e 3+5 2+4 3+5 re 3+5 2+4 3+5 | 3+5 3+5 2+4 3+5 re 3+5 2+4 3+5 | 1+3w",{comp:"h"}],
["p_afstep","afro","1m 1m 1","1e 3 1 3 5 3 1 3 | 1 3 1 3 5 3 4 3 | 1w",{lh:"1e. 5,s re 7,e 1e. 5,s re 7,e | 1e. 5,s re 7,e 1e. 5,s re 7,e | 1w"}],
/* country */
["p_cnslip","country","1 4 5 1","5e 3~ 5 6 5q 3 | 1e 3~ 5 6 5q 3 | 5e 3~ 5 6 5q 3 | 1w",{lh:"1q 5, 1 5, | 1 5, 1 5, | 1 5, 1 5, | 1w"}],
["p_cnsix","country","1 5 1","3+8q 5+3' 3+8 1+6 | 5+3' 3+1' 5+3' 1+5 | 3+8w",{lh:"1q 5, 1 5, | 1 5, 1 5, | 1w"}],
["p_cnhonky","country","1 4 1","1+3e 1+3 1+3 2+4 1+3 1+3 5+8 5+8 | 1+3 1+3 1+3 2+4 1+3 1+3 5+8 5+8 | 1+3w",{lh:"1q 5, 1 5, | 1 5, 1 5, | 1w"}],
["p_cnwalk","country","1 4 5 1","5q 6e 5 3q 5 | 5q 6e 5 3q 1 | 5q 4e 3 1q 2 | 1w",{lh:"1q 5, 1e 2 3q | 1 5, 1e 2 3q | 1 5, 1e 7, 6,q | 1w"}],
["p_cntrem","country","1 4 1","3+8hT 3+8hT | 3+8hT 3+8hT | 3+8w",{lh:"1q 5, 1 5, | 1 5, 1 5, | 1w"}],
["p_cnrun","country","1 5 1","1e 2 3 4 5 6 5 3 | 1 2 3 4 5 6 5 3 | 1w",{lh:"1q 5, 1 5, | 1 5, 1 5, | 1w"}],
["p_cnbell","country","1 4 1","5e. 5s 5e 6 5q 3~ | 5e. 5s 5e 6 5q 3 | 1w",{comp:"h"}],
/* pop */
["p_poarp","pop","1 5 6m 4 1","1e 5 8 5 3' 5 8 5 | 1 5 8 5 3' 5 8 5 | 1 5 8 5 3' 5 8 5 | 1 5 8 5 3' 5 8 5 | 1w",{lh:"1w | 1w | 1w | 1w | 1w"}],
["p_populse","pop","6m 4 1 5 1","1+3+5e 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5w",{lh:"1+8q 1+8 1+8 1+8 | 1+8 1+8 1+8 1+8 | 1+8 1+8 1+8 1+8 | 1+8 1+8 1+8 1+8 | 1+8w"}],
["p_pohook","pop","1 5 6m 4 1","5q 5e 6 5q 3 | 5q 5e 6 5q 3 | 5q 5e 6 5q 3 | 5q 5e 6 5q 3 | 1w",{comp:"h"}],
["p_poballad","pop","1 5 6m 4 1","3+5h 3+5 | 3+5 3+5 | 3+5 3+5 | 3+5 3+5 | 1+3+5wR",{lh:"1e 5 8 5 3' 5 8 5 | 1 5 8 5 3' 5 8 5 | 1 5 8 5 3' 5 8 5 | 1 5 8 5 3' 5 8 5 | 1w"}],
["p_posync","pop","1 4 1","1+3+5e. 1+3+5s re 1+3+5 re 1+3+5 1+3+5q | 1+3+5e. 1+3+5s re 1+3+5 re 1+3+5 1+3+5q | 1+3+5w",{lh:"1q. 1e rq 1 | 1q. 1e rq 1 | 1w"}],
["p_postep","pop","1 4 1","3q 2e 3 5q 3 | 3q 2e 3 5q 1 | 1w",{comp:"h"}],
["p_pobright","pop","1 4 1","8e 5 3 5 8 5 3 5 | 8 5 3 5 8 5 3 5 | 1w",{lh:"1h 5,h | 1h 5,h | 1w"}],
/* house piano */
["p_hostab","house","1m7 4m7 1m7 4m7 1","re 3+5+7e re 3+5+7 re 3+5+7 re 3+5+7 | re 3+5+7 re 3+5+7 re 3+5+7 re 3+5+7 | re 3+5+7 re 3+5+7 re 3+5+7 re 3+5+7 | re 3+5+7 re 3+5+7 re 3+5+7 re 3+5+7 | 1+3+5w",{lh:"1e 1' 1 1' 1 1' 1 1' | 1 1' 1 1' 1 1' 1 1' | 1 1' 1 1' 1 1' 1 1' | 1 1' 1 1' 1 1' 1 1' | 1w"}],
["p_hoorgan","house","1 1 1","1+3+5e. 1+3+5s re 1+3+5e. 1+3+5s re 1+3+5 re | 1+3+5e. 1+3+5s re 1+3+5e. 1+3+5s re 1+3+5 re | 1+3+5w",{lh:"1q 1 1 1 | 1 1 1 1 | 1w"}],
["p_hoclassic","house","6m 4 1 5 1","1+3+5q. 1+3+5e rq 1+3+5 | 1+3+5q. 1+3+5e rq 1+3+5 | 1+3+5q. 1+3+5e rq 1+3+5 | 1+3+5q. 1+3+5e rq 1+3+5 | 1+3+5w",{lh:"1q 1 1 1 | 1 1 1 1 | 1 1 1 1 | 1 1 1 1 | 1w"}],
["p_hosync","house","1m7 1m7 1","3+5+7e. 3+5+7s re 3+5+7 re 3+5+7 3+5+7q | re 3+5+7e re 3+5+7 3+5+7e. 3+5+7s re 3+5+7 | 1+3+5w",{lh:"1q 1 1 1 | 1 1 1 1 | 1w"}],
["p_hoarp","house","1m7 4m7 1","1e 3 5 7 8 7 5 3 | 1 3 5 7 8 7 5 3 | 1w",{lh:"1q 1 1 1 | 1 1 1 1 | 1w"}],
["p_holift","house","4 5 6m 1","1+3+5e 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5w",{lh:"1q 1 1 1 | 1 1 1 1 | 1 1 1 1 | 1w"}],
["p_hooct","house","1m7 4m7 1","re 1+8e re 1+8 re 3+3' re 5+5' | re 1+8 re 1+8 re 3+3' re 5+5' | 1+8w",{lh:"1q 1 1 1 | 1 1 1 1 | 1w"}],
/* disco */
["p_dsoct","disco","1 4 1","re 1+3+5e re 1+3+5 re 1+3+5 re 1+3+5 | re 1+3+5 re 1+3+5 re 1+3+5 re 1+3+5 | 1+3+5w",{lh:"1e 1' 1 1' 1 1' 1 1' | 1 1' 1 1' 1 1' 1 1' | 1w"}],
["p_dsrun","disco","1 4 1","1s 2 3 5 6 5 3 2 1 2 3 5 6 5 3 2 | 1 2 3 5 6 5 3 2 1 2 3 5 6 5 3 2 | 1w",{lh:"1e 1' 1 1' 1 1' 1 1' | 1 1' 1 1' 1 1' 1 1' | 1w"}],
["p_dsstrings","disco","1M7 4M7 1","3+5+7h 3+5+7 | 3+5+7 3+5+7 | 1+3+5w",{lh:"1e 1' 1 1' 1 1' 1 1' | 1 1' 1 1' 1 1' 1 1' | 1w", cm:"1m7 4m7 1"}],
["p_dssync","disco","1 6m 1","1+3+5e. 1+3+5s re 1+3+5 re 1+3+5 re 1+3+5 | 1+3+5e. 1+3+5s re 1+3+5 re 1+3+5 re 1+3+5 | 1+3+5w",{lh:"1e 1' 1 1' 1 1' 1 1' | 1 1' 1 1' 1 1' 1 1' | 1w"}],
["p_dsfall","disco","1 4 1","8+8'e 7+7' 5+5' 3+3' 1+1'q 5+5' | 8+8'e 7+7' 5+5' 3+3' 1+1'q 3+3' | 1+1'w",{lh:"1e 1' 1 1' 1 1' 1 1' | 1 1' 1 1' 1 1' 1 1' | 1w"}],
["p_dshook","disco","1m7 4m7 1","5q 5e 7 8q 7 | 5q 5e 7 5q 3 | 1w",{lh:"1e 1' 1 1' 1 1' 1 1' | 1 1' 1 1' 1 1' 1 1' | 1w"}],
["p_dsglide","disco","1 1","rh 1+3+5hG | 1+3+5w",{lh:"1e 1' 1 1' 1 1' 1 1' | 1w"}],
/* slow and singing */
["p_slhymn","slow","1 4 5 1","3+5h 1+3 | 3+5h 1+5 | 3+5h 1+3 | 1+3+5wR",{lh:"1h 5,h | 1h 1h | 1h 5,h | 1w"}],
["p_slsing","slow","1 6m 4 5 1","5h. 3q | 3h. 1q | 5h 3q 5 | 5h 3q 2 | 1wP",{lh:"1e 5 8 5 3' 5 8 5 | 1 5 8 5 3' 5 8 5 | 1 5 8 5 3' 5 8 5 | 1 5 8 5 3' 5 8 5 | 1w"}],
["p_sllull","slow","1 4 1","5q 3 1 3 | 5 3 1 3 | 1wP",{lh:"1h 5,h | 1h 5,h | 1w"}],
["p_slroll","slow","1M7 4M7 1","1+3+5+7wRP | 1+3+5+7wRP | 1+3+5wRP",{cm:"1m7 4m7 1", lh:"1w | 1w | 1w"}],
["p_slrain","slow","1 5 6m 4 1","8q 7 5 3 | 5 4 3 7, | 1 7, 5, 3 | 1 6, 5, 6, | 1wP",{comp:""}],
["p_slsigh","slow","1 4 1","3h 1q 2 | 1h 5,q 6, | 1wP",{lh:"1e 5 8 5 3' 5 8 5 | 1 5 8 5 3' 5 8 5 | 1w"}],
["p_slfloat","slow","1M9 4M9 1","9h 8q 7 | 5h 3q 5 | 1wP",{lh:"1e 5 9 5 3' 5 9 5 | 1 5 9 5 3' 5 9 5 | 1w", cm:"1m9 4m9 1"}],
/* classical-style runs */
["p_clalberti","classical","1 5d7 1","5q 3 5 8 | 7 5 3 2 | 1w",{lh:"1e 5 3 5 1 5 3 5 | 1 5 3 5 1 5 3 5 | 1w"}],
["p_clscale","classical","1 5 1","1s 2 3 4 5 4 3 2 1 2 3 4 5 6 7 8 | 3 4 5 6 5 4 3 2 1 2 3 4 3 2 7, 5, | 1w",{lh:"1e 5 3 5 1 5 3 5 | 1 5 3 5 1 5 3 5 | 1w"}],
["p_clarp","classical","1 4 5 1","1s 3 5 8 3' 8 5 3 1 3 5 8 3' 8 5 3 | 1 3 5 8 3' 8 5 3 1 3 5 8 3' 8 5 3 | 1 3 5 8 3' 8 5 3 1 3 5 8 3' 8 5 3 | 1w",{lh:"1h 5,h | 1h 5,h | 1h 5,h | 1w"}],
["p_cltrill","classical","1 5 1","5q. 3e 5h | 3+4hT 5h | 1w",{lh:"1h 5,h | 1h 5,h | 1w"}],
["p_clbroken","classical","1 4 5d7 1","1e 3 5 3 8 5 3 5 | 1 3 5 3 8 5 3 5 | 1 3 5 3 7 5 3 5 | 1w",{lh:"1h 5,h | 1h 5,h | 1h 5,h | 1w"}],
["p_clcadence","classical","1 4 5d7 1","1+3+5qR 1+3+5 1+3+5h | 1+3+5qR 1+3+5 1+3+5h | 1+3+5+7qR 1+3+5+7 1+3+5h | 1+3+5wR",{lh:"1h 1h | 1h 1h | 1h 1h | 1w", cm:"1 4 5d7 1"}],
["p_clsweep","classical","1 1","1t 3 5 8 3' 5' 8' 5' 3' 8 5 3 | 1w",{lh:"1w | 1w"}],
/* piano tricks */
["px_glide","tricks","1 1","rh 8hG | 1+3+5wR",{lh:"1w | 1w"}],
["px_trem","tricks","1 4 1","1+8wT | 1+8wT | 1+8wT"],
["px_roll","tricks","1 4 5 1","1+3+5+8qR 1+3+5+8R 1+3+5+8hR | 1+3+5+8qR 1+3+5+8R 1+3+5+8hR | 1+3+5+8qR 1+3+5+8R 1+3+5+8hR | 1+3+5+8wR",{lh:"1w | 1w | 1w | 1w"}],
["px_octrun","tricks","1 5 1","1+8s 2+9 3+3' 5+5' 6+6' 5+5' 3+3' 2+9 1+8 2+9 3+3' 5+5' 6+6' 5+5' 3+3' 2+9 | 1+8 2+9 3+3' 5+5' 6+6' 5+5' 3+3' 2+9 1+8 2+9 3+3' 5+5' 6+6' 5+5' 3+3' 2+9 | 1+8w"],
["px_crush","tricks","1d7 4d7 1","rq 3e~ 3~ 3q~ 3~ | rq 3e~ 3~ 3q~ 1 | 1w",{cm:"1m7 4m7 1"}],
["px_hands","tricks","1 1","1e 5 8 5 1 5 8 5 | 1w",{lh:"5,e 1 5, 1 5, 1 5, 1 | 1w"}],
["px_sixths","tricks","1 4 1","3+8e 2+7 3+8 6+4' 5+3' 6+4' 3+8 2+7 | 3+8 2+7 3+8 6+4' 5+3' 6+4' 3+8 2+7 | 1+8w"],
/* fills and turnarounds */
["p_fiup","fills","1 4","1e 2 3 4 5 6 7 8 | 1w",{comp:"h"}],
["p_fidown","fills","1 5d7 1","8e 7 5 6 5 4 3 2 | 7, 5, 4, 2, 7, 5, 4, 2, | 1w",{comp:"h"}],
["p_fiblues","fills","1d7*2 4d7*2 1d7*2 5d7*2 1","1e 3 5 6 | b7 6 5 3 | 1 b3! 3 5 | 5 b7 < 1 | 1w",{cm:"1m7*2 4m7*2 1m7*2 5d7*2 1"}],
["p_fichrom","fills","1 5d7 1","1q 1q 3e 4 #4! 5 | 5 4 3 2 1 7, <q | 1w"],
["p_fitrip","fills","1 1","1q 1q 1t 2 3 5 6 7 | 8w"],
["p_fioct","fills","1 5d7 1","1+8q 1+8 3+3'e 2+2' 1+8 7,+7 | 5+5'q 5+5' 7+7'e 6+6' 5+5' 4+4' | 1+8w"],
["p_fiend","fills","1 4 1","1+3+5q 1+3+5 1+3+5 1+3+5 | 1+3+5 1+3+5 1+3+5 1+3+5 | 1+3+5+8wR",{lh:"1q 5, 1 5, | 1 5, 1 5, | 1w"}]
];
/* the menu's groups, in the order the Guitar's and the Bass's menus use where they share one (aog-solo.js,
   LICK_GROUP_ORDER); the piano's own (boogie-woogie, stride, New Orleans, house, classical, piano tricks) sit by their kin */
const ORDER_G=["blues","boogie","rock","funk","motown","disco","hiphop","neosoul","gospel","jazz","stride","nola","latin","reggae","afro","country","pop","house","slow","classical","tricks","fills"];
const GROUPS=ORDER_G.map(g=>[g, RAW.filter(r=>r[1]===g).map(r=>r[0])]).filter(g=>g[1].length);
const ORDER=[].concat(...GROUPS.map(g=>g[1]));
const LICKS={}; RAW.forEach(([id, g, ch, n, x])=>{ LICKS[id]=Object.assign({id, g, ch, n}, x||{}); });

/* ══ the words: the groups, each lick's name and its one line, English and Spanish ══════════════════════════════════ */
const W={
  lgp_blues:["Blues","Blues"], lgp_boogie:["Boogie-woogie","Boogie-woogie"], lgp_rock:["Rock and roll","Rock and roll"], lgp_funk:["Funk","Funk"],
  lgp_motown:["Motown and soul","Motown y soul"], lgp_disco:["Disco","Disco"], lgp_hiphop:["Hip-hop and R&B","Hip-hop y R&B"], lgp_neosoul:["Neo-soul","Neo-soul"],
  lgp_gospel:["Gospel","Gospel"], lgp_jazz:["Jazz","Jazz"], lgp_stride:["Stride and ragtime","Stride y ragtime"], lgp_nola:["New Orleans","Nueva Orleans"],
  lgp_latin:["Latin and salsa","Latino y salsa"], lgp_reggae:["Reggae and ska","Reggae y ska"], lgp_afro:["Afrobeat and highlife","Afrobeat y highlife"], lgp_country:["Country","Country"],
  lgp_pop:["Pop","Pop"], lgp_house:["House piano","Piano house"], lgp_slow:["Slow and singing","Lentas y cantadas"], lgp_classical:["Classical-style runs","Escalas al estilo clásico"],
  lgp_tricks:["Piano tricks","Trucos de piano"], lgp_fills:["Fills and turnarounds","Rellenos y vueltas"],
  p_blcrush:["Crushed blue note","Nota blue aplastada","Tap the key just below the third, then the third. That rub is the blues.","Toca la tecla justo debajo de la tercera y luego la tercera. Ese roce es el blues."],
  p_blturn:["Blues turnaround","Vuelta de blues","The top note stays while a line under it creeps down. Then the five chord leads home.","La nota de arriba se queda mientras una línea baja por debajo. Luego el acorde cinco lleva a casa."],
  p_blshuf:["Shuffle in the right hand","Shuffle en la mano derecha","Two keys at once, rocking between the fifth and the sixth with a swing.","Dos teclas a la vez, meciéndose entre la quinta y la sexta con swing."],
  p_bltrem:["Blues tremolo","Trémolo de blues","Shake two keys back and forth very fast, like a ringing bell.","Mueve dos teclas de un lado a otro muy rápido, como una campana que suena."],
  p_blnote:["Slow blue line","Línea blue lenta","A rest, then a crushed third and a fall to the flat seven.","Un silencio, luego una tercera aplastada y una caída a la séptima bemol."],
  p_bloct:["Blues in octaves","Blues en octavas","The same melody with the thumb and the little finger, an octave apart.","La misma melodía con el pulgar y el meñique, a una octava."],
  p_blslow:["Slow blues triplets","Tresillos de blues lento","Three notes a beat, rolling up and down the chord.","Tres notas por tiempo, subiendo y bajando por el acorde."],
  p_bwwalk:["Walking boogie","Boogie que camina","The left hand walks up and down the chord; the right hand answers between.","La mano izquierda sube y baja por el acorde; la derecha responde entre medio."],
  p_bwoct:["Octave boogie","Boogie en octavas","The left hand jumps in octaves while the right hand shakes a tremolo.","La mano izquierda salta en octavas mientras la derecha hace un trémolo."],
  p_bwroll:["Rolling boogie","Boogie que rueda","Triplets in the right hand over a rolling fifth and sixth in the left.","Tresillos en la mano derecha sobre una quinta y sexta que ruedan en la izquierda."],
  p_bwcross:["Boogie riff","Riff de boogie","Two keys at once, sliding down through the blue note to home.","Dos teclas a la vez, bajando por la nota blue hasta casa."],
  p_bwdown:["Walk down the chord","Bajada por el acorde","Eighth notes down from the top while the left hand rocks.","Corcheas que bajan desde arriba mientras la mano izquierda se mece."],
  p_bwintro:["Boogie intro","Entrada de boogie","Start on the five chord, run down through the blue note, land on home.","Empieza en el acorde cinco, baja por la nota blue y llega a casa."],
  p_bwend:["Boogie ending","Final de boogie","A last climb in two keys at once, then a big home chord.","Una última subida con dos teclas a la vez y luego un gran acorde de casa."],
  p_rkpound:["Pounding chords","Acordes que golpean","The whole chord on every eighth note, the left hand on the root.","El acorde entero en cada corchea, la mano izquierda en la raíz."],
  p_rkglide:["Glide and slam","Glissando y golpe","Run up the keys fast into a high note, then strong chords.","Sube rápido por las teclas hasta una nota alta y luego acordes fuertes."],
  p_rktrip:["Triplet chords","Acordes en tresillos","Three chords a beat, fast and even, over a steady bass.","Tres acordes por tiempo, rápidos y parejos, sobre un bajo firme."],
  p_rkriff:["Rock riff","Riff de rock","Root and fifth, with the sixth poking in, on three chords.","Raíz y quinta, con la sexta asomando, en tres acordes."],
  p_rkoct:["Octave rock line","Línea de rock en octavas","A line in octaves, down and up the chord.","Una línea en octavas que baja y sube por el acorde."],
  p_rkballad:["Rock ballad pulse","Pulso de balada rock","Two keys on every beat while the left hand plays root and fifth.","Dos teclas en cada tiempo mientras la izquierda toca raíz y quinta."],
  p_rkstop:["Stop time","Cortes","Short hits with space after them, then a glide into the last chord.","Golpes cortos con espacio después y un glissando hacia el último acorde."],
  p_gsamen:["Amen ending","Final de amén","The four chord to home, rolled from the bottom up, left ringing.","Del acorde cuatro a casa, arpegiado de abajo arriba y dejado sonar."],
  p_gsrun:["Gospel run","Escala gospel","Down from the top with a crushed third, into a rolled chord.","Baja desde arriba con una tercera aplastada hasta un acorde arpegiado."],
  p_gssix:["Sliding sixths","Sextas que se deslizan","Two keys a sixth apart slide in from a half step below.","Dos teclas a una sexta entran desde medio tono abajo."],
  p_gsfour:["Four to three","Del cuatro al tres","Hold the fourth, then let it fall to the third. Calm and sure.","Mantén la cuarta y déjala caer a la tercera. Tranquilo y seguro."],
  p_gsshout:["Shout chords","Acordes de júbilo","Two keys at once climbing through the blue note, over a bouncing bass.","Dos teclas a la vez que suben por la nota blue, sobre un bajo que rebota."],
  p_gswalkup:["Walk up to the four","Subida al cuatro","The left hand climbs while the right hand adds the flat seven.","La mano izquierda sube mientras la derecha añade la séptima bemol."],
  p_gscry:["Singing line","Línea que canta","A melody to sing along with, over four chords, ending held.","Una melodía para cantar, sobre cuatro acordes, que termina sostenida."],
  p_jzbebop:["Bebop line","Línea de bebop","Eighth notes up the chord, with passing notes between.","Corcheas que suben por el acorde, con notas de paso entre medio."],
  p_jzencl:["Circle the target","Rodear la nota","Step above, step below, then land on the chord's note.","Un paso arriba, un paso abajo y luego llega a la nota del acorde."],
  p_jzshell:["Shell chords and a line","Acordes de concha y una línea","The left hand holds the root and seventh; the right hand plays a line.","La izquierda mantiene la raíz y la séptima; la derecha toca una línea."],
  p_jzblock:["Block chords","Acordes en bloque","Four notes moving together, one chord a beat.","Cuatro notas que se mueven juntas, un acorde por tiempo."],
  p_jzwalk:["Walking two hands","Dos manos que caminan","A walking bass in the left hand and a line on top.","Un bajo que camina en la izquierda y una línea arriba."],
  p_jzturn:["Jazz turnaround","Vuelta de jazz","Up each chord, a half step into the next.","Sube por cada acorde y medio tono hacia el siguiente."],
  p_jzoct:["Jazz octaves","Octavas de jazz","A smooth melody in octaves, over two, five, one.","Una melodía suave en octavas, sobre dos, cinco, uno."],
  p_ststride:["Stride left hand","Mano izquierda stride","Low note, chord, low note, chord. The right hand rides on top.","Nota grave, acorde, nota grave, acorde. La derecha va arriba."],
  p_strag:["Ragtime melody","Melodía ragtime","A bright tune over the stride bass, with a little swing.","Una melodía alegre sobre el bajo stride, con un poco de swing."],
  p_stbreak:["Dotted break","Corte con puntillo","Long-short pairs down the chord, over the stride bass.","Pares largo-corto que bajan por el acorde, sobre el bajo stride."],
  p_stoct:["Stride octaves","Octavas stride","Octaves up the chord and back, over the stride bass.","Octavas que suben por el acorde y vuelven, sobre el bajo stride."],
  p_stwalk:["Stride through four chords","Stride por cuatro acordes","The same little figure on each chord, a half step into the last.","La misma figura en cada acorde, medio tono hacia el último."],
  p_stsyn:["Stride pickups","Entradas stride","Two quick notes, then a rest. Leave space for the bass.","Dos notas rápidas y un silencio. Deja espacio al bajo."],
  p_stcake:["Cakewalk","Cakewalk","Up and down the chord in eighths, over the stride bass.","Sube y baja por el acorde en corcheas, sobre el bajo stride."],
  p_nofats:["Rolling triplet chords","Acordes en tresillos que ruedan","Chords in triplets all the way through, like a New Orleans ballad.","Acordes en tresillos todo el tiempo, como una balada de Nueva Orleans."],
  p_norumba:["Rumba boogie","Rumba boogie","A rumba bass in the left hand, short chords in the right.","Un bajo de rumba en la izquierda y acordes cortos en la derecha."],
  p_noroll:["Roll up the chord","Subida por el acorde","Triplets up to the octave and back down, then rest on home.","Tresillos hasta la octava y de vuelta, y luego descansa en casa."],
  p_notrem:["Parade tremolo","Trémolo de desfile","Shake the fifth, then the sixth, over a rumba bass.","Haz trémolo con la quinta y luego con la sexta, sobre un bajo de rumba."],
  p_nocall:["Call and rest","Llamada y silencio","A short call with a crushed third, then a beat of rest.","Una llamada corta con una tercera aplastada y un tiempo de silencio."],
  p_nosecond:["Second line","Second line","Dotted chords that bounce, over a marching bass.","Acordes con puntillo que rebotan, sobre un bajo de marcha."],
  p_nostep:["Up and back","Sube y vuelve","Up the chord to the sixth and back, the same on each chord.","Sube por el acorde hasta la sexta y vuelve, igual en cada acorde."],
  p_fkclav:["Clav groove","Groove de clavinet","Short sixteenths, two keys at once, with space between.","Semicorcheas cortas, dos teclas a la vez, con espacio entre medio."],
  p_fkstab:["Funk stabs","Golpes de funk","Short three-note chords off the beat, over a bouncing bass.","Acordes cortos de tres notas fuera del tiempo, sobre un bajo que rebota."],
  p_fkline:["Funk line","Línea de funk","Fast notes up through the blue note and back.","Notas rápidas que suben por la nota blue y vuelven."],
  p_fkghost:["Short and quiet","Cortas y suaves","Very short notes. Lift your fingers fast.","Notas muy cortas. Levanta los dedos rápido."],
  p_fkoct:["Funk octaves","Octavas de funk","Octaves on the sixteenths, with gaps that make it groove.","Octavas en semicorcheas, con huecos que dan el groove."],
  p_fkvamp:["Ninth-chord vamp","Vamp con novena","Four-note chords with the ninth, short and off the beat.","Acordes de cuatro notas con novena, cortos y fuera del tiempo."],
  p_fkrun:["Funk run","Carrera de funk","Down from the top and back up, sixteenths, in one bar.","Baja desde arriba y vuelve a subir, en semicorcheas, en un compás."],
  p_mohook:["Octave hook","Gancho en octavas","A catchy line in octaves, long-short.","Una línea pegadiza en octavas, largo-corto."],
  p_mostep:["Soul pulse","Pulso soul","Two keys on every eighth through four chords.","Dos teclas en cada corchea por cuatro acordes."],
  p_mogos:["Gospel soul fill","Relleno gospel soul","Down from the octave, then a rolled chord.","Baja desde la octava y luego un acorde arpegiado."],
  p_mopulse:["Short chord pulse","Pulso de acordes cortos","Short chords on every eighth, through four chords.","Acordes cortos en cada corchea, por cuatro acordes."],
  p_mosweet:["Sweet melody","Melodía dulce","A simple tune, one note to a step, over four chords.","Una melodía sencilla, nota a nota, sobre cuatro acordes."],
  p_mostax:["Memphis piano","Piano de Memphis","Two keys at once with space, through the blue note.","Dos teclas a la vez con espacio, pasando por la nota blue."],
  p_moturn:["Soul turnaround","Vuelta soul","Third, root, low fifth on each chord, a half step home.","Tercera, raíz y quinta grave en cada acorde, medio tono a casa."],
  p_nsnine:["Ninth chords, rolled","Novenas arpegiadas","Big soft chords with the ninth, rolled from the bottom up.","Acordes grandes y suaves con novena, arpegiados de abajo arriba."],
  p_nsdrift:["Lazy line","Línea perezosa","Up to the ninth and back, laid back, over two, five, one.","Sube a la novena y vuelve, relajada, sobre dos, cinco, uno."],
  p_nsgrace:["Ninth with a crush","Novena con roce","Down from the ninth, then a crushed third.","Baja desde la novena y luego una tercera aplastada."],
  p_nslazy:["Behind the beat","Detrás del tiempo","Wait a beat, then climb the chord slowly.","Espera un tiempo y luego sube por el acorde despacio."],
  p_nschrom:["Slide into the chord","Deslizar al acorde","Two keys slide in from a half step below.","Dos teclas entran desde medio tono abajo."],
  p_nsghost:["Soft and swung","Suave y con swing","A gentle line over shell chords in the left hand.","Una línea suave sobre acordes de concha en la izquierda."],
  p_nsrise:["Walking chords down","Acordes que bajan","Thirds and sevenths on four chords stepping down.","Terceras y séptimas en cuatro acordes que bajan."],
  p_hhlofi:["Lo-fi chords","Acordes lo-fi","Soft seventh chords, rolled, one to a bar.","Acordes de séptima suaves, arpegiados, uno por compás."],
  p_hhbell:["Bell melody","Melodía de campana","A short tune with space after it.","Una melodía corta con espacio después."],
  p_hhrnb:["R&B climb","Subida R&B","Up the chord to the ninth and back down.","Sube por el acorde hasta la novena y vuelve."],
  p_hhloop:["Loop line","Línea en bucle","The same four notes over and over. Good for a beat.","Las mismas cuatro notas una y otra vez. Buena para un ritmo."],
  p_hhsoul:["Soul sample chords","Acordes de sample soul","A held chord, a short one, then space.","Un acorde largo, uno corto y luego espacio."],
  p_hhfall:["Falling line","Línea que cae","Down the chord from the top, laid back.","Baja por el acorde desde arriba, relajada."],
  p_hhsus:["Sus to major","Del sus al mayor","Hold the fourth, then let it fall to the third.","Mantén la cuarta y déjala caer a la tercera."],
  p_ltmont:["Salsa montuno","Montuno de salsa","Octaves that bounce off the beat, over a tumbao bass.","Octavas que rebotan fuera del tiempo, sobre un bajo de tumbao."],
  p_ltguaj:["Two-key montuno","Montuno de dos teclas","Two keys at once, in and out of the beat.","Dos teclas a la vez, dentro y fuera del tiempo."],
  p_ltbossa:["Bossa nova chords","Acordes de bossa nova","Soft seventh chords, long-short, over root and fifth.","Acordes de séptima suaves, largo-corto, sobre raíz y quinta."],
  p_ltcha:["Cha-cha line","Línea de chachachá","Two and two, then one: cha-cha-cha.","Dos y dos y luego una: cha-cha-chá."],
  p_ltoct:["Latin octaves","Octavas latinas","Octaves with rests between, over a tumbao bass.","Octavas con silencios entre ellas, sobre un bajo de tumbao."],
  p_lttango:["Tango chords","Acordes de tango","Strong minor chords, long-short, with a firm bass.","Acordes menores fuertes, largo-corto, con un bajo firme."],
  p_ltrun:["Latin run","Carrera latina","Up the scale and back on each chord.","Sube por la escala y vuelve en cada acorde."],
  p_rgskank:["Reggae skank","Skank de reggae","Short chords on the off-beats only. The rest is space.","Acordes cortos solo en los contratiempos. Lo demás es espacio."],
  p_rgbubble:["Bubble","Bubble","Chords on the ands, with a bouncing bass.","Acordes en los contratiempos, con un bajo que rebota."],
  p_rgska:["Ska up-strokes","Golpes de ska","Two short keys on every off-beat, quick and light.","Dos teclas cortas en cada contratiempo, rápidas y ligeras."],
  p_rgmel:["Reggae melody","Melodía reggae","A short tune with a rest in the middle.","Una melodía corta con un silencio en medio."],
  p_rgdub:["Dub chords","Acordes dub","One short minor chord, then lots of space.","Un acorde menor corto y luego mucho espacio."],
  p_rgrock:["Rock steady","Rock steady","Off-beat chords over a stop-start bass.","Acordes en contratiempo sobre un bajo que para y sigue."],
  p_rglick:["Reggae fill","Relleno reggae","Down from the octave and back up, then rest.","Baja desde la octava y vuelve a subir, luego descansa."],
  p_afhigh:["Highlife line","Línea highlife","A bright line up and down the chord, bar after bar.","Una línea alegre que sube y baja por el acorde, compás a compás."],
  p_afvamp:["Afrobeat vamp","Vamp de afrobeat","Short two-key hits on the sixteenths, over a busy bass.","Golpes cortos de dos teclas en semicorcheas, sobre un bajo movido."],
  p_afbell:["Bell pattern","Patrón de campana","Octaves that follow a bell rhythm.","Octavas que siguen un ritmo de campana."],
  p_afrun:["Pentatonic run","Escala pentatónica","Sixteenths up and down the five-note scale.","Semicorcheas que suben y bajan por la escala de cinco notas."],
  p_afcall:["Call and answer","Pregunta y respuesta","A short call, a rest, a short answer.","Una llamada corta, un silencio y una respuesta corta."],
  p_afdouble:["Highlife thirds","Terceras highlife","Two keys at once, rocking, with a rest in the middle.","Dos teclas a la vez, meciéndose, con un silencio en medio."],
  p_afstep:["Minor groove","Groove menor","A busy line on one minor chord.","Una línea movida sobre un acorde menor."],
  p_cnslip:["Slip note","Nota que resbala","Tap the key under the third and slide onto it.","Toca la tecla debajo de la tercera y resbala hasta ella."],
  p_cnsix:["Country sixths","Sextas country","Two keys a sixth apart, moving together.","Dos teclas a una sexta, moviéndose juntas."],
  p_cnhonky:["Honky-tonk","Honky-tonk","Two keys rocking, then a jump to the fifth.","Dos teclas que se mecen y luego un salto a la quinta."],
  p_cnwalk:["Country walk","Paseo country","A simple tune while the left hand walks between chords.","Una melodía sencilla mientras la izquierda camina entre acordes."],
  p_cntrem:["Country tremolo","Trémolo country","Shake the third and the octave, like a steel guitar.","Haz trémolo con la tercera y la octava, como una guitarra steel."],
  p_cnrun:["Country run","Carrera country","Up the scale to the sixth and back.","Sube por la escala hasta la sexta y vuelve."],
  p_cnbell:["Bright melody","Melodía brillante","A cheerful tune with one slip note.","Una melodía alegre con una nota que resbala."],
  p_poarp:["Pop arpeggio","Arpegio pop","Up and down each chord in eighths, four chords.","Sube y baja por cada acorde en corcheas, cuatro acordes."],
  p_populse:["Eighth-note chords","Acordes en corcheas","The whole chord on every eighth, with octaves in the left hand.","El acorde entero en cada corchea, con octavas en la izquierda."],
  p_pohook:["Pop hook","Gancho pop","A short tune that repeats on four chords.","Una melodía corta que se repite en cuatro acordes."],
  p_poballad:["Piano ballad","Balada de piano","Long chords on top, flowing notes in the left hand.","Acordes largos arriba y notas que fluyen en la izquierda."],
  p_posync:["Pop push","Empuje pop","Chords that land just before the beat.","Acordes que caen justo antes del tiempo."],
  p_postep:["Step melody","Melodía por pasos","A small tune that moves by step.","Una melodía pequeña que se mueve por pasos."],
  p_pobright:["Bright eighths","Corcheas brillantes","Octave, fifth, third, fifth, over and over.","Octava, quinta, tercera, quinta, una y otra vez."],
  p_hostab:["House stabs","Golpes house","Seventh chords on the off-beats, over octave bass.","Acordes de séptima en los contratiempos, sobre un bajo en octavas."],
  p_hoorgan:["House organ chords","Acordes de órgano house","Long-short chords that skip, over a steady bass.","Acordes largo-corto que saltan, sobre un bajo firme."],
  p_hoclassic:["Classic house piano","Piano house clásico","A chord, a quick one, a rest, a chord. Four chords.","Un acorde, uno rápido, un silencio, un acorde. Cuatro acordes."],
  p_hosync:["Syncopated stabs","Golpes sincopados","Chords that land between the beats.","Acordes que caen entre los tiempos."],
  p_hoarp:["House arpeggio","Arpegio house","Up and down a seventh chord in eighths.","Sube y baja por un acorde de séptima en corcheas."],
  p_holift:["Lift chords","Acordes que suben","Eighth-note chords climbing to the top chord.","Acordes en corcheas que suben hasta el acorde de arriba."],
  p_hooct:["House octaves","Octavas house","Octaves on the off-beats.","Octavas en los contratiempos."],
  p_dsoct:["Disco octave bass","Bajo disco en octavas","The left hand jumps octaves; chords on the off-beats.","La izquierda salta octavas; acordes en los contratiempos."],
  p_dsrun:["Disco run","Carrera disco","Sixteenths up and down the five-note scale.","Semicorcheas que suben y bajan por la escala de cinco notas."],
  p_dsstrings:["String-like chords","Acordes como cuerdas","Long seventh chords over the octave bass.","Acordes de séptima largos sobre el bajo en octavas."],
  p_dssync:["Disco push","Empuje disco","Chords just before the beat, over the octave bass.","Acordes justo antes del tiempo, sobre el bajo en octavas."],
  p_dsfall:["Falling octaves","Octavas que caen","Octaves falling down the chord.","Octavas que bajan por el acorde."],
  p_dshook:["Disco hook","Gancho disco","A short tune up to the octave and back.","Una melodía corta hasta la octava y de vuelta."],
  p_dsglide:["Disco glide","Glissando disco","Run up the keys into a big chord.","Sube por las teclas hasta un gran acorde."],
  p_slhymn:["Hymn","Himno","Two keys on top, slow and steady, through four chords.","Dos teclas arriba, lento y firme, por cuatro acordes."],
  p_slsing:["Singing melody","Melodía cantada","Long notes to sing, over flowing notes in the left hand.","Notas largas para cantar, sobre notas que fluyen en la izquierda."],
  p_sllull:["Lullaby","Canción de cuna","A gentle tune, one note a beat. Play it quietly.","Una melodía suave, una nota por tiempo. Tócala bajito."],
  p_slroll:["Rolled seventh chords","Séptimas arpegiadas","Big chords, rolled slowly, left ringing.","Acordes grandes, arpegiados despacio y dejados sonar."],
  p_slrain:["Raindrops","Gotas de lluvia","One note a beat, stepping down through four chords.","Una nota por tiempo, bajando por cuatro acordes."],
  p_slsigh:["Sigh","Suspiro","A slow fall, then home.","Una caída lenta y luego a casa."],
  p_slfloat:["Floating ninth","Novena que flota","High and soft, over flowing ninths in the left hand.","Alto y suave, sobre novenas que fluyen en la izquierda."],
  p_clalberti:["Alberti bass","Bajo Alberti","The left hand plays low, high, middle, high. The right hand sings.","La izquierda toca grave, agudo, medio, agudo. La derecha canta."],
  p_clscale:["Scale run","Escala corrida","Sixteenths up the scale, over the Alberti bass.","Semicorcheas que suben por la escala, sobre el bajo Alberti."],
  p_clarp:["Arpeggio sweep","Barrido de arpegio","Up the chord across two octaves and back, sixteenths.","Sube por el acorde dos octavas y vuelve, en semicorcheas."],
  p_cltrill:["Trill","Trino","Two neighbor keys back and forth, fast.","Dos teclas vecinas de un lado a otro, rápido."],
  p_clbroken:["Broken chords","Acordes partidos","The chord one note at a time, up and back.","El acorde nota a nota, subiendo y volviendo."],
  p_clcadence:["Cadence","Cadencia","Four, five, home: rolled chords, the classic ending.","Cuatro, cinco, casa: acordes arpegiados, el final clásico."],
  p_clsweep:["Big sweep","Gran barrido","Triplets up three octaves of the chord and back.","Tresillos que suben tres octavas del acorde y vuelven."],
  px_glide:["Glissando","Glissando","Slide up the white keys, then a rolled chord.","Desliza hacia arriba por las teclas y luego un acorde arpegiado."],
  px_trem:["Octave tremolo","Trémolo de octava","Shake the octave fast, one chord a bar.","Haz trémolo con la octava rápido, un acorde por compás."],
  px_roll:["Rolled chords","Acordes arpegiados","Every chord rolled from the bottom up.","Cada acorde arpegiado de abajo arriba."],
  px_octrun:["Octave run","Carrera en octavas","Octaves up and down the scale, sixteenths.","Octavas que suben y bajan por la escala, en semicorcheas."],
  px_crush:["Crush notes","Notas aplastadas","Every third crushed from the key below.","Cada tercera aplastada desde la tecla de abajo."],
  px_hands:["Two hands, one line","Dos manos, una línea","The hands take turns: one low, one high.","Las manos se turnan: una grave, una aguda."],
  px_sixths:["Sixths in a row","Sextas seguidas","Two keys a sixth apart, up and down.","Dos teclas a una sexta, subiendo y bajando."],
  p_fiup:["Run up to the four","Subida al cuatro","Up the scale into the next chord.","Sube por la escala hacia el siguiente acorde."],
  p_fidown:["Run down","Bajada","Down the scale, then down the five chord, home.","Baja por la escala, luego por el acorde cinco y a casa."],
  p_fiblues:["Blues fill","Relleno de blues","Through four chords with the blue note, a half step home.","Por cuatro acordes con la nota blue y medio tono a casa."],
  p_fichrom:["Half-step climb","Subida por semitonos","Two beats of home, then a half-step climb.","Dos tiempos de casa y luego una subida por semitonos."],
  p_fitrip:["Triplet fill","Relleno en tresillos","Two beats, then a triplet run up to the octave.","Dos tiempos y luego tresillos hasta la octava."],
  p_fioct:["Octave fill","Relleno en octavas","Octaves down and up, into home.","Octavas que bajan y suben, hasta casa."],
  p_fiend:["Big ending","Gran final","Chords on every beat, then a rolled last chord.","Acordes en cada tiempo y luego un último acorde arpegiado."]
};
const WORDS={};
Object.keys(W).forEach(k=>{ const v=W[k];
  if(v.length===2) WORDS[k]={en:v[0], es:v[1]};
  else { WORDS["lk_"+k]={en:v[0], es:v[1]}; WORDS["ld_"+k]={en:v[2], es:v[3]}; } });
/* ══ chords ═══════════════════════════════════════════════════════════════════════════════════════════════════════ */
function parseChords(spec, minor){
  const SC=minor?MIN:MAJ, out=[]; let t=0;
  spec.trim().split(/\s+/).forEach(tok=>{
    const m=/^([bn#]?)([1-7])(m7b5|M7|M9|m7|m9|m6|d7|d9|s4|7|6|m|M|o)?(?:\*([\d.]+))?$/.exec(tok); if(!m) throw new Error("chord "+tok);
    const d=+m[2]-1, rt=m[1] ? (MAJ[d]+(m[1]==="b"?-1:m[1]==="#"?1:0)+12)%12 : SC[d], idx=SC.indexOf(rt);
    const dia=k=>(SC[(idx+k)%7]-SC[idx]+12)%12;
    const tri=idx<0 ? "maj" : dia(2)===4 ? "maj" : dia(4)===6 ? "dim" : "min";
    let q=tri;
    switch(m[3]){
      case "m": q="min"; break; case "M": q="maj"; break; case "m7": q="m7"; break; case "M7": q="maj7"; break;
      case "d7": q="dom7"; break; case "o": q="dim"; break; case "m7b5": q="m7b5"; break;
      case "M9": q="maj9"; break; case "m9": q="m9"; break; case "d9": q="dom9"; break; case "m6": q="m6"; break; case "s4": q="sus4"; break;
      case "6": q=tri==="min" ? "m6" : "maj6"; break;
      case "7": q=idx<0 ? "dom7" : tri==="maj" ? (dia(6)===11?"maj7":"dom7") : tri==="min" ? "m7" : "m7b5"; break;
    }
    const len=m[4]!=null ? +m[4] : 4;
    out.push({t0:t, t1:t+len, root:rt, q, idx, tones:QT[q]}); t+=len;
  });
  return out;
}
function chordAt(chs, t){ let c=chs[0]; for(const x of chs){ if(x.t0<=t+1e-6) c=x; } return c; }
function pcsOf(c){ return c.tones.map(x=>(c.root+x)%12); }
/* a step of the key's scale above the chord's root (k = 0 is the root); a root outside the key: Mixolydian or Dorian */
function step(c, k, minor){
  if(c.idx>=0){ const SC=minor?MIN:MAJ, i=c.idx+k; return SC[i%7]+12*Math.floor(i/7)-SC[c.idx]; }
  const T=c.tones[1]===3 ? DOR : MIX; return T[k%7]+12*Math.floor(k/7);
}
/* the chord's own tone for a number, when it has one (its sixth, its ninth, its sus fourth), else the key's scale */
const NEAR={2:[1,2], 4:[5,6], 6:[8,9], 9:[1,2]};
function degree(c, n, minor){
  if(n===1) return 0; if(n===8) return 12;
  if(n===3) return (c.tones[1]===3||c.tones[1]===4) ? c.tones[1] : step(c, 2, minor);
  if(n===5) return c.tones[2];
  if(n===7){ const s=c.tones.find(x=>x===10||x===11); return s!=null ? s : step(c, 6, minor); }
  const own=c.tones.map(x=>x%12).find(x=>NEAR[n].indexOf(x)>=0);
  if(own!=null) return n===9 ? own+12 : own;
  return n===9 ? step(c, 1, minor)+12 : step(c, n-1, minor);
}

/* ══ notes ════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const PIT="(?:r|<|>|\\[|\\]|[bn#]?[1-9])[,']*";
const TOK=new RegExp("^("+PIT+"(?:\\+"+PIT+")*)([whqestf]\\.?)?([~RTGPA!_\\-]*)$");
function parseNotes(spec){
  const out=[]; let t=0, dur=0.5;
  spec.trim().split(/\s+/).forEach(tok=>{
    if(tok==="|" || !tok) return;
    const m=TOK.exec(tok); if(!m) throw new Error("note "+tok);
    if(m[2]){ dur=DUR[m[2][0]]*(m[2].length>1?1.5:1); }
    const ps=m[1].split("+").map(x=>{ const q=/^(r|<|>|\[|\]|[bn#]?[1-9])([,']*)$/.exec(x); return {p:q[1], oct:(q[2].match(/'/g)||[]).length-(q[2].match(/,/g)||[]).length}; });
    const e={t:+t.toFixed(6), slot:dur, ps, mods:m[3]||""};
    if(ps[0].p!=="r") out.push(e);
    t+=dur;
  });
  return {list:out, beats:+t.toFixed(6)};
}
function scaleNext(rel, minor, dir){
  const SC=minor?MIN:MAJ; for(let i=1;i<=2;i++){ const r=rel+dir*i; if(SC.indexOf(((r%12)+12)%12)>=0) return r; } return rel+dir;
}
/* one hand's line in the key: each pitch above the key's home note (rel), its chord, how it is played */
function line(spec, chs, minor){
  const P=parseNotes(spec), L=P.list;
  L.forEach(e=>{
    const c=chordAt(chs, e.t); e.chord=c;
    e.ps.forEach(q=>{
      if(/^[<>\[\]]$/.test(q.p)){ q.appr=q.p; return; }
      const n=+q.p.slice(-1), acc=q.p.length>1?q.p[0]:"";
      const iv=acc ? MAJINT[n-1]+(acc==="b"?-1:acc==="#"?1:0) : degree(c, n, minor);
      q.rel=(c.base!=null?c.base:c.root)+iv+12*q.oct;
    });
  });
  /* the leaning notes, from the note after them (the same voice of a double note) */
  for(let i=L.length-1;i>=0;i--){ const e=L[i];
    e.ps.forEach((q,j)=>{ if(!q.appr) return;
      const nx=L[i+1]; if(!nx) throw new Error("approach at the end");
      const to=(nx.ps[j]||nx.ps[0]).rel; if(to==null) throw new Error("approach to an approach");
      q.rel=(q.appr==="<" ? to-1 : q.appr===">" ? to+1 : scaleNext(to, minor, q.appr==="[" ? -1 : 1))+12*q.oct; }); }
  return {L, beats:P.beats};
}
/* the notes one hand plays: double notes, octaves and chords at once; a crush, a glide, a roll and a tremolo are spelled out */
function expand(L, hand, chs, minor, sw){
  const SC=minor?MIN:MAJ, out=[];
  L.forEach((e,i)=>{
    const md=e.mods, rels=e.ps.map(q=>q.rel), top=Math.max(...rels), nx=L[i+1];
    const pedal=md.indexOf("P")>=0, frac=md.indexOf("-")>=0 ? 0.45 : (md.indexOf("_")>=0 || !nx) ? 1 : 0.92;
    const len=pedal ? Math.max(e.slot, e.chord.t1-e.t) : e.slot*frac;
    const pass=md.indexOf("!")>=0, acc=md.indexOf("A")>=0 ? 0.14 : 0;
    const base=(hand==="l"?0.6:0.7)+acc+(Math.abs(e.t-Math.round(e.t))<1e-6?0.04:0);
    const note=(rel, t, d, o)=>out.push(Object.assign({rel, t:+t.toFixed(6), d:+d.toFixed(6), h:hand, tb:e.t, ev:i, chord:chs.indexOf(e.chord)}, o||{}));
    if(md.indexOf("~")>=0) note(top-1, e.t-0.125, 0.125, {orn:"crush", v:0.42});
    if(md.indexOf("G")>=0){ const run=[]; for(let r=top-12; r<top; r++) if(SC.indexOf(((r%12)+12)%12)>=0) run.push(r);
      run.forEach((r,k)=>note(r, e.t-0.5+k*0.5/run.length, 0.5/run.length, {orn:"glide", v:0.4+0.25*k/run.length})); }
    if(md.indexOf("T")>=0 && rels.length>1){
      const lo=Math.min(...rels), n=Math.max(2, Math.round(e.slot/0.125));
      for(let k=0;k<n;k++){ const r=k%2 ? top : lo; note(r, e.t+k*0.125, 0.125*(k===n-1?frac:1), {v:base-0.08+(k===0?0.06:0), trem:1, pass, appr:e.ps[0].appr, orn:k?"trem":""}); }
      return;
    }
    const roll=md.indexOf("R")>=0, sorted=rels.slice().sort((a,b)=>a-b);
    e.ps.forEach((q,j)=>{
      const k=roll ? sorted.indexOf(q.rel) : 0, t=e.t+k*0.0833;
      note(q.rel, t, Math.max(0.05, len-(t-e.t)), {v:Math.min(0.95, base+(rels.length>1 && q.rel===top ? 0.05 : 0)-(rels.length>2?0.06:0)), pass, appr:q.appr, orn:k?"roll":""});
    });
  });
  if(sw){ const warp=x=>{ const b=Math.floor(x+1e-9), fr=x-b; return b+(fr<=0.5 ? fr/0.5*sw : sw+(fr-0.5)/0.5*(1-sw)); };
    out.forEach(n=>{ const a=warp(n.t), z=warp(n.t+n.d); n.t=+a.toFixed(6); n.d=+Math.max(0.04, z-a).toFixed(6); }); }
  return out;
}
/* the left hand's chords under a lick that has no left-hand line of its own: a close voicing of each chord, held (or as
   the lick asks: h = on 1 and 3, s = short on 1 and the and of 2) */
function comping(chs, how){
  const out=[];
  chs.forEach((c,ci)=>{
    const tn=c.tones.filter(x=>x<12), v=[0].concat(tn.slice(1)), len=c.t1-c.t0;
    const hits=how==="h" ? [0,2] : how==="s" ? [0,1.5] : how==="q" ? [0,1,2,3] : [0,4];
    hits.filter(h=>h<len-1e-6).forEach((h,k,arr)=>{ const nx=arr[k+1]!=null ? arr[k+1] : len, d=how==="s" ? 0.4 : (nx-h)*0.96;
      v.forEach(x=>out.push({rel:(c.base!=null?c.base:c.root)+x, t:c.t0+h, d, h:"c", tb:c.t0+h, chord:ci, v:x===0?0.46:0.4})); });
  });
  return out;
}
/* AOG-LICKS-SONG-V1: a chord of the song (the room's pattern: {off, q}) as a chord of a lick line ("b7d7*4") */
const QTOK={maj:"M", min:"m", dom7:"d7", maj7:"M7", m7:"m7", dim:"o", m7b5:"m7b5", maj6:"6", m6:"m6", dom9:"d9", maj9:"M9", m9:"m9", sus4:"s4"};
function chordTok(c, minor, len){
  const SC=minor?MIN:MAJ, off=((c.off%12)+12)%12, i=SC.indexOf(off); let deg="";
  if(i>=0) deg=String(i+1);
  else for(let d=0; d<7 && !deg; d++){ if(MAJ[d]===off) deg="n"+(d+1); else if((MAJ[d]+11)%12===off) deg="b"+(d+1); else if((MAJ[d]+1)%12===off) deg="#"+(d+1); }
  return deg+(QTOK[c.q]||"")+"*"+(len||4);
}
function fitChords(prog, bars, bar0, minor){
  const out=[]; for(let j=0;j<bars;j++) out.push(chordTok(prog[((bar0+j)%prog.length+prog.length)%prog.length], minor, 4));
  return out.join(" ");
}
function resolve(def, minor, fit, way){
  const own=parseChords(minor && def.cm ? def.cm : def.ch, minor), rawBeats=own[own.length-1].t1, bars=Math.ceil(rawBeats/4-1e-6);
  const chs=fit && fit.prog && fit.prog.length ? parseChords(fitChords(fit.prog, bars, fit.bar0||0, minor), minor) : own;
  chs[chs.length-1].t1=4*bars;   /* AOG-LICKS-SONG-V1: whole bars */
  if(chs!==own) chs.forEach(c=>{ const o=way===1 ? chordAt(own, c.t0).root : way===2 ? 2.5 : way===3 ? 5.5 : -0.5; c.base=[c.root-12, c.root, c.root+12].reduce((a,b)=>Math.abs(b-o)<Math.abs(a-o)?b:a); });   /* a song's chords: each one where the lick's own chord was, so the hands stay where the lick puts them */
  const R=line(minor && def.nm ? def.nm : def.n, chs, minor);
  const lhs=minor && def.nl ? def.nl : def.lh, Lh=lhs ? line(lhs, chs, minor) : null;
  return {chs, chordBeats:rawBeats, bars, R, Lh};
}

/* ══ where the hands go: the right hand around the middle of the keys, the left hand below it, all of it on three
   octaves of keys (C to C) so a computer or an iPad shows every note at once ══ */
const LO=36, HI=96, WHITE=[0,2,4,5,7,9,11];
function whiteAt(m){ return WHITE.indexOf(((m%12)+12)%12)>=0 ? m : m-1; }
function place(rh, lh, key, def, want){
  const span=list=>list.length ? [Math.min(...list.map(n=>n.rel)), Math.max(...list.map(n=>n.rel))] : null;
  const sr=span(rh), sl=span(lh); let best=null;
  for(let a=-2;a<=3;a++) for(let b=-3;b<=2;b++){
    const rR=key+12*(5+a), rL=key+12*(4+b);
    const lo=Math.min(sr?rR+sr[0]:99, sl?rL+sl[0]:99), hi=Math.max(sr?rR+sr[1]:0, sl?rL+sl[1]:0);
    if(lo<LO || hi>HI) continue;
    const c3=hi-whiteAt(lo)<=36;
    const rc=sr ? rR+(sr[0]+sr[1])/2 : 70, lc=sl ? rL+(sl[0]+sl[1])/2 : 50;
    const clash=sr && sl ? Math.max(0, (rL+sl[1])-(rR+sr[0])-4) : 0;
    let score=Math.abs(rc-70-12*(def.o||0))+0.8*Math.abs(lc-50-12*(def.lo||0))+(c3?0:60)+clash*3;
    if(want && rR===want.rR && rL===want.rL) score-=1000;   /* a repeat stays where the lick began */
    if(!best || score<best.score) best={score, rR, rL, c3};
  }
  return best;
}
/* AOG-LICKS-SONG-V1: fitted to other chords, a note that no longer fits moves to the nearest note that does: a chord
   note on beats 1 and 3, the key's notes (or the chord's) elsewhere; a crush stays a half step under its note */
function repair(notes, chs, key, minor){
  const SC=minor?MIN:MAJ, pcOf=m=>((m-key)%12+12)%12;
  const fits=(m, c, strong)=>{ const pc=pcOf(m), t=c.tones.map(x=>(c.root+x)%12); return t.indexOf(pc)>=0 || (!strong && SC.indexOf(pc)>=0); };
  const near=(m, c, strong)=>{ for(let d=0; d<=6; d++){ if(fits(m-d, c, strong)) return m-d; if(fits(m+d, c, strong)) return m+d; } return m; };
  const hands={r:[], l:[]}; notes.forEach(n=>{ if(hands[n.h]) hands[n.h].push(n); });
  Object.keys(hands).forEach(h=>{
    const L=hands[h];
    L.forEach(n=>{ if(n.orn==="crush" || n.orn==="glide") return;
      const c=chs[n.chord], strong=!n.orn && Math.abs(n.tb/2-Math.round(n.tb/2))<1e-6, pc=pcOf(n.m);
      const tone=c.tones.map(x=>(c.root+x)%12).indexOf(pc)>=0, inKey=SC.indexOf(pc)>=0;
      if(strong && !tone){ n.m=near(n.m, c, true); delete n.appr; delete n.pass; return; }
      if(!tone && !inKey){
        const nx=L.filter(x=>x.t>n.t+1e-6 && !x.orn), t1=nx.length?nx[0].t:null;
        const ok=(n.pass||n.appr) && t1!=null && nx.filter(x=>Math.abs(x.t-t1)<1e-6).some(x=>Math.abs(x.m-n.m)<=2);
        if(!ok){ n.m=near(n.m, c, false); delete n.appr; delete n.pass; }
      }
    });
    L.forEach(n=>{ if(n.orn==="crush"){ const to=L.filter(x=>x.ev===n.ev && !x.orn); if(to.length) n.m=Math.max(...to.map(x=>x.m))-1; }
      if(n.orn==="glide"){ const to=L.filter(x=>x.ev===n.ev && !x.orn); if(to.length){ const top=Math.max(...to.map(x=>x.m)); if(n.m>=top || n.m<top-12) n.m=top-1; } } });
  });
  /* two notes that became one */
  const seen=new Set(); return notes.filter(n=>{ const k=n.h+"|"+n.t+"|"+n.m; if(seen.has(k)) return false; seen.add(k); return true; });
}
function compile(def, o){
  o=o||{}; const fit=!!(o.fit && o.fit.prog && o.fit.prog.length);
  if(!fit) return compile1(def, o, 0);
  let first=null; for(const way of [0,1,2,3]){ const C=compile1(def, o, way); if(C && C.c3) return C; first=first||C; } return first;
}
function compile1(def, o, way){
  const key=((o.key||0)%12+12)%12, minor=!!o.minor;
  const Z=resolve(def, minor, o.fit, way), chs=Z.chs, P=4*Z.bars;
  const rh=expand(Z.R.L, "r", chs, minor, def.sw||0);
  const lh=Z.Lh ? expand(Z.Lh.L, "l", chs, minor, def.sw||0) : (def.comp===0 ? [] : comping(chs, def.comp||""));
  const best=place(rh, lh, key, def, o.place);
  if(!best) return null;
  let notes=rh.map(n=>Object.assign(n, {m:best.rR+n.rel})).concat(lh.map(n=>Object.assign(n, {m:best.rL+n.rel})));
  /* the last notes of each hand ring on to the bar line */
  ["r","l"].forEach(h=>{ const L=notes.filter(n=>n.h===h && !n.orn); if(!L.length) return; const tb=Math.max(...L.map(n=>n.tb));
    notes.forEach(n=>{ if(n.h===h && n.tb===tb && !n.trem) n.d=Math.max(n.d, +(P-n.t).toFixed(6)); }); });
  if(o.fit && o.fit.prog && o.fit.prog.length) notes=repair(notes, chs, key, minor);
  notes.sort((x,y)=>x.t-y.t || x.m-y.m);
  return {id:def.id, notes, chords:chs.map(c=>({t0:c.t0, t1:c.t1, root:c.root, q:c.q, tones:c.tones.slice()})), beats:P, bars:Z.bars,
    rawBeats:Z.R.beats, lhBeats:Z.Lh?Z.Lh.beats:null, chordBeats:Z.chordBeats, key, minor, rR:best.rR, rL:best.rL, c3:best.c3, own:!!Z.Lh, fit:!!(o.fit && o.fit.prog && o.fit.prog.length)};
}

/* ══ the numbers: what a lick must be in every key ═══════════════════════════════════════════════════════════════ */
function check(C){
  const bad=[]; if(!C) return ["does not fit on the keys"];
  if(Math.abs(C.chordBeats-C.rawBeats)>1e-6) bad.push(`the right hand lasts ${C.rawBeats} beats, the chords ${C.chordBeats}`);
  if(C.lhBeats!=null && Math.abs(C.chordBeats-C.lhBeats)>1e-6) bad.push(`the left hand lasts ${C.lhBeats} beats, the chords ${C.chordBeats}`);
  if(C.beats%4 || C.notes.some(n=>n.t+n.d>C.beats+1e-6)) bad.push("not whole bars");
  if(C.notes.some(n=>n.t< -1e-6)) bad.push("a note before beat 1");
  if(!C.c3) bad.push("needs more than three octaves of keys");
  const SC=C.minor?MIN:MAJ;
  const byHand={r:C.notes.filter(n=>n.h==="r"), l:C.notes.filter(n=>n.h==="l")};
  C.notes.forEach((n,i)=>{
    if(n.m<LO || n.m>HI) bad.push(`note ${i} off the keys (${n.m})`);
    if(n.h==="c") return;
    const c=C.chords[n.chord], pc=((n.m-C.key)%12+12)%12, chordPcs=c.tones.map(x=>(c.root+x)%12);
    const inKey=SC.indexOf(pc)>=0, isTone=chordPcs.indexOf(pc)>=0, strong=!n.orn && Math.abs(n.tb/2-Math.round(n.tb/2))<1e-6;
    if(strong && !isTone) bad.push(`${n.h} note ${i} at beat ${n.tb} is not in the chord`);
    if(n.appr && strong) bad.push(`note ${i} leans on a strong beat`);
    if(!inKey && !isTone){
      if(!(n.pass||n.appr||n.orn)) bad.push(`${n.h} note ${i} (${n.m}) at beat ${n.tb} is outside the key and the chord`);
      else { const L=byHand[n.h], nx=L.filter(x=>x.t>n.t+1e-6 && !x.orn); const t1=nx.length?nx[0].t:null;
        if(t1==null || !nx.filter(x=>Math.abs(x.t-t1)<1e-6).some(x=>Math.abs(x.m-n.m)<=2)) bad.push(`${n.h} note ${i} at beat ${n.tb} passes to nothing near it`); }
    }
  });
  const lastOf=L=>{ const z=L.filter(n=>n.orn!=="crush" && n.orn!=="glide"); if(!z.length) return null; const t=Math.max(...z.map(n=>n.tb)); return z.filter(n=>n.tb===t); };
  const lc=C.chords[C.chords.length-1], rootPc=(C.key+lc.root)%12;
  const lr=lastOf(byHand.r); if(lr && !lr.some(n=>((n.m%12)+12)%12===rootPc)) bad.push("the right hand does not end on the root");
  const ll=lastOf(byHand.l); if(ll && !ll.some(n=>((n.m%12)+12)%12===rootPc)) bad.push("the left hand does not end on the root");
  return bad;
}

const API={GROUPS, ORDER, LICKS, WORDS, compile, check, parseChords, fitChords, chordTok, _resolve:resolve};
if(typeof module!=="undefined" && module.exports){ module.exports=API; return; }
root.AOGPianoLicks=API;

/* ══ the Piano room: Licks to try, right under the keys (music-piano.html opens the block and loads this file) ══════
   ▶ Play this lick plays it on the room's own sound (makeVoice, the live chain), in the room's key and major or minor and
   at the song's tempo; each key lights as it sounds (blue the right hand, purple the left). The keys on screen widen to
   show the lick while it plays (two octaves on a phone, three on an iPad or a computer) and go back after. Lick speed
   slows it to learn it. Fit to my chords puts it on the room's own chord pattern; Repeat plays it 1, 2 or 4 times, bar
   after bar; ● Record this lick makes it a take, so + Add to My Track and Send to the drum machine take it.
   Nothing runs while nothing plays: the frame callback runs only while a lick plays; a hidden tab, the Studio's hush, a
   chord pattern started and Lower or Higher stop it. */
if(typeof document==="undefined" || typeof S==="undefined" || typeof makeVoice!=="function") return;
const box=document.getElementById("pkLicksIn"); if(!box) return;
const $q=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g, ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const WD=Object.assign({
  lickLab:{en:"Lick",es:"Frase"},
  lickPlay:{en:"▶ Play this lick",es:"▶ Tocar esta frase"}, lickStop:{en:"■ Stop",es:"■ Parar"},
  lickSpeed:{en:"Lick speed",es:"Velocidad de la frase"},
  spdFull:{en:"Full speed",es:"Velocidad completa"}, spdPart:{en:"{n}% speed",es:"{n} % de velocidad"},
  spdHelp:{en:"Slow it down to learn it. Then speed it up.",es:"Bájale la velocidad para aprenderla. Luego súbela."},
  playing:{en:"Playing: {name}.",es:"Sonando: {name}."},
  hands:{en:"Blue keys: right hand. Purple keys: left hand.",es:"Teclas azules: mano derecha. Teclas moradas: mano izquierda."},
  fit:{en:"Fit to my chords",es:"Seguir mis acordes"},
  rep:{en:"Repeat",es:"Repetir"}, repAria:{en:"Play it {n} times",es:"Tocarla {n} veces"}, rep1:{en:"Play it once",es:"Tocarla una vez"},
  rec:{en:"● Record this lick",es:"● Grabar esta frase"},
  recMaking:{en:"Recording the lick…",es:"Grabando la frase…"},
  recDone:{en:"Done. It is with your takes.",es:"Listo. Está con tus tomas."},
  recFail:{en:"That did not work. Try again.",es:"No funcionó. Inténtalo otra vez."},
  song:{en:"In your song: {key}, {n} beats a minute.",es:"En tu canción: {key}, {n} pulsos por minuto."},
  maj:{en:"major",es:"mayor"}, min:{en:"minor",es:"menor"}
}, WORDS);
function w(k, vars){ const e=WD[k]; let s=e?(e[S.lang]||e.en):k; if(vars) Object.keys(vars).forEach(v=>{ s=s.split("{"+v+"}").join(vars[v]); }); return s; }

/* what is kept on this device: the lick, its speed, Fit and Repeat */
const PKEY="aog.piano.licks.v1", LP={lick:ORDER[0], lspd:100, fit:false, rep:1};
try{ const r=JSON.parse(localStorage.getItem(PKEY)||"null");
  if(r){ if(LICKS[r.lick]) LP.lick=r.lick; if(r.lspd>=25 && r.lspd<=100) LP.lspd=Math.round(r.lspd/5)*5; LP.fit=!!r.fit; if([1,2,4].indexOf(r.rep)>=0) LP.rep=r.rep; } }catch(e){}
function keep(){ try{ localStorage.setItem(PKEY, JSON.stringify(LP)); }catch(e){} }

/* the CSS: the lit keys (dark ink on their own light colours, so a note's name stays readable) and the block */
if(!$q("pk-licks-css")){ const st=document.createElement("style"); st.id="pk-licks-css";
  st.textContent="#kbd .wk.pk-r{background:linear-gradient(#cfe8ff,#86c3f2)!important;box-shadow:inset 0 -6px 0 #2f78b8}#kbd .wk.pk-l{background:linear-gradient(#ece2ff,#c3aef5)!important;box-shadow:inset 0 -6px 0 #6a4fb0}"+
    "#kbd .wk.pk-r .nm,#kbd .wk.pk-l .nm,#kbd .wk.pk-r .nm small,#kbd .wk.pk-l .nm small,#kbd .wk.pk-r .kc,#kbd .wk.pk-l .kc{color:#14202b}"+
    "#kbd .bk.pk-r{background:linear-gradient(#3d86c6,#1d4f7d)!important}#kbd .bk.pk-l{background:linear-gradient(#7d62c4,#45307e)!important}#kbd .bk.pk-r .kc,#kbd .bk.pk-l .kc{color:#fff}"+
    ".pk-licks .pk-row{display:flex;flex-wrap:wrap;gap:.6rem .8rem;align-items:flex-end;margin-top:.6rem}.pk-licks .pk-row .field{flex:1 1 14rem;min-width:0}.pk-licks .pk-row .field select{width:100%}"+
    ".pk-licks .pk-rep .seg .pbtn{min-width:44px}.pk-licks .tempo{margin-top:.6rem}";
  document.head.appendChild(st); }

box.innerHTML=`<div class="pk-row"><label class="field"><span class="plab" data-pk="lickLab"></span><select id="pkLickSel"></select></label>
    <button type="button" class="pbtn play" id="pkLickBtn" aria-pressed="false"></button></div>
  <div class="tempo"><span class="plab" style="margin:0" data-pk="lickSpeed"></span><input type="range" id="pkLickSpd" min="25" max="100" step="5"><b id="pkLickSpdOut"></b></div>
  <div class="pk-row"><button type="button" class="pbtn" id="pkFit" aria-pressed="false"></button>
    <div class="field small pk-rep"><span class="plab" data-pk="rep"></span><div class="seg" role="group" id="pkRep"><button type="button" class="pbtn" data-rep="1">1</button><button type="button" class="pbtn" data-rep="2">2</button><button type="button" class="pbtn" data-rep="4">4</button></div></div>
    <button type="button" class="pbtn" id="pkRec"></button></div>
  <p class="line" id="pkSong"></p>
  <p class="line" id="pkLine" aria-live="polite"></p>
  <p class="line" id="pkHands"></p>`;

/* ══ the song: its tempo (the Studio's, to the hundredth; the room's own outside it), the room's key ═══════════════ */
function songBpm(){ try{ const s=window.AOGSong && AOGSong.get(); if(s && s.hasBpm && s.bpm>0) return s.bpm; }catch(e){} return S.bpm; }
/* a very fast song: a lick with sixteenths plays at half time, so it stays playable (and still lands on the bars) */
function lickBpm(B){ const b=songBpm(); return b>184 && B.fast ? b/2 : b; }
function keyWord(){ return KEY_NAMES[S.lang][S.key]+" "+w(S.minor?"min":"maj"); }
function fitProg(){ return LP.fit && S.prog && S.prog.length ? S.prog.map(c=>({off:c.off, q:c.q})) : null; }
/* the lick as it will play: in the key, fitted or not, repeated; times in beats from the first bar line */
function build(id){
  const def=LICKS[id]; if(!def) return null;
  const prog=fitProg(), notes=[], chords=[]; let place=null, beats=0, bars=0;
  for(let r=0;r<LP.rep;r++){
    const C=compile(def, {key:S.key, minor:!!S.minor, fit:prog ? {prog, bar0:bars} : null, place}); if(!C) return null;
    place=place||{rR:C.rR, rL:C.rL};
    C.notes.forEach(n=>notes.push({t:n.t+beats, d:n.d, m:n.m, v:n.v, h:n.h, tb:n.tb+beats}));
    C.chords.forEach(c=>chords.push(Object.assign({}, c, {t0:c.t0+beats, t1:c.t1+beats})));
    beats+=C.beats; bars+=C.bars;
  }
  return {id, notes, chords, beats, bars, fast:notes.some(n=>n.d<0.3 && n.h!=="c"), key:S.key, minor:!!S.minor, fit:!!prog, rep:LP.rep};
}

/* ══ the keys in view while it plays ══════════════════════════════════════════════════════════════════════════════ */
const WHITES=[0,2,4,5,7,9,11], wAt=m=>WHITES.indexOf(((m%12)+12)%12)>=0 ? m : m-1;
function capOc(){ if(typeof BP!=="undefined" && BP.on) return octaves(); const k=$q("kbd"), wd=(k && k.clientWidth)||330; return wd>=600 ? 3 : 2; }
function viewPlan(B){
  const cap=capOc(), base=Math.min(cap, octaves());
  const fit=list=>{ if(!list.length) return null; const ms=list.map(n=>n.m), lo=wAt(Math.min(...ms)), hi=Math.max(...ms), need=Math.max(1, Math.ceil((hi-lo)/12));
    if(need>cap) return null; const oc=Math.max(base, need); let start=lo-12*Math.floor((oc-need)/2); start=wAt(Math.max(24, Math.min(108-12*oc, start))); return {oc, lo:start}; };
  const rh=B.notes.filter(n=>n.h==="r");
  const all=fit(B.notes); if(all) return {fixed:all, ev:[]};
  const one=fit(rh); if(one) return {fixed:one, ev:[]};
  /* a right hand too wide for the keys in view: they move with it, just enough */
  const oc=cap, ev=[]; let lo=wAt(rh[0].m-2);
  ev.push({t:-1, lo});
  rh.forEach(n=>{ if(n.m>=lo && n.m<=lo+12*oc) return; lo=n.m>lo ? wAt(n.m-12*oc+5) : wAt(n.m-2); lo=Math.max(24, Math.min(108-12*oc, lo)); ev.push({t:n.t, lo}); });
  return {fixed:null, oc, ev};
}
function showView(v){ window.AOG_PKV=v; buildKeys(); L.sig=""; }

/* ══ the player ═══════════════════════════════════════════════════════════════════════════════════════════════════ */
const L={on:false, B:null, i:0, voices:[], T0:0, beat:0, end:0, raf:0, id:"", mk:"", sig:"", seen:new Set(), log:[], plan:null, vi:0};
function play(id){
  lickStop(true);
  const B=build(id); if(!B) return;
  if(S.playing && typeof stop==="function") stop();   /* the room's chord pattern stops: the lick has its own chords */
  const c=ctx(), spd=clamp(LP.lspd||100, 25, 100)/100, beat=60/lickBpm(B)/spd;
  L.B=B; L.beat=beat; L.T0=c.currentTime+0.12; L.i=0; L.voices=[]; L.on=true; L.id=id; L.mk=S.key+(S.minor?"m":""); L.seen=new Set(); L.sig=""; L.spd=spd;
  L.end=L.T0+Math.max(...B.notes.map(n=>n.t+n.d))*beat;
  L.log=B.notes.map(n=>({t:+(L.T0+n.t*beat).toFixed(4), m:n.m, h:n.h, tb:n.tb, d:n.d}));
  L.plan=viewPlan(B); L.vi=0;
  showView(L.plan.fixed || {oc:L.plan.oc, lo:L.plan.ev[0].lo}); if(!L.plan.fixed) L.vi=1;
  schedule(c.currentTime);
  paintBtn(); const ln=$q("pkLine"); if(ln) ln.textContent=w("playing",{name:w("lk_"+id)});
  L.raf=requestAnimationFrame(frame);
}
/* the notes of the next quarter second go to the room's own voices (and so to ● Record, as every note does) */
function schedule(now){
  const B=L.B, c=ac;
  while(L.i<B.notes.length && L.T0+B.notes[L.i].t*L.beat < now+0.25){
    const n=B.notes[L.i++], at=Math.max(c.currentTime, L.T0+n.t*L.beat), end=L.T0+(n.t+n.d)*L.beat;
    const vc=makeVoice(c, LIVE_CH, S.sound, n.m, Math.min(1, n.v), at);
    if(vc){ vc.stop(Math.max(at+0.03, end), vc.tau); L.voices.push(vc); }
  }
  if(L.voices.length>64) L.voices=L.voices.filter(v=>!(v.end && v.end<now-1));
}
function frame(){
  L.raf=0; if(!L.on || !ac) return;
  const now=ac.currentTime;
  if(now>L.end+0.08){ lickStop(false, true); return; }
  if(L.mk!==S.key+(S.minor?"m":"")){ play(L.id); return; }   /* the key changed: it starts again in the new key */
  try{ if(typeof HANDS!=="undefined") HANDS.at=performance.now(); }catch(e){}   /* the room's own loading waits, as it does for hands */
  schedule(now);
  const P=L.plan; if(P && !P.fixed){ let moved=false; while(L.vi<P.ev.length && now>=L.T0+P.ev[L.vi].t*L.beat-0.03){ window.AOG_PKV={oc:P.oc, lo:P.ev[L.vi].lo}; moved=true; L.vi++; } if(moved){ buildKeys(); L.sig=""; } }
  /* the keys sounding now */
  const on=new Map(), B=L.B;
  for(const n of B.notes){ const a=L.T0+n.t*L.beat; if(a>now) break; if(now<L.T0+(n.t+n.d)*L.beat) on.set(n.m, n.h==="r" ? "r" : (on.get(n.m)||"l")); }
  const sig=[...on].map(x=>x.join("")).join(",");
  if(sig!==L.sig){ L.sig=sig; paintKeys(on); }
  L.raf=requestAnimationFrame(frame);
}
function paintKeys(on){
  const kb=$q("kbd"); if(!kb) return;
  keyList(kb).forEach(k=>{ const h=on.get(k.m), r=h==="r", l=h==="l";
    if(h) L.seen.add(k.m);
    if(k.el.classList.contains("pk-r")!==r) k.el.classList.toggle("pk-r", r);
    if(k.el.classList.contains("pk-l")!==l) k.el.classList.toggle("pk-l", l); });
}
function lickStop(quiet, natural){
  if(!L.on) return;
  L.on=false; if(L.raf) cancelAnimationFrame(L.raf); L.raf=0;
  if(!natural && ac){ const now=ac.currentTime; L.voices.forEach(v=>{ try{ v.kill(now); }catch(e){} }); }
  L.gone=L.voices; L.voices=[];
  paintKeys(new Map());
  if(window.AOG_PKV){ showView(null); }
  paintBtn();
  if(!quiet){ const ln=$q("pkLine"); if(ln) ln.textContent=desc(); }
}

/* ══ ● Record this lick: the lick at the song's tempo (full speed), key, chords and Repeat, made on the room's own
   sound the way a take's notes are played again (AOGRoomRender), then a take like any other (REC.addTake) ══════════ */
const RC={busy:false};
async function recLick(){
  if(RC.busy) return; const B=build(LP.lick); if(!B || typeof REC==="undefined" || !REC.addTake || !window.AOGRoomRender) return;
  lickStop(true);
  RC.busy=true; paintRec(); const ln=$q("pkLine"); if(ln) ln.textContent=w("recMaking");
  try{
    const bpm=lickBpm(B), beat=60/bpm;
    const ev=B.notes.map(n=>({t:+(n.t*beat).toFixed(4), m:n.m, v:+Math.min(1, n.v).toFixed(3), d:+Math.max(0.03, n.d*beat).toFixed(4)}));
    let space=0; try{ space=window.AOGRoom ? AOGRoom.get() : 0; }catch(e){}
    const R=await AOGRoomRender.render({events:ev, sound:S.sound, sr:44100, set:{era:S.era}, space, sec:B.beats*beat, tail:2});
    const blob=wavBlob(R.L, R.R, R.sr), sec=R.L.length/R.sr;
    const take=REC.addTake(blob, {sec, bpm, place:{bar:1, bpm, note:1},
      notes:{v:1, room:"piano", sound:S.sound, set:{era:S.era}, space, sr:R.sr, lag:0, ev, ped:[], key:{key:B.key, minor:B.minor}, lick:{id:B.id, bars:B.bars, rep:B.rep, fit:B.fit}}});
    L.lastTake=take ? {n:take.n, sec, bpm, bars:B.bars, beats:B.beats, key:B.key, minor:B.minor, events:ev.length} : null;
    if(ln) ln.textContent=w(take ? "recDone" : "recFail");
  }catch(e){ if(ln) ln.textContent=w("recFail"); }
  RC.busy=false; paintRec();
}

/* ══ the words and the controls ═══════════════════════════════════════════════════════════════════════════════════ */
function desc(){ return LICKS[LP.lick] ? w("ld_"+LP.lick)+(LP.lspd<100?" "+w("spdHelp"):"") : ""; }
function spdWord(){ return LP.lspd>=100 ? w("spdFull") : w("spdPart",{n:LP.lspd}); }
function paintBtn(){ const b=$q("pkLickBtn"); if(!b) return; b.textContent=w(L.on?"lickStop":"lickPlay"); b.setAttribute("aria-pressed", L.on?"true":"false"); }
function paintRec(){ const b=$q("pkRec"); if(!b) return; b.textContent=w("rec"); b.disabled=RC.busy; }
function paintSong(){ const el=$q("pkSong"); if(!el) return; const b=Math.round(songBpm()*100)/100, t=w("song",{key:keyWord(), n:String(b)}); if(el.textContent!==t) el.textContent=t; }
function paintFit(){ const b=$q("pkFit"); if(b){ b.textContent=w("fit"); b.setAttribute("aria-pressed", LP.fit?"true":"false"); } }
function paintRep(){ document.querySelectorAll("#pkRep [data-rep]").forEach(b=>{ const n=+b.getAttribute("data-rep"); b.setAttribute("aria-pressed", String(n===LP.rep)); b.setAttribute("aria-label", n===1 ? w("rep1") : w("repAria",{n})); }); }
function paintSel(){
  const sel=$q("pkLickSel"); if(!sel) return;
  sel.innerHTML=GROUPS.map(([g,ids])=>`<optgroup label="${esc(w("lgp_"+g))}">`+ids.map(id=>`<option value="${id}"${id===LP.lick?" selected":""}>${esc(w("lk_"+id))}</option>`).join("")+`</optgroup>`).join("");
  sel.setAttribute("aria-label", w("lickLab"));
}
function paintSpd(){ const r=$q("pkLickSpd"); if(!r) return; r.value=String(LP.lspd); r.setAttribute("aria-label", w("lickSpeed")); r.setAttribute("aria-valuetext", spdWord()); $q("pkLickSpdOut").textContent=spdWord(); }
function paintAll(){
  box.querySelectorAll("[data-pk]").forEach(el=>{ el.textContent=w(el.getAttribute("data-pk")); });
  paintSel(); paintBtn(); paintSpd(); paintFit(); paintRep(); paintRec(); paintSong();
  $q("pkHands").textContent=w("hands");
  const ln=$q("pkLine"); if(ln && !L.on && !RC.busy) ln.textContent=(LP.fit && !(S.prog && S.prog.length)) ? t("sendNeed") : desc();
}
$q("pkLickSel").addEventListener("change",(e)=>{ if(!LICKS[e.target.value]) return; LP.lick=e.target.value; keep(); if(L.on) play(LP.lick); else $q("pkLine").textContent=desc(); });
$q("pkLickBtn").addEventListener("click",()=>{
  if(L.on){ lickStop(); return; }
  /* the keys in sight as it plays */
  const kb=$q("kbd"); if(kb){ const r=kb.getBoundingClientRect(); if(r.top<0 || r.bottom>innerHeight) kb.scrollIntoView({block:"start", behavior:"instant"}); }
  play(LP.lick);
});
$q("pkLickSpd").addEventListener("input",(e)=>{ const v=Math.round(clamp(+e.target.value,25,100)/5)*5; if(v===LP.lspd) return; LP.lspd=v; paintSpd(); keep(); if(!L.on) $q("pkLine").textContent=desc(); });
$q("pkFit").addEventListener("click",()=>{ LP.fit=!LP.fit; keep(); paintFit(); if(L.on) play(L.id); else paintAll(); });
document.querySelectorAll("#pkRep [data-rep]").forEach(b=>b.addEventListener("click",()=>{ LP.rep=+b.getAttribute("data-rep"); keep(); paintRep(); if(L.on) play(L.id); }));
$q("pkRec").addEventListener("click", recLick);
/* a menu chosen with a finger lets the focus go, so the keys play again (as the room's menus do) */
(function(){ const el=$q("pkLickSel"); el.addEventListener("pointerdown",()=>{ el._ptr=true; }); el.addEventListener("change",()=>{ if(el._ptr){ el._ptr=false; setTimeout(()=>el.blur(),0); } }); })();
/* what stops it: the room's own chord pattern, Lower and Higher, a hidden tab, the Studio's hush, leaving */
["playBtn","downBtn","upBtn","bpDown","bpUp"].forEach(id=>{ const b=$q(id); if(b) b.addEventListener("click",()=>{ if(L.on) lickStop(); }, true); });
document.addEventListener("visibilitychange",()=>{ if(document.hidden) lickStop(); });
window.addEventListener("pagehide",()=>lickStop(true));
window.addEventListener("aog-hush",(e)=>{ if(e && e.detail && e.detail.on) lickStop(); });
/* the words follow the language, the line follows the song */
try{ new MutationObserver(()=>paintAll()).observe(document.documentElement, {attributes:true, attributeFilter:["lang"]}); }catch(e){}
try{ if(window.AOGSong && AOGSong.on) AOGSong.on(()=>paintSong()); }catch(e){}
["keySel","bpm"].forEach(id=>{ const el=$q(id); if(el) el.addEventListener(id==="bpm"?"input":"change",()=>setTimeout(paintSong,0)); });
["majBtn","minBtn"].forEach(id=>{ const el=$q(id); if(el) el.addEventListener("click",()=>setTimeout(paintSong,0)); });
paintAll();

/* for the tests: one lick made offline at a tempo, the way ● Record this lick makes it */
async function renderLick(id, o){
  o=o||{}; const keepLP={fit:LP.fit, rep:LP.rep}; LP.fit=!!o.fit; LP.rep=o.rep||1;
  const B=build(id); LP.fit=keepLP.fit; LP.rep=keepLP.rep; if(!B) return null;
  const beat=60/(o.bpm||100), ev=B.notes.map(n=>({t:+(n.t*beat).toFixed(4), m:n.m, v:+Math.min(1, n.v).toFixed(3), d:+Math.max(0.03, n.d*beat).toFixed(4)}));
  const R=await AOGRoomRender.render({events:ev, sound:S.sound, sr:44100, set:{era:S.era}, space:0, sec:B.beats*beat, tail:1.5});
  return {L:R.L, sr:R.sr, starts:ev.map(e=>e.t), n:ev.length, beats:B.beats};
}
API._t={L, LP, RC, play, lickStop, build, viewPlan, recLick, renderLick, songBpm, capOc, get last(){ return L.lastTake; }};
})(typeof window!=="undefined"?window:this);
