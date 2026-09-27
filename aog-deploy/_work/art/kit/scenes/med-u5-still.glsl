/* Medicine and Health Unit 5 "Germs, Vaccines and First Aid" — pencil still life: a metal
   first-aid tin with a plus sign on its lid and a carry handle, a rolled bandage, and two
   sticking plasters lying on the table. */
#define CAM_POS vec3(-0.2515,0.2563,-0.5832)
#define CAM_TGT vec3(-0.1481,-0.0048,0.0365)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define TN vec3(-.02,0.,.06)
#define RL vec3(.15,0.,-.04)
vec3 tinQ(vec3 p){ return place(p,TN,.3); }
float tinD(vec3 p){ vec3 q=tinQ(p);
  float d=sdRBox(q-vec3(0.,.055,0.),vec3(.12,.055,.07),.012);
  d=max(d,-(abs(q.y-.078)-.0012));                         /* lid seam */
  d=min(d,sdRBox(q-vec3(0.,.078,-.071),vec3(.012,.008,.003),.002));   /* catch */
  return d; }
float handleD(vec3 p){ vec3 q=tinQ(p);
  vec3 h=q-vec3(0.,.11,0.);
  float d=length(vec2(length(vec2(h.x*.55,max(h.y,0.)))-.03,h.z))-.005;
  d=max(d,-h.y);
  d=min(d,sdRBox(q-vec3(-.055,.112,0.),vec3(.01,.003,.01),.002));
  d=min(d,sdRBox(q-vec3(.055,.112,0.),vec3(.01,.003,.01),.002));
  return d; }
float plaster(vec3 p,vec3 c,float a){ vec3 q=place(p,c,a); return sdRBox(q-vec3(0.,.002,0.),vec3(.04,.0015,.011),.0015); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,tinD(p),3.);
  r=U(r,handleD(p),4.);
  r=U(r,rollD(p-RL,.042,.05),5.);
  r=U(r,rollTail(place(p,RL,2.1),.042,.08),5.);
  r=U(r,min(plaster(p,vec3(.02,0.,-.1),-.3),plaster(p-vec3(0.,.003,0.),vec3(.04,0.,-.095),.25)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=tinQ(p);
    vec2 f=q.z<-.066?q.xy-vec2(0.,.045):(q.y>.105?q.xz:vec2(9.));
    if(q.z<-.066&&q.y>.074&&q.y<.082) return .35;
    float c=min(max(abs(f.x)-.008,abs(f.y)-.025),max(abs(f.x)-.025,abs(f.y)-.008));
    if(q.z<-.066&&c<0.) return .12;
    vec2 t=q.xz-vec2(0.,-.035); float c2=min(max(abs(t.x)-.007,abs(t.y)-.018),max(abs(t.x)-.018,abs(t.y)-.007));
    if(q.y>.104&&c2<0.) return .12;
    return .82; }
  if(id==4.) return .5;
  if(id==5.){ vec3 q=p-RL; float r=length(q.xz); if(q.y>.049&&r<.042){ return fract(r/.0045)<.3?.6:.95; } return .93; }
  if(id==6.){ vec3 q=place(p,vec3(.02,0.,-.1),-.3); vec3 q2=place(p,vec3(.04,0.,-.095),.25);
    vec3 u=q.y>.004?q2:q; if(abs(u.x)<.013) return .35; return .8; }
  return .7; }
