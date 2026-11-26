// Optional automatic patcher. Put this file beside ask.html and run: node ask-fix.js
import { promises as fs } from 'node:fs';
const file='ask.html';let s=await fs.readFile(file,'utf8');
const css='.ai-answer,.ai-answer *{pointer-events:auto!important;cursor:auto}.ai-answer a,.ai-sources a{cursor:pointer!important}.ai-answer.active{position:relative;z-index:5}.ai-text{user-select:text}.ai-answer::before,.ai-answer::after{pointer-events:none!important}';
if(!s.includes('.ai-answer,.ai-answer *{pointer-events:auto'))s=s.replace('</style>',css+'</style>');
s=s.replace("box.scrollIntoView({behavior:'smooth',block:'start'})","const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;requestAnimationFrame(()=>box.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'}))");
await fs.writeFile(file,s);console.log('ask.html cursor and answer-scroll fix applied.');
