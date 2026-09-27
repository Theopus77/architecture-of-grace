/* Chinese Classics Unit 3 "Family, Friends and Harmony" — pencil still life: a round clay
   teapot with three little cups on a round wooden tray (tea poured for family and guests),
   and two mandarin oranges with leaves, the New Year gift of good wishes. */
#define CAM_POS vec3(-0.3052,0.2772,-0.6727)
#define CAM_TGT vec3(-0.1303,-0.0089,0.0981)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define TR vec3(0.,0.,.1)
float tray(vec3 p){ vec3 q=p-TR; float r=length(q.xz);
  float d=sdCylY(q-vec3(0.,.008,0.),.2,.008)-.003;
  d=max(d,-sdCylY(q-vec3(0.,.018,0.),.185,.006));
  d=min(d,max(abs(r-.196)-.006,abs(q.y-.012)-.01)-.002);
  return d; }
#define TP vec3(-.02,.019,.14)
float teapot(vec3 p){ vec3 q=p-TP; q.xz=rot(.25)*q.xz;
  float body=(length((q-vec3(0.,.062,0.))/vec3(.085,.066,.085))-1.)*.066;
  body=max(body,-(q.y-.003));
  float foot=sdCylY(q-vec3(0.,.006,0.),.052,.006)-.002;
  float lid=(length((q-vec3(0.,.118,0.))/vec3(.045,.018,.045))-1.)*.018; lid=max(lid,-(q.y-.118));
  float knob=length(q-vec3(0.,.142,0.))-.011;
  float rim=sdTorus(q-vec3(0.,.119,0.),.047,.003);
  /* spout: a curved tube to the right */
  vec3 s=q-vec3(.07,.05,0.); float sp=1e5;
  for(int i=0;i<4;i++){ float t=float(i)/4., t2=float(i+1)/4.;
    vec3 a=vec3(t*.07,t*t*.07+t*.02,0.), b=vec3(t2*.07,t2*t2*.07+t2*.02,0.);
    sp=min(sp,sdCapsule(s,a,b,.017-.009*t)); }
  sp=max(sp,-sdCapsule(s,vec3(.068,.09,0.),vec3(.08,.1,0.),.005));
  /* handle: a loop on the left */
  float h=sdTorus((q-vec3(-.1,.07,0.)).xzy,.035,.007); h=max(h,-(-q.x-.075));
  float d=smin(body,sp,.012); d=smin(d,h,.008); d=min(d,min(foot,min(lid,knob))); d=min(d,rim);
  return d; }
float cup(vec3 p,vec3 c){ vec3 q=p-c;
  float d=sdCone(q-vec3(0.,.022,0.),.022,.032,.022)-.002;
  d=max(d,-sdCone(q-vec3(0.,.03,0.),.017,.029,.02));
  d=min(d,sdCylY(q-vec3(0.,.002,0.),.016,.003));
  return d; }
float cups(vec3 p){ return min(min(cup(p,vec3(.14,.019,.04)),cup(p,vec3(.07,.019,-.04))),cup(p,vec3(-.12,.019,-.02))); }
float orange(vec3 p,vec3 c){ vec3 q=p-c; float d=(length(q/vec3(1.,.85,1.))-.042)*.85; d+=.0008*fbm(q.xz*400.+q.y*300.); return max(d,-(length(q-vec3(0.,.036,0.))-.006)); }
#define O1 vec3(.3,.036,.02)
#define O2 vec3(.39,.036,.1)
float oranges(vec3 p){ return min(orange(p,O1),orange(p,O2)); }
float leaf(vec3 p,vec3 c,float a){ vec3 q=p-c; q.xz=rot(a)*q.xz; q.xy=rot(.3)*q.xy;
  float w=.012*sin(clamp(q.x/.05,0.,1.)*3.1416); return max(max(abs(q.z)-w,abs(q.y+q.z*q.z*3.)-.0012),max(-q.x,q.x-.05)); }
float leaves(vec3 p){ return min(min(leaf(p,O1+vec3(0.,.036,0.),.4),leaf(p,O1+vec3(0.,.036,0.),2.4)),leaf(p,O2+vec3(0.,.036,0.),-.8)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,tray(p),3.);
  r=U(r,teapot(p),4.);
  r=U(r,cups(p),5.);
  r=U(r,oranges(p),6.);
  r=U(r,leaves(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5+.15*grain(p*vec3(1.,1.,1.),30.);
  if(id==4.){ vec3 q=p-TP; if(abs(q.y-.1)<.002) return .3; return .42; }
  if(id==5.){ vec3 q=p; if(n.y>.5&&q.y>.04) return .35; return .88; }
  if(id==6.) return .55;
  if(id==7.) return .3;
  return .7; }
