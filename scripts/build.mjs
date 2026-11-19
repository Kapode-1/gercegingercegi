import { promises as fs } from 'node:fs';
import path from 'node:path';
const root=process.cwd(),dist=path.join(root,'dist');
const skip=new Set(['dist','node_modules','.git']);
async function cp(a,b){await fs.mkdir(b,{recursive:true});for(const e of await fs.readdir(a,{withFileTypes:true})){if(skip.has(e.name))continue;const x=path.join(a,e.name),y=path.join(b,e.name);e.isDirectory()?await cp(x,y):await fs.copyFile(x,y)}}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paras=s=>String(s??'').split(/\n{2,}/).filter(Boolean).map(x=>`<p>${esc(x).replace(/\n/g,'<br>')}</p>`).join('');
const profile=JSON.parse(await fs.readFile('content/profile.json','utf8'));
const pubs=JSON.parse(await fs.readFile('content/publications.json','utf8')).items||[];
await fs.rm(dist,{recursive:true,force:true});await cp(root,dist);
let home=await fs.readFile(path.join(dist,'index.html'),'utf8');
home=home.replace(/<!--PROFILE_INTRO_START-->[\s\S]*?<!--PROFILE_INTRO_END-->/,`<!--PROFILE_INTRO_START-->${esc(profile.intro)}<!--PROFILE_INTRO_END-->`);
home=home.replace(/<!--PROFILE_ABOUT_START-->[\s\S]*?<!--PROFILE_ABOUT_END-->/,`<!--PROFILE_ABOUT_START-->${paras(profile.about)}<!--PROFILE_ABOUT_END-->`);
home=home.replaceAll('mailto:minsinjr@gmail.com',`mailto:${esc(profile.email)}`).replaceAll('minsinjr@gmail.com',esc(profile.email));
// V10 fully automated profile
const jobTitle=profile.job_title||'İklim ve Enerji Politikaları Araştırmacısı';
const affiliation=profile.affiliation||'İÜ Siyaset Bilimi ve Uluslararası İlişkiler';
const portrait=profile.portrait||'/assets/tayyip-minsin-portrait.jpg';
const focus=(profile.focus_areas||['AB İklim Politikaları','Enerji Güvenliği','Ortadoğu Jeopolitiği','Politika Analizi']).slice(0,6);
const socials=[
  ['Instagram',profile.instagram],['LinkedIn',profile.linkedin],['X / Twitter',profile.x],['Objektürk',profile.objekturk]
].filter(([,url])=>url).map(([name,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(name)}</a>`).join('');
home=home.replace(/<title>[\s\S]*?<\/title>/,`<title>Tayyip Minsin | ${esc(jobTitle)}</title>`);
home=home.replace(/<p class="role">[\s\S]*?<\/p>/,`<p class="role">${esc(jobTitle)} <span>|</span> ${esc(affiliation)}</p>`);
home=home.replace(/<p class="lede">[\s\S]*?<\/p>/,`<p class="lede">${esc(profile.intro||'')}</p>`);
home=home.replace(/<div class="manifesto-lead"><p>[\s\S]*?<\/p><h2>[\s\S]*?<\/h2><\/div>/,`<div class="manifesto-lead"><p>${esc(profile.manifesto_kicker||'POLICY / STRATEGY / GOVERNANCE')}</p><h2>${esc(profile.manifesto||'Gücün, ticaretin ve iklimin aynı masada yeniden kurulduğu alanı araştırıyorum.')}</h2></div>`);
home=home.replace(/<div class="portrait-frame"><img[^>]*>/,`<div class="portrait-frame"><img src="${esc(portrait)}" alt="Tayyip Minsin portresi">`);
home=home.replace(/<div class="portrait-note">[\s\S]*?<\/div><\/div><div class="profile-grid">/,`<div class="portrait-note"><b>${esc(profile.location||'İSTANBUL')}</b><span>${esc(profile.portrait_note||'RESEARCH • WRITING • DIPLOMACY')}</span></div></div><div class="profile-grid">`);
const focusHtml=focus.map((x,i)=>`<div><span>${i===focus.length-1?'METHOD':`FOCUS ${String(i+1).padStart(2,'0')}`}</span><b>${esc(x)}</b></div>`).join('');
home=home.replace(/<aside class="profile-data">[\s\S]*?<\/aside>/,`<aside class="profile-data">${focusHtml}</aside>`);
home=home.replace(/<section class="statement">[\s\S]*?<\/section>/,`<section class="statement"><p>“${esc(profile.quote||'İklim politikası yalnızca çevre meselesi değildir. Ticaretin, güvenliğin ve diplomasinin yeniden kurulduğu alandır.')}”</p></section>`);
home=home.replace(/<div class="socials">[\s\S]*?<\/div>/,`<div class="socials">${socials}</div>`);
home=home.replace(/<div class="contact-foot">[\s\S]*?<\/div><\/section>/,`<div class="contact-foot"><span>${esc(profile.cv_status||'CV / PUBLIC VERSION IN PREPARATION')}</span><span>${esc(profile.availability||'AVAILABLE FOR SELECTED COLLABORATIONS')}</span></div></section>`);
if(profile.seo_description)home=home.replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${esc(profile.seo_description)}">`);
const featured=[...pubs].filter(x=>x.featured).sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]||[...pubs].sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0];
if(featured){
  const href=featured.external_url||`yayinlar/${featured.slug}.html`;
  const date=new Date(`${featured.date}T00:00:00`);
  const day=String(date.getDate()).padStart(2,'0');
  const months=['OCA','ŞUB','MAR','NİS','MAY','HAZ','TEM','AĞU','EYL','EKİ','KAS','ARA'];
  const mon=months[date.getMonth()]||'';
  const year=date.getFullYear();
  const featuredCard=`<article class="policy-file" data-tilt><div class="file-top"><span>${esc(featured.type||'ANALİZ')}</span><span>TM–FEATURED</span></div><div class="stamp">${esc(featured.publisher||'PUBLISHED')}</div><div class="file-body"><p class="micro">${esc(featured.region||'STRATEGIC ANALYSIS')}</p><h3>${esc(featured.title)}</h3><p>${esc(featured.summary)}</p></div><div class="file-foot"><span>${day}.${mon}.${year}</span><a href="${esc(href)}"${featured.external_url?' target="_blank" rel="noopener"':''}>DOSYAYI AÇ →</a></div></article>`;
  home=home.replace(/<article class="policy-file"[^>]*>[\s\S]*?<\/article>/,featuredCard);
}
await fs.writeFile(path.join(dist,'index.html'),home);
const sorted=[...pubs].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
const cards=sorted.map((x,i)=>`<a class="archive-card ${x.language==='EN'?'lang-en':''}" href="${esc(x.external_url||`yayinlar/${x.slug}.html`)}"><img src="${esc(x.image||'/assets/policy-atlas.png')}" alt=""><div><span class="code">TM–PUB/${String(i+1).padStart(3,'0')} • ${esc(x.region)}</span><h2>${esc(x.title)}</h2><p>${esc(x.summary)}</p><div class="bottom"><span>${esc(x.date)}</span><span>${esc(x.publisher)} →</span></div></div></a>`).join('');
const archive=`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Yayınlar | Tayyip Minsin</title><meta name="description" content="İklim, enerji, jeopolitik ve diplomasi analizleri."><link rel="stylesheet" href="assets/atlas.css"></head><body class="odap-archive"><header class="nav"><a class="sig" href="index.html"><b>TM</b><i></i><span>POLICY ATLAS</span></a><div class="nav-center"><span>PUBLICATIONS / RESEARCH ARCHIVE</span><span class="live"><i></i> ${sorted.length} FILES</span></div><a class="menu" href="index.html" style="text-decoration:none"><span>ANA SAYFA</span><i></i></a></header><main><section class="archive-hero"><p class="overline">STRATEGIC WRITING / PUBLIC INDEX</p><h1>Analiz <i>Dosyaları</i></h1><div class="archive-intro"><p>İklim politikaları, enerji güvenliği, Ortadoğu ve uluslararası hukuk eksenindeki yayınlar.</p><p>Admin panelinden yayımlanan içerikler bu arşive otomatik yerleşir.</p></div></section><section class="archive-grid">${cards}</section></main></body></html>`;
await fs.writeFile(path.join(dist,'yayinlar.html'),archive);
await fs.mkdir(path.join(dist,'yayinlar'),{recursive:true});
for(const x of sorted){if(x.external_url&&!x.body)continue;const refs=(x.references||[]).map(r=>`<li>${esc(typeof r==='string'?r:r.reference)}</li>`).join('');const img=x.image||'../assets/policy-atlas.png';const page=`<!doctype html><html lang="${x.language==='EN'?'en':'tr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(x.title)} | Tayyip Minsin</title><meta name="description" content="${esc(x.summary)}"><link rel="stylesheet" href="../assets/atlas.css"></head><body class="article-page"><header class="nav"><a class="sig" href="../index.html"><b>TM</b><i></i><span>POLICY ATLAS</span></a></header><main><section class="article-hero"><img src="${esc(img)}" alt=""><div class="article-hero-copy"><a class="crumb" href="../yayinlar.html">YAYINLAR / ${esc(x.publisher)}</a><h1>${esc(x.title)}</h1><div class="article-meta"><span><b>YAYIN</b> ${esc(x.publisher)}</span><span><b>TARİH</b> ${esc(x.date)}</span><span><b>BÖLGE</b> ${esc(x.region)}</span></div></div></section><section class="article-layout"><aside class="article-aside"><div><span>YAZAR</span><b>Tayyip Minsin</b></div><div><span>TÜR</span><b>${esc(x.type)}</b></div></aside><article class="article-body">${paras(x.body)}</article>${refs?`<section class="sources"><h2>Kaynakça</h2><ol>${refs}</ol></section>`:''}</section></main></body></html>`;await fs.writeFile(path.join(dist,'yayinlar',`${x.slug}.html`),page)}
const base='https://tayyip-minsin-policy-atlas.pages.dev';let old=[];try{old=(await fs.readdir(path.join(dist,'odap'))).filter(x=>x.endsWith('.html')).map(x=>'/odap/'+x)}catch{}const dyn=sorted.filter(x=>!x.external_url||x.body).map(x=>`/yayinlar/${x.slug}.html`);const urls=[...new Set(['/','/odap.html','/yayinlar.html',...old,...dyn])];await fs.writeFile(path.join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${base}${u}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${sorted.length} publication records and ${urls.length} URLs.`);

// V9 automatic publication map
const seed=JSON.parse(await fs.readFile('content/map-seed.json','utf8')).regions||[];
const coords={'Türkiye':[54,43],'Libya':[38,64],'Körfez':[74,70],'Suudi Arabistan':[72,72],'Kolombiya':[2,43],'İsrail / Kudüs':[57,59],'Fas':[9,62],'Batı Sahra':[6,72],'Cezayir':[23,61],'Nijer':[28,78],'Çad':[39,81],'İtalya':[34,39],'Suriye':[61,51],'Irak':[66,55],'İran':[75,52],'Mısır':[49,68],'Ürdün':[58,64],'Lübnan':[58,55],'Katar':[74,70],'BAE':[78,72],'Kuveyt':[70,64],'Yunanistan':[45,46],'Brüksel / AB':[25,22],'Panama':[1,49]};
const smap=new Map(seed.map(r=>[r.name,{...r,links:[...(r.links||[])]}]));
for(const p of sorted){if(p.show_on_map===false)continue;for(const name of [p.primary_country,...(p.related_countries||[])].filter(Boolean)){const xy=coords[name]||[50,50],r=smap.get(name)||{name,x:xy[0],y:xy[1],description:p.map_description||p.summary,links:[]};if(name===p.primary_country&&p.map_x!=null)r.x=Number(p.map_x);if(name===p.primary_country&&p.map_y!=null)r.y=Number(p.map_y);if(name===p.primary_country&&p.map_description)r.description=p.map_description;const href=p.external_url||`yayinlar/${p.slug}.html`;if(!r.links.some(x=>x.href===href))r.links.push({title:p.title,href});smap.set(name,r)}}
const regs=[...smap.values()].filter(r=>r.links?.length),slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
const ns=regs.map((r,i)=>`<button class="coverage-node auto-map-node ${i?'':'active'}" data-topic="m-${slug(r.name)}" style="left:${r.x}%;top:${r.y}%"><i></i><span>${esc(r.label||r.name)}</span></button>`).join('');
const ps=regs.map((r,i)=>`<article class="coverage-detail auto-map-panel ${i?'':'active'}" data-panel="m-${slug(r.name)}"><p class="micro">PUBLISHED ANALYSIS / ${esc(r.name)}</p><h3>${esc(r.label||r.name)}</h3><p>${esc(r.description||'İlgili analiz dosyaları.')}</p><div class="coverage-links">${r.links.map(l=>`<a href="${esc(l.href)}">${esc(l.title)} →</a>`).join('')}</div></article>`).join('');
const mapHtml=`<div class="atlas-stage atlas-stage-expanded"><div class="map-frame coverage-map"><img src="assets/policy-atlas.png" alt="Yayın coğrafyası"><div class="map-grid"></div><div class="map-caption"><span>AUTOMATIC PUBLICATION MAP</span><b>${regs.length} ÜLKE / BÖLGE</b></div>${ns}</div><div class="coverage-panel"><div class="coverage-head"><span>REGIONAL INDEX</span><b id="coverage-count">${String(regs[0]?.links.length||0).padStart(2,'0')} DOSYA</b></div>${ps}</div></div>`;
const a0=home.indexOf('<div class="atlas-stage'),b0=home.indexOf('<section id="briefs"',a0);if(a0>=0&&b0>a0){home=home.slice(0,a0)+mapHtml+'\n</section>\n'+home.slice(b0);await fs.writeFile(path.join(dist,'index.html'),home)}

// V11 SEO and social sharing post-processing
const absolute=(u)=>{if(!u)return `${base}/assets/tayyip-minsin-social.jpg`;if(/^https?:\/\//.test(u))return u;return `${base}${u.startsWith('/')?'':'/'}${u}`};
const injectHead=(html,{title,description,canonical,image,type='article',indexable=true,published})=>{
 const cleanTitle=esc(title||'Tayyip Minsin | Policy Atlas');
 const cleanDesc=esc(String(description||'').slice(0,170));
 const canon=esc(canonical);
 const img=esc(absolute(image));
 const robots=indexable===false?'noindex,follow':'index,follow,max-image-preview:large';
 let tags=`<link rel="canonical" href="${canon}"><meta name="robots" content="${robots}"><meta property="og:type" content="${type}"><meta property="og:title" content="${cleanTitle}"><meta property="og:description" content="${cleanDesc}"><meta property="og:url" content="${canon}"><meta property="og:image" content="${img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${cleanTitle}"><meta name="twitter:description" content="${cleanDesc}"><meta name="twitter:image" content="${img}">`;
 if(published)tags+=`<meta property="article:published_time" content="${esc(published)}">`;
 html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${cleanTitle}</title>`);
 html=html.replace('</head>',`${tags}</head>`);
 return html;
};
let finalHome=await fs.readFile(path.join(dist,'index.html'),'utf8');
if(!finalHome.includes('twitter:card')){finalHome=injectHead(finalHome,{title:`Tayyip Minsin | ${profile.job_title||'Policy Atlas'}`,description:profile.seo_description||profile.intro,canonical:`${base}/`,image:profile.social_image||'/assets/tayyip-minsin-social.jpg',type:'website'});await fs.writeFile(path.join(dist,'index.html'),finalHome)}
let finalArchive=await fs.readFile(path.join(dist,'yayinlar.html'),'utf8');
finalArchive=injectHead(finalArchive,{title:'Yayınlar | Tayyip Minsin',description:'İklim politikaları, enerji güvenliği, Ortadoğu jeopolitiği ve diplomasi üzerine analizler.',canonical:`${base}/yayinlar.html`,image:profile.social_image||'/assets/tayyip-minsin-social.jpg',type:'website'});await fs.writeFile(path.join(dist,'yayinlar.html'),finalArchive);
for(const x of sorted){if(x.external_url&&!x.body)continue;const file=path.join(dist,'yayinlar',`${x.slug}.html`);let h=await fs.readFile(file,'utf8');const canonical=x.canonical_url||`${base}/yayinlar/${x.slug}.html`;h=injectHead(h,{title:x.seo_title||`${x.title} | Tayyip Minsin`,description:x.seo_description||x.summary,canonical,image:x.social_image||x.image||profile.social_image,indexable:x.indexable!==false,published:x.date});const ld={"@context":"https://schema.org","@type":"Article","headline":x.title,"description":x.seo_description||x.summary,"datePublished":x.date,"inLanguage":x.language==='EN'?'en':'tr',"author":{"@type":"Person","name":"Tayyip Minsin","url":`${base}/`},"publisher":{"@type":"Organization","name":x.publisher||'Tayyip Minsin Policy Atlas'},"mainEntityOfPage":canonical,"image":[absolute(x.social_image||x.image||profile.social_image)]};h=h.replace('</head>',`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g,'\\u003c')}</script></head>`);await fs.writeFile(file,h)}


