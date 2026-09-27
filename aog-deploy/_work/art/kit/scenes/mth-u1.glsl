// @opts {"expo":.11,"warm":.35,"bloom":.25,"vig":.3,"sat":1.06}
/* Math, Unit 1 "Counting and Numbers" (K–2): a yellow school bus at the curb on a bright
   morning outside a brick school; a hundred-chart poster (a ten-by-ten grid of coloured
   squares, no numerals) in one window, and ten-frame squares painted on the sidewalk.
   No people. */
#define CAM_POS vec3(-6.5,1.5,-5.2)
#define CAM_TGT vec3(6.,1.5,2.2)
#define CAM_FOV 34.
#define SUN_DIR vec3(-.55,.55,-.75)
#define MAXT 400.
#define EXPOSURE 1.
#define TAU_M .08
#define FOG_DENS .0015
#define FOG_H 40.
// no clouds: under a high sun they read grey
#define SKY_GAIN 2.6
#define CLOUD_COVER .3
#include "lib.glsl"
#include "pieces.glsl"

#define WALLZ 5.2
/* bus: front at x=BX, body along +x, centre line z=BZ */
#define BX 3.2
#define BZ -1.45
vec2 bus(vec3 p){
  vec3 q=p-vec3(BX,0,BZ);
  float body=sdRBox(q-vec3(6.9,1.85,0),vec3(5.6,1.25,1.2),.16);
  float roof=sdRBox(q-vec3(6.9,3.0,0),vec3(5.55,.12,1.1),.1);
  float hood=sdRBox(q-vec3(.75,1.18,0),vec3(.62,.5,1.02),.14);
  float grille=sdRBox(q-vec3(.12,1.0,0),vec3(.04,.32,.55),.02);
  float bump=sdRBox(q-vec3(.1,.55,0),vec3(.12,.1,1.18),.03);
  /* wheel arches cut and wheels */
  float wa=min(length(q.xy-vec2(1.1,.5))-.62,length(q.xy-vec2(9.6,.5))-.62);
  float shell=min(min(body,roof),hood); shell=max(shell,-max(wa,abs(q.z)-1.4));
  shell=max(shell,-(q.y-.45));
  float wh=1e5; for(int i=0;i<2;i++){ vec3 w=q-vec3(i==0?1.1:9.6,.5,0); w.z=abs(w.z)-1.0; wh=min(wh,sdCylZ(w,.5,.15)-.03); }
  float d=min(shell,min(grille,bump));
  return vec2(d,wh); }
float building(vec3 p){
  float wall=max(WALLZ-p.z,p.y-6.4);
  /* window recesses */
  float wx=mod(p.x+1.,4.)-2.; vec3 w=vec3(wx,p.y-2.5,p.z-WALLZ);
  float win=sdBox(w,vec3(1.1,1.,.12));
  wall=max(wall,-win);
  float cop=sdBox(vec3(p.x,p.y-6.45,p.z-WALLZ-.1),vec3(200.,.12,.35));
  float sill=sdBox(vec3(wx,p.y-1.45,p.z-WALLZ+.02),vec3(1.2,.05,.1));
  return min(min(wall,cop),sill); }
