/* AOG-TELE-MAP-V1 (2026-10-12) — Jimmy: "a quantum leap forward." The star map: the real sky for the chosen time and
   place, drawn with WebGL — the sky's colour from the real Sun's height (day blue, twilight, night), the Milky Way's
   glow, the city's glow near the horizon, moonlight, a calm line of hills and trees, 8,874 real stars sized by
   brightness and tinted by colour — and, on top, constellation lines and names, the Sun, Moon and planets, and the
   deep-sky objects. Drag to look around, pinch or use + and − to zoom, tap something to learn about it, and press
   "Point the telescope": the view turns to it once (a short eased move; with "reduce motion" it is instant) and the
   eyepiece opens on it as it is tonight.
   Calm and silent: it draws only when you drag, zoom, tap or change the time. Stars shiver a little only while you are
   dragging, and never when stillness was asked for. Leaving the map lets WebGL go (the context is released).
   Loaded only when the map is opened. Works without WebGL too (a plainer drawing). */
(function () {
  "use strict";
  const A = window.AOGAstro, K = window.AOGSkyData, D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const STILL = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return true; } })();
  const COARSE = (() => { try { return matchMedia("(pointer: coarse)").matches; } catch (e) { return false; } })();
  const W = {
    lead: ["Drag to look around. Pinch or use + and − to zoom. Tap a star, planet or cloud to learn about it.", "Arrastra para mirar alrededor. Pellizca o usa + y − para acercar. Toca una estrella, un planeta o una nube para saber más."],
    minus1: ["−1 hour", "−1 hora"], plus1: ["+1 hour", "+1 hora"], now: ["Now", "Ahora"], tonight: ["Tonight", "Esta noche"],
    zin: ["Zoom in", "Acercar"], zout: ["Zoom out", "Alejar"], find: ["Find", "Buscar"], pick: ["Pick something…", "Elige algo…"],
    lines: ["Lines", "Líneas"], names: ["Names", "Nombres"], on: ["On", "Sí"], off: ["Off", "No"],
    face: ["Look toward", "Mirar hacia"], N: ["North", "Norte"], E: ["East", "Este"], S: ["South", "Sur"], Wd: ["West", "Oeste"], Up: ["Straight up", "Arriba"],
    when: ["Date and time", "Fecha y hora"], where: ["Place", "Lugar"], typed: ["Type a place", "Escribe un lugar"],
    lat: ["Latitude (north +)", "Latitud (norte +)"], lon: ["Longitude (east +, west −)", "Longitud (este +, oeste −)"], use: ["Use these", "Usar estos"],
    myloc: ["Use my location", "Usar mi ubicación"], locnote: ["Your place stays on this device.", "Tu lugar se queda en este aparato."],
    locno: ["The location was not shared. Pick a city or type it.", "No se compartió la ubicación. Elige una ciudad o escríbela."],
    locyes: ["Using your location.", "Usando tu ubicación."], badll: ["Latitude is −90 to 90; longitude is −180 to 180.", "La latitud va de −90 a 90; la longitud, de −180 a 180."],
    glow: ["Sky glow", "Brillo del cielo"], up: ["Up after dark", "Arriba de noche"], darkAt: ["Dark at", "Oscuro a las"],
    point: ["Point the telescope", "Apuntar el telescopio"], close: ["Close", "Cerrar"], mag: ["Brightness (magnitude)", "Brillo (magnitud)"],
    rises: ["Rises", "Sale"], sets: ["Sets", "Se pone"], high: ["Highest", "Más alto"], allnight: ["Up all day and night", "Arriba todo el día y la noche"],
    never: ["Below the horizon all day", "Bajo el horizonte todo el día"], below: ["Below the horizon now", "Bajo el horizonte ahora"],
    upNow: ["up", "de altura"], sunWarn: ["Only with a solar filter on the front.", "Solo con un filtro solar al frente."],
    field: ["the eyepiece's view", "lo que ve el ocular"], nogl: ["This device draws a simpler map.", "Este aparato dibuja un mapa más sencillo."],
    custom: ["Your place", "Tu lugar"], nothing: ["Nothing bright is up then. Try another time.", "No hay nada brillante arriba a esa hora. Prueba otra hora."],
    sel: ["Selected", "Elegido"], placeLabel: ["City", "Ciudad"]
  };
  const DIR8 = { en: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"], es: ["N", "NE", "E", "SE", "S", "SO", "O", "NO"] };
  const NELM = [0, 7.8, 7.3, 6.8, 6.3, 5.8, 5.3, 4.8, 4.3, 4.0];
  const GLOW = [0, 0.0005, 0.0008, 0.0013, 0.0021, 0.0036, 0.0062, 0.010, 0.016, 0.024];
  let M = null;
  const w = k => (W[k] || [k, k])[M && M.lang === "es" ? 1 : 0];

  /* the line of hills and trees, degrees above the true horizon, by azimuth (radians). The same in the shader. */
  const HZ = "float hz(float a){ float h=0.85+0.5*sin(a*2.0+1.3)+0.32*sin(a*5.0+0.4)+0.16*sin(a*11.0+2.1);" +
    "float t=0.0; t+=1.9*exp(-pow((mod(a-0.62+3.14159,6.28318)-3.14159)/0.045,2.0));" +
    "t+=1.5*exp(-pow((mod(a-0.70+3.14159,6.28318)-3.14159)/0.035,2.0));" +
    "t+=2.3*exp(-pow((mod(a-2.35+3.14159,6.28318)-3.14159)/0.06,2.0));t+=1.7*exp(-pow((mod(a-2.46+3.14159,6.28318)-3.14159)/0.04,2.0));" +
    "t+=1.2*exp(-pow((mod(a-4.05+3.14159,6.28318)-3.14159)/0.05,2.0));t+=2.0*exp(-pow((mod(a-5.30+3.14159,6.28318)-3.14159)/0.07,2.0));" +
    "t+=1.4*exp(-pow((mod(a-5.42+3.14159,6.28318)-3.14159)/0.04,2.0));return h+t;}";
  function hzJS(a) {
    const g = (c, s, k) => { let d = ((a - c + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return k * Math.exp(-Math.pow(d / s, 2)); };
    return 0.85 + 0.5 * Math.sin(a * 2 + 1.3) + 0.32 * Math.sin(a * 5 + 0.4) + 0.16 * Math.sin(a * 11 + 2.1) +
      g(0.62, 0.045, 1.9) + g(0.70, 0.035, 1.5) + g(2.35, 0.06, 2.3) + g(2.46, 0.04, 1.7) + g(4.05, 0.05, 1.2) + g(5.30, 0.07, 2.0) + g(5.42, 0.04, 1.4);
  }
  const REFR = "float refr(float a){ return a>-1.5 ? 1.02/tan(radians(a+10.3/(a+5.11)))/60.0 : 0.0; }";

  const VS_BG = "attribute vec2 p; varying vec2 vP; uniform vec2 uRes; void main(){ vP=p*uRes*0.5; gl_Position=vec4(p,0.0,1.0); }";
  const FS_BG = `precision highp float; varying vec2 vP;
    uniform vec2 uRes; uniform float uF; uniform mat3 uView; uniform mat3 uE2Q; uniform vec3 uSun; uniform float uSunAlt;
    uniform vec3 uMoon; uniform float uMoonL; uniform float uGlow; uniform sampler2D uTex; uniform float uMW;
    ${HZ}
    const vec3 GP=vec3(-0.867666,-0.198076,0.455984); const vec3 GC=vec3(-0.054876,-0.873437,-0.483835);
    void main(){
      float r=length(vP); float th=2.0*atan(r/(2.0*uF));
      vec3 v=vec3(0.0,0.0,1.0); if(r>0.0){ v=vec3(sin(th)*vP.x/r, sin(th)*vP.y/r, cos(th)); }
      vec3 d=v*uView;  /* view → east, north, up */
      float alt=asin(clamp(d.z,-1.0,1.0)); float az=atan(d.x,d.y); float altd=degrees(alt);
      float s=uSunAlt; float cg=dot(d,uSun);
      float h=max(alt,0.0); float sh=sin(h);
      float dayA=smoothstep(-6.0,8.0,s); float twA=smoothstep(-18.0,-2.0,s)*(1.0-dayA*0.85);
      vec3 col=vec3(0.0012,0.0018,0.0040);
      vec3 dayZ=vec3(0.10,0.24,0.62), dayH=vec3(0.48,0.62,0.82);
      vec3 dayC=mix(dayH,dayZ,pow(sh,0.55)) + vec3(1.0,0.9,0.7)*0.6*pow(max(cg,0.0),40.0) + vec3(0.9,0.8,0.7)*0.18*pow(max(cg,0.0),4.0);
      float low=pow(1.0-sh,3.0); float toward=pow(max(cg*0.5+0.5,0.0),3.0);
      float twB=pow(10.0,(clamp(s,-18.0,0.0))/7.0);
      vec3 twC=vec3(0.020,0.040,0.110)*twB + low*twB*mix(vec3(0.10,0.12,0.24),vec3(0.95,0.48,0.20),toward);
      col+=twA*twC + dayA*dayC;
      /* moonlight: a pale blue sky and a soft halo round the Moon */
      float cm=dot(d,uMoon); col+=uMoonL*(vec3(0.05,0.08,0.16)*(0.5+0.8*low) + vec3(0.25,0.25,0.22)*pow(max(cm,0.0),300.0));
      /* the city's glow: warm, strongest low down */
      float night=1.0-dayA;
      col+=night*uGlow*(0.6+5.0*pow(1.0-sh,4.0))*vec3(1.0,0.82,0.62);
      /* the Milky Way: the real outline, plus a broad glow along the galactic plane */
      vec3 e=uE2Q*d; float b=asin(clamp(dot(e,GP),-1.0,1.0)); vec3 GY=cross(GP,GC); float l=atan(dot(e,GY),dot(e,GC));
      float ra=atan(e.y,e.x); float dec=asin(clamp(e.z,-1.0,1.0));
      float mwT=texture2D(uTex,vec2(ra/6.28318,0.5-dec/3.14159)).r;
      float diffuse=exp(-abs(b)/0.16)*(0.45+0.55*pow(0.5+0.5*cos(l),1.5));
      float vis=uMW*clamp(1.0-(uGlow+uMoonL*0.05+twA*twB*0.08)/0.012,0.0,1.0)*night;
      col+=vis*(vec3(0.0075,0.0078,0.0082)*mwT*mwT*1.6+vec3(0.0030,0.0030,0.0032)*mwT+vec3(0.0016,0.0016,0.0018)*diffuse);
      col*=smoothstep(-2.0,0.4,altd)*0.75+0.25;
      /* the ground: a dark line of hills and trees, faintly lit by the sky */
      float hzd=hz(az); float px=degrees(1.0/uF)*1.2;
      float g=smoothstep(hzd+px,hzd-px,altd);
      vec3 gc=vec3(0.010,0.013,0.011)+dayA*vec3(0.06,0.08,0.06)+twA*twB*vec3(0.015,0.015,0.02)+night*uGlow*vec3(0.5,0.4,0.3);
      gc*=1.0-0.5*clamp((hzd-altd)/25.0,0.0,1.0);
      col=mix(col,gc,g);
      col=1.0-exp(-col*1.6);
      gl_FragColor=vec4(pow(col,vec3(1.0/2.2)),1.0);
    }`;
  const VS_ST = `precision highp float; attribute vec3 aP; attribute float aM; attribute float aB;
    uniform mat3 uQ2E; uniform mat3 uView; uniform float uF; uniform vec2 uRes; uniform float uLim; uniform float uDpr; uniform float uTw; uniform float uT;
    varying vec4 vC; ${HZ} ${REFR}
    void main(){
      vec3 e=uQ2E*aP; float altd=degrees(asin(clamp(e.z,-1.0,1.0))); altd+=refr(altd); float az=atan(e.x,e.y);
      if(altd<hz(az)){ gl_Position=vec4(3.0,3.0,3.0,1.0); gl_PointSize=0.0; vC=vec4(0.0); return; }
      float ca=cos(radians(altd)); vec3 d=vec3(ca*sin(az),ca*cos(az),sin(radians(altd)));
      vec3 v=uView*d; float th=acos(clamp(v.z,-1.0,1.0));
      if(th>2.9){ gl_Position=vec4(3.0,3.0,3.0,1.0); gl_PointSize=0.0; vC=vec4(0.0); return; }
      float r=2.0*uF*tan(th*0.5); vec2 p=length(v.xy)>0.0?normalize(v.xy)*r:vec2(0.0);
      gl_Position=vec4(p/(uRes*0.5),0.0,1.0);
      float X=1.0/sin(radians(max(altd,0.0)+244.0/(165.0+47.0*pow(max(altd,0.0),1.1))));
      float m=aM+0.2*(X-1.0); float dl=uLim-m;
      float a=clamp(1.0+dl/0.7,0.0,1.0);
      float hsh=fract(sin(dot(aP.xy,vec2(12.9898,78.233)))*43758.5453);
      if(uTw>0.0) a*=1.0+uTw*(0.10+0.04*min(X,6.0))*sin(uT*7.0+hsh*40.0);
      float sz=uDpr*(1.25+1.15*sqrt(max(dl,0.0)));
      gl_PointSize=sz*3.0;
      float bv=aB; vec3 c=bv<0.0?vec3(0.74,0.82,1.0):bv<0.4?mix(vec3(0.86,0.9,1.0),vec3(1.0,0.98,0.95),bv/0.4):bv<1.0?mix(vec3(1.0,0.98,0.95),vec3(1.0,0.86,0.66),(bv-0.4)/0.6):mix(vec3(1.0,0.86,0.66),vec3(1.0,0.72,0.50),clamp((bv-1.0)/0.8,0.0,1.0));
      c=mix(c,c*vec3(1.0,0.93,0.82),clamp((X-1.5)/6.0,0.0,1.0));
      vC=vec4(c, a*clamp(0.32+dl*0.22,0.0,1.0)); }`;
  const FS_ST = `precision highp float; varying vec4 vC;
    void main(){ vec2 q=gl_PointCoord-0.5; float d=length(q)*6.0; float I=exp(-d*d*0.9)+0.10*exp(-d*d*0.10)*vC.a; gl_FragColor=vec4(vC.rgb*I*vC.a,1.0); }`;

  function sh(gl, type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function prog(gl, vs, fs) { const p = gl.createProgram(); const a = sh(gl, gl.VERTEX_SHADER, vs), b = sh(gl, gl.FRAGMENT_SHADER, fs); gl.attachShader(p, a); gl.attachShader(p, b); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); p._sh = [a, b]; return p; }
  const colMajor = m => [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];

  function open(host, opts) {
    if (M) close();
    const lang = opts.lang || "en";
    const v0 = K.ST.view || {};
    M = { host, opts, lang, az: isFinite(v0.az) ? v0.az : 180, alt: isFinite(v0.alt) ? v0.alt : 32, fov: isFinite(v0.fov) ? v0.fov : (COARSE ? 95 : 100),
      lines: v0.lines !== false, names: v0.names !== false, sel: null, raf: 0, gl: null, renders: 0, drag: false, ptrs: new Map(), anim: null };
    build();
    initGL();
    requestRender();
    if (M.opts.onReady) M.opts.onReady();
  }
  function isOpen() { return !!M; }
  function relabel(lang) { if (!M) return; const keep = { sel: M.sel, opts: M.opts, host: M.host }; saveView(); close(); keep.opts.lang = lang; open(keep.host, keep.opts); if (keep.sel) select(keep.sel); }
  function saveView() { if (!M) return; K.ST.view = { az: M.az, alt: M.alt, fov: M.fov, lines: M.lines, names: M.names }; K.save(); }

  /* ── the page around the map ── */
  function cityOptions() {
    const list = K.CITIES.map(c => `<option value="${c[0]}"${K.ST.city === c[0] ? " selected" : ""}>${c[1]}</option>`).join("");
    return (K.ST.city ? "" : `<option value="" selected>${w("custom")} (${K.ST.lat.toFixed(2)}°, ${K.ST.lon.toFixed(2)}°)</option>`) + list;
  }
  function findOptions() {
    return `<option value="">${w("pick")}</option>` + K.findList(M.lang).map(([g, ids]) => `<optgroup label="${g}">${ids.map(id => `<option value="${id}">${K.name(id, M.lang)}</option>`).join("")}</optgroup>`).join("");
  }
  function build() {
    const h = M.host, es = M.lang === "es";
    h.innerHTML = `
      <p class="lead sky-lead">${w("lead")}</p>
      <div class="sky-grid">
        <div class="sky-main">
          <div class="sky-stage" tabindex="0" aria-label="${es ? "Mapa del cielo" : "Star map"}">
            <canvas class="sky-gl" aria-hidden="true"></canvas><canvas class="sky-2d" aria-hidden="true"></canvas>
            <div class="sky-zoom"><button type="button" class="btn" data-z="in" aria-label="${w("zin")}">+</button><button type="button" class="btn" data-z="out" aria-label="${w("zout")}">−</button></div>
          </div>
          <div class="sky-time">
            <button type="button" class="btn" data-t="-1">${w("minus1")}</button>
            <button type="button" class="btn${K.ST.mode !== "set" ? " btn-steel" : ""}" data-t="now">${w("now")}</button>
            <button type="button" class="btn" data-t="1">${w("plus1")}</button>
            <button type="button" class="btn" data-t="tonight">${w("tonight")}</button>
          </div>
          <p class="note-line sky-when"></p>
          <div class="card sky-card" hidden></div>
        </div>
        <aside class="sky-side">
          <div class="card sky-box">
            <label class="sky-field"><span>${w("find")}</span><select class="sky-find">${findOptions()}</select></label>
            <label class="sky-field"><span>${w("face")}</span><select class="sky-face">
              <option value="">…</option><option value="0">${w("N")}</option><option value="90">${w("E")}</option><option value="180">${w("S")}</option><option value="270">${w("Wd")}</option><option value="up">${w("Up")}</option></select></label>
            <div class="row"><span class="tiny">${w("lines")}</span><span><button type="button" class="btn${M.lines ? " btn-steel" : ""}" data-l="1">${w("on")}</button><button type="button" class="btn${!M.lines ? " btn-steel" : ""}" data-l="0">${w("off")}</button></span></div>
            <div class="row"><span class="tiny">${w("names")}</span><span><button type="button" class="btn${M.names ? " btn-steel" : ""}" data-n="1">${w("on")}</button><button type="button" class="btn${!M.names ? " btn-steel" : ""}" data-n="0">${w("off")}</button></span></div>
            <label class="row glowrow"><span class="tiny">${w("glow")}</span><span><input class="scope-knob sky-glow" type="range" min="1" max="9" step="1" value="${M.opts.bortle()}" aria-label="${w("glow")}"><b class="sky-glowval"></b></span></label>
          </div>
          <div class="card sky-box">
            <label class="sky-field"><span>${w("when")}</span><input type="datetime-local" class="sky-dt" value="${K.inputValue(K.now())}"></label>
            <label class="sky-field"><span>${w("where")}</span><select class="sky-city">${cityOptions()}</select></label>
            <details class="sky-typed"><summary>${w("typed")}</summary>
              <label class="sky-field"><span>${w("lat")}</span><input type="text" inputmode="decimal" class="sky-lat" value="${K.ST.lat}"></label>
              <label class="sky-field"><span>${w("lon")}</span><input type="text" inputmode="decimal" class="sky-lon" value="${K.ST.lon}"></label>
              <button type="button" class="btn sky-use">${w("use")}</button>
            </details>
            <button type="button" class="btn sky-loc">${w("myloc")}</button>
            <p class="note-line sky-locmsg">${w("locnote")}</p>
          </div>
          <div class="card sky-box sky-tonight-box">
            <p class="kicker">${w("up")}</p><p class="note-line sky-darkat"></p><div class="sky-tonight"></div>
          </div>
        </aside>
      </div>`;
    const q = s => h.querySelector(s);
    M.el = { stage: q(".sky-stage"), gl: q(".sky-gl"), c2: q(".sky-2d"), card: q(".sky-card"), when: q(".sky-when"), dt: q(".sky-dt"), glowval: q(".sky-glowval") };
    h.querySelectorAll("[data-z]").forEach(b => b.onclick = () => { zoom(b.dataset.z === "in" ? 1 / 1.5 : 1.5); });
    h.querySelectorAll("[data-t]").forEach(b => b.onclick = () => {
      const t = b.dataset.t;
      if (t === "now") K.setTime(null);
      else if (t === "tonight") { K.setTime(K.darkTonight(Date.now())); }
      else K.setTime(K.now() + (+t) * 3600000);
      timeChanged();
      h.querySelectorAll("[data-t]").forEach(x => x.classList.toggle("btn-steel", x.dataset.t === "now" && K.ST.mode !== "set"));
    });
    h.querySelectorAll("[data-l]").forEach(b => b.onclick = () => { M.lines = b.dataset.l === "1"; h.querySelectorAll("[data-l]").forEach(x => x.classList.toggle("btn-steel", (x.dataset.l === "1") === M.lines)); saveView(); requestRender(); });
    h.querySelectorAll("[data-n]").forEach(b => b.onclick = () => { M.names = b.dataset.n === "1"; h.querySelectorAll("[data-n]").forEach(x => x.classList.toggle("btn-steel", (x.dataset.n === "1") === M.names)); saveView(); requestRender(); });
    q(".sky-find").onchange = e => { const id = e.target.value; if (!id) return; select(id); centerOn(id, false); e.target.value = ""; };
    q(".sky-face").onchange = e => { const v = e.target.value; if (v === "") return; if (v === "up") { M.alt = 89.9; } else { M.az = +v; M.alt = Math.max(20, Math.min(40, M.alt)); } e.target.value = ""; saveView(); requestRender(); };
    const gl = q(".sky-glow");
    const glowText = () => { const b = M.opts.bortle(), BT = ["", "Darkest sky|El cielo más oscuro", "Truly dark sky|Cielo muy oscuro", "Country sky|Cielo de campo", "Country edge|Borde del campo", "Suburb|Suburbio", "Bright suburb|Suburbio brillante", "Edge of a city|Borde de ciudad", "City|Ciudad", "Inner city|Centro de la ciudad"]; M.el.glowval.textContent = b + " · " + BT[b].split("|")[M.lang === "es" ? 1 : 0]; };
    glowText();
    gl.oninput = () => { M.opts.setBortle(+gl.value); glowText(); requestRender(); };
    M.el.dt.onchange = () => { const ms = K.fromInput(M.el.dt.value); if (ms) { K.setTime(ms); timeChanged(); h.querySelectorAll("[data-t]").forEach(x => x.classList.remove("btn-steel")); } };
    q(".sky-city").onchange = e => { if (!e.target.value) return; K.setCity(e.target.value); q(".sky-lat").value = K.ST.lat; q(".sky-lon").value = K.ST.lon; placeChanged(); };
    q(".sky-use").onclick = () => {
      const la = parseFloat(String(q(".sky-lat").value).replace(",", ".")), lo = parseFloat(String(q(".sky-lon").value).replace(",", "."));
      if (!K.setLatLon(la, lo)) { q(".sky-locmsg").textContent = w("badll"); return; }
      q(".sky-city").innerHTML = cityOptions(); q(".sky-locmsg").textContent = w("locnote"); placeChanged();
    };
    /* asked only when tapped, never on its own */
    q(".sky-loc").onclick = () => {
      if (!navigator.geolocation) { q(".sky-locmsg").textContent = w("locno"); return; }
      navigator.geolocation.getCurrentPosition(p => {
        if (!M) return;
        K.setLatLon(+p.coords.latitude.toFixed(3), +p.coords.longitude.toFixed(3));
        q(".sky-lat").value = K.ST.lat; q(".sky-lon").value = K.ST.lon; q(".sky-city").innerHTML = cityOptions();
        q(".sky-locmsg").textContent = w("locyes"); placeChanged();
      }, () => { if (M) q(".sky-locmsg").textContent = w("locno"); }, { timeout: 15000, maximumAge: 600000 });
    };
    bindPointer();
    M.onResize = () => requestRender();
    window.addEventListener("resize", M.onResize);
    timeChanged(true);
  }
  function timeChanged(first) {
    if (!M) return;
    if (!first) M.el.dt.value = K.inputValue(K.now());
    const ms = K.now();
    M.el.when.textContent = (K.ST.name || `${K.ST.lat.toFixed(2)}°, ${K.ST.lon.toFixed(2)}°`) + " · " + K.fmtDate(ms, M.lang) + " · " + K.fmtTime(ms, M.lang) + (K.ST.mode !== "set" ? (M.lang === "es" ? " (ahora)" : " (now)") : "");
    tonightList();
    if (M.sel) card(M.sel);
    requestRender();
  }
  function placeChanged() { timeChanged(); }
  function tonightList() {
    const box = M.host.querySelector(".sky-tonight"), at = M.host.querySelector(".sky-darkat");
    const tn = K.tonight(K.now());
    at.textContent = w("darkAt") + " " + K.fmtTime(tn.at, M.lang) + (M.lang === "es" ? "" : "") + " · " + K.fmtDate(tn.at, M.lang);
    box.innerHTML = tn.list.length ? tn.list.map(o => `<button type="button" class="btn sky-chip" data-go="${o.id}">${K.name(o.id, M.lang)} <small>${Math.round(o.alt)}° ${DIR8[M.lang === "es" ? "es" : "en"][Math.round(o.az / 45) % 8]}</small></button>`).join("") : `<p class="note-line">${w("nothing")}</p>`;
    box.querySelectorAll("[data-go]").forEach(b => b.onclick = () => {
      if (K.ST.mode !== "set" || Math.abs(K.now() - tn.at) > 60000) { K.setTime(tn.at); M.host.querySelectorAll("[data-t]").forEach(x => x.classList.remove("btn-steel")); timeChanged(); }
      select(b.dataset.go); centerOn(b.dataset.go, false);
    });
  }

  /* ── projection (the shader does the same) ── */
  function frame() {
    const c = A.at(K.now(), K.ST.lat, K.ST.lon);
    const az = M.az * D2R, al = M.alt * D2R;
    const F = [Math.sin(az) * Math.cos(al), Math.cos(az) * Math.cos(al), Math.sin(al)];
    const R = [Math.cos(az), -Math.sin(az), 0];
    const U = A.cross(R, F);
    const cw = M.el.stage.clientWidth || 360, ch = M.el.stage.clientHeight || 360;
    const f = (Math.min(cw, ch) / 2) / (2 * Math.tan(M.fov * D2R / 4));
    return { c, F, R, U, f, cw, ch };
  }
  function projENU(fr, d) {
    const x = A.dot(d, fr.R), y = A.dot(d, fr.U), z = A.dot(d, fr.F);
    const th = Math.acos(Math.max(-1, Math.min(1, z)));
    if (th > 2.9) return null;
    const r = 2 * fr.f * Math.tan(th / 2), l = Math.hypot(x, y) || 1;
    return { x: fr.cw / 2 + x / l * r, y: fr.ch / 2 - y / l * r };
  }
  /* a J2000 vector → screen, with refraction, and whether it is above the hills */
  function proj(fr, v) {
    const e = A.mv(fr.c.M, v);
    let alt = Math.asin(Math.max(-1, Math.min(1, e[2]))) * R2D; alt += A.refraction(alt);
    const az = Math.atan2(e[0], e[1]);
    const ca = Math.cos(alt * D2R), d = [ca * Math.sin(az), ca * Math.cos(az), Math.sin(alt * D2R)];
    const p = projENU(fr, d); if (!p) return null;
    p.alt = alt; p.az = A.n360(az * R2D); p.up = alt >= hzJS(az);
    return p;
  }
  function limitNow(fr) {
    const sa = A.horiz(fr.c, A.sun(fr.c).v).alt, b = M.opts.bortle();
    let lim = NELM[b];
    if (sa > -0.5) lim = -1.6;
    else if (sa > -18) lim = Math.min(lim, 0.6 + Math.pow((-sa - 0.5) / 17.5, 1.3) * (NELM[b] - 0.6));
    const m = A.moon(fr.c), mh = A.horiz(fr.c, m.v);
    if (mh.alt > 0) lim -= 1.3 * m.illum * m.illum * Math.sin(mh.alt * D2R);
    lim += Math.max(0, Math.min(1.6, Math.log2(80 / M.fov) * 0.55));
    return { lim, sunAlt: sa };
  }

  /* ── WebGL ── */
  function initGL() {
    const cv = M.el.gl;
    let gl = null;
    try { gl = cv.getContext("webgl", { antialias: false, alpha: false, preserveDrawingBuffer: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) { M.el.when.textContent += " · " + w("nogl"); return; }
    try {
      M.pBg = prog(gl, VS_BG, FS_BG); M.pSt = prog(gl, VS_ST, FS_ST);
    } catch (e) { console.warn(e); M.gl = null; return; }
    M.gl = gl;
    M.quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, M.quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const D = K.data(), n = D.n, buf = new Float32Array(n * 5);
    for (let i = 0; i < n; i++) { buf[i * 5] = D.xyz[i * 3]; buf[i * 5 + 1] = D.xyz[i * 3 + 1]; buf[i * 5 + 2] = D.xyz[i * 3 + 2]; buf[i * 5 + 3] = D.mag[i]; buf[i * 5 + 4] = D.bv[i]; }
    M.stars = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, M.stars); gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW); M.nStars = n;
    M.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, M.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 1, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array([0]));
    M.mw = 0;
    const img = new Image(); img.decoding = "async";
    img.onload = () => { if (!M || M.gl !== gl) return; gl.bindTexture(gl.TEXTURE_2D, M.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); M.mw = 1; requestRender(); };
    img.src = "/data/sky/milkyway.png";
    M.loc = {};
    ["uRes", "uF", "uView", "uE2Q", "uSun", "uSunAlt", "uMoon", "uMoonL", "uGlow", "uTex", "uMW"].forEach(u => M.loc["b" + u] = gl.getUniformLocation(M.pBg, u));
    ["uQ2E", "uView", "uF", "uRes", "uLim", "uDpr", "uTw", "uT"].forEach(u => M.loc["s" + u] = gl.getUniformLocation(M.pSt, u));
    cv.addEventListener("webglcontextlost", e => { e.preventDefault(); });
  }
  function requestRender() { if (M && !M.raf) M.raf = requestAnimationFrame(t => { if (!M) return; M.raf = 0; render(t); }); }
  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), st = M.el.stage, cw = st.clientWidth || 360, ch = st.clientHeight || 360;
    for (const c of [M.el.gl, M.el.c2]) { const W2 = Math.round(cw * dpr), H2 = Math.round(ch * dpr); if (c.width !== W2 || c.height !== H2) { c.width = W2; c.height = H2; } }
    return dpr;
  }
  function render(t) {
    if (M.anim) stepAnim(t);
    const dpr = size(), fr = frame(), L = limitNow(fr);
    M.renders++; M.el.stage.dataset.renders = String(M.renders);
    const c = fr.c, sun = A.sun(c), moon = A.moon(c);
    const sunE = A.mv(c.M, sun.v), moonE = A.mv(c.M, moon.v), mh = Math.asin(moonE[2]) * R2D;
    const gl = M.gl;
    if (gl) {
      gl.viewport(0, 0, M.el.gl.width, M.el.gl.height);
      const view = [...fr.R, ...fr.U, ...fr.F];        /* rows */
      gl.useProgram(M.pBg); gl.disable(gl.BLEND);
      gl.bindBuffer(gl.ARRAY_BUFFER, M.quad); const lp = gl.getAttribLocation(M.pBg, "p"); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(M.loc.buRes, M.el.gl.width, M.el.gl.height); gl.uniform1f(M.loc.buF, fr.f * dpr);
      /* GLSL: v*uView = uViewᵀ v; with rows R,U,F passed column-major as given, v*uView maps view → ENU */
      gl.uniformMatrix3fv(M.loc.buView, false, new Float32Array(colMajor(view)));
      gl.uniformMatrix3fv(M.loc.buE2Q, false, new Float32Array(c.M));           /* Mᵀ in column-major = M row-major */
      gl.uniform3f(M.loc.buSun, sunE[0], sunE[1], sunE[2]); gl.uniform1f(M.loc.buSunAlt, Math.asin(sunE[2]) * R2D);
      gl.uniform3f(M.loc.buMoon, moonE[0], moonE[1], moonE[2]); gl.uniform1f(M.loc.buMoonL, mh > 0 ? moon.illum * moon.illum * Math.sin(mh * D2R) * 0.9 : 0);
      gl.uniform1f(M.loc.buGlow, GLOW[M.opts.bortle()] * 1.0); gl.uniform1f(M.loc.buMW, M.mw);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, M.tex); gl.uniform1i(M.loc.buTex, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.disableVertexAttribArray(lp);
      gl.useProgram(M.pSt); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      gl.bindBuffer(gl.ARRAY_BUFFER, M.stars);
      const aP = gl.getAttribLocation(M.pSt, "aP"), aM = gl.getAttribLocation(M.pSt, "aM"), aB = gl.getAttribLocation(M.pSt, "aB");
      gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 20, 0);
      gl.enableVertexAttribArray(aM); gl.vertexAttribPointer(aM, 1, gl.FLOAT, false, 20, 12);
      gl.enableVertexAttribArray(aB); gl.vertexAttribPointer(aB, 1, gl.FLOAT, false, 20, 16);
      gl.uniformMatrix3fv(M.loc.suQ2E, false, new Float32Array(colMajor(c.M)));
      gl.uniformMatrix3fv(M.loc.suView, false, new Float32Array(colMajor(view)));
      gl.uniform1f(M.loc.suF, fr.f * dpr); gl.uniform2f(M.loc.suRes, M.el.gl.width, M.el.gl.height);
      gl.uniform1f(M.loc.suLim, L.lim); gl.uniform1f(M.loc.suDpr, dpr);
      gl.uniform1f(M.loc.suTw, (M.drag && !STILL && !COARSE) ? 1 : 0); gl.uniform1f(M.loc.suT, (t || 0) / 1000);
      gl.drawArrays(gl.POINTS, 0, M.nStars);
      gl.disableVertexAttribArray(aP); gl.disableVertexAttribArray(aM); gl.disableVertexAttribArray(aB);
    }
    overlay(fr, L, dpr, sun, moon);
    if (M.anim) requestRender();
  }

  /* ── the drawing on top: lines, names, the Sun, the Moon, planets, deep-sky marks ── */
  function overlay(fr, L, dpr, sun, moon) {
    const cv = M.el.c2, x = cv.getContext("2d"), D = K.data(), es = M.lang === "es";
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, fr.cw, fr.ch);
    const day = L.sunAlt > -4;
    if (!M.gl) {      /* without WebGL: a plain sky, the ground, and the stars as dots */
      x.fillStyle = day ? "#5f86b8" : L.sunAlt > -12 ? "#18264a" : "#04060c"; x.fillRect(0, 0, fr.cw, fr.ch);
      for (let i = 0; i < D.n; i++) { if (D.mag[i] > L.lim) break; const p = proj(fr, K.starVec(i)); if (!p || !p.up) continue; const r = Math.max(0.5, (L.lim - D.mag[i]) * 0.45);
        x.fillStyle = "#f3f5ff"; x.beginPath(); x.arc(p.x, p.y, r, 0, 6.3); x.fill(); }
    }
    const ink = day ? "rgba(16,36,60,.85)" : "rgba(214,226,240,.78)";
    const lineCol = day ? "rgba(30,60,100,.35)" : "rgba(132,166,214,.34)";
    /* constellation lines (cut where they dip behind the hills) */
    if (M.lines) {
      x.strokeStyle = lineCol; x.lineWidth = 1; x.lineCap = "round"; x.lineJoin = "round";
      x.beginPath();
      for (const c of D.con) for (const seg of c.lines) {
        let prev = null;
        for (const pt of seg) {
          const p = proj(fr, A.radec2v(pt[0], pt[1]));
          if (prev && p && prev.up && p.up && Math.hypot(p.x - prev.x, p.y - prev.y) < fr.cw) {
            /* stop a little short of each star */
            const dx = p.x - prev.x, dy = p.y - prev.y, l = Math.hypot(dx, dy), g = Math.min(5, l * 0.2);
            if (l > 2 * g) { x.moveTo(prev.x + dx / l * g, prev.y + dy / l * g); x.lineTo(p.x - dx / l * g, p.y - dy / l * g); }
          }
          prev = p;
        }
      }
      x.stroke();
    }
    if (M.names) {
      x.textAlign = "center"; x.textBaseline = "middle";
      const rk = M.fov > 110 ? 1 : M.fov > 60 ? 2 : 3;
      x.font = `600 ${M.fov > 110 ? 10 : 11}px "Source Sans 3", sans-serif`;
      x.fillStyle = day ? "rgba(20,44,72,.55)" : "rgba(160,186,222,.62)";
      for (const c of D.con) { if (c.rank > rk) continue; const p = proj(fr, A.radec2v(c.at[0], c.at[1])); if (!p || !p.up || out(p, fr)) continue;
        x.fillText((es ? c.es : c.en).toUpperCase().split("").join(" "), p.x, p.y); }
      /* bright star names */
      const sl = M.fov > 100 ? 1.0 : M.fov > 50 ? 1.9 : M.fov > 20 ? 3.0 : 4.2;
      x.font = `500 12px "Source Sans 3", sans-serif`; x.textAlign = "left"; x.fillStyle = ink;
      for (let i = 0; i < D.n && D.mag[i] <= sl; i++) { const nm = D.named[i]; if (!nm || !nm[0]) continue; const p = proj(fr, K.starVec(i)); if (!p || !p.up || out(p, fr) || D.mag[i] > L.lim) continue;
        x.fillText(es ? (nm[1] || nm[0]) : nm[0], p.x + 7, p.y - 6); }
    }
    /* deep-sky objects: a soft ring for clusters and nebulae, an oval for galaxies */
    const bench = new Set(["M42", "M45", "M31", "M13", "M57", "M27", "DC"]);
    x.font = `500 11px "Source Sans 3", sans-serif`; x.textAlign = "left";
    for (const o of D.dso) {
      const show = bench.has(o.id) ? M.fov < 160 : (o.mag < 7.5 && M.fov < 70) || (o.mag < 9.5 && M.fov < 30);
      if (!show || o.id === "GC" || o.id === "NGC 869" || o.id === "NGC 884") continue;
      const p = proj(fr, o.v); if (!p || !p.up || out(p, fr)) continue;
      const rr = Math.max(4, Math.min(40, o.dim[0] / 60 * fr.f * D2R * 2 * 0.5));
      x.strokeStyle = day ? "rgba(30,60,100,.45)" : "rgba(170,206,190,.55)"; x.lineWidth = 1;
      x.beginPath(); if (/^(s|s0|e|i|g|sd)$/.test(o.t)) x.ellipse(p.x, p.y, rr, rr * 0.5, 0.5, 0, 6.3); else x.arc(p.x, p.y, rr, 0, 6.3); x.stroke();
      if (M.names && (bench.has(o.id) || M.fov < 40)) { x.fillStyle = day ? "rgba(20,50,80,.8)" : "rgba(184,214,200,.82)"; x.fillText(K.name("dso:" + o.id, M.lang).replace(/ \(M\d+\)$/, "").slice(0, 28), p.x + rr + 4, p.y + 3); }
    }
    /* the Sun, the Moon, the planets */
    const sp = proj(fr, sun.v);
    if (sp && sp.up) {
      const r = Math.max(9, sun.diam / 3600 * D2R * fr.f);
      const g = x.createRadialGradient(sp.x, sp.y, r * 0.5, sp.x, sp.y, r * 5); g.addColorStop(0, "rgba(255,248,224,.6)"); g.addColorStop(1, "rgba(255,248,224,0)");
      x.fillStyle = g; x.beginPath(); x.arc(sp.x, sp.y, r * 5, 0, 6.3); x.fill();
      x.fillStyle = "#fffbea"; x.beginPath(); x.arc(sp.x, sp.y, r, 0, 6.3); x.fill();
      label(x, sp, K.name("sun", M.lang), r, day);
    }
    for (const id of A.PLANETS) {
      const p = A.planet(fr.c, id), q = proj(fr, p.v); if (!q || !q.up || out(q, fr) || p.mag > L.lim + 0.5) continue;
      const r = Math.max(1.8, Math.min(5.5, 2.2 + (1.5 - p.mag) * 0.75)) * (M.fov < 20 ? 1.3 : 1);
      const g = x.createRadialGradient(q.x, q.y, 0, q.x, q.y, r * 3.2); g.addColorStop(0, p.col); g.addColorStop(0.35, p.col + "aa"); g.addColorStop(1, p.col + "00");
      x.fillStyle = g; x.beginPath(); x.arc(q.x, q.y, r * 3.2, 0, 6.3); x.fill();
      x.fillStyle = "#fffaf0"; x.beginPath(); x.arc(q.x, q.y, r * 0.55, 0, 6.3); x.fill();
      if (M.names) label(x, q, K.name(id, M.lang), r, day, "planet");
    }
    const mp = proj(fr, moon.v);
    if (mp && mp.up) {
      const r = Math.max(8, moon.diam / 3600 * D2R * fr.f);
      /* the lit edge faces the Sun */
      const toward = proj(fr, A.unit(A.sub(A.scl(moon.v, 1), A.scl(sun.v, -0.004)))) || mp;
      const ang = Math.atan2(toward.y - mp.y, toward.x - mp.x);
      drawMoonDisk(x, mp.x, mp.y, r, moon.illum, ang);
      if (M.names) label(x, mp, K.name("moon", M.lang), r, day, "planet");
    }
    /* north, east, south, west along the hills */
    x.font = `700 13px "Source Sans 3", sans-serif`; x.textAlign = "center";
    for (let k = 0; k < 8; k++) {
      const az = k * 45 * D2R, alt = (hzJS(az) - 3.2) * D2R, d = [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)];
      const p = projENU(fr, d); if (!p || out(p, fr)) continue;
      x.fillStyle = day ? "#e9f1f8" : k % 2 ? "rgba(233,216,166,.62)" : "#e9d8a6";
      x.fillText(DIR8[es ? "es" : "en"][k], p.x, p.y);
    }
    /* the selected object, and the telescope's field around it */
    if (M.sel) {
      const v = K.vec(fr.c, M.sel), p = v && proj(fr, v);
      if (p && !out(p, fr)) {
        x.strokeStyle = day ? "rgba(120,60,0,.9)" : "rgba(255,222,150,.92)"; x.lineWidth = 1.6;
        x.beginPath(); x.arc(p.x, p.y, 15, 0, 6.3); x.stroke();
        const fov = M.opts.fov ? M.opts.fov() : 1, rf = 2 * fr.f * Math.tan(fov * D2R / 4);
        if (rf > 22 && rf < fr.cw) { x.setLineDash([3, 5]); x.beginPath(); x.arc(p.x, p.y, rf, 0, 6.3); x.stroke(); x.setLineDash([]);
          x.font = `500 11px "Source Sans 3", sans-serif`; x.fillStyle = day ? "rgba(90,45,0,.9)" : "rgba(255,226,160,.9)"; x.textAlign = "center"; x.fillText(w("field"), p.x, p.y - rf - 6); }
      }
    }
  }
  function out(p, fr) { return p.x < -40 || p.y < -40 || p.x > fr.cw + 40 || p.y > fr.ch + 40; }
  function label(x, p, text, r, day, kind) {
    x.font = `${kind === "planet" ? 700 : 600} 12px "Source Sans 3", sans-serif`; x.textAlign = "left";
    x.fillStyle = day ? "rgba(70,40,0,.92)" : "rgba(255,226,170,.92)";
    x.fillText(text, p.x + r + 5, p.y + 4);
  }
  function drawMoonDisk(x, cx, cy, r, k, ang) {
    x.save(); x.translate(cx, cy); x.rotate(ang);
    x.fillStyle = "rgba(60,64,72,.85)"; x.beginPath(); x.arc(0, 0, r, 0, 6.3); x.fill();
    /* lit part: half disk toward +x plus/minus an ellipse to the terminator */
    const e = (2 * k - 1) * r;
    x.fillStyle = "#f1ede2"; x.beginPath();
    x.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
    x.ellipse(0, 0, Math.abs(e), r, 0, Math.PI / 2, -Math.PI / 2, e > 0);
    x.fill();
    x.restore();
  }

  /* ── hands: drag, pinch, wheel, tap, keys ── */
  function bindPointer() {
    const st = M.el.stage;
    let start = null;
    st.addEventListener("pointerdown", M.pd = e => {
      if (e.target.closest(".sky-zoom")) return;
      st.setPointerCapture(e.pointerId); M.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (M.ptrs.size === 1) start = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
      M.drag = true; M.anim = null;
    });
    st.addEventListener("pointermove", M.pm = e => {
      if (!M.ptrs.has(e.pointerId)) return;
      const prev = M.ptrs.get(e.pointerId), now = { x: e.clientX, y: e.clientY };
      if (M.ptrs.size === 2) {
        const other = [...M.ptrs.entries()].find(([k]) => k !== e.pointerId)[1];
        const d0 = Math.hypot(prev.x - other.x, prev.y - other.y), d1 = Math.hypot(now.x - other.x, now.y - other.y);
        if (d0 > 10 && d1 > 10) { M.fov = Math.max(2, Math.min(150, M.fov * d0 / d1)); }
        if (start) start.moved += 99;
      } else {
        const k = M.fov / Math.min(st.clientWidth, st.clientHeight) * 1.0, dx = now.x - prev.x, dy = now.y - prev.y;
        M.az = A.n360(M.az - dx * k / Math.max(0.25, Math.cos(M.alt * D2R) * 0.6 + 0.4)); M.alt = Math.max(-8, Math.min(89.9, M.alt + dy * k));
        if (start) start.moved += Math.abs(dx) + Math.abs(dy);
      }
      M.ptrs.set(e.pointerId, now);
      requestRender();
    });
    const up = M.pu = e => {
      if (!M.ptrs.has(e.pointerId)) return;
      M.ptrs.delete(e.pointerId);
      if (M.ptrs.size === 0) {
        M.drag = false;
        if (start && start.moved < 8 && performance.now() - start.t < 600 && e.type === "pointerup") {
          const r = st.getBoundingClientRect(); tap(e.clientX - r.left, e.clientY - r.top);
        }
        start = null; saveView(); requestRender();
      }
    };
    st.addEventListener("pointerup", up); st.addEventListener("pointercancel", up);
    st.addEventListener("wheel", M.wh = e => { e.preventDefault(); zoom(Math.exp(e.deltaY * 0.0012)); }, { passive: false });
    st.addEventListener("keydown", M.kd = e => {
      const k = e.key, s = M.fov / 12;
      if (k === "ArrowLeft") M.az = A.n360(M.az - s); else if (k === "ArrowRight") M.az = A.n360(M.az + s);
      else if (k === "ArrowUp") M.alt = Math.min(89.9, M.alt + s); else if (k === "ArrowDown") M.alt = Math.max(-8, M.alt - s);
      else if (k === "+" || k === "=") return zoom(1 / 1.3); else if (k === "-") return zoom(1.3); else return;
      e.preventDefault(); saveView(); requestRender();
    });
  }
  function zoom(f) { M.fov = Math.max(2, Math.min(150, M.fov * f)); saveView(); requestRender(); }
  function tap(px, py) {
    const fr = frame(), D = K.data(), L = limitNow(fr);
    let best = null, bd = 26;
    const consider = (id, v, bonus) => { const p = proj(fr, v); if (!p || !p.up) return; const d = Math.hypot(p.x - px, p.y - py) - bonus; if (d < bd) { bd = d; best = id; } };
    consider("moon", A.moon(fr.c).v, 8); consider("sun", A.sun(fr.c).v, 8);
    A.PLANETS.forEach(id => { const p = A.planet(fr.c, id); if (p.mag < L.lim + 0.5) consider(id, p.v, 6); });
    D.dso.forEach(o => { if (o.id !== "GC" && o.id !== "NGC 869" && o.id !== "NGC 884" && (o.mag < 7.5 || M.fov < 30)) consider("dso:" + o.id, o.v, 2); });
    for (let i = 0; i < D.n && D.mag[i] <= Math.min(L.lim, 6.5); i++) consider("star:" + i, K.starVec(i), Math.max(0, 3 - D.mag[i]));
    if (best) select(best); else { M.sel = null; M.el.card.hidden = true; requestRender(); }
  }
  function select(id) { M.sel = id; card(id); requestRender(); }
  function card(id) {
    const ms = K.now(), c = A.at(ms, K.ST.lat, K.ST.lon), v = K.vec(c, id), h = A.horiz(c, v), es = M.lang === "es";
    const e = K.events(id, ms - 12 * 3600000);
    const ev = K.events(id, ms);
    const mag = K.magOf(c, id);
    const conI = K.constellationOf(id), con = conI ? K.conName(conI, M.lang) : "";
    const where = h.alt > 0 ? `${Math.round(h.alt)}° ${w("upNow")}, ${K.dirWord(h.az, M.lang)}` : w("below");
    let times = "";
    if (ev.always) times = w("allnight"); else if (ev.never) times = w("never");
    else times = [ev.rise ? `${w("rises")} ${K.fmtTime(ev.rise, M.lang)}` : "", h.alt > 0 || ev.rise ? `${w("high")} ${K.fmtTime(ev.transit, M.lang)}` : "", ev.set ? `${w("sets")} ${K.fmtTime(ev.set, M.lang)}` : ""].filter(Boolean).join(" · ");
    const bid = K.benchId(id);
    M.el.card.hidden = false;
    M.el.card.innerHTML = `<p class="kicker">${w("sel")}</p><h3>${K.name(id, M.lang)}</h3>
      <p class="sky-kind">${K.kind(c, id, M.lang)}${con ? (es ? " · en " : " · in ") + con : ""}</p>
      <p class="note-line">${where}${mag < 50 ? " · " + w("mag") + " " + mag.toFixed(1) : ""}</p>
      <p class="note-line">${times}</p>
      ${id === "sun" ? `<p class="note-line sky-warn">${w("sunWarn")}</p>` : ""}
      <div class="lesson-acts"><button type="button" class="btn btn-steel sky-point">${w("point")}</button><button type="button" class="btn sky-close">${w("close")}</button></div>`;
    M.el.card.querySelector(".sky-close").onclick = () => { M.sel = null; M.el.card.hidden = true; requestRender(); };
    M.el.card.querySelector(".sky-point").onclick = () => pointAt(id);
    void bid; void e;
  }
  /* turn the view to an object: instantly, or with one short eased move */
  function centerOn(id, ease, done) {
    const fr = frame(), v = K.vec(fr.c, id), h = A.horiz(fr.c, v);
    const to = { az: h.az, alt: Math.max(-6, Math.min(89.9, h.alt)), fov: ease ? Math.min(M.fov, 40) : M.fov };
    if (!ease || STILL) { M.az = to.az; M.alt = to.alt; M.fov = to.fov; saveView(); requestRender(); if (done) setTimeout(done, 0); return; }
    let daz = ((to.az - M.az + 540) % 360) - 180;
    M.anim = { t0: performance.now(), az0: M.az, daz, alt0: M.alt, dalt: to.alt - M.alt, f0: M.fov, df: to.fov - M.fov, dur: 900, done };
    requestRender();
  }
  function stepAnim(t) {
    const a = M.anim, u = Math.min(1, (performance.now() - a.t0) / a.dur), e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    M.az = A.n360(a.az0 + a.daz * e); M.alt = a.alt0 + a.dalt * e; M.fov = a.f0 + a.df * e;
    if (u >= 1) { M.anim = null; saveView(); if (a.done) setTimeout(a.done, 120); }
  }
  function pointAt(id) { M.sel = id; centerOn(id, true, () => { if (M && M.opts.onPoint) M.opts.onPoint(id); }); }

  function close() {
    if (!M) return;
    saveView();
    if (M.raf) cancelAnimationFrame(M.raf);
    window.removeEventListener("resize", M.onResize);
    const gl = M.gl;
    if (gl) {
      try {
        [M.quad, M.stars].forEach(b => b && gl.deleteBuffer(b)); if (M.tex) gl.deleteTexture(M.tex);
        [M.pBg, M.pSt].forEach(p => { if (p) { (p._sh || []).forEach(s => gl.deleteShader(s)); gl.deleteProgram(p); } });
        const ext = gl.getExtension("WEBGL_lose_context"); if (ext) ext.loseContext();
      } catch (e) {}
    }
    M = null;
    window.AOGMap.released = (window.AOGMap.released || 0) + 1;
  }
  window.AOGMap = { open, close, isOpen, relabel, select, pointAt, centerOn, state: () => M, hz: hzJS };
})();
