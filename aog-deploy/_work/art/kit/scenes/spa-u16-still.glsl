/* Spanish Unit 16 "The Imperfect and Telling a Story" — pencil still life: an old storybook lying
   open with a ribbon marker, an oil lantern with a glass chimney behind it, and a small wooden
   toy horse on wheels. */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.06,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
vec3 bookQ(vec3 p){ vec3 q=p-vec3(-.02,.03,-.02); q.xz=rot(-.12)*q.xz; q.yz=rot(-.28)*q.yz; return q; }
vec2 bookD(vec3 p){ vec3 q=bookQ(p); float x=abs(q.x);
  float lift=.028*sin(clamp(x/.13,0.,1.)*1.9)-.016*exp(-x*55.)+.008;
  float pages=sdBox(vec3(x-.066,q.y-lift*.5,q.z),vec3(.064,max(lift*.5,.003),.088))-.0015;
  float cover=sdRBox(vec3(x-.07,q.y+.001,q.z),vec3(.073,.0035,.095),.0015);
  float prop=sdRBox(p-vec3(-.02,.014,.06),vec3(.13,.014,.03),.003);
  float ribbon=sdRBox(q-vec3(.004,.004,-.1),vec3(.004,.0008,.02),.0005);
  return vec2(pages,min(min(cover,prop),ribbon)); }
#define LN vec3(.2,0.,.1)
float lantern(vec3 p){ vec3 q=p-LN;
  float font=(length((q-vec3(0.,.035,0.))/vec3(.05,.035,.05))-1.)*.035; font=max(font,-q.y);
  float base=sdCylY(q-vec3(0.,.004,0.),.045,.004)-.002;
  float collar=sdCylY(q-vec3(0.,.072,0.),.028,.008)-.002;
  float y=q.y-.08; float cr=.022+.018*sin(clamp(y/.1,0.,1.)*3.1)*smoothstep(.0,.02,y)-.006*step(.08,y);
  float chim=max(abs(length(q.xz)-cr)-.0018,abs(q.y-.14)-.06);
  vec3 h=q-vec3(0.,.12,0.); float bail=max(sdTorus(h.xzy,.065,.0025),-h.y+.0); bail=max(bail,-h.y);
  float knob=sdCylX(q-vec3(.04,.075,0.),.006,.008);
  return min(min(min(font,base),min(collar,chim)),min(bail,knob)); }
float horse(vec3 p){ vec3 q=p-vec3(-.25,0.,.06); q.xz=rot(.3)*q.xz;
  float plat=sdRBox(q-vec3(0.,.018,0.),vec3(.05,.004,.02),.002);
  float wheels=1e5; for(int i=0;i<4;i++){ vec3 w=q-vec3(i<2?-.035:.035,.012,i%2==0?-.024:.024); wheels=min(wheels,sdCylZ(w,.012,.003)-.001); }
  float body=sdRBox(q-vec3(0.,.065,0.),vec3(.035,.014,.012),.01);
  float legs=1e5; for(int i=0;i<4;i++){ legs=min(legs,sdCapsule(q,vec3(i<2?-.025:.025,.06,i%2==0?-.007:.007),vec3(i<2?-.028:.028,.022,i%2==0?-.008:.008),.0045)); }
  float neck=sdCapsule(q,vec3(-.03,.07,0.),vec3(-.045,.1,0.),.009);
  float head=sdCapsule(q,vec3(-.048,.105,0.),vec3(-.07,.095,0.),.0085);
  float ears=sdCone(q-vec3(-.045,.118,0.),.004,.001,.006);
  float tail=sdCapsule(q,vec3(.04,.07,0.),vec3(.055,.045,0.),.0035);
  float d=smin(body,min(neck,head),.008); return min(min(min(plat,wheels),min(d,legs)),min(ears,tail)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=bookD(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  r=U(r,lantern(p),5.);
  r=U(r,horse(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bookQ(p); float x=abs(q.x); if(x<.005) return .7; vec2 u=vec2(x-.066,q.z);
    if(q.x>0.&&u.y>.0&&u.y<.07&&abs(u.x)<.045){ float h=length(u-vec2(0.,.04))-.022; if(abs(h)<.002) return .3;   /* a round picture on the right page */
      if(abs(u.y-.02+abs(u.x)*.6)<.002&&abs(u.x)<.04) return .35; return .9; }
    if(u.y<.06&&u.y>-.075&&abs(u.x)<.048&&fract((u.y+.1)/.012)<.22) return .6; return .95; }
  if(id==4.) return .35;
  if(id==5.){ vec3 q=p-LN; if(q.y>.08&&q.y<.2&&length(q.xz)<.045) return .96; return .35; }
  if(id==6.){ vec3 q=p-vec3(-.25,0.,.06); q.xz=rot(.3)*q.xz; if(q.y<.024) return .35; return .72; }
  return .7; }
