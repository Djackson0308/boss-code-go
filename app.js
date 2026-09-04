const API='https://boss-code-go-api.dezthareason4ever.workers.dev';

const $=id=>document.getElementById(id);
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>[...r.querySelectorAll(s)];
const on=(id,ev,fn)=>{const e=$(id);if(e)e.addEventListener(ev,fn)};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({
'&':'&amp;',
'<':'&lt;',
'>':'&gt;',
'"':'&quot;',
"'":'&#39;'
}[c]));


/* =========================================================
   B.O.S.S CODE GO SHARED UI UPGRADES
========================================================= */
(function injectBossCodeGoStyles(){
if(document.getElementById('boss-code-go-runtime-styles'))return;
const style=document.createElement('style');
style.id='boss-code-go-runtime-styles';
style.textContent=`
html{scrollbar-color:#F5C518 #111;scrollbar-width:thin}
*{scrollbar-color:#F5C518 #111;scrollbar-width:thin}
*::-webkit-scrollbar{width:10px;height:10px}
*::-webkit-scrollbar-track{background:#111}
*::-webkit-scrollbar-thumb{background:#F5C518;border-radius:999px;border:2px solid #111}
.boss-return-home-bottom{display:block;width:min(420px,88%);margin:42px auto 22px;border:2px solid #d40000;border-radius:999px;background:#090909;color:#fff;padding:14px 20px;font:inherit;font-weight:900;letter-spacing:.08em;cursor:pointer}
.boss-return-home-bottom:hover{background:#d40000}
.music-track{grid-template-columns:58px 54px minmax(0,1fr) auto 45px!important}
.track-cover{width:54px;height:54px;border-radius:10px;overflow:hidden;background:#111;border:1px solid #2a2a2a}
.track-cover img{width:100%;height:100%;object-fit:cover;display:block}
.artist-media-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.artist-media-card{border:1px solid #282828;border-radius:16px;background:#090909;overflow:hidden;color:#fff;padding:0;text-align:left;cursor:pointer}
.artist-media-card img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}
.artist-media-card.video img{aspect-ratio:16/9}
.artist-media-card-body{padding:12px}
.artist-media-card-body strong{display:block}
.artist-media-card-body span{display:block;color:#F5C518;font-size:9px;font-weight:900;margin-top:4px}
.artist-media-empty{padding:20px;border:1px dashed #333;border-radius:14px;color:#777;text-align:center}
.artist-media-lightbox{position:fixed;inset:0;z-index:20000;background:rgba(0,0,0,.96);display:none;align-items:center;justify-content:center;padding:24px}
.artist-media-lightbox.open{display:flex}
.artist-media-lightbox img{max-width:92vw;max-height:86vh;object-fit:contain}
.artist-media-lightbox button,.resource-viewer-close{position:absolute;top:20px;right:22px;width:48px;height:48px;border-radius:50%;border:2px solid #d40000;background:#000;color:#fff;font-size:24px;cursor:pointer}
.resource-viewer{position:fixed;inset:0;z-index:21000;background:#000;display:none;padding:72px 16px 16px}
.resource-viewer.open{display:block}
.resource-viewer iframe{width:100%;height:100%;border:1px solid #333;border-radius:14px;background:#fff}
.dm-resource-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.dm-resource-card{background:#0b0b0b;border:1px solid #292929;border-radius:18px;overflow:hidden}
.dm-resource-card img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block}
.dm-resource-body{padding:16px}
.dm-resource-body span{color:#F5C518;font-size:9px;font-weight:900}
.dm-resource-body p{color:#999;line-height:1.5;margin:8px 0 14px}
.dm-resource-button{border:2px solid #F5C518;border-radius:999px;background:transparent;color:#F5C518;padding:10px 14px;font-weight:900;cursor:pointer}
.dm-session-media{width:150px;flex:0 0 150px;background:#000;position:relative}
.dm-session-media img{width:100%;height:100%;min-height:150px;object-fit:cover;display:block}
.dm-session-media iframe{width:100%;height:100%;min-height:150px;border:0;display:block}
.dm-session-play{position:absolute;inset:0;border:0;background:rgba(0,0,0,.25);color:#fff;font-size:34px;cursor:pointer}
.action-card-thumb{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin-bottom:14px}
@media(max-width:750px){.music-track{grid-template-columns:34px 46px minmax(0,1fr) 36px!important}.track-cover{width:46px;height:46px}.artist-media-grid,.dm-resource-grid{display:flex;overflow-x:auto}.artist-media-card,.dm-resource-card{flex:0 0 76%}.dm-session-media{width:110px;flex-basis:110px}}
`;
document.head.appendChild(style);
})();


/* =========================================================
   SCREEN NAVIGATION
========================================================= */

function showScreen(s){
if(!s)return;

qa('.screen').forEach(x=>
x.classList.remove('active-screen')
);

s.classList.add('active-screen');

window.scrollTo({
top:0,
behavior:'smooth'
});

if(
s.id==='boss-bite-screen'&&
bossBiteMap
){
setTimeout(
()=>bossBiteMap.resize(),
250
);
}

if(
s.id==='boss-code-tv-screen'
){
renderLive();
}
}


const home=$('home-screen');
const bite=$('boss-bite-screen');
const tv=$('boss-code-tv-screen');
const dm=$('decision-makers-screen');
const check=$('boss-checkin-screen');
const music=$('music-screen');


function ensureReturnHomeButtons(){
const defs=[
['boss-bite-screen','boss-bite-back'],
['boss-code-tv-screen','boss-code-tv-back'],
['decision-makers-screen','decision-makers-back'],
['boss-checkin-screen','boss-checkin-back'],
['music-screen','music-back'],
['contact-screen','contact-back']
];

defs.forEach(([screenId,topId])=>{
const screen=$(screenId);
if(!screen)return;
const top=$(topId);
if(top)top.textContent='RETURN TO HOME';
if(screen.querySelector('.boss-return-home-bottom'))return;
const b=document.createElement('button');
b.type='button';
b.className='boss-return-home-bottom';
b.textContent='RETURN TO HOME';
b.addEventListener('click',()=>{
if(screenId==='decision-makers-screen')stopDM();
if(screenId==='music-screen'&&audio&&!audio.paused)audio.pause();
showScreen(home);
});
const footer=screen.querySelector('.boss-footer');
if(footer)footer.insertAdjacentElement('beforebegin',b);
else screen.appendChild(b);
});
}


/* =========================================================
   CONTACT SCREEN
========================================================= */

function ensureContactScreen(){

let screen=$('contact-screen');

if(screen)
return screen;


if(!$('boss-code-contact-styles')){

const style=
document.createElement('style');

style.id=
'boss-code-contact-styles';

style.textContent=`

#contact-screen{
background:#000;
color:#fff;
min-height:100vh;
}

#contact-screen .contact-wrap{
width:min(920px,calc(100% - 32px));
margin:0 auto;
padding:24px 0 56px;
}

#contact-screen .contact-back{
appearance:none;
border:1px solid #333;
background:#090909;
color:#fff;
font:inherit;
font-weight:800;
letter-spacing:.06em;
padding:12px 18px;
border-radius:999px;
cursor:pointer;
margin-bottom:28px;
}

#contact-screen .contact-back:hover{
border-color:#f5c518;
color:#f5c518;
}

#contact-screen .contact-hero{
text-align:center;
margin:0 auto 24px;
}

#contact-screen .contact-logo{
width:min(230px,60vw);
height:auto;
margin:0 auto 18px;
display:block;
}

#contact-screen .contact-kicker{
color:#f5c518;
font-size:12px;
font-weight:900;
letter-spacing:.18em;
}

#contact-screen .contact-hero h1{
margin:8px 0 10px;
font-size:clamp(30px,6vw,54px);
line-height:1;
letter-spacing:.02em;
}

#contact-screen .contact-hero p{
margin:0 auto;
max-width:660px;
color:#bbb;
line-height:1.6;
}

#contact-screen .contact-card{
background:linear-gradient(180deg,#0d0d0d,#050505);
border:2px solid #d72f22;
border-radius:28px;
padding:clamp(20px,4vw,34px);
box-shadow:0 0 0 1px rgba(245,197,24,.15) inset;
}

#contact-screen .contact-field{
margin-bottom:18px;
}

#contact-screen .contact-field label{
display:block;
margin-bottom:8px;
font-size:12px;
font-weight:900;
letter-spacing:.08em;
color:#f5c518;
}

#contact-screen .contact-field input,
#contact-screen .contact-field select,
#contact-screen .contact-field textarea{
width:100%;
box-sizing:border-box;
border:1px solid #343434;
background:#000;
color:#fff;
font:inherit;
border-radius:14px;
padding:14px 15px;
outline:none;
}

#contact-screen .contact-field textarea{
resize:vertical;
min-height:150px;
}

#contact-screen .contact-field input:focus,
#contact-screen .contact-field select:focus,
#contact-screen .contact-field textarea:focus{
border-color:#f5c518;
box-shadow:0 0 0 2px rgba(245,197,24,.12);
}

#contact-screen .contact-submit{
width:100%;
border:0;
border-radius:999px;
background:#d72f22;
color:#fff;
font:inherit;
font-weight:900;
letter-spacing:.08em;
padding:16px 20px;
cursor:pointer;
}

#contact-screen .contact-submit:hover{
filter:brightness(1.08);
}

#contact-screen .contact-submit:disabled{
opacity:.55;
cursor:wait;
}

#contact-screen .contact-status{
min-height:24px;
margin-top:14px;
text-align:center;
font-weight:800;
}

#contact-screen .contact-status.success{
color:#f5c518;
}

#contact-screen .contact-status.error{
color:#ff6666;
}

#contact-screen .contact-footer{
text-align:center;
margin-top:26px;
color:#f5c518;
font-size:12px;
font-weight:900;
letter-spacing:.14em;
}

@media (max-width:640px){

#contact-screen .contact-wrap{
width:min(100% - 22px,920px);
padding-top:16px;
}

#contact-screen .contact-card{
border-radius:22px;
}

}

`;

document.head.appendChild(style);

}


screen=
document.createElement('div');

screen.id=
'contact-screen';

screen.className=
'screen';

screen.innerHTML=`

<div class="contact-wrap">

<button
id="contact-back"
class="contact-back"
type="button"
>
← HOME
</button>

<header class="contact-hero">

<img
class="contact-logo"
src="images/boss-code-media-logo.png"
alt="B.O.S.S CODE MEDIA"
>

<span class="contact-kicker">
CONNECT WITH THE CODE
</span>

<h1>
CONTACT B.O.S.S CODE MEDIA
</h1>

<p>
Advertising, partnerships, media inquiries and opportunities. Send us a message below.
</p>

</header>


<section class="contact-card">

<div class="contact-field">

<label for="contact-name">
NAME
</label>

<input
id="contact-name"
type="text"
autocomplete="name"
placeholder="Your name"
>

</div>


<div class="contact-field">

<label for="contact-email">
EMAIL
</label>

<input
id="contact-email"
type="email"
autocomplete="email"
placeholder="Your email address"
>

</div>


<div class="contact-field">

<label for="contact-type">
WHAT ARE YOU REACHING OUT ABOUT?
</label>

<select id="contact-type">

<option value="General Inquiry">
General Inquiry
</option>

<option value="Advertising">
Advertising
</option>

<option value="Boss Bite">
Boss Bite
</option>

<option value="Magazine">
Magazine
</option>

<option value="Decision Makers">
Decision Makers
</option>

<option value="B.O.S.S CODE TV">
B.O.S.S CODE TV
</option>

<option value="Partnership/Business">
Partnership / Business
</option>

<option value="Other">
Other
</option>

</select>

</div>


<div class="contact-field">

<label for="contact-message">
MESSAGE
</label>

<textarea
id="contact-message"
rows="7"
placeholder="Tell us how we can help."
></textarea>

</div>


<button
id="contact-submit"
class="contact-submit"
type="button"
>
SEND MESSAGE
</button>

<div
id="contact-status"
class="contact-status"
aria-live="polite"
></div>

</section>


<div class="contact-footer">
GREATNESS IS A DECISION
</div>

</div>

`;

document.body.appendChild(screen);

return screen;

}


