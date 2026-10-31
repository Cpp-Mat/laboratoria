/* SILNIK DOPASOWYWANIA — dane konkretnego ćwiczenia są w zadanie.js. */
(function(){
  "use strict";
  const $=id=>document.getElementById(id);
  const task=window.MATCHING_TASK;
  let rules;
  try { rules=window.MatchingRules.create(task); }
  catch(error) { $("feedback").textContent=error.message; ["check","reset","help","solo"].forEach(id=>$(id).disabled=true); return; }
  const placements=new Map(task.items.map(item=>[item.id,null]));
  let bankOrder=shuffle(task.items.map(item=>item.id));
  let mode=task.defaultMode,selected=null,checked=null,attempts=0,drag=null,suppressClick=false;
  document.title=task.id+" · Dopasuj typy C++";
  for(const key of ["eyebrow","heading","accent","description"]) $(key).textContent=task[key];
  $("badge").textContent=task.id; $("back").href=task.backLink;
  task.notes.forEach(note=>{const p=document.createElement("p");p.textContent=note;$("notes").append(p);});
  $("source").textContent=task.source.label;$("source").href=task.source.url;

  function shuffle(ids) {
    const result=ids.slice();
    for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
    return result;
  }
  function feedback(text,type=""){ $("feedback").textContent=text;$("feedback").className="feedback "+type; }
  function clearResult(){ checked=null;$("success").hidden=true; }
  function focusCard(id){document.querySelector('[data-card="'+id+'"]')?.focus({preventScroll:true});}

  // Klocek: wybór kliknięciem/klawiaturą oraz przeciąganie.
  function chip(id) {
    const item=rules.items.get(id),wrap=document.createElement("div");
    wrap.className="chip-wrap"+(selected===id?" selected":"");
    wrap.dataset.item=id;
    const result=checked?(checked.correct.includes(id)?"correct":checked.wrong.includes(id)?"wrong":""):"";
    if(result) wrap.classList.add(result);
    const button=document.createElement("button");
    button.type="button";button.className="chip";button.dataset.card=id;
    button.setAttribute("aria-pressed",String(selected===id));
    button.setAttribute("aria-label",item.label+(result==="correct"?" — poprawnie":result==="wrong"?" — wymaga poprawy":""));
    const grip=document.createElement("span");grip.className="grip";grip.textContent="⠿";grip.setAttribute("aria-hidden","true");
    const code=document.createElement("code");code.textContent=item.label;button.append(grip,code);
    button.onclick=()=>{
      if(suppressClick)return;
      selected=selected===id?null:id;render();focusCard(id);
      feedback(selected?'Wybrano „'+item.label+'”. Wybierz „Umieść tutaj” w odpowiedniej kategorii.':"Wybór anulowany.");
    };
    button.addEventListener("pointerdown",startDrag);
    wrap.append(button);
    if(result){const mark=document.createElement("span");mark.className="verdict";mark.textContent=result==="correct"?"✓":"!";mark.setAttribute("aria-hidden","true");wrap.append(mark);}
    if(placements.get(id)!==null){
      const remove=document.createElement("button");remove.type="button";remove.className="remove";remove.textContent="×";
      remove.setAttribute("aria-label","Przenieś "+item.label+" z powrotem do banku");
      remove.onclick=()=>{placements.set(id,null);selected=null;clearResult();render();focusCard(id);feedback("Klocek wrócił do banku. Poprzednia ocena została wyczyszczona.");};
      wrap.append(remove);
    }
    return wrap;
  }

  // Grupy i sloty wynikają wyłącznie z konfiguracji.
  function render(){
    $("bank").replaceChildren();
    const unplaced=bankOrder.filter(id=>placements.get(id)===null);
    unplaced.forEach(id=>$("bank").append(chip(id)));
    if(!unplaced.length){const p=document.createElement("span");p.className="empty";p.textContent="Wszystkie klocki są w kategoriach. Sprawdź dopasowanie.";$("bank").append(p);}
    $("remaining").textContent="Pozostało: "+unplaced.length;
    $("progress").textContent="Umieszczono "+(task.items.length-unplaced.length)+" / "+task.items.length;
    $("attempts").textContent="Sprawdzenia: "+attempts;
    $("groups").replaceChildren();
    task.groups.forEach((group,index)=>{
      const panel=document.createElement("article");panel.className="family";
      const number=document.createElement("div");number.className="family-number";number.textContent="0"+(index+1)+" / RODZINA";
      const title=document.createElement("h3");title.textContent=group.title;
      const description=document.createElement("p");description.textContent=group.description;
      const slots=document.createElement("div");slots.className="subslots";
      panel.append(number,title,description,slots);
      group.slots.forEach(slot=>{
        const box=document.createElement("div");box.className="slot";box.dataset.slot=slot.id;
        const heading=document.createElement("h4");heading.textContent=slot.title;
        const desc=document.createElement("p");desc.textContent=slot.description||"";
        const items=document.createElement("div");items.className="chips";
        const ids=bankOrder.filter(id=>placements.get(id)===slot.id);
        ids.forEach(id=>items.append(chip(id)));
        if(!ids.length){const empty=document.createElement("span");empty.className="empty";empty.textContent="Przeciągnij tutaj typy";items.append(empty);}
        const place=document.createElement("button");place.type="button";place.className="place";place.dataset.place=slot.id;
        place.textContent="＋ Umieść tutaj";place.setAttribute("aria-label","Umieść wybrany typ: "+slot.title);
        place.onclick=()=>{if(selected)put(selected,slot.id);else feedback("Najpierw wybierz klocek w banku lub w innej kategorii.");};
        box.append(heading,desc,items,place);slots.append(box);
      });
      $("groups").append(panel);
    });
    for(const name of ["help","solo"]) $(name).setAttribute("aria-pressed",String(mode===name));
    $("modeNote").textContent=mode==="help"
      ?"Z pomocą: poprawne dopasowanie zostaje, błędne wraca z wyjaśnieniem."
      :"Samodzielnie: możesz układać dowolnie. Ocena pojawi się po „Sprawdź dopasowanie”.";
  }

  function put(id,slot){
    if(!rules.items.has(id)||!rules.slots.has(slot))return;
    if(mode==="help"&&!rules.accepts(id,slot)){
      feedback("Ten typ nie pasuje do wybranej kategorii. "+rules.items.get(id).explanation,"error");
      const wrap=document.querySelector('[data-item="'+id+'"]');
      if(wrap){wrap.classList.remove("reject");void wrap.offsetWidth;wrap.classList.add("reject");}
      return;
    }
    placements.set(id,slot);selected=null;clearResult();render();
    document.querySelector('[data-item="'+id+'"]')?.classList.add("snap");
    document.querySelector('[data-place="'+slot+'"]')?.focus({preventScroll:true});
    feedback(mode==="help"?"Dobrze. "+rules.items.get(id).explanation:"Klocek przeniesiony. Sprawdź cały układ, gdy skończysz.",mode==="help"?"ok":"");
    if(mode==="help"&&rules.evaluate(placements).complete){
      checked=rules.evaluate(placements);render();$("success").hidden=false;
      feedback("Wszystkie "+task.items.length+" typów dopasowano poprawnie.","ok");
    }
  }

  // Ocena jest aktualna do następnego ruchu; nie pokazujemy kolorów starego wyniku.
  $("check").onclick=()=>{
    attempts++;checked=rules.evaluate(placements);selected=null;render();
    $("success").hidden=!checked.complete;
    if(checked.complete) feedback("Poprawnie! Wszystkie typy znalazły swoje miejsce.","ok");
    else {
      let text="Poprawnie: "+checked.correct.length+" / "+task.items.length+
        ". Do poprawy: "+checked.wrong.length+". Nieumieszczone: "+checked.missing.length+".";
      if(checked.wrong.length) text+=" Wskazówka: "+rules.items.get(checked.wrong[0]).explanation;
      feedback(text,"error");
    }
  };
  for(const name of ["help","solo"]) $(name).onclick=()=>{
    cancelDrag();mode=name;clearResult();render();
    feedback("Zmieniono tryb. Rozmieszczenie klocków pozostaje bez zmian.");
  };
  $("reset").onclick=()=>{
    cancelDrag();task.items.forEach(item=>placements.set(item.id,null));selected=null;attempts=0;
    bankOrder=shuffle(task.items.map(item=>item.id));clearResult();render();feedback("Nowa próba. Dopasuj wszystkie typy do kategorii.");
  };

  // Pointer Events obsługują mysz i dotyk. Kliknięcie jest pełnym zamiennikiem przeciągania.
  function startDrag(event){
    if(event.button!==0)return;
    cancelDrag();drag={id:event.currentTarget.dataset.card,element:event.currentTarget,x:event.clientX,y:event.clientY,ghost:null};
  }
  function cancelDrag(){
    drag?.ghost?.remove();drag=null;
    document.querySelectorAll(".over,.over-invalid").forEach(el=>el.classList.remove("over","over-invalid"));
  }
  window.addEventListener("pointermove",event=>{
    if(!drag)return;
    if(event.buttons!==1){cancelDrag();return;}
    if(!drag.ghost&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>7){
      drag.ghost=drag.element.cloneNode(true);drag.ghost.removeAttribute("data-card");
      drag.ghost.classList.add("ghost");drag.ghost.setAttribute("aria-hidden","true");drag.ghost.style.width=drag.element.offsetWidth+"px";document.body.append(drag.ghost);
    }
    if(!drag.ghost)return;
    event.preventDefault();drag.ghost.style.left=event.clientX-50+"px";drag.ghost.style.top=event.clientY-24+"px";
    document.querySelectorAll(".over,.over-invalid").forEach(el=>el.classList.remove("over","over-invalid"));
    const target=document.elementFromPoint(event.clientX,event.clientY)?.closest("[data-slot]");
    if(target)target.classList.add(mode==="help"&&!rules.accepts(drag.id,target.dataset.slot)?"over-invalid":"over");
    if(event.clientY>window.innerHeight-55)window.scrollBy(0,15);
    else if(event.clientY<55)window.scrollBy(0,-15);
  },{passive:false});
  window.addEventListener("pointerup",event=>{
    if(!drag)return;const previous=drag;
    const target=document.elementFromPoint(event.clientX,event.clientY)?.closest("[data-slot]");
    cancelDrag();
    if(previous.ghost){suppressClick=true;setTimeout(()=>suppressClick=false,60);if(target)put(previous.id,target.dataset.slot);}
  });
  window.addEventListener("pointercancel",cancelDrag);
  window.addEventListener("blur",cancelDrag);
  window.addEventListener("keydown",event=>{
    if(event.key==="Escape"){cancelDrag();const old=selected;selected=null;render();if(old)focusCard(old);feedback("Wybór anulowany.");}
  });
  render();
  feedback("Zacznij od dowolnego typu. W jednej kategorii może znaleźć się wiele klocków.");
})();

