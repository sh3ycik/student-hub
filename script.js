const K='student-hub-v1',$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let n_=0;const uid=()=>Date.now().toString(36)+(n_++).toString(36)+Math.random().toString(36).slice(2,5);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DAYS=['Пн','Вт','Ср','Чт','Пт','Сб'],COLORS=['#6366f1','#ec4899','#10b981','#f59e0b','#0ea5e9','#ef4444'];
const L=(day,s,e,subj,room,color)=>({id:uid(),day,s,e,subj,room,color});
const def=()=>({name:'Студент',accent:'#6366f1',theme:'auto',pomo:{w:25,b:5},tasks:[],grades:{},notes:[],
 lessons:[L(0,'08:30','09:50','Інформатика','21','#6366f1'),L(0,'10:00','11:20','Математика','14','#f59e0b'),L(1,'08:30','09:50','Українська мова','7','#10b981'),L(1,'10:00','11:20','Фізика','32','#ef4444'),L(2,'08:30','09:50','Англійська мова','12','#0ea5e9'),L(3,'10:00','11:20','Історія України','9','#8b5cf6'),L(4,'08:30','09:50','Біологія','25','#22c55e')]});
let S;try{S={...def(),...JSON.parse(localStorage.getItem(K)||'{}')}}catch(e){S=def()}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
const todayIdx=()=>(new Date().getDay()+6)%7;
let day=todayIdx()>5?0:todayIdx(),flt='all';

function apply(){const r=document.documentElement;r.style.setProperty('--accent',S.accent);r.dataset.theme=S.theme;
 $('#hello').textContent='Привіт, '+S.name+' 👋';$('#name').value=S.name;$('#accent').value=S.accent;$('#theme').value=S.theme;
 $('#pw').value=S.pomo.w;$('#pbk').value=S.pomo.b;
 $('#sw').innerHTML=COLORS.map(c=>`<button data-sw="${c}" style="background:${c}" title="${c}"></button>`).join('')}

function info(){const n=new Date(),hm=n.toTimeString().slice(0,5);
 const ls=S.lessons.filter(l=>l.day===todayIdx()).sort((a,b)=>a.s.localeCompare(b.s));
 const cur=ls.find(l=>l.s<=hm&&hm<=l.e),nx=ls.find(l=>l.s>hm);
 $('#next').textContent=cur?`Зараз: ${cur.subj} (до ${cur.e})`:nx?`Наступна пара: ${nx.subj} о ${nx.s}`:'Сьогодні пар більше немає 🎉'}
function tick(){const n=new Date();$('#clock').textContent=n.toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'});
 $('#date').textContent=n.toLocaleDateString('uk-UA',{weekday:'long',day:'numeric',month:'long'});info();rSched()}

/* Розклад */
function rSched(){$('#days').innerHTML=DAYS.map((d,i)=>`<button class="${i===day?'on':''}" data-d="${i}">${d}</button>`).join('');
 const hm=new Date().toTimeString().slice(0,5),td=day===todayIdx();
 const ls=S.lessons.filter(l=>l.day===day).sort((a,b)=>a.s.localeCompare(b.s));
 $('#lessons').innerHTML=ls.map(l=>`<li class="${td&&l.s<=hm&&hm<=l.e?'now':''}" style="--c:${esc(l.color)}"><b>${l.s}<small>${l.e}</small></b><div><strong>${esc(l.subj)}</strong><small>${l.room?'ауд. '+esc(l.room):''}</small></div><button data-edit="${l.id}" title="Змінити">✏️</button><button data-del="${l.id}" title="Видалити">🗑</button></li>`).join('')||'<p class="empty">У цей день пар немає. Додайте першу нижче ↓</p>'}
$('#lf').onsubmit=e=>{e.preventDefault();const f=e.target,id=f.lid.value;
 const o={day,s:f.s.value,e:f.e.value,subj:f.subj.value.trim(),room:f.room.value.trim(),color:f.color.value};
 if(o.e<=o.s)return alert('Кінець пари має бути пізніше за початок');
 if(id)Object.assign(S.lessons.find(l=>l.id===id),o);else S.lessons.push({id:uid(),...o});
 f.reset();f.lid.value='';save();rSched();info()};

/* Завдання */
function rTasks(){const td=new Date().toLocaleDateString('sv');
 const a=S.tasks.filter(x=>flt==='all'||(flt==='done')===x.done).sort((a,b)=>a.done-b.done||(a.d||'9').localeCompare(b.d||'9'));
 $('#tl').innerHTML=a.map(x=>`<li class="${x.done?'done':''} p${x.p}"><input type="checkbox" data-t="${x.id}" ${x.done?'checked':''}><span>${esc(x.t)}${x.d?`<small class="${!x.done&&x.d<td?'late':''}">до ${x.d.split('-').reverse().join('.')}</small>`:''}</span><button data-dt="${x.id}">🗑</button></li>`).join('')||'<p class="empty">Завдань немає</p>';
 const n=S.tasks.length,d=S.tasks.filter(x=>x.done).length;
 $('#tp').style.width=(n?d/n*100:0)+'%';$('#tc').textContent=`Виконано ${d} з ${n}`;
 $$('#flt button').forEach(b=>b.classList.toggle('on',b.dataset.f===flt))}
$('#tf').onsubmit=e=>{e.preventDefault();const f=e.target;S.tasks.push({id:uid(),t:f.t.value.trim(),d:f.d.value,p:f.p.value,done:false});f.reset();save();rTasks()};

