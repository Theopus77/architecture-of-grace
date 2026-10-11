/* Skateboarding Unit 8 "The Physics of the Ollie" — pencil still life: a wooden ruler resting on a
   triangular fulcrum block as a lever (a brass weight presses the low end, the far end lifts, like a
   kicktail), a protractor standing behind it and a stopwatch for hang time. Objects only. */
#define CAM_POS vec3(-0.3572,0.2438,-0.5926)
#define CAM_TGT vec3(-0.1284,0.0019,0.0286)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
#include "sktparts_a.glsl"
#define LEV vec3(0.,0.,0.)
#define LRY -.25
#define FH .055
#define FD .2
#define LTH asin(FH/FD)
/* lever frame: fulcrum apex under the ruler; the low end touches the table at x=-FD */
vec3 levQ(vec3 p){ return sk_place(p,LEV,LRY); }
float fulcD(vec3 p){ vec3 q=levQ(p);
  vec2 a=vec2(abs(q.x),q.y); float tri=dot(a,normalize(vec2(FH,.045)))-FH*.045/length(vec2(FH,.045));
  tri=max(tri,-q.y); tri=max(tri,abs(q.z)-.05);
  return tri-.002; }
vec3 rulQ(vec3 p){ vec3 q=levQ(p)-vec3(-FD*cos(LTH),0.,0.); q.xy=rot(LTH)*q.xy; return q; }   /* x from the low end along the ruler */
float rulD(vec3 p){ vec3 q=rulQ(p); float d=sdRBox(q-vec3(.18,.0035,0.),vec3(.18,.0035,.03),.0012);
  d=carve(d,vec2(q.x-.06,q.z+.003),49,.022,.0016,q.y-.007,.0012);
  d=carve(d,vec2(q.x-.16,q.z+.003),50,.022,.0016,q.y-.007,.0012);
  d=carve(d,vec2(q.x-.26,q.z+.003),51,.022,.0016,q.y-.007,.0012);
  return d; }
float rulT(vec3 p){ vec3 q=rulQ(p);
  if(q.y>.0055){ float f=fract(q.x/.01); float big=fract(q.x/.05);
    if(q.z<-.012&&(f<.1||(big<.03&&q.z<-.005))) return .2;
    if(q.z<-.022&&f<.1) return .2;
    float g=min(min(glyph(vec2(q.x-.06,q.z+.003)/.022,49),glyph(vec2(q.x-.16,q.z+.003)/.022,50)),glyph(vec2(q.x-.26,q.z+.003)/.022,51))*.022;
    if(g<.0022) return .2;
    return .8+.1*(grain(q,90.)-.5); }
  return .6; }
/* a brass weight standing on the low end */
float wD(vec3 p){ vec3 q=rulQ(p)-vec3(.04,.007,0.); q.xy=rot(-LTH)*q.xy;
  float b=sdCylY(q-vec3(0.,.02,0.),.018,.02)-.002; float n=sdCylY(q-vec3(0.,.045,0.),.006,.006)-.001; float k=length(q-vec3(0.,.055,0.))-.009;
  return min(b,min(n,k)); }
float wT(vec3 p){ vec3 q=rulQ(p)-vec3(.04,.007,0.); q.xy=rot(-LTH)*q.xy; if(q.y>.037&&q.y<.04) return .3; return .52+.25*step(.6,fract(q.x*40.+.5))*0.; }
/* protractor standing upright behind, its flat edge on the table */
vec3 proQ(vec3 p){ vec3 q=sk_place(p,vec3(.05,0.,.12),-.1); q.yz=rot(-.12)*q.yz; return q/1.45; }
float proD(vec3 p){ vec3 q=proQ(p); vec2 u=q.xy; float r=length(u);
  float d2=max(r-.1,-u.y);
  return sk_ext(d2,abs(q.z)-.0015,.001)*1.45; }
float proT(vec3 p){ vec3 q=proQ(p); vec2 u=q.xy; float r=length(u); float a=atan(u.y,u.x);
  float t=fract(a/(3.14159/18.));
  if(r>.088&&t<.08) return .2;
  if(r>.094&&fract(a/(3.14159/90.))<.15) return .3;
  if(abs(r-.086)<.0008) return .35;
  if(abs(r-.06)<.0008&&u.y>.005) return .45;
  if(length(u-vec2(0.,.006))<.004) return .2;
  if(u.y<.007&&abs(u.x)<.085) return fract(u.x/.01)<.1?.25:.9;
  return .92; }
vec3 swQ(vec3 p){ return sk_place(p,vec3(.16,0.,-.15),.6)/1.4; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,fulcD(p),3.);
  r=U(r,rulD(p),4.);
  r=U(r,wD(p),5.);
  r=U(r,proD(p),6.);
  r=U(r,o_stopwatch(swQ(p),0.)*1.4,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.){ vec3 q=levQ(p); return .62+.14*(grain(q.zyx,60.)-.5); }
  if(id==4.) return rulT(p);
  if(id==5.) return wT(p);
  if(id==6.) return proT(p);
  if(id==7.) return t_stopwatch(swQ(p),0.);
  return .7; }
