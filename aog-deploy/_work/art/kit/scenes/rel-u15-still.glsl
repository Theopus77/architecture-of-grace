/* World Religions Unit 15 "The Biblical Lens II: The New Testament" (The Sermon and the
   Parables) — pencil still life of things from the parables: a clay oil lamp with a small
   flame, a round loaf of bread on a wooden board, and a small cloth sack of seed with a few
   seeds spilled on the table. No figures. */
#define CAM_POS vec3(-0.3422,0.3275,-0.6672)
#define CAM_TGT vec3(-0.2269,-0.0438,0.1064)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define BD vec3(-.02,0.,.06)
#define SK vec3(.2,0.,.06)
#define LP vec3(-.19,0.,-.07)
float board(vec3 q){ float d=sdRBox(q-vec3(0,.009,0),vec3(.14,.009,.1),.004);
  float hd=sdCapsule(q,vec3(.14,.009,0),vec3(.18,.009,0),.012); hd=max(hd,abs(q.y-.009)-.009);
  hd=max(hd,-(length(q.xz-vec2(.17,0.))-.006)); return min(d,hd); }
float loaf(vec3 q){ vec3 c=q-vec3(0,.018,0);
  float d=length(c*vec3(1.,1.5,1.05))-.085; d=max(d*.66,-c.y);
  float s1=abs(c.x-c.z*.3+.025)-.005, s2=abs(c.x-c.z*.3-.025)-.005;
  d+=.005*(smoothstep(.006,0.,s1)+smoothstep(.006,0.,s2))*step(.03,c.y);
  d+=(fbm(c.xz*40.)-.5)*.002; return d; }
float sack(vec3 q){
  float y=q.y; float r=.055+.012*sin(clamp(y/.1,0.,1.)*3.1416)-.028*smoothstep(.08,.11,y);
  float a=atan(q.z,q.x); r+=.003*sin(a*9.+y*30.)*smoothstep(.06,.11,y);
  float d=(length(q.xz)-r)*.8; d=max(d,max(-y,y-.13));
  float tie=sdTorus(q-vec3(0,.105,0),.03,.004);
  float top=length((q-vec3(0,.13,0))*vec3(1.,1.6,1.))-.035; top=max(top*.6,-(length(q-vec3(0,.16,0))-.02));
  float seeds=1e5; for(int i=0;i<7;i++){ float f=float(i); vec3 s=q-vec3(-.07-.013*sin(f*2.1)-f*.004,.003,-.05+.02*cos(f*1.7)-f*.006);
    seeds=min(seeds,length(s*vec3(1.,1.4,.8))-.005); }
  return min(min(d,tie),min(top,seeds)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 b=L(p,BD,.25);
  r=U(r,board(b),3.);
  r=U(r,loaf(b),4.);
  r=U(r,sack(L(p,SK,.3)),5.);
  vec3 lq=L(p,LP,3.0);
  r=U(r,lampD(lq,1.25),6.);
  r=U(r,lampFlameD(lq,1.25),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 b=L(p,BD,.25); return grain(b*vec3(1.,1.,1.),30.)<.25?.45:.6; }
  if(id==4.){ vec3 b=L(p,BD,.25)-vec3(0,.018,0); float s1=abs(b.x-b.z*.3+.025), s2=abs(b.x-b.z*.3-.025);
    if(min(s1,s2)<.004&&b.y>.03) return .8; return .5+.12*fbm(b.xz*70.); }
  if(id==5.){ vec3 q=L(p,SK,.3); if(q.y<.006&&length(q.xz)>.06) return .5; if(abs(q.y-.105)<.005) return .3;
    return fract((q.y+atan(q.z,q.x)*.01)/.004)<.3?.55:.72; }
  if(id==6.) return .55;
  if(id==7.) return .97;
  return .7; }
