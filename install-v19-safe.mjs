import { promises as fs } from 'node:fs';
for(const p of ['admin/config.yml','scripts/build.mjs','assets/atlas.css'])await fs.access(p).catch(()=>{throw new Error(`Eksik dosya: ${p}. Repo kökünde çalıştır.`)});
let cfg=await fs.readFile('admin/config.yml','utf8');
if(!cfg.includes('name: "quick_summary"')){
 const needle='              - {label: "Öne çıkar", name: "featured", widget: "boolean", default: false}';
 const fields=`${needle}\n              - {label: "Kısa dosya özeti", name: "quick_summary", widget: "text", required: false, hint: "Yazının ana tezini 2–3 cümlede özetleyin."}\n              - {label: "Ne oldu?", name: "what_happened", widget: "text", required: false}\n              - {label: "Neden önemli?", name: "why_it_matters", widget: "text", required: false}\n              - {label: "Takip edilmesi gereken", name: "watch_next", widget: "text", required: false}\n              - {label: "Dosya derinliği", name: "depth", widget: "select", required: false, default: "ANALİZ", options: ["KISA DEĞERLENDİRME", "ANALİZ", "DERİNLEMESİNE İNCELEME", "POLİTİKA NOTU"]}\n              - label: "Ana aktörler"\n                name: "key_actors"\n                widget: "list"\n                required: false\n                max: 8\n                field: {label: "Aktör", name: "actor", widget: "string"}\n              - label: "Temel kavramlar"\n                name: "key_concepts"\n                widget: "list"\n                required: false\n                max: 8\n                field: {label: "Kavram", name: "concept", widget: "string"}`;
 if(!cfg.includes(needle))throw new Error('Admin config içinde Öne çıkar alanı bulunamadı.');
 cfg=cfg.replace(needle,fields);await fs.writeFile('admin/config.yml',cfg);
}
const append=async(file,patch,marker)=>{let s=await fs.readFile(file,'utf8');if(!s.includes(marker)){s+=await fs.readFile(patch,'utf8');await fs.writeFile(file,s)}};
await append('scripts/build.mjs','v19-build-patch.txt','V19 - Dosyayı 60 Saniyede Anla');
await append('assets/atlas.css','v19-css-patch.txt','V19 - 60 Saniyede Anla');
console.log('V19 kuruldu: 60 saniyelik özet alanları, okuma süresi ve ana menü AI bağlantısı eklendi.');
