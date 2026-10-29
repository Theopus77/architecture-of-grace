/* AOG-WOW-MORPH-V1 — Morph control and enhanced pad feedback for the Drum Machine
   Jimmy Project: fluid performance tools that hardware flagships can't match as cleanly.
*/
(function(){
  const slider = document.getElementById("morphSlider");
  const val = document.getElementById("morphVal");
  if (slider && val) {
    slider.addEventListener("input", function(){
      const p = +this.value;
      val.textContent = p + "%";
      document.documentElement.style.setProperty("--morph", (p / 100).toFixed(2));
      // Hook point: blend pattern A/B states, velocities, and visual intensity here
    });
  }
})();
