/* sp5 "The Present Tense" — a school day, told in the present: a brass hand bell with a
   turned wooden handle, a stack of three schoolbooks held by a buckled leather strap, and an
   apple for the teacher.
   @params {"mat":{"3":[0.5,1.4,1.0],"4":[0.55,1.2,0.9],"5":[0.62,1.2,0.9],"6":[0.35,1.3,1.0],"7":[0.5,1.3,1.0],"8":[0.3,1.2,0.8]},
            "texlines":{"4":[0.12,0.4,0.6],"5":[0.12,0.4,0.6],"7":[0.12,0.4,0.5]}} */
#define CAM_POS vec3(-0.4726,0.4453,-0.8703)
#define CAM_TGT vec3(-0.3241,-0.0330,0.1262)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
/* hand bell: mouth down on the table, body to y=.1, handle above */
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
#define BL vec3(.12,0.,.02)
float bellR(float y){ float t=clamp(y/.12,0.,1.); return .072-.036*pow(t,.8)+.009*exp(-y*220.)-.014*t*t*t; }
float bell(vec3 p){ vec3 q=p-BL; float r=length(q.xz);
  float d=(r-bellR(q.y))*.8; d=max(d,max(-q.y,q.y-.12));
  d=max(d,-(max(r-bellR(q.y)+.004,q.y-.113)));                  /* hollow */
  d=min(d,sdTorus(q-vec3(0.,.0045,0.),.075,.0045));                    /* rolled lip */
  d=min(d,sdTorus(q-vec3(0.,.07,0.),bellR(.07)+.0006,.0024));    /* a raised band */
  float cap=sdCylY(q-vec3(0.,.124,0.),.02,.005)-.003;
  return min(d,cap); }
float handle(vec3 p){ vec3 q=p-BL-vec3(0.,.13,0.);
  float r=length(q.xz); float y=q.y;
  float prof=.011+.006*sin(clamp(y/.08,0.,1.)*3.1416)-.004*exp(-pow((y-.016)/.005,2.));
  float d=max(r-prof,max(-y,y-.08))*.9;
  d=min(d,length(q-vec3(0.,.088,0.))-.017);                        /* knob */
  return d; }
/* three books stacked, a strap round them with a buckle on top */
#define BK vec3(-.12,0.,.06)
#define BKR .35
vec3 bkQ(vec3 p){ return place(p,BK,BKR); }
float books(vec3 p){ vec3 q=bkQ(p);
  float d=bookD(q,vec3(.13,.02,.095));
  vec3 q2=q-vec3(.006,.04,.004); q2.xz=rot(-.06)*q2.xz; d=min(d,bookD(q2,vec3(.12,.017,.088)));
  vec3 q3=q-vec3(-.004,.074,-.002); q3.xz=rot(.07)*q3.xz; d=min(d,bookD(q3,vec3(.115,.015,.082)));
  return d; }
float strap(vec3 p){ vec3 q=bkQ(p)-vec3(.02,0.,0.);
  float ring=abs(sdBox2(q.zy-vec2(0.,.052),vec2(.093-.005*step(q.y,.03),.0555)))-.0022;
  float d=max(ring,abs(q.x)-.013)-.0006;
  vec3 b=q-vec3(0.,.108,0.);
  float buckle=max(abs(sdBox2(b.xz,vec2(.018,.012)))-.0025,abs(b.y)-.0025);
  d=min(d,buckle);
  d=min(d,sdCapsule(b,vec3(-.017,0.,0.),vec3(.017,0.,0.),.0014));   /* the bar */
  float tail=sdRBox(q-vec3(0.,.108,.04),vec3(.012,.0022,.03),.001);  /* loose end */
  return min(d,tail); }
#define AP vec3(-.01,.042,-.14)
vec2 apple(vec3 p){ vec3 q=p-AP; q.xz=rot(.6)*q.xz; return vec2(appleD(q,.042),appleLeaf(q,.042)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bell(p),3.);
  r=U(r,handle(p),4.);
  r=U(r,books(p),5.);
  r=U(r,strap(p),6.);
  vec2 a=apple(p); r=U(r,a.x,7.); r=U(r,a.y,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BL; float a=atan(q.z,q.x); if(abs(a+2.2)<.14&&q.y<.11) return .95; return .55; }
  if(id==4.) return .6+.15*(grain(p.zxy*vec3(1.,1.,1.),80.)-.5);
  if(id==5.){ vec3 q=bkQ(p);
    if(abs(n.y)<.6&&q.x>-.1){ return fract(q.y/.0035)<.3?.72:.92; }                /* page edges */
    float lvl=q.y<.04?0.:q.y<.074?1.:2.; return lvl==0.?.5:lvl==1.?.66:.42; }
  if(id==6.) return .3;
  if(id==7.){ vec3 q=p-AP; float s=fbm(vec2(atan(q.z,q.x)*3.,q.y*40.)); return .45+.2*s; }
  if(id==8.) return .35;
  return .7; }
