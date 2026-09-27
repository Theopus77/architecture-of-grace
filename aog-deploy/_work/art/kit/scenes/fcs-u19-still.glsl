/* FCS Unit 19 "Independent Living and Money" — pencil still life: a small wooden model house,
   a ring of house keys with a tag lying in front of it, and a pocket calculator. */
#define CAM_POS vec3(-0.3325,0.2422,-0.6912)
#define CAM_TGT vec3(-0.1232,-0.0090,0.0875)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define HS vec3(.04,0.,.08)
vec3 hq(vec3 p){ vec3 q=p-HS; q.xz=rot(-.4)*q.xz; return q; }
float house(vec3 q){
  float walls=sdRBox(q-vec3(0.,.055,0.),vec3(.085,.055,.06),.003);
  vec2 r=vec2(abs(q.z),q.y-.11); float roof=max(max(dot(r,normalize(vec2(.7,1.)))-.052,-r.y),abs(q.x)-.1)-.003;
  roof=max(roof,-(max(max(dot(r,normalize(vec2(.7,1.)))-.045,-r.y+.0),abs(q.x)-.093)));
  float roofs=max(max(dot(r,normalize(vec2(.7,1.)))-.052,-r.y-.006),abs(q.x)-.1)-.002; roofs=max(roofs,-(dot(r,normalize(vec2(.7,1.)))-.045));
  float chim=sdRBox(q-vec3(.05,.155,.02),vec3(.012,.025,.012),.002);
  float door=sdRBox(q-vec3(-.03,.03,-.061),vec3(.015,.03,.003),.002);
  float win=sdRBox(q-vec3(.035,.06,-.061),vec3(.018,.016,.002),.001);
  return min(min(min(walls,roofs),chim),min(door,win)); }
float keys(vec3 p){ vec3 q=p-vec3(-.12,.003,-.1); float ring=sdTorus(q,.018,.0022);
  float d=ring; for(int i=0;i<2;i++){ float a=i==0?.5:-.3; vec3 k=q-vec3(.02*cos(a),0.,.02*sin(a)); k.xz=rot(-a)*k.xz;
    float bow=max(length(k.xz-vec2(.018,0.))-.013,abs(k.y)-.0018); bow=max(bow,-(length(k.xz-vec2(.012,0.))-.003));
    float blade=max(sdBox(k-vec3(.055,0.,0.),vec3(.025,.0016,.005)),-(max(abs(fract(k.x/.008)-.5)*.008-.0015,k.z+.001)));
    d=min(d,min(bow,blade)); }
  vec3 t=q-vec3(-.035,0.,.02); t.xz=rot(.6)*t.xz; d=min(d,max(sdRBox(t,vec3(.022,.0015,.013),.004),-(length(t.xz-vec2(.014,0.))-.003)));
  return d; }
float calc(vec3 p){ vec3 q=p-vec3(.2,.008,-.07); q.xz=rot(-.3)*q.xz; return sdRBox(q,vec3(.04,.008,.062),.006); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,house(hq(p)),3.);
  r=U(r,keys(p),4.);
  r=U(r,calc(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=hq(p); if(q.y>.11) return fract(q.x/.012)<.2?.2:.4;                       /* shingles */
    if(q.z<-.06){ if(abs(q.x+.03)<.016&&q.y<.062) return .3; if(abs(q.x-.035)<.019&&abs(q.y-.06)<.017) return abs(q.x-.035)<.0015||abs(q.y-.06)<.0015?.2:.9; }
    return fract(q.y/.012)<.12?.55:.8; }
  if(id==4.) return .5;
  if(id==5.){ vec3 q=p-vec3(.2,.008,-.07); q.xz=rot(-.3)*q.xz; if(q.y>.006){ if(q.z>.025&&abs(q.x)<.032&&q.z<.052) return .85;
      vec2 g=vec2((q.x+.032)/.016,(q.z+.055)/.017); if(g.x>0.&&g.x<4.&&g.y>0.&&g.y<4.5){ vec2 f=fract(g); if(f.x>.15&&f.x<.85&&f.y>.2&&f.y<.8) return .55; } }
    return .3; }
  return .7; }
