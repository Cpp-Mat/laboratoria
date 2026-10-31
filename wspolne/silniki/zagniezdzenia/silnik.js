/* OBSŁUGA STRONY. Treść, C++ i wzorzec są wyłącznie w zadanie.js. */
(() => {
  'use strict';
  const task=window.NESTED_TASK, $=id=>document.getElementById(id);
  let engine;
  try { engine=NestedRules.createEngine(task); } catch(error) { $('feedback').textContent='Błąd konfiguracji zadania: '+error.message; $('feedback').className='feedback error'; return; }
  let state=engine.fresh(), selected=null, dragged=null, tab='statement', problems=new Set(), confirmation=null, dropMarker=null;
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const button=(text,action,label)=>{const n=el('button','',text);n.type='button';if(label)n.setAttribute('aria-label',label);n.addEventListener('click',action);return n;};
  function message(text,kind='') {$('feedback').textContent=text;$('feedback').className='feedback '+kind;}
  function focusPick(id) {document.querySelector('[data-pick="'+id+'"]')?.focus({preventScroll:true});}
  function clearDrop() {if(dropMarker)dropMarker.classList.remove('over','reject');dropMarker=null;}
  function clearDrag() {dragged=null;clearDrop();document.body.classList.remove('is-dragging');document.querySelectorAll('.drag-source').forEach(n=>n.classList.remove('drag-source'));}
  // Wspólna obsługa małych znaczników i szerszych krawędzi klocków.
  // Rozmiary celów nie zmieniają się podczas przeciągania.
  function bindDrop(area,placement) {
    const indicate=e=>{
      if(!dragged)return;
      const place=placement(e);if(!place)return;
      e.preventDefault();e.stopPropagation();clearDrop();
      const error=engine.canMove(state,dragged,place.owner,place.slot);
      dropMarker=place.marker;dropMarker.classList.add(error?'reject':'over');
      e.dataTransfer.dropEffect=error?'none':'move';
    };
    area.addEventListener('dragenter',indicate);
    area.addEventListener('dragover',indicate);
    area.addEventListener('dragleave',e=>{if(!area.contains(e.relatedTarget))clearDrop();});
    area.addEventListener('drop',e=>{
      if(!dragged)return;
      const place=placement(e);if(!place)return;
      e.preventDefault();e.stopPropagation();const id=dragged;clearDrag();
      perform(id,place.owner,place.slot,place.index);
    });
  }
  function perform(id,owner,slot,index) {
    if(!id){message('Najpierw wybierz klocek, a następnie miejsce docelowe.');return;}
    const result=engine.move(state,id,owner,slot,index);
    if(!result.ok){message(result.error,'error');return;}
    selected=null;problems.clear();clearDrag();render();focusPick(id);
    message('Przeniesiono: '+engine.defs[id].title+'. Podgląd kodu jest aktualny.');
  }
  function target(owner,slot,index,empty=false) {
    const isExpr=owner!==null && engine.defs[owner].slots[slot].type==='expression';
    const name=owner===null?(slot==='bank'?'bank klocków':'program główny'):engine.defs[owner].title+' / '+engine.defs[owner].slots[slot].label;
    const text=slot==='bank'?'↩ Odłóż wybrany klocek do banku':isExpr?'◇ Wstaw warunek':empty?'＋ Wstaw instrukcję tutaj':'＋ Wstaw w tym miejscu';
    const insertion=!isExpr && slot!=='bank' && !empty;
    const n=button(insertion?'':text,()=>perform(selected,owner,slot,index),text+' — '+name);
    n.title=text+' — '+name;
    n.className='drop'+(empty?' empty':'')+(insertion?' insertion':'');n.dataset.owner=owner===null?'':owner;n.dataset.slot=slot;n.dataset.index=index;
    bindDrop(n,()=>({owner,slot,index,marker:n}));
    return n;
  }
  function highlight(id,on) {
    let ids=new Set(engine.descendants(state,id));
    // Wyrażenia są częścią nagłówka najbliższej instrukcji w kodzie.
    let parent=id;
    while(parent && engine.defs[parent].kind==='expression')parent=engine.locate(state,parent).owner;
    if(parent)ids.add(parent);
    document.querySelectorAll('.code-line[data-node]').forEach(n=>n.classList.toggle('active',on&&ids.has(n.dataset.node)));
  }
  function block(id,inBank=false) {
    const b=engine.defs[id], logical=!!b.operator&&!inBank, card=el('div','block '+(b.tone||'')+' '+b.kind+(logical?' logical':'')+(selected===id?' selected':'')+(problems.has(id)?' problem':''));card.dataset.node=id;
    const head=el('div','block-head');head.draggable=true;head.title='Przeciągnij za nagłówek lub wybierz klocek przyciskiem';
    head.addEventListener('dragstart',e=>{e.stopPropagation();clearDrop();dragged=id;e.dataTransfer.setData('text/plain',id);e.dataTransfer.effectAllowed='move';document.body.classList.add('is-dragging');card.classList.add('drag-source');});
    head.addEventListener('dragend',clearDrag);
    const pick=button('',()=>{selected=selected===id?null:id;render();focusPick(id);message(selected?'Wybrano: '+b.title+'. Kliknij pole, w którym chcesz go umieścić.':'Anulowano wybór.');},'Wybierz klocek: '+b.title);pick.className='pick';pick.dataset.pick=id;pick.setAttribute('aria-pressed',String(selected===id));
    if(logical){pick.append(el('strong','', '⠿ '+(b.operatorLabel||b.operator)));if(b.operatorHelp)pick.append(el('small','operator-help',b.operatorHelp));}
    else{pick.append(el('strong','', '⠿ '+b.title));if(b.detail)pick.append(el('small','',b.detail));}
    if(inBank && engine.descendants(state,id).length>1)pick.append(el('small','', 'Zawiera '+(engine.descendants(state,id).length-1)+' innych klocków — przeniesiesz je razem.'));
    pick.addEventListener('focus',()=>highlight(id,true));pick.addEventListener('blur',()=>highlight(id,false));head.append(pick);
    if(!inBank){const tools=el('div','tools'),loc=engine.locate(state,id),list=engine.list(state,loc.owner,loc.slot);
      if(b.kind==='statement'){
        const up=button('↑',()=>perform(id,loc.owner,loc.slot,loc.index-1),'Przesuń w górę: '+b.title);up.disabled=loc.index===0;
        const down=button('↓',()=>perform(id,loc.owner,loc.slot,loc.index+2),'Przesuń w dół: '+b.title);down.disabled=loc.index===list.length-1;tools.append(up,down);
      }
      tools.append(button('↩',()=>{tab=b.kind;perform(id,null,'bank');},'Odłóż do banku: '+b.title));head.append(tools);
    }
    if(!logical)card.append(head);
    head.addEventListener('mouseenter',()=>highlight(id,true));head.addEventListener('mouseleave',()=>highlight(id,false));
    if(!inBank && b.kind==='statement'){
      bindDrop(card,e=>{
        // Dzieci mają własne cele; rodzic nie przechwytuje ich gestów.
        if(e.target.closest('.block')!==card)return null;
        const rect=card.getBoundingClientRect(),header=head.getBoundingClientRect();
        let after;
        if(head.contains(e.target))after=!b.slots && e.clientY>header.top+header.height/2;
        else if(e.clientY>=rect.bottom-14)after=true;
        else if(e.clientY<=rect.top+14)after=false;
        else return null;
        const loc=engine.locate(state,id),marker=after?card.nextElementSibling:card.previousElementSibling;
        return {owner:loc.owner,slot:loc.slot,index:loc.index+(after?1:0),marker};
      });
    }
    if(!inBank && b.slots){const body=el('div','block-body');for(const [name,s] of Object.entries(b.slots)){
      if(logical&&name==='b')body.append(head);
      body.append(el('div',logical?'sr-only':'slot-label',s.label));const zone=el('div',s.type==='expression'?'expr-slot':'slot');zone.setAttribute('aria-label',b.title+' — '+s.label);const ids=state.nodes[id].slots[name];
      if(s.type==='expression'){if(ids.length)zone.append(block(ids[0]));else zone.append(target(id,name,0,true));}
      else renderList(zone,ids,id,name);
      body.append(zone);
    }card.append(body);}
    return card;
  }
  function renderList(zone,ids,owner,slot){zone.append(target(owner,slot,0,!ids.length));ids.forEach((id,i)=>{zone.append(block(id));zone.append(target(owner,slot,i+1));});}
  function render() {
    clearDrop();document.body.classList.toggle('is-selecting',!!selected);
    const active=document.activeElement,copyOpen=$('source').closest('details').open;
    $('bank').replaceChildren();const bankIds=state.bank.filter(id=>engine.defs[id].kind===tab);bankIds.forEach(id=>$('bank').append(block(id,true)));
    if(!bankIds.length)$('bank').append(el('p','bank-empty','Wszystkie klocki tej grupy są już w układzie lub wewnątrz innych klocków.'));
    document.querySelectorAll('[data-tab]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.tab===tab));b.textContent=(b.dataset.tab==='statement'?'Instrukcje':'Warunki')+' · '+state.bank.filter(id=>engine.defs[id].kind===b.dataset.tab).length;});
    $('bank-return').replaceChildren(target(null,'bank',state.bank.length));$('board').replaceChildren();renderList($('board'),state.root,null,'root');
    const used=state.root.flatMap(id=>engine.descendants(state,id)).length;$('progress').textContent=used+' / '+task.blocks.length+' klocków';
    const rows=engine.generate(state);$('code').replaceChildren(...rows.map(row=>{const n=el('span','code-line',row.text||' ');if(row.id)n.dataset.node=row.id;return n;}));$('source').value=rows.map(r=>r.text).join('\n')+'\n';$('copy-status').textContent='';
    if(active===$('source')&&copyOpen)$('source').focus();
  }
  for(const [id,value] of Object.entries({'task-id':task.id,eyebrow:task.eyebrow,title:task.title,subtitle:task.subtitle,description:task.description,instruction:task.instruction,notes:task.notes,example:task.example}))$(id).textContent=value;
  document.title=task.id+' · '+task.title;$('back').href=task.backLink;
  document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;render();b.focus();}));
  document.addEventListener('dragover',clearDrop);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){selected=null;clearDrag();render();message('Anulowano wybór klocka.');}});
  $('check').addEventListener('click',()=>{const result=engine.check(state);problems=new Set(result.errors.map(e=>e.id).filter(Boolean));render();message(result.ok?task.success:result.errors[0].message+' Zaznaczono elementy wymagające sprawdzenia.',result.ok?'success':'error');});
  function confirmAction(title,text,fn){$('confirm-title').textContent=title;$('confirm-text').textContent=text;confirmation=fn;$('confirm').showModal();$('cancel').focus();}
  $('cancel').addEventListener('click',()=>$('confirm').close());$('accept').addEventListener('click',()=>{const fn=confirmation;$('confirm').close();fn?.();});$('confirm').addEventListener('close',()=>{confirmation=null;});
  $('reset').addEventListener('click',()=>confirmAction('Zacząć od nowa?','Wszystkie klocki wrócą osobno do banku. Obecny układ zostanie usunięty.',()=>{state=engine.fresh();selected=null;problems.clear();tab='statement';render();message('Nowy układ. Zacznij od instrukcji, potem dodaj warunki.');}));
  $('show').addEventListener('click',()=>confirmAction('Pokazać przykładowy układ?','Zastąpi on Twoją pracę. Możesz potem przesuwać klocki i obserwować zmiany kodu.',()=>{state=engine.solution();selected=null;problems.clear();render();message('To przykładowe rozwiązanie. Sprawdź, dlaczego przejście do nowego wiersza znajduje się poza pętlą po kolumnach.');}));
  $('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('source').value);$('copy-status').textContent='Skopiowano kod.';}catch{$('source').focus();$('source').select();$('copy-status').textContent='Kod zaznaczony. Naciśnij Ctrl+C (lub ⌘C).';}});
  render();
})();
