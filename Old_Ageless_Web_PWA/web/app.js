// === DIAGNOSTICS (early) ===
try { console.log('[diag] app.js start'); } catch(_) {}
window.addEventListener('error', e=> console.log('[diag] window error', e.message));
window.addEventListener('unhandledrejection', e=> console.log('[diag] unhandled rejection', e.reason));

// === CONFIG ===
// Backend service URL now resolved from merged runtime config (see HTML injected block)
// Fallback to empty string (same-origin relative) if not provided.
const __cfg = (window.__MBH_CONFIG || window.__MBH_RUNTIME_FALLBACK__ || {});
const API_BASE = (typeof __cfg.API_BASE_URL === 'string') ? __cfg.API_BASE_URL : "";
try { console.log('[config] API_BASE resolved as', API_BASE || '(relative)'); } catch(_) {}
const MAX_SETS = 4;

const exercises = [
  { name: "Bike", unit: "Min", reps: 60 },
  { name: "Abs", unit: "Reps", reps: 100 },
  { name: "Chest Press", unit: "Reps", reps: 20 },
  { name: "Leg Press", unit: "Reps", reps: 20 },
  { name: "Lat", unit: "Reps", reps: 20 },
  { name: "Military", unit: "Reps", reps: 20 },
  { name: "Crunch", unit: "Reps", reps: 100 },
  { name: "Bicep Curls", unit: "Reps", reps: 20 },
  { name: "Triceps", unit: "Reps", reps: 40 },
  { name: "Overhead Pull", unit: "Reps", reps: 40 },
  { name: "Row", unit: "Reps", reps: 20 }
];

// === DEV BYPASS MODE ===
// Enable by adding ?dev=1 to the URL OR setting localStorage.setItem('ft.devBypass','1')
// Provides mock API responses and skips real auth so the main screen can be styled.
const DEV_BYPASS = /[?&]dev=1/.test(location.search) || location.hash==="#dev" || (function(){ try { return localStorage.getItem('ft.devBypass')==='1'; } catch { return false; } })();
if(DEV_BYPASS){
  try { console.log('[dev] Bypass mode active – mock data & auth skipped'); } catch(_){}
  // Surface in diagnostics banner if present
  const banner = document.getElementById('diag-banner');
  if(banner){ banner.style.display='block'; banner.textContent='[dev] Login bypass active (mock data)'; }
}

// === AUTH / STORAGE ===
const tokenKey = "ft.jwt";
const outboxKey = "ft.outbox"; // queue for offline POSTs
// Legacy key aliases that might have been used previously
const legacyTokenKeys = ["jwt", "auth.token", "token"];
const legacyOutboxKeys = ["outbox", "pending.saves"];

// Safe storage wrapper (guards against Safari private mode & quota issues)
const memoryStore = {};
function safeGet(k){
  try { return localStorage.getItem(k); } catch { return memoryStore[k] || null; }
}
function safeSet(k,v){
  try { localStorage.setItem(k,v); } catch { memoryStore[k]=v; }
}
function safeRemove(k){
  try { localStorage.removeItem(k); } catch { delete memoryStore[k]; }
}

function getToken() { return safeGet(tokenKey); }
function setToken(t) { safeSet(tokenKey, t); }
function clearToken() { safeRemove(tokenKey); }

// Migrate any legacy keys to new canonical keys (one-time, non-destructive)
function migrateStorage(){
  if(!getToken()){
    for(const k of legacyTokenKeys){
      const v = safeGet(k); if(v){ setToken(v); break; }
    }
  }
  if(!safeGet(outboxKey)){
    for(const k of legacyOutboxKeys){
      const v = safeGet(k); if(v){ safeSet(outboxKey, v); break; }
    }
  }
  // Do not remove legacy keys to allow rollback; could remove after confidence.
}

