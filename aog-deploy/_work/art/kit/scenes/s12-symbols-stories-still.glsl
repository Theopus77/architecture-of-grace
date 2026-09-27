/* s12 "Symbols and Stories of Our Country" — for the youngest citizens: an old bronze bell
   hanging from a wooden yoke on two posts, an open picture book of stories, and a thick wooden
   five-pointed star lying on the table.
   @params {"mat":{"3":[0.5,1.3,1.0],"4":[0.45,1.4,1.0],"5":[0.93,1.0,0.6],"6":[0.45,1.2,0.9],"7":[0.7,1.3,1.0]},
            "texlines":{"3":[0.12,0.4,0.5],"4":[0.12,0.4,0.5],"5":[0.12,0.4,0.85],"7":[0.12,0.4,0.6]}} */
#define CAM_POS vec3(-0.5662,0.5438,-1.1413)
#define CAM_TGT vec3(-0.3782,-0.0616,0.1205)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
/* bell frame: base, two posts, a yoke beam; the bell hangs from the beam */
#define BF vec3(.0,0.,.12)
#define BFR .22
vec3 bfQ(vec3 p){ return P(p,BF,BFR); }
float frameD(vec3 p){ vec3 q=bfQ(p);
  float base=sdRBox(q-vec3(0.,.01,0.),vec3(.12,.01,.05),.004);
  vec3 pq=q; pq.x=abs(pq.x)-.09;
  float post=sdRBox(pq-vec3(0.,.12,0.),vec3(.009,.11,.009),.002);
  float brace=sdCapsule(pq,vec3(0.,.02,-.04),vec3(0.,.07,-.004),.004);
  brace=min(brace,sdCapsule(pq,vec3(0.,.02,.04),vec3(0.,.07,.004),.004));
  float beam=sdRBox(q-vec3(0.,.232,0.),vec3(.11,.012,.014),.003);
  return min(min(base,post),min(brace,beam)); }
float bellR(float y){ float t=clamp(y/.13,0.,1.); return .064-.028*pow(t,.7)-.01*t*t*t+.006*exp(-y*200.); }
float bellD(vec3 p){ vec3 q=bfQ(p)-vec3(0.,.075,0.); float r=length(q.xz);
  float d=(r-bellR(q.y))*.8; d=max(d,max(-q.y,q.y-.13));
  d=max(d,-(max(r-bellR(q.y)+.005,q.y-.12)));
  d=min(d,sdTorus(q-vec3(0.,.005,0.),.068,.005));                                  /* lip */
  d=min(d,sdTorus(q-vec3(0.,.1,0.),bellR(.1)+.0008,.0022));
  d=min(d,sdTorus(q-vec3(0.,.035,0.),bellR(.035)+.0008,.0018));
  d=min(d,sdCylY(q-vec3(0.,.137,0.),.012,.012)-.002);                                /* crown */
  d=min(d,length(q-vec3(0.,.02,0.))-.011);                                           /* clapper ball */
  return d; }
/* open storybook, front left */
#define BK vec3(-.14,0.,-.08)
vec3 bkQ(vec3 p){ vec3 q=P(p,BK,.3); q.yz=rot(-.12)*q.yz; return q; }
/* wooden star */
#define ST vec3(.16,0.,-.1)
float star2(vec2 u,float R){ float a=atan(u.y,u.x); float s=6.2832/5.; a=mod(a+s*.5+1.5708,s)-s*.5;
  vec2 v=length(u)*vec2(cos(a),abs(sin(a)));
  vec2 A=vec2(R,0.), B=vec2(R*.42*cos(s*.5),R*.42*sin(s*.5));
  vec2 e=B-A, w=v-A; vec2 b=w-e*clamp(dot(w,e)/dot(e,e),0.,1.);
  return -length(b)*sign(e.x*w.y-e.y*w.x); }
float starD(vec3 p){ vec3 q=P(p,ST,.5); float d2=star2(q.xz,.06);
  vec2 w=vec2(d2+.003,abs(q.y-.011)-.011+.003); return min(max(w.x,w.y),0.)+length(max(w,0.))-.003; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,frameD(p),3.);
  r=U(r,bellD(p),4.);
  vec2 b=bookO(bkQ(p),.08,.1); r=U(r,b.x,5.); r=U(r,b.y,6.);
  r=U(r,starD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return .5+.15*(grain(bfQ(p).zxy,50.)-.5);
  if(id==4.){ vec3 q=bfQ(p)-vec3(0.,.075,0.); float a=atan(q.z,q.x); if(abs(a+2.3)<.12&&q.y<.1&&q.y>.01) return .92; return .45; }
  if(id==5.){ vec3 q=bkQ(p); float x=abs(q.x); vec2 u=vec2(x-.08,q.z);
    if(q.x<-.004){ vec2 c=u-vec2(0.,.02); float s=star2(c,.035); if(abs(s)<.0018) return .25; if(s<0.) return .7;   /* a star drawn on the left page */
      return lines2(u+vec2(0.,.055),vec2(.055,.018),.012,3.)>0.?.6:.95; }
    if(x<.004) return .7;
    if(q.x>.004){
      return lines2(u+vec2(0.,.01),vec2(.055,.06),.012,7.)>0.?.6:.95; }
    return .95; }
  if(id==6.) return .45;
  if(id==7.) return .65+.15*(grain(P(p,ST,.5),60.)-.5);
  return .7; }
