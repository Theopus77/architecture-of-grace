/* Room s4 "Explorers, Colonies, a New Nation" — pencil still life: a small domed sea chest
   with iron bands (the crossing), a brass spyglass lying extended across the table, and a
   three-cornered hat set on the chest's lid. */
#define CAM_POS vec3(-0.3066,0.3254,-0.6877)
#define CAM_TGT vec3(-0.1896,-0.0513,0.0973)
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
vec3 chQ(vec3 p){ return place(p,vec3(.02,0.,.08),-.3); }
float chestD(vec3 q){ float b=sdRBox(q-vec3(0.,.04,0.),vec3(.1,.04,.06),.003);
  float lid=max(sdCylX(q-vec3(0.,.078,0.),.06,.1)-.002,-(q.y-.078));
  return min(b,lid); }
float bandsD(vec3 q){ float d=1e5; for(int i=0;i<3;i++){ float x=-.07+.07*float(i);
  vec3 b=q-vec3(x,0.,0.); float box=max(sdRBox(b-vec3(0.,.04,0.),vec3(.006,.041,.062),.001),.0-1.);
  float arc=max(abs(length(b.yz-vec2(.078,0.))-.061)-.0025,max(abs(b.x)-.006,-(b.y-.078)));
  float side=max(sdRBox(b-vec3(0.,.04,0.),vec3(.006,.04,.0625),.001),-sdBox(b-vec3(0.,.04,0.),vec3(.01,.036,.058)));
  d=min(d,min(arc,side)); }
  float lock=sdRBox(q-vec3(0.,.074,-.062),vec3(.012,.014,.004),.002);
  return min(d,lock); }
vec3 htQ(vec3 p){ vec3 q=p-vec3(-.17,.004,-.02); q.xz=rot(.4)*q.xz; return q; }
float hatD(vec3 q){ float a=atan(q.z,q.x); float r=length(q.xz);
  float crown=sdEll(q-vec3(0.,.002,0.),vec3(.042,.042,.042)); crown=max(crown,-q.y-.0);
  /* brim turned up on three sides: a triangle-ish wall */
  float tri=r-(.07-.018*cos(3.*(a+.3)));
  float wall=max(abs(tri)-.003,max(q.y-.03+.012*cos(3.*(a+.3)),-q.y));
  float brim=max(max(tri,-(r-.04)),abs(q.y)-.003);
  return min(crown,min(wall,brim)); }
vec3 sgQ(vec3 p){ vec3 q=p-vec3(.05,.018,-.12); q.xz=rot(-.35)*q.xz; return q; }
float spyD(vec3 q){ float t1=sdCylX(q-vec3(-.06,0.,0.),.018,.07)-.001;
  float t2=sdCylX(q-vec3(.05,0.,0.),.014,.05);
  float t3=sdCylX(q-vec3(.12,0.,0.),.011,.03);
  float rims=min(sdCylX(q-vec3(.008,0.,0.),.02,.004),min(sdCylX(q-vec3(.098,0.,0.),.016,.003),sdCylX(q-vec3(-.13,0.,0.),.021,.006)));
  float eye=sdCylX(q-vec3(.15,0.,0.),.009,.005);
  return min(min(min(t1,t2),min(t3,rims)),eye); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=chQ(p);
  r=U(r,chestD(q),3.);
  r=U(r,bandsD(q),4.);
  r=U(r,hatD(htQ(p)),5.);
  r=U(r,spyD(sgQ(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=chQ(p); if(abs(q.y-.078)<.0015) return .25; if(q.y>.078) return .45+.1*grain(p.xyz*vec3(1.,1.,1.),60.); return .55+.1*grain(p.zyx,60.); }
  if(id==4.) return .3;
  if(id==5.) return .35;
  if(id==6.){ vec3 q=sgQ(p); if(q.x<.0) return .45+.06*grain(p,90.); return .78; }
  return .7; }
