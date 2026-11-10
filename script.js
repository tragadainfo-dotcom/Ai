const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

function codeBlock(title,text){
  return `<div class="code"><div class="code-h"><span>${esc(title)}</span><button class="copy" type="button">Копировать</button></div><pre>${esc(text)}</pre></div>`;
}

/* ---------- курсы ---------- */
function itemHtml(it){
  return `<article class="item"><h4>${it.t}</h4>
    <ol class="steps">${it.steps.map(x=>`<li><span>${x}</span></li>`).join("")}</ol>
    ${it.ex?codeBlock(it.ex.title,it.ex.text):""}
    ${it.tip?`<div class="hint"><b>Подсказка</b>${it.tip}</div>`:""}</article>`;
}
function renderCourse(root,levels){
  root.innerHTML=levels.map((l,i)=>`<details class="glass level">
    <summary><span class="num">${i+1}</span><span class="ttl"><b>${l.t}</b><small>Цель: ${l.goal} · ${l.items.length} инструкций</small></span></summary>
    <div class="body">
      <p>${l.intro}</p>
      ${l.items.map(itemHtml).join("")}
      <details class="removed"><summary>Убрано из карты (${l.removed.length})</summary><ul class="list bad">${l.removed.map(r=>`<li><b>${r[0]}</b> — ${r[1]}</li>`).join("")}</ul></details>
      ${l.src?`<p class="src">Источники: ${l.src.map(x=>`<a href="${x[1]}" target="_blank" rel="noopener noreferrer">${x[0]} ↗</a>`).join(" · ")}</p>`:""}
      <div class="task">${l.task}</div>
    </div></details>`).join("");
}

/* ---------- проверка курса Claude ---------- */
function renderAudit(){
  const a=AUDIT, ul=(x,c="")=>`<ul class="list ${c}">${x.map(i=>`<li>${i}</li>`).join("")}</ul>`;
  $("#audit").innerHTML=`<p>${a.intro}</p>
   <div class="cols three">
    <div class="box"><h3>Сверено с документацией</h3>${ul(a.verified)}</div>
    <div class="box"><h3>Исправлено после сверки</h3>${ul(a.corrected)}</div>
    <div class="box"><h3>Остаётся на вашей проверке</h3>${ul(a.open,"bad")}</div>
   </div>
   <p class="note">${a.note}</p>
   <h3 class="sect">Что убрано из карты</h3>
   <table class="tbl"><thead><tr><th>Раздел</th><th>Оставлено</th><th>Убрано или слито</th></tr></thead><tbody>
   ${LEVELS.map((l,i)=>`<tr><td>${i+1}. ${l.t}</td><td>${l.items.length}</td><td>${l.removed.map(r=>r[0]).join("; ")}</td></tr>`).join("")}
   </tbody></table>`;
}

/* ---------- без блокировок: Claude ---------- */
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

/* ---------- без блокировок: ChatGPT ---------- */
function renderGptSafe(){
  const g=GPT;
  let h=`<p class="sub">${g.lead}</p><div class="stack">`;
  g.blocks.forEach(b=>{
    h+=`<details class="glass level"><summary><span class="ttl"><b>${b[0]}</b></span></summary><div class="body">${b[1]}`;
    if(b[2]) h+=`<a class="srclink" href="${b[2][1]}" target="_blank" rel="noopener noreferrer">${b[2][0]} ↗</a>`;
    h+=`</div></details>`;
  });
  h+=`</div><p class="note glass">${g.note}</p>`;
  $("#gptsafe").innerHTML=h;
}

/* ---------- копирование ---------- */
document.addEventListener("click",async e=>{
  const b=e.target.closest(".copy"); if(!b) return;
  const txt=b.closest(".code").querySelector("pre").textContent;
  try{await navigator.clipboard.writeText(txt);b.textContent="Скопировано ✓"}catch(_){b.textContent="Не удалось"}
  setTimeout(()=>b.textContent="Копировать",1800);
});

/* ---------- маршруты: #/ , #/claude , #/chatgpt , #/safe/claude|chatgpt ---------- */
function route(){
  const [,page="",sub="claude"]=location.hash.replace(/^#/,"").split("/");
  const p=["claude","chatgpt","safe"].includes(page)?page:"home";
  $$("[data-page]").forEach(s=>s.hidden=s.dataset.page!==p);
  $$("[data-route]").forEach(a=>a.classList.toggle("on",a.dataset.route===p));
  const sb=sub==="chatgpt"?"chatgpt":"claude";
  $$("[data-sub-page]").forEach(s=>s.hidden=s.dataset.subPage!==sb);
  $$(".seg button").forEach(b=>b.classList.toggle("on",b.dataset.sub===sb));
  window.scrollTo(0,0);
}
$$(".seg button").forEach(b=>b.onclick=()=>{location.hash="#/safe/"+b.dataset.sub});
addEventListener("hashchange",route);

renderCourse($("#levels"),LEVELS);
renderCourse($("#levelsGpt"),LEVELS_GPT);
renderAudit(); renderSafe(); renderGptSafe(); route();
