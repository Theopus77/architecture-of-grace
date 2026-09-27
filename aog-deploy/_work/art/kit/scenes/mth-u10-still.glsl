/* Math Unit 10 "Measurement and Data" — pencil still life: a rectangular box built from
   twelve unit cubes (three by two by two) beside a round tape measure with its tape pulled out. */
#define CAM_POS vec3(-0.2052,0.1540,-0.5769)
#define CAM_TGT vec3(-0.1206,0.0062,0.0838)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define UC .04
vec3 bxQ(vec3 p){ vec3 q=p-vec3(-.02,UC,.08); q.xz=rot(.35)*q.xz; return q; }
float cubesD(vec3 p){ vec3 q=bxQ(p);
  float d=1e5;
  for(int i=-1;i<=1;i++) for(int j=0;j<2;j++) for(int k=0;k<2;k++){
    vec3 cc=vec3(float(i)*2.*UC,float(j)*2.*UC,(float(k)-.5)*2.*UC);
    d=min(d,sdRBox(q-cc,vec3(UC*.985),.004)); }
  return d; }
vec3 tmQ(vec3 p){ vec3 q=p-vec3(.2,.055,.02); q.xz=rot(-.3)*q.xz; return q; }
vec2 tape(vec3 p){ vec3 q=tmQ(p);
  float cs=sdRBox(q,vec3(.055,.055,.022),.02);
  cs=min(cs,sdRBox(q-vec3(.0,.058,0.),vec3(.014,.006,.008),.003));   /* lock button */
  cs=max(cs,-sdCylZ(q-vec3(0.,0.,-.026),.02,.004));
  float slot=sdRBox(q-vec3(-.06,-.045,0.),vec3(.012,.008,.02),.003);
  cs=min(cs,slot);
  /* the tape: a thin band from the slot along the table toward the left */
  vec3 t=p-vec3(0.,.0012,-.05); t.xz=rot(-.3)*t.xz;
  float band=sdBox(t-vec3(.02,0.,0.),vec3(.14,.0012,.012));
  float hook=sdBox(t-vec3(-.12,.006,0.),vec3(.0015,.006,.013));
  return vec2(cs,min(band,hook)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,cubesD(p),3.);
  vec2 t=tape(p); r=U(r,t.x,4.); r=U(r,t.y,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .72;
  if(id==4.){ vec3 q=tmQ(p); if(q.z<-.02&&length(q.xy)<.035) return .8; return .38; }
  if(id==5.){ vec3 t=p-vec3(0.,.0012,-.05); t.xz=rot(-.3)*t.xz; float f=fract(t.x/.01); if(t.z>.0&&f<.15) return .15; if(fract(t.x/.05)<.05) return .15; return .85; }
  return .7; }
