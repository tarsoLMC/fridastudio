/* Frida Studio V3.5 | Orbital signature and real glass interaction.
   Motion only while visible; no animation framework, tracking or network.
   No fake booking confirmation: this widget echoes preferences only. */
(() => {
  "use strict";

  const prefersReduced = typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection?.saveData === true;
  const motionAllowed = !prefersReduced && !saveData;
  const orbits = Array.from(document.querySelectorAll("[data-motion-orbit]"));

  if (motionAllowed && "IntersectionObserver" in window && orbits.length) {
    const orbitObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.dataset.orbitVisible = entry.isIntersecting ? "true" : "false";
        entry.target.classList.toggle("is-orbit-active", entry.isIntersecting && !document.hidden);
      }
    }, { threshold:0.02, rootMargin:"24px 0px 24px 0px" });
    orbits.forEach(element => orbitObserver.observe(element));
    document.addEventListener("visibilitychange", () => {
      orbits.forEach(element => {
        element.classList.toggle("is-orbit-active",
          !document.hidden && element.dataset.orbitVisible === "true");
      });
    });
  }

})();
