/* SILNIK REGUŁ — niezależny od strony i konkretnego zadania.
   Zwykle nie wymaga edycji. Działa w przeglądarce i w testach Node. */
(function (root) {
  "use strict";

  function create(config) {
    const fail = message => { throw new Error("Konfiguracja zadania: " + message); };
    if (!config || !Array.isArray(config.blocks) || !config.blocks.length)
      fail("blocks musi zawierać co najmniej jeden klocek.");
    if (!config.program || !Array.isArray(config.program.before) ||
        !Array.isArray(config.program.after) ||
        ![...config.program.before, ...config.program.after].every(s => typeof s === "string") ||
        typeof config.program.indent !== "string")
      fail("program wymaga tablic before i after oraz tekstu indent.");
    if (!["magnet", "free"].includes(config.defaultMode)) fail("Nieznany defaultMode.");

    const blocks = config.blocks;
    const byId = new Map();
    blocks.forEach(block => {
      if (typeof block.id !== "string" || !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(block.id))
        fail("id klocka musi zaczynać się literą i zawierać tylko litery, cyfry, _ lub -.");
      if (byId.has(block.id)) fail("Powtórzone id: " + block.id);
      for (const field of ["title", "sub", "code"])
        if (typeof block[field] !== "string") fail(block.id + ": brak tekstu " + field);
      byId.set(block.id, block);
    });

    const predecessors = new Map(blocks.map(b => [b.id, new Set()]));
    const successor = new Map();
    blocks.forEach(block => {
      for (const field of ["after", "before"]) {
        if (block[field] !== undefined && !Array.isArray(block[field]))
          fail(block.id + ": " + field + " musi być tablicą id.");
        for (const id of block[field] || []) {
          if (!byId.has(id) || id === block.id) fail(block.id + ": błędne odwołanie " + id);
          if (field === "after") predecessors.get(block.id).add(id);
          else predecessors.get(id).add(block.id);
        }
      }
      if (block.immediatelyAfter !== undefined) {
        const id = block.immediatelyAfter;
        if (!byId.has(id) || id === block.id) fail(block.id + ": błędne immediatelyAfter.");
        if (successor.has(id)) fail("Dwa klocki wymagają miejsca bezpośrednio po " + id);
        predecessors.get(block.id).add(id);
        successor.set(id, block.id);
      }
      if (block.positions !== undefined &&
          (!Array.isArray(block.positions) || !block.positions.length ||
           !block.positions.every(p => Number.isInteger(p) && p >= 1 && p <= blocks.length)))
        fail(block.id + ": positions musi zawierać numery miejsc od 1 do " + blocks.length);
    });

    // Wykrywanie cykli: A po B i B po A (także przez pośredników).
    const visited = new Set(), visiting = new Set();
    function visit(id) {
      if (visiting.has(id)) fail("Cykl zależności przy klocku " + id);
      if (visited.has(id)) return;
      visiting.add(id);
      predecessors.get(id).forEach(visit);
      visiting.delete(id);
      visited.add(id);
    }
    blocks.forEach(b => visit(b.id));

    function reason(prefix, id) {
      const block = byId.get(id), position = prefix.length + 1;
      if (block.positions && !block.positions.includes(position))
        return "„" + block.title + "” może być na miejscu: " + block.positions.join(", ") + ".";
      const missing = [...predecessors.get(id)].filter(p => !prefix.includes(p));
      if (missing.length)
        return block.hint || "Przed „" + block.title + "” ułóż: " + missing.map(p => byId.get(p).title).join("; ") + ".";
      if (block.immediatelyAfter && prefix[prefix.length - 1] !== block.immediatelyAfter)
        return "„" + block.title + "” musi być bezpośrednio po „" + byId.get(block.immediatelyAfter).title + "”.";
      const required = successor.get(prefix[prefix.length - 1]);
      if (required && required !== id)
        return "Teraz musi nastąpić „" + byId.get(required).title + "”.";
      return "";
    }

    // Czy z tego początku można dojść do pełnego rozwiązania?
    // Zapobiega przyjęciu pozornie poprawnego, ale ślepego początku.
    const solvable = new Map();
    function canFinish(prefix, budget = { remaining: 100000 }) {
      if (--budget.remaining < 0)
        fail("Zbyt złożony układ reguł. Uprość ograniczenia lub podziel zadanie.");
      if (prefix.length === blocks.length) return true;
      const key = JSON.stringify([[...prefix].sort(), prefix[prefix.length - 1]]);
      if (solvable.has(key)) return solvable.get(key);
      for (const block of blocks) {
        if (!prefix.includes(block.id) && !reason(prefix, block.id) &&
            canFinish([...prefix, block.id], budget)) {
          solvable.set(key, true);
          return true;
        }
      }
      solvable.set(key, false);
      return false;
    }
    if (!canFinish([])) fail("Reguły nie dopuszczają żadnego pełnego rozwiązania.");

    function issue(order, complete = false) {
      if (!Array.isArray(order) || order.length !== blocks.length) return "Nieprawidłowa liczba miejsc.";
      const prefix = [];
      for (let i = 0; i < order.length; i++) {
        const id = order[i];
        if (id === null) {
          if (order.slice(i + 1).some(value => value !== null))
            return "Zostaw ciągły plan: uzupełnij wcześniejsze miejsce.";
          if (complete) return "Wykorzystaj wszystkie klocki (" + blocks.length + ").";
          break;
        }
        if (!byId.has(id) || prefix.includes(id)) return "Nieznany lub powtórzony klocek.";
        const error = reason(prefix, id);
        if (error) return error;
        prefix.push(id);
      }
      return canFinish(prefix) ? "" : "Ten początek uniemożliwia ukończenie planu. Zmień kolejność.";
    }

    function programText(order) {
      const body = order.flatMap((id, i) =>
        (id ? byId.get(id).code : "// Uzupełnij krok " + (i + 1))
          .split("\n").map(line => config.program.indent + line));
      return [...config.program.before, ...body, ...config.program.after].join("\n") + "\n";
    }
    return { issue, programText, byId };
  }

  root.BlockRules = { create };
  if (typeof module !== "undefined" && module.exports) module.exports = { create };
})(typeof window !== "undefined" ? window : globalThis);

