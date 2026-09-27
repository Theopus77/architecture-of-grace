/* Parts for the practice-room pencil still lifes (params_rooms3.json). Include after
   medparts_a.glsl (which gives sdEll, place, cupD, appleD, pencilD2, bookD, bottleD).
   Every part takes a local point q (already moved and turned), in metres. */
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* extrude a 2D distance d2 along a coordinate z to half-thickness h, with a small bevel r */
float extrude(float d2,float z,float h,float r){ vec2 w=vec2(d2+r,abs(z)-h+r); return min(max(w.x,w.y),0.)+length(max(w,0.))-r; }
/* capped cylinder between two points */
float sdCylAB(vec3 p,vec3 a,vec3 b,float r){ vec3 ba=b-a,pa=p-a; float baba=dot(ba,ba),paba=dot(pa,ba);
  float x=length(pa*baba-ba*paba)-r*baba, y=abs(paba-baba*.5)-baba*.5;
  float x2=x*x, y2=y*y*baba; float d=(max(x,y)<0.)?-min(x2,y2):(((x>0.)?x2:0.)+((y>0.)?y2:0.));
  return sign(d)*sqrt(abs(d))/baba; }
/* 2D triangle */
float sdTri2(vec2 p,vec2 p0,vec2 p1,vec2 p2){
  vec2 e0=p1-p0,e1=p2-p1,e2=p0-p2,v0=p-p0,v1=p-p1,v2=p-p2;
  vec2 pq0=v0-e0*clamp(dot(v0,e0)/dot(e0,e0),0.,1.),pq1=v1-e1*clamp(dot(v1,e1)/dot(e1,e1),0.,1.),pq2=v2-e2*clamp(dot(v2,e2)/dot(e2,e2),0.,1.);
  float s=sign(e0.x*e2.y-e0.y*e2.x);
  vec2 d=min(min(vec2(dot(pq0,pq0),s*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(pq1,pq1),s*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(pq2,pq2),s*(v2.x*e2.y-v2.y*e2.x)));
  return -sqrt(d.x)*sign(d.y); }
/* a coin lying flat, bottom at y=0, with a raised rim */
float coinD(vec3 q,float R,float H){
  float d=sdCylY(q-vec3(0.,H*.5,0.),R-.0008,H*.5-.0004)-.0008;
  float rim=sdTorus(q-vec3(0.,H,0.),R-.0022,.0009);
  d=max(d,-(sdCylY(q-vec3(0.,H,0.),R-.0035,.0004)));
  return min(d,rim); }
/* a stack of n coins with a little wobble */
float coinStack(vec3 q,float R,float H,int n){ float d=1e5;
  for(int i=0;i<12;i++){ if(i>=n) break; float fi=float(i);
    vec3 c=q-vec3(.0015*sin(fi*2.3),fi*H,.0015*cos(fi*1.7)); d=min(d,coinD(c,R,H)); }
  return d; }
/* a glass beaker, base at y=0, spout toward -x */
float beakerD(vec3 q,float R,float H){
  float outer=sdCylY(q-vec3(0.,H*.5,0.),R,H*.5)-.0015;
  float inner=sdCylY(q-vec3(0.,H*.5+.004,0.),R-.003,H*.5);
  float d=max(outer,-inner);
  d=min(d,sdTorus(q-vec3(0.,H+.0005,0.),R-.0005,.0022));
  return d; }
/* an Erlenmeyer flask, base at y=0 */
float flaskD(vec3 q,float R,float H){
  float r=length(q.xz); float y=q.y;
  float hb=H*.68; float rn=R*.3;
  float cone=max(max(r-mix(R,rn,clamp(y/hb,0.,1.)),-y),y-hb);
  float neck=max(r-rn,max(y-H,hb-.01-y));
  float d=min(cone*.9,neck)-.0015;
  float lip=sdTorus(q-vec3(0.,H,0.),rn+.001,.0028);
  d=max(d,-(max(r-rn+.003,-y+hb-.004)));
  return min(d,lip); }
/* a round-bottom (volumetric) flask: bulb radius R, neck radius rn to height H */
float volFlaskD(vec3 q,float R,float rn,float H){
  float b=length(q-vec3(0.,R,0.))-R;
  b=max(b,-(q.y-.006));
  float neck=sdCylY(q-vec3(0.,R+(H-R)*.5,0.),rn,(H-R)*.5);
  float d=smin(b,neck,.012);
  d=min(d,sdTorus(q-vec3(0.,H,0.),rn+.001,.0026));
  return d; }
/* a flat ruler lying along x, centre bottom at q=0 */
float rulerD(vec3 q,float L,float Wd,float T){ return sdRBox(q-vec3(0.,T,0.),vec3(L,T,Wd),.0012); }
float rulerTone(vec3 q,float L,float Wd,float cm){  /* ticks painted on the top face near the far edge (+z) */
  if(q.y<.001) return .7;
  float x=q.x+L; float f=fract(x/cm*10.); float big=fract(x/cm+.02);
  float tl=big<.04?.5:(abs(f-.5)>.45?.0:1.);
  if(tl<.9&&q.z>Wd-.001-(big<.04?Wd*.5:Wd*.24)) return .25;
  return .86; }
/* a simple bowl, base at y=0, rim at height H, rim radius R */
float bowlD(vec3 q,float R,float H){
  float cy=H+R*.35, ry=cy; float s=sdEll(q-vec3(0.,cy,0.),vec3(R*1.06,ry,R*1.06));
  float d=max(abs(s)-.003,q.y-H);
  float rr=R*1.06*sqrt(max(1.-(R*.35/ry)*(R*.35/ry),0.));
  d=min(d,sdTorus(q-vec3(0.,H,0.),rr,.0032));
  float foot=sdCylY(q-vec3(0.,.004,0.),R*.42,.004)-.001;
  return min(d,foot); }
/* a spoon lying along +x from its handle end at q=0 */
float spoonD(vec3 q,float L){
  float h=sdCapsule(q,vec3(0.,.003,0.),vec3(L*.66,.006,0.),.0035);
  vec3 b=q-vec3(L*.82,.007,0.); float bw=sdEll(b,vec3(L*.18,.009,L*.11));
  bw=max(bw,-sdEll(b-vec3(0.,.005,0.),vec3(L*.16,.008,L*.095)));
  return smin(h,bw,.006); }
/* a candle standing, base at y=0 */
float candleD(vec3 q,float R,float H){
  float d=sdCylY(q-vec3(0.,H*.5,0.),R-.002,H*.5)-.002;
  d=max(d,-(length(q-vec3(0.,H+.02,0.))-.024));
  float wick=sdCapsule(q,vec3(0.,H-.006,0.),vec3(.002,H+.012,0.),.0012);
  return min(d,wick); }
/* a leaf lying mostly in its own xz, tip on +x */
float leafD(vec3 q,float L,float Wd){
  float t=clamp(q.x/L,0.,1.); float w=Wd*sin(t*3.1416)*(1.-.3*t);
  float d=max(abs(q.z)-w,abs(q.x-L*.5)-L*.5);
  return extrude(d,q.y-.004*sin(t*3.)-.02*t*t,.0012,.0008); }