/* Таймер Pomodoro */
let pm='w',left=S.pomo.w*60,pt=null;
const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
function rP(){const tot=S.pomo[pm]*60;$('#pt').textContent=fmt(left);$('#pm').textContent=pm==='w'?'Робота 📚':'Перерва ☕';
 $('#pb').style.width=(100-left/tot*100)+'%';$('#ps').textContent=pt?'Пауза':'Старт';document.title=pt?fmt(left)+' · Student Hub':'Student Hub'}
function beep(){try{const c=new AudioContext(),o=c.createOscillator();o.connect(c.destination);o.frequency.value=880;o.start();o.stop(c.currentTime+.4)}catch(e){}}
function pReset(){clearInterval(pt);pt=null;pm='w';left=S.pomo.w*60;rP()}
$('#ps').onclick=()=>{if(pt){clearInterval(pt);pt=null}else pt=setInterval(()=>{if(--left<=0){beep();pm=pm==='w'?'b':'w';left=S.pomo[pm]*60}rP()},1000);rP()};
$('#pr').onclick=pReset;

/* Оцінки */
const av=a=>a.reduce((x,y)=>x+y,0)/a.length;
function rG(){const k=Object.keys(S.grades);
 $('#subs').innerHTML=S.lessons.map(l=>l.subj).filter((v,i,a)=>a.indexOf(v)===i).map(s=>`<option value="${esc(s)}">`).join('');
 $('#gl').innerHTML=k.map(s=>`<tr><td>${esc(s)} <button class="x" data-ds="${esc(s)}" title="Видалити предмет">×</button></td><td>${S.grades[s].map((g,i)=>`<span class="chip" data-s="${esc(s)}" data-i="${i}">${g}</span>`).join('')}</td><td><b>${av(S.grades[s]).toFixed(1)}</b></td></tr>`).join('');
 const m=k.map(s=>av(S.grades[s]));$('#avg').textContent=m.length?av(m).toFixed(2):'—'}
$('#gf').onsubmit=e=>{e.preventDefault();const f=e.target,s=f.subj.value.trim();(S.grades[s]=S.grades[s]||[]).push(+f.g.value);f.g.value='';save();rG()};

/* Нотатки */
function rN(){$('#nl').innerHTML=S.notes.map(n=>`<div class="note"><textarea data-n="${n.id}" placeholder="Ваша нотатка…">${esc(n.t)}</textarea><button data-dn="${n.id}" title="Видалити">🗑</button></div>`).join('')||'<p class="empty">Нотаток ще немає</p>'}
$('#nadd').onclick=()=>{S.notes.unshift({id:uid(),t:''});save();rN()};

/* Налаштування */
$('#name').oninput=e=>{S.name=e.target.value||'Студент';save();apply()};
$('#accent').oninput=e=>{S.accent=e.target.value;save();apply()};
$('#theme').onchange=e=>{S.theme=e.target.value;save();apply()};
$('#pw').onchange=e=>{S.pomo.w=Math.max(1,+e.target.value||25);save();pReset()};
$('#pbk').onchange=e=>{S.pomo.b=Math.max(1,+e.target.value||5);save();pReset()};
$('#ex').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));a.download='student-hub.json';a.click()};
$('#im').onchange=e=>{const f=e.target.files[0];if(f)f.text().then(t=>{S={...def(),...JSON.parse(t)};save();init()}).catch(()=>alert('Не вдалося прочитати файл'))};
$('#rs').onclick=()=>{if(confirm('Видалити всі дані?')){S=def();save();init()}};

/* Події */
document.addEventListener('click',e=>{const t=e.target.closest('button,.chip');if(!t)return;const d=t.dataset;
 if(d.tab){$$('.tab').forEach(s=>s.hidden=s.id!==d.tab);$$('#tabs button').forEach(b=>b.classList.toggle('on',b===t))}
 else if(d.d!==undefined){day=+d.d;rSched()}
 else if(d.edit){const l=S.lessons.find(x=>x.id===d.edit),f=$('#lf');f.lid.value=l.id;f.subj.value=l.subj;f.room.value=l.room;f.s.value=l.s;f.e.value=l.e;f.color.value=l.color;f.scrollIntoView({behavior:'smooth'})}
 else if(d.del){S.lessons=S.lessons.filter(x=>x.id!==d.del);save();rSched();info()}
 else if(d.dt){S.tasks=S.tasks.filter(x=>x.id!==d.dt);save();rTasks()}
 else if(d.f){flt=d.f;rTasks()}
 else if(d.ds){if(confirm('Видалити предмет з усіма оцінками?')){delete S.grades[d.ds];save();rG()}}
 else if(t.classList.contains('chip')){S.grades[d.s].splice(+d.i,1);if(!S.grades[d.s].length)delete S.grades[d.s];save();rG()}
 else if(d.dn){S.notes=S.notes.filter(x=>x.id!==d.dn);save();rN()}
 else if(d.sw){S.accent=d.sw;save();apply()}});
document.addEventListener('change',e=>{const id=e.target.dataset.t;if(id){S.tasks.find(x=>x.id===id).done=e.target.checked;save();rTasks()}});
document.addEventListener('input',e=>{const id=e.target.dataset.n;if(id){S.notes.find(x=>x.id===id).t=e.target.value;save()}});

function init(){apply();rSched();rTasks();rG();rN();pReset();tick()}
init();setInterval(tick,15000);
