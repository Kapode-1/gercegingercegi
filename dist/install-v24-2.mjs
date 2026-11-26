import { promises as fs } from 'node:fs';
for(const p of ['scripts/build.mjs','_headers'])await fs.access(p).catch(()=>{throw new Error(`Eksik: ${p}. Repo kökünde çalıştır.`)});
let b=await fs.readFile('scripts/build.mjs','utf8');
// Always move V24.2 block to the literal end if installation is repeated.
if(!b.includes('V24.2 FINAL post-build cache versioning'))b+='\n'+await fs.readFile('v24-2-build-patch.txt','utf8');
await fs.writeFile('scripts/build.mjs',b);
let h=await fs.readFile('_headers','utf8');if(!h.includes('V24.2 - revalidate generated HTML'))h+='\n'+await fs.readFile('v24-2-headers-patch.txt','utf8');await fs.writeFile('_headers',h);
console.log('V24.2 kuruldu: cache sürümleme artık build sırasının en sonunda tüm TR/EN sayfalarına uygulanıyor.');
