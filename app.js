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
   APP ANALYTICS + PROMOTIONAL ADS
========================================================= */

const ANALYTICS_VISITOR_KEY='boss-code-go-visitor-id-v1';
const DEMOGRAPHICS_PROMPT_KEY='boss-code-go-demographics-prompted-v1';
const DEMOGRAPHICS_PROFILE_KEY='boss-code-go-demographics-profile-v1';
const SONG_QUALIFIED_SECONDS=15;

function makeBossId(prefix='id'){
try{
if(globalThis.crypto?.randomUUID)return `${prefix}-${globalThis.crypto.randomUUID()}`;
}catch{}
return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function visitorId(){
let id='';
try{id=localStorage.getItem(ANALYTICS_VISITOR_KEY)||'';}catch{}
if(!id){
id=makeBossId('visitor');
try{localStorage.setItem(ANALYTICS_VISITOR_KEY,id);}catch{}
}
return id;
}

const BOSS_VISITOR_ID=visitorId();
const BOSS_SESSION_ID=makeBossId('visit');

function analyticsSectionFromScreen(screen){
const id=screen?.id||'';
return({
'home-screen':'home',
'boss-bite-screen':'boss-bite',
'boss-code-tv-screen':'boss-code-tv',
'decision-makers-screen':'decision-makers',
'boss-checkin-screen':'boss-checkin',
'music-screen':'music',
'contact-screen':'contact',
'support-screen':'support'
})[id]||'';
}

function trackAnalytics(eventType,options={}){
const payload={
event_type:eventType,
section:options.section||'',
item_id:String(options.itemId??''),
item_title:String(options.itemTitle??''),
visitor_id:BOSS_VISITOR_ID,
session_id:BOSS_SESSION_ID
};

if(options.valueNumeric!==undefined&&options.valueNumeric!==null){
payload.value_numeric=options.valueNumeric;
}

if(options.detail!==undefined){
payload.detail=options.detail;
}

fetch(`${API}/analytics/events`,{
method:'POST',
headers:{'Content-Type':'application/json','Accept':'application/json'},
body:JSON.stringify(payload),
keepalive:true
}).catch(()=>{});
}

function trackPageOpen(section,title=''){
if(!section)return;
trackAnalytics('page_open',{
section,
itemTitle:title||section
});
}

function currentAnalyticsSection(target){
const screen=target?.closest?.('.screen')||q('.screen.active-screen');
let section=analyticsSectionFromScreen(screen);

if(!section&&target?.closest?.('.maplibregl-popup'))section='boss-bite';

if(!section&&target?.closest?.('#boss-internal-web-screen')){

const title=
$('boss-internal-title')
?.textContent
?.toUpperCase()||
'';

if(
title.includes(
'MAGAZINE'
)
)
section='magazine';

else if(
title.includes(
'CLOTHING'
)
)
section='the-code-clothing';

else
section='internal';

}

return section||'unknown';
}


// Broad button / link analytics.
// Specific events below add deeper meaning.

document.addEventListener(
'click',
event=>{

const control=
event.target.closest?.(
'button,a'
);

if(!control)
return;

if(
control.dataset.analyticsIgnore===
'1'
)
return;


const label=
(
control.dataset.analyticsTitle||
control.getAttribute(
'aria-label'
)||
control.textContent||
control.getAttribute(
'href'
)||
'BUTTON'
)

.replace(
/\s+/g,
' '
)

.trim()

.slice(
0,
220
);


trackAnalytics(
'button_click',
{

section:
currentAnalyticsSection(
control
),

itemId:
control.id||
control.dataset.restaurant||
'',

itemTitle:
label

}
);

},
true
);


let promoAds=[];

let promoAdsLoaded=false;

const promoShownThisVisit=
new Set();

let activePromoContext=
null;


function applyPromoAds(rows){

promoAds=
(
rows||
[]
)

.filter(
row=>
Number(
row.published
)===
1
)

.sort(
(a,b)=>

Number(
b.priority||
0
)
-
Number(
a.priority||
0
)

||

Number(
b.id||
0
)
-
Number(
a.id||
0
)

);


promoAdsLoaded=
true;

}


function todayKey(){

const d=
new Date();


return`${

d.getFullYear()

}-${
String(
d.getMonth()+
1
)
.padStart(
2,
'0'
)

}-${
String(
d.getDate()
)
.padStart(
2,
'0'
)
}`;

}


function adFrequencyAllows(ad){

const mode=
String(
ad.frequency_mode||
'once_per_visit'
)
.toLowerCase();


const id=
String(
ad.id||
''
);


if(!id)
return false;


if(
mode===
'every_time'
)
return true;


if(
mode===
'once_per_day'
){

try{

return localStorage.getItem(
`boss-code-ad-day-${id}`
)!==
todayKey();

}catch{

return true;

}

}


return !promoShownThisVisit.has(
id
);

}


function markAdShown(ad){

const mode=
String(
ad.frequency_mode||
'once_per_visit'
)
.toLowerCase();


const id=
String(
ad.id||
''
);


if(!id)
return;


if(
mode===
'once_per_day'
){

try{

localStorage.setItem(
`boss-code-ad-day-${id}`,
todayKey()
);

}catch{}

}
else if(
mode!==
'every_time'
){

promoShownThisVisit.add(
id
);

}

}


function adMatchesSection(
ad,
section
){

const target=
String(
ad.target_section||
'all'
)
.toLowerCase();


return(
target===
'all'
||
target===
section
);

}


function activeAdForSection(
section
){

return promoAds.find(
ad=>
adMatchesSection(
ad,
section
)
&&
adFrequencyAllows(
ad
)
)
||
null;

}


function ensurePromoAdUI(){

if(
$('boss-promo-ad-overlay')
)
return;


const overlay=
document.createElement(
'div'
);


overlay.id=
'boss-promo-ad-overlay';

overlay.className=
'boss-promo-ad-overlay';

overlay.setAttribute(
'aria-hidden',
'true'
);


overlay.innerHTML=`

<div
class="boss-promo-ad-card"
role="dialog"
aria-modal="true"
aria-label="Sponsored message"
>

<button
id="boss-promo-ad-close"
class="boss-promo-ad-close"
type="button"
aria-label="Close ad"
data-analytics-ignore="1"
>
×
</button>

<div class="boss-promo-ad-sponsored">
SPONSORED
</div>

<div
id="boss-promo-ad-media"
class="boss-promo-ad-media"
></div>

<div class="boss-promo-ad-copy">

<h2 id="boss-promo-ad-headline"></h2>

<p id="boss-promo-ad-description"></p>

<button
id="boss-promo-ad-cta"
class="boss-promo-ad-cta"
type="button"
data-analytics-ignore="1"
>
LEARN MORE
</button>

</div>

</div>

`;


document.body.appendChild(
overlay
);


on(
'boss-promo-ad-close',
'click',
()=>finishPromoAd(false)
);


on(
'boss-promo-ad-cta',
'click',
()=>finishPromoAd(true)
);

}


async function refreshPromoAdsForSection(
section
){

try{

const rows=
await Promise.race([

api(
'/promo-ads'
),

new Promise(
resolve=>
setTimeout(
()=>resolve(null),
1200
)
)

]);


if(
rows===
null
)
return;


if(
Array.isArray(
rows
)
)
applyPromoAds(
rows
);

}catch{}

}


async function openWithPromo(
section,
next
){

if(
typeof next!==
'function'
)
return;


if(
!promoAdsLoaded
){

await refreshPromoAdsForSection(
section
);

}


const ad=
activeAdForSection(
section
);


if(!ad){

next();

return;

}


ensurePromoAdUI();

markAdShown(
ad
);


activePromoContext={

ad,

section,

next

};


const media=
$('boss-promo-ad-media');

const headline=
$('boss-promo-ad-headline');

const description=
$('boss-promo-ad-description');

const cta=
$('boss-promo-ad-cta');

const overlay=
$('boss-promo-ad-overlay');


if(media){

const url=
esc(
ad.media_url||
''
);


if(
String(
ad.media_type||
'image'
)
.toLowerCase()===
'video'
){

media.innerHTML=`

<video
src="${url}"
autoplay
muted
controls
playsinline
preload="metadata"
></video>

`;

}
else{

media.innerHTML=`

<img
src="${url}"
alt="${esc(
ad.headline||
ad.campaign_name||
'Sponsored message'
)}"
>

`;

}

}


if(headline){

headline.textContent=
ad.headline||
ad.campaign_name||
'SPONSORED';


headline.style.display=
headline.textContent
?
'block'
:
'none';

}


if(description){

description.textContent=
ad.description||
'';


description.style.display=
ad.description
?
'block'
:
'none';

}


if(cta){

cta.textContent=
ad.cta_text||
'LEARN MORE';

}


if(overlay){

overlay.classList.add(
'open'
);

overlay.setAttribute(
'aria-hidden',
'false'
);

}


document.body.style.overflow=
'hidden';


trackAnalytics(
'ad_impression',
{

section,

itemId:
ad.id,

itemTitle:
ad.campaign_name||
ad.headline||
'PROMOTIONAL AD',

detail:{

advertiser:
ad.advertiser_name||
'',

media_type:
ad.media_type||
'image'

}

}
);

}


function finishPromoAd(
clicked
){

const context=
activePromoContext;


if(!context)
return;


const{
ad,
section,
next
}=
context;


activePromoContext=
null;


const overlay=
$('boss-promo-ad-overlay');

const media=
$('boss-promo-ad-media');


if(overlay){

overlay.classList.remove(
'open'
);

overlay.setAttribute(
'aria-hidden',
'true'
);

}


if(media)
media.innerHTML='';


document.body.style.overflow=
'';


if(clicked){

trackAnalytics(
'ad_click',
{

section,

itemId:
ad.id,

itemTitle:
ad.campaign_name||
ad.headline||
'PROMOTIONAL AD',

detail:{

advertiser:
ad.advertiser_name||
''

}

}
);


const link=
String(
ad.link_url||
''
)
.trim();


if(link){

try{

window.open(

link,

'_blank',

'noopener,noreferrer'

);

}catch{}

}

}


next();

}


function ensureDemographicsPrompt(){

if(
$('boss-demographics-overlay')
)
return;


let prompted=
false;


try{

prompted=
localStorage.getItem(
DEMOGRAPHICS_PROMPT_KEY
)===
'1';

}catch{}


if(prompted)
return;


const overlay=
document.createElement(
'div'
);


overlay.id=
'boss-demographics-overlay';

overlay.className=
'boss-demographics-overlay';


overlay.innerHTML=`

<div
class="boss-demographics-card"
role="dialog"
aria-modal="true"
aria-label="Optional audience information"
>

<span>
OPTIONAL
</span>

<h2>
HELP US UNDERSTAND OUR AUDIENCE
</h2>

<p>
This information is voluntary and is used only for aggregate B.O.S.S CODE GO analytics.
</p>

<label>
AGE RANGE
</label>

<select id="boss-demo-age">

<option value="">
CHOOSE ONE
</option>

<option value="under-18">
UNDER 18
</option>

<option value="18-24">
18 TO 24
</option>

<option value="25-34">
25 TO 34
</option>

<option value="35-44">
35 TO 44
</option>

<option value="45-54">
45 TO 54
</option>

<option value="55-64">
55 TO 64
</option>

<option value="65+">
65+
</option>

<option value="prefer-not-to-say">
PREFER NOT TO SAY
</option>

</select>

<label>
GENDER
</label>

<select id="boss-demo-gender">

<option value="">
CHOOSE ONE
</option>

<option value="male">
MALE
</option>

<option value="female">
FEMALE
</option>

<option value="prefer-not-to-say">
PREFER NOT TO SAY
</option>

</select>


<div class="boss-demographics-actions">

<button
id="boss-demo-save"
type="button"
>
SAVE OPTIONAL INFO
</button>

<button
id="boss-demo-skip"
type="button"
>
SKIP
</button>

</div>

</div>

`;


document.body.appendChild(
overlay
);


on(
'boss-demo-skip',
'click',
()=>closeDemographicsPrompt(
true
)
);


on(
'boss-demo-save',
'click',
saveDemographicsProfile
);

}


function showDemographicsPromptIfAppropriate(){

let prompted=
false;


try{

prompted=
localStorage.getItem(
DEMOGRAPHICS_PROMPT_KEY
)===
'1';

}catch{}


if(prompted)
return;


if(
!home?.classList.contains(
'active-screen'
)
)
return;


if(
$('daily-decision-modal')
?.classList
.contains(
'open'
)
)
return;


if(
$('boss-promo-ad-overlay')
?.classList
.contains(
'open'
)
)
return;


ensureDemographicsPrompt();


const overlay=
$('boss-demographics-overlay');


if(overlay){

overlay.classList.add(
'open'
);

document.body.style.overflow=
'hidden';

}

}


function closeDemographicsPrompt(
markPrompted=true
){

const overlay=
$('boss-demographics-overlay');


if(overlay)
overlay.classList.remove(
'open'
);


document.body.style.overflow=
'';


if(markPrompted){

try{

localStorage.setItem(
DEMOGRAPHICS_PROMPT_KEY,
'1'
);

}catch{}

}

}


async function saveDemographicsProfile(){

const age=
$('boss-demo-age')
?.value||
'';


const gender=
$('boss-demo-gender')
?.value||
'';


if(
!age&&
!gender
)
return;


try{

await fetch(
`${API}/analytics/profile`,
{

method:
'POST',

headers:{

'Content-Type':
'application/json',

'Accept':
'application/json'

},

body:
JSON.stringify({

visitor_id:
BOSS_VISITOR_ID,

age_range:
age||
'prefer-not-to-say',

gender:
gender||
'prefer-not-to-say'

})

}
);


try{

localStorage.setItem(

DEMOGRAPHICS_PROFILE_KEY,

JSON.stringify({

age_range:
age,

gender

})

);


localStorage.setItem(
DEMOGRAPHICS_PROMPT_KEY,
'1'
);

}catch{}


closeDemographicsPrompt(
false
);

}catch{}

}


/* =========================================================
   B.O.S.S CODE GO SHARED UI UPGRADES
========================================================= */

(function injectBossCodeGoStyles(){

if(
document.getElementById(
'boss-code-go-runtime-styles'
)
)
return;


const style=
document.createElement(
'style'
);


style.id=
'boss-code-go-runtime-styles';


style.textContent=`

html{
scrollbar-color:#F5C518 #111;
scrollbar-width:thin
}

*{
scrollbar-color:#F5C518 #111;
scrollbar-width:thin
}

*::-webkit-scrollbar{
width:10px;
height:10px
}

*::-webkit-scrollbar-track{
background:#111
}

*::-webkit-scrollbar-thumb{
background:#F5C518;
border-radius:999px;
border:2px solid #111
}

.boss-return-home-bottom{
display:block;
width:min(420px,88%);
margin:42px auto 22px;
border:2px solid #d40000;
border-radius:999px;
background:#090909;
color:#fff;
padding:14px 20px;
font:inherit;
font-weight:900;
letter-spacing:.08em;
cursor:pointer
}

.boss-return-home-bottom:hover{
background:#d40000
}

.music-track{
grid-template-columns:58px 54px minmax(0,1fr) auto 45px!important
}

.track-cover{
width:54px;
height:54px;
border-radius:10px;
overflow:hidden;
background:#111;
border:1px solid #2a2a2a
}

.track-cover img{
width:100%;
height:100%;
object-fit:cover;
display:block
}

.artist-media-grid{
display:grid;
grid-template-columns:repeat(3,minmax(0,1fr));
gap:14px
}

.artist-media-card{
border:1px solid #282828;
border-radius:16px;
background:#090909;
overflow:hidden;
color:#fff;
padding:0;
text-align:left;
cursor:pointer
}

.artist-media-card img{
width:100%;
aspect-ratio:1/1;
object-fit:cover;
display:block
}

.artist-media-card.video img{
aspect-ratio:16/9
}

.artist-media-card-body{
padding:12px
}

.artist-media-card-body strong{
display:block
}

.artist-media-card-body span{
display:block;
color:#F5C518;
font-size:9px;
font-weight:900;
margin-top:4px
}

.artist-media-empty{
padding:20px;
border:1px dashed #333;
border-radius:14px;
color:#777;
text-align:center
}

.artist-media-lightbox{
position:fixed;
inset:0;
z-index:20000;
background:rgba(0,0,0,.96);
display:none;
align-items:center;
justify-content:center;
padding:24px
}

.artist-media-lightbox.open{
display:flex
}

.artist-media-lightbox img{
max-width:92vw;
max-height:86vh;
object-fit:contain
}

.artist-media-lightbox button,
.resource-viewer-close{
position:absolute;
top:20px;
right:22px;
width:48px;
height:48px;
border-radius:50%;
border:2px solid #d40000;
background:#000;
color:#fff;
font-size:24px;
cursor:pointer
}

.resource-viewer{
position:fixed;
inset:0;
z-index:21000;
background:#000;
display:none;
padding:72px 16px 16px
}

.resource-viewer.open{
display:block
}

.resource-viewer iframe{
width:100%;
height:100%;
border:1px solid #333;
border-radius:14px;
background:#fff
}

.dm-resource-grid{
display:grid;
grid-template-columns:repeat(3,minmax(0,1fr));
gap:16px
}

.dm-resource-card{
background:#0b0b0b;
border:1px solid #292929;
border-radius:18px;
overflow:hidden
}

.dm-resource-card img{
width:100%;
aspect-ratio:3/4;
object-fit:cover;
display:block
}

.dm-resource-body{
padding:16px
}

.dm-resource-body span{
color:#F5C518;
font-size:9px;
font-weight:900
}

.dm-resource-body p{
color:#999;
line-height:1.5;
margin:8px 0 14px
}

.dm-resource-button{
border:2px solid #F5C518;
border-radius:999px;
background:transparent;
color:#F5C518;
padding:10px 14px;
font-weight:900;
cursor:pointer
}

.dm-session-media{
width:150px;
flex:0 0 150px;
background:#000;
position:relative
}

.dm-session-media img{
width:100%;
height:100%;
min-height:150px;
object-fit:cover;
display:block
}

.dm-session-media iframe{
width:100%;
height:100%;
min-height:150px;
border:0;
display:block
}

.dm-session-play{
position:absolute;
inset:0;
border:0;
background:rgba(0,0,0,.25);
color:#fff;
font-size:34px;
cursor:pointer
}

.action-card-thumb{
width:100%;
aspect-ratio:16/9;
object-fit:cover;
border-radius:12px;
margin-bottom:14px
}

.boss-promo-ad-overlay,
.boss-demographics-overlay{
position:fixed;
inset:0;
z-index:30000;
background:rgba(0,0,0,.94);
display:none;
align-items:center;
justify-content:center;
padding:20px
}

.boss-promo-ad-overlay.open,
.boss-demographics-overlay.open{
display:flex
}

.boss-promo-ad-card{
position:relative;
width:min(560px,100%);
max-height:92vh;
overflow:auto;
background:#080808;
border:1px solid #333;
border-radius:22px;
box-shadow:0 24px 70px rgba(0,0,0,.65)
}

.boss-promo-ad-close{
position:absolute;
z-index:3;
top:12px;
right:12px;
width:42px;
height:42px;
border-radius:50%;
border:2px solid #fff;
background:rgba(0,0,0,.82);
color:#fff;
font-size:26px;
line-height:1;
cursor:pointer
}

.boss-promo-ad-sponsored{
position:absolute;
z-index:2;
top:16px;
left:16px;
background:#F5C518;
color:#000;
border-radius:999px;
padding:7px 10px;
font-size:9px;
font-weight:900;
letter-spacing:.12em
}

.boss-promo-ad-media{
background:#000;
min-height:180px
}

.boss-promo-ad-media img,
.boss-promo-ad-media video{
display:block;
width:100%;
max-height:56vh;
object-fit:contain;
background:#000
}

.boss-promo-ad-copy{
padding:18px
}

.boss-promo-ad-copy h2{
font-size:24px;
line-height:1.1;
margin:0 0 8px
}

.boss-promo-ad-copy p{
color:#aaa;
line-height:1.5;
margin:0 0 15px
}

.boss-promo-ad-cta{
width:100%;
border:0;
border-radius:999px;
background:#d40000;
color:#fff;
padding:14px;
font:inherit;
font-weight:900;
cursor:pointer
}

.boss-demographics-card{
width:min(470px,100%);
background:#090909;
border:1px solid #333;
border-radius:22px;
padding:22px
}

.boss-demographics-card>span{
color:#F5C518;
font-size:9px;
font-weight:900;
letter-spacing:.14em
}

.boss-demographics-card h2{
font-size:24px;
margin:6px 0 8px
}

.boss-demographics-card p{
color:#999;
line-height:1.5;
margin-bottom:16px
}

.boss-demographics-card label{
display:block;
font-size:9px;
font-weight:900;
margin:12px 0 6px
}

.boss-demographics-card select{
width:100%;
min-height:46px;
border:1px solid #333;
border-radius:12px;
background:#050505;
color:#fff;
padding:0 12px
}

.boss-demographics-actions{
display:flex;
gap:10px;
margin-top:16px
}

.boss-demographics-actions button{
flex:1;
border-radius:999px;
padding:12px;
border:1px solid #333;
background:#151515;
color:#fff;
font-weight:900;
cursor:pointer
}

#boss-demo-save{
background:#d40000;
border-color:#d40000
}

.magazine-issue-grid{
display:grid;
grid-template-columns:repeat(3,minmax(0,1fr));
gap:16px;
padding:12px 0 24px
}

.magazine-issue-card{
display:block;
border:1px solid #292929;
border-radius:18px;
background:#090909;
color:#fff;
overflow:hidden;
text-align:left;
cursor:pointer;
padding:0
}

.magazine-issue-card img{
width:100%;
aspect-ratio:3/4;
object-fit:cover;
background:#111;
display:block
}

.magazine-issue-card div{
padding:14px
}

.magazine-issue-card small{
display:block;
color:#F5C518;
font-weight:900;
margin-bottom:5px
}

.magazine-issue-card strong{
display:block;
font-size:17px
}

.magazine-issue-card p{
color:#999;
line-height:1.4;
margin-top:7px
}

@media(max-width:750px){

.music-track{
grid-template-columns:34px 46px minmax(0,1fr) 36px!important
}

.track-cover{
width:46px;
height:46px
}

.artist-media-grid,
.dm-resource-grid,
.magazine-issue-grid{
display:flex;
overflow-x:auto
}

.artist-media-card,
.dm-resource-card,
.magazine-issue-card{
flex:0 0 76%
}

.dm-session-media{
width:110px;
flex-basis:110px
}

.boss-demographics-actions{
flex-direction:column
}

}

`;


document.head.appendChild(
style
);

})();


/* =========================================================
   SCREEN NAVIGATION
========================================================= */

function showScreen(s){

if(!s)
return;


qa(
'.screen'
)
.forEach(
x=>
x.classList.remove(
'active-screen'
)
);


s.classList.add(
'active-screen'
);


ensureReturnHomeButtons();


const section=
analyticsSectionFromScreen(
s
);


if(section)
trackPageOpen(
section
);


window.scrollTo({

top:0,

behavior:
'smooth'

});


if(
s.id===
'boss-bite-screen'
&&
bossBiteMap
){

setTimeout(

()=>bossBiteMap.resize(),

250

);

}


if(
s.id===
'boss-code-tv-screen'
){

renderLive();

}

}


const home=
$('home-screen');

const bite=
$('boss-bite-screen');

const tv=
$('boss-code-tv-screen');

const dm=
$('decision-makers-screen');

const check=
$('boss-checkin-screen');

const music=
$('music-screen');


function ensureReturnHomeButtons(){

const defs=[

[
'boss-bite-screen',
'boss-bite-back'
],

[
'boss-code-tv-screen',
'boss-code-tv-back'
],

[
'decision-makers-screen',
'decision-makers-back'
],

[
'boss-checkin-screen',
'boss-checkin-back'
],

[
'music-screen',
'music-back'
],

[
'contact-screen',
'contact-back'
],

[
'support-screen',
'support-back'
],

[
'the-code-clothing-screen',
'the-code-clothing-back'
]

];


defs.forEach(
([
screenId,
topId
])=>{

const screen=
$(screenId);


if(!screen)
return;


const top=
$(topId);


if(top)
top.textContent=
'RETURN TO HOME';


let b=
screen.querySelector(
'.boss-return-home-bottom'
);


if(!b){

b=
document.createElement(
'button'
);


b.type=
'button';

b.className=
'boss-return-home-bottom';

b.textContent=
'RETURN TO HOME';


b.addEventListener(
'click',
()=>{

if(
screenId===
'decision-makers-screen'
)
stopDM();


if(
screenId===
'music-screen'
&&
audio
&&
!audio.paused
)
audio.pause();


showScreen(
home
);

}
);

}


const footer=
screen.querySelector(
'.boss-footer, .contact-footer'
);


if(footer){

footer.insertAdjacentElement(
'beforebegin',
b
);

}
else{

screen.appendChild(
b
);

}

}
);

}


/* =========================================================
   CONTACT SCREEN
========================================================= */

function ensureContactScreen(){

let screen=
$('contact-screen');


if(screen)
return screen;


if(
!$('boss-code-contact-styles')
){

const style=
document.createElement(
'style'
);


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


document.head.appendChild(
style
);

}


screen=
document.createElement(
'div'
);


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


document.body.appendChild(
screen
);


return screen;

}


const contact=
ensureContactScreen();


/* =========================================================
   SUPPORT IS A DECISION
========================================================= */

let selectedSupportAmountCents=
0;


function ensureSupportScreen(){

let screen=
$('support-screen');


if(screen)
return screen;


if(
!$('boss-code-support-styles')
){

const style=
document.createElement(
'style'
);


style.id=
'boss-code-support-styles';


style.textContent=`

#support-screen{
background:#000;
color:#fff;
min-height:100vh;
}

#support-screen .support-wrap{
width:min(940px,calc(100% - 32px));
margin:0 auto;
padding:24px 0 56px;
}

#support-screen .support-back{
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

#support-screen .support-back:hover{
border-color:#f5c518;
color:#f5c518;
}

#support-screen .support-hero{
text-align:center;
margin:0 auto 28px;
}

#support-screen .support-logo{
width:min(230px,60vw);
height:auto;
margin:0 auto 18px;
display:block;
}

#support-screen .support-kicker{
display:block;
color:#f5c518;
font-size:11px;
font-weight:900;
letter-spacing:.18em;
margin-bottom:8px;
}

#support-screen .support-hero h1{
margin:0 0 12px;
font-size:clamp(34px,7vw,62px);
line-height:.95;
letter-spacing:.01em;
}

#support-screen .support-hero p{
margin:0 auto;
max-width:720px;
color:#bbb;
font-size:15px;
line-height:1.65;
}

#support-screen .support-principle{
margin:18px auto 0;
max-width:650px;
border:1px solid rgba(245,197,24,.35);
background:rgba(245,197,24,.06);
border-radius:18px;
padding:16px 18px;
color:#fff;
font-weight:900;
line-height:1.5;
}

#support-screen .support-card{
background:linear-gradient(180deg,#0d0d0d,#050505);
border:2px solid #d72f22;
border-radius:28px;
padding:clamp(20px,4vw,34px);
box-shadow:0 0 0 1px rgba(245,197,24,.15) inset;
}

#support-screen .support-card-title{
text-align:center;
margin-bottom:20px;
}

#support-screen .support-card-title span{
display:block;
color:#f5c518;
font-size:10px;
font-weight:900;
letter-spacing:.18em;
margin-bottom:6px;
}

#support-screen .support-card-title h2{
margin:0;
font-size:clamp(24px,5vw,36px);
}

#support-screen .support-amount-grid{
display:grid;
grid-template-columns:repeat(4,minmax(0,1fr));
gap:12px;
margin:20px 0;
}

#support-screen .support-amount{
appearance:none;
border:1px solid #363636;
background:#080808;
color:#fff;
border-radius:18px;
min-height:112px;
padding:18px 10px;
font:inherit;
cursor:pointer;
transition:.18s ease;
}

#support-screen .support-amount:hover,
#support-screen .support-amount.selected{
border-color:#f5c518;
background:#151100;
transform:translateY(-2px);
}

#support-screen .support-amount strong{
display:block;
font-size:30px;
line-height:1;
color:#fff;
}

#support-screen .support-amount span{
display:block;
margin-top:9px;
color:#f5c518;
font-size:9px;
font-weight:900;
letter-spacing:.1em;
line-height:1.35;
}

#support-screen .support-shirt-tag{
display:inline-block!important;
margin-top:7px!important;
border-radius:999px;
background:#d72f22;
color:#fff!important;
padding:5px 8px;
font-size:8px!important;
}

#support-screen .support-custom{
border-top:1px solid #252525;
border-bottom:1px solid #252525;
padding:18px 0;
margin:6px 0 20px;
}

#support-screen .support-custom label,
#support-screen .support-field label{
display:block;
margin-bottom:8px;
font-size:11px;
font-weight:900;
letter-spacing:.08em;
color:#f5c518;
}

#support-screen .support-custom-row{
display:grid;
grid-template-columns:auto 1fr;
align-items:center;
gap:8px;
}

#support-screen .support-dollar{
height:52px;
min-width:52px;
display:grid;
place-items:center;
border:1px solid #343434;
border-radius:14px;
background:#050505;
color:#f5c518;
font-size:22px;
font-weight:900;
}

#support-screen .support-custom input,
#support-screen .support-field input,
#support-screen .support-field textarea{
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

#support-screen .support-custom input:focus,
#support-screen .support-field input:focus,
#support-screen .support-field textarea:focus{
border-color:#f5c518;
box-shadow:0 0 0 2px rgba(245,197,24,.12);
}

#support-screen .support-field{
margin-bottom:16px;
}

#support-screen .support-field textarea{
resize:vertical;
min-height:110px;
}

#support-screen .support-selected{
display:none;
margin:18px 0;
border-radius:18px;
background:#111;
border:1px solid #353535;
padding:18px;
text-align:center;
}

#support-screen .support-selected.show{
display:block;
}

#support-screen .support-selected span{
display:block;
color:#999;
font-size:9px;
font-weight:900;
letter-spacing:.14em;
}

#support-screen .support-selected strong{
display:block;
margin-top:5px;
font-size:30px;
color:#f5c518;
}

#support-screen .support-shirt-message{
display:none;
margin:12px 0 0;
border:1px solid rgba(215,47,34,.65);
background:rgba(215,47,34,.08);
border-radius:14px;
padding:12px 14px;
color:#fff;
font-size:12px;
font-weight:800;
line-height:1.5;
}

#support-screen .support-shirt-message.show{
display:block;
}

#support-screen .support-submit{
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
margin-top:4px;
}

#support-screen .support-submit:hover{
filter:brightness(1.08);
}

#support-screen .support-submit:disabled{
opacity:.55;
cursor:wait;
}

#support-screen .support-status{
min-height:24px;
margin-top:14px;
text-align:center;
font-weight:800;
line-height:1.5;
}

#support-screen .support-status.success{
color:#f5c518;
}

#support-screen .support-status.error{
color:#ff6666;
}

#support-screen .support-payment-note{
margin:16px auto 0;
max-width:700px;
color:#777;
font-size:11px;
line-height:1.6;
text-align:center;
}

#support-screen .support-footer{
margin-top:34px;
}

@media(max-width:760px){

#support-screen .support-amount-grid{
grid-template-columns:repeat(2,minmax(0,1fr));
}

}

@media(max-width:480px){

#support-screen .support-wrap{
width:min(100% - 22px,940px);
padding-top:16px;
}

#support-screen .support-card{
border-radius:22px;
}

#support-screen .support-amount{
min-height:100px;
}

}

`;


document.head.appendChild(
style
);

}


screen=
document.createElement(
'div'
);


screen.id=
'support-screen';

screen.className=
'screen';


screen.innerHTML=`

<div class="support-wrap">

<button
id="support-back"
class="support-back"
type="button"
>
← HOME
</button>


<header class="support-hero">

<img
class="support-logo"
src="images/boss-code-media-logo.png"
alt="B.O.S.S CODE MEDIA"
>

<span class="support-kicker">
WHAT YOU SUPPORT HELPS SHAPE WHAT CONTINUES
</span>

<h1>
SUPPORT IS A DECISION
</h1>

<p>
Your support helps B.O.S.S CODE MEDIA continue creating independent media, music, education, stories and opportunities.
</p>

<div class="support-principle">
Support is never required. It is a decision.
</div>

</header>


<section class="support-card">

<div class="support-card-title">

<span>
CHOOSE YOUR SUPPORT
</span>

<h2>
MAKE YOUR DECISION
</h2>

</div>


<div
id="support-amount-grid"
class="support-amount-grid"
>

<button
class="support-amount"
type="button"
data-amount-cents="500"
>
<strong>$5</strong>
<span>KEEP IT MOVING</span>
</button>

<button
class="support-amount"
type="button"
data-amount-cents="1000"
>
<strong>$10</strong>
<span>BUILD WITH US</span>
</button>

<button
class="support-amount"
type="button"
data-amount-cents="2000"
>
<strong>$20</strong>
<span>FUEL THE MISSION</span>
</button>

<button
class="support-amount"
type="button"
data-amount-cents="5000"
>
<strong>$50</strong>
<span>B.O.S.S CODE SUPPORTER</span>
<span class="support-shirt-tag">SHIRT ELIGIBLE</span>
</button>

</div>


<div class="support-custom">

<label for="support-custom-amount">
CUSTOM AMOUNT
</label>

<div class="support-custom-row">

<div class="support-dollar">
$
</div>

<input
id="support-custom-amount"
type="number"
min="1"
step="1"
inputmode="decimal"
placeholder="Enter amount"
>

</div>

</div>


<div
id="support-selected"
class="support-selected"
>

<span>
YOUR SUPPORT DECISION
</span>

<strong id="support-selected-amount">
$0
</strong>

<div
id="support-shirt-message"
class="support-shirt-message"
>
Support of $50 or more is eligible for a B.O.S.S CODE supporter shirt. Fulfillment details will be handled after successful payment.
</div>

</div>


<div class="support-field">

<label for="support-name">
NAME
</label>

<input
id="support-name"
type="text"
autocomplete="name"
placeholder="Your name"
>

</div>


<div class="support-field">

<label for="support-email">
EMAIL
</label>

<input
id="support-email"
type="email"
autocomplete="email"
placeholder="Your email address"
>

</div>


<div class="support-field">

<label for="support-message">
MESSAGE
</label>

<textarea
id="support-message"
rows="5"
placeholder="Optional message to B.O.S.S CODE MEDIA"
></textarea>

</div>


<button
id="support-submit"
class="support-submit"
type="button"
>
CONTINUE TO SUPPORT
</button>


<div
id="support-status"
class="support-status"
aria-live="polite"
></div>


<p class="support-payment-note">
Secure payment checkout is the next connection. No card is charged from this screen yet. Support is separate from course purchases and does not unlock paid courses.
</p>

</section>


<footer class="boss-footer support-footer">

<img
src="images/boss-code-media-logo.png"
alt="B.O.S.S CODE MEDIA"
>

<p>
GREATNESS IS A DECISION
</p>

</footer>

</div>

`;


document.body.appendChild(
screen
);


screen
.querySelectorAll(
'.support-amount'
)
.forEach(
button=>
button.addEventListener(
'click',
()=>selectSupportAmount(
Number(
button.dataset.amountCents||
0
)
)
)
);


on(
'support-custom-amount',
'input',
()=>{
const value=
Number(
$('support-custom-amount')
?.value||
0
);

selectSupportAmount(
Math.max(
0,
Math.round(
value*100
)
),
true
);
}
);


on(
'support-submit',
'click',
submitSupportIntent
);


return screen;

}


function selectSupportAmount(
amountCents,
fromCustom=false
){

selectedSupportAmountCents=
Math.max(
0,
Math.round(
Number(
amountCents||
0
)
)
);


qa(
'#support-screen .support-amount'
)
.forEach(
button=>{

const amount=
Number(
button.dataset.amountCents||
0
);


button.classList.toggle(
'selected',
!fromCustom&&
amount===
selectedSupportAmountCents
);

}
);


if(
!fromCustom&&
$('support-custom-amount')
)
$('support-custom-amount')
.value=
'';


updateSupportSelection();

}


function updateSupportSelection(){

const box=
$('support-selected');

const amount=
$('support-selected-amount');

const shirt=
$('support-shirt-message');


if(
!box||
!amount
)
return;


if(
selectedSupportAmountCents<=0
){

box.classList.remove(
'show'
);

return;

}


box.classList.add(
'show'
);


amount.textContent=
`$${(
selectedSupportAmountCents/
100
).toFixed(
selectedSupportAmountCents%100
?
2
:
0
)}`;


if(shirt)
shirt.classList.toggle(
'show',
selectedSupportAmountCents>=5000
);

}


async function submitSupportIntent(){

const status=
$('support-status');

const button=
$('support-submit');


if(status){

status.className=
'support-status';

status.textContent=
'';

}


if(
selectedSupportAmountCents<=0
){

if(status){

status.className=
'support-status error';

status.textContent=
'CHOOSE A SUPPORT AMOUNT.';

}

return;

}


const name=
$('support-name')
?.value
.trim()||
'';


const email=
$('support-email')
?.value
.trim()
.toLowerCase()||
'';


const message=
$('support-message')
?.value
.trim()||
'';


if(
!email||
!/^\S+@\S+\.\S+$/.test(
email
)
){

if(status){

status.className=
'support-status error';

status.textContent=
'ENTER A VALID EMAIL ADDRESS.';

}

return;

}


if(button){

button.disabled=
true;

button.textContent=
'SAVING YOUR DECISION...';

}


try{

const response=
await fetch(
`${API}/support/contributions`,
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

amount_cents:
selectedSupportAmountCents,

currency:
'usd',

provider:
'stripe',

payment_method:
'',

transaction_id:
'',

message

})

}
);


