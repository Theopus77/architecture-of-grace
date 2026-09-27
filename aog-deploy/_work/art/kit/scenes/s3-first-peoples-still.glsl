/* Room "The First Peoples" — pencil still life: a round coiled clay pot with a painted band of
   step and zig-zag patterns, two ears of corn in their husks, and a flaked stone arrowhead. */
#define CAM_POS vec3(-0.3890,0.2781,-0.6826)
#define CAM_TGT vec3(-0.1558,-0.0051,0.0503)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define PT vec3(-.04,0.,.07)
float potD(vec3 p){ vec3 q=p-PT;
  float body=sdEll(q-vec3(0.,.075,0.),vec3(.1,.078,.1));
  body=max(body,-q.y+.006);
  float neck=sdCylY(q-vec3(0.,.155,0.),.052,.012)-.003;
  float lip=sdTorus(q-vec3(0.,.167,0.),.054,.004);
  float d=smin(body,neck,.02); d=min(d,lip);
  d=max(d,-sdCylY(q-vec3(0.,.17,0.),.046,.04));
  return d; }
vec3 cornQ(vec3 p,float s){ vec3 q=p-vec3(.13+s*.02,.027,-.05-s*.065); q.xz=rot(-.5+s*.5)*q.xz; return q; }   /* along x */
float cornD(vec3 p,float s){ vec3 q=cornQ(p,s);
  float t=clamp((q.x+.07)/.14,0.,1.);
  float cob=sdCapsule(q,vec3(-.06,0.,0.),vec3(.06,0.,0.),.018*(1.-.35*t)+.0);
  cob=length(vec2(max(abs(q.x)-.06,0.),length(q.yz)))-(.027-.01*t);
  cob+=.0012*smoothstep(.2,.8,abs(sin(q.x*260.)))*smoothstep(.2,.8,abs(sin(atan(q.z,q.y)*6.)));
  /* husk leaves peeled back toward -x */
  float husk=1e5; for(int i=0;i<3;i++){ float a=float(i)*2.1+.3; vec3 h=q-vec3(-.07,0.,0.); h.yz=rot(a)*h.yz;
    h.xy=rot(.35)*h.xy; husk=min(husk,sdRBox(h-vec3(-.03,.024,0.),vec3(.04,.0012,.011),.001)); }
  husk=max(husk,-q.y-.02+.0);
  return min(cob*.8,husk); }
vec3 ahQ(vec3 p){ vec3 q=p-vec3(-.03,.004,-.13); q.xz=rot(.8)*q.xz; return q; }
float arrowD(vec3 p){ vec3 q=ahQ(p);
  vec2 u=q.xz; float tri=max(abs(u.y)-(.028-u.x*.5)*0.,0.);
  /* a leaf-point with two notches at the base */
  float l=max(abs(u.y)-.016*(1.-(u.x+.02)/.06)*step(-.02,u.x)-.016*step(u.x,-.02),abs(u.x-.01)-.03);
  l=max(l,-(length(vec2(u.x+.016,abs(u.y)-.016))-.005));
  float d=max(l,abs(q.y)-.004*(1.-abs(u.y)/.02));
  d+=.0007*vn(u*400.);
  return d*.5; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,potD(p),3.);
  r=U(r,min(cornD(p,0.),cornD(p,1.)),4.);
  r=U(r,arrowD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PT; float a=atan(q.z,q.x); float y=q.y;
    if(y>.09&&y<.13){ float u=fract(a*12./6.2832); float v=(y-.09)/.04; if(abs(v-abs(u-.5)*2.)<.12) return .2; if(v>.85||v<.12) return .3; }
    if(y>.04&&y<.06){ float u=fract(a*24./6.2832); if(u<.5&&y>.045&&y<.055) return .3; }
    if(y>.16) return .45; return .72; }
  if(id==4.){ vec3 q=cornQ(p,0.); vec3 q2=cornQ(p,1.); vec3 u=length(q)<length(q2)?q:q2; if(u.x<-.06) return .55; return abs(sin(u.x*260.))<.3?.45:.72; }
  if(id==5.) return .35;
  return .7; }
