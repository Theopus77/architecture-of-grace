/* FACS project 3 "Fruit kabobs" — pencil still life: a round plate with three fruit kabobs on
   paper straws, each in the same repeating pattern (melon cube, grape half, banana round,
   strawberry), with a spare strawberry and a grape on the table beside it. */
#define CAM_POS vec3(-0.2186,0.2529,-0.4433)
#define CAM_TGT vec3(-0.0778,-0.0292,0.0802)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "projparts.glsl"
#define PL vec3(.0,0.,.03)
float plateF(float r){ return .0045+.01*smoothstep(.085,.15,r); }
float plate(vec3 p){ vec3 q=p-PL; float r=length(q.xz);
  float d=max(abs(q.y-plateF(r))-.0028,r-.152)*.8;
  d=min(d,sdTorus(q-vec3(0.,plateF(.152),0.),.151,.0032));
  d=min(d,sdTorus(q-vec3(0.,.003,0.),.07,.003));
  return d; }
/* one kabob lying on the plate: centre c, turned by a; returns (distance, id)
   ids: 3 straw, 4 melon, 5 grape, 6 banana, 7 strawberry */
vec2 kabobL(vec3 q,float sd){
  vec2 r=vec2(sdCapsule(q,vec3(-.13,0.,0.),vec3(.13,0.,0.),.0036),3.);
  for(int i=0;i<7;i++){ float x=-.09+float(i)*.028; vec3 l=q-vec3(x,0.,0.);
    float t=h1(vec2(float(i),sd))-.5; l.yz=rot(t*.6)*l.yz;
    int k=i-4*(i/4);
    if(k==0) r=U(r,sdRBox(l,vec3(.0125),.004),4.);
    else if(k==1) r=U(r,max(sdEll(l,vec3(.0105,.013,.0125)),l.z-.002),5.);
    else if(k==2) r=U(r,sdCylX(l,.0145,.0045)-.001,6.);
    else { vec3 s=l; s.xy=rot(1.57)*s.xy; float w=sdEll(s-vec3(0.,-.002,0.),vec3(.0125,.016,.0125));
      w=smax(w,-s.y*.8-.019+length(s.xz)*.0,.004); r=U(r,w,7.); } }
  return r; }
vec2 kabob(vec3 p,vec3 c,float a,float sd){ vec3 q=p-c; q.xz=rot(a)*q.xz; return kabobL(q,sd); }
#define CU vec3(.21,0.,.07)
vec2 standing(vec3 p,vec3 top,float lean,float tw,float sd){ vec3 q=p-top; q.xz=rot(tw)*q.xz; q.xy=rot(lean)*q.xy;
  return kabobL(vec3(q.y,-q.x,q.z),sd); }
float cup(vec3 p){ return cupD(p-CU,.045,.085,0.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,plate(p),8.);
  vec3 q=p-PL;
  float bq=sdCylY(q-vec3(0.,.025,0.),.165,.03); if(bq>.01) r.x=min(r.x,bq); else {
    r=U(r,kabob(p,PL+vec3(-.01,.024,.055),.15,1.));
    r=U(r,kabob(p,PL+vec3(.0,.024,.012),.03,2.));
        r=U(r,kabob(p,PL+vec3(.012,.024,-.032),-.1,3.)); }
  vec3 f=p-vec3(.2,.013,-.06); f.xy=rot(1.3)*f.xy; f.xz=rot(.4)*f.xz;
  { float w=sdEll(f,vec3(.019,.024,.019)); w+=.006*smoothstep(.01,-.024,f.y)*(1.-length(f.xz)/.02); r=U(r,w*.8,7.); }
  { vec3 g=f-vec3(0.,.024,0.); float a=atan(g.z,g.x); float sec=6.2832/5.; float aa=mod(a+sec*.5,sec)-sec*.5;
    vec2 pl=length(g.xz)*vec2(cos(aa),sin(aa)); float lf=sdEll(vec3(pl.x-.011,g.y,pl.y),vec3(.012,.0022,.0045));
    lf=min(lf,sdCapsule(g,vec3(0.),vec3(.002,.012,0.),.0018)); r=U(r,lf,10.); }
  r=U(r,sdEll(p-vec3(.245,.011,.0),vec3(.013,.011,.011)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return fract((p.x+p.z)*70.)<.5?.55:.9;
  if(id==4.) return .78;
  if(id==5.) return .3;
  if(id==6.) return .9;
  if(id==7.) return h13(floor(p*500.))>.9?.8:.36;
  if(id==8.){ float r=length((p-PL).xz); return abs(r-.13)<.002?.45:.9; }
  if(id==10.) return .45;
  return .7; }
