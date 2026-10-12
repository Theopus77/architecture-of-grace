/* AOG-TELE-CATALOG-V1 (2026-10-12) — the real sky's data, the place and the time.
   Loaded only when the star map is opened or "Real sky" is chosen. Reads /data/sky/stars.bin (8,874 stars to magnitude
   6.5 from Hipparcos) and /data/sky/sky.json (constellations, names in English and Spanish, deep-sky objects), built by
   data/sky/source/make_sky.py from d3-celestial (BSD-3-Clause; see data/sky/LICENSE-d3-celestial.txt).
   The place and time stay on this device. "Use my location" asks the browser only when it is tapped. */
(function () {
  "use strict";
  const A = window.AOGAstro;
  const D2R = Math.PI / 180;
  /* ── places: Illinois first (the default is Chicago), then the Americas, then the world ── */
  const CITIES = [
    ["chicago", "Chicago, Illinois", 41.88, -87.63, "America/Chicago"],
    ["springfield", "Springfield, Illinois", 39.80, -89.65, "America/Chicago"],
    ["peoria", "Peoria, Illinois", 40.69, -89.59, "America/Chicago"],
    ["champaign", "Champaign–Urbana, Illinois", 40.11, -88.24, "America/Chicago"],
    ["rockford", "Rockford, Illinois", 42.27, -89.09, "America/Chicago"],
    ["carbondale", "Carbondale, Illinois", 37.73, -89.22, "America/Chicago"],
    ["stlouis", "St. Louis, Missouri", 38.63, -90.20, "America/Chicago"],
    ["newyork", "New York, New York", 40.71, -74.01, "America/New_York"],
    ["miami", "Miami, Florida", 25.76, -80.19, "America/New_York"],
    ["houston", "Houston, Texas", 29.76, -95.37, "America/Chicago"],
    ["denver", "Denver, Colorado", 39.74, -104.99, "America/Denver"],
    ["phoenix", "Phoenix, Arizona", 33.45, -112.07, "America/Phoenix"],
    ["losangeles", "Los Angeles, California", 34.05, -118.24, "America/Los_Angeles"],
    ["seattle", "Seattle, Washington", 47.61, -122.33, "America/Los_Angeles"],
    ["anchorage", "Anchorage, Alaska", 61.22, -149.90, "America/Anchorage"],
    ["honolulu", "Honolulu, Hawaii", 21.31, -157.86, "Pacific/Honolulu"],
    ["toronto", "Toronto, Canada", 43.65, -79.38, "America/Toronto"],
    ["mexico", "Ciudad de México, México", 19.43, -99.13, "America/Mexico_City"],
    ["guadalajara", "Guadalajara, México", 20.67, -103.35, "America/Mexico_City"],
    ["sanjuan", "San Juan, Puerto Rico", 18.47, -66.11, "America/Puerto_Rico"],
    ["santodomingo", "Santo Domingo, República Dominicana", 18.49, -69.93, "America/Santo_Domingo"],
    ["guatemala", "Ciudad de Guatemala, Guatemala", 14.63, -90.51, "America/Guatemala"],
    ["bogota", "Bogotá, Colombia", 4.71, -74.07, "America/Bogota"],
    ["quito", "Quito, Ecuador", -0.18, -78.47, "America/Guayaquil"],
    ["lima", "Lima, Perú", -12.05, -77.04, "America/Lima"],
    ["santiago", "Santiago, Chile", -33.45, -70.67, "America/Santiago"],
    ["buenosaires", "Buenos Aires, Argentina", -34.60, -58.38, "America/Argentina/Buenos_Aires"],
    ["madrid", "Madrid, España", 40.42, -3.70, "Europe/Madrid"],
    ["london", "London, United Kingdom", 51.51, -0.13, "Europe/London"],
    ["reykjavik", "Reykjavík, Iceland", 64.15, -21.94, "Atlantic/Reykjavik"],
    ["lagos", "Lagos, Nigeria", 6.52, 3.38, "Africa/Lagos"],
    ["nairobi", "Nairobi, Kenya", -1.29, 36.82, "Africa/Nairobi"],
    ["cairo", "Cairo, Egypt", 30.04, 31.24, "Africa/Cairo"],
    ["delhi", "New Delhi, India", 28.61, 77.21, "Asia/Kolkata"],
    ["tokyo", "Tokyo, Japan", 35.68, 139.69, "Asia/Tokyo"],
    ["sydney", "Sydney, Australia", -33.87, 151.21, "Australia/Sydney"]
  ];
  const deviceTZ = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { return "UTC"; } })();
  const KEY = "scope.place.v1";
  const ST = { city: "chicago", name: CITIES[0][1], lat: 41.88, lon: -87.63, tz: "America/Chicago", mode: "now", ms: 0, view: null };
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || "null");
    if (o && isFinite(o.lat) && isFinite(o.lon)) Object.assign(ST, { city: o.city || "", name: o.name || "", lat: +o.lat, lon: +o.lon, tz: o.tz || deviceTZ, mode: o.mode === "set" ? "set" : "now", ms: +o.ms || 0, view: o.view || null });
  } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) {} }
  function setCity(id) {
    const c = CITIES.find(x => x[0] === id); if (!c) return;
    Object.assign(ST, { city: c[0], name: c[1], lat: c[2], lon: c[3], tz: c[4] }); save();
  }
  function setLatLon(lat, lon, name) {
    if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return false;
    Object.assign(ST, { city: "", name: name || "", lat: +lat, lon: +lon, tz: deviceTZ }); save(); return true;
  }
  function now() { return ST.mode === "set" && ST.ms ? ST.ms : Date.now(); }
  function setTime(ms) { if (ms == null) { ST.mode = "now"; ST.ms = 0; } else { ST.mode = "set"; ST.ms = ms; } save(); }

  /* ── time zones: wall clock at the place ↔ the moment ── */
  function parts(ms, tz) {
    const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    const o = {}; f.formatToParts(new Date(ms)).forEach(p => { if (p.type !== "literal") o[p.type] = +p.value; });
    if (o.hour === 24) o.hour = 0;
    return o;
  }
  function tzOffset(ms, tz) { const p = parts(ms, tz); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(ms / 60000) * 60000; }
  function wallToMs(y, mo, d, h, mi, tz) {
    const guess = Date.UTC(y, mo - 1, d, h, mi);
    let ms = guess - tzOffset(guess, tz);
    ms = guess - tzOffset(ms, tz);
    return ms;
  }
  function inputValue(ms) { const p = parts(ms, ST.tz), z = n => String(n).padStart(2, "0"); return `${p.year}-${z(p.month)}-${z(p.day)}T${z(p.hour)}:${z(p.minute)}`; }
  function fromInput(v) { const m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(v || ""); return m ? wallToMs(+m[1], +m[2], +m[3], +m[4], +m[5], ST.tz) : null; }
  function fmtTime(ms, lang) { return new Intl.DateTimeFormat(lang === "es" ? "es" : "en-US", { timeZone: ST.tz, hour: "numeric", minute: "2-digit" }).format(new Date(ms)); }
  function fmtDate(ms, lang) { return new Intl.DateTimeFormat(lang === "es" ? "es" : "en-US", { timeZone: ST.tz, weekday: "short", month: "short", day: "numeric" }).format(new Date(ms)); }

  /* ── the data ── */
  let D = null, loading = null;
  function load() {
    if (D) return Promise.resolve(D);
    if (loading) return loading;
    loading = Promise.all([fetch("/data/sky/stars.bin").then(r => r.arrayBuffer()), fetch("/data/sky/sky.json").then(r => r.json())]).then(([bin, js]) => {
      const dv = new DataView(bin), n = dv.getUint32(4, true);
      const ra = new Float32Array(n), dec = new Float32Array(n), mag = new Float32Array(n), bv = new Float32Array(n), con = new Uint8Array(n), xyz = new Float32Array(n * 3);
      for (let i = 0, o = 8; i < n; i++, o += 7) {
        ra[i] = dv.getUint16(o, true) * 360 / 65536; dec[i] = dv.getInt16(o + 2, true) * 90 / 32767;
        mag[i] = dv.getUint8(o + 4) / 20 - 2; bv[i] = dv.getInt8(o + 5) / 50; con[i] = dv.getUint8(o + 6);
        const cd = Math.cos(dec[i] * D2R);
        xyz[i * 3] = cd * Math.cos(ra[i] * D2R); xyz[i * 3 + 1] = cd * Math.sin(ra[i] * D2R); xyz[i * 3 + 2] = Math.sin(dec[i] * D2R);
      }
      /* a coarse grid (10° in Dec, RA cells scaled) for "stars near this point" */
      const grid = new Map(), cell = (r, d) => { const di = Math.floor((d + 90) / 10), w = Math.max(1, Math.floor(36 * Math.cos(((di * 10) - 85) * D2R))); return di * 100 + Math.floor(r / 360 * w) % w; };
      for (let i = 0; i < n; i++) { const k = cell(ra[i], dec[i]); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i); }
      const hip = {}; Object.keys(js.named).forEach(k => { hip[js.named[k][3]] = +k; });
      const dso = js.dso.map(o => Object.assign({}, o, { v: A.radec2v(o.ra, o.dec) }));
      const dsoById = {}; dso.forEach(o => { dsoById[o.id] = o; });
      /* the Double Cluster as one target: between h and χ Persei */
      const h = dsoById["NGC 869"], c = dsoById["NGC 884"];
      if (h && c) { const m = A.unit([h.v[0] + c.v[0], h.v[1] + c.v[1], h.v[2] + c.v[2]]);
        const rd = A.v2radec(m); dsoById.DC = { id: "DC", ngc: "NGC 869 + NGC 884", en: "Double Cluster", es: "Cúmulo Doble", t: "oc", mag: 3.7, dim: [60, 30], ra: rd.ra, dec: rd.dec, v: m }; dso.push(dsoById.DC); }
      D = { n, ra, dec, mag, bv, con, xyz, grid, cell, named: js.named, hip, cons: js.cons, con: js.con, dso, dsoById, asterisms: js.asterisms };
      return D;
    });
    return loading;
  }
  function ready() { return !!D; }
  function starVec(i) { return [D.xyz[i * 3], D.xyz[i * 3 + 1], D.xyz[i * 3 + 2]]; }
  /* stars within r degrees of a J2000 unit vector, brighter than magLim */
  function near(v, r, magLim) {
    const rd = A.v2radec(v), out = [], cosr = Math.cos(r * D2R), seen = new Set();
    for (let d = rd.dec - r - 10; d <= rd.dec + r + 10; d += 5) {
      if (d < -90 || d > 90) continue;
      const cd = Math.max(0.02, Math.cos(Math.min(89.9, Math.abs(d)) * D2R)), span = Math.min(180, (r + 10) / cd);
      for (let a = rd.ra - span; a <= rd.ra + span + 5; a += 4) {
        const k = D.cell(A.n360(a), d); if (seen.has(k)) continue; seen.add(k);
        const L = D.grid.get(k); if (!L) continue;
        for (const i of L) if (D.mag[i] <= magLim && D.xyz[i * 3] * v[0] + D.xyz[i * 3 + 1] * v[1] + D.xyz[i * 3 + 2] * v[2] >= cosr) out.push(i);
      }
    }
    return out;
  }

  /* ── objects: "sun", "moon", a planet, "dso:M31", "star:12" ── */
  const PNAME = { sun: ["Sun", "Sol"], moon: ["Moon", "Luna"], mercury: ["Mercury", "Mercurio"], venus: ["Venus", "Venus"], mars: ["Mars", "Marte"],
    jupiter: ["Jupiter", "Júpiter"], saturn: ["Saturn", "Saturno"], uranus: ["Uranus", "Urano"], neptune: ["Neptune", "Neptuno"] };
  /* the bench's own targets and where each one really is */
  const ORIG = { moon: "moon", sea: "moon", jupiter: "jupiter", saturn: "saturn", mars: "mars", venus: "venus", uranus: "uranus", sun: "sun",
    orion: "dso:M42", pleiades: "dso:M45", andromeda: "dso:M31", m13: "dso:M13", ring: "dso:M57", m27: "dso:M27", dcluster: "dso:DC",
    mizar: "hip:65378", albireo: "hip:95947" };
  function skyId(benchId) {
    let s = ORIG[benchId]; if (!s) return null;
    if (s.startsWith("hip:")) { const i = D && D.hip[+s.slice(4)]; return i != null ? "star:" + i : null; }
    return s;
  }
  function benchId(sid) {
    for (const k of Object.keys(ORIG)) if (k !== "sea" && skyId(k) === sid) return k;
    if (sid === "dso:NGC 869" || sid === "dso:NGC 884") return "dcluster";
    return null;
  }
  function conName(ci, lang) { const c = D && D.con[ci - 1]; return c ? (lang === "es" ? c.es : c.en) : ""; }
  function name(id, lang) {
    const es = lang === "es";
    if (PNAME[id]) return PNAME[id][es ? 1 : 0];
    if (id.startsWith("dso:")) { const o = D.dsoById[id.slice(4)]; if (!o) return id; const nm = es ? (o.es || o.en) : o.en; return nm ? (o.id.startsWith("M") ? `${nm} (${o.id})` : nm) : o.id; }
    if (id.startsWith("star:")) {
      const i = +id.slice(5), nm = D.named[i];
      if (nm) { const n0 = es ? (nm[1] || nm[0]) : nm[0]; return n0 || nm[2]; }
      return (es ? "Estrella" : "Star") + " · " + D.mag[i].toFixed(1);
    }
    return id;
  }
  /* where an object is at a moment (J2000 unit vector) */
  function vec(ctx, id) {
    if (id === "sun") return A.sun(ctx).v;
    if (id === "moon") return A.moon(ctx).v;
    if (PNAME[id]) return A.planet(ctx, id).v;
    if (id.startsWith("dso:")) { const o = D.dsoById[id.slice(4)]; return o ? o.v : null; }
    if (id.startsWith("star:")) return starVec(+id.slice(5));
    return null;
  }
  function magOf(ctx, id) {
    if (id === "sun") return -26.7;
    if (id === "moon") return A.moon(ctx).mag;
    if (PNAME[id]) return A.planet(ctx, id).mag;
    if (id.startsWith("dso:")) { const o = D.dsoById[id.slice(4)]; return o ? o.mag : 99; }
    if (id.startsWith("star:")) return D.mag[+id.slice(5)];
    return 99;
  }
  const DSOKIND = { oc: ["Open star cluster", "Cúmulo abierto de estrellas"], gc: ["Globular star cluster", "Cúmulo globular"],
    s: ["Spiral galaxy", "Galaxia espiral"], s0: ["Lens-shaped galaxy", "Galaxia lenticular"], e: ["Elliptical galaxy", "Galaxia elíptica"],
    i: ["Irregular galaxy", "Galaxia irregular"], g: ["Galaxy", "Galaxia"], sd: ["Dwarf galaxy", "Galaxia enana"],
    en: ["Glowing gas cloud (nebula)", "Nube de gas que brilla (nebulosa)"], bn: ["Bright nebula", "Nebulosa brillante"],
    sfr: ["Star-forming cloud", "Nube donde nacen estrellas"], rn: ["Dusty cloud lit by stars", "Nube de polvo iluminada"],
    pn: ["Planetary nebula: gas from a dying star", "Nebulosa planetaria: gas de una estrella que muere"], snr: ["Remains of an exploded star", "Restos de una estrella que explotó"],
    dn: ["Dark dust cloud", "Nube oscura de polvo"], pos: ["Center of our galaxy", "Centro de nuestra galaxia"] };
  function colorWord(bv, es) {
    return bv < 0 ? (es ? "blanco azulada" : "blue-white") : bv < 0.3 ? (es ? "blanca" : "white") : bv < 0.6 ? (es ? "blanco amarillenta" : "yellow-white") :
      bv < 0.9 ? (es ? "amarilla" : "yellow") : bv < 1.4 ? (es ? "naranja" : "orange") : (es ? "rojiza" : "red-orange");
  }
  function kind(ctx, id, lang) {
    const es = lang === "es";
    if (id === "sun") return es ? "Nuestra estrella. Nunca la mires sin un filtro solar al frente." : "Our star. Never look at it without a solar filter on the front.";
    if (id === "moon") { const m = A.moon(ctx); return (es ? "La Luna · " : "The Moon · ") + Math.round(m.illum * 100) + (es ? "% iluminada · " : "% lit · ") + phaseName(m, lang); }
    if (PNAME[id]) { const p = A.planet(ctx, id), km = p.dist * 149.6; return (es ? "Planeta · a " : "Planet · ") + (km >= 1000 ? (km / 1000).toFixed(2) + (es ? " mil millones de km" : " billion km") : Math.round(km) + (es ? " millones de km" : " million km")) + (es ? "" : " away"); }
    if (id.startsWith("dso:")) { const o = D.dsoById[id.slice(4)]; const k = DSOKIND[o.t] || DSOKIND.g; return k[es ? 1 : 0] + (o.dim && o.dim[0] ? " · " + (o.dim[0] >= 60 ? (o.dim[0] / 60).toFixed(1) + "°" : Math.round(o.dim[0]) + "′") : ""); }
    if (id.startsWith("star:")) { const i = +id.slice(5), nm = D.named[i]; return (es ? "Estrella " : "A ") + colorWord(D.bv[i], es) + (es ? "" : " star") + (nm && nm[2] && nm[0] ? " · " + nm[2] : ""); }
    return "";
  }
  function constellationOf(id) {
    if (id.startsWith("star:")) return D.con[+id.slice(5)] || 0;
    return 0;
  }
  function phaseName(m, lang) {
    const es = lang === "es", k = m.illum, w = m.waxing;
    if (k < 0.03) return es ? "Luna nueva" : "New Moon";
    if (k > 0.97) return es ? "Luna llena" : "Full Moon";
    if (Math.abs(k - 0.5) < 0.06) return w ? (es ? "Cuarto creciente" : "First quarter") : (es ? "Cuarto menguante" : "Last quarter");
    if (k < 0.5) return w ? (es ? "Creciente" : "Waxing crescent") : (es ? "Menguante" : "Waning crescent");
    return w ? (es ? "Gibosa creciente" : "Waxing gibbous") : (es ? "Gibosa menguante" : "Waning gibbous");
  }
  const DIRS = { en: ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"], es: ["norte", "noreste", "este", "sureste", "sur", "suroeste", "oeste", "noroeste"] };
  function dirWord(az, lang) { return DIRS[lang === "es" ? "es" : "en"][Math.round(A.n360(az) / 45) % 8]; }
  function events(id, ms) {
    const v = (id === "sun" || id === "moon" || PNAME[id]) ? id : vec(null, id);
    return A.events(ms, ST.lat, ST.lon, v);
  }

  /* ── tonight: when it is dark, and the best things up then ── */
  const SHOW = ["moon", "jupiter", "saturn", "mars", "venus", "mercury", "dso:M45", "dso:M42", "dso:M31", "dso:M13", "hip:95947", "hip:65378", "dso:DC",
    "dso:M57", "dso:M27", "uranus", "dso:M44", "dso:M8", "dso:M22", "dso:M4", "dso:M11", "dso:M15", "dso:M92", "dso:M3", "dso:M5", "dso:M35",
    "dso:M36", "dso:M37", "dso:M38", "dso:M41", "dso:M47", "dso:M81", "dso:M51", "dso:M33", "dso:M6", "dso:M7", "dso:M2", "dso:M103",
    "dso:NGC 5139", "dso:NGC 104", "dso:NGC 3372", "dso:PGC 17223", "dso:NGC 292", "dso:NGC 457", "dso:NGC 7662", "dso:C 41", "neptune"];
  function resolve(s) { if (s.startsWith("hip:")) { const i = D.hip[+s.slice(4)]; return i != null ? "star:" + i : null; } return s; }
  function darkTonight(ms) {
    /* the start of the coming (or current) night: the Sun 12° below the horizon */
    const c = A.at(ms, ST.lat, ST.lon), sa = A.horiz(c, A.sun(c).v, true).alt;
    if (sa < -12) return ms;
    return A.sunDown(ms, ST.lat, ST.lon, -12) || A.sunDown(ms, ST.lat, ST.lon, -6) || ms;
  }
  function tonight(ms) {
    const t = darkTonight(ms), c = A.at(t, ST.lat, ST.lon), out = [];
    for (const s of SHOW) {
      const id = resolve(s); if (!id) continue;
      const v = vec(c, id); if (!v) continue;
      const h = A.horiz(c, v), need = PNAME[id] || id === "moon" ? 8 : 20;
      if (h.alt < need) continue;
      if (id === "moon" && A.moon(c).illum < 0.04) continue;
      out.push({ id, alt: h.alt, az: h.az });
      if (out.length >= 10) break;
    }
    return { at: t, list: out };
  }
  /* the Find menu */
  function findList(lang) {
    const es = lang === "es", g = [];
    g.push([es ? "El Sol, la Luna y los planetas" : "Sun, Moon and planets", ["moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "sun"]]);
    const bench = ["dso:M42", "dso:M45", "dso:M31", "dso:M13", "dso:M57", "dso:M27", "dso:DC", resolve("hip:65378"), resolve("hip:95947")].filter(Boolean);
    g.push([es ? "Los objetos de la mesa" : "The bench's targets", bench]);
    const stars = []; for (let i = 0; i < D.n && stars.length < 40; i++) { const nm = D.named[i]; if (nm && nm[0] && D.mag[i] < 2.2) stars.push("star:" + i); }
    stars.sort((a, b) => name(a, lang).localeCompare(name(b, lang)));
    g.push([es ? "Estrellas brillantes" : "Bright stars", stars]);
    g.push([es ? "Catálogo Messier" : "Messier catalog", D.dso.filter(o => /^M\d/.test(o.id)).sort((a, b) => +a.id.slice(1) - +b.id.slice(1)).map(o => "dso:" + o.id)]);
    g.push([es ? "Más joyas" : "More showpieces", D.dso.filter(o => !/^M\d/.test(o.id) && o.id !== "GC").map(o => "dso:" + o.id)]);
    return g;
  }

  window.AOGSkyData = { CITIES, ST, save, setCity, setLatLon, now, setTime, parts, wallToMs, inputValue, fromInput, fmtTime, fmtDate, deviceTZ,
    load, ready, data: () => D, starVec, near, name, vec, magOf, kind, phaseName, dirWord, events, tonight, darkTonight, findList, skyId, benchId,
    conName, constellationOf, PNAME, DSOKIND };
})();
