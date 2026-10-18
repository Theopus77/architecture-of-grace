/* AOG-SOLO-GTRLICKS-V1 (2026-10-18) — Jimmy: "Can we have around the same amount for guitar licks as well?"

   More licks for the Guitar's Solo mode ("Licks to try", aog-solo.js), loaded only when Solo opens on the Guitar. The 57
   first licks stay in aog-solo.js as they were; these join them in the same menu (more in the first groups, and new
   groups after them). AOG-SOLO-LICKS-MATCH-V1 (Jimmy, 2026-10-18: "Can any DIME BAG DARRELL or Kirk Hammett type of licks be
   included in the Guitar licks or Van Halen, Kiss, etc.. Make the bass and guitar pages match."): four more groups of
   original licks in those players' styles (arena rock, 80s hard rock, thrash, groove metal; no name on screen), and Disco,
   Hip-hop and R&B, and Drum and bass, so the guitar has every group the bass has. Like the bass's licks (aog-bass-licks.js), each is written against chords, not frets, so it follows
   the song's key and major or minor and lands on the chord's own notes:

     chords: "1 4 5 1*2"  a chord a bar (4 beats) unless *n says how many beats. The number is the step of the key's
             scale it is built on (major or natural minor); b or # in front counts from the major scale (b7 is the flat
             seven chord in both). After it: m M 7 m7 M7 d7 (dominant 7) o (diminished) m7b5; none = the key's own chord.
             cm: another chord line for a minor key; nm: another note line for a minor key.
     notes:  each note is how it sits on the chord, how long, and how it is played:
             1 3 5 7 = the chord's root, third, fifth and seventh; 2 4 6 9 = the key's scale above the root; 8 = the octave;
             b3 #4 b7 … = that many steps from the root counted on the major scale (blue notes, passing notes);
             , = an octave down, ' = an octave up; r = a rest; x = a muted hit where the note before was;
             < and > = a half step below or above the next note; [ and ] = the key's scale note below or above the next;
             w h q e s t f = whole, half, quarter, eighth, sixteenth, triplet eighth, triplet sixteenth (. adds half);
             the length carries on to the next note.
             3+5 = two (or three) notes at once: a double-stop (a chord with ^ is strummed up, from the high string).
             How (on a note): H hammer-on, O pull-off, T tap, G muted, ~ slide from the note before on its string,
             / slide in from two frets below, \ fall away, U bend a whole step up to the note written (the finger is
             a whole step lower), B a half-step bend, R and let it back down, Y a small blues curl, V vibrato (W wide),
             Q a pinch squeal, ! a passing note on purpose, = still ringing from the note before (no new pick);
             (on the whole token) - short, _ held full, Z tremolo picking, K a muted rake into it; @E @A @D @G @B @e
             on that string.
   compile() turns a lick into the notes playLick() plays (the first licks' own format: string, fret, beats), placed in
   one five-fret hand position (open strings too, near the nut) on the six strings, so the neck in view (five frets on a
   phone) shows every note; check() tests the numbers: the range, every note in the hand position, the chord's notes on
   beats 1 and 3, the key's notes everywhere else unless a note passes by a half or whole step on purpose, a bend that
   starts on the key's note (or a blue note) and reaches the note written, and the last note on its chord's root. */
