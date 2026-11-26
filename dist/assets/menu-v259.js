(()=>{
 const run=()=>{
  const old=document.querySelector('.nav-links');
  if(!old || old.classList.contains('nav-links-v259')) return;
  const isEN=(document.documentElement.lang||'').toLowerCase().startsWith('en')||location.pathname.startsWith('/en/');
  const items=isEN?[
   ['01','Profile','#manifesto'],['02','Research Atlas','#atlas'],['03','Publications','/en/publications.html'],['04','Diplomatic Record','#records'],['05','Ask the Atlas','/en/ask.html'],['06','Timeline','/timeline.html'],['07','Contact','#contact'],['08','Compass','/pusula.html']
  ]:[
   ['01','Profil','#manifesto'],['02','Ara\u015ft\u0131rma Atlas\u0131','#atlas'],['03','Yay\u0131nlar','/yayinlar.html'],['04','Diplomatik Kay\u0131t','#records'],['05','Atlas\u2019a Sor','/ask.html'],['06','Zaman \u00c7izelgesi','/timeline.html'],['07','Temas','#contact'],['08','Pusula','/pusula.html']
  ];
  const fresh=document.createElement('div');
  fresh.className='nav-links nav-links-v259';
  items.forEach(([no,label,href])=>{
   const a=document.createElement('a');
   a.className='nav-link'+(no==='08'?' nav-compass-eight':'');
   a.href=href;
   const n=document.createElement('span');n.textContent=no;
   const s=document.createElement('strong');s.textContent=label;
   a.append(n,s);
   if(no==='08'){
    const i=document.createElement('i');i.className='menu-compass-mark';i.setAttribute('aria-hidden','true');i.innerHTML='<b></b>';a.append(i);
   }
   fresh.append(a);
  });
  old.replaceWith(fresh);
  document.querySelectorAll('.nav-compass-chip,.nav-compass-link,.menu-compass-floating').forEach(x=>x.remove());
 };
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
 // Some legacy menu builders run after DOMContentLoaded. Re-assert once, then stop.
 setTimeout(run,250);setTimeout(run,900);
})();
