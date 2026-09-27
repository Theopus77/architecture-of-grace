// @opts {"expo":.85,"warm":.45,"bloom":.5,"vig":.3,"sat":1.1}
/* Bible, Unit 1 "Beginnings" (Genesis stories, K–2): a garden at first light — a great
   tree, a river winding away through meadows, a soft rainbow over a hill where a wooden
   boat rests. Sun low behind the viewer, so the land is lit warm and the bow stands
   opposite it. */
#define CAM_POS vec3(-2.,16.,-10.)
#define CAM_TGT vec3(4.,5.,80.)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.35,.16,-1.)
#define MAXT 2600.
#define EXPOSURE 1.
#define TAU_M .10
#define FOG_DENS .0007
#define FOG_H 90.
#define CLOUDS
#define CLOUD_COVER .38
#include "lib.glsl"
#include "pieces.glsl"

float riverX(float z){ return 16.*sin(z*.022+.9)+10.*sin(z*.009-1.4)+2.; }
float riverW(float z){ return 6.+z*.04; }
float hill(vec2 xz){ vec2 d=xz-vec2(30.,120.); return 13.*exp(-dot(d,d)/(2.*38.*38.)); }
float ground(vec2 xz){
  float h=(fbm(xz*.012)-.45)*3.+fbm(xz*.07)*.4;
  h+=hill(xz);
  h+=smoothstep(350.,900.,xz.y)*(fbm(xz*.0025+3.)*45.+treeLine(xz,40.)*10.);           /* far downs */
  h+=treeLine(xz,60.)*9.*smoothstep(170.,260.,xz.y);             /* hedgerows / woods */
  float rx=abs(xz.x-riverX(xz.y)); float w=riverW(xz.y);
  h=(h<0.?h*.25:h)+.35;
  float bank=smoothstep(w*.55,w*3.5,rx);
  h=mix(-1.3,h,bank*bank*(3.-2.*bank));
  return h;
}
#define WATER_Y -.45
#define BOAT vec3(30.,0.,118.)
float boat(vec3 p){
  vec3 q=p-(BOAT+vec3(0,hill(BOAT.xz)+max((fbm(BOAT.xz*.012)-.45)*3.,0.)+.55,0));
  q.xz=rot(.5)*q.xz;
  /* hull: an ellipsoid-ish trough, open at the top */
  vec3 e=q/vec3(2.1,1.3,7.5); float hull=(length(e)-1.)*1.2;
  hull=max(hull,q.y-.95); hull=max(hull,-q.y-1.2);
  float inner=(length((q-vec3(0,.2,0))/vec3(1.85,1.2,7.1))-1.)*1.2;
  hull=max(hull,-max(inner,-q.y-.1));
  float house=sdRBox(q-vec3(0,1.6,-.6),vec3(1.45,.8,3.6),.08);
  float roof=sdBox(vec3(abs(q.x)*.85+q.y*.55-2.15,0,0)*0.+vec3(0),vec3(0))*0.;
  vec3 r=q-vec3(0,2.4,-.6); float rf=max(abs(r.z)-3.9,dot(vec2(abs(r.x),r.y),normalize(vec2(.55,1.)))-.8);
  rf=max(rf,-r.y-.05);
  return min(hull,min(house,rf));
}
vec2 map(vec3 p){
  vec2 r=vec2(1e5,-1.);
  float g=ground(p.xz); r=U(r,(p.y-g)*.55,1.);
  r=U(r,max(p.y-WATER_Y,abs(p.x-riverX(p.z))-riverW(p.z)*1.4),2.);
  vec2 t=sdTree(p,vec3(-9.,ground(vec2(-9.,52.))-.3,52.),6.5,7.5,1.3); r=U(r,t.x,3.); r=U(r,t.y,4.);
  vec2 t2=sdTree(p,vec3(-40.,ground(vec2(-40.,95.))-.3,95.),5.,5.5,4.1); r=U(r,t2.x,3.); r=U(r,t2.y,4.);
  vec2 t3=sdTree(p,vec3(62.,ground(vec2(62.,150.))-.3,150.),5.,6.,7.7); r=U(r,t3.x,3.); r=U(r,t3.y,4.);
  if(length(p-BOAT)<30.) r=U(r,boat(p),5.);
  return r;
}
float leafH(vec3 p){ return fbm3L(p*3.5,footprint(distTo(p))*3.5,4); }
float grassH(vec3 p){ return grassHt(p.xz,footprint(distTo(p))); }
float barkH(vec3 p){ return fbm(vec2(atan(p.x+13.,p.z-46.)*9.,p.y*1.3))*.7+vn(vec2(atan(p.x,p.z)*40.,p.y*6.))*.3; }
Mat material(float id,vec3 p,inout vec3 n){
  if(id==1.){
    float sl=1.-n.y;
    float dc=distTo(p), fp=footprint(dc); vec3 g=grassAlb(p.xz,vec3(.075,.11,.035),fp);
    g=mix(g,vec3(.16,.17,.06),smoothstep(.4,.75,fbm(p.xz*.05)));
    float rx=abs(p.x-riverX(p.z)); float w=riverW(p.z);
    g=mix(vec3(.10,.085,.06)*(.7+.6*fbmL(p.xz*3.,fp*3.,4)),g,smoothstep(w*1.35,w*1.9,rx));   /* muddy, stony bank */
    g=mix(g,g*.55,smoothstep(w*2.3,w*1.5,rx));
    /* meadow flowers, near only */
    vec3 v=voro(p.xz*3.5); float fl=step(v.x,.05)*step(.9,v.z)*smoothstep(60.,20.,length(p.xz));
    g=mix(g,mix(vec3(.95,.85,.3),vec3(.95,.95,.9),step(.86,v.z)),fl);
    g*=.75+.45*smoothstep(.3,.7,fbm(p.xz*.09+7.));
    float fo=smoothstep(.42,.6,fbm(p.xz*.006+4.))*smoothstep(250.,500.,dc); g=mix(g,vec3(.022,.04,.018)*(.5+1.*vn(p.xz*.12)),max(fo,smoothstep(500.,900.,dc)*.85));
    if(dc<400.) BUMP(n,p,grassH,.25*smoothstep(400.,40.,dc));
    Mat m=mat(g,.85); m.sss=.08; return m;
  }
  if(id==2.){ n=waterN(p.xz,length(p-CAM_POS)); Mat m=mat(vec3(.02,.035,.03),.05); m.refl=1.; m.spec=.02; return m; }
  if(id==3.){ BUMP(n,p,barkH,.25); return mat(vec3(.03,.025,.02)*(.7+.6*fbm(p.xy*4.)),.9); }
  if(id==4.){ float lh=leafH(p); BUMP(n,p,leafH,.5); Mat m=mat(foliageAlb(p,vec3(.04,.075,.02))*(.45+1.1*lh),.65); m.sss=.3; return m; }
  if(id==5.){ return mat(woodAlb(p*vec3(1.,1.,.4),vec3(.16,.09,.05))*(p.y>BOAT.y+2.8?.7:1.),.7); }
  return mat(vec3(.5),.5);
}
vec3 shade(vec3 p,vec3 n,vec3 rd,Mat m,float t){
  return shadeOutdoor(p,n,rd,m,t, m.sss>.2?6.:10., m.sss>.2?3.:1., vec3(.2,.25,.1));
}
vec3 background(vec3 ro,vec3 rd){ return skyFull(ro,rd); }
vec3 atmosphere(vec3 c,vec3 ro,vec3 rd,float t){ return aerial(c,ro,rd,t); }
vec3 post(vec3 c,vec3 ro,vec3 rd,float t){
  /* the bow sits on the rain behind the hill, so only where the ray travels far */
  vec3 anti=normalize(vec3(-SUN_DIR.x,-.05,-SUN_DIR.z));
  float vis=smoothstep(90.,260.,t)*smoothstep(-.02,.06,rd.y+.02);
  return c+rainbow(rd,anti+vec3(0,-.12,0),21.,.8)*vis*skyClear(vec3(0,1,0))*.9;
}
