'use strict';

const menuToggle = document.querySelector('[data-menu-toggle]');
const siteNav = document.querySelector('#site-nav');

if (menuToggle && siteNav) {
  const setMenuOpen = (isOpen) => {
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    siteNav.classList.toggle('is-open', isOpen);
  };

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  siteNav.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || menuToggle.getAttribute('aria-expanded') !== 'true') return;

    setMenuOpen(false);
    if (link.origin === location.origin && link.pathname === location.pathname && link.hash) {
      const destination = document.getElementById(link.hash.slice(1));
      if (destination) {
        if (!destination.hasAttribute('tabindex')) destination.setAttribute('tabindex', '-1');
        destination.focus({ preventScroll: true });
        return;
      }
    }
    menuToggle.focus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || menuToggle.getAttribute('aria-expanded') !== 'true') return;

    setMenuOpen(false);
    menuToggle.focus();
  });

  window.addEventListener('resize', () => {
    if (menuToggle.getAttribute('aria-expanded') === 'true' && getComputedStyle(menuToggle).display === 'none') {
      setMenuOpen(false);
    }
  });

  menuToggle.hidden = false;
}

const catalogTabs = document.querySelector('#catalog-tabs');

if (catalogTabs) initializeCatalog(catalogTabs);

function initializeCatalog(tablist) {
  const tabs = Array.from(tablist.querySelectorAll('.catalog-tab'));
  if (!tabs.length) return;

  const panels = tabs.map((tab) => document.getElementById(tab.hash.slice(1)));
  if (panels.some((panel) => !panel)) return;

  let activeIndex;

  function selectTab(index) {
    activeIndex = index;

    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.classList.toggle('is-active', selected);
      tab.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
    });
  }

  function indexForHash(hash) {
    return tabs.findIndex((tab) => tab.hash === hash);
  }

  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Áreas de atendimento');

  tabs.forEach((tab, index) => {
    const panel = panels[index];
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;

    tab.addEventListener('click', (event) => {
      event.preventDefault();
      selectTab(index);
    });

    tab.addEventListener('keydown', (event) => {
      let destination = index;

      switch (event.key) {
        case 'ArrowRight':
          destination = (index + 1) % tabs.length;
          break;
        case 'ArrowLeft':
          destination = (index - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          destination = 0;
          break;
        case 'End':
          destination = tabs.length - 1;
          break;
        case ' ':
          break;
        default:
          return;
      }

      event.preventDefault();
      selectTab(destination);
      tabs[destination].focus();
    });
  });

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a[href]');
    if (!link || link.origin !== location.origin || link.pathname !== location.pathname) return;

    const index = indexForHash(link.hash);
    if (index >= 0 && index !== activeIndex) selectTab(index);
  });

  window.addEventListener('hashchange', () => {
    const index = indexForHash(location.hash);
    if (index < 0 || index === activeIndex) return;

    selectTab(index);
    panels[index].scrollIntoView();
  });

  selectTab(Math.max(0, indexForHash(location.hash)));
}

const procedures = {
  design: ['Design de sobrancelhas', 'Um desenho pensado a partir do formato do seu rosto e da direção natural dos fios.'],
  lamination: ['Brow Lamination', 'Estilização que alinha os fios naturais e destaca o volume das sobrancelhas.'],
  nanoFios: ['Nano Fios', 'Nanopigmentação que desenha traços finos para dar definição a regiões com menos fios.'],
  protocol: ['Protocolo Frida', 'Cuidado individualizado para os fios das sobrancelhas, com avaliação da equipe.'],
  lifting: ['Lash Lifting', 'A técnica valoriza a curvatura dos seus próprios cílios.'],
  hydra: ['Hydra Gloss', 'Um cuidado labial voltado à hidratação e ao viço.'],
  nanoLips: ['Nano Lips', 'Nanopigmentação para realçar a cor e a definição dos lábios.'],
  threading: ['Epilação facial', 'Remoção de pelos faciais com linha nas regiões escolhidas durante o atendimento.'],
  social: ['Maquiagem Social', 'Converse com a equipe sobre a proposta de maquiagem para a sua ocasião.'],
  express: ['Maquiagem Express', 'Consulte a equipe sobre a proposta express e o tempo de atendimento.'],
  artistic: ['Maquiagem Artística', 'Uma produção criativa pensada a partir da sua ideia e da ocasião.'],
};

