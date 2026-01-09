// extras.js - extracted from inline scripts to satisfy CSP 'script-src self'

// === Global Diagnostics Banner ===
(function(){
  const banner = document.getElementById('diag-banner');
  function show(msg){
    if(!banner) return;
    banner.style.display='block';
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    banner.textContent = '[diag '+ts+'] '+msg;
    console.log('[DIAG]', msg);
  }
  window.addEventListener('error', e=>{ show('error:'+(e.message||e.type)); });
  window.addEventListener('unhandledrejection', e=>{ show('unhandled:'+(e.reason&&e.reason.message||e.reason)); });
  document.addEventListener('DOMContentLoaded', ()=>{
    const mustIds = ['auth-container','btn-login','email','password'];
    const missing = mustIds.filter(id=>!document.getElementById(id));
    if(missing.length){ show('missing elements: '+missing.join(',')); }
    else { console.log('[DIAG] core elements present'); }
  });
  window.__diag = show;
})();

// === Service Worker Registration ===
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=> navigator.serviceWorker.register('./service-worker.js').catch(e=>console.warn('SW reg fail', e)));
}

// === Auth Card Enhancements (simplified layout) ===
(function(){
  const passwordEye = document.getElementById('passwordEye');
  const passwordInput = document.getElementById('password');
  passwordEye && passwordEye.addEventListener('click', ()=>{ if(!passwordInput) return; const show = passwordInput.type==='password'; passwordInput.type = show ? 'text':'password'; passwordEye.textContent = show ? '🙈':'👁'; });
  const face = document.getElementById('faceIdIcon');
  face && face.addEventListener('click', ()=>{ face.classList.add('scanning'); setTimeout(()=>{ face.classList.remove('scanning'); window.dispatchEvent(new Event('ft:faceAttempt')); }, 1200); });
  const form = document.getElementById('auth-form');
  form && form.addEventListener('submit', e=> e.preventDefault());
  window.__extrasLoaded = true;
  console.log('[auth-card] initialized');
})();

// === Fallback if app.js fails to load ===
setTimeout(()=>{
  if(!window.getToken && !document.getElementById('stations-grid').children.length){
    const b = document.getElementById('diag-banner');
    if(b){ b.style.display='block'; b.textContent='[diag] app.js not executed (no getToken).'; }
    console.warn('[diag] app.js not executed');
  }
}, 1500);

// === Fetch Diagnostics Wrapper ===
(function(){
  if(window.__fetchWrapped) return; window.__fetchWrapped = true;
  const orig = window.fetch;
  const panel = document.getElementById('debug-panel');
  function log(msg){
    console.log('[diag fetch]', msg);
    if(panel){ panel.style.display='block'; panel.textContent=(panel.textContent+'\n'+msg).trim().split('\n').slice(-14).join('\n'); }
  }
  window.fetch = async function(url, opts){
    const start = Date.now();
    log('→ '+url+' '+(opts&&opts.method||'GET'));
    try {
      const res = await orig(url, opts);
      log('← '+url+' '+res.status+' '+(Date.now()-start)+'ms');
      return res;
    } catch(e){
      log('✖ '+url+' ERR '+e.message);
      throw e;
    }
  };
})();

// === Replace formerly inline alert links with JS handlers ===
(function(){
  const forgot = document.getElementById('forgotLink');
  const reg = document.getElementById('registerLink');
  function quietAlert(msg){
    try { alert(msg); } catch(_) { console.log('ALERT:', msg); }
  }
  forgot && forgot.addEventListener('click', (e)=>{ e.preventDefault(); quietAlert('Recovery flow coming soon'); });
  reg && reg.addEventListener('click', (e)=>{ e.preventDefault(); quietAlert('Registration flow coming soon'); });
})();