let lastUnauthorized = 0;
async function api(path, { method = "GET", body } = {}) {
  if(DEV_BYPASS){
    // Minimal mock responses for styling & interaction without backend
    if(path==='/api/me') return { email:'dev@example.com' };
    if(path.startsWith('/api/auth/')) return { token:'dev-token', user:{ email:'dev@example.com' } };
    if(path==='/api/entries' && method==='GET') return [];
    if(path==='/api/entries' && method==='POST') return { ok:true, saved:true };
    if(/^\/api\/entries\//.test(path) && method==='GET') return null;
    if(/^\/api\/entries\//.test(path) && method==='DELETE') return { ok:true, deleted:true };
    if(path==='/api/summary') return [];
    return {}; // default empty object for any other endpoint
  }
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = `${API_BASE}${path}`;

  // Offline queue (idempotent logic handled in queueOutbox)
  if (!navigator.onLine && method !== "GET") {
    queueOutbox({ path, method, body });
    return { queued: true };
  }

  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 401) {
    // Prevent rapid loops
    const now = Date.now();
    if (now - lastUnauthorized > 1000) {
      lastUnauthorized = now;
      clearToken();
      // Return a controlled error
    }
    throw new Error("Unauthorized – please sign in again");
  }
  if (!res.ok) throw new Error((await res.json().catch(()=>({}))).error || `HTTP ${res.status}`);
  return res.json();
}

function queueOutbox(entry) {
  // Replace older queued item for same logical key (date for /api/entries)
  const q = JSON.parse(safeGet(outboxKey) || "[]");
  const date = entry.body?.date;
  const isEntry = entry.path === "/api/entries" && date;
  let replaced = false;
  const newQueue = q.map(it => {
    if (isEntry && it.path === entry.path && it.body?.date === date) {
      replaced = true;
      return { ...entry, ts: Date.now() };
    }
    return it;
  });
  if (!replaced) newQueue.push({ ...entry, ts: Date.now() });
  safeSet(outboxKey, JSON.stringify(newQueue));
}

async function flushOutbox() {
  const q = JSON.parse(safeGet(outboxKey) || "[]");
  if (!q.length) return;
  // Ensure only last occurrence per (path,date) is sent
  const byKey = new Map();
  for (const item of q) {
    const key = item.path === "/api/entries" && item.body?.date ? `${item.path}:${item.body.date}` : `${item.path}:${item.ts}`;
    byKey.set(key, item); // later overwrites earlier
  }
  const deduped = Array.from(byKey.values()).sort((a,b)=>a.ts-b.ts); // preserve chronological order
  const remaining = [];
  for (const item of deduped) {
    try { await api(item.path, { method: item.method, body: item.body }); }
    catch { remaining.push(item); }
  }
  safeSet(outboxKey, JSON.stringify(remaining));
}

// === UI Elements (guarded) ===
function diagMissing(id){ console.log('[diag] missing element:', id); }
const authContainer = document.getElementById("auth-container") || (diagMissing('auth-container'), null);
const appContainer  = document.getElementById("app-container")  || (diagMissing('app-container'), null);
const stationsGrid  = document.getElementById("stations-grid")   || (diagMissing('stations-grid'), null);
const currentDateEl = document.getElementById("current-date");
if(currentDateEl) { currentDateEl.textContent = new Date().toLocaleDateString(); } else { diagMissing('current-date'); }

// After defining UI element references add diagnostics
console.log('[diag] binding auth buttons');
const loginBtnRef = document.getElementById("btn-login");
const registerBtnRef = document.getElementById("btn-register");
if(loginBtnRef){ console.log('[diag] btn-login present'); } else { console.log('[diag] btn-login MISSING'); }
if(registerBtnRef){ console.log('[diag] btn-register present'); } else { console.log('[diag] btn-register MISSING'); }

// Auth screen setup
loginBtnRef && (loginBtnRef.onclick = async () => {
  console.log('[diag] login click');
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    console.log('[diag] login attempt', email);
    const { token, user } = await api("/api/auth/login", { method: "POST", body: { email, password } });
    setToken(token);
    await bootApp(user.email);
  } catch (e) { console.log('[diag] login failed', e.message); alert(e.message); }
});

registerBtnRef && (registerBtnRef.onclick = async () => {
  console.log('[diag] register click');
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    console.log('[diag] register attempt', email);
    const { token, user } = await api("/api/auth/register", { method: "POST", body: { email, password } });
    setToken(token);
    await bootApp(user.email);
  } catch (e) { console.log('[diag] register failed', e.message); alert(e.message); }
});

