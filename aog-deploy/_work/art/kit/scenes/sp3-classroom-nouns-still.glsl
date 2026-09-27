/* Practice room "The Classroom — Nouns and Articles" — pencil still life of classroom things: a
   small wooden-framed slate chalkboard propped on a stand with a stick of chalk on its ledge, a
   felt board eraser, and a cup full of pencils. */
#define CAM_POS vec3(-0.2601,0.3344,-0.6398)
#define CAM_TGT vec3(-0.1492,-0.0229,0.1049)
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
#define SL vec3(-.03,0.,.06)
#define ER vec3(.15,0.,-.07)
#define PC vec3(.16,0.,.07)
vec3 slQ(vec3 p){ vec3 q=p-SL; q.xz=rot(-.15)*q.xz; q.yz=rot(.22)*q.yz; return q; }
float slateD(vec3 q){ float fr=sdRBox(q-vec3(0.,.1,0.),vec3(.1,.075,.006),.003); fr=max(fr,-sdBox(q-vec3(0.,.1,-.006),vec3(.088,.063,.004)));
  float board=sdBox(q-vec3(0.,.1,0.),vec3(.089,.064,.003));
  float ledge=sdRBox(q-vec3(0.,.024,-.012),vec3(.1,.003,.012),.002);
  return min(min(fr,board),ledge); }
float chalkD(vec3 q){ return sdCapsule(q,vec3(-.06,.031,-.015),vec3(-.025,.031,-.017),.004); }
float legD(vec3 p){ vec3 q=p-SL; q.xz=rot(-.15)*q.xz; return min(sdCapsule(q,vec3(-.07,.14,.04),vec3(-.08,.0,.09),.004),sdCapsule(q,vec3(.07,.14,.04),vec3(.08,.0,.09),.004)); }
float eraserD(vec3 q){ float d=sdRBox(q-vec3(0.,.018,0.),vec3(.045,.01,.02),.004); d=min(d,sdRBox(q-vec3(0.,.005,0.),vec3(.043,.006,.018),.002)); return d; }
float pencilsD(vec3 q){ float d=1e3; for(int i=0;i<5;i++){ float a=float(i)*1.3; vec3 b=vec3(cos(a)*.012,.02,sin(a)*.012); vec3 t=b+normalize(vec3(cos(a)*.18,1.,sin(a)*.18))*(.11+.015*sin(float(i)*2.));
    float dd=sdCapsule(q,b,t,.0038); d=min(d,dd); } return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 s=slQ(p);
  r=U(r,slateD(s),3.);
  r=U(r,legD(p),3.);
  r=U(r,chalkD(s),4.);
  r=U(r,eraserD(place(p,ER,.35)),5.);
  vec3 c=p-PC;
  r=U(r,cupD(c,.03,.07,0.),6.);
  r=U(r,pencilsD(c),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=slQ(p); if(abs(q.x)<.088&&abs(q.y-.1)<.063&&q.z<.0){
      vec2 u=q.xy-vec2(0.,.1); float d=min(glyph((u-vec2(-.045,.012))/.05,65)*.05,min(glyph((u-vec2(-.005,.012))/.05,66)*.05,glyph((u-vec2(.035,.012))/.05,67)*.05));
      if(d<.0022) return .9;                                     /* chalk letters A B C */
      if(abs(u.y+.035)<.0015&&abs(u.x)<.06) return .75;          /* a chalk line under them */
      return .22; }
    return .6+.1*grain(q,70.); }
  if(id==4.) return .95;
  if(id==5.){ vec3 q=place(p,ER,.35); return q.y<.011?.35:.6; }
  if(id==6.) return .7;
  if(id==7.){ vec3 q=p-PC; return q.y>.11?.3:.6; }
  return .7; }