(function(root){
"use strict";
const MAJ=[0,2,4,5,7,9,11], MIN=[0,2,3,5,7,8,10], MAJINT=[0,2,4,5,7,9,11,12,14];
const MIX=[0,2,4,5,7,9,10], DOR=[0,2,3,5,7,9,10];
const QT={maj:[0,4,7], min:[0,3,7], dim:[0,3,6], dom7:[0,4,7,10], maj7:[0,4,7,11], m7:[0,3,7,10], m7b5:[0,3,6,10]};
const DUR={w:4, h:2, q:1, e:0.5, s:0.25, t:1/3, f:1/6};
const TUNE=[40,45,50,55,59,64], MAXF=15, SPAN=4, STRS="EADGBe";

/* ══ the licks: [id, group, chords, notes, extra] ══════════════════════════════════════════════════════════════════ */
const RAW=[
/* blues: two more */
["g_blbox","blues","1d7 1d7 1*2","8e 7 5 4 5qUK 3e 1e | 3qB 1e 7,e 1q 5,q | 1h_V",{cm:"1m7 1m7 1*2", sw:0.62}],
["g_blmoan","blues","1d7 4d7 1*2","8qUR 7e 5e 3q 1q | 5qUQ 3e 1e 7q 5,q | 1h_V",{cm:"1m7 4m7 1*2", sw:0.62}],
/* funk: two more */
["g_fkstab","funk","1d7 1d7 1*1","3s+7+1' x r 3+7+1' x x 3+7+9 x 3+7+1' x r 3+7+9 3+7+1' x 3+7+9 x | 3+7+1' x r 3+7+1' x x 3+7+9 x 3+7+1' x r 3+7+9 3+7+1' x 2+5+8 3+7+1' | 1q",{cm:"1m7 1m7 1*1"}],
["g_fkline","funk","1d7 1d7 1*1","1s x 2 3H 5 x 7 5 8 x 7 5 3 x 2 1 | 1 x 2 3H 5 x 7 5 8 7 5 3 2 3H 1 x | 1q",{cm:"1m7 1m7 1*1"}],
/* slow and singing: two more */
["g_slhymn","slow","1 4 1 5 1*2","3q 2q 1hV | 3q 2q 1hV | 3q. 4e 5q 3q | 5,q 7,q 1h | 1h_W"],
["g_slsigh","slow","1 6 4 5 1*2","5hU 3q 2q | 1hV 5,q 7,q | 3hU 1q 2q | 3q 2q 1q 5,q | 1h_W",{nm:"5hU 3q 2q | 1hV 5,q 7,q | 3hB 1q 2q | 3q 2q 1q 5,q | 1h_W"}],
/* reggae and ska */
["g_rgskank","reggae","1 4 1 5 1*2","rq 3q-^+5+8 rq 3q-^+5+8 | rq 3q-^+5+8 rq 3q-^+5+8 | rq 3q-^+5+8 rq 3q-^+5+8 | rq 3q-^+5+8 rq 3q-^+5+8 | 1h_+3+5"],
["g_rgska","reggae","1 6 4 5 1*2","re 3e-^+5+8 re 3e-^+5+8 re 3e-^+5+8 re 3e-^+5+8 | re 3e-^+5+8 re 3e-^+5+8 re 3e-^+5+8 re 3e-^+5+8 | re 3e-^+5+8 re 3e-^+5+8 re 3e-^+5+8 re 3e-^+5+8 | re 3e-^+5+8 re 3e-^+5+8 re 3e-^+5+8 re 3e-^+5+8 | 1h_+3+5"],
["g_rgline","reggae","1 4 1*2","rq 5e 6e 8q/ 6e 5e | 3q. 2e 1q 5,q | 1h_V"],
["g_rgoct","reggae","1 4 1*2","1e+8 x 3+3' x 5+5' x 3+3' 2+2' | 1+8 x 3+3' x 5+5' x 3+3' 2+2' | 1h_+8"],
["g_rgdub","reggae","1 1 1*2","1q.V re 5,q 6,q | 1hV rq 3q | 1h_W"],
["g_rgsteady","reggae","1 6 4 5 1*2","1e 3 5 6 5q rq | 1e 3 5 3 1q rq | 1e 3 5 6 5q rq | 1e 2 3 5 1q rq | 1h_"],
/* Motown and soul */
["g_mosixth","motown","1 4 1*2","3q/+8/ 4e+9 5e+3' 5q+3' 3q+8 | 3q/+8/ 4e+9 5e+3' 5q+3' 3q+8 | 3h_+8V"],
["g_mocurtis","motown","1 4 1*2","5e+8 5=+9H 5=+8O 3+5 1+3 1=+4H 1=+3O 5,e | 3+5 3=+6H 3=+5O 1+3 5,+1 5,=+2H 5,=+1O 3, | 1h_+3V"],
["g_mohook","motown","1 4 5 1*2","re 3e 5e 6e 8q/ 6e 5e | re 3e 5e 6e 8q/ 6e 5e | 3q 2e 1e 5,q 7,q | 1h_V"],
["g_mothird","motown","1 4 1*2","1q/+3/ 2e+4 x 3q+5 2e+4 1e+3 | 1q/+3/ 2e+4 x 3q+5 2e+4 1e+3 | 1h_+3V"],
["g_mostax","motown","1 4 1*2","5e+8 6H+9H 5O+8O 3+5 1q+3 re 3e+5 | 5e+8 6H+9H 5O+8O 3+5 1q+3 re 3e+5 | 1h_+3V"],
["g_mobend","motown","1 4 1*2","5qUR+8 3e+5 1e+3 5qU+8 3q+5 | 5qUR+8 3e+5 1e+3 5qU+8 3q+5 | 1h_V"],
/* Latin */
["g_ltsing","latin","1 4 1*2","1q 3e 5e 8qBVK 7e 5e | 3qU 2e 1e 5,q 1q | 1h_W",{cm:"1m7 4M 1*2", nm:"1q 3e 5e 8qUVK 7e 5e | 3qU 2e 1e 5,q 1q | 1h_W"}],
["g_ltbossa","latin","27 5d7 17 1*2","1q. 3e 5q 7q | 3q. 1e 7,q 5,q | 3h 7h | 8h_"],
["g_ltmontuno","latin","1 4 5 4 1*2","1e 5 3 5 8 5 3 5 | 1 5 3 5 8 5 3 5 | 1 5 3 5 8 5 3 5 | 1 5 3 5 8 5 3 5 | 1h_"],
["g_ltcumbia","latin","1 5 1*2","1e 3 5 3 5q 3e 2e | 3e 2 1 2 3q 5,q | 1h_"],
["g_ltbolero","latin","1 5d7 1*2","5q 4e 3e 1q 2q | 3q 2e 1e 7,q 5,q | 1h_V",{cm:"1m 5d7 1*2"}],
/* gospel */
["g_gssixth","gospel","1 4 1*2","5q+3' 6e+4' 5e+3' 3q+8 2q+7 | 5q+3' 6e+4' 5e+3' 3q+8 2q+7 | 3h_+8V"],
["g_gsrun","gospel","1d7 4 1*2","8q 7e 6e 5e b5e! 4e 3e | 1q 6,e 5,e 1q 3q | 1h_V",{cm:"1m7 4m 1*2"}],
["g_gsshout","gospel","1 4 1 4 1*2","3e+5+8 x 3+5+8 4+6+9 3+5+8 x 1+3+5 x | 3+5+8 x 3+5+8 4+6+9 3+5+8 x 1+3+5 x | 3+5+8 x 3+5+8 4+6+9 3+5+8 x 1+3+5 x | 3+5+8 x 3+5+8 4+6+9 3+5+8 x 1+3+5 x | 1h_+3+5"],
["g_gsturn","gospel","1*2 4*2 #4o*2 1*2 5d7*2 1*2","3e 5 8 5 | 3 1 5, 1 | 1 3 5 3 | 5 3 1 3 | 3 5 7 < | 1h_V",{cm:"1m*2 4m*2 #4o*2 1m*2 5d7*2 1*2"}],
["g_gssus","gospel","1 4 1*2","3q+8 4eH+8= 3O+8= 1q+5 2eH+5= 1O+5= | 3q+8 4eH+8= 3O+8= 1q+5 2eH+5= 1O+5= | 1h_+5V"],
/* punk */
["g_pkpower","punk","1 4 5 1*2","1e+5 1+5 1+5 1+5 1+5 1+5 1+5 1+5 | 1+5 1+5 1+5 1+5 1+5 1+5 1+5 1+5 | 1+5 1+5 1+5 1+5 1+5 1+5 1+5 1+5 | 1h_+5+8",{oct:0, pos:3}],
["g_pkpalm","punk","1 6 4 5 1*2","1e-+5 1-+5 1-+5 1-+5 1q+5+8 1q+5+8 | 1e-+5 1-+5 1-+5 1-+5 1q+5+8 1q+5+8 | 1e-+5 1-+5 1-+5 1-+5 1q+5+8 1q+5+8 | 1e-+5 1-+5 1-+5 1-+5 1q+5+8 1q+5+8 | 1h_+5+8",{oct:0, pos:3}],
["g_pkriff","punk","1 4 1*2","1e 1 3 1 5 1 3 1 | 1 1 3 1 5 1 3 1 | 1h_",{oct:0}],
["g_pkoct","punk","1 5 6 4 1*2","1e+8 1+8 3+3' 3+3' 5q+5' 3q+3' | 1e+8 1+8 3+3' 3+3' 5q+5' 3q+3' | 1e+8 1+8 3+3' 3+3' 5q+5' 3q+3' | 1e+8 1+8 3+3' 3+3' 5q+5' 3q+3' | 1h_+8"],
["g_pkfast","punk","1 6 4 5 1*2","1s- 1- 1- 1- 3- 3- 3- 3- 5- 5- 5- 5- 3- 3- 2- 2- | 1- 1- 1- 1- 3- 3- 3- 3- 5- 5- 5- 5- 3- 3- 2- 2- | 1- 1- 1- 1- 3- 3- 3- 3- 5- 5- 5- 5- 3- 3- 2- 2- | 1- 1- 1- 1- 3- 3- 3- 3- 5- 5- 5- 5- 3- 3- 2- 2- | 1h_"],
/* pop */
["g_pohook","pop","1 5 6 4 1*2","3q 2e 1e 1q 5,q | 3q 1e 2e 3q 5q | 1q 7,e 1e 3q 1q | 5q 3e 2e 1q 7,q | 1h_V"],
["g_poarp","pop","1 6 4 5 1*2","1e_ 5_ 8_ 3'_ 8_ 5_ 1_ 5_ | 1_ 5_ 8_ 3'_ 8_ 5_ 1_ 5_ | 1_ 5_ 8_ 3'_ 8_ 5_ 1_ 5_ | 1_ 5_ 8_ 3'_ 8_ 5_ 1_ 5_ | 1h_V"],
["g_poslide","pop","1 4 1*2","1q/ 3e 5e 5q/ 3q | 3q/ 2e 1e 1q/ 5,q | 1h_V"],
["g_pobend","pop","1 4 1*2","5qU 3e 2e 1q 3q | 3qUK 2e 1e 5,q 1q | 1h_V"],
["g_pothirds","pop","1 5 6 4 1*2","1e+3 2+4 3+5 2+4 1q+3 3q+5 | 1,e+3, 2,+4, 3,+5, 2,+4, 1,q+3, 3,q+5, | 1,e+3, 2,+4, 3,+5, 2,+4, 1,q+3, 3,q+5, | 1,e+3, 2,+4, 3,+5, 2,+4, 1,q+3, 3,q+5, | 1h_+3V"],
/* neo-soul */
["g_nsham","neosoul","17 47 17*2","1e+3 1=+4H 1=+3O 5,+1 3+5 3=+6H 3=+5O 1+3 | 1+3 1=+4H 1=+3O 5,+1 3+5 3=+6H 3=+5O 1+3 | 1h_+5+7V"],
["g_nsthumb","neosoul","1 4 1*2","1e+5+8 x 3+8 4H+8= 3O+8= 1+5 2H+5= 1O+5= | 1+5+8 x 3+8 4H+8= 3O+8= 1+5 2H+5= 1O+5= | 1h_+5+8"],
["g_nsseven","neosoul","47 37 27 17*2","1,e 2,H 3, 5, 7, 5, 3, 2, | 1, 2,H 3, 5, 7, 5, 3, 2, | 1 2H 3 5 7 5 3 2 | 1h_V"],
["g_nsshell","neosoul","27 5d7 17 1*2","3q/+7/ 3e+7 x 3q/+7/ 3q+7 | 7,q/+3/ 7,e+3 x 7,q/+3/ 7,q+3 | 3h/+7/ 3q+7 2q+6 | 1h_+5V"],
["g_nsghost","neosoul","17 47 1*2","1e. xs 5,e 7,e 1e xs 3s 2e 1e | 1e. xs 5,e 7,e 3e 2 1 7, | 1h_V",{sw:0.58}],
["g_nsslide","neosoul","17 47 1*2","5q/+7/ 3e+5 1+3 3q+5 1q+3 | 3q+5 1e+3 7,+2 1q+3 7,q+2 | 5,h_+1V"],
/* Afrobeat and highlife */
["g_afhigh","afro","1 4 1 5 1*2","8e 6 5 3 5 3 2 3 | 8 6 5 3 5 3 2 3 | 8 6 5 3 5 3 2 3 | 8 6 5 3 5 3 2 3 | 1h_"],
["g_afvamp","afro","1d7 1d7 1*2","1s x x 1 x 5, x 7, 1 x 3 x 5 x 3 1 | 1 x x 1 x 5, x 7, 1 x 3 x 5 x 3 1 | 1h_",{cm:"1m7 1m7 1*2"}],
["g_afinter","afro","1d7 4d7 1*2","rs 5 rs 8 rs 7 rs 5 rs 3 rs 5 rs 7 rs 8 | rs 5 rs 8 rs 7 rs 5 rs 3 rs 5 rs 7 rs 8 | 1h_",{cm:"1m7 4m7 1*2"}],
["g_afrun","afro","1 5 1*2","8s 6 5 3 5 6 8 6 5 3 2 1 2 3 5 3 | 3 2 1 2 3 5 3 2 1 2 3 2 1 7, 5, 7, | 1h_"],
["g_afpalm","afro","1 4 1 5 1*2","3e+5 1+3 2+4 1+3 3+5 2+4 3+5 1+3 | 3,+5, 1,+3, 2,+4, 1,+3, 3,+5, 2,+4, 3,+5, 1,+3, | 3+5 1+3 2+4 1+3 3+5 2+4 3+5 1+3 | 3,+5, 1,+3, 2,+4, 1,+3, 3,+5, 2,+4, 3,+5, 1,+3, | 1h_+3"],
/* surf */
["g_sftrem","surf","1 4 5d7 1*2","1qZ 2Z 3Z 5Z | 3Z 2Z 1Z 3Z | 3Z 4Z 5Z 7Z | 1hZ_",{cm:"1m 4m 5d7 1*2"}],
["g_sfriff","surf","1 4 1 5 1*2","1e. 1s 3e 1e 5qZ 3qZ | 1e. 1s 3e 1e 5qZ 3qZ | 1e. 1s 3e 1e 5qZ 3qZ | 1e. 1s 3e 1e 5qZ 3qZ | 1h_V",{oct:0}],
["g_sfdrop","surf","1 b7 b6 5M 1*2","1q 3e 5e 8q\\ 5q | 1,q 3,e 5,e 8,q\\ 5,q | 1,q 3,e 5,e 8,q\\ 5,q | 1,q 3,e 5,e 8,q\\ 5,q | 1h_W"],
["g_sftwang","surf","1 4 1*2","1q 3e 5e 5qV 6q | 3q 2e 1e 5,qV 1q | 1h_W",{oct:0}],
["g_sfdouble","surf","1 4 1 5 1*2","1qZ+3 2Z+4 3Z+5 2Z+4 | 1Z+3 2Z+4 3Z+5 2Z+4 | 1Z+3 2Z+4 3Z+5 2Z+4 | 3Z+5 2Z+4 1Z+3 2Z+4 | 1hZ_+3"],
/* slide and Delta blues */
["g_slbottle","slide","1d7 4d7 1*2","8q/V 7e~ 5e 3q 1q | 8q/V 7e~ 5e 3q 1q | 1h_W",{cm:"1m7 4m7 1*2"}],
["g_sldelta","slide","1d7 1d7 1*2","1e 5' 1 7' 1 5' 1 3' | 1 5' 1 7' 1 8' 7' 5' | 1h_",{cm:"1m7 1m7 1*2", oct:0, sw:0.62}],
["g_slturn","slide","1d7 5d7 1*2","7t+8 6+8 b6!+8 5q+8 1q 5,q | 3q 1q 7,q 5,q | 1h_V",{cm:"1m7 5d7 1*2"}],
["g_slcry","slide","1d7 4d7 1*2","5q/W 6e~ 5e~ 3qY 1q | 5q/W 6e~ 5e~ 3qY 1q | 1h_W",{cm:"1m7 4m7 1*2"}],
["g_slshuf","slide","1d7 1d7 1*2","1e 3 5 6 5 3 5 3 | 1 3 5 6 7 6 5 3 | 1h_",{cm:"1m7 1m7 1*2", oct:0, sw:0.66}],
/* fills and turnarounds */
["g_fiup","fills","1 4*2","1q 5,q 1s 2 3 5 6 8 7 < | 1h_"],
["g_fidown","fills","5d7 1*2","1q 5e 4e 3s 2 1 7, 6, 5, 4, 3, | 1h_"],
["g_fitap","fills","1 1 1*2","1q 3q 8tT 6O 7H 8T 6O 7H | 8T 6O 7H 8T 6O 7H 5T 3O 4H 5T 3O 4H | 1h_V"],
["g_fiblues","fills","1d7*2 4d7*2 1d7*2 5d7*2 1*2","1t 3 5 7 5 3 | 1 3 5 7 5 3 | 8 7 6 b6! 5 3 | 1 7, 5, 3, 2, < | 1h_",{cm:"1m7*2 4m7*2 1m7*2 5d7*2 1*2"}],
["g_fiend","fills","1 5d7 1*2","8qUQ 5e 3e 1e 3e 5q | 7q 5e 3e 1q <q | 1h_+5+8W"],
["g_fichrom","fills","1 4*2","1q 5,q 1e 2 b3! 3 | 1h_",{nm:"1q 5,q 1e 2 3 < | 1h_"}],
/* arena rock (in the style of the big 70s arena bands: Kiss) */
["g_arhook","arena","1 4 1 5 1*2","5q 5e 6e 5q 3q | 1q 1e 2e 3q 1q | 5qUV 3e 1e 3q 5q | 5q 3e 2e 1q 7,q | 1h_V"],
["g_ardstop","arena","1 4 1*2","5e+8 5+8 6+8 5+8 3q+5 1q+3 | 5e+8 5+8 6+8 5+8 3q+5 1q+3 | 1h_+5V"],
["g_arbend","arena","1 4 1*2","8qUV 7e 5e 3e 4e 5q | 5qUR 4e 3e 1q 5,q | 1h_W"],
["g_arriff","arena","1 b7 4 1*2","1q+5 re 1e+5 1q+5 1e+5 1+5 | 1q+5 re 1e+5 1q+5 1e+5 1+5 | 1q+5 re 1e+5 1q+5 1e+5 1+5 | 1h_+5+8",{oct:0, pos:3}],
["g_arpent","arena","1 4 1 5 1*2","1e 2 3 2 3 5 6 5 | 1 2 3 2 3 5 6 5 | 8 6 5 3 5 3 2 1 | 1 2 3 5 3 2 1 7, | 1h_V",{nm:"1e 3 4 3 5 7 5 4 | 1 3 4 3 5 7 5 4 | 8 7 5 4 5 4 3 1 | 1 3 4 5 3 1 7, 5, | 1h_V"}],
["g_arcall","arena","1 4 1*2","1q 3e 5e 8qUV 5q | rq 6e 5e 3q 1q | 1h_V"],
/* 80s hard rock (in the style of Van Halen) */
["g_hrtap","hard80","1 4 5 1*2","8tT 6O 7H 8T 6O 7H 5T 3O 4H 5T 3O 4H | 8T 6O 7H 8T 6O 7H 5T 3O 4H 5T 3O 4H | 8,T 6,O 7,H 8,T 6,O 7,H 5,T 3,O 4,H 5,T 3,O 4,H | 1h_V"],
["g_hrlegato","hard80","1 4 1*2","1s 3H 4 5H 7 8H 7O 5 8 7O 5 4O 3 1O 3H 1O | 1 3H 4 5H 7 8H 7O 5 8 7O 5 4O 3 1O 3H 1O | 1h_V"],
["g_hrdive","hard80","1 4 1*2","8qUQ 7e 5e 3qV 1q | 5qUR 4e 3e 1qV 5,q\\ | 1h_W"],
["g_hrblues","hard80","1d7 4d7 1*2","8eU 8U 7 8 5 b5! 4 3 | 8qUV 7e 5e 3q 1q | 1h_V",{cm:"1m7 4m7 1*2"}],
["g_hrrun","hard80","1 1*2","8f 7 5 4 3 1 7 5 4 3 1 7, 5 4 3 1 7, 5, 4 3 1 7, 5, 4, | 1h_V"],
["g_hrtrill","hard80","1 4 1*2","5s 6H 5O 6H 5O 6H 5O 6H 5O 6H 5O 6H 5O 6H 5O 6H | 8qUQ 7e 5e 3q 1q\\ | 1h_W"],
/* thrash metal (in the style of Kirk Hammett) */
["g_thgallop","thrash","1 1 b6 5 1*2","1e-+5 1s-+5 1-+5 1e-+5 1s-+5 1-+5 1e-+5 1s-+5 1-+5 3e 2e | 1e-+5 1s-+5 1-+5 1e-+5 1s-+5 1-+5 1e-+5 1s-+5 1-+5 3e 2e | 1e-+5 1s-+5 1-+5 1e-+5 1s-+5 1-+5 1e-+5 1s-+5 1-+5 1e-+5 1s-+5 1-+5 | 1e-+5 1s-+5 1-+5 1e-+5 1s-+5 1-+5 1e-+5 1s-+5 1-+5 1e-+5 1s-+5 1-+5 | 1h_+5+8",{oct:0, pos:3}],
["g_thwah","thrash","1 4 1*2","5qU 5eUR 3e 1e 3e 4eB 5e | 8qUV 7e 5e 3e 4eB 1q | 1h_W",{nm:"5qU 5eUR 3e 1e 3e 4eU 5e | 8qUV 7e 5e 3e 4eU 1q | 1h_W"}],
["g_thtrem","thrash","1 b2 1 b7 1*2","8qZ 5Z 3Z 5Z | 8Z 5Z 3Z 5Z | 8Z 5Z 3Z 5Z | 8Z 5Z 3Z 5Z | 1hZ_"],
["g_thchrom","thrash","1 1 1*2","1e- 1- 3 1- 5 b5! 4 3 | 1- 1- b2! 1- 3 2 b2! 1 | 1h_+5",{oct:0}],
["g_thrun","thrash","1 1 1*2","8sU 8 7 5 8U 8 7 5 8U 8 7 5 8U 8 7 5 | 5U 5 4 3 5U 5 4 3 1 3 4 b5! 5 4 3 1 | 1h_W"],
["g_thbreak","thrash","1 4 5 1*2","8qUK 7e 5e 3q 1q | 5qUK 3e 1e 3q 1q | 5qUKV 4e 3e 1e 7,e 5,q | 1h_W"],
/* groove metal (in the style of Dimebag Darrell) */
["g_grsqueal","groove","1 1 1*2","1e- 1- 5Q 1- 3 1- b2! 1 | 1- 1- 5Q 1- 3 1- 7, 1- | 1h_+5",{oct:0}],
["g_grwide","groove","1 4 1*2","8hUW 5q 3qB | 1q 3e 4e 5qUW 3q | 1h_W"],
["g_grslide","groove","1 1 1*2","1e- 1- 4 3~ 5 b5!~ 4~ 3 | 1- 1- 8Q 1- 5 b5!~ 4~ 3 | 1h_+5",{oct:0}],
["g_grblues","groove","1 4 1 5 1*2","1e 3 4 b5! 5qW 3q | 8qUR 7e 5e 3q 1q | 5eU 5U 3 1 3qY 1q | 5qQ 4e 3e 1q 7,q | 1h_W"],
["g_grchug","groove","1 b7 1*2","1e-+5 re 1e-+5 1s-+5 1-+5 1q+5 8qQ | 1e-+5 re 1e-+5 1s-+5 1-+5 1q+5 8qQ | 1h_+5+8",{oct:0, pos:3}],
["g_grclimb","groove","1 1 1*2","1e 8Q 1 8Q 3 8Q 5 8Q | 5qUQW 3e 1e 3eB 1e 5,q | 1h_W"],
/* disco */
["g_dsscratch","disco","1 4 1*2","3s+5+8 x x x 3+5+8 x x x 3+5+8 x 3+5+8 x x x 3+5+8 x | 3+5+8 x x x 3+5+8 x x x 3+5+8 x 3+5+8 x x x 3+5+8 x | 1h_+3+5"],
["g_dsoct","disco","1 4 1*2","1s+8 x 1+8 x 3+3' x 1+8 x 5+5' x 3+3' x 6+6' x 5+5' x | 1+8 x 1+8 x 3+3' x 1+8 x 5+5' x 3+3' x 6+6' x 5+5' x | 1h_+8"],
["g_dsseven","disco","17 47 1*2","3e+5+7 3-^+5+7 x 3^+5+7 3+5+7 3-^+5+7 x 3^+5+7 | 3+5+7 3-^+5+7 x 3^+5+7 3+5+7 3-^+5+7 x 3^+5+7 | 1h_+3+5"],
["g_dsline","disco","1 4 1*2","1s x 8 x 5 x 8 x 1 x 8 x 6 5 3 2 | 1 x 8 x 5 x 8 x 1 x 8 x 6 5 3 2 | 1h_"],
["g_dsfloor","disco","1 6 4 5 1*2","3e-+5+8 x 3-^+5+8 x 3-+5+8 x 3-^+5+8 3+5+8 | 3-+5+8 x 3-^+5+8 x 3-+5+8 x 3-^+5+8 3+5+8 | 3-+5+8 x 3-^+5+8 x 3-+5+8 x 3-^+5+8 3+5+8 | 3-+5+8 x 3-^+5+8 x 3-+5+8 x 3-^+5+8 3+5+8 | 1h_+3+5"],
/* hip-hop and R&B */
["g_hhstab","hiphop","17 47 1*2","3q+5+7 re 3e+5+7 rq 3e+5+7 3+5+7 | 3q+5+7 re 3e+5+7 rq 3e+5+7 3+5+7 | 1h_+3+5",{sw:0.58}],
["g_hhslide","hiphop","17 47 1*2","1q 3e 5e 7q/ 5q | 3q/ 2e 1e 7,q 5,q | 1h_V"],
["g_hhhook","hiphop","1 6 1*2","5e 6 5 3 rq 3e 2e | 3e 5 3 1 rq 1e 7,e | 1h_V"],
["g_hhlazy","hiphop","17 47 1*2","1e. xs 3e 5e 7e 5e 3e 1e | 1e. xs 3e 5e 7e 5e 3e 1e | 1h_",{sw:0.58}],
["g_hhdouble","hiphop","1 4 1*2","3q/+5/ 3e+5 2+4 1q+3 rq | 3q/+5/ 3e+5 2+4 1q+3 rq | 1h_+3V"],
/* drum and bass */
["g_dnliquid","dnb","17 47 1*2","1s 3 5 7 8 7 5 3 5 7 8 9 8 7 5 3 | 1 3 5 7 8 7 5 3 5 7 8 9 8 7 5 3 | 1h_V"],
["g_dnswell","dnb","17 67 47 1*2","3q.+5+7 3e+5+7 3h_+5+7 | 7,q.+3+5 7,e+3+5 7,h_+3+5 | 3q.+5+7 3e+5+7 3h_+5+7 | 1h_+3+5"],
["g_dnrun","dnb","17 47 1*2","1f 2 3 5 7 8 9 8 7 5 3 2 3 5 7 8 7 5 3 2 1 7, 5, 7, | rq 3e 5e 7q 8q | 1h_V"],
["g_dnstab","dnb","1 6 1*2","3e.+5+8 3e.+5+8 3e+5+8 3h+5+8 | 3e.+5+8 3e.+5+8 3e+5+8 3h+5+8 | 1h_+3+5"],
["g_dnhalf","dnb","17 47 1*2","5h/V 3q 2q | 3hV 1q 2q | 1h_V"]
];
/* the groups: the first eight (more licks in each) and the new ones; aog-solo.js puts them in the menu's order (LICK_GROUP_ORDER) */
const OLD=["blues","rock","metal","shred","funk","country","jazz","slow"];
const NEW=["reggae","motown","latin","gospel","punk","pop","neosoul","afro","surf","slide","fills","arena","hard80","thrash","groove","disco","hiphop","dnb"];
const GROUPS=OLD.concat(NEW).map(g=>[g, RAW.filter(r=>r[1]===g).map(r=>r[0])]).filter(g=>g[1].length);
const ORDER=[].concat(...GROUPS.map(g=>g[1]));
const LICKS={}; RAW.forEach(([id, g, ch, n, x])=>{ LICKS[id]=Object.assign({id, g, ch, n}, x||{}); });

/* ══ the words: the new groups, each lick's name and its one line, English and Spanish ═════════════════════════════ */
const W={
  lg_reggae:["Reggae and ska","Reggae y ska"], lg_motown:["Motown and soul","Motown y soul"], lg_latin:["Latin","Latino"], lg_gospel:["Gospel","Gospel"],
  lg_punk:["Punk","Punk"], lg_pop:["Pop","Pop"], lg_neosoul:["Neo-soul","Neo-soul"], lg_afro:["Afrobeat and highlife","Afrobeat y highlife"],
  lg_surf:["Surf","Surf"], lg_slide:["Slide and Delta blues","Slide y blues del Delta"], lg_fills:["Fills and turnarounds","Rellenos y vueltas"],
  g_blbox:["Bend in the box","Estirón en la caja","Down the box. Drag the pick over muted strings into a bend. Then a small bend to the third, and home.","Baja por la caja. Arrastra la púa por cuerdas apagadas hasta un estirón. Luego un estirón pequeño a la tercera y a casa."],
  g_blmoan:["Bend and let it fall","Estira y deja caer","Bend up to the home note and let it fall back. On the four chord, a squealing bend.","Estira hasta la nota casa y deja que baje. En el acorde cuatro, un estirón que chilla."],
  g_fkstab:["Funky chord scratches","Rasgueos funky de acorde","Three strings at once, short, with muted scratches between. Keep the hand moving.","Tres cuerdas a la vez, cortas, con rasgueos apagados entre medio. Que la mano no pare."],
  g_fkline:["Funk line with hammers","Línea funky con ligados","Sixteenths up the chord, a hammer from the second to the third, muted hits between.","Semicorcheas por el acorde, un ligado de la segunda a la tercera y golpes apagados entre medio."],
  g_slhymn:["Hymn melody","Melodía de himno","A slow, simple tune over four chords. Hold each long note and let it shake a little.","Una melodía lenta y sencilla sobre cuatro acordes. Sostén cada nota larga y deja que vibre un poco."],
  g_slsigh:["Singing bends","Estirones que cantan","Slow bends that land on the chord's notes. Four chords, one bar each.","Estirones lentos que caen en las notas del acorde. Cuatro acordes, un compás cada uno."],
  g_rgskank:["One-drop skank","Skank de one drop","Short chords on beats two and four, strummed up from the high string.","Acordes cortos en los tiempos dos y cuatro, rasgueados hacia arriba desde la cuerda aguda."],
  g_rgska:["Ska upstrokes","Rasgueos de ska","A short chord on every off-beat, strummed up. Fast and bright.","Un acorde corto en cada contratiempo, rasgueado hacia arriba. Rápido y brillante."],
  g_rgline:["Reggae melody","Melodía de reggae","A rest on the one, a slide up to the home note, then a gentle walk down.","Un silencio en el uno, un deslizamiento hasta la nota casa y luego un paseo suave hacia abajo."],
  g_rgoct:["Reggae octaves","Octavas de reggae","The same note on two strings at once, an octave apart, with muted hits between.","La misma nota en dos cuerdas a la vez, a una octava, con golpes apagados entre medio."],
  g_rgdub:["Dub space","Espacio dub","Few notes and lots of room. Let each one ring and shake.","Pocas notas y mucho espacio. Deja que cada una suene y vibre."],
  g_rgsteady:["Rock steady line","Línea de rock steady","Up the chord in eighths, then a rest. The same shape on four chords.","Sube por el acorde en corcheas y luego un silencio. La misma figura en cuatro acordes."],
  g_mosixth:["Soul sixths","Sextas de soul","Two strings at once, a sixth apart. Slide into place, then step up.","Dos cuerdas a la vez, a una sexta. Deslízate a tu sitio y luego sube un paso."],
  g_mocurtis:["Sweet soul fill","Relleno dulce de soul","Two strings at once. Hold one and hammer the other up a step, then back.","Dos cuerdas a la vez. Sostén una y liga la otra un paso arriba; luego vuelve."],
  g_mohook:["Soul answer","Respuesta de soul","A short answer after a rest, sliding up to the home note each time.","Una respuesta corta después de un silencio, que se desliza hasta la nota casa cada vez."],
  g_mothird:["Sliding thirds","Terceras deslizadas","Two strings at once, a third apart. Slide in, step up, step back.","Dos cuerdas a la vez, a una tercera. Desliza, sube un paso y vuelve."],
  g_mostax:["Memphis double-stops","Dos cuerdas de Memphis","Two strings at once: hammer both up a step, pull both back, then down the chord.","Dos cuerdas a la vez: liga las dos un paso arriba, suéltalas y baja por el acorde."],
  g_mobend:["Bend under a ringing note","Estirón bajo una nota que suena","Bend one string up while the string beside it keeps ringing.","Estira una cuerda mientras la de al lado sigue sonando."],
  g_ltsing:["Singing Latin rock","Rock latino que canta","Up the chord to a long bend that shakes. Drag the pick over muted strings into it.","Sube por el acorde hasta un estirón largo que vibra. Arrastra la púa por cuerdas apagadas hasta él."],
  g_ltbossa:["Bossa line","Línea de bossa","A calm line that pushes a little ahead of the beat, over the two, five and one chords.","Una línea tranquila que se adelanta un poco al pulso, sobre los acordes dos, cinco y uno."],
  g_ltmontuno:["Montuno pattern","Patrón de montuno","Eighths that bounce between the chord's notes, the same shape on each chord.","Corcheas que saltan entre las notas del acorde, la misma figura en cada acorde."],
  g_ltcumbia:["Cumbia melody","Melodía de cumbia","A bright tune that sways over two chords.","Una melodía brillante que se mece sobre dos acordes."],
  g_ltbolero:["Bolero melody","Melodía de bolero","A slow, romantic tune that leans on the five chord before it comes home.","Una melodía lenta y romántica que se apoya en el acorde cinco antes de volver a casa."],
  g_gssixth:["Church sixths","Sextas de iglesia","Two strings at once, a sixth apart, walking up and down like a choir.","Dos cuerdas a la vez, a una sexta, que suben y bajan como un coro."],
  g_gsrun:["Gospel run down","Bajada de gospel","Down the scale with one blue note, then a warm landing on the four chord.","Baja por la escala con una nota blue y luego un aterrizaje cálido en el acorde cuatro."],
  g_gsshout:["Shout chords","Acordes de shout","Three strings at once in eighths, a quick step up and back, muted hits between.","Tres cuerdas a la vez en corcheas, un paso rápido arriba y de vuelta, golpes apagados entre medio."],
  g_gsturn:["Gospel turnaround","Vuelta de gospel","Six short chords at the end of a song, with a passing chord that climbs.","Seis acordes cortos al final de una canción, con un acorde de paso que sube."],
  g_gssus:["Hold and hammer","Sostén y liga","Hold the top note. Hammer the lower one up a step and back, on each chord.","Sostén la nota de arriba. Liga la de abajo un paso arriba y vuelve, en cada acorde."],
  g_pkpower:["Power chord eighths","Corcheas con quintas","Root and fifth together, eight down-strokes a bar, on three chords.","Raíz y quinta juntas, ocho golpes hacia abajo por compás, en tres acordes."],
  g_pkpalm:["Muted and open","Apagado y abierto","Four short, muted hits, then two full chords. Four chords around.","Cuatro golpes cortos y apagados y luego dos acordes completos. Cuatro acordes."],
  g_pkriff:["Low punk riff","Riff grave de punk","A fast riff on the thick strings that keeps coming back to the home note.","Un riff rápido en las cuerdas gruesas que siempre vuelve a la nota casa."],
  g_pkoct:["Octave melody","Melodía en octavas","A melody on two strings at once, an octave apart, over four chords.","Una melodía en dos cuerdas a la vez, a una octava, sobre cuatro acordes."],
  g_pkfast:["Fast sixteenths","Semicorcheas rápidas","Four quick picks on each note, up the chord and back. Keep them short.","Cuatro púas rápidas en cada nota, subiendo por el acorde y de vuelta. Que sean cortas."],
  g_pohook:["Pop hook","Gancho pop","A tune to sing over four chords. Easy to hum, easy to remember.","Una melodía para cantar sobre cuatro acordes. Fácil de tararear y de recordar."],
  g_poarp:["Ringing arpeggios","Arpegios que suenan","One note at a time, up and down each chord. Let every note ring.","Una nota a la vez, subiendo y bajando por cada acorde. Deja sonar cada nota."],
  g_poslide:["Slide into the chorus","Deslízate al estribillo","Slide into each strong note, then a short step down.","Desliza hasta cada nota fuerte y luego un paso corto hacia abajo."],
  g_pobend:["Pop-rock bend","Estirón de pop rock","A bend to the chord's fifth, a walk down, then a raked bend on the four chord.","Un estirón hasta la quinta del acorde, un paseo hacia abajo y luego un estirón con rasgueo en el acorde cuatro."],
  g_pothirds:["Thirds that step","Terceras que caminan","Two strings at once, a third apart, stepping up and back on four chords.","Dos cuerdas a la vez, a una tercera, que suben y vuelven en cuatro acordes."],
  g_nsham:["Hammer-on double-stops","Dos cuerdas con ligados","Hold the low note and hammer the high one up a step and back. Smooth and warm.","Sostén la nota grave y liga la aguda un paso arriba y de vuelta. Suave y cálido."],
  g_nsthumb:["Chord with hammer-ons","Acorde con ligados","A chord, then small hammers and pull-offs inside its shape.","Un acorde y luego pequeños ligados dentro de su forma."],
  g_nsseven:["Seventh-chord run","Carrera por acordes de séptima","The same small run on four seventh chords, one chord a bar.","La misma carrera pequeña en cuatro acordes de séptima, un acorde por compás."],
  g_nsshell:["Two-note jazz chords","Acordes de jazz con dos notas","Just the third and the seventh of each chord, sliding in from below.","Solo la tercera y la séptima de cada acorde, deslizándose desde abajo."],
  g_nsghost:["Laid-back ghost notes","Notas fantasma relajadas","A lazy, swinging line with soft muted notes in the gaps.","Una línea relajada y con swing, con notas apagadas suaves en los huecos."],
  g_nsslide:["Thirds with a slide","Terceras con deslizamiento","Slide into two strings at once, then step down the chord in thirds.","Desliza hasta dos cuerdas a la vez y luego baja por el acorde en terceras."],
  g_afhigh:["Highlife picking","Punteo de highlife","Bright eighths that dance down from the high home note, on four chords.","Corcheas brillantes que bajan bailando desde la nota casa aguda, en cuatro acordes."],
  g_afvamp:["Afrobeat vamp","Vamp de afrobeat","One busy bar again and again: real notes and muted hits, tight with the drums.","Un compás movido una y otra vez: notas reales y golpes apagados, junto con la batería."],
  g_afinter:["Off-beat second guitar","Segunda guitarra a contratiempo","Notes only between the beats, to fit around another guitar.","Notas solo entre los tiempos, para encajar con otra guitarra."],
  g_afrun:["Bright sixteenth run","Carrera brillante en semicorcheas","Fast, happy runs down and up the scale, on two chords.","Carreras rápidas y alegres por la escala, bajando y subiendo, en dos acordes."],
  g_afpalm:["Palm-wine thirds","Terceras de palm-wine","Two strings at once, a third apart, rocking gently on four chords.","Dos cuerdas a la vez, a una tercera, que se mecen suavemente en cuatro acordes."],
  g_sftrem:["Tremolo melody","Melodía en trémolo","Pick each note very fast, again and again, while the tune moves slowly.","Toca cada nota muy rápido, una y otra vez, mientras la melodía avanza despacio."],
  g_sfriff:["Surf riff","Riff de surf","A low, driving riff. Each bar ends with fast-picked notes.","Un riff grave y con empuje. Cada compás termina con notas tocadas muy rápido."],
  g_sfdrop:["Surf falls","Caídas de surf","Up the chord, then let the top note fall away. Four chords, going down.","Sube por el acorde y deja caer la nota de arriba. Cuatro acordes que bajan."],
  g_sftwang:["Twangy low melody","Melodía grave con twang","A simple tune on the thick strings. Shake the long notes.","Una melodía sencilla en las cuerdas gruesas. Haz vibrar las notas largas."],
  g_sfdouble:["Tremolo double-stops","Dos cuerdas en trémolo","Two strings at once, picked very fast, stepping up and back.","Dos cuerdas a la vez, tocadas muy rápido, que suben un paso y vuelven."],
  g_slbottle:["Bottleneck slides","Deslizamientos de bottleneck","Slide up into the high home note with a wide shake, then glide down.","Desliza hasta la nota casa aguda con un vibrato ancho y luego baja deslizando."],
  g_sldelta:["Delta thumb and fingers","Pulgar y dedos del Delta","The thumb keeps the low home note going. The fingers play high notes between.","El pulgar mantiene la nota casa grave. Los dedos tocan notas agudas entre medio."],
  g_slturn:["Delta turnaround","Vuelta del Delta","A high note rings while the line next to it walks down, step by step.","Una nota aguda suena mientras la línea de al lado baja, paso a paso."],
  g_slcry:["Slide cry","Lamento con slide","Slide in with a wide shake, nudge up and back, and a little curl on the third.","Desliza con un vibrato ancho, sube un poco y vuelve, y un pequeño estirón en la tercera."],
  g_slshuf:["Delta boogie","Boogie del Delta","A swinging low boogie up to the sixth and the flat seven, and back.","Un boogie grave con swing que sube a la sexta y a la séptima bemol, y vuelve."],
  g_fiup:["Run up to the four","Carrera hacia el cuatro","Two plain beats, then fast notes up the scale into the four chord.","Dos tiempos sencillos y luego notas rápidas que suben por la escala hasta el acorde cuatro."],
  g_fidown:["Run down home","Carrera de vuelta a casa","On the five chord, down the scale in fast notes to the home note.","En el acorde cinco, baja por la escala en notas rápidas hasta la nota casa."],
  g_fitap:["Tapped triplets","Tresillos con tapping","Tap high, pull off, hammer on: three notes on one string, then on the next string.","Golpea arriba, suelta, liga: tres notas en una cuerda y luego en la cuerda siguiente."],
  g_fiblues:["Blues turnaround fill","Relleno de vuelta de blues","Four chords, two beats each, in triplets, then a half step home.","Cuatro acordes de dos tiempos, en tresillos, y medio tono hasta casa."],
  g_fiend:["The big ending","El gran final","A squealing bend, a run down, the five chord, then one big chord that shakes.","Un estirón que chilla, una carrera hacia abajo, el acorde cinco y un gran acorde que vibra."],
  g_fichrom:["Half steps into the four","Semitonos hacia el cuatro","Up from the home note in small steps. The last one is a half step into the four chord.","Sube desde la nota casa a pasos pequeños. El último es medio tono hacia el acorde cuatro."],
  lg_arena:["Arena rock","Rock de estadio"], lg_hard80:["80s hard rock","Hard rock de los 80"], lg_thrash:["Thrash metal","Thrash metal"], lg_groove:["Groove metal","Groove metal"],
  lg_disco:["Disco","Disco"], lg_hiphop:["Hip-hop and R&B","Hip-hop y R&B"], lg_dnb:["Drum and bass","Drum and bass"],
  g_arhook:["Sing-along hook","Gancho para cantar","A big, simple tune a whole crowd could sing. One bend that shakes in the middle.","Una melodía grande y sencilla que todo un estadio podría cantar. Un estirón que vibra en medio."],
  g_ardstop:["Ringing double-stops","Dos cuerdas que suenan","Two strings at once, a step up and back, then down the chord.","Dos cuerdas a la vez, un paso arriba y de vuelta, y luego bajando por el acorde."],
  g_arbend:["Big bend and shake","Gran estirón con vibrato","Bend up to the high home note and shake it. On the four chord, bend and let it back down.","Estira hasta la nota casa aguda y hazla vibrar. En el acorde cuatro, estira y deja que vuelva."],
  g_arriff:["Anthem power chords","Quintas de himno","Root and fifth together, with a gap to breathe. Three chords, then one big ending.","Raíz y quinta juntas, con un hueco para respirar. Tres acordes y un gran final."],
  g_arpent:["Five-note scale run","Carrera de cinco notas","Eighths up and down the five-note scale, on four chords.","Corcheas que suben y bajan por la escala de cinco notas, en cuatro acordes."],
  g_arcall:["Shout and answer","Grito y respuesta","Up the chord to a bend: that is the call. A rest, then a short answer down.","Sube por el acorde hasta un estirón: es la pregunta. Un silencio y luego una respuesta corta hacia abajo."],
  g_hrtap:["Tapped arpeggios","Arpegios con tapping","Tap with a right-hand finger, pull off, hammer on. Three notes on one string, again and again.","Golpea con un dedo de la mano derecha, suelta y liga. Tres notas en una cuerda, una y otra vez."],
  g_hrlegato:["Hammer and pull run","Carrera ligada","Pick less, slur more. Hammer up the scale and pull off on the way down.","Usa menos la púa y liga más. Liga subiendo por la escala y suelta al bajar."],
  g_hrdive:["Squeal and dive","Chillido y caída","A bend that squeals, a walk down, and the last note dives away.","Un estirón que chilla, un paseo hacia abajo y la última nota cae en picado."],
  g_hrblues:["Bluesy hard rock","Hard rock con blues","Two quick bends, then down the scale through one blue note.","Dos estirones rápidos y luego bajando por la escala con una nota blue."],
  g_hrrun:["Lightning run down","Carrera de rayo","Six fast notes a beat, all the way down the scale.","Seis notas rápidas por tiempo, bajando por toda la escala."],
  g_hrtrill:["Trill, then dive","Trino y caída","Hammer and pull between two notes very fast. Then a squealing bend and a dive.","Liga y suelta entre dos notas muy rápido. Luego un estirón que chilla y una caída."],
  g_thgallop:["Galloping riff","Riff al galope","Low, short and muted: one long and two short, like a horse running.","Grave, corto y apagado: una larga y dos cortas, como un caballo al galope."],
  g_thwah:["Wailing bends","Estirones que gimen","Bend the same note again and again so it cries. Let one come back down.","Estira la misma nota una y otra vez para que llore. Deja que una vuelva a bajar."],
  g_thtrem:["Dark tremolo line","Línea oscura en trémolo","Pick each note very fast while the chords move a half step. Dark and tense.","Toca cada nota muy rápido mientras los acordes se mueven medio tono. Oscuro y tenso."],
  g_thchrom:["Half-step riff","Riff de semitonos","A low, muted riff that creeps by half steps back to the home note.","Un riff grave y apagado que se arrastra por semitonos hasta la nota casa."],
  g_thrun:["Speed bends","Estirones veloces","Sixteenths: a bend, the note above, and down. Then a fast run through a blue note.","Semicorcheas: un estirón, la nota de arriba y abajo. Luego una carrera rápida con una nota blue."],
  g_thbreak:["Raked solo break","Solo con rasgueo","Drag the pick over muted strings into each bend. Three chords, then home.","Arrastra la púa por cuerdas apagadas hasta cada estirón. Tres acordes y a casa."],
  g_grsqueal:["Squealing low riff","Riff grave que chilla","Short, heavy notes on the thick strings. Pinch the high note so it squeals.","Notas cortas y pesadas en las cuerdas gruesas. Pellizca la nota aguda para que chille."],
  g_grwide:["Wide bend, wide shake","Estirón ancho, vibrato ancho","A long bend with a big, slow shake. Then a small bend and a climb.","Un estirón largo con un vibrato grande y lento. Luego un estirón pequeño y una subida."],
  g_grslide:["Sliding riff","Riff deslizado","A heavy riff. Slide down by half steps, with a squeal in the second bar.","Un riff pesado. Deslízate hacia abajo por semitonos, con un chillido en el segundo compás."],
  g_grblues:["Blues gone heavy","Blues pesado","Blues moves played hard: a blue note, wide shakes, a curl and a squeal.","Frases de blues tocadas con fuerza: una nota blue, vibratos anchos, un pequeño estirón y un chillido."],
  g_grchug:["Stop-start chug","Riff que para y arranca","Root and fifth, short and muted, with gaps. A squeal ends each bar.","Raíz y quinta, cortas y apagadas, con huecos. Un chillido cierra cada compás."],
  g_grclimb:["Octave squeals","Chillidos en octava","A low note, then a squealing high one, climbing up the chord.","Una nota grave y luego una aguda que chilla, subiendo por el acorde."],
  g_dsscratch:["Chicken scratch","Rasgueo chicken scratch","Muted strums in sixteenths, with a short chord on some of them.","Rasgueos apagados en semicorcheas, con un acorde corto en algunos."],
  g_dsoct:["Disco octave line","Línea disco en octavas","The same note on two strings, an octave apart, bouncing with muted hits.","La misma nota en dos cuerdas, a una octava, rebotando con golpes apagados."],
  g_dsseven:["Seventh-chord strum","Rasgueo de séptimas","Down and up strums on seventh chords. Keep the hand moving like a clock.","Rasgueos hacia abajo y hacia arriba en acordes de séptima. Que la mano se mueva como un reloj."],
  g_dsline:["Disco single-note line","Línea disco de una nota","Low and high home notes with muted hits between, then a short run down.","Notas casa grave y aguda con golpes apagados entre medio y luego una bajada corta."],
  g_dsfloor:["Dance-floor chords","Acordes para la pista","Short chords on every beat and upstrokes between, on four chords.","Acordes cortos en cada tiempo y rasgueos hacia arriba entre medio, en cuatro acordes."],
  g_hhstab:["Laid-back chord stabs","Golpes de acorde relajados","Seventh chords, short and lazy, with lots of room around them.","Acordes de séptima, cortos y relajados, con mucho espacio alrededor."],
  g_hhslide:["Slide to the seventh","Deslízate a la séptima","Up the chord, then slide into the seventh. A smooth walk down on the four chord.","Sube por el acorde y desliza hasta la séptima. Un paseo suave hacia abajo en el acorde cuatro."],
  g_hhhook:["Short hook","Gancho corto","A short tune, a rest, a short answer. Easy to loop.","Una melodía corta, un silencio y una respuesta corta. Fácil de repetir."],
  g_hhlazy:["Lazy groove","Groove relajado","Up and down a seventh chord, a little late, with one soft muted note.","Sube y baja por un acorde de séptima, un poco tarde, con una nota apagada suave."],
  g_hhdouble:["Sliding double-stops","Dos cuerdas deslizadas","Slide into two strings at once, step down the chord, then rest.","Desliza hasta dos cuerdas a la vez, baja por el acorde y descansa."],
  g_dnliquid:["Liquid line","Línea líquida","Smooth sixteenths up and down a seventh chord. Keep it even and soft.","Semicorcheas suaves que suben y bajan por un acorde de séptima. Parejas y suaves."],
  g_dnswell:["Floating chords","Acordes que flotan","Seventh chords held long while the drums race underneath.","Acordes de séptima largos mientras la batería corre por debajo."],
  g_dnrun:["Jazzy run","Carrera con jazz","Six notes a beat up and down the chord, then a few calm notes.","Seis notas por tiempo subiendo y bajando por el acorde, y luego unas pocas notas tranquilas."],
  g_dnstab:["Off-beat stabs","Golpes a contratiempo","Three quick chords that push ahead of the beat, then one long one.","Tres acordes rápidos que se adelantan al pulso y luego uno largo."],
  g_dnhalf:["Slow tune over fast drums","Melodía lenta sobre batería rápida","A few long notes. Slide into the first one and let each one shake.","Pocas notas largas. Desliza hasta la primera y deja que cada una vibre."]
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
const PART=/^(r|x|<|>|\[|\]|[b#]?[1-9])([,']*)([whqestf]\.?)?([HOTGKZBUYRVWQ~!_\-\/\\=^]*)(@[EADGBe])?$/;
function parseNotes(spec){
  const out=[]; let t=0, dur=0.5;
  spec.trim().split(/\s+/).forEach(tok=>{
    if(tok==="|") return;
    const parts=[]; let tm="";
    tok.split("+").forEach(s=>{
      const m=PART.exec(s); if(!m) throw new Error("note "+tok);
      if(m[3]) dur=DUR[m[3][0]]*(m[3].length>1?1.5:1);
      const oct=(m[2].match(/'/g)||[]).length-(m[2].match(/,/g)||[]).length, mods=m[4]||"";
      parts.push({p:m[1], oct, mods, str:m[5]?STRS.indexOf(m[5][1]):-1}); tm+=mods;
    });
    if(parts.length>1 && parts.some(q=>/^[rx<>\[\]]$/.test(q.p))) throw new Error("a double-stop of plain notes only: "+tok);
    if(parts[0].p!=="r") out.push({t:+t.toFixed(6), slot:dur, parts, tm});
    t+=dur;
  });
  return {list:out, beats:+t.toFixed(6)};
}
function scaleBelow(rel, minor, dir){
  const SC=minor?MIN:MAJ; for(let i=1;i<=2;i++){ const r=rel+dir*i; if(SC.indexOf(((r%12)+12)%12)>=0) return r; } return rel+dir;
}
/* the lick in the key: each note's pitch above the key's home note (rel: the note written; frel: where the finger is) */
function resolve(def, minor){
  const chs=parseChords(minor && def.cm ? def.cm : def.ch, minor), P=parseNotes(minor && def.nm ? def.nm : def.n), L=P.list;
  const chordBeats=chs[chs.length-1].t1;
  if(chs[chs.length-1].t1<P.beats) chs[chs.length-1].t1=P.beats;
  let prev=null;
  L.forEach(e=>{
    const c=chordAt(chs, e.t); e.chord=c;
    e.short=e.tm.indexOf("-")>=0; e.full=e.tm.indexOf("_")>=0; e.trem=e.tm.indexOf("Z")>=0; e.rake=e.tm.indexOf("K")>=0; e.up=e.tm.indexOf("^")>=0;
    if(e.parts.length===1 && e.parts[0].p==="x"){ if(!prev) throw new Error("x first"); e.ghostOf=prev; prev=e; return; }
    e.parts.forEach(q=>{
      const md=q.mods;
      q.k=/G/.test(md)?"g":/H/.test(md)?"h":/O/.test(md)?"o":/~/.test(md)?"h":/T/.test(md)?"t":"p";
      q.slide=/~/.test(md)?"from":/\//.test(md)?"in":/\\/.test(md)?"fall":"";
      q.bend=/U/.test(md)?2:/B/.test(md)?1:0; q.back=/R/.test(md); if(q.back && !q.bend) q.bend=2;
      q.curl=/Y/.test(md); q.vib=/W/.test(md)?2:/V/.test(md)?1:0; q.pinch=/Q/.test(md); q.pass=/!/.test(md); q.tie=/=/.test(md);
      if(/^[<>\[\]]$/.test(q.p)){ q.appr=q.p; return; }
      const n=+q.p.slice(-1), acc=q.p.length>1?q.p[0]:"";
      let iv;
      if(acc) iv=MAJINT[n-1]+(acc==="b"?-1:1);
      else if(n===1) iv=0; else if(n===8) iv=12;
      else if(n===3) iv=(c.tones[1]===3||c.tones[1]===4) ? c.tones[1] : step(c, 2, minor);
      else if(n===5) iv=c.tones[2];
      else if(n===7) iv=c.tones[3]!=null ? c.tones[3] : step(c, 6, minor);
      else if(n===9) iv=step(c, 1, minor)+12;
      else iv=step(c, n-1, minor);
      q.rel=c.root+iv+12*q.oct;
    });
    prev=e;
  });
  /* the leaning notes, from the lowest note of the one after them */
  for(let i=L.length-1;i>=0;i--){ if(L[i].ghostOf) continue; const q=L[i].parts[0]; if(!q.appr) continue;
    const nx=L[i+1]; if(!nx || nx.ghostOf || nx.parts[0].rel==null) throw new Error("approach at the end");
    const to=Math.min(...nx.parts.map(x=>x.rel));
    q.rel = q.appr==="<" ? to-1 : q.appr===">" ? to+1 : scaleBelow(to, minor, q.appr==="[" ? -1 : 1);
    q.rel+=12*q.oct; }
  L.forEach(e=>{ if(!e.ghostOf) e.parts.forEach(q=>{ q.frel=q.rel-q.bend; }); });
  /* a muted hit (x) is where the finger was on the note before, on each of its strings */
  L.forEach(e=>{ if(e.ghostOf) e.parts=e.ghostOf.parts.map(q=>({p:"x", oct:0, mods:"", str:-1, k:"g", slide:"", bend:0, rel:q.frel, frel:q.frel, ghost:true})); });
  return {chs, L, beats:P.beats, chordBeats};
}

/* ══ where the hand goes: one position (five frets, and the open strings near the nut), each note on a string ═══ */
function place(L, w, rootM, oct, tuning, maxf){
  const T=tuning||TUNE, MF=maxf||MAXF;
  const ok=f=>f>=0 && f<=MF && ((f>=w && f<=w+SPAN) || (f===0 && w<=2));
  const seq=L.filter(e=>!e.ghostOf);
  /* each token's ways to be played: one string a note, the strings in the order of the notes */
  const ways=seq.map(e=>{
    const ps=e.parts.map((q,j)=>({q, j, fm:rootM+q.frel+12*oct})).sort((a,b)=>a.fm-b.fm || a.j-b.j);
    const cand=ps.map(({q, fm})=>{ const out=[];
      for(let s=0;s<T.length;s++){
        const f=fm-T[s]; if(!ok(f)) continue;
        if(q.str>=0 && s!==q.str) continue;
        if((q.bend || q.curl || q.k==="t") && f<1) continue;
        /* a slide in comes from two frets below (or one, when two would leave the hand); a fall goes the same way */
        let sf=null; if(q.slide==="in" || q.slide==="fall"){ sf=[2,1].map(k=>f-k).find(x=>x>=1 && ok(x)); if(sf==null) continue; }
        if(q.slide==="from" && f===0) continue;
        out.push(sf==null ? {s, f} : {s, f, sf});
      }
      return out; });
    const combos=[];
    const rec=(i, acc)=>{ if(i===ps.length){ combos.push(acc.slice()); return; }
      for(const c of cand[i]){ if(acc.length && c.s<=acc[acc.length-1].s) continue; acc.push(c); rec(i+1, acc); acc.pop(); } };
    rec(0, []);
    /* the notes held at once lie within four frets (a hand's reach, and what a phone shows of the neck) */
    return {ps, combos:combos.filter(cb=>{ const fr=cb.filter(x=>x.f>0).map(x=>x.f); return fr.length<2 || Math.max(...fr)-Math.min(...fr)<=3; }).map(cb=>{ const fr=cb.filter(x=>x.f>0).map(x=>x.f); let k=fr.length>1?(Math.max(...fr)-Math.min(...fr))*0.15:0;
      for(let i=1;i<cb.length;i++) k+=Math.max(0, cb[i].s-cb[i-1].s-1)*0.6;
      /* by part, in the order written: where each one is */
      const at=[]; ps.forEach((p,i)=>{ at[p.j]=cb[i]; }); return {at, low:cb[0], own:k}; })};
  });
  if(ways.some(x=>!x.combos.length)) return null;
  let row=ways[0].combos.map(c=>({c, cost:c.own+c.low.f*0.02, back:null}));
  const rows=[row];
  for(let i=1;i<seq.length;i++){
    const e=seq[i], pe=seq[i-1], next=[];
    ways[i].combos.forEach(c=>{
      let best=null;
      rows[i-1].forEach(p=>{
        /* legato and ties: on a string that was just played, the right way */
        for(let j=0;j<e.parts.length;j++){ const q=e.parts[j], at=c.at[j];
          const legato=q.k==="h"||q.k==="o"||q.slide==="from"||q.tie;
          if(!legato) continue;
          const pi=p.c.at.findIndex(x=>x.s===at.s); if(pi<0) return;
          const pf=p.c.at[pi].f;
          if(q.tie){ if(pf!==at.f || pe.parts[pi].frel!==q.frel) return; continue; }
          if(q.slide==="from"){ if(pf===at.f || pf===0) return; continue; }
          if(q.k==="h" && !(at.f>pf)) return;
          if(q.k==="o" && !(at.f<pf)) return; }
        const a=c.low, b=p.c.low;
        let k=p.cost+c.own+Math.abs(a.s-b.s)*1.0+(a.f>0&&b.f>0?Math.abs(a.f-b.f)*0.35:0.4);
        if(e.parts.length===1 && pe.parts.length===1 && pe.parts[0].frel===e.parts[0].frel && a.s!==b.s) k+=3;
        if(!best || k<best.cost) best={c, cost:k, back:p};
      });
      if(best) next.push(best);
    });
    if(!next.length) return null;
    rows.push(next);
  }
  let end=rows[rows.length-1].reduce((a,b)=>b.cost<a.cost?b:a), path=[];
  for(let p=end;p;p=p.back) path.unshift(p.c);
  return {path, cost:end.cost, seq};
}

/* the whole lick, ready to play: the first licks' own note format (t, s, f, d in beats; k; sl; b; v; q) */
function compile(def, o){
  o=o||{}; const key=((o.key||0)%12+12)%12, minor=!!o.minor, T=o.tuning||TUNE, MF=o.maxf||MAXF;
  const R=resolve(def, minor), L=R.L, rootM=T[0]+((key-(T[0]%12))%12+12)%12;
  let best=null;
  const pref=def.oct!=null?def.oct:1;
  for(const oct of [pref, pref-1, pref+1, pref+2, pref-2]){
    const all=[]; L.forEach(e=>e.parts.forEach(q=>{ all.push(rootM+q.frel+12*oct, rootM+q.rel+12*oct); }));
    if(Math.min(...all)<T[0] || Math.max(...all)>T[T.length-1]+MF) continue;
    for(let w=1; w<=MF-SPAN; w++){
      const pl=place(L, w, rootM, oct, T, MF); if(!pl) continue;
      const score=pl.cost+Math.abs(w-(def.pos||5))*0.12+Math.abs(oct-pref)*8;
      if(!best || score<best.score) best={score, w, oct, pl};
    }
    if(best) break;
  }
  if(!best) return null;
  const sw=def.sw||0, warp=x=>{ if(!sw) return x; const b=Math.floor(x+1e-9), fr=x-b; return b+(fr<=0.5 ? fr/0.5*sw : sw+(fr-0.5)/0.5*(1-sw)); };
  const at=new Map(); best.pl.seq.forEach((e,i)=>at.set(e, best.pl.path[i].at));
  L.forEach(e=>{ if(e.ghostOf) at.set(e, at.get(e.ghostOf).map(x=>({s:x.s, f:x.f}))); });
  const notes=[], lastOn={};
  L.forEach((e,i)=>{
    const where=at.get(e), nx=L[i+1], legNext=nx && nx.parts.some(q=>q.k==="h"||q.k==="o"||q.slide==="from"||q.tie);
    const fullLen=!nx || legNext || e.full, frac=e.short ? 0.45 : fullLen ? 1 : 0.9;
    const order=e.parts.map((q,j)=>j).sort((a,b)=>e.parts[a].frel-e.parts[b].frel);
    const reps=e.trem ? Math.max(2, Math.round(e.slot/0.125)) : 1;
    /* a rake: the pick dragged across two muted strings just before the note */
    if(e.rake){ const lo=where[order[0]];
      [2,1].forEach(k=>{ const s=lo.s-k; if(s<0) return; const tb=e.t-k*0.0625;
        notes.push({t:+warp(tb).toFixed(4), s, f:lo.f, d:0.05, k:"g", tb, tm:T[s]+lo.f, fm:T[s]+lo.f, tok:i, rake:1}); }); }
    for(let r=0;r<reps;r++){
      const tb=e.t+r*e.slot/reps, sl=e.slot/reps, fr=e.trem ? 0.9 : frac;
      e.parts.forEach((q,j)=>{
        const {s, f, sf}=where[j], rank=order.indexOf(j), np=e.parts.length;
        const lag=np>2 ? (e.up ? (np-1-rank) : rank)*0.03 : (e.up ? (np-1-rank)*0.03 : 0);
        const t0=warp(tb)+lag, t1=warp(tb+sl*fr), d=+Math.max(0.05, t1-t0).toFixed(4);
        if(q.tie && r===0){ const pn=lastOn[s]; if(pn){ pn.d=+(t1-pn.t).toFixed(4); } return; }
        const n={t:+t0.toFixed(4), s, f, d, tb:+tb.toFixed(6), tm:T[s]+f+q.bend+(q.ghost?0:0), fm:T[s]+f, tok:i, chord:R.chs.indexOf(e.chord)};
        if(q.ghost){ n.tm=n.fm; }
        const k=r>0 ? "p" : q.k; if(k!=="p") n.k=k;
        if(r===0){
          if(q.slide==="in"){ n.f=sf; n.sl=[f, 0, Math.min(0.18, e.slot*0.4)]; }
          if(q.slide==="fall"){ n.sl=[sf, d*0.55, d*0.35]; }
          if(q.slide==="from"){ const pn=lastOn[s]; n.f=pn?pn.sl&&pn.sl[1]===0?pn.sl[0]:pn.f:f; n.sl=[f, 0, Math.min(0.2, e.slot*0.5)]; }
          if(q.bend){ const bt=Math.min(0.35, Math.max(0.1, e.slot*0.35)); n.b=[q.bend, 0.04, bt];
            if(q.back){ const ra=Math.max(0.04+bt+0.08, e.slot*0.55); n.b.push(ra, Math.min(0.3, Math.max(0.1, e.slot*0.3))); n.back=1; } }
          if(q.curl) n.b=[0.5, 0.05, Math.min(0.15, e.slot*0.4)];
          if(q.vib){ n.v=+(q.bend ? Math.min(d*0.8, n.b[1]+n.b[2]+0.05) : Math.min(0.35, e.slot*0.4)).toFixed(4); if(q.vib===2) n.vw=1.7; }
          if(q.pinch) n.q=1;
          if(q.pass) n.pass=1; if(q.appr) n.appr=q.appr;
        }
        notes.push(n); lastOn[s]=n;
      });
    }
  });
  notes.sort((a,b)=>a.t-b.t || a.s-b.s);
  return {id:def.id, notes, chords:R.chs.map(c=>({t0:c.t0, t1:c.t1, root:c.root, q:c.q, tones:c.tones.slice(), band:c.band})), beats:R.beats, w:best.w, oct:best.oct,
    chordBeats:R.chordBeats, key, minor};
}

/* ══ the numbers: what a lick must be in every key ═══════════════════════════════════════════════════════════════ */
function check(C, o){
  o=o||{}; const T=o.tuning||TUNE, MF=o.maxf||MAXF, bad=[];
  if(!C){ return ["does not fit on the neck"]; }
  if(Math.abs(C.chordBeats-C.beats)>1e-6) bad.push(`the notes last ${C.beats} beats, the chords ${C.chordBeats}`);
  const SC=C.minor?MIN:MAJ, inPos=f=>(f>=C.w && f<=C.w+SPAN) || (f===0 && C.w<=2), pcOf=m=>((m-C.key)%12+12)%12;
  const blue=[3,6,10];
  C.notes.forEach((n,i)=>{
    const end=n.sl?n.sl[0]:n.f;
    [n.f, end].forEach(f=>{ if(!inPos(f)) bad.push(`note ${i} fret ${f} outside frets ${C.w}-${C.w+SPAN}`); });
    const fm=n.sl && n.sl[1]===0 ? T[n.s]+n.sl[0] : T[n.s]+n.f;
    if(fm!==n.fm && !(n.sl && n.sl[1]>0)) bad.push(`note ${i} is fretted at ${fm}, written ${n.fm}`);
    const bend=n.b && n.b[0]>=1 ? n.b[0] : 0;
    if(n.fm+bend!==n.tm) bad.push(`note ${i} reaches ${n.fm+bend}, written ${n.tm}`);
    if(Math.min(n.fm, T[n.s]+n.f)<T[0] || n.tm>T[T.length-1]+MF || n.f>MF || end>MF) bad.push(`note ${i} out of range`);
    if(n.k==="g") return;
    const c=C.chords[n.chord], pc=pcOf(n.tm), chordPcs=c.tones.map(x=>(c.root+x)%12);
    const inKey=SC.indexOf(pc)>=0, isTone=chordPcs.indexOf(pc)>=0;
    const strong=Math.abs(n.tb/2-Math.round(n.tb/2))<1e-6;
    if(strong && !isTone) bad.push(`note ${i} at beat ${n.tb} is not in the chord`);
    if(bend){ const sp=pcOf(n.fm); if(SC.indexOf(sp)<0 && chordPcs.indexOf(sp)<0 && blue.indexOf(sp)<0) bad.push(`note ${i} bends from outside the key`); }
    if(!inKey && !isTone){
      const nx=C.notes.filter(x=>x.tok>n.tok && x.k!=="g"), t1=nx.length?nx[0].tok:-1, near=nx.filter(x=>x.tok===t1);
      if(!(n.pass||n.appr)) bad.push(`note ${i} (${n.tm}) is outside the key and the chord`);
      else if(!near.length || !near.some(x=>Math.abs(x.fm-n.tm)<=2 || Math.abs(x.tm-n.tm)<=2)) bad.push(`note ${i} passes to nothing near it`);
    }
    if(n.appr && strong) bad.push(`note ${i} leans on a strong beat`);
  });
  const real=C.notes.filter(n=>n.k!=="g"), lastTok=real.length?real[real.length-1].tok:-1, lc=C.chords[C.chords.length-1];
  if(!real.filter(n=>n.tok===lastTok).some(n=>pcOf(n.tm)===lc.root%12)) bad.push("does not end on its chord's root");
  return bad;
}

const API={GROUPS, ORDER, LICKS, WORDS, OLD, NEW, compile, check, parseChords, _resolve:resolve};
if(typeof module!=="undefined" && module.exports) module.exports=API; else root.AOGGuitarLicks=API;
})(typeof window!=="undefined"?window:this);
