/* sp13 "Five Vowels That Never Change" — five wooden letter blocks carved A, E, I, O and U,
   stacked in a small pyramid, with a small hand bell beside them (each vowel rings one clear sound). */
#define CAM_POS vec3(-0.2406,0.1944,-0.4624)
#define CAM_TGT vec3(-0.0701,0.0122,0.0725)
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
#define BH .036
int vg(int i){ return i==0?65:i==1?69:i==2?73:i==3?79:85; }
vec3 bc(int i){ float fi=float(i); if(i<3) return vec3(-.08+fi*.078,BH,.02-fi*.012); return vec3(-.041+(fi-3.)*.078,3.*BH+.001,.014-(fi-3.)*.012); }
float br(int i){ return i==0?-.1:i==1?.04:i==2?-.05:i==3?.08:-.06; }
float block(vec3 p,int i){ vec3 q=p-bc(i); q.xz=rot(br(i))*q.xz;
  float d=sdRBox(q,vec3(BH),.005); if(d>.02) return d;
  return carveV(d,q.xy,vg(i),.058,.0045,q.z+BH,.0035); }
float blocks(vec3 p){ float d=1e5; for(int i=0;i<5;i++) d=min(d,block(p,i)); return d; }
#define BL vec3(.19,0.,-.06)
float bell(vec3 p){ vec3 q=p-BL; float y=q.y;
  float r=.03-.01*smoothstep(.0,.05,y)+.004*smoothstep(.004,0.,y);
  float b=max(abs(length(q.xz)-r*.95)-.003,max(-y,y-.055));
  b=min(b,sdCylY(q-vec3(0.,.056,0.),.019,.003));
  float h=sdCylY(q-vec3(0.,.085,0.),.0055+.002*sin(y*300.),.026);
  float top=sdEll(q-vec3(0.,.118,0.),vec3(.009,.012,.009));
  return min(b,min(h,top)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  for(int i=0;i<5;i++) r=U(r,block(p,i),3.+float(i));
  r=U(r,bell(p),8.);
  return r; }
float inkB(vec3 p,int i){ vec3 q=p-bc(i); q.xz=rot(br(i))*q.xz;
  if(q.z<-BH+.006&&glyphV(q.xy/.058,vg(i))*.058<.0065) return .15;
  vec2 f=q.z<-BH+.003?q.xy:q.x>BH-.003?vec2(q.z,q.y):q.xz;
  if(abs(max(abs(f.x),abs(f.y))-BH*.84)<.0018) return .45;
  return .78; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id>=3.&&id<=7.) return inkB(p,int(id-3.));
  if(id==8.){ vec3 q=p-BL; if(abs(q.y-.018)<.002) return .3; return .6; }
  return .7; }
