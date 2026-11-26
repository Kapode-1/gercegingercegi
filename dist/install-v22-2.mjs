import { promises as fs } from 'node:fs';
for(const p of ['scripts/build.mjs','assets/atlas.css','_headers'])await fs.access(p).catch(()=>{throw new Error(`Eksik: ${p}. Repo kökünde çalıştır.`)});
const append=async(f,p,m)=>{let s=await fs.readFile(f,'utf8');if(!s.includes(m)){s+='\n'+await fs.readFile(p,'utf8');await fs.writeFile(f,s)}};
await append('scripts/build.mjs','v22-2-build-patch.txt','V22.2 Stable mobile menu normalization');
await append('assets/atlas.css','v22-2-css-patch.txt','V22.2 Stable menu items');
await append('_headers','_headers-mobile.txt','V22.2: HTML must never remain stale');
console.log('V22.2 kuruldu: Android menü yapısı normalize edildi ve HTML cache kapatıldı.');
