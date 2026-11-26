import fs from 'node:fs';
const target='scripts/build.mjs';
const marker='// V26 Continue Reading injection';
let build=fs.readFileSync(target,'utf8');
if(!build.includes(marker)){
  build += '\n\n'+fs.readFileSync('v26-build-patch.txt','utf8')+'\n';
  fs.writeFileSync(target,build,'utf8');
}
for(const f of ['pa-continue-reading.js','pa-continue-reading.css']){
  if(!fs.existsSync(f)) throw new Error(`${f} bulunamadı.`);
}
console.log('V26 kuruldu: Kaldığın Yerden Devam Et ve cihaz içi okuma ilerlemesi eklendi.');
