(() => {
  'use strict';

  const lang = (document.documentElement.lang || 'tr').toLowerCase().startsWith('en') ? 'en' : 'tr';
  const TEXT = lang === 'en' ? {
    eyebrow: 'READING ROUTE / 03 STOPS',
    title: 'Continue the file',
    intro: 'Three directions selected automatically from the Policy Atlas archive.',
    same: 'Continue in the same file',
    lens: 'Change the analytical lens',
    geo: 'Expand the geography',
    open: 'Continue the route',
    min: 'min read',
    empty: 'No related route could be generated yet.'
  } : {
    eyebrow: 'OKUMA ROTASI / 03 DURAK',
    title: 'Dosyayı sürdür',
    intro: 'Policy Atlas arşivinden otomatik seçilen üç farklı devam yönü.',
    same: 'Aynı dosyada devam et',
    lens: 'Analitik merceği değiştir',
    geo: 'Coğrafyayı genişlet',
    open: 'Rotaya devam et',
    min: 'dk okuma',
    empty: 'Henüz güçlü bir okuma rotası üretilemedi.'
  };

  const articlePath = /\/(?:yayinlar|odap|publications)\/[^/]+(?:\.html)?$/i.test(location.pathname);
  if (!articlePath || document.querySelector('.pa-route27')) return;

  const norm = value => String(value || '').toLocaleLowerCase('tr-TR').replace(/[^a-z0-9çğıöşü\s-]/gi, ' ').replace(/\s+/g, ' ').trim();
  const arr = value => Array.isArray(value) ? value : value ? [value] : [];
  const tokens = value => new Set(norm(value).split(' ').filter(x => x.length > 2));
  const intersection = (a,b) => [...a].filter(x => b.has(x));
  const slugFrom = value => decodeURIComponent(String(value || '').split('/').filter(Boolean).pop() || '').replace(/\.html$/i,'');
  const currentSlug = slugFrom(location.pathname);
  const currentCanonical = document.querySelector('link[rel="canonical"]')?.href || location.href.split('#')[0];

  function readingMinutes(item){
    const count = norm(item.body || item.summary || '').split(' ').filter(Boolean).length;
    return Math.max(1, Math.ceil(count / (String(item.language || '').toUpperCase() === 'EN' ? 220 : 200)));
  }

  function itemUrl(item){
    if (item.external_url) return item.external_url;
    const slug = item.slug || '';
    return `${location.origin}/${String(item.language || '').toUpperCase()==='EN'?'en/publications':'yayinlar'}/${slug}.html`;
  }

  function fieldSet(item, fields){
    return new Set(fields.flatMap(field => arr(item[field]).flatMap(v => [...tokens(v)])));
  }

  function score(base, item){
    const sameCountry = norm(base.primary_country) && norm(base.primary_country) === norm(item.primary_country);
    const sameRegion = norm(base.region) && (norm(base.region).includes(norm(item.region)) || norm(item.region).includes(norm(base.region)));
    const concepts = intersection(fieldSet(base,['concepts','key_concepts','tags']), fieldSet(item,['concepts','key_concepts','tags'])).length;
    const actors = intersection(fieldSet(base,['actors','key_actors']), fieldSet(item,['actors','key_actors'])).length;
    const themes = intersection(fieldSet(base,['topics','tags','type']), fieldSet(item,['topics','tags','type'])).length;
    const body = intersection(tokens(`${base.title} ${base.summary}`), tokens(`${item.title} ${item.summary}`)).length;
    return (sameCountry?6:0)+(sameRegion?5:0)+Math.min(concepts,3)*4+Math.min(actors,3)*4+Math.min(themes,3)*3+Math.min(body,5)+(norm(base.language)===norm(item.language)?2:0)+(norm(base.publisher)===norm(item.publisher)?1:0);
  }

  function pickRoutes(base, candidates){
    const ranked = candidates.map(item => ({item, score:score(base,item)})).sort((a,b)=>b.score-a.score);
    const used = new Set();
    const pick = predicate => {
      const found = ranked.find(x => !used.has(x.item.slug) && predicate(x.item,x.score));
      if(found) used.add(found.item.slug);
      return found?.item;
    };
    const same = pick((item,s) => s>0 && (norm(item.primary_country)===norm(base.primary_country) || norm(item.region).includes(norm(base.primary_country)) || norm(base.region).includes(norm(item.primary_country))));
    const lens = pick((item,s) => s>0 && norm(item.type)!==norm(base.type));
    const geo = pick((item,s) => s>0 && norm(item.primary_country)!==norm(base.primary_country));
    const fallback = () => pick((item,s)=>s>0);
    return [same||fallback(), lens||fallback(), geo||fallback()].filter(Boolean);
  }

  function mount(routes){
    if(!routes.length) return;
    const labels=[TEXT.same,TEXT.lens,TEXT.geo];
    const section=document.createElement('section');
    section.className='pa-route27';
    section.innerHTML=`<header><small>${TEXT.eyebrow}</small><h2>${TEXT.title}</h2><p>${TEXT.intro}</p></header><div class="pa-route27__line" aria-hidden="true"></div><div class="pa-route27__stops"></div>`;
    const wrap=section.querySelector('.pa-route27__stops');
    routes.forEach((item,index)=>{
      const article=document.createElement('article');
      article.className='pa-route27__stop';
      article.innerHTML=`<div class="pa-route27__node"><b>${String(index+1).padStart(2,'0')}</b><i></i></div><div class="pa-route27__content"><small></small><h3></h3><p></p><div><span></span><span></span></div><a></a></div>`;
      article.querySelector('.pa-route27__content>small').textContent=labels[index]||TEXT.same;
      article.querySelector('h3').textContent=item.title;
      article.querySelector('p').textContent=item.summary || '';
      const meta=article.querySelectorAll('.pa-route27__content>div span');
      meta[0].textContent=(item.publisher||'Policy Atlas').toUpperCase();
      meta[1].textContent=`${readingMinutes(item)} ${TEXT.min}`;
      const link=article.querySelector('a'); link.href=itemUrl(item); link.textContent=`${TEXT.open} →`;
      wrap.appendChild(article);
    });
    const root=document.querySelector('#full-analysis,.article-body,.article-content,.article-layout,.odap-article,.publication-body,[data-article-body],main article,article');
    const citation=document.querySelector('.citation-module,.cite-this,.academic-reference');
    if(citation) citation.parentNode.insertBefore(section,citation);
    else if(root) root.insertAdjacentElement('afterend',section);
    else document.querySelector('main')?.appendChild(section);
  }

  fetch('/content/ai-index.json',{headers:{Accept:'application/json'}})
    .then(r=>{if(!r.ok) throw new Error('index'); return r.json()})
    .then(data=>{
      const items=Array.isArray(data)?data:(data.items||[]);
      const base=items.find(item=>item.slug===currentSlug || itemUrl(item)===currentCanonical || slugFrom(item.external_url)===currentSlug);
      if(!base) return;
      const candidates=items.filter(item=>item.slug!==base.slug && item.title && itemUrl(item)!==currentCanonical);
      mount(pickRoutes(base,candidates));
    })
    .catch(()=>{});
})();