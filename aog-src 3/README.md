# Architecture of Grace — source
base.html = full site (edit directly; includes the Education Dashboard nav).
modules/ = injectable add-ons (mtss.js/mtss.css = MTSS Integration Report: triangle,
tier-movement, exec summary, CSV/copy exports, print cover). build.py injects them
+ version-stamps page & service worker. Run: python3 build.py
