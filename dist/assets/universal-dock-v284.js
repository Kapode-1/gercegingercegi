(() => {
'use strict';
const en=(document.documentElement.lang||'tr').toLowerCase().startsWith('en');
const T=en?{home:'Home',pub:'Publications',watch:'Watch',ai:'AI',compass:'Compass'}:{home:'Ana Sayfa',pub:'Yayınlar',watch:'İzle',ai:'AI',compass:'Pusula'};
const icons={home:'<path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4Z"/>',pub:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z"/><path d="M8 4v13a3 3 0 0 0-3-3"/>',watch:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3Z"/>',ai:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="4"/>',compass:'<circle cx="12" cy="12" r="8"/><path d="m15.7 8.3-2.2 5.2-5.2 2.2 2.2-5.2Z"/>'};
const svg=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[n]}</svg>`;
document.querySelectorAll('.pa-bottom283,.pa-bottom284').forEach(x=>x.remove());
const dock=document.createElement('nav');dock.className='pa-bottom284';dock.setAttribute('aria-label',en?'Primary navigation':'Ana navigasyon');
const items=[['home','/',T.home],['pub','/yayinlar.html',T.pub],['watch','/video.html',T.watch],['ai','/ask.html',T.ai],['compass','/pusula.html',T.compass]];
dock.innerHTML=items.map(([k,h,l])=>`<a href="${h}" data-key="${k}" class="${k==='watch'?'is-watch':''}"><span class="pa-bottom284__icon">${svg(k)}</span><b>${l}</b></a>`).join('');document.body.appendChild(dock);
const current=location.pathname.replace(/\/$/,'')||'/';dock.querySelectorAll('a').forEach(a=>{const h=new URL(a.href,location.href).pathname.replace(/\/$/,'')||'/';if((h==='/'&&current==='/')||(h!=='/'&&current.startsWith(h.replace('.html',''))))a.classList.add('is-active')});
// Reliable taps: block ghost clicks only after real drag, never place invisible layers above links.
let sx=0,sy=0,moved=false;dock.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;moved=false},{passive:true});dock.addEventListener('pointermove',e=>{if(Math.hypot(e.clientX-sx,e.clientY-sy)>10)moved=true},{passive:true});dock.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false}},true);
// Adapt glass tone to the section behind the dock while scrolling.
function luminance(rgb){const m=String(rgb).match(/[\d.]+/g);if(!m||m.length<3)return .05;const v=m.slice(0,3).map(x=>Number(x)/255).map(x=>x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4));return .2126*v[0]+.7152*v[1]+.0722*v[2]}
function refreshTone(){dock.style.pointerEvents='none';const r=dock.getBoundingClientRect(),el=document.elementFromPoint(innerWidth/2,Math.max(1,r.top-8));dock.style.pointerEvents='auto';let n=el,bg='';while(n&&n!==document.documentElement){const c=getComputedStyle(n).backgroundColor;if(c&&!/rgba?\(0, 0, 0, 0\)/.test(c)&&c!=='transparent'){bg=c;break}n=n.parentElement}const light=luminance(bg)>.38;dock.classList.toggle('on-light',light);dock.classList.toggle('on-dark',!light)}
let raf;addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(refreshTone)},{passive:true});addEventListener('resize',refreshTone,{passive:true});refreshTone();setTimeout(refreshTone,600);
})();