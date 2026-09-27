// @opts {"expo":1.1,"warm":.7,"bloom":.6,"vig":.32,"sat":1.08}
/* Science, Unit 1 "Pushes, Pulls and Stuff" (K–2 physical science): a playground at golden
   hour — a swing mid-arc, a slide, a red wagon with its handle out, and a ball on a small
   grassy hill. Low sun from the left, long soft shadows. */
#define CAM_POS vec3(-.5,1.5,1.5)
#define CAM_TGT vec3(1.,1.25,16.)
#define CAM_FOV 34.
#define SUN_DIR vec3(-1.,.13,-.3)
#define MAXT 1500.
#define EXPOSURE 1.
#define TAU_M .13
#define FOG_DENS .0012
#define FOG_H 60.
#define CLOUDS
#define CLOUD_COVER .3
#include "lib.glsl"
#include "pieces.glsl"

float hillR(vec2 xz){ vec2 d=xz-vec2(10.,14.); return 1.4*exp(-dot(d,d)/(2.*3.2*3.2)); }
float ground(vec2 xz){ return hillR(xz)+(fbm(xz*.05)-.5)*.6+smoothstep(52.,66.,xz.y)*(4.+fbm(xz*.03)*3.+(vn(xz*.25)+vn(xz*.6)*.5)*3.); }

/* swing set centred at S, crossbar along x */
#define SW vec3(-2.2,0.,15.)
#define SWR .6
float swingFrame(vec3 p){
  vec3 q=p-SW; q.xz=rot(SWR)*q.xz; float d=sdCapsule(q,vec3(-2.3,2.45,0),vec3(2.3,2.45,0),.045);
  for(int s=-1;s<=1;s+=2){ float x=2.2*float(s);
    d=min(d,sdCapsule(q,vec3(x,2.45,0),vec3(x*1.08,0.,-1.1),.04));
    d=min(d,sdCapsule(q,vec3(x,2.45,0),vec3(x*1.08,0.,1.1),.04)); }
  return d; }
/* one swing hanging from pivot x=px, swung by angle a about the crossbar; returns chains in .x, seat in .y */
vec2 swing(vec3 p,float px,float a){
  vec3 q=p-SW; q.xz=rot(SWR)*q.xz; q-=vec3(px,2.45,0); q.yz=rot(-a)*q.yz;
  float ch=min(sdCapsule(q,vec3(-.24,0,0),vec3(-.24,-1.9,0),.009),sdCapsule(q,vec3(.24,0,0),vec3(.24,-1.9,0),.009));
  float seat=sdRBox(q-vec3(0,-1.95,0),vec3(.27,.025,.1),.02);
  return vec2(ch,seat); }
/* slide: platform at P, chute runs toward -x and down */
#define SL vec3(3.6,0.,17.5)
vec2 slide(vec3 p){
  vec3 q=p-SL; float frame=1e5;
  for(int i=0;i<4;i++){ vec2 o=vec2(i<2?-.45:.45,(i%2==0)?-.45:.45); frame=min(frame,sdCapsule(q,vec3(o.x,0,o.y),vec3(o.x,2.4,o.y),.04)); }
  frame=min(frame,sdBox(q-vec3(0,1.5,0),vec3(.5,.035,.5)));
  frame=min(frame,sdCapsule(q,vec3(-.45,2.4,-.45),vec3(.45,2.4,-.45),.035));
  frame=min(frame,sdCapsule(q,vec3(-.45,2.4,.45),vec3(.45,2.4,.45),.035));
  /* ladder on +x */
  vec3 l=q-vec3(.95,0,0); l.xy=rot(-.28)*l.xy;
  frame=min(frame,min(sdCapsule(l,vec3(0,0,-.28),vec3(0,1.55,-.28),.03),sdCapsule(l,vec3(0,0,.28),vec3(0,1.55,.28),.03)));
  float ry=mod(l.y+.1,.3)-.15; frame=min(frame,max(sdCapsule(vec3(l.x,ry,l.z),vec3(0,0,-.28),vec3(0,0,.28),.022),l.y-1.5));
  /* chute */
  vec3 c=q-vec3(-.5,1.5,0); float ang=.52; c.xy=rot(ang)*c.xy;
  float len=3.;
  float trough=sdBox(c-vec3(-len*.5,.0,0),vec3(len*.5,.03,.32));
  float walls=sdBox(vec3(c.x+len*.5,c.y-.12,abs(c.z)-.32),vec3(len*.5,.14,.025));
  float chute=min(trough,walls);
  return vec2(frame,chute); }
#define WG vec3(-.6,0.,7.)
vec2 wagon(vec3 p){
  vec3 q=p-WG; q.xz=rot(.5)*q.xz;
  float tray=sdRBox(q-vec3(0,.36,0),vec3(.48,.12,.26),.025);
  tray=max(tray,-sdBox(q-vec3(0,.43,0),vec3(.45,.12,.23)));
  float wh=1e5;
  for(int i=0;i<4;i++){ vec3 o=vec3(i<2?-.32:.32,.13,(i%2==0)?-.27:.27); vec3 w=q-o; wh=min(wh,sdCylZ(w,.13,.035)-.012); }
  float axle=min(sdCapsule(q,vec3(-.32,.13,-.27),vec3(-.32,.13,.27),.012),sdCapsule(q,vec3(.32,.13,-.27),vec3(.32,.13,.27),.012));
  float handle=sdCapsule(q,vec3(.46,.2,0),vec3(1.05,.06,.18),.014);
  handle=min(handle,sdCapsule(q,vec3(1.05,.06,.1),vec3(1.05,.06,.26),.016));
  return vec2(min(tray,handle),min(wh,axle)); }
