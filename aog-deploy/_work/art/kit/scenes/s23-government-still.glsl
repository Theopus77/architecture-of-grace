/* s23 "Government" — how the machine works: a small model of a domed, columned hall of
   government on stepped base (the lawmakers), a rolled bill tied with a ribbon (the road a bill
   travels), and a judge's gavel resting on its round sound block (the courts).
   @params {"mat":{"3":[0.8,1.3,1.0],"4":[0.75,1.3,1.0],"5":[0.9,1.1,0.8],"6":[0.35,1.2,0.9],"7":[0.45,1.3,1.0],"8":[0.55,1.3,1.0]},
            "texlines":{"3":[0.12,0.4,0.6],"4":[0.12,0.4,0.6],"5":[0.12,0.4,0.6],"7":[0.12,0.4,0.5]}} */
#define CAM_POS vec3(-0.5284,0.5974,-1.1680)
#define CAM_TGT vec3(-0.3349,-0.0263,0.1310)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEllD(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define HC vec3(-.03,0.,.14)
#define HR .5
vec3 hQ(vec3 p){ vec3 q=p-HC; q.xz=rot(HR)*q.xz; return q; }
/* stepped base, ring of columns, entablature, drum and dome */
float hall(vec3 p){ vec3 q=hQ(p); float r=length(q.xz);
  float d=sdCylY(q-vec3(0.,.008,0.),.13,.008)-.002;
  d=min(d,sdCylY(q-vec3(0.,.022,0.),.118,.006)-.002);
  d=min(d,sdCylY(q-vec3(0.,.034,0.),.106,.006)-.002);
  /* columns */
  float a=atan(q.z,q.x); float n=16.; float s=6.2832/n; float ai=(floor(a/s)+.5)*s;
  vec2 c=vec2(cos(ai),sin(ai))*.092; vec3 cq=vec3(q.x-c.x,q.y,q.z-c.y);
  float col=max(length(cq.xz)-.0068+.0012*(q.y-.04)/.09,abs(q.y-.085)-.045);
  col=min(col,max(length(cq.xz)-.0095,abs(q.y-.043)-.003));   /* bases */
  col=min(col,max(length(cq.xz)-.0095,abs(q.y-.127)-.003));   /* capitals */
  d=min(d,col);
  float core=sdCylY(q-vec3(0.,.085,0.),.074,.045);            /* the wall inside the columns */
  core=max(core,-max(abs(a-(-1.9))-.16,abs(q.y-.075)-.028)*1.);
  d=min(d,core);
  d=min(d,sdCylY(q-vec3(0.,.137,0.),.104,.007)-.002);        /* entablature */
  d=min(d,sdCylY(q-vec3(0.,.152,0.),.09,.008)-.002);
  d=min(d,sdCylY(q-vec3(0.,.175,0.),.074,.018)-.001);         /* drum */
  float dome=max(sdEllD(q-vec3(0.,.19,0.),vec3(.072,.075,.072)),-(q.y-.19));
  d=min(d,dome);
  d=min(d,sdCylY(q-vec3(0.,.272,0.),.014,.012)-.002);         /* lantern */
  d=min(d,length(q-vec3(0.,.291,0.))-.009);
  return d; }
/* a rolled document tied with a ribbon and a bow */
vec3 rlQ(vec3 p){ vec3 q=p-vec3(.16,.022,.03); q.xz=rot(-.9)*q.xz; return q; }
float roll(vec3 p){ vec3 q=rlQ(p); float d=sdCylX(q,.021,.1)-.001;
  d=max(d,-(sdCylX(q-vec3(0.,0.,0.),.012,.2)));
  float lip=max(abs(length(q.yz-vec2(.004,.003))-.017)-.0012,abs(q.x)-.1016); /* the inner turns at the ends */
  return min(d,lip); }
float ribbon(vec3 p){ vec3 q=rlQ(p);
  float band=max(abs(length(q.yz)-.0225)-.0015,abs(q.x)-.007);
  vec3 b=q-vec3(0.,.024,0.);
  float loops=min(length(vec2(length((b-vec3(-.012,.003,0.)).xy*vec2(1.,1.4))-.009,b.z))-.0022,
                  length(vec2(length((b-vec3(.012,.003,0.)).xy*vec2(1.,1.4))-.009,b.z))-.0022);
  float tails=min(sdCapsule(b,vec3(0.),vec3(-.018,-.012,-.022),.0022),sdCapsule(b,vec3(0.),vec3(.02,-.014,-.02),.0022));
  return min(band,min(loops,tails)); }
/* gavel on its block */
#define GB vec3(-.08,0.,-.12)
float block(vec3 p){ vec3 q=p-GB; return min(sdCylY(q-vec3(0.,.01,0.),.055,.01)-.003,sdCylY(q-vec3(0.,.022,0.),.045,.004)-.002); }
vec3 gvQ(vec3 p){ vec3 q=p-GB-vec3(.01,.058,.0); q.xz=rot(.45)*q.xz; return q; }
float gavel(vec3 p){ vec3 q=gvQ(p);
  vec3 h=q; float r=length(h.yz);
  float head=max(r-(.028-.004*smoothstep(.02,.05,abs(h.x))),abs(h.x)-.055)-.002;
  head=min(head,max(r-.031,abs(abs(h.x)-.04)-.003));                      /* turned bands */
  vec3 hq=q-vec3(0.,-.0,0.); hq.yz=rot(.12)*hq.yz;
  float handle=sdCapsule(hq,vec3(0.,0.,-.02),vec3(0.,-.006,-.2),.0075);
  handle=smin(handle,length(hq-vec3(0.,-.006,-.205))-.011,.01);
  return min(head,handle); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,hall(p),3.);
  r=U(r,roll(p),5.);
  r=U(r,ribbon(p),6.);
  r=U(r,block(p),7.);
  r=U(r,gavel(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=hQ(p); float r=length(q.xz);
    if(q.y>.19&&abs(fract(atan(q.z,q.x)/6.2832*16.)-.5)>.46) return .55;      /* dome ribs */
    if(q.y>.06&&q.y<.12&&r<.078) return .45;                                   /* shade behind columns */
    return .82; }
  if(id==5.){ vec3 q=rlQ(p); if(abs(q.x)>.099) return fract(length(q.yz)/.003)<.3?.5:.9; return .9; }
  if(id==6.) return .3;
  if(id==7.) return .45+.14*(grain(p.zxy,70.)-.5);
  if(id==8.) return .52+.16*(grain(gvQ(p).yxz,70.)-.5);
  return .7; }
