// A compact reader-language selector using PMS Chat's existing authenticated
// language setting. Its API checks and per-employee persistence stay in place.
function __pmsMountReaderControl(me) {
  const host=document.querySelector('.topbar-right');
  if(!host)return ()=>{};
  document.getElementById('pms-reader-language')?.remove();
  const group=document.createElement('label');group.id='pms-reader-language';
  group.className='pms-reader-language';
  const caption=document.createElement('span');caption.textContent=me.language==='es'?'Idioma':'Language';
  const select=document.createElement('select');select.setAttribute('aria-label','Reading language / Idioma de lectura');
  for(const [value,text] of [['en','English'],['es','Español']]){
    const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);
  }
  select.value=me.language==='en'||me.language==='es'?me.language:_e();
  const status=document.createElement('small');status.setAttribute('role','status');
  select.onchange=async()=>{
    const target=select.value;select.disabled=true;status.textContent=target==='es'?'Guardando…':'Saving…';
    try{
      // Preserve the exact typed originals. Only the reader's language and
      // automatic-display preference change; no message write is made here.
      await $e({action:'language',language:target,automatic:true});
      window.location.reload();
    }catch{
      select.value=me.language==='es'?'es':'en';select.disabled=false;
      status.textContent=target==='es'?'No se guardó. Inténtalo de nuevo.':'Not saved. Try again.';
    }
  };
  group.append(caption,select,status);host.prepend(group);
  return()=>group.remove();
}
