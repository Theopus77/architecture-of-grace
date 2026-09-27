/* r8 "Confucianism and Daoism" — a bamboo-slip book half unrolled (hint-lines only, no script),
   an ink stone with a brush lying beside it, and a shallow bowl of still water. */
#define CAM_POS vec3(-0.3159,0.2494,-0.4782)
#define CAM_TGT vec3(-0.0713,-0.0336,0.0877)
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
#define SW .0125
#define SL .085
vec3 bkQ(vec3 p){ return place(p,vec3(-.02,0.,.1),-.18); }
float slips(vec3 q){ float i=clamp(floor(q.x/SW),-7.,4.); float cx=(i+.5)*SW;
  float d=sdRBox(q-vec3(cx,.0022,0.),vec3(SW*.5-.0009,.0022,SL),.001);
  /* the rolled part at the right end */
  vec3 r=q-vec3(5.*SW+.024,.026,0.); float a=atan(r.y,r.x); float rr=length(r.xy);
  float roll=max(rr-.026-.0012*smoothstep(-.2,.2,cos(a*26.)),abs(r.z)-SL);
  roll=max(roll,-(rr-.006));
  return min(d,roll); }
float cords(vec3 q){ float d=1e5; for(int k=0;k<2;k++){ float z=k==0?-.045:.045;
    d=min(d,sdCapsule(q,vec3(-7.*SW-.01,.0048,z+.002),vec3(5.*SW,.0048,z),.0016));
    d=min(d,sdTorus((q-vec3(5.*SW+.024,.026,z)).xzy,.0275,.0016)); } return d; }
/* ink stone: a dark slab with a sloping well; a brush lying on a brush rest */
vec3 isQ(vec3 p){ return place(p,vec3(.19,0.,-.02),.35); }
float inkstone(vec3 q){ float d=sdRBox(q-vec3(0.,.012,0.),vec3(.05,.012,.075),.004);
  float well=sdRBox(q-vec3(0.,.024,-.015),vec3(.036,.009,.05),.012);
  well=min(well,length((q-vec3(0.,.024,.05))*vec3(1.,1.,1.4))-.028);
  return max(d,-well); }
vec3 brQ(vec3 p){ vec3 q=place(p,vec3(.1,.0056,-.12),-.2); return q; }
float brush(vec3 q){ float h=sdCylX(q,.0045,.085)-.0005;
  vec3 t=q-vec3(.105,0.,0.); float tip=length(vec3(t.x*.55,t.yz))-.0055*(1.-smoothstep(-.02,.03,t.x))-.001; tip=max(tip,-(q.x-.085));
  float fer=sdCylX(q-vec3(.087,0.,0.),.0056,.004);
  float lp=sdTorus((q-vec3(-.089,0.,0.)).yxz,.004,.0011);
  return min(min(h,tip),min(fer,lp)); }
float rest(vec3 p){ vec3 q=place(p,vec3(.07,0.,-.13),-.25);
  float d=sdRBox(q-vec3(0.,.008,0.),vec3(.03,.008,.007),.003);
  float bump=min(length(q.xy-vec2(-.013,.014))-.009,length(q.xy-vec2(.013,.014))-.009); bump=max(bump,abs(q.z)-.007);
  d=smin(d,bump,.004); d=max(d,-(length(q.xy-vec2(0.,.024))-.006));
  return d; }
/* shallow bowl of water */
#define BC vec3(.13,0.,.2)
float bowl(vec3 p){ vec3 q=p-BC; float r=length(q.xz);
  float o=length(vec2(r*.9,q.y-.075))-.08; float s=max(abs(o)-.003,q.y-.052);
  float foot=sdCylY(q-vec3(0.,.004,0.),.03,.004)-.001;
  return min(s*.9,foot); }
float water(vec3 p){ vec3 q=p-BC; return max(abs(q.y-.04)-.0005,length(q.xz)-.074); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=bkQ(p);
  r=U(r,slips(q),3.);
  r=U(r,cords(q),4.);
  r=U(r,inkstone(isQ(p)),5.);
  r=U(r,brush(brQ(p)),6.);
  r=U(r,bowl(p),8.);
  r=U(r,water(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bkQ(p); float a=.78+.06*sin(q.x*900.);
    if(n.y>.8&&q.y<.006){ float i=floor(q.x/SW); float cx=(i+.5)*SW; float z=q.z;
      /* broken hint-lines down each slip: marks, never characters */
      if(abs(q.x-cx)<.0012&&abs(z)<.075&&abs(abs(z)-.045)>.008&&fract(z/.011+i*.37)<.62) a=.25; }
    return a; }
  if(id==4.) return .4;
  if(id==5.){ vec3 q=isQ(p); return q.y<.02&&n.y>.5?.12:.3; }
  if(id==6.){ vec3 q=brQ(p); return q.x>.09?.15:q.x>.083?.4:.62; }
  if(id==7.) return .45;
  if(id==8.) return .82;
  if(id==9.) return .7;
  return .7; }
