/* Social Studies Unit 8 "Government: Local, State, National" — pencil still life: a model
   of a capitol building with columns and a dome, a judge's gavel on its block, and a small
   flag on a desk stand. */
#define CAM_POS vec3(-0.2970,0.2585,-0.9926)
#define CAM_TGT vec3(-0.1557,0.0103,0.0707)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define CC vec3(.1,0.,.18)
vec3 cq(vec3 p){ vec3 q=p-CC; q.xz=rot(-.1)*q.xz; return q; }
float columns(vec3 q,float x0,float x1,int n,float z,float y0,float h,float r){
  float d=1e5;
  for(int i=0;i<9;i++){ if(i>=n) break; float x=mix(x0,x1,float(i)/float(n-1));
    d=min(d,sdCylY(q-vec3(x,y0+h,z),r,h)); }
  return d; }
vec2 capitol(vec3 p){
  vec3 q=cq(p);
  float base=sdRBox(q-vec3(0.,.012,0.),vec3(.22,.012,.07),.002);
  float steps=sdRBox(q-vec3(0.,.018,-.075),vec3(.05,.006,.014),.001);
  steps=min(steps,sdRBox(q-vec3(0.,.008,-.085),vec3(.056,.008,.014),.001));
  float wings=sdRBox(q-vec3(0.,.055,.01),vec3(.2,.032,.05),.002);
  float cornice=sdRBox(q-vec3(0.,.09,.01),vec3(.205,.004,.054),.001);
  /* centre portico: columns and a triangular pediment */
  float cols=columns(q,-.045,.045,5,-.058,.024,.03,.0055);
  float ent=sdRBox(q-vec3(0.,.089,-.05),vec3(.055,.005,.018),.001);
  vec3 pd=q-vec3(0.,.094,-.05); float ped=max(max(abs(pd.x)*.4+pd.y-.022,-pd.y),abs(pd.z)-.017);
  /* drum with columns, then the dome, lantern and statue post */
  vec3 d=q-vec3(0.,0.,.02);
  float drum=sdCylY(d-vec3(0.,.12,0.),.055,.028);
  float ring=1e5; for(int i=0;i<16;i++){ float a=float(i)*.3927; ring=min(ring,sdCylY(d-vec3(.058*cos(a),.12,.058*sin(a)),.004,.026)); }
  float ledge=sdCylY(d-vec3(0.,.15,0.),.064,.004);
  float dome=max(length((d-vec3(0.,.154,0.))*vec3(1.,.85,1.))-.052,.154-d.y);
  float lan=sdCylY(d-vec3(0.,.22,0.),.011,.012);
  float tip=sdCone(d-vec3(0.,.243,0.),.008,.001,.012);
  float bld=min(min(base,steps),min(wings,cornice));
  bld=min(bld,min(ent,ped));
  float top=min(min(drum,ledge),min(dome,min(lan,tip)));
  return vec2(min(bld,top),min(cols,ring)); }
vec3 gq(vec3 p){ vec3 q=p-vec3(-.2,0.,-.03); q.xz=rot(.5)*q.xz; return q; }
vec2 gavel(vec3 p){
  vec3 q=gq(p);
  float blk=sdCylY(q-vec3(0.,.01,0.),.05,.01)-.002;
  vec3 h=q-vec3(.0,.042,.0); h.xz=rot(-.3)*h.xz;
  float head=sdCylX(h,.022,.042)-.002;
  head=min(head,sdCylX(h-vec3(.047,0.,0.),.025,.006)-.001);
  head=min(head,sdCylX(h-vec3(-.047,0.,0.),.025,.006)-.001);
  float han=sdCapsule(h,vec3(0.,0.,-.02),vec3(.0,-.02,-.17),.007);
  return vec2(blk,min(head,han)); }
#define FS vec3(.36,0.,-.02)
vec2 flag(vec3 p){
  vec3 q=p-FS;
  float stand=sdCylY(q-vec3(0.,.006,0.),.03,.006)-.002;
  float pole=sdCylY(q-vec3(0.,.12,0.),.0032,.12);
  float fin=length(q-vec3(0.,.245,0.))-.006;
  vec3 f=q-vec3(.058,.2,0.); f.z+=.007*sin(f.x*55.)*smoothstep(-.06,.06,f.x);
  float cloth=sdBox(f,vec3(.056,.037,.0015))-.0005;
  return vec2(min(stand,min(pole,fin)),cloth*.8); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 c=capitol(p); r=U(r,c.x,3.); r=U(r,c.y,4.);
  vec2 g=gavel(p); r=U(r,g.x,5.); r=U(r,g.y,6.);
  vec2 f=flag(p); r=U(r,f.x,7.); r=U(r,f.y,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=cq(p);
    if(q.z<-.035&&q.y>.03&&q.y<.08&&abs(q.x)>.065){ vec2 u=vec2(fract(q.x/.025)-.5,q.y-.055); if(abs(u.x)<.2&&abs(u.y)<.012) return .3; }   /* windows */
    vec3 d=q-vec3(0.,0.,.02); if(d.y>.156&&d.y<.21){ float a=atan(d.z,d.x); if(fract(a*12./6.2832)<.08) return .55; }   /* dome ribs */
    return .86; }
  if(id==4.) return .9;
  if(id==5.) return .45;
  if(id==6.){ vec3 q=gq(p); vec3 h=q-vec3(.0,.042,.0); h.xz=rot(-.3)*h.xz; if(abs(abs(h.x)-.03)<.003&&h.z>-.03) return .25; return .4; }
  if(id==7.) return .4;
  if(id==8.){ vec3 f=p-FS-vec3(.058,.2,0.);
    if(f.x<-.005&&f.y>0.){ vec2 s=fract(f.xy/.01)-.5; return length(s)<.22?.95:.28; }
    return fract((f.y+.037)/(.074/13.))<.5?.35:.92; }
  return .7; }
