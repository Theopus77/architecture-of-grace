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
"    float scat = length(gR)*uScat*1.2;",
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
"  vec2 e = abs(vLoc)*abs(vLoc); float se = sqrt(sqrt(dot(e,e)));",   /* a soft rounded window: no square edges */
"  o = share(L, q, tpu, vDz, uW*vSc, vAux, vRot + uAxis, vLoc - uHil) * (1.0 - smoothstep(0.86, 1.0, se));",
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
"  else if(uMode==1){ col = uBg * (1.0 - uPhG*tanh(a.a*2.6)) * exp(-a.rgb) * uLamp * uGain; bg = uBg*uLamp*uGain; }",
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
  var g = c.getContext("2d", { alpha: false, willReadFrequently: true });   /* a CPU canvas: drawn, then copied to the GPU */
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
    wall: M({ ph: 0.62, pig: 0.02, st: { iodine: 0.06, methylene: 0.12, safranin: 0.34 }, bir: 0.95, fl: [0.03, 0.16, 0.0] }),
    pwall: M({ ph: 0.30, pig: 0.01, st: { iodine: 0.03, methylene: 0.05, safranin: 0.15 }, bir: 0.0, fl: [0.0, 0.006, 0.0] }),
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
  var memo = new Map();
  function cellM(j, i) { var k = j * 100003 + i, c = memo.get(k); if (!c) { if (memo.size > 6000) memo.clear(); c = cell(j, i); memo.set(k, c); } return c; }
  function cells(v) {
    var out = [], j0 = Math.floor(v.y0 / ROWH) - 1, j1 = Math.ceil(v.y1 / ROWH) + 1;
    for (var j = j0; j <= j1; j++) {
      var i0 = Math.floor(v.x0 / CL - 0.37 * j) - 1, i1 = Math.ceil(v.x1 / CL - 0.37 * j) + 1;
      for (var i = i0; i <= i1; i++) out.push(cellM(j, i));
    }
    return out;
  }
  MODELS.onion = {
    z: [ZB - WT, ZT + WT], K: function (o) { return o >= 40 ? 10 : o === 10 ? 5 : 3; }, mats: mats, birSc: 0.5,
    colors: function (stain) { return { G: PIG.yellow, B: STAINCOL[stain] || STAINCOL.none }; },
    layer: function (g, sl, v, ink) {
      var z0 = sl.z0, z1 = sl.z1, dz = z1 - z0, det = v.k > 0.9, fine = v.k > 1.6;
      var list = v.cache.onion || (v.cache.onion = cells(v)), low = v.k < 0.45, lw = Math.max(1.5, 1.3 / v.k);
      var oTop = ovl(ZT - WT, ZT + WT, z0, z1) / dz, oBot = ovl(ZB - WT, ZB + WT, z0, z1) / dz;
      var oFilmT = ovl(ZT - WT - 2.4, ZT - WT, z0, z1) / dz, oFilmB = ovl(ZB + WT, ZB + WT + 2.4, z0, z1) / dz;
      var oSide = ovl(ZB, ZT, z0, z1) / dz;
      for (var c = 0; c < list.length; c++) {
        var C = list[c];
        if (C.xr < v.x0 - 60 || C.xl > v.x1 + 60 || C.bot < v.y0 - 20 || C.top > v.y1 + 20) continue;
        if (low) {   /* far away: the walls and the nuclei are all that can show */
          if (oSide > 0) { poly(g, C.P); g.strokeStyle = ink.rgb(mats.wall, oSide * 0.3); g.lineWidth = lw; g.stroke(); }
          var N0 = C.nuc, o0 = ovl(N0.z - N0.rz, N0.z + N0.rz, z0, z1) / dz;
          if (o0 > 0) { g.fillStyle = ink.rgb(mats.nuc, o0 * 0.9); ell(g, N0.x, N0.y, N0.rx, N0.ry, N0.rot); g.fill(); }
          continue;
        }
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
    marks: [{ z: ZT, en: "the top wall", es: "la pared de arriba" }, { z: -1.5, en: "the nucleus", es: "el núcleo" }, { z: ZB, en: "the bottom wall", es: "la pared de abajo" }],
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

/* ── shared for the slides below ── */
/* every tile of a repeating slide that the view touches (pad: how far an object can reach past its tile) */
function eachTile(v, size, pad, fn) {
  var i0 = Math.floor((v.x0 - pad) / size), i1 = Math.floor((v.x1 + pad) / size);
  var j0 = Math.floor((v.y0 - pad) / size), j1 = Math.floor((v.y1 + pad) / size);
  for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) fn(i, j, i * size, j * size);
}
function tileRng(i, j, salt) { return mulberry((Math.imul(i, 73856093) ^ Math.imul(j, 19349663) ^ Math.imul(salt, 83492791)) | 0); }
/* instance lists: [x, y, z, rotation, scale, variant, stain uptake, aspect] */
function Inst() { this.a = []; }
Inst.prototype.add = function (x, y, z, rot, sc, vr, aux, asp) { this.a.push(x, y, z, rot, sc, vr || 0, aux == null ? 1 : aux, asp || 1); };
Inst.prototype.out = function () { return new Float32Array(this.a); };
function inView(v, x, y, r) { return x > v.x0 - r && x < v.x1 + r && y > v.y0 - r && y < v.y1 + r; }
/* far away, many small things become an even film: one tile painted once, then repeated (pattern) */
function film(g, v, period, key, paint) {
  var px = Math.max(8, Math.min(512, Math.round(period * v.k)));
  var c = v.cache["film:" + key];
  if (!c) {
    c = document.createElement("canvas"); c.width = c.height = px;
    var t = c.getContext("2d"); t.fillStyle = "#000"; t.fillRect(0, 0, px, px); t.globalCompositeOperation = "lighter";
    t.setTransform(px / period, 0, 0, px / period, 0, 0);
    for (var oy = -1; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++) { t.save(); t.translate(ox * period, oy * period); paint(t); t.restore(); }
    v.cache["film:" + key] = c;
  }
  var pat = g.createPattern(c, "repeat");
  if (pat.setTransform) pat.setTransform(new DOMMatrix().scale(period / px));
  g.fillStyle = pat; g.fillRect(v.x0, v.y0, v.x1 - v.x0, v.y1 - v.y0);
}
/* a sphere-ish blob baked in slices: rx, ry across, rz deep; the slice [z0, z1] is relative to its middle */
function blobSlice(g, ink, m, amt, x, y, z, rx, ry, rz, rot, sl) { return ellipsoid(g, ink, m, amt, x, y, z, rx, ry, rz, rot, sl.z0, sl.z1); }
function zoffs(r, step) { var a = []; for (var z = -r + step / 2; z < r; z += step) a.push(+z.toFixed(3)); return a; }
/* points spread evenly over a sphere */
function fib(n) { var a = [], ga = Math.PI * (3 - Math.sqrt(5)); for (var i = 0; i < n; i++) { var z = 1 - 2 * (i + 0.5) / n, r = Math.sqrt(1 - z * z), t = ga * i; a.push([Math.cos(t) * r, Math.sin(t) * r, z]); } return a; }
/* a stroke through a slab along a 3D polyline */
function line3(g, pts, z0, z1, w, rgb) {
  g.beginPath(); var any = false;
  for (var k = 1; k < pts.length; k++) { var a = pts[k - 1], b = pts[k]; any = seg3(g, a[0], a[1], a[2], b[0], b[1], b[2], z0, z1) || any; }
  if (any) { g.strokeStyle = rgb; g.lineWidth = w; g.stroke(); }
  return any;
}
function rpoly(cx, cy, R, n, jit, r) { var P = []; for (var k = 0; k < n; k++) { var a = k / n * TAU + (r() - 0.5) * 0.35, rr = R * (1 + (r() - 0.5) * jit); P.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return P; }
/* a closed curve through points (soft corners: nothing in a living thing is a sharp straight line) */
function smooth(g, P) {
  var n = P.length; g.beginPath();
  for (var i = 0; i < n; i++) { var a = P[i], b = P[(i + 1) % n], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; if (i === 0) { var z = P[n - 1]; g.moveTo((z[0] + a[0]) / 2, (z[1] + a[1]) / 2); } g.quadraticCurveTo(a[0], a[1], mx, my); }
  g.closePath();
}

/* ══ CHEEK CELLS ═════════════════════════════════════════════════════════════════════════════
   Flat scales from the inside of a cheek, 50–70 µm across and only 2–3 µm thick, lying in loose drifts. They lie
   at different heights (one on top of another), so the fine knob brings one cell sharp while the cell under it
   blurs. Each has a small nucleus (about 8 µm, bulging a little), creases where the sheet folded, fine granules,
   and mouth bacteria resting on top.                                                                           */
(function () {
  var T = 190;
  var mats = {
    cyto: M({ ph: 0.26, st: { iodine: 0.12, methylene: 0.22, safranin: 0.16 }, fl: [0.0, 0.012, 0.0] }),
    rim: M({ ph: 0.62, st: { iodine: 0.18, methylene: 0.32, safranin: 0.22 }, bir: 0.04, fl: [0.0, 0.02, 0.0] }),
    fold: M({ ph: 0.7, st: { iodine: 0.2, methylene: 0.36, safranin: 0.26 }, fl: [0.0, 0.02, 0.0] }),
    gran: M({ ph: 0.8, st: { iodine: 0.3, methylene: 0.45, safranin: 0.3 }, fl: [0.0, 0.03, 0.0] }),
    nuc: M({ ph: 0.55, st: { iodine: 0.55, methylene: 0.95, safranin: 0.75 }, fl: [0.85, 0.0, 0.0] }),
    bact: M({ ph: 0.7, st: { iodine: 0.4, methylene: 1.0, safranin: 0.85 }, fl: [0.65, 0.0, 0.0] })
  };
  var memo = new Map();
  function tile(i, j) {
    var key = i * 7919 + j, have = memo.get(key); if (have) return have;
    if (memo.size > 3000) memo.clear();
    var r = tileRng(i, j, 0xc4ee), out = [];
    var n = r() < 0.12 ? 0 : 2 + (r() * 4 | 0);
    var bx = i * T + 50 + r() * (T - 100), by = j * T + 50 + r() * (T - 100);
    for (var c = 0; c < n; c++) {
      var cx = bx + (r() - 0.5) * 120, cy = by + (r() - 0.5) * 110, R = 25 + r() * 9;
      var zc = c === 0 ? -5 + r() * 2 : -3 + r() * 7.5, th = 1.1 + r() * 0.6;
      var P = rpoly(cx, cy, R, 9 + (r() * 3 | 0), 0.32, r);
      var nx = cx + (r() - 0.5) * R * 0.35, ny = cy + (r() - 0.5) * R * 0.35;
      var folds = []; for (var k = 0; k < 2 + (r() * 3 | 0); k++) {
        var a = r() * TAU, l = R * (0.4 + r() * 0.5), ox = cx + (r() - 0.5) * R, oy = cy + (r() - 0.5) * R;
        var pts = []; for (var s = 0; s <= 6; s++) { var t = s / 6 - 0.5; pts.push([ox + Math.cos(a) * l * t + Math.sin(t * 3 + k) * 2, oy + Math.sin(a) * l * t, zc + th + 0.2]); }
        folds.push(pts);
      }
      var gr = []; for (k = 0; k < 70; k++) { var u = r() * TAU, w = Math.sqrt(r()) * R * 0.85; gr.push([cx + Math.cos(u) * w, cy + Math.sin(u) * w, 0.25 + r() * 0.35]); }
      var bac = []; if (r() < 0.75) { var bn = 4 + (r() * 22 | 0), ba = r() * TAU, bd = r() * R * 0.6; for (k = 0; k < bn; k++) bac.push([cx + Math.cos(ba) * bd + (r() - 0.5) * 18, cy + Math.sin(ba) * bd + (r() - 0.5) * 18, r() * TAU, r() < 0.6 ? 1.6 + r() * 1.2 : 0.5]); }
      out.push({ P: P, cx: cx, cy: cy, R: R, z: zc, th: th, nx: nx, ny: ny, nr: 3.8 + r() * 1.2, nrot: r() * TAU, folds: folds, gr: gr, bac: bac });
    }
    memo.set(key, out); return out;
  }
  MODELS.cheek = {
    z: [-9, 9], K: function (o) { return o >= 40 ? 9 : o === 10 ? 4 : 3; }, mats: mats, birSc: 0.5,
    colors: function (stain) { return { G: PIG.none, B: STAINCOL[stain] || STAINCOL.none }; },
    layer: function (g, sl, v, ink) {
      var z0 = sl.z0, z1 = sl.z1, dz = z1 - z0, det = v.k > 0.7, low = v.k < 0.3;
      eachTile(v, T, 120, function (i, j) {
        tile(i, j).forEach(function (C) {
          if (!inView(v, C.cx, C.cy, C.R * 1.4)) return;
          var o = ovl(C.z - C.th, C.z + C.th, z0, z1) / dz;
          if (o > 0) {
            smooth(g, C.P); g.fillStyle = ink.rgb(mats.cyto, o * 1.6); g.fill();
            g.strokeStyle = ink.rgb(mats.rim, o * 1.3); g.lineWidth = low ? Math.max(2, 1.4 / v.k) : 1.6; g.stroke();
            if (det) for (var q = 0; q < C.gr.length; q++) { var p = C.gr[q]; g.fillStyle = ink.rgb(mats.gran, o * 0.9); g.beginPath(); g.arc(p[0], p[1], p[2], 0, TAU); g.fill(); }
          }
          if (!low) C.folds.forEach(function (f) { line3(g, f, z0 - 0.6, z1 + 0.6, 1.3, ink.rgb(mats.fold, 0.7)); });
          ellipsoid(g, ink, mats.nuc, 1.0, C.nx, C.ny, C.z + 0.9, C.nr, C.nr * 0.82, 2.0, C.nrot, z0, z1);
          if (det) { var bz = C.z + C.th + 0.8; if (bz >= z0 && bz < z1) C.bac.forEach(function (b) {
            g.fillStyle = ink.rgb(mats.bact, 1); g.save(); g.translate(b[0], b[1]); g.rotate(b[2]); ell(g, 0, 0, b[3] / 2 + 0.3, 0.42, 0); g.fill(); g.restore(); }); }
        });
      });
    },
    marks: [{ z: 3.5, en: "the upper cell", es: "la célula de arriba" }, { z: -4, en: "the lower cell", es: "la célula de abajo" }, { z: 5.8, en: "bacteria on top", es: "bacterias encima" }],
    markTol: 1.6,
    side: function (ctx, map, w) {
      ctx.fillStyle = "rgba(196,206,226,.55)";
      ctx.beginPath(); ctx.ellipse(w * 0.32, map(-4), w * 0.26, Math.max(2, Math.abs(map(1.3) - map(0))), 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w * 0.62, map(3.4), w * 0.24, Math.max(2, Math.abs(map(1.3) - map(0))), 0.04, 0, TAU); ctx.fill();
      ctx.fillStyle = "rgba(120,140,200,.85)"; ctx.beginPath(); ctx.ellipse(w * 0.62, map(4.3), w * 0.03, Math.abs(map(2) - map(0)), 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w * 0.3, map(-3.1), w * 0.03, Math.abs(map(2) - map(0)), 0, 0, TAU); ctx.fill();
    }
  };
})();

/* ══ BAKER'S YEAST ════════════════════════════════════════════════════════════════════════════
   A wet drop about 24 µm deep with oval cells (5 × 4 µm) floating at every height, some budding. Only a thin slice
   is sharp at 40× and 100×, so as you turn the fine knob cells come and go. With methylene blue, live cells push
   the dye out and stay pale; dead cells turn blue.                                                             */
(function () {
  var T = 70;
  var mats = {
    wall: M({ ph: 0.95, st: { iodine: 0.25, methylene: 0.5, safranin: 0.4 }, bir: 0.05, fl: [0.0, 0.05, 0.0] }),
    cyt: M({ ph: 0.55, st: { iodine: 0.35, methylene: 0.8, safranin: 0.5 }, fl: [0.0, 0.02, 0.0] }),
    vac: M({ ph: 0.12, st: { iodine: 0.05, methylene: 0.1, safranin: 0.05 } }),
    nuc: M({ ph: 0.6, st: { iodine: 0.4, methylene: 0.9, safranin: 0.6 }, fl: [0.9, 0.0, 0.0] }),
    gran: M({ ph: 1.0, st: { iodine: 0.7, methylene: 0.6, safranin: 0.5 }, fl: [0.0, 0.05, 0.0] })
  };
  function cellBake(g, ink, sl, x, y, rx, ry, rz, rot, seed) {
    var r = mulberry(seed);
    shell(g, ink, mats.wall, 0.9, x, y, 0, Math.min(rx, ry), 0.32, sl.z0, sl.z1);
    blobSlice(g, ink, mats.cyt, 0.9, x, y, 0, rx * 0.92, ry * 0.92, rz * 0.92, rot, sl);
    blobSlice(g, ink, mats.vac, 0.7, x + rx * 0.15, y - ry * 0.05, 0.2, rx * 0.42, ry * 0.45, rz * 0.45, rot, sl);
    blobSlice(g, ink, mats.nuc, 0.8, x - rx * 0.35, y + ry * 0.2, -0.3, 0.75, 0.7, 0.7, 0, sl);
    for (var k = 0; k < 5; k++) blobSlice(g, ink, mats.gran, 0.9, x + (r() - 0.5) * rx, y + (r() - 0.5) * ry, (r() - 0.5) * rz, 0.22, 0.22, 0.22, 0, sl);
  }
  var types = {
    cell: {
      half: [6.2, 3.8], tex: 0.06, slab: 1.0, zoff: zoffs(2.4, 1.0), variants: 3,
      bake: function (g, sl, vr, ink) {
        /* ellipsoids in the slice: the page clips each to its own square */
        if (vr === 0) cellBake(g, ink, sl, 0, 0, 2.6, 2.15, 2.1, 0, 11);
        else if (vr === 1) { cellBake(g, ink, sl, -0.9, 0, 2.6, 2.15, 2.1, 0, 12); cellBake(g, ink, sl, 2.6, 0.25, 1.25, 1.05, 1.0, 0, 13); }
        else { cellBake(g, ink, sl, -2.4, 0, 2.5, 2.05, 2.0, 0.1, 14); cellBake(g, ink, sl, 2.4, 0.3, 2.4, 2.0, 2.0, -0.2, 15); }
      }
    }
  };
  var memo = new Map();
  function tile(i, j) {
    var key = i * 7919 + j, have = memo.get(key); if (have) return have;
    if (memo.size > 6000) memo.clear();
    var r = tileRng(i, j, 0x7ea5), n = 9 + (r() * 9 | 0), out = [];
    for (var k = 0; k < n; k++) out.push([i * T + r() * T, j * T + r() * T, -10 + r() * 20, r() * TAU, 0.85 + r() * 0.3, r() < 0.55 ? 0 : r() < 0.75 ? 1 : 2, r() < 0.13 ? 1 : 0.07]);
    memo.set(key, out); return out;
  }
  MODELS.yeast = {
    z: [-12.5, 12.5], K: function () { return 4; }, mats: mats, types: types, birSc: 0.5,
    colors: function (stain) { return { G: PIG.none, B: STAINCOL[stain] || STAINCOL.none }; },
    /* far away (4×, 10×) the cells are drawn into the slabs as specks */
    layer: function (g, sl, v, ink) {
      if (v.k >= 0.6) return;
      var z0 = sl.z0, z1 = sl.z1;
      film(g, v, 700, "yeast" + z0.toFixed(1), function (t) {
        for (var i = 0; i < 10; i++) for (var j = 0; j < 10; j++) tile(i, j).forEach(function (c) {
          if (c[2] < z0 || c[2] >= z1) return;
          t.fillStyle = ink.rgb(mats.cyt, 1); ell(t, c[0], c[1], 2.6 * c[4], 2.1 * c[4], c[3]); t.fill();
          t.strokeStyle = ink.rgb(mats.wall, 0.8); t.lineWidth = 0.9; t.stroke();
        });
      });
    },
    items: function (v) {
      if (v.k < 0.6) return {};
      var I = new Inst();
      eachTile(v, T, 8, function (i, j) { tile(i, j).forEach(function (c) { if (inView(v, c[0], c[1], 8)) I.add(c[0], c[1], c[2], c[3], c[4], c[5], c[6], 1); }); });
      return { cell: I.out() };
    },
    marks: [{ z: 6, en: "cells near the top", es: "células cerca de arriba" }, { z: 0, en: "cells in the middle", es: "células en el medio" }, { z: -6, en: "cells near the bottom", es: "células cerca del fondo" }],
    markTol: 3,
    side: function (ctx, map, w) {
      var r = mulberry(5); ctx.fillStyle = "rgba(220,206,170,.7)";
      for (var k = 0; k < 26; k++) { ctx.beginPath(); ctx.ellipse(w * r(), map(-10 + r() * 20), 4, 3, 0, 0, TAU); ctx.fill(); }
    }
  };
})();

/* ══ BLOOD SMEAR ══════════════════════════════════════════════════════════════════════════════
   A thin film, one cell deep, already stained (Wright). Red cells are biconcave discs 7.8 µm across: about
   2.4 µm thick at the rim and 0.8 µm in the middle (the Evans–Fung shape), so at 100× with oil the pale middle
   turns darker or lighter as the fine knob moves a fraction of a micrometre. White cells (a neutrophil with a
   lobed nucleus, a lymphocyte) and small purple platelets lie among them.                                       */
(function () {
  var T = 40, BIG = 280;
  var mats = {
    rbc: M({ ph: 0.85, pig: 0.95, fl: [0.0, 0.0, 0.03] }),
    wcyt: M({ ph: 0.35, pig: 0.22, st: { wright: 0.14 }, fl: [0.0, 0.02, 0.0] }),
    gran: M({ ph: 0.5, pig: 0.3, st: { wright: 0.3 }, fl: [0.0, 0.03, 0.0] }),
    wnuc: M({ ph: 0.6, pig: 0.05, st: { wright: 1.0 }, fl: [0.95, 0.0, 0.0] }),
    plt: M({ ph: 0.6, pig: 0.1, st: { wright: 0.85 }, fl: [0.1, 0.0, 0.0] })
  };
  /* half thickness of a red cell at a fraction ρ of its radius */
  function zh(p) { p = Math.min(p, 0.999); return 0.5 * Math.sqrt(1 - p * p) * (0.81 + 7.83 * p * p - 4.39 * p * p * p * p); }
  var types = {
    rbc: {
      half: [5.0, 5.0], tex: 0.07, slab: 0.6, zoff: zoffs(1.25, 0.5), variants: 2,
      bake: function (g, sl, vr, ink) {
        var R = vr ? 3.7 : 3.95, n = 26, gr = g.createRadialGradient(0, 0, 0, 0, 0, R * 1.02), dz = sl.z1 - sl.z0;
        for (var i = 0; i <= n; i++) { var p = i / n, h = zh(p); gr.addColorStop(Math.min(1, p * R / (R * 1.02)), ink.rgb(mats.rbc, ovl(-h, h, sl.z0, sl.z1) / dz)); }
        g.fillStyle = gr; if (vr) { g.save(); g.scale(1.06, 0.94); } g.beginPath(); g.arc(0, 0, R * 1.02, 0, TAU); g.fill(); if (vr) g.restore();
      }
    },
    wbc: {
      half: [8.5, 8.5], tex: 0.08, slab: 1.0, zoff: zoffs(3.0, 1.0), variants: 2,
      bake: function (g, sl, vr, ink) {
        var r = mulberry(31 + vr);
        if (vr === 0) {   /* neutrophil: pale granular cytoplasm, a nucleus in three to four lobes joined by threads */
          blobSlice(g, ink, mats.wcyt, 1.0, 0, 0, 0, 6.2, 6.0, 2.6, 0, sl);
          for (var k = 0; k < 60; k++) { var a = r() * TAU, d = Math.sqrt(r()) * 5.6; blobSlice(g, ink, mats.gran, 0.8, Math.cos(a) * d, Math.sin(a) * d, (r() - 0.5) * 3, 0.28, 0.28, 0.28, 0, sl); }
          var L = [[-2.6, -1.4], [-0.4, -2.6], [2.2, -1.0], [1.2, 2.0]];
          L.forEach(function (q, i) { blobSlice(g, ink, mats.wnuc, 1.0, q[0], q[1], 0.2, 1.75, 1.45, 1.4, i, sl); });
          if (sl.z0 < 0.6 && sl.z1 > -0.2) { g.strokeStyle = ink.rgb(mats.wnuc, 0.8); g.lineWidth = 0.45; g.beginPath(); g.moveTo(L[0][0], L[0][1]); for (k = 1; k < L.length; k++) g.lineTo(L[k][0], L[k][1]); g.stroke(); }
        } else {          /* lymphocyte: a big round nucleus with a thin sky-blue rim of cytoplasm */
          blobSlice(g, ink, mats.wcyt, 1.0, 0, 0, 0, 4.6, 4.5, 2.4, 0, sl);
          blobSlice(g, ink, mats.wnuc, 1.0, 0.35, 0.1, 0.1, 3.7, 3.55, 2.0, 0, sl);
        }
      }
    },
    plt: {
      half: [1.6, 1.6], tex: 0.05, slab: 0.6, zoff: [-0.3, 0.3],
      bake: function (g, sl, vr, ink) { var r = mulberry(77); blobSlice(g, ink, mats.plt, 0.5, 0, 0, 0, 1.1, 0.9, 0.5, 0, sl); for (var k = 0; k < 6; k++) blobSlice(g, ink, mats.plt, 0.9, (r() - 0.5) * 1.2, (r() - 0.5) * 1.0, 0, 0.25, 0.25, 0.3, 0, sl); }
    }
  };
  function big(I, J) { var r = tileRng(I, J, 0xb100d), a = []; var n = 1 + (r() * 2 | 0); for (var k = 0; k < n; k++) a.push([I * BIG + 20 + r() * (BIG - 40), J * BIG + 20 + r() * (BIG - 40), r() < 0.62 ? 0 : 1, r() * TAU]); return a; }
  var memo = new Map();
  function tile(i, j) {
    var key = i * 7919 + j, have = memo.get(key); if (have) return have;
    if (memo.size > 9000) memo.clear();
    var r = tileRng(i, j, 0xb10d), rb = [], pl = [];
    var W = big(Math.floor(i * T / BIG), Math.floor(j * T / BIG));
    for (var a = 0; a < 5; a++) for (var b = 0; b < 5; b++) {
      if (r() < 0.2) continue;
      var x = i * T + (a + 0.5) * 8 + (r() - 0.5) * 3.6, y = j * T + (b + 0.5) * 8 + (r() - 0.5) * 3.6;
      if (W.some(function (w) { var dx = x - w[0], dy = y - w[1]; return dx * dx + dy * dy < (w[2] ? 64 : 100); })) continue;
      rb.push([x, y, -0.05 + (r() - 0.5) * 0.35, r() * TAU, 0.95 + r() * 0.1, r() < 0.15 ? 1 : 0]);
    }
    for (a = 0; a < 2; a++) if (r() < 0.6) pl.push([i * T + r() * T, j * T + r() * T, 0.4, r() * TAU]);
    var o = { rb: rb, pl: pl }; memo.set(key, o); return o;
  }
  MODELS.blood = {
    z: [-2.6, 2.6], K: function () { return 2; }, mats: mats, types: types, fixedStain: "wright", birSc: 0.5,
    colors: function () { return { G: PIG.eosin, B: STAINCOL.wright }; },
    layer: function (g, sl, v, ink) {
      if (v.k >= 0.5) return;
      if (sl.z1 < 0) return;
      film(g, v, 280, "blood", function (t) {
        for (var i = 0; i < 7; i++) for (var j = 0; j < 7; j++) {
          var o = tile(i, j);
          o.rb.forEach(function (c) { t.fillStyle = ink.rgb(mats.rbc, 0.9); t.beginPath(); t.arc(c[0], c[1], 3.9, 0, TAU); t.fill(); });
        }
        big(0, 0).forEach(function (w) { t.fillStyle = ink.rgb(mats.wnuc, 1); t.beginPath(); t.arc(w[0], w[1], 4.2, 0, TAU); t.fill(); });
      });
    },
    items: function (v) {
      if (v.k < 0.5) return {};
      var R = new Inst(), Wb = new Inst(), P = new Inst();
      eachTile(v, T, 6, function (i, j) {
        var o = tile(i, j);
        o.rb.forEach(function (c) { if (inView(v, c[0], c[1], 6)) R.add(c[0], c[1], c[2], c[3], c[4], c[5], 1, 1); });
        o.pl.forEach(function (c) { if (inView(v, c[0], c[1], 3)) P.add(c[0], c[1], c[2], c[3], 1, 0, 1, 1); });
      });
      eachTile(v, BIG, 10, function (I, J) { big(I, J).forEach(function (w) { if (inView(v, w[0], w[1], 10)) Wb.add(w[0], w[1], 0, w[3], 1, w[2], 1, 1); }); });
      return { rbc: R.out(), wbc: Wb.out(), plt: P.out() };
    },
    marks: [{ z: 1.0, en: "the top of the red cells", es: "la parte de arriba de los glóbulos rojos" }, { z: 0, en: "the middle of the film", es: "el medio de la película" }, { z: -1.0, en: "the bottom of the red cells", es: "la parte de abajo de los glóbulos rojos" }],
    markTol: 0.35,
    side: function (ctx, map, w) {
      ctx.fillStyle = "rgba(226,140,120,.75)";
      for (var k = 0; k < 9; k++) { var x = w * (0.06 + k * 0.11); for (var s = -1; s <= 1; s += 2) { ctx.beginPath(); ctx.ellipse(x + s * w * 0.025, map(0), w * 0.022, Math.abs(map(1.2) - map(0)), 0, 0, TAU); ctx.fill(); } }
    }
  };
})();

/* ══ POLLEN ═══════════════════════════════════════════════════════════════════════════════════
   Grains from five plants, each built as a real ball or body: sunflower (a 30 µm ball with spines), lily (a long
   grain with a net on its surface), pine (a body with two air sacs), grass (a smooth ball with one pore) and mallow
   (a big ball with long sparse spines). Focus on the top and the spines show as dots and the net as a pattern; focus
   on the middle and the grain becomes a ring with spines standing out round its edge.                          */
(function () {
  var T = 170;
  var mats = {
    exine: M({ ph: 0.85, pig: 0.32, st: { iodine: 0.2, methylene: 0.3, safranin: 0.95 }, bir: 0.06, fl: [0.05, 0.95, 0.35] }),
    spine: M({ ph: 0.95, pig: 0.4, st: { iodine: 0.2, methylene: 0.3, safranin: 1.0 }, bir: 0.04, fl: [0.05, 1.0, 0.35] }),
    cyto: M({ ph: 0.3, pig: 0.1, st: { iodine: 0.65, methylene: 0.4, safranin: 0.3 }, fl: [0.12, 0.12, 0.05] }),
    sac: M({ ph: 0.55, pig: 0.2, st: { iodine: 0.1, methylene: 0.2, safranin: 0.6 }, fl: [0.03, 0.55, 0.2] })
  };
  var SPH = fib(150), SPH2 = fib(46), NET = fib(420);
  function spiky(g, ink, sl, R, len, pts, w) {
    blobSlice(g, ink, mats.cyto, 0.8, 0, 0, 0, R * 0.9, R * 0.9, R * 0.9, 0, sl);
    shell(g, ink, mats.exine, 1.0, 0, 0, 0, R, 1.3, sl.z0, sl.z1);
    var col = ink.rgb(mats.spine, 1.0);
    for (var k = 0; k < pts.length; k++) {
      var p = pts[k], a = [p[0] * R, p[1] * R, p[2] * R], b = [p[0] * (R + len), p[1] * (R + len), p[2] * (R + len)];
      g.beginPath(); if (seg3(g, a[0], a[1], a[2], b[0], b[1], b[2], sl.z0, sl.z1)) { g.strokeStyle = col; g.lineWidth = w; g.stroke(); }
      if (b[2] >= sl.z0 && b[2] < sl.z1 && Math.abs(p[2]) > 0.55) { g.fillStyle = col; g.beginPath(); g.arc(b[0], b[1], w * 0.75, 0, TAU); g.fill(); }
    }
  }
  var types = {
    sun: { half: [24, 24], tex: 0.12, slab: 2.5, zoff: zoffs(20, 2.5), bake: function (g, sl, vr, ink) { spiky(g, ink, sl, 14, 4.2, SPH, 1.5); } },
    mallow: { half: [62, 62], tex: 0.26, slab: 6, zoff: zoffs(54, 6), bake: function (g, sl, vr, ink) { spiky(g, ink, sl, 42, 11, SPH2, 3.2); } },
    grass: {
      half: [22, 22], tex: 0.12, slab: 3, zoff: zoffs(18, 3),
      bake: function (g, sl, vr, ink) {
        blobSlice(g, ink, mats.cyto, 0.85, 0, 0, 0, 16, 16, 16, 0, sl);
        shell(g, ink, mats.exine, 0.8, 0, 0, 0, 17, 0.9, sl.z0, sl.z1);
        /* the single pore, on the near side, with its thick rim */
        if (sl.z1 > 12) { g.strokeStyle = ink.rgb(mats.spine, 0.9); g.lineWidth = 1.2; g.beginPath(); g.arc(5, -4, 2.6, 0, TAU); g.stroke(); }
      }
    },
    lily: {
      half: [40, 26], tex: 0.16, slab: 3, zoff: zoffs(15, 3),
      bake: function (g, sl, vr, ink) {
        var rx = 34, ry = 20, rz = 13;
        blobSlice(g, ink, mats.cyto, 0.8, 0, 0, 0, rx * 0.92, ry * 0.92, rz * 0.92, 0, sl);
        ellipsoid(g, ink, mats.exine, 0.5, 0, 0, 0, rx, ry, rz, 0, sl.z0, sl.z1);
        /* the net (muri) on the surface: short ridges between neighbouring points */
        var col = ink.rgb(mats.spine, 0.85); g.strokeStyle = col; g.lineWidth = 0.9; g.beginPath(); var any = false;
        for (var k = 0; k < NET.length; k++) { var p = NET[k], q = NET[(k + 21) % NET.length], u = NET[(k + 34) % NET.length];
          [q, u].forEach(function (o) { var d = (p[0] - o[0]) * (p[0] - o[0]) + (p[1] - o[1]) * (p[1] - o[1]) + (p[2] - o[2]) * (p[2] - o[2]); if (d > 0.05) return;
            any = seg3(g, p[0] * rx, p[1] * ry, p[2] * rz, o[0] * rx, o[1] * ry, o[2] * rz, sl.z0, sl.z1) || any; }); }
        if (any) g.stroke();
        /* the furrow along its length */
        if (sl.z1 > rz * 0.7) { g.strokeStyle = ink.rgb(mats.exine, 0.5); g.lineWidth = 2.4; g.beginPath(); g.moveTo(-rx * 0.8, 0); g.quadraticCurveTo(0, 2, rx * 0.8, 0); g.stroke(); }
      }
    },
    pine: {
      half: [52, 34], tex: 0.18, slab: 3.5, zoff: zoffs(17, 3.5),
      bake: function (g, sl, vr, ink) {
        blobSlice(g, ink, mats.cyto, 0.9, 0, 0, 2, 25, 20, 13, 0, sl);
        ellipsoid(g, ink, mats.exine, 0.55, 0, 0, 2, 26, 21, 14, 0, sl.z0, sl.z1);
        [-1, 1].forEach(function (s) {
          shell(g, ink, mats.sac, 0.9, s * 24, 2, -3, 15, 1.0, sl.z0, sl.z1);
          var r = mulberry(s > 0 ? 3 : 4); g.fillStyle = ink.rgb(mats.sac, 0.5);
          for (var k = 0; k < 90; k++) { var p = SPH[(k * 7 + (s > 0 ? 0 : 3)) % SPH.length]; var z = -3 + p[2] * 14; if (z < sl.z0 || z >= sl.z1) continue; g.beginPath(); g.arc(s * 24 + p[0] * 14, 2 + p[1] * 14, 0.9 + r() * 0.6, 0, TAU); g.fill(); }
        });
      }
    }
  };
  var KINDS = [["sun", 17, 0.45], ["lily", 13, 0.2], ["pine", 17, 0.15], ["grass", 17, 0.12], ["mallow", 53, 0.08]];
  var memo = new Map();
  function tile(i, j) {
    var key = i * 7919 + j, have = memo.get(key); if (have) return have;
    if (memo.size > 6000) memo.clear();
    var r = tileRng(i, j, 0x9011e), out = [], n = r() < 0.55 ? 0 : 1 + (r() < 0.15 ? 1 : 0);
    for (var k = 0; k < n; k++) {
      var u = r(), K = KINDS[0]; for (var q = 0, acc = 0; q < KINDS.length; q++) { acc += KINDS[q][2]; if (u < acc) { K = KINDS[q]; break; } }
      var sc = 0.9 + r() * 0.2, h = K[1] * sc;
      out.push([K[0], i * T + 30 + r() * (T - 60), j * T + 30 + r() * (T - 60), -58 + h + r() * Math.max(0, 116 - 2 * h), r() * TAU, sc]);
    }
    memo.set(key, out); return out;
  }
  MODELS.pollen = {
    z: [-60, 60], mats: mats, types: types, birSc: 0.5,
    colors: function (stain) { return { G: PIG.amber, B: STAINCOL[stain] || STAINCOL.none }; },
    items: function (v) {
      var B = {}; KINDS.forEach(function (K) { B[K[0]] = new Inst(); });
      eachTile(v, T, 70, function (i, j) { tile(i, j).forEach(function (c) { if (inView(v, c[1], c[2], 70)) B[c[0]].add(c[1], c[2], c[3], c[4], c[5], 0, 1, 1); }); });
      var out = {}; Object.keys(B).forEach(function (k) { out[k] = B[k].out(); }); return out;
    },
    marks: [{ z: 30, en: "the tops of the grains", es: "la parte de arriba de los granos" }, { z: 0, en: "the middle of a grain", es: "el medio de un grano" }, { z: -30, en: "the undersides", es: "la parte de abajo" }],
    markTol: 10,
    side: function (ctx, map, w) {
      ctx.strokeStyle = "rgba(232,196,96,.85)"; ctx.lineWidth = 1.5;
      [[0.18, -20, 17], [0.45, 10, 17], [0.75, -6, 40]].forEach(function (p) { var r = Math.abs(map(p[2]) - map(0)); ctx.beginPath(); ctx.arc(w * p[0], map(p[1]), r, 0, TAU); ctx.stroke(); });
    }
  };
})();

/* ══ ELODEA LEAF ══════════════════════════════════════════════════════════════════════════════
   A leaf two cells thick. The upper layer has larger brick-shaped cells (about 60 × 24 µm, 18 µm deep), the lower
   layer smaller ones (about 44 × 18 µm). Chloroplasts (discs about 5 µm across) line the side walls and sit on the
   faces. Focus on the upper cells, then turn down through them to the lower layer. After Play, the chloroplasts
   stream round the edge of each cell (cyclosis, a few micrometres a second), the sign that the cell is alive.     */
(function () {
  var LAY = [{ z0: 2.5, z1: 20.5, w: 84, h: 28, sx: 0.37, seed: 1 }, { z0: -17, z1: -1, w: 60, h: 22, sx: 0.61, seed: 2 }];
  var mats = {
    wall: M({ ph: 0.85, st: { iodine: 0.06, methylene: 0.18, safranin: 0.3 }, bir: 0.6, fl: [0.0, 0.05, 0.0] }),
    face: M({ ph: 0.15, st: { iodine: 0.02, methylene: 0.05, safranin: 0.08 } }),
    chl: M({ ph: 0.8, pig: 1.0, st: { iodine: 0.6, methylene: 0.2, safranin: 0.1 }, fl: [0.0, 0.02, 1.0] }),
    nuc: M({ ph: 0.35, st: { iodine: 0.4, methylene: 0.8, safranin: 0.6 }, fl: [0.85, 0.0, 0.0] })
  };
  function cellBox(L, j, i) {
    var x0 = (i + L.sx * j) * L.w + (h2(j, i, L.seed) - 0.5) * 10, x1 = (i + 1 + L.sx * j) * L.w + (h2(j, i + 1, L.seed) - 0.5) * 10;
    return { x0: x0, x1: x1, y0: j * L.h, y1: (j + 1) * L.h };
  }
  function eachCell(L, v, pad, fn) {
    var j0 = Math.floor((v.y0 - pad) / L.h), j1 = Math.floor((v.y1 + pad) / L.h);
    for (var j = j0; j <= j1; j++) { var i0 = Math.floor((v.x0 - pad) / L.w - L.sx * j) - 1, i1 = Math.floor((v.x1 + pad) / L.w - L.sx * j) + 1; for (var i = i0; i <= i1; i++) fn(j, i, cellBox(L, j, i)); }
  }
  function rr(g, b, ins) { var x0 = b.x0 + ins, y0 = b.y0 + ins, x1 = b.x1 - ins, y1 = b.y1 - ins, r = Math.min(4, (y1 - y0) / 2); g.beginPath(); g.moveTo(x0 + r, y0); g.lineTo(x1 - r, y0); g.quadraticCurveTo(x1, y0, x1, y0 + r); g.lineTo(x1, y1 - r); g.quadraticCurveTo(x1, y1, x1 - r, y1); g.lineTo(x0 + r, y1); g.quadraticCurveTo(x0, y1, x0, y1 - r); g.lineTo(x0, y0 + r); g.quadraticCurveTo(x0, y0, x0 + r, y0); g.closePath(); }
  /* a point a fraction s round the inside edge of a cell (the stream's path) */
  function around(b, ins, s) {
    var w = b.x1 - b.x0 - 2 * ins, h = b.y1 - b.y0 - 2 * ins, P = 2 * (w + h), d = ((s % 1) + 1) % 1 * P;
    if (d < w) return [b.x0 + ins + d, b.y0 + ins, 0];
    d -= w; if (d < h) return [b.x1 - ins, b.y0 + ins + d, Math.PI / 2];
    d -= h; if (d < w) return [b.x1 - ins - d, b.y1 - ins, Math.PI];
    d -= w; return [b.x0 + ins, b.y1 - ins - d, -Math.PI / 2];
  }
  var types = {
    chl: {
      half: [3.6, 3.6], tex: 0.05, slab: 1.0, zoff: [-1, 0, 1],
      bake: function (g, sl, vr, ink) {
        blobSlice(g, ink, mats.chl, 0.85, 0, 0, 0, 2.6, 2.2, 1.3, 0, sl);
        var r = mulberry(9); for (var k = 0; k < 9; k++) { var a = r() * TAU, d = Math.sqrt(r()) * 1.7; blobSlice(g, ink, mats.chl, 0.6, Math.cos(a) * d, Math.sin(a) * d * 0.85, (r() - 0.5) * 1.2, 0.35, 0.35, 0.3, 0, sl); }
      }
    }
  };
  var memo = new Map();
  function plastids(L, j, i, b) {
    var key = L.seed * 1e7 + j * 7919 + i, have = memo.get(key); if (have) return have;
    if (memo.size > 20000) memo.clear();
    var r = mulberry(key | 0), n = Math.round((b.x1 - b.x0) * (b.y1 - b.y0) / 45), a = [];
    var dir = r() < 0.5 ? 1 : -1, hmax = (b.y1 - b.y0) / 2 - 3;
    /* every chloroplast rides a loop round the cell: along the side walls at any depth, or in a belt on the top
       or bottom face; one direction per cell, a few micrometres a second (cyclosis) */
    for (var k = 0; k < n; k++) {
      var u = r(), side = u < 0.35, ins = side ? 2.4 + r() * 1.2 : 4 + r() * Math.max(0.5, hmax - 4);
      var P = 2 * (b.x1 - b.x0 + b.y1 - b.y0 - 4 * ins);
      a.push({ s: r(), ins: ins, z: side ? lerp(L.z0 + 2, L.z1 - 2, r()) : u < 0.8 ? L.z1 - 2.1 : L.z0 + 2.1, sp: dir * (3 + r() * 3.5) / P, side: side ? 1 : 0 });
    }
    memo.set(key, a); return a;
  }
  MODELS.elodea = {
    z: [-17, 20.5], lives: true, K: function (o) { return o >= 40 ? 10 : o === 10 ? 5 : 3; }, mats: mats, types: types, birSc: 0.4,
    colors: function (stain) { return { G: PIG.chloro, B: STAINCOL[stain] || STAINCOL.none }; },
    layer: function (g, sl, v, ink) {
      var z0 = sl.z0, z1 = sl.z1, dz = z1 - z0, low = v.k < 0.6, lw = Math.max(1.2, 1.2 / v.k);
      LAY.forEach(function (L) {
        var oSide = ovl(L.z0, L.z1, z0, z1) / dz, oT = ovl(L.z1 - 1, L.z1 + 0.5, z0, z1) / dz, oB = ovl(L.z0 - 0.5, L.z0 + 1, z0, z1) / dz;
        if (oSide <= 0 && oT + oB <= 0) return;
        eachCell(L, v, 10, function (j, i, b) {
          if (oT + oB > 0) { g.fillStyle = ink.rgb(mats.face, (oT + oB) * 0.8); g.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); }
          if (oSide > 0) {
            g.strokeStyle = ink.rgb(mats.wall, oSide * 0.7 * Math.min(1, 1.6 / lw)); g.lineWidth = lw; rr(g, b, 0); g.stroke();
            if (low) {   /* far away the chloroplasts are a green lining and a speckled face */
              g.strokeStyle = ink.rgb(mats.chl, oSide * 0.75); g.lineWidth = Math.max(3.5, 1.2 / v.k); rr(g, b, 3.2); g.stroke();
              g.fillStyle = ink.rgb(mats.chl, oSide * 0.18); rr(g, b, 5); g.fill();
            }
          }
          if (oSide > 0 && !low && h2(j, i, L.seed + 40) < 0.5) {
            var nx = lerp(b.x0 + 8, b.x1 - 8, h2(j, i, L.seed + 41)); ellipsoid(g, ink, mats.nuc, 0.9, nx, b.y0 + 5, (L.z0 + L.z1) / 2, 4, 3, 3, 0, z0, z1);
          }
        });
      });
    },
    items: function (v, Lab, t) {
      if (v.k < 0.6) return {};
      var I = new Inst();
      LAY.forEach(function (L) {
        eachCell(L, v, 6, function (j, i, b) {
          if (b.x1 < v.x0 - 6 || b.x0 > v.x1 + 6) return;
          plastids(L, j, i, b).forEach(function (p) {
            var q = around(b, p.ins, p.s + p.sp * t);
            I.add(q[0], q[1], p.z, q[2], 1, 0, 1, p.side ? 0.62 : 1);
          });
        });
      });
      return { chl: I.out() };
    },
    marks: [{ z: 18.3, en: "top of the upper cells", es: "arriba de las células de arriba" }, { z: 11.5, en: "the upper cells", es: "las células de arriba" }, { z: 0.7, en: "where the two layers meet", es: "donde se juntan las dos capas" }, { z: -9, en: "the lower cells", es: "las células de abajo" }],
    markTol: 3,
    side: function (ctx, map, w) {
      ctx.strokeStyle = "rgba(170,210,140,.75)"; ctx.lineWidth = 1.4;
      LAY.forEach(function (L, n) { var y0 = map(L.z1), y1 = map(L.z0); ctx.strokeRect(2, y0, w - 4, y1 - y0); for (var x = n ? 18 : 6; x < w; x += n ? 34 : 46) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); } });
      ctx.fillStyle = "rgba(90,170,70,.8)"; var r = mulberry(3);
      LAY.forEach(function (L) { for (var k = 0; k < 30; k++) { ctx.beginPath(); ctx.arc(w * r(), map(lerp(L.z0 + 1, L.z1 - 1, r())), 2, 0, TAU); ctx.fill(); } });
    }
  };
})();

