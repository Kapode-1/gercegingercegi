(() => {
'use strict';
const KEY='policyAtlas.readingProgress.v2';
const en=(document.documentElement.lang||'tr').toLowerCase().startsWith('en');
const T=en?{open:'Quick access',title:'Quick Access',resume:'Continue Reading',home:'Home',pub:'Publications',ai:'Ask the Atlas',compass:'Compass',timeline:'Timeline',contact:'Contact',close:'Close',read:'read',left:'left',min:'min'}:{open:'Kısa erişim',title:'Kısa Erişim',resume:'Kaldığın Yerden Devam Et',home:'Ana Sayfa',pub:'Yayınlar',ai:'Atlas’a Sor',compass:'Pusula',timeline:'Zaman Çizelgesi',contact:'Temas',close:'Kapat',read:'okundu',left:'kaldı',min:'dk'};
const parse=v=>{try{return JSON.parse(v)||{}}catch{return{}}};
const latest=()=>Object.values(parse(localStorage.getItem(KEY))).filter(x=>x.progress>=5&&x.progress<96&&x.path!==location.pathname).sort((a,b)=>b.updated-a.updated)[0];
// Remove the oversized in-flow card. Reading progress on article pages remains untouched.
document.querySelectorAll('.pa-continue261,.pa-continue26').forEach(x=>x.remove());
if(document.querySelector('.pa-dock262')) return;
const dock=document.createElement('div');dock.className='pa-dock262';dock.innerHTML=`<button class="pa-dock262__trigger" type="button" aria-expanded="false" aria-label="${T.open}"><span class="pa-dock262__ring"><i></i></span><b>+</b></button><section class="pa-dock262__panel" aria-hidden="true"><header><small>POLICY ATLAS / NAV</small><strong>${T.title}</strong><button type="button" aria-label="${T.close}">×</button></header><div class="pa-dock262__resume"></div><nav><a href="/">01 <span>${T.home}</span></a><a href="/yayinlar.html">02 <span>${T.pub}</span></a><a href="/ask.html">03 <span>${T.ai}</span></a><a href="/pusula.html">04 <span>${T.compass}</span></a><a href="/timeline.html">05 <span>${T.timeline}</span></a><a href="/#contact">06 <span>${T.contact}</span></a></nav></section>`;
document.body.appendChild(dock);
const trigger=dock.querySelector('.pa-dock262__trigger'), panel=dock.querySelector('.pa-dock262__panel'), close=dock.querySelector('header button');
const setOpen=v=>{dock.classList.toggle('is-open',v);trigger.setAttribute('aria-expanded',String(v));panel.setAttribute('aria-hidden',String(!v));};
trigger.onclick=()=>setOpen(!dock.classList.contains('is-open'));close.onclick=()=>setOpen(false);document.addEventListener('keydown',e=>e.key==='Escape'&&setOpen(false));document.addEventListener('pointerdown',e=>{if(!dock.contains(e.target))setOpen(false)});
const item=latest(), resume=dock.querySelector('.pa-dock262__resume');
if(item){resume.innerHTML=`<small>${T.resume}</small><a><strong></strong><span>${item.progress}% ${T.read} · ~${item.remaining} ${T.min} ${T.left}</span><i><em style="width:${item.progress}%"></em></i></a>`;const a=resume.querySelector('a');a.href=item.url+'#continue-reading';resume.querySelector('strong').textContent=item.title;dock.classList.add('has-resume');}else resume.remove();
})();