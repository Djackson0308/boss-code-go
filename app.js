const API='https://boss-code-go-api.dezthareason4ever.workers.dev';
const R2='https://pub-69ad8f1a82a844a8bfaf18afa69ed6fe.r2.dev';

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

function showScreen(s){
if(!s)return;
qa('.screen').forEach(x=>x.classList.remove('active-screen'));
s.classList.add('active-screen');
window.scrollTo({top:0,behavior:'smooth'});
if(s.id==='boss-bite-screen'&&bossBiteMap)setTimeout(()=>bossBiteMap.resize(),250);
if(s.id==='boss-code-tv-screen')renderLive();
}

const home=$('home-screen');
const bite=$('boss-bite-screen');
const tv=$('boss-code-tv-screen');
const dm=$('decision-makers-screen');
const check=$('boss-checkin-screen');
const music=$('music-screen');

on('boss-bite-button','click',()=>{showScreen(bite);initMap()});
on('boss-bite-back','click',()=>showScreen(home));

on('boss-code-tv-button','click',()=>showScreen(tv));
on('boss-code-tv-back','click',()=>{buildTv();showScreen(home)});

on('decision-makers-button','click',()=>showScreen(dm));
on('decision-makers-back','click',()=>{stopDM();showScreen(home)});

on('boss-checkin-button','click',()=>{showScreen(check);showCheckIntro()});
on('boss-checkin-back','click',()=>showScreen(home));

on('music-button','click',()=>{showScreen(music);renderArtists()});
on('music-back','click',()=>{
if(audio&&!audio.paused)audio.pause();
showScreen(home);
});

on('go-to-decision-makers','click',()=>showScreen(dm));


/* =========================================================
   DAILY DECISION
========================================================= */

