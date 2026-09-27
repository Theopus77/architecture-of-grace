/* Parts for the FACS hands-on project drawings (proj-1 .. proj-17). Include after studio.glsl
   and medparts_a.glsl. Every size is in metres. */

/* a round bowl with a foot ring: base centre at q=0, rim radius R, rim height H */
float bowlD(vec3 q,float R,float H){
  float k=(H+.004)/R; vec3 s=q-vec3(0.,H+.004,0.); s.y/=k;
  float sh=(abs(length(s)-R)-.0045/k)*k; sh=max(sh,q.y-H);
  float rim=sdTorus(q-vec3(0.,H,0.),R-.001,.0042);
  float foot=sdCylY(q-vec3(0.,.005,0.),R*.42,.005)-.0015;
  return min(min(sh,rim),foot); }

/* a heap surface inside a round container: centre c, radius Rh, height of its edge y0, rise hh */
float heapY(vec2 xz,float Rh,float y0,float hh){ float r=length(xz)/Rh; return y0+hh*sqrt(max(0.,1.-r*r)); }

/* loose trail-mix pieces on a heap: returns (distance, id) with ids 20 cereal ring, 21 pretzel,
   22 raisin, 23 seed. q is local to the heap centre. */
vec2 mixPieces(vec3 q,float Rh,float y0,float hh,float cs,float seed){
  vec2 best=vec2(1e5,20.);
  vec2 cell=floor(q.xz/cs);
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
    vec2 c=cell+vec2(float(i),float(j));
    vec2 h=h22(c+seed); float t=h1(c*1.7+seed);
    vec2 xz=(c+.2+.6*h)*cs;
    if(length(xz)>Rh*.93) continue;
    vec3 o=vec3(xz.x,heapY(xz,Rh,y0,hh)-.002,xz.y);
    vec3 l=q-o; l.xz=rot(t*6.28)*l.xz; l.xy=rot((h.x-.5)*1.4)*l.xy;
    float d; float id;
    if(t<.42){ d=sdTorus(l.xzy,.0068,.0029); id=20.; }
    else if(t<.66){ vec3 a=l; a.x=abs(a.x);
      d=sdTorus((a-vec3(.0055,0.,0.)).xzy,.0052,.0019);
      d=min(d,sdCapsule(l,vec3(-.009,0.,-.006),vec3(.009,0.,-.006),.0019)); id=21.; }
    else if(t<.88){ d=sdEll(l,vec3(.0062,.0042,.0048))-.0006*vn3(l*900.); id=22.; }
    else { d=sdEll(l,vec3(.0058,.0024,.0032)); id=23.; }
    if(d<best.x) best=vec2(d,id); }
  return best; }
float mixTone(float id,vec3 p){
  if(id==20.) return .82;
  if(id==21.) return .42+.12*vn3(p*600.);
  if(id==22.) return .2;
  return .7; }
