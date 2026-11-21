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
  lashes: [['Valorizar a curvatura', 'lifting']],
  lips: [['Hidratação e brilho', 'hydra'], ['Realçar a cor', 'nanoLips']],
  face: [['Suavizar os pelos faciais', 'threading']],
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
    result: section.querySelector('[data-guide-step="result"]')
  };
  const goals = section.querySelector('#guide-goals');
  const title = section.querySelector('[data-guide-title]');
  const description = section.querySelector('[data-guide-description]');
  const picks = section.querySelector('[data-guide-picks]');
  const whatsapp = section.querySelector('[data-guide-whatsapp]');
  const guideBooking = section.querySelector('[data-guide-to-booking]');
  const back = section.querySelector('[data-guide-back]');
  const reset = section.querySelector('[data-guide-reset]');
  const areaInputs = [...(steps.area?.querySelectorAll('input[name="area"]') || [])];
  const areaSummary = section.querySelector('[data-guide-area-summary]');
  const areaNext = steps.area?.querySelector('[data-guide-next]');
  const progressText = section.querySelector('[data-guide-progress-text]');
  const progressTrack = section.querySelector('[data-guide-progress-track]');
  const progressFill = section.querySelector('[data-guide-progress-fill]');
  if (!form || areaInputs.length !== 5 || !steps.goal || !steps.result ||
      !goals || !title || !description || !picks || !whatsapp || !guideBooking ||
      !back || !reset || !areaSummary || !areaNext) return;

  const areaNames = {
    brows:'Sobrancelhas', lashes:'Cílios', lips:'Lábios',
    face:'Face', makeup:'Maquiagem'
  };
  let currentStep = 'area';
  let selectedAreas = [];

  const getAreas = () => areaInputs.filter(input => input.checked).map(input => input.value);

  function updateAreas() {
    const count = getAreas().length;
    areaNext.disabled = count === 0;
    areaSummary.textContent = count === 0
      ? 'Selecione ao menos uma área para continuar.'
      : count === 1 ? '1 área selecionada.'
      : count + ' áreas selecionadas. Você pode combinar cuidados.';
  }

  function showStep(step, focusTarget) {
    currentStep = step;
    for (const [name, element] of Object.entries(steps)) {
      const isActive = name === step;
      element.hidden = !isActive;
      if (element instanceof HTMLFieldSetElement) element.disabled = !isActive;
    }
    const value = step === 'area' ? 1 : 2;
    if (progressTrack) {
      progressTrack.setAttribute('aria-valuenow', String(value));
      progressTrack.setAttribute('aria-valuetext',
        step === 'result' ? 'Cuidados selecionados' : 'Etapa ' + value + ' de 2');
    }
    if (progressText) {
      progressText.textContent = step === 'area' ? '01 / 02 · Escolha suas áreas'
        : step === 'goal' ? '02 / 02 · Suas preferências'
        : 'Seus cuidados estão prontos';
    }
    if (progressFill) progressFill.style.width = (value * 50) + '%';
    focusTarget?.focus();
  }

  function renderGoals(areas) {
    const groups = areas.filter(area => goalsByArea[area].length > 1).map(area => {
      const group = document.createElement('div');
      group.className = 'guide-goal-group';
      group.dataset.goalArea = area;
      group.setAttribute('role', 'group');
      group.setAttribute('aria-label', 'Preferência para ' + areaNames[area]);

      const heading = document.createElement('p');
      heading.className = 'guide-goal-heading';
      heading.textContent = areaNames[area];

      const choices = document.createElement('div');
      choices.className = 'guide-choices';
      for (const [index, [labelText]] of goalsByArea[area].entries()) {
        const label = document.createElement('label');
        label.className = 'guide-choice';
        const option = document.createElement('input');
        option.type = 'radio';
        option.name = 'goal-' + area;
        option.value = String(index);
        option.checked = index === 0;
        const text = document.createElement('span');
        text.textContent = labelText;
        label.append(option, text);
        choices.append(label);
      }
      group.append(heading, choices);
      return group;
    });
    goals.replaceChildren(...groups);
  }

  function collectProcedures() {
    return selectedAreas.map(area => {
      const options = goalsByArea[area];
      const checked = goals.querySelector('input[name="goal-' + area + '"]:checked');
      const selected = options[checked ? Number(checked.value) : 0] || options[0];
      const [name, summary] = procedures[selected[1]] || [];
      return name ? {name, summary, area} : null;
    }).filter(Boolean);
  }

  function showRecommendation(entries) {
    if (!entries.length) return;
    const names = entries.map(entry => entry.name);
    title.textContent = names.length === 1 ? names[0] : 'Seus cuidados escolhidos';
    description.textContent = names.length === 1 ? entries[0].summary
      : 'Você pode conversar com a equipe sobre todos esses cuidados na mesma consulta.';
    picks.replaceChildren();
    picks.hidden = entries.length === 1;
    if (entries.length > 1) {
      for (const entry of entries) {
        const item = document.createElement('li');
        const name = document.createElement('strong');
        const detail = document.createElement('span');
        name.textContent = entry.name;
        detail.textContent = entry.summary;
        item.append(name, detail);
        picks.append(item);
      }
    }
    guideBooking.dataset.guideProcedures = JSON.stringify(names);
    const message = names.length === 1
      ? 'Olá! Usei o Guia Frida e gostaria de saber mais sobre ' + names[0] + ' e consultar horários.'
      : 'Olá! Usei o Guia Frida e gostaria de consultar horários e valores para estes cuidados:\n' +
        names.map(name => '• ' + name).join('\n') + '\nPodem me orientar sobre a combinação?';
    whatsapp.href = 'https://wa.me/5561995027800?text=' + encodeURIComponent(message);
    showStep('result', title);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (currentStep === 'area') {
      const areas = getAreas();
      if (!areas.length || areas.some(area => !Object.hasOwn(goalsByArea, area))) return;
      selectedAreas = areas;
      renderGoals(areas);
      // An extra question is needed only for areas with multiple service options.
      if (goals.children.length === 0) showRecommendation(collectProcedures());
      else showStep('goal', goals.querySelector('input'));
    } else if (currentStep === 'goal') {
      showRecommendation(collectProcedures());
    }
  });

  for (const input of areaInputs) input.addEventListener('change', updateAreas);

  back.addEventListener('click', () => {
    showStep('area', areaInputs.find(input => input.checked) || areaInputs[0]);
    updateAreas();
  });

  reset.addEventListener('click', () => {
    form.reset();
    goals.replaceChildren();
    picks.replaceChildren();
    picks.hidden = true;
    delete guideBooking.dataset.guideProcedures;
    selectedAreas = [];
    updateAreas();
    showStep('area', areaInputs[0]);
  });

  updateAreas();
  showStep('area');
  form.hidden = false;
  if (fallback) fallback.hidden = true;
}
