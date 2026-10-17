/* AOG-LEVEL-EVEN-V1: how even one sound's notes are. rows = [{m, lufs, ...}] (a note can be measured more than once: on
   several strings, takes or recordings). The smooth curve is a straight line through the notes' means, least squares,
   each note's distance from it weighed down where it is far (twice, Tukey's biweight), so one odd note does not bend it:
   the instrument's own register shape, which is kept; everything off it is unevenness.
     stats(rows) → {lo, hi, mean: {m: dB}, fit(m), dev (the note furthest from the curve, dB, signed, and which), jump
       (the biggest step between neighbouring notes beyond the curve's own step), spread (loudest note mean − softest),
       slope (dB from the lowest note to the highest along the curve), cell (the single measurement furthest from the
       curve: a take or a string that stands out)} */
function means(rows){ const by={}; rows.forEach(r=>{ if(!isFinite(r.lufs)) return; (by[r.m]=by[r.m]||[]).push(r.lufs); });
  const out={}; Object.keys(by).forEach(m=>{ const a=by[m]; /* power mean: two takes heard in turn */ out[m]=10*Math.log10(a.reduce((s,x)=>s+Math.pow(10,x/10),0)/a.length); }); return out; }
function line(pts, w){ let sw=0, sx=0, sy=0, sxx=0, sxy=0; pts.forEach(([x,y],i)=>{ const k=w?w[i]:1; sw+=k; sx+=k*x; sy+=k*y; sxx+=k*x*x; sxy+=k*x*y; });
  const d=sw*sxx-sx*sx, b=Math.abs(d)<1e-9?0:(sw*sxy-sx*sy)/d, a=(sy-b*sx)/Math.max(1e-9,sw); return x=>a+b*x; }
function robustLine(pts){ let f=line(pts);
  for(let it=0; it<3; it++){ const r=pts.map(([x,y])=>Math.abs(y-f(x))), s=[...r].sort((a,b)=>a-b)[r.length>>1]*6+1e-6;
    f=line(pts, r.map(u=>u<s ? Math.pow(1-(u/s)*(u/s),2) : 0)); }
  return f; }
function stats(rows){
  const mean=means(rows), ms=Object.keys(mean).map(Number).sort((a,b)=>a-b);
  if(!ms.length) return null;
  const pts=ms.map(m=>[m, mean[m]]), fit=ms.length>2 ? robustLine(pts) : (()=>{ const a=pts.reduce((s,p)=>s+p[1],0)/pts.length; return ()=>a; })();
  let dev={db:0, m:null}, jump={db:0, m:null}, cell={db:0, r:null};
  ms.forEach(m=>{ const d=mean[m]-fit(m); if(Math.abs(d)>Math.abs(dev.db)) dev={db:d, m}; });
  for(let i=1;i<ms.length;i++){ if(ms[i]-ms[i-1]!==1) continue; const d=(mean[ms[i]]-mean[ms[i-1]])-(fit(ms[i])-fit(ms[i-1])); if(Math.abs(d)>Math.abs(jump.db)) jump={db:d, m:ms[i]}; }
  rows.forEach(r=>{ if(!isFinite(r.lufs)) return; const d=r.lufs-fit(r.m); if(Math.abs(d)>Math.abs(cell.db)) cell={db:d, r}; });
  const vals=ms.map(m=>mean[m]), spread=Math.max(...vals)-Math.min(...vals);
  return {lo:ms[0], hi:ms[ms.length-1], mean, fit, dev, jump, cell, spread, slope:fit(ms[ms.length-1])-fit(ms[0])};
}
/* a smooth curve through scattered points (x, y): at each x a straight line through the points within W of it, weighed
   by nearness (tricube) and, after the first pass, by how well each point agrees (biweight), so a recording that stands
   out does not pull its neighbours' curve; used to find each recording's own trim */
function smooth(pts, W){
  const at=(x0, rw)=>{ const sel=[], w=[]; pts.forEach(([x,y],i)=>{ const d=Math.abs(x-x0)/W; if(d<1){ sel.push([x,y]); w.push(Math.pow(1-d*d*d,3)*(rw?rw[i]:1)); } });
    if(sel.length<2) return sel.length ? sel[0][1] : NaN; return line(sel, w)(x0); };
  let rw=null;
  for(let it=0; it<3; it++){ const r=pts.map(([x,y])=>Math.abs(y-at(x, rw))), s=[...r].sort((a,b)=>a-b)[r.length>>1]*6+0.3;
    rw=r.map(u=>u<s ? Math.pow(1-(u/s)*(u/s),2) : 0); }
  return x=>at(x, rw);
}
module.exports={means, stats, robustLine, line, smooth};
