/* DANE ZADANIA. Silnik nie zawiera nazw zmiennych ani rozwiązania prostokąta.
   Zacznij od INSTRUKCJA.md. Pliki działają bez serwera i bez procesu budowania. */
window.NESTED_TASK = {
  id: 'JP_4_1',
  eyebrow: 'PĘTLE / MODUŁ 4 · ZAGNIEŻDŻENIA I WARUNKI',
  title: 'Zbuduj prostokąt.',
  subtitle: 'Od myśli do zagnieżdżeń.',
  description: 'Pobierz całkowitą szerokość i wysokość. Jeśli oba wymiary są dodatnie, narysuj pusty w środku prostokąt ze znaków * i spacji. W przeciwnym razie wyświetl komunikat o błędzie.',
  instruction: 'Rysuj wiersz po wierszu: zewnętrzna pętla przechodzi po wierszach y, wewnętrzna po kolumnach x. Zbuduj warunek brzegu z czterech porównań połączonych przez LUB. Zakładamy, że użytkownik wpisuje dwie liczby mieszczące się w typie int.',
  backLink: '../index.html#03_petle',
  example: 'Szerokość: 8, wysokość: 4\n\n********\n*      *\n*      *\n********',
  notes: 'Wymiary 1 × 1, 1 × N oraz N × 1 są dozwolone — każda pozycja leży wtedy na brzegu. Wcięcia i klamry powstają automatycznie. Podgląd pokazuje Twój układ, także gdy jest on błędny. Strona nie uruchamia C++.',
  program: { before: ['#include <iostream>', 'using namespace std;', '', 'int main() {'], after: ['    return 0;', '}'], indent: '    ' },
  // kind: statement = instrukcja, expression = warunek.
  // Slot list mieści wiele instrukcji; slot expression mieści jeden warunek.
  // W template {{nazwa}} wstawia wyrażenie; {slot:'nazwa'} wstawia wnętrze bloku.
  blocks: [
    { id: 'declare', kind: 'statement', title: 'Przygotuj szerokość i wysokość', detail: 'Dwie zmienne typu int.', template: ['int szerokosc, wysokosc;'] },
    { id: 'prompt', kind: 'statement', title: 'Poproś o wymiary', template: ['cout << "Podaj szerokosc i wysokosc (oddziel spacja): ";'] },
    { id: 'read', kind: 'statement', title: 'Pobierz szerokość i wysokość', template: ['cin >> szerokosc >> wysokosc;'] },
    { id: 'valid', kind: 'statement', title: 'Warunek: czy wymiary są poprawne?', tone: 'branch', slots: { condition: {type:'expression', label:'Jeżeli'}, yes:{type:'list', label:'TAK — wykonaj'}, no:{type:'list', label:'NIE — wykonaj'} }, template: ['if ({{condition}}) {', {slot:'yes'}, '} else {', {slot:'no'}, '}'] },
    { id: 'rows', kind: 'statement', title: 'Pętla po wierszach: y', detail: 'Zacznij od y = 0; po obrocie zwiększ y o 1.', tone:'loop', slots: { condition:{type:'expression', label:'Powtarzaj, dopóki'}, body:{type:'list', label:'W każdym wierszu'} }, template: ['for (int y = 0; {{condition}}; ++y) {', {slot:'body'}, '}'] },
    { id: 'cols', kind: 'statement', title: 'Pętla po kolumnach: x', detail: 'Zacznij od x = 0; po obrocie zwiększ x o 1.', tone:'loop', slots: { condition:{type:'expression', label:'Powtarzaj, dopóki'}, body:{type:'list', label:'W każdej kolumnie'} }, template: ['for (int x = 0; {{condition}}; ++x) {', {slot:'body'}, '}'] },
    { id: 'edge', kind: 'statement', title: 'Warunek: czy to brzeg?', tone:'branch', slots: { condition:{type:'expression', label:'Jeżeli'}, yes:{type:'list', label:'TAK — wykonaj'}, no:{type:'list', label:'NIE — wykonaj'} }, template: ['if ({{condition}}) {', {slot:'yes'}, '} else {', {slot:'no'}, '}'] },
    { id: 'star', kind: 'statement', title: 'Wypisz gwiazdkę', detail:'Bez przechodzenia do nowego wiersza.', template: ["cout << '*';"] },
    { id: 'space', kind: 'statement', title: 'Wypisz spację', detail:'Bez przechodzenia do nowego wiersza.', template: ["cout << ' ';"] },
    { id: 'newline', kind: 'statement', title: 'Przejdź do nowego wiersza', template: ["cout << '\\n';"] },
    { id: 'error', kind: 'statement', title: 'Pokaż błąd wymiarów', template: ['cout << "Wymiary musza byc wieksze od 0.\\n";'] },
    { id:'wPositive', kind:'expression', title:'szerokość > 0', code:'szerokosc > 0' },
    { id:'hPositive', kind:'expression', title:'wysokość > 0', code:'wysokosc > 0' },
    { id:'yLimit', kind:'expression', title:'y < wysokość', code:'y < wysokosc' },
    { id:'xLimit', kind:'expression', title:'x < szerokość', code:'x < szerokosc' },
    { id:'top', kind:'expression', title:'y == 0', detail:'Pierwszy wiersz.', code:'y == 0' },
    { id:'bottom', kind:'expression', title:'y == wysokość − 1', detail:'Ostatni wiersz.', code:'y == wysokosc - 1' },
    { id:'left', kind:'expression', title:'x == 0', detail:'Pierwsza kolumna.', code:'x == 0' },
    { id:'right', kind:'expression', title:'x == szerokość − 1', detail:'Ostatnia kolumna.', code:'x == szerokosc - 1' },
    { id:'and', kind:'expression', title:'I — oba warunki', operator:'&&', operatorLabel:'I', operatorHelp:'oba warunki muszą być spełnione', slots:{a:{type:'expression',label:'Pierwszy warunek'}, b:{type:'expression',label:'Drugi warunek'}} },
    ...[1,2,3].map(n => ({ id:'or'+n, kind:'expression', title:'LUB — co najmniej jeden', operator:'||', operatorLabel:'LUB', operatorHelp:'co najmniej jeden warunek musi być spełniony', slots:{a:{type:'expression',label:'Pierwszy warunek'}, b:{type:'expression',label:'Drugi warunek'}} }))
  ],
  // WZORZEC: dzieci list zapisujemy jako tablice, wyrażenie jako pojedynczy obiekt.
  // Ten sam id może wystąpić we wzorcu tylko raz. Każdy klocek jest wymagany.
  solution: [
    {id:'declare'}, {id:'prompt'}, {id:'read'},
    {id:'valid', slots:{
      condition:{id:'and',slots:{a:{id:'wPositive'},b:{id:'hPositive'}}},
      yes:[{id:'rows',slots:{condition:{id:'yLimit'},body:[
        {id:'cols',slots:{condition:{id:'xLimit'},body:[
          {id:'edge',slots:{
            condition:{id:'or1',slots:{a:{id:'or2',slots:{a:{id:'top'},b:{id:'bottom'}}},b:{id:'or3',slots:{a:{id:'left'},b:{id:'right'}}}}},
            yes:[{id:'star'}],no:[{id:'space'}]
          }}
        ]}}, {id:'newline'}
      ]}}],
      no:[{id:'error'}]
    }}
  ],
  // Te dwie instrukcje mogą zmienić kolejność we wspólnym rodzicu.
  unorderedPairs: [['declare','prompt']],
  success: 'Gotowe! Pętle przechodzą po wierszach i kolumnach, a warunek rozpoznaje wszystkie cztery krawędzie.'
};