// V13 performance and accessibility post-processing
async function optimizeHtmlFileV13(file){
 let h=await fs.readFile(file,'utf8');
 h=h.replaceAll('policy-atlas.png','policy-atlas.webp').replaceAll('tayyip-minsin-portrait.jpg','tayyip-minsin-portrait.webp');
 h=h.replace(/<img class="hero-map"([^>]*?)>/,`<img class="hero-map"$1 width="1600" height="1024" fetchpriority="high" decoding="async">`);
 h=h.replace(/<div class="portrait-frame"><img([^>]*?)>/,`<div class="portrait-frame"><img$1 width="900" height="1200" loading="lazy" decoding="async">`);
 h=h.replace(/<button class="coverage-node auto-map-node ([^"]*)" data-topic="([^"]+)" style="([^"]+)"><i><\/i><span>([^<]+)<\/span><\/button>/g,`<button class="coverage-node auto-map-node $1" data-topic="$2" style="$3" aria-label="$4 bölgesindeki analizleri göster" title="$4"><i aria-hidden="true"></i><span>$4</span></button>`);
 h=h.replace('<script src="assets/atlas.js"></script>','<script src="assets/atlas.js" defer></script>');
 await fs.writeFile(file,h);
}
await optimizeHtmlFileV13(path.join(dist,'index.html'));
for(const name of ['yayinlar.html','odap.html','404.html']){try{await optimizeHtmlFileV13(path.join(dist,name))}catch{}}
for(const dir of ['yayinlar','odap']){try{for(const n of await fs.readdir(path.join(dist,dir)))if(n.endsWith('.html'))await optimizeHtmlFileV13(path.join(dist,dir,n))}catch{}}


