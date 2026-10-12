/* AOG-MICRO-DEPTH-V1 (2026-10-12) — Jimmy: "Is there ability for a quantum leap forward in the Micro …"
   The Microscope Lab's real-depth engine. The page loads this file only when a slide built in depth (or one of the
   new kinds of light) is opened; until then nothing here runs.

   What it does. Each depth slide is built in three dimensions, in micrometres, the way the real thing is put
   together: an onion cell is a box of wall with a film of cytoplasm, a nucleus pressed to one side at its own depth,
   strands across the vacuole; a pollen grain is a ball with spines; a pond drop holds swimmers at many heights.
   The engine then forms the picture a real objective forms. Every part of the sample is blurred by how far it sits
   from the focal plane (the blur grows with the objective's numerical aperture), and nothing finer than the Abbe
   limit d = λ / (NA + NA of the condenser) survives — λ/2NA with the condenser iris open. Clear parts that bend
   light show the way they really do: almost nothing in perfect focus, bright or dark rims just above or below it,
   more contrast as the condenser iris closes (and less resolution). The other kinds of light are worked out from
   the same sample: phase contrast (dark parts with bright halos), darkfield (only scattered light), crossed
   polarizers (interference colours from the birefringence, with an optional first-order red plate), and
   fluorescence (a DNA dye glows blue, chlorophyll glows red, out-of-focus glow included).

   How. WebGL2. A slide is a set of thin slabs ("layers", painted with the 2D canvas in view-aligned textures) and
   instanced objects ("sprites", baked once per kind with their own optical sections). Every slab and every object
   adds its share into one floating-point buffer, blurred by its own distance from focus through the texture's
   mipmaps; a last pass turns that into light. Nothing draws unless the page asks (render on demand), and dispose()
   frees the GPU (forceContextLoss). */
(function () {
"use strict";
var UMU = 18000 / 1545.6;            /* µm per slide unit: the page's measuring scale (FOV 18 mm / objective) */
var UMZ = 2.5;                       /* µm of focus per unit of stage height (fine knob: 0.3 µm a step) */
var PHONE = Math.min(screen.width || 800, screen.height || 800) < 600;

/* ── small helpers ─────────────────────────────────────────────────────────────────────────── */
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function h2(i, j, s) { var h = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) + Math.imul(s | 0, 1013904223)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function lerp(a, b, t) { return a + (b - a) * t; }
function ovl(a0, a1, b0, b1) { return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0)); }
var TAU = Math.PI * 2;

/* ── optics, shared with the page and the check ────────────────────────────────────────────── */
function naOf(L) { return L.obj === 100 ? (L.oil ? 1.25 : 0.85) : L.obj === 40 ? 0.65 : L.obj === 10 ? 0.25 : 0.10; }
function immersion(L) { return L.obj === 100 && L.oil ? 1.515 : 1.0; }
function condFrac(L) { return 0.08 + 0.92 * clamp((L.dia == null ? 70 : L.dia) / 100, 0, 1); }   /* NA of the condenser / NA of the objective */
function nmOf(L) {
  if (L.prism) return Math.round(650 - (Math.max(0, Math.min(100, L.band)) / 100) * 230);
  return L.filter === "violet" ? 430 : L.filter === "blue" ? 470 : L.filter === "green" ? 530 : L.filter === "amber" ? 590 : 550;
}
/* Abbe: the finest spacing that still shows. λ/(NA_obj + NA_cond); λ/2NA when the condenser fills the objective. */
function abbeUm(L) { var na = naOf(L); return (nmOf(L) / 1000) / (na + na * condFrac(L)); }
/* Depth of field (the thickness that looks sharp): λn/NA² + n·e/(M·NA), e = 6.5 µm (one camera pixel). */
function dofUm(L) { var na = naOf(L), n = immersion(L), lam = nmOf(L) / 1000; return lam * n / (na * na) + n * 6.5 / (L.obj * na); }

/* ── materials: what each part of a sample does to light ──────────────────────────────────────
   ph  optical path (bends light; phase), per µm of material, relative
   pig natural colour (chlorophyll, haemoglobin…) — the slide sets which colour
   st  how much each stain takes ({iodine, methylene, safranin, wright})
   bir birefringence (lights up between crossed polarizers)
   fl  [DNA dye (blue), green glow, red glow (chlorophyll)]                                         */
function M(o) { o.ph = o.ph || 0; o.pig = o.pig || 0; o.st = o.st || {}; o.bir = o.bir || 0; o.fl = o.fl || [0, 0, 0]; return o; }

/* the ink writes a material into a slab texture, in the channels the current light needs */
function makeInk(mode, stain) {
  var pol = mode === "polar", fl = mode === "fluor";
  function rgb(m, a) {
    var r, g, b;
    if (fl) { r = m.fl[0] * a; g = m.fl[1] * a; b = m.fl[2] * a; }
    else if (pol) { r = m.ph * a; g = m.bir * a; b = 0; }
    else { r = m.ph * a; g = m.pig * a; b = (m.st[stain] || 0) * a; }
    return "rgb(" + (clamp(r, 0, 1) * 255 | 0) + "," + (clamp(g, 0, 1) * 255 | 0) + "," + (clamp(b, 0, 1) * 255 | 0) + ")";
  }
  return { rgb: rgb, mode: mode, stain: stain };
}

/* stain colours as absorbance (how much red, green, blue each one takes out) */
var STAINCOL = {
  none: [0, 0, 0],
  iodine: [0.10, 0.42, 1.05],
  methylene: [1.05, 0.55, 0.10],
  safranin: [0.05, 0.95, 0.62],
  wright: [0.62, 0.95, 0.28]          /* the azure (purple) half; the eosin half rides in the pigment channel */
};
var PIG = {
  chloro: [0.95, 0.20, 0.80],
  hemo: [0.04, 0.30, 0.62],
  eosin: [0.04, 0.62, 0.44],
  brown: [0.22, 0.45, 0.90],
  yellow: [0.02, 0.14, 0.60],
  amber: [0.10, 0.35, 0.80],
  none: [0, 0, 0]
};

/* CIE 1931 colour matching (Wyman, Sloan & Shirley 2013 fit) → linear sRGB weights for 16 wavelengths,
   so the crossed-polarizer colours come out of the physics (the Michel-Lévy chart), not a lookup. */
var CMF = (function () {
  function g(x, m, s1, s2) { var t = (x - m) / (x < m ? s1 : s2); return Math.exp(-0.5 * t * t); }
  var lam = [], w = [], sum = [0, 0, 0];
  for (var i = 0; i < 16; i++) {
    var l = 400 + i * 20;
    var X = 1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2);
    var Y = 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1);
    var Z = 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8);
    var r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z, gg = -0.9689 * X + 1.8758 * Y + 0.0415 * Z, b = 0.0557 * X - 0.2040 * Y + 1.0570 * Z;
    lam.push(l); w.push([r, gg, b]); sum[0] += r; sum[1] += gg; sum[2] += b;
  }
  var flat = [];
  w.forEach(function (c) { flat.push(c[0] / sum[0], c[1] / sum[1], c[2] / sum[2]); });
  return { lam: new Float32Array(lam), w: new Float32Array(flat) };
})();

