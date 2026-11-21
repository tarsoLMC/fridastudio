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


/* Frida Atelier · discoverable horizontal galleries.
   Native swipe remains the primary gesture. Controls are progressive enhancement:
   hidden when the rail fits, available for touch/keyboard when it overflows. */
(() => {
  "use strict";
  const guides=[...document.querySelectorAll("[data-rail-guide]")];
  if (!guides.length) return;
  const mobile=window.matchMedia("(max-width:760px)");
  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
  const format=n=>String(n).padStart(2,"0");

  for (const guide of guides) {
    const rail=document.getElementById(guide.dataset.railGuide);
    const prev=guide.querySelector("[data-rail-prev]");
    const next=guide.querySelector("[data-rail-next]");
    const current=guide.querySelector("[data-rail-current]");
    const total=guide.querySelector("[data-rail-total]");
    const fill=guide.querySelector("[data-rail-fill]");
    const message=guide.querySelector("[data-rail-instruction-text]");
    const children=rail ? [...rail.children].filter(el=>el.matches("a")) : [];
    if (!rail||!prev||!next||!current||!total||!fill||!message||children.length<2) continue;

    let scheduled=false;

    function update() {
      scheduled=false;
      const max=Math.max(0,rail.scrollWidth-rail.clientWidth);
      const overflowing=mobile.matches && max>6;
      guide.hidden=!overflowing;
      if(!overflowing)return;

      const pos=Math.min(max,Math.max(0,rail.scrollLeft));
      const fraction=max ? pos/max : 0;
      const index=Math.min(children.length,Math.max(1,Math.round(fraction*(children.length-1))+1));
      current.textContent=format(index);
      total.textContent=format(children.length);
      fill.style.width=(100/children.length + fraction*(100-100/children.length))+"%";
      prev.disabled=pos<=4;
      next.disabled=pos>=max-4;
      message.textContent=next.disabled ? "Deslize para voltar" : "Deslize para ver mais";
    }

    function requestUpdate() {
      if(scheduled)return;
      scheduled=true;
      window.requestAnimationFrame(update);
    }

    function move(direction) {
      const first=children[0];
      const gap=parseFloat(getComputedStyle(rail).columnGap)||0;
      const shift=(first.getBoundingClientRect().width+gap)*direction;
      rail.scrollBy({left:shift,behavior:reduceMotion.matches?"instant":"smooth"});
    }

    prev.addEventListener("click",()=>move(-1));
    next.addEventListener("click",()=>move(1));
    rail.addEventListener("scroll",requestUpdate,{passive:true});
    window.addEventListener("resize",requestUpdate,{passive:true});
    if("ResizeObserver" in window) {
      const resize=new ResizeObserver(requestUpdate);
      resize.observe(rail);
    }
    if(rail.id==="catalog-tabs") {
      for(const tab of children) {
        tab.addEventListener("click",()=>{
          if(!mobile.matches)return;
          const first=children[0];
          rail.scrollTo({
            left:Math.max(0,tab.offsetLeft-first.offsetLeft),
            behavior:reduceMotion.matches?"instant":"smooth"
          });
        });
      }
    }
    update();
  }
})();
