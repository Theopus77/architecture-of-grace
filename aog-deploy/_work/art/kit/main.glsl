/* AOG render kit — main.glsl: camera, one reflection bounce, output HDR radiance. */
vec3 camRay(vec2 frag, out vec3 ro){
  ro=CAM_POS; vec3 f=normalize(CAM_TGT-CAM_POS), r=normalize(cross(vec3(0,1,0),f)), u=cross(f,r);
  vec2 uv=(2.*frag-R)/R.y; float k=tan(radians(CAM_FOV)*.5);
  return normalize(f+k*(uv.x*r+uv.y*u));
}
vec3 radiance(vec3 ro,vec3 rd,out float tHit,int steps){
  vec2 h=march(ro,rd,MAXT,steps); tHit=h.x;
  if(h.y<0.){ tHit=1e5; return background(ro,rd); }
  vec3 p=ro+rd*h.x; vec3 n=calcNormal(p,h.x);
  Mat m=material(h.y,p,n);
  vec3 c=shade(p,n,rd,m,h.x);
  return atmosphere(c,ro,rd,h.x);
}
void main(){
  vec3 ro; vec3 rd=camRay(gl_FragCoord.xy,ro);
  vec2 h=march(ro,rd,MAXT,STEPS);
  vec3 col; float t=h.x;
  if(h.y<0.){ t=1e5; col=background(ro,rd); }
  else{
    vec3 p=ro+rd*h.x; vec3 n=calcNormal(p,h.x);
    Mat m=material(h.y,p,n);
    col=shade(p,n,rd,m,h.x);
    if(m.refl>0.){
      vec3 rr=reflect(rd,n); float tr;
      vec3 rc=radiance(p+n*.01,rr,tr,120);
      float F=.02+.98*pow(1.-max(dot(-rd,n),0.),5.);
      col=col*(1.-F*m.refl)+rc*F*m.refl+col*0.;
    }
    col=atmosphere(col,ro,rd,h.x);
  }
  col=post(col,ro,rd,t);
  o=vec4(clamp(col,0.,40.),1.);   /* keeps sun glints from flooding the bloom mips */
}
