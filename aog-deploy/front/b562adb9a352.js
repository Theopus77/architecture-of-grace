
(function(){
"use strict";
function $1(s,r){return (r||document).querySelector(s)}
function all(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function txtOf(el){return String(el.textContent||'').replace(/\s+/g,' ').trim()}
function key(v){try{return normTxt(v)}catch(e){return String(v||'').toLowerCase().trim()}}

/* ── which blanks belong to a bank: every text field in the same question box ── */
function fieldsIn(box){return all('input.fld',box).filter(function(i){
  return i.getAttribute('inputmode')==='text'})}
function bankOf(box){return $1('.wbank',box)}
function chipsIn(box){var b=bankOf(box); if(!b)return [];
  return [].filter.call(b.children,function(c){return c.tagName==='SPAN'&&!c.classList.contains('bkhow')})}

/* AOG-TAP-MATCH-V1 (2026-09-30) — Jimmy: where a word can be TAPPED from the bank, the question must not
   say "Write". It says Match (or Choose) instead; the child can still type. */
function tapWord(t){var o=t;
  t=t.replace(/^(\s*)Write the word that matches each meaning/,'$1Match a word from the bank to each meaning')
     .replace(/^(\s*)Write the words? that match(es)?/,'$1Match the word that matches')
     .replace(/^(\s*)Write (the|a|each|one)\b/,'$1Choose $2')
     .replace(/^(\s*)Escribe la palabra que corresponde a cada significado/,'$1Une una palabra del banco con cada significado')
     .replace(/^(\s*)Escribe (la|el|una|un|cada)\b/,'$1Elige $2');
  return t===o?null:t}
function reword(box,bank){
  all('[data-en]',box).forEach(function(el){if(bank.contains(el))return;
    var e=tapWord(el.getAttribute('data-en')||''); if(e){el.setAttribute('data-en',e);if(!el.children.length&&/^\s*Write/.test(el.textContent))el.textContent=e;}
    var s2=el.getAttribute('data-es'); if(s2){var z=tapWord(s2); if(z)el.setAttribute('data-es',z);}});
  var w=document.createTreeWalker(box,NodeFilter.SHOW_TEXT,null),n,hit=[];
  while((n=w.nextNode())){if(bank.contains(n))continue; if(tapWord(n.nodeValue))hit.push(n);}
  hit.forEach(function(n){n.nodeValue=tapWord(n.nodeValue);});}
/* ── dress a freshly rendered sheet: only banks that have blanks to fill ── */
function dress(){
  all('#sheet .box').forEach(function(box){
    var b=bankOf(box); if(!b||b.__aogTap)return;
    if(!fieldsIn(box).length)return;          /* a bank with nothing to fill is a hint, leave it */
    var chips=[].filter.call(b.children,function(c){return c.tagName==='SPAN'});
    if(!chips.length)return;
    b.__aogTap=1; b.classList.add('tapbank'); reword(box,b);
    chips.forEach(function(c){
      c.setAttribute('role','button'); c.setAttribute('tabindex','0');
      c.setAttribute('draggable','true'); c.setAttribute('aria-pressed','false')});
    var EN='Tap a word to put it in the next blank. Tap it again to take it back. You can still type instead.',
        ES='Toca una palabra para ponerla en el siguiente espacio. T\u00f3cala otra vez para quitarla. Tambi\u00e9n puedes escribir.';
    var how=document.createElement('p'); how.className='bkhow no-print';
    /* ⚠ data-en/data-es so a language flip that repaints without re-rendering
       still turns this line over with everything else. */
    how.setAttribute('data-en',EN); how.setAttribute('data-es',ES);
    how.textContent=(typeof t==='function')?t(EN,ES):EN;
    b.appendChild(how);
    sync(box)});
}

/* ── the bank always shows what is in the blanks, typed or tapped ── */
function sync(box){
  var used={}; fieldsIn(box).forEach(function(f){var k=key(f.value); if(k)used[k]=(used[k]||0)+1});
  chipsIn(box).forEach(function(c){
    var k=key(txtOf(c)), on=!!used[k];
    if(on)used[k]--;
    c.classList.toggle('used',on); c.setAttribute('aria-pressed',on?'true':'false')})}

function put(inp,text){
  inp.value=text; inp.classList.remove('ok','no');
  var sol=inp.nextSibling; if(sol&&sol.className==='sol')inp.parentNode.removeChild(sol);
  try{inp.dispatchEvent(new Event('input',{bubbles:true}))}catch(e){}
  var box=inp.closest('.box'); if(box)sync(box)}

/* ⚠ WHERE A TAPPED WORD LANDS, in order: the blank the student is in, then the
   first empty blank, then the last blank (so a fifth tap replaces rather than
   doing nothing, which reads as broken). */
function target(box){
  var fs=fieldsIn(box), a=document.activeElement, i;
  if(a&&a.classList&&a.classList.contains('fld')&&box.contains(a))return a;
  for(i=0;i<fs.length;i++)if(!String(fs[i].value).trim())return fs[i];
  return fs.length?fs[fs.length-1]:null}

/* AOG-DD-BANK-STILL-V1 (2026-10-02) — Jimmy, on the iPhone: "when one taps a word it goes far down and the user
   has to scroll back up to the words." Tapping a chip used to focus the next blank, which raised the keyboard and
   scrolled the page away from the bank. On a touch screen a tap now only places the word; nothing is focused and
   nothing moves. A mouse and keyboard still get the next blank. */
function place(chip){
  var box=chip.closest('.box'); if(!box)return;
  var word=txtOf(chip), fs=fieldsIn(box), i;
  if(chip.classList.contains('used')){
    for(i=0;i<fs.length;i++)if(key(fs[i].value)===key(word)){put(fs[i],''); if(!TOUCH)try{fs[i].focus()}catch(e){} return}
    sync(box); return}
  var to=target(box); if(!to)return;
  put(to,word);
  if(TOUCH)return;
  for(i=0;i<fs.length;i++)if(!String(fs[i].value).trim()){try{fs[i].focus()}catch(e){} return}
  try{to.blur()}catch(e){}}

document.addEventListener('click',function(e){
  var c=e.target&&e.target.closest?e.target.closest('.wbank.tapbank>span'):null;
  if(!c||c.classList.contains('bkhow'))return;
  e.preventDefault(); place(c)},false);

document.addEventListener('keydown',function(e){
  if(e.key!=='Enter'&&e.key!==' ')return;
  var c=e.target&&e.target.closest?e.target.closest('.wbank.tapbank>span'):null;
  if(!c||c.classList.contains('bkhow'))return;
  e.preventDefault(); place(c)},false);

/* ── drag is the desktop half; iPad never fires these, which is why tap is the
     primary path and not a convenience ── */
document.addEventListener('dragstart',function(e){
  var c=e.target&&e.target.closest?e.target.closest('.wbank.tapbank>span'):null; if(!c)return;
  try{e.dataTransfer.setData('text/plain',txtOf(c)); e.dataTransfer.effectAllowed='copy'}catch(x){}
  c.classList.add('dragging')});
document.addEventListener('dragend',function(e){
  all('.wbank.tapbank>span.dragging').forEach(function(c){c.classList.remove('dragging')})});
function dropField(e){var el=e.target;
  return (el&&el.classList&&el.classList.contains('fld')&&el.getAttribute('inputmode')==='text')?el:null}
document.addEventListener('dragover',function(e){var f=dropField(e); if(!f)return;
  e.preventDefault(); try{e.dataTransfer.dropEffect='copy'}catch(x){} f.classList.add('drop')});
document.addEventListener('dragleave',function(e){var f=dropField(e); if(f)f.classList.remove('drop')});
document.addEventListener('drop',function(e){var f=dropField(e); if(!f)return;
  e.preventDefault(); f.classList.remove('drop');
  var w=''; try{w=e.dataTransfer.getData('text/plain')}catch(x){}
  if(w)put(f,w)});

/* typing keeps the bank honest too */
document.addEventListener('input',function(e){
  var el=e.target; if(!el||!el.classList||!el.classList.contains('fld'))return;
  var box=el.closest('.box'); if(box&&bankOf(box)&&bankOf(box).__aogTap)sync(box)},true);

/* ══ AOG-DD-NEARWORD-V1 — A TYPO IS NOT A WRONG ANSWER WHEN THE WORD IS ON THE
   SCREEN. The options are printed above the blanks, so the question being asked
   is which word goes where. Before a check is graded, a typed answer that is
   not a bank word but is ONE letter away from exactly one of them is corrected
   to that word — and the student sees the correct spelling sitting in the blank,
   which is worth more than a red mark.
   ⚠ IT ONLY FIRES WHEN THE NEAREST WORD IS STRICTLY NEARER THAN EVERY OTHER
     ONE, and never on short words. el/la, sí/no and tú/yo are one letter apart
     on purpose and must stay exact. A bank word of eight letters or more allows
     two, because a long word is mostly keyboard.
   ⚠ Transposition counts as ONE (Damerau), because "sipma" for "sirma" is the
     commonest real typo and a plain Levenshtein charges it two. */
function dist(a,b){
  var m=a.length,n=b.length,i,j,prev2=[],prev=[],cur=[];
  if(!m)return n; if(!n)return m;
  for(j=0;j<=n;j++)prev[j]=j;
  for(i=1;i<=m;i++){
    cur=[i];
    for(j=1;j<=n;j++){
      var c=a.charAt(i-1)===b.charAt(j-1)?0:1;
      cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+c);
      if(i>1&&j>1&&a.charAt(i-1)===b.charAt(j-2)&&a.charAt(i-2)===b.charAt(j-1))
        cur[j]=Math.min(cur[j],prev2[j-2]+1)}
    prev2=prev; prev=cur}
  return prev[n]}

function snap(){
  all('#sheet .box').forEach(function(box){
    var b=bankOf(box); if(!b||!b.__aogTap)return;
    var words=chipsIn(box).map(txtOf), keys=words.map(key);
    if(!words.length)return;
    fieldsIn(box).forEach(function(inp){
      var v=String(inp.value||'').trim(); if(!v)return;
      var g=key(v); if(!g||keys.indexOf(g)>=0)return;
      var best=-1,bd=99,second=99;
      keys.forEach(function(k,ix){var d=dist(g,k);
        if(d<bd){second=bd;bd=d;best=ix} else if(d<second)second=d});
      if(best<0)return;
      var w=keys[best], span=Math.max(g.length,w.length);
      var lim=(w.length>=8)?2:1;
      if(span<5)return;                 /* el/la, sí/no, tú/yo stay exact */
      /* ⚠⚠ THE ENDING IS NOT A TYPO. This is the rule that makes the whole
         allowance safe in a language class: Spanish keeps its grammar in the
         last letter, so a word that matches all the way to its tail and then
         differs is a DIFFERENT ANSWER, not a slip of the thumb.
           tuve / tuvo ....... person — refused
           hablo / hablé ..... tense  — refused
           pero / perro ...... two words — refused
           estve / estuve .... interior letter dropped — corrected
           Desyuné / Desayuné  interior letter dropped — corrected
         The test is where the two words stop agreeing: if they agree up to the
         last character, the difference IS the ending and nothing is corrected. */
      var L=0,mn=Math.min(g.length,w.length);
      while(L<mn&&g.charAt(L)===w.charAt(L))L++;
      if(L>=mn-1)return;
      if(bd<=lim&&bd<second)put(inp,words[best])})})}

/* ⚠ CAPTURE PHASE ON document, so the correction lands BEFORE whatever handler
   the check buttons carry — however those buttons happen to be bound. */
document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('#checkBtn,#checkBtn2'):null;
  if(b)snap()},true);

/* the sheet is replaced wholesale on every subject, grade, sheet and language
   change, so the dressing follows the DOM rather than any one render path */
function watch(){
  var sh=document.getElementById('sheet'); if(!sh){setTimeout(watch,120);return}
  dress();
  try{new MutationObserver(function(){dress()}).observe(sh,{childList:true,subtree:true})}
  catch(e){setInterval(dress,600)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);
else watch();
})();
