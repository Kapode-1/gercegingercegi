import { promises as fs } from 'node:fs';
for(const p of ['package.json','scripts/build.mjs','assets/atlas.css'])await fs.access(p).catch(()=>{throw new Error(`Eksik: ${p}. Repo kökünde çalıştır.`)});
let pkg=JSON.parse(await fs.readFile('package.json','utf8'));pkg.dependencies={...(pkg.dependencies||{}),qrcode:'^1.5.4'};await fs.writeFile('package.json',JSON.stringify(pkg,null,2)+'\n');
await fs.mkdir('assets/brand',{recursive:true});await fs.copyFile('assets-v21/policy-atlas-mark.jpg','assets/brand/policy-atlas-mark.jpg');await fs.copyFile('assets-v21/cemre-iu-logo.jpg','assets/brand/cemre-iu-logo.jpg');
const append=async(f,p,m)=>{let s=await fs.readFile(f,'utf8');if(!s.includes(m)){s+='\n'+await fs.readFile(p,'utf8');await fs.writeFile(f,s)}};
await append('scripts/build.mjs','v21-build-patch.txt','V21 ODAP quick briefs');await append('assets/atlas.css','v21-css-patch.txt','V21 article footer');
console.log('V21 kuruldu: ODAP hızlı özetleri, makaleye özel QR, iki logo ve beyaz PDF altlığı eklendi.');
