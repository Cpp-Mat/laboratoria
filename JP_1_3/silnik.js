/* SILNIK INTERFEJSU
   Dane i reguły ćwiczenia: zadanie.js. Wygląd: styl.css.
   Nie ma tu identyfikatorów ani liczby klocków konkretnego zadania. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const task = window.EXERCISE;
  let rules;
  try {
    rules = window.BlockRules.create(task);
  } catch (error) {
    $("status").textContent = error.message;
    $("status").className = "status error";
    $("check").disabled = true;
    $("reset").disabled = true;
    $("magnet").disabled = true;
    $("free").disabled = true;
    return;
  }

  // 1. Stan ćwiczenia i teksty strony.
  const blocks = task.blocks;
  let order = blocks.map(() => null);
  let bankOrder = blocks.map(b => b.id);
  let selected = null, mode = task.defaultMode;
  let drag = null, suppressClick = false, lastCode = "";
  const codeNodes = new Map();

  document.title = task.id + " · Pracownia C++";
  $("taskEyebrow").textContent = task.eyebrow;
  $("taskHeading").textContent = task.heading;
  $("taskAccent").textContent = task.accent;
  $("taskDescription").textContent = task.description;
  $("backLink").href = task.backLink;
  $("programBefore").textContent = task.program.before.join("\n");
  $("programAfter").textContent = task.program.after.join("\n");

  function status(text, type = "") {
    $("status").textContent = text;
    $("status").className = "status " + type;
  }
  function invalidate() {
    status("Plan zmieniony. Sprawdź zależności między krokami.");
  }

  // 2. Klocki i miejsca: liczba miejsc wynika z danych zadania.
  function card(id) {
    const block = rules.byId.get(id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "block" + (selected === id ? " selected" : "");
    button.dataset.id = id;
    button.setAttribute("aria-pressed", String(selected === id));
    const grip = document.createElement("span");
    grip.className = "grip";
    grip.textContent = "⠿";
    grip.setAttribute("aria-hidden", "true");
    const title = document.createElement("strong"), sub = document.createElement("small");
    title.textContent = block.title;
    sub.textContent = block.sub;
    button.append(grip, title, sub);
    button.onclick = () => {
      if (suppressClick) return;
      selected = selected === id ? null : id;
      render();
      status(selected ? "Wybrano klocek. Kliknij miejsce w planie." : "Wybierz kolejny klocek.");
    };
    button.addEventListener("pointerdown", startDrag);
    return button;
  }

  function render() {
    document.querySelectorAll(".ghost").forEach(g => g.remove());
    $("bank").replaceChildren();
    bankOrder.filter(id => !order.includes(id)).forEach(id => $("bank").append(card(id)));
    if (order.every(Boolean))
      $("bank").textContent = "Wszystkie klocki są w planie. Możesz sprawdzić rozwiązanie.";
    $("slots").replaceChildren();
    order.forEach((id, i) => {
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.dataset.slot = i;
      if (id) {
        const button = card(id);
        button.onclick = () => {
          if (suppressClick) return;
          if (selected && selected !== id) place(selected, i);
          else {
            selected = selected === id ? null : id;
            render();
            status("Wybierz inne miejsce, aby przenieść lub zamienić klocek.");
          }
        };
        const remove = document.createElement("button");
        remove.className = "remove";
        remove.textContent = "Usuń";
        remove.setAttribute("aria-label", "Usuń krok " + (i + 1));
        remove.onclick = () => {
          order[i] = null;
          selected = null;
          invalidate();
          render();
        };
        slot.append(button, remove);
      } else {
        const placeholder = document.createElement("button");
        placeholder.className = "placeholder";
        placeholder.textContent = "Krok " + (i + 1) + " · upuść klocek";
        placeholder.onclick = () => {
          if (selected) place(selected, i);
          else status("Najpierw wybierz klocek po lewej.");
        };
        slot.append(placeholder);
      }
      $("slots").append(slot);
    });
    $("count").textContent = order.filter(Boolean).length + " / " + blocks.length;
    renderCode(order, selected);
  }

  // Zajęte miejsce: zamiana dwóch klocków. Klocek z banku zastępuje
  // istniejący, który wraca do banku. Każdy klocek występuje tylko raz.
  function candidate(id, index) {
    const next = order.slice(), oldIndex = next.indexOf(id);
    if (oldIndex === index) return next;
    if (oldIndex >= 0) next[oldIndex] = next[index];
    next[index] = id;
    return next;
  }
  function place(id, index) {
    const next = candidate(id, index);
    const error = mode === "magnet" ? rules.issue(next) : "";
    if (error) {
      renderCode(order);
      status(error, "error");
      const element = document.querySelector('[data-id="' + id + '"]');
      if (element) {
        element.classList.remove("reject");
        void element.offsetWidth;
        element.classList.add("reject");
      }
      return;
    }
    order = next;
    selected = null;
    render();
    document.querySelector('[data-slot="' + index + '"]').classList.add("snap");
    status(order.every(Boolean)
      ? "Plan jest pełny. Kod po prawej odpowiada Twojej kolejności."
      : "Połączono. Dodaj kolejne działanie.");
  }

  // 3. Przeciąganie myszą i dotykiem; kliknięcia i klawiatura działają osobno.
  function startDrag(event) {
    if (event.button !== 0) return;
    clearDrag();
    drag = { id: event.currentTarget.dataset.id, x: event.clientX,
      y: event.clientY, element: event.currentTarget, ghost: null };
  }
  function clearDrag() {
    drag?.ghost?.remove();
    drag = null;
    document.querySelectorAll(".over").forEach(s => s.classList.remove("over"));
    renderCode(order, selected);
  }
  window.addEventListener("pointermove", event => {
    if (!drag) return;
    if (event.buttons !== 1) { clearDrag(); return; }
    if (!drag.ghost && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 7) {
      drag.ghost = drag.element.cloneNode(true);
      drag.ghost.classList.add("ghost");
      drag.ghost.setAttribute("aria-hidden", "true");
      drag.ghost.style.width = drag.element.offsetWidth + "px";
      document.body.append(drag.ghost);
    }
    if (!drag.ghost) return;
    event.preventDefault();
    drag.ghost.style.left = event.clientX - 80 + "px";
    drag.ghost.style.top = event.clientY - 28 + "px";
    document.querySelectorAll(".over").forEach(s => s.classList.remove("over"));
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".slot");
    target?.classList.add("over");
    if (target) {
      const next = candidate(drag.id, Number(target.dataset.slot));
      if (mode === "free" || !rules.issue(next)) renderCode(next, drag.id, true);
      else renderCode(order, drag.id);
    } else renderCode(order, drag.id);
  }, { passive: false });
  window.addEventListener("pointerup", event => {
    if (!drag) return;
    const previous = drag;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".slot");
    clearDrag();
    if (!previous.ghost) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 50);
    if (target) place(previous.id, Number(target.dataset.slot));
  });
  window.addEventListener("pointercancel", clearDrag);
  window.addEventListener("blur", clearDrag);
  window.addEventListener("keydown", event => {
    if (event.key === "Escape") clearDrag();
  });

  // 4. Kod na żywo i czysty kod do kompilatora.
  function renderCode(ids, highlight = null, preview = false) {
    const key = JSON.stringify([ids, highlight, preview]);
    if (key === lastCode) return;
    lastCode = key;
    const parent = $("codeRows");
    const before = new Map([...parent.children].map(el => [el.dataset.key, el.getBoundingClientRect().top]));
    const rows = ids.map((id, i) => {
      const rowKey = id || "empty:" + i;
      let row = codeNodes.get(rowKey);
      if (!row) {
        row = document.createElement("div");
        row.dataset.key = rowKey;
        row.innerHTML = '<span class="num" aria-hidden="true"></span><code></code>';
        codeNodes.set(rowKey, row);
      }
      row.className = "code-row" + (!id ? " empty" : "") + (id && id === highlight ? " highlight" : "");
      row.querySelector(".num").textContent = String(i + 1);
      row.querySelector("code").textContent = id ? rules.byId.get(id).code : "// miejsce na krok " + (i + 1);
      return row;
    });
    parent.replaceChildren(...rows);
    const source = rules.programText(ids);
    if ($("copyCode").value !== source) {
      $("copyCode").value = source;
      $("copyStatus").textContent = "";
    }
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rows.forEach(row => {
        row.getAnimations().forEach(animation => animation.cancel());
        const oldTop = before.get(row.dataset.key), newTop = row.getBoundingClientRect().top;
        if (oldTop !== undefined && oldTop !== newTop)
          row.animate([{ transform: "translateY(" + (oldTop - newTop) + "px)" }, { transform: "translateY(0)" }],
            { duration: 220, easing: "ease-out" });
      });
    }
    $("codeHint").textContent = preview
      ? "Podgląd miejsca docelowego — upuść klocek, aby zatwierdzić kolejność."
      : "Kod odzwierciedla Twój plan, również gdy zawiera błąd. Użyj „Sprawdź plan”, aby ocenić kolejność.";
  }
  function selectCode() { $("copyCode").focus(); $("copyCode").select(); }
  $("selectCode").onclick = () => {
    selectCode();
    $("copyStatus").textContent = "Zaznaczono cały kod. Naciśnij Ctrl+C (lub ⌘C).";
  };
  $("copyButton").onclick = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText($("copyCode").value);
      $("copyStatus").textContent = "Skopiowano cały program bez numerów.";
    } catch {
      selectCode();
      $("copyStatus").textContent = "Automatyczne kopiowanie jest niedostępne. Naciśnij Ctrl+C (lub ⌘C).";
    }
  };

  // 5. Sprawdzanie, zmiana trybu i reset.
  $("check").onclick = () => {
    const error = rules.issue(order, true);
    status(error || task.successMessage, error ? "error" : "success");
  };
  function updateMode() {
    for (const name of ["magnet", "free"])
      $(name).setAttribute("aria-pressed", String(name === mode));
    $("modeNote").textContent = mode === "magnet"
      ? "Magnesy łączą poprawny początek algorytmu. Dokładaj kolejne kroki od góry. Zły krok odskoczy."
      : "Możesz układać dowolnie i zamieniać klocki miejscami. Dopiero „Sprawdź plan” oceni zależności.";
  }
  for (const name of ["magnet", "free"]) $(name).onclick = () => {
    clearDrag();
    mode = name;
    updateMode();
    invalidate();
    render();
  };
  $("reset").onclick = () => {
    clearDrag();
    order = blocks.map(() => null);
    selected = null;
    bankOrder = blocks.map(b => b.id);
    for (let i = bankOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bankOrder[i], bankOrder[j]] = [bankOrder[j], bankOrder[i]];
    }
    render();
    status(task.initialMessage);
  };
  updateMode();
  render();
  status(task.initialMessage);
})();