const contact=
ensureContactScreen();

ensureReturnHomeButtons();


/* =========================================================
   NAVIGATION EVENTS
========================================================= */

on(
'boss-bite-button',
'click',
()=>{
showScreen(bite);
initMap();
}
);

on(
'boss-bite-back',
'click',
()=>showScreen(home)
);


on(
'boss-code-tv-button',
'click',
()=>showScreen(tv)
);

on(
'boss-code-tv-back',
'click',
()=>{
buildTv();
showScreen(home);
}
);


on(
'decision-makers-button',
'click',
()=>showScreen(dm)
);

on(
'decision-makers-back',
'click',
()=>{
stopDM();
showScreen(home);
}
);


on(
'boss-checkin-button',
'click',
()=>{
showScreen(check);
showCheckIntro();
}
);

on(
'boss-checkin-back',
'click',
()=>showScreen(home)
);


on(
'music-button',
'click',
()=>{
showScreen(music);
renderArtists();
}
);

on(
'music-back',
'click',
()=>{

if(
audio&&
!audio.paused
)
audio.pause();

showScreen(home);

}
);


on(
'contact-button',
'click',
()=>showScreen(contact)
);

on(
'contact-back',
'click',
()=>showScreen(home)
);


on(
'go-to-decision-makers',
'click',
()=>showScreen(dm)
);


/* =========================================================
   CONTACT SUBMISSION
========================================================= */

on(
'contact-submit',
'click',
async()=>{

const name=
$('contact-name')
?.value
.trim()||
'';

const email=
$('contact-email')
?.value
.trim()||
'';

const inquiryType=
$('contact-type')
?.value||
'General Inquiry';

const message=
$('contact-message')
?.value
.trim()||
'';

const status=
$('contact-status');

const button=
$('contact-submit');


if(status){

status.className=
'contact-status';

status.textContent='';

}


if(
!name||
!email||
!message
){

if(status){

status.className=
'contact-status error';

status.textContent=
'Please complete your name, email and message.';

}

return;

}


if(
!/^\S+@\S+\.\S+$/.test(email)
){

if(status){

status.className=
'contact-status error';

status.textContent=
'Please enter a valid email address.';

}

return;

}


if(button){

button.disabled=true;

button.textContent=
'SENDING...';

}


try{

const r=
await fetch(
API+
'/contact-inquiries',
{

method:
'POST',

headers:{

'Content-Type':
'application/json',

Accept:
'application/json'

},

body:
JSON.stringify({

name,

email,

inquiry_type:
inquiryType,

message

})

}
);


let data={};


try{

data=
await r.json();

}catch{}


if(
!r.ok||
data.success===false
){

throw Error(
data.error||
data.message||
'Unable to send message.'
);

}


if($('contact-name'))
$('contact-name').value='';

if($('contact-email'))
$('contact-email').value='';

if($('contact-type'))
$('contact-type').value=
'General Inquiry';

if($('contact-message'))
$('contact-message').value='';


if(status){

status.className=
'contact-status success';

status.textContent=
'MESSAGE SENT. B.O.S.S CODE MEDIA RECEIVED YOUR INQUIRY.';

}


}catch(e){

console.warn(
'Contact form error',
e
);


if(status){

status.className=
'contact-status error';

status.textContent=
'Message could not be sent. Please try again.';

}


}finally{


if(button){

button.disabled=false;

button.textContent=
'SEND MESSAGE';

}


}

}
);
/* =========================================================
   DAILY DECISION
   ADMIN / BACKEND ONLY
========================================================= */

let daily=[];

const DK=
'boss-code-daily-decision-v3';

const DAY=
86400000;


function dailyState(){

let s;

try{

s=
JSON.parse(
localStorage.getItem(DK)||
'null'
);

}catch{}


const now=
Date.now();


if(
!s||
!Number.isInteger(s.i)||
!s.t
){

s={

i:0,

t:now,

seen:false

};

}


const c=
Math.floor(
(now-s.t)/
DAY
);


if(c>0){

if(daily.length){

s.i=
(s.i+c)%
daily.length;

}else{

s.i=0;

}

s.t+=
c*DAY;

s.seen=
false;

}


if(
daily.length&&
s.i>=daily.length
){

s.i=0;

}


localStorage.setItem(
DK,
JSON.stringify(s)
);


return s;

}


function renderDaily(){

const title=
$('daily-decision-title');

const move=
$('daily-decision-move-text');

const preview=
$('daily-decision-home-preview');

const number=
$('daily-decision-number');

const confirmation=
$('daily-decision-confirmation');


if(!daily.length){

if(number)
number.textContent=
'TODAY';

if(title)
title.textContent=
'CHECK BACK FOR TODAY’S DECISION';

if(move)
move.textContent=
'New Daily Decisions are controlled from B.O.S.S CODE GO Admin.';

if(preview)
preview.textContent=
'CHECK BACK FOR TODAY’S DECISION';

if(confirmation)
confirmation.textContent='';

return;

}


const s=
dailyState();

const d=
daily[s.i];


if(!d)
return;


if(number){

number.textContent=
'DECISION '+
String(
s.i+1
)
.padStart(
3,
'0'
);

}


if(title){

title.textContent=
d[0]||
'';

}


if(move){

move.textContent=
d[1]||
'';

}


if(preview){

preview.textContent=
d[0]||
'';

}


if(confirmation){

confirmation.textContent=
s.seen
?
'DECISION MADE. NOW MOVE.'
:
'';

}

}


function openDaily(){

if(!daily.length)
return;


const m=
$('daily-decision-modal');


if(!m)
return;


renderDaily();


m.classList.add(
'open'
);


m.setAttribute(
'aria-hidden',
'false'
);


document.body.style.overflow=
'hidden';

}


function closeDaily(
mark=true
){

const m=
$('daily-decision-modal');


if(mark){

const s=
dailyState();

s.seen=
true;


localStorage.setItem(
DK,
JSON.stringify(s)
);

}


if(m){

m.classList.remove(
'open'
);

m.setAttribute(
'aria-hidden',
'true'
);

}


document.body.style.overflow=
'';

}


on(
'daily-decision-close',
'click',
()=>closeDaily()
);


on(
'daily-decision-reopen',
'click',
openDaily
);


on(
'daily-decision-made',
'click',
()=>{

if(!daily.length)
return;


const s=
dailyState();

s.seen=
true;


localStorage.setItem(
DK,
JSON.stringify(s)
);


renderDaily();


setTimeout(
()=>closeDaily(false),
600
);

}
);


window.addEventListener(
'load',
()=>{

renderDaily();


setTimeout(
()=>{

const s=
$('splash-screen');


if(s){

s.classList.add(
'fade-out'
);


setTimeout(
()=>{

s.style.display=
'none';


if(
daily.length&&
!dailyState().seen
)
openDaily();

},
700
);


}else if(
daily.length&&
!dailyState().seen
){

openDaily();

}

},
1500
);

}
);


/* =========================================================
   MUSIC
   BACKEND ONLY
========================================================= */

let artists=[];

let activeArtist=null;

let artistGalleryRows=[];

let artistMusicVideoRows=[];

let trackIndex=-1;

let sourceIndex=0;

let musicQueue=[];

let activeReleaseId=null;

const audio=
$('boss-music-audio');


function musicYoutubeId(url=''){

for(
const r of [

/youtube\.com\/live\/([^?&/]+)/,

/youtube\.com\/watch\?v=([^&]+)/,

/youtu\.be\/([^?&/]+)/,

/youtube\.com\/embed\/([^?&/]+)/,

/youtube\.com\/shorts\/([^?&/]+)/
]
){

const m=
String(url)
.match(r);

if(m)
return m[1];

}

return'';

}


function ensureArtistUI(){

const h=
q(
'#music-screen .music-header'
);


if(!h)
return;


if(
!$('artist-picker-section')
){

const s=
document.createElement(
'section'
);

s.id=
'artist-picker-section';

s.className=
'artist-picker-section';

s.innerHTML=`

<div class="artist-picker-heading">

<span>
B.O.S.S CODE MUSIC
</span>

<h2>
CHOOSE YOUR ARTIST
</h2>

<p>
Pick an artist to explore their music.
</p>

</div>

<div
id="artist-grid"
class="artist-grid"
></div>

`;


h.insertAdjacentElement(
'afterend',
s
);


const b=
document.createElement(
'section'
);

b.id=
'selected-artist-banner';

b.className=
'selected-artist-banner';


s.insertAdjacentElement(
'afterend',
b
);

}


ensureArtistMediaSections();

}


function ensureArtistMediaSections(){

const screen=
$('music-screen');

if(!screen)
return;


const wrap=
q(
'#music-screen .music-wrap'
);

if(!wrap)
return;


const footer=
q(
'#music-screen .boss-footer'
);


if(
!$('artist-gallery-section')
){

const section=
document.createElement(
'section'
);

section.id=
'artist-gallery-section';

section.className=
'music-section';

section.innerHTML=`

<div class="music-section-heading">

<div>

<span>
ARTIST MEDIA
</span>

<h2>
PHOTO GALLERY
</h2>

</div>

<div class="music-heading-line"></div>

</div>

<div
id="artist-photo-gallery"
class="artist-media-grid"
></div>

`;


if(footer)
footer.insertAdjacentElement(
'beforebegin',
section
);
else
wrap.appendChild(section);

}


if(
!$('artist-videos-section')
){

const section=
document.createElement(
'section'
);

section.id=
'artist-videos-section';

section.className=
'music-section';

section.innerHTML=`

<div class="music-section-heading">

<div>

<span>
WATCH
</span>

<h2>
MUSIC VIDEOS
</h2>

</div>

<div class="music-heading-line"></div>

</div>

<div
id="artist-music-videos"
class="artist-media-grid"
></div>

`;


const gallery=
$('artist-gallery-section');


if(gallery)
gallery.insertAdjacentElement(
'afterend',
section
);
else if(footer)
footer.insertAdjacentElement(
'beforebegin',
section
);
else
wrap.appendChild(section);

}


if(
!$('artist-photo-lightbox')
){

const box=
document.createElement(
'div'
);

box.id=
'artist-photo-lightbox';

box.className=
'artist-media-lightbox';

box.innerHTML=`

<button
id="artist-photo-lightbox-close"
type="button"
aria-label="Close"
>
×
</button>

<img
id="artist-photo-lightbox-image"
alt=""
>

`;


document.body.appendChild(box);


on(
'artist-photo-lightbox-close',
'click',
closeArtistPhoto
);


box.addEventListener(
'click',
e=>{

if(
e.target===
box
)
closeArtistPhoto();

}
);

}


if(
!$('artist-video-lightbox')
){

const box=
document.createElement(
'div'
);

box.id=
'artist-video-lightbox';

box.className=
'artist-media-lightbox';

box.innerHTML=`

<button
id="artist-video-lightbox-close"
type="button"
aria-label="Close"
>
×
</button>

<div
style="
width:min(1000px,94vw);
aspect-ratio:16/9;
background:#000;
"
>

<iframe
id="artist-video-lightbox-frame"
title="Music Video"
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
allowfullscreen
style="
width:100%;
height:100%;
border:0;
display:block;
"
></iframe>

</div>

`;


document.body.appendChild(box);


on(
'artist-video-lightbox-close',
'click',
closeArtistVideo
);


box.addEventListener(
'click',
e=>{

if(
e.target===
box
)
closeArtistVideo();

}
);

}

}


function openArtistPhoto(url){

const box=
$('artist-photo-lightbox');

const image=
$('artist-photo-lightbox-image');


if(
!box||
!image||
!url
)
return;


image.src=
url;


box.classList.add(
'open'
);


document.body.style.overflow=
'hidden';

}


