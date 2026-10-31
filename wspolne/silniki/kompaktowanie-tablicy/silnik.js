/* WSPÓLNY INTERFEJS WIZUALIZACJI. Dane i kod przykładu pochodzą z ARRAY_TASK. */
(() => {
  'use strict';
  const task=window.ARRAY_TASK,$=id=>document.getElementById(id),model=window.ArrayTrace;
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  let trace=null,cursor=0,dirty=false,flight=null;
  const phases={init:'PRZYGOTOWANIE',forInit:'INICJALIZACJA idx · TYLKO RAZ',body:'WEJŚCIE DO CIAŁA PĘTLI',loop:'WARUNEK PĘTLI',compare:'DECYZJA',write:'ZAPIS WARTOŚCI',len:'ZWIĘKSZENIE len',advance:'ZWIĘKSZENIE idx',loopEnd:'WYJŚCIE Z PĘTLI',done:'WYNIK'};
  const state=()=>trace?.[cursor],speed=()=>task.speeds.find(s=>s.id===$('speed').value)||task.speeds[0];
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const player=window.TracePlayer.create({iterationEnd:model.iterationEnd,stepDelay:()=>reduced()?30:speed().step,iterationDelay:()=>speed().pause,onState:(s,pos,animate)=>{cursor=pos;render(animate);},onStatus:()=>controls()});
  function removeFlight(){if(flight){flight.getAnimations().forEach(a=>a.cancel());flight.remove();flight=null;}}
  function controls(){
    const status=player.status(),ready=!!trace&&!dirty;
    $('next').disabled=!ready||status.busy||!status.canNext;$('instruction').disabled=!ready||status.busy||!status.canNext;
    $('back-step').disabled=!ready||!status.canBack;$('restart').disabled=!ready||status.position===0&&!status.busy;
    $('play').disabled=!ready||!status.canNext&&!status.busy;$('play').textContent=status.busy?'Ⅱ Pauza':'▶ Odtwarzaj';
    $('apply').textContent=dirty?'Zastosuj nowe dane →':'Zastosuj dane →';
  }
  function stop(){player.stop();removeFlight();}
  function counterText(s){
    if(s.done||s.phase==='loopEnd')return 'Koniec · '+s.nval+' / '+s.nval;
    if(s.phase==='init'||s.phase==='forInit')return 'Przed pętlą';
    if(s.phase==='advance')return 'Wykonano '+s.idx+' / '+s.nval+' iteracji';
    return 'Iteracja '+(s.idx+1)+' / '+s.nval;
  }
  function cell(value,index,s){
    const out=el('div','array-cell'+(index<s.len?' kept':index<s.idx?' scanned':'')+((s.idxInitialized&&index===s.idx)?' reading':'')+(index===s.len?' writing':'')+(s.phase==='write'&&index===s.writeIndex?' just-written':''));
    out.dataset.cell=index;
    const role=(index<s.len?'gotowy fragment wyniku; ':'')+((s.idxInitialized&&index===s.idx)?'idx — odczyt; ':'')+(index===s.len?'len — następny zapis':'');
    out.setAttribute('aria-label','Indeks '+index+', wartość '+value+'. '+role);
    const read=el('div','read-flag',(s.idxInitialized&&index===s.idx)?'idx = '+s.idx+' ↓':'');
    const box=el('div','cell-box');box.append(el('span','cell-index','['+index+']'),el('strong','cell-value',String(value)));
    const write=el('div','write-flag',index===s.len?'↑ len = '+s.len:'');out.append(read,box,write);return out;
  }
  function renderArray(s){
    const viewport=$('array-scroll'),left=viewport.scrollLeft,track=$('array-track');
    const nodes=s.tab.map((v,i)=>cell(v,i,s));
    const end=el('div','end-marker');end.dataset.end='true';end.setAttribute('aria-label','Za tablicą, indeks '+s.nval+'. To nie jest komórka.');
    end.append(el('div','read-flag',s.idxInitialized&&s.idx===s.nval?'idx = '+s.idx+' ↓':''),el('div','end-label','za ostatnią komórką'),el('div','write-flag',s.len===s.nval?'↑ len = '+s.len:''));nodes.push(end);
    track.replaceChildren(...nodes);
    const longest=Math.max(...s.tab.map(v=>String(v).length)),base=parseFloat(getComputedStyle(track).getPropertyValue('--array-cell-width'))||62;
    track.style.setProperty('--cell-size',Math.max(base,longest*8+16)+'px');
    viewport.scrollLeft=left;
    const target=s.phase==='write'?track.querySelector('[data-cell="'+s.writeIndex+'"]'):s.idx<s.nval?track.querySelector('[data-cell="'+s.idx+'"]'):end;
    if(target){const a=viewport.getBoundingClientRect(),b=target.getBoundingClientRect();if(b.right>a.right-12)viewport.scrollLeft+=b.right-a.right+20;else if(b.left<a.left+12)viewport.scrollLeft+=b.left-a.left-20;}
    $('region-note').textContent=s.done?'Zielone komórki tworzą wynik. Przygaszony ogon nadal istnieje, ale leży poza nową długością.':'Zielone komórki [0, len) są już gotowe. Odczyt i zapis dotyczą jednej, tej samej tablicy.';
  }
  function animateCopy(s){
    if(reduced()||s.phase!=='write')return;
    const from=$('array-track').querySelector('[data-cell="'+s.readIndex+'"] .cell-value'),to=$('array-track').querySelector('[data-cell="'+s.writeIndex+'"] .cell-value');
    if(!from||!to)return;
    const duration=Math.min(speed().step*.85,450);
    if(s.readIndex===s.writeIndex){to.animate([{transform:'scale(1)'},{transform:'scale(1.2)'},{transform:'scale(1)'}],{duration});return;}
    const a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),visible=$('array-scroll').getBoundingClientRect();
    // Przy długiej tablicy źródło może znajdować się poza przewiniętym widokiem.
    if(a.left<visible.left||a.right>visible.right)return;
    const n=el('div','copy-flight',String(s.value));n.setAttribute('aria-hidden','true');n.style.left=a.left+'px';n.style.top=a.top+'px';n.style.minWidth=a.width+'px';document.body.append(n);flight=n;
    const animation=n.animate([{transform:'translate(0,0)',opacity:.8},{transform:'translate('+((b.left-a.left)/2)+'px,-25px)',opacity:1},{transform:'translate('+(b.left-a.left)+'px,'+(b.top-a.top)+'px)',opacity:.9}],{duration,easing:'ease-in-out'});
    animation.finished.then(()=>{n.remove();if(flight===n)flight=null;}).catch(()=>{});
  }
  function render(animate=false){
    if(!trace)return;removeFlight();const s=state();
    for(const key of ['idx','len','nval','xval'])$(key).textContent=(key==='idx'&&!s.idxInitialized?'—':String(s[key]));
    $('iteration').textContent=counterText(s);$('phase').textContent=phases[s.phase];$('message').textContent=s.message;
    $('message').parentElement.classList.toggle('finished',!!s.done);
    document.querySelector('.workshop').classList.toggle('is-dirty',dirty);
    renderArray(s);
    window.TraceCode.highlight($('code'),s);
    const prefix=s.tab.slice(0,s.len);$('result-values').textContent=prefix.length?prefix.join('  ·  '):'∅';
    $('result-count').textContent='len = '+s.len;
    $('result-note').textContent=s.done?(prefix.length?'To wartości wypisane przez końcową pętlę programu.':'Pusta tablica wynikowa. Pętla wypisująca elementy nie wykona się ani razu.'):(prefix.length?'To zachowane dotąd wartości. Dalsze iteracje mogą dopisać kolejne.':'Jeszcze nie zachowaliśmy żadnej wartości.');
    controls();if(animate)animateCopy(s);
  }
  function load(){
    stop();const result=model.parseInput($('values').value,$('remove-value').value,task.limits);
    for(const id of ['values','remove-value'])$(id).removeAttribute('aria-invalid');
    if(!result.ok){dirty=true;$('input-error').hidden=false;$('input-error').textContent=result.message;$(result.field==='values'?'values':'remove-value').setAttribute('aria-invalid','true');$(result.field==='values'?'values':'remove-value').focus();controls();return;}
    trace=model.createTrace(result.values,result.remove);dirty=false;
    window.TraceCode.render($('code'),task,{values:result.values,length:result.values.length,remove:result.remove});
    $('input-error').hidden=true;$('original-values').textContent='['+result.values.join(', ')+'] · usuwamy '+result.remove;
    $('array-scroll').scrollLeft=0;player.setTrace(trace);countInputs();
  }
  function countInputs(){const v=$('values').value.trim();const count=v?v.split(/[\s,;]+/).length:0;$('input-count').textContent=count+' / '+task.limits.maxLength+' liczb';}
  function changed(){stop();dirty=true;document.querySelector('.workshop').classList.add('is-dirty');$('phase').textContent='NOWE DANE';$('message').textContent='Zmieniono dane wejściowe. Kliknij „Zastosuj nowe dane”, aby rozpocząć z nimi od początku. Obecny rysunek dotyczy poprzednich danych.';$('input-error').hidden=true;countInputs();controls();}
  try{
    document.title=task.id+' · Dwa indeksy w tablicy';
    for(const [id,text] of Object.entries({'task-id':task.id,eyebrow:task.eyebrow,title:task.title,description:task.description}))$(id).textContent=text;
    $('back').href=task.backLink;$('values').value=task.initial.values;$('remove-value').value=task.initial.remove;
    task.speeds.forEach(s=>{const o=el('option','',s.label);o.value=s.id;$('speed').append(o);});$('speed').value=task.defaultSpeed;
    task.notes.forEach(note=>$('notes').append(el('p','',note)));
    task.examples.forEach(example=>{const b=el('button','preset',example.label);b.type='button';b.addEventListener('click',()=>{$('values').value=example.values.join(', ');$('remove-value').value=String(example.remove);load();});$('examples').append(b);});
    $('input-help').textContent+=' Od 1 do '+task.limits.maxLength+' liczb; zakres od '+task.limits.minValue+' do '+task.limits.maxValue+'.';
    $('data-form').addEventListener('submit',e=>{e.preventDefault();load();});
    for(const id of ['values','remove-value'])$(id).addEventListener('input',changed);
    $('next').addEventListener('click',()=>player.nextIteration());$('play').addEventListener('click',()=>player.togglePlayback());
    $('instruction').addEventListener('click',()=>player.nextInstruction());
    $('back-step').addEventListener('click',()=>{removeFlight();player.back();});
    $('restart').addEventListener('click',()=>{removeFlight();player.restart();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    load();
  }catch(error){$('input-error').hidden=false;$('input-error').textContent='Nie można uruchomić przykładu: '+error.message;for(const id of ['next','instruction','play','restart','back-step'])$(id).disabled=true;}
})();
