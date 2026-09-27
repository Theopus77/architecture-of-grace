/* Family and Consumer Sciences hub page — pencil still life: a mixing bowl with a wire whisk
   resting in it, a wooden spool of thread with its loose end on the table, and a metal
   measuring cup with a long flat handle. */
#define CAM_POS vec3(-0.4781,0.4129,-0.7544)
#define CAM_TGT vec3(-0.1870,0.0140,0.0867)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define BW vec3(0.,0.,.1)
#define BWR .115
#define BWH .085
#define SP vec3(-.17,0.,-.02)
#define MC vec3(.19,0.,-.1)
/* whisk: handle end A outside the bowl, loops toward B inside it */
#define WA (BW+vec3(.2,.2,.02))
#define WB (BW+vec3(-.03,.035,.0))
float whiskD(vec3 p){
  vec3 ax=normalize(WB-WA); vec3 h1=WA, h2=WA+ax*.1;
  float hd=sdCapsule(p,h1,h2,.009);
  float ring=sdCapsule(p,h2,h2+ax*.012,.0065);
  /* four wire loops in planes through the axis */
  vec3 up=normalize(cross(ax,vec3(0.,0.,1.))); vec3 sd=cross(ax,up);
  vec3 o=h2+ax*.01; vec3 v=p-o; float a=dot(v,ax); vec2 w=vec2(dot(v,up),dot(v,sd));
  float L=.13; float d=1e3;
  for(int k=0;k<4;k++){ float th=float(k)*.785;
    vec2 e=vec2(cos(th),sin(th)); float b=dot(w,e); float pl=dot(w,vec2(-e.y,e.x));
    float t=clamp(a/L,0.,1.); float W=.034*sqrt(t)*(1.-.15*t)+.001;
    vec2 u=vec2((a-L*.5)/(L*.5),b/W);
    float ed=(length(u)-1.)*min(L*.5,W);
    ed=max(ed,-a);   /* no loop behind the handle */
    d=min(d,length(vec2(ed,pl))-.0013); }
  return min(min(hd,ring),d); }
float whiskT(vec3 p){ vec3 ax=normalize(WB-WA); float a=dot(p-WA,ax); if(a<.1) return .42+.1*grain(p*vec3(1.,1.,1.),50.); return .6; }
/* spool of thread standing on end */
float spoolD(vec3 q){
  float f1=sdCylY(q-vec3(0.,.005,0.),.03,.005)-.002, f2=sdCylY(q-vec3(0.,.075,0.),.03,.005)-.002;
  float th=sdCylY(q-vec3(0.,.04,0.),.024,.031);
  float hole=sdCylY(q-vec3(0.,.08,0.),.006,.01);
  float s=min(min(f1,f2),th); s=max(s,-hole);
  /* the loose end: a thread curling across the table toward the front */
  float end=1e3; vec3 c=q-vec3(.024,.0,-.0);
  for(int i=0;i<6;i++){ float t0=float(i)/6., t1=float(i+1)/6.;
    vec3 a=vec3(.0+.1*t0,.0015+.05*(1.-t0)*(1.-t0),-.09*t0+.02*sin(t0*6.));
    vec3 b=vec3(.0+.1*t1,.0015+.05*(1.-t1)*(1.-t1),-.09*t1+.02*sin(t1*6.));
    end=min(end,sdCapsule(c,a,b,.0011)); }
  return min(s,end); }
float spoolT(vec3 q){ float r=length(q.xz);
  if(q.y>.01&&q.y<.07&&r<.0255){ float a=atan(q.z,q.x); return fract(q.y/.0055+a*.12)<.3?.3:.62; }   /* wound thread */
  if(r<.021) return .7;
  return .62+.08*grain(q.xzy,40.); }
/* measuring cup with a long flat handle toward +x */
float mcupD(vec3 q){
  float o=sdCone(q-vec3(0.,.024,0.),.036,.042,.024)-.0012;
  float i=sdCone(q-vec3(0.,.028,0.),.033,.04,.024);
  float c=max(o,-i);
  c=min(c,sdTorus(q-vec3(0.,.048,0.),.042,.0022));
  float hd=sdRBox(q-vec3(.1,.046,0.),vec3(.055,.0022,.011),.0018);
  hd=max(hd,-(length(q.xz-vec2(.145,0.))-.005));
  return min(c,hd); }
float mcupT(vec3 q){ if(length(q.xz)<.04&&q.y>.004) return .35;             /* inside, in shade */
  if(q.x>.04) return .78;
  if(abs(q.y-.034)<.0012&&q.z<0.) return .3;
  return .8; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bowl(P(p,BW,0.),BWR,BWH),3.);
  float fill=length(p-BW-vec3(0.,BWR*1.02,0.))-BWR+.006; fill=max(fill,p.y-.028);   /* a little batter in the bottom */
  r=U(r,fill,4.);
  r=U(r,whiskD(p),5.);
  r=U(r,spoolD(P(p,SP,.3)),6.);
  r=U(r,mcupD(P(p,MC,.45)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BW; if(abs(q.y-BWH*.72)<.003&&length(q.xz)>BWR*.8) return .4; return .72; }
  if(id==4.) return .8;
  if(id==5.) return whiskT(p);
  if(id==6.) return spoolT(P(p,SP,.3));
  if(id==7.) return mcupT(P(p,MC,.45));
  return .7; }
