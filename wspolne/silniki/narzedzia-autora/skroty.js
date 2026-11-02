/* Nieopisane w interfejsie skróty autora. Obsługa wspólna dla wszystkich rodzin. */
(function(root){
  'use strict';
  function matches(event){
    return !!(event.ctrlKey&&event.altKey&&event.shiftKey&&!event.metaKey&&!event.repeat&&!event.isComposing&&
      !event.getModifierState?.('AltGraph')&&(event.code==='KeyU'||(!event.code&&event.key?.toLowerCase()==='u')));
  }
  function bind(action,target=root){
    const handler=event=>{if(!matches(event))return;event.preventDefault();event.stopPropagation();action();};
    target.addEventListener('keydown',handler,true);
    return ()=>target.removeEventListener('keydown',handler,true);
  }
  const api={matches,bind};if(typeof module==='object'&&module.exports)module.exports=api;else root.AuthorShortcuts=api;
})(typeof window==='undefined'?globalThis:window);
