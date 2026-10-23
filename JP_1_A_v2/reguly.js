/* REGUŁY: poprawność przyporządkowania typów oraz literałów — bez DOM. */
(function(root){
  'use strict';
  function create(task){
    const fail = text => { throw new Error('Konfiguracja zadania: '+text); };
    const validId = id => typeof id==='string' && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id);
    if(!task || !Array.isArray(task.groups) || !task.groups.length ||
       !Array.isArray(task.items) || !task.items.length ||
       !Array.isArray(task.literals) || !task.literals.length) fail('Wymagane groups, items i literals.');
    if(!['help','solo'].includes(task.defaultMode)) fail('Nieznany tryb.');
    const slots=new Map(), groups=new Set(), items=new Map(), literals=new Map(), ids=new Set();
    function reserve(id,desc){
      if(!validId(id) || ids.has(id)) fail('Powtórzone lub błędne id ('+desc+'): '+id);
      ids.add(id);
    }
    for(const group of task.groups){
      reserve(group.id,'grupa');groups.add(group.id);
      if(!Array.isArray(group.slots) || !group.slots.length) fail('Grupa musi zawierać slot.');
      for(const slot of group.slots){
        reserve(slot.id,'slot');
        if(typeof slot.title!=='string') fail('Slot wymaga title.');
        slots.set(slot.id,slot);
      }
    }
    for(const item of task.items){
      reserve(item.id,'typ');
      if(typeof item.label!=='string'||typeof item.explanation!=='string')fail('Typ wymaga label i explanation.');
      if(!Array.isArray(item.accepts)||!item.accepts.length||item.accepts.some(id=>!slots.has(id)))
        fail(item.id+': accepts wskazuje nieistniejący slot.');
      items.set(item.id,item);
    }
    for(const literal of task.literals){
      reserve(literal.id,'literał');
      if(typeof literal.label!=='string'||typeof literal.explanation!=='string')fail('Literał wymaga label i explanation.');
      if(!Array.isArray(literal.accepts)||!literal.accepts.length||literal.accepts.some(id=>!items.has(id)))
        fail(literal.id+': accepts wskazuje nieistniejący typ.');
      literals.set(literal.id,literal);
    }
    // Każdy typ ma otrzymać dokładnie jeden literał; każdy literał jest użyty raz.
    if(literals.size!==items.size)fail('Liczba literałów musi być równa liczbie typów.');
    function accepts(id,slot){return items.has(id)&&slots.has(slot)&&items.get(id).accepts.includes(slot);}
    function acceptsLiteral(literalId,typeId){
      return literals.has(literalId)&&items.has(typeId)&&literals.get(literalId).accepts.includes(typeId);
    }
    function evaluate(placements,literalOwners){
      const types={correct:[],wrong:[],missing:[]};
      for(const id of items.keys()){
        const slot=placements.get(id);
        if(slot===null||slot===undefined)types.missing.push(id);
        else if(accepts(id,slot))types.correct.push(id);
        else types.wrong.push(id);
      }
      const literalsResult={correct:[],wrong:[],missingTypes:[],unplaced:[]};
      const mappedByType=new Map();
      for(const literalId of literals.keys()){
        const owner=literalOwners.get(literalId);
        if(owner===null||owner===undefined){literalsResult.unplaced.push(literalId);continue;}
        if(!items.has(owner) || mappedByType.has(owner)){
          literalsResult.wrong.push(literalId);continue;
        }
        mappedByType.set(owner,literalId);
        (acceptsLiteral(literalId,owner)?literalsResult.correct:literalsResult.wrong).push(literalId);
      }
      for(const id of items.keys())if(!mappedByType.has(id))literalsResult.missingTypes.push(id);
      return {
        types,literals:literalsResult,
        complete:types.correct.length===items.size &&
          literalsResult.correct.length===literals.size &&
          literalsResult.missingTypes.length===0 && literalsResult.unplaced.length===0
      };
    }
    return {slots,items,literals,accepts,acceptsLiteral,evaluate};
  }
  root.MatchingRules={create};
  if(typeof module!=='undefined'&&module.exports)module.exports={create};
})(typeof window!=='undefined'?window:globalThis);
