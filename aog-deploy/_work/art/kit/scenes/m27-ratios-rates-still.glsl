/* Room m27 "Ratios, Rates and Unit Rates" — pencil still life: a glass pitcher of juice behind
   a wooden tray that holds one batch of the mix: two glasses of juice and three glasses of
   water in a row (a ratio of 2 to 3). */
#define CAM_POS vec3(-0.4030,0.3800,-0.7959)
#define CAM_TGT vec3(-0.1760,-0.0204,0.1244)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define GR .026
#define GH .092
vec3 trayQ(vec3 p){ return place(p,vec3(.0,0.,-.04),.05); }
float trayD(vec3 q){
  float o=sdRBox(q-vec3(0.,.008,0.),vec3(.18,.008,.046),.004);
  float i=sdBox(q-vec3(0.,.014,0.),vec3(.172,.008,.038));
  float d=max(o,-i);
  vec3 h=vec3(abs(q.x)-.188,q.y-.01,q.z);            /* two handles at the ends */
  d=min(d,max(sdRBox(h,vec3(.012,.006,.022),.004),-sdRBox(h-vec3(.001,0.,0.),vec3(.006,.02,.014),.003)));
  return d; }
/* a straight tumbler with a thick base, base at y=0 */
float tumbler(vec3 q){
  float o=sdCone(q-vec3(0.,GH*.5,0.),GR*.86,GR,GH*.5)-.0012;
  float i=sdCone(q-vec3(0.,GH*.5+.008,0.),GR*.86-.003,GR-.003,GH*.5);
  return min(max(o,-i),sdTorus(q-vec3(0.,GH,0.),GR-.0012,.0016)); }
float glassX(int k){ return -.136+float(k)*.068; }
vec2 glassesD(vec3 q){ vec2 r=vec2(1e3,0.);
  float kx=clamp(floor((q.x+.17)/.068),0.,4.);
  vec3 c=q-vec3(glassX(int(kx)),.008,0.);
  float d=tumbler(c);
  /* liquid surface inside each glass */
  float lv=sdCylY(c-vec3(0.,.036,0.),GR*.93-.003,.028);
  return vec2(min(d,lv),kx); }
/* the pitcher: a bellied jug with a spout on -x and a loop handle on +x */
vec3 jugQ(vec3 p){ return place(p,vec3(.27,0.,.1),-.45); }
float jugD(vec3 q){
  float y=q.y; float r=length(q.xz);
  float prof=.052+.012*sin(clamp(y/.19,0.,1.)*3.1)-.008*smoothstep(.13,.19,y);
  float body=max(max(r-prof,-y),y-.19)*.9-.002;
  body=max(body,-max(r-prof+.004,-(y-.012)));
  float sp=sdCapsule(q,vec3(-.035,.17,0.),vec3(-.068,.192,0.),.013); sp=max(sp,-sdCapsule(q,vec3(-.035,.175,0.),vec3(-.075,.198,0.),.009));
  sp=max(sp,q.y-.197);
  float d=min(body,sp);
  d=min(d,sdTorus(q-vec3(0.,.19,0.),prof+.0005,.0022));
  vec3 h=q-vec3(.062,.105,0.); float hd=length(vec2(length(h.xy*vec2(1.,.72))-.042,h.z))-.0065;
  hd=max(hd,-(q.x-.048)); d=min(d,hd);
  float juice=sdCylY(q-vec3(0.,.07,0.),prof-.004,.06);
  return min(d,juice); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,3.-p.z,2.);
  vec3 t=trayQ(p);
  r=U(r,trayD(t),3.);
  if(abs(t.x)<.19&&abs(t.z)<.046&&t.y<.12){ vec2 g=glassesD(t); r=U(r,g.x,g.y<1.5?4.:5.); }
  else r=U(r,sdBox(t-vec3(0.,.05,0.),vec3(.17,.055,.03)),4.);
  r=U(r,jugD(jugQ(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=trayQ(p); return .5+.14*grain(q,24.); }
  if(id==4.||id==5.){ vec3 q=trayQ(p); float kx=clamp(floor((q.x+.17)/.068),0.,4.);
    vec3 c=q-vec3(glassX(int(kx)),.008,0.); float lvl=.064;
    if(abs(c.y-lvl)<.0012) return .25;                 /* the liquid line on the glass */
    if(id==4.) return c.y<lvl?.26:.88;                 /* juice is dark */
    return .9; }                           /* water is clear */
  if(id==6.){ vec3 q=jugQ(p); if(abs(q.y-.13)<.0015) return .25; return q.y<.13&&q.y>.006?.34:.86; }
  return .7; }