let data={};


try{

data=
await response.json();

}catch{}


if(
!response.ok||
data.success===
false
){

throw Error(
data.error||
data.message||
'Unable to save your support decision.'
);

}


trackAnalytics(
'support_intent',
{

section:
'support',

itemId:
data.data?.id||
'',

itemTitle:
'SUPPORT IS A DECISION',

valueNumeric:
selectedSupportAmountCents/
100,

detail:{

shirt_eligible:
Boolean(
data.data?.shirt_reward_eligible
)

}

}
);


if(status){

status.className=
'support-status success';

status.textContent=
data.data?.shirt_reward_eligible
?
'SUPPORT DECISION SAVED. YOU ARE IN THE SHIRT ELIGIBLE LEVEL. NO CHARGE HAS BEEN MADE YET.'
:
'SUPPORT DECISION SAVED. NO CHARGE HAS BEEN MADE YET.';

}


if(button)
button.textContent=
'READY FOR SECURE CHECKOUT';


}catch(error){

console.warn(
'Support submission error',
error
);


if(status){

status.className=
'support-status error';

status.textContent=
error.message||
'YOUR SUPPORT DECISION COULD NOT BE SAVED. PLEASE TRY AGAIN.';

}


if(button)
button.textContent=
'CONTINUE TO SUPPORT';

}
finally{

if(button)
button.disabled=
false;

}

}


