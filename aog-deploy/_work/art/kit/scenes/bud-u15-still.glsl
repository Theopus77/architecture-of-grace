/* Buddhist Texts Unit 15 "Interpreters Across the Centuries" — pencil still life: a carved
   wooden printing block standing on its edge (raised ruled lines, no script) with its handle-grips, a printed sheet
   lifted from it lying beside, and an ink brush on a round inking pad. No figures. */
#define CAM_POS vec3(-0.2959,0.2931,-0.9122)
#define CAM_TGT vec3(-0.1824,-0.0473,0.0333)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define BK vec3(.07,0.,.1)
vec3 bQ(vec3 p){ vec3 q=ry(p-BK,-.18); q.yz=rot(-.12)*q.yz; return vec3(q.x,.025-q.z,q.y-.077); }   /* stood on its long edge, cut face toward us */
float block(vec3 p){ vec3 q=bQ(p);
  float d=sdRBox(q-vec3(0.,.025,0.),vec3(.17,.025,.075),.004);
  /* the cut face: raised columns of hint-strokes inside a raised border */
  vec2 f=q.xz; vec2 b=abs(f)-vec2(.15,.058); float border=abs(max(b.x,b.y))-.0035;
  float col=abs(fract(f.x/.016)-.5)*.016-.0025; col=max(col,max(b.x+.005,b.y+.005));
  float gap=step(.55,fract(f.y/.03+floor(f.x/.016)*.37));
  float raised=min(border,col+gap*.01);
  d=max(d,-max(q.y-.05+.004,-(q.y-.05+.0045))*0.) ;
  d=min(d,max(raised,abs(q.y-.052)-.003));
  float grip=sdRBox(vec3(abs(q.x)-.172,q.y-.025,q.z),vec3(.008,.012,.05),.003);
  return min(d,grip); }
vec3 sQ(vec3 p){ return ry(p-vec3(-.1,0.,-.12),.12); }
float sheet(vec3 p){ vec3 q=sQ(p); return sdBox(q-vec3(0.,.001+.003*smoothstep(.1,.16,q.x),0.),vec3(.16,.001,.07)); }
float pad(vec3 p){ vec3 q=p-vec3(.28,0.,-.06); return min(sdCylY(q-vec3(0.,.01,0.),.04,.01)-.003,sdEll(q-vec3(0.,.022,0.),vec3(.035,.008,.035))); }
float brush(vec3 p){ vec3 q=p-vec3(.2,.01,-.16); q.xz=rot(-.3)*q.xz; float h=max(length(q.yz)-.006,abs(q.x)-.09); vec3 t=q-vec3(.1,0.,0.); float tip=max(length(t.yz)-.009*(1.-smoothstep(-.02,.03,t.x)),abs(t.x)-.025); return min(h,tip); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,block(p),3.);
  r=U(r,sheet(p),4.);
  r=U(r,pad(p),5.);
  r=U(r,brush(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bQ(p); if(q.y>.049) return .2; return fract(q.x*40.+fbm(q.xz*vec2(3.,50.))*1.4)<.3?.4:.5; }
  if(id==4.){ vec3 q=sQ(p); vec2 f=q.xz; vec2 b=abs(f)-vec2(.14,.056); if(abs(max(b.x,b.y))<.002) return .3;
    if(max(b.x,b.y)<-.005&&abs(fract(f.x/.016)-.5)*.016<.0022&&fract(f.y/.03+floor(f.x/.016)*.37)<.55) return .35; return .95; }
  if(id==5.) return .3;
  if(id==6.){ vec3 q=p-vec3(.2,.01,-.16); q.xz=rot(-.3)*q.xz; return q.x>.09?.2:.6; }
  return .7; }
