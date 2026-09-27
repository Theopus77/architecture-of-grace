/* b28 "What Living Things Need" — a metal watering can, a seedling with its first leaves
   in a small pot of soil, and a glass of water. */
#define CAM_POS vec3(-0.4034,0.2615,-0.5336)
#define CAM_TGT vec3(-0.1946,0.0385,0.1212)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define WC vec3(-.06,0.,.1)
float can(vec3 p){ vec3 q=place(p,WC,.3);
  float body=sdCylY(q-vec3(0.,.07,0.),.065,.07)-.004;
  body=max(body,-sdCylY(q-vec3(0.,.15,0.),.058,.012));
  float rim=sdTorus(q-vec3(0.,.14,0.),.064,.004);
  float band=sdTorus(q-vec3(0.,.045,0.),.068,.0025);
  vec3 s0=vec3(-.05,.035,0.), s1=vec3(-.16,.15,0.);
  float sp=sdCapsule(q,s0,s1,.009);
  vec3 rq=q-s1; rq.xy=rot(.8)*rq.xy; float rose=sdCone(rq-vec3(0.,.012,0.),.012,.022,.012)-.001;
  float hd=max(sdTorus((q-vec3(.02,.14,0.)).xzy,.055,.006),-(q.y-.15));      /* top handle */
  float bh=sdTorus((q-vec3(.07,.09,0.)).xzy,.035,.005); bh=max(bh,-(q.x-.068));  /* back handle */
  return min(min(min(body,rim),band),min(min(sp,rose),min(hd,bh))); }
#define PT vec3(.14,0.,.0)
float pot(vec3 p){ vec3 q=p-PT;
  float o=sdCone(q-vec3(0.,.035,0.),.033,.043,.035)-.002;
  float rim=sdCylY(q-vec3(0.,.072,0.),.047,.008)-.002;
  float d=min(o,rim); d=max(d,-sdCylY(q-vec3(0.,.08,0.),.039,.016));
  d=min(d,sdCylY(q-vec3(0.,.07,0.),.04,.004)+.002*fbm(q.xz*200.));
  return d; }
float seedling(vec3 p){ vec3 q=p-PT-vec3(0.,.07,0.);
  float st=sdCapsule(q,vec3(0.),vec3(.004,.07,.0),.0022);
  st=min(st,sdCapsule(q,vec3(.004,.07,0.),vec3(.0,.1,.002),.0018));
  vec3 a=q-vec3(-.02,.07,0.); a.xy=rot(-.35)*a.xy; float c1=sdEll(a,vec3(.02,.003,.012));
  vec3 b=q-vec3(.026,.068,0.); b.xy=rot(.3)*b.xy; float c2=sdEll(b,vec3(.02,.003,.012));
  vec3 l=q-vec3(-.012,.108,.004); l.xy=rot(-.9)*l.xy; float t1=sdEll(l,vec3(.016,.0025,.008));
  vec3 m=q-vec3(.012,.106,-.004); m.xy=rot(.8)*m.xy; float t2=sdEll(m,vec3(.014,.0025,.007));
  return min(st,min(min(c1,c2),min(t1,t2))); }
#define GL vec3(.1,0.,.2)
float glass(vec3 p){ vec3 q=p-GL; float r=.024+q.y*.06;
  float o=sdCylY(q-vec3(0.,.065,0.),r,.065)-.001;
  float i=sdCylY(q-vec3(0.,.071,0.),r-.0025,.065);
  return max(o,-i); }
float water(vec3 p){ vec3 q=p-GL; return sdCylY(q-vec3(0.,.045,0.),.024+q.y*.06-.0025,.04); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,can(p),3.);
  r=U(r,pot(p),4.);
  r=U(r,seedling(p),5.);
  r=U(r,glass(p),6.);
  r=U(r,water(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=place(p,WC,.3); return q.y>.13&&length(q.xz)<.058?.25:.62; }
  if(id==4.){ vec3 q=p-PT; if(q.y>.068&&length(q.xz)<.041) return .25; return .6; }
  if(id==5.) return .5;
  if(id==6.){ vec3 q=p-GL; return abs(q.y-.085)<.0025?.3:(q.y<.085?.74:.93); }
  if(id==7.) return .75;
  return .7; }
