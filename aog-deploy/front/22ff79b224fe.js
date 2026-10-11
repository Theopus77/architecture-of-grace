
/* generic, reusable accordion: one section open per group */
window.aogAccToggle = function(btn){
  var acc = btn.closest(".aog-acc"); if(!acc) return;
  var group = acc.closest(".aog-acc-group") || document;
  var isOpen = acc.classList.contains("open");
  group.querySelectorAll(".aog-acc").forEach(function(x){
    x.classList.remove("open");
    var h = x.querySelector(".aog-acc-head"); if(h) h.setAttribute("aria-expanded","false");
  });
  if(!isOpen){
    acc.classList.add("open");
    btn.setAttribute("aria-expanded","true");
    try{ acc.scrollIntoView({ behavior:"smooth", block:"nearest" }); }catch(e){}
  }
};
(function(){
  try{
    if (typeof I18N_UI !== "undefined"){
      I18N_UI.wp_skip = {en:"Skip straight to the self-reflection →", es:"Ir directo a la autorreflexión →"};
    }
  }catch(e){}
})();
