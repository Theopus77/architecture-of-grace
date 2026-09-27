/* Room "Fabric, Fibers and Patterns" — pencil still life: a folded stack of cloth (a plaid on
   top, stripes below), a wooden spool of thread, and a round pincushion stuck with pins. */
#define CAM_POS vec3(-0.2932,0.2244,-0.4728)
#define CAM_TGT vec3(-0.1245,-0.0045,0.0456)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define CL vec3(-.05,0.,.08)
#define SPL vec3(.13,0.,.07)
#define PC vec3(.1,0.,-.1)
vec3 clQ(vec3 p){ return place(p,CL,.2); }
float clothD(vec3 p,out float k){ vec3 q=clQ(p); float d=1e5; k=0.;
  for(int i=0;i<3;i++){ float y=.012+float(i)*.024; vec3 c=q-vec3(.006*float(i),y,.004*float(i));
    float b=sdRBox(c,vec3(.1,.011,.07),.01); if(b<d){ d=b; k=float(i); } }
  return d; }
float spoolD(vec3 p){ vec3 q=p-SPL;
  float fl=min(sdCylY(q-vec3(0.,.006,0.),.034,.005),sdCylY(q-vec3(0.,.094,0.),.034,.005))-.002;
  float th=sdCylY(q-vec3(0.,.05,0.),.028+.0006*sin(q.y*1400.),.04);
  float core=sdCylY(q-vec3(0.,.05,0.),.014,.05);
  float d=min(min(fl,th),core);
  d=max(d,-sdCylY(q-vec3(0.,.05,0.),.005,.06));
  /* a loose end of thread trailing to the table */
  float end=sdCapsule(q,vec3(.028,.07,-.01),vec3(.05,.004,-.05),.0012); end=min(end,sdCapsule(q,vec3(.05,.0012,-.05),vec3(.1,.0012,-.07),.0012));
  return min(d,end); }
float cushD(vec3 p){ vec3 q=p-PC; float a=atan(q.z,q.x);
  float d=sdEll(q-vec3(0.,.032,0.),vec3(.05,.035,.05));
  d+=.004*(1.-abs(sin(a*4.)))*smoothstep(.0,.03,length(q.xz));
  float cap=sdCylY(q-vec3(0.,.07,0.),.009,.004)-.002;
  return min(d*.8,cap); }
float pinsD(vec3 p){ float d=1e5;
  for(int i=0;i<5;i++){ float fi=float(i); float a=fi*1.3+.3;
    vec3 dir=normalize(vec3(cos(a)*.7,1.,sin(a)*.7));
    vec3 s=PC+vec3(0.,.032,0.)+dir*.03;
    vec3 e=s+dir*.03;
    d=min(d,sdCapsule(p,s,e,.0009)); d=min(d,length(p-e)-.0045); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  float k; r=U(r,clothD(p,k),3.);
  r=U(r,spoolD(p),4.);
  r=U(r,cushD(p),5.);
  r=U(r,pinsD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ float k; clothD(p,k); vec3 q=clQ(p);
    if(k>1.5){ float a=fract(q.x/.03), b=fract(q.z/.03); float t=.85; if(a<.3) t-=.25; if(b<.3) t-=.25; if(abs(a-.65)<.04||abs(b-.65)<.04) t-=.15; return t; }   /* plaid */
    if(k>.5) return fract((q.x+q.z*.0)/.016)<.5?.45:.85;   /* stripes */
    return .6+.1*fract(q.x/.004); }
  if(id==4.){ vec3 q=p-SPL; if(q.y<.013||q.y>.087) return .5+.12*grain(q,60.); return .35+.1*fract(q.y/.0045); }
  if(id==5.){ vec3 q=p-PC; if(q.y>.066) return .4; return abs(sin(atan(q.z,q.x)*4.))<.12?.3:.55; }
  if(id==6.) return .35;
  return .7; }
