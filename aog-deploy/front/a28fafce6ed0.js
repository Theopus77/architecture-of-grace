
(function () {
  var ES = {
    k1:"Empieza aquí", t1:"Encuentra la lección para un resultado",
    s1:"El Índice de Recursos — busca un constructo y obtén la lección, la lámina y el capítulo exactos.",
    k2:"PDF", t2:"Lee una lección real",
    s2:"Una lección completa del Libro 3, grados 6–8. Sin registro.",
    k3:"Referencia", t3:"Cómo funciona todo",
    s3:"Documentación, privacidad y aspectos legales — el material para leer antes de enseñar."
  };
  var EN = {
    k1:"Start here", t1:"Find the lesson for a result",
    s1:"The Resource Index — search a construct, get the exact lesson, chart and chapter.",
    k2:"PDF", t2:"Read a real lesson",
    s2:"A complete lesson from Book 3, grades 6–8. No sign-up.",
    k3:"Reference", t3:"How the whole thing works",
    s3:"Documentation, privacy and legal — the read-before-you-teach-it material."
  };
  function paint() {
    try {
      var es = (document.documentElement.getAttribute("lang") || "en").slice(0,2) === "es";
      var T = es ? ES : EN;
      var nodes = document.querySelectorAll("#guideDoors [data-gd]");
      for (var i = 0; i < nodes.length; i++) {
        var k = nodes[i].getAttribute("data-gd");
        if (T[k]) nodes[i].textContent = T[k];
      }
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint);
  else paint();
  setTimeout(paint, 500);
  try {
    document.addEventListener("click", function (ev) {
      if (ev.target && ev.target.closest && ev.target.closest(".lang-toggle")) setTimeout(paint, 60);
    }, true);
  } catch (e) {}
})();
