import { promises as fs } from 'node:fs';
for(const p of ['scripts/build.mjs','assets/atlas.css'])await fs.access(p).catch(()=>{throw new Error(`Eksik: ${p}. Repo kökünde çalıştır.`)});
const append=async(f,p,m)=>{let s=await fs.readFile(f,'utf8');if(!s.includes(m)){s+='\n'+await fs.readFile(p,'utf8');await fs.writeFile(f,s)}};
await append('scripts/build.mjs','v21-build-patch.txt','V21 Policy Brief PDF Export');
await append('assets/atlas.css','v21-css-patch.txt','V21 Policy Brief PDF Export');
console.log('V21 kuruldu: özel Policy Atlas PDF brifing çıktısı etkinleştirildi.');
