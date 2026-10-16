import {useEffect,useRef,useState} from 'react';
import type {Worker} from 'tesseract.js';
import {suggestNotions} from './photo-notions';

export function PhotoSearch({notions,onSearch}:{notions:string[];onSearch:(tags:string[])=>void}){
 const [open,setOpen]=useState(false),[preview,setPreview]=useState(''),[text,setText]=useState(''),[busy,setBusy]=useState(false),[status,setStatus]=useState(''),[error,setError]=useState(''),[selected,setSelected]=useState<string[]>([]);
 const upload=useRef<HTMLInputElement>(null),camera=useRef<HTMLInputElement>(null),worker=useRef<Worker|null>(null),generation=useRef(0);
 const suggestions=suggestNotions(text,notions);
 useEffect(()=>()=>{generation.current++;void worker.current?.terminate();},[]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
 function stop(){generation.current++;void worker.current?.terminate();worker.current=null;setBusy(false);setStatus('Lecture annulée.');}
 function edit(value:string){setText(value);setSelected(suggestNotions(value,notions).map(s=>s.label));}
 async function scan(file?:File){
  if(!file)return;
  setError('');
  if(file.size>20*1024*1024){setError('Image trop volumineuse (20 Mo maximum).');return;}
  if(!/^image\/(jpeg|png|webp|bmp)$/.test(file.type)){setError('Choisissez une image JPG, PNG ou WebP. Pour une photo HEIC, exportez-la en JPG.');return;}
  const id=++generation.current;setBusy(true);setText('');setSelected([]);setPreview(URL.createObjectURL(file));setStatus('Préparation du lecteur français…');
  let active:Worker|undefined;
  const timeout=window.setTimeout(()=>{if(id===generation.current){stop();setError('La lecture a pris trop de temps. Réessayez avec une photo plus nette ou collez le texte.');}},120000);
  try{
   const bitmap=await createImageBitmap(file);
   const ratio=Math.min(1,2400/Math.max(bitmap.width,bitmap.height));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
   const context=canvas.getContext('2d');if(!context)throw Error('canvas');context.fillStyle='white';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
   if(id!==generation.current)return;
   const {createWorker}=await import('tesseract.js');
   if(id!==generation.current)return;
   const base=new URL(`${import.meta.env.BASE_URL}ocr/`,location.origin).href;
   active=await createWorker('fra',1,{workerPath:base+'worker.min.js',corePath:base+'core',langPath:base+'lang',logger:m=>{if(id===generation.current)setStatus(m.status==='recognizing text'?`Lecture du texte : ${Math.round(m.progress*100)} %`:'Chargement du lecteur français…');}});
   if(id!==generation.current)return;
   worker.current=active;
   const {data}=await active.recognize(canvas);
   if(id!==generation.current)return;
   edit(data.text.slice(0,20000));
   setStatus(data.text.trim()?'Lecture terminée. Vérifiez le texte et les notions proposées.':'Aucun texte lisible. Essayez une photo plus nette, à plat et bien éclairée.');
  }catch{if(id===generation.current)setError('Impossible de lire cette image. Vérifiez votre connexion pour charger le lecteur, ou collez le texte ci-dessous.');}
  finally{clearTimeout(timeout);if(active)await active.terminate().catch(()=>{});if(id===generation.current){worker.current=null;setBusy(false);}}
 }
 return <section className="photo-search" aria-label="Recherche par photo"><button className="photo-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}>▣ Trouver un sujet à partir d’une photo</button>{open&&<div className="photo-body"><h2>Photographiez l’énoncé, retrouvez ses notions.</h2><p>Importez une photo ou utilisez l’appareil photo de votre téléphone. Cadrez une seule page, nette et bien éclairée.</p><div className="photo-buttons"><button disabled={busy} onClick={()=>upload.current?.click()}>Importer une photo</button><button disabled={busy} onClick={()=>camera.current?.click()}>Prendre une photo</button>{busy&&<button onClick={stop}>Annuler la lecture</button>}</div><input ref={upload} data-testid="photo-upload" hidden type="file" accept="image/jpeg,image/png,image/webp,image/bmp" onChange={e=>{void scan(e.target.files?.[0]);e.target.value='';}}/><input ref={camera} data-testid="photo-camera" hidden type="file" accept="image/*" capture="environment" onChange={e=>{void scan(e.target.files?.[0]);e.target.value='';}}/><p className="photo-note">La photo reste sur votre appareil. Le lecteur se télécharge au premier scan. Sur téléphone, « Prendre une photo » ouvre la caméra si votre navigateur le permet.</p>{preview&&<img className="photo-preview" src={preview} alt="Aperçu de votre énoncé"/>}<p role="status">{status}</p>{error&&<p role="alert">{error}</p>}<label htmlFor="photo-text">Texte lu — vous pouvez le corriger ou coller votre énoncé</label><textarea id="photo-text" value={text} disabled={busy} maxLength={20000} rows={7} onChange={e=>edit(e.target.value)}/>{text.trim()&&<><h3>Notions proposées · à vérifier</h3><p>Repérage de mots et d’expressions, sans interprétation des schémas ni résolution des questions. Les formules et l’écriture manuscrite peuvent être mal lues.</p>{suggestions.length?<div className="photo-notions">{suggestions.map(s=><label key={s.label}><input type="checkbox" checked={selected.includes(s.label)} onChange={e=>setSelected(e.target.checked?[...selected,s.label]:selected.filter(n=>n!==s.label))}/><span><strong>{s.label}</strong><small>Indices : {s.evidence.join(', ')}</small></span></label>)}</div>:<p>Aucune notion reconnue. Corrigez le texte ou utilisez la recherche par mots-clés au-dessus.</p>}<button className="photo-submit" disabled={busy||!selected.length} onClick={()=>onSearch(selected)}>Trouver des sujets similaires</button><p className="photo-note">Recherche par notions communes (mode OU), classée par nombre de correspondances. Vous pourrez passer en mode ET pour exiger toutes les notions. Le texte de la photo n’est pas ajouté au lien partagé.</p></>}</div>}</section>;
}
