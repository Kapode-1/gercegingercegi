(()=>{
 const isEN=(document.documentElement.lang||'').toLowerCase().startsWith('en')||location.pathname.startsWith('/en/');
 const overlay=document.querySelector('.menu-overlay,.menu-panel,.nav-overlay');
 if(!overlay)return;
 const old=overlay.querySelector('.nav-links')||overlay.querySelector('nav');
 if(!old)return;
 const items=isEN?[
  ['01','Profile','#manifesto'],['02','Research Atlas','#atlas'],['03','Publications','/en/publications.html'],['04','Diplomatic Record','#records'],['05','Ask the Atlas','/en/ask.html'],['06','Timeline','/timeline.html'],['07','Contact','#contact'],['08','Compass','/pusula.html']
 ]:[
  ['01','Profil','#manifesto'],['02','Araştırma Atlası','#atlas'],['03','Yayınlar','/yayinlar.html'],['04','Diplomatik Kayıt','#records'],['05','Atlas’a Sor','/ask.html'],['06','Zaman Çizelgesi','/timeline.html'],['07','Temas','#contact'],['08','Pusula','/pusula.html']
 ];
 const fresh=document.createElement('div');fresh.className='nav-links nav-links-v258';
 items.forEach(([no,label,href])=>{
  const a=document.createElement('a');a.className='nav-link'+(no==='08'?' nav-compass-eight':'');a.href=href;
  a.innerHTML=`<span>${no}</span><strong>${label}</strong>${no==='08'?'<i class="menu-compass-mark" aria-hidden="true"><b></b></i>':''}`;
  fresh.appendChild(a);
 });
 old.replaceWith(fresh);
 overlay.querySelectorAll('.nav-compass-chip,.nav-compass-link,.menu-compass-floating').forEach(x=>x.remove());
})();
