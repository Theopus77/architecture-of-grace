/* skt-u16 "Culture, Art and Who Skates" — pencil still life: a bare deck hung on two wall pegs with a
   hand-painted abstract graphic (circle, wave and dots; no logo, no words), a glass jar of paint
   brushes and a little stack of folded zines. Objects only. */
#define CAM_POS vec3(-0.8953,0.5559,-0.6055)
#define CAM_TGT vec3(-0.5115,0.0446,0.8012)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sktparts_b.glsl"
#define LA .22
vec3 Qd(vec3 p){ vec3 d=p-vec3(.0,.25,.84); return vec3(d.x,d.z,d.y); }
float pegs(vec3 p){ vec3 q=vec3(abs(p.x)-.2,p.y-(.25-.106),p.z); return min(sdCapsule(q,vec3(0.,0.,.9),vec3(0.,.004,.825),.006),length(q-vec3(0.,.008,.823))-.0085); }
vec3 Qj(vec3 p){ return (p-vec3(.2,0.,.7))/1.4; }
vec3 Qz(vec3 p,float i){ vec3 q=p-vec3(-.02,.0055*i,.6); q.xz=rot(.25-.22*i)*q.xz; return q; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,sb_deck(Qd(p),.4,.1,1.),3.);
  r=U(r,pegs(p),7.);
  vec3 j=Qj(p); r=U(r,sb_jar(j)*1.4,4.); r=U(r,sb_brushes(j)*1.4,5.);
  float z=min(sb_zine(Qz(p,0.)),min(sb_zine(Qz(p,1.)),sb_zine(Qz(p,2.)))); r=U(r,z,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return sbt_deck(Qd(p),.4,.1,1.,1.);
  if(id==4.) return sbt_jar(Qj(p));
  if(id==5.) return sbt_brushes(Qj(p));
  if(id==7.) return .45;
  if(id==6.){ float y=p.y; float i=y>.0105?2.:(y>.005?1.:0.); return sbt_zine(Qz(p,i),i); }
  return .7; }
