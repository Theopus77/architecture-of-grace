/* Room s23 "Government" — pencil still life: a three-legged wooden stool (three branches:
   take one leg away and it falls), a judge's gavel resting on its round sound block, and a
   wooden ballot box with a folded card in its slot. */
#define CAM_POS vec3(-0.3168,0.3699,-0.7654)
#define CAM_TGT vec3(-0.1879,-0.0454,0.0999)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
#define SC vec3(.0,0.,.08)
float stoolD(vec3 p){ vec3 q=p-SC;
  float seat=sdCylY(q-vec3(0.,.15,0.),.075,.011)-.004;
  float d=seat;
  for(int i=0;i<3;i++){ float a=float(i)*2.0944+.5; vec3 top=vec3(.045*cos(a),.145,.045*sin(a)), bot=vec3(.085*cos(a),0.,.085*sin(a));
    d=min(d,sdCapsule(q,top,bot,.008)); }
  for(int i=0;i<3;i++){ float a=float(i)*2.0944+.5, b=a+2.0944; vec3 A=vec3(.07*cos(a),.05,.07*sin(a)), B=vec3(.07*cos(b),.05,.07*sin(b));
    d=min(d,sdCapsule(q,A,B,.004)); }
  return d; }
#define GB vec3(-.19,0.,-.08)
float blockD(vec3 p){ vec3 q=p-GB; return sdCylY(q-vec3(0.,.012,0.),.045,.012)-.003; }
vec3 gvQ(vec3 p){ vec3 q=p-GB-vec3(-.01,.042,.0); q.xz=rot(-.5)*q.xz; q.xy=rot(-.12)*q.xy; return q; }
float gavelD(vec3 q){ float head=sdCylZ(q,.017,.035)-.002;
  head=min(head,sdTorus((q-vec3(0.,0.,.033)).xzy,.017,.002)); head=min(head,sdTorus((q+vec3(0.,0.,.033)).xzy,.017,.002));
  float handle=sdCapsule(q,vec3(0.,0.,0.),vec3(.14,-.03,0.),.0055);
  float knob=length(q-vec3(.145,-.031,0.))-.008;
  return min(head,min(handle,knob)); }
vec3 bxQ(vec3 p){ return place(p,vec3(.2,0.,-.06),-.35); }
float ballotD(vec3 q){ float b=sdRBox(q-vec3(0.,.045,0.),vec3(.05,.045,.045),.003);
  float lid=sdRBox(q-vec3(0.,.092,0.),vec3(.054,.004,.049),.002);
  float d=min(b,lid); d=max(d,-sdBox(q-vec3(0.,.095,0.),vec3(.022,.01,.0035)));
  return d; }
float cardD(vec3 q){ vec3 c=q-vec3(0.,.11,0.); c.xy=rot(.05)*c.xy; return sdBox(c,vec3(.02,.022,.0008)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,stoolD(p),3.);
  r=U(r,blockD(p),4.);
  r=U(r,gavelD(gvQ(p)),5.);
  vec3 b=bxQ(p);
  r=U(r,ballotD(b),6.);
  r=U(r,cardD(b),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-SC; if(q.y>.14&&n.y>.8){ float r=length(q.xz); return fract(r/.008+.3*sin(atan(q.z,q.x)*3.))<.2?.55:.72; } return .55+.08*grain(p,60.); }
  if(id==4.) return .4+.08*grain(p,70.);
  if(id==5.){ vec3 q=gvQ(p); if(abs(abs(q.z)-.028)<.003&&length(q.xy)<.02) return .25; return .45+.08*grain(p,80.); }
  if(id==6.){ vec3 q=bxQ(p); if(q.y>.085) return .45; return .65+.06*grain(p,70.); }
  if(id==7.) return .95;
  return .7; }
