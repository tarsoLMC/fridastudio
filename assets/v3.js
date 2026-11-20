/* Frida Studio V3: unobtrusive navigation behavior. All content remains usable without JS. */
(() => {
  "use strict";
  const header = document.querySelector(".site-header");
  const dockLinks = [...document.querySelectorAll(".dock-link[data-section]")];
  const sections = dockLinks
    .map(link => ({link, element: document.getElementById(link.dataset.section)}))
    .filter(entry => entry.element);

  let scheduled = false;
  function updateNavigation() {
    scheduled = false;
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
    if (sections.length === 0) return;
    const cutoff = window.innerHeight * .33;
    let current = sections[0];
    for (const entry of sections) {
      if (entry.element.getBoundingClientRect().top <= cutoff) current = entry;
    }
    for (const {link} of sections) {
      const selected = link === current.link;
      link.classList.toggle("is-current", selected);
      if (selected) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }
  function requestUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateNavigation);
  }
  window.addEventListener("scroll", requestUpdate, {passive:true});
  window.addEventListener("resize", requestUpdate, {passive:true});
  window.addEventListener("hashchange", requestUpdate);
  requestUpdate();
})();
