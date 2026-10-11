
/* Print isolation needs #printReport to be a direct child of <body> so the
   @media print rule (hide all body children except it) can keep it. It ships
   nested in div.stage>main; relocate it to body once the DOM is ready. */
(function(){function mv(){try{var p=document.getElementById("printReport");if(p&&p.parentNode!==document.body)document.body.appendChild(p);}catch(e){}}
if(document.readyState!=="loading")mv();else document.addEventListener("DOMContentLoaded",mv);})();
