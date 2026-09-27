/* FCS Unit 4 "A Job Done to the End" — pencil still life: a clipboard with a checklist where
   every box is ticked, leaning on a cleaning bucket with a sponge on its rim. */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.05,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define BK vec3(.1,0.,.08)
float bucket(vec3 p){ vec3 q=p-BK; float r=.075+q.y*.18;
  float wall=max(abs(length(q.xz)-r)-.003,abs(q.y-.075)-.075);
  float bot=sdCylY(q-vec3(0.,.004,0.),.075,.004);
  float rim=sdTorus(q-vec3(0.,.15,0.),r+.0,.005);
  float ribs=max(abs(length(q.xz)-r)-.0045,abs(q.y-.04)-.003);
  vec3 h=q-vec3(0.,.15,0.); float handle=max(sdTorus(h.xzy,.1,.0035),-h.y+.0); handle=max(handle,-h.y);
  return min(min(wall,bot),min(min(rim,ribs),handle)); }
float sponge(vec3 p){ vec3 q=p-BK-vec3(.05,.165,-.04); q.xz=rot(.6)*q.xz; q.xy=rot(.25)*q.xy;
  return sdRBox(q,vec3(.04,.016,.026),.008)+.0012*vn3(q*400.); }
/* clipboard leaning back against the bucket */
vec3 cbq(vec3 p){ vec3 q=p-vec3(-.07,.0,-.02); q.xz=rot(.18)*q.xz; q.yz=rot(.28)*q.yz; return q; }
float clip(vec3 p){ vec3 q=cbq(p);
  float board=sdRBox(q-vec3(0.,.13,0.),vec3(.09,.13,.003),.004);
  float paper=sdBox(q-vec3(0.,.12,-.004),vec3(.08,.11,.0008));
  float cl=sdRBox(q-vec3(0.,.248,-.008),vec3(.035,.012,.006),.004);
  float ring=sdTorus((q-vec3(0.,.262,-.004)).xzy,.012,.0025);
  return min(min(board,paper),min(cl,ring)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bucket(p),3.);
  r=U(r,sponge(p),4.);
  vec3 q=cbq(p); float board=min(sdRBox(q-vec3(0.,.13,0.),vec3(.09,.13,.003),.004),sdRBox(q-vec3(0.,.248,-.008),vec3(.035,.012,.006),.004));
  r=U(r,board,5.);
  r=U(r,sdBox(q-vec3(0.,.12,-.004),vec3(.08,.105,.0008)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BK; return q.y>.14?.4:.62; }
  if(id==4.){ vec3 q=p-BK-vec3(.05,.165,-.04); return q.y>.006?.35:.7; }
  if(id==5.){ vec3 q=cbq(p); return q.y>.235?.3:.5; }
  if(id==6.){ vec3 q=cbq(p); float a=.95;
    if(abs(q.y-.205)<.004&&abs(q.x)<.05) a=.3;                              /* a heading line */
    for(int i=0;i<4;i++){ float y=.17-float(i)*.04; vec2 u=vec2(q.x+.055,q.y-y);
      if(abs(max(abs(u.x),abs(u.y))-.011)<.0018) a=.25;                    /* a box */
      if(glyphX(u/.03,10003)*.03<.0028) a=.12;                              /* ticked */
      if(q.x>-.03&&q.x<.06-float(i%2)*.02&&abs(q.y-y)<.0022) a=.55; }       /* a line of the task */
    return a; }
  return .7; }
