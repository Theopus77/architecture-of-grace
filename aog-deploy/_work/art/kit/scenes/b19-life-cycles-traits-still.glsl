/* Room "Life Cycles and Traits" — pencil still life: a seedling growing in a clay pot, a hen's
   egg in an egg cup, and two bean seeds on the table (seed, sprout, egg: life begins again). */
#define CAM_POS vec3(-0.4707,0.2993,-0.7881)
#define CAM_TGT vec3(-0.2007,0.0292,0.0804)
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
#define POT vec3(-.04,0.,.07)
#define CUP vec3(.17,0.,-.01)
float potD(vec3 p){ vec3 q=p-POT;
  float outer=sdCone(q-vec3(0.,.045,0.),.048,.064,.045)-.002;
  float inner=sdCone(q-vec3(0.,.056,0.),.041,.057,.045);
  float d=max(outer,-inner);
  float rim=sdCone(q-vec3(0.,.1,0.),.071,.074,.013)-.002; rim=max(rim,-(length(q.xz)-.062));
  return min(d,rim); }
float soilD(vec3 p){ vec3 q=p-POT; return max(length(q.xz)-.066,abs(q.y-.09)-.006+.002*fbm(q.xz*80.)); }
float leaf(vec3 q,vec3 c,float ang,float tilt,vec2 sz){ vec3 l=q-c; float bs=length(l)-2.2*sz.x; if(bs>.01) return bs; l.xz=rot(ang)*l.xz; l.xy=rot(tilt)*l.xy;
  l.x-=sz.x; l.y+=.25*min(l.x*l.x,4.*sz.x*sz.x)/sz.x; return sdEll(l,vec3(sz.x,.0016,sz.y))*.5; }
float plantD(vec3 p){ vec3 q=p-POT;
  float bend=.012*sin(q.y*18.);
  float stem=sdCapsule(q-vec3(bend,0.,0.),vec3(0.,.09,0.),vec3(0.,.2,0.),.0032);
  vec3 top=vec3(.012*sin(.2*18.),.2,0.);
  float d=stem;
  d=min(d,leaf(q,vec3(.004,.14,0.),0.,.35,vec2(.022,.012)));
  d=min(d,leaf(q,vec3(-.004,.14,0.),PI,.35,vec2(.022,.012)));
  d=min(d,leaf(q,top,.5,.55,vec2(.045,.022)));
  d=min(d,leaf(q,top,.5+PI,.5,vec2(.042,.02)));
  d=min(d,leaf(q,top+vec3(0.,.004,0.),2.1,.9,vec2(.022,.011)));
  return d; }
float eggCup(vec3 p){ vec3 q=p-CUP;
  float foot=sdCylY(q-vec3(0.,.006,0.),.034,.004)-.002;
  float stemc=sdCylY(q-vec3(0.,.022,0.),.012+.006*smoothstep(.03,.012,q.y),.014);
  vec3 b=q-vec3(0.,.058,0.);
  float bowl=max(abs(length(b)-.03)-.003,b.y); bowl=max(bowl,-b.y-.03);
  bowl=min(bowl,max(sdTorus(b,.03,.0035),0.));
  return smin(min(foot,stemc),bowl,.006); }
float eggD(vec3 p){ vec3 q=p-CUP-vec3(0.,.073,0.); q.y*=.78; float d=length(q)-.026-.004*q.y/.026; return d*.78; }
float beanD(vec3 p,vec3 c,float a){ vec3 q=place(p,c,a); q.z+=.12*q.x*q.x/.02*.02; return sdEll(q,vec3(.021,.009,.013))*.7; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,potD(p),3.);
  r=U(r,soilD(p),4.);
  r=U(r,plantD(p),5.);
  r=U(r,eggCup(p),6.);
  r=U(r,eggD(p),7.);
  r=U(r,min(beanD(p,vec3(.07,.0088,-.12),.5),beanD(p,vec3(.115,.0088,-.14),-.4)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-POT; if(q.y>.084) return .5; return .42+.08*fbm(q.xy*60.); }
  if(id==4.) return .25;
  if(id==5.){ vec3 q=p-POT; if(q.y<.13&&length(q.xz)<.006) return .4; return .48; }
  if(id==6.) return .85;
  if(id==7.) return .88;
  if(id==8.){ return .35; }
  return .7; }
