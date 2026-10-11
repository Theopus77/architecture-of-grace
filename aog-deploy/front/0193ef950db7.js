
(function(){
  "use strict";
  var DKEY="aog.iepdocs.v1", IKEY="aog.iep.v1", VKEY="aog.iep.view";
  function L(en,es){ try{ if(typeof dashLang!=="undefined") return dashLang==="es"?es:en; }catch(e){} try{ if(typeof lang!=="undefined") return lang==="es"?es:en; }catch(e2){} return en; }
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }

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

  var TYPES_ES={initial:"Evaluación inicial",reeval:"Reevaluación",annual:"Revisión anual",goalpages:"Páginas de metas del IEP"};
  var RATE_ES={adequate:"Progreso adecuado",variable:"Progreso variable",limited:"Progreso limitado",met:"Meta lograda",exceeded:"Meta superada"};
  var CRATE_ES={consistent:"Consistente",developing:"En desarrollo",concern:"Área de preocupación"};
  var FREQ_ES={period:"Cada período",daily:"Diario",weekly:"Semanal",occasional:"Ocasional"};
  function typeLbl(k){ return L(PW_TYPES[k]||k,TYPES_ES[k]||k); }
  function pad2(n){ return String(n).padStart(2,"0"); }
  function todayStr(){ var d=new Date(); return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate()); }
  function load(){ try{ var st=JSON.parse(localStorage.getItem(DKEY)||"null"); if(st&&typeof st==="object"&&st.docs&&typeof st.docs==="object") return aogIeppwLoadFix(st); }catch(e){} return aogIeppwLoadFix(null); }
  function save(st){ try{ localStorage.setItem(DKEY,JSON.stringify(st)); }catch(e){} }
  function iepState(){ try{ var st=JSON.parse(localStorage.getItem(IKEY)||"null"); if(st&&typeof st==="object"&&st.goals&&st.data) return st; }catch(e){} return {goals:{},data:{}}; }

  var ST={view:"goals",student:"",type:"annual",docId:null,stdGid:null};
  try{ if(localStorage.getItem(VKEY)==="pw") ST.view="pw"; }catch(e){}

  function collectStudents(){
    var names={};
    var iep=iepState();
    Object.keys(iep.goals).forEach(function(id){ var n=(iep.goals[id].student||"").trim(); if(n) names[n]=1; });
    var st=load();
    Object.keys(st.docs).forEach(function(id){ var n=(st.docs[id].student||"").trim(); if(n) names[n]=1; });
    return Object.keys(names).sort(function(a,b){ return a.localeCompare(b); });
  }
  function autoGoals(student){
    var iep=iepState(), out=[];
    Object.keys(iep.goals).forEach(function(id){
      var g=iep.goals[id];
      if(!g||g.archived||(g.student||"")!==student) return;
      out.push({gid:id,title:g.title||"",rating:"",ref:aogIeppwGoalRef(g,iep.data[id]||[]),chart:true,grp:aogIeppwAreaMap(g.area)==="Academic"?"A":"F"});
    });
    out.sort(function(a,b){ return (a.title||"").localeCompare(b.title||""); });
    return out;
  }
  function prevDocFor(student,exclId){
    var st=load(), best=null;
    Object.keys(st.docs).forEach(function(id){
      if(id===exclId) return;
      var d=st.docs[id];
      if((d.student||"")!==student) return;
      if(!best||(d.updated||0)>(best.updated||0)) best=d;
    });
    return best;
  }

  /* ---------- autosave ---------- */
  function collectGoalMeta(root,st){
    st.goalMeta=st.goalMeta||{};
    var wraps=root.querySelectorAll("[data-gmid]");
    for(var w=0;w<wraps.length;w++){
      var wrap=wraps[w], gid=wrap.getAttribute("data-gmid");
      var m=aogIeppwGoalMeta(st,gid);
      var sc=wrap.querySelectorAll("[data-gmk]");
      for(var i=0;i<sc.length;i++){
        var el=sc[i], k=el.getAttribute("data-gmk");
        if(el.type==="checkbox") m[k]=el.checked; else m[k]=el.value;
      }
      ["parentNotification","implementors"].forEach(function(gk){
        var boxes=wrap.querySelectorAll('[data-gmck="'+gk+'"]'); if(!boxes.length) return;
        var arr=[]; for(var b2=0;b2<boxes.length;b2++){ if(boxes[b2].checked) arr.push(boxes[b2].getAttribute("data-gmcv")); }
        m[gk]=arr;
      });
      var bEls=wrap.querySelectorAll("[data-bmi]"), bms=[];
      for(var b3=0;b3<bEls.length;b3++){
        var be=bEls[b3], bm={letter:aogIeppwBenchLetter(b3),text:"",essentialElements:"",scoringMethod:"",evalProcedure:[],schedule:""};
        var bf=be.querySelectorAll("[data-bmk]");
        for(var b4=0;b4<bf.length;b4++){ bm[bf[b4].getAttribute("data-bmk")]=bf[b4].value; }
        var bp=be.querySelectorAll("[data-bmcv]");
        for(var b5=0;b5<bp.length;b5++){ if(bp[b5].checked) bm.evalProcedure.push(bp[b5].getAttribute("data-bmcv")); }
        bms.push(bm);
      }
      m.benchmarks=bms;
      var pr=wrap.querySelectorAll("[data-pri]");
      for(var p2=0;p2<pr.length;p2++){
        var pe=pr[p2], key=pe.getAttribute("data-pri");
        var sel=pe.querySelector('[data-prk="progress"]'), evi=pe.querySelector('[data-prk="evaluatedBy"]');
        var row=m.progressRows[key]||{};
        if(sel) row.progress=sel.value;
        if(evi) row.evaluatedBy=evi.value;
        m.progressRows[key]=row;
      }
      var br=wrap.querySelectorAll("[data-bri]");
      for(var b6=0;b6<br.length;b6++){
        var bre=br[b6], bkey=bre.getAttribute("data-bri");
        var brSel=bre.querySelector('[data-brk="progress"]'), brEv=bre.querySelector('[data-brk="evaluatedBy"]');
        if(!m.benchRows||typeof m.benchRows!=="object") m.benchRows={};
        var brow=m.benchRows[bkey]||{};
        if(brSel) brow.progress=brSel.value;
        if(brEv) brow.evaluatedBy=brEv.value;
        m.benchRows[bkey]=brow;
      }
      st.goalMeta[gid]=m;
    }
  }
  var saveTimer=null;
  function persistDraft(){
    saveTimer=null;
    var root=document.getElementById("aogIepPwRoot"); if(!root||!ST.docId) return;
    var st=load(); var doc=st.docs[ST.docId]; if(!doc) return;
    doc.fields=doc.fields||{};
    var kEls=root.querySelectorAll("[data-k]");
    for(var i=0;i<kEls.length;i++){ var kEl=kEls[i]; doc.fields[kEl.getAttribute("data-k")]=(kEl.type==="checkbox")?(kEl.checked?"1":""):kEl.value; }
    if(doc.type==="goalpages") collectGoalMeta(root,st);
    if(root.querySelector('[data-sec="svc"]')){
      var rows=[], srEls=root.querySelectorAll("[data-sri]");
      for(var j=0;j<srEls.length;j++){
        var q=function(sel){ var el=srEls[j].querySelector(sel); return el?el.value:""; };
        rows.push({area:q('[data-sr="area"]'),setting:q('[data-sr="setting"]'),min:q('[data-sr="min"]')});
      }
      doc.fields.svcRows=rows;
    }
    doc.goalRows=doc.goalRows||[];
    var gEls=root.querySelectorAll("[data-gi]");
    for(var k=0;k<gEls.length;k++){
      var idx=+gEls[k].getAttribute("data-gi"); var row=doc.goalRows[idx]; if(!row) continue;
      var tEl=gEls[k].querySelector('[data-gk="title"]'); if(tEl) row.title=tEl.value;
      var rEl=gEls[k].querySelector('[data-gk="rating"]'); if(rEl) row.rating=rEl.value;
      var cEl=gEls[k].querySelector('[data-gk="chart"]'); if(cEl) row.chart=!!cEl.checked;
    }
    var dEl=document.getElementById("aogIepPwDate"); if(dEl&&dEl.value) doc.date=dEl.value;
    doc.updated=Date.now();
    save(st);
    updateDots(); updateSaveStamp();
  }
  function persistDraftNow(){ if(saveTimer){ clearTimeout(saveTimer); saveTimer=null; } persistDraft(); }
  function bindRoot(root){
    var kick=function(ev){
      var t=ev.target; if(!t||!t.getAttribute) return;
      if(t.getAttribute("data-k")!=null||t.getAttribute("data-gk")!=null||t.getAttribute("data-sr")!=null||t.getAttribute("data-doc")!=null||t.getAttribute("data-gmk")!=null||t.getAttribute("data-gmck")!=null||t.getAttribute("data-bmk")!=null||t.getAttribute("data-bmcv")!=null||t.getAttribute("data-prk")!=null||t.getAttribute("data-brk")!=null){
        if(saveTimer) clearTimeout(saveTimer);
        saveTimer=setTimeout(persistDraft,400);
      }
    };
    root.addEventListener("input",kick);
    root.addEventListener("change",kick);
  }
  function updateSaveStamp(){
    var el=document.getElementById("aogIepPwSaved"); if(!el) return;
    var d=new Date();
    el.textContent=L("Saved ","Guardado ")+pad2(d.getHours())+":"+pad2(d.getMinutes())+":"+pad2(d.getSeconds());
  }
  function updateDots(){
    var root=document.getElementById("aogIepPwRoot"); if(!root) return;
    var secs=root.querySelectorAll("details.ieppw-sec");
    for(var i=0;i<secs.length;i++){
      var dEl=secs[i], dot=dEl.querySelector(".ieppw-dot"); if(!dot) continue;
      var done=dEl.getAttribute("data-sec")==="purpose";
      if(!done){
        var els=dEl.querySelectorAll("input,textarea,select");
        for(var j=0;j<els.length;j++){ var e=els[j]; if(e.type==="checkbox") continue; if(e.value&&String(e.value).trim()){ done=true; break; } }
      }
      dot.className="ieppw-dot"+(done?" done":"");
    }
  }

  /* ---------- shell: pill toggle + mount, injected after aogRenderIep ---------- */
  function ensureUI(){
    var host=document.getElementById("aogIepBody"); if(!host||!host.parentNode) return;
    var bar=document.getElementById("aogIepPwBar");
    if(!bar){
      bar=document.createElement("div"); bar.id="aogIepPwBar"; bar.className="ieppw-pillbar";
      bar.setAttribute("role","group"); bar.setAttribute("aria-label","IEP view");
      host.parentNode.insertBefore(bar,host);
    }
    /* Jimmy 2026-09-05: districts on their own IEP system (Embrace, etc.) never
       draft documents here — a per-device preference hides the whole Paperwork
       tab, restored by a quiet link at the bottom of the panel. */
    var HID=false; try{ HID=localStorage.getItem("aog.ieppw.hidden")==="1"; }catch(e){}
    if(HID&&ST.view==="pw"){ ST.view="goals"; try{ localStorage.setItem(VKEY,"goals"); }catch(e){} }
    bar.style.display=HID?"none":"";
    bar.innerHTML=HID?"":('<button type="button" class="ieppw-pill" aria-pressed="'+(ST.view!=="pw")+'" onclick="aogIepPwView(\'goals\')">'+esc(L("Progress & Graphs","Progreso y gráficas"))+'</button>'
      +'<button type="button" class="ieppw-pill" aria-pressed="'+(ST.view==="pw")+'" onclick="aogIepPwView(\'pw\')">'+esc(L("Meeting Paperwork","Documentos de reunión"))+'</button>');
    var root=document.getElementById("aogIepPwRoot");
    if(!root){
      root=document.createElement("div"); root.id="aogIepPwRoot";
      if(host.nextSibling) host.parentNode.insertBefore(root,host.nextSibling); else host.parentNode.appendChild(root);
      bindRoot(root);
    }
    var note=document.getElementById("aogIepPwHideNote");
    if(!note){
      note=document.createElement("div"); note.id="aogIepPwHideNote"; note.className="ieppw-help"; note.style.margin="12px 0 0";
      if(root.nextSibling) root.parentNode.insertBefore(note,root.nextSibling); else root.parentNode.appendChild(note);
    }
    note.innerHTML=HID
      ?('<button type="button" class="ieppw-txtbtn" onclick="aogIepPwUnhide()">'+esc(L("Meeting Paperwork is hidden — show it again","Documentos de reunión está oculto — mostrarlo de nuevo"))+'</button>')
      :(ST.view==="pw"
        ?('<button type="button" class="ieppw-txtbtn" onclick="aogIepPwHide()">'+esc(L("My district uses its own IEP system — hide Meeting Paperwork on this device","Mi distrito usa su propio sistema de IEP — ocultar Documentos de reunión en este dispositivo"))+'</button>')
        :"");
    host.style.display=(ST.view==="pw")?"none":"";
    root.style.display=(ST.view==="pw")?"":"none";
    if(ST.view==="pw") renderPw();
  }
  window.aogIepPwView=function(v){
    ST.view=(v==="pw")?"pw":"goals";
    try{ localStorage.setItem(VKEY,ST.view); }catch(e){}
    ensureUI();
  };
  window.aogIepPwHide=function(){
    try{ localStorage.setItem("aog.ieppw.hidden","1"); }catch(e){}
    ST.view="goals"; try{ localStorage.setItem(VKEY,"goals"); }catch(e){}
    ensureUI();
  };
  window.aogIepPwUnhide=function(){
    try{ localStorage.removeItem("aog.ieppw.hidden"); }catch(e){}
    ST.view="pw"; try{ localStorage.setItem(VKEY,"pw"); }catch(e){}
    ensureUI();
  };
  function wrapRender(){
    var orig=window.aogRenderIep;
    if(typeof orig!=="function"){ setTimeout(wrapRender,300); return; }
    if(orig.__ieppwWrapped) return;
    var w=function(){ var r=orig.apply(this,arguments); try{ ensureUI(); }catch(e){} return r; };
    w.__ieppwWrapped=true;
    window.aogRenderIep=w;
    try{ ensureUI(); }catch(e){}
  }

  /* ---------- paperwork view ---------- */
  function draftsHTML(){
    var st=load(); var ids=Object.keys(st.docs);
    var q=(ST.student||"").trim().toLowerCase();
    ids=ids.filter(function(id){ return !q||(st.docs[id].student||"").toLowerCase().indexOf(q)>=0; });
    ids.sort(function(a,b){ return (st.docs[b].updated||0)-(st.docs[a].updated||0); });
    if(!ids.length) return '<div class="ieppw-help">'+esc(L("No saved drafts yet — pick a student and start one.","Aún no hay borradores guardados — elige un estudiante y comienza uno."))+'</div>';
    return ids.slice(0,25).map(function(id){
      var d=st.docs[id];
      return '<div class="ieppw-draft"><span class="ieppw-dtype">'+esc(typeLbl(d.type))+'</span><strong>'+esc(d.student||"")+'</strong>'
        +'<span style="color:var(--ink-faint,#8A92A6)">'+esc(d.date||"")+'</span><span style="flex:1"></span>'
        +'<button type="button" class="iep-mini" onclick="aogIepPwResume(\''+id+'\')">'+esc(L("Resume","Continuar"))+'</button>'
        +'<button type="button" class="iep-mini danger" onclick="aogIepPwDelDoc(\''+id+'\')">'+esc(L("Delete","Eliminar"))+'</button></div>';
    }).join("");
  }
  function sec(id,title,body,open){
    return '<details class="ieppw-sec" data-sec="'+id+'"'+(open?' open':'')+'><summary><span class="ieppw-dot"></span>'+esc(title)+'</summary><div class="ieppw-body">'+body+'</div></details>';
  }
  function gpFormHTML(doc){
    var st=load(), iep=iepState();
    var FID=(doc.fields&&doc.fields.formProfile)||"isbe", PWES=L(false,true);
    function FLl(k){ return aogIeppwFL(FID,k,PWES); }
    var list=aogIeppwActiveGoals(iep,doc.student);
    var seq=aogIeppwGoalSeq(list.map(function(it){ return {gid:it.gid,num:aogIeppwGoalMeta(st,it.gid).goalNum}; }));
    var h='<div class="ieppw-card"><div class="ieppw-row" style="justify-content:space-between;margin:0;">'
      +'<div><span class="ieppw-dtype">'+esc(L("Goal Pages (official)","Páginas de metas (oficial)"))+'</span> <strong style="font-size:14px;">'+esc(doc.student)+'</strong></div>'
      +'<div class="ieppw-row" style="margin:0;">'
      +'<label class="ieppw-chk">'+esc(L("Grade","Grado"))+' <input type="text" data-k="grade" value="'+esc((doc.fields&&doc.fields.grade)||"")+'" maxlength="4" style="width:56px" aria-label="'+esc(L("Grade","Grado"))+'"></label>'
      +'<label class="ieppw-chk">'+esc(FLl("dob"))+' <input type="date" data-k="dob" value="'+esc((doc.fields&&doc.fields.dob)||"")+'" aria-label="'+esc(FLl("dob"))+'"></label>'
      +'<label class="ieppw-chk">'+esc(FLl("conference"))+' <input type="date" id="aogIepPwDate" data-doc="date" value="'+esc(doc.date||"")+'"></label>'
      +'<label class="ieppw-chk">'+esc(L("Form wording","Redacción del formulario"))+' <select data-k="formProfile" onchange="aogIepPwFormIn(this.value)" aria-label="'+esc(L("Form wording","Redacción del formulario"))+'">'
        +aogIeppwFormIds().map(function(fk){ var f=aogIeppwForm(fk); return '<option value="'+fk+'"'+(FID===fk?' selected':'')+'>'+esc(PWES?f.name.es:f.name.en)+'</option>'; }).join("")
        +'</select></label>'
      +'<button type="button" class="iep-mini" onclick="aogIepPwClose()">'+esc(L("Close draft","Cerrar borrador"))+'</button>'
      +'<button type="button" class="iep-mini danger" onclick="aogIepPwDelDoc(\''+ST.docId+'\')">'+esc(L("Delete draft","Eliminar borrador"))+'</button>'
      +'</div></div>'
      +'<div class="ieppw-help" style="margin-top:6px;">'+esc(L("One official-format page per active tracked goal. Progress updates fill in automatically from Progress & Graphs. The generated document is always in English.","Una página en formato oficial por cada meta activa registrada. Las actualizaciones de progreso se completan automáticamente desde Progreso y gráficas. El documento generado siempre está en inglés."))+'</div></div>';
    h+='<datalist id="aogPwGtypes">'+PW_GTYPES.map(function(t){ return '<option value="'+esc(t)+'"></option>'; }).join("")+'</datalist>';
    if(!list.length){
      h+='<div class="ieppw-card"><div class="ieppw-help">'+esc(L("No active tracked goals for this student — add goals in Progress & Graphs first.","No hay metas activas registradas para este estudiante — primero agrega metas en Progreso y gráficas."))+'</div></div>';
    }
    var PN_ES={"IEP Review/Revision":"Revisión/modificación del IEP","Progress Report":"Informe de progreso","Parent Conference":"Conferencia con los padres"};
    var IMPL_ES={"Special Education Teacher":"Maestro/a de educación especial","Social Worker":"Trabajador/a social","General Education Teacher":"Maestro/a de educación general","Speech/Language (SLP)":"Habla/lenguaje (SLP)"};
    var EP_ES={"Observation":"Observación","Daily Class Work":"Trabajo diario en clase","Charting":"Registro gráfico","Daily Log":"Registro diario","Formal Tests":"Pruebas formales","Other":"Otro"};
    var GA_ES={"Academic":"Académica","Functional":"Funcional","Transition":"Transición","Other":"Otra"};
    function bmRowsHTML(g,gid,m,bl){
      var rows=aogIeppwBenchRows(g,iep.data[gid]||[],bl);
      var hh='<span class="ieppw-lbl">'+esc(L("Benchmark Progress Updates (auto-filled from tagged data points)","Actualizaciones de progreso del punto de referencia (autocompletadas de los datos etiquetados)"))+'</span>';
      if(!rows.length) return hh+'<div class="ieppw-help">'+esc(L("No data points tagged to this benchmark yet — the printout keeps blank rows.","Aún no hay datos etiquetados a este punto de referencia — el documento imprime filas en blanco."))+'</div>';
      hh+='<div class="ieppw-help ieppw-rate-warn">\u26A0 '+esc(L(PW_DRAFT_RATE,PW_DRAFT_RATE_ES))+'</div>';
      hh+='<table class="ieppw-gpt"><tr><th>'+esc(L("Date","Fecha"))+'</th><th>'+esc(L("Progress Score","Puntaje de progreso"))+'</th><th>'+esc(L("Progress","Progreso"))+'</th><th>'+esc(L("Evaluated By","Evaluado por"))+'</th></tr>';
      rows.forEach(function(r){
        var bk=bl+"|"+r.key, ov=(m.benchRows&&m.benchRows[bk])||{};
        var selv=ov.progress||r.def;
        var sug=aogIeppwRateSuggested(ov,r.def);
        hh+='<tr data-bri="'+esc(bk)+'"><td>'+esc(r.date)+'</td><td>'+esc(r.score)+'</td><td><select data-brk="progress"><option value=""'+(selv?'':' selected')+'>—</option>'
          +["adequate","variable","limited","met","exceeded"].map(function(k){ return '<option value="'+k+'"'+(selv===k?' selected':'')+'>'+esc(L(PW_RATE[k],RATE_ES[k]))+'</option>'; }).join("")
          +'</select>'
          +(sug?(' <span class="ieppw-src" title="'+esc(L(PW_DRAFT_RATE,PW_DRAFT_RATE_ES))+'">'+esc(L("suggested","sugerido"))+'</span>'):'')
          +'</td><td><input type="text" data-brk="evaluatedBy" value="'+esc(ov.evaluatedBy||"")+'" placeholder="'+esc(m.evaluatedBy||L("Initials","Iniciales"))+'" style="width:90px"></td></tr>';
      });
      return hh+'</table>';
    }
    list.forEach(function(it){
      var g=it.g, gid=it.gid, m=aogIeppwGoalMeta(st,gid);
      var area=m.goalArea||aogIeppwAreaMap(g.area);
      var goalGr=(g.grade!=null?String(g.grade).trim():"");
      var effGr=aogIeppwGoalGrade(g,m);
      var stmt=m.goalStatement!=null?m.goalStatement:aogIeppwGoalStatement(g);
      var sm=m.scoringMethod!=null?m.scoringMethod:aogIeppwScoringDefault(g);
      var b='<div class="ieppw-row">'
        +'<label class="ieppw-chk">'+esc(L("Goal #","Meta n.º"))+' <input type="number" min="1" data-gmk="goalNum" value="'+esc(seq[gid])+'" style="width:70px"></label>'
        +'<label class="ieppw-chk">'+esc(L("Goal Type","Tipo de meta"))+' <input type="text" list="aogPwGtypes" data-gmk="goalType" value="'+esc(m.goalType)+'" style="width:190px" placeholder="'+esc(L("Choose or type","Elige o escribe"))+'"></label>'
        +'<label class="ieppw-chk">'+esc(L("Goal Area","Área de la meta"))+' <select data-gmk="goalArea">'
        +PW_GAREAS.map(function(a){ return '<option value="'+a+'"'+(area===a?' selected':'')+'>'+esc(L(a,GA_ES[a]))+'</option>'; }).join("")
        +'</select></label>'
        +(goalGr?('<label class="ieppw-chk">'+esc(L("Grade","Grado"))+': <strong>'+esc(goalGr)+'</strong></label>')
                :('<label class="ieppw-chk">'+esc(L("Grade","Grado"))+' <input type="text" data-gmk="grade" value="'+esc(m.grade)+'" maxlength="4" style="width:56px" aria-label="'+esc(L("Grade","Grado"))+'"></label>'))
        +'</div>'
        +'<span class="ieppw-lbl">'+esc(L("Method of Parent Notification","Método de notificación a los padres"))+'</span><div class="ieppw-row" style="gap:12px;">'
        +PW_PN.map(function(o){ return '<label class="ieppw-chk"><input type="checkbox" data-gmck="parentNotification" data-gmcv="'+esc(o)+'"'+(m.parentNotification.indexOf(o)>=0?' checked':'')+'> '+esc(L(o,PN_ES[o]))+'</label>'; }).join("")
        +'<label class="ieppw-chk">'+esc(L("Other","Otro"))+' <input type="text" data-gmk="parentNotificationOther" value="'+esc(m.parentNotificationOther)+'" style="width:130px"></label></div>'
        +'<span class="ieppw-lbl">'+esc(L("Date(s) parent will be provided with progress","Fecha(s) en que se informará el progreso a los padres"))+'</span>'
        +'<input type="text" data-gmk="progressDates" value="'+esc(m.progressDates)+'" placeholder="'+esc(L("e.g., End of each quarter","p. ej., al final de cada trimestre"))+'" style="width:100%;box-sizing:border-box;">'
        +'<span class="ieppw-lbl">'+esc(L("Title(s) of Goal Implementor(s)","Título(s) de quien(es) implementa(n) la meta"))+'</span><div class="ieppw-row" style="gap:12px;">'
        +PW_IMPL.map(function(o){ return '<label class="ieppw-chk"><input type="checkbox" data-gmck="implementors" data-gmcv="'+esc(o)+'"'+(m.implementors.indexOf(o)>=0?' checked':'')+'> '+esc(L(o,IMPL_ES[o]))+'</label>'; }).join("")
        +'<label class="ieppw-chk">'+esc(L("Other","Otro"))+' <input type="text" data-gmk="implementorsOther" value="'+esc(m.implementorsOther)+'" style="width:130px"></label></div>'
        +'<span class="ieppw-lbl">'+esc(L("Present Level related to the goal","Nivel actual relacionado con la meta"))+'</span>'
        +'<textarea data-gmk="presentLevelForGoal" placeholder="'+esc(L("Most recent evaluation and district-wide assessment results; performance vs. general education peers and standards","Resultados de la evaluación más reciente y de las evaluaciones del distrito; desempeño frente a compañeros y estándares de educación general"))+'">'+esc(m.presentLevelForGoal)+'</textarea>'
        +'<div class="ieppw-row"><label class="ieppw-chk" style="flex:1;min-width:200px;">'+esc(L("Core Standards","Estándares básicos"))+' <input type="text" data-gmk="coreStandards" value="'+esc(m.coreStandards)+'" style="flex:1"></label>'
        +'<label class="ieppw-chk" style="flex:1;min-width:200px;">'+esc(L("State Standards","Estándares estatales"))+' <input type="text" data-gmk="stateStandards" value="'+esc(m.stateStandards)+'" style="flex:1"></label></div>'
        +(window.aogIepStdPicker?('<div class="ieppw-row" style="margin-top:0;"><button type="button" class="iep-mini" onclick="aogIepPwStdOpen(\''+gid+'\')">'+esc(ST.stdGid===gid?L("Hide standards browser","Ocultar el buscador de estándares"):L("Browse standards","Explorar estándares"))+'</button></div>'
          +(ST.stdGid===gid?('<div class="ieppw-goal">'+window.aogIepStdPicker.html("pw")
            +'<div class="ieppw-row"><button type="button" class="iep-btn gold" style="font-size:12px;padding:7px 14px;" onclick="aogIepPwStdApply(\''+gid+'\')">'+esc(L("Add selected to standards fields","Agregar seleccionados a los campos de estándares"))+'</button></div></div>'):'')):'')
        +'<span class="ieppw-lbl">'+esc(L("Goal Statement","Enunciado de la meta"))+'</span><textarea data-gmk="goalStatement">'+esc(stmt)+'</textarea>'
        +'<span class="ieppw-lbl">'+esc(L("Scoring Method","Método de calificación"))+'</span><input type="text" data-gmk="scoringMethod" value="'+esc(sm)+'" style="width:100%;box-sizing:border-box;">';
      var bTxt0=(m.baselineText!=null&&String(m.baselineText).trim()!=="")?String(m.baselineText):aogIeppwLevelText(g,"b");
      var tTxt0=(m.targetText!=null&&String(m.targetText).trim()!=="")?String(m.targetText):aogIeppwLevelText(g,"t");
      b+='<div class="ieppw-row">'
        +'<label class="ieppw-chk">'+esc(FLl("baseline"))+' <input type="text" data-gmk="baselineText" value="'+esc(bTxt0)+'" style="width:130px"></label>'
        +'<label class="ieppw-chk">'+esc(FLl("beginDate"))+' <input type="date" data-gmk="beginDate" value="'+esc(m.beginDate||((g.baseline&&g.baseline.date)||""))+'"></label>'
        +'<label class="ieppw-chk">'+esc(FLl("target"))+' <input type="text" data-gmk="targetText" value="'+esc(tTxt0)+'" style="width:130px"></label>'
        +'<label class="ieppw-chk">'+esc(FLl("masteryDate"))+' <input type="date" data-gmk="masteryDate" value="'+esc(m.masteryDate||((g.target&&g.target.date)||""))+'"></label>'
        +'</div><div class="ieppw-help">'+esc(L("Filled in from the tracked goal. Change these only where the IEP itself says something different.","Se completan desde la meta registrada. Cámbialos solo si el IEP dice algo distinto."))+'</div>';
      b+='<span class="ieppw-lbl">'+esc(L("Benchmarks / Short-Term Objectives","Puntos de referencia / objetivos a corto plazo"))+'</span>';
      m.benchmarks.forEach(function(bm,bi){
        var bl=aogIeppwBenchLetter(bi);
        b+='<div class="ieppw-goal" data-bmi="'+bi+'"><div class="ieppw-row" style="margin:0;justify-content:space-between;">'
          +'<strong style="font-size:12.5px;">'+esc(L("Benchmark ","Punto de referencia "))+bl
            +(aogIeppwIsDrafted(bm)?(' <span class="ieppw-src" title="'+esc(L(PW_DRAFT_BENCH,"Redactado aquí desde la línea objetivo — no copiado del IEP firmado."))+'">'+esc(L("drafted","borrador"))+'</span>'):'')
            +'</strong>'
          +'<button type="button" class="iep-mini danger" onclick="aogIepPwBmDel(\''+gid+'\','+bi+')" aria-label="'+esc(L("Remove benchmark","Quitar punto de referencia"))+'">×</button></div>'
          +'<textarea data-bmk="text" placeholder="'+esc(L("Benchmark or short-term objective","Punto de referencia u objetivo a corto plazo"))+'">'+esc(bm.text||"")+'</textarea>'
          +'<div class="ieppw-row"><input type="text" data-bmk="essentialElements" value="'+esc(bm.essentialElements||"")+'" placeholder="'+esc(L("Essential Elements","Elementos esenciales"))+'" style="flex:1;min-width:170px">'
          +'<input type="text" data-bmk="scoringMethod" value="'+esc(bm.scoringMethod||"")+'" placeholder="'+esc(L("Scoring Method","Método de calificación"))+'" style="flex:1;min-width:170px"></div>'
          +'<span class="ieppw-lbl">'+esc(L("Evaluation Procedure","Procedimiento de evaluación"))+'</span><div class="ieppw-row" style="gap:12px;">'
          +PW_EVALPROC.map(function(o){ return '<label class="ieppw-chk"><input type="checkbox" data-bmcv="'+esc(o)+'"'+((bm.evalProcedure||[]).indexOf(o)>=0?' checked':'')+'> '+esc(L(o,EP_ES[o]))+'</label>'; }).join("")+'</div>'
          +'<span class="ieppw-lbl">'+esc(L("Schedule for Determining Progress","Calendario para determinar el progreso"))+'</span>'
          +'<input type="text" data-bmk="schedule" value="'+esc(bm.schedule||"")+'" placeholder="'+esc(L("e.g., Weekly probes","p. ej., sondeos semanales"))+'" style="width:100%;box-sizing:border-box;">'
          +'<div class="ieppw-row"><label class="ieppw-chk" style="flex:1;min-width:190px;">'+esc(FLl("criteria"))+' <input type="text" data-bmk="criteria" value="'+esc(bm.criteria||"")+'" placeholder="'+esc(L("e.g., 3 consecutive trials","p. ej., 3 intentos consecutivos"))+'" style="flex:1"></label>'
          +'<label class="ieppw-chk">'+esc(FLl("masteryDate"))+' <input type="date" data-bmk="masteryDate" value="'+esc(bm.masteryDate||"")+'"></label></div>'
          +bmRowsHTML(g,gid,m,bl)
          +'<span class="ieppw-lbl">'+esc(FLl("progressNote"))+'</span>'
          +'<textarea data-bmk="progressNote" placeholder="'+esc(L("What the data show for this benchmark","Lo que muestran los datos de este punto de referencia"))+'">'+esc(bm.progressNote||"")+'</textarea>'
          +'<div class="ieppw-row" style="margin-top:6px;"><button type="button" class="iep-mini" onclick="aogIepPwDraftNote(\''+gid+'\','+bi+')">'+esc(L("Draft from the data","Redactar con los datos"))+'</button></div>'
          +'</div>';
      });
      b+='<button type="button" class="iep-mini" onclick="aogIepPwBmAdd(\''+gid+'\')">'+esc(L("+ add benchmark","+ agregar punto de referencia"))+'</button>';
      var rows=aogIeppwProgressRows(g,iep.data[gid]||[]);
      b+='<span class="ieppw-lbl">'+esc(L("Goal Progress Updates (auto-filled from tracker)","Actualizaciones de progreso de la meta (autocompletadas del monitor)"))+'</span>';
      if(rows.length){
        b+='<div class="ieppw-row"><label class="ieppw-chk">'+esc(L("Evaluated by (applies to all rows)","Evaluado por (se aplica a todas las filas)"))+' <input type="text" data-gmk="evaluatedBy" value="'+esc(m.evaluatedBy)+'" placeholder="'+esc(L("Initials","Iniciales"))+'" style="width:110px"></label></div>';
        b+='<div class="ieppw-help ieppw-rate-warn">\u26A0 '+esc(L(PW_DRAFT_RATE,PW_DRAFT_RATE_ES))+'</div>';
        b+='<table class="ieppw-gpt"><tr><th>'+esc(L("Date","Fecha"))+'</th><th>'+esc(L("Progress Score","Puntaje de progreso"))+'</th><th>'+esc(L("Progress","Progreso"))+'</th><th>'+esc(L("Evaluated By","Evaluado por"))+'</th></tr>';
        rows.forEach(function(r){
          var ov=m.progressRows[r.key]||{};
          var selv=ov.progress||r.def;
          var sug=aogIeppwRateSuggested(ov,r.def);
          b+='<tr data-pri="'+esc(r.key)+'"><td>'+esc(r.date)+'</td><td>'+esc(r.score)+'</td><td><select data-prk="progress"><option value=""'+(selv?'':' selected')+'>—</option>'
            +["adequate","variable","limited","met","exceeded"].map(function(k){ return '<option value="'+k+'"'+(selv===k?' selected':'')+'>'+esc(L(PW_RATE[k],RATE_ES[k]))+'</option>'; }).join("")
            +'</select>'
            +(sug?(' <span class="ieppw-src" title="'+esc(L(PW_DRAFT_RATE,PW_DRAFT_RATE_ES))+'">'+esc(L("suggested","sugerido"))+'</span>'):'')
            +'</td><td><input type="text" data-prk="evaluatedBy" value="'+esc(ov.evaluatedBy||"")+'" placeholder="'+esc(m.evaluatedBy||L("Initials","Iniciales"))+'" style="width:90px"></td></tr>';
        });
        b+='</table>';
      } else {
        b+='<div class="ieppw-help">'+esc(L("No data points recorded yet for this goal.","Aún no hay puntos de datos registrados para esta meta."))+'</div>';
      }
      b+='<span class="ieppw-lbl">'+esc(FLl("progressNote"))+'</span>'
        +'<textarea data-gmk="progressNote" placeholder="'+esc(L("What the data show for this goal","Lo que muestran los datos de esta meta"))+'">'+esc(m.progressNote!=null?m.progressNote:"")+'</textarea>'
        +'<div class="ieppw-row" style="margin-top:6px;"><button type="button" class="iep-mini" onclick="aogIepPwDraftNote(\''+gid+'\',-1)">'+esc(L("Draft from the data","Redactar con los datos"))+'</button>'
        +'<span class="ieppw-help" style="margin:0;flex:1;min-width:200px;">'+esc(L("A draft written only from the points already recorded. Read it and edit it before it goes in the IEP.","Un borrador escrito solo con los puntos ya registrados. Léelo y edítalo antes de ponerlo en el IEP."))+'</span></div>';
      b+='<label class="ieppw-chk" style="margin-top:8px;"><input type="checkbox" data-gmk="includeChart"'+(m.includeChart?' checked':'')+'> '+esc(L("Include this goal\'s chart in the printout","Incluir la gráfica de esta meta en el documento"))+'</label>';
      h+='<details class="ieppw-sec" data-sec="gp_'+esc(gid)+'" data-gmid="'+esc(gid)+'" open><summary><span class="ieppw-dot"></span>'
        +esc(L("Goal ","Meta "))+seq[gid]+' — '+esc(g.title||"")+' <span style="font-weight:400;color:var(--ink-faint,#8A92A6);font-size:12px;">('+esc(L(area,GA_ES[area]||area))+(effGr?(' · Gr. '+esc(effGr)):'')+')</span></summary>'
        +'<div class="ieppw-body">'+b+'</div></details>';
    });
    h+='<div class="ieppw-actions">'
      +'<button type="button" class="iep-btn gold" onclick="aogIepPwPrintDoc()">'+esc(L("Generate document","Generar documento"))+'</button>'
      +'<button type="button" class="iep-btn ghost" id="aogIepPwCopyBtn" onclick="aogIepPwCopy()">'+esc(L("Copy as text","Copiar como texto"))+'</button>'
      +'<span class="ieppw-save" id="aogIepPwSaved">'+esc(L("Drafts autosave on this device.","Los borradores se guardan automáticamente en este dispositivo."))+'</span>'
      +'</div>';
    return h;
  }
  function formHTML(doc){
    if(doc.type==="goalpages") return gpFormHTML(doc);
    var f=doc.fields||{};
    function F(k){ var v=f[k]; return v==null?"":String(v); }
    function ta(k,label,help,ph){
      return '<span class="ieppw-lbl">'+esc(label)+'</span><textarea data-k="'+k+'"'+(ph?(' placeholder="'+esc(ph)+'"'):'')+'>'+esc(F(k))+'</textarea>'+(help?('<div class="ieppw-help">'+esc(help)+'</div>'):'');
    }
    function selOpts(keys,enMap,esMap,selVal,blank){
      var o='<option value="">'+esc(blank)+'</option>';
      keys.forEach(function(k){ o+='<option value="'+k+'"'+(selVal===k?' selected':'')+'>'+esc(L(enMap[k],esMap[k]))+'</option>'; });
      return o;
    }
    function rateRow(base,label){
      return '<span class="ieppw-lbl">'+esc(label)+'</span><div class="ieppw-row">'
        +'<select data-k="'+base+'_r" aria-label="'+esc(label)+'">'+selOpts(["consistent","developing","concern"],PW_CRATE,CRATE_ES,F(base+"_r"),L("Rating…","Valoración…"))+'</select>'
        +'<input type="text" data-k="'+base+'_t" value="'+esc(F(base+"_t"))+'" placeholder="'+esc(L("Evidence (brief, objective)","Evidencia (breve y objetiva)"))+'" style="flex:1;min-width:200px"></div>';
    }
    var prev=prevDocFor(doc.student,ST.docId);
    var prevBtn=prev?('<button type="button" class="iep-mini" onclick="aogIepPwCopyFwd()">'+esc(prev.type==="annual"?L("Start from last year's Annual Review","Partir de la revisión anual del año pasado"):L("Copy forward from previous doc","Copiar del documento anterior"))+'</button>'):'';
    var h='<div class="ieppw-card"><div class="ieppw-row" style="justify-content:space-between;margin:0;">'
      +'<div><span class="ieppw-dtype">'+esc(typeLbl(doc.type))+'</span> <strong style="font-size:14px;">'+esc(doc.student)+'</strong></div>'
      +'<div class="ieppw-row" style="margin:0;">'
      +'<label class="ieppw-chk">'+esc(L("Grade","Grado"))+' <input type="text" data-k="grade" value="'+esc((doc.fields&&doc.fields.grade)||"")+'" maxlength="4" style="width:56px" aria-label="'+esc(L("Grade","Grado"))+'"></label>'
      +'<label class="ieppw-chk">'+esc(L("Meeting date","Fecha de la reunión"))+' <input type="date" id="aogIepPwDate" data-doc="date" value="'+esc(doc.date||"")+'"></label>'
      +prevBtn
      +'<button type="button" class="iep-mini" onclick="aogIepPwClose()">'+esc(L("Close draft","Cerrar borrador"))+'</button>'
      +'<button type="button" class="iep-mini danger" onclick="aogIepPwDelDoc(\''+ST.docId+'\')">'+esc(L("Delete draft","Eliminar borrador"))+'</button>'
      +'</div></div></div>';
    h+=sec("purpose",L("Purpose","Propósito"),
      '<div class="ieppw-purpose">'+esc(aogIeppwPurpose(doc.type,doc.student))+'</div>'
      +'<div class="ieppw-help">'+esc(L("Auto-generated. The generated document is always in English.","Se genera automáticamente. El documento generado siempre está en inglés."))+'</div>',true);
    if(doc.type!=="initial"){
      var rows=f.svcRows||[];
      var rh=rows.map(function(r,i){
        return '<div class="ieppw-row" data-sri="'+i+'">'
          +'<input type="text" data-sr="area" value="'+esc(r.area||"")+'" placeholder="'+esc(L("Area (e.g., reading)","Área (p. ej., lectura)"))+'" style="flex:1;min-width:130px">'
          +'<input type="text" data-sr="setting" value="'+esc(r.setting||"")+'" placeholder="'+esc(L("Setting","Entorno"))+'" style="flex:1;min-width:110px">'
          +'<input type="number" data-sr="min" min="0" step="5" value="'+esc(r.min||"")+'" placeholder="'+esc(L("min/week","min/semana"))+'" style="width:110px">'
          +'<button type="button" class="iep-mini danger" onclick="aogIepPwSvcDel('+i+')" aria-label="'+esc(L("Remove row","Quitar fila"))+'">×</button></div>';
      }).join("");
      h+=sec("svc",L("Current Special Education Services","Servicios actuales de educación especial"),
        '<span class="ieppw-lbl">'+esc(L("Specialized instruction (area · setting · minutes/week)","Instrucción especializada (área · entorno · minutos/semana)"))+'</span>'
        +rh
        +'<button type="button" class="iep-mini" onclick="aogIepPwSvcAdd()">'+esc(L("+ add row","+ agregar fila"))+'</button>'
        +ta("svcSdi",L("Program/SDI used and progress","Programa/SDI utilizado y progreso"))
        +ta("svcRelated",L("Related services","Servicios relacionados"))
        +ta("svcAccom",L("Current accommodations & supports in use","Acomodaciones y apoyos actualmente en uso"),
           L("List the ones being used so the team can consider deleting those no longer needed.","Enumera los que se usan para que el equipo considere eliminar los que ya no se necesiten.")));
      var gr=doc.goalRows||[];
      var gh=gr.map(function(r,i){
        return '<div class="ieppw-goal" data-gi="'+i+'">'
          +'<div class="ieppw-row" style="margin:0;">'
          +'<input type="text" data-gk="title" value="'+esc(r.title||"")+'" placeholder="'+esc(L("Goal title","Título de la meta"))+'" style="flex:1;min-width:200px">'
          +'<select data-gk="rating" aria-label="'+esc(L("Progress rating","Nivel de progreso"))+'">'+selOpts(["adequate","variable","limited","met","exceeded"],PW_RATE,RATE_ES,r.rating||"",L("Progress rating…","Nivel de progreso…"))+'</select>'
          +'<button type="button" class="iep-mini danger" onclick="aogIepPwGoalDel('+i+')" aria-label="'+esc(L("Remove goal row","Quitar fila de meta"))+'">×</button></div>'
          +(r.ref?('<div class="ieppw-ref">'+esc(r.ref)+'</div>'):'')
          +(r.gid?('<label class="ieppw-chk" style="margin-top:6px;"><input type="checkbox" data-gk="chart"'+(r.chart?' checked':'')+'> '+esc(L("Include this goal's chart in the printout","Incluir la gráfica de esta meta en el documento"))+'</label>'):'')
          +'</div>';
      }).join("");
      h+=sec("goals",L("Progress Toward Current IEP Goals","Progreso hacia las metas actuales del IEP"),
        (gh||('<div class="ieppw-help">'+esc(L("No tracked goals found for this student — add rows manually, or log goals in Progress & Graphs.","No se encontraron metas registradas para este estudiante — agrega filas manualmente o registra metas en Progreso y gráficas."))+'</div>'))
        +'<div class="ieppw-row"><button type="button" class="iep-mini" onclick="aogIepPwGoalAdd()">'+esc(L("+ add goal manually","+ agregar meta manualmente"))+'</button>'
        +'<button type="button" class="iep-mini" onclick="aogIepPwGoalSync()">'+esc(L("Refresh from tracker","Actualizar del monitor"))+'</button></div>');
    }
    function impChk(){
      var IMP_ES={imp_academic:"Desempeño académico",imp_social:"Estado social/emocional",imp_indep:"Funcionamiento independiente",imp_voc:"Vocacional",imp_motor:"Habilidades motoras",imp_speech:"Habla y lenguaje/comunicación"};
      return '<span class="ieppw-lbl">'+esc(L("Areas impacted","Áreas afectadas"))+'</span><div class="ieppw-row" style="gap:12px;">'
        +PW_IMPACT.map(function(pr){ return '<label class="ieppw-chk"><input type="checkbox" data-k="'+pr[0]+'"'+(F(pr[0])==="1"?' checked':'')+'> '+esc(L(pr[1],IMP_ES[pr[0]]))+'</label>'; }).join("")
        +'</div>';
    }
    if(doc.type!=="reeval"){
      h+=sec("str",L("Strengths, Parent Input & Health","Fortalezas, aportes de los padres y salud"),
        ta("a_strengths",L("Student strengths","Fortalezas del estudiante"))
        +ta("a_parent",L("Parental educational concerns/input","Preocupaciones/aportes educativos de los padres"))
        +ta("a_health",L("Health information/concerns","Información/preocupaciones de salud")));
    }
    function subjBlock(px,name){
      return '<div class="ieppw-sub">'+esc(name)+'</div>'
        +ta("d_"+px+"_bench",L("Benchmarking","Evaluaciones de referencia"),null,L("MAP scores, FB scores…","Puntajes MAP, puntajes FB…"))
        +'<span class="ieppw-lbl">MTSS</span><div class="ieppw-row">'
        +'<input type="date" data-k="d_'+px+'_mtss_date" value="'+esc(F("d_"+px+"_mtss_date"))+'" aria-label="'+esc(L("Intervention start date","Fecha de inicio de la intervención"))+'">'
        +'<select data-k="d_'+px+'_mtss_tier" aria-label="'+esc(L("Tier","Nivel"))+'"><option value="">'+esc(L("Tier…","Nivel…"))+'</option>'
        +["1","2","3"].map(function(tv){ return '<option value="'+tv+'"'+(F("d_"+px+"_mtss_tier")===tv?' selected':'')+'>'+esc(L("Tier ","Nivel "))+tv+'</option>'; }).join("")
        +'</select>'
        +'<input type="text" data-k="d_'+px+'_mtss_target" value="'+esc(F("d_"+px+"_mtss_target"))+'" placeholder="'+esc(L("What the intervention targets","Qué aborda la intervención"))+'" style="flex:1;min-width:180px"></div>'
        +ta("d_"+px+"_strength",L("Strengths","Fortalezas"))
        +ta("d_"+px+"_diff",L("Areas of difficulty","Áreas de dificultad"))
        +ta("d_"+px+"_supports",L("Supports that are effective","Apoyos que son eficaces"));
    }
    h+=sec("pl",L("Academic Performance / Present Levels","Desempeño académico / Niveles actuales"),
      subjBlock("ela","ELA")+subjBlock("math",L("Math","Matemáticas"))
      +(doc.type==="initial"?ta("d_el",L("EL Services","Servicios EL"),L("If the student is EL, most recent ACCESS scores.","Si el estudiante es EL, los puntajes ACCESS más recientes.")):"")
      +ta("d_other",L("Other areas as determined by the team","Otras áreas determinadas por el equipo")));
    h+=sec("cls",L("Classroom Performance & Teacher Input","Desempeño en el aula y aportes del docente"),
      rateRow("e_particip",L("Participation and engagement","Participación y compromiso"))
      +rateRow("e_org",L("Organization and work completion","Organización y finalización del trabajo"))
      +rateRow("e_hw",L("Homework and assignments","Tareas y trabajos asignados"))
      +'<span class="ieppw-lbl">'+esc(L("Report card","Boleta de calificaciones"))+'</span>'
      +'<div class="ieppw-row"><label class="ieppw-chk">'+esc(L("Grades date","Fecha de calificaciones"))+' <input type="date" data-k="e_report_date" value="'+esc(F("e_report_date"))+'"></label></div>'
      +'<textarea data-k="e_report_txt" placeholder="'+esc(L("Grades overview / summary","Resumen general de calificaciones"))+'">'+esc(F("e_report_txt"))+'</textarea>'
      +rateRow("e_routines",L("Ability to follow classroom routines","Capacidad para seguir las rutinas del aula"))
      +rateRow("e_peers",L("Peer interactions","Interacciones con compañeros"))
      +'<span class="ieppw-lbl">'+esc(L("Frequency of adult support","Frecuencia del apoyo adulto"))+'</span><div class="ieppw-row">'
      +'<select data-k="e_adult_freq" aria-label="'+esc(L("Frequency of adult support","Frecuencia del apoyo adulto"))+'">'+selOpts(["period","daily","weekly","occasional"],PW_FREQ,FREQ_ES,F("e_adult_freq"),L("Frequency…","Frecuencia…"))+'</select>'
      +'<input type="text" data-k="e_adult_t" value="'+esc(F("e_adult_t"))+'" placeholder="'+esc(L("Evidence (brief, objective)","Evidencia (breve y objetiva)"))+'" style="flex:1;min-width:200px"></div>'
      +ta("e_supports",L("Supports that are effective","Apoyos que son eficaces"))
      +(doc.type==="annual"?ta("e_adultlevel",L("Level of adult support required","Nivel de apoyo adulto requerido")):"")
      +'<div class="ieppw-help">'+esc(L("Keep entries objective — observable, countable evidence.","Mantén las entradas objetivas — evidencia observable y contable."))+'</div>');
    if(doc.type!=="annual"){
      h+=sec("data",doc.type==="reeval"?L("New Data Collected in Academic Domain Area","Datos nuevos recopilados en el área del dominio académico"):L("Data Collected in Academic Domain Area","Datos recopilados en el área del dominio académico"),
        ta("f_data",doc.type==="reeval"?L("New data only — not existing data (if appropriate)","Solo datos nuevos — no datos existentes (si corresponde)"):L("Data collected","Datos recopilados")));
    } else {
      h+=sec("impact",L("Educational Impact / Adverse Effects","Impacto educativo / Efectos adversos"),
        ta("g_impact",L("Educational impact / adverse effects","Impacto educativo / efectos adversos"),
          L("Copy the adverse effects and educational needs from the most recent eval/reevaluation.","Copia los efectos adversos y las necesidades educativas de la evaluación/reevaluación más reciente."))
        +impChk()
        +'<button type="button" class="iep-mini" style="margin-top:8px;" onclick="aogIepPwPullImpact()">'+esc(L("Pull from last saved Reevaluation","Traer de la última reevaluación guardada"))+'</button>');
    }
    if(doc.type==="initial") h+=sec("adverse",L("Adverse Effects — Areas Impacted","Efectos adversos — Áreas afectadas"),impChk());
    h+='<div class="ieppw-actions">'
      +'<button type="button" class="iep-btn gold" onclick="aogIepPwPrintDoc()">'+esc(L("Generate document","Generar documento"))+'</button>'
      +'<button type="button" class="iep-btn ghost" id="aogIepPwCopyBtn" onclick="aogIepPwCopy()">'+esc(L("Copy as text","Copiar como texto"))+'</button>'
      +'<span class="ieppw-save" id="aogIepPwSaved">'+esc(L("Drafts autosave on this device.","Los borradores se guardan automáticamente en este dispositivo."))+'</span>'
      +'</div>';
    return h;
  }
  function renderPw(){
    var root=document.getElementById("aogIepPwRoot"); if(!root) return;
    if(saveTimer) persistDraftNow();
    var openMap={}, prevSecs=root.querySelectorAll("details.ieppw-sec");
    for(var i=0;i<prevSecs.length;i++){ openMap[prevSecs[i].getAttribute("data-sec")]=prevSecs[i].open; }
    var st=load();
    var opts=collectStudents().map(function(n){ return '<option value="'+esc(n)+'"></option>'; }).join("");
    var typeOpts=["initial","reeval","annual","goalpages"].map(function(k){ var tl=(k==="goalpages")?L("Goal Pages (official)","Páginas de metas (oficial)"):typeLbl(k); return '<option value="'+k+'"'+(ST.type===k?' selected':'')+'>'+esc(tl)+'</option>'; }).join("");
    var h='<div class="iep-wrap">';
    h+='<div class="iep-privacy">'+esc(L("Initials or student code only — never full names. Drafts and documents stay on this device.","Solo iniciales o código del estudiante — nunca nombres completos. Los borradores y documentos permanecen en este dispositivo."))+'</div>';
    h+='<div class="iep-controls">'
      +'<div class="iep-field"><label for="aogIepPwStudent">'+esc(L("Student","Estudiante"))+'</label><input id="aogIepPwStudent" list="aogIepPwStudents" value="'+esc(ST.student)+'" placeholder="'+esc(L("Initials or code","Iniciales o código"))+'" oninput="aogIepPwStudentIn(this.value)"></div>'
      +'<datalist id="aogIepPwStudents">'+opts+'</datalist>'
      +'<div class="iep-field"><label for="aogIepPwType">'+esc(L("Document","Documento"))+'</label><select id="aogIepPwType" onchange="aogIepPwTypeIn(this.value)">'+typeOpts+'</select></div>'
      +'<button type="button" class="iep-btn gold" onclick="aogIepPwNew()">'+esc(L("+ New draft","+ Nuevo borrador"))+'</button>'
      +'</div>';
    h+='<div class="ieppw-card" id="aogIepPwDrafts">'+draftsHTML()+'</div>';
    if(ST.docId&&st.docs[ST.docId]) h+=formHTML(st.docs[ST.docId]);
    h+='</div>';
    root.innerHTML=h;
    var secs=root.querySelectorAll("details.ieppw-sec");
    for(var j=0;j<secs.length;j++){ var k=secs[j].getAttribute("data-sec"); if(Object.prototype.hasOwnProperty.call(openMap,k)) secs[j].open=!!openMap[k]; }
    updateDots();
  }

  /* ---------- handlers ---------- */
  var stuTimer=null;
  window.aogIepPwStudentIn=function(v){
    ST.student=v||"";
    if(stuTimer) clearTimeout(stuTimer);
    stuTimer=setTimeout(function(){ var d=document.getElementById("aogIepPwDrafts"); if(d) d.innerHTML=draftsHTML(); },250);
  };
  window.aogIepPwTypeIn=function(v){ ST.type=PW_TYPES[v]?v:"annual"; };
  window.aogIepPwNew=function(){
    var student=(ST.student||"").trim();
    var inEl=document.getElementById("aogIepPwStudent");
    if(!student&&inEl) student=(inEl.value||"").trim();
    if(!student){ alert(L("Enter a student code or initials first.","Primero ingresa un código o las iniciales del estudiante.")); return; }
    ST.student=student;
    var id="d"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
    var doc={student:student,type:ST.type,date:todayStr(),created:Date.now(),updated:Date.now(),fields:{svcRows:[]},goalRows:[]};
    try{ var pwg=aogIeppwStudentGrade(iepState(),student); if(pwg) doc.fields.grade=pwg; }catch(ePwg){}
    if(doc.type!=="initial"&&doc.type!=="goalpages") doc.goalRows=autoGoals(student);
    var st=load(); aogIeppwMergeDoc(st,id,doc); save(st);
    ST.docId=id; renderPw();
    try{ var fd=document.querySelector('#aogIepPwRoot details.ieppw-sec'); if(fd&&fd.scrollIntoView) fd.scrollIntoView({behavior:"smooth",block:"start"}); }catch(e){}
  };
  window.aogIepPwResume=function(id){ var st=load(); if(!st.docs[id]) return; ST.docId=id; ST.student=st.docs[id].student||ST.student; renderPw(); };
  window.aogIepPwClose=function(){ persistDraftNow(); ST.docId=null; renderPw(); };
  window.aogIepPwDelDoc=function(id){
    var st=load(); if(!st.docs[id]) return;
    if(!confirm(L("Delete this draft? This cannot be undone.","¿Eliminar este borrador? No se puede deshacer."))) return;
    delete st.docs[id]; if(ST.docId===id) ST.docId=null;
    save(st); renderPw();
  };
  window.aogIepPwCopyFwd=function(){
    persistDraftNow();
    var st=load(); var doc=ST.docId?st.docs[ST.docId]:null; if(!doc) return;
    var prev=prevDocFor(doc.student,ST.docId);
    if(!prev){ alert(L("No earlier saved document for this student.","No hay un documento guardado anterior para este estudiante.")); return; }
    doc.fields=aogIeppwCopyForward(prev.fields||{},doc.type,doc.fields||{});
    if((!doc.goalRows||!doc.goalRows.length)&&prev.goalRows&&prev.goalRows.length) doc.goalRows=JSON.parse(JSON.stringify(prev.goalRows));
    doc.updated=Date.now(); save(st); renderPw();
  };
  window.aogIepPwPullImpact=function(){
    persistDraftNow();
    var st=load(); var doc=ST.docId?st.docs[ST.docId]:null; if(!doc) return;
    var best=null;
    Object.keys(st.docs).forEach(function(id){
      if(id===ST.docId) return;
      var d=st.docs[id];
      if(d.type!=="reeval"||(d.student||"")!==doc.student) return;
      if(!best||(d.updated||0)>(best.updated||0)) best=d;
    });
    if(!best){ alert(L("No saved Reevaluation found for this student.","No se encontró una reevaluación guardada para este estudiante.")); return; }
    var v=(best.fields&&(best.fields.g_impact||best.fields.f_data))||"";
    if(!String(v).trim()){ alert(L("The saved Reevaluation has no impact/data text to pull.","La reevaluación guardada no tiene texto de impacto/datos para traer.")); return; }
    doc.fields=doc.fields||{}; doc.fields.g_impact=v; doc.updated=Date.now();
    save(st); renderPw();
  };
  window.aogIepPwSvcAdd=function(){
    persistDraftNow();
    var st=load(); var doc=ST.docId?st.docs[ST.docId]:null; if(!doc) return;
    doc.fields=doc.fields||{}; if(!doc.fields.svcRows) doc.fields.svcRows=[];
    doc.fields.svcRows.push({area:"",setting:"",min:""});
    save(st); renderPw();
  };
  window.aogIepPwSvcDel=function(i){
    persistDraftNow();
    var st=load(); var doc=ST.docId?st.docs[ST.docId]:null; if(!doc||!doc.fields||!doc.fields.svcRows) return;
    doc.fields.svcRows.splice(i,1);
    save(st); renderPw();
  };
  window.aogIepPwGoalAdd=function(){
    persistDraftNow();
    var st=load(); var doc=ST.docId?st.docs[ST.docId]:null; if(!doc) return;
    if(!doc.goalRows) doc.goalRows=[];
    doc.goalRows.push({gid:null,title:"",rating:"",ref:"",chart:false});
    save(st); renderPw();
  };
  window.aogIepPwGoalDel=function(i){
    persistDraftNow();
    var st=load(); var doc=ST.docId?st.docs[ST.docId]:null; if(!doc||!doc.goalRows) return;
    doc.goalRows.splice(i,1);
    save(st); renderPw();
  };
  window.aogIepPwGoalSync=function(){
    persistDraftNow();
    var st=load(); var doc=ST.docId?st.docs[ST.docId]:null; if(!doc) return;
    if(!doc.goalRows) doc.goalRows=[];
    var iep=iepState(), have={};
    doc.goalRows.forEach(function(r){ if(r&&r.gid){ have[r.gid]=1; if(iep.goals[r.gid]) r.ref=aogIeppwGoalRef(iep.goals[r.gid],iep.data[r.gid]||[]); } });
    Object.keys(iep.goals).forEach(function(id){
      var g=iep.goals[id];
      if(!g||g.archived||(g.student||"")!==doc.student||have[id]) return;
      doc.goalRows.push({gid:id,title:g.title||"",rating:"",ref:aogIeppwGoalRef(g,iep.data[id]||[]),chart:true,grp:aogIeppwAreaMap(g.area)==="Academic"?"A":"F"});
    });
    doc.updated=Date.now(); save(st); renderPw();
  };
  window.aogIepPwBmAdd=function(gid){
    persistDraftNow();
    var st=load(); var m=aogIeppwGoalMeta(st,gid);
    m.benchmarks.push({letter:aogIeppwBenchLetter(m.benchmarks.length),text:"",essentialElements:"",scoringMethod:"",evalProcedure:[],schedule:""});
    st.goalMeta[gid]=m; save(st); renderPw();
  };
  window.aogIepPwFormIn=function(v){
    persistDraftNow();
    var st=load(), doc=ST.docId?st.docs[ST.docId]:null; if(!doc) return;
    doc.fields=doc.fields||{};
    doc.fields.formProfile=(v==="generic")?"generic":"isbe";
    doc.updated=Date.now(); save(st); renderPw();
  };
  window.aogIepPwDraftNote=function(gid,bi){
    persistDraftNow();
    var st=load(), m=aogIeppwGoalMeta(st,gid), iep=iepState();
    var g=iep.goals&&iep.goals[gid]; if(!g) return;
    var pts=(iep.data&&iep.data[gid])||[], es=L(false,true);
    if(bi==null||bi<0){
      m.progressNote=aogIeppwNarrative(g,pts,{scope:"goal",es:es});
    } else {
      var bm=m.benchmarks&&m.benchmarks[bi]; if(!bm) return;
      var bl=bm.letter||aogIeppwBenchLetter(bi);
      bm.progressNote=aogIeppwNarrative(g,pts.filter(function(p){ return p&&String(p.bench||"")===String(bl); }),{scope:"bench",criteria:bm.criteria,es:es});
    }
    st.goalMeta[gid]=m; save(st); renderPw();
  };
  window.aogIepPwBmDel=function(gid,i){
    persistDraftNow();
    var st=load(); var m=aogIeppwGoalMeta(st,gid);
    m.benchmarks.splice(i,1);
    for(var j=0;j<m.benchmarks.length;j++) m.benchmarks[j].letter=aogIeppwBenchLetter(j);
    st.goalMeta[gid]=m; save(st); renderPw();
  };
  window.aogIepPwStdOpen=function(gid){
    persistDraftNow();
    ST.stdGid=(ST.stdGid===gid)?null:gid;
    try{
      if(window.aogIepStdPicker){
        var pwBnd="";
        try{ var pwIep=iepState(); var pwG=pwIep.goals[gid]; if(pwG&&pwG.grade&&window.aogIepStdPicker.gradeBand) pwBnd=window.aogIepStdPicker.gradeBand(pwG.grade); }catch(eB2){}
        window.aogIepStdPicker.state.pw={q:"",src:"",picks:[],band:pwBnd};
      }
    }catch(e){}
    renderPw();
  };
  window.aogIepPwStdApply=function(gid){
    persistDraftNow();
    var P=window.aogIepStdPicker; if(!P) return;
    var picks=(P.state.pw&&P.state.pw.picks)||[];
    if(!picks.length){ alert(L("Tap one or more standards first.","Primero toca uno o más estándares.")); return; }
    var st=load(); var m=aogIeppwGoalMeta(st,gid);
    var core=picks.filter(function(p){ return p.src==="ccss"; });
    var stt=picks.filter(function(p){ return p.src!=="ccss"; });
    if(core.length) m.coreStandards=P.append(m.coreStandards,core);
    if(stt.length) m.stateStandards=P.append(m.stateStandards,stt);
    st.goalMeta[gid]=m; save(st);
    P.state.pw={q:"",src:"",picks:[]}; ST.stdGid=null; renderPw();
  };

  /* ---------- output: print window + copy-as-text (document output is English-only) ---------- */
  window.aogIepPwPrintDoc=function(){
    persistDraftNow();
    var st=load(); var doc=ST.docId?st.docs[ST.docId]:null; if(!doc) return;
    var f=doc.fields||{}; var iep=iepState();
    var ctx={goals:iep.goals,data:iep.data,goalMeta:st.goalMeta||{}};
    var secTexts=aogIeppwSectionTexts(doc,ctx);
    var PFID=(f&&f.formProfile)||"isbe";
    function PFL(k){ return aogIeppwFL(PFID,k,false); }
    function has(k){ return !!(f[k]!=null&&String(f[k]).trim()); }
    function val(k){ return String(f[k]).trim(); }
    function secH(t){ return '<h2 style="font-family:Georgia,serif;font-size:15px;color:#0A1E33;border-bottom:2px solid #D9A33B;padding-bottom:4px;margin:22px 0 8px;">'+esc(t)+'</h2>'; }
    function lbl(t){ return '<div style="font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#8A92A6;margin:10px 0 2px;">'+esc(t)+'</div>'; }
    function txt(v){ return '<div style="font-size:12.5px;line-height:1.55;color:#0A1E33;white-space:pre-wrap;">'+esc(String(v).trim())+'</div>'; }
    function fld(l,v){ return (v!=null&&String(v).trim())?(lbl(l)+txt(v)):""; }
    var TH='<th style="text-align:left;border-bottom:1px solid #E4DAC5;padding:3px 8px 3px 0;">';
    var TD='<td style="padding:3px 8px 3px 0;border-bottom:1px solid #F0EADA;">';
    function svcHTML(){
      var svcB="";
      var sr=(f.svcRows||[]).filter(function(r){ return r&&((r.area&&String(r.area).trim())||(r.setting&&String(r.setting).trim())||(r.min&&String(r.min).trim())); });
      if(sr.length){
        svcB+=lbl("Specialized instruction")+'<table style="border-collapse:collapse;font-size:12px;width:100%;"><tr>'+TH+'Area</th>'+TH+'Setting</th>'+TH+'Minutes/week</th></tr>'
          +sr.map(function(r){ return '<tr>'+TD+esc(r.area||"")+'</td>'+TD+esc(r.setting||"")+'</td>'+TD+esc(r.min||"")+'</td></tr>'; }).join("")+'</table>';
      }
      if(has("svcSdi")) svcB+=lbl("Program/SDI used and progress")+txt(f.svcSdi);
      if(has("svcRelated")) svcB+=lbl("Related services")+txt(f.svcRelated);
      if(has("svcAccom")) svcB+=lbl("Current accommodations & supports in use")+txt(f.svcAccom);
      return svcB?(secH("CURRENT SPECIAL EDUCATION SERVICES")+svcB):"";
    }
    function goalsHTML(){
      var rows=(doc.goalRows||[]).filter(function(r){ return r&&(r.title||"").trim(); });
      if(!rows.length) return "";
      var b2=secH("PROGRESS TOWARD CURRENT IEP GOALS");
      rows.forEach(function(r,i){
        b2+='<div style="margin:0 0 14px;page-break-inside:avoid;">'
          +'<div style="font-size:13px;font-weight:700;color:#0A1E33;">'+(i+1)+'. '+esc(r.title.trim())
          +(r.rating&&PW_RATE[r.rating]?(' <span style="font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#0A1E33;background:#F4E8CE;border-radius:999px;padding:2px 9px;vertical-align:1px;">'+esc(PW_RATE[r.rating])+'</span>'):'')+'</div>'
          +(r.ref?('<div style="font-size:11.5px;color:#46506E;margin:3px 0;">'+esc(r.ref)+'</div>'):'');
        if(r.chart&&r.gid&&iep.goals[r.gid]) b2+=aogIeppwChartSVG(iep.goals[r.gid],iep.data[r.gid]||[]);
        b2+='</div>';
      });
      return b2;
    }
    function plHTML(){
      var plB="";
      function subjOut(px,name){
        var s2="";
        if(has("d_"+px+"_bench")) s2+=lbl("Benchmarking")+txt(f["d_"+px+"_bench"]);
        var mB=[];
        if(has("d_"+px+"_mtss_date")) mB.push("Intervention started "+val("d_"+px+"_mtss_date"));
        if(has("d_"+px+"_mtss_tier")) mB.push("Tier "+val("d_"+px+"_mtss_tier"));
        if(has("d_"+px+"_mtss_target")) mB.push("Targets: "+val("d_"+px+"_mtss_target"));
        if(mB.length) s2+=lbl("MTSS")+txt(mB.join(" \u00b7 "));
        if(has("d_"+px+"_strength")) s2+=lbl("Strengths")+txt(f["d_"+px+"_strength"]);
        if(has("d_"+px+"_diff")) s2+=lbl("Areas of difficulty")+txt(f["d_"+px+"_diff"]);
        if(has("d_"+px+"_supports")) s2+=lbl("Supports that are effective")+txt(f["d_"+px+"_supports"]);
        if(s2) plB+='<h3 style="font-family:Georgia,serif;font-size:13.5px;color:#0A1E33;margin:12px 0 0;">'+esc(name)+'</h3>'+s2;
      }
      subjOut("ela","ELA"); subjOut("math","Math");
      if(doc.type==="initial"&&has("d_el")) plB+=lbl("EL Services")+txt(f.d_el);
      if(has("d_other")) plB+=lbl("Other areas as determined by the team")+txt(f.d_other);
      return plB?(secH("STUDENT'S PRESENT LEVEL OF ACADEMIC ACHIEVEMENT")+plB):"";
    }
    function funcHTML(){
      var clB="";
      function rowOut(base,label){
        var r=f[base+"_r"], t=f[base+"_t"];
        var rOk=r&&PW_CRATE[r], tOk=t!=null&&String(t).trim();
        if(rOk||tOk) clB+='<div style="font-size:12.5px;margin:4px 0;color:#0A1E33;"><strong>'+esc(label)+':</strong> '+esc(rOk?PW_CRATE[r]:"")+((rOk&&tOk)?" \u2014 ":"")+esc(tOk?String(t).trim():"")+'</div>';
      }
      rowOut("e_particip","Participation and engagement");
      rowOut("e_org","Organization and work completion");
      rowOut("e_hw","Homework and assignments");
      if(has("e_report_txt")||has("e_report_date")) clB+='<div style="font-size:12.5px;margin:4px 0;color:#0A1E33;"><strong>Report card'+(has("e_report_date")?(" ("+esc(val("e_report_date"))+")"):"")+':</strong> '+esc(has("e_report_txt")?val("e_report_txt"):"")+'</div>';
      rowOut("e_routines","Ability to follow classroom routines");
      rowOut("e_peers","Peer interactions");
      var fq=f.e_adult_freq&&PW_FREQ[f.e_adult_freq];
      if(fq||has("e_adult_t")) clB+='<div style="font-size:12.5px;margin:4px 0;color:#0A1E33;"><strong>Frequency of adult support:</strong> '+esc(fq||"")+((fq&&has("e_adult_t"))?" \u2014 ":"")+esc(has("e_adult_t")?val("e_adult_t"):"")+'</div>';
      if(has("e_supports")) clB+=lbl("Supports that are effective")+txt(f.e_supports);
      if(doc.type==="annual"&&has("e_adultlevel")) clB+=lbl("Level of adult support required")+txt(f.e_adultlevel);
      (doc.goalRows||[]).forEach(function(r){
        if(r&&r.grp==="F"&&(r.title||"").trim()) clB+='<div style="font-size:12.5px;margin:4px 0;color:#0A1E33;"><strong>Goal \u2014 '+esc(r.title.trim())+':</strong> '+esc(r.ref||"")+'</div>';
      });
      return clB?(secH("STUDENT'S PRESENT LEVELS OF FUNCTIONAL/DEVELOPMENTAL PERFORMANCE")+clB):"";
    }
    function gpHTML(gid,numLbl){
      var g=iep.goals[gid]; if(!g) return "";
      var m=aogIeppwGoalMeta(st,gid);
      var area=m.goalArea||aogIeppwAreaMap(g.area);
      var stmt=m.goalStatement!=null?m.goalStatement:aogIeppwGoalStatement(g);
      var sm=m.scoringMethod!=null?m.scoringMethod:aogIeppwScoringDefault(g);
      var pn=m.parentNotification.slice(); if(m.parentNotificationOther) pn.push("Other: "+m.parentNotificationOther);
      var im=m.implementors.slice(); if(m.implementorsOther) im.push("Other: "+m.implementorsOther);
      var h2=secH("GOAL "+numLbl);
      var meta1=[];
      if(m.goalType) meta1.push("<strong>Goal Type:</strong> "+esc(m.goalType));
      meta1.push("<strong>Goal Area:</strong> "+esc(area));
      var pgr=aogIeppwGoalGrade(g,m); if(pgr) meta1.push("<strong>Grade:</strong> "+esc(pgr));
      h2+='<div style="font-size:12.5px;color:#0A1E33;margin:2px 0;">'+meta1.join(" &nbsp;\u00b7&nbsp; ")+'</div>';
      if(pn.length) h2+=fld("Method of Parent Notification",pn.join(", "));
      h2+=fld("Date(s) parent will be provided with progress",m.progressDates);
      if(im.length) h2+=fld("Title(s) of Goal Implementor(s)",im.join(", "));
      h2+=fld("Present Level related to the goal",m.presentLevelForGoal);
      h2+=fld("Core Standards",m.coreStandards);
      h2+=fld("State Standards",m.stateStandards);
      h2+=fld("Goal Statement",stmt);
      h2+=fld("Scoring Method",sm);
      var pbT=(m.baselineText!=null&&String(m.baselineText).trim()!=="")?String(m.baselineText).trim():aogIeppwLevelText(g,"b");
      var ptT=(m.targetText!=null&&String(m.targetText).trim()!=="")?String(m.targetText).trim():aogIeppwLevelText(g,"t");
      var pbD=aogIeppwLevelDate(g,m,"b"), ptD=aogIeppwLevelDate(g,m,"t");
      if(pbT||pbD) h2+=fld(PFL("baseline"),pbT+(pbD?("   \u00b7   "+PFL("beginDate")+": "+pbD):""));
      if(ptT||ptD) h2+=fld(PFL("target"),ptT+(ptD?("   \u00b7   "+PFL("masteryDate")+": "+ptD):""));
      var rows=aogIeppwProgressRows(g,iep.data[gid]||[]);
      if(rows.length){
        var anySug=false;
        var body1=rows.map(function(r){
          var ov=m.progressRows[r.key]||{};
          var sug=aogIeppwRateSuggested(ov,r.def); if(sug) anySug=true;
          return '<tr>'+TD+esc(r.date)+'</td>'+TD+esc(ov.evaluatedBy||m.evaluatedBy||"")+'</td>'+TD+esc(r.score)+'</td>'
            +TD+esc(PW_RATE[ov.progress||r.def]||"")+(sug?' <span style="font-size:9.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#8A6116;">'+esc("suggested")+'</span>':'')+'</td></tr>';
        }).join("");
        h2+=lbl("Goal Progress Updates")+'<table style="border-collapse:collapse;font-size:12px;width:100%;"><tr>'+TH+'Date</th>'+TH+'Evaluated By</th>'+TH+'Progress Score</th>'+TH+'Progress</th></tr>'
          +body1+'</table>';
        if(anySug) h2+='<div style="font-size:10.5px;color:#8A6116;margin:3px 0 0;">\u26A0 '+esc(PW_DRAFT_RATE)+'</div>';
      }
      var pgAuto=!(m.progressNote!=null&&String(m.progressNote).trim()!=="");
      var pgNote=pgAuto?(rows.length?aogIeppwNarrative(g,iep.data[gid]||[],{scope:"goal"}):""):String(m.progressNote).trim();
      if(pgNote){
        h2+=fld(PFL("progressNote"),pgNote);
        if(pgAuto) h2+='<div style="font-size:10.5px;color:#8A6116;margin:3px 0 0;">\u26A0 '+esc(PW_DRAFT_NOTE)+'</div>';
      }
      if(m.includeChart) h2+=aogIeppwChartSVG(g,iep.data[gid]||[]);
      var ER='<tr><td style="border-bottom:1px solid #F0EADA;padding:11px 8px 3px 0;">&nbsp;</td><td style="border-bottom:1px solid #F0EADA;">&nbsp;</td><td style="border-bottom:1px solid #F0EADA;">&nbsp;</td><td style="border-bottom:1px solid #F0EADA;">&nbsp;</td></tr>';
      m.benchmarks.forEach(function(bm,bi){
        var bl=bm.letter||aogIeppwBenchLetter(bi);
        h2+='<div style="border:1px solid #E4DAC5;border-radius:8px;padding:8px 10px;margin:8px 0;page-break-inside:avoid;">'
          +'<div style="font-size:12.5px;font-weight:700;color:#0A1E33;">Benchmark '+esc(bl)
            +(aogIeppwIsDrafted(bm)?' <span style="font-size:9.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#8A6116;background:#FBF1DE;border:1px solid #B4802A;border-radius:999px;padding:1px 6px;">drafted</span>':'')
            +'</div>'
          +(bm.text?txt(bm.text):"")
          +(aogIeppwIsDrafted(bm)?('<div style="font-size:10.5px;color:#8A6116;margin:3px 0 0;">\u26A0 '+esc(PW_DRAFT_BENCH)+'</div>'):"")
          +fld("Essential Elements",bm.essentialElements)
          +fld("Scoring Method",bm.scoringMethod)
          +((bm.criteria||bm.masteryDate)?fld(PFL("criteria"),String(bm.criteria||"")+(bm.masteryDate?("   \u00b7   "+PFL("masteryDate")+": "+aogIeppwFDate(bm.masteryDate)):"")):"")
          +((bm.evalProcedure&&bm.evalProcedure.length)?fld("Evaluation Procedure",bm.evalProcedure.join(", ")):"")
          +fld("Schedule for Determining Progress",bm.schedule)
          +lbl("Benchmark Progress Updates")
          +(function(){
            var brs=aogIeppwBenchRows(g,iep.data[gid]||[],bl);
            var bSug=false;
            var body=brs.length?brs.map(function(r){
              var ov=(m.benchRows&&m.benchRows[bl+"|"+r.key])||{};
              var sg2=aogIeppwRateSuggested(ov,r.def); if(sg2) bSug=true;
              return '<tr>'+TD+esc(r.date)+'</td>'+TD+esc(ov.evaluatedBy||m.evaluatedBy||"")+'</td>'+TD+esc(r.score)+'</td>'
                +TD+esc(PW_RATE[ov.progress||r.def]||"")+(sg2?' <span style="font-size:9.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#8A6116;">'+esc("suggested")+'</span>':'')+'</td></tr>';
            }).join(""):(ER+ER+ER);
            return '<table style="border-collapse:collapse;font-size:12px;width:100%;"><tr>'+TH+'Date</th>'+TH+'Evaluated By</th>'+TH+'Progress Score</th>'+TH+'Progress</th></tr>'+body+'</table>'
              +(bSug?('<div style="font-size:10.5px;color:#8A6116;margin:3px 0 0;">\u26A0 '+esc(PW_DRAFT_RATE)+'</div>'):"");
          })()
          +(function(){
            var bn=(bm.progressNote!=null&&String(bm.progressNote).trim()!=="")?String(bm.progressNote).trim():"";
            if(!bn){ var bp=(iep.data[gid]||[]).filter(function(p){ return p&&String(p.bench||"")===String(bl); }); if(bp.length) bn=aogIeppwNarrative(g,bp,{scope:"bench",criteria:bm.criteria}); }
            return bn?fld(PFL("progressNote"),bn):"";
          })()
          +'</div>';
      });
      return h2;
    }
    var texts=[], secsHtml=[];
    secTexts.forEach(function(sx){
      var inner="", pb=false;
      if(sx.id==="purpose") inner=secH("PURPOSE")+'<p style="font-size:12.5px;line-height:1.6;margin:0;">'+esc(aogIeppwPurpose(doc.type,doc.student))+'</p>';
      else if(sx.id==="svc") inner=svcHTML();
      else if(sx.id==="goals") inner=goalsHTML();
      else if(sx.id==="pl") inner=plHTML();
      else if(sx.id==="func") inner=funcHTML();
      else if(sx.id.indexOf("goal_")===0){ inner=gpHTML(sx.id.slice(5),String(sx.title).replace("GOAL ","")); pb=true; }
      if(!inner) inner=secH(sx.title)+txt(sx.text);
      texts.push(sx.title+"\n"+sx.text);
      secsHtml.push('<div style="position:relative;'+(pb?'page-break-after:always;':'')+'"><button type="button" class="np pwc" data-si="'+(texts.length-1)+'">Copy</button>'+inner+'</div>');
    });
    var b=secsHtml.join("");
    if(!secTexts.length) b='<p style="font-size:12.5px;color:#46506E;">No content yet \u2014 fill in the draft first.</p>';
    var title=(PW_TYPES[doc.type]||"IEP")+" \u2014 Meeting Paperwork";
    var w=window.open("","_blank");
    if(!w){ alert(L("Please allow pop-ups to print.","Permite las ventanas emergentes para imprimir.")); return; }
    var secJson=JSON.stringify(texts).replace(/</g,"\\u003c");
    var docHtml='<!doctype html><html><head><meta charset="utf-8"><title>'+esc(title+" \u2014 "+(doc.student||""))+'</title><style>*{-webkit-print-color-adjust:exact;print-color-adjust:exact;}body{font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;color:#0A1E33;margin:36px auto;max-width:760px;}.pwc{position:absolute;right:0;top:16px;font:inherit;font-size:11px;font-weight:700;background:#fff;border:1px solid #E4DAC5;border-radius:7px;padding:3px 10px;cursor:pointer;color:#46506E;}@media print{body{margin:.5in;}.np{display:none;}}</style></head><body>'
      +'<div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #D9A33B;padding-bottom:12px;margin:0 0 6px;"><span style="width:40px;height:40px;border-radius:8px;background:#D9A33B;color:#0A1E33;font-family:Georgia,serif;font-weight:700;font-size:24px;display:flex;align-items:center;justify-content:center;">A</span>'
      +'<div><div style="font-family:Georgia,serif;font-size:18px;font-weight:700;">'+esc(title)+'</div>'
      +'<div style="font-size:12px;color:#46506E;">Student: '+esc(doc.student||"")+((f.grade&&String(f.grade).trim())?(' &nbsp;\u00b7&nbsp; Grade: '+esc(String(f.grade).trim())):'')+((f.dob&&String(f.dob).trim())?(' &nbsp;\u00b7&nbsp; '+esc(PFL("dob"))+': '+esc(aogIeppwFDate(String(f.dob).trim()))):'')+' &nbsp;\u00b7&nbsp; Meeting date: '+esc(doc.date||"")+'</div></div></div>'
      +'<p class="np" style="margin:8px 0 0;"><button onclick="window.print()" style="font:inherit;font-weight:700;background:#0A1E33;color:#fff;border:0;border-radius:8px;padding:9px 18px;cursor:pointer;">Print</button> <span style="font-size:11.5px;color:#8A92A6;">Use the Copy button beside each section to paste it into the district IEP system.</span></p>'
      +b
      +'<div style="margin-top:18px;border-top:1px solid #E4DAC5;padding-top:8px;font-size:10.5px;color:#8A92A6;">'+esc(aogIeppwFooter())+'</div>'
      +'<scr'+'ipt>var SEC='+secJson+';document.addEventListener("click",function(ev){var bt=ev.target;if(!bt||!bt.classList||!bt.classList.contains("pwc"))return;var i=+bt.getAttribute("data-si");var t=SEC[i]||"";function d(){bt.textContent="Copied \u2713";setTimeout(function(){bt.textContent="Copy";},1400);}function fb(){var ta=document.createElement("textarea");ta.value=t;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.focus();ta.select();try{document.execCommand("copy");}catch(e){}ta.remove();d();}try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(d,fb);else fb();}catch(e){fb();}});</scr'+'ipt></bo'+'dy></html>';
    w.document.write(docHtml); w.document.close();
  };
  window.aogIepPwCopy=function(){
    persistDraftNow();
    var st=load(); var doc=ST.docId?st.docs[ST.docId]:null; if(!doc) return;
    var iep=iepState();
    var txt=aogIeppwPlainText(doc,{goals:iep.goals,data:iep.data,goalMeta:st.goalMeta||{}});
    var btn=document.getElementById("aogIepPwCopyBtn");
    var done=function(){ if(btn){ var o=btn.textContent; btn.textContent=L("Copied ✓","Copiado ✓"); setTimeout(function(){ try{ btn.textContent=o; }catch(e){} },1600); } };
    var fb=function(){
      try{
        var t=document.createElement("textarea");
        t.value=txt; t.style.position="fixed"; t.style.opacity="0";
        document.body.appendChild(t); t.focus(); t.select();
        document.execCommand("copy"); t.remove(); done();
      }catch(e){}
    };
    try{
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done,fb);
      else fb();
    }catch(e){ fb(); }
  };

  /* ---------- init: wrap aogRenderIep (never edits #aog-iep-js), bilingual re-render on lang flips ---------- */
  function init(){ wrapRender(); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
  try{ new MutationObserver(function(){ try{ if(document.getElementById("aogIepPwBar")) ensureUI(); }catch(e){} }).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]}); }catch(e){}
})();