// V14 Social Dispatches: automatic X timeline + admin-managed LinkedIn posts
const socialFile=JSON.parse(await fs.readFile(path.join(root,'content/social-dispatches.json'),'utf8'));
const linkedInPosts=(socialFile.items||[]).filter(x=>x.visible!==false).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,6);
const xHandle=(profile.x||'https://x.com/MinsinIR').replace(/\/$/,'');
const extractLinkedInId=(url)=>{const m=String(url||'').match(/activity[-:](\d{10,})|urn:li:(?:activity|share):(\d{10,})/);return m?.[1]||m?.[2]||''};
const linkedInCards=linkedInPosts.map((x,i)=>{const id=extractLinkedInId(x.url);const embed=id?`<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:activity:${id}" title="LinkedIn gönderisi: ${esc(x.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`:`<a class="dispatch-fallback" href="${esc(x.url)}" target="_blank" rel="noopener"><span>LINKEDIN / ${esc(x.date)}</span><h3>${esc(x.title)}</h3><p>${esc(x.summary||'LinkedIn gönderisini aç.')}</p><b>LINKEDIN’DE AÇ ↗</b></a>`;return `<article class="dispatch-card linkedin ${x.featured?'featured':''}">${embed}</article>`}).join('');
const dispatches=`<section id="dispatches" class="dispatches section" data-section="04"><div class="rail"><span>04</span><span>SOCIAL / DISPATCHES</span></div><header class="dispatch-head"><p class="overline">FIELD NOTES / LIVE CHANNELS</p><h2>Güncel<br><i>Notlar</i></h2><p>LinkedIn ve X üzerinden paylaşılan kısa değerlendirmeler, saha notları ve güncel çalışmalar.</p></header><div class="dispatch-grid"><div class="dispatch-column"><div class="dispatch-label"><span>X / LIVE</span><a href="${esc(xHandle)}" target="_blank" rel="noopener">TÜMÜNÜ GÖR ↗</a></div><div class="x-feed-shell"><a class="twitter-timeline" data-theme="dark" data-chrome="noheader nofooter noborders transparent" data-tweet-limit="4" data-dnt="true" href="${esc(xHandle)}">X paylaşımlarını görüntüle</a></div></div><div class="dispatch-column"><div class="dispatch-label"><span>LINKEDIN / SELECTED</span><a href="${esc(profile.linkedin||'https://www.linkedin.com/in/tayyip-minsin')}" target="_blank" rel="noopener">PROFİLİ AÇ ↗</a></div><div class="linkedin-feed">${linkedInCards||'<div class="dispatch-empty"><p>Seçilmiş LinkedIn gönderileri yakında burada.</p></div>'}</div></div></div></section>`;
let dispatchHome=await fs.readFile(path.join(dist,'index.html'),'utf8');
const recordsMarker='<section id="records"';
if(dispatchHome.includes(recordsMarker)&&!dispatchHome.includes('id="dispatches"'))dispatchHome=dispatchHome.replace(recordsMarker,dispatches+'\n'+recordsMarker);
if(!dispatchHome.includes('platform.twitter.com/widgets.js'))dispatchHome=dispatchHome.replace('</body>','<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script></body>');
await fs.writeFile(path.join(dist,'index.html'),dispatchHome);


