/* AOG-CALM-ENHANCE-V4
   Quiet Space instruments. One object, real motion, almost no copy.
   Cream, gold, navy. Stop is always allowed. EN/ES. Nothing leaves the device. */
(function(){
  "use strict";
  if (window._aogCalmV4) return;

  function lang(){
    try{
      var el=document.documentElement;
      if(el.lang==="es"||el.getAttribute("data-lang")==="es"||window.lang==="es") return "es";
    }catch(e){}
    return "en";
  }
  function T(en,es){ return lang()==="es"?es:en; }
  function reduced(){ try{ return matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){ return false; } }

  var _raf=0,_int=0;
  function kill(){
    if(_raf){ cancelAnimationFrame(_raf); _raf=0; }
    if(_int){ clearInterval(_int); _int=0; }
    if(window._toolTimer){
      try{ cancelAnimationFrame(window._toolTimer); }catch(e){}
      try{ clearTimeout(window._toolTimer); }catch(e){}
      try{ clearInterval(window._toolTimer); }catch(e){}
      window._toolTimer=null;
    }
  }
  function loop(fn){
    kill();
    var t0=performance.now();
    function frame(now){
      fn(now, (now-t0)/1000);
      _raf=requestAnimationFrame(frame);
      window._toolTimer=_raf;
    }
    _raf=requestAnimationFrame(frame);
  }

  function css(){
    if(document.getElementById("aog-calm-css")) return;
    var s=document.createElement("style"); s.id="aog-calm-css";
    s.textContent=[
      ".ac{max-width:22rem;margin:0 auto;text-align:center;color:#1a232c}",
      ".ac canvas.st{display:block;width:100%;height:auto;margin:0 auto;touch-action:none;cursor:pointer}",
      ".ac .line{margin:.85rem 0 0;font-size:1.02rem;font-weight:550;letter-spacing:.01em;min-height:1.35em}",
      ".ac .soft{margin:.2rem 0 0;font-size:.82rem;color:#7a7368;min-height:1.1em}",
      ".ac .acts{display:flex;gap:.75rem;justify-content:center;align-items:center;margin-top:.9rem}",
      ".ac .ghost{appearance:none;background:none;border:0;color:#7a7368;font:inherit;cursor:pointer;padding:.35rem .5rem}",
      ".ac .ghost:focus{outline:2px solid #C9A227;outline-offset:2px}",
      ".ac .picks{display:flex;flex-wrap:wrap;justify-content:center;gap:.35rem;margin-top:.7rem}",
      ".ac .picks button{appearance:none;border:0;background:transparent;color:#7a7368;font:inherit;cursor:pointer;padding:.2rem .55rem;border-radius:999px}",
      ".ac .picks button.on{color:#0A1E33;background:#f3e2a8}"
    ].join("");
    document.head.appendChild(s);
  }
  function box(inner){ css(); return '<div class="ac">'+inner+"</div>"; }

  /* retina canvas: draw in CSS pixels via setTransform */
  function ink(canvas){
    var r=canvas.getBoundingClientRect();
    var cssW=r.width||canvas.clientWidth||280;
    var cssH=r.height||(cssW*(canvas.height&&canvas.width?canvas.height/canvas.width:1));
    var dpr=Math.min(2, window.devicePixelRatio||1);
    var pxW=Math.max(1,Math.round(cssW*dpr)), pxH=Math.max(1,Math.round(cssH*dpr));
    if(canvas.width!==pxW||canvas.height!==pxH){ canvas.width=pxW; canvas.height=pxH; }
    var ctx=canvas.getContext("2d");
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return {ctx:ctx, w:cssW, h:cssH};
  }
  function easeInOut(t){ return t<.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2; }
  function easeOut(t){ return 1-Math.pow(1-t,3); }

  /* ═══════════════════════════════════════════
     1. BREATHE — a lung of light
     ═══════════════════════════════════════════ */
  function buildBreath(){
    return box(
      '<canvas class="st" id="acB" width="560" height="560" style="max-width:280px"></canvas>'+
      '<p class="line" id="acBl">'+T("The circle is the breath.","El círculo es el respiro.")+'</p>'+
      '<p class="soft" id="acBs"></p>'+
      '<div class="acts"><button type="button" class="btn btn-accent" id="acBgo">'+T("Begin","Empezar")+'</button>'+
      '<button type="button" class="ghost" id="acBx">'+T("Stop","Parar")+'</button></div>'
    );
  }
  function initBreath(){
    var c=document.getElementById("acB"); if(!c) return;
    var run=false, t0=0, round=0;
    var IN=4, HOLD=7, OUT=8, CYCLE=IN+HOLD+OUT;
    function draw(p, phase, n){
      var S=ink(c), ctx=S.ctx, w=S.w, h=S.h, cx=w/2, cy=h/2;
      ctx.clearRect(0,0,w,h);
      ctx.beginPath(); ctx.arc(cx,cy,Math.min(w,h)*0.46,0,Math.PI*2);
      ctx.strokeStyle="rgba(26,35,44,.12)"; ctx.lineWidth=1; ctx.stroke();
      var R=Math.min(w,h)*(0.16+p*0.26);
      var g=ctx.createRadialGradient(cx-R*0.18, cy-R*0.22, R*0.05, cx, cy, R);
      g.addColorStop(0,"#fbf3d2"); g.addColorStop(0.45,"#e8c86a"); g.addColorStop(1,"#b8891c");
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      ctx.beginPath(); ctx.arc(cx-R*0.22, cy-R*0.28, R*0.18, 0, Math.PI*2);
      ctx.fillStyle="rgba(255,255,255,.28)"; ctx.fill();
      var frac = phase==="in"? n/IN : phase==="hold"? n/HOLD : n/OUT;
      ctx.beginPath();
      ctx.arc(cx,cy, Math.min(w,h)*0.46, -Math.PI/2, -Math.PI/2 + Math.PI*2*(1-frac));
      ctx.strokeStyle="rgba(10,30,51,.22)"; ctx.lineWidth=2; ctx.stroke();
    }
    draw(0.28,"in",4);
    function frame(now){
      if(!run) return;
      var t=(now-t0)/1000, local=t%CYCLE, phase, u, p, n;
      if(local<IN){ phase="in"; u=local/IN; p=easeOut(u); n=Math.max(1,Math.ceil(IN-local)); }
      else if(local<IN+HOLD){ phase="hold"; u=(local-IN)/HOLD; p=1; n=Math.max(1,Math.ceil(IN+HOLD-local)); }
      else { phase="out"; u=(local-IN-HOLD)/OUT; p=1-easeInOut(u); n=Math.max(1,Math.ceil(CYCLE-local)); }
      if(t>=CYCLE*3){ run=false; kill(); draw(0.28,"in",4);
        var el=document.getElementById("acBl"); if(el) el.textContent=T("Three. That’s enough.","Tres. Eso basta.");
        return;
      }
      draw(p, phase, n);
      var line=document.getElementById("acBl");
      if(line) line.textContent = phase==="in"?T("In","Entra"): phase==="hold"?T("Hold","Sostén"):T("Out","Sale");
      var soft=document.getElementById("acBs");
      if(soft) soft.textContent = T("·  ·  ·","·  ·  ·");
    }
    document.getElementById("acBgo").onclick=function(){ kill(); run=true; t0=performance.now(); loop(frame); };
    document.getElementById("acBx").onclick=function(){ run=false; kill(); draw(0.28,"in",4); var el=document.getElementById("acBl"); if(el) el.textContent=T("Stopped.","Parado."); };
  }

  /* ═══════════════════════════════════════════
     2. GROUND — a room, then the senses
     ═══════════════════════════════════════════ */
  function buildGround(){
    return box(
      '<canvas class="st" id="acG" width="560" height="400"></canvas>'+
      '<p class="line" id="acGl">'+T("Tap five things you can see.","Toca cinco cosas que ves.")+'</p>'+
      '<p class="soft" id="acGs">·····</p>'
    );
  }
  function initGround(){
    var c=document.getElementById("acG"); if(!c) return;
    var hits=[], stage=0, count=0;
    var need=[5,4,3,2,1];
    var ask=[
      [T("Tap five things you can see.","Toca cinco cosas que ves.")],
      [T("Four things you can feel from here.","Cuatro cosas que sientes desde aquí.")],
      [T("Three sounds. Tap for each.","Tres sonidos. Toca por cada uno.")],
      [T("Two smells — even the air.","Dos olores — aunque sea el aire.")],
      [T("One taste. Then you are here.","Un sabor. Entonces estás aquí.")]
    ];
    var objects=[
      {x:.22,y:.32,r:.09}, {x:.78,y:.30,r:.09}, {x:.5,y:.28,r:.07},
      {x:.8,y:.68,r:.1}, {x:.28,y:.7,r:.11}
    ];
    function draw(pulse){
      var S=ink(c), ctx=S.ctx, w=S.w, h=S.h;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle="#efe8da"; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle="#1a232c"; ctx.lineWidth=1.6;
      /* window L */
      ctx.fillStyle="#d5e4f0"; ctx.fillRect(w*0.1,h*0.14,w*0.24,h*0.32);
      ctx.strokeRect(w*0.1,h*0.14,w*0.24,h*0.32);
      ctx.beginPath(); ctx.moveTo(w*0.22,h*0.14); ctx.lineTo(w*0.22,h*0.46); ctx.moveTo(w*0.1,h*0.3); ctx.lineTo(w*0.34,h*0.3); ctx.stroke();
      /* window R */
      ctx.fillStyle="#d5e4f0"; ctx.fillRect(w*0.66,h*0.14,w*0.24,h*0.32);
      ctx.strokeRect(w*0.66,h*0.14,w*0.24,h*0.32);
      /* lamp */
      ctx.beginPath(); ctx.arc(w*0.5, h*0.26, h*0.055, 0, Math.PI*2); ctx.fillStyle="#f3e2a8"; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w*0.5,h*0.315); ctx.lineTo(w*0.5,h*0.42); ctx.stroke();
      /* plant */
      ctx.fillStyle="#6e8a5a";
      ctx.beginPath(); ctx.ellipse(w*0.24,h*0.68,w*0.08,h*0.07,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle="#c4a574"; ctx.fillRect(w*0.2,h*0.74,w*0.08,h*0.08); ctx.strokeRect(w*0.2,h*0.74,w*0.08,h*0.08);
      /* chair */
      ctx.fillStyle="#c9b48a"; ctx.fillRect(w*0.7,h*0.55,w*0.16,h*0.28); ctx.strokeRect(w*0.7,h*0.55,w*0.16,h*0.28);
      ctx.fillRect(w*0.7,h*0.78,w*0.16,h*0.04);
      /* floor line */
      ctx.beginPath(); ctx.moveTo(0,h*0.86); ctx.lineTo(w,h*0.86); ctx.stroke();
      hits.forEach(function(p){
        ctx.beginPath(); ctx.arc(p.x,p.y, 7+(pulse||0)*3, 0, Math.PI*2);
        ctx.fillStyle="rgba(201,162,39,.85)"; ctx.fill();
      });
    }
    function dots(){
      var s=""; for(var i=0;i<need[stage];i++) s += i<count?"●":"○";
      var el=document.getElementById("acGs"); if(el) el.textContent=s;
      var l=document.getElementById("acGl"); if(l) l.textContent=ask[stage][0];
    }
    draw(0); dots();
    c.onclick=function(ev){
      var r=c.getBoundingClientRect();
      var x=(ev.clientX-r.left), y=(ev.clientY-r.top);
      hits.push({x:x,y:y}); if(hits.length>12) hits.shift();
      count++;
      if(count>=need[stage]){
        if(stage>=4){
          var l=document.getElementById("acGl"); if(l) l.textContent=T("You are in this room.","Estás en este cuarto.");
          document.getElementById("acGs").textContent="";
          draw(0); return;
        }
        stage++; count=0; hits=[];
      }
      draw(1); dots();
    };
  }

  /* ═══════════════════════════════════════════
     3. BODY — tension as gold, then it leaves
     ═══════════════════════════════════════════ */
  var PMR=[
    {en:"Feet",es:"Pies"},{en:"Calves",es:"Pantorrillas"},{en:"Thighs",es:"Muslos"},
    {en:"Belly",es:"Panza"},{en:"Hands",es:"Manos"},{en:"Shoulders",es:"Hombros"},
    {en:"Jaw",es:"Mandíbula"},{en:"Everything",es:"Todo"}
  ];
  function buildPMR(){
    return box(
      '<canvas class="st" id="acP" width="360" height="560" style="max-width:200px"></canvas>'+
      '<p class="line" id="acPl">'+T("Gold is the squeeze. Then it leaves.","El oro es el apretón. Luego se va.")+'</p>'+
      '<p class="soft" id="acPs"></p>'+
      '<div class="acts"><button type="button" class="btn btn-accent" id="acPgo">'+T("From the feet","Desde los pies")+'</button>'+
      '<button type="button" class="ghost" id="acPx">'+T("Stop","Parar")+'</button></div>'
    );
  }
  function initPMR(){
    var c=document.getElementById("acP"); if(!c) return;
    var i=0, mode="idle", t0=0, on=false;
    function figure(ctx,w,h, lit, tight){
      var cx=w/2, s=tight?0.94:1;
      ctx.save(); ctx.translate(cx,h*0.5); ctx.scale(s,s); ctx.translate(-cx,-h*0.5);
      function fill(name, draw){
        ctx.beginPath(); draw();
        ctx.fillStyle = (lit==="all"||lit===name)? "#C9A227" : "#f4eee2";
        ctx.strokeStyle="#1a232c"; ctx.lineWidth=1.8; ctx.fill(); ctx.stroke();
      }
      fill("jaw", function(){ ctx.ellipse(cx, h*0.13, 18, 20, 0,0,Math.PI*2); });
      fill("shoulders", function(){ ctx.roundRect(cx-48, h*0.24, 96, 18, 9); });
      fill("hands", function(){ ctx.ellipse(cx-58, h*0.38, 10, 10, 0,0,Math.PI*2); ctx.ellipse(cx+58, h*0.38, 10, 10, 0,0,Math.PI*2); });
      fill("belly", function(){ ctx.ellipse(cx, h*0.42, 28, 26, 0,0,Math.PI*2); });
      fill("thighs", function(){ ctx.roundRect(cx-22, h*0.54, 18, 52, 8); ctx.roundRect(cx+4, h*0.54, 18, 52, 8); });
      fill("feet", function(){ ctx.ellipse(cx-14, h*0.9, 16, 8, 0,0,Math.PI*2); ctx.ellipse(cx+14, h*0.9, 16, 8, 0,0,Math.PI*2); });
      /* calves share thighs column */
      if(lit==="calves"||lit==="all"){
        ctx.beginPath(); ctx.roundRect(cx-20, h*0.72, 14, 40, 7); ctx.roundRect(cx+6, h*0.72, 14, 40, 7);
        ctx.fillStyle="#C9A227"; ctx.fill(); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.roundRect(cx-20, h*0.72, 14, 40, 7); ctx.roundRect(cx+6, h*0.72, 14, 40, 7);
        ctx.fillStyle="#f4eee2"; ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    }
    function draw(lit, tight){
      var S=ink(c), ctx=S.ctx;
      ctx.clearRect(0,0,S.w,S.h);
      if(!ctx.roundRect) ctx.roundRect=function(x,y,w,h,r){ this.rect(x,y,w,h); };
      figure(ctx,S.w,S.h,lit,tight);
    }
    draw("", false);
    function frame(now){
      if(!on) return;
      var t=(now-t0)/1000;
      if(i>=PMR.length){ on=false; kill(); draw("",false); document.getElementById("acPl").textContent=T("Loose.","Suelto."); return; }
      var p=PMR[i];
      if(t<5){ draw(p.en==="Everything"?"all": p.en.toLowerCase(), true);
        document.getElementById("acPl").textContent=T("Squeeze — "+p.en, "Aprieta — "+p.es);
        document.getElementById("acPs").textContent=String(Math.ceil(5-t));
      } else if(t<7.2){ draw(p.en==="Everything"?"all": p.en.toLowerCase(), false);
        document.getElementById("acPl").textContent=T("Let go.","Suelta.");
        document.getElementById("acPs").textContent="";
      } else { i++; t0=now; }
    }
    document.getElementById("acPgo").onclick=function(){ kill(); on=true; i=0; t0=performance.now(); loop(frame); };
    document.getElementById("acPx").onclick=function(){ on=false; kill(); draw("",false); document.getElementById("acPl").textContent=T("Stopped.","Parado."); };
  }

  /* ═══════════════════════════════════════════
     4. TAP — butterfly, contact flash
     ═══════════════════════════════════════════ */
  function buildBil(){
    return box(
      '<canvas class="st" id="acL" width="420" height="520" style="max-width:220px"></canvas>'+
      '<p class="line" id="acLl">'+T("Cross your arms. Right hand on left shoulder.","Cruza los brazos. Mano derecha al hombro izquierdo.")+'</p>'+
      '<p class="soft" id="acLs">'+T("Tap when the gold lands.","Toca cuando cae el oro.")+'</p>'+
      '<div class="acts"><button type="button" class="btn btn-accent" id="acLgo">'+T("Tap with me","Toca conmigo")+'</button>'+
      '<button type="button" class="ghost" id="acLx">'+T("Stop","Parar")+'</button></div>'
    );
  }
  function initBil(){
    var c=document.getElementById("acL"); if(!c) return;
    var run=false, t0=0, taps=0;
    function roundRect(ctx,x,y,w,h,r){
      if(ctx.roundRect){ ctx.roundRect(x,y,w,h,r); return; }
      ctx.rect(x,y,w,h);
    }
    function draw(side, press){
      var S=ink(c), ctx=S.ctx, w=S.w, h=S.h, cx=w/2;
      ctx.clearRect(0,0,w,h);
      ctx.lineJoin="round"; ctx.lineCap="round";
      var lsx=cx-w*0.20, rsz=cx+w*0.20, shy=h*0.38;
      var Lpress = (side===0)? press : 0;
      var Rpress = (side===1)? press : 0;
      /* head */
      ctx.beginPath(); ctx.arc(cx, h*0.16, w*0.11, 0, Math.PI*2);
      ctx.fillStyle="#efe8da"; ctx.fill(); ctx.strokeStyle="#1a232c"; ctx.lineWidth=2; ctx.stroke();
      /* neck */
      ctx.beginPath(); ctx.moveTo(cx-8,h*0.26); ctx.lineTo(cx+8,h*0.26); ctx.lineTo(cx+10,h*0.33); ctx.lineTo(cx-10,h*0.33); ctx.closePath(); ctx.fill(); ctx.stroke();
      /* torso */
      ctx.beginPath();
      ctx.moveTo(cx-w*0.22, h*0.36);
      ctx.quadraticCurveTo(cx, h*0.34, cx+w*0.22, h*0.36);
      ctx.quadraticCurveTo(cx+w*0.24, h*0.62, cx+w*0.16, h*0.84);
      ctx.lineTo(cx-w*0.16, h*0.84);
      ctx.quadraticCurveTo(cx-w*0.24, h*0.62, cx-w*0.22, h*0.36);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      /* crossed arms: right arm to LEFT shoulder (under), left arm to RIGHT shoulder (over) */
      function arm(fromX, toX, y, under){
        ctx.beginPath();
        ctx.moveTo(fromX, y);
        ctx.quadraticCurveTo(cx, y+h*0.10, toX, y+6);
        ctx.strokeStyle="#1a232c"; ctx.lineWidth=under?10:12; ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fromX, y);
        ctx.quadraticCurveTo(cx, y+h*0.10, toX, y+6);
        ctx.strokeStyle="#efe8da"; ctx.lineWidth=under?6:8; ctx.stroke();
      }
      arm(rsz, lsx, shy, true);
      arm(lsx, rsz, shy+8, false);
      function hand(x, y, on, p){
        var s=1-p*0.18;
        ctx.save(); ctx.translate(x,y); ctx.scale(s,s); ctx.translate(-x,-y);
        ctx.beginPath(); ctx.ellipse(x, y, 16, 13, 0.2, 0, Math.PI*2);
        ctx.fillStyle=on?"#C9A227":"#efe8da"; ctx.fill();
        ctx.strokeStyle="#1a232c"; ctx.lineWidth=2; ctx.stroke();
        if(on && p>0.15){
          ctx.beginPath(); ctx.arc(x,y, 22+p*16, 0, Math.PI*2);
          ctx.strokeStyle="rgba(201,162,39,"+(p*0.55)+")"; ctx.lineWidth=2.5; ctx.stroke();
        }
        ctx.restore();
      }
      /* right hand lands on LEFT shoulder; left hand on RIGHT */
      hand(lsx, shy+4, side===0, Lpress);
      hand(rsz, shy+10, side===1, Rpress);
      ctx.fillStyle="#1a232c";
      ctx.font="600 11px ui-sans-serif,system-ui,sans-serif";
      ctx.textAlign="center";
      if(run){
        ctx.globalAlpha=0.55;
        ctx.fillText(side===0?T("LEFT","IZQ"):T("RIGHT","DER"), side===0?lsx:rsz, shy-28);
        ctx.globalAlpha=1;
      }
    }
    draw(0,0);
    function frame(now){
      if(!run) return;
      var beat=820;
      var t=(now-t0)/beat, side=Math.floor(t)%2, u=t%1;
      var press = u<0.18 ? u/0.18 : u<0.45 ? 1 : Math.max(0,1-(u-0.45)/0.55);
      if(u<0.02) taps++;
      draw(side, press);
      var n=document.getElementById("acLs");
      if(n) n.textContent = T("Left, right, left… match it.","Izquierda, derecha… síguelo.");
    }
    document.getElementById("acLgo").onclick=function(){
      kill(); run=true; t0=performance.now(); taps=0;
      document.getElementById("acLl").textContent=T("Arms crossed. Tap with the gold.","Brazos cruzados. Toca con el oro.");
      loop(frame);
    };
    document.getElementById("acLx").onclick=function(){
      run=false; kill(); draw(0,0);
      document.getElementById("acLl").textContent=T("Hands rest on your shoulders.","Manos en descanso, en los hombros.");
      document.getElementById("acLs").textContent="";
    };
  }

  /* ═══════════════════════════════════════════
     5. MOVE — the ring is the clock
     ═══════════════════════════════════════════ */
  var MOVES=[
    {s:10,en:"Hands — shake from the wrist",es:"Manos — desde la muñeca"},
    {s:10,en:"Shoulders — slow circles",es:"Hombros — círculos lentos"},
    {s:12,en:"Bounce — small",es:"Rebota — chico"},
    {s:10,en:"Whole self — then stop",es:"Todo — y para"}
  ];
  function buildMove(){
    return box(
      '<canvas class="st" id="acM" width="560" height="560" style="max-width:240px"></canvas>'+
      '<p class="line" id="acMl">'+T(MOVES[0].en,MOVES[0].es)+'</p>'+
      '<div class="acts"><button type="button" class="btn btn-accent" id="acMgo">'+T("Begin","Empezar")+'</button>'+
      '<button type="button" class="ghost" id="acMk">'+T("Skip","Saltar")+'</button>'+
      '<button type="button" class="ghost" id="acMx">'+T("Stop","Parar")+'</button></div>'
    );
  }
  function initMove(){
    var c=document.getElementById("acM"); if(!c) return;
    var i=0, t0=0, run=false;
    function draw(p, n){
      var S=ink(c), ctx=S.ctx, w=S.w, cx=w/2, cy=w/2, R=w*0.38;
      ctx.clearRect(0,0,w,w);
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.strokeStyle="rgba(26,35,44,.12)"; ctx.lineWidth=10; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,cy,R,-Math.PI/2, -Math.PI/2+Math.PI*2*p);
      ctx.strokeStyle="#C9A227"; ctx.lineWidth=10; ctx.lineCap="round"; ctx.stroke();
      ctx.fillStyle="#0A1E33"; ctx.font="600 "+Math.round(w*0.16)+"px Georgia,serif";
      ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(String(n), cx, cy+4);
    }
    function show(){
      var m=MOVES[i];
      if(!m){ draw(0,"·"); document.getElementById("acMl").textContent=T("Notice.","Nota."); return; }
      document.getElementById("acMl").textContent=T(m.en,m.es);
      draw(1,m.s);
    }
    function frame(now){
      if(!run) return;
      var m=MOVES[i]; if(!m){ run=false; kill(); show(); return; }
      var u=(now-t0)/1000, left=Math.max(0, m.s-u);
      draw(left/m.s, Math.ceil(left));
      if(left<=0){ i++; t0=now; if(i>=MOVES.length){ run=false; kill(); show(); } }
    }
    document.getElementById("acMgo").onclick=function(){ kill(); run=true; i=0; t0=performance.now(); loop(frame); };
    document.getElementById("acMk").onclick=function(){ i++; t0=performance.now(); if(i>=MOVES.length){ run=false; kill(); show(); } };
    document.getElementById("acMx").onclick=function(){ run=false; kill(); document.getElementById("acMl").textContent=T("Stopped.","Parado."); };
    show();
  }

  /* ═══════════════════════════════════════════
     6. PLACE — light, land, a seat, you
     ═══════════════════════════════════════════ */
  function buildSafe(){
    return box(
      '<canvas class="st" id="acS" width="560" height="360"></canvas>'+
      '<p class="line" id="acSl">'+T("Tap. The place arrives.","Toca. El lugar llega.")+'</p>'
    );
  }
  function initSafe(){
    var c=document.getElementById("acS"); if(!c) return;
    var n=0;
    var lines=[
      T("A horizon.","Un horizonte."),
      T("Light.","Luz."),
      T("Something living.","Algo vivo."),
      T("A seat.","Un asiento."),
      T("You. Stay one breath.","Tú. Quédate un respiro.")
    ];
    function draw(){
      var S=ink(c), ctx=S.ctx, w=S.w, h=S.h;
      ctx.clearRect(0,0,w,h);
      var sky=ctx.createLinearGradient(0,0,0,h);
      sky.addColorStop(0, n>=2?"#c9dcea":"#d9d3c6");
      sky.addColorStop(1, n>=1?"#c5d4b8":"#d9d3c6");
      ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);
      if(n>=1){
        ctx.fillStyle="#8fa07a";
        ctx.beginPath(); ctx.moveTo(0,h*0.68); ctx.quadraticCurveTo(w*0.4,h*0.58,w,h*0.7); ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.fill();
      }
      if(n>=2){
        var g=ctx.createRadialGradient(w*0.78,h*0.22,4,w*0.78,h*0.22,h*0.22);
        g.addColorStop(0,"#f7e7b0"); g.addColorStop(1,"rgba(247,231,176,0)");
        ctx.fillStyle=g; ctx.fillRect(0,0,w,h*0.5);
        ctx.beginPath(); ctx.arc(w*0.78,h*0.22,h*0.07,0,Math.PI*2); ctx.fillStyle="#f3e2a8"; ctx.fill();
      }
      if(n>=3){
        ctx.fillStyle="#35553a";
        ctx.beginPath(); ctx.moveTo(w*0.18,h*0.68); ctx.quadraticCurveTo(w*0.28,h*0.22,w*0.38,h*0.68); ctx.fill();
        ctx.fillRect(w*0.265,h*0.62,w*0.03,h*0.1);
      }
      if(n>=4){
        ctx.fillStyle="#6b4a2a"; ctx.fillRect(w*0.58,h*0.72,w*0.2,h*0.045);
        ctx.fillRect(w*0.6,h*0.76,w*0.025,h*0.08); ctx.fillRect(w*0.74,h*0.76,w*0.025,h*0.08);
      }
      if(n>=5){
        ctx.fillStyle="#1a232c";
        ctx.beginPath(); ctx.arc(w*0.68,h*0.66,7,0,Math.PI*2); ctx.fill();
        ctx.fillRect(w*0.68-6,h*0.66,12,h*0.08);
      }
    }
    draw();
    c.onclick=function(){
      if(n<5) n++;
      draw();
      document.getElementById("acSl").textContent = n? lines[n-1] : lines[0];
    };
  }

  /* ═══════════════════════════════════════════
     7. FEEL — a wheel that blooms
     ═══════════════════════════════════════════ */
  var FEELS=[
    {en:"Mad",es:"Enojo", col:"#b85a4a", line_en:"Something mattered. One breath first.", line_es:"Algo importó. Un respiro primero."},
    {en:"Sad",es:"Triste", col:"#4f6f8f", line_en:"Let it be here. You don’t have to fix it.", line_es:"Déjalo estar. No tienes que arreglarlo."},
    {en:"Scared",es:"Miedo", col:"#6a5a8a", line_en:"One thing in this room that is safe.", line_es:"Una cosa en este cuarto que sí está segura."},
    {en:"Stuck",es:"Atasco", col:"#7a7a58", line_en:"The smallest next step.", line_es:"El paso más chico."},
    {en:"Tired",es:"Cansado", col:"#5a6e5a", line_en:"Tired is information.", line_es:"El cansancio es información."},
    {en:"Okay",es:"Bien", col:"#C9A227", line_en:"Okay counts. Stay a second.", line_es:"Bien cuenta. Quédate un segundo."}
  ];
  function buildFeel(){
    return box(
      '<canvas class="st" id="acF" width="560" height="560" style="max-width:260px"></canvas>'+
      '<p class="line" id="acFl">'+T("Closest word.","La palabra más cercana.")+'</p>'+
      '<p class="soft" id="acFs"></p>'
    );
  }
  function initFeel(){
    var c=document.getElementById("acF"); if(!c) return;
    var hit=-1, bloom=0;
    function draw(){
      var S=ink(c), ctx=S.ctx, w=S.w, cx=w/2, cy=w/2, R=w*0.4, n=FEELS.length;
      ctx.clearRect(0,0,w,w);
      FEELS.forEach(function(f,i){
        var a0=-Math.PI/2 + i*Math.PI*2/n, a1=a0+Math.PI*2/n;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R,a0,a1); ctx.closePath();
        ctx.fillStyle=f.col; ctx.globalAlpha = hit<0?0.92 : (i===hit?1:0.18);
        ctx.fill(); ctx.globalAlpha=1;
        ctx.strokeStyle="#F4EEE2"; ctx.lineWidth=3; ctx.stroke();
        var am=(a0+a1)/2;
        ctx.fillStyle="#fff"; ctx.font="650 13px ui-sans-serif,system-ui,sans-serif";
        ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(T(f.en,f.es), cx+Math.cos(am)*R*0.62, cy+Math.sin(am)*R*0.62);
      });
      ctx.beginPath(); ctx.arc(cx,cy, w*0.13, 0, Math.PI*2);
      ctx.fillStyle = hit<0? "#F4EEE2" : FEELS[hit].col;
      ctx.fill();
    }
    draw();
    c.onclick=function(ev){
      var r=c.getBoundingClientRect(), x=ev.clientX-r.left, y=ev.clientY-r.top;
      var dx=x-r.width/2, dy=y-r.height/2;
      var ang=Math.atan2(dy,dx)+Math.PI/2; if(ang<0) ang+=Math.PI*2;
      var i=Math.floor(ang/(Math.PI*2/FEELS.length));
      if(i<0||i>=FEELS.length) return;
      hit=i; draw();
      document.getElementById("acFl").textContent=T(FEELS[i].en, FEELS[i].es);
      document.getElementById("acFs").textContent=T(FEELS[i].line_en, FEELS[i].line_es);
    };
  }

  /* ═══════════════════════════════════════════
     8. HELP — tap the body, it drops
     ═══════════════════════════════════════════ */
  function buildCoreg(){
    return box(
      '<canvas class="st" id="acC" width="400" height="560" style="max-width:210px"></canvas>'+
      '<p class="line" id="acCl">'+T("They will borrow your nervous system. Lend a quiet one.","Van a tomar prestado tu sistema. Présta uno quieto.")+'</p>'+
      '<p class="soft" id="acCs">'+T("Starts tight. You let it go, one piece.","Empieza tenso. Tú lo sueltas, una pieza.")+'</p>'+
      '<div class="acts"><button type="button" class="btn btn-accent" id="acCgo">'+T("Walk me through","Guíame")+'</button>'+
      '<button type="button" class="ghost" id="acCx">'+T("Stop","Parar")+'</button></div>'
    );
  }
  function initCoreg(){
    var c=document.getElementById("acC"); if(!c) return;
    var pose={breath:0,jaw:0,sh:0,voice:0,face:0};
    var target={breath:0,jaw:0,sh:0,voice:0,face:0};
    var step=-1, t0=0, run=false, chestPhase=0;
    var STEPS=[
      {k:"breath", en:"One slow breath. Don’t talk yet.", es:"Un respiro lento. No hables aún."},
      {k:"jaw",    en:"Let the teeth part.", es:"Separa los dientes."},
      {k:"sh",     en:"Shoulders. They crept up. Drop them.", es:"Hombros. Se subieron. Bájalos."},
      {k:"voice",  en:"One full tone quieter than you think.", es:"Un tono más bajo de lo que crees."},
      {k:"face",   en:"Neutral is enough. You don’t have to smile.", es:"Neutral basta. No tienes que sonreír."}
    ];
    function draw(){
      var S=ink(c), ctx=S.ctx, w=S.w, h=S.h, cx=w/2;
      ctx.clearRect(0,0,w,h);
      ctx.lineJoin="round"; ctx.lineCap="round"; ctx.strokeStyle="#1a232c"; ctx.lineWidth=2;
      var shDrop=pose.sh*22;
      var shy=h*0.34-shDrop;
      var breath=0.92+pose.breath*(0.08+0.06*Math.sin(chestPhase));
      /* head */
      ctx.beginPath(); ctx.arc(cx, h*0.16, 26, 0, Math.PI*2);
      ctx.fillStyle="#efe8da"; ctx.fill(); ctx.stroke();
      /* brows: knit → flat */
      var knit=(1-pose.face)*7;
      ctx.beginPath();
      ctx.moveTo(cx-16, h*0.145-knit*0.15); ctx.lineTo(cx-5, h*0.145+knit*0.2);
      ctx.moveTo(cx+16, h*0.145-knit*0.15); ctx.lineTo(cx+5, h*0.145+knit*0.2);
      ctx.stroke();
      /* eyes */
      ctx.beginPath(); ctx.arc(cx-9, h*0.16, 2.2, 0, Math.PI*2); ctx.arc(cx+9, h*0.16, 2.2, 0, Math.PI*2);
      ctx.fillStyle="#1a232c"; ctx.fill();
      /* mouth: flat clench → open rest */
      ctx.beginPath();
      if(pose.jaw<0.4){
        ctx.moveTo(cx-8, h*0.195); ctx.lineTo(cx+8, h*0.195);
      } else {
        ctx.arc(cx, h*0.188, 8, 0.15*Math.PI, 0.85*Math.PI);
      }
      ctx.strokeStyle="#1a232c"; ctx.lineWidth=2; ctx.stroke();
      /* neck */
      ctx.beginPath(); ctx.moveTo(cx-8,h*0.22); ctx.lineTo(cx+8,h*0.22); ctx.lineTo(cx+11,shy-4); ctx.lineTo(cx-11,shy-4); ctx.closePath();
      ctx.fillStyle="#efe8da"; ctx.fill(); ctx.stroke();
      /* shoulders + torso */
      ctx.save();
      ctx.translate(cx, h*0.48); ctx.scale(breath, breath); ctx.translate(-cx, -h*0.48);
      ctx.beginPath();
      ctx.moveTo(cx-w*0.28, shy);
      ctx.quadraticCurveTo(cx, shy-10, cx+w*0.28, shy);
      ctx.quadraticCurveTo(cx+w*0.26, h*0.62, cx+w*0.14, h*0.78);
      ctx.lineTo(cx-w*0.14, h*0.78);
      ctx.quadraticCurveTo(cx-w*0.26, h*0.62, cx-w*0.28, shy);
      ctx.closePath();
      ctx.fillStyle="#efe8da"; ctx.fill(); ctx.stroke();
      ctx.restore();
      /* gold on active */
      if(run && step>=0){
        var k=STEPS[step].k, hx=cx, hy=h*0.16, hr=18;
        if(k==="jaw"){ hy=h*0.195; hr=16; }
        if(k==="sh"){ hy=shy; hr=28; }
        if(k==="breath"){ hy=h*0.5; hr=36; }
        if(k==="voice"){ hy=h*0.88; hr=22; }
        if(k==="face"){ hy=h*0.15; hr=30; }
        ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI*2);
        ctx.strokeStyle="rgba(201,162,39,.55)"; ctx.lineWidth=2; ctx.stroke();
      }
      /* voice line */
      var amp=18*(1-pose.voice*0.78);
      ctx.beginPath(); ctx.moveTo(28, h*0.9);
      for(var x=28;x<w-28;x+=4){
        var jag = pose.voice<0.5 ? (x%16<8?1:-1)*amp*0.25 : 0;
        ctx.lineTo(x, h*0.9 + Math.sin(x/10)*amp + jag);
      }
      ctx.strokeStyle="#1a232c"; ctx.lineWidth=2; ctx.stroke();
    }
    function setStep(i){
      step=i;
      ["breath","jaw","sh","voice","face"].forEach(function(k){ target[k]=0; });
      for(var j=0;j<=i && j<STEPS.length;j++) target[STEPS[j].k]=1;
      var s=STEPS[i];
      document.getElementById("acCl").textContent=T(s.en,s.es);
      document.getElementById("acCs").textContent=(i+1)+" / 5";
    }
    function frame(now, sec){
      chestPhase=sec*2.2;
      var keys=["breath","jaw","sh","voice","face"], done=true;
      keys.forEach(function(k){
        var d=target[k]-pose[k];
        if(Math.abs(d)>0.002){ pose[k]+=d*0.07; done=false; } else pose[k]=target[k];
      });
      if(run && step>=0){
        var hold= (STEPS[step].k==="breath")? 7 : 4.2;
        if(sec-t0>hold){
          if(step<STEPS.length-1){ t0=sec; setStep(step+1); }
          else { run=false; document.getElementById("acCl").textContent=T("Now you can turn to them.","Ahora sí puedes voltear a ellos."); document.getElementById("acCs").textContent=""; }
        }
      }
      draw();
    }
    draw();
    document.getElementById("acCgo").onclick=function(){
      pose={breath:0,jaw:0,sh:0,voice:0,face:0};
      target={breath:0,jaw:0,sh:0,voice:0,face:0};
      kill(); run=true; t0=0; setStep(0);
      loop(function(now,sec){ if(t0===0) t0=sec; frame(now,sec); });
    };
    document.getElementById("acCx").onclick=function(){
      run=false; kill();
      document.getElementById("acCl").textContent=T("Stopped. That’s allowed.","Parado. Eso vale.");
    };
    c.onclick=function(ev){
      var r=c.getBoundingClientRect(), y=(ev.clientY-r.top)/r.height;
      var k = y<0.28?"face": y<0.36?"jaw": y<0.46?"sh": y<0.72?"breath":"voice";
      var idx=0; for(var i=0;i<STEPS.length;i++) if(STEPS[i].k===k) idx=i;
      run=false; setStep(idx); target[k]= target[k]>=0.9?0:1; STEPS.forEach(function(s,i){ if(i<idx) target[s.k]=1; });
      loop(frame);
    };
  }

  /* ═══════════════════════════════════════════
     9. COLD — water on a wrist
     ═══════════════════════════════════════════ */
  function buildCold(){
    return box(
      '<canvas class="st" id="acW" width="560" height="320"></canvas>'+
      '<p class="line" id="acWl">'+T("Cold is a signal. Not grit.","El frío es una señal. No agallas.")+'</p>'+
      '<p class="soft" id="acWs"></p>'+
      '<div class="acts"><button type="button" class="btn btn-accent" id="acWgo">'+T("Thirty seconds","Treinta segundos")+'</button></div>'
    );
  }
  function initCold(){
    var c=document.getElementById("acW"); if(!c) return;
    var rip=[], t0=0, run=false;
    function draw(now){
      var S=ink(c), ctx=S.ctx, w=S.w, h=S.h;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle="#d9e7ef"; ctx.fillRect(0,0,w,h);
      ctx.fillStyle="#e6d3b3";
      ctx.beginPath(); ctx.ellipse(w*0.5, h*0.7, w*0.3, h*0.14, 0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#1a232c"; ctx.lineWidth=1.6; ctx.stroke();
      rip.forEach(function(R){
        R.r+=1.4; R.a*=0.972;
        ctx.beginPath(); ctx.arc(w*0.5, h*0.66, R.r, 0, Math.PI*2);
        ctx.strokeStyle="rgba(47,111,168,"+R.a+")"; ctx.lineWidth=1.8; ctx.stroke();
      });
      rip=rip.filter(function(R){ return R.a>0.03 && R.r<w; });
      if(run && now-t0>220){ rip.push({r:10,a:0.55}); t0=now; }
    }
    function frame(now){ draw(now); }
    document.getElementById("acWgo").onclick=function(){
      kill(); run=true; t0=0; rip=[];
      var left=30; document.getElementById("acWs").textContent="30";
      _int=setInterval(function(){
        left--; document.getElementById("acWs").textContent=String(Math.max(0,left));
        if(left<=0){ run=false; kill(); document.getElementById("acWl").textContent=T("That’s the signal.","Esa es la señal."); }
      },1000);
      loop(frame);
    };
  }

  /* ═══════════════════════════════════════════
     10. FOLLOW — a true figure-8, fading trail
     ═══════════════════════════════════════════ */
  function buildFid(){
    return box(
      '<canvas class="st" id="acD" width="560" height="340"></canvas>'+
      '<p class="line">'+T("Eyes only.","Solo los ojos.")+'</p>'+
      '<div class="acts"><button type="button" class="ghost" id="acDx">'+T("Stop","Parar")+'</button></div>'
    );
  }
  function initFid(){
    var c=document.getElementById("acD"); if(!c) return;
    var trail=[], t0=performance.now(), on=!reduced();
    function frame(now){
      if(!on) return;
      var S=ink(c), ctx=S.ctx, w=S.w, h=S.h;
      var t=(now-t0)/1100;
      var x=w/2 + Math.sin(t)*w*0.32;
      var y=h/2 + Math.sin(t*2)*h*0.22;
      trail.push({x:x,y:y}); if(trail.length>48) trail.shift();
      ctx.fillStyle="#F4EEE2"; ctx.fillRect(0,0,w,h);
      trail.forEach(function(p,i){
        var a=i/trail.length;
        ctx.beginPath(); ctx.arc(p.x,p.y, 3+a*10, 0, Math.PI*2);
        ctx.fillStyle="rgba(201,162,39,"+(0.08+a*0.75)+")"; ctx.fill();
      });
    }
    if(on) loop(frame);
    document.getElementById("acDx").onclick=function(){ on=false; kill(); };
  }


  /* 11. RAINBOW */
  var COLS=[
    {en:"Red",es:"Rojo",hex:"#b44338"},
    {en:"Orange",es:"Naranja",hex:"#d36a1c"},
    {en:"Yellow",es:"Amarillo",hex:"#c9a227"},
    {en:"Green",es:"Verde",hex:"#3d7a52"},
    {en:"Blue",es:"Azul",hex:"#2f628f"},
    {en:"Purple",es:"Morado",hex:"#624a86"}
  ];
  function buildRain(){
    return box(
      '<canvas class="st" id="acR" width="560" height="300"></canvas>'+
      '<p class="line" id="acRl">'+T("In on the color.","Entra en el color.")+'</p>'+
      '<div class="acts"><button type="button" class="btn btn-accent" id="acRgo">'+T("Begin","Empezar")+'</button>'+
      '<button type="button" class="ghost" id="acRx">'+T("Stop","Parar")+'</button></div>'
    );
  }
  function initRain(){
    var c=document.getElementById("acR"); if(!c) return;
    var i=0, run=false, t0=0;
    function draw(on, p){
      var S=ink(c), ctx=S.ctx, w=S.w, h=S.h;
      ctx.clearRect(0,0,w,h);
      COLS.forEach(function(C,k){
        ctx.beginPath();
        ctx.arc(w/2, h*0.98, h*0.9-k*16, Math.PI, 0);
        ctx.strokeStyle=C.hex;
        ctx.globalAlpha = k===on ? (0.25+0.75*p) : 0.16;
        ctx.lineWidth=14; ctx.lineCap="round"; ctx.stroke();
        ctx.globalAlpha=1;
      });
    }
    draw(0,0.4);
    function frame(now){
      if(!run) return;
      var u=((now-t0)%5000)/5000;
      var p = u<0.45 ? easeOut(u/0.45) : u<0.55 ? 1 : 1-easeInOut((u-0.55)/0.45);
      if(u<0.02 && now-t0>80){ i=(i+1)%6; t0=now; }
      draw(i, Math.max(0,Math.min(1,p)));
      document.getElementById("acRl").textContent=T("In — "+COLS[i].en, "Entra — "+COLS[i].es);
    }
    document.getElementById("acRgo").onclick=function(){ kill(); run=true; i=0; t0=performance.now(); loop(frame); };
    document.getElementById("acRx").onclick=function(){ run=false; kill(); };
  }

  /* 12. ANIMALS — one line, it holds */
  var POSES=[
    {en:"Lion",es:"León",
      draw:function(ctx,w,h){
        ctx.beginPath(); ctx.arc(w/2,h*0.48,h*0.22,0,Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(w/2,h*0.52,h*0.1,0.12*Math.PI,0.88*Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2-h*0.16,h*0.32); ctx.lineTo(w/2-h*0.22,h*0.18); ctx.lineTo(w/2-h*0.06,h*0.28);
        ctx.moveTo(w/2+h*0.16,h*0.32); ctx.lineTo(w/2+h*0.22,h*0.18); ctx.lineTo(w/2+h*0.06,h*0.28); ctx.stroke();
      }},
    {en:"Butterfly",es:"Mariposa",
      draw:function(ctx,w,h){
        ctx.beginPath(); ctx.ellipse(w*0.34,h*0.5,w*0.16,h*0.26,-0.35,0,Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(w*0.66,h*0.5,w*0.16,h*0.26,0.35,0,Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2,h*0.28); ctx.lineTo(w/2,h*0.72); ctx.stroke();
      }},
    {en:"Dog",es:"Perro",
      draw:function(ctx,w,h){
        ctx.beginPath(); ctx.moveTo(w*0.18,h*0.72); ctx.lineTo(w*0.5,h*0.32); ctx.lineTo(w*0.82,h*0.72); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w*0.5,h*0.32); ctx.lineTo(w*0.5,h*0.22); ctx.stroke();
      }},
    {en:"Cat",es:"Gato",
      draw:function(ctx,w,h){
        ctx.beginPath(); ctx.moveTo(w*0.22,h*0.7); ctx.quadraticCurveTo(w*0.5,h*0.28,w*0.78,h*0.7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w*0.22,h*0.7); ctx.quadraticCurveTo(w*0.5,h*0.82,w*0.78,h*0.7); ctx.stroke();
      }}
  ];
  function buildYoga(){
    return box(
      '<canvas class="st" id="acY" width="560" height="320"></canvas>'+
      '<p class="line" id="acYl">'+T("Hold a few breaths. Sit if you need.","Sostén unos respiros. Siéntate si hace falta.")+'</p>'+
      '<div class="picks" id="acYp"></div>'
    );
  }
  function initYoga(){
    var c=document.getElementById("acY"); if(!c) return;
    var at=0;
    function draw(){
      var S=ink(c), ctx=S.ctx, w=S.w, h=S.h;
      ctx.clearRect(0,0,w,h);
      ctx.strokeStyle="#1a232c"; ctx.lineWidth=3.2; ctx.lineCap="round"; ctx.lineJoin="round";
      POSES[at].draw(ctx,w,h);
    }
    var row=document.getElementById("acYp");
    POSES.forEach(function(p,i){
      var b=document.createElement("button"); b.type="button"; b.textContent=T(p.en,p.es);
      if(i===0) b.className="on";
      b.onclick=function(){
        at=i; draw();
        Array.prototype.forEach.call(row.querySelectorAll("button"), function(x,k){ x.classList.toggle("on",k===i); });
        document.getElementById("acYl").textContent=T(p.en,p.es);
      };
      row.appendChild(b);
    });
    draw();
  }

  /* 13. JAR — glass, weight, thirty seconds of fall */
  function buildJar(){
    return box(
      '<canvas class="st" id="acJ" width="280" height="420" style="max-width:150px"></canvas>'+
      '<p class="line" id="acJl">'+T("Tap. Then do nothing.","Toca. Luego no hagas nada.")+'</p>'
    );
  }
  function initJar(){
    var c=document.getElementById("acJ"); if(!c) return;
    var bits=[], shake=0, t0=performance.now();
    for(var i=0;i<90;i++) bits.push({
      x: 50+Math.random()*180, y: 310+Math.random()*50,
      vx:0, vy:0, r: 1.4+Math.random()*2.8,
      hue: 38+Math.random()*24, a: 0.55+Math.random()*0.45
    });
    function frame(now){
      var S=ink(c), ctx=S.ctx, w=S.w, h=S.h;
      ctx.clearRect(0,0,w,h);
      /* glass */
      ctx.fillStyle="#0A1E33";
      ctx.fillRect(w*0.18, h*0.04, w*0.64, 14);
      var g=ctx.createLinearGradient(0,h*0.08,0,h*0.92);
      g.addColorStop(0,"#d7eef8"); g.addColorStop(1,"#b7d7e8");
      ctx.fillStyle=g;
      ctx.beginPath();
      ctx.moveTo(w*0.22, h*0.08);
      ctx.lineTo(w*0.78, h*0.08);
      ctx.quadraticCurveTo(w*0.86, h*0.5, w*0.78, h*0.9);
      ctx.lineTo(w*0.22, h*0.9);
      ctx.quadraticCurveTo(w*0.14, h*0.5, w*0.22, h*0.08);
      ctx.fill();
      ctx.strokeStyle="#0A1E33"; ctx.lineWidth=5; ctx.stroke();
      /* highlight */
      ctx.strokeStyle="rgba(255,255,255,.35)"; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(w*0.32,h*0.16); ctx.quadraticCurveTo(w*0.28,h*0.5,w*0.34,h*0.8); ctx.stroke();
      var dt=Math.min(32, now-t0)/16.67; t0=now;
      bits.forEach(function(b){
        if(shake){ b.vx += (Math.random()-0.5)*3.2; b.vy += (Math.random()-0.85)*4.5; }
        b.vy += 0.055*dt; b.vx *= 0.992;
        b.x += b.vx; b.y += b.vy;
        if(b.x<w*0.26){ b.x=w*0.26; b.vx*=-0.35; }
        if(b.x>w*0.74){ b.x=w*0.74; b.vx*=-0.35; }
        if(b.y>h*0.86){ b.y=h*0.86; b.vy*=-0.18; b.vx*=0.72; }
        if(b.y<h*0.12){ b.y=h*0.12; b.vy*=0.2; }
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
        ctx.fillStyle="hsla("+b.hue+",72%,52%,"+b.a+")"; ctx.fill();
      });
      if(shake>0) shake--;
    }
    c.onclick=function(){ shake=22; };
    loop(frame);
  }

  var MAP={
    breathing:{builder:buildBreath,init:initBreath},
    grounding:{builder:buildGround,init:initGround},
    pmr:{builder:buildPMR,init:initPMR},
    bilateral:{builder:buildBil,init:initBil},
    movement:{builder:buildMove,init:initMove},
    safeplace:{builder:buildSafe,init:initSafe},
    emotion:{builder:buildFeel,init:initFeel},
    coreg:{builder:buildCoreg,init:initCoreg},
    coldwater:{builder:buildCold,init:initCold},
    fidget:{builder:buildFid,init:initFid},
    rainbow:{builder:buildRain,init:initRain},
    animalyoga:{builder:buildYoga,init:initYoga},
    calmjar:{builder:buildJar,init:initJar}
  };

  function install(){
    if(!window.TOOLS || !TOOLS.breathing) return false;
    if(window._aogCalmV4) return true;
    window._aogCalmV4=true;
    css();
    Object.keys(MAP).forEach(function(k){ if(TOOLS[k]) TOOLS[k]=MAP[k]; });
    var old=window.toolOpen;
    window.toolOpen=function(type){ kill(); if(typeof old==="function") old(type); };
    return true;
  }
  function boot(){
    if(install()) return;
    var n=0, id=setInterval(function(){ if(install()||++n>100) clearInterval(id); }, 150);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
