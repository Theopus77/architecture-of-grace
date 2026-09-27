/* sp13 "Five Vowels That Never Change" — a wooden letter rack holding five tiles carved A, E,
   I, O and U, with a brass hand bell (the sound) standing behind it. */
#define CAM_POS vec3(-0.4582,0.2565,-0.4811)
#define CAM_TGT vec3(-0.1286,0.0142,0.0943)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#include "roomparts_e.glsl"
#define TW .024
#define TH .03
vec3 rQ(vec3 p){ return plc(p,vec3(0.,0.,-.04),-.42); }
float rack(vec3 p){ vec3 q=rQ(p);
  float base=sdRBox(q-vec3(0.,.008,0.),vec3(.155,.008,.028),.003);
  vec3 b=q-vec3(0.,.022,.018); b.yz=rot(-.25)*b.yz;
  float back=sdRBox(b,vec3(.155,.02,.006),.003);
  return min(base,back); }
vec3 tQ(vec3 p,int i){ vec3 q=rQ(p)-vec3(-.12+.06*float(i),.016+TH,.006); q.yz=rot(-.25)*q.yz; return q; }
int vg(int i){ return i==0?65:i==1?69:i==2?73:i==3?79:85; }
float tiles(vec3 p){ float d=1e5;
  for(int i=0;i<5;i++){ vec3 q=tQ(p,i); float t=sdRBox(q,vec3(TW,TH,.006),.003);
    if(t<.01) t=carveX(t,q.xy,vg(i),.042,.0032,q.z+.006,.0025);
    d=min(d,t); }
  return d; }
float tileInk(vec3 p){ for(int i=0;i<5;i++){ vec3 q=tQ(p,i);
    if(abs(q.x)<TW+.002&&abs(q.y)<TH+.002){ if(q.z<-.003&&glyphX(q.xy/.042,vg(i))*.042<.0045) return .15; return .8; } }
  return .8; }
vec3 bQ(vec3 p){ return p-vec3(.2,0.,.06); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,rack(p),3.);
  r=U(r,tiles(p),4.);
  r=U(r,bellE(bQ(p)),5.);
  r=U(r,bellHandle(bQ(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.) return tileInk(p);
  if(id==5.){ vec3 q=bQ(p); return abs(q.y-.022)<.002?.35:.6; }
  if(id==6.) return .35;
  return .7; }
