/* FCS Unit 3 "Everyday Food and Sometimes Food" — pencil still life: a plate with an apple, two
   carrots and a slice of bread, and a frosted cupcake with a cherry set a little apart. */
#define CAM_POS vec3(-0.3610,0.2990,-0.6558)
#define CAM_TGT vec3(-0.1564,-0.0120,0.1055)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define PL vec3(-.04,0.,.04)
float plate(vec3 p){ vec3 q=p-PL; float r=length(q.xz);
  float y=.006+.012*smoothstep(.09,.15,r); float d=max(abs(q.y-y)-.003,r-.16)*.9;
  float foot=max(abs(r-.08)-.004,abs(q.y-.003)-.003); return min(d,foot)-.001; }
float carrot(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float t=clamp(q.x/.14,0.,1.); float R=.016*(1.-t*.85);
  float d=(length(vec2(q.y,q.z))-R)*.9; d=max(d,max(-q.x,q.x-.14)); d=smin(d,length(q)-.016,.008);
  d+=.0008*sin(q.x*260.);
  return d; }
float tops(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; float d=1e5;
  for(int i=0;i<3;i++){ float a=-.4+float(i)*.4; vec3 r=q; r.xy=rot(a)*r.xy; r.xz=rot(a*.6)*r.xz; d=min(d,sdCapsule(r,vec3(0.),vec3(-.06,0.,0.),.0022)); } return d; }
float bread(vec3 p){ vec3 q=p-PL-vec3(.04,.028,.07); q.xz=rot(-.2)*q.xz; q.yz=rot(-1.1)*q.yz;
  vec2 u=q.xy; float s=max(abs(u.x)-.045,u.y-.02); s=min(s,length(u-vec2(-.025,.02))-.022); s=min(s,length(u-vec2(.025,.02))-.022);
  s=max(s,-u.y-.05); return max(s,abs(q.z)-.006)-.002; }
#define CK vec3(.22,0.,-.01)
float cupcake(vec3 p){ vec3 q=(p-CK)/1.3; float r=length(q.xz);
  float cup=sdCone(q-vec3(0.,.025,0.),.034,.045,.025); cup+=.0012*sin(atan(q.z,q.x)*24.)*step(q.y,.05);
  float fr=1e5; for(int i=0;i<3;i++){ float fi=float(i); fr=smin(fr,sdTorus(q-vec3(0.,.056+fi*.017,0.),.034-fi*.011,.013-fi*.002),.01); }
  float cherry=length(q-vec3(0.,.108,0.))-.012; float st=sdCapsule(q,vec3(0.,.118,0.),vec3(.008,.14,0.),.0015);
  return min(min(cup,fr),min(cherry,st))*1.3; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,plate(p),3.);
  vec2 a=appleD(p,PL+vec3(-.05,.01,.03),.052,.5); r=U(r,a.x,a.y>.5?5.:4.);
  r=U(r,carrot(p,PL+vec3(-.02,.026,-.06),-.2),6.);
  r=U(r,carrot(p,PL+vec3(-.01,.026,-.035),.05),6.);
  r=U(r,tops(p,PL+vec3(-.02,.026,-.06),-.2),5.);
  r=U(r,bread(p),7.);
  r=U(r,cupcake(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ float rr=length((p-PL).xz); return abs(rr-.12)<.003?.6:.92; }
  if(id==4.) return .45;
  if(id==5.) return .3;
  if(id==6.) return .5;
  if(id==7.){ vec3 q=p-PL-vec3(.04,.028,.07); return .8; }
  if(id==8.){ vec3 q=(p-CK)/1.3; if(length(q-vec3(0.,.108,0.))<.014) return .2; if(q.y<.05) return .55; return .9; }
  return .7; }
