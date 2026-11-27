(() => {
'use strict';
const en=(document.documentElement.lang||'tr').toLowerCase().startsWith('en');
const T=en?{home:'Home',pub:'Publications',watch:'Watch',ai:'AI',more:'More',menu:'Quick Access',compass:'Compass',timeline:'Timeline',contact:'Contact',profile:'Profile'}:{home:'Ana Sayfa',pub:'Yayınlar',watch:'İzle',ai:'AI',more:'Daha Fazla',menu:'Kısa Erişim',compass:'Pusula',timeline:'Zaman Çizelgesi',contact:'Temas',profile:'Profil'};
const icon={home:'<path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4Z"/>',pub:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z"/><path d="M8 4v13a3 3 0 0 0-3-3"/>',watch:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3Z"/>',ai:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="4"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'};
const svg=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icon[n]}</svg>`;
// A stable Watch item in the desktop menu, without altering the existing menu architecture.
function addDesktopWatch(){const nav=document.querySelector('.pa-menu10,.nav-links-v258,.nav-links');if(!nav||nav.querySelector('[data-watch-menu-283]'))return;const a=document.createElement('a');a.href='/video.html';a.dataset.watchMenu283='1';a.className='watch-menu283';a.innerHTML=`<span>09</span><strong>${T.watch}</strong><i>${svg('watch')}</i>`;nav.appendChild(a)}
// Add Watch to the existing floating quick-access panel when present.
function addQuickWatch(){const nav=document.querySelector('.pa-dock263 nav,.pa-dock262 nav');if(!nav||nav.querySelector('[href="/video.html"]'))return;const a=document.createElement('a');a.href='/video.html';a.innerHTML=`<i>07</i><span>${T.watch}</span>`;nav.appendChild(a)}
if(!document.querySelector('.pa-bottom283')){
 const dock=document.createElement('nav');dock.className='pa-bottom283';dock.setAttribute('aria-label',en?'Mobile navigation':'Mobil navigasyon');dock.innerHTML=`<a href="/" data-key="home">${svg('home')}<span>${T.home}</span></a><a href="/yayinlar.html" data-key="pub">${svg('pub')}<span>${T.pub}</span></a><a class="pa-bottom283__watch" href="/video.html" data-key="watch"><b>${svg('watch')}</b><span>${T.watch}</span></a><a href="/ask.html" data-key="ai">${svg('ai')}<span>${T.ai}</span></a><button type="button" data-key="more">${svg('more')}<span>${T.more}</span></button>`;document.body.appendChild(dock);
 const current=location.pathname;dock.querySelectorAll('a').forEach(a=>{const h=new URL(a.href,location.href).pathname;if((h==='/'&&current==='/')||(h!=='/'&&current.startsWith(h.replace('.html',''))))a.classList.add('is-active')});
 dock.querySelector('button').onclick=()=>{const trigger=document.querySelector('.pa-dock263__trigger,.pa-dock262__trigger');if(trigger)trigger.click();else document.querySelector('.menu-toggle,[aria-label*="menu" i]')?.click()};
}
addDesktopWatch();addQuickWatch();setTimeout(addDesktopWatch,400);setTimeout(addDesktopWatch,1200);setTimeout(addQuickWatch,500);setTimeout(addQuickWatch,1400);
})();