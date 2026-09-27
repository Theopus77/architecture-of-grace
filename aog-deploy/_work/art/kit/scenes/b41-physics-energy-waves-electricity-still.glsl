/* Room "Physics: Energy, Waves, Electricity" — pencil still life: a round light bulb standing
   in a socket on a little wooden block, a battery lying on the table, and a wire that runs
   from the battery to the socket in a loose curve. */
#define CAM_POS vec3(-0.4389,0.3070,-0.7573)
#define CAM_TGT vec3(-0.1776,-0.0008,0.0636)
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
#define SK vec3(-.04,0.,.06)
float blockD(vec3 p){ vec3 q=place(p,SK,.2); return sdRBox(q-vec3(0.,.016,0.),vec3(.07,.016,.05),.004); }
float socketD(vec3 p){ vec3 q=p-SK; float d=sdCylY(q-vec3(0.,.04,0.),.022,.01)-.002;
  d=min(d,sdCylY(q-vec3(0.,.058,0.),.017,.01));
  for(int i=0;i<2;i++){ vec3 s=q-vec3(-.045+.09*float(i),.034,-.02); d=min(d,sdCylY(s,.006,.003)-.001); d=min(d,sdCylY(s-vec3(0.,.005,0.),.0025,.004)); }
  return d; }
float bulbD(vec3 p){ vec3 q=p-SK-vec3(0.,.068,0.);
  float screw=sdCylY(q-vec3(0.,.012,0.),.0145+.0012*sin(q.y*700.),.013);
  float neck=sdCone(q-vec3(0.,.04,0.),.015,.03,.016);
  float glob=length(q-vec3(0.,.09,0.))-.048;
  return min(screw,smin(neck,glob,.02)); }
#define BAT vec3(.14,.031,-.1)
vec3 batQ(vec3 p){ vec3 q=p-BAT; q.xz=rot(-.3)*q.xz; return q; }
float batD(vec3 p){ vec3 q=batQ(p);
  float body=sdCylX(q,.03,.058)-.001;
  float nub=sdCylX(q-vec3(.061,0.,0.),.009,.004)-.001;
  return min(body,nub); }
vec3 bez(vec3 a,vec3 c,vec3 b,float t){ return mix(mix(a,c,t),mix(c,b,t),t); }
float wire(vec3 p,vec3 a,vec3 c,vec3 b){ float d=1e5; vec3 pr=a;
  for(int i=1;i<=16;i++){ vec3 x=bez(a,c,b,float(i)/16.); d=min(d,sdCapsule(p,pr,x,.003)); pr=x; } return d; }
float wireD(vec3 p){
  vec3 tl=SK+vec3(-.045,.041,-.02), tr=SK+vec3(.045,.041,-.02);
  vec3 bn=BAT+vec3(-.066,0.,.02), bp=BAT+vec3(.066,0.,-.021);
  float d=wire(p,tr,vec3(.06,.01,-.06),bn);
  d=min(d,wire(p,tl,vec3(-.02,-.03,-.3),bp+vec3(.0,.0,0.)));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,blockD(p),3.);
  r=U(r,socketD(p),4.);
  r=U(r,bulbD(p),5.);
  r=U(r,batD(p),6.);
  r=U(r,wireD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .55+.15*grain(place(p,SK,.2),50.);
  if(id==4.) return .3;
  if(id==5.){ vec3 q=p-SK-vec3(0.,.068,0.); if(q.y<.026) return .45;
    vec3 f=q-vec3(0.,.085,0.); /* the filament seen through the glass: a small zig-zag between two posts */
    if(f.z<0.){ float z=abs(fract(f.x/.008)-.5)*.008; if(abs(f.y-z)<.0028&&abs(f.x)<.02) return .1;
      if(abs(abs(f.x)-.02)<.002&&f.y<.0&&f.y>-.05) return .3; }
    return .92; }
  if(id==6.){ vec3 q=batQ(p); if(q.x>.03) return .8; if(q.x<-.03) return .35; return .55; }
  if(id==7.) return .25;
  return .7; }
