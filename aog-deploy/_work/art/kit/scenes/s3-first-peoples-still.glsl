/* s3-first-peoples "The First Peoples" — things made and grown by Native nations of the Illinois
   country, from Cahokia to today: a round clay jar with an incised band, a coiled woven basket
   and two ears of corn with their husks pulled back. Objects only; no people, no costume. */
#define CAM_POS vec3(-0.4377,0.4726,-1.0359)
#define CAM_TGT vec3(-0.2685,-0.0720,0.0991)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
/* ---- clay jar: a round body, short neck and a flared lip ---- */
#define JC vec3(.06,0.,.09)
vec3 jaQ(vec3 p){ return place(p,JC,.3); }
float jarD(vec3 q){ float y=q.y; float r=length(q.xz);
  float d=sdEll(q-vec3(0.,.085,0.),vec3(.088,.085,.088));
  float neck=sdCylY(q-vec3(0.,.175,0.),.05,.025)-.002;
  float lip=sdTorus(q-vec3(0.,.2,0.),.058,.006);
  float out_=smin(d,neck,.02); out_=min(out_,lip);
  out_=max(out_,-sdCylY(q-vec3(0.,.19,0.),.044,.03));
  return out_*.9; }
/* ---- a coiled basket, shallow, open ---- */
#define BK vec3(-.17,0.,-.02)
vec3 bkQ(vec3 p){ return place(p,BK,0.); }
float basketD(vec3 q){ float r=length(q.xz);
  float R=.075+.02*clamp(q.y/.06,0.,1.);
  float wall=max(abs(r-R)-.005,max(-q.y,q.y-.06));
  float bot=max(r-.076,abs(q.y-.004)-.004);
  float rim=sdTorus(q-vec3(0.,.061,0.),.095,.006);
  float coil=.0012*sin(q.y*900.);                  /* the coils show as ridges */
  return min(min(wall+coil,bot),rim); }
/* ---- two ears of corn with husks folded back ---- */
vec3 cornQ(vec3 p,vec3 c,float ry,float tilt){ vec3 q=place(p,c,ry); q.xy=rot(tilt)*q.xy; return q; }
float earD(vec3 q){ float t=clamp(q.x/.13,0.,1.);
  float R=.021*(1.-.55*t*t)*smoothstep(-.01,.012,q.x);
  float k=.0012*sin(atan(q.z,q.y)*14.)*sin(q.x*520.);           /* kernel rows */
  return max(length(q.yz)-R-k,max(-q.x,q.x-.14))*.8; }
float huskD(vec3 q){ float d=1e5;       /* three husk leaves peeled back, lying on the table from the stalk end */
  vec3 b=q-vec3(-.005,-.019,0.);
  for(int i=0;i<3;i++){ float a=(float(i)-1.)*.45; vec3 h=b; h.xz=rot(a)*h.xz;
    float L=-h.x; float t=clamp(L/.12,0.,1.);
    float w=.022*sin(t*3.1416)+.003;
    float y=.002+.01*(1.-t)+.004*pow(abs(h.z)/.022,2.);
    float s=max(abs(h.y-y)-.0012,max(abs(h.z)-w,max(-L,L-.12)));
    d=min(d,s*.8); }
  float stalk=sdCylX(q+vec3(.012,0.,0.),.008,.012);
  return min(d,stalk); }
#define C1 vec3(-.03,.021,-.17)
#define C2 vec3(.13,.021,-.12)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.45-p.z,2.);
  r=U(r,jarD(jaQ(p)),3.);
  r=U(r,basketD(bkQ(p)),4.);
  vec3 a=cornQ(p,C1,.25,0.), b=cornQ(p,C2,-.55,0.);
  r=U(r,earD(a),5.); r=U(r,huskD(a),6.);
  r=U(r,earD(b),7.); r=U(r,huskD(b),6.);
  return r; }
float kernel(vec3 q){ float a=atan(q.z,q.y); vec2 g=vec2(q.x/.0085,a/.4488); vec2 f=abs(fract(g)-.5);
  return max(f.x,f.y)>.38?.3:.85; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=jaQ(p); float a=atan(q.z,q.x);
    if(q.y>.1&&q.y<.14){ float u=fract(a/.5236); float v=(q.y-.1)/.04;          /* incised band of nested chevrons */
      if(abs(abs(u-.5)*2.-v)<.12||abs(abs(u-.5)*2.-v+.45)<.1) return .2; }
    if(abs(q.y-.095)<.002||abs(q.y-.145)<.002) return .25;
    return .55+.08*fbm(q.xz*200.+q.y*80.); }
  if(id==4.){ vec3 q=bkQ(p); float a=atan(q.z,q.x); float c=fract(q.y/.007);
    float st=abs(fract(a/.13+.5*floor(q.y/.007))-.5);           /* stitches across the coils */
    return c<.2?.35:st<.12?.45:.72; }
  if(id==5.) return kernel(cornQ(p,C1,.25,0.));
  if(id==7.) return kernel(cornQ(p,C2,-.55,0.));
  if(id==6.) return .75+.1*fbm(p.xz*400.);
  return .7; }
