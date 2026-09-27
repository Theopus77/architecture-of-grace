/* Room "Punctuation That Changes the Meaning" — pencil still life: three wooden blocks carved
   with a question mark, an exclamation mark and a comma (one stacked on two), and a pencil. */
#define CAM_POS vec3(-0.3713,0.2960,-0.6890)
#define CAM_TGT vec3(-0.1343,0.0165,0.0564)
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
#define BH .05
float carve2(float d3,vec2 uv,int g,float sz,float w,float z,float dep){
  float gd=glyph2(uv/sz,g)*sz-w; return max(d3,-max(gd,abs(z)-dep)); }
float block(vec3 p,vec3 c,float ry,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float d=sdRBox(q,vec3(BH),.006);
  d=carve2(d,q.xy,g,.078,.0062,q.z+BH,.004);
  d=carve2(d,vec2(-q.z,q.y),g2,.072,.0058,q.x-BH,.004);
  return d; }
float ink(vec3 p,vec3 c,float ry,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  if(q.z<-BH+.008&&glyph2(q.xy/.078,g)*.078<.0085) return .15;
  if(q.x>BH-.008&&glyph2(vec2(-q.z,q.y)/.072,g2)*.072<.008) return .15;
  vec2 f=q.z<-BH+.003?q.xy:q.x>BH-.003?vec2(q.z,q.y):q.xz;
  if(abs(max(abs(f.x),abs(f.y))-BH*.86)<.0022) return .45;
  return .78; }
#define C1 vec3(-.06,BH,.03)
#define C2 vec3(.06,BH,.0)
#define C3 vec3(.0,3.*BH+.001,.02)
vec3 pcQ(vec3 p){ vec3 q=p-vec3(.1,.0062,-.12); q.xz=rot(-.2)*q.xz; q.yz=rot(.3)*q.yz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,block(p,C1,.25,33,46),3.);
  r=U(r,block(p,C2,-.2,44,63),4.);
  r=U(r,block(p,C3,.05,63,33),5.);
  r=U(r,pencilD2(pcQ(p),.1),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return ink(p,C1,.25,33,46);
  if(id==4.) return ink(p,C2,-.2,44,63);
  if(id==5.) return ink(p,C3,.05,63,33);
  if(id==6.) return pencilTone(pcQ(p),.1);
  return .7; }
