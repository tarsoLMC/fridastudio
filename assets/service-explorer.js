/* Frida Studio | Fichas de serviço e catálogo por categoria.
   Os 12 procedimentos permanecem disponíveis sem atalhos redundantes por intenção. */
(() => {
  "use strict";

  const catalog = document.getElementById("procedimentos");
  const dialog = document.getElementById("service-dialog");
  const selection = catalog?.querySelector("[data-service-selection]");
  if (!catalog || !dialog || !selection ||
      typeof dialog.showModal !== "function") return;

  const imageFor = {
    "sobrancelhas": "sobrancelhas.webp",
    "cilios": "cilios.webp",
    "labios": "labios.webp",
    "face": "face.webp",
    "maquiagem": "maquiagem.webp"
  };

  // Conservative wording: no invented pricing, clinical promises or durations.
  // The short descriptions are always read from the existing editorial catalogue.
  const contextFor = {
    "Design de sobrancelhas": {
      goal:"Valorizar o desenho das suas sobrancelhas respeitando os fios naturais.",
      note:"O desenho é definido após observar os fios e conversar sobre suas preferências."
    },
    "Protocolo Frida": {
      goal:"Dar atenção à rotina de cuidados e ao aspecto dos fios das sobrancelhas.",
      note:"A equipe explica o protocolo e avalia qual abordagem se adequa a você."
    },
    "Brow Lamination": {
      goal:"Explorar fios alinhados, com uma direção de penteado diferente.",
      note:"Converse sobre a condição dos seus fios e sobre o efeito visual desejado."
    },
    "Blonde Brows": {
      goal:"Experimentar um contraste mais suave entre os fios e o rosto.",
      note:"A equipe avalia os fios e orienta sobre o clareamento e seus cuidados."
    },
    "Nano Fios": {
      goal:"Criar aparência de fios onde você busca maior definição visual.",
      note:"É uma técnica de pigmentação. Confirme indicação, preparo e cuidados com a profissional."
    },
    "Lash Lifting": {
      goal:"Valorizar a curvatura dos seus próprios cílios.",
      note:"A equipe avalia os cílios e explica os cuidados específicos da técnica."
    },
    "Hydra Gloss": {
      goal:"Cuidar da hidratação, da maciez e do brilho dos lábios.",
      note:"A equipe orienta sobre o cuidado labial e sua adequação ao seu momento."
    },
    "Nano Lips": {
      goal:"Realçar visualmente a cor e a definição dos lábios.",
      note:"É uma técnica de pigmentação. Confirme indicação, preparo e cuidados com a profissional."
    },
    "Epilação facial": {
      goal:"Remover pelos faciais em áreas escolhidas com orientação da equipe.",
      note:"Conte quais regiões você deseja cuidar para avaliar a técnica de linha."
    },
    "Maquiagem Social": {
      goal:"Criar uma produção para uma ocasião especial.",
      note:"Conte o tipo de evento, a proposta e o acabamento que você tem em mente."
    },
    "Maquiagem Express": {
      goal:"Conversar sobre uma proposta de maquiagem prática para o momento.",
      note:"A equipe confirma o formato do atendimento e o tempo necessário."
    },
    "Maquiagem Artística": {
      goal:"Explorar uma produção criativa e expressiva.",
      note:"Compartilhe o tema e as referências para a equipe avaliar a proposta."
    }
  };

  const records = new Map();
  const areaLabel = {
    sobrancelhas:"Sobrancelhas",
    cilios:"Cílios",
    labios:"Lábios",
    face:"Face",
    maquiagem:"Maquiagem"
  };

  for (const panel of catalog.querySelectorAll(".catalog-panel")) {
    const area = panel.id.replace(/^categoria-/, "");
    if (!Object.hasOwn(imageFor, area)) continue;

    for (const row of panel.querySelectorAll(".treatments > div")) {
      const name = row.querySelector("dt")?.textContent?.trim() || "";
      const description = row.querySelector("dd:not(.treatment-action)")?.textContent?.trim() || "";
      const action = row.querySelector(".treatment-action");
      const whatsapp = action?.querySelector('a[href^="https://wa.me/"]')?.href;
      if (!name || !description || !action || !whatsapp || !Object.hasOwn(contextFor, name)) continue;

      const record = {name, area, description, row, whatsapp, ...contextFor[name]};
      records.set(name, record);
    }
  }

  // Ensure the source catalogue is complete before enhancing it with service sheets.
  if (records.size !== 12) return;

  const title = dialog.querySelector("[data-service-title]");
  const description = dialog.querySelector("[data-service-description]");
  const goal = dialog.querySelector("[data-service-goal]");
  const note = dialog.querySelector("[data-service-note]");
  const area = dialog.querySelector("[data-service-area]");
  const image = dialog.querySelector("[data-service-image]");
  const book = dialog.querySelector("[data-service-book]");
  const close = dialog.querySelector("[data-service-close]");
  const selectedName = selection.querySelector("[data-service-selection-name]");
  const selectionBook = selection.querySelector("[data-service-selection-book]");
  const change = selection.querySelector("[data-service-change]");
  if ([title,description,goal,note,area,image,book,close,selectedName,selectionBook,change].some(x=>!x)) return;

  let openedRecord = null;

  function markSelection(name) {
    const record = records.get(name);
    for (const item of records.values()) {
      item.row.classList.toggle("is-selected", Boolean(record && item.name === record.name));
    }
    if (record) {
      selectedName.textContent = record.name;
      selection.hidden = false;
      selectionBook.href = record.whatsapp;
      selectionBook.setAttribute("aria-label", "Agendar no WhatsApp: " + record.name);
    } else {
      selection.hidden = true;
      selectedName.textContent = "";
      selectionBook.removeAttribute("aria-label");
    }
  }

  function choose(record) {
    markSelection(record.name);
  }

  function openDetails(record) {
    openedRecord = record;
    title.textContent = record.name;
    description.textContent = record.description;
    goal.textContent = record.goal;
    note.textContent = record.note;
    area.textContent = areaLabel[record.area] || "Cuidados";
    image.src = "assets/images/" + imageFor[record.area];
    image.alt = "Fotografia ilustrativa de " + (areaLabel[record.area] || "cuidados").toLowerCase();
    book.href = record.whatsapp;
    dialog.showModal();
  }

  // One-tap service dossier: source of truth is the existing page content.
  for (const record of records.values()) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "service-view";
    button.textContent = "Conhecer";
    button.setAttribute("aria-label", "Conhecer " + record.name);
    button.addEventListener("click", () => openDetails(record));
    record.row.querySelector(".treatment-action").prepend(button);
    record.row.classList.add("service-row");
  }

  // Editorial highlights become direct entry points to the right dossier.
  // Without JavaScript they retain their original category links.
  const highlightToService = {
    "#categoria-sobrancelhas":"Design de sobrancelhas",
    "#categoria-cilios":"Lash Lifting",
    "#categoria-labios":"Hydra Gloss",
    "#categoria-maquiagem":"Maquiagem Social"
  };
  for (const link of document.querySelectorAll(".highlight-card[href^='#categoria-']")) {
    const name = highlightToService[link.getAttribute("href")];
    const record = records.get(name);
    if (!record) continue;
    link.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey ||
          event.shiftKey || event.altKey) return;
      event.preventDefault();
      document.getElementById("tab-" + record.area)?.click();
      openDetails(record);
    });
  }

  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  book.addEventListener("click", () => {
    if (!openedRecord) return;
    choose(openedRecord);
    dialog.close();
    // Native external WhatsApp link opens the conversation. No extra form.
  });

  change.addEventListener("click", () => {
    markSelection("");
    catalog.querySelector(".catalog-tab.is-active")?.focus({preventScroll:true});
  });

  markSelection("");
})();
