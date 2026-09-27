/* Room "True Books and Story Books" — pencil still life: a toy castle tower with a pointed roof
   and a little flag-less spire (a story), standing on a closed book, beside a real fossil shell
   (an ammonite) resting on a second book (something true). */
#define CAM_POS vec3(-0.5743,0.4574,-0.8814)
#define CAM_TGT vec3(-0.2543,0.0458,0.1019)
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
#define TW vec3(-.05,.036,.07)
#define AM vec3(.17,.088,-.02)
float booksD(vec3 p){ return min(bookD(place(p,vec3(-.05,0.,.07),.2),vec3(.11,.018,.08)),bookD(place(p,vec3(.17,0.,-.03),-.3),vec3(.09,.014,.065))); }
float towerD(vec3 p){ vec3 q=p-TW;
  float body=sdCylY(q-vec3(0.,.07,0.),.045,.07)-.002;
  /* crenellations */
  float a=atan(q.z,q.x); float cr=step(.5,fract(a*8./6.2832));
  float top=sdCylY(q-vec3(0.,.15,0.),.052,.012)-.002;
  float notch=max(abs(q.y-.158)-.008,-(cr-.5)); top=max(top,-max(notch,-(q.y-.152)));
  float roof=sdCone(q-vec3(0.,.2,0.),.042,.002,.04);
  float spire=sdCapsule(q,vec3(0.,.24,0.),vec3(0.,.262,0.),.0025);
  float d=min(min(body,top),min(roof,spire));
  /* door and window */
  vec3 e=q-vec3(0.,.0,-.045); float door=max(length(vec2(e.x,max(e.y-.03,0.)))-.017,-e.y); door=max(door,abs(e.z)-.008);
  vec3 w=q-vec3(0.,.1,-.045); float win=max(length(vec2(w.x,max(w.y,0.)))-.008,-w.y+.012); win=max(win,abs(w.z)-.006);
  d=max(d,-door); d=max(d,-win);
  return d; }
float ammD(vec3 p){ vec3 q=place(p,AM,.4); q.yz=rot(-1.2)*q.yz;   /* stood up a little, facing us */
  float r=length(q.xz); float a=atan(q.z,q.x);
  float d=sdEll(q,vec3(.065,.024,.065));
  float s=fract(log(max(r,.002)/.065)/.5-a/6.2832);
  d+=.0025*(1.-smoothstep(.0,.12,min(s,1.-s)))*smoothstep(.004,.012,r);
  return d*.8; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,booksD(p),3.);
  r=U(r,towerD(p),4.);
  r=U(r,ammD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ if(abs(n.y)<.5&&abs(n.x)<.7) return fract(p.y/.003)<.3?.7:.9; return .45; }
  if(id==4.){ vec3 q=p-TW; if(q.y>.162) return .35;
    float bx=fract(q.y/.016+step(.5,fract(q.y/.032))*.5*0.); float bz=fract(atan(q.z,q.x)*10./6.2832+step(.5,fract(q.y/.032))*.5);
    if(bx<.1||bz<.05) return .45; return .8; }
  if(id==5.){ vec3 q=place(p,AM,.4); q.yz=rot(-1.2)*q.yz; float r=length(q.xz); float a=atan(q.z,q.x);
    float s=fract(log(max(r,.002)/.065)/.5-a/6.2832); if(min(s,1.-s)<.06) return .25;
    return fract(a*14./6.2832+log(r)*1.)<.2?.5:.72; }
  return .7; }
