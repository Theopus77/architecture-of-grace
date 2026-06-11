#!/usr/bin/env python3
"""
Architecture of Grace - link checker.
Put this in your AOG SITE folder and run:  python3 check-files.py
Confirms every PDF the site links to is actually present (no download 404s).
"""
import os, sys
ROOT_PDFS = ['AoG-Guia-Rapida-Docentes.pdf', 'AoG-Teacher-QuickStart.pdf']
FILES_PDFS = ['AoG-Anchor-Charts-Preview.pdf', 'AoG-Book1-Anchor-Charts.pdf', 'AoG-Book1-Autism-Charts-Lower-Support-Preview.pdf', 'AoG-Book1-Autism-Charts-Moderate-Support-Preview.pdf', 'AoG-Book1-Drawing-Activities.pdf', 'AoG-Book1-Room12-DIGITAL.pdf', 'AoG-Book1-Scenario-Card-Deck.pdf', 'AoG-Book2-Anchor-Charts.pdf', 'AoG-Book2-Autism-Charts-Lower-Support-Preview.pdf', 'AoG-Book2-Autism-Charts-Moderate-Support-Preview.pdf', 'AoG-Book2-Room18-DIGITAL.pdf', 'AoG-Book2-Scenario-Card-Deck.pdf', 'AoG-Book2-Somatic-Floor-Preview.pdf', 'AoG-Book2-Worksheet-Packet.pdf', 'AoG-Book3-Anchor-Charts.pdf', 'AoG-Book3-Autism-Charts-Lower-Support-Preview.pdf', 'AoG-Book3-Autism-Charts-Moderate-Support-Preview.pdf', 'AoG-Book3-Divine-Blueprint-Master-Crosswalk.pdf', 'AoG-Book3-Room36-DIGITAL.pdf', 'AoG-Book3-Somatic-Floor-Preview.pdf', 'AoG-Book3-Worksheet-Pack.pdf', 'AoG-Book4-Autism-Charts-Lower-Support-Preview.pdf', 'AoG-Book4-Autism-Charts-Moderate-Support-Preview.pdf', 'AoG-Book4-Room104-DIGITAL.pdf', 'AoG-Book5-Autism-Charts-Lower-Support-Preview.pdf', 'AoG-Book5-Autism-Charts-Moderate-Support-Preview.pdf', 'AoG-Book5-Room207-DIGITAL.pdf', 'AoG-Book6-The-Dwelling-First-Chapter-Preview.pdf', 'AoG-Books4-5-Worksheet-Pack.pdf', 'AoG-Crosswalk-Matrix-Preview-Divine.pdf', 'AoG-Crosswalk-Matrix-Preview-Secular.pdf', 'AoG-Drawing-Activities-K2-Sampler.pdf', 'AoG-Home-Edition-Book-1-Preview.pdf', 'AoG-Home-Edition-Book-2-Preview.pdf', 'AoG-Home-Edition-Book-3-Preview.pdf', 'AoG-Home-Edition-Book-4-Preview.pdf', 'AoG-Home-Edition-Book-5-Preview.pdf', 'AoG-Identity-Preview.pdf', 'AoG-Sample-Lesson-Book-1.pdf', 'AoG-Sample-Lesson-Book-2.pdf', 'AoG-Sample-Lesson-Book-3.pdf', 'AoG-Sample-Lesson-Book-4.pdf', 'AoG-Sample-Lesson-Book-5.pdf', 'AoG-Scenario-Cards-K12-Sampler.pdf', 'AoG-Scenario-Cards-Preview.pdf', 'AoG-Supplemental-Anchor-Chart-Pack.pdf', 'AoG-Worksheets-K12-Sampler.pdf', 'AoGBook5AnchorCharts.pdf', 'AoG_Book1_The_Foundation_Curriculum_Polished.pdf', 'AoG_Book2_The_Framework_Curriculum_Polished.pdf', 'AoG_Book3_The_Interior_Curriculum_Polished.pdf', 'AoG_Book4_The_Facade_Curriculum_Polished.pdf', 'AoG_Book5_The_Capstone_Curriculum_Polished.pdf', 'AoG_Book6_The_Dwelling_DIGITAL.pdf', 'Architecture-of-Grace-Preview.pdf', 'Room-104-First-Chapter-Preview.pdf', 'Room-12-First-Chapter-Preview.pdf', 'Room-18-First-Chapter-Preview.pdf', 'Room-207-First-Chapter-Preview.pdf', 'Room-36-First-Chapter-Preview.pdf']
here = os.path.dirname(os.path.abspath(__file__))
missing = [n for n in ROOT_PDFS if not os.path.exists(os.path.join(here, n))]
fd = os.path.join(here, "files")
if not os.path.isdir(fd):
    print("[X] No 'files' folder found next to this script."); sys.exit(1)
present = set(os.listdir(fd))
missing += ["files/" + n for n in FILES_PDFS if n not in present]
total = len(ROOT_PDFS) + len(FILES_PDFS)
if missing:
    print("MISSING %d of %d linked PDFs - these links will 404:\n" % (len(missing), total))
    for m in sorted(missing): print("  [X] " + m)
    print("\nFix: add those exact files, then re-run.")
    sys.exit(1)
print("[OK] All %d linked PDFs are present. No broken download links." % total)
extra = sorted(e for e in (present - set(FILES_PDFS)) if e.lower().endswith(".pdf"))
if extra:
    print("\nNote - %d PDF(s) in /files aren't linked by the site (harmless):" % len(extra))
    for e in extra: print("  . files/" + e)
