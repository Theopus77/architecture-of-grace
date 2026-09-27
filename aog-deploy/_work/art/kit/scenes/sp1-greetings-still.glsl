/* sp1 "Greetings and Introductions" — two cups on saucers set facing each other as if for a
   visit, a small teapot between them, and a folded greeting card standing open. */
#define CAM_POS vec3(-0.2202,0.1963,-0.4915)
#define CAM_TGT vec3(-0.0434,0.0078,0.0625)
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
float saucer(vec3 q){ float d=sdCylY(q-vec3(0.,.003,0.),.05-q.y*1.5,.003)-.0015; return d; }
float cupset(vec3 p,vec3 c,float ry){ vec3 q=place(p,c,ry); float s=saucer(q);
  vec3 k=q-vec3(0.,.006,0.); float r=.028+k.y*.25;
  float o=max(length(k.xz)-r,abs(k.y-.022)-.022)-.001; o=max(o,-max(length(k.xz)-r+.003,-(k.y-.006)));
  vec3 h=k-vec3(r+.005,.024,0.); float hd=max(length(vec2(length(h.xy)-.012,h.z))-.0032,-(k.x-r+.002));
  return min(s,min(o,hd)); }
#define TP vec3(.03,0.,.17)
float teapot(vec3 p){ vec3 q=place(p,TP,-.3);
  float b=sdEll(q-vec3(0.,.05,0.),vec3(.055,.045,.055));
  b=max(b,-q.y+.004);
  float lid=sdEll(q-vec3(0.,.092,0.),vec3(.03,.012,.03)); lid=min(lid,length(q-vec3(0.,.108,0.))-.007);
  float sp=sdCapsule(q,vec3(-.04,.04,0.),vec3(-.085,.085,0.),.008-.0*q.y);
  vec3 h=q-vec3(.058,.055,0.); float hd=max(length(vec2(length(h.xy)-.024,h.z))-.005,-(q.x-.05));
  return min(min(b,lid),min(sp,hd)); }
vec3 cdQ(vec3 p){ return place(p,vec3(.17,0.,-.03),-.4); }
float card(vec3 p){ vec3 q=cdQ(p); float d=1e5;
  for(int s=0;s<2;s++){ float a=s==0?.55:-.55; vec3 k=q; k.xz=rot(a)*k.xz;
    d=min(d,sdBox(k-vec3(s==0?-.035:.035,.05,0.),vec3(.035,.05,.0008))); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,cupset(p,vec3(-.08,0.,.04),.2),3.);
  r=U(r,cupset(p,vec3(.12,0.,.09),3.3),4.);
  r=U(r,teapot(p),5.);
  r=U(r,card(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.||id==4.){ vec3 c=id==3.?vec3(-.08,0.,.04):vec3(.12,0.,.09); vec3 q=p-c; if(q.y>.02&&q.y<.04&&length(q.xz)<.024) return .3;
    if(abs(q.y-.036)<.0025&&length(q.xz)>.025) return .45; return .88; }
  if(id==5.){ vec3 q=place(p,TP,-.3); if(abs(q.y-.05)<.004) return .45; if(abs(q.y-.05)<.012&&fract(atan(q.z,q.x)*3.)<.1) return .5; return .8; }
  if(id==6.){ vec3 q=cdQ(p); for(int s=0;s<2;s++){ float a=s==0?.55:-.55; vec3 k=q; k.xz=rot(a)*k.xz; vec2 u=vec2(k.x-(s==0?-.035:.035),k.y-.05);
      if(abs(k.z)<.002&&abs(u.x)<.035&&abs(u.y)<.05){
        if(s==1){ float h=length(u-vec2(-.006,.012))-.009; h=min(h,length(u-vec2(.006,.012))-.009); h=min(h,max(abs(u.x)*.9+(u.y-.014)*-.9-.0,-u.y-.02+abs(u.x))); }
        if(s==0&&k.z<0.){ vec2 v=u-vec2(0.,.01); float fl=1e5; for(int i=0;i<5;i++){ float an=float(i)*1.2566; fl=min(fl,length(v-.009*vec2(cos(an),sin(an)))-.006); }
          if(fl<0.) return abs(fl)<.0012?.3:.7; if(length(v)<.004) return .4; if(abs(v.x)<.001&&v.y<-.01&&v.y>-.035) return .35; }
        if(s==1&&k.z<0.&&abs(u.x)<.024&&u.y<.0&&u.y>-.03&&fract((u.y+.03)/.008)<.22) return .55; } }
    return .9; }
  return .7; }