const support=
ensureSupportScreen();


ensureReturnHomeButtons();


/* =========================================================
   NAVIGATION EVENTS
========================================================= */

on(
'boss-bite-button',
'click',
()=>openWithPromo(
'boss-bite',
()=>{

showScreen(
bite
);

initMap();

}
)
);


on(
'boss-bite-back',
'click',
()=>showScreen(
home
)
);


on(
'boss-code-tv-button',
'click',
()=>openWithPromo(
'boss-code-tv',
()=>showScreen(
tv
)
)
);


on(
'boss-code-tv-back',
'click',
()=>{

buildTv();

showScreen(
home
);

}
);


on(
'decision-makers-button',
'click',
()=>openWithPromo(
'decision-makers',
()=>showScreen(
dm
)
)
);


on(
'decision-makers-back',
'click',
()=>{

stopDM();

showScreen(
home
);

}
);


on(
'boss-checkin-button',
'click',
()=>openWithPromo(
'boss-checkin',
()=>{

showScreen(
check
);

showCheckIntro();

}
)
);


on(
'boss-checkin-back',
'click',
()=>showScreen(
home
)
);


on(
'music-button',
'click',
()=>openWithPromo(
'music',
()=>{

showScreen(
music
);

renderArtists();

}
)
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


showScreen(
home
);

}
);


on(
'contact-button',
'click',
()=>showScreen(
contact
)
);


on(
'contact-back',
'click',
()=>showScreen(
home
)
);


on(
'support-button',
'click',
()=>showScreen(
support
)
);


on(
'support-back',
'click',
()=>showScreen(
home
)
);


on(
'go-to-decision-makers',
'click',
()=>openWithPromo(
'decision-makers',
()=>showScreen(
dm
)
)
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
!/^\S+@\S+\.\S+$/.test(
email
)
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

button.disabled=
true;

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
data.success===
false
){

throw Error(

data.error||
data.message||
'Unable to send message.'

);

}


if(
$('contact-name')
)
$('contact-name')
.value='';


if(
$('contact-email')
)
$('contact-email')
.value='';


if(
$('contact-type')
)
$('contact-type')
.value=
'General Inquiry';


if(
$('contact-message')
)
$('contact-message')
.value='';


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

button.disabled=
false;

button.textContent=
'SEND MESSAGE';

}


}

}
);


/* =========================================================
   DAILY DECISION
   PERMANENT BANK + ADMIN ADDITIONS
========================================================= */

const builtDaily=[

[
'Finish one thing you have been avoiding before you start something new.',
'Choose the unfinished task that has been following you around and complete the next real step today.'
],

[
'Stop waiting for somebody else to believe in an idea you already know deserves a chance.',
'Take one action toward the idea without asking anyone for permission.'
],

[
'Protect the first hour of your day from unnecessary noise.',
'Give your first focused hour to something that moves your life forward.'
],

[
'Do the important thing before the easy thing.',
'Identify the task with the greatest impact and work on it first.'
],

[
'Stop measuring your beginning against somebody else’s middle.',
'Return your attention to one measurable step on your own path.'
],

[
'Choose discipline over mood for one hour.',
'Work on the goal for one uninterrupted hour whether you feel motivated or not.'
],

[
'Make a decision your future self will thank you for.',
'Choose one action today that improves tomorrow instead of only comforting today.'
],

[
'Finish what you said you would finish.',
'Pick one promise you made to yourself and honor it before the day ends.'
],

[
'Do not let one bad moment become a bad day.',
'Reset your attention and make the next decision a useful one.'
],

[
'Choose progress that can be measured.',
'Complete one task you can point to at the end of the day.'
],

[
'Stop making fear sound like wisdom.',
'Ask whether the concern is a real fact or simply discomfort about moving.'
],

[
'Stop waiting for the perfect conditions.',
'Use what you have and create the best next version possible.'
],

[
'Protect your attention like it has value, because it does.',
'Turn off one source of interruption during your most important work.'
],

[
'Do not confuse being busy with moving forward.',
'Remove one low value task and replace it with meaningful progress.'
],

[
'Use your talent instead of only talking about it.',
'Create, practice, publish or perform something today.'
],

[
'Stop negotiating with a task you already decided matters.',
'Start it now for ten minutes and let momentum take over.'
],

[
'Create before you consume.',
'Make something of your own before opening entertainment or social media.'
],

[
'Stop waiting to feel confident before acting.',
'Take the action that confidence is supposed to help you take.'
],

[
'Turn one excuse into a plan.',
'Take the obstacle you keep naming and write one practical way around it.'
],

[
'Choose consistency over intensity.',
'Do the smaller action you can repeat instead of waiting for a dramatic burst of motivation.'
],

[
'Do not let perfection delay something useful.',
'Release, send, post or finish the version that is ready enough to move.'
],

[
'Make your next hour intentional.',
'Decide exactly what the next sixty minutes are for before they disappear.'
],

[
'Create a boundary before resentment creates one for you.',
'Communicate one limit clearly and respectfully today.'
],

[
'Stop using preparation to hide from execution.',
'Move one idea from planning into real world action today.'
],

[
'Do not let uncertainty become inactivity.',
'Take the step that remains sensible even without knowing the whole path.'
],

[
'Choose responsibility over excuses.',
'Name what is within your control and take action on that part today.'
],

[
'Make today’s decision something you can prove with action.',
'Before the day ends, create visible evidence that you followed through.'
]

];


let daily=[
...builtDaily
];


const DK=
'boss-code-daily-decision-v3';


const DAY=
86400000;


function dailyState(){

let s;


try{

s=
JSON.parse(

localStorage.getItem(
DK
)
||
'null'

);

}catch{}


const now=
Date.now();


if(
!s||
!Number.isInteger(
s.i
)||
!s.t
){

s={

i:
daily.length
?
Math.floor(
now/
DAY
)
%
daily.length
:
0,

t:
now,

seen:
false

};

}


const c=
Math.floor(

(
now-
s.t
)
/
DAY

);


if(
c>
0
){

if(
daily.length
){

s.i=
(
s.i+
c
)
%
daily.length;

}
else{

s.i=
0;

}


s.t+=
c*
DAY;


s.seen=
false;

}


if(
daily.length&&
s.i>=
daily.length
){

s.i=
0;

}


localStorage.setItem(

DK,

JSON.stringify(
s
)

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


if(
!daily.length
){

if(number){

number.textContent=
'TODAY';

}


if(title){

title.textContent=
'CHECK BACK FOR TODAY’S DECISION';

}


if(move){

move.textContent=
'New Daily Decisions are controlled from B.O.S.S CODE GO Admin.';

}


if(preview){

preview.textContent=
'CHECK BACK FOR TODAY’S DECISION';

}


if(confirmation){

confirmation.textContent=
'';

}


return;

}


const s=
dailyState();


const d=
daily[
s.i
];


if(!d)
return;


if(number){

number.textContent=
'DECISION '+
String(
s.i+
1
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

if(
!daily.length
)
return;


const state=
dailyState();


const current=
daily[
state.i
];


trackAnalytics(
'daily_decision_view',
{

section:
'home',

itemId:
state.i,

itemTitle:
current?.[0]||
"TODAY'S DECISION"

}
);


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

JSON.stringify(
s
)

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

if(
!daily.length
)
return;


const s=
dailyState();


s.seen=
true;


localStorage.setItem(

DK,

JSON.stringify(
s
)

);


const current=
daily[
s.i
];


trackAnalytics(
'daily_decision_made',
{

section:
'home',

itemId:
s.i,

itemTitle:
current?.[0]||
"TODAY'S DECISION"

}
);


renderDaily();


setTimeout(

()=>closeDaily(
false
),

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
){

openDaily();

}

},
700
);

}
else if(
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

let musicAnalyticsTrack=null;

let musicAnalyticsLastTime=0;

let musicAnalyticsQualifiedSeconds=0;

let musicAnalyticsQualifiedSent=false;

const audio=
$('boss-music-audio');


function musicYoutubeId(url=''){

for(
const r of[

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


if(footer){

footer.insertAdjacentElement(
'beforebegin',
section
);

}
else{

wrap.appendChild(
section
);

}

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


if(gallery){

gallery.insertAdjacentElement(
'afterend',
section
);

}
else if(footer){

footer.insertAdjacentElement(
'beforebegin',
section
);

}
else{

wrap.appendChild(
section
);

}

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


document.body.appendChild(
box
);


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
){

closeArtistPhoto();

}

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


document.body.appendChild(
box
);


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
){

closeArtistVideo();

}

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


if(box){

box.classList.remove(
'open'
);

}


if(image){

image.removeAttribute(
'src'
);

}


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
){

audio.pause();

}


trackAnalytics(
'video_play',
{

section:
'music',

itemId:
item.id||
item.backendId||
id,

itemTitle:
item.title||
'MUSIC VIDEO',

detail:{

artist:
activeArtist?.name||
''

}

}
);


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


if(box){

box.classList.remove(
'open'
);

}


if(frame){

frame.src='';

}


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


if(
!artists.length
){

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


g.appendChild(
b
);

}
);


updateArtistUI();

renderArtistGallery();

renderArtistMusicVideos();

}


function clearMusicArtistUI(){

activeArtist=
null;


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


const title=
q(
'.featured-release-info h2'
);

const artist=
q(
'.featured-artist'
);

const label=
q(
'.featured-label'
);

const description=
q(
'.featured-description'
);

const cover=
q(
'.placeholder-cover'
);


if(title){

title.textContent=
'NO RELEASE AVAILABLE';

}


if(artist){

artist.textContent=
'B.O.S.S CODE MUSIC';

}


if(label){

label.textContent=
'MUSIC';

}


if(description){

description.textContent=
'New music will appear here when it is published from Admin.';

}


if(cover){

cover.innerHTML=`

<img
src="images/boss-code-media-logo.png"
alt="B.O.S.S CODE MEDIA"
>

`;

}


if(
$('music-track-list')
){

$('music-track-list').innerHTML=
'<div class="artist-media-empty">NO TRACKS PUBLISHED.</div>';

}


const releases=
q(
'.release-grid'
);


if(releases){

releases.innerHTML=
'<div class="artist-media-empty">NO RELEASES PUBLISHED.</div>';

}


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

activeReleaseId=
null;


renderArtists();

renderTracks();

renderReleases();

updateArtistUI();

renderArtistGallery();

renderArtistMusicVideos();

resetPlayer();

}


