#!/usr/bin/env python3
"""AOG-TELE-SKY-DATA-V1 (2026-10-12) - builds the Telescope's real sky from d3-celestial's data files.

    python3 -I make_sky.py <path to d3-celestial/data>

d3-celestial 0.7.35 (npm, BSD-3-Clause, (c) 2015 Olaf Frohn; LICENSE-d3-celestial.txt beside the data).
Its star positions, magnitudes and B-V colours come from the Hipparcos catalogue (ESA 1997, public),
star names from the IAU WGSN list, deep-sky data from the Messier and NGC/IC lists.

Writes ../stars.bin, ../sky.json and ../milkyway.png. Nothing here is loaded by a page; the page loads the outputs
only when the star map or the real sky is opened.

stars.bin: "AOGS" + uint32 count, then per star (brightest first) 7 bytes:
  uint16 RA  (deg * 65536/360), int16 Dec (deg * 32767/90), uint8 (mag+2)*20, int8 B-V*50, uint8 constellation (0 = unknown)
"""
import json, struct, sys, os, math
SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
J = lambda n: json.load(open(os.path.join(SRC, n), encoding="utf-8"))

stars = [f for f in J("stars.8.json")["features"] if f["properties"]["mag"] <= 6.5]
stars.sort(key=lambda f: f["properties"]["mag"])
names = J("starnames.json")
cons = J("constellations.json")["features"]
CON = [c["id"] for c in cons]
CIDX = {c: i + 1 for i, c in enumerate(CON)}

buf = bytearray(b"AOGS" + struct.pack("<I", len(stars)))
named = {}
for i, f in enumerate(stars):
    lon, lat = f["geometry"]["coordinates"]
    ra = lon % 360.0
    p = f["properties"]
    try: bv = float(p.get("bv") or 0.6)
    except ValueError: bv = 0.6
    n = names.get(str(f["id"]), {})
    c = CIDX.get(n.get("c", ""), 0)
    buf += struct.pack("<HhBbB", int(round(ra * 65536 / 360)) % 65536, int(round(lat * 32767 / 90)),
                       max(0, min(255, int(round((p["mag"] + 2) * 20)))), max(-128, min(127, int(round(bv * 50)))), c)
    nm = (n.get("name") or "").strip()
    es = (n.get("es") or "").strip()
    bayer = (n.get("bayer") or "").strip()
    flam = (n.get("flam") or "").strip()
    desig = (bayer or flam)
    if nm or (desig and p["mag"] < 4.6):
        named[i] = [nm, es if es and es != nm else "", (desig + " " + n.get("c", "")).strip() if desig else "", f["id"]]
open(os.path.join(OUT, "stars.bin"), "wb").write(bytes(buf))

r2 = lambda v: round(v, 2)
lines = {f["id"]: f["geometry"]["coordinates"] for f in J("constellations.lines.json")["features"]}
con_out = []
for c in cons:
    pr = c["properties"]
    L = [[[r2(pt[0] % 360), r2(pt[1])] for pt in seg] for seg in lines.get(c["id"], [])]
    con_out.append({"id": c["id"], "en": pr.get("en") or pr["name"], "la": pr["name"], "es": pr.get("es") or pr["name"],
                    "rank": int(pr.get("rank") or 3), "at": [r2(c["geometry"]["coordinates"][0] % 360), r2(c["geometry"]["coordinates"][1])], "lines": L})

dnames = J("dsonames.json")
dso = []
seen = set()
def dim(s):
    s = str(s or "")
    try:
        a = [float(x) for x in s.split("x") if x]
    except ValueError:
        return [0, 0]
    return [a[0], a[1] if len(a) > 1 else a[0]] if a else [0, 0]
for f in J("messier.json")["features"]:
    p = f["properties"]; lon, lat = f["geometry"]["coordinates"]
    nm = dnames.get(f["id"]) or dnames.get(p.get("desig", "")) or {}
    en = p.get("alt") or nm.get("name") or ""
    es = nm.get("es") or ""
    dso.append({"id": f["id"], "ngc": p.get("desig", ""), "en": en, "es": es, "t": p["type"], "mag": p["mag"],
                "dim": dim(p["dim"]), "ra": r2(lon % 360), "dec": r2(lat)})
    seen.add(p.get("desig", "")); seen.add(f["id"])
EXTRA = {"NGC 869": ["Double Cluster (h Persei)", "Cúmulo Doble (h Persei)"], "NGC 884": ["Double Cluster (χ Persei)", "Cúmulo Doble (χ Persei)"],
         "NGC 5139": ["Omega Centauri", "Omega Centauri"], "NGC 104": ["47 Tucanae", "47 Tucanae"],
         "NGC 3372": ["Carina Nebula", "Nebulosa de Carina"], "Cr 399": ["Coathanger", "La Percha"],
         "PGC 17223": ["Large Magellanic Cloud", "Gran Nube de Magallanes"], "NGC 292": ["Small Magellanic Cloud", "Pequeña Nube de Magallanes"],
         "NGC 2244": ["Rosette Cluster", "Cúmulo de la Roseta"], "NGC 2264": ["Christmas Tree Cluster", "Cúmulo del Árbol de Navidad"],
         "IC 2602": ["Southern Pleiades", "Pléyades del Sur"], "NGC 2362": ["Tau Canis Majoris Cluster", "Cúmulo de Tau Canis Majoris"],
         "NGC 2451": ["NGC 2451", "NGC 2451"], "NGC 2516": ["NGC 2516", "NGC 2516"], "NGC 3532": ["Wishing Well Cluster", "Cúmulo del Pozo de los Deseos"],
         "NGC 6231": ["NGC 6231", "NGC 6231"], "IC 2391": ["Omicron Velorum Cluster", "Cúmulo de Omicron Velorum"],
         "Cr 140": ["Collinder 140", "Collinder 140"], "NGC 598": None, "NGC 224": None, "NGC 1976": None, "NGC 2632": None,
         "M 45": None, "M 8": None, "NGC 6121": None, "NGC 6405": None, "NGC 6475": None, "NGC 6611": None, "Cr 39": ["Alpha Persei Cluster", "Cúmulo de Alfa Persei"],
         "C 41": ["Hyades", "Híades"], "Cr 256": ["Coma Star Cluster", "Cúmulo de Coma"], "GC": None}