function closeArtistPhoto(){

const box=
$('artist-photo-lightbox');

const image=
$('artist-photo-lightbox-image');


if(box)
box.classList.remove(
'open'
);


if(image)
image.removeAttribute(
'src'
);


document.body.style.overflow=
'';

}


function openArtistVideo(item){

const id=
item.youtubeId||
item.youtube_id||
musicYoutubeId(
item.youtubeUrl||
item.youtube_url||
''
);


if(!id)
return;


const box=
$('artist-video-lightbox');

const frame=
$('artist-video-lightbox-frame');


if(
!box||
!frame
)
return;


if(
audio&&
!audio.paused
)
audio.pause();


frame.src=
`https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;


box.classList.add(
'open'
);


document.body.style.overflow=
'hidden';

}


function closeArtistVideo(){

const box=
$('artist-video-lightbox');

const frame=
$('artist-video-lightbox-frame');


if(box)
box.classList.remove(
'open'
);


if(frame)
frame.src='';


document.body.style.overflow=
'';

}


function renderArtists(){

ensureArtistUI();


const g=
$('artist-grid');


if(!g)
return;


g.innerHTML='';


if(!artists.length){

g.innerHTML=`

<div class="artist-media-empty">

NO ARTISTS ARE PUBLISHED RIGHT NOW.

</div>

`;


clearMusicArtistUI();

return;

}


if(
!activeArtist||
!artists.some(
a=>
String(a.id)===
String(activeArtist.id)
)
){

activeArtist=
artists[0];

}


artists.forEach(
a=>{

const b=
document.createElement(
'button'
);


b.type=
'button';

b.className=
'artist-card'+
(
a===
activeArtist
?
' active'
:
''
);


const image=
a.image||
'images/boss-code-media-logo.png';


b.innerHTML=`

<div class="artist-card-image">

<img
src="${esc(image)}"
alt="${esc(a.name)}"
>

</div>


<div class="artist-card-body">

<span>
ARTIST
</span>

<strong>
${esc(a.name)}
</strong>

</div>

`;


b.onclick=
()=>loadArtist(a);


g.appendChild(b);

}
);


updateArtistUI();

renderArtistGallery();

renderArtistMusicVideos();

}


function clearMusicArtistUI(){

activeArtist=null;


const b=
$('selected-artist-banner');


if(b){

b.innerHTML=`

<div
class="artist-media-empty"
style="width:100%"
>

NO ARTISTS ARE PUBLISHED RIGHT NOW.

</div>

`;

}


const t=
q(
'.featured-release-info h2'
);

const ar=
q(
'.featured-artist'
);

const lab=
q(
'.featured-label'
);

const d=
q(
'.featured-description'
);

const c=
q(
'.placeholder-cover'
);


if(t)
t.textContent=
'NO RELEASE AVAILABLE';

if(ar)
ar.textContent=
'B.O.S.S CODE MUSIC';

if(lab)
lab.textContent=
'MUSIC';

if(d)
d.textContent=
'New music will appear here when it is published from Admin.';


if(c){

c.innerHTML=`

<img
src="images/boss-code-media-logo.png"
alt="B.O.S.S CODE MEDIA"
>

`;

}


if(
$('music-track-list')
)
$('music-track-list').innerHTML=
'<div class="artist-media-empty">NO TRACKS PUBLISHED.</div>';


const releases=
q(
'.release-grid'
);


if(releases)
releases.innerHTML=
'<div class="artist-media-empty">NO RELEASES PUBLISHED.</div>';


renderArtistGallery();

renderArtistMusicVideos();

resetPlayer();

}


function loadArtist(a){

if(!a)
return;


if(audio){

audio.pause();

audio.removeAttribute(
'src'
);

audio.load();

}


activeArtist=
a;

trackIndex=
-1;

sourceIndex=
0;

musicQueue=[];

activeReleaseId=null;


renderArtists();

renderTracks();

renderReleases();

updateArtistUI();

renderArtistGallery();

renderArtistMusicVideos();

resetPlayer();

}


function updateArtistUI(){

if(!activeArtist){

clearMusicArtistUI();

return;

}


const b=
$('selected-artist-banner');


if(b){

b.innerHTML=`

<div class="selected-artist-photo">

<img
src="${esc(
activeArtist.image||
'images/boss-code-media-logo.png'
)}"
alt="${esc(activeArtist.name)}"
>

</div>


<div class="selected-artist-info">

<span>
NOW VIEWING
</span>

<h2>
${esc(activeArtist.name)}
</h2>

<p>
${esc(activeArtist.tagline||'')}
</p>

</div>

`;


b.classList.add(
'show'
);

}


const im=
q(
'#music-screen .music-artist-logo'
);


if(im){

im.src=
activeArtist.image||
'images/boss-code-media-logo.png';

im.alt=
activeArtist.name;

}


const f=
activeArtist.featuredRelease;


const t=
q(
'.featured-release-info h2'
);

const ar=
q(
'.featured-artist'
);

const lab=
q(
'.featured-label'
);

const d=
q(
'.featured-description'
);

const c=
q(
'.placeholder-cover'
);


if(!f){

if(t)
t.textContent=
'NO RELEASE AVAILABLE';

if(ar)
ar.textContent=
activeArtist.name.toUpperCase();

if(lab)
lab.textContent=
'B.O.S.S CODE MUSIC';

if(d)
d.textContent=
'New releases will appear here when they are published.';


if(c){

c.innerHTML=`

<img
src="${esc(
activeArtist.image||
'images/boss-code-media-logo.png'
)}"
alt="${esc(activeArtist.name)}"
>

`;

}


return;

}


if(t)
t.textContent=
f.title;

if(ar)
ar.textContent=
activeArtist.name.toUpperCase();

if(lab)
lab.textContent=
f.type||
'FEATURED RELEASE';

if(d)
d.textContent=
f.description||
'';


if(c){

c.innerHTML=`

<img
src="${esc(
f.artwork||
activeArtist.image||
'images/boss-code-media-logo.png'
)}"
alt="${esc(f.title)}"
>

`;

}


const featuredButton=
$('play-featured-release');


if(featuredButton){

const type=
String(
f.releaseType||
f.type||
''
)
.toLowerCase();


featuredButton.textContent=
type.includes(
'single'
)
?
'▶ LISTEN NOW'
:
'▶ PLAY ALBUM';

}

}


function renderArtistGallery(){

ensureArtistMediaSections();


const g=
$('artist-photo-gallery');


if(!g)
return;


g.innerHTML='';


if(!activeArtist){

g.innerHTML=
'<div class="artist-media-empty">CHOOSE AN ARTIST.</div>';

return;

}


const rows=
artistGalleryRows.filter(
item=>
String(item.artistId)===
String(activeArtist.backendId)
);


if(!rows.length){

g.innerHTML=
'<div class="artist-media-empty">NO PHOTOS PUBLISHED FOR THIS ARTIST.</div>';

return;

}


rows.forEach(
item=>{

const b=
document.createElement(
'button'
);


b.type=
'button';

b.className=
'artist-media-card';


b.innerHTML=`

<img
src="${esc(item.imageUrl)}"
alt="${esc(item.caption||activeArtist.name)}"
>

<div class="artist-media-card-body">

<strong>
${esc(item.caption||activeArtist.name)}
</strong>

<span>
PHOTO GALLERY
</span>

</div>

`;


b.addEventListener(
'click',
()=>openArtistPhoto(
item.imageUrl
)
);


g.appendChild(b);

}
);

}


function renderArtistMusicVideos(){

ensureArtistMediaSections();


const g=
$('artist-music-videos');


if(!g)
return;


g.innerHTML='';


if(!activeArtist){

g.innerHTML=
'<div class="artist-media-empty">CHOOSE AN ARTIST.</div>';

return;

}


const rows=
artistMusicVideoRows.filter(
item=>
String(item.artistId)===
String(activeArtist.backendId)
);


if(!rows.length){

g.innerHTML=
'<div class="artist-media-empty">NO MUSIC VIDEOS PUBLISHED FOR THIS ARTIST.</div>';

return;

}


rows.forEach(
item=>{

const id=
item.youtubeId||
musicYoutubeId(
item.youtubeUrl
);


if(!id)
return;


const thumb=
item.thumbnailUrl||
`https://img.youtube.com/vi/${id}/hqdefault.jpg`;


const b=
document.createElement(
'button'
);


b.type=
'button';

b.className=
'artist-media-card video';


b.innerHTML=`

<img
src="${esc(thumb)}"
alt="${esc(item.title)}"
>

<div class="artist-media-card-body">

<strong>
${esc(item.title)}
</strong>

<span>
▶ WATCH VIDEO
</span>

</div>

`;


b.addEventListener(
'click',
()=>openArtistVideo(
item
)
);


g.appendChild(b);

}
);

}


function releaseTrackIndexes(release){

if(
!release||
!activeArtist
)
return[];


const rid=
release.id??
release.releaseId??
null;


const title=
String(
release.title||
''
)
.trim()
.toLowerCase();


return(
activeArtist.tracks||
[]
)
.map(
(t,i)=>({
t,
i
})
)
.filter(
x=>{

if(
rid!==null&&
rid!==undefined&&
x.t.releaseId!==null&&
x.t.releaseId!==undefined&&
String(x.t.releaseId)===
String(rid)
)
return true;


return(
title&&
String(
x.t.album||
''
)
.trim()
.toLowerCase()===
title
);

}
)
.map(
x=>x.i
);

}


function playRelease(release){

const indexes=
releaseTrackIndexes(
release
);


if(!indexes.length)
return;


musicQueue=
indexes;


activeReleaseId=
release.id??
release.releaseId??
release.title;


renderTracks();


playTrack(
indexes[0]
);

}


function renderTracks(){

const g=
$('music-track-list');


if(!g)
return;


g.innerHTML='';


if(
!activeArtist||
!activeArtist.tracks?.length
){

g.innerHTML=
'<div class="artist-media-empty">NO TRACKS PUBLISHED FOR THIS ARTIST.</div>';

return;

}


activeArtist.tracks
.forEach(
(t,i)=>{

const r=
document.createElement(
'article'
);


r.className=
'music-track';


r.dataset.track=
i;


const artwork=
t.artwork||
activeArtist.featuredRelease?.artwork||
activeArtist.image||
'images/boss-code-media-logo.png';


r.innerHTML=`

<div class="track-number">

${String(i+1).padStart(2,'0')}

</div>


<div class="track-cover">

<img
src="${esc(artwork)}"
alt="${esc(t.title)}"
>

</div>


<div class="track-info">

<strong>
${esc(t.title)}
</strong>

<span>
${esc(activeArtist.name)}${t.album?' • '+esc(t.album):''}
</span>

</div>


<div class="track-status">

${esc(t.status||'PLAY')}

</div>


<div class="track-play-icon">
▶
</div>

`;


r.onclick=
()=>playTrack(i);


g.appendChild(r);

}
);

}


function renderReleases(){

const g=
q(
'.release-grid'
);


if(!g)
return;


g.innerHTML='';


if(
!activeArtist||
!activeArtist.releases?.length
){

g.innerHTML=
'<div class="artist-media-empty">NO RELEASES PUBLISHED FOR THIS ARTIST.</div>';

return;

}


activeArtist.releases
.forEach(
r=>{

const c=
document.createElement(
'article'
);


c.className=
'release-card';


c.style.cursor=
'pointer';


const type=
String(
r.releaseType||
r.type||
''
)
.toLowerCase();


const single=
type.includes(
'single'
);


c.innerHTML=`

<div class="release-placeholder">

<img
src="${esc(
r.artwork||
activeArtist.image||
'images/boss-code-media-logo.png'
)}"
alt="${esc(r.title)}"
>

</div>


<div class="release-info">

<span>
${esc(r.type||'RELEASE')}
</span>

<h3>
${esc(r.title)}
</h3>

<p>
${single?'▶ PLAY SINGLE':'▶ PLAY ALBUM'}
</p>

</div>

`;


c.onclick=
()=>playRelease(r);


g.appendChild(c);

}
);

}
function playTrack(i){

if(
!activeArtist||
!audio
)
return;


const t=
(
activeArtist.tracks||
[]
)[i];


if(!t)
return;


trackIndex=
i;

sourceIndex=
0;


qa(
'.music-track'
)
.forEach(
x=>
x.classList.remove(
'active'
)
);


const row=
q(
`.music-track[data-track="${i}"]`
);


if(row)
row.classList.add(
'active'
);


if(
$('now-playing-title')
)
$('now-playing-title')
.textContent=
t.title;


if(
$('now-playing-artist')
)
$('now-playing-artist')
.textContent=
activeArtist.name;


if(
$('now-playing-art')
){

$('now-playing-art')
.innerHTML=`

<img
src="${esc(
t.artwork||
activeArtist.featuredRelease?.artwork||
activeArtist.image||
'images/boss-code-media-logo.png'
)}"
alt="${esc(t.title)}"
>

`;

}


loadSource(true);

}


