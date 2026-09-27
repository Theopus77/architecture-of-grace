/* Spanish Unit 11 "The Classroom: Nouns and Articles" — pencil still life: a pencil cup holding
   pencils and a ruler, a stack of two school books, a pair of scissors and an eraser. */
#define CAM_POS vec3(-0.5102,0.3359,-0.8634)
#define CAM_TGT vec3(-0.2438,0.0160,0.1279)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define PC vec3(.07,0.,.06)
float cup(vec3 p){ vec3 q=p-PC; float o=sdCylY(q-vec3(0.,.055,0.),.042,.055)-.002; float i=sdCylY(q-vec3(0.,.062,0.),.037,.055); return max(o,-i); }
/* pencils leaning out of the cup: each along direction dir from a base point */
vec3 pdir(int i){ return i==0?normalize(vec3(-.35,1.,-.12)):i==1?normalize(vec3(.25,1.,.05)):normalize(vec3(.05,1.,.3)); }
vec3 pbase(int i){ return PC+(i==0?vec3(.012,.01,.0):i==1?vec3(-.012,.01,.008):vec3(.0,.01,-.014)); }
float pencils(vec3 p){ float d=1e5; for(int i=0;i<3;i++){ vec3 a=pdir(i); vec3 q=p-pbase(i);
    vec3 x=a, z=normalize(cross(x,vec3(0.,0.,1.))), y=cross(z,x); vec3 l=vec3(dot(q,x),dot(q,y),dot(q,z));
    d=min(d,pencilX(l,.0068,.23+float(i)*.015)); } return d; }
float ruler(vec3 p){ vec3 q=p-PC-vec3(.018,.1,.018); vec3 a=normalize(vec3(.28,1.,.1)); q.xy=rot(.27)*q.xy; return sdRBox(q,vec3(.013,.12,.0015),.001); }
vec2 books(vec3 p){ vec2 a=flatBook(p,vec3(-.14,.02,.02),vec3(.1,.02,.07),.18); vec2 b=flatBook(p,vec3(-.13,.057,.015),vec3(.085,.017,.062),-.08); return a.x<b.x?a:b; }
float scissors(vec3 p){ vec3 q=p-vec3(.15,.004,-.08); q.xz=rot(-.5)*q.xz; float d=1e5;
  for(int s=0;s<2;s++){ float a=s==0?.12:-.12; vec3 r=q; r.xz=rot(a)*r.xz;
    float blade=max(sdRBox(r-vec3(.045,0.,0.),vec3(.045,.0018,.006),.001),abs(r.z)-.006*(1.-max(r.x-.02,0.)/.075));
    float ring=sdTorus(r-vec3(-.03,0.,(s==0?.012:-.012)),.013,.0035);
    d=min(d,min(blade,ring)); } return d; }
float eraser(vec3 p){ vec3 q=p-vec3(-.02,.009,-.1); q.xz=rot(.3)*q.xz; return sdRBox(q,vec3(.026,.009,.013),.004); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,cup(p),3.);
  r=U(r,pencils(p),4.);
  r=U(r,ruler(p),5.);
  vec2 b=books(p); r=U(r,b.x,b.y>.5?7.:6.);
  r=U(r,scissors(p),8.);
  r=U(r,eraser(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PC; return abs(q.y-.09)<.003?.3:.55; }
  if(id==4.){ float best=1e5; int k=0; for(int i=0;i<3;i++){ vec3 q=p-pbase(i); float t=dot(q,pdir(i)); float d=length(q-pdir(i)*t); if(d<best){best=d;k=i;} }
    float t=dot(p-pbase(k),pdir(k)); float L=.23+float(k)*.015; return pencilTone(vec3(t,0.,0.),L); }
  if(id==5.){ vec3 q=p-PC-vec3(.018,.1,.018); q.xy=rot(.27)*q.xy; float f=fract(q.y/.01); if(q.x<-.005&&f<.18) return .2; if(q.x<.0&&fract(q.y/.05)<.04) return .15; return .88; }
  if(id==6.) return p.y>.04?.35:.55;
  if(id==7.) return .9;
  if(id==8.){ vec3 q=p-vec3(.15,.004,-.08); q.xz=rot(-.5)*q.xz; return q.x<-.012?.3:.8; }
  if(id==9.) return .7;
  return .7; }
