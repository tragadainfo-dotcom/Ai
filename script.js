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
function itemHtml(it){
  return `<article class="item"><h4>${it.t}</h4>
    <ol class="steps">${it.steps.map(x=>`<li><span>${x}</span></li>`).join("")}</ol>
    ${it.ex?codeBlock(it.ex.title,it.ex.text):""}
    ${it.tip?`<div class="hint"><b>Подсказка</b>${it.tip}</div>`:""}</article>`;
}
function renderMap(){
  const root=$("#levels"); root.innerHTML="";
  LEVELS.forEach((l,i)=>{
    const d=document.createElement("details");
    d.className="glass level"+(done.includes(i)?" done":"");
    d.innerHTML=`<summary><span class="num">${i+1}</span><span class="ttl"><b>${l.t}</b><small>Цель: ${l.goal} · ${l.items.length} инструкций</small></span><span class="mark">${done.includes(i)?"✓":""}</span></summary>
      <div class="body">
        <p>${l.intro}</p>
        ${l.items.map(itemHtml).join("")}
        <details class="removed"><summary>Убрано из карты (${l.removed.length})</summary><ul class="list bad">${l.removed.map(r=>`<li><b>${r[0]}</b> — ${r[1]}</li>`).join("")}</ul></details>
        <div class="task">${l.task}</div>
        <button type="button" class="toggle">${done.includes(i)?"Пройдено ✓ (снять отметку)":"Отметить пройденным"}</button>
      </div>`;
    $(".toggle",d).onclick=()=>{
      done=done.includes(i)?done.filter(n=>n!==i):[...done,i];
      try{localStorage.setItem(KEY,JSON.stringify(done))}catch(e){}
      renderMap(); progress();
      $$("#levels > details")[i].open=true;
    };
    root.appendChild(d);
  });
}

/* ---------- аудит ---------- */
function renderAudit(){
  const a=AUDIT;
  $("#audit").innerHTML=`<p class="sub">${a.intro}</p>
   <div class="glass box"><table class="tbl"><thead><tr><th>Раздел</th><th>Оставлено</th><th>Убрано или слито</th></tr></thead><tbody>
   ${LEVELS.map((l,i)=>`<tr><td>${i+1}. ${l.t}</td><td>${l.items.length}</td><td>${l.removed.map(r=>r[0]).join("; ")}</td></tr>`).join("")}
   </tbody></table></div><p class="note glass">${a.note}</p>`;
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

/* ---------- ChatGPT ---------- */
function renderGpt(){
  const g=GPT;
  let h=`<p class="sub">${g.lead}</p><div class="stack">`;
  g.blocks.forEach(b=>{
    h+=`<details class="glass level"><summary><span class="ttl"><b>${b[0]}</b></span></summary><div class="body">${b[1]}`;
    if(b[2]) h+=`<a class="srclink" href="${b[2][1]}" target="_blank" rel="noopener noreferrer">${b[2][0]} ↗</a>`;
    h+=`</div></details>`;
  });
  h+=`</div><p class="note glass">${g.note}</p>`;
  $("#gpt").innerHTML=h;
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
  const p=["claude","chatgpt"].includes(page)?page:"home";
  $$("[data-page]").forEach(s=>s.hidden=s.dataset.page!==p);
  $$("[data-route]").forEach(a=>a.classList.toggle("on",a.dataset.route===p));
  const sb=["map","audit","safe"].includes(sub)?sub:"map";
  $$("[data-sub-page]").forEach(s=>s.hidden=s.dataset.subPage!==sb);
  $$(".seg button").forEach(b=>b.classList.toggle("on",b.dataset.sub===sb));
  window.scrollTo(0,0);
}
$$(".seg button").forEach(b=>b.onclick=()=>{location.hash="#/claude/"+b.dataset.sub});
addEventListener("hashchange",route);

renderMap(); renderAudit(); renderSafe(); renderGpt(); progress(); route();
