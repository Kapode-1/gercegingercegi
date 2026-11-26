(() => {
  'use strict';
  const KEY='policyAtlas.readingProgress.v1';
  const ARTICLE_PATH_RE=/(?:\/yayinlar\/|\/odap\/|\/tr\/yayinlar\/|\/en\/publications\/).+\.html$/i;
  const isArticle=ARTICLE_PATH_RE.test(location.pathname);
  const lang=(document.documentElement.lang||'tr').toLowerCase().startsWith('en')?'en':'tr';
  const t=lang==='en'?{
    continue:'Continue where you left off', read:'read', left:'left', complete:'Completed', resume:'Resume article', dismiss:'Dismiss', updated:'Reading position saved on this device', min:'min'
  }:{
    continue:'Kaldığın Yerden Devam Et', read:'okundu', left:'kaldı', complete:'Tamamlandı', resume:'Yazıya devam et', dismiss:'Kapat', updated:'Okuma konumu bu cihazda saklandı', min:'dk'
  };
  const safeParse=(v,f)=>{try{return JSON.parse(v)}catch{return f}};
  const load=()=>safeParse(localStorage.getItem(KEY),{});
  const save=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch{}};
  const strip=s=>(s||'').replace(/\s+/g,' ').trim();
  const articleRoot=()=>document.querySelector('#full-analysis, .article-body, .article-content, .article-layout, article main, main article, article');
  const title=()=>strip(document.querySelector('h1')?.textContent||document.title.split('|')[0]);
  const canonical=()=>document.querySelector('link[rel="canonical"]')?.href||location.href.split('#')[0];
  const textWords=el=>strip(el?.innerText).split(/\s+/).filter(Boolean).length;
  const remainingMinutes=(el,p)=>Math.max(1,Math.ceil((textWords(el)*(1-p))/210));
  const pct=(root)=>{
    const r=root.getBoundingClientRect();
    const start=scrollY+r.top;
    const end=start+root.offsetHeight-innerHeight*.55;
    if(end<=start) return 1;
    return Math.max(0,Math.min(1,(scrollY-start)/(end-start)));
  };
  const renderBar=(root)=>{
    if(document.querySelector('.pa-progress26')) return;
    const bar=document.createElement('aside');
    bar.className='pa-progress26';
    bar.setAttribute('aria-live','polite');
    bar.innerHTML='<div class="pa-progress26__track"><i></i></div><div class="pa-progress26__meta"><span></span><b></b></div>';
    root.parentNode.insertBefore(bar,root);
    const update=()=>{
      const p=pct(root), percent=Math.round(p*100), mins=remainingMinutes(root,p);
      bar.querySelector('i').style.width=percent+'%';
      bar.querySelector('span').textContent=percent+'% '+t.read;
      bar.querySelector('b').textContent=p>=.98?t.complete:`~ ${mins} ${t.min} ${t.left}`;
    };
    update();
    addEventListener('scroll',update,{passive:true});
  };
  const track=()=>{
    const root=articleRoot(); if(!root) return;
    renderBar(root);
    let timer, last=0;
    const commit=()=>{
      const p=pct(root), percent=Math.round(p*100);
      if(percent<3) return;
      const db=load();
      const url=canonical();
      db[url]={url,path:location.pathname,title:title(),lang,progress:percent,scrollY:Math.round(scrollY),remaining:remainingMinutes(root,p),updated:Date.now()};
      const entries=Object.entries(db).sort((a,b)=>b[1].updated-a[1].updated).slice(0,20);
      save(Object.fromEntries(entries));
      last=Date.now();
    };
    addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(commit,450)},{passive:true});
    addEventListener('pagehide',commit);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')commit()});
    const saved=load()[canonical()];
    if(saved && location.hash==='#continue-reading' && saved.scrollY>80){
      requestAnimationFrame(()=>scrollTo({top:saved.scrollY,behavior:'smooth'}));
    }
  };
  const candidate=()=>Object.values(load()).filter(x=>x.progress>=5&&x.progress<96&&x.path!==location.pathname).sort((a,b)=>b.updated-a.updated)[0];
  const injectHomeCard=()=>{
    const item=candidate(); if(!item) return;
    if(document.querySelector('.pa-continue26')) return;
    const host=document.querySelector('#briefs, .briefs, main'); if(!host) return;
    const card=document.createElement('section');
    card.className='pa-continue26';
    card.innerHTML=`<div class="pa-continue26__signal"><span></span>${t.continue}</div><div class="pa-continue26__body"><div><small>${item.progress}% ${t.read} · ~${item.remaining} ${t.min} ${t.left}</small><h2></h2></div><a></a><button type="button" aria-label="${t.dismiss}">×</button></div><div class="pa-continue26__bar"><i style="width:${item.progress}%"></i></div><p>${t.updated}</p>`;
    card.querySelector('h2').textContent=item.title;
    const a=card.querySelector('a'); a.href=item.url+'#continue-reading'; a.textContent=t.resume+' →';
    card.querySelector('button').onclick=()=>{const db=load();delete db[item.url];save(db);card.remove()};
    host.parentNode.insertBefore(card,host);
  };
  if(isArticle) track(); else injectHomeCard();
})();
