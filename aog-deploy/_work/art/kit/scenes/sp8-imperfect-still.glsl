/* sp8-imperfect "The Imperfect and Telling a Story" (Yo leía cuando sonó el teléfono) — an open
   storybook lying on the table (the scene already going on) and an old rotary telephone with
   its coiled cord (the one event that breaks in). Hint-lines only on the pages. */
#define CAM_POS vec3(-0.4636,0.3407,-0.7854)
#define CAM_TGT vec3(-0.3311,-0.0851,0.1021)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
/* ---- telephone, local frame: base centre at PH, turned a little toward the viewer ---- */
#define PH vec3(.02,0.,-.06)
vec3 phQ(vec3 p){ return place(p,PH,.35); }
#define FN normalize(vec3(0.,.8,-1.))
#define FT normalize(vec3(0.,1.,.8))
float bodyD(vec3 q){
  float b=sdRBox(q-vec3(0.,.045,.0),vec3(.1,.045,.09),.014);
  float front=dot(q-vec3(0.,.09,-.03),FN);
  float back=dot(q-vec3(0.,.09,.03),normalize(vec3(0.,.8,1.)));
  float side=abs(q.x)*.35+q.y-.115;                    /* the top narrows a little to the sides */
  float d=smax(b,front,.01); d=smax(d,back,.01); d=smax(d,side,.008);
  float foot=sdRBox(q-vec3(0.,.004,0.),vec3(.104,.004,.094),.003);
  return min(d,foot); }
/* the dial sits on the sloped front face */
#define DC vec3(0.,.058,-.058)
vec3 dialQ(vec3 q){ vec3 r=q-DC; return vec3(r.x,dot(r,FT),dot(r,FN)); }   /* x, up-the-slope, out */
float dialD(vec3 q){ vec3 u=dialQ(q);
  float disc=sdCylZ(u-vec3(0.,0.,.004),.036,.003)-.0015;
  float a=atan(u.y,u.x); float st=6.2832/12.;
  float k=clamp(floor((a+PI)/st+.5),1.,10.); float an=k*st-PI;   /* ten finger holes over 300 degrees */
  vec2 hc=.026*vec2(cos(an),sin(an));
  float hole=sdCylZ(vec3(u.xy-hc,u.z-.006),.0055,.006);
  disc=max(disc,-hole);
  float plate=sdCylZ(u-vec3(0.,0.,.008),.012,.0015)-.001;
  vec2 fs=.037*vec2(cos(-.75),sin(-.75));                                  /* finger stop */
  float stop=sdCapsule(u,vec3(fs,.006),vec3(fs*1.12,.01),.0022);
  return min(min(disc,plate),stop); }
/* handset resting across the cradle along x */
float handD(vec3 q){ vec3 h=q-vec3(0.,.128,.0);
  float grip=sdCapsule(h,vec3(-.085,.0,0.),vec3(.085,.0,0.),.0125);
  grip=smin(grip,sdCapsule(h,vec3(-.1,-.01,0.),vec3(-.085,.0,0.),.013),.01);
  grip=smin(grip,sdCapsule(h,vec3(.1,-.01,0.),vec3(.085,.0,0.),.013),.01);
  float c1=sdCylY(h-vec3(-.105,-.018,0.),.024,.009)-.004;
  float c2=sdCylY(h-vec3(.105,-.018,0.),.024,.009)-.004;
  return smin(grip,min(c1,c2),.008); }
float cradleD(vec3 q){ vec3 c=q; c.x=abs(c.x)-.07;
  return sdRBox(c-vec3(0.,.108,.0),vec3(.008,.01,.014),.004); }
/* the coiled cord: a helix around a straight line from the handset's end to the table */
float coil(vec3 p,vec3 a,vec3 b,float Rc,float pitch,float r){
  vec3 ax=normalize(b-a); float L=length(b-a); vec3 w=p-a; float s=dot(w,ax);
  vec3 up=normalize(cross(ax,vec3(0.,0.,1.))); vec3 sd=cross(ax,up);
  vec2 yz=vec2(dot(w,up),dot(w,sd)); float ang=atan(yz.y,yz.x);
  float ph=s/pitch-ang/6.2832; float dl=(fract(ph+.5)-.5)*pitch;
  float d=length(vec2(length(yz)-Rc,dl))-r;
  return max(d*.7,max(-s,s-L)); }
float cordD(vec3 p){ vec3 q=phQ(p);
  return min(coil(q,vec3(-.122,.098,.0),vec3(-.15,.0062,-.06),.0052,.0048,.0016),
             coil(q,vec3(-.15,.0062,-.06),vec3(-.27,.0062,-.03),.0052,.0048,.0016)); }
/* ---- open storybook lying at the front left ---- */
vec3 bookQ(vec3 p){ vec3 q=p-vec3(-.25,.0,.07); q.xz=rot(-.3)*q.xz; q.yz=rot(-.05)*q.yz; return q; }
vec2 bookD(vec3 p){
  vec3 q=bookQ(p); float x=abs(q.x);
  float lift=.018*sin(clamp(x/.15,0.,1.)*1.9)-.012*exp(-x*50.)+.008;
  float pages=sdBox(vec3(x-.075,q.y-lift*.5,q.z),vec3(.073,max(lift*.5,.003),.1))-.0015;
  float cover=sdRBox(vec3(x-.08,q.y+.001,q.z),vec3(.083,.0035,.107),.0015);
  return vec2(pages,cover); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.45-p.z,2.);
  vec3 q=phQ(p);
  if(length(q-vec3(0.,.06,0.))<.25){
    r=U(r,bodyD(q),3.);
    r=U(r,dialD(q),4.);
    r=U(r,handD(q),5.);
    r=U(r,cradleD(q),6.);
  } else r=U(r,length(q-vec3(0.,.06,0.))-.2,3.);
  r=U(r,cordD(p),7.);
  vec2 b=bookD(p); r=U(r,b.x,8.); r=U(r,b.y,9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return .3;
  if(id==4.){ vec3 u=dialQ(phQ(p)); float r=length(u.xy);
    if(r<.013) return .9;                              /* paper centre card */
    if(u.z<.004&&r>.018) return .12;                   /* inside the finger holes */
    return .72; }
  if(id==5.) return .28;
  if(id==6.) return .4;
  if(id==7.) return .25;
  if(id==8.){ float a=.95; vec3 q=bookQ(p); float x=abs(q.x);
    if(x>.018&&x<.135&&q.z>-.08&&q.z<.085){ float row=floor((q.z+.08)/.012); float l=fract((q.z+.08)/.012);
      float len=.1-.035*h1(vec2(row,sign(q.x)));
      if(l<.2&&x<.018+len) a=.6;
      if(q.x<0.&&q.z>.05&&x<.05) a=l<.2?.35:.95; }       /* a short title line, pressed darker */
    if(x<.005) a=.7; return a; }
  if(id==9.) return .38;
  return .7; }
