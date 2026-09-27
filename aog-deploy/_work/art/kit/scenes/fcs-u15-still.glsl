/* FCS Unit 15 "Cooking Methods and Heat" — pencil still life: a cast-iron frying pan with an egg
   frying in it, a tall stockpot with its lid, and a wooden spatula lying in front. */
#define CAM_POS vec3(-0.4130,0.2656,-0.7098)
#define CAM_TGT vec3(-0.1928,0.0013,0.1095)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define PT vec3(.14,0.,.1)
float pot(vec3 p){ vec3 q=p-PT;
  float body=max(abs(length(q.xz)-.08)-.003,abs(q.y-.075)-.075); body=min(body,sdCylY(q-vec3(0.,.003,0.),.08,.003));
  float lid=max(abs(length(q-vec3(0.,.07,0.))-.1)-.0025,.148-q.y); lid=max(lid,length(q.xz)-.083);
  float knob=sdCylY(q-vec3(0.,.185,0.),.012,.006)-.003;
  float ears=min(sdTorus((q-vec3(.088,.13,0.)).xzy*vec3(1.,1.,1.),.014,.004),sdTorus((q-vec3(-.088,.13,0.)).xzy,.014,.004));
  ears=max(ears,-(abs(q.x)-.08));
  return min(min(body,lid),min(knob,ears)); }
#define FP vec3(-.09,0.,-.01)
float fpan(vec3 p){ vec3 q=p-FP; float r=length(q.xz);
  float wall=max(abs(r-(.085+q.y*.4))-.004,abs(q.y-.018)-.018); float bot=sdCylY(q-vec3(0.,.003,0.),.085,.003);
  vec3 h=q-vec3(-.15,.03,-.03); h.xz=rot(.2)*h.xz; h.xy=rot(-.12)*h.xy; float handle=sdRBox(h,vec3(.065,.006,.011),.005);
  handle=max(handle,-sdCylY(h-vec3(-.05,0.,0.),.005,.02));
  return min(min(wall,bot),handle); }
float egg(vec3 p){ vec3 q=p-FP-vec3(.01,.006,.0); float white=max(length(q.xz*vec2(1.,1.2))-.05+.006*sin(atan(q.z,q.x)*5.),abs(q.y)-.0025)-.001;
  float yolk=(length((q-vec3(-.005,.004,.0))/vec3(.018,.012,.018))-1.)*.012; return min(white,yolk); }
float spat(vec3 p){ vec3 q=p-vec3(.08,.004,-.11); q.xz=rot(-.15)*q.xz; float hdl=sdCapsule(q,vec3(-.02,0.,0.),vec3(.14,0.,0.),.0055);
  float blade=sdRBox(q-vec3(-.055,0.,0.),vec3(.04,.002,.022),.004); return min(hdl,blade); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pot(p),3.);
  r=U(r,fpan(p),4.);
  r=U(r,egg(p),5.);
  r=U(r,spat(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PT; if(q.y>.15) return .4; return abs(q.y-.12)<.003?.35:.7; }
  if(id==4.) return .22;
  if(id==5.){ vec3 q=p-FP-vec3(.01,.006,.0); return length(q.xz-vec2(-.005,0.))<.019&&q.y>.003?.45:.95; }
  if(id==6.) return .6;
  return .7; }
