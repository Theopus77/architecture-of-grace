/* FCS Unit 8 "Plan It, Cook It, Clean It Up" — pencil still life: a recipe card on a small
   wooden stand (plan), a saucepan with its lid and a wooden spoon (cook), and a dish brush
   resting on a folded dishcloth (clean). */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.05,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define PN vec3(.04,0.,.06)
float pan(vec3 p){ vec3 q=p-PN;
  float body=max(abs(length(q.xz)-.075)-.003,abs(q.y-.045)-.045); body=min(body,sdCylY(q-vec3(0.,.003,0.),.075,.003));
  float rim=sdTorus(q-vec3(0.,.09,0.),.076,.003);
  float lid=max(abs(length(q-vec3(0.,.03,0.))-.07)-.002,.088-q.y); lid=max(lid,length(q.xz)-.077);
  float knob=length((q-vec3(0.,.108,0.))/vec3(1.,.6,1.))*.6-.01;
  vec3 h=q-vec3(-.13,.075,0.); h.xy=rot(-.2)*h.xy; float handle=sdRBox(h,vec3(.06,.008,.012),.006);
  return min(min(min(body,rim),min(lid,knob)),handle); }
float spoon(vec3 p){ vec3 q=p-vec3(.0,.006,-.075); q.xz=rot(-.12)*q.xz;
  float hdl=sdCapsule(q,vec3(-.12,0.,0.),vec3(.06,0.,0.),.0055);
  float bowl=(length((q-vec3(.085,-.0,0.))/vec3(.03,.008,.02))-1.)*.008; return min(hdl,bowl); }
/* recipe card leaning in a slotted block */
vec3 rq(vec3 p){ vec3 q=p-vec3(-.19,0.,.04); q.xz=rot(.3)*q.xz; return q; }
float rblock(vec3 q){ float b=sdRBox(q-vec3(0.,.015,0.),vec3(.045,.015,.025),.004); return max(b,-sdBox(q-vec3(0.,.03,0.),vec3(.05,.01,.0025))); }
vec3 cq(vec3 q){ vec3 c=q-vec3(0.,.085,.012); c.yz=rot(-.18)*c.yz; return c; }
float card(vec3 q){ return sdRBox(cq(q),vec3(.065,.06,.0012),.002); }
float brush(vec3 p){ vec3 q=p-vec3(.2,.03,-.04); q.xz=rot(-.6)*q.xz;
  float head=sdRBox(q,vec3(.028,.009,.02),.006);
  float bristle=max(sdRBox(q-vec3(0.,-.017,0.),vec3(.026,.009,.018),.002),.0);
  float hdl=sdCapsule(q,vec3(.03,.002,0.),vec3(.11,.012,0.),.0065);
  return min(min(head,bristle),hdl); }
float cloth(vec3 p){ vec3 q=p-vec3(.21,0.,-.03); q.xz=rot(-.4)*q.xz;
  return min(sdRBox(q-vec3(0.,.005,0.),vec3(.075,.005,.05),.004),sdRBox(q-vec3(.005,.013,0.),vec3(.07,.004,.048),.004)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pan(p),3.);
  r=U(r,spoon(p),4.);
  vec3 q=rq(p); r=U(r,rblock(q),4.); r=U(r,card(q),5.);
  r=U(r,brush(p+vec3(0.,-.0,0.)),6.);
  r=U(r,cloth(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PN; if(q.y>.1) return .25; if(q.x<-.08) return .3; return .66; }
  if(id==4.) return .55;
  if(id==5.){ vec3 c=cq(rq(p)); if(c.z>0.) return .92; if(abs(c.y-.04)<.004&&abs(c.x)<.045) return .2;
    for(int i=0;i<4;i++){ float y=.015-float(i)*.018; if(abs(c.y-y)<.0022&&c.x>-.05&&c.x<.045-float(i%2)*.02) return .5; }
    if(abs(c.y-.028)<.001) return .6; return .93; }
  if(id==6.){ vec3 q=p-vec3(.2,.03,-.04); q.xz=rot(-.6)*q.xz; return q.y<-.008?(fract(q.x/.005)<.4?.3:.6):.45; }
  if(id==7.){ vec3 q=p-vec3(.21,0.,-.03); q.xz=rot(-.4)*q.xz; float c=mod(floor(q.x/.02)+floor(q.z/.02),2.); return c<1.?.62:.85; }
  return .7; }
