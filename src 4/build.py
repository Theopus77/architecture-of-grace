#!/usr/bin/env python3
"""
Architecture of Grace — build script.

Maintain from clean source modules, deploy as ONE self-contained file.

This takes the authoritative monolith (base.html) and applies the ordered
build steps in build/, which inline the source modules:
    modules/engine.js        first-pass regulation engine
    modules/engine2.js       localized regulation engine (replaces engine.js block)
    modules/grace-tools.js   somatic toolkit + full Spanish PECS deck
    modules/css6.css         engine/tool component styles

Output: dist/index.html  — the single file you deploy (rename/serve as index.html).

Usage:
    python3 build.py

Requires only Python 3 (standard library). No internet, no packages.
"""
import os, shutil, subprocess, sys, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")
MODULES = os.path.join(HERE, "modules")
DIST = os.path.join(HERE, "dist")
TMP = os.path.join(HERE, ".buildtmp")

# Build steps, in order. Each reads the previous step's HTML output.
STEPS = ["patch.py", "patch2.py", "patch3.py", "patch4.py", "patch5.py",
         "patch6.py", "patch7.py", "patch8.py", "patch9.py", "patch10.py", "patch11.py", "patch12.py"]
# Module files the steps inline (must sit beside the working index.html).
MODULE_FILES = ["engine.js", "engine2.js", "grace-tools.js", "css6.css"]
FINAL = "index_v12.html"   # name produced by the last step
PLACEHOLDER = "__AOG_BUILD__"


def main():
    base = os.path.join(HERE, "base.html")
    if not os.path.exists(base):
        sys.exit("[FAIL] base.html not found next to build.py")

    # Fresh working area.
    shutil.rmtree(TMP, ignore_errors=True)
    os.makedirs(TMP, exist_ok=True)

    # Stage inputs: base -> index.html, plus modules and step scripts.
    shutil.copy(base, os.path.join(TMP, "index.html"))
    for m in MODULE_FILES:
        src = os.path.join(MODULES, m)
        if not os.path.exists(src):
            sys.exit(f"[FAIL] missing module: modules/{m}")
        shutil.copy(src, os.path.join(TMP, m))
    for step in STEPS:
        src = os.path.join(BUILD, step)
        if not os.path.exists(src):
            sys.exit(f"[FAIL] missing build step: build/{step}")
        shutil.copy(src, os.path.join(TMP, step))

    # Run the steps in order.
    for step in STEPS:
        print(f"  → {step}")
        r = subprocess.run([sys.executable, step], cwd=TMP,
                           capture_output=True, text=True)
        if r.returncode != 0:
            sys.stdout.write(r.stdout); sys.stderr.write(r.stderr)
            sys.exit(f"[FAIL] {step} exited {r.returncode}")

    out = os.path.join(TMP, FINAL)
    if not os.path.exists(out):
        sys.exit(f"[FAIL] expected {FINAL} was not produced")

    # Stamp the build version into the page AND the service worker, so each
    # deploy auto-invalidates the old cache. No manual version bumping.
    version = datetime.datetime.now().strftime("%Y.%m.%d.%H%M")
    html = open(out, encoding="utf-8").read().replace(PLACEHOLDER, version)

    os.makedirs(DIST, exist_ok=True)
    dist_index = os.path.join(DIST, "index.html")
    open(dist_index, "w", encoding="utf-8").write(html)

    # Version-stamp sw.js too and drop it in dist/ so the deploy set is complete.
    sw_src = os.path.join(HERE, "sw.js")
    if os.path.exists(sw_src):
        sw = open(sw_src, encoding="utf-8").read().replace(PLACEHOLDER, version)
        open(os.path.join(DIST, "sw.js"), "w", encoding="utf-8").write(sw)

    shutil.rmtree(TMP, ignore_errors=True)   # best-effort; safe to leave behind

    size = os.path.getsize(dist_index)
    print(f"\n[OK] Built dist/index.html ({size:,} bytes)  build {version}")
    print(f"[OK] Built dist/sw.js (cache: aog-cache-{version})")
    print("\nDeploy: upload everything in dist/ (index.html, sw.js) to your web root,")
    print("        alongside manifest.json, the favicon/icon files, /files, /previews,")
    print("        and (optional, for never-online use) /fonts/opendyslexic-400.woff2 + -700.woff2.")


if __name__ == "__main__":
    main()
