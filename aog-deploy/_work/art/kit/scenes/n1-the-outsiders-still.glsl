/* Room n1 "The Outsiders: A Novel Study" — pencil still life of the greasers' world: a toy
   sixties car, a worn paperback lying in front of it with a pocket comb on its cover, and a
   single leaf on the table ("nothing gold can stay"). No figures, no title text. */
#define CAM_POS vec3(-0.3149,0.2537,-0.7688)
#define CAM_TGT vec3(-0.0934,-0.0028,0.0724)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
/* a toy car from the sixties: a long low body, a cabin set back, round wheels, bumpers */
vec3 carQ(vec3 p){ return place(p,vec3(-.02,0.,-.03),-.35); }
float carBody(vec3 q){
  float b=sdRBox(q-vec3(0.,.03,0.),vec3(.1,.014,.042),.008);
  b=smin(b,sdRBox(q-vec3(-.012,.056,0.),vec3(.046,.014,.036),.009),.006);      /* cabin */
  b=max(b,-sdCylZ(vec3(abs(q.x)-.062,q.y-.02,q.z),.021,.06));                   /* wheel arches */
  b=min(b,sdRBox(vec3(abs(q.x)-.101,q.y-.024,q.z),vec3(.004,.004,.04),.002));   /* bumpers */
  return b; }
float carWheels(vec3 q){ vec3 w=vec3(abs(q.x)-.062,q.y-.017,abs(q.z)-.036);
  return sdCylZ(w,.017,.0065)-.002; }
/* a worn paperback lying flat, spine on -x, a little bowed */
vec3 pbQ(vec3 p){ vec3 q=place(p,vec3(.1,.1,.1),-.55); q.yz=rot(-1.36)*q.yz; return q+vec3(0.,.009,0.); }
float paperback(vec3 q){ vec3 s=vec3(.066,.009,.1);
  q.y+=.0015*(1.-q.x*q.x/(s.x*s.x));
  float cov=sdRBox(q-vec3(0.,s.y,0.),s,.004);
  float pages=sdBox(q-vec3(.003,s.y,0.),vec3(s.x-.001,s.y-.0018,s.z-.003));
  return min(max(cov,-sdBox(q-vec3(.006,s.y,0.),vec3(s.x,s.y-.0015,s.z-.0025))),pages); }
/* a pocket comb lying on the cover, teeth toward +z */
vec3 cmQ(vec3 p){ vec3 q=place(p,vec3(.07,0.,-.13),.15+3.1416); return q; }
float comb(vec3 q){
  float spine=sdRBox(q-vec3(0.,.0035,-.01),vec3(.08,.0035,.007),.002);
  float cell=fract(q.x/.006+.5)-.5;
  float teeth=max(max(abs(cell*.006)-.0017,abs(q.x)-.077),max(abs(q.z-.009)-.013,abs(q.y-.0028)-.0026));
  return min(spine,teeth-.0003); }
/* one leaf on the table, stem toward -x */
vec3 lfQ(vec3 p){ vec3 q=place(p,vec3(.24,.024,-.1),.15); q.yz=rot(-.5)*q.yz; return q; }
float leaf(vec3 q){ float L=.12; float t=clamp((q.x+.0)/L,0.,1.);
  float w=.05*pow(t,.45)*pow(1.-t,.85)*1.9*(1.+.06*sin(t*70.));
  float y=q.y-.003-.02*t*t*t-.25*q.z*q.z;
  float d=max(abs(q.z)-w,abs(q.x-L*.5)-L*.5);
  float blade=max(d,abs(y)-.0009)-.0006;
  float stem=sdCapsule(q,vec3(-.022,.0015,.0),vec3(.002,.003,0.),.0014);
  return min(blade*.8,stem); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.6-dot(p.xz-CAM_TGT.xz,normalize(CAM_TGT.xz-CAM_POS.xz)),2.);
  r=U(r,carBody(carQ(p)),3.); r=U(r,carWheels(carQ(p)),7.);
  r=U(r,paperback(pbQ(p)),4.);
  r=U(r,comb(cmQ(p)),5.);
  r=U(r,leaf(lfQ(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=carQ(p);
    if(q.y>.046&&q.y<.066&&abs(q.x+.012)<.044&&abs(q.z)>.034) return abs(q.x+.012)<.004||abs(q.x+.012)>.04?.6:.3;   /* side windows */
    if(q.y>.046&&q.y<.066&&abs(q.z)<.03&&abs(q.x+.012)>.052) return .32;                                               /* windscreen, rear window */
    if(abs(q.y-.034)<.0012&&abs(q.z)>.041) return .35;                                                                 /* a side trim line */
    if(abs(q.x)>.1&&abs(q.z)>.026&&q.y>.028&&q.y<.038) return .92;                                                    /* headlamps */
    return .72; }
  if(id==7.){ vec3 q=carQ(p); vec3 w=vec3(abs(q.x)-.062,q.y-.017,abs(q.z)-.036); return length(w.xy)<.009?.8:.2; }
  if(id==4.){ vec3 q=pbQ(p); vec3 sz=vec3(.066,.009,.1);
    if(q.x>sz.x-.003||q.z>sz.z-.003||q.z<-sz.z+.003){ if(q.y>.003&&q.y<2.*sz.y-.003) return .93; }      /* page edges */
    if(q.x<-sz.x+.006) return abs(q.z)>.08?.35:.5;                                                     /* spine */
    vec2 u=q.xz; float fr=abs(max(abs(u.x-.004)-.052,abs(u.y)-.084));
    if(fr<.0016) return .3;                                                                             /* a plain border on the cover */
    if(abs(u.y-.035)<.013&&abs(u.x-.004)<.036) return .55;                                              /* a plain panel, no title */
    return .8+.08*fbm(u*50.); }
  if(id==5.){ vec3 q=cmQ(p); if(q.z>-.003&&abs(fract(q.x/.006+.5)-.5)>.3) return .15; return .55; }
  if(id==6.){ vec3 q=lfQ(p); if(abs(q.z)<.0014&&q.x<.115) return .3;          /* midrib */
    float v=abs(fract((q.x-abs(q.z)*1.3)/.02)-.5); if(v<.05&&q.x>.005&&q.x<.1) return .45;   /* side veins */
    return .66; }
  return .7; }
