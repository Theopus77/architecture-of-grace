/* WCS Unit 13 "The Extremes" — pencil still life: an empty stone pedestal with a long crack
   (a statue gone), a scorched book with a burnt ragged corner, and a heavy closed padlock. */
#define CAM_POS vec3(-0.5085,0.2884,-1.0944)
#define CAM_TGT vec3(-0.2397,0.0440,0.1142)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define PD vec3(0.,0.,.1)
float ped(vec3 p){ vec3 q=p-PD;
  float d=sdRBox(q-vec3(0.,.018,0.),vec3(.085,.018,.085),.003);
  d=min(d,sdRBox(q-vec3(0.,.045,0.),vec3(.072,.009,.072),.003));
  float a=atan(q.z,q.x); float r=.052-.0035*smoothstep(.3,.9,abs(sin(a*8.)));
  d=min(d,sdCylY(q-vec3(0.,.17,0.),r,.12)*.9);
  d=min(d,sdRBox(q-vec3(0.,.296,0.),vec3(.072,.009,.072),.003));
  d=min(d,sdRBox(q-vec3(0.,.318,0.),vec3(.08,.013,.08),.003));
  vec2 c=vec2(q.x+.012*sin(q.y*70.)+.006*sin(q.y*190.)-.01,q.z+.05); float cr=abs(c.x)-.0022;
  d=max(d,-max(max(cr,abs(q.y-.18)-.15),q.z+.03));
  return d; }
vec3 bkQ(vec3 p){ vec3 q=p-vec3(.25,0.,-.02); q.xz=rot(-.35)*q.xz; return q; }
float burn(vec3 q){ vec2 c=q.xz-vec2(.11,-.08); return length(c)-.1+.018*fbm(q.xz*50.); }
float book(vec3 p){ vec3 q=bkQ(p);
  float cov=sdRBox(q-vec3(0.,.004,0.),vec3(.1,.004,.075),.002); cov=min(cov,sdRBox(q-vec3(0.,.036,0.),vec3(.1,.004,.075),.002));
  cov=min(cov,sdRBox(q-vec3(-.099,.02,0.),vec3(.006,.02,.075),.004));
  return max(cov,-burn(q)); }
float pages(vec3 p){ vec3 q=bkQ(p); return max(sdRBox(q-vec3(.003,.02,0.),vec3(.095,.013,.07),.001),-(burn(q)+.006)); }
vec3 lkQ(vec3 p){ vec3 q=p-vec3(-.17,0.,-.08); q.xz=rot(.5)*q.xz; return q; }
float lockB(vec3 p){ vec3 q=lkQ(p); float d=sdRBox(q-vec3(0.,.055,0.),vec3(.045,.05,.018),.012); 
  d=max(d,-sdCylZ(q-vec3(0.,.045,-.02),.005,.004)); return d; }
float shackle(vec3 p){ vec3 q=lkQ(p)-vec3(0.,.105,0.); float t=sdTorus(q.xzy,.03,.0075); t=max(t,-q.y);
  float l=min(sdCylY(q-vec3(-.03,-.005,0.),.0075,.012),sdCylY(q-vec3(.03,-.005,0.),.0075,.012)); return min(t,l); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,ped(p),3.);
  r=U(r,book(p),4.);
  r=U(r,pages(p),5.);
  r=U(r,lockB(p),6.);
  r=U(r,shackle(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PD; vec2 c=vec2(q.x+.012*sin(q.y*70.)+.006*sin(q.y*190.)-.01,q.z+.05);
    if(abs(c.x)<.005&&abs(q.y-.18)<.15&&q.z<-.03) return .15; return .72+.08*fbm(p.xy*40.); }
  if(id==4.){ float b=burn(bkQ(p)); return mix(.08,.4,smoothstep(0.,.04,b)); }
  if(id==5.){ vec3 q=bkQ(p); float b=burn(q); if(b<.03) return mix(.08,.8,smoothstep(.006,.03,b)); return fract(q.y/.004)<.3?.7:.9; }
  if(id==6.){ vec3 q=lkQ(p); if(abs(q.y-.09)<.003&&q.z<0.) return .3; return .45; }
  if(id==7.) return .6;
  return .7; }
