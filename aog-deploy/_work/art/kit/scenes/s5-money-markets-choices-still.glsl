/* s5 "Money, Markets and Choices" — an old shop cash register with rows of round keys and a
   side crank, a stack of coins and a loose coin, and a small woven basket of oranges. */
#define CAM_POS vec3(-0.4256,0.2445,-0.4749)
#define CAM_TGT vec3(-0.1147,-0.0120,0.0678)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "roomparts_e.glsl"
vec3 rQ(vec3 p){ return plc(p,vec3(0.,0.,.06),-.35); }
vec3 kQ(vec3 p){ return p-vec3(-.1,0.,-.08); }
vec3 bQ(vec3 p){ return p-vec3(.19,0.,-.04); }
float oranges(vec3 p){ vec3 q=bQ(p);
  float a=length(q-vec3(-.015,.052,.005))-.033; a=min(a,length(q-vec3(.025,.05,-.012))-.031);
  return a; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=rQ(p);
  r=U(r,registerBody(q),3.);
  r=U(r,registerKeys(q),4.);
  r=U(r,registerCrank(q),5.);
  r=U(r,min(coinStackE(kQ(p),.02,.0035,7),coinE(kQ(p)-vec3(.05,0.,-.02),.02,.0032)),6.);
  r=U(r,basketE(bQ(p),.055,.04),7.);
  r=U(r,oranges(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=rQ(p); if(q.y>.084&&q.z>.03&&abs(q.x)<.035&&abs(q.y-.108)<.009&&q.z<.032) return .9;
    if(abs(q.x)<.012&&abs(q.y-.02)<.004&&q.z<-.07) return .15;              /* drawer pull */
    if(q.y<.04&&abs(q.y-.036)<.002) return .3;
    return .4; }
  if(id==4.) return .85;
  if(id==5.) return .3;
  if(id==6.) return .55;
  if(id==7.) return basketTone(bQ(p),.055,.04);
  if(id==8.){ vec3 q=bQ(p); return .6+.1*vn3(q*900.); }
  return .7; }
