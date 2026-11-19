import { promises as fs } from 'node:fs';
for(const p of ['scripts/build.mjs','assets/atlas.css'])await fs.access(p).catch(()=>{throw new Error(`Eksik: ${p}. Repo kökünde çalıştır.`)});
const append=async(f,p,m)=>{let s=await fs.readFile(f,'utf8');if(!s.includes(m)){s+='\n'+await fs.readFile(p,'utf8');await fs.writeFile(f,s)}};
await append('scripts/build.mjs','v22-3-build-patch.txt','V22.3 FINAL menu rebuild');
await append('assets/atlas.css','v22-3-css-patch.txt','V22.3 canonical navigation layout');
console.log('V22.3 kuruldu: menü tek blok halinde yeniden kuruldu; Timeline ve asset URLleri her deploymentta yenileniyor.');
