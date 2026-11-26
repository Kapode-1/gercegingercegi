(() => {
  'use strict';
  const KEY='policyAtlas.readingProgress.v2';
  const path=location.pathname.replace(/\/$/,'');
  const isArticle=/(^|\/)yayinlar\/[^/]+(?:\.html)?$|(^|\/)odap\/[^/]+(?:\.html)?$|(^|\/)publications\/[^/]+(?:\.html)?$/i.test(path);
  const lang=(document.documentElement.lang||'tr').toLowerCase().startsWith('en')?'en':'tr';
  const tx=lang==='en'?{continue:'Continue where you left off',read:'read',left:'left',done:'Completed',resume:'Resume article',dismiss:'Dismiss',saved:'Saved on this device',min:'min'}:{continue:'Kaldığın Yerden Devam Et',read:'okundu',left:'kaldı',done:'Tamamlandı',resume:'Yazıya devam et',dismiss:'Kapat',saved:'Bu cihazda saklandı',min:'dk'};
  const parse=v=>{try{return JSON.parse(v)||{}}catch{return {}}};
  const load=()=>parse(localStorage.getItem(KEY));
  const save=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch{}};
  const clean=s=>(s||'').replace(/\s+/g,' ').trim();
  const root=()=>document.querySelector('#full-analysis,.article-body,.article-content,.article-layout,.odap-article,.publication-body,[data-article-body],main article,article');
  const url=()=>document.querySelector('link[rel="canonical"]')?.href||location.origin+location.pathname;
  const heading=()=>clean(document.querySelector('article h1,main h1,h1')?.textContent||document.title.split('|')[0]);
  const words=el=>clean(el?.innerText).split(/\s+/).filter(Boolean).length;
  const progress=el=>{const r=el.getBoundingClientRect(),start=scrollY+r.top,end=start+el.offsetHeight-innerHeight*.55;return end<=start?1:Math.max(0,Math.min(1,(scrollY-start)/(end-start)))};
  const mins=(el,p)=>Math.max(1,Math.ceil(words(el)*(1-p)/210));
  function addProgress(el){
    if(document.querySelector('.pa-progress261'))return;
    const box=document.createElement('aside');box.className='pa-progress261';box.innerHTML='<div><i></i></div><p><span></span><b></b></p>';
    el.parentNode.insertBefore(box,el);
    const draw=()=>{const p=progress(el),n=Math.round(p*100);box.querySelector('i').style.width=n+'%';box.querySelector('span').textContent=n+'% '+tx.read;box.querySelector('b').textContent=p>=.98?tx.done:`~ ${mins(el,p)} ${tx.min} ${tx.left}`};
    draw();addEventListener('scroll',draw,{passive:true});
  }
  function track(){
    const el=root();if(!el)return;addProgress(el);
    let timer;
    const commit=()=>{const p=progress(el),n=Math.round(p*100);if(n<3)return;const db=load(),u=url();db[u]={url:u,path:location.pathname,title:heading(),lang,progress:n,scrollY:Math.round(scrollY),remaining:mins(el,p),updated:Date.now()};save(Object.fromEntries(Object.entries(db).sort((a,b)=>b[1].updated-a[1].updated).slice(0,20)))};
    addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(commit,350)},{passive:true});addEventListener('pagehide',commit);document.addEventListener('visibilitychange',()=>document.hidden&&commit());
    const old=load()[url()];if(old&&location.hash==='#continue-reading'&&old.scrollY>80)setTimeout(()=>scrollTo({top:old.scrollY,behavior:'smooth'}),250);
  }
  function showCard(){
    if(document.querySelector('.pa-continue261'))return;
    const item=Object.values(load()).filter(x=>x.progress>=5&&x.progress<96&&x.path!==location.pathname).sort((a,b)=>b.updated-a.updated)[0];if(!item)return;
    const anchor=document.querySelector('#briefs,.briefs,#atlas,.atlas,main');if(!anchor)return;
    const card=document.createElement('section');card.className='pa-continue261';card.innerHTML=`<small>● ${tx.continue}</small><div><h2></h2><p>${item.progress}% ${tx.read} · ~${item.remaining} ${tx.min} ${tx.left}</p></div><a>${tx.resume} →</a><button type="button" aria-label="${tx.dismiss}">×</button><i><em style="width:${item.progress}%"></em></i><footer>${tx.saved}</footer>`;
    card.querySelector('h2').textContent=item.title;card.querySelector('a').href=item.url+'#continue-reading';card.querySelector('button').onclick=()=>{const db=load();delete db[item.url];save(db);card.remove()};
    anchor.parentNode.insertBefore(card,anchor);
  }
  if(isArticle)track();else showCard();
})();