/* FACS project 13 "Vegetable stir-fry" — pencil still life: a wok of glossy stir-fried
   vegetables (broccoli florets, carrot rounds and pepper strips, all cut even), a wooden spatula
   resting in it, and a small bowl of rice beside it. */
#define CAM_POS vec3(-0.3790,0.4348,-0.6193)
#define CAM_TGT vec3(-0.1757,0.0274,0.1372)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "projparts.glsl"
#define WK vec3(-.02,0.,.05)
#define RB vec3(.2,0.,-.06)
float wok(vec3 p){ vec3 q=p-WK;
  vec3 s=q-vec3(0.,.19,0.); float sh=abs(length(s)-.19)-.0035; sh=max(sh,q.y-.07);
  float ring=sdTorus(q-vec3(0.,.012,0.),.05,.006);
  float rim=sdTorus(q-vec3(0.,.07,0.),sqrt(.19*.19-.12*.12),.004);
  vec3 h=q-vec3(-.2,.085,.02); float hd=sdCapsule(q,vec3(-.14,.07,.01),vec3(-.26,.1,.03),.009);
  float hl=sdTorus((q-vec3(.155,.07,-.01)).yxz,.016,.004); hl=max(hl,.148-length(q.xz));
  return min(min(sh,ring),min(min(rim,hd),hl)); }
vec2 veg(vec3 p){ vec3 q=p-WK; vec2 r=vec2(sdEll(q-vec3(0.,.035,0.),vec3(.12,.03,.12)),4.);
  vec2 cell=floor(q.xz/.028);
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
    vec2 c=cell+vec2(float(i),float(j)); vec2 h=h22(c+5.); float t=h1(c*1.3+2.);
    vec2 xz=(c+.2+.6*h)*.028; if(length(xz)>.11) continue;
    float y=.035+.03*sqrt(max(0.,1.-dot(xz,xz)/(.12*.12)));
    vec3 l=q-vec3(xz.x,y,xz.y); l.xz=rot(t*6.28)*l.xz;
    if(t<.35){ float stem=sdCapsule(l,vec3(0.,-.004,0.),vec3(0.,.008,0.),.004);
      float head=length(l-vec3(0.,.012,0.))-.011; head+=.002*vn3(l*900.)-.001;
      float b=min(stem,head); if(b<r.x) r=vec2(b,5.); }
    else if(t<.65){ vec3 m=l; m.xy=rot(h.x)*m.xy; float b=sdCylY(m,.0105,.0022)-.001; if(b<r.x) r=vec2(b,6.); }
    else { vec3 m=l; m.xy=rot(.4*h.y)*m.xy; float b=sdRBox(m,vec3(.017,.0025,.004),.002); if(b<r.x) r=vec2(b,7.); } }
  return r; }
float spat(vec3 p){ vec3 q=p-WK; vec3 a=vec3(.02,.06,-.01), e=vec3(.2,.13,.06);
  vec3 b=q-a; b.xz=rot(-.3)*b.xz; float blade=sdRBox(b,vec3(.03,.003,.022),.003);
  return min(blade,sdCapsule(q,a,e,.006)); }
float rbowl(vec3 p){ return bowlD(p-RB,.055,.045); }
float rice(vec3 p){ vec3 q=p-RB; float d=sdEll(q-vec3(0.,.042,0.),vec3(.05,.022,.05));
  return d+.0012*vn3(q*800.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,wok(p),3.);
  vec3 q=p-WK; float bd=sdCylY(q-vec3(0.,.06,0.),.13,.035);
  if(bd>.01) r.x=min(r.x,bd); else r=U(r,veg(p));
  r=U(r,spat(p),8.);
  r=U(r,rbowl(p),9.);
  r=U(r,rice(p),10.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .3;
  if(id==4.) return .45;
  if(id==5.) return .3+.2*step(.6,vn3(p*900.));
  if(id==6.){ vec3 q=p-WK; return .72; }
  if(id==7.) return .55;
  if(id==8.) return .7;
  if(id==9.){ vec3 q=p-RB; return abs(q.y-.03)<.0025?.4:.8; }
  if(id==10.) return .95;
  return .7; }
