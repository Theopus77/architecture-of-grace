/* U.S. History Unit 10 "America in a Changing World" (The Night the Wall Opened) — pencil
   still life: a standing slab of the Berlin Wall with its rounded top, chipped and broken at
   one edge, a hammer and a chisel lying before it, and a few broken chunks of concrete on
   the table. No figures, no graffiti words. */
#define CAM_POS vec3(-0.4543,0.5219,-1.0326)
#define CAM_TGT vec3(-0.2824,-0.0315,0.1207)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define WL vec3(-.01,0.,.12)
vec3 wq(vec3 p){ return L(p,WL,.22); }
float wall(vec3 q){
  float slab=sdRBox(q-vec3(0,.11,0),vec3(.1,.11,.012),.002);
  float foot=sdRBox(q-vec3(0,.012,.03),vec3(.1,.012,.045),.002);
  float cap=sdCylX(q-vec3(0,.232,0),.02,.1);
  float d=min(min(slab,foot),cap);
  /* a broken bite out of the right edge, with rough faces */
  float bite=length((q.xy-vec2(.1,.14))*vec2(1.,.7))-.045+(fbm(q.xy*80.)-.5)*.02; d=max(d,-bite);
  float rebar=min(sdCylY(q-vec3(.078,.14,0),.0022,.05),sdCylY(q-vec3(.09,.12,.004),.0022,.04));
  rebar=max(rebar,-(-bite));
  d+=(fbm(q.xy*60.)-.5)*.0015;
  return min(d,max(rebar,bite-.015)); }
float chunks(vec3 q){ float d=1e5; for(int i=0;i<5;i++){ float f=float(i); vec3 c=q-vec3(f*.03-.05+.01*sin(f*3.),.009+.004*sin(f*2.),.02*cos(f*2.3));
  c.xz=rot(f)*c.xz; d=min(d,sdRBox(c,vec3(.012+.005*sin(f*1.7),.009,.01),.002)+(fbm(c.xz*90.+f)-.5)*.005); } return d; }
float hammer(vec3 q){ float h=sdCapsule(q,vec3(-.1,.008,0),vec3(.04,.008,0),.0065);
  float head=sdRBox(q-vec3(.05,.014,0),vec3(.012,.014,.035),.003); float face=sdCylZ(q-vec3(.05,.014,-.035),.013,.008);
  return min(h,min(head,face)); }
float chisel(vec3 q){ float s=sdCylX(q-vec3(0,.006,0),.006,.06); vec3 t=q-vec3(.075,.006,0); float tip=max(max(abs(t.y)-.005*(1.-t.x/.02),abs(t.z)-.009),abs(t.x-.005)-.015);
  return min(s,tip); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,wall(wq(p)),3.);
  r=U(r,chunks(L(p,vec3(.2,0.,.02),.3)),4.);
  r=U(r,hammer(L(p,vec3(-.1,0.,-.11),-.25)),5.);
  r=U(r,chisel(L(p,vec3(.08,0.,-.13),.35)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=wq(p); float a=.66-.1*fbm(q.xy*50.);
    if(q.z<-.009&&q.y>.03&&q.y<.21){ float s=fbm(q.xy*9.); if(s>.55) a=.42; if(abs(s-.55)<.012) a=.25; if(s<.38) a=.8; }
    if(abs(q.x)<.0015&&q.y<.22) a=.4; return a; }
  if(id==4.) return .55;
  if(id==5.){ vec3 q=L(p,vec3(-.1,0.,-.11),-.25); return q.x>.036?.3:.55+.1*grain(q.zyx,30.); }
  if(id==6.) return .38;
  return .7; }
