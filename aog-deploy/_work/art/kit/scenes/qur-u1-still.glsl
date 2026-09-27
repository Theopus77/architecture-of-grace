/* Qur'an Unit 1 "A Book Called the Qur'an" — pencil still life: an open mushaf resting on
   a carved wooden rahle (the X-shaped folding stand, with pierced star openings and arched
   feet), before a panel of eight-point star tiles. Pages carry an ornamental frame and
   hint-lines only, no writing. No figures. */
#define CAM_POS vec3(-1.2801,0.7609,-2.2836)
#define CAM_TGT vec3(-0.6724,0.1058,0.2246)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.75,.8,-.35)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define WALLZ .42
#define RY .42
float star2(vec2 f){ vec2 a=abs(f); vec2 r=abs(rot(.785398)*f); return min(max(a.x,a.y),max(r.x,r.y)); }
vec2 tile(vec2 w){ float s=.16; vec2 c=w/s; vec2 id=floor(c+.5); vec2 f=c-id; float st=star2(f)-.33; return vec2(st*s,st<0.?1.:0.); }
float wallD(vec3 p){ vec2 t=tile(p.xy); float relief=.004*smoothstep(.0,.004,-t.x); return WALLZ-p.z-relief; }
vec3 rq(vec3 p){ vec3 q=p-vec3(0.,0.,.02); q.xz=rot(RY)*q.xz; return q; }
float board(vec3 q,float s){
  vec3 a=q-vec3(0,.26,0); a.yz=rot(s*.62)*a.yz;          /* a.y runs along the board */
  float d=sdRBox(a,vec3(.2,.34,.009),.003);
  /* pierced eight-point star in the lower half, and an arched notch between the feet */
  float st=star2((a.xy-vec2(0.,-.19))/.07)*.07-.03; d=max(d,-st);
  float ring=abs(star2((a.xy-vec2(0.,-.19))/.07)*.07-.045)-.004; d=max(d,-max(ring,abs(a.z)-.004)*1.)*1.;
  d=max(d,-(length(vec2(a.x,(a.y+.34)*.8))-.1));
  return d; }
float rahle(vec3 p){ vec3 q=rq(p); float d=min(board(q,1.),board(q,-1.)); return max(d,-q.y); }
vec3 bq(vec3 p){ vec3 q=rq(p); q-=vec3(0.,.565,-.02); q.yz=rot(-.62)*q.yz; return q; }
vec2 book(vec3 p){
  vec3 q=bq(p)/1.22; float x=abs(q.x);
  float curl=.02*sin(clamp(x/.2,0.,1.)*3.1416)+.022*(1.-exp(-x*25.));
  float pages=sdBox(vec3(x-.1,q.y-curl*.8,q.z),vec3(.097,.014,.14))-.001;
  float cover=sdRBox(vec3(x-.104,q.y+.014+curl*.3,q.z),vec3(.107,.004,.149),.002);
  return vec2(pages,cover)*1.22; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,wallD(p),2.);
  r=U(r,rahle(p),3.);
  vec2 b=book(p); r=U(r,b.x,4.); r=U(r,b.y,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.){ vec2 t=tile(p.xy); float a=t.y>.5?.6:.88; if(abs(t.x)<.0022) a=.35;
    vec2 c=p.xy/.16; vec2 f=c-floor(c+.5); if(star2(f)<.12) a=.4; if(abs(star2(f)-.2)<.012) a=.45; return a; }
  if(id==3.) return .5;
  if(id==4.){ vec3 q=bq(p)/1.22; float x=abs(q.x); float a=.94;
    vec2 b=abs(vec2(x-.1,q.z))-vec2(.078,.118); float m=max(b.x,b.y);
    if(abs(m)<.002||abs(m+.007)<.0012) a=.45;                      /* ornamental frame */
    if(m<-.012){ float l=fract((q.z+.2)/.0155); if(l<.2) a=.66; }   /* hint lines */
    if(abs(q.z-.098)<.009&&abs(x-.1)<.05&&m<-.009) a=.55;            /* head panel */
    if(x<.008) a=.72; return a; }
  if(id==5.) return .3;
  return .7; }
