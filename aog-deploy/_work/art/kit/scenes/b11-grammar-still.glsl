/* Room "English Grammar" — pencil still life: a thick dictionary standing on its end with
   a ribbon bookmark, a squat ink bottle, and a fountain pen lying in front. */
#define CAM_POS vec3(-0.3849,0.3671,-0.8130)
#define CAM_TGT vec3(-0.1387,0.0319,0.0641)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define DIC vec3(-.03,0.,.06)
#define INK vec3(.25,0.,.15)
vec3 dicQ(vec3 p){ return place(p,DIC,.35); }
float dictD(vec3 p){ vec3 q=dicQ(p);
  vec3 s=vec3(.045,.12,.085);
  vec3 c=q-vec3(0.,s.y,0.);
  float boards=sdRBox(vec3(abs(c.x)-s.x+.003,c.y,c.z),vec3(.003,s.y,s.z),.0015);
  float pages=sdRBox(c-vec3(0.,0.,.001),vec3(s.x-.004,s.y-.004,s.z-.005),.001);
  float sp=max(length(vec2(c.x,(c.z+s.z-.012)*1.6))-s.x-.0005,c.z+s.z-.012); sp=max(sp,abs(c.y)-s.y);
  float d=min(min(boards,pages),sp);
  for(int i=0;i<4;i++){ float y=-.07+float(i)*.047; d=min(d,max(max(length(vec2(c.x,(c.z+s.z-.012)*1.6))-s.x-.0028,abs(c.y-y)-.0025),c.z+s.z-.013)); }
  return d; }
float ribbon(vec3 p){ vec3 q=dicQ(p); vec3 r=q-vec3(.01,.24,.02);
  return sdRBox(r-vec3(0.,.0,.0),vec3(.004,.0015,.012),.0008); }
float inkD(vec3 p){ vec3 q=p-INK;
  float body=sdCylY(q-vec3(0.,.025,0.),.05,.024)-.007;
  float sh=sdCylY(q-vec3(0.,.052,0.),.024,.006)-.003;
  float cap=sdCylY(q-vec3(0.,.068,0.),.025+.0008*smoothstep(-.3,.3,cos(atan(q.z,q.x)*30.)),.011)-.002;
  return min(smin(body,sh,.01),cap); }
vec3 penQ(vec3 p){ vec3 q=p-vec3(.2,.037,-.07); q.xz=rot(-.45)*q.xz; return q; }
float penD(vec3 p){ vec3 q=penQ(p);
  float barrel=sdCapsule(q,vec3(-.07,0.,0.),vec3(.04,0.,0.),.0082);
  float grip=sdCone(q.yxz-vec3(0.,.055,0.),.0075,.0055,.015);
  float nib=max(sdEll(q-vec3(.084,.001,0.),vec3(.018,.0015,.005)),-q.y+.0-.0015);
  nib=sdEll(q-vec3(.08,.0,0.),vec3(.02,.0018,.0055));
  float clip=sdRBox(q-vec3(-.045,.0095,0.),vec3(.024,.0013,.0018),.0008);
  float band=sdCylX(q-vec3(.036,0.,0.),.0088,.0025);
  return min(min(min(barrel,grip),nib),min(clip,band)); }
float bookFlat(vec3 p){ vec3 q=place(p,vec3(.2,0.,-.06),-.2); return bookD(q,vec3(.1,.014,.07)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,dictD(p),3.);
  r=U(r,ribbon(p),4.);
  r=U(r,inkD(p),5.);
  r=U(r,penD(p),6.);
  r=U(r,bookFlat(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=dicQ(p)-vec3(0.,.12,0.);
    if(abs(q.x)<.04&&q.z>-.07){ if(q.z>.075||abs(q.y)>.114) return fract((q.x)/.0035)<.35?.72:.92; }
    if(q.z<-.07){ for(int i=0;i<4;i++){ if(abs(q.y-(-.07+float(i)*.047))<.005) return .18; } }
    return .36; }
  if(id==4.) return .3;
  if(id==5.){ vec3 q=p-INK; if(q.y>.055) return .2; if(q.y<.04&&abs(q.y-.022)<.012&&abs(atan(q.z,q.x)+1.9)<.5) return .9; return .35; }
  if(id==6.){ vec3 q=penQ(p); if(q.x>.062) return .75; if(q.x>.04) return .25; if(abs(q.x-.036)<.003) return .8; if(q.y>.008&&q.x<-.02) return .8; return .22; }
  if(id==7.){ if(abs(n.y)<.5) return fract(p.y/.003)<.3?.7:.88; return .55; }
  return .7; }
