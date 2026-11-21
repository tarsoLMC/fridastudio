/* Frida Atelier — isolated component demonstration, no outgoing requests. */
(() => {
  "use strict";
  const buttons=[...document.querySelectorAll("[data-fd-service]")];
  const name=document.querySelector("[data-fd-selected-name]");
  const info=document.querySelector("[data-fd-selected-info]");
  const select=document.querySelector("[data-fd-preview-select]");
  const action=document.querySelector("[data-fd-preview-action]");
  const message=document.querySelector("[data-fd-message-preview]");
  if (!buttons.length||!name||!info||!select||!action||!message) return;
  const descriptions=new Map([
    ["Design de sobrancelhas","Um desenho que valoriza os traços do rosto e os fios naturais."],
    ["Lash Lifting","Curvatura para realçar os cílios naturais."],
    ["Hydra Gloss","Um cuidado de hidratação, maciez e brilho labial."]
  ]);
  function choose(service) {
    if(!descriptions.has(service)) return;
    for(const b of buttons) b.setAttribute("aria-pressed",String(b.dataset.fdService===service));
    name.textContent=service;
    info.textContent=descriptions.get(service);
    select.value=service;
    message.textContent="Nesta demonstração, nenhum WhatsApp será aberto.";
  }
  buttons.forEach(b=>b.addEventListener("click",()=>choose(b.dataset.fdService)));
  select.addEventListener("change",()=>choose(select.value));
  action.addEventListener("click",()=>{
    message.textContent="Prévia: Olá, equipe Frida! Gostaria de consultar horários para "+select.value+". Podem informar disponibilidade e valores?";
  });
})();