float glass(vec3 p){ return p.z-(WALLZ+.1); }
vec2 map(vec3 p){
  vec2 r=vec2(1e5,-1.);
  /* road below the curb, sidewalk above it */
  float curb=p.z<0.?p.y:max(p.y-.15,-p.z);
  r=U(r,min(p.y,max(p.y-.15,-p.z)),1.);
  r=U(r,building(p),3.);
  r=U(r,max(glass(p),WALLZ+.02-p.z),4.);
  vec2 b=bus(p); r=U(r,b.x,5.); r=U(r,b.y,6.);
  vec2 t1=sdTree(p,vec3(-6.,.1,9.),4.,4.,1.2); r=U(r,t1.x,7.); r=U(r,t1.y,8.);
  vec2 t2=sdTree(p,vec3(22.,.1,-13.),4.5,5.,3.3); r=U(r,t2.x,7.); r=U(r,t2.y,8.);
  vec2 t3=sdTree(p,vec3(10.,.1,-15.),4.,5.5,6.1); r=U(r,t3.x,7.); r=U(r,t3.y,8.);
  vec2 t4=sdTree(p,vec3(34.,.1,-12.),4.,4.5,8.8); r=U(r,t4.x,7.); r=U(r,t4.y,8.);
  /* far houses/trees across the road */
  r=U(r,(p.y+.05-smoothstep(-18.,-24.,p.z)*(4.+fbm(p.xz*.1)*6.))*.7,9.);
  return r;
}
float leafH(vec3 p){ return fbm3L(p*3.5,footprint(distTo(p))*3.5,4); }
Mat material(float id,vec3 p,inout vec3 n){
  float dc=distTo(p), fp=footprint(dc);
  if(id==1.){
    if(p.y>.075&&p.z>0.){ /* concrete sidewalk with joints and the painted ten-frames */
      vec3 a=vec3(.42,.41,.38)*(.82+.25*fbmL(p.xz*6.,fp*6.,5));
      float jx=abs(fract(p.x/1.5)-.5)*1.5, jz=abs(p.z-2.6);
      a*=mix(.55,1.,smoothstep(.004,.012,min(jx,jz)));
      a=mix(a,a*.8,step(p.z,.3)*step(.1,p.y));                 /* curb face */
      /* two ten-frames: 5 x 2 squares, 0.36 m cells, white paint, worn */
      for(int k=0;k<2;k++){ vec2 o=vec2(k==0?-2.6:-.4,.9); vec2 c=(p.xz-o)/.36;
        if(c.x>0.&&c.x<5.&&c.y>0.&&c.y<2.){ vec2 f=abs(fract(c)-.5); float line=smoothstep(.43,.46,max(f.x,f.y));
          float edge=smoothstep(.02,.0,min(min(c.x,5.-c.x),min(c.y,2.-c.y)));
          float wear=smoothstep(.3,.6,fbm(p.xz*9.));
          a=mix(a,vec3(.8,.8,.76),max(line,edge)*wear);
          /* some squares filled with a colour, like counting dots */
          vec2 ci=floor(c); float filled=step(ci.x+ci.y*5.,float(k==0?7:3));
          float dot_=smoothstep(.3,.26,length(fract(c)-.5));
          a=mix(a,k==0?vec3(.6,.1,.08):vec3(.08,.2,.55),dot_*filled*wear*.9); } }
      return mat(a,.85); }
    vec3 a=vec3(.07,.07,.075)*(.8+.4*fbmL(p.xz*4.,fp*4.,5)); /* asphalt */
    a*=1.+.5*step(.985,vn(p.xz*60.))*(1.-smoothstep(.1,.3,fp*60.));
    return mat(a,.8); }
  if(id==3.){ /* brick, running bond, with mortar */
    vec2 b=vec2(p.x+p.z,p.y)/vec2(.215,.075); b.x+=.5*mod(floor(b.y),2.);
    vec2 f=fract(b); float mortar=smoothstep(.0,.06,min(min(f.x,1.-f.x)*.215/.075,min(f.y,1.-f.y)));
    vec3 a=vec3(.36,.14,.08)*(.75+.5*h1(floor(b)))*(.9+.2*fbmL(p.xy*20.,fp*20.,3));
    a=mix(vec3(.5,.48,.44),a,mortar);
    if(p.y>6.2||abs(p.z-WALLZ-.1)<.4&&p.y>6.2) a=vec3(.55,.53,.5);
    float wx=mod(p.x+1.,4.)-2.; if(abs(wx)<1.25&&abs(p.y-2.5)<1.12) a=vec3(.8,.8,.78);   /* white frames and sill */
    return mat(a,.85); }
  if(id==4.){ /* window glass; one window holds the hundred chart */
    Mat m=mat(vec3(.02,.025,.03),.05); m.refl=1.;
    float wi=floor((p.x+1.)/4.);
    vec2 u=vec2(mod(p.x+1.,4.)-2.,p.y-2.5);
    if(wi==2.&&abs(u.x)<.62&&abs(u.y)<.72){                 /* the poster behind the glass */
      vec2 c=(u+vec2(.55,.62))/vec2(1.1,1.1)*10.;
      vec3 a=vec3(.85,.84,.8);
      if(c.x>0.&&c.x<10.&&c.y>0.&&c.y<10.){ vec2 f=abs(fract(c)-.5); vec2 ci=floor(c);
        float row=ci.y; vec3 rc=.5+.4*cos(6.28*(row/10.+vec3(0.,.33,.67)));
        a=mix(rc*.8+.1,vec3(.95),.35); a*=mix(.6,1.,smoothstep(.46,.42,max(f.x,f.y))); }
      m.alb=a*.85; m.refl=.25; m.rough=.6; }
    else { /* dim classroom interior */ m.alb=vec3(.05,.045,.04)*(.7+.6*fbm(u*3.)); }
    return m; }
  if(id==5.){ vec3 q=p-vec3(BX,0,BZ);
    vec3 a=vec3(.62,.36,.015);
    Mat m=mat(a,.25); m.spec=.06;
    /* black rub rails and window band */
    float rails=step(abs(q.y-1.02),.035)+step(abs(q.y-1.42),.035)+step(abs(q.y-.62),.04);
    if(q.x>1.4&&q.y>1.95&&q.y<2.78){ float px=fract((q.x-1.4)/.82); if(px>.1){ m.alb=vec3(.015); m.rough=.05; m.refl=.9; m.spec=.04; }
      else m.alb=a; }
    if(q.x<1.45&&q.y>1.75&&q.y<2.75&&q.x>1.3){ m.alb=vec3(.015); m.refl=.9; m.rough=.05; }   /* windscreen */
    if(rails>0.) { m.alb=vec3(.02); m.rough=.4; }
    if(q.y<.66) { m.alb=vec3(.03); m.rough=.6; }                                     /* skirt, bumper */
    if(abs(q.x-.12)<.06&&q.y>.7&&q.y<1.32){ m.alb=vec3(.5); m.metal=1.; m.rough=.3; } /* grille */
    if(q.x<.3&&abs(abs(q.z)-.75)<.12&&abs(q.y-1.3)<.1){ m.emit=vec3(1.2,1.1,.9); m.alb=vec3(.9); }
    return m; }
  if(id==6.){ vec3 q=p-vec3(BX,0,BZ); float r=length(q.xy-vec2(q.x<5.?1.1:9.6,.5));
    Mat m=mat(vec3(.02),.8); if(r<.28){ m.alb=vec3(.55); m.metal=1.; m.rough=.35; } return m; }
  if(id==7.){ return mat(vec3(.05,.04,.03)*(.7+.6*fbm(p.xy*4.)),.9); }
  if(id==8.){ float lh=leafH(p); BUMP(n,p,leafH,.5); Mat m=mat(foliageAlb(p,vec3(.04,.075,.02))*(.45+1.1*lh),.65); m.sss=.3; return m; }
  if(id==9.){ float lh=fbm3L(p*.8,fp*.8,4); Mat m=mat(vec3(.04,.06,.025)*(.4+1.2*lh),.8); m.sss=.2; return m; }
  return mat(vec3(.5),.5);
}
vec3 shade(vec3 p,vec3 n,vec3 rd,Mat m,float t){ return shadeOutdoor(p,n,rd,m,t,12.,1.,vec3(.3,.3,.28)); }
vec3 background(vec3 ro,vec3 rd){ return skyFull(ro,rd); }
vec3 atmosphere(vec3 c,vec3 ro,vec3 rd,float t){ return aerial(c,ro,rd,t); }
vec3 post(vec3 c,vec3 ro,vec3 rd,float t){ return c; }
