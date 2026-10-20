import {createContext,useContext,useEffect,useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {deviceLanguage,resetScope,translate,detect} from '@/lib/local-translator';

type Language='en'|'es';
const Context=createContext({language:'en' as Language,scope:'',choose:(_value:Language)=>{}});
export function ChatLanguageProvider({scope,children}:{scope:string;children:ReactNode}){
  // Remount language state at the account/company boundary, even when the caller
  // reuses this provider instance during an in-app account switch.
  return <ScopedChatLanguageProvider key={scope} scope={scope}>{children}</ScopedChatLanguageProvider>;
}
function ScopedChatLanguageProvider({scope,children}:{scope:string;children:ReactNode}){
  const [language,setLanguage]=useState<Language>(()=>{
    try{const saved=localStorage.getItem('teamstead-chat-language:'+scope);if(saved==='en'||saved==='es')return saved;}catch{}
    return deviceLanguage();
  });
  useLayoutEffect(()=>{resetScope(scope);return()=>resetScope('');},[scope]);
  useEffect(()=>{const previous=document.documentElement.lang;document.documentElement.lang=language;return()=>{document.documentElement.lang=previous;};},[language]);
  function choose(value:Language){setLanguage(value);try{localStorage.setItem('teamstead-chat-language:'+scope,value);}catch{}}
  return <Context.Provider value={{language,scope,choose}}>{children}</Context.Provider>;
}
export function ChatLanguagePicker(){
  const {language,choose}=useContext(Context);
  return <label className="chat-language-picker"><span>Language / Idioma</span><select aria-label="Chat language / Idioma del chat" value={language} onChange={e=>choose(e.target.value as Language)}><option value="en">English</option><option value="es">Español</option></select></label>;
}
function Text({body}:{body:string}){return <>{body.split(/(https?:\/\/[^\s<>]+)/g).map((part,i)=>/^https?:\/\//.test(part)?<a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>:part)}</>;}
export function ChatMessageText({body}:{body:string}){
  const {language,scope}=useContext(Context),element=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false),[attempt,setAttempt]=useState(0),[original,setOriginal]=useState(false);
  const key=scope+'\0'+language+'\0'+body;
  const [result,setResult]=useState<{key:string;text:string|null}>();
  useEffect(()=>{
    const node=element.current;if(!node)return;
    if(!('IntersectionObserver' in window)){setVisible(true);return;}
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'100px'});observer.observe(node);return()=>observer.disconnect();
  },[]);
  useEffect(()=>{setOriginal(false);if(!visible||!scope)return;let alive=true;void translate(body,language).then(text=>{if(alive)setResult({key,text});});return()=>{alive=false;};},[key,visible,attempt]);
  const current=result?.key===key?result:undefined;
  const changed=!!current?.text&&current.text!==body;
  const display=original||!changed?body:current.text!;
  const waiting=visible&&!current&&detect(body)!==language&&!!detect(body);
  return <div ref={element} className="chat-translated-message">
    <p className="message-text" lang={original?undefined:changed?language:undefined}><Text body={display}/></p>
    {changed&&<div className="chat-translation-meta"><span>{language==='es'?'Traducción automática':'Automatic translation'}</span><button type="button" aria-expanded={original} onClick={()=>setOriginal(v=>!v)}>{original?(language==='es'?'Ver traducción':'View translation'):(language==='es'?'Ver original':'View original')}</button></div>}
    {waiting&&<small className="chat-translation-meta" role="status">{language==='es'?'Preparando traducción… El original sigue visible.':'Preparing translation… Original remains visible.'}</small>}
    {current?.text===null&&/[a-záéíóúñü]/i.test(body)&&<div className="chat-translation-meta"><span>{language==='es'?'Traducción no disponible. Mostrando el original.':'Translation unavailable. Showing original.'}</span><button type="button" onClick={()=>{setResult(undefined);setAttempt(v=>v+1);}}>{language==='es'?'Reintentar traducción':'Retry translation'}</button></div>}
  </div>;
}