// V14.1 X timeline compatibility fix
// X profile links are normalized to twitter.com because widgets.js still resolves profile timelines through the legacy embed endpoint.
let xFixed=await fs.readFile(path.join(dist,'index.html'),'utf8');
const configuredX=profile.x||'https://x.com/MinsinIR';
const xUser=(configuredX.match(/(?:x\.com|twitter\.com)\/([^/?#]+)/i)?.[1]||'MinsinIR').replace(/^@/,'');
const legacyTimeline=`https://twitter.com/${xUser}`;
xFixed=xFixed.replace(/<a class="twitter-timeline"[\s\S]*?<\/a>/,`<a class="twitter-timeline" data-theme="dark" data-chrome="noheader nofooter noborders transparent" data-tweet-limit="4" data-dnt="true" href="${legacyTimeline}">Posts by @${xUser}</a>`);
xFixed=xFixed.replace(/<script async src="https:\/\/platform\.twitter\.com\/widgets\.js"[^>]*><\/script>/g,'');
xFixed=xFixed.replace('</body>',`<script>window.twttr=(function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],t=window.twttr||{};if(d.getElementById(id))return t;js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";js.async=true;fjs.parentNode.insertBefore(js,fjs);t._e=[];t.ready=function(f){t._e.push(f)};return t}(document,"script","twitter-wjs"));</script></body>`);
await fs.writeFile(path.join(dist,'index.html'),xFixed);


// V14.3 LinkedIn-only Social Dispatches
let linkedinOnly=await fs.readFile(path.join(dist,'index.html'),'utf8');
const socialData=(socialFile.items||[]).filter(x=>x.visible!==false&&(!x.platform||x.platform==='LinkedIn')).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,8);
const liCard=x=>`<article class="dispatch-card linkedin"><a class="dispatch-fallback" href="${esc(x.url)}" target="_blank" rel="noopener"><span>LINKEDIN / ${esc(x.date||'')}</span><h3>${esc(x.title||'LinkedIn gönderisi')}</h3>${x.summary?`<p>${esc(x.summary)}</p>`:''}<b>LINKEDIN’DE AÇ ↗</b></a></article>`;
const linkedinSection=`<section id="dispatches" class="dispatches section linkedin-only" data-section="04"><div class="rail"><span>04</span><span>SOCIAL / DISPATCHES</span></div><header class="dispatch-head"><p class="overline">FIELD NOTES / LINKEDIN</p><h2>Güncel<br><i>Notlar</i></h2><p>LinkedIn üzerinden paylaşılan kısa değerlendirmeler, saha notları ve güncel çalışmalar.</p></header><div class="linkedin-only-head"><span>LINKEDIN / SELECTED</span><a href="${esc(profile.linkedin||'https://www.linkedin.com/in/tayyip-minsin')}" target="_blank" rel="noopener">PROFİLİ AÇ ↗</a></div><div class="linkedin-only-grid">${socialData.length?socialData.map(liCard).join(''):'<div class="dispatch-empty"><p>Seçilmiş LinkedIn gönderileri yakında burada.</p></div>'}</div></section>`;
linkedinOnly=linkedinOnly.replace(/<section id="dispatches"[\s\S]*?<section id="records"/,linkedinSection+'\n<section id="records"');
linkedinOnly=linkedinOnly.replace(/<script[^>]*platform\.twitter\.com\/widgets\.js[\s\S]*?<\/script>/g,'').replace(/<script>window\.twttr=[\s\S]*?<\/script>/g,'');
await fs.writeFile(path.join(dist,'index.html'),linkedinOnly);


// V15 Contact form: Formspree delivery + Cloudflare Turnstile
let contactHtml=await fs.readFile(path.join(dist,'index.html'),'utf8');
const contactEnabled=profile.contact_form_enabled===true&&profile.formspree_form_id&&profile.turnstile_site_key;
const endpoint=profile.formspree_form_id?`https://formspree.io/f/${String(profile.formspree_form_id).trim()}`:'';
const formMarkup=contactEnabled?`<div class="contact-form-wrap"><form id="policy-contact-form" class="contact-form" action="${esc(endpoint)}" method="POST"><div class="form-grid"><label><span>AD SOYAD *</span><input type="text" name="name" autocomplete="name" maxlength="100" required></label><label><span>E-POSTA *</span><input type="email" name="email" autocomplete="email" maxlength="160" required></label><label><span>KURUM</span><input type="text" name="organization" autocomplete="organization" maxlength="160"></label><label><span>İLETİŞİM NEDENİ *</span><select name="subject" required><option value="">Seçiniz</option><option>Araştırma iş birliği</option><option>Yayın / dosya teklifi</option><option>Etkinlik veya konuşmacı daveti</option><option>Basın görüşü</option><option>Cemre çalışmaları</option><option>Diğer</option></select></label></div><label class="form-message"><span>MESAJ *</span><textarea name="message" maxlength="3000" rows="7" required></textarea></label><input class="contact-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><input type="hidden" name="_subject" value="Policy Atlas iletişim formu"><input type="hidden" name="page" value="${base}/"><label class="privacy-check"><input type="checkbox" name="privacy_consent" value="accepted" required><span>${esc(profile.contact_privacy_text||'Paylaştığım bilgilerin yalnızca bu iletişim talebine yanıt verilmesi amacıyla işlenmesini kabul ediyorum.')}</span></label><div class="cf-turnstile" data-sitekey="${esc(profile.turnstile_site_key)}" data-theme="dark"></div><div class="form-actions"><button type="submit">MESAJI GÖNDER ↗</button><p id="contact-status" role="status" aria-live="polite"></p></div></form></div>`:`<div class="contact-form-disabled"><p>İletişim formu yapılandırılıyor. Şimdilik e-posta üzerinden ulaşabilirsin.</p></div>`;
contactHtml=contactHtml.replace(/<a class="mail"[\s\S]*?<\/a><div class="socials">/,`<a class="mail" href="mailto:${esc(profile.email||'minsinjr@gmail.com')}"><span>${esc(profile.email||'minsinjr@gmail.com')}</span><b>↗</b></a>${formMarkup}<div class="socials">`);
if(contactEnabled&&!contactHtml.includes('challenges.cloudflare.com/turnstile'))contactHtml=contactHtml.replace('</head>','<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script></head>');
if(contactEnabled)contactHtml=contactHtml.replace('</body>',`<script>(()=>{const f=document.getElementById('policy-contact-form'),s=document.getElementById('contact-status');if(!f)return;f.addEventListener('submit',async e=>{e.preventDefault();if(f.website.value)return;s.textContent='Gönderiliyor…';const b=f.querySelector('button[type=submit]');b.disabled=true;try{const r=await fetch(f.action,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}});if(r.ok){f.reset();if(window.turnstile)turnstile.reset();s.textContent=${JSON.stringify(profile.contact_success_message||'Mesajın ulaştı. En kısa sürede dönüş yapacağım.')};}else{const j=await r.json().catch(()=>({}));s.textContent=j?.errors?.map(x=>x.message).join(', ')||'Mesaj gönderilemedi. Lütfen daha sonra yeniden dene.'}}catch{s.textContent='Bağlantı kurulamadı. Lütfen e-posta üzerinden ulaş.'}finally{b.disabled=false}})})();</script></body>`);
await fs.writeFile(path.join(dist,'index.html'),contactHtml);


// V18.4 Build a complete AI index from static ODAP articles and admin publications
const stripTags=s=>String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const pick=(html,re)=>html.match(re)?.[1]?.trim()||'';
const aiItems=[...sorted];
try{
 const odapDir=path.join(dist,'odap');
 for(const file of await fs.readdir(odapDir)){
  if(!file.endsWith('.html'))continue;
  const html=await fs.readFile(path.join(odapDir,file),'utf8');
  const title=stripTags(pick(html,/<h1[^>]*>([\s\S]*?)<\/h1>/i)||pick(html,/<title>([\s\S]*?)<\/title>/i));
  const description=pick(html,/<meta\s+name="description"\s+content="([^"]*)"/i)||pick(html,/<meta\s+content="([^"]*)"\s+name="description"/i);
  const article=pick(html,/<article[^>]*class="[^"]*(?:article-body|odap-article-body)[^"]*"[^>]*>([\s\S]*?)<\/article>/i)||pick(html,/<main[^>]*>([\s\S]*?)<\/main>/i);
  const body=stripTags(article).slice(0,24000);
  const lang=(html.match(/<html[^>]+lang="([^"]+)"/i)?.[1]||'tr').toUpperCase().startsWith('EN')?'EN':'TR';
  const canonical=pick(html,/<link\s+rel="canonical"\s+href="([^"]+)"/i)||`${base}/odap/${file}`;
  if(title&&body)aiItems.push({title,slug:file.replace(/\.html$/,''),publisher:'ODAP',type:'Analiz',language:lang,region:'Policy Atlas / ODAP',summary:description||body.slice(0,420),body,external_url:canonical});
 }
}catch(e){console.warn('ODAP AI index warning:',e.message)}
await fs.mkdir(path.join(dist,'content'),{recursive:true});
await fs.writeFile(path.join(dist,'content','ai-index.json'),JSON.stringify({generated_at:new Date().toISOString(),count:aiItems.length,items:aiItems},null,2));
console.log(`AI index built with ${aiItems.length} records.`);


// V18.6 Homepage AI launch section
let aiLaunchHome=await fs.readFile(path.join(dist,'index.html'),'utf8');
const aiLaunch=`<section id="policy-atlas-ai" class="ai-launch section" data-section="05"><div class="rail"><span>05</span><span>AI / RESEARCH ASSISTANT</span></div><div class="ai-launch-copy"><p class="overline">SOURCE-GROUNDED RESEARCH ASSISTANT / BETA</p><h2>Atlas’a<br><i>Sor</i></h2><p>Policy Atlas arşivindeki analizleri karşılaştır, ilgili yayınları keşfet veya canlı web kaynaklarıyla birlikte güncel bağlamı araştır.</p><div class="ai-launch-actions"><a href="/ask.html?mode=atlas">YALNIZCA ATLAS’TA ARA →</a><a href="/ask.html?mode=web">ATLAS + WEB →</a></div><div class="ai-launch-chips"><span>KAYNAKLI YANITLAR</span><span>10+ YAYIN</span><span>TR / EN</span><span>BETA</span></div></div><aside class="ai-launch-terminal"><div class="terminal-top"><span>POLICY ATLAS AI</span><i></i><b>ONLINE</b></div><p class="terminal-question">“Libya analizlerini karşılaştır.”</p><div class="terminal-lines"><span></span><span></span><span></span></div><p class="terminal-source">[K1] ODAP &nbsp; [K2] POLICY ATLAS &nbsp; [W1] WEB</p><a href="/ask.html">ARAŞTIRMA ASİSTANINI AÇ ↗</a></aside></section>`;
const contactMarker='<section id="contact"';
if(aiLaunchHome.includes(contactMarker)&&!aiLaunchHome.includes('id="policy-atlas-ai"'))aiLaunchHome=aiLaunchHome.replace(contactMarker,aiLaunch+'\n'+contactMarker);
aiLaunchHome=aiLaunchHome.replace(/<a href="\/ask\.html"[^>]*>[^<]*<\/a>/g,'');
await fs.writeFile(path.join(dist,'index.html'),aiLaunchHome);



// V19.1 Mobile cache-busting for CSS and JavaScript
// A fresh version query is added to local CSS/JS references on every build.
const assetVersion=Date.now().toString(36);
async function bustHtmlAssets(file){
  let html=await fs.readFile(file,'utf8');
  html=html.replace(/(["'])(\.\.\/|\/|)assets\/atlas\.css(?:\?v=[^"']*)?\1/g,(_,q,prefix)=>`${q}${prefix}assets/atlas.css?v=${assetVersion}${q}`);
  html=html.replace(/(["'])(\.\.\/|\/|)assets\/atlas\.js(?:\?v=[^"']*)?\1/g,(_,q,prefix)=>`${q}${prefix}assets/atlas.js?v=${assetVersion}${q}`);
  await fs.writeFile(file,html);
}
async function walkHtml(dir){
  for(const entry of await fs.readdir(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())await walkHtml(full);
    else if(entry.name.endsWith('.html'))await bustHtmlAssets(full);
  }
}
await walkHtml(dist);
console.log(`Asset cache version: ${assetVersion}`);

// V19 - Dosyayı 60 Saniyede Anla
const plainWords=s=>String(s||'').replace(/[#*_>`~\[\]()]/g,' ').replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
for(const publication of sorted){
  if(publication.external_url&&!publication.body) continue;
  const articleFile=path.join(dist,'yayinlar',`${publication.slug}.html`);
  try{
    let articleHtml=await fs.readFile(articleFile,'utf8');
    if(articleHtml.includes('class="sixty-summary"')) continue;
    const wordCount=plainWords(publication.body).length;
    const readingTime=Math.max(1,Math.ceil(wordCount/(publication.language==='EN'?220:200)));
    const actors=Array.isArray(publication.key_actors)?publication.key_actors:[];
    const concepts=Array.isArray(publication.key_concepts)?publication.key_concepts:[];
    const hasSummary=publication.quick_summary||publication.what_happened||publication.why_it_matters||publication.watch_next||actors.length||concepts.length;
    if(!hasSummary) continue;
    const row=(label,value,cls='')=>value?`<div class="sixty-row ${cls}"><span>${label}</span><p>${esc(value)}</p></div>`:'';
    const pills=(label,items)=>items.length?`<div class="sixty-row sixty-pills"><span>${label}</span><div>${items.map(x=>`<b>${esc(typeof x==='string'?x:(x.actor||x.concept||''))}</b>`).join('')}</div></div>`:'';
    const box=`<section class="sixty-summary" aria-labelledby="sixty-${esc(publication.slug)}"><header><div><p class="micro">EXECUTIVE BRIEF / 60 SECONDS</p><h2 id="sixty-${esc(publication.slug)}">Dosyayı 60 Saniyede Anla</h2></div><div class="sixty-meta"><span><b>${readingTime}</b> DK OKUMA</span><span><b>${esc(publication.depth||'ANALİZ')}</b> DOSYA DERİNLİĞİ</span><span><b>${esc(publication.language||'TR')}</b> DİL</span></div></header>${publication.quick_summary?`<p class="sixty-lead">${esc(publication.quick_summary)}</p>`:''}<div class="sixty-grid">${row('NE OLDU?',publication.what_happened)}${row('NEDEN ÖNEMLİ?',publication.why_it_matters)}${row('TAKİP EDİLMESİ GEREKEN',publication.watch_next,'sixty-wide')}${pills('ANA AKTÖRLER',actors)}${pills('TEMEL KAVRAMLAR',concepts)}</div><a class="sixty-read" href="#full-analysis">TAM ANALİZE GEÇ ↓</a></section>`;
    articleHtml=articleHtml.replace('<section class="article-layout">','<section class="article-layout" id="full-analysis">');
    articleHtml=articleHtml.replace('<section class="article-layout" id="full-analysis">',box+'<section class="article-layout" id="full-analysis">');
    await fs.writeFile(articleFile,articleHtml);
  }catch(e){console.warn('60-second summary warning:',publication.slug,e.message)}
}
// Public launch: ensure AI is discoverable in homepage menu.
let launchNav=await fs.readFile(path.join(dist,'index.html'),'utf8');
if(!launchNav.includes('href="ask.html"')&&!launchNav.includes('href="/ask.html"')){
  launchNav=launchNav.replace('</nav>',`<a href="/ask.html"><b>AI</b>Atlas’a Sor</a></nav>`);
  await fs.writeFile(path.join(dist,'index.html'),launchNav);
}


// V20 Dynamic Publication Intelligence Filters
try {
  const archiveFile=path.join(dist,'yayinlar.html');
  let archiveHtml=await fs.readFile(archiveFile,'utf8');
  const filterItems=[...sorted];
  let cardIndex=0;
  archiveHtml=archiveHtml.replace(/<a class="archive-card ([^"]*)" href="([^"]+)">/g,(match,classes,href)=>{
    const item=filterItems[cardIndex++]||{};
    const year=String(item.date||'').slice(0,4)||'Belirsiz';
    const topics=(item.topics||item.key_concepts||[]).map(x=>typeof x==='string'?x:(x.concept||x.topic||'')).filter(Boolean);
    const search=[item.title,item.summary,item.publisher,item.type,item.region,item.language,year,...topics,...(item.key_actors||[]).map(x=>typeof x==='string'?x:(x.actor||''))].join(' ').toLocaleLowerCase('tr');
    return `<a class="archive-card ${classes}" href="${href}" data-title="${esc(item.title||'')}" data-publisher="${esc(item.publisher||'Diğer')}" data-type="${esc(item.type||'Diğer')}" data-language="${esc(item.language||'TR')}" data-region="${esc(item.region||'Diğer')}" data-year="${esc(year)}" data-topics="${esc(topics.join('|'))}" data-search="${esc(search)}">`;
  });
  const unique=key=>[...new Set(filterItems.map(x=>String(x[key]||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));
  const years=[...new Set(filterItems.map(x=>String(x.date||'').slice(0,4)).filter(Boolean))].sort().reverse();
  const topics=[...new Set(filterItems.flatMap(x=>(x.topics||x.key_concepts||[]).map(v=>typeof v==='string'?v:(v.concept||v.topic||'')).filter(Boolean)))].sort((a,b)=>a.localeCompare(b,'tr'));
  const option=(value,label=value)=>`<option value="${esc(value)}">${esc(label)}</option>`;
  const chips=topics.slice(0,12).map(x=>`<button type="button" class="filter-chip" data-topic="${esc(x)}">${esc(x)}</button>`).join('');
  const filterPanel=`<section class="publication-filters" aria-label="Yayın filtreleri"><div class="filter-command"><label for="publication-search">ARAŞTIRMA ARŞİVİNDE ARA</label><div class="filter-search-row"><input id="publication-search" type="search" autocomplete="off" placeholder="Başlık, kavram, ülke veya aktör…"><button type="button" id="filter-reset">TEMİZLE</button></div><div class="filter-status"><span id="filter-count">${filterItems.length} DOSYA</span><span id="filter-summary">TÜM ARŞİV</span></div></div><div class="filter-controls"><label>YAYINCI<select id="filter-publisher"><option value="">Tümü</option>${unique('publisher').map(x=>option(x)).join('')}</select></label><label>FORMAT<select id="filter-type"><option value="">Tümü</option>${unique('type').map(x=>option(x)).join('')}</select></label><label>DİL<select id="filter-language"><option value="">Tümü</option>${unique('language').map(x=>option(x)).join('')}</select></label><label>YIL<select id="filter-year"><option value="">Tümü</option>${years.map(x=>option(x)).join('')}</select></label><label>SIRALA<select id="filter-sort"><option value="newest">En yeni</option><option value="oldest">En eski</option><option value="az">A–Z</option><option value="za">Z–A</option></select></label></div>${chips?`<div class="filter-topics"><span>KAVRAM RADARI</span><div>${chips}</div></div>`:''}<div class="active-filter-strip" id="active-filter-strip" aria-live="polite"></div></section>`;
  archiveHtml=archiveHtml.replace('<section class="archive-grid">',filterPanel+'<section class="archive-grid" id="publication-grid">');
  archiveHtml=archiveHtml.replace('</main>','<div class="filter-empty" id="filter-empty" hidden><b>0 DOSYA</b><p>Bu kombinasyonda yayın bulunamadı. Filtreleri temizleyerek yeniden deneyin.</p></div></main>');
  if(!archiveHtml.includes('archive-filters.js'))archiveHtml=archiveHtml.replace('</body>','<script src="assets/archive-filters.js" defer></script></body>');
  await fs.writeFile(archiveFile,archiveHtml);
} catch (e) { console.warn('V20 filter build warning:',e.message); }


// V20.1 Unified Publications Archive: admin publications + ODAP
try {
  const indexPath=path.join(dist,'content','ai-index.json');
  const archivePath=path.join(dist,'yayinlar.html');
  const aiIndex=JSON.parse(await fs.readFile(indexPath,'utf8'));
  const allItems=(aiIndex.items||[]).filter(x=>x&&x.title);
  const seen=new Set();
  const unified=allItems.filter(x=>{const key=String(x.external_url||x.slug||x.title).toLocaleLowerCase('tr');if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(a.title).localeCompare(String(b.title),'tr'));
  const card=(x,i)=>{
    const href=x.external_url||`yayinlar/${x.slug}.html`;
    const year=String(x.date||'').slice(0,4)||'Belirsiz';
    const topics=(x.topics||x.key_concepts||[]).map(v=>typeof v==='string'?v:(v.concept||v.topic||'')).filter(Boolean);
    const actors=(x.key_actors||[]).map(v=>typeof v==='string'?v:(v.actor||'')).filter(Boolean);
    const search=[x.title,x.summary,x.publisher,x.type,x.region,x.language,year,...topics,...actors].join(' ').toLocaleLowerCase('tr');
    const image=x.image||'/assets/policy-atlas.webp';
    return `<a class="archive-card ${x.language==='EN'?'lang-en':''}" href="${esc(href)}" data-title="${esc(x.title)}" data-publisher="${esc(x.publisher||'Policy Atlas')}" data-type="${esc(x.type||'Analiz')}" data-language="${esc(x.language||'TR')}" data-region="${esc(x.region||'Diğer')}" data-year="${esc(year)}" data-topics="${esc(topics.join('|'))}" data-search="${esc(search)}"><img src="${esc(image)}" alt="" loading="lazy" decoding="async"><div><span class="code">TM–PUB/${String(i+1).padStart(3,'0')} • ${esc(x.region||'POLICY ATLAS')}</span><h2>${esc(x.title)}</h2><p>${esc(x.summary||'')}</p><div class="bottom"><span>${esc(x.date||year)}</span><span>${esc(x.publisher||'Policy Atlas')} →</span></div></div></a>`;
  };
  let archive=await fs.readFile(archivePath,'utf8');
  archive=archive.replace(/<section class="archive-grid" id="publication-grid">[\s\S]*?<\/section>/,`<section class="archive-grid" id="publication-grid">${unified.map(card).join('')}</section>`);
  archive=archive.replace(/<span class="live"><i><\/i>\s*\d+ FILES<\/span>/,`<span class="live"><i></i> ${unified.length} FILES</span>`);
  await fs.writeFile(archivePath,archive);
  let home=await fs.readFile(path.join(dist,'index.html'),'utf8');
  home=home.replace(/href="odap\.html"/g,'href="yayinlar.html"').replace(/href="\/odap\.html"/g,'href="/yayinlar.html"');
  await fs.writeFile(path.join(dist,'index.html'),home);
  console.log(`Unified publication archive built with ${unified.length} records.`);
} catch(e) { console.warn('Unified archive warning:',e.message); }
