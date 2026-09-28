/* ══ AOG-IEP-ENGINE-V1 (2026-09-27) — THE IEP DRAFT BUILDS ITSELF FROM CLASSROOM DATA ═══════════════════
   Jimmy: "All of this data should be able to be uploaded from various inputs that the website has
   collected on a student / individual, to compile most of the IEP by itself" … "a built-in engine, not
   a button the teacher has to remember."

   What this file is: pure functions, no page, no network. The dashboard hands it the rows it already
   holds for one student; it hands back English text for the IEP fields the data honestly supports, and
   the series for the charts. Nothing here leaves the device.

   The rules it keeps (an IEP is a legal document):
   1. Only real data. Every line ends with its source in brackets. No data → no text.
   2. The teacher's words are never changed. A field has two layers: the ENGINE's latest text and the
      TEACHER's. Once the teacher edits a field it is theirs for good (apply / noteEdit below).
   3. Never a diagnosis, never a deficit label. Strengths first; "room to grow", not "weakness".
   4. Private things stay out: follow-up flags, "tell an adult", free-text notes on exit, repair and
      home slips, anything a student marked private in My Voice, and everything from home (family and
      health belong to the family and the teacher).

   ROUTES (below) is the one table that says which slip question feeds which IEP area and field.
   Jimmy can change a line there and both the text and the charts follow. */
