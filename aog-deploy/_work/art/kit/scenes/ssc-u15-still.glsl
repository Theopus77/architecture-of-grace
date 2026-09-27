/* Social Studies Unit 15 "World History: Empires and Exchange" — pencil still life: a model
   sailing ship with square sails on a wooden stand, a brass astrolabe and a small chest. */
#define CAM_POS vec3(-0.3903,0.3246,-1.0746)
#define CAM_TGT vec3(-0.2354,0.0524,0.0912)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define SC vec3(.08,0.,.17)
vec3 sq(vec3 p){ vec3 q=p-SC; q.xz=rot(-1.)*q.xz; return q; }
float sail(vec3 q,vec3 c,vec2 hs,float bulge){
  vec3 s=q-c; s.z+=bulge*(1.-(s.y/hs.y)*(s.y/hs.y))*(1.-(s.x/hs.x)*(s.x/hs.x)*.5);
  return sdBox(s,vec3(hs.x,hs.y,.0012))-.0005; }
vec2 ship(vec3 p){
  vec3 q=sq(p);
  /* hull: length along x, curved keel line, raised stern */
  vec3 h=q-vec3(0.,.07,0.);
  float t=clamp(h.x/.16,-1.,1.);
  float w=.038*sqrt(max(1.-t*t*t*t,0.))+.002;
  float keel=-.035+.02*t*t;
  float deck=.005+.02*smoothstep(-.4,-.9,t)+.01*smoothstep(.6,.95,t);
  float hull=max(max(abs(h.z)-w*(.6+.4*clamp((h.y-keel)/.04,0.,1.)),keel-h.y),max(h.y-deck,abs(h.x)-.16));
  hull*=.8;
  float bows=sdCapsule(q,vec3(.15,.085,0.),vec3(.23,.1,0.),.003);            /* bowsprit */
  float stand=min(sdRBox(q-vec3(-.07,.02,0.),vec3(.008,.02,.03),.002),sdRBox(q-vec3(.07,.02,0.),vec3(.008,.02,.03),.002));
  stand=min(stand,sdRBox(q-vec3(0.,.006,0.),vec3(.11,.006,.035),.002));
  float masts=min(sdCylY(q-vec3(.02,.2,0.),.003,.13),sdCylY(q-vec3(-.08,.18,0.),.0028,.11));
  masts=min(masts,sdCylY(q-vec3(.1,.17,0.),.0025,.09));
  float yards=1e5;
  yards=min(yards,sdCylZ((q-vec3(.02,.3,0.)).zyx,.002,.055)); yards=min(yards,sdCylZ((q-vec3(.02,.2,0.)).zyx,.002,.065));
  yards=min(yards,sdCylZ((q-vec3(-.08,.26,0.)).zyx,.002,.045)); yards=min(yards,sdCylZ((q-vec3(.1,.235,0.)).zyx,.002,.04));
  /* sails face the viewer (x-y plane is along the hull; sails hang across it) */
  vec3 r=q.zyx;
  float sails=sail(r,vec3(0.,.25,.02),vec2(.058,.045),.012);
  sails=min(sails,sail(r,vec3(0.,.155,.02),vec2(.066,.04),.014));
  sails=min(sails,sail(r,vec3(0.,.215,-.08),vec2(.046,.042),.01));
  sails=min(sails,sail(r,vec3(0.,.2,.1),vec2(.04,.033),.009));
  return vec2(min(min(hull,bows),min(stand,min(masts,yards))),sails); }
vec3 aq(vec3 p){ vec3 q=p-vec3(-.2,.0,-.02); q.xz=rot(.45)*q.xz; return q; }
float astrolabe(vec3 p){
  vec3 q=aq(p); vec3 c=q-vec3(0.,.062,0.);
  float disc=sdCylZ(c,.055,.004)-.001;
  disc=max(disc,-max(sdCylZ(c,.045,.01),-sdCylZ(c,.04,.01)));
  float rim=sdTorus(c.xzy,.055,.004);
  float rule=sdRBox(c,vec3(.05,.004,.006),.001);
  float ring=sdTorus((c-vec3(0.,.066,0.)).xzy,.01,.0022);
  float foot=sdRBox(q-vec3(0.,.004,0.),vec3(.03,.004,.02),.002);
  float post=sdRBox(q-vec3(0.,.008,0.),vec3(.006,.008,.006),.001);
  return min(min(disc,rim),min(min(rule,ring),min(foot,post))); }
vec3 cq(vec3 p){ vec3 q=p-vec3(.36,0.,.02); q.xz=rot(-.5)*q.xz; return q; }
vec2 chest(vec3 p){
  vec3 q=cq(p);
  float b=sdRBox(q-vec3(0.,.035,0.),vec3(.06,.035,.04),.003);
  float lid=max(sdCylX(q-vec3(0.,.07,0.),.04,.062)-.001,.07-q.y);
  float bands=min(sdRBox(q-vec3(-.035,.055,0.),vec3(.005,.06,.043),.001),sdRBox(q-vec3(.035,.055,0.),vec3(.005,.06,.043),.001));
  bands=max(bands,max(sdCylX(q-vec3(0.,.07,0.),.043,.1),-(.07-q.y)*0.-1.)); bands=min(bands,1e5);
  return vec2(min(b,lid),bands); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 s=ship(p); r=U(r,s.x,3.); r=U(r,s.y,4.);
  r=U(r,astrolabe(p),5.);
  vec2 c=chest(p); r=U(r,c.x,6.); r=U(r,c.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=sq(p); if(q.y>.05&&q.y<.1&&abs(q.x)<.17){ if(fract(q.y/.008)<.18) return .25; } return .4; }   /* hull planks */
  if(id==4.) return .92;
  if(id==5.){ vec3 c=aq(p)-vec3(0.,.062,0.); float r=length(c.xy); float a=atan(c.y,c.x);
    if(r>.045&&fract(a*36./6.2832)<.2) return .25; return .55; }
  if(id==6.) return .5+.12*grain(cq(p).zxy,40.);
  if(id==7.) return .3;
  return .7; }
