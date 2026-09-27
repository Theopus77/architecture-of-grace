/* Spanish Unit 8 "First, Then, Last: Telling a Day" — pencil still life: a twin-bell alarm clock
   (morning), a breakfast cup on its saucer with a spoon, and a small candle in a holder (night). */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.06,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define CL vec3(.03,0.,.05)
#define CS 1.5
float clock(vec3 p){ vec3 q=(p-CL)/CS; q.xz=rot(.2)*q.xz;
  vec3 f=q-vec3(0.,.075,0.); float body=sdCylZ(f,.055,.02)-.004;
  float glass=sdCylZ(f-vec3(0.,0.,-.022),.047,.002);
  float bells=min(length(q-vec3(-.035,.135,.0))-.022,length(q-vec3(.035,.135,.0))-.022); bells=max(bells,-(q.y-.128));
  float hammer=sdCapsule(q,vec3(0.,.13,0.),vec3(0.,.15,0.),.003);
  float feet=min(sdCapsule(q,vec3(-.03,.03,0.),vec3(-.045,.0,.0),.005),sdCapsule(q,vec3(.03,.03,0.),vec3(.045,.0,0.),.005));
  float key=sdCylZ(f-vec3(0.,0.,.03),.006,.01);
  return min(min(min(body,glass),min(bells,min(hammer,feet))),key)*CS; }
#define CU vec3(-.17,0.,-.02)
float cup(vec3 p){ vec3 q=p-CU;
  float saucer=max(abs(q.y-(.004+.01*smoothstep(.03,.075,length(q.xz))))-.0025,length(q.xz)-.075);
  float c=mugD(p,CU+vec3(0.,.008,0.),.038,.05,.6); c=max(c,-(length(p-CU-vec3(0.,.1,0.))-.0));
  vec3 s=p-CU-vec3(.02,.016,-.05); s.xz=rot(.35)*s.xz; float spoon=min(sdRBox(s,vec3(.045,.0015,.004),.0015),(length((s-vec3(-.05,.002,0.))/vec3(.018,.006,.011))-1.)*.006);
  return min(min(saucer,c),spoon); }
#define CN vec3(.22,0.,-.03)
float candle(vec3 p){ vec3 q=p-CN;
  float dish=max(abs(q.y-(.004+.008*smoothstep(.02,.045,length(q.xz))))-.0022,length(q.xz)-.045);
  float cup=sdCylY(q-vec3(0.,.012,0.),.018,.01);
  float wax=sdCylY(q-vec3(0.,.045,0.),.013,.03)-.001;
  float wick=sdCapsule(q,vec3(0.,.075,0.),vec3(.001,.083,0.),.001);
  vec3 h=q-vec3(.05,.01,0.); float ring=max(sdTorus(h.xzy,.012,.003),-h.x-.004);
  return min(min(dish,cup),min(min(wax,wick),ring)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,clock(p),3.);
  r=U(r,cup(p),4.);
  r=U(r,candle(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=(p-CL)/CS; q.xz=rot(.2)*q.xz; vec2 u=q.xy-vec2(0.,.075);
    if(q.z<-.021){ float r=length(u); float a=atan(u.x,u.y);
      if(sdSeg2(u,vec2(0.),vec2(.0,.034))<.002||sdSeg2(u,vec2(0.),vec2(.024,-.008))<.0025) return .1;
      if(r>.036&&r<.043&&abs(fract(a/(PI/6.)+.5)-.5)<.05) return .2; return .93; }
    return .35; }
  if(id==4.){ vec3 q=p-CU; if(q.y>.02&&abs(q.y-.04)<.004&&length(q.xz)>.03) return .35; return .85; }
  if(id==5.){ vec3 q=p-CN; if(q.y>.074) return .1; if(q.y>.02) return .88; return .45; }
  return .7; }
