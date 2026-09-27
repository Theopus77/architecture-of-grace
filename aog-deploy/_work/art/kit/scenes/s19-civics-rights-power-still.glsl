/* Room "Civics: Rights, Power and Participation" — pencil still life: a small model of a
   courthouse front (steps, six columns, a triangular pediment), and a rolled charter tied with
   a ribbon. */
#define CAM_POS vec3(-0.4220,0.3010,-0.7026)
#define CAM_TGT vec3(-0.1788,0.0059,0.0618)
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
#define CH vec3(-.03,0.,.08)
vec3 chQ(vec3 p){ return place(p,CH,.3); }
float courtD(vec3 p){ vec3 q=chQ(p);
  float d=1e5;
  for(int i=0;i<3;i++){ float fi=float(i); d=min(d,sdBox(q-vec3(0.,.005+fi*.01,-.01*fi+.01),vec3(.12-fi*.008,.005,.07-fi*.006))); }  /* three steps */
  float y0=.03, H=.1;
  /* six fluted columns with capitals */
  for(int i=0;i<6;i++){ float x=-.085+float(i)*.034; vec3 c=q-vec3(x,y0+H*.5,-.03);
    float col=sdCylY(c,.0085-.0015*(c.y/H+.5),H*.5); col+=.0006*smoothstep(.4,.9,abs(sin(atan(c.z,c.x)*8.)));
    col=min(col,sdRBox(c-vec3(0.,H*.5-.003,0.),vec3(.012,.003,.012),.001));
    d=min(d,col); }
  /* back wall block, entablature, pediment */
  d=min(d,sdBox(q-vec3(0.,y0+H*.5,.03),vec3(.1,H*.5,.03)));
  d=min(d,sdRBox(q-vec3(0.,y0+H+.008,0.),vec3(.108,.008,.056),.001));
  vec3 t=q-vec3(0.,y0+H+.016,0.); float ped=max(max(t.y*1.,abs(t.x)*.36+t.y-.036),-t.y);
  ped=max(max(abs(t.x)*.42+t.y-.045,-t.y),abs(t.z)-.056);
  d=min(d,ped);
  return d; }
vec3 rlQ(vec3 p){ vec3 q=p-vec3(.12,.02,-.1); q.xz=rot(-.4)*q.xz; return q; }
float charterD(vec3 p){ vec3 q=rlQ(p); float roll=sdCylX(q,.02,.085)-.001;
  float edge=sdBox(q-vec3(0.,-.0185,-.035),vec3(.08,.0012,.035));
  return min(roll,edge); }
float ribbonD(vec3 p){ vec3 q=rlQ(p); float band=max(abs(length(q.yz)-.0215)-.0014,abs(q.x)-.005);
  float bow=min(sdEll(q-vec3(-.008,.022,-.004),vec3(.007,.003,.005)),sdEll(q-vec3(.008,.022,-.004),vec3(.007,.003,.005)));
  float tail=sdRBox(q-vec3(.004,.004,-.03),vec3(.0025,.001,.014),.0008);
  return min(band,min(bow,tail)); }
vec3 qlQ(vec3 p){ vec3 q=p-vec3(.15,.004,.05); q.xz=rot(.9)*q.xz; return q; }
float quillD(vec3 p){ vec3 q=qlQ(p);
  float shaft=sdCapsule(q,vec3(-.09,0.,0.),vec3(.1,.01,0.),.002);
  vec3 v=q-vec3(.03,.006,0.); float half_=.011*pow(sin(clamp((v.x+.07)/.16,0.,1.)*3.1416),.6);
  float vane=max(max(abs(v.z-.002)-half_,abs(v.y)-.0012),abs(v.x-.01)-.08);
  return min(shaft,vane*.8); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,courtD(p),3.);
  r=U(r,charterD(p),4.);
  r=U(r,ribbonD(p),5.);

  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=chQ(p); if(q.z>0.&&q.y>.03&&q.y<.13){ if(abs(q.x)<.018&&q.y<.1&&q.z<.002) return .3; } return .85; }
  if(id==4.) return .88;
  if(id==5.) return .35;
  if(id==6.){ vec3 q=qlQ(p); if(abs(q.z)<.0025) return .45; return fract(q.x/.006+abs(q.z)*30.)<.3?.62:.9; }
  return .7; }
