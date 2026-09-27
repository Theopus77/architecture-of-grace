/* r1 "How to Read a Sacred Text" — books of different kinds held upright between two wooden
   bookends (a tall one, a slim one, a thick one, a small one: ask the genre first), and a
   rolled scroll tied with a cord lying in front. */
#define CAM_POS vec3(-0.4614,0.2814,-0.6794)
#define CAM_TGT vec3(-0.2078,0.0107,0.1160)
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
vec3 sQ(vec3 p){ return place(p,vec3(0.,0.,.12),-.75); }
vec4 bk(int i){ /* x centre, half-thickness, height, half-depth */
  if(i==0) return vec4(-.075,.016,.2,.06);
  if(i==1) return vec4(-.047,.01,.17,.055);
  if(i==2) return vec4(-.006,.028,.185,.065);
  return vec4(.036,.012,.13,.045); }
float book(vec3 q,vec4 b,float lean){ vec3 k=q-vec3(b.x,0.,0.); k.xy=rot(lean)*k.xy;
  float c=sdRBox(k-vec3(0.,b.z*.5,0.),vec3(b.y,b.z*.5,b.w),.003);
  float pg=sdBox(k-vec3(0.,b.z*.5,.004),vec3(b.y-.003,b.z*.5-.004,b.w));
  return max(c,-max(pg,-(k.z-b.w+.004)))*1.+0.*pg; }
float books(vec3 p){ vec3 q=sQ(p); float d=1e5; for(int i=0;i<4;i++){ vec4 b=bk(i); d=min(d,book(q,b,i==3?-.0:0.)); } return d; }
float ends(vec3 p){ vec3 q=sQ(p); float d=1e5;
  for(int s=0;s<2;s++){ float x=s==0?-.098:.055; float sg=s==0?-1.:1.;
    vec3 k=q-vec3(x,0.,0.);
    float up=sdRBox(k-vec3(sg*.004,.07,0.),vec3(.004,.07,.05),.002);
    up=max(up,length(k.yz-vec2(.0,0.))-.16);
    float ft=sdRBox(k-vec3(sg*.035,.004,0.),vec3(.035,.004,.05),.002);
    d=min(d,min(up,ft)); }
  return d; }
vec3 scQ(vec3 p){ vec3 q=p-vec3(.08,.022,-.08); q.xz=rot(.2)*q.xz; return q; }
float scroll(vec3 p){ vec3 q=scQ(p);
  float r=sdCylX(q,.02,.09)-.001;
  float knob=min(sdCylX(q-vec3(.1,0.,0.),.009,.012),sdCylX(q+vec3(.1,0.,0.),.009,.012))-.001;
  return min(r,knob); }
float cord(vec3 p){ vec3 q=scQ(p); float c=sdTorus(q.yxz,.0215,.0022);
  c=min(c,sdCapsule(q,vec3(0.,-.018,-.012),vec3(.03,-.02,-.035),.002));
  c=min(c,sdCapsule(q,vec3(0.,-.018,-.012),vec3(-.02,-.021,-.04),.002));
  return c; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,books(p),3.);
  r=U(r,ends(p),4.);
  r=U(r,scroll(p),5.);
  r=U(r,cord(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=sQ(p); int k=q.x<-.063?0:q.x<-.036?1:q.x<.024?2:3; vec4 b=bk(k);
    if(q.z<-b.w+.002){ float y=q.y/b.z; if(abs(y-.82)<.012||abs(y-.18)<.012) return .3;
      if(k==2&&abs(y-.5)<.06&&abs(q.x-b.x)<b.y*.6) return .75; }
    if(q.z>-b.w+.004&&abs(n.z)<.5&&abs(n.x)<.5) return .9;
    return k==0?.45:k==1?.62:k==2?.5:.7; }
  if(id==4.) return .45+.12*grain(sQ(p).zyx,50.);
  if(id==5.){ vec3 q=scQ(p); if(abs(q.x)>.09) return .4; float a=atan(q.z,q.y); return fract(a*1.6)<.06?.6:.88; }
  if(id==6.) return .35;
  return .7; }
