/* Spanish Unit 12 "Ser, Estar and Describing People" — pencil still life: a brimmed sun hat
   with a band, a pair of folded eyeglasses in front of it, and a striped scarf coiled beside. */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.05,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define HT vec3(.04,0.,.07)
float hat(vec3 p){ vec3 q=p-HT; q.xy=rot(.05)*q.xy; float r=length(q.xz);
  float brim=max(abs(q.y-(.006+.012*smoothstep(.1,.16,r)-.004*smoothstep(.06,.09,r)))-.0025,r-.16);
  float crown=(length((q-vec3(0.,.035,0.))/vec3(.078,.075,.07))-1.)*.07; crown=max(crown,-q.y+.004);
  crown+=.002*smoothstep(.09,.1,q.y)*0.;
  float dent=length(q-vec3(0.,.14,0.))-.04; crown=smax(crown,-dent,.02);
  float band=max(abs(r-.074+.02*0.)-.004,abs(q.y-.03)-.012); band=max(band,(length((q-vec3(0.,.035,0.))/vec3(.082,.075,.074))-1.)*.07);
  return min(min(brim,crown),band); }
vec3 gq(vec3 p){ vec3 q=p-vec3(-.03,0.,-.13); q.xz=rot(-.15)*q.xz; return q; }
float glasses(vec3 p){ vec3 q=gq(p);
  float l1=max(abs(length((q.xy-vec2(-.028,.022))/vec2(1.,.8))*1.-.022)-.0025,abs(q.z)-.002);
  float l2=max(abs(length((q.xy-vec2(.028,.022))/vec2(1.,.8))*1.-.022)-.0025,abs(q.z)-.002);
  float lens=min(max(length((q.xy-vec2(-.028,.022))/vec2(1.,.8))-.021,abs(q.z)-.001),max(length((q.xy-vec2(.028,.022))/vec2(1.,.8))-.021,abs(q.z)-.001));
  float bridge=sdCapsule(q,vec3(-.008,.03,0.),vec3(.008,.03,0.),.002);
  float arm1=sdCapsule(q,vec3(-.05,.028,.002),vec3(.02,.006,.035),.0018);
  float arm2=sdCapsule(q,vec3(.05,.028,.002),vec3(-.015,.005,.04),.0018);
  return min(min(min(l1,l2),lens*1.),min(bridge,min(arm1,arm2))); }
float scarf(vec3 p){ vec3 q=p-vec3(-.2,0.,.02); float d=1e5;
  for(int i=0;i<3;i++){ float fi=float(i); d=min(d,sdTorus(q-vec3(.0,.011+fi*.018,0.),.05-fi*.012,.012)); }
  vec3 t=q-vec3(.03,.01,-.07); t.xz=rot(.5)*t.xz; d=smin(d,sdRBox(t,vec3(.02,.006,.05),.005),.01);
  return d+.001*sin(atan(q.z,q.x)*30.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,hat(p),3.);
  r=U(r,glasses(p),4.);
  r=U(r,scarf(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-HT; float r=length(q.xz); if(q.y>.018&&q.y<.042&&r<.086) return .2; return .8+.06*sin((atan(q.z,q.x)*30.+r*300.)); }  /* woven straw */
  if(id==4.){ vec3 q=gq(p); if(abs(q.z)<.0015&&(length((q.xy-vec2(-.028,.022))/vec2(1.,.8))<.02||length((q.xy-vec2(.028,.022))/vec2(1.,.8))<.02)) return .95; return .2; }
  if(id==5.){ vec3 q=p-vec3(-.2,0.,.02); float a=atan(q.z,q.x); return fract(a*2./PI+q.y*20.)<.5?.35:.8; }
  return .7; }
