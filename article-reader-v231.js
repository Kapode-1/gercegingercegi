(()=>{
  const readers=[...document.querySelectorAll('.audio-reader')];
  if(!readers.length)return;
  const supported='speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  if(!supported){readers.forEach(r=>{r.querySelector('.audio-status').textContent='BU TARAYICI SESLİ OKUMAYI DESTEKLEMİYOR';r.querySelectorAll('button,select').forEach(x=>x.disabled=true)});return}
  const synth=window.speechSynthesis;
  let allVoices=[];
  const languageCode=r=>r.dataset.lang==='EN'?'en':'tr';
  const refreshVoices=()=>{
    const loaded=synth.getVoices()||[];
    if(loaded.length)allVoices=loaded;
    readers.forEach(r=>{
      const select=r.querySelector('.audio-voice'),wanted=languageCode(r),current=select.value;
      const matching=allVoices.filter(v=>String(v.lang||'').toLowerCase().startsWith(wanted));
      const fallback=matching.length?matching:allVoices;
      select.innerHTML='<option value="">Otomatik</option>'+fallback.map(v=>`<option value="${encodeURIComponent(v.name)}">${v.name} (${v.lang||'?'})${v.localService?' • cihaz':''}</option>`).join('');
      if([...select.options].some(o=>o.value===current))select.value=current;
      const status=r.querySelector('.audio-status');
      if(!allVoices.length)status.textContent='SES MOTORU HAZIRLANIYOR';
      else if(!matching.length)status.textContent=wanted==='tr'?'TÜRKÇE SES BULUNAMADI • OTOMATİK SES KULLANILACAK':'İNGİLİZCE SES BULUNAMADI • OTOMATİK SES KULLANILACAK';
      else if(!status.textContent.includes('OKUNUYOR'))status.textContent='DİNLEMEYE HAZIR';
    });
  };
  refreshVoices();
  [150,500,1200,2500].forEach(ms=>setTimeout(refreshVoices,ms));
  if('onvoiceschanged' in synth)synth.onvoiceschanged=refreshVoices;
  readers.forEach(reader=>{
    const play=reader.querySelector('.audio-play'),pause=reader.querySelector('.audio-pause'),stop=reader.querySelector('.audio-stop'),rate=reader.querySelector('.audio-rate'),voiceSelect=reader.querySelector('.audio-voice'),status=reader.querySelector('.audio-status'),bar=reader.querySelector('.audio-reader-progress i');
    let chunks=[],index=0,active=false,paused=false,generation=0;
    const article=()=>document.querySelector('#full-analysis')||document.querySelector('.article-layout')||reader.parentElement;
    const getText=()=>{
      const source=article();if(!source)return '';
      const clone=source.cloneNode(true);
      clone.querySelectorAll('script,style,nav,button,select,.article-tools,.sixty-summary,.reader-notes,.giscus-comments,.audio-reader,.policy-brief-print').forEach(x=>x.remove());
      return String(clone.innerText||clone.textContent||'').replace(/\s+/g,' ').trim();
    };
    const split=text=>{
      const sentences=text.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g)||[text],out=[];let current='';
      for(const sentence of sentences){const next=(current+' '+sentence).trim();if(next.length>320&&current){out.push(current.trim());current=sentence.trim()}else current=next}if(current)out.push(current.trim());return out.filter(Boolean)
    };
    const chosenVoice=()=>{
      const selected=decodeURIComponent(voiceSelect.value||'');
      if(selected)return allVoices.find(v=>v.name===selected)||null;
      const wanted=languageCode(reader);
      return allVoices.find(v=>String(v.lang||'').toLowerCase().startsWith(wanted)&&v.localService)||allVoices.find(v=>String(v.lang||'').toLowerCase().startsWith(wanted))||allVoices.find(v=>v.default)||allVoices[0]||null;
    };
    const ui=(message)=>{status.textContent=message;pause.disabled=!active;stop.disabled=!active;pause.textContent=paused?'DEVAM ET':'DURAKLAT';bar.style.width=chunks.length?`${Math.min(100,index/chunks.length*100)}%`:'0%'};
    const speak=token=>{
      if(!active||paused||token!==generation)return;
      if(index>=chunks.length){active=false;bar.style.width='100%';ui('OKUMA TAMAMLANDI');return}
      const u=new SpeechSynthesisUtterance(chunks[index]);u.lang=reader.dataset.lang==='EN'?'en-US':'tr-TR';u.rate=Number(rate.value)||1;u.pitch=1;u.volume=1;const v=chosenVoice();if(v)u.voice=v;
      u.onstart=()=>ui(`OKUNUYOR • ${index+1}/${chunks.length}`);
      u.onend=()=>{if(token!==generation)return;index++;ui(`OKUNUYOR • ${Math.min(index+1,chunks.length)}/${chunks.length}`);setTimeout(()=>speak(token),120)};
      u.onerror=e=>{if(['canceled','interrupted'].includes(e.error))return;active=false;ui(`SES HATASI: ${String(e.error||'BİLİNMİYOR').toUpperCase()}`)};
      synth.speak(u);
      // Android Chrome sometimes stays paused after a previous lifecycle event.
      if(synth.paused)synth.resume();
    };
    play.addEventListener('click',()=>{
      generation++;synth.cancel();refreshVoices();const text=getText();
      if(!text){active=false;ui('OKUNACAK METİN BULUNAMADI');return}
      chunks=split(text);index=0;active=true;paused=false;ui('SES HAZIRLANIYOR');const token=generation;setTimeout(()=>speak(token),180);
    });
    pause.addEventListener('click',()=>{if(!active)return;if(paused||synth.paused){synth.resume();paused=false;ui(`OKUNUYOR • ${index+1}/${chunks.length}`)}else{synth.pause();paused=true;ui('DURAKLATILDI')}});
    stop.addEventListener('click',()=>{generation++;synth.cancel();active=false;paused=false;index=0;ui('DİNLEMEYE HAZIR')});
    rate.addEventListener('change',()=>{if(!active)return;generation++;synth.cancel();paused=false;const token=generation;setTimeout(()=>speak(token),140)});
    window.addEventListener('pagehide',()=>{generation++;synth.cancel()});
  });
})();
