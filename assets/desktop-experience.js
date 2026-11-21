/* Frida Studio · Desktop Cinematic V2
 * Enhances only wide screens with a mouse and normal motion preference.
 * Mobile does not request this module. Switching to a mobile viewport tears
 * down the navigation, RAF listeners, observers, and pointer variables.
 * No analytics, dependencies, page rewrites, or animation loops.
 */
(() => {
  "use strict";
  const gate = window.matchMedia("(min-width:1100px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)");
  const chapters = [
    ["inicio", "Início"],
    ["highlights-title", "Rituais"],
    ["procedimentos", "Cuidados"],
    ["galeria", "Galeria"],
    ["guia", "Guia Frida"],
    ["estudio", "História"],
    ["visita", "Visita"]
  ];

  let session = null;

  function createChapterRail() {
    const nav = document.createElement("nav");
    nav.className = "fd-desktop-chapters";
    nav.setAttribute("aria-label", "Capítulos da Frida Studio");
    const targets = [];
    for (const [id, label] of chapters) {
      const element = document.getElementById(id);
      if (!element) continue;
      const link = document.createElement("a");
      link.className = "fd-desktop-chapter";
      link.href = "#" + id;
      link.setAttribute("aria-label", "Ir para " + label);
      const dot = document.createElement("span");
      dot.className = "fd-desktop-chapter-dot";
      dot.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.className = "fd-desktop-chapter-label";
      text.textContent = label;
      text.setAttribute("aria-hidden", "true");
      link.append(dot, text);
      nav.append(link);
      targets.push({element, link});
    }
    if (!targets.length) return null;
    document.body.append(nav);
    return {nav, targets};
  }

  function start() {
    if (session || !gate.matches || navigator.connection?.saveData) return;
    // Attach all behavior before opting into desktop-only CSS animations.
    const controller = new AbortController();
    const signal = controller.signal;
    const rail = createChapterRail();
    const reveal = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("fd-desktop-revealed");
        reveal.unobserve(entry.target);
      }
    }, {rootMargin:"0px 0px -5% 0px",threshold:0.12});

    const candidates = [
      ...document.querySelectorAll(
        ".highlights-heading, .highlight-card, .service-category-label, .catalog-tabs, .gallery-heading, .gallery-item, .guide-intro, .faq-intro, .faq-list"
      )
    ];
    candidates.forEach((el, index) => {
      el.style.setProperty("--fd-enter-index", String(index % 4));
      reveal.observe(el);
    });

    let scrollFrame = 0;
    function syncChapters() {
      scrollFrame = 0;
      if (!rail || document.hidden) return;
      const max = Math.max(1,document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.max(0,Math.min(1,window.scrollY/max));
      rail.nav.style.setProperty("--fd-rail-progress",progress.toFixed(4));
      const boundary = window.innerHeight * .43;
      let active = rail.targets[0];
      for (const target of rail.targets) {
        if (target.element.getBoundingClientRect().top <= boundary) active = target;
      }
      for (const target of rail.targets) {
        const selected = target === active;
        target.link.classList.toggle("is-active",selected);
        if (selected) target.link.setAttribute("aria-current","location");
        else target.link.removeAttribute("aria-current");
      }
    }
    function requestChapters() {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(syncChapters);
    }
    window.addEventListener("scroll",requestChapters,{passive:true,signal});
    window.addEventListener("resize",requestChapters,{passive:true,signal});
    window.addEventListener("hashchange",requestChapters,{signal});

    const media = document.querySelector(".hero--cinematic .hero-media");
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    function pointerUpdate(event) {
      if (!media || event.pointerType !== "mouse") return;
      const rect = media.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerX = (event.clientX-rect.left)/rect.width - .5;
      pointerY = (event.clientY-rect.top)/rect.height - .5;
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        pointerFrame = 0;
        media.style.setProperty("--fd-hero-depth-x",(pointerX*16).toFixed(1)+"px");
        media.style.setProperty("--fd-hero-depth-y",(pointerY*12).toFixed(1)+"px");
      });
    }
    function resetPointer() {
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      media?.style.setProperty("--fd-hero-depth-x","0px");
      media?.style.setProperty("--fd-hero-depth-y","0px");
    }
    if (media) {
      media.addEventListener("pointermove",pointerUpdate,{passive:true,signal});
      media.addEventListener("pointerleave",resetPointer,{passive:true,signal});
    }
    session = {controller,rail,reveal,candidates,media,
      cancelFrames:() => {
        if (scrollFrame) cancelAnimationFrame(scrollFrame);
        resetPointer();
      }
    };
    document.documentElement.classList.add("frida-desktop-mode");
    requestChapters();
  }

  function stop() {
    if (!session) return;
    const state = session;
    session = null;
    state.controller.abort();
    state.reveal.disconnect();
    state.cancelFrames();
    state.rail?.nav.remove();
    state.candidates.forEach(el => {
      el.classList.remove("fd-desktop-revealed");
      el.style.removeProperty("--fd-enter-index");
    });
    state.media?.style.removeProperty("--fd-hero-depth-x");
    state.media?.style.removeProperty("--fd-hero-depth-y");
    document.documentElement.classList.remove("frida-desktop-mode");
  }

  function sync() {
    if (gate.matches && !navigator.connection?.saveData) start();
    else stop();
  }
  gate.addEventListener("change",sync);
  sync();
})();
