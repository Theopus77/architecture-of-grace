/* Math Unit 25 "Sequences, Series and Modeling" — pencil still life: a pyramid of wooden
   balls stacked in layers (1, 3, 6 and 10 balls, the triangular numbers), beside a row of
   dominoes standing in a line, each one a little taller than the last. */
#define CAM_POS vec3(-0.3243,0.1947,-0.6719)
#define CAM_TGT vec3(-0.2254,0.0220,0.1008)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define BR .03
#define PC vec3(.06,0.,.1)
/* tetrahedral stack: layer L (0 = bottom, 4 per side) holds a triangle of side 4-L */
float pyr(vec3 p){ vec3 q=p-PC; q.xz=rot(.3)*q.xz; float d=1e5; float h=BR*1.633;
  for(int L=0;L<4;L++){ int n=4-L; vec3 o=vec3(float(L)*BR,BR+float(L)*h,float(L)*BR*.577);
    for(int i=0;i<4;i++){ if(i>=n) break; for(int j=0;j<4;j++){ if(j>=n-i) break;
      vec3 c=o+vec3(float(j)*2.*BR+float(i)*BR,0.,float(i)*1.732*BR);
      d=min(d,length(q-c)-BR*.985); } } }
  return d; }
float dominoes(vec3 p){ float d=1e5;
  for(int i=0;i<5;i++){ float s=.6+.12*float(i); vec3 c=vec3(-.22+float(i)*.045,.045*s,-.02-float(i)*.005);
    vec3 q=p-c; q.xz=rot(.25)*q.xz; d=min(d,sdRBox(q,vec3(.004*s,.045*s,.022*s),.002)); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pyr(p),3.);
  r=U(r,dominoes(p),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .6+.08*grain(p*2.,20.);
  if(id==4.) return .4;
  return .7; }
