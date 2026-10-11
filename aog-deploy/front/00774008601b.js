
    (function(){
      /* Which tabs live under which mode. Every tab in the row appears exactly
         once; nothing is removed, only grouped. */
      var MODES = {
        /* §13's three questions, in the teacher's order. Overview holds one
           tab on purpose: it is the 30-second morning screen, and a second tab
           beside it is a second thing to decide between at 8:00 AM. */
        myclass: ['overview'],
        /* ONE DOOR PER STUDENT (2026-09-05, .30gt then .30gu, Jimmy's call —
           reversing his own 2026-08-27 split and 2026-08-28 voice-door
           ruling). IEP was pulled OUT of Students because a case manager
           could not find it there; the cure is the LABEL, not a seventh
           door: this door reads "Students & IEP", so it cannot be missed.
           .30gu folds the CHECK-INS door in too ('may the check-ins get a
           OVERHAUL and be embedded into the students page?') — the door now
           holds everything about a student. Tab order is the day's order:
           Student view (who), then the five voice instruments in the
           .29an moment order (today → end of day → over time), then the
           IEP pair (Goal Builder writes the goal, IEP Progress tracks it). */
        /* ⚠⚠ .30hk — THE DAILY LOG TAB IS RETIRED. Jimmy: "I don't need this
           daily log, because I would enter infor on a team check-in form."
           Verified before agreeing: the Adult team check-in writes into
           aog.daily.v1 in the DAILY LOG'S OWN SHAPE, and saveEntry's own
           comment says its panel, trend, history and CSV read link-submitted
           entries with no change — so nothing stops counting.
           ⚠⚠ THE TAB IS RETIRED, THE STORE IS NOT. aog.daily.v1 still backs
           the Team tab, Trends, One student over time and the CSV, and pulled
           adult rows still merge into it. Deleting the store would take the
           whole observation history with it.
           ⚠ 'daily' is dropped from this table rather than deleted from the
           markup: the panel stays in the DOM, addressable, and putting the
           name back here is the whole of the undo. */
        /* ⚠⚠ .30hl — INBOX LEADS THIS DOOR. Jimmy: "How about we move INBOX to
           the tab bar with everything elese". It is the aggregate of every
           instrument below it, so it reads first.
           ⚠ IT IS THE ONLY TAB IN THIS PRODUCT THAT LEAVES THE PAGE — an
           anchor to /turnins, not a panel. It has NO #panel-inbox, which is
           why it is injected AFTER the generic .tab click handler has bound:
           that handler does $("#panel-" + dataset.tab).classList.add(...)
           with NO NULL GUARD, and a missing panel would throw and kill the
           rest of its closure. Same fault c5 paid for in .30dm. Binding
           nothing and letting the browser follow the href is the whole
           mechanism. */
        /* ⚠ .30hm — ORDER IS JIMMY'S, and it is the day's order read as a
           question: WHO (Student view) → WHAT CAME BACK (Inbox) → WHAT THEY
           PRACTICED (Practice) → then the voice instruments → then the IEP
           pair. He flipped Student view ahead of Inbox himself: the student
           is the anchor, the inbox is what arrived about them. */
        student: ['home','inbox','practice','support','exitslip','reflect','homeci','iep','goals'],
        trends:  ['students','growth','trajectory'],
        /* My classes is the population layer's set-up bench. It sits
           beside Distribute because building a class and handing it a link
           are the same twenty minutes of a teacher's August. */
        /* 'crosswalk' stays OUT on purpose - #panel-crosswalk is the INTERNAL
           Crosswalk Viewer (its own heading says internal; 125 dark-theme
           contrast failures inside). Team-review item 11 read as a bug, but
           exposing an internal QA tool to every teacher is Jimmy's call, not
           an array entry. The public crosswalks live under Alignment. 2026-08-28 */
        setup:   ['distribute','classes','family','export','align'],
        /* The voice door (2026-08-28 'one door for student voice') folded
           into the student door in .30gu — its five tabs and their .29an
           moment order live in MODES.student above. */
      };
      /* Internal keys are UNCHANGED so a saved aog.dash.mode still resolves. */
      var ORDER = ['myclass','student','trends','setup'];
      var MODE_OF = {};
      ORDER.forEach(function(m){ MODES[m].forEach(function(t){ MODE_OF[t] = m; }); });

      /* Only these two roles have enough tabs for grouping to be a kindness. */
      var MODE_ROLES = { teacher:1, specialist:1 };
      /* Mirrors the role hide-list one layer down, so a mode never shows a tab
         the role is not allowed to see (Specialist has no Class trends). */
      var HIDE = { specialist:{students:1, distribute:1, align:1}, teacher:{} };

      var LAB = {
        myclass: { en:['Overview','What is happening with my group'],   es:['Panorama','Qué está pasando con mi grupo'] },
        student: { en:['Student Check-ins','Every student in one place — story, check-ins, goals'], es:['Registros del estudiante','Cada estudiante en un lugar — historia, registros, metas'] },
        trends:  { en:['Trends','What is changing over time'],           es:['Tendencias','Qué está cambiando con el tiempo'] },
        setup:   { en:['Set up','Hand it out, export, connect'],         es:['Configurar','Repartir, exportar y conectar'] }
      };

      var cur = 'myclass';
      try{ var saved = localStorage.getItem('aog.dash.mode'); if(saved === 'exit') saved = 'voice'; /* the exit door folded into Check-ins, 2026-08-28 */ if(saved === 'iep' || saved === 'voice') saved = 'student'; /* IEP (.30gt) and Check-ins (.30gu) both folded into Students & IEP, 2026-09-05 — the exit→voice line above chains through */ if(MODES[saved]) cur = saved; }catch(e){}

      var busy = false;      /* guards the observer while we are the ones moving tabs */
      var suppress = false;  /* guards the click listener while we activate a tab ourselves */

      function byId(id){ return document.getElementById(id); }
      function rowEl(){ return document.querySelector('#screen-admin .tabs'); }
      function currentRole(){
        var s = byId('screen-admin'); var r = s && s.getAttribute('data-role');
        if(r) return r;
        try{ r = localStorage.getItem('aog.dash.role'); }catch(e){}
        return r || 'teacher';
      }
      /* dashLang first — setDashLang never touches documentElement.lang
         (the .29l lesson), so door labels hung on the attribute stayed
         English on a Spanish dashboard. 2026-08-28. */
      function isEs(){ try{ if (typeof dashLang !== 'undefined') return dashLang === 'es'; }catch(e){} return (document.documentElement.getAttribute('lang')||'en').slice(0,2) === 'es'; }
      function tabMap(){
        var m = {};
        document.querySelectorAll('#screen-admin .tabs .tab[data-tab], #tabMoreMenu .tab[data-tab]').forEach(function(b){
          m[b.getAttribute('data-tab')] = b;
        });
        return m;
      }
      function visibleIn(mode, all, hide){
        return MODES[mode].filter(function(t){ return all[t] && !hide[t]; });
      }
      function paintLabels(){
        var es = isEs(), bar = byId('dashModes'); if(!bar) return;
        bar.querySelectorAll('.dmode').forEach(function(b){
          var l = LAB[b.getAttribute('data-mode')]; if(!l) return;
          var pair = es ? l.es : l.en;
          var t = b.querySelector('.dmode-t'), sub = b.querySelector('.dmode-s');
          if(t) t.textContent = pair[0];
          if(sub) sub.textContent = pair[1];
        });
        bar.setAttribute('aria-label', es ? 'Modo del panel' : 'Dashboard mode');
      }

      function apply(activate){
        var scr = byId('screen-admin'), bar = byId('dashModes'), row = rowEl();
        if(!scr || !bar || !row) return;
        var role = currentRole(), on = !!MODE_ROLES[role];
        var moreWrap = row.querySelector('.tab-more-wrap');
        scr.classList.toggle('has-modes', on);
        if(!on){ if(moreWrap) moreWrap.style.display = ''; return; }

        busy = true;
        try{
          if(moreWrap) moreWrap.style.display = 'none';
          var hide = HIDE[role] || {}, all = tabMap();

          /* If this role cannot see anything in the remembered mode, fall to the
             first mode that has something. */
          if(!MODES[cur] || !visibleIn(cur, all, hide).length){
            cur = ORDER.filter(function(m){ return visibleIn(m, all, hide).length; })[0] || 'myclass';
          }

          /* Every grouped tab comes back into the row in mode order; only the
             current mode's tabs are shown. The More menu is not needed here. */
          ORDER.forEach(function(m){
            MODES[m].forEach(function(name){
              var b = all[name]; if(!b) return;
              /* Family & adults and Export & data are authored inside
                 #tabMoreMenu with role="menuitem". Once they are moved into the
                 tab row there is no menu above them, and axe flags
                 aria-required-parent (critical). Drop the role on the way in. */
              if(b.getAttribute('role') === 'menuitem') b.removeAttribute('role');
              row.appendChild(b);
              b.style.display = (!hide[name] && m === cur) ? '' : 'none';
            });
          });
          if(moreWrap) row.appendChild(moreWrap);

          scr.classList.toggle('has-lone-tab', visibleIn(cur, all, hide).length <= 1);

          bar.querySelectorAll('.dmode').forEach(function(b){
            var m = b.getAttribute('data-mode');
            var any = MODES[m] && visibleIn(m, all, hide).length;
            b.style.display = any ? '' : 'none';
            b.classList.toggle('active', m === cur);
            b.setAttribute('aria-selected', m === cur ? 'true' : 'false');
          });

          if(activate){
            var act = document.querySelector('#screen-admin .tabs .tab.active, #tabMoreMenu .tab.active');
            var name = act ? act.getAttribute('data-tab') : '';
            if(!name || MODE_OF[name] !== cur || hide[name]){
              var first = visibleIn(cur, all, hide)[0];
              if(first && all[first]){ suppress = true; try{ all[first].click(); }finally{ suppress = false; } }
            }
          }
          paintLabels();
        } finally {
          /* setTimeout(0), NOT requestAnimationFrame (2026-08-30): rAF never
             fires while the tab is hidden, so `busy` stuck true and the
             watchdog observer slept for good. Our own writes' observer
             microtasks deliver before any 0ms timer, so this releases no
             earlier than the frame release did - just also in a hidden tab. */
          setTimeout(function(){ busy = false; }, 0);
        }
      }

      window.aogSetDashMode = function(mode){
        if(!MODES[mode]) return;
        cur = mode;
        try{ localStorage.setItem('aog.dash.mode', mode); }catch(e){}
        apply(true);
        /* Mode changes were silent to a screen reader — team-review item 12. */
        try{ var lr = document.getElementById('dashModeLive'), l = LAB[mode];
             if(lr && l){ var pair = isEs() ? l.es : l.en; lr.textContent = pair[0] + ' — ' + pair[1]; } }catch(_lr){}
        try{ window.scrollTo({top:0, behavior:'instant'}); }catch(e){ try{ window.scrollTo(0,0); }catch(_e){} }
      };

      /* A jump from somewhere else - the Quick Start card's "Go to Distribute",
         a #alignment link - clicks a real tab. Follow it into its mode instead
         of leaving the row showing a different group. */
      document.addEventListener('click', function(e){
        if(suppress) return;
        /* Only a REAL click follows a tab into its mode. openAdmin() ends by
           synthesizing a click on the Distribute tab, and this listener was
           following it — so every first visit opened on Set up and then
           remembered Set up as the saved mode forever. A person clicking a
           tab is isTrusted; a script calling .click() is not. 2026-08-27 */
        if(e.isTrusted === false) return;
        var t = e.target.closest && e.target.closest('.tab[data-tab]');
        if(!t) return;
        var m = MODE_OF[t.getAttribute('data-tab')];
        if(m && m !== cur){
          cur = m;
          try{ localStorage.setItem('aog.dash.mode', m); }catch(_e){}
        }
        setTimeout(function(){ apply(false); }, 60);
      });

      /* The declutter layer re-lays the row on role change, language change and
         tab clicks, and we cannot see its internal calls - so watch the row and
         re-assert afterwards. Guarded by `busy`, and layoutTabs never runs off a
         mutation, so the two cannot ping-pong.
         subtree:true is the whole defense (2026-08-30): layoutTabs hides and
         shows tabs by setting style on the CHILD buttons, and once the row's
         order is final its insertBefore calls make no childList record either -
         so with subtree:false this observer slept through every leak. The
         repro was apply(true)'s own synthetic first-tab click: declutter's
         document click listener has no isTrusted guard (ours does, 2026-08-27)
         and re-showed every role CORE tab 40ms later, accumulating up to ten
         tabs across mode switches. The guard is NOT added over there because
         its post-click relayout also serves the mode-less roles - it is what
         keeps the More button's hasactive honest after aogQsTab()'s synthetic
         clicks - so the fix is to see the damage and re-assert, as designed.
         apply()'s own child writes cannot loop us: the observer delivers as a
         microtask, before the 0ms timer that clears `busy`. */
      function watch(){
        var row = rowEl(); if(!row || !window.MutationObserver) return;
        try{
          new MutationObserver(function(){
            if(busy) return;
            apply(false);
          }).observe(row, { childList:true, subtree:true, attributes:true, attributeFilter:['style'] });
        }catch(e){}
      }

      function wrapRole(){
        if(!window.aogSetDashRole || window.aogSetDashRole.__modes) return;
        var orig = window.aogSetDashRole;
        window.aogSetDashRole = function(role){
          var r = orig.apply(this, arguments);
          try{ requestAnimationFrame(function(){ apply(true); }); }catch(e){ apply(true); }
          return r;
        };
        window.aogSetDashRole.__modes = true;
      }

      function init(){
        wrapRole();
        apply(true);
        watch();
        /* A hidden tab throttles the 0ms busy-release toward a full second, and
           damage the watchdog skips during that stretch is skipped for good -
           so re-assert once on the way back to visible. 2026-08-30 */
        document.addEventListener('visibilitychange', function(){ if(!document.hidden) apply(false); });
        try{
          new MutationObserver(function(){ paintLabels(); })
            .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
        }catch(e){}
      }
      /* 160ms: the declutter layer initializes at 80ms and we re-assert on top. */
      if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 160); });
      else setTimeout(init, 160);

      window.__aogDashModes = { apply:apply, modes:MODES, get:function(){ return cur; }, paint:paintLabels };
    })();
    