for f in J("dsos.bright.json")["features"]:
    i = f["id"]; p = f["properties"]
    if i in seen or EXTRA.get(i) is None: continue
    lon, lat = f["geometry"]["coordinates"]
    en, es = EXTRA[i]
    dso.append({"id": i, "ngc": p.get("desig", i), "en": en, "es": es, "t": p["type"], "mag": p["mag"], "dim": dim(p["dim"]), "ra": r2(lon % 360), "dec": r2(lat)})
# a few showpieces that are in neither list
for i, en, es, t, mag, d, ra, dec in [
    ("NGC 457", "Owl Cluster", "Cúmulo del Búho", "oc", 6.4, [13, 13], 19.87, 58.29),
    ("NGC 7009", "Saturn Nebula", "Nebulosa Saturno", "pn", 8.0, [0.6, 0.4], 316.04, -11.36),
    ("NGC 6543", "Cat's Eye Nebula", "Nebulosa Ojo de Gato", "pn", 8.1, [0.4, 0.3], 269.64, 66.63),
    ("NGC 7662", "Blue Snowball", "Bola de Nieve Azul", "pn", 8.3, [0.5, 0.5], 351.47, 42.54),
    ("NGC 2392", "Eskimo Nebula", "Nebulosa del Esquimal", "pn", 9.1, [0.8, 0.7], 112.29, 20.91),
    ("NGC 253", "Sculptor Galaxy", "Galaxia del Escultor", "s", 7.1, [27.5, 6.8], 11.89, -25.29),
    ("NGC 7000", "North America Nebula", "Nebulosa Norteamérica", "en", 4.0, [120, 100], 314.75, 44.33)]:
    dso.append({"id": i, "ngc": i, "en": en, "es": es, "t": t, "mag": mag, "dim": d, "ra": ra, "dec": dec})

asterisms = []
for f in J("asterisms.json")["features"]:
    pr = f["properties"]
    if pr.get("p", 9) <= 3 and pr.get("p") != 6:
        asterisms.append({"en": pr["n"], "es": pr.get("es") or pr["n"], "lines": [[[r2(pt[0] % 360), r2(pt[1])] for pt in seg] for seg in f["geometry"]["coordinates"]]})

json.dump({"v": 1, "source": "d3-celestial 0.7.35 (BSD-3-Clause): Hipparcos, IAU WGSN names, Messier/NGC",
           "con": con_out, "cons": CON, "named": named, "dso": dso, "asterisms": asterisms},
          open(os.path.join(OUT, "sky.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

# The Milky Way: five nested outlines (ol1 faint ... ol5 brightest), drawn as an even-odd mask each, added up,
# softened, on an equirectangular map (RA 0..360 left to right, Dec +90 at the top).
from PIL import Image, ImageDraw, ImageFilter, ImageChops
W, H = 2048, 1024
acc = None
weights = {"ol1": 0.20, "ol2": 0.20, "ol3": 0.20, "ol4": 0.20, "ol5": 0.20}
for f in J("mw.json")["features"]:
    lvl = Image.new("L", (W, H), 0)
    for poly in f["geometry"]["coordinates"]:
        for ring in poly:
            m = Image.new("L", (W, H), 0); d = ImageDraw.Draw(m)
            # RA increases to the right here; a ring crossing RA 0 is drawn shifted both ways
            pts = [((pt[0] % 360) / 360 * W, (90 - pt[1]) / 180 * H) for pt in ring]
            # unwrap the ring so it stays continuous
            un = [pts[0]]
            for x, y in pts[1:]:
                px = un[-1][0]
                while x - px > W / 2: x -= W
                while px - x > W / 2: x += W
                un.append((x, y))
            if abs(un[-1][0] - un[0][0]) > W / 2:
                # a ring that goes once round the sky (an edge of the band): close it over the north pole,
                # so the even-odd fill of the two edges leaves the band between them
                un += [(un[-1][0], -2), (un[0][0], -2)]
            for off in (-W, 0, W):
                d.polygon([(x + off, y) for x, y in un], fill=255)
            lvl = ImageChops.logical_xor(lvl.convert("1"), m.convert("1")).convert("L")
    w = weights.get(f["id"], 0.2)
    lvl = lvl.point(lambda v: int(v * w))
    acc = lvl if acc is None else ImageChops.add(acc, lvl)
acc = acc.filter(ImageFilter.GaussianBlur(3.2))
acc = acc.point(lambda v: min(255, int(255 * (v / 255.0) ** 0.85)))
acc.resize((1024, 512), Image.LANCZOS).save(os.path.join(OUT, "milkyway.png"), optimize=True)
print("stars", len(stars), "named", len(named), "dso", len(dso), "bin", len(buf))
