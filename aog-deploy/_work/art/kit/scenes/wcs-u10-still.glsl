/* WCS Unit 10 "Societies of the Americas" — pencil still life: a round clay pot with a painted
   step-fret band, an Inca quipu (knotted cords) hanging from a wooden rack, and a small
   stepped-pyramid model in stone. */
#define CAM_POS vec3(-0.5331,0.2682,-1.1257)
#define CAM_TGT vec3(-0.2577,0.0178,0.1129)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define PC vec3(-.02,0.,.06)
float pot(vec3 p){ vec3 q=p-PC; float y=q.y;
  float r=.035+.062*sin(3.1416*clamp(y/.19,0.,1.)*.9+.2)+.003*sin(y*120.)*0.;
  r=mix(r,.042,smoothstep(.16,.2,y));
  float d=(length(q.xz)-r)*.8; d=max(d,max(-y,y-.21));
  d=max(d,-max(length(q.xz)-.034,.17-y));
  d=min(d,sdTorus(q-vec3(0.,.208,0.),.043,.006));
  d=min(d,sdCylY(q-vec3(0.,.005,0.),.05,.005)-.002);
  return d; }
#define QX .14
#define QZ .04
float rack(vec3 p){ vec3 q=p-vec3(QX,0.,QZ);
  float b1=sdRBox(q-vec3(0.,.012,0.),vec3(.03,.012,.05),.004), b2=sdRBox(q-vec3(.3,.012,0.),vec3(.03,.012,.05),.004);
  float p1=sdRBox(q-vec3(0.,.16,0.),vec3(.009,.15,.009),.003), p2=sdRBox(q-vec3(.3,.16,0.),vec3(.009,.15,.009),.003);
  float bar=sdCylX(q-vec3(.15,.3,0.),.009,.175);
  return min(min(min(b1,b2),min(p1,p2)),bar); }
float quipu(vec3 p){ vec3 q=p-vec3(QX,0.,QZ);
  float d=sdTorus((q-vec3(.15,.3,0.)).yxz*vec3(1.,1.,1.),.0,.0)+1.;
  d=min(d,sdCylX(q-vec3(.15,.3,0.),.0135,.15));
  for(int i=0;i<9;i++){ float fi=float(i); float x=.035+fi*.029; float L=.13+.07*fract(sin(fi*7.1)*43.);
    vec3 a=vec3(x,.29,0.), b=vec3(x+.006*sin(fi*2.),.29-L,-.004*cos(fi));
    d=min(d,sdCapsule(q,a,b,.0032));
    for(int k=0;k<3;k++){ float t=.25+.22*float(k)+.1*fract(sin(fi*3.3+float(k))*91.); if(t*L<L-.01){
      d=min(d,length((q-mix(a,b,t))*vec3(1.,.8,1.))-.0068); } } }
  return d; }
float pyr(vec3 p){ vec3 q=p-vec3(-.2,0.,-.1); q.xz=rot(.5)*q.xz; float d=1e5;
  for(int i=0;i<4;i++){ float fi=float(i); d=min(d,sdRBox(q-vec3(0.,.012+fi*.024,0.),vec3(.075-fi*.017,.012,.075-fi*.017),.002)); }
  d=min(d,sdRBox(q-vec3(0.,.107,0.),vec3(.016,.011,.016),.002));
  float st=max(sdRBox(q-vec3(0.,.05,-.06),vec3(.012,.05,.03),.001),dot(q-vec3(0.,.1,-.03),normalize(vec3(0.,1.,-1.))));
  d=min(d,st); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pot(p),3.);
  r=U(r,rack(p),4.);
  r=U(r,quipu(p),5.);
  r=U(r,pyr(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PC; float a=atan(q.z,q.x)*12./6.2832;
    if(q.y>.11&&q.y<.15){ vec2 u=vec2(fract(a),(q.y-.11)/.04); float s=(u.x<.5)?(u.y<.5?1.:0.):(u.y>.5?1.:0.); if(abs(u.y-.5)<.12||s>.5&&u.x>.25&&u.x<.75) return .3; return .55; }
    if(abs(q.y-.105)<.003||abs(q.y-.155)<.003) return .25; return .58+.06*grain(p,60.); }
  if(id==4.) return .45+.12*grain(p,50.);
  if(id==5.) return .5;
  if(id==6.){ vec3 q=p-vec3(-.2,0.,-.1); return fract(q.y/.024)<.12?.4:.72; }
  return .7; }
