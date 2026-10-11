/* AOG-CALM-APP-V1 (Jimmy, 2026-10-10: "Can an icon and direct link be made for the regulation tools page"): at /calm
   this page is the Calm app. Its own icon and name for Add to Home Screen, and it opens on the calm tools (#tools). */
(function(){try{if(!/^\/calm\/?$/.test(location.pathname))return;var D=document;
var m=D.querySelector('link[rel="manifest"]');if(m)m.href="/calm.webmanifest";
var sw=function(){[].forEach.call(D.querySelectorAll('link[rel="apple-touch-icon"]'),function(l){l.href="/app-calm-touch.png";});
[].forEach.call(D.querySelectorAll('meta[name="apple-mobile-web-app-title"]'),function(t){t.content="Calm";});};
if(D.readyState==="loading")D.addEventListener("DOMContentLoaded",sw);else sw();
if(!location.hash||location.hash==="#")history.replaceState(null,"","/calm#tools");}catch(e){}})();