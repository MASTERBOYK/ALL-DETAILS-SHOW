// MASTER HACKER - secure serverless frontend
// Frontend calls /api/* endpoints (key only on server)

// Matrix background
(function matrixAnim(){
  const c = document.getElementById('matrix-canvas');
  if(!c) return;
  let w = c.width = innerWidth, h = c.height = innerHeight;
  const ctx = c.getContext('2d');
  const cols = Math.floor(w / 14) + 1;
  const ypos = Array(cols).fill(0);
  function resize(){ w = c.width = innerWidth; h = c.height = innerHeight; }
  window.addEventListener('resize', resize);
  function matrixLoop(){
    ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0,0,w,h);
    ctx.font = '12px monospace';
    ypos.forEach((y, ind) => {
      const text = String.fromCharCode( (Math.random() * 33) + 65 );
      ctx.fillStyle = 'rgba(255,40,40,0.06)';
      ctx.fillText(text, ind * 14, y);
      if(y > 100 + Math.random() * 10000) ypos[ind] = 0; else ypos[ind] = y + 14;
    });
    requestAnimationFrame(matrixLoop);
  }
  matrixLoop();
})();

// UI
const menuBtns = document.querySelectorAll('.side-btn');
const output = document.getElementById('terminal-output');
const input = document.getElementById('input-field');
const runBtn = document.getElementById('run-btn');
const loader = document.getElementById('loader');
const dots = document.getElementById('dots');

let view = 'phone';
let dotsInterval = null;

menuBtns.forEach(b=>{
  b.addEventListener('click', ()=> {
    menuBtns.forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    view = b.dataset.view;
    input.placeholder = view==='phone'?'+92300...': view==='email'?'name@example.com': view==='iban'?'PK36...':'VAT number';
    clearOutput();
    appendLine(`Selected: ${view.toUpperCase()}`, '#bdbdbd');
  }, {passive:true});
});

input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') run(); });
runBtn.addEventListener('click', run, {passive:true});

function clearOutput(){ output.innerHTML = ''; }
function appendLine(txt, color){
  const el = document.createElement('div'); el.textContent = txt; if(color) el.style.color = color; output.appendChild(el); output.scrollTop = output.scrollHeight;
}
function showLoader(show=true){
  loader.classList.toggle('hidden', !show);
  if(show){ let d = 0; dotsInterval = setInterval(()=>{ d = (d+1)%4; dots.textContent = '.'.repeat(d); }, 400); }
  else { clearInterval(dotsInterval); dots.textContent = '...'; }
}
function prepareUrl(val){
  const base = '/api';
  if(view === 'phone') return `${base}/phone?q=${encodeURIComponent(val)}`;
  if(view === 'email') return `${base}/email?q=${encodeURIComponent(val)}`;
  if(view === 'emailrep') return `${base}/emailrep?q=${encodeURIComponent(val)}`;
  if(view === 'vat') return `${base}/vat?q=${encodeURIComponent(val)}`;
  if(view === 'iban') return `${base}/iban?q=${encodeURIComponent(val)}`;
  return null;
}
async function run(){
  const val = input.value.trim();
  if(!val){ appendLine('> No input provided', '#ff2b2b'); return; }
  clearOutput(); appendLine(`> Scanning (${view}): ${val}`, '#bdbdbd'); appendLine('> contacting server...', '#bdbdbd'); showLoader(true);
  const url = prepareUrl(val);
  if(!url){ showLoader(false); appendLine('> Unknown action', '#ff2b2b'); return; }
  try{
    const res = await fetch(url);
    if(!res.ok){ const t = await res.text(); throw new Error(`${res.status} ${t}`); }
    const data = await res.json();
    showLoader(false); appendLine('> result (pretty):', '#bdbdbd');
    if(view === 'phone'){
      appendResult('Valid', data.valid ? 'YES' : 'NO'); appendResult('Country', data.country?.name || '—');
      appendResult('Country Code', data.country?.code || '—'); appendResult('Carrier', data.carrier || '—');
      appendResult('Line Type', data.type || data.line_type || '—'); appendResult('International', data.international_format || '—');
      appendJsonBlock(data);
    } else if(view === 'email' || view === 'emailrep'){
      appendResult('Email', data.email || val); appendResult('Deliverability', data.deliverability || data.reputation || '—');
      appendResult('Quality Score', data.quality_score ?? data.score ?? '—'); appendResult('Disposable', data.is_disposable ? 'YES' : 'NO');
      appendJsonBlock(data);
    } else { appendJsonBlock(data); }
  }catch(err){ showLoader(false); appendLine('> error: ' + (err.message || err), '#ff2b2b'); }
}
function appendResult(k, v){
  const block = document.createElement('div'); block.className = 'result-block';
  const keySpan = document.createElement('span'); keySpan.className = 'result-key'; keySpan.textContent = k + ':';
  const valSpan = document.createElement('span'); valSpan.className = 'result-val'; valSpan.textContent = v;
  block.appendChild(keySpan); block.appendChild(valSpan); output.appendChild(block); output.scrollTop = output.scrollHeight;
}
function appendJsonBlock(obj){
  const pre = document.createElement('pre'); pre.textContent = JSON.stringify(obj, null, 2); pre.style.whiteSpace = 'pre-wrap';
  pre.style.color = '#ffec99'; pre.style.marginTop = '8px'; pre.style.background = 'rgba(255,255,255,0.01)'; pre.style.padding = '10px';
  pre.style.borderRadius = '8px'; output.appendChild(pre); output.scrollTop = output.scrollHeight;
}
// init
appendLine('▶ Welcome, MASTER HACKER. Ready.', '#bdbdbd');