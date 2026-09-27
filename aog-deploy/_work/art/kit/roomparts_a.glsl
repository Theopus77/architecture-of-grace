/* Parts for the practice-room pencil still lifes (rooms batch 1). Include after studio.glsl
   and medparts_a.glsl. Every part takes a local point q (already moved and turned), metres. */
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* a tapered clay flower pot, base at y=0, with a rolled rim; soil surface at H-.012 */
float potD(vec3 q,float R,float H){
  float body=sdCone(q-vec3(0.,H*.45,0.),R*.72,R*.92,H*.45)-.002;
  float rim=sdCylY(q-vec3(0.,H*.94,0.),R,H*.07)-.003;
  float d=min(body,rim);
  d=max(d,-sdCylY(q-vec3(0.,H,0.),R*.86,.02));
  return d; }
float soilD(vec3 q,float R,float H){ return sdCylY(q-vec3(0.,H-.018,0.),R*.87,.005)+.0015*sin(q.x*300.)*sin(q.z*260.); }
/* a leaf lying in its local xz plane: base at q=0, tip along +x, cupped along the midrib */
float leaf2(vec2 u,float L,float Wd){ float a=L*.5,b=Wd*.5,r=(a*a+b*b)/(2.*b);
  vec2 v=vec2(u.x-a,abs(u.y)); return length(v+vec2(0.,r-b))-r; }
float leafD(vec3 q,float L,float Wd){
  float t=clamp(q.x/L,0.,1.);
  q.y-=q.z*q.z*5.-t*(1.-t)*L*.3;
  float d2=leaf2(q.xz,L,Wd);
  return max(d2,abs(q.y)-.0012)*.7; }
/* a hand lens (magnifier) lying flat: glass centre at q=0, handle along +x */
float lensRim(vec3 q,float R){ return sdTorus(q,R,.0045); }
float lensGlass(vec3 q,float R){ return sdEll(q,vec3(R,.0035,R)); }
float lensHandle(vec3 q,float R){
  float h=sdCapsule(q,vec3(R+.004,0.,0.),vec3(R+.1,0.,0.),.0085);
  h=min(h,sdCylX(q-vec3(R+.012,0.,0.),.0065,.01));
  return h; }
/* an Erlenmeyer flask, base at y=0 */
float flaskD(vec3 q,float R,float H){
  float cone=sdCone(q-vec3(0.,H*.33,0.),R,R*.3,H*.33)-.003;
  float neck=sdCylY(q-vec3(0.,H*.8,0.),R*.3,H*.2);
  float lip=sdTorus(q-vec3(0.,H,0.),R*.3,.003);
  float d=min(smin(cone,neck,.01),lip);
  d=max(d,-sdCylY(q-vec3(0.,H*.6,0.),R*.24,H*.5));
  return d; }
/* a straight glass jar with a screw lid, base at y=0 */
float jarD(vec3 q,float R,float H){
  float d=sdCylY(q-vec3(0.,H*.45,0.),R,H*.45)-.004;
  d=smin(d,sdCylY(q-vec3(0.,H*.93,0.),R*.85,H*.05),.006);
  return d; }
float lidD(vec3 q,float R,float H){ float a=atan(q.z,q.x);
  return sdCylY(q-vec3(0.,H*1.,0.),R*.9+.001*smoothstep(-.3,.3,cos(a*48.)),H*.05)-.002; }
/* a cylinder standing on y=0 with softened edges */
float cylS(vec3 q,float R,float H,float r){ return sdCylY(q-vec3(0.,H*.5,0.),R-r,H*.5-r)-r; }
/* a coin stack of n coins, base at y=0 */
float coinsD(vec3 q,float R,float n,float lean){
  float h=n*.0026; vec3 c=q; c.x-=c.y*lean;
  float d=sdCylY(c-vec3(0.,h*.5,0.),R,h*.5)-.0006;
  return d; }
