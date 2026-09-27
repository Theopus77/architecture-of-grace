/* Practice room "Religion and the World" — pencil still life: a desk globe on a tilted meridian
   stand, a row of old books with plain covers held by a bookend, and a small clay oil lamp.
   Objects only, no symbols of any one faith. */
#define CAM_POS vec3(-0.3512,0.4248,-0.7711)
#define CAM_TGT vec3(-0.2180,-0.0046,0.1238)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define GLB vec3(.0,0.,.05)
#define GR .07
#define GC vec3(0.,.155,0.)
#define BKS vec3(-.17,0.,.08)
#define LMP vec3(.12,0.,-.08)
vec3 gQ(vec3 q){ vec3 g=q-GC; g.xy=rot(.41)*g.xy; return g; }
float globeD(vec3 q){ return length(q-GC)-GR; }
float standD(vec3 q){ float d=cylS(q,.055,.012,.004); d=min(d,sdCone(q-vec3(0.,.035,0.),.012,.006,.024));
  vec3 g=gQ(q); float ring=max(abs(length(g.xy)-GR-.008)-.003,abs(g.z)-.004); ring=max(ring,-g.x-.02);
  d=min(d,ring); d=min(d,sdCylY(g,.002,GR+.014)); return d; }
float booksD(vec3 p){ float d=1e3; for(int i=0;i<4;i++){ float h=.1+.018*sin(float(i)*2.3); float w=.012+.004*fract(float(i)*.37);
    vec3 q=p-BKS-vec3(float(i)*.03,h*.5,0.); if(i==3){ q=p-BKS-vec3(.1,h*.5-.01,0.); q.xy=rot(-.35)*q.xy; }
    d=min(d,sdRBox(q,vec3(w,h*.5,.045),.003)); } return d; }
float endD(vec3 p){ vec3 q=p-BKS-vec3(-.03,0.,0.); float d=sdRBox(q-vec3(0.,.055,0.),vec3(.006,.055,.04),.002); d=min(d,sdRBox(q-vec3(.02,.003,0.),vec3(.025,.003,.04),.001)); return d; }
vec3 lpQ(vec3 p){ vec3 q=p-LMP; q.xz=rot(.25)*q.xz; return q/1.5; }
float lampD(vec3 q){ float d=sdEll(q-vec3(0.,.018,0.),vec3(.045,.02,.035)); d=max(d,-(q.y-.028)); d=smin(d,sdEll(q-vec3(.045,.02,0.),vec3(.028,.012,.012)),.01);
  d=max(d,-sdCylY(q-vec3(0.,.03,0.),.012,.01)); d=min(d,sdTorus(q-vec3(0.,.028,0.),.013,.003));
  d=min(d,sdTorus((q-vec3(-.05,.025,0.)).xzy,.013,.003)); return d; }
float flameD(vec3 q){ vec3 f=q-vec3(.068,.042,0.); return sdEll(f,vec3(.006,.014,.006)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=p-GLB;
  r=U(r,globeD(q),3.);
  r=U(r,standD(q),4.);
  r=U(r,booksD(p),5.);
  r=U(r,endD(p),4.);
  vec3 l=lpQ(p);
  r=U(r,lampD(l)*1.5,6.);
  r=U(r,flameD(l)*1.5,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 g=gQ(p-GLB); float lon=atan(g.z,g.x), lat=asin(clamp(g.y/GR,-1.,1.));
    float land=fbm(vec2(lon*1.6,lat*3.)+2.3); if(abs(fract(lon/(PI/6.))-.5)>.48||abs(fract(lat/(PI/12.))-.5)>.47) return .55;
    return land>.55?.45:.85; }
  if(id==4.) return .45;
  if(id==5.){ vec3 q=p-BKS; float y=q.y; float k=floor((q.x+.015)/.03); if(abs(y-.02)<.003||abs(y-.08)<.003) return .3; return mod(k,2.)<1.?.45:.6; }
  if(id==6.) return .55;
  if(id==7.) return .95;
  return .7; }
