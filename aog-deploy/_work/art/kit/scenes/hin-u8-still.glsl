/* Hindu Texts Unit 8 "The Vedas" — pencil still life: a square brick fire altar with a small
   fire burning in it, a long wooden ladle resting across its edge, and a round water pot.
   Objects only. */
#define CAM_POS vec3(-0.2758,0.2646,-0.6660)
#define CAM_TGT vec3(-0.1895,0.0131,0.0528)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define AC vec3(.05,0.,.08)
float altar(vec3 p){ vec3 q=p-AC;
  float o=sdRBox(q-vec3(0.,.035,0.),vec3(.12,.035,.12),.003);
  float step1=sdRBox(q-vec3(0.,.008,0.),vec3(.14,.008,.14),.002);
  float pit=sdBox(q-vec3(0.,.06,0.),vec3(.075,.04,.075));
  float d=max(min(o,step1),-pit);
  /* brick courses as shallow grooves */
  float gy=abs(fract(q.y/.0175)-.5)*.0175; float gx=abs(fract((max(abs(q.x),abs(q.z))*0.+ (abs(q.x)>abs(q.z)?q.z:q.x) + (mod(floor(q.y/.0175),2.)*.02))/.04)-.5)*.04;
  d+=.0012*(1.-smoothstep(.0,.0015,min(gy,gx)))*step(.016,q.y);
  return d; }
float logs(vec3 p){ vec3 q=p-AC-vec3(0.,.06,0.); float d=1e5;
  for(int i=0;i<4;i++){ float a=float(i)*.8+.2; vec3 l=ry(q,a); l.xy=rot(.25*(float(i)-1.5)*.4)*l.xy; d=min(d,sdCylX(l-vec3(0.,.004*float(i),0.),.009,.06)-.001); }
  return d; }
float fire(vec3 p){ vec3 q=p-AC-vec3(0.,.07,0.); float d=flameD(q,.09);
  d=min(d,flameD(q-vec3(.025,0.,.01),.06)); d=min(d,flameD(q-vec3(-.022,0.,-.012),.065)); d=min(d,flameD(q-vec3(-.005,0.,.028),.05));
  return d; }
vec3 ldQ(vec3 p){ vec3 q=p-AC-vec3(.07,.085,-.15); q.xz=rot(.5)*q.xz; q.xy=rot(-.2)*q.xy; return q; }
float ladle(vec3 p){ vec3 q=ldQ(p);
  float h=max(length(q.yz)-.006,abs(q.x-.02)-.15);
  vec3 c=q-vec3(-.15,.0,0.); float cup=max(abs(sdEll(c,vec3(.03,.02,.024)))-.002,c.y);
  return min(h,cup); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,altar(p),3.);
  r=U(r,logs(p),4.);
  r=U(r,fire(p),5.);
  r=U(r,ladle(p),6.);
  r=U(r,potD(ry(p-vec3(-.19,0.,.02),.3),1.35),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-AC; float gy=abs(fract(q.y/.0175)-.5); float s=(abs(q.x)>abs(q.z)?q.z:q.x)+mod(floor(q.y/.0175),2.)*.02; float gx=abs(fract(s/.04)-.5);
    if(q.y>.016&&q.y<.07&&(gy>.44||gx>.46)) return .3; return .52; }
  if(id==4.) return .3;
  if(id==5.) return .96;
  if(id==6.) return .5;
  if(id==7.){ vec3 q=(p-vec3(-.19,0.,.02))/1.35; if(abs(q.y-.055)<.002||abs(q.y-.07)<.002) return .3; return .55; }
  return .7; }
