/* m28 "Proportional Relationships and Percent" — a big gear and a small gear meshed on a
   wooden board (every turn of one sets the other in the same ratio), and a glass measuring
   jug marked in even steps, part full. */
#define CAM_POS vec3(-0.4099,0.3512,-0.6062)
#define CAM_TGT vec3(-0.2059,-0.0160,0.0791)
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
#define BD vec3(-.01,0.,.02)
float board(vec3 p){ vec3 q=place(p,BD,.12); return sdRBox(q-vec3(0.,.008,0.),vec3(.16,.008,.09),.003); }
#define G1 (BD+vec3(-.05,.026,.0))
#define G2 (BD+vec3(.078,.026,-.02))
float gearA(vec3 p){ vec3 q=p-G1; q.xz=rot(.1)*q.xz; float g=gearD(q,.075,24.,.008); return g; }
float gearB(vec3 p){ vec3 q=p-G2; q.xz=rot(.13)*q.xz; return gearD(q,.043,14.,.008); }
float pegs(vec3 p){ float d=sdCylY(p-G1-vec3(0.,-.005,0.),.015,.02); d=min(d,sdCylY(p-G1-vec3(0.,.016,0.),.02,.004)-.002);
  d=min(d,sdCylY(p-G2-vec3(0.,-.005,0.),.008,.02)); d=min(d,sdCylY(p-G2-vec3(0.,.016,0.),.012,.004)-.002);
  vec3 h=p-G1-vec3(.05,.0,.02); d=min(d,sdCylY(h-vec3(0.,.03,0.),.005,.03)); d=min(d,length(h-vec3(0.,.062,0.))-.008);  /* crank handle */
  return d; }
#define JG vec3(.24,0.,.14)
float jug(vec3 p){ vec3 q=place(p,JG,-.5);
  float r=.04-.004*q.y/.12;
  float o=sdCylY(q-vec3(0.,.06,0.),r,.06)-.0015; float i=sdCylY(q-vec3(0.,.066,0.),r-.003,.06);
  float d=max(o,-i);
  vec3 s=q-vec3(-.04,.115,0.); float sp=max(sdCone(vec3(s.x,s.y,s.z),.008,.0,.01),0.)*0.+1e5;
  vec3 h=q-vec3(.045,.065,0.); float hd=max(length(vec2(length(h.xy*vec2(1.,.85))-.03,h.z))-.005,-(q.x-.037));
  return min(d,hd); }
float water(vec3 p){ vec3 q=place(p,JG,-.5); return sdCylY(q-vec3(0.,.04,0.),.036,.036); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,board(p),3.);
  r=U(r,gearA(p),4.);
  r=U(r,gearB(p),5.);
  r=U(r,pegs(p),6.);
  r=U(r,jug(p),7.);
  r=U(r,water(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5+.12*grain(place(p,BD,.12),40.);
  if(id==4.) return .72;
  if(id==5.) return .55;
  if(id==6.) return .35;
  if(id==7.){ vec3 q=place(p,JG,-.5); float a=atan(q.z,q.x);
    if(q.y>.015&&q.y<.11&&abs(a+1.5708)<.45){ if(fract(q.y/.02)<.1) return .2; if(fract(q.y/.01)<.1&&abs(a+1.5708)<.2) return .35; }
    if(q.y<.074&&q.y>.07) return .35; return q.y<.072?.72:.92; }
  if(id==8.) return .7;
  return .7; }
