/* Practice room "The Classroom — Nouns and Articles" — pencil still life of things in a
   classroom (la pizarra, la campana, la tiza): a wooden-framed slate chalkboard standing in a
   foot, with A, B and C chalked on it, a brass hand bell with a turned wooden handle, and a
   few sticks of chalk in an open box. */
#define CAM_POS vec3(-0.4869,0.2401,-0.8183)
#define CAM_TGT vec3(-0.2239,-0.0125,0.1290)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* slate: board in a frame, leaning back a little, in a wooden foot */
#define SW .15
#define SH .1
vec3 slQ(vec3 p){ vec3 q=p-vec3(-.03,.0,.1); q.xz=rot(.22)*q.xz; q.y-=.02; q.yz=rot(.12)*q.yz; q.y-=SH; return q; }
float slateB(vec3 q){ return sdBox(q,vec3(SW-.014,SH-.014,.004)); }
float frameD(vec3 q){ float o=sdRBox(q,vec3(SW,SH,.008),.003); return max(o,-sdBox(q,vec3(SW-.014,SH-.014,.02))); }
float footD(vec3 p){ vec3 q=p-vec3(-.03,0.,.1); q.xz=rot(.22)*q.xz;
  float d=sdRBox(q-vec3(-.1,.012,0.),vec3(.022,.012,.035),.003); d=min(d,sdRBox(q-vec3(.1,.012,0.),vec3(.022,.012,.035),.003)); return d; }
/* a school hand bell: flared brass bell, a collar and a turned handle */
#define BC vec3(.17,0.,-.02)
float bellD(vec3 p){ vec3 q=p-BC; float y=q.y; float r=length(q.xz);
  float R=.052-.03*smoothstep(0.,.08,y)+.006*exp(-y*60.)-.008*smoothstep(.075,.1,y);   /* flared mouth, shoulder */
  float d=max(abs(r-R)-.0035,max(-y,y-.095))*.8;
  d=min(d,max(r-R,abs(y-.093)-.004));
  d=min(d,sdTorus(q-vec3(0.,.003,0.),.052,.003));
  return d; }
float handleD(vec3 p){ vec3 q=p-BC; float y=q.y-.1; float r=length(q.xz);
  float R=.009+.004*sin(clamp(y/.09,0.,1.)*PI)+.004*exp(-pow((y-.012)/.006,2.))+.009*exp(-pow((y-.1)/.018,2.));
  return max(r-R,max(-y,y-.118))*.8; }
/* an open box of chalk */
vec3 cbQ(vec3 p){ vec3 q=p-vec3(-.01,0.,-.13); q.xz=rot(-.15)*q.xz; return q; }
float boxD(vec3 q){ float o=sdRBox(q-vec3(0.,.016,0.),vec3(.05,.016,.028),.0015); return max(o,-sdBox(q-vec3(0.,.022,0.),vec3(.047,.016,.025))); }
float chalkD(vec3 q){ float d=1e3;
  for(int i=0;i<4;i++){ float fi=float(i); d=min(d,sdCylX(q-vec3(-.004+.006*fi,.026,-.017+fi*.0115),.0048,.042)-.001); }
  vec3 c=q-vec3(.02,.005,-.06); c.xz=rot(.5)*c.xz; d=min(d,sdCylX(c,.0048,.03)-.001);   /* one stick out on the table */
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 s=slQ(p);
  r=U(r,slateB(s),3.);
  r=U(r,min(frameD(s),footD(p)),4.);
  r=U(r,bellD(p),5.);
  r=U(r,handleD(p),6.);
  vec3 c=cbQ(p); r=U(r,boxD(c),7.); r=U(r,chalkD(c),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=slQ(p); vec2 u=q.xy;
    float g=min(glyph((u-vec2(-.075,.02))/.07,65),min(glyph((u-vec2(0.,.02))/.07,66),glyph((u-vec2(.075,.02))/.07,67)))*.07;
    if(g<.0035) return .92;                                           /* chalk letters */
    if(abs(u.y+.05)<.0012&&abs(u.x)<.1) return .5;                   /* a chalk line under them */
    return .16+.05*fbm(u*60.); }
  if(id==4.) return fract(slQ(p).x/.01+fbm(p.xy*30.))<.5?.52:.6;
  if(id==5.) return .62;
  if(id==6.) return .38;
  if(id==7.){ vec3 q=cbQ(p); if(q.z<-.026&&abs(q.y-.018)<.006) return .35; return .7; }   /* a band round the box */
  if(id==8.) return .95;
  return .7; }
