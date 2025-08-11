// MASTER HACKER - frontend (calls serverless /api/*)
// matrix background
(function matrix(){
  const c = document.getElementById('matrix-canvas');
  if(!c) return;
  let w = c.width = innerWidth, h = c.height = innerHeight;
  const ctx = c.getContext('2d');
  const cols = Math.floor(w / 14) + 1;
  const ypos = Array(cols).fill(0);
  window.addEventListener('resize', ()=>{ w=c.width=innerWidth; h=c.height=innerHeight; });
  function loop(){
    ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0,0,w,h);
    ctx.font = '12px monospace';
    ypos.forEach((y,i)=>{
      const ch = String.fromCharCode(65 + Math.floor(Math.random()*26));
      ctx.fillStyle = 'rgba(0,255,102,0.06)';
      ctx.fillText(ch, i*14, y);
      ypos[i] = (y > 100 + Math.random()*10000) ? 0 : y + 14;
    });
    requestAnimationFrame(loop);
  }
  loop();
})();

// UI
const menu = document.querySelectorAll('.menu-btn');
const output = document.getElementById('output');
const input = document.getElementById('input');
const scanBtn = document.getElementById('scan');
const loader = document.getElementById('loader');
const dots = document.getElementById('dots');

let view = 'phone';
let dotsInterval = null;

menu.forEach(btn=>{
  btn.addEventListener('click', ()=> {
    menu.forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    view = btn.dataset.view;
    input.placeholder = view === 'phone' ? '+92300...' : view === 'email' ? 'name@example.com' : view === 'iban' ? 'PK36...' : 'VAT number';
    clearOutput();
    writeLine(`Selected: ${view.toUpperCase()}`, 'muted');
  }, {passive:true});
});

input.addEventListener('keydown', e=> { if(e.key === 'Enter') doScan(); });
scanBtn.addEventListener('click', doScan, {passive:true});

function clearOutput(){ output.innerHTML = ''; }
function writeLine(text, kind){
  const el = document.createElement('div');
  el.textContent = text;
  if(kind === 'muted') el.style.color = '#9aa0a6';
  output.appendChild(el);
  output.scrollTop = output.scrollHeight;
}
function showLoader(show=true){
  loader.classList.toggle('hidden', !show);
  if(show){
    let d=0;
    dotsInterval = setInterval(()=>{ d=(d+1)%4; dots.textContent = '.'.repeat(d); }, 350);
  } else { clearInterval(dotsInterval); if(dots) dots.textContent = '...'; }
}

function apiPath(q){
  const base = '/api';
  if(view==='phone') return `${base}/phone?q=${encodeURIComponent(q)}`;
  if(view==='email') return `${base}/email?q=${encodeURIComponent(q)}`;
  if(view==='emailrep') return `${base}/emailrep?q=${encodeURIComponent(q)}`;
  if(view==='vat') return `${base}/vat?q=${encodeURIComponent(q)}`;
  if(view==='iban') return `${base}/iban?q=${encodeURIComponent(q)}`;
  return null;
}

async function doScan(){
  const val = input.value.trim();
  if(!val){ writeLine('> Enter a value to scan', 'muted'); return; }
  clearOutput();
  writeLine(`> Scanning (${view}): ${val}`, 'muted');
  showLoader(true);

  const url = apiPath(val);
  if(!url){ showLoader(false); writeLine('> Unknown action', 'muted'); return; }

  try{
    const res = await fetch(url);
    if(!res.ok){
      const txt = await res.text();
      throw new Error(`${res.status} ${txt}`);
    }
    const data = await res.json();
    showLoader(false);
    writeLine('> Result:', 'muted');

    // phone
    if(view === 'phone'){
      appendResult('Valid', data.valid ? 'YES' : 'NO');
      appendResult('Country', data.country?.name || '—');
      appendResult('Carrier', data.carrier || '—');
      appendResult('Line Type', data.type || data.line_type || '—');
      appendJson(data);
    }
    // email / emailrep
    else if(view === 'email' || view === 'emailrep'){
      appendResult('Email', data.email || val);
      appendResult('Deliverability', data.deliverability || data.reputation || '—');
      appendResult('Quality Score', data.quality_score ?? data.score ?? '—');
      appendResult('Disposable', data.is_disposable ? 'YES' : 'NO');
      appendJson(data);
    }
    // vat or iban
    else {
      appendJson(data);
    }
  }catch(err){
    showLoader(false);
    writeLine('> Error: ' + (err.message || err), 'muted');
  }
}

function appendResult(k,v){
  const block = document.createElement('div');
  block.className = 'result-block';
  const key = document.createElement('span'); key.className='key'; key.textContent = k + ':';
  const val = document.createElement('span'); val.className='val'; val.textContent = v;
  block.appendChild(key); block.appendChild(val); output.appendChild(block); output.scrollTop = output.scrollHeight;
}

function appendJson(obj){
  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(obj, null, 2);
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.color = '#b8ffb0';
  pre.style.background = 'rgba(255,255,255,0.01)';
  pre.style.padding = '10px';
  pre.style.borderRadius = '8px';
  pre.style.marginTop = '8px';
  output.appendChild(pre);
  output.scrollTop = output.scrollHeight;
}

// init
writeLine('▶ Ready. Select tool and scan.', 'muted');