/* ══ GLSL ══════════════════════════════════════════════════════════════════════════════════ */
var COMMON = [
"#version 300 es",
"precision highp float; precision highp sampler2DArray;",
"uniform sampler2DArray uTex; uniform vec2 uTexSize;",
"uniform int uMode;",                                  /* 0 bright, 1 phase, 2 dark, 3 polar, 4 fluor, 5 oblique (slit) */
"uniform vec3 uColG, uColB; uniform float uASc, uScat, uKappa, uHalo, uDark;",
"uniform float uTanA, uCond, uSigRes, uHaze, uZf;",
"uniform float uOrient, uBirSc;",
"float lodFor(float s){ return max(0.0, log2(max(s,1e-4)) + 0.3); }",
"vec4 B5(float L, vec2 uv, vec2 sg, out vec2 gR, out vec2 gG){",
"  float lod = lodFor(max(sg.x,sg.y));",
"  vec2 r = max(sg, vec2(0.5)); vec2 d = r/uTexSize;",
"  vec4 c = textureLod(uTex, vec3(uv,L), lod);",
"  vec4 e = textureLod(uTex, vec3(uv+vec2(d.x,0.),L), lod), w = textureLod(uTex, vec3(uv-vec2(d.x,0.),L), lod);",
"  vec4 n = textureLod(uTex, vec3(uv+vec2(0.,d.y),L), lod), s = textureLod(uTex, vec3(uv-vec2(0.,d.y),L), lod);",
"  gR = vec2(e.r-w.r, n.r-s.r)/(2.0*r); gG = vec2(e.g-w.g, n.g-s.g)/(2.0*r);",
"  return c*0.36 + (e+w+n+s)*0.16;",
"}",
"vec4 B5s(float L, vec2 uv, vec2 sg){ vec2 a,b; return B5(L,uv,sg,a,b); }",
/* orientation of a thin bright line (a wall) from the Hessian of the birefringence channel */
"float lineAngle(float L, vec2 uv, vec2 sg){",
"  float lod = lodFor(max(sg.x,sg.y)); vec2 d = max(sg+1.0, vec2(1.0))/uTexSize;",
"  float c = textureLod(uTex, vec3(uv,L), lod).g;",
"  float e = textureLod(uTex, vec3(uv+vec2(d.x,0.),L), lod).g, w = textureLod(uTex, vec3(uv-vec2(d.x,0.),L), lod).g;",
"  float n = textureLod(uTex, vec3(uv+vec2(0.,d.y),L), lod).g, s = textureLod(uTex, vec3(uv-vec2(0.,d.y),L), lod).g;",
"  float ne = textureLod(uTex, vec3(uv+d,L), lod).g, sw = textureLod(uTex, vec3(uv-d,L), lod).g;",
"  float nw = textureLod(uTex, vec3(uv+vec2(-d.x,d.y),L), lod).g, se = textureLod(uTex, vec3(uv+vec2(d.x,-d.y),L), lod).g;",
"  float hxx = e+w-2.0*c, hyy = n+s-2.0*c, hxy = (ne+sw-nw-se)*0.25;",
"  return 0.5*atan(2.0*hxy, hxx-hyy) + 1.5707963;",   /* the line runs across the strongest curvature */
"}",
/* one slab's share of the picture. tpu: texels per µm (x, y); dz: focal plane minus slab (µm); wgt: slab µm / 3 */
"vec4 share(float L, vec2 uv, vec2 tpu, float dz, float wgt, float stainMul, float ang, vec2 radial){",
"  float adz = abs(dz);",
"  float geo = 0.5*adz*uTanA;",
"  float sU = sqrt(geo*geo + uSigRes*uSigRes + uHaze*uHaze);",
"  vec2 sg = sU*tpu;",
"  vec2 gR, gG; vec4 c = B5(L, uv, sg, gR, gG);",
"  vec3 col = c.g*uColG + c.b*stainMul*uColB;",
"  if(uMode==0){",
"    float scat = length(gR*tpu)*uScat;",
"    float gc = geo*uCond; float sc = sqrt(gc*gc + uSigRes*uSigRes);",
"    float p1 = B5s(L, uv, sc*tpu).r, p2 = B5s(L, uv, (sc*2.2+0.6)*tpu).r;",
"    float T = uKappa*dz*(p1-p2)/(sc*sc+0.3);",
"    return vec4(col*uASc + vec3(scat), T)*wgt;",
"  }",
"  if(uMode==1){",
"    float halo = B5s(L, uv, (sU+uHalo)*tpu).r;",
"    return vec4(col*uASc*0.8, (c.r-halo))*wgt;",
"  }",
"  if(uMode==2 || uMode==5){",
"    float wide = B5s(L, uv, (sU*2.0+0.8)*tpu).r;",
"    float dp = c.r - wide; vec2 g = gR*min(sU,2.5);",
"    float S = dp*dp*7.0 + dot(g,g)*1.5 + (c.g+c.b*stainMul)*0.015;",
"    if(uMode==5) S = max(0.0, dot(gR*tpu, vec2(0.75,-0.66)))*0.9 + dp*dp*2.0;",
"    vec3 tint = exp(-col*uASc*0.5);",
"    return vec4(tint*S*uDark, 0.0)*wgt;",
"  }",
"  if(uMode==3){",
"    float th = uOrient < 0.5 ? lineAngle(L, uv, sg) + ang : uOrient < 1.5 ? ang : atan(radial.y, radial.x) + ang;",
"    float G = c.g*uBirSc;",
"    return vec4(G*cos(2.0*th), G*sin(2.0*th), col.b*0.0, 0.0)*wgt;",
"  }",
"  vec3 E = c.r*vec3(0.22,0.42,1.0) + c.g*vec3(0.30,1.0,0.36) + c.b*vec3(1.0,0.10,0.06);",
"  return vec4(E, 0.0)*wgt;",
"}"].join("\n");

var VS_LAYER = [
"#version 300 es",
"in vec2 aPos; out vec2 vUv;",
"void main(){ vUv = vec2(aPos.x*0.5+0.5, 0.5-aPos.y*0.5); gl_Position = vec4(aPos,0.0,1.0); }"].join("\n");

var FS_LAYER = COMMON + "\n" + [
"in vec2 vUv; out vec4 o;",
"uniform float uLayer, uZ, uW, uScale; uniform vec2 uShift; uniform float uTpu; uniform float uCrop;",
"void main(){",
"  vec2 luv = 0.5 + (vUv-0.5)*uScale + uShift;",
"  o = share(uLayer, luv, vec2(uTpu), uZf-uZ, uW, 1.0, 0.0, vec2(0.0));",
"}"].join("\n");

var VS_SPRITE = [
"#version 300 es",
"precision highp float;",
"in vec2 aCorner; in vec4 aI0; in vec4 aI1;",
"uniform vec2 uHalf; uniform float uZoff, uZf, uTanA, uSigRes, uHaze, uS; uniform vec2 uPan, uView;",
"out vec2 vUv; out float vDz; out float vSc; out float vRot; out float vAux; out float vVar; out vec2 vLoc;",
"void main(){",
"  float sc = aI1.x; float z = aI0.z + uZoff*sc; float dz = uZf - z;",
"  float geo = 0.5*abs(dz)*uTanA; float sU = sqrt(geo*geo + uSigRes*uSigRes + uHaze*uHaze);",
"  vec2 hf = uHalf*sc*vec2(1.0, aI1.w);",
"  vec2 grow = vec2(2.6*sU + 0.6);",
"  vec2 local = aCorner*(hf + grow);",
"  float c = cos(aI0.w), s = sin(aI0.w);",
"  vec2 p = aI0.xy + vec2(c*local.x - s*local.y, s*local.x + c*local.y);",
"  vec2 scr = uView*0.5 - uS*(p + uPan);",
"  gl_Position = vec4(scr.x/uView.x*2.0-1.0, 1.0-scr.y/uView.y*2.0, 0.0, 1.0);",
"  vUv = 0.5 + local/(2.0*hf);",
"  vLoc = local/hf; vDz = dz; vSc = sc; vRot = aI0.w; vAux = aI1.z; vVar = aI1.y;",
"}"].join("\n");

var FS_SPRITE = COMMON + "\n" + [
"in vec2 vUv; in float vDz; in float vSc; in float vRot; in float vAux; in float vVar; in vec2 vLoc; out vec4 o;",
"uniform float uS0, uSN, uSub, uW, uAxis; uniform vec2 uHalf2; uniform vec2 uHil;",
"void main(){",
"  float L = vVar*uSN + uSub;",
"  vec2 tpu = uTexSize/(2.0*uHalf2*vSc);",
"  float inside = step(0.0,vUv.x)*step(vUv.x,1.0)*step(0.0,vUv.y)*step(vUv.y,1.0);",
"  vec2 q = clamp(vUv, 0.0, 1.0);",
"  o = share(L, q, tpu, vDz, uW*vSc, vAux, vRot + uAxis, vLoc - uHil) * inside;",
"}"].join("\n");

var FS_FINAL = [
"#version 300 es",
"precision highp float;",
"in vec2 vUv; out vec4 o;",
"uniform sampler2D uAcc; uniform int uMode; uniform vec3 uLamp; uniform float uGain, uHazeMix, uPolAng, uPlate, uBg, uPhG;",
"uniform float uLam[16]; uniform vec3 uCmf[16];",
"void main(){",
"  vec4 a = texture(uAcc, vec2(vUv.x, 1.0-vUv.y));",
"  vec3 col; vec3 bg;",
"  if(uMode==0){ col = exp(-a.rgb) * (1.0 + 0.85*tanh(a.a)) * uLamp * uGain; bg = uLamp*uGain; }",
"  else if(uMode==1){ col = uBg * (1.0 - uPhG*tanh(a.a*1.2)) * exp(-a.rgb) * uLamp * uGain; bg = uBg*uLamp*uGain; }",
"  else if(uMode==2 || uMode==5){ col = (1.0-exp(-a.rgb*uGain)) * uLamp + vec3(0.006,0.007,0.012); bg = vec3(0.006,0.007,0.012); }",
"  else if(uMode==3){",
"    float G = length(a.rg)*100.0; float th = 0.5*atan(a.g, a.r);",
"    vec3 acc = vec3(0.0);",
"    for(int i=0;i<16;i++){",
"      float lam = uLam[i]; float I;",
"      if(uPlate>0.5){ float Ge = 530.0 + G*cos(2.0*(th-uPolAng-0.7853982)); float s = sin(3.1415927*Ge/lam); I = s*s; }",
"      else { float s1 = sin(2.0*(th-uPolAng)); float s2 = sin(3.1415927*G/lam); I = s1*s1*s2*s2; }",
"      acc += uCmf[i]*I;",
"    }",
"    col = acc*uGain + vec3(0.008,0.008,0.012); bg = vec3(0.01);",
"  }",
"  else { col = vec3(0.004,0.005,0.012) + (1.0-exp(-a.rgb*uGain)); bg = vec3(0.005); }",
"  col = mix(col, bg*0.85 + col*0.15, uHazeMix);",
"  col = pow(clamp(col,0.0,1.0), vec3(1.0/2.2));",
"  o = vec4(col, 1.0);",
"}"].join("\n");

/* ══ the GPU side ═══════════════════════════════════════════════════════════════════════════ */
var G = null;   /* { canvas, gl, progs, quad, corner, inst, acc, fb, layer:{tex,N,K,key,...}, types:{} } */
var STATS = { renders: 0, paints: 0, bakes: 0, ms: 0, backend: "none", lastSpec: "" };

function compile(gl, type, src) {
  var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { var e = gl.getShaderInfoLog(s); gl.deleteShader(s); throw new Error("MICRO shader: " + e); }
  return s;
}
function program(gl, vs, fs) {
  var p = gl.createProgram(); gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, "aPos"); gl.bindAttribLocation(p, 0, "aCorner"); gl.bindAttribLocation(p, 1, "aI0"); gl.bindAttribLocation(p, 2, "aI1");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("MICRO link: " + gl.getProgramInfoLog(p));
  var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i), nm = info.name.replace(/\[0\]$/, ""); u[nm] = gl.getUniformLocation(p, info.name); }
  return { p: p, u: u };
}
function init() {
  if (G) return G.ok;
  G = { ok: false };
  try {
    var canvas = document.createElement("canvas"); canvas.width = canvas.height = 64;
    var gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: true, powerPreference: "low-power" });
    if (!gl) { STATS.backend = "flat"; return false; }
    G.canvas = canvas; G.gl = gl;
    G.float = !!gl.getExtension("EXT_color_buffer_float");
    G.lose = gl.getExtension("WEBGL_lose_context");
    G.maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    G.progs = { layer: program(gl, VS_LAYER, FS_LAYER), sprite: program(gl, VS_SPRITE, FS_SPRITE), final: program(gl, VS_LAYER, FS_FINAL) };
    G.quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, G.quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    G.corner = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, G.corner); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    G.inst = gl.createBuffer();
    G.vaoL = gl.createVertexArray(); gl.bindVertexArray(G.vaoL); gl.bindBuffer(gl.ARRAY_BUFFER, G.quad); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    G.vaoS = gl.createVertexArray(); gl.bindVertexArray(G.vaoS);
    gl.bindBuffer(gl.ARRAY_BUFFER, G.corner); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, G.inst);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 0); gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 16); gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);
    G.types = {}; G.layer = null; G.accW = 0;
    G.scratch = document.createElement("canvas");
    G.ok = true; STATS.backend = "webgl2" + (G.float ? "" : "-8bit");
  } catch (e) { console.warn(e && e.message || e); G.ok = false; STATS.backend = "flat"; }
  return G.ok;
}
function ensureAcc(w, h) {
  var gl = G.gl;
  if (G.accW === w && G.accH === h) return;
  if (G.acc) { gl.deleteTexture(G.acc); gl.deleteFramebuffer(G.fb); }
  G.acc = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, G.acc);
  if (G.float) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
  else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  G.fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, G.fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, G.acc, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE && G.float) {
    G.float = false; G.accW = 0; gl.bindFramebuffer(gl.FRAMEBUFFER, null); return ensureAcc(w, h);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  G.accW = w; G.accH = h;
}
function arrayTex(w, h, depth) {
  var gl = G.gl, t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, t);
  var lv = Math.floor(Math.log2(Math.max(w, h))) + 1;
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, lv, gl.RGBA8, w, h, depth);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}
function scratch(w, h) {
  var c = G.scratch; if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  var g = c.getContext("2d", { alpha: false });
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; g.filter = "none";
  g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "lighter"; g.lineCap = "round"; g.lineJoin = "round";
  return g;
}
function upload(tex, layer, w, h) {
  var gl = G.gl; gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer, w, h, 1, gl.RGBA, gl.UNSIGNED_BYTE, G.scratch);
}

/* ══ the slides ═════════════════════════════════════════════════════════════════════════════
   A model: { z:[zmin,zmax], K(obj) slab count, layer(g, slab, view, ink) paints one slab (µm coordinates),
   types {name: kind of object}, items(view, t) → {type: Float32Array of instances}, colors(stain, mode),
   marks [{z, en, es}] for the side view, side(ctx, map) draws the side view }                                 */
var MODELS = {};

/* ── shared drawing in slab space ── */
function ell(g, x, y, rx, ry, rot) { g.beginPath(); g.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, TAU); }
/* a 3D ellipsoid's share of the slab [z0,z1]: the cross-section, densest where the slab cuts deepest */
function ellipsoid(g, ink, m, amt, x, y, z, rx, ry, rz, rot, z0, z1) {
  var o = ovl(z - rz, z + rz, z0, z1); if (o <= 0) return false;
  var zc = clamp(z, z0, z1) - z, q = Math.sqrt(Math.max(0, 1 - (zc * zc) / (rz * rz)));
  var zf = Math.max(Math.abs(z0 - z), Math.abs(z1 - z)), qi = zf >= rz ? 0 : Math.sqrt(1 - (zf * zf) / (rz * rz));
  var a = amt * o / (z1 - z0);
  if (qi > 0.05 && q - qi > 0.04) {
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(rx * q, ry * q);
    var gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    gr.addColorStop(0, ink.rgb(m, a)); gr.addColorStop(clamp(qi / q, 0, 0.98), ink.rgb(m, a)); gr.addColorStop(1, ink.rgb(m, a * 0.35));
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); g.restore();
  } else { g.fillStyle = ink.rgb(m, a); ell(g, x, y, rx * q, ry * q, rot); g.fill(); }
  return true;
}
/* the shell of a sphere (an envelope, a pollen wall) as seen through the slab: a ring, brightest at the limb */
function shell(g, ink, m, amt, x, y, z, R, t, z0, z1) {
  var o = ovl(z - R, z + R, z0, z1); if (o <= 0) return;
  var a = z0 - z, b = z1 - z; a = clamp(a, -R, R); b = clamp(b, -R, R);
  var r1 = Math.sqrt(Math.max(0, R * R - Math.max(a * a, b * b)));
  var r2 = (a <= 0 && b >= 0) ? R : Math.sqrt(Math.max(0, R * R - Math.min(a * a, b * b)));
  if (r2 - r1 < 0.05) { r1 = Math.max(0, r2 - t); }
  var gr = g.createRadialGradient(x, y, Math.max(0, r1 - t * 0.5), x, y, r2 + t * 0.5);
  var dz = z1 - z0, n = 6;
  for (var i = 0; i <= n; i++) {
    var rr = lerp(Math.max(0, r1 - t * 0.5), r2 + t * 0.5, i / n), rn = clamp(rr / R, 0, 0.995);
    var path = t / Math.sqrt(1 - rn * rn);                          /* path length through the wall here */
    var inSlab = (rr >= r1 - t && rr <= r2 + t) ? 1 : 0;
    gr.addColorStop(i / n, ink.rgb(m, amt * inSlab * clamp(path / dz, 0, 1.6) * (i === 0 || i === n ? 0.15 : 1)));
  }
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r2 + t * 0.5, 0, TAU);
  if (r1 > t) g.arc(x, y, Math.max(0, r1 - t * 0.5), 0, TAU, true);
  g.fill("evenodd");
}
/* the part of a 3D segment that lies in the slab, seen from above */
function seg3(g, ax, ay, az, bx, by, bz, z0, z1) {
  var t0 = 0, t1 = 1, dz = bz - az;
  if (Math.abs(dz) < 1e-6) { if (az < z0 || az > z1) return false; }
  else {
    var ta = (z0 - az) / dz, tb = (z1 - az) / dz; if (ta > tb) { var s = ta; ta = tb; tb = s; }
    t0 = Math.max(0, ta); t1 = Math.min(1, tb); if (t1 <= t0) return false;
  }
  g.moveTo(ax + (bx - ax) * t0, ay + (by - ay) * t0); g.lineTo(ax + (bx - ax) * t1, ay + (by - ay) * t1);
  return true;
}
function poly(g, P) { g.beginPath(); for (var i = 0; i < P.length; i++) i ? g.lineTo(P[i][0], P[i][1]) : g.moveTo(P[i][0], P[i][1]); g.closePath(); }

/* ── a stage micrometer of fine bars (only the check uses it): proves the Abbe limit is applied ── */
MODELS.__bars = {
  z: [-0.6, 0.6], K: function () { return 1; }, layerZ: null,
  mats: { bar: M({ ph: 0.2, pig: 1.0, bir: 0.5, fl: [1, 0, 0] }) },
  colors: function () { return { G: [0.9, 0.9, 0.9], B: [0, 0, 0] }; },
  layer: function (g, sl, v, ink) {
    var p = v.barPeriod || 1;
    g.fillStyle = ink.rgb(this.mats.bar, 1);
    for (var x = Math.floor(v.x0 / p) * p; x < v.x1; x += p) g.fillRect(x, v.y0, p / 2, v.y1 - v.y0);
  },
  marks: [{ z: 0, en: "bars", es: "barras" }]
};

/* ══ ONION EPIDERMIS ═════════════════════════════════════════════════════════════════════════
   One layer of long cells, about 260 × 55 µm and 26 µm deep. Each cell: walls all round (top and bottom walls
   lie flat; the side walls stand up through the whole depth), a thin film of cytoplasm lining the walls, a large
   clear vacuole, a nucleus (about 22 × 14 × 12 µm) pressed against a long wall at its own depth with one to
   three nucleoli, and fine strands of cytoplasm crossing the vacuole. Focus on the top: the flat wall and its
   film of granules. Focus down: the nucleus comes up sharp, then the strands, then the bottom wall.           */
(function () {
  var ZT = 13, ZB = -13, WT = 0.9, ROWH = 54, CL = 265;
  var mats = {
    wall: M({ ph: 0.62, pig: 0.02, st: { iodine: 0.06, methylene: 0.12, safranin: 0.34 }, bir: 0.95, fl: [0.10, 0.32, 0.0] }),
    pwall: M({ ph: 0.30, pig: 0.01, st: { iodine: 0.03, methylene: 0.05, safranin: 0.15 }, bir: 0.10, fl: [0.04, 0.10, 0.0] }),
    cyto: M({ ph: 0.22, st: { iodine: 0.30, methylene: 0.10, safranin: 0.08 }, fl: [0.0, 0.01, 0.0] }),
    gran: M({ ph: 0.75, st: { iodine: 0.36, methylene: 0.12, safranin: 0.10 }, fl: [0.0, 0.03, 0.0] }),
    nuc: M({ ph: 0.40, st: { iodine: 0.62, methylene: 0.62, safranin: 0.58 }, fl: [0.55, 0.0, 0.0] }),
    chrom: M({ ph: 0.55, st: { iodine: 0.90, methylene: 0.95, safranin: 0.85 }, fl: [1.0, 0.0, 0.0] }),
    env: M({ ph: 0.70, st: { iodine: 0.30, methylene: 0.30, safranin: 0.25 }, fl: [0.15, 0.0, 0.0] }),
    nucleolus: M({ ph: 0.95, st: { iodine: 0.95, methylene: 1.0, safranin: 0.9 }, fl: [0.10, 0.0, 0.0] })
  };
  function rowY(j) { return j * ROWH + (h2(j, 7, 1) - 0.5) * 16; }
  function yAt(j, x) { return rowY(j) + 2.6 * Math.sin(x / 97 + j * 1.9) + 1.4 * Math.sin(x / 41 + j * 0.7); }
  function endX(j, i) { return (i + 0.37 * j) * CL + (h2(j, i, 3) - 0.5) * 90; }
  function cell(j, i) {
    var xl = endX(j, i), xr = endX(j, i + 1);
    var tl = (h2(j, i, 4) - 0.5) * 46, bl = (h2(j, i, 5) - 0.5) * 46, ml = (h2(j, i, 6) - 0.5) * 26;
    var tr = (h2(j, i + 1, 4) - 0.5) * 46, br = (h2(j, i + 1, 5) - 0.5) * 46, mr = (h2(j, i + 1, 6) - 0.5) * 26;
    var P = [], x, ytop = function (x) { return yAt(j, x); }, ybot = function (x) { return yAt(j + 1, x); };
    var a = xl + tl, b = xr + tr, n = Math.max(2, Math.round((b - a) / 32));
    for (var k = 0; k <= n; k++) { x = lerp(a, b, k / n); P.push([x, ytop(x)]); }
    var ym = (ytop(xr) + ybot(xr)) / 2; P.push([xr + mr, ym]);
    a = xr + br; b = xl + bl; n = Math.max(2, Math.round((a - b) / 32));
    for (k = 0; k <= n; k++) { x = lerp(a, b, k / n); P.push([x, ybot(x)]); }
    ym = (ytop(xl) + ybot(xl)) / 2; P.push([xl + ml, ym]);
    var r = mulberry((j * 7919 + i * 104729) ^ 0x0e10);
    var cx = (xl + xr) / 2, top = ytop(cx), bot = ybot(cx), hgt = bot - top;
    var side = r() < 0.5 ? -1 : 1;
    var nrx = 9.5 + r() * 3, nry = 6 + r() * 1.6, nrz = 5.6 + r() * 1.2;
    var nx = lerp(xl + 40, xr - 40, 0.2 + r() * 0.6), ny = side < 0 ? yAt(j, nx) + nry + 2.2 : yAt(j + 1, nx) - nry - 2.2;
    var nz = -6.5 + r() * 10;
    var nuc = { x: nx, y: ny, z: nz, rx: nrx, ry: nry, rz: nrz, rot: (r() - 0.5) * 0.16, ol: [] };
    var nn = 1 + (r() * 2.4 | 0);
    for (k = 0; k < nn; k++) nuc.ol.push({ x: nx + (r() - 0.5) * nrx * 0.9, y: ny + (r() - 0.5) * nry * 0.7, z: nz + (r() - 0.5) * nrz * 0.7, r: 1.3 + r() * 1.1 });
    var chrom = []; for (k = 0; k < 40; k++) { var u = r() * TAU, v = Math.sqrt(r()) * 0.85; chrom.push([nx + Math.cos(u) * v * nrx, ny + Math.sin(u) * v * nry, nz + (r() - 0.5) * 1.6 * nrz, 0.35 + r() * 0.4]); }
    var strands = [], ns = 2 + (r() * 4 | 0);
    for (k = 0; k < ns; k++) {
      var ex = lerp(xl + 10, xr - 10, r()), ey = r() < 0.5 ? yAt(j, ex) + 2 : yAt(j + 1, ex) - 2, ez = ZB + 3 + r() * (ZT - ZB - 6);
      var sx = nx + (r() - 0.5) * nrx * 1.6, sy = ny, sz = nz + (r() - 0.5) * nrz;
      var mx = (sx + ex) / 2 + (r() - 0.5) * 50, my = (sy + ey) / 2 + (r() - 0.5) * hgt * 0.5, mz = (sz + ez) / 2 + (r() - 0.5) * 8;
      var pts = []; for (var s = 0; s <= 16; s++) { var t = s / 16, it = 1 - t; pts.push([it * it * sx + 2 * it * t * mx + t * t * ex, it * it * sy + 2 * it * t * my + t * t * ey, it * it * sz + 2 * it * t * mz + t * t * ez]); }
      strands.push({ pts: pts, w: 0.7 + r() * 0.8 });
    }
    var gr = []; for (k = 0; k < 90; k++) {
      var gx = lerp(xl, xr, r()), gy = lerp(top, bot, r()), sideZ = r();
      var gz = sideZ < 0.42 ? ZT - WT - 0.6 - r() * 1.6 : sideZ < 0.84 ? ZB + WT + 0.6 + r() * 1.6 : ZB + 2 + r() * (ZT - ZB - 4);
      gr.push([gx, gy, gz, 0.35 + r() * 0.45]);
    }
    var fib = []; for (k = 0; k < 7; k++) { var fy = lerp(top + 3, bot - 3, r()), fa = (r() - 0.5) * 0.18; fib.push([xl + 5, fy, xr - 5, fy + (xr - xl) * fa]); }
    return { P: P, nuc: nuc, chrom: chrom, strands: strands, gr: gr, fib: fib, xl: xl, xr: xr, top: top, bot: bot };
  }
  function cells(v) {
    var out = [], j0 = Math.floor(v.y0 / ROWH) - 1, j1 = Math.ceil(v.y1 / ROWH) + 1;
    for (var j = j0; j <= j1; j++) {
      var i0 = Math.floor(v.x0 / CL - 0.37 * j) - 1, i1 = Math.ceil(v.x1 / CL - 0.37 * j) + 1;
      for (var i = i0; i <= i1; i++) out.push(cell(j, i));
    }
    return out;
  }
  MODELS.onion = {
    z: [ZB - WT, ZT + WT], K: function (o) { return o >= 40 ? 10 : o === 10 ? 5 : 3; }, mats: mats,
    colors: function (stain) { return { G: PIG.yellow, B: STAINCOL[stain] || STAINCOL.none }; },
    layer: function (g, sl, v, ink) {
      var z0 = sl.z0, z1 = sl.z1, dz = z1 - z0, det = v.k > 0.9, fine = v.k > 1.6;
      var list = v.cache.onion || (v.cache.onion = cells(v));
      var oTop = ovl(ZT - WT, ZT + WT, z0, z1) / dz, oBot = ovl(ZB - WT, ZB + WT, z0, z1) / dz;
      var oFilmT = ovl(ZT - WT - 2.4, ZT - WT, z0, z1) / dz, oFilmB = ovl(ZB + WT, ZB + WT + 2.4, z0, z1) / dz;
      var oSide = ovl(ZB, ZT, z0, z1) / dz;
      for (var c = 0; c < list.length; c++) {
        var C = list[c];
        if (C.xr < v.x0 - 60 || C.xl > v.x1 + 60 || C.bot < v.y0 - 20 || C.top > v.y1 + 20) continue;
        if (oTop + oBot > 0) {
          poly(g, C.P); g.fillStyle = ink.rgb(mats.pwall, (oTop + oBot) * 0.9); g.fill();
          if (det && oTop > 0) { g.strokeStyle = ink.rgb(mats.pwall, oTop * 0.6); g.lineWidth = 0.5; g.beginPath(); C.fib.forEach(function (f) { g.moveTo(f[0], f[1]); g.lineTo(f[2], f[3]); }); g.stroke(); }
        }
        if (oFilmT + oFilmB > 0) { poly(g, C.P); g.fillStyle = ink.rgb(mats.cyto, (oFilmT + oFilmB) * 0.5); g.fill(); }
        if (oSide > 0) {
          poly(g, C.P);
          g.save(); g.clip();
          g.strokeStyle = ink.rgb(mats.cyto, oSide * 0.75); g.lineWidth = 5.5; g.stroke();
          g.restore();
          poly(g, C.P); g.strokeStyle = ink.rgb(mats.wall, oSide * 0.55); g.lineWidth = 1.5; g.stroke();
        }
        if (det) {
          for (var q = 0; q < C.gr.length; q++) { var p = C.gr[q]; if (p[2] < z0 || p[2] >= z1) continue; g.fillStyle = ink.rgb(mats.gran, 0.8); g.beginPath(); g.arc(p[0], p[1], p[3], 0, TAU); g.fill(); }
          C.strands.forEach(function (s) {
            g.beginPath(); var any = false;
            for (var k = 1; k < s.pts.length; k++) { var a = s.pts[k - 1], b = s.pts[k]; any = seg3(g, a[0], a[1], a[2], b[0], b[1], b[2], z0, z1) || any; }
            if (any) { g.strokeStyle = ink.rgb(mats.cyto, 0.9); g.lineWidth = s.w; g.stroke(); }
          });
        }
        var N = C.nuc;
        ellipsoid(g, ink, mats.cyto, 0.55, N.x, N.y, N.z, N.rx + 2.4, N.ry + 2.0, N.rz + 1.6, N.rot, z0, z1);
        if (ellipsoid(g, ink, mats.nuc, 1.0, N.x, N.y, N.z, N.rx, N.ry, N.rz, N.rot, z0, z1)) {
          var zc = clamp(N.z, z0, z1) - N.z, qq = Math.sqrt(Math.max(0, 1 - zc * zc / (N.rz * N.rz)));
          g.strokeStyle = ink.rgb(mats.env, 0.7); g.lineWidth = 0.55; ell(g, N.x, N.y, N.rx * qq, N.ry * qq, N.rot); g.stroke();
          if (fine) for (var k2 = 0; k2 < C.chrom.length; k2++) { var ch = C.chrom[k2]; if (ch[2] < z0 || ch[2] >= z1) continue; g.fillStyle = ink.rgb(mats.chrom, 0.55); g.beginPath(); g.arc(ch[0], ch[1], ch[3], 0, TAU); g.fill(); }
          N.ol.forEach(function (o) { ellipsoid(g, ink, mats.nucleolus, 1.0, o.x, o.y, o.z, o.r, o.r, o.r, 0, z0, z1); });
        }
      }
    },
    marks: [{ z: ZT, en: "top wall", es: "pared de arriba" }, { z: -1.5, en: "nucleus", es: "núcleo" }, { z: ZB, en: "bottom wall", es: "pared de abajo" }],
    side: function (ctx, map, w) {
      /* three cells cut across: walls, a nucleus at its depth */
      ctx.strokeStyle = "rgba(236,226,196,.75)"; ctx.lineWidth = 1.5;
      var y0 = map(ZT), y1 = map(ZB);
      for (var i = 0; i < 4; i++) { var x = w * (0.04 + i * 0.32); ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(w * 0.04, y0); ctx.lineTo(w * 1.0, y0); ctx.moveTo(w * 0.04, y1); ctx.lineTo(w * 1.0, y1); ctx.stroke();
      ctx.fillStyle = "rgba(200,170,110,.55)";
      [[0.12, -3], [0.47, 2], [0.86, -5]].forEach(function (n) { ctx.beginPath(); ctx.ellipse(w * n[0], map(n[1]), w * 0.045, Math.abs(map(6) - map(0)), 0, 0, TAU); ctx.fill(); });
    }
  };
})();

/* ══ the renderer ══════════════════════════════════════════════════════════════════════════ */
var MODE_ID = { bright: 0, phase: 1, dark: 2, polar: 3, fluor: 4, slit: 5 };
function texMode(illum) { return illum === "polar" ? "polar" : illum === "fluor" ? "fluor" : "bf"; }

function slabs(model, obj) {
  var K = model.K(obj), z0 = model.z[0], z1 = model.z[1], d = (z1 - z0) / K, out = [];
  for (var k = 0; k < K; k++) out.push({ z0: z0 + k * d, z1: z0 + (k + 1) * d, z: z0 + (k + 0.5) * d, w: d });
  return out;
}

/* view: what part of the slide the layer textures cover, in µm */
function viewOf(L, o, R, N, margin) {
  var s = o.zoom / UMU * (R / o.w) * (o.fovScale || 1);           /* GL px per µm */
  var P = [L.panX * UMU, L.panY * UMU];
  var half = (R * (1 + 2 * margin) / 2) / s;
  return { s: s, P: P, cx: -P[0], cy: -P[1], half: half, x0: -P[0] - half, x1: -P[0] + half, y0: -P[1] - half, y1: -P[1] + half, k: N / (2 * half) };
}

function ensureLayers(model, L, o, R, mode, stain) {
  var gl = G.gl, margin = 0.14;
  var N = Math.min(PHONE ? 640 : 1024, Math.max(256, Math.round(R * (1 + 2 * margin) / 8) * 8), G.maxTex);
  var sl = slabs(model, L.obj), K = sl.length;
  var key = [L.spec, L.obj, mode, stain, N, K, R, o.fovScale || 1, o.barPeriod || 0].join("|");
  var cur = viewOf(L, o, R, N, margin);
  var Ly = G.layer;
  if (Ly && Ly.key === key) {
    var dx = (cur.P[0] - Ly.view.P[0]) * cur.s, dy = (cur.P[1] - Ly.view.P[1]) * cur.s;
    if (Math.abs(dx) < R * margin * 0.85 && Math.abs(dy) < R * margin * 0.85) { Ly.cur = cur; return Ly; }
  }
  if (!Ly || Ly.N !== N || Ly.K !== K) {
    if (Ly && Ly.tex) gl.deleteTexture(Ly.tex);
    Ly = G.layer = { tex: arrayTex(N, N, K), N: N, K: K };
  }
  var t0 = performance.now();
  var ink = makeInk(mode, stain), v = cur; v.cache = {}; v.obj = L.obj; v.barPeriod = o.barPeriod;
  for (var k = 0; k < K; k++) {
    var g = scratch(N, N);
    g.setTransform(-v.k, 0, 0, -v.k, N / 2 - v.k * v.P[0], N / 2 - v.k * v.P[1]);
    model.layer(g, sl[k], v, ink);
    upload(Ly.tex, k, N, N);
  }
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, Ly.tex); gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
  STATS.paints++; STATS.paintMs = Math.round(performance.now() - t0);
  Ly.key = key; Ly.view = v; Ly.cur = cur; Ly.sl = sl; Ly.margin = margin;
  return Ly;
}

