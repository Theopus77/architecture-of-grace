/* e22 "Advanced Punctuation" — punctuation marks cut from thick wood and stood on the table:
   a tall semicolon, a pair of quotation marks, and a dash lying in front. */
#define CAM_POS vec3(-0.3826,0.2626,-0.6483)
#define CAM_TGT vec3(-0.1453,0.0094,0.0956)
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
/* 2D comma in units: head circle at (0,0) radius .5, tail sweeping down-left */
float comma2(vec2 u){
  float head=length(u)-.5;
  float t=clamp((-u.y)/1.3,0.,1.);
  vec2 c=vec2(.35-.1*t-.55*t*t,-t*1.3);
  float tail=length(u-c)-(.38*(1.-t)+.05);
  tail=max(tail,u.y-0.);
  return smin(head,tail,.15); }
float ext(float d2,float z,float h){ vec2 w=vec2(d2,abs(z)-h); return min(max(w.x,w.y),0.)+length(max(w,0.)); }
#define SC vec3(-.03,0.,.1)
vec3 scQ(vec3 p){ return place(p,SC,-.25); }
float semi(vec3 p){ vec3 q=scQ(p); float S=.055;
  float dot_=length(q.xy-vec2(0.,.165))/S-.5;
  float com=comma2((q.xy-vec2(0.,.09))/S);
  float d=min(dot_,com)*S;
  float base=sdRBox(q-vec3(0.,.006,0.),vec3(.05,.006,.03),.003);
  float rod=sdCylY(q-vec3(0.,.07,.02),.0035,.07);
  return min(min(ext(d,q.z,.014)-.002,base),rod); }
float semiPost(vec3 p){ vec3 q=scQ(p); return sdCylY(q-vec3(0.,.02,0.),.004,.01); }
#define QT vec3(.15,0.,.1)
float quotes(vec3 p){ float d=1e5; float S=.04;
  for(int i=0;i<2;i++){ vec3 q=place(p,QT+vec3(float(i)*.065,0.,-.012*float(i)),-.2);
    vec2 u=(q.xy-vec2(0.,.11))/S; u.y=-u.y; u.x=-u.x;          /* an opening quote: comma turned over */
    d=min(d,ext(comma2(u)*S,q.z,.01)-.0015);
    d=min(d,sdCylY(q-vec3(0.,.04,.0),.0035,.04)); }
  float base=sdRBox(place(p,QT+vec3(.033,0.,-.006),-.2)-vec3(0.,.006,0.),vec3(.07,.006,.028),.003);
  return min(d,base); }
float dash(vec3 p){ vec3 q=place(p,vec3(.08,.0,-.1),-.1); return sdRBox(q-vec3(0.,.013,0.),vec3(.07,.013,.014),.004); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,semi(p),3.);
  r=U(r,quotes(p),4.);
  r=U(r,dash(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=scQ(p); if(q.y<.013) return .35; return .55+.15*grain(q.zyx,60.); }
  if(id==4.){ if(p.y<.013) return .35; return .6+.12*grain(p.zyx,60.); }
  if(id==5.) return .5+.15*grain(p,60.);
  return .7; }
