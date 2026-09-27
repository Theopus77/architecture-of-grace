/* AOG render kit — gbuf.glsl: geometry buffers for the pencil renderer (instead of main.glsl).
   GMODE 0: view-space normal (rgb = n*.5+.5).  GMODE 1: r = log depth, g = material id/255,
   b = sun lambert * soft shadow. */
vec3 camRay(vec2 frag, out vec3 ro){
  ro=CAM_POS; vec3 f=normalize(CAM_TGT-CAM_POS), r=normalize(cross(vec3(0,1,0),f)), u=cross(f,r);
  vec2 uv=(2.*frag-R)/R.y; float k=tan(radians(CAM_FOV)*.5);
  return normalize(f+k*(uv.x*r+uv.y*u));
}
void main(){
  vec3 ro; vec3 rd=camRay(gl_FragCoord.xy,ro);
  vec3 f=normalize(CAM_TGT-CAM_POS), r=normalize(cross(vec3(0,1,0),f)), u=cross(f,r);
  vec2 h=march(ro,rd,MAXT,STEPS);
  if(h.y<0.){ o=GMODE==0?vec4(.5,.5,0.,1.):vec4(1.,0.,1.,1.); return; }
  vec3 p=ro+rd*h.x; vec3 n=calcNormal(p,h.x);
  if(GMODE==0){ vec3 v=vec3(dot(n,r),dot(n,u),-dot(n,f)); o=vec4(v*.5+.5,1.); return; }
  float d=log(1.+h.x)/log(1.+MAXT);
  float l=max(dot(n,SUN()),0.); if(l>0.) l*=softShadow(p+n*.01,SUN(),.02,MAXT*.5,12.);
  o=vec4(d,h.y/255.,l,1.);
}
