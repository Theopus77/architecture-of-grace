/* AOG-TELE-ASTRO-V1 (2026-10-12) — Jimmy: "a quantum leap forward … a BIG LEAP" in the Telescope.
   The real sky, worked out on the device for any date, time and place. No outside service, no data sent.

   Low precision but honest: well under a degree everywhere (most things under an arcminute).
     · Sun and planets: J2000 Keplerian elements and rates, E. M. Standish, "Keplerian Elements for Approximate
       Positions of the Major Planets" (JPL, Table 1, valid 1800–2050), with light-time.
     · Moon: J. Meeus, Astronomical Algorithms (2nd ed., 1998), ch. 47, the main terms of tables 47.A and 47.B,
       with topocentric parallax (the Moon shifts up to a degree depending on where you stand).
     · Moon phase (ch. 48), optical libration (ch. 53), Jupiter's four big moons (ch. 44, low accuracy),
       Saturn's ring tilt (ch. 45 / IAU pole), planet magnitudes (ch. 41), precession (ch. 21), sidereal time (ch. 12).
   Everything is kept as unit vectors in the J2000 equatorial frame (the frame of the star catalog); one matrix turns
   that into the local sky (east, north, up) for the chosen moment and place.
   Loaded only when the star map or the real sky is opened. Works in a page (window.AOGAstro) and in Node. */
