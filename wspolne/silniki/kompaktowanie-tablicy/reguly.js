/* MODEL BEZ DOM. Stan po instrukcji + pełna historia, bez timerów i mutacji wejścia. */
(function(root){
  'use strict';
  function parseInput(valuesText,removeText,limits){
    const reject=(field,message)=>({ok:false,field,message});
    const text=String(valuesText).trim();
    if(!text)return reject('values','Podaj przynajmniej jedną liczbę w tablicy.');
    // Akceptujemy spacje, przecinki i średniki, także przy wklejaniu wielu wierszy.
    const tokens=text.split(/[\s,;]+/);
    if(tokens.some(t=>!t || !/^[+-]?\d+$/.test(t)))return reject('values','Użyj liczb całkowitych oddzielonych spacją, przecinkiem lub średnikiem.');
    if(tokens.length>limits.maxLength)return reject('values','Możesz podać najwyżej '+limits.maxLength+' liczb. Teraz jest ich '+tokens.length+'.');
    const values=tokens.map(Number);
    const inRange=v=>Number.isSafeInteger(v)&&v>=limits.minValue&&v<=limits.maxValue;
    if(!values.every(inRange))return reject('values','Liczby muszą mieścić się w zakresie od '+limits.minValue+' do '+limits.maxValue+'.');
    const x=String(removeText).trim();
    if(!/^[+-]?\d+$/.test(x)||!inRange(Number(x)))return reject('remove','Wpisz jedną liczbę całkowitą z zakresu od '+limits.minValue+' do '+limits.maxValue+'.');
    return {ok:true,values,remove:Number(x)};
  }
  function createTrace(values,xval){
    if(!Array.isArray(values)||!values.length||!values.every(Number.isSafeInteger)||!Number.isSafeInteger(xval))throw new Error('Potrzebna jest niepusta tablica liczb całkowitych i wartość do usunięcia.');
    const tab=values.slice(),nval=tab.length,trace=[];let idx=0,len=0,idxInitialized=false;
    function add(phase,line,message,extra={}){
      trace.push({phase,line,message,idx,idxInitialized,len,nval,xval,tab:tab.slice(),iteration:Math.min(idx+1,nval),...extra});
    }
    add('init','init','Ustawiono len = 0. Wynik jest pusty. Zmienna idx zostanie zainicjalizowana w nagłówku for.');
    idxInitialized=true;
    add('forInit','loop','Inicjalizacja pętli: size_t idx = 0. Wykonujemy ją tylko raz, przed pierwszym sprawdzeniem warunku.',{part:'init'});
    while(idx<nval){
      const readIndex=idx,value=tab[idx],writeIndex=len,keep=value!==xval;
      add('loop','loop','Sprawdzenie pętli: '+idx+' < '+nval+' — TAK. Rozpoczynamy iterację '+(idx+1)+'.',{readIndex,part:'condition'});
      add('body','loop','Warunek jest prawdziwy. Wchodzimy do ciała pętli i przechodzimy do instrukcji if.',{part:'body'});
      add('compare','compare','Czy tab['+idx+'] = '+value+' różni się od '+xval+'? '+(keep?'TAK — zachowamy tę wartość.':'NIE — pomijamy zapis. len pozostaje równe '+len+'.'),{readIndex,value,keep});
      if(keep){
        const previous=tab[len];tab[len]=value;
        add('write','write',idx===len?'Czytam i zapisuję pod tym samym indeksem '+idx+'. Wartość '+value+' pozostaje w tej komórce.':'Czytam spod indeksu '+idx+', zapisuję pod indeksem '+len+'. Kopiuję '+value+'; w miejscu docelowym było '+previous+'.',{readIndex,writeIndex,value,previous,keep});
        len++;
        add('len','len','Zapis wykonany. Zwiększamy len: '+(len-1)+' → '+len+'. Gotowy fragment ma teraz '+len+' elementów.',{readIndex,writeIndex,value,keep});
      }
      idx++;
      add('advance','loop','Zwiększamy idx: '+(idx-1)+' → '+idx+'. '+(idx<nval?'Następny odczyt będzie spod indeksu '+idx+'.':'Wskaźnik odczytu dotarł za ostatnią komórkę.'),{readIndex,value,keep,part:'increment',endIteration:true,iteration:idx});
    }
    add('loopEnd','loop','Sprawdzenie pętli: '+idx+' < '+nval+' — NIE. Kończymy pętlę. Ciało i ++idx nie wykonają się ponownie.',{part:'condition'});
    add('done',null,'Gotowe. Nowa długość logiczna wynosi '+len+'. '+(len?'Wynik to pierwsze '+len+' komórek.':'Wynik jest pusty; wszystkie wartości zostały pominięte.'),{done:true,iteration:nval});
    return trace;
  }
  function iterationEnd(trace,position){
    for(let i=position+1;i<trace.length;i++)if(trace[i].endIteration||trace[i].done)return trace[i].endIteration&&trace[i].idx===trace[i].nval?trace.length-1:i;
    return trace.length-1;
  }
  const api={parseInput,createTrace,iterationEnd};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.ArrayTrace=api;
})(typeof window==='undefined'?globalThis:window);
