import { promises as fs } from 'node:fs';
for(const p of ['scripts/build.mjs','assets/archive-filters.js'])await fs.access(p).catch(()=>{throw new Error(`Eksik: ${p}. Önce V20 kurulmuş olmalı.`)});
let build=await fs.readFile('scripts/build.mjs','utf8');if(!build.includes('V20.1 Unified Publications Archive')){build+='\n'+await fs.readFile('v20-1-build-patch.txt','utf8');await fs.writeFile('scripts/build.mjs',build)}
await fs.copyFile('archive-filters.js','assets/archive-filters.js');
console.log('V20.1 kuruldu: ana menü Yayınlar bağlantısı düzeltildi; ODAP ve admin yayınları tek arşivde birleştirildi.');
