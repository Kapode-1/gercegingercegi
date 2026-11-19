import { promises as fs } from 'node:fs';
const css='assets/atlas.css';
await fs.access(css).catch(()=>{throw new Error('assets/atlas.css bulunamadı. Repo kökünde çalıştır.')});
let s=await fs.readFile(css,'utf8');
if(!s.includes('V21.2 - Visible on web')){
  s+='\n'+await fs.readFile('v21-2-css-patch.txt','utf8');
  await fs.writeFile(css,s);
}
console.log('V21.2 kuruldu: canlı marka altlığı korundu; mobil PDF siyah sayfa ve metin kayması düzeltildi.');
