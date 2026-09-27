/* Parts for the practice-room pencil still lifes (params_rooms2c.json). Include after
   studio.glsl and medparts_a.glsl (sdEll, place, pencilD2, bookD). Every part takes a local
   point q (already moved and turned), in metres. */
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* distance to the nearest grid line, lines every u, one on 0 */
float gridLn(float v,float u){ return abs(v-u*floor(v/u+.5)); }
/* cut shallow grooves where g<w, only within dep of the surface of d */
float groove(float d,float g,float w,float dep){ return max(d,-max(g-w,-d-dep)); }
/* base-ten blocks, unit edge u, resting on y=0 and centred on x,z */
float flatD(vec3 q,float u){ float d=sdRBox(q-vec3(0.,u*.5,0.),vec3(5.*u,u*.5,5.*u),.0012);
  float g=min(gridLn(q.x,u),gridLn(q.z,u)); return groove(d,g,.0006,.0007); }
float rodD(vec3 q,float u){ float d=sdRBox(q-vec3(0.,u*.5,0.),vec3(5.*u,u*.5,u*.5),.0012);
  return groove(d,gridLn(q.x,u),.0006,.0007); }
float unitD(vec3 q,float u){ return sdRBox(q-vec3(0.,u*.5,0.),vec3(u*.5),.0015); }
/* painted grid tone: dark on the lines */
float gridTone(vec2 v,float u,float base){ float g=min(gridLn(v.x,u),gridLn(v.y,u)); return g<.0011?base-.35:base; }
/* extrude a 2D distance along z to half-thickness h */
float extrude(float d2,float z,float h){ vec2 w=vec2(d2,abs(z)-h); return min(max(w.x,w.y),0.)+length(max(w,0.)); }
/* a candlestick: round foot, turned stem, drip cup and a candle, base at y=0 */
float candlestickD(vec3 q,float H){
  float r=length(q.xz);
  float foot=sdCylY(q-vec3(0.,.006,0.),.034,.006)-.003;
  foot=smin(foot,sdCylY(q-vec3(0.,.016,0.),.018,.006)-.003,.008);
  float y=q.y/H; float prof=.007+.004*sin(y*18.)*smoothstep(.1,.3,y)+.006*exp(-pow((y-.5)*9.,2.));
  float stem=max(r-prof,abs(q.y-H*.5)-H*.5)*.8;
  float cup=sdCylY(q-vec3(0.,H,0.),.02,.004)-.002;
  return min(min(foot,stem),cup); }
float candleD(vec3 q,float H,float L){ return sdCylY(q-vec3(0.,H+L*.5,0.),.0085,L*.5)-.0008; }
/* a brass weight with a knob, base at y=0, body radius R */
float weightD(vec3 q,float R){
  float b=sdCylY(q-vec3(0.,R*.7,0.),R,R*.7)-.0015;
  float n=sdCylY(q-vec3(0.,R*1.5,0.),R*.38,R*.16)-.001;
  float k=length(q-vec3(0.,R*1.95,0.))-R*.42;
  return min(b,smin(n,k,.003)); }
/* a hanging-pan balance: base at y=0, beam at height H, arms of half-length A, tilt t (radians,
   + drops the right pan). Returns (distance to frame, distance to pans). Pan tops: panTop(). */
vec3 balEnd(float H,float A,float t,float s){ return vec3(s*A*cos(t),H-s*A*sin(t),0.); }
vec2 balanceD(vec3 q,float H,float A,float t,float L){
  float base=sdRBox(q-vec3(0.,.008,0.),vec3(.07,.008,.045),.004);
  base=smin(base,sdCylY(q-vec3(0.,.02,0.),.022,.006)-.003,.006);
  float post=sdCylY(q-vec3(0.,H*.5,0.),.007,H*.5);
  post=min(post,length(q-vec3(0.,H+.008,0.))-.01);
  vec3 b=q-vec3(0.,H,0.); b.xy=rot(-t)*b.xy;
  float beam=sdRBox(b,vec3(A,.005,.004),.002);
  beam=min(beam,sdRBox(b-vec3(0.,.012,0.),vec3(.022,.012,.003),.002));
  float ptr=sdCapsule(b,vec3(0.,0.,-.006),vec3(0.,.07,-.006),.0022);
  float d=min(min(base,post),min(beam,ptr));
  float pans=1e5;
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 e=balEnd(H,A,t,s);
    vec3 pc=vec3(e.x,e.y-L,0.); vec3 r=q-pc;
    d=min(d,length(q-e-vec3(0.,-.004,0.))-.006);
    for(int k=0;k<3;k++){ float a=float(k)*2.094+.5; vec3 rim=pc+vec3(.052*cos(a),.004,.052*sin(a));
      d=min(d,sdCapsule(q,e-vec3(0.,.006,0.),rim,.0011)); }
    float pan=length(r*vec3(1.,2.2,1.)-vec3(0.,.07,0.))-.075; pan=max(abs(pan)-.002,r.y-.005); pan=max(pan,-r.y-.02);
    pans=min(pans,pan*.6); }
  return vec2(d,pans); }