function loadSource(play){

if(
!activeArtist||
!audio
)
return;


const t=
(
activeArtist.tracks||
[]
)[trackIndex];


const src=
t?.audioSources?.[
sourceIndex
];


if(!src)
return;


audio.src=
src;

audio.load();


if(play){

audio.play()
.catch(
error=>
console.warn(
'Music playback could not start',
error
)
);

}

}


function resetPlayer(){

if(audio){

audio.pause();

audio.removeAttribute(
'src'
);

audio.load();

}


trackIndex=
-1;

sourceIndex=
0;


if(
$('now-playing-title')
)
$('now-playing-title')
.textContent=
'SELECT A TRACK';


if(
$('now-playing-artist')
)
$('now-playing-artist')
.textContent=
activeArtist
?
activeArtist.name
:
'B.O.S.S CODE MUSIC';


if(
$('now-playing-art')
){

const artwork=

activeArtist?.featuredRelease?.artwork||
activeArtist?.image||
'images/boss-code-media-logo.png';


$('now-playing-art')
.innerHTML=`

<img
src="${esc(artwork)}"
alt="B.O.S.S CODE MUSIC"
>

`;

}


if(
$('music-progress')
)
$('music-progress')
.value=
0;


if(
$('music-current-time')
)
$('music-current-time')
.textContent=
'0:00';


if(
$('music-duration')
)
$('music-duration')
.textContent=
'0:00';


if(
$('music-play-pause')
)
$('music-play-pause')
.textContent=
'▶';

}


function currentMusicQueue(){

if(
!activeArtist
)
return[];


return musicQueue.length
?
musicQueue
:
(
activeArtist.tracks||
[]
)
.map(
(_,i)=>i
);

}


function nextMusicTrack(){

const queue=
currentMusicQueue();


if(!queue.length)
return;


let pos=
queue.indexOf(
trackIndex
);


pos=
pos<0
?
0
:
(pos+1)%
queue.length;


playTrack(
queue[pos]
);

}


function previousMusicTrack(){

const queue=
currentMusicQueue();


if(!queue.length)
return;


let pos=
queue.indexOf(
trackIndex
);


pos=
pos<0
?
queue.length-1
:
(
pos-1+
queue.length
)%
queue.length;


playTrack(
queue[pos]
);

}


const fmt=
s=>
!Number.isFinite(s)
?
'0:00'
:
Math.floor(
s/60
)
+
':'
+
String(
Math.floor(
s%60
)
)
.padStart(
2,
'0'
);


on(
'music-play-pause',
'click',
()=>{

if(
!audio||
!activeArtist
)
return;


if(
trackIndex<0
){

if(
activeArtist.tracks?.length
)
playTrack(0);

return;

}


audio.paused
?
audio.play()
.catch(()=>{})
:
audio.pause();

}
);


on(
'music-next',
'click',
nextMusicTrack
);


on(
'music-previous',
'click',
previousMusicTrack
);


on(
'play-featured-release',
'click',
()=>{

if(!activeArtist)
return;


if(
activeArtist.featuredRelease
){

playRelease(
activeArtist.featuredRelease
);

return;

}


if(
activeArtist.tracks?.length
){

musicQueue=[];

activeReleaseId=null;

playTrack(0);

}

}
);


on(
'music-progress',
'input',
e=>{

if(
audio?.duration
){

audio.currentTime=
(
+e.target.value/
100
)*
audio.duration;

}

}
);


if(audio){


audio.addEventListener(
'play',
()=>{

if(
$('music-play-pause')
)
$('music-play-pause')
.textContent=
'Ⅱ';

}
);


audio.addEventListener(
'pause',
()=>{

if(
$('music-play-pause')
)
$('music-play-pause')
.textContent=
'▶';

}
);


audio.addEventListener(
'timeupdate',
()=>{

if(
$('music-current-time')
)
$('music-current-time')
.textContent=
fmt(
audio.currentTime
);


if(
$('music-duration')
)
$('music-duration')
.textContent=
fmt(
audio.duration
);


if(
$('music-progress')
)
$('music-progress')
.value=
audio.duration
?
audio.currentTime/
audio.duration*
100
:
0;

}
);


audio.addEventListener(
'ended',
nextMusicTrack
);


audio.addEventListener(
'error',
()=>{

if(!activeArtist)
return;


const t=
activeArtist.tracks?.[
trackIndex
];


if(
t&&
sourceIndex<
(
t.audioSources?.length||
0
)-1
){

sourceIndex++;

loadSource(true);

}

}
);


}


/* =========================================================
   DECISION MAKERS
   BACKEND ONLY
========================================================= */

let dmVideos=[];

let dmSessions=[];

let dmChallenges=[];

let dmResources=[];


function yt(url=''){

return musicYoutubeId(
url
);

}


function buildDM(){

const row=
q(
'#decision-makers-screen .on-the-go-row'
);


if(!row)
return;


row.innerHTML='';


if(!dmVideos.length){

row.innerHTML=`

<div
class="artist-media-empty"
style="width:100%"
>
NO DECISION MAKERS VIDEOS ARE PUBLISHED RIGHT NOW.
</div>

`;

return;

}


dmVideos.forEach(
v=>{

const id=
v.youtubeId||
yt(
v.youtubeUrl||
''
);


if(!id)
return;


const c=
document.createElement(
'article'
);


c.className=
'on-the-go-card';


c.innerHTML=`

<div
class="decision-placeholder-video"
style="
aspect-ratio:9/16;
background:#000;
overflow:hidden;
"
>

<iframe
data-dm-youtube
src="https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0&enablejsapi=1"
title="${esc(v.title)}"
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
allowfullscreen
style="
width:100%;
height:100%;
display:block;
border:0;
background:#000;
"
></iframe>

<span
class="coming-label"
style="pointer-events:none"
>
${esc(v.category||'ON THE GO')}
</span>

</div>


<div class="decision-card-body">

<span class="decision-card-type">
QUICK DECISION
</span>

<h3>
${esc(v.title)}
</h3>

<p>
${esc(v.description||'')}
</p>

</div>

`;


row.appendChild(c);

}
);

}


function buildDMSessions(){

const grid=
q(
'#decision-makers-screen .session-grid'
);


if(!grid)
return;


grid.innerHTML='';


if(!dmSessions.length){

grid.innerHTML=`

<div
class="artist-media-empty"
style="grid-column:1/-1"
>
NO DECISION MAKER SESSIONS ARE PUBLISHED RIGHT NOW.
</div>

`;

return;

}


dmSessions.forEach(
session=>{

const id=
session.youtubeId||
yt(
session.youtubeUrl||
''
);


const number=
String(
session.sessionNumber||
1
)
.padStart(
2,
'0'
);


const thumbnail=

session.thumbnailUrl||
(
id
?
`https://img.youtube.com/vi/${id}/hqdefault.jpg`
:
''
);


const card=
document.createElement(
'article'
);


card.className=
'session-card';


const media=
thumbnail
?
`

<div
class="dm-session-media"
data-session-media
>

<img
src="${esc(thumbnail)}"
alt="${esc(session.title)}"
>

${id
?
`
<button
class="dm-session-play"
type="button"
aria-label="Play ${esc(session.title)}"
>
▶
</button>
`
:
''
}

</div>

`
:
'';


card.innerHTML=`

${media}

<div class="session-number">
${number}
</div>

<div class="session-content">

<span>
FOCUSED SESSION
</span>

<h3>
${esc(session.title)}
</h3>

<p>
${esc(session.description||'')}
</p>

<div class="session-status">

${id
?
'▶ WATCH SESSION'
:
'SESSION COMING SOON'
}

</div>

</div>

`;


if(id){

const play=
q(
'.dm-session-play',
card
);


if(play){

play.addEventListener(
'click',
()=>{

if(
audio&&
!audio.paused
)
audio.pause();


const mediaBox=
q(
'[data-session-media]',
card
);


if(!mediaBox)
return;


mediaBox.innerHTML=`

<iframe
data-dm-youtube
src="https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&enablejsapi=1"
title="${esc(session.title)}"
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
allowfullscreen
></iframe>

`;

}
);

}

}


grid.appendChild(
card
);

}
);

}


function buildDMChallenges(){

const grid=
q(
'#decision-makers-screen .action-grid'
);


if(!grid)
return;


grid.innerHTML='';


const message=
$('decision-challenge-message');


if(message)
message.classList.remove(
'show'
);


if(!dmChallenges.length){

grid.innerHTML=`

<div
class="artist-media-empty"
style="grid-column:1/-1"
>
NO TAKE ACTION CHALLENGES ARE PUBLISHED RIGHT NOW.
</div>

`;

return;

}


dmChallenges.forEach(
challenge=>{

const card=
document.createElement(
'article'
);


card.className=
'action-card';


const thumb=
challenge.thumbnailUrl
?
`

<img
class="action-card-thumb"
src="${esc(challenge.thumbnailUrl)}"
alt="${esc(challenge.title)}"
>

`
:
'';


card.innerHTML=`

${thumb}

<div class="action-number">

${String(
challenge.challengeNumber||
1
)
.padStart(
2,
'0'
)}

</div>

<h3>
${esc(challenge.title)}
</h3>

<p>
${esc(challenge.description||'')}
</p>

<button
class="action-button"
type="button"
>
${esc(
challenge.buttonText||
'ACCEPT CHALLENGE'
)}
</button>

`;


const button=
q(
'.action-button',
card
);


if(button){

button.addEventListener(
'click',
()=>{

if(
$('challenge-title')
)
$('challenge-title')
.textContent=
challenge.title||
'YOU MADE THE DECISION.';


if(
$('challenge-copy')
)
$('challenge-copy')
.textContent=
challenge.completionMessage||
'NOW TAKE ACTION.';


if(message){

message.classList.add(
'show'
);


message.scrollIntoView({

behavior:
'smooth',

block:
'nearest'

});

}

}
);

}


grid.appendChild(
card
);

}
);

}


function ensureDMResourcesSection(){

const screen=
$('decision-makers-screen');


if(!screen)
return;


if(
!$('decision-maker-resources-section')
){

const section=
document.createElement(
'section'
);


section.id=
'decision-maker-resources-section';

section.className=
'decision-section';


section.innerHTML=`

<div class="decision-heading">

<div>

<span class="decision-kicker">
KEEP BUILDING
</span>

<h2>
RESOURCES
</h2>

</div>

<span class="red-line"></span>

</div>

<p class="decision-section-copy">
Tools and resources to help you move from decision to action.
</p>

<div
id="decision-maker-resource-grid"
class="dm-resource-grid"
></div>

`;


const footer=
q(
'#decision-makers-screen .boss-footer'
);


if(footer){

footer.insertAdjacentElement(
'beforebegin',
section
);

}else{

screen.appendChild(
section
);

}

}


if(
!$('dm-resource-viewer')
){

const viewer=
document.createElement(
'div'
);


viewer.id=
'dm-resource-viewer';

viewer.className=
'resource-viewer';


viewer.innerHTML=`

<button
id="dm-resource-viewer-close"
class="resource-viewer-close"
type="button"
aria-label="Close resource"
>
×
</button>

<iframe
id="dm-resource-viewer-frame"
title="Decision Makers Resource"
></iframe>

`;


document.body.appendChild(
viewer
);


on(
'dm-resource-viewer-close',
'click',
closeDMResource
);

}

}


