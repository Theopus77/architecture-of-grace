/* s20 "US History: Industry to the Progressive Era" — an old typewriter with a sheet of paper
   in its roller (the muckrakers' reports), a railway hand lantern, and a light bulb lying on
   the table. */
#define CAM_POS vec3(-0.4624,0.3141,-0.5274)
#define CAM_TGT vec3(-0.1120,0.0253,0.0841)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "roomparts_e.glsl"
vec3 tQ(vec3 p){ return plc(p,vec3(0.,0.,.03),-.4); }
vec3 lQ(vec3 p){ return p-vec3(.29,0.,.1); }
vec3 bQ(vec3 p){ vec3 q=plc(p,vec3(.2,.03,-.1),-.5); return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=tQ(p);
  r=U(r,twBody(q),3.);
  r=U(r,twPlaten(q),4.);
  r=U(r,twKeys(q),5.);
  r=U(r,twPaper(q),6.);
  r=U(r,lanternFrame(lQ(p)),7.);
  r=U(r,lanternGlobe(lQ(p)),8.);
  r=U(r,bulbGlass(bQ(p)),9.);
  r=U(r,bulbBase(bQ(p)),10.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .25;
  if(id==4.) return .2;
  if(id==5.) return .85;
  if(id==6.){ vec3 s=tQ(p)-vec3(0.,.12,.07); s.yz=rot(.25)*s.yz; float l=fract((s.y+.04)/.009);
    if(s.z<0.&&abs(s.x)<.045&&s.y>-.02&&s.y<.032&&l<.2) return .5; return .95; }
  if(id==7.) return .3;
  if(id==8.) return .88;
  if(id==9.) return .9;
  if(id==10.) return .5;
  return .7; }
