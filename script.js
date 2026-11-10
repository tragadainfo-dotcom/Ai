const KEY="ai-island-progress";
let done=[];
try{done=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){}
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

/* ---------- прогресс ---------- */
function progress(){
  $("#navProgress").textContent=`${done.length} из ${LEVELS.length}`;
  $("#heroBar").style.width=done.length/LEVELS.length*100+"%";
}
function codeBlock(title,text){
  return `<div class="code"><div class="code-h"><span>${esc(title)}</span><button class="copy" type="button">Копировать</button></div><pre>${esc(text)}</pre></div>`;
}

/* ---------- карта ---------- */
function renderMap(){
  const root=$("#levels"); root.innerHTML="";
  LEVELS.forEach((l,i)=>{
    const d=document.createElement("details");
    d.className="glass level"+(done.includes(i)?" done":"");
    d.innerHTML=`<summary><span class="num">${i+1}</span><span class="ttl"><b>${l.t}</b><small>Цель: ${l.goal}</small></span><span class="mark">${done.includes(i)?"✓":""}</span></summary>
      <div class="body">
        <p>${l.intro}</p>
        <ol class="steps">${l.steps.map(s=>`<li><b>${s[0]}</b><span>${s[1]}</span></li>`).join("")}</ol>
        <div class="hint"><b>Подсказка</b>${l.tip.replace(/^(Подсказка|Шаблон):\s*/,"")}</div>
        <div class="task">${l.task}</div>
        <button type="button" class="toggle">${done.includes(i)?"Пройдено ✓ (снять отметку)":"Отметить пройденным"}</button>
      </div>`;
    $(".toggle",d).onclick=()=>{
      done=done.includes(i)?done.filter(n=>n!==i):[...done,i];
      try{localStorage.setItem(KEY,JSON.stringify(done))}catch(e){}
      renderMap(); progress();
      $$("#levels details")[i].open=true;
    };
    root.appendChild(d);
  });
}

/* ---------- аудит ---------- */
function renderAudit(){
  const a=AUDIT, ul=x=>`<ul class="list">${x.map(i=>`<li>${i}</li>`).join("")}</ul>`;
  $("#audit").innerHTML=`<p class="sub">${a.intro}</p>
   <div class="cols three">
    <div class="glass box"><h3>Оставил</h3>${ul(a.kept)}</div>
    <div class="glass box"><h3>Убрал или переписал</h3>${ul(a.removed)}</div>
    <div class="glass box"><h3>Проверяйте сами</h3>${ul(a.check)}</div>
   </div><p class="note glass">${a.note}</p>`;
}

/* ---------- без блокировок ---------- */
function renderSafe(){
  const s=SAFE;
  let h=`<p class="sub">${s.lead}</p>
   <div class="stats">${s.stats.map(x=>`<div class="glass stat"><b>${x[0]}</b><span>${x[1]}</span></div>`).join("")}</div>
   <p class="src"><a href="${s.statsSrc[1]}" target="_blank" rel="noopener noreferrer">${s.statsSrc[0]} ↗</a></p><div class="stack">`;
  s.blocks.forEach(b=>{
    h+=`<details class="glass level"><summary><span class="ttl"><b>${b[0]}</b></span></summary><div class="body">${b[1]}`;
    (b[3]||[]).forEach(c=>h+=codeBlock(c[0],c[1]));
    if(b[2]) h+=`<a class="srclink" href="${b[2][1]}" target="_blank" rel="noopener noreferrer">${b[2][0]} ↗</a>`;
    h+=`</div></details>`;
  });
  h+=`</div><p class="note glass">${s.omitted}</p>`;
  $("#safe").innerHTML=h;
}

/* ---------- копирование ---------- */
document.addEventListener("click",async e=>{
  const b=e.target.closest(".copy"); if(!b) return;
  const txt=b.closest(".code").querySelector("pre").textContent;
  try{await navigator.clipboard.writeText(txt);b.textContent="Скопировано ✓"}catch(_){b.textContent="Не удалось"}
  setTimeout(()=>b.textContent="Копировать",1800);
});

/* ---------- маршруты: #/ , #/claude , #/claude/safe|audit|map ---------- */
function route(){
  const [,page="",sub="map"]=location.hash.replace(/^#/,"").split("/");
  const p=page==="claude"?"claude":"home";
  $$("[data-page]").forEach(s=>s.hidden=s.dataset.page!==p);
  $$("[data-route]").forEach(a=>a.classList.toggle("on",a.dataset.route===p));
  const sb=["map","audit","safe"].includes(sub)?sub:"map";
  $$("[data-sub-page]").forEach(s=>s.hidden=s.dataset.subPage!==sb);
  $$(".seg button").forEach(b=>b.classList.toggle("on",b.dataset.sub===sb));
  window.scrollTo(0,0);
}
$$(".seg button").forEach(b=>b.onclick=()=>{location.hash="#/claude/"+b.dataset.sub});
addEventListener("hashchange",route);

renderMap(); renderAudit(); renderSafe(); progress(); route();