function renderDMResources(){

ensureDMResourcesSection();


const grid=
$('decision-maker-resource-grid');


if(!grid)
return;


grid.innerHTML='';


if(!dmResources.length){

grid.innerHTML=`

<div
class="artist-media-empty"
style="grid-column:1/-1"
>
NO RESOURCES ARE PUBLISHED RIGHT NOW.
</div>

`;

return;

}


dmResources.forEach(
resource=>{

const card=
document.createElement(
'article'
);


card.className=
'dm-resource-card';


const image=
resource.coverUrl||
'images/decision-makers-logo.png';


card.innerHTML=`

<img
src="${esc(image)}"
alt="${esc(resource.title)}"
>

<div class="dm-resource-body">

<span>
${esc(resource.type||'RESOURCE')}
</span>

<h3>
${esc(resource.title)}
</h3>

<p>
${esc(resource.description||'')}
</p>

${resource.fileUrl
?
`
<button
class="dm-resource-button"
type="button"
>
${esc(
resource.buttonText||
'OPEN RESOURCE'
)}
</button>
`
:
''
}

</div>

`;


const button=
q(
'.dm-resource-button',
card
);


if(button){

button.addEventListener(
'click',
()=>openDMResource(
resource.fileUrl
)
);

}


grid.appendChild(
card
);

}
);

}


function openDMResource(url){

if(!url)
return;


ensureDMResourcesSection();


const viewer=
$('dm-resource-viewer');

const frame=
$('dm-resource-viewer-frame');


if(
!viewer||
!frame
)
return;


frame.src=
url;


viewer.classList.add(
'open'
);


document.body.style.overflow=
'hidden';

}


function closeDMResource(){

const viewer=
$('dm-resource-viewer');

const frame=
$('dm-resource-viewer-frame');


if(viewer)
viewer.classList.remove(
'open'
);


if(frame)
frame.src='';


document.body.style.overflow=
'';

}


function stopDM(){

qa(
'[data-dm-youtube]'
)
.forEach(
frame=>{

try{

frame.contentWindow
?.postMessage(

JSON.stringify({

event:
'command',

func:
'pauseVideo',

args:[]

}),

'*'

);

}catch{}

}
);

}


function renderDecisionMakers(){

buildDM();

buildDMSessions();

buildDMChallenges();

renderDMResources();

}


on(
'decision-makers-button',
'click',
renderDecisionMakers
);
/* =========================================================
   B.O.S.S CHECK IN
   BACKEND CONTROLLED
========================================================= */

const bank={

APPROVAL:[],

COMPARISON:[],

CONFIDENCE:[],

ACTION:[]

};


let cq=[];

let ci=0;

let resp=[];


const shuffle=
a=>
[...a]
.sort(
()=>Math.random()-.5
);


function showCheckIntro(){

if(
$('checkin-intro')
)
$('checkin-intro')
.style.display=
'flex';


if(
$('checkin-questions')
)
$('checkin-questions')
.style.display=
'none';


if(
$('checkin-results')
)
$('checkin-results')
.style.display=
'none';

}


function startCheck(){

const available=
Object.entries(
bank
)
.flatMap(
([cat,arr])=>

shuffle(arr)
.slice(
0,
3
)
.map(
text=>({

cat,

text

})
)

);


if(!available.length){

if(
$('checkin-question-text')
)
$('checkin-question-text')
.textContent=
'NO CHECK IN QUESTIONS ARE PUBLISHED RIGHT NOW.';


if(
$('checkin-intro')
)
$('checkin-intro')
.style.display=
'none';


if(
$('checkin-questions')
)
$('checkin-questions')
.style.display=
'block';


if(
$('checkin-answers')
)
$('checkin-answers')
.innerHTML=
'<div class="artist-media-empty">CHECK BACK SOON.</div>';


if(
$('previous-question')
)
$('previous-question')
.style.visibility=
'hidden';


return;

}


cq=
shuffle(
available
);


ci=
0;

resp=
[];


if(
$('checkin-intro')
)
$('checkin-intro')
.style.display=
'none';


if(
$('checkin-results')
)
$('checkin-results')
.style.display=
'none';


if(
$('checkin-questions')
)
$('checkin-questions')
.style.display=
'block';


renderQ();

}


function renderQ(){

const x=
cq[ci];


if(!x)
return;


const n=
ci+1;

const total=
cq.length;

const p=
Math.round(
n/
total*
100
);


if(
$('question-count')
)
$('question-count')
.textContent=
`QUESTION ${n} OF ${total}`;


if(
$('progress-percent')
)
$('progress-percent')
.textContent=
`${p}%`;


if(
$('checkin-progress-bar')
)
$('checkin-progress-bar')
.style.width=
`${p}%`;


if(
$('question-category')
)
$('question-category')
.textContent=
x.cat;


if(
$('checkin-question-text')
)
$('checkin-question-text')
.textContent=
x.text;


const a=
$('checkin-answers');


if(!a)
return;


a.innerHTML='';


[

[
'NEVER',
0
],

[
'RARELY',
1
],

[
'SOMETIMES',
2
],

[
'OFTEN',
3
],

[
'VERY OFTEN',
4
]

]
.forEach(
([lab,val])=>{

const b=
document.createElement(
'button'
);


b.type=
'button';

b.className=
'checkin-answer-button';

b.textContent=
lab;


b.onclick=
()=>{

resp[ci]=
val;


if(
ci<
total-1
){

ci++;

renderQ();

}else{

finishCheck();

}

};


a.appendChild(b);

}
);


if(
$('previous-question')
)
$('previous-question')
.style.visibility=
ci
?
'visible'
:
'hidden';

}


function finishCheck(){

const cats={

APPROVAL:[],

COMPARISON:[],

CONFIDENCE:[],

ACTION:[]

};


cq.forEach(
(x,i)=>{

if(
cats[x.cat]
)
cats[x.cat]
.push(
resp[i]??
0
);

}
);


const scores={};


Object.entries(
cats
)
.forEach(
([k,v])=>{

if(!v.length){

scores[k]=
100;

return;

}


scores[k]=
100-
Math.round(

v.reduce(
(a,b)=>a+b,
0
)/
(
v.length*
4
)*
100

);

}
);


const overall=
Math.round(

Object.values(
scores
)
.reduce(
(a,b)=>a+b,
0
)/
4

);


if(
$('checkin-questions')
)
$('checkin-questions')
.style.display=
'none';


if(
$('checkin-results')
)
$('checkin-results')
.style.display=
'block';


if(
$('boss-score')
)
$('boss-score')
.textContent=
overall;


if(
$('boss-score-title')
){

$('boss-score-title')
.textContent=

overall>=80
?
'STRONG DECISION CONTROL'
:
overall>=60
?
'KEEP BUILDING'
:
'SOCIAL STRESS IS IN THE ROOM';

}


if(
$('boss-score-description')
){

$('boss-score-description')
.textContent=

overall>=80
?
'Outside pressure is not driving most of your decisions. Keep protecting that clarity.'
:
overall>=60
?
'You have a solid base, but a few areas are still influencing how you move.'
:
'Outside pressure, hesitation or comparison may be influencing too many decisions right now.';

}


Object.entries(
scores
)
.forEach(
([k,v])=>{

const id=
k.toLowerCase();


if(
$(`${id}-score`)
)
$(`${id}-score`)
.textContent=
v;


if(
$(`${id}-meter`)
)
$(`${id}-meter`)
.style.width=
`${v}%`;

}
);


const weak=
Object.entries(
scores
)
.sort(
(a,b)=>
a[1]-b[1]
)[0]?.[0]||
'ACTION';


if(
$('weakest-category')
)
$('weakest-category')
.textContent=
weak;


if(
$('weakest-message')
){

$('weakest-message')
.textContent={

APPROVAL:
'You may be giving other people too much voting power over your decisions.',

COMPARISON:
'Your attention may be drifting from your own lane into somebody else’s timeline.',

CONFIDENCE:
'You may know more than you are allowing yourself to trust.',

ACTION:
'The issue may not be clarity. It may be execution.'

}[weak];

}


if(
$('next-decision')
){

$('next-decision')
.textContent={

APPROVAL:
'Make one decision today without explaining it to anybody.',

COMPARISON:
'Measure today against your own last 30 days, not somebody else’s highlight reel.',

CONFIDENCE:
'Take one action before asking anybody for reassurance.',

ACTION:
'Complete the next obvious step before planning anything else.'

}[weak];

}

}


on(
'start-checkin',
'click',
startCheck
);


on(
'previous-question',
'click',
()=>{

if(
ci>0
){

ci--;

renderQ();

}

}
);


on(
'retake-checkin',
'click',
showCheckIntro
);


/* =========================================================
   THE BOSS BITE
   BACKEND ONLY
========================================================= */

const episodes=[];


function buildEpisodes(){

const g=
$('episode-grid');


if(!g)
return;


g.innerHTML='';


if(!episodes.length){

g.innerHTML=`

<div
class="artist-media-empty"
style="grid-column:1/-1"
>
NO BOSS BITE EPISODES ARE PUBLISHED RIGHT NOW.
</div>

`;


return;

}


episodes.forEach(
e=>{

const id=
yt(
e.youtubeUrl
);


if(!id)
return;


const c=
document.createElement(
'article'
);


c.className=
'episode-card';


c.innerHTML=`

<div class="episode-thumbnail">

<img
src="https://img.youtube.com/vi/${id}/hqdefault.jpg"
alt="${esc(e.title)}"
>

<div class="play-circle">
▶
</div>

</div>


<div class="episode-info">

<h3>
${esc(e.title)}
</h3>

<p>
${esc(e.description||'')}
</p>

</div>

`;


c.onclick=
()=>playEpisode(
id,
e.title
);


g.appendChild(c);

}
);

}


function playEpisode(
id,
title
){

const p=
$('featured-player');


if(
!p||
!id
)
return;


if(
audio&&
!audio.paused
)
audio.pause();


p.innerHTML=`

<iframe
src="https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0"
title="${esc(title)}"
allow="autoplay; encrypted-media; picture-in-picture"
allowfullscreen
></iframe>

`;


if(
$('featured-title')
)
$('featured-title')
.textContent=
title;


p.scrollIntoView({

behavior:
'smooth',

block:
'center'

});

}


function loadFirstEpisode(){

const e=
episodes[0];

const p=
$('featured-player');


if(!p)
return;


if(!e){

p.innerHTML=`

<div
style="
min-height:280px;
display:grid;
place-items:center;
text-align:center;
background:#050505;
color:#777;
padding:30px;
"
>

<div>

<strong
style="
display:block;
font-size:26px;
color:#fff;
margin-bottom:8px;
"
>
THE BOSS BITE
</strong>

<p>
New episodes will appear here when they are published from Admin.
</p>

</div>

</div>

`;


if(
$('featured-title')
)
$('featured-title')
.textContent=
'FUELING YOUR HUSTLE';


return;

}


const id=
yt(
e.youtubeUrl
);


if(!id)
return;


p.innerHTML=`

<iframe
src="https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0"
title="${esc(e.title)}"
allowfullscreen
></iframe>

`;


if(
$('featured-title')
)
$('featured-title')
.textContent=
e.title;

}


/* =========================================================
   B.O.S.S CODE TV
   BACKEND ONLY
========================================================= */

const tvVideos=[];


let live={

on:false,

id:'',

thumbnailUrl:''

};


