import { promises as fs } from 'node:fs';
const exists=async p=>fs.access(p).then(()=>true).catch(()=>false);
for(const p of ['admin/config.yml','scripts/build.mjs','assets/atlas.css'])if(!(await exists(p)))throw new Error(`Eksik dosya: ${p}. install-v16.mjs repo kökünde çalıştırılmalı.`);
let cfg=await fs.readFile('admin/config.yml','utf8');
if(!cfg.includes('name: "comments_enabled"')){
 const needle='              - {label: "Öne çıkar", name: "featured", widget: "boolean", default: false}';
 const fields=`${needle}\n              - {label: "Yorumları aç", name: "comments_enabled", widget: "boolean", default: true, required: false}\n              - {label: "Yorum bölümü başlığı", name: "comments_title", widget: "string", default: "Tartışma / Okur Notları", required: false}\n              - {label: "Yorum çağrısı", name: "comments_intro", widget: "text", default: "Bu analiz hakkında düşünceni paylaş. Katkıların konuya ilişkin ve saygılı olmasını rica ederim.", required: false}`;
 if(!cfg.includes(needle))throw new Error('Admin config içinde Öne çıkar alanı bulunamadı.');
 cfg=cfg.replace(needle,fields);await fs.writeFile('admin/config.yml',cfg);
}
const appendOnce=async(file,patch,marker)=>{let s=await fs.readFile(file,'utf8');if(!s.includes(marker)){s+=await fs.readFile(patch,'utf8');await fs.writeFile(file,s)}};
await appendOnce('scripts/build.mjs','build-patch.txt','V16 Giscus comments');
await appendOnce('assets/atlas.css','css-patch.txt','V16 Giscus comments');
await fs.copyFile('_headers-v16','_headers');
console.log('V16 kuruldu: admin alanları, Giscus build kodu, tema ve CSP güncellendi.');
