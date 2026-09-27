/* m40 "Algebra I: Systems" — a wooden geoboard propped up on its stand, with two taut strings
   stretched between pegs so they cross at one point, a brass ring marking that point, and a
   pencil and a cup of spare pegs on the table. */
#define CAM_POS vec3(-0.6140,0.2490,-0.8013)
#define CAM_TGT vec3(-0.2341,0.0318,0.1758)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
/* board frame: centre at BC, face toward -z, leaning back by LEAN */
#define BC vec3(-.02,.15,.14)
#define LEAN .22
#define BW .15
#define BH .13
#define GAP .026
vec3 bdQ(vec3 p){ vec3 q=p-BC; q.xz=rot(-.18)*q.xz; q.yz=rot(-LEAN)*q.yz; return q; }
float board(vec3 q){ return sdRBox(q,vec3(BW,BH,.009),.004); }
/* peg positions on the grid: i,j in -5..5 */
vec2 gp(float i,float j){ return vec2(i,j)*GAP; }
float pegs(vec3 q){ vec2 c=clamp(floor(q.xy/GAP+.5),vec2(-5.,-4.),vec2(5.,4.))*GAP;
  vec3 k=q-vec3(c,-.009);
  float d=sdCylZ(k-vec3(0.,0.,-.008),.0024,.008);
  d=min(d,length(k-vec3(0.,0.,-.017))-.0036);
  return d; }
/* the two lines: a peg-to-peg segment each, lifted just off the board */
#define A0 vec2(-5.,-4.)
#define A1 vec2( 5., 4.)
#define B0 vec2(-5., 3.)
#define B1 vec2( 5.,-1.)
vec3 lp(vec2 g){ return vec3(g*GAP,-.021); }
float strings(vec3 q){
  float d=sdCapsule(q,lp(A0),lp(A1),.0016);
  d=min(d,sdCapsule(q,lp(B0),lp(B1),.0016));
  return d; }
vec2 xpt(){ /* crossing point in grid units */
  vec2 a=A0,b=A1-A0,c=B0,e=B1-B0; float t=((c.x-a.x)*e.y-(c.y-a.y)*e.x)/(b.x*e.y-b.y*e.x); return a+b*t; }
float ring(vec3 q){ vec3 k=q-lp(xpt()); return sdTorus(k.xzy,.011,.0035); }
float stand(vec3 p){ vec3 q=p-BC; q.xz=rot(-.18)*q.xz;
  /* a heavy foot rail and a back strut */
  float f=sdRBox(q-vec3(0.,-BC.y+.012,-.01),vec3(BW+.02,.012,.035),.004);
  vec3 s=q-vec3(0.,-.03,.075); s.yz=rot(.5)*s.yz;
  float st=sdRBox(s,vec3(.018,.12,.006),.003);
  return min(f,st); }
vec3 pcQ(vec3 p){ return place(p,vec3(.1,.0062,-.07),.35); }
float pencil(vec3 p){ return pencilD2(pcQ(p),.075); }
#define CP vec3(.27,0.,.02)
float cup(vec3 p){ return cupD(p-CP,.034,.075,0.); }
float spare(vec3 p){ vec3 q=p-CP; float d=1e5;
  for(int i=0;i<5;i++){ float fi=float(i); vec3 a=vec3(.012*sin(fi*2.4),.06,.012*cos(fi*2.4));
    vec3 b=a+vec3(.02*sin(fi*1.7+1.),.04,.02*cos(fi*2.1)); d=min(d,sdCapsule(q,a,b,.0026)); d=min(d,length(q-b)-.0038); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=bdQ(p);
  r=U(r,board(q),3.);
  r=U(r,pegs(q),4.);
  r=U(r,strings(q),5.);
  r=U(r,ring(q),6.);
  r=U(r,stand(p),7.);
  r=U(r,pencil(p),8.);
  r=U(r,cup(p),9.);
  r=U(r,spare(p),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bdQ(p); if(abs(q.x)>BW-.012||abs(q.y)>BH-.012) return .45; return .7+.06*grain(q.zyx,4.); }
  if(id==4.) return .5;
  if(id==5.) return .12;
  if(id==6.) return .35;
  if(id==7.) return .45;
  if(id==8.) return pencilTone(pcQ(p),.075);
  if(id==9.) return .8;
  return .7; }
