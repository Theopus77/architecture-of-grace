/* Social Studies Unit 18 "Human Geography" — pencil still life: a model town on a board:
   tall city blocks with rows of windows, small houses with pitched roofs, a road and round
   trees, to show where and how people live. */
#define CAM_POS vec3(-0.3615,0.3010,-0.9393)
#define CAM_TGT vec3(-0.2245,0.0604,0.0916)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define TC vec3(.08,0.,.14)
vec3 tq(vec3 p){ vec3 q=p-TC; q.xz=rot(-.3)*q.xz; return q; }
vec2 town(vec3 p){
  vec3 q=tq(p);
  float board=sdRBox(q-vec3(0.,.006,0.),vec3(.26,.006,.13),.003);
  float towers=1e5;
  towers=min(towers,sdRBox(q-vec3(.04,.012+.11,.06),vec3(.032,.11,.03),.002));
  towers=min(towers,sdRBox(q-vec3(.11,.012+.075,.07),vec3(.03,.075,.035),.002));
  towers=min(towers,sdRBox(q-vec3(-.03,.012+.08,.07),vec3(.028,.08,.028),.002));
  towers=min(towers,sdRBox(q-vec3(.04,.012+.235,.06),vec3(.012,.012,.012),.002));
  towers=min(towers,sdCylY(q-vec3(.04,.012+.26,.06),.0015,.03));
  float houses=1e5;
  for(int i=0;i<3;i++){ vec3 c=q-vec3(-.19+float(i)*.065,.012,-.02+float(i%2)*.03);
    vec2 h=gableHouse(c,vec3(.022,.018,.02),1.,.005); houses=min(houses,min(h.x,h.y)); }
  for(int i=0;i<2;i++){ vec3 c=q-vec3(.2,.012,-.02+float(i)*.07); c.xz=rot(1.5708)*c.xz;
    vec2 h=gableHouse(c,vec3(.022,.018,.02),1.,.005); houses=min(houses,min(h.x,h.y)); }
  float trees=1e5;
  for(int i=0;i<4;i++){ vec3 c=q-vec3(-.2+float(i)*.06,.012,.09);
    trees=min(trees,min(sdCylY(c-vec3(0.,.012,0.),.003,.012),length(c-vec3(0.,.035,0.))-.018)); }
  return vec2(min(board,min(towers,houses)),trees); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 t=town(p); r=U(r,t.x,3.); r=U(r,t.y,4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=tq(p);
    if(q.y<.0125){ if(abs(q.z-.02)<.018&&abs(q.x)<.25) return abs(q.z-.02)<.0015&&fract(q.x/.03)<.5?.9:.35; return .7; }  /* road with a dashed centre line */
    if(q.y>.03&&abs(n.y)<.5&&q.x>-.07){ vec2 w=vec2(fract((q.x+q.z)/.014),fract(q.y/.016)); if(w.x>.3&&w.x<.75&&w.y>.3&&w.y<.8) return .25; }
    if(q.x<-.09||q.x>.16) return q.y>.045||(abs(n.y)>.3&&q.y>.03)?.35:.82;       /* dark roofs on light houses */
    return .8; }
  if(id==4.) return .4;
  return .7; }
