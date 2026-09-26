/* ══ aog-ieppw-core.js — THE IEP PAPERWORK ENGINE, SHARED (2026-09-26) ═══════════════════════════
   The dependency-free core of the classic dashboard's IEP paperwork block (index.html, between
   AOG-IEPPW-PURE-START and AOG-IEPPW-PURE-END), copied verbatim so the new dashboard's Paperwork room
   writes the same documents from the same stores: aog.iepdocs.v1 (docs, goalMeta) and aog.iep.v1
   (goals, data points). Change the wording here and in index.html together, or move index.html to
   this file. Exposed as window.AOG_IEPPW. ═══════════════════════════════════════════════════════════ */
(function(){
  /* ==== AOG-IEPPW-PURE-START (dependency-free — extracted verbatim by AoG-IepPaperwork.harness.mjs) ==== */
  var PW_TYPES={initial:"Initial Evaluation",reeval:"Reevaluation",annual:"Annual Review",goalpages:"IEP Goal Pages"};
  var PW_RATE={adequate:"Adequate progress",variable:"Variable progress",limited:"Limited progress",met:"Goal met",exceeded:"Goal exceeded"};
  var PW_CRATE={consistent:"Consistent",developing:"Developing",concern:"Area of concern"};
  var PW_FREQ={period:"Per period",daily:"Daily",weekly:"Weekly",occasional:"Occasional"};
  function aogIeppwDayNum(d){ var p=String(d||"").split("-"); if(p.length<3) return 0; return Math.round(Date.UTC(+p[0],+p[1]-1,+p[2])/86400000); }
  function aogIeppwDayLbl(day){ var d=new Date(day*86400000), y=d.getUTCFullYear();
    return (d.getUTCMonth()+1)+"/"+d.getUTCDate()+"/"+((y>=1000&&y<=9999)?String(y).slice(2):String(y)); }
  /* The paperwork twin of aogIepDateSane — different IIFE, so it gets its own. */
  function aogIeppwDateSane(d){ var s=String(d||""); if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s)) return false;
    var y=+s.slice(0,4), m=+s.slice(5,7), dd=+s.slice(8,10);
    return y>=1900 && y<=2199 && m>=1 && m<=12 && dd>=1 && dd<=31; }
  function aogIeppwFDate(ds){ var p=String(ds||"").split("-"); if(p.length<3) return String(ds||""); return (+p[1])+"/"+(+p[2])+"/"+String(p[0]).slice(2); }
  function aogIeppwR1(v){ return Math.round((+v)*100)/100; }  /* paperwork twin of r1 */
  function aogIeppwAimAt(g,day){ var b=aogIeppwDayNum(g.baseline.date), t=aogIeppwDayNum(g.target.date), bv=+g.baseline.value, tv=+g.target.value; if(t<=b) return tv; if(day<=b) return bv; if(day>=t) return tv; return bv+(tv-bv)*(day-b)/(t-b); }
  function aogIeppwEffVal(g,p){ if(g&&(g.measure==="trials"||g.measure==="steps")){ var t=+p.total; if(!isFinite(t)||t<=0) return 0; return Math.round(+p.value/t*10000)/100; } return +p.value; }
  function aogIeppwUnit(g){ var m=g&&g.measure; if(m==="percent"||m==="trials"||m==="steps") return "%"; if(m==="wcpm") return " "+((g&&g.unit)||"wcpm"); if(m==="duration") return " min"; if(m==="rating") return "/5"; if(m==="latency") return " "+((g&&g.unit)||"seconds"); if(m==="interval") return " "+((g&&g.intervalLabel)||"per 10 min"); return (g&&g.unit)?(" "+g.unit):""; }
  function aogIeppwLblY(y,below,top,bottom){
    if(below) return (y+14<=bottom-2)?(y+14):(y-8);
    return (y-8>=top+9)?(y-8):(y+14);
  }
  function aogIeppwAimDeg(g){ if(!g||!g.baseline||!g.target) return true; var bv=+g.baseline.value, tv=+g.target.value; if(!isFinite(bv)||!isFinite(tv)) return true; return bv===tv; }
  var PW_IMPACT=[["imp_academic","Academic performance"],["imp_social","Social/emotional status"],["imp_indep","Independent functioning"],["imp_voc","Vocational"],["imp_motor","Motor skills"],["imp_speech","Speech and language/communication"]];
  var PW_PN=["IEP Review/Revision","Progress Report","Parent Conference"];
  var PW_IMPL=["Special Education Teacher","Social Worker","General Education Teacher","Speech/Language (SLP)"];
  var PW_EVALPROC=["Observation","Daily Class Work","Charting","Daily Log","Formal Tests","Other"];
  var PW_GAREAS=["Academic","Functional","Transition","Other"];
  var PW_GTYPES=["Reading Decoding/Fluency","Reading Comprehension","Written Expression","Math (Computation)","Math Problem Solving","Social Emotional","Behavior","Communication/Speech","Occupational Therapy","Physical Therapy","Executive Functioning","Functional/Daily Living","Transition"];
  var PW_FORMS={
    isbe:{id:"isbe",name:{en:"Illinois — ISBE 34-54M (EMBRACE)",es:"Illinois — ISBE 34-54M (EMBRACE)"},lbl:{
      baseline:{en:"Baseline",es:"Línea base"},target:{en:"Target",es:"Meta"},
      beginDate:{en:"Begin Date",es:"Fecha de inicio"},masteryDate:{en:"Anticipated Mastery Date",es:"Fecha prevista de dominio"},
      criteria:{en:"Criteria for Mastery",es:"Criterio de dominio"},
      dob:{en:"DOB",es:"Fecha de nacimiento"},conference:{en:"Conference Date",es:"Fecha de la reunión"},
      progressNote:{en:"Progress",es:"Progreso"}}},
    generic:{id:"generic",name:{en:"Generic IEP wording",es:"Redacción genérica de IEP"},lbl:{
      baseline:{en:"Starting point",es:"Punto de partida"},target:{en:"Goal level",es:"Nivel meta"},
      beginDate:{en:"Start date",es:"Fecha de inicio"},masteryDate:{en:"Target date",es:"Fecha meta"},
      criteria:{en:"Mastery criteria",es:"Criterio de dominio"},
      dob:{en:"Date of birth",es:"Fecha de nacimiento"},conference:{en:"Meeting date",es:"Fecha de la reunión"},
      progressNote:{en:"Progress note",es:"Nota de progreso"}}}
  };
  function aogIeppwFormIds(){ return ["isbe","generic"]; }
  function aogIeppwForm(id){ return PW_FORMS[id]||PW_FORMS.isbe; }
  function aogIeppwFL(id,key,es){ var f=aogIeppwForm(id), o=f.lbl&&f.lbl[key]; if(!o) return String(key); return es?(o.es||o.en):o.en; }
  function aogIeppwAreaMap(area){ if(area==="tr_emp"||area==="tr_edu"||area==="tr_ind") return "Transition"; return (area==="math"||area==="reading"||area==="writing")?"Academic":"Functional"; }
  function aogIeppwBenchLetter(i){ i=+i||0; var s=""; do{ s=String.fromCharCode(65+(i%26))+s; i=Math.floor(i/26)-1; }while(i>=0); return s; }
  function aogIeppwGoalSeq(items){
    items=items||[];
    var out={}, used={}, i, n;
    for(i=0;i<items.length;i++){ n=parseInt(items[i].num,10); if(isFinite(n)&&n>0&&!used[n]){ out[items[i].gid]=n; used[n]=1; } }
    var next=1;
    for(i=0;i<items.length;i++){ if(out[items[i].gid]!=null) continue; while(used[next]) next++; out[items[i].gid]=next; used[next]=1; }
    return out;
  }
  function aogIeppwScoringDefault(g){
    var m=g&&g.measure;
    if(m==="percent") return "Percent accuracy (progress monitoring chart)";
    if(m==="trials") return "Percent accuracy across trials, x of y (progress monitoring chart)";
    if(m==="duration") return "Duration in minutes (progress monitoring chart)";
    if(m==="rating") return "Rating scale 1\u20135 (progress monitoring chart)";
    if(m==="count") return "Count/frequency"+(g&&g.unit?(" of "+g.unit):"")+" (progress monitoring chart)";
    if(m==="wcpm") return "Words correct per minute on grade-level passages, one-minute oral reading probe (progress monitoring chart)";
    if(m==="latency") return "Latency in seconds (progress monitoring chart)";
    if(m==="steps") return "Steps completed of task analysis";
    if(m==="interval") return "Frequency per interval";
    return "Progress monitoring chart";
  }
  function aogIeppwGoalStatement(g){ var t=(g&&g.title?String(g.title).trim():""); var n=(g&&g.notes?String(g.notes).trim():""); return t+(t&&n?" \u2014 ":"")+n; }
  function aogIeppwXofYStr(g,which){
    var x=g&&g.xofy; if(!x) return "";
    var n=(which==="t")?x.tn:x.bn, d=(which==="t")?x.td:x.bd;
    if(n==null||n===""||d==null||d===""||!isFinite(+n)||!isFinite(+d)||+d<=0) return "";
    return (+n)+" of "+(+d);
  }
  function aogIeppwLevelText(g,which){
    var src=(which==="t")?(g&&g.target):(g&&g.baseline);
    if(!src||src.value==null||!isFinite(+src.value)) return "";
    var xy=aogIeppwXofYStr(g,which), v=aogIeppwR1(+src.value)+aogIeppwUnit(g);
    return xy?(xy+" ("+v+")"):v;
  }
  function aogIeppwLevelDate(g,meta,which){
    var ov=meta?((which==="t")?meta.masteryDate:meta.beginDate):"";
    if(ov!=null&&String(ov).trim()!=="") return aogIeppwFDate(String(ov).trim());
    var src=(which==="t")?(g&&g.target):(g&&g.baseline);
    return (src&&src.date)?aogIeppwFDate(src.date):"";
  }
  function aogIeppwSlope(vals){
    var n=vals.length; if(n<2) return 0;
    var sx=0,sy=0,sxx=0,sxy=0,i;
    for(i=0;i<n;i++){ sx+=i; sy+=vals[i]; sxx+=i*i; sxy+=i*vals[i]; }
    var d=n*sxx-sx*sx; if(!d) return 0;
    return (n*sxy-sx*sy)/d;
  }
  /* A DRAFT sentence built only from points already recorded. Never a conclusion
     about the child, never auto-final — the teacher edits it before it ships. */
  function aogIeppwNarrative(g,pts,opts){
    opts=opts||{};
    var es=!!opts.es, crit=String(opts.criteria||"").trim(), scope=opts.scope||"goal";
    function T(en,sp){ return es?sp:en; }
    pts=(pts||[]).slice().sort(function(a,b){ return a.date<b.date?-1:(a.date>b.date?1:0); });
    var n=pts.length, i;
    if(!n) return scope==="bench"
      ? T("No data points have been tagged to this benchmark yet.","Aún no hay datos etiquetados a este punto de referencia.")
      : T("No data points have been recorded for this goal yet.","Aún no hay puntos de datos registrados para esta meta.");
    var u=aogIeppwUnit(g), out=[], vals=[];
    for(i=0;i<n;i++) vals.push(aogIeppwEffVal(g,pts[i]));
    out.push(n===1
      ? (T("1 data point recorded on ","1 punto de datos registrado el ")+aogIeppwFDate(pts[0].date)+".")
      : (n+T(" data points recorded from "," puntos de datos registrados del ")+aogIeppwFDate(pts[0].date)+T(" to "," al ")+aogIeppwFDate(pts[n-1].date)+"."));
    var k=Math.min(3,n), rec=[];
    for(i=n-k;i<n;i++) rec.push(aogIeppwR1(vals[i])+u);
    out.push((k===1?T("The score was ","El puntaje fue "):(k===n?T("The scores were ","Los puntajes fueron "):T("The three most recent scores were ","Los tres puntajes más recientes fueron ")))+rec.join(", ")+".");
    if(!aogIeppwAimDeg(g)){
      var aim=aogIeppwAimAt(g,aogIeppwDayNum(pts[n-1].date)), v=vals[n-1];
      var on=(g&&g.lowerBetter)?(v<=aim+1e-9):(v>=aim-1e-9);
      var w=(g&&g.lowerBetter)?(on?T("at or below","igual o por debajo de"):T("above","por encima de")):(on?T("at or above","igual o por encima de"):T("below","por debajo de"));
      out.push(T("The most recent score is ","El puntaje más reciente está ")+w+T(" the aimline value of "," el valor de la línea meta de ")+aogIeppwR1(aim)+u+T(" for that date."," para esa fecha."));
    }
    if(n>=3){
      var sl=aogIeppwSlope(vals), mx=vals[0], mn=vals[0];
      for(i=1;i<n;i++){ if(vals[i]>mx) mx=vals[i]; if(vals[i]<mn) mn=vals[i]; }
      var move=Math.abs(sl)*(n-1), flat=(!isFinite(move))||move<Math.max(0.5,(mx-mn)*0.1);
      out.push(flat?T("Across the full record the scores are about level.","En todo el registro los puntajes se mantienen parejos.")
        :(sl>0?T("Across the full record the scores are rising.","En todo el registro los puntajes van en aumento.")
              :T("Across the full record the scores are falling.","En todo el registro los puntajes van a la baja.")));
    }
    if(crit) out.push(T("Criteria for mastery: ","Criterio de dominio: ")+crit+".");
    return out.join(" ");
  }
  function aogIeppwProgressRows(g,pts){
    pts=(pts||[]).slice().sort(function(a,b){ return a.date<b.date?-1:(a.date>b.date?1:0); });
    var u=aogIeppwUnit(g), out=[], deg=aogIeppwAimDeg(g);
    for(var i=0;i<pts.length;i++){
      var p=pts[i], v=aogIeppwEffVal(g,p);
      var aim=aogIeppwAimAt(g,aogIeppwDayNum(p.date));
      var on=(g&&g.lowerBetter)?(v<=aim+1e-9):(v>=aim-1e-9);
      out.push({key:p.date+"#"+i,date:aogIeppwFDate(p.date),score:aogIeppwR1(v)+u,def:deg?"":(on?"adequate":"limited")});
    }
    return out;
  }
  function aogIeppwBenchRows(g,pts,letter){ return aogIeppwProgressRows(g,(pts||[]).filter(function(p){ return p&&String(p.bench||"")===String(letter); })); }
  function aogIeppwGoalMeta(store,gid){
    var gm=(store&&store.goalMeta&&store.goalMeta[gid])||{};
    return {
      goalNum:gm.goalNum!=null?gm.goalNum:"", goalType:gm.goalType||"", goalArea:gm.goalArea||"", grade:gm.grade!=null?String(gm.grade):"",
      parentNotification:Array.isArray(gm.parentNotification)?gm.parentNotification.slice():[], parentNotificationOther:gm.parentNotificationOther||"",
      progressDates:gm.progressDates||"", implementors:Array.isArray(gm.implementors)?gm.implementors.slice():[], implementorsOther:gm.implementorsOther||"",
      presentLevelForGoal:gm.presentLevelForGoal||"", coreStandards:gm.coreStandards||"", stateStandards:gm.stateStandards||"",
      baselineText:gm.baselineText!=null?gm.baselineText:null, targetText:gm.targetText!=null?gm.targetText:null,
      beginDate:gm.beginDate||"", masteryDate:gm.masteryDate||"", progressNote:gm.progressNote!=null?gm.progressNote:null,
      goalStatement:gm.goalStatement!=null?gm.goalStatement:null, scoringMethod:gm.scoringMethod!=null?gm.scoringMethod:null,
      includeChart:gm.includeChart!==false, evaluatedBy:gm.evaluatedBy||"",
      benchmarks:Array.isArray(gm.benchmarks)?JSON.parse(JSON.stringify(gm.benchmarks)):[],
      progressRows:(gm.progressRows&&typeof gm.progressRows==="object")?JSON.parse(JSON.stringify(gm.progressRows)):{},
      benchRows:(gm.benchRows&&typeof gm.benchRows==="object")?JSON.parse(JSON.stringify(gm.benchRows)):{}
    };
  }
  function aogIeppwLoadFix(st){
    if(!st||typeof st!=="object") st={};
    if(!st.docs||typeof st.docs!=="object") st.docs={};
    if(!st.goalMeta||typeof st.goalMeta!=="object") st.goalMeta={};
    return st;
  }
  function aogIeppwGoalGrade(g,meta){ var gr=(g&&g.grade!=null)?String(g.grade).trim():""; if(gr) return gr; return (meta&&meta.grade!=null)?String(meta.grade).trim():""; }
  function aogIeppwStudentGrade(iep,student){ student=String(student==null?"":student).trim(); if(!student) return ""; var goals=(iep&&iep.goals)||{}, best="", bestKey=""; Object.keys(goals).forEach(function(id){ var g=goals[id]; if(!g||String(g.student==null?"":g.student).trim()!==student) return; var gr=(g.grade!=null)?String(g.grade).trim():""; if(!gr) return; var k=String((g.baseline&&g.baseline.date)||"")+"|"+id; if(!best||k>bestKey){ best=gr; bestKey=k; } }); return best; }
  function aogIeppwFooter(ds){ if(!ds){ var d=new Date(); ds=(d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear(); } return "IEP support document \u00b7 generated on-device \u00b7 "+ds; }
  function aogIeppwActiveGoals(iep,student){
    var out=[];
    Object.keys((iep&&iep.goals)||{}).forEach(function(id){
      var g=iep.goals[id];
      if(!g||g.archived||(g.student||"")!==student) return;
      out.push({gid:id,g:g});
    });
    out.sort(function(a,b){ return ((a.g.title||"")).localeCompare(b.g.title||""); });
    return out;
  }
  /* ⚠ A goal page is the most official-looking thing this app prints. Anything
     on it that a machine wrote and a person has not yet edited must SAY SO, or
     a draft can be mistaken for the signed record. */
  var PW_DRAFT_BENCH="Drafted here from the aimline \u2014 not transcribed from the signed IEP. Confirm against that document.";
  var PW_DRAFT_NOTE="Draft written from the recorded data points \u2014 review and edit before this goes in the IEP.";
  /* ⚠ On the state form the Progress column is a TEAM DETERMINATION. This tool
     can only compare one score with the aimline on one date, which is not the
     same judgement and must never be mistaken for it. So the comparison is
     offered as a suggestion, it is marked as a suggestion in the editor, and
     it prints marked — with the Evaluated By column blank until a person puts
     their initials in it. Same rule as the drafted benchmarks above. */
  var PW_DRAFT_RATE="Suggested by comparing this one score with the aimline. On the state form the Progress column is a team determination \u2014 confirm each row and enter who evaluated it.";
  var PW_DRAFT_RATE_ES="Sugerido al comparar este puntaje con la línea objetivo. En el formulario estatal la columna Progreso es una determinación del equipo \u2014 confirma cada fila e indica quién evaluó.";
  function aogIeppwRateSuggested(ov,def){ return !!(def&&!(ov&&ov.progress)); }
  function aogIeppwIsDrafted(bm){ return !!(bm&&bm.src==="aimline"&&String(bm.text||"").trim()); }
  function aogIeppwGoalPageText(num,g,meta,pts,formId){
    var T=[];
    T.push("Goal #: "+num);
    if(meta.goalType) T.push("Goal Type: "+meta.goalType);
    T.push("Goal Area: "+(meta.goalArea||aogIeppwAreaMap(g&&g.area)));
    var ggr=aogIeppwGoalGrade(g,meta); if(ggr) T.push("Grade: "+ggr);
    var pn=(meta.parentNotification||[]).slice(); if(meta.parentNotificationOther) pn.push("Other: "+meta.parentNotificationOther);
    if(pn.length) T.push("Method of Parent Notification: "+pn.join(", "));
    if(meta.progressDates) T.push("Date(s) parent will be provided with progress: "+meta.progressDates);
    var im=(meta.implementors||[]).slice(); if(meta.implementorsOther) im.push("Other: "+meta.implementorsOther);
    if(im.length) T.push("Title(s) of Goal Implementor(s): "+im.join(", "));
    if(meta.presentLevelForGoal){ T.push("PRESENT LEVEL RELATED TO THE GOAL:"); T.push(meta.presentLevelForGoal); }
    if(meta.coreStandards) T.push("Core Standards: "+meta.coreStandards);
    if(meta.stateStandards) T.push("State Standards: "+meta.stateStandards);
    var stmt=meta.goalStatement!=null?meta.goalStatement:aogIeppwGoalStatement(g);
    if(stmt){ T.push("GOAL STATEMENT:"); T.push(stmt); }
    var sm=meta.scoringMethod!=null?meta.scoringMethod:aogIeppwScoringDefault(g);
    if(sm) T.push("Scoring Method: "+sm);
    var FL=function(k){ return aogIeppwFL(formId,k,false); };
    var bTxt=(meta.baselineText!=null&&String(meta.baselineText).trim()!=="")?String(meta.baselineText).trim():aogIeppwLevelText(g,"b");
    var tTxt=(meta.targetText!=null&&String(meta.targetText).trim()!=="")?String(meta.targetText).trim():aogIeppwLevelText(g,"t");
    var bDt=aogIeppwLevelDate(g,meta,"b"), tDt=aogIeppwLevelDate(g,meta,"t");
    if(bTxt||bDt) T.push(FL("baseline")+": "+bTxt+(bDt?("    "+FL("beginDate")+": "+bDt):""));
    if(tTxt||tDt) T.push(FL("target")+": "+tTxt+(tDt?("    "+FL("masteryDate")+": "+tDt):""));
    var rows=aogIeppwProgressRows(g,pts);
    if(rows.length){
      T.push("GOAL PROGRESS UPDATES:");
      var anySug=false;
      for(var i=0;i<rows.length;i++){
        var r=rows[i], ov=(meta.progressRows&&meta.progressRows[r.key])||{};
        var lbl=PW_RATE[ov.progress||r.def]||PW_RATE[r.def]||"";
        var by=ov.evaluatedBy||meta.evaluatedBy||"";
        var sug=aogIeppwRateSuggested(ov,r.def); if(sug) anySug=true;
        T.push(r.date+" \u2014 "+r.score+(lbl?(" \u2014 "+lbl+(sug?" (suggested)":"")):"")+(by?(" \u2014 evaluated by "+by):""));
      }
      if(anySug) T.push("  \u26A0 "+PW_DRAFT_RATE);
    }
    var gAuto=!(meta.progressNote!=null&&String(meta.progressNote).trim()!=="");
    var gNote=gAuto?(rows.length?aogIeppwNarrative(g,pts,{scope:"goal"}):""):String(meta.progressNote).trim();
    if(gNote){ T.push(FL("progressNote")+":"); T.push(gNote); if(gAuto) T.push("  \u26A0 "+PW_DRAFT_NOTE); }
    var bms=meta.benchmarks||[];
    for(var b=0;b<bms.length;b++){
      var bm=bms[b]||{}, bl=bm.letter||aogIeppwBenchLetter(b);
      T.push("BENCHMARK "+bl+(bm.text?(": "+bm.text):""));
      if(aogIeppwIsDrafted(bm)) T.push("  \u26A0 "+PW_DRAFT_BENCH);
      if(bm.essentialElements) T.push("  Essential Elements: "+bm.essentialElements);
      if(bm.scoringMethod) T.push("  Scoring Method: "+bm.scoringMethod);
      if(bm.criteria) T.push("  "+FL("criteria")+": "+bm.criteria+(bm.masteryDate?("    "+FL("masteryDate")+": "+aogIeppwFDate(bm.masteryDate)):""));
      else if(bm.masteryDate) T.push("  "+FL("masteryDate")+": "+aogIeppwFDate(bm.masteryDate));
      if(bm.evalProcedure&&bm.evalProcedure.length) T.push("  Evaluation Procedure: "+bm.evalProcedure.join(", "));
      if(bm.schedule) T.push("  Schedule for Determining Progress: "+bm.schedule);
      var brs=aogIeppwBenchRows(g,pts,bl);
      if(brs.length) T.push("  Benchmark Progress Updates:");
      var bSug=false;
      for(var q2=0;q2<brs.length;q2++){
        var br=brs[q2], bov=(meta.benchRows&&meta.benchRows[bl+"|"+br.key])||{};
        var blbl=PW_RATE[bov.progress||br.def]||PW_RATE[br.def]||"";
        var bby=bov.evaluatedBy||meta.evaluatedBy||"";
        var bsg=aogIeppwRateSuggested(bov,br.def); if(bsg) bSug=true;
        T.push("  "+br.date+" \u2014 "+br.score+(blbl?(" \u2014 "+blbl+(bsg?" (suggested)":"")):"")+(bby?(" \u2014 evaluated by "+bby):""));
      }
      if(bSug) T.push("  \u26A0 "+PW_DRAFT_RATE);
      var bAuto=!(bm.progressNote!=null&&String(bm.progressNote).trim()!=="");
      var bNote=bAuto
        ?(brs.length?aogIeppwNarrative(g,(pts||[]).filter(function(p){ return p&&String(p.bench||"")===String(bl); }),{scope:"bench",criteria:bm.criteria}):"")
        :String(bm.progressNote).trim();
      if(bNote){ T.push("  "+FL("progressNote")+":"); T.push("  "+bNote); if(bAuto) T.push("  \u26A0 "+PW_DRAFT_NOTE); }
    }
    return T.join("\n");
  }
  function aogIeppwPurpose(type,student){
    var s=(student&&String(student).trim())||"the student";
    if(type==="initial") return "The purpose of this initial evaluation is to determine whether "+s+" meets eligibility criteria for special education and to identify "+s+"'s academic and functional needs that may require specially designed instruction and/or related services.";
    if(type==="reeval") return "The purpose of this reevaluation is to review existing data and any new assessment information to determine whether "+s+" continues to meet eligibility criteria for special education and to identify "+s+"'s current needs related to the disability.";
    return "The purpose of this annual review is to review "+s+"'s current academic and functional performance, evaluate progress toward annual IEP goals, and develop an updated IEP based on present levels of performance and ongoing educational needs.";
  }
  function aogIeppwGoalRef(g,pts){
    pts=(pts||[]).slice().sort(function(a,b){ return a.date<b.date?-1:(a.date>b.date?1:0); });
    if(!pts.length) return "Progress monitoring: no data points recorded yet.";
    var n=pts.length, first=pts[0], last=pts[n-1];
    var v=aogIeppwEffVal(g,last);
    var aim=aogIeppwAimAt(g,aogIeppwDayNum(last.date));
    var on=g.lowerBetter?(v<=aim+1e-9):(v>=aim-1e-9);
    var u=aogIeppwUnit(g);
    if(aogIeppwAimDeg(g)) return "Progress monitoring: "+n+" data point"+(n===1?"":"s")+" from "+aogIeppwFDate(first.date)+" to "+aogIeppwFDate(last.date)+"; latest "+aogIeppwR1(v)+u+"; no aimline yet — set a target different from the baseline.";
    return "Progress monitoring: "+n+" data point"+(n===1?"":"s")+" from "+aogIeppwFDate(first.date)+" to "+aogIeppwFDate(last.date)+"; latest "+aogIeppwR1(v)+u+" vs aimline "+aogIeppwR1(aim)+u+" — "+(on?"on track":"needs attention")+".";
  }
  function aogIeppwSections(type){
    if(type==="goalpages") return [];
    var secs=[{id:"purpose",f:["grade"]}];
    if(type!=="initial") secs.push({id:"svc",f:["svcRows","svcSdi","svcRelated","svcAccom"]});
    if(type!=="initial") secs.push({id:"goals",f:[]});
    if(type!=="reeval") secs.push({id:"str",f:["a_strengths","a_parent","a_health"]});
    var d=["d_ela_bench","d_ela_mtss_date","d_ela_mtss_tier","d_ela_mtss_target","d_ela_strength","d_ela_diff","d_ela_supports",
           "d_math_bench","d_math_mtss_date","d_math_mtss_tier","d_math_mtss_target","d_math_strength","d_math_diff","d_math_supports"];
    if(type==="initial") d.push("d_el");
    d.push("d_other");
    secs.push({id:"pl",f:d});
    var e=["e_particip_r","e_particip_t","e_org_r","e_org_t","e_hw_r","e_hw_t","e_report_date","e_report_txt","e_routines_r","e_routines_t","e_peers_r","e_peers_t","e_adult_freq","e_adult_t","e_supports"];
    if(type==="annual") e.push("e_adultlevel");
    secs.push({id:"cls",f:e});
    if(type!=="annual") secs.push({id:"data",f:["f_data"]});
    if(type==="initial") secs.push({id:"adverse",f:["imp_academic","imp_social","imp_indep","imp_voc","imp_motor","imp_speech"]});
    if(type==="annual") secs.push({id:"impact",f:["g_impact","imp_academic","imp_social","imp_indep","imp_voc","imp_motor","imp_speech"]});
    return secs;
  }
  function aogIeppwFieldKeys(type){ var ks=[]; aogIeppwSections(type).forEach(function(s){ (s.f||[]).forEach(function(k){ ks.push(k); }); }); return ks; }
  function aogIeppwCopyForward(prevFields,type,curFields){
    var out={},k; curFields=curFields||{}; prevFields=prevFields||{};
    for(k in curFields) out[k]=curFields[k];
    var keys=aogIeppwFieldKeys(type);
    for(var i=0;i<keys.length;i++){ k=keys[i];
      var cur=out[k], prev=prevFields[k];
      var curEmpty=(k==="svcRows")?!(cur&&cur.length):!(cur!=null&&String(cur).trim());
      var prevHas=(k==="svcRows")?!!(prev&&prev.length):!!(prev!=null&&String(prev).trim());
      if(curEmpty&&prevHas) out[k]=(k==="svcRows")?JSON.parse(JSON.stringify(prev)):prev;
    }
    return out;
  }
  function aogIeppwMergeDoc(store,docId,doc){
    if(!store||typeof store!=="object") store={};
    if(!store.docs||typeof store.docs!=="object") store.docs={};
    store.docs[docId]=doc;
    return store;
  }
  function aogIeppwSectionTexts(doc,ctx){
    ctx=ctx||{};
    var f=doc.fields||{}, rows=doc.goalRows||[], out=[];
    function has(k){ return !!(f[k]!=null&&String(f[k]).trim()); }
    function val(k){ return String(f[k]).trim(); }
    function add(id,title,lines){ lines=(lines||[]).filter(function(x){ return x!=null&&String(x).trim()!==""; }); if(lines.length) out.push({id:id,title:title,text:lines.join("\n")}); }
    if(doc.type==="goalpages"){
      var list=aogIeppwActiveGoals({goals:ctx.goals||{}},doc.student||"");
      var gmStore={goalMeta:ctx.goalMeta||{}};
      var gpForm=(doc.fields&&doc.fields.formProfile)||ctx.formId||"isbe";
      var seq=aogIeppwGoalSeq(list.map(function(it){ return {gid:it.gid,num:aogIeppwGoalMeta(gmStore,it.gid).goalNum}; }));
      list.forEach(function(it){
        var m=aogIeppwGoalMeta(gmStore,it.gid);
        out.push({id:"goal_"+it.gid,title:"GOAL "+seq[it.gid],text:aogIeppwGoalPageText(seq[it.gid],it.g,m,(ctx.data||{})[it.gid]||[],gpForm)});
      });
      return out;
    }
    add("purpose","PURPOSE",[aogIeppwPurpose(doc.type,doc.student)]);
    if(doc.type!=="initial"){
      var svc=[];
      var srL=(f.svcRows||[]).filter(function(r){ return r&&((r.area&&String(r.area).trim())||(r.setting&&String(r.setting).trim())||(r.min&&String(r.min).trim())); }).map(function(r){
        var bits=[]; if(r.area&&String(r.area).trim()) bits.push(String(r.area).trim()); if(r.setting&&String(r.setting).trim()) bits.push(String(r.setting).trim()); if(r.min&&String(r.min).trim()) bits.push(String(r.min).trim()+" min/week");
        return "- "+bits.join(" \u2014 ");
      });
      if(srL.length){ svc.push("Specialized instruction:"); srL.forEach(function(x){ svc.push(x); }); }
      if(has("svcSdi")){ svc.push("Program/SDI used and progress:"); svc.push(val("svcSdi")); }
      if(has("svcRelated")){ svc.push("Related services:"); svc.push(val("svcRelated")); }
      if(has("svcAccom")){ svc.push("Current accommodations & supports in use:"); svc.push(val("svcAccom")); }
      add("svc","CURRENT SPECIAL EDUCATION SERVICES",svc);
      var gl=rows.filter(function(r){ return r&&(r.title||"").trim(); });
      if(gl.length){
        var gls=[];
        gl.forEach(function(r,i){
          gls.push((i+1)+". "+r.title.trim());
          if(r.rating&&PW_RATE[r.rating]) gls.push("   Rating: "+PW_RATE[r.rating]);
          if(r.ref) gls.push("   "+r.ref);
        });
        add("goals","PROGRESS TOWARD CURRENT IEP GOALS",gls);
      }
    }
    if(doc.type!=="reeval"){
      add("strengths","STUDENT STRENGTHS",[has("a_strengths")?val("a_strengths"):""]);
      add("parent","PARENTAL EDUCATIONAL CONCERNS/INPUT",[has("a_parent")?val("a_parent"):""]);
      add("health","HEALTH INFORMATION/CONCERNS",[has("a_health")?val("a_health"):""]);
    }
    var pl=[];
    function subj(px,name){
      var s=[];
      if(has("d_"+px+"_bench")) s.push("Benchmarking: "+val("d_"+px+"_bench"));
      var md=f["d_"+px+"_mtss_date"], mt=f["d_"+px+"_mtss_tier"], mg=f["d_"+px+"_mtss_target"];
      var mB=[];
      if(md!=null&&String(md).trim()) mB.push("intervention started "+String(md).trim());
      if(mt!=null&&String(mt).trim()) mB.push("Tier "+String(mt).trim());
      if(mg!=null&&String(mg).trim()) mB.push("targets: "+String(mg).trim());
      if(mB.length) s.push("MTSS: "+mB.join("; "));
      if(has("d_"+px+"_strength")) s.push("Strengths: "+val("d_"+px+"_strength"));
      if(has("d_"+px+"_diff")) s.push("Areas of difficulty: "+val("d_"+px+"_diff"));
      if(has("d_"+px+"_supports")) s.push("Supports that are effective: "+val("d_"+px+"_supports"));
      if(s.length){ pl.push(name); s.forEach(function(x){ pl.push(x); }); }
    }
    subj("ela","ELA"); subj("math","Math");
    if(doc.type==="initial"&&has("d_el")) pl.push("EL services: "+val("d_el"));
    if(has("d_other")) pl.push("Other areas as determined by the team: "+val("d_other"));
    add("pl","STUDENT'S PRESENT LEVEL OF ACADEMIC ACHIEVEMENT",pl);
    var cl=[];
    function rt(base,label){
      var r=f[base+"_r"], t=f[base+"_t"];
      var rOk=r&&PW_CRATE[r], tOk=t!=null&&String(t).trim();
      if(rOk||tOk) cl.push(label+": "+(rOk?PW_CRATE[r]:"")+((rOk&&tOk)?" \u2014 ":"")+(tOk?String(t).trim():""));
    }
    rt("e_particip","Participation and engagement");
    rt("e_org","Organization and work completion");
    rt("e_hw","Homework and assignments");
    if(has("e_report_txt")||has("e_report_date")) cl.push("Report card"+(has("e_report_date")?(" ("+val("e_report_date")+")"):"")+": "+(has("e_report_txt")?val("e_report_txt"):""));
    rt("e_routines","Ability to follow classroom routines");
    rt("e_peers","Peer interactions");
    var fq=f.e_adult_freq&&PW_FREQ[f.e_adult_freq], at=has("e_adult_t");
    if(fq||at) cl.push("Frequency of adult support: "+(fq||"")+((fq&&at)?" \u2014 ":"")+(at?val("e_adult_t"):""));
    if(has("e_supports")) cl.push("Supports that are effective: "+val("e_supports"));
    if(doc.type==="annual"&&has("e_adultlevel")) cl.push("Level of adult support required: "+val("e_adultlevel"));
    rows.forEach(function(r){ if(r&&r.grp==="F"&&(r.title||"").trim()) cl.push("Goal \u2014 "+r.title.trim()+(r.ref?(": "+r.ref):"")); });
    add("func","STUDENT'S PRESENT LEVELS OF FUNCTIONAL/DEVELOPMENTAL PERFORMANCE",cl);
    if(doc.type!=="annual"&&has("f_data")) add("eval","THE RESULTS OF THE INITIAL OR MOST RECENT EVALUATION",[val("f_data")]);
    var adv=[];
    if(doc.type==="annual"&&has("g_impact")) adv.push(val("g_impact"));
    if(doc.type!=="reeval"){
      var imps=PW_IMPACT.filter(function(pr){ return f[pr[0]]==="1"||f[pr[0]]===true; }).map(function(pr){ return pr[1]; });
      if(imps.length) adv.push("Areas impacted: "+imps.join("; "));
    }
    add("adverse","ADVERSE EFFECTS",adv);
    return out;
  }
  function aogIeppwPlainText(doc,ctx){
    var T=[];
    T.push(((PW_TYPES[doc.type]||"IEP Meeting")+" \u2014 IEP Meeting Paperwork").toUpperCase());
    var hdF=(doc.fields&&doc.fields.formProfile)||"isbe";
    var hdDob=(doc.fields&&doc.fields.dob&&String(doc.fields.dob).trim())?("    "+aogIeppwFL(hdF,"dob",false)+": "+aogIeppwFDate(String(doc.fields.dob).trim())):"";
    T.push("Student: "+(doc.student||"")+((doc.fields&&doc.fields.grade&&String(doc.fields.grade).trim())?("    Grade: "+String(doc.fields.grade).trim()):"")+"    Date: "+(doc.date||"")+hdDob);
    aogIeppwSectionTexts(doc,ctx).forEach(function(sc){ T.push(""); T.push(sc.title); T.push(sc.text); });
    T.push(""); T.push(aogIeppwFooter());
    return T.join("\n");
  }
  function aogIeppwChartSVG(g,pts){
    pts=(pts||[]).slice().sort(function(a,b){ return a.date<b.date?-1:(a.date>b.date?1:0); });
    var W=640,H=240,ml=46,mr=14,mt=18,mb=32;
    var max,ticks,unit="";
    if(g.measure==="percent"||g.measure==="trials"||g.measure==="steps"){ max=100; ticks=[0,25,50,75,100]; unit="%"; }
    else if(g.measure==="rating"){
      max=5;
      for(var iR=0;iR<pts.length;iR++){ var vR=aogIeppwEffVal(g,pts[iR]); if(isFinite(vR)&&vR>max) max=vR; }
      max=Math.ceil(Math.max(max,+g.baseline.value||0,+g.target.value||0));
      if(max<=5){ max=5; ticks=[1,2,3,4,5]; }
      else if(max<=10){ ticks=[]; for(var jR=1;jR<=max;jR++) ticks.push(jR); }
      else ticks=[0,aogIeppwR1(max/4),aogIeppwR1(max/2),aogIeppwR1(max*3/4),max];
    }
    else{
      max=Math.max(+g.baseline.value||0,+g.target.value||0,1);
      for(var i0=0;i0<pts.length;i0++){ var ev=aogIeppwEffVal(g,pts[i0]); if(isFinite(ev)&&ev>max) max=ev; }
      max=Math.ceil(max*1.15);
      ticks=[0,aogIeppwR1(max/4),aogIeppwR1(max/2),aogIeppwR1(max*3/4),max];
    }
    var b=aogIeppwDayNum(g.baseline.date), t=aogIeppwDayNum(g.target.date);
    var bOK=aogIeppwDateSane(g.baseline.date), tOK=aogIeppwDateSane(g.target.date);
    var bv=+g.baseline.value, tv=+g.target.value;
    var dom=[];
    if(bOK) dom.push(b);
    if(tOK) dom.push(t);
    for(var iD=0;iD<pts.length;iD++){ if(aogIeppwDateSane(pts[iD].date)) dom.push(aogIeppwDayNum(pts[iD].date)); }
    if(!dom.length) dom=[b,b+1];
    var x0=Math.min.apply(null,dom), x1=Math.max.apply(null,dom);
    if(!(x1>x0)) x1=x0+1;
    var pad=Math.max(2,Math.round((x1-x0)*0.04)); x0-=pad; x1+=pad;
    function X(d){ return ml+(W-ml-mr)*((d-x0)/(x1-x0)); }
    function Y(v){ v=Math.max(0,Math.min(max,v)); return mt+(H-mt-mb)*(1-v/max); }
    var s="";
    for(var j=0;j<ticks.length;j++){ var tk=ticks[j]; s+='<line x1="'+ml+'" y1="'+Y(tk).toFixed(1)+'" x2="'+(W-mr)+'" y2="'+Y(tk).toFixed(1)+'" stroke="#E4DAC5" stroke-width="1"/><text x="'+(ml-6)+'" y="'+(Y(tk)+3.5).toFixed(1)+'" text-anchor="end" font-size="10" fill="#8A92A6">'+tk+unit+'</text>'; }
    var uLbl=(g.measure==="latency")?(g.unit||"seconds"):((g.measure==="interval")?(g.intervalLabel||"per 10 min"):(g.measure==="duration"?"min":(g.measure==="wcpm"?(g.unit||"wcpm"):"")));
    if(uLbl) s+='<text x="'+ml+'" y="10" font-size="9.5" font-weight="700" fill="#8A92A6">'+String(uLbl).replace(/[<>&"]/g,"")+'</text>';
    var mid=Math.round((x0+x1)/2);
    var xl=[[x0,"start"],[mid,"middle"],[x1,"end"]];
    for(var q=0;q<3;q++){ s+='<text x="'+X(xl[q][0]).toFixed(1)+'" y="'+(H-mb+16)+'" text-anchor="'+xl[q][1]+'" font-size="10" fill="#46506E">'+aogIeppwDayLbl(xl[q][0])+'</text>'; }
    if(bOK&&tOK){
    s+='<line x1="'+X(b).toFixed(1)+'" y1="'+Y(bv).toFixed(1)+'" x2="'+X(t).toFixed(1)+'" y2="'+Y(tv).toFixed(1)+'" stroke="#D9A33B" stroke-width="2.5" stroke-dasharray="7 5"/>';
    s+='<circle cx="'+X(b).toFixed(1)+'" cy="'+Y(bv).toFixed(1)+'" r="5" fill="#D9A33B"/>';
    s+='<circle cx="'+X(t).toFixed(1)+'" cy="'+Y(tv).toFixed(1)+'" r="5" fill="none" stroke="#D9A33B" stroke-width="2.5"/>';
    var up=tv>=bv;
    s+='<text x="'+X(b).toFixed(1)+'" y="'+aogIeppwLblY(Y(bv),up,mt,H-mb).toFixed(1)+'" font-size="10" font-weight="700" fill="#8A6414">Baseline '+aogIeppwR1(bv)+'</text>';
    s+='<text x="'+X(t).toFixed(1)+'" y="'+aogIeppwLblY(Y(tv),!up,mt,H-mb).toFixed(1)+'" text-anchor="end" font-size="10" font-weight="700" fill="#8A6414">Target '+aogIeppwR1(tv)+'</text>';
    }
    if(pts.length>1){
      var dp="";
      for(var m2=0;m2<pts.length;m2++){ dp+=(m2?"L":"M")+X(aogIeppwDayNum(pts[m2].date)).toFixed(1)+" "+Y(aogIeppwEffVal(g,pts[m2])).toFixed(1)+" "; }
      s+='<path d="'+dp+'" fill="none" stroke="#0A1E33" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    for(var m3=0;m3<pts.length;m3++){ var cx=X(aogIeppwDayNum(pts[m3].date)), cy=Y(aogIeppwEffVal(g,pts[m3])); s+='<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="4" fill="#fff" stroke="#0A1E33" stroke-width="2.4"/>'; }
    return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Progress-monitoring chart" style="width:100%;max-width:640px;display:block;margin:6px 0;" xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
  }
  /* ==== AOG-IEPPW-PURE-END ==== */
  window.AOG_IEPPW={TYPES:PW_TYPES,RATE:PW_RATE,CRATE:PW_CRATE,FREQ:PW_FREQ,IMPACT:PW_IMPACT,PN:PW_PN,IMPL:PW_IMPL,EVALPROC:PW_EVALPROC,GAREAS:PW_GAREAS,GTYPES:PW_GTYPES,
    formIds:aogIeppwFormIds,form:aogIeppwForm,FL:aogIeppwFL,areaMap:aogIeppwAreaMap,goalRef:aogIeppwGoalRef,purpose:aogIeppwPurpose,sections:aogIeppwSections,
    fieldKeys:aogIeppwFieldKeys,copyForward:aogIeppwCopyForward,mergeDoc:aogIeppwMergeDoc,sectionTexts:aogIeppwSectionTexts,plainText:aogIeppwPlainText,
    chartSVG:aogIeppwChartSVG,goalMeta:aogIeppwGoalMeta,loadFix:aogIeppwLoadFix,activeGoals:aogIeppwActiveGoals,goalSeq:aogIeppwGoalSeq,footer:aogIeppwFooter,
    studentGrade:aogIeppwStudentGrade,goalPageText:aogIeppwGoalPageText,fdate:aogIeppwFDate};
})();
