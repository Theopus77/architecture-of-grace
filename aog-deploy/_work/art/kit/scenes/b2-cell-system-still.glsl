/* Room b2 "The Cell System" — pencil still life: a school microscope seen from the side
   (curved arm, stage with clips, tilted tube, three objective lenses, focus knob), a petri
   dish with round colonies, and two glass slides. */
#define CAM_POS vec3(-0.4566,0.5769,-1.0698)
#define CAM_TGT vec3(-0.2771,-0.0010,0.1344)
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
#define MC vec3(0.,0.,.07)
vec3 mQ(vec3 p){ return place(p,MC,2.75); }   /* local +x is the user side, -x the arm */
float baseD(vec3 q){ return sdRBox(q-vec3(-.01,.012,0.),vec3(.075,.012,.055),.01); }
float armD(vec3 q){
  vec2 a=q.xy; /* the arm in profile: a post rising from the base, then bending over */
  float post=extrude(sdBox2(a-vec2(-.068,.08),vec2(.012,.06)),q.z,.012,.003);
  float bend=extrude(max(abs(length(a-vec2(-.02,.16))-.05)-.011,-a.y+.16),q.z,.011,.003);
  bend=max(bend,a.x-.03);
  return min(post,bend); }
float stageD(vec3 q){ float s=sdRBox(q-vec3(.005,.105,0.),vec3(.048,.004,.05),.002);
  s=max(s,-sdCylY(q-vec3(.005,.105,0.),.008,.01));
  s=min(s,sdRBox(q-vec3(-.03,.1,0.),vec3(.022,.012,.014),.004));
  for(int i=0;i<2;i++){ float z=i==0?-.028:.028; s=min(s,sdRBox(q-vec3(.02,.1105,z),vec3(.02,.0012,.004),.001)); }
  return s; }
vec3 tA(){ return vec3(.01,.14,0.); }
vec3 tB(){ return vec3(.055,.27,0.); }
float tubeD(vec3 q){
  float t=sdCylAB(q,tA(),tB(),.016)-.001;
  vec3 dir=normalize(tB()-tA());
  t=min(t,sdCylAB(q,tB(),tB()+dir*.04,.011));
  t=min(t,sdCylAB(q,tB()+dir*.035,tB()+dir*.045,.0135));
  float nose=sdCylAB(q,tA()-dir*.004,tA()+dir*.01,.024)-.002;
  t=min(t,nose);
  for(int i=0;i<3;i++){ float a=float(i)*2.1-.4; vec3 o=tA()+vec3(.012*cos(a),-.006,.012*sin(a));
    t=min(t,sdCylAB(q,o,o+vec3(.004*cos(a),-.026+.006*float(i),.004*sin(a)),.0055)); }
  return t; }
float knobD(vec3 q){ vec3 k=q-vec3(-.07,.165,0.);
  float d=sdCylZ(k,.02,.03)-.002; float a=atan(k.y,k.x);
  d+=.0008*smoothstep(-.3,.3,cos(a*24.));
  return min(d,sdCylZ(k,.008,.034)); }
float lampD(vec3 q){ return sdCylY(q-vec3(.005,.034,0.),.016,.01)-.002; }
float petriD(vec3 p){ vec3 q=p-vec3(.13,0.,-.06); float r=length(q.xz);
  float wall=max(abs(r-.052)-.0015,abs(q.y-.007)-.007);
  float floor_=max(r-.053,abs(q.y-.0015)-.0015);
  float agar=max(r-.05,abs(q.y-.004)-.003);
  return min(min(wall,floor_),agar); }
float lidD(vec3 p){ vec3 q=p-vec3(.19,0.,.02); float r=length(q.xz);
  float wall=max(abs(r-.055)-.0015,abs(q.y-.005)-.005);
  return min(wall,max(r-.056,abs(q.y-.0012)-.0012)); }
float slidesD(vec3 p){ vec3 q=place(p,vec3(-.1,.0012,-.07),.35);
  float a=sdRBox(q,vec3(.038,.0012,.013),.0006);
  vec3 q2=place(p,vec3(-.09,.0036,-.05),.1); float b=sdRBox(q2,vec3(.038,.0012,.013),.0006);
  return min(a,b); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=mQ(p);
  r=U(r,baseD(q),3.);
  r=U(r,armD(q),4.);
  r=U(r,stageD(q),5.);
  r=U(r,tubeD(q),6.);
  r=U(r,knobD(q),7.);
  r=U(r,lampD(q),8.);
  r=U(r,petriD(p),9.);
  r=U(r,lidD(p),10.);
  r=U(r,slidesD(p),11.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.) return .5;
  if(id==5.) return .3;
  if(id==6.){ vec3 q=mQ(p); vec3 dir=normalize(tB()-tA()); float s=dot(q-tA(),dir);
    if(s<.012) return .35; if(abs(s-.13)<.004||abs(s-.1)<.002) return .3; return .7; }
  if(id==7.) return .35;
  if(id==8.) return .6;
  if(id==9.){ vec3 q=p-vec3(.13,0.,-.06);
    for(int i=0;i<7;i++){ vec2 c=vec2(sin(float(i)*2.4),cos(float(i)*2.4))*.03*sqrt(float(i)/7.+.1); if(length(q.xz-c)<.006+.002*sin(float(i))) return .35; }
    return .85; }
  if(id==10.) return .9;
  if(id==11.){ vec3 q=place(p,vec3(-.1,.0012,-.07),.35); if(length(q.xz)<.008) return .45; if(abs(q.x)>.022) return .7; return .9; }
  return .7; }
