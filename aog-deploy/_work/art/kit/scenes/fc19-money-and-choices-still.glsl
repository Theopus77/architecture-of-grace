/* fc19 "Money and Choices" — a ceramic piggy bank with a coin going into its slot, a few
   coins on the table, and a blank price tag on a string. */
#define CAM_POS vec3(-0.4294,0.2543,-0.6788)
#define CAM_TGT vec3(-0.1809,-0.0110,0.0999)
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
#define PG vec3(0.,0.,.08)
vec3 pQ(vec3 p){ return place(p,PG,-.3); }   /* pig faces -x */
float pig(vec3 p){ vec3 q=pQ(p);
  float body=sdEll(q-vec3(0.,.085,0.),vec3(.1,.07,.068));
  vec3 s=q-vec3(-.1,.09,0.); float snout=sdCylX(s,.026,.018)-.004;
  body=smin(body,snout,.015);
  float ears=1e5; for(int i=0;i<2;i++){ float sz=i==0?-1.:1.; vec3 e=q-vec3(-.055,.145,sz*.035); e.xy=rot(.4)*e.xy;
    ears=min(ears,sdCone(e,.016,.002,.016)); }
  body=smin(body,ears,.008);
  float legs=1e5; for(int i=0;i<4;i++){ vec2 g=vec2(i<2?-.055:.055,mod(float(i),2.)<1.?-.035:.035);
    legs=min(legs,sdCylY(q-vec3(g.x,.018,g.y),.014,.018)-.002); }
  body=smin(body,legs,.02);
  vec3 t=q-vec3(.105,.1,0.); float tail=sdTorus(t.xzy*vec3(1.,1.,1.),.008,.0025);
  body=min(body,tail);
  body=max(body,-sdBox(q-vec3(.0,.155,0.),vec3(.022,.01,.0025)));                /* coin slot */
  return body; }
float nostr(vec3 p){ vec3 q=pQ(p)-vec3(-.123,.09,0.); return 1e5; }
float coinIn(vec3 p){ vec3 q=pQ(p)-vec3(.0,.165,0.); float d=sdCylZ(q,.018,.0018)-.0006; return max(d,-(q.y+.004)); }
float coins(vec3 p){ float d=coinD(p-vec3(.15,0.,-.06),.019,.004);
  d=min(d,coinD(p-vec3(.19,0.,-.02),.019,.004)); d=min(d,coinD(p-vec3(.185,.004,-.018),.019,.004));
  return d; }
vec3 tQ(vec3 p){ vec3 q=p-vec3(-.02,.0012,-.12); q.xz=rot(.3)*q.xz; return q; }
float tag(vec3 p){ vec3 q=tQ(p);
  float t=sdRBox(q,vec3(.035,.001,.02),.001); t=max(t,q.x-.035+abs(q.z)*.7-.0);
  t=max(t,-(length(q.xz-vec2(.022,0.))-.004));
  float s=sdCapsule(q,vec3(.022,0.,0.),vec3(.07,0.,.03),.0009);
  s=min(s,sdCapsule(q,vec3(.07,0.,.03),vec3(.1,0.,-.01),.0009));
  return min(t,s); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pig(p),3.);
  r=U(r,coinIn(p),4.);
  r=U(r,coins(p),5.);
  r=U(r,tag(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pQ(p); if(q.x<-.115){ vec2 u=q.yz-vec2(.09,0.); if(length(u-vec2(0.,.008))<.004||length(u+vec2(0.,.008))<.004) return .2; }

    return .82; }
  if(id==4.) return .6;
  if(id==5.) return .62;
  if(id==6.){ vec3 q=tQ(p); if(length(q.xz-vec2(.022,0.))<.006) return .3; return .92; }
  return .7; }
