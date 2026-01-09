// === CONFIG ===
// Backend service URL - Use relative path since frontend and backend are served from same domain
const API_BASE = "";
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

// === AUTH / STORAGE ===
const tokenKey = "ft.jwt";
const outboxKey = "ft.outbox"; // queue for offline POSTs

function getToken() { return localStorage.getItem(tokenKey); }
function setToken(t) { localStorage.setItem(tokenKey, t); }
function clearToken() { localStorage.removeItem(tokenKey); }

async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = `${API_BASE}${path}`;

  if (!navigator.onLine && method !== "GET") {
    queueOutbox({ path, method, body });
    return { queued: true };
  }

  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error((await res.json().catch(()=>({}))).error || `HTTP ${res.status}`);
  return res.json();
}

function queueOutbox(entry) {
  const q = JSON.parse(localStorage.getItem(outboxKey) || "[]");
  q.push({ ...entry, ts: Date.now() });
  localStorage.setItem(outboxKey, JSON.stringify(q));
}

async function flushOutbox() {
  const q = JSON.parse(localStorage.getItem(outboxKey) || "[]");
  if (!q.length) return;
  const remaining = [];
  for (const item of q) {
    try { await api(item.path, { method: item.method, body: item.body }); }
    catch { remaining.push(item); }
  }
  localStorage.setItem(outboxKey, JSON.stringify(remaining));
}

// === UI Elements ===
let authContainer, appContainer, stationsGrid;

// Initialize DOM elements after DOM is loaded
function initializeDOMElements() {
  authContainer = document.getElementById("loginOverlay") || document.getElementById("auth-container");
  appContainer  = document.getElementById("app-container");
  stationsGrid  = document.getElementById("stations-grid");
  
  console.log("DOM elements initialized:", {
    authContainer: !!authContainer,
    appContainer: !!appContainer, 
    stationsGrid: !!stationsGrid
  });
  
  if (!stationsGrid) {
    console.error("stations-grid element not found!");
  }
  
  // Initialize date display
  const currentDateElement = document.getElementById("current-date");
  if (currentDateElement) {
    currentDateElement.textContent = new Date().toLocaleDateString();
  }
  
  // Setup auth screen handlers
  setupAuthHandlers();
}

function setupAuthHandlers() {
  // Auth screen setup - New iOS-style login interface
  const signInButton = document.getElementById("signInButton");
  if (signInButton) {
    signInButton.onclick = async () => {
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    const signInButton = document.getElementById("signInButton");
    const isRegisterMode = signInButton.textContent === 'Create Account';
    
    signInButton.textContent = isRegisterMode ? 'Creating Account...' : 'Signing in...';
    signInButton.style.background = '#C5282F';
    signInButton.disabled = true;

    const endpoint = isRegisterMode ? "/api/auth/register" : "/api/auth/login";
    const { token, user } = await api(endpoint, { method: "POST", body: { email, password } });
    setToken(token);
    
    signInButton.textContent = '✓ Success!';
    signInButton.style.background = '#34C759';
    
    setTimeout(async () => {
      await bootApp(user.email);
    }, 1000);
  } catch (e) { 
    const signInButton = document.getElementById("signInButton");
    const isRegisterMode = signInButton.textContent.includes('Creating');
    signInButton.textContent = isRegisterMode ? 'Create Account' : 'Sign in';
    signInButton.style.background = '#C5282F';
    signInButton.disabled = false;
    alert(e.message); 
  }
  };

  // Face ID authentication simulation
  const faceIdIcon = document.getElementById("faceIdIcon");
  if (faceIdIcon) {
    faceIdIcon.onclick = async () => {
  const faceIdIcon = document.getElementById("faceIdIcon");
  
  // Check if form is collapsed (Face ID mode)
  const formContent = document.getElementById("formContent");
  if (!formContent.classList.contains('collapsed')) {
    alert('Please collapse the form to use Face ID authentication');
    return;
  }

  faceIdIcon.classList.add('scanning');

  // Simulate Face ID scanning process
  setTimeout(async () => {
    const success = Math.random() > 0.3; // 70% success rate for demo
    
    faceIdIcon.classList.remove('scanning');
    
    if (success) {
      // Simulate successful Face ID login with demo user
      try {
        // For demo purposes, you could auto-fill credentials or use a demo account
        const { token, user } = await api("/api/auth/login", { 
          method: "POST", 
          body: { email: "demo@test.com", password: "demo123" } 
        });
        setToken(token);
        setTimeout(async () => {
          await bootApp(user.email);
        }, 500);
      } catch (e) {
        // If demo account doesn't exist, show message
        alert('Face ID demo: Please use manual login or create an account first');
      }
    } else {
      alert('Face ID failed. Try again or use manual login.');
    }
  }, 2000);
  };
  }

  // Legacy login button support
  const legacyLoginBtn = document.getElementById("btn-login");
  if (legacyLoginBtn) {
    legacyLoginBtn.onclick = async () => {
    try {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const { token, user } = await api("/api/auth/login", { method: "POST", body: { email, password } });
      setToken(token);
      await bootApp(user.email);
    } catch (e) { alert(e.message); }
    };
  }

  const registerBtn = document.getElementById("btn-register");
  if (registerBtn) {
    registerBtn.onclick = async () => {
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const { token, user } = await api("/api/auth/register", { method: "POST", body: { email, password } });
    setToken(token);
    await bootApp(user.email);
    } catch (e) { alert(e.message); }
    };
  }
  
  // Logout button
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.onclick = () => { clearToken(); location.reload(); };
  }
}