function updateArtistUI(){

if(
!activeArtist
){

clearMusicArtistUI();

return;

}


const banner=
$('selected-artist-banner');


if(banner){

banner.innerHTML=`

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


banner.classList.add(
'show'
);

}


const logo=
q(
'#music-screen .music-artist-logo'
);


if(logo){

logo.src=
activeArtist.image||
'images/boss-code-media-logo.png';


logo.alt=
activeArtist.name;

}


const featured=
activeArtist.featuredRelease;


const title=
q(
'.featured-release-info h2'
);

const artist=
q(
'.featured-artist'
);

const label=
q(
'.featured-label'
);

const description=
q(
'.featured-description'
);

const cover=
q(
'.placeholder-cover'
);


if(
!featured
){

if(title){

title.textContent=
'NO RELEASE AVAILABLE';

}


if(artist){

artist.textContent=
activeArtist.name.toUpperCase();

}


if(label){

label.textContent=
'B.O.S.S CODE MUSIC';

}


if(description){

description.textContent=
'New releases will appear here when they are published.';

}


if(cover){

cover.innerHTML=`

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


if(title){

title.textContent=
featured.title;

}


if(artist){

artist.textContent=
activeArtist.name.toUpperCase();

}


if(label){

label.textContent=
featured.type||
'FEATURED RELEASE';

}


if(description){

description.textContent=
featured.description||
'';

}


if(cover){

cover.innerHTML=`

<img
src="${esc(
featured.artwork||
activeArtist.image||
'images/boss-code-media-logo.png'
)}"
alt="${esc(featured.title)}"
>

`;

}


const featuredButton=
$('play-featured-release');


if(featuredButton){

const type=
String(
featured.releaseType||
featured.type||
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


if(
!activeArtist
){

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


if(
!rows.length
){

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
alt="${esc(
item.caption||
activeArtist.name
)}"
>

<div class="artist-media-card-body">

<strong>
${esc(
item.caption||
activeArtist.name
)}
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


g.appendChild(
b
);

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


if(
!activeArtist
){

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


if(
!rows.length
){

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


g.appendChild(
b
);

}
);

}


function releaseTrackIndexes(
release
){

if(
!release||
!activeArtist
)
return[];


const releaseId=
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
item=>{

if(
releaseId!==null&&
releaseId!==undefined&&
item.t.releaseId!==null&&
item.t.releaseId!==undefined&&
String(item.t.releaseId)===
String(releaseId)
){

return true;

}


return(
title&&
String(
item.t.album||
''
)
.trim()
.toLowerCase()===
title
);

}
)

.map(
item=>
item.i
);

}


function playRelease(
release
){

const indexes=
releaseTrackIndexes(
release
);


if(
!indexes.length
)
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


activeArtist.tracks.forEach(
(t,i)=>{

const row=
document.createElement(
'article'
);


row.className=
'music-track';


row.dataset.track=
i;


const artwork=
t.artwork||
activeArtist.featuredRelease?.artwork||
activeArtist.image||
'images/boss-code-media-logo.png';


row.innerHTML=`

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


row.onclick=
()=>playTrack(i);


g.appendChild(
row
);

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


activeArtist.releases.forEach(
release=>{

const card=
document.createElement(
'article'
);


card.className=
'release-card';


card.style.cursor=
'pointer';


const type=
String(
release.releaseType||
release.type||
''
)
.toLowerCase();


const single=
type.includes(
'single'
);


card.innerHTML=`

<div class="release-placeholder">

<img
src="${esc(
release.artwork||
activeArtist.image||
'images/boss-code-media-logo.png'
)}"
alt="${esc(release.title)}"
>

</div>

<div class="release-info">

<span>
${esc(release.type||'RELEASE')}
</span>

<h3>
${esc(release.title)}
</h3>

<p>
${single?'▶ PLAY SINGLE':'▶ PLAY ALBUM'}
</p>

</div>

`;


card.onclick=
()=>playRelease(
release
);


g.appendChild(
card
);

}
);

}


/* =========================================================
   MUSIC ANALYTICS
========================================================= */

function resetMusicAnalyticsForTrack(
track,
index
){

musicAnalyticsTrack={

itemId:
track.backendId||
track.id||
`${activeArtist?.backendId||activeArtist?.id||'artist'}:${index}`,

itemTitle:
track.title||
'TRACK',

artist:
activeArtist?.name||
'',

album:
track.album||
''

};


musicAnalyticsLastTime=
0;


musicAnalyticsQualifiedSeconds=
0;


musicAnalyticsQualifiedSent=
false;


trackAnalytics(
'song_start',
{

section:
'music',

itemId:
musicAnalyticsTrack.itemId,

itemTitle:
musicAnalyticsTrack.itemTitle,

detail:{

artist:
musicAnalyticsTrack.artist,

album:
musicAnalyticsTrack.album

}

}
);

}


function updateQualifiedMusicListen(){

if(
!audio||
!musicAnalyticsTrack||
musicAnalyticsQualifiedSent||
audio.paused
)
return;


const current=
Number(
audio.currentTime||
0
);


if(
Number.isFinite(
musicAnalyticsLastTime
)&&
musicAnalyticsLastTime>0
){

const delta=
current-
musicAnalyticsLastTime;


/*
Do not count a large jump as listening.
This prevents seeking ahead from creating
a false qualified listen.
*/

if(
delta>0&&
delta<2.5
){

musicAnalyticsQualifiedSeconds+=
delta;

}

}


musicAnalyticsLastTime=
current;


if(
musicAnalyticsQualifiedSeconds>=
SONG_QUALIFIED_SECONDS
){

musicAnalyticsQualifiedSent=
true;


trackAnalytics(
'song_qualified_listen',
{

section:
'music',

itemId:
musicAnalyticsTrack.itemId,

itemTitle:
musicAnalyticsTrack.itemTitle,

valueNumeric:
Math.round(
musicAnalyticsQualifiedSeconds
),

detail:{

artist:
musicAnalyticsTrack.artist,

album:
musicAnalyticsTrack.album,

qualified_seconds:
SONG_QUALIFIED_SECONDS

}

}
);

}

}


/* =========================================================
   MUSIC PLAYER
========================================================= */

function playTrack(i){

if(
!activeArtist||
!audio
)
return;


const track=
(
activeArtist.tracks||
[]
)[i];


if(!track)
return;


trackIndex=
i;


sourceIndex=
0;


qa(
'.music-track'
)
.forEach(
item=>
item.classList.remove(
'active'
)
);


const row=
q(
`.music-track[data-track="${i}"]`
);


if(row){

row.classList.add(
'active'
);

}


if(
$('now-playing-title')
){

$('now-playing-title')
.textContent=
track.title;

}


if(
$('now-playing-artist')
){

$('now-playing-artist')
.textContent=
activeArtist.name;

}


if(
$('now-playing-art')
){

$('now-playing-art')
.innerHTML=`

<img
src="${esc(
track.artwork||
activeArtist.featuredRelease?.artwork||
activeArtist.image||
'images/boss-code-media-logo.png'
)}"
alt="${esc(track.title)}"
>

`;

}


resetMusicAnalyticsForTrack(
track,
i
);


loadSource(
true
);

}


function loadSource(
play
){

if(
!activeArtist||
!audio
)
return;


const track=
(
activeArtist.tracks||
[]
)[trackIndex];


const src=
track?.audioSources?.[
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


musicAnalyticsTrack=
null;


musicAnalyticsLastTime=
0;


musicAnalyticsQualifiedSeconds=
0;


musicAnalyticsQualifiedSent=
false;


if(
$('now-playing-title')
){

$('now-playing-title')
.textContent=
'SELECT A TRACK';

}


if(
$('now-playing-artist')
){

$('now-playing-artist')
.textContent=
activeArtist
?
activeArtist.name
:
'B.O.S.S CODE MUSIC';

}


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
){

$('music-progress')
.value=
0;

}


if(
$('music-current-time')
){

$('music-current-time')
.textContent=
'0:00';

}


if(
$('music-duration')
){

$('music-duration')
.textContent=
'0:00';

}


if(
$('music-play-pause')
){

$('music-play-pause')
.textContent=
'▶';

}

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


if(
!queue.length
)
return;


let position=
queue.indexOf(
trackIndex
);


position=
position<0
?
0
:
(
position+
1
)%
queue.length;


playTrack(
queue[position]
);

}


function previousMusicTrack(){

const queue=
currentMusicQueue();


if(
!queue.length
)
return;


let position=
queue.indexOf(
trackIndex
);


position=
position<0
?
queue.length-
1
:
(
position-
1+
queue.length
)%
queue.length;


playTrack(
queue[position]
);

}


const fmt=
seconds=>
!Number.isFinite(
seconds
)
?
'0:00'
:
Math.floor(
seconds/
60
)
+
':'
+
String(
Math.floor(
seconds%
60
)
)
.padStart(
2,
'0'
);


/* =========================================================
   MUSIC CONTROLS
========================================================= */

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
){

playTrack(
0
);

}

return;

}


if(
audio.paused
){

audio.play()
.catch(()=>{});

}
else{

audio.pause();

}

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

if(
!activeArtist
)
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

activeReleaseId=
null;


playTrack(
0
);

}

}
);


on(
'music-progress',
'input',
event=>{

if(
audio?.duration
){

audio.currentTime=
(
Number(
event.target.value
)/
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

musicAnalyticsLastTime=
Number(
audio.currentTime||
0
);


if(
$('music-play-pause')
){

$('music-play-pause')
.textContent=
'Ⅱ';

}

}
);


audio.addEventListener(
'pause',
()=>{

musicAnalyticsLastTime=
Number(
audio.currentTime||
0
);


if(
$('music-play-pause')
){

$('music-play-pause')
.textContent=
'▶';

}

}
);


audio.addEventListener(
'timeupdate',
()=>{

updateQualifiedMusicListen();


if(
$('music-current-time')
){

$('music-current-time')
.textContent=
fmt(
audio.currentTime
);

}


if(
$('music-duration')
){

$('music-duration')
.textContent=
fmt(
audio.duration
);

}


if(
$('music-progress')
){

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

}
);


audio.addEventListener(
'ended',
nextMusicTrack
);


audio.addEventListener(
'error',
()=>{

if(
!activeArtist
)
return;


const track=
activeArtist.tracks?.[
trackIndex
];


if(
track&&
sourceIndex<
(
track.audioSources?.length||
0
)-
1
){

sourceIndex++;


loadSource(
true
);

}

}
);


}
/* =========================================================
   DECISION MAKERS
   APP VIDEO DISPLAY
   PROGRAM RESOURCES REMAIN OWNED BY
   decision-makers-backend.js
========================================================= */

let dmVideos=[];

let dmSessions=[];

let dmChallenges=[];


function yt(url=''){

return musicYoutubeId(
url
);

}


function playDMVideoInBox(
box,
videoId,
title,
analyticsId,
type='video'
){

if(
!box||
!videoId
)
return;


if(
audio&&
!audio.paused
){

audio.pause();

}


trackAnalytics(
'video_play',
{

section:
'decision-makers',

itemId:
analyticsId||
videoId,

itemTitle:
title||
'DECISION MAKERS VIDEO',

detail:{

video_type:
type

}

}
);


box.innerHTML=`

<iframe
data-dm-youtube
src="https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&enablejsapi=1"
title="${esc(title||'Decision Makers')}"
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

`;

}


function buildDM(){

const row=
q(
'#decision-makers-screen .on-the-go-row'
);


if(!row)
return;


row.innerHTML='';


if(
!dmVideos.length
){

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


const thumbnail=
v.thumbnailUrl||
`https://img.youtube.com/vi/${id}/hqdefault.jpg`;


const c=
document.createElement(
'article'
);


c.className=
'on-the-go-card';


c.innerHTML=`

<div
class="decision-placeholder-video"
data-dm-quick-media
style="
aspect-ratio:9/16;
background:#000;
overflow:hidden;
position:relative;
"
>

<img
src="${esc(thumbnail)}"
alt="${esc(v.title)}"
style="
width:100%;
height:100%;
object-fit:cover;
display:block;
"
>

<button
class="dm-session-play"
type="button"
aria-label="Play ${esc(v.title)}"
style="
position:absolute;
inset:0;
"
>
▶
</button>

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


const play=
q(
'.dm-session-play',
c
);


if(play){

play.addEventListener(
'click',
()=>{

const media=
q(
'[data-dm-quick-media]',
c
);


playDMVideoInBox(

media,

id,

v.title,

v.backendId||
v.id||
id,

'on-the-go'

);

}
);

}


row.appendChild(
c
);

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


if(
!dmSessions.length
){

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

const mediaBox=
q(
'[data-session-media]',
card
);


playDMVideoInBox(

mediaBox,

id,

session.title,

session.backendId||
session.id||
id,

'session'

);

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


if(message){

message.classList.remove(
'show'
);

}


if(
!dmChallenges.length
){

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

button.classList.add(
'accepted'
);


button.textContent=
'CHALLENGE ACCEPTED ✓';


if(
$('challenge-title')
){

$('challenge-title')
.textContent=
challenge.title||
'YOU MADE THE DECISION.';

}


if(
$('challenge-copy')
){

$('challenge-copy')
.textContent=
challenge.completionMessage||
'NOW TAKE ACTION.';

}


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


/*
IMPORTANT:
Decision Maker resources are intentionally NOT
rendered by app.js.

decision-makers-backend.js owns the official
Decision Maker Resource section.

This removes the duplicate lower resource card
that was appearing beneath the original
black/yellow DOWNLOAD FREE SAMPLE card.
*/


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

}


on(
'decision-makers-button',
'click',
renderDecisionMakers
);


/* =========================================================
   B.O.S.S CHECK IN
   PERMANENT BUILT IN BANK + ADMIN ADDITIONS
========================================================= */

const builtBank={

APPROVAL:[

'I change what I really want because I worry how people will react.',

'I feel pressure to explain my decisions so other people approve of them.',

'I hesitate to say no because I do not want to disappoint people.',

'Praise from other people strongly affects how confident I feel about my choices.',

'I sometimes choose what looks good instead of what is right for me.',

'I avoid a decision if I think people close to me may criticize it.'

],


COMPARISON:[

'Seeing other people succeed can make me question my own progress.',

'I compare my timeline to people who are further ahead.',

'Social media can make me feel like I should be doing more.',

'I sometimes change goals because somebody else appears to be winning with something different.',

'I judge my progress by what other people have instead of where I started.',

'I can lose focus on my own plan when I see somebody else moving faster.'

],


CONFIDENCE:[

'I delay action because I am not sure I can handle the result.',

'I second guess decisions even after I have enough information.',

'I sometimes need reassurance before I trust my own judgment.',

'I avoid opportunities because I worry I may not be ready.',

'A mistake can make me question my overall ability.',

'I find it difficult to speak confidently about what I want.'

],


ACTION:[

'I know what I need to do but still put it off.',

'I spend more time planning than executing.',

'I wait for motivation before doing important work.',

'I sometimes let discomfort stop a decision I know is necessary.',

'I start things but struggle to consistently finish them.',

'I delay a useful move while waiting for the perfect time.'

]

};


const bank={

APPROVAL:[
...builtBank.APPROVAL
],

COMPARISON:[
...builtBank.COMPARISON
],

CONFIDENCE:[
...builtBank.CONFIDENCE
],

ACTION:[
...builtBank.ACTION
]

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
){

$('checkin-intro')
.style.display=
'flex';

}


if(
$('checkin-questions')
){

$('checkin-questions')
.style.display=
'none';

}


if(
$('checkin-results')
){

$('checkin-results')
.style.display=
'none';

}

}


function startCheck(){

const available=
Object.entries(
bank
)
.flatMap(
([cat,arr])=>

shuffle(
arr
)

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


if(
!available.length
){

if(
$('checkin-question-text')
){

$('checkin-question-text')
.textContent=
'NO CHECK IN QUESTIONS ARE AVAILABLE RIGHT NOW.';

}


if(
$('checkin-intro')
){

$('checkin-intro')
.style.display=
'none';

}


if(
$('checkin-questions')
){

$('checkin-questions')
.style.display=
'block';

}


if(
$('checkin-answers')
){

$('checkin-answers')
.innerHTML=

'<div class="artist-media-empty">CHECK BACK SOON.</div>';

}


if(
$('previous-question')
){

$('previous-question')
.style.visibility=
'hidden';

}


return;

}


trackAnalytics(
'checkin_start',
{

section:
'boss-checkin',

itemTitle:
'B.O.S.S CHECK IN'

}
);


cq=
shuffle(
available
);


ci=
0;


resp=
new Array(
cq.length
)
.fill(
null
);


if(
$('checkin-intro')
){

$('checkin-intro')
.style.display=
'none';

}


if(
$('checkin-results')
){

$('checkin-results')
.style.display=
'none';

}


if(
$('checkin-questions')
){

$('checkin-questions')
.style.display=
'block';

}


renderQ();

}


function renderQ(){

const x=
cq[
ci
];


if(!x)
return;


const n=
ci+
1;


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
){

$('question-count')
.textContent=
`QUESTION ${n} OF ${total}`;

}


if(
$('progress-percent')
){

$('progress-percent')
.textContent=
`${p}%`;

}


if(
$('checkin-progress-bar')
){

$('checkin-progress-bar')
.style.width=
`${p}%`;

}


if(
$('question-category')
){

$('question-category')
.textContent=
x.cat;

}


if(
$('checkin-question-text')
){

$('checkin-question-text')
.textContent=
x.text;

}


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


if(
resp[
ci
]===
val
){

b.classList.add(
'selected'
);

}


b.onclick=
()=>{

resp[
ci
]=
val;


if(
ci<
total-
1
){

ci++;

renderQ();

}
else{

finishCheck();

}

};


a.appendChild(
b
);

}
);


if(
$('previous-question')
){

$('previous-question')
.style.visibility=
ci
?
'visible'
:
'hidden';

}

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
cats[
x.cat
]
){

cats[
x.cat
]
.push(
resp[
i
]??
0
);

}

}
);


const scores={};


Object.entries(
cats
)
.forEach(
([k,v])=>{

if(
!v.length
){

scores[
k
]=
100;

return;

}


scores[
k
]=
100-
Math.round(

v.reduce(
(a,b)=>a+b,
0
)
/
(
v.length*
4
)
*
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
)
/
4

);


if(
$('checkin-questions')
){

$('checkin-questions')
.style.display=
'none';

}


if(
$('checkin-results')
){

$('checkin-results')
.style.display=
'block';

}


if(
$('boss-score')
){

$('boss-score')
.textContent=
overall;

}


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
$(
`${id}-score`
)
){

$(
`${id}-score`
)
.textContent=
v;

}


if(
$(
`${id}-meter`
)
){

$(
`${id}-meter`
)
.style.width=
`${v}%`;

}

}
);


const weak=
Object.entries(
scores
)

.sort(
(a,b)=>
a[1]-
b[1]
)[0]?.[0]
||
'ACTION';


if(
$('weakest-category')
){

$('weakest-category')
.textContent=
weak;

}


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

}[
weak
];

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

}[
weak
];

}


/*
Store the overall score in value_numeric
so the dashboard can calculate averages
and score ranges.

Category scores are included in detail
for future category reporting.
*/

trackAnalytics(
'checkin_complete',
{

section:
'boss-checkin',

itemTitle:
'B.O.S.S CHECK IN',

valueNumeric:
overall,

detail:{

approval:
scores.APPROVAL,

comparison:
scores.COMPARISON,

confidence:
scores.CONFIDENCE,

action:
scores.ACTION,

weakest_category:
weak,

questions_answered:
cq.length

}

}
);


window.scrollTo({

top:0,

behavior:
'smooth'

});

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
ci>
0
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
   BACKEND MANAGED
========================================================= */

const episodes=[];


function buildEpisodes(){

const g=
$('episode-grid');


if(!g)
return;


g.innerHTML='';


if(
!episodes.length
){

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
src="${
esc(
e.thumbnailUrl||
`https://img.youtube.com/vi/${id}/hqdefault.jpg`
)
}"
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

