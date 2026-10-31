/* WSPÓLNY WIDOK KODU: dane wejściowe i osobne części nagłówka for.
   Konfiguracja: setupCode (szablony {{values}}, {{length}}, {{remove}}),
   code[].parts = {init, condition, increment}. Bez wykonywania kodu C++. */
(function(root){
  'use strict';
  function rows(task,context){
    const setup=(task.setupCode||[]).map(line=>({...line,context:true,text:line.text.replace(/\{\{(\w+)\}\}/g,(_,key)=>{
      if(!(key in context))throw new Error('Brak danych kodu: '+key);
      return Array.isArray(context[key])?context[key].join(', '):String(context[key]);
    })}));
    return setup.concat(task.code.map(line=>{
      if(!line.parts)return {...line};
      const p=line.parts,text=(line.indent||'')+'for ('+p.init+'; '+p.condition+'; '+p.increment+') {';
      if(text!==line.text)throw new Error('Niespójny tekst i części pętli: '+line.id);
      return {...line};
    }));
  }
  function render(container,task,context){
    const doc=container.ownerDocument;
    container.replaceChildren(...rows(task,context).map((line,i)=>{
      const row=doc.createElement('div');row.className='code-line'+(line.context?' code-context':'');row.dataset.line=line.id;
      const number=doc.createElement('span');number.className='line-number';number.textContent=i+1;number.setAttribute('aria-hidden','true');
      const code=doc.createElement('code');
      if(line.parts){
        const part=(name,text)=>{const span=doc.createElement('span');span.className='code-part';span.dataset.part=name;span.textContent=text;return span;};
        code.append((line.indent||'')+'for (',part('init',line.parts.init),'; ',part('condition',line.parts.condition),'; ',part('increment',line.parts.increment),') ',part('body','{'));
      }else code.textContent=line.text;
      row.append(number,code);return row;
    }));
  }
  function highlight(container,state){
    container.querySelectorAll('[data-line]').forEach(row=>{
      const active=row.dataset.line===state.line;
      row.classList.toggle('active',active);row.classList.toggle('part-active',active&&!!state.part);
      if(active&&!state.part)row.setAttribute('aria-current','step');else row.removeAttribute('aria-current');
      row.querySelectorAll('[data-part]').forEach(part=>{
        const selected=active&&part.dataset.part===state.part;part.classList.toggle('active',selected);
        if(selected)part.setAttribute('aria-current','step');else part.removeAttribute('aria-current');
      });
    });
  }
  const api={rows,render,highlight};if(typeof module==='object'&&module.exports)module.exports=api;else root.TraceCode=api;
})(typeof window==='undefined'?globalThis:window);
