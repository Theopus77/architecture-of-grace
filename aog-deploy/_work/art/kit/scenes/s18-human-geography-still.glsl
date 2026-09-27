/* Practice room "Human Geography" — pencil still life: a square wooden tray (an area) with
   little wooden houses crowded into one corner and only one house in the rest (people per
   area: density), and a small travelling case standing beside it (people move). */
#define CAM_POS vec3(-0.3038,0.1613,-0.7013)
#define CAM_TGT vec3(-0.1523,-0.0348,0.0829)
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
/* the tray: a board with a low rim, centred at TR, half size TS */
#define TR vec3(0.,0.,.04)
#define TS vec2(.2,.16)
vec3 tq(vec3 p){ vec3 q=p-TR; q.xz=rot(.12)*q.xz; return q; }
float trayD(vec3 q){
  float base=sdRBox(q-vec3(0.,.006,0.),vec3(TS.x,.006,TS.y),.002);
  float rim=max(sdRBox(q-vec3(0.,.013,0.),vec3(TS.x,.013,TS.y),.002),-sdBox(q-vec3(0.,.02,0.),vec3(TS.x-.009,.02,TS.y-.009)));
  return min(base,rim); }
/* a small house: a box with a pitched roof along local x. q at the middle of its base */
float houseBody(vec3 q,vec3 s){ return sdRBox(q-vec3(0.,s.y,0.),s,.0015); }
float houseRoof(vec3 q,vec3 s){ float rh=s.z*.85;
  float t=sdTri2(q.zy-vec2(0.,2.*s.y),vec2(-s.z-.004,0.),vec2(s.z+.004,0.),vec2(0.,rh));
  return extrude(t,q.x,s.x+.004,.0012); }
/* houses: position (x,z in tray space), turn, size */
#define NH 9
vec4 hp(int i){
  if(i==0) return vec4(-.15,.105,.1,0.);
  if(i==1) return vec4(-.083,.11,-.08,1.);
  if(i==2) return vec4(-.016,.105,.05,0.);
  if(i==3) return vec4(-.15,.04,-.05,1.);
  if(i==4) return vec4(-.083,.045,.1,2.);
  if(i==5) return vec4(-.15,-.025,.08,0.);
  if(i==6) return vec4(-.016,.04,-.06,1.);
  if(i==7) return vec4(-.083,-.02,-.04,0.);
  return vec4(.12,-.085,.3,2.); }
vec3 hs(float k){ return (k<.5?vec3(.02,.016,.016):(k<1.5?vec3(.018,.02,.015):vec3(.022,.013,.017)))*1.4; }
vec2 houses(vec3 q){ float b=1e5,r=1e5;
  for(int i=0;i<NH;i++){ vec4 h=hp(i); vec3 c=q-vec3(h.x,.012,h.y); c.xz=rot(h.z)*c.xz; vec3 s=hs(h.w);
    b=min(b,houseBody(c,s)); r=min(r,houseRoof(c,s)); }
  return vec2(b,r); }
/* a small travelling case standing on its long edge, handle on top */
#define SC vec3(.3,0.,.06)
vec3 sq(vec3 p){ vec3 q=p-SC; q.xz=rot(-.45)*q.xz; return q/.72; }
float caseD(vec3 q){
  float body=sdRBox(q-vec3(0.,.07,0.),vec3(.085,.07,.028),.009);
  float seam=sdRBox(q-vec3(0.,.07,0.),vec3(.0865,.0715,.0022),.009);
  return min(body,seam); }
float caseParts(vec3 q){
  vec3 h=q-vec3(0.,.14,0.);
  float handle=max(sdTorus(h.xzy,.022,.0045),-h.y);
  handle=max(handle,-(h.y-.0));
  float d=handle;
  for(int i=0;i<2;i++){ float s=float(i)*2.-1.;
    d=min(d,sdRBox(q-vec3(s*.052,.139,-.0),vec3(.008,.004,.012),.0015));     /* handle mounts */
    d=min(d,sdRBox(q-vec3(s*.05,.1,-.029),vec3(.009,.012,.003),.0012)); }   /* two latches */
  for(int i=0;i<4;i++){ float sx=float(i/2)*2.-1., sz=float(i%2)*2.-1.;
    d=min(d,length(q-vec3(sx*.078,.006,sz*.02))-.006); }                     /* feet */
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 t=tq(p);
  r=U(r,trayD(t),3.);
  vec2 h=houses(t); r=U(r,h.x,4.); r=U(r,h.y,5.);
  vec3 s=sq(p);
  r=U(r,caseD(s)*.72,6.);
  r=U(r,caseParts(s)*.72,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=tq(p); return .6+.1*grain(q.zyx,60.); }
  if(id==4.){ vec3 q=tq(p);
    /* a door and a window painted on each house front */
    for(int i=0;i<NH;i++){ vec4 h=hp(i); vec3 c=q-vec3(h.x,.012,h.y); c.xz=rot(h.z)*c.xz; vec3 s=hs(h.w);
      if(abs(c.x)<s.x+.002&&abs(c.z)<s.z+.002&&c.y>-.001&&c.y<2.*s.y+.002){
        vec2 u=vec2(c.x,c.y); float fz=abs(c.z)-s.z;
        if(fz>-.002){ if(abs(u.x+s.x*.4)<.0045&&u.y<s.y*1.2) return .3;
          if(abs(u.x-s.x*.4)<.005&&abs(u.y-s.y*1.2)<.005) return .35; }
        return .88; } }
    return .88; }
  if(id==5.) return .42;
  if(id==6.){ vec3 q=sq(p); if(abs(q.z)<.0025) return .3; return .5; }
  if(id==7.) return .3;
  return .7; }
