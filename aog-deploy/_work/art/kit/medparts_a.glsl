/* Parts for the Medicine and Health pencil still lifes (med-u1 .. med-u9). Include after
   studio.glsl. Every part takes a local point q (already moved and turned) in metres. */
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
vec3 place(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
/* a straight-sided cup or mug, base at y=0; handle on +x when hs>0 */
float cupD(vec3 q,float R,float H,float hs){
  float outer=sdCylY(q-vec3(0.,H*.5,0.),R,H*.5)-.002;
  float inner=sdCylY(q-vec3(0.,H*.5+.007,0.),R-.006,H*.5);
  float d=max(outer,-inner);
  d=min(d,sdTorus(q-vec3(0.,H-.001,0.),R-.003,.0036));
  d=min(d,sdTorus(q-vec3(0.,.003,0.),R-.002,.003));
  if(hs>0.){ vec3 h=q-vec3(R+.004,H*.52,0.);
    float hd=length(vec2(length(h.xy*vec2(1.,.8))-hs,h.z))-.0055;
    hd=max(hd,R-.002-length(q.xz)); d=min(d,hd); }
  return d; }
/* an apple, centre at q=0 */
float appleD(vec3 q,float r){
  float rr=length(q.xz);
  float d=length(q*vec3(1.,1.07,1.))-r;
  d+=r*.2*exp(-rr*rr/(r*r*.07))*smoothstep(-.2*r,.6*r,q.y);
  d+=r*.1*exp(-rr*rr/(r*r*.05))*smoothstep(.2*r,-.7*r,q.y);
  d*=.8;
  float stem=sdCapsule(q,vec3(0.,.62*r,0.),vec3(.12*r,1.18*r,.02*r),.055*r);
  return min(d,stem); }
float appleLeaf(vec3 q,float r){ vec3 l=q-vec3(.3*r,1.02*r,0.); l.xy=rot(-.5)*l.xy; return sdEll(l,vec3(.34*r,.06*r,.15*r)); }
/* a toothbrush standing along +y from its tail at q=0; bristles face +z */
float brushD(vec3 q){
  float h=sdCapsule(q,vec3(0.),vec3(0.,.155,0.),.0055);
  h=smin(h,sdRBox(q-vec3(0.,.172,0.),vec3(.0055,.02,.0035),.003),.006);
  float b=sdRBox(q-vec3(0.,.174,.0085),vec3(.0048,.017,.006),.0015);
  return min(h,b); }
/* a pencil lying along +x, centred on q=0, radius R */
float pencilD2(vec3 q,float L){
  float R=.0062; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x)-L);
  float t=clamp((q.x-L)/.026,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95-.0003,max(L-q.x,q.x-L-.026));
  float fer=max(length(q.yz)-R*.98,abs(q.x+L+.008)-.008);
  float era=max(length(q.yz)-R*.93,abs(q.x+L+.022)-.007)-.0006;
  return min(min(body,cone),min(fer,era)); }
float pencilTone(vec3 q,float L){
  if(q.x>L) return q.x>L+.018?.12:.88;
  if(q.x<-L-.016) return .5;
  if(q.x<-L) return fract(q.x/.003)<.35?.3:.7;
  return abs(q.z)<.0012?.35:.6; }
/* a hardcover book lying flat, centre of its bottom at q=0; spine on -x */
float bookD(vec3 q,vec3 s){
  float cov=sdRBox(q-vec3(0.,s.y,0.),s+vec3(0.,0.,0.),.004);
  float pages=sdBox(q-vec3(.004,s.y,0.),vec3(s.x-.001,s.y-.005,s.z-.001));
  float d=max(cov,-sdBox(q-vec3(.006,s.y,0.),vec3(s.x,s.y-.0045,s.z-.004)));
  d=min(d,pages);
  float spine=sdCylY((q-vec3(-s.x+.004,s.y,0.)).yxz*vec3(1.,1.,1.),s.y*1.02,s.z);
  spine=max(spine,-(q.x+s.x-.004)); spine=sdCylZ(q-vec3(-s.x+.003,s.y,0.),s.y+.0005,s.z);
  spine=max(spine,q.x+s.x-.003);
  d=min(d,spine);
  for(int i=0;i<4;i++){ float z=(float(i)-1.5)*s.z*.45; d=min(d,max(sdCylZ(q-vec3(-s.x+.003,s.y,z),s.y+.0025,.003),q.x+s.x-.004)); }
  return d; }
/* a rolled bandage standing on end, base at y=0 */
float rollD(vec3 q,float R,float H){
  float d=sdCylY(q-vec3(0.,H*.5,0.),R,H*.5)-.002;
  d=max(d,-sdCylY(q-vec3(0.,H*.5,0.),R*.32,H));
  return d; }
float rollTail(vec3 q,float R,float L){ vec3 t=q-vec3(R+L*.5-.004,.0012,0.); t.x-=0.;
  return sdRBox(t,vec3(L*.5,.0012,.024),.001); }
/* a pill bottle with a ridged cap, base at y=0 */
float bottleD(vec3 q,float R,float H){
  float body=sdCylY(q-vec3(0.,H*.42,0.),R,H*.42)-.003;
  float neck=sdCylY(q-vec3(0.,H*.86,0.),R*.8,H*.06);
  return smin(body,neck,.006); }
float capD(vec3 q,float R,float H){ float a=atan(q.z,q.x);
  return sdCylY(q-vec3(0.,H*.95,0.),R*1.02+.0012*smoothstep(-.3,.3,cos(a*36.)),H*.09)-.0025; }
