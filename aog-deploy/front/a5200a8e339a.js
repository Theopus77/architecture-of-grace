
(function(){
  var KEY='aog.faith.enabled', EKEY='aog.faith.edition';
  function es(){ return (document.documentElement.getAttribute('lang')||'en').slice(0,2)==='es'; }
  function L(en,e){ return es()?e:en; }
  function on(){ try{ return localStorage.getItem(KEY)==='1'; }catch(_){ return false; } }
  function edition(){ try{ return localStorage.getItem(EKEY)==='divine'?'divine':'values'; }catch(_){ return 'values'; } }
  // Four pillars. "val" = inclusive, non-denominational values line (default).
  // "div" = Christian Divine Edition overlay, drawn from the founder's ESV Scripture Bridge Maps (Reformed register).
  var PILLARS=[
    { name:L('Identity','Identidad'),
      sec:L('You are known, and you belong — apart from what you do or achieve.','Eres conocido y perteneces, aparte de lo que haces o logras.'),
      val:L('In many faith traditions: belovedness — every person carries inherent, given worth.','En muchas tradiciones de fe: ser amado — cada persona lleva un valor inherente y dado.'),
      div:{ ref:'Psalm 139:14', verse:L('“I am fearfully and wonderfully made.”','“Te alabaré porque formidables y maravillosas son tus obras.”'), link:L('Your worth is given by God — not earned, not performed.','Tu valor te lo da Dios: no se gana ni se actúa.') } },
    { name:L('Self-Compassion','Autocompasión'),
      sec:L('Treat yourself with the same kindness you would offer a friend.','Trátate con la misma amabilidad que ofrecerías a un amigo.'),
      val:L('In many faith traditions: mercy — grace extended inward, not earned but received.','En muchas tradiciones de fe: misericordia — gracia hacia adentro, no ganada sino recibida.'),
      div:{ ref:'Matthew 11:28–30', verse:L('“Come to me… my yoke is easy, and my burden is light.”','“Venid a mí… porque mi yugo es fácil, y ligera mi carga.”'), link:L('Mercy toward yourself mirrors Christ’s gentleness.','La misericordia hacia ti mismo refleja la mansedumbre de Cristo.') } },
    { name:L('Forgiveness','Perdón'),
      sec:L('Release what you carry; repair what you can.','Suelta lo que cargas; repara lo que puedas.'),
      val:L('In many faith traditions: reconciliation — the freedom of letting go and making things right.','En muchas tradiciones de fe: reconciliación — la libertad de soltar y reparar.'),
      div:{ ref:'Matthew 5:23–24', verse:L('“First be reconciled… then come and offer your gift.”','“Reconcíliate primero… y entonces ven y presenta tu ofrenda.”'), link:L('Repair is part of worship; release is freedom.','La reparación es parte de la adoración; soltar es libertad.') } },
    { name:L('Grace','Gracia'),
      sec:L('Your worth is not earned by performance, nor lost by failure.','Tu valor no se gana por el desempeño ni se pierde por el fracaso.'),
      val:L('In many faith traditions: unconditional love — worth that precedes anything you do.','En muchas tradiciones de fe: amor incondicional — un valor que precede a todo lo que haces.'),
      div:{ ref:'Ephesians 2:8–9', verse:L('“By grace you have been saved… it is the gift of God.”','“Por gracia sois salvos… es don de Dios.”'), link:L('Grace precedes performance; it cannot be earned or lost.','La gracia precede al desempeño; no se gana ni se pierde.') } }
  ];
  function pillarHtml(){ var ed=edition(); return PILLARS.map(function(p){
    var extra = (ed==='divine')
      ? '<p class="val"><span class="ref">'+p.div.ref+'</span> '+p.div.verse+'<br><span class="lk">'+p.div.link+'</span></p>'
      : '<p class="val">'+p.val+'</p>';
    return '<div class="aogf-pillar"><h4>'+p.name+'</h4><p class="sec">'+p.sec+'</p>'+extra+'</div>';
  }).join(''); }
  function editionSeg(){
    var ed=edition();
    return '<div class="aogf-seg" role="group" aria-label="'+L('Companion edition','Edición del acompañante')+'">'+
      '<button class="aogf-segb'+(ed==='values'?' on':'')+'" onclick="aogFaithSetEdition(\'values\')">'+L('Non-denominational','No confesional')+'</button>'+
      '<button class="aogf-segb'+(ed==='divine'?' on':'')+'" onclick="aogFaithSetEdition(\'divine\')">'+L('Christian (Divine Edition)','Cristiana (Edición Divina)')+'</button>'+
    '</div>';
  }
  function bodyIntro(){ return edition()==='divine'
    ? L('Each pillar with its universal meaning and a Scripture anchor from the Divine Edition (ESV, Reformed register):','Cada pilar con su sentido universal y un ancla bíblica de la Edición Divina (ESV, registro reformado):')
    : L('Each of the four pillars, with its universal meaning and an optional values reflection:','Cada uno de los cuatro pilares, con su sentido universal y una reflexión de valores opcional:'); }
  function bodyNote(){ return edition()==='divine'
    ? L('Drawn from the founder’s Divine Edition Scripture Bridge Maps. A supplement to — never a replacement for — your chapel, theology, and scripture sequence. Nothing here is collected or sent.','Tomado de los Mapas Puente de Escritura de la Edición Divina del autor. Un complemento de —nunca un reemplazo de— tu capilla, teología y secuencia bíblica. Nada de esto se recoge ni se envía.')
    : L('Non-denominational and inclusive by design. Communities are welcome to pair these reflections with their own texts and traditions. Nothing here is collected or sent.','No confesional e inclusivo por diseño. Las comunidades pueden combinar estas reflexiones con sus propios textos y tradiciones. Nada de esto se recoge ni se envía.'); }
  function render(){
    var ov=document.getElementById('aogFaithOv'); if(!ov) return;
    var enabled=on();
    ov.innerHTML='<div class="aogf-card" role="dialog" aria-modal="true" aria-label="Faith Companion">'+
      '<button class="aogf-x" aria-label="'+L('Close','Cerrar')+'" onclick="aogFaithClose()">&times;</button>'+
      '<div class="aogf-eyebrow">'+L('Optional · on-device','Opcional · en el dispositivo')+'</div>'+
      '<div class="aogf-h">'+L('Faith Companion','Acompañante de fe')+'</div>'+
      '<p class="aogf-sub">'+L('Architecture of Grace stays fully universal by default, so it works for everyone. This optional companion adds faith language some communities like to use — it is off until you turn it on, lives only on this device, and changes nothing in the core tool.','Architecture of Grace permanece totalmente universal por defecto, para que sirva a todos. Este acompañante opcional añade un lenguaje de fe que a algunas comunidades les gusta usar: está apagado hasta que lo actives, vive solo en este dispositivo y no cambia nada en la herramienta principal.')+'</p>'+
      '<div class="aogf-toggle"><div><b>'+L('Turn on the Faith Companion','Activar el Acompañante de fe')+'</b><span>'+L('You control this. Turn it off anytime to return to the universal core.','Tú lo controlas. Apágalo cuando quieras para volver al núcleo universal.')+'</span></div>'+
        '<button class="aogf-sw" role="switch" aria-pressed="'+(enabled?'true':'false')+'" aria-label="'+L('Faith Companion','Acompañante de fe')+'" onclick="aogFaithToggle()"></button></div>'+
      '<div class="aogf-body'+(enabled?' on':'')+'">'+
        editionSeg()+
        '<p class="aogf-sub" style="margin:12px 0;">'+bodyIntro()+'</p>'+
        pillarHtml()+
        '<p class="aogf-note">'+bodyNote()+'</p>'+
      '</div>'+
      '<div class="aogf-foot">'+
        '<button class="aogf-b navy" '+(enabled?'':'disabled')+' onclick="aogFaithPrint()">'+L('Print the companion handout','Imprimir el material del acompañante')+'</button>'+
        '<button class="aogf-b" onclick="aogFaithClose()">'+L('Done','Listo')+'</button>'+
      '</div>'+
    '</div>';
  }
  window.aogFaithOpen=function(){ var ov=document.getElementById('aogFaithOv'); if(!ov){ ov=document.createElement('div'); ov.id='aogFaithOv'; document.body.appendChild(ov); ov.addEventListener('click',function(e){ if(e.target===ov) window.aogFaithClose(); }); } render(); ov.classList.add('open'); try{ document.body.style.overflow='hidden'; }catch(_){} };
  window.aogFaithClose=function(){ var ov=document.getElementById('aogFaithOv'); if(ov) ov.classList.remove('open'); try{ document.body.style.overflow=''; }catch(_){} };
  window.aogFaithToggle=function(){ var nv=!on(); try{ localStorage.setItem(KEY, nv?'1':'0'); }catch(_){} render(); };
  window.aogFaithSetEdition=function(ed){ try{ localStorage.setItem(EKEY, ed==='divine'?'divine':'values'); }catch(_){} render(); };
  window.aogFaithPrint=function(){ if(!on()) return; var ed=edition();
    var rows=PILLARS.map(function(p){ var third = ed==='divine' ? ('<b>'+p.div.ref+'</b> '+p.div.verse+'<br><i>'+p.div.link+'</i>') : p.val; return '<tr><td class="n">'+p.name+'</td><td>'+p.sec+'</td><td class="v">'+third+'</td></tr>'; }).join('');
    var w=window.open('','_blank'); if(!w) return;
    var col3 = ed==='divine' ? L('Scripture anchor (ESV)','Ancla bíblica (ESV)') : L('Values reflection','Reflexión de valores');
    var subt = ed==='divine' ? L('Divine Edition — a Scripture anchor on each of the four universal pillars. A supplement, never a replacement.','Edición Divina — un ancla bíblica sobre cada uno de los cuatro pilares universales. Un complemento, nunca un reemplazo.') : L('An optional values reflection on the four universal pillars of Architecture of Grace.','Una reflexión de valores opcional sobre los cuatro pilares universales de Architecture of Grace.');
    var note = ed==='divine' ? L('Drawn from the Divine Edition Scripture Bridge Maps (ESV, Reformed register). Use alongside your chapel and theology. © Architecture of Grace.','Tomado de los Mapas Puente de Escritura de la Edición Divina (ESV, registro reformado). Úsalo junto a tu capilla y teología. © Architecture of Grace.') : L('Non-denominational and inclusive. Pair with your own texts and traditions. © Architecture of Grace.','No confesional e inclusivo. Combínalo con tus propios textos y tradiciones. © Architecture of Grace.');
    w.document.write('<!doctype html><html lang="'+(es()?'es':'en')+'"><head><meta charset="utf-8"><title>'+L('Faith Companion — Architecture of Grace','Acompañante de fe — Architecture of Grace')+'</title>'+
      '<style>body{font-family:Georgia,serif;color:#0A1E33;max-width:720px;margin:36px auto;padding:0 22px;line-height:1.5;}h1{font-size:26px;margin:0 0 4px;}.sub{color:#5b6675;font-size:14px;margin:0 0 18px;}table{width:100%;border-collapse:collapse;}td{vertical-align:top;border-top:1px solid #E4DAC5;padding:11px 8px;font-size:14px;}td.n{font-weight:700;width:22%;}td.v{color:#46506E;}.note{color:#5b6675;font-size:12px;margin-top:18px;}@media print{body{margin:0;}}</style></head><body>'+
      '<h1>'+L('Faith Companion','Acompañante de fe')+'</h1><p class="sub">'+subt+'</p>'+
      '<table><thead><tr><td class="n">'+L('Pillar','Pilar')+'</td><td>'+L('Universal meaning','Sentido universal')+'</td><td class="v">'+col3+'</td></tr></thead><tbody>'+rows+'</tbody></table>'+
      '<p class="note">'+note+'</p>'+
      '</body></html>'); w.document.close(); w.focus(); try{ w.print(); }catch(_){}
  };
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ var ov=document.getElementById('aogFaithOv'); if(ov&&ov.classList.contains('open')) window.aogFaithClose(); } });
})();