function buildTv(){

const g=
$('boss-code-tv-grid');


if(!g)
return;


g.innerHTML='';


if(!tvVideos.length){

g.innerHTML=`

<div
class="artist-media-empty"
style="grid-column:1/-1"
>
NO RECORDED B.O.S.S CODE TV VIDEOS ARE PUBLISHED RIGHT NOW.
</div>

`;


renderLive();

return;

}


tvVideos.forEach(
v=>{

if(!v.id)
return;


const c=
document.createElement(
'article'
);


c.className=
'tv-card';


c.innerHTML=`

<div class="tv-player">

<div class="tv-media">

<button
class="tv-thumbnail"
type="button"
data-video-id="${esc(v.id)}"
>

<img
src="https://img.youtube.com/vi/${esc(v.id)}/hqdefault.jpg"
alt="${esc(v.title)}"
>

<span class="tv-play-button">
</span>

</button>

</div>

</div>


<div class="tv-card-body">

<h3>
${esc(v.title)}
</h3>

</div>

`;


g.appendChild(c);

}
);


renderLive();

}


$('boss-code-tv-grid')
?.addEventListener(
'click',
e=>{

const b=
e.target.closest(
'.tv-thumbnail'
);


if(!b)
return;


const id=
b.dataset.videoId;

const media=
b.closest(
'.tv-media'
);


if(
audio&&
!audio.paused
)
audio.pause();


if(media){

media.innerHTML=`

<iframe
class="tv-iframe"
src="https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0"
allow="autoplay; encrypted-media; picture-in-picture"
allowfullscreen
></iframe>

`;

}

}
);


function renderLive(){

const s=
q(
'.boss-tv-live-section'
);


if(!s)
return;


const p=
q(
'.boss-tv-live-player',
s
);

const badge=
q(
'.boss-tv-live-badge',
s
);

const lab=
q(
'.boss-tv-live-label',
s
);

const title=
q(
'.boss-tv-live-bottom strong',
s
);

const copy=
q(
'.boss-tv-live-bottom p',
s
);


if(
live.on&&
live.id
){


if(badge){

badge.innerHTML=
'<span class="live-dot"></span> LIVE';

badge.style.background=
'#d40000';

badge.style.color=
'#fff';

}


if(p){

p.innerHTML=`

<iframe
src="https://www.youtube.com/embed/${encodeURIComponent(live.id)}?rel=0"
title="B.O.S.S CODE TV LIVE"
allow="autoplay; encrypted-media; picture-in-picture"
allowfullscreen
></iframe>

`;

}


if(lab){

lab.textContent=
'LIVE BROADCAST';

lab.style.color=
'#d40000';

}


if(title)
title.textContent=
'B.O.S.S CODE MEDIA LIVE STREAM';


if(copy)
copy.textContent=
'Watch the current B.O.S.S CODE MEDIA broadcast live inside B.O.S.S CODE GO.';


}else{


if(badge){

badge.textContent=
'OFF AIR';

badge.style.background=
'#181818';

badge.style.color=
'#888';

}


if(p){

if(
live.thumbnailUrl
){

p.innerHTML=`

<div
style="
position:relative;
width:100%;
aspect-ratio:16/9;
background:#050505;
overflow:hidden;
"
>

<img
src="${esc(live.thumbnailUrl)}"
alt="B.O.S.S CODE TV OFF AIR"
style="
width:100%;
height:100%;
object-fit:cover;
display:block;
"
>

<div
style="
position:absolute;
inset:0;
display:grid;
place-items:center;
background:rgba(0,0,0,.28);
"
>

<span
style="
background:rgba(0,0,0,.84);
border:2px solid #F5C518;
border-radius:999px;
padding:10px 18px;
font-size:12px;
font-weight:900;
letter-spacing:.12em;
color:#fff;
"
>
OFF AIR
</span>

</div>

</div>

`;

}else{

p.innerHTML=`

<div
style="
min-height:280px;
display:grid;
place-items:center;
text-align:center;
background:#050505;
color:#777;
padding:30px;
"
>

<div>

<strong
style="
display:block;
color:#fff;
font-size:36px;
"
>
OFF AIR
</strong>

<p>
Check back for the next live conversation, interview or event.
</p>

</div>

</div>

`;

}

}


if(lab){

lab.textContent=
'CURRENT STATUS';

lab.style.color=
'#F5C518';

}


if(title)
title.textContent=
'B.O.S.S CODE TV IS CURRENTLY OFF AIR';


if(copy)
copy.textContent=
'Previously recorded interviews and conversations are available below.';

}

}


/* =========================================================
   BOSS BITE GALLERY
   BACKEND ONLY
========================================================= */

let galleryPhotos=[];


const exts=[

'.jpg',

'.jpeg',

'.png',

'.webp'

];


let gi=
0;


function gallerySrc(item){

return typeof item===
'string'
?
item
:
item?.src||
'';

}


function galleryAlt(item){

if(
typeof item===
'string'
)
return'Boss Bite photo';


return[

item?.caption,

item?.location

]
.filter(Boolean)
.join(' • ')
||
'Boss Bite photo';

}


