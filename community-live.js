(() => {
  'use strict';
  const endpoint='wss://boss-code-go-api.dezthareason4ever.workers.dev/go/community/events';
  const activities=new Set(), submissions=new Set();
  let socket=null,retry=null,attempt=0,nativeActive=true;
  const visible=()=>document.visibilityState!=='hidden'&&nativeActive&&navigator.onLine!==false&&(
    document.querySelector('#decision-makers-screen.active-screen')||
    document.querySelector('#go-challenge-overlay.open #go-tab-community.active'));
  function prune() {
    document.querySelectorAll('[data-community-activity]').forEach(card=>{
      if(activities.has(Number(card.dataset.communityActivity))||submissions.has(Number(card.dataset.communitySubmission)))card.remove();
    });
    const preview=document.querySelector('#dm-community-preview');
    if(preview?.querySelector('#dm-feed-scroll')&&!preview.querySelector('[data-community-activity]')) {
      preview.innerHTML='<div class="go-empty">COMMUNITY ACTIVITY WILL APPEAR HERE AS POSTS ARE APPROVED.</div>';
    }
  }
  function stop() {
    clearTimeout(retry);retry=null;
    const previous=socket;socket=null;
    if(previous){previous.onclose=null;previous.close();}
  }
  function connect() {
    if(!visible()){stop();return;}
    if(socket||retry||typeof WebSocket==='undefined')return;
    const current=new WebSocket(endpoint);socket=current;
    current.onopen=()=>{attempt=0;};
    current.onmessage=event=>{
      if(current!==socket)return;
      let data;try{data=JSON.parse(event.data);}catch{return;}
      if(!['snapshot','deleted'].includes(data.type)||!Array.isArray(data.deleted))return;
      for(const row of data.deleted){
        if(Number.isSafeInteger(row.activity_id)&&row.activity_id>0)activities.add(row.activity_id);
        if(Number.isSafeInteger(row.submission_id)&&row.submission_id>0)submissions.add(row.submission_id);
      }
      prune();
    };
    current.onclose=()=>{
      if(current!==socket)return;
      socket=null;
      if(visible())retry=setTimeout(()=>{retry=null;connect();},Math.min(60000,1000*2**Math.min(attempt++,6))*(0.8+Math.random()*0.4));
    };
    current.onerror=()=>{try{current.close();}catch{}};
  }
  function changed(){prune();connect();}
  function start(){
    // Observe feed renders as well as navigation. This also removes a deleted card
    // if a request started before deletion completes after the push message.
    new MutationObserver(changed).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    document.addEventListener('visibilitychange',changed);
    window.addEventListener('online',changed);window.addEventListener('offline',changed);
    window.addEventListener('pagehide',stop);window.addEventListener('pageshow',changed);
    window.addEventListener('go-community-app-state',event=>{nativeActive=event.detail.active;changed();});
    changed();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
