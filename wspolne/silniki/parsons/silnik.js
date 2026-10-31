/* SILNIK UKŁADANKI KODU (PARSONS)
   Zachowuje przeciąganie linii, ↑/↓, Alt+↑/↓, sprawdzanie początku,
   reset, potwierdzany pokaz rozwiązania, podgląd kodu i zakładki przykładów.
   Treść i reguły konkretnego zadania znajdują się w zadanie.js. */
(function () {
    'use strict';
    const task = window.PARSONS_TASK;
    let rules;
    try {
      rules = window.ParsonsRules.create(task);
    } catch (error) {
      const feedback = document.getElementById('feedback');
      feedback.textContent = error.message;
      feedback.dataset.state = 'error';
      ['check', 'reset', 'solution'].forEach(id => { document.getElementById(id).disabled = true; });
      return;
    }
    const { pieces, byId, assessOrder } = rules;

    // 1. Treść strony: wszystkie teksty zadania pochodzą z danych.
    const text = (id, value) => { document.getElementById(id).textContent = value; };
    document.title = task.ui.pageTitle;
    document.querySelector('meta[name="description"]').content = task.ui.description;
    text('task-id', task.ui.id);
    text('task-eyebrow', task.ui.eyebrow);
    text('task-heading', task.ui.heading);
    text('task-heading-lead', task.ui.headingLead);
    text('task-accent', task.ui.accent);
    text('task-intro', task.ui.intro);
    text('task-mark', task.ui.mark);
    text('task-file', task.ui.fileName);
    text('task-footer', task.ui.footer);
    text('example-note', task.ui.exampleNote);
    document.getElementById('back-link').href = task.ui.backLink;
    // Pola *Html to zaufany tekst autora konfiguracji, nie dane studenta.
    document.getElementById('brief-heading').innerHTML = task.ui.briefHeadingHtml;
    document.getElementById('task-requirements').innerHTML =
      task.ui.requirementsHtml.map(item => '<li>' + item + '</li>').join('');
    document.getElementById('task-note').innerHTML = task.ui.noteHtml;
    document.getElementById('assessment-help').innerHTML = task.ui.assessmentHtml;
    document.getElementById('numbers-help').innerHTML = task.ui.numbersHtml;

    // 2. Stan i renderowanie listy linii.
    const list = document.getElementById('lines');
    const feedback = document.getElementById('feedback');
    const dialog = document.getElementById('solution-dialog');
    let order = [];
    let attempts = 0;
    let checkedPrefix = -1;
    let revealed = false;
    let draggedId = null;
    let dropPlacement = null;
    const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
    function colorCode(text) {
      return text.split(/("(?:[^"\\]|\\.)*")/g).map((part, index) => index % 2 ? '<span class="str">' + escapeHtml(part) + '</span>' : escapeHtml(part).replace(/\b(using|namespace|int|char|double|if|else|return)\b/g, '<span class="kw">$1</span>').replace(/\b(cin|cout|endl)\b/g, '<span class="io">$1</span>')).join('');
    }
    function indentedLines() {
      return rules.formatLines(order);
    }
    function setFeedback(title, message, state = '') {
      feedback.dataset.state = state;
      feedback.replaceChildren();
      const heading = document.createElement('strong');
      heading.textContent = title;
      const body = document.createElement('span');
      body.textContent = message;
      feedback.append(heading, body);
    }
    function render(focusId, direction) {
      const formatted = indentedLines();
      list.replaceChildren();
      order.forEach((id, index) => {
        const piece = byId.get(id);
        const row = document.createElement('li');
        row.className = 'code-row';
        row.dataset.id = id;
        row.draggable = true;
        if (checkedPrefix >= 0 && index < checkedPrefix) row.classList.add('checked');
        if (index === checkedPrefix && checkedPrefix < order.length) row.classList.add('mismatch');
        row.innerHTML = '<span class="handle" aria-hidden="true">⠿</span><span class="number" aria-hidden="true">' + (index + 1) + '</span><code class="code">' + colorCode(formatted[index]) + '</code><span class="move"><button type="button" data-direction="up">↑</button><button type="button" data-direction="down">↓</button></span>';
        row.querySelectorAll('button').forEach(button => {
          const up = button.dataset.direction === 'up';
          button.disabled = up ? index === 0 : index === order.length - 1;
          button.setAttribute('aria-label', 'Przesuń linię ' + (index + 1) + (up ? ' w górę: ' : ' w dół: ') + piece.text);
          button.title = up ? 'W górę (Alt + ↑)' : 'W dół (Alt + ↓)';
        });
        list.append(row);
      });
      document.getElementById('source').textContent = formatted.join('\n') + '\n';
      document.getElementById('line-count').textContent = order.length + ' linii · wcięcia dopasowują się do klamer';
      document.getElementById('attempts').textContent = 'Sprawdzenia: ' + attempts;
      const percent = checkedPrefix < 0 ? 0 : Math.round(checkedPrefix / order.length * 100);
      document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', String(percent));
      document.getElementById('progress-fill').style.width = percent + '%';
      if (focusId !== undefined) {
        const row = list.querySelector('[data-id="' + focusId + '"]');
        const preferred = row.querySelector('[data-direction="' + direction + '"]');
        (preferred && !preferred.disabled ? preferred : row.querySelector('button:not(:disabled)')).focus({preventScroll:true});
        row.scrollIntoView({block:'nearest'});
      }
    }
    function invalidate() {
      checkedPrefix = -1;
      revealed = false;
      setFeedback('Kolejność zmieniona.', 'Sprawdź ponownie, gdy skończysz układanie. Wcięcia pokazują układ aktualnych klamer, a nie poprawność odpowiedzi.');
    }
    // 3. Przenoszenie, sprawdzanie i reset.
    function move(id, direction) {
      const from = order.indexOf(id);
      const to = from + (direction === 'up' ? -1 : 1);
      if (from < 0 || to < 0 || to >= order.length) return;
      [order[from], order[to]] = [order[to], order[from]];
      invalidate();
      render(id, direction);
      document.getElementById('movement').textContent = 'Przesunięto linię na pozycję ' + (to + 1) + ' z ' + order.length + '.';
    }
    function evaluate() {
      attempts += 1;
      const result = assessOrder(order);
      checkedPrefix = result.prefix;
      if (checkedPrefix === order.length) {
        setFeedback(revealed ? 'To jest pokazane rozwiązanie.' : 'Dobra robota — kolejność jest poprawna!', task.ui.successMessage, 'success');
      } else {
        const prefix = checkedPrefix ? 'Początkowe linie (' + checkedPrefix + ') spełniają zasady. ' : '';
        setFeedback('Przyjrzyj się linii ' + (checkedPrefix + 1) + '.', prefix + result.hint + ' Dalsze linie sprawdzimy po poprawieniu tego miejsca.', 'error');
      }
      render();
    }
    function reset() {
      order = pieces.map(piece => piece.id);
      for (let index = order.length - 1; index > 0; index -= 1) {
        const target = Math.floor(Math.random() * (index + 1));
        [order[index], order[target]] = [order[target], order[index]];
      }
      if (order.every((id, index) => byId.get(id).text === pieces[index].text)) [order[0], order[1]] = [order[1], order[0]];
      attempts = 0;
      checkedPrefix = -1;
      revealed = false;
      draggedId = null;
      dropPlacement = null;
      setFeedback('Twoja kolej.', task.ui.initialMessage);
      render();
    }
    // 4. Mysz i klawiatura — ten sam mechanizm co przed podziałem.
    list.addEventListener('click', event => {
      const button = event.target.closest('button[data-direction]');
      if (button) move(button.closest('[data-id]').dataset.id, button.dataset.direction);
    });
    list.addEventListener('keydown', event => {
      if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        const row = event.target.closest('[data-id]');
        if (!row) return;
        event.preventDefault();
        move(row.dataset.id, event.key === 'ArrowUp' ? 'up' : 'down');
      }
    });
    function clearDrop() {
      list.querySelectorAll('.drop-before,.drop-after').forEach(row => row.classList.remove('drop-before','drop-after'));
      dropPlacement = null;
    }
    list.addEventListener('dragstart', event => {
      const row = event.target.closest('[data-id]');
      if (!row || event.target.closest('button')) {event.preventDefault(); return;}
      draggedId = row.dataset.id;
      event.dataTransfer.setData('text/plain', draggedId);
      event.dataTransfer.effectAllowed = 'move';
      row.classList.add('dragging');
    });
    list.addEventListener('dragover', event => {
      const row = event.target.closest('[data-id]');
      if (!row || draggedId === null) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      clearDrop();
      const bounds = row.getBoundingClientRect();
      const after = event.clientY > bounds.top + bounds.height / 2;
      dropPlacement = {id:row.dataset.id, after};
      row.classList.add(after ? 'drop-after' : 'drop-before');
    });
    list.addEventListener('drop', event => {
      event.preventDefault();
      if (draggedId !== null && dropPlacement && dropPlacement.id !== draggedId) {
        const movingId = draggedId;
        const remaining = order.filter(id => id !== movingId);
        const target = remaining.indexOf(dropPlacement.id) + (dropPlacement.after ? 1 : 0);
        remaining.splice(target, 0, movingId);
        order = remaining;
        invalidate();
        render(movingId, 'up');
        document.getElementById('movement').textContent = 'Przeniesiono linię na pozycję ' + (target + 1) + '.';
      }
      draggedId = null;
      clearDrop();
      list.querySelectorAll('.dragging').forEach(row => row.classList.remove('dragging'));
    });
    list.addEventListener('dragend', () => {draggedId = null; clearDrop(); list.querySelectorAll('.dragging').forEach(row => row.classList.remove('dragging'));});
    // 5. Przyciski i dialog potwierdzający pokaz rozwiązania.
    document.getElementById('check').addEventListener('click', evaluate);
    document.getElementById('reset').addEventListener('click', reset);
    document.getElementById('solution').addEventListener('click', () => {dialog.returnValue = ''; dialog.showModal();});
    dialog.addEventListener('close', () => {
      if (dialog.returnValue !== 'reveal') return;
      order = pieces.map(piece => piece.id);
      checkedPrefix = order.length;
      revealed = true;
      setFeedback('Rozwiązanie zostało odkryte.', task.ui.revealMessage, 'success');
      render();
    });
    // Przykłady są danymi, a nie symulatorem. Liczba zakładek jest dowolna.
    const examples = Object.fromEntries(task.examples.map(example => [example.id, example]));
    const exampleSection = document.getElementById('examples-section');
    const tabsHost = document.getElementById('example-tabs');
    exampleSection.hidden = task.examples.length === 0;
    task.examples.forEach((example, index) => {
      const button = document.createElement('button');
      button.className = 'tab';
      button.id = 'tab-' + example.id;
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(index === 0));
      button.setAttribute('aria-controls', 'example');
      button.tabIndex = index === 0 ? 0 : -1;
      button.dataset.example = example.id;
      button.textContent = example.label;
      tabsHost.append(button);
    });
    function selectExample(button) {
      document.querySelectorAll('[data-example]').forEach(tab => {
        const selected = tab === button;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      document.getElementById('example').setAttribute('aria-labelledby', button.id);
      const example = examples[button.dataset.example];
      document.getElementById('example-input').textContent = example.input;
      document.getElementById('example-output').textContent = example.output;
    }
    document.querySelectorAll('[data-example]').forEach(button => {
      button.addEventListener('click', () => selectExample(button));
      button.addEventListener('keydown', event => {
        const tabs = [...document.querySelectorAll('[data-example]')];
        const position = tabs.indexOf(button);
        let target;
        if (event.key === 'ArrowRight') target = (position + 1) % tabs.length;
        if (event.key === 'ArrowLeft') target = (position + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = tabs.length - 1;
        if (target === undefined) return;
        event.preventDefault();
        selectExample(tabs[target]);
        tabs[target].focus();
      });
    });
    if (task.examples.length) selectExample(document.querySelector('[data-example]'));
    reset();
  
})();

