/* fc15 "Everyday Food and Sometimes Food" — a bowl of fruit (two apples and a pear) and,
   beside it on a small plate, one frosted cupcake in a fluted paper cup with a cherry. */
#define CAM_POS vec3(-0.2665,0.2216,-0.5119)
#define CAM_TGT vec3(-0.0782,0.0207,0.0779)
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
#define BW vec3(-.03,0.,.1)
float bowl(vec3 p){ vec3 q=p-BW;
  vec3 c=q-vec3(0.,.1,0.); float s=length(c*vec3(1.,1.6,1.))-.11; s=abs(s)-.004; s=max(s,q.y-.075);
  float foot=sdCylY(q-vec3(0.,.008,0.),.045,.008)-.002;
  return min(s*.7,foot); }
float fruit(vec3 p){ vec3 q=p-BW; float d=1e5;
  vec3 a=q-vec3(-.035,.085,-.01); a.xy=rot(.3)*a.xy; d=min(d,appleD(a,.037));
  vec3 b=q-vec3(.035,.085,.02); b.xy=rot(-.4)*b.xy; d=min(d,appleD(b,.035));
  vec3 r=q-vec3(.0,.09,-.035); r.xy=rot(-.2)*r.xy;           /* pear */
  float pr=smin(length(r)-.032,length(r-vec3(0.,.04,0.))-.019,.03);
  pr=min(pr,sdCapsule(r,vec3(0.,.055,0.),vec3(.004,.075,0.),.0025));
  return min(d,pr); }
float leaf(vec3 p){ vec3 q=p-BW-vec3(-.035,.085,-.01); q.xy=rot(.3)*q.xy; return appleLeaf(q,.037); }
#define CC vec3(.19,0.,-.02)
float plate(vec3 p){ vec3 q=p-CC; float d=sdCylY(q-vec3(0.,.004,0.),.075,.002)-.002; d=min(d,sdTorus(q-vec3(0.,.007,0.),.072,.003)); return d; }
float cupcake(vec3 p){ vec3 q=p-CC-vec3(0.,.008,0.); float a=atan(q.z,q.x);
  float r=.03+q.y*.25+.0015*smoothstep(-.4,.4,cos(a*24.));
  float cup=max(length(q.xz)-r,abs(q.y-.022)-.022);
  vec3 f=q-vec3(0.,.044,0.); float fr=1e5;
  for(int i=0;i<3;i++){ float fi=float(i); fr=smin(fr,sdTorus(f-vec3(0.,fi*.013,0.),.03-fi*.009,.011-fi*.0015),.006); }
  fr=smin(fr,length(f-vec3(0.,.04,0.))-.008,.006);
  return min(cup,fr); }
float cherry(vec3 p){ vec3 q=p-CC-vec3(0.,.1,0.); return min(length(q)-.009,sdCapsule(q,vec3(0.,.006,0.),vec3(.008,.025,.0),.0012)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bowl(p),3.);
  r=U(r,fruit(p),4.);
  r=U(r,leaf(p),5.);
  r=U(r,plate(p),6.);
  r=U(r,cupcake(p),7.);
  r=U(r,cherry(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .8;
  if(id==4.) return .6;
  if(id==5.) return .45;
  if(id==6.) return .9;
  if(id==7.){ vec3 q=p-CC-vec3(0.,.008,0.); if(q.y<.045){ float a=atan(q.z,q.x); return fract(a*24./6.2832)<.3?.45:.7; } return .92; }
  if(id==8.) return .3;
  return .7; }
