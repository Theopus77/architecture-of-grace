/* Hindu Texts Unit 5 "The Ramayana" — pencil still life: a pair of wooden sandals (paduka,
   the sandals a brother set on the throne while he waited) resting on a low wooden seat, and
   a strung bow with a quiver of arrows leaning beside it. Objects only. */
#define CAM_POS vec3(-0.5892,0.7154,-1.2039)
#define CAM_TGT vec3(-0.4323,0.0745,0.1041)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define ST vec3(.08,0.,.06)
/* a low seat on four turned legs */
float seat(vec3 p){ vec3 q=p-ST;
  float top=sdRBox(q-vec3(0.,.07,0.),vec3(.17,.012,.11),.004);
  float apron=sdRBox(q-vec3(0.,.05,0.),vec3(.155,.01,.095),.002);
  vec3 l=vec3(abs(q.x)-.14,q.y,abs(q.z)-.08);
  float leg=sdCylY(l-vec3(0.,.03,0.),.011-.003*sin(l.y*90.),.03);
  return min(min(top,apron),leg); }
/* one sandal: a sole with a raised toe knob on a short post */
float sandal(vec3 q){
  float h=clamp((q.z+.065)/.11,0.,1.); float f2=length(q.xz-vec2(.004*h,-.065+.11*h))-mix(.026,.036,h)+.004*sin(h*3.14);
  float sole=max(f2,abs(q.y-.009)-.009)-.001;
  float post=sdCylY(q-vec3(0.,.026,.055),.005,.012);
  float knob=sdEll(q-vec3(0.,.042,.055),vec3(.011,.008,.011));
  return min(sole,min(post,knob)); }
float sandals(vec3 p){ vec3 q=p-ST-vec3(0.,.082,0.);
  return min(sandal(ry(q-vec3(-.05,0.,0.),.08)),sandal(ry(q-vec3(.05,0.,0.),-.08))); }
vec3 qvQ(vec3 p){ vec3 q=p-vec3(-.19,0.,.1); q.xy=rot(.22)*q.xy; return q; }
float quiver(vec3 p){ vec3 q=qvQ(p);
  float body=sdCylY(q-vec3(0.,.14,0.),.028-.004*(q.y/.28),.14)-.002;
  body=max(body,-sdCylY(q-vec3(0.,.29,0.),.022,.02));
  float band=min(sdTorus(q-vec3(0.,.05,0.),.029,.004),sdTorus(q-vec3(0.,.24,0.),.027,.004));
  float d=min(body,band);
  for(int i=0;i<4;i++){ float a=float(i)*1.57+.4; vec3 a3=q-vec3(cos(a)*.01,.26,sin(a)*.01); a3.xy=rot(-.06*cos(a))*a3.xy;
    d=min(d,arrowD(vec3(-(a3.y-.02),a3.x,a3.z),.07)); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,seat(p),3.);
  r=U(r,sandals(p),4.);
  r=U(r,quiver(p),5.);
  vec3 b=p-vec3(-.25,.2,.16); b.xy=rot(1.3)*b.xy;
  r=U(r,bowD(b,.2),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-ST; return fract(q.x*40.+fbm(q.xz*vec2(3.,50.))*1.4)<.3?.35:.45; }
  if(id==4.) return .6;
  if(id==5.){ vec3 q=qvQ(p); if(q.y>.25) return .7; return .42; }
  if(id==6.) return .4;
  return .7; }
