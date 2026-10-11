/* skt-u18 "Capstone: Science and Community" — pencil still life: a plywood quarter-pipe ramp model
   with steel coping and a back rail, a clipboard holding a hand-drawn skatepark plan (bowl, ledge,
   rail, stairs; no words) and a tape measure. Objects only. */
#define CAM_POS vec3(-0.5025,0.3340,-0.8381)
#define CAM_TGT vec3(-0.1608,0.0021,0.0408)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
#include "sktparts_b.glsl"
vec3 Qr(vec3 p){ vec3 q=p-vec3(-.02,0.,.06); q.xz=rot(.05)*q.xz; return q; }
vec3 Qc(vec3 p){ vec3 q=p-vec3(.21,0.,-.12); q.xz=rot(-.35)*q.xz; return q; }
vec3 Qt(vec3 p){ vec3 q=p-vec3(-.2,0.,-.12); q.xz=rot(-.25)*q.xz; return q/1.25; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,sb_ramp(Qr(p)),3.);
  r=U(r,o_clipboard(Qc(p),0.),4.);
  r=U(r,o_tape(Qt(p),0.)*1.25,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return sbt_ramp(Qr(p));
  if(id==4.){ vec3 q=Qc(p); if(q.y>.011) return .6; if(q.y<.0062) return .5; vec2 u=q.xz-vec2(0.,-.008);
    if(abs(u.x)>.097||abs(u.y)>.132) return .5; return sb_parkplan(u)<.0014?.2:.95; }
  if(id==5.) return t_tape(Qt(p),0.);
  return .7; }
