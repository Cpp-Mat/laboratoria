/* REGUŁY UKŁADANKI PARSONSA
   Wzorzec kolejności + wyjątki dla ruchomych deklaracji.
   Nie analizuje semantyki C++ i nie wykonuje programu. */
(function (root) {
  "use strict";
  function create(task) {
    const fail = message => { throw new Error("Konfiguracja zadania: " + message); };
    if (!task || !Array.isArray(task.lines) || task.lines.length < 2)
      fail("lines musi zawierać co najmniej dwie linie.");
    if (!task.ui || typeof task.indent !== "string")
      fail("Wymagane są ui oraz tekst indent.");
    const pieces = task.lines.map(line => ({ id: line.id, text: line.code, hint: line.hint }));
    const byId = new Map();
    pieces.forEach(piece => {
      if (typeof piece.id !== "string" || !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(piece.id))
        fail("Id linii musi zaczynać się literą i zawierać tylko litery, cyfry, _ lub -.");
      if (byId.has(piece.id)) fail("Powtórzone id: " + piece.id);
      if (typeof piece.text !== "string" || !piece.text.trim() ||
          piece.text !== piece.text.trim() || /[\r\n]/.test(piece.text))
        fail(piece.id + ": code musi być pojedynczą niepustą linią bez skrajnych spacji.");
      if (typeof piece.hint !== "string") fail(piece.id + ": brak hint.");
      byId.set(piece.id, piece);
    });
    if (!Array.isArray(task.declarations)) fail("declarations musi być tablicą (może być pusta).");
    const declarations = new Map();
    const inputs = new Map();
    for (const rule of task.declarations) {
      const line = byId.get(rule.line), before = byId.get(rule.before);
      if (!line || !before || rule.line === rule.before)
        fail("Błędne odwołanie line/before w deklaracji.");
      if (!Number.isInteger(rule.maxDepth) || rule.maxDepth < 0 || typeof rule.names !== "string")
        fail(rule.line + ": wymagane names i nieujemna liczba całkowita maxDepth.");
      if (declarations.has(line.text)) fail("Powtórzona reguła deklaracji " + rule.line);
      if (pieces.filter(p => p.text === line.text).length !== 1 ||
          pieces.filter(p => p.text === before.text).length !== 1)
        fail("Deklaracja i jej wymagane użycie muszą mieć jednoznaczny tekst.");
      if (/[{}]/.test(line.text)) fail("Ruchoma deklaracja nie może zmieniać poziomu klamer.");
      const entry = { ...rule, text: line.text, inputText: before.text };
      declarations.set(line.text, entry);
      if (!inputs.has(before.text)) inputs.set(before.text, []);
      inputs.get(before.text).push(entry);
    }
    for (const rule of declarations.values())
      if (declarations.has(rule.inputText)) fail("before nie może wskazywać innej ruchomej deklaracji.");

    if (!Array.isArray(task.examples)) fail("examples musi być tablicą (może być pusta).");
    const exampleIds = new Set();
    for (const example of task.examples) {
      if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(example.id) || exampleIds.has(example.id))
        fail("Błędne lub powtórzone id przykładu.");
      exampleIds.add(example.id);
      for (const field of ["label", "input", "output"])
        if (typeof example[field] !== "string") fail("Przykład wymaga tekstu " + field);
    }

    const instructions = pieces.filter(piece => !declarations.has(piece.text));
    if (!instructions.length) fail("Potrzebna jest przynajmniej jedna nieruchoma instrukcja.");
    function assessOrder(candidate) {
      if (!Array.isArray(candidate) || candidate.length !== pieces.length ||
          new Set(candidate).size !== pieces.length || candidate.some(id => !byId.has(id)))
        return { prefix: 0, hint: "Plan musi zawierać każdą linię dokładnie raz." };
      const declared = new Set();
      let instructionIndex = 0, depth = 0;
      for (let index = 0; index < candidate.length; index++) {
        const text = byId.get(candidate[index]).text;
        const declaration = declarations.get(text);
        if (declaration) {
          if (depth > declaration.maxDepth)
            return { prefix: index, hint: "Przenieś deklarację na płytszy poziom, przed wymagane użycie. Maksymalny poziom zagnieżdżenia: " + declaration.maxDepth + " (0 = poza funkcją)." };
          declared.add(text);
          continue;
        }
        const expected = instructions[instructionIndex];
        if (!expected || text !== expected.text)
          return { prefix: index, hint: expected?.hint || "Przenieś tę linię zgodnie z wzorcem." };
        for (const required of inputs.get(text) || []) {
          if (!declared.has(required.text))
            return { prefix: index, hint: "Przed tą instrukcją zadeklaruj " + required.names + ". Deklaracja może być przed lub po poprzednim komunikacie cout, ale musi poprzedzać użycie zmiennej." };
        }
        if (text.startsWith("}")) depth--;
        if (text.endsWith("{")) depth++;
        instructionIndex++;
      }
      return { prefix: candidate.length, hint: "" };
    }
    const reference = assessOrder(pieces.map(p => p.id));
    if (reference.prefix !== pieces.length)
      fail("Wzorzec lines nie spełnia reguł: " + reference.hint);

    function formatLines(order) {
      let depth = 0;
      return order.map(id => {
        const text = byId.get(id).text;
        if (text.startsWith("}")) depth = Math.max(0, depth - 1);
        const line = task.indent.repeat(depth) + text;
        if (text.endsWith("{")) depth++;
        return line;
      });
    }
    return { pieces, byId, assessOrder, formatLines };
  }
  root.ParsonsRules = { create };
  if (typeof module !== "undefined" && module.exports) module.exports = { create };
})(typeof window !== "undefined" ? window : globalThis);

