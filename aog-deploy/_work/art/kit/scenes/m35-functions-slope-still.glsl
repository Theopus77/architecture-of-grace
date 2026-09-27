/* Room m35 "Functions and Slope" — pencil still life: a wooden pegboard (a geoboard) leaning
   back on a stand, a dark rubber band stretched in one straight sloping line across its pegs
   and a pale band showing the rise and the run; beside it a plank ramp resting on a stack of
   three blocks, with a ball at its foot. */
#define CAM_POS vec3(-0.2420,0.2797,-0.7922)
#define CAM_TGT vec3(-0.0423,0.0258,0.0698)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define GB .115
#define GS .044
/* board leaning back: local y is its face normal, local x across, local z up the board */
vec3 gbQ(vec3 p){ vec3 q=p-vec3(0.,.118,.1); q.xz=rot(-.12)*q.xz; q.yz=rot(-1.12)*q.yz; return q; }
float boardD(vec3 q){ return sdRBox(q-vec3(0.,-.008,0.),vec3(GB,.008,GB),.004); }
vec3 peg(float i,float j){ return vec3((i-2.)*GS,0.,(j-2.)*GS); }
float pegsD(vec3 q){ vec2 c=clamp(floor(q.xz/GS+2.5),0.,4.); vec3 k=q-peg(c.x,c.y);
  return min(sdCylY(k-vec3(0.,.008,0.),.0035,.008),sdCylY(k-vec3(0.,.017,0.),.0048,.0015)-.0008); }
float bandSeg(vec3 q,vec3 a,vec3 b){ return sdCapsule(q,a+vec3(0.,.01,0.),b+vec3(0.,.01,0.),.0024); }
float lineD(vec3 q){ return bandSeg(q,peg(0.,1.),peg(4.,4.)); }       /* slope 3/4 */
float stepD(vec3 q){ return min(bandSeg(q,peg(0.,1.),peg(4.,1.)),bandSeg(q,peg(4.,1.),peg(4.,4.))); }
float standD(vec3 p){ vec3 q=p; q.xz=rot(-.12)*q.xz;
  float d=sdRBox(q-vec3(0.,.01,.036),vec3(GB+.01,.01,.014),.003);
  d=min(d,sdCapsule(vec3(abs(q.x),q.y,q.z),vec3(.07,0.,.27),vec3(.07,.18,.17),.005));
  return d; }
/* the ramp: three blocks stacked, a plank from their top down to the table */
vec3 rpQ(vec3 p){ return place(p,vec3(.28,0.,-.07),-.3); }
float blocksD(vec3 q){ float d=1e5;
  for(int i=0;i<3;i++){ float fi=float(i); d=min(d,sdRBox(q-vec3(-.1+.002*sin(fi*3.),.018+fi*.036,.003*cos(fi*2.)),vec3(.03,.018,.03),.003)); }
  return d; }
float plankD(vec3 q){ vec3 a=vec3(-.1,.108,0.), b=vec3(.1,0.,0.); vec3 c=q-(a+b)*.5; float ang=atan(b.y-a.y,b.x-a.x);
  c.xy=rot(ang)*c.xy; return sdRBox(c-vec3(0.,.006,0.),vec3(length(b-a)*.5,.005,.026),.002); }
vec3 ballP(vec3 q){ return q-vec3(.15,.022,-.0); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,6.-p.z,2.);
  vec3 g=gbQ(p);
  r=U(r,boardD(g),3.);
  r=U(r,pegsD(g),4.); r=U(r,lineD(g),5.); r=U(r,stepD(g),6.);
  r=U(r,standD(p),7.);
  vec3 q=rpQ(p);
  r=U(r,blocksD(q),8.);
  r=U(r,plankD(q),9.);
  r=U(r,length(ballP(q))-.022,10.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=gbQ(p); return .66+.1*grain(q.xzy,30.); }
  if(id==4.) return .4;
  if(id==5.) return .15;
  if(id==6.) return .72;
  if(id==7.) return .55;
  if(id==8.){ vec3 q=rpQ(p); return .8-.2*step(.036,mod(q.y,.072)); }
  if(id==9.) return .6+.1*grain(rpQ(p),30.);
  if(id==10.){ vec3 b=ballP(rpQ(p)); return .72-.08*b.y/.022; }
  return .7; }