function isDirectImage(
src=''
){

return(

/^(https?:|data:|blob:)/i
.test(src)
||

/\.(jpe?g|png|webp|gif|avif)(?:[?#].*)?$/i
.test(src)

);

}


function setImg(
img,
item,
n=0
){

const base=
gallerySrc(item);


if(
!img||
!base
)
return;


img.onerror=
null;


if(
isDirectImage(base)
){

img.src=
base;

return;

}


if(
n>=
exts.length
)
return;


img.src=
base+
exts[n];


img.onerror=
()=>setImg(
img,
item,
n+1
);

}


function buildGallery(){

const g=
$('boss-bite-gallery');


if(!g)
return;


g.innerHTML='';


if(!galleryPhotos.length){

g.innerHTML=`

<div
class="artist-media-empty"
style="grid-column:1/-1"
>
NO BOSS BITE GALLERY PHOTOS ARE PUBLISHED RIGHT NOW.
</div>

`;

return;

}


galleryPhotos.forEach(
(item,i)=>{

const b=
document.createElement(
'button'
);

const im=
document.createElement(
'img'
);


b.type=
'button';

b.className=
'gallery-photo';


im.alt=
galleryAlt(item);


setImg(
im,
item
);


b.appendChild(im);


b.onclick=
()=>{

gi=
i;

showGal();

$('gallery-lightbox')
?.classList
.add(
'open'
);

};


g.appendChild(b);

}
);

}


function showGal(){

if(!galleryPhotos.length)
return;


const im=
$('gallery-large-image');

const item=
galleryPhotos[gi];


if(im){

im.alt=
galleryAlt(item);

setImg(
im,
item
);

}


if(
$('gallery-counter')
)
$('gallery-counter')
.textContent=
`${gi+1} / ${galleryPhotos.length}`;

}


on(
'gallery-close',
'click',
()=>{

$('gallery-lightbox')
?.classList
.remove(
'open'
);

}
);


on(
'gallery-next',
'click',
()=>{

if(!galleryPhotos.length)
return;


gi=
(gi+1)%
galleryPhotos.length;

showGal();

}
);


on(
'gallery-previous',
'click',
()=>{

if(!galleryPhotos.length)
return;


gi=
(
gi-1+
galleryPhotos.length
)%
galleryPhotos.length;

showGal();

}
);


/* =========================================================
   BOSS BITE MAP
   BACKEND ONLY
========================================================= */

const restaurants=[];


let bossBiteMap=
null;

let mapLoaded=
false;


const marks={};


function fullLocationAddress(row){

return[

row.address,

row.city,

row.state

]
.filter(Boolean)
.join(', ');

}


function validCoordinates(
lat,
lng
){

return(

Number.isFinite(lat)
&&

Number.isFinite(lng)
&&

lat>=-90
&&

lat<=90
&&

lng>=-180
&&

lng<=180

);

}


function buildRestaurantList(){

const l=
$('restaurant-list');


if(!l)
return;


l.innerHTML='';


if(!restaurants.length){

l.innerHTML=`

<div
class="artist-media-empty"
>
NO BOSS BITE MAP LOCATIONS ARE PUBLISHED RIGHT NOW.
</div>

`;

return;

}


restaurants.forEach(
r=>{

const b=
document.createElement(
'button'
);


b.type=
'button';

b.className=
'restaurant-list-item';

b.dataset.restaurant=
r.id;


b.innerHTML=`

<img
class="restaurant-list-image"
src="${esc(
r.image||
'images/boss-code-media-logo.png'
)}"
alt="${esc(r.name)}"
>


<div class="restaurant-list-info">

<strong>
${esc(r.name)}
</strong>

<span>
${esc(r.category||'BOSS BITE STOP')}
</span>

</div>

`;


b.onclick=
()=>focusRestaurant(
r.id
);


l.appendChild(b);

}
);

}


function popup(r){

const directEpisodeId=
yt(
r.episodeUrl||
''
);


return`

<div class="restaurant-popup">

<img
class="restaurant-popup-image"
src="${esc(
r.image||
'images/boss-code-media-logo.png'
)}"
alt="${esc(r.name)}"
>


<div class="restaurant-popup-body">

<h3>
${esc(r.name)}
</h3>


<div class="restaurant-category">

${esc(r.category||'BOSS BITE STOP')}

</div>


<div class="restaurant-address">

${esc(r.address)}

</div>


${
r.description
?
`

<div
style="
margin-top:8px;
font-size:12px;
line-height:1.45;
color:#555;
"
>

${esc(r.description)}

</div>

`
:
''
}


${
r.episodeUrl&&
directEpisodeId
?
`

<button
class="restaurant-action watch-episode-button"
data-episode-url="${esc(r.episodeUrl||'')}"
type="button"
>
▶ WATCH EPISODE
</button>

`
:
''
}


<a
class="restaurant-action directions-button"
href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.address)}"
target="_blank"
rel="noopener noreferrer"
>
📍 GET DIRECTIONS
</a>


</div>

</div>

`;

}


function clearMapMarkers(){

Object.keys(
marks
)
.forEach(
id=>{

try{

marks[id]
?.remove();

}catch{}


delete marks[id];

}
);

}


function addMapMarkers(){

if(
!bossBiteMap||
!mapLoaded
)
return;


clearMapMarkers();


const bounds=
new maplibregl.LngLatBounds();


let count=
0;


restaurants.forEach(
r=>{

if(

!Array.isArray(r.c)
||

r.c.length!==2
||

!validCoordinates(

Number(r.c[1]),

Number(r.c[0])

)

)
return;


const el=
document.createElement(
'div'
);


el.className=
'boss-bite-map-marker';


el.innerHTML=
'<img src="images/boss-bite-pin.png" alt="">';


const m=

new maplibregl.Marker({

element:
el,

anchor:
'bottom'

})

.setLngLat(
r.c
)

.setPopup(

new maplibregl.Popup({

offset:
35,

maxWidth:
'285px'

})

.setHTML(
popup(r)
)

)

.addTo(
bossBiteMap
);


marks[r.id]=
m;


bounds.extend(
r.c
);


count++;

}
);


if(
count&&
!bounds.isEmpty()
){

bossBiteMap.fitBounds(

bounds,

{

padding:
60,

maxZoom:
9

}

);

}


$('map-loading')
?.classList
.add(
'hidden'
);


bossBiteMap.resize();

}


function initMap(){

if(

!$('boss-bite-map')
||

typeof maplibregl===
'undefined'

)
return;


if(
bossBiteMap
){

bossBiteMap.resize();


if(mapLoaded)
addMapMarkers();


return;

}


bossBiteMap=

new maplibregl.Map({

container:
'boss-bite-map',

style:
'https://tiles.openfreemap.org/styles/dark',

center:[
-80.9,
40.85
],

zoom:
7

});


bossBiteMap.addControl(

new maplibregl.NavigationControl({

showCompass:
false

}),

'top-left'

);


bossBiteMap.on(
'load',
()=>{

mapLoaded=
true;

addMapMarkers();

}
);

}


function focusRestaurant(id){

if(
!bossBiteMap
){

initMap();


setTimeout(
()=>focusRestaurant(id),
600
);


return;

}


const m=
marks[id];


if(!m)
return;


const p=
m.getLngLat();


bossBiteMap.flyTo({

center:[
p.lng,
p.lat
],

zoom:
15,

essential:
true

});


qa(
'.restaurant-list-item'
)
.forEach(
item=>
item.classList.remove(
'selected'
)
);


const selected=
qa(
'.restaurant-list-item'
)
.find(
item=>
item.dataset.restaurant===
String(id)
);


selected
?.classList
.add(
'selected'
);


setTimeout(
()=>{

if(
!m.getPopup()
.isOpen()
)
m.togglePopup();

},
500
);

}


document.addEventListener(
'click',
e=>{

const b=
e.target.closest(
'.watch-episode-button'
);


if(!b)
return;


const directUrl=
b.dataset.episodeUrl||
'';


const directId=
yt(
directUrl
);


if(!directId)
return;


const restaurant=
restaurants.find(
r=>
r.episodeUrl===
directUrl
);


playEpisode(

directId,

restaurant?.name||
'The Boss Bite'

);

}
);


/* =========================================================
   CLOTHING
========================================================= */

const clothingButton=

qa(
'.app-menu .app-button'
)

.find(
button=>

button.textContent
.toUpperCase()
.includes(
'THE CODE CLOTHING'
)

);


if(clothingButton){

clothingButton
.addEventListener(
'click',
()=>{

window.open(

'https://www.bosscodemedia.com/shop',

'_blank'

);

}
);

}
/* =========================================================
   CLOUDFLARE BACKEND
========================================================= */

async function api(path){

const r=
await fetch(
API+path,
{

cache:
'no-store',

headers:{

Accept:
'application/json'

}

}
);


if(!r.ok){

throw Error(
`API ${r.status}`
);

}


const j=
await r.json();


return Array.isArray(
j.data
)
?
j.data
:
[];

}


/* =========================================================
   VIDEO BACKEND
========================================================= */

function applyVideos(rows){

const published=
(
rows||
[]
)
.filter(
v=>
Number(v.published)===1
);


/* DECISION MAKERS */

dmVideos=
published

.filter(
v=>
v.section===
'decision-makers'
)

.map(
v=>({

id:
v.id,

title:
v.title||
'Decision Makers',

youtubeUrl:
v.youtube_url||
'',

youtubeId:
v.youtube_id||
yt(
v.youtube_url||
''
),

category:
v.category||
'ON THE GO',

description:
v.description||
''

})
)

.filter(
v=>
v.youtubeId
);


buildDM();


/* BOSS BITE */

const bossBiteRows=
published

.filter(
v=>
v.section===
'boss-bite'
)

.map(
v=>({

id:
v.id,

title:
v.title||
'The Boss Bite',

description:
v.description||
[
v.business_name,
v.location_name
]
.filter(Boolean)
.join(' • '),

youtubeUrl:
v.youtube_url||
''

})
)

.filter(
v=>
yt(
v.youtubeUrl
)
);


episodes.splice(

0,

episodes.length,

...bossBiteRows

);


buildEpisodes();

loadFirstEpisode();


/* B.O.S.S CODE TV RECORDED */

const recorded=
published

.filter(
v=>
v.section===
'boss-code-tv'
)

.map(
v=>({

id:
v.youtube_id||
yt(
v.youtube_url||
''
),

title:
v.title||
'B.O.S.S CODE TV'

})
)

.filter(
v=>
v.id
);


tvVideos.splice(

0,

tvVideos.length,

...recorded

);


buildTv();


/* LIVE / OFF AIR THUMBNAIL */

const liveRow=
(
rows||
[]
)
.find(
v=>
v.section===
'boss-code-tv-live'
);


live={

on:
Boolean(
liveRow&&
Number(liveRow.published)===1&&
(
liveRow.youtube_id||
yt(
liveRow.youtube_url||
''
)
)
),

id:
liveRow
?
(
liveRow.youtube_id||
yt(
liveRow.youtube_url||
''
)
)
:
'',

thumbnailUrl:
liveRow?.thumbnail_url||
''

};


renderLive();

}


/* =========================================================
   DECISION MAKER PROGRAM BACKEND
========================================================= */

function applyDMSessions(rows){

dmSessions=
(
rows||
[]
)

.filter(
r=>
Number(r.published)===1
)

.sort(
(a,b)=>
Number(
a.sort_order||
0
)
-
Number(
b.sort_order||
0
)
||
Number(
a.session_number||
0
)
-
Number(
b.session_number||
0
)
)

.map(
r=>({

id:
r.id,

title:
r.title||
'Decision Makers Session',

description:
r.description||
'',

sessionNumber:
Number(
r.session_number||
1
),

youtubeUrl:
r.youtube_url||
'',

youtubeId:
r.youtube_id||
yt(
r.youtube_url||
''
),

thumbnailUrl:
r.thumbnail_url||
'',

featured:
Number(
r.featured||
0
)===1

})
);


buildDMSessions();

}


function applyDMChallenges(rows){

dmChallenges=
(
rows||
[]
)

.filter(
r=>
Number(r.published)===1
)

.sort(
(a,b)=>
Number(
a.sort_order||
0
)
-
Number(
b.sort_order||
0
)
||
Number(
a.challenge_number||
0
)
-
Number(
b.challenge_number||
0
)
)

.map(
r=>({

id:
r.id,

title:
r.title||
'Take Action',

description:
r.description||
'',

challengeNumber:
Number(
r.challenge_number||
1
),

buttonText:
r.button_text||
'ACCEPT CHALLENGE',

completionMessage:
r.completion_message||
'NOW TAKE ACTION.',

thumbnailUrl:
r.thumbnail_url||
''

})
);


buildDMChallenges();

}


function applyDMResources(rows){

dmResources=
(
rows||
[]
)

.filter(
r=>
Number(r.published)===1
)

.sort(
(a,b)=>

Number(
b.featured||
0
)
-
Number(
a.featured||
0
)

||

Number(
a.sort_order||
0
)
-
Number(
b.sort_order||
0
)
)

.map(
r=>({

id:
r.id,

title:
r.title||
'Decision Makers Resource',

description:
r.description||
'',

type:
r.resource_type||
'RESOURCE',

fileUrl:
r.file_url||
'',

coverUrl:
r.cover_image_url||
'',

buttonText:
r.button_text||
'OPEN RESOURCE'

})
);


renderDMResources();

}


/* =========================================================
   ARTIST PHOTO GALLERY BACKEND
========================================================= */

function applyArtistGallery(rows){

artistGalleryRows=
(
rows||
[]
)

.filter(
r=>
Number(r.published)===1
)

.sort(
(a,b)=>

Number(
b.featured||
0
)
-
Number(
a.featured||
0
)

||

Number(
a.sort_order||
0
)
-
Number(
b.sort_order||
0
)
)

.map(
r=>({

id:
r.id,

artistId:
r.artist_id,

imageUrl:
r.image_url||
'',

caption:
r.caption||
''

})
)

.filter(
r=>
r.artistId&&
r.imageUrl
);


renderArtistGallery();

}


/* =========================================================
   ARTIST MUSIC VIDEOS BACKEND
========================================================= */

function applyArtistMusicVideos(rows){

artistMusicVideoRows=
(
rows||
[]
)

.filter(
r=>
Number(r.published)===1
)

.sort(
(a,b)=>

Number(
b.featured||
0
)
-
Number(
a.featured||
0
)

||

Number(
a.sort_order||
0
)
-
Number(
b.sort_order||
0
)
)

.map(
r=>({

id:
r.id,

artistId:
r.artist_id,

title:
r.title||
'Music Video',

youtubeUrl:
r.youtube_url||
'',

youtubeId:
r.youtube_id||
yt(
r.youtube_url||
''
),

thumbnailUrl:
r.thumbnail_url||
''

})
)

.filter(
r=>
r.artistId&&
r.youtubeId
);


renderArtistMusicVideos();

}


/* =========================================================
   MUSIC BACKEND
   ADMIN IS THE ONLY SOURCE
========================================================= */

function applyMusic(
A,
R,
T
){

const order=
(x,y)=>

Number(
x?.sort_order||
0
)
-
Number(
y?.sort_order||
0
)

||

Number(
x?.track_number||
0
)
-
Number(
y?.track_number||
0
)

||

Number(
x?.id||
0
)
-
Number(
y?.id||
0
);


const publishedArtists=
(
A||
[]
)

.filter(
x=>
Number(x.published)===1
)

.sort(
order
);


const publishedReleases=
(
R||
[]
)

.filter(
x=>
Number(x.published)===1
)

.sort(
order
);


const publishedTracks=
(
T||
[]
)

.filter(
x=>
Number(x.published)===1
)

.sort(
order
);


const rebuilt=
publishedArtists.map(
a=>{

const rs=
publishedReleases

.filter(
r=>
Number(r.artist_id)===
Number(a.id)
)

.sort(
order
);


const ts=
publishedTracks

.filter(
t=>
Number(t.artist_id)===
Number(a.id)
)

.sort(
order
);


const featured=
rs.find(
r=>
Number(r.featured)===1
)
||
rs[0]
||
null;


const artistImage=

a.artist_image_url
||

featured?.artwork_url
||

'images/boss-code-media-logo.png';


return{

id:
'artist-'+
a.id,

backendId:
a.id,

name:
a.name||
'B.O.S.S CODE Artist',

initials:
String(
a.name||
'BC'
)
.split(/\s+/)
.map(
x=>
x[0]
)
.join('')
.slice(
0,
3
)
.toUpperCase(),

image:
artistImage,

tagline:
a.bio||
'Independent music. Direct from the artist.',


featuredRelease:
featured
?
{

id:
featured.id,

releaseId:
featured.id,

title:
featured.title||
'Release',

type:
'FEATURED RELEASE',

releaseType:
featured.release_type||
'RELEASE',

artwork:
featured.artwork_url||
artistImage,

description:
featured.description||
`Listen to ${a.name} directly inside B.O.S.S CODE Music.`

}
:
null,


tracks:
ts.map(
t=>{

const release=
rs.find(
r=>
Number(r.id)===
Number(t.release_id)
);


return{

id:
t.id,

title:
t.title||
'Track',

album:
release?.title||
'B.O.S.S CODE MUSIC',

releaseId:
t.release_id||
release?.id||
null,

releaseType:
release?.release_type||
'',

audioSources:[
t.audio_url
]
.filter(Boolean),

artwork:
t.artwork_url||
release?.artwork_url||
artistImage,

status:
'PLAY',

trackNumber:
Number(
t.track_number||
0
),

sortOrder:
Number(
t.sort_order||
0
)

};

}
)

.filter(
t=>
t.audioSources.length
),


releases:
rs.map(
r=>({

id:
r.id,

releaseId:
r.id,

title:
r.title||
'Release',

type:
String(
r.release_type||
'RELEASE'
)
.toUpperCase(),

releaseType:
r.release_type||
'RELEASE',

artwork:
r.artwork_url||
artistImage,

description:
r.description||
'',

status:
'Listen now',

sortOrder:
Number(
r.sort_order||
0
)

})
)

};

}
);


artists=
rebuilt;


if(!artists.length){

activeArtist=null;

musicQueue=[];

activeReleaseId=null;

clearMusicArtistUI();

return;

}


if(activeArtist){

activeArtist=
artists.find(
a=>
String(a.backendId)===
String(activeArtist.backendId)
)
||
artists[0];

}else{

activeArtist=
artists[0];

}


musicQueue=[];

activeReleaseId=null;


renderArtists();

renderTracks();

renderReleases();

updateArtistUI();

renderArtistGallery();

renderArtistMusicVideos();

}


/* =========================================================
   BOSS BITE GALLERY BACKEND
========================================================= */

function applyGallery(rows){

galleryPhotos=
(
rows||
[]
)

.filter(
r=>
Number(r.published)===1
)

.sort(
(a,b)=>

Number(
b.featured||
0
)
-
Number(
a.featured||
0
)

||

Number(
a.sort_order||
0
)
-
Number(
b.sort_order||
0
)
)

.map(
r=>({

src:
r.image_url||
'',

caption:
r.caption||
'',

location:
r.location_name||
''

})
)

.filter(
x=>
x.src
);


if(
gi>=
galleryPhotos.length
)
gi=0;


buildGallery();

}


/* =========================================================
   BOSS BITE MAP BACKEND
========================================================= */

function applyLocations(rows){

const cloud=
(
rows||
[]
)

.filter(
r=>
Number(r.published)===1
)

.sort(
(a,b)=>

Number(
b.featured||
0
)
-
Number(
a.featured||
0
)

||

Number(
a.sort_order||
0
)
-
Number(
b.sort_order||
0
)
)

.map(
r=>{

const lat=
Number(
r.latitude
);


const lng=
Number(
r.longitude
);


const address=
fullLocationAddress(
r
);


const locationLabel=
[
r.city,
r.state
]
.filter(Boolean)
.join(' • ');


return{

id:
'cloud-location-'+
r.id,

name:
r.name||
'Boss Bite Stop',

category:
locationLabel||
'BOSS BITE STOP',

description:
r.description||
'',

address:
address||
r.address||
'',

image:
r.image_url||
'images/boss-code-media-logo.png',

episodeUrl:
r.episode_url||
'',

c:
validCoordinates(
lat,
lng
)
?
[
lng,
lat
]
:
null

};

}
)

.filter(
r=>
r.name&&
r.c
);


restaurants.splice(

0,

restaurants.length,

...cloud

);


buildRestaurantList();


if(
bossBiteMap&&
mapLoaded
){

addMapMarkers();

}

}


/* =========================================================
   DAILY DECISION BACKEND
========================================================= */

function applyDailyDecisions(rows){

const today=
new Date()
.toISOString()
.slice(
0,
10
);


const published=
(
rows||
[]
)

.filter(
r=>
Number(r.published)===1
);


const scheduled=
published.filter(
r=>
r.scheduled_date===
today
);


const source=
scheduled.length
?
scheduled
:
published;


daily=
[
...source
]

.sort(
(a,b)=>

Number(
b.featured||
0
)
-
Number(
a.featured||
0
)

||

Number(
a.sort_order||
0
)
-
Number(
b.sort_order||
0
)
)

.map(
r=>[

r.decision_text||
'',

r.description||
''

]
)

.filter(
x=>
x[0]
);


const state=
dailyState();


if(
daily.length&&
state.i>=daily.length
){

state.i=0;

localStorage.setItem(
DK,
JSON.stringify(state)
);

}


renderDaily();

}


/* =========================================================
   B.O.S.S CHECK IN BACKEND
========================================================= */

function normalizeCheckinCategory(category){

const c=
String(
category||
''
)
.trim()
.toUpperCase();


if(
c.includes(
'APPROVAL'
)
)
return'APPROVAL';


if(
c.includes(
'COMPARISON'
)
)
return'COMPARISON';


if(
c.includes(
'CONFIDENCE'
)
)
return'CONFIDENCE';


if(
c.includes(
'ACTION'
)
)
return'ACTION';


return'';

}


function applyCheckinQuestions(rows){

const nextBank={

APPROVAL:[],

COMPARISON:[],

CONFIDENCE:[],

ACTION:[]

};


(
rows||
[]
)

.filter(
r=>
Number(r.published)===1
)

.sort(
(a,b)=>

Number(
a.sort_order||
0
)
-
Number(
b.sort_order||
0
)
)

.forEach(
r=>{

const category=
normalizeCheckinCategory(
r.category
);


const text=
String(
r.question_text||
''
)
.trim();


if(
!category||
!text
)
return;


if(
!nextBank[
category
]
.includes(
text
)
){

nextBank[
category
]
.push(
text
);

}

}
);


for(
const category of[

'APPROVAL',

'COMPARISON',

'CONFIDENCE',

'ACTION'

]
){

bank[
category
]=
nextBank[
category
];

}


console.info(
'B.O.S.S CHECK IN synced from Admin.'
);

}


/* =========================================================
   MAGAZINE
   OPEN INSIDE APP
========================================================= */

let currentMagazineUrl='';


function applyMagazines(rows){

const published=
(
rows||
[]
)

.filter(
r=>
Number(r.published)===1
)

.sort(
(a,b)=>

Number(
b.featured||
0
)
-
Number(
a.featured||
0
)

||

Number(
a.sort_order||
0
)
-
Number(
b.sort_order||
0
)
);


currentMagazineUrl=
published[0]?.magazine_url||
'';

}


function ensureInternalWebStyles(){

if(
$('boss-internal-web-styles')
)
return;


const style=
document.createElement(
'style'
);


style.id=
'boss-internal-web-styles';


style.textContent=`

.boss-internal-screen{
background:#000;
min-height:100vh;
color:#fff;
}

.boss-internal-wrap{
width:min(1200px,100%);
margin:auto;
padding:16px;
}

.boss-internal-head{
display:flex;
align-items:center;
justify-content:space-between;
gap:12px;
margin-bottom:14px;
}

.boss-internal-title{
font-size:18px;
font-weight:900;
}

.boss-internal-back{
border:2px solid #d40000;
border-radius:999px;
background:#090909;
color:#fff;
padding:11px 16px;
font:inherit;
font-weight:900;
cursor:pointer;
}

.boss-internal-frame{
display:block;
width:100%;
height:calc(100vh - 115px);
min-height:650px;
border:1px solid #252525;
border-radius:16px;
background:#fff;
}

.boss-internal-empty{
min-height:60vh;
display:grid;
place-items:center;
text-align:center;
border:1px dashed #333;
border-radius:18px;
color:#888;
padding:30px;
}

`;

document.head.appendChild(
style
);

}


function ensureInternalScreen(){

ensureInternalWebStyles();


let screen=
$('boss-internal-web-screen');


if(screen)
return screen;


screen=
document.createElement(
'div'
);


screen.id=
'boss-internal-web-screen';

screen.className=
'screen boss-internal-screen';


screen.innerHTML=`

<div class="boss-internal-wrap">

<div class="boss-internal-head">

<button
id="boss-internal-back"
class="boss-internal-back"
type="button"
>
RETURN TO HOME
</button>

<div
id="boss-internal-title"
class="boss-internal-title"
>
B.O.S.S CODE
</div>

</div>

<div
id="boss-internal-content"
></div>

<button
id="boss-internal-back-bottom"
class="boss-return-home-bottom"
type="button"
>
RETURN TO HOME
</button>

</div>

`;


document.body.appendChild(
screen
);


const back=
()=>{

const frame=
$('boss-internal-frame');


if(frame)
frame.src=
'about:blank';


showScreen(
home
);

};


on(
'boss-internal-back',
'click',
back
);


on(
'boss-internal-back-bottom',
'click',
back
);


return screen;

}


function openInternalWeb(
title,
url
){

const screen=
ensureInternalScreen();


if(
$('boss-internal-title')
)
$('boss-internal-title')
.textContent=
title;


const content=
$('boss-internal-content');


if(!content)
return;


if(!url){

content.innerHTML=`

<div class="boss-internal-empty">

<div>

<strong
style="
display:block;
color:#fff;
font-size:26px;
margin-bottom:8px;
"
>
NOT AVAILABLE YET
</strong>

<p>
This content will appear when it is published from B.O.S.S CODE GO Admin.
</p>

</div>

</div>

`;


showScreen(
screen
);

return;

}


content.innerHTML=`

<iframe
id="boss-internal-frame"
class="boss-internal-frame"
src="${esc(url)}"
title="${esc(title)}"
allow="fullscreen"
></iframe>

`;


showScreen(
screen
);

}


function setupInternalLinks(){

const magazineButton=
q(
'.app-menu a[href*="magazine.bosscodemedia.com"]'
);


if(magazineButton){

magazineButton.addEventListener(
'click',
e=>{

e.preventDefault();

e.stopImmediatePropagation();


openInternalWeb(

'B.O.S.S CODE MAGAZINE',

currentMagazineUrl

);

},
true
);

}


if(clothingButton){

clothingButton.addEventListener(
'click',
e=>{

e.preventDefault();

e.stopImmediatePropagation();


openInternalWeb(

'THE CODE CLOTHING',

'https://www.bosscodemedia.com/shop'

);

},
true
);

}

}


/* =========================================================
   CLOUD SYNC
========================================================= */

async function sync(){

const results=
await Promise.allSettled([

api(
'/videos?all=1'
),

api(
'/magazines'
),

api(
'/artists'
),

api(
'/artist-gallery'
),

api(
'/artist-music-videos'
),

api(
'/releases'
),

api(
'/tracks'
),

api(
'/boss-bite-gallery'
),

api(
'/boss-bite-locations'
),

api(
'/daily-decisions'
),

api(
'/checkin-questions'
),

api(
'/decision-maker-sessions'
),

api(
'/decision-maker-challenges'
),

api(
'/decision-maker-resources'
)

]);


const[

videosResult,

magazinesResult,

artistsResult,

artistGalleryResult,

artistVideosResult,

releasesResult,

tracksResult,

galleryResult,

locationsResult,

dailyResult,

checkinResult,

sessionsResult,

challengesResult,

resourcesResult

]=
results;


if(
videosResult.status===
'fulfilled'
){

applyVideos(
videosResult.value
);

}else{

console.warn(
'Video sync failed',
videosResult.reason
);

}


if(
magazinesResult.status===
'fulfilled'
){

applyMagazines(
magazinesResult.value
);

}else{

currentMagazineUrl='';

}


if(

artistsResult.status===
'fulfilled'
&&

releasesResult.status===
'fulfilled'
&&

tracksResult.status===
'fulfilled'

){

applyMusic(

artistsResult.value,

releasesResult.value,

tracksResult.value

);

}else{

artists=[];

activeArtist=null;

clearMusicArtistUI();

}


if(
artistGalleryResult.status===
'fulfilled'
){

applyArtistGallery(
artistGalleryResult.value
);

}else{

artistGalleryRows=[];

renderArtistGallery();

}


if(
artistVideosResult.status===
'fulfilled'
){

applyArtistMusicVideos(
artistVideosResult.value
);

}else{

artistMusicVideoRows=[];

renderArtistMusicVideos();

}


if(
galleryResult.status===
'fulfilled'
){

applyGallery(
galleryResult.value
);

}else{

galleryPhotos=[];

buildGallery();

}


if(
locationsResult.status===
'fulfilled'
){

applyLocations(
locationsResult.value
);

}else{

restaurants.splice(
0,
restaurants.length
);

buildRestaurantList();

}


if(
dailyResult.status===
'fulfilled'
){

applyDailyDecisions(
dailyResult.value
);

}else{

daily=[];

renderDaily();

}


if(
checkinResult.status===
'fulfilled'
){

applyCheckinQuestions(
checkinResult.value
);

}else{

for(
const category of[

'APPROVAL',

'COMPARISON',

'CONFIDENCE',

'ACTION'

]
){

bank[
category
]=[];

}

}


if(
sessionsResult.status===
'fulfilled'
){

applyDMSessions(
sessionsResult.value
);

}else{

dmSessions=[];

buildDMSessions();

}


if(
challengesResult.status===
'fulfilled'
){

applyDMChallenges(
challengesResult.value
);

}else{

dmChallenges=[];

buildDMChallenges();

}


if(
resourcesResult.status===
'fulfilled'
){

applyDMResources(
resourcesResult.value
);

}else{

dmResources=[];

renderDMResources();

}


const failed=
results.filter(
x=>
x.status===
'rejected'
);


if(failed.length){

console.warn(
`${failed.length} B.O.S.S CODE GO cloud request(s) failed.`
);

}else{

console.info(
'B.O.S.S CODE GO synced from Admin.'
);

}

}


/* =========================================================
   START APP
========================================================= */

setupInternalLinks();


renderDaily();


renderArtists();

renderTracks();

renderReleases();


renderDecisionMakers();


buildEpisodes();

loadFirstEpisode();


buildTv();


buildGallery();

buildRestaurantList();


sync();