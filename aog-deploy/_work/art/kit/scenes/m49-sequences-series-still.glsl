/* Practice room "Sequences and Series" — pencil still life: five towers of wooden blocks growing
   one block at a time like a staircase (a pattern that adds the same step), and a nautilus shell
   standing on its edge (a spiral that grows by the same ratio). */
#define CAM_POS vec3(-0.1314,0.2424,-0.4345)
#define CAM_TGT vec3(-0.0523,-0.0120,0.0958)
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
#define BU .026
#define ST vec3(-.085,0.,.02)
#define SH vec3(.15,0.,-.02)
vec3 stQ(vec3 p){ vec3 q=p-ST; q.xz=rot(.3)*q.xz; return q; }
float towersD(vec3 q){ float d=1e3; for(int i=0;i<5;i++) for(int k=0;k<5;k++){ if(k>i) break;
    d=min(d,sdRBox(q-vec3(float(i)*BU*1.08,BU*(float(k)+.5),0.),vec3(BU*.49),.002)); } return d; }
/* nautilus: a log-spiral tube in the shell's x-y plane, the shell standing on its outer edge */
#define SA .006
#define SB .17
vec3 shQ(vec3 p){ vec3 q=p-SH-vec3(0.,.056,0.); q.xz=rot(-.5)*q.xz; return q; }
float shellD(vec3 q){ float r=length(q.xy); float th=atan(q.y,q.x);
  float t0=(log(max(r,1e-4)/SA)/SB-th)/6.2832; float d=1e3;
  for(int k=0;k<2;k++){ float n=floor(t0)+float(k); float R=SA*exp(SB*(th+6.2832*n)); if(R>.075) continue;
    float w=R*.52; vec2 c=vec2(r-R,q.z); d=min(d,length(c*vec2(1.,1.25))-w); }
  float outer=length(vec2(max(r-.06,0.),q.z))-.028;
  return max(d,outer)*.55; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,towersD(stQ(p)),3.);
  r=U(r,shellD(shQ(p)),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=stQ(p); float f=fract(q.y/BU); return (f<.05||f>.95)?.4:.75+.08*grain(q.zyx,90.); }
  if(id==4.){ vec3 q=shQ(p); float th=atan(q.y,q.x); float s=fract(th*3.); if(s<.1&&length(q.xy)>.025) return .45; return .85; }
  return .7; }
