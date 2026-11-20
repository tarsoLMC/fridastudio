/* Frida Studio | Gallery + verified comparison gate + intelligent WhatsApp booking
   Deliberately framework-free and progressive-enhancement friendly. */
(() => {
  "use strict";
  const PHONE = "5561995027800";
  const waLink = (message) => "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(message);

  // Gallery filtering and native lightbox.
  const filters = [...document.querySelectorAll("[data-gallery-filter]")];
  const galleryGrid = document.querySelector("[data-gallery-grid]");
  const photos = [...document.querySelectorAll("[data-gallery-item]")];
  if (galleryGrid && filters.length && photos.length) {
    filters.forEach((button) => {
      button.addEventListener("click", () => {
        const category = button.dataset.galleryFilter;
        const all = category === "todas";
        filters.forEach((filter) => {
          const selected = filter === button;
          filter.classList.toggle("is-active", selected);
          filter.setAttribute("aria-pressed", String(selected));
        });
        galleryGrid.classList.toggle("is-filtered", !all);
        photos.forEach((photo) => { photo.hidden = !all && photo.dataset.galleryCategory !== category; });
      });
    });
  }

  const dialog = document.getElementById("gallery-dialog");
  const dialogPhoto = dialog?.querySelector("[data-gallery-dialog-image]");
  const dialogTitle = document.getElementById("gallery-dialog-title");
  const dialogCaption = dialog?.querySelector("[data-gallery-dialog-caption]");
  if (dialog && dialogPhoto && dialogTitle && dialogCaption && typeof dialog.showModal === "function") {
    photos.forEach((photo) => {
      photo.addEventListener("click", (event) => {
        if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        dialogPhoto.src = photo.getAttribute("href");
        dialogPhoto.alt = photo.querySelector("img")?.alt || "Referência visual";
        dialogTitle.textContent = photo.dataset.galleryTitle || "Galeria Frida";
        dialogCaption.textContent = photo.dataset.galleryCaption || "";
        if (!dialog.open) dialog.showModal();
      });
    });
    dialog.querySelector("[data-gallery-close]")?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => {
      dialogPhoto.removeAttribute("src");
    });
  }

  // Comparators appear only when an explicitly verified, authorized pair exists.
  // The currently published local photos are illustrative; no fictitious comparison is created.
  // Add approved records to assets/results.js as instructed in RESULTADOS.md.
  const comparisonsMount = document.querySelector("[data-gallery-comparisons]");
  const records = Array.isArray(window.FRIDA_VERIFIED_COMPARISONS) ? window.FRIDA_VERIFIED_COMPARISONS : [];
  const trustedPath = (value) => typeof value === "string" && /^assets\/images\/results\/[a-zA-Z0-9_-]+\.(?:webp|avif|jpg|jpeg|png)$/.test(value);
  const approved = records.filter((record) =>
    record && record.verified === true && record.consent === true &&
    trustedPath(record.before) && trustedPath(record.after) &&
    typeof record.title === "string" && record.title.trim().length > 0
  );

  if (comparisonsMount && approved.length) {
    const heading = document.createElement("div");
    heading.className = "comparison-heading";
    const headingTitle = document.createElement("h3");
    headingTitle.textContent = "Evoluções reais, sem filtros";
    const headingNote = document.createElement("p");
    headingNote.textContent = "Arraste o controle para comparar fotos da mesma cliente, publicadas com autorização. Resultados individuais podem variar.";
    heading.append(headingTitle, headingNote);

    const grid = document.createElement("div");
    grid.className = "comparison-grid";
    approved.forEach((record) => {
      const card = document.createElement("article");
      card.className = "comparison-card";
      const title = document.createElement("h4");
      title.textContent = record.title;
      const visual = document.createElement("div");
      visual.className = "comparison-visual";
      const afterImage = document.createElement("img");
      afterImage.src = record.after;
      afterImage.alt = "Resultado posterior do procedimento: " + record.title;
      afterImage.loading = "lazy";
      const beforeImage = document.createElement("img");
      beforeImage.src = record.before;
      beforeImage.alt = "Registro anterior do procedimento: " + record.title;
      beforeImage.loading = "lazy";
      beforeImage.className = "comparison-before";
      const divider = document.createElement("span");
      divider.className = "comparison-divider";
      divider.setAttribute("aria-hidden", "true");
      visual.append(afterImage, beforeImage, divider);

      const labels = document.createElement("div");
      labels.className = "comparison-labels";
      const beforeLabel = document.createElement("span"); beforeLabel.textContent = "Antes";
      const afterLabel = document.createElement("span"); afterLabel.textContent = "Depois";
      labels.append(beforeLabel, afterLabel);
      const range = document.createElement("input");
      range.className = "comparison-range";
      range.type = "range";
      range.min = "0"; range.max = "100"; range.value = "50"; range.step = "1";
      range.setAttribute("aria-label", "Comparar antes e depois: " + record.title);
      range.addEventListener("input", () => visual.style.setProperty("--split", range.value + "%"));
      const caption = document.createElement("p");
      caption.className = "comparison-caption";
      caption.textContent = typeof record.note === "string" ? record.note : "Registro autorizado da Frida Studio.";
      card.append(title, visual, labels, range, caption);
      grid.append(card);
    });
    comparisonsMount.replaceChildren(heading, grid);
    comparisonsMount.hidden = false;
  }

  // A user prepares a message. This is not an appointment calendar or reservation.
  const booking = document.getElementById("booking-form");
  const procedureSelect = document.getElementById("booking-procedure");
  const dayInput = document.getElementById("booking-date");
  const bookingLink = booking?.querySelector("[data-booking-link]");
  const preview = booking?.querySelector("[data-booking-preview]");

  const localDate = () => {
    const today = new Date();
    return [today.getFullYear(), String(today.getMonth() + 1).padStart(2,"0"), String(today.getDate()).padStart(2,"0")].join("-");
  };

  function updateBooking() {
    if (!booking || !procedureSelect || !bookingLink || !preview) return;
    const procedure = procedureSelect.value || "Preciso de orientação para escolher";
    const time = booking.querySelector('input[name="periodo"]:checked')?.value || "Sem preferência";
    const date = dayInput?.value && dayInput.value >= localDate() ? dayInput.value.split("-").reverse().join("/") : "";
    const lines = [
      "Olá, equipe Frida! Gostaria de consultar os horários disponíveis.",
      "Procedimento: " + procedure + ".",
      "Período preferido: " + time + "."
    ];
    if (date) lines.push("Dia de preferência: " + date + ".");
    lines.push("Podem me informar disponibilidade e valores?");
    const message = lines.join("\n");
    bookingLink.href = waLink(message);
    preview.textContent = message.replace(/\n/g, " ");
  }

  if (booking && procedureSelect && bookingLink && preview) {
    if (dayInput) dayInput.min = localDate();
    booking.addEventListener("change", updateBooking);
    booking.addEventListener("input", updateBooking);
    bookingLink.addEventListener("click", updateBooking);
    booking.addEventListener("submit", (event) => { event.preventDefault(); updateBooking(); bookingLink.click(); });
    updateBooking();
  }

  // Connect the recommendation from the existing functional guide to booking.
  const guideBooking = document.querySelector("[data-guide-to-booking]");
  guideBooking?.addEventListener("click", () => {
    const proposed = document.querySelector("[data-guide-title]")?.textContent?.trim() || "";
    if (!procedureSelect) return;
    const match = [...procedureSelect.options].find((option) => option.value === proposed);
    procedureSelect.value = match?.value || "";
    updateBooking();
    window.requestAnimationFrame(() => procedureSelect.focus({preventScroll:true}));
  });
})();