const goalsByArea = {
  brows: [['Definir o formato', 'design'], ['Alinhar os fios', 'lamination'], ['Preencher falhas', 'nanoFios'], ['Cuidar dos fios', 'protocol']],
  lashes: [['Valorizar a curvatura', 'lifting'], ['Conhecer a técnica', 'lifting']],
  lips: [['Hidratação e brilho', 'hydra'], ['Realçar a cor', 'nanoLips']],
  face: [['Suavizar os pelos faciais', 'threading'], ['Conhecer a técnica da linha', 'threading']],
  makeup: [['Para uma ocasião', 'social'], ['Uma produção rápida', 'express'], ['Uma proposta criativa', 'artistic']],
};

const guide = document.querySelector('#guia');

if (guide) initializeGuide(guide);

const mobileBooking = document.querySelector('.mobile-book');
const heroBooking = document.querySelector('.hero-actions .button-primary');
const footerBooking = document.querySelector('.site-footer .button-primary');

if (mobileBooking && heroBooking && footerBooking && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(() => {
    const heroAboveScreen = heroBooking.getBoundingClientRect().bottom <= 0;
    const footerBelowScreen = footerBooking.getBoundingClientRect().top >= window.innerHeight - 80;
    mobileBooking.hidden = !heroAboveScreen || !footerBelowScreen;
  }, { rootMargin: '0px 0px -80px' });

  observer.observe(heroBooking);
  observer.observe(footerBooking);
}

function initializeGuide(section) {
  const form = section.querySelector('#guide-form');
  const fallback = section.querySelector('[data-guide-fallback]');
  const steps = {
    area: section.querySelector('[data-guide-step="area"]'),
    goal: section.querySelector('[data-guide-step="goal"]'),
    result: section.querySelector('[data-guide-step="result"]'),
  };
  const goals = section.querySelector('#guide-goals');
  const title = section.querySelector('[data-guide-title]');
  const description = section.querySelector('[data-guide-description]');
  const whatsapp = section.querySelector('[data-guide-whatsapp]');
  const back = section.querySelector('[data-guide-back]');
  const reset = section.querySelector('[data-guide-reset]');
  const firstArea = steps.area?.querySelector('input[name="area"]');

  if (!form || !firstArea || !steps.goal || !steps.result || !goals || !title || !description || !whatsapp || !back || !reset) return;

  let currentStep;
  let selectedArea;
  let activeGoals = [];

  function showStep(step, focusTarget) {
    currentStep = step;
    for (const [name, element] of Object.entries(steps)) {
      const isActive = name === step;
      element.hidden = !isActive;
      if (element instanceof HTMLFieldSetElement) element.disabled = !isActive;
    }
    focusTarget?.focus();
  }

  function renderGoals(area) {
    activeGoals = goalsByArea[area];
    goals.replaceChildren(...activeGoals.map(([labelText], index) => {
      const label = document.createElement('label');
      const option = document.createElement('input');
      const text = document.createElement('span');

      label.className = 'guide-choice';
      option.type = 'radio';
      option.name = 'goal';
      option.value = String(index);
      option.required = index === 0;
      text.textContent = labelText;
      label.append(option, text);
      return label;
    }));
    selectedArea = area;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (currentStep === 'area') {
      const area = steps.area.querySelector('input[name="area"]:checked')?.value;
      if (!area || !Object.hasOwn(goalsByArea, area)) return;

      if (area !== selectedArea) renderGoals(area);
      showStep('goal', goals.querySelector('input:checked') || goals.querySelector('input'));
    } else if (currentStep === 'goal') {
      const goal = goals.querySelector('input:checked');
      if (!goal) return;

      const [, procedure] = activeGoals[Number(goal.value)];
      const [name, summary] = procedures[procedure];
      const message = `Olá! Usei o guia do Frida Studio e gostaria de saber mais sobre ${name} e consultar os horários.`;

      title.textContent = name;
      description.textContent = summary;
      whatsapp.href = `https://wa.me/5561995027800?text=${encodeURIComponent(message)}`;
      showStep('result', title);
    }
  });

  back.addEventListener('click', () => {
    showStep('area', steps.area.querySelector('input:checked') || firstArea);
  });

  reset.addEventListener('click', () => {
    form.reset();
    goals.replaceChildren();
    selectedArea = undefined;
    activeGoals = [];
    showStep('area', firstArea);
  });

  firstArea.required = true;
  showStep('area');
  form.hidden = false;
  if (fallback) fallback.hidden = true;
}
