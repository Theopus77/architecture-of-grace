/* FCS Unit 20 "Capstone: Plan, Cost, Produce" — pencil still life: a pleated chef's hat, a
   clipboard with a costed plan and a column of figures, and a small covered serving dish. */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.06,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define HT vec3(.06,0.,.08)
float hat(vec3 p){ vec3 q=p-HT; float a=atan(q.z,q.x); float pleat=.003*abs(sin(a*12.));
  float band=sdCylY(q-vec3(0.,.03,0.),.065,.03)-.003;
  float puff=(length((q-vec3(0.,.11,0.))/vec3(.09,.06,.09))-1.)*.06; puff=smin(puff,sdCylY(q-vec3(0.,.07,0.),.07,.02),.03);
  puff=max(puff,.055-q.y)+pleat*smoothstep(.06,.1,q.y);
  return min(band,puff); }
vec3 cbq(vec3 p){ vec3 q=p-vec3(-.13,.0,.03); q.xz=rot(.3)*q.xz; q.yz=rot(.3)*q.yz; return q; }
float clipb(vec3 p){ vec3 q=cbq(p); return min(sdRBox(q-vec3(0.,.12,0.),vec3(.08,.12,.003),.004),sdRBox(q-vec3(0.,.228,-.008),vec3(.032,.011,.006),.004)); }
float paper(vec3 p){ vec3 q=cbq(p); return sdBox(q-vec3(0.,.11,-.004),vec3(.072,.1,.0008)); }
#define DS vec3(.2,0.,-.07)
float dish(vec3 p){ vec3 q=p-DS; float plate=max(abs(q.y-(.004+.006*smoothstep(.05,.07,length(q.xz))))-.002,length(q.xz)-.07);
  float dome=max(abs(length((q-vec3(0.,.008,0.))/vec3(1.,.8,1.))*.8-.05)-.002,.008-q.y); float knob=length(q-vec3(0.,.052,0.))-.008;
  return min(min(plate,dome),knob); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,hat(p),3.);
  r=U(r,clipb(p),4.);
  r=U(r,paper(p),5.);
  r=U(r,dish(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-HT; if(q.y<.062) return abs(q.y-.03)<.002?.6:.9; return .95; }
  if(id==4.){ vec3 q=cbq(p); return q.y>.215?.3:.5; }
  if(id==5.){ vec3 q=cbq(p); vec2 u=q.xy-vec2(0.,.11);
    if(abs(u.y-.08)<.004&&abs(u.x)<.05) return .2;
    for(int i=0;i<5;i++){ float y=.05-float(i)*.022; if(abs(u.y-y)<.0022){ if(u.x>-.06&&u.x<.0-float(i%2)*.012) return .5; if(u.x>.025&&u.x<.06) return .35; } }
    if(abs(u.y+.07)<.0012&&u.x>.02&&u.x<.062) return .25; if(abs(u.y+.082)<.003&&u.x>.03&&u.x<.06) return .2;   /* the total */
    if(abs(u.x-.012)<.0008&&u.y<.06&&u.y>-.09) return .6;
    return .94; }
  if(id==6.){ vec3 q=p-DS; if(q.y>.01) return .7; return .9; }
  return .7; }
