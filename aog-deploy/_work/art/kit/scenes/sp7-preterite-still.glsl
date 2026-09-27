/* Practice room "The Preterite — Telling What Happened" — pencil still life of a meal that is
   finished (comí, bebí): an empty dinner plate with a few crumbs, the fork and knife laid side by
   side across it and an empty drinking glass behind it. */
#define CAM_POS vec3(-0.4176,0.4407,-0.4835)
#define CAM_TGT vec3(-0.1350,-0.0449,0.1167)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define PC vec3(0.,0.,.02)
/* plate: a revolved profile, low foot, flat well, rising rim */
float plateD(vec3 p){ vec3 q=p-PC; float r=length(q.xz);
  float top=.006+.012*smoothstep(.075,.125,r);          /* upper surface */
  float d=max(abs(q.y-top)-.0028,r-.135);
  d=min(d,max(sdTorus(q-vec3(0.,.02,0.),.132,.004),-1.));
  d=min(d,max(abs(r-.055)-.004,abs(q.y-.002)-.002));    /* foot ring */
  return d-.0006; }
float crumbs(vec3 p){ vec3 q=p-PC; float d=1e3;
  for(int i=0;i<7;i++){ float fi=float(i); vec2 c=(h22(vec2(fi,3.1))-.5)*vec2(.13,.1)+vec2(-.02,.015);
    d=min(d,length(q-vec3(c.x,.0105,c.y))-.003-.002*h1(vec2(fi,7.))); }
  return d; }
/* fork and knife laid together across the plate: the "I am finished" sign */
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
vec3 fkQ(vec3 p,float off){ vec3 q=p-PC; q.xz=rot(-.65)*q.xz; q.z-=off; return q; }
float heightOn(float x){ return .0095+.013*smoothstep(.07,.125,abs(x)); }
float lay(vec3 q,float d2,float th){ float y0=heightOn(q.x)+th+.0005; return max(d2,abs(q.y-y0)-th)-.0006; }
float fork2(vec2 u){ float x=u.x;
  float w=mix(.0075,.004,smoothstep(-.06,.02,x)); w=mix(w,.016,smoothstep(.02,.055,x));
  float d=max(abs(u.y)-w,max(-.155-x,x-.06));
  float t=max(abs(u.y)-.016,max(.05-x,x-.11));                                   /* tines */
  float g=abs(fract(u.y/.0107+.5)-.5)*.0107-.0019; t=max(t,-max(g,.062-x));
  return min(d,t); }
float knife2(vec2 u){ float x=u.x;
  float hdl=max(abs(u.y)-.0085,max(-.16-x,x+.03))-.0015;
  float bl=max(abs(u.y+.001)-.0085+.0085*smoothstep(.06,.105,x)*step(0.,-u.y),max(-.03-x,x-.105));
  bl=max(bl,u.y-.0085+.0085*pow(smoothstep(.07,.108,x),.6));
  return min(hdl,bl); }
float forkD(vec3 p){ vec3 q=fkQ(p,.02); return lay(q,fork2(q.xz),.0017); }
float knifeD(vec3 p){ vec3 q=fkQ(p,-.02); float th=q.x<-.03?.0035:.0012; return lay(q,knife2(q.xz),th); }
/* an empty tumbler, rim toward the light */
#define GC vec3(.2,0.,.0)
float glassD(vec3 p){ vec3 q=p-GC; float r=length(q.xz); float R=.036+q.y*.08;
  float d=max(abs(r-R)-.0022,abs(q.y-.06)-.06);
  d=min(d,max(r-R,abs(q.y-.005)-.005));
  return d-.0005; }
float sdEllN(vec3 c){ vec3 r=vec3(.075,.03,.05); float k0=length(c/r),k1=length(c/(r*r)); return k0*(k0-1.)/k1; }
/* a crumpled cloth napkin */
float napD(vec3 p){ vec3 q=p-vec3(-.17,0.,-.06); q.xz=rot(.5)*q.xz;
  float d=sdEllN(q-vec3(0.,.012,0.));
  d+=.006*(fbm(q.xz*38.)-.5)+.004*sin(q.x*120.+fbm(q.xz*20.)*6.);
  return max(d*.8,-q.y); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,plateD(p),3.);
  r=U(r,crumbs(p),4.);
  r=U(r,forkD(p),5.); r=U(r,knifeD(p),8.);
  r=U(r,glassD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PC; float r=length(q.xz); if(abs(r-.118)<.0022) return .45; return .92; }   /* a painted ring on the rim */
  if(id==4.) return .45;
  if(id==5.) return .8;
  if(id==8.){ vec3 q=fkQ(p,-.02); if(q.x<-.03) return .22; return .82; }   /* dark knife handle */
  if(id==6.) return .8;
  if(id==7.) return .6;
  return .7; }
