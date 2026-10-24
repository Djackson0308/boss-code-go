(function(){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function youtube(value){
  const text=String(value||'').trim();if(/^[\w-]{11}$/.test(text))return text;
  try{const u=new URL(text),h=u.hostname.replace(/^www\./,'');let id='';if(h==='youtu.be')id=u.pathname.split('/')[1];else if(['youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com'].includes(h))id=u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];return /^[\w-]{11}$/.test(id||'')?id:null;}catch{return null;}
 }
 function direct(value){try{const u=new URL(String(value||''),location.href);return ['https:','http:'].includes(u.protocol)&&(/\.(mp4|webm|m4v)(?:$)/i.test(u.pathname)||u.pathname==='/dm-course-media')?u.href:null;}catch{return null;}}
 function source(value){return youtube(value)||direct(value);}
 function html(value,options={}){
  const id=youtube(value),title=esc(options.title||'Video');
  if(id)return `<iframe data-boss-video src="https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&enablejsapi=1${options.autoplay?'&autoplay=1':''}" title="${title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="width:100%;height:100%;border:0;aspect-ratio:16/9"></iframe>`;
  const url=direct(value);if(!url)return '<p>Video is unavailable.</p>';
  return `<video controls playsinline preload="metadata" ${options.autoplay?'autoplay':''} ${options.poster?`poster="${esc(options.poster)}"`:''} aria-label="${title}" src="${esc(url)}" style="width:100%;height:100%;aspect-ratio:16/9;object-fit:contain;background:#000"></video>`;
 }
 function stop(host){if(!host)return;host.querySelectorAll('video').forEach(v=>{v.pause();v.removeAttribute('src');v.load();});host.querySelectorAll('iframe').forEach(f=>f.src='');host.replaceChildren();}
 function render(host,value,options){stop(host);host.innerHTML=html(value,options);}
 function thumbnail(value){const id=youtube(value);return id?`https://img.youtube.com/vi/${id}/hqdefault.jpg`:'images/boss-code-go-logo.png';}
 window.BossVideo={youtube,direct,source,html,render,stop,thumbnail};
 document.addEventListener('error',event=>{if(event.target instanceof HTMLVideoElement){const v=event.target;if(v.nextElementSibling?.dataset.videoError)return;const p=document.createElement('p');p.dataset.videoError='true';p.setAttribute('role','status');p.textContent='Video could not load. Check your connection and access, then reopen it. MP4 should use H.264 video and AAC audio.';v.after(p);}},true);
})();
