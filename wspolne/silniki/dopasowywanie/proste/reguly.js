/* REGUŁY DOPASOWYWANIA — bez zależności od konkretnego tematu. */
(function(root){
  "use strict";
  function create(task) {
    const fail = text => { throw new Error("Konfiguracja zadania: " + text); };
    const validId = value => typeof value === "string" && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value);
    if (!task || !Array.isArray(task.groups) || !task.groups.length ||
        !Array.isArray(task.items) || !task.items.length) fail("Potrzebne są groups i items.");
    if (!["help","solo"].includes(task.defaultMode)) fail("Nieznany tryb.");
    const slots = new Map(), groups = new Set(), items = new Map();
    for (const group of task.groups) {
      if (!validId(group.id) || groups.has(group.id)) fail("Powtórzone lub błędne id grupy.");
      groups.add(group.id);
      if (!Array.isArray(group.slots) || !group.slots.length) fail("Grupa musi zawierać slot.");
      for (const slot of group.slots) {
        if (!validId(slot.id) || slots.has(slot.id)) fail("Powtórzone lub błędne id slotu.");
        if (typeof slot.title !== "string") fail("Slot wymaga title.");
        slots.set(slot.id,slot);
      }
    }
    for (const item of task.items) {
      if (!validId(item.id) || items.has(item.id)) fail("Powtórzone lub błędne id klocka.");
      if (typeof item.label !== "string" || typeof item.explanation !== "string") fail("Klocek wymaga label i explanation.");
      if (!Array.isArray(item.accepts) || !item.accepts.length || item.accepts.some(id=>!slots.has(id)))
        fail(item.id + ": accepts wskazuje nieistniejący slot.");
      items.set(item.id,item);
    }
    function accepts(id,slot) {
      return items.has(id) && slots.has(slot) && items.get(id).accepts.includes(slot);
    }
    function evaluate(placements) {
      const correct=[],wrong=[],missing=[];
      for (const id of items.keys()) {
        const slot=placements.get(id);
        if (slot===null || slot===undefined) missing.push(id);
        else if (accepts(id,slot)) correct.push(id);
        else wrong.push(id);
      }
      return {correct,wrong,missing,complete:correct.length===items.size};
    }
    return {slots,items,accepts,evaluate};
  }
  root.MatchingRules={create};
  if(typeof module!=="undefined" && module.exports) module.exports={create};
})(typeof window!=="undefined"?window:globalThis);

