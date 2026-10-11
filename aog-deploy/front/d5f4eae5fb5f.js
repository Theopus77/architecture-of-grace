
(function(){
  var KEY='aog.outside.dismissed';
  window.aogOutsideProviderCard=function(es){
    try{ if(localStorage.getItem(KEY)==='1') return ''; }catch(_){}
    function L(en,e){ return es?e:en; }
    return '<div class="aog-outside-card" role="note">'+
      '<button class="x" aria-label="'+L('Dismiss','Descartar')+'" onclick="try{localStorage.setItem(\''+KEY+'\',\'1\');}catch(e){} var c=this.closest(\'.aog-outside-card\'); if(c)c.remove();">&times;</button>'+
      '<div class="h"><span class="tag">'+L('Outside provider','Proveedor externo')+'</span>'+L('Working with a family or school you’re not employed by?','¿Trabajas con una familia o escuela que no te emplea?')+'</div>'+
      '<div>'+L('This Specialist workspace doubles as a private, consent-first space for private practice, outside OT/PT/SLP, and community clinics:','Este espacio de especialista también funciona como un espacio privado que da prioridad al consentimiento, para consulta privada, OT/PT/fono externos y clínicas comunitarias:')+
      '<ul>'+
        '<li>'+L('<b>Consent first.</b> Get the family’s or student’s written consent before entering anything.','<b>El consentimiento, primero.</b> Obtén el consentimiento por escrito de la familia o del estudiante antes de ingresar datos.')+'</li>'+
        '<li>'+L('<b>On your device.</b> Clients, sessions, and screeners stay on this device — never on a school’s system unless you choose to share.','<b>En tu dispositivo.</b> Clientes, sesiones y tamizajes se quedan en este dispositivo, nunca en el sistema de una escuela a menos que decidas compartir.')+'</li>'+
        '<li>'+L('<b>Clean hand-off.</b> Export a CSV or print a cover to share only what you choose with the family or school.','<b>Entrega clara.</b> Exporta un CSV o imprime una portada para compartir solo lo que elijas con la familia o la escuela.')+'</li>'+
      '</ul></div></div>';
  };
})();
