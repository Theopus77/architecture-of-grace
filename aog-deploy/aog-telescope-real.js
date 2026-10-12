/* AOG-TELE-REAL-EYE-V1 (2026-10-12) — the eyepiece, tonight. When "Real sky" is on, the target is drawn as it really is
   at the chosen time and place: the Moon's real phase, tilt and libration; Jupiter's four big moons where they are;
   Saturn's rings at their real tilt; Venus, Mercury and Mars with their real phase and size; field stars from the
   catalog around the target (plus the faint ones the telescope adds, as many as the real sky has); and the air: a low
   object is dimmer, blurrier and warmer, a bright sky (twilight, moonlight, city glow) hides the faint things, and an
   object below the horizon is not there at all ("It rises at 9:40 PM").
   "Up" in the glass is up in the sky (toward the zenith), as in a Dobsonian. Loaded only with the real sky.
   It draws with the page's own functions (airy, the bakes, DRAW) so the practice and real views look alike. */
(function () {
  "use strict";
  const A = window.AOGAstro, K = window.AOGSkyData, D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const GP = A.radec2v(192.85948, 27.12825);            /* the north galactic pole */
  const say = (lang, en, es) => lang === "es" ? es : en;
  function bvColor(bv) {
    if (bv < -0.1) return "#c4d6ff"; if (bv < 0.15) return "#dfe8ff"; if (bv < 0.45) return "#f4f4fb";
    if (bv < 0.75) return "#fff1dc"; if (bv < 1.1) return "#ffe0b6"; if (bv < 1.45) return "#ffcf98"; return "#ffbb80";
  }
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed | 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* the target as a sky object id ("x:…" from the map, or the bench's own) */
  function sidOf(L) { const t = L.target || ""; return t.startsWith("x:") ? t.slice(2) : K.skyId(t); }
  let memo = { key: "", v: null };
  function info(L) {
    const ms = K.now(), key = [ms, K.ST.lat, K.ST.lon, L.target].join("|");
    if (memo.key === key) return memo.v;
    const c = A.at(ms, K.ST.lat, K.ST.lon), sid = sidOf(L);
    const sun = A.sun(c), sunH = A.horiz(c, sun.v);
    const o = { c, ms, sid, sunAlt: sunH.alt };
    if (sid) {
      o.v = K.vec(c, sid); o.h = A.horiz(c, o.v); o.mag = K.magOf(c, sid);
      o.alt = o.h.alt + (sid === "moon" ? A.moon(c).diam / 7200 : 0);
      o.X = A.airmass(Math.max(0, o.h.alt));
      if (o.alt < 0) { const e = K.events(sid, ms); o.rise = e.rise; o.never = e.never; }
    }
    memo = { key, v: o };
    return o;
  }
  /* how bright the sky is beyond the city glow: twilight and moonlight (linear, like the page's glow) */
  function skyAdd(o) {
    let add = 0;
    if (o.sunAlt > -18 && o.sunAlt <= -12) add += 0.02 * Math.pow(10, (o.sunAlt + 12) / 3);
    const m = A.moon(o.c), mh = A.horiz(o.c, m.v);
    if (mh.alt > 0 && o.sid !== "moon") add += 0.006 * m.illum * m.illum * Math.sin(mh.alt * D2R);
    return add;
  }
  function tlmEff(o) {
    const base = [0, 0.0005, 0.0008, 0.0013, 0.0021, 0.0036, 0.0062, 0.010, 0.016, 0.024][OPT.bortle];
    return limitMag() - 0.2 * Math.max(0, (o.X || 1) - 1) - 1.25 * Math.log10(1 + skyAdd(o) / base);
  }
  function twilightCss(sa) {
    /* a calm gradient by the real Sun altitude: deep blue at −12°, brighter blue near 0° */
    const u = Math.max(0, Math.min(1, (sa + 12) / 12));
    const mix = (a, b) => a.map((x, i) => Math.round(x + (b[i] - x) * u));
    const c = mix([10, 16, 34], [96, 130, 178]);
    return { css: `rgb(${c[0]},${c[1]},${c[2]})`, twi: true };
  }

  function view(L, lang) {
    const o = info(L), R = { state: "ok", sky: "night", glow: 1, skyAdd: 0, seeingMul: 1, bright: false };
    const isSun = L.target === "sun";
    if (!o.sid) { R.state = "nopos"; R.draw = (ctx) => { drawStars(ctx); if (DRAW[L.target]) DRAW[L.target](ctx); }; R.atmosphere = () => {}; return R; }
    if (o.alt < 0) R.state = "below";
    if (o.sunAlt > -0.5) { R.sky = "day"; R.bright = true; }
    else if (o.sunAlt > -12) { R.sky = twilightCss(o.sunAlt); R.bright = o.sunAlt > -4; }
    R.skyAdd = R.sky === "night" ? skyAdd(o) : 0;
    /* in daylight only the Sun (through its filter), the Moon and the brightest planets show */
    if (R.state === "ok" && R.sky === "day" && !isSun && !(o.mag < -1.8)) R.state = "washed";
    if (R.state === "ok" && isSun && o.alt > 0) R.sky = "day";
    R.seeingMul = Math.min(4, Math.pow(o.X || 1, 0.6));
    R.draw = (ctx, viewArc) => {
      if (R.state === "washed") return;
      const fr = A.frameAt(o.c, o.v);
      drawField(ctx, o, fr, viewArc, L, R);
      drawTarget(ctx, o, fr, L);
    };
    R.atmosphere = (ctx, w, h) => {
      const X = o.X || 1; if (X < 1.25 || R.state !== "ok") return;
      const dim = Math.pow(10, -0.4 * 0.2 * (X - 1)), rr = Math.min(1, dim * 1.02), gg = Math.max(0, dim * (1 - 0.035 * (X - 1))), bb = Math.max(0, dim * (1 - 0.075 * (X - 1)));
      ctx.save(); ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = `rgb(${Math.round(255 * rr)},${Math.round(255 * Math.min(1, gg))},${Math.round(255 * Math.min(1, bb))})`; ctx.fillRect(0, 0, w, h); ctx.restore();
    };
    R.belowText = (ctx, cx, cy, r) => {
      const lines = blockedLines(L, lang, o);
      ctx.save(); ctx.fillStyle = "rgba(10,14,20,.94)"; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      /* a soft dark hill where the object would be */
      const g = ctx.createLinearGradient(0, cy + r * 0.1, 0, cy + r); g.addColorStop(0, "rgba(28,34,30,0)"); g.addColorStop(1, "rgba(28,34,30,.9)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - r, cy + r * 0.35); ctx.bezierCurveTo(cx - r * 0.3, cy + r * 0.15, cx + r * 0.3, cy + r * 0.45, cx + r, cy + r * 0.25); ctx.lineTo(cx + r, cy + r); ctx.lineTo(cx - r, cy + r); ctx.fill();
      ctx.fillStyle = "#eef2f4"; ctx.textAlign = "center";
      const fs = Math.max(13, Math.round(r * 0.075));
      ctx.font = `700 ${fs}px "Source Sans 3", sans-serif`;
      lines.forEach((ln, i) => ctx.fillText(ln, cx, cy - fs * 0.6 + i * fs * 1.35));
      ctx.restore();
    };
    return R;
  }
  function blockedLines(L, lang, o) {
    o = o || info(L);
    if (o.never) return [say(lang, "It is below the horizon now.", "Está bajo el horizonte ahora."), say(lang, "It does not rise in the next day.", "No sale en las próximas 24 horas.")];
    return [say(lang, "It is below the horizon now.", "Está bajo el horizonte ahora."),
      o.rise ? say(lang, "It rises at " + K.fmtTime(o.rise, lang) + ".", "Sale a las " + K.fmtTime(o.rise, lang) + ".") : ""];
  }
  /* the words that replace the bench note when the object cannot be seen right now */
  function blocked(L, lang) {
    const o = info(L);
    if (!o.sid) return "";
    if (o.alt < 0) return blockedLines(L, lang, o).join(" ");
    if (o.sunAlt > -0.5 && L.target !== "sun" && !(o.mag < -1.8))
      return say(lang, "The Sun is up. The sky is too bright to see it now. Try after dark, or press Tonight on the star map.", "El Sol está arriba. El cielo está demasiado claro para verlo ahora. Prueba de noche, o toca Esta noche en el mapa del cielo.");
    return "";
  }

  /* ── the field: catalog stars, then the faint ones this telescope adds ── */
  function drawField(ctx, o, fr, viewArc, L, R) {
    const tlm = tlmEff(o), shift = 11.6 - tlm, d = K.data();
    const radiusDeg = viewArc / 60 * 0.8 + 0.05;
    const EXCL = { pleiades: 62, dcluster: 0, mizar: 14, albireo: 1, orion: 14, m13: 6, ring: 1, m27: 4, andromeda: 0 };
    const ex = EXCL[L.target] || 0, self = o.sid && o.sid.startsWith("star:") ? +o.sid.slice(5) : -1;
    const list = K.near(o.v, radiusDeg, Math.min(6.5, tlm));
    for (const i of list) {
      if (i === self) continue;
      const off = A.offset(fr, K.starVec(i)); if (!off) continue;
      if (ex && Math.hypot(off.x, off.y) < ex) continue;
      const m = d.mag[i] + 0.2 * Math.max(0, (o.X || 1) - 1);
      airy(ctx, off.x, -off.y, Math.max(-1, m + shift * (m > 3 ? 1 : 0.4)), bvColor(d.bv[i]));
    }
    const OWN = { andromeda: 1, uranus: 1, orion: 1, pleiades: 1, ring: 1, m13: 1, dcluster: 1, m27: 1 };
    if (OWN[L.target] || tlm <= 6.6) return;
    /* the real count: about 10^(0.43 m − 3.4) stars brighter than m in each square degree, more near the Milky Way */
    const b = Math.asin(Math.max(-1, Math.min(1, A.dot(o.v, GP)))) * R2D;
    const gal = 0.55 + 4.2 * Math.exp(-Math.abs(b) / 9);
    const side = viewArc * 1.3, area = (side / 60) * (side / 60);
    const N0 = Math.pow(10, 0.43 * 6.5 - 3.4), N1 = Math.pow(10, 0.43 * tlm - 3.4);
    const n = Math.min(1400, Math.round((N1 - N0) * area * gal));
    const r = rng(hash(o.sid || "x"));
    const Q0 = Math.pow(10, 0.43 * 6.5), Q1 = Math.pow(10, 0.43 * tlm);
    /* the faint stars are fixed to the sky: placed in a square around the target that turns with "up" */
    const ang = A.dirAngle(fr, fr.north) - Math.PI / 2, ca = Math.cos(ang), sa = Math.sin(ang);
    for (let k = 0; k < n; k++) {
      const x0 = (r() - 0.5) * side, y0 = (r() - 0.5) * side, m = Math.log10(Q0 + r() * (Q1 - Q0)) / 0.43, c = r();
      const x = x0 * ca - y0 * sa, y = x0 * sa + y0 * ca;
      airy(ctx, x, -y, m + shift, c < .14 ? "#f4d6b8" : c < .22 ? "#ffd9a0" : c < .34 ? "#cfe0ff" : "#e8eeff");
    }
  }

  /* ── the target ── */
  const cache = {};
  function cached(name, key, make) { if (cache[name] && cache[name].key === key) return cache[name].img; const img = make(); cache[name] = { key, img }; return img; }
  const deg = r => r * R2D, rad = d => d * D2R;
  function moonGeom(o, fr) {
    const m = A.moon(o.c), s = A.sun(o.c);
    const psi = deg(A.dirAngle(fr, m.pole)), th = deg(A.dirAngle(fr, s.v));
    return { m, psi, th, roll: psi - th - 90 };
  }
  function drawMoonReal(ctx, o, fr) {
    const g = moonGeom(o, fr), m = g.m;
    const q = (x, s) => Math.round(x / s) * s;
    const opt = { i: q(m.phase, 1.5), l: q(m.libL, 1), b: q(m.libB, 1), roll: q(((g.roll % 360) + 540) % 360 - 180, 2), shine: 0.025 + 0.11 * Math.pow(Math.max(0, (m.phase - 90) / 90), 1.5) };
    const img = cached("moon", JSON.stringify(opt), () => moonLight(opt));
    const d = m.diam / 60 * 1800 / 1794;
    ctx.save(); ctx.rotate(-rad(g.th)); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, -d / 2, -d / 2, d, d); ctx.restore();
  }
  /* where a spot on the Moon (selenographic lat, lon) sits in the eyepiece, arcminutes (canvas x right, y down) */
  function moonSpot(o, fr, lat, lon) {
    const g = moonGeom(o, fr), m = g.m;
    const la = rad(lat), lo = rad(lon - m.libL), b = rad(m.libB), ro = rad(g.roll), th = rad(g.th);
    const x = Math.cos(la) * Math.sin(lo), y = Math.sin(la), z = Math.cos(la) * Math.cos(lo);
    const y1 = y * Math.cos(b) - z * Math.sin(b);
    const x2 = x * Math.cos(ro) - y1 * Math.sin(ro), y2 = x * Math.sin(ro) + y1 * Math.cos(ro);
    const sx = x2 * Math.cos(th) - y2 * Math.sin(th), sy = x2 * Math.sin(th) + y2 * Math.cos(th), R = m.diam / 120;
    return [sx * R, -sy * R];
  }
  function rotNorth(ctx, fr, pole) { const psi = A.dirAngle(fr, pole); ctx.rotate(-(psi - Math.PI / 2)); return psi; }
  function drawTarget(ctx, o, fr, L) {
    const sid = o.sid, c = o.c;
    if (sid === "moon") return drawMoonReal(ctx, o, fr);
    if (sid === "sun") { const k = A.sun(c).diam / 1920; ctx.save(); ctx.scale(k, k); DRAW.sun(ctx); ctx.restore(); return; }
    if (sid === "jupiter") {
      const p = A.planet(c, "jupiter"), k = p.diam / 42, img = cached("jup", "j", () => bakeJupiter({ shadow: false }));
      ctx.save(); const psi = rotNorth(ctx, fr, p.pole); ctx.scale(k, k); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, -0.46, -0.46, 0.92, 0.92); ctx.restore();
      const Rj = p.diam / 120, w = psi - Math.PI / 2;
      A.jupiterMoons(c.jd).forEach(mn => {
        if (!mn.front && Math.abs(mn.X) < 1 && Math.abs(mn.Y) < 1) return;   /* behind the planet */
        const x = (mn.X * Math.cos(w) + mn.Y * Math.cos(psi)) * Rj, y = (mn.X * Math.sin(w) + mn.Y * Math.sin(psi)) * Rj;
        airy(ctx, x, -y, mn.mag + (11.6 - tlmEff(o)) * 0.3, "#f6f1e6");
      });
      return;
    }
    if (sid === "saturn") {
      const p = A.planet(c, "saturn"), open = Math.abs(Math.sin(rad(p.ringB))), key = open.toFixed(2);
      const img = cached("sat", key, () => bakeSaturn({ open }));
      const k = p.diam / (0.158 * 2 * 60);
      ctx.save(); rotNorth(ctx, fr, p.pole); ctx.scale(k, p.ringB < 0 ? -k : k); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, -0.58, -0.58, 1.16, 1.16); ctx.restore();
      return;
    }
    if (sid === "mars") {
      const p = A.planet(c, "mars"), s = A.sun(c), psi = A.dirAngle(fr, p.pole), th = A.dirAngle(fr, s.v);
      const a = th - psi + Math.PI / 2, i = rad(p.phase);
      const q = (x, st) => Math.round(x / st) * st;
      const opt = { cm: q(p.cm, 3), tilt: q(p.subEarthLat, 2), mirror: true, L: [Math.sin(i) * Math.cos(q(a, 0.08)), Math.sin(i) * Math.sin(q(a, 0.08)), Math.cos(i)] };
      const img = cached("mars", JSON.stringify(opt), () => bakeMars(opt)), k = p.diam / 15.5;
      ctx.save(); ctx.rotate(-(psi - Math.PI / 2)); ctx.scale(k, k); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, -0.20, -0.20, 0.40, 0.40); ctx.restore();
      return;
    }
    if (sid === "venus" || sid === "mercury") {
      const p = A.planet(c, sid), th = A.dirAngle(fr, A.sun(c).v), k = p.diam / 45;
      const tint = sid === "venus" ? [1, 0.985, 0.93] : [0.93, 0.87, 0.80], key = Math.round(p.phase) + sid;
      const img = cached(sid, key, () => bakeVenus({ phase: Math.round(p.phase), tint }));
      const kk = Math.hypot(ctx.getTransform().a, ctx.getTransform().b) || 1, R0 = 0.375 * k;
      if (sid === "venus") { const gl = ctx.createRadialGradient(0, 0, R0 * 0.5, 0, 0, R0 + 40 / kk); gl.addColorStop(0, "rgba(255,250,236,.45)"); gl.addColorStop(0.35, "rgba(255,250,236,.14)"); gl.addColorStop(1, "rgba(255,250,236,0)");
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, R0 + 40 / kk, 0, 6.3); ctx.fill(); }
      ctx.save(); ctx.rotate(-(th - Math.PI)); ctx.scale(k, k); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, -0.55, -0.55, 1.1, 1.1); ctx.restore();
      return;
    }
    if (sid === "uranus" || sid === "neptune") {
      const p = A.planet(c, sid), k = p.diam / 3.7;
      ctx.save(); ctx.scale(k, k);
      if (sid === "uranus") DRAW.uranus(ctx);
      else { const Rr = 0.031, kk = Math.hypot(ctx.getTransform().a, ctx.getTransform().b) || 1;
        if (Rr * kk < 1.1) airy(ctx, 0, 0, 7.8, "#a9c4f5");
        else { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, Rr); g.addColorStop(0, "#b4cbf6"); g.addColorStop(1, "#6f8fd0"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, Rr, 0, 6.3); ctx.fill(); } }
      ctx.restore(); return;
    }
    /* the bench's own deep-sky drawings and doubles are drawn north up, east right; turn them to tonight's sky */
    const bid = L.target.startsWith("x:") ? K.benchId(sid) : L.target;
    if (bid && DRAW[bid] && bid !== "moon" && bid !== "sea") {
      const psi = A.dirAngle(fr, fr.north), e = psi + Math.PI / 2;
      ctx.save(); ctx.transform(Math.cos(e), -Math.sin(e), -Math.cos(psi), Math.sin(psi), 0, 0); DRAW[bid](ctx); ctx.restore(); return;
    }
    if (sid.startsWith("star:")) { const d = K.data(), i = +sid.slice(5); airy(ctx, 0, 0, d.mag[i] + (11.6 - tlmEff(o)) * (d.mag[i] > 3 ? 1 : 0.4), bvColor(d.bv[i])); return; }
    if (sid.startsWith("dso:")) return drawDso(ctx, K.data().dsoById[sid.slice(4)], o, fr);
  }
  /* any other deep-sky object, drawn from its catalog type, size and brightness */
  function drawDso(ctx, d, o, fr) {
    if (!d) return;
    const r = rng(hash(d.id)), w = Math.max(0.3, (d.dim[0] || 2)), h = Math.max(0.25, (d.dim[1] || d.dim[0] || 2));
    const sb = (d.mag < 90 ? d.mag : 9) + 2.5 * Math.log10(Math.max(0.05, w * h * 0.785));
    const tlm = tlmEff(o), bright = Math.max(0.05, Math.min(0.9, (15.2 - sb) / 7 + (tlm - 11.6) * 0.08)) * Math.min(1.6, Math.sqrt(SCOPE.mm / 90));
    const psi = A.dirAngle(fr, fr.north), pa = r() * Math.PI;
    const t = d.t;
    ctx.save(); ctx.rotate(-(psi - Math.PI / 2) + pa);
    const glow = (rx, ry, a, col) => { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(0.35, `rgba(${col},${a * 0.45})`); g.addColorStop(1, `rgba(${col},0)`);
      ctx.save(); ctx.scale(rx, ry); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, 6.3); ctx.fill(); ctx.restore(); };
    if (/^(s|s0|e|i|g|sd)$/.test(t)) { glow(w * 0.42, h * 0.42, bright * 0.55, "214,214,200"); glow(w * 0.1, h * 0.1, Math.min(1, bright * 1.4), "238,234,220"); }
    else if (t === "gc") { glow(w * 0.38, w * 0.38, bright * 0.8, "226,226,214"); if (tlm > 11.5) for (let k = 0; k < 90; k++) { const a = r() * 6.28, rr = w * 0.12 + Math.pow(r(), 0.7) * w * 0.4; airy(ctx, Math.cos(a) * rr, Math.sin(a) * rr, 9.6 + r() * 1.6 + (11.6 - tlm), "#f0ece0"); } }
    else if (t === "oc") { const n = Math.max(12, Math.min(140, Math.round(18 * Math.pow(10, 0.18 * (8 - d.mag)) * Math.min(3, w / 10)))); for (let k = 0; k < n; k++) { const a = r() * 6.28, rr = Math.sqrt(r()) * w * 0.5; const c = r(); airy(ctx, Math.cos(a) * rr, Math.sin(a) * rr, d.mag + 1.5 + Math.pow(r(), 0.5) * 5 + (11.6 - tlm), c < .2 ? "#ffd9a0" : c < .4 ? "#cfe0ff" : "#eef2ff"); } }
    else if (t === "pn") { glow(w * 0.5, h * 0.5, Math.min(0.9, bright * 1.3), d.mag < 9.5 ? "176,226,214" : "210,214,206"); }
    else if (t === "dn") { /* a dark cloud: only fewer stars, nothing to draw */ }
    else { for (let k = 0; k < 7; k++) { const a = r() * 6.28, rr = r() * 0.3; glow(w * (0.18 + r() * 0.25), h * (0.15 + r() * 0.25), bright * 0.35, "206,214,204"); ctx.translate(Math.cos(a) * rr * w * 0.3, Math.sin(a) * rr * h * 0.3); } }
    ctx.restore();
  }

  /* ── words ── */
  function whereLine(lang) {
    const ms = K.now(), live = K.ST.mode !== "set";
    const place = K.ST.name || (K.ST.lat.toFixed(2) + "°, " + K.ST.lon.toFixed(2) + "°");
    return `${place} · ${K.fmtDate(ms, lang)} · ${K.fmtTime(ms, lang)}${live ? say(lang, " (now)", " (ahora)") : ""}`;
  }
  function eyeLine(L, lang) {
    const o = info(L); if (!o.sid) return say(lang, "A practice target: it has no place in the real sky.", "Un objeto de práctica: no tiene lugar en el cielo real.");
    const place = (K.ST.name || "").split(",")[0] || (K.ST.lat.toFixed(1) + "°");
    const where = o.alt < 0 ? say(lang, "below the horizon", "bajo el horizonte") : Math.round(o.h.alt) + "° " + say(lang, "up, ", "de altura, ") + K.dirWord(o.h.az, lang);
    return `${place} · ${K.fmtTime(o.ms, lang)} · ${K.name(o.sid, lang)}: ${where}`;
  }
  function noteLine(L, lang) {
    const o = info(L); if (!o.sid || o.alt < 0) return "";
    const c = o.c, sid = o.sid; let s = "";
    if (sid === "moon") { const m = A.moon(c); s = say(lang, ` Tonight the Moon is ${Math.round(m.illum * 100)}% lit (${K.phaseName(m, lang).toLowerCase()}). Its slow rocking (libration) shows ${Math.abs(m.libB).toFixed(1)}° more of its ${m.libB > 0 ? "north" : "south"} edge and ${Math.abs(m.libL).toFixed(1)}° more of its ${m.libL > 0 ? "east" : "west"} edge.`,
      ` Esta noche la Luna está ${Math.round(m.illum * 100)}% iluminada (${K.phaseName(m, lang).toLowerCase()}). Su lento balanceo (libración) muestra ${Math.abs(m.libB).toFixed(1)}° más de su borde ${m.libB > 0 ? "norte" : "sur"} y ${Math.abs(m.libL).toFixed(1)}° más de su borde ${m.libL > 0 ? "este" : "oeste"}.`); }
    else if (sid === "jupiter") { const p = A.planet(c, sid); s = say(lang, ` Jupiter is ${p.diam.toFixed(0)}″ across tonight. Io, Europa, Ganymede and Callisto are where they really are; by tomorrow they will have moved.`, ` Júpiter mide ${p.diam.toFixed(0)}″ esta noche. Ío, Europa, Ganímedes y Calisto están donde de verdad están; mañana se habrán movido.`); }
    else if (sid === "saturn") { const p = A.planet(c, sid); s = say(lang, ` Saturn's rings are tipped ${Math.abs(p.ringB).toFixed(1)}° toward us, showing their ${p.ringB < 0 ? "south" : "north"} face. They were edge-on in 2025.`, ` Los anillos de Saturno están inclinados ${Math.abs(p.ringB).toFixed(1)}° hacia nosotros y muestran su cara ${p.ringB < 0 ? "sur" : "norte"}. Estaban de canto en 2025.`); }
    else if (sid === "venus" || sid === "mercury") { const p = A.planet(c, sid); s = say(lang, ` ${K.name(sid, lang)} is ${Math.round(p.illum * 100)}% lit and ${p.diam.toFixed(0)}″ across tonight. Like the Moon, it shows phases.`, ` ${K.name(sid, lang)} está ${Math.round(p.illum * 100)}% iluminado y mide ${p.diam.toFixed(0)}″ esta noche. Como la Luna, tiene fases.`); }
    else if (sid === "mars") { const p = A.planet(c, sid); s = say(lang, ` Mars is ${p.diam.toFixed(1)}″ across tonight. Its size changes a lot: about 14″ when Earth passed it in January 2025.`, ` Marte mide ${p.diam.toFixed(1)}″ esta noche. Su tamaño cambia mucho: unos 14″ cuando la Tierra lo pasó en enero de 2025.`); }
    if (o.h.alt < 20) s += say(lang, ` It is only ${Math.round(o.h.alt)}° up. You look through much more air, so it is dimmer, blurrier and a little orange.`, ` Está a solo ${Math.round(o.h.alt)}° de altura. Miras a través de mucho más aire: se ve más tenue, más borroso y algo naranja.`);
    if (o.sunAlt > -12 && o.sunAlt <= -0.5) s += say(lang, " Twilight: the sky is still blue, so faint things hide.", " Crepúsculo: el cielo aún es azul y lo tenue se esconde.");
    return s;
  }
  function lookFor(sid, lang) { const c = A.at(K.now(), K.ST.lat, K.ST.lon); return K.kind(c, sid, lang); }
  function spot(id) {
    const L = { target: id }, o = info(L);
    if (!o.sid || o.alt < 0) return [0, 0];
    const fr = A.frameAt(o.c, o.v);
    if (id === "sea") return moonSpot(o, fr, 0.67, 23.47);
    return [0, 0];
  }
  window.AOGReal = { view, blocked, whereLine, eyeLine, noteLine, lookFor, spot, info, bvColor, sidOf };
})();
