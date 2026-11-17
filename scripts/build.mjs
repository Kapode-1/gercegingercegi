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
