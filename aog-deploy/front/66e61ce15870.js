
/* .30fg — the cross-cutting accessibility layer from the 3 September axe + keyboard audit.
   Nothing here changes what a control does; it names, groups and keyboard-enables what
   already exists. Each block is guarded so a missing element is a no-op. */
(function(){
  "use strict";
  var $=function(s,r){return (r||document).querySelector(s);}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
  var vis=function(e){return !!(e && e.offsetParent!==null);};

  /* reduced motion: JS smooth scrolling ignores the CSS kill switch */
  try{
    var mq=window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    if(mq && mq.matches){
      var siv=Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView=function(o){ if(o && typeof o==="object" && o.behavior==="smooth"){ o=Object.assign({},o,{behavior:"auto"}); } return siv.call(this,o); };
      var wst=window.scrollTo;
      window.scrollTo=function(){ var a=arguments; if(a.length===1 && a[0] && typeof a[0]==="object" && a[0].behavior==="smooth"){ return wst.call(window,Object.assign({},a[0],{behavior:"auto"})); } return wst.apply(window,a); };
    }
  }catch(e){}

  /* touch targets that measured under 24px */
  try{
    var st=document.createElement("style");
    st.textContent="@media (pointer:coarse){ .dt-nick,.sr-toggle,#aogDashLockNow,.ov-teach-link,#rnIdkBtn,.aog-splash-foot a,#topbarBack{ min-height:28px; display:inline-flex; align-items:center; } .tk-pill{ min-height:40px; } }";
    document.head.appendChild(st);
  }catch(e){}

  /* accessibility menu: arrows; theme + language buttons expose state */
  document.addEventListener("keydown",function(ev){
    var m=$("#a11yMenu"); if(!m||m.hasAttribute("hidden"))return;
    if(ev.key!=="ArrowDown"&&ev.key!=="ArrowUp")return;
    var rows=$$(".a11y-row",m).filter(vis); if(!rows.length)return;
    ev.preventDefault();
    var i=rows.indexOf(document.activeElement);
    if(i<0){ rows[ev.key==="ArrowDown"?0:rows.length-1].focus(); return; }
    rows[(i+(ev.key==="ArrowDown"?1:rows.length-1))%rows.length].focus();
  });
  function syncToggles(){
    try{ var t=$("#themeToggle"); if(t) t.setAttribute("aria-pressed", document.documentElement.getAttribute("data-theme")==="dark"?"true":"false"); }catch(e){}
    try{ $$("#langEn,#langEs").forEach(function(b){ b.setAttribute("aria-pressed", b.classList.contains("active")?"true":"false"); }); }catch(e){}
  }
  document.addEventListener("click",function(){ setTimeout(syncToggles,0); });
  syncToggles();

  /* Quiet Space: trap focus inside the dialog, and give it back on close */
  function stationEl(){ return $("#aog-station"); }
  var opener=null;
  function wrapStation(){
    if(window.__aogStWrapped) return;
    if(typeof window.showStationMode!=="function"||typeof window.closeStationMode!=="function") return;
    window.__aogStWrapped=true;
    var sh=window.showStationMode, cl=window.closeStationMode;
    window.showStationMode=function(){ opener=document.activeElement; var r=sh.apply(this,arguments);
      setTimeout(function(){ var st=stationEl(); if(!st)return; var f=$$("button,a[href],[tabindex='0'],input,select,textarea",st).filter(vis)[0]; if(f) f.focus(); },80); return r; };
    window.closeStationMode=function(){ var r=cl.apply(this,arguments);
      setTimeout(function(){ var b=(opener&&document.contains(opener)&&vis(opener))?opener:$("#rnNavBtn"); if(b) try{ b.focus(); }catch(e){} },40); return r; };
  }
  wrapStation(); window.addEventListener("load",function(){ wrapStation(); setTimeout(wrapStation,1500); });
  document.addEventListener("keydown",function(ev){
    if(ev.key!=="Tab")return; var st=stationEl(); if(!st||!st.classList.contains("open"))return;
    var f=$$("button,a[href],[tabindex='0'],input,select,textarea,[tabindex='-1']",st).filter(function(e){return vis(e)&&!e.disabled&&e.getAttribute("tabindex")!=="-1";});
    if(!f.length)return; var first=f[0], last=f[f.length-1], a=document.activeElement;
    if(ev.shiftKey && (a===first||!st.contains(a))){ ev.preventDefault(); last.focus(); }
    else if(!ev.shiftKey && (a===last||!st.contains(a))){ ev.preventDefault(); first.focus(); }
  });

  /* Quiet Space check pills: Enter selects, arrows move within a question */
  document.addEventListener("keydown",function(ev){
    var p=ev.target; if(!p||!p.classList||!p.classList.contains("tk-pill"))return;
    if(ev.key==="Enter"){ ev.preventDefault(); p.click(); return; }
    if(ev.key!=="ArrowRight"&&ev.key!=="ArrowLeft"&&ev.key!=="ArrowDown"&&ev.key!=="ArrowUp")return;
    var q=p.getAttribute("data-q"); var grp=$$('.tk-pill[data-q="'+q+'"]').filter(vis); var i=grp.indexOf(p); if(i<0)return;
    ev.preventDefault(); var n=grp[(i+((ev.key==="ArrowRight"||ev.key==="ArrowDown")?1:grp.length-1))%grp.length]; n.focus(); n.click();
  });

  /* dashboard doors: roving tabindex + arrow keys; sub-tab rows get tab semantics */
  function tabsInit(){
    try{
      var row=$("#dashModes"); if(row){
        var tabs=$$('.dmode[role="tab"]',row);
        tabs.forEach(function(t){ t.setAttribute("tabindex", t.getAttribute("aria-selected")==="true"?"0":"-1"); });
        if(!row.__aogKeys){ row.__aogKeys=true; row.addEventListener("keydown",function(ev){
          if(ev.key!=="ArrowRight"&&ev.key!=="ArrowLeft"&&ev.key!=="Home"&&ev.key!=="End")return;
          var ts=$$('.dmode[role="tab"]',row).filter(vis); var i=ts.indexOf(document.activeElement); if(i<0)return; ev.preventDefault();
          var j=ev.key==="Home"?0:ev.key==="End"?ts.length-1:(i+(ev.key==="ArrowRight"?1:ts.length-1))%ts.length; ts[j].focus(); ts[j].click(); }); }
      }
      $$("#screen-admin .tabs").forEach(function(tl){
        if(tl.getAttribute("role")!=="tablist") tl.setAttribute("role","tablist");
        $$(":scope > .tab",tl).forEach(function(t){ t.setAttribute("role","tab"); t.setAttribute("aria-selected", t.classList.contains("active")?"true":"false"); t.setAttribute("tabindex", t.classList.contains("active")?"0":"-1"); });
        if(!tl.__aogKeys){ tl.__aogKeys=true; tl.addEventListener("keydown",function(ev){
          if(ev.key!=="ArrowRight"&&ev.key!=="ArrowLeft")return;
          var ts=$$(":scope > .tab",tl).filter(vis); var i=ts.indexOf(document.activeElement); if(i<0)return; ev.preventDefault();
          var j=(i+(ev.key==="ArrowRight"?1:ts.length-1))%ts.length; ts[j].focus(); ts[j].click(); }); }
      });
    }catch(e){}
  }

  /* forms + tables: names for what had none; header scopes */
  function labelsInit(){
    try{
      $$("#screen-admin input, #screen-admin select, #screen-admin textarea").forEach(function(inp){
        if(inp.type==="hidden"||inp.hasAttribute("aria-label")||inp.hasAttribute("aria-labelledby")||inp.labels&&inp.labels.length)return;
        var lab=inp.previousElementSibling; if(lab&&lab.tagName==="LABEL"&&!lab.getAttribute("for")){ if(!inp.id) inp.id="aogf_"+Math.random().toString(36).slice(2,8); lab.setAttribute("for",inp.id); return; }
        var sib=inp.previousElementSibling; var txt=(sib&&/evl-ed-l|-l$|label/i.test(sib.className||"")&&sib.textContent.trim())||"";
        var ph=inp.getAttribute("placeholder")||""; var name=(txt&&ph)?(txt+" — "+ph):(txt||ph);
        if(name) inp.setAttribute("aria-label",name);
      });
      var d=$("#lgDistrictId"); if(d&&!d.hasAttribute("aria-label")) d.setAttribute("aria-label","District ID (optional)");
      $$("#lgQr img").forEach(function(im){ if(!im.hasAttribute("alt")) im.setAttribute("alt","QR code for this classroom link"); });
      $$("#screen-admin table").forEach(function(tb){
        $$("th",tb).forEach(function(th){ if(!th.hasAttribute("scope")) th.setAttribute("scope", th.closest("thead")?"col":"row"); });
        if(tb.id==="rost-table"&&!tb.hasAttribute("aria-label")&&!tb.querySelector("caption")) tb.setAttribute("aria-label","Individual responses");
      });
    }catch(e){}
  }
  var t=0; function ask(){ if(t)clearTimeout(t); t=setTimeout(function(){ t=0; tabsInit(); labelsInit(); },160); }
  function boot(){ tabsInit(); labelsInit(); try{ new MutationObserver(ask).observe($("#screen-admin")||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]}); }catch(e){} }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){ setTimeout(boot,300); }); else setTimeout(boot,300);
})();
