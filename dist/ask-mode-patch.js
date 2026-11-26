// Put beside ask.html and run once: node ask-mode-patch.js
import { promises as fs } from 'node:fs';let s=await fs.readFile('ask.html','utf8');
if(!s.includes('new URLSearchParams(location.search)'))s=s.replace("const ENDPOINT=", "const requestedMode=new URLSearchParams(location.search).get('mode');if(requestedMode==='web'||requestedMode==='atlas'){const radio=document.querySelector(`[name=\\\"ai-mode\\\"][value=\\\"${requestedMode}\\\"]`);if(radio)radio.checked=true;}const ENDPOINT=");
if(!s.includes("j.webNotice"))s=s.replace("text.textContent=j.answer;", "text.textContent=(j.webNotice?j.webNotice+'\\n\\n':'')+j.answer;");
await fs.writeFile('ask.html',s);console.log('ask.html mode and web fallback patch applied.');