function ensureType(model, name, mode, stain) {
  var T = model.types[name], key = model.id + ":" + name + ":" + mode + ":" + stain + ":" + (PHONE ? "p" : "d");
  var have = G.types[key]; if (have) return have;
  var gl = G.gl, tx = T.tex * (PHONE ? 2 : 1);
  var W = Math.min(PHONE ? 512 : 1024, Math.max(16, Math.round(2 * T.half[0] / tx / 4) * 4));
  var H = Math.min(PHONE ? 512 : 1024, Math.max(16, Math.round(2 * T.half[1] / tx / 4) * 4));
  var S = T.zoff.length, V = T.variants || 1;
  var tex = arrayTex(W, H, S * V), ink = makeInk(mode, stain);
  for (var v = 0; v < V; v++) for (var j = 0; j < S; j++) {
    var g = scratch(W, H);
    g.setTransform(W / (2 * T.half[0]), 0, 0, H / (2 * T.half[1]), W / 2, H / 2);
    var zc = T.zoff[j], hw = T.slab / 2;
    T.bake(g, { z0: zc - hw, z1: zc + hw, z: zc, j: j }, v, ink);
    upload(tex, v * S + j, W, H);
  }
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex); gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
  STATS.bakes++;
  return (G.types[key] = { tex: tex, W: W, H: H, S: S, V: V, T: T });
}