/* ══ POND WATER ═══════════════════════════════════════════════════════════════════════════════
   A drop about 300 µm deep. Living things sit at different depths: paramecia (slipper-shaped, 110 µm, covered in
   cilia), euglenas (green spindles with a red eyespot), diatoms (golden glass boats), a Volvox colony (a hollow ball of
   cells, 220 µm, with daughter colonies inside), a Spirogyra filament (a tube with a spiral green ribbon, so its top and
   bottom spirals slant opposite ways), and silt. After Play the swimmers swim in curves at their own speeds, the silt
   jitters (Brownian motion), and it all stops by itself. Paused, it is a still photograph.                       */
(function () {
  var T = 900;
  var mats = {
    pel: M({ ph: 0.45, st: { iodine: 0.3, methylene: 0.3, safranin: 0.2 }, fl: [0.0, 0.03, 0.0] }),
    cil: M({ ph: 0.7, st: { iodine: 0.2, methylene: 0.3 }, fl: [0.0, 0.02, 0.0] }),
    endo: M({ ph: 0.5, pig: 0.08, st: { iodine: 0.5, methylene: 0.4, safranin: 0.3 }, fl: [0.0, 0.03, 0.0] }),
    vac: M({ ph: 0.9, pig: 0.3, st: { iodine: 0.6, methylene: 0.5 }, fl: [0.0, 0.05, 0.02] }),
    cv: M({ ph: 0.08 }),
    mac: M({ ph: 0.55, st: { iodine: 0.6, methylene: 0.9, safranin: 0.7 }, fl: [0.9, 0.0, 0.0] }),
    chl: M({ ph: 0.7, pig: 1.0, st: { iodine: 0.5 }, fl: [0.0, 0.02, 1.0] }),
    eye: M({ ph: 0.6, pig: 1.0, st: { iodine: 0.3 }, fl: [0.0, 0.0, 0.2] }),
    diat: M({ ph: 0.95, pig: 0.0, bir: 0.15, fl: [0.0, 0.05, 0.0] }),
    gold: M({ ph: 0.6, pig: 0.9, fl: [0.0, 0.02, 0.85] }),
    tube: M({ ph: 0.55, st: { iodine: 0.1, methylene: 0.2, safranin: 0.3 }, bir: 0.35, fl: [0.0, 0.04, 0.0] }),
    silt: M({ ph: 0.9, pig: 0.0, bir: 0.6, st: { iodine: 0.1, methylene: 0.1 }, fl: [0.0, 0.05, 0.02] })
  };
  var types = {
    para: {
      half: [64, 26], tex: 0.22, slab: 5, zoff: zoffs(15, 5), axis: 0,
      bake: function (g, sl, vr, ink) {
        var r = mulberry(21), rx = 55, ry = 18, rz = 15;
        /* the slipper: a long ellipsoid pinched by the oral groove */
        ellipsoid(g, ink, mats.endo, 0.7, 0, 0, 0, rx, ry, rz, 0, sl.z0, sl.z1);
        var zc = clamp(0, sl.z0, sl.z1), q = Math.sqrt(Math.max(0, 1 - zc * zc / (rz * rz)));
        if (ovl(-rz, rz, sl.z0, sl.z1) > 0) {
          g.save(); g.scale(rx * q, ry * q); g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.restore();
          g.strokeStyle = ink.rgb(mats.pel, 0.9); g.lineWidth = 1.3; g.stroke();
          /* cilia round the edge, short and fine */
          g.strokeStyle = ink.rgb(mats.cil, 0.5); g.lineWidth = 0.45; g.beginPath();
          for (var k = 0; k < 160; k++) { var a = k / 160 * TAU, cx = Math.cos(a) * rx * q, cy = Math.sin(a) * ry * q, nx = Math.cos(a) * ry, ny = Math.sin(a) * rx, nl = Math.hypot(nx, ny); g.moveTo(cx, cy); g.lineTo(cx + nx / nl * 4.5, cy + ny / nl * 4.5); }
          g.stroke();
        }
        /* oral groove on the top side */
        if (sl.z1 > 6) { g.strokeStyle = ink.rgb(mats.pel, 0.8); g.lineWidth = 3; g.beginPath(); g.moveTo(-6, -2); g.quadraticCurveTo(10, 10, 20, 2); g.stroke(); }
        ellipsoid(g, ink, mats.mac, 1.0, 4, 2, 0, 14, 8, 7, 0.2, sl.z0, sl.z1);
        ellipsoid(g, ink, mats.cv, 1.0, -36, 0, 4, 5, 5, 4, 0, sl.z0, sl.z1);
        ellipsoid(g, ink, mats.cv, 1.0, 34, -1, 4, 5, 5, 4, 0, sl.z0, sl.z1);
        for (k = 0; k < 14; k++) ellipsoid(g, ink, mats.vac, 0.9, (r() - 0.5) * 70, (r() - 0.5) * 18, (r() - 0.5) * 16, 2.4, 2.4, 2.2, 0, sl.z0, sl.z1);
      }
    },
    eugl: {
      half: [34, 9], tex: 0.12, slab: 3, zoff: zoffs(6, 3),
      bake: function (g, sl, vr, ink) {
        var r = mulberry(22);
        ellipsoid(g, ink, mats.pel, 0.8, 0, 0, 0, 25, 6, 5.5, 0, sl.z0, sl.z1);
        for (var k = 0; k < 16; k++) { var x = (r() - 0.5) * 34; ellipsoid(g, ink, mats.chl, 0.9, x, (r() - 0.5) * 6 * Math.sqrt(1 - x * x / 625), (r() - 0.5) * 6, 2.6, 1.5, 1.3, r() * TAU, sl.z0, sl.z1); }
        ellipsoid(g, ink, mats.eye, 1.0, 19, 1.5, 1, 1.4, 1.2, 1.2, 0, sl.z0, sl.z1);
        if (sl.z0 < 1 && sl.z1 > -1) { g.strokeStyle = ink.rgb(mats.cil, 0.7); g.lineWidth = 0.5; g.beginPath(); g.moveTo(24, 0); g.bezierCurveTo(29, 4, 31, -4, 34, 1); g.stroke(); }
      }
    },
    diat: {
      half: [36, 10], tex: 0.1, slab: 3, zoff: zoffs(6, 3),
      bake: function (g, sl, vr, ink) {
        if (ovl(-5, 5, sl.z0, sl.z1) <= 0) return;
        g.save(); g.scale(30, 7); g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.restore();
        g.fillStyle = ink.rgb(mats.diat, 0.25); g.fill(); g.strokeStyle = ink.rgb(mats.diat, 0.9); g.lineWidth = 0.9; g.stroke();
        g.strokeStyle = ink.rgb(mats.diat, 0.6); g.lineWidth = 0.35; g.beginPath();
        for (var x = -27; x <= 27; x += 1.1) { var h = 6.6 * Math.sqrt(1 - x * x / 900); g.moveTo(x, -h); g.lineTo(x, -0.8); g.moveTo(x, 0.8); g.lineTo(x, h); } g.stroke();
        ellipsoid(g, ink, mats.gold, 0.8, -10, 0, 0, 13, 4, 3.5, 0, sl.z0, sl.z1); ellipsoid(g, ink, mats.gold, 0.8, 10, 0, 0, 13, 4, 3.5, 0, sl.z0, sl.z1);
      }
    },
    volv: {
      half: [130, 130], tex: 0.45, slab: 14, zoff: zoffs(112, 14),
      bake: function (g, sl, vr, ink) {
        var R = 110; shell(g, ink, mats.pel, 0.35, 0, 0, 0, R, 1.2, sl.z0, sl.z1);
        var P = fib(700); g.fillStyle = ink.rgb(mats.chl, 0.9);
        for (var k = 0; k < P.length; k++) { var z = P[k][2] * R; if (z < sl.z0 || z >= sl.z1) continue; g.beginPath(); g.arc(P[k][0] * R, P[k][1] * R, 2.2, 0, TAU); g.fill(); }
        [[30, -20, 15, 30], [-35, 25, -20, 26], [5, 40, 40, 22]].forEach(function (d) {
          shell(g, ink, mats.chl, 0.7, d[0], d[1], d[2], d[3], 3.2, sl.z0, sl.z1);
          ellipsoid(g, ink, mats.chl, 0.25, d[0], d[1], d[2], d[3], d[3], d[3], 0, sl.z0, sl.z1);
        });
      }
    },
    silt: {
      half: [4, 4], tex: 0.06, slab: 2, zoff: [-1, 1], variants: 3,
      bake: function (g, sl, vr, ink) { var r = mulberry(40 + vr); var P = rpoly(0, 0, 1.6 + vr * 0.7, 6, 0.6, r); g.fillStyle = ink.rgb(mats.silt, 0.9); poly(g, P); g.fill(); }
    }
  };
  /* the filament runs through the slabs; its spiral ribbon rises and falls through the depth */
  function spiro(i, j) {
    var r = tileRng(i, j, 0x5917), on = r() < 0.55;
    return on ? { x: i * T + r() * T, y: j * T + r() * T, a: (r() - 0.5) * 1.2, z: -70 + r() * 30, R: 17, pitch: 34 + r() * 10, len: 1400 } : null;
  }
  var memo = new Map();
  function tile(i, j) {
    var key = i * 7919 + j, have = memo.get(key); if (have) return have;
    if (memo.size > 4000) memo.clear();
    var r = tileRng(i, j, 0x90d), a = [];
    function put(type, n, zr, sp, sc0) { for (var k = 0; k < n; k++) a.push({ type: type, x: i * T + r() * T, y: j * T + r() * T, z: -zr + r() * 2 * zr, rot: r() * TAU, sc: sc0 + r() * 0.2,
      A: sp * (0.6 + r() * 0.8), w1: 0.05 + r() * 0.06, w2: 0.03 + r() * 0.05, ph: r() * TAU, ph2: r() * TAU, zA: zr * 0.12 * r(), vr: (r() * 3) | 0 }); }
    put("para", 1 + (r() * 2 | 0), 110, 260, 0.9);
    put("eugl", 2 + (r() * 3 | 0), 120, 90, 0.9);
    put("diat", 3 + (r() * 4 | 0), 120, 6, 0.85);
    if (r() < 0.5) put("volv", 1, 20, 120, 0.85);
    put("silt", 50, 140, 0, 0.8);
    memo.set(key, a); return a;
  }
  /* where a swimmer is at time t: a loop round its home (Lissajous), heading along its path */
  function at(o, t) {
    if (!o.A) return [o.x, o.y, o.z, o.rot];
    var ax = o.A / (o.w1 * 6), ay = o.A / (o.w2 * 6);
    var x = o.x + ax * Math.sin(o.w1 * t + o.ph), y = o.y + ay * Math.sin(o.w2 * t + o.ph2);
    var dx = ax * o.w1 * Math.cos(o.w1 * t + o.ph), dy = ay * o.w2 * Math.cos(o.w2 * t + o.ph2);
    var z = o.z + o.zA * Math.sin(0.07 * t + o.ph);
    var rot = (Math.abs(dx) + Math.abs(dy) > 1e-6) ? Math.atan2(dy, dx) : o.rot;
    if (o.type === "eugl") rot += 0.12 * Math.sin(t * 2.1 + o.ph);
    return [x, y, z, rot];
  }
  MODELS.pond = {
    z: [-150, 150], lives: true, K: function (o) { return o >= 40 ? 6 : 4; }, mats: mats, types: types, birSc: 0.5,
    colors: function (stain) { return { G: PIG.chloro, B: STAINCOL[stain] || STAINCOL.none }; },
    layer: function (g, sl, v, ink) {
      var z0 = sl.z0, z1 = sl.z1;
      eachTile(v, T, 1500, function (i, j) {
        var S = spiro(i, j); if (!S) return;
        var c = Math.cos(S.a), s = Math.sin(S.a), half = S.len / 2;
        if (!inView(v, S.x, S.y, half + 40)) return;
        var oT = ovl(S.z - S.R, S.z + S.R, z0, z1) / (z1 - z0);
        if (oT > 0) {
          /* the tube's two walls, seen from above */
          g.strokeStyle = ink.rgb(mats.tube, oT * 0.9); g.lineWidth = Math.max(2, 1.2 / v.k);
          [-1, 1].forEach(function (e) { g.beginPath(); g.moveTo(S.x - c * half - s * e * S.R, S.y - s * half + c * e * S.R); g.lineTo(S.x + c * half - s * e * S.R, S.y + s * half + c * e * S.R); g.stroke(); });
          /* cross walls between cells */
          g.lineWidth = Math.max(1.2, 1 / v.k); g.beginPath();
          for (var u = -half; u <= half; u += 110) { g.moveTo(S.x + c * u - s * -S.R, S.y + s * u + c * -S.R); g.lineTo(S.x + c * u - s * S.R, S.y + s * u + c * S.R); } g.stroke();
        }
        /* the spiral ribbon: a helix, so the part on top slants one way and the part underneath the other */
        var pts = [], n = Math.round(S.len / S.pitch * 24);
        for (var k = 0; k <= n; k++) { var uu = -half + k / n * S.len, th = uu / S.pitch * TAU, rr = S.R * 0.82; pts.push([S.x + c * uu - s * Math.cos(th) * rr, S.y + s * uu + c * Math.cos(th) * rr, S.z + Math.sin(th) * rr]); }
        line3(g, pts, z0, z1, Math.max(4, 1.3 / v.k), ink.rgb(mats.chl, 0.9));
      });
    },
    items: function (v, Lab, t) {
      var B = { para: new Inst(), eugl: new Inst(), diat: new Inst(), volv: new Inst(), silt: new Inst() };
      eachTile(v, T, 700, function (i, j) {
        tile(i, j).forEach(function (o) {
          var p;
          if (o.type === "silt") { var st = Math.floor(t * 6); p = [o.x + (h2(st, o.vr, o.x | 0) - 0.5) * 1.6 * Math.min(1, t * 6), o.y + (h2(st, 7, o.y | 0) - 0.5) * 1.6 * Math.min(1, t * 6), o.z, o.rot]; }
          else p = at(o, t);
          var rad = o.type === "volv" ? 130 : o.type === "para" ? 70 : 40;
          if (!inView(v, p[0], p[1], rad)) return;
          B[o.type].add(p[0], p[1], p[2], p[3], o.sc, o.type === "silt" ? o.vr : 0, 1, 1);
        });
      });
      var out = {}; Object.keys(B).forEach(function (k) { out[k] = B[k].out(); }); return out;
    },
    marks: [{ z: 90, en: "swimmers near the top", es: "nadadores cerca de arriba" }, { z: 0, en: "the middle of the drop", es: "el medio de la gota" }, { z: -60, en: "the green filament", es: "el filamento verde" }, { z: -120, en: "near the bottom", es: "cerca del fondo" }],
    markTol: 25,
    side: function (ctx, map, w) {
      ctx.fillStyle = "rgba(150,200,120,.7)"; ctx.fillRect(0, map(-45), w, Math.abs(map(-85) - map(-45)) * 0.5);
      var r = mulberry(8); ctx.fillStyle = "rgba(230,220,190,.7)";
      for (var k = 0; k < 7; k++) { ctx.beginPath(); ctx.ellipse(w * r(), map(-110 + r() * 220), 9, 3, 0, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = "rgba(140,200,120,.8)"; ctx.beginPath(); ctx.arc(w * 0.8, map(0), Math.abs(map(55) - map(0)), 0, TAU); ctx.stroke();
    }
  };
})();

/* ══ LEAF CROSS-SECTION ═══════════════════════════════════════════════════════════════════════
   A leaf cut edge-on, a slice 12 µm thick. From top to bottom: waxy cuticle, upper epidermis, a row of tall palisade
   cells packed with chloroplasts, loose spongy cells with air spaces, the lower epidermis with stomata (two guard
   cells over an air chamber). A vein crosses now and then: xylem (thick ringed walls that glow between crossed
   polarizers and take safranin red), phloem below it, a ring of bundle-sheath cells round both. Walls cross the
   whole slice; chloroplasts lie at every depth in it.                                                          */
(function () {
  var P = 720, YT = -96, YB = 86;
  var mats = {
    cut: M({ ph: 0.5, pig: 0.25, st: { safranin: 0.4, iodine: 0.2 }, bir: 0.5, fl: [0.0, 0.25, 0.05] }),
    wall: M({ ph: 0.55, st: { iodine: 0.05, methylene: 0.2, safranin: 0.25 }, bir: 0.45, fl: [0.0, 0.06, 0.0] }),
    lig: M({ ph: 0.85, pig: 0.3, st: { iodine: 0.2, methylene: 0.6, safranin: 1.0 }, bir: 1.0, fl: [0.15, 0.5, 0.05] }),
    chl: M({ ph: 0.75, pig: 1.0, st: { iodine: 0.75, methylene: 0.2, safranin: 0.1 }, fl: [0.0, 0.02, 1.0] }),
    cyt: M({ ph: 0.18, st: { iodine: 0.15, methylene: 0.15, safranin: 0.1 } }),
    nuc: M({ ph: 0.45, st: { iodine: 0.4, methylene: 0.8, safranin: 0.7 }, fl: [0.85, 0, 0] }),
    phl: M({ ph: 0.4, st: { iodine: 0.2, methylene: 0.4, safranin: 0.25 }, bir: 0.15, fl: [0.1, 0.05, 0] })
  };
  var memo = new Map();
  function period(n) {
    var have = memo.get(n); if (have) return have; if (memo.size > 400) memo.clear();
    var r = tileRng(n, 0, 0x5ec7), x0 = n * P, C = { pal: [], spo: [], epU: [], epL: [], sto: [], vein: null, chl: [] };
    for (var x = x0; x < x0 + P;) { var w = 15 + r() * 7; C.epU.push([x, x + w]); x += w; }
    for (x = x0; x < x0 + P;) { var w2 = 13 + r() * 6; C.epL.push([x, x + w2]); x += w2; }
    for (x = x0 + 2; x < x0 + P;) { var w3 = 9 + r() * 3.5; C.pal.push([x, YT + 22, x + w3 - 2, YT + 22 + 44 + r() * 6]); x += w3; }
    for (var k = 0; k < 64; k++) C.spo.push(rpoly(x0 + r() * P, -10 + r() * 76, 9 + r() * 6, 8, 0.4, r));
    for (x = x0 + 60 + r() * 60; x < x0 + P - 30; x += 140 + r() * 110) C.sto.push(x);
    if (r() < 0.8) C.vein = { x: x0 + 140 + r() * (P - 280), y: 6, R: 46 };
    C.pal.forEach(function (c) { for (var q = 0; q < 16; q++) { var side = r() < 0.5 ? c[0] + 2.4 : c[2] - 2.4; C.chl.push([side + (r() - 0.5) * 1.2, lerp(c[1] + 3, c[3] - 3, r()), -5.5 + r() * 11]); } });
    C.spo.forEach(function (p) { for (var q = 0; q < 10; q++) { var e = p[(q * 3) % p.length], cx = 0, cy = 0; p.forEach(function (a) { cx += a[0] / p.length; cy += a[1] / p.length; }); C.chl.push([lerp(cx, e[0], 0.82), lerp(cy, e[1], 0.82), -5.5 + r() * 11]); } });
    if (C.vein) { var V = C.vein; C.spo = C.spo.filter(function (p) { var cx = p[0][0], cy = p[0][1]; return Math.hypot(cx - V.x, cy - V.y) > V.R + 10; });
      C.chl = C.chl.filter(function (c) { return Math.hypot(c[0] - V.x, c[1] - V.y) > V.R + 6; });
      V.xy = []; for (k = 0; k < 7; k++) V.xy.push([V.x + (r() - 0.5) * 50, V.y - 22 + (r() - 0.5) * 22, 6 + r() * 5]);
      V.ph = []; for (k = 0; k < 26; k++) V.ph.push([V.x + (r() - 0.5) * 56, V.y + 12 + r() * 22, 2.5 + r() * 2]); }
    memo.set(n, C); return C;
  }
  MODELS.section = {
    z: [-6, 6], K: function (o) { return o >= 40 ? 6 : o === 10 ? 3 : 2; }, mats: mats, birSc: 0.55,
    colors: function (stain) { return { G: PIG.chloro, B: STAINCOL[stain] || STAINCOL.none }; },
    layer: function (g, sl, v, ink) {
      var z0 = sl.z0, z1 = sl.z1, dz = z1 - z0, f = dz / 12, lw = Math.max(1.3, 1.1 / v.k), det = v.k > 0.5;
      var wall = ink.rgb(mats.wall, Math.min(1, f * 2.2) * Math.min(1, 1.6 / lw));
      var n0 = Math.floor(v.x0 / P), n1 = Math.floor(v.x1 / P);
      if (v.y1 < YT - 10 || v.y0 > YB + 10) return;
      for (var n = n0; n <= n1; n++) {
        var C = period(n);
        g.strokeStyle = ink.rgb(mats.cut, Math.min(1, f * 2.4)); g.lineWidth = Math.max(3, 1.4 / v.k);
        g.beginPath(); g.moveTo(n * P, YT - 2); g.lineTo(n * P + P, YT - 2); g.moveTo(n * P, YB + 2); g.lineTo(n * P + P, YB + 2); g.stroke();
        g.strokeStyle = wall; g.lineWidth = lw; g.beginPath();
        C.epU.forEach(function (e) { g.rect(e[0], YT, e[1] - e[0], 18); });
        C.epL.forEach(function (e) { g.rect(e[0], YB - 15, e[1] - e[0], 15); });
        C.pal.forEach(function (c) { g.moveTo(c[0] + 4, c[1]); g.arcTo(c[2], c[1], c[2], c[3], 4); g.arcTo(c[2], c[3], c[0], c[3], 4); g.arcTo(c[0], c[3], c[0], c[1], 4); g.arcTo(c[0], c[1], c[2], c[1], 4); g.closePath(); });
        g.stroke();
        C.spo.forEach(function (p) { smooth(g, p); g.fillStyle = ink.rgb(mats.cyt, f * 1.5); g.fill(); g.strokeStyle = wall; g.stroke(); });
        C.sto.forEach(function (x) {
          g.fillStyle = ink.rgb(mats.cyt, f * 2); g.strokeStyle = wall;
          [-1, 1].forEach(function (s) { ell(g, x + s * 5.5, YB - 8, 4.6, 6.5, 0); g.fill(); g.stroke(); g.fillStyle = ink.rgb(mats.chl, f * 1.4); ell(g, x + s * 5.5, YB - 8, 1.6, 2, 0); g.fill(); g.fillStyle = ink.rgb(mats.cyt, f * 2); });
        });
        if (C.vein) {
          var V = C.vein;
          g.strokeStyle = wall; for (var k = 0; k < 18; k++) { var a = k / 18 * TAU; ell(g, V.x + Math.cos(a) * V.R, V.y + Math.sin(a) * V.R * 0.86, 7, 6, a); g.stroke(); }
          V.xy.forEach(function (q) {
            ell(g, q[0], q[1], q[2], q[2], 0); g.strokeStyle = ink.rgb(mats.lig, Math.min(1, f * 2.6)); g.lineWidth = Math.max(1.8, 1.2 / v.k); g.stroke();
            /* the ring thickenings inside a vessel lie at their own depths */
            if (det) for (var zz = -5; zz <= 5; zz += 2.5) if (zz >= z0 && zz < z1) { g.lineWidth = 0.8; ell(g, q[0], q[1], q[2] * 0.82, q[2] * 0.82, 0); g.stroke(); }
          });
          g.strokeStyle = ink.rgb(mats.phl, Math.min(1, f * 2)); g.lineWidth = 0.8; V.ph.forEach(function (q) { ell(g, q[0], q[1], q[2], q[2], 0); g.stroke(); });
        }
        if (det) { g.fillStyle = ink.rgb(mats.chl, 1); C.chl.forEach(function (c) { if (c[2] < z0 || c[2] >= z1) return; ell(g, c[0], c[1], 2.3, 1.6, 1.2); g.fill(); }); }
        else { g.fillStyle = ink.rgb(mats.chl, f * 2.6); C.pal.forEach(function (c) { g.fillRect(c[0], c[1], c[2] - c[0], c[3] - c[1]); }); g.fillStyle = ink.rgb(mats.chl, f * 1.3); C.spo.forEach(function (p) { smooth(g, p); g.fill(); }); }
      }
    },
    marks: [{ z: 4.5, en: "the top of the slice", es: "arriba del corte" }, { z: 0, en: "the middle of the slice", es: "el medio del corte" }, { z: -4.5, en: "the bottom of the slice", es: "abajo del corte" }],
    markTol: 2,
    side: function (ctx, map, w) {
      ctx.fillStyle = "rgba(120,180,100,.35)"; ctx.fillRect(0, map(6), w, map(-6) - map(6));
      ctx.strokeStyle = "rgba(210,230,190,.7)"; ctx.lineWidth = 1.2; for (var x = 8; x < w; x += 22) { ctx.beginPath(); ctx.moveTo(x, map(6)); ctx.lineTo(x, map(-6)); ctx.stroke(); }
      var r = mulberry(4); ctx.fillStyle = "rgba(80,170,60,.9)"; for (var k = 0; k < 40; k++) { ctx.beginPath(); ctx.arc(w * r(), map(-5.5 + r() * 11), 2, 0, TAU); ctx.fill(); }
    }
  };
})();

/* ══ SALT AND SUGAR ═══════════════════════════════════════════════════════════════════════════
   Dried crystals lying on the glass. Salt grows as cubes (some hollow-stepped "hoppers"), 20–45 µm; it is cubic, so
   between crossed polarizers it stays dark whichever way it turns. Sugar grows as slanted, flattened prisms; it is
   strongly birefringent, so between crossed polarizers it lights up in interference colours set by its thickness
   (retardation = Δn × thickness, Δn about 0.035), and it goes dark four times as the polarizer turns.              */
(function () {
  var T = 160;
  var mats = {
    salt: M({ ph: 0.35, bir: 0.0, fl: [0.0, 0.0, 0.0] }),
    saltE: M({ ph: 1.0, bir: 0.0 }),
    sug: M({ ph: 0.3, bir: 0.7, fl: [0.0, 0.0, 0.0] }),
    sugE: M({ ph: 1.0, bir: 0.7 })
  };
  function boxSlice(g, ink, sl, hw, hh, h, inner, M1, M2, hop) {
    /* a prism standing on the glass from z = -h/2 to h/2 */
    var o = ovl(-h / 2, h / 2, sl.z0, sl.z1); if (o <= 0) return;
    var f = o / (sl.z1 - sl.z0);
    g.fillStyle = ink.rgb(M1, f); g.strokeStyle = ink.rgb(M2, f * 0.9); g.lineWidth = 1.1;
    inner(g, hw, hh); g.fill(); g.stroke();
    if (sl.z1 > h / 2 - 0.5 && hop) { g.lineWidth = 0.8; for (var s = 0.72; s > 0.2; s -= 0.22) { inner(g, hw * s, hh * s); g.stroke(); } }
    if (sl.z0 < -h / 2 + 0.5 || sl.z1 > h / 2 - 0.5) { g.fillStyle = ink.rgb(M2, 0.25); inner(g, hw, hh); g.fill(); }
  }
  function sq(g, a, b) { var r = Math.min(a, b) * 0.06; g.beginPath(); g.moveTo(-a + r, -b); g.lineTo(a - r, -b); g.quadraticCurveTo(a, -b, a, -b + r); g.lineTo(a, b - r); g.quadraticCurveTo(a, b, a - r, b); g.lineTo(-a + r, b); g.quadraticCurveTo(-a, b, -a, b - r); g.lineTo(-a, -b + r); g.quadraticCurveTo(-a, -b, -a + r, -b); g.closePath(); }
  function prism(g, a, b) { var c = b * 0.8; g.beginPath(); g.moveTo(-a + c, -b); g.lineTo(a, -b); g.lineTo(a - c * 0.2, -b * 0.2); g.lineTo(a - c, b); g.lineTo(-a, b); g.lineTo(-a + c * 0.2, b * 0.2); g.closePath(); }
  var types = {
    salt: {
      half: [24, 24], tex: 0.1, slab: 3, zoff: zoffs(21, 3), variants: 2, orient: 1,
      bake: function (g, sl, vr, ink) { boxSlice(g, ink, sl, 20, 20, 40, sq, mats.salt, mats.saltE, vr === 1); }
    },
    sugar: {
      half: [46, 26], tex: 0.14, slab: 3, zoff: zoffs(13.5, 3), variants: 1, orient: 1,
      bake: function (g, sl, vr, ink) { boxSlice(g, ink, sl, 40, 21, 26, prism, mats.sug, mats.sugE, false); }
    }
  };
  var memo = new Map();
  function tile(i, j) {
    var key = i * 7919 + j, have = memo.get(key); if (have) return have;
    if (memo.size > 6000) memo.clear();
    var r = tileRng(i, j, 0xc7a1), a = [], sugarSide = Math.sin(i * 0.9 + j * 0.4) > -0.1;
    var n = 1 + (r() * 3 | 0);
    for (var k = 0; k < n; k++) {
      var isSug = r() < (sugarSide ? 0.7 : 0.3), sc = isSug ? 0.45 + r() * 0.85 : 0.5 + r() * 0.6;
      var h = isSug ? 26 * sc : 40 * sc;
      a.push([isSug ? "sugar" : "salt", i * T + 25 + r() * (T - 50), j * T + 25 + r() * (T - 50), h / 2, r() * TAU, sc, isSug ? 0 : (r() < 0.3 ? 1 : 0)]);
    }
    memo.set(key, a); return a;
  }
  MODELS.crystal = {
    z: [0, 46], mats: mats, types: types, birSc: 1.5,
    colors: function () { return { G: PIG.none, B: STAINCOL.none }; },
    items: function (v) {
      var S = new Inst(), U = new Inst();
      eachTile(v, T, 50, function (i, j) { tile(i, j).forEach(function (c) { if (!inView(v, c[1], c[2], 50)) return; (c[0] === "salt" ? S : U).add(c[1], c[2], c[3], c[4], c[5], c[6], 1, 1); }); });
      return { salt: S.out(), sugar: U.out() };
    },
    marks: [{ z: 40, en: "the tops of the big crystals", es: "arriba de los cristales grandes" }, { z: 14, en: "the tops of the small crystals", es: "arriba de los cristales chicos" }, { z: 1, en: "the glass", es: "el vidrio" }],
    markTol: 6,
    side: function (ctx, map, w) {
      ctx.strokeStyle = "rgba(220,230,240,.8)"; ctx.lineWidth = 1.3;
      [[0.1, 0.12, 34], [0.35, 0.1, 18], [0.6, 0.2, 14], [0.85, 0.08, 40]].forEach(function (c) { ctx.strokeRect(w * c[0], map(c[2]), w * c[1], map(0) - map(c[2])); });
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
  var ink = makeInk(mode, model.fixedStain || stain), v = cur; v.cache = {}; v.obj = L.obj; v.barPeriod = o.barPeriod; v.t = o.t || 0;
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
  var tex = arrayTex(W, H, S * V), ink = makeInk(mode, model.fixedStain || stain);
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
  if (u.uBirSc) gl.uniform1f(u.uBirSc, o.birSc == null ? 0.5 : o.birSc);
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
  var cols = model.colors(model.fixedStain || stain, mode);
  o.birSc = model.birSc == null ? 0.5 : model.birSc;

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
      var tc = (T.colors && T.colors(model.fixedStain || stain, mode)) || cols;
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
      if (T.birSc != null) gl.uniform1f(su.uBirSc, o.birSc);
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
  if (above && below) return es ? "Entre " + below.es + " y " + above.es : "Between " + above.en + " and " + below.en;
  return es ? "Dentro de la muestra" : "Inside the sample";
}

Object.keys(MODELS).forEach(function (k) { MODELS[k].id = k; });
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
