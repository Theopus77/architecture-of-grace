/* Skateboarding Unit 1 "A Board With Wheels" — pencil still life: a whole skateboard (deck, two trucks,
   four urethane wheels) in three-quarter view, a small wooden surfboard model behind it (sidewalk surfing)
   and a scallop shell. Objects only. */
#define CAM_POS vec3(-0.8337,0.7181,-1.4407)
#define CAM_TGT vec3(-0.4227,0.0366,0.1451)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sktparts_a.glsl"
#define BRY -.55
vec3 boardQ(vec3 p){ return sk_place(p,vec3(0.,0.,0.),BRY); }
/* surfboard model standing on its tail in a little wooden display stand, deck toward the camera */
#define SB vec3(.3,0.,.3)
vec3 surfL(vec3 p){ vec3 q=p-SB; q.xz=rot(-.35)*q.xz; q.yz=rot(.16)*q.yz; return vec3(q.y-.205,q.z,q.x)/.62; }
float surfW(float x){ float t=clamp(x/.3,-1.,1.); return .075*pow(max(1.-t*t,0.),.55)*(1.-.18*t); }
float surfD(vec3 p){ vec3 q=surfL(p); float w=surfW(q.x); float t=clamp(q.x/.3,-1.,1.);
  float th=.011*sqrt(max(1.-t*t,0.))+.002; float d2=(abs(q.z)-w)*.8; d2=max(d2,abs(q.x)-.3);
  float dy=abs(q.y)-th*(1.-.5*(q.z*q.z)/(w*w+1e-4));
  float fin=sdRBox(vec3(q.x+.23-.02*(q.y-.01)*0.,q.y-.02,q.z),vec3(.03*(1.-clamp((q.y-.01)/.03,0.,1.))+.004,.013,.0015),.001);
  return min(sk_ext(d2,dy*.8,.002),fin)*.62; }
float standD(vec3 p){ vec3 q=p-SB; q.xz=rot(-.35)*q.xz;
  float b=sdRBox(q-vec3(0.,.018,0.),vec3(.07,.018,.045),.004);
  float slot=sdBox(q-vec3(0.,.04,0.),vec3(.053,.03,.011));
  return max(b,-slot); }
float surfT(vec3 p){ vec3 q=surfL(p);
  if(abs(q.z)<.0015) return .35;                                       /* stringer */
  float w=surfW(q.x); if(abs(abs(q.z)-w*.84)<.0013&&q.y<0.) return .5; /* rail line */
  if(q.x<-.2&&abs(q.z)<w*.7&&abs(q.z)>.004&&q.y<0.) return fract(q.x/.008)<.3?.6:.86;  /* traction pad lines */
  return .84+.05*vn(q.xz*200.); }
float standT(vec3 p){ vec3 q=p-SB; q.xz=rot(-.35)*q.xz; return .55+.2*(grain(q,60.)-.5); }
/* scallop shell, hinge toward the camera */
vec3 shellQ(vec3 p){ vec3 q=sk_place(p,vec3(-.36,0.,-.05),.7); return q; }
float shellD(vec3 p){ vec3 q=shellQ(p); vec2 u=vec2(q.x,q.z+.03); float R=.068; float a=1.1;
  float side=abs(u.x)*cos(a)-u.y*sin(a); float r=length(u);
  float d2=max(r-R,side); float ang=atan(u.x,u.y);
  float h=.004+.022*sqrt(max(1.-(r/R)*(r/R),0.))*smoothstep(0.,.012,r)+.0016*cos(ang*16.)*smoothstep(.01,.03,r);
  float ears=sdRBox(vec3(q.x,q.y-.004,q.z+.03),vec3(.016,.004,.006),.002);
  return min(sk_ext(d2,max(q.y-h,-q.y)*.7,.0015),ears); }
float shellT(vec3 p){ vec3 q=shellQ(p); vec2 u=vec2(q.x,q.z+.03); float ang=atan(u.x,u.y);
  if(fract(ang*16./6.2832)<.18) return .45; if(abs(length(u)-.034)<.0012) return .55; return .82; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec3 b=boardQ(p);
  r=U(r,sk_deckD(b),3.);
  r=U(r,sk_trucksD(b),4.);
  r=U(r,sk_wheelsD(b),5.);
  r=U(r,surfD(p),6.);
  r=U(r,standD(p),8.);
  r=U(r,shellD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  vec3 b=boardQ(p);
  if(id==3.) return sk_deckT(b);
  if(id==4.) return sk_trucksT(b);
  if(id==5.) return sk_wheelsT(b);
  if(id==6.) return surfT(p);
  if(id==7.) return shellT(p);
  if(id==8.) return standT(p);
  return .7; }
