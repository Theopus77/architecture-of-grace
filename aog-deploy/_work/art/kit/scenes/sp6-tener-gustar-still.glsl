/* sp6 "Tener, Gustar and Stem Changes" — a small school backpack with a front pocket and a
   top loop, a book leaning against it, and a soccer ball in front (what I have, what I like). */
#define CAM_POS vec3(-0.4025,0.2907,-0.6540)
#define CAM_TGT vec3(-0.1594,0.0314,0.1075)
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
#define BP vec3(-.04,0.,.13)
vec3 bQ(vec3 p){ return place(p,BP,-.25); }
float pack(vec3 p){ vec3 q=bQ(p);
  float w=.075-.012*smoothstep(.05,.18,q.y);
  float body=sdRBox(q-vec3(0.,.09,0.),vec3(w,.09,.045),.03);
  float top=sdEll(q-vec3(0.,.17,0.),vec3(.07,.03,.044)); body=smin(body,top,.02);
  float pocket=sdRBox(q-vec3(0.,.055,-.045),vec3(.055,.04,.015),.014);
  float loop=max(sdTorus((q-vec3(0.,.2,0.)).xzy,.014,.0035),-(q.y-.2));
  return min(min(body,pocket),loop); }
vec3 kQ(vec3 p){ vec3 q=p-vec3(.1,0.,.07); q.xz=rot(-.6)*q.xz; q.xy=rot(.32)*q.xy; return q; }
float book(vec3 p){ vec3 q=kQ(p); float c=sdRBox(q-vec3(0.,.075,0.),vec3(.012,.075,.055),.003);
  float pg=sdBox(q-vec3(.0,.075,.004),vec3(.009,.071,.055)); return max(c,-max(pg,-(q.z-.052))); }
#define SB vec3(.13,.045,-.07)
float ball(vec3 p){ return length(p-SB)-.045; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pack(p),3.);
  r=U(r,book(p),4.);
  r=U(r,ball(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bQ(p); if(q.z<-.05&&abs(q.y-.09)<.003) return .25;             /* pocket zip */
    if(q.z<-.02&&q.y>.14&&abs(abs(q.x)-.03)<.004) return .3;
    return .5; }
  if(id==4.){ vec3 q=kQ(p); if(q.z>.05&&abs(q.x)<.009) return .9; if(abs(q.y-.12)<.004) return .3; return .6; }
  if(id==5.){ vec3 d=normalize(p-SB); d.xz=rot(.5)*d.xz; d.yz=rot(.3)*d.yz; float best=9.; float g=1.618;
    for(int i=0;i<12;i++){ int k=i/4; float s1=(i&1)==0?1.:-1., s2=(i&2)==0?1.:-1.;
      vec3 v=k==0?vec3(0.,s1,s2*g):k==1?vec3(s1,s2*g,0.):vec3(s1*g,0.,s2); best=min(best,acos(clamp(dot(d,normalize(v)),-1.,1.))); }
    if(best<.27) return .2; if(best<.3) return .4; return .9; }
  return .7; }
