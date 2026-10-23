/* SILNIK: kategorie typów + literały zagnieżdżone w typach. Działa offline. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const task=window.MATCHING_TASK;
  let rules;
  try{rules=window.MatchingRules.create(task);}
  catch(error){
    $('feedback').textContent=error.message;
    ['check','reset','help','solo'].forEach(id=>$(id).disabled=true);
    return;
  }
  // Położenie typu w kategorii; położenie literału w typie (lub null = bank).
  const placements=new Map(task.items.map(item=>[item.id,null]));
  const literalOwners=new Map(task.literals.map(item=>[item.id,null]));
  const shuffle=source=>{
    const ids=source.slice();
    for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
    return ids;
  };
  let typeOrder=shuffle(task.items.map(i=>i.id));
  let literalOrder=shuffle(task.literals.map(i=>i.id));
  let mode=task.defaultMode,selected=null,checked=null,attempts=0,drag=null,suppressClick=false;

  document.title=task.id+' · Typy i literały C++';
  for(const key of ['eyebrow','heading','accent','description'])$(key).textContent=task[key];
  $('badge').textContent=task.id;$('back').href=task.backLink;
  (task.notes||[]).forEach(note=>{const p=document.createElement('p');p.textContent=note;$('notes').append(p);});
  if(task.source){$('source').textContent=task.source.label;$('source').href=task.source.url;}
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  function action(text,cls,fn,label){
    const b=el('button',cls,text);b.type='button';b.onclick=fn;
    if(label)b.setAttribute('aria-label',label);
    return b;
  }
  function feedback(text,kind=''){$('feedback').textContent=text;$('feedback').className='feedback '+kind;}
  function clearResult(){checked=null;$('success').hidden=true;}
  function focusSelected(kind,id){document.querySelector(kind==='type'?'[data-card="'+id+'"]':'[data-literal-card="'+id+'"]')?.focus({preventScroll:true});}
  function selectedIs(kind){return selected?.kind===kind;}
  function select(kind,id,label){
    if(suppressClick)return;
    selected=selected?.kind===kind&&selected.id===id?null:{kind,id};
    render();if(selected)focusSelected(kind,id);
    feedback(selected?'Wybrano „'+label+'”. '+(kind==='type'?'Wskaż kategorię.':'Wskaż pole literału wewnątrz typu.'):'Wybór anulowany.');
  }
  function ownerOf(typeId){
    for(const [literalId,owner] of literalOwners)if(owner===typeId)return literalId;
    return null;
  }
  function maybeFinished(){
    if(mode!=='help')return false;
    const result=rules.evaluate(placements,literalOwners);
    if(!result.complete)return false;
    checked=result;render();$('success').hidden=false;
    feedback('Poprawnie: wszystkie '+task.items.length+' typów i literałów zostały dopasowane.','ok');
    return true;
  }
  function reject(id,kind){
    const selector=kind==='type'?'[data-item="'+id+'"]':'[data-literal="'+id+'"]';
    const wrap=document.querySelector(selector);
    if(wrap){wrap.classList.remove('reject');void wrap.offsetWidth;wrap.classList.add('reject');}
  }
  function putType(typeId,slot){
    if(!rules.items.has(typeId) || (slot!==null&&!rules.slots.has(slot)))return;
    if(mode==='help'&&slot!==null&&!rules.accepts(typeId,slot)){
      feedback('Ten typ nie pasuje do kategorii. '+rules.items.get(typeId).explanation,'error');reject(typeId,'type');return;
    }
    placements.set(typeId,slot);selected=null;clearResult();render();
    if(slot===null)feedback('Typ wrócił do banku razem z przypisanym literałem.');
    else{
      document.querySelector('[data-item="'+typeId+'"]')?.classList.add('snap');
      feedback('Typ przeniesiony razem z jego literałem'+(mode==='help'?'. '+rules.items.get(typeId).explanation:'.'),mode==='help'?'ok':'');
    }
    maybeFinished();
  }
  function putLiteral(literalId,typeId){
    if(!rules.literals.has(literalId)||(typeId!==null&&!rules.items.has(typeId)))return;
    if(mode==='help'&&typeId!==null&&!rules.acceptsLiteral(literalId,typeId)){
      feedback('Ten literał nie został wybrany jako przykład dla wskazanego typu. '+rules.literals.get(literalId).explanation,'error');
      reject(literalId,'literal');return;
    }
    // Zastąpienie przypisanego literału odkłada stary do banku.
    if(typeId!==null){const previous=ownerOf(typeId);if(previous&&previous!==literalId)literalOwners.set(previous,null);}
    literalOwners.set(literalId,typeId);selected=null;clearResult();render();
    if(typeId===null)feedback('Literał wrócił do banku.');
    else{
      document.querySelector('[data-literal="'+literalId+'"]')?.classList.add('snap');
      feedback('Literał przypisany do typu '+rules.items.get(typeId).label+(mode==='help'?'. '+rules.literals.get(literalId).explanation:'.'),mode==='help'?'ok':'');
    }
    maybeFinished();
  }
  function literalChip(id,attached=false){
    const lit=rules.literals.get(id),wrap=el('div','literal-wrap'+(selectedIs('literal')&&selected.id===id?' selected':''));
    wrap.dataset.literal=id;
    const result=checked?(checked.literals.correct.includes(id)?'correct':checked.literals.wrong.includes(id)?'wrong':''):'';
    if(result)wrap.classList.add(result);
    const button=action('', 'literal-chip',()=>select('literal',id,lit.label),'Wybierz literał: '+lit.label);
    button.dataset.literalCard=id;button.dataset.dragKind='literal';button.dataset.dragId=id;
    button.setAttribute('aria-pressed',String(selectedIs('literal')&&selected.id===id));
    button.append(el('span','grip','⠿'),el('code','',lit.label));
    button.addEventListener('pointerdown',startDrag);wrap.append(button);
    if(result)wrap.append(el('span','verdict',result==='correct'?'✓':'!'));
    if(attached)wrap.append(action('×','remove',()=>putLiteral(id,null),'Odłącz literał '+lit.label+' do banku'));
    return wrap;
  }
  function typeChip(id){
    const item=rules.items.get(id),wrap=el('div','chip-wrap type-wrap'+(selectedIs('type')&&selected.id===id?' selected':''));
    wrap.dataset.item=id;
    const verdict=checked?(checked.types.correct.includes(id)?'correct':checked.types.wrong.includes(id)?'wrong':''):'';
    if(verdict)wrap.classList.add(verdict);
    const header=el('div','type-header');
    const button=action('','chip type-chip',()=>select('type',id,item.label),'Wybierz typ: '+item.label);
    button.dataset.card=id;button.dataset.dragKind='type';button.dataset.dragId=id;
    button.setAttribute('aria-pressed',String(selectedIs('type')&&selected.id===id));
    button.append(el('span','grip','⠿'),el('code','',item.label));
    button.addEventListener('pointerdown',startDrag);header.append(button);
    if(verdict)header.append(el('span','verdict',verdict==='correct'?'✓':'!'));
    if(placements.get(id)!==null)header.append(action('×','remove',()=>putType(id,null),'Przenieś typ '+item.label+' wraz z literałem do banku'));
    const literalZone=el('div','literal-drop');literalZone.dataset.literalTarget=id;
    literalZone.setAttribute('aria-label','Literał dla typu '+item.label);
    const attached=ownerOf(id);
    if(attached)literalZone.append(literalChip(attached,true));
    else{
      const place=action('＋ Dodaj literał','literal-place',()=>{
        if(selectedIs('literal'))putLiteral(selected.id,id);
        else feedback('Najpierw wybierz literał w dolnym banku lub przy innym typie.');
      },'Przypisz wybrany literał do typu '+item.label);
      literalZone.append(place);
    }
    wrap.append(header,literalZone);
    if(checked&&checked.literals.missingTypes.includes(id))wrap.classList.add('missing-literal');
    return wrap;
  }
  function render(){
    const unplaced=typeOrder.filter(id=>placements.get(id)===null);
    $('bank').replaceChildren(...unplaced.map(typeChip));
    if(!unplaced.length)$('bank').append(el('span','empty','Wszystkie typy są w kategoriach.'));
    $('remaining').textContent='Pozostało typów: '+unplaced.length;
    const freeLiterals=literalOrder.filter(id=>literalOwners.get(id)===null);
    $('literal-bank').replaceChildren(...freeLiterals.map(id=>literalChip(id)));
    if(!freeLiterals.length)$('literal-bank').append(el('span','empty','Wszystkie literały są już przypisane do typów.'));
    $('literal-remaining').textContent='Pozostało literałów: '+freeLiterals.length;
    $('progress').textContent='Typy: '+(task.items.length-unplaced.length)+' / '+task.items.length+' · Literały: '+(task.literals.length-freeLiterals.length)+' / '+task.literals.length;
    $('attempts').textContent='Sprawdzenia: '+attempts;
    $('groups').replaceChildren();
    task.groups.forEach((group,index)=>{
      const panel=el('article','family'),slots=el('div','subslots');
      panel.append(el('div','family-number','0'+(index+1)+' / RODZINA'),el('h3','',group.title),el('p','',group.description),slots);
      group.slots.forEach(slot=>{
        const box=el('div','slot');box.dataset.slot=slot.id;
        const chips=el('div','chips'),ids=typeOrder.filter(id=>placements.get(id)===slot.id);
        chips.append(...ids.map(typeChip));
        if(!ids.length)chips.append(el('span','empty','Przeciągnij tutaj typy'));
        const place=action('＋ Umieść tutaj','place',()=>{
          if(selectedIs('type'))putType(selected.id,slot.id);
          else feedback('Najpierw wybierz klocek typu w banku lub innej kategorii.');
        },'Umieść wybrany typ w kategorii '+slot.title);
        place.dataset.place=slot.id;
        box.append(el('h4','',slot.title),el('p','',slot.description||''),chips,place);
        slots.append(box);
      });
      $('groups').append(panel);
    });
    ['help','solo'].forEach(name=>$(name).setAttribute('aria-pressed',String(mode===name)));
    $('modeNote').textContent=mode==='help'
      ?'Z pomocą: błędne kategorie i literały są odrzucane. Sprawdzenie całości uwzględnia oba rodzaje dopasowań.'
      :'Samodzielnie: możesz układać dowolnie. Przycisk „Sprawdź dopasowanie” oceni osobno typy i literały.';
  }
  $('check').onclick=()=>{
    attempts++;checked=rules.evaluate(placements,literalOwners);selected=null;render();
    $('success').hidden=!checked.complete;
    if(checked.complete){feedback('Poprawnie! Wszystkie typy i literały zostały dopasowane.','ok');return;}
    const t=checked.types,l=checked.literals;
    let summary='Typy w prawidłowej kategorii: '+t.correct.length+' / '+task.items.length+
      ' (błędne: '+t.wrong.length+', w banku: '+t.missing.length+'). '+
      'Literały przy właściwym typie: '+l.correct.length+' / '+task.literals.length+
      ' (błędne: '+l.wrong.length+', w banku: '+l.unplaced.length+').';
    if(l.wrong.length)summary+=' Wskazówka: '+rules.literals.get(l.wrong[0]).explanation;
    else if(t.wrong.length)summary+=' Wskazówka: '+rules.items.get(t.wrong[0]).explanation;
    feedback(summary,'error');
  };
  for(const name of ['help','solo'])$(name).onclick=()=>{
    cancelDrag();mode=name;clearResult();render();feedback('Zmieniono tryb. Dotychczasowe rozmieszczenie klocków zostało zachowane.');
  };
  $('reset').onclick=()=>{
    cancelDrag();for(const id of placements.keys())placements.set(id,null);
    for(const id of literalOwners.keys())literalOwners.set(id,null);
    selected=null;checked=null;attempts=0;
    typeOrder=shuffle(task.items.map(i=>i.id));literalOrder=shuffle(task.literals.map(i=>i.id));
    clearResult();render();feedback('Nowa próba. Dopasuj typy do rodzin oraz literały do typów.');
  };

  // Jeden mechanizm drag & drop dla obu rodzajów klocków; duch typu zawiera literał.
  function startDrag(event){
    if(event.button!==0)return;
    cancelDrag();
    const b=event.currentTarget;
    drag={kind:b.dataset.dragKind,id:b.dataset.dragId,pointerId:event.pointerId,
      element:b.closest(dragWrapperSelector(b.dataset.dragKind)),x:event.clientX,y:event.clientY,ghost:null};
  }
  function dragWrapperSelector(kind){return kind==='type'?'.type-wrap':'.literal-wrap';}
  function cancelDrag(){
    drag?.ghost?.remove();drag=null;
    document.querySelectorAll('.over,.over-invalid').forEach(n=>n.classList.remove('over','over-invalid'));
  }
  function dropTarget(x,y,kind){
    const el=document.elementFromPoint(x,y);
    if(!el)return null;
    if(kind==='type')return el.closest('[data-slot], [data-type-bank]');
    return el.closest('[data-literal-target], [data-literal-bank]');
  }
  function dropAllowed(d,target){
    if(d.kind==='type'){
      if(target.hasAttribute('data-type-bank'))return true;
      return mode!=='help'||rules.accepts(d.id,target.dataset.slot);
    }
    if(target.hasAttribute('data-literal-bank'))return true;
    return mode!=='help'||rules.acceptsLiteral(d.id,target.dataset.literalTarget);
  }
  window.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.pointerId)return;
    if(event.pointerType==='mouse'&&event.buttons!==1){cancelDrag();return;}
    if(!drag.ghost&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>7){
      drag.ghost=drag.element.cloneNode(true);
      drag.ghost.classList.add('ghost');
      drag.ghost.setAttribute('aria-hidden','true');
      drag.ghost.style.width=drag.element.offsetWidth+'px';
      document.body.append(drag.ghost);
    }
    if(!drag.ghost)return;
    event.preventDefault();
    drag.ghost.style.left=event.clientX-35+'px';drag.ghost.style.top=event.clientY-20+'px';
    document.querySelectorAll('.over,.over-invalid').forEach(n=>n.classList.remove('over','over-invalid'));
    const target=dropTarget(event.clientX,event.clientY,drag.kind);
    if(target)target.classList.add(dropAllowed(drag,target)?'over':'over-invalid');
    if(event.clientY>window.innerHeight-55)window.scrollBy(0,12);
    else if(event.clientY<55)window.scrollBy(0,-12);
  },{passive:false});
  window.addEventListener('pointerup',event=>{
    if(!drag||event.pointerId!==drag.pointerId)return;
    const previous=drag,target=dropTarget(event.clientX,event.clientY,drag.kind);
    cancelDrag();
    if(!previous.ghost)return;
    suppressClick=true;setTimeout(()=>{suppressClick=false;},0);
    if(!target)return;
    if(previous.kind==='type')putType(previous.id,target.hasAttribute('data-type-bank')?null:target.dataset.slot);
    else putLiteral(previous.id,target.hasAttribute('data-literal-bank')?null:target.dataset.literalTarget);
  });
  window.addEventListener('pointercancel',cancelDrag);
  window.addEventListener('blur',cancelDrag);
  window.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      cancelDrag();const old=selected;selected=null;render();
      if(old)focusSelected(old.kind,old.id);
      feedback('Wybór anulowany.');
    }
  });
  render();feedback('Zacznij od dowolnego typu lub literału. Literały można dodawać także do typów w banku.');
})();
