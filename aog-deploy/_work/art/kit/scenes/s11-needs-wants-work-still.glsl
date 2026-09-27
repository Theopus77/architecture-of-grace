/* Room "Needs, Wants and Work" — pencil still life: a piggy bank (earn and save), a loaf of
   bread and a glass of milk (needs), and a small spinning top (a want). */
#define CAM_POS vec3(-0.2692,0.2401,-0.4711)
#define CAM_TGT vec3(-0.0997,-0.0018,0.0372)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define PG vec3(-.04,.062,.06)
#define LF vec3(.12,0.,.1)
#define GL vec3(.17,0.,-.05)
#define TP vec3(.05,0.,-.12)
vec3 pgQ(vec3 p){ return place(p,PG,.5); }   /* snout toward -x */
float pigD(vec3 p){ vec3 q=pgQ(p);
  float body=sdEll(q,vec3(.085,.06,.058));
  float snout=sdCylX(q-vec3(-.085,-.002,0.),.022,.014)-.004; body=smin(body,snout,.012);
  vec3 e=vec3(q.x+.04,q.y-.05,abs(q.z)-.028); e.xy=rot(.3)*e.xy; float ear=sdCone(e,.014,.002,.012);
  body=smin(body,ear,.006);
  vec3 l=vec3(abs(q.x)-.045,q.y+.045,abs(q.z)-.03); float leg=sdCylY(l,.013,.018)-.002;
  float d=smin(body,leg,.01);
  d=max(d,-sdRBox(q-vec3(.0,.06,0.),vec3(.022,.01,.0025),.001));      /* coin slot */
  vec3 t=q-vec3(.088,.01,0.); float tail=length(vec2(length(t.xy)-.008,t.z))-.0022; d=min(d,tail);
  return d; }
float loafD(vec3 p){ vec3 q=place(p,LF,.4); float d=sdRBox(q-vec3(0.,.035,0.),vec3(.06,.03,.04),.022);
  d=smin(d,sdEll(q-vec3(0.,.06,0.),vec3(.058,.022,.04)),.01);
  for(int i=0;i<3;i++){ float x=-.03+float(i)*.03; d=max(d,-(length(vec2(q.x-x-(q.y-.08)*.3,q.y-.08))-.004)); }
  return d; }
float glassD(vec3 p){ vec3 q=p-GL; float o=sdCylY(q-vec3(0.,.045,0.),.026+.004*q.y/.09,.045)-.001; float i=sdCylY(q-vec3(0.,.08,0.),.023+.004*q.y/.09,.045);
  return max(o,-i); }
float topD(vec3 p){ vec3 q=p-TP; q.xy=rot(.25)*q.xy;
  float body=sdEll(q-vec3(0.,.03,0.),vec3(.03,.017,.03)); float tip=sdCone(q-vec3(0.,.012,0.),.0005,.02,.012);
  float stem=sdCylY(q-vec3(0.,.055,0.),.004,.012)-.001;
  return min(smin(body,tip,.004),stem); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pigD(p),3.);
  r=U(r,loafD(p),4.);
  r=U(r,glassD(p),5.);
  r=U(r,topD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pgQ(p); if(q.x<-.095){ if(length(vec2(q.y+.002,abs(q.z)-.008))<.004) return .2; } if(length(vec2(q.x+.06,q.y-.022))<.006&&q.z<0.) return .15; return .78; }
  if(id==4.) return .5;
  if(id==5.){ vec3 q=p-GL; return q.y<.07?.95:.8; }
  if(id==6.){ vec3 q=p-TP; return fract(q.y/.01)<.5?.4:.8; }
  return .7; }
