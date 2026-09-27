/* Room "Pushes and Pulls" — pencil still life: a wooden toy car at the top of a board ramp
   propped on a block, a ball at the foot of the ramp, and a horseshoe magnet. */
#define CAM_POS vec3(-0.3639,0.3012,-0.5510)
#define CAM_TGT vec3(-0.1636,-0.0208,0.0499)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define RA .32
vec3 rampQ(vec3 p){ vec3 q=p-vec3(-.02,0.,.06); q.xz=rot(.15)*q.xz; return q; }
/* ramp frame: board rising toward -x at angle RA, from x=.13 (table) */
vec3 boardQ(vec3 p){ vec3 q=rampQ(p)-vec3(.13,0.,0.); q.xy=rot(-RA)*q.xy; return q; }   /* board local: x along board (negative up the slope) */
float boardD(vec3 p){ vec3 q=boardQ(p); float d=sdRBox(q-vec3(-.15,.007,0.),vec3(.15,.006,.06),.003);
  float rail=sdRBox(vec3(q.x+.15,q.y-.016,abs(q.z)-.056),vec3(.15,.006,.004),.002); return min(d,rail); }
float blockD(vec3 p){ vec3 q=rampQ(p)-vec3(-.13,0.,0.); return sdRBox(q-vec3(0.,.041,0.),vec3(.03,.041,.07),.004); }
vec3 carQ(vec3 p){ vec3 q=boardQ(p)-vec3(-.19,.013,0.); return q; }
float carD(vec3 p){ vec3 q=carQ(p);
  float body=sdRBox(q-vec3(0.,.027,0.),vec3(.05,.012,.026),.008);
  float cab=sdRBox(q-vec3(.008,.048,0.),vec3(.026,.012,.022),.009);
  float win=sdRBox(q-vec3(.008,.049,0.),vec3(.028,.006,.024),.003);
  return max(min(body,cab),-max(win,-(abs(q.z)-.018))*1.); }
float wheelsD(vec3 p){ vec3 q=carQ(p); q.x=abs(q.x)-.031; q.z=abs(q.z)-.026;
  float w=sdCylZ(q-vec3(0.,.013,0.),.0125,.005)-.0015; return w; }
float ballB(vec3 p){ return length(p-vec3(.2,.032,-.03))-.032; }
vec3 magQ(vec3 p){ vec3 q=p-vec3(.1,.009,-.14); q.xz=rot(-.6)*q.xz; return q; }
float magD(vec3 p){ vec3 q=magQ(p);
  float u=max(abs(length(q.xz)-.03)-.011,-q.x);
  float legs=sdBox(vec3(q.x+.025,q.y,abs(q.z)-.03),vec3(.025,.008,.011));
  float d=max(min(u,legs),abs(q.y)-.008);
  return d-.001; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,boardD(p),3.);
  r=U(r,blockD(p),4.);
  r=U(r,carD(p),5.);
  r=U(r,wheelsD(p),6.);
  r=U(r,ballB(p),7.);
  r=U(r,magD(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .55+.2*grain(boardQ(p).zyx,60.);
  if(id==4.){ vec3 q=rampQ(p)-vec3(-.13,0.,0.); if(q.z<-.068) return .7; return .5+.12*grain(q,40.); }
  if(id==5.){ vec3 q=carQ(p); if(q.y>.04&&abs(q.z)>.017) return .25; return .6; }
  if(id==6.){ vec3 q=carQ(p); q.x=abs(q.x)-.031; return length(q.xy-vec2(0.,.013))<.005?.8:.2; }
  if(id==7.){ vec3 q=p-vec3(.2,.032,-.03); return abs(q.y+.3*q.x)<.008?.3:.8; }
  if(id==8.){ vec3 q=magQ(p); return q.x<-.035?.85:.3; }
  return .7; }
