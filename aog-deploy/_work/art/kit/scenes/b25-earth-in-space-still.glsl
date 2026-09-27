/* Practice room "Earth in Space" — pencil still life: a small orrery (the sun on a centre post,
   an arm carrying the tilted Earth with its moon) and a flashlight lying on the table. */
#define CAM_POS vec3(-0.3250,0.4815,-0.9563)
#define CAM_TGT vec3(-0.1667,-0.0277,0.1052)
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
#define ORR vec3(-.02,0.,.05)
#define AA -.55
#define EA vec3(.17*cos(AA),0.,.17*sin(AA))
#define FLS vec3(.2,.02,-.09)
float baseD(vec3 q){ float d=cylS(q,.075,.02,.005); d=min(d,cylS(q-vec3(0.,.02,0.),.05,.01,.003)); return d; }
float postD(vec3 q){ float d=sdCylY(q-vec3(0.,.09,0.),.006,.06);
  vec3 e=q-EA; d=min(d,sdCapsule(q,vec3(0.,.1,0.),vec3(EA.x,.1,EA.z),.004));
  d=min(d,sdCylY(e-vec3(0.,.12,0.),.004,.02));
  d=min(d,sdCapsule(e,vec3(0.,.13,0.),vec3(-.05,.14,.02),.0025));
  d=min(d,sdCylY(e-vec3(-.05,.15,.02),.0025,.012));
  d=min(d,sdTorus(q-vec3(0.,.1,0.),.012,.004));
  return d; }
float sunD(vec3 q){ return length(q-vec3(0.,.2,0.))-.055; }
vec3 earthQ(vec3 q){ vec3 e=q-EA-vec3(0.,.165,0.); e.xy=rot(.41)*e.xy; return e; }
float earthD(vec3 q){ vec3 e=earthQ(q); return min(length(e)-.03,sdCylY(e,.0018,.04)); }
float moonD(vec3 q){ return length(q-EA-vec3(-.05,.17,.02))-.012; }
vec3 flQ(vec3 p){ vec3 q=p-FLS; q.xz=rot(2.4)*q.xz; return q; }
float flashD(vec3 q){ float b=sdCylX(q,.017,.055)-.002; b=min(b,sdCone(vec3(q.y,q.x-.075,q.z),.019,.03,.022)-.001);
  b=max(b,-sdCylX(q-vec3(.1,0.,0.),.025,.004)); b=min(b,sdRBox(q-vec3(-.01,.018,0.),vec3(.01,.004,.006),.002)); return b; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=p-ORR;
  r=U(r,baseD(q),3.);
  r=U(r,postD(q),4.);
  r=U(r,sunD(q),5.);
  r=U(r,earthD(q),6.);
  r=U(r,moonD(q),7.);
  r=U(r,flashD(flQ(p)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-ORR; return .55+.12*grain(q,50.); }
  if(id==4.) return .45;
  if(id==5.){ vec3 q=p-ORR-vec3(0.,.2,0.); return .82+.06*fbm(q.xz*80.); }
  if(id==6.){ vec3 e=earthQ(p-ORR); if(length(e.xz)<.003) return .3;
    float land=fbm(vec2(atan(e.z,e.x)*1.4,e.y*45.)+3.); if(abs(e.y)<.0012) return .4; return land>.55?.45:.8; }
  if(id==7.) return .7;
  if(id==8.){ vec3 q=flQ(p); if(q.x>.098) return .95; if(abs(q.x+.02)<.002||abs(q.x-.03)<.002) return .25; return .45; }
  return .7; }
