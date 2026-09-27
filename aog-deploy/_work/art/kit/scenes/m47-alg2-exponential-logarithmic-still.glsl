/* Room m47 "Algebra II: Exponential and Logarithmic Functions" — pencil still life: the
   doubling-on-a-chessboard story: a wooden chessboard with towers of small wooden cubes on the
   first four squares of its front row, one, two, four and eight cubes tall. */
#define CAM_POS vec3(-0.4108,0.3717,-0.6809)
#define CAM_TGT vec3(-0.1790,0.0002,0.1087)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define SQ .034
#define BT .014
vec3 cbQ(vec3 p){ return place(p,vec3(.04,0.,.06),-.3); }
float boardD(vec3 q){
  float d=sdRBox(q-vec3(0.,BT*.5,0.),vec3(4.*SQ+.016,BT*.5,4.*SQ+.016),.003);
  return max(d,-sdBox(q-vec3(0.,BT+.0006,0.),vec3(4.*SQ,.0012,4.*SQ))); }
/* square k of the front row (k=0 at the left), centre on the board top */
vec3 sqC(float k){ return vec3((k-3.5)*SQ,BT,-3.5*SQ); }
/* towers of cubes that double: 1, 2, 4 and 8 cubes on the first four squares of the front row */
#define CB .0135
float cube1(vec3 c,float i,float k){ float j=h1(vec2(i,k))-.5;
  vec3 b=c-vec3(.0015*j,(i+.5)*2.*CB,.0015*sin(i*2.1+k)); b.xz=rot(.08*j)*b.xz;
  return sdRBox(b,vec3(CB-.0004),.0022); }
float towersD(vec3 q){ float d=1e5;
  for(int kk=0;kk<4;kk++){ float k=float(kk); vec3 c=q-sqC(k); float n=pow(2.,k);
    float i=clamp(floor(c.y/(2.*CB)),0.,n-1.);
    d=min(d,cube1(c,i,k));
    if(i>0.) d=min(d,cube1(c,i-1.,k));
    if(i<n-1.) d=min(d,cube1(c,i+1.,k)); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.6-dot(p.xz-CAM_TGT.xz,normalize(CAM_TGT.xz-CAM_POS.xz)),2.);
  vec3 b=cbQ(p);
  r=U(r,boardD(b),3.);
  r=U(r,towersD(b),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=cbQ(p); if(q.y<BT-.0005||max(abs(q.x),abs(q.z))>4.*SQ) return .45+.08*grain(q,30.);
    vec2 g=floor(q.xz/SQ); return mod(g.x+g.y,2.)<.5?.3:.86; }
  if(id==4.){ vec3 q=cbQ(p); float k=clamp(floor(q.x/SQ+4.),0.,3.); float i=floor((q.y-BT)/(2.*CB));
    return mod(i+k,2.)<.5?.82:.62; }
  return .7; }
