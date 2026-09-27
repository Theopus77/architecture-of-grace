/* Room b16 "Earth's Systems" — pencil still life: a cut-away model of the Earth on a stand,
   one wedge removed to show crust, mantle, outer core and inner core; beside it a rough
   rock and a split geode lined with crystals. */
#define CAM_POS vec3(-0.4112,0.5167,-0.9639)
#define CAM_TGT vec3(-0.2486,-0.0070,0.1275)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
#define GC vec3(0.,.17,.06)
#define GR .11
vec3 gQ(vec3 p){ vec3 q=p-GC; q.xz=rot(.45)*q.xz; return q; }
float globeD(vec3 q){ float d=length(q)-GR; float oct=max(max(q.x,-q.y),q.z); return max(d,-oct); }
float standD(vec3 p){ vec3 q=p-vec3(GC.x,0.,GC.z);
  float base=sdCylY(q-vec3(0.,.008,0.),.075,.006)-.003;
  float neck=sdCylY(q-vec3(0.,.035,0.),.011+.004*sin(q.y*90.),.03);
  float cup=max(abs(length(p-GC)-GR-.004)-.003,p.y-GC.y+GR*.72);
  cup=max(cup,length((p-GC).xz)-.05);
  return min(min(base,neck),cup); }
vec3 rockQ(vec3 p){ return place(p,vec3(.2,.035,-.08),.6); }
float rockD(vec3 q){ return (sdEll(q,vec3(.06,.034,.048))+.024*fbm3(q*22.)+.006*fbm3(q*90.)-.012)*.7; }
vec3 geoQ(vec3 p){ return p-vec3(-.17,.036,-.06); }
#define GN normalize(vec3(-.25,.75,-.6))
float geodeD(vec3 q){
  float s=length(q)-.045+.004*fbm3(q*60.);
  float h=max(s,dot(q,GN));                               /* the cut face looks up and toward us */
  float hollow=length(q)-.031-.006*vn3(q*260.);
  return max(h,-hollow)*.9; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,globeD(gQ(p)),3.);
  r=U(r,standD(p),4.);
  r=U(r,rockD(rockQ(p)),5.);
  r=U(r,geodeD(geoQ(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=gQ(p); float r=length(q);
    if(r<GR-.0025){ float t=r/GR;                         /* the cut faces: the layers */
      if(abs(t-.36)<.012||abs(t-.62)<.012||abs(t-.93)<.01) return .15;
      if(t<.36) return .3; if(t<.62) return .5; if(t<.93) return .74+.08*fbm(q.xy*80.+q.z*50.); return .4; }
    vec3 d=normalize(q); float lat=asin(d.y), lon=atan(d.z,d.x);
    float land=fbm(vec2(lon*1.6,lat*2.2)+vec2(3.1,1.7))-.5+.12*cos(lat*2.);
    if(abs(land)<.012) return .25; return land>0.?.6:.88; }
  if(id==4.) return .42+.1*grain(p,40.);
  if(id==5.) return .55+.25*fbm3(p*70.);
  if(id==6.){ vec3 q=geoQ(p); float r=length(q);
    if(r<.034) return .35+.5*vn3(q*260.); if(dot(q,GN)>-.002&&r<.042) return .8; return .5+.2*fbm3(q*80.); }
  return .7; }
