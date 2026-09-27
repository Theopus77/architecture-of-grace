/* FCS Unit 10 "Knife Skills" — pencil still life: a chef's knife lying on a thick wooden cutting
   board beside a carrot cut into even round slices, with half an onion and its rings. */
#define CAM_POS vec3(-0.30,0.40,-0.84)
#define CAM_TGT vec3(-0.05,0.02,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define BD vec3(.03,0.,.04)
#define TOP .03
vec3 bq(vec3 p){ vec3 q=p-BD; q.xz=rot(-.1)*q.xz; return q; }
float board(vec3 p){ vec3 q=bq(p); float b=sdRBox(q-vec3(0.,.015,0.),vec3(.24,.015,.13),.01);
  b=max(b,-max(abs(length(q.xz/vec2(.23,.12))-1.)*.12-.004,-(q.y-.028))); return b; }   /* juice groove */
float knife(vec3 p){ vec3 q=bq(p)-vec3(-.04,TOP+.004,-.07); q.xz=rot(.12)*q.xz;
  float blade=sdRBox(q-vec3(.07,0.,.0),vec3(.11,.0015,.024),.001);
  blade=max(blade,q.z-(.024-max(q.x-.1,0.)*.65));
  blade=max(blade,-q.z-.024+max(q.x-.14,0.)*.1);
  float bol=sdRBox(q-vec3(-.042,.002,0.),vec3(.005,.006,.018),.003);
  float handle=sdRBox(q-vec3(-.1,.004,-.004),vec3(.055,.008,.013),.007);
  return min(min(blade,bol),handle); }
float carrot(vec3 p){ vec3 q=bq(p)-vec3(-.12,TOP+.017,.06); q.xz=rot(.2)*q.xz;
  float body=(length(q.yz)-.017*(1.-clamp(-q.x/.12,0.,1.)*.8))*.9; body=max(body,max(q.x,-q.x-.12));
  float slices=1e5; for(int i=0;i<6;i++){ float fi=float(i); vec3 s=q-vec3(.02+fi*.018+.004*sin(fi*3.),0.,.004*cos(fi*2.)); s.xy=rot(.05*sin(fi))*s.xy;
    slices=min(slices,sdCylX(s,.0165-fi*.0005,.0045)-.0008); }
  return min(body,slices); }
float onion(vec3 p){ vec3 q=bq(p)-vec3(.13,TOP,.06); float h=max(length(q*vec3(1.,1.05,1.))-.045,-q.y);
  vec3 r=q-vec3(.07,0.,-.04); float ring=max(abs(length(r.xz)-.03)-.003,abs(r.y-.003)-.003);
  ring=min(ring,max(abs(length(r.xz-vec2(.006,.004))-.02)-.0028,abs(r.y-.003)-.003));
  return min(h,ring); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,board(p),3.);
  r=U(r,knife(p),4.);
  r=U(r,carrot(p),5.);
  r=U(r,onion(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bq(p); return .66+.08*sin(q.z*120.+fbm(q.xz*14.)*5.); }
  if(id==4.){ vec3 q=bq(p)-vec3(-.04,TOP+.004,-.07); q.xz=rot(.12)*q.xz; if(q.x<-.047){ if(abs(q.x+.08)<.003||abs(q.x+.12)<.003) return .8; return .2; }
    if(q.x<-.036) return .5; return abs(q.z+.02)<.002?.95:.8; }
  if(id==5.){ vec3 q=bq(p)-vec3(-.12,TOP+.017,.06); q.xz=rot(.2)*q.xz; if(q.x>.005&&abs(n.x)>.6){ float r=length(q.yz); return r<.007?.35:.5; } return .45; }
  if(id==6.){ vec3 q=bq(p)-vec3(.13,TOP,.06); if(q.y<.003&&length(q.xz)<.046){ return fract(length(q.xz)/.008)<.3?.45:.88; } return .7; }
  return .7; }