const daily=[
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

const DK='boss-code-daily-decision-v2';
const DAY=86400000;

function dailyState(){
let s;

try{
s=JSON.parse(localStorage.getItem(DK)||'null');
}catch{}

const now=Date.now();

if(!s||!Number.isInteger(s.i)||!s.t){
s={
i:Math.floor(now/DAY)%daily.length,
t:now,
seen:false
};
}

const c=Math.floor((now-s.t)/DAY);

if(c>0){
s.i=(s.i+c)%daily.length;
s.t+=c*DAY;
s.seen=false;
}

localStorage.setItem(DK,JSON.stringify(s));
return s;
}

function renderDaily(){
const s=dailyState();
const d=daily[s.i];

if($('daily-decision-number'))
$('daily-decision-number').textContent=
'DECISION '+String(s.i+1).padStart(3,'0');

if($('daily-decision-title'))
$('daily-decision-title').textContent=d[0];

if($('daily-decision-move-text'))
$('daily-decision-move-text').textContent=d[1];

if($('daily-decision-home-preview'))
$('daily-decision-home-preview').textContent=d[0];

if($('daily-decision-confirmation'))
$('daily-decision-confirmation').textContent=
s.seen?'DECISION MADE. NOW MOVE.':'';
}

function openDaily(){
const m=$('daily-decision-modal');
if(!m)return;

renderDaily();
m.classList.add('open');
m.setAttribute('aria-hidden','false');
document.body.style.overflow='hidden';
}

function closeDaily(mark=true){
const m=$('daily-decision-modal');

if(mark){
const s=dailyState();
s.seen=true;
localStorage.setItem(DK,JSON.stringify(s));
}

if(m){
m.classList.remove('open');
m.setAttribute('aria-hidden','true');
}

document.body.style.overflow='';
}

on('daily-decision-close','click',()=>closeDaily());
on('daily-decision-reopen','click',openDaily);

on('daily-decision-made','click',()=>{
const s=dailyState();
s.seen=true;
localStorage.setItem(DK,JSON.stringify(s));
renderDaily();
setTimeout(()=>closeDaily(false),600);
});

window.addEventListener('load',()=>{
renderDaily();

setTimeout(()=>{
const s=$('splash-screen');

if(s){
s.classList.add('fade-out');

setTimeout(()=>{
s.style.display='none';
if(!dailyState().seen)openDaily();
},700);

}else if(!dailyState().seen){
openDaily();
}
},1500);
});


/* =========================================================
   MUSIC
========================================================= */

const builtArtists=[
{
id:'dez',
name:'Dez Tha Reason',
initials:'DTR',
image:'Music/dez-tha-reason/artwork/Dez photo.jpg',
tagline:'Music. Purpose. Perspective.',

featuredRelease:{
title:'RISE OF THE DECISION MAKER',
type:'FEATURED PROJECT',
artwork:'Music/dez-tha-reason/artwork/Rise Cover.jpg',
description:'Listen to Dez Tha Reason directly inside B.O.S.S CODE Music.'
},

tracks:[
['Winners Delight','Music/dez-tha-reason/music/1.Winners Delight.wav'],
['Greatness Is A Decision','Music/dez-tha-reason/music/2.GREATNESS.wav'],
['Heavy Is The Head','Music/dez-tha-reason/music/3.Heavy.wav']
].map(x=>({
title:x[0],
album:'RISE OF THE DECISION MAKER',
audioSources:[x[1]],
artwork:'Music/dez-tha-reason/artwork/Rise Cover.jpg',
status:'PLAY'
})),

releases:[
{
title:'RISE OF THE DECISION MAKER',
type:'PROJECT',
artwork:'Music/dez-tha-reason/artwork/Rise Cover.jpg',
status:'Listen now'
}
]
},

{
id:'fundamentals',
name:'Fundamentals',
initials:'FUN',
image:'Music/fundamentals/artwork/fundamentals-photo.jpg',
tagline:'Independent music from B.O.S.S CODE Music.',

featuredRelease:{
title:'RISE OF THE DECISION MAKER',
type:'FEATURED RELEASE',
artwork:'Music/fundamentals/artwork/Fun-album-cover.png',
description:'Listen to Fundamentals directly inside B.O.S.S CODE Music.'
},

tracks:[
{
title:'Is There Something Wrong With Me',
album:'RISE OF THE DECISION MAKER',
audioSources:[
'Music/fundamentals/music/Is There Something.mp3'
],
artwork:'Music/fundamentals/artwork/Fun-album-cover.png',
status:'PLAY'
}
],

releases:[
{
title:'RISE OF THE DECISION MAKER',
type:'PROJECT',
artwork:'Music/fundamentals/artwork/Fun-album-cover.png',
status:'Listen now'
}
]
}
];

let artists=[...builtArtists];
let activeArtist=artists[0];
let trackIndex=-1;
let sourceIndex=0;

const audio=$('boss-music-audio');

function ensureArtistUI(){
const h=q('#music-screen .music-header');
if(!h)return;

if(!$('artist-picker-section')){
const s=document.createElement('section');

s.id='artist-picker-section';
s.className='artist-picker-section';

s.innerHTML=`
<div class="artist-picker-heading">
<span>B.O.S.S CODE MUSIC</span>
<h2>CHOOSE YOUR ARTIST</h2>
<p>Pick an artist to explore their music.</p>
</div>
<div id="artist-grid" class="artist-grid"></div>
`;

h.insertAdjacentElement('afterend',s);

const b=document.createElement('section');
b.id='selected-artist-banner';
b.className='selected-artist-banner';

s.insertAdjacentElement('afterend',b);
}
}

function renderArtists(){
ensureArtistUI();

const g=$('artist-grid');
if(!g)return;

g.innerHTML='';

artists.forEach(a=>{
const b=document.createElement('button');

b.type='button';
b.className='artist-card'+(a===activeArtist?' active':'');

b.innerHTML=`
<div class="artist-card-image">
<img src="${esc(a.image)}" alt="${esc(a.name)}">
</div>

<div class="artist-card-body">
<span>ARTIST</span>
<strong>${esc(a.name)}</strong>
</div>
`;

b.onclick=()=>loadArtist(a);
g.appendChild(b);
});

updateArtistUI();
}

function loadArtist(a){
if(!a)return;

if(audio){
audio.pause();
audio.removeAttribute('src');
audio.load();
}

activeArtist=a;
trackIndex=-1;

renderArtists();
renderTracks();
renderReleases();
updateArtistUI();
resetPlayer();
}

function updateArtistUI(){
const b=$('selected-artist-banner');

if(b){
b.innerHTML=`
<div class="selected-artist-photo">
<img src="${esc(activeArtist.image)}" alt="${esc(activeArtist.name)}">
</div>

<div class="selected-artist-info">
<span>NOW VIEWING</span>
<h2>${esc(activeArtist.name)}</h2>
<p>${esc(activeArtist.tagline||'')}</p>
</div>
`;

b.classList.add('show');
}

const im=q('#music-screen .music-artist-logo');

if(im){
im.src=activeArtist.image;
im.alt=activeArtist.name;
}

const f=activeArtist.featuredRelease;
if(!f)return;

const t=q('.featured-release-info h2');
const ar=q('.featured-artist');
const lab=q('.featured-label');
const d=q('.featured-description');
const c=q('.placeholder-cover');

if(t)t.textContent=f.title;
if(ar)ar.textContent=activeArtist.name.toUpperCase();
if(lab)lab.textContent=f.type;
if(d)d.textContent=f.description;

if(c){
c.innerHTML=`
<img src="${esc(f.artwork)}" alt="${esc(f.title)}">
`;
}
}

function renderTracks(){
const g=$('music-track-list');
if(!g)return;

g.innerHTML='';

(activeArtist.tracks||[]).forEach((t,i)=>{
const r=document.createElement('article');

r.className='music-track';
r.dataset.track=i;

r.innerHTML=`
<div class="track-number">
${String(i+1).padStart(2,'0')}
</div>

<div class="track-info">
<strong>${esc(t.title)}</strong>
<span>${esc(activeArtist.name)} • ${esc(t.album||'')}</span>
</div>

<div class="track-status">
${esc(t.status||'PLAY')}
</div>

<div class="track-play-icon">
▶
</div>
`;

r.onclick=()=>playTrack(i);
g.appendChild(r);
});
}

function renderReleases(){
const g=q('.release-grid');
if(!g)return;

g.innerHTML='';

(activeArtist.releases||[]).forEach(r=>{
const c=document.createElement('article');

c.className='release-card';

c.innerHTML=`
<div class="release-placeholder">
<img src="${esc(r.artwork)}" alt="${esc(r.title)}">
</div>

<div class="release-info">
<span>${esc(r.type||'RELEASE')}</span>
<h3>${esc(r.title)}</h3>
<p>${esc(r.status||'Listen now')}</p>
</div>
`;

g.appendChild(c);
});
}

function playTrack(i){
const t=(activeArtist.tracks||[])[i];

if(!t||!audio)return;

trackIndex=i;
sourceIndex=0;

qa('.music-track').forEach(x=>x.classList.remove('active'));

const row=q(`.music-track[data-track="${i}"]`);
if(row)row.classList.add('active');

if($('now-playing-title'))
$('now-playing-title').textContent=t.title;

if($('now-playing-artist'))
$('now-playing-artist').textContent=activeArtist.name;

if($('now-playing-art')){
$('now-playing-art').innerHTML=`
<img src="${esc(t.artwork)}" alt="${esc(t.title)}">
`;
}

loadSource(true);
}

function loadSource(play){
const t=(activeArtist.tracks||[])[trackIndex];
const src=t?.audioSources?.[sourceIndex];

if(!src||!audio)return;

audio.src=src;
audio.load();

if(play)audio.play().catch(()=>{});
}

function resetPlayer(){
if($('now-playing-title'))
$('now-playing-title').textContent='SELECT A TRACK';

if($('now-playing-artist'))
$('now-playing-artist').textContent=activeArtist.name;

if($('now-playing-art')){
$('now-playing-art').innerHTML=`
<img
src="${esc(activeArtist.featuredRelease?.artwork||activeArtist.image)}"
alt="${esc(activeArtist.name)}"
>
`;
}

if($('music-progress'))
$('music-progress').value=0;

if($('music-current-time'))
$('music-current-time').textContent='0:00';

if($('music-duration'))
$('music-duration').textContent='0:00';
}

const fmt=s=>
!Number.isFinite(s)
?'0:00'
:Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');

on('music-play-pause','click',()=>{
if(!audio)return;

if(trackIndex<0){
if(activeArtist.tracks?.length)playTrack(0);
return;
}

audio.paused
?audio.play().catch(()=>{})
:audio.pause();
});

on('music-next','click',()=>{
const n=activeArtist.tracks?.length||0;
if(n)playTrack((trackIndex+1+n)%n);
});

on('music-previous','click',()=>{
const n=activeArtist.tracks?.length||0;
if(n)playTrack((trackIndex-1+n)%n);
});

on('play-featured-release','click',()=>{
if(activeArtist.tracks?.length)playTrack(0);
});

on('music-progress','input',e=>{
if(audio?.duration)
audio.currentTime=(+e.target.value/100)*audio.duration;
});

if(audio){

audio.addEventListener('play',()=>{
if($('music-play-pause'))
$('music-play-pause').textContent='Ⅱ';
});

audio.addEventListener('pause',()=>{
if($('music-play-pause'))
$('music-play-pause').textContent='▶';
});

audio.addEventListener('timeupdate',()=>{
if($('music-current-time'))
$('music-current-time').textContent=fmt(audio.currentTime);

if($('music-duration'))
$('music-duration').textContent=fmt(audio.duration);

if($('music-progress'))
$('music-progress').value=
audio.duration
?audio.currentTime/audio.duration*100
:0;
});

audio.addEventListener('ended',()=>{
const n=activeArtist.tracks?.length||0;
if(n)playTrack((trackIndex+1)%n);
});

audio.addEventListener('error',()=>{
const t=activeArtist.tracks?.[trackIndex];

if(t&&sourceIndex<(t.audioSources?.length||0)-1){
sourceIndex++;
loadSource(true);
}
});
}


/* =========================================================
   DECISION MAKERS
========================================================= */

const dmVideos=[
[
'Be Intentional',
`${R2}/decision-makers/Be%20Intentional.mp4`,
'Move through your day with intention instead of letting everything around you decide your direction.'
],
[
'Celebrity',
`${R2}/decision-makers/Celebrity.mp4`,
'A quick perspective on attention, influence and how we choose who gets access to our thinking.'
],
[
'Congrats To You',
`${R2}/decision-makers/Congrats-to-you.mp4`,
'Sometimes you need to recognize the progress you have already made before rushing toward the next thing.'
],
[
"Don't Be Afraid",
`${R2}/decision-makers/Dont%20Be%20Affraid.mp4`,
'Fear can speak loudly, but it does not have to make the decision.'
],
[
"Don't Be Surprised",
`${R2}/decision-makers/Dont%20Be%20Surprised.mp4`,
'When you have put in the work, stop acting surprised when the opportunity finally arrives.'
],
[
'One Life To Live',
`${R2}/decision-makers/One%20Life%20To%20Live.mp4`,
'You only get one life. Make decisions that reflect what really matters to you.'
],
[
'Peace',
`${R2}/decision-makers/Peace.mp4`,
'Protecting your peace sometimes requires making a decision about what no longer deserves your energy.'
],
[
"You're The Teacher",
"Videos/Decision Makers/You're The Teacher.mp4",
'Your choices are teaching people how to treat you and teaching you what you are willing to accept.'
]
].map(x=>({
title:x[0],
file:x[1],
description:x[2],
category:'ON THE GO'
}));

function yt(url=''){
for(const r of [
/youtube\.com\/live\/([^?&/]+)/,
/youtube\.com\/watch\?v=([^&]+)/,
/youtu\.be\/([^?&/]+)/,
/youtube\.com\/embed\/([^?&/]+)/,
/youtube\.com\/shorts\/([^?&/]+)/
]){
const m=url.match(r);
if(m)return m[1];
}
return'';
}

function buildDM(){
const row=q('#decision-makers-screen .on-the-go-row');
if(!row)return;

row.innerHTML='';

dmVideos.forEach(v=>{
const c=document.createElement('article');
c.className='on-the-go-card';

const id=v.youtubeId||yt(v.youtubeUrl||'');

const media=id
?`
<iframe
src="https://www.youtube.com/embed/${id}?rel=0"
title="${esc(v.title)}"
allowfullscreen
style="
width:100%;
height:100%;
display:block;
border:0;
background:#000;
"
></iframe>
`
:`
<video
class="decision-maker-local-video"
preload="metadata"
controls
playsinline
style="
width:100%;
height:100%;
display:block;
object-fit:contain;
background:#000;
"
>
<source src="${esc(v.file||'')}" type="video/mp4">
</video>
`;

c.innerHTML=`
<div
class="decision-placeholder-video"
style="
aspect-ratio:9/16;
background:#000;
overflow:hidden;
"
>
${media}

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

<h3>${esc(v.title)}</h3>

<p>${esc(v.description||'')}</p>
</div>
`;

row.appendChild(c);
});

qa('.decision-maker-local-video').forEach(v=>
v.addEventListener('play',()=>{
qa('.decision-maker-local-video').forEach(o=>{
if(o!==v)o.pause();
});

if(audio&&!audio.paused)audio.pause();
})
);
}

function stopDM(){
qa('.decision-maker-local-video').forEach(v=>v.pause());
}

const challenges={
decision:[
'YOU MADE THE DECISION.',
'Write down the thing you have been putting off. Decide today that waiting is over.'
],
step:[
'NOW MOVE.',
'Complete one real action toward your goal before today ends.'
],
perfect:[
'PROGRESS OVER PERFECT.',
'Start before everything is polished. Improve while moving.'
]
};

qa('.action-button').forEach(b=>
b.addEventListener('click',()=>{
const x=challenges[b.dataset.action];
if(!x)return;

if($('challenge-title'))
$('challenge-title').textContent=x[0];

if($('challenge-copy'))
$('challenge-copy').textContent=x[1];

$('decision-challenge-message')?.classList.add('show');
})
);/* =========================================================
   B.O.S.S CHECK IN
========================================================= */

const bank={

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

let cq=[];
let ci=0;
let resp=[];

const shuffle=a=>[...a].sort(()=>Math.random()-.5);

function showCheckIntro(){
if($('checkin-intro'))
$('checkin-intro').style.display='flex';

if($('checkin-questions'))
$('checkin-questions').style.display='none';

if($('checkin-results'))
$('checkin-results').style.display='none';
}

function startCheck(){
cq=shuffle(
Object.entries(bank).flatMap(([cat,arr])=>
shuffle(arr)
.slice(0,3)
.map(text=>({cat,text}))
)
);

ci=0;
resp=[];

$('checkin-intro').style.display='none';
$('checkin-results').style.display='none';
$('checkin-questions').style.display='block';

renderQ();
}

function renderQ(){
const x=cq[ci];
if(!x)return;

const n=ci+1;
const total=cq.length;
const p=Math.round(n/total*100);

if($('question-count'))
$('question-count').textContent=`QUESTION ${n} OF ${total}`;

if($('progress-percent'))
$('progress-percent').textContent=`${p}%`;

if($('checkin-progress-bar'))
$('checkin-progress-bar').style.width=`${p}%`;

if($('question-category'))
$('question-category').textContent=x.cat;

if($('checkin-question-text'))
$('checkin-question-text').textContent=x.text;

const a=$('checkin-answers');
if(!a)return;

a.innerHTML='';

[
['NEVER',0],
['RARELY',1],
['SOMETIMES',2],
['OFTEN',3],
['VERY OFTEN',4]
].forEach(([lab,val])=>{

const b=document.createElement('button');

b.type='button';
b.className='checkin-answer-button';
b.textContent=lab;

b.onclick=()=>{
resp[ci]=val;

if(ci<total-1){
ci++;
renderQ();
}else{
finishCheck();
}
};

a.appendChild(b);
});

if($('previous-question'))
$('previous-question').style.visibility=
ci?'visible':'hidden';
}

function finishCheck(){
const cats={
APPROVAL:[],
COMPARISON:[],
CONFIDENCE:[],
ACTION:[]
};

cq.forEach((x,i)=>
cats[x.cat].push(resp[i]??0)
);

const scores={};

Object.entries(cats).forEach(([k,v])=>{
scores[k]=100-Math.round(
v.reduce((a,b)=>a+b,0)/(v.length*4)*100
);
});

const overall=Math.round(
Object.values(scores).reduce((a,b)=>a+b,0)/4
);

$('checkin-questions').style.display='none';
$('checkin-results').style.display='block';

if($('boss-score'))
$('boss-score').textContent=overall;

if($('boss-score-title')){
$('boss-score-title').textContent=
overall>=80
?'STRONG DECISION CONTROL'
:overall>=60
?'KEEP BUILDING'
:'SOCIAL STRESS IS IN THE ROOM';
}

if($('boss-score-description')){
$('boss-score-description').textContent=
overall>=80
?'Outside pressure is not driving most of your decisions. Keep protecting that clarity.'
:overall>=60
?'You have a solid base, but a few areas are still influencing how you move.'
:'Outside pressure, hesitation or comparison may be influencing too many decisions right now.';
}

Object.entries(scores).forEach(([k,v])=>{
const id=k.toLowerCase();

if($(`${id}-score`))
$(`${id}-score`).textContent=v;

if($(`${id}-meter`))
$(`${id}-meter`).style.width=`${v}%`;
});

const weak=
Object.entries(scores)
.sort((a,b)=>a[1]-b[1])[0][0];

if($('weakest-category'))
$('weakest-category').textContent=weak;

if($('weakest-message')){
$('weakest-message').textContent={
APPROVAL:'You may be giving other people too much voting power over your decisions.',
COMPARISON:'Your attention may be drifting from your own lane into somebody else’s timeline.',
CONFIDENCE:'You may know more than you are allowing yourself to trust.',
ACTION:'The issue may not be clarity. It may be execution.'
}[weak];
}

if($('next-decision')){
$('next-decision').textContent={
APPROVAL:'Make one decision today without explaining it to anybody.',
COMPARISON:'Measure today against your own last 30 days, not somebody else’s highlight reel.',
CONFIDENCE:'Take one action before asking anybody for reassurance.',
ACTION:'Complete the next obvious step before planning anything else.'
}[weak];
}
}

on('start-checkin','click',startCheck);

on('previous-question','click',()=>{
if(ci>0){
ci--;
renderQ();
}
});

on('retake-checkin','click',showCheckIntro);


/* =========================================================
   THE BOSS BITE
========================================================= */

const episodes=[
{
id:'trailer',
title:'The Boss Bite Trailer',
description:'Welcome to The Boss Bite. Fueling Your Hustle.',
youtubeUrl:'https://youtu.be/wKAwLNXTf6g'
},
{
id:'haitian',
title:'Haitian Sensation',
description:'The Boss Bite visits Haitian Sensation.',
youtubeUrl:'https://youtu.be/D6GujKBRZX0'
},
{
id:'spudz',
title:'House of Spudz + Pickle Fest',
description:'Loaded potatoes, big flavors and Pickle Fest.',
youtubeUrl:'https://youtu.be/uLLjlAieS64'
},
{
id:'rr',
title:"The Coffee Shop That You Won't Want To Leave",
description:'The Boss Bite visits R+R Coffee Bar.',
youtubeUrl:'https://youtu.be/bRhah6mR2zk'
},
{
id:'grizzly',
title:'Did We Find The Coolest Coffee Shop Ever',
description:'The Boss Bite visits Grizzly Bean Coffee.',
youtubeUrl:'https://youtu.be/vxNr89y_5IY'
}
];

function buildEpisodes(){
const g=$('episode-grid');
if(!g)return;

g.innerHTML='';

episodes.forEach(e=>{
const id=yt(e.youtubeUrl);
const c=document.createElement('article');

c.className='episode-card';

c.innerHTML=`
<div class="episode-thumbnail">
<img
src="https://img.youtube.com/vi/${id}/hqdefault.jpg"
alt="${esc(e.title)}"
>
<div class="play-circle">▶</div>
</div>

<div class="episode-info">
<h3>${esc(e.title)}</h3>
<p>${esc(e.description||'')}</p>
</div>
`;

c.onclick=()=>playEpisode(id,e.title);
g.appendChild(c);
});
}

function playEpisode(id,title){
const p=$('featured-player');
if(!p||!id)return;

p.innerHTML=`
<iframe
src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0"
title="${esc(title)}"
allow="autoplay; encrypted-media; picture-in-picture"
allowfullscreen
></iframe>
`;

if($('featured-title'))
$('featured-title').textContent=title;

p.scrollIntoView({
behavior:'smooth',
block:'center'
});
}

function loadFirstEpisode(){
const e=episodes[0];
const p=$('featured-player');

if(!e||!p)return;

const id=yt(e.youtubeUrl);

p.innerHTML=`
<iframe
src="https://www.youtube.com/embed/${id}?rel=0"
title="${esc(e.title)}"
allowfullscreen
></iframe>
`;

if($('featured-title'))
$('featured-title').textContent=e.title;
}


/* =========================================================
   B.O.S.S CODE TV
========================================================= */

const tvVideos=[
['Xavier Simmons (Son Of DMX)','wHHYCaypgvc'],
['Layzie Bone (Member of Bone Thugs-N-Harmony)','4EJHi_E2JTo'],
['Cormega Part 1','NukOMiQESl0'],
['Cormega Part 2','CZfe1hiIJd4'],
['Steve Baughman (Grammy Award-Winning Engineer)','54rw1X4dCKw'],
['James Starks (Super Bowl Winning RB)','TADG86xTtSQ'],
['Eric Sattler (Filmmaker)','T2myWEyUrTI']
].map(x=>({
title:x[0],
id:x[1]
}));

let live={
on:false,
id:''
};

function buildTv(){
const g=$('boss-code-tv-grid');
if(!g)return;

g.innerHTML='';

tvVideos.forEach(v=>{
const c=document.createElement('article');

c.className='tv-card';

c.innerHTML=`
<div class="tv-player">
<div class="tv-media">

<button
class="tv-thumbnail"
type="button"
data-video-id="${v.id}"
>
<img
src="https://img.youtube.com/vi/${v.id}/hqdefault.jpg"
alt="${esc(v.title)}"
>
<span class="tv-play-button"></span>
</button>

</div>
</div>

<div class="tv-card-body">
<h3>${esc(v.title)}</h3>
</div>
`;

g.appendChild(c);
});

renderLive();
}

$('boss-code-tv-grid')?.addEventListener('click',e=>{
const b=e.target.closest('.tv-thumbnail');
if(!b)return;

const id=b.dataset.videoId;
const media=b.closest('.tv-media');

if(media){
media.innerHTML=`
<iframe
class="tv-iframe"
src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0"
allow="autoplay; encrypted-media; picture-in-picture"
allowfullscreen
></iframe>
`;
}
});

function renderLive(){
const s=q('.boss-tv-live-section');
if(!s)return;

const p=q('.boss-tv-live-player',s);
const badge=q('.boss-tv-live-badge',s);
const lab=q('.boss-tv-live-label',s);
const title=q('.boss-tv-live-bottom strong',s);
const copy=q('.boss-tv-live-bottom p',s);

if(live.on&&live.id){

if(badge){
badge.innerHTML='<span class="live-dot"></span> LIVE';
badge.style.background='#d40000';
badge.style.color='#fff';
}

if(p){
p.innerHTML=`
<iframe
src="https://www.youtube.com/embed/${live.id}?rel=0"
title="B.O.S.S CODE TV LIVE"
allowfullscreen
></iframe>
`;
}

if(lab){
lab.textContent='LIVE BROADCAST';
lab.style.color='#d40000';
}

if(title)
title.textContent='B.O.S.S CODE MEDIA LIVE STREAM';

if(copy)
copy.textContent=
'Watch the current B.O.S.S CODE MEDIA broadcast live inside B.O.S.S CODE GO.';

}else{

if(badge){
badge.textContent='OFF AIR';
badge.style.background='#181818';
badge.style.color='#888';
}

if(p){
p.innerHTML=`
<div
style="
min-height:280px;
display:grid;
place-items:center;
text-align:center;
background:#050505;
color:#777;
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

if(lab){
lab.textContent='CURRENT STATUS';
lab.style.color='#F5C518';
}

if(title)
title.textContent='B.O.S.S CODE TV IS CURRENTLY OFF AIR';

if(copy)
copy.textContent=
'Previously recorded interviews and conversations are available below.';
}
}


/* =========================================================
   BOSS BITE GALLERY
========================================================= */

const galleryPhotos=
Array.from(
{length:29},
(_,i)=>`images/Action photos/bossbite-${i+1}`
);

const exts=[
'.jpg',
'.jpeg',
'.png',
'.webp'
];

let gi=0;

function setImg(img,base,n=0){
if(n>=exts.length)return;

img.src=base+exts[n];

img.onerror=()=>setImg(
img,
base,
n+1
);
}

function buildGallery(){
const g=$('boss-bite-gallery');
if(!g)return;

g.innerHTML='';

galleryPhotos.forEach((base,i)=>{
const b=document.createElement('button');
const im=document.createElement('img');

b.type='button';
b.className='gallery-photo';

im.alt='Boss Bite photo';

setImg(im,base);

b.appendChild(im);

b.onclick=()=>{
gi=i;
showGal();
$('gallery-lightbox')?.classList.add('open');
};

g.appendChild(b);
});
}

function showGal(){
const im=$('gallery-large-image');

if(im)
setImg(im,galleryPhotos[gi]);

if($('gallery-counter'))
$('gallery-counter').textContent=
`${gi+1} / ${galleryPhotos.length}`;
}

on('gallery-close','click',()=>{
$('gallery-lightbox')?.classList.remove('open');
});

on('gallery-next','click',()=>{
gi=(gi+1)%galleryPhotos.length;
showGal();
});

on('gallery-previous','click',()=>{
gi=(gi-1+galleryPhotos.length)%galleryPhotos.length;
showGal();
});


/* =========================================================
   BOSS BITE MAP
========================================================= */

const restaurants=[
{
id:'grizzly',
name:'Grizzly Bean Coffee',
category:'COFFEE • FOOD',
address:'2560 E State St, Hermitage, PA 16148',
image:'images/restaurants/Grizzly bean.jpg',
episodeId:'grizzly',
c:[-80.435,41.233]
},
{
id:'haitian',
name:'Haitian Sensation',
category:'HAITIAN • CARIBBEAN • COFFEE',
address:'76 Shenango Ave, Sharon, PA 16146',
image:'images/restaurants/haitian sensation.png',
episodeId:'haitian',
c:[-80.508,41.233]
},
{
id:'rr',
name:'R+R Coffee Bar',
category:'COFFEE • COMMUNITY',
address:'2840 Lincoln Way E Unit H, Massillon, OH 44646',
image:'images/restaurants/rr coffee.jpg',
episodeId:'rr',
c:[-81.482421,40.796612]
},
{
id:'spudz',
name:'House of Spudz',
category:'LOADED POTATOES • COMFORT FOOD',
address:'3974 Fulton Dr NW, Canton, OH 44718',
image:'images/restaurants/house of spudz.jpeg',
episodeId:'spudz',
c:[-81.422358,40.835695]
},
{
id:'century',
name:'Century Farms',
category:'VENUE • LOCAL EXPERIENCE',
address:'1121 Canton Rd NW, Carrollton, OH 44615',
image:'images/restaurants/century.jpeg',
c:[-81.085,40.588]
},
{
id:'deli',
name:'Deli On The Square',
category:'DELI • LOCAL FOOD',
address:'50 S Lisbon St, Carrollton, OH 44615',
image:'images/restaurants/Deli on the square.jpeg',
c:[-81.086,40.572]
},
{
id:'carroll-coffee',
name:'Carroll County Coffee Company',
category:'COFFEE',
address:'704 Canton Rd NW # C, Carrollton, OH 44615',
image:'images/restaurants/Carroll County.jpeg',
c:[-81.0916092,40.5820228]
},
{
id:'betty',
name:'Betty Kaye Bakery',
category:'BAKERY • SWEETS',
address:'72 W Main St, Carrollton, OH 44615',
image:'images/restaurants/betty kaye.png',
c:[-81.087,40.572]
},
{
id:'chop-house',
name:'The Chop House Carrollton',
category:'STEAKHOUSE • DINING',
address:'1117 Canton Rd NW, Carrollton, OH 44615',
image:'images/restaurants/The chop house.png',
c:[-81.085,40.588]
}
];

let bossBiteMap=null;
let mapLoaded=false;

const marks={};

function buildRestaurantList(){
const l=$('restaurant-list');
if(!l)return;

l.innerHTML='';

restaurants.forEach(r=>{
const b=document.createElement('button');

b.type='button';
b.className='restaurant-list-item';

b.innerHTML=`
<img
class="restaurant-list-image"
src="${esc(r.image)}"
alt="${esc(r.name)}"
>

<div class="restaurant-list-info">
<strong>${esc(r.name)}</strong>
<span>${esc(r.category)}</span>
</div>
`;

b.onclick=()=>focusRestaurant(r.id);

l.appendChild(b);
});
}

function popup(r){
return`
<div class="restaurant-popup">

<img
class="restaurant-popup-image"
src="${esc(r.image)}"
alt="${esc(r.name)}"
>

<div class="restaurant-popup-body">

<h3>${esc(r.name)}</h3>

<div class="restaurant-category">
${esc(r.category)}
</div>

<div class="restaurant-address">
${esc(r.address)}
</div>

${
r.episodeId
?`
<button
class="restaurant-action watch-episode-button"
data-episode="${r.episodeId}"
type="button"
>
▶ WATCH EPISODE
</button>
`
:''
}

<a
class="restaurant-action directions-button"
href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.address)}"
target="_blank"
>
📍 GET DIRECTIONS
</a>

</div>
</div>
`;
}

function initMap(){
if(
mapLoaded||
!$('boss-bite-map')||
typeof maplibregl==='undefined'
){
bossBiteMap?.resize();
return;
}

mapLoaded=true;

bossBiteMap=
new maplibregl.Map({
container:'boss-bite-map',
style:'https://tiles.openfreemap.org/styles/dark',
center:[-80.9,40.85],
zoom:7
});

bossBiteMap.addControl(
new maplibregl.NavigationControl({
showCompass:false
}),
'top-left'
);

bossBiteMap.on('load',()=>{
const bounds=
new maplibregl.LngLatBounds();

restaurants.forEach(r=>{
const el=document.createElement('div');

el.className='boss-bite-map-marker';
el.innerHTML=
'<img src="images/boss-bite-pin.png">';

const m=
new maplibregl.Marker({
element:el,
anchor:'bottom'
})
.setLngLat(r.c)
.setPopup(
new maplibregl.Popup({
offset:35,
maxWidth:'285px'
}).setHTML(popup(r))
)
.addTo(bossBiteMap);

marks[r.id]=m;
bounds.extend(r.c);
});

bossBiteMap.fitBounds(
bounds,
{
padding:60,
maxZoom:9
}
);

$('map-loading')?.classList.add('hidden');

bossBiteMap.resize();
});
}

function focusRestaurant(id){
const m=marks[id];

if(!m||!bossBiteMap)return;

const p=m.getLngLat();

bossBiteMap.flyTo({
center:[p.lng,p.lat],
zoom:15,
essential:true
});

setTimeout(()=>{
if(!m.getPopup().isOpen())
m.togglePopup();
},500);
}

document.addEventListener('click',e=>{
const b=e.target.closest('.watch-episode-button');
if(!b)return;

const ep=
episodes.find(
x=>x.id===b.dataset.episode
);

if(ep)
playEpisode(
yt(ep.youtubeUrl),
ep.title
);
});


/* =========================================================
   CLOTHING
========================================================= */

const clothingButton=
qa('.app-menu .app-button')
.find(button=>
button.textContent
.toUpperCase()
.includes('THE CODE CLOTHING')
);

if(clothingButton){
clothingButton.addEventListener('click',()=>{
window.open(
'https://www.bosscodemedia.com/shop',
'_blank'
);
});
}


/* =========================================================
   CLOUDFLARE BACKEND
========================================================= */

async function api(path){
const r=await fetch(
API+path,
{
cache:'no-store',
headers:{
Accept:'application/json'
}
}
);

if(!r.ok)
throw Error(r.status);

const j=await r.json();

return Array.isArray(j.data)
?j.data
:[];
}

const merge=(a,b,key)=>{
const seen=new Set();

return [...a,...b].filter(x=>{
const k=
String(key(x)||'')
.toLowerCase()
.trim();

if(k&&seen.has(k))
return false;

if(k)
seen.add(k);

return true;
});
};

function applyVideos(rows){

/* DECISION MAKERS */

const cdm=
rows
.filter(v=>v.section==='decision-makers')
.map(v=>({
title:v.title||'Decision Makers',
youtubeUrl:v.youtube_url||'',
youtubeId:v.youtube_id||yt(v.youtube_url||''),
category:v.category||'ON THE GO',
description:v.description||''
}))
.filter(v=>v.youtubeId);

if(cdm.length){
dmVideos.splice(
0,
dmVideos.length,
...merge(
cdm,
dmVideos,
v=>v.youtubeId||v.file||v.title
)
);

buildDM();
}


/* BOSS BITE */

const cb=
rows
.filter(v=>v.section==='boss-bite')
.map(v=>({
id:'cloud-'+v.id,
title:v.title||'The Boss Bite',
description:
v.description||
[
v.location_name,
v.location_city
]
.filter(Boolean)
.join(', '),
youtubeUrl:v.youtube_url||''
}))
.filter(v=>yt(v.youtubeUrl));

if(cb.length){
episodes.splice(
0,
episodes.length,
...merge(
cb,
episodes,
v=>yt(v.youtubeUrl)||v.title
)
);

buildEpisodes();
loadFirstEpisode();
}


/* RECORDED B.O.S.S CODE TV */

const ct=
rows
.filter(v=>v.section==='boss-code-tv')
.map(v=>({
title:v.title||'B.O.S.S CODE TV',
id:v.youtube_id||yt(v.youtube_url||'')
}))
.filter(v=>v.id);

if(ct.length){
tvVideos.splice(
0,
tvVideos.length,
...merge(
ct,
tvVideos,
v=>v.id||v.title
)
);

buildTv();
}


/* LIVE TV */

const lv=
rows.find(v=>
v.section==='boss-code-tv-live'&&
(v.youtube_id||yt(v.youtube_url||''))
);

live=
lv
?{
on:true,
id:lv.youtube_id||yt(lv.youtube_url||'')
}
:{
on:false,
id:''
};

renderLive();
}


/* =========================================================
   MAGAZINE BACKEND
========================================================= */

function applyMag(rows){
if(!rows.length)return;

const x=
rows.find(r=>+r.featured===1)||
rows[0];

const b=
q(
'.app-menu a[href*="magazine.bosscodemedia.com"]'
);

if(b&&x.issue_url)
b.href=x.issue_url;
}


/* =========================================================
   MUSIC BACKEND
========================================================= */

function applyMusic(A,R,T){

A.forEach(a=>{

const rs=
R.filter(r=>
+r.artist_id===+a.id
);

const ts=
T.filter(t=>
+t.artist_id===+a.id
);

const f=
rs.find(r=>+r.featured===1)||
rs[0];

const img=
a.artist_image_url||
f?.artwork_url||
'images/boss-code-media-logo.png';

const cloud={

id:'cloud-'+a.id,

name:a.name,

initials:
(a.name||'BC')
.split(/\s+/)
.map(x=>x[0])
.join('')
.slice(0,3)
.toUpperCase(),

image:img,

tagline:
a.bio||
'Independent music. Direct from the artist.',

featuredRelease:
f
?{
title:f.title,
type:'FEATURED RELEASE',
artwork:f.artwork_url||img,
description:
f.description||
`Listen to ${a.name} directly inside B.O.S.S CODE Music.`
}
:{
title:a.name,
type:'B.O.S.S CODE MUSIC',
artwork:img,
description:a.bio||''
},

tracks:
ts.map(t=>{

const r=
rs.find(x=>
+x.id===+t.release_id
);

return{
title:t.title,
album:r?.title||'B.O.S.S CODE MUSIC',
audioSources:[t.audio_url].filter(Boolean),
artwork:r?.artwork_url||img,
status:'PLAY'
};
}),

releases:
rs.map(r=>({
title:r.title,
type:String(
r.release_type||
'RELEASE'
).toUpperCase(),
artwork:r.artwork_url||img,
status:'Listen now'
}))
};

const ex=
artists.find(
x=>
x.name.toLowerCase()===
cloud.name.toLowerCase()
);

if(!ex){
artists.push(cloud);
}else{

if(a.artist_image_url)
ex.image=cloud.image;

if(a.bio)
ex.tagline=cloud.tagline;

if(cloud.tracks.length){
ex.tracks=
merge(
cloud.tracks,
ex.tracks||[],
x=>x.title+'|'+x.album
);
}

if(cloud.releases.length){
ex.releases=
merge(
cloud.releases,
ex.releases||[],
x=>x.title
);
}

if(f)
ex.featuredRelease=
cloud.featuredRelease;
}
});

activeArtist=
artists.find(
a=>
a.name.toLowerCase()===
activeArtist.name.toLowerCase()
)||
artists[0];

renderArtists();
renderTracks();
renderReleases();
updateArtistUI();
}


/* =========================================================
   CLOUD SYNC
========================================================= */

async function sync(){
try{

const [v,m,a,r,t]=
await Promise.all([
api('/videos'),
api('/magazines'),
api('/artists'),
api('/releases'),
api('/tracks')
]);

applyVideos(v);
applyMag(m);
applyMusic(a,r,t);

console.info(
'B.O.S.S CODE GO synced'
);

}catch(e){

console.warn(
'Cloud unavailable. Built in content remains active.',
e
);

}
}


/* =========================================================
   START APP
========================================================= */

renderDaily();

renderArtists();
renderTracks();
renderReleases();

buildDM();

buildEpisodes();
loadFirstEpisode();

buildTv();

buildGallery();
buildRestaurantList();

sync();