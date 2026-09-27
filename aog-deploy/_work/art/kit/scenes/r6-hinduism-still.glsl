/* r6 "Hinduism: Dharma, Karma and the Gita" — a lotus flower floating in a shallow brass bowl,
   a small clay diya lamp with its flame, and a brass hand bell. Objects only. */
#define CAM_POS vec3(-0.3398,0.2188,-0.5394)
#define CAM_TGT vec3(-0.1383,0.0043,0.0915)
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
#define BW vec3(-.04,0.,.08)
float bowl(vec3 p){ vec3 q=p-BW;
  vec3 c=q-vec3(0.,.12,0.); float s=length(c)-.125; s=abs(s)-.003; s=max(s,q.y-.035);
  return s; }
float water(vec3 p){ vec3 q=p-BW; return max(q.y-.028,length(q-vec3(0.,.12,0.))-.122); }
float petal(vec3 q,float a,float tilt,float L,float W){ q.xz=rot(a)*q.xz; q.xy=rot(tilt)*q.xy;
  vec3 k=q-vec3(L*.5,0.,0.); float d=sdEll(k,vec3(L*.5,.004,W));
  float tip=max(k.x,0.)/(L*.5); d=max(d,abs(k.z)-W*(1.-tip*tip*.9));
  return d; }
float lotus(vec3 p){ vec3 q=(p-BW-vec3(0.,.028,0.))/1.5; float d=1e5;
  if(length(q)>.1) return (length(q)-.08)*1.5;
  for(int i=0;i<8;i++){ float a=float(i)*.785; d=min(d,petal(q,a,.35,.06,.017)); }
  for(int i=0;i<6;i++){ float a=float(i)*1.047+.4; d=min(d,petal(q-vec3(0.,.006,0.),a,.85,.05,.014)); }
  for(int i=0;i<5;i++){ float a=float(i)*1.257+.2; d=min(d,petal(q-vec3(0.,.012,0.),a,1.25,.04,.012)); }
  d=min(d,sdCylY(q-vec3(0.,.02,0.),.012,.006)-.002);
  return d*1.5; }
float pads(vec3 p){ vec3 q=p-BW-vec3(.06,.028,-.04); float d=sdCylY(q,.028,.0012);
  float a=atan(q.z,q.x); d=max(d,-max(abs(a+.8)-.15,-length(q.xz)+.0)); return d; }
#define DY vec3(.1,0.,-.1)
float diya(vec3 p){ vec3 q=place(p,DY,.3);
  float w=.032*(1.-.55*smoothstep(-.005,.045,q.x));                 /* narrows to a lip at +x */
  vec3 c=q-vec3(0.,.034,0.); float s=length(vec3(c.x/1.35,c.y,c.z*.032/max(w,.008)))-.034;
  s=abs(s)-.003; s=max(s,q.y-.024);
  float oil=max(length(vec3(c.x/1.35,c.y,c.z*.032/max(w,.008)))-.031,q.y-.018);
  return min(s,oil); }
float flame(vec3 p){ vec3 q=place(p,DY,.3)-vec3(.04,.028,0.); float k=clamp(q.y/.034,0.,1.);
  float r=.0065*sin(3.1416*pow(k,.6))+.0004;
  float f=length(q.xz)-r; return max(f,max(-q.y,q.y-.034))*.8; }
#define BL vec3(.15,0.,.15)
float bell(vec3 p){ vec3 q=p-BL; float y=q.y;
  float r=.034-.012*smoothstep(.0,.06,y)+.004*smoothstep(.004,0.,y);
  float b=max(abs(length(q.xz)-r*.95)-.003,max(-y,y-.065));
  b=min(b,sdCylY(q-vec3(0.,.066,0.),.022,.003));
  float h=sdCylY(q-vec3(0.,.1,0.),.006+.002*sin(y*300.),.03);
  float top=sdEll(q-vec3(0.,.138,0.),vec3(.01,.014,.01));
  return min(b,min(h,top)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bowl(p),3.);
  r=U(r,water(p),4.);
  r=U(r,lotus(p),5.);
  r=U(r,pads(p),6.);
  r=U(r,diya(p),7.);
  r=U(r,flame(p),8.);
  r=U(r,bell(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .55;
  if(id==4.) return .6;
  if(id==5.) return .92;
  if(id==6.) return .45;
  if(id==7.) return .45;
  if(id==8.){ vec3 q=place(p,DY,.3)-vec3(.04,.028,0.); return q.y<.008?.55:.97; }
  if(id==9.){ vec3 q=p-BL; if(abs(q.y-.02)<.002||abs(q.y-.045)<.0015) return .3; return .6; }
  return .7; }