e.title,

e.backendId||
e.id||
id

);


g.appendChild(
c
);

}
);

}


function playEpisode(
id,
title,
itemId=''
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
){

audio.pause();

}


trackAnalytics(
'video_play',
{

section:
'boss-bite',

itemId:
itemId||
id,

itemTitle:
title||
'THE BOSS BITE'

}
);


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
){

$('featured-title')
.textContent=
title;

}


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
){

$('featured-title')
.textContent=
'FUELING YOUR HUSTLE';

}


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
){

$('featured-title')
.textContent=
e.title;

}

}


/* =========================================================
   B.O.S.S CODE TV
   BACKEND MANAGED
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


if(
!tvVideos.length
){

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


const thumbnail=
v.thumbnailUrl||
`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`;


c.innerHTML=`

<div class="tv-player">

<div class="tv-media">

<button
class="tv-thumbnail"
type="button"
data-video-id="${esc(v.id)}"
data-video-backend-id="${esc(v.backendId||'')}"
data-video-title="${esc(v.title)}"
>

<img
src="${esc(thumbnail)}"
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

${v.description
?
`

<p>
${esc(v.description)}
</p>

`
:
''
}

</div>

`;


g.appendChild(
c
);

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


const backendId=
b.dataset.videoBackendId||
id;


const title=
b.dataset.videoTitle||
'B.O.S.S CODE TV';


const media=
b.closest(
'.tv-media'
);


if(
audio&&
!audio.paused
){

audio.pause();

}


trackAnalytics(
'video_play',
{

section:
'boss-code-tv',

itemId:
backendId,

itemTitle:
title

}
);


if(media){

media.innerHTML=`

<iframe
class="tv-iframe"
src="https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0"
title="${esc(title)}"
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


if(title){

title.textContent=
'B.O.S.S CODE MEDIA LIVE STREAM';

}


if(copy){

copy.textContent=
'Watch the current B.O.S.S CODE MEDIA broadcast live inside B.O.S.S CODE GO.';

}

}
else{


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

}
else{

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


if(title){

title.textContent=
'B.O.S.S CODE TV IS CURRENTLY OFF AIR';

}


if(copy){

copy.textContent=
'Previously recorded interviews and conversations are available below.';

}

}

}


/* =========================================================
   BOSS BITE GALLERY
   BACKEND MANAGED
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
){

return'Boss Bite photo';

}


return[

item?.caption,

item?.location

]

.filter(
Boolean
)

.join(
' • '
)

||

'Boss Bite photo';

}


function isDirectImage(
src=''
){

return(

/^(https?:|data:|blob:)/i
.test(
src
)

||

/\.(jpe?g|png|webp|gif|avif)(?:[?#].*)?$/i
.test(
src
)

);

}


function setImg(
img,
item,
n=0
){

const base=
gallerySrc(
item
);


if(
!img||
!base
)
return;


img.onerror=
null;


if(
isDirectImage(
base
)
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

n+
1

);

}


function buildGallery(){

const g=
$('boss-bite-gallery');


if(!g)
return;


g.innerHTML='';


if(
!galleryPhotos.length
){

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
galleryAlt(
item
);


setImg(

im,

item

);


b.appendChild(
im
);


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


document.body.style.overflow=
'hidden';

};


g.appendChild(
b
);

}
);

}


function showGal(){

if(
!galleryPhotos.length
)
return;


const im=
$('gallery-large-image');


const item=
galleryPhotos[
gi
];


if(im){

im.alt=
galleryAlt(
item
);


setImg(

im,

item

);

}


if(
$('gallery-counter')
){

$('gallery-counter')
.textContent=
`${gi+1} / ${galleryPhotos.length}`;

}

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


document.body.style.overflow=
'';

}
);


on(
'gallery-next',
'click',
()=>{

if(
!galleryPhotos.length
)
return;


gi=
(
gi+
1
)
%
galleryPhotos.length;


showGal();

}
);


on(
'gallery-previous',
'click',
()=>{

if(
!galleryPhotos.length
)
return;


gi=
(
gi-
1+
galleryPhotos.length
)
%
galleryPhotos.length;


showGal();

}
);


/* =========================================================
   BOSS BITE MAP
   BACKEND MANAGED
========================================================= */

const restaurants=[];


let bossBiteMap=
null;


let mapLoaded=
false;


const marks={};


function fullLocationAddress(
row
){

return[

row.address,

row.city,

row.state

]

.filter(
Boolean
)

.join(
', '
);

}


function validCoordinates(
lat,
lng
){

return(

Number.isFinite(
lat
)

&&

Number.isFinite(
lng
)

&&

lat>=
-90

&&

lat<=
90

&&

lng>=
-180

&&

lng<=
180

);

}


function buildRestaurantList(){

const l=
$('restaurant-list');


if(!l)
return;


l.innerHTML='';


if(
!restaurants.length
){

l.innerHTML=`

<div class="artist-media-empty">
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
()=>{

trackAnalytics(
'boss_bite_pin_click',
{

section:
'boss-bite',

itemId:
r.id,

itemTitle:
r.name,

detail:{

source:
'restaurant_list'

}

}
);


focusRestaurant(
r.id
);

};


l.appendChild(
b
);

}
);

}


function popup(
r
){

const directEpisodeId=
yt(
r.episodeUrl||
''
);


const directionsAddress=
r.address||
r.name||
'';


return`

<div
class="restaurant-popup"
data-restaurant-popup="${esc(r.id)}"
>

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

${esc(
r.category||
'BOSS BITE STOP'
)}

</div>

<div class="restaurant-address">

${esc(
r.address||
''
)}

</div>


${r.description
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


${r.episodeUrl&&
directEpisodeId
?
`

<button
class="restaurant-action watch-episode-button"
data-restaurant-id="${esc(r.id)}"
data-episode-url="${esc(r.episodeUrl)}"
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
data-restaurant-id="${esc(r.id)}"
href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(directionsAddress)}"
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

marks[
id
]
?.remove();

}catch{}


delete marks[
id
];

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


if(
!restaurants.length
){

$('map-loading')
?.classList
.add(
'hidden'
);


bossBiteMap.resize();

return;

}


const bounds=
new maplibregl.LngLatBounds();


let count=
0;


restaurants.forEach(
r=>{

if(

!Array.isArray(
r.c
)

||

r.c.length!==
2

||

!validCoordinates(

Number(
r.c[1]
),

Number(
r.c[0]
)

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


el.addEventListener(
'click',
()=>{

trackAnalytics(
'boss_bite_pin_click',
{

section:
'boss-bite',

itemId:
r.id,

itemTitle:
r.name,

detail:{

source:
'map_pin'

}

}
);

}
);


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
popup(
r
)
)

)

.addTo(
bossBiteMap
);


marks[
r.id
]=
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


if(
mapLoaded
){

addMapMarkers();

}


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


function focusRestaurant(
id
){

if(
!bossBiteMap
){

initMap();


setTimeout(
()=>focusRestaurant(
id
),
600
);


return;

}


const m=
marks[
id
];


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
String(
id
)

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
){

m.togglePopup();

}

},
500
);

}


/* =========================================================
   BOSS BITE POPUP ACTIONS
========================================================= */

document.addEventListener(
'click',
e=>{

const watch=
e.target.closest(
'.watch-episode-button'
);


if(watch){

e.preventDefault();


const restaurantId=
watch.dataset.restaurantId||
'';


const directUrl=
watch.dataset.episodeUrl||
'';


const directId=
yt(
directUrl
);


const restaurant=
restaurants.find(
r=>

String(
r.id
)===
String(
restaurantId
)

)
||

restaurants.find(
r=>

r.episodeUrl===
directUrl

);


if(
!directId
)
return;


trackAnalytics(
'watch_episode_click',
{

section:
'boss-bite',

itemId:
restaurant?.id||
restaurantId||
directId,

itemTitle:
restaurant?.name||
'THE BOSS BITE'

}
);


playEpisode(

directId,

restaurant?.name||
'The Boss Bite',

restaurant?.id||
directId

);


return;

}


const directions=
e.target.closest(
'.directions-button'
);


if(directions){

const restaurantId=
directions.dataset.restaurantId||
'';


const restaurant=
restaurants.find(
r=>

String(
r.id
)===
String(
restaurantId
)

);


trackAnalytics(
'directions_click',
{

section:
'boss-bite',

itemId:
restaurant?.id||
restaurantId,

itemTitle:
restaurant?.name||
'BOSS BITE STOP',

detail:{

address:
restaurant?.address||
''

}

}
);

}

}
);
/* =========================================================
   THE CODE CLOTHING BUTTON
========================================================= */

const clothingButton=
qa('.app-menu .app-button')
.find(button=>
button.textContent
.toUpperCase()
.includes('THE CODE CLOTHING')
);


/* =========================================================
   CLOUDFLARE BACKEND
========================================================= */

async function api(path){

const r=
await fetch(
API+path,
{
cache:'no-store',
headers:{
Accept:'application/json'
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
(rows||[])
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

backendId:
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

thumbnailUrl:
v.thumbnail_url||
'',

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

backendId:
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
'',

thumbnailUrl:
v.thumbnail_url||
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

backendId:
v.id,

id:
v.youtube_id||
yt(
v.youtube_url||
''
),

title:
v.title||
'B.O.S.S CODE TV',

description:
v.description||
'',

thumbnailUrl:
v.thumbnail_url||
''

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
(rows||[])
.find(
v=>
v.section===
'boss-code-tv-live'
);


live={

on:
Boolean(

liveRow&&

Number(
liveRow.published
)===
1

&&

(
liveRow.youtube_id
||
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
liveRow.youtube_id
||
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
(rows||[])

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

backendId:
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
)===
1

})
);


buildDMSessions();

}


function applyDMChallenges(rows){

dmChallenges=
(rows||[])

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

backendId:
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


/* =========================================================
   RESOURCE ANALYTICS

   RESOURCE DISPLAY IS OWNED BY
   decision-makers-backend.js
========================================================= */

document.addEventListener(
'click',
e=>{

const button=
e.target.closest?.(
'.dm-resource-download, .dm-resource-button'
);


if(!button)
return;


const card=
button.closest?.(
'.dm-resource-card'
);


const title=
card?.querySelector?.(
'h3'
)
?.textContent
?.trim()

||

button.textContent
?.trim()

||

'DECISION MAKERS RESOURCE';


trackAnalytics(
'resource_click',
{

section:
'decision-makers',

itemId:
button.dataset.resourceId||
'',

itemTitle:
title

}
);

},
true
);


/* =========================================================
   ARTIST PHOTO GALLERY BACKEND
========================================================= */

function applyArtistGallery(rows){

artistGalleryRows=
(rows||[])

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

repositionReturnHomeButtons();

}


/* =========================================================
   ARTIST MUSIC VIDEOS BACKEND
========================================================= */

function applyArtistMusicVideos(rows){

artistMusicVideoRows=
(rows||[])

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

repositionReturnHomeButtons();

}


/* =========================================================
   MUSIC BACKEND
   ADMIN IS THE SOURCE OF MUSIC CONTENT
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
(A||[])

.filter(
x=>
Number(x.published)===1
)

.sort(
order
);


const publishedReleases=
(R||[])

.filter(
x=>
Number(x.published)===1
)

.sort(
order
);


const publishedTracks=
(T||[])

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

.split(
/\s+/
)

.map(
x=>
x[0]
)

.join(
''
)

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

backendId:
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
.filter(
Boolean
),

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


if(
!artists.length
){

activeArtist=
null;

musicQueue=[];

activeReleaseId=
null;


clearMusicArtistUI();

repositionReturnHomeButtons();

return;

}


if(
activeArtist
){

activeArtist=
artists.find(
a=>
String(a.backendId)===
String(activeArtist.backendId)
)

||

artists[0];

}
else{

activeArtist=
artists[0];

}


musicQueue=[];

activeReleaseId=
null;


renderArtists();

renderTracks();

renderReleases();

updateArtistUI();

renderArtistGallery();

renderArtistMusicVideos();

repositionReturnHomeButtons();

}


/* =========================================================
   BOSS BITE GALLERY BACKEND
========================================================= */

function applyGallery(rows){

galleryPhotos=
(rows||[])

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
){

gi=
0;

}


buildGallery();

repositionReturnHomeButtons();

}


/* =========================================================
   BOSS BITE MAP BACKEND
========================================================= */

function applyLocations(rows){

const cloud=
(rows||[])

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

.filter(
Boolean
)

.join(
' • '
);


return{

id:
'cloud-location-'+
r.id,

backendId:
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


repositionReturnHomeButtons();

}


/* =========================================================
   DAILY DECISION BACKEND

   ADMIN CONTENT IS ADDITIVE TO THE PERMANENT BANK
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
(rows||[])

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


const cloud=
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

r.action_text||
r.description||
''

]
)

.filter(
x=>
x[0]
);


const seen=
new Set();


daily=
[
...cloud,
...builtDaily
]

.filter(
item=>{

const key=
String(
item?.[0]||
''
)

.trim()

.toLowerCase();


if(
!key||
seen.has(
key
)
)
return false;


seen.add(
key
);


return true;

}
);


const state=
dailyState();


if(
daily.length&&
state.i>=
daily.length
){

state.i=
0;


localStorage.setItem(

DK,

JSON.stringify(
state
)

);

}


renderDaily();

}


/* =========================================================
   B.O.S.S CHECK IN BACKEND

   ADMIN QUESTIONS ARE ADDITIVE TO THE PERMANENT BANK
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

const cloudBank={

APPROVAL:[],

COMPARISON:[],

CONFIDENCE:[],

ACTION:[]

};


(rows||[])

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
!cloudBank[
category
]
.includes(
text
)
){

cloudBank[
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

const seen=
new Set();


bank[
category
]=
[
...cloudBank[
category
],
...builtBank[
category
]
]

.filter(
text=>{

const key=
String(
text||
''
)

.trim()

.toLowerCase();


if(
!key||
seen.has(
key
)
)
return false;


seen.add(
key
);


return true;

}
);

}


console.info(

'B.O.S.S CHECK IN loaded with permanent questions + Admin additions.',

{

approval:
bank.APPROVAL.length,

comparison:
bank.COMPARISON.length,

confidence:
bank.CONFIDENCE.length,

action:
bank.ACTION.length

}

);

}


/* =========================================================
   MAGAZINE

   PERMANENT READER + ADMIN ISSUES

   ALWAYS OPENS INSIDE THE APP
========================================================= */

const BUILT_MAGAZINE={

id:
'built-magazine-reader',

title:
'B.O.S.S CODE MAGAZINE',

description:
'Read B.O.S.S CODE Magazine inside B.O.S.S CODE GO.',

coverImageUrl:
'images/magazine-logo.png',

magazineUrl:
'https://magazine.bosscodemedia.com',

issueLabel:
'B.O.S.S CODE MAGAZINE',

featured:
false,

builtIn:
true

};


let magazineIssues=[
BUILT_MAGAZINE
];


let currentMagazineUrl=
BUILT_MAGAZINE.magazineUrl;


function applyMagazines(rows){

const adminIssues=
(rows||[])

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

||

Number(
b.id||
0
)
-
Number(
a.id||
0
)
)

.map(
r=>({

id:
'admin-magazine-'+
r.id,

backendId:
r.id,

title:
r.title||
'B.O.S.S CODE MAGAZINE',

description:
r.description||
'',

coverImageUrl:
r.cover_image_url||
'images/magazine-logo.png',

magazineUrl:
r.magazine_url||
'',

issueLabel:
r.issue_label||
'MAGAZINE ISSUE',

featured:
Number(
r.featured||
0
)===
1,

builtIn:
false

})
)

.filter(
issue=>
issue.magazineUrl
);


const urls=
new Set(

adminIssues.map(
issue=>

String(
issue.magazineUrl
)

.trim()

.toLowerCase()

)

);


magazineIssues=
[
...adminIssues,

...(
urls.has(
BUILT_MAGAZINE.magazineUrl
.toLowerCase()
)
?
[]
:
[
BUILT_MAGAZINE
]
)

];


if(
!magazineIssues.length
){

magazineIssues=[
BUILT_MAGAZINE
];

}


currentMagazineUrl=

magazineIssues[0]
?.magazineUrl

||

BUILT_MAGAZINE.magazineUrl;

}


/* =========================================================
   INTERNAL APP WEB VIEW
========================================================= */

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
color:#fff
}

.boss-internal-wrap{
width:min(1200px,100%);
margin:auto;
padding:16px
}

.boss-internal-head{
display:flex;
align-items:center;
justify-content:space-between;
gap:12px;
margin-bottom:14px
}

.boss-internal-title{
font-size:18px;
font-weight:900
}

.boss-internal-back{
border:2px solid #d40000;
border-radius:999px;
background:#090909;
color:#fff;
padding:11px 16px;
font:inherit;
font-weight:900;
cursor:pointer
}

.boss-internal-frame{
display:block;
width:100%;
height:calc(100vh - 115px);
min-height:650px;
border:1px solid #252525;
border-radius:16px;
background:#fff
}

.boss-internal-empty{
min-height:60vh;
display:grid;
place-items:center;
text-align:center;
border:1px dashed #333;
border-radius:18px;
color:#888;
padding:30px
}

.magazine-library-copy{
color:#999;
line-height:1.5;
margin:0 0 18px
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


if(frame){

frame.src=
'about:blank';

}


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
){

$('boss-internal-title')
.textContent=
title;

}


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


/* =========================================================
   MAGAZINE ISSUE READER
========================================================= */

function openMagazineIssue(issue){

if(
!issue?.magazineUrl
)
return;


trackAnalytics(
'magazine_open',
{

section:
'magazine',

itemId:
issue.backendId||
issue.id||
'',

itemTitle:
issue.title||
'B.O.S.S CODE MAGAZINE',

detail:{

issue_label:
issue.issueLabel||
'',

built_in:
Boolean(
issue.builtIn
)

}

}
);


openInternalWeb(

issue.title||
'B.O.S.S CODE MAGAZINE',

issue.magazineUrl

);

}


function openMagazineHub(){

const issues=
magazineIssues.length
?
magazineIssues
:
[
BUILT_MAGAZINE
];


if(
issues.length===
1
){

openMagazineIssue(
issues[0]
);


return;

}


const screen=
ensureInternalScreen();


if(
$('boss-internal-title')
){

$('boss-internal-title')
.textContent=
'B.O.S.S CODE MAGAZINE';

}


const content=
$('boss-internal-content');


if(!content)
return;


content.innerHTML=`

<p class="magazine-library-copy">
Choose an issue to read inside B.O.S.S CODE GO.
</p>

<div
id="boss-magazine-issue-grid"
class="magazine-issue-grid"
></div>

`;


const grid=
$('boss-magazine-issue-grid');


issues.forEach(
issue=>{

const card=
document.createElement(
'button'
);


card.type=
'button';


card.className=
'magazine-issue-card';


card.innerHTML=`

<img
src="${esc(
issue.coverImageUrl||
'images/magazine-logo.png'
)}"
alt="${esc(
issue.title||
'B.O.S.S CODE MAGAZINE'
)}"
>

