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

  const booking = document.getElementById("booking-form");
  const choice = document.getElementById("booking-procedure");
  const lens = document.querySelector("[data-booking-lens]");
  const choiceLabel = lens?.querySelector("[data-booking-lens-choice]");
  const periodLabel = lens?.querySelector("[data-booking-lens-period]");
  const selectedReceipt = document.querySelector("[data-service-selection]");
  if (!booking || !choice || !lens || !choiceLabel || !periodLabel) return;

  let lastSelected = null;
  let glintTimeout = null;

  function updateLens() {
    const service = choice.value.trim();
    let multi = [];
    try {
      const stored = JSON.parse(booking.dataset.guideProcedures || "[]");
      if (Array.isArray(stored)) multi = stored.filter(value => typeof value === "string" && value.trim());
    } catch { multi = []; }
    const summary = multi.length > 1 ? multi.join(" · ") : service;
    const time = booking.querySelector('input[name="periodo"]:checked')?.value || "Sem preferência";
    choiceLabel.textContent = summary || "Seu ritual, no seu tempo";
    periodLabel.textContent = time === "Sem preferência"
      ? "Período flexível · a equipe confirma os horários"
      : "Preferência: " + time.toLowerCase() + " · sujeito à confirmação";
    lens.dataset.hasChoice = summary ? "true" : "false";

    if (summary !== lastSelected) {
      lastSelected = summary;
      if (selectedReceipt && !selectedReceipt.hidden && motionAllowed) {
        selectedReceipt.classList.remove("is-fx-update");
        if (glintTimeout) window.clearTimeout(glintTimeout);
        window.requestAnimationFrame(() => {
          if (!selectedReceipt.hidden) selectedReceipt.classList.add("is-fx-update");
        });
        glintTimeout = window.setTimeout(() => {
          selectedReceipt.classList.remove("is-fx-update");
        }, 760);
      }
    }
  }

  booking.addEventListener("change", updateLens);
  booking.addEventListener("input", updateLens);
  updateLens();
})();
