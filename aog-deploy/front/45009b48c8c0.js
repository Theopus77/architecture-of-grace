
    (function () {
      function byId(id){ return document.getElementById(id); }
      function build(){
        var hero = byId('dashHero'); if(!hero) return;
        if(byId('dashUtil')) return;                       /* idempotent */
        var actions = hero.querySelector('.admin-actions'); if(!actions) return;

        var util = document.createElement('div');
        util.id = 'dashUtil';
        hero.insertBefore(util, actions);

        /* Row 1 is who and where: identity on the left, the utilities that
           belong to the whole dashboard on the right. Row 2 is what a teacher
           can pick up right now. */
        var r1 = document.createElement('div'); r1.className = 'du-row';
        var r2 = document.createElement('div'); r2.className = 'du-row';
        util.appendChild(r1); util.appendChild(r2);

        var eyebrow = document.querySelector('#screen-admin .admin-header .eyebrow');
        if(eyebrow){ eyebrow.classList.add('du-eyebrow'); r1.appendChild(eyebrow); }

        var roles = byId('dashRoles');   if(roles) r2.appendChild(roles);
        var ry    = byId('aogRhythmsDash'); if(ry && !ry.hasAttribute('hidden')) r2.appendChild(ry);

        var talk = byId('dashTalk');
        if(talk){
          /* The strip's note explained the difference between the two
             buttons. It is worth keeping, so it moves onto the buttons
             themselves rather than being deleted. */
          var note = talk.querySelector('.dt-note');
          var txt  = note ? (note.textContent || '').trim() : '';
          var btns = talk.querySelectorAll('.dt-btn');
          if(txt && btns.length){
            var half = txt.split('.');
            /* title tooltips are neither announced nor localized — team-review
               item 14. A visually-hidden note carries the same words instead,
               and rebuilds with this row, so it follows the language. */
            var describe = function(btn, text, i){
              if(!btn || !text) return;
              var id = 'dashTalkDesc' + i;
              var sp = document.getElementById(id);
              if(!sp){ sp = document.createElement('span'); sp.id = id;
                       sp.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;';
                       btn.parentNode.appendChild(sp); }
              sp.textContent = text.trim() + '.';
              btn.setAttribute('aria-describedby', id);
              btn.removeAttribute('title');
            };
            if(btns[0] && half[0]) describe(btns[0], half[0], 0);
            if(btns[1] && half[1]) describe(btns[1], half[1], 1);
          }
          r2.appendChild(talk);
        }

        var sp = document.createElement('span');
        sp.className = 'du-spacer'; sp.setAttribute('aria-hidden','true');
        r1.appendChild(sp);
        r1.appendChild(actions);
        if(!r2.children.length) r2.style.display = 'none';
      }
      function go(){ try{ build(); }catch(e){} }
      if(document.readyState !== 'loading') go();
      else document.addEventListener('DOMContentLoaded', go);
      /* The rhythms card and the role controls are mounted by other blocks;
         one late pass covers any order they finish in. */
      setTimeout(go, 400);
      setTimeout(go, 1500);
    })();
    