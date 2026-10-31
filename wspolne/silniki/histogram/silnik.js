/* ADAPTER WIDOKU HISTOGRAMU. Odtwarzanie i cofanie: TracePlayer. */
(() => {
  'use strict';
  const task=window.HISTOGRAM_TASK,model=window.HistogramTrace,$=id=>document.getElementById(id);
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const phases={init:'ZEROWANIE LICZNIKÓW',forInit:'INICJALIZACJA idx · TYLKO RAZ',body:'WEJŚCIE DO CIAŁA PĘTLI',loop:'WARUNEK PĘTLI',load:'ODCZYT DO ZMIENNEJ',validate:'SPRAWDZENIE ZAKRESU',address:'WYBÓR KOMÓRKI',increment:'ZWIĘKSZENIE LICZNIKA',skip:'POMINIĘCIE WARTOŚCI',advance:'ZWIĘKSZENIE idx',loopEnd:'KONIEC PĘTLI',printInit:'INICJALIZACJA liczba · TYLKO RAZ',printCondition:'WARUNEK PĘTLI WIERSZY',printBody:'WEJŚCIE DO CIAŁA PĘTLI WIERSZY',printLabel:'WYPISANIE INDEKSU',starInit:'INICJALIZACJA gwiazdka',starCondition:'WARUNEK PĘTLI GWIAZDEK',starBody:'WEJŚCIE DO CIAŁA PĘTLI GWIAZDEK',printStar:'WYPISANIE JEDNEJ GWIAZDKI',starAdvance:'ZWIĘKSZENIE gwiazdka',starEnd:'KONIEC PĘTLI GWIAZDEK',printNewline:'KONIEC WIERSZA',printAdvance:'ZWIĘKSZENIE liczba',printEnd:'KONIEC WYPISYWANIA',done:'WYNIK'};
  let trace=null,dirty=false,flight=null;
  const speed=()=>task.speeds.find(s=>s.id===$('speed').value)||task.speeds[0];
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const player=window.TracePlayer.create({iterationEnd:model.iterationEnd,stepDelay:()=>reduced()?30:speed().step,iterationDelay:()=>speed().pause,onState:(s,pos,animate)=>render(s,animate),onStatus:()=>controls()});
  function controls(){
    const s=player.status(),ready=!!trace&&!dirty;
    $('next').disabled=!ready||s.busy||!s.canNext;$('instruction').disabled=!ready||s.busy||!s.canNext;
    $('back-step').disabled=!ready||!s.canBack;$('restart').disabled=!ready||s.position===0&&!s.busy;
    $('play').disabled=!ready||!s.canNext&&!s.busy;$('play').textContent=s.busy?'Ⅱ Pauza':'▶ Odtwarzaj';
    $('apply').textContent=dirty?'Zastosuj nowe dane →':'Zastosuj dane →';
  }
  function removeFlight(){if(flight){flight.getAnimations().forEach(a=>a.cancel());flight.remove();flight=null;}}
  function follow(viewport,target){if(!target)return;const a=viewport.getBoundingClientRect(),b=target.getBoundingClientRect();if(b.right>a.right-12)viewport.scrollLeft+=b.right-a.right+20;else if(b.left<a.left+12)viewport.scrollLeft+=b.left-a.left-20;}
  function renderInput(s){
    const viewport=$('array-scroll'),left=viewport.scrollLeft,track=$('array-track');
    track.replaceChildren(...s.tab.map((value,i)=>{const n=el('div','array-cell'+(i<s.idx?' scanned':'')+((s.idxInitialized&&i===s.idx)?' reading':'')+((s.idxInitialized&&i===s.idx)&&s.valid===false?' invalid':''));n.dataset.cell=i;n.setAttribute('aria-label','tab['+i+'] = '+value+((s.idxInitialized&&i===s.idx)?', bieżący odczyt':''));const box=el('div','cell-box');box.append(el('span','cell-index','['+i+']'),el('strong','cell-value',String(value)));n.append(el('div','read-flag',(s.idxInitialized&&i===s.idx)?'idx = '+i+' ↓':''),box);return n;}));
    const end=el('div','end-marker');end.append(el('div','read-flag',s.idxInitialized&&s.idx===s.nval?'idx = '+s.idx+' ↓':''),el('div','end-label','koniec tab'));track.append(end);
    const base=parseFloat(getComputedStyle(track).getPropertyValue('--array-cell-width'))||58;track.style.setProperty('--cell-size',Math.max(base,...s.tab.map(v=>String(v).length*8+16))+'px');
    viewport.scrollLeft=left;follow(viewport,s.idx<s.nval?track.querySelector('[data-cell="'+s.idx+'"]'):end);
  }
  function renderHistogram(s){
    const viewport=$('hist-scroll'),left=viewport.scrollLeft,target=s.stage==='output'?s.outputTarget:s.target;
    $('histogram-track').replaceChildren(...s.histogram.map((count,i)=>{const n=el('div','hist-cell'+(target===i?' target':'')+(s.phase==='increment'&&s.target===i?' updated':''));n.dataset.bin=i;n.setAttribute('aria-label','histogram['+i+'] = '+count);n.append(el('span','hist-index','['+i+']'),el('strong','hist-count',String(count)));return n;}));
    viewport.scrollLeft=left;if(target!==null)follow(viewport,$('histogram-track').querySelector('[data-bin="'+target+'"]'));
  }
  function chart(s){
    const table=$('chart');
    const row=(index,header=false)=>{
      const n=el('div','chart-row'+(header?' header':'')+(!header&&s.stage==='output'&&s.liczba===index?' highlight':''));n.setAttribute('role','row');
      const label=el('div','chart-label',header?'Indeks':index+':');label.setAttribute('role',header?'columnheader':'cell');
      const bar=el('div','chart-stars');bar.setAttribute('role',header?'columnheader':'cell');
      if(header)bar.textContent='Gwiazdki';
      else{n.dataset.chartBin=index;const stars=el('span','','*'.repeat(s.printed[index]));bar.append(stars);bar.setAttribute('aria-label','Wypisano '+s.printed[index]+' z '+s.histogram[index]+' gwiazdek');n.classList.toggle('complete',s.rowFinished[index]);}
      n.append(label,bar);return n;
    };
    table.replaceChildren(row(null,true),...s.histogram.map((_,i)=>i).filter(i=>s.rowStarted[i]).map(i=>row(i)));
    $('result-note').textContent=s.done?'To wynik wypisany przez program. Liczba gwiazdek = '+s.accepted+'; pominięto '+s.ignored+' danych spoza zakresu.':s.stage==='count'?'Najpierw zliczamy wystąpienia w tablicy histogram. Gwiazdki pojawią się dopiero podczas wykonywania pętli wypisujących wynik.':'Każde wykonanie cout << \'*\' dopisuje jedną gwiazdkę. Warunek pętli ani zwiększenie gwiazdka nie wypisują znaków.';
  }
  function animate(s){
    if(reduced())return;
    if(s.phase==='increment'){const value=$('histogram-track').querySelector('[data-bin="'+s.target+'"] .hist-count');value?.animate([{transform:'scale(1)'},{transform:'scale(1.3)'},{transform:'scale(1)'}],{duration:Math.min(speed().step*.85,450)});}
    if(s.phase!=='load')return;
    const from=$('array-track').querySelector('[data-cell="'+s.idx+'"] .cell-value'),to=$('wartosc');if(!from)return;
    const a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),n=el('div','copy-flight',String(s.wartosc));n.style.left=a.left+'px';n.style.top=a.top+'px';n.setAttribute('aria-hidden','true');document.body.append(n);flight=n;
    const effect=n.animate([{transform:'translate(0,0)',opacity:.9},{transform:'translate('+(b.left-a.left)+'px,'+(b.top-a.top)+'px)',opacity:.2}],{duration:Math.min(speed().step*.85,450),easing:'ease-in-out'});effect.finished.then(()=>{n.remove();if(flight===n)flight=null;}).catch(()=>{});
  }
  function render(s,animated=false){
    if(!s)return;removeFlight();for(const key of ['idx','nval','accepted','ignored'])$(key).textContent=(key==='idx'&&!s.idxInitialized?'—':String(s[key]));$('wartosc').textContent=s.wartosc===null?'—':String(s.wartosc);$('sum').textContent=s.histogram.reduce((a,b)=>a+b,0);
    $('iteration').textContent=s.done||s.phase==='loopEnd'?'Koniec · '+s.nval+' / '+s.nval:(s.phase==='init'||s.phase==='forInit')?'Przed pętlą':s.phase==='advance'?'Wykonano '+s.idx+' / '+s.nval+' iteracji':'Iteracja '+(s.idx+1)+' / '+s.nval;
    if(s.stage==='output')$('iteration').textContent=s.done?'Koniec programu':s.liczba<s.histogram.length?'Wypisywanie · indeks '+s.liczba:'Koniec wypisywania';
    $('output-variables').hidden=s.stage!=='output';$('liczba').textContent=s.liczba===null?'—':String(s.liczba);$('gwiazdka').textContent=s.gwiazdka===null?'—':String(s.gwiazdka);
    $('phase').textContent=phases[s.phase];$('message').textContent=s.message;const narration=$('message').parentElement;narration.classList.toggle('finished',!!s.done);narration.classList.toggle('skipped',s.valid===false);
    $('read-expression').textContent=!s.idxInitialized?'idx jeszcze nie istnieje':s.idx<s.nval?'tab['+s.idx+']':'koniec tab';$('value-expression').textContent='wartosc = '+(s.wartosc===null?'?':s.wartosc);
    $('target-expression').textContent=s.wartosc===null?'najpierw odczytaj liczbę':s.valid===false?'poza zakresem — brak indeksowania':s.target===null?(s.valid===true?'zakres poprawny — wybierz licznik':'najpierw sprawdź zakres'):'histogram['+s.target+']';$('value-path').classList.toggle('invalid',s.valid===false);
    if(s.stage==='output'){$('read-expression').textContent=s.outputTarget===null?'koniec histogramu':'histogram['+s.liczba+']';$('value-expression').textContent=s.outputTarget===null?'wszystkie wiersze gotowe':'licznik = '+s.histogram[s.liczba];$('target-expression').textContent=s.gwiazdka===null?'wybierz kolejny wiersz':'gwiazdka = '+s.gwiazdka;$('value-path').classList.remove('invalid');}
    document.querySelector('.workshop').classList.toggle('is-dirty',dirty);renderInput(s);renderHistogram(s);chart(s);
    window.TraceCode.highlight($('code'),s);
    controls();if(animated)animate(s);
  }
  function count(){const t=$('values').value.trim();$('input-count').textContent=(t?t.split(/[\s,;]+/).length:0)+' / '+task.limits.maxLength+' liczb';}
  function stop(){player.stop();removeFlight();}
  function load(){
    stop();const result=model.parseInput($('values').value,task.limits);$('values').removeAttribute('aria-invalid');
    if(!result.ok){dirty=true;$('input-error').hidden=false;$('input-error').textContent=result.message;$('values').setAttribute('aria-invalid','true');$('values').focus();controls();return;}
    dirty=false;trace=model.createTrace(result.values,task.range);window.TraceCode.render($('code'),task,{values:result.values,length:result.values.length});$('input-error').hidden=true;$('array-scroll').scrollLeft=0;$('hist-scroll').scrollLeft=0;player.setTrace(trace);count();
  }
  document.title=task.id+' · Budowanie histogramu';for(const [id,text] of Object.entries({'task-id':task.id,eyebrow:task.eyebrow,title:task.title,description:task.description}))$(id).textContent=text;
  $('back').href=task.backLink;$('values').value=task.initial;$('input-help').textContent='Od 1 do '+task.limits.maxLength+' liczb całkowitych, rozdzielonych spacjami, przecinkami lub średnikami. Wartości spoza 0–9 są dozwolone w danych — pętla pokaże ich pomijanie. Zakres int: '+task.limits.minValue+'…'+task.limits.maxValue+'.';
  task.speeds.forEach(s=>{const n=el('option','',s.label);n.value=s.id;$('speed').append(n);});$('speed').value=task.defaultSpeed;
  task.notes.forEach(note=>$('notes').append(el('p','',note)));task.examples.forEach(example=>{const n=el('button','preset',example.label);n.type='button';n.addEventListener('click',()=>{$('values').value=example.values.join(', ');load();});$('examples').append(n);});
  $('data-form').addEventListener('submit',e=>{e.preventDefault();load();});$('values').addEventListener('input',()=>{stop();dirty=true;$('values').removeAttribute('aria-invalid');$('input-error').hidden=true;document.querySelector('.workshop').classList.add('is-dirty');$('phase').textContent='NOWE DANE';$('message').textContent='Zastosuj nowe dane, aby rozpocząć z nimi od początku. Obecny rysunek dotyczy poprzednich danych.';count();controls();});
  $('next').addEventListener('click',()=>player.nextIteration());$('instruction').addEventListener('click',()=>player.nextInstruction());$('play').addEventListener('click',()=>player.togglePlayback());$('back-step').addEventListener('click',()=>{removeFlight();player.back();});$('restart').addEventListener('click',()=>{removeFlight();player.restart();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});load();
})();