function setOptics(u, gl, L, o) {
  var na = naOf(L), cf = condFrac(L), n = immersion(L);
  var naEff = na * (1 + cf) / 2, tanA = naEff / Math.sqrt(Math.max(0.05, n * n - naEff * naEff));
  var d = abbeUm(L), haze = (L.obj === 100 && !L.oil) ? 0.55 : (L.obj === 40 && L.oil40) ? 1.4 : 0;
  gl.uniform1f(u.uTanA, tanA); gl.uniform1f(u.uCond, cf); gl.uniform1f(u.uSigRes, 0.38 * d); gl.uniform1f(u.uHaze, haze);
  gl.uniform1f(u.uZf, o.zf);
  if (u.uScat) gl.uniform1f(u.uScat, 0.30 * (1.05 - na * 0.55));
  if (u.uKappa) gl.uniform1f(u.uKappa, 0.55 * (1.15 - cf * 0.75));
  if (u.uHalo) gl.uniform1f(u.uHalo, Math.max(1.2, 0.006 * (18000 / L.obj)));
  if (u.uDark) gl.uniform1f(u.uDark, 1.0);
  if (u.uBirSc) gl.uniform1f(u.uBirSc, 2.6);
}

function render(fctx, w, h, L, o) {
  var model = MODELS[o.model || L.spec];
  if (!model || !init()) return false;
  var t0 = performance.now(), gl = G.gl;
  var R = Math.min(w, PHONE ? 760 : 1100, G.maxTex);
  if (G.canvas.width !== R || G.canvas.height !== R) { G.canvas.width = R; G.canvas.height = R; }
  ensureAcc(R, R);
  var illum = o.illum || L.illum || "bright", mode = texMode(illum), mid = MODE_ID[illum] == null ? 0 : MODE_ID[illum];
  var stain = (L.stain && L.stain !== "none") ? L.stain : "none";
  if (model.live && o.t != null) model.live(o.t);
  var Ly = model.layer ? ensureLayers(model, L, o, R, mode, stain) : null;
  var cur = Ly ? Ly.cur : viewOf(L, o, R, 512, 0);
  var cols = model.colors(stain, mode);

  gl.bindFramebuffer(gl.FRAMEBUFFER, G.fb); gl.viewport(0, 0, R, R);
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND); gl.blendEquation(gl.FUNC_ADD); gl.blendFunc(gl.ONE, gl.ONE);
  var asc = G.float ? 1 : 1;

  /* 1 · the slabs */
  if (Ly) {
    var P = G.progs.layer, u = P.u; gl.useProgram(P.p); gl.bindVertexArray(G.vaoL);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D_ARRAY, Ly.tex); gl.uniform1i(u.uTex, 0);
    gl.uniform2f(u.uTexSize, Ly.N, Ly.N); gl.uniform1i(u.uMode, mid);
    gl.uniform3fv(u.uColG, cols.G); gl.uniform3fv(u.uColB, cols.B); gl.uniform1f(u.uASc, 1.0 * asc);
    gl.uniform1f(u.uOrient, 0);
    setOptics(u, gl, L, o);
    var sc = 1 / (1 + 2 * Ly.margin);
    gl.uniform1f(u.uScale, sc);
    var shx = (cur.P[0] - Ly.view.P[0]) * cur.s / (R * (1 + 2 * Ly.margin)), shy = (cur.P[1] - Ly.view.P[1]) * cur.s / (R * (1 + 2 * Ly.margin));
    gl.uniform2f(u.uShift, shx, shy);
    gl.uniform1f(u.uTpu, Ly.view.k);
    for (var k = 0; k < Ly.sl.length; k++) {
      var s = Ly.sl[k];
      gl.uniform1f(u.uLayer, k); gl.uniform1f(u.uZ, s.z); gl.uniform1f(u.uW, s.w / 3);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }
  /* 2 · the objects */
  if (model.items) {
    var items = model.items(cur, L, o.t || 0);
    var SP = G.progs.sprite, su = SP.u; gl.useProgram(SP.p); gl.bindVertexArray(G.vaoS);
    gl.uniform1i(su.uMode, mid); gl.uniform1f(su.uASc, 1.0 * asc);
    setOptics(su, gl, L, o);
    gl.uniform1f(su.uS, cur.s); gl.uniform2f(su.uPan, cur.P[0], cur.P[1]); gl.uniform2f(su.uView, R, R);
    Object.keys(items).forEach(function (name) {
      var arr = items[name]; if (!arr || !arr.length) return;
      var TT = ensureType(model, name, mode, stain), T = TT.T;
      var tc = (T.colors && T.colors(stain, mode)) || cols;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D_ARRAY, TT.tex); gl.uniform1i(su.uTex, 0);
      gl.uniform2f(su.uTexSize, TT.W, TT.H); gl.uniform2f(su.uHalf, T.half[0], T.half[1]); gl.uniform2f(su.uHalf2, T.half[0], T.half[1]);
      gl.uniform3fv(su.uColG, tc.G); gl.uniform3fv(su.uColB, tc.B);
      gl.uniform1f(su.uOrient, T.orient || 0); gl.uniform1f(su.uAxis, T.axis || 0); gl.uniform2f(su.uHil, (T.hilum || [0, 0])[0], (T.hilum || [0, 0])[1]);
      if (T.birSc != null) gl.uniform1f(su.uBirSc, T.birSc);
      gl.uniform1f(su.uSN, TT.S);
      gl.bindBuffer(gl.ARRAY_BUFFER, G.inst); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STREAM_DRAW);
      var n = arr.length / 8;
      for (var j = 0; j < TT.S; j++) {
        gl.uniform1f(su.uSub, j); gl.uniform1f(su.uZoff, T.zoff[j]); gl.uniform1f(su.uW, T.slab / 3);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, n);
      }
      if (T.birSc != null) gl.uniform1f(su.uBirSc, 2.6);
    });
  }
  gl.disable(gl.BLEND);
  /* 3 · light */
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, R, R);
  var F = G.progs.final, fu = F.u; gl.useProgram(F.p); gl.bindVertexArray(G.vaoL);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, G.acc); gl.uniform1i(fu.uAcc, 0);
  gl.uniform1i(fu.uMode, mid);
  var bright = (0.35 + ((L.dia == null ? 70 : L.dia) / 100) * 0.7) * ((L.rheo == null ? 72 : L.rheo) / 78);
  gl.uniform3f(fu.uLamp, 1.0, 0.965, 0.90);
  var gain = mid === 0 ? clamp(0.50 + 0.42 * bright, 0.32, 1.0) : mid === 1 ? clamp(0.62 + 0.3 * bright, 0.4, 1.05) : mid === 3 ? 1.65 * clamp(0.5 + 0.5 * bright, 0.4, 1.2) : mid === 4 ? 2.2 : clamp(1.4 * bright, 0.5, 2.4);
  gl.uniform1f(fu.uGain, gain);
  gl.uniform1f(fu.uHazeMix, (L.obj === 100 && !L.oil) ? 0.32 : (L.obj === 40 && L.oil40) ? 0.55 : 0);
  gl.uniform1f(fu.uPolAng, (L.polar || 0) * Math.PI / 180); gl.uniform1f(fu.uPlate, L.plate ? 1 : 0);
  gl.uniform1f(fu.uBg, 0.52); gl.uniform1f(fu.uPhG, 0.62);
  gl.uniform1fv(fu.uLam, CMF.lam); gl.uniform3fv(fu.uCmf, CMF.w);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  fctx.save(); fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.globalCompositeOperation = "source-over"; fctx.globalAlpha = 1; fctx.filter = "none";
  fctx.imageSmoothingEnabled = true; fctx.imageSmoothingQuality = "high";
  fctx.drawImage(G.canvas, 0, 0, w, h); fctx.restore();
  STATS.renders++; STATS.ms = Math.round(performance.now() - t0); STATS.lastSpec = L.spec; STATS.R = R; STATS.N = Ly ? Ly.N : 0; STATS.K = Ly ? Ly.K : 0;
  return true;
}

