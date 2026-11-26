import { promises as fs } from 'node:fs';
let p='index.html',s=await fs.readFile(p,'utf8');
const intro='Ortadoğu jeopolitiği, enerji güvenliği ve iklim politikaları kesişiminde akademik ve stratejik araştırmalar yürütüyorum.';
if(!s.includes('PROFILE_INTRO_START'))s=s.replace(intro,`<!--PROFILE_INTRO_START-->${intro}<!--PROFILE_INTRO_END-->`);
if(!s.includes('PROFILE_ABOUT_START')){const a='<article class="profile-main"><span class="micro">POSITION PAPER / TM-P01</span>';s=s.replace(a,a+'<!--PROFILE_ABOUT_START-->').replace('</article><aside class="profile-data">','<!--PROFILE_ABOUT_END--></article><aside class="profile-data">')}
s=s.replace('<a href="odap.html"><b>03</b>Yayınlar</a>','<a href="yayinlar.html"><b>03</b>Yayınlar</a>');await fs.writeFile(p,s);console.log('V8 markers installed.');
