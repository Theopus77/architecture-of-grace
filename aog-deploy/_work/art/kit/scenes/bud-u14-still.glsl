/* Buddhist Texts Unit 14 "Jatakas and Hard Questions" — pencil still life: a small bamboo raft
   of lashed poles resting on the table (the parable of the raft), with a wooden paddle laid
   across it and a few smooth river stones. Objects only. */
#define CAM_POS vec3(-0.2387,0.3652,-0.7525)
#define CAM_TGT vec3(-0.1472,-0.0543,0.0103)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define RC vec3(.06,0.,.08)
vec3 rQ(vec3 p){ vec3 q=ry(p-RC,-.25); q.y-=.012; q.xy=rot(.13)*q.xy; return q; }
float raft(vec3 p){ vec3 q=rQ(p); float d=1e5;
  for(int i=0;i<7;i++){ float z=-.09+float(i)*.03; float L=.2+.012*sin(float(i)*3.1);
    vec3 c=q-vec3(.005*sin(float(i)*1.7),.015,z); float pole=max(length(c.yz)-.014,abs(c.x)-L);
    pole-=.0015*smoothstep(.42,.5,abs(fract(c.x/.09+float(i)*.37)-.5));   /* the bamboo joints */
    d=min(d,pole); }
  for(int j=0;j<3;j++){ float x=-.14+float(j)*.14; vec3 c=q-vec3(x,.015,0.); float cross1=max(length(c.xy-vec2(0.,.022))-.009,abs(c.z)-.11); d=min(d,cross1);
    float lash=max(length(vec2(length(c.xy-vec2(0.,.018))-.013,0.))-.0018,abs(abs(fract(c.z/.03)-.5)*.03)-.003); lash=max(lash,abs(c.z)-.1); d=min(d,lash); }
  return d; }
vec3 pQ(vec3 p){ vec3 q=rQ(p)-vec3(.02,.045,-.01); q.xz=rot(.55)*q.xz; return q; }
float paddle(vec3 p){ vec3 q=pQ(p); float sh=max(length(q.yz)-.008,abs(q.x+.06)-.16);
  vec3 b=q-vec3(.15,0.,0.); float bl=sdRBox(b,vec3(.06,.004,.028-.01*smoothstep(-.06,.06,-b.x)),.004);
  float grip=max(length(q.yz)-.011,abs(q.x+.22)-.015);
  return min(min(sh,bl),grip); }
float stones(vec3 p){ float d=sdEll(p-vec3(.24,.02,.12),vec3(.06,.03,.05))+.003*vn3(p*120.); d=min(d,sdEll(p-vec3(-.2,.012,-.12),vec3(.03,.012,.022))); d=min(d,sdEll(ry(p-vec3(-.15,.009,-.16),.8),vec3(.022,.009,.017))); d=min(d,sdEll(p-vec3(.3,.01,-.1),vec3(.025,.01,.02))); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,raft(p),3.);
  r=U(r,paddle(p),4.);
  r=U(r,stones(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=rQ(p); if(q.y>.03) return .45; return .68; }
  if(id==4.) return .5;
  if(id==5.) return .55;
  return .7; }
