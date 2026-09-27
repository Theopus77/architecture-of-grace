/* Science Unit 18 "Biology: Ecosystems and Human Impact" — pencil still life: an old tree
   stump with a young sapling growing beside it, and a wooden birdhouse. */
#define CAM_POS vec3(-0.5234,0.2826,-0.7668)
#define CAM_TGT vec3(-0.1756,0.0263,0.1485)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define SC vec3(-.05,0.,.08)
float stump(vec3 p){ vec3 q=p-SC;
  float a=atan(q.z,q.x); float r=length(q.xz);
  float R=.1+.012*sin(a*5.)+.008*fbm(vec2(a*4.,q.y*20.))+ .05*exp(-q.y*25.)*(.6+.4*sin(a*4.+1.));
  float d=max(r-R,abs(q.y-.075)-.075);
  float top=q.y-.15+.01*fbm(q.xz*20.)+.02*smoothstep(.02,.1,q.x+q.z*.3)*0.;
  d=max(d,top);
  d+=.002*sin(a*60.+fbm(vec2(q.y*30.,a))*4.)*step(q.y,.148);
  /* roots */
  for(int i=0;i<4;i++){ float ang=float(i)*1.6+.4; vec3 dir=vec3(cos(ang),0.,sin(ang));
    d=smin(d,sdCapsule(q,dir*.08+vec3(0.,.03,0.),dir*.17,.018),.03); }
  return d*.8; }
float leaf(vec3 q,vec3 base,float ay,float tilt,float L){
  vec3 l=q-base; l.xz=rot(ay)*l.xz; l.xy=rot(tilt)*l.xy; l.y+=.25*l.x*l.x/L;
  return .6*sdEll(l-vec3(L*.5,0.,0.),vec3(L*.5,.004,L*.3)); }
vec2 sapling(vec3 p){ vec3 q=p-vec3(.14,0.,.04);
  float st=sdCapsule(q,vec3(0.),vec3(.01,.22,0.),.005);
  st=min(st,sdCapsule(q,vec3(.004,.1,0.),vec3(.05,.17,0.),.003));
  st=min(st,sdCapsule(q,vec3(.007,.14,0.),vec3(-.04,.2,.01),.003));
  float lv=1e5;
  lv=min(lv,leaf(q,vec3(.05,.17,0.),.3,.4,.05)); lv=min(lv,leaf(q,vec3(.05,.17,0.),-.9,.4,.045));
  lv=min(lv,leaf(q,vec3(-.04,.2,.01),2.8,.4,.05)); lv=min(lv,leaf(q,vec3(-.04,.2,.01),3.9,.5,.045));
  lv=min(lv,leaf(q,vec3(.01,.22,0.),1.4,1.,.05)); lv=min(lv,leaf(q,vec3(.01,.22,0.),-1.7,1.,.05));
  lv=min(lv,leaf(q,vec3(.004,.08,0.),3.,.4,.04));
  float mound=sdEll(q,vec3(.04,.012,.04));
  return vec2(min(st,mound),lv); }
vec3 bq(vec3 p){ vec3 q=p-vec3(.33,0.,.06); q.xz=rot(-.35)*q.xz; return q; }
vec2 birdhouse(vec3 p){ vec3 q=bq(p);
  float body=sdRBox(q-vec3(0.,.07,0.),vec3(.045,.07,.045),.003);
  float gab=max(body-.0, 0.);
  vec2 g=vec2(abs(q.x),q.y-.14); float tri=max(dot(g,vec2(.7071,.7071))-.0318,-g.y); tri=max(tri,abs(q.z)-.045);
  body=min(body,tri-.002);
  body=max(body,-(sdCylZ(q-vec3(0.,.1,-.045),.013,.01)));
  float perch=sdCylZ(q-vec3(0.,.075,-.055),.003,.012);
  vec2 g2=vec2(abs(q.x),q.y-.14);
  float ro=dot(g2,vec2(.7071,.7071))-.04, ri=dot(g2,vec2(.7071,.7071))-.031;
  float roof=max(max(ro,-ri),max(abs(q.z)-.058,-(g2.y+.01)));
  roof=max(roof,g2.x-.062);
  return vec2(min(body,perch),roof); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,stump(p),3.);
  vec2 s=sapling(p); r=U(r,s.x,4.); r=U(r,s.y,5.);
  vec2 b=birdhouse(p); r=U(r,b.x,6.); r=U(r,b.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.){ vec3 q=p-SC; if(n.y>.8&&q.y>.13){ float r=length(q.xz+vec2(.01,0.)); return fract(r/.009+fbm(q.xz*30.)*.3)<.3?.35:.72; } return .38; }
  if(id==4.) return .4; if(id==5.) return .5;
  if(id==6.){ vec3 q=bq(p); return fract(q.y/.025)<.08?.35:.68; }
  if(id==7.) return .4;
  return .7; }
