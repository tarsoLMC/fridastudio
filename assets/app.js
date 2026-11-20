'use strict';
(function(){
  const menuButton=document.querySelector('.menu-toggle');
  const mobileMenu=document.getElementById('mobile-menu');
  const filters=[...document.querySelectorAll('[data-filter]')];
  const cards=[...document.querySelectorAll('.service-card')];
  const moreButton=document.getElementById('more-services');
  const goalButtons=[...document.querySelectorAll('[data-goal]')];
  const guideResult=document.getElementById('guide-result');
  const guideName=document.getElementById('guide-name');
  const guideDescription=document.getElementById('guide-description');
  const guideCta=document.getElementById('guide-cta');
  const wa='https://wa.me/5561995027800?text=';
  let selectedCategory='todos';
  let showAll=false;

  function setMenu(open){
    if(!menuButton||!mobileMenu)return;
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
    mobileMenu.hidden=!open;
  }
  if(menuButton&&mobileMenu){
    menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
    mobileMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true'){setMenu(false);menuButton.focus();}});
    document.addEventListener('click',e=>{if(!e.target.closest('.site-header')&&menuButton.getAttribute('aria-expanded')==='true')setMenu(false);});
  }

  function updateServices(){
    let count=0;
    for(const card of cards){
      const matches=selectedCategory==='todos'||card.dataset.category===selectedCategory;
      card.hidden=!matches;
      card.classList.toggle('expanded',showAll||selectedCategory!=='todos');
      if(matches)count++;
    }
    if(moreButton){
      const allCategory=selectedCategory==='todos';
      moreButton.hidden=!allCategory;
      moreButton.setAttribute('aria-expanded',String(showAll));
      moreButton.innerHTML=showAll?'Mostrar menos procedimentos <span aria-hidden="true">↑</span>':'Ver todos os 12 procedimentos <span aria-hidden="true">↗</span>';
    }
    const grid=document.getElementById('service-grid');
    if(grid)grid.setAttribute('aria-label',count+' procedimentos disponíveis no filtro selecionado');
  }
  filters.forEach(button=>button.addEventListener('click',()=>{
    selectedCategory=button.dataset.filter;
    for(const filter of filters){
      const active=filter===button;
      filter.classList.toggle('active',active);
      filter.setAttribute('aria-pressed',String(active));
    }
    updateServices();
  }));
  if(moreButton){
    moreButton.addEventListener('click',()=>{
      showAll=!showAll;
      updateServices();
      if(!showAll)document.getElementById('tratamentos')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    });
  }
  updateServices();

  const goals={
    design:{name:'Design de sobrancelhas',description:'Um desenho personalizado para valorizar os traços do seu rosto.',message:'Olá! Quero entender melhor o design de sobrancelhas e consultar horários.'},
    brow:{name:'Brow Lamination',description:'Estilização dos seus próprios fios para um efeito alinhado e mais expressivo.',message:'Olá! Quero saber mais sobre Brow Lamination e consultar horários.'},
    lash:{name:'Lash Lifting',description:'Curvatura dos cílios naturais para destacar o olhar com leveza.',message:'Olá! Quero saber mais sobre Lash Lifting e consultar horários.'},
    lips:{name:'Hydra Gloss',description:'Um cuidado pensado para hidratação e aparência revitalizada dos lábios.',message:'Olá! Quero saber mais sobre Hydra Gloss e consultar horários.'}
  };
  goalButtons.forEach(button=>button.addEventListener('click',()=>{
    goalButtons.forEach(item=>{const active=item===button;item.classList.toggle('selected',active);item.setAttribute('aria-pressed',String(active));});
    const goal=goals[button.dataset.goal];
    if(!goal||!guideResult)return;
    guideName.textContent=goal.name;
    guideDescription.textContent=goal.description;
    guideCta.href=wa+encodeURIComponent(goal.message);
    guideResult.hidden=false;
  }));
  goalButtons.forEach(button=>button.setAttribute('aria-pressed','false'));

  const year=document.getElementById('year');
  if(year)year.textContent=new Date().getFullYear();

  const dockLinks=[...document.querySelectorAll('.mobile-dock a[data-dock]')];
  if('IntersectionObserver' in window && dockLinks.length){
    const observed=['inicio','tratamentos','sobre'].map(id=>document.getElementById(id)).filter(Boolean);
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible)return;
      dockLinks.forEach(link=>{
        const active=link.dataset.dock===visible.target.id;
        link.classList.toggle('active',active);
        if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
      });
    },{rootMargin:'-25% 0px -45% 0px',threshold:[0,.25,.75]});
    observed.forEach(section=>observer.observe(section));
  }
  document.querySelectorAll('img').forEach(img=>{
    img.addEventListener('error',()=>{
      const frame=img.closest('.hero-main-image,.service-photo,.editorial-image,.signature-visual,.about-photo');
      if(frame)frame.classList.add('image-unavailable');
      img.style.visibility='hidden';
    },{once:true});
  });
})();