// iOS-style Login Interface Interactive Features
function initializeLoginInterface() {
  const signInHeader = document.getElementById('signInHeader');
  const collapseArrow = document.getElementById('collapseArrow');
  const formContent = document.getElementById('formContent');
  const welcomeContent = document.querySelector('.welcome-content');
  const forgotSection = document.getElementById('forgotSection');
  const loginContainer = document.querySelector('.new-login-container');
  const passwordEye = document.getElementById('passwordEye');
  const passwordInput = document.getElementById('password');
  const navButtons = document.querySelectorAll('.nav-button');
  const registerLink = document.getElementById('registerLink');

  // Authentication state
  let isFormCollapsed = false;
  let isRegisterMode = false;

  // Toggle between login and register mode
  function toggleRegisterMode() {
    isRegisterMode = !isRegisterMode;
    const signInButton = document.getElementById('signInButton');
    const signInTitle = document.querySelector('.sign-in-title');
    
    if (isRegisterMode) {
      signInButton.textContent = 'Create Account';
      signInTitle.textContent = 'Create Account';
      registerLink.textContent = 'Already have an account? Sign in';
    } else {
      signInButton.textContent = 'Sign in';
      signInTitle.textContent = 'Sign in';
      registerLink.textContent = 'Create new account';
    }
  }

  // Register link click handler
  registerLink.addEventListener('click', function(e) {
    e.preventDefault();
    toggleRegisterMode();
  });

  // Toggle Sign In form collapse
  function toggleFormCollapse() {
    isFormCollapsed = !isFormCollapsed;
    
    if (isFormCollapsed) {
      formContent.classList.add('collapsed');
      collapseArrow.classList.add('collapsed');
      welcomeContent.classList.add('face-id-mode');
      forgotSection.classList.remove('show');
      loginContainer.classList.remove('expanded');
    } else {
      formContent.classList.remove('collapsed');
      collapseArrow.classList.remove('collapsed');
      welcomeContent.classList.remove('face-id-mode');
      forgotSection.classList.add('show');
      loginContainer.classList.add('expanded');
    }
  }

  // Event Listeners
  signInHeader.addEventListener('click', toggleFormCollapse);
  collapseArrow.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleFormCollapse();
  });

  // Password visibility toggle
  if (passwordEye && passwordInput) {
    passwordEye.addEventListener('click', function() {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.textContent = '🙈';
      } else {
        passwordInput.type = 'password';
        this.textContent = '👁';
      }
    });
  }

  // Navigation buttons
  navButtons.forEach(button => {
    button.addEventListener('click', function() {
      const originalText = this.textContent;
      this.textContent = 'Coming Soon...';
      this.style.background = 'rgba(255,255,255,0.2)';
      setTimeout(() => {
        this.textContent = originalText;
        this.style.background = 'transparent';
      }, 1500);
    });
  });

  // Enhanced keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const activeElement = document.activeElement;
      if (activeElement.id === 'faceIdIcon' && isFormCollapsed) {
        document.getElementById('faceIdIcon').click();
      } else if (!isFormCollapsed && (activeElement.id === 'email' || activeElement.id === 'password')) {
        document.getElementById('signInButton').click();
      }
    }
    
    if (e.key === 'Escape') {
      if (!isFormCollapsed) {
        toggleFormCollapse();
      }
    }
  });

  // Make Face ID icon focusable for accessibility
  const faceIdIcon = document.getElementById('faceIdIcon');
  if (faceIdIcon) {
    faceIdIcon.setAttribute('tabindex', '0');
    faceIdIcon.setAttribute('role', 'button');
    faceIdIcon.setAttribute('aria-label', 'Authenticate with Face ID');
  }

  // Initialize with Face ID mode (collapsed form)
  setTimeout(() => {
    toggleFormCollapse();
  }, 500);
}

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

