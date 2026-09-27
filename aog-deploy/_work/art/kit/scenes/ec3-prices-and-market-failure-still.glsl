/* ec3 "Prices, Controls and Market Failure" — a wooden crate of apples with a blank price tag
   tied to its corner, and a toy factory with a tall chimney breathing a puff of smoke. */
#define CAM_POS vec3(-0.6536,0.3967,-0.9634)
#define CAM_TGT vec3(-0.2990,0.0184,0.1475)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define CR vec3(-.04,0.,-.02)
vec3 cQ(vec3 p){ return place(p,CR,-.2)/1.3; }
float crate(vec3 p){ vec3 q=cQ(p);
  float o=sdBox(q-vec3(0.,.035,0.),vec3(.1,.035,.065));
  float i=sdBox(q-vec3(0.,.045,0.),vec3(.093,.04,.058));
  float d=max(o,-i);
  float slat=abs(fract((q.y-.004)/.023)-.5)-.4; d=max(d,-max(slat*.023,-(abs(q.x)-.092)*1.)*1.+0.);
  vec3 a=abs(q)-vec3(.1,0.,.065); float posts=sdBox(vec3(a.x,q.y-.035,a.z),vec3(.007,.035,.007));
  return (min(d,posts)-.0008)*1.3; }
float apples(vec3 p){ vec3 q=cQ(p); float d=1e5;
  for(int i=0;i<6;i++){ float fi=float(i); vec3 c=vec3(-.06+mod(fi,3.)*.06,.07+.006*sin(fi*2.),-.028+floor(fi/3.)*.056);
    vec3 k=q-c; k.xz=rot(fi*1.3)*k.xz; k.xy=rot(.3*sin(fi*3.))*k.xy; d=min(d,appleD(k,.03)); }
  return d*1.3; }
vec3 tQ(vec3 p){ vec3 q=cQ(p)-vec3(-.1,.06,-.075); q.xy=rot(.25)*q.xy; return q; }
float tag(vec3 p){ vec3 q=tQ(p)-vec3(-.025,-.035,0.);
  float t=sdRBox(q,vec3(.02,.03,.0012),.002);
  t=max(t,-(length(q.xy-vec2(0.,.02))-.004));
  t=max(t,(q.y-.03)+abs(q.x)*.9-.012);
  float str=sdCapsule(tQ(p),vec3(0.),vec3(-.025,-.015,0.),.0009);
  return min(t,str)*1.3; }
#define FC vec3(.2,0.,.2)
float factory(vec3 p){ vec3 q=place(p,FC,.15);
  float b=sdRBox(q-vec3(0.,.05,0.),vec3(.1,.05,.06),.003);
  float saw=1e5; for(int i=0;i<3;i++){ vec3 s=q-vec3(-.066+float(i)*.066,.1,0.);
    saw=min(saw,max(max(-s.y,s.y-(.035-(s.x+.033)*.9)),max(abs(s.x)-.033,abs(s.z)-.058))); }
  saw=max(saw,-q.y+.1);
  float ch=sdCone(q-vec3(.06,.13,.02),.018,.013,.07)-.001;
  ch=min(ch,sdTorus(q-vec3(.06,.198,.02),.014,.003));
  return min(min(b,saw),ch); }
float smoke(vec3 p){ vec3 q=place(p,FC,.15)-vec3(.07,.225,.02); float d=1e5;
  for(int i=0;i<3;i++){ float fi=float(i); d=smin(d,length(q-vec3(fi*.018,fi*.016,0.))-(.012+fi*.004),.01); }
  return d+.002*fbm(q.xy*300.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,crate(p),3.);
  r=U(r,apples(p),4.);
  r=U(r,tag(p),5.);
  r=U(r,factory(p),6.);
  r=U(r,smoke(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .55+.15*grain(cQ(p),40.);
  if(id==4.) return .7;
  if(id==5.){ vec3 q=tQ(p)-vec3(-.025,-.035,0.); if(length(q.xy-vec2(0.,.02))<.0065) return .3; return .93; }
  if(id==6.){ vec3 q=place(p,FC,.15); if(q.z<-.058&&q.y<.08&&q.y>.03&&fract((q.x+.1)/.03)<.5&&abs(q.x)<.09) return .3; return .72; }
  if(id==7.) return .88;
  return .7; }
