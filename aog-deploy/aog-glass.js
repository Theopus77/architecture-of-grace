/* AOG-GLASS-REAL-V1 (2026-09-27) — Jimmy: the Blueprint windows "look fake".
   A realistic glass painter for the My Blueprint windows in turn-ins.html.
   It takes the SAME pane geometry and colours the SVG already builds (one pane
   per send; colour = subject; brightness = done without a hint) and paints them
   as antique glass on a canvas: mottling, streaks, seed bubbles, a wavy surface
   catching the room, light passing through from behind with a soft bloom, lead
   came with a ridge of light, soldered joints, and a stone / bronze / wood /
   gold-mosaic frame per window.
   - Canvas 2D only, drawn ONCE per call. No loop, nothing moves.
   - Deterministic: every random number is seeded by style + pane index.
   - The canvas is decorative (aria-hidden). The SVG on top keeps the titles,
     taps and keyboard; if this file fails, the SVG is shown as before.
   AOGGlass.render(canvas, spec) -> true when painted, false to fall back. */
(function(){
  "use strict";
  function mul(seed){ var a=seed>>>0; return function(){ a=(a+0x6D2B79F5)>>>0; var t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }
  function hash(s){ var h=2166136261; s=String(s); for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }

  /* ── tileable value noise ─────────────────────────────────────────────── */
  function fbm(size, fx, fy, oct, seed){
    var out=new Float32Array(size*size), amp=1, tot=0, r=mul(seed);
    for(var o=0;o<oct;o++){
      var gx=fx<<o, gy=fy<<o, lat=new Float32Array(gx*gy);
      for(var i=0;i<lat.length;i++) lat[i]=r();
      for(var y=0;y<size;y++){ var v=y*gy/size, y0=Math.floor(v), ty=v-y0; ty=ty*ty*(3-2*ty); var y1=(y0+1)%gy;
        for(var x=0;x<size;x++){ var u=x*gx/size, x0=Math.floor(u), tx=u-x0; tx=tx*tx*(3-2*tx); var x1=(x0+1)%gx;
          var a=lat[y0*gx+x0], b=lat[y0*gx+x1], c=lat[y1*gx+x0], d=lat[y1*gx+x1];
          out[y*size+x]+=amp*((a+(b-a)*tx)+((c+(d-c)*tx)-(a+(b-a)*tx))*ty); } }
      tot+=amp; amp*=0.5;
    }
    for(var k=0;k<out.length;k++) out[k]/=tot;
    return out;
  }
  function mk(w,h){ var c=document.createElement("canvas"); c.width=w; c.height=h; return c; }
  function texFrom(size, fn){
    var c=mk(size,size), x=c.getContext("2d"), im=x.createImageData(size,size), d=im.data;
    for(var i=0;i<size*size;i++){ var p=fn(i, i%size, (i/size)|0); d[i*4]=p[0]; d[i*4+1]=p[1]; d[i*4+2]=p[2]; d[i*4+3]=p.length>3?p[3]:255; }
    x.putImageData(im,0,0); return c;
  }
  function cl(v){ return v<0?0:v>255?255:v; }
  var T=null;
  function textures(){
    if(T) return T;
    var S=256;
    var m=fbm(S,4,4,4,11), st=fbm(S,2,20,3,23), wv=fbm(S,6,6,3,37), fine=fbm(S,32,32,2,41), big=fbm(S,3,3,3,53), g=fbm(S,1,12,3,61);
    T={
      /* mottling: mid-grey based, for overlay */
      mottle: texFrom(S,function(i){ var v=cl(128+(m[i]-0.5)*330); return [v,v,v]; }),
      /* streaks: long thin density changes */
      streak: texFrom(S,function(i){ var v=cl(128+(st[i]-0.5)*300); return [v,v,v]; }),
      /* the rolled surface: soft ridges that catch the room light */
      wave: texFrom(S,function(i){ var r=1-Math.abs(2*wv[i]-1); r=Math.pow(r,7); return [255,255,255,cl(r*255)]; }),
      /* weathered limestone */
      stone: texFrom(S,function(i,x,y){ var n=big[i]*0.45+m[i]*0.25+fine[i]*0.3, sp=(hash(i*7+3)%1000)/1000;
        var k=0.52+n*0.62-(sp<0.06?0.2*sp/0.06+0.08:0)+(sp>0.97?0.1:0); var y2=Math.max(0,(0.5-big[i])*0.5);
        return [cl(198*k-y2*30),cl(186*k-y2*30),cl(160*k-y2*20)]; }),
      /* cast bronze with verdigris in the hollows */
      bronze: texFrom(S,function(i){ var n=m[i], p=Math.max(0,Math.min(1,(fine[i]*0.6+big[i]*0.4-0.58)*6))*0.8, k=0.62+n*0.5+fine[i]*0.15;
        return [cl((104*(1-p)+64*p)*k),cl((72*(1-p)+104*p)*k),cl((34*(1-p)+88*p)*k)]; }),
      /* carved walnut: long grain */
      wood: texFrom(S,function(i,x,y){ var gr=Math.sin((x/S*26+g[i]*9)*Math.PI*2)*0.5+0.5; gr=Math.pow(gr,3); var k=0.62+big[i]*0.35+gr*0.22+fine[i]*0.1;
        return [cl(112*k),cl(72*k),cl(40*k)]; }),
      /* mortar between tesserae */
      mortar: texFrom(S,function(i){ var k=0.65+m[i]*0.5+fine[i]*0.2; return [cl(122*k),cl(92*k),cl(40*k)]; })
    };
    return T;
  }

  /* ── path helpers ──────────────────────────────────────────────────────── */
  /* vertices (for solder), and a box, from the SVG path data */
  function scan(d){
    var t=d.match(/[MLAQZmlaqz]|-?\d*\.?\d+(?:e-?\d+)?/g)||[], i=0, cmd="", x=0, y=0, pts=[], box=[1e9,1e9,-1e9,-1e9];
    function add(px,py,vert){ if(vert) pts.push([px,py]); if(px<box[0])box[0]=px; if(py<box[1])box[1]=py; if(px>box[2])box[2]=px; if(py>box[3])box[3]=py; }
    while(i<t.length){
      if(/[A-Za-z]/.test(t[i])){ cmd=t[i++]; if(cmd==="Z"||cmd==="z") continue; }
      var n=function(){ return +t[i++]; };
      if(cmd==="M"||cmd==="L"){ x=n(); y=n(); add(x,y,true); }
      else if(cmd==="A"){ i+=5; x=n(); y=n(); add(x,y,true); }
      else if(cmd==="a"){ var rx=n(); i+=4; var dx=n(), dy=n(); add(x-0+rx*0,y-rx,false); add(x+dx/2,y+rx,false); x+=dx; y+=dy; add(x,y,false); }
      else if(cmd==="Q"){ var qx=n(), qy=n(); add(qx,qy,false); x=n(); y=n(); add(x,y,true); }
      else i++;
    }
    return {pts:pts, box:box};
  }
  /* hand-cut, not machine-cut: every point is nudged by a smooth field of the
     position itself, so a point two panes share moves the same way and no gap opens */
  function warpXY(x,y){ return [x+0.9*Math.sin(y*0.061+1.7)*Math.cos(x*0.043)+0.5*Math.sin((x+y)*0.13), y+0.9*Math.sin(x*0.057+0.4)*Math.cos(y*0.047)+0.5*Math.cos((x-y)*0.11)]; }
  function warp(d){
    var t=d.match(/[MLAQZmlaqz]|-?\d*\.?\d+(?:e-?\d+)?/g)||[], o=[], i=0, cmd="";
    function pt(){ var w=warpXY(+t[i],+t[i+1]); i+=2; o.push(w[0].toFixed(2),w[1].toFixed(2)); }
    while(i<t.length){
      if(/[A-Za-z]/.test(t[i])){ cmd=t[i++]; o.push(cmd); if(cmd==="Z"||cmd==="z") continue; }
      if(cmd==="M"||cmd==="L") pt();
      else if(cmd==="Q"){ pt(); pt(); }
      else if(cmd==="A"){ o.push(t[i],t[i+1],t[i+2],t[i+3],t[i+4]); i+=5; pt(); }
      else o.push(t[i++]);
    }
    return o.join(" ");
  }
  function circle(c,r){ var p=new Path2D(); p.arc(c,c,r,0,Math.PI*2); return p; }
  function poly(c,r,n){ var p=new Path2D(); for(var j=0;j<n;j++){ var t=-Math.PI/2+j*2*Math.PI/n; if(j) p.lineTo(c+r*Math.cos(t),c+r*Math.sin(t)); else p.moveTo(c+r*Math.cos(t),c+r*Math.sin(t)); } p.closePath(); return p; }
  function rgb(h){ h=String(h).replace("#",""); return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
  function css(c,a){ return a==null?"rgb("+(c[0]|0)+","+(c[1]|0)+","+(c[2]|0)+")":"rgba("+(c[0]|0)+","+(c[1]|0)+","+(c[2]|0)+","+a+")"; }
  function pat(ctx,tex,sc,rot,ox,oy){ var p=ctx.createPattern(tex,"repeat"); if(p.setTransform && window.DOMMatrix) p.setTransform(new DOMMatrix().translateSelf(ox,oy).rotateSelf(rot).scaleSelf(sc,sc)); return p; }

  /* ── the window ────────────────────────────────────────────────────────── */
  var memo={};
  function render(cv, spec){
    try{
      if(!cv || !cv.getContext || !spec || !window.Path2D) return false;
      var W=spec.w, H=spec.h, S=spec.scale||2;
      cv.width=W*S; cv.height=H*S;
      var ctx=cv.getContext("2d"); if(!ctx) return false;
      var key=spec.key&&(spec.key+"@"+S);
      if(key && memo[key]){ ctx.drawImage(memo[key],0,0); return true; }
      var t0=(window.performance&&performance.now)?performance.now():0;
      paint(ctx, spec, S);
      if(key){ var keep=mk(cv.width,cv.height); keep.getContext("2d").drawImage(cv,0,0); memo={}; memo[key]=keep; }
      if(t0) cv.setAttribute("data-ms", String(Math.round(performance.now()-t0)));
      return true;
    }catch(e){ try{ console.warn("AOGGlass", e); }catch(_){} return false; }
  }

  function paint(ctx, spec, S){
    var tx=textures(), st=spec.style, W=spec.w, H=spec.h, c=200, byz=st==="byz";
    ctx.setTransform(S,0,0,S,0,0);
    ctx.lineJoin="round"; ctx.lineCap="round";
    var R=mul(hash("win"+st)), sheet=R()*180;

    /* glass region and frame, per style */
    var glass, frameFill, frameTex, inner;
    if(st==="lancet"){ glass=new Path2D(spec.clip); }
    else if(st==="star"){ glass=poly(c,184,12); }
    else glass=circle(c, byz?184:182);

    /* 1 · behind the glass: the dark of the opening (or mortar for mosaic) */
    ctx.save(); ctx.clip(glass);
    if(byz){ ctx.fillStyle=pat(ctx,tx.mortar,0.5,0,0,0); ctx.fillRect(0,0,W,H); }
    else { ctx.fillStyle="#15181E"; ctx.fillRect(0,0,W,H); }

    /* 2 · each pane */
    var joints={}, panes=spec.panes, lx=W/2, ly=st==="lancet"?H*0.36:c*0.92;
    for(var k=0;k<panes.length;k++){
      var p=panes[k], r=mul(hash(st+"|"+k+"|"+p.color)), pd=p.tf?p.d:warp(p.d), sc=scan(pd), path=new Path2D(pd);
      var tf=p.tf, b=sc.box, bw=Math.max(4,b[2]-b[0]), bh=Math.max(4,b[3]-b[1]);
      ctx.save();
      if(tf){ tf=p.tf=[tf[0]+(r()-0.5)*0.8,tf[1]+(r()-0.5)*0.8,tf[2]+(r()-0.5)*9]; ctx.translate(tf[0],tf[1]); ctx.rotate(tf[2]*Math.PI/180); var zs=0.9+r()*0.12; ctx.scale(zs,zs*(0.94+r()*0.1)); }
      ctx.save(); ctx.clip(path);
      var col=rgb(p.color), op=p.op, dense;
      /* density keeps the old meaning: fill-opacity over a dark opening → a darker, denser glass of the same hue */
      /* a pane not yet earned is plain antique clear glass: pale, grey-green, unlit by colour */
      if(p.empty){ col=byz?col:[150,162,152]; dense=byz?1:0.46; }
      else dense=op;
      var jit=(r()-0.5)*0.16, base=[0,1,2].map(function(i){ var v=col[i]*(1+jit); return v*(0.18+0.82*dense)+18*(1-dense); });
      /* distance from the light behind the window: panes near it are lit harder */
      var mx=(b[0]+b[2])/2, my=(b[1]+b[3])/2; if(tf){ mx=tf[0]; my=tf[1]; }
      ctx.fillStyle=css(base); ctx.fillRect(b[0]-30,b[1]-30,bw+60,bh+60);
      if(!byz || !p.empty){
        /* mottled colour: two passes of noise at a per-pane offset and angle */
        ctx.globalCompositeOperation="overlay";
        ctx.globalAlpha=0.7+r()*0.3; ctx.fillStyle=pat(ctx,tx.mottle,0.11+r()*0.08,r()*360,r()*256,r()*256); ctx.fillRect(b[0]-30,b[1]-30,bw+60,bh+60);
        ctx.globalCompositeOperation="soft-light";
        ctx.globalAlpha=0.85; ctx.fillStyle=pat(ctx,tx.streak,0.18+r()*0.14,sheet+(r()*30-15),r()*256,r()*256); ctx.fillRect(b[0]-30,b[1]-30,bw+60,bh+60);
        ctx.globalAlpha=0.45; ctx.fillStyle=pat(ctx,tx.mottle,0.045,r()*360,r()*256,r()*256); ctx.fillRect(b[0]-30,b[1]-30,bw+60,bh+60);
        /* hue drift: one side of a sheet is a touch warmer, the other cooler */
        ctx.globalCompositeOperation="soft-light"; ctx.globalAlpha=0.35;
        var ga=r()*Math.PI*2, gr=ctx.createLinearGradient(mx-Math.cos(ga)*bw/2,my-Math.sin(ga)*bh/2,mx+Math.cos(ga)*bw/2,my+Math.sin(ga)*bh/2);
        gr.addColorStop(0,"#ffe6b0"); gr.addColorStop(1,"#1a2a55"); ctx.fillStyle=gr; ctx.fillRect(b[0]-30,b[1]-30,bw+60,bh+60);
      }
      if(byz && p.empty){
        /* gold smalti: a leaf under glass, catching the room */
        ctx.globalCompositeOperation="overlay"; ctx.globalAlpha=0.6; ctx.fillStyle=pat(ctx,tx.mottle,0.12,r()*360,r()*256,r()*256); ctx.fillRect(b[0]-30,b[1]-30,bw+60,bh+60);
        ctx.globalCompositeOperation="source-over"; ctx.globalAlpha=0.35+r()*0.4;
        var gg=ctx.createLinearGradient(b[0],b[1],b[2],b[3]); gg.addColorStop(0,"#fff4c2"); gg.addColorStop(0.5,"rgba(255,230,150,0)"); gg.addColorStop(1,"rgba(90,60,10,.8)");
        ctx.fillStyle=gg; ctx.fillRect(b[0]-30,b[1]-30,bw+60,bh+60);
      }
      ctx.globalCompositeOperation="source-over";
      /* seed bubbles: many tiny, a few larger; some drawn out along the pull of the sheet */
      var area=bw*bh*0.55, nb=Math.min(60,Math.round(area/(byz?90:55)*(0.5+r())));
      var ang=r()*Math.PI;
      for(var q=0;q<nb;q++){
        var big=r()<0.07, rad=big?(0.9+r()*1.3):(0.22+r()*0.5), bx=b[0]+r()*bw, by=b[1]+r()*bh, el=r()<0.35?1.8+r()*1.6:1;
        ctx.globalAlpha=big?0.55:0.35;
        ctx.beginPath(); ctx.ellipse(bx,by,rad*el,rad,ang,0,Math.PI*2);
        ctx.fillStyle="rgba(255,255,255,.35)"; ctx.fill();
        ctx.lineWidth=rad*0.45; ctx.strokeStyle="rgba(0,0,0,.35)"; ctx.stroke();
        if(big){ ctx.globalAlpha=0.8; ctx.beginPath(); ctx.arc(bx-rad*0.35,by-rad*0.35,rad*0.28,0,Math.PI*2); ctx.fillStyle="#fff"; ctx.fill(); }
      }
      ctx.globalAlpha=1;
      /* the glass is thicker and darker where it meets the lead; a thin bright fringe on the far side */
      ctx.strokeStyle="rgba(0,0,0,.28)"; ctx.lineWidth=byz?2.2:6; ctx.stroke(path);
      ctx.strokeStyle="rgba(0,0,0,.22)"; ctx.lineWidth=byz?1.2:3; ctx.stroke(path);
      ctx.save(); ctx.translate(0.9,1.1); ctx.strokeStyle="rgba(255,248,225,"+(0.10+0.18*dense)+")"; ctx.lineWidth=byz?0.8:1.6; ctx.stroke(path); ctx.restore();
      ctx.restore(); /* un-clip */
      ctx.restore(); /* un-transform */
      /* joints, in window space */
      if(!byz && !tf){ var seen={};
        sc.pts.forEach(function(v){ var kk=Math.round(v[0]/2)+","+Math.round(v[1]/2); if(seen[kk]) return; seen[kk]=1; var j=joints[kk]||(joints[kk]={x:v[0],y:v[1],n:0}); j.n++; }); }
      p._path=path; p._sc=sc;
    }

    /* 3 · the light behind: a soft sun just above the middle, falling off to the edges */
    ctx.globalCompositeOperation="multiply";
    var bl=ctx.createRadialGradient(lx,ly,10,lx,ly,Math.max(W,H)*0.62);
    bl.addColorStop(0,"#ffffff"); bl.addColorStop(0.5,"#eee8dc"); bl.addColorStop(1,"#77737e");
    ctx.fillStyle=bl; ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation="screen";
    var sun=ctx.createRadialGradient(lx,ly,0,lx,ly,Math.max(W,H)*0.42);
    sun.addColorStop(0,"rgba(255,244,214,.30)"); sun.addColorStop(0.5,"rgba(255,236,200,.08)"); sun.addColorStop(1,"rgba(255,236,200,0)");
    ctx.fillStyle=sun; ctx.fillRect(0,0,W,H);
    /* the room side: a wavy rolled surface catching a soft window light from the upper left */
    var sh=mk(W*S/2|0,H*S/2|0), sx=sh.getContext("2d"); sx.scale(S/2,S/2);
    sx.fillStyle=pat(sx,tx.wave,1.1,17,31,7); sx.fillRect(0,0,W,H);
    sx.globalCompositeOperation="destination-in";
    var sg=sx.createLinearGradient(0,0,W,H); sg.addColorStop(0,"rgba(0,0,0,.9)"); sg.addColorStop(0.45,"rgba(0,0,0,.25)"); sg.addColorStop(1,"rgba(0,0,0,.05)");
    sx.fillStyle=sg; sx.fillRect(0,0,W,H);
    ctx.globalAlpha=byz?0.3:0.13; ctx.drawImage(sh,0,0,W,H); ctx.globalAlpha=1;
    ctx.globalCompositeOperation="source-over";
    ctx.restore(); /* un-clip glass */

    /* 4 · bloom: the brightest glass spills a little light over its lead */
    var cvs=ctx.canvas, sw=Math.max(8,cvs.width/10|0), shh=Math.max(8,cvs.height/10|0), sm=mk(sw,shh), smx=sm.getContext("2d");
    smx.drawImage(cvs,0,0,sw,shh);
    var id=smx.getImageData(0,0,sw,shh), dd=id.data;
    for(var i=0;i<dd.length;i+=4){ var lum=(dd[i]*0.3+dd[i+1]*0.59+dd[i+2]*0.11)/255, f=Math.max(0,lum-0.3)/0.7; f=Math.min(1,f*1.6); dd[i]*=f; dd[i+1]*=f; dd[i+2]*=f; }
    smx.putImageData(id,0,0);
    var md=mk(sw*3,shh*3), mdx=md.getContext("2d"); mdx.imageSmoothingQuality="high"; mdx.drawImage(sm,0,0,sw*3,shh*3);
    ctx.save(); ctx.clip(glass);

    /* 5 · lead came: dark rounded strips with a thin ridge of light, width a little uneven */
    var L=byz?1.3:2.9;
    function came(path, tf, w, gold){
      ctx.save(); if(tf){ ctx.translate(tf[0],tf[1]); ctx.rotate(tf[2]*Math.PI/180); }
      ctx.save(); ctx.translate(0.5,0.8); ctx.strokeStyle="rgba(0,0,0,.45)"; ctx.lineWidth=w+1.4; ctx.stroke(path); ctx.restore();
      ctx.strokeStyle=gold?"#6b4e16":"#1d1e22"; ctx.lineWidth=w; ctx.stroke(path);
      ctx.strokeStyle=gold?"#a8802e":"#34363c"; ctx.lineWidth=w*0.62; ctx.stroke(path);
      ctx.save(); ctx.translate(-0.3,-0.4); ctx.strokeStyle=gold?"rgba(255,226,140,.8)":"rgba(210,216,228,.42)"; ctx.lineWidth=Math.max(0.35,w*0.16); ctx.stroke(path); ctx.restore();
      ctx.restore();
    }
    for(k=0;k<panes.length;k++){ var pp=panes[k], rr=mul(hash("lead"+st+k)); if(!pp.key) came(pp._path, pp.tf, L*(0.88+rr()*0.26), false); }
    for(k=0;k<panes.length;k++){ pp=panes[k]; if(pp.key) came(pp._path, pp.tf, L*1.15, true); }

    /* 6 · solder where leads meet: irregular grey blobs with a soft shine */
    if(!byz){
      Object.keys(joints).forEach(function(kk){ var j=joints[kk]; if(j.n<2) return; var r=mul(hash(st+kk));
        var rad=L*(0.5+r()*0.22);
        for(var q=0;q<5;q++){ var a=r()*Math.PI*2, o=rad*0.55*r(); ctx.beginPath(); ctx.ellipse(j.x+Math.cos(a)*o,j.y+Math.sin(a)*o,rad*(0.6+r()*0.4),rad*(0.45+r()*0.3),r()*3,0,Math.PI*2); ctx.fillStyle=q?"#3c3e44":"rgba(0,0,0,.45)"; ctx.fill(); }
        var g=ctx.createRadialGradient(j.x-rad*0.3,j.y-rad*0.35,0,j.x,j.y,rad); g.addColorStop(0,"rgba(200,204,212,.5)"); g.addColorStop(0.4,"rgba(120,124,132,.2)"); g.addColorStop(1,"rgba(30,30,34,0)");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(j.x,j.y,rad*1.05,0,Math.PI*2); ctx.fill();
      });
    }
    /* bloom goes on after the lead, so bright panes glow over it */
    ctx.globalCompositeOperation="screen"; ctx.globalAlpha=byz?0.25:0.7; ctx.imageSmoothingEnabled=true; ctx.drawImage(md,-3,-3,W+6,H+6); ctx.globalAlpha=1; ctx.globalCompositeOperation="source-over";
    /* shadow the frame throws onto the glass */
    ctx.lineWidth=16; ctx.strokeStyle="rgba(0,0,0,.28)"; ctx.stroke(glass); ctx.lineWidth=8; ctx.strokeStyle="rgba(0,0,0,.3)"; ctx.stroke(glass);
    ctx.restore();

    /* 7 · the frame */
    frame(ctx, spec, tx, glass, W, H, c);
    ctx.setTransform(1,0,0,1,0,0);
  }

  function bevel(ctx, path, W, H, strong){
    /* light from the upper left, grime settling low */
    ctx.save(); ctx.clip(path, "evenodd");
    ctx.globalCompositeOperation="soft-light";
    var g=ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,"rgba(255,255,255,"+strong+")"); g.addColorStop(0.55,"rgba(128,128,128,0)"); g.addColorStop(1,"rgba(0,0,0,"+strong+")");
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation="multiply";
    var gb=ctx.createLinearGradient(0,H*0.55,0,H); gb.addColorStop(0,"rgba(255,255,255,0)"); gb.addColorStop(1,"rgba(120,110,95,.55)");
    ctx.fillStyle=gb; ctx.fillRect(0,0,W,H);
    ctx.restore();
  }
  function ringPath(c,r0,r1){ var p=new Path2D(); p.arc(c,c,r1,0,Math.PI*2); p.moveTo(c+r0,c); p.arc(c,c,r0,0,Math.PI*2,true); return p; }
  function ringShade(ctx,c,r0,r1,lo,hi){
    /* a rounded moulding: dark at both edges, light on the crown */
    var g=ctx.createRadialGradient(c,c,r0,c,c,r1);
    g.addColorStop(0,"rgba(0,0,0,"+lo+")"); g.addColorStop(0.18,"rgba(0,0,0,0)"); g.addColorStop(0.45,"rgba(255,250,235,"+hi+")"); g.addColorStop(0.6,"rgba(255,250,235,0)"); g.addColorStop(0.72,"rgba(0,0,0,.18)"); g.addColorStop(0.8,"rgba(255,250,235,"+hi*0.7+")"); g.addColorStop(1,"rgba(0,0,0,"+lo+")");
    ctx.fillStyle=g; ctx.fill(ringPath(c,r0,r1),"evenodd");
  }
  function wear(ctx, path, seed, n, W, H){
    ctx.save(); ctx.clip(path,"evenodd"); var r=mul(seed), i;
    /* small pits and chips */
    for(i=0;i<n;i++){ var x=r()*W, y=r()*H, s=0.3+r()*1.1; ctx.fillStyle="rgba(40,30,20,"+(0.08+r()*0.18)+")"; ctx.beginPath(); ctx.ellipse(x,y,s*(1+r()),s,r()*3,0,Math.PI*2); ctx.fill(); }
    /* rain stains: soft dark runs down the stone */
    for(i=0;i<n/6;i++){ var sx=r()*W, sy=r()*H, g=ctx.createLinearGradient(sx,sy,sx,sy+16+r()*22); g.addColorStop(0,"rgba(70,60,45,.22)"); g.addColorStop(1,"rgba(70,60,45,0)");
      ctx.fillStyle=g; ctx.fillRect(sx-0.8-r()*1.5,sy,1.6+r()*3,40); }
    ctx.restore();
  }
  /* mortar joints between the stones of a ring, each stone shaded a little differently */
  function joints(ctx,c,r0,r1,n,seed){
    var r=mul(seed), off=r()*Math.PI;
    for(var i=0;i<n;i++){ var t0=off+i*2*Math.PI/n, t1=t0+2*Math.PI/n;
      var blk=new Path2D(); blk.arc(c,c,r1,t0,t1); blk.arc(c,c,r0,t1,t0,true); blk.closePath();
      ctx.fillStyle=r()<0.5?"rgba(60,48,30,"+(r()*0.16)+")":"rgba(255,248,230,"+(r()*0.12)+")"; ctx.fill(blk);
      ctx.beginPath(); ctx.moveTo(c+r0*Math.cos(t0),c+r0*Math.sin(t0)); ctx.lineTo(c+r1*Math.cos(t0),c+r1*Math.sin(t0));
      ctx.lineWidth=1.1; ctx.strokeStyle="rgba(50,40,28,.6)"; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c+r0*Math.cos(t0+0.006),c+r0*Math.sin(t0+0.006)); ctx.lineTo(c+r1*Math.cos(t0+0.006),c+r1*Math.sin(t0+0.006));
      ctx.lineWidth=0.5; ctx.strokeStyle="rgba(255,250,235,.35)"; ctx.stroke(); }
  }
  function frame(ctx, spec, tx, glass, W, H, c){
    var st=spec.style;
    if(st==="rose"){
      var p=ringPath(c,180,198);
      ctx.fillStyle=pat(ctx,tx.stone,0.3,11,0,0); ctx.fill(p,"evenodd");
      ringShade(ctx,c,180,198,0.55,0.35);
      /* a carved inner moulding */
      ctx.save(); ctx.lineWidth=1.2; ctx.strokeStyle="rgba(40,32,20,.5)"; ctx.stroke(circle(c,184.5)); ctx.strokeStyle="rgba(255,250,235,.35)"; ctx.lineWidth=0.8; ctx.stroke(circle(c,185.6)); ctx.restore();
      bevel(ctx,p,W,H,0.35); wear(ctx,p,101,160,W,H); joints(ctx,c,180,198,20,105);
    } else if(st==="lancet"){
      var cp=new Path2D(spec.clip);
      ctx.save(); ctx.lineWidth=18; ctx.strokeStyle=pat(ctx,tx.stone,0.3,8,0,0); ctx.stroke(cp);
      ctx.lineWidth=18; ctx.strokeStyle="rgba(0,0,0,.25)"; ctx.globalCompositeOperation="multiply"; ctx.stroke(cp); ctx.globalCompositeOperation="source-over";
      ctx.lineWidth=12; ctx.strokeStyle=pat(ctx,tx.stone,0.3,8,3,3); ctx.stroke(cp);
      ctx.lineWidth=3; ctx.strokeStyle="rgba(255,250,235,.35)"; ctx.translate(-1,-1); ctx.stroke(cp); ctx.translate(1,1);
      ctx.lineWidth=1.4; ctx.strokeStyle="rgba(0,0,0,.45)"; ctx.stroke(cp);
      ctx.restore();
      /* a stone sill under the window */
      var sill=new Path2D(); sill.rect(66,422,268,14);
      ctx.fillStyle=pat(ctx,tx.stone,0.3,3,5,1); ctx.fill(sill);
      var sg=ctx.createLinearGradient(0,422,0,436); sg.addColorStop(0,"rgba(255,250,235,.4)"); sg.addColorStop(0.25,"rgba(0,0,0,0)"); sg.addColorStop(1,"rgba(0,0,0,.45)"); ctx.fillStyle=sg; ctx.fill(sill);
      var outline=new Path2D(); outline.addPath(sill);
      ctx.save(); ctx.lineWidth=18; ctx.clip(sill); ctx.restore();
      wear(ctx,sill,202,40,W,H);
    } else if(st==="dome"){
      var rp=ringPath(c,180,194);
      ctx.fillStyle=pat(ctx,tx.bronze,0.3,20,0,0); ctx.fill(rp,"evenodd");
      ringShade(ctx,c,180,194,0.6,0.45);
      /* ribs and the oculus ring, cast bronze */
      var r0=spec.r0||26, n=spec.ribs||12;
      for(var q=0;q<n;q++){ var tt=-Math.PI/2+q*2*Math.PI/n, a=[c+r0*Math.cos(tt),c+r0*Math.sin(tt)], b=[c+181*Math.cos(tt),c+181*Math.sin(tt)];
        var rib=new Path2D(); rib.moveTo(a[0],a[1]); rib.lineTo(b[0],b[1]);
        ctx.lineWidth=8; ctx.strokeStyle="rgba(0,0,0,.5)"; ctx.save(); ctx.translate(1,1.4); ctx.stroke(rib); ctx.restore();
        ctx.lineWidth=6; ctx.strokeStyle="#2a1c0c"; ctx.stroke(rib);
        ctx.lineWidth=4.6; ctx.strokeStyle=pat(ctx,tx.bronze,0.25,q*30,q*17,0); ctx.stroke(rib);
        ctx.lineWidth=2; ctx.strokeStyle="rgba(255,214,140,.22)"; ctx.save(); ctx.translate(-0.6,-0.7); ctx.stroke(rib); ctx.restore();
        ctx.lineWidth=0.6; ctx.strokeStyle="rgba(255,236,190,.65)"; ctx.save(); ctx.translate(-0.9,-1); ctx.stroke(rib); ctx.restore(); }
      var oc=ringPath(c,r0-3,r0+3); ctx.fillStyle="rgba(0,0,0,.45)"; ctx.save(); ctx.translate(0.8,1.2); ctx.fill(oc,"evenodd"); ctx.restore();
      ctx.fillStyle=pat(ctx,tx.bronze,0.35,0,0,0); ctx.fill(oc,"evenodd"); ringShade(ctx,c,r0-3,r0+3,0.5,0.5);
      bevel(ctx,rp,W,H,0.3); wear(ctx,rp,303,80,W,H);
    } else if(st==="star"){
      var fp=new Path2D(); fp.arc(c,c,197,0,Math.PI*2); fp.addPath(poly(c,182,12));
      ctx.fillStyle=pat(ctx,tx.wood,0.6,-30,0,0); ctx.fill(fp,"evenodd");
      /* carved: a raised rim, a bead moulding, the inner chamfer */
      ctx.save(); ctx.clip(fp,"evenodd");
      ctx.lineWidth=5; ctx.strokeStyle="rgba(0,0,0,.45)"; ctx.stroke(poly(c,183,12));
      ctx.lineWidth=2; ctx.strokeStyle="rgba(255,220,170,.3)"; ctx.stroke(poly(c,187,12));
      ctx.lineWidth=1.3; ctx.strokeStyle="rgba(0,0,0,.35)"; ctx.stroke(circle(c,192));
      ctx.strokeStyle="rgba(255,220,170,.25)"; ctx.stroke(circle(c,193.3));
      ctx.restore();
      for(var v=0;v<12;v++){ var tv=-Math.PI/2+(v+0.5)*Math.PI/6, xv=c+191*Math.cos(tv), yv=c+191*Math.sin(tv);
        var rg=ctx.createRadialGradient(xv-0.8,yv-0.8,0,xv,yv,3); rg.addColorStop(0,"#c89a5c"); rg.addColorStop(1,"#3a2412"); ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(xv,yv,2.6,0,Math.PI*2); ctx.fill(); }
      bevel(ctx,fp,W,H,0.4); wear(ctx,fp,404,60,W,H);
    } else if(st==="byz"){
      var bp=ringPath(c,182,197), r=mul(77);
      ctx.fillStyle="#3a2a12"; ctx.fill(bp,"evenodd");
      /* gilded tesserae in three rows; a band of lapis in the middle row */
      [[185,2.6,0],[189.5,2.8,1],[194,2.6,0]].forEach(function(row){
        var rr=row[0], s=row[1], n=Math.floor(2*Math.PI*rr/(s*1.18));
        for(var i=0;i<n;i++){ var t=i*2*Math.PI/n+(r()-0.5)*0.004, x=c+rr*Math.cos(t), y=c+rr*Math.sin(t);
          ctx.save(); ctx.translate(x,y); ctx.rotate(t+(r()-0.5)*0.25);
          var col=row[2] && i%6<3 ? [40+r()*30,70+r()*40,150+r()*60] : row[2] ? [150+r()*40,30+r()*20,35+r()*20] : [200+r()*50,150+r()*50,50+r()*40];
          ctx.fillStyle=css(col); ctx.fillRect(-s/2,-s/2,s*(0.9+r()*0.2),s*(0.9+r()*0.2));
          var g=ctx.createLinearGradient(-s/2,-s/2,s/2,s/2); g.addColorStop(0,"rgba(255,250,220,"+(0.2+r()*0.5)+")"); g.addColorStop(1,"rgba(0,0,0,.35)");
          ctx.fillStyle=g; ctx.fillRect(-s/2,-s/2,s,s); ctx.restore(); }
      });
      ringShade(ctx,c,182,197,0.5,0.15);
      bevel(ctx,bp,W,H,0.25);
    }
  }

  window.AOGGlass={ render:render };
})();
