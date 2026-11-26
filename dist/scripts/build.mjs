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
const base='https://tayyipminsin.com.tr';let old=[];try{old=(await fs.readdir(path.join(dist,'odap'))).filter(x=>x.endsWith('.html')).map(x=>'/odap/'+x)}catch{}const dyn=sorted.filter(x=>!x.external_url||x.body).map(x=>`/yayinlar/${x.slug}.html`);const urls=[...new Set(['/','/odap.html','/yayinlar.html',...old,...dyn])];await fs.writeFile(path.join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${base}${u}</loc></url>`).join('')}</urlset>`);
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


// V21 Policy Brief PDF Export - browser-native, branded and data-driven
const pdfEsc=s=>esc(String(s||''));
const pdfPlain=s=>String(s||'').replace(/[#*_>`~\[\]()]/g,' ').replace(/\s+/g,' ').trim();
const pdfDate=s=>{try{return new Intl.DateTimeFormat('tr-TR',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(`${s}T00:00:00`))}catch{return s||''}};
for(const publication of sorted){
  if(publication.external_url&&!publication.body) continue;
  const articleFile=path.join(dist,'yayinlar',`${publication.slug}.html`);
  try{
    let html=await fs.readFile(articleFile,'utf8');
    if(html.includes('id="policy-brief-print"')) continue;
    const words=pdfPlain(publication.body).split(' ').filter(Boolean);
    const readingTime=Math.max(1,Math.ceil(words.length/(publication.language==='EN'?220:200)));
    const actors=(publication.key_actors||[]).map(x=>typeof x==='string'?x:(x.actor||'')).filter(Boolean);
    const concepts=(publication.key_concepts||publication.topics||[]).map(x=>typeof x==='string'?x:(x.concept||x.topic||'')).filter(Boolean);
    const refs=(publication.references||[]).map(x=>typeof x==='string'?x:(x.reference||'')).filter(Boolean);
    const sourceLines=refs.slice(0,10).map((x,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span>${pdfEsc(x)}</li>`).join('');
    const bodyParagraphs=String(publication.body||'').split(/\n{2,}/).filter(Boolean).slice(0,5).map(x=>`<p>${pdfEsc(x)}</p>`).join('');
    const brief=`<section id="policy-brief-print" class="policy-brief-print" aria-hidden="true"><div class="brief-sheet brief-cover"><div class="brief-brand"><b>TM</b><span>POLICY ATLAS</span><i>RESEARCH BRIEF / ${pdfEsc(publication.language||'TR')}</i></div><div class="brief-code">TM-BRF/${pdfEsc(String(publication.date||'').replaceAll('-',''))}</div><div class="brief-cover-main"><p>${pdfEsc(publication.type||'ANALİZ')} / ${pdfEsc(publication.region||'POLICY ATLAS')}</p><h1>${pdfEsc(publication.title)}</h1><div class="brief-deck">${pdfEsc(publication.quick_summary||publication.summary||'')}</div></div><div class="brief-cover-meta"><span><b>${readingTime}</b> DK OKUMA</span><span><b>${pdfEsc(publication.depth||'ANALİZ')}</b> DOSYA</span><span><b>${pdfEsc(publication.publisher||'POLICY ATLAS')}</b> YAYIN</span></div><footer><span>TAYYİP MİNSİN</span><span>${pdfEsc(pdfDate(publication.date))}</span><span>tayyipminsin.com.tr</span></footer></div><div class="brief-sheet brief-content"><header><div><b>POLICY ATLAS</b><span>EXECUTIVE BRIEF</span></div><i>01 / BAĞLAM</i></header><div class="brief-grid"><section class="brief-executive"><h2>60 Saniyede Anla</h2><p class="lead">${pdfEsc(publication.quick_summary||publication.summary||'')}</p><div class="brief-facts">${publication.what_happened?`<article><span>NE OLDU?</span><p>${pdfEsc(publication.what_happened)}</p></article>`:''}${publication.why_it_matters?`<article><span>NEDEN ÖNEMLİ?</span><p>${pdfEsc(publication.why_it_matters)}</p></article>`:''}${publication.watch_next?`<article class="wide"><span>TAKİP EDİLMESİ GEREKEN</span><p>${pdfEsc(publication.watch_next)}</p></article>`:''}</div></section><aside><div class="brief-list"><span>ANA AKTÖRLER</span>${actors.length?`<ul>${actors.map(x=>`<li>${pdfEsc(x)}</li>`).join('')}</ul>`:'<p>Belirtilmedi.</p>'}</div><div class="brief-list"><span>TEMEL KAVRAMLAR</span>${concepts.length?`<ul>${concepts.map(x=>`<li>${pdfEsc(x)}</li>`).join('')}</ul>`:'<p>Belirtilmedi.</p>'}</div></aside></div><footer><span>TM / POLICY ATLAS</span><span>01</span></footer></div><div class="brief-sheet brief-analysis"><header><div><b>POLICY ATLAS</b><span>ANALİTİK NOT</span></div><i>02 / ANALİZ</i></header><h2>${pdfEsc(publication.title)}</h2><div class="brief-analysis-body">${bodyParagraphs}</div><footer><span>${pdfEsc(publication.region||'POLICY ATLAS')}</span><span>02</span></footer></div>${refs.length?`<div class="brief-sheet brief-sources"><header><div><b>POLICY ATLAS</b><span>KAYNAKÇA</span></div><i>03 / REFERENCES</i></header><h2>Seçilmiş Kaynaklar</h2><ol>${sourceLines}</ol><div class="brief-disclaimer"><b>EDİTORYAL NOT</b><p>Bu brifing, yayımlanan analizin hızlı okunabilir bir sürümüdür. Tam metin, bağlam ve bağlantılı kaynaklar için çevrimiçi yayını inceleyin.</p><a href="https://tayyipminsin.com.tr/yayinlar/${pdfEsc(publication.slug)}.html">tayyipminsin.com.tr/yayinlar/${pdfEsc(publication.slug)}.html</a></div><footer><span>TAYYİP MİNSİN</span><span>03</span></footer></div>`:''}</section>`;
    const actions=`<div class="article-tools"><button type="button" class="pdf-brief-button" onclick="window.print()"><span>PDF BRİFİNG</span><b>İNDİR ↓</b></button><p>Policy Atlas tasarımında, yazdırmaya hazır araştırma brifingi</p></div>`;
    html=html.replace('<section class="article-layout"',actions+'<section class="article-layout"');
    html=html.replace('</body>',brief+'<script>window.addEventListener("beforeprint",()=>document.documentElement.classList.add("printing-brief"));window.addEventListener("afterprint",()=>document.documentElement.classList.remove("printing-brief"));</script></body>');
    await fs.writeFile(articleFile,html);
  } catch(e){ console.warn('PDF brief warning:',publication.slug,e.message); }
}


// V21 ODAP quick briefs + article-specific QR + branded PDF footer
try {
  const QRCode=(await import('qrcode')).default;
  const SITE='https://tayyipminsin.com.tr';
  const qrDir=path.join(dist,'assets','qr');
  await fs.mkdir(qrDir,{recursive:true});
  const decodeEntities=s=>String(s||'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;|&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  const textOnly=s=>decodeEntities(String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
  const meta=(html,name)=>html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,'i'))?.[1]||html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`,'i'))?.[1]||'';
  const titleOf=html=>textOnly(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'Policy Atlas Analizi');
  const bodyOf=html=>textOnly(html.match(/<article[^>]*class=["'][^"']*(?:article-body|odap-article-body)[^"']*["'][^>]*>([\s\S]*?)<\/article>/i)?.[1]||html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1]||'');
  const sentences=s=>String(s||'').match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(x=>x.trim()).filter(x=>x.length>35)||[];
  const processArticle=async(file,kind)=>{
    let html=await fs.readFile(file,'utf8');
    const slug=path.basename(file,'.html');
    const relative=kind==='odap'?`/odap/${slug}.html`:`/yayinlar/${slug}.html`;
    const canonical=html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]||`${SITE}${relative}`;
    const qrName=`${kind}-${slug}.png`,qrWeb=`/assets/qr/${qrName}`;
    await QRCode.toFile(path.join(qrDir,qrName),canonical,{width:300,margin:2,color:{dark:'#061518',light:'#FFFFFF'},errorCorrectionLevel:'M'});
    const title=titleOf(html),body=bodyOf(html),desc=decodeEntities(meta(html,'description'))||sentences(body).slice(0,2).join(' ');
    const language=(html.match(/<html[^>]+lang=["']([^"']+)/i)?.[1]||'tr').toUpperCase().startsWith('EN')?'EN':'TR';
    const read=Math.max(1,Math.ceil(body.split(/\s+/).filter(Boolean).length/(language==='EN'?220:200)));
    if(kind==='odap'&&!html.includes('class="sixty-summary"')){
      const intro=sentences(body).slice(0,2).join(' '),conclusion=sentences(body).slice(-2).join(' ');
      const brief=`<section class="sixty-summary sixty-summary-odap" aria-labelledby="sixty-${slug}"><header><div><p class="micro">EXECUTIVE BRIEF / 60 SECONDS</p><h2 id="sixty-${slug}">Dosyayı 60 Saniyede Anla</h2></div><div class="sixty-meta"><span><b>${read}</b> DK OKUMA</span><span><b>ODAP</b> YAYINCI</span><span><b>${language}</b> DİL</span></div></header><p class="sixty-lead">${esc(desc)}</p><div class="sixty-grid"><div class="sixty-row"><span>DOSYANIN KONUSU</span><p>${esc(intro||desc)}</p></div><div class="sixty-row"><span>ANA SONUÇ</span><p>${esc(conclusion||desc)}</p></div></div><a class="sixty-read" href="#full-analysis">TAM ANALİZE GEÇ ↓</a></section>`;
      html=html.replace(/<section class=["']article-layout["']>/i,'<section class="article-layout" id="full-analysis">');
      if(!html.includes('id="full-analysis"'))html=html.replace(/<article[^>]*class=["'][^"']*(?:article-body|odap-article-body)/i,'<article id="full-analysis" class="article-body');
      const marker=html.includes('<section class="article-layout" id="full-analysis">')?'<section class="article-layout" id="full-analysis">':html.match(/<article[^>]+id="full-analysis"[^>]*>/i)?.[0];
      if(marker)html=html.replace(marker,brief+marker);
    }
    html=html.replace(/<footer[^>]*class=["'][^"']*(?:article-footer|odap-footer|print-footer)[^"']*["'][^>]*>[\s\S]*?<\/footer>/gi,'');
    const footer=`<footer class="print-article-footer"><div class="print-brand-lockup"><img src="/assets/brand/policy-atlas-mark.jpg" alt="Policy Atlas"><div><b>TAYYİP MİNSİN</b><span>POLICY ATLAS</span></div></div><div class="print-footer-center"><span>${esc(title)}</span><small>Bu makalenin çevrimiçi sürümünü ve güncel kaynaklarını açmak için QR kodu tarayın.</small></div><div class="print-partners"><img src="/assets/brand/cemre-iu-logo.jpg" alt="İstanbul Üniversitesi Cemre Öğrenci Kulübü"><img class="article-qr" src="${qrWeb}" alt="Bu makaleye özel QR kod"></div></footer>`;
    html=html.replace('</main>',footer+'</main>');
    await fs.writeFile(file,html);
  };
  for(const [dir,kind] of [['odap','odap'],['yayinlar','publication']]){
    const full=path.join(dist,dir);try{for(const name of await fs.readdir(full))if(name.endsWith('.html'))await processArticle(path.join(full,name),kind)}catch{}
  }
  console.log('V21 ODAP briefs, unique QR codes and branded PDF footers generated.');
} catch(e) { console.warn('V21 PDF branding warning:',e.message); }


// V22 Academic Citation / Cite This module
try {
  const SITE='https://tayyipminsin.com.tr';
  const escAttr=s=>esc(String(s||'')).replace(/\n/g,' ');
  const monthsTR=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const monthsEN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dateParts=value=>{const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})/);return m?{year:m[1],month:Number(m[2]),day:Number(m[3])}:null};
  const citationFor=(item,url)=>{
    const d=dateParts(item.citation_date||item.date),year=d?.year||'t.y.',author=item.citation_author||'Tayyip Minsin',publisher=item.publisher||'Policy Atlas',title=String(item.title||'').trim();
    const initials=author.split(/\s+/).filter(Boolean).map((x,i,a)=>i===a.length-1?x:`${x[0]}.`).reverse().join(', ').replace(/^([^,]+), (.*)$/,'$1, $2');
    const apaDate=d?`${d.year}, ${monthsTR[d.month-1]} ${d.day}`:'t.y.';
    const chicagoDate=d?`${d.day} ${monthsTR[d.month-1]} ${d.year}`:'tarih yok';
    const apa=`Minsin, T. (${apaDate}). ${title}. ${publisher}. ${url}`;
    const chicago=`Minsin, Tayyip. “${title}.” ${publisher}, ${chicagoDate}. ${url}`;
    const mla=`Minsin, Tayyip. “${title}.” ${publisher}, ${d?`${d.day} ${monthsEN[d.month-1]} ${d.year}`:'n.d.'}, ${url}.`;
    const bibtex=`@article{minsin${year}${String(item.slug||'policy-atlas').replace(/[^a-z0-9]/gi,'')},\n  author = {Minsin, Tayyip},\n  title = {${title.replace(/[{}]/g,'')}},\n  journal = {${publisher.replace(/[{}]/g,'')}},\n  year = {${d?.year||''}},\n  url = {${url}}\n}`;
    return {apa,chicago,mla,bibtex};
  };
  let indexItems=[];try{indexItems=(JSON.parse(await fs.readFile(path.join(dist,'content','ai-index.json'),'utf8')).items||[])}catch{}
  const findItem=(slug,kind)=>indexItems.find(x=>x.slug===slug)||sorted.find(x=>x.slug===slug)||{slug,title:'Policy Atlas Analizi',publisher:kind==='odap'?'ODAP':'Policy Atlas'};
  for(const [dir,kind] of [['odap','odap'],['yayinlar','publication']]){
    const folder=path.join(dist,dir);try{for(const name of await fs.readdir(folder)){
      if(!name.endsWith('.html'))continue;
      const slug=name.replace(/\.html$/,''),file=path.join(folder,name);let html=await fs.readFile(file,'utf8');
      if(html.includes('class="cite-this"'))continue;
      const item=findItem(slug,kind),url=item.external_url&&String(item.external_url).includes(SITE)?item.external_url:`${SITE}/${dir}/${name}`;
      const c=citationFor(item,url);
      const module=`<section class="cite-this" aria-labelledby="cite-${escAttr(slug)}"><header><p class="micro">ACADEMIC REFERENCE / CITE THIS</p><h2 id="cite-${escAttr(slug)}">Bu Yazıya Atıf Yap</h2><p>Kaynakçanıza eklemek için atıf stilini seçin ve tek tıkla kopyalayın.</p></header><div class="citation-tabs" role="tablist" aria-label="Atıf biçimleri"><button type="button" class="active" data-cite-tab="apa">APA 7</button><button type="button" data-cite-tab="chicago">Chicago</button><button type="button" data-cite-tab="mla">MLA 9</button><button type="button" data-cite-tab="bibtex">BibTeX</button></div><div class="citation-box"><pre class="citation-text" data-cite-value="apa">${esc(c.apa)}</pre><pre class="citation-text" data-cite-value="chicago" hidden>${esc(c.chicago)}</pre><pre class="citation-text" data-cite-value="mla" hidden>${esc(c.mla)}</pre><pre class="citation-text" data-cite-value="bibtex" hidden>${esc(c.bibtex)}</pre><div class="citation-actions"><button type="button" class="citation-copy">ATIFI KOPYALA</button><a href="${escAttr(url)}" target="_blank" rel="canonical noopener">KALICI BAĞLANTI ↗</a><span class="citation-status" role="status" aria-live="polite"></span></div></div><p class="citation-note">Atıf bilgileri yayın metadatasından otomatik oluşturulmuştur. Kurumunuzun yazım kılavuzuna göre son kontrol önerilir.</p></section>`;
      const footerMarker='<footer class="print-article-footer">';
      html=html.includes(footerMarker)?html.replace(footerMarker,module+footerMarker):html.replace('</main>',module+'</main>');
      await fs.writeFile(file,html);
    }}catch(e){console.warn('Citation directory warning:',dir,e.message)}
  }
  console.log('V22 academic citation modules generated.');
} catch(e){console.warn('V22 citation warning:',e.message)}

try{for(const dir of [dist,path.join(dist,'odap'),path.join(dist,'yayinlar')]){try{for(const n of await fs.readdir(dir))if(n.endsWith('.html')){const f=path.join(dir,n);let h=await fs.readFile(f,'utf8');if(h.includes('class="cite-this"')&&!h.includes('archive-citations.js')){const prefix=dir===dist?'assets/':'../assets/';h=h.replace('</body>',`<script src="${prefix}archive-citations.js" defer></script></body>`);await fs.writeFile(f,h)}}}catch{}}}catch{}


// V23 TR / EN subfolder architecture - no automatic translation
try {
  const SITE='https://tayyipminsin.com.tr';
  const copyDir=async(src,dst)=>{await fs.mkdir(dst,{recursive:true});for(const e of await fs.readdir(src,{withFileTypes:true})){const a=path.join(src,e.name),b=path.join(dst,e.name);e.isDirectory()?await copyDir(a,b):await fs.copyFile(a,b)}};
  const exists=async p=>fs.access(p).then(()=>true).catch(()=>false);
  const addLangMeta=(html,{lang,canonical,alternate,alternateLang})=>{
    html=html.replace(/<html[^>]*lang=["'][^"']+["']/i,m=>m.replace(/lang=["'][^"']+["']/i,`lang="${lang}"`));
    if(!/<html[^>]*lang=/i.test(html))html=html.replace('<html',`<html lang="${lang}"`);
    html=html.replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi,'').replace(/<link[^>]+hreflang=["'][^"']+["'][^>]*>/gi,'');
    const tags=`<link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="${lang}" href="${canonical}">${alternate?`<link rel="alternate" hreflang="${alternateLang}" href="${alternate}">`:''}<link rel="alternate" hreflang="x-default" href="${canonical}">`;
    return html.replace('</head>',tags+'</head>');
  };
  const addSwitcher=(html,trUrl,enUrl,current)=>{
    const sw=`<nav class="language-switcher" aria-label="Language selection"><a href="${trUrl}" lang="tr" hreflang="tr"${current==='tr'?' aria-current="page"':''}>TR</a><span>/</span><a href="${enUrl}" lang="en" hreflang="en"${current==='en'?' aria-current="page"':''}>EN</a></nav>`;
    return html.includes('class="language-switcher"')?html:html.replace('<body>',`<body>${sw}`);
  };
  await fs.mkdir(path.join(dist,'tr'),{recursive:true});await fs.mkdir(path.join(dist,'en'),{recursive:true});
  // Turkish homepage remains the source of truth; root URL remains intact for backwards compatibility.
  let rootHome=await fs.readFile(path.join(dist,'index.html'),'utf8');
  rootHome=addLangMeta(rootHome,{lang:'tr',canonical:`${SITE}/`,alternate:`${SITE}/en/`,alternateLang:'en'});
  rootHome=addSwitcher(rootHome,'/','/en/','tr');await fs.writeFile(path.join(dist,'index.html'),rootHome);
  let trHome=rootHome.replaceAll('href="assets/','href="../assets/').replaceAll('src="assets/','src="../assets/').replaceAll('href="yayinlar.html"','href="/tr/yayinlar.html"').replaceAll('href="odap.html"','href="/tr/yayinlar.html"');
  trHome=addLangMeta(trHome,{lang:'tr',canonical:`${SITE}/tr/`,alternate:`${SITE}/en/`,alternateLang:'en'});trHome=addSwitcher(trHome,'/tr/','/en/','tr');await fs.writeFile(path.join(dist,'tr','index.html'),trHome);
  // Build language-specific publication archives from verified metadata. No translation is performed.
  let all=[];try{all=(JSON.parse(await fs.readFile(path.join(dist,'content','ai-index.json'),'utf8')).items||[])}catch{}
  const dedupe=arr=>{const seen=new Set;return arr.filter(x=>{const k=String(x.external_url||x.slug||x.title);if(seen.has(k))return false;seen.add(k);return true})};
  const trItems=dedupe(all.filter(x=>String(x.language||'TR').toUpperCase()==='TR'));
  const enItems=dedupe(all.filter(x=>String(x.language||'').toUpperCase()==='EN'));
  const archive=(lang,items)=>`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${lang==='tr'?'Yayınlar':'Publications'} | Tayyip Minsin</title><meta name="description" content="${lang==='tr'?'Tayyip Minsin’in Türkçe akademik ve politika analizleri.':'English-language academic and policy analysis by Tayyip Minsin.'}"><link rel="stylesheet" href="../assets/atlas.css"><link rel="canonical" href="${SITE}/${lang}/${lang==='tr'?'yayinlar':'publications'}.html"><link rel="alternate" hreflang="tr" href="${SITE}/tr/yayinlar.html"><link rel="alternate" hreflang="en" href="${SITE}/en/publications.html"><link rel="alternate" hreflang="x-default" href="${SITE}/tr/yayinlar.html"></head><body><nav class="language-switcher" aria-label="Language selection"><a href="/tr/yayinlar.html"${lang==='tr'?' aria-current="page"':''}>TR</a><span>/</span><a href="/en/publications.html"${lang==='en'?' aria-current="page"':''}>EN</a></nav><main class="language-archive"><header><p class="micro">${lang==='tr'?'DOĞRULANMIŞ TÜRKÇE YAYINLAR':'VERIFIED ENGLISH PUBLICATIONS'}</p><h1>${lang==='tr'?'Yayınlar':'Publications'}</h1><p>${lang==='tr'?'Yalnızca özgün Türkçe metinler ve editoryal olarak onaylanmış Türkçe sürümler gösterilir.':'Only original English texts and editorially approved English versions are listed.'}</p></header><section class="language-publication-grid">${items.map(x=>`<a class="language-publication-card" href="${x.external_url||`/${lang==='tr'?'tr/yayinlar':'en/publications'}/${x.slug}.html`}"><span>${x.publisher||'Policy Atlas'} / ${x.language||lang.toUpperCase()}</span><h2>${esc(x.title)}</h2><p>${esc(x.summary||'')}</p><b>${lang==='tr'?'YAZIYI AÇ':'OPEN ARTICLE'} →</b></a>`).join('')}</section></main></body></html>`;
  await fs.writeFile(path.join(dist,'tr','yayinlar.html'),archive('tr',trItems));await fs.writeFile(path.join(dist,'en','publications.html'),archive('en',enItems));
  // Dedicated English landing. It lists only verified English content; no Turkish copy is machine-translated.
  const enHome=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Tayyip Minsin | Policy Atlas</title><meta name="description" content="English-language research on climate policy, energy security, international law and Middle East geopolitics."><link rel="stylesheet" href="../assets/atlas.css"><link rel="canonical" href="${SITE}/en/"><link rel="alternate" hreflang="tr" href="${SITE}/tr/"><link rel="alternate" hreflang="en" href="${SITE}/en/"><link rel="alternate" hreflang="x-default" href="${SITE}/"></head><body><nav class="language-switcher" aria-label="Language selection"><a href="/tr/">TR</a><span>/</span><a href="/en/" aria-current="page">EN</a></nav><main class="english-home"><header><p class="micro">POLICY / STRATEGY / GOVERNANCE</p><h1>Tayyip<br><i>Minsin</i></h1><p>Research and analysis on climate policy, energy security, international law and Middle East geopolitics.</p><div><a href="/en/publications.html">VIEW ENGLISH PUBLICATIONS →</a><a href="/ask.html?mode=web">ASK POLICY ATLAS AI →</a></div></header><section><p class="micro">EDITORIAL STANDARD</p><h2>No automatic translation.</h2><p>English pages are published only when the English text is original or has completed human editorial review. Turkish originals remain unchanged.</p></section></main></body></html>`;
  await fs.writeFile(path.join(dist,'en','index.html'),enHome);
  // Copy verified article originals into language folders without altering source files.
  for(const item of all){const lang=String(item.language||'TR').toUpperCase()==='EN'?'en':'tr',src=item.publisher==='ODAP'?path.join(dist,'odap',`${item.slug}.html`):path.join(dist,'yayinlar',`${item.slug}.html`);if(!(await exists(src)))continue;const sub=lang==='en'?'publications':'yayinlar',dstDir=path.join(dist,lang,sub);await fs.mkdir(dstDir,{recursive:true});let h=await fs.readFile(src,'utf8');h=h.replaceAll('href="../assets/','href="../../assets/').replaceAll('src="../assets/','src="../../assets/').replaceAll('href="/assets/','href="/assets/').replaceAll('src="/assets/','src="/assets/');const currentUrl=`${SITE}/${lang}/${sub}/${item.slug}.html`,otherLang=lang==='en'?'tr':'en',otherSub=otherLang==='en'?'publications':'yayinlar';const pair=item.translation_slug?`${SITE}/${otherLang}/${otherSub}/${item.translation_slug}.html`:null;h=addLangMeta(h,{lang,canonical:currentUrl,alternate:pair,alternateLang:otherLang});h=addSwitcher(h,lang==='tr'?currentUrl:(pair||'/tr/yayinlar.html'),lang==='en'?currentUrl:(pair||'/en/publications.html'),lang);await fs.writeFile(path.join(dstDir,`${item.slug}.html`),h)}
  console.log(`V23 language architecture built: ${trItems.length} TR and ${enItems.length} EN publications.`);
} catch(e){console.warn('V23 language architecture warning:',e.message)}


// V23.1 polished bilingual experience: stable language control + localized modules + language sitemaps
try {
  const SITE='https://tayyipminsin.com.tr';
  const langButton=(current,trUrl,enUrl)=>`<div class="lang-control" data-lang-control><button type="button" class="lang-trigger" aria-expanded="false" aria-controls="lang-menu"><span>${current.toUpperCase()}</span><i aria-hidden="true">▾</i></button><div class="lang-menu" id="lang-menu" hidden><a href="${trUrl}" hreflang="tr" lang="tr"${current==='tr'?' aria-current="page"':''}><b>TR</b><span>Türkçe</span></a><a href="${enUrl}" hreflang="en" lang="en"${current==='en'?' aria-current="page"':''}><b>EN</b><span>English</span></a></div></div>`;
  const replaceSwitcher=(html,current,trUrl,enUrl)=>{
    html=html.replace(/<nav class="language-switcher"[\s\S]*?<\/nav>/gi,'');
    if(!html.includes('data-lang-control'))html=html.replace('<body>',`<body>${langButton(current,trUrl,enUrl)}`);
    if(!html.includes('language-control.js'))html=html.replace('</body>','<script src="/assets/language-control.js" defer></script></body>');
    return html;
  };
  const localizeModules=(html,lang)=>{
    if(lang!=='en')return html;
    const pairs=[
      ['Dosyayı 60 Saniyede Anla','Understand This Brief in 60 Seconds'],['DK OKUMA','MIN READ'],['DOSYA DERİNLİĞİ','DEPTH'],['DİL','LANGUAGE'],['DOSYANIN KONUSU','WHAT THIS BRIEF EXAMINES'],['ANA SONUÇ','KEY TAKEAWAY'],['NE OLDU?','WHAT HAPPENED?'],['NEDEN ÖNEMLİ?','WHY IT MATTERS'],['TAKİP EDİLMESİ GEREKEN','WHAT TO WATCH'],['ANA AKTÖRLER','KEY ACTORS'],['TEMEL KAVRAMLAR','KEY CONCEPTS'],['TAM ANALİZE GEÇ ↓','READ THE FULL ANALYSIS ↓'],
      ['Bu Yazıya Atıf Yap','Cite This Article'],['Kaynakçanıza eklemek için atıf stilini seçin ve tek tıkla kopyalayın.','Select a citation style and copy the reference in one click.'],['ATIFI KOPYALA','COPY CITATION'],['KALICI BAĞLANTI ↗','PERMALINK ↗'],['Atıf bilgileri yayın metadatasından otomatik oluşturulmuştur. Kurumunuzun yazım kılavuzuna göre son kontrol önerilir.','Citation data is generated from publication metadata. Please verify it against your institution’s style guide.'],['Bu makalenin çevrimiçi sürümünü ve güncel kaynaklarını açmak için QR kodu tarayın.','Scan the QR code to open the online version and current sources.']
    ];
    for(const [a,b] of pairs)html=html.replaceAll(a,b);
    return html;
  };
  const pages=[];
  const walk=async dir=>{for(const e of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())await walk(f);else if(e.name.endsWith('.html'))pages.push(f)}};
  await walk(dist);
  for(const file of pages){
    const rel=path.relative(dist,file).replaceAll('\\','/');
    const isEn=rel==='en/index.html'||rel.startsWith('en/');
    const isTr=rel==='index.html'||rel.startsWith('tr/')||rel.startsWith('yayinlar/')||rel.startsWith('odap/');
    if(!isEn&&!isTr)continue;
    let html=await fs.readFile(file,'utf8');
    const slug=path.basename(file,'.html');
    const current=isEn?'en':'tr';
    let trUrl='/',enUrl='/en/';
    if(rel==='tr/yayinlar.html'||rel==='yayinlar.html'||rel==='odap.html'){trUrl='/tr/yayinlar.html';enUrl='/en/publications.html'}
    else if(rel==='en/publications.html'){trUrl='/tr/yayinlar.html';enUrl='/en/publications.html'}
    else if(rel.startsWith('tr/yayinlar/')){trUrl=`/tr/yayinlar/${slug}.html`;enUrl='/en/publications.html'}
    else if(rel.startsWith('en/publications/')){trUrl='/tr/yayinlar.html';enUrl=`/en/publications/${slug}.html`}
    else if(rel.startsWith('yayinlar/')||rel.startsWith('odap/')){trUrl=`/${rel}`;enUrl='/en/publications.html'}
    html=replaceSwitcher(html,current,trUrl,enUrl);
    html=localizeModules(html,current);
    await fs.writeFile(file,html);
  }
  // Localized Ask interface duplicate. The underlying AI already answers in the query language.
  const askSrc=path.join(dist,'ask.html');
  if(await fs.access(askSrc).then(()=>true).catch(()=>false)){
    let ask=await fs.readFile(askSrc,'utf8');
    const trAsk=replaceSwitcher(ask,'tr','/ask.html','/en/ask.html');await fs.writeFile(askSrc,trAsk);
    let enAsk=ask;
    const askPairs=[['Atlas’a Sor','Ask the Atlas'],['Policy Atlas’taki yayınlar, araştırma alanları ve analizler hakkında soru sor. Yanıtlar yalnızca sitedeki mevcut kaynaklara dayanır.','Ask questions about Policy Atlas publications, research areas and analysis. Answers are grounded in the available sources.'],['Yalnızca Policy Atlas','Policy Atlas only'],['Policy Atlas + Web','Policy Atlas + Web'],['Sorunu yaz…','Type your question…'],['ATLAS’A SOR ↗','ASK THE ATLAS ↗'],['Yanıt','Answer'],['KAYNAKLAR','SOURCES'],['Lütfen insan doğrulamasını tamamla.','Please complete the human verification.'],['Kaynaklar taranıyor…','Searching the sources…']];for(const [a,b] of askPairs)enAsk=enAsk.replaceAll(a,b);
    enAsk=enAsk.replace('<html lang="tr">','<html lang="en">').replace(/<title>[^<]*<\/title>/,'<title>Policy Atlas AI Beta | Tayyip Minsin</title>');
    enAsk=replaceSwitcher(enAsk,'en','/ask.html','/en/ask.html');await fs.writeFile(path.join(dist,'en','ask.html'),enAsk);
  }
  // Localized XML sitemaps and index. Existing sitemap remains valid.
  const urls=[];for(const file of pages){const rel=path.relative(dist,file).replaceAll('\\','/');if(rel.startsWith('tr/')||rel.startsWith('en/'))urls.push(`${SITE}/${rel.replace(/index\.html$/,'')}`)}
  const xml=list=>`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${list.map(u=>`<url><loc>${u}</loc></url>`).join('')}</urlset>`;
  await fs.writeFile(path.join(dist,'sitemap-tr.xml'),xml(urls.filter(u=>u.includes('/tr/'))));await fs.writeFile(path.join(dist,'sitemap-en.xml'),xml(urls.filter(u=>u.includes('/en/'))));
  await fs.writeFile(path.join(dist,'sitemap-languages.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${SITE}/sitemap-tr.xml</loc></sitemap><sitemap><loc>${SITE}/sitemap-en.xml</loc></sitemap></sitemapindex>`);
  console.log('V23.1 bilingual UX, localized modules, AI page and language sitemaps generated.');
} catch(e){console.warn('V23.1 warning:',e.message)}


// V24 Complete English interface + reliable pointer behavior
try {
  const enRoot=path.join(dist,'en');
  const exists=async p=>fs.access(p).then(()=>true).catch(()=>false);
  const translateUi=html=>{
    const pairs=[
      ['PROFİL / POZİSYON','PROFILE / POSITION'],['ARAŞTIRMA / ATLAS','RESEARCH / ATLAS'],['YAZILAR / YAYINLANMIŞ ANALİZ','WRITING / PUBLISHED ANALYSIS'],['SAHA / DİPLOMATİK KAYIT','FIELD / DIPLOMATIC RECORD'],['İLETİŞİM / BAĞLANTI','CONTACT / CONNECTION'],
      ['Ana Sayfa','Home'],['Profil','Profile'],['Araştırma Atlası','Research Atlas'],['Yayınlar','Publications'],['Diplomatik Kayıt','Diplomatic Record'],['Güncel Notlar','Current Notes'],['İletişim','Contact'],['Atlas’a Sor','Ask the Atlas'],
      ['Araştırma Atlası','Research Atlas'],['Haritadaki eksenler','Thematic Corridors'],['Analiz Dosyaları','Analysis Files'],['Tüm Analizler','All Analysis'],['Dosyayı Aç','Open File'],['Profili Aç','Open Profile'],
      ['Seçilmiş İş Birliklerine Açık','Available for Selected Collaborations'],['CV / KAMUSAL SÜRÜM HAZIRLANIYOR','CV / PUBLIC VERSION IN PREPARATION'],['Mesajı Gönder','Send Message'],['Gönderiliyor…','Sending…'],['Mesajınız başarıyla iletildi. En kısa sürede e-posta yoluyla dönüş sağlayacağım.','Your message has been sent successfully. I will respond by email as soon as possible.'],
      ['AD SOYAD','FULL NAME'],['E-POSTA','EMAIL'],['KURUM','ORGANISATION'],['İLETİŞİM NEDENİ','REASON FOR CONTACT'],['MESAJ','MESSAGE'],['Seçiniz','Select'],['Araştırma iş birliği','Research collaboration'],['Yayın / dosya teklifi','Publication / dossier proposal'],['Etkinlik veya konuşmacı daveti','Event or speaking invitation'],['Basın görüşü','Media inquiry'],['Cemre çalışmaları','Cemre initiatives'],['Diğer','Other'],
      ['DOSYA','FILE'],['YAYINCI','PUBLISHER'],['FORMAT','FORMAT'],['DİL','LANGUAGE'],['YIL','YEAR'],['SIRALA','SORT'],['Tümü','All'],['En yeni','Newest'],['En eski','Oldest'],['ARAŞTIRMA ARŞİVİNDE ARA','SEARCH THE RESEARCH ARCHIVE'],['Başlık, kavram, ülke veya aktör…','Title, concept, country or actor…'],['TEMİZLE','RESET'],['TÜM ARŞİV','FULL ARCHIVE'],['KAVRAM RADARI','CONCEPT RADAR'],
      ['Dosyayı 60 Saniyede Anla','Understand This Brief in 60 Seconds'],['DK OKUMA','MIN READ'],['DOSYA DERİNLİĞİ','DEPTH'],['NE OLDU?','WHAT HAPPENED?'],['NEDEN ÖNEMLİ?','WHY IT MATTERS'],['TAKİP EDİLMESİ GEREKEN','WHAT TO WATCH'],['ANA AKTÖRLER','KEY ACTORS'],['TEMEL KAVRAMLAR','KEY CONCEPTS'],['TAM ANALİZE GEÇ ↓','READ THE FULL ANALYSIS ↓'],
      ['Bu Yazıya Atıf Yap','Cite This Article'],['Kaynakçanıza eklemek için atıf stilini seçin ve tek tıkla kopyalayın.','Select a citation style and copy the reference in one click.'],['ATIFI KOPYALA','COPY CITATION'],['KALICI BAĞLANTI ↗','PERMALINK ↗'],['KOPYALANDI','COPIED'],
      ['Yalnızca Atlas’ta Ara','SEARCH POLICY ATLAS'],['Atlas + Web','ATLAS + WEB'],['Araştırma Asistanını Aç','OPEN RESEARCH ASSISTANT'],['Kaynaklı Yanıtlar','SOURCE-GROUNDED ANSWERS'],['Yayın','PUBLICATIONS']
    ];
    for(const [tr,en] of pairs)html=html.replaceAll(tr,en);
    return html;
  };
  const applyEnglishMeta=html=>html.replace(/<html[^>]*lang=["'][^"']+["']/i,m=>m.replace(/lang=["'][^"']+["']/i,'lang="en"')).replace(/<meta name="description" content="[^"]*">/i,'<meta name="description" content="Research and analysis by Tayyip Minsin on climate policy, energy security, international law and Middle East geopolitics.">');
  if(await exists(enRoot)){
    const files=[];const walk=async d=>{for(const e of await fs.readdir(d,{withFileTypes:true})){const f=path.join(d,e.name);e.isDirectory()?await walk(f):e.name.endsWith('.html')&&files.push(f)}};await walk(enRoot);
    for(const file of files){let h=await fs.readFile(file,'utf8');h=translateUi(applyEnglishMeta(h));if(!h.includes('pointer-hardening.js'))h=h.replace('</body>','<script src="/assets/pointer-hardening.js" defer></script></body>');await fs.writeFile(file,h)}
  }
  // English homepage is rebuilt from verified profile data, without translating articles.
  let profile={};try{profile=JSON.parse(await fs.readFile(path.join(root,'content','profile.json'),'utf8'))}catch{}
  const englishProfile=profile.english||{};
  const enIndex=path.join(enRoot,'index.html');
  if(await exists(enIndex)){
    let h=await fs.readFile(enIndex,'utf8');
    const intro=englishProfile.intro||'Research and analysis at the intersection of climate policy, energy security, international law and Middle East geopolitics.';
    const manifesto=englishProfile.manifesto||'I examine the space where power, trade, security and climate governance are being rebuilt.';
    const quote=englishProfile.quote||'Climate policy is not only an environmental question. It is where trade, security and diplomacy are being reconstructed.';
    h=h.replace(/<header>[\s\S]*?<\/header>/,`<header><p class="micro">POLICY / STRATEGY / GOVERNANCE</p><h1>Tayyip<br><i>Minsin</i></h1><p>${esc(intro)}</p><div><a href="/en/publications.html">VIEW ENGLISH PUBLICATIONS →</a><a href="/en/ask.html?mode=web">ASK POLICY ATLAS AI →</a></div></header>`);
    h=h.replace(/<section>[\s\S]*?<\/section>/,`<section><p class="micro">RESEARCH PROFILE</p><h2>${esc(manifesto)}</h2><p>${esc(quote)}</p><div class="english-focus-grid">${(englishProfile.focus_areas||['Climate Policy','Energy Security','Middle East Geopolitics','International Law','Policy Analysis']).map((x,i)=>`<article><span>FOCUS ${String(i+1).padStart(2,'0')}</span><b>${esc(x)}</b></article>`).join('')}</div><div class="english-contact-actions"><a href="/en/publications.html">PUBLICATIONS →</a><a href="/en/ask.html">POLICY ATLAS AI →</a><a href="mailto:${esc(profile.email||'minsinjr@gmail.com')}">CONTACT →</a></div></section>`);
    h=translateUi(applyEnglishMeta(h));if(!h.includes('pointer-hardening.js'))h=h.replace('</body>','<script src="/assets/pointer-hardening.js" defer></script></body>');await fs.writeFile(enIndex,h);
  }
  // Ensure all interactive pages, including TR, receive reliable native pointer fallback.
  const allPages=[];const walkAll=async d=>{for(const e of await fs.readdir(d,{withFileTypes:true})){const f=path.join(d,e.name);e.isDirectory()?await walkAll(f):e.name.endsWith('.html')&&allPages.push(f)}};await walkAll(dist);
  for(const file of allPages){let h=await fs.readFile(file,'utf8');if(!h.includes('pointer-hardening.js')){h=h.replace('</body>','<script src="/assets/pointer-hardening.js" defer></script></body>');await fs.writeFile(file,h)}}
  console.log('V24 English interface and pointer hardening generated.');
} catch(e){console.warn('V24 warning:',e.message)}


// V24.2 FINAL post-build cache versioning
// This block must remain at the very end of build.mjs because V23/V24 create /en pages after earlier cache patches.
try {
  const crypto=await import('node:crypto');
  const cssBytes=await fs.readFile(path.join(dist,'assets','atlas.css'));
  const jsBytes=await fs.readFile(path.join(dist,'assets','atlas.js')).catch(()=>Buffer.from(''));
  const version=crypto.createHash('sha256').update(cssBytes).update(jsBytes).digest('hex').slice(0,12);
  const htmlFiles=[];
  const collect=async dir=>{for(const e of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())await collect(f);else if(e.name.endsWith('.html'))htmlFiles.push(f)}};
  await collect(dist);
  for(const file of htmlFiles){
    let h=await fs.readFile(file,'utf8');
    h=h.replace(/((?:href|src)=["'](?:\.\.\/|\.\/|\/)*assets\/(?:atlas\.css|atlas\.js))(?:\?v=[^"']*)?(["'])/g,`$1?v=${version}$2`);
    await fs.writeFile(file,h);
  }
  console.log(`V24.2 final asset version ${version} applied to ${htmlFiles.length} HTML files.`);
} catch(e){console.warn('V24.2 final cache version warning:',e.message)}


// V22 Policy Timeline - standalone context atlas
try {
  const timelineData=JSON.parse(await fs.readFile(path.join(root,'content','timeline.json'),'utf8'));
  const events=(timelineData.events||[]).filter(x=>x.visible!==false).sort((a,b)=>String(a.start_date||'').localeCompare(String(b.start_date||'')));
  const categories=[...new Set(events.map(x=>x.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));
  const eventHtml=events.map((x,i)=>{
    const related=(x.related_publications||[]).map(slug=>sorted.find(p=>p.slug===slug)).filter(Boolean);
    return `<article class="timeline-event" data-category="${esc(x.category||'Diğer')}" data-search="${esc([x.title,x.summary,x.why_turning_point,x.region,x.category,...(x.actors||[])].join(' ').toLocaleLowerCase('tr'))}"><div class="timeline-date"><b>${esc(x.display_date||x.start_date||'')}</b><span>${esc(x.importance||'ÖNEMLİ GELİŞME')}</span></div><button class="timeline-node" type="button" aria-expanded="${i===0?'true':'false'}" aria-controls="timeline-detail-${i}" aria-label="${esc(x.title)} ayrıntılarını göster"><i></i></button><div class="timeline-card"><p class="timeline-code">${esc(x.code||`EVT-${String(i+1).padStart(3,'0')}`)} / ${esc(x.category||'POLICY')}</p><h2>${esc(x.title)}</h2><p>${esc(x.summary||'')}</p><div class="timeline-tags">${(x.actors||[]).slice(0,5).map(a=>`<span>${esc(a)}</span>`).join('')}</div><div class="timeline-detail ${i===0?'active':''}" id="timeline-detail-${i}">${x.why_turning_point?`<section><b>NEDEN KIRILMA NOKTASI?</b><p>${esc(x.why_turning_point)}</p></section>`:''}${x.affected_areas?.length?`<section><b>ETKİLENEN ALANLAR</b><p>${x.affected_areas.map(a=>esc(a)).join(' • ')}</p></section>`:''}${related.length?`<section><b>İLGİLİ ANALİZLER</b>${related.map(p=>`<a href="${esc(p.external_url||`yayinlar/${p.slug}.html`)}">${esc(p.title)} →</a>`).join('')}</section>`:''}${x.primary_source?`<a class="timeline-source" href="${esc(x.primary_source)}" target="_blank" rel="noopener">BİRİNCİL KAYNAK ↗</a>`:''}</div></div></article>`;
  }).join('');
  const controls=categories.map(c=>`<button type="button" data-category="${esc(c)}">${esc(c)}</button>`).join('');
  const page=`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#061518"><title>Politika Zaman Çizelgesi | Tayyip Minsin</title><meta name="description" content="İklim, güvenlik, enerji, diplomasi ve uluslararası hukuk alanlarındaki temel kırılma noktaları."><link rel="stylesheet" href="assets/atlas.css"></head><body class="timeline-page"><header class="nav"><a class="sig" href="index.html"><b>TM</b><i></i><span>POLICY ATLAS</span></a><div class="nav-center"><span>CHRONOLOGY / CONTEXT ATLAS</span><span class="live"><i></i> ${events.length} EVENTS</span></div><a class="menu" href="index.html"><span>ANA SAYFA</span><i></i></a></header><main><section class="timeline-hero"><p class="overline">POLICY HISTORY / STRUCTURAL BREAKS</p><h1>Politika<br><i>Zamanı</i></h1><div><p>Bugünün gündemini şekillendiren anlaşmalar, krizler, kurum kararları ve diplomatik kırılmalar.</p><p>Bu sayfa yayın arşivinin kronolojisi değil; konuların tarihsel bağlam atlasıdır.</p></div></section><section class="timeline-toolbar"><input id="timeline-search" type="search" placeholder="Olay, aktör, ülke veya kavram ara…"><button type="button" class="active" data-category="">TÜMÜ</button>${controls}</section><section class="timeline-stream" id="timeline-stream">${eventHtml||'<div class="timeline-empty"><b>CONTEXT FILE / 000</b><p>Zaman çizelgesi olayları editoryal doğrulama sonrasında burada yayımlanacak.</p></div>'}</section></main><script src="assets/timeline.js" defer></script></body></html>`;
  await fs.writeFile(path.join(dist,'timeline.html'),page);
  let home=await fs.readFile(path.join(dist,'index.html'),'utf8');
  if(!home.includes('href="timeline.html"'))home=home.replace('</nav>',`<a href="timeline.html"><b>06</b>Zaman Çizelgesi</a></nav>`);
  await fs.writeFile(path.join(dist,'index.html'),home);
} catch(e) { console.warn('V22 timeline warning:',e.message); }


// V22.1 Context Capsule - intelligent timeline event dossier
try {
  const timelineFile=path.join(dist,'timeline.html');
  let timelineHtml=await fs.readFile(timelineFile,'utf8');
  const timelineSource=JSON.parse(await fs.readFile(path.join(root,'content','timeline.json'),'utf8'));
  const sourceEvents=(timelineSource.events||[]).filter(x=>x.visible!==false).sort((a,b)=>String(a.start_date||'').localeCompare(String(b.start_date||'')));
  let capsuleIndex=0;
  timelineHtml=timelineHtml.replace(/<div class="timeline-detail([^\"]*)" id="timeline-detail-(\d+)">[\s\S]*?<\/div><\/div><\/article>/g,(full,active,id)=>{
    const x=sourceEvents[capsuleIndex++]||{};
    const coordinates=[['ÖLÇEK',x.scale],['MEKANİZMA',x.mechanism],['YÖN',x.direction],['ETKİ ŞİDDETİ',x.impact_level]].filter(v=>v[1]);
    const beforeAfter=x.before_state||x.after_state?`<div class="context-shift"><article><span>ÖNCE</span><p>${esc(x.before_state||'')}</p></article><i>→</i><article><span>SONRA</span><p>${esc(x.after_state||'')}</p></article></div>`:'';
    const questions=(x.open_questions||[]).map(q=>`<li>${esc(typeof q==='string'?q:(q.question||''))}</li>`).join('');
    const signals=(x.signals||[]).map(s=>`<span>${esc(typeof s==='string'?s:(s.signal||''))}</span>`).join('');
    const coords=coordinates.length?`<div class="context-coordinates">${coordinates.map(([k,v])=>`<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>`:'';
    const capsule=`<div class="timeline-detail${active}" id="timeline-detail-${id}">${coords}<div class="context-capsule">${x.trigger?`<section><span>TETİKLEYİCİ</span><p>${esc(x.trigger)}</p></section>`:''}${x.structural_change?`<section><span>YAPISAL DEĞİŞİM</span><p>${esc(x.structural_change)}</p></section>`:''}${x.legacy?`<section><span>BUGÜNE KALAN MİRAS</span><p>${esc(x.legacy)}</p></section>`:''}${x.counterfactual?`<section class="counterfactual"><span>OLMASAYDI?</span><p>${esc(x.counterfactual)}</p></section>`:''}</div>${beforeAfter}${signals?`<div class="context-signals"><b>İZLENECEK SİNYALLER</b><div>${signals}</div></div>`:''}${questions?`<div class="context-questions"><b>AÇIK SORULAR</b><ol>${questions}</ol></div>`:''}${x.why_turning_point?`<section class="context-verdict"><b>NEDEN KIRILMA NOKTASI?</b><p>${esc(x.why_turning_point)}</p></section>`:''}${x.primary_source?`<a class="timeline-source" href="${esc(x.primary_source)}" target="_blank" rel="noopener">BİRİNCİL KAYNAK ↗</a>`:''}</div></div></article>`;
    return capsule;
  });
  const eventCount=sourceEvents.length;
  const systemChanges=sourceEvents.filter(x=>x.importance==='SİSTEM DEĞİŞİKLİĞİ').length;
  const regions=new Set(sourceEvents.map(x=>x.region).filter(Boolean)).size;
  const categories=new Set(sourceEvents.map(x=>x.category).filter(Boolean)).size;
  const intelligence=`<section class="timeline-intelligence"><div><span>CONTEXT ENGINE</span><h2>Bir olayın yalnızca <i>ne zaman</i> olduğunu değil, <i>neyi değiştirdiğini</i> izle.</h2></div><div class="timeline-stat-grid"><article><b>${String(eventCount).padStart(2,'0')}</b><span>OLAY</span></article><article><b>${String(systemChanges).padStart(2,'0')}</b><span>SİSTEM DEĞİŞİMİ</span></article><article><b>${String(regions).padStart(2,'0')}</b><span>BÖLGE</span></article><article><b>${String(categories).padStart(2,'0')}</b><span>POLİTİKA ALANI</span></article></div><p>Her kayıt; tetikleyici, yapısal değişim, önce/sonra karşılaştırması, bugüne kalan miras ve açık araştırma sorularıyla okunur.</p></section>`;
  timelineHtml=timelineHtml.replace('<section class="timeline-toolbar">',intelligence+'<section class="timeline-toolbar">');
  await fs.writeFile(timelineFile,timelineHtml);
} catch(e){ console.warn('V22.1 Context Capsule warning:',e.message); }


// V22.2 Stable mobile menu normalization
async function normalizePolicyNav(file){
  let html=await fs.readFile(file,'utf8');
  html=html.replace(/<a href="\/?ask\.html"[^>]*>\s*(?:<b>[^<]*<\/b>)?\s*(?:<span>)?Atlas[’']a Sor(?:<\/span>)?\s*<\/a>/gi,'<a class="nav-extra nav-ai" href="/ask.html"><b>05</b><span>Atlas’a Sor</span></a>');
  html=html.replace(/<a href="\/?timeline\.html"[^>]*>\s*(?:<b>[^<]*<\/b>)?\s*(?:<span>)?Zaman Çizelgesi(?:<\/span>)?\s*<\/a>/gi,'<a class="nav-extra nav-timeline" href="/timeline.html"><b>06</b><span>Zaman Çizelgesi</span></a>');
  // Remove accidental duplicates while preserving the first normalized item.
  let aiSeen=false,timelineSeen=false;
  html=html.replace(/<a class="nav-extra nav-(ai|timeline)"[\s\S]*?<\/a>/g,m=>{const isAi=m.includes('nav-ai');if(isAi){if(aiSeen)return '';aiSeen=true}else{if(timelineSeen)return '';timelineSeen=true}return m});
  await fs.writeFile(file,html);
}
await normalizePolicyNav(path.join(dist,'index.html'));


// V22.3 FINAL menu rebuild + per-deployment HTML/CSS/JS cache versioning
const v223=Date.now().toString(36);
async function v223PatchHtml(file,isHome=false){
  let html=await fs.readFile(file,'utf8');
  // Every deployment receives fresh local asset URLs, including timeline assets.
  html=html.replace(/(["'])(\.\.\/|\/|)assets\/(atlas\.css|atlas\.js|timeline\.js|archive-filters\.js)(?:\?v=[^"']*)?\1/g,(_,q,prefix,name)=>`${q}${prefix}assets/${name}?v=${v223}${q}`);
  if(isHome){
    // Rebuild the menu list as one canonical block. Removes links accidentally appended outside .nav-links.
    const canonical=`<div class="nav-links"><a href="#manifesto"><b>01</b><span>Profil</span></a><a href="#atlas"><b>02</b><span>Araştırma Atlası</span></a><a href="yayinlar.html?v=${v223}"><b>03</b><span>Yayınlar</span></a><a href="#records"><b>04</b><span>Diplomatik Kayıt</span></a><a href="ask.html?v=${v223}"><b>05</b><span>Atlas’a Sor</span></a><a href="timeline.html?v=${v223}"><b>06</b><span>Zaman Çizelgesi</span></a><a href="#contact"><b>07</b><span>Temas</span></a></div>`;
    html=html.replace(/<div class="nav-links">[\s\S]*?<\/div>/,canonical);
    html=html.replace(/<a class="nav-extra nav-(?:ai|timeline)"[\s\S]*?<\/a>/g,'');
    html=html.replace(/<a href="\/?(?:ask|timeline)\.html(?:\?[^\"]*)?"[^>]*>\s*(?:<b>[^<]*<\/b>)?\s*(?:<span>)?(?:Atlas[’']a Sor|Zaman Çizelgesi)(?:<\/span>)?\s*<\/a>(?=\s*<\/nav>)/gi,'');
  }
  // Meta directives protect against normal-tab stale HTML when a CDN/browser retains an old document.
  if(!html.includes('http-equiv="Cache-Control"'))html=html.replace('<head>','<head><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0">');
  await fs.writeFile(file,html);
}
await v223PatchHtml(path.join(dist,'index.html'),true);
for(const file of ['timeline.html','yayinlar.html','ask.html']){try{await v223PatchHtml(path.join(dist,file))}catch{}}
for(const dirName of ['yayinlar','odap']){try{for(const f of await fs.readdir(path.join(dist,dirName)))if(f.endsWith('.html'))await v223PatchHtml(path.join(dist,dirName,f))}catch{}}
// Cloudflare Pages serves this final _headers file from dist.
const finalHeaders=`/*
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

/*.html
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

/assets/*.css
  Cache-Control: no-cache, must-revalidate

/assets/*.js
  Cache-Control: no-cache, must-revalidate
`;
try{
  const existing=await fs.readFile(path.join(dist,'_headers'),'utf8').catch(()=> '');
  if(!existing.includes('V22.3 FINAL CACHE RULES'))await fs.writeFile(path.join(dist,'_headers'),existing+'\n# V22.3 FINAL CACHE RULES\n'+finalHeaders);
}catch{}
console.log(`V22.3 menu and cache version: ${v223}`);


// V24 ISOLATED AUDIO READER - only injects one independent script into article pages
const v24AudioVersion=Date.now().toString(36);
async function injectV24Audio(file){
  let html=await fs.readFile(file,'utf8');
  const isArticle=html.includes('article-layout')||html.includes('odap-article')||html.includes('article-body');
  if(!isArticle)return;
  html=html.replace(/<script src="(?:\.\.\/|\/)?assets\/pa-audio-reader\.js(?:\?v=[^"]*)?" defer><\/script>/gi,'');
  html=html.replace('</body>',`<script src="../assets/pa-audio-reader.js?v=${v24AudioVersion}" defer></script></body>`);
  await fs.writeFile(file,html);
}
for(const dirName of ['yayinlar','odap']){
  try{for(const name of await fs.readdir(path.join(dist,dirName)))if(name.endsWith('.html'))await injectV24Audio(path.join(dist,dirName,name))}catch{}
}
console.log(`V24 isolated audio version: ${v24AudioVersion}`);


// V25.1 Cinematic Research Compass
try {
  let items=[];
  try { items=(JSON.parse(await fs.readFile(path.join(dist,'content','ai-index.json'),'utf8')).items||[]); } catch {}
  const seen=new Set();
  const normalized=items.filter(x=>{const k=String(x.external_url||x.slug||x.title);if(seen.has(k))return false;seen.add(k);return true}).map(x=>({title:x.title,summary:x.summary||'',publisher:x.publisher||'Policy Atlas',language:x.language||'TR',region:x.region||'',date:x.date||'',topics:[...(x.topics||[]),...(x.key_concepts||[])].map(v=>typeof v==='string'?v:(v.topic||v.concept||'')).filter(Boolean),actors:(x.key_actors||[]).map(v=>typeof v==='string'?v:(v.actor||'')).filter(Boolean),url:x.external_url||`/yayinlar/${x.slug}.html`}));
  await fs.writeFile(path.join(dist,'content','research-compass.json'),JSON.stringify({generated_at:new Date().toISOString(),items:normalized},null,2));
  const page=`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#061518"><title>Araştırma Pusulası | Policy Atlas</title><meta name="description" content="Policy Atlas arşivinde görsel ve etkileşimli okuma rotaları oluşturun."><link rel="stylesheet" href="/assets/atlas.css"></head><body class="compass-body"><a class="compass-back" href="/">← POLICY ATLAS</a><main class="research-compass cinematic-compass"><header class="compass-intro"><p class="micro">INTERACTIVE RESEARCH NAVIGATION / LIVE ARCHIVE</p><h1>Araştırma<br><i>Pusulası</i></h1><p>Merceğini, coğrafyanı ve dilini seç. Pusula, arşivdeki en güçlü beş okuma rotasını yön ve yoğunluk olarak gösterecek.</p></header><section class="compass-stage"><div class="compass-visual" aria-hidden="true"><svg class="compass-svg" viewBox="0 0 600 600"><defs><radialGradient id="dial" cx="50%" cy="45%"><stop offset="0" stop-color="#123337"/><stop offset=".7" stop-color="#07191c"/><stop offset="1" stop-color="#041013"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="300" cy="300" r="286" fill="url(#dial)" stroke="#b8643f" stroke-width="2"/><circle cx="300" cy="300" r="250" fill="none" stroke="#d6bf93" stroke-opacity=".25"/><circle cx="300" cy="300" r="185" fill="none" stroke="#d6bf93" stroke-opacity=".15"/><g class="compass-ticks"></g><g class="compass-labels"><text x="300" y="62">N</text><text x="540" y="306">E</text><text x="300" y="552">S</text><text x="57" y="306">W</text></g><g class="compass-needle" filter="url(#glow)"><path d="M300 88 L326 300 L300 272 L274 300Z" fill="#b8643f"/><path d="M300 512 L326 300 L300 328 L274 300Z" fill="#d6bf93"/><circle cx="300" cy="300" r="24" fill="#061518" stroke="#d6bf93" stroke-width="3"/><circle cx="300" cy="300" r="7" fill="#b8643f"/></g><g class="compass-center-copy"><text x="300" y="340">POLICY ATLAS</text><text class="compass-state" x="300" y="365">AWAITING COORDINATES</text></g></svg><div class="orbit orbit-one"><i></i></div><div class="orbit orbit-two"><i></i></div></div><div class="compass-console"><div class="console-top"><span>ROUTE ENGINE / V25.1</span><b>ONLINE</b></div><div class="coordinate-readout"><div><small>MERCEK</small><strong id="readout-lens">—</strong></div><div><small>COĞRAFYA</small><strong id="readout-region">—</strong></div><div><small>DİL</small><strong id="readout-language">—</strong></div></div><div class="compass-progress"><span class="active"></span><span></span><span></span></div><div class="compass-step active" data-step="1"><p>01 / ARAŞTIRMA MERCEĞİ</p><h2>Hangi kuvvet alanını takip ediyorsun?</h2><div class="compass-options"><button data-value="güvenlik" data-bearing="22">Güvenlik ve caydırıcılık <i>NE 022°</i></button><button data-value="iklim" data-bearing="92">İklim ve enerji <i>E 092°</i></button><button data-value="hukuk" data-bearing="164">Uluslararası hukuk <i>SE 164°</i></button><button data-value="diplomasi" data-bearing="236">Diplomasi ve dış politika <i>SW 236°</i></button><button data-value="yönetişim" data-bearing="308">Devlet kapasitesi ve yönetişim <i>NW 308°</i></button></div></div><div class="compass-step" data-step="2"><p>02 / COĞRAFİ EKSEN</p><h2>Rotanı hangi coğrafyaya sabitleyelim?</h2><div class="compass-options"><button data-value="libya" data-bearing="342">Libya</button><button data-value="irak" data-bearing="44">Irak</button><button data-value="körfez" data-bearing="104">Körfez</button><button data-value="kuzey afrika" data-bearing="202">Kuzey Afrika</button><button data-value="avrupa" data-bearing="276">Avrupa / AB</button><button data-value="farketmez" data-bearing="0">Açık rota</button></div></div><div class="compass-step" data-step="3"><p>03 / YAYIN DİLİ</p><h2>Kaynakları hangi dilde görmek istiyorsun?</h2><div class="compass-options compass-languages"><button data-value="TR" data-bearing="350">Türkçe</button><button data-value="EN" data-bearing="10">English</button><button data-value="ANY" data-bearing="0">Dil fark etmez</button></div></div><div class="compass-loading" hidden><div class="sonar"><span></span><i></i></div><p>ARŞİV KOORDİNATLARI EŞLEŞTİRİLİYOR…</p></div></div></section><section class="compass-results" hidden><header><div><p class="micro">CALCULATED RESEARCH ROUTE</p><h2>Önerilen Okuma Rotası</h2></div><button id="compass-reset">PUSULAYI SIFIRLA</button></header><div class="route-map"><svg class="route-line" viewBox="0 0 100 600" preserveAspectRatio="none"><path d="M50 0 C10 100 90 180 50 280 C10 380 90 470 50 600"/></svg><div id="compass-cards"></div></div></section></main><script src="/assets/research-compass.js" defer></script><script src="/assets/pointer-hardening.js" defer></script></body></html>`;
  await fs.writeFile(path.join(dist,'pusula.html'),page);
  console.log(`V25.1 cinematic compass built from ${normalized.length} publications.`);
} catch(e){console.warn('V25.1 compass warning:',e.message)}


// V25.2 final compass asset injection - runs after V25.1 page generation
try {
  const f=path.join(dist,'pusula.html');
  let h=await fs.readFile(f,'utf8');
  // Use root absolute assets and a compass-specific stylesheet to avoid stale atlas.css.
  h=h.replace(/<link[^>]+href=["'][^"']*atlas\.css(?:\?v=[^"']*)?["'][^>]*>/i,'<link rel="stylesheet" href="/assets/atlas.css"><link rel="stylesheet" href="/assets/compass.css">');
  h=h.replace(/<script[^>]+src=["'][^"']*research-compass\.js(?:\?v=[^"']*)?["'][^>]*><\/script>/i,'<script src="/assets/research-compass.js" defer></script>');
  await fs.writeFile(f,h);
  console.log('V25.2 compass-specific CSS and JS injected.');
} catch(e){console.warn('V25.2 compass injection warning:',e.message)}


// V25.3 Research Compass entry gates
try {
  const htmlFiles=[];
  async function walkCompass(dir){
    for(const ent of await fs.readdir(dir,{withFileTypes:true})){
      const p=path.join(dir,ent.name);
      if(ent.isDirectory()) await walkCompass(p);
      else if(ent.name.endsWith('.html')) htmlFiles.push(p);
    }
  }
  await walkCompass(dist);
  const navRowTR='<a class="nav-link nav-compass-link" href="/pusula.html"><span>07</span><strong>Pusula</strong><em>ROTANI BUL</em></a>';
  const navRowEN='<a class="nav-link nav-compass-link" href="/pusula.html"><span>07</span><strong>Compass</strong><em>FIND YOUR ROUTE</em></a>';
  for(const file of htmlFiles){
    if(file.endsWith('pusula.html')) continue;
    let h=await fs.readFile(file,'utf8');
    if(!h.includes('nav-compass-link')){
      const isEN=/<html[^>]+lang=["']en/i.test(h)||file.includes(`${path.sep}en${path.sep}`);
      const row=isEN?navRowEN:navRowTR;
      if(/<a[^>]+href=["'][^"']*(?:contact|#contact)[^"']*["'][^>]*class=["'][^"']*nav-link/i.test(h)){
        h=h.replace(/(<a[^>]+href=["'][^"']*(?:contact|#contact)[^"']*["'][^>]*class=["'][^"']*nav-link[^"']*["'][^>]*>)/i,row+'$1');
      } else if(/<\/nav>/i.test(h)) h=h.replace(/<\/nav>/i,row+'</nav>');
    }
    await fs.writeFile(file,h);
  }
  const archiveCandidates=[path.join(dist,'yayinlar.html'),path.join(dist,'tr','yayinlar.html'),path.join(dist,'en','publications.html')];
  for(const file of archiveCandidates){
    try{
      let h=await fs.readFile(file,'utf8');
      if(h.includes('compass-entry-gate')) continue;
      const en=file.includes(`${path.sep}en${path.sep}`);
      const gate=en?`<section class="compass-entry-gate" aria-labelledby="compass-gate-title"><div class="compass-gate-dial" aria-hidden="true"><span class="cg-ring r1"></span><span class="cg-ring r2"></span><i class="cg-needle"></i><b>N</b></div><div class="compass-gate-copy"><p>RESEARCH NAVIGATION / PERSONAL ROUTE</p><h2 id="compass-gate-title">Not sure where to begin?</h2><div class="compass-gate-line"><span></span><strong>Let the archive find your direction.</strong></div><p class="compass-gate-description">Choose a lens, a geography and a language. The Research Compass will build a five-stop reading route from the full Policy Atlas archive.</p><a href="/pusula.html">OPEN THE COMPASS <b>↗</b></a></div><div class="compass-gate-meta"><small>ARCHIVE SIGNAL</small><strong>LIVE</strong><span>NO ACCOUNT</span><span>NO TRACKING</span></div></section>`:`<section class="compass-entry-gate" aria-labelledby="compass-gate-title"><div class="compass-gate-dial" aria-hidden="true"><span class="cg-ring r1"></span><span class="cg-ring r2"></span><i class="cg-needle"></i><b>N</b></div><div class="compass-gate-copy"><p>ARAŞTIRMA NAVİGASYONU / KİŞİSEL ROTA</p><h2 id="compass-gate-title">Nereden başlayacağına emin değil misin?</h2><div class="compass-gate-line"><span></span><strong>Arşiv sana yönünü göstersin.</strong></div><p class="compass-gate-description">Merceğini, coğrafyanı ve dilini seç. Araştırma Pusulası, Policy Atlas arşivinden sana özel beş duraklı bir okuma rotası oluştursun.</p><a href="/pusula.html">PUSULAYI AÇ <b>↗</b></a></div><div class="compass-gate-meta"><small>ARŞİV SİNYALİ</small><strong>CANLI</strong><span>HESAP GEREKMEZ</span><span>TAKİP YOK</span></div></section>`;
      const targets=[/<section[^>]+class=["'][^"']*(?:archive|publications|filters)[^"']*["'][^>]*>/i,/<main[^>]*>/i];
      let inserted=false;
      for(const re of targets){if(re.test(h)){h=h.replace(re,m=>m+gate);inserted=true;break}}
      if(!inserted) h=h.replace(/<body[^>]*>/i,m=>m+gate);
      await fs.writeFile(file,h);
    }catch{}
  }
  console.log('V25.3 Compass menu entry and publication archive gateway generated.');
}catch(e){console.warn('V25.3 Compass gate warning:',e.message)}


// V25.4 Compact Compass navigation and archive signal strip
try {
  const htmlFiles=[];
  async function walkV254(dir){for(const ent of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())await walkV254(p);else if(ent.name.endsWith('.html'))htmlFiles.push(p)}}
  await walkV254(dist);
  for(const file of htmlFiles){
    if(file.endsWith('pusula.html')) continue;
    let h=await fs.readFile(file,'utf8');
    const en=/<html[^>]+lang=["']en/i.test(h)||file.includes(`${path.sep}en${path.sep}`);
    // Remove every previous full-size compass menu row or old compass chip.
    h=h.replace(/<a[^>]*class=["'][^"']*(?:nav-compass-link|nav-compass-chip)[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,'');
    const chip=en?'<a class="nav-compass-chip" href="/pusula.html" aria-label="Open Research Compass"><span class="nav-chip-dial" aria-hidden="true"><i></i></span><span><small>DISCOVER</small><strong>COMPASS</strong></span><b>↗</b></a>':'<a class="nav-compass-chip" href="/pusula.html" aria-label="Araştırma Pusulasını aç"><span class="nav-chip-dial" aria-hidden="true"><i></i></span><span><small>KEŞFET</small><strong>PUSULA</strong></span><b>↗</b></a>';
    // Add as a special utility, not as another numbered menu heading.
    if(/<\/nav>/i.test(h)) h=h.replace(/<\/nav>/i,chip+'</nav>');
    await fs.writeFile(file,h);
  }
  for(const file of [path.join(dist,'yayinlar.html'),path.join(dist,'tr','yayinlar.html'),path.join(dist,'en','publications.html')]){
    try{
      let h=await fs.readFile(file,'utf8');
      const en=file.includes(`${path.sep}en${path.sep}`);
      const strip=en?`<aside class="compass-signal-strip" aria-label="Research Compass"><span class="signal-dial" aria-hidden="true"><i></i></span><div class="signal-copy"><small>PERSONAL READING ROUTE</small><strong>Not sure where to begin?</strong><p>Choose three coordinates; receive five publications.</p></div><a href="/pusula.html">OPEN COMPASS <b>↗</b></a><span class="signal-led">LIVE</span></aside>`:`<aside class="compass-signal-strip" aria-label="Araştırma Pusulası"><span class="signal-dial" aria-hidden="true"><i></i></span><div class="signal-copy"><small>KİŞİSEL OKUMA ROTASI</small><strong>Nereden başlayacağına emin değil misin?</strong><p>Üç koordinat seç; arşivden beş yayınlık rotanı al.</p></div><a href="/pusula.html">PUSULAYI AÇ <b>↗</b></a><span class="signal-led">CANLI</span></aside>`;
      h=h.replace(/<section[^>]*class=["'][^"']*compass-entry-gate[^"']*["'][^>]*>[\s\S]*?<\/section>/gi,strip);
      if(!h.includes('compass-signal-strip')){
        const target=/<section[^>]+class=["'][^"']*(?:archive|publications|filters)[^"']*["'][^>]*>/i;
        if(target.test(h))h=h.replace(target,m=>m+strip);else h=h.replace(/<main[^>]*>/i,m=>m+strip);
      }
      await fs.writeFile(file,h);
    }catch{}
  }
  console.log('V25.4 compact Compass navigation chip and archive signal strip generated.');
}catch(e){console.warn('V25.4 warning:',e.message)}


// V25.5 Numbered Compass menu entry and Android alignment repair
try {
  const htmlFiles=[];
  async function walkV255(dir){for(const ent of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())await walkV255(p);else if(ent.name.endsWith('.html'))htmlFiles.push(p)}}
  await walkV255(dist);
  for(const file of htmlFiles){
    if(file.endsWith('pusula.html')) continue;
    let h=await fs.readFile(file,'utf8');
    const en=/<html[^>]+lang=["']en/i.test(h)||file.includes(`${path.sep}en${path.sep}`);
    // Remove previous Compass chip/full rows so there is exactly one entry.
    h=h.replace(/<a[^>]*class=["'][^"']*(?:nav-compass-link|nav-compass-chip|nav-compass-eight)[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,'');
    const row=en?'<a class="nav-link nav-compass-eight" href="/pusula.html"><span>08</span><strong>Compass</strong><i class="menu-compass-mark" aria-hidden="true"><b></b></i></a>':'<a class="nav-link nav-compass-eight" href="/pusula.html"><span>08</span><strong>Pusula</strong><i class="menu-compass-mark" aria-hidden="true"><b></b></i></a>';
    // Append after 07 Contact/Temas if possible, otherwise before closing nav.
    const contact=/(<a[^>]*class=["'][^"']*nav-link[^"']*["'][^>]*>[\s\S]*?<span>\s*07\s*<\/span>[\s\S]*?<\/a>)/i;
    if(contact.test(h)) h=h.replace(contact,'$1'+row);
    else if(/<\/nav>/i.test(h)) h=h.replace(/<\/nav>/i,row+'</nav>');
    await fs.writeFile(file,h);
  }
  console.log('V25.5 Compass restored as numbered menu item 08; Android archive alignment hooks active.');
}catch(e){console.warn('V25.5 warning:',e.message)}


// V25.6 deterministic menu and Android layout repair
try {
  const htmlFiles=[];
  async function walkV256(dir){for(const ent of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())await walkV256(p);else if(ent.name.endsWith('.html'))htmlFiles.push(p)}}
  await walkV256(dist);
  for(const file of htmlFiles){
    if(file.endsWith('pusula.html')) continue;
    let h=await fs.readFile(file,'utf8');
    // Remove any build-time compass row. Runtime script will place a single row in the correct menu container.
    h=h.replace(/<a[^>]*class=["'][^"']*(?:nav-compass-link|nav-compass-chip|nav-compass-eight)[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,'');
    // Add deterministic runtime repair exactly once.
    h=h.replace(/<script[^>]+src=["'][^"']*menu-layout-repair\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,'');
    h=h.replace(/<\/body>/i,'<script src="/assets/menu-layout-repair.js" defer></script></body>');
    await fs.writeFile(file,h);
  }
  console.log('V25.6 deterministic menu and Android layout repair injected.');
}catch(e){console.warn('V25.6 warning:',e.message)}


// V25.7 normalize menu order and remove detached legacy Compass artefacts
try{
 const files=[];async function walkV257(d){for(const e of await fs.readdir(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())await walkV257(p);else if(e.name.endsWith('.html'))files.push(p)}}await walkV257(dist);
 for(const f of files){if(f.endsWith('pusula.html'))continue;let h=await fs.readFile(f,'utf8');
  h=h.replace(/<a[^>]*class=["'][^"']*(?:nav-compass-chip|nav-compass-link)[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,'');
  h=h.replace(/<[^>]+class=["'][^"']*menu-compass-floating[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi,'');
  await fs.writeFile(f,h);
 }
 console.log('V25.7 menu HTML normalized; detached Compass artefacts removed.');
}catch(e){console.warn('V25.7 warning:',e.message)}


// V25.8 inject isolated menu assets after all other menu builders
try{
 const files=[];async function walkV258(d){for(const e of await fs.readdir(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())await walkV258(p);else if(e.name.endsWith('.html'))files.push(p)}}await walkV258(dist);
 for(const f of files){if(f.endsWith('pusula.html'))continue;let h=await fs.readFile(f,'utf8');
  h=h.replace(/<link[^>]+href=["'][^"']*menu-v258\.css(?:\?[^"']*)?["'][^>]*>/gi,'');
  h=h.replace(/<script[^>]+src=["'][^"']*menu-v258\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,'');
  h=h.replace(/<\/head>/i,'<link rel="stylesheet" href="/assets/menu-v258.css?v=258"></head>');
  h=h.replace(/<\/body>/i,'<script src="/assets/menu-v258.js?v=258" defer></script></body>');
  await fs.writeFile(f,h);
 }
 console.log('V25.8 isolated definitive menu assets injected.');
}catch(e){console.warn('V25.8 warning:',e.message)}


// V25.9 direct nav-links selector fix; injected after all legacy menu builders
try{
 const files=[];async function walkV259(d){for(const e of await fs.readdir(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())await walkV259(p);else if(e.name.endsWith('.html'))files.push(p)}}await walkV259(dist);
 for(const f of files){if(f.endsWith('pusula.html'))continue;let h=await fs.readFile(f,'utf8');
  h=h.replace(/<link[^>]+href=["'][^"']*menu-v25(?:8|9)\.css(?:\?[^"']*)?["'][^>]*>/gi,'');
  h=h.replace(/<script[^>]+src=["'][^"']*menu-v25(?:8|9)\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,'');
  h=h.replace(/<\/head>/i,'<link rel="stylesheet" href="/assets/menu-v259.css?v=259"></head>');
  h=h.replace(/<\/body>/i,'<script src="/assets/menu-v259.js?v=259" defer></script></body>');
  await fs.writeFile(f,h);
 }
 console.log('V25.9 direct .nav-links menu selector injected.');
}catch(e){console.warn('V25.9 warning:',e.message)}


// V25.10 self-contained menu; no external menu CSS dependency
try{const files=[];async function walkV2510(d){for(const e of await fs.readdir(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())await walkV2510(p);else if(e.name.endsWith('.html'))files.push(p)}}await walkV2510(dist);for(const f of files){if(f.endsWith('pusula.html'))continue;let h=await fs.readFile(f,'utf8');h=h.replace(/<link[^>]+href=["'][^"']*menu-v25(?:8|9)\.css(?:\?[^"']*)?["'][^>]*>/gi,'');h=h.replace(/<script[^>]+src=["'][^"']*menu-v25(?:8|9|10)\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,'');h=h.replace(/<\/body>/i,'<script src="/assets/menu-v2510.js?v=2510" defer></script></body>');await fs.writeFile(f,h)}console.log('V25.10 self-contained menu injected; external menu CSS removed.')}catch(e){console.warn('V25.10 warning:',e.message)}


// V26 Continue Reading injection
{
  const fs26 = await import('node:fs');
  const path26 = await import('node:path');
  const dist26 = path26.join(process.cwd(), 'dist');
  const assets26 = path26.join(dist26, 'assets');
  fs26.mkdirSync(assets26, { recursive: true });
  fs26.copyFileSync(path26.join(process.cwd(),'pa-continue-reading.js'), path26.join(assets26,'pa-continue-reading.js'));
  fs26.copyFileSync(path26.join(process.cwd(),'pa-continue-reading.css'), path26.join(assets26,'pa-continue-reading.css'));
  const walk26=d=>fs26.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk26(path26.join(d,e.name)):[path26.join(d,e.name)]);
  const version26=Date.now().toString(36);
  for(const file26 of walk26(dist26).filter(f=>f.endsWith('.html'))){
    let html26=fs26.readFileSync(file26,'utf8');
    if(!html26.includes('pa-continue-reading.css')) html26=html26.replace('</head>',`<link rel="stylesheet" href="/assets/pa-continue-reading.css?v=${version26}">\n</head>`);
    if(!html26.includes('pa-continue-reading.js')) html26=html26.replace('</body>',`<script src="/assets/pa-continue-reading.js?v=${version26}" defer></script>\n</body>`);
    fs26.writeFileSync(file26,html26,'utf8');
  }
  console.log(`V26 Continue Reading injected into HTML pages (${version26}).`);
}



// V26.1 Continue Reading final injection
{
 const fs=await import('node:fs'),path=await import('node:path');
 const d=path.join(process.cwd(),'dist'),a=path.join(d,'assets');fs.mkdirSync(a,{recursive:true});
 fs.copyFileSync('pa-continue-reading-v261.js',path.join(a,'pa-continue-reading-v261.js'));fs.copyFileSync('pa-continue-reading-v261.css',path.join(a,'pa-continue-reading-v261.css'));
 const walk=x=>fs.readdirSync(x,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(x,e.name)):[path.join(x,e.name)]),v=Date.now().toString(36);
 for(const f of walk(d).filter(x=>x.endsWith('.html'))){let h=fs.readFileSync(f,'utf8');h=h.replace(/<link[^>]+pa-continue-reading(?:-v261)?\.css[^>]*>\s*/g,'').replace(/<script[^>]+pa-continue-reading(?:-v261)?\.js[^>]*><\/script>\s*/g,'');h=h.replace('</head>',`<link rel="stylesheet" href="/assets/pa-continue-reading-v261.css?v=${v}">\n</head>`).replace('</body>',`<script src="/assets/pa-continue-reading-v261.js?v=${v}" defer></script>\n</body>`);fs.writeFileSync(f,h,'utf8')}
 console.log(`V26.1 Continue Reading assets injected (${v}).`)
}


// V26.2 Quick Access Dock injection
{
 const fs=await import('node:fs'),path=await import('node:path');const d=path.join(process.cwd(),'dist'),a=path.join(d,'assets');fs.mkdirSync(a,{recursive:true});
 fs.copyFileSync('pa-quick-access-v262.js',path.join(a,'pa-quick-access-v262.js'));fs.copyFileSync('pa-quick-access-v262.css',path.join(a,'pa-quick-access-v262.css'));
 const walk=x=>fs.readdirSync(x,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(x,e.name)):[path.join(x,e.name)]),v=Date.now().toString(36);
 for(const f of walk(d).filter(x=>x.endsWith('.html'))){let h=fs.readFileSync(f,'utf8');h=h.replace(/<link[^>]+pa-quick-access-v262\.css[^>]*>\s*/g,'').replace(/<script[^>]+pa-quick-access-v262\.js[^>]*><\/script>\s*/g,'');h=h.replace('</head>',`<link rel="stylesheet" href="/assets/pa-quick-access-v262.css?v=${v}">\n</head>`).replace('</body>',`<script src="/assets/pa-quick-access-v262.js?v=${v}" defer></script>\n</body>`);fs.writeFileSync(f,h,'utf8')}
 console.log(`V26.2 Quick Access Dock injected (${v}).`)
}
