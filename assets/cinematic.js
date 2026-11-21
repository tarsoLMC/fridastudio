/* Frida Studio · Cinematic narrative.
   Progressive enhancement: scroll never gets locked or hijacked.
   Without JS/reduced motion, all chapter text and mobile images remain readable. */
(() => {
  "use strict";

  const story = document.querySelector("[data-cinema-story]");
  if (story) {
    const steps = Array.from(story.querySelectorAll("[data-cinema-step]"));
    const frames = Array.from(story.querySelectorAll("[data-cinema-frame]"));
    const counter = story.querySelector("[data-cinema-counter]");
    const orbitChapter = story.querySelector("[data-orbit-chapter]");
    const progress = story.querySelector("[data-cinema-progress]");
    const count = Math.min(steps.length, frames.length);
    let active = -1;

    const selectChapter = (index) => {
      if (index < 0 || index >= count || active === index) return;
      active = index;
      steps.forEach((step, i) => {
        step.classList.toggle("is-active", i === index);
      });
      frames.forEach((frame, i) => {
        frame.classList.toggle("is-active", i === index);
      });
      if (counter) counter.textContent =
        String(index + 1).padStart(2, "0") + " / " + String(count).padStart(2, "0");
      if (orbitChapter) orbitChapter.textContent = String(index + 1).padStart(2, "0");
      if (progress) progress.style.width = (100 * (index + 1) / count) + "%";
    };

    if (count) selectChapter(0);

    // Keyboard navigation is never dependent on an observer.
    steps.forEach((step, i) => {
      step.addEventListener("focusin", () => selectChapter(i));
      step.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "mouse") selectChapter(i);
      });
    });

    if (count && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visible.length) return;
        const index = steps.indexOf(visible[0].target);
        selectChapter(index);
      }, {
        rootMargin: "-28% 0px -38% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.8]
      });
      steps.slice(0, count).forEach((step) => observer.observe(step));
    }
  }

  const revealTargets = Array.from(document.querySelectorAll("[data-cinema-reveal]"));
  const prefersReducedMotion = typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!revealTargets.length || prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.09, rootMargin: "0px 0px -6% 0px" });

  revealTargets.forEach((item) => revealObserver.observe(item));
  document.documentElement.classList.add("cinema-motion");
})();
