/* Frida Studio | Curated motion and accessible gallery controls */
(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 18);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, {passive:true});

  const gallery = document.getElementById("hero-gallery");
  if (gallery) {
    const slides = [...gallery.querySelectorAll("[data-hero-slide]")];
    const dots = [...gallery.querySelectorAll("[data-hero-dot]")];
    const prev = gallery.querySelector("[data-hero-prev]");
    const next = gallery.querySelector("[data-hero-next]");
    const toggle = gallery.querySelector("[data-hero-toggle]");
    const counter = gallery.querySelector("[data-hero-current]");
    let index = 0;
    let paused = false;
    let hovered = false;
    let focused = false;
    let onscreen = true;
    const count = slides.length;

    function navigate(target, userAction = false) {
      if (!count) return;
      index = (target + count) % count;
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
      dots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle("is-active", active);
        if (active) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      if (counter) counter.textContent = String(index + 1).padStart(2, "0");
      if (userAction) {
        paused = true;
        updateToggle();
      }
    }
    function updateToggle() {
      if (!toggle) return;
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.setAttribute("aria-label", paused ? "Reproduzir carrossel" : "Pausar carrossel");
      const shape = paused ? '<path d="m9 5 10 7-10 7V5Z"/>' : '<path d="M9 5v14M15 5v14"/>';
      toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">'+shape+'</svg>';
    }
    if (count > 1) {
      prev?.addEventListener("click", () => navigate(index - 1, true));
      next?.addEventListener("click", () => navigate(index + 1, true));
      dots.forEach((dot,i) => dot.addEventListener("click", () => navigate(i, true)));
      toggle?.addEventListener("click", () => {
        paused = !paused;
        updateToggle();
      });
      gallery.addEventListener("mouseenter", () => { hovered = true; });
      gallery.addEventListener("mouseleave", () => { hovered = false; });
      gallery.addEventListener("focusin", () => { focused = true; });
      gallery.addEventListener("focusout", () => { queueMicrotask(() => { focused = gallery.contains(document.activeElement); }); });
      gallery.addEventListener("keydown", e => {
        if (e.target.closest("button")) return;
        if (e.key === "ArrowLeft") { e.preventDefault(); navigate(index - 1, true); }
        if (e.key === "ArrowRight") { e.preventDefault(); navigate(index + 1, true); }
      });
      let startX = null;
      gallery.addEventListener("touchstart", e => {
        if (e.touches.length !== 1 || e.target.closest("button")) return;
        startX = e.touches[0].clientX;
      }, {passive:true});
      gallery.addEventListener("touchend", e => {
        if (startX === null || !e.changedTouches.length) return;
        const delta = e.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(delta) > 45) navigate(index + (delta < 0 ? 1 : -1), true);
      }, {passive:true});
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
          onscreen = Boolean(entries[0]?.isIntersecting);
        }, {threshold: .18});
        observer.observe(gallery);
      }
      window.setInterval(() => {
        if (paused || hovered || focused || !onscreen || reduced.matches || document.hidden) return;
        navigate(index + 1);
      }, 7600);
      navigate(0);
    }
  }

  const rail = document.querySelector("[data-feature-rail]");
  const prevBtn = document.querySelector("[data-feature-prev]");
  const nextBtn = document.querySelector("[data-feature-next]");
  const progress = document.querySelector("[data-feature-progress]");
  if (rail && prevBtn && nextBtn) {
    const cards = [...rail.querySelectorAll(".feature-card")];
    function nearestStep() {
      const first = cards[0], second = cards[1];
      if (!first) return rail.clientWidth;
      if (second) return Math.max(1, second.offsetLeft - first.offsetLeft);
      return first.getBoundingClientRect().width;
    }
    function update() {
      const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const tolerance = 4;
      prevBtn.disabled = rail.scrollLeft <= tolerance;
      nextBtn.disabled = rail.scrollLeft >= max - tolerance;
      if (progress) {
        const visibleRatio = rail.clientWidth / Math.max(rail.clientWidth, rail.scrollWidth);
        const proportion = max <= 0 ? 1 : visibleRatio + (1-visibleRatio)*(rail.scrollLeft/max);
        progress.style.width = (Math.min(100, Math.max(0, proportion*100))) + "%";
      }
    }
    function move(dir) {
      const step = nearestStep();
      const count = Math.max(1, Math.floor(rail.clientWidth / step));
      rail.scrollBy({left:dir * step * count, behavior: reduced.matches ? "instant" : "smooth"});
    }
    prevBtn.addEventListener("click", () => move(-1));
    nextBtn.addEventListener("click", () => move(1));
    rail.addEventListener("scroll", update, {passive:true});
    rail.addEventListener("keydown", e => {
      if (e.target.closest("a,button")) return;
      if (e.key === "ArrowRight") {e.preventDefault();move(1);}
      if (e.key === "ArrowLeft") {e.preventDefault();move(-1);}
    });
    if ("ResizeObserver" in window) new ResizeObserver(update).observe(rail);
    else window.addEventListener("resize", update);
    requestAnimationFrame(update);
  }
})();
