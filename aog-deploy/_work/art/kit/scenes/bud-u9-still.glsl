/* Buddhist Texts Unit 9 "Genres of the Pali Canon" — pencil still life: an open wooden
   manuscript box holding palm-leaf bundles of different sizes stacked like books on a shelf,
   and a clay oil lamp beside it. Hint-lines only, no script. No figures. */
#define CAM_POS vec3(-0.2035,0.2740,-0.7558)
#define CAM_TGT vec3(-0.1084,-0.0036,0.0373)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define XC vec3(.02,0.,.12)
float box(vec3 p){ vec3 q=ry(p-XC,-.25);
  float o=sdRBox(q-vec3(0.,.08,0.),vec3(.17,.08,.07),.004);
  float i=sdBox(q-vec3(0.,.09,-.02),vec3(.16,.078,.07));
  float shelf=sdRBox(q-vec3(0.,.08,0.),vec3(.165,.004,.066),.001);
  return min(max(o,-i),shelf); }
float bundles(vec3 p){ vec3 q=ry(p-XC,-.25); float d=1e5;
  d=min(d,palmBundle(q-vec3(-.07,.004,0.),.075,.024,.012)); d=min(d,palmBundle(q-vec3(.085,.004,0.),.07,.022,.01));
  d=min(d,palmBundle(q-vec3(-.075,.084,0.),.07,.02,.009)); d=min(d,palmBundle(q-vec3(.08,.084,0.),.072,.022,.011));
  d=min(d,palmBundle(q-vec3(-.07,.126,0.),.06,.018,.008));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,box(p),3.);
  r=U(r,bundles(p),4.);
  r=U(r,diya(ry(p-vec3(.28,0.,-.07),2.7),1.3),5.);
  r=U(r,flameD(ry(p-vec3(.28,0.,-.07),2.7)-DIYA_TIP(1.3),.045),6.);
  r=U(r,leafD(ry(p-vec3(.0,0.,-.1),.05),.16,.025),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=ry(p-XC,-.25); return fract(q.x*35.+fbm(q.xy*vec2(3.,50.))*1.4)<.3?.33:.43; }
  if(id==4.){ vec3 q=ry(p-XC,-.25); float y=mod(q.y-.004,.08); return (y<.013||(y>.02&&y<.04&&fract(q.y*1200.)<.4))?.4:.8; }
  if(id==5.) return .5;
  if(id==6.) return .97;
  if(id==7.) return leafTone(ry(p-vec3(.0,0.,-.1),.05),.16,.025);
  return .7; }