<div>

<small>
${esc(
issue.issueLabel||
'MAGAZINE ISSUE'
)}
</small>

<strong>
${esc(
issue.title||
'B.O.S.S CODE MAGAZINE'
)}
</strong>

${issue.description
?
`
<p>
${esc(issue.description)}
</p>
`
:
''
}

</div>

`;


card.addEventListener(
'click',
()=>openMagazineIssue(
issue
)
);


grid.appendChild(
card
);

}
);


trackPageOpen(
'magazine',
'B.O.S.S CODE MAGAZINE'
);


showScreen(
screen
);

}



/* =========================================================
   THE CODE CLOTHING
   IN APP STOREFRONT
========================================================= */

const CLOTHING_CART_KEY =
'the-code-clothing-cart-v1';


let clothingProducts = [];

let clothingCurrentProduct = null;

let clothingCart = [];


function moneyFromCents(
value
){

const cents =
Number(
value ||
0
);


return `$${(
cents /
100
).toFixed(
2
)}`;

}


function clothingLoadCart(){

try{

const saved =
JSON.parse(
localStorage.getItem(
CLOTHING_CART_KEY
) ||
'[]'
);


clothingCart =
Array.isArray(
saved
)
?
saved
:
[];

}catch{

clothingCart = [];

}

}


function clothingSaveCart(){

try{

localStorage.setItem(

CLOTHING_CART_KEY,

JSON.stringify(
clothingCart
)

);

}catch{}

}


function clothingCartCount(){

return clothingCart
.reduce(
(
total,
item
)=>
total +
Number(
item.quantity ||
1
),
0
);

}


async function clothingFetchJSON(
path,
options={}
){

const response =
await fetch(
API + path,
{
cache:
'no-store',

...options,

headers:{
Accept:
'application/json',

...(
options.body
&&
!(options.body instanceof FormData)
?
{
'Content-Type':
'application/json'
}
:
{}
),

...(
options.headers ||
{}
)
}
}
);


let data = {};


try{

data =
await response.json();

}catch{}


if(
!response.ok
){

throw new Error(
data.error ||
`API ${response.status}`
);

}


return data;

}


function installClothingStoreStyles(){

if(
$('the-code-clothing-styles')
)
return;


const style =
document.createElement(
'style'
);


style.id =
'the-code-clothing-styles';


style.textContent = `

#the-code-clothing-screen{
background:#fff;
color:#111;
min-height:100vh
}

#the-code-clothing-screen .muted{
color:#666 !important
}

.clothing-shell{
width:min(1120px,calc(100% - 28px));
margin:0 auto;
padding:20px 0 80px;
background:#fff
}

.clothing-topbar{
display:flex;
align-items:center;
justify-content:space-between;
gap:12px;
margin-bottom:18px
}

.clothing-back{
border:1px solid #d8d8d8;
background:#fff;
color:#111;
padding:10px 14px;
border-radius:999px;
font-size:10px;
font-weight:900
}

.clothing-cart-button{
border:1px solid #f5c518;
background:#fff;
color:#111;
padding:10px 14px;
border-radius:999px;
font-size:10px;
font-weight:900
}

.clothing-brand{
text-align:center;
padding:18px 0 24px
}

.clothing-brand img{
width:min(310px,85%);
max-height:120px;
object-fit:contain
}

.clothing-brand h2{
font-size:30px;
margin-top:8px
}

.clothing-brand p{
color:#666;
font-size:12px;
line-height:1.5;
margin-top:8px
}

.clothing-section-head{
display:flex;
align-items:end;
justify-content:space-between;
gap:14px;
margin:18px 0 14px
}

.clothing-section-head span{
color:#f5c518;
font-size:9px;
font-weight:900;
letter-spacing:2px
}

.clothing-section-head h3{
font-size:24px;
margin-top:4px
}

.clothing-product-grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
gap:16px
}

.clothing-product-card{
border:1px solid #dedede;
background:#fff;
border-radius:20px;
overflow:hidden;
color:#111;
text-align:left;
padding:0;
width:100%
}

.clothing-product-image{
aspect-ratio:1/1;
display:flex;
align-items:center;
justify-content:center;
background:#f4f4f4;
overflow:hidden
}

.clothing-product-image img{
width:100%;
height:100%;
object-fit:contain;
display:block
}

.clothing-product-placeholder{
color:#666;
font-size:11px;
font-weight:900;
letter-spacing:1px
}

.clothing-product-body{
padding:15px
}

.clothing-product-kicker{
color:#f5c518;
font-size:8px;
font-weight:900;
letter-spacing:1.6px
}

.clothing-product-body h4{
font-size:19px;
margin:7px 0
}

.clothing-product-price{
display:flex;
gap:8px;
align-items:center;
font-weight:900
}

.clothing-product-price .sale{
color:#f5c518;
font-size:18px
}

.clothing-product-price .regular{
font-size:13px;
color:#777;
text-decoration:line-through
}

.clothing-product-price .single{
font-size:18px;
color:#111
}

.clothing-product-body p{
color:#666;
font-size:11px;
line-height:1.45;
margin-top:8px
}

.clothing-loading,
.clothing-empty,
.clothing-error{
border:1px dashed #cfcfcf;
border-radius:16px;
padding:24px;
text-align:center;
color:#666;
background:#fafafa;
font-size:11px;
font-weight:900
}

.clothing-detail{
display:none
}

.clothing-detail.show{
display:block
}

.clothing-store-home.hide{
display:none
}

.clothing-detail-grid{
display:grid;
grid-template-columns:minmax(0,1fr) minmax(0,1fr);
gap:22px;
align-items:start
}

.clothing-gallery-main{
border:1px solid #dedede;
border-radius:20px;
background:#f6f6f6;
overflow:hidden;
aspect-ratio:1/1;
display:flex;
align-items:center;
justify-content:center
}

.clothing-gallery-main img{
width:100%;
height:100%;
object-fit:contain
}

.clothing-thumbs{
display:flex;
gap:8px;
overflow-x:auto;
margin-top:10px;
padding-bottom:4px
}

.clothing-thumb{
width:72px;
height:72px;
flex:0 0 auto;
border:1px solid #d8d8d8;
border-radius:10px;
background:#fff;
padding:3px
}

.clothing-thumb.active{
border-color:#f5c518
}

.clothing-thumb img{
width:100%;
height:100%;
object-fit:contain;
border-radius:7px
}

.clothing-detail-info{
border:1px solid #dedede;
border-radius:20px;
background:#fff;
padding:20px
}

.clothing-detail-kicker{
color:#f5c518;
font-size:9px;
font-weight:900;
letter-spacing:1.8px
}

.clothing-detail-info h2{
font-size:30px;
line-height:1.08;
margin:8px 0
}

.clothing-detail-copy{
color:#5f5f5f;
font-size:12px;
line-height:1.55;
margin:14px 0
}

.clothing-price-large{
font-size:25px;
font-weight:900;
margin:12px 0
}

.clothing-sale-row{
display:flex;
gap:10px;
align-items:center
}

.clothing-sale-row .old{
color:#777;
text-decoration:line-through;
font-size:15px
}

.clothing-option-block{
margin-top:16px
}

.clothing-option-block label{
display:block;
font-size:10px;
font-weight:900;
margin-bottom:8px;
color:#111
}

.clothing-option-grid{
display:flex;
gap:8px;
flex-wrap:wrap
}

.clothing-choice{
border:1px solid #cfcfcf;
background:#fff;
color:#111;
padding:9px 12px;
border-radius:999px;
font-size:10px;
font-weight:900
}

.clothing-choice.active{
border-color:#f5c518;
color:#f5c518
}

.clothing-choice.disabled{
opacity:.35;
pointer-events:none
}

.clothing-add-button{
width:100%;
border:0;
border-radius:999px;
background:#f5c518;
color:#000;
font-weight:900;
padding:15px 16px;
margin-top:18px
}

.clothing-add-button:disabled{
opacity:.45
}

.clothing-special-button{
width:100%;
border:1px solid #222;
border-radius:999px;
background:#fff;
color:#111;
font-weight:900;
padding:13px 16px;
margin-top:10px
}

.clothing-standard-note{
border:1px solid #3c3208;
background:#120f02;
color:#f5c518;
border-radius:14px;
padding:12px;
font-size:10px;
line-height:1.5;
margin-top:15px
}

.clothing-special-form{
display:none;
margin-top:14px;
border-top:1px solid #dedede;
padding-top:14px
}

.clothing-special-form.show{
display:block
}

.clothing-field{
margin-top:10px
}

.clothing-field label{
display:block;
font-size:9px;
font-weight:900;
margin-bottom:6px
}

.clothing-field input,
.clothing-field textarea,
.clothing-field select{
width:100%;
background:#fff;
color:#111;
border:1px solid #cfcfcf;
border-radius:12px;
padding:12px;
outline:none
}

.clothing-field textarea{
min-height:86px;
resize:vertical
}

.clothing-submit-request{
border:0;
background:#d40000;
color:#fff;
border-radius:999px;
font-weight:900;
padding:12px 16px;
margin-top:12px
}

.clothing-request-status{
min-height:18px;
color:#f5c518;
font-size:10px;
font-weight:900;
margin-top:8px
}

.clothing-cart-panel{
display:none;
position:fixed;
inset:0;
z-index:9999;
background:rgba(0,0,0,.88);
padding:18px;
overflow-y:auto
}

.clothing-cart-panel.show{
display:block
}

.clothing-cart-shell{
width:min(560px,100%);
margin:28px auto;
background:#fff;
color:#111;
border:1px solid #d8d8d8;
border-radius:22px;
padding:20px
}

.clothing-cart-top{
display:flex;
justify-content:space-between;
gap:10px;
align-items:center
}

.clothing-cart-top button{
border:1px solid #d0d0d0;
background:#fff;
color:#111;
width:38px;
height:38px;
border-radius:50%
}

.clothing-cart-items{
display:grid;
gap:10px;
margin-top:16px
}

.clothing-cart-item{
display:grid;
grid-template-columns:62px minmax(0,1fr) auto;
gap:10px;
align-items:center;
border:1px solid #dedede;
border-radius:14px;
padding:9px;
background:#fff
}

.clothing-cart-item img{
width:62px;
height:62px;
object-fit:contain;
background:#f4f4f4;
border-radius:10px
}

.clothing-cart-item strong{
font-size:11px
}

.clothing-cart-item small{
display:block;
color:#666;
font-size:9px;
margin-top:4px
}

.clothing-cart-remove{
border:1px solid #542323;
background:transparent;
color:#ff7b7b;
border-radius:999px;
padding:7px 9px;
font-size:8px;
font-weight:900
}

.clothing-cart-total{
display:flex;
justify-content:space-between;
gap:10px;
border-top:1px solid #dedede;
margin-top:16px;
padding-top:14px;
font-weight:900
}

.clothing-checkout-pending{
border:1px solid #3a330e;
background:#120f02;
color:#f5c518;
border-radius:14px;
padding:12px;
font-size:10px;
line-height:1.5;
margin-top:14px
}

@media(max-width:720px){

.clothing-detail-grid{
grid-template-columns:1fr
}

.clothing-product-grid{
grid-template-columns:repeat(2,minmax(0,1fr));
gap:10px
}

.clothing-product-body{
padding:12px
}

.clothing-product-body h4{
font-size:15px
}

.clothing-brand h2{
font-size:25px
}

}

@media(max-width:430px){

.clothing-product-grid{
grid-template-columns:1fr
}

}

`;


document.head.appendChild(
style
);

}


function ensureClothingStore(){

installClothingStoreStyles();

clothingLoadCart();


let screen =
$('the-code-clothing-screen');


if(screen)
return screen;


screen =
document.createElement(
'div'
);


screen.id =
'the-code-clothing-screen';

screen.className =
'screen';


screen.innerHTML = `

<div class="clothing-shell">

<div class="clothing-topbar">

<button
id="the-code-clothing-back"
class="clothing-back"
type="button"
>
RETURN TO HOME
</button>

<button
id="the-code-clothing-cart"
class="clothing-cart-button"
type="button"
>
CART <span id="the-code-clothing-cart-count">0</span>
</button>

</div>

<section
id="clothing-store-home"
class="clothing-store-home"
>

<header class="clothing-brand">

<img
src="images/code-clothing-logo.png"
alt="The Code Clothing"
>

<h2>
THE CODE CLOTHING
</h2>

<p>
Wear the decision. Carry the code.
</p>

</header>


<div class="clothing-section-head">

<div>

<span>
THE CODE CLOTHING
</span>

<h3>
SHOP
</h3>

</div>

</div>


<div
id="clothing-product-grid"
class="clothing-product-grid"
>

<div class="clothing-loading">
LOADING PRODUCTS...
</div>

</div>

</section>


<section
id="clothing-detail"
class="clothing-detail"
></section>

</div>


<div
id="clothing-cart-panel"
class="clothing-cart-panel"
>

<div class="clothing-cart-shell">

<div class="clothing-cart-top">

<div>

<div class="clothing-detail-kicker">
THE CODE CLOTHING
</div>

