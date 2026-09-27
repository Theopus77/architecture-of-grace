/* Medicine and Health Unit 7 "Mind and Body" — pencil still life: a young leafy plant in a
   clay pot (growing and changing), a closed notebook for feelings with a pencil on it, and
   two smooth calm stones. */
#define CAM_POS vec3(-0.2867,0.3174,-0.7249)
#define CAM_TGT vec3(-0.1595,0.0030,0.0383)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define PT vec3(-.02,0.,.08)
#define NB vec3(.12,0.,-.03)
#define PC vec3(.12,.028,-.03)
float potD(vec3 p){ vec3 q=p-PT;
  float o=sdCone(q-vec3(0.,.045,0.),.042,.055,.045)-.002;
  o=min(o,sdCylY(q-vec3(0.,.083,0.),.062,.011)-.002);
  float i=sdCylY(q-vec3(0.,.09,0.),.052,.02);
  return max(o,-i); }
float soilD(vec3 p){ vec3 q=p-PT; return sdCylY(q-vec3(0.,.082,0.),.054,.003)+.0008*fbm(q.xz*300.); }
float leafAt(vec3 q,vec3 base,float yaw,float tilt,float L){
  vec3 l=q-base; l.xz=rot(yaw)*l.xz; l.xy=rot(tilt)*l.xy; l-=vec3(L,0.,0.);
  float w=L*.45*(1.-l.x*l.x/(L*L));
  float d=sdEll(l,vec3(L,.0025+L*.02,L*.42));
  d+= .004*abs(l.z)/L*0.;
  return d; }
float plantD(vec3 p){ vec3 q=p-PT;
  float d=sdCapsule(q,vec3(0.,.08,0.),vec3(.003,.175,.0),.004);
  for(int i=0;i<7;i++){ float fi=float(i); float y=.1+fi*.012; float yaw=fi*2.4+.5; float L=.055-fi*.004;
    vec3 l=q-vec3(0.,y,0.); l.xz=rot(yaw)*l.xz; l.xy=rot(.3+fi*.05)*l.xy;
    l.y+=.35*l.x*l.x/L;                                            /* the leaf arches down */
    l.x-=L*.95;
    float t=clamp(l.x/L*.5+.5,0.,1.);
    vec3 m=vec3(l.x,l.y,l.z/(1.05-.75*t));                          /* narrows to a point */
    d=min(d,sdEll(m,vec3(L,.003,L*.4))*.7);
    d=min(d,sdCapsule(q-vec3(0.,y,0.),vec3(0.),vec3(0.),.0)); }
  return d; }
vec3 nbQ(vec3 p){ return place(p,NB,-.2); }
float noteD(vec3 p){ vec3 q=nbQ(p);
  float cov=sdRBox(q-vec3(0.,.012,0.),vec3(.085,.012,.11),.003);
  float pg=sdBox(q-vec3(.004,.012,0.),vec3(.085,.009,.106));
  float d=max(cov,-pg); d=min(d,pg-.0005);
  d=min(d,sdRBox(q-vec3(.06,.012,0.),vec3(.005,.0128,.111),.001));    /* elastic band */
  return d; }
vec3 pcQ(vec3 p){ vec3 q=p-vec3(NB.x-.01,.0305,NB.z-.01); q.xz=rot(-.9)*q.xz; return q; }
float stones(vec3 p){ vec3 a=p-vec3(-.11,.012,-.06); a.xz=rot(.5)*a.xz; vec3 b=p-vec3(-.085,.03,-.07); b.xz=rot(-.3)*b.xz;
  return min(sdEll(a,vec3(.035,.014,.026)),sdEll(b,vec3(.022,.01,.017))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,potD(p),3.);
  r=U(r,soilD(p),4.);
  r=U(r,plantD(p),5.);
  r=U(r,noteD(p),6.);
  r=U(r,pencilD2(pcQ(p),.075),7.);
  r=U(r,stones(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PT; if(q.y>.07&&q.y<.073) return .35; return .6; }
  if(id==4.) return .25;
  if(id==5.){ vec3 q=p-PT; float a=atan(q.z,q.x); return .45; }
  if(id==6.){ vec3 q=nbQ(p); if(abs(q.x-.06)<.005) return .3; if(q.y<.022&&abs(q.x)<.083&&abs(q.z)<.105&&n.y<.5) return fract(q.y/.0018)<.3?.7:.95; return .5; }
  if(id==7.) return pencilTone(pcQ(p),.075);
  if(id==8.) return .55;
  return .7; }
