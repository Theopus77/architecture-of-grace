/* Math Unit 8 "Fractions" — pencil still life: a round pie cut into eight equal slices on a
   plate, with one slice lifted out onto the table in front. */
#define CAM_POS vec3(-0.3020,0.3385,-0.5173)
#define CAM_TGT vec3(-0.1572,-0.0598,0.0983)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define PC vec3(.03,0.,.1)
#define PR .14
float pieBody(vec3 q){ /* q: pie space, y up from plate top */
  float r=length(q.xz); float h=.035-.004*smoothstep(PR-.02,PR,r);
  float body=sdCylY(q-vec3(0.,h*.5,0.),PR-.004,h*.5)-.004;
  float rim=length(vec2(r-PR+.01,q.y-.034))-.013;
  return smin(body,rim,.006); }
float slices(vec3 q,float gap){ float a=atan(q.z,q.x); float s=PI/4.; float k=mod(a+s*.5,s)-s*.5; return abs(sin(k))*length(q.xz)-gap; }
#define AL (PI/8.)
float wedgeD(vec2 u){ return max(dot(u,vec2(cos(AL),sin(AL))),dot(u,vec2(-cos(AL),sin(AL)))); }
/* the lifted slice: its point sits a little in front of the pie, turned */
vec3 SQ(vec3 p){ vec3 q=p-PC-vec3(.06,0.,-.1); q.xz=rot(-.5)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=p-PC; float plate=max(sdCylY(q-vec3(0.,.006,0.),PR+.045,.006)-.002,-(sdCylY(q-vec3(0.,.013,0.),PR+.01,.003)));
  r=U(r,plate,3.);
  vec3 pq=q-vec3(0.,.012,0.);
  float pie=max(pieBody(pq),-slices(pq,.0015));
  pie=max(pie,-(wedgeD(pq.xz)+.004));
  r=U(r,pie,4.);
  vec3 sq=SQ(p);
  r=U(r,max(pieBody(sq),wedgeD(sq.xz-vec2(0.,.004))),5.);
  return r; }
float crustT(vec3 q){ float r=length(q.xz); if(r>PR-.022) return .5+.08*sin(atan(q.z,q.x)*48.); return .62+.1*fbm(q.xz*120.); }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .9;
  if(id==4.){ vec3 q=p-PC-vec3(0.,.012,0.); if(n.y<.6&&length(q.xz)<PR-.02) return .35; return crustT(q); }
  if(id==5.){ vec3 sq=SQ(p); if(n.y<.6&&length(sq.xz)<PR-.02) return .35; return crustT(sq); }
  return .7; }
