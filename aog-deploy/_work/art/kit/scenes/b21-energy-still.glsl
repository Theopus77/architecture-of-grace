/* Practice room "Energy" — pencil still life: a clear light bulb standing on its screw base,
   a battery lying beside it, and a mug of hot tea (stored energy, light, and heat). */
#define CAM_POS vec3(-0.3152,0.3696,-0.7161)
#define CAM_TGT vec3(-0.1922,-0.0266,0.1096)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define BUL vec3(0.,0.,.04)
#define BAT vec3(-.13,.019,-.07)
#define MUG vec3(.15,0.,-.02)
float glassD(vec3 q){ float g=length(q-vec3(0.,.135,0.))-.06;
  float neck=sdCone(q-vec3(0.,.085,0.),.024,.045,.03);
  return smin(g,neck,.02); }
float baseD(vec3 q){ float a=q.y*380.;
  float d=sdCylY(q-vec3(0.,.035,0.),.024+.0018*sin(a),.022)-.001;
  d=min(d,sdCone(q-vec3(0.,.008,0.),.01,.02,.008));
  return d; }
vec3 batQ(vec3 p){ vec3 q=p-BAT; q.xz=rot(-.35)*q.xz; return q; }
float batD(vec3 q){ float d=sdCylX(q,.018,.05)-.0015; d=min(d,sdCylX(q-vec3(.054,0.,0.),.006,.004)-.001); return d; }
float teaD(vec3 q){ return sdCylY(q-vec3(0.,.078,0.),.037,.002); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 b=p-BUL;
  r=U(r,glassD(b),3.);
  r=U(r,baseD(b),4.);
  r=U(r,batD(batQ(p)),5.);
  vec3 m=place(p,MUG,2.5);
  r=U(r,cupD(m,.043,.095,.03),6.);
  r=U(r,teaD(m),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BUL; vec2 u=q.xy-vec2(0.,.13);
    /* the filament: two posts and a coil between them, seen through the glass */
    float f=min(sdSeg2(u,vec2(-.012,-.055),vec2(-.016,.0)),sdSeg2(u,vec2(.012,-.055),vec2(.016,.0)));
    float coil=abs(u.y-.004*sin(u.x*900.))-.0; if(abs(u.x)<.016&&abs(u.y)<.005) f=min(f,abs(u.y-.003*sin(u.x*1200.)));
    if(f<.0016&&q.z<0.) return .2;
    return .93; }
  if(id==4.){ vec3 q=p-BUL; if(q.y<.014) return .25; return .55+.25*sin(q.y*380.); }
  if(id==5.){ vec3 q=batQ(p); if(q.x>.02&&q.x<.05) return .82; if(q.x>.05) return .6; if(abs(q.x-.02)<.002) return .2; return .38; }
  if(id==6.){ vec3 q=p-MUG; if(abs(q.y-.06)<.003) return .45; return .82; }
  if(id==7.) return .35;
  return .7; }
