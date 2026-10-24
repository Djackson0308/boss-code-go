(function(){
 'use strict';
 const API='https://boss-code-go-api.dezthareason4ever.workers.dev';
 const PART=8*1024*1024,MAX=2*1024*1024*1024;
 let getKey=()=>'',base=API;
 let activeUploads=0;
 const bytes=n=>(n/1024/1024).toFixed(1)+' MiB';
 const digest=async data=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(x=>x.toString(16).padStart(2,'0')).join('');
 async function api(path,options={}){
  const key=getKey();if(!key)throw Error('Sign in to administration first.');
  const response=await fetch(base+path,{...options,headers:{'X-Admin-Key':key,...(typeof options.body==='string'?{'Content-Type':'application/json'}:{}),...options.headers}});
  const data=await response.json().catch(()=>({}));if(!response.ok||data.success===false)throw Error(data.error||`Video service unavailable (${response.status}).`);return data;
 }
 function xhr(path,blob,signal,progress){return new Promise((resolve,reject)=>{
  const x=new XMLHttpRequest();x.open('PUT',base+path);x.setRequestHeader('X-Admin-Key',getKey());x.setRequestHeader('Content-Type','application/octet-stream');x.timeout=120000;
  const abort=()=>x.abort();signal?.addEventListener('abort',abort,{once:true});
  x.upload.onprogress=e=>progress(e.loaded);x.onload=()=>{signal?.removeEventListener('abort',abort);let data;try{data=JSON.parse(x.responseText);}catch{}if(x.status>=200&&x.status<300&&data?.success)resolve(data);else reject(Error(data?.error||'Upload failed. Reselect this file to resume.'));};
  x.onerror=()=>reject(Error('Network error. Reselect this file to resume.'));x.ontimeout=()=>reject(Error('Upload timed out. Reselect this file to resume.'));x.onabort=()=>reject(new DOMException('Upload paused. Reselect the same file to resume.','AbortError'));
  if(signal?.aborted){reject(new DOMException('Upload paused.','AbortError'));return;}x.send(blob);
 });}
 async function uploadFile(file,{onProgress=()=>{},signal}={}){
  if(!file||!file.name.toLowerCase().endsWith('.mp4')||file.size<32||file.size>MAX)throw Error('Choose an MP4 video up to 2 GiB.');
  const hashes=[];for(let at=0;at<file.size;at+=PART){if(signal?.aborted)throw new DOMException('Upload paused.','AbortError');onProgress(0,'Checking video '+Math.round(at/file.size*100)+'%');hashes.push(await digest(await file.slice(at,at+PART).arrayBuffer()));}
  const start=await api('/admin/video-library/uploads',{method:'POST',body:JSON.stringify({filename:file.name,bytes:file.size,hashes})});
  if(start.duplicate){onProgress(100,'Existing copy selected. Save this section to apply it.');return start.asset;}
  for(let index=0;index<hashes.length;index++){
   const at=index*PART;const result=await xhr(`/admin/video-library/${start.id}/parts/${index+1}`,file.slice(at,at+PART),signal,loaded=>onProgress(Math.min(99,Math.round((at+loaded)/file.size*100)),'Uploading '+file.name));
   if(result.sha256!==hashes[index])throw Error('Upload integrity check failed. Reselect the same file to retry.');
  }
  if(signal?.aborted)throw new DOMException('Upload paused. Reselect the same file to resume.','AbortError');
  onProgress(99,'Validating video…');const result=await api(`/admin/video-library/${start.id}/complete`,{method:'POST',body:'{}'});
  onProgress(100,'Upload complete. Save this section to apply it.');return result.asset;
 }
 async function upload(file,options){activeUploads++;try{return await uploadFile(file,options);}finally{activeUploads--;}}
 function guardSave(event){
  if(!activeUploads)return;
  const button=event.target.closest?.('button');
  if(event.type==='submit'||button&&!button.closest('.boss-video-input,.boss-video-library')&&(/save$/i.test(button.id)||/^(SAVE|PUBLISH|ADD (VIDEO|MUSIC VIDEO)|UPDATE (VIDEO|MUSIC VIDEO))\b/i.test(button.textContent.trim()))){event.preventDefault();event.stopImmediatePropagation();document.querySelectorAll('.boss-video-input [role=status]').forEach(s=>s.textContent='Wait for the current video upload to finish or pause it before saving.');}
 }
 document.addEventListener('click',guardSave,true);document.addEventListener('submit',guardSave,true);
 async function library(onSelect){
  const dialog=document.createElement('dialog');dialog.className='boss-video-library';
  const title=document.createElement('h2');title.textContent='Video Library';const close=document.createElement('button');close.type='button';close.textContent='Close';close.onclick=()=>dialog.close();
  const usage=document.createElement('p'),list=document.createElement('div'),status=document.createElement('p');status.setAttribute('role','status');const more=document.createElement('button');more.type='button';more.textContent='Load more';more.hidden=true;
  dialog.append(title,close,usage,status,list,more);document.body.append(dialog);dialog.addEventListener('close',()=>{window.BossVideo?.stop(dialog);dialog.remove();});dialog.showModal();let page=0;
  async function load(reset=false){try{
   if(reset){page=0;list.replaceChildren();}status.textContent='Loading…';const data=await api('/admin/video-library?page='+page);usage.textContent=`Library storage: ${bytes(data.usage.bytes)} / ${bytes(data.storage_limit_bytes)} · ${data.usage.files} files. Trash retains storage until an approved purge.`;
   for(const asset of data.data){
    const row=document.createElement('article');const name=document.createElement('strong');name.textContent=asset.filename;const info=document.createElement('p');info.textContent=`${asset.created_at} · ${bytes(asset.bytes)}${asset.state==='trashed'?' · In Trash':''}`;
    row.append(name,info);
    const action=(text,handler)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=async()=>{b.disabled=true;try{await handler();}catch(e){status.textContent=e.message;}finally{b.disabled=false;}};row.append(b);};
    if(asset.state==='ready'){
     if(onSelect)action('Use this video',async()=>{onSelect(asset);dialog.close();});
     action('Preview',async()=>{const result=await api(`/admin/video-library/${asset.id}/preview`,{method:'POST',body:'{}'});let host=dialog.querySelector('[data-preview]');if(!host){host=document.createElement('div');host.dataset.preview='';dialog.append(host);}window.BossVideo.render(host,result.url,{title:asset.filename});});
     action('Show uses',async()=>{const r=await api(`/admin/video-library/${asset.id}/references`);status.textContent=r.data.length?r.data.map(x=>`${x.table} #${x.id} (${Number(x.published)===1?'published':'draft'})`).join('; '):'No saved references. Publishing in a public section makes this video publicly playable.';});
     action('Move to Trash',async()=>{if(!confirm('Move this unused video to Trash? Saved references will prevent removal.'))return;await api(`/admin/video-library/${asset.id}`,{method:'DELETE'});await load(true);});
    }else if(asset.state==='trashed')action('Restore',async()=>{await api(`/admin/video-library/${asset.id}/restore`,{method:'POST',body:'{}'});await load(true);});
    if(['uploading','failed'].includes(asset.state)){info.textContent+=' · '+asset.state+' — reselect the same file to resume, or discard it.';action('Discard incomplete upload',async()=>{await api('/admin/video-library/'+asset.id,{method:'DELETE'});await load(true);});}
    list.append(row);
   }more.hidden=!data.has_more;status.textContent=data.data.length?'Select a video, preview it, or inspect its uses.':'No uploaded videos yet.';page++;
  }catch(e){status.textContent=e.message;}}
  more.onclick=()=>load();await load();
 }
 function mount(target,options={}){
  const input=typeof target==='string'?document.querySelector(target):target;if(!input||input.dataset.bossVideo)return;input.dataset.bossVideo='true';
  const box=document.createElement('fieldset');box.className='boss-video-input';const legend=document.createElement('legend');legend.textContent='Video source';
  const file=document.createElement('input');file.type='file';file.accept='video/mp4,.mp4';file.setAttribute('aria-label','Select MP4 video from computer');
  const start=document.createElement('button');start.type='button';start.textContent='Upload Video from Computer';
  const choose=document.createElement('button');choose.type='button';choose.textContent='Existing Video Library';
  const link=document.createElement('button');link.type='button';link.textContent='YouTube Link';
  const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Pause upload';cancel.hidden=true;
  const progress=document.createElement('progress');progress.max=100;progress.value=0;progress.hidden=true;progress.setAttribute('aria-label','Video upload progress');
  const status=document.createElement('p');status.setAttribute('role','status');const hint=document.createElement('small');hint.textContent='MP4 up to 2 GiB, subject to the shared storage allowance. Use H.264 video with AAC audio for iPhone, Android and desktop. Titles, thumbnails and publish controls are saved below. Publishing in any public section makes the shared video public.';
  let controller;
  const select=asset=>{input.value=asset.url;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));options.onSelect?.(asset);status.textContent='Video selected. Save this section to apply it.';};
  start.onclick=async()=>{if(!file.files[0]){file.click();return;}controller=new AbortController();start.disabled=choose.disabled=true;cancel.hidden=false;progress.hidden=false;try{select(await upload(file.files[0],{signal:controller.signal,onProgress:(percent,text)=>{progress.value=percent;status.textContent=text;}}));}catch(e){status.textContent=e.message;}finally{start.disabled=choose.disabled=false;cancel.hidden=true;}};
  cancel.onclick=()=>controller?.abort();choose.onclick=()=>library(select);link.onclick=()=>{input.focus();status.textContent='Paste a YouTube link in the video field, then save this section.';};
  box.append(legend,file,start,choose,link,cancel,progress,status,hint);input.after(box);
 }
 const style=document.createElement('style');style.textContent='.boss-video-input{border:1px solid #555;padding:12px;margin:10px 0;min-width:0}.boss-video-input button,.boss-video-library button{margin:4px;padding:10px;background:#252525;color:#fff;border:1px solid #777;border-radius:5px;cursor:pointer}.boss-video-input input{display:block;max-width:100%;margin:8px 0}.boss-video-input progress{width:100%}.boss-video-input small{display:block;line-height:1.5}.boss-video-library{background:#111;color:#fff;border:1px solid #c6a04d;max-width:760px;width:90vw;max-height:85vh;overflow:auto}.boss-video-library::backdrop{background:#000b}.boss-video-library article{padding:12px;border-bottom:1px solid #555;overflow-wrap:anywhere}.boss-video-library video{max-height:360px}';document.head.append(style);
 window.BossVideoLibrary={configure(options){getKey=options.getKey;base=options.api||API;},upload,mount,open:library,api};
})();
