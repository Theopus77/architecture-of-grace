/* h12 "The Blueprint" — a blueprint unrolled on the table with a floor plan in pale lines,
   two more rolled blueprints behind it, a drafting compass standing open on the sheet, and a
   T-square lying across the edge. */
#define CAM_POS vec3(-0.3947,0.2403,-0.6561)
#define CAM_TGT vec3(-0.1562,-0.0140,0.0911)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
vec3 shQ(vec3 p){ vec3 q=p-vec3(.04,0.,0.); q.xz=rot(.1)*q.xz; return q; }
float sheet(vec3 p){ vec3 q=shQ(p);
  float s=sdBox(q-vec3(0.,.0012,0.),vec3(.16,.001,.1));
  float roll=sdCylX(q-vec3(0.,.016,.112),.016,.16);
  return min(s,roll); }
float rolls(vec3 p){ vec3 q=p-vec3(-.02,0.,.21); q.xz=rot(-.25)*q.xz;
  float a=sdCylX(q-vec3(0.,.022,0.),.022,.17)-.001;
  vec3 b=p-vec3(.02,.0,.26); b.xz=rot(-.05)*b.xz; b.xy=rot(.12)*b.xy;
  float c=sdCylX(b-vec3(.0,.04,0.),.02,.17)-.001;
  a=max(a,-sdCylX(q-vec3(0.,.022,0.),.012,.2)); c=max(c,-sdCylX(b-vec3(0.,.04,0.),.011,.2));
  return min(a,c); }
#define CP vec3(.06,0.,-.01)
float compass(vec3 p){ vec3 q=place(p,CP,-.35); float H=.15;
  vec3 top=vec3(0.,H,0.);
  float l1=sdCapsule(q,top,vec3(-.045,.003,0.),.0035);
  float l2=sdCapsule(q,top,vec3(.045,.004,0.),.0035);
  float head=sdCylZ(q-top,.009,.006)-.002;
  float knob=sdCapsule(q,top,top+vec3(0.,.025,0.),.0035);
  float lead=sdCapsule(q,vec3(.045,.004,0.),vec3(.048,.0,0.),.0015);
  float arc=max(sdTorus((q-vec3(0.,H-.06,0.)).xzy,.03,.0015),-(q.y-(H-.06)));
  return min(min(min(l1,l2),min(head,knob)),min(lead,arc)); }
vec3 tsQ(vec3 p){ vec3 q=p-vec3(.14,.003,-.07); q.xz=rot(-.45)*q.xz; return q; }
float tsquare(vec3 p){ vec3 q=tsQ(p);
  float blade=sdRBox(q,vec3(.13,.0022,.014),.001);
  float head=sdRBox(q-vec3(-.13,.004,0.),vec3(.012,.0065,.05),.002);
  return min(blade,head); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,sheet(p),3.);
  r=U(r,rolls(p),4.);
  r=U(r,compass(p),5.);
  r=U(r,tsquare(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=shQ(p); if(q.y>.004) return .4; vec2 u=q.xz; float a=.42;
    if(fract(u.x/.02)<.06||fract(u.y/.02)<.06) a=.5;                     /* grid */
    float room=sdBox2(u-vec2(0.,.0),vec2(.11,.07));
    if(abs(room)<.0022) a=.92;
    if(abs(u.x+.02)<.0018&&u.y>-.07&&u.y<.03) a=.92;                       /* inner walls */
    if(abs(u.y-.01)<.0018&&u.x>-.02&&u.x<.11) a=.92;
    if(abs(u.y+.03)<.0018&&u.x>-.11&&u.x<-.02) a=.92;
    if(abs(length(u-vec2(-.02,.03))-.025)<.0012&&u.x>-.02&&u.y<.03) a=.85;   /* door swing */
    if(abs(u.y+.085)<.0012&&abs(u.x)<.11) a=.8;                              /* dimension line */
    return a; }
  if(id==4.) return .5;
  if(id==5.) return .45;
  if(id==6.){ vec3 q=tsQ(p); if(q.x>-.12&&q.z<-.01&&fract(q.x/.01)<.12) return .3; return .78; }
  return .7; }
