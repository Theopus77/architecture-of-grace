
            function aogwbToggle(id, btn){
              var m = document.getElementById(id);
              if(!m) return;
              var open = m.classList.toggle('open');
              var es = (typeof lang !== 'undefined' && lang === 'es');
              btn.innerHTML = open
                ? (es ? 'Ocultar vista previa &uarr;' : 'Hide preview &uarr;')
                : (es ? 'Vista previa del m&oacute;dulo &darr;' : 'Preview the module &darr;');
            }
          