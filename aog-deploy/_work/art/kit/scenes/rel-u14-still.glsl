/* World Religions Unit 14 "The Biblical Lens I: The Hebrew Bible" (The Youngest Child Asks
   the Question) — pencil still life of a Passover table: three squares of matzah stacked on
   a round plate, a stemmed cup, and a double scroll lying beside them. No figures, no
   writing. */
#define CAM_POS vec3(-0.3295,0.3740,-0.7910)
#define CAM_TGT vec3(-0.1971,-0.0525,0.0978)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define PL vec3(-.01,0.,.04)
#define CP vec3(.19,0.,.08)
#define SC vec3(-.02,0.,-.13)
float plate(vec3 q){ float r=length(q.xz); float y=.004+.012*smoothstep(.06,.12,r);
  float d=max(abs(q.y-y)-.003,r-.125); return min(d*.8,sdTorus(q-vec3(0,.016,0),.124,.003)); }
vec3 mq(vec3 q,float i){ vec3 m=q-vec3(0,.009+i*.0055,0); m.xz=rot(i*.35-.2)*m.xz; return m; }
float matzah(vec3 q){ float d=1e5;
  for(int i=0;i<3;i++){ vec3 m=mq(q,float(i)); float w=.002*sin(m.x*60.)*sin(m.z*50.);
    float s=sdRBox(m-vec3(0,w,0),vec3(.085,.0022,.085),.0015); s+=(fbm(m.xz*40.)-.5)*.004*smoothstep(.07,.085,max(abs(m.x),abs(m.z)));
    d=min(d,s); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=L(p,PL,.0);
  r=U(r,plate(q),3.);
  r=U(r,matzah(q),4.);
  r=U(r,gobletD(L(p,CP,0.)/1.25)*1.25,5.);
  r=U(r,scrollD(L(p,SC,-.1),1.1),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=L(p,PL,.0); float r=length(q.xz); if(abs(r-.1)<.002) return .5; return .85; }
  if(id==4.){ vec3 q=L(p,PL,.0); float best=.8;
    for(int i=0;i<3;i++){ vec3 m=mq(q,float(i)); if(abs(m.y)<.006){
      float row=abs(fract(m.x/.018)-.5); float dot2=abs(fract(m.z/.009)-.5);
      if(row<.09&&dot2<.25&&abs(m.x)<.078) best=.35;
      float br=fbm(m.xz*55.); if(br>.62) best=min(best,.5); } }
    return best; }
  if(id==5.){ vec3 q=L(p,CP,0.)/1.25; if(q.y>.09&&q.y<.12&&n.y>.5) return .4; return .45; }
  if(id==6.) return scrollT(L(p,SC,-.1),1.1);
  return .7; }
