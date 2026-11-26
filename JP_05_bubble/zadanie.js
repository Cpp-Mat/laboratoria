'use strict';

// Zapis stanów do odtwarzacza, niezależny od widoku.
function buildTrace(values) {
  const a = values.slice(), trace = [];
  let ptr = 0, last = a.length - 1, pass = 1, swapped = false, comparisons = 0, swaps = 0;
  const push = (phase, message, extra = {}) => trace.push({a: a.slice(), ptr, last, pass, swapped, comparisons, swaps, phase, message, ...extra});
  push('ready', 'Zaczynamy od pierwszego elementu. Granica przebiegu znajduje się na końcu tablicy.');
  while (true) {
    if (ptr < last) {
      const left = a[ptr], right = a[ptr + 1];
      comparisons++;
      push('compare', `Porównujemy sąsiadów: ${left} oraz ${right}. Czy lewa wartość jest większa od prawej?`, {pair: ptr});
      if (left > right) {
        [a[ptr], a[ptr + 1]] = [right, left];
        swapped = true; swaps++;
        push('decision', `${left} > ${right}: zamiana! Większa wartość przesunęła się w prawo. Flaga swapped ma wartość true.`, {pair: ptr, exchanged: true});
      } else {
        push('decision', `${left} ≤ ${right}: wartości są we właściwej kolejności. Nie zamieniamy ich; flaga swapped się nie zmienia.`, {pair: ptr});
      }
      ptr++;
      push('advance', ptr === last ? 'Wskaźnik ptr dotarł do granicy last. Nie ma już kolejnej pary w tym przebiegu.' : 'Przesuwamy ptr o jeden element w prawo. Następna para ma wspólny element z poprzednią.', {boundary: true});
    } else {
      push('end', swapped ? `Koniec przebiegu ${pass}. Wartość ${a[last]} jest największa w aktywnym obszarze i znajduje się na swoim docelowym miejscu.` : `Koniec przebiegu ${pass}. Nie było żadnej zamiany, więc tablica jest już uporządkowana.`);
      if (!swapped) {
        push('done', 'Sortowanie zakończone: cały ostatni przebieg odbył się bez zamian.', {done: true, boundary: true, passBoundary: true});
        break;
      }
      last--; ptr = 0; swapped = false; pass++;
      push('reset', 'Skracamy obszar o jeden element, wracamy do początku i zerujemy flagę zamian.', {boundary: true, passBoundary: true});
    }
  }
  return trace;
}

