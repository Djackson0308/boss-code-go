/* Shared byte-based resumable transport. Loaded before video-library.js. */
(function () {
  'use strict';
  const PART = 8 * 1024 * 1024, MAX = 2 * 1024 * 1024 * 1024;
  const digest = async data => [...new Uint8Array(await crypto.subtle.digest('SHA-256', data))].map(x => x.toString(16).padStart(2, '0')).join('');
  function send({ url, key, blob, signal, progress }) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url); xhr.setRequestHeader('X-Admin-Key', key); xhr.setRequestHeader('Content-Type', 'application/octet-stream'); xhr.timeout = 120000;
      const abort = () => xhr.abort();
      const finish = (error, value) => { signal?.removeEventListener('abort', abort); error ? reject(error) : resolve(value); };
      xhr.upload.onprogress = event => progress(Math.min(blob.size, event.loaded));
      xhr.onload = () => {
        let body; try { body = JSON.parse(xhr.responseText); } catch {}
        if (xhr.status >= 200 && xhr.status < 300 && body?.success) finish(null, body);
        else finish(Error(body?.error || `Upload failed (${xhr.status}). Your file is retained. Retry to resume.`));
      };
      xhr.onerror = () => finish(Error('Network error. Your selected file is retained. Retry to resume.'));
      xhr.ontimeout = () => finish(Error('Upload timed out. Retry resumes the confirmed parts.'));
      xhr.onabort = () => finish(new DOMException('Upload interrupted. Retry resumes the confirmed parts.', 'AbortError'));
      if (signal?.aborted) return finish(new DOMException('Upload interrupted. Retry to resume.', 'AbortError'));
      signal?.addEventListener('abort', abort, { once: true }); xhr.send(blob);
    });
  }
  async function upload(file, { api, base, getKey, signal, onProgress = () => {} }) {
    if (!file || !/\.mp4$/i.test(file.name) || file.size < 32 || file.size > MAX) throw Error('Select an MP4 video from 32 bytes to 2 GiB.');
    let sent = 0, stored = 0;
    const emit = (state, current = 0, message = '') => onProgress(Math.floor((stored + current) / file.size * 100), message, { state, transferred: sent + current, stored: stored + current, total: file.size });
    emit('Selected', 0, 'Selected. Checking file identity; no bytes sent yet.');
    const hashes = [];
    for (let at = 0; at < file.size; at += PART) {
      if (signal?.aborted) throw new DOMException('Upload interrupted. Retry to resume.', 'AbortError');
      hashes.push(await digest(await file.slice(at, at + PART).arrayBuffer()));
    }
    const start = await api('/admin/video-library/uploads', { method: 'POST', body: JSON.stringify({ filename: file.name, bytes: file.size, hashes }), signal });
    if (start.duplicate) { emit('Verifying', 0, 'Existing stored copy found. Verifying playback; no duplicate uploaded.'); return start.asset; }
    const status = await api(`/admin/video-library/${start.id}/status`, { signal });
    const old = new Map(status.parts.map(p => [p.number, p]));
    for (let index = 0; index < hashes.length; index++) {
      const chunk = file.slice(index * PART, Math.min(file.size, (index + 1) * PART));
      if (old.has(index + 1)) {
        if (old.get(index + 1).sha256 !== hashes[index]) throw Error('Reselected file differs from the saved upload. Select the original MP4.');
        stored += chunk.size; emit('Uploading', 0, 'Resuming confirmed stored bytes.'); continue;
      }
      if (signal?.aborted) throw new DOMException('Upload interrupted. Retry to resume.', 'AbortError');
      emit('Uploading');
      const result = await send({ url: base + `/admin/video-library/${start.id}/parts/${index + 1}`, key: getKey(), blob: chunk, signal, progress: loaded => emit('Uploading', loaded) });
      if (result.sha256 !== hashes[index]) throw Error('Part integrity check failed. Retry with the same file.');
      stored += chunk.size; sent += chunk.size; emit('Uploading');
    }
    emit('Verifying', 0, 'All bytes transferred. Verifying storage and MP4 metadata.');
    return (await api(`/admin/video-library/${start.id}/complete`, { method: 'POST', body: '{}', signal })).asset;
  }
  window.BossVideoTransport = { upload };
})();

