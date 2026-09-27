/* Science Unit 13 "Cells, Bodies and Reproduction" — pencil still life: a school microscope
   with a slide on its stage, a petri dish and two glass slides. */
#define CAM_POS vec3(-0.6482,0.3338,-0.9125)
#define CAM_TGT vec3(-0.2360,0.0300,0.1723)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define MC vec3(.03,0.,.08)
vec3 mq(vec3 p){ vec3 q=p-MC; q.xz=rot(-.6)*q.xz; return q; }   /* x: stage points to +x (toward the eyepiece side at -x) */
vec2 micro(vec3 p){ vec3 q=mq(p);
  /* horseshoe foot */
  vec2 f=q.xz-vec2(.0,0.); float foot=max(sdRBox(q-vec3(.0,.012,0.),vec3(.075,.012,.06),.012),-sdRBox(q-vec3(.07,.012,0.),vec3(.035,.03,.028),.01));
  /* pillar and curved arm */
  float pillar=sdRBox(q-vec3(-.05,.05,0.),vec3(.016,.03,.018),.006);
  vec3 z=vec3(0.,0.,0.);
  float arm=min(min(sdCapsule(q,vec3(-.05,.07,0.),vec3(-.058,.14,0.),.014),sdCapsule(q,vec3(-.058,.14,0.),vec3(-.04,.2,0.),.013)),sdCapsule(q,vec3(-.04,.2,0.),vec3(-.005,.225,0.),.012));
  float stage=sdRBox(q-vec3(.02,.1,0.),vec3(.05,.004,.045),.002);
  float slide=sdRBox(q-vec3(.03,.106,0.),vec3(.035,.0012,.013),.0005);
  float clip=min(sdCapsule(q,vec3(.0,.106,.03),vec3(.04,.106,.018),.002),sdCapsule(q,vec3(.0,.106,-.03),vec3(.04,.106,-.018),.002));
  /* tilted tube with eyepiece and nosepiece */
  vec3 t=q-vec3(.02,.2,0.); t.xy=rot(-.35)*t.xy;
  float tube=sdCylY(t,.017,.06)-.001;
  float eyep=sdCylY(t-vec3(0.,.08,0.),.012,.025)-.001;
  float eyec=sdCylY(t-vec3(0.,.1,0.),.015,.005)-.001;
  float nose=sdCone(t-vec3(0.,-.07,0.),.022,.019,.012)-.002;
  float obj=sdCone(t-vec3(0.,-.1,0.),.006,.009,.02);
  float knob=sdCylZ(q-vec3(-.055,.12,0.),.016,.026)-.002;
  float mirror=sdCylY(q-vec3(.02,.05,0.),.02,.003);
  float body=min(min(foot,pillar),min(arm,stage));
  body=min(body,min(min(knob,mirror),min(nose,obj)));
  return vec2(body,min(min(tube,min(eyep,eyec)),min(slide,clip))); }
#define PD vec3(-.17,0.,.0)
vec2 petri(vec3 p){ vec3 q=p-PD;
  float d=max(abs(sdCylY(q-vec3(0.,.008,0.),.055,.008))-.0015,-(q.y-.017));
  float lid=max(abs(sdCylY(q-vec3(.07,.009,.05),.058,.009))-.0015,-(q.y-.018));
  float agar=sdCylY(q-vec3(0.,.005,0.),.052,.004);
  return vec2(d,agar); }
vec3 sq(vec3 p,vec3 c,float a){ vec3 q=p-c; q.xz=rot(a)*q.xz; return q; }
float slides(vec3 p){ return min(sdRBox(sq(p,vec3(.3,.0015,-.02),.4)-vec3(0.,0.,0.),vec3(.038,.0015,.013),.0006),
                                 sdRBox(sq(p,vec3(.31,.0045,.0),.1),vec3(.038,.0015,.013),.0006)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 m=micro(p); r=U(r,m.x,3.); r=U(r,m.y,4.);
  vec2 d=petri(p); r=U(r,d.x,5.); r=U(r,d.y,6.);
  r=U(r,slides(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .35; if(id==4.) return .7;
  if(id==5.) return .88;
  if(id==6.){ vec3 q=p-PD; float c=1.; for(int i=0;i<5;i++){ vec2 k=vec2(sin(float(i)*2.4),cos(float(i)*1.9))*.03; float r=length(q.xz-k); if(r<.008) c=.35; } return c<1.?c:.7; }
  if(id==7.){ vec3 q=sq(p,vec3(.31,.0045,.0),.1); return length(q.xz*vec2(1.,1.5))<.009?.4:.9; }
  return .7; }