(function (root) {
  "use strict";
  const D2R = Math.PI / 180, R2D = 180 / Math.PI, AU_KM = 149597870.7, ER_KM = 6378.14;
  const n360 = x => ((x % 360) + 360) % 360;
  const n180 = x => { x = n360(x); return x > 180 ? x - 360 : x; };
  const sin = x => Math.sin(x * D2R), cos = x => Math.cos(x * D2R);
  const DT_SEC = 69.2;                         /* ΔT (TT − UT) for the 2020s */
  const EPS0 = 23.4392911;                     /* obliquity of the ecliptic at J2000 */

  /* ── vectors and matrices ── */
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const scl = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const len = a => Math.hypot(a[0], a[1], a[2]);
  const unit = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const mv = (M, v) => [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]];
  const mtv = (M, v) => [M[0] * v[0] + M[3] * v[1] + M[6] * v[2], M[1] * v[0] + M[4] * v[1] + M[7] * v[2], M[2] * v[0] + M[5] * v[1] + M[8] * v[2]];
  const mm = (A, B) => { const C = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]; return C; };
  const radec2v = (ra, dec) => [cos(dec) * cos(ra), cos(dec) * sin(ra), sin(dec)];
  const v2radec = v => { const u = unit(v); return { ra: n360(Math.atan2(u[1], u[0]) * R2D), dec: Math.asin(Math.max(-1, Math.min(1, u[2]))) * R2D }; };
  const ecl2eq = (v, eps) => [v[0], v[1] * cos(eps) - v[2] * sin(eps), v[1] * sin(eps) + v[2] * cos(eps)];
  const eq2ecl = (v, eps) => [v[0], v[1] * cos(eps) + v[2] * sin(eps), -v[1] * sin(eps) + v[2] * cos(eps)];
  const angle = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(unit(a), unit(b))))) * R2D;

  /* ── time ── */
  const jdOf = ms => ms / 86400000 + 2440587.5;
  const msOf = jd => (jd - 2440587.5) * 86400000;
  const centuriesTT = jdUT => (jdUT + DT_SEC / 86400 - 2451545) / 36525;
  function gmst(jdUT) {            /* Meeus 12.4, degrees */
    const d = jdUT - 2451545, T = d / 36525;
    return n360(280.46061837 + 360.98564736629 * d + 0.000387933 * T * T - T * T * T / 38710000);
  }
  function precession(T) {         /* Meeus 21.2–21.4, J2000 → mean equator and equinox of date */
    const as = 1 / 3600;
    const z0 = (2306.2181 * T + 0.30188 * T * T + 0.017998 * T * T * T) * as;
    const z = (2306.2181 * T + 1.09468 * T * T + 0.018203 * T * T * T) * as;
    const th = (2004.3109 * T - 0.42665 * T * T - 0.041833 * T * T * T) * as;
    const cz0 = cos(z0), sz0 = sin(z0), cz = cos(z), sz = sin(z), ct = cos(th), st = sin(th);
    return [cz0 * ct * cz - sz0 * sz, -sz0 * ct * cz - cz0 * sz, -st * cz,
            cz0 * ct * sz + sz0 * cz, -sz0 * ct * sz + cz0 * cz, -st * sz,
            cz0 * st, -sz0 * st, ct];
  }

  /* ── the planets: Standish Table 1 (a AU, e, I°, L°, ϖ°, Ω°) and rates per century ── */
  const EL = {
    mercury: [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593, 0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
    venus: [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255, 0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
    earth: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0, 0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
    mars: [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891, 0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
    jupiter: [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909, -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
    saturn: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448, -0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
    uranus: [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503, -0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589],
    neptune: [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574, 0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]
  };
  /* heliocentric position, AU, J2000 ecliptic */
  function helio(name, T) {
    const E0 = EL[name];
    const a = E0[0] + E0[6] * T, e = E0[1] + E0[7] * T, I = E0[2] + E0[8] * T, L = E0[3] + E0[9] * T, wb = E0[4] + E0[10] * T, Om = E0[5] + E0[11] * T;
    const w = wb - Om, M = n180(L - wb);
    let E = M + R2D * e * sin(M);
    for (let k = 0; k < 8; k++) { const dM = M - (E - R2D * e * sin(E)); E += dM / (1 - e * cos(E)); }
    const xp = a * (cos(E) - e), yp = a * Math.sqrt(1 - e * e) * sin(E);
    const cw = cos(w), sw = sin(w), cO = cos(Om), sO = sin(Om), cI = cos(I), sI = sin(I);
    return [(cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
            (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
            (sw * sI) * xp + (cw * sI) * yp];
  }
  /* body facts: diameter at 1 AU (arcsec, equatorial) and its flattening, the IAU pole (J2000 RA/Dec) */
  const BODY = {
    mercury: { d1: 6.74, pole: [281.01, 61.45], col: "#cbbfae" },
    venus: { d1: 16.92, pole: [272.76, 67.16], col: "#fff6dc" },
    mars: { d1: 9.36, flat: 0.0059, pole: [317.681, 52.887], col: "#e8935a" },
    jupiter: { d1: 196.94, flat: 0.0649, pole: [268.057, 64.495], col: "#efdcbc" },
    saturn: { d1: 165.6, flat: 0.098, pole: [40.589, 83.537], col: "#ead9a8" },
    uranus: { d1: 70.48, flat: 0.023, pole: [257.311, -15.175], col: "#bfe3e6" },
    neptune: { d1: 68.30, flat: 0.017, pole: [299.36, 43.46], col: "#8fb3f0" }
  };

  /* ── the Moon: Meeus ch. 47, main terms (D, M, M′, F, Σl in 1e-6°, Σr in 1e-3 km) ── */
  const MLR = [
    [0, 0, 1, 0, 6288774, -20905355], [2, 0, -1, 0, 1274027, -3699111], [2, 0, 0, 0, 658314, -2955968], [0, 0, 2, 0, 213618, -569925],
    [0, 1, 0, 0, -185116, 48888], [0, 0, 0, 2, -114332, -3149], [2, 0, -2, 0, 58793, 246158], [2, -1, -1, 0, 57066, -152138],
    [2, 0, 1, 0, 53322, -170733], [2, -1, 0, 0, 45758, -204586], [0, 1, -1, 0, -40923, -129620], [1, 0, 0, 0, -34720, 108743],
    [0, 1, 1, 0, -30383, 104755], [2, 0, 0, -2, 15327, 10321], [0, 0, 1, 2, -12528, 0], [0, 0, 1, -2, 10980, 79661],
    [4, 0, -1, 0, 10675, -34782], [0, 0, 3, 0, 10034, -23210], [4, 0, -2, 0, 8548, -21636], [2, 1, -1, 0, -7888, 24208],
    [2, 1, 0, 0, -6766, 30824], [1, 0, -1, 0, -5163, -8379], [1, 1, 0, 0, 4987, -16675], [2, -1, 1, 0, 4036, -12831],
    [2, 0, 2, 0, 3994, -10445], [4, 0, 0, 0, 3861, -11650], [2, 0, -3, 0, 3665, 14403], [0, 1, -2, 0, -2689, -7003],
    [2, 0, -1, 2, -2602, 0], [2, -1, -2, 0, 2390, 10056], [1, 0, 1, 0, -2348, 6322], [2, -2, 0, 0, 2236, -9884],
    [0, 1, 2, 0, -2120, 5751], [0, 2, 0, 0, -2069, 0], [2, -2, -1, 0, 2048, -4950], [2, 0, 1, -2, -1773, 4130],
    [2, 0, 0, 2, -1595, 0], [4, -1, -1, 0, 1215, -3958], [0, 0, 2, 2, -1110, 0], [3, 0, -1, 0, -892, 3258],
    [2, 1, 1, 0, -810, 2616], [4, -1, -2, 0, 759, -1897], [0, 2, -1, 0, -713, -2117], [2, 2, -1, 0, -700, 2354]
  ];
  const MB = [
    [0, 0, 0, 1, 5128122], [0, 0, 1, 1, 280602], [0, 0, 1, -1, 277693], [2, 0, 0, -1, 173237], [2, 0, -1, 1, 55413],
    [2, 0, -1, -1, 46271], [2, 0, 0, 1, 32573], [0, 0, 2, 1, 17198], [2, 0, 1, -1, 9266], [0, 0, 2, -1, 8822],
    [2, -1, 0, -1, 8216], [2, 0, -2, -1, 4324], [2, 0, 1, 1, 4200], [2, 1, 0, -1, -3359], [2, -1, -1, 1, 2463],
    [2, -1, 0, 1, 2211], [2, -1, -1, -1, 2065], [0, 1, -1, -1, -1870], [4, 0, -1, -1, 1828], [0, 1, 0, 1, -1794],
    [0, 0, 0, 3, -1749], [0, 1, -1, 1, -1565], [1, 0, 0, 1, -1491], [0, 1, 1, 1, -1475], [0, 1, 1, -1, -1410],
    [0, 1, 0, -1, -1344], [1, 0, 0, -1, -1335], [0, 0, 3, 1, 1107], [4, 0, 0, -1, 1021], [4, 0, -1, 1, 833]
  ];
  function moonEcliptic(T) {       /* geometric, mean ecliptic and equinox of date: λ, β (deg), Δ (km) */
    const Lp = n360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841);
    const D = n360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868);
    const M = n360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
    const Mp = n360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699);
    const F = n360(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000);
    const E = 1 - 0.002516 * T - 0.0000074 * T * T;
    const A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.290 * T, A3 = 313.45 + 481266.484 * T;
    let sl = 0, sr = 0, sb = 0;
    for (const [d, m, mp, f, l, r] of MLR) {
      const arg = d * D + m * M + mp * Mp + f * F, ef = Math.abs(m) === 1 ? E : Math.abs(m) === 2 ? E * E : 1;
      sl += l * ef * sin(arg); sr += r * ef * cos(arg);
    }
    for (const [d, m, mp, f, b] of MB) {
      const arg = d * D + m * M + mp * Mp + f * F, ef = Math.abs(m) === 1 ? E : Math.abs(m) === 2 ? E * E : 1;
      sb += b * ef * sin(arg);
    }
    sl += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
    sb += -2235 * sin(Lp) + 382 * sin(A3) + 175 * sin(A1 - F) + 175 * sin(A1 + F) + 127 * sin(Lp - Mp) - 115 * sin(Lp + Mp);
    return { lam: n360(Lp + sl / 1e6), bet: sb / 1e6, dist: 385000.56 + sr / 1000, F, Lp, D, M, Mp };
  }
  const epsDate = T => EPS0 - 0.0130042 * T;

  /* ── a moment at a place: everything else hangs off this ── */
  function at(ms, lat, lon) {
    const jd = jdOf(ms), T = centuriesTT(jd);
    const P = precession(T), lst = n360(gmst(jd) + lon);
    /* local axes in the equator of date: east, north, up */
    const cl = cos(lst), sl = sin(lst), cp = cos(lat), sp = sin(lat);
    const H = [-sl, cl, 0, -sp * cl, -sp * sl, cp, cp * cl, cp * sl, sp];
    const M = mm(H, P);                 /* J2000 unit vector → (east, north, up) */
    const ctx = { ms, jd, T, lat, lon, lst, P, M, cache: {} };
    /* the observer, km, J2000 (for the Moon's parallax) */
    const obsDate = [ER_KM * cp * cl, ER_KM * cp * sl, ER_KM * sp * 0.99664719];
    ctx.obs = mtv(P, obsDate);
    return ctx;
  }
  function earthHelioEq(T) { return ecl2eq(helio("earth", T), EPS0); }
  function sun(ctx) {
    if (ctx.cache.sun) return ctx.cache.sun;
    const e = earthHelioEq(ctx.T), g = scl(e, -1), dist = len(g);
    const v = unit(g), rd = v2radec(v);
    return (ctx.cache.sun = { id: "sun", v, ra: rd.ra, dec: rd.dec, dist, diam: 1919.26 / dist, mag: -26.74 });
  }
  function planet(ctx, name) {
    if (ctx.cache[name]) return ctx.cache[name];
    const T = ctx.T, e = earthHelioEq(T);
    let p = ecl2eq(helio(name, T), EPS0), g = sub(p, e), dist = len(g);
    for (let k = 0; k < 2; k++) {       /* light-time: where it was when the light left */
      const Tl = T - dist * 0.0057755183 / 36525;
      p = ecl2eq(helio(name, Tl), EPS0); g = sub(p, e); dist = len(g);
    }
    const r = len(p), R = len(e), v = unit(g), rd = v2radec(v);
    const cosi = (r * r + dist * dist - R * R) / (2 * r * dist), i = Math.acos(Math.max(-1, Math.min(1, cosi))) * R2D;
    const b = BODY[name], k = (1 + cosi) / 2, l5 = 5 * Math.log10(r * dist);
    let mag;
    if (name === "mercury") mag = -0.42 + l5 + 0.0380 * i - 0.000273 * i * i + 0.000002 * i * i * i;
    else if (name === "venus") mag = -4.40 + l5 + 0.0009 * i + 0.000239 * i * i - 0.00000065 * i * i * i;
    else if (name === "mars") mag = -1.52 + l5 + 0.016 * i;
    else if (name === "jupiter") mag = -9.40 + l5 + 0.005 * i;
    else if (name === "uranus") mag = -7.19 + l5;
    else if (name === "neptune") mag = -6.87 + l5;
    const out = { id: name, v, ra: rd.ra, dec: rd.dec, dist, r, phase: i, illum: k, diam: b.d1 / dist, flat: b.flat || 0, col: b.col, mag, helio: p };
    /* the planet's north pole: how much of its face is tilted toward us, and which way its axis points */
    const pole = radec2v(b.pole[0], b.pole[1]);
    out.pole = pole;
    out.subEarthLat = Math.asin(Math.max(-1, Math.min(1, -dot(pole, v)))) * R2D;
    if (name === "saturn") {
      out.ringB = out.subEarthLat;                     /* the tilt of the rings toward us (Meeus ch. 45: B) */
      out.ringOuter = 375.35 / dist;                   /* the outer edge of ring A, arcsec */
      const sunSide = Math.asin(Math.max(-1, Math.min(1, dot(pole, unit(p))))) * R2D;
      out.ringSunB = sunSide;
      out.mag = -8.88 + l5 + 0.044 * i - 2.60 * Math.abs(sin(out.ringB)) + 1.25 * sin(out.ringB) * sin(out.ringB);
    }
    if (name === "mars") {
      /* central meridian (west longitude), IAU 2009: W = 176.630 + 350.89198226 d */
      const d = ctx.jd + DT_SEC / 86400 - 2451545 - dist * 0.0057755183;
      const W = n360(176.630 + 350.89198226 * d);
      const Q = unit(cross([0, 0, 1], pole)), Y = cross(pole, Q), ee = scl(v, -1);
      const ae = Math.atan2(dot(ee, Y), dot(ee, Q)) * R2D;
      out.cm = n360(W - ae);
    }
    return (ctx.cache[name] = out);
  }
  function moon(ctx) {
    if (ctx.cache.moon) return ctx.cache.moon;
    const T = ctx.T, me = moonEcliptic(T), eps = epsDate(T);
    const vEclDate = radec2v(me.lam, me.bet);                      /* (cos β cos λ, cos β sin λ, sin β) */
    const geoDate = scl(ecl2eq(vEclDate, eps), me.dist);
    const geo = mtv(ctx.P, geoDate);                                 /* km, J2000 */
    const topo = sub(geo, ctx.obs);
    const v = unit(topo), rd = v2radec(v), dist = len(topo);
    const s = sun(ctx), S = scl(s.v, s.dist * AU_KM);
    const toSun = sub(S, geo), toEarth = scl(geo, -1);
    const i = angle(toSun, toEarth), k = (1 + Math.cos(i * D2R)) / 2;
    /* waxing when the Moon is east of the Sun (its ecliptic longitude is ahead) */
    const sunLamDate = v2radec(eq2ecl(mv(ctx.P, s.v), eps)).ra;
    const elong = n360(me.lam - sunLamDate);
    /* optical libration, Meeus ch. 53 */
    const Om = n360(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T), Ii = 1.54242;
    const W = me.lam - Om;
    const A = Math.atan2(sin(W) * cos(me.bet) * cos(Ii) - sin(me.bet) * sin(Ii), cos(W) * cos(me.bet)) * R2D;
    const libL = n180(A - me.F), libB = Math.asin(-sin(W) * cos(me.bet) * sin(Ii) - sin(me.bet) * cos(Ii)) * R2D;
    /* the Moon's north pole (Cassini's laws): 1.54° from the ecliptic pole, toward ecliptic longitude Ω + 90° */
    const pole = mtv(ctx.P, ecl2eq(radec2v(Om + 90, 90 - Ii), eps));
    const out = { id: "moon", v, ra: rd.ra, dec: rd.dec, dist, geo, phase: i, illum: k, waxing: elong < 180, elong,
      age: elong / 360 * 29.530589, diam: 2 * Math.asin(1737.4 / dist) * R2D * 3600, mag: -12.73 + 0.026 * i + 4e-9 * Math.pow(i, 4),
      libL, libB, pole, lamDate: me.lam, betDate: me.bet };
    return (ctx.cache.moon = out);
  }
  /* Jupiter's four big moons, Meeus ch. 44 (low accuracy). X to the west and Y to the north, in Jupiter radii;
     front: true when the moon is on our side of Jupiter. */
  function jupiterMoons(jdUT) {
    const d = jdUT + DT_SEC / 86400 - 2451545.0;
    const V = 172.74 + 0.00111588 * d, M = 357.529 + 0.9856003 * d;
    const N = 20.020 + 0.0830853 * d + 0.329 * sin(V), J = 66.115 + 0.9025179 * d - 0.329 * sin(V);
    const A = 1.915 * sin(M) + 0.020 * sin(2 * M), B = 5.555 * sin(N) + 0.168 * sin(2 * N);
    const K = J + A - B;
    const R = 1.00014 - 0.01671 * cos(M) - 0.00014 * cos(2 * M), r = 5.20872 - 0.25208 * cos(N) - 0.00611 * cos(2 * N);
    const Dl = Math.sqrt(r * r + R * R - 2 * r * R * cos(K)), psi = Math.asin(R / Dl * sin(K)) * R2D;
    const t = d - Dl / 173;
    let u1 = 163.8069 + 203.4058646 * t + psi - B, u2 = 358.4140 + 101.2916335 * t + psi - B;
    let u3 = 5.7176 + 50.2345180 * t + psi - B, u4 = 224.8092 + 21.4879800 * t + psi - B;
    const G = 331.18 + 50.310482 * t, H = 87.45 + 21.569231 * t;
    const c1 = 0.473 * sin(2 * (u1 - u2)), c2 = 1.065 * sin(2 * (u2 - u3)), c3 = 0.165 * sin(G), c4 = 0.843 * sin(H);
    const r1 = 5.9057 - 0.0244 * cos(2 * (u1 - u2)), r2 = 9.3966 - 0.0882 * cos(2 * (u2 - u3)), r3 = 14.9883 - 0.0216 * cos(G), r4 = 26.3627 - 0.1939 * cos(H);
    u1 += c1; u2 += c2; u3 += c3; u4 += c4;
    const lam = 34.35 + 0.083091 * d + 0.329 * sin(V) + B;
    const Ds = 3.12 * sin(lam + 42.8);
    const De = Ds - 2.22 * sin(psi) * cos(lam + 22) - 1.30 * (r - Dl) / Dl * sin(lam - 100.5);
    const names = [["Io", "Ío"], ["Europa", "Europa"], ["Ganymede", "Ganímedes"], ["Callisto", "Calisto"]];
    return [[u1, r1, 5.0], [u2, r2, 5.3], [u3, r3, 4.6], [u4, r4, 5.7]].map(([u, rr, mag], k) => ({
      name: names[k], X: rr * sin(u), Y: -rr * cos(u) * sin(De), front: cos(u) < 0, mag
    }));
  }
  /* the local sky: altitude (refracted unless raw), azimuth from north through east */
  function horiz(ctx, v, raw) {
    const h = mv(ctx.M, v);
    let alt = Math.asin(Math.max(-1, Math.min(1, h[2]))) * R2D;
    const az = n360(Math.atan2(h[0], h[1]) * R2D);
    if (!raw && alt > -2) alt += refraction(alt);
    return { alt, az, enu: h };
  }
  function refraction(alt) {        /* Bennett (Meeus 16.4), degrees, for a true altitude */
    const a = Math.max(-1.5, alt);
    return 1.02 / Math.tan((a + 10.3 / (a + 5.11)) * D2R) / 60;
  }
  function airmass(alt) {           /* Pickering 2002; large but finite at the horizon */
    const h = Math.max(-0.5, alt);
    return 1 / Math.sin((h + 244 / (165 + 47 * Math.pow(Math.max(0, h), 1.1))) * D2R);
  }
  /* a body by id at a moment: "sun", "moon", a planet; or a fixed J2000 vector */
  function bodyVec(ctx, id) {
    if (id === "sun") return sun(ctx).v;
    if (id === "moon") return moon(ctx).v;
    return planet(ctx, id).v;
  }
  /* rise, transit and set within 24 h after ms. h0: −0.5667 stars/planets, −0.8333 Sun, +0.125 Moon (with parallax
     already in the topocentric position, the Moon uses −0.8333 + its semi-diameter term ≈ −0.5667 + ... we use h0
     on the refracted altitude, so 0 for the upper limb's centre correction, see below) */
  function events(ms, lat, lon, which, opts) {
    opts = opts || {};
    const step = 10 * 60000, span = (opts.hours || 24) * 3600000;
    const h0 = opts.h0 != null ? opts.h0 : which === "sun" ? -0.8333 : which === "moon" ? -0.8333 + 0.2725 * 0 : -0.5667;
    const altAt = t => {
      const c = at(t, lat, lon);
      const v = typeof which === "string" ? bodyVec(c, which) : which;
      let a = horiz(c, v, true).alt;
      if (which === "moon") a += moon(c).diam / 7200;        /* the upper limb */
      return a;
    };
    let prev = altAt(ms), out = { rise: null, set: null, transit: null, up: prev > h0, maxAlt: prev, maxAt: ms };
    for (let t = ms + step; t <= ms + span; t += step) {
      const a = altAt(t);
      if (a > out.maxAlt) { out.maxAlt = a; out.maxAt = t; }
      if ((prev - h0) * (a - h0) <= 0 && prev !== a) {
        let lo = t - step, hi = t;
        for (let k = 0; k < 14; k++) { const mid = (lo + hi) / 2, am = altAt(mid); if ((am - h0) * (prev - h0) > 0) lo = mid; else hi = mid; }
        const tc = (lo + hi) / 2;
        if (a > prev && out.rise == null) out.rise = tc;
        if (a < prev && out.set == null) out.set = tc;
      }
      prev = a;
    }
    out.transit = out.maxAt;
    out.never = out.rise == null && out.set == null && !out.up;
    out.always = out.rise == null && out.set == null && out.up;
    return out;
  }
  /* the next moment (after ms) the Sun sinks to alt degrees */
  function sunDown(ms, lat, lon, alt) {
    const e = events(ms, lat, lon, "sun", { h0: alt, hours: 36 });
    return e.set;
  }
  /* a direction on the sky in the eyepiece: (right, up) unit axes at a point, "up" toward the zenith */
  function frameAt(ctx, v) {
    const t = unit(v);
    const Z = mtv(ctx.M, [0, 0, 1]);                      /* the zenith as a J2000 vector */
    let up = sub(Z, scl(t, dot(Z, t)));
    if (len(up) < 1e-6) up = sub([0, 0, 1], scl(t, t[2]));
    up = unit(up);
    const right = cross(t, up);
    const north0 = sub([0, 0, 1], scl(t, t[2]));          /* celestial north (J2000) at that point */
    return { t, up, right, north: len(north0) > 1e-9 ? unit(north0) : up };
  }
  /* offset of v from the frame centre, arcminutes (x right, y up), gnomonic */
  function offset(fr, v) {
    const d = dot(v, fr.t);
    if (d <= 0) return null;
    return { x: dot(v, fr.right) / d * R2D * 60, y: dot(v, fr.up) / d * R2D * 60 };
  }
  /* screen angle (radians, from "right", counter-clockwise, y up) of a direction vector at the frame */
  function dirAngle(fr, w) { return Math.atan2(dot(w, fr.up), dot(w, fr.right)); }

  const api = { D2R, R2D, AU_KM, n360, n180, dot, sub, scl, unit, cross, len, angle, mv, mtv, radec2v, v2radec, ecl2eq, eq2ecl,
    jdOf, msOf, gmst, precession, centuriesTT, at, sun, moon, planet, helio, jupiterMoons, horiz, refraction, airmass, events,
    sunDown, frameAt, offset, dirAngle, bodyVec, moonEcliptic, EPS0, PLANETS: ["mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune"], BODY };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AOGAstro = api;
})(typeof window !== "undefined" ? window : globalThis);
