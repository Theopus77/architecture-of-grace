/* s2 "Communities and Illinois" — our town, our county, our state: a thick wooden puzzle
   piece cut in the shape of Illinois with a round dot where Chicago sits on the lake, a little
   wooden house with a pitched roof and chimney standing behind it, and an ear of corn with its
   husks pulled back.
   @params {"mat":{"3":[0.62,1.3,1.0],"4":[0.72,1.3,1.0],"5":[0.4,1.3,1.0],"6":[0.62,1.3,1.0],"7":[0.72,1.2,0.9],"8":[0.5,1.3,1.0]},
            "texlines":{"3":[0.12,0.4,0.6],"4":[0.12,0.4,0.6],"6":[0.12,0.4,0.9],"7":[0.12,0.4,0.6]}} */
#define CAM_POS vec3(-0.3241,0.4481,-0.8478)
#define CAM_TGT vec3(-0.1807,-0.0136,0.1140)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
/* Illinois outline, x east, y north, 0..1 tall */
float sdIL(vec2 p){
  vec2 v[15]; v[0]=vec2(.0,1.); v[1]=vec2(.6,1.); v[2]=vec2(.64,.9); v[3]=vec2(.65,.47); v[4]=vec2(.6,.33);
  v[5]=vec2(.62,.2); v[6]=vec2(.55,.1); v[7]=vec2(.46,.03); v[8]=vec2(.4,.0); v[9]=vec2(.36,.1);
  v[10]=vec2(.25,.24); v[11]=vec2(.2,.4); v[12]=vec2(.05,.55); v[13]=vec2(.04,.74); v[14]=vec2(-.03,.88);
  float d=dot(p-v[0],p-v[0]); float s=1.;
  for(int i=0,j=14;i<15;j=i,i++){
    vec2 e=v[j]-v[i]; vec2 w=p-v[i]; vec2 b=w-e*clamp(dot(w,e)/dot(e,e),0.,1.);
    d=min(d,dot(b,b));
    bvec3 c=bvec3(p.y>=v[i].y,p.y<v[j].y,e.x*w.y>e.y*w.x);
    if(all(c)||all(not(c))) s*=-1.; }
  return s*sqrt(d); }
#define IL vec3(-.07,0.,.0)
#define ILS .24
/* the piece stands upright in a slotted wooden base, leaning back a little */
vec3 ilQ(vec3 p){ vec3 q=p-IL; q.xz=rot(-.3)*q.xz; q.y-=.012; q.yz=rot(.18)*q.yz; return q; }
float piece(vec3 p){ vec3 q=ilQ(p); vec2 u=vec2(q.x,q.y)/ILS+vec2(.33,0.);
  float d2=sdIL(u)*ILS; float h=.008;
  vec2 w=vec2(d2+.002,abs(q.z)-h+.002); return min(max(w.x,w.y),0.)+length(max(w,0.))-.002; }
float stand(vec3 p){ vec3 q=p-IL; q.xz=rot(-.3)*q.xz;
  float b=sdRBox(q-vec3(.0,.013,.0),vec3(.06,.013,.03),.004);
  return max(b,-sdBox(q-vec3(0.,.03,.004),vec3(.05,.02,.0095))); }
/* little wooden house */
#define HS vec3(.1,0.,.13)
vec3 hsQ(vec3 p){ vec3 q=p-HS; q.xz=rot(-.75)*q.xz; return q; }
vec2 house(vec3 p){ vec3 q=hsQ(p); vec2 h=gableHouse(q,vec3(.06,.045,.05),.75,.01);
  float ch=sdRBox(q-vec3(.03,.11,.018),vec3(.009,.025,.009),.002);
  return vec2(h.x,min(h.y,ch)); }
/* ear of corn lying along its own x, husks peeled back toward -x */
vec3 cnQ(vec3 p){ vec3 q=p-vec3(.12,.027,-.1); q.xz=rot(-.5)*q.xz; return q; }
float ear(vec3 p){ vec3 q=cnQ(p); float t=clamp((q.x+.06)/.17,0.,1.);
  float r=.026*(1.-.55*t*t)+.0012*sin(atan(q.z,q.y)*14.)*step(-.06,q.x);
  return max(length(q.yz)-r,abs(q.x-.025)-.09)*.8; }
float husk(vec3 p){ vec3 q=cnQ(p); float d=1e3;
  for(int i=0;i<2;i++){ float sd=i==0?1.:-1.; vec3 h=q-vec3(-.06,0.,0.);
    float t=clamp(-h.x/.11,0.,1.); vec3 c=h-vec3(0.,-.004-.018*t,sd*(.02+.03*t));
    float w=.018*sin(t*3.1416*.9+.25)+.002;
    float lf=max(max(abs(c.y+.3*sd*c.z*0.)-.0018,abs(c.z)-w),max(h.x-.004,-h.x-.11));
    d=min(d,lf*.8); }
  d=min(d,sdCylX(q-vec3(-.075,0.,0.),.011,.016)-.001);   /* the stalk end */
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,piece(p),3.);
  vec2 h=house(p); r=U(r,h.x,4.); r=U(r,h.y,5.);
  r=U(r,stand(p),8.);
  r=U(r,ear(p),6.);
  r=U(r,husk(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=ilQ(p); vec2 u=vec2(q.x,q.z)/ILS+vec2(.33,.5);
    vec2 u2=vec2(q.x,q.y)/ILS+vec2(.33,0.);
    if(q.z<-.0058){ u=u2; if(length(u-vec2(.6,.84))<.035) return .15;                   /* Chicago */
      float rv=abs(u.x-(.25+.1*sin(u.y*9.)))-.004; if(u.y<.55&&u.y>.22&&rv<.004) return .5;
      return .62+.14*(grain(vec3(q.z,q.y,q.x),40.)-.5); }
    return .5; }
  if(id==4.){ vec3 q=hsQ(p);
    if(abs(q.z+.051)<.004||abs(q.x+.061)<.004){ vec2 f=abs(q.z+.051)<.004?q.xy:q.zy;
      if(abs(f.x+.02)<.012&&f.y<.045) return .3;                           /* door */
      if(abs(f.x-.03)<.012&&abs(f.y-.04)<.011) return abs(f.x-.03)<.0012||abs(f.y-.04)<.0012?.5:.35; }
    return .78; }
  if(id==6.){ vec3 q=cnQ(p); float a=atan(q.z,q.y)*14./6.2832; float k=fract(q.x/.007+.5*floor(a));
    return (fract(a)<.14||k<.16)?.3:.7; }
  if(id==7.){ return .7+.1*sin(cnQ(p).x*300.); }
  if(id==8.) return .45+.15*(grain(p.zxy,60.)-.5);
  return .7; }
