/* U.S. History Unit 9 "Postwar America" (The Box in the Living Room) — pencil still life: a
   1950s television set on four splayed legs, with a rounded screen, two knobs and a
   rabbit-ear antenna, and a small model of a new suburban house. No figures. */
#define CAM_POS vec3(-0.3296,0.5256,-0.9381)
#define CAM_TGT vec3(-0.1711,0.0148,0.1263)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define TV vec3(-.03,0.,.1)
#define HS vec3(.2,0.,-.04)
float tv(vec3 q){
  vec3 c=q-vec3(0,.14,0);
  float cab=sdRBox(c,vec3(.095,.075,.07),.014);
  vec2 s=c.xy-vec2(-.018,0.); float scr=sdBox2(s,vec2(.058,.052))-.014; float face=max(scr,abs(c.z+.07)-.006);
  cab=max(cab,-max(scr,abs(c.z+.072)-.004));
  float glass=max(scr+.002,abs(c.z+.066+.004*(1.-dot(s,s)/.006))-.002);
  float kn=min(length(c-vec3(.07,.025,-.072))-.009,length(c-vec3(.07,-.015,-.072))-.009);
  float grille=sdRBox(c-vec3(.07,-.05,-.07),vec3(.014,.012,.002),.001);
  float legs=1e5; for(int i=0;i<4;i++){ float sx=(i<2)?-1.:1., sz=(i==0||i==2)?-1.:1.;
    legs=min(legs,sdCapsule(q,vec3(sx*.07,.07,sz*.045),vec3(sx*.09,.0,sz*.06),.004)); }
  vec3 a=q-vec3(-.02,.215,.02); float base=length(a*vec3(1.,1.5,1.))-.013;
  float ear1=sdCapsule(a,vec3(0),vec3(-.06,.13,.01),.0018), ear2=sdCapsule(a,vec3(0),vec3(.07,.12,.0),.0018);
  return min(min(min(cab,glass),min(kn,grille)),min(legs,min(base,min(ear1,ear2)))); }
float house(vec3 q){
  float body=sdRBox(q-vec3(0,.03,0),vec3(.06,.03,.04),.002);
  vec3 r=q-vec3(0,.06,0); float roof=max(max(abs(r.x)-.068,dot(vec2(abs(r.z),r.y),normalize(vec2(.5,1.)))-.034),-r.y);
  float door=sdBox(q-vec3(-.02,.018,-.04),vec3(.008,.018,.004)); float win=sdBox(q-vec3(.025,.035,-.04),vec3(.014,.01,.003));
  float gar=sdRBox(q-vec3(.085,.02,.0),vec3(.028,.02,.036),.002);
  float chim=sdBox(q-vec3(-.035,.09,.01),vec3(.007,.02,.007));
  return min(max(min(body,roof),-min(door,win)),min(gar,chim)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,tv(L(p,TV,.25)/1.25)*1.25,3.);
  r=U(r,house(L(p,HS,-.4)),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=L(p,TV,.25)/1.25; vec3 c=q-vec3(0,.14,0); vec2 s=c.xy-vec2(-.018,0.);
    if(c.z<-.06&&sdBox2(s,vec2(.058,.052))-.014<0.){ float g=.58+.25*smoothstep(.07,0.,length(s-vec2(-.02,.02))); return g; }
    if(c.z<-.068&&sdBox2(s,vec2(.058,.052))-.014<.006) return .8;
    if(c.z<-.06&&abs(c.x-.07)<.018&&abs(c.y+.05)<.013) return fract(c.y/.004)<.4?.3:.6;
    if(q.y<.07||q.y>.21) return .35; return .38+.08*grain(q.zyx,40.); }
  if(id==4.){ vec3 q=L(p,HS,-.4); if(q.y>.06&&q.x<.07) return fract(q.y/.008)<.2?.35:.55; return .82; }
  return .7; }
