/* s4 "Explorers, Colonies, a New Nation" — the voyages that began it: a sea chart unrolled
   with a coastline and its ends curling, a brass spyglass drawn out to full length lying across
   it, a pocket compass, and a small globe on a turned stand behind.
   @params {"mat":{"3":[0.9,1.0,0.6],"4":[0.5,1.4,1.0],"5":[0.35,1.3,1.0],"6":[0.5,1.3,1.0],"7":[0.9,1.0,0.6],"8":[0.7,1.3,1.0],"9":[0.5,1.3,1.0]},
            "texlines":{"3":[0.12,0.4,0.8],"4":[0.12,0.4,0.6],"7":[0.12,0.4,0.9],"8":[0.12,0.4,0.9]}} */
#define CAM_POS vec3(-0.5184,0.5943,-1.0707)
#define CAM_TGT vec3(-0.3368,0.0094,0.1483)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "ssceco.glsl"
#define MP vec3(.0,0.,.07)
#define MPR .12
#define HX .17
#define HZ .12
vec3 mpQ(vec3 p){ return P(p,MP,MPR); }
/* the telescope: along its own x, eyepiece at -x, objective at +x; lying tipped up on the far roll */
vec3 tsQ(vec3 p){ vec3 q=P(p,vec3(-.0,0.,.03),-.62); q-=vec3(0.,.026,0.); q.xy=rot(.07)*q.xy; return q; }
float scope(vec3 p){ vec3 q=tsQ(p);
  float d=sdCylX(q-vec3(.12,0.,0.),.023,.075)-.001;                              /* barrel */
  d=min(d,sdCylX(q-vec3(.2,0.,0.),.026,.012)-.0015);                              /* dew shade ring */
  d=min(d,sdCylX(q-vec3(.02,0.,0.),.018,.045)-.001);                              /* draw 1 */
  d=min(d,sdCylX(q-vec3(-.06,0.,0.),.0145,.045)-.001);                            /* draw 2 */
  d=min(d,sdCylX(q-vec3(-.125,0.,0.),.011,.028)-.001);                            /* draw 3 */
  d=min(d,sdCylX(q-vec3(-.155,0.,0.),.013,.006)-.0015);                           /* eyepiece */
  d=min(d,sdCylX(q-vec3(.046,0.,0.),.0245,.004)-.001);                            /* barrel rings */
  d=min(d,sdCylX(q-vec3(-.026,0.,0.),.02,.004)-.001);
  d=min(d,sdCylX(q-vec3(-.1,0.,0.),.0165,.004)-.001);
  d=max(d,-sdCylX(q-vec3(.215,0.,0.),.02,.01));                                   /* the open lens end */
  return d; }
float leather(vec3 p){ vec3 q=tsQ(p); return sdCylX(q-vec3(.12,0.,0.),.0238,.06)-.0005; }
#define CP vec3(.19,0.,.16)
#define GC vec3(-.02,.2,.25)
#define GR .085
float globe(vec3 p){ return length(p-GC)-GR; }
float gstand(vec3 p){ vec3 q=p-vec3(GC.x,0.,GC.z);
  float base=sdCylY(q-vec3(0.,.008,0.),.06,.006)-.003;
  float r=length(q.xz); float stem=max(r-(.011+.006*exp(-pow((q.y-.05)/.012,2.))),abs(q.y-.055)-.05);
  vec3 m=p-GC; m.xy=rot(-.41)*m.xy;
  float mer=max(abs(length(m.xy)-GR-.009)-.0028,abs(m.z)-.004);        /* half meridian ring */
  mer=max(mer,m.x-.02);
  float pin=sdCylY(m,.004,GR+.012);
  return min(min(base,stem),min(mer,pin)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,mapS(mpQ(p),HX,HZ),3.);
  float sc=scope(p), lt=leather(p);
  r=U(r,min(sc,lt),lt<sc?5.:4.);
  vec3 cq=P(p,CP,2.6)/1.3;
  float c=compass(cq,.04)*1.3;
  r=U(r,c,cq.y>.0145&&length(cq.xz)<.037?7.:6.);
  r=U(r,globe(p),8.);
  r=U(r,gstand(p),9.);
  return r; }
float coast(vec2 u){   /* a wandering coastline with an island and a bay */
  float x=u.x+.03*fbm(u*9.)-.015;
  float c=u.y-(-.02+.06*sin(u.x*14.+1.)+.03*fbm(u*12.));
  float isl=length((u-vec2(.1,-.07))*vec2(1.,1.6))-.018-.006*fbm(u*40.);
  return min(abs(c),abs(isl)); }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=mpQ(p); vec2 u=q.xz; float a=.93;
    if(abs(q.x)<HX-.012){
      float cs=coast(u); if(cs<.0018) a=.25;
      float land=u.y-(-.02+.06*sin(u.x*14.+1.)+.03*fbm(u*12.));
      if(land>0.&&cs>.004&&fract((u.x-u.y)/.008)<.18) a=.62;                            /* land hatched */
      if(land<0.&&cs<.012&&cs>.006) a=.6;                                                /* a wave echo */
      vec2 w=u-vec2(-.08,-.06); float rr=length(w); float ang=atan(w.y,w.x);
      if(rr<.035&&abs(fract(ang/(PI/4.)+.5)-.5)<.05*(.035-rr)/.035*6.) a=.3;           /* wind rose */
      if(abs(rr-.02)<.0009) a=.4; }
    return a; }
  if(id==4.){ vec3 q=tsQ(p); if(abs(n.x)>.7) return .35; return .58+.14*(1.-smoothstep(-.01,.02,q.y+q.z)); }
  if(id==5.){ vec3 q=tsQ(p); return fract(atan(q.z,q.y)*4.)<.15?.25:.35; }
  if(id==6.) return .5;
  if(id==7.) return compassT(P(p,CP,2.6)/1.3,.04);
  if(id==8.){ vec3 d=normalize(globeQ(p,GC,-.41,-.9)); float m=landMask(d);
    float lat=asin(d.y), lon=atan(d.z,d.x);
    if(abs(fract(lat/.39+.5)-.5)<.03||abs(fract(lon/.52+.5)-.5)<.03) return .55;      /* graticule */
    if(m>.5) return abs(m-.5)<.2?.2:.5; return .93; }
  if(id==9.) return .45+.15*(grain(p.zxy,60.)-.5);
  return .7; }
