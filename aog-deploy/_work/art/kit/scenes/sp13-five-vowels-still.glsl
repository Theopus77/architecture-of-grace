/* sp13 "Five Vowels That Never Change" — five wooden letter blocks carved A, E, I, O and U,
   set in a gentle arc, with a small hand bell beside them (each vowel rings one clear sound). */
#define CAM_POS vec3(-0.3551,0.2167,-0.5301)
#define CAM_TGT vec3(-0.1554,0.0033,0.0967)
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
vec3 bc(int i){ float fi=float(i); return vec3(-.17+fi*.085,BH,.07-fi*.035+.012*pow(fi-2.,2.)); }
float br(int i){ return -.3+(float(i)-2.)*.08; }
float block(vec3 p,int i){ vec3 q=p-bc(i); q.xz=rot(br(i))*q.xz;
  float d=sdRBox(q,vec3(BH),.005); if(d>.02) return d;
  return carveV(d,q.xy,vg(i),.058,.0045,q.z+BH,.0035); }
float blocks(vec3 p){ float d=1e5; for(int i=0;i<5;i++) d=min(d,block(p,i)); return d; }
#define BL vec3(-.1,0.,.2)
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
