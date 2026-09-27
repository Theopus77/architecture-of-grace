/* Science Unit 19 "Physical Science: Matter and Reactions" — pencil still life: a large
   ball-and-stick molecule model (methane: one carbon, four hydrogens), a Bunsen burner and a
   test tube in a wooden holder. */
#define CAM_POS vec3(-0.5136,0.2529,-0.7002)
#define CAM_TGT vec3(-0.1904,0.0147,0.1507)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define MC vec3(.03,.14,.08)
vec2 mol(vec3 p){ vec3 q=p-MC; q.xz=rot(.4)*q.xz; q.xy=rot(.15)*q.xy;
  float c=length(q)-.04;
  vec3 d[4]; d[0]=vec3(0.,-1.,0.); d[1]=vec3(.943,.333,0.); d[2]=vec3(-.471,.333,.816); d[3]=vec3(-.471,.333,-.816);
  float h=1e5, s=1e5;
  for(int i=0;i<4;i++){ vec3 e=d[i]*.11; h=min(h,length(q-e)-.024); s=min(s,sdCapsule(q,vec3(0.),e,.007)); }
  return vec2(c,min(h,s)); }
vec3 bq(vec3 p){ return p-vec3(-.23,0.,.02); }
vec2 burner(vec3 p){ vec3 q=bq(p);
  float base=sdCylY(q-vec3(0.,.008,0.),.045,.007)-.004;
  float barrel=sdCylY(q-vec3(0.,.08,0.),.011,.07);
  barrel=max(barrel,-sdCylY(q-vec3(0.,.16,0.),.007,.02));
  float collar=sdCylY(q-vec3(0.,.03,0.),.015,.01)-.001;
  float hose=sdCapsule(q,vec3(.0,.02,0.),vec3(.06,.02,.0),.006);
  vec3 f=q-vec3(0.,.172,0.); float flame=sdEll(f,vec3(.012,.04,.012)); flame=max(flame,-f.y-.04);
  float r2=length(f.xz); flame=length(vec2(r2,f.y+.01))-.012 +0.; flame=min(flame, max(r2-.012*(1.-(f.y+.01)/.05),max(f.y-.04,-f.y-.01)));
  return vec2(min(min(base,barrel),min(collar,hose)),flame); }
vec2 tube(vec3 p){ vec3 q=p-vec3(.32,0.,.02);
  float blk=sdRBox(q-vec3(0.,.02,0.),vec3(.03,.02,.03),.004);
  blk=max(blk,-sdCylY(q-vec3(0.,.04,0.),.015,.02));
  float tb=abs(sdCapsule(q,vec3(0.,.03,0.),vec3(0.,.17,0.),.013))-.0015; tb=max(tb,q.y-.17);
  tb=min(tb,sdTorus(q-vec3(0.,.17,0.),.0135,.0025));
  float liq=max(sdCapsule(q,vec3(0.,.03,0.),vec3(0.,.17,0.),.011),q.y-.1);
  return vec2(min(blk,tb),liq); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 m=mol(p); r=U(r,m.x,3.); r=U(r,m.y,4.);
  vec2 b=burner(p); r=U(r,b.x,5.); r=U(r,b.y,6.);
  vec2 t=tube(p); r=U(r,t.x,7.); r=U(r,t.y,8.);
  /* a wire stand under the molecule */
  r=U(r,min(sdCylY(p-vec3(MC.x,.005,MC.z),.05,.005)-.003,sdCapsule(p,vec3(MC.x,0.,MC.z),MC-vec3(0.,.11,0.),.004)),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .25; if(id==4.) return .85;
  if(id==5.) return .45; if(id==6.) return .92;
  if(id==7.) return .88; if(id==8.) return .5; if(id==9.) return .4;
  return .7; }
