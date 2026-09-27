/* Social Studies Unit 14 "Citizens of Illinois" — pencil still life: a wooden ballot box
   with a folded ballot going into its slot, a pencil, and a round "I voted" style badge
   (a plain star, no words). */
#define CAM_POS vec3(-0.3102,0.2449,-0.8683)
#define CAM_TGT vec3(-0.1845,0.0239,0.0778)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define BC vec3(.1,0.,.15)
#define BRY -.35
vec3 bq(vec3 p){ vec3 q=p-BC; q.xz=rot(BRY)*q.xz; return q; }
vec2 box(vec3 p){
  vec3 q=bq(p);
  float b=sdRBox(q-vec3(0.,.075,0.),vec3(.1,.075,.08),.005);
  float lid=sdRBox(q-vec3(0.,.155,0.),vec3(.106,.008,.086),.003);
  float slot=sdBox(q-vec3(0.,.16,0.),vec3(.05,.03,.005));
  lid=max(lid,-slot);
  float feet=1e5; for(int i=0;i<4;i++){ vec2 s=vec2(i<2?-1.:1.,(i%2==0)?-1.:1.); feet=min(feet,sdRBox(q-vec3(s.x*.085,.004,s.y*.065),vec3(.01,.004,.01),.002)); }
  float lock=sdRBox(q-vec3(0.,.13,-.082),vec3(.012,.016,.004),.002);
  /* the ballot: a folded card half inside the slot */
  vec3 c=q-vec3(0.,.2,0.); c.xy=rot(.08)*c.xy;
  float ballot=sdRBox(c,vec3(.042,.045,.0015),.0005);
  return vec2(min(min(b,feet),min(lid,lock)),ballot); }
vec3 pq(vec3 p){ vec3 q=p-vec3(-.13,.0068,-.06); q.xz=rot(-.55)*q.xz; return q; }
float pencil(vec3 p){
  vec3 q=pq(p); float R=.0066; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x+.005)-.1);
  float t=clamp((q.x-.095)/.026,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95-.0003,max(.095-q.x,q.x-.121));
  float fer=max(length(q.yz)-R*.98,abs(q.x+.103)-.008);
  float era=max(length(q.yz)-R*.93,abs(q.x+.117)-.006)-.0006;
  return min(min(body,cone),min(fer,era)); }
vec3 sq(vec3 p){ vec3 q=p-vec3(.34,.004,.0); return q; }
float badge(vec3 p){ vec3 q=sq(p); return sdCylY(q,.04,.003)-.0015; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=box(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  r=U(r,pencil(p),5.);
  r=U(r,badge(p),6.);
  return r; }
float star(vec2 u,float r){ float a=atan(u.y,u.x)+1.5708; float k=cos(floor(.5+a/1.2566)*1.2566-a); return length(u)*k-r*(.55+.45*0.); }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bq(p);
    if(q.z<-.076&&q.y<.14&&q.y>.012){ vec2 u=vec2(q.x,q.y-.07);            /* a star in a ring on the front */
      float st=star(u,.018); float rr=abs(length(u)-.034);
      if(rr<.0022) return .3; if(st<0.) return .28; }
    return .55+.12*grain(q.zxy,35.); }
  if(id==4.){ vec3 q=bq(p)-vec3(0.,.2,0.); if(q.z<0.&&abs(q.x+.012)<.012&&abs(q.y-.012)<.012&&abs(abs(q.x+.012)-abs(q.y-.012))<.003) return .2;  /* a tick mark */
    if(q.z<0.&&abs(q.x-.018)<.018&&fract((q.y+.04)/.012)<.2&&q.y<.03) return .6; return .95; }
  if(id==5.){ vec3 q=pq(p); if(q.x>.095) return q.x>.11?.12:.88; if(q.x<-.111) return .5; if(q.x<-.095) return fract(q.x/.003)<.35?.3:.7; return abs(q.z)<.0012?.35:.6; }
  if(id==6.){ vec3 q=sq(p); if(q.y>.002){ float st=star(q.xz,.016); if(st<0.) return .25; if(abs(length(q.xz)-.034)<.002) return .3; return .85; } return .5; }
  return .7; }
