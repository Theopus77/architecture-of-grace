/* Practice room "The World's Regions" — pencil still life: a globe resting in a low ring cradle,
   a small cactus in a clay pot (a dry region), and a scallop seashell (a coast): different lands,
   different ways of life. */
#define CAM_POS vec3(-0.3509,0.3483,-0.6936)
#define CAM_TGT vec3(-0.2311,-0.0374,0.1100)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define GLB vec3(0.,0.,.06)
#define GR .085
#define CAC vec3(-.23,0.,-.02)
#define SHL vec3(.1,0.,-.1)
float cradleD(vec3 q){ float d=sdTorus(q-vec3(0.,.03,0.),.06,.006);
  for(int i=0;i<3;i++){ float a=float(i)*2.094+.3; d=min(d,sdCapsule(q,vec3(cos(a)*.06,.03,sin(a)*.06),vec3(cos(a)*.07,.0,sin(a)*.07),.005)); } return d; }
vec3 gq(vec3 q){ vec3 g=q-vec3(0.,.03+sqrt(GR*GR-.06*.06),0.); g.xz=rot(1.2)*g.xz; g.xy=rot(.3)*g.xy; return g; }
float globeD(vec3 q){ return length(gq(q))-GR; }
float cactusD(vec3 q){ float a=atan(q.z,q.x); float rib=.003*abs(sin(a*5.));
  float d=sdCapsule(q,vec3(0.,.06,0.),vec3(0.,.15,0.),.026)-rib;
  d=smin(d,sdCapsule(q,vec3(.02,.1,0.),vec3(.045,.1,0.),.011),.008); d=smin(d,sdCapsule(q,vec3(.045,.1,0.),vec3(.047,.13,0.),.011)-rib*.5,.006);
  d=smin(d,sdCapsule(q,vec3(-.02,.085,0.),vec3(-.04,.085,.005),.009),.007); d=smin(d,sdCapsule(q,vec3(-.04,.085,.005),vec3(-.042,.108,.005),.009)-rib*.5,.005);
  return d*.9; }
vec3 shQ(vec3 p){ vec3 q=p-SHL; q.xz=rot(2.6)*q.xz; return q/1.5; }
float shellD(vec3 q){ vec2 u=q.xz-vec2(0.,-.03); float r=length(u); float a=atan(u.x,u.y);
  float R=.055*(1.-.0*abs(a)); float fan=max(r-R,abs(a)-1.1);
  float h=.018*(1.-r/R)*(1.-r/R)*0.+.016*sqrt(max(1.-r/R,0.))+.0015*abs(sin(a*16.))*smoothstep(.01,.04,r);
  float d=max(fan,q.y-h); d=max(d,-q.y);
  d=min(d,sdRBox(q-vec3(0.,.004,-.035),vec3(.018,.004,.006),.002));
  return d*.7; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=p-GLB;
  r=U(r,cradleD(q),3.);
  r=U(r,globeD(q),4.);
  vec3 c=p-CAC;
  r=U(r,potD(c,.042,.075),5.);
  r=U(r,cactusD(c),6.);
  r=U(r,shellD(shQ(p))*1.5,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.){ vec3 g=gq(p-GLB); float lon=atan(g.z,g.x), lat=asin(clamp(g.y/GR,-1.,1.));
    float land=fbm(vec2(lon*1.4,lat*2.6)+7.1); if(abs(lat)<.012) return .5; return land>.47?.42:.86; }
  if(id==5.){ vec3 c=p-CAC; if(c.y>.075*.86&&c.y<.075*.88) return .4; return .62; }
  if(id==6.){ vec3 c=p-CAC; float a=atan(c.z,c.x); if(abs(sin(a*5.))<.15) return .3; if(fract(c.y/.012+a)<.08) return .25; return .5; }
  if(id==7.){ vec3 q=shQ(p); vec2 u=q.xz-vec2(0.,-.03); float a=atan(u.x,u.y); return abs(sin(a*16.))<.3?.55:.85; }
  return .7; }
