/* Crosswalk: Divine Blueprint master — a thick old book lying open, its pages curving up from the spine, with a wooden ruler laid across the pages. */
#define CAM_POS vec3(-0.3997,0.2580,-0.5627)
#define CAM_TGT vec3(-0.1838,-0.0379,0.0610)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.4)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "xwparts.glsl"

#define BK vec3(.0,0.,.06)
vec3 bq(vec3 p){ return P(p,BK,-.08); }
float cover(vec3 q){ return sdRBox(q-vec3(0.,.004,0.),vec3(.22,.004,.14),.003); }
float pgs(vec3 q){ float s=sign(q.x); float x=abs(q.x);
  float top=.026+.018*sin(clamp(x/.2,0.,1.)*1.6)-.03*exp(-x*60.);
  float d=max(q.y-top-.004, .006-q.y); d=max(d,x-.205); d=max(d,abs(q.z)-.13); d=max(d,.003-x);
  return d*.6; }
float spine(vec3 q){ return sdCylZ(q-vec3(0.,.004,0.),.012,.14)-.001; }
#define RL vec3(.01,.05,.06)
vec3 rq(vec3 p){ vec3 q=P(p,RL,.35); return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec3 q=bq(p);
  r=U(r,min(cover(q),spine(q)),3.); r=U(r,pgs(q),4.);
  r=U(r,xwRulerD(rq(p),.2),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  vec3 q=bq(p);
  if(id==3.) return .28+.08*grain(q,30.);
  if(id==4.){ if(n.y<.5) return xwPagesT(q);
    float x=abs(q.x); if(x>.035&&x<.18&&abs(q.z)<.11){ float l=fract((q.z+.11)/.013); if(l<.14&&x<.17-.05*h1(vec2(floor((q.z+.11)/.013),sign(q.x)))) return .6; }
    if(x>.19||abs(q.z)>.12) return .9;
    return .93; }
  if(id==5.) return xwRulerT(rq(p),.2)*.85+.05;
  return .7; }
