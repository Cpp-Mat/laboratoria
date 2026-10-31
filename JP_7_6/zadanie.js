/* KONFIGURACJA PRZYKŁADU. Mechanizm i wygląd są we wspolne/.
   Zmieniaj tu teksty, dane początkowe, przykłady i limity. */
window.ARRAY_TASK = {
  id: 'JP_7_6',
  eyebrow: 'TABLICE / MODUŁ 7 · DWA INDEKSY',
  title: 'Czytaj stąd. Zapisuj tutaj.',
  description: 'Usuń wszystkie wystąpienia wybranej wartości, zapisując pozostałe liczby na początku tej samej tablicy. Obserwuj dwa indeksy: idx służy do odczytu, len wskazuje następne miejsce zapisu.',
  backLink: '../index.html#04_tablice',
  initial: { values: '4, 7, 2, 7, 5', remove: '7' },
  limits: { maxLength: 100, minValue: -2147483648, maxValue: 2147483647 },
  // Czasy w milisekundach: odstęp między instrukcjami i między iteracjami.
  speeds: [{id:'slow',label:'Wolno',step:650,pause:700},{id:'normal',label:'Spokojnie',step:380,pause:500},{id:'fast',label:'Szybko',step:140,pause:250}],
  defaultSpeed: 'normal',
  examples: [
    { label:'Dwa indeksy', values:[4,7,2,7,5], remove:7 },
    { label:'Kilka obok siebie', values:[7,7,4,7,7,2,7], remove:7 },
    { label:'Nic do usunięcia', values:[4,7,2,7,5], remove:9 },
    { label:'Usuń wszystko', values:[3,3,3,3], remove:3 },
    { label:'Jedna liczba', values:[8], remove:8 },
    { label:'Zera i liczby ujemne', values:[0,-2,0,5,-2,0], remove:0 }
  ],
  // id wierszy łączy podświetlenie z fazami silnika — nie zmieniaj samych id.
  // Szablony uzupełniane po zastosowaniu danych. Części for służą do podświetlania.
  setupCode:[
    {id:'input',text:'int tab[] = { {{values}} };'},
    {id:'size',text:'const size_t nval = {{length}};'},
    {id:'removeValue',text:'const int xval = {{remove}};'},
  ],
  code: [
    {id:'init',text:'size_t len = 0;'},
    {id:'loop',text:'for (size_t idx = 0; idx < nval; ++idx) {',parts:{init:'size_t idx = 0',condition:'idx < nval',increment:'++idx'}},
    {id:'compare',text:'    if (tab[idx] != xval) {'},
    {id:'write',text:'        tab[len] = tab[idx];'},
    {id:'len',text:'        len++;'},
    {id:'ifEnd',text:'    }'},
    {id:'end',text:'}'}
  ],
  notes: [
    'Pętla for: inicjalizacja idx jest wykonywana raz. Potem sprawdzamy warunek; gdy jest prawdziwy, wykonujemy ciało i ++idx, po czym wracamy do warunku. Fałszywy warunek kończy pętlę.',
    'idx zwiększa się po każdym obrocie pętli. len zwiększa się wyłącznie po zapisaniu zachowywanej wartości.',
    'len oznacza jednocześnie długość gotowego fragmentu i indeks następnego miejsca zapisu. Pierwsze len komórek tworzy wynik.',
    'Zapis kopiuje wartość. Nie usuwa komórki źródłowej, nie przesuwa całej tablicy i nie zmienia jej fizycznej pojemności.',
    'Pokazujemy tylko nval podanych komórek. Przerywane miejsce z prawej to znacznik końca, nie dodatkowa komórka.',
    'Na początku każdej iteracji len ≤ idx, więc zapis nie niszczy jeszcze nieodczytanych danych. Chwilę po len++ oba indeksy mogą już wskazywać kolejne miejsca.',
    'To wizualizacja fragmentu programu po wczytaniu danych, a nie uruchomiony kompilator. Przyjmujemy 32-bitowy int i od 1 do 100 liczb.'
  ]
};
