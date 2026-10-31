/* CZYSTY MODEL: ruchy, generator i ocena. Bez DOM i bez treści zadania. */
(function (root) {
  'use strict';
  function createEngine(task) {
    const defs = Object.fromEntries(task.blocks.map(b => [b.id,b]));
    const fail = text => { throw new Error(text); };
    if (Object.keys(defs).length !== task.blocks.length) fail('Powtórzone id klocka.');
    for (const b of task.blocks) {
      if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(b.id)) fail('Nieprawidłowe id: '+b.id);
      if (!['statement','expression'].includes(b.kind)) fail('Nieprawidłowy kind: '+b.id);
      for (const slot of Object.values(b.slots || {})) if (!['list','expression'].includes(slot.type)) fail('Nieprawidłowy typ pola: '+b.id);
      if (b.operator && (!['&&','||'].includes(b.operator) || Object.keys(b.slots || {}).join(',') !== 'a,b' || Object.values(b.slots).some(s=>s.type!=='expression'))) fail('Operator wymaga pól a i b: '+b.id);
      if (b.kind === 'statement' && !Array.isArray(b.template)) fail('Brak template: '+b.id);
      if (b.kind === 'expression' && !b.operator && typeof b.code !== 'string') fail('Brak code: '+b.id);
      for (const line of b.template || []) {
        if (typeof line === 'string') {
          for (const m of line.matchAll(/\{\{(\w+)\}\}/g)) if (b.slots?.[m[1]]?.type !== 'expression') fail('Nieznany slot wyrażenia: '+b.id);
        } else if (!line || b.slots?.[line.slot]?.type !== 'list') fail('Nieznany slot listy: '+b.id);
      }
    }
    function fresh() {
        const bank = task.blocks.map(b => b.id);

        // Losowe tasowanie klocków (Fisher–Yates)
        for (let i = bank.length - 1; i > 0; --i) {
            const j = Math.floor(Math.random() * (i + 1));
            [bank[i], bank[j]] = [bank[j], bank[i]];
        }

        return {
            root: [],
            bank,
            nodes: Object.fromEntries(
                task.blocks.map(b => [
                    b.id,
                    {slots: Object.fromEntries(
                        Object.keys(b.slots || {}).map(k => [k, []])
                    )}
                ])
            )
        };
    }
    function fresh_old() {
      return {root:[],bank:task.blocks.map(b=>b.id),nodes:Object.fromEntries(task.blocks.map(b=>[b.id,{slots:Object.fromEntries(Object.keys(b.slots||{}).map(k=>[k,[]]))}]))};
    }
    function list(s,owner,slot) { return owner === null ? s[slot] : s.nodes[owner]?.slots[slot]; }
    function locate(s,id) {
      for (const slot of ['root','bank']) if (s[slot].includes(id)) return {owner:null,slot,index:s[slot].indexOf(id)};
      for (const [owner,n] of Object.entries(s.nodes)) for (const [slot,ids] of Object.entries(n.slots)) if (ids.includes(id)) return {owner,slot,index:ids.indexOf(id)};
      return null;
    }
    function descendants(s,id) { return [id,...Object.values(s.nodes[id].slots).flatMap(ids=>ids.flatMap(child=>descendants(s,child)))]; }
    function canMove(s,id,owner,slot) {
      if (!defs[id] || !locate(s,id)) return 'Nieznany klocek.';
      const target = list(s,owner,slot);
      if (!target) return 'Nie ma takiego pola.';
      if (owner !== null && descendants(s,id).includes(owner)) return 'Nie można włożyć klocka do niego samego ani do jego wnętrza.';
      const type = owner === null ? (slot === 'bank' ? 'any' : 'list') : defs[owner].slots[slot].type;
      if (type === 'list' && defs[id].kind !== 'statement') return 'Ten klocek jest warunkiem. Umieść go w polu warunku.';
      if (type === 'expression' && defs[id].kind !== 'expression') return 'To pole przyjmuje warunek, a nie instrukcję.';
      if (type === 'expression' && target.length && target[0] !== id) return 'Pole jest zajęte. Najpierw przenieś obecny warunek do banku.';
      return '';
    }
    function move(s,id,owner,slot,index) {
      const error = canMove(s,id,owner,slot); if (error) return {ok:false,error};
      const from = locate(s,id), source = list(s,from.owner,from.slot), target = list(s,owner,slot);
      let at = index === undefined ? target.length : Math.max(0,Math.min(index,target.length));
      if (target === source && from.index < at) at--;
      source.splice(from.index,1); target.splice(at,0,id);
      return {ok:true};
    }
    const expected = fresh(), seen = new Set();
    function place(items,owner,slot) {
      for (const item of items) {
        if (!defs[item.id] || seen.has(item.id)) fail('Nieznany lub powtórzony klocek we wzorcu: '+item.id);
        seen.add(item.id);
        const result = move(expected,item.id,owner,slot); if (!result.ok) fail(result.error+' ('+item.id+')');
        for (const [name,value] of Object.entries(item.slots||{})) {
          if (!defs[item.id].slots?.[name]) fail('Nieznany slot we wzorcu: '+name);
          place(Array.isArray(value) ? value : [value],item.id,name);
        }
      }
    }
    place(task.solution,null,'root');
    if (seen.size !== task.blocks.length) fail('Wzorzec musi używać wszystkich klocków.');
    for (const b of task.blocks) for (const [name,slot] of Object.entries(b.slots||{})) if (slot.type==='expression' && expected.nodes[b.id].slots[name].length!==1) fail('Puste wyrażenie we wzorcu: '+b.id);
    const unordered = new Set((task.unorderedPairs||[]).map(pair=> {
      if (pair.length!==2 || pair.some(id=>!defs[id] || defs[id].kind!=='statement')) fail('Nieprawidłowa unorderedPairs.');
      const a=locate(expected,pair[0]),b=locate(expected,pair[1]);
      if (a.owner!==b.owner || a.slot!==b.slot) fail('Zamiana kolejności wymaga wspólnego rodzica.');
      return [...pair].sort().join('|');
    }));
    // I / LUB: spłaszczamy grupy tego samego operatora i sortujemy składniki.
    // Dopuszcza to inne nawiasowanie, kolejność i zamianę identycznych operatorów.
    function signature(s,id) {
      if (!id) return '?';
      const b=defs[id]; if (!b.operator) return b.semantic || b.id;
      function terms(child) {
        if (child && defs[child].operator===b.operator) return ['a','b'].flatMap(k=>terms(s.nodes[child].slots[k][0]));
        return [signature(s,child)];
      }
      return b.operator+'('+['a','b'].flatMap(k=>terms(s.nodes[id].slots[k][0])).sort().join(',')+')';
    }
    function check(s) {
      const errors=[];
      if(s.bank.length) errors.push({id:null,message:'W banku zostały klocki. Użyj wszystkich elementów zadania.'});
      for(const b of task.blocks.filter(b=>b.kind==='statement')) {
        const a=locate(s,b.id),e=locate(expected,b.id);
        if(a.owner!==e.owner || a.slot!==e.slot) errors.push({id:b.id,message:'„'+b.title+'” — sprawdź poziom zagnieżdżenia i wybraną gałąź.'});
        for(const [slot,d] of Object.entries(b.slots||{})) if(d.type==='expression' && signature(s,s.nodes[b.id].slots[slot][0])!==signature(expected,expected.nodes[b.id].slots[slot][0])) errors.push({id:b.id,message:'„'+b.title+'” — sprawdź warunek: '+d.label.toLowerCase()+'.'});
      }
      const lists = [{owner:null,slot:'root',ids:expected.root}];
      for(const [owner,n] of Object.entries(expected.nodes)) for(const [slot,ids] of Object.entries(n.slots)) if(defs[owner].slots[slot].type==='list') lists.push({owner,slot,ids});
      for(const {owner,slot,ids} of lists) {
        const actual=list(s,owner,slot);
        for(let i=0;i<ids.length;i++) for(let j=i+1;j<ids.length;j++) if(!unordered.has([ids[i],ids[j]].sort().join('|')) && actual.includes(ids[i]) && actual.includes(ids[j]) && actual.indexOf(ids[i])>actual.indexOf(ids[j])) errors.push({id:ids[i],message:'„'+defs[ids[i]].title+'” powinno poprzedzać „'+defs[ids[j]].title+'”.'});
      }
      return {ok:!errors.length,errors};
    }
    function expression(s,id) {
      if(!id) return '/* wstaw warunek */';
      const b=defs[id];
      return b.operator ? '('+expression(s,s.nodes[id].slots.a[0])+' '+b.operator+' '+expression(s,s.nodes[id].slots.b[0])+')' : b.code;
    }
    function generate(s) {
      const rows=task.program.before.map(text=>({text,id:null})), indent=task.program.indent;
      function render(ids,level) {
        for(const id of ids) for(const line of defs[id].template) {
          if(typeof line==='string') rows.push({id,text:indent.repeat(level)+line.replace(/\{\{(\w+)\}\}/g,(_,k)=>expression(s,s.nodes[id].slots[k][0]))});
          else if(s.nodes[id].slots[line.slot].length) render(s.nodes[id].slots[line.slot],level+1);
          else rows.push({id,text:indent.repeat(level+1)+'// puste wnętrze'});
        }
      }
      if(s.root.length) render(s.root,1); else rows.push({id:null,text:indent+'// tutaj pojawi się Twój program'});
      rows.push(...task.program.after.map(text=>({text,id:null})));
      return rows;
    }
    function solution() { return JSON.parse(JSON.stringify(expected)); }
    return {defs,fresh,locate,list,descendants,canMove,move,check,signature,generate,solution};
  }
  if(typeof module==='object' && module.exports) module.exports={createEngine};
  else root.NestedRules={createEngine};
})(typeof window==='undefined'?globalThis:window);
