/* Practice room "Measurement: Area, Perimeter, Volume" — pencil still life: an open box being
   filled with unit cubes (volume), a tape measure with its tape pulled out along the table
   (length and perimeter), and a square tile marked in a grid (area). */
#define CAM_POS vec3(-0.2094,0.2297,-0.5386)
#define CAM_TGT vec3(-0.1174,-0.0667,0.0791)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define BX vec3(0.,0.,.06)
#define CU .022
#define TM vec3(.16,0.,-.06)
#define TL vec3(-.12,0.,-.08)
vec3 bxQ(vec3 p){ vec3 q=p-BX; q.xz=rot(.25)*q.xz; return q; }
float boxD(vec3 q){ vec3 h=vec3(3.*CU+.004,1.6*CU,2.*CU+.004); float d=sdBox(q-vec3(0.,h.y,0.),h);
  d=max(d,-sdBox(q-vec3(0.,h.y+.003,0.),h-vec3(.003,0.,.003)));
  return d; }
float cubesD(vec3 q){ float d=1e3; for(int i=0;i<3;i++) for(int k=0;k<2;k++) for(int j=0;j<2;j++){
    if(j==1&&(i+k)>1) continue;
    vec3 c=vec3((float(i)-1.)*CU*2.,CU*(2.*float(j)+1.)+.001,(float(k)-.5)*2.*CU); d=min(d,sdRBox(q-c,vec3(CU*.96),.002)); }
  return d; }
float tapeCase(vec3 q){ float d=sdRBox(q-vec3(0.,.034,0.),vec3(.034,.034,.016),.014); d=min(d,sdCylZ(q-vec3(0.,.034,-.018),.012,.003)); return d; }
float tapeD(vec3 q){ return sdBox(q-vec3(-.11,.0015,0.),vec3(.09,.0006,.0085)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 b=bxQ(p);
  r=U(r,boxD(b),3.);
  r=U(r,cubesD(b),4.);
  vec3 t=place(p,TM,.2);
  r=U(r,tapeCase(t),5.);
  r=U(r,min(tapeD(t),sdRBox(t-vec3(-.2,.005,0.),vec3(.002,.005,.009),.001)),6.);
  r=U(r,sdRBox(place(p,TL,-.3)-vec3(0.,.004,0.),vec3(.055,.004,.055),.0015),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .72;
  if(id==4.) return .62;
  if(id==5.){ vec3 t=place(p,TM,.2); if(t.z<-.014&&length(t.xy-vec2(0.,.034))<.022) return .6; return .4; }
  if(id==6.){ vec3 t=place(p,TM,.2); if(t.y>.001&&t.z>-.004&&fract(t.x/.01)<.15) return .3; if(t.y>.001&&fract(t.x/.002)<.3&&t.z>.003) return .5; return .85; }
  if(id==7.){ vec3 q=place(p,TL,-.3); if(q.y>.005){ vec2 g=abs(fract(q.xz/.0183+.5)-.5); if(min(g.x,g.y)<.06) return .35; } return .78; }
  return .7; }