document.getElementById("btn-logout").onclick = () => { clearToken(); location.reload(); };

// Build stations (unchanged look)
function buildStations() {
  stationsGrid.innerHTML = "";
  exercises.forEach(ex => {
    const station = document.createElement("div");
    station.id = `station-${ex.name}`;
    station.className = "station";
    station.innerHTML = `
      <div class="station-name">${ex.name}</div>
      <div class="station-info">Sets: <span id="sets-${ex.name}">0</span> / ${MAX_SETS} | ${ex.unit}: ${ex.reps}</div>
      <div class="station-controls">
        <button class="btn" data-name="${ex.name}" data-delta="-1" disabled>-</button>
        <span class="count" id="count-${ex.name}">0</span>
        <button class="btn" data-name="${ex.name}" data-delta="1">+</button>
      </div>`;
    stationsGrid.appendChild(station);
  });

  stationsGrid.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn")) {
      const name = e.target.getAttribute("data-name");
      const change = parseInt(e.target.getAttribute("data-delta"), 10);
      updateCount(name, change);
    }
  });
}

function updateCount(name, change) {
  const countEl = document.getElementById(`count-${name}`);
  let count = parseInt(countEl.textContent) + change;
  count = Math.max(0, Math.min(count, MAX_SETS));
  countEl.textContent = count;
  document.getElementById(`sets-${name}`).textContent = count;
  const minusBtn = countEl.previousElementSibling;
  const plusBtn = countEl.nextElementSibling;
  minusBtn.disabled = count===0;
  plusBtn.disabled = count===MAX_SETS;
  const station = document.getElementById(`station-${name}`);
  if(count===MAX_SETS) station.classList.add("completed");
  else station.classList.remove("completed");
  updateProgress();
}

function updateProgress(){
  const completed = exercises.filter(ex=>parseInt(document.getElementById(`count-${ex.name}`).textContent)===MAX_SETS).length;
  const percent = Math.round((completed/exercises.length)*100);
  document.getElementById("progress-percent").textContent = percent+"%";
  document.getElementById("progress-fill").style.width = percent+"%";
  document.getElementById("progress-text").textContent = `${completed} of ${exercises.length} exercises completed`;
}

// Helpers
function getSundayOfWeek(date) {
  const d = new Date(date);
  const diff = d.getDate() - d.getDay();
  return new Date(d.setDate(diff));
}

// Format date as MM/DD/YY for better mobile display and US format preference
function formatDate(date) {
  const month = (date.getMonth() + 1).toString().padStart(2,'0');
  const day = date.getDate().toString().padStart(2,'0');
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
}

// Format database date string (YYYY-MM-DD) to MM/DD/YY for display
function formatDisplayDate(dateString) {
  try {
    // Handle both date string formats and ensure proper parsing
    const cleanDate = dateString.split('T')[0]; // Remove time part if present
    const [year, month, day] = cleanDate.split('-');
    
    // Create date object safely
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    // Format as MM/DD/YY
    const formattedMonth = (date.getMonth() + 1).toString().padStart(2,'0');
    const formattedDay = date.getDate().toString().padStart(2,'0');
    const formattedYear = date.getFullYear().toString().slice(-2);
    
    return `${formattedMonth}/${formattedDay}/${formattedYear}`;
  } catch (error) {
    console.error('Date formatting error:', error, 'for date:', dateString);
    // Fallback to original string if formatting fails
    return dateString;
  }
}

// Save / Reset / History / Summary
document.getElementById("btn-save").onclick = saveProgress;
document.getElementById("btn-reset").onclick = resetProgress;
document.getElementById("btn-history").onclick = showHistory;
document.getElementById("btn-summary").onclick = showSummary;

