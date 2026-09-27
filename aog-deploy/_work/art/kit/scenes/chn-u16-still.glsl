/* Chinese Classics Unit 16 "Comparison and Debate" — pencil still life: a wooden go (weiqi)
   board on short legs with a game under way, black and white stones meeting on the grid, and
   two round lidded bowls of stones, one for each player (two views in dialogue). */
#define CAM_POS vec3(-0.3162,0.2646,-0.6424)
#define CAM_TGT vec3(-0.1475,-0.0195,0.0864)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define BC vec3(-.02,0.,.14)
#define BS .15
#define BY .06
#define GS .03
vec3 bQ(vec3 p){ vec3 q=p-BC; q.xz=rot(.18)*q.xz; return q; }
float board(vec3 p){ vec3 q=bQ(p);
  float d=sdRBox(q-vec3(0.,BY*.5+.012,0.),vec3(BS,BY*.5,BS),.004);
  vec3 l=vec3(abs(q.x)-BS+.03,q.y-.008,abs(q.z)-BS+.03);
  d=min(d,sdCylY(l,.016,.008)-.002);
  return d; }
/* stones sit at grid points; a fixed little game in the middle */
float stoneAt(vec2 g){ /* returns 1 black, 2 white, 0 none */
  vec2 k=g; float v=0.;
  if(k==vec2(0.,0.)||k==vec2(1.,0.)||k==vec2(-1.,1.)||k==vec2(0.,-1.)||k==vec2(2.,1.)||k==vec2(-3.,-2.)||k==vec2(3.,2.)) v=1.;
  if(k==vec2(0.,1.)||k==vec2(1.,1.)||k==vec2(-1.,0.)||k==vec2(1.,-1.)||k==vec2(2.,-1.)||k==vec2(-2.,2.)||k==vec2(-3.,1.)) v=2.;
  return v; }
vec2 stones(vec3 p){ vec3 q=bQ(p)-vec3(0.,BY+.012,0.);
  vec2 g=clamp(floor(q.xz/GS+.5),-4.,4.); float v=stoneAt(g);
  if(v<.5) return vec2(1e5,0.);
  vec3 c=q-vec3(g.x*GS,.006,g.y*GS);
  return vec2((length(c/vec3(.0135,.0065,.0135))-1.)*.0065,v); }
float bowl(vec3 p,vec3 c){ vec3 q=p-c;
  vec3 b=q-vec3(0.,.035,0.);
  float d=(length(b/vec3(.06,.04,.06))-1.)*.04; d=max(d,-q.y+.004);
  d=min(d,sdCylY(q-vec3(0.,.005,0.),.03,.005));
  float lid=(length((q-vec3(0.,.062,0.))/vec3(.052,.02,.052))-1.)*.02; lid=max(lid,-(q.y-.062));
  return min(d,lid); }
#define W1 vec3(.27,0.,.02)
#define W2 vec3(.34,0.,.2)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,board(p),3.);
  vec2 s=stones(p); r=U(r,s.x,s.y>1.5?5.:4.);
  r=U(r,bowl(p,W1),6.);
  r=U(r,bowl(p,W2),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bQ(p); float a=.6+.12*grain(q,30.);
    if(n.y>.8&&abs(q.x)<BS-.012&&abs(q.z)<BS-.012){ vec2 f=abs(fract(q.xz/GS+.5)-.5)*GS; if(min(f.x,f.y)<.0009&&abs(q.x)<4.02*GS&&abs(q.z)<4.02*GS) a=.25;
      if(length(q.xz)<.003) a=.2; }
    return a; }
  if(id==4.) return .12;
  if(id==5.) return .93;
  if(id==6.) return .4+.12*grain(p,40.);
  if(id==7.) return .6+.12*grain(p,40.);
  return .7; }
