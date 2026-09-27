/* Turn-ins (The Inbox) page — pencil still life: a wire in-tray holding a stack of papers with
   hint-lines (one sheet sticking out) and a stapler beside it. */
#define CAM_POS vec3(-0.3514,0.3222,-0.6594)
#define CAM_TGT vec3(-0.1096,-0.0270,0.0391)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define TR vec3(-.02,0.,.08)
#define TRR -.38
#define HX .125
#define HZ .16
#define HY .065
#define FY .032
#define WR .0016
#define ST vec3(.26,0.,-.1)
#define STR -.3
float rod(vec3 p,vec3 a,vec3 b){ return sdCapsule(p,a,b,WR); }
float trayD(vec3 q){
  float d=1e3;
  float ys=HY, yf=FY;
  /* rims: top of back and sides, lower front rim, bottom rectangle */
  d=min(d,rod(q,vec3(-HX,ys,HZ),vec3(HX,ys,HZ)));
  d=min(d,rod(q,vec3(-HX,.004,HZ),vec3(HX,.004,HZ)));
  d=min(d,rod(q,vec3(-HX,.004,-HZ),vec3(HX,.004,-HZ)));
  d=min(d,rod(q,vec3(-HX,yf,-HZ),vec3(HX,yf,-HZ)));
  float sx=abs(q.x);
  vec3 s=vec3(sx,q.y,q.z);
  float sideTop=rod(s,vec3(HX,yf,-HZ),vec3(HX,ys,-HZ+.05)); sideTop=min(sideTop,rod(s,vec3(HX,ys,-HZ+.05),vec3(HX,ys,HZ)));
  d=min(d,sideTop);
  d=min(d,rod(s,vec3(HX,.004,-HZ),vec3(HX,.004,HZ)));
  d=min(d,rod(s,vec3(HX,.004,-HZ),vec3(HX,yf,-HZ)));
  d=min(d,rod(s,vec3(HX,.004,HZ),vec3(HX,ys,HZ)));
  /* upright wires on the sides every 3 cm, height following the side's top line */
  float zs=clamp(floor(q.z/.05+.5)*.05,-HZ+.03,HZ-.01);
  float top=mix(yf,ys,clamp((zs+HZ)/.05,0.,1.));
  d=min(d,max(length(vec2(sx-HX,q.z-zs))-WR,abs(q.y-top*.5)-top*.5));
  /* upright wires on the back and the front */
  float xs=clamp(floor(q.x/.042+.5)*.042,-HX+.01,HX-.01);
  d=min(d,max(length(vec2(q.x-xs,q.z-HZ))-WR,abs(q.y-ys*.5)-ys*.5));
  d=min(d,max(length(vec2(q.x-xs,q.z+HZ))-WR,abs(q.y-yf*.5)-yf*.5));
  /* floor wires */
  d=min(d,max(length(vec2(q.x-xs,q.y-.004))-WR,abs(q.z)-HZ));
  /* four little feet */
  d=min(d,length(vec3(sx-HX+.01,q.y-.002,abs(q.z)-HZ+.01))-.004);
  return d; }
/* the paper stack inside the tray */
float paperD(vec3 q){
  float d=1e3;
  for(int i=0;i<4;i++){ float f=float(i); vec3 s=q-vec3(.003*sin(f*2.),.009+f*.0045,.004*cos(f*1.7)); s.xz=rot(.03*sin(f*3.1))*s.xz;
    d=min(d,sdBox(s,vec3(HX-.012,.0018,HZ-.014))); }
  /* one sheet pulled half out over the front rim */
  vec3 s=q-vec3(.04,.031,-.1); s.xz=rot(-.12)*s.xz; s.yz=rot(-.1)*s.yz;
  d=min(d,sdBox(s,vec3(HX-.02,.0006,.09)));
  return d-.0003; }
float paperT(vec3 q){
  vec3 s=q-vec3(.04,.031,-.1); s.xz=rot(-.12)*s.xz; s.yz=rot(-.1)*s.yz;
  vec2 u; float seed;
  if(abs(s.y)<.002&&abs(s.x)<HX-.019&&abs(s.z)<.091){ u=vec2(s.x,s.z+.02); seed=5.; }
  else { vec3 t=q-vec3(.003*sin(6.),.009+3.*.0045,.004*cos(3.*1.7)); u=vec2(t.x,t.z-.02); seed=9.; }
  if(abs(u.y-.1)<.004&&u.x>-.08&&u.x<.0) return .3;                          /* a heading bar */
  return lines2(u,vec2(.085,.09),.016,seed)>0.?.5:.95; }
/* stapler along x, front (nose) at +x, top arm slightly raised */
float staplerD(vec3 q){
  float base=sdRBox(q-vec3(0.,.005,0.),vec3(.085,.005,.02),.004);
  vec3 a=q-vec3(-.083,.02,0.); a.xy=rot(-.1)*a.xy; a+=vec3(-.083,.017,0.)*0.;
  float arm=sdRBox(a-vec3(.082,.012,0.),vec3(.082,.011,.017),.009);
  arm=max(arm,a.y-.024-.012*smoothstep(.06,.16,a.x)*0.);
  float hinge=sdCylZ(q-vec3(-.08,.016,0.),.01,.019);
  float anvil=sdRBox(q-vec3(.065,.011,0.),vec3(.012,.0015,.012),.001);
  return min(min(base,arm),min(hinge,anvil)); }
float staplerT(vec3 q){ if(q.y<.011) return .5; if(abs(q.z)<.0025&&q.y>.035) return .7; return .28; }
/* paper clip lying flat, long axis along x */
float clipD(vec3 q){ float L=.016;
  float a=abs(length(vec2(max(abs(q.x)-L,0.),q.z))-.0045);
  float b=abs(length(vec2(max(abs(q.x-.004)-L*.7,0.),q.z))-.0028);
  float c=min(a,b); c=max(c,-(q.x-.012)*step(0.,q.z-.001)*0.);
  return length(vec2(c,q.y-.0008))-.0007; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=P(p,TR,TRR);
  r=U(r,trayD(q),3.);
  r=U(r,paperD(q),4.);
  r=U(r,staplerD(P(p,ST,STR)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return .3;
  if(id==4.) return paperT(P(p,TR,TRR));
  if(id==5.) return staplerT(P(p,ST,STR));
  if(id==6.) return .35;
  return .7; }