let lastSaveHash = ""; let lastSaveTime = 0;
function todayLocalKey() {
  // Local calendar date in stable ISO (YYYY-MM-DD) independent of timezone offset issues
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const da = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${da}`;
}
async function saveProgress(){
  const dateKey = todayLocalKey();
  const weight = document.getElementById("weight").value || null;
  const fitnessData = {};
  exercises.forEach(ex => fitnessData[ex.name] = parseInt(document.getElementById(`count-${ex.name}`).textContent) || 0);

  // Debounce identical saves within 2s
  const payloadHash = JSON.stringify({date:dateKey, weight, fitnessData});
  const now = Date.now();
  if (payloadHash === lastSaveHash && (now - lastSaveTime) < 2000) {
    toast("Duplicate save ignored");
    return;
  }
  lastSaveHash = payloadHash; lastSaveTime = now;

  try {
    const result = await api("/api/entries", { method: "POST", body: { date: dateKey, weight, fitnessData }});
    if (result?.queued) {
      toast("Offline: queued to sync");
    } else {
      toast("Progress saved!");
    }
  } catch (e) {
    toast("Save failed: " + e.message);
  }
}

function resetProgress(){
  exercises.forEach(ex=>{
    const val = parseInt(document.getElementById(`count-${ex.name}`).textContent);
    if (val>0) updateCount(ex.name, -val);
  });
  document.getElementById("weight").value = "";
}

async function showHistory(){
  const table = document.getElementById("history-table");
  table.innerHTML = "";
  try {
    let entries = await api("/api/entries");
  // Defensive: filter out any legacy placeholder rows (e.g., a stray 'Local' label from cached older client)
  entries = (entries||[]).filter(e=> e && typeof e.entry_date === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.test(e.entry_date));
    // Defensive de-dup: keep last entry per date
    const map = new Map();
    entries.forEach(e => map.set(e.entry_date, e));
    entries = Array.from(map.values()).sort((a,b)=> a.entry_date.localeCompare(b.entry_date));
    entries.forEach(({entry_date, weight, fitness_data})=>{
      const completed = Object.values(fitness_data||{}).filter(v=>v===MAX_SETS).length;
      let editableDetails = "";
      for (const [exName, sets] of Object.entries(fitness_data||{})) {
        editableDetails += `
          <div class="exercise-row">
            <span class="exercise-name">${exName}:</span>
            <input type="number" id="edit-${entry_date}-${exName}" value="${sets}" min="0" max="${MAX_SETS}" class="sets-input">
            <span class="sets-label">sets</span>
          </div>`;
      }
      const row = document.createElement("tr");
      row.dataset.entryId = entry_date;
      row.dataset.entryDate = entry_date;
      row.innerHTML = `
        <td class="date-cell history-date">${formatDisplayDate(entry_date)}</td>
        <td class="weight-cell history-weight">
          <input type="number" id="edit-weight-${entry_date}" value="${weight ?? ''}" class="weight-input" placeholder="lbs">
        </td>
        <td class="completed-cell">${completed}/${exercises.length}</td>
        <td class="details-cell">${editableDetails}</td>
        <td class="action-cell">
          <button data-action="save" data-date="${entry_date}" class="save-btn" title="Save changes">💾</button>
          <button data-action="delete" data-date="${entry_date}" class="delete-btn history-delete-btn" title="Delete entry">🗑️</button>
          <button class="history-edit-btn" data-date="${entry_date}" title="Edit entry">✏️</button>
        </td>
      `;
      table.appendChild(row);
    });
    
    // Handle table button clicks
    table.onclick = async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      e.stopPropagation();
      
      const date = btn.getAttribute("data-date");
      if (btn.getAttribute("data-action")==="save") await saveHistoryEntry(date);
      if (btn.getAttribute("data-action")==="delete") await deleteHistoryEntry(date);
    };
    
    // Ensure the close button works
    const historyContent = document.getElementById("history-content");
    const closeBtn = historyContent.querySelector('.close-btn');
    if (closeBtn) {
      // Remove any existing event listeners and add new one
      closeBtn.onclick = null;
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log("History close button clicked");
        closeHistory();
      });
    }
    
    document.getElementById("history-modal").style.display = "flex";
  if(window.attachHistoryEditHandlers) window.attachHistoryEditHandlers();
  } catch (e) {
    alert(e.message);
  }
}

async function saveHistoryEntry(date){
  const newWeight = document.getElementById(`edit-weight-${date}`).value || null;
  const newFitnessData = {};
  exercises.forEach(ex=>{
    const val = parseInt(document.getElementById(`edit-${date}-${ex.name}`)?.value || 0);
    newFitnessData[ex.name] = Math.max(0, Math.min(val, MAX_SETS));
  });
  await api("/api/entries", { method: "POST", body: { date, weight: newWeight, fitnessData: newFitnessData }});
  toast("Updated!");
  showHistory();
}

async function deleteHistoryEntry(date){
  await api(`/api/entries/${date}`, { method: "DELETE" });
  toast("Deleted");
  showHistory();
}

async function showSummary(){
  const table = document.getElementById("summary-table");
  table.innerHTML = "";
  try {
    console.log("Fetching summary data...");
    const weeks = await api("/api/summary");
    console.log("Summary data received:", weeks);
    
    if (!weeks || weeks.length === 0) {
      // Show a message when no data is available
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td colspan="14" style="text-align: center; padding: 20px; color: #666;">
          No workout data available yet. Start tracking your workouts to see weekly summaries!
        </td>
      `;
      table.appendChild(tr);
    } else {
      // Render rows
      weeks.forEach(row=>{
        const totals = row.totals || {};
        const totalSets = Object.values(totals).reduce((a,b)=>a + parseInt(b||0), 0);
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="week-header">${formatDate(new Date(row.week_of_sunday))}</td>
          <td>${row.weight_avg ?? ''}</td>
          <td>${totals['Bike'] || 0}</td>
          <td>${totals['Abs'] || 0}</td>
          <td>${totals['Chest Press'] || 0}</td>
          <td>${totals['Leg Press'] || 0}</td>
          <td>${totals['Lat'] || 0}</td>
          <td>${totals['Military'] || 0}</td>
          <td>${totals['Crunch'] || 0}</td>
          <td>${totals['Bicep Curls'] || 0}</td>
          <td>${totals['Triceps'] || 0}</td>
          <td>${totals['Overhead Pull'] || 0}</td>
          <td>${totals['Row'] || 0}</td>
          <td><strong>${totalSets}</strong></td>
        `;
        table.appendChild(tr);
      });
    }
    
    // Ensure the close button works
    const summaryContent = document.getElementById("summary-content");
    const closeBtn = summaryContent.querySelector('.close-btn');
    if (closeBtn) {
      // Remove any existing event listeners and add new one
      closeBtn.onclick = null;
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log("Summary close button clicked");
        closeSummary();
      });
    }
    
    document.getElementById("summary-modal").style.display = "flex";
  } catch (e) {
    console.error("Summary error:", e);
    alert("Failed to load summary: " + e.message);
  }
}

window.closeHistory = () => {
  console.log("Closing history modal");
  const modal = document.getElementById("history-modal");
  if (modal) {
    modal.style.display = "none";
  }
};

window.closeSummary = () => {
  console.log("Closing summary modal");
  const modal = document.getElementById("summary-modal");
  if (modal) {
    modal.style.display = "none";
  }
};

// Add click-outside-to-close functionality for modals
function setupModalClickHandlers() {
  const historyModal = document.getElementById("history-modal");
  const summaryModal = document.getElementById("summary-modal");
  
  if (historyModal) {
    historyModal.addEventListener('click', (e) => {
      if (e.target === historyModal) {
        console.log("Clicking outside history modal");
        closeHistory();
      }
    });
  }
  
  if (summaryModal) {
    summaryModal.addEventListener('click', (e) => {
      if (e.target === summaryModal) {
        console.log("Clicking outside summary modal");
        closeSummary();
      }
    });
  }
}

// Call this when the page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupModalClickHandlers);
} else {
  setupModalClickHandlers();
}

// Toast
function toast(msg){
  const el = document.getElementById("save-message");
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(()=>{ el.style.display="none"; }, 2000);
}

// Load today's entry into UI if exists
async function loadToday() {
  const dateKey = todayLocalKey();
  const data = await api(`/api/entries/${dateKey}`);
  if (data) {
    if (data.weight) document.getElementById("weight").value = data.weight;
    exercises.forEach(ex=>{
      const sets = data.fitness_data?.[ex.name] || 0;
      const cur = parseInt(document.getElementById(`count-${ex.name}`).textContent);
      updateCount(ex.name, sets - cur);
    });
  }
}

// Top banner nav (injected post-auth)
function initTopBannerNav(){
  if(document.getElementById('top-banner-nav')) return; // idempotent
  try {
    const container = document.querySelector('.container');
    if(!container) return;
    const banner = document.createElement('nav');
    banner.id = 'top-banner-nav';
    banner.className = 'top-banner-nav';
    banner.innerHTML = '<div class="top-banner-nav__scroller" role="tablist" aria-label="Primary sections"></div>';
    // Insert before container so it's outside rounded white panel but after any splash (which should be gone by now)
    document.body.insertBefore(banner, container);
    const scroller = banner.querySelector('.top-banner-nav__scroller');
  const items = [ 'Fitness', 'Food', 'Mind', 'Sleep', 'Social', 'Beauty', 'Scholars', 'Competition', 'Membership', 'Account', 'About' ];
    items.forEach(name=>{
      const btn = document.createElement('button');
      btn.type='button';
      btn.className='top-banner-nav__item';
      btn.setAttribute('role','tab');
      btn.setAttribute('aria-selected','false');
      btn.textContent=name;
      btn.addEventListener('click',()=> setActive(name));
      scroller.appendChild(btn);
    });
    function setActive(name){
      scroller.querySelectorAll('.top-banner-nav__item').forEach(btn=>{
        const active = btn.textContent===name;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active? 'true':'false');
        btn.setAttribute('tabindex', active? '0':'-1');
      });
    }
    setActive('Fitness');
    // Optional gradient edges (explanation to user: subtle white-to-transparent fades indicating more scroll). Disabled initially.
    function updateEdgeFades(){
      if(!banner.classList.contains('edge-fade')) return; // not enabled
      const atStart = scroller.scrollLeft <= 2;
      const atEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 2;
      banner.classList.toggle('fade-left', !atStart);
      banner.classList.toggle('fade-right', !atEnd);
    }
    scroller.addEventListener('scroll', updateEdgeFades, { passive:true });
    requestAnimationFrame(updateEdgeFades);
  } catch(err){ console.warn('[top-banner-nav] init failed', err); }
}

// Boot
async function bootApp(emailFromAuth) {
  try {
    console.log("Booting app for user:", emailFromAuth);
    authContainer.style.display = "none";
    appContainer.style.display = "block";
    document.getElementById("user-email").textContent = emailFromAuth || (await api("/api/me")).email;
    buildStations();
    updateProgress();
    await flushOutbox();
    await loadToday();
  // Initialize top banner navigation (post-auth only)
  initTopBannerNav();
    console.log("App boot complete");
  // Notify overlay to hide (legacy integrated UI)
  window.dispatchEvent(new Event('ft:booted'));
  } catch (e) {
    console.error("Boot app failed:", e);
    alert("Error loading app: " + e.message);
    clearToken();
    authContainer.style.display = "block";
    appContainer.style.display = "none";
  }
}

async function init() {
  console.log("Initializing app...");
  migrateStorage();
  // Decide screen by token
  const token = getToken();
  console.log("Token:", token ? "exists" : "none");
  if(DEV_BYPASS){
    console.log('[dev] Forcing bootApp via bypass');
    await bootApp('dev@example.com');
    return;
  }
  
  if (token) {
    try { 
      console.log("Checking authentication...");
      const me = await api("/api/me"); 
      console.log("User authenticated:", me);
      await bootApp(me.email); 
    }
    catch (e) { 
      console.error("Auth check failed:", e);
      clearToken(); 
      authContainer.style.display = "block"; 
    }
  } else {
    console.log("No token, showing auth screen");
    authContainer.style.display = "block";
  }
}
window.addEventListener("online", flushOutbox);
// Face ID demo event (issued by overlay) -> if already authenticated token exists skip; else try demo creds if present
window.addEventListener('ft:faceAttempt', async ()=>{
  if(getToken()) return; // already authed
  // Use demo creds if present in inputs
  const emailEl = document.getElementById('email');
  const passEl = document.getElementById('password');
  const email = emailEl?.value || 'demo@example.com';
  const password = passEl?.value || 'password123';
  try {
    const { token, user } = await api('/api/auth/login', { method:'POST', body:{ email, password }});
    setToken(token); await bootApp(user.email);
  } catch(err){
    console.warn('Face ID demo login failed:', err.message);
  }
});
init();

// === CSP Fallback: If extras.js (moved inline scripts) failed to load due to CSP, recreate critical behaviors here ===
(function(){
  if(window.__extrasLoaded) return; // extras.js sets this if it runs
  console.log('[csp-fallback] extras.js not detected; installing fallback overlay + diagnostics');
  window.__extrasLoaded = 'fallback';
  // Diagnostics banner basic
  const banner = document.getElementById('diag-banner');
  function diag(msg){
    console.log('[diag-fallback]', msg);
    if(!banner) return; banner.style.display='block'; banner.textContent='[diag-fallback] '+msg;
  }
  // Fetch diagnostics wrapper (idempotent)
  if(!window.__fetchWrapped){
    window.__fetchWrapped = true;
    const orig = window.fetch;
    window.fetch = async (url, opts)=>{
      const start = Date.now();
      console.log('[diag fetch]', '→', url, opts&&opts.method||'GET');
      try { const res = await orig(url, opts); console.log('[diag fetch]', '←', url, res.status, Date.now()-start+'ms'); return res; }
      catch(e){ console.log('[diag fetch]', '✖', url, e.message); throw e; }
    };
  }
  // Overlay interactive bits (password eye, face demo)
  const passwordEye = document.getElementById('passwordEye');
  const passwordInput = document.getElementById('password');
  passwordEye && passwordEye.addEventListener('click', ()=>{ if(!passwordInput) return; const is = passwordInput.type==='password'; passwordInput.type=is?'text':'password'; passwordEye.textContent=is?'🙈':'👁'; });
  const face = document.getElementById('faceIdIcon');
  face && face.addEventListener('click', ()=>{ face.classList.add('scanning'); setTimeout(()=>{ face.classList.remove('scanning'); window.dispatchEvent(new Event('ft:faceAttempt')); }, 1200); });
  // Alert link handlers
  const forgot = document.getElementById('forgotLink');
  const reg = document.getElementById('registerLink');
  function quietAlert(m){ try{ alert(m); }catch{ console.log('ALERT', m); } }
  if(forgot && !forgot.dataset._bound){
    forgot.dataset._bound='1';
    forgot.addEventListener('click', async e=>{
      e.preventDefault();
      const emailInput = document.getElementById('email');
      const email = emailInput?.value?.trim();
      if(!email){ quietAlert('Enter email first'); return; }
      const originalText = forgot.textContent;
      forgot.textContent='Sending...';
      forgot.style.pointerEvents='none';
      try {
        const res = await fetch('/api/auth/forgot-password',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email})});
        if(res.ok){ quietAlert('If that email exists, reset instructions were sent.'); }
        else { quietAlert('Request failed '+res.status); }
      } catch(err){ quietAlert('Network error'); }
      finally {
        forgot.textContent=originalText; forgot.style.pointerEvents='';
      }
    });
  }
  reg && reg.addEventListener('click', e=>{ e.preventDefault(); quietAlert('Registration flow coming soon'); });
  diag('Fallback overlay handlers active');
})();

(function(){
  const modal = document.getElementById('history-edit-modal');
  if(!modal) return; // modal not present yet
  const form = document.getElementById('history-edit-form');
  const originalDateEl = document.getElementById('original-date');
  const editDateEl = document.getElementById('edit-date');
  const weightEl = document.getElementById('edit-weight');
  const exercisesWrap = document.getElementById('edit-exercises');
  const cancelBtn = document.getElementById('history-edit-cancel');
  let currentEditingEntry = null;

  function closeModal(){
    modal.style.display='none';
    currentEditingEntry = null;
    exercisesWrap.innerHTML='';
    form.reset();
  }
  function openModal(){ modal.style.display='flex'; }

  function buildExerciseInputs(fitnessData){
    exercisesWrap.innerHTML='';
    if(!fitnessData || typeof fitnessData !== 'object') return;
    Object.keys(fitnessData).forEach(key=>{
      const val = fitnessData[key];
      if(val==null || typeof val !== 'object') return;
      const block = document.createElement('div');
      block.className='edit-ex-block';
      const title = document.createElement('label');
      title.textContent= key.charAt(0).toUpperCase()+key.slice(1).replace(/_/g,' ');
      block.appendChild(title);
      Object.keys(val).forEach(metric=>{
        const metricId = `ex-${key}-${metric}`;
        const wrap = document.createElement('div');
        wrap.style.display='flex';
        wrap.style.alignItems='center';
        wrap.style.gap='6px';
        const mLabel = document.createElement('label');
        mLabel.setAttribute('for',metricId);
        mLabel.textContent= metric;
        mLabel.style.minWidth='72px';
        const input=document.createElement('input');
        input.type='number';
        input.id=metricId;
        input.name=`${key}.${metric}`;
        input.value = val[metric] ?? '';
        wrap.appendChild(mLabel); wrap.appendChild(input);
        block.appendChild(wrap);
      });
      exercisesWrap.appendChild(block);
    });
  }

  // Public-ish function hooking into existing history rendering to attach edit handlers
  window.attachHistoryEditHandlers = function(){
    document.querySelectorAll('.history-edit-btn').forEach(btn=>{
      if(btn.dataset._modalBound) return;
      btn.dataset._modalBound='1';
      btn.addEventListener('click', e=>{
        e.preventDefault();
        const row = btn.closest('tr');
        if(!row) return;
        const entryId = row.dataset.entryId; // expecting data-entry-id attr when rendering rows
        const dateStr = row.dataset.entryDate || row.querySelector('.history-date')?.textContent?.trim();
        originalDateEl.value = dateStr;
        editDateEl.value = dateStr;
        // Acquire existing data from a cached map if available or fetch single entry endpoint (not implemented) -> parse cells
        const weightCell = row.querySelector('.history-weight');
        weightEl.value = weightCell ? (weightCell.textContent.replace(/[^0-9.]/g,'')||'') : '';
        // Attempt to parse JSON fitness data if embedded
        let fitnessData = {};
        try {
          const jsonCell = row.querySelector('.history-json');
          if(jsonCell){ fitnessData = JSON.parse(jsonCell.textContent); }
        } catch(err){ fitnessData={}; }
        buildExerciseInputs(fitnessData);
        currentEditingEntry = { id: entryId, originalDate: dateStr, fitnessData };
        openModal();
      });
    });
  }

  cancelBtn?.addEventListener('click', e=>{ e.preventDefault(); closeModal(); });
  modal.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });

  form?.addEventListener('submit', async e=>{
    e.preventDefault();
    if(!currentEditingEntry) return closeModal();
    // Reconstruct fitnessData from form inputs
    const newFitnessData = JSON.parse(JSON.stringify(currentEditingEntry.fitnessData||{}));
    [...form.elements].forEach(el=>{
      if(!el.name || !el.name.includes('.') || el.type!=='number') return;
      const [ex,metric]=el.name.split('.');
      if(!newFitnessData[ex]) newFitnessData[ex]={};
      const v = el.value;
      newFitnessData[ex][metric]= v===''? null : Number(v);
    });
    const payload = {
      date: editDateEl.value,
      weight: weightEl.value? Number(weightEl.value): null,
      fitnessData: newFitnessData,
      originalDate: currentEditingEntry.originalDate
    };
    try {
      const res = await fetch('/api/entries',{ method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+(window.authToken||'')}, body: JSON.stringify(payload)});
      if(!res.ok) throw new Error('Save failed');
      // Refresh history list if function exists
      if(typeof window.refreshHistory === 'function') await window.refreshHistory();
      // Optionally refresh summary if open
      if(document.getElementById('summary-modal')?.style.display==='flex' && typeof window.showSummary==='function') window.showSummary();
      if(window.showToast) window.showToast('Entry updated');
      closeModal();
    } catch(err){
      console.error(err);
      if(window.showToast) window.showToast('Update failed');
    }
  });
})();
