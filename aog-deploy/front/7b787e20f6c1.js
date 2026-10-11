
    (function(){
      "use strict";
      /* ⚠⚠ .30i3 — THE OPEN CARDS ARE REMEMBERED NOW. Jimmy: "Could those
         things be remembered?" `state` was in memory only, so every reload
         shut every card a teacher had opened — and because the Practice tab
         was one folded lump, coming back looked like the rows had gone.
         One localStorage key, this browser only, nothing sent anywhere.
         ⚠ SAVED FROM scan(), NOT FROM THE FOUR TOGGLE SITES. Cards, section
         heads, the keyboard path and the Close button all end in scan(); a
         save() bolted onto each of them is four chances to miss one. It
         writes only when the serialized state actually changed, so the
         MutationObserver's constant re-scans cost nothing. */
      var FOLD_KEY = "aog.dash.fold.v1";
      var state = (function () {
        try {
          var o = JSON.parse(localStorage.getItem(FOLD_KEY) || "{}");
          return (o && typeof o === "object" && !(o instanceof Array)) ? o : {};
        } catch (e) { return {}; }
      })();                        /* key -> true(open)/false(closed); absent = the default */
      var savedAs = "";
      function saveFold(){
        try {
          var j = JSON.stringify(state);
          if (j === savedAs) return;
          savedAs = j;
          localStorage.setItem(FOLD_KEY, j);
        } catch (e) {}
      }
      var t = 0;

      /* ⚠⚠ .30i2 — CLOSED IS THE DEFAULT EVERYWHERE EXCEPT THE ONE TAB WHOSE
         ENTIRE CONTENT IS CARDS. The Practice tab has nothing on it but these
         three, so folding them shut makes the tab arrive empty — the
         invisible-by-construction fault .30hi was built to end. They open on
         arrival and each one closes on its own from there.
         ⚠ `state` IS IN MEMORY, NOT localStorage — every reload returns to
         these defaults. That is the existing design, not an oversight here. */
      var OPEN_BY_DEFAULT = {
        "panel-practice|#aogPracticePrintBar": 1,
        "panel-practice|#aogPracticeChart": 1,
        "panel-practice|#aogPracticeCard": 1
      };
      /* ⚠ `key in state` IS THE TEST, NOT truthiness — a card the teacher
         closed by hand stores false, and false must beat the default. That is
         why the Close handler below writes false instead of deleting. */
      function openFor(key){ return (key in state) ? !!state[key] : !!OPEN_BY_DEFAULT[key]; }

      /* Blocks that must never fold: empty/onboarding states a first-run
         teacher needs face-up, sticky bars, filter rows, small chip strips.
         ⚠ aogDistPanes (.30ez): the Distribute pane host LOOKED like a
         self-headed card (headOf found the active pane's h2, nested two
         levels down) but its first 54px is a cropped heading with no
         legible strip — Jimmy read it as "the screen won't scroll on any
         of the tabs." Its pill strip (aogDistStrip, above) is already the
         set of doors; picking an instrument IS the open gesture. */
      /* ⚠⚠ .30i2 — aogSheetCards IS THE PRACTICE TAB, NOT A CARD ON IT.
         It is the WRAPPER around all three From-the-Sheet cards (print,
         Growth over time, the rows table), and this layer folds a panel's
         CHILDREN — so it folded the wrapper as one card, cropped the lot to
         84px, and took the strip's title from the FIRST heading inside it.
         The result on screen: a single closed card saying "Print a practice
         record", with Growth over time and the rows table nowhere at all.
         Jimmy sent a screenshot of exactly that and it reads as data loss.
         ⚠ THIS IS THE SKIP LIST'S OWN EXISTING REASON, applied again:
         "picking an instrument IS the open gesture." Choosing the Practice
         tab is the open gesture for the three cards that ARE the Practice
         tab — one tab, one job [[aog-inbox]] — so folding them shut makes
         the tab arrive empty, which is the invisible-by-construction fault
         .30hi was built to end.
         ⚠ THE ALTERNATIVE WAS FOLDING THE THREE INDIVIDUALLY, and it is not
         available from here: scan() reads panel.children only, so the inner
         cards are never candidates. Un-wrapping them would break
         aogSheetHost(), which is the documented address every one of the
         three calls to find its home. */
      var SKIP = { ovEmpty:1, ovOnboard:1, staffReset:1, dashRoleExtra:1,
                   aogCurriculumStrip:1, aogIepStickyBar:1, aogDistStrip:1,
                   aogDistPanes:1, aogSheetCards:1,
                   /* AOG-STANDARDS-V1 — the academic standards cards + their unit table;
                      a section, not a card, and the table opens with a heading inside it */
                   xaAcademic:1 };
      function skipped(el){
        if (el.id && SKIP[el.id]) return true;
        var c = " " + (typeof el.className === "string" ? el.className : "") + " ";
        return /( filter-bar | staff-reset | iep-stickybar | ov-empty | ov-onboard )/.test(c);
      }
      function headOf(el){
        return el.querySelector(
          "h2,h3,h4,.pb-ey,.pc-ey,.gc-ey,.dl-h,[class$='-ey'],[class*='kicker']");
      }
      /* .30fh — eyebrow-headed cards (a pb-ey "FROM THE SHEET" bar with the
         real h3 under it) put the title below the fixed 54px crop, so the
         closed strip cut mid-letter through the name — and even a plain
         title lost its descenders under the fade. The crop now extends to
         the bottom of the card's own title line: rects still resolve under
         a max-height clip, so a closed card measures fine. A hidden panel
         measures 0 — fall back to 84px when the eyebrow+heading pattern is
         certain, else keep the 54px floor; the next scan in a visible panel
         corrects it (scan already reruns on every observed mutation). */
      function cropFor(el){
        var hd = headOf(el); if (!hd) return 0;
        var edge = hd;
        if (!/^H[2-4]$/.test(hd.tagName)){
          var nx = hd.nextElementSibling;
          if (nx && /^H[2-4]$/.test(nx.tagName)) edge = nx;
        }
        try{
          var er = el.getBoundingClientRect(), hr = edge.getBoundingClientRect();
          if (!er.height || !hr.height) return (edge === hd) ? 0 : 84;
          var b = Math.ceil(hr.bottom - er.top) + 18;
          return (b > 54) ? Math.min(b, 140) : 0;
        }catch(e){ return 0; }
      }
      function isSectionHead(el){
        var c = " " + (typeof el.className === "string" ? el.className : "") + " ";
        return c.indexOf(" section-head ") > -1 || c.indexOf(" xv-head ") > -1;
      }
      function keyFor(panel, el, ord){
        if (el.id) return panel.id + "|#" + el.id;
        var h = headOf(el);
        return panel.id + "|" + (h ? h.textContent.trim().slice(0, 40) : "") + "|" + ord;
      }

      /* AOG-FOLD-QUIET-V1 (2026-10-10) — Jimmy: "I want the whole website not to lag". Every pass used to write every
         class, attribute and label again, even when nothing had changed. Each write counted as a change to the page,
         which asked for another pass 90ms later (and woke aog-dash-grace.js too): the front page never rested and kept
         a phone fully busy. Now a pass writes only what is different, so once the cards are folded the page is still. */
      function cls(el, c, on){ if (el.classList.contains(c) !== !!on) el.classList.toggle(c, !!on); }
      function att(el, k, v){
        if (v === null){ if (el.hasAttribute(k)) el.removeAttribute(k); }
        else if (el.getAttribute(k) !== v) el.setAttribute(k, v);
      }
      function txt(el, v){ if (el.textContent !== v) el.textContent = v; }
      /* the words of a heading, with an emoji already drawn in pencil (aog-sketch.js) read as the emoji it stands for */
      function words(el){
        var s = "", w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null), n;
        while ((n = w.nextNode())){
          if (n.nodeType === 3) s += n.nodeValue;
          else if (n.tagName === "IMG" && n.classList.contains("aog-sk")) s += n.alt || "";
        }
        return s;
      }

      function ensureCard(panel, el, ord){
        var key = keyFor(panel, el, ord);
        att(el, "data-aogfold", key);
        cls(el, "aogfold-host", true);
        var open = openFor(key);
        cls(el, "aogfold-closed", !open);
        var cr = open ? 0 : cropFor(el);
        if (cr){ if (el.style.getPropertyValue("--aogfold-h") !== cr + "px") el.style.setProperty("--aogfold-h", cr + "px"); }
        else if (el.style.getPropertyValue("--aogfold-h")) el.style.removeProperty("--aogfold-h");
        if (open && !el.querySelector(":scope > .aogfold-x")){
          var b = document.createElement("button");
          b.type = "button"; b.className = "aogfold-x";
          b.setAttribute("aria-expanded", "true");
          var es = false;
          try { es = (typeof dashLang !== "undefined" && dashLang === "es"); } catch(e){}
          b.textContent = es ? "Cerrar" : "Close";
          el.insertBefore(b, el.firstChild);
        }
        /* .30fg — a closed card used to be role=button with live controls inside it (axe
           nested-interactive) and clipped controls stayed in the tab order. Now the host
           carries no role; an overlay button named after the heading is the one control,
           and every other child is inert until the card opens. */
        if (!open){
          var oldX = el.querySelector(":scope > .aogfold-x");
          if (oldX) oldX.parentNode.removeChild(oldX);
          att(el, "role", null); att(el, "tabindex", null); att(el, "aria-expanded", null);
          var ob = el.querySelector(":scope > .aogfold-o");
          if (!ob){
            ob = document.createElement("button"); ob.type = "button"; ob.className = "aogfold-o";
            el.insertBefore(ob, el.firstChild);
          }
          var hd = headOf(el); var es2 = false;
          try { es2 = (typeof dashLang !== "undefined" && dashLang === "es"); } catch(e){}
          var name = hd ? words(hd).trim().slice(0, 80) : "";
          if (words(ob) !== name) ob.textContent = name;
          att(ob, "aria-label", name + (es2 ? " — abrir" : " — open")); /* AOG-DASH-FACELIFT-V1: the arrow says open; the words don't need to */
          att(ob, "aria-expanded", "false");
          for (var ci = 0; ci < el.children.length; ci++){ var ch = el.children[ci]; if (ch !== ob && ch.tagName !== "STYLE" && ch.tagName !== "SCRIPT") att(ch, "inert", ""); }
        } else {
          var ob2 = el.querySelector(":scope > .aogfold-o"); if (ob2) ob2.parentNode.removeChild(ob2);
          att(el, "role", null); att(el, "tabindex", null); att(el, "aria-expanded", null);
          for (var ci2 = 0; ci2 < el.children.length; ci2++) att(el.children[ci2], "inert", null);
        }
      }

      function ensureSection(panel, sh, members, ord){
        var key = keyFor(panel, sh, ord);
        att(sh, "data-aogfold-sh", key);
        cls(sh, "aogfold-sh", true);
        var open = !!state[key];
        att(sh, "data-aogfold-closed", open ? null : "1");
        att(sh, "aria-expanded", open ? "true" : "false");
        att(sh, "role", "button"); att(sh, "tabindex", "0");
        members.forEach(function(m){ cls(m, "aogfold-hidden", !open); });
      }

      /* ⚠ RECONCILE, EVERY PASS. A block can change kind between scans —
         aogDailyBody had no heading until its module rendered one, so an
         early pass filed it as a section member (display:none) and a later
         pass as a card (max-height) and it wore BOTH. Classes this pass does
         not assert are removed before the pass asserts anything. */
      function unCard(el, keepRole){   /* keepRole: a section head, whose role it sets again at once */
        cls(el, "aogfold-closed", false); cls(el, "aogfold-host", false);
        if (el.style.getPropertyValue("--aogfold-h")) el.style.removeProperty("--aogfold-h");
        att(el, "data-aogfold", null);
        if (!keepRole){ att(el, "role", null); att(el, "tabindex", null); att(el, "aria-expanded", null); }
        var x = el.querySelector(":scope > .aogfold-x");
        if (x) x.parentNode.removeChild(x);
        var o = el.querySelector(":scope > .aogfold-o");
        if (o) o.parentNode.removeChild(o);
        for (var ci = 0; ci < el.children.length; ci++) att(el.children[ci], "inert", null);
      }
      function unSection(el){
        cls(el, "aogfold-sh", false);
        att(el, "data-aogfold-sh", null);
        att(el, "data-aogfold-closed", null);
        att(el, "role", null); att(el, "tabindex", null); att(el, "aria-expanded", null);
      }
      function scan(){
        document.querySelectorAll("#screen-admin .tab-panel").forEach(function(panel){
          var kids = [].slice.call(panel.children).filter(function(c){
            return c.tagName !== "STYLE" && c.tagName !== "SCRIPT";
          });
          var plan = [];                 /* {el, kind, ord} in DOM order */
          var ord = 0;
          kids.forEach(function(el){
            ord++;
            var kind = "plain";
            if (skipped(el)) kind = "skip";
            else if (isSectionHead(el)) kind = "sh";
            else if (el.tagName === "DIV" && headOf(el)) kind = "card";
            plan.push({ el: el, kind: kind, ord: ord });
          });
          /* attach members to the nearest open sh; a card or sh ends the run */
          var cur = null;
          plan.forEach(function(p){
            if (p.kind === "sh"){ cur = p; p.members = []; return; }
            if (p.kind === "card" || p.kind === "skip"){ if (p.kind === "card") cur = null; return; }
            if (cur){ p.kind = "member"; cur.members.push(p.el); }
          });
          /* a heading with nothing under it is a heading, not a toggle */
          plan.forEach(function(p){ if (p.kind === "sh" && !p.members.length) p.kind = "plain"; });
          /* reconcile: strip everything this pass does not assert */
          plan.forEach(function(p){
            if (p.kind !== "card") unCard(p.el, p.kind === "sh");
            if (p.kind !== "sh") unSection(p.el);
            if (p.kind !== "member") cls(p.el, "aogfold-hidden", false);
          });
          /* assert */
          plan.forEach(function(p){
            if (p.kind === "card") ensureCard(panel, p.el, p.ord);
            else if (p.kind === "sh") ensureSection(panel, p.el, p.members, p.ord);
          });
        });
        saveFold();
      }
      function ask(){ if (t) clearTimeout(t); t = setTimeout(function(){ t = 0; try{ scan(); }catch(e){} }, 90); }
      /* keys hold heading text (quotes, pipes) — match by attribute value, never by selector */
      function byKey(attr, k){ var all = document.querySelectorAll("[" + attr + "]"); for (var i = 0; i < all.length; i++) if (all[i].getAttribute(attr) === k) return all[i]; return null; }

      document.addEventListener("click", function(e){
        var tgt = e.target;
        if (!tgt || !tgt.closest) return;
        var x = tgt.closest(".aogfold-x");
        if (x){
          var host = x.closest("[data-aogfold]");
          /* ⚠ FALSE, NOT delete — deleting falls back to OPEN_BY_DEFAULT and the
             Close button on a practice card would do nothing at all. */
          if (host){ var hk = host.getAttribute("data-aogfold"); state[hk] = false;
            e.preventDefault(); e.stopPropagation(); scan();
            try { var ho = byKey("data-aogfold", hk); ho = ho && ho.querySelector(":scope > .aogfold-o"); if (ho) ho.focus(); } catch (fe) {} }
          return;
        }
        var card = tgt.closest(".aogfold-closed[data-aogfold]");
        if (card){
          var ck = card.getAttribute("data-aogfold");
          state[ck] = true;
          e.preventDefault(); scan();
          try { var cx = byKey("data-aogfold", ck); cx = cx && cx.querySelector(":scope > .aogfold-x"); if (cx) cx.focus(); } catch (fe2) {}
          return;
        }
        var sh = tgt.closest(".aogfold-sh[data-aogfold-sh]");
        if (sh){
          /* the head can carry real controls (chart-view buttons, selects) —
             a tap on one of those is never a fold gesture */
          if (tgt.closest("button,select,a,input,label") &&
              !tgt.closest(".aogfold-sh > h2, .aogfold-sh > h3")) return;
          var k = sh.getAttribute("data-aogfold-sh");
          if (state[k]) delete state[k]; else state[k] = true;
          scan();
        }
      }, true);
      document.addEventListener("keydown", function(e){
        if (e.key !== "Enter" && e.key !== " ") return;
        var t = e.target;
        if (!t || !t.closest) return;
        if (t.classList && t.classList.contains("aogfold-o")) return;   /* a real button: click handles it */
        var sh = t.closest(".aogfold-sh[data-aogfold-sh]");
        if (sh && t === sh){
          var k = sh.getAttribute("data-aogfold-sh");
          if (state[k]) delete state[k]; else state[k] = true;
          e.preventDefault(); scan();
          try { var shn = byKey("data-aogfold-sh", k); if (shn) shn.focus(); } catch (fe) {}
        }
      });

      function boot(){
        scan();
        try{
          new MutationObserver(ask).observe(
            document.getElementById("screen-admin") || document.body,
            { childList: true, subtree: true });
        }catch(e){}
      }
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ setTimeout(boot, 140); });
      else setTimeout(boot, 140);
      window.__aogCardFoldScan = scan;
    })();
    