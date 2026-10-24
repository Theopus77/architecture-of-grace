#!/bin/bash
# The music suites, one after another, a line of totals each. Run from anywhere:
#   bash music-handoff/tests/run.sh                 (every suite, about 25 minutes)
#   bash music-handoff/tests/run.sh amp/b1 strings/st   (just these)
# The pages are served from $AOG_ROOT (default: the repo's aog-deploy). Each suite has its own fixed port (99xx): never
# run two copies of this script at once, the second one's servers fail to start ("Node.js v22" crash lines).
cd "$(dirname "$0")"
ALL="learn/listen ppat precs pwheel2 pwheel plit pjim pt ptouch pflow psel plt plt2 t t2 t3 t4 t5 t7 strings/shapes strings/st strings/sflow strings/sways strings/sdecks strings/sfix strings/real strings/bassets play/strings play/drums play/band play/piano play/feel play/kit solo/s1 solo/s2 solo/s3 bandt/b1 bandt/b2 bandt/b3 bandt/b4 bandt/sax2 bandt/bagpipes bandt/folk bandt/home bandt/scales ep/steps ep/ways ep/rec ep/recall ep/metalui ep/send2pads pads/gold ep/kits3 realkit ep/allevel amp/b1 amp/b2 dj/d0 dj/d1 dj/d2 dj/d3 dj/d4 dj/d5 dj/d6 dj/erase dj/scratch studio/send studio/edit studio/carry studio/sendout studio/shell studio/rooms studio/first studio/face studio/keys play/soundpick studio/chops studio/voice studio/live studio/cut studio/fixes studio/hands studio/release studio/song studio/overdub studio/timing play/roomvu play/finish play/chordkeys pscales strings/anychord drumbeats strings/handlit play/kitbeats play/chordmove play/bandchordmove play/midi bandt/hold play/pedals studio/notes studio/auto studio/more studio/more2 studio/rooms-real play/chords12 learn/teach learn/real learn/teach2 silent/hush silent/rest pads/chopslen bandt/classroom play/steady bandt/voices bandt/world bandt/fold pads/percussion pads/morekits rooms/compact studio/supreme play/steady-all play/steady-band desk/master desk/warp desk/rec desk/notes desk/arrange desk/ref desk/export desk/speed desk/look play/strumclean levels/even pads/bars16 pads/numkeys solo/licknear solo/basslicks solo/guitarlicks pads/elite pads/perfect studio/arrive studio/along studio/vocal studio/locker2 studio/locker3 unit/lockergs studio/export midi/expr bandt/hifi"
for s in ${@:-$ALL}; do
  t=900; [ "$s" = levels/even ] && t=7200   # every note of every sound: the longest suite by far
  [ "$s" = solo/basslicks ] && t=1500   # every bass lick played through on three screens, about 12 minutes
  [ "$s" = bandt/hifi ] && t=5400   # AOG-BAND-HIFI-V1: every Band recording, five renders each and tune.py, 25 minutes alone, an hour on a busy machine
  [ "$s" = solo/guitarlicks ] && t=2400   # every guitar lick (122) rendered, then played through on three screens, about 12 minutes
  out=$(timeout $t node $s.js 2>&1); code=$?
  pass=$(echo "$out" | grep -c "^PASS\|^ok\|✓"); fail=$(echo "$out" | grep -c "^FAIL\|^CRASH\|✗")
  echo "== $s: $pass pass, $fail fail; exit $code; $(echo "$out" | tail -1 | cut -c1-120)"
  if [ "$fail" -gt 0 ]; then echo "$out" | grep "^FAIL\|^CRASH\|✗" | head -8; fi
done
