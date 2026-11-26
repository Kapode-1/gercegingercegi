import { promises as fs } from 'node:fs';
for(const p of ['scripts/build.mjs','_headers'])await fs.access(p).catch(()=>{throw new Error(`Eksik dosya: ${p}. Repo kökünde çalıştır.`)});
async function appendOnce(file,patch,marker){let s=await fs.readFile(file,'utf8');if(!s.includes(marker)){s+='\n'+await fs.readFile(patch,'utf8');await fs.writeFile(file,s)}}
await appendOnce('scripts/build.mjs','cache-build-patch.txt','V19.1 Mobile cache-busting');
let headers=await fs.readFile('_headers','utf8');
headers=headers.replace(/(\/assets\/\*\.css\s*\n\s*Cache-Control:)\s*[^\n]+/g,'$1 public, max-age=0, must-revalidate');
headers=headers.replace(/(\/assets\/\*\.js\s*\n\s*Cache-Control:)\s*[^\n]+/g,'$1 public, max-age=0, must-revalidate');
if(!headers.includes('V19.1 - HTML and mutable assets'))headers+='\n'+await fs.readFile('_headers-cache-patch.txt','utf8');
await fs.writeFile('_headers',headers);
console.log('Mobile cache fix installed: build asset versioning and revalidation headers enabled.');
