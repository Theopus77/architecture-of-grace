/* Home door "Conversation Starters" — pencil still life of a kitchen table: a teapot, two mugs
   facing each other, and a small stack of question cards with hint-lines (never words). */
#define CAM_POS vec3(-0.4652,0.3068,-0.6180)
#define CAM_TGT vec3(-0.2232,-0.0247,0.0809)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define TP vec3(-.02,0.,.12)
#define M1 vec3(-.17,0.,-.01)
#define M2 vec3(.13,0.,.03)
#define CD vec3(.02,0.,-.12)
float cards(vec3 p){ float d=1e3;
  for(int i=0;i<4;i++){ float f=float(i); vec3 q=P(p,CD+vec3(.003*f,.0,.002*f),.25+.09*f);
    d=min(d,sdRBox(q-vec3(0.,.0022+.0042*f,0.),vec3(.06,.0017,.04),.0012)); }
  return d; }
float cardsT(vec3 p){ vec3 q=P(p,CD+vec3(.009,0.,.006),.25+.27);
  if(p.y<.0145) return .55;
  vec2 u=q.xz; if(abs(u.x)>.05||abs(u.y)>.032) return .95;
  if(u.y>.016&&u.y<.022&&u.x<.03) return .35;                          /* a bold first line */
  float l=fract((u.y+.03)/.011); if(u.y<.008&&l<.2&&u.x<.045-.02*h1(vec2(floor((u.y+.03)/.011),1.))) return .62;
  return .95; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,teapot(P(p,TP,.35),.075),3.);
  r=U(r,mug(P(p,M1,2.6),.036,.085),4.);
  r=U(r,mug(P(p,M2,.6),.036,.085),5.);
  r=U(r,cards(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return teapotT(P(p,TP,.35),.075);
  if(id==4.) return mugT(P(p,M1,2.6),.036,.085,.6);
  if(id==5.) return mugT(P(p,M2,.6),.036,.085,.72);
  if(id==6.) return cardsT(p);
  return .7; }
