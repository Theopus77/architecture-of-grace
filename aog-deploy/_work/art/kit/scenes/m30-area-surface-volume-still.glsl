/* m30 "Area, Surface Area and Volume" — a box shape built from unit cubes (4 by 3 by 3, with one
   cube lifted off the top), a flat square tile ruled into a grid, and a tape measure with its
   tape pulled out. */
#define CAM_POS vec3(-0.4314,0.3006,-0.5481)
#define CAM_TGT vec3(-0.1288,-0.0587,0.0949)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_mid.glsl"
#define UC .034
vec3 prQ(vec3 p){ return place(p,vec3(.0,0.,.1),-.35); }
float prism(vec3 p){ vec3 q=prQ(p);
  /* 4 x 3 x 3 separate cubes with bevelled edges, so every cube shows */
  vec3 c=vec3(clamp(floor(q.x/UC),-2.,1.)+.5,clamp(floor(q.y/UC),0.,2.)+.5,clamp(floor(q.z/UC+.5),-1.,1.))*UC;
  float d=sdRBox(q-c,vec3(UC*.5-.0004),.0022);
  float o=sdBox(q-vec3(0.,1.5*UC,0.),vec3(2.,1.5,1.5)*UC);
  d=max(d,o-.0005);
  d=max(d,-sdBox(q-vec3(1.5*UC,2.5*UC,-1.*UC),vec3(.5*UC+.0002)));   /* one top corner cube taken off */
  return d; }
vec3 cbQ(vec3 p){ return place(p,vec3(.14,0.,.02),.4); }
float cube1(vec3 p){ return sdRBox(cbQ(p)-vec3(0.,UC*.5,0.),vec3(UC*.5),.0018); }
vec3 tlQ(vec3 p){ return place(p,vec3(-.13,0.,-.05),-.15); }
float tile(vec3 p){ vec3 q=tlQ(p); return sdRBox(q-vec3(0.,.003,0.),vec3(2.*UC,.003,2.*UC),.0012); }
/* tape measure: a round case standing on edge, the tape running out along the table */
vec3 tmQ(vec3 p){ return place(p,vec3(.19,0.,-.1),2.6); }
float tape(vec3 p){ vec3 q=tmQ(p);
  float cs=sdCylZ(q-vec3(0.,.035,0.),.035,.013)-.004;
  cs=min(cs,sdRBox(q-vec3(.018,.004,0.),vec3(.022,.004,.016),.003));
  float but=sdRBox(q-vec3(-.01,.071,0.),vec3(.008,.004,.005),.002);
  float st=sdBox(q-vec3(.12,.0006,0.),vec3(.085,.0006,.0095));
  float hook=sdBox(q-vec3(.206,.004,0.),vec3(.0008,.004,.0095));
  return min(min(cs,but),min(st,hook)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,prism(p),3.);
  r=U(r,cube1(p),4.);
  r=U(r,tile(p),5.);
  r=U(r,tape(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .8;
  if(id==4.) return .78;
  if(id==5.){ vec3 q=tlQ(p); if(n.y>.7) return gridTone(q.xz,UC,.85); return .6; }
  if(id==6.){ vec3 q=tmQ(p); if(q.x>.035&&q.y<.002){ float t=fract(q.x/.01); return t<.12&&abs(q.z)>.002?.25:.9; } return q.y>.068?.3:.5; }
  return .7; }
