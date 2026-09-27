#!/bin/sh
# AOG — build one course end to end (never run two at once). From aog-deploy/:  sh _work/course/run_course.sh <id>
set -e
id=$1
python3 _work/course/inject_groups.py $id
python3 _work/$id/build_$id.py
python3 _work/$id/inject_${id}_jump.py
python3 _work/jump/inject_jump.py
for f in _work/*/inject_*_jump.py; do [ "$f" = "_work/$id/inject_${id}_jump.py" ] || python3 $f; done
python3 _work/$id/inject_${id}_jump.py
python3 _work/$id/plumb_$id.py
