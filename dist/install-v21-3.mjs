import { promises as fs } from 'node:fs';
const css='assets/atlas.css';
await fs.access(css).catch(()=>{throw new Error('assets/atlas.css bulunamadı. Repo kökünde çalıştır.')});
let s=await fs.readFile(css,'utf8');
if(!s.includes('V21.3 - Force branded footer')){
  s+='\n'+await fs.readFile('v21-3-css-patch.txt','utf8');
  await fs.writeFile(css,s);
}
console.log('V21.3 kuruldu: Policy Atlas logosu, Cemre logosu ve makaleye özel QR PDF çıktısında zorunlu görünür yapıldı.');
