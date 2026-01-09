// ===== AUTHENTICATION MODULE =====
// Extracted and optimized from app.js with new login interface integration

class AuthenticationManager {
  constructor() {
    this.tokenKey = "ft.jwt";
    this.outboxKey = "ft.outbox";
    this.isProduction = !window.location.hostname.includes('localhost');
    this.logger = {
      log: this.isProduction ? () => {} : console.log,
      error: console.error,
      warn: this.isProduction ? () => {} : console.warn
    };
    
    this.initializeEventListeners();
  }

  // Enhanced token management with validation
  getToken() {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp < Date.now() / 1000) {
        this.clearToken();
        return null;
      }
      return token;
    } catch {
      this.clearToken();
      return null;
    }
  }

  setToken(token) { 
    localStorage.setItem(this.tokenKey, token); 
  }

  clearToken() { 
    localStorage.removeItem(this.tokenKey); 
    localStorage.removeItem(this.outboxKey);
  }

  // Enhanced API function with retry logic
  async api(path, { method = "GET", body, retries = 3 } = {}) {
    const token = this.getToken();
    const headers = { 
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    };
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(path, {
          method,
          headers,
          ...(body && { body: JSON.stringify(body) })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Network error' }));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        if (attempt === retries) {
          if (!navigator.onLine && method === "POST") {
            this.queueOutbox({ path, method, body });
            return { queued: true };
          }
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  queueOutbox(entry) {
    const q = JSON.parse(localStorage.getItem(this.outboxKey) || "[]");
    q.push(entry);
    localStorage.setItem(this.outboxKey, JSON.stringify(q));
  }

  async flushOutbox() {
    const q = JSON.parse(localStorage.getItem(this.outboxKey) || "[]");
    if (!q.length) return;
    
    const remaining = [];
    for (const item of q) {
      try { 
        await this.api(item.path, { method: item.method, body: item.body }); 
      } catch { 
        remaining.push(item); 
      }
    }
    localStorage.setItem(this.outboxKey, JSON.stringify(remaining));
  }

  // Initialize login interface event listeners
  initializeEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupLoginInterface();
    });
  }

  setupLoginInterface() {
    // Main sign-in button
    const signInButton = document.getElementById("signInButton");
    if (signInButton) {
      signInButton.onclick = this.handleSignIn.bind(this);
    }

    // Face ID authentication
    const faceIdIcon = document.getElementById("faceIdIcon");
    if (faceIdIcon) {
      faceIdIcon.onclick = this.handleFaceIdAuth.bind(this);
    }

    // Collapsible form functionality
    const signInHeader = document.getElementById('signInHeader');
    if (signInHeader) {
      signInHeader.onclick = this.toggleFormCollapse.bind(this);
    }

    // Register link functionality
    const registerLink = document.getElementById('registerLink');
    if (registerLink) {
      registerLink.onclick = this.toggleRegisterMode.bind(this);
    }

    // Password visibility toggle
    const passwordEye = document.getElementById('passwordEye');
    const passwordInput = document.getElementById('password');
    if (passwordEye && passwordInput) {
      passwordEye.onclick = () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        passwordEye.textContent = isPassword ? '🙈' : '👁';
      };
    }

    this.logger.log("Login interface initialized");
  }

  async handleSignIn() {
    try {
      const email = document.getElementById("email")?.value.trim();
      const password = document.getElementById("password")?.value;
      
      if (!email || !password) {
        this.showToast('Please enter both email and password', 'error');
        return;
      }

      const signInButton = document.getElementById("signInButton");
      const isRegisterMode = signInButton.textContent.includes('Create');
      
      signInButton.textContent = isRegisterMode ? 'Creating Account...' : 'Signing in...';
      signInButton.style.background = '#C5282F';
      signInButton.disabled = true;

      const endpoint = isRegisterMode ? "/api/auth/register" : "/api/auth/login";
      const { token, user } = await this.api(endpoint, { 
        method: "POST", 
        body: { email, password } 
      });
      
      this.setToken(token);
      
      signInButton.textContent = '✓ Success!';
      signInButton.style.background = '#34C759';
      
      setTimeout(async () => {
        await this.bootApp(user.email);
      }, 1000);
      
    } catch (e) { 
      this.handleAuthError(e);
    }
  }

  async handleFaceIdAuth() {
    const faceIdIcon = document.getElementById("faceIdIcon");
    const formContent = document.getElementById("formContent");
    
    // Check if form is collapsed (Face ID mode)
    if (!formContent?.classList.contains('collapsed')) {
      this.showToast('Please collapse the form to use Face ID authentication', 'info');
      return;
    }

    faceIdIcon?.classList.add('scanning');

    // Simulate Face ID scanning
    setTimeout(async () => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      faceIdIcon?.classList.remove('scanning');
      
      if (success) {
        try {
          // Demo authentication
          const { token, user } = await this.api("/api/auth/login", { 
            method: "POST", 
            body: { email: "demo@test.com", password: "demo123" } 
          });
          this.setToken(token);
          setTimeout(async () => {
            await this.bootApp(user.email);
          }, 500);
        } catch (e) {
          this.showToast('Face ID demo: Please use manual login or create an account first', 'error');
        }
      } else {
        this.showToast('Face ID failed. Try again or use manual login.', 'error');
      }
    }, 2000);
  }

  toggleFormCollapse() {
    const formContent = document.getElementById('formContent');
    const collapseArrow = document.getElementById('collapseArrow');
    
    if (formContent && collapseArrow) {
      formContent.classList.toggle('collapsed');
      collapseArrow.classList.toggle('collapsed');
    }
  }

  toggleRegisterMode(e) {
    e?.preventDefault();
    const signInButton = document.getElementById("signInButton");
    const registerLink = document.getElementById('registerLink');
    
    if (signInButton && registerLink) {
      const isCurrentlyRegisterMode = signInButton.textContent.includes('Create');
      
      if (isCurrentlyRegisterMode) {
        signInButton.textContent = 'Sign in';
        registerLink.textContent = 'Create new account';
      } else {
        signInButton.textContent = 'Create Account';
        registerLink.textContent = 'Back to sign in';
      }
    }
  }

  handleAuthError(error) {
    const signInButton = document.getElementById("signInButton");
    const isRegisterMode = signInButton?.textContent.includes('Creating');
    
    if (signInButton) {
      signInButton.textContent = isRegisterMode ? 'Create Account' : 'Sign in';
      signInButton.style.background = '#C5282F';
      signInButton.disabled = false;
    }
    
    this.showToast(error.message || 'Authentication failed', 'error');
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById("save-message") || this.createToastElement();
    toast.textContent = message;
    toast.className = `toast toast-${type}`;
    toast.style.display = "block";
    
    setTimeout(() => {
      toast.style.display = "none";
    }, 3000);
  }

  createToastElement() {
    const toast = document.createElement('div');
    toast.id = 'save-message';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      display: none;
    `;
    document.body.appendChild(toast);
    return toast;
  }

  async bootApp(emailFromAuth) {
    try {
      this.logger.log("Booting app for user:", emailFromAuth);
      
      const authContainer = document.getElementById("auth-container");
      const appContainer = document.getElementById("app-container");
      
      if (authContainer && appContainer) {
        authContainer.style.display = "none";
        appContainer.style.display = "block";
      }
      
      // Initialize main app components
      if (window.FitnessApp) {
        await window.FitnessApp.initialize(emailFromAuth);
      }
      
      this.logger.log("App boot complete");
    } catch (e) {
      this.logger.error("Boot app failed:", e);
      this.showToast("Error loading app: " + e.message, 'error');
      this.clearToken();
      
      const authContainer = document.getElementById("auth-container");
      const appContainer = document.getElementById("app-container");
      
      if (authContainer && appContainer) {
        authContainer.style.display = "block";
        appContainer.style.display = "none";
      }
    }
  }

  async initialize() {
    this.logger.log("Initializing authentication...");
    
    const token = this.getToken();
    this.logger.log("Token:", token ? "exists" : "none");
    
    if (token) {
      try { 
        this.logger.log("Checking authentication...");
        const me = await this.api("/api/me"); 
        this.logger.log("User authenticated:", me);
        await this.bootApp(me.email); 
      } catch (e) { 
        this.logger.error("Auth check failed:", e);
        this.clearToken(); 
        const authContainer = document.getElementById("auth-container");
        if (authContainer) authContainer.style.display = "block"; 
      }
    } else {
      this.logger.log("No token, showing auth screen");
      const authContainer = document.getElementById("auth-container");
      if (authContainer) authContainer.style.display = "block";
    }
  }
}

// Initialize authentication manager
window.AuthManager = new AuthenticationManager();
