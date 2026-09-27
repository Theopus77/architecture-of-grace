/* Room "Scarcity, Choice and Opportunity Cost" — pencil still life: an hourglass (time is
   limited), one apple, and a short stack of coins with one coin lying apart: you can spend
   them on one thing, not both. */
#define CAM_POS vec3(-0.4425,0.3382,-0.7567)
#define CAM_TGT vec3(-0.1803,0.0196,0.0677)
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
#define HG vec3(-.04,0.,.07)
#define APL vec3(.12,.05,.02)
#define CN vec3(.06,0.,-.1)
float frameD(vec3 p){ vec3 q=place(p,HG,.3);
  float b=sdCylY(q-vec3(0.,.008,0.),.058,.007)-.002;
  float t=sdCylY(q-vec3(0.,.212,0.),.058,.007)-.002;
  float posts=1e5; for(int i=0;i<3;i++){ float a=float(i)*2.0944+.5; vec3 c=vec3(cos(a),0.,sin(a))*.047;
    vec3 k=q-c; posts=min(posts,sdCylY(k-vec3(0.,.11,0.),.0045+.0015*sin(k.y*120.),.1)); }
  return min(min(b,t),posts); }
float glassD(vec3 p){ vec3 q=place(p,HG,.3); float y=q.y-.11;
  float r=.004+.036*pow(abs(y)/.095,.75)*smoothstep(.1,.07,abs(y))+.0*y;
  float prof=abs(y)<.095?.004+.036*sin(clamp(abs(y)/.095,0.,1.)*2.2)/sin(2.2*.9):0.;
  float d=(length(q.xz)-prof)*.7; d=max(d,abs(y)-.097);
  return d; }
float coinsD(vec3 p){ float d=1e5;
  for(int i=0;i<4;i++){ vec3 c=CN+vec3(.002*sin(float(i)*3.),.0035+float(i)*.0072,.002*cos(float(i)*2.)); d=min(d,coinD(p-c,.032)); }
  vec3 q=p-(CN+vec3(.085,.0035,-.03)); d=min(d,coinD(q,.032));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,frameD(p),3.);
  r=U(r,glassD(p),4.);
  vec3 a=p-APL; a.xz=rot(.5)*a.xz;
  r=U(r,appleD(a,.05),5.);
  r=U(r,appleLeaf(a,.05),6.);
  r=U(r,coinsD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .35+.12*grain(place(p,HG,.3),60.);
  if(id==4.){ vec3 q=place(p,HG,.3); float y=q.y-.11;
    if(y<-.045) return .45;                          /* sand heaped in the bottom bulb */
    if(y>.04&&y<.07) return .5;                      /* what is left in the top */
    if(abs(q.x)<.0015&&y<0.&&y>-.05) return .4;      /* the thin falling stream */
    return .93; }
  if(id==5.){ vec3 q=p-APL; float s=.5+.08*sin(atan(q.z,q.x)*9.+q.y*40.); if(q.y>.04) return .3; return s; }
  if(id==6.) return .4;
  if(id==7.){ if(abs(n.y)<.5) return fract(atan(p.z-CN.z,p.x-CN.x)*40.)<.4?.45:.7; return length((p-CN).xz)>.026&&length((p-CN).xz)<.028?.45:.75; }
  return .7; }