(function(root){
"use strict";

/* ── IEP areas and where each one prints. When the IEP has no section of its own for an area, the area
      is a sub-heading inside the closest existing section (never a new legal section). ── */
var AREAS={
  academic:{en:"Academic",       field:"d_selfview", note:"Printed in Present level of academic achievement, under 'Student self-assessment'."},
  sel:     {en:"Social-emotional",field:"e_sel",      note:"No social-emotional section in these forms: printed in Functional performance, under 'Social-emotional'."},
  class:   {en:"In the classroom",field:"e_particip_t",note:"Functional performance lines (participation, routines, peers, work, supports)."},
  indep:   {en:"Independence and self-advocacy",field:"e_indep",note:"No independence/transition section in these forms: printed in Functional performance, under 'Independence and self-advocacy'."},
  comm:    {en:"Communication",  field:"",           note:"No slip asks about communication, so nothing is routed here."}
};

/* ── THE ROUTING TABLE. One line per question. src = where the row comes from (checkinType, or
      "checkin" daily check-in, "exit" exit slip, "weekly:mon|mid|fri", "adult" observation domain,
      "reflect" self-reflection). kind: scale (1–5, averaged and charted), pick (counted), quote (their
      own words, quoted), num (a 0–100 score). field = the IEP draft box it writes into. ── */
var ROUTES=[
  /* daily check-in (start of class) */
  {src:"checkin", q:"arrival",      kind:"scale", area:"sel",      field:"e_sel",        label:"How they arrived",           chart:true},
  {src:"checkin", q:"readiness",    kind:"scale", area:"class",    field:"e_particip_t", label:"Ready to learn",             chart:true},
  {src:"checkin", q:"connection",   kind:"scale", area:"sel",      field:"e_sel",        label:"Feeling connected"},
  {src:"checkin", q:"feelingWords", kind:"pick",  area:"sel",      field:"e_sel",        label:"Feeling words they chose most"},
  {src:"checkin", q:"challenge",    kind:"pick",  area:"sel",      field:"e_sel",        label:"What was on their mind",     skip:["Nothing today"]},
  {src:"checkin", q:"need",         kind:"pick",  area:"class",    field:"e_supports",   label:"What they asked for",        skip:["I’m okay","I'm okay","Nothing right now"]},
  {src:"checkin", q:"agency",       kind:"pick",  area:"indep",    field:"e_indep",      label:"Strategies they chose for themselves"},
  /* exit slip (end of the day) */
  {src:"exit",    q:"favClass",     kind:"pick",  area:"academic", field:"d_selfview",   label:"Class they liked most (exit slips)"},
  {src:"exit",    q:"hardClass",    kind:"pick",  area:"academic", field:"d_selfview",   label:"Class that felt hardest (exit slips)"},
  {src:"exit",    q:"goodMoment",   kind:"pick",  area:"sel",      field:"e_sel",        label:"Good moments they named (exit slips)"},
  {src:"exit",    q:"dayWord",      kind:"pick",  area:"sel",      field:"e_sel",        label:"Their word for the day (exit slips)"},
  /* weekly slips */
  {src:"weekly:mon", q:"start",     kind:"wscale",area:"sel",      field:"e_sel",        label:"Starting the week (Monday slips)"},
  {src:"weekly:mid", q:"sofar",     kind:"wscale",area:"sel",      field:"e_sel",        label:"The week so far (midweek slips)"},
  {src:"weekly:mid", q:"help",      kind:"wpick", area:"class",    field:"e_supports",   label:"What has been helping (midweek slips)", skip:["Not sure","No sé"]},
  {src:"weekly:fri", q:"week",      kind:"wscale",area:"sel",      field:"e_sel",        label:"How the week went (Friday slips)"},
  {src:"weekly:fri", q:"proud",     kind:"wpick", area:"sel",      field:"a_strengths",  label:"What they were proud of (Friday slips)"},
  /* the slips on /slip.html */
  {src:"slip-test",    q:"ready",   kind:"scale", area:"academic", field:"d_selfview",   label:"Ready for a test",          chart:true},
  {src:"slip-test",    q:"shaky",   kind:"pick",  area:"academic", field:"d_selfview",   label:"Parts of a test that felt unsure", skip:["Nothing feels shaky"]},
  {src:"slip-test",    q:"help",    kind:"pick",  area:"class",    field:"e_supports",   label:"What would help before a test", skip:["I'm set"]},
  {src:"slip-endclass",q:"got",     kind:"scale", area:"academic", field:"d_selfview",   label:"Understood the lesson",     chart:true},
  {src:"slip-endclass",q:"work",    kind:"pick",  area:"class",    field:"e_org_t",      label:"How they worked in class (their view)"},
  {src:"slip-endclass",q:"help",    kind:"pick",  area:"class",    field:"e_supports",   label:"What helped them learn"},
  {src:"slip-endclass",q:"learned", kind:"quote", area:"academic", field:"d_selfview",   label:"One thing I learned today"},
  {src:"slip-posttest",q:"went",    kind:"scale", area:"academic", field:"d_selfview",   label:"How a test went (their view)", chart:true},
  {src:"slip-posttest",q:"hard",    kind:"pick",  area:"academic", field:"d_selfview",   label:"What was hard on a test",   skip:["Nothing was hard"]},
  {src:"slip-posttest",q:"prep",    kind:"pick",  area:"indep",    field:"e_indep",      label:"How they got ready for a test", skip:["I didn't get ready"]},
  {src:"slip-posttest",q:"next",    kind:"pick",  area:"class",    field:"e_supports",   label:"What would help next test", skip:["Keep it the same"]},
  {src:"slip-repair",  q:"now",     kind:"scale", area:"sel",      field:"e_sel",        label:"How they felt after a reset"},
  {src:"slip-repair",  q:"needed",  kind:"pick",  area:"sel",      field:"e_sel",        label:"What they needed in a hard moment", skip:["I'm not sure"]},
  {src:"slip-repair",  q:"next",    kind:"pick",  area:"sel",      field:"e_sel",        label:"What they plan to try next time", skip:["Not sure yet"]},
  {src:"slip-goal",    q:"close",   kind:"scale", area:"academic", field:"goals_data",   label:"Their own rating of how close they are to their goal"},
  {src:"slip-goal",    q:"helps",   kind:"pick",  area:"class",    field:"e_supports",   label:"What helps with their goal"},
  {src:"slip-team",    q:"team",    kind:"scale", area:"class",    field:"e_peers_t",    label:"How well their group worked"},
  {src:"slip-team",    q:"me",      kind:"scale", area:"class",    field:"e_peers_t",    label:"How much they helped their group"},
  {src:"slip-team",    q:"good",    kind:"pick",  area:"class",    field:"e_peers_t",    label:"What their group was good at"},
  {src:"slip-unit",    q:"conf",    kind:"scale", area:"academic", field:"d_selfview",   label:"Ready for a unit test"},
  {src:"slip-unit",    q:"stuck",   kind:"pick",  area:"academic", field:"d_selfview",   label:"What stuck from a unit",    skip:["Not much yet"]},
  {src:"slip-unit",    q:"notyet",  kind:"pick",  area:"academic", field:"d_selfview",   label:"What has not stuck yet",    skip:["It all stuck"]},
  {src:"slip-unit",    q:"how",     kind:"pick",  area:"class",    field:"e_supports",   label:"How they learned best in a unit"},
  /* adult observations (support form): the four domains, and each ticked sentence by its domain */
  {src:"adult", q:"engaged",      kind:"domain", area:"class", field:"e_particip_t", label:"engaged"},
  {src:"adult", q:"regulated",    kind:"domain", area:"class", field:"e_routines_t", label:"regulated (steady, back on track)"},
  {src:"adult", q:"usedStrategy", kind:"domain", area:"sel",   field:"e_sel",        label:"kind to themselves after a mistake"},
  {src:"adult", q:"connected",    kind:"domain", area:"class", field:"e_peers_t",    label:"connected with others"},
  /* the eighteen-question self-reflection (MTSS) */
  {src:"reflect", q:"composite",  kind:"num",   area:"sel",   field:"e_sel",        label:"Self-reflection", chart:true}
];
/* never routed, on purpose: slip-home (from the family: sleep, mood, medicine — the family's to share),
   repair "what happened", exit "roughMoment" and "written", weekly "tell"/"note"/"again", every
   followUp / tellAdult / trustedAdultFlag / unsafeFlag, and adult "flags". */

/* the adult observation sentences (index.html, window.AOG_OBS), short labels, by domain */
var OBS={e_stayed:["Stayed with it","engaged"],e_asked:["Asked for help","engaged"],e_own:["Got started","engaged"],e_joined:["Joined in","engaged"],
  e_kept:["Kept going after a mistake","usedStrategy"],r_back:["Got back on track","regulated"],r_change:["Took a change in stride","regulated"],
  r_tool:["Used a support to get through a rough moment","regulated"],r_fair:["Was fair to themselves","usedStrategy"],
  c_worked:["Worked well with someone","connected"],c_kind:["Was kind or considerate","connected"],c_built:["Built on an idea or made something right","connected"]};
var DOMFIELD={}; ROUTES.forEach(function(r){ if(r.src==="adult") DOMFIELD[r.q]=r.field; });
var REFL={A:"Emotional Regulation & Well-Being",B:"Self-Compassion & Growth Mindset",C:"Social Competency & Repair"};

/* the fields the engine may write, by section of the draft */
var FIELDS={goals:["goals_data"],str:["a_strengths"],
  pl:["d_ela_data","d_ela_strength","d_ela_diff","d_ela_supports","d_math_data","d_math_strength","d_math_diff","d_math_supports","d_selfview","d_other"],
  cls:["e_particip_t","e_org_t","e_routines_t","e_peers_t","e_supports","e_sel","e_indep"],data:["f_data"],impact:["g_impact"]};

/* ── small, testable helpers ── */
var MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function day(r){ return String((r&&(r.date||r.timestamp))||"").slice(0,10); }
function okDay(d){ return /^\d{4}-\d{2}-\d{2}$/.test(d); }
function fmtD(d,withYear){ if(!okDay(d)) return String(d||""); var m=+d.slice(5,7), n=+d.slice(8,10); return MON[m-1]+" "+n+(withYear?", "+d.slice(0,4):""); }
function fmtRange(a,b){ if(!okDay(a)) return ""; if(!okDay(b)||a===b) return fmtD(a); if(a>b){ var t=a; a=b; b=t; }
  var y=a.slice(0,4)!==b.slice(0,4); if(!y&&a.slice(5,7)===b.slice(5,7)) return fmtD(a)+"–"+(+b.slice(8,10));
  return fmtD(a,y)+"–"+fmtD(b,y); }
function spanOf(rows){ var ds=rows.map(day).filter(okDay).sort(); return ds.length?{a:ds[0],b:ds[ds.length-1]}:null; }
function src(label,n,unit,rows){ var s=spanOf(rows||[]), bits=[label]; if(n!=null) bits.push(n+" "+(n===1?unit[0]:unit[1])); if(s) bits.push(fmtRange(s.a,s.b)); return "("+bits.join(" · ")+")"; }
function num(v){ if(v===null||v===undefined||v==="") return null; var n=+v; return isFinite(n)?n:null; }
function pct(a,b){ return b>0?Math.round(100*a/b):null; }
function r1(v){ return Math.round(v*10)/10; }
function fold(n){ return String(n==null?"":n).replace(/[’‘`´]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g," ").trim().toLowerCase(); }
function xp(r){ try{ var x=typeof r.extra==="string"?JSON.parse(r.extra):(r.extra||{}); return x&&typeof x==="object"?x:{}; }catch(e){ return {}; } }
function clean(s){ return String(s==null?"":s).replace(/[\u{1F000}-\u{1FFFF}☀-➿️‍]/gu,"").replace(/\s+/g," ").trim(); }
function byDate(rows){ return rows.slice().sort(function(a,b){ var x=String(a.timestamp||day(a)), y=String(b.timestamp||day(b)); return x<y?-1:x>y?1:0; }); }
function mean(a){ return a.length?a.reduce(function(s,v){ return s+v; },0)/a.length:null; }

/* first half against second half of a series in time order. null when there are fewer than 4. */
function trend(vals,step){ if(!vals||vals.length<4) return null; var h=Math.floor(vals.length/2), a=mean(vals.slice(0,h)), b=mean(vals.slice(vals.length-h));
  var dir=(b-a)>=step?"up":(a-b)>=step?"down":"same"; return {a:a,b:b,dir:dir}; }
function trendWords(t,unitPct,what){ if(!t) return ""; var f=function(v){ return unitPct?Math.round(v)+"%":r1(v)+""; };
  if(t.dir==="up") return "higher in recent "+what+" ("+f(t.a)+" → "+f(t.b)+")";
  if(t.dir==="down") return "lower in recent "+what+" ("+f(t.a)+" → "+f(t.b)+")";
  return "about the same across the period ("+f(t.a)+" → "+f(t.b)+")"; }

/* count the answers of a pick question: "A; B" or "A, B" or an array */
function tally(vals,skip){ var c={}, order=[]; skip=(skip||[]).map(fold);
  vals.forEach(function(v){ (Array.isArray(v)?v:String(v==null?"":v).split(/\s*[;,·]\s*/)).forEach(function(x){ x=clean(x); if(!x||skip.indexOf(fold(x))>=0) return; if(c[x]==null){ c[x]=0; order.push(x); } c[x]++; }); });
  return order.map(function(k){ return [k,c[k]]; }).sort(function(a,b){ return b[1]-a[1]; }); }
function topList(t,n){ return t.slice(0,n||4).map(function(p){ return p[0]+" ("+p[1]+")"; }).join(", "); }

/* per-box results: "Place value 1/1; Fractions 0/1" or [{name,ok,n}] */
function parseStrands(v){ var out=[];
  if(Array.isArray(v)){ v.forEach(function(r){ if(r&&!Array.isArray(r)&&typeof r==="object"){ var nm=clean(r.name||r.strand||r.label||""), ok=num(r.ok!=null?r.ok:r.correct), n=num(r.n!=null?r.n:r.total); if(nm&&n>0&&ok!=null&&!/^Box \d+$/.test(nm)) out.push({name:nm,ok:ok,n:n}); } }); return out; }
  String(v||"").split(/\s*;\s*/).forEach(function(s){ var m=/^(.*\S)\s+(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(s); if(m&&+m[3]>0&&!/^Box \d+$/.test(m[1])) out.push({name:clean(m[1]),ok:+m[2],n:+m[3]}); });
  return out; }
function strandTable(rows){ var t={}; rows.forEach(function(r){ var s=parseStrands(r.byStrand); if(!s.length) s=parseStrands(xp(r).byStrand); s.forEach(function(x){ var e=t[x.name]||(t[x.name]={name:x.name,ok:0,n:0,rows:0}); e.ok+=x.ok; e.n+=x.n; e.rows++; }); });
  return Object.keys(t).map(function(k){ var e=t[k]; e.pct=pct(e.ok,e.n); return e; }); }
/* strongest: 70%+ and 4+ items. room to grow: under 70% and 4+ items. never the same skill in both. */
function strongWeak(tab){ var ok=tab.filter(function(e){ return e.n>=4; });
  var strong=ok.filter(function(e){ return e.pct>=70; }).sort(function(a,b){ return b.pct-a.pct||b.n-a.n||a.name.localeCompare(b.name); }).slice(0,3);
  var grow=ok.filter(function(e){ return e.pct<70; }).sort(function(a,b){ return a.pct-b.pct||b.n-a.n||a.name.localeCompare(b.name); }).slice(0,3);
  return {strong:strong,grow:grow}; }
function skillList(a){ return a.map(function(e){ return e.name+" ("+e.pct+"% of "+e.n+" items)"; }).join(", "); }

/* which subject and which kind of work a practice row is */
var SUBJ={math:"math",mth:"math",ela:"ela",write:"ela",reading:"ela",english:"ela",writing:"ela"};
var SUBJNAME={math:"Math",ela:"ELA",science:"Science",sci:"Science","social-studies":"Social Studies",ssc:"Social Studies",spanish:"Spanish",spa:"Spanish"};
function subjectOf(r){ var x=xp(r), s=String(x.subject||"").toLowerCase(), id=String(r.activityId||"");
  if(!s){ var m=/^(?:dd|crs)-([a-z-]+?)(?:-|$)/.exec(id); if(m) s=m[1]; }
  if(!s){ var nm=String(r.activityName||""); if(/math/i.test(nm)) s="math"; else if(/language arts|reading|writing|english|ela/i.test(nm)) s="ela"; else if(/science/i.test(nm)) s="science"; }
  return {group:SUBJ[s]||(s?"other":"other"), key:s||"", name:SUBJNAME[s]||(s?s.charAt(0).toUpperCase()+s.slice(1):"Other work")}; }
function kindOf(r){ var x=xp(r), id=String(r.activityId||"");
  if(x.series==="daily-drops"||/^dd-/.test(id)) return (x.kind==="writing"||/^dd-write/.test(id))?"write":"dd";
  if(x.series==="course"||/^crs-/.test(id)) return (r.assessment==="unit-test"||/-t\d+$/.test(id))?"test":"check";
  return "work"; }

/* first-try accuracy of a set of scored rows, item-weighted */
function scoreStats(rows){ var sc=byDate(rows.filter(function(r){ return num(r.itemsTotal)>0&&num(r.independent)!=null; }));
  if(!sc.length) return null;
  var items=0, ind=0; sc.forEach(function(r){ items+=num(r.itemsTotal); ind+=Math.min(num(r.independent),num(r.itemsTotal)); });
  var per=sc.map(function(r){ return 100*Math.min(num(r.independent),num(r.itemsTotal))/num(r.itemsTotal); });
  var sup=sc.filter(function(r){ return num(r.supported)!=null; }), sItems=0, sFix=0; sup.forEach(function(r){ sItems+=num(r.itemsTotal); sFix+=Math.min(num(r.independent)+num(r.supported),num(r.itemsTotal)); });
  var hints=sc.filter(function(r){ var h=num(r.hintsUsed); if(h==null) h=num(xp(r).hints); return h>0; }).length;
  return {rows:sc,n:sc.length,items:items,ind:ind,pct:pct(ind,items),trend:trend(per,5),supRows:sup.length,supFixed:sup.filter(function(r){ return num(r.supported)>0; }).length,afterPct:pct(sFix,sItems),supPctFirst:pct(sup.reduce(function(s,r){ return s+Math.min(num(r.independent),num(r.itemsTotal)); },0),sItems),hints:hints}; }

/* ── the builders, one per area ── */
function academics(input,T,C){
  var pr=input.pr||[], groups={};
  pr.forEach(function(r){ var s=subjectOf(r), k=kindOf(r); var g=groups[s.group==="other"?"o:"+s.name:s.group]||(groups[s.group==="other"?"o:"+s.name:s.group]={group:s.group,name:s.group==="ela"?"ELA":s.group==="math"?"Math":s.name,dd:[],write:[],check:[],test:[],work:[]}); g[k].push(r); });
  var other=[], suggest=[], impact=[], dataList=[];
  Object.keys(groups).forEach(function(key){ var g=groups[key], L=[], sup=[], px=g.group==="ela"?"ela":g.group==="math"?"math":null, subjL=g.name;
    var dd=scoreStats(g.dd);
    if(dd){ L.push("Daily Drafts: "+dd.n+" sheet"+(dd.n===1?"":"s")+", "+dd.items+" items; "+dd.pct+"% right on the first try"+(dd.trend?"; "+trendWords(dd.trend,true,"sheets"):"")+". "+src("Daily Drafts · "+subjL,dd.n,["sheet","sheets"],dd.rows));
      if(dd.supRows){ sup.push("When they checked their work and fixed answers ("+dd.supRows+" sheet"+(dd.supRows===1?"":"s")+"): "+dd.supPctFirst+"% on the first try, "+dd.afterPct+"% after fixing. "+src("Daily Drafts · "+subjL+" · checked sheets",dd.supRows,["sheet","sheets"],dd.rows.filter(function(r){ return num(r.supported)!=null; }))); }
      if(dd.hints) sup.push("Used hints on "+dd.hints+" of "+dd.n+" sheets. "+src("Daily Drafts · "+subjL,dd.n,["sheet","sheets"],dd.rows));
      C.push({id:"dd-"+key,field:px?"d_"+px+"_data":"d_other",sec:"pl",caption:"Daily Drafts · "+subjL+" · first try, % right · "+dd.n+" sheets · "+fmtRange(spanOf(dd.rows).a,spanOf(dd.rows).b),min:0,max:100,
        pts:dd.rows.map(function(r){ return {d:day(r),v:Math.round(100*Math.min(num(r.independent),num(r.itemsTotal))/num(r.itemsTotal))}; })});
      dataList.push("Daily Drafts, "+subjL+": "+dd.n+" sheets, "+dd.pct+"% first try "+src("Daily Drafts · "+subjL,dd.n,["sheet","sheets"],dd.rows));
      var sw=strongWeak(strandTable(dd.rows));
      if(px&&sw.strong.length) T["d_"+px+"_strength"]=add(T["d_"+px+"_strength"],"Strongest skills on Daily Drafts: "+skillList(sw.strong)+". "+src("Daily Drafts · "+subjL+" · per-box results",dd.n,["sheet","sheets"],dd.rows));
      if(px&&sw.grow.length) T["d_"+px+"_diff"]=add(T["d_"+px+"_diff"],"Most room to grow on Daily Drafts: "+skillList(sw.grow)+". "+src("Daily Drafts · "+subjL+" · per-box results",dd.n,["sheet","sheets"],dd.rows));
      if(!px){ if(sw.strong.length) L.push("Strongest skills: "+skillList(sw.strong)+". "+src("Daily Drafts · "+subjL+" · per-box results",dd.n,["sheet","sheets"],dd.rows));
               if(sw.grow.length) L.push("Most room to grow: "+skillList(sw.grow)+". "+src("Daily Drafts · "+subjL+" · per-box results",dd.n,["sheet","sheets"],dd.rows)); }
      if(sw.grow.length) suggest.push(subjL+": "+skillList(sw.grow.slice(0,2))+" "+src("Daily Drafts · "+subjL+" · per-box results",dd.n,["sheet","sheets"],dd.rows));
      else if(dd.pct<70) suggest.push(subjL+": first-try accuracy on Daily Drafts, now "+dd.pct+"% "+src("Daily Drafts · "+subjL,dd.n,["sheet","sheets"],dd.rows));
      if(dd.pct<70||sw.grow.length) impact.push(subjL+": "+dd.pct+"% right on the first try across "+dd.n+" Daily Drafts sheets"+(sw.grow.length?"; most room to grow in "+skillList(sw.grow.slice(0,2)):"")+". "+src("Daily Drafts · "+subjL,dd.n,["sheet","sheets"],dd.rows));
    }
    var wr=g.write.filter(function(r){ var x=xp(r); return num(x.rubricTotal)!=null&&num(x.rubricMax)>0; });
    if(wr.length){ var ws=byDate(wr), got=0, max=0; ws.forEach(function(r){ var x=xp(r); got+=num(x.rubricTotal); max+=num(x.rubricMax); });
      var wt=trend(ws.map(function(r){ var x=xp(r); return 100*num(x.rubricTotal)/num(x.rubricMax); }),5);
      L.push("Writing: "+ws.length+" scored piece"+(ws.length===1?"":"s")+", "+pct(got,max)+"% of rubric points"+(wt?"; "+trendWords(wt,true,"pieces"):"")+". "+src("Daily Drafts · Writing rubric",ws.length,["piece","pieces"],ws));
      dataList.push("Writing rubric: "+ws.length+" pieces, "+pct(got,max)+"% of points "+src("Daily Drafts · Writing rubric",ws.length,["piece","pieces"],ws)); }
    var ck=scoreStats(g.check), ts=scoreStats(g.test);
    if(ck) L.push("Lesson checks: "+ck.n+", "+ck.pct+"% right on the first try. "+src("Course lessons · "+subjL+" · checks",ck.n,["check","checks"],ck.rows));
    if(ts){ L.push("Unit tests: "+ts.n+", "+ts.pct+"% right. "+src("Course lessons · "+subjL+" · unit tests",ts.n,["test","tests"],ts.rows));
      C.push({id:"test-"+key,field:px?"d_"+px+"_data":"d_other",sec:"pl",caption:"Unit tests · "+subjL+" · % right · "+ts.n+" tests · "+fmtRange(spanOf(ts.rows).a,spanOf(ts.rows).b),min:0,max:100,pts:ts.rows.map(function(r){ return {d:day(r),v:Math.round(100*Math.min(num(r.independent),num(r.itemsTotal))/num(r.itemsTotal))}; })}); }
    if(ck||ts) dataList.push("Course lessons, "+subjL+": "+(ck?ck.n+" checks ("+ck.pct+"%)":"")+(ck&&ts?", ":"")+(ts?ts.n+" unit tests ("+ts.pct+"%)":"")+" "+src("Course lessons · "+subjL,(ck?ck.n:0)+(ts?ts.n:0),["piece","pieces"],(ck?ck.rows:[]).concat(ts?ts.rows:[])));
    var wk=scoreStats(g.work); if(wk) L.push("Other scored work: "+wk.n+" piece"+(wk.n===1?"":"s")+", "+wk.pct+"% right on the first try. "+src("Turn-ins · "+subjL,wk.n,["piece","pieces"],wk.rows));
    if(px){ if(L.length) T["d_"+px+"_data"]=add(T["d_"+px+"_data"],L.join("\n")); if(sup.length) T["d_"+px+"_supports"]=add(T["d_"+px+"_supports"],sup.join("\n")); }
    else if(L.length){ other.push(subjL+" — "+L.join("\n")); if(sup.length) other.push(sup.join("\n")); }
  });
  if(other.length) T.d_other=add(T.d_other,other.join("\n"));
  /* work turned in, for work habits */
  var all=byDate(pr.filter(function(r){ return okDay(day(r)); }));
  if(all.length){ var days={}; all.forEach(function(r){ days[day(r)]=1; });
    T.e_org_t=add(T.e_org_t,"Turned in "+all.length+" piece"+(all.length===1?"":"s")+" of work on "+Object.keys(days).length+" different day"+(Object.keys(days).length===1?"":"s")+". "+src("Inbox · turned-in work",all.length,["piece","pieces"],all)); }
  return {suggest:suggest,impact:impact,dataList:dataList};
}

function routeRows(route,input){
  if(route.src==="checkin") return (input.ci||[]).filter(function(r){ var t=String(r.checkinType||r.slipType||""); return t==="daily"||t==="checkin"||(String(r.slipType||"")==="checkin"); });
  if(route.src==="exit") return (input.ci||[]).filter(function(r){ return String(r.slipType||"")==="exit"||String(r.checkinType||"")==="exit"; });
  if(/^weekly:/.test(route.src)){ var w=route.src.slice(7); return (input.ci||[]).concat(input.slips||[]).filter(function(r){ return String(r.checkinType||"")==="weekly"&&String(r.weekly||xp(r).w||"")===w; }); }
  return (input.slips||[]).filter(function(r){ return String(r.checkinType||"")===route.src; });
}
function routeVal(route,r){ var x=xp(r);
  if(/^weekly:/.test(route.src)){ var a=(x.answers||{})[route.q]; return a&&typeof a==="object"?a.a:a; }
  if(/^slip-/.test(route.src)){ if(route.kind==="scale") return (x.scale||{})[route.q]; return (x.answers||{})[route.q]; }
  return r[route.q]!=null?r[route.q]:x[route.q]; }
var WX=["rough","heavy","okay","pretty good","great"], WXES=["difícil","pesado","más o menos","bastante bien","genial"];
function wscale(v){ var s=fold(clean(v)); var i=WX.indexOf(s); if(i<0) i=WXES.indexOf(s); return i<0?null:i+1; }

function slipsAndCheckins(input,T,C,names){
  ROUTES.forEach(function(rt){ if(rt.src==="adult"||rt.src==="reflect") return; if(input.fields&&input.fields.indexOf(rt.field)<0&&rt.field!=="a_strengths") return;
    var rows=routeRows(rt,input); if(!rows.length) return;
    var nm=names[rt.src]||rt.src;
    if(rt.kind==="scale"||rt.kind==="wscale"){ var pts=byDate(rows).map(function(r){ var v=rt.kind==="wscale"?wscale(routeVal(rt,r)):num(routeVal(rt,r)); return (v!=null&&v>=1&&v<=5)?{r:r,v:v}:null; }).filter(Boolean);
      if(!pts.length) return; var m=mean(pts.map(function(p){ return p.v; })), t=trend(pts.map(function(p){ return p.v; }),0.3);
      T[rt.field]=add(T[rt.field],rt.label+": "+r1(m)+" of 5 on average over "+pts.length+" answer"+(pts.length===1?"":"s")+(t?"; "+trendWords(t,false,"answers"):"")+". "+src(nm,pts.length,["answer","answers"],pts.map(function(p){ return p.r; })));
      if(rt.chart&&pts.length>=2){ var byD={}; pts.forEach(function(p){ var d=day(p.r); (byD[d]=byD[d]||[]).push(p.v); });
        var span=spanOf(pts.map(function(p){ return p.r; }));
        C.push({id:"r-"+rt.src+"-"+rt.q,field:rt.field,caption:nm+" · "+rt.label+" · 1 to 5 · "+pts.length+" answers · "+fmtRange(span.a,span.b),min:1,max:5,pts:Object.keys(byD).sort().map(function(d){ return {d:d,v:r1(mean(byD[d]))}; })}); }
      return; }
    if(rt.kind==="pick"||rt.kind==="wpick"){ var vals=rows.map(function(r){ return routeVal(rt,r); }).filter(function(v){ return v!=null&&String(v).trim(); });
      var tl=tally(vals,rt.skip); if(!tl.length) return; var used=rows.filter(function(r){ var v=routeVal(rt,r); return v!=null&&String(v).trim(); });
      T[rt.field]=add(T[rt.field],rt.label+": "+topList(tl,4)+". "+src(nm,used.length,["answer","answers"],used)); return; }
    if(rt.kind==="quote"){ var q=byDate(rows).filter(function(r){ var v=routeVal(rt,r); return v&&String(v).trim().length>2; }).slice(-2);
      q.forEach(function(r){ T[rt.field]=add(T[rt.field],"In their own words (\""+rt.label+"\"): “"+clean(routeVal(rt,r)).slice(0,200)+"” ("+nm+" · "+fmtD(day(r))+")"); }); }
  });
}

function adults(input,T,C){ var rows=byDate(input.adult||[]); if(!rows.length) return;
  var tot={}, got={}, who={}, items={};
  rows.forEach(function(r){ who[String(r.respondentId||r.observer||r.staffRole||"?")]=1;
    ["engaged","regulated","usedStrategy","connected"].forEach(function(k){ if(!Object.prototype.hasOwnProperty.call(r,k)) return; tot[k]=(tot[k]||0)+1; if(r[k]===true||String(r[k]).toLowerCase()==="true"||r[k]===1||r[k]==="1") got[k]=(got[k]||0)+1; });
    var ob=Array.isArray(r.obs)?r.obs:(Array.isArray(xp(r).obs)?xp(r).obs:[]); ob.forEach(function(k){ if(OBS[k]) items[k]=(items[k]||0)+1; }); });
  var n=rows.length, na=Object.keys(who).length, S=function(extra){ return "(Adult observations · "+n+" observation"+(n===1?"":"s")+" · "+na+" adult"+(na===1?"":"s")+(extra?" · "+extra:"")+" · "+fmtRange(spanOf(rows).a,spanOf(rows).b)+")"; };
  var strong=[];
  ROUTES.filter(function(rt){ return rt.src==="adult"; }).forEach(function(rt){ var k=rt.q; if(!tot[k]) return; var p=pct(got[k]||0,tot[k]);
    var its=Object.keys(items).filter(function(i){ return OBS[i][1]===k; }).sort(function(a,b){ return items[b]-items[a]; });
    var line="Adults saw them "+rt.label+" in "+(got[k]||0)+" of "+tot[k]+" observed periods ("+p+"%)."+(its.length?" Most-ticked: "+its.slice(0,3).map(function(i){ return OBS[i][0]+" ("+items[i]+")"; }).join(", ")+".":"")+" "+S();
    T[rt.field]=add(T[rt.field],line); if(p>=60) strong.push(rt.label+", "+p+"% of observed periods"); });
  var topItems=Object.keys(items).sort(function(a,b){ return items[b]-items[a]; }).slice(0,3);
  if(strong.length||topItems.length) T.a_strengths=add(T.a_strengths,(strong.length?"Areas adults saw most often: "+strong.join("; ")+".":"")+(topItems.length?(strong.length?" ":"")+"What adults ticked most: "+topItems.map(function(i){ return OBS[i][0]+" ("+items[i]+")"; }).join(", ")+".":"")+" "+S("ticked items"));
  if(items.r_tool) T.e_supports=add(T.e_supports,"Adults saw them use a support to get through a rough moment "+items.r_tool+" time"+(items.r_tool===1?"":"s")+". "+S("ticked items"));
  if(items.e_asked||items.e_own) T.e_indep=add(T.e_indep,[items.e_own?"Got started and kept working ("+items.e_own+")":"",items.e_asked?"asked for help when they needed it ("+items.e_asked+")":""].filter(Boolean).join("; ")+", as ticked by adults. "+S("ticked items"));
  var byD={}; rows.forEach(function(r){ var k=0,g=0; ["engaged","regulated","usedStrategy","connected"].forEach(function(f){ if(Object.prototype.hasOwnProperty.call(r,f)){ k++; if(r[f]===true||String(r[f]).toLowerCase()==="true") g++; } }); if(k&&okDay(day(r))) (byD[day(r)]=byD[day(r)]||[]).push(100*g/k); });
  var ds=Object.keys(byD).sort(); if(ds.length>=2) C.push({id:"adult",field:"e_particip_t",caption:"Adult observations · share of the four areas seen · "+n+" observations · "+fmtRange(ds[0],ds[ds.length-1]),min:0,max:100,pts:ds.map(function(d){ return {d:d,v:Math.round(mean(byD[d]))}; })});
}

function reflection(input,T,C){ var rows=byDate((input.reflect||[]).filter(function(r){ return r&&(num(r.normComposite)!=null||num(r.normA)!=null); })); if(!rows.length) return;
  var comp=function(r){ var c=num(r.normComposite); return c!=null?Math.round(c):Math.round(((num(r.normA)||0)+(num(r.normB)||0)+(num(r.normC)||0))/3); };
  var tier=function(r){ if(r.tier==="High Risk") return 3; if(r.tier==="Some Risk") return 2; if(r.tier==="Low Risk") return 1; var c=comp(r); return c<50?3:c<75?2:1; };
  var last=rows[rows.length-1], first=rows[0], nm=function(r){ return (r.window?r.window+" ":"")+"("+fmtD(day(r))+")"; };
  var doms=["A","B","C"].filter(function(k){ return num(last["norm"+k])!=null; }).map(function(k){ return {k:k,v:Math.round(num(last["norm"+k]))}; }).sort(function(a,b){ return b.v-a.v; });
  var s="Self-reflection, eighteen questions: latest "+nm(last)+" "+comp(last)+" of 100"+(rows.length>1?", "+(comp(last)>=comp(first)?"up from ":"down from ")+comp(first)+" "+nm(first):"")+"; MTSS Tier "+tier(last)+" from this reflection.";
  if(doms.length>1) s+=" Highest area: "+REFL[doms[0].k]+" ("+doms[0].v+"). Most room to grow: "+REFL[doms[doms.length-1].k]+" ("+doms[doms.length-1].v+").";
  T.e_sel=add(T.e_sel,s+" "+src("MTSS self-reflection",rows.length,["reflection","reflections"],rows));
  if(doms.length) T.a_strengths=add(T.a_strengths,"On their own self-reflection, their highest area is "+REFL[doms[0].k]+" ("+doms[0].v+" of 100). "+src("MTSS self-reflection",1,["reflection","reflections"],[last]));
  if(rows.length>=2) C.push({id:"reflect",field:"e_sel",caption:"MTSS self-reflection · score of 100 · "+rows.length+" reflections · "+fmtRange(day(first),day(last)),min:0,max:100,pts:rows.map(function(r){ return {d:day(r),v:comp(r)}; })});
}

function voice(input,T,field){ var v=input.voice; if(!v) return; var q=[];
  if(v.soma&&String(v.soma).trim()) q.push({t:v.soma,d:String(v.somaAt||"").slice(0,10)});
  (v.entries||[]).forEach(function(e){ if(e&&e.st!=="private"&&e.text&&String(e.text).trim()) q.push({t:e.text,d:String(e.day||e.ts||"").slice(0,10)}); });
  q.slice(0,4).forEach(function(x){ T[field]=add(T[field],"In their own words: “"+clean(x.t).slice(0,240)+"” (My Voice"+(okDay(x.d)?" · "+fmtD(x.d):"")+")"); }); }

function goals(input,T,C,acad){ var gs=(input.goals||[]).filter(function(x){ return x&&x.g&&!x.g.archived; });
  gs.forEach(function(x){ var g=x.g, pts=(x.pts||[]).filter(function(p){ return okDay(String(p.date).slice(0,10))&&num(p.value)!=null; }).sort(function(a,b){ return a.date<b.date?-1:1; });
    if(!pts.length) return; var b=num(g.baseline&&g.baseline.value), t=num(g.target&&g.target.value), last=num(pts[pts.length-1].value);
    var way=(b!=null&&t!=null&&t!==b)?Math.round(100*(last-b)/(t-b)):null;
    T.goals_data=add(T.goals_data,"Goal “"+clean(g.title)+"”: "+pts.length+" data point"+(pts.length===1?"":"s")+". "+(b!=null?"Baseline "+b+", ":"")+"latest "+last+(t!=null?", target "+t:"")+(way!=null?" — "+(way>=100?"at or past the target":way+"% of the way from baseline to target"):"")+". (Brick by brick · "+pts.length+" point"+(pts.length===1?"":"s")+" · "+fmtRange(String(pts[0].date).slice(0,10),String(pts[pts.length-1].date).slice(0,10))+")"); });
  if(!gs.length&&acad.suggest.length) T.goals_data=add(T.goals_data,"Suggestions from the data, not goals — measurable skills with room to grow:\n"+acad.suggest.map(function(s){ return "- "+s; }).join("\n"));
}

function add(a,b){ return a?a+"\n"+b:b; }

/* ── the whole draft for one student ── */
function build(input){ input=input||{}; var T={}, C=[];
  var names={checkin:"Daily check-ins",exit:"Exit slips","weekly:mon":"Monday slips","weekly:mid":"Midweek slips","weekly:fri":"Friday slips","slip-test":"Before-a-test slips","slip-endclass":"End-of-class slips","slip-posttest":"After-a-test slips","slip-repair":"Reset-and-repair slips","slip-goal":"Goal-check slips","slip-team":"Group-work slips","slip-unit":"End-of-unit slips"};
  var acad=academics(input,T,C);
  slipsAndCheckins(input,T,C,names);
  adults(input,T,C);
  reflection(input,T,C);
  voice(input,T,(input.fields&&input.fields.indexOf("a_strengths")<0)?"e_sel":"a_strengths");
  goals(input,T,C,acad);
  if(input.pm&&(input.pm.int||input.pm.goal)){ var pm=input.pm; T.d_other=add(T.d_other,"MTSS plan on file: "+[pm.int?"intervention “"+clean(pm.int)+"”":"",pm.start?"started "+clean(pm.start):"",pm.goal?"goal “"+clean(pm.goal)+"”":"",pm.review?"review "+clean(pm.review):""].filter(Boolean).join(", ")+". (MTSS Report · plan)"); }
  if(acad.impact.length) T.g_impact="Where the classroom data shows support helps most:\n"+acad.impact.map(function(s){ return "- "+s; }).join("\n");
  var dl=acad.dataList.slice();
  if((input.adult||[]).length) dl.push("Adult observations: "+input.adult.length+" "+src("Adult observations",input.adult.length,["observation","observations"],input.adult));
  var ck=routeRows({src:"checkin"},input); if(ck.length) dl.push("Daily check-ins: "+ck.length+" "+src("Daily check-ins",ck.length,["check-in","check-ins"],ck));
  if((input.slips||[]).length) dl.push("Slips: "+input.slips.length+" "+src("Slips",input.slips.length,["slip","slips"],input.slips));
  if((input.reflect||[]).length) dl.push("Self-reflections: "+input.reflect.length+" "+src("MTSS self-reflection",input.reflect.length,["reflection","reflections"],input.reflect));
  if(dl.length) T.f_data="Classroom data on this device (new since the last meeting is for the team to confirm):\n"+dl.map(function(s){ return "- "+s; }).join("\n");
  /* charts land in the section of their field */
  C.forEach(function(c){ if(!c.sec) c.sec=secOf(c.field); });
  if(input.fields){ Object.keys(T).forEach(function(k){ if(input.fields.indexOf(k)<0) delete T[k]; }); C=C.filter(function(c){ return input.fields.indexOf(c.field)>=0; }); }
  return {texts:T,charts:C};
}
function secOf(field){ var s=""; Object.keys(FIELDS).forEach(function(k){ if(FIELDS[k].indexOf(field)>=0) s=k; }); return s; }
function fieldsFor(sectionIds){ var out=[]; (sectionIds||[]).forEach(function(s){ (FIELDS[s]||[]).forEach(function(f){ out.push(f); }); }); return out; }

/* ── the two layers. doc.eng[k] = {text, at, prev, base}; doc.own[k] = true once the teacher edits it. ── */
function apply(doc,texts,keys,today){ doc.fields=doc.fields||{}; doc.eng=doc.eng||{}; doc.own=doc.own||{}; var changed=false;
  if(!doc.engV){ keys.forEach(function(k){ if(String(doc.fields[k]==null?"":doc.fields[k]).trim()) doc.own[k]=true; }); doc.engV=1; changed=true; }
  keys.forEach(function(k){ var nt=texts[k]||"", e=doc.eng[k]||(doc.eng[k]={text:"",at:""});
    if(e.text!==nt){ e.prev=e.text; e.text=nt; e.at=today; changed=true; }
    if(!doc.own[k]&&String(doc.fields[k]==null?"":doc.fields[k])!==nt){ doc.fields[k]=nt; changed=true; } });
  return changed; }
/* the teacher typed: the field is theirs the moment it differs from what the engine wrote */
function noteEdit(doc,k,value){ doc.eng=doc.eng||{}; doc.own=doc.own||{}; if(doc.own[k]) return false; var e=doc.eng[k]||{text:""};
  if(value===e.text||(e.prev!=null&&value===e.prev)) return false; doc.own[k]=true; e.base=e.text; doc.eng[k]=e; return true; }
function hasNews(doc,k){ var e=(doc.eng||{})[k]; return !!((doc.own||{})[k]&&e&&e.text&&e.text!==(e.base==null?"":e.base)); }
function restore(doc,k){ doc.own=doc.own||{}; delete doc.own[k]; var e=(doc.eng||{})[k]; doc.fields=doc.fields||{}; doc.fields[k]=e?e.text:""; if(e) delete e.base; }

/* the document: engine-only fields print as sub-headings inside the closest existing section */
function augment(secs,doc){ var f=doc.fields||{}, has=function(k){ return f[k]!=null&&String(f[k]).trim(); }, v=function(k){ return String(f[k]).trim(); };
  var out=secs.map(function(s){ return {id:s.id,title:s.title,text:s.text}; }), find=function(id){ for(var i=0;i<out.length;i++) if(out[i].id===id) return out[i]; return null; };
  var insertAfter=function(ids,sec){ for(var j=out.length-1;j>=0;j--) if(ids.indexOf(out[j].id)>=0){ out.splice(j+1,0,sec); return sec; } out.push(sec); return sec; };
  if(has("goals_data")&&doc.type!=="initial"){ var g=find("goals")||insertAfter(["svc","purpose"],{id:"goals",title:"PROGRESS TOWARD CURRENT IEP GOALS",text:""}); g.text=(g.text?g.text+"\n":"")+"Classroom data related to goals:\n"+v("goals_data"); }
  var subjAdd=["ela","math"].filter(function(px){ return has("d_"+px+"_data"); });
  if(subjAdd.length||has("d_selfview")){ var p=find("pl")||insertAfter(["str","strengths","parent","health","goals","svc","purpose"],{id:"pl",title:"STUDENT'S PRESENT LEVEL OF ACADEMIC ACHIEVEMENT",text:""}); var L=p.text?p.text.split("\n"):[];
    subjAdd.forEach(function(px){ var head=px==="ela"?"ELA":"Math", i=L.indexOf(head), block=("Classroom data: "+v("d_"+px+"_data")).split("\n");
      if(i>=0){ var j=i+1; while(j<L.length&&/^(Benchmarking|MTSS):/.test(L[j])) j++; L.splice.apply(L,[j,0].concat(block)); }
      else { var at=px==="ela"?(L.indexOf("Math")>=0?L.indexOf("Math"):firstOther(L)):firstOther(L); L.splice.apply(L,[at,0,head].concat(block)); } });
    if(has("d_selfview")){ var o=firstOther(L); L.splice.apply(L,[o,0,"Student self-assessment (from slips):"].concat(v("d_selfview").split("\n"))); }
    p.text=L.join("\n"); }
  var fx=[]; if(has("e_sel")) fx.push("Social-emotional (check-ins, slips, self-reflection):\n"+v("e_sel")); if(has("e_indep")) fx.push("Independence and self-advocacy:\n"+v("e_indep"));
  if(fx.length){ var fn=find("func")||insertAfter(["pl"],{id:"func",title:"STUDENT'S PRESENT LEVELS OF FUNCTIONAL/DEVELOPMENTAL PERFORMANCE",text:""}); fn.text=(fn.text?fn.text+"\n":"")+fx.join("\n"); }
  return out; }
function firstOther(L){ for(var i=0;i<L.length;i++) if(/^(EL services|Other areas)/.test(L[i])) return i; return L.length; }

var API={ROUTES:ROUTES,AREAS:AREAS,FIELDS:FIELDS,OBS:OBS,build:build,apply:apply,noteEdit:noteEdit,hasNews:hasNews,restore:restore,augment:augment,fieldsFor:fieldsFor,secOf:secOf,
  _:{fmtD:fmtD,fmtRange:fmtRange,trend:trend,tally:tally,parseStrands:parseStrands,strandTable:strandTable,strongWeak:strongWeak,scoreStats:scoreStats,subjectOf:subjectOf,kindOf:kindOf,wscale:wscale,fold:fold}};
if(typeof module!=="undefined"&&module.exports) module.exports=API; else root.AOG_IEPFILL=API;
})(typeof window!=="undefined"?window:this);
