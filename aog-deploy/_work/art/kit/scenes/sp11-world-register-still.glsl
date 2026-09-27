/* Room "The Spanish-Speaking World and Register" — pencil still life: a Spanish guitar lying
   face up on the table, a pair of maracas, and a sealed letter in an envelope (choosing
   tú or usted when you write). */
#define CAM_POS vec3(-0.3309,0.2374,-0.6448)
#define CAM_TGT vec3(-0.1311,-0.0548,0.0318)
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
/* guitar lying on the table, face up, neck toward the back right */
vec3 gtQ(vec3 p){ vec3 q=p-vec3(-.04,.034,.06); q.xz=rot(-.35)*q.xz; q.yz=rot(-.5)*q.yz; return q; }   /* body along +x toward head */
float guitarD(vec3 p){ vec3 q=gtQ(p);
  vec2 u=q.xz; float lower=length(u-vec2(-.05,0.))-.07, upper=length(u-vec2(.055,0.))-.055, waist=length(u-vec2(.0,0.))-.05;
  float outline=smin(smin(lower,upper,.03),waist,.02);
  float body=max(outline,abs(q.y-.022)-.02)-.002;
  body=max(body,-max(length(u-vec2(.035,0.))-.018,-(q.y-.038)));      /* sound hole */
  float neck=sdRBox(q-vec3(.18,.036,0.),vec3(.08,.006,.011),.003);
  float head=sdRBox(q-vec3(.285,.036,0.),vec3(.028,.004,.015),.003);
  float bridge=sdRBox(q-vec3(-.06,.043,0.),vec3(.006,.002,.02),.001);
  return min(min(body,neck),min(head,bridge)); }
float stringsD(vec3 p){ vec3 q=gtQ(p); float d=1e5;
  for(int i=0;i<6;i++){ float z=-.0075+float(i)*.003; d=min(d,sdCapsule(q,vec3(-.06,.045,z),vec3(.26,.043,z*.9),.0005)); }
  return d; }
float maraca(vec3 p,vec3 c,float a,float t){ vec3 q=place(p,c,a); q.xy=rot(t)*q.xy;
  float head=sdEll(q-vec3(.04,0.,0.),vec3(.035,.028,.028)); float handle=sdCapsule(q,vec3(-.06,0.,0.),vec3(.01,0.,0.),.007);
  return smin(head,handle,.01); }
float marD(vec3 p){ return min(maraca(p,vec3(.17,.028,-.16),.9,.0),maraca(p,vec3(.23,.028,-.1),.3,.0)); }
vec3 enQ(vec3 p){ vec3 q=p-vec3(-.03,.002,-.17); q.xz=rot(.15)*q.xz; return q; }
float envD(vec3 p){ vec3 q=enQ(p); float d=sdRBox(q,vec3(.075,.0025,.045),.0015);
  float seal=sdCylY(q-vec3(0.,.004,.0),.011,.002)-.001; return min(d,seal); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,guitarD(p),3.);
  r=U(r,stringsD(p),4.);
  r=U(r,marD(p),5.);
  r=U(r,envD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=gtQ(p); vec2 u=q.xz; if(q.x>.1) return .3; if(n.y>.6){ if(abs(length(u-vec2(.035,0.))-.022)<.003) return .3; return .82; } return .45; }
  if(id==4.) return .3;
  if(id==5.) return .5;
  if(id==6.){ vec3 q=enQ(p); if(q.y>.0025){ if(abs(abs(q.x)*.6-(q.z+.045)*1.)<.002&&q.z>-.045) return .5; if(length(q.xz)<.012) return .3; } return .92; }
  return .7; }
