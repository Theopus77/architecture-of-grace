/* s5 "Money, Markets and Choices" — an open clasp coin purse with one coin set before it, and
   two things that coin could buy: a striped toy ball and a small wooden toy boat. */
#define CAM_POS vec3(-0.2896,0.1690,-0.4798)
#define CAM_TGT vec3(-0.1124,-0.0201,0.0751)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define PU vec3(.02,0.,.1)
vec3 pQ(vec3 p){ return place(p,PU,-.2); }
float purse(vec3 p){ vec3 q=pQ(p);
  float body=sdEll(q-vec3(0.,.04,0.),vec3(.07,.045,.03)); body=max(body,q.y-.07);
  body=max(body,-sdEll(q-vec3(0.,.07,0.),vec3(.06,.02,.022)));
  return body; }
float clasp(vec3 p){ vec3 q=pQ(p); float d=1e5;
  for(int s=0;s<2;s++){ float sz=s==0?-1.:1.; vec3 k=q-vec3(0.,.062,sz*.02);
    vec2 u=vec2(k.x,k.y*2.6); float arc=abs(length(u)-.066); d=min(d,max(length(vec2(arc*.45,k.z))-.0025,-k.y)); }
  float kn=min(length(q-vec3(-.007,.089,-.02))-.005,length(q-vec3(.007,.089,-.02))-.005);
  return min(d,kn); }
float coin(vec3 p){ return coinD(p-vec3(.02,0.,-.07),.022,.0045); }
#define BA vec3(-.12,.045,.08)
float ball(vec3 p){ return length(p-BA)-.045; }
vec3 bQ(vec3 p){ return place(p,vec3(.2,0.,.02),-.35); }
float boat(vec3 p){ vec3 q=bQ(p); float x=q.x; float w=.028*sqrt(max(1.-pow(abs(x)/.07,2.),0.))+.001;
  float hull=max(max(abs(q.z)-w,abs(q.y-.02)-.02),abs(x)-.07); hull=max(hull,.025*pow(abs(x)/.07,2.)-q.y);
  hull=max(hull,-sdBox(q-vec3(0.,.045,0.),vec3(.06,.01,max(w-.004,0.))));
  float cab=sdRBox(q-vec3(-.01,.05,0.),vec3(.022,.014,.016),.003);
  float st=sdCylY(q-vec3(.0,.075,0.),.006,.012);
  return min(hull*.9,min(cab,st)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,purse(p),3.);
  r=U(r,clasp(p),4.);
  r=U(r,coin(p),5.);
  r=U(r,ball(p),6.);
  r=U(r,boat(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pQ(p); if(q.y>.055&&abs(q.z)<.02) return .25; return .45; }
  if(id==4.) return .7;
  if(id==5.){ vec3 q=p-vec3(.02,0.,-.07); float r=length(q.xz); if(n.y>.7&&abs(r-.016)<.001) return .35; return .65; }
  if(id==6.){ vec3 d=normalize(p-BA); float a=atan(d.z,d.x); return abs(d.y)<.2?.3:(abs(d.y)<.55?.85:.55); }
  if(id==7.){ vec3 q=bQ(p); if(q.y<.02) return .4; if(q.y>.036&&q.y<.064&&abs(q.x+.01)<.02&&q.z<-.015&&abs(q.x+.01)<.008&&abs(q.y-.052)<.006) return .25; return .72; }
  return .7; }
