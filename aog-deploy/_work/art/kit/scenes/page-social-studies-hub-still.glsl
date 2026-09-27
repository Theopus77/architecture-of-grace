/* Social Studies hub page — pencil still life: a tilted desk globe on a wooden stand with its
   half-meridian, a rolled map tied with string, a map sheet with curled ends, and a few old
   coins. */
#define CAM_POS vec3(-0.6382,0.4089,-1.0054)
#define CAM_TGT vec3(-0.2923,0.0213,0.1021)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "ssceco.glsl"
#define GB vec3(-.02,0.,.1)
#define GR .085
#define GC (GB+vec3(0.,.2,0.))
#define TILT .41
#define SPIN -1.6
#define MP vec3(.17,0.,-.08)
#define RL vec3(-.19,.023,-.04)
#define CN vec3(-.1,0.,-.13)
float globeBall(vec3 p){ return length(p-GC)-GR; }
float globeStand(vec3 p){ vec3 q=p-GB;
  float base=sdCylY(q-vec3(0.,.008,0.),.07,.008)-.003;
  float base2=sdCylY(q-vec3(0.,.02,0.),.04,.006)-.003;
  float stem=sdCone(q-vec3(0.,.055,0.),.013,.008,.035);
  /* half meridian ring: in a plane through the tilted axis, turned to show on the right */
  vec3 c=p-GC; c.xy=rot(TILT)*c.xy; vec3 e=c; e.xz=rot(-.9)*e.xz;
  float ring=max(max(abs(length(e.xy)-GR-.009)-.0045,abs(e.z)-.003)-.0008,-e.x);
  float pin=sdCapsule(c,vec3(0.,-GR-.016,0.),vec3(0.,GR+.016,0.),.0028);
  vec3 bot=GC-GB+vec3(sin(TILT),-cos(TILT),0.)*(GR+.012);
  float arm=sdCapsule(q,vec3(0.,.085,0.),bot,.005);
  return min(min(min(base,base2),min(stem,ring)),min(pin,arm)); }
float globeT(vec3 p){ vec3 q=globeQ(p,GC,TILT,SPIN); vec3 d=normalize(q);
  float m=smoothstep(.5,.53,fbm3(d*1.9+vec3(3.1,1.7,.4))+.06*d.y);
  float lat=asin(d.y), lon=atan(d.z,d.x);
  if(abs(fract(lat/(PI/6.)+.5)-.5)<.012||abs(fract(lon/(PI/6.)+.5)-.5)<.01) return m>.5?.35:.6;
  return m>.5?.4:.86; }
/* rolled map lying along x, tied with a string */
vec3 rq(vec3 p){ return P(p,RL,-.5); }
float rollD(vec3 q){ float body=sdCylX(q,.022,.12)-.001;
  float core=sdCylX(q,.007,.102);
  body=max(body,-max(length(q.yz)-.006,abs(q.x)-.2));
  float tie=sdTorus((q-vec3(.03,0.,0.)).yxz,.0228,.0018);
  return min(body,tie); }
float rollT(vec3 q){ if(abs(q.x)>.119){ float r=length(q.yz); return fract(r/.0035)<.35?.35:.85; }
  if(abs(q.x-.03)<.003) return .3; return .82; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,globeBall(p),3.);
  r=U(r,globeStand(p),4.);
  r=U(r,mapS(P(p,MP,.3),.12,.08),5.);
  r=U(r,rollD(rq(p)),6.);
  vec3 c=P(p,CN,0.);
  float cs=coinStack(c,.02,.0018,5,3.);
  float c1=coinD(c-vec3(.052,.0018,-.02),.021,.0018);
  float c2=1e3;
  r=U(r,min(cs,min(c1,c2)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return globeT(p);
  if(id==4.){ vec3 q=p-GB; if(q.y<.03) return .35+.1*grain(q,40.); return .5; }
  if(id==5.) return mapT(P(p,MP,.3));
  if(id==6.) return rollT(rq(p));
  if(id==7.){ vec3 c=p-CN; float rr=length(fract((c.xz+.5)*1.)-.5);
    if(n.y>.8){ float a=length(c.xz-vec2(.052,-.02)); float b=length(c.xz);
      float r0=min(a,b); if(abs(r0-.015)<.0009||abs(r0-.005)<.0012) return .3; }
    return .6; }
  return .7; }
