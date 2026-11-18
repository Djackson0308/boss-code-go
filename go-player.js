/* HTTPS player document supplies the browser's genuine HTTP Referer.
 * No account data, storage, analytics, cookies or arbitrary URLs are added here.
 * YouTube operates the privacy-enhanced player under its own privacy terms. */
(()=>{'use strict';
 const params=new URLSearchParams(location.search),id=params.get('video');
 if(!/^[\w-]{11}$/.test(id||'')){document.getElementById('player').textContent='Video is unavailable.';return;}
 const allowedParents=new Set(['capacitor://djackson0308.github.io','https://djackson0308.github.io']);
 let player,ready=false,lastError=null;
 const state=()=>({type:'go-player-state',video:id,ready,error:lastError,time:ready?player.getCurrentTime():0,state:ready?player.getPlayerState():-1});
 // Playback state contains no visitor/account information. Native custom schemes
 // do not consistently support a targetOrigin, so the receiver verifies source.
 const notify=()=>{if(parent!==window)parent.postMessage(state(),'*');};
 addEventListener('message',event=>{
  if(event.source!==parent||!allowedParents.has(event.origin))return;
  let data=event.data;try{if(typeof data==='string')data=JSON.parse(data);}catch{return;}
  if(!data||typeof data!=='object')return;
  // Preserve GO's existing pause-on-navigation command.
  if(data.event==='command'&&data.func==='pauseVideo'){if(ready)player.pauseVideo();return;}
  if(data.type!=='go-player-command')return;
  if(ready){if(data.command==='play')player.playVideo();if(data.command==='pause')player.pauseVideo();if(data.command==='mute')player.mute();}
  notify();
 });
 window.onYouTubeIframeAPIReady=()=>{
  player=new YT.Player('player',{host:'https://www.youtube-nocookie.com',videoId:id,width:'100%',height:'100%',playerVars:{rel:0,playsinline:1,controls:1,enablejsapi:1,origin:location.origin,widget_referrer:'https://com.bosscodemedia.go',autoplay:params.get('autoplay')==='1'?1:0},events:{onReady:()=>{ready=true;notify();},onStateChange:notify,onError:event=>{lastError=event.data;notify();}}});
 };
 const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';document.head.append(script);
})();
