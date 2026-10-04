#!/bin/bash
# The music suites, one after another, a line of totals each. Run from anywhere:
#   bash music-handoff/tests/run.sh                 (every suite, about 25 minutes)
#   bash music-handoff/tests/run.sh amp/b1 strings/st   (just these)
# The pages are served from $AOG_ROOT (default: the repo's aog-deploy). Each suite has its own fixed port (99xx): never
# run two copies of this script at once, the second one's servers fail to start ("Node.js v22" crash lines).
cd "$(dirname "$0")"
ALL="ppat pwheel2 pwheel plit pjim pt ptouch pflow psel plt plt2 t t2 t3 t4 t5 t7 strings/shapes strings/st strings/sflow strings/sdecks strings/pads bandt/b1 bandt/b2 bandt/b3 bandt/home ep/steps ep/ways ep/rec ep/recall ep/metalui amp/b1 amp/b2"
for s in ${@:-$ALL}; do
  out=$(timeout 900 node $s.js 2>&1); code=$?
  pass=$(echo "$out" | grep -c "^PASS\|^ok\|✓"); fail=$(echo "$out" | grep -c "^FAIL\|CRASH\|✗")
  echo "== $s: $pass pass, $fail fail; exit $code; $(echo "$out" | tail -1 | cut -c1-120)"
  if [ "$fail" -gt 0 ]; then echo "$out" | grep "FAIL\|CRASH\|✗" | head -8; fi
done
