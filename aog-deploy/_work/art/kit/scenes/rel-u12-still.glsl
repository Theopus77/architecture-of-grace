/* World Religions Unit 12 "Traditions Without One Book" (Sacred Words Carried by Voice) —
   pencil still life: a round hide frame drum leaning up on its edge, a padded drum beater
   lying in front, a coiled woven basket and a round clay pot. No figures. */
#define CAM_POS vec3(-0.3737,0.4447,-0.7758)
#define CAM_TGT vec3(-0.2383,0.0086,0.1333)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define DR vec3(-.02,0.,.1)
#define DRR .115
#define BA vec3(.19,0.,.02)
#define PT vec3(-.22,0.,.02)
vec3 dq(vec3 p){ vec3 q=L(p,DR,.35)-vec3(0,DRR+.004,0); q.yz=rot(.28)*q.yz; return q; }   /* drum face in xy, leaning back */
float drum(vec3 q){
  float frame=max(abs(length(q.xy)-DRR)-.005,abs(q.z)-.022);
  float hide=max(length(q.xy)-DRR,abs(q.z+.02)-.0015);
  float lace=max(abs(length(q.xy)-DRR*.25)-.012,abs(q.z-.018)-.002);
  return min(min(frame,hide),lace); }
float beater(vec3 q){ float st=sdCapsule(q,vec3(-.1,.006,0),vec3(.06,.006,0),.004);
  float pad=length((q-vec3(.075,.017,0))*vec3(.85,1.,1.))-.017; return min(st,pad); }
float basket(vec3 q){ float y=q.y; float r=.05+.03*smoothstep(0.,.07,y)+.004*smoothstep(.07,.09,y);
  float d=(length(q.xz)-r)*.8; d=max(d,max(-y,y-.085)); d=max(d,-max(length(q.xz)-r+.006,.008-y));
  d-=.0012*abs(sin(y*3.1416/.008)); return min(d,sdTorus(q-vec3(0,.085,0),r-.002,.004)); }
float pot(vec3 q){ vec3 c=q-vec3(0,.06,0); float b=length(c*vec3(1.,1.12,1.))-.062;
  float neck=sdCylY(q-vec3(0,.12,0),.03,.012); float lip=sdTorus(q-vec3(0,.132,0),.032,.004);
  float d=max(smin(b,neck,.015),-(sdCylY(q-vec3(0,.13,0),.025,.03)));
  return min(max(d,-q.y),lip); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,drum(dq(p)),3.);
  r=U(r,beater(L(p,DR+vec3(.03,0.,-.13),-.3)),4.);
  r=U(r,basket(L(p,BA,0.)),5.);
  r=U(r,pot(L(p,PT,0.)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=dq(p); float rr=length(q.xy);
    if(rr<DRR-.004&&q.z<-.012){ float a=.86-.1*fbm(q.xy*25.); if(abs(rr-DRR*.8)<.0025) a=.45; return a; }
    if(rr>DRR-.006){ return fract(atan(q.y,q.x)*6.)<.12?.3:.45; }
    return .42; }
  if(id==4.){ vec3 q=L(p,DR+vec3(.03,0.,-.13),-.3); return q.x>.055?.6:.42; }
  if(id==5.){ vec3 q=L(p,BA,0.); float a=atan(q.z,q.x); float s=fract(q.y/.008); float st=fract(a*8./6.2832+q.y*6.);
    return s<.25?.35:(st<.15?.4:.6); }
  if(id==6.){ vec3 q=L(p,PT,0.); if(abs(q.y-.07)<.012&&fract(atan(q.z,q.x)*3.)<.4&&abs(fract((q.y-.058)/.012*1.)-.5)<.5) return abs(q.y-.07)<.003?.35:.5; return .58; }
  return .7; }