if (typeof module === 'object' && module.exports) module.exports = {buildTrace};
else {
  const $ = id => document.getElementById(id);
  let original = [], min = 0, max = 1, mode = 'iteration';
  const labels = {ready:'POCZĄTEK', compare:'PORÓWNANIE', decision:'DECYZJA', advance:'PRZESUNIĘCIE WSKAŹNIKA', end:'KONIEC PRZEBIEGU', reset:'NOWY PRZEBIEG', done:'GOTOWE'};
  const address = i => `a+${i}`;
  const player = TracePlayer.create({
    onState: render,
    onStatus: status => {
      for (const id of ['next', 'instruction', 'next-pass']) $(id).disabled = status.busy || !status.canNext;
      $('back-step').disabled = !status.canBack;
      $('play').disabled = !status.canNext && !status.playing;
      $('play').textContent = status.busy ? '⏸ Zatrzymaj' : '▶ Odtwarzaj';
    },
    iterationEnd: (trace, pos) => {
      const target = trace.findIndex((s, i) => i > pos && (mode === 'pass' ? s.passBoundary : s.boundary));
      return target < 0 ? trace.length - 1 : target;
    },
    stepDelay: () => Number($('speed').value),
    iterationDelay: () => Number($('speed').value)
  });

  function render(s, position, animate) {
    $('first').textContent = address(0); $('ptr').textContent = address(s.ptr); $('last').textContent = address(s.last);
    $('swapped').textContent = String(s.swapped); $('swapped').parentElement.classList.toggle('flag-true', s.swapped);
    $('pass').textContent = `Przebieg ${s.pass}`;
    $('phase').textContent = labels[s.phase]; $('message').textContent = s.message;
    $('phase').parentElement.classList.toggle('finished', !!s.done);
    document.querySelectorAll('#stages li').forEach(li => li.classList.toggle('active', li.dataset.phase === s.phase));
    const zero = 100 * max / (max - min);
    const track = $('array-track');
    track.replaceChildren();
    for (let i = 0; i < s.a.length; i++) {
      const v = s.a[i], sorted = s.done || i > s.last || (s.phase === 'end' && s.swapped && i === s.last), pair = s.pair === i || (s.pair !== undefined && s.pair + 1 === i);
      const cell = document.createElement('div');
      cell.className = `array-cell${sorted ? ' sorted' : ''}${pair ? ' pair' : ''}${pair && s.exchanged ? ' swapped-pair' : ''}`;
      const pointers = document.createElement('div'); pointers.className = 'pointer-labels';
      for (const [name, at, color] of [['first', 0, 'first'], ['ptr', s.ptr, 'ptr'], ['ptr+1', s.pair === undefined ? -1 : s.pair + 1, 'ptr'], ['last', s.last, 'last']]) if (i === at) {
        const flag = document.createElement('span'); flag.className = `pointer-${color}`; flag.textContent = `${name} ▼`; pointers.append(flag);
      }
      const chart = document.createElement('div'); chart.className = 'bar-chart';
      const line = document.createElement('div'); line.className = 'zero-line'; line.style.top = `${zero}%`;
      const bar = document.createElement('div'); bar.className = 'bar';
      bar.style.top = `${100 * (max - Math.max(0, v)) / (max - min)}%`;
      bar.style.height = `${100 * Math.abs(v) / (max - min)}%`;
      chart.append(line, bar);
      const box = document.createElement('div'); box.className = 'cell-box';
      const value = document.createElement('span'); value.className = 'cell-value'; value.textContent = v;
      const index = document.createElement('span'); index.className = 'cell-index'; index.textContent = `a[${i}]`;
      box.append(value, index);
      const addr = document.createElement('div'); addr.className = 'address'; addr.textContent = address(i);
      cell.append(pointers, chart, box, addr); track.append(cell);
      if (animate && s.exchanged && pair && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const distance = i === s.pair ? 1 : -1;
        for (const element of [value, bar]) element.animate([{transform:`translateX(${distance * (cell.offsetWidth + 5)}px)`},{transform:'translateX(0)'}], {duration: Math.min(350, Number($('speed').value)), easing:'ease-out'});
      }
    }
    $('region').textContent = s.done ? 'Cała tablica jest posortowana.' : `Aktywny obszar: od a[0] do a[${s.last}]. Elementy za granicą last nie wymagają dalszych porównań.`;
    $('result').textContent = s.a.join('  ');
    $('result-note').textContent = s.done ? 'Wynik końcowy' : 'Aktualna kolejność elementów';
    $('stats').textContent = `Porównania: ${s.comparisons} · Zamiany: ${s.swaps}`;
    $('original').textContent = original.join('  ');
    if (animate) {
      const focused = track.children[s.ptr], viewport = track.parentElement;
      if (focused && focused.offsetLeft + focused.offsetWidth > viewport.scrollLeft + viewport.clientWidth) viewport.scrollLeft = focused.offsetLeft + focused.offsetWidth - viewport.clientWidth + 25;
      else if (focused && focused.offsetLeft < viewport.scrollLeft) viewport.scrollLeft = focused.offsetLeft;
    }
  }

  function apply() {
    const tokens = $('values').value.trim().split(/[\s,;]+/).filter(Boolean);
    const values = tokens.map(Number);
    const valid = tokens.length >= 1 && tokens.length <= 20 && tokens.every(t => /^[+-]?\d+$/.test(t)) && values.every(v => Number.isInteger(v) && v >= -999 && v <= 999);
    $('input-error').hidden = valid; $('values').setAttribute('aria-invalid', String(!valid));
    if (!valid) { $('input-error').textContent = 'Wpisz od 1 do 20 liczb całkowitych z zakresu od -999 do 999.'; return; }
    original = values; min = Math.min(0, ...values); max = Math.max(0, ...values); if (min === max) max = 1;
    mode = 'iteration'; player.setTrace(buildTrace(values)); $('array-track').parentElement.scrollLeft = 0;
  }
  $('data-form').addEventListener('submit', e => {e.preventDefault(); apply();});
  document.querySelectorAll('[data-values]').forEach(button => button.addEventListener('click', () => {$('values').value = button.dataset.values; apply();}));
  $('back-step').onclick = () => player.back();
  $('next').onclick = () => {mode = 'iteration'; player.nextIteration();};
  $('instruction').onclick = () => player.nextInstruction();
  $('next-pass').onclick = () => {mode = 'pass'; player.nextIteration();};
  $('play').onclick = () => {if (player.status().busy) player.stop(); else {mode = 'iteration'; player.togglePlayback();}};
  $('restart').onclick = () => {player.restart(); $('array-track').parentElement.scrollLeft = 0;};
  apply();
}
