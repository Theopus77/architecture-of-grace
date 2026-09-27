/* Spanish Unit 2 "Colors and Numbers" — pencil still life: an open box of crayons in six shades, two more
   crayons on the table, beside number blocks 1, 2 and 3. */
#define CAM_POS vec3(-0.4342,0.3667,-0.6190)
#define CAM_TGT vec3(-0.2271,-0.0228,0.1513)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define BH .036
#define B1 vec3(-.14,BH,.0)
#define B2 vec3(-.06,BH,-.02)
#define B3 vec3(-.1,3.*BH+.001,-.005)
#define CB vec3(.06,0.,.03)
#define CRY .3
vec3 cq(vec3 p){ vec3 q=p-CB; q.xz=rot(CRY)*q.xz; return q; }
/* six crayons standing in an open box, each a different shade, at different heights */
float crH(int i){ return i==0?.155:i==1?.17:i==2?.145:i==3?.175:i==4?.15:.165; }
float crayon(vec3 q,float h){ float body=sdCylY(q-vec3(0.,h*.5,0.),.0095,h*.5);
  float tip=sdCone(q-vec3(0.,h+.011,0.),.0095,.003,.011); return min(body,tip)-.0005; }
float crayonsIn(vec3 p){ vec3 q=cq(p); float d=1e5;
  for(int i=0;i<6;i++){ float fi=float(i); vec3 c=q-vec3(-.05+fi*.02,.0,fi==1.||fi==4.?.009:-.004); d=min(d,crayon(c,crH(i))); } return d; }
float box(vec3 p){ vec3 q=cq(p); float o=sdRBox(q-vec3(0.,.06,0.),vec3(.066,.06,.02),.003);
  float cut=sdBox(q-vec3(0.,.07,0.),vec3(.062,.06,.016)); o=max(o,-cut);
  vec3 f=q-vec3(0.,.12,-.02); float flap=max(sdRBox(f,vec3(.066,.004,.02),.002),-(f.z)); /* the front flap is cut in a curve */
  o=max(o,-(length((q.xy-vec2(0.,.155))/vec2(.09,.05))-1.)*.05*step(q.z,-.012));
  return o; }
float loose(vec3 p){ vec3 q=p-vec3(.17,.0095,-.06); q.xz=rot(-.4)*q.xz; float a=crayon(q.yxz*vec3(1.,1.,1.)+vec3(.08,0.,0.),.13);
  vec3 r=p-vec3(.2,.0095,-.02); r.xz=rot(-.1)*r.xz; float b=crayon(r.yxz+vec3(.08,0.,0.),.12); return min(a,b); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,lblock(p,B1,.25,BH,49,50),3.);
  r=U(r,lblock(p,B2,-.08,BH,50,51),4.);
  r=U(r,lblock(p,B3,.1,BH,51,49),5.);
  r=U(r,box(p),6.);
  r=U(r,crayonsIn(p),7.);
  r=U(r,loose(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return lblockInk(p,B1,.25,BH,49,50);
  if(id==4.) return lblockInk(p,B2,-.08,BH,50,51);
  if(id==5.) return lblockInk(p,B3,.1,BH,51,49);
  if(id==6.){ vec3 q=cq(p); if(q.z<-.018&&abs(q.y-.05)<.022&&abs(q.x)<.05){ if(abs(q.y-.05)>.018) return .3; return .9; }  /* the label panel */
    return q.y<.02?.35:.62; }
  if(id==7.){ vec3 q=cq(p); int k=int(floor((q.x+.06)/.02)); float t=k==0?.15:k==1?.35:k==2?.55:k==3?.25:k==4?.7:.45;
    float y=q.y-crH(k); if(y<-.022&&y>-.03) return t+.25; return t; }        /* a paper-wrapper line near the tip */
  if(id==8.){ return p.x>.19?.3:.55; }
  return .7; }
