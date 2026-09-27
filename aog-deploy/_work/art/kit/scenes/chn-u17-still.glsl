/* Chinese Classics Unit 17 "The Classics Today, and Capstone" — pencil still life: an old
   stitched classic lying on top of a thick modern hardback translation, and in front a
   student's spiral notebook lying open with a pencil across it (your own argument). */
#define CAM_POS vec3(-0.2795,0.2492,-0.7979)
#define CAM_TGT vec3(-0.0837,-0.0447,0.0654)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
vec3 hQ(vec3 p){ vec3 q=p-vec3(0.,.035,.16); q.xz=rot(.1)*q.xz; return q; }
float hard(vec3 q){ /* cover boards overhang a page block; rounded spine on the left */
  float pages=sdBox(q-vec3(.004,0.,0.),vec3(.118,.029,.084));
  float boards=min(sdRBox(q-vec3(0.,.031,0.),vec3(.124,.004,.09),.002),sdRBox(q-vec3(0.,-.031,0.),vec3(.124,.004,.09),.002));
  float spine=max(length(vec2((q.x+.118)*1.8,q.y))-.036,max(q.x+.118,abs(q.z)-.09));
  return min(min(pages,boards),spine); }
vec3 oQ(vec3 p){ vec3 q=p-vec3(.01,.086,.15); q.xz=rot(-.14)*q.xz; return q; }
float old(vec3 q){ return sdRBox(q,vec3(.1,.015,.07),.003); }
/* spiral notebook, open flat, in front */
vec3 nQ(vec3 p){ vec3 q=p-vec3(.18,.004,-.1); q.xz=rot(-.25)*q.xz; return q; }
float note(vec3 q){ return sdRBox(q,vec3(.15,.003,.09),.002); }
float coil(vec3 q){ vec3 c=q-vec3(0.,.008,0.); c.z=mod(c.z+.006,.012)-.006; return max(sdTorus(c.xzy*vec3(1.,1.,1.),.007,.0012),abs(q.z)-.088); }
float pencilD(vec3 p){ vec3 q=nQ(p)-vec3(.05,.0095,-.02); q.xz=rot(.5)*q.xz;
  float R=.0055; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x)-.09);
  float t=clamp((q.x-.09)/.024,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95-.0003,max(.09-q.x,q.x-.114));
  float fer=max(length(q.yz)-R*.98,abs(q.x+.097)-.008);
  float era=max(length(q.yz)-R*.93,abs(q.x+.11)-.006)-.0005;
  return min(min(body,cone),min(fer,era)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,hard(hQ(p)),3.);
  r=U(r,old(oQ(p)),4.);
  r=U(r,note(nQ(p)),5.);
  r=U(r,pencilD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=hQ(p); if(abs(q.y)<.027&&q.x>-.11) return fract(q.y/.0022)<.4?.72:.9;
    if(q.x<-.105&&n.y<.5){ if(abs(q.y)<.024&&(abs(q.y-.016)<.0015||abs(q.y+.016)<.0015)) return .3; }
    if(q.y>.03&&n.y>.6&&abs(q.x-.01)<.07&&abs(q.z)<.05&&abs(max(abs(q.x-.01)-.07,abs(q.z)-.05))<.002) return .3;
    return .3; }
  if(id==4.){ vec3 q=oQ(p); if(abs(q.y)<.012&&n.y<.5) return fract(q.y/.0024)<.4?.72:.9;
    if(q.x<-.085&&n.y>.5){ for(int k=0;k<4;k++){ if(abs(q.z+.05-float(k)*.033)<.0013) return .25; } }
    if(n.y>.5&&abs(q.x+.04)<.011&&abs(q.z)<.05) return .92; if(n.y>.5&&abs(abs(q.x+.04)-.011)<.0012&&abs(q.z)<.05) return .35;
    return .45; }
  if(id==5.){ vec3 q=nQ(p); if(n.y<.5) return .7; float a=.96; float l=fract((q.z+.1)/.012);
    if(abs(q.x)>.012&&abs(q.x)<.14&&abs(q.z)<.078&&l<.12) a=.72;
    if(q.x>.02&&q.x<.12&&q.z>.01&&q.z<.07&&l>.3&&l<.7&&h1(floor(vec2(q.x/.012,q.z/.012)))>.45) a=.5;   /* handwriting squiggle hints */
    if(abs(q.x)<.002) a=.5; return a; }
  if(id==6.) return .3;
  if(id==7.){ vec3 q=nQ(p)-vec3(.05,.0095,-.02); q.xz=rot(.5)*q.xz;
    if(q.x>.09) return q.x>.106?.12:.88; if(q.x<-.104) return .5; if(q.x<-.089) return fract(q.x/.003)<.35?.3:.7; return abs(q.z)<.001?.35:.6; }
  return .7; }
