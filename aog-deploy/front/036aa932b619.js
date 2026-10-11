
(function(){
  "use strict";
  var KEY="aog.iep.v1";
  function DTx(en,es){ try{ if(typeof dashLang!=="undefined") return dashLang==="es"?es:en; }catch(e){} try{ if(typeof lang!=="undefined") return lang==="es"?es:en; }catch(e2){} return en; }
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
  function attrJs(s){ return "decodeURIComponent('"+encodeURIComponent(String(s==null?"":s)).replace(/'/g,"%27")+"')"; }

  /* ==== AOG-IEP-PURE-START (extracted verbatim by the node test harness — keep dependency-free) ==== */
  function aogIepDayNum(d){ var p=String(d||"").split("-"); if(p.length<3) return 0; return Math.round(Date.UTC(+p[0],+p[1]-1,+p[2])/86400000); }
  /* A date this app can actually chart. Chrome's <input type="date"> accepts a
     FIVE-digit year — one stray keystroke turns 2026 into 20026 — and fdate's
     String(y).slice(2) rendered that as a perfectly plausible "026". So the typo
     stayed invisible while it stretched the aimline eighteen thousand years and
     squashed every real data point onto the left edge of the chart. Found on a
     LIVE goal 2026-08-29. Anything that positions or labels a date checks here first. */
  function aogIepDateSane(d){ var s=String(d||""); if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s)) return false;
    var y=+s.slice(0,4), m=+s.slice(5,7), dd=+s.slice(8,10);
    return y>=1900 && y<=2199 && m>=1 && m<=12 && dd>=1 && dd<=31; }
  function aogIepDatesBad(g){ return !!g && (!aogIepDateSane(g.baseline&&g.baseline.date) || !aogIepDateSane(g.target&&g.target.date)); }
  function aogIepTrialsPct(v,t){ v=+v; t=+t; if(!isFinite(v)||!isFinite(t)||t<=0) return 0; return Math.round(v/t*10000)/100; }
  function aogIepSlope(pts){ var n=pts.length; if(n<2) return 0; var sx=0,sy=0,sxy=0,sxx=0,i,p; for(i=0;i<n;i++){ p=pts[i]; sx+=p.x; sy+=p.y; sxy+=p.x*p.y; sxx+=p.x*p.x; } var den=n*sxx-sx*sx; if(!den) return 0; return (n*sxy-sx*sy)/den; }
  function aogIepAimAt(g,day){ var b=aogIepDayNum(g.baseline.date), t=aogIepDayNum(g.target.date), bv=+g.baseline.value, tv=+g.target.value; if(t<=b) return tv; if(day<=b) return bv; if(day>=t) return tv; return bv+(tv-bv)*(day-b)/(t-b); }
  function aogIepEffVal(g,p){ return (g.measure==="trials"||g.measure==="steps")?aogIepTrialsPct(p.value,p.total):+p.value; }
  /* Words correct per minute: value = words correct (what charts), total = errors. words attempted = value + errors. */
  function aogIepWcpmCalc(words,errs){ words=+words; errs=(errs===""||errs==null)?0:+errs; if(!isFinite(words)||words<0) return null; if(!isFinite(errs)||errs<0) return null; if(errs>words) return null; var corr=words-errs; return {wcpm:corr,errors:errs,words:words,acc:(words>0?Math.round(corr/words*1000)/10:null)}; }
  function aogIepWcpmAcc(p){ if(!p||p.total==null||!isFinite(+p.total)) return null; var corr=+p.value, w=corr+(+p.total); if(!isFinite(corr)||!(w>0)) return null; return Math.round(corr/w*1000)/10; }
  function aogIepAimDegenerate(g){ if(!g||!g.baseline||!g.target) return true;
    if(!aogIepDateSane(g.baseline.date)||!aogIepDateSane(g.target.date)) return true;
    var bv=+g.baseline.value, tv=+g.target.value; if(!isFinite(bv)||!isFinite(tv)) return true; return bv===tv; }
  /* ⚠ HISTORICAL. This is the ONE-POINT verdict. It drove the green chip and
     the "n on track" header until 2026-08-27, sitting directly above two far
     more conservative rules that often disagreed with it. Nothing in the UI
     reads it any more — aogIepSignal does — and nothing should start again.
     It is kept because the harness pins its arithmetic and because the four
     -point rule is built on the same comparison. */
  function aogIepOnTrack(g,pts){ if(aogIepAimDegenerate(g)) return null; if(!pts||!pts.length) return null; var last=pts[pts.length-1]; var aim=aogIepAimAt(g,aogIepDayNum(last.date)); var v=aogIepEffVal(g,last); return g.lowerBetter?(v<=aim+1e-9):(v>=aim-1e-9); }
  /* THE DECISION RULES. A progress chart is only worth drawing if it can end a
     meeting with a decision, and these are the two rules the field actually uses.
     Both are deliberately conservative: four consecutive points, or six for a
     trend, and neither says anything at all when the aimline is degenerate. */
  function aogIepFourPoint(g,pts){
    if(!g||!pts||pts.length<4||aogIepAimDegenerate(g)) return null;
    var last=pts.slice(-4), short=0, over=0;
    for(var i=0;i<4;i++){
      var aim=aogIepAimAt(g,aogIepDayNum(last[i].date)), v=aogIepEffVal(g,last[i]);
      if(!isFinite(v)) return null;
      if(g.lowerBetter?(v>aim):(v<aim)) short++; else over++;
    }
    if(short===4) return {k:"below",from:last[0].date,to:last[3].date};
    if(over===4)  return {k:"above",from:last[0].date,to:last[3].date};
    return null;
  }
  function aogIepTrendVsAim(g,pts){
    if(!g||!pts||pts.length<6||aogIepAimDegenerate(g)) return null;
    var b=aogIepDayNum(g.baseline.date), t=aogIepDayNum(g.target.date);
    if(t===b) return null;
    var x0=aogIepDayNum(pts[0].date);
    var xy=pts.map(function(p){ return {x:aogIepDayNum(p.date)-x0,y:aogIepEffVal(g,p)}; });
    var sl=aogIepSlope(xy);
    var aimSl=((+g.target.value)-(+g.baseline.value))/(t-b);
    var gain=g.lowerBetter?-sl:sl, need=g.lowerBetter?-aimSl:aimSl;
    if(!isFinite(gain)||!isFinite(need)) return null;
    return {k:(gain>=need?"steeper":"flatter"),slope:sl,aimSlope:aimSl};
  }
  /* THE PROGRESS SIGNAL. Four restrained states, and not one of them is read
     off a single data point — that was the old chip's mistake, and it sat
     directly above two genuinely conservative rules that disagreed with it.
     Only those rules are allowed to say "on track" or "needs attention";
     everything short of them says so plainly and waits.
       more      — no aimline to read against, or fewer than four points
       on        — four in a row above the aimline, or a trend at least as steep
       attention — four in a row below the aimline
       watch     — enough to look at, nothing the rules will commit to
     It is a signal, never a diagnosis, and the caller must print the word. */
  /* How long a goal may go unmeasured before the screens say so. 30 days was
     the only reading, and it is a month into a reporting window — too late to
     collect anything. 14 is early enough to still fix and long enough that an
     ordinary week off does not trip it. Jimmy's call, 2026-08-29. */
  var AOG_IEP_QUIET_DAYS=14;
  function aogIepSignal(g,pts,todayDay,staleDays,quietDays){
    var r={k:"more",why:"none",n:(pts&&pts.length)||0};
    /* ⚠ THE AGE READING RUNS BEFORE EVERY EARLY RETURN, and it used to run
       after all three. Two consequences, both shipped:
         · a goal with NO measurements returned on the line below and never
           reached it, so the one goal nobody had started was the one goal
           nothing could mark;
         · a goal with no usable aimline returned on the line after that, so a
           record nobody had touched in two months read as merely incomplete.
       Age is a fact about the record and does not depend on whether the rules
       can read it. `stale` keeps its exact meaning and its 30-day threshold —
       it is only computed sooner now. */
    quietDays=isFinite(quietDays)?quietDays:AOG_IEP_QUIET_DAYS;
    staleDays=isFinite(staleDays)?staleDays:30;
    if(!pts||!pts.length){ r.unstarted=true; }
    else if(isFinite(todayDay)){
      var lastD=aogIepDayNum(pts[pts.length-1].date);
      if(lastD&&todayDay>=lastD){
        var ageD=todayDay-lastD;
        if(ageD>=quietDays) r.quiet=ageD;
        if(ageD>staleDays)  r.stale=ageD;
      }
    }
    if(!g||aogIepAimDegenerate(g)){ r.why="noAim"; return r; }
    if(!pts||!pts.length){ r.why="none"; return r; }
    if(pts.length<4){ r.why="few"; return r; }
    var fp=aogIepFourPoint(g,pts);
    if(fp){ r.k=(fp.k==="below")?"attention":"on"; r.why=(fp.k==="below")?"fourBelow":"fourAbove"; r.from=fp.from; r.to=fp.to; }
    else{
      var tv=aogIepTrendVsAim(g,pts);
      if(tv&&tv.k==="steeper"){ r.k="on"; r.why="trendSteeper"; }
      else if(tv&&tv.k==="flatter"){ r.k="watch"; r.why="trendFlatter"; }
      else{ r.k="watch"; r.why="mixed"; }
    }
    /* A signal computed off a record nobody has added to in weeks is a signal
       about the past. Say how old it is rather than letting it read as current.
       ⚠ That reading now happens at the TOP of this function — see the note
       there — because it has to survive the early returns. */
    return r;
  }
  /* Which points the RULES are allowed to read. A point dated before the
     baseline is not evidence of movement from that baseline — the aimline does
     not exist yet on that date. It is still drawn and still exported; it is
     only kept out of the four-point and trend rules, and the card says so.
     Nothing is repaired, deleted or rewritten: see the standing rule. */
  function aogIepPeriodSplit(g,pts){
    var b=(g&&g.baseline&&g.baseline.date)?String(g.baseline.date):"";
    var t=(g&&g.target&&g.target.date)?String(g.target.date):"";
    var out={used:[],early:[],late:[],future:[]};
    (pts||[]).forEach(function(p){
      if(!p||!p.date) return;
      var d=String(p.date);
      if(b&&d<b){ out.early.push(p); return; }
      if(t&&d>t) out.late.push(p);
      out.used.push(p);
    });
    return out;
  }
  /* Is this date one a measurement could actually have been taken on? */
  function aogIepDateIssue(g,iso,todayIso){
    iso=String(iso||""); todayIso=String(todayIso||"");
    if(!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "bad";
    if(todayIso&&iso>todayIso) return "future";
    var b=(g&&g.baseline&&g.baseline.date)?String(g.baseline.date):"";
    var t=(g&&g.target&&g.target.date)?String(g.target.date):"";
    if(b&&iso<b) return "beforeBaseline";
    if(t&&iso>t) return "afterTarget";
    return null;
  }
  function aogIepArrow(slopePerDay,range){ if(!isFinite(slopePerDay)||!isFinite(range)||range<=0) return "→"; var chg=slopePerDay*14; if(Math.abs(chg)<=range*0.01) return "→"; return chg>0?"↑":"↓"; }
  /* Where a point's own label goes. below=true means "under the point unless
     that would put it on the date axis", and vice versa. Never leaves the plot. */
  function aogIepLblY(y,below,top,bottom){
    if(below) return (y+14<=bottom-2)?(y+14):(y-8);
    return (y-8>=top+9)?(y-8):(y+14);
  }
  /* Meeting readiness is a COUNT of what has been recorded — never a judgement
     about a child, and never a score. Three independent facts, each of which a
     teacher can check against the chart: how many goals were measured recently,
     how many hold too few points for the four-point rule to speak at all, and
     how many hold none. */
  function aogIepReadiness(goals,data,ids,todayDay,windowDays){
    windowDays=isFinite(windowDays)?windowDays:30;
    var r={total:0,recent:0,tooFew:0,noData:0,windowDays:windowDays};
    ids=ids||[];
    for(var i=0;i<ids.length;i++){
      var g=goals&&goals[ids[i]]; if(!g) continue;
      r.total++;
      var pts=(data&&data[ids[i]])||[];
      if(!pts.length){ r.noData++; continue; }
      if(pts.length<4) r.tooFew++;
      var last=null, j, d;
      for(j=0;j<pts.length;j++){ d=aogIepDayNum(pts[j].date); if(d&&(last===null||d>last)) last=d; }
      if(last!==null&&isFinite(todayDay)&&todayDay>=last&&(todayDay-last)<=windowDays) r.recent++;
    }
    return r;
  }
  /* THE REPORTING WINDOW, from one date the school actually has.
     ⚠ ONE DATE FOR THE CASELOAD, NOT ONE PER GOAL. Progress reports are due on
     a district calendar, not per child; a per-goal field would be the same
     date typed twenty-four times and twenty-four chances to mistype it.
     ⚠ AND IT NEVER GUESSES. With nothing set this returns set:false and every
     caller falls back to exactly the behavior that shipped before it. */
  function aogIepReportWindow(rep,todayDay){
    var out={set:false,due:"",dueDay:null,inDays:null,weeks:9,fromDay:null,windowDays:null};
    if(!rep||!rep.due) return out;
    var d=aogIepDayNum(String(rep.due));
    if(!d) return out;
    var w=parseInt(rep.weeks,10); if(!isFinite(w)||w<1||w>52) w=9;
    out.set=true; out.due=String(rep.due); out.dueDay=d; out.weeks=w;
    out.fromDay=d-(w*7);
    if(isFinite(todayDay)){
      out.inDays=d-todayDay;
      /* aogIepReadiness counts back from TODAY, so the window it is given is
         today minus the start of the period — never the period length, which
         would keep counting a measurement taken before the period began. */
      var span=todayDay-out.fromDay;
      out.windowDays=span>0?span:1;
    }
    return out;
  }
  function aogIepCsvCell(s){ s=String(s==null?"":s); return /[",\n\r]/.test(s)?("\""+s.replace(/"/g,"\"\"")+"\""):s; }
  /* One argument is the old contract and stays byte-identical. Pass a context
     and the file starts carrying its own identity — which used to survive only
     in the filename, and a filename is not a record. Nothing is altered on the
     way out: value and total are the stored numbers, score and aimline are the
     same arithmetic the chart already draws. */
  function aogIepCsv(rows,ctx){
    var i,r;
    if(!ctx){ var out="date,value,total,bench,note\r\n"; for(i=0;i<rows.length;i++){ r=rows[i]; out+=[aogIepCsvCell(r.date),aogIepCsvCell(r.value),aogIepCsvCell(r.total==null?"":r.total),aogIepCsvCell(r.bench==null?"":r.bench),aogIepCsvCell(r.note==null?"":r.note)].join(",")+"\r\n"; } return out; }
    ctx=ctx||{};
    var C=["student","goal","goal_area","measure","unit","lower_is_better","baseline_value","baseline_date","target_value","target_date","reporting_period","date","value","total","score","aimline","in_goal_period","benchmark","note","exported_on","source"];
    var o=C.join(",")+"\r\n";
    for(i=0;i<rows.length;i++){
      r=rows[i]||{};
      o+=[aogIepCsvCell(ctx.student),aogIepCsvCell(ctx.goal),aogIepCsvCell(ctx.area),aogIepCsvCell(ctx.measure),aogIepCsvCell(ctx.unit),
          aogIepCsvCell(ctx.lowerBetter?"yes":"no"),aogIepCsvCell(ctx.baselineValue),aogIepCsvCell(ctx.baselineDate),
          aogIepCsvCell(ctx.targetValue),aogIepCsvCell(ctx.targetDate),aogIepCsvCell(ctx.period),
          aogIepCsvCell(r.date),aogIepCsvCell(r.value),aogIepCsvCell(r.total==null?"":r.total),
          aogIepCsvCell(r.score==null?"":r.score),aogIepCsvCell(r.aim==null?"":r.aim),
          aogIepCsvCell(r.inPeriod==null?"":(r.inPeriod?"yes":"no")),
          aogIepCsvCell(r.bench==null?"":r.bench),aogIepCsvCell(r.note==null?"":r.note),
          aogIepCsvCell(ctx.exported),aogIepCsvCell(ctx.source||"Architecture of Grace · IEP Progress Monitor")].join(",")+"\r\n";
    }
    return o;
  }
  /* ==== AOG-IEP-PURE-END ==== */

  /* ==== AOG-IEP-ELITE-PURE-START (dependency-free — extracted verbatim by AoG-IepElite.harness.mjs) ==== */
  function aogIepWizPickMeasure(d,m){ if(!d) return d; d.measure=m; if((m==="latency"||m==="interval")&&!d.lowerTouched) d.lower=true; return d; }
  function aogIepBenchLetters(pts){ var seen={},out=[]; (pts||[]).forEach(function(p){ var b=(p&&p.bench)?String(p.bench):""; if(b&&!seen[b]){ seen[b]=1; out.push(b); } }); out.sort(); return out; }
  function aogIepBenchSplit(pts,sel){ pts=(pts||[]).slice(); if(!sel||sel==="ALL") return pts; return pts.filter(function(p){ return p&&String(p.bench||"")===sel; }); }
  var AOG_STD_CASEL=[
    {src:"casel",code:"CASEL SA",label:"Self-Awareness — understanding one's own emotions, values, and strengths"},
    {src:"casel",code:"CASEL SM",label:"Self-Management — regulating emotions and behavior to reach goals"},
    {src:"casel",code:"CASEL SoA",label:"Social Awareness — taking others' perspectives and empathizing"},
    {src:"casel",code:"CASEL RS",label:"Relationship Skills — communicating, cooperating, resolving conflict"},
    {src:"casel",code:"CASEL RDM",label:"Responsible Decision-Making — making caring, constructive choices"}
  ];
  var AOG_STD_CCSS=[
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.R.1",label:"Read closely and cite evidence (RL/RI)"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.R.2",label:"Determine central ideas and themes (RL/RI)"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.R.3",label:"Analyze how ideas and events develop (RL/RI)"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.R.4",label:"Interpret words and phrases in text (RL/RI)"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.R.5",label:"Analyze the structure of texts (RL/RI)"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.R.6",label:"Assess point of view and purpose (RL/RI)"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.R.7",label:"Integrate content across diverse media (RL/RI)"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.R.8",label:"Evaluate arguments and specific claims (RL/RI)"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.R.9",label:"Compare how multiple texts address themes (RL/RI)"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.R.10",label:"Read complex texts independently and proficiently"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.W.1",label:"Write arguments with clear reasoning"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.W.2",label:"Write informative and explanatory texts"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.W.3",label:"Write narratives with structured sequences"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.W.4",label:"Produce clear, well-organized writing"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.W.5",label:"Strengthen writing by planning and revising"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.W.6",label:"Use technology to produce and publish writing"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.W.7",label:"Conduct short and sustained research"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.W.8",label:"Gather, assess, and cite sources"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.W.9",label:"Draw evidence from texts for analysis"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.W.10",label:"Write routinely across tasks and timeframes"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.SL.1",label:"Participate in collaborative conversations"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.SL.2",label:"Integrate and evaluate presented information"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.SL.3",label:"Evaluate a speaker's reasoning and evidence"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.SL.4",label:"Present ideas clearly and logically"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.SL.5",label:"Use digital media in presentations"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.SL.6",label:"Adapt speech to context and task"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.L.1",label:"Use standard English grammar and usage"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.L.2",label:"Use capitalization, punctuation, and spelling"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.L.3",label:"Apply language knowledge in context"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.L.4",label:"Determine meaning of unknown words"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.L.5",label:"Understand figurative language and nuance"},
    {src:"ccss",code:"CCSS.ELA-LITERACY.CCRA.L.6",label:"Acquire academic and domain-specific vocabulary"},
    {src:"ccss",code:"RF.K.1",label:"Print concepts: how books work"},
    {src:"ccss",code:"RF.K.2",label:"Phonological awareness: sounds in words"},
    {src:"ccss",code:"RF.K.3",label:"Phonics: letter-sound correspondences"},
    {src:"ccss",code:"RF.K.4",label:"Read emergent texts with purpose"},
    {src:"ccss",code:"RF.1.2",label:"Phonological awareness: blend and segment"},
    {src:"ccss",code:"RF.1.3",label:"Phonics: decode one-syllable words"},
    {src:"ccss",code:"RF.1.4",label:"Fluency to support comprehension (grade 1)"},
    {src:"ccss",code:"RF.2.3",label:"Phonics: decode multisyllable words"},
    {src:"ccss",code:"RF.2.4",label:"Fluency to support comprehension (grade 2)"},
    {src:"ccss",code:"RF.3.3",label:"Phonics and word-analysis skills"},
    {src:"ccss",code:"RF.3.4",label:"Fluency to support comprehension (grade 3)"},
    {src:"ccss",code:"RF.4.3",label:"Word analysis: morphology and syllabication"},
    {src:"ccss",code:"RF.4.4",label:"Fluency to support comprehension (grade 4)"},
    {src:"ccss",code:"RF.5.4",label:"Fluency to support comprehension (grade 5)"},
    {src:"ccss",code:"K.CC",label:"Counting & Cardinality: count and compare numbers"},
    {src:"ccss",code:"K.OA",label:"Add and subtract within 10"},
    {src:"ccss",code:"K.G",label:"Identify and describe shapes"},
    {src:"ccss",code:"1.OA",label:"Add and subtract within 20"},
    {src:"ccss",code:"1.NBT",label:"Place value; add within 100"},
    {src:"ccss",code:"1.MD",label:"Measure lengths; tell time"},
    {src:"ccss",code:"2.OA",label:"Fluency within 20; word problems"},
    {src:"ccss",code:"2.NBT",label:"Place value to 1000; add and subtract"},
    {src:"ccss",code:"2.MD",label:"Measure length; time and money"},
    {src:"ccss",code:"3.OA",label:"Operations & Algebraic Thinking: multiply/divide within 100"},
    {src:"ccss",code:"3.NBT",label:"Round numbers; add and subtract within 1000"},
    {src:"ccss",code:"3.NF",label:"Fractions as numbers on the number line"},
    {src:"ccss",code:"3.MD",label:"Area, perimeter, time, volume, mass"},
    {src:"ccss",code:"3.G",label:"Shapes and their attributes"},
    {src:"ccss",code:"4.OA",label:"Multi-step problems; factors and multiples"},
    {src:"ccss",code:"4.NBT",label:"Multi-digit arithmetic with place value"},
    {src:"ccss",code:"4.NF",label:"Fraction equivalence and operations"},
    {src:"ccss",code:"4.MD",label:"Convert measurements; angles"},
    {src:"ccss",code:"5.NBT",label:"Decimals to hundredths; powers of ten"},
    {src:"ccss",code:"5.NF",label:"Add, subtract, multiply, divide fractions"},
    {src:"ccss",code:"5.MD",label:"Volume and measurement conversion"},
    {src:"ccss",code:"6.RP",label:"Ratios & Proportional Relationships: unit rates"},
    {src:"ccss",code:"6.NS",label:"Divide fractions; rational numbers"},
    {src:"ccss",code:"6.EE",label:"Expressions & Equations: one-variable equations"},
    {src:"ccss",code:"6.SP",label:"Statistics: distributions and variability"},
    {src:"ccss",code:"7.RP",label:"Proportional relationships and percents"},
    {src:"ccss",code:"7.NS",label:"Operations with rational numbers"},
    {src:"ccss",code:"7.EE",label:"Multi-step equations and inequalities"},
    {src:"ccss",code:"7.G",label:"Scale drawings; area and volume"},
    {src:"ccss",code:"8.EE",label:"Linear equations, systems, exponents"},
    {src:"ccss",code:"8.F",label:"Functions: define, evaluate, compare"},
    {src:"ccss",code:"8.G",label:"Transformations; Pythagorean theorem"},
    {src:"ccss",code:"8.SP",label:"Bivariate data and scatter plots"},
    {src:"ccss",code:"HSN",label:"Number & Quantity: units and quantities"},
    {src:"ccss",code:"HSA",label:"Algebra: structure, equations, reasoning"},
    {src:"ccss",code:"HSF",label:"Functions: interpret, build, model"},
    {src:"ccss",code:"HSG",label:"Geometry: congruence, similarity, proof"},
    {src:"ccss",code:"HSS",label:"Statistics & Probability: data and inference"},
    {src:"ccss",code:"N-RN",label:"HS: The Real Number System"},{src:"ccss",code:"N-Q",label:"HS: Quantities and units in modeling"},
    {src:"ccss",code:"A-SSE",label:"HS Algebra: Seeing structure in expressions"},{src:"ccss",code:"A-APR",label:"HS Algebra: Polynomials and rational expressions"},{src:"ccss",code:"A-CED",label:"HS Algebra: Creating equations"},{src:"ccss",code:"A-REI",label:"HS Algebra: Reasoning with equations & inequalities"},
    {src:"ccss",code:"F-IF",label:"HS Functions: Interpreting functions"},{src:"ccss",code:"F-BF",label:"HS Functions: Building functions"},{src:"ccss",code:"F-LE",label:"HS Functions: Linear & exponential models"},
    {src:"ccss",code:"G-CO",label:"HS Geometry: Congruence"},{src:"ccss",code:"G-SRT",label:"HS Geometry: Similarity & right triangles"},{src:"ccss",code:"G-GPE",label:"HS Geometry: Coordinates and properties"},{src:"ccss",code:"G-MG",label:"HS Geometry: Modeling with geometry"},
    {src:"ccss",code:"S-ID",label:"HS Statistics: Interpreting data"},{src:"ccss",code:"S-IC",label:"HS Statistics: Inferences & conclusions"},{src:"ccss",code:"S-CP",label:"HS Statistics: Conditional probability"}
  ];
  function aogIepStdListOpen(q,src){ return String(q||"").trim().length>=2||!!src; }
  function aogIepStdFilter(list,q,src){ q=String(q||"").trim().toLowerCase(); return (list||[]).filter(function(e){ if(!e) return false; if(src&&e.src!==src) return false; if(!q) return true; return ((e.code||"")+" "+(e.label||"")).toLowerCase().indexOf(q)>=0; }); }
  function aogIepStdAppend(existing,picks){ var add=(picks||[]).map(function(p){ return p.code+" \u2014 "+p.label; }).join("; "); if(!add) return String(existing||""); var cur=String(existing||"").trim().replace(/[;,]\s*$/,""); return cur?(cur+"; "+add):add; }
  function aogIepStdFromCrosswalk(rows){ var seen={},out=[]; (rows||[]).forEach(function(r){ if(!r||!r.b||!r.theme) return; var k=r.b+"|"+r.theme; if(seen[k]) return; seen[k]=1; out.push({src:"ilsel",code:"IL SEL \u00b7 "+r.b,label:String(r.theme)}); }); return out; }
  /* A trials or task-analysis goal saved before step 3 asked for TWO numbers
     holds a bare baseline and target that the chart can only read as percents.
     "4 out of 5 opportunities" entered as 1 and 5 draws a flat line at 1% → 5%.
     Nothing can repair it in code — 1 and 5 might honestly mean 1% and 5% — so
     the card says so and sends the teacher to Edit. Jimmy caught this on a real
     Grade 7 writing goal, 2026-08-26. */
  function aogIepXofYUnset(g){
    if(!g) return false;
    if(g.measure!=="trials"&&g.measure!=="steps") return false;
    var x=g.xofy;
    if(x&&x.bd!=null&&x.td!=null&&+x.bd>0&&+x.td>0) return false;
    return true;
  }
  /* ======================================================================
     THE GOAL WRITER. What every serious IEP platform does and this did not:
     bind the criterion in the SENTENCE to the criterion in the DATA, build the
     benchmark ladder from the aimline instead of leaving three blank boxes, and
     tell a teacher what the sentence is missing.

     Standing rule, inherited from the x-of-y repair: these functions SUGGEST
     and they WARN. Not one of them rewrites a teacher's sentence or touches a
     stored number on its own — every change is a button a person presses.
     ====================================================================== */
  var AOG_GOAL_MONTHS_EN=["January","February","March","April","May","June","July","August","September","October","November","December"];
  var AOG_GOAL_MONTHS_ES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  function aogIepMonthYear(ds,es){
    var p=String(ds==null?"":ds).split("-");
    if(p.length<3) return String(ds==null?"":ds);
    var i=(+p[1])-1; if(!(i>=0&&i<12)) return String(ds);
    return es?(AOG_GOAL_MONTHS_ES[i]+" de "+p[0]):(AOG_GOAL_MONTHS_EN[i]+" "+p[0]);
  }
  function aogIepDateAtFrac(bdate,tdate,f){
    var b=aogIepDayNum(bdate), t=aogIepDayNum(tdate);
    if(!b||!t||t<=b) return "";
    var d=new Date(Math.round(b+(t-b)*f)*86400000);
    var z=function(n){ return (n<10?"0":"")+n; };
    return d.getUTCFullYear()+"-"+z(d.getUTCMonth()+1)+"-"+z(d.getUTCDate());
  }
  function aogIepGoalHasBlank(t){ return /__/.test(String(t==null?"":t)); }
  function aogIepGoalNum(v){ if(v==null||v==="") return ""; var n=+v; if(!isFinite(n)) return ""; return String(Math.round(n*10)/10); }
  function aogIepGoalIsXY(m){ return m==="trials"||m==="steps"; }
  /* Put the teacher's own numbers into the bank sentence's blanks. An x-of-y
     goal fills "__ of __" and stops — a leftover "__%" on such a goal means
     something we do not know, so it is left for the person to fill. */
  function aogIepGoalFill(title,o){
    title=String(title==null?"":title); o=o||{};
    var xy=aogIepGoalIsXY(o.measure);
    var xn=(o.xn==null?"":String(o.xn).trim()), xd=(o.xd==null?"":String(o.xd).trim());
    var num=aogIepGoalNum(o.value);
    var out=title;
    if(xy){
      if(xn!==""&&xd!=="") out=out.replace(/__\s*(?:out of|of)\s*__/i,xn+" of "+xd);
      return out;
    }
    if(num==="") return out;
    if(/__\s*%/.test(out)) return out.replace(/__\s*%/,num+"%");
    /* Only when the sentence holds exactly ONE blank is it unambiguously the
       criterion. Two or more and we do not know which, so we fill none. */
    if((out.match(/__/g)||[]).length===1) return out.replace(/__/,num);
    return out;
  }
  /* What the finished sentence claims, when it claims it unambiguously. Read
     only to WARN — never to write a denominator back into stored data. */
  /* strict by default: a half-written sentence claims nothing, so the mismatch
     warning never nags mid-draft. Lenient is for the ladder, which only needs
     to find the criterion it is about to swap — an unrelated structural blank
     elsewhere in the sentence is none of its business. */
  function aogIepGoalStated(title,lenient){
    var t=String(title==null?"":title);
    if(!lenient&&aogIepGoalHasBlank(t)) return null;
    var r=t.match(/(\d+(?:\.\d+)?)\s*(?:out of|of)\s*(\d+(?:\.\d+)?)/i);
    if(r){ var n=+r[1], d=+r[2]; if(d>0&&n<=d) return {kind:"ratio",n:n,d:d,pct:Math.round(n/d*1000)/10,raw:r[0]}; }
    var p=t.match(/(\d+(?:\.\d+)?)\s*%/);
    if(p) return {kind:"percent",pct:+p[1],raw:p[0]};
    return null;
  }
  /* The Ja'Coury catch, at writing time: the sentence says 4 out of 5 and the
     target says 5. Only fires where the sentence and the chart axis are the
     same quantity, and only when the gap is real. */
  function aogIepGoalMismatch(title,o){
    o=o||{};
    var m=o.measure;
    if(m!=="percent"&&!aogIepGoalIsXY(m)) return null;
    var s=aogIepGoalStated(title); if(!s) return null;
    var tgt=(o.value==null||o.value==="")?null:+o.value;
    if(tgt==null||!isFinite(tgt)) return null;
    if(Math.abs(s.pct-tgt)<=0.5) return null;
    return {claim:s.pct,target:Math.round(tgt*10)/10,kind:s.kind,n:s.n,d:s.d,raw:s.raw};
  }
  /* Swap the criterion in a finished sentence for a different one — how each
     rung of the benchmark ladder gets written in the goal's own words. */
  function aogIepGoalReCriterion(title,pct,measure){
    title=String(title==null?"":title);
    var s=aogIepGoalStated(title,true); if(!s) return null;
    if(s.kind==="ratio"){
      var n=Math.round(pct/100*s.d);
      if(n<0) n=0; if(n>s.d) n=s.d;
      return title.replace(s.raw,n+" of "+s.d);
    }
    if(measure==="percent"||s.kind==="percent") return title.replace(s.raw,(Math.round(pct*10)/10)+"%");
    return null;
  }
  function aogIepLadderRound(g,v){ return (g&&g.measure==="rating")?(Math.round(v*10)/10):Math.round(v); }
  function aogIepLadderUnit(g){
    var m=g&&g.measure;
    if(m==="percent"||m==="trials"||m==="steps") return "%";
    if(m==="duration") return " min";
    if(m==="latency") return " sec";
    if(m==="rating") return "/5";
    return (g&&g.unit)?(" "+g.unit):"";
  }
  /* The benchmark ladder. Dates sit at even fractions between the baseline and
     the annual date; each criterion is the aimline's own value on that date, so
     a teacher who meets every rung is by definition on the line the chart draws.
     Returns [] on a degenerate aimline — there is no ladder to build. */
  function aogIepBenchLadder(g,n,opts){
    opts=opts||{};
    n=+n||3; if(n<1) n=1; if(n>6) n=6;
    if(!g||!g.baseline||!g.target) return [];
    if(aogIepAimDegenerate(g)) return [];
    var es=!!opts.es, out=[], i;
    for(i=1;i<=n;i++){
      var ds=aogIepDateAtFrac(g.baseline.date,g.target.date,i/(n+1));
      if(!ds) return [];
      var raw=aogIepAimAt(g,aogIepDayNum(ds));
      if(!isFinite(raw)) return [];
      var v=aogIepLadderRound(g,raw), u=aogIepLadderUnit(g);
      var when=aogIepMonthYear(ds,es);
      var body=aogIepGoalIsXY(g.measure)||g.measure==="percent"
        ? aogIepGoalReCriterion(g.title,v,g.measure)
        : null;
      var crit;
      if(aogIepGoalIsXY(g.measure)&&opts.den>0){
        var k=Math.round(v/100*opts.den); if(k<0) k=0; if(k>opts.den) k=opts.den;
        crit=k+" of "+opts.den;
        if(!body) body=aogIepGoalReCriterion(g.title,v,g.measure);
      } else {
        crit=v+u;
      }
      var text=body
        ? ((es?"Para ":"By ")+when+", "+aogIepGoalLowerFirst(aogIepGoalStripLead(body)))
        : ((es?("Para "+when+", alcanzar "+crit+" en: "):("By "+when+", reach "+crit+" toward: "))+aogIepGoalStripLead(g.title));
      out.push({letter:String.fromCharCode(65+((i-1)%26)),date:ds,value:v,criteria:crit,text:text});
    }
    return out;
  }
  function aogIepGoalStripLead(t){
    return String(t==null?"":t).replace(/^\s*(?:by|para)\s+[^,]{0,40},\s*/i,"");
  }
  function aogIepGoalLowerFirst(t){
    t=String(t==null?"":t);
    return /^[A-Z][a-z]/.test(t) ? (t.charAt(0).toLowerCase()+t.slice(1)) : t;
  }
  /* What the sentence is missing. Condition / timeframe / criterion are the
     three a compliance reviewer asks for. The LEARNER is deliberately not
     checked: this site stores initials or a code, never a full name. */
  /* A condition OPENS the goal — "Given a passage,…", "When asked to…". The
     first draft matched a bare "with", which made "with 80% accuracy" look like
     a condition and passed goals that had none. Anchored, and allowed to sit
     after a "By May 2027," opener. */
  var AOG_GOAL_COND=/^\s*(?:(?:by|para)\s+[^,]{0,40},\s*)?(given|dado|dada|when|cuando|using|usando|provided|after|después|during|durante|presented\s+with|in\s+response\s+to|with\s+(?:a|an|the)\b|con\s+(?:un|una|el|la)\b)/i;
  var AOG_GOAL_TIME=/\b(by|para)\s+(january|february|march|april|may|june|july|august|september|october|november|december|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|\d{1,2}\/\d{1,2}\/\d{2,4})/i;
  function aogIepGoalCheck(title,o){
    o=o||{};
    var t=String(title==null?"":title).trim();
    if(!t) return [{k:"empty",ok:false,fix:null}];
    var blank=aogIepGoalHasBlank(t);
    var filled=aogIepGoalFill(t,o);
    return [
      {k:"condition",ok:AOG_GOAL_COND.test(t),fix:null},
      {k:"timeframe",ok:AOG_GOAL_TIME.test(t),fix:(o.tdate?"addTimeframe":null)},
      {k:"criterion",ok:(!blank&&/\d/.test(t)),fix:((blank&&filled!==t)?"fillBlanks":null)},
      {k:"match",ok:!aogIepGoalMismatch(t,o),fix:null}
    ];
  }
  /* ================= READ A WRITTEN GOAL (.29y) ==========================
     A finished IEP goal already says what it is scored on. This reads the
     sentence and PROPOSES; it never decides. Every criterion found is returned
     in the order it appears, because a real goal holds several —

       "read 145 correct words per minute (20th %ile) with at least 95%
        accuracy on 1 out of 3 trials"

     is four numbers, and only the person who wrote it knows which one the
     progress monitoring uses. Measured against Jimmy's own twenty-four goals:
     the criterion he had stored was among the candidates in 22, and in the
     other two the sentence disagreed with what was typed in months ago — one
     of them the cues-stored-as-a-rating this reader would have caught.
     ==================================================================== */
  var AOG_RG_MONTHS=["january","february","march","april","may","june","july","august","september","october","november","december"];
  function aogIepReadGoal(text){
    var t=String(text==null?"":text);
    var out={ when:null, cands:[], notes:[] };
    if(!t.trim()) return out;
    var m;

    var mm=/\bby\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(?:of\s+)?((?:19|20)\d{2})/i.exec(t);
    if(mm){
      var mi=AOG_RG_MONTHS.indexOf(mm[1].toLowerCase());
      out.when={ month:mi+1, year:+mm[2], day:null,
        iso:mm[2]+"-"+String(mi+1).padStart(2,"0")+"-01", said:mm[0], monthOnly:true };
    } else {
      /* the i flag matters: a goal starts with a capital By. */
      var md=/\bby\s+(\d{1,2})[\/\-](\d{1,2})[\/\-]((?:19|20)?\d{2})\b/i.exec(t);
      if(md){ var yy=+md[3]; if(yy<100) yy+=2000;
        out.when={ month:+md[1], year:yy, day:+md[2],
          iso:yy+"-"+String(+md[1]).padStart(2,"0")+"-"+String(+md[2]).padStart(2,"0"),
          said:md[0], monthOnly:false }; }
    }

    var seen={};
    function push(c){
      var k=c.measure+"|"+(c.xn==null?c.value:(c.xn+"/"+c.xd));
      if(seen[k]) return; seen[k]=1; out.cands.push(c);
    }

    var reRatio=/(\d+(?:\.\d+)?)\s*(?:out\s+of|of)\s+(\d+(?:\.\d+)?)\s+(?:consecutive\s+|independent\s+|separate\s+)?(trials?|opportunities|opps?|sessions?|times|steps?|measurements?|probes?|chances?|attempts?|occasions?)/gi;
    while((m=reRatio.exec(t))!==null){
      var noun=m[3].toLowerCase();
      push({ kind:"ratio", at:m.index, raw:m[0], measure:(/^steps?$/.test(noun)?"steps":"trials"),
             xn:+m[1], xd:+m[2], pct:((+m[2]>0)?Math.round(+m[1]/+m[2]*10000)/100:null), noun:noun });
    }
    /* "for 3 consecutive trials" is an x of y with the x implied: all of them. */
    var reAll=/(?:for|on|across|over)\s+(\d+)\s+consecutive\s+(trials?|sessions?|opportunities|measurements?|probes?|days?|occasions?)/gi;
    while((m=reAll.exec(t))!==null){
      push({ kind:"ratio", at:m.index, raw:m[0], measure:"trials",
             xn:+m[1], xd:+m[1], pct:100, noun:m[2].toLowerCase(), allOf:true });
    }
    /* A ceiling on adult help is a COUNT — and the one most often mis-entered
       as a rating, which puts a 6 on a 1-5 scale. */
    var reCap=/(?:no\s+more\s+than|fewer\s+than|less\s+than|at\s+most|no\s+greater\s+than)\s+(\d+(?:\.\d+)?)\s+(?:teacher\s+|adult\s+|verbal\s+|visual\s+|physical\s+)?(cues?|prompts?|reminders?|redirections?|supports?|errors?|mistakes?)/gi;
    while((m=reCap.exec(t))!==null){
      push({ kind:"cap", at:m.index, raw:m[0], measure:"count", value:+m[1],
             unit:m[2].toLowerCase().replace(/s$/,"")+"s", lower:true });
    }
    var reRange=/(\d+(?:\.\d+)?)\s*(?:st|nd|rd|th)?\s*[-–]\s*(\d+(?:\.\d+)?)\s*(?:st|nd|rd|th)?\s*(?:%ile|percentile)/gi;
    while((m=reRange.exec(t))!==null){
      push({ kind:"percentile", at:m.index, raw:m[0], measure:"percent",
             value:Math.max(+m[1],+m[2]), range:[+m[1],+m[2]] });
    }
    var rePctile=/(\d+(?:\.\d+)?)\s*(?:st|nd|rd|th)?\s*(?:or\s+(?:higher|above|greater|better)\s+)?(?:%ile|percentile)/gi;
    while((m=rePctile.exec(t))!==null){
      push({ kind:"percentile", at:m.index, raw:m[0], measure:"percent", value:+m[1] });
    }
    var reW=/(\d+(?:\.\d+)?)\s*(?:correct\s+)?(?:words?\s+per\s+minute|wcpm|words\/min)/gi;
    while((m=reW.exec(t))!==null){
      push({ kind:"wcpm", at:m.index, raw:m[0], measure:"wcpm", value:+m[1], unit:"wcpm" });
    }
    var reP=/(\d+(?:\.\d+)?)\s*%(?!\s*ile)/gi;
    while((m=reP.exec(t))!==null){
      var around=t.slice(Math.max(0,m.index-14), m.index+m[0].length+12);
      if(/%ile|percentile/i.test(around)) continue;
      push({ kind:"percent", at:m.index, raw:m[0], measure:"percent", value:+m[1] });
    }
    var reMin=/(?:for|within|up\s+to|at\s+least)\s+(\d+(?:\.\d+)?)\s*(?:minutes?|mins?)\b/gi;
    while((m=reMin.exec(t))!==null){
      push({ kind:"duration", at:m.index, raw:m[0], measure:"duration", value:+m[1] });
    }
    var reSec=/(?:within|in|under)\s+(\d+(?:\.\d+)?)\s*seconds?\b/gi;
    while((m=reSec.exec(t))!==null){
      push({ kind:"latency", at:m.index, raw:m[0], measure:"latency", value:+m[1], unit:"seconds" });
    }
    var reScore=/score\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:or\s+(?:greater|higher|above|more))?/gi;
    while((m=reScore.exec(t))!==null){
      push({ kind:"score", at:m.index, raw:m[0], measure:"count", value:+m[1], unit:"points" });
    }

    out.cands.sort(function(a,b){ return a.at-b.at; });
    if(/\bno more than\b|\bfewer than\b|\bless than\b|\breduce\b|\bdecrease\b/i.test(t)) out.notes.push("lower");
    if(!out.when) out.notes.push("nodate");
    if(!out.cands.length) out.notes.push("nonumber");
    return out;
  }

  /* ---- PERCENTILE CUTOFFS (pure) ---------------------------------------
     A percentile goal ("will score at or above the 10th percentile") is
     tracked here as a percent, but what the teacher holds after scoring a
     probe is a RAW score. The norms lookup between the two is where entries
     go wrong: wrong season column, wrong grade table, or the raw count typed
     in as if it were the percent. These three functions carry a goal's own
     cutoff rows — "the 5th percentile starts at a score of 9" — so the
     lookup happens once, at setup, by the person who owns the goal.

     ⚠ THE CUTOFFS ARE THE TEACHER'S, NEVER SHIPPED. A norms table is the
     publisher's copyrighted work; this app stores only the handful of rows a
     teacher keys in for one goal, and no table is embedded here. */
  function aogIepCutParse(txt){
    var rows=[];
    String(txt||"").split(/[,;\n]+/).forEach(function(tk){
      var m=tk.match(/(\d+(?:\.\d+)?)\s*(?:th|st|nd|rd)?\s*[=:→\->\s]\s*(\d+(?:\.\d+)?)/);
      if(m){ var p=+m[1], s=+m[2]; if(isFinite(p)&&isFinite(s)&&p>=1&&p<=99&&s>=0) rows.push({pct:p,score:s}); }
    });
    rows.sort(function(a,b){ return a.pct-b.pct; });
    var seen={}, out=[];
    rows.forEach(function(r){ if(!seen[r.pct]){ seen[r.pct]=1; out.push(r); } });
    return out;
  }
  function aogIepCutText(rows){
    return (rows||[]).map(function(r){ return r.pct+"="+r.score; }).join(", ");
  }
  /* Highest percentile whose cutoff score the raw score reaches. Below the
     lowest row there is no norm to stand on, so the answer is the honest
     floor: "below the <lowest>th", entered as 1 — never 0, because 0 would
     read as an absent measurement, and never the floor value itself, because
     the student did not reach it. */
  function aogIepPctlFromRaw(rows,raw){
    raw=+raw;
    if(!isFinite(raw)||!rows||!rows.length) return null;
    var hit=null;
    for(var i=0;i<rows.length;i++){ if(raw>=rows[i].score) hit=rows[i]; }
    if(!hit) return {below:true,floor:rows[0].pct,enter:1};
    return {below:false,pct:hit.pct,enter:hit.pct};
  }
  /* ==== AOG-IEP-ELITE-PURE-END ==== */

  var AREAS={
    math:{en:"Math",es:"Matemáticas",grp:"A",c:"#3E5C9A"},
    reading:{en:"Reading",es:"Lectura",grp:"A",c:"#2E6B3A"},
    writing:{en:"Writing",es:"Escritura",grp:"A",c:"#6E4A9E"},
    social:{en:"Social work",es:"Trabajo social",grp:"F",c:"#B4552D"},
    speech:{en:"Speech & language",es:"Habla y lenguaje",grp:"F",c:"#1F7A8C"},
    ot:{en:"Occupational therapy",es:"Terapia ocupacional",grp:"F",c:"#9A6F24"},
    pt:{en:"Physical therapy",es:"Fisioterapia",grp:"F",c:"#587D71"},
    exec:{en:"Executive functioning",es:"Funcionamiento ejecutivo",grp:"F",c:"#444B5A"},
    behavior:{en:"Behavior",es:"Conducta",grp:"F",c:"#8B2A2A"},
    tr_emp:{en:"Transition: Employment",es:"Transición: Empleo",grp:"T",c:"#7C4A8A"},
    tr_edu:{en:"Transition: Education & training",es:"Transición: Educación y formación",grp:"T",c:"#4A6E8A"},
    tr_ind:{en:"Transition: Independent living",es:"Transición: Vida independiente",grp:"T",c:"#8A6E4A"},
    other:{en:"Other",es:"Otro",grp:"F",c:"#6B7280"}
  };
  var MEAS={
    percent:{en:"Percent (0–100%)",es:"Porcentaje (0–100%)"},
    count:{en:"Count / frequency",es:"Conteo / frecuencia"},
    wcpm:{en:"Words correct per minute (reading fluency)",es:"Palabras correctas por minuto (fluidez lectora)"},
    trials:{en:"Trials (x of y)",es:"Ensayos (x de y)"},
    duration:{en:"Duration (minutes)",es:"Duración (minutos)"},
    rating:{en:"Rating (1–5)",es:"Escala (1–5)"},
    latency:{en:"Latency (time to start)",es:"Latencia (tiempo hasta empezar)"},
    steps:{en:"Task analysis (x of y steps)",es:"Análisis de tareas (x de y pasos)"},
    interval:{en:"Frequency per interval",es:"Frecuencia por intervalo"}
  };
  function byDate(a,b){ return a.date<b.date?-1:(a.date>b.date?1:0); }
  function pad2(n){ return String(n).padStart(2,"0"); }
  function todayStr(){ var d=new Date(); return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate()); }
  function isoFromDay(day){ var d=new Date(day*86400000); return d.getUTCFullYear()+"-"+pad2(d.getUTCMonth()+1)+"-"+pad2(d.getUTCDate()); }
  /* Names the offending date and tells the teacher exactly what to change. It does
     NOT quietly repair the value — an IEP date is a legal field and only the person
     who owns the goal gets to edit it. See the note on aogIepDateSane. */
  /* A value the measure cannot hold. Not a silent clamp and not an auto-repair —
     name the number, name the likely cause, and point at the one field that fixes
     it. A count of cues or prompts is a COUNT, not a 1-5 rating. */
  function aogIepRangeWarnHTML(g,pts){
    if(!g) return "";
    var m=g.measure, cap=(m==="rating")?5:((m==="percent"||m==="trials"||m==="steps")?100:null);
    if(cap==null) return "";
    var over=[], seen={};
    function look(v,what){
      v=+v; if(!isFinite(v)||v<=cap) return;
      var k=what+":"+v; if(seen[k]) return; seen[k]=1;
      over.push(esc(what)+" "+r1(v));
    }
    look(g.baseline&&g.baseline.value, DTx("baseline","línea base"));
    look(g.target&&g.target.value, DTx("target","meta"));
    (pts||[]).forEach(function(p){ look(aogIepEffVal(g,p), DTx("a data point","un dato")); });
    if(!over.length) return "";
    var scaleName=(m==="rating")?DTx("a 1-5 rating","una valoración de 1 a 5"):DTx("a percent","un porcentaje");
    var hint=(m==="rating")
      ? DTx("If this is really a count — of cues, prompts, minutes — open Edit and change how it is measured, and the scale will fit.",
            "Si en realidad es un conteo — de apoyos, indicaciones, minutos — abre Editar y cambia cómo se mide, y la escala encajará.")
      : DTx("Open Edit and check the number, or the measure.",
            "Abre Editar y revisa el número, o la medida.");
    return '<div class="iep-xy-warn"><span>'
      + esc(DTx("Outside the scale:","Fuera de la escala:")) + " " + over.join(" &middot; ")
      + " &mdash; " + esc(DTx("this goal is scored as ","esta meta se califica como ")) + esc(scaleName) + ". "
      + esc(DTx("The chart has widened so nothing is drawn in the wrong place.",
                "La gráfica se amplió para que nada quede dibujado en el lugar equivocado."))
      + "<br>" + esc(hint) + '</span></div>';
  }
  function aogIepDateWarnHTML(g){
    var bad=[];
    if(!aogIepDateSane(g.baseline&&g.baseline.date)) bad.push([DTx("baseline date","fecha de linea base"), (g.baseline&&g.baseline.date)||""]);
    if(!aogIepDateSane(g.target&&g.target.date))     bad.push([DTx("target date","fecha meta"), (g.target&&g.target.date)||""]);
    if(!bad.length) return "";
    var list=bad.map(function(p){ return esc(p[0])+" &mdash; <b>"+esc(p[1]||DTx("(empty)","(vacia)"))+"</b>"; }).join("<br>");
    return '<div class="iep-xy-warn"><span>'
      + esc(DTx("Check this date:","Revisa esta fecha:")) + " " + list + "<br>"
      + esc(DTx("The year is outside 1900-2199, so it is almost certainly a typo. Open Edit and correct it. Until then the aimline is not drawn and the chart shows only the dates you logged.",
                "El ano esta fuera de 1900-2199, asi que casi seguro es un error de tecleo. Abre Editar y corrigelo. Mientras tanto no se traza la linea objetivo y la grafica muestra solo las fechas registradas."))
      + '</span></div>';
  }
  function fdate(day){ var d=new Date(day*86400000), y=d.getUTCFullYear();
    /* Two digits for an ordinary year; the WHOLE year for anything else, so a
       20026 reads as 20026 and not as a tidy little "026". */
    return (d.getUTCMonth()+1)+"/"+d.getUTCDate()+"/"+((y>=1000&&y<=9999)?String(y).slice(2):String(y)); }
  function fdateStr(ds){ return fdate(aogIepDayNum(ds)); }
  function load(){ var st=null; try{ st=JSON.parse(localStorage.getItem(KEY)||"null"); }catch(e){} if(!st||typeof st!=="object") st={}; if(!st.goals||typeof st.goals!=="object") st.goals={}; if(!st.data||typeof st.data!=="object") st.data={}; return st; }
  function save(st){ try{ localStorage.setItem(KEY,JSON.stringify(st)); }catch(e){} }
  function niceCeil(v){ if(!(v>0)) return 10; var k=Math.pow(10,Math.floor(Math.log(v)/Math.LN10)); var ms=[1,2,2.5,5,10]; for(var i=0;i<ms.length;i++){ if(ms[i]*k>=v-1e-9) return ms[i]*k; } return 10*k; }
  function scaleFor(g,pts){
    var m=g.measure;
    if(m==="percent"||m==="trials"||m==="steps") return {min:0,max:100,ticks:[0,25,50,75,100],unit:"%"};
    /* A rating is 1-5 by definition, and Y() clamps anything outside the scale —
       so a goal stored with a baseline of 6 drew its baseline ON the 5 line while
       the label beside it said 6. The axis lies quietly; the number does not.
       Now the scale widens to hold whatever is really there, and the goal card
       says so (aogIepRangeWarnHTML). Jimmy found one of these in his own data,
       2026-08-29 — a count of adult cues entered as a rating. */
    if(m==="rating"){
      var rmx=5;
      (pts||[]).forEach(function(p){ var v=aogIepEffVal(g,p); if(isFinite(v)&&v>rmx) rmx=v; });
      rmx=Math.max(rmx,+g.baseline.value||0,+g.target.value||0);
      rmx=Math.ceil(rmx);
      if(!(rmx>5)) return {min:0,max:5,ticks:[1,2,3,4,5],unit:"/5"};
      var rtk=[],ri;
      if(rmx<=10){ for(ri=1;ri<=rmx;ri++) rtk.push(ri); }
      else rtk=[0,r1(rmx/4),r1(rmx/2),r1(rmx*3/4),rmx];
      return {min:0,max:rmx,ticks:rtk,unit:"/5"};
    }
    var mx=0;
    (pts||[]).forEach(function(p){ var v=aogIepEffVal(g,p); if(isFinite(v)) mx=Math.max(mx,v); });
    mx=Math.max(mx,+g.baseline.value||0,+g.target.value||0);
    mx=niceCeil(mx*1.12);
    return {min:0,max:mx,ticks:[0,mx/4,mx/2,mx*3/4,mx],unit:(m==="duration"?"min":(m==="latency"?(g.unit||DTx("seconds","segundos")):(m==="interval"?(g.intervalLabel||DTx("per 10 min","por 10 min")):(m==="wcpm"?(g.unit||"wcpm"):(g.unit||"")))))};
  }
  /* Two decimals, not one. IEPs are written to a hundredth — a score of 5.0 or
     above, a rubric point, a percentile — and rounding those to a tenth quietly
     edited the goal. Whole numbers still print whole; the name is kept because
     forty call sites use it. Jimmy, 2026-08-29. */
  function r1(v){ return Math.round((+v)*100)/100; }
  function fmtNum(g,v){ v=r1(v); var m=g.measure; if(m==="percent"||m==="trials"||m==="steps") return v+"%"; if(m==="wcpm") return v+" "+(g.unit||"wcpm"); if(m==="duration") return v+" min"; if(m==="rating") return v+"/5"; if(m==="latency") return v+" "+(g.unit||DTx("seconds","segundos")); if(m==="interval") return v+" "+(g.intervalLabel||DTx("per 10 min","por 10 min")); return v+(g.unit?(" "+g.unit):""); }
  function fmtVal(g,p){ if(g.measure==="trials"||g.measure==="steps") return p.value+"/"+p.total+" ("+r1(aogIepTrialsPct(p.value,p.total))+"%)"; if(g.measure==="wcpm"){ var ac=aogIepWcpmAcc(p); return fmtNum(g,p.value)+(ac==null?"":(" \u00b7 "+ac+"% "+DTx("acc.","prec."))); } return fmtNum(g,p.value); }
  function numAttrs(g){ if(g.measure==="percent") return 'min="0" max="100" step="any"'; if(g.measure==="wcpm") return 'min="0" step="any"'; if(g.measure==="rating") return 'min="1" max="5" step="any"'; return 'min="0" step="any"'; }
  function phFor(g){ if(g.measure==="percent") return "%"; if(g.measure==="wcpm") return g.unit||"wcpm"; if(g.measure==="rating") return "1-5"; if(g.measure==="duration") return "min"; if(g.measure==="latency") return g.unit||DTx("seconds","segundos"); if(g.measure==="interval") return DTx("count","conteo"); return g.unit||DTx("value","valor"); }

  function chartSVG(g,pts,pal){
    pal=pal||{ line:"var(--chart-ink,#0A1E33)", dot:"var(--card,#fff)", gold:"var(--gold,#D9A33B)", grid:"var(--rule,#E4DAC5)", txt:"var(--ink-soft,#46506E)", faint:"var(--ink-faint,#8A92A6)", trend:"var(--ink-faint,#8A92A6)" };
    var W=640,H=260,ml=48,mr=16,mt=20,mb=36;
    /* Screen: CSS vars, so the theme toggle re-colors without a re-render.
       Print: pal.bench is supplied as literal light hex by the print path. */
    var BCOL=pal.bench||["var(--iep-bA,#3E5C9A)","var(--iep-bB,#B4552D)","var(--iep-bC,#2E6B3A)",
                         "var(--iep-bD,#6E4A9E)","var(--iep-bE,#1F7A8C)","var(--iep-bF,#8B2A2A)"];
    function bcol(bl){ var i=(String(bl).charCodeAt(0)-65)%BCOL.length; return BCOL[(i<0||isNaN(i))?0:i]; }
    var bLet=aogIepBenchLetters(pts);
    var sc=scaleFor(g,pts);
    var b=aogIepDayNum(g.baseline.date), t=aogIepDayNum(g.target.date);
    var bOK=aogIepDateSane(g.baseline.date), tOK=aogIepDateSane(g.target.date);
    var bv=+g.baseline.value, tv=+g.target.value;
    /* Only real dates get to set the width of the chart. One impossible year used
       to own the whole axis and stack every point on the left edge; now the bad
       endpoint is left out of the domain and the goal card says so out loud.
       Every point is considered, not just the first and last — the array is not
       guaranteed sorted here the way the paperwork chart's is. */
    var dom=[];
    if(bOK) dom.push(b);
    if(tOK) dom.push(t);
    pts.forEach(function(p){ if(aogIepDateSane(p.date)) dom.push(aogIepDayNum(p.date)); });
    if(!dom.length) dom=[b,b+1];
    var x0=Math.min.apply(null,dom), x1=Math.max.apply(null,dom);
    if(!(x1>x0)) x1=x0+1;
    var padX=Math.max(2,Math.round((x1-x0)*0.04)); x0-=padX; x1+=padX;
    function X(day){ return ml+(W-ml-mr)*((day-x0)/(x1-x0)); }
    function Y(v){ v=Math.max(sc.min,Math.min(sc.max,v)); return mt+(H-mt-mb)*(1-(v-sc.min)/(sc.max-sc.min)); }
    var s="";
    sc.ticks.forEach(function(tk){
      s+='<line x1="'+ml+'" y1="'+Y(tk).toFixed(1)+'" x2="'+(W-mr)+'" y2="'+Y(tk).toFixed(1)+'" stroke="'+pal.grid+'" stroke-width="1"/>'
        +'<text x="'+(ml-6)+'" y="'+(Y(tk)+3.5).toFixed(1)+'" text-anchor="end" font-size="10" fill="'+pal.faint+'">'+r1(tk)+(sc.unit==="%"?"%":"")+'</text>';
    });
    if(sc.unit&&sc.unit!=="%"&&sc.unit!=="/5") s+='<text x="'+ml+'" y="12" text-anchor="start" font-size="9.5" font-weight="700" fill="'+pal.faint+'">'+esc(sc.unit)+'</text>';
    var midD=Math.round((x0+x1)/2);
    [[x0,"start"],[midD,"middle"],[x1,"end"]].forEach(function(pr){
      s+='<text x="'+X(pr[0]).toFixed(1)+'" y="'+(H-mb+16)+'" text-anchor="'+pr[1]+'" font-size="10" fill="'+pal.txt+'">'+fdate(pr[0])+'</text>';
    });
    var deg=aogIepAimDegenerate(g);
    if(!deg){
    s+='<line x1="'+X(b).toFixed(1)+'" y1="'+Y(bv).toFixed(1)+'" x2="'+X(t).toFixed(1)+'" y2="'+Y(tv).toFixed(1)+'" stroke="'+pal.gold+'" stroke-width="2.5" stroke-dasharray="7 5"/>';
    s+='<circle cx="'+X(b).toFixed(1)+'" cy="'+Y(bv).toFixed(1)+'" r="5" fill="'+pal.gold+'"/>';
    s+='<circle cx="'+X(t).toFixed(1)+'" cy="'+Y(tv).toFixed(1)+'" r="5" fill="none" stroke="'+pal.gold+'" stroke-width="2.5"/>';
    var up=tv>=bv;
    /* Below the point by default — but a goal that lives near the floor (a 1%
       baseline on a 0-100 axis) put "Baseline 1" straight on top of the date
       axis. The label flips to the other side of its point rather than leaving
       the plot; aogIepLblY is the only thing that decides which side. */
    s+='<text x="'+X(b).toFixed(1)+'" y="'+aogIepLblY(Y(bv),up,mt,H-mb).toFixed(1)+'" text-anchor="start" font-size="10" font-weight="700" fill="'+pal.gold+'">'+esc(DTx("Baseline","Línea base"))+' '+r1(bv)+'</text>';
    s+='<text x="'+X(t).toFixed(1)+'" y="'+aogIepLblY(Y(tv),!up,mt,H-mb).toFixed(1)+'" text-anchor="end" font-size="10" font-weight="700" fill="'+pal.gold+'">'+esc(DTx("Target","Meta"))+' '+r1(tv)+'</text>';
    }
    /* The four-point rule, shaded. It carries its own on-chart label and a
       sentence under the chart — never color alone. */
    var fp=aogIepFourPoint(g,pts);
    if(fp){
      var fx1=X(aogIepDayNum(fp.from)), fx2=X(aogIepDayNum(fp.to));
      var fcol=(fp.k==="below")?(pal.warn||"var(--gold-deep,#9a6f24)"):(pal.good||"var(--green,#2E6B3A)");
      s+='<rect x="'+(fx1-9).toFixed(1)+'" y="'+mt+'" width="'+Math.max(20,(fx2-fx1)+18).toFixed(1)+'" height="'+(H-mt-mb)+'" fill="'+fcol+'" opacity="0.09"/>'
        +'<text x="'+((fx1+fx2)/2).toFixed(1)+'" y="'+(mt+11)+'" text-anchor="middle" font-size="9.5" font-weight="800" letter-spacing=".04em" fill="'+fcol+'">'
        +esc(fp.k==="below"?DTx("4 IN A ROW BELOW","4 SEGUIDOS POR DEBAJO"):DTx("4 IN A ROW ABOVE","4 SEGUIDOS POR ENCIMA"))+'</text>';
    }
    if(pts.length>=3){
      var xy=pts.map(function(p){ return {x:aogIepDayNum(p.date)-x0,y:aogIepEffVal(g,p)}; });
      var sl=aogIepSlope(xy);
      var sx=0,sy=0; xy.forEach(function(p){ sx+=p.x; sy+=p.y; });
      var a=(sy-sl*sx)/xy.length;
      var xa=xy[0].x, xb=xy[xy.length-1].x;
      s+='<line x1="'+X(x0+xa).toFixed(1)+'" y1="'+Y(a+sl*xa).toFixed(1)+'" x2="'+X(x0+xb).toFixed(1)+'" y2="'+Y(a+sl*xb).toFixed(1)+'" stroke="'+pal.trend+'" stroke-width="1.6" stroke-dasharray="2 4"/>';
    }
    if(pts.length>1){
      var dp="";
      pts.forEach(function(p,i){ dp+=(i?"L":"M")+X(aogIepDayNum(p.date)).toFixed(1)+" "+Y(aogIepEffVal(g,p)).toFixed(1)+" "; });
      s+='<path d="'+dp+'" fill="none" stroke="'+pal.line+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    pts.forEach(function(p){
      var cx=X(aogIepDayNum(p.date)), cy=Y(aogIepEffVal(g,p));
      s+='<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="4" fill="'+pal.dot+'" stroke="'+(p.bench?bcol(p.bench):pal.line)+'" stroke-width="2.4"/>';
      if(pts.length<=10) s+='<text x="'+cx.toFixed(1)+'" y="'+aogIepLblY(cy,false,mt,H-mb).toFixed(1)+'" text-anchor="middle" font-size="10" font-weight="700" fill="'+pal.txt+'">'+r1(aogIepEffVal(g,p))+'</text>';
      /* A 4px dot is not a hit target. This transparent one is, and it carries
         the whole point in an aria-label so a screen reader gets it too.
         Print sees nothing: it is transparent and has no stroke. */
      if(!pal.noHover){
        var tip=fdateStr(p.date)+" · "+fmtVal(g,p)
          +(p.bench?(" · "+DTx("benchmark ","punto de referencia ")+p.bench):"")
          +(deg?"":(" · "+DTx("aimline ","línea objetivo ")+r1(aogIepAimAt(g,aogIepDayNum(p.date)))))
          +(p.note?(" · "+p.note):"");
        s+='<circle class="iep-hot" cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="13" fill="transparent" tabindex="0" role="img" aria-label="'+esc(tip)+'" data-tip="'+esc(tip)+'"/>';
      }
    });
    if(bLet.length){ var lx0=W-mr-bLet.length*28; bLet.forEach(function(bl,bi){ var lx=lx0+bi*28; s+='<circle cx="'+(lx+5)+'" cy="9" r="4.5" fill="'+bcol(bl)+'"/><text x="'+(lx+13)+'" y="12.5" font-size="10" font-weight="700" fill="'+pal.txt+'">'+esc(bl)+'</text>'; }); }
    var ttl=DTx("IEP progress chart for ","Gráfica de progreso del IEP para ")+g.title+" — "+pts.length+(deg?DTx(" data points; no aimline — add a target to draw it."," puntos de datos; sin línea objetivo — agrega una meta para trazarla."):(DTx(" data points; aimline from "," puntos de datos; línea objetivo de ")+r1(bv)+DTx(" to "," a ")+r1(tv)+"."));
    return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(ttl)+'" style="width:100%;display:block;min-width:420px;" xmlns="http://www.w3.org/2000/svg"><title>'+esc(ttl)+'</title>'+s+'</svg>';
  }

  var TABKEY="aog.iep.tab";
  var CFOLD_KEY="aog.iep.charts";
  function cfoldLoad(){ try{ return JSON.parse(localStorage.getItem(CFOLD_KEY)||"{}")||{}; }catch(e){ return {}; } }
  /* Cards fold CLOSED by default (.30by, Jimmy's ask) — so the store remembers
     the goals a person OPENED, and a goal nobody has touched starts as its
     title bar. The key moved from aog.iep.cards (which stored the closed ones,
     .30bw) so no device misreads old entries with the inverted meaning. */
  var GFOLD_KEY="aog.iep.cards.open";
  function gfoldLoad(){ try{ return JSON.parse(localStorage.getItem(GFOLD_KEY)||"{}")||{}; }catch(e){ return {}; } }
  var ST={filter:"",formOpen:false,editId:null,prefill:null,hintId:null,benchEditId:null,cutEditId:null,chartBench:{},chartClosed:cfoldLoad(),cardOpen:gfoldLoad(),wizErr:null,wizFocus:false,
          student:(function(){ try{ return localStorage.getItem(TABKEY)||""; }catch(e){ return ""; } })()};
  var WKEY="aog.iep.wizard";
  var WZ=null;

  /* ==== AOG-IEP-WIZ-PURE-START (dependency-free — extracted verbatim by AoG-IepWizard.harness.mjs) ==== */
  function aogIepWizAddDays(iso,n){ var p=String(iso||"").split("-"); if(p.length<3) return iso; var d=new Date(Date.UTC(+p[0],+p[1]-1,+p[2])+n*86400000); function z(x){ return (x<10?"0":"")+x; } return d.getUTCFullYear()+"-"+z(d.getUTCMonth()+1)+"-"+z(d.getUTCDate()); }
  function aogIepWizBlank(todayIso){ return { step:1, student:"", grade:"", gradeTouched:false, gradeAuto:false, area:"", areaGrp:"", title:"", measure:"", unit:"", lower:false, lowerTouched:false, ilabel:"", bankSel:"", unitTouched:false, bdate:todayIso, bval:"", tdate:aogIepWizAddDays(todayIso,365), tval:"", bnum:"", bden:"", tnum:"", tden:"", notes:"" }; }
  function aogIepWizFromGoal(g){ g=g||{}; var b=g.baseline||{}, t=g.target||{}; return { step:1, student:g.student||"", grade:aogIepGradeNorm(g.grade), gradeTouched:true, gradeAuto:false, area:g.area||"other", areaGrp:aogIepWizAreaGrp(g.area||"other"), title:g.title||"", measure:g.measure||"percent", unit:g.unit||"", lower:!!g.lowerBetter, lowerTouched:true, bankSel:"", unitTouched:!!String(g.unit||""), ilabel:(g.intervalLabel==null?"":String(g.intervalLabel)), bdate:b.date||"", bval:(b.value==null?"":String(b.value)), tdate:t.date||"", tval:(t.value==null?"":String(t.value)),
      bnum:((g.xofy&&g.xofy.bn!=null)?String(g.xofy.bn):""), bden:((g.xofy&&g.xofy.bd!=null)?String(g.xofy.bd):""),
      tnum:((g.xofy&&g.xofy.tn!=null)?String(g.xofy.tn):""), tden:((g.xofy&&g.xofy.td!=null)?String(g.xofy.td):""),
      notes:g.notes||"" }; }
  var AOG_WIZ_GRPS={math:"A",reading:"A",writing:"A",tr_emp:"T",tr_edu:"T",tr_ind:"T"};
  function aogIepWizAreaGrp(a){ if(!a) return ""; return AOG_WIZ_GRPS[a]||"F"; }
  function aogIepWizPickGrp(d,grp){ if(!d) return d; if(grp!=="A"&&grp!=="F"&&grp!=="T") return d; d.areaGrp=grp; if(d.area&&aogIepWizAreaGrp(d.area)!==grp){ d.area=""; d.bankSel=""; } return d; }
  var WIZPH={
    math:{en:"e.g., Solve 2-digit addition with 80% accuracy",es:"p. ej., Resolver sumas de 2 dígitos con 80% de precisión"},
    reading:{en:"e.g., Read 90 words per minute",es:"p. ej., Leer 90 palabras por minuto"},
    behavior:{en:"e.g., Fewer than 3 callouts per class period",es:"p. ej., Menos de 3 interrupciones por clase"},
    speech:{en:"e.g., Produce /r/ correctly in 8 of 10 trials",es:"p. ej., Producir /r/ correctamente en 8 de 10 intentos"},
    exec:{en:"e.g., Start work within 2 minutes of directions",es:"p. ej., Comenzar el trabajo dentro de 2 minutos tras las instrucciones"},
    tr_emp:{en:"e.g., Complete 3 job applications with support",es:"p. ej., Completar 3 solicitudes de empleo con apoyo"},
    tr_edu:{en:"e.g., Identify 2 postsecondary programs matching interests",es:"p. ej., Identificar 2 programas postsecundarios seg\u00fan sus intereses"},
    tr_ind:{en:"e.g., Prepare a simple meal independently 4 of 5 days",es:"p. ej., Preparar una comida sencilla sin ayuda 4 de 5 d\u00edas"}
  };
  function aogIepWizPh(area){ return WIZPH[area]||{en:"e.g., One clear skill you can count or time",es:"p. ej., Una habilidad clara que puedas contar o cronometrar"}; }
  function aogIepWizStepOk(d,step){
    if(!d) return false;
    if(step===1) return !!(String(d.student||"").trim()&&d.area&&String(d.title||"").trim());
    if(step===2) return !!d.measure;
    if(step===3) return !!(d.bdate&&d.tdate&&d.bval!==""&&d.tval!==""&&isFinite(+d.bval)&&isFinite(+d.tval));
    return true;
  }
  function aogIepWizNext(d){ var s=+((d&&d.step)||1); if(s<3&&aogIepWizStepOk(d,s)) return s+1; return s; }
  function aogIepWizPrev(d){ var s=+((d&&d.step)||1); return s>1?s-1:1; }
  function aogIepWizFinishIssue(d){ if(!d) return "incomplete"; if(aogIepWizIsXofY(d.measure)&&(aogIepWizXofY(d.bnum,d.bden)==null||aogIepWizXofY(d.tnum,d.tden)==null)) return "xofyMissing"; if(!(d.bdate&&d.tdate&&String(d.bval)!==""&&String(d.tval)!==""&&isFinite(+d.bval)&&isFinite(+d.tval))) return "incomplete"; if(+d.tval===+d.bval) return "sameValue"; if(String(d.tdate)<=String(d.bdate)) return "dateOrder"; return null; }
  function aogIepWizCloseKind(kind){ if(kind==="esc"||kind==="backdrop"||kind==="x"||kind==="cancel") return {close:true,keepDraft:true}; if(kind==="save") return {close:true,keepDraft:false}; return {close:false,keepDraft:true}; }
  var AOG_WIZ_UNITS={percent:"%",count:"times",wcpm:"wcpm",trials:"trials",duration:"minutes",rating:"rating",latency:"seconds",steps:"steps",interval:""};
  function aogIepWizUnitFor(m){ return Object.prototype.hasOwnProperty.call(AOG_WIZ_UNITS,m)?AOG_WIZ_UNITS[m]:""; }
  function aogIepWizAutoUnit(d,m){ if(!d) return d; if(!d.unitTouched) d.unit=aogIepWizUnitFor(m||d.measure); return d; }
  /* A trials or task-analysis goal is entered the way it is scored — 4 of 5 —
     and stored as the percent the chart plots. Jimmy, 2026-08-26: a writing
     goal reading "in 4 out of 5 opportunities" had been entered as 1 and 5 and
     drew a flat line at 1% → 5%, because step 3 asked for a bare "Number" and
     the measure quietly meant percent. Two boxes, and the ambiguity is gone. */
  function aogIepWizXofY(num,den){
    num=String(num==null?"":num).trim(); den=String(den==null?"":den).trim();
    if(num===""||den==="") return null;
    var n=+num, d=+den;
    if(!isFinite(n)||!isFinite(d)||d<=0||n<0||n>d) return null;
    return Math.round(n/d*10000)/100;
  }
  function aogIepWizIsXofY(m){ return m==="trials"||m==="steps"; }
  /* One page means nothing gates the way Next used to, so the save has to say
     what is still blank — in the order a person reads the form. */
  function aogIepWizMissing(d){
    if(!d) return "student";
    if(!String(d.student||"").trim()) return "student";
    if(!d.area) return "area";
    if(!String(d.title||"").trim()) return "title";
    if(!d.measure) return "measure";
    return null;
  }
  /* Where a number has a bounded, conventional range, it is a menu instead of a
     box — fewer keystrokes and no typos on the number that drives the chart.
     Unbounded measures (wcpm, minutes, counts) stay a typed field: a menu of
     every plausible words-per-minute would be worse than typing it. */
  function aogIepWizNumOpts(m){
    if(m==="percent") { var p=[],i; for(i=0;i<=100;i+=5) p.push(i); return p; }
    if(m==="rating") return [1,2,3,4,5];
    return null;
  }
  /* ⚠ A bare number box says nothing about what it counts. Jimmy, 2026-08-27,
     looking at a baseline of "-2": "the baseline should show what type of data?
     Percentage, wpm, trials, problems correct…" So every value field now wears
     its unit, and cannot hold a number the measure makes impossible. */
  function aogIepWizUnitHint(d){
    if(!d) return "";
    var m=d.measure, u=String(d.unit==null?"":d.unit).trim();
    if(m==="percent") return "%";
    if(m==="rating") return "of 5";
    if(m==="duration") return u||"minutes";
    if(m==="latency") return u||"seconds";
    if(m==="wcpm") return u||"wcpm";
    if(m==="interval") return (String(d.ilabel||"").trim()||u||"per interval");
    if(m==="count") return u||"times";
    return u;
  }
  function aogIepWizNumRange(m){
    if(m==="percent") return {min:0,max:100};
    if(m==="rating") return {min:1,max:5};
    if(m==="count"||m==="duration"||m==="latency"||m==="wcpm"||m==="interval") return {min:0,max:null};
    return {min:null,max:null};
  }
  /* step=any everywhere. The 5s gave wcpm and latency friendlier spinner arrows
     and cost the ability to type 112.5 — the wrong trade for a field that has to
     carry whatever the IEP says. The suggestion lists still offer round numbers. */
  function aogIepWizNumStep(m){ return "any"; }
  function aogIepWizUnitTrim(u){ return String(u==null?"":u).trim().slice(0,20); }
  /* ---- grade as a first-class field: K-12 + band derivation (k2/35/68/912) ---- */
  var AOG_IEP_GRADES=["K","1","2","3","4","5","6","7","8","9","10","11","12"];
  function aogIepGradeNorm(v){ v=String(v==null?"":v).trim().toUpperCase(); if(v==="K") return "K"; if(!/^\d{1,2}$/.test(v)) return ""; var n=parseInt(v,10); if(n<1||n>12) return ""; return String(n); }
  function aogIepGradeBand(gr){ gr=aogIepGradeNorm(gr); if(!gr) return ""; if(gr==="K") return "k2"; var n=+gr; if(n<=2) return "k2"; if(n<=5) return "35"; if(n<=8) return "68"; return "912"; }
  function aogIepGradeForStudent(goals,student){ student=String(student==null?"":student).trim(); if(!student) return ""; var best="",bestKey=""; Object.keys(goals||{}).forEach(function(id){ var g=goals[id]; if(!g||String(g.student==null?"":g.student).trim()!==student) return; var gr=aogIepGradeNorm(g.grade); if(!gr) return; var k=String((g.baseline&&g.baseline.date)||"")+"|"+id; if(!best||k>bestKey){ best=gr; bestKey=k; } }); return best; }
  /* ---- Oral reading fluency norms (words correct per minute), by grade and season ----
     Grades 1-6: Hasbrouck, J. & Tindal, G. (2017). An update to compiled ORF norms (Tech. Report 1702), U. of Oregon.
     Grades 7-8: Hasbrouck, J. & Tindal, G. (2006). Oral reading fluency norms (The Reading Teacher, 59(7)).
     Each row is [90th, 75th, 50th, 25th, 10th] percentile. Grade 1 has no fall row in the 2017 update. */
  var AOG_ORF={
    "1":{winter:[97,59,29,16,9],spring:[116,91,60,34,18],src:"2017"},
    "2":{fall:[111,84,50,36,23],winter:[131,109,84,59,35],spring:[148,124,100,72,43],src:"2017"},
    "3":{fall:[134,104,83,59,40],winter:[161,137,97,79,62],spring:[166,139,112,91,63],src:"2017"},
    "4":{fall:[153,125,94,75,60],winter:[168,143,120,95,71],spring:[184,160,133,105,83],src:"2017"},
    "5":{fall:[179,153,121,87,64],winter:[183,160,133,109,84],spring:[195,169,146,119,102],src:"2017"},
    "6":{fall:[185,159,132,112,89],winter:[195,166,145,116,91],spring:[204,173,146,122,91],src:"2017"},
    "7":{fall:[180,156,128,102,79],winter:[192,165,136,109,88],spring:[202,177,150,123,98],src:"2006"},
    "8":{fall:[185,161,133,106,77],winter:[199,173,146,115,84],spring:[199,177,151,124,97],src:"2006"}
  };
  var AOG_ORF_PCTS=[90,75,50,25,10];
  function aogIepOrfSeason(iso){ var p=String(iso||"").split("-"); var m=+p[1]; if(!isFinite(m)||m<1||m>12) return "winter"; if(m>=8&&m<=11) return "fall"; if(m===12||m<=3) return "winter"; return "spring"; }
  function aogIepOrfRow(grade,season){ var g=AOG_ORF[aogIepGradeNorm(grade)]; if(!g) return null; var use=season; if(!g[use]) use=(g.winter?"winter":(g.spring?"spring":(g.fall?"fall":null))); if(!use) return null; return {p:g[use],season:use,src:g.src,grade:aogIepGradeNorm(grade)}; }
  function aogIepOrfPctile(row,v){ if(!row||v===""||v==null||!isFinite(+v)) return null; v=+v; for(var i=0;i<row.p.length;i++){ if(v>=row.p[i]) return AOG_ORF_PCTS[i]; } return 0; }
  function aogIepWizBankList(bank,area,band){ var list=(bank&&bank[area])||[],out=[],i,e; for(i=0;i<list.length;i++){ e=list[i]; if(!e) continue; if(band&&e.b&&e.b.indexOf(band)<0) continue; out.push({e:e,i:i}); } return out; }
  function aogIepWizBankTransitionLock(area,band){ return (area==="tr_emp"||area==="tr_edu"||area==="tr_ind")&&(band==="k2"||band==="35"); }
  /* Standards band inference - always programmatic from the code prefix, never hand-tagged. */
  function aogIepStdBandFromCode(code){ code=String(code==null?"":code).trim(); if(!code) return null; if(/^CCSS\./.test(code)) return null; var m=code.match(/^RF\.(K|\d{1,2})(\.|$)/)||code.match(/^(K|\d{1,2})\.[A-Z]/); if(m){ var b=aogIepGradeBand(m[1]); return b?[b]:null; } if(/^HS[A-Z]?$/.test(code)||/^[NAFGS]-[A-Z]{1,3}$/.test(code)) return ["912"]; return null; }
  function aogIepStdBandFromLabel(sx){ var m=String(sx==null?"":sx).match(/(^|[^\d])(K-2|3-5|6-8|9-10|11-12|9-12)([^\d]|$)/); if(!m) return null; var t=m[2]; if(t==="K-2") return ["k2"]; if(t==="3-5") return ["35"]; if(t==="6-8") return ["68"]; return ["912"]; }
  function aogIepStdBands(e){ if(!e) return null; if(e.src==="ccss") return aogIepStdBandFromCode(e.code); if(e.src==="ilsel") return aogIepStdBandFromLabel(String(e.code==null?"":e.code)+" "+String(e.label==null?"":e.label)); return null; }
  function aogIepStdBandRank(e,band){ if(!band) return 1; var bs=aogIepStdBands(e); if(bs===null) return 1; return bs.indexOf(band)>=0?0:2; }
  function aogIepStdBandSort(list,band){ list=(list||[]).slice(); if(!band) return list; var ix=list.map(function(e,i){ return {e:e,i:i,r:aogIepStdBandRank(e,band)}; }); ix.sort(function(a,b){ return (a.r-b.r)||(a.i-b.i); }); return ix.map(function(p){ return p.e; }); }
  /* Starter goal bank - text is deliberately English-only (it feeds US legal IEP paperwork). __ blanks are for the teacher's own numbers.
     Each entry: {t:title, m:measure, u?:chart unit, lb?:lower-is-better, b?:grade bands ['k2','35','68','912'] — omitted = fits all bands.
     Transition areas are restricted to b:['68','912'] (transition planning begins at 14 1/2). */
  var GOAL_BANK={
    math:[
      {t:"Count a set of objects to 20 and match the set to the written numeral in __ of __ trials",m:"trials",b:["k2"]},
      {t:"Solve addition and subtraction facts within 10 using manipulatives with __% accuracy across 3 consecutive sessions",m:"percent",b:["k2"]},
      {t:"Given a visual model, solve two-digit addition and subtraction problems with __% accuracy in 4 of 5 trials",m:"percent",b:["k2"]},
      {t:"Identify and extend a simple repeating pattern (AB, AABB) with concrete objects in __ of __ trials",m:"trials",b:["k2"]},
      {t:"Name written numerals 0-20 presented in random order, reading __ numerals correctly per session",m:"count",u:"numerals",b:["k2"]},
      {t:"Answer basic multiplication facts (0-9), completing __ correct facts in one minute",m:"count",u:"facts/min",b:["35"]},
      {t:"Solve one- and two-step word problems involving the four operations with __% accuracy across 3 consecutive sessions",m:"percent",b:["35"]},
      {t:"Identify, write, and compare fractions shown by a model in __ of __ trials",m:"trials",b:["35"]},
      {t:"Tell time to the nearest 5 minutes on an analog clock and solve elapsed-time problems with __% accuracy",m:"percent",b:["35"]},
      {t:"Solve multi-step problems involving ratios and unit rates with __% accuracy on 4 of 5 weekly probes",m:"percent",b:["68"]},
      {t:"Solve one- and two-step equations with one variable with __% accuracy across 3 consecutive sessions",m:"percent",b:["68"]},
      {t:"Add, subtract, multiply, and divide positive and negative rational numbers with __% accuracy",m:"percent",b:["68"]},
      {t:"Graph points from a table and interpret the linear relationship shown in __ of __ trials",m:"trials",b:["68"]},
      {t:"Solve linear equations and inequalities embedded in real-world problems with __% accuracy on 4 of 5 probes",m:"percent",b:["912"]},
      {t:"Interpret and compare functions presented as graphs, tables, and equations with __% accuracy across 3 consecutive sessions",m:"percent",b:["912"]},
      {t:"Create and follow a personal budget with income, fixed, and variable expenses, completing __ of __ steps independently",m:"steps",b:["912"]},
      {t:"Calculate totals, tax, discounts, and change for real-world purchases with __% accuracy in __ of __ trials",m:"trials",b:["912"]}
    ],
    reading:[
      {t:"Name all upper- and lowercase letters and produce the sound for __ of 26 letters across 3 consecutive sessions",m:"count",u:"letters",b:["k2"]},
      {t:"Decode consonant-vowel-consonant (CVC) words in __ of __ trials across 3 consecutive sessions",m:"trials",b:["k2"]},
      {t:"Read grade-level high-frequency sight words from a list, reading __ words correctly per session",m:"count",u:"words",b:["k2"]},
      {t:"Blend and segment the sounds in spoken one-syllable words in __ of __ trials",m:"trials",b:["k2"]},
      {t:"Retell a story naming the character, setting, and one main event, with picture support, in __ of __ opportunities",m:"trials",b:["k2"]},
      {t:"Read a grade-level passage aloud at __ words correct per minute with 3 or fewer errors",m:"wcpm",u:"wcpm",b:["35"]},
      {t:"Answer literal and inferential comprehension questions about a grade-level passage with __% accuracy",m:"percent",b:["35"]},
      {t:"Identify the main idea and two supporting details of a passage with __% accuracy in 4 of 5 opportunities",m:"percent",b:["35"]},
      {t:"Retell a story including character, setting, problem, and solution, naming __% of the story elements",m:"percent",b:["35"]},
      {t:"Write an objective summary of a grade-level text that includes the central idea and __ key details in __ of __ probes",m:"trials",b:["68"]},
      {t:"Make an inference about a grade-level text and support it with at least one piece of textual evidence in __ of __ opportunities",m:"trials",b:["68"]},
      {t:"Read a grade-level passage aloud at __ words correct per minute with 95% or better accuracy across 3 consecutive probes",m:"wcpm",u:"wcpm",b:["68"]},
      {t:"Read a grade-level passage aloud with appropriate rate, phrasing, and expression, reaching __ words correct per minute",m:"wcpm",u:"wcpm",b:["68"]},
      {t:"Decode unfamiliar multisyllabic words using syllable types and morphemes in __ of __ trials",m:"trials",b:["68"]},
      {t:"Determine the meaning of unknown words using context clues, prefixes, and suffixes with __% accuracy",m:"percent",b:["68"]},
      {t:"Analyze how an author develops a claim or theme across a grade-level text, scoring __% or higher on a 4-point rubric",m:"percent",b:["912"]},
      {t:"Cite strong textual evidence to support an analysis of what a text says explicitly and implicitly in __ of __ written responses",m:"trials",b:["912"]},
      {t:"Read and interpret functional documents (job applications, schedules, workplace notices), answering __ of __ questions correctly",m:"trials",b:["912"]},
      {t:"Compare two texts on the same topic and evaluate the strength of each argument with __% rubric accuracy",m:"percent",b:["912"]},
      {t:"Read a grade-level or functional text aloud at __ words correct per minute with 3 or fewer errors",m:"wcpm",u:"wcpm",b:["912"]},
      {t:"Read and follow a set of __-step written directions independently in __ of __ opportunities",m:"trials"}
    ],
    writing:[
      {t:"Write a complete simple sentence with a capital letter and ending punctuation in __ of __ trials",m:"trials",b:["k2"]},
      {t:"Use letter-sound knowledge to spell CVC words and taught high-frequency words with __% accuracy",m:"percent",b:["k2"]},
      {t:"Draw and label a picture, then write or dictate __ sentences about it, in __ of __ opportunities",m:"trials",b:["k2"]},
      {t:"Form upper- and lowercase letters legibly, forming __ of __ target letters correctly",m:"steps",b:["k2"]},
      {t:"Write a paragraph with a topic sentence, __ detail sentences, and a closing sentence, including __% of required elements",m:"percent",b:["35"]},
      {t:"Plan a writing piece using a graphic organizer, completing __ of __ sections independently",m:"steps",b:["35"]},
      {t:"Edit a draft for capitalization, punctuation, and spelling, correcting __% of errors independently",m:"percent",b:["35"]},
      {t:"Write an opinion piece stating a claim with __ supporting reasons, including __% of rubric elements",m:"percent",b:["35"]},
      {t:"Write a multi-paragraph essay with an introduction, __ body paragraphs, and a conclusion, earning __% on a structure rubric",m:"percent",b:["68"]},
      {t:"Support a written claim with __ pieces of relevant evidence, explaining how each supports the claim, in __ of __ essays",m:"trials",b:["68"]},
      {t:"Revise a draft to improve organization and word choice, making __ or more meaningful revisions per piece",m:"count",u:"revisions",b:["68"]},
      {t:"Take organized notes from a text or lesson using a taught format, capturing __% of key ideas",m:"percent",b:["68"]},
      {t:"Write an argumentative essay that acknowledges and rebuts a counterclaim, scoring __% or higher on the class rubric",m:"percent",b:["912"]},
      {t:"Integrate and cite __ credible sources in a research piece using the assigned citation format with __% accuracy",m:"percent",b:["912"]},
      {t:"Complete functional writing tasks (email to an employer, cover letter, request form), including __ of __ required elements",m:"steps",b:["912"]},
      {t:"Type __ words per minute with __% accuracy on a grade-level keyboarding passage",m:"count",u:"wpm",b:["912"]}
    ],
    social:[
      {t:"Identify own emotion and choose one taught coping strategy when upset in __ of __ opportunities",m:"trials"},
      {t:"After a conflict, complete a repair step (name the hurt, apologize, or make it right) in __ of __ observed opportunities",m:"trials"},
      {t:"Accept corrective feedback or a 'no' calmly (steady voice, safe body) in __ of __ opportunities",m:"trials"},
      {t:"Take turns and share materials during a structured game, using a visual support if needed, in __ of __ opportunities",m:"trials",b:["k2"]},
      {t:"Use words or a picture card to ask an adult for help instead of crying or leaving the area, in __ of __ observed opportunities",m:"trials",b:["k2"]},
      {t:"Join a group activity appropriately (watch, wait, ask to join) in __ of __ observed opportunities",m:"trials",b:["35"]},
      {t:"Initiate a positive peer interaction (greeting, invitation, or compliment) __ times per day with no more than one adult prompt",m:"count",b:["35"]},
      {t:"Maintain a back-and-forth conversation with a peer for __ exchanges, staying on the partner's topic, in 4 of 5 opportunities",m:"count",u:"exchanges",b:["68"]},
      {t:"Identify another person's perspective in a real or role-played conflict and state one respectful response in __ of __ sessions",m:"trials",b:["68"]},
      {t:"State another person's likely perspective and adjust own response during a disagreement in __ of __ real or role-played situations",m:"trials",b:["912"]},
      {t:"Use workplace-register conversation (greeting, tone, appropriate topics) during a mock interview or job task in __ of __ opportunities",m:"trials",b:["912"]}
    ],
    speech:[
      {t:"Produce the target sound at the word level with __% accuracy in __ of __ trials",m:"trials"},
      {t:"Produce the target sound in connected speech with __% accuracy across 3 consecutive sessions",m:"percent"},
      {t:"Use a taught fluency strategy (easy onset, pausing) during structured conversation in __ of __ opportunities",m:"trials"},
      {t:"Follow one- and two-step spoken directions containing basic concepts (in, on, under, first, last) in __ of __ trials",m:"trials",b:["k2"]},
      {t:"Use 3- to 4-word utterances to request, comment, or protest during structured play in __ of __ opportunities",m:"trials",b:["k2"]},
      {t:"Answer wh- questions (who, what, where, when, why) about a short passage in __ of __ trials",m:"trials",b:["35"]},
      {t:"Use age-appropriate pronouns and verb tense during structured tasks with __% accuracy",m:"percent",b:["35"]},
      {t:"Define curriculum vocabulary using category, function, and attributes in __ of __ trials",m:"trials",b:["68"]},
      {t:"Interpret figurative language (idioms, similes, metaphors) in grade-level material with __% accuracy",m:"percent",b:["68"]},
      {t:"Deliver a short structured presentation or multi-step explanation, earning __% of rubric points across 3 sessions",m:"percent",b:["912"]},
      {t:"Use self-advocacy communication (ask for repetition, clarify a misunderstanding) in __ of __ real or role-played situations",m:"trials",b:["912"]}
    ],
    ot:[
      {t:"Use a functional pencil grasp during writing tasks for __ minutes with no more than one prompt",m:"duration"},
      {t:"Complete a fine-motor classroom routine (cut, glue, fold), performing __ of __ steps independently",m:"steps"},
      {t:"Copy shapes, letters, and numbers from a near-point model with __% accuracy",m:"percent"},
      {t:"Fasten buttons, zippers, or snaps on own clothing independently in __ of __ opportunities",m:"trials",b:["k2"]},
      {t:"Cut along straight and curved lines staying within a quarter inch of the line in __ of __ trials",m:"trials",b:["k2"]},
      {t:"Write first and last name legibly on a line with correct letter formation in __ of __ trials",m:"trials",b:["35"]},
      {t:"Organize written work on the page (margins, spacing between words), meeting __% of legibility criteria",m:"percent",b:["35"]},
      {t:"Type or handwrite classroom assignments legibly for __ consecutive minutes without a break",m:"duration",b:["68"]},
      {t:"Organize binder, locker, and materials using a taught system, completing __ of __ checklist steps weekly",m:"steps",b:["68"]},
      {t:"Complete job-related fine-motor tasks (assembly, filing, food preparation) at __% of the worksite standard",m:"percent",b:["912"]},
      {t:"Manage personal organization tools (planner, phone calendar, workspace) independently on __ of __ observed days",m:"trials",b:["912"]}
    ],
    pt:[
      {t:"Walk between classroom locations independently and safely in __ of __ observed transitions",m:"trials"},
      {t:"Ascend and descend a flight of stairs using a reciprocal pattern with one rail in __ of __ trials",m:"trials"},
      {t:"Maintain single-leg balance for __ seconds in __ of __ trials",m:"trials"},
      {t:"Perform age-level gross-motor patterns (jump, hop, gallop) during play, completing __ of __ target patterns in 3 consecutive sessions",m:"steps",b:["k2"]},
      {t:"Sit on the carpet or at a desk with stable, upright posture for __ consecutive minutes",m:"duration",b:["k2"]},
      {t:"Throw and catch a playground ball from __ feet in __ of __ trials",m:"trials",b:["35"]},
      {t:"Participate in PE or recess gross-motor activities for __ consecutive minutes",m:"duration",b:["35"]},
      {t:"Carry a loaded backpack or cafeteria tray while navigating the hallway safely in __ of __ observed transitions",m:"trials",b:["68"]},
      {t:"Complete a functional endurance circuit (walking, stairs, sit-to-stand) for __ consecutive minutes",m:"duration",b:["68"]},
      {t:"Navigate the full campus, including stairs and crowded passing periods, independently on __ of __ observed days",m:"trials",b:["912"]},
      {t:"Demonstrate safe body mechanics for lifting and carrying job-related loads, performing __ of __ steps correctly",m:"steps",b:["912"]}
    ],
    exec:[
      {t:"Begin an assigned task within __ seconds of directions with no more than one prompt",m:"latency",lb:1},
      {t:"Remain on task during independent work for __ consecutive minutes",m:"duration"},
      {t:"Bring required materials to class in __ of __ observed class periods",m:"trials"},
      {t:"Complete the class arrival routine (unpack, gather materials, start work) with a visual checklist, performing __ of __ steps independently",m:"steps",b:["k2"]},
      {t:"Transition to the next activity within __ seconds of the class signal with no more than one reminder",m:"latency",lb:1,b:["k2"]},
      {t:"Record assignments in a planner or checklist, logging __ entries per week without reminders",m:"count",u:"entries",b:["35"]},
      {t:"Break a multi-step assignment into steps and complete the first step within the work session in __ of __ opportunities",m:"trials",b:["35"]},
      {t:"Turn in completed assignments on time, submitting __% of assignments across a grading period",m:"percent",b:["68"]},
      {t:"Use a taught planning routine (materials, steps, time estimate) before starting long-term projects in __ of __ projects",m:"trials",b:["68"]},
      {t:"Manage a weekly schedule (classes, work, deadlines) with a planner or phone, meeting __ of __ tracked commitments",m:"trials",b:["912"]},
      {t:"Self-monitor progress toward a long-term goal and adjust the plan at a weekly check-in, completing __ of __ review steps",m:"steps",b:["912"]}
    ],
    behavior:[
      {t:"Reduce callouts to no more than __ per class period",m:"count",lb:1},
      {t:"Use a taught replacement behavior (break card, help request) instead of leaving the area in __ of __ observed opportunities",m:"trials"},
      {t:"Follow adult directions within 1 minute of the request in __ of __ opportunities",m:"trials"},
      {t:"Request a break appropriately before escalating, __ times per day when frustrated",m:"count"},
      {t:"Reduce instances of physical aggression to __ or fewer per week",m:"count",lb:1},
      {t:"Keep a calm body (safe hands, stay in place) during transitions, with a visual cue if needed, in __ of __ transitions",m:"trials",b:["k2"]},
      {t:"Stay with the group during whole-class activities, leaving the assigned area no more than __ times per interval",m:"interval",lb:1,b:["k2"]},
      {t:"Leave the assigned area no more than __ times per interval",m:"interval",lb:1,b:["35"]},
      {t:"Use a taught calming strategy and return to work within __ minutes after a frustration trigger in __ of __ observed incidents",m:"trials",b:["35"]},
      {t:"Use respectful language with adults and peers, with no more than __ documented incidents per week",m:"count",lb:1,b:["68"]},
      {t:"Arrive to class on time and remain for the full period in __ of __ class periods per week",m:"trials",b:["68"]},
      {t:"Self-identify rising frustration and use an agreed regulation plan without staff direction in __ of __ observed incidents",m:"trials",b:["912"]},
      {t:"Meet classroom and workplace conduct expectations (attendance, phone use, language) on __ of __ scheduled days",m:"trials",b:["912"]}
    ],
    tr_emp:[
      {t:"Identify __ personal strengths and interests and match each to a possible career area in __ of __ sessions",m:"trials",b:["68","912"]},
      {t:"Complete a career interest inventory and state __ of its results in own words in __ of __ sessions",m:"trials",b:["68","912"]},
      {t:"Ask a supervisor or teacher a clarifying question when unsure of a task in __ of __ observed opportunities",m:"trials",b:["68","912"]},
      {t:"Follow a visual or written task list during a class or school job, completing __ of __ steps independently",m:"steps",b:["68","912"]},
      {t:"Complete __ job applications (paper or online) with no more than two staff prompts each",m:"count",u:"applications",b:["912"]},
      {t:"Answer common interview questions in a mock interview with __% of responses rated proficient on a rubric",m:"percent",b:["912"]},
      {t:"Arrive on time to work or vocational class in __ of __ scheduled days",m:"trials",b:["912"]},
      {t:"Clock in, follow a task list, and check own work at a job site, completing __ of __ steps independently",m:"steps",b:["912"]}
    ],
    tr_edu:[
      {t:"Describe own disability and the accommodations that help in __ of __ practice sessions",m:"trials",b:["68","912"]},
      {t:"Lead part of own IEP meeting by presenting goals or progress, completing __ of __ agenda steps",m:"steps",b:["68","912"]},
      {t:"Identify __ postsecondary or training options matching interests and list one entry requirement for each",m:"count",u:"programs",b:["68","912"]},
      {t:"Use a syllabus, agenda, or course schedule to record due dates with __% accuracy",m:"percent",b:["68","912"]},
      {t:"Complete a college, training, or certification application, finishing __ of __ sections independently",m:"steps",b:["912"]},
      {t:"Appropriately request an accommodation (extended time, notes) from an instructor in __ of __ role-plays",m:"trials",b:["912"]},
      {t:"Compare __ postsecondary programs on cost, supports, and entry requirements, completing __ of __ comparison steps",m:"steps",b:["912"]},
      {t:"Track __ postsecondary planning tasks (testing, financial aid, visits) per semester, completing __% on time",m:"percent",b:["912"]}
    ],
    tr_ind:[
      {t:"Follow a personal daily schedule (paper or phone) to arrive at activities on time in __ of __ opportunities",m:"trials",b:["68","912"]},
      {t:"Prepare a simple meal or snack safely, completing __ of __ recipe steps independently",m:"steps",b:["68","912"]},
      {t:"Complete a household routine (laundry, dishes, or cleaning), performing __ of __ steps independently",m:"steps",b:["68","912"]},
      {t:"Identify community resources (library, clinic, transit) and state when to use each in __ of __ sessions",m:"trials",b:["68","912"]},
      {t:"Build and follow a weekly budget of $__, staying within it in __ of __ weeks",m:"trials",b:["912"]},
      {t:"Plan and complete a public transportation trip (read schedule, pay fare, exit at stop), performing __ of __ steps independently",m:"steps",b:["912"]},
      {t:"Compare prices and complete a purchase, checking change or the receipt with __% accuracy",m:"percent",b:["912"]},
      {t:"Schedule and attend an appointment (medical, DMV, bank), completing __ of __ planning steps independently",m:"steps",b:["912"]}
    ],
    other:[
      {t:"Demonstrate the identified skill with __% accuracy in 4 of 5 opportunities",m:"percent"},
      {t:"Perform the target skill correctly in __ of __ trials across 3 consecutive sessions",m:"trials"},
      {t:"Sustain the target activity for __ consecutive minutes",m:"duration"},
      {t:"Begin the target task within __ seconds of the direction",m:"latency",lb:1},
      {t:"Complete __ of __ steps of the task analysis independently",m:"steps"},
      {t:"Demonstrate the target skill __ times per day as measured by staff tally",m:"count"}
    ]
  };
  function aogIepWizBankPick(d,area,i){
    if(!d||!area||!GOAL_BANK[area]) return d;
    var e=GOAL_BANK[area][i]; if(!e) return d;
    var key=area+":"+i;
    if(d.bankSel===key&&d.title===e.t){ d.bankSel=""; return d; }
    d.bankSel=key; d.title=e.t; d.measure=e.m; d.lower=!!e.lb; d.lowerTouched=true;
    if(!d.unitTouched) d.unit=(e.u!=null?String(e.u):aogIepWizUnitFor(e.m));
    return d;
  }
  function aogIepWizBankDim(d){ if(!d) return false; var t=String(d.title||"").trim(); if(!t) return false; if(d.bankSel){ var p=String(d.bankSel).split(":"); var e=(GOAL_BANK[p[0]]||[])[+p[1]]; if(e&&d.title===e.t) return false; } return true; }
  /* ==== AOG-IEP-WIZ-PURE-END ==== */

  var WIZM={
    percent:{t:{en:"Percent",es:"Porcentaje"},x:{en:"Accuracy or success rate · e.g., 80% correct",es:"Precisión o tasa de éxito · p. ej., 80% correcto"}},
    count:{t:{en:"Count",es:"Conteo"},x:{en:"How many times it happens · e.g., 4 callouts",es:"Cuántas veces sucede · p. ej., 4 interrupciones"}},
    wcpm:{t:{en:"Words per minute",es:"Palabras por minuto"},x:{en:"Oral reading fluency · e.g., 112 words correct per minute",es:"Fluidez lectora oral · p. ej., 112 palabras correctas por minuto"}},
    trials:{t:{en:"Out of __ trials",es:"De __ intentos"},x:{en:"e.g., 8 of 10 trials correct",es:"p. ej., 8 de 10 intentos correctos"}},
    duration:{t:{en:"Minutes",es:"Minutos"},x:{en:"How long · e.g., stays on task 12 minutes",es:"Cuánto tiempo · p. ej., 12 minutos en la tarea"}},
    rating:{t:{en:"Rating 1–5",es:"Escala 1–5"},x:{en:"A quick judgment scale",es:"Una escala rápida de valoración"}},
    latency:{t:{en:"Latency",es:"Latencia"},x:{en:"Time until they start · e.g., starts work in 90 seconds",es:"Tiempo hasta empezar · p. ej., empieza a trabajar en 90 segundos"}},
    steps:{t:{en:"Task analysis",es:"Análisis de tareas"},x:{en:"Steps completed · e.g., 6 of 8 steps",es:"Pasos completados · p. ej., 6 de 8 pasos"}},
    interval:{t:{en:"Per interval",es:"Por intervalo"},x:{en:"Frequency per interval · e.g., 3 times per 10-min block",es:"Frecuencia por intervalo · p. ej., 3 veces por bloque de 10 min"}}
  };

  function wizLoadDraft(){
    var d=null;
    try{ d=JSON.parse(localStorage.getItem(WKEY)||"null"); }catch(e){}
    if(!d||typeof d!=="object") return null;
    var b=aogIepWizBlank(todayStr());
    Object.keys(b).forEach(function(k){ if(d[k]===undefined||d[k]===null) d[k]=b[k]; });
    if(d.area&&!AREAS[d.area]) d.area="";
    if(d.areaGrp!=="A"&&d.areaGrp!=="F"&&d.areaGrp!=="T") d.areaGrp="";
    if(d.area&&AREAS[d.area]) d.areaGrp=AREAS[d.area].grp;
    if(d.measure&&!MEAS[d.measure]) d.measure="";
    d.step=Math.max(1,Math.min(3,parseInt(d.step,10)||1));
    d.lower=!!d.lower;
    d.grade=aogIepGradeNorm(d.grade);
    d.gradeTouched=!!d.gradeTouched; d.gradeAuto=!!d.gradeAuto;
    return d;
  }
  function wizSaveDraft(){ if(ST.editId) return; try{ localStorage.setItem(WKEY,JSON.stringify(WZ)); }catch(e){} }
  function wizClearDraft(){ try{ localStorage.removeItem(WKEY); }catch(e){} }
  function openWiz(pre){
    ST.editId=null; ST.prefill=null; ST.hintId=null;
    if(pre){
      WZ=aogIepWizBlank(todayStr());
      if(pre.student){ WZ.student=String(pre.student); try{ var pgw=aogIepGradeForStudent(load().goals,WZ.student); if(pgw){ WZ.grade=pgw; WZ.gradeAuto=true; } }catch(ePw){} }
      if(pre.area&&AREAS[pre.area]){ WZ.area=pre.area; WZ.areaGrp=AREAS[pre.area].grp; }
      if(pre.title) WZ.title=String(pre.title).slice(0,1500);
      /* A grade the teacher already typed beats one inferred from a caseload. */
      if(pre.grade){ var pgn=aogIepGradeNorm(pre.grade); if(pgn){ WZ.grade=pgn; WZ.gradeAuto=false; WZ.gradeTouched=true; } }
      if(pre.notes) WZ.notes=String(pre.notes).slice(0,600);
    } else {
      WZ=wizLoadDraft()||aogIepWizBlank(todayStr());
    }
    ST.formOpen=true; ST.wizErr=null; ST.wizFocus=true;
    wizSaveDraft();
  }
  function wizStepMsg(s){
    if(s===1) return DTx("Add the student, tap an area, and write the goal in one line.","Agrega el estudiante, toca un área y escribe la meta en una línea.");
    if(s===2) return DTx("Pick how you will measure this goal.","Elige cómo medirás esta meta.");
    return DTx("Add a starting number and date, and a target number and date.","Agrega un número y una fecha de inicio, y un número y una fecha meta.");
  }
  function wizIssueMsg(code){
    if(code==="student") return DTx("Add the student's initials or code at the top.","Agrega las iniciales o el código del estudiante arriba.");
    if(code==="area") return DTx("Tap an area so the starter goals can load.","Toca un área para que carguen las metas iniciales.");
    if(code==="title") return DTx("Pick a starter goal or write one in your own words.","Elige una meta inicial o escribe una con tus palabras.");
    if(code==="measure") return DTx("Choose how you will measure this goal.","Elige cómo medirás esta meta.");
    if(code==="xofyMissing") return DTx("This goal is scored x of y — put both numbers in, for example 4 of 5, so the chart plots the right percent.","Esta meta se califica x de y — escribe ambos números, por ejemplo 4 de 5, para que la gráfica trace el porcentaje correcto.");
    if(code==="sameValue") return DTx("Set a target different from the starting point — that's the line we'll aim for.","Define una meta distinta del punto de partida — esa es la línea que trazaremos.");
    if(code==="dateOrder") return DTx("Pick a target date after the baseline date — the aimline needs time to get there.","Elige una fecha meta posterior a la fecha de línea base — la línea objetivo necesita tiempo para llegar.");
    return wizStepMsg(3);
  }

  function wizBankHTML(d){
    if(!(d&&d.area&&GOAL_BANK[d.area])) return "";
    var band=aogIepGradeBand(d.grade);
    if(aogIepWizBankTransitionLock(d.area,band)){
      return '<div class="iep-wsoft" id="iepWBankNote">'+esc(DTx("Transition planning begins at 14\u00bd \u2014 transition starter goals unlock for grades 6-8 and 9-12.","La planificaci\u00f3n de la transici\u00f3n comienza a los 14\u00bd a\u00f1os \u2014 las metas iniciales de transici\u00f3n se habilitan para los grados 6-8 y 9-12."))+'</div>';
    }
    var pairs=aogIepWizBankList(GOAL_BANK,d.area,band);
    if(!pairs.length) return "";
    var h='<div class="iep-wbank'+(aogIepWizBankDim(d)?" dim":"")+'" id="iepWBank"><div class="iep-wbank-t">'+esc(DTx("Pick a starter goal:","Elige una meta inicial:"))+'</div>'
      +'<div class="iep-wbank-list" role="group" aria-label="'+esc(DTx("Starter goals","Metas para empezar"))+'">';
    pairs.forEach(function(p){
      var e=p.e;
      var on=(d.bankSel===d.area+":"+p.i)&&d.title===e.t;
      h+='<button type="button" class="iep-wbank-it'+(on?" on":"")+'" aria-pressed="'+(on?"true":"false")+'" onclick="aogIepWizBank('+p.i+')">'
        +'<span class="iep-wbank-ck" aria-hidden="true">'+(on?"\u2713":"")+'</span><span>'+esc(e.t)+'</span></button>';
    });
    h+='</div><div class="iep-whelp">'+esc(DTx("Tap one to fill the goal line \u2014 you can edit every word after.","Toca una para llenar la l\u00ednea de la meta \u2014 puedes editar cada palabra despu\u00e9s."))+'</div>'
      +(band?'':('<div class="iep-whelp iep-grhint">'+esc(DTx("Set a grade to see grade-fit goals.","Agrega un grado para ver metas adecuadas al grado."))+'</div>'))
      +'</div>';
    return h;
  }
  function wizStep1(d){
    var ph=aogIepWizPh(d.area);
    var GRPS=[["A","Academic","Académica"],["F","Functional","Funcional"],["T","Transition (14\u00bd+)","Transici\u00f3n (14\u00bd+)"]];
    var seg=GRPS.map(function(pr){
      return '<button type="button" class="iep-gseg" aria-pressed="'+(d.areaGrp===pr[0]?"true":"false")+'" onclick="aogIepWizSet(\'areaGrp\',\''+pr[0]+'\')">'+esc(DTx(pr[1],pr[2]))+'</button>';
    }).join("");
    var chips="";
    if(d.areaGrp){
      chips='<div class="iep-chips" style="margin-top:9px;">'+Object.keys(AREAS).filter(function(k){ return AREAS[k].grp===d.areaGrp; }).map(function(k){
        return '<button type="button" class="iep-achip" aria-pressed="'+(d.area===k?"true":"false")+'" style="--achip:'+AREAS[k].c+'" onclick="aogIepWizSet(\'area\',\''+k+'\')">'+esc(DTx(AREAS[k].en,AREAS[k].es))+'</button>';
      }).join("")+'</div>';
    }
    var gsel='<select id="iepWGrade" onchange="aogIepWizSet(\'grade\',this.value)" aria-label="'+esc(DTx("Grade","Grado"))+'"><option value="">\u2014</option>'
      +AOG_IEP_GRADES.map(function(gr){ return '<option value="'+gr+'"'+(d.grade===gr?' selected':'')+'>'+gr+'</option>'; }).join("")+'</select>';
    var h='<div class="iep-wpair"><div class="iep-wfield"><label for="iepWStudent">'+DTx("Student (initials or code)","Estudiante (iniciales o c\u00f3digo)")+'</label>'
      +'<input id="iepWStudent" list="iepStudentsList" autocomplete="off" value="'+esc(d.student)+'" oninput="aogIepWizInput(\'student\',this.value)">'
      +'<div class="iep-whelp">'+esc(DTx("The same code you use for check-ins \u2014 initials and a number, like JR14.","El mismo c\u00f3digo que usas para los registros \u2014 iniciales y un n\u00famero, como JR14."))+'</div></div>'
      +'<div class="iep-wfield iep-wgr"><label for="iepWGrade">'+DTx("Grade","Grado")+'</label>'+gsel
      +'<div class="iep-whelp">'+esc(DTx("Optional \u2014 tunes goals & standards","Opcional \u2014 ajusta metas y est\u00e1ndares"))+'</div></div></div>'
      +'<div class="iep-wfield"><label>'+DTx("Area","Área")+'</label>'
      +'<div class="iep-grpseg" role="group" aria-label="'+esc(DTx("Area group","Grupo de área"))+'">'+seg+'</div>'+chips+'</div>';
    if(!d.area){
      h+='<div class="iep-wsoft">'+esc(DTx("Pick an area to see starter goals.","Elige un área para ver las metas iniciales."))+'</div>';
      return h;
    }
    h+=wizBankHTML(d)
      +'<div class="iep-wfield iep-wown"><label for="iepWTitle">'+DTx("Or write your own:","O escribe la tuya:")+'</label>'
      +'<textarea id="iepWTitle" rows="3" maxlength="1500" style="max-width:100%;width:100%;min-height:78px;resize:vertical;font:inherit;font-size:14px;line-height:1.55;padding:10px 12px;" placeholder="'+esc(DTx(ph.en,ph.es))+'" oninput="aogIepWizInput(\'title\',this.value); aogIepFitTitle(this);">'+esc(d.title)+'</textarea></div>'
      +wizReadHTML(d);
    return h;
  }

  function wizStep2(d){
    var cards=Object.keys(WIZM).map(function(k){
      return '<button type="button" class="iep-wcard" aria-pressed="'+(d.measure===k?"true":"false")+'" onclick="aogIepWizSet(\'measure\',\''+k+'\')">'
        +'<span class="iep-wcard-t">'+esc(DTx(WIZM[k].t.en,WIZM[k].t.es))+'</span>'
        +'<span class="iep-wcard-x">'+esc(DTx(WIZM[k].x.en,WIZM[k].x.es))+'</span></button>';
    }).join("");
    var h='<div class="iep-wfield"><label>'+DTx("Pick one","Elige una")+'</label><div class="iep-wcards">'+cards+'</div></div>';
    if(d.measure){
      h+='<div class="iep-wfield"><label id="iepWDirLbl">'+DTx("Which direction is progress?","¿En qué dirección está el progreso?")+'</label>'
        +'<div class="iep-wdir" role="radiogroup" aria-labelledby="iepWDirLbl">'
        +'<button type="button" class="iep-wcard" role="radio" aria-checked="'+(!d.lower?"true":"false")+'" onclick="aogIepWizSet(\'lower\',false)"><span class="iep-wcard-t">&#11014; '+esc(DTx("Higher is better","Mayor es mejor"))+'</span><span class="iep-wcard-x">'+esc(DTx("Most goals","La mayoría de las metas"))+'</span></button>'
        +'<button type="button" class="iep-wcard" role="radio" aria-checked="'+(d.lower?"true":"false")+'" onclick="aogIepWizSet(\'lower\',true)"><span class="iep-wcard-t">&#11015; '+esc(DTx("Lower is better","Menor es mejor"))+'</span><span class="iep-wcard-x">'+esc(DTx("e.g., fewer callouts","p. ej., menos interrupciones"))+'</span></button>'
        +'</div></div>'
        +(d.measure==="interval"
          ?('<div class="iep-wfield"><label for="iepWIlabel">'+DTx("Interval label","Etiqueta del intervalo")+'</label>'
            +'<input id="iepWIlabel" value="'+esc(d.ilabel)+'" placeholder="'+esc(DTx("per 10 min","por 10 min"))+'" oninput="aogIepWizInput(\'ilabel\',this.value)">'
            +'<div class="iep-whelp">'+esc(DTx("e.g., per 10 min, per class period","p. ej., por 10 min, por clase"))+'</div></div>')
          :'')
        +'<details class="iep-wopt"'+(d.unit?" open":"")+'><summary>'+DTx("Chart label (auto — edit if needed)","Etiqueta del gráfico (auto — edítala si quieres)")+'</summary>'
        +'<input id="iepWUnit" maxlength="20" value="'+esc(d.unit)+'" placeholder="'+esc(d.measure==="latency"?DTx("seconds","segundos"):DTx("e.g., minutes, wcpm","p. ej., minutos, wcpm"))+'" oninput="aogIepWizInput(\'unit\',this.value)" aria-label="'+esc(DTx("Chart label","Etiqueta del gráfico"))+'">'
        +'<div class="iep-whelp">'+esc(DTx("Short, like 'minutes' or 'wcpm' — not the goal itself.","Corta, como 'minutos' o 'wcpm' — no la meta en sí."))+'</div></details>';
    }
    return h;
  }

  function wizOrfSeasonLbl(sn){ return sn==="fall"?DTx("fall","otoño"):(sn==="spring"?DTx("spring","primavera"):DTx("winter","invierno")); }
  function wizOrfPctLbl(pc){ if(pc===null) return ""; if(pc===0) return DTx("below the 10th percentile","por debajo del percentil 10"); return DTx("about the "+pc+"th percentile","cerca del percentil "+pc); }
  function wizOrfHint(d){
    if(!d||d.measure!=="wcpm") return "";
    var gr=aogIepGradeNorm(d.grade);
    if(!gr||!AOG_ORF[gr]) return '<div class="iep-wsoft">'+esc(DTx("Set a grade of 1–8 up in step 1 and this box will show the typical words-per-minute range for that grade.","Elige un grado de 1 a 8 en el paso 1 y aquí verás el rango típico de palabras por minuto de ese grado."))+'</div>';
    var row=aogIepOrfRow(gr,aogIepOrfSeason(d.bdate||todayStr()));
    if(!row) return "";
    var h='<div class="iep-wsoft"><b>'+esc(DTx("Grade ","Grado ")+gr+" · "+wizOrfSeasonLbl(row.season))+'</b> — '
      +esc(DTx("typical is ","lo típico es ")+row.p[2]+" wcpm ("+DTx("50th percentile","percentil 50")+"). "
        +DTx("25th ","Percentil 25: ")+row.p[3]+" · "+DTx("10th ","percentil 10: ")+row.p[4]+".");
    var bp=aogIepOrfPctile(row,d.bval), tp=aogIepOrfPctile(row,d.tval);
    if(bp!==null) h+='<br>'+esc(DTx("Baseline ","Línea base ")+d.bval+" → "+wizOrfPctLbl(bp)+".");
    if(tp!==null) h+='<br>'+esc(DTx("Target ","Meta ")+d.tval+" → "+wizOrfPctLbl(tp)+".");
    h+='<br><span style="font-size:11px">'+esc("Hasbrouck & Tindal ("+row.src+") "+DTx("oral reading fluency norms.","normas de fluidez lectora oral."))+'</span></div>';
    return h;
  }
  /* One value field, in whichever shape the measure calls for: a bare number,
     or "x of y" with a live percent for trials and task-analysis goals. */
  function wizValRow(d,w){
    var isB=(w==="b");
    var dateId=isB?"iepWBDate":"iepWTDate", dateVal=isB?d.bdate:d.tdate, dateKey=isB?"bdate":"tdate";
    var dateLbl=isB?DTx("Baseline date","Fecha de línea base"):DTx("Target date","Fecha meta");
    var dateIn='<input type="date" id="'+dateId+'" min="1900-01-01" max="2199-12-31" value="'+esc(dateVal)+'" oninput="aogIepWizInput(\''+dateKey+'\',this.value); aogIepOrfRefresh();" aria-label="'+esc(dateLbl)+'">';
    if(aogIepWizIsXofY(d.measure)){
      var num=isB?d.bnum:d.tnum, den=isB?d.bden:d.tden;
      var pct=aogIepWizXofY(num,den);
      var stored=isB?d.bval:d.tval;
      var nLbl=(d.measure==="steps")?DTx("steps done","pasos logrados"):DTx("correct","logrados");
      var dLbl=(d.measure==="steps")?DTx("steps","pasos"):DTx("trials","ensayos");
      /* Was a <select> of whole numbers, so 4 of 5 was one tap and 4.5 of 5 was
         impossible — and a goal written to a half point could not be entered at
         all. Same shape as the single value box above: a number field with the
         common values hanging off it. Tap the list for 4, or type 4.5.
         Jimmy, 2026-08-29. */
      var pick=function(id,val,lo,hi,lbl,part){
        var v=String(val==null?"":val).trim();
        return '<input type="number" class="iep-wnum iep-wxy" id="'+id+'" list="iepWXYList"'
          +' min="'+lo+'" step="any" inputmode="decimal" value="'+esc(v)+'"'
          +' placeholder="'+esc(lbl)+'" aria-label="'+esc(lbl)+'"'
          +' oninput="aogIepWizXY(\''+w+'\',\''+part+'\',this.value)">';
      };
      return '<div class="iep-wrow" style="align-items:center;">'
        +pick("iepW"+(isB?"B":"T")+"Num",num,0,20,nLbl,"num")
        +'<span class="iep-wof">'+esc(DTx("of","de"))+'</span>'
        +pick("iepW"+(isB?"B":"T")+"Den",den,1,20,dLbl,"den")
        +'<span id="iepWXY_'+w+'" aria-live="polite" class="iep-wpct">'
          +(pct==null?(stored===""?"":esc(DTx("now ","ahora ")+stored+"%")):("= "+pct+"%"))+'</span>'
        +dateIn+'</div>';
    }
    var vId=isB?"iepWBVal":"iepWTVal", vVal=isB?d.bval:d.tval, vKey=isB?"bval":"tval";
    var vLbl=isB?DTx("Baseline value","Valor de línea base"):DTx("Target value","Valor meta");
    /* ONE control, not a mode. Jimmy, 2026-08-27: "sometimes we see odd
       numbers" — so a menu that has to be escaped is the wrong shape. This is a
       number box with the common values hanging off it: type 82 and nothing
       gets in the way, or open the list and take 80 without touching a key.
       No Other…, no way back, no state to be in. */
    var opts=aogIepWizNumOpts(d.measure);
    var unit=aogIepWizUnitHint(d), rng=aogIepWizNumRange(d.measure);
    var field='<input type="number" class="iep-wnum'+(opts?" iep-wnum-list":"")+'" id="'+vId+'" step="'+aogIepWizNumStep(d.measure)+'"'
      +(rng.min!=null?(' min="'+rng.min+'"'):'')+(rng.max!=null?(' max="'+rng.max+'"'):'')
      +(opts?(' list="iepWNumList" inputmode="numeric"'):'')
      +' value="'+esc(vVal)+'" placeholder="'+esc(DTx("Number","Número"))+'"'
      +' oninput="aogIepWizInput(\''+vKey+'\',this.value); aogIepOrfRefresh(); if(window.aogIepGcRefresh)aogIepGcRefresh();" aria-label="'+esc(vLbl)+(unit?(" ("+unit+")"):"")+'">';
    return '<div class="iep-wrow">'+field
      +(unit?('<span class="iep-wunit">'+esc(unit)+'</span>'):'')
      +dateIn+'</div>';
  }
  /* Emitted once per form; both value boxes point at it. */
  function wizNumListHTML(d){
    var out="";
    /* The x-of-y pickers are number boxes now, so they need their own suggestion
       list — 0 to 20, the range the old menus offered. */
    if(aogIepWizIsXofY(d&&d.measure)){
      var xs="", k;
      for(k=0;k<=20;k++) xs+='<option value="'+k+'"></option>';
      out+='<datalist id="iepWXYList">'+xs+'</datalist>';
    }
    var opts=aogIepWizNumOpts(d&&d.measure);
    if(opts) out+='<datalist id="iepWNumList">'+opts.map(function(k){ return '<option value="'+k+'"></option>'; }).join("")+'</datalist>';
    return out;
  }
  /* The goal check. Four rows a compliance reviewer would ask for, each with
     the one button that fixes it where a fix is honest. Nothing here edits the
     sentence on its own. */
  function wizGoalCheckHTML(d){
    if(!d||!String(d.title||"").trim()) return "";
    var o={measure:d.measure,value:d.tval,xn:d.tnum,xd:d.tden,tdate:d.tdate};
    var rows=aogIepGoalCheck(d.title,o);
    var mm=aogIepGoalMismatch(d.title,o);
    var filled=aogIepGoalFill(d.title,o);
    var LBL={
      condition:{en:"Says the conditions",es:"Dice las condiciones"},
      timeframe:{en:"Says by when",es:"Dice para cuándo"},
      criterion:{en:"Has a number to hit",es:"Tiene un número que alcanzar"},
      match:{en:"Sentence agrees with the chart",es:"La frase concuerda con la gráfica"}
    };
    var HINT={
      condition:{en:"Open with what is given — “Given a grade-level passage…”, “When asked to…”",es:"Empieza con lo que se da — “Dado un pasaje de su grado…”, “Cuando se le pide…”"},
      timeframe:{en:"IEP goals normally open “By May 2027, …”",es:"Las metas del IEP suelen empezar “Para mayo de 2027, …”"},
      criterion:{en:"The sentence still has blanks, or no number to reach",es:"La frase todavía tiene espacios en blanco, o ningún número que alcanzar"},
      match:{en:"",es:""}
    };
    var h='<div class="iep-gcheck"><div class="iep-gcheck-t">'+esc(DTx("Goal check","Revisión de la meta"))+'</div>';
    rows.forEach(function(r){
      if(r.k==="empty") return;
      var L=LBL[r.k]||{en:r.k,es:r.k};
      h+='<div class="iep-gcrow'+(r.ok?" ok":"")+'">'
        +'<span class="iep-gcdot" aria-hidden="true">'+(r.ok?"\u2713":"\u2022")+'</span>'
        +'<span class="iep-gclbl">'+esc(DTx(L.en,L.es))+'</span>';
      if(!r.ok){
        if(r.k==="match"&&mm){
          h+='<span class="iep-gchint">'+esc(DTx(
            "The sentence says "+(mm.kind==="ratio"?(mm.n+" of "+mm.d+" ("+mm.claim+"%)"):(mm.claim+"%"))+", but the target below is "+mm.target+(aogIepGoalIsXY(d.measure)||d.measure==="percent"?"%":"")+". Fix whichever one is wrong.",
            "La frase dice "+(mm.kind==="ratio"?(mm.n+" de "+mm.d+" ("+mm.claim+"%)"):(mm.claim+"%"))+", pero la meta de abajo es "+mm.target+(aogIepGoalIsXY(d.measure)||d.measure==="percent"?"%":"")+". Corrige la que esté mal."))+'</span>';
        } else {
          h+='<span class="iep-gchint">'+esc(DTx(HINT[r.k].en,HINT[r.k].es))+'</span>';
        }
        if(r.fix==="fillBlanks"&&filled!==d.title){
          h+='<button type="button" class="iep-mini" onclick="aogIepWizFillGoal()">'+esc(DTx("Put my numbers in","Poner mis números"))+'</button>';
        }
        if(r.fix==="addTimeframe"){
          h+='<button type="button" class="iep-mini" onclick="aogIepWizAddTime()">'+esc(DTx("Add “By "+aogIepMonthYear(d.tdate,false)+"”","Agregar “Para "+aogIepMonthYear(d.tdate,true)+"”"))+'</button>';
        }
      }
      h+='</div>';
    });
    h+='<div class="iep-gchelp">'+esc(DTx(
      "Suggestions, not rules — every district words goals a little differently. Nothing here changes your sentence unless you press a button.",
      "Sugerencias, no reglas — cada distrito redacta las metas un poco distinto. Nada aquí cambia tu frase a menos que presiones un botón."))
      +(ST.editId?('</div><div class="iep-gchelp warn">'+esc(DTx(
        "If this wording came from a signed IEP, that document is the record — change it there first, and copy it here.",
        "Si esta redacción viene de un IEP firmado, ese documento es el registro — cámbialo allí primero y cópialo aquí."))):'')
      +'</div></div>';
    return h;
  }
  function wizStep3(d){
    var xy=aogIepWizIsXofY(d.measure);
    var mLbl=d.measure&&WIZM[d.measure]?DTx(WIZM[d.measure].t.en,WIZM[d.measure].t.es):"";
    var mTag=mLbl?(' <span class="iep-wmtag">'+esc(mLbl)+'</span>'):'';
    return '<div class="iep-wfield"><label for="'+(xy?"iepWBNum":"iepWBVal")+'">'+DTx("Starting point (baseline)","Punto de partida (línea base)")+mTag+'</label>'
      +wizValRow(d,"b")
      +'<div class="iep-whelp">'+esc(xy?DTx("What can they do right now — the same x of y you will record below the chart.","¿Qué pueden hacer ahora — el mismo x de y que registrarás bajo la gráfica."):DTx("What can they do right now?","¿Qué pueden hacer ahora mismo?"))+'</div></div>'
      +'<div class="iep-wfield"><label for="'+(xy?"iepWTNum":"iepWTVal")+'">'+DTx("Target","Meta")+mTag+'</label>'
      +wizValRow(d,"t")
      +'<div class="iep-whelp">'+esc(xy?DTx("What should they reach by the annual review? The chart plots the percent.","¿Qué deberían alcanzar para la revisión anual? La gráfica traza el porcentaje."):DTx("What should they reach by the annual review?","¿Qué deberían alcanzar para la revisión anual?"))+'</div></div>'
      +wizNumListHTML(d)
      +(aogIepWizNumOpts(d.measure)?('<div class="iep-whelp iep-wnumhint">'+esc(DTx("Type any number — or open the list for the usual ones.","Escribe cualquier número — o abre la lista para los habituales."))+'</div>'):'')
      +'<div id="iepWOrf">'+wizOrfHint(d)+'</div>'
      +'<div id="iepWGcheck">'+wizGoalCheckHTML(d)+'</div>'
      +'<details class="iep-wopt"'+(d.notes?" open":"")+'><summary>'+DTx("Optional: notes","Opcional: notas")+'</summary>'
      +'<input id="iepWNotes" value="'+esc(d.notes)+'" oninput="aogIepWizInput(\'notes\',this.value)" aria-label="'+esc(DTx("Notes","Notas"))+'"></details>'
      +'<details class="iep-wopt"'+(stdOpen("wiz")?" open":"")+'><summary>'+DTx("Link standards (optional)","Vincular estándares (opcional)")+'</summary>'+stdPickerHTML("wiz")+'</details>';
  }

  function wizHTML(){
    var d=WZ; if(!d) return "";
    var isEdit=!!ST.editId;

    var heads=[null,
      DTx("Who is this goal for, and what’s the goal?","¿Para quién es esta meta y cuál es la meta?"),
      DTx("How will you measure it?","¿Cómo la vas a medir?"),
      DTx("Where are they starting, and where are they headed?","¿Dónde comienzan y hacia dónde van?")];
    /* ONE PAGE. The three steps are three sections you can see at once — the
       old Next buttons made a teacher click twice to write one goal, every
       time. `step` still lives in the draft and aogIepWizStepOk still decides
       what is complete; it drives the rail's ticks now instead of navigation. */
    var secs=[
      {n:1,lbl:DTx("Student & goal","Estudiante y meta"),head:heads[1]},
      {n:2,lbl:DTx("Measure","Medida"),head:heads[2]},
      {n:3,lbl:DTx("Numbers","Números"),head:heads[3]}
    ];
    var rail=secs.map(function(sc){
      var done=aogIepWizStepOk(d,sc.n);
      /* The label is display:none at <=640px and the number span is aria-hidden,
         so on a phone this button had NO accessible name at all (axe:
         button-name x3). The label also says whether the section is done —
         the tick is decoration a screen reader never reached. */
      return '<button type="button" class="iep-wrl'+(done?" done":"")+'" aria-label="'+esc(sc.lbl+(done?" \u2014 "+DTx("complete","completa"):""))+'" onclick="aogIepWizJump('+sc.n+')">'
        +'<span class="iep-wrl-n" aria-hidden="true">'+(done?"\u2713":sc.n)+'</span>'
        +'<span class="iep-wrl-t">'+esc(sc.lbl)+'</span></button>';
    }).join("");
    var h='<div class="iep-wovl" id="iepWizOvl" onclick="aogIepWizOvlClick(event)"><div class="iep-form iep-wiz iep-wiz-one" id="iepFormBox" role="dialog" aria-modal="true" aria-label="'+esc(isEdit?DTx("Edit goal","Editar meta"):DTx("New goal","Nueva meta"))+'">';
    h+='<div class="iep-whead" id="iepWizHead">';
    h+='<button type="button" class="iep-wx" onclick="aogIepWizDismiss(\'x\')" aria-label="'+esc(DTx("Close","Cerrar"))+'">×</button>';
    h+='<div class="iep-wtop"><span class="iep-wtitle">'+(isEdit?DTx("Edit goal","Editar meta"):DTx("New goal","Nueva meta"))+'</span></div>';
    h+='<nav class="iep-wrail" aria-label="'+esc(DTx("Sections of this goal","Secciones de esta meta"))+'">'+rail+'</nav>';
    h+='</div>';
    /* The three sections share one grid wrapper. At >=1100px it becomes two
       columns; below that it is an inert block and nothing changes. It exists
       because a sticky grid ITEM only sticks inside its own grid area — the
       head and the save bar have to stay direct children of the scroller. */
    h+='<div class="iep-wbody">';
    h+='<div class="iep-wsec" id="iepWSec1"><div class="iep-wsteph">'+esc(secs[0].head)+'</div>'+wizStep1(d)+'</div>';
    h+='<div class="iep-wsec" id="iepWSec2"><div class="iep-wsteph">'+esc(secs[1].head)+'</div>'+wizStep2(d)+'</div>';
    h+='<div class="iep-wsec" id="iepWSec3"><div class="iep-wsteph">'+esc(secs[2].head)+'</div>'+wizStep3(d)+'</div>';
    h+='</div>';/* .iep-wbody */
    h+='<div class="iep-wnav">';
    if(ST.wizErr) h+='<div class="iep-werr" role="alert">'+esc(ST.wizErr)+'</div>';
    h+='<button type="button" class="iep-btn gold iep-wbig" onclick="aogIepSave()">'+(isEdit?DTx("Save changes","Guardar cambios"):DTx("Start tracking this goal","Comenzar a seguir esta meta"))+'</button>'
      +'<button type="button" class="iep-btn ghost iep-wbig" onclick="aogIepCancel()">'+DTx("Cancel","Cancelar")+'</button>';
    h+='</div></div></div>';
    return h;
  }

  function cardHTML(st,id){
    var g=st.goals[id];
    var pts=(st.data[id]||[]).slice().sort(byDate);
    var A=AREAS[g.area]||AREAS.other;
    var M=MEAS[g.measure]||MEAS.percent;
    var sc=scaleFor(g,pts);
    var latest=pts.length?pts[pts.length-1]:null;
    var arrow="";
    if(pts.length>=2){
      var lastN=pts.slice(-6).map(function(p){ return {x:aogIepDayNum(p.date),y:aogIepEffVal(g,p)}; });
      arrow=' <span aria-hidden="true">'+aogIepArrow(aogIepSlope(lastN),sc.max-sc.min)+'</span>';
    }
    var bms=goalBenchmarks(id);
    var cut=(g.measure==="percent")?goalCutoffs(id):null;
    var bLetters=aogIepBenchLetters(pts);
    var bsel=(ST.chartBench&&ST.chartBench[id])||"ALL";
    if(bsel!=="ALL"&&bLetters.indexOf(bsel)<0) bsel="ALL";
    var showPts=aogIepBenchSplit(pts,bsel);
    var sp=aogIepPeriodSplit(g,pts);
    var rulePts=sp.used;
    var sg=aogIepSignal(g,rulePts,todayDayNum());
    var deg=aogIepAimDegenerate(g);
    var folded=!ST.cardOpen[id];
    var h='<div class="iep-card'+(folded?' iep-card-folded':'')+'" id="iepCard_'+id+'">';
    h+='<div class="iep-cardhead" onclick="aogIepCardHead(event,\''+id+'\')">'
      +'<button type="button" class="iep-cardfold" aria-expanded="'+(folded?'false':'true')+'" aria-label="'+esc(folded?DTx("Expand this goal","Abrir esta meta"):DTx("Collapse this goal","Cerrar esta meta"))+'" onclick="aogIepCardToggle(\''+id+'\')">'+(folded?'▸':'▾')+'</button>'
      +'<span class="iep-chip" style="background:'+A.c+'">'+esc(DTx(A.en,A.es))+'</span>'
      +(aogIepGradeNorm(g.grade)?('<span class="iep-grchip" title="'+esc(DTx("Grade","Grado"))+' '+esc(aogIepGradeNorm(g.grade))+'">'+esc(DTx("Gr.","Gr."))+' '+esc(aogIepGradeNorm(g.grade))+'</span>'):'')
      +'<span class="iep-title">'+esc(g.title)+'</span>'
      +(latest?('<span class="iep-latest">'+esc(DTx("Latest","Último"))+": "+esc(fmtVal(g,latest))+arrow+'</span>'):'')
      +(deg?('<button type="button" class="iep-status warn" onclick="aogIepEdit(\''+id+'\')" title="'+esc(aogIepDatesBad(g)?DTx("A date on this goal cannot exist — edit to correct it.","Una fecha de esta meta no puede existir — edita para corregirla."):DTx("Target equals the starting point — edit to set a real target.","La meta es igual al punto de partida — edita para definir una meta real."))+'">'+(aogIepDatesBad(g)?DTx("Fix the date · Edit","Corrige la fecha · Editar"):DTx("Set a target · Edit","Define una meta · Editar"))+'</button>'):sigChip(sg))
      +'<span style="display:flex;gap:6px;flex-wrap:wrap;">'
      +'<button type="button" class="iep-mini" onclick="aogIepEdit(\''+id+'\')">'+DTx("Edit","Editar")+'</button>'
      +'<button type="button" class="iep-mini" onclick="aogIepBenchOpen(\''+id+'\')">'+DTx("Manage benchmarks","Gestionar puntos de referencia")+(bms.length?(" ("+bms.length+")"):"")+'</button>'
      +(g.measure==="percent"?('<button type="button" class="iep-mini" onclick="aogIepCutOpen(\''+id+'\')" title="'+esc(DTx("Turn a raw probe score into the percentile this goal tracks","Convierte un puntaje bruto de la prueba en el percentil que sigue esta meta"))+'">'+DTx("Percentile cutoffs","Percentiles")+(cut?" ✓":"")+'</button>'):'')
      +'<button type="button" class="iep-mini" onclick="aogIepArch(\''+id+'\',true)">'+DTx("Archive","Archivar")+'</button>'
      +'<button type="button" class="iep-mini" onclick="aogIepPrintGoal(\''+id+'\')">'+DTx("Print","Imprimir")+'</button>'
      +'<button type="button" class="iep-mini" onclick="aogIepCsvDl(\''+id+'\')">CSV</button>'
      +'<button type="button" class="iep-mini danger" onclick="aogIepDel(\''+id+'\')">'+DTx("Delete","Eliminar")+'</button>'
      +'</span></div>';
    /* THE WHOLE CARD FOLDS, NOT JUST ITS CHART. The .30bt chart fold answered
       "can all the graphs collapse?" and Jimmy answered back: "I still don't
       see collapsible cards." A folded goal is its title bar — chips, title,
       latest, the signal word and every button stay live — and the body is
       simply NOT RENDERED, so print cannot be thinned by a fold: every print
       path rebuilds from data in its own window, never by cloning this DOM.
       CLOSED by default (.30by, Jimmy's ask — the caseload should land as a
       roster of title bars); the goals a person opens are remembered per
       device, and a freshly saved goal opens itself. */
    if(folded){ h+='</div>'; return h; }
    h+='<div class="iep-meta">'+esc(DTx(M.en,M.es))
      +' · '+esc(DTx("Baseline","Línea base"))+' '+esc(fmtNum(g,g.baseline.value))+' ('+fdateStr(g.baseline.date)+')'
      +' → '+esc(DTx("Target","Meta"))+' '+esc(fmtNum(g,g.target.value))+' ('+fdateStr(g.target.date)+')'
      +(g.lowerBetter?(' · '+esc(DTx("lower is better","menor es mejor"))):'')
      +(g.notes?(' · '+esc(g.notes)):'')+'</div>';
    h+=aogIepDateWarnHTML(g);
    if(aogIepXofYUnset(g)){
      h+='<div class="iep-xy-warn">'
        +'<span>'+esc(DTx(
          "Scored x of y, but only one number was saved for each end — so the chart is reading these as "+fmtNum(g,g.baseline.value)+" and "+fmtNum(g,g.target.value)+". If the goal means something like 4 of 5, open Edit and put both numbers in.",
          "Se califica x de y, pero solo se guardó un número en cada extremo — la gráfica los está leyendo como "+fmtNum(g,g.baseline.value)+" y "+fmtNum(g,g.target.value)+". Si la meta es algo como 4 de 5, abre Editar y escribe ambos números."))+'</span>'
        +'<button type="button" class="iep-mini" onclick="aogIepEdit(\''+id+'\')">'+esc(DTx("Fix the baseline and target","Corregir línea base y meta"))+'</button>'
        +'</div>';
    }
    h+=blankGoalHTML(g,id);
    if(ST.benchEditId===id) h+=benchEditorHTML(id,bms);
    if(ST.cutEditId===id&&g.measure==="percent") h+=cutEditorHTML(id,cut);
    /* THE CHART FOLDS. Twelve students and thirty-seven goals made the panel
       a scroll marathon (Jimmy: "can all the graphs have the option of
       collapsing?"). Open by default so nothing changes until a person folds
       it; the choice is remembered per goal on this device. ⚠ PRINT IS
       UNAFFECTED BY DESIGN: every print path (goal print, student report,
       meeting view) rebuilds its chart from data via chartSVG, never by
       cloning this DOM — the gc-sec lesson, honored structurally. */
    h+='<details class="iep-cfold"'+(ST.chartClosed[id]?'':' open')+' data-iepcfold="'+id+'"><summary>'+esc(DTx("Chart","Gráfica"))+'</summary>';
    if(bLetters.length){
      h+='<div class="iep-bchips" role="group" aria-label="'+esc(DTx("Filter chart by benchmark","Filtrar la gráfica por punto de referencia"))+'">'
        +["ALL"].concat(bLetters).map(function(bl){ return '<button type="button" class="iep-bchip'+(bsel===bl?" on":"")+'" aria-pressed="'+(bsel===bl?"true":"false")+'" onclick="aogIepBenchSel(\''+id+'\',\''+bl+'\')">'+(bl==="ALL"?esc(DTx("All","Todos")):esc(bl))+'</button>'; }).join("")+'</div>';
    }
    h+=aogIepRangeWarnHTML(g,showPts);
    h+='<div class="iep-chartwrap">'+chartSVG(g,showPts,null)+'</div>';
    h+='</details>';
    h+=periodNoteHTML(g,sp,id);
    h+=decideHTML(g,rulePts);
    if(deg) h+='<div class="iep-nodata">'+esc(aogIepDatesBad(g)?DTx("Fix the target date above to draw the aimline","Corrige la fecha meta de arriba para trazar la línea objetivo"):DTx("Add a target to draw the aimline","Agrega una meta para trazar la línea objetivo"))+'</div>';
    /* An empty goal should teach the next move, not report an absence. */
    if(!pts.length) h+='<div class="iep-firstrun"><b>'+esc(DTx("No measurements yet","Aún no hay mediciones"))+'</b> '
      +esc(DTx("Enter the date and the number below and press Add. The chart, the aimline and the progress signal all appear from the first point.",
               "Escribe la fecha y el número abajo y presiona Agregar. La gráfica, la línea objetivo y la señal de progreso aparecen desde el primer dato."))+'</div>';
    else if(pts.length<3) h+='<div class="iep-nodata">'+esc(DTx("Add data points to see the trend","Agrega datos para ver la tendencia"))+'</div>';
    if(ST.hintId===id) h+='<div class="iep-hint">'+esc(DTx("Add your first data point — just the date and a number.","Agrega tu primer dato — solo la fecha y un número."))+'</div>';
    h+='<div class="iep-entry"><input type="date" id="iepD_'+id+'" min="1900-01-01" max="2199-12-31" value="'+todayStr()+'" aria-label="'+esc(DTx("Date","Fecha"))+'">';
    if(g.measure==="trials"||g.measure==="steps"){
      h+='<input type="number" id="iepV_'+id+'" min="0" step="any" style="width:86px" placeholder="'+esc(g.measure==="steps"?DTx("done","logrados"):DTx("correct","logrados"))+'" aria-label="'+esc(g.measure==="steps"?DTx("Steps completed","Pasos logrados"):DTx("Correct","Logrados"))+'">'
        +'<span style="font-size:12px;color:var(--ink-faint,#8A92A6)">'+esc(DTx("of","de"))+'</span>'
        +'<input type="number" id="iepT_'+id+'" min="0" step="any" style="width:86px" placeholder="'+esc(g.measure==="steps"?DTx("steps","pasos"):DTx("trials","ensayos"))+'" aria-label="'+esc(g.measure==="steps"?DTx("Total steps","Total de pasos"):DTx("Total trials","Total de ensayos"))+'">';
    } else if(g.measure==="wcpm"){
      h+='<input type="number" id="iepV_'+id+'" min="0" step="any" style="width:96px" placeholder="'+esc(DTx("words read","palabras leídas"))+'" aria-label="'+esc(DTx("Words read in one minute","Palabras leídas en un minuto"))+'" oninput="aogIepWcpmPrev(\''+id+'\')">'
        +'<span style="font-size:12px;color:var(--ink-faint,#8A92A6)">'+esc(DTx("minus","menos"))+'</span>'
        +'<input type="number" id="iepE_'+id+'" min="0" step="any" style="width:80px" placeholder="'+esc(DTx("errors","errores"))+'" aria-label="'+esc(DTx("Errors","Errores"))+'" oninput="aogIepWcpmPrev(\''+id+'\')">'
        +'<span id="iepW_'+id+'" aria-live="polite" style="font-size:12px;font-weight:800;color:var(--gold-deep,#9a6f24);white-space:nowrap"></span>';
    } else if(g.measure==="percent"&&cut){
      /* Raw score first, because it is what the teacher is holding: the
         scored probe. Typing it fills the percent field through the goal's
         own cutoffs; the percent field stays editable, so a value known
         directly can still be typed straight in. */
      h+='<input type="number" id="iepR_'+id+'" min="0" step="any" style="width:88px" placeholder="'+esc(DTx("raw score","puntaje"))+'" aria-label="'+esc(DTx("Raw probe score","Puntaje bruto de la prueba"))+'" oninput="aogIepRawPrev(\''+id+'\')">'
        +'<span id="iepP_'+id+'" aria-live="polite" style="font-size:12px;font-weight:800;color:var(--gold-deep,#9a6f24);white-space:nowrap"></span>'
        +'<input type="number" id="iepV_'+id+'" '+numAttrs(g)+' style="width:100px" placeholder="'+esc(phFor(g))+'" aria-label="'+esc(DTx("Value","Valor"))+'">';
    } else {
      h+='<input type="number" id="iepV_'+id+'" '+numAttrs(g)+' style="width:100px" placeholder="'+esc(phFor(g))+'" aria-label="'+esc(DTx("Value","Valor"))+'">';
    }
    if(bms.length){
      h+='<select id="iepB_'+id+'" class="iep-bsel" aria-label="'+esc(DTx("Benchmark for this data point","Punto de referencia para este dato"))+'"><option value="">'+esc(DTx("Whole goal","Meta completa"))+'</option>'
        +bms.map(function(bm,bi){ var bl=(bm&&bm.letter)||benchLetter(bi); return '<option value="'+esc(bl)+'">'+esc(bl)+'</option>'; }).join("")+'</select>';
    }
    h+='<input type="text" id="iepN_'+id+'" placeholder="'+esc(DTx("note (optional)","nota (opcional)"))+'" style="flex:1;min-width:130px">'
      +'<button type="button" class="iep-btn" onclick="aogIepAdd(\''+id+'\')">'+DTx("Add","Agregar")+'</button></div>';
    if(pts.length){
      var st0=Math.max(0,pts.length-3);
      h+='<div class="iep-pts">'+pts.slice(st0).map(function(p,i){
        var idx=st0+i;
        return '<span class="iep-pt">'+(p.bench?('<b class="iep-ptb">'+esc(p.bench)+'</b>&nbsp;'):'')+fdateStr(p.date)+' · '+esc(fmtVal(g,p))+(p.raw!=null?(' · '+esc(DTx("raw ","bruto "))+esc(r1(p.raw))):'')+(p.note?(' · '+esc(p.note)):'')
          +'<button type="button" aria-label="'+esc(DTx("Edit this data point","Editar este dato"))+'" onclick="aogIepEditPt(\''+id+'\','+idx+')">✎</button>'
          +'<button type="button" aria-label="'+esc(DTx("Remove","Quitar"))+'" onclick="aogIepDelPt(\''+id+'\','+idx+')">×</button></span>';
      }).join("")+'</div>';
    }
    h+='</div>';
    return h;
  }

  /* ---- THE SIGNAL, IN WORDS ------------------------------------------------
     Color is never the information. Every state carries a mark, a word and a
     reason, and the word here is the same word the print, the CSV and the
     meeting page use. Four states only, and none of them is a judgement about
     a child — they describe a record, and a person reads the record. */
  var IEP_SIG={
    on:        {cls:"ok",    ic:"\u25B2", en:"On track",          es:"En camino"},
    watch:     {cls:"watch", ic:"\u25CF", en:"Watch",             es:"Observar"},
    attention: {cls:"off",   ic:"\u25BC", en:"Needs attention",   es:"Necesita atención"},
    more:      {cls:"more",  ic:"\u00B7", en:"More data needed",  es:"Faltan datos"}
  };
  function sigWord(k){ var d=IEP_SIG[k]||IEP_SIG.more; return DTx(d.en,d.es); }
  function sigWhy(sg){
    if(!sg) return "";
    switch(sg.why){
      case "noAim":        return DTx("No aimline yet — set a target that differs from the starting point.","Aún no hay línea objetivo — define una meta distinta al punto de partida.");
      case "none":         return DTx("No measurements recorded yet.","Aún no hay mediciones registradas.");
      case "few":          return DTx("Four measurements is where the rules start reading — this goal holds "+sg.n+".","Las reglas empiezan a leer con cuatro mediciones — esta meta tiene "+sg.n+".");
      case "fourBelow":    return DTx("Four in a row below the aimline.","Cuatro seguidos por debajo de la línea objetivo.");
      case "fourAbove":    return DTx("Four in a row above the aimline.","Cuatro seguidos por encima de la línea objetivo.");
      case "trendSteeper": return DTx("The trend is at least as steep as the aimline.","La tendencia es al menos tan pronunciada como la línea objetivo.");
      case "trendFlatter": return DTx("The trend is flatter than the aimline — not four in a row yet.","La tendencia es más plana que la línea objetivo — aún no son cuatro seguidos.");
      default:             return DTx("Recent measurements sit on both sides of the aimline.","Las mediciones recientes caen a ambos lados de la línea objetivo.");
    }
  }
  /* ⚠ A MODIFIER, NEVER A FIFTH STATE. The chip still carries one of the four
     words; this says how old the record behind that word is. The case it
     exists for is the quiet one: "On track" on a goal whose newest measurement
     is eighteen days old is the screen reporting something current about a
     record that is not.

     Past 30 days the existing `stale` marker already says it, so this stands
     down rather than printing a second age beside the first. */
  function quietMark(sg){
    if(!sg) return "";
    if(sg.unstarted){
      return '<span class="quiet" title="'+esc(DTx(
        "No measurements have been recorded for this goal yet. This describes the record, not the student.",
        "Todavía no se ha registrado ninguna medición para esta meta. Esto describe el registro, no al estudiante."))+'">'
        +esc(DTx("· not started","· sin iniciar"))+"</span>";
    }
    if(sg.quiet&&!sg.stale){
      return '<span class="quiet" title="'+esc(DTx(
        "The most recent measurement is "+sg.quiet+" days old, so the word beside this is reading that day, not today.",
        "La medición más reciente tiene "+sg.quiet+" días, así que la palabra de al lado describe ese día, no hoy."))+'">'
        +esc(DTx("· quiet "+sg.quiet+"d","· en silencio "+sg.quiet+" d"))+"</span>";
    }
    return "";
  }
  function sigChip(sg){
    if(!sg) return "";
    var d=IEP_SIG[sg.k]||IEP_SIG.more;
    var why=sigWhy(sg)+(sg.stale?(" "+DTx("Last measured "+sg.stale+" days ago.","Última medición hace "+sg.stale+" días.")):"");
    return '<span class="iep-status '+d.cls+'" title="'+esc(why)+'">'
      +'<span class="ic" aria-hidden="true">'+d.ic+'</span>'+esc(sigWord(sg.k))
      +(sg.stale?('<span class="stale" title="'+esc(DTx("This signal is reading an old record.","Esta señal lee un registro antiguo."))+'">'+esc(DTx("· "+sg.stale+"d old","· "+sg.stale+" d"))+'</span>'):'')
      +quietMark(sg)+'</span>';
  }
  function todayDayNum(){ return aogIepDayNum(todayStr()); }
  /* A goal saved with a blank still in its wording ("__% accuracy") used to
     carry that blank silently into the card, the report, the goal page and the
     export. The Goal check warned once, at the wizard, and then went quiet.
     It does not go quiet any more. */
  function blankGoalHTML(g,id){
    if(!aogIepGoalHasBlank(g&&g.title)) return "";
    return '<div class="iep-xy-warn iep-blank-warn">'
      +'<span>'+esc(DTx("This goal statement still has a blank in it (“__”). It will print that way on the report, the goal page and the export.",
                        "Esta meta todavía tiene un espacio en blanco (“__”). Se imprimirá así en el informe, la página de la meta y la exportación."))+'</span>'
      +'<button type="button" class="iep-mini" onclick="aogIepEdit(\''+id+'\')">'+esc(DTx("Finish the wording","Completar la redacción"))+'</button>'
      +'</div>';
  }
  /* Points the rules were not allowed to read, said out loud. Nothing is
     deleted and nothing is corrected — the teacher decides what they meant. */
  function periodNoteHTML(g,sp,id){
    if(!sp||(!sp.early.length&&!sp.late.length)) return "";
    /* This compares ISO dates as strings, and "2026-01-23" > "20026-12-01"
       one character at a time — so an impossible year made it report every
       point as dated AFTER a target they come eighteen thousand years before.
       When a date cannot exist, aogIepDateWarnHTML is the one that speaks. */
    if(aogIepDatesBad(g)) return "";
    var bits=[];
    if(sp.early.length) bits.push(DTx(sp.early.length+(sp.early.length===1?" measurement is":" measurements are")+" dated before the baseline ("+fdateStr(g.baseline.date)+"), so the aimline does not exist yet on "+(sp.early.length===1?"that date":"those dates")+". "+(sp.early.length===1?"It is":"They are")+" still drawn and still exported, but the four-point and trend rules skip "+(sp.early.length===1?"it":"them")+".",
                                       sp.early.length+(sp.early.length===1?" medición está fechada":" mediciones están fechadas")+" antes de la línea base ("+fdateStr(g.baseline.date)+"), así que la línea objetivo aún no existe en "+(sp.early.length===1?"esa fecha":"esas fechas")+". Se siguen dibujando y exportando, pero las reglas las omiten."));
    if(sp.late.length) bits.push(DTx(sp.late.length+(sp.late.length===1?" measurement is":" measurements are")+" dated after the target date ("+fdateStr(g.target.date)+").",
                                     sp.late.length+(sp.late.length===1?" medición está fechada":" mediciones están fechadas")+" después de la fecha meta ("+fdateStr(g.target.date)+")."));
    return '<div class="iep-outside"><span class="ic" aria-hidden="true">!</span><span>'+esc(bits.join(" "))
      +'</span><button type="button" class="iep-mini" onclick="aogIepEdit(\''+id+'\')">'+esc(DTx("Check the dates","Revisar las fechas"))+'</button></div>';
  }

  /* What the two rules add up to, in a sentence a team can act on. The color
     never carries it alone — there is a mark, a bold verdict and a reason. */
  function decideHTML(g,pts){
    var fp=aogIepFourPoint(g,pts);
    if(fp){
      if(fp.k==="below") return '<div class="iep-decide act"><span class="ic" aria-hidden="true">▲</span><span><b>'
        +esc(DTx("Four in a row below the aimline.","Cuatro seguidos por debajo de la línea objetivo."))+'</b> '
        +esc(DTx("The usual read: change something — the teaching, the practice, or the goal itself — rather than collecting a fifth point that says the same thing.",
                 "La lectura habitual: cambia algo — la enseñanza, la práctica o la meta misma — en vez de tomar un quinto dato que diga lo mismo."))+'</span></div>';
      return '<div class="iep-decide good"><span class="ic" aria-hidden="true">✓</span><span><b>'
        +esc(DTx("Four in a row above the aimline.","Cuatro seguidos por encima de la línea objetivo."))+'</b> '
        +esc(DTx("Keep going, and it may be worth asking the team whether the goal is now set too low.",
                 "Sigue así, y quizá valga preguntarle al equipo si la meta quedó demasiado baja."))+'</span></div>';
    }
    var tv=aogIepTrendVsAim(g,pts);
    if(tv){
      if(tv.k==="flatter") return '<div class="iep-decide quiet"><span class="ic" aria-hidden="true">→</span><span><b>'
        +esc(DTx("The trend is flatter than the aimline.","La tendencia es más plana que la línea objetivo."))+'</b> '
        +esc(DTx("Not four in a row yet — worth watching, not yet worth a decision.",
                 "Aún no son cuatro seguidos — vale observarlo, todavía no decidir."))+'</span></div>';
      return '<div class="iep-decide good"><span class="ic" aria-hidden="true">✓</span><span><b>'
        +esc(DTx("The trend is steeper than the aimline.","La tendencia es más pronunciada que la línea objetivo."))+'</b> '
        +esc(DTx("At this rate the goal is reachable by the target date.","A este ritmo la meta es alcanzable para la fecha objetivo."))+'</span></div>';
    }
    if(pts.length&&pts.length<4&&!aogIepAimDegenerate(g))
      return '<div class="iep-decide quiet"><span class="ic" aria-hidden="true">·</span><span>'
        +esc(DTx("Four data points is where the rules start reading — you have ","Las reglas empiezan a leer con cuatro datos — tienes ")+pts.length+".")+'</span></div>';
    return "";
  }

  function archRow(st,id){
    var g=st.goals[id]; var A=AREAS[g.area]||AREAS.other;
    return '<div class="iep-cardhead" style="margin:8px 0;">'
      +'<span class="iep-chip" style="background:'+A.c+'">'+esc(DTx(A.en,A.es))+'</span>'
      +'<span class="iep-title">'+esc(g.student)+' · '+esc(g.title)+'</span>'
      +'<button type="button" class="iep-mini" onclick="aogIepArch(\''+id+'\',false)">'+DTx("Unarchive","Desarchivar")+'</button>'
      +'<button type="button" class="iep-mini danger" onclick="aogIepDel(\''+id+'\')">'+DTx("Delete","Eliminar")+'</button></div>';
  }

  /* "9 September" / "9 de septiembre" — the date said the way a person says it. */
  function repDateWords(iso,es){
    try{
      var p=String(iso||"").split("-");
      if(p.length!==3) return String(iso||"");
      var d=new Date(Date.UTC(+p[0],+p[1]-1,+p[2]));
      return d.toLocaleDateString(es?"es":"en",{month:"long",day:"numeric",timeZone:"UTC"});
    }catch(e){ return String(iso||""); }
  }
  /* The countdown, and it does not scold when the date has gone by — a date
     that has passed is a fact, and the person reading it already knows. */
  function repWhen(w,es){
    if(w.inDays===null) return "";
    if(w.inDays>1)  return es?(" — en "+w.inDays+" días."):(" — "+w.inDays+" days away.");
    if(w.inDays===1)return es?(" — mañana."):(" — tomorrow.");
    if(w.inDays===0)return es?(" — hoy."):(" — today.");
    return es?".":".";
  }
  /* ═══════ WHAT CHANGED SINCE THE LAST REPORT · item 5 of the August handoff
     The reporting window existed as a concept and the diff across it did not:
     progress reports were written by reading a chart and remembering. This is
     that diff, per goal, as a LIST a case manager reads down while writing —
     never a paragraph the app drafts for them.
     ⚠ COUNTS AND DATES A PERSON CAN CHECK AGAINST THE CHART. The signal words
     are the four the cards already use; the period's start and today are shown
     SIDE BY SIDE as two facts, and naming the difference between them would be
     a third thing that is not a fact. Nothing here may read aloud in a hearing
     as the app's opinion of a child.
     ⚠ AND IT NEVER GUESSES. No report date set → no panel, the same contract
     aogIepReportWindow keeps everywhere. "Since the last report" means the
     start of the current reporting period — one date for the caseload, from
     the district calendar the teacher already typed.
     ⚠ SCREEN ONLY, AND THE CSS HIDES IT FROM PRINT. This is a tool for the
     person writing; the report the reader receives is the one they wrote. */
  function chgDayIso(n){ try{ return new Date(n*86400000).toISOString().slice(0,10); }catch(e){ return ""; } }
  function changesHTML(st,ids){
    var t=todayDayNum();
    var w=aogIepReportWindow(st.report,t);
    if(!w.set||!ids.length||!isFinite(t)||!isFinite(w.fromDay)) return "";
    var es=(DTx("en","es")==="es");
    var fromIso=chgDayIso(w.fromDay);
    function chip(k){ var dd=IEP_SIG[k]||IEP_SIG.more;
      return '<span class="iep-tally '+dd.cls+'"><span class="ic" aria-hidden="true">'+dd.ic+'</span>'+esc(sigWord(k))+'</span>'; }
    var rows=ids.map(function(id){
      var g=st.goals[id]; if(!g) return "";
      var pts=(st.data[id]||[]).slice().sort(byDate);
      var sp=aogIepPeriodSplit(g,pts);
      var inWin=pts.filter(function(p){ var d=aogIepDayNum(p&&p.date); return d>w.fromDay&&d<=t; });
      var team=inWin.filter(function(p){ return p&&p.src==="team"; }).length;
      var before=sp.used.filter(function(p){ return aogIepDayNum(p.date)<=w.fromDay; });
      var sgA=aogIepSignal(g,before,w.fromDay);
      var sgB=aogIepSignal(g,sp.used,t);
      var li=[];
      li.push(esc(inWin.length
        ? (es?(inWin.length+(inWin.length===1?" medición añadida en este período":" mediciones añadidas en este período")+(team?(" — "+team+" del registro de apoyo"):"")+".")
             :(inWin.length+(inWin.length===1?" measurement added this period":" measurements added this period")+(team?(" — "+team+" from the team check-in"):"")+"."))
        : (es?"Ninguna medición en este período.":"No measurements this period.")));
      li.push(esc(es?"Señal al inicio del período: ":"Signal at the period's start: ")+chip(sgA.k)
        +esc(es?" · ahora: ":" · now: ")+chip(sgB.k));
      inWin.forEach(function(p){
        if(p&&p.bench) li.push(esc((es?"Punto de referencia ":"Benchmark ")+p.bench+" — "
          +p.value+(p.total!=null?(" / "+p.total):"")+" · "+fdateStr(p.date)+"."));
      });
      if(inWin.length){
        var days=[w.fromDay].concat(inWin.map(function(p){ return aogIepDayNum(p.date); }).sort(function(a,b){ return a-b; })).concat([t]);
        var gap=0; for(var i=1;i<days.length;i++){ if(days[i]-days[i-1]>gap) gap=days[i]-days[i-1]; }
        li.push(esc(es?("Tramo más largo sin medición: "+gap+(gap===1?" día.":" días."))
                      :("Longest stretch without a measurement: "+gap+(gap===1?" day.":" days."))));
      }
      return '<div class="iep-chg-g"><span class="iep-chg-t">'+esc(g.title||"")+'</span>'
        +'<ul class="iep-chg-l">'+li.map(function(x){ return "<li>"+x+"</li>"; }).join("")+'</ul></div>';
    }).join("");
    if(!rows) return "";
    return '<details class="iep-chg"><summary>'
      +esc((es?"Qué cambió desde el ":"What changed since ")+repDateWords(fromIso,es)
      +(es?" — el inicio de este período de informes":" — the start of this reporting period"))+'</summary>'
      +rows
      +'<div class="iep-chg-n">'+esc(DTx(
        "Counts and dates to check against each chart while writing — nothing here drafts the report, and nothing is a judgement about a student.",
        "Conteos y fechas para revisar contra cada gráfica mientras escribes — nada de esto redacta el informe y nada es un juicio sobre un estudiante."))+'</div>'
      +'</details>';
  }
  function readyHTML(st,ids,brief){
    var t=new Date(), iso=t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0");
    var tday=aogIepDayNum(iso);
    var w=aogIepReportWindow(st.report,tday);
    var r=aogIepReadiness(st.goals,st.data,ids,tday,w.set?w.windowDays:30);
    if(!r.total) return "";
    var es=(DTx("en","es")==="es"), bits=[];
    /* ⚠ WITH NO DATE SET THIS IS THE SENTENCE THAT SHIPPED, WORD FOR WORD. */
    var head=w.set
      ? (es
        ? ((w.inDays!==null&&w.inDays<0?"El informe de progreso venció el ":"Informe de progreso: ")+repDateWords(w.due,true)+repWhen(w,true)+" "+r.recent+" de "+r.total+" meta"+(r.total===1?"":"s")+" con una medición en este período.")
        : ((w.inDays!==null&&w.inDays<0?"The progress report was due ":"Progress report due ")+repDateWords(w.due,false)+repWhen(w,false)+" "+r.recent+" of "+r.total+" goal"+(r.total===1?"":"s")+" ha"+(r.total===1?"s":"ve")+" a measurement in this reporting period."))
      : (es
        ? ("Antes de una reunión de IEP: "+r.recent+" de "+r.total+" meta"+(r.total===1?"":"s")+" con un dato en los últimos 30 días.")
        : ("Before an IEP meeting: "+r.recent+" of "+r.total+" goal"+(r.total===1?"":"s")+" ha"+(r.total===1?"s":"ve")+" a data point in the last 30 days."));
    /* ⚠ THE BANNER ABOVE ALREADY SAID THE DATE AND THE COUNTDOWN, in bold,
       thirty pixels up. Repeated here it reads as a second deadline rather
       than as this student's share of the first one. When the banner is
       showing, say only what is different about THIS student — and let the
       banner carry the standing note, once. */
    if(w.set&&brief){
      head=(es
        ? (r.recent+" de "+r.total+" meta"+(r.total===1?"":"s")+" con una medición en este período.")
        : (r.recent+" of "+r.total+" goal"+(r.total===1?"":"s")+" ha"+(r.total===1?"s":"ve")+" a measurement in this reporting period."));
    }
    if(r.tooFew) bits.push(es
      ? (r.tooFew+" con menos de cuatro puntos — la regla de cuatro puntos aún no puede opinar.")
      : (r.tooFew+" "+(r.tooFew===1?"goal holds":"goals hold")+" fewer than four points, so the four-point rule cannot speak yet."));
    if(r.noData) bits.push(es
      ? (r.noData+" sin ningún dato todavía.")
      : (r.noData+" "+(r.noData===1?"goal has":"goals have")+" no data at all yet."));
    var clear=(r.recent===r.total&&!r.tooFew&&!r.noData);
    return '<div class="iep-ready'+(clear?" ok":"")+'">'
      +'<span class="iep-ready-h">'+esc(head)+'</span>'
      +(bits.length?('<span class="iep-ready-b">'+esc(bits.join(" "))+'</span>'):'')
      +(brief?"":('<span class="iep-ready-n">'+esc(DTx("A count of what has been recorded — nothing here is a judgement about a student.","Un conteo de lo registrado — nada aquí es un juicio sobre un estudiante."))+'</span>'))
      +'</div>';
  }
  function goalsHTML(st){
    var ids=Object.keys(st.goals);
    if(!ids.length) return '<div class="iep-empty iep-empty-teach">'
      +'<b>'+esc(DTx("No goals are being monitored yet","Aún no se monitorea ninguna meta"))+'</b>'
      +'<span>'+esc(DTx("Add a goal: the student code, what you’re measuring, where the student started and where the goal aims. Each new measurement then shows up against the target line, with a progress signal.",
                        "Agrega una meta: el código del estudiante, qué mides, dónde empezó y hacia dónde apunta la meta. Cada nueva medida aparece contra la línea objetivo, con una señal de progreso."))+'</span>'
      +'<span class="iep-empty-steps">'+esc(DTx("Student code → goal → baseline → target → measurements → meeting.","Código → meta → línea base → meta anual → mediciones → reunión."))+'</span>'
      +'<button type="button" class="iep-btn" onclick="aogIepWizOpen()">'+esc(DTx("Add the first goal","Agregar la primera meta"))+'</button>'
      +'</div>';
    var students={};
    ids.forEach(function(id){ var s=st.goals[id].student||""; (students[s]=students[s]||[]).push(id); });
    var names=Object.keys(students).sort(function(a,b){ return a.localeCompare(b); });
    var f=(ST.filter||"").trim().toLowerCase();
    var show=names.filter(function(n){ return !f||n.toLowerCase().indexOf(f)>=0; });
    if(!show.length) return '<div class="iep-empty">'+esc(DTx("No students match that name.","Ningún estudiante coincide con ese nombre."))+'</div>';
    /* One student at a time. Jimmy, 2026-08-26: reading the fourth goal of the
       third student meant scrolling past two students' charts to get there.
       The tab strip only appears when there is more than one student to switch
       between, so a single-student caseload looks exactly as it always did. */
    /* ⚠ THE TAB BLOCK BELOW REASSIGNS `show` TO THE SELECTED STUDENT — that is
       how one-student-at-a-time works, and it is fine. But anything computed
       AFTER it that claims to be about the whole caseload has to hold its own
       copy, or it counts one student and says "across 2 students". The suite
       caught exactly that; it is the 93/279/310 fault in miniature. */
    var showAll=show.slice();
    var tabs="";
    if(show.length>1){
      /* Student-in-focus (audit P1): a student just opened elsewhere — their
         report, their line over time — defaults this strip, but only when the
         focus is fresher than the last tab this door's own user picked, and
         only when that student actually has goals here. The strip stays fully
         drawn; one click undoes it. */
      try{
        var fcI=window.AOGFocus?AOGFocus.get():null;
        if(fcI&&students[fcI.code]&&fcI.at>(ST.pickedAt||0)){ ST.student=fcI.code; ST.pickedAt=fcI.at; }
      }catch(eF){}
      var sel=ST.student;
      if(sel!=="ALL"&&show.indexOf(sel)<0) sel=show[0];
      tabs='<div class="iep-tabs" role="tablist" aria-label="'+esc(DTx("Students","Estudiantes"))+'">'
        +show.map(function(n){
          var act2=students[n].filter(function(id){ return !st.goals[id].archived; });
          /* ⚠ THIS STRIP IS THE ONLY SCREEN THAT ANSWERS "WHICH OF MY STUDENTS
             NEED ME", AND IT COUNTED ONE THING. A goal nobody has measured in
             three weeks contributed nothing to it, so a student with no data at
             all looked exactly like a student who was fine. Two different kinds
             of silence, one blank tab. */
          var need=0, hush=0, unst=0, tday2=todayDayNum();
          act2.forEach(function(id){
            var ps=aogIepPeriodSplit(st.goals[id],(st.data[id]||[]).slice().sort(byDate)).used;
            var sg2=aogIepSignal(st.goals[id],ps,tday2);
            if(sg2.k==="attention") need++;
            if(sg2.unstarted) unst++; else if(sg2.quiet) hush++;
          });
          /* Named apart, because the fix is different: one goal needs measuring
             again, the other has never been started. */
          var hparts=[];
          if(hush) hparts.push(DTx(hush+(hush===1?" goal has gone quiet":" goals have gone quiet")+" — "+AOG_IEP_QUIET_DAYS+" days or more since the last measurement",
                                   hush+(hush===1?" meta lleva tiempo en silencio":" metas llevan tiempo en silencio")+" — "+AOG_IEP_QUIET_DAYS+" días o más desde la última medición"));
          if(unst) hparts.push(DTx(unst+(unst===1?" goal has no measurements yet":" goals have no measurements yet"),
                                   unst+(unst===1?" meta aún no tiene mediciones":" metas aún no tienen mediciones")));
          var hlab=hparts.join(" · ");
          return '<button type="button" class="iep-tab" role="tab" aria-selected="'+(sel===n?"true":"false")+'" onclick="aogIepTab('+attrJs(n)+')">'
            +esc(n||DTx("(unnamed)","(sin nombre)"))+'<span class="n">'+act2.length+'</span>'
            +(need?('<span class="fu" title="'+esc(DTx(need+(need===1?" goal needs attention":" goals need attention")+" — four in a row below the aimline",need+(need===1?" meta necesita atención":" metas necesitan atención")+" — cuatro seguidos por debajo de la línea objetivo"))+'" aria-label="'+esc(DTx(need+(need===1?" goal needs attention":" goals need attention"),need+(need===1?" meta necesita atención":" metas necesitan atención")))+'">▼</span>'):'')
            /* ⚠ A DIFFERENT GLYPH, NOT A DIFFERENT COLOR. The rule this panel
               already keeps: color is never the information. And it inherits
               the tab's own ink rather than taking a lighter one — --ink-faint
               measures 3.08:1 on this background at this size. */
            +((hush+unst)?('<span class="hush" title="'+esc(hlab)+'" aria-label="'+esc(hlab)+'">\u25CC</span>'):'')
            +'</button>';
        }).join("")
        +'<button type="button" class="iep-tab" role="tab" aria-selected="'+(sel==="ALL"?"true":"false")+'" onclick="aogIepTab(\'ALL\')">'+esc(DTx("All","Todos"))+'</button>'
        +'<span class="iep-tabnote">'+esc(DTx("one student at a time","un estudiante a la vez"))+'</span>'
        +'</div>';
      if(sel!=="ALL") show=[sel];
    }
    /* ⚠ THE ONE SENTENCE A CASE MANAGER OPENS THIS DOOR FOR. readyHTML says
       this per student, INSIDE each student's block, below the tab strip — so
       learning which of eighteen students you cannot write about meant
       clicking eighteen tabs. This says it once, across everyone shown.

       It appears only when there is a report date AND more than one student:
       with one student readyHTML sits ten pixels below saying the same thing,
       and a sentence printed twice is the fault this project keeps catching. */
    var banner="";
    if(tabs){
      var tdayB=todayDayNum();
      var wB=aogIepReportWindow(st.report,tdayB);
      if(wB.set){
        var allIds=[]; showAll.forEach(function(n2){ students[n2].forEach(function(id){ if(!st.goals[id].archived) allIds.push(id); }); });
        var rB=aogIepReadiness(st.goals,st.data,allIds,tdayB,wB.windowDays);
        var hushB=0, unstB=0;
        allIds.forEach(function(id){
          var sgB=aogIepSignal(st.goals[id],aogIepPeriodSplit(st.goals[id],(st.data[id]||[]).slice().sort(byDate)).used,tdayB);
          if(sgB.unstarted) unstB++; else if(sgB.quiet) hushB++;
        });
        var esB=(DTx("en","es")==="es");
        var headB=(esB
          ? ((wB.inDays!==null&&wB.inDays<0?"El informe de progreso venció el ":"Informe de progreso: ")+repDateWords(wB.due,true)+repWhen(wB,true))
          : ((wB.inDays!==null&&wB.inDays<0?"The progress report was due ":"Progress report due ")+repDateWords(wB.due,false)+repWhen(wB,false)));
        var bodyB=(esB
          ? (rB.recent+" de "+rB.total+" meta"+(rB.total===1?"":"s")+" de "+showAll.length+" estudiante"+(showAll.length===1?"":"s")+" con una medición en este período.")
          : (rB.recent+" of "+rB.total+" goal"+(rB.total===1?"":"s")+" across "+showAll.length+" student"+(showAll.length===1?"":"s")+" ha"+(rB.total===1?"s":"ve")+" a measurement in this reporting period."));
        var missB=[];
        if(unstB) missB.push(esB?(unstB+(unstB===1?" meta aún no tiene mediciones":" metas aún no tienen mediciones")):(unstB+(unstB===1?" goal has no measurements yet":" goals have no measurements yet")));
        if(hushB) missB.push(esB?(hushB+(hushB===1?" lleva":" llevan")+" "+AOG_IEP_QUIET_DAYS+" días o más en silencio"):(hushB+(hushB===1?" has":" have")+" gone quiet for "+AOG_IEP_QUIET_DAYS+" days or more"));
        banner='<div class="iep-ready iep-report'+((rB.recent===rB.total&&!unstB&&!hushB)?" ok":"")+'">'
          +'<span class="iep-ready-h">'+esc(headB)+'</span>'
          +'<span class="iep-ready-b">'+esc(bodyB+(missB.length?(" "+missB.join(" · ")+"."):""))+'</span>'
          /* ⚠ THE SAME STANDING NOTE readyHTML CARRIES. It counts records, and
             it counts goals — never people, and never who owes anybody data. */
          +'<span class="iep-ready-n">'+esc(DTx("A count of what has been recorded — nothing here is a judgement about a student.","Un conteo de lo registrado — nada aquí es un juicio sobre un estudiante."))+'</span>'
          +'</div>';
      }
    }
    return banner+tabs+show.map(function(n){
      var gids=students[n];
      var act=gids.filter(function(id){ return !st.goals[id].archived; });
      var arch=gids.filter(function(id){ return st.goals[id].archived; });
      /* THE TWENTY-SECOND ANSWER. Not "1 on track" out of four — the whole
         shape of the caseload in one line, in the same four words the cards
         use, each with its own mark so color is never carrying it. */
      var tally={on:0,watch:0,attention:0,more:0}, tday=todayDayNum();
      act.forEach(function(id){
        var sgp=aogIepPeriodSplit(st.goals[id],(st.data[id]||[]).slice().sort(byDate));
        tally[aogIepSignal(st.goals[id],sgp.used,tday).k]++;
      });
      var tallyHTML=["on","watch","attention","more"].filter(function(k){ return tally[k]>0; }).map(function(k){
        var dd=IEP_SIG[k];
        return '<span class="iep-tally '+dd.cls+'"><span class="ic" aria-hidden="true">'+dd.ic+'</span>'+tally[k]+' '+esc(sigWord(k).toLowerCase())+'</span>';
      }).join("");
      var h=readyHTML(st,act,!!banner)+'<div class="iep-student-h">'+esc(n||DTx("(unnamed)","(sin nombre)"))
        +'<span class="iep-sum">'+act.length+' '+(act.length===1?DTx("goal","meta"):DTx("goals","metas"))+'</span>'
        +(act.length?('<span class="iep-tallies">'+tallyHTML+'</span>'):'')
        +(act.length?('<button type="button" class="iep-mini primary" onclick="aogIepMeeting('+attrJs(n)+')">'+DTx("Meeting view","Vista de reunión")+'</button>'):'')
        /* "Print report" (aogIepPrint) stood here until Jimmy crossed it out —
           two print buttons on one row, and Print / Share is the one whose
           packet he loves. aogIepPrint itself stays defined for the console. */
        /* ⚠ PLAIN MARKUP AND A DATA ATTRIBUTE, not an onclick into another
           module: #aogIepBody is re-rendered on every keystroke in the filter
           box, and the handoff layer loads after this one. Its delegated
           listener finds the attribute whenever it arrives. */
        +(act.length?('<button type="button" class="iep-mini" data-hdshare="iep:student" data-hdarg="'+esc(n)+'">'+DTx("Print / Share","Imprimir / Compartir")+'</button>'):'')
        +(act.length>1?('<button type="button" class="iep-mini" onclick="aogIepCardsAll('+attrJs(n)+',1)">'+DTx("Collapse all","Cerrar todas")+'</button>'
          +'<button type="button" class="iep-mini" onclick="aogIepCardsAll('+attrJs(n)+',0)">'+DTx("Expand all","Abrir todas")+'</button>'):'')
        +'</div>';
      if(act.length) h+=changesHTML(st,act);
      h+=act.map(function(id){ return cardHTML(st,id); }).join("");
      if(arch.length){
        h+='<details class="iep-arch"><summary>'+esc(DTx("Archived goals","Metas archivadas"))+' ('+arch.length+')</summary>'
          +arch.map(function(id){ return archRow(st,id); }).join("")+'</details>';
      }
      return h;
    }).join("");
  }

  /* #aogIepBody survives every render (only its innerHTML is replaced), so the
     hover layer is wired to it ONCE. Per-point handlers would be re-attached on
     every keystroke in the filter box. */
  var TIP=null;
  function tipEl(){
    if(TIP&&TIP.parentNode) return TIP;
    TIP=document.createElement("div");
    TIP.id="aogIepTip";
    TIP.setAttribute("role","status");
    TIP.style.cssText="position:fixed;z-index:9999;pointer-events:none;opacity:0;transition:opacity .09s;"
      +"max-width:260px;font:600 12.5px/1.45 -apple-system,Segoe UI,Inter,system-ui,sans-serif;"
      +"color:#FBF8F1;background:#0A1E33;border-radius:9px;padding:7px 10px;box-shadow:0 6px 18px rgba(10,30,51,.28);";
    document.body.appendChild(TIP);
    return TIP;
  }
  function tipShow(el){
    var txt=el.getAttribute("data-tip"); if(!txt) return;
    var t=tipEl(); t.textContent=txt; t.style.opacity="1";
    var r=el.getBoundingClientRect(), tr=t.getBoundingClientRect();
    var x=r.left+r.width/2-tr.width/2, y=r.top-tr.height-9;
    if(y<6) y=r.bottom+9;
    t.style.left=Math.max(6,Math.min(x,window.innerWidth-tr.width-6))+"px";
    t.style.top=y+"px";
  }
  function tipHide(){ if(TIP) TIP.style.opacity="0"; }
  /* Enter anywhere in a goal's entry row records the point. Typing a number
     and reaching for the mouse is the slowest part of the daily act. */
  function wireEnter(host){
    if(!host||host.__aogIepEnter||typeof host.addEventListener!=="function") return;
    host.__aogIepEnter=1;
    host.addEventListener("keydown",function(e){
      if(!e||e.key!=="Enter"||e.shiftKey||e.altKey||e.ctrlKey||e.metaKey) return;
      var n=e.target; if(!n||!n.id) return;
      var m=String(n.id).match(/^iep[DVETN]_(.+)$/); if(!m) return;
      var row=n.parentNode;
      if(!row||!row.classList||!row.classList.contains("iep-entry")) return;
      e.preventDefault();
      try{ window.aogIepAdd(m[1]); }catch(eA){}
    });
  }
  function wireTips(host){
    if(!host||host.__aogIepTips||typeof host.addEventListener!=="function") return;
    host.__aogIepTips=1;
    function hit(e){ var n=e.target; return (n&&n.classList&&n.classList.contains("iep-hot"))?n:null; }
    host.addEventListener("mouseover",function(e){ var n=hit(e); if(n) tipShow(n); },true);
    host.addEventListener("mouseout",function(e){ if(hit(e)) tipHide(); },true);
    host.addEventListener("focusin",function(e){ var n=hit(e); if(n) tipShow(n); },true);
    host.addEventListener("focusout",function(e){ if(hit(e)) tipHide(); },true);
    try{ if(typeof window.addEventListener==="function") window.addEventListener("scroll",tipHide,true); }catch(e){}
  }

  function render(){
    var host=document.getElementById("aogIepBody"); if(!host) return;
    /* .30cy — a repaint rebuilds the entry rows, so any in-flight point edit
       is visually gone; the state must go with it or a later Add would
       silently overwrite the wrong point. */
    ST.editPt=null;
    var wizTop=null, wizFocusId=null, wizSelStart=null;
    try{
      var oldBox=document.getElementById("iepFormBox");
      if(oldBox){
        wizTop=oldBox.scrollTop;
        var ae=document.activeElement;
        if(ae&&ae.id&&oldBox.contains(ae)){
          wizFocusId=ae.id;
          try{ wizSelStart=(ae.selectionStart==null?null:ae.selectionStart); }catch(eS){}
        }
      }
    }catch(eW){}
    ensureSticky(host);
    wireTips(host);
    wireEnter(host);
    var st=load();
    var names={}; Object.keys(st.goals).forEach(function(id){ names[st.goals[id].student||""]=1; });
    /* THE CODES THE EVIDENCE IS ALREADY USING BELONG IN THIS LIST. Until .29aw
       it was built from the goals alone, so the one control that could have
       stopped a case manager typing a code no stream would ever match offered
       only the codes that were already right. Fail open: no resolver, no change.
       ⚠ It feeds #iepWStudent AND #iepFilter. Filtering by a student who has no
       goal yet correctly finds none - that is the list telling the truth.
       [[aog-the-seam]] */
    try{ (window.AOGStudent.codes()||[]).forEach(function(c){ names[c]=1; }); }catch(eSid){}
    var opts=Object.keys(names).filter(function(n){ return n; }).sort().map(function(n){ return '<option value="'+esc(n)+'"></option>'; }).join("");
    var h='<div class="iep-wrap">';
    h+='<div class="iep-privacy">'+esc(DTx("Use initials or a student code, never a full name. Everything stays on this device.","Usa iniciales o un código de estudiante, nunca un nombre completo. Todo se queda en este dispositivo."))+'</div>';
    h+='<div class="iep-controls">'
      +'<input id="iepFilter" class="iep-search" type="search" list="iepStudentsList" value="'+esc(ST.filter)+'" placeholder="'+esc(DTx("Filter by student…","Filtrar por estudiante…"))+'" aria-label="'+esc(DTx("Filter by student","Filtrar por estudiante"))+'" oninput="aogIepFilter(this.value)">'
      +'<datalist id="iepStudentsList">'+opts+'</datalist>'
      +'<button type="button" id="iepAddGoalBtn" class="iep-btn gold" onclick="aogIepWizOpen()">'+DTx("+ Add a goal","+ Agregar una meta")+'</button>'
      /* ⚠ IN THE CONTROLS ROW, NOT IN THE GOAL WIZARD. The wizard has two
         documented re-render invariants (scroll position and focus) that a new
         field would have to be threaded through; this row is plain markup and
         is NOT re-rendered on a filter keystroke — aogIepFilter repaints only
         #iepGoalsHost — so the date input never loses focus mid-edit.
         The period length appears only once a date exists: one control until
         it is worth two. */
      +'<div class="iep-repwrap">'
      +'<label class="iep-repl" for="iepReportDue">'+esc(DTx("Next progress report","Próximo informe de progreso"))+'</label>'
      +'<span class="iep-reprow">'
      +'<input type="date" id="iepReportDue" class="iep-repd" value="'+esc((st.report&&st.report.due)||"")+'" onchange="aogIepReportSet(this.value)">'
      +((st.report&&st.report.due)?('<select id="iepReportWeeks" class="iep-repw" aria-label="'+esc(DTx("Length of the reporting period","Duración del período de informe"))+'" onchange="aogIepReportWeeks(this.value)">'
          +[6,9,12,18].map(function(wk){ return '<option value="'+wk+'"'+((parseInt((st.report&&st.report.weeks)||9,10)===wk)?" selected":"")+">"+wk+" "+esc(DTx("weeks","semanas"))+"</option>"; }).join("")
          +'</select>'):'')
      +'</span></div>'
      +'</div>';
    if(ST.formOpen) h+=wizHTML();
    h+='<div id="iepGoalsHost">'+goalsHTML(st)+'</div></div>';
    host.innerHTML=h;
    try{ if(document.body&&document.body.style) document.body.style.overflow=(ST.formOpen?"hidden":""); }catch(eb){}
    try{
      var newBox=document.getElementById("iepFormBox");
      if(newBox){
        /* Setting scrollTop the instant after innerHTML can be clamped to 0 —
           the new content has not been laid out yet. Set it, then set it again
           on the next frame, when scrollHeight is real. */
        if(wizTop!=null){
          newBox.scrollTop=wizTop;
          (function(bx,tp){
            var again=function(){ try{ if(bx&&bx.isConnected!==false) bx.scrollTop=tp; }catch(e){} };
            if(typeof requestAnimationFrame==="function") requestAnimationFrame(again); else setTimeout(again,0);
          })(newBox,wizTop);
        }
        if(wizFocusId){
          var back=document.getElementById(wizFocusId);
          if(back&&back.focus){
            back.focus();
            try{ if(wizSelStart!=null&&back.setSelectionRange) back.setSelectionRange(wizSelStart,wizSelStart); }catch(eR){}
          }
        }
      }
    }catch(eW2){}
    if(ST.formOpen&&ST.wizFocus){ ST.wizFocus=false; try{ var fbx=document.getElementById("iepFormBox"); var fin=(fbx&&fbx.querySelector)?fbx.querySelector("input,select,textarea"):null; if(fin&&fin.focus) fin.focus(); }catch(ef){} }
    if(ST.formOpen){ try{ var wfb=document.getElementById("iepFormBox"), whd=document.getElementById("iepWizHead"); if(wfb&&whd&&whd.classList){ wfb.onscroll=function(){ try{ whd.classList.toggle("stuck",wfb.scrollTop>2); }catch(e4){} }; } }catch(e5){} }
    try{ var tbtn=document.getElementById("aoggTrackIep"); if(tbtn) tbtn.textContent=DTx("Track in IEP Progress →","Seguir en Progreso IEP →"); }catch(e){}
    /* A carried-over IEP goal is long. Open the box at the size of what is
       already in it rather than making a teacher scroll a three-row window. */
    try{ var tta=document.getElementById("iepWTitle"); if(tta) aogIepFitTitle(tta); }catch(e){}
  }
  document.addEventListener("toggle",function(ev){
    var n=ev.target;
    if(!n||!n.getAttribute) return;
    var gid=n.getAttribute("data-iepcfold");
    if(!gid) return;
    if(n.open) delete ST.chartClosed[gid]; else ST.chartClosed[gid]=1;
    try{ localStorage.setItem(CFOLD_KEY,JSON.stringify(ST.chartClosed)); }catch(e){}
  },true);
  function stickyView(){ try{ return localStorage.getItem("aog.iep.view")==="pw"?"pw":"goals"; }catch(e){ return "goals"; } }
  function stickyHTML(){
    var v=stickyView();
    return '<span class="iep-sticky-t">'+esc(DTx("IEP Progress","Progreso IEP"))+'</span><span class="iep-sticky-sp"></span>'
      +'<button type="button" class="iep-sticky-lnk" onclick="aogIepScrollTabs()">'+esc(DTx("↑ Dashboard tabs","↑ Pestañas del panel"))+'</button>'
      +'<button type="button" class="iep-sticky-pill" aria-pressed="'+(v!=="pw"?"true":"false")+'" onclick="aogIepStickyView(\'goals\')">'+esc(DTx("Progress","Progreso"))+'</button>'
      +'<button type="button" class="iep-sticky-pill" aria-pressed="'+(v==="pw"?"true":"false")+'" onclick="aogIepStickyView(\'pw\')">'+esc(DTx("Paperwork","Documentos"))+'</button>';
  }
  function ensureSticky(host){
    try{
      var bar=document.getElementById("aogIepStickyBar");
      if(!bar){
        bar=document.createElement("div");
        bar.id="aogIepStickyBar";
        if(bar.setAttribute) bar.setAttribute("id","aogIepStickyBar");
        bar.className="iep-stickybar";
        if(host.parentNode&&host.parentNode.insertBefore) host.parentNode.insertBefore(bar,host.parentNode.firstChild||host);
        if(typeof MutationObserver!=="undefined"){
          try{ new MutationObserver(function(){ try{ bar.innerHTML=stickyHTML(); }catch(e2){} }).observe(host,{attributes:true,attributeFilter:["style"]}); }catch(e3){}
        }
      }
      bar.innerHTML=stickyHTML();
    }catch(e){}
  }
  function stickyOnScroll(){
    try{
      var bar=document.getElementById("aogIepStickyBar");
      if(!bar||!bar.getBoundingClientRect||!bar.classList) return;
      var stuck=bar.getBoundingClientRect().top<=0&&(window.scrollY||window.pageYOffset||0)>0;
      bar.classList.toggle("stuck",!!stuck);
    }catch(e){}
  }
  window.aogIepScrollTabs=function(){
    try{
      var t=document.querySelector('#screen-admin .tabs')||document.querySelector('.tabs');
      if(t&&t.scrollIntoView){
        var rm=false; try{ rm=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches); }catch(e2){}
        t.scrollIntoView(rm?{block:"start"}:{behavior:"smooth",block:"start"});
      }
    }catch(e){}
  };
  window.aogIepStickyView=function(v){
    try{ if(typeof window.aogIepPwView==="function"){ window.aogIepPwView(v==="pw"?"pw":"goals"); } else { try{ localStorage.setItem("aog.iep.view",v==="pw"?"pw":"goals"); }catch(e2){} } }catch(e){}
    try{ var bar=document.getElementById("aogIepStickyBar"); if(bar) bar.innerHTML=stickyHTML(); }catch(e3){}
  };
  window.aogRenderIep=render;

  window.aogIepFilter=function(v,full){ ST.filter=v||""; if(full===true){ render(); return; } var gh=document.getElementById("iepGoalsHost"); if(gh) gh.innerHTML=goalsHTML(load()); };
  /* ⚠ ONE DATE, STORED BESIDE THE GOALS AND NOT INSIDE ONE. load() preserves
     unknown top-level keys and save() writes the whole object, so `report`
     rides in the backup and comes back through Restore with no extra wiring —
     and it is not keyed by goal id, so the per-goal delete has nothing to do.
     Clearing the field removes it entirely rather than storing an empty date. */
  window.aogIepReportSet=function(v){
    var st=load();
    v=String(v||"").trim();
    if(!v){ delete st.report; }
    else { st.report=st.report||{}; st.report.due=v; if(!st.report.weeks) st.report.weeks=9; }
    save(st); render();
  };
  window.aogIepReportWeeks=function(v){
    var st=load(); if(!st.report||!st.report.due) return;
    var w=parseInt(v,10); if(!isFinite(w)||w<1||w>52) w=9;
    st.report.weeks=w; save(st); render();
  };
  window.aogIepWizOpen=function(){ if(!(ST.formOpen&&!ST.editId&&WZ)) openWiz(null); ST.wizFocus=true; render(); };
  /* AOG-IEP-PICK-V1 — start a goal already filled in with a student's code (the student menu uses this) */
  window.aogIepWizFor=function(stu){ openWiz({student:String(stu||"")}); ST.wizFocus=true; render(); };
  window.aogIepToggleForm=function(){ if(ST.formOpen){ window.aogIepCancel(); } else { window.aogIepWizOpen(); } };
  window.aogIepWizDismiss=function(kind){
    var c=aogIepWizCloseKind(kind||"cancel"); if(!c.close) return;
    if(!c.keepDraft&&!ST.editId) wizClearDraft();
    ST.formOpen=false; ST.editId=null; ST.prefill=null; ST.wizErr=null;
    render();
    try{ var b=document.getElementById("iepAddGoalBtn"); if(b&&b.focus) b.focus(); }catch(e){}
  };
  window.aogIepCancel=function(){ window.aogIepWizDismiss("cancel"); };
  window.aogIepWizOvlClick=function(ev){ try{ var t=ev&&(ev.target||ev.srcElement); if(t&&t.id==="iepWizOvl") window.aogIepWizDismiss("backdrop"); }catch(e){} };
  window.aogIepEdit=function(id){ var st=load(); if(!st.goals[id]) return; ST.editId=id; ST.prefill=null; ST.hintId=null; ST.wizErr=null; ST.wizFocus=true; WZ=aogIepWizFromGoal(st.goals[id]); ST.formOpen=true; render(); };
  /* Grow the goal box to fit what is in it, up to a sensible ceiling. An IEP
     goal carried over from a district system runs several hundred characters;
     the field was a single-line input capped at 160, which made finishing one
     impossible rather than merely awkward. Ceiling, not cap: the text is never
     truncated, the box just stops growing and scrolls. */
  window.aogIepFitTitle=function(ta){
    try{
      if(!ta) return;
      ta.style.height="auto";
      ta.style.height=Math.max(78, Math.min(ta.scrollHeight + 2, 340))+"px";
    }catch(e){}
  };

  window.aogIepWizInput=function(k,v){
    if(!WZ) return;
    if(k==="unit") WZ.unitTouched=true;
    if(Object.prototype.hasOwnProperty.call(WZ,k)) WZ[k]=v;
    if(k==="student"&&!ST.editId&&!WZ.gradeTouched){
      try{
        var pg=aogIepGradeForStudent(load().goals,v);
        if(pg){ WZ.grade=pg; WZ.gradeAuto=true; }
        else if(WZ.gradeAuto){ WZ.grade=""; WZ.gradeAuto=false; }
        try{ var ge=document.getElementById("iepWGrade"); if(ge) ge.value=WZ.grade; }catch(eG2){}
      }catch(eG){}
    }
    wizSaveDraft();
    if(k==="title"){ try{ var bw=document.getElementById("iepWBank"); if(bw&&bw.classList) bw.classList.toggle("dim",aogIepWizBankDim(WZ)); }catch(eT){} }
    if(k==="title"||k==="bval"||k==="tval"||k==="tdate"||k==="bdate"){ try{ window.aogIepGcRefresh(); }catch(eG3){} }
  };
  window.aogIepOrfRefresh=function(){ try{ var bx=document.getElementById("iepWOrf"); if(bx) bx.innerHTML=wizOrfHint(WZ); }catch(e){} };
  window.aogIepGcRefresh=function(){
    try{
      var box=document.getElementById("iepWGcheck"); if(!box) return;
      box.innerHTML=wizGoalCheckHTML(WZ);
    }catch(e){}
  };
  window.aogIepWizXY=function(w,part,v){
    if(!WZ) return;
    WZ[w+part]=String(v==null?"":v);
    var p=aogIepWizXofY(WZ[w+"num"],WZ[w+"den"]);
    if(p!=null) WZ[(w==="b")?"bval":"tval"]=String(p);
    wizSaveDraft();
    try{
      var o=document.getElementById("iepWXY_"+w);
      if(o) o.textContent=(p==null?"":("= "+p+"%"));
    }catch(e){}
    try{ if(typeof window.aogIepOrfRefresh==="function") window.aogIepOrfRefresh(); }catch(e2){}
    try{ if(typeof window.aogIepGcRefresh==="function") window.aogIepGcRefresh(); }catch(e3){}
  };
  window.aogIepWizFillGoal=function(){
    if(!WZ) return;
    var t=aogIepGoalFill(WZ.title,{measure:WZ.measure,value:WZ.tval,xn:WZ.tnum,xd:WZ.tden});
    if(t===WZ.title) return;
    WZ.title=t; WZ.bankSel=""; wizSaveDraft(); render();
  };
  window.aogIepWizAddTime=function(){
    if(!WZ||!WZ.tdate) return;
    var when=aogIepMonthYear(WZ.tdate,DTx(false,true));
    var t=String(WZ.title||"").trim(); if(!t) return;
    WZ.title=(DTx("By ","Para ")+when+", "+aogIepGoalLowerFirst(aogIepGoalStripLead(t)));
    WZ.bankSel=""; wizSaveDraft(); render();
  };
  window.aogIepWizJump=function(n){
    try{
      var el=document.getElementById("iepWSec"+n); if(!el||!el.scrollIntoView) return;
      var rm=false; try{ rm=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches); }catch(e2){}
      el.scrollIntoView(rm?{block:"start"}:{behavior:"smooth",block:"start"});
    }catch(e){}
  };
  window.aogIepWizBank=function(i){ if(!WZ) return; aogIepWizBankPick(WZ,WZ.area,i); wizSaveDraft(); render(); };
    /* ---- Read this goal: the panel, and the four things it can hand over ---- */
  var RG=null, RGOPEN=false;
  function rgLabel(c){
    if(c.kind==="ratio") return (c.allOf?(c.xn+" of "+c.xn):(c.xn+" of "+c.xd))+" "+c.noun
      +" · "+DTx("scored as ","se califica como ")+r1(c.pct)+"%";
    if(c.kind==="percentile") return DTx("the ","el ")+r1(c.value)+DTx("th percentile"," percentil")
      +" · "+DTx("as a percent","como porcentaje");
    if(c.kind==="wcpm") return r1(c.value)+" "+DTx("words correct per minute","palabras correctas por minuto");
    if(c.kind==="percent") return r1(c.value)+"% · "+DTx("as a percent","como porcentaje");
    if(c.kind==="cap") return DTx("no more than ","no más de ")+r1(c.value)+" "+c.unit
      +" · "+DTx("a count, lower is better","un conteo, menor es mejor");
    if(c.kind==="duration") return r1(c.value)+" "+DTx("minutes","minutos");
    if(c.kind==="latency") return r1(c.value)+" "+DTx("seconds to start","segundos para empezar");
    if(c.kind==="score") return DTx("a score of ","un puntaje de ")+r1(c.value)+" · "+DTx("a count","un conteo");
    return String(c.value);
  }
  function wizReadHTML(d){
    var hasTitle=!!String((d&&d.title)||"").trim();
    if(!hasTitle) return "";
    if(!RGOPEN||!RG){
      return '<div class="iep-wread"><button type="button" class="iep-mini iep-readbtn" onclick="aogIepGoalRead()">'
        +esc(DTx("Read this goal →","Leer esta meta →"))+'</button>'
        +'<span class="iep-whelp">'+esc(DTx("Pull the numbers out of the sentence you just wrote.",
                                            "Extrae los números de la oración que acabas de escribir."))+'</span></div>';
    }
    var s='<div class="iep-wread open"><div class="rg-head">'+esc(DTx("What is this goal scored on?","¿Cómo se califica esta meta?"))+'</div>';
    if(!RG.cands.length){
      s+='<p class="rg-p">'+esc(DTx("No number in this sentence looks like a criterion. Fill the fields below by hand.",
                                    "Ningún número de esta oración parece un criterio. Completa los campos de abajo a mano."))+'</p>';
    } else {
      s+='<p class="rg-p">'+esc(RG.cands.length===1
          ? DTx("One number reads like a criterion. Take it, or leave it and fill the fields yourself.",
                "Un número parece un criterio. Tómalo, o déjalo y completa los campos tú mismo.")
          : (DTx("This sentence holds ","Esta oración contiene ")+RG.cands.length+DTx(" numbers. Only you know which one progress is measured by."," números. Solo tú sabes con cuál se mide el progreso.")))+'</p>';
      s+='<div class="rg-list">'+RG.cands.map(function(c,i){
        return '<button type="button" class="rg-pick" onclick="aogIepGoalUse('+i+')">'
          +'<b>'+esc(rgLabel(c))+'</b><span>'+esc(DTx("from ","de ")+"“"+c.raw+"”")+'</span></button>';
      }).join("")+'</div>';
    }
    if(RG.when){
      s+='<div class="rg-list"><button type="button" class="rg-pick rg-when" onclick="aogIepGoalUseDate()">'
        +'<b>'+esc(DTx("Target date ","Fecha meta ")+RG.when.iso)+'</b><span>'
        +esc(DTx("from ","de ")+"“"+RG.when.said+"”"
             +(RG.when.monthOnly?DTx(" — the goal names a month, so check the day"," — la meta nombra un mes, revisa el día"):""))
        +'</span></button></div>';
    }
    s+='<p class="rg-foot">'+esc(DTx("The baseline stays yours to enter — a goal sentence says where a student is headed, not where they are. Nothing is saved until you press Save.",
                                     "La línea base sigue siendo tuya — una meta dice a dónde va un estudiante, no dónde está. Nada se guarda hasta que presiones Guardar."))+'</p>'
      +'<button type="button" class="iep-mini" onclick="aogIepGoalReadClose()">'+esc(DTx("Close","Cerrar"))+'</button></div>';
    return s;
  }
  window.aogIepGoalRead=function(){
    if(!WZ) return;
    RG=aogIepReadGoal(WZ.title); RGOPEN=true; render();
  };
  window.aogIepGoalReadClose=function(){ RGOPEN=false; render(); };
  window.aogIepGoalUseDate=function(){
    if(!WZ||!RG||!RG.when) return;
    WZ.tdate=RG.when.iso; wizSaveDraft(); render();
    try{ window.aogIepGcRefresh(); }catch(e){}
  };
  window.aogIepGoalUse=function(i){
    if(!WZ||!RG) return;
    var c=RG.cands[i]; if(!c) return;
    aogIepWizPickMeasure(WZ,c.measure);
    try{ aogIepWizAutoUnit(WZ,c.measure); }catch(e){}
    if(c.kind==="ratio"){
      WZ.tnum=String(c.xn); WZ.tden=String(c.xd);
      var p=aogIepWizXofY(WZ.tnum,WZ.tden);
      if(p!=null) WZ.tval=String(p);
    } else {
      WZ.tval=String(c.value);
      WZ.tnum=""; WZ.tden="";
    }
    if(c.unit&&!WZ.unitTouched) WZ.unit=c.unit;
    if(c.lower&&!WZ.lowerTouched) WZ.lower=true;
    wizSaveDraft(); render();
    try{ window.aogIepGcRefresh(); }catch(e2){}
    try{ window.aogIepOrfRefresh(); }catch(e3){}
  };
  window.aogIepWizSet=function(k,v){ if(!WZ) return; if(k==="grade"){ WZ.grade=aogIepGradeNorm(v); WZ.gradeTouched=true; WZ.gradeAuto=false; wizSaveDraft(); render(); return; } if(k==="areaGrp"){ aogIepWizPickGrp(WZ,v); wizSaveDraft(); render(); return; } if(k==="area"){ WZ.area=v; if(AREAS[v]) WZ.areaGrp=AREAS[v].grp; wizSaveDraft(); render(); return; } if(k==="measure"){ aogIepWizPickMeasure(WZ,v); aogIepWizAutoUnit(WZ,v); wizSaveDraft(); render(); return; } if(k==="lower"){ WZ.lower=!!v; WZ.lowerTouched=true; wizSaveDraft(); render(); return; } if(Object.prototype.hasOwnProperty.call(WZ,k)) WZ[k]=v; wizSaveDraft(); render(); };
  window.aogIepWizNextStep=function(){ if(!WZ) return; if(!aogIepWizStepOk(WZ,WZ.step)){ alert(wizStepMsg(WZ.step)); return; } ST.wizErr=null; WZ.step=aogIepWizNext(WZ); wizSaveDraft(); render(); try{ var f=document.getElementById("iepFormBox"); if(f&&f.scrollTop!==undefined) f.scrollTop=0; }catch(e){} };
  window.aogIepWizBack=function(){ if(!WZ) return; ST.wizErr=null; WZ.step=aogIepWizPrev(WZ); wizSaveDraft(); render(); };
  window.aogIepTab=function(n){
    ST.student=String(n==null?"":n);
    /* Picking a tab — including "All" — is a deliberate act, so it always
       stamps pickedAt; only a real student writes the shared focus. */
    ST.pickedAt=Date.now();
    try{ if(window.AOGFocus&&ST.student&&ST.student!=="ALL") AOGFocus.set(ST.student,"iep"); }catch(eF){}
    try{ localStorage.setItem(TABKEY,ST.student); }catch(e){}
    render();
    try{ var hst=document.getElementById("aogIepBody"); if(hst&&hst.scrollIntoView) hst.scrollIntoView({block:"start"}); }catch(e2){}
  };
  window.aogIepArch=function(id,on){ var st=load(); if(st.goals[id]){ st.goals[id].archived=!!on; save(st); render(); } };
  window.aogIepDel=function(id){ var st=load(); if(!st.goals[id]) return; if(!confirm(DTx("Delete this goal and all its data points? This cannot be undone.","¿Eliminar esta meta y todos sus datos? No se puede deshacer."))) return; delete st.goals[id]; delete st.data[id]; save(st); render(); };
  window.aogIepDelPt=function(id,idx){ var st=load(); var arr=(st.data[id]||[]).slice().sort(byDate); if(idx<0||idx>=arr.length) return; if(!confirm(DTx("Remove this data point?","¿Quitar este dato?"))) return; arr.splice(idx,1); st.data[id]=arr; save(st); render(); };
  /* .30cy — EDIT WITHOUT RE-ENTRY. Jimmy: "I made a mistake and I had to
     delete and then reenter it." ✎ on a chip loads that point back into the
     entry row; Add becomes Save until saved, canceled, or the panel
     repaints. Every validation Add performs runs again on Save, because an
     edited point is still a point. */
  window.aogIepEditPt=function(id,idx){
    var st=load(); var g=st.goals[id]; if(!g) return;
    var arr=(st.data[id]||[]).slice().sort(byDate);
    if(idx<0||idx>=arr.length) return;
    var p=arr[idx];
    ST.editPt={id:id,idx:idx,date:p.date,value:p.value};
    var dEl=document.getElementById("iepD_"+id); if(dEl&&p.date) dEl.value=String(p.date).slice(0,10);
    var vEl=document.getElementById("iepV_"+id);
    var tEl=document.getElementById("iepT_"+id);
    var eEl=document.getElementById("iepE_"+id);
    var rEl=document.getElementById("iepR_"+id);
    var bEl=document.getElementById("iepB_"+id);
    var nEl=document.getElementById("iepN_"+id);
    if(g.measure==="wcpm"){
      /* stored value is words-minus-errors; the row asks for words read */
      if(vEl) vEl.value=(+p.value)+(+p.total||0);
      if(eEl) eEl.value=(p.total!=null?p.total:"");
      try{ aogIepWcpmPrev(id); }catch(eW){}
    } else {
      if(vEl) vEl.value=(p.value!=null?p.value:"");
      if(tEl) tEl.value=(p.total!=null?p.total:"");
    }
    if(rEl) rEl.value=(p.raw!=null?p.raw:"");
    if(bEl) bEl.value=(p.bench||"");
    if(nEl) nEl.value=(p.note||"");
    var btn=null;
    try{ btn=dEl?dEl.closest(".iep-entry").querySelector(".iep-btn"):null; }catch(eB){}
    if(btn) btn.textContent=DTx("Save change","Guardar cambio");
    var old=document.getElementById("iepEditNote_"+id); if(old&&old.parentNode) old.parentNode.removeChild(old);
    var note=document.createElement("div");
    note.id="iepEditNote_"+id;
    note.style.cssText="font-size:12px;color:var(--ink-faint,#8A92A6);margin:4px 0 0;";
    note.innerHTML=esc(DTx("Editing the ","Editando el dato del "))+esc(fdateStr(p.date))+esc(DTx(" point — "," — "))
      +'<button type="button" style="border:0;background:none;color:inherit;text-decoration:underline;cursor:pointer;font:inherit;padding:0;" onclick="aogIepCancelEdit(\''+id+'\')">'+esc(DTx("cancel","cancelar"))+'</button>';
    try{ var entry=dEl?dEl.closest(".iep-entry"):null; if(entry&&entry.parentNode) entry.parentNode.insertBefore(note,entry.nextSibling); }catch(eN){}
    try{ if(vEl) vEl.focus(); }catch(eF){}
  };
  window.aogIepCancelEdit=function(id){ ST.editPt=null; render(); };

  /* ---------- benchmark bridge — same aog.iepdocs.v1 storage the paperwork block reads; works even if that block is absent ---------- */
  var DOCS_KEY="aog.iepdocs.v1";
  function benchLetter(i){ i=+i||0; var s=""; do{ s=String.fromCharCode(65+(i%26))+s; i=Math.floor(i/26)-1; }while(i>=0); return s; }
  function docsLoad(){ var st=null; try{ st=JSON.parse(localStorage.getItem(DOCS_KEY)||"null"); }catch(e){} if(!st||typeof st!=="object") st={}; if(!st.docs||typeof st.docs!=="object") st.docs={}; if(!st.goalMeta||typeof st.goalMeta!=="object") st.goalMeta={}; return st; }
  function docsSave(st){ try{ localStorage.setItem(DOCS_KEY,JSON.stringify(st)); }catch(e){} }
  function goalBenchmarks(id){ var st=docsLoad(); var gm=st.goalMeta[id]; return (gm&&Array.isArray(gm.benchmarks))?gm.benchmarks:[]; }
  function benchWrite(id,fn){
    var st=docsLoad(); var gm=st.goalMeta[id];
    if(!gm||typeof gm!=="object") gm={};
    if(!Array.isArray(gm.benchmarks)) gm.benchmarks=[];
    fn(gm.benchmarks);
    for(var i=0;i<gm.benchmarks.length;i++){
      var bm=gm.benchmarks[i]; if(!bm||typeof bm!=="object") bm=gm.benchmarks[i]={};
      bm.letter=benchLetter(i);
      if(bm.text==null) bm.text="";
      if(bm.essentialElements==null) bm.essentialElements="";
      if(bm.scoringMethod==null) bm.scoringMethod="";
      if(!Array.isArray(bm.evalProcedure)) bm.evalProcedure=[];
      if(bm.schedule==null) bm.schedule="";
    }
    st.goalMeta[id]=gm; docsSave(st);
  }
  /* Cutoffs live beside the benchmarks in goalMeta ON PURPOSE: the goal
     wizard's save rebuilds the goal object field by field, and a field it
     does not know about would be silently dropped on the next edit. goalMeta
     is never rebuilt, so the cutoffs survive every trip through Edit. */
  function goalCutoffs(id){
    var st=docsLoad(); var gm=st.goalMeta[id];
    var c=gm&&gm.cutoffs;
    return (c&&Array.isArray(c.rows)&&c.rows.length)?c:null;
  }
  function cutoffsWrite(id,fn){
    var st=docsLoad(); var gm=st.goalMeta[id];
    if(!gm||typeof gm!=="object") gm={};
    if(!gm.cutoffs||typeof gm.cutoffs!=="object"||!Array.isArray(gm.cutoffs.rows)) gm.cutoffs={label:"",rows:[]};
    fn(gm.cutoffs);
    if(!gm.cutoffs.rows.length&&!String(gm.cutoffs.label||"").trim()) delete gm.cutoffs;
    st.goalMeta[id]=gm; docsSave(st);
  }
  function benchEditorHTML(id,bms){
    var h='<div class="iep-bmed"><div class="iep-bmed-t">'+esc(DTx("Benchmarks — shared with the Meeting Paperwork goal pages","Puntos de referencia — compartidos con las páginas de metas de Documentos de reunión"))+'</div>';
    bms.forEach(function(bm,bi){
      var bl=(bm&&bm.letter)||benchLetter(bi);
      h+='<div class="iep-bmed-row" data-bmrow="'+bi+'"><span class="iep-bmed-l">'+esc(bl)+'</span>'
        +((bm&&bm.src==="aimline")?('<span class="iep-bmed-src" title="'+esc(DTx("Drafted here from the aimline — not transcribed from a signed IEP. Edit it and this mark goes away.","Redactado aquí desde la línea objetivo — no copiado de un IEP firmado. Edítalo y esta marca desaparece."))+'">'+esc(DTx("drafted","borrador"))+'</span>'):'')
        +'<input type="text" value="'+esc((bm&&bm.text)||"")+'" placeholder="'+esc(DTx("One-line benchmark","Punto de referencia en una línea"))+'" oninput="aogIepBenchTxt(\''+id+'\','+bi+',this.value)" aria-label="'+esc(DTx("Benchmark ","Punto de referencia "))+esc(bl)+'">'
        +'<button type="button" class="iep-mini danger" onclick="aogIepBenchDel(\''+id+'\','+bi+')" aria-label="'+esc(DTx("Remove benchmark","Quitar punto de referencia"))+'">×</button></div>';
    });
    h+=benchLadderHTML(id,bms);
    h+='<div class="iep-bmed-row"><span class="iep-bmed-l">'+esc(benchLetter(bms.length))+'</span>'
      +'<input type="text" id="iepBmNew_'+id+'" placeholder="'+esc(DTx("New benchmark (one line)","Nuevo punto de referencia (una línea)"))+'" aria-label="'+esc(DTx("New benchmark","Nuevo punto de referencia"))+'">'
      +'<button type="button" class="iep-mini" onclick="aogIepBenchAdd(\''+id+'\')">'+DTx("Add","Agregar")+'</button></div>'
      +'<button type="button" class="iep-mini" onclick="aogIepBenchOpen(\''+id+'\')">'+DTx("Done","Listo")+'</button></div>';
    return h;
  }
  function benchLadderHTML(id,bms){
    var st=load(), g=st.goals[id];
    if(!g) return "";
    if(aogIepAimDegenerate(g)){
      return '<div class="iep-bmed-note">'+esc(DTx(
        "Set a target different from the baseline and this can write the benchmarks for you.",
        "Define una meta distinta de la línea base y esto puede escribir los puntos de referencia por ti."))+'</div>';
    }
    var n=(ST.ladderN&&ST.ladderN[id])||3;
    var opt=[2,3,4].map(function(k){ return '<option value="'+k+'"'+(k===n?" selected":"")+'>'+k+'</option>'; }).join("");
    var has=bms.some(function(b){ return b&&String(b.text||"").trim(); });
    return '<div class="iep-bmed-gen">'
      +'<span>'+esc(DTx("Write them from the aimline:","Escribirlos desde la línea objetivo:"))+'</span>'
      +'<select aria-label="'+esc(DTx("How many benchmarks","Cuántos puntos de referencia"))+'" onchange="aogIepBenchLadderN(\''+id+'\',this.value)">'+opt+'</select>'
      +'<button type="button" class="iep-mini" onclick="aogIepBenchLadderGen(\''+id+'\',\'fill\')">'+esc(has?DTx("Fill the empty ones","Llenar los vacíos"):DTx("Generate","Generar"))+'</button>'
      +(has?('<button type="button" class="iep-mini danger" onclick="aogIepBenchLadderGen(\''+id+'\',\'replace\')">'+esc(DTx("Replace all","Reemplazar todos"))+'</button>'):'')
      +'<span class="iep-bmed-note">'+esc(DTx(
        "Evenly spaced dates between the baseline and the annual date, each criterion taken from the line the chart already draws. If this goal is already on a signed IEP, its benchmarks are the ones in that document — type those in instead. Anything written here is marked “drafted” until you edit it.",
        "Fechas repartidas entre la línea base y la fecha anual, con cada criterio tomado de la línea que ya traza la gráfica. Si esta meta ya está en un IEP firmado, sus puntos de referencia son los de ese documento — escribe esos. Lo que se escriba aquí queda marcado “borrador” hasta que lo edites."))+'</span>'
      +'</div>';
  }
  /* The cutoffs editor. One label naming which table these rows came from,
     one line of pairs, and a plain-words readback of what was understood —
     because a misread cutoff silently mis-scores every entry after it. */
  function cutEditorHTML(id,cut){
    var label=(cut&&cut.label)||"", rowsTxt=cut?aogIepCutText(cut.rows):"";
    var h='<div class="iep-bmed"><div class="iep-bmed-t">'+esc(DTx(
      "Percentile cutoffs — type the raw probe score at data entry and the percentile fills in",
      "Percentiles — escribe el puntaje bruto al registrar y el percentil se completa solo"))+'</div>';
    h+='<div class="iep-bmed-row"><input type="text" value="'+esc(label)+'" placeholder="'+esc(DTx("Which table (e.g. Grade 6 · Fall · FastBridge CBMMath)","Qué tabla (p. ej. 6.º grado · Otoño · FastBridge CBMMath)"))+'" oninput="aogIepCutLbl(\''+id+'\',this.value)" aria-label="'+esc(DTx("Norms table label","Etiqueta de la tabla de normas"))+'"></div>';
    h+='<div class="iep-bmed-row"><input type="text" id="iepCutRows_'+id+'" value="'+esc(rowsTxt)+'" placeholder="'+esc(DTx("percentile=score pairs, e.g. 5=9, 10=13, 15=16, 20=19","pares percentil=puntaje, p. ej. 5=9, 10=13, 15=16, 20=19"))+'" oninput="aogIepCutRows(\''+id+'\',this.value)" aria-label="'+esc(DTx("Cutoff pairs","Pares de corte"))+'"></div>';
    h+='<div class="iep-bmed-note" id="iepCutFb_'+id+'">'+esc(cutFbText(cut?cut.rows:[]))+'</div>';
    h+='<span class="iep-bmed-note">'+esc(DTx(
      "Each pair is the lowest score that reaches that percentile, from the norms table for this measure, grade and season — copy the handful of rows the goal needs, not the whole table. A score below the lowest pair records as 1, because the record should say below the floor, not nothing.",
      "Cada par es el puntaje mínimo que alcanza ese percentil, según la tabla de normas de esta medida, grado y temporada — copia solo las filas que la meta necesita, no toda la tabla. Un puntaje bajo el par más bajo se registra como 1, porque el registro debe decir bajo el piso, no nada."))+'</span>'
      +'<button type="button" class="iep-mini" onclick="aogIepCutOpen(\''+id+'\')">'+DTx("Done","Listo")+'</button></div>';
    return h;
  }
  function cutFbText(rows){
    if(!rows||!rows.length) return DTx("Nothing readable yet — write pairs like 5=9, 10=13.","Aún no hay pares legibles — escribe pares como 5=9, 10=13.");
    return DTx("Read as: ","Leído como: ")+rows.map(function(r){ return DTx(r.pct+"th needs "+r.score,"percentil "+r.pct+" requiere "+r.score); }).join(" · ");
  }
  window.aogIepCutOpen=function(id){
    ST.cutEditId=(ST.cutEditId===id)?null:id;
    if(ST.cutEditId){ ST.benchEditId=null; if(!ST.cardOpen[id]){ ST.cardOpen[id]=1; gfoldSave(); } }
    render();
  };
  window.aogIepCutLbl=function(id,v){ cutoffsWrite(id,function(c){ c.label=String(v||"").trim().slice(0,120); }); };
  window.aogIepCutRows=function(id,v){
    var rows=aogIepCutParse(v);
    cutoffsWrite(id,function(c){ c.rows=rows; });
    var fb=document.getElementById("iepCutFb_"+id);
    if(fb) fb.textContent=cutFbText(rows);
  };
  /* Mirrors aogIepWcpmPrev: a live readback beside the field, plus the fill.
     Loads the cutoffs per keystroke so the preview always reads what Done
     will save — a stale closure here would convert with yesterday's table. */
  window.aogIepRawPrev=function(id){
    var rEl=document.getElementById("iepR_"+id), vEl=document.getElementById("iepV_"+id), out=document.getElementById("iepP_"+id);
    if(!out) return;
    var raw=rEl?String(rEl.value):"";
    if(raw===""){ out.textContent=""; return; }
    var cut=goalCutoffs(id);
    var r=cut?aogIepPctlFromRaw(cut.rows,raw):null;
    if(!r){ out.textContent=""; return; }
    if(vEl) vEl.value=r.enter;
    out.textContent=r.below
      ? ("= "+DTx("below "+r.floor+"th %ile → 1","bajo percentil "+r.floor+" → 1"))
      : ("= "+DTx(r.pct+"th %ile","percentil "+r.pct));
  };
  window.aogIepBenchLadderN=function(id,v){ if(!ST.ladderN) ST.ladderN={}; ST.ladderN[id]=Math.max(2,Math.min(4,+v||3)); render(); };
  /* ⚠ THE SIGNED-IEP RULE. Benchmarks already written here may be the ones on a
     signed IEP — a legal document this app is not the record for. So generation
     is ADDITIVE by default (empty rungs only), replacing is a separate button
     that names the risk, and every generated line is stamped src:"aimline" so
     it can be told apart from transcribed text for the rest of its life —
     including on the printed goal page. The stamp clears the moment a person
     edits that line: once you have touched it, it is yours. */
  window.aogIepBenchLadderGen=function(id,mode){
    var st=load(), g=st.goals[id]; if(!g) return;
    var n=(ST.ladderN&&ST.ladderN[id])||3;
    var den=(g.xofy&&g.xofy.td!=null&&+g.xofy.td>0)?+g.xofy.td:0;
    var rows=aogIepBenchLadder(g,n,{es:DTx(false,true),den:den});
    if(!rows.length){
      alert(DTx("This goal needs a baseline and a different target, both dated, before benchmarks can be written from the line.",
                "Esta meta necesita una línea base y una meta distinta, ambas con fecha, antes de poder escribir los puntos de referencia."));
      return;
    }
    var cur=goalBenchmarks(id);
    var written=cur.filter(function(b){ return b&&String(b.text||"").trim(); });
    var mk=function(r,i){
      return {letter:benchLetter(i),text:r.text,essentialElements:"",scoringMethod:"",
              evalProcedure:[],schedule:"",criteria:r.criteria,masteryDate:r.date,progressNote:"",src:"aimline"};
    };
    if(mode==="replace"){
      if(written.length&&!confirm(DTx(
        "Replace "+written.length+" benchmark"+(written.length===1?"":"s")+" already written here?\n\nIf any of them were typed in from a signed IEP, that is the legal wording and this cannot undo it. Data points keep their letters.",
        "¿Reemplazar "+written.length+" punto"+(written.length===1?"":"s")+" de referencia ya escrito"+(written.length===1?"":"s")+"?\n\nSi alguno se copió de un IEP firmado, esa es la redacción legal y esto no se puede deshacer. Los datos conservan sus letras."))) return;
      benchWrite(id,function(bms){ bms.length=0; rows.forEach(function(r,i){ bms.push(mk(r,i)); }); });
    } else if(!written.length){
      /* nothing written yet — this is the blank-slate case, so build all of them */
      benchWrite(id,function(bms){ bms.length=0; rows.forEach(function(r,i){ bms.push(mk(r,i)); }); });
    } else {
      /* Something is already written and may be the signed wording. Fill the
         blanks and STOP — never append a rung nobody asked for beside it. */
      var empties=0;
      cur.forEach(function(b){ if(!(b&&String(b.text||"").trim())) empties++; });
      if(!empties){
        alert(DTx("Every benchmark here already has wording. Use Replace all if you mean to overwrite them \u2014 but if any came from a signed IEP, that document is the record.",
                  "Todos los puntos de referencia ya tienen redacción. Usa Reemplazar todos si quieres sobrescribirlos \u2014 pero si alguno vino de un IEP firmado, ese documento es el registro."));
        return;
      }
      var wrote=Math.min(empties,rows.length);
      benchWrite(id,function(bms){
        var used=0;
        for(var i=0;i<bms.length&&used<rows.length;i++){
          if(bms[i]&&String(bms[i].text||"").trim()) continue;
          var r=rows[used++], keep=bms[i]||{};
          keep.text=r.text; keep.criteria=r.criteria; keep.masteryDate=r.date; keep.src="aimline";
          if(!Array.isArray(keep.evalProcedure)) keep.evalProcedure=[];
          bms[i]=keep;
        }
      });
      if(rows.length>wrote){
        alert(DTx("Filled the "+wrote+" empty benchmark"+(wrote===1?"":"s")+". The rest were already written, so nothing was added beside them \u2014 add a row and fill it again if you want more.",
                  "Se llenaron "+wrote+" punto"+(wrote===1?"":"s")+" de referencia vacío"+(wrote===1?"":"s")+". El resto ya estaba escrito, así que no se agregó nada \u2014 agrega una fila y vuelve a llenar si quieres más."));
      }
    }
    /* benchWrite deliberately does not repaint — the text inputs debounce and a
       render mid-keystroke would steal focus. A generate is not a keystroke. */
    render();
  };
  window.aogIepBenchOpen=function(id){ ST.benchEditId=(ST.benchEditId===id)?null:id; if(ST.benchEditId){ ST.cutEditId=null; if(!ST.cardOpen[id]){ ST.cardOpen[id]=1; gfoldSave(); } } render(); };
  window.aogIepBenchAdd=function(id){ var inp=document.getElementById("iepBmNew_"+id); var txt=inp?String(inp.value||"").trim():""; benchWrite(id,function(bms){ bms.push({letter:benchLetter(bms.length),text:txt,essentialElements:"",scoringMethod:"",evalProcedure:[],schedule:""}); }); render(); };
  window.aogIepBenchDel=function(id,i){ if(!confirm(DTx("Remove this benchmark? Data points tagged to it keep their letter.","¿Quitar este punto de referencia? Los datos etiquetados conservan su letra."))) return; benchWrite(id,function(bms){ bms.splice(i,1); }); render(); };
  var benchTxtTimer=null;
  window.aogIepBenchTxt=function(id,i,v){
    if(benchTxtTimer) clearTimeout(benchTxtTimer);
    benchTxtTimer=setTimeout(function(){
      benchWrite(id,function(bms){ if(bms[i]){ bms[i].text=String(v); bms[i].src=""; } });
      try{ var chip=document.querySelector('#panel-iep .iep-bmed-row[data-bmrow="'+i+'"] .iep-bmed-src'); if(chip&&chip.parentNode) chip.parentNode.removeChild(chip); }catch(e){}
    },250);
  };
  window.aogIepBenchSel=function(id,bl){ if(!ST.chartBench) ST.chartBench={}; ST.chartBench[id]=bl; render(); };
  function gfoldSave(){ try{ localStorage.setItem(GFOLD_KEY,JSON.stringify(ST.cardOpen)); }catch(e){} }
  window.aogIepCardToggle=function(id){ if(ST.cardOpen[id]) delete ST.cardOpen[id]; else ST.cardOpen[id]=1; gfoldSave(); render(); };
  /* The whole title bar folds the card — except where the click began on a
     control that has its own job (Edit, Print, the chevron itself…). */
  window.aogIepCardHead=function(e,id){ try{ var t=e&&e.target; if(t&&t.closest&&t.closest("button,a,input,select,textarea,details,label")) return; }catch(_e){} window.aogIepCardToggle(id); };
  window.aogIepCardsAll=function(name,closed){ var st=load(); Object.keys(st.goals).forEach(function(gid){ var g=st.goals[gid]; if(!g||g.archived) return; if((g.student||"")!==name) return; if(closed) delete ST.cardOpen[gid]; else ST.cardOpen[gid]=1; }); gfoldSave(); render(); };

  /* ---------- standards picker — one component; the paperwork block reuses it via window.aogIepStdPicker ---------- */
  var STDP={};
  function ensureStd(pid){ if(!STDP[pid]) STDP[pid]={q:"",src:"",picks:[]}; return STDP[pid]; }
  function stdOpen(pid){ var st=STDP[pid]; return !!(st&&(st.q||st.picks.length)); }
  function stdIlselEntries(){
    var out=[];
    try{
      var sel=document.getElementById("aoggStd");
      if(sel&&sel.options&&sel.options.length){
        for(var i=0;i<sel.options.length;i++){
          var o=sel.options[i]; if(!o||!o.value) continue;
          var t=String(o.textContent||"");
          var lab=t.indexOf("·")>=0?t.slice(t.indexOf("·")+1).trim():t.trim();
          out.push({src:"ilsel",code:"IL SEL "+o.value,label:lab});
        }
      }
    }catch(e){}
    if(!out.length){ try{ out=aogIepStdFromCrosswalk(window.AOG_CROSSWALK); }catch(e2){} }
    return out;
  }
  function stdEntries(){ return stdIlselEntries().concat(AOG_STD_CASEL,AOG_STD_CCSS); }
  function stdBodyHTML(pid){
    var st=ensureStd(pid);
    var SRC=[["","All","Todos"],["ilsel","IL SEL","IL SEL"],["casel","CASEL","CASEL"],["ccss","Common Core","Common Core"]];
    var h='<div class="iep-stdsrc">'+SRC.map(function(pr){ return '<button type="button" class="iep-bchip'+(st.src===pr[0]?" on":"")+'" aria-pressed="'+(st.src===pr[0]?"true":"false")+'" onclick="aogIepStdSrc(\''+pid+'\',\''+pr[0]+'\')">'+esc(DTx(pr[1],pr[2]))+'</button>'; }).join("")+'</div>';
    if(st.picks.length){
      h+='<div class="iep-stdsel">'+st.picks.map(function(p){ return '<span class="iep-pt"><b class="iep-ptb">'+esc(p.code)+'</b><button type="button" aria-label="'+esc(DTx("Remove","Quitar"))+'" onclick="aogIepStdUnpick(\''+pid+'\','+attrJs(p.code)+')">×</button></span>'; }).join("")+'</div>';
    }
    if(aogIepStdListOpen(st.q,st.src)){
      var band=""; try{ if(st.band){ band=String(st.band); } else if(pid==="wiz"&&WZ){ band=aogIepGradeBand(WZ.grade); } }catch(eBnd){}
      var res=aogIepStdBandSort(aogIepStdFilter(stdEntries(),st.q,st.src),band);
      var shown=res.slice(0,8);
      h+='<div class="iep-stdres">'
        +(shown.length?shown.map(function(e){ var picked=st.picks.some(function(p){ return p.code===e.code; }); var fit=!!band&&aogIepStdBandRank(e,band)===0; return '<button type="button" class="iep-stdrow'+(picked?" on":"")+'" onclick="aogIepStdPick(\''+pid+'\','+attrJs(e.code)+')"><b>'+esc(e.code)+'</b> '+(fit?('<span class="iep-stdfit">'+esc(DTx("Gr-fit","Apto grado"))+'</span> '):'')+esc(e.label)+(picked?" ✓":"")+'</button>'; }).join(""):('<div class="iep-whelp" style="padding:8px 9px;">'+esc(DTx("No matches — you can still type directly into the standards fields.","Sin coincidencias — aún puedes escribir directamente en los campos de estándares."))+'</div>'))
        +(res.length>shown.length?('<div class="iep-whelp" style="padding:6px 9px;">'+esc(DTx("Showing ","Mostrando "))+shown.length+esc(DTx(" of "," de "))+res.length+esc(DTx(" — keep typing to narrow"," — sigue escribiendo para acotar"))+'</div>'):'')+'</div>';
    } else {
      h+='<div class="iep-whelp">'+esc(DTx("Type at least 2 letters or tap a source to see matching standards.","Escribe al menos 2 letras o toca una fuente para ver estándares."))+'</div>';
    }
    return h;
  }
  function stdPickerHTML(pid){
    var st=ensureStd(pid);
    return '<div class="iep-stdwrap"><input type="search" class="iep-stdq" value="'+esc(st.q)+'" placeholder="'+esc(DTx("Search standards (code or words)…","Buscar estándares (código o palabras)…"))+'" aria-label="'+esc(DTx("Search standards","Buscar estándares"))+'" oninput="aogIepStdQ(\''+pid+'\',this.value)">'
      +'<div id="iepStdBody_'+pid+'">'+stdBodyHTML(pid)+'</div></div>';
  }
  function stdRefresh(pid){ var el=document.getElementById("iepStdBody_"+pid); if(el) el.innerHTML=stdBodyHTML(pid); }
  function stdCommit(pid,goalId){
    try{
      var st=STDP[pid]; var picks=(st&&st.picks)||[];
      if(picks.length&&goalId){
        var core=picks.filter(function(p){ return p.src==="ccss"; });
        var stt=picks.filter(function(p){ return p.src!=="ccss"; });
        var ds=docsLoad(); var gm=ds.goalMeta[goalId];
        if(!gm||typeof gm!=="object") gm={};
        if(core.length) gm.coreStandards=aogIepStdAppend(gm.coreStandards,core);
        if(stt.length) gm.stateStandards=aogIepStdAppend(gm.stateStandards,stt);
        ds.goalMeta[goalId]=gm; docsSave(ds);
      }
    }catch(e){}
    STDP[pid]={q:"",src:"",picks:[]};
  }
  window.aogIepStdQ=function(pid,v){ ensureStd(pid).q=String(v||""); stdRefresh(pid); };
  window.aogIepStdSrc=function(pid,src){ var st=ensureStd(pid); st.src=(st.src===src)?"":src; stdRefresh(pid); };
  window.aogIepStdPick=function(pid,code){ var st=ensureStd(pid); var all=stdEntries(); for(var i=0;i<all.length;i++){ if(all[i].code===code){ var e=all[i]; var dup=false,j; for(j=0;j<st.picks.length;j++){ if(st.picks[j].code===e.code) dup=true; } if(dup){ st.picks=st.picks.filter(function(p){ return p.code!==e.code; }); } else { st.picks.push({src:e.src,code:e.code,label:e.label}); } break; } } stdRefresh(pid); };
  window.aogIepStdUnpick=function(pid,code){ var st=ensureStd(pid); st.picks=st.picks.filter(function(p){ return p.code!==code; }); stdRefresh(pid); };
  window.aogIepStdPicker={html:stdPickerHTML,body:stdBodyHTML,refresh:stdRefresh,state:STDP,entries:stdEntries,filter:aogIepStdFilter,append:aogIepStdAppend,commit:stdCommit,gradeBand:aogIepGradeBand,bands:aogIepStdBands,bandRank:aogIepStdBandRank,bandSort:aogIepStdBandSort};

  window.aogIepSave=function(){
    if(!WZ) return;
    /* The two step-gate alerts that used to fire here are gone with the steps.
       aogIepWizMissing covers the same ground and says which field, inline in
       the save bar where the eye already is — an alert on a one-page form is a
       modal on top of a modal. */
    var miss=aogIepWizMissing(WZ);
    if(miss){
      ST.wizErr=wizIssueMsg(miss); wizSaveDraft(); render();
      try{ window.aogIepWizJump(miss==="measure"?2:1); }catch(eJ){}
      return;
    }
    var fin=aogIepWizFinishIssue(WZ);
    if(fin){ ST.wizErr=wizIssueMsg(fin); wizSaveDraft(); render(); try{ window.aogIepWizJump(3); }catch(eJ2){} return; }
    ST.wizErr=null;
    var st=load();
    var wasEdit=!!ST.editId;
    var id=ST.editId||("g"+Date.now().toString(36)+Math.random().toString(36).slice(2,7));
    var prev=st.goals[id];
    st.goals[id]={
      student:String(WZ.student).trim(),
      grade:aogIepGradeNorm(WZ.grade),
      area:(AREAS[WZ.area]?WZ.area:"other"),
      title:String(WZ.title).trim(),
      measure:(MEAS[WZ.measure]?WZ.measure:"percent"),
      unit:aogIepWizUnitTrim(WZ.unit),
      baseline:{date:WZ.bdate,value:+WZ.bval},
      target:{date:WZ.tdate,value:+WZ.tval},
      notes:String(WZ.notes||"").trim(),
      archived:prev?!!prev.archived:false,
      lowerBetter:!!WZ.lower,
      intervalLabel:String(WZ.ilabel||"").trim(),
      /* what the teacher actually typed, so reopening the wizard shows 4 of 5
         again rather than 80 with no way back to the numbers behind it */
      xofy:(aogIepWizIsXofY(WZ.measure)&&aogIepWizXofY(WZ.bnum,WZ.bden)!=null&&aogIepWizXofY(WZ.tnum,WZ.tden)!=null)
        ?{bn:+WZ.bnum,bd:+WZ.bden,tn:+WZ.tnum,td:+WZ.tden}
        :(prev&&prev.xofy?prev.xofy:null)
    };
    if(!st.data[id]) st.data[id]=[];
    save(st);
    stdCommit("wiz",id);
    if(!wasEdit&&!aogIepWizCloseKind("save").keepDraft) wizClearDraft();
    WZ=null; ST.formOpen=false; ST.editId=null; ST.prefill=null; ST.filter="";
    /* Otherwise a goal saved for a student whose tab is not the open one lands
       out of sight and reads as "it did not save". */
    ST.student=st.goals[id].student||"";
    try{ localStorage.setItem(TABKEY,ST.student); }catch(eT){}
    ST.hintId=wasEdit?null:id;
    /* Cards start folded (.30by), so the goal just saved must open itself:
       a new goal has to show its add-your-first-data-point hint, and an
       edited one has to show what the edit changed. */
    ST.cardOpen[id]=1; gfoldSave();
    render();
    try{
      setTimeout(function(){
        try{
          var card=document.getElementById("iepCard_"+id);
          if(card&&card.scrollIntoView) card.scrollIntoView({behavior:"smooth",block:"center"});
          var v=document.getElementById("iepV_"+id);
          if(v&&v.focus) v.focus({preventScroll:true});
        }catch(e2){}
      },80);
    }catch(e){}
  };

  window.aogIepWcpmPrev=function(id){
    var vEl=document.getElementById("iepV_"+id), eEl=document.getElementById("iepE_"+id), out=document.getElementById("iepW_"+id);
    if(!out) return;
    var raw=vEl?String(vEl.value):"";
    if(raw===""){ out.textContent=""; return; }
    var c=aogIepWcpmCalc(raw,eEl?eEl.value:"");
    if(!c){ out.textContent=DTx("errors > words read","errores > palabras leídas"); return; }
    out.textContent="= "+c.wcpm+" wcpm"+(c.acc==null?"":(" \u00b7 "+c.acc+"% "+DTx("acc.","prec.")));
  };

  window.aogIepAdd=function(id){
    var st=load(); var g=st.goals[id]; if(!g) return;
    var dEl=document.getElementById("iepD_"+id), vEl=document.getElementById("iepV_"+id), nEl=document.getElementById("iepN_"+id);
    var d=dEl?dEl.value:"", v=vEl?vEl.value:"", note=nEl?nEl.value:"";
    if(!d){ alert(DTx("Pick the date this was measured.","Elige la fecha en que se midió.")); return; }
    /* A measurement dated in the future cannot have happened; one dated outside
       the goal period probably means a typo, but it might not — so the future
       is refused and the rest is asked about. Nothing is silently discarded. */
    var iss=aogIepDateIssue(g,d,todayStr());
    if(iss==="bad"){ alert(DTx("That date could not be read. Use the date picker.","No se pudo leer esa fecha. Usa el selector de fecha.")); return; }
    if(iss==="future"){ alert(DTx("That date is in the future — a measurement can only be recorded for today or a day already past.","Esa fecha está en el futuro — solo se puede registrar una medición de hoy o de un día ya pasado.")); if(dEl){ dEl.value=todayStr(); try{ dEl.focus(); }catch(eF){} } return; }
    if(iss==="beforeBaseline"&&!confirm(DTx("This date is before the baseline ("+fdateStr(g.baseline.date)+"), so the aimline does not exist yet on it. The point will be charted and exported, but the four-point and trend rules will skip it.\n\nKeep this date?",
                                            "Esta fecha es anterior a la línea base ("+fdateStr(g.baseline.date)+"), así que la línea objetivo aún no existe. El dato se graficará y se exportará, pero las reglas lo omitirán.\n\n¿Mantener esta fecha?"))) return;
    if(iss==="afterTarget"&&!confirm(DTx("This date is after the target date ("+fdateStr(g.target.date)+").\n\nKeep this date?",
                                         "Esta fecha es posterior a la fecha meta ("+fdateStr(g.target.date)+").\n\n¿Mantener esta fecha?"))) return;
    if(v===""){ alert(DTx("Enter the measurement.","Ingresa la medición.")); return; }
    if(!isFinite(+v)){ alert(DTx("That needs to be a number.","Eso debe ser un número.")); return; }
    /* WHERE THIS NUMBER CAME FROM. Every point written by hand is stamped
       typed from .29aw on, so that when something other than a person can
       propose one, the two are tellable apart in the record, in the export
       and in the print - which is what the signed-IEP rule requires and what
       the data model could not honor. An ABSENT src means written before
       .29aw and nothing else; legacy points get a meaning, not a repair, the
       same way legacy x-of-y goals did. [[aog-signed-iep-rule]] [[aog-xofy-goals]]
       ⚠ NOTHING READS THIS YET AND NOTHING SHOULD. A label that always says
       the same word is noise; it earns its place the day a check-in can
       propose a measurement, and not one build earlier. */
    var p={date:d,value:+v,src:"typed",year:(window.AOGYear?AOGYear(d):"")};
    var bEl=document.getElementById("iepB_"+id);
    if(bEl&&bEl.value) p.bench=String(bEl.value);
    /* The raw probe score rides along when the percentile came through the
       cutoffs, so the record can answer "1% of what?" at a progress review.
       Kept even if the teacher then overtyped the percent — the raw number
       is what the paper says either way. */
    var rEl=document.getElementById("iepR_"+id);
    if(rEl&&rEl.value!==""&&isFinite(+rEl.value)) p.raw=+rEl.value;
    if(g.measure==="trials"||g.measure==="steps"){
      var tEl=document.getElementById("iepT_"+id); var tv=tEl?tEl.value:"";
      if(tv===""||!(+tv>0)){ alert(g.measure==="steps"?DTx("Enter the total number of steps.","Ingresa el total de pasos."):DTx("Enter the total number of trials.","Ingresa el total de ensayos.")); return; }
      if(+v<0||+v>+tv){ alert(DTx("Value must be between 0 and the total.","El valor debe estar entre 0 y el total.")); return; }
      p.total=+tv;
    }
    if(g.measure==="wcpm"){
      var eEl=document.getElementById("iepE_"+id);
      var c=aogIepWcpmCalc(v,eEl?eEl.value:"");
      if(!c){ alert(DTx("Check the numbers — errors can’t be more than words read.","Revisa los números — los errores no pueden superar las palabras leídas.")); return; }
      p.value=c.wcpm; p.total=c.errors;
    }
    if(g.measure==="percent"&&(+v<0||+v>100)){ alert(DTx("This measurement needs to be between 0% and 100%.","Esta medición debe estar entre 0 % y 100 %.")); return; }
    if(g.measure==="rating"&&(+v<1||+v>5)){ alert(DTx("This rating needs to be between 1 and 5.","Esta escala debe estar entre 1 y 5.")); return; }
    if(g.measure!=="percent"&&g.measure!=="rating"&&(+v<0)){ alert(DTx("Enter a number greater than or equal to 0.","Ingresa un número mayor o igual a 0.")); return; }
    if(note&&note.trim()) p.note=note.trim();
    var arr=(st.data[id]||[]).slice().sort(byDate);
    var ep=ST.editPt;
    if(ep&&ep.id===id&&ep.idx>=0&&ep.idx<arr.length&&arr[ep.idx].date===ep.date&&arr[ep.idx].value===ep.value){
      /* .30cy — Save replaces the point being edited instead of adding a
         second one. Provenance survives the edit: the original src is kept
         (an ABSENT src means pre-.29aw and an edit must not launder that
         into typed), and the raw probe score rides along unless the value
         it explained was itself changed without a new raw. */
      var orig=arr[ep.idx];
      if(orig.src) p.src=orig.src;
      if(p.raw==null&&orig.raw!=null&&+p.value===+orig.value&&(orig.total==null||+p.total===+orig.total)) p.raw=orig.raw;
      arr[ep.idx]=p;
      ST.editPt=null;
    } else {
      arr=arr.concat([p]);
    }
    arr.sort(byDate); st.data[id]=arr;
    ST.hintId=null;
    save(st); render();
    /* The busy-Tuesday case is several measurements in a row. Put the cursor
       back where the next number goes instead of making them find it again. */
    try{
      var back=document.getElementById("iepV_"+id);
      if(back&&typeof back.focus==="function"){ back.focus(); if(typeof back.select==="function") back.select(); }
    }catch(eB){}
  };

  /* One goal, one page: the chart, what the rules read, and every data point
     as a table so the paper carries the numbers and not only the picture. */
  window.aogIepPrintGoal=function(id){
    var st=load(); var g=st.goals[id]; if(!g) return;
    var es=(DTx("en","es")==="es");
    var pts=(st.data[id]||[]).slice().sort(byDate);
    var sp=aogIepPeriodSplit(g,pts), rulePts=sp.used;
    var A=AREAS[g.area]||AREAS.other;
    var w=window.open("","_blank");
    if(!w){ alert(es?"Permite las ventanas emergentes para imprimir.":"Please allow pop-ups to print."); return; }
    var title=(es?"Meta del IEP — ":"IEP goal — ")+(g.student||"");
    var rows=pts.map(function(p){
      return "<tr><td>"+esc(fdateStr(p.date))+"</td><td>"+esc(fmtVal(g,p))+"</td><td>"
        +(aogIepAimDegenerate(g)?"—":esc(String(r1(aogIepAimAt(g,aogIepDayNum(p.date))))))+"</td><td>"
        +esc(p.bench||"")+"</td><td>"+esc((p.raw!=null?("raw "+r1(p.raw)+(p.note?" — ":"")):"")+(p.note||""))+"</td></tr>";
    }).join("");
    var doc='<!doctype html><html><head><meta charset="utf-8"><title>'+esc(title)+'</title><style>'
      +'*{-webkit-print-color-adjust:exact;print-color-adjust:exact;}'
      +'body{font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;color:#0A1E33;margin:36px;max-width:720px;}'
      +'.bh{display:flex;align-items:center;gap:12px;border-bottom:3px solid #D9A33B;padding-bottom:12px;margin:0 0 16px;}'
      +'.mk{width:40px;height:40px;border-radius:8px;background:#D9A33B;color:#0A1E33;font-family:Georgia,serif;font-weight:700;font-size:24px;display:flex;align-items:center;justify-content:center;}'
      +'.wm{font-family:Georgia,serif;font-size:18px;font-weight:700;}.sb{font-size:12px;color:#46506E;}'
      +'h3{font-family:Georgia,serif;font-size:15px;margin:0 0 4px;}'
      +'.meta{font-size:12px;color:#46506E;margin:0 0 10px;}'
      +'.dec{font-size:12.5px;line-height:1.5;border:1px solid #D9A33B;background:rgba(217,163,59,.12);color:#7a5510;border-radius:8px;padding:9px 12px;margin:8px 0 14px;}'
      +'.dec.good{border-color:#2E6B3A;background:rgba(46,107,58,.10);color:#245c2f;}'
      +'table{border-collapse:collapse;width:100%;font-size:12px;margin-top:12px;}'
      +'th,td{border:1px solid #E4DAC5;padding:5px 8px;text-align:left;}th{background:#FBF8F1;font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:#46506E;}'
      +'.dec.quiet{border-color:#E4DAC5;background:#FBF8F1;color:#46506E;}'
      +AOG_IEP_PRINT_CSS
      +'.ft{margin-top:18px;border-top:1px solid #E4DAC5;padding-top:8px;font-size:10.5px;color:#8A92A6;}'
      +'@media print{body{margin:.5in;}.np{display:none;}}</style></head><body>'
      +'<div class="bh"><span class="mk">A</span><div><div class="wm">Architecture of Grace</div><div class="sb">'+esc(title)+'</div></div></div>'
      +'<h3>'+esc(g.title)+'</h3>'
      +printBlankWarn(g,es)
      +'<div class="meta">'+esc((es?A.es:A.en))+' · '+esc(DTx(((MEAS[g.measure]||MEAS.percent).en),((MEAS[g.measure]||MEAS.percent).es)))
        +' · '+esc((es?"Línea base ":"Baseline ")+fmtNum(g,g.baseline.value)+" ("+fdateStr(g.baseline.date)+") → "
                   +(es?"Meta ":"Target ")+fmtNum(g,g.target.value)+" ("+fdateStr(g.target.date)+")")+'</div>'
      +chartSVG(g,pts,{ line:"#0A1E33", dot:"#fff", gold:"#D9A33B", grid:"#E4DAC5", txt:"#46506E", faint:"#8A92A6", trend:"#8A92A6",
                        warn:"#9a6f24", good:"#2E6B3A", noHover:true,
                        bench:["#3E5C9A","#B4552D","#2E6B3A","#6E4A9E","#1F7A8C","#8B2A2A"] })
      +printSignal(g,rulePts,es)
      +printDecide(g,rulePts,es)
      +(sp.early.length?('<div class="dec quiet">'+esc(es?(sp.early.length+" medición(es) están fechadas antes de la línea base y quedan fuera de las reglas; se muestran en la tabla.")
                                                          :(sp.early.length+" measurement"+(sp.early.length===1?" is":"s are")+" dated before the baseline and sit outside the rules; "+(sp.early.length===1?"it is":"they are")+" still shown in the table below."))+'</div>'):'')
      +(pts.length?('<table><thead><tr><th>'+(es?"Fecha":"Date")+'</th><th>'+(es?"Resultado":"Score")+'</th><th>'
        +(es?"Línea objetivo":"Aimline")+'</th><th>'+(es?"Punto":"Bench")+'</th><th>'+(es?"Nota":"Note")+'</th></tr></thead><tbody>'
        +rows+'</tbody></table>'):('<p style="font-size:12px;color:#8A92A6;">'+(es?"Sin mediciones todavía. Registra la primera en el Monitor de Progreso IEP y esta página se completa sola.":"No measurements yet. Record the first one in the IEP Progress Monitor and this page fills itself in.")+'</p>'))
      +((typeof window.aogHomeMeetingBlock==="function")?(window.aogHomeMeetingBlock(id,es)||""):"")
            /* The student's own account, beside the goal it is context for. Returns ""
               for a student with no check-ins and no slips, so a page never grows an
               empty section. [[aog-iep-evidence]] */
            +((typeof window.aogIepEvidenceBlock==="function")?(window.aogIepEvidenceBlock(id,es)||""):"")
      +printProv(es,{range:evidenceRange(pts,es)})
      +'<div class="ft">'+(es?"Centrado en la relación · Datos de progreso guardados solo en este dispositivo · Usa iniciales o un código, nunca nombres completos.":"Relationship-centered · Progress data stored on this device only · Use initials or a code, never full names.")+'</div>'
      +'<p class="np"><button onclick="window.print()" style="font:inherit;font-weight:700;background:#0A1E33;color:#fff;border:0;border-radius:8px;padding:9px 18px;cursor:pointer;">'+(es?"Imprimir":"Print")+'</button></p></bo'+'dy></html>';
    w.document.write(doc); w.document.close(); w.focus();
    try{ w.print(); }catch(e){}
  };
  /* Shared print chrome for the signal strip, the provenance block and the
     meeting page. One string so paper never drifts from paper. */
  var AOG_IEP_PRINT_CSS=
     '.sig{display:block;font-size:12.5px;line-height:1.5;border-radius:8px;padding:8px 12px;margin:8px 0 0;border:1px solid #E4DAC5;background:#FBF8F1;color:#0A1E33;}'
    +'.sig b{font-weight:800;letter-spacing:.01em;}'
    +'.sig-on{border-color:#2E6B3A;background:rgba(46,107,58,.09);}'
    +'.sig-attention{border-color:#B4552D;background:rgba(180,85,45,.09);}'
    +'.sig-watch{border-color:#D9A33B;background:rgba(217,163,59,.11);}'
    +'.sig-more{border-color:#E4DAC5;background:#FBF8F1;color:#46506E;}'
    +'.prov{margin-top:20px;border-top:2px solid #D9A33B;padding-top:10px;page-break-inside:avoid;}'
    +'.prov-g{display:grid;grid-template-columns:1fr 1fr;gap:10px 26px;}'
    +'.prov-g>div{display:flex;align-items:flex-end;gap:8px;}'
    +'.prov-l{font-size:9.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#46506E;white-space:nowrap;}'
    +'.prov-r{flex:1;border-bottom:1px solid #6B7488;height:16px;}'
    +'.prov-n{margin-top:10px;font-size:10px;line-height:1.5;color:#46506E;}'
    +'.qa{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 18px;margin:10px 0 4px;}'
    +'.qa div{border:1px solid #E4DAC5;border-radius:8px;padding:7px 10px;}'
    +'.qa dt{font-size:9.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#46506E;margin:0 0 2px;}'
    +'.qa dd{margin:0;font-size:14px;font-weight:700;color:#0A1E33;}';

  /* The same two rules, as plain text for paper — INCLUDING the caveat the
     screen shows. Paper used to strip "not four in a row yet", which turned a
     hedge into a finding on the one copy that leaves the building. */
  function printDecide(g,pts,es){
    var fp=aogIepFourPoint(g,pts);
    if(fp) return '<div class="dec'+(fp.k==="above"?" good":"")+'">'
      +(fp.k==="below"?(es?"Cuatro seguidos por debajo de la línea objetivo — la lectura habitual es cambiar algo: la enseñanza, la práctica o la meta misma."
                          :"Four in a row below the aimline — the usual read is to change something: the teaching, the practice, or the goal itself.")
                     :(es?"Cuatro seguidos por encima de la línea objetivo — vale preguntar al equipo si la meta quedó demasiado baja."
                          :"Four in a row above the aimline — worth asking the team whether the goal is now set too low."))+'</div>';
    var tv=aogIepTrendVsAim(g,pts);
    if(tv) return '<div class="dec'+(tv.k==="steeper"?" good":"")+'">'
      +(tv.k==="steeper"?(es?"La tendencia es al menos tan pronunciada como la línea objetivo. A este ritmo la meta es alcanzable para la fecha objetivo."
                            :"The trend is at least as steep as the aimline. At this rate the goal is reachable by the target date.")
                       :(es?"La tendencia es más plana que la línea objetivo. Aún no son cuatro seguidos — vale observarlo, todavía no decidir."
                            :"The trend is flatter than the aimline. Not four in a row yet — worth watching, not yet worth a decision."))+'</div>';
    if(!aogIepAimDegenerate(g)&&pts.length&&pts.length<4) return '<div class="dec quiet">'
      +(es?("Cuatro mediciones es donde las reglas empiezan a leer — este registro tiene "+pts.length+". Ninguna regla ha opinado todavía.")
          :("Four measurements is where the rules start reading — this record holds "+pts.length+". Neither rule has spoken yet."))+'</div>';
    return "";
  }
  /* The signal, in the same four words the screen uses, for paper. */
  function printSignal(g,pts,es){
    var sg=aogIepSignal(g,pts,todayDayNum());
    var d=IEP_SIG[sg.k]||IEP_SIG.more;
    return '<div class="sig sig-'+sg.k+'"><b>'+esc(es?d.es:d.en)+'</b> '+esc(sigWhyPlain(sg,es))
      +(sg.stale?(" "+esc(es?("Última medición hace "+sg.stale+" días."):("Last measured "+sg.stale+" days ago."))):"")+'</div>';
  }
  function sigWhyPlain(sg,es){
    switch(sg&&sg.why){
      case "noAim":        return es?"No hay línea objetivo — la meta es igual al punto de partida.":"No aimline — the target equals the starting point.";
      case "none":         return es?"Sin mediciones registradas.":"No measurements recorded.";
      case "few":          return es?("Las reglas empiezan a leer con cuatro mediciones — hay "+sg.n+"."):("Four measurements is where the rules start reading — this record holds "+sg.n+".");
      case "fourBelow":    return es?"Cuatro seguidos por debajo de la línea objetivo.":"Four in a row below the aimline.";
      case "fourAbove":    return es?"Cuatro seguidos por encima de la línea objetivo.":"Four in a row above the aimline.";
      case "trendSteeper": return es?"La tendencia es al menos tan pronunciada como la línea objetivo.":"The trend is at least as steep as the aimline.";
      case "trendFlatter": return es?"La tendencia es más plana que la línea objetivo — aún no son cuatro seguidos.":"The trend is flatter than the aimline — not four in a row yet.";
      default:             return es?"Las mediciones recientes caen a ambos lados de la línea objetivo.":"Recent measurements sit on both sides of the aimline.";
    }
  }
  /* PROVENANCE. A page that looks official must say who made it, when, from
     what, and leave room for the signature that makes it a record. Without
     this a printout is an anonymous chart that a file cannot account for. */
  function printProv(es,opts){
    opts=opts||{};
    var now=new Date();
    var stamp=(now.getMonth()+1)+"/"+now.getDate()+"/"+now.getFullYear();
    var range=opts.range||(es?"—":"—");
    return '<div class="prov">'
      +'<div class="prov-g">'
        +'<div><span class="prov-l">'+(es?"Preparado por":"Prepared by")+'</span><span class="prov-r"></span></div>'
        +'<div><span class="prov-l">'+(es?"Cargo":"Role")+'</span><span class="prov-r"></span></div>'
        +'<div><span class="prov-l">'+(es?"Periodo de informe":"Reporting period")+'</span><span class="prov-r"></span></div>'
        +'<div><span class="prov-l">'+(es?"Firma":"Signature")+'</span><span class="prov-r"></span></div>'
      +'</div>'
      +'<div class="prov-n">'
        +(es?("Generado el "+stamp+" por el Monitor de Progreso IEP de Architecture of Grace, a partir de las mediciones registradas en este dispositivo. Evidencia en esta página: "+range+". Este documento resume datos; no es el IEP firmado ni una determinación del equipo.")
            :("Generated "+stamp+" by the Architecture of Grace IEP Progress Monitor from measurements recorded on this device. Evidence on this page: "+range+". This document summarizes data; it is not the signed IEP and not a team determination."))
      +'</div></div>';
  }
  function evidenceRange(pts,es){
    if(!pts||!pts.length) return es?"sin mediciones":"no measurements";
    var a=fdateStr(pts[0].date), b=fdateStr(pts[pts.length-1].date);
    return pts.length+" "+(es?(pts.length===1?"medición":"mediciones"):(pts.length===1?"measurement":"measurements"))+" · "+a+(a===b?"":(" – "+b));
  }
  function printBlankWarn(g,es){
    if(!aogIepGoalHasBlank(g&&g.title)) return "";
    return '<div class="dec">'+(es?"\u26A0 La redacción de esta meta todavía contiene un espacio en blanco (“__”). Complétala antes de que esto entre en un expediente."
                                  :"\u26A0 This goal statement still contains a blank (“__”). Finish the wording before this goes in a file.")+'</div>';
  }

  window.aogIepCsvDl=function(id){
    var st=load(); var g=st.goals[id]; if(!g) return;
    var pts=(st.data[id]||[]).slice().sort(byDate);
    var sp=aogIepPeriodSplit(g,pts), inSet={};
    sp.used.forEach(function(p){ inSet[p.date+"|"+p.value+"|"+(p.total==null?"":p.total)+"|"+(p.bench||"")]=1; });
    var deg=aogIepAimDegenerate(g);
    var rows=pts.map(function(p){
      /* raw rides in the note column so the CSV schema stays what every
         spreadsheet already expects, and the export still answers "1% of what?" */
      var o={date:p.date,value:p.value,total:(p.total==null?"":p.total),bench:(p.bench==null?"":p.bench),note:((p.raw!=null?("raw "+r1(p.raw)+(p.note?" — ":"")):"")+(p.note==null?"":p.note))};
      o.score=r1(aogIepEffVal(g,p));
      o.aim=deg?"":r1(aogIepAimAt(g,aogIepDayNum(p.date)));
      o.inPeriod=!!inSet[p.date+"|"+p.value+"|"+(p.total==null?"":p.total)+"|"+(p.bench||"")];
      return o;
    });
    var now=new Date();
    var csv=aogIepCsv(rows,{
      student:g.student||"", goal:g.title||"", area:(AREAS[g.area]||AREAS.other).en,
      measure:(MEAS[g.measure]||MEAS.percent).en, unit:g.unit||"", lowerBetter:!!g.lowerBetter,
      baselineValue:g.baseline.value, baselineDate:g.baseline.date,
      targetValue:g.target.value, targetDate:g.target.date,
      period:fdateStr(g.baseline.date)+" – "+fdateStr(g.target.date),
      exported:now.getFullYear()+"-"+pad2(now.getMonth()+1)+"-"+pad2(now.getDate())
    });
    var safe=function(s){ return String(s||"").replace(/[^\w\-]+/g,"_").replace(/^_+|_+$/g,"")||"goal"; };
    try{
      var blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
      var a=document.createElement("a");
      a.href=URL.createObjectURL(blob);
      a.download="AoG-IEP-"+safe(g.student)+"-"+safe(g.title).slice(0,40)+".csv";
      document.body.appendChild(a); a.click();
      setTimeout(function(){ try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e){} },400);
    }catch(e){}
  };

  window.aogIepPrint=function(student){
    var st=load();
    var es=(DTx("en","es")==="es");
    var gids=Object.keys(st.goals).filter(function(id){ return st.goals[id].student===student&&!st.goals[id].archived; });
    if(!gids.length){ alert(es?"No hay metas activas para este estudiante.":"No active goals for this student."); return; }
    var pal={ line:"#0A1E33", dot:"#fff", gold:"#D9A33B", grid:"#E4DAC5", txt:"#46506E", faint:"#8A92A6", trend:"#8A92A6",
                warn:"#9a6f24", good:"#2E6B3A", noHover:true,
                bench:["#3E5C9A","#B4552D","#2E6B3A","#6E4A9E","#1F7A8C","#8B2A2A"] };
    var secs=gids.map(function(id){
      var g=st.goals[id];
      var pts=(st.data[id]||[]).slice().sort(byDate);
      var rulePts=aogIepPeriodSplit(g,pts).used;
      var A=AREAS[g.area]||AREAS.other;
      var latest=pts.length?pts[pts.length-1]:null;
      var sum=(es?"Línea base ":"Baseline ")+fmtNum(g,g.baseline.value)+" ("+fdateStr(g.baseline.date)+")"
        +(latest?((es?" · Último ":" · Latest ")+fmtVal(g,latest)+" ("+fdateStr(latest.date)+")"):"")
        +(es?" · Meta ":" · Target ")+fmtNum(g,g.target.value)+" ("+fdateStr(g.target.date)+")"
        +" · "+evidenceRange(pts,es)
        +(g.lowerBetter?(es?" · menor es mejor":" · lower is better"):"")
        +(aogIepGradeNorm(g.grade)?((es?" · Grado ":" · Grade ")+aogIepGradeNorm(g.grade)):"");
      return '<div style="margin:20px 0 26px;page-break-inside:avoid;">'
        +'<h3 style="font-family:Georgia,serif;font-size:15px;color:#0A1E33;margin:0 0 4px;">'+esc(g.title)
        +' <span style="display:inline-block;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#fff;background:'+A.c+';border-radius:999px;padding:2px 9px;vertical-align:2px;">'+esc(es?A.es:A.en)+'</span></h3>'
        +'<div style="font-size:12px;color:#46506E;margin:0 0 8px;">'+esc(sum)+'</div>'
        +printBlankWarn(g,es)
        +chartSVG(g,pts,pal)
        +printSignal(g,rulePts,es)
        +printDecide(g,rulePts,es)
        +(g.notes?('<div style="font-size:11.5px;color:#8A92A6;margin-top:4px;">'+esc(g.notes)+'</div>'):'');
    }).join("");
    var allPts=[]; gids.forEach(function(id){ allPts=allPts.concat(st.data[id]||[]); }); allPts.sort(byDate);
    var allRange=evidenceRange(allPts,es)+" · "+gids.length+" "+(es?(gids.length===1?"meta":"metas"):(gids.length===1?"goal":"goals"));
    var title=(es?"Informe de progreso del IEP — ":"IEP progress report — ")+student;
    var w=window.open("","_blank");
    if(!w){ alert(es?"Permite las ventanas emergentes para imprimir.":"Please allow pop-ups to print."); return; }
    var doc='<!doctype html><html><head><meta charset="utf-8"><title>'+esc(title)+'</title><style>*{-webkit-print-color-adjust:exact;print-color-adjust:exact;}body{font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;color:#0A1E33;margin:36px;max-width:720px;}.bh{display:flex;align-items:center;gap:12px;border-bottom:3px solid #D9A33B;padding-bottom:12px;margin:0 0 16px;}.mk{width:40px;height:40px;border-radius:8px;background:#D9A33B;color:#0A1E33;font-family:Georgia,serif;font-weight:700;font-size:24px;display:flex;align-items:center;justify-content:center;}.wm{font-family:Georgia,serif;font-size:18px;font-weight:700;}.sb{font-size:12px;color:#46506E;}.dec{font-size:12.5px;line-height:1.5;border:1px solid #D9A33B;background:rgba(217,163,59,.12);color:#7a5510;border-radius:8px;padding:9px 12px;margin:8px 0 0;}.dec.good{border-color:#2E6B3A;background:rgba(46,107,58,.10);color:#245c2f;}.dec.quiet{border-color:#E4DAC5;background:#FBF8F1;color:#46506E;}'+AOG_IEP_PRINT_CSS+'.ft{margin-top:18px;border-top:1px solid #E4DAC5;padding-top:8px;font-size:10.5px;color:#8A92A6;}@media print{body{margin:.5in;}.np{display:none;}}</style></head><body><div class="bh"><span class="mk">A</span><div><div class="wm">Architecture of Grace</div><div class="sb">'+esc(title)+'</div></div></div>'
      +secs
      +printProv(es,{range:allRange})
      +'<div class="ft">'+(es?"Centrado en la relación · Datos de progreso guardados solo en este dispositivo · Usa iniciales o un código, nunca nombres completos.":"Relationship-centered · Progress data stored on this device only · Use initials or a code, never full names.")+'</div>'
      +'<p class="np"><button onclick="window.print()" style="font:inherit;font-weight:700;background:#0A1E33;color:#fff;border:0;border-radius:8px;padding:9px 18px;cursor:pointer;">'+(es?"Imprimir":"Print")+'</button></p></bo'+'dy></html>';
    w.document.write(doc); w.document.close(); w.focus();
    try{ w.print(); }catch(e){}
  };

  /* ==========================================================================
     MEETING VIEW — "the IEP meeting starts in five minutes."
     One page per goal, and on it only the six things a team actually asks:
     who, what goal, where they started, where the goal says they are going,
     where they are now, and whether the record is moving that way. Everything
     operational — Edit, Archive, Delete, the entry row, the benchmark chips —
     is gone. The summary paragraph DESCRIBES the data and stops there; the
     professional in the room does the interpreting, and the page says so.
     ====================================================================== */
  function meetingSummary(g,pts,es){
    if(!pts||!pts.length) return es?"Aún no se han registrado mediciones para esta meta.":"No measurements have been recorded for this goal yet.";
    var first=pts[0], last=pts[pts.length-1], out=[];
    out.push(es?("Desde una línea base de "+fmtNum(g,g.baseline.value)+" el "+fdateStr(g.baseline.date)+", se "+(pts.length===1?"registró 1 medición":("registraron "+pts.length+" mediciones"))+" entre el "+fdateStr(first.date)+" y el "+fdateStr(last.date)+".")
               :("From a baseline of "+fmtNum(g,g.baseline.value)+" on "+fdateStr(g.baseline.date)+", "+pts.length+" measurement"+(pts.length===1?" was":"s were")+" recorded between "+fdateStr(first.date)+" and "+fdateStr(last.date)+"."));
    out.push(es?("La medición más reciente es "+fmtVal(g,last)+" ("+fdateStr(last.date)+").")
               :("The most recent measurement is "+fmtVal(g,last)+" ("+fdateStr(last.date)+")."));
    if(!aogIepAimDegenerate(g)){
      var aim=r1(aogIepAimAt(g,aogIepDayNum(last.date))), v=r1(aogIepEffVal(g,last)), diff=r1(Math.abs(v-aim));
      var atOrPast=g.lowerBetter?(v<=aim+1e-9):(v>=aim-1e-9);
      out.push(diff<0.05
        ?(es?("En esa fecha la línea objetivo está en "+fmtNum(g,aim)+", por lo que la medición más reciente coincide con la línea objetivo.")
             :("On that date the aimline stands at "+fmtNum(g,aim)+", so the most recent measurement sits on the aimline."))
        :(es?("En esa fecha la línea objetivo está en "+fmtNum(g,aim)+", por lo que la medición más reciente está "+(atOrPast?"por encima de":"por debajo de")+" la línea objetivo por "+diff+".")
             :("On that date the aimline stands at "+fmtNum(g,aim)+", so the most recent measurement is "+(atOrPast?"above":"below")+" the aimline by "+diff+".")));
      out.push(es?("La meta anual es "+fmtNum(g,g.target.value)+" para el "+fdateStr(g.target.date)+".")
                 :("The annual target is "+fmtNum(g,g.target.value)+" by "+fdateStr(g.target.date)+"."));
    }
    return out.join(" ");
  }
  window.aogIepMeeting=function(student){
    var st=load();
    var es=(DTx("en","es")==="es");
    var gids=Object.keys(st.goals).filter(function(id){ return st.goals[id].student===student&&!st.goals[id].archived; });
    if(!gids.length){ alert(es?"No hay metas activas para este estudiante.":"No active goals for this student."); return; }
    gids.sort(function(a,b){ return String(st.goals[a].title||"").localeCompare(String(st.goals[b].title||"")); });
    var pal={ line:"#0A1E33", dot:"#fff", gold:"#D9A33B", grid:"#E4DAC5", txt:"#46506E", faint:"#8A92A6", trend:"#8A92A6",
              warn:"#9a6f24", good:"#2E6B3A", noHover:true,
              bench:["#3E5C9A","#B4552D","#2E6B3A","#6E4A9E","#1F7A8C","#8B2A2A"] };
    var allPts=[]; gids.forEach(function(id){ allPts=allPts.concat(st.data[id]||[]); }); allPts.sort(byDate);
    var tally={on:0,watch:0,attention:0,more:0}, tday=todayDayNum();
    var secs=gids.map(function(id,ix){
      var g=st.goals[id];
      var pts=(st.data[id]||[]).slice().sort(byDate);
      var rulePts=aogIepPeriodSplit(g,pts).used;
      var sg=aogIepSignal(g,rulePts,tday);
      tally[sg.k]++;
      var A=AREAS[g.area]||AREAS.other, M=MEAS[g.measure]||MEAS.percent;
      var latest=pts.length?pts[pts.length-1]:null;
      var notes=pts.filter(function(p){ return p&&p.note; }).slice(-3);
      var d=IEP_SIG[sg.k]||IEP_SIG.more;
      return '<section class="pg">'
        +'<div class="ghd"><span class="area" style="background:'+A.c+'">'+esc(es?A.es:A.en)+'</span>'
          +(aogIepGradeNorm(g.grade)?('<span class="gr">'+esc(es?"Grado ":"Grade ")+esc(aogIepGradeNorm(g.grade))+'</span>'):'')
          +'<span class="ix">'+(ix+1)+' / '+gids.length+'</span></div>'
        +'<h2>'+esc(g.title)+'</h2>'
        +printBlankWarn(g,es)
        +'<div class="mline">'+esc(es?M.es:M.en)+(g.lowerBetter?esc(es?" · menor es mejor":" · lower is better"):"")+'</div>'
        +'<dl class="qa">'
          +'<div><dt>'+(es?"Punto de partida":"Where they started")+'</dt><dd>'+esc(fmtNum(g,g.baseline.value))+'</dd><dd class="sm">'+esc(fdateStr(g.baseline.date))+'</dd></div>'
          +'<div><dt>'+(es?"Meta anual":"Where the goal says")+'</dt><dd>'+esc(fmtNum(g,g.target.value))+'</dd><dd class="sm">'+esc(es?"para el ":"by ")+esc(fdateStr(g.target.date))+'</dd></div>'
          +'<div><dt>'+(es?"Dónde están ahora":"Where they are now")+'</dt><dd>'+(latest?esc(fmtVal(g,latest)):'—')+'</dd><dd class="sm">'+(latest?esc(fdateStr(latest.date)):esc(es?"sin mediciones":"no measurements"))+'</dd></div>'
          +'<div><dt>'+(es?"Evidencia":"Evidence")+'</dt><dd>'+pts.length+'</dd><dd class="sm">'+esc(evidenceRange(pts,es))+'</dd></div>'
        +'</dl>'
        +'<div class="sig sig-'+sg.k+'"><b>'+esc(es?d.es:d.en)+'</b> '+esc(sigWhyPlain(sg,es))
          +(sg.stale?(" "+esc(es?("Última medición hace "+sg.stale+" días."):("Last measured "+sg.stale+" days ago."))):"")+'</div>'
        +'<div class="ch">'+chartSVG(g,pts,pal)+'</div>'
        +printDecide(g,rulePts,es)
        +'<div class="sum"><span class="lb">'+(es?"Lo que muestran los datos":"What the data shows")+'</span>'
          +'<p>'+esc(meetingSummary(g,pts,es))+'</p>'
          +'<span class="cav">'+(es?"Esta es una descripción de las mediciones registradas. No es una determinación del equipo ni una recomendación."
                                  :"This is a description of the measurements on record. It is not a team determination and not a recommendation.")+'</span></div>'
        /* §19 · THE ENVIRONMENT SNAPSHOT, if this goal was ever connected to
           home. A HOOK, not an inclusion: everything it knows lives in
           <script id="aog-home-school"> and it returns "" when there is
           nothing to say, so this page cannot grow an empty section and the
           IEP block gains no dependency it would miss if that block went.
           It returns INLINE light hex, never a CSS variable — see
           [[aog-iep-chart]], do not theme the printed one. */
        +((typeof window.aogHomeMeetingBlock==="function")?(window.aogHomeMeetingBlock(id,es)||""):"")
            /* The student's own account, beside the goal it is context for. Returns ""
               for a student with no check-ins and no slips, so a page never grows an
               empty section. [[aog-iep-evidence]] */
            +((typeof window.aogIepEvidenceBlock==="function")?(window.aogIepEvidenceBlock(id,es)||""):"")
        +(notes.length?('<div class="ctx"><span class="lb">'+(es?"Contexto registrado con las mediciones":"Context recorded with the measurements")+'</span><ul>'
            +notes.map(function(p){ return '<li><b>'+esc(fdateStr(p.date))+'</b> '+esc(p.note)+'</li>'; }).join("")+'</ul></div>'):'')
        +(g.notes?('<div class="ctx"><span class="lb">'+(es?"Nota de la meta":"Goal note")+'</span><p>'+esc(g.notes)+'</p></div>'):'')
        +'</section>';
    }).join("");
    var head=["on","watch","attention","more"].filter(function(k){ return tally[k]>0; }).map(function(k){
      var dd=IEP_SIG[k]; return '<span class="tl tl-'+k+'">'+tally[k]+' '+esc((es?dd.es:dd.en).toLowerCase())+'</span>';
    }).join("");
    var title=(es?"Vista de reunión IEP — ":"IEP meeting view — ")+student;
    var w=window.open("","_blank");
    if(!w){ alert(es?"Permite las ventanas emergentes para abrir la vista de reunión.":"Please allow pop-ups to open the meeting view."); return; }
    var css=''
      +'*{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;}'
      +'body{font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;color:#0A1E33;background:#FBF8F1;margin:0;padding:28px 22px 60px;}'
      +'.wrap{max-width:820px;margin:0 auto;}'
      +'.bh{display:flex;align-items:center;gap:14px;border-bottom:3px solid #D9A33B;padding-bottom:14px;margin:0 0 6px;}'
      +'.mk{width:46px;height:46px;border-radius:9px;background:#D9A33B;color:#0A1E33;font-family:Georgia,serif;font-weight:700;font-size:27px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;}'
      +'.wm{font-family:Georgia,serif;font-size:20px;font-weight:700;line-height:1.2;}'
      +'.sb{font-size:13px;color:#46506E;}'
      +'.hd2{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 4px;font-size:12px;color:#46506E;}'
      +'.tl{font-size:11px;font-weight:800;border-radius:999px;padding:3px 10px;border:1px solid #E4DAC5;background:#fff;}'
      +'.tl-on{border-color:#2E6B3A;color:#245c2f;background:rgba(46,107,58,.09);}'
      +'.tl-attention{border-color:#B4552D;color:#8f3f1f;background:rgba(180,85,45,.09);}'
      +'.tl-watch{border-color:#B4802A;color:#7a5510;background:rgba(217,163,59,.12);}'
      +'.tl-more{border-color:#C9CEDA;color:#5b6675;background:#fff;}'
      +'.pg{background:#fff;border:1px solid #E4DAC5;border-radius:14px;padding:22px 24px;margin:16px 0 20px;page-break-inside:avoid;break-inside:avoid;}'
      +'.pg+.pg{page-break-before:always;break-before:page;}'
      +'.ghd{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:0 0 8px;}'
      +'.area{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#fff;border-radius:999px;padding:3px 11px;}'
      +'.gr{font-size:10.5px;font-weight:800;color:#7a5510;background:rgba(217,163,59,.15);border:1px solid #D9A33B;border-radius:999px;padding:2px 9px;}'
      +'.ix{margin-left:auto;font-size:11px;font-weight:700;color:#46506E;}'
      +'h2{font-family:Georgia,serif;font-size:22px;line-height:1.32;margin:0 0 6px;font-weight:700;}'
      +'.mline{font-size:12px;color:#46506E;margin:0 0 12px;}'
      +'dl.qa{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 14px;}'
      +'dl.qa>div{border:1px solid #E4DAC5;border-radius:10px;padding:10px 12px;background:#FBF8F1;}'
      +'dl.qa dt{font-size:9.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#46506E;margin:0 0 4px;}'
      +'dl.qa dd{margin:0;font-size:21px;font-weight:800;line-height:1.15;font-family:Georgia,serif;}'
      +'dl.qa dd.sm{font-size:11px;font-weight:600;color:#46506E;font-family:inherit;margin-top:3px;}'
      +'.sig{display:block;font-size:13.5px;line-height:1.55;border-radius:10px;padding:11px 14px;margin:0 0 14px;border:1px solid #E4DAC5;background:#FBF8F1;}'
      +'.sig b{font-weight:800;}'
      +'.sig-on{border-color:#2E6B3A;background:rgba(46,107,58,.09);}'
      +'.sig-attention{border-color:#B4552D;background:rgba(180,85,45,.09);}'
      +'.sig-watch{border-color:#D9A33B;background:rgba(217,163,59,.12);}'
      +'.sig-more{border-color:#E4DAC5;background:#FBF8F1;color:#46506E;}'
      +'.ch{border:1px solid #E4DAC5;border-radius:10px;padding:10px 6px;overflow-x:auto;background:#fff;}'
      +'.dec{font-size:13px;line-height:1.55;border:1px solid #D9A33B;background:rgba(217,163,59,.12);color:#7a5510;border-radius:10px;padding:10px 14px;margin:12px 0 0;}'
      +'.dec.good{border-color:#2E6B3A;background:rgba(46,107,58,.10);color:#245c2f;}'
      +'.dec.quiet{border-color:#E4DAC5;background:#FBF8F1;color:#46506E;}'
      +'.lb{display:block;font-size:9.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#46506E;margin:0 0 5px;}'
      +'.sum{margin:14px 0 0;border-left:3px solid #D9A33B;padding:2px 0 2px 14px;}'
      +'.sum p{margin:0;font-size:14px;line-height:1.6;}'
      +'.cav{display:block;margin-top:7px;font-size:11px;color:#46506E;line-height:1.5;}'
      +'.ctx{margin:14px 0 0;font-size:12.5px;color:#46506E;}'
      +'.ctx ul{margin:0;padding-left:18px;}.ctx li{margin:2px 0;line-height:1.5;}.ctx p{margin:0;line-height:1.55;}'
      +'.np{position:sticky;bottom:0;display:flex;gap:10px;flex-wrap:wrap;padding:14px 0;margin-top:6px;background:#FBF8F1;border-top:1px solid #E4DAC5;}'
      +'.np button{font:inherit;font-size:14px;font-weight:700;border:0;border-radius:10px;padding:11px 22px;cursor:pointer;background:#0A1E33;color:#fff;}'
      +'.np button.alt{background:#fff;color:#0A1E33;border:1.5px solid #E4DAC5;}'
      +'.ft{margin-top:18px;border-top:1px solid #E4DAC5;padding-top:9px;font-size:10.5px;color:#46506E;line-height:1.55;}'
      +AOG_IEP_PRINT_CSS
      +'@media print{body{background:#fff;padding:0;margin:.45in;}.np{display:none;}.pg{border:0;padding:0;margin:0 0 14px;border-radius:0;}.wrap{max-width:none;}}'
      +'@media (max-width:640px){dl.qa{grid-template-columns:repeat(2,minmax(0,1fr));}h2{font-size:19px;}}';
    var doc='<!doctype html><html lang="'+(es?"es":"en")+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
      +'<title>'+esc(title)+'</title><style>'+css+'</style></head><body><div class="wrap">'
      +'<div class="bh"><span class="mk" aria-hidden="true">A</span><div><div class="wm">'+(es?"Vista de reunión IEP":"IEP Meeting View")+'</div>'
      +'<div class="sb">'+esc(student)+' · '+gids.length+' '+(es?(gids.length===1?"meta":"metas"):(gids.length===1?"goal":"goals"))+'</div></div></div>'
      +'<div class="hd2">'+head+'<span style="margin-left:auto">'+esc(evidenceRange(allPts,es))+'</span></div>'
      +secs
      +printProv(es,{range:evidenceRange(allPts,es)})
      +'<div class="ft">'+(es?"Centrado en la relación · Los datos de progreso se guardan solo en este dispositivo · Usa iniciales o un código, nunca nombres completos · Esta página resume mediciones; el IEP firmado es el registro."
                            :"Relationship-centered · Progress data is stored on this device only · Use initials or a code, never full names · This page summarizes measurements; the signed IEP is the record.")+'</div>'
      +'<div class="np"><button type="button" onclick="window.print()">'+(es?"Imprimir / Guardar PDF":"Print / Save PDF")+'</button>'
      +'<button type="button" class="alt" onclick="window.close()">'+(es?"Cerrar":"Close")+'</button></div>'
      +'</div></bo'+'dy></html>';
    w.document.write(doc); w.document.close(); w.focus();
  };

  /* Goal Builder integration — fully guarded; degrades to "open blank form on the IEP tab". */
  window.aogIepFromGoalBuilder=function(){
    try{
      var pre={student:"",area:"other",title:"",grade:"",notes:""};
      /* ⚠ THE STUDENT IS THE TYPED CODE. #aoggStudent is the optional
         "from a saved check-in" dropdown, which most teachers never touch —
         reading it first meant the student, and with it the grade lookup and
         everything the wizard pre-fills off a student, silently dropped on the
         way across. The code box is the field the Goal Builder itself prints
         on the goal, so it is the field that must travel. */
      var codeEl=document.getElementById("aoggCode");
      if(codeEl&&String(codeEl.value||"").trim()) pre.student=String(codeEl.value).trim();
      if(!pre.student){
        var sel=document.getElementById("aoggStudent");
        if(sel&&sel.value&&sel.selectedIndex>0) pre.student=(sel.options[sel.selectedIndex].textContent||"").trim();
      }
      var grEl=document.getElementById("aoggGrade");
      if(grEl&&String(grEl.value||"").trim()) pre.grade=String(grEl.value).trim();
      /* Where this goal came from, so the record can say so later. */
      var stdEl=document.getElementById("aoggStd");
      var stdTxt=(stdEl&&stdEl.selectedIndex>=0&&stdEl.options[stdEl.selectedIndex])?String(stdEl.options[stdEl.selectedIndex].textContent||"").trim():"";
      pre.notes=("Written in the Grace Goal Builder"+(stdTxt?(" · "+stdTxt):"")).slice(0,600);
      var comp=document.getElementById("aoggComp");
      var MAP={pause:"behavior",release:"behavior",charitable:"social",repair:"social",coach:"other"};
      if(comp&&MAP[comp.value]) pre.area=MAP[comp.value];
      if(typeof window.__aoggText==="string"&&window.__aoggText){
        var lines=window.__aoggText.split("\n").filter(function(l){ return l.trim(); });
        var gl=null;
        /* The generated document opens with a header line ("GRACE GOAL — …"),
           so falling back to lines[0] pre-filled the header instead of the goal.
           The statement is labeled "Goal Statement" in the Goal Builder's own
           dictionary; match that first, then the annual-goal phrasing, and only
           then fall back — skipping the header if that is all there is. */
        var LAB = /^(Goal Statement|Declaraci\u00f3n de la meta|Annual goal|Meta anual)\s*[:\u2014-]?\s*/i;
        for(var i=0;i<lines.length;i++){
          if(LAB.test(lines[i].trim())){
            var rest = lines[i].trim().replace(LAB,"").trim();
            gl = rest || (lines[i+1]||"").trim();
            if(gl) break;
          }
        }
        if(!gl){ for(var j=0;j<lines.length;j++){ var L=lines[j].trim();
          if(L.length>40 && !/^(GRACE GOAL|META GRACE)/i.test(L)){ gl=L; break; } } }
        pre.title=String(gl||lines[0]||"").trim().slice(0,1500);
      }
      openWiz(pre);
    }catch(e){ openWiz(null); }
    try{ if(typeof aogQsTab==="function") aogQsTab("iep"); else render(); }catch(e2){ try{ render(); }catch(e3){} }
  };

  /* ==================================================== THE SHARED RECORD
     Every active goal for one student, as DATA, for #aog-handoff
     to print and to seal into a link. This is the answer to "the direct data
     link should work for the IEP data that is graphed" — the chart travels
     as its numbers and is redrawn by the viewer, never as markup.

     ⚠ EVERY NUMBER COMES FROM THIS MODULE'S OWN ARITHMETIC. scaleFor,
     aogIepEffVal, aogIepAimAt, aogIepPeriodSplit, aogIepSignal,
     meetingSummary: the same calls the card and the Meeting View make. A
     second implementation would be a second place for the aimline to stop
     agreeing with itself, on the copy that goes in a file.

     ⚠ ONLY THE CONSERVATIVE RULES MAY SPEAK. The signal is read off
     aogIepPeriodSplit(...).used — points dated before the baseline are drawn
     and are NOT read — and the word is printed, never only a color.

     ⚠ WHAT IT IS NOT. Every page carries, in words, that it summarizes
     measurements, that it is not the signed IEP, and that it is not a team
     determination. [[aog-signed-iep-rule]] */
  window.aogIepPacket = function (student) {
    var st = load();
    var es = (DTx("en", "es") === "es");
    var gids = Object.keys(st.goals).filter(function (id) {
      return st.goals[id].student === student && !st.goals[id].archived;
    });
    if (!gids.length) return null;
    gids.sort(function (a, b) { return String(st.goals[a].title || "").localeCompare(String(st.goals[b].title || "")); });

    var tday = todayDayNum();
    var b = [];
    var tally = { on: 0, watch: 0, attention: 0, more: 0 };
    var allPts = [];
    gids.forEach(function (id) { allPts = allPts.concat(st.data[id] || []); });
    allPts.sort(byDate);

    b.push({ y: "note", h: DTx("What this is", "Qué es esto"),
             p: DTx("A description of the measurements recorded for this student on one device, goal by goal. It summarizes data. It is not the signed IEP, and nothing on it is a team determination — the team decides progress, in a meeting, with this and everything else in front of them.",
                    "Una descripción de las mediciones registradas para este estudiante en un dispositivo, meta por meta. Resume datos. No es el IEP firmado, y nada aquí es una determinación del equipo — el equipo decide el progreso, en una reunión, con esto y todo lo demás delante.") });

    gids.forEach(function (id, ix) {
      var g = st.goals[id];
      var pts = (st.data[id] || []).slice().sort(byDate);
      var split = aogIepPeriodSplit(g, pts);
      var sg = aogIepSignal(g, split.used, tday);
      tally[sg.k]++;
      var A = AREAS[g.area] || AREAS.other, M = MEAS[g.measure] || MEAS.percent;
      var last = pts.length ? pts[pts.length - 1] : null;
      var sc = scaleFor(g, pts);

      /* pb: every goal after the first opens a fresh printed page — Jimmy
         doesn't want a goal's story starting mid-page under the previous
         goal's chart. Goal 1 stays on page 1 with the What-this-is note. */
      b.push({ y: "note", pb: ix > 0, h: DTx("Goal ", "Meta ") + (ix + 1) + " · " + DTx(A.en, A.es),
               p: String(g.title || "") +
                  (aogIepGoalHasBlank(g.title)
                    ? ("  " + DTx("⚠ This goal statement still contains a blank (“__”).",
                                  "⚠ La redacción de esta meta todavía contiene un espacio en blanco («__»).")) : "") });

      b.push({ y: "kv", h: DTx("Where things stand", "Cómo va"), i: [
        [DTx("Where they started", "Punto de partida"), fmtNum(g, g.baseline.value) + " · " + fdateStr(g.baseline.date)],
        [DTx("Where the goal says", "Lo que dice la meta"), fmtNum(g, g.target.value) + " · " + fdateStr(g.target.date)],
        [DTx("Where they are now", "Dónde están ahora"), last ? (fmtVal(g, last) + " · " + fdateStr(last.date)) : DTx("no measurements yet", "aún sin mediciones")],
        [DTx("Evidence", "Evidencia"), evidenceRange(pts, es)]
      ],
        p: DTx("Signal: ", "Señal: ") + sigWord(sg.k) + " — " + sigWhyPlain(sg, es) +
           (sg.stale ? (" " + DTx("The most recent measurement is " + sg.stale + " days old, so this reads the past, not today.",
                                  "La medición más reciente tiene " + sg.stale + " días, así que esto describe el pasado, no hoy.")) : "") +
           " " + DTx("Measure: ", "Medida: ") + DTx(M.en, M.es) + "." });

      /* ---- the chart, as numbers ------------------------------------- */
      if (pts.length || !aogIepAimDegenerate(g)) {
        var bday = aogIepDayNum(g.baseline.date), tgt = aogIepDayNum(g.target.date);
        var x0 = Math.min(bday, tgt), x1 = Math.max(tgt, bday + 1);
        if (pts.length) {
          x0 = Math.min(x0, aogIepDayNum(pts[0].date));
          x1 = Math.max(x1, aogIepDayNum(pts[pts.length - 1].date));
        }
        var padX = Math.max(2, Math.round((x1 - x0) * 0.04));
        x0 -= padX; x1 += padX;
        var ser = [];
        if (!aogIepAimDegenerate(g)) {
          /* the aimline: two points, dashed, gold — the same figure the
             screen chart draws, and it is named at its own end. */
          ser.push({ n: DTx("Aimline", "Línea objetivo"), c: "#9A6F24", cd: "#E8BE63", dash: "7 5", dot: 0,
                     p: [[bday, +g.baseline.value], [tgt, +g.target.value]] });
        }
        var mp = pts.map(function (p) { return [aogIepDayNum(p.date), aogIepEffVal(g, p)]; })
                    .filter(function (q) { return isFinite(q[1]); });
        if (mp.length) ser.push({ n: DTx("Measured", "Medido"), c: "#0A1E33", cd: "#BFD6EE", dot: 1, p: mp });
        var mid = Math.round((x0 + x1) / 2);
        b.push({ y: "chart", h: DTx("Progress against the aimline", "Progreso frente a la línea objetivo"),
                 ymin: sc.min, ymax: sc.max, yt: sc.ticks, yu: sc.unit,
                 xmin: x0, xmax: x1,
                 xl: [[x0, fdate(x0), "start"], [mid, fdate(mid), "middle"], [x1, fdate(x1), "end"]],
                 ser: ser,
                 key: DTx("The dashed line is the aimline — a straight line from the starting point to the annual target. The solid line is what was measured.",
                          "La línea discontinua es la línea objetivo — una recta del punto de partida a la meta anual. La línea continua es lo medido."),
                 p: meetingSummary(g, pts, es) + " " +
                    DTx("This is a description of the measurements on record. It is not a team determination and not a recommendation.",
                        "Esta es una descripción de las mediciones registradas. No es una determinación del equipo ni una recomendación.") +
                    (split.early.length
                      ? (" " + DTx(split.early.length + " measurement(s) dated before the baseline are drawn but are not read by the decision rules — the aimline does not exist yet on those dates.",
                                   split.early.length + " medición(es) con fecha anterior a la línea base se dibujan pero no las leen las reglas — la línea objetivo aún no existe en esas fechas."))
                      : "") });
      }

      /* ---- the measurements themselves -------------------------------- */
      if (pts.length) {
        b.push({ y: "table", h: DTx("Every measurement on record", "Todas las mediciones registradas"),
                 cols: [DTx("Date", "Fecha"), DTx("Value", "Valor"), DTx("Aimline that day", "Línea objetivo ese día"), DTx("Note", "Nota")],
                 rows: pts.map(function (p) {
                   return [fdateStr(p.date), fmtVal(g, p),
                           aogIepAimDegenerate(g) ? "—" : fmtNum(g, aogIepAimAt(g, aogIepDayNum(p.date))),
                           String(p.note || "")];
                 }),
                 p: DTx("Nothing is altered on the way out — the aimline column is the same arithmetic the chart draws.",
                        "Nada se altera al salir — la columna de la línea objetivo es la misma aritmética que dibuja la gráfica.") });
      }
    });

    b.push({ y: "prov", h: DTx("Provenance", "Procedencia"), i: [
      [DTx("Prepared by", "Preparado por"), ""],
      [DTx("Role", "Cargo"), ""],
      [DTx("Reporting period", "Periodo de informe"), ""],
      [DTx("Signature", "Firma"), ""]
    ],
      p: DTx("Generated by the Architecture of Grace IEP Progress Monitor from measurements recorded on one device. Evidence in this record: ",
             "Generado por el Monitor de Progreso IEP de Architecture of Grace a partir de mediciones registradas en un dispositivo. Evidencia en este registro: ") +
         evidenceRange(allPts, es) +
         DTx(". This document summarizes data; it is not the signed IEP and not a team determination.",
             ". Este documento resume datos; no es el IEP firmado ni una determinación del equipo.") });

    var line = ["on", "watch", "attention", "more"].filter(function (k) { return tally[k] > 0; })
      .map(function (k) { return tally[k] + " " + sigWord(k).toLowerCase(); }).join(" · ");

    return {
      v: 1, k: "iep",
      t: DTx("IEP progress", "Progreso IEP"),
      s: String(student || ""),
      c: gids.length + " " + (gids.length === 1 ? DTx("goal", "meta") : DTx("goals", "metas")) + (line ? (" · " + line) : ""),
      r: evidenceRange(allPts, es),
      g: new Date().toISOString(), b: b
    };
  };

  /* Register dashboard i18n keys alongside the existing DASH_I18N/TAB_HINTS/TAB_HELP dicts. */
  try{
    if(typeof DASH_I18N!=="undefined"){
      DASH_I18N.dl_t_iep={en:"IEP Progress",es:"Progreso IEP"};
      DASH_I18N.dl_iep_h1={en:"The Build · IEP progress monitor",es:"La Obra · monitor de progreso IEP"};
      DASH_I18N.dl_iep_sub={
        en:"Chart every IEP goal against its aimline — quick data entry, trend lines, CSV export, and printable per-student reports. It charts what an adult records and observes — student self-reflection scores never enter it. Private and saved on this device.",
        es:"Grafica cada meta del IEP contra su línea objetivo — captura rápida de datos, líneas de tendencia, exportación CSV e informes imprimibles por estudiante. Grafica lo que un adulto registra y observa — las autorreflexiones del estudiante nunca entran aquí. Privado y guardado en este dispositivo."
      };
    }
  }catch(e){}
  try{ if(typeof TAB_HINTS!=="undefined"){ TAB_HINTS.iep={en:"Baseline → target, one chart per goal — private to this device.",es:"De la línea base a la meta, una gráfica por meta — privado en este dispositivo."}; } }catch(e){}
  try{
    if(typeof TAB_HELP!=="undefined"){
      TAB_HELP.iep={
        en:"<h5>IEP Progress — goal by goal</h5>Chart each IEP goal from <strong>baseline to target</strong>: log quick data points, watch them against the dashed gold <strong>aimline</strong>, and print a per-student report for meetings. Use initials or a student code — everything stays on this device.",
        es:"<h5>Progreso IEP — meta por meta</h5>Grafica cada meta del IEP de la <strong>línea base a la meta</strong>: registra datos rápidos, compáralos con la <strong>línea objetivo</strong> dorada punteada e imprime un informe por estudiante para reuniones. Usa iniciales o un código — todo permanece en este dispositivo."
      };
    }
  }catch(e){}

  function applyEsStatics(){
    try{
      if(typeof dashLang!=="undefined"&&dashLang==="es"&&typeof DASH_I18N!=="undefined"){
        var tb=document.querySelector('#screen-admin .tab[data-tab="iep"]');
        if(tb&&DASH_I18N.dl_t_iep) tb.textContent=DASH_I18N.dl_t_iep.es;
        var nodes=document.querySelectorAll('#panel-iep [data-dl]');
        for(var i=0;i<nodes.length;i++){ var k=nodes[i].getAttribute("data-dl"); if(DASH_I18N[k]) nodes[i].textContent=DASH_I18N[k].es; }
      }
    }catch(e){}
  }
  function init(){
    applyEsStatics();
    try{ document.addEventListener("keydown",function(ev){ try{ if(!ST.formOpen) return; var k=ev.key||ev.keyCode; if(k==="Escape"||k==="Esc"||k===27){ if(ev.preventDefault) ev.preventDefault(); window.aogIepWizDismiss("esc"); } }catch(e2){} }); }catch(e){}
    try{ if(typeof window.addEventListener==="function") window.addEventListener("scroll",stickyOnScroll,{passive:true}); }catch(e3){}
    render();
  }
  /* ⚠ READ-ONLY EXPORT · ONE SOURCE FOR THE DECISION RULES.
     "One student, one story" needs to say a goal's state on the student
     report, and the four honest states are computed HERE by rules that are
     deliberately conservative (four consecutive points, or six for a trend).
     A second implementation over there is a second place for "on track" to
     stop meaning what this module means by it — the same argument that
     widened AOGExitView rather than letting the student door re-implement
     `gist` and `patterns`.
     Nothing here writes, and nothing here renders. */
  try{
    window.AOGIepRead = {
      load: load,
      goalsFor: function(student){
        var st=load(), want=String(student==null?"":student).trim().toLowerCase(), out=[];
        Object.keys(st.goals||{}).forEach(function(id){
          var g=st.goals[id]; if(!g) return;
          if(String(g.student==null?"":g.student).trim().toLowerCase()!==want) return;
          out.push({ id:id, g:g, pts:(st.data[id]||[]).slice().sort(byDate) });
        });
        return out;
      },
      signal: aogIepSignal,
      periodSplit: aogIepPeriodSplit,
      dayNum: aogIepDayNum,
      effVal: aogIepEffVal,
      areaLabel: function(k){ var a=AREAS[k]; return a? DTx(a.en,a.es) : ""; },
      /* The WORD and the REASON, not a color and not a re-derivation. Color
         is never the information here, and the word a second screen prints
         must be the same word the print, the CSV and the meeting page use. */
      sigWord: sigWord,
      sigWhy: sigWhy,
      /* .30da — the Meeting Brief renders the SAME chart and the SAME
         readiness/trend math this module draws, never a re-derivation. */
      chart: chartSVG,
      trend: aogIepTrendVsAim,
      readiness: aogIepReadiness
    };
  }catch(eX){}

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();
