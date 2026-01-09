// ===== FITNESS TRACKER MODULE =====
// Main application logic for fitness tracking functionality

class FitnessTracker {
  constructor() {
    this.MAX_SETS = 4;
    this.exercises = [
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

    this.isProduction = !window.location.hostname.includes('localhost');
    this.logger = {
      log: this.isProduction ? () => {} : console.log,
      error: console.error,
      warn: this.isProduction ? () => {} : console.warn
    };

    // Cache DOM elements
    this.elements = {};
  }

  async initialize(userEmail) {
    this.logger.log("Initializing fitness tracker for:", userEmail);
    
    try {
      this.cacheElements();
      this.setupEventListeners();
      this.initializeDate();
      await this.buildStations();
      await this.loadToday();
      this.updateProgress();
      await this.flushOutbox();
      
      this.logger.log("Fitness tracker initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize fitness tracker:", error);
      throw error;
    }
  }

  cacheElements() {
    const elementIds = [
      'stations-grid', 'current-date', 'user-email', 'weight',
      'progress-percent', 'progress-fill', 'progress-text',
      'btn-save', 'btn-reset', 'btn-history', 'btn-summary',
      'btn-logout', 'history-modal', 'summary-modal',
      'history-table', 'summary-table', 'save-message'
    ];

    elementIds.forEach(id => {
      this.elements[id] = document.getElementById(id);
    });

    this.logger.log("DOM elements cached");
  }

  setupEventListeners() {
    // Main action buttons
    if (this.elements['btn-save']) {
      this.elements['btn-save'].onclick = this.saveProgress.bind(this);
    }
    if (this.elements['btn-reset']) {
      this.elements['btn-reset'].onclick = this.resetProgress.bind(this);
    }
    if (this.elements['btn-history']) {
      this.elements['btn-history'].onclick = this.showHistory.bind(this);
    }
    if (this.elements['btn-summary']) {
      this.elements['btn-summary'].onclick = this.showSummary.bind(this);
    }
    if (this.elements['btn-logout']) {
      this.elements['btn-logout'].onclick = this.logout.bind(this);
    }

    // Modal click handlers
    this.setupModalHandlers();
    
    // Online event listener for syncing
    window.addEventListener("online", this.flushOutbox.bind(this));

    this.logger.log("Event listeners setup complete");
  }

  setupModalHandlers() {
    const modals = ['history-modal', 'summary-modal'];
    
    modals.forEach(modalId => {
      const modal = this.elements[modalId];
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.closeModal(modalId);
          }
        });
      }
    });
  }

  initializeDate() {
    if (this.elements['current-date']) {
      this.elements['current-date'].textContent = new Date().toLocaleDateString();
    }
  }

  async buildStations() {
    const stationsGrid = this.elements['stations-grid'];
    if (!stationsGrid) return;

    stationsGrid.innerHTML = "";
    
    this.exercises.forEach(ex => {
      const station = this.createStationElement(ex);
      stationsGrid.appendChild(station);
    });

    // Event delegation for station controls
    stationsGrid.addEventListener("click", this.handleStationClick.bind(this));
    
    this.logger.log("Stations built successfully");
  }

  createStationElement(exercise) {
    const station = document.createElement("div");
    station.id = `station-${exercise.name}`;
    station.className = "station";
    station.innerHTML = `
      <div class="station-name">${exercise.name}</div>
      <div class="station-info">Sets: <span id="sets-${exercise.name}">0</span> / ${this.MAX_SETS} | ${exercise.unit}: ${exercise.reps}</div>
      <div class="station-controls">
        <button class="btn btn-decrease" data-name="${exercise.name}" data-delta="-1" disabled>-</button>
        <span class="count" id="count-${exercise.name}">0</span>
        <button class="btn btn-increase" data-name="${exercise.name}" data-delta="1">+</button>
      </div>
    `;
    return station;
  }

  handleStationClick(e) {
    if (!e.target.classList.contains("btn")) return;
    
    const name = e.target.getAttribute("data-name");
    const change = parseInt(e.target.getAttribute("data-delta"), 10);
    
    if (name && !isNaN(change)) {
      this.updateCount(name, change);
    }
  }

  updateCount(exerciseName, change) {
    const countElement = document.getElementById(`count-${exerciseName}`);
    const setsElement = document.getElementById(`sets-${exerciseName}`);
    
    if (!countElement || !setsElement) return;

    const current = parseInt(countElement.textContent) || 0;
    const newCount = Math.max(0, Math.min(current + change, this.MAX_SETS));
    
    countElement.textContent = newCount;
    setsElement.textContent = newCount;

    // Update button states
    const decreaseBtn = document.querySelector(`[data-name="${exerciseName}"][data-delta="-1"]`);
    const increaseBtn = document.querySelector(`[data-name="${exerciseName}"][data-delta="1"]`);
    
    if (decreaseBtn) decreaseBtn.disabled = newCount === 0;
    if (increaseBtn) increaseBtn.disabled = newCount === this.MAX_SETS;

    this.updateProgress();
    this.logger.log(`Updated ${exerciseName}: ${newCount} sets`);
  }

  updateProgress() {
    const completed = this.exercises.filter(ex => {
      const count = parseInt(document.getElementById(`count-${ex.name}`)?.textContent || 0);
      return count === this.MAX_SETS;
    }).length;
    
    const percent = Math.round((completed / this.exercises.length) * 100);
    
    if (this.elements['progress-percent']) {
      this.elements['progress-percent'].textContent = percent + "%";
    }
    if (this.elements['progress-fill']) {
      this.elements['progress-fill'].style.width = percent + "%";
    }
    if (this.elements['progress-text']) {
      this.elements['progress-text'].textContent = `${completed} of ${this.exercises.length} exercises completed`;
    }
  }

  async saveProgress() {
    try {
      const dateKey = new Date().toISOString().split("T")[0];
      const weight = this.elements['weight']?.value || null;
      const fitnessData = {};
      
      this.exercises.forEach(ex => {
        const count = parseInt(document.getElementById(`count-${ex.name}`)?.textContent || 0);
        fitnessData[ex.name] = count;
      });

      const result = await window.AuthManager.api("/api/entries", { 
        method: "POST", 
        body: { date: dateKey, weight, fitnessData }
      });
      
      const message = result?.queued ? "Offline: queued to sync" : "Progress saved!";
      this.showToast(message, result?.queued ? 'warning' : 'success');
      
    } catch (e) {
      this.showToast("Save failed: " + e.message, 'error');
    }
  }

  resetProgress() {
    this.exercises.forEach(ex => {
      const countElement = document.getElementById(`count-${ex.name}`);
      if (countElement) {
        const currentVal = parseInt(countElement.textContent) || 0;
        if (currentVal > 0) {
          this.updateCount(ex.name, -currentVal);
        }
      }
    });
    
    if (this.elements['weight']) {
      this.elements['weight'].value = "";
    }
    
    this.showToast("Progress reset", 'info');
  }

  async loadToday() {
    try {
      const dateKey = new Date().toISOString().split("T")[0];
      const data = await window.AuthManager.api(`/api/entries/${dateKey}`);
      
      if (data) {
        if (data.weight && this.elements['weight']) {
          this.elements['weight'].value = data.weight;
        }
        
        this.exercises.forEach(ex => {
          const sets = data.fitness_data?.[ex.name] || 0;
          const current = parseInt(document.getElementById(`count-${ex.name}`)?.textContent || 0);
          this.updateCount(ex.name, sets - current);
        });
        
        this.logger.log("Today's data loaded");
      }
    } catch (e) {
      this.logger.error("Failed to load today's data:", e);
    }
  }

  async showHistory() {
    try {
      const table = this.elements['history-table'];
      if (!table) return;

      table.innerHTML = "";
      const entries = await window.AuthManager.api("/api/entries");
      
      entries.forEach(({entry_date, weight, fitness_data}) => {
        const row = this.createHistoryRow(entry_date, weight, fitness_data);
        table.appendChild(row);
      });

      this.setupHistoryEventHandlers(table);
      this.showModal('history-modal');
      
    } catch (e) {
      this.showToast("Failed to load history: " + e.message, 'error');
    }
  }

  createHistoryRow(entry_date, weight, fitness_data) {
    const completed = Object.values(fitness_data || {}).filter(v => v === this.MAX_SETS).length;
    
    let editableDetails = "";
    for (const [exName, sets] of Object.entries(fitness_data || {})) {
      editableDetails += `
        <div class="exercise-row">
          <span class="exercise-name">${exName}:</span>
          <input type="number" id="edit-${entry_date}-${exName}" value="${sets}" min="0" max="${this.MAX_SETS}" class="sets-input">
          <span class="sets-label">sets</span>
        </div>`;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="date-cell">${this.formatDisplayDate(entry_date)}</td>
      <td class="weight-cell">
        <input type="number" id="edit-weight-${entry_date}" value="${weight ?? ''}" class="weight-input" placeholder="lbs">
      </td>
      <td class="completed-cell">${completed}/${this.exercises.length}</td>
      <td class="details-cell">${editableDetails}</td>
      <td class="action-cell">
        <button data-action="save" data-date="${entry_date}" class="save-btn">💾</button>
        <button data-action="delete" data-date="${entry_date}" class="delete-btn">🗑️</button>
      </td>
    `;
    
    return row;
  }

  setupHistoryEventHandlers(table) {
    table.onclick = async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      
      e.stopPropagation();
      const date = btn.getAttribute("data-date");
      const action = btn.getAttribute("data-action");
      
      if (action === "save") await this.saveHistoryEntry(date);
      if (action === "delete") await this.deleteHistoryEntry(date);
    };
  }

  async saveHistoryEntry(date) {
    try {
      const newWeight = document.getElementById(`edit-weight-${date}`)?.value || null;
      const newFitnessData = {};
      
      this.exercises.forEach(ex => {
        const val = parseInt(document.getElementById(`edit-${date}-${ex.name}`)?.value || 0);
        newFitnessData[ex.name] = Math.max(0, Math.min(val, this.MAX_SETS));
      });
      
      await window.AuthManager.api("/api/entries", { 
        method: "POST", 
        body: { date, weight: newWeight, fitnessData: newFitnessData }
      });
      
      this.showToast("Updated!", 'success');
      this.showHistory(); // Refresh
      
    } catch (e) {
      this.showToast("Update failed: " + e.message, 'error');
    }
  }

  async deleteHistoryEntry(date) {
    if (!confirm("Delete this entry?")) return;
    
    try {
      await window.AuthManager.api(`/api/entries/${date}`, { method: "DELETE" });
      this.showToast("Deleted", 'success');
      this.showHistory(); // Refresh
    } catch (e) {
      this.showToast("Delete failed: " + e.message, 'error');
    }
  }

  async showSummary() {
    try {
      const table = this.elements['summary-table'];
      if (!table) return;

      table.innerHTML = "";
      const weeks = await window.AuthManager.api("/api/summary");
      
      if (!weeks || weeks.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td colspan="14" style="text-align: center; padding: 20px; color: #666;">
            No workout data available yet. Start tracking your workouts to see weekly summaries!
          </td>
        `;
        table.appendChild(tr);
      } else {
        weeks.forEach(row => {
          const tr = this.createSummaryRow(row);
          table.appendChild(tr);
        });
      }
      
      this.showModal('summary-modal');
      
    } catch (e) {
      this.showToast("Failed to load summary: " + e.message, 'error');
    }
  }

  createSummaryRow(row) {
    const totals = row.totals || {};
    const totalSets = Object.values(totals).reduce((a, b) => a + parseInt(b || 0), 0);
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="week-header">${this.formatDisplayDate(row.week_of_sunday)}</td>
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
    
    return tr;
  }

  showModal(modalId) {
    const modal = this.elements[modalId];
    if (modal) {
      modal.style.display = "flex";
    }
  }

  closeModal(modalId) {
    const modal = this.elements[modalId];
    if (modal) {
      modal.style.display = "none";
    }
  }

  formatDisplayDate(dateString) {
    try {
      const date = new Date(dateString + 'T00:00:00');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      return `${month}/${day}/${year}`;
    } catch (error) {
      this.logger.error('Date formatting error:', error, 'for date:', dateString);
      return dateString;
    }
  }

  logout() {
    window.AuthManager.clearToken();
    location.reload();
  }

  async flushOutbox() {
    if (window.AuthManager) {
      await window.AuthManager.flushOutbox();
    }
  }

  showToast(message, type = 'info') {
    if (window.AuthManager) {
      window.AuthManager.showToast(message, type);
    }
  }
}

// Initialize fitness tracker
window.FitnessApp = new FitnessTracker();