#define BALL vec3(7.4,0.,12.)
float ballY(){ return hillR(BALL.xz)+(fbm(BALL.xz*.05)-.5)*.6+.2; }

vec2 map(vec3 p){
  vec2 r=vec2((p.y-ground(p.xz))*.8,1.);
  if(length(p-SW-vec3(0,1.2,0))<4.){ r=U(r,swingFrame(p),2.);
    vec2 a=swing(p,-.9,0.); r=U(r,a.x,3.); r=U(r,a.y,4.);
    vec2 b=swing(p,.9,.62); r=U(r,b.x,3.); r=U(r,b.y,4.); }
  if(length(p-SL-vec3(-1.,1.,0))<3.8){ vec2 s=slide(p); r=U(r,s.x,2.); r=U(r,s.y,5.); }
  if(length(p-WG)<1.6){ vec2 w=wagon(p); r=U(r,w.x,6.); r=U(r,w.y,7.); }
  r=U(r,length(p-vec3(BALL.x,ballY(),BALL.z))-.2,8.);
  vec2 t1=sdTree(p,vec3(-14.,ground(vec2(-14.,42.))-.3,42.),4.,6.,2.2); r=U(r,t1.x,9.); r=U(r,t1.y,10.);
  vec2 t2=sdTree(p,vec3(16.,ground(vec2(16.,48.))-.3,48.),4.5,6.5,5.1); r=U(r,t2.x,9.); r=U(r,t2.y,10.);
  vec2 t3=sdTree(p,vec3(1.,ground(vec2(1.,62.))-.3,62.),4.5,6.,8.4); r=U(r,t3.x,9.); r=U(r,t3.y,10.);
  return r;
}
float grassH(vec3 p){ return grassHt(p.xz,footprint(distTo(p))); }
float leafH(vec3 p){ return fbm3L(p*3.5,footprint(distTo(p))*3.5,4); }
float chipsH(vec3 p){ vec3 v=voro(p.xz*28.); return smoothstep(0.,.08,v.y)*.3+v.z*.2; }
Mat material(float id,vec3 p,inout vec3 n){
  float dc=distTo(p), fp=footprint(dc);
  if(id==1.){
    vec3 g=grassAlb(p.xz,vec3(.075,.092,.035),fp);
    /* wood-chip bed under the swings and slide */
    vec2 d=(p.xz-vec2(.4,16.2))/vec2(6.3,3.2); float bed=smoothstep(1.02,.96,length(d));
    vec3 v=voro(p.xz*28.);
    vec3 ch=vec3(.2,.13,.075)*(.6+.5*v.z)*mix(.6,1.,smoothstep(0.,.1,v.y));
    ch=mix(vec3(.2,.13,.07)*.9,ch,1.-smoothstep(.2,.8,fp*28.));
    g=mix(g,ch,bed);
    float fo=smoothstep(52.,60.,p.z); if(fo>0.){ float lh=fbm3L(p*1.2,fp*1.2,4); g=mix(g,vec3(.022,.04,.014)*(.3+1.3*lh),fo); if(fo>.5){ BUMP(n,p,leafH,.6); Mat m=mat(g,.7); m.sss=.25; return m; } }
    if(dc<200.){ if(bed>.5) BUMP(n,p,chipsH,.25*smoothstep(30.,5.,dc)) else BUMP(n,p,grassH,.07*smoothstep(200.,20.,dc)); }
    Mat m=mat(g,.9); m.sss=.06*(1.-bed); return m; }
  if(id==2.){ Mat m=mat(vec3(.05,.16,.34)*(.9+.2*fbm(p.xy*30.)),.35); m.spec=.05; return m; }       /* painted steel */
  if(id==3.){ Mat m=mat(vec3(.55,.55,.55),.35); m.metal=1.; return m; }                             /* chain */
  if(id==4.){ return mat(vec3(.02),.6); }                                                           /* rubber seat */
  if(id==5.){ Mat m=mat(vec3(.55,.06,.03),.18); m.spec=.05; return m; }                              /* plastic chute */
  if(id==6.){ Mat m=mat(vec3(.50,.035,.025)*(.92+.1*fbm(p.xz*40.)),.28); m.spec=.06; return m; }     /* wagon paint */
  if(id==7.){ return mat(vec3(.025),.7); }
  if(id==8.){ vec3 q=p-vec3(BALL.x,ballY(),BALL.z); float st=step(0.,sin(atan(q.z,q.x)*3.));
    Mat m=mat(mix(vec3(.6,.42,.05),vec3(.05,.2,.5),st),.3); m.spec=.05; return m; }
  if(id==9.){ return mat(vec3(.03,.025,.02)*(.7+.6*fbm(p.xy*4.)),.9); }
  if(id==10.){ float lh=leafH(p); BUMP(n,p,leafH,.5); Mat m=mat(foliageAlb(p,vec3(.03,.05,.016))*(.45+1.1*lh),.65); m.sss=.3; return m; }
  return mat(vec3(.5),.5);
}
vec3 shade(vec3 p,vec3 n,vec3 rd,Mat m,float t){
  return shadeOutdoor(p,n,rd,m,t, m.sss>.2?6.:14., m.sss>.2?3.:.6, vec3(.15,.18,.08));
}
vec3 background(vec3 ro,vec3 rd){ return skyFull(ro,rd); }
vec3 atmosphere(vec3 c,vec3 ro,vec3 rd,float t){ return aerial(c,ro,rd,t); }
vec3 post(vec3 c,vec3 ro,vec3 rd,float t){ return c; }
