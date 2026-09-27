/* s13 "The World Before 1500" — a clay amphora on a ring stand, a small wooden trading ship
   with one square sail, and a clay tablet with rows of pressed marks. */
#define CAM_POS vec3(-0.5102,0.3101,-0.7628)
#define CAM_TGT vec3(-0.2280,0.0091,0.1217)
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
#define AM vec3(-.06,0.,.14)
float amph(vec3 p){ vec3 q=p-AM; float y=q.y;
  float r=.012+.05*sin(clamp((y-.03)/.17,0.,1.)*2.9)*smoothstep(.02,.06,y)+.008*smoothstep(.2,.215,y)*step(y,.225);
  r=max(r,.012);
  float b=max(length(q.xz)-r,max(-y+.025,y-.225))*.8;
  float tip=sdCone(q-vec3(0.,.02,0.),.004,.014,.012);
  b=min(b,tip);
  for(int s=0;s<2;s++){ float sx=s==0?-1.:1.; vec3 h=q-vec3(sx*.028,.19,0.);
    float hd=max(length(vec2(length(h.xy-vec2(sx*.0,0.))-.022,h.z))-.005,-sx*h.x-.0); b=min(b,hd); }
  b=max(b,-sdCylY(q-vec3(0.,.23,0.),.009,.02));
  float stand=max(sdTorus(q-vec3(0.,.012,0.),.03,.006),-1.);
  stand=min(stand,sdTorus(q-vec3(0.,.004,0.),.04,.004));
  return min(b,stand); }
vec3 shQ(vec3 p){ return place(p,vec3(.15,0.,.02),.4); }
float ship(vec3 p){ vec3 q=shQ(p);
  float x=q.x; float w=.03*sqrt(max(1.-pow(abs(x)/.1,2.),0.)); w=max(w,.001);
  float hull=max(max(abs(q.z)-w*(.6+.4*smoothstep(0.,.03,q.y)),abs(q.y-.022)-.022),abs(x)-.1);
  hull=max(hull,-(sdBox(q-vec3(0.,.05,0.),vec3(.09,.012,max(w-.004,.0)))));
  hull=max(hull,q.y-.035-.02*pow(abs(x)/.1,3.)); hull=max(hull,.03*pow(abs(x)/.1,2.)-q.y);
  float mast=sdCylY(q-vec3(0.,.1,0.),.0025,.075);
  float yard=sdCylZ(q-vec3(0.,.155,0.),.0018,.045); yard=sdCapsule(q,vec3(0.,.155,-.045),vec3(0.,.155,.045),.0018);
  vec3 s=q-vec3(.004,.11,0.); float bulge=.006*(1.-pow(s.z/.042,2.))*(1.-pow((s.y)/.045,2.));
  float sail=sdBox(s-vec3(bulge,0.,0.),vec3(.0008,.045,.042));
  return min(hull*.9,min(mast,min(yard,sail))); }
vec3 tQ(vec3 p){ vec3 q=p-vec3(.06,.0,-.1); q.xz=rot(.25)*q.xz; return q; }
float tablet(vec3 p){ vec3 q=tQ(p); float d=sdRBox(q-vec3(0.,.008,0.),vec3(.045,.008,.032),.006);
  return d+.0008*fbm(q.xz*200.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,amph(p),3.);
  r=U(r,ship(p),4.);
  r=U(r,tablet(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-AM; if(q.y<.018) return .4; if(abs(q.y-.1)<.004||abs(q.y-.16)<.003) return .35; return .6; }
  if(id==4.){ vec3 q=shQ(p); if(abs(q.x)<.002&&q.y>.06&&q.y<.16&&abs(q.z)>.004) return .9; if(q.y>.06&&abs(q.z)<.043&&q.y<.16&&abs(q.x)<.012) return .9; if(q.y<.045&&fract(q.y/.008)<.2) return .35; return .5; }
  if(id==5.){ vec3 q=tQ(p); if(n.y>.7&&abs(q.x)<.036&&abs(q.z)<.024){ float row=fract((q.z+.024)/.009); float col=fract((q.x+.036)/.006+floor((q.z+.024)/.009)*.37);
      if(row>.3&&row<.7&&col<.4&&h1(floor(vec2((q.x+.036)/.006,(q.z+.024)/.009)))>.25) return .3; }
    return .6; }
  return .7; }
