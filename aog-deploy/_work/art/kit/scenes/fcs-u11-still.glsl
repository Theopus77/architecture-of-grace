/* FCS Unit 11 "Measuring and Reading a Recipe" — pencil still life: a glass measuring jug with
   marked lines, half full, a recipe card propped against it, a wire whisk and an egg. */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.06,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define JG vec3(.05,0.,.07)
vec3 jq(vec3 p){ vec3 q=p-JG; q.xz=rot(-.6)*q.xz; return q; }   /* handle toward +x, spout toward -x */
float jug(vec3 p){ vec3 q=jq(p); float r=.06+q.y*.06+.012*smoothstep(.1,.16,q.y)*smoothstep(-.02,-.06,q.x);
  float wall=max(abs(length(q.xz)-r)-.0025,abs(q.y-.08)-.08); float bot=sdCylY(q-vec3(0.,.004,0.),.06,.004);
  vec3 h=q-vec3(.078,.09,0.); float handle=max(sdRBox(h,vec3(.03,.055,.007),.006),-sdRBox(h-vec3(.008,0.,0.),vec3(.02,.042,.02),.004));
  handle=max(handle,.06-q.x);
  return min(min(wall,bot),handle); }
float milk(vec3 p){ vec3 q=jq(p); return sdCylY(q-vec3(0.,.045,0.),.06+.045*.06-.004,.041); }
vec3 cq(vec3 p){ vec3 q=p-vec3(-.1,0.,.05); q.xz=rot(.35)*q.xz; q.yz=rot(-.3)*q.yz; return q; }
float card(vec3 p){ vec3 q=cq(p); return sdRBox(q-vec3(0.,.055,0.),vec3(.065,.055,.0012),.002); }
float whisk(vec3 p){ vec3 q=p-vec3(.07,.012,-.09); q.xz=rot(.2)*q.xz;
  float hdl=sdCapsule(q,vec3(-.16,0.,0.),vec3(-.06,0.,0.),.009);
  float wires=1e5; for(int i=0;i<4;i++){ float a=float(i)*.785; vec3 w=q+vec3(.06,0.,0.); w.yz=rot(a)*w.yz;
    float x=clamp(w.x/.1,0.,1.); float R=.028*sin(x*3.14159)+.003; vec2 c=vec2(w.x,length(w.yz)); vec2 u=vec2(w.x-.05,w.y);
    wires=min(wires,max(length(vec2(abs(w.y)-R,w.z))-.0012,-w.x+0.)); wires=max(wires,w.x-.1); } return min(hdl,wires); }
float egg(vec3 p){ vec3 q=p-vec3(-.2,.022,-.07); q.xz=rot(.8)*q.xz; q.xy=rot(1.45)*q.xy; q.y+=.0; return (length(q/vec3(.022,.03,.022)+vec3(0.,0.,0.))-1.)*.022; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,jug(p),3.);
  r=U(r,milk(p),4.);
  r=U(r,card(p),5.);
  r=U(r,whisk(p),6.);
  r=U(r,egg(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=jq(p); if(q.z<-.03&&q.x<.05){ for(int i=1;i<6;i++){ float y=float(i)*.025; if(abs(q.y-y)<.0014&&abs(q.x)<(i%2==0?.022:.012)) return .15; } } return .95; }
  if(id==4.) return .86;
  if(id==5.){ vec3 q=cq(p); if(q.z>0.) return .92; vec2 u=q.xy-vec2(0.,.055);
    if(abs(u.y-.035)<.004&&abs(u.x)<.04) return .2;
    for(int i=0;i<4;i++){ float y=.012-float(i)*.016; if(abs(u.y-y)<.002&&u.x>-.05&&u.x<.04-float(i%2)*.015) return .5; if(abs(u.y-y)<.003&&abs(u.x+.056)<.003) return .3; }
    return .93; }
  if(id==6.){ vec3 q=p-vec3(.07,.012,-.09); q.xz=rot(.2)*q.xz; return q.x<-.065?.35:.65; }
  if(id==7.) return .85;
  return .7; }
