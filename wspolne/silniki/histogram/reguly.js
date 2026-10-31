/* MODEL HISTOGRAMU. Niezależny od interfejsu i wspólnego odtwarzacza. */
(function(root){
  'use strict';
  function parseInput(text,limits){
    const input=String(text).trim();
    const error=message=>({ok:false,message});
    if(!input)return error('Podaj przynajmniej jedną liczbę.');
    const tokens=input.split(/[\s,;]+/);
    if(tokens.some(v=>!v||!/^[+-]?\d+$/.test(v)))return error('Użyj liczb całkowitych oddzielonych spacją, przecinkiem lub średnikiem.');
    if(tokens.length>limits.maxLength)return error('Możesz podać najwyżej '+limits.maxLength+' liczb.');
    const values=tokens.map(Number);
    if(!values.every(v=>Number.isSafeInteger(v)&&v>=limits.minValue&&v<=limits.maxValue))return error('Liczby muszą mieścić się w zakresie od '+limits.minValue+' do '+limits.maxValue+'.');
    // Zakres histogramu nie jest ograniczeniem formularza — sprawdzamy go w pętli.
    return {ok:true,values};
  }
  function createTrace(values,range={min:0,max:9}){
    if(!Array.isArray(values)||!values.length||!values.every(Number.isSafeInteger))throw new Error('Potrzebna jest niepusta tablica liczb całkowitych.');
    if(range.min!==0||!Number.isInteger(range.max)||range.max<0||range.max>99)throw new Error('Histogram wymaga indeksów od 0 do maksymalnie 99.');
    const histogram=Array(range.max+1).fill(0),trace=[];let idx=0,wartosc=null,accepted=0,ignored=0,idxInitialized=false;
    // Wypisane znaki są osobną historią: zmiana licznika nie rysuje gwiazdek.
    const printed=Array(histogram.length).fill(0),rowStarted=Array(histogram.length).fill(false),rowFinished=Array(histogram.length).fill(false);
    let stage='count',liczba=null,gwiazdka=null;
    function add(phase,line,message,extra={}){trace.push({phase,line,message,idx,idxInitialized,wartosc,nval:values.length,tab:values.slice(),histogram:histogram.slice(),accepted,ignored,target:null,valid:null,stage,liczba,gwiazdka,printed:printed.slice(),rowStarted:rowStarted.slice(),rowFinished:rowFinished.slice(),outputTarget:stage==='output'&&liczba<histogram.length?liczba:null,...extra});}
    add('init','init','Wszystkie '+histogram.length+' liczników histogramu ustawiono na 0. Tablica tab przechowuje dane wejściowe.');
    idxInitialized=true;
    add('forInit','loop','Inicjalizacja pętli: size_t idx = 0. Wykonujemy ją tylko raz, przed pierwszym sprawdzeniem warunku.',{part:'init'});
    while(idx<values.length){
      add('loop','loop','Sprawdzenie pętli: '+idx+' < '+values.length+' — TAK. Zaczynamy iterację '+(idx+1)+'.',{part:'condition'});
      add('body','loop','Warunek jest prawdziwy. Wchodzimy do ciała pętli i przechodzimy do odczytu tab[idx].',{part:'body'});
      wartosc=values[idx];
      add('load','load','Odczytujemy tab['+idx+'] = '+wartosc+' i zapisujemy tę liczbę w zmiennej wartosc. To jeszcze nie jest licznik histogramu.');
      const valid=wartosc>=range.min&&wartosc<=range.max;
      add('validate','validate','Czy '+wartosc+' mieści się w zakresie '+range.min+'–'+range.max+'? '+(valid?'TAK — można jej użyć jako indeksu.':'NIE — nie wolno indeksować nią histogramu.'),{valid});
      if(valid){
        add('address','increment','wartosc = '+wartosc+', więc wybieramy histogram['+wartosc+']. Jego licznik wynosi teraz '+histogram[wartosc]+'.',{valid,target:wartosc});
        const previous=histogram[wartosc];histogram[wartosc]++;accepted++;
        add('increment','increment','Zwiększamy histogram['+wartosc+']: '+previous+' → '+histogram[wartosc]+'. To kolejne wystąpienie liczby '+wartosc+'.',{valid,target:wartosc,previous,value:histogram[wartosc]});
      }else{
        ignored++;add('skip','ifEnd','Pomijamy '+wartosc+'. Nie odczytujemy ani nie zmieniamy żadnej komórki histogramu.',{valid:false});
      }
      idx++;wartosc=null;
      add('advance','loop','Zwiększamy idx do '+idx+'. '+(idx<values.length?'W następnej iteracji odczytamy tab['+idx+'].':'Dotarliśmy za ostatnią komórkę tab.'),{part:'increment',endIteration:true});
    }
    add('loopEnd','loop','Sprawdzenie pętli: '+idx+' < '+values.length+' — NIE. Kończymy zliczanie. Ciało i ++idx nie wykonają się ponownie.',{part:'condition'});
    stage='output';liczba=0;
    add('printInit','printLoop','Histogram jest gotowy. Rozpoczynamy wypisywanie: liczba = 0, czyli pierwszy indeks histogramu. Inicjalizacja tej pętli wykona się tylko raz.',{part:'init'});
    while(liczba<histogram.length){
      add('printCondition','printLoop','Sprawdzenie pętli wierszy: '+liczba+' < '+histogram.length+' — TAK.',{part:'condition'});
      add('printBody','printLoop','Wchodzimy do ciała pętli. Wypiszemy indeks '+liczba+' i tyle gwiazdek, ile wynosi histogram['+liczba+'] = '+histogram[liczba]+'.',{part:'body'});
      rowStarted[liczba]=true;
      add('printLabel','printLabel','cout wypisuje indeks i dwukropek: "'+liczba+': ". Gwiazdek jeszcze nie wypisano w tym wierszu.');
      gwiazdka=0;
      add('starInit','starLoop','Inicjalizacja wewnętrznej pętli: gwiazdka = 0. Wykonujemy ją od nowa dla każdego wiersza.',{part:'init'});
      while(gwiazdka<histogram[liczba]){
        add('starCondition','starLoop','Sprawdzenie: '+gwiazdka+' < histogram['+liczba+'] = '+histogram[liczba]+' — TAK. Można wypisać kolejną gwiazdkę.',{part:'condition'});
        add('starBody','starLoop','Wchodzimy do ciała wewnętrznej pętli i przechodzimy do cout.',{part:'body'});
        printed[liczba]++;
        add('printStar','printStar','cout << \'*\' wypisuje jedną gwiazdkę. W wierszu '+liczba+' wypisano '+printed[liczba]+' z '+histogram[liczba]+' gwiazdek.');
        gwiazdka++;
        add('starAdvance','starLoop','Zwiększamy gwiazdka do '+gwiazdka+'. Samo ++gwiazdka niczego nie wypisuje; wracamy do sprawdzenia warunku.',{part:'increment'});
      }
      add('starEnd','starLoop','Sprawdzenie: '+gwiazdka+' < histogram['+liczba+'] = '+histogram[liczba]+' — NIE. '+(histogram[liczba]===0?'Licznik jest zerowy, więc ciało pętli nie wykonało się ani razu.':'Wypisano wszystkie gwiazdki w tym wierszu.'),{part:'condition'});
      rowFinished[liczba]=true;
      add('printNewline','printNewline','cout wypisuje znak nowego wiersza i kończy wiersz '+liczba+'. Następny indeks wypiszemy w nowym wierszu.');
      liczba++;gwiazdka=null;
      add('printAdvance','printLoop','Zwiększamy liczba do '+liczba+'. '+(liczba<histogram.length?'Przechodzimy do następnego indeksu histogramu.':'Dotarliśmy za ostatni indeks histogramu.'),{part:'increment',endIteration:true,lastIteration:liczba===histogram.length});
    }
    add('printEnd','printLoop','Sprawdzenie pętli wierszy: '+liczba+' < '+histogram.length+' — NIE. Koniec wypisywania.',{part:'condition'});
    add('done',null,'Gotowe. Wypisano '+printed.reduce((a,b)=>a+b,0)+' gwiazdek. Uwzględniono '+accepted+' liczb, pominięto '+ignored+'.',{done:true});
    return trace;
  }
  function iterationEnd(trace,position){for(let i=position+1;i<trace.length;i++)if(trace[i].endIteration||trace[i].done)return trace[i].lastIteration?trace.length-1:i;return trace.length-1;}
  const api={parseInput,createTrace,iterationEnd};if(typeof module==='object'&&module.exports)module.exports=api;else root.HistogramTrace=api;
})(typeof window==='undefined'?globalThis:window);
