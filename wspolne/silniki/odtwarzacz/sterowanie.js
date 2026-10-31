/* WSPÓLNY ODTWARZACZ HISTORII. Nie zna DOM, nazw zmiennych ani algorytmu. */
(function(root){
  'use strict';
  function create(options){
    let trace=[],position=0,history=[],busy=false,playing=false,epoch=0,timer=null,wake=null;
    const state=()=>trace[position]||null;
    const status=()=>({position,total:trace.length,busy,playing,canBack:history.length>0,canNext:position<trace.length-1,done:!!state()?.done});
    const signal=()=>options.onStatus?.(status());
    const emit=animate=>{options.onState?.(state(),position,animate);signal();};
    function stop(){
      epoch++;busy=false;playing=false;
      if(timer!==null){clearTimeout(timer);timer=null;}
      if(wake){const done=wake;wake=null;done();}
      signal();
    }
    function delay(ms){return new Promise(resolve=>{wake=resolve;timer=setTimeout(()=>{wake=null;timer=null;resolve();},Math.max(0,ms||0));});}
    function setTrace(states){if(!Array.isArray(states)||!states.length)throw new Error('Historia musi zawierać przynajmniej jeden stan.');stop();trace=states;position=0;history=[];emit(false);}
    function nextInstruction(){
      if(busy||!status().canNext)return false;
      history.push(position);position++;emit(true);return true;
    }
    async function run(auto){
      if(busy){stop();return;}
      if(!status().canNext)return;
      stop();const token=epoch;busy=true;playing=auto;signal();
      try{
        do{
          const target=options.iterationEnd(trace,position);
          if(!Number.isInteger(target)||target<=position||target>=trace.length)throw new Error('Nieprawidłowa granica iteracji.');
          history.push(position);
          while(position<target&&token===epoch){position++;emit(true);if(position<target)await delay(options.stepDelay?.()||0);}
          if(!playing||!status().canNext||token!==epoch)break;
          await delay(options.iterationDelay?.()||0);
        }while(token===epoch);
      }catch(error){if(token===epoch)stop();if(options.onError)options.onError(error);else throw error;}
      finally{if(token===epoch){busy=false;playing=false;signal();}}
    }
    function back(){if(!history.length)return false;stop();position=history.pop();emit(false);return true;}
    function restart(){stop();position=0;history=[];emit(false);}
    return {state,status,stop,setTrace,nextInstruction,nextIteration:()=>run(false),togglePlayback:()=>run(true),back,restart};
  }
  const api={create};if(typeof module==='object'&&module.exports)module.exports=api;else root.TracePlayer=api;
})(typeof window==='undefined'?globalThis:window);
