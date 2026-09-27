/* World Religions Unit 3 "Being Kind, Being Fair" — pencil still life: a brass balance scale
   standing level with one apple in each pan (a fair share), and a small tin lunch box with a
   handle beside it. No figures. */
#define CAM_POS vec3(-0.4165,0.5425,-0.9365)
#define CAM_TGT vec3(-0.2555,0.0243,0.1434)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define SC vec3(-.06,0.,.06)
#define LB vec3(.2,0.,-.02)
float scale(vec3 q){
  float base=sdRBox(q-vec3(0,.01,0),vec3(.06,.01,.04),.004);
  float plinth=sdCone(q-vec3(0,.03,0),.022,.014,.01);
  float post=sdCylY(q-vec3(0,.13,0),.007,.1);
  float cap=length(q-vec3(0,.235,0))-.012;
  float beam=sdCapsule(q,vec3(-.14,.225,0),vec3(.14,.225,0),.0045);
  float fin=sdCone(q-vec3(0,.25,0),.006,.001,.018);
  float d=min(min(base,plinth),min(post,min(cap,min(beam,fin))));
  for(int i=0;i<2;i++){ float sx=i==0?-.135:.135; vec3 h=q-vec3(sx,0.,0.);
    /* three chains from the beam end down to the pan */
    for(int k=0;k<3;k++){ float a=float(k)*2.094+.5; vec3 e=vec3(cos(a)*.048,.118,sin(a)*.048);
      d=min(d,sdCapsule(h,vec3(0,.222,0),e,.0014)); }
    vec3 c=h-vec3(0,.16,0); float pan=abs(length(c)-.07)-.0025; pan=max(pan,c.y+.043); pan=max(pan,-c.y-.07);
    d=min(d,pan);
    d=min(d,sdTorus(h-vec3(0,.117,0),.05,.0025)); }
  return d; }
float apple(vec3 q){
  float r=length(q.xz); float a=length(vec3(q.x,(q.y-.032)*1.08,q.z))-.032;
  a+=.008*exp(-r*r/.00015)*smoothstep(.02,.06,q.y); a-=.003*smoothstep(.01,.03,r)*0.;
  float stem=sdCapsule(q,vec3(0,.055,0),vec3(.003,.072,.001),.0018);
  return min(a*.9,stem); }
float lunch(vec3 q){
  float b=sdRBox(q-vec3(0,.045,0),vec3(.075,.045,.05),.008);
  float lid=sdRBox(q-vec3(0,.093,0),vec3(.078,.006,.053),.004);
  vec3 h=q-vec3(0,.1,0); float hd=max(sdTorus(h.xzy*vec3(1.,1.,1.),.03,.004),-h.y);
  float clasp=sdRBox(q-vec3(0,.08,-.053),vec3(.008,.01,.003),.001);
  return min(min(b,lid),min(hd,clasp)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=L(p,SC,.12)/1.3;
  r=U(r,scale(q)*1.3,3.);
  float ap=min(apple((q-vec3(-.135,.093,0))),apple((q-vec3(.135,.093,0))));
  r=U(r,ap*1.3,4.);
  r=U(r,lunch(L(p,LB,-.45)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=L(p,SC,.12)/1.3; if(abs(q.y-.02)<.002) return .3; return .52; }
  if(id==4.) return .45;
  if(id==5.){ vec3 q=L(p,LB,-.45); if(abs(q.y-.086)<.002) return .3; if(q.z<-.045&&abs(q.y-.045)<.022&&abs(q.x)<.05) return .82; return .6; }
  return .7; }