<h2>
YOUR CART
</h2>

</div>

<button
id="clothing-cart-close"
type="button"
>
✕
</button>

</div>

<div
id="clothing-cart-items"
class="clothing-cart-items"
></div>

<div
id="clothing-cart-total"
class="clothing-cart-total"
></div>

<div class="clothing-checkout-pending">
SECURE CHECKOUT WILL BE CONNECTED IN THE PAYMENT PHASE. YOUR CART IS SAVED ON THIS DEVICE.
</div>

</div>

</div>

`;


document.body.appendChild(
screen
);


$('the-code-clothing-back')
?.addEventListener(
'click',
()=>{

showScreen(
home
);

}
);


$('the-code-clothing-cart')
?.addEventListener(
'click',
openClothingCart
);


$('clothing-cart-close')
?.addEventListener(
'click',
closeClothingCart
);


$('clothing-cart-panel')
?.addEventListener(
'click',
event=>{

if(
event.target ===
$('clothing-cart-panel')
)
closeClothingCart();

}
);


updateClothingCartCount();


return screen;

}


function updateClothingCartCount(){

const count =
$('the-code-clothing-cart-count');


if(count)
count.textContent =
String(
clothingCartCount()
);

}


function clothingProductPriceHTML(
product
){

const price =
Number(
product?.price_cents ||
0
);

const sale =
product?.sale_price_cents ===
null ||
product?.sale_price_cents ===
undefined
?
null
:
Number(
product.sale_price_cents
);


if(
sale !== null &&
sale >= 0 &&
sale < price
){

return `
<div class="clothing-product-price">
<span class="sale">
${moneyFromCents(sale)}
</span>
<span class="regular">
${moneyFromCents(price)}
</span>
</div>
`;

}


return `
<div class="clothing-product-price">
<span class="single">
${moneyFromCents(price)}
</span>
</div>
`;

}


function renderClothingProducts(){

const grid =
$('clothing-product-grid');


if(!grid)
return;


if(
!clothingProducts.length
){

grid.innerHTML = `
<div class="clothing-empty">
NO PRODUCTS ARE PUBLISHED YET.
</div>
`;

return;

}


grid.innerHTML =
'';


clothingProducts
.forEach(
product=>{

const card =
document.createElement(
'button'
);


card.type =
'button';

card.className =
'clothing-product-card';


const cover =
String(
product.cover_image_url ||
''
).trim();


card.innerHTML = `

<div class="clothing-product-image">

${
cover
?
`
<img
src="${esc(cover)}"
alt="${esc(product.name || 'The Code Clothing')}"
>
`
:
`
<div class="clothing-product-placeholder">
THE CODE CLOTHING
</div>
`
}

</div>

<div class="clothing-product-body">

<div class="clothing-product-kicker">
${
product.featured
?
'FEATURED'
:
'THE CODE CLOTHING'
}
</div>

<h4>
${esc(product.name || 'PRODUCT')}
</h4>

${clothingProductPriceHTML(product)}

${
product.description
?
`
<p>
${esc(product.description)}
</p>
`
:
''
}

</div>

`;


card.addEventListener(
'click',
()=>{

openClothingProduct(
product.id
);

}
);


grid.appendChild(
card
);

}
);

}


async function loadClothingProducts(){

const grid =
$('clothing-product-grid');


if(grid)
grid.innerHTML = `
<div class="clothing-loading">
LOADING PRODUCTS...
</div>
`;


try{

const result =
await clothingFetchJSON(
'/clothing/products'
);


clothingProducts =
Array.isArray(
result.data
)
?
result.data
:
[];


renderClothingProducts();

}catch(error){

if(grid)
grid.innerHTML = `
<div class="clothing-error">
${esc(error.message || 'Could not load products.')}
</div>
`;

}

}


async function openClothingStore(){

const screen =
ensureClothingStore();


$('clothing-detail')
?.classList.remove(
'show'
);


$('clothing-store-home')
?.classList.remove(
'hide'
);


showScreen(
screen
);


trackPageOpen(
'the-code-clothing',
'THE CODE CLOTHING'
);


await loadClothingProducts();

}


function clothingAvailableColors(
variants
){

return [
...new Set(
variants
.filter(
variant=>
variant.active !==
false
)
.map(
variant=>
String(
variant.color ||
''
).trim()
)
.filter(Boolean)
)
];

}


function clothingSizesForColor(
variants,
color
){

return [
...new Set(
variants
.filter(
variant=>
variant.active !==
false
&&
String(
variant.color ||
''
).toLowerCase() ===
String(
color ||
''
).toLowerCase()
&&
variant.in_stock !==
false
)
.map(
variant=>
String(
variant.size ||
''
).trim()
)
.filter(Boolean)
)
];

}


function clothingSelectedVariant(
variants,
color,
size
){

return variants.find(
variant=>
variant.active !==
false
&&
variant.in_stock !==
false
&&
String(
variant.color ||
''
).toLowerCase() ===
String(
color ||
''
).toLowerCase()
&&
String(
variant.size ||
''
).toUpperCase() ===
String(
size ||
''
).toUpperCase()
) ||
null;

}


async function openClothingProduct(
productId
){

const screen =
ensureClothingStore();

const detail =
$('clothing-detail');

const storeHome =
$('clothing-store-home');


if(
!detail ||
!storeHome
)
return;


storeHome.classList.add(
'hide'
);

detail.classList.add(
'show'
);


detail.innerHTML = `
<div class="clothing-loading">
LOADING PRODUCT...
</div>
`;


showScreen(
screen
);


try{

const result =
await clothingFetchJSON(

`/clothing/products/${encodeURIComponent(
productId
)}/full`

);


const data =
result.data ||
{};


clothingCurrentProduct =
data;


renderClothingDetail(
data
);


trackAnalytics(
'clothing_product_view',
{
section:
'the-code-clothing',

itemId:
data.product?.id ||
productId,

itemTitle:
data.product?.name ||
'Clothing Product'
}
);

}catch(error){

detail.innerHTML = `
<div class="clothing-error">
${esc(error.message || 'Could not load product.')}
</div>
`;

}

}


function renderClothingDetail(
data
){

const detail =
$('clothing-detail');


if(
!detail
)
return;


const product =
data.product ||
{};

const variants =
Array.isArray(
data.variants
)
?
data.variants
:
[];

const extraImages =
Array.isArray(
data.images
)
?
data.images
:
[];


const imageUrls =
[
String(
product.cover_image_url ||
''
).trim(),

...extraImages.map(
item=>
String(
item.image_url ||
''
).trim()
)
]
.filter(Boolean);


const colors =
clothingAvailableColors(
variants
);


const selectedColor =
colors[0] ||
'';


const sizes =
selectedColor
?
clothingSizesForColor(
variants,
selectedColor
)
:
[];


const selectedSize =
sizes[0] ||
'';


const mainImage =
imageUrls[0] ||
'';


detail.innerHTML = `

<button
id="clothing-back-to-shop"
class="clothing-back"
type="button"
style="margin-bottom:14px"
>
← BACK TO SHOP
</button>


<div class="clothing-detail-grid">

<div>

<div class="clothing-gallery-main">

${
mainImage
?
`
<img
id="clothing-main-image"
src="${esc(mainImage)}"
alt="${esc(product.name || 'The Code Clothing')}"
>
`
:
`
<div class="clothing-product-placeholder">
THE CODE CLOTHING
</div>
`
}

</div>


${
imageUrls.length > 1
?
`
<div
id="clothing-thumbs"
class="clothing-thumbs"
>

${imageUrls.map(
(
url,
index
)=>`
<button
type="button"
class="clothing-thumb ${
index === 0
?
'active'
:
''
}"
data-image="${esc(url)}"
>
<img
src="${esc(url)}"
alt=""
>
</button>
`
).join('')}

</div>
`
:
''
}

</div>


<div class="clothing-detail-info">

<div class="clothing-detail-kicker">
${
product.featured
?
'FEATURED'
:
'THE CODE CLOTHING'
}
</div>

<h2>
${esc(product.name || 'PRODUCT')}
</h2>

<div class="clothing-price-large">

${
product.on_sale
?
`
<div class="clothing-sale-row">

<span>
${moneyFromCents(
product.effective_price_cents
)}
</span>

<span class="old">
${moneyFromCents(
product.price_cents
)}
</span>

</div>
`
:
moneyFromCents(
product.effective_price_cents ??
product.price_cents
)
}

</div>

${
product.description
?
`
<div class="clothing-detail-copy">
${esc(product.description)}
</div>
`
:
''
}


${
colors.length
?
`
<div class="clothing-option-block">

<label>
COLOR
</label>

<div
id="clothing-color-options"
class="clothing-option-grid"
>

${colors.map(
color=>`
<button
type="button"
class="clothing-choice ${
color === selectedColor
?
'active'
:
''
}"
data-color="${esc(color)}"
>
${esc(color)}
</button>
`
).join('')}

</div>

</div>
`
:
''
}


<div class="clothing-option-block">

<label>
SIZE
</label>

<div
id="clothing-size-options"
class="clothing-option-grid"
>

${
sizes.length
?
sizes.map(
size=>`
<button
type="button"
class="clothing-choice ${
size === selectedSize
?
'active'
:
''
}"
data-size="${esc(size)}"
>
${esc(size)}
</button>
`
).join('')
:
`
<span class="muted">
SIZE OPTIONS WILL APPEAR HERE.
</span>
`
}

</div>

</div>


<div class="clothing-standard-note">
STANDARD SIZES AVAILABLE THROUGH 2XL<br>
Need another size? Send us a special size request and we will check availability.
</div>


<button
id="clothing-add-to-cart"
class="clothing-add-button"
type="button"
${
!colors.length ||
!selectedSize
?
'disabled'
:
''
}
>
ADD TO CART
</button>


${
product.allow_special_size_request
?
`
<button
id="clothing-special-size-toggle"
class="clothing-special-button"
type="button"
>
REQUEST A SPECIAL SIZE
</button>


<div
id="clothing-special-form"
class="clothing-special-form"
>

<div class="clothing-field">

<label>
NAME
</label>

<input
id="clothing-special-name"
type="text"
>

</div>


<div class="clothing-field">

<label>
EMAIL
</label>

<input
id="clothing-special-email"
type="email"
>

</div>


<div class="clothing-field">

<label>
REQUESTED SIZE
</label>

<input
id="clothing-special-size"
type="text"
placeholder="Example: 3XL"
>

</div>


<div class="clothing-field">

<label>
COLOR
</label>

<input
id="clothing-special-color"
type="text"
value="${esc(selectedColor)}"
>

</div>


<div class="clothing-field">

<label>
NOTES OPTIONAL
</label>

<textarea
id="clothing-special-notes"
></textarea>

</div>


<button
id="clothing-submit-special-size"
class="clothing-submit-request"
type="button"
>
SEND SIZE REQUEST
</button>


<div
id="clothing-request-status"
class="clothing-request-status"
></div>

</div>
`
:
''
}

</div>

</div>

`;


$('clothing-back-to-shop')
?.addEventListener(
'click',
()=>{

detail.classList.remove(
'show'
);

$('clothing-store-home')
?.classList.remove(
'hide'
);

window.scrollTo({
top:0,
behavior:
'smooth'
});

}
);


qa(
'#clothing-thumbs .clothing-thumb'
)
.forEach(
thumb=>{

thumb.addEventListener(
'click',
()=>{

const main =
$('clothing-main-image');


if(main)
main.src =
thumb.dataset.image ||
main.src;


qa(
'#clothing-thumbs .clothing-thumb'
)
.forEach(
item=>
item.classList.remove(
'active'
)
);


thumb.classList.add(
'active'
);

}
);

}
);


wireClothingChoices(
data,
selectedColor,
selectedSize
);


$('clothing-special-size-toggle')
?.addEventListener(
'click',
()=>{

$('clothing-special-form')
?.classList.toggle(
'show'
);

}
);


$('clothing-submit-special-size')
?.addEventListener(
'click',
()=>submitClothingSpecialSize(
product
)
);

}


function wireClothingChoices(
data,
startingColor,
startingSize
){

const variants =
Array.isArray(
data.variants
)
?
data.variants
:
[];


let selectedColor =
startingColor ||
'';

let selectedSize =
startingSize ||
'';


function renderSizes(){

const container =
$('clothing-size-options');


if(!container)
return;


const sizes =
clothingSizesForColor(
variants,
selectedColor
);


if(
!sizes.includes(
selectedSize
)
){

selectedSize =
sizes[0] ||
'';

}


container.innerHTML =
sizes.length
?
sizes.map(
size=>`
<button
type="button"
class="clothing-choice ${
size === selectedSize
?
'active'
:
''
}"
data-size="${esc(size)}"
>
${esc(size)}
</button>
`
).join('')
:
`
<span class="muted">
NO AVAILABLE SIZES FOR THIS COLOR.
</span>
`;


qa(
'#clothing-size-options .clothing-choice'
)
.forEach(
button=>{

button.addEventListener(
'click',
()=>{

selectedSize =
button.dataset.size ||
'';


qa(
'#clothing-size-options .clothing-choice'
)
.forEach(
item=>
item.classList.remove(
'active'
)
);


button.classList.add(
'active'
);


updateAddState();

}
);

}
);


updateAddState();

}


function updateAddState(){

const add =
$('clothing-add-to-cart');


if(!add)
return;


const variant =
clothingSelectedVariant(
variants,
selectedColor,
selectedSize
);


add.disabled =
!variant;


add.onclick =
variant
?
()=>addClothingToCart(
data,
variant
)
:
null;


const specialColor =
$('clothing-special-color');


if(
specialColor &&
!specialColor.value
)
specialColor.value =
selectedColor;

}


qa(
'#clothing-color-options .clothing-choice'
)
.forEach(
button=>{

button.addEventListener(
'click',
()=>{

selectedColor =
button.dataset.color ||
'';

selectedSize =
'';


qa(
'#clothing-color-options .clothing-choice'
)
.forEach(
item=>
item.classList.remove(
'active'
)
);


button.classList.add(
'active'
);


const specialColor =
$('clothing-special-color');


if(specialColor)
specialColor.value =
selectedColor;


renderSizes();

}
);

}
);


renderSizes();

}


function addClothingToCart(
data,
variant
){

const product =
data.product ||
{};


const existing =
clothingCart.find(
item=>
Number(
item.product_id
) ===
Number(
product.id
)
&&
Number(
item.variant_id
) ===
Number(
variant.id
)
);


if(existing){

existing.quantity =
Number(
existing.quantity ||
1
) + 1;

}
else{

clothingCart.push({
product_id:
product.id,

variant_id:
variant.id,

name:
product.name ||
'The Code Clothing',

color:
variant.color ||
'',

size:
variant.size ||
'',

price_cents:
Number(
product.effective_price_cents ??
product.price_cents ??
0
),

image_url:
product.cover_image_url ||
'',

quantity:
1
});

}


clothingSaveCart();

updateClothingCartCount();


const button =
$('clothing-add-to-cart');


if(button){

const old =
button.textContent;


button.textContent =
'ADDED TO CART';


setTimeout(
()=>{

button.textContent =
old;

},
1200
);

}


trackAnalytics(
'clothing_add_to_cart',
{
section:
'the-code-clothing',

itemId:
product.id,

itemTitle:
product.name ||
'Clothing Product',

detail:{
color:
variant.color ||
'',

size:
variant.size ||
''
}
}
);

}


function openClothingCart(){

clothingLoadCart();

renderClothingCart();


$('clothing-cart-panel')
?.classList.add(
'show'
);


document.body.style.overflow =
'hidden';

}


function closeClothingCart(){

$('clothing-cart-panel')
?.classList.remove(
'show'
);


document.body.style.overflow =
'';

}


function renderClothingCart(){

const items =
$('clothing-cart-items');

const total =
$('clothing-cart-total');


if(
!items ||
!total
)
return;


if(
!clothingCart.length
){

items.innerHTML = `
<div class="clothing-empty">
YOUR CART IS EMPTY.
</div>
`;


total.innerHTML = `
<span>TOTAL</span>
<strong>$0.00</strong>
`;


updateClothingCartCount();

return;

}


items.innerHTML =
clothingCart.map(
(
item,
index
)=>`

<div class="clothing-cart-item">

${
item.image_url
?
`
<img
src="${esc(item.image_url)}"
alt=""
>
`
:
`
<div></div>
`
}

<div>

<strong>
${esc(item.name)}
</strong>

<small>
${esc(item.color)} • ${esc(item.size)} • QTY ${esc(item.quantity)}
</small>

<small>
${moneyFromCents(
Number(
item.price_cents ||
0
) *
Number(
item.quantity ||
1
)
)}
</small>

</div>


<button
type="button"
class="clothing-cart-remove"
data-cart-index="${index}"
>
REMOVE
</button>

</div>

