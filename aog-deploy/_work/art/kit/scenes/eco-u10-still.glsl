/* Economics Unit 10 "The Nation and the World" — pencil still life: a model cargo ship
   loaded with stacked shipping containers, on a wooden stand, beside a small desk globe. */
#define CAM_POS vec3(-0.2186,0.2000,-0.6488)
#define CAM_TGT vec3(-0.1229,0.0318,0.0715)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define SC vec3(.02,0.,.14)
vec3 sq(vec3 p){ vec3 q=p-SC; q.xz=rot(-.35)*q.xz; return q; }
vec2 ship(vec3 p){
  vec3 q=sq(p);
  vec3 h=q-vec3(0.,.06,0.);
  float t=clamp(h.x/.2,-1.,1.);
  float w=.045*sqrt(max(1.-pow(max(t,0.),3.),0.))+.001;
  float hull=max(max(abs(h.z)-w*(.7+.3*clamp((h.y+.035)/.035,0.,1.)),-.035-h.y+.01*t*t),max(h.y,abs(h.x)-.2))*.9;
  float bridge=sdRBox(q-vec3(-.16,.09,0.),vec3(.022,.03,.04),.002);
  float funnel=sdRBox(q-vec3(-.185,.125,0.),vec3(.008,.015,.012),.002);
  float stand=min(sdRBox(q-vec3(-.09,.013,0.),vec3(.008,.013,.03),.002),sdRBox(q-vec3(.09,.013,0.),vec3(.008,.013,.03),.002));
  stand=min(stand,sdRBox(q-vec3(0.,.004,0.),vec3(.13,.004,.035),.002));
  float boxes=1e5;
  for(int i=0;i<5;i++) for(int j=0;j<2;j++) for(int k=0;k<2;k++){ if(j==1&&(i==0||i==4)) continue;
    boxes=min(boxes,sdRBox(q-vec3(-.1+float(i)*.052,.072+float(j)*.026,-.018+float(k)*.036),vec3(.024,.012,.016),.0015)); }
  return vec2(min(min(hull,bridge),min(funnel,stand)),boxes); }
#define GC vec3(.33,.1,.12)
vec2 globe(vec3 p){
  vec3 q=p-GC;
  float ball=length(q)-.06;
  vec3 m=q; m.xy=rot(-.41)*m.xy;
  float ring=max(abs(length(m.xy)-.068)-.003,abs(m.z)-.003);
  vec3 b=p-vec3(GC.x,0.,GC.z);
  float base=sdCone(b-vec3(0.,.008,0.),.045,.035,.008)-.002;
  float neck=sdCylY(b-vec3(0.,.025,0.),.006,.02);
  return vec2(ball,min(ring,min(base,neck))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 s=ship(p); r=U(r,s.x,3.); r=U(r,s.y,4.);
  vec2 g=globe(p); r=U(r,g.x,5.); r=U(r,g.y,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=sq(p); if(q.y<.045&&q.y>.03) return .8; return .35; }
  if(id==4.){ vec3 q=sq(p); float c=floor((q.x+.126)/.052)+floor((q.y-.06)/.026)*3.+floor((q.z+.036)/.036)*2.;
    float v=mod(c,3.)==0.?.4:mod(c,3.)==1.?.65:.8; if(abs(n.y)<.5&&fract((q.x+.2)/.006)<.3) v-=.12; return v; }  /* ribbed containers */
  if(id==5.){ vec3 q=normalize(p-GC); float land=smoothstep(.5,.54,fbm3(q*1.9+vec3(3.1,1.7,.4))); return land>.5?.4:.85; }
  if(id==6.) return .4;
  return .7; }
