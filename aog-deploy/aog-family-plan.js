/* AOG-FAMILY-PLAN-ENGINE-V1 (2026-09-28) — Jimmy: families collect their own data at home and an engine
   turns it into a plan for them, like the teacher's IEP engine (aog-iep-fill.js). This file is the
   engine only: pure functions, no storage, no page. It reads a child's home log and goals and writes
   plain lines. Every line ends with its source. Strengths first. No labels, no diagnoses; hard things
   are plain counts. What a family types is never touched here — the page keeps that layer. */
(function(root){
  "use strict";
  var FEEL = {
    calm:["calm","tranquilo"], happy:["happy","feliz"], proud:["proud","orgulloso"], curious:["curious","curioso"],
    loved:["close to us","cerca de nosotros"], energetic:["full of energy","con mucha energía"],
    worried:["worried","preocupado"], frustrated:["frustrated","frustrado"], tired:["tired","cansado"],
    sad:["sad","triste"], overwhelmed:["overwhelmed","abrumado"]
  };
  var BRIGHT = ["calm","happy","proud","curious","loved","energetic"];
  var HELP = {
    move:["a movement break","una pausa para moverse"], quiet:["a quiet space","un lugar tranquilo"],
    snack:["a snack or water","algo de comer o agua"], list:["a picture list or schedule","una lista o horario con dibujos"],
    time:["extra time","más tiempo"], together:["doing it together","hacerlo juntos"], music:["music","música"],
    outside:["time outside","tiempo afuera"], firstthen:["first–then","primero–después"], choice:["a choice","poder elegir"],
    hug:["a hug or close time","un abrazo o tiempo juntos"]
  };
  function L(es, pair){ return pair ? pair[es?1:0] : ""; }
  function dates(log){ return Object.keys(log||{}).filter(function(d){ return /^\d{4}-\d\d-\d\d$/.test(d); }).sort(); }
  function parse(d){ var p=d.split("-"); return new Date(+p[0], +p[1]-1, +p[2]); }
  function fmtRange(a, b, es){
    var loc = es ? "es" : "en-US", A=parse(a), B=parse(b);
    var m = function(D){ return D.toLocaleDateString(loc,{month:"short"}).replace(".",""); };
    if(a===b) return es ? A.getDate()+" "+m(A) : m(A)+" "+A.getDate();
    if(A.getMonth()===B.getMonth() && A.getFullYear()===B.getFullYear())
      return es ? A.getDate()+"–"+B.getDate()+" "+m(B) : m(A)+" "+A.getDate()+"–"+B.getDate();
    return es ? A.getDate()+" "+m(A)+" – "+B.getDate()+" "+m(B) : m(A)+" "+A.getDate()+" – "+m(B)+" "+B.getDate();
  }
  function src(label, n, a, b, es){
    return " ("+label+" · "+n+" "+(es?(n===1?"día":"días"):(n===1?"day":"days"))+" · "+fmtRange(a,b,es)+")";
  }
  function count(list, fn){ var c=0; list.forEach(function(x){ if(fn(x)) c++; }); return c; }
  function tally(list, field){
    var t={}; list.forEach(function(e){ (e[field]||[]).forEach(function(k){ t[k]=(t[k]||0)+1; }); });
    return Object.keys(t).map(function(k){ return {k:k, n:t[k]}; }).sort(function(x,y){ return y.n-x.n || (x.k<y.k?-1:1); });
  }
  function r1(x){ return Math.round(x*10)/10; }
  function avg(a){ return a.length ? a.reduce(function(s,x){ return s+x; },0)/a.length : null; }
  function days(n, es){ return n+" "+(es?(n===1?"día":"días"):(n===1?"day":"days")); }
  function joinAnd(a, es){ if(a.length<2) return a.join(""); return a.slice(0,-1).join(", ")+(es?" y ":" and ")+a[a.length-1]; }

  /* build(log, goals, lang) → the engine layer of the plan */
  function build(log, goals, lang, routines){
    var es = lang==="es", ds = dates(log), E = ds.map(function(d){ var e=log[d]||{}; e._d=d; return e; });
    var out = { es:es, n:E.length, first:ds[0]||"", last:ds[ds.length-1]||"",
      strengths:[], hard:[], helps:[], sleepmood:[], goals:[], routines:[], sleep:[], mood:[], summary:{} };
    var SRC = E.length ? src(es?"Registro en casa":"Home log", E.length, out.first, out.last, es) : "";
    if(E.length){
      var moodE = E.filter(function(e){ return e.mood>=1 && e.mood<=5; });
      var good = count(moodE, function(e){ return e.mood>=4; }), low = count(moodE, function(e){ return e.mood<=2; });
      /* ── strengths ── */
      if(good) out.strengths.push((es?"Tuvo "+days(good,true)+" buenos o muy buenos de "+moodE.length+" registrados."
                                     :"Had "+good+" good or great "+(good===1?"day":"days")+" out of "+moodE.length+" logged.")+SRC);
      var ft = tally(E,"feel"), bright = ft.filter(function(x){ return BRIGHT.indexOf(x.k)>=0; }).slice(0,3);
      if(bright.length) out.strengths.push((es?"Se sintió ":"Felt ")+joinAnd(bright.map(function(x){ return L(es,FEEL[x.k])+" "+(es?"en ":"on ")+days(x.n,es); }),es)+"."+SRC);
      var hwE = E.filter(function(e){ return e.hw && e.hw!=="none"; }), hwDone = count(hwE,function(e){ return e.hw==="done"; }),
          hwSome = count(hwE,function(e){ return e.hw==="some"; });
      if(hwDone) out.strengths.push((es?"Terminó la tarea o la lectura en "+hwDone+" de "+days(hwE.length,true)+" con tarea."
                                        :"Finished homework or reading on "+hwDone+" of "+hwE.length+" homework "+(hwE.length===1?"day":"days")+".")+SRC);
      var easy = count(hwE,function(e){ return e.hwHow==="easy"; });
      if(easy) out.strengths.push((es?"La tarea se sintió fácil en "+days(easy,true)+"." : "Homework felt easy on "+days(easy,false)+".")+SRC);
      var proud = E.filter(function(e){ return e.proud && String(e.proud).trim(); });
      if(proud.length){ var lp = proud[proud.length-1];
        out.strengths.push((es?"Nombró algo de lo que está orgulloso en "+days(proud.length,true)+". Lo más reciente: “"
                              :"Named something they are proud of on "+days(proud.length,false)+". Most recent: “")+String(lp.proud).trim().slice(0,140)+"”"+SRC); }
      /* ── what is hard right now (plain counts) ── */
      if(low) out.hard.push((es?"Días más difíciles (cara 1 o 2): "+low+" de "+moodE.length+"."
                                :"Harder days (face 1 or 2): "+low+" of "+moodE.length+".")+SRC);
      var tough = ft.filter(function(x){ return BRIGHT.indexOf(x.k)<0 && FEEL[x.k]; }).slice(0,3);
      if(tough.length) out.hard.push((es?"También se sintió ":"Also felt ")+joinAnd(tough.map(function(x){ return L(es,FEEL[x.k])+" "+(es?"en ":"on ")+days(x.n,es); }),es)+"."+SRC);
      var hwHard = count(hwE,function(e){ return e.hwHow==="hard" || e.hwHow==="help"; }), hwNot = count(hwE,function(e){ return e.hw==="not"; });
      if(hwHard) out.hard.push((es?"La tarea necesitó ayuda o fue difícil en "+hwHard+" de "+days(hwE.length,true)+" con tarea."
                                  :"Homework needed help or felt hard on "+hwHard+" of "+hwE.length+" homework "+(hwE.length===1?"day":"days")+".")+SRC);
      if(hwNot) out.hard.push((es?"La tarea no se hizo en "+days(hwNot,true)+"." : "Homework did not happen on "+days(hwNot,false)+".")+SRC);
      if(hwSome) out.hard.push((es?"Hizo parte de la tarea en "+days(hwSome,true)+"." : "Did part of the homework on "+days(hwSome,false)+".")+SRC);
      var hn = E.filter(function(e){ return e.hard && String(e.hard).trim(); });
      if(hn.length) out.hard.push((es?"Anotamos algo difícil en "+days(hn.length,true)+". Lo más reciente: “"
                                      :"We wrote down something hard on "+days(hn.length,false)+". Most recent: “")+String(hn[hn.length-1].hard).trim().slice(0,140)+"”"+SRC);
      /* ── what helps ── */
      var ht = tally(E,"help");
      ht.slice(0,4).forEach(function(x){ if(HELP[x.k]) out.helps.push((es?"Ayudó ":"Helped: ")+L(es,HELP[x.k])+(es?" — "+days(x.n,true)+".":" — "+days(x.n,false)+".")+SRC); });
      var lowE = moodE.filter(function(e){ return e.mood<=2; }), lh = tally(lowE,"help");
      if(lh.length && HELP[lh[0].k]) out.helps.push((es?"En los días más difíciles, lo que más ayudó fue "+L(es,HELP[lh[0].k])+" ("+lh[0].n+" de "+lowE.length+")."
                                                         :"On harder days, what helped most was "+L(es,HELP[lh[0].k])+" ("+lh[0].n+" of "+lowE.length+").")+SRC);
      var hlp = E.filter(function(e){ return e.helpNote && String(e.helpNote).trim(); });
      if(hlp.length) out.helps.push((es?"En nuestras palabras: “":"In our words: “")+String(hlp[hlp.length-1].helpNote).trim().slice(0,140)+"”"+SRC);
      /* ── sleep and mood ── */
      var sE = E.filter(function(e){ return e.sleep>0; });
      out.sleep = sE.map(function(e){ return {d:e._d, v:+e.sleep}; });
      out.mood = moodE.map(function(e){ return {d:e._d, v:+e.mood}; });
      var sa = avg(sE.map(function(e){ return +e.sleep; })), ma = avg(moodE.map(function(e){ return +e.mood; }));
      if(sE.length){ var sv = sE.map(function(e){ return +e.sleep; });
        out.sleepmood.push((es?"Sueño: "+r1(sa)+" horas en promedio (de "+Math.min.apply(0,sv)+" a "+Math.max.apply(0,sv)+")."
                               :"Sleep: "+r1(sa)+" hours on average (from "+Math.min.apply(0,sv)+" to "+Math.max.apply(0,sv)+").")
          +src(es?"Registro en casa":"Home log", sE.length, sE[0]._d, sE[sE.length-1]._d, es)); }
      if(moodE.length) out.sleepmood.push((es?"Cómo fue el día: "+r1(ma)+" de 5 en promedio." : "How the day went: "+r1(ma)+" out of 5 on average.")
          +src(es?"Registro en casa":"Home log", moodE.length, moodE[0]._d, moodE[moodE.length-1]._d, es));
      var both = E.filter(function(e){ return e.sleep>0 && e.mood>=1; }),
          more = both.filter(function(e){ return e.sleep>=9; }), less = both.filter(function(e){ return e.sleep<9; });
      if(more.length>=3 && less.length>=3){
        var a1=r1(avg(more.map(function(e){ return +e.mood; }))), a2=r1(avg(less.map(function(e){ return +e.mood; })));
        out.sleepmood.push((es?"Después de 9 horas o más de sueño, el día fue "+a1+" de 5 en promedio; con menos, "+a2+"."
                               :"After 9 or more hours of sleep, the day averaged "+a1+" out of 5; after less, "+a2+".")
          +src(es?"Registro en casa":"Home log", both.length, both[0]._d, both[both.length-1]._d, es));
      }
      out.summary = Object.assign(out.summary, { days:E.length, goodDays:good, harderDays:low, avgMood:ma==null?"":r1(ma), avgSleep:sa==null?"":r1(sa),
                      homeworkDone:hwDone, homeworkDays:hwE.length, from:out.first, to:out.last });
    }
    /* ── routines at home (AOG-FAMILY-ROUTINES-V1): done on their own / with help / not today ── */
    var rsum = [];
    (routines||[]).forEach(function(r){
      var md = ds.filter(function(d){ var e=log[d]||{}; return e.rt && e.rt[r.id]; });
      var own = count(md,function(d){ return log[d].rt[r.id]==="done"; }), help = count(md,function(d){ return log[d].rt[r.id]==="help"; }), not = md.length-own-help;
      var R = { id:r.id, name:r.name, status:r.status||"active", own:own, help:help, not:not, n:md.length,
        series: md.map(function(d){ var m=log[d].rt[r.id]; return {d:d, v:m==="done"?2:m==="help"?1:0}; }), line:"", trend:"" };
      if(md.length){
        var S = src(es?"Rutinas en casa":"Home routines", md.length, md[0], md[md.length-1], es), nm = String(r.name||"").trim();
        var lead = own*2>md.length ? (es?"Lo hace solo la mayoría de los días":"Does it on their own most days")
                 : (own+help)*2>md.length ? (es?"Lo hace la mayoría de los días, a veces con ayuda":"Does it most days, sometimes with help")
                 : own+help ? (es?"Lo está practicando":"Is practicing this") : (es?"Aún no ha pasado en los días registrados":"Has not happened yet on the days logged");
        R.line = nm+": "+lead+" — "+(es?"solo "+own+", con ayuda "+help+", hoy no "+not+" de "+days(md.length,true)+"."
                                         :"on their own "+own+", with help "+help+", not today "+not+" of "+days(md.length,false)+".");
        if(md.length>=6){ var h=Math.floor(md.length/2), sc=function(a){ return avg(a.map(function(p){ return p.v; })); },
            a1=sc(R.series.slice(0,h)), a2=sc(R.series.slice(h));
          R.trend = a2-a1>=0.34 ? (es?" Va en aumento.":" Growing.") : a1-a2>=0.34 ? (es?" Menos en los últimos días.":" Less in recent days.") : (es?" Estable.":" Steady."); }
        R.line += R.trend+S;
        if(help) out.helps.push((es?"Hacerlo juntos ayudó con “"+nm+"” en "+days(help,true)+"." : "Doing it together helped with “"+nm+"” on "+days(help,false)+".")+S);
        if(own*2>md.length) out.strengths.unshift((es?nm+": lo hace solo la mayoría de los días — "+own+" de "+days(md.length,true)+"."
                                                       :nm+": does it on their own most days — "+own+" of "+days(md.length,false)+".")+S);
      } else R.line = (String(r.name||"").trim())+": "+(es?"Aún no hay datos para esta rutina.":"No data for this yet.");
      out.routines.push(R);
      rsum.push({routine:r.name, onTheirOwn:own, withHelp:help, notToday:not, days:md.length, homework:/homework|tarea|reading|lectura/i.test(String(r.name||""))});
    });
    out.summary.routines = rsum;
    /* ── goals ── */
    (goals||[]).forEach(function(g){
      var md = Object.keys(g.marks||{}).filter(function(d){ return /^\d{4}-\d\d-\d\d$/.test(d); }).sort();
      var yes = count(md,function(d){ return g.marks[d]===2; }), lit = count(md,function(d){ return g.marks[d]===1; }), no = md.length-yes-lit;
      var st = g.status==="done" ? (es?" Lo logramos.":" We reached it.") : g.status==="paused" ? (es?" En pausa por ahora.":" Paused for now.") : "";
      var line = md.length
        ? (es?"Sí en "+days(yes,true)+", un poco en "+days(lit,true)+", hoy no en "+days(no,true)+"."
             :"Yes on "+days(yes,false)+", a little on "+days(lit,false)+", not today on "+days(no,false)+".")+st
          +src(es?"Metas en casa":"Home goals", md.length, md[0], md[md.length-1], es)
        : (es?"Aún no hay datos para esta meta.":"No data for this yet.")+st;
      out.goals.push({ id:g.id, text:g.text, status:g.status||"active", line:line, yes:yes, little:lit, no:no,
        series: md.map(function(d){ return {d:d, v:g.marks[d]}; }) });
    });
    out.summary.goals = out.goals.map(function(g){ return {goal:g.text, yes:g.yes, little:g.little, notToday:g.no, status:g.status}; });
    return out;
  }
  var api = { build:build, FEEL:FEEL, HELP:HELP, BRIGHT:BRIGHT, fmtRange:fmtRange };
  if(typeof module!=="undefined" && module.exports) module.exports = api; else root.AOG_FAMILY_PLAN = api;
})(this);
