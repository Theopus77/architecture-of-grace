/* Room s12 "Symbols and Stories of Our Country" — pencil still life: a small model of a
   cracked bronze bell hanging from its wooden yoke on a stand (a symbol you can see), an open
   storybook (the stories you can tell), and a toy drum with crossed cords lying beside it. */
#define CAM_POS vec3(-0.3287,0.4334,-0.8519)
#define CAM_TGT vec3(-0.1857,-0.0274,0.1083)
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
#define BC vec3(0.,0.,.08)
vec3 bQ(vec3 p){ return place(p,BC,-.3); }
float bellR(float y){ float t=clamp((.17-y)/.11,0.,1.); return .022+.03*t*t+.012*smoothstep(.85,1.,t); }
float bellD(vec3 q){ float r=length(q.xz);
  float outer=max(r-bellR(q.y),max(q.y-.172,.058-q.y));
  float d=max(abs(outer+.002)-.003,-(.058-q.y)-.0)*1.;
  d=max(outer*.8,-max(r-bellR(q.y)+.005,-(q.y-.062)));
  d=min(d,sdTorus(q-vec3(0.,.06,0.),bellR(.06)-.002,.0035));
  d=min(d,sdEll(q-vec3(0.,.172,0.),vec3(.022,.01,.022)));
  /* the crack */
  vec2 c=vec2(q.x,q.y); float crack=max(abs(q.x+.008*sin(q.y*120.)-.006)-.0012,abs(q.y-.1)-.035);
  crack=max(crack,-(q.z+.01));
  return max(d,-max(crack,-(-q.z-bellR(q.y)+.006))); }
float yokeD(vec3 q){ float y=sdRBox(q-vec3(0.,.195,0.),vec3(.065,.014,.016),.004);
  float posts=min(sdRBox(q-vec3(-.075,.11,0.),vec3(.007,.11,.012),.002),sdRBox(q-vec3(.075,.11,0.),vec3(.007,.11,.012),.002));
  float base=sdRBox(q-vec3(0.,.006,0.),vec3(.095,.006,.04),.003);
  float axle=sdCylX(q-vec3(0.,.195,0.),.004,.075);
  return min(min(y,posts),min(base,axle)); }
vec3 bkQ(vec3 p){ vec3 q=p-vec3(.2,.015,-.05); q.xz=rot(-.25)*q.xz; q.yz=rot(-.22)*q.yz; return q; }
vec2 storyD(vec3 p){ vec3 q=bkQ(p); float x=abs(q.x);
  float lift=.022*sin(clamp(x/.1,0.,1.)*1.9)-.012*exp(-x*55.)+.006;
  float pages=sdBox(vec3(x-.05,q.y-lift*.5,q.z),vec3(.048,max(lift*.5,.003),.065))-.0012;
  float cover=sdRBox(vec3(x-.053,q.y+.001,q.z),vec3(.055,.003,.07),.0012);
  float prop=sdRBox(p-vec3(.2,.012,.015),vec3(.1,.012,.022),.003);
  return vec2(pages,min(cover,prop)); }
#define DR vec3(-.17,0.,-.04)
float toyDrumD(vec3 p){ vec3 q=p-DR; float d=sdCylY(q-vec3(0.,.03,0.),.042,.028)-.002;
  float rims=min(sdTorus(q-vec3(0.,.058,0.),.043,.0035),sdTorus(q-vec3(0.,.004,0.),.043,.0035));
  float s1=sdCapsule(p,vec3(-.13,.004,-.11),vec3(-.05,.004,-.08),.0035); s1=min(s1,length(p-vec3(-.13,.005,-.11))-.006);
  float s2=sdCapsule(p,vec3(-.14,.004,-.1),vec3(-.07,.012,-.13),.0035); s2=min(s2,length(p-vec3(-.14,.005,-.1))-.006);
  return min(min(d,rims),min(s1,s2)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=bQ(p);
  r=U(r,bellD(q),3.);
  r=U(r,yokeD(q),4.);
  vec2 b=storyD(p); r=U(r,b.x,5.); r=U(r,b.y,6.);
  r=U(r,toyDrumD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bQ(p); if(abs(q.x+.008*sin(q.y*120.)-.006)<.0018&&abs(q.y-.1)<.035&&q.z<0.) return .1; if(abs(q.y-.075)<.002||abs(q.y-.145)<.002) return .35; return .55; }
  if(id==4.) return .45+.1*grain(p,60.);
  if(id==5.){ vec3 q=bkQ(p); float x=abs(q.x); if(x<.006) return .7;
    vec2 u=vec2(x-.052,q.z); if(q.x>0.){ float h=sdBox2(u-vec2(0.,.012),vec2(.03,.022)); if(abs(h)<.0015) return .3; if(abs(u.y-.012)<.018&&abs(u.x)<.026&&length(u-vec2(.012,.025))<.007) return .4; }
    float l=fract((u.y+.1)/.011); if(u.y<-.02&&u.y>-.055&&abs(u.x)<.038&&l<.2) return .62;
    if(q.x<0.&&abs(u.y)<.055&&abs(u.x)<.038&&l<.2) return .62;
    return .95; }
  if(id==6.) return .4;
  if(id==7.){ vec3 q=p-DR; if(q.y>.061) return .88; if(length(q.xz)>.05) return .55; if(q.y<.008||q.y>.054) return .35;
    float a=atan(q.z,q.x); float t=(q.y-.008)/.046; float zz=abs(fract(a/.5236+.5*t*2.)-.5); float zz2=abs(fract(a/.5236-.5*t*2.)-.5); if(min(zz,zz2)<.05) return .25; return .7; }
  return .7; }
