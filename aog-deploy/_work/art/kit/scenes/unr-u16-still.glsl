/* The Unseen Realm Unit 16 "Destiny: God's Family and the Nations Restored" — pencil still life:
   a small fruit tree growing in a clay pot (the tree of life, its leaves for the healing of the
   nations, Revelation 22:2), a simple gold crown resting on the table (Revelation 2:26-27 and
   3:21), and a small stone cube with three little arched gates cut in its face (the new
   Jerusalem, a cube like the holy of holies). */
#define CAM_POS vec3(-0.6154,0.4562,-1.3416)
#define CAM_TGT vec3(-0.3376,0.0553,0.1084)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define POT vec3(.02,0.,.1)
#define CRN vec3(.2,0.,-.03)
#define CUB vec3(-.13,0.,-.06)
float sdB2(vec2 p,vec2 b,float r){ vec2 d=abs(p)-b+r; return length(max(d,0.))+min(max(d.x,d.y),0.)-r; }
/* the pot: a tapered clay pot with a rolled rim, filled with soil */
float potD(vec3 p){ vec3 q=p-POT; float r=length(q.xz);
  float rr=.052+.022*clamp(q.y/.11,0.,1.);
  float d=max((r-rr)*.95,abs(q.y-.055)-.055);
  d=min(d,sdTorus(q-vec3(0.,.108,0.),.075,.009));
  d=max(d,-max(r-rr+.007,-(q.y-.1)));
  return d; }
float soilD(vec3 p){ vec3 q=p-POT; return max(length(q.xz)-.07,q.y-.1-.003*vn(q.xz*120.)); }
/* the tree: a forked trunk and five round clusters of leaves, with a few fruit */
float trunkD(vec3 p){ vec3 q=p-POT;
  float d=sdCapsule(q,vec3(0.,.09,0.),vec3(.004,.2,0.),.009);
  d=smin(d,sdCapsule(q,vec3(.004,.19,0.),vec3(-.05,.26,.01),.006),.01);
  d=smin(d,sdCapsule(q,vec3(.004,.19,0.),vec3(.055,.27,-.01),.006),.01);
  d=smin(d,sdCapsule(q,vec3(.004,.2,0.),vec3(.006,.3,.02),.005),.01);
  d+=.0008*vn3(q*300.);
  return d; }
vec3 cl(int i){ return i==0?vec3(-.06,.28,.01):i==1?vec3(.065,.29,-.01):i==2?vec3(.0,.33,.03):i==3?vec3(-.03,.36,-.02):vec3(.04,.35,.0); }
float leavesD(vec3 p){ vec3 q=p-POT; float d=1e3;
  for(int i=0;i<5;i++){ vec3 c=q-cl(i); d=smin(d,length(c*vec3(1.,1.25,1.))-.052,.02); }
  float n=vn3(q*90.)*.6+vn3(q*190.)*.4;
  return d+.012*(n-.5); }
float fruitD(vec3 p){ vec3 q=p-POT; float d=1e3;
  for(int i=0;i<4;i++){ vec3 c=i==0?vec3(-.075,.25,-.035):i==1?vec3(.07,.255,-.045):i==2?vec3(-.01,.31,-.045):vec3(.035,.3,-.05);
    d=min(d,length(q-c)-.0115); }
  return d; }
/* the crown: a band with seven points, each ending in a small ball, and a raised rim */
float crownU(vec3 q){ float r=length(q.xz); float a=atan(q.z,q.x);
  float band=max(abs(r-.05)-.0028,abs(q.y-.02)-.02);
  float k=7.; float s=abs(fract(a/6.2832*k+.5)-.5)*2.;                    /* 0 at a point, 1 between */
  float top=.04+.028*(1.-s);
  float pts=max(abs(r-.05)-.0024,max(q.y-top,-q.y+.03));
  float d=min(band,pts);
  d=min(d,sdTorus(q-vec3(0.,.004,0.),.0515,.0036));
  d=min(d,sdTorus(q-vec3(0.,.038,0.),.0515,.003));
  float aa=(floor(a/6.2832*k+.5))*6.2832/k; vec3 b=q-vec3(.05*cos(aa),.07,.05*sin(aa));
  d=min(d,length(b)-.0062);
  return d; }
float crownD(vec3 p){ return crownU((p-CRN)/1.45)*1.45; }
/* the cube: a smooth stone cube, bevelled, three arched gates cut into its front face */
vec3 cubQ(vec3 p){ vec3 q=p-CUB; q.xz=rot(.45)*q.xz; return q-vec3(0.,.05,0.); }
float arch3(vec2 u){ float d=1e3;
  for(int i=0;i<3;i++){ vec2 v=u-vec2(-.027+.027*float(i),-.012);
    d=min(d,min(sdB2(v-vec2(0.,-.008),vec2(.0075,.014),.001),length(v-vec2(0.,.006))-.0075)); }
  return d; }
float cubeD(vec3 p){ vec3 q=cubQ(p);
  float d=sdRBox(q,vec3(.05),.004);
  if(d>.02) return d;
  d=max(d,-max(arch3(q.xy),abs(q.z+.05)-.004));
  d=max(d,-max(arch3(vec2(-q.z,q.y)),abs(q.x-.05)-.004));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,potD(p),3.);
  r=U(r,soilD(p),4.);
  r=U(r,trunkD(p),5.);
  r=U(r,leavesD(p),6.);
  r=U(r,fruitD(p),7.);
  r=U(r,crownD(p),8.);
  r=U(r,cubeD(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-POT; if(abs(q.y-.04)<.002) return .4; return .6+.05*fbm(q.xy*30.); }
  if(id==4.) return .3;
  if(id==5.) return .38;
  if(id==6.){ vec3 q=p-POT; return .42+.25*vn3(q*140.); }
  if(id==7.) return .66;
  if(id==8.){ vec3 q=(p-CRN)/1.45; float r=length(q.xz); if(abs(q.y-.021)<.0025) return .4; return .7; }
  if(id==9.){ vec3 q=cubQ(p); float a=.78+.06*fbm(q.xy*20.+q.z*10.);
    if((q.z<-.046&&arch3(q.xy)<.0015)||(q.x>.046&&arch3(vec2(-q.z,q.y))<.0015)) a=.35;
    return a; }
  return .7; }
