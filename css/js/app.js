// MASTER HACKER - upgraded frontend (key embedded)
const API_KEY = "590422c9c4c94d499464530f4fe3337b"; // <--- your key (public if in frontend)

///// --- Matrix background (canvas) -----
(function matrixAnim(){
  const c = document.getElementById('matrix-canvas');
  if(!c) return;
  const w = c.width = innerWidth;
  const h = c.height = innerHeight;
  const ctx = c.getContext('2d');
  const cols = Math.floor(w / 14) + 1;
  const ypos = Array(cols).fill(0);
  function matrixLoop(){
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle = '#0f0';
    ctx.font = '12px monospace';
    ypos.forEach((y, ind) => {
      const text = String.fromCharCode( (Math.random() * 33) + 65 );
      ctx.fillStyle = 'rgba(255,40,40,0.06)';
      ctx.fillText(text, ind * 14, y);
      if(y > 100 + Math.random() * 10000) ypos[ind] = 0;
      else ypos[ind] = y + 14;
    });
    requestAnimationFrame(matrixLoop);
  }
  matrixLoop();
})();

///// --- UI elements ---
const menuBtns = document.querySelectorAll('.side-btn');
const output = document.getElementById('terminal-output');
const input = document.getElementById('input-field');
const runBtn = document.getElementById('run-btn');
const loader = document.getElementById('loader');
const dots = document.getElementById('dots');

let view = 'phone';
let dotsInterval = null;

// enable touch/click responsiveness robustly
menuBtns.forEach(b=>{
  b.addEventListener('click', ()=> {
    menuBtns.forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    view = b.dataset.view;
    input.placeholder = view==='phone'?'+92300...': view==='email'?'name@example.com': view==='iban'?'PK36...':'VAT number';
    clearOutput();
    appendLine(`Selected: ${view.toUpperCase()}`, 'var(--muted)');
  }, {passive:true});
});

// support keyboard enter
input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') run(); });

// run button
runBtn.addEventListener('click', run, {passive:true});

function clearOutput(){
  output.innerHTML = '';
}

function appendLine(txt, color){
  const el = document.createElement('div');
  el.textContent = txt;
  if(color) el.style.color = color;
  output.appendChild(el);
  output.scrollTop = output.scrollHeight;
}

function showLoader(show=true){
  loader.classList.toggle('hidden', !show);
  if(show){
    let d = 0;
    dotsInterval = setInterval(()=>{ d = (d+1)%4; dots.textContent = '.'.repeat(d); }, 400);
  } else {
    clearInterval(dotsInterval); dots.textContent = '...';
  }
}

// typewriter-ish output for small reveal effect
async function typeOutput(text, color){
  const el = document.createElement('div');
  output.appendChild(el);
  el.style.color = color || 'var(--yellow)';
  for(let i=0;i<text.length;i++){
    el.textContent += text[i];
    output.scrollTop = output.scrollHeight;
    await new Promise(r=>setTimeout(r, 6));
  }
  el.textContent += '\n';
}

function prepareUrl(val){
  if(view === 'phone'){
    return `https://phonevalidation.abstractapi.com/v1/?api_key=${API_KEY}&phone=${encodeURIComponent(val)}`;
  } else if(view === 'email'){
    return `https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${encodeURIComponent(val)}`;
  } else if(view === 'emailrep'){
    return `https://emailreputation.abstractapi.com/v1/?api_key=${API_KEY}&email=${encodeURIComponent(val)}`;
  } else if(view === 'vat'){
    return `https://vat.abstractapi.com/v1/?api_key=${API_KEY}&vat_number=${encodeURIComponent(val)}`;
  } else if(view === 'iban'){
    return `https://ibanvalidation.abstractapi.com/v1/?api_key=${API_KEY}&iban=${encodeURIComponent(val)}`;
  }
  return null;
}

async function run(){
  const val = input.value.trim();
  if(!val){
    appendLine('> No input provided', 'var(--red)');
    return;
  }

  clearOutput();
  appendLine(`> Scanning (${view}): ${val}`, 'var(--muted)');
  appendLine('> contacting AbstractAPI...', 'var(--muted)');
  showLoader(true);

  const url = prepareUrl(val);
  if(!url){
    showLoader(false);
    appendLine('> Unknown action', 'var(--red)');
    return;
  }

  try{
    const res = await fetch(url);
    if(!res.ok){
      const t = await res.text();
      throw new Error(`${res.status} ${t}`);
    }
    const data = await res.json();
    showLoader(false);
    // pretty show: block by block
    appendLine('> result (pretty):', 'var(--muted)');

    // show a few important common keys with colours
    if(view === 'phone'){
      // phone validation keys: valid, country, carrier, line_type
      const valid = data.valid ? 'YES' : 'NO';
      appendResult('Valid', valid);
      appendResult('Country', data.country && data.country.name || '—');
      appendResult('Country Code', data.country && data.country.code || '—');
      appendResult('Carrier', data.carrier || '—');
      appendResult('Line Type', data.type || data.line_type || '—');
      appendResult('International Format', data.international_format || '—');
      // fallback show JSON
      appendJsonBlock(data);
    } else if(view === 'email' || view === 'emailrep'){
      appendResult('Email', data.email || val);
      appendResult('Deliverability', data.deliverability || data.reputation || '—');
      appendResult('Quality Score', data.quality_score ?? data.score ?? '—');
      appendResult('Is Disposable', data.is_disposable ? 'YES' : 'NO');
      appendJsonBlock(data);
    } else if(view === 'vat' || view === 'iban'){
      appendJsonBlock(data);
    } else {
      appendJsonBlock(data);
    }

  }catch(err){
    showLoader(false);
    appendLine('> error: ' + (err.message || err), 'var(--red)');
  }
}

function appendResult(k, v){
  const block = document.createElement('div');
  block.className = 'result-block';
  const keySpan = document.createElement('span');
  keySpan.className = 'result-key';
  keySpan.textContent = k + ':';
  const valSpan = document.createElement('span');
  valSpan.className = 'result-val';
  valSpan.textContent = v;
  block.appendChild(keySpan);
  block.appendChild(valSpan);
  output.appendChild(block);
  output.scrollTop = output.scrollHeight;
}

function appendJsonBlock(obj){
  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(obj, null, 2);
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.color = '#ffec99';
  pre.style.marginTop = '8px';
  pre.style.background = 'rgba(255,255,255,0.01)';
  pre.style.padding = '10px';
  pre.style.borderRadius = '8px';
  output.appendChild(pre);
  output.scrollTop = output.scrollHeight;
}

// init welcome
appendLine('▶ Welcome, MASTER HACKER. Ready.', 'var(--muted)');
