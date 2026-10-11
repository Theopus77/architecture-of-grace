
  (function(){
    var SEC=document.getElementById("screen-words"); if(!SEC) return;
    function lg(k,d){ try{ var v=localStorage.getItem(k); return v===null?d:v; }catch(e){ return d; } }
    function lset(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
    var AUDS=["child","teen","adult"];
    var GRIEF={
      adult:[
        {en:"Grief is love with nowhere to go. The ache is a measure of how much they mattered.",es:"El duelo es amor que no tiene a dónde ir. El dolor es la medida de cuánto importaron."},
        {en:"You don't have to be strong right now. You just have to be here.",es:"No tienes que ser fuerte ahora mismo. Solo tienes que estar aquí."},
        {en:"There is no timeline for this. Take all the time you need.",es:"No hay un calendario para esto. Tómate todo el tiempo que necesites."},
        {en:"It's okay to laugh. It's okay to cry. Both can be true in the same hour.",es:"Está bien reír. Está bien llorar. Las dos cosas pueden ser ciertas en la misma hora."},
        {en:"You cannot do grief wrong. However it comes, that is your way through it.",es:"No se puede vivir el duelo de forma incorrecta. Como llegue, esa es tu manera de atravesarlo."},
        {en:"A life is not measured by its length, but by the love it carried.",es:"Una vida no se mide por su largo, sino por el amor que llevó."},
        {en:"Some days, getting through the day is enough. Let that be enough.",es:"Algunos días, sobrellevar el día es suficiente. Deja que eso sea suficiente."},
        {en:"Reach for one person today. You were never meant to carry this alone.",es:"Busca a una persona hoy. Nunca debiste cargar esto solo."},
        {en:"The people we love become a part of us. They go where we go.",es:"Las personas que amamos se vuelven parte de nosotros. Van a donde vamos."},
        {en:"Healing isn't forgetting. It's learning to carry them with you.",es:"Sanar no es olvidar. Es aprender a llevarlos contigo."}
      ],
      teen:[
        {en:"You don't need the right words. You just have to feel what you feel.",es:"No necesitas las palabras correctas. Solo siente lo que sientes."},
        {en:"Grief is weird and uneven. That doesn't mean you're doing it wrong.",es:"El duelo es raro y desparejo. Eso no significa que lo estés haciendo mal."},
        {en:"It's okay if you're not okay. You don't have to perform being fine.",es:"Está bien no estar bien. No tienes que fingir que estás bien."},
        {en:"Laughing doesn't betray them. Neither does living.",es:"Reír no los traiciona. Vivir tampoco."},
        {en:"Text one person. You don't have to carry this by yourself.",es:"Escríbele a una persona. No tienes que cargar esto tú solo."},
        {en:"However you're grieving is allowed — loud, quiet, angry, or numb.",es:"Como sea que estés en duelo está permitido — fuerte, callado, enojado o vacío."},
        {en:"It wasn't your fault. Replaying it won't make that less true.",es:"No fue tu culpa. Repetirlo en tu mente no lo hace menos cierto."},
        {en:"Some days you just get through. That counts.",es:"Algunos días solo sobrevives. Eso cuenta."},
        {en:"You're allowed to still have good days. It's not forgetting.",es:"Tienes permiso de tener días buenos. No es olvidar."}
      ],
      child:[
        {en:"Whatever you feel today is okay.",es:"Lo que sientas hoy está bien."},
        {en:"It's okay to miss them. Missing means you love them.",es:"Está bien extrañarlos. Extrañar significa que los quieres."},
        {en:"It was not your fault. Not even a little.",es:"No fue tu culpa. Ni un poquito."},
        {en:"You can cry. You can play. Both are okay.",es:"Puedes llorar. Puedes jugar. Las dos cosas están bien."},
        {en:"A grown-up who loves you is here to help.",es:"Un adulto que te quiere está aquí para ayudarte."},
        {en:"Take a slow breath. You are safe right now.",es:"Respira despacio. Estás a salvo ahora."},
        {en:"Love doesn't go away, even when someone does.",es:"El amor no se va, aunque alguien se vaya."},
        {en:"You are not alone. People love you.",es:"No estás solo. Hay personas que te quieren."}
      ]
    };
    var HEAVY=[
      {en:"Rest is not quitting. You're allowed to set it down for tonight.",es:"Descansar no es rendirse. Puedes soltarlo por esta noche."},
      {en:"Carrying everyone else is heavy. Who is carrying you?",es:"Cargar a todos los demás pesa. ¿Quién te carga a ti?"},
      {en:"A hard season is not a permanent address.",es:"Una temporada difícil no es una dirección permanente."},
      {en:"You don't have to earn rest. You just need it.",es:"No tienes que ganarte el descanso. Solo lo necesitas."},
      {en:"Big change asks a lot of you. Go gently.",es:"Los grandes cambios piden mucho de ti. Ve con calma."},
      {en:"You can be tired and still be doing a good job.",es:"Puedes estar cansado y aun así estar haciéndolo bien."},
      {en:"One small next step is enough for now.",es:"Un pequeño paso siguiente es suficiente por ahora."},
      {en:"Your worth isn't measured by how much you produce.",es:"Tu valor no se mide por cuánto produces."},
      {en:"Breathe. This moment is survivable.",es:"Respira. Este momento se puede sobrellevar."},
      {en:"You are allowed to ask for help before you're at the end of your rope.",es:"Tienes permiso de pedir ayuda antes de llegar al límite."}
    ];
    var GRACE=[
      {en:"You are more than your hardest day.",es:"Eres más que tu peor día.",pen:"Identity",pes:"Identidad"},
      {en:"Who you are is not decided by your mistakes.",es:"Quién eres no lo deciden tus errores.",pen:"Identity",pes:"Identidad"},
      {en:"Talk to yourself like someone you love.",es:"Háblate como a alguien que amas.",pen:"Self-Compassion",pes:"Autocompasión"},
      {en:"Being human is not a failure to fix.",es:"Ser humano no es una falla que arreglar.",pen:"Self-Compassion",pes:"Autocompasión"},
      {en:"You can set down what you've been carrying against yourself.",es:"Puedes soltar lo que has cargado en contra de ti mismo.",pen:"Forgiveness",pes:"Perdón"},
      {en:"Repair is always available. It's never too late to begin again.",es:"La reparación siempre está disponible. Nunca es tarde para empezar de nuevo.",pen:"Forgiveness",pes:"Perdón"},
      {en:"You can meet yourself with understanding, not only judgment.",es:"Puedes encontrarte con comprensión, no solo con juicio.",pen:"Grace",pes:"Gracia"},
      {en:"Grace you give yourself becomes grace you can give others.",es:"La gracia que te das se vuelve gracia que puedes dar a otros.",pen:"Grace",pes:"Gracia"}
    ];
    function curLang(){ try{ if(window.lang==='es') return 'es'; }catch(e){} return (document.documentElement.getAttribute('lang')==='es')?'es':'en'; }
    function curAud(){ var v=lg("aog.grace.audience",""); if(AUDS.indexOf(v)>=0)return v; var t=lg("aog.tank.audience",""); if(AUDS.indexOf(t)>=0)return t; return "adult"; }
    var FOCI=["grief","heavy","grace"];
    function curFocus(){ var f=lg("aog.woe.focus","grief"); return FOCI.indexOf(f)>=0?f:"grief"; }
    var focus=curFocus(), aud=curAud(), order=[], idx=0;
    function pool(){ return focus==="heavy"?HEAVY : focus==="grace"?GRACE : GRIEF[aud]; }
    function shuffle(n){ var a=[],i; for(i=0;i<n;i++)a.push(i); for(i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;} return a; }
    function reorder(){ aud=curAud(); order=shuffle(pool().length); idx=0; }
    function item(){ return pool()[order[idx]]; }
    function msgText(){ return item()[curLang()]; }
    function attrText(){
      var l=curLang(), it=item();
      if(focus==="grace") return l==='es'?it.pes:it.pen;
      if(focus==="heavy") return l==='es'?"Para un día pesado":"For a heavy day";
      return l==='es'?"Una palabra para hoy":"A word for today";
    }
    function speak(t){ try{ if(!window.speechSynthesis)return; window.speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(String(t).replace(/[“”]/g,"")); u.lang=curLang()==='es'?'es-ES':'en-US'; u.rate=.95; window.speechSynthesis.speak(u); }catch(e){} }
    function maybeSpeak(t){ if(lg("aog.a11y.readaloud","0")==="1") speak(t); }
    function paintAttr(){ var a=document.getElementById("woe-attr"); if(a) a.textContent=attrText(); }
    function renderMsg(doSpeak){
      var el=document.getElementById('woe-msg'); if(!el)return;
      el.classList.add('fade');
      setTimeout(function(){ el.textContent='“'+msgText()+'”'; paintAttr(); el.classList.remove('fade'); if(doSpeak) maybeSpeak(msgText()); },170);
    }
    window.aogWoeNext=function(){ idx=(idx+1)%order.length; renderMsg(true); };
    window.aogWoeSave=function(btn){
      var NK="aog.woe.note", ta=document.getElementById('woe-priv-note'); if(!ta)return;
      var line='“'+msgText()+'”'; var cur=ta.value||"";
      if(cur.indexOf(line)===-1){ ta.value = line + (cur? "\n\n"+cur : ""); lset(NK, ta.value); }
      if(btn){ var sp=btn.querySelector('span'); if(sp){ var keep=sp.getAttribute('data-'+curLang())||sp.textContent; sp.textContent=(curLang()==='es'?"Guardada ✓":"Saved ✓"); setTimeout(function(){ sp.textContent=keep; },1600); } }
    };
    window.aogWoeFocus=function(f){
      if(FOCI.indexOf(f)<0) return; focus=f; lset("aog.woe.focus",f);
      ["grief","heavy","grace"].forEach(function(k){ var b=document.getElementById("woe-f-"+k); if(b)b.setAttribute("aria-pressed", k===f?"true":"false"); });
      reorder(); renderMsg(true);
    };
    function applyStatic(){ var l=curLang(); SEC.querySelectorAll('[data-en]').forEach(function(n){ var v=n.getAttribute('data-'+l); if(v!==null) n.innerHTML=v; }); }
    function applyPics(){ SEC.classList.toggle('woe-pics', lg("aog.a11y.pictures","0")==="1"); }
    function render(){ if(curAud()!==aud){ reorder(); } applyStatic(); applyPics();
      ["grief","heavy","grace"].forEach(function(k){ var b=document.getElementById("woe-f-"+k); if(b)b.setAttribute("aria-pressed", k===focus?"true":"false"); });
      var el=document.getElementById('woe-msg'); if(el) el.textContent='“'+msgText()+'”'; paintAttr();
    }
    window.aogWoeRender=render;
    var NK="aog.woe.note";
    window.aogWoeSaveNote=function(){ try{ localStorage.setItem(NK,document.getElementById('woe-priv-note').value); var m=document.getElementById('woe-saved'); m.classList.add('show'); setTimeout(function(){m.classList.remove('show');},2200); }catch(e){} };
    try{ new MutationObserver(function(){ render(); }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']}); }catch(e){}
    reorder(); render();
    try{ var sn=localStorage.getItem(NK); if(sn){ var ta=document.getElementById('woe-priv-note'); if(ta) ta.value=sn; } }catch(e){}
  })();
  