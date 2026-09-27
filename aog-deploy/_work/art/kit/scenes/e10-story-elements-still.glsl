/* Room e10 "Story Elements and Theme" — pencil still life: an open storybook with a ribbon
   bookmark (the story), a small wooden toy house (the setting) and an old iron key lying
   in front (the problem a character wants to unlock). */
#define CAM_POS vec3(-0.2821,0.3159,-0.6868)
#define CAM_TGT vec3(-0.1662,-0.0573,0.0908)
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
vec3 bookQ(vec3 p){ vec3 q=p-vec3(.14,.03,.08); q.xz=rot(-.18)*q.xz; q.yz=rot(-.3)*q.yz; return q; }
vec2 bookD(vec3 p){
  vec3 q=bookQ(p); float x=abs(q.x);
  float lift=.03*sin(clamp(x/.15,0.,1.)*1.9)-.018*exp(-x*50.)+.008;
  float pages=sdBox(vec3(x-.076,q.y-lift*.5,q.z),vec3(.074,max(lift*.5,.003),.1))-.0015;
  float cover=sdRBox(vec3(x-.08,q.y+.001,q.z),vec3(.083,.0035,.107),.0015);
  float prop=sdRBox(p-vec3(.14,.016,.19),vec3(.15,.016,.03),.003);
  float rib=sdRBox(q-vec3(.004,.0,-.11-.02),vec3(.004,.0008,.03),.0005);
  return vec2(pages,min(min(cover,prop),rib)); }
vec3 hQ(vec3 p){ return place(p,vec3(-.13,0.,.04),.5); }
float houseD(vec3 q){
  float body=sdRBox(q-vec3(0.,.045,0.),vec3(.05,.045,.04),.003);
  vec3 r=q-vec3(0.,.09,0.); float roof=extrude(sdTri2(r.zy,vec2(-.052,0.),vec2(.052,0.),vec2(0.,.05)),r.x,.058,.003);
  float chim=sdRBox(q-vec3(.025,.13,.012),vec3(.008,.02,.008),.002);
  float door=sdRBox(q-vec3(0.,.025,-.04),vec3(.012,.022,.004),.002);
  float win=sdRBox(q-vec3(-.052,.055,0.),vec3(.004,.012,.012),.002);
  float d=min(min(body,roof),chim);
  d=max(d,-door); d=max(d,-win);
  return d; }
vec3 kQ(vec3 p){ vec3 q=p-vec3(-.02,.005,-.11); q.xz=rot(.3)*q.xz; return q; }
float keyD(vec3 q){
  float bow=sdTorus(q-vec3(-.07,0.,0.),.018,.0045);
  float shaft=sdCylX(q-vec3(0.,0.,0.),.0042,.055);
  float col=sdCylX(q-vec3(-.045,0.,0.),.0065,.005);
  float bit=sdRBox(q-vec3(.043,0.,.012),vec3(.012,.003,.012),.001);
  bit=max(bit,-sdBox(q-vec3(.043,0.,.018),vec3(.003,.01,.007)));
  return min(min(bow,shaft),min(col,bit)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=bookD(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  r=U(r,houseD(hQ(p)),5.);
  r=U(r,keyD(kQ(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bookQ(p); float x=abs(q.x); if(x<.006) return .7;
    vec2 u=vec2(x-.078,q.z); float l=fract((u.y+.1)/.014);
    if(abs(u.x)<.052&&u.y>-.08&&u.y<.08&&l<.2){ float e=fract(sin(floor((u.y+.1)/.014)*12.9)*437.)*.03; if(u.x<.052-e) return .62; }
    return .95; }
  if(id==4.){ vec3 q=bookQ(p); if(abs(q.x)<.01&&q.z<-.1) return .3; return .42; }
  if(id==5.){ vec3 q=hQ(p); if(q.y>.09) return .45+.1*step(.5,fract((q.y-.09)/.012)); return .78+.06*grain(p,90.); }
  if(id==6.) return .3;
  return .7; }
