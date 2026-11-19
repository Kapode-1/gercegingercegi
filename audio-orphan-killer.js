(()=>{
 const canonical=document.querySelector('.audio-reader-canonical');
 // Remove every voice/rate select that is not a descendant of the one canonical reader.
 document.querySelectorAll('.audio-voice,.audio-rate').forEach(el=>{if(!canonical||!canonical.contains(el)){const label=el.closest('label');if(label&&(!canonical||!canonical.contains(label)))label.remove();else el.remove()}});
 // Remove orphan wrappers, including the dark bar shown above article heroes.
 document.querySelectorAll('.audio-reader-controls,.audio-reader-progress,.audio-reader-brand,.audio-reader-note').forEach(el=>{if(!canonical||!canonical.contains(el))el.remove()});
 document.querySelectorAll('.audio-reader').forEach(el=>{if(!el.classList.contains('audio-reader-canonical'))el.remove()});
 // Remove empty dark containers left by prior malformed audio markup.
 [...document.querySelectorAll('body div, body section')].forEach(el=>{if(canonical&&canonical.contains(el))return;const cls=String(el.className||'');if(/audio-reader/.test(cls)&&!el.textContent.trim()&&!el.querySelector('img,video,canvas,svg'))el.remove()});
})();