'use strict';
window.BossVideoControls = function ({ api, upload, library }) {
  const mounts = new Map(), saves = new Set();
  const configs = {
    dmUrl: ['dmSave', 'dmPub', '/videos'], bbUrl: ['bbSave', 'bbPub', '/videos'], tvUrl: ['tvSave', 'tvPub', '/videos'],
    sessionUrl: ['sessionSave', 'sessionPub', '/decision-maker-sessions'], artistVideoUrl: ['artistVideoSave', 'artistVideoPub', '/artist-music-videos'],
    locationEpisode: ['locationSave', 'locationPub', '/boss-bite-locations'], homeFeatureMediaUrl: ['homeFeatureSave', 'homeFeaturePublished', '/home-features'],
    promoMediaUrl: ['promoSave', 'promoPublished', '/promo-ads'], cPreviewVideo: ['saveCourse', 'cPublished', '/dm-courses'], dVideoUrl: ['saveDay', 'dPublished', '/dm-days'],
    goListVideoUrl: ['save', 'goListVideoPublished', '/go-list/entries'],
  };
  const managed = value => /^https:\/\/boss-code-go-api\.dezthareason4ever\.workers\.dev\/media\/videos\/([a-f0-9-]{36})\.mp4$/.exec(value || '')?.[1];
  const format = n => `${n.toLocaleString()} bytes`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function mount(target, options = {}) {
    const input = typeof target === 'string' ? document.querySelector(target) : target;
    if (!input || mounts.has(input.id)) return;
    const config = configs[input.id] || [], save = document.getElementById(config[0]), published = document.getElementById(config[1]);
    const extraSaves = input.id === 'dVideoUrl' ? [document.getElementById('saveDayBottom')].filter(Boolean) : [];
    const legacy = ({ homeFeatureMediaUrl: ['homeFeatureMediaFile', 'homeFeatureMediaUpload'], promoMediaUrl: ['promoMediaFile', 'promoMediaUpload'], goListVideoUrl: ['video-file'] }[input.id] || []).map(id => document.getElementById(id)).filter(Boolean);
    const box = document.createElement('fieldset'); box.className = 'boss-video-input'; box.dataset.videoFor = input.id;
    box.innerHTML = '<legend>Video source</legend><label>Select MP4 video from computer<input type="file" accept="video/mp4,.mp4" aria-label="Select MP4 video from computer"></label><div class="video-upload-actions"><button type="button" data-start>Choose MP4 / Upload</button><button type="button" data-library>Existing Video Library</button><button type="button" data-link>YouTube Link</button><button type="button" data-pause hidden>Pause upload</button><button type="button" data-retry hidden>Retry upload</button></div><strong data-state role="status" aria-live="polite">Select an MP4 or use a video link.</strong><progress max="100" value="0" aria-label="Video upload progress" hidden></progress><p data-bytes></p><p data-error role="alert"></p><div data-preview hidden><h3>Verified private preview</h3><video controls playsinline preload="auto"></video><button type="button" data-approve disabled>Approve preview for publication</button></div><small>Selecting an MP4 starts uploading. Keep this page open. Saving is blocked until verification finishes. A new upload stays a draft until you approve its preview and switch Published on.</small>';
    input.after(box);
    const file = box.querySelector('input[type=file]'), start = box.querySelector('[data-start]'), choose = box.querySelector('[data-library]'), retry = box.querySelector('[data-retry]'), pause = box.querySelector('[data-pause]'), state = box.querySelector('[data-state]'), progress = box.querySelector('progress'), byteText = box.querySelector('[data-bytes]'), error = box.querySelector('[data-error]'), panel = box.querySelector('[data-preview]'), video = panel.querySelector('video'), approve = box.querySelector('[data-approve]');
    const context = { input, box, save, extraSaves, published, config, pending: false, busy: false, approved: false, asset: null, lastFile: null, state: 'Idle', controller: null };
    mounts.set(input.id, context);
    const status = (name, message = '') => { context.state = name; state.textContent = name + (message ? ' — ' + message : ''); box.dataset.uploadState = name; };
    const draft = () => { if (published) { if (published.type === 'checkbox') published.checked = false; else published.value = '0'; published.disabled = true; } context.approved = false; approve.disabled = true; };
    const busy = value => { context.busy = value; start.disabled = choose.disabled = file.disabled = input.disabled = value; legacy.forEach(el => { el.disabled = value; }); pause.hidden = !value; [save, ...extraSaves].filter(Boolean).forEach(el => { el.disabled = value || context.pending; }); };
    function failed(e) {
      context.pending = true; status('Upload Failed', e.name === 'AbortError' ? 'Interrupted. Retry resumes confirmed parts.' : e.message);
      error.textContent = e.message; retry.hidden = false; draft();
    }
    async function verify(asset) {
      context.asset = asset; status('Verifying', 'Checking stored bytes, metadata, and authorized playback.');
      const signed = await api(`/admin/video-library/${asset.id}/preview`, { method: 'POST', body: '{}' });
      panel.hidden = false; video.pause(); video.removeAttribute('src'); video.load();
      await new Promise((resolve, reject) => {
        const cleanup = () => { clearTimeout(timer); video.removeEventListener('loadeddata', loaded); video.removeEventListener('error', broken); };
        const loaded = () => { if (video.videoWidth !== asset.width || video.videoHeight !== asset.height || !Number.isFinite(video.duration) || Math.abs(video.duration - asset.duration) > .2) return broken(); cleanup(); resolve(); };
        const broken = () => { cleanup(); reject(Error('Stored video could not decode in this browser. Retry verification or export H.264 video with AAC audio.')); };
        const timer = setTimeout(() => { cleanup(); reject(Error('Preview timed out. Your uploaded file is preserved. Retry verification.')); }, 45000);
        video.addEventListener('loadeddata', loaded); video.addEventListener('error', broken); video.src = signed.url; video.load();
      });
      input.value = asset.url; input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }));
      options.onSelect?.(asset); context.pending = false; status('Ready to Preview', 'Stored video decoded successfully. Play it, then approve publication.'); error.textContent = ''; approve.disabled = false; retry.hidden = true;
      [save, ...extraSaves].filter(Boolean).forEach(el => { el.disabled = false; });
      return asset;
    }
    async function run(selected) {
      if (context.busy) throw Error('This video upload is already in progress. Wait or pause it before retrying.');
      if (selected) context.lastFile = selected;
      if (!context.lastFile) { file.click(); return; }
      context.pending = true; context.asset = null; input.value = ''; draft(); panel.hidden = true; retry.hidden = true; error.textContent = '';
      context.controller = new AbortController(); busy(true); progress.hidden = false; progress.value = 0;
      status('Selected', context.lastFile.name);
      try {
        const asset = await upload(context.lastFile, { signal: context.controller.signal, onProgress(percent, message, detail) {
          status(detail?.state || 'Uploading', message || context.lastFile.name); progress.value = percent;
          if (detail) byteText.textContent = `${Math.floor(detail.stored / detail.total * 100)}% stored/transferred (${format(detail.stored)} of ${format(detail.total)}); ${format(detail.transferred)} sent this attempt.`;
        } });
        return await verify(asset);
      } catch (e) { failed(e); throw e; }
      finally { busy(false); }
    }
    async function existing(asset) {
      if (context.busy) throw Error('This video is already being verified.');
      context.pending = true; draft(); busy(true); error.textContent = '';
      try { return await verify(asset); } catch (e) { failed(e); throw e; } finally { busy(false); }
    }
    context.selectFile = run; context.selectAsset = existing;
    file.addEventListener('change', () => { if (file.files[0]) run(file.files[0]).catch(() => {}); });
    for (const el of legacy.filter(el => el.type === 'file')) el.addEventListener('change', () => { const selected = el.files[0]; if (selected && (/\.mp4$/i.test(selected.name) || selected.type.startsWith('video/'))) run(selected).catch(() => {}); });
    start.onclick = () => { if (context.lastFile && context.state === 'Upload Failed') run().catch(() => {}); else file.click(); };
    retry.onclick = () => (context.lastFile ? run() : context.asset ? existing(context.asset) : Promise.reject(Error('Select the original MP4 to retry.'))).catch(e => { error.textContent = e.message; });
    pause.onclick = () => context.controller?.abort();
    choose.onclick = () => library(asset => existing(asset));
    box.querySelector('[data-link]').onclick = () => { input.focus(); state.textContent = 'Paste a YouTube link in the video field.'; };
    approve.onclick = async () => {
      approve.disabled = true;
      try {
        await api(`/admin/video-library/${context.asset.id}/approve`, { method: 'POST', body: JSON.stringify({ confirmed: true, width: video.videoWidth, height: video.videoHeight, duration: video.duration }) });
        context.approved = true; if (published) published.disabled = false;
        status('Ready to Preview', 'Preview approved. Switch Published on and save when you want this video in the app.');
      } catch (e) { error.textContent = e.message; approve.disabled = false; }
    };
    return context;
  }
  document.addEventListener('click', event => {
    const button = event.target.closest?.('button');
    for (const context of mounts.values()) if (button === context.save || context.extraSaves.includes(button)) {
      if (context.busy || context.pending) { event.preventDefault(); event.stopImmediatePropagation(); context.box.querySelector('[data-error]').textContent = 'Finish or retry the selected upload before saving. Your title and selected file are retained.'; return; }
      const id = managed(context.input.value);
      if (id && (context.published?.checked || context.published?.value === '1') && !context.approved) {
        event.preventDefault(); event.stopImmediatePropagation();
        api('/admin/video-library').then(result => {
          const asset = result.data.find(a => a.id === id); if (!asset) throw Error('Find this video in the Video Library and select it again.');
          return context.selectAsset(asset);
        }).catch(e => { context.box.querySelector('[data-error]').textContent = e.message; });
      }
    }
  }, true);
  async function withSaveLock(path, options, perform) {
    if (!['POST', 'PUT', 'PATCH'].includes(String(options.method || 'GET').toUpperCase())) return perform();
    const normalized = path.replace(/^\/admin(?=\/)/, '');
    const route = normalized.startsWith('/go-list/entries') ? '/go-list/entries' : '/' + normalized.split('/').filter(Boolean)[0];
    const related = [...mounts.values()].filter(c => c.config[2] === route);
    if (related.some(c => c.busy || c.pending)) throw Error('Wait for the selected video to finish verification, or retry the failed upload.');
    if (saves.has(route)) throw Error('This save is already in progress.');
    saves.add(route); related.forEach(c => [c.save, ...c.extraSaves].filter(Boolean).forEach(el => { el.disabled = true; }));
    try { return await perform(); } finally { saves.delete(route); related.forEach(c => [c.save, ...c.extraSaves].filter(Boolean).forEach(el => { el.disabled = c.busy || c.pending; })); }
  }
  const statusText = item => ({ ready: 'Ready — verified stored video', uploading: 'Uploading — not public', unavailable: 'Unavailable — upload or select a video', linked: 'Linked video', none: 'No video attached' }[item.upload_status] || ((item.youtube_url || item.video_url) ? 'Linked video' : 'Unavailable — no video attached'));
  function thumbnail(item) { return `<div class="thumb video-state-thumb" role="status">${esc(statusText(item))}</div>`; }
  const publicationLabel = item => ['unavailable', 'uploading'].includes(item.upload_status) ? 'UNAVAILABLE — HIDDEN FROM APP' : Number(item.published) === 1 ? 'PUBLISHED' : 'DRAFT';
  const style = document.createElement('style');
  style.textContent = '.boss-video-input [data-state]{display:block;margin:14px 0;font-size:17px}.boss-video-input progress:not([hidden]){display:block!important;width:100%;height:24px;accent-color:#e4bb42}.boss-video-input [hidden]{display:none!important}.boss-video-input [data-error]{color:#ffb6a9;white-space:pre-wrap}.boss-video-input video{display:block;width:100%;max-width:720px;max-height:420px;background:#171717}.boss-video-input button:disabled{opacity:.5;cursor:wait}.video-state-thumb{display:flex!important;align-items:center;justify-content:center;padding:12px;background:#29241b!important;color:#ffe4a4!important;text-align:center;min-height:100px;box-sizing:border-box}.boss-video-input [data-bytes]{font-variant-numeric:tabular-nums;overflow-wrap:anywhere}';
  document.head.append(style);
  return { mount, withSaveLock, statusText, thumbnail, publicationLabel, selectFile(target, file) { const input = typeof target === 'string' ? document.querySelector(target.startsWith('#') ? target : '#' + target) : target; const context = mount(input) || mounts.get(input.id); return context.selectFile(file); } };
};

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
 async function uploadFile(file,options={}) { return window.BossVideoTransport.upload(file,{...options,api,base,getKey}); }
 async function upload(file,options){activeUploads++;try{return await uploadFile(file,options);}finally{activeUploads--;}}
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
     if(onSelect)action('Use this video',async()=>{await onSelect(asset);dialog.close();});
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
 const controls=window.BossVideoControls({api,upload,library});
 const mount=controls.mount;
 const style=document.createElement('style');style.textContent='.boss-video-input{border:1px solid #555;padding:12px;margin:10px 0;min-width:0}.boss-video-input button,.boss-video-library button{margin:4px;padding:10px;background:#252525;color:#fff;border:1px solid #777;border-radius:5px;cursor:pointer}.boss-video-input input{display:block;max-width:100%;margin:8px 0}.boss-video-input progress{width:100%}.boss-video-input small{display:block;line-height:1.5}.boss-video-library{background:#111;color:#fff;border:1px solid #c6a04d;max-width:760px;width:90vw;max-height:85vh;overflow:auto}.boss-video-library::backdrop{background:#000b}.boss-video-library article{padding:12px;border-bottom:1px solid #555;overflow-wrap:anywhere}.boss-video-library video{max-height:360px}';document.head.append(style);
 window.BossVideoLibrary={...controls,configure(options){getKey=options.getKey;base=options.api||API;},upload,mount,open:library,api};
})();
