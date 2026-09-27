/* r2 "The Biblical Lens I: The Hebrew Bible" — an open scroll wound on two turned wooden
   rollers, its sheet showing columns of hint-lines, a small clay oil lamp, and a pomegranate. */
#define CAM_POS vec3(-0.3957,0.3077,-0.6348)
#define CAM_TGT vec3(-0.1568,0.0528,0.1140)
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
vec3 sQ(vec3 p){ vec3 q=p-vec3(-.02,0.,.1); q.xz=rot(.08)*q.xz; q.yz=rot(-.95)*q.yz; return q; }  /* sheet leans back: y is out of the sheet */
#define RX .1
float rollers(vec3 p){ vec3 k=p-vec3(-.02,0.,.1); k.xz=rot(.08)*k.xz; float d=1e5;
  for(int s=0;s<2;s++){ float x=s==0?-RX:RX; vec3 c=k-vec3(x,0.,0.);
    float roll=sdCylY(c-vec3(0.,.1,0.),.026,.07)-.002;
    float pole=sdCylY(c-vec3(0.,.1,0.),.006,.115);
    float h1=sdCylY(c-vec3(0.,.225,0.),.009+.003*sin(c.y*400.),.012);
    float disc=sdCylY(c-vec3(0.,.178,0.),.034,.003)-.001;
    float disc2=sdCylY(c-vec3(0.,.022,0.),.034,.003)-.001;
    d=min(d,min(min(roll,pole),min(h1,min(disc,disc2)))); }
  return d; }
float sheet(vec3 p){ vec3 k=p-vec3(-.02,0.,.1); k.xz=rot(.08)*k.xz;
  float bend=.012*cos(k.x/RX*1.5708);
  return max(sdBox(k-vec3(0.,.1,-.016-bend),vec3(RX,.068,.0008)),-1.); }
vec3 lQ(vec3 p){ return place(p,vec3(.19,0.,-.02),-.5); }
float lamp(vec3 p){ vec3 q=lQ(p);
  float body=sdEll(q-vec3(0.,.018,0.),vec3(.04,.018,.03));
  float nozzle=sdCapsule(q,vec3(.02,.02,0.),vec3(.055,.024,0.),.008);
  float d=smin(body,nozzle,.01);
  d=max(d,-(length(q-vec3(-.004,.04,0.))-.01));
  d=max(d,-sdCapsule(q,vec3(.05,.03,0.),vec3(.058,.03,0.),.003));
  float handle=sdTorus((q-vec3(-.045,.022,0.)).xzy,.012,.003);
  return min(d,handle); }
float flame(vec3 p){ vec3 q=lQ(p)-vec3(.058,.04,0.); float k=clamp((q.y+.008)/.035,0.,1.);
  return length(vec3(q.x,q.y*.45,q.z))-(.006*(1.-k*k)+.0008); }
float pom(vec3 p){ vec3 q=p-vec3(.2,.034,.12);
  float d=length(q*vec3(1.,1.08,1.))-.034;
  vec3 c=q-vec3(0.,.034,0.); float a=atan(c.z,c.x);
  float crown=max(sdCylY(c-vec3(0.,.006,0.),.011+.004*step(.0,cos(a*6.))*smoothstep(0.,.012,c.y),.008),-sdCylY(c-vec3(0.,.012,0.),.007,.01));
  return min(d,crown); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,rollers(p),3.);
  r=U(r,sheet(p),4.);
  r=U(r,lamp(p),5.);
  r=U(r,flame(p),6.);
  r=U(r,pom(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 k=p-vec3(-.02,0.,.1); k.xz=rot(.08)*k.xz; vec3 c=k-vec3(sign(k.x)*RX,0.,0.);
    if(length(c.xz)<.03&&c.y>.03&&c.y<.17) return .82-.25*step(.5,fract(atan(c.z,c.x)*3.));
    return .38+.1*grain(c.zyx,60.); }
  if(id==4.){ vec3 k=p-vec3(-.02,0.,.1); k.xz=rot(.08)*k.xz; float a=.9;
    float col=fract((k.x+RX)/.05); float ci=floor((k.x+RX)/.05);
    if(col>.12&&col<.88&&k.y>.05&&k.y<.15&&ci>=0.&&ci<4.){ float l=fract((k.y-.05)/.0085); if(l<.28) a=.52+.12*step(.55,vn(k.xy*vec2(900.,30.))); }
    return a; }
  if(id==5.) return .5;
  if(id==6.){ vec3 q=lQ(p)-vec3(.058,.04,0.); return q.y<-.0?.6:.97; }
  if(id==7.) return .45;
  return .7; }