// Setup button handlers for Save/Reset/History/Summary
function setupButtonHandlers() {
  console.log("Setting up button handlers...");
  
  const btnSave = document.getElementById("btn-save");
  const btnReset = document.getElementById("btn-reset");
  const btnHistory = document.getElementById("btn-history");
  const btnSummary = document.getElementById("btn-summary");
  
  if (btnSave) {
    btnSave.onclick = saveProgress;
    console.log("Save button handler set");
  }
  if (btnReset) {
    btnReset.onclick = resetProgress;
    console.log("Reset button handler set");
  }
  if (btnHistory) {
    btnHistory.onclick = showHistory;
    console.log("History button handler set");
  }
  if (btnSummary) {
    btnSummary.onclick = showSummary;
    console.log("Summary button handler set");
  }
}

// Save / Reset / History / Summary - Original handlers (backup)
// document.getElementById("btn-save").onclick = saveProgress;
// document.getElementById("btn-reset").onclick = resetProgress;
// document.getElementById("btn-history").onclick = showHistory;
// document.getElementById("btn-summary").onclick = showSummary;

async function saveProgress(){
  const dateKey = new Date().toISOString().split("T")[0];
  const weight = document.getElementById("weight").value || null;
  const fitnessData = {};
  exercises.forEach(ex => fitnessData[ex.name] = parseInt(document.getElementById(`count-${ex.name}`).textContent) || 0);

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
    const entries = await api("/api/entries");
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
      row.innerHTML = `
        <td class="date-cell">${formatDisplayDate(entry_date)}</td>
        <td class="weight-cell">
          <input type="number" id="edit-weight-${entry_date}" value="${weight ?? ''}" class="weight-input" placeholder="lbs">
        </td>
        <td class="completed-cell">${completed}/${exercises.length}</td>
        <td class="details-cell">${editableDetails}</td>
        <td class="action-cell">
          <button data-action="save" data-date="${entry_date}" class="save-btn">💾</button>
          <button data-action="delete" data-date="${entry_date}" class="delete-btn">🗑️</button>
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
          <td class="week-header">${formatDisplayDate(row.week_of_sunday)}</td>
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
// Toast
function toast(msg){
  const el = document.getElementById("save-message");
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(()=>{ el.style.display="none"; }, 2000);
}

// Load today's entry into UI if exists
async function loadToday() {
  const dateKey = new Date().toISOString().split("T")[0];
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

// Boot
async function bootApp(emailFromAuth) {
  try {
    console.log("Booting app for user:", emailFromAuth);
    if (authContainer) authContainer.style.display = "none";
    if (appContainer) appContainer.style.display = "block";
    
    // Set user email
    const userEmailElement = document.getElementById("user-email");
    if (userEmailElement) {
      userEmailElement.textContent = emailFromAuth || "demo@demo.com";
    }
    
    // Build stations
    buildStations();
    updateProgress();
    
    // Setup button handlers AFTER the app is visible
    setupButtonHandlers();
    
    await flushOutbox();
    await loadToday();
    console.log("App boot complete");
  } catch (e) {
    console.error("Boot app failed:", e);
    alert("Error loading app: " + e.message);
    clearToken();
    if (authContainer) authContainer.style.display = "block";
    if (appContainer) appContainer.style.display = "none";
  }
}

async function init() {
  console.log("Initializing app...");
  
  // Initialize DOM elements first
  initializeDOMElements();
  
  if (!authContainer || !appContainer) {
    console.error("Required DOM elements not found!");
    return;
  }
  
  // Decide screen by token
  const token = getToken();
  console.log("Token:", token ? "exists" : "none");
  
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, initializing app...");
  // Original authentication system disabled - using new login integration
  // initializeLoginInterface();
  // setupModalClickHandlers();
  // init();
  
  // Only setup modal handlers
  setupModalClickHandlers();
  
  // Make functions globally accessible for login integration
  window.buildStations = buildStations;
  window.updateProgress = updateProgress;
  window.loadToday = loadToday;
  window.initializeDOMElements = initializeDOMElements;
  window.bootApp = bootApp;
  window.setupButtonHandlers = setupButtonHandlers;
  window.showHistory = showHistory;
  window.showSummary = showSummary;
  
  // Initialize DOM elements for global access
  initializeDOMElements();
  
  console.log("Functions exposed globally for login integration");
});