`
).join('');


qa(
'#clothing-cart-items .clothing-cart-remove'
)
.forEach(
button=>{

button.addEventListener(
'click',
()=>{

const index =
Number(
button.dataset.cartIndex
);


if(
Number.isInteger(
index
)
)
clothingCart.splice(
index,
1
);


clothingSaveCart();

renderClothingCart();

updateClothingCartCount();

}
);

}
);


const totalCents =
clothingCart.reduce(
(
sum,
item
)=>
sum +
(
Number(
item.price_cents ||
0
) *
Number(
item.quantity ||
1
)
),
0
);


total.innerHTML = `
<span>
TOTAL
</span>

<strong>
${moneyFromCents(
totalCents
)}
</strong>
`;


updateClothingCartCount();

}


async function submitClothingSpecialSize(
product
){

const status =
$('clothing-request-status');


if(status)
status.textContent =
'SENDING...';


const name =
String(
$('clothing-special-name')
?.value ||
''
).trim();

const email =
String(
$('clothing-special-email')
?.value ||
''
).trim();

const requestedSize =
String(
$('clothing-special-size')
?.value ||
''
).trim();

const color =
String(
$('clothing-special-color')
?.value ||
''
).trim();

const notes =
String(
$('clothing-special-notes')
?.value ||
''
).trim();


if(
!name ||
!email ||
!requestedSize
){

if(status)
status.textContent =
'ADD YOUR NAME, EMAIL AND REQUESTED SIZE.';

return;

}


try{

const result =
await clothingFetchJSON(
'/clothing/special-size-requests',
{
method:
'POST',

body:
JSON.stringify({
product_id:
product.id,

product_name:
product.name ||
'',

name,

email,

requested_size:
requestedSize,

color,

notes
})
}
);


if(status)
status.textContent =
result.message ||
'YOUR SIZE REQUEST WAS SENT.';


const sizeInput =
$('clothing-special-size');


if(sizeInput)
sizeInput.value =
'';


const notesInput =
$('clothing-special-notes');


if(notesInput)
notesInput.value =
'';


trackAnalytics(
'clothing_special_size_request',
{
section:
'the-code-clothing',

itemId:
product.id,

itemTitle:
product.name ||
'Clothing Product',

detail:{
requested_size:
requestedSize,

color
}
}
);

}catch(error){

if(status)
status.textContent =
error.message ||
'COULD NOT SEND YOUR REQUEST.';

}

}


/* =========================================================
   MAGAZINE + CLOTHING HOME LINKS
========================================================= */

function setupInternalLinks(){

const magazineButton=
q(
'.app-menu a[href*="magazine.bosscodemedia.com"]'
);


if(
magazineButton
){

magazineButton.addEventListener(
'click',
e=>{

e.preventDefault();

e.stopImmediatePropagation();


openWithPromo(

'magazine',

openMagazineHub

);

},
true
);

}


if(
clothingButton
){

clothingButton.addEventListener(
'click',
e=>{

e.preventDefault();

e.stopImmediatePropagation();


openWithPromo(

'the-code-clothing',

openClothingStore

);

},
true
);

}

}


/* =========================================================
   KEEP BOTTOM RETURN HOME
   AT THE TRUE END OF EACH PAGE
========================================================= */

function repositionReturnHomeButtons(){

for(
const screenId of[

'boss-bite-screen',

'boss-code-tv-screen',

'decision-makers-screen',

'boss-checkin-screen',

'music-screen',

'contact-screen',

'support-screen'

]
){

const screen=
$(screenId);


if(!screen)
continue;


const button=
screen.querySelector(
'.boss-return-home-bottom'
);


if(!button)
continue;


const footer=
screen.querySelector(
'.boss-footer, .contact-footer'
);


if(footer){

if(
button.nextElementSibling!==
footer
){

footer.insertAdjacentElement(
'beforebegin',
button
);

}

}
else if(
screen.lastElementChild!==
button
){

screen.appendChild(
button
);

}

}

}


let returnHomeRepositionTimer=
0;


const returnHomeObserver=
new MutationObserver(
()=>{

clearTimeout(
returnHomeRepositionTimer
);


returnHomeRepositionTimer=
setTimeout(

repositionReturnHomeButtons,

40

);

}
);


for(
const screen of
qa(
'.screen'
)
){

returnHomeObserver.observe(

screen,

{

childList:
true,

subtree:
true

}

);

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
'/promo-ads'
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

promoResult

]=
results;


/* VIDEOS */

if(
videosResult.status===
'fulfilled'
){

applyVideos(
videosResult.value
);

}
else{

console.warn(

'Video sync failed',

videosResult.reason

);

}


/* MAGAZINES */

if(
magazinesResult.status===
'fulfilled'
){

applyMagazines(
magazinesResult.value
);

}
else{

magazineIssues=[
BUILT_MAGAZINE
];


currentMagazineUrl=
BUILT_MAGAZINE.magazineUrl;

}


/* MUSIC */

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

}
else{

artists=[];

activeArtist=
null;


clearMusicArtistUI();

}


/* ARTIST GALLERY */

if(
artistGalleryResult.status===
'fulfilled'
){

applyArtistGallery(
artistGalleryResult.value
);

}
else{

artistGalleryRows=[];

renderArtistGallery();

}


/* ARTIST MUSIC VIDEOS */

if(
artistVideosResult.status===
'fulfilled'
){

applyArtistMusicVideos(
artistVideosResult.value
);

}
else{

artistMusicVideoRows=[];

renderArtistMusicVideos();

}


/* BOSS BITE GALLERY */

if(
galleryResult.status===
'fulfilled'
){

applyGallery(
galleryResult.value
);

}
else{

galleryPhotos=[];

buildGallery();

}


/* BOSS BITE LOCATIONS */

if(
locationsResult.status===
'fulfilled'
){

applyLocations(
locationsResult.value
);

}
else{

restaurants.splice(

0,

restaurants.length

);


buildRestaurantList();

}


/* DAILY DECISION */

if(
dailyResult.status===
'fulfilled'
){

applyDailyDecisions(
dailyResult.value
);

}
else{

daily=[
...builtDaily
];


renderDaily();

}


/* CHECK IN */

if(
checkinResult.status===
'fulfilled'
){

applyCheckinQuestions(
checkinResult.value
);

}
else{

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
[
...builtBank[
category
]
];

}

}


/* DECISION MAKER SESSIONS */

if(
sessionsResult.status===
'fulfilled'
){

applyDMSessions(
sessionsResult.value
);

}
else{

dmSessions=[];

buildDMSessions();

}


/* DECISION MAKER CHALLENGES */

if(
challengesResult.status===
'fulfilled'
){

applyDMChallenges(
challengesResult.value
);

}
else{

dmChallenges=[];

buildDMChallenges();

}


/* PROMOTIONAL ADS */

if(
promoResult.status===
'fulfilled'
){

applyPromoAds(
promoResult.value
);

}
else{

promoAds=[];

promoAdsLoaded=
true;

}


repositionReturnHomeButtons();


const failed=
results.filter(
x=>
x.status===
'rejected'
);


if(
failed.length
){

console.warn(

`${failed.length} B.O.S.S CODE GO cloud request(s) failed.`

);

}
else{

console.info(
'B.O.S.S CODE GO synced from Admin.'
);

}

}


/* =========================================================
   OPTIONAL DEMOGRAPHICS PROMPT
========================================================= */

function scheduleDemographicsPrompt(
attempt=0
){

setTimeout(
()=>{

let prompted=
false;


try{

prompted=
localStorage.getItem(
DEMOGRAPHICS_PROMPT_KEY
)===
'1';

}catch{}


if(prompted)
return;


const dailyOpen=
$('daily-decision-modal')
?.classList
.contains(
'open'
);


const adOpen=
$('boss-promo-ad-overlay')
?.classList
.contains(
'open'
);


if(

dailyOpen

||

adOpen

||

!home?.classList.contains(
'active-screen'
)

){

if(
attempt<
12
){

scheduleDemographicsPrompt(
attempt+
1
);

}


return;

}


showDemographicsPromptIfAppropriate();

},

attempt===
0
?
5000
:
2000

);

}



/* =========================================================
   APP WIDE WHITE THEME
   White page backgrounds, dark readable text.
   Existing buttons keep their current styling.
   Home keeps a black logo/header area with white content below.
========================================================= */

function installBossCodeWhiteTheme(){

if(
$('boss-code-white-theme')
)
return;


const style =
document.createElement(
'style'
);


style.id =
'boss-code-white-theme';


style.textContent = `

/* ---------------------------------------------------------
   PAGE BACKGROUNDS
--------------------------------------------------------- */

#home-screen,
#music-screen,
#boss-checkin-screen,
#decision-makers-screen,
#boss-bite-screen,
#boss-code-tv-screen,
#support-screen,
#the-code-clothing-screen{
background:#fff !important;
color:#111 !important;
}


/* ---------------------------------------------------------
   HOME
   Black only behind the B.O.S.S CODE GO logo/header.
   Everything below stays white.
--------------------------------------------------------- */

#home-screen .app-header{
background:#000 !important;
color:#fff !important;
margin:0 !important;
padding-top:22px !important;
padding-bottom:22px !important;
}

#home-screen .app-header p{
color:#fff !important;
}

#home-screen > main,
#home-screen .daily-decision-home,
#home-screen .app-menu{
background:#fff !important;
}


/* ---------------------------------------------------------
   GENERAL PAGE TEXT
--------------------------------------------------------- */

#music-screen h1,
#music-screen h2,
#music-screen h3,
#music-screen h4,
#music-screen p,

#boss-checkin-screen h1,
#boss-checkin-screen h2,
#boss-checkin-screen h3,
#boss-checkin-screen h4,
#boss-checkin-screen p,

#decision-makers-screen h1,
#decision-makers-screen h2,
#decision-makers-screen h3,
#decision-makers-screen h4,
#decision-makers-screen p,

#boss-bite-screen h1,
#boss-bite-screen h2,
#boss-bite-screen h3,
#boss-bite-screen h4,
#boss-bite-screen p,

#boss-code-tv-screen h1,
#boss-code-tv-screen h2,
#boss-code-tv-screen h3,
#boss-code-tv-screen h4,
#boss-code-tv-screen p,

#support-screen h1,
#support-screen h2,
#support-screen h3,
#support-screen h4,
#support-screen p,

#the-code-clothing-screen h1,
#the-code-clothing-screen h2,
#the-code-clothing-screen h3,
#the-code-clothing-screen h4,
#the-code-clothing-screen p{
color:#111 !important;
}


/* ---------------------------------------------------------
   MUSIC
--------------------------------------------------------- */

#music-screen .music-wrap,
#music-screen .music-header,
#music-screen .music-section,
#music-screen .featured-release,
#music-screen .music-player-shell,
#music-screen .featured-artist,
#music-screen .boss-footer{
background:#fff !important;
color:#111 !important;
}

#music-screen .music-header p,
#music-screen .featured-description,
#music-screen .music-player-message,
#music-screen .now-playing-info{
color:#555 !important;
}


/* ---------------------------------------------------------
   B.O.S.S CHECK IN
--------------------------------------------------------- */

#boss-checkin-screen .checkin-wrap,
#boss-checkin-screen .checkin-intro,
#boss-checkin-screen .checkin-question-screen,
#boss-checkin-screen .checkin-results,
#boss-checkin-screen .score-category,
#boss-checkin-screen .next-decision-box,
#boss-checkin-screen .checkin-disclaimer{
background:#fff !important;
color:#111 !important;
}

#boss-checkin-screen .checkin-description,
#boss-checkin-screen .checkin-question-text,
#boss-checkin-screen .boss-score-description{
color:#333 !important;
}


/* ---------------------------------------------------------
   DECISION MAKERS
--------------------------------------------------------- */

#decision-makers-screen .decision-header,
#decision-makers-screen .decision-section,
#decision-makers-screen .action-card,
#decision-makers-screen .session-card,
#decision-makers-screen .dm-course-access,
#decision-makers-screen .dm-course-card,
#decision-makers-screen .dm-course-card-body,
#decision-makers-screen .dm-resource-card,
#decision-makers-screen .dm-resource-content,
#decision-makers-screen .dm-course-player-shell,
#decision-makers-screen .dm-course-player-content,
#decision-makers-screen .dm-course-message,
#decision-makers-screen .dm-course-prompt,
#decision-makers-screen .dm-past-day-card,
#decision-makers-screen .dm-complete-box,
#decision-makers-screen .dm-auth-code-panel,
#decision-makers-screen .dm-auth-signed-panel,
#decision-makers-screen .boss-footer{
background:#fff !important;
color:#111 !important;
}

#decision-makers-screen .decision-intro,
#decision-makers-screen .decision-section-copy,
#decision-makers-screen .dm-auth-code-note,
#decision-makers-screen .dm-auth-signed-copy,
#decision-makers-screen .dm-course-card-body p,
#decision-makers-screen .dm-resource-content p{
color:#555 !important;
}

#decision-makers-screen .dm-course-card,
#decision-makers-screen .dm-resource-card,
#decision-makers-screen .dm-course-access,
#decision-makers-screen .dm-past-day-card{
border-color:#ddd !important;
}


/* ---------------------------------------------------------
   THE BOSS BITE
--------------------------------------------------------- */

#boss-bite-screen .section-header,
#boss-bite-screen .featured-player-section,
#boss-bite-screen .boss-section,
#boss-bite-screen .restaurant-browser,
#boss-bite-screen .restaurant-browser-header,
#boss-bite-screen .road-trip-layout,
#boss-bite-screen .boss-footer{
background:#fff !important;
color:#111 !important;
}


/* ---------------------------------------------------------
   B.O.S.S CODE TV
--------------------------------------------------------- */

#boss-code-tv-screen .boss-tv-page,
#boss-code-tv-screen .boss-tv-live-section,
#boss-code-tv-screen .boss-tv-live-bottom,
#boss-code-tv-screen .boss-tv-recorded-section,
#boss-code-tv-screen .boss-footer{
background:#fff !important;
color:#111 !important;
}

#boss-code-tv-screen .boss-tv-live-description,
#boss-code-tv-screen .boss-tv-recorded-copy{
color:#555 !important;
}


/* ---------------------------------------------------------
   SUPPORT IS A DECISION
--------------------------------------------------------- */

#support-screen .support-wrap,
#support-screen .support-hero,
#support-screen .support-card,
#support-screen .support-principle,
#support-screen .support-custom,
#support-screen .support-selected,
#support-screen .support-shirt-message,
#support-screen .support-dollar,
#support-screen .support-footer{
background:#fff !important;
color:#111 !important;
}

#support-screen .support-card{
border-color:#d72f22 !important;
}

#support-screen .support-hero p,
#support-screen .support-payment-note,
#support-screen .support-selected span{
color:#555 !important;
}

#support-screen .support-custom input,
#support-screen .support-field input,
#support-screen .support-field textarea{
background:#fff !important;
color:#111 !important;
border-color:#ccc !important;
}

#support-screen .support-custom{
border-color:#ddd !important;
}


/* ---------------------------------------------------------
   THE CODE CLOTHING
   Already white, this simply keeps it aligned with the app.
--------------------------------------------------------- */

#the-code-clothing-screen,
#the-code-clothing-screen .clothing-shell,
#the-code-clothing-screen .clothing-product-card,
#the-code-clothing-screen .clothing-detail-info,
#the-code-clothing-screen .clothing-cart-shell{
background:#fff !important;
color:#111 !important;
}


/* ---------------------------------------------------------
   COMMON FOOTERS / INPUTS
--------------------------------------------------------- */

#music-screen .boss-footer,
#decision-makers-screen .boss-footer,
#boss-bite-screen .boss-footer,
#boss-code-tv-screen .boss-footer,
#support-screen .boss-footer{
color:#111 !important;
}


/* ---------------------------------------------------------
   KEEP BUTTONS THE SAME
   Text inside a button inherits that button's existing color.
--------------------------------------------------------- */

#home-screen button,
#home-screen button *,
#home-screen .app-button,
#home-screen .app-button *,

#music-screen button,
#music-screen button *,

#boss-checkin-screen button,
#boss-checkin-screen button *,

#decision-makers-screen button,
#decision-makers-screen button *,

#boss-bite-screen button,
#boss-bite-screen button *,

#boss-code-tv-screen button,
#boss-code-tv-screen button *,

#support-screen button,
#support-screen button *,

#the-code-clothing-screen button,
#the-code-clothing-screen button *{
color:inherit !important;
}


/* ---------------------------------------------------------
   VIDEO AND IMAGE PLAYERS STAY DARK WHERE NEEDED
--------------------------------------------------------- */

#boss-bite-screen .featured-player,
#boss-code-tv-screen .boss-tv-live-player,
#decision-makers-screen .dm-course-video,
#decision-makers-screen .dm-session-video-wrap{
background:#000 !important;
}

`;

document.head.appendChild(
style
);

}

/* =========================================================
   START APP
========================================================= */

installBossCodeWhiteTheme();


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

repositionReturnHomeButtons();


trackAnalytics(
'app_visit',
{

section:
'app',

itemTitle:
'B.O.S.S CODE GO APP OPEN'

}
);


sync();


scheduleDemographicsPrompt();