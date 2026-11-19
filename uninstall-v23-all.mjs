import { promises as fs } from 'node:fs';
const buildFile='scripts/build.mjs';
const cssFile='assets/atlas.css';
for(const p of [buildFile,cssFile])await fs.access(p).catch(()=>{throw new Error(`Eksik: ${p}. Repo kökünde çalıştır.`)});
const backupStamp=new Date().toISOString().replace(/[:.]/g,'-');
await fs.copyFile(buildFile,`${buildFile}.before-v23-rollback-${backupStamp}.bak`);
await fs.copyFile(cssFile,`${cssFile}.before-v23-rollback-${backupStamp}.bak`);
let build=await fs.readFile(buildFile,'utf8');
let css=await fs.readFile(cssFile,'utf8');
const buildMarkers=[
 '// V23 Policy Atlas Article Audio Reader',
 '// V23.1 force repaired audio reader asset on every article',
 '// V23.2 remove duplicate audio readers and normalize placement',
 '// V23.3 UNIVERSAL AUDIO RESET - runs last across personal and ODAP article pages',
 '// V23.4 ORPHAN AUDIO CONTROL KILL SWITCH'
];
const cssMarkers=[
 '/* V23 Article Audio Reader */',
 '/* V23.1 audio repair status */',
 '/* V23.2 remove black bars and duplicate-looking native controls */',
 '/* V23.3 UNIVERSAL AUDIO RESET */',
 '/* V23.4 hide every orphan audio fragment, then restore only canonical controls */'
];
function removeAppendedVersionBlocks(text,markers){
 const positions=markers.map(m=>({m,i:text.indexOf(m)})).filter(x=>x.i>=0).sort((a,b)=>a.i-b.i);
 if(!positions.length)return text;
 const first=positions[0].i;
 // V23 was appended after all prior site features. Remove the V23 tail in one clean cut.
 return text.slice(0,first).trimEnd()+'\n';
}
build=removeAppendedVersionBlocks(build,buildMarkers);
css=removeAppendedVersionBlocks(css,cssMarkers);
await fs.writeFile(buildFile,build);
await fs.writeFile(cssFile,css);
for(const name of ['article-reader.js','article-reader-v231.js','article-reader-v232.js','article-reader-v233.js','audio-orphan-killer.js']){
 try{await fs.unlink(`assets/${name}`)}catch{}
}
console.log('V23 tamamen geri alındı. Yazılar yeniden temiz kaynaktan üretilecek; sesli okuma geçici olarak kaldırıldı.');
console.log(`Yedekler: ${buildFile}.before-v23-rollback-${backupStamp}.bak ve ${cssFile}.before-v23-rollback-${backupStamp}.bak`);
