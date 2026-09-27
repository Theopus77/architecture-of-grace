/* Practice room "Capstone: An Inquiry from the Sources" — pencil still life of a researcher's
   desk: a wooden library card-catalog drawer full of index cards with a raised tab card, a brass
   label plate and a pull, three index cards fanned on the table (hint-lines only) with a
   pencil lying across them. */
#define CAM_POS vec3(-0.3561,0.2674,-0.6446)
#define CAM_TGT vec3(-0.0992,-0.0239,0.1091)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* drawer: long box, open top, front panel toward the viewer (and a little turned) */
vec3 drQ(vec3 p){ vec3 q=p-vec3(-.02,0.,.1); q.xz=rot(-.85)*q.xz; return q; }   /* x across, z along the drawer, front at -z */
#define DW .065
#define DL .16
#define DH .05
float drawerD(vec3 q){ float o=sdRBox(q-vec3(0.,DH,0.),vec3(DW,DH,DL),.003);
  o=max(o,-sdBox(q-vec3(0.,DH+.01,0.),vec3(DW-.007,DH,DL-.007)));
  float front=sdRBox(q-vec3(0.,DH+.004,-DL),vec3(DW+.006,DH+.006,.008),.003);
  return min(o,front); }
float plateD(vec3 q){ return sdRBox(q-vec3(0.,DH+.022,-DL-.009),vec3(.024,.012,.0015),.001); }
float pullD(vec3 q){ vec3 c=q-vec3(0.,DH-.008,-DL-.012); float d=sdCapsule(c,vec3(-.018,0.,-.004),vec3(.018,0.,-.004),.0028);
  d=min(d,sdCapsule(c,vec3(-.018,0.,-.004),vec3(-.018,0.,.004),.0025)); d=min(d,sdCapsule(c,vec3(.018,0.,-.004),vec3(.018,0.,.004),.0025)); return d; }
/* cards standing in the drawer, a taller tab card among them */
float cardsD(vec3 q){ vec3 c=q-vec3(0.,.0,0.);
  float d=sdBox(c-vec3(0.,DH+.012,.0),vec3(DW-.009,DH+.012,DL-.012));
  float sl=abs(fract(c.z/.006)-.5)*.006-.0022; d=max(d,-max(sl,-(c.y-DH*2.+.002)));
  d=max(d,c.y-(DH*2.+.02-.004*sin(c.z*90.)));
  float tab=sdRBox(c-vec3(-.02,DH*2.+.03,-.03),vec3(.022,.018,.0011),.001);
  tab=min(tab,sdRBox(c-vec3(.0,DH*2.+.015,-.03),vec3(DW-.01,.012,.0011),.001));
  return min(d,tab); }
/* index cards fanned on the table */
vec3 icQ(vec3 p,int i){ float fi=float(i); vec3 q=p-vec3(.2+fi*.018,.0012+fi*.0011,-.07-fi*.004); q.xz=rot(-.1-fi*.22)*q.xz; return q; }
float icD(vec3 p){ float d=1e3; for(int i=0;i<3;i++) d=min(d,sdRBox(icQ(p,i),vec3(.063,.0005,.038),.0004)); return d; }
/* a pencil lying across the cards */
vec3 pnQ(vec3 p){ vec3 q=p-vec3(.22,.0085,-.06); q.xz=rot(.45)*q.xz; return q; }
float pencilD(vec3 q){ float R=.0058; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x)-.085);
  float t=clamp((q.x-.085)/.022,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95,max(.085-q.x,q.x-.107));
  float fer=max(length(q.yz)-R*.98,abs(q.x+.093)-.008);
  float era=max(length(q.yz)-R*.93,abs(q.x+.107)-.006)-.0006;
  return min(min(body,cone),min(fer,era)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=drQ(p);
  r=U(r,drawerD(q),3.); r=U(r,min(plateD(q),pullD(q)),4.); r=U(r,cardsD(q),5.);
  r=U(r,icD(p),6.);
  r=U(r,pencilD(pnQ(p)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .48+.06*fbm(drQ(p).xy*vec2(8.,60.));
  if(id==4.) return .6;
  if(id==5.) return .95;
  if(id==6.){ for(int i=2;i>=0;i--){ vec3 q=icQ(p,i); if(abs(q.x)<.064&&abs(q.z)<.039){
      if(q.z>.026) return .45;                                                 /* the red top rule */
      if(abs(q.x)<.052&&q.z<.018&&q.z>-.03&&fract((q.z+.1)/.0095)<.16) return .6; /* hint-lines */
      return .96; } } return .96; }
  if(id==7.){ vec3 q=pnQ(p); if(q.x>.085) return q.x>.1?.12:.88; if(q.x<-.1) return .5; if(q.x<-.085) return .3; return .55; }
  return .7; }
