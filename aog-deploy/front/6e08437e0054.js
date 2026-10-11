
            /* AOG-ORBIT-REAL-V1 (2026-09-25) — Jimmy: "Make this look real — the realism
               is key." Each roundel becomes a leaded rondel: mottled glass (noise
               multiplied into the colour), light coming through from behind, and lead
               cames dividing it into eight segments around a small centre ring. */
            (function(){
              var svg = document.querySelector('#fw-orbit-home .aog-of-fig svg'); if (!svg || svg.__real) return; svg.__real = 1;
              var NS = 'http://www.w3.org/2000/svg';
              function el(t, a){ var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
              var defs = svg.querySelector('defs');
              defs.insertAdjacentHTML('beforeend',
                '<filter id="ofGlassF" x="-5%" y="-5%" width="110%" height="110%">'
               +'<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="11" result="n"/>'
               +'<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.33 0.33 0.33 0 -0.35" result="shade"/>'
               +'<feComposite in="shade" in2="SourceAlpha" operator="in" result="sh"/>'
               +'<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/></feMerge></filter>'
               +'<filter id="ofGlassC" x="0" y="0" width="100%" height="100%">'
               +'<feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="4" result="n"/>'
               +'<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.33 0.33 0.33 0 -0.42" result="shade"/>'
               +'<feComposite in="shade" in2="SourceAlpha" operator="in" result="sh"/>'
               +'<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/></feMerge></filter>'
               +'<radialGradient id="ofLight" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>');
              /* AOG-ORBIT-FLOWER-V1 — Jimmy: "I was thinking the stem was like a flower
                 stem." The bottom point stays open and a leaded-glass stem grows down
                 from Grace with two leaves, so the window reads as one flower. Drawn
                 behind the doorways, over the star's lines. */
              var firstDoor = svg.querySelector('a.orbit-door');
              var fl = el('g', {'class':'of-flower', 'pointer-events':'none'});
              var stemD = 'M310 400 C 302 450, 320 500, 308 552 S 300 596, 310 618';
              fl.appendChild(el('path', {d:stemD, fill:'none', stroke:'#1B1C1F', 'stroke-width':15, 'stroke-linecap':'round'}));
              fl.appendChild(el('path', {d:stemD, fill:'none', stroke:'#2E7D46', 'stroke-width':9, 'stroke-linecap':'round', filter:'url(#ofGlassF)'}));
              fl.appendChild(el('path', {d:stemD, fill:'none', stroke:'rgba(255,255,255,.28)', 'stroke-width':2.5, 'stroke-linecap':'round', transform:'translate(-2 0)'}));
              function leaf(d, vein){
                fl.appendChild(el('path', {d:d, fill:'#3E9A5A', stroke:'#1B1C1F', 'stroke-width':3, 'stroke-linejoin':'round', filter:'url(#ofGlassF)'}));
                fl.appendChild(el('path', {d:d, fill:'url(#ofLight)', style:'mix-blend-mode:soft-light'}));
                fl.appendChild(el('path', {d:vein, fill:'none', stroke:'#1B1C1F', 'stroke-width':2.2, 'stroke-linecap':'round'}));
              }
              leaf('M309 468 C 290 440, 250 432, 222 446 C 246 470, 284 478, 309 468 Z', 'M307 467 C 280 455, 250 448, 226 447');
              leaf('M311 528 C 330 500, 370 492, 398 506 C 374 530, 336 538, 311 528 Z', 'M313 527 C 340 515, 370 508, 394 507');
              svg.insertBefore(fl, firstDoor);
              /* the bottom motto moves below the stem, and the picture grows to hold it */
              ['arcBotEn','arcBotEs'].forEach(function(id){ var t = document.getElementById(id); if (t) t.setAttribute('transform','translate(0 58)'); });
              var vb = svg.viewBox.baseVal; if (vb && vb.y + vb.height < 684) svg.setAttribute('viewBox', vb.x + ' ' + vb.y + ' ' + vb.width + ' ' + (684 - vb.y));
              var doors = svg.querySelectorAll('a.orbit-door');
              for (var i = 0; i < doors.length; i++){
                var d = doors[i], disc = d.querySelector('circle:not(.halo)'); if (!disc) continue;
                var cx = +disc.getAttribute('cx'), cy = +disc.getAttribute('cy'), r = +disc.getAttribute('r'), center = (i === 0);
                var firstText = d.querySelector('text');
                var g = el('g', {'pointer-events':'none', 'class':'of-lead'});
                g.appendChild(el('circle', {cx:cx, cy:cy, r:r-1, fill:'url(#ofLight)', style:'mix-blend-mode:soft-light'}));
                var inner = center ? r*0.93 : r*0.36, n = center ? 24 : 8;
                for (var k = 0; k < n; k++){
                  var t = k * 2 * Math.PI / n + Math.PI/n;
                  g.appendChild(el('line', {x1:cx+inner*Math.cos(t), y1:cy+inner*Math.sin(t), x2:cx+(r-1)*Math.cos(t), y2:cy+(r-1)*Math.sin(t), stroke:'#1B1C1F', 'stroke-width': center?2.2:2.4, 'stroke-linecap':'round', 'stroke-opacity':'.9'}));
                }
                g.appendChild(el('circle', {cx:cx, cy:cy, r:inner, fill:'none', stroke:'#1B1C1F', 'stroke-width': center?2.4:2.2, 'stroke-opacity':'.9'}));
                d.insertBefore(g, firstText);
                disc.setAttribute('filter', center ? 'url(#ofGlassC)' : 'url(#ofGlassF)');
              }
            })();
            window.aogDoorSchool = function(){
              try { if (typeof openAdmin === 'function') { openAdmin(); } } catch (e) {}
            };
            window.aogDoorDifference = function(){
              try {
                if (typeof openFramework === 'function') { openFramework(); }
                requestAnimationFrame(function(){
                  var b = document.querySelector('.fw-tab[aria-controls="fw-panel-difference"]');
                  if (b && typeof aogFwPanel === 'function') { aogFwPanel(b, 'difference'); }
                });
              } catch (e) {}
            };
          