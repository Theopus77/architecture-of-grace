/* FCS Unit 5 "Measure It Right" — pencil still life: a set of nested measuring cups with long
   handles, one cup filled level with flour, and a ring of measuring spoons fanned out in front. */
#define CAM_POS vec3(-0.30,0.40,-0.84)
#define CAM_TGT vec3(-0.05,0.02,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
/* a measuring cup: base centre c, radius r, depth h, handle pointing along angle a */
float mcup(vec3 p,vec3 c,float r,float h,float a){ vec3 q=p-c; q.xz=rot(a)*q.xz;
  float rr=r*(.85+.15*clamp(q.y/h,0.,1.));
  float outer=sdCylY(q-vec3(0.,h*.5,0.),rr,h*.5)-.002; float inner=sdCylY(q-vec3(0.,h*.5+.004,0.),rr-.004,h*.5);
  float cup=max(outer,-inner);
  float handle=sdRBox(q-vec3(r+.055,h-.003,0.),vec3(.06,.0025,.012),.002);
  float hole=length(q.xz-vec2(r+.1,0.))-.005; handle=max(handle,-hole);
  return min(cup,handle); }
#define C1 vec3(.02,0.,.05)
#define C2 vec3(-.14,0.,.0)
float flour(vec3 p){ vec3 q=p-C2; return max(sdCylY(q-vec3(0.,.02,0.),.052,.018),q.y-.046+.0015*vn3(q*300.)); }
float spoons(vec3 p){ vec3 o=vec3(.19,.0,-.09); float d=1e5;
  for(int i=0;i<4;i++){ float fi=float(i); float a=-.9+fi*.42; vec3 q=p-o; q.xz=rot(a)*q.xz;
    float r=.022-fi*.0035; vec3 b=q-vec3(-.075-r,r,0.); float bowl=max(abs(length(b)-r)-.0018,b.y-.0);
    float hdl=sdRBox(q-vec3(-.035,.0035+fi*.0012,0.),vec3(.04,.0018,.006),.0015);
    d=min(d,min(bowl,hdl)); }
  d=min(d,sdTorus((p-o-vec3(.002,.008,0.)).xzy,.012,.002));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,mcup(p,C1,.07,.07,-.35),3.);
  r=U(r,mcup(p,C1+vec3(0.,.012,0.),.055,.06,-.1),3.);
  r=U(r,mcup(p,C2,.056,.05,2.8),4.);
  r=U(r,flour(p),5.);
  r=U(r,spoons(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-C1; return abs(q.y-.04)<.003&&length(q.xz)>.06?.35:.66; }
  if(id==4.){ vec3 q=p-C2; return abs(q.y-.03)<.003&&length(q.xz)>.045?.35:.6; }
  if(id==5.) return .93;
  if(id==6.) return .6;
  return .7; }
