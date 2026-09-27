/* Medicine and Health Unit 3 "Healthy Ways Around the World" — pencil still life: a round
   teapot, a stone mortar with its pestle, and a small bundle of herbs tied with string. */
#define CAM_POS vec3(-0.3320,0.3356,-0.7813)
#define CAM_TGT vec3(-0.1947,-0.0112,0.0416)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define TP vec3(-.03,0.,.06)
#define MO vec3(.14,0.,-.02)
#define HB vec3(-.05,0.,-.11)
float potD(vec3 p){ vec3 q=place(p,TP,.35);
  float body=sdEll(q-vec3(0.,.065,0.),vec3(.085,.068,.085));
  body=max(body,-q.y+.004);
  body=smin(body,sdCylY(q-vec3(0.,.008,0.),.055,.008)-.002,.01);
  float lid=sdEll(q-vec3(0.,.128,0.),vec3(.045,.018,.045)); lid=max(lid,.126-q.y);
  lid=min(lid,sdTorus(q-vec3(0.,.127,0.),.046,.003));
  lid=min(lid,length(q-vec3(0.,.153,0.))-.011);
  lid=min(lid,sdCylY(q-vec3(0.,.145,0.),.005,.004));
  /* spout: a tapered tube curving up to the right */
  vec3 s=q-vec3(.075,.055,0.); s.xy=rot(-.85)*s.xy;
  float sp=sdCone(s-vec3(0.,.045,0.),.022,.009,.045); sp=max(sp,-(s.y+.0));
  /* handle on the left */
  vec3 h=q-vec3(-.078,.072,0.);
  float hd=length(vec2(length(h.xy*vec2(1.,.85))-.032,h.z))-.007; hd=max(hd,h.x-.01);
  return min(min(body,lid),min(sp,hd)); }
float mortarD(vec3 p){ vec3 q=p-MO;
  float outer=sdEll(q-vec3(0.,.055,0.),vec3(.07,.06,.07));
  outer=max(outer,q.y-.085); outer=max(outer,.012-q.y);
  outer=smin(outer,sdCylY(q-vec3(0.,.008,0.),.048,.008)-.002,.012);
  float inner=sdEll(q-vec3(0.,.075,0.),vec3(.058,.052,.058));
  float d=max(outer,-inner);
  d=min(d,sdTorus(q-vec3(0.,.085,0.),.063,.004));
  return d; }
float pestleD(vec3 p){ vec3 q=p-MO; vec3 a=vec3(-.01,.045,.01), b=vec3(.075,.17,.07);
  vec3 pa=q-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
  float r=mix(.02,.011,smoothstep(0.,.4,h))+.003*smoothstep(.8,1.,h);
  return (length(pa-ba*h)-r)*.9; }
float herbs(vec3 p){ vec3 q=place(p,HB,-.35); float d=1e3;
  for(int i=0;i<6;i++){ float f=float(i)-2.5;
    vec3 a=vec3(-.1,.006,f*.002), b=vec3(.09,.008+abs(f)*.003,f*.02);
    d=min(d,sdCapsule(q,a,b,.003));
    for(int j=0;j<4;j++){ float t=.4+.17*float(j); vec3 c=mix(a,b,t);
      float sd=(float((i+j)&1)*2.-1.);
      vec3 l=q-c-vec3(.008,.006,.012*sd); l.xz=rot(.5*sd+.2*f)*l.xz;
      d=min(d,sdEll(l,vec3(.024,.005,.011))); } }
  return d; }
float twine(vec3 p){ vec3 q=place(p,HB,-.35); return sdTorus((q-vec3(-.045,.008,0.)).yxz,.013,.003); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,potD(p),3.);
  r=U(r,mortarD(p),4.);
  r=U(r,pestleD(p),5.);
  r=U(r,herbs(p),6.);
  r=U(r,twine(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=place(p,TP,.35); if(abs(q.y-.1)<.003||abs(q.y-.03)<.003) return .4; return .8; }
  if(id==4.) return .55+.15*fbm(p.xz*120.+p.y*60.);
  if(id==5.) return .6;
  if(id==6.) return .45;
  if(id==7.) return .7;
  return .7; }
