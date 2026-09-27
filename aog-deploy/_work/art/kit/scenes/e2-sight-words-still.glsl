/* Practice room "Words You Know by Sight" — pencil still life: a pair of reading glasses resting
   on a closed picture book, and a ring of flash cards fanned out on the table (each card one
   short hint-line, one word). */
#define CAM_POS vec3(-0.1756,0.2168,-0.5499)
#define CAM_TGT vec3(-0.0835,-0.0798,0.0678)
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
#define BK vec3(0.,0.,.04)
#define BS vec3(.11,.016,.08)
#define GL vec3(0.,.032+.023,.03)
#define RING vec3(.12,0.,-.1)
vec3 bkQ(vec3 p){ vec3 q=p-BK; q.xz=rot(.15)*q.xz; return q; }
vec3 glQ(vec3 p){ vec3 q=p-BK; q.xz=rot(.15)*q.xz; q-=GL-BK+vec3(0.,0.,-.0); q=q+vec3(0.,0.,-.0); q.yz=rot(.12)*q.yz; return q; }
float glassesD(vec3 q){ vec3 l=vec3(abs(q.x)-.03,q.y,q.z);
  float rim=length(vec2(length(l.xy*vec2(1.,1.25))-.021,l.z))-.0025;
  float br=sdCapsule(q,vec3(-.01,.006,0.),vec3(.01,.006,0.),.002);
  br=min(br,sdCapsule(vec3(abs(q.x),q.y,q.z),vec3(.01,.006,0.),vec3(.012,.004,0.),.002));
  float tp=sdCapsule(vec3(abs(q.x),q.y,q.z),vec3(.051,.004,0.),vec3(.056,.0,.1),.0022);
  return min(min(rim,br),tp); }
float lensD(vec3 q){ vec3 l=vec3(abs(q.x)-.03,q.y,q.z); return max(length(l.xy*vec2(1.,1.25))-.02,abs(l.z)-.001); }
vec3 cardQ(vec3 p,float k){ vec3 q=p-RING-vec3(0.,.0012+k*.0026,0.); q.xz=rot(-.9+k*.32)*q.xz; q.x-=.045; return q; }
float cardsD(vec3 p){ float d=1e3; for(int k=0;k<4;k++) d=min(d,sdRBox(cardQ(p,float(k)),vec3(.05,.0011,.028),.004)); return d; }
float ringD(vec3 p){ vec3 q=p-RING-vec3(0.,.006,0.); return sdTorus(q.xzy*vec3(1.,1.,1.),.012,.0018); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bookD(bkQ(p),BS),3.);
  vec3 g=glQ(p);
  r=U(r,glassesD(g),4.);
  r=U(r,lensD(g),5.);
  r=U(r,cardsD(p),6.);
  r=U(r,ringD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bkQ(p); if(q.y>2.*BS.y-.002){ vec2 u=q.xz; 
      if(abs(abs(u.x)-.075)<.002&&abs(u.y)<.055||abs(abs(u.y)-.055)<.002&&abs(u.x)<.075) return .4;   /* a border on the cover */
      if(length(u-vec2(.0,.01))<.028) return .55; return .7; }            /* a round picture */
    if(q.x>-BS.x+.01&&q.y<2.*BS.y-.004&&q.y>.004) return .88; return .5; }
  if(id==4.) return .3;
  if(id==5.) return .93;
  if(id==6.){ vec3 q=cardQ(p,3.); if(q.y>0.&&q.y<.003&&abs(q.z)<.004&&q.x>-.01&&q.x<.03) return .2; return .93; }
  if(id==7.) return .4;
  return .7; }
