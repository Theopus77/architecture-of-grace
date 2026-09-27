/* Room n1 "The Outsiders: A Novel Study" — pencil still life from the novel: a worn hardback
   book lying closed (the book the boys read in the hideout church), a greaser's pocket comb
   on top of it, two drive-in ticket stubs, and a glass soda bottle. */
#define CAM_POS vec3(-0.3753,0.3561,-0.7325)
#define CAM_TGT vec3(-0.2498,-0.0473,0.1081)
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
vec3 bkQ(vec3 p){ return place(p,vec3(0.,0.,.02),-.2); }
#define BS vec3(.11,.024,.08)
vec3 cmQ(vec3 p){ vec3 q=bkQ(p)-vec3(.01,2.*BS.y+.0025,-.01); q.xz=rot(.35)*q.xz; return q; }
float combD(vec3 q){ float spine=sdRBox(q-vec3(0.,0.,.018),vec3(.075,.0025,.007),.0014);
  float tx=(fract(q.x/.0065)-.5)*.0065; float teeth=max(max(abs(tx)-.0017,abs(q.y)-.0019),abs(q.z+.001)-.013);
  teeth=max(teeth,abs(q.x)-.072);
  return min(spine,teeth); }
float ticketsD(vec3 p){ vec3 a=place(p,vec3(-.16,.0009,-.1),.3); vec3 b=place(p,vec3(-.13,.0024,-.08),-.15);
  float ta=sdRBox(a,vec3(.035,.0007,.018),.0005), tb=sdRBox(b,vec3(.035,.0007,.018),.0005);
  return min(ta,tb); }
#define SB vec3(-.15,0.,.1)
float bottleD2(vec3 p){ vec3 q=p-SB; float r=length(q.xz); float y=q.y;
  float R=.024-.004*smoothstep(.03,.05,y)+.003*smoothstep(.05,.07,y)-.016*smoothstep(.08,.14,y);
  float d=max(r-R,abs(y-.085)-.085)-.001;
  d=min(d,sdTorus(q-vec3(0.,.168,0.),.009,.003));
  d=max(d,-max(r-R+.003,-(y-.01)));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bookD(bkQ(p),BS),3.);
  r=U(r,combD(cmQ(p)),4.);
  r=U(r,ticketsD(p),5.);
  r=U(r,bottleD2(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bkQ(p); if(abs(n.y)<.5&&q.x>-.1){ return fract(q.y/.003)<.3?.7:.88; }
    if(n.y>.5){ vec2 u=q.xz; if(abs(max(abs(u.x-.005)/.09,abs(u.y)/.065)-1.)<.02) return .3; } return .4+.1*fbm3(p*80.); }
  if(id==4.) return .45;
  if(id==5.){ vec3 a=place(p,vec3(-.16,.0009,-.1),.3); vec3 b=place(p,vec3(-.13,.0024,-.08),-.15);
    vec3 q=p.y>.0017?b:a; if(abs(q.x-.02)<.0008&&fract(q.z/.004)<.5) return .3; if(abs(q.x)<.013&&abs(q.z)<.008&&fract((q.z+.01)/.005)<.2) return .55; return .88; }
  if(id==6.){ vec3 q=p-SB; if(q.y>.035&&q.y<.065) return .7; return .9; }
  return .7; }