function dispose() {
  if (!G) return;
  if (G.ok) {
    var gl = G.gl;
    try {
      Object.keys(G.types || {}).forEach(function (k) { gl.deleteTexture(G.types[k].tex); });
      if (G.layer && G.layer.tex) gl.deleteTexture(G.layer.tex);
      if (G.acc) gl.deleteTexture(G.acc); if (G.fb) gl.deleteFramebuffer(G.fb);
      [G.quad, G.corner, G.inst].forEach(function (b) { if (b) gl.deleteBuffer(b); });
      Object.keys(G.progs).forEach(function (k) { gl.deleteProgram(G.progs[k].p); });
      if (G.lose) G.lose.loseContext();
    } catch (e) {}
    G.canvas.width = G.canvas.height = 1;
  }
  G = null; STATS.backend = "none";
}

/* ── the side view: where the sharp slice sits in the sample ── */
function side(ctx, w, h, L, zf) {
  var model = MODELS[L.spec]; if (!model) return;
  var z0 = model.z[0], z1 = model.z[1], span = z1 - z0, pad = Math.max(span * 0.35, 4);
  var top = z1 + pad, bot = z0 - pad;
  var map = function (z) { return 6 + (top - z) / (top - bot) * (h - 12); };
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#17130d"; ctx.fillRect(0, 0, w, h);
  /* the slide below and the cover glass above */
  ctx.fillStyle = "rgba(160,190,200,.16)"; ctx.fillRect(0, map(z0 - pad * 0.45), w, h);
  ctx.fillRect(0, 0, w, map(z1 + pad * 0.45));
  if (model.side) { ctx.save(); model.side(ctx, map, w); ctx.restore(); }
  var dof = dofUm(L), yf = map(zf), band = Math.max(2, Math.abs(map(zf + dof / 2) - map(zf - dof / 2)));
  ctx.fillStyle = "rgba(242,212,138,.22)"; ctx.fillRect(0, yf - band / 2, w, band);
  ctx.strokeStyle = "#f2d48a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, yf); ctx.lineTo(w, yf); ctx.stroke();
  ctx.fillStyle = "#f2d48a"; ctx.beginPath(); ctx.moveTo(w - 1, yf); ctx.lineTo(w - 9, yf - 5); ctx.lineTo(w - 9, yf + 5); ctx.closePath(); ctx.fill();
}
/* what is sharp now, in plain words */
function sharpNow(L, zf) {
  var model = MODELS[L.spec]; if (!model) return null;
  var es = L.lang === "es", dof = dofUm(L), z0 = model.z[0], z1 = model.z[1];
  var near = null, best = 1e9;
  (model.marks || []).forEach(function (m) { var d = Math.abs(m.z - zf); if (d < best) { best = d; near = m; } });
  if (zf > z1 + Math.max(dof * 0.6, 1.5)) return es ? "Arriba de la muestra" : "Above the sample";
  if (zf < z0 - Math.max(dof * 0.6, 1.5)) return es ? "Debajo de la muestra" : "Below the sample";
  if (dof > (z1 - z0) * 1.2) return es ? "Toda la muestra a la vez" : "The whole sample at once";
  if (near && best < Math.max(dof * 0.8, model.markTol || 3)) return es ? near.es : near.en;
  var above = null, below = null;
  (model.marks || []).forEach(function (m) { if (m.z > zf && (!above || m.z < above.z)) above = m; if (m.z < zf && (!below || m.z > below.z)) below = m; });
  if (above && below) return es ? "Entre " + below.es + " y " + above.es : "Between the " + above.en + " and the " + below.en;
  return es ? "Dentro de la muestra" : "Inside the sample";
}

window.AOGMicro3D = {
  version: 1,
  UMU: UMU, UMZ: UMZ,
  has: function (spec) { return !!MODELS[spec] && spec.charAt(0) !== "_"; },
  specs: function () { return Object.keys(MODELS).filter(function (k) { return k.charAt(0) !== "_"; }); },
  ok: function () { return init(); },
  render: render, dispose: dispose, side: side, sharpNow: sharpNow,
  range: function (spec) { var m = MODELS[spec]; return m ? m.z.slice() : null; },
  abbeUm: abbeUm, dofUm: dofUm, naOf: naOf, condFrac: condFrac, nmOf: nmOf,
  info: function () { return { backend: STATS.backend, renders: STATS.renders, paints: STATS.paints, bakes: STATS.bakes, ms: STATS.ms, paintMs: STATS.paintMs, R: STATS.R, N: STATS.N, K: STATS.K, spec: STATS.lastSpec, live: !!G && G.ok }; },
  canvas: function () { return G && G.canvas; },
  _models: MODELS
};
})();
