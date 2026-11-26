(()=>{
  const isEN=(document.documentElement.lang||'').toLowerCase().startsWith('en')||location.pathname.startsWith('/en/');
  const nav=document.querySelector('.nav-links')||document.querySelector('nav .menu-links')||document.querySelector('.menu-panel nav')||document.querySelector('nav');
  if(nav){
    document.querySelectorAll('.nav-compass-link,.nav-compass-chip,.nav-compass-eight,[data-compass-menu]').forEach(x=>x.remove());
    const row=document.createElement('a');
    row.className='nav-link nav-compass-eight';row.dataset.compassMenu='true';row.href='/pusula.html';
    row.innerHTML=`<span>08</span><strong>${isEN?'Compass':'Pusula'}</strong><i class="menu-compass-mark" aria-hidden="true"><b></b></i>`;
    const links=[...nav.querySelectorAll('a.nav-link')];
    const contact=links.find(a=>/^07$/.test((a.querySelector('span')?.textContent||'').trim()));
    if(contact) contact.insertAdjacentElement('afterend',row); else nav.appendChild(row);
  }
  // Clear stale inline transforms/widths that move archive content outside mobile viewport.
  if(matchMedia('(max-width:760px)').matches){
    const selectors=['.briefs','.briefs-head','.briefs h2','.briefs h2 .outline','.archive-hero','.archive-hero h1','.archive-grid','.publications-grid','.briefs-grid','.policy-files','.publication-card','.policy-file','.odap-card','.filter-console','.publication-filters','.compass-signal-strip'];
    document.querySelectorAll(selectors.join(',')).forEach(el=>{
      el.style.removeProperty('transform');el.style.removeProperty('left');el.style.removeProperty('right');
      el.style.removeProperty('margin-left');el.style.removeProperty('margin-right');
    });
  }
})();
