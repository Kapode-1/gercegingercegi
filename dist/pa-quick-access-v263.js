(() => {
'use strict';
const KEY='policyAtlas.readingProgress.v2', NOTICE='policyAtlas.continueNotice.v263';
const en=(document.documentElement.lang||'tr').toLowerCase().startsWith('en');
const T=en?{open:'Open quick access',title:'Quick Access',resume:'Continue Reading',notice:'You have an unfinished article',continue:'Continue',home:'Home',pub:'Publications',ai:'Ask the Atlas',compass:'Compass',timeline:'Timeline',contact:'Contact',read:'read',left:'left',min:'min'}:{open:'Kısa erişimi aç',title:'Kısa Erişim',resume:'Kaldığın Yerden Devam Et',notice:'Yarım bıraktığın bir yazı var',continue:'Devam Et',home:'Ana Sayfa',pub:'Yayınlar',ai:'Atlas’a Sor',compass:'Pusula',timeline:'Zaman Çizelgesi',contact:'Temas',read:'okundu',left:'kaldı',min:'dk'};
const parse=v=>{try{return JSON.parse(v)||{}}catch{return{}}};
const latest=()=>Object.values(parse(localStorage.getItem(KEY))).filter(x=>x.progress>=5&&x.progress<96&&x.path!==location.pathname).sort((a,b)=>b.updated-a.updated)[0];
// Replace previous dock and oversized card at runtime.
document.querySelectorAll('.pa-dock262,.pa-continue261,.pa-continue26').forEach(x=>x.remove());
if(document.querySelector('.pa-dock263'))return;
const item=latest();
const dock=document.createElement('div');dock.className='pa-dock263';
dock.innerHTML=`<button class="pa-dock263__trigger" type="button" aria-expanded="false" aria-label="${T.open}"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="15"/><path d="M32 13v5M51 32h-5M32 51v-5M13 32h5"/><path class="needle" d="M39 22 34 35 25 42 30 29Z"/></svg></button><section class="pa-dock263__panel" aria-hidden="true"><header><small>POLICY ATLAS / NAV</small><strong>${T.title}</strong><button type="button" aria-label="Close">×</button></header><div class="pa-dock263__resume"></div><nav><a href="/"><i>01</i><span>${T.home}</span></a><a href="/yayinlar.html"><i>02</i><span>${T.pub}</span></a><a href="/ask.html"><i>03</i><span>${T.ai}</span></a><a href="/pusula.html"><i>04</i><span>${T.compass}</span></a><a href="/timeline.html"><i>05</i><span>${T.timeline}</span></a><a href="/#contact"><i>06</i><span>${T.contact}</span></a></nav></section>`;
document.body.appendChild(dock);
const trigger=dock.querySelector('.pa-dock263__trigger'),panel=dock.querySelector('.pa-dock263__panel'),close=dock.querySelector('header button');
const open=v=>{dock.classList.toggle('is-open',v);trigger.setAttribute('aria-expanded',v);panel.setAttribute('aria-hidden',!v)};
trigger.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open(!dock.classList.contains('is-open'))});
close.addEventListener('click',e=>{e.stopPropagation();open(false)});
document.addEventListener('keydown',e=>e.key==='Escape'&&open(false));
document.addEventListener('pointerdown',e=>{if(!dock.contains(e.target))open(false)},{capture:true});
if(item){dock.classList.add('has-resume');const r=dock.querySelector('.pa-dock263__resume');r.innerHTML=`<small>${T.resume}</small><a><strong></strong><span>${item.progress}% ${T.read} · ~${item.remaining} ${T.min} ${T.left}</span><b><em style="width:${item.progress}%"></em></b></a>`;r.querySelector('strong').textContent=item.title;const a=r.querySelector('a');a.href=item.url+'#continue-reading';}
else dock.querySelector('.pa-dock263__resume').remove();
// Phone-style toast. Once per progress update/session, never blocks page controls.
if(item && sessionStorage.getItem(NOTICE)!==String(item.updated)){
 const toast=document.createElement('aside');toast.className='pa-toast263';toast.innerHTML=`<div class="pa-toast263__icon"><span></span></div><div><small>${T.notice}</small><strong></strong><p>${item.progress}% ${T.read} · ~${item.remaining} ${T.min} ${T.left}</p></div><a>${T.continue}</a><button type="button" aria-label="Close">×</button>`;toast.querySelector('strong').textContent=item.title;toast.querySelector('a').href=item.url+'#continue-reading';toast.querySelector('button').onclick=()=>toast.remove();document.body.appendChild(toast);requestAnimationFrame(()=>toast.classList.add('show'));sessionStorage.setItem(NOTICE,String(item.updated));setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),350)},6500);
}
})();