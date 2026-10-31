/* DANE PRZYKŁADU. Odtwarzacz i model histogramu są we wspolne/silniki/. */
window.HISTOGRAM_TASK={
  id:'JP_7_9',
  eyebrow:'TABLICE / MODUŁ 7 · HISTOGRAM',
  title:'Wartość staje się indeksem.',
  description:'Odczytaj liczbę z tab[idx] do zmiennej wartosc. Sprawdź zakres 0–9 i zwiększ histogram[wartosc]. Potem przejdź przez pętle wypisujące histogram gwiazdkami.',
  backLink:'../index.html#04_tablice',
  initial:'2, 5, 2, 9, -1, 0, 5, 12, 2',
  limits:{maxLength:100,minValue:-2147483648,maxValue:2147483647},
  range:{min:0,max:9},
  speeds:[{id:'slow',label:'Wolno',step:650,pause:700},{id:'normal',label:'Spokojnie',step:380,pause:500},{id:'fast',label:'Szybko',step:140,pause:250}],
  defaultSpeed:'normal',
  examples:[
    {label:'Wartość ≠ pozycja',values:[2,5,2,9,-1,0,5,12,2]},
    {label:'Granice 0 i 9',values:[0,9,0,9,0,9]},
    {label:'Jedna powtarzana',values:[4,4,4,4,4]},
    {label:'Każda cyfra raz',values:[9,8,7,6,5,4,3,2,1,0]},
    {label:'Poza zakresem',values:[-3,10,-1,99]},
    {label:'Jedna liczba',values:[7]}
  ],
  // Szablony uzupełniane po zastosowaniu danych. Części for służą do podświetlania.
  setupCode:[
    {id:'input',text:'int tab[] = { {{values}} };'},
    {id:'size',text:'const size_t nval = {{length}};'},
  ],
  code:[
    {id:'init',text:'unsigned int histogram[10] = {};'},
    {id:'loop',text:'for (size_t idx = 0; idx < nval; ++idx) {',parts:{init:'size_t idx = 0',condition:'idx < nval',increment:'++idx'}},
    {id:'load',text:'    int wartosc = tab[idx];'},
    {id:'validate',text:'    if (wartosc >= 0 && wartosc <= 9) {'},
    {id:'increment',text:'        histogram[wartosc]++;'},
    {id:'ifEnd',text:'    }'},
    {id:'end',text:'}'},
    {id:'gap',text:''},
    {id:'printLoop',text:'for (size_t liczba = 0; liczba < 10; ++liczba) {',parts:{init:'size_t liczba = 0',condition:'liczba < 10',increment:'++liczba'}},
    {id:'printLabel',text:'    cout << liczba << ": ";'},
    {id:'starLoop',indent:'    ',text:'    for (unsigned int gwiazdka = 0; gwiazdka < histogram[liczba]; ++gwiazdka) {',parts:{init:'unsigned int gwiazdka = 0',condition:'gwiazdka < histogram[liczba]',increment:'++gwiazdka'}},
    {id:'printStar',text:"        cout << '*';"},
    {id:'starClose',text:'    }'},
    {id:'printNewline',text:"    cout << '\\n';"},
    {id:'printClose',text:'}'}
  ],
  notes:[
    'Pętla for: inicjalizacja idx jest wykonywana raz. Potem sprawdzamy warunek; gdy jest prawdziwy, wykonujemy ciało i ++idx, po czym wracamy do warunku. Fałszywy warunek kończy pętlę.',
    'idx jest pozycją w tablicy wejściowej. wartosc jest odczytaną liczbą. Dopiero wartosc, po sprawdzeniu zakresu, staje się indeksem histogramu.',
    'Na przykład przy idx = 0 i tab[0] = 2 zwiększamy histogram[2], a nie histogram[0]. Wartość licznika oznacza, ile dwójek dotąd wystąpiło.',
    'Zapis unsigned int histogram[10] = {} ustawia wszystkie dziesięć liczników na zero. Nie trzeba wykonywać osobnego przypisania dla każdej cyfry.',
    'Liczby ujemne i większe od 9 są pomijane przez if. Pozostają w tablicy wejściowej; nie używamy ich jako indeksów histogramu.',
    'Tablica tab nie zmienia się podczas zliczania. Suma liczników histogramu to liczba uwzględnionych danych, niekoniecznie nval.',
    'Wynik powstaje dopiero w drugiej części programu. Pętla liczba wybiera wiersz, a pętla gwiazdka wypisuje po jednym znaku, dopóki gwiazdka < histogram[liczba]. Dla zera pętla wewnętrzna nie wypisze żadnej gwiazdki.',
    'Krok instrukcji pokazuje każde cout osobno. Dalej — iteracja w części wypisującej wykonuje cały wiersz. Cofanie usuwa także wcześniej wypisane znaki.',
    'Dane z formularza pokazujemy jako inicjalizację tablicy tab, a potem śledzimy zliczanie i wypisywanie wyniku. Przyjmujemy 32-bitowy int i od 1 do 100 liczb.'
  ]
};
