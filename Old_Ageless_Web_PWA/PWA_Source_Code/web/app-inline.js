// Externalized from inline <script> in index.html to satisfy CSP (script-src 'self')
// Startup guard: if a stale cached HTML variant still includes legacy #fitness-submenu, remove it early
try {
	const stale = document.getElementById('fitness-submenu');
	if (stale) {
		stale.remove();
		console.log('[guard] removed stale fitness-submenu (migrated)');
	}
} catch {}
// Fitness Tracker with ORIGINAL Login Interface
// Centralized UI timing & delay constants
const UI_TIMING = Object.freeze({
	WELCOME_BANNER_VISIBLE: 3000,
	BANNER_FADE_MS: 500,
	TOAST_DEFAULT: 2500,
	TOAST_ERROR: 5000,
	SPLASH_DURATION: 3500,
	MENU_HIDE_DELAY: 320,
	FLYOUT_HIDE_DELAY: 260,
	IMMEDIATE_SAVE_DEBOUNCE: 800,
	WEIGHT_SAVE_DEBOUNCE: 400,
});
// Feature flag: leave full Box.svg artwork in Rewards nav (default false for outline logic disabled)
const USE_REWARDS_OUTLINE = false;
class FitnessTracker {
	constructor() {
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
		this.maxSets = 4;
		this.isAuthenticated = false;
		this.authToken = localStorage.getItem('fitness-tracker-token');
		this.autoSaveInterval = null;
		this.hasUnsavedChanges = false;
		this.lastSaveTime = null;
		this.editingDate = null; // if set, saving targets this date instead of today
		this._todayBackup = null; // backup of today data when editing past entry
		this.silentUntil = 0; // suppress non-error toasts until timestamp
		// Offline persistence keys
		this.outboxKey = 'ft.pendingEntries'; // array of {date, weight, fitnessData, ts}
		this.lastFlushAttempt = 0;
		this.init();
		// Check if user is already logged in
		if (this.authToken) {
			this.verifyToken();
		}
	}
	getLocalDateKey(date = new Date()) {
		// Force America/New_York date (Eastern) to avoid rollover issues
		try {
			const opts = { timeZone: 'America/New_York', year:'numeric', month:'2-digit', day:'2-digit' };
			const parts = new Intl.DateTimeFormat('en-CA', opts).formatToParts(date); // en-CA yields YYYY-MM-DD order
			const map = Object.fromEntries(parts.map(p=>[p.type,p.value]));
			return `${map.year}-${map.month}-${map.day}`;
		} catch {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		}
	}
	getTodayDateKey() { return this.getLocalDateKey(); }
 	async verifyToken() {
 		try {
 			const response = await fetch('/api/auth/verify', { method: 'GET', headers: { 'Authorization': `Bearer ${this.authToken}` } });
 			if (response.ok) {
 				const data = await response.json();
 				this.completeAuthentication(data.user.email);
 			} else {
 				localStorage.removeItem('fitness-tracker-token');
 				this.authToken = null;
 			}
 		} catch (error) {
 			console.error('Token verification failed:', error);
 			localStorage.removeItem('fitness-tracker-token');
 			this.authToken = null;
 		}
 	}

	async init() {
		this.setupOriginalLoginInterface();
		await this.loadCurrentWorkout();
		this.updateProgress();
		// Attempt background flush of any queued saves (user not yet authed -> will defer until post-auth)
		this.installConnectivityHandlers();
		console.log('Fitness Tracker initialized with original login interface');
	}

	installConnectivityHandlers(){
		if(this._connectivityBound) return; this._connectivityBound=true;
		window.addEventListener('online', ()=> this.flushPendingEntries());
		// Heartbeat flush every 90s while online & authed
		setInterval(()=>{ if(this.isAuthenticated && navigator.onLine) this.flushPendingEntries(); }, 90000);
	}

	queuePendingEntry(entry){
		try {
			const raw = localStorage.getItem(this.outboxKey); const list = raw ? JSON.parse(raw) : [];
			// De-dupe by date (keep latest)
			const filtered = list.filter(e=> e.date !== entry.date);
			filtered.push({...entry, ts: Date.now()});
			localStorage.setItem(this.outboxKey, JSON.stringify(filtered));
			console.log('[offline] queued entry for', entry.date, '(total', filtered.length, ')');
		} catch(err){ console.warn('[offline] queue failed', err); }
	}

	async flushPendingEntries(force=false){
		if(!this.authToken || !this.isAuthenticated) return; // only flush when authed
		const now = Date.now();
		if(!force && (now - this.lastFlushAttempt) < 5000) return; // throttle
		this.lastFlushAttempt = now;
		let list = [];
		try { list = JSON.parse(localStorage.getItem(this.outboxKey)||'[]'); } catch{}
		if(!list.length) return;
		// Oldest first
		list.sort((a,b)=> a.ts - b.ts);
		const remain = [];
		for(const item of list){
			try {
				const headers = {'Content-Type':'application/json'}; if(this.authToken) headers['Authorization']=`Bearer ${this.authToken}`;
				const res = await fetch('/api/entries',{method:'POST', headers, body: JSON.stringify({ date:item.date, weight:item.weight, fitnessData:item.fitnessData })});
				if(!res.ok) throw new Error('HTTP '+res.status);
				console.log('[offline] flushed entry', item.date);
			} catch(err){ console.warn('[offline] flush failed for', item.date, err.message); remain.push(item); }
		}
		if(remain.length){ localStorage.setItem(this.outboxKey, JSON.stringify(remain)); }
		else localStorage.removeItem(this.outboxKey);
	}

	setupOriginalLoginInterface() {
		const faceIdIcon = document.getElementById('faceIdIcon');
		if (faceIdIcon) faceIdIcon.addEventListener('click', () => this.authenticate());
		const signInHeader = document.getElementById('signInHeader');
		const formContent = document.getElementById('formContent');
		const formSection = document.querySelector('.form-section');
		const forgotSection = document.getElementById('forgotSection');
		if (signInHeader && formContent && formSection) {
			signInHeader.addEventListener('click', () => {
				const isExpanded = formContent.classList.contains('show');
				if (isExpanded) {
					formContent.classList.remove('show');
					formSection.style.display = 'none';
					signInHeader.classList.remove('expanded');
					forgotSection.classList.remove('show');
					document.getElementById('loginContainer').classList.remove('expanded');
				} else {
					formContent.classList.add('show');
					formSection.style.display = 'block';
					signInHeader.classList.add('expanded');
					forgotSection.classList.add('show');
					document.getElementById('loginContainer').classList.add('expanded');
				}
			});
		}
		const signInButton = document.getElementById('signInButton');
		if (signInButton) signInButton.addEventListener('click', () => this.signInWithEmail());
		const registerBtn = document.getElementById('registerButton');
		if (registerBtn) {
			registerBtn.addEventListener('click', async () => {
				const goalsGroup = document.getElementById('goalsGroup');
				// First click: reveal goals selection panel
				if(goalsGroup && (goalsGroup.style.display==='none' || getComputedStyle(goalsGroup).display==='none')){
					goalsGroup.style.display='block';
					registerBtn.dataset.step='goals-shown';
					this.showMessage && this.showMessage('Select one or more goals then tap Register again','info',3500);
					goalsGroup.scrollIntoView({behavior:'smooth', block:'center'});
					return;
				}
				// Second click: perform registration via existing multi-goal flow
				registerBtn.disabled = true;
				registerBtn.textContent = 'Registering...';
				await this.registerNewUser();
				// registerNewUser resets button state; if it threw, re-enable here
				if(registerBtn.disabled){
					registerBtn.disabled = false;
					if(!registerBtn.dataset.step) registerBtn.textContent='Register';
				}
			});
		}
		const forgotLink = document.getElementById('forgotPasswordLink');
		if(forgotLink){
			forgotLink.addEventListener('click', async (e)=>{
				e.preventDefault();
				const email = document.getElementById('email')?.value?.trim();
				if(!email) { this.showMessage('Enter email first','error'); return; }
				try {
					const resp = await fetch('/api/auth/forgot-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
					if(resp.ok) this.showMessage('Reset instructions (placeholder) sent if account exists','info',4000);
					else this.showMessage('Request failed','error');
				}catch(err){ this.showMessage('Network error','error'); }
			});
		}
		// Keep original menu icon (no dynamic padding tweaks that offset position)
		const menuIcon = document.getElementById('menu-icon');
		if(menuIcon){
			menuIcon.addEventListener('touchstart',()=> menuIcon.classList.add('active'));
			menuIcon.addEventListener('touchend',()=> menuIcon.classList.remove('active'));
			// Ensure click toggles legacy dropdown only when hamburger visible (non-PWA context)
			menuIcon.addEventListener('click', (e)=>{
				const isPwa = this.isPwaContext && this.isPwaContext();
				if(isPwa) return; // flyouts handle navigation
				const menu = document.getElementById('dropdown-menu');
				if(!menu) return;
				const open = menu.classList.toggle('show');
				menuIcon.classList.toggle('active', open);
				if(open){
					// Close on outside click once
					const closeHandler = (ev)=>{
						if(!menu.contains(ev.target) && ev.target!==menuIcon){ menu.classList.remove('show'); menuIcon.classList.remove('active'); document.removeEventListener('click', closeHandler); }
					};
					setTimeout(()=> document.addEventListener('click', closeHandler));
				}
			});
		}
		console.log('Original login interface setup complete');
	}
	authenticate() {
		console.log('Face ID authentication started...');
		const faceIdIcon = document.getElementById('faceIdIcon');
		faceIdIcon.classList.add('scanning');
		setTimeout(async () => {
			faceIdIcon.classList.remove('scanning');
			const storedToken = localStorage.getItem('fitness-tracker-token');
			if (storedToken) {
				try {
					const response = await fetch('/api/auth/verify', { method: 'GET', headers: { 'Authorization': `Bearer ${storedToken}` } });
					if (response.ok) {
						const data = await response.json();
						this.authToken = storedToken;
						this.completeAuthentication(data.user.email);
						return;
					}
				} catch (error) { console.log('Stored token invalid'); }
			}
			alert('Face ID requires your credentials to be stored securely. Please sign in with email and password.');
		}, 2000);
	}
	async signInWithEmail() {
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		if (!email || !password) { alert('Please enter both email and password.'); return; }
		console.log('Email authentication:', { email });
		try { await this.performLogin(email, password); } catch (error) { console.error('Login failed:', error); alert('Login failed: ' + error.message); }
	}
	async performLogin(email, password) {
		try {
			const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify({ email, password }) });
			if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || `HTTP ${response.status}`); }
			const data = await response.json();
			this.authToken = data.token;
			localStorage.setItem('fitness-tracker-token', this.authToken);
			console.log('Login successful, token received');
			this.completeAuthentication(data.user.email);
		} catch (error) { console.error('performLogin error:', error); throw error; }
	}
	completeAuthentication(email) {
		this.isAuthenticated = true;
		try { if(email){ const localPart = email.split('@')[0]; localStorage.setItem('mbh_userLocalPart', localPart); } } catch(_){ }
		console.log('[pwa-detect] isPwaContext=', (this.isPwaContext && this.isPwaContext()));
		// Suppress minor success/info toasts for 6s while welcome banner visible
		this.silentUntil = Date.now() + 6000;
		['menu-assessments','menu-goals','menu-progress','menu-rewards','menu-history','menu-summary'].forEach(id=>{ const el=document.getElementById(id); if(el) el.disabled=false; });
		// Expose menu now visible
		const menuContainer = document.querySelector('.menu-container');
		if(menuContainer) menuContainer.classList.remove('hidden');
		// Hide login overlay explicitly (avoid any residual cover)
		const overlay = document.getElementById('loginOverlay'); if(overlay) overlay.style.display='none';
		this.initMenu();
		setTimeout(() => { this.syncLocalDataToDatabase(); }, 1000);
		document.getElementById('app-container').style.display = 'block';
		// Inject top banner nav (only after app container visible)
		this.initTopBannerNav();
		// PWA-only: inject red header + profile (Account tab removed only in PWA)
		if(this.isPwaContext && this.isPwaContext()){
			document.body.classList.add('is-pwa');
			this.ensurePwaHeader();
			// Mark app active so CSS can reveal header (login page remains untouched)
			document.body.classList.add('pwa-app-active');
			this.removeAccountTabIfPresent && this.removeAccountTabIfPresent();
		}
		// Fallback: after initial UI settle, if override forced & header missing, inject anyway
		setTimeout(()=>{
			try {
				if((localStorage.getItem('forcePwa')==='1' || localStorage.getItem('forceFlyouts')==='1') && !document.querySelector('.pwa-main-header')){
					console.log('[pwa-header] fallback injection executing');
					document.body.classList.add('is-pwa');
					this.ensurePwaHeader();
				}
			} catch(err){ console.warn('[pwa-header] fallback failed', err); }
		}, 1200);
		this.buildStations();
		this.setupButtonHandlers();
		// After auth, reload today's data (now authorized) to populate progress
		this.loadTodaysDataFromHistory().then(()=> this.updateProgress());
		this.startAutoSave();
		// Deferred recovery of any locally cached unsent data (guarded)
		setTimeout(async () => { if(typeof this.checkForDataRecovery === 'function'){ try { await this.checkForDataRecovery(); } catch(err){ console.warn('Data recovery check failed:', err); } } }, 500);
		// Flush any pending offline entries now that we are authenticated
		this.flushPendingEntries(true);
		// Show centered welcome banner (persist 1s longer before fade)
		this.showWelcomeBanner("Welcome back !");
		// Initialize bottom nav (visual only)
		this.initPwaNav();
		// PWA-only top flyout panels replacing hamburger (desktop retains original)
		this.initTopFlyoutsIfPwa();
		console.log('[auth] authenticated, UI ready');
		// After all primary UI elements are present, compute drawer offsets so header/top banner and bottom nav remain visible
		// New unified inset computation (replaces updateDrawerOffsets)
		this.computeChromeInsets && this.computeChromeInsets(true);
		setTimeout(()=>{ this.computeChromeInsets && this.computeChromeInsets(); }, 550); // settle pass
		this.initChromeInsetListeners && this.initChromeInsetListeners();
		// Optional: initialize insets debug overlay if requested via query
		try { const qp=new URLSearchParams(location.search); if(qp.get('debugInsets')==='1'){ this._enableInsetsDebug(); } } catch{}
	}

	/**
	 * Unified chrome inset computation (header + top banner + bottom nav + safe areas).
	 * Light debounce / collapse of rapid events handled by scheduling flags.
	 */
	computeChromeInsets(immediate=false){
		try {
			if(this._insetScheduled && !immediate) return; // collapse bursts
			this._insetScheduled = true;
			const run = ()=>{
				this._insetScheduled = false;
				const root = document.documentElement;
				const header = document.querySelector('.pwa-main-header');
				// Support id or class for top banner nav
				const topBanner = document.getElementById('top-banner-nav') || document.querySelector('.top-banner-nav');
				const bottomNav = document.querySelector('.pwa-nav');
				let topH = 0;
				// Use boundingClientRect to avoid issues with margins / transforms
				if(header){ const r = header.getBoundingClientRect(); if(r.height>0) topH += Math.round(r.height); }
				if(topBanner){
					const r2 = topBanner.getBoundingClientRect();
					if(r2.height>0){ topH += Math.round(r2.height); }
					else {
						try { const cs = getComputedStyle(topBanner); const h = parseFloat(cs.height)||0; if(h>0) topH += Math.round(h); } catch{}
					}
				}
				const TOP_BUFFER = 0; // zero-gap: drawers start exactly below banner/header in PWA
				let bottomH = 0;
				if(bottomNav){ const rb = bottomNav.getBoundingClientRect(); if((rb.height||0)>0) bottomH += Math.round(rb.height); }
				root.style.setProperty('--chrome-top', `calc(${topH}px + env(safe-area-inset-top,0px) + ${TOP_BUFFER}px)`);
				// bottomH already includes any safe-area padding applied to the fixed bottom nav; do not add env() again
				root.style.setProperty('--chrome-bottom', `${bottomH}px`);
				// Also mirror legacy vars for existing CSS until cleaned
				root.style.setProperty('--mbh-drawer-top', `calc(${topH}px + env(safe-area-inset-top,0px) + ${TOP_BUFFER}px)`);
				root.style.setProperty('--mbh-drawer-bottom', `${bottomH}px`);
				// Body top offset: apply only for non-PWA. In PWA we rely on #app-container margin-top: var(--chrome-top)
				try {
					const isPwa = this.isPwaContext && this.isPwaContext();
					document.body.style.paddingTop = isPwa ? '' : (topH + 'px');
				} catch{}
				// Mark that insets are computed (only if we have a non-zero top measurement) so PWA drawers can become visible without flicker
				try {
					if(document.body.classList.contains('is-pwa')){
						if(topH>0) document.body.classList.add('insets-ready');
					}
				} catch{}
				// Update debug overlay if enabled
				try { if(this._insetsDebug) { this._updateInsetsDebug(topH, bottomH); } } catch{}
			};
			if(immediate){ run(); }
			else { requestAnimationFrame(run); }
		}catch(err){ console.warn('[chrome-insets] failed', err); }
	}
	initChromeInsetListeners(){
		if(this._chromeInsetListeners) return; this._chromeInsetListeners = true;
		const reschedule = ()=> this.computeChromeInsets();
		['resize','orientationchange'].forEach(ev=> window.addEventListener(ev, reschedule, { passive:true }));
		// iOS keyboard / viewport changes
		try { if(window.visualViewport){ visualViewport.addEventListener('resize', reschedule, { passive:true }); visualViewport.addEventListener('scroll', reschedule, { passive:true }); } } catch{}
		// Minimal mutation observer (attributes & child changes) on chrome elements
		try {
			const mo = new MutationObserver(()=> reschedule());
			['.pwa-main-header','#top-banner-nav','.pwa-nav'].forEach(sel=>{ const el=document.querySelector(sel); if(el) mo.observe(el,{subtree:true,childList:true,attributes:true}); });
		}catch{}
	}
	// Legacy shim (keep for safety; remove later)
	updateDrawerOffsets(){ this.computeChromeInsets(true); }

	// Debug overlay: shows chrome-top/bottom and safe-area env values (opt-in via ?debugInsets=1)
	_enableInsetsDebug(){
		if(this._insetsDebug) return; this._insetsDebug = true;
		const box = document.createElement('div');
		box.id = 'insets-debug';
		box.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:5000;background:rgba(0,0,0,.75);color:#0f0;font:12px/1.4 monospace;padding:8px 10px;border-radius:6px;pointer-events:none;white-space:pre;max-width:80vw;opacity:.9;';
		box.textContent = 'insets debug…';
		document.body.appendChild(box);
		this._insetsDebugBox = box;
		this._updateInsetsDebug(0,0);
	}
	_updateInsetsDebug(topH,bottomH){
		const g = (n)=>{
			try { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); } catch { return ''; }
		};
		const env = (name)=>{
			try { return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim(); } catch { return ''; }
		};
		const cssTop = g('--chrome-top');
		const cssBottom = g('--chrome-bottom');
		const msg = [
			`topH(measured): ${topH}px`,
			`bottomH(measured): ${bottomH}px`,
			`--chrome-top: ${cssTop}`,
			`--chrome-bottom: ${cssBottom}`,
			`env(top): env(safe-area-inset-top)`,
			`env(bottom): env(safe-area-inset-bottom)`
		].join('\n');
		if(this._insetsDebugBox){ this._insetsDebugBox.textContent = msg; }
	}

	// (removed misplaced window load listener – handled globally after class definition)

	// Build red header + profile icon (PWA only)
	ensurePwaHeader(){
		if(document.querySelector('.pwa-main-header')) return;
		const header=document.createElement('div');
		header.className='pwa-main-header';
		header.innerHTML=`<div class="pwa-main-header__title pwa-main-header__title--center">Ageless Body.</div><button class="pwa-profile-btn" type="button" aria-label="Account" title="Account"></button>`;
		if(!document.getElementById('pwa-profile-btn-style')){ const s=document.createElement('style'); s.id='pwa-profile-btn-style'; s.textContent=`.pwa-profile-btn{position:absolute;top:50%;right:calc(env(safe-area-inset-right,0px) + 10px);transform:translateY(-50%);padding:4px 6px;}`; document.head.appendChild(s); }
		// Replace placeholder icon with provided SVG (scaled down)
		const profileBtn = header.querySelector('.pwa-profile-btn');
		if(profileBtn){
			// Use path relative to page root; index.html is in web/ so remove leading segment
			profileBtn.innerHTML = `<img src="icons/profile_icon_swoop_nocircle.svg" alt="Profile" style="width:34px;height:34px;display:block;"/>`;
		}
		// Insert as very first element AFTER we are authenticated, but before nav/banner to ensure top placement
		const first = document.body.firstChild;
		if(first) document.body.insertBefore(header, first); else document.body.appendChild(header);
		// Toggle profile dropdown instead of immediately navigating away
		const profileBtnEl = header.querySelector('.pwa-profile-btn');
		if(profileBtnEl){
			// Build dropdown container once
			let dd = document.createElement('div');
			dd.className = 'pwa-profile-dropdown';
			dd.innerHTML = `
				<button type="button" data-action="account">Account</button>
				<button type="button" data-action="settings">Settings</button>
				<button type="button" data-action="support">Support</button>
				<div class="sep"></div>
				<button type="button" data-action="logout" class="danger">Logout</button>`;
			profileBtnEl.appendChild(dd);

			// Build full account drawer (PWA only)
			if(!document.getElementById('account-drawer')){
				const drawer=document.createElement('div');
				drawer.id='account-drawer';
				// Ensure icons resolve correctly whether running from /web/index.html or root /index.html
				const _iconPrefix = (location.pathname.indexOf('/web/') !== -1) ? '' : 'web/';
				drawer.innerHTML=`<div class="account-drawer__inner">
					<button type="button" class="account-drawer__close" aria-label="Close account panel">✕</button>
					<header class="account-drawer__header">
						<div class="member-name" id="accountDrawerName">Member</div>
						<div class="member-meta" id="accountDrawerMeta">Member since —</div>
					</header>
					<nav class="account-drawer__nav" aria-label="Account menu">
						<ul class="account-drawer__list" id="accountDrawerList">
							<li class="account-drawer__item">
								<button type="button" class="account-drawer__link" data-account-item="transactions">
									<span class="profile-icon-wrapper" aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;">
										<img alt="" width="24" height="24" style="display:block;width:24px;height:24px;object-fit:contain;" src="icons/resized_bagicon_24x24.png" />
									</span>
									<span>Transactions</span>
									<svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
								</button>
							</li>
							<li class="account-drawer__item">
								<button type="button" class="account-drawer__link" data-account-item="payments">
									<span class="profile-icon-wrapper" aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;">
										<!-- icon injected at runtime from web/icons/Revised_credit_card2.svg -->
									</span>
									<span>Payments &amp; subscriptions</span>
									<svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
								</button>
							</li>
							<li class="account-drawer__item">
								<button type="button" class="account-drawer__link" data-account-item="profile">
									<span class="profile-icon-wrapper" aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;">
										<svg class="profile-small-icon" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
											<circle cx="100" cy="75" r="28" fill="none" stroke="#000" stroke-width="10" stroke-linecap="round"/>
											<path d="M 58 152 Q 60 118 82 112 Q 100 120 118 112 Q 140 118 142 152" fill="none" stroke="#000" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
										</svg>
									</span>
									<span>Profile &amp; preferences</span>
									<svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
								</button>
							</li>
							<li class="account-drawer__item">
								<button type="button" class="account-drawer__link" data-account-item="help">
									<span class="profile-icon-wrapper" aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;">
										<img alt="" width="24" height="24" style="display:block;width:24px;height:24px;object-fit:contain;" src="icons/Helpicon.png" />
									</span>
									<span>Help &amp; policies</span>
									<svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
								</button>
							</li>
						</ul>
					</nav>
						<!-- Help & Policies Subpanel -->
						<div class="account-subpanel" id="helpSubpanel" aria-label="Help & Policies" role="region">
							<header class="subpanel-header">
								<button type="button" class="subpanel-back" aria-label="Back to Account menu" data-subpanel-back>
									<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
								</button>
								<h2>Help &amp; Policies</h2>
							</header>
							<nav aria-label="Help & Policies options">
								<ul class="subpanel-list">
									<li class="subpanel-item"><button type="button" class="subpanel-link" data-help-action="support">Customer support <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
									<li class="subpanel-item"><button type="button" class="subpanel-link" data-help-action="legal">Legal <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								</ul>
							</nav>
						</div>
							<!-- Payments & Subscriptions Subpanel -->
							<div class="account-subpanel" id="paymentsSubpanel" aria-label="Payments & Subscriptions" role="region">
								<header class="subpanel-header">
									<button type="button" class="subpanel-back" aria-label="Back to Account menu" data-subpanel-back>
										<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
									</button>
									<h2>Payments &amp; Subscriptions</h2>
								</header>
								<nav aria-label="Payments & Subscriptions options">
									<ul class="subpanel-list">
										<li class="subpanel-item"><button type="button" class="subpanel-link" data-pay-action="methods">Manage payment methods <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
										<li class="subpanel-item"><button type="button" class="subpanel-link" data-pay-action="add-funds">Add funds <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
										<li class="subpanel-item"><button type="button" class="subpanel-link" data-pay-action="egift">Send an eGift card <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
									</ul>
								</nav>
							</div>
						<!-- Profile & Preferences Subpanel -->
						<div class="account-subpanel" id="profileSubpanel" aria-label="Profile & Preferences" role="region">
							<header class="subpanel-header">
								<button type="button" class="subpanel-back" aria-label="Back to Account menu" data-subpanel-back>
									<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
								</button>
								<h2>Profile &amp; Preferences</h2>
							</header>
							<nav aria-label="Profile & Preferences options">
								<ul class="subpanel-list">
									<li class="subpanel-item"><button type="button" class="subpanel-link" data-profile-action="edit-profile">Edit profile <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
									<li class="subpanel-item"><button type="button" class="subpanel-link" data-profile-action="addresses">Manage addresses <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
									<li class="subpanel-item"><button type="button" class="subpanel-link" data-profile-action="dietary">Dietary preferences <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
									<li class="subpanel-item"><button type="button" class="subpanel-link" data-profile-action="comm-privacy">Communication &amp; privacy <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								</ul>
							</nav>
						</div>
						<!-- Transactions Subpanel -->
						<div class="account-subpanel" id="transactionsSubpanel" aria-label="Transactions" role="region">
							<header class="subpanel-header">
								<button type="button" class="subpanel-back" aria-label="Back to Account menu" data-subpanel-back>
									<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
								</button>
								<h2>Transactions</h2>
							</header>
							<nav aria-label="Transactions options">
								<ul class="subpanel-list">
									<li class="subpanel-item"><button type="button" class="subpanel-link" data-trans-action="history">Transaction History <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
									<li class="subpanel-item"><button type="button" class="subpanel-link" data-trans-action="active">Active orders <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								</ul>
							</nav>
						</div>
				</div>`;
				document.body.appendChild(drawer);
				// Option A: Mirror Profile by inlining the provided Payments SVG at runtime
				// Uses only your file (Revised_credit_card2.svg) and avoids path issues in PWA
				try {
					(async () => {
						const wrapper = drawer.querySelector('[data-account-item="payments"] .profile-icon-wrapper');
						if (!wrapper) return;
						// Prefer path relative to current page first, then absolute fallbacks
						const tryUrls = [
							'icons/Revised_credit_card2.svg',
							'/web/icons/Revised_credit_card2.svg',
							'/icons/Revised_credit_card2.svg'
						];
						let svgText = null;
						let chosenUrl = null;
						for (const url of tryUrls) {
							try {
								const res = await fetch(url, { cache: 'no-store' });
								if (res.ok) { svgText = await res.text(); chosenUrl = url; break; }
							} catch(_) { /* try next */ }
						}
						if (!svgText) { console.warn('[payments-icon] failed to load Revised_credit_card2.svg from all candidates'); return; }
						console.log('[payments-icon] inlined from', chosenUrl);
						// Extract the <svg> root from the file (use exact file markup, unmodified)
						const m = svgText.match(/<svg[\s\S]*?<\/svg>/i);
						const svgMarkup = (m ? m[0] : svgText);
						// Replace the wrapper content with inline SVG (exact as in file)
						wrapper.innerHTML = svgMarkup;
						// Apply sizing non-destructively (do not alter file markup): 30x30 inside 34x34 wrapper
						const svgEl = wrapper.querySelector('svg');
						if (svgEl) { svgEl.style.width = '30px'; svgEl.style.height = '30px'; svgEl.style.display = 'block'; }
					})();
				} catch(_){}
				const closeBtn=drawer.querySelector('.account-drawer__close');
				closeBtn?.addEventListener('click', ()=> this.closeAccountDrawer());
				// Global Escape handler (only set once) prioritizing Fitness then Account (Strength now inside Fitness)
				if(!window._mbhGlobalEsc){
					try {
						document.addEventListener('keydown', (e)=>{
							if(e.key==='Escape'){
								// Close My Body first if open
								const mybody=document.getElementById('mybody-drawer');
								if(mybody && mybody.classList.contains('open')){ mybody.classList.remove('open'); return; }
								const fitness=document.getElementById('fitness-drawer');
								if(fitness && fitness.classList.contains('open')){ fitness.classList.remove('open'); return; }
								const food=document.getElementById('food-drawer');
								if(food && food.classList.contains('open')){ food.classList.remove('open'); return; }
									const sleep=document.getElementById('sleep-drawer');
									if(sleep && sleep.classList.contains('open')){ sleep.classList.remove('open'); return; }
								const mind=document.getElementById('mind-drawer');
								if(mind && mind.classList.contains('open')){ mind.classList.remove('open'); return; }
								// (Deprecated standalone Strength drawer removed)
								const acc=document.getElementById('account-drawer');
								if(acc && acc.classList.contains('open')){ acc.classList.remove('open'); return; }
							}
						}, true);
						window._mbhGlobalEsc=true;
					}catch{}
				}
			}

			// Ensure only one drawer is ever open at a time
			this.closeAllDrawers = () => {
				try {
					['account-drawer','mybody-drawer','fitness-drawer','food-drawer','mind-drawer','sleep-drawer'].forEach(id=>{
						const el=document.getElementById(id); if(el) el.classList.remove('open');
					});
					document.body.classList.remove('drawer-fitness-open','drawer-mybody-open','drawer-food-open','drawer-mind-open','drawer-sleep-open');
				} catch{}
			};
			this.openAccountDrawer = () => {
				const drawer=document.getElementById('account-drawer'); if(!drawer) return;
				// Close other drawers if open (mutual exclusivity)
				if(this.closeAllDrawers){ this.closeAllDrawers(); }
				try {
					const nameEl=document.getElementById('accountDrawerName');
					const metaEl=document.getElementById('accountDrawerMeta');
					let email=(document.getElementById('user-email')?.textContent||'').trim();
					if(!email){ try { const tokenEmail = localStorage.getItem('mbh_lastEmail'); if(tokenEmail) email=tokenEmail; } catch(_){}
					}
					let localPart='Member';
					if(email && email.includes('@')) localPart=email.split('@')[0]; else {
						const storedLocal = localStorage.getItem('mbh_userLocalPart'); if(storedLocal) localPart=storedLocal;
					}
					if(nameEl) nameEl.textContent=localPart;
					if(metaEl){
						const stored=localStorage.getItem('mbh_firstLoginTs');
						let ts= stored? parseInt(stored,10): Date.now();
						if(!stored) localStorage.setItem('mbh_firstLoginTs', String(ts));
						const d=new Date(ts); const mo=d.toLocaleString(undefined,{month:'long'}); const yr=d.getFullYear();
									metaEl.textContent=`Member since ${mo} ${yr}`;
					}
				} catch(err){ console.warn('account drawer populate failed', err); }
				drawer.classList.add('open');
				// Track global drawer-open state for legacy CSS hide rules and future logic
				try { document.body.classList.add('drawer-open'); document.body.classList.remove('drawer-fitness-open','drawer-mybody-open','drawer-food-open','drawer-mind-open','drawer-sleep-open'); } catch{}
				setTimeout(()=>{ drawer.querySelector('.account-drawer__link')?.focus(); }, 40);
				// Wire list interactions (once)
				if(!drawer._accountListBound){
					const profileBtn = drawer.querySelector('[data-account-item="profile"]');
					const profilePanel = drawer.querySelector('#profileSubpanel');
					const transBtn = drawer.querySelector('[data-account-item="transactions"]');
					const transPanel = drawer.querySelector('#transactionsSubpanel');
					const paymentsBtn = drawer.querySelector('[data-account-item="payments"]');
					const paymentsPanel = drawer.querySelector('#paymentsSubpanel');
					const helpBtn = drawer.querySelector('[data-account-item="help"]');
					const helpPanel = drawer.querySelector('#helpSubpanel');
					profileBtn?.addEventListener('click', ()=>{ if(profilePanel){ profilePanel.classList.add('open'); profilePanel.querySelector('.subpanel-link')?.focus(); } });
					transBtn?.addEventListener('click', ()=>{ if(transPanel){ transPanel.classList.add('open'); transPanel.querySelector('.subpanel-link')?.focus(); } });
					paymentsBtn?.addEventListener('click', ()=>{ if(paymentsPanel){ paymentsPanel.classList.add('open'); paymentsPanel.querySelector('.subpanel-link')?.focus(); } });
					helpBtn?.addEventListener('click', ()=>{ if(helpPanel){ helpPanel.classList.add('open'); helpPanel.querySelector('.subpanel-link')?.focus(); } });
					const backButtons = drawer.querySelectorAll('[data-subpanel-back]');
					backButtons.forEach(btn=> btn.addEventListener('click', ()=>{
						profilePanel?.classList.remove('open');
						transPanel?.classList.remove('open');
						paymentsPanel?.classList.remove('open');
						helpPanel?.classList.remove('open');
						// Focus a sensible trigger (prefer profile, then transactions, else first link)
						try {
							let el = drawer.querySelector('[data-account-item="profile"]');
							if (!el) el = drawer.querySelector('[data-account-item="transactions"]');
							if (!el) el = drawer.querySelector('.account-drawer__link');
							if (el && typeof el.focus === 'function') el.focus();
						} catch(_) {}
					}));
					drawer._accountListBound=true;
				}
			};
			this.closeAccountDrawer = () => { const d=document.getElementById('account-drawer'); if(d) d.classList.remove('open'); };
			const toggleDropdown = (e)=>{
				e.stopPropagation();
				const willOpen = !dd.classList.contains('open');
				if(willOpen){
					dd.classList.add('open');
					// For fixed positioning, determine if we need to flip based on available space
					const needFlip = (window.innerWidth - 16) < (180 + 16); // simplistic; keep for future dynamic sizing
					if(needFlip){ dd.classList.add('flip-left'); } else { dd.classList.remove('flip-left'); }
				}else{
					dd.classList.remove('open');
				}
			};
			profileBtnEl.addEventListener('click', toggleDropdown);
			// Outside click close
			document.addEventListener('click', (e)=>{ if(!profileBtnEl.contains(e.target)) dd.classList.remove('open'); }, { capture:true });
			dd.addEventListener('click', (e)=>{
				const btn = e.target.closest('button[data-action]'); if(!btn) return;
				const action = btn.dataset.action;
				if(action==='account') { this.openAccountDrawer(); }
				else if(action==='settings') { console.log('[profile] settings placeholder'); }
				else if(action==='support') { console.log('[profile] support placeholder'); }
				else if(action==='logout') { this.logout && this.logout(); }
				dd.classList.remove('open');
			});
		}
		this.buildAccountPageShell();
		console.log('[pwa-header] injected');

		// Enforce Transactions icon presence immediately after header/drawer creation
		try {
			const ensureTxIcon = async ()=>{
				const drawer = document.getElementById('account-drawer'); if(!drawer) return;
				const btn = drawer.querySelector('[data-account-item="transactions"]'); if(!btn) return;
				let wrap = btn.querySelector('.profile-icon-wrapper');
				if(!wrap){ wrap = document.createElement('span'); wrap.className='profile-icon-wrapper'; wrap.setAttribute('aria-hidden','true'); wrap.style.cssText='display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;'; btn.insertBefore(wrap, btn.firstChild); }
				let img = wrap.querySelector('img');
				if(!img){ img = document.createElement('img'); img.alt=''; img.width=24; img.height=24; img.style.cssText='display:block;width:24px;height:24px;object-fit:contain;'; wrap.appendChild(img); }
				const candidates = [
					'icons/resized_bagicon_24x24.png',
					'/icons/resized_bagicon_24x24.png',
					'/web/icons/resized_bagicon_24x24.png'
				];
				for(const url of candidates){
					try {
						const res = await fetch(url, { method:'HEAD', cache:'no-store' });
						if(res.ok){ img.src = url; return; }
					} catch(_) { /* next */ }
				}
				// Final safety: inline a tiny bag SVG if PNG failed to resolve (never blank)
				wrap.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9h12l-1 11H7L6 9z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/></svg>';
			};
			// Help icon guard mirrors Transactions
			const ensureHelpIcon = async ()=>{
				const drawer = document.getElementById('account-drawer'); if(!drawer) return;
				const btn = drawer.querySelector('[data-account-item="help"]'); if(!btn) return;
				let wrap = btn.querySelector('.profile-icon-wrapper');
				if(!wrap){ wrap = document.createElement('span'); wrap.className='profile-icon-wrapper'; wrap.setAttribute('aria-hidden','true'); wrap.style.cssText='display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;'; btn.insertBefore(wrap, btn.firstChild); }
				let img = wrap.querySelector('img');
				if(!img){ img = document.createElement('img'); img.alt=''; img.width=24; img.height=24; img.style.cssText='display:block;width:24px;height:24px;object-fit:contain;'; wrap.appendChild(img); }
				const candidates = [
					'icons/Helpicon.png',
					'/icons/Helpicon.png',
					'/web/icons/Helpicon.png'
				];
				for(const url of candidates){
					try {
						const res = await fetch(url, { method:'HEAD', cache:'no-store' });
						if(res.ok){ img.src = url; return; }
					} catch(_) { /* next */ }
				}
				// Final safety: inline a simple help circle SVG if PNG failed
				wrap.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/><circle cx="12" cy="17" r="1"/></svg>';
			};
			// Run now and on next tick to catch late DOM attachments
			ensureTxIcon(); setTimeout(ensureTxIcon, 80);
			ensureHelpIcon(); setTimeout(ensureHelpIcon, 80);
			// Observe for drawer list mutations (timing resilience)
			const mo = new MutationObserver(()=> { ensureTxIcon(); ensureHelpIcon(); });
			const list = document.getElementById('accountDrawerList'); if(list) mo.observe(list,{childList:true,subtree:true});
		} catch(err){ console.warn('[transactions-icon] ensure failed', err); }
	}

	buildAccountPageShell(){
		if(document.getElementById('account-page')) return;
		const sec=document.createElement('section');
		sec.id='account-page';
		sec.innerHTML=`<div class="account-header"><button class="account-close" type="button" aria-label="Close Account">Back</button><div>Account</div></div><div class="account-body"><p style="font-size:14px;color:#555;">Account page placeholder. Template to follow.</p></div>`;
		const main=document.getElementById('main-content') || document.getElementById('app-container') || document.body;
		main.appendChild(sec);
		sec.querySelector('.account-close').addEventListener('click', ()=> this.closeAccountPage());
	}

	openAccountPage(){
		this.closeFlyouts && this.closeFlyouts();
		const pg=document.getElementById('account-page'); if(!pg) return;
		// Overlay style: do not hide main fitness content
		pg.classList.add('show','overlay');
		window.scrollTo({top:0, behavior:'smooth'});
	}
	closeAccountPage(){
		const pg=document.getElementById('account-page'); if(!pg) return;
		pg.classList.remove('show','overlay');
	}

	// Passive bottom nav initializer: purely visual active state swapping
	initPwaNav(){
		if(this._pwaNavInit) return;
		const nav = document.getElementById('pwa-nav');
		if(!nav) return;
		// Unified detection now leverages isPwaContext() plus optional forceNav flag
		let isPwaContext = false;
		try { isPwaContext = !!(this.isPwaContext && this.isPwaContext()); } catch {}
		let forceNav=false; try { if(/[?&]forceNav=1/.test(location.search)) { localStorage.setItem('forceNav','1'); forceNav=true; } else if(localStorage.getItem('forceNav')==='1') forceNav=true; } catch {}
		if(forceNav) isPwaContext = true;
		if(!isPwaContext){
			console.log('[pwa-nav] Not shown (not in installed PWA context). Add to home screen or use ?forceNav=1 to test.');
			// Schedule up to two delayed re-checks; iOS sometimes reports display-mode later
			if(!this._pwaNavRechecksScheduled){
				this._pwaNavRechecksScheduled = true;
				[600, 1600].forEach(delay=> setTimeout(()=>{ if(!this._pwaNavInit){ this.initPwaNav(); } }, delay));
				// Also re-attempt on visibility change/orientation change once
				const reAttempt = ()=>{ if(!this._pwaNavInit){ this.initPwaNav(); } else { window.removeEventListener('visibilitychange', reAttempt); window.removeEventListener('orientationchange', reAttempt); }
				};
				window.addEventListener('visibilitychange', reAttempt, { once:true });
				window.addEventListener('orientationchange', reAttempt, { once:true });
				// Expose manual helper for console
				if(!window.mbhShowNav){ window.mbhShowNav = ()=>{ localStorage.setItem('forceNav','1'); console.log('[pwa-nav] manual show requested'); this.initPwaNav(); }; }
			}
			return; // Remain hidden for now; re-checks may show it later
		}
		nav.style.display='flex';
		document.body.classList.add('pwa-nav-space');
		const defaultBtn = nav.querySelector('[data-tab="home"]') || nav.querySelector('.pwa-nav__btn');
		if(defaultBtn) defaultBtn.classList.add('is-active');
		// Rewards icon handling: only run outline logic if flag enabled
		if (USE_REWARDS_OUTLINE) {
			try {
				const rewardsBtn = nav.querySelector('.pwa-nav__btn[data-tab="rewards"]');
				const rewardsIconWrap = rewardsBtn?.querySelector('.pwa-nav__icon');
				if (rewardsIconWrap && !rewardsIconWrap._rewardsInlined) {
					const ns = 'http://www.w3.org/2000/svg';
					const safeSvg = document.createElementNS(ns,'svg');
					safeSvg.setAttribute('viewBox','0 0 24 24');
					safeSvg.setAttribute('preserveAspectRatio','xMidYMid meet');
					safeSvg.style.display='block';
					const safeRect = document.createElementNS(ns,'rect');
					safeRect.setAttribute('x','2'); safeRect.setAttribute('y','2'); safeRect.setAttribute('width','20'); safeRect.setAttribute('height','20');
					safeRect.setAttribute('rx','2.5'); safeRect.setAttribute('ry','2.5');
					safeRect.setAttribute('fill','none'); safeRect.setAttribute('stroke','currentColor'); safeRect.setAttribute('stroke-width','2.2'); safeRect.setAttribute('stroke-linejoin','round');
					safeSvg.appendChild(safeRect);
					rewardsIconWrap.innerHTML = '';
					rewardsIconWrap.appendChild(safeSvg);
					rewardsIconWrap._rewardsInlined = true;
					// (Async refinement omitted; re-enable by restoring original logic if needed.)
				}
			} catch(_) {}
		} else {
			// Keep original <img src="./icons/Box.svg"> so full artwork shows.
			try {
				const img = nav.querySelector('.pwa-nav__btn[data-tab="rewards"] .pwa-nav__icon img');
				if (img) img.dataset.fullIcon='true';
			} catch(_){ }
		}
		nav.addEventListener('click', e=>{
			const btn = e.target.closest('.pwa-nav__btn');
			if(!btn) return;
			const tab = btn.getAttribute('data-tab');
			if(tab==='scan'){
				this.openScanModal && this.openScanModal();
			}
			// Open SiriusXM player for Media button
			if(tab==='listen'){
				try{
					const url = 'https://www.siriusxm.com/player';
					const win = window.open(url, '_blank', 'noopener,noreferrer');
					if(!win){ window.location.href = url; }
				}catch(err){ window.location.href = 'https://www.siriusxm.com/player'; }
				return; // don't toggle local active state when navigating away
			}
			if(tab==='mybody' || tab==='myabs'){
				this.openMyBodyDrawer && this.openMyBodyDrawer();
			}
			nav.querySelectorAll('.pwa-nav__btn.is-active').forEach(b=> b.classList.remove('is-active'));
			btn.classList.add('is-active');
		});
		this._pwaNavInit = true;
		// Ensure insets reflect the now-visible bottom nav height immediately
		try { this.computeChromeInsets && this.computeChromeInsets(true); } catch {}
	}

	// === Scan QR (Option 1: encode plain email) ===
	_generateQrDataUrl(text, size=260){
		// Full-spec (simplified) QR generator: Byte mode, ECC Level L, versions 1-10, proper Reed-Solomon, masking & format info.
		try {
			function toBytes(str){ const out=[]; for(let i=0;i<str.length;i++){ const c=str.charCodeAt(i); if(c<0x80) out.push(c); else if(c<0x800) out.push(0xC0|(c>>6),0x80|(c&63)); else out.push(0xE0|(c>>12),0x80|((c>>6)&63),0x80|(c&63)); } return out; }
			const dataBytes = toBytes(text);
			// Version capacities (data codewords) for Byte mode, L (versions 1..10)
			const VERSION_INFO = [
				/*v1*/ {total:26, ec:7, blocks:1},
				{total:44, ec:10, blocks:1},
				{total:70, ec:15, blocks:1},
				{total:100, ec:20, blocks:1},
				{total:134, ec:26, blocks:1},
				{total:172, ec:36, blocks:1},
				{total:196, ec:40, blocks:1},
				{total:242, ec:48, blocks:1},
				{total:292, ec:60, blocks:1},
				{total:346, ec:72, blocks:1}
			];
			function capacityBytes(v){ const info=VERSION_INFO[v-1]; return info.total - info.ec*info.blocks; }
			let version=1; while(version<=10 && (dataBytes.length + 2) > capacityBytes(version)) version++; if(version>10) throw new Error('QR: data too long');
			const info = VERSION_INFO[version-1];
			const dataCapacity = capacityBytes(version);
			// Build bit stream
			const bits=[]; const pushBits=(val,len)=>{ for(let i=len-1;i>=0;i--) bits.push((val>>i)&1); };
			pushBits(0b0100,4); // mode
			pushBits(dataBytes.length, version<10?8:16);
			dataBytes.forEach(b=> pushBits(b,8));
			// Terminator & padding
			let maxDataBits = dataCapacity*8;
			for(let i=0;i<4 && bits.length<maxDataBits;i++) bits.push(0);
			while(bits.length%8) bits.push(0);
			const padSeq=[0xEC,0x11]; let p=0; while(bits.length<maxDataBits){ pushBits(padSeq[p++%2],8); }
			// Convert to codewords
			const dataCw=[]; for(let i=0;i<bits.length;i+=8){ let v=0; for(let j=0;j<8;j++) v=(v<<1)|bits[i+j]; dataCw.push(v); }
			// Reed-Solomon ECC (single block for versions used)
			const ecCount = info.ec; const gfLog=new Array(256); const gfExp=new Array(512); let x=1; for(let i=0;i<255;i++){ gfExp[i]=x; gfLog[x]=i; x<<=1; if(x&0x100) x^=0x11d; } for(let i=255;i<512;i++) gfExp[i]=gfExp[i-255];
			function rsGenPoly(deg){ let poly=[1]; for(let i=0;i<deg;i++){ const a=gfExp[i]; poly = poly.map((c,idx)=>{ const prev= poly[idx]; return prev; }); // copy
				const newPoly=new Array(poly.length+1).fill(0);
				for(let j=0;j<poly.length;j++){
					newPoly[j] ^= poly[j]; // *1 term
					newPoly[j+1] ^= gfExp[(gfLog[poly[j]] + a)%255];
				}
				poly=newPoly;
			}
			return poly;
			}
			function rsCompute(data, ecLen){ const gen=rsGenPoly(ecLen); const res=new Array(ecLen).fill(0); for(const d of data){ const factor = d ^ res[0]; res.shift(); res.push(0); if(factor){ for(let i=0;i<gen.length;i++){ res[i] ^= gfExp[(gfLog[gen[i]] + gfLog[factor])%255]; } } } return res; }
			const ec = rsCompute(dataCw, ecCount);
			const allCw = dataCw.concat(ec);
			// Matrix assembly
			const sizeMod = 17 + 4*version; const m = Array.from({length:sizeMod},()=>Array(sizeMod).fill(null));
			function placeFinder(x,y){ for(let dy=0;dy<7;dy++) for(let dx=0;dx<7;dx++){ const xx=x+dx, yy=y+dy; const edge= dx===0||dx===6||dy===0||dy===6; const center= dx>=2&&dx<=4&&dy>=2&&dy<=4; m[yy][xx]= edge||center?1:0; } }
			placeFinder(0,0); placeFinder(sizeMod-7,0); placeFinder(0,sizeMod-7);
			// Separators
			for(let i=0;i<8;i++){ if(m[i][7]==null) m[i][7]=0; if(m[7][i]==null) m[7][i]=0; if(m[i][sizeMod-8]==null) m[i][sizeMod-8]=0; if(m[7][sizeMod-1-i]==null) m[7][sizeMod-1-i]=0; if(m[sizeMod-8][i]==null) m[sizeMod-8][i]=0; if(m[sizeMod-1-i][7]==null) m[sizeMod-1-i][7]=0; }
			// Timing
			for(let i=8;i<sizeMod-8;i++){ if(m[6][i]==null) m[6][i]= i%2?0:1; if(m[i][6]==null) m[i][6]= i%2?0:1; }
			// Dark module (version-dependent). Place at (8, size-8)
			m[sizeMod-8][8]=1;
			// Data placement
			let bitIndex=0; const totalBits = allCw.length*8; const getBit=(idx)=> (allCw[idx>>3] >> (7-(idx&7))) &1;
			for(let col=sizeMod-1; col>0; col-=2){ if(col===6) col--; for(let rIter=0;rIter<sizeMod;rIter++){ const row = ((col/2)&1)? rIter : (sizeMod-1-rIter); for(let cOff=0;cOff<2;cOff++){ const c=col-cOff; if(m[row][c]!=null) continue; m[row][c] = bitIndex<totalBits ? getBit(bitIndex++) : 0; } } }
			// Mask selection
			function applyMask(matrix, mask){ const sz=matrix.length; const masked = matrix.map(row=> row.slice()); for(let r=0;r<sz;r++){ for(let c=0;c<sz;c++){ if(masked[r][c]==null) masked[r][c]=0; // safety
				// Skip functional patterns (we mark them by setting a property later) but for brevity assume non-null entries are data except finder/timing already final
				const isFunc = false; if(isFunc) continue; let cond=false; switch(mask){
					case 0: cond=((r+c)%2)===0; break; case 1: cond=(r%2)===0; break; case 2: cond=(c%3)===0; break; case 3: cond=((r+c)%3)===0; break; case 4: cond=((Math.floor(r/2)+Math.floor(c/3))%2)===0; break; case 5: cond=(((r*c)%2)+((r*c)%3))===0; break; case 6: cond=((((r*c)%2)+((r*c)%3))%2)===0; break; case 7: cond=((((r+c)%2)+((r*c)%3))%2)===0; break; }
				if(cond) masked[r][c] ^=1; }
			} return masked; }
			function score(matrix){ const sz=matrix.length; let penalty=0; // Rule 1
			for(let r=0;r<sz;r++){ let runColor=matrix[r][0], runLen=1; for(let c=1;c<sz;c++){ if(matrix[r][c]===runColor) runLen++; else { if(runLen>=5) penalty += 3 + (runLen-5); runColor=matrix[r][c]; runLen=1; } } if(runLen>=5) penalty+=3+(runLen-5); }
			for(let c=0;c<sz;c++){ let runColor=matrix[0][c], runLen=1; for(let r=1;r<sz;r++){ if(matrix[r][c]===runColor) runLen++; else { if(runLen>=5) penalty +=3+(runLen-5); runColor=matrix[r][c]; runLen=1; } } if(runLen>=5) penalty+=3+(runLen-5); }
			// Rule2 2x2
			for(let r=0;r<sz-1;r++) for(let c=0;c<sz-1;c++){ const v=matrix[r][c]; if(v===matrix[r][c+1]&&v===matrix[r+1][c]&&v===matrix[r+1][c+1]) penalty+=3; }
			// Rule3 patterns 1:1:3:1:1 (horizontal & vertical)
			const pattern=[1,0,1,1,1,0,1].join('');
			for(let r=0;r<sz;r++){ let s=''; for(let c=0;c<sz;c++) s+=matrix[r][c]; for(let i=0;i<=sz-7;i++){ if(s.slice(i,i+7)===pattern && (/0000$/.test(s.slice(i+7,i+11)) || /^0000/.test(s.slice(i-4,i)))) penalty+=40; } }
			for(let c=0;c<sz;c++){ let s=''; for(let r=0;r<sz;r++) s+=matrix[r][c]; for(let i=0;i<=sz-7;i++){ if(s.slice(i,i+7)===pattern && (/0000$/.test(s.slice(i+7,i+11)) || /^0000/.test(s.slice(i-4,i)))) penalty+=40; } }
			// Rule4 dark ratio
			let dark=0; for(let r=0;r<sz;r++) for(let c=0;c<sz;c++) if(matrix[r][c]) dark++; const total=sz*sz; const k = Math.abs(dark*100/total - 50)/5; penalty += k*10;
			return penalty;
			}
			let bestMask=0, bestScore=1e9, bestMatrix=null; for(let mask=0; mask<8; mask++){ const masked=applyMask(m, mask); const s=score(masked); if(s<bestScore){ bestScore=s; bestMask=mask; bestMatrix=masked; } }
			// Format info (ECC L=01). Generate 15-bit codeword and place (simplified implementation)
			function formatBits(mask){ const ecLevel=0b01; let data=(ecLevel<<3)|mask; // 5 bits
			// BCH(15,5) poly 0x537
			let v=data<<10; const poly=0x537; for(let i=14;i>=10;i--){ if(v & (1<<i)) v ^= poly << (i-10); }
			let code = ((data<<10)|v) ^ 0x5412; return code; }
			const fmt = formatBits(bestMask);
			const sizeMod2=bestMatrix.length;
			for(let i=0;i<15;i++){ const bit=(fmt>>i)&1; // placement pattern per spec
				// vertical (row 8, columns)
				if(i<6) bestMatrix[8][i]=bit; else if(i<8) bestMatrix[8][i+1]=bit; else bestMatrix[8][sizeMod2-15+i]=bit;
				// horizontal (column 8, rows)
				if(i<8) bestMatrix[sizeMod2-1-i][8]=bit; else if(i<9) bestMatrix[15 - i][8]=bit; else bestMatrix[14 - i][8]=bit; }
			// Ensure finder format overlaps corrected (fix center module of timing cross) – leave as is for brevity
			// Draw
			const canvas=document.createElement('canvas'); canvas.width=canvas.height=size; const ctx=canvas.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,size,size);
			const scale=Math.floor(size/sizeMod2); ctx.fillStyle='#111'; for(let r=0;r<sizeMod2;r++){ for(let c=0;c<sizeMod2;c++){ if(bestMatrix[r][c]) ctx.fillRect(c*scale,r*scale,scale,scale); }}
			return canvas.toDataURL('image/png');
		} catch(err){ console.warn('QR gen (full) failed', err); return ''; }
	}
	openScanModal(){
		try {
			const modal = document.getElementById('scan-modal'); if(!modal) return;
			const img = document.getElementById('scan-qr');
			const idEl = document.getElementById('scan-identifier');
			if(!this._scanQrGenerated){
				const email = (this.userEmail || document.getElementById('user-email')?.textContent || '').trim();
				this.userEmail = email;
				const payload = email; // Option 1: plain email
				img.src = this._generateQrDataUrl(payload);
				idEl.textContent = email;
				this._scanQrGenerated = true;
			}
			modal.hidden = false;
			// Focus close button
			modal.querySelector('[data-scan-close]')?.focus();
			// Close handlers
			if(!this._scanModalBound){
				this._scanModalBound = true;
				modal.addEventListener('click', e=>{ if(e.target===modal) this.closeScanModal(); });
				document.addEventListener('keydown', e=>{ if(!modal.hidden && e.key==='Escape') this.closeScanModal(); });
				modal.querySelector('[data-scan-close]')?.addEventListener('click', ()=> this.closeScanModal());
			}
		} catch(err){ console.warn('openScanModal failed', err); }
	}
	closeScanModal(){ const modal = document.getElementById('scan-modal'); if(modal) modal.hidden = true; }

	// Top horizontal scroll banner nav (simple static tabs)
	initTopBannerNav(){
		if(this._topBannerInit) return;
		try {
			const container = document.getElementById('app-container');
			if(!container) return;
			// Avoid if already added
			if(document.getElementById('top-banner-nav')) { this._topBannerInit = true; return; }
			const nav = document.createElement('nav');
			nav.id = 'top-banner-nav';
			nav.className = 'top-banner-nav';
			nav.innerHTML = '<div class="top-banner-nav__scroller" role="tablist" aria-label="Primary sections"></div>';
			document.body.insertBefore(nav, container); // before main panel
			const scroller = nav.querySelector('.top-banner-nav__scroller');
			let items = [ 'Fitness', 'Food', 'Mind', 'Sleep', 'Social', 'Beauty', 'Pet', 'Scholars', 'Competition', 'Membership', 'Account', 'About' ];
			// Remove Account tab only in PWA context (profile icon handles Account page)
			try { if(this.isPwaContext && this.isPwaContext()) items = items.filter(i=> i !== 'Account'); } catch {}
			items.forEach(label=>{
				const btn = document.createElement('button');
				btn.type='button';
				btn.className='top-banner-nav__item';
				btn.setAttribute('role','tab');
				btn.setAttribute('aria-selected','false');
				btn.textContent = label;
				btn.addEventListener('click', (e)=>{
					setActive(label);
					// In PWA: Fitness should open the drawer (no flyout). In non-PWA, let flyout infra handle it.
					if(label==='Fitness' && this.isPwaContext && this.isPwaContext()){
						this.openFitnessDrawer && this.openFitnessDrawer();
						['account-page','stations-container','history-section','summary-section'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
						// Prevent default navigation behaviors; flyout handler will be suppressed separately.
						e?.preventDefault?.();
					}
					// In PWA: Food should open the drawer (no flyout)
					if(label==='Food' && this.isPwaContext && this.isPwaContext()){
						this.openFoodDrawer && this.openFoodDrawer();
						['account-page','stations-container','history-section','summary-section'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
						e?.preventDefault?.();
					}
					// In PWA: Mind should open the drawer (no flyout)
					if(label==='Mind' && this.isPwaContext && this.isPwaContext()){
						this.openMindDrawer && this.openMindDrawer();
						['account-page','stations-container','history-section','summary-section'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
						e?.preventDefault?.();
					}
						// In PWA: Sleep should open the drawer (no flyout)
						if(label==='Sleep' && this.isPwaContext && this.isPwaContext()){
							this.openSleepDrawer && this.openSleepDrawer();
							['account-page','stations-container','history-section','summary-section'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
							e?.preventDefault?.();
						}
				});
				scroller.appendChild(btn);
			});
			// Non-PWA: attempt true centering if tabs don't overflow. Recalculate on load & resize.
			if(!document.body.classList.contains('is-pwa')){
				const tryCenter = ()=>{
					try {
						const styles = getComputedStyle(scroller);
						const padL = parseFloat(styles.paddingLeft)||0; const padR = parseFloat(styles.paddingRight)||0;
						const containerWidth = scroller.clientWidth - padL - padR;
						const totalWidth = Array.from(scroller.children).reduce((sum, el)=> sum + el.getBoundingClientRect().width, 0);
						if(totalWidth <= containerWidth){
							scroller.classList.add('centered');
							// Remove horizontal scroll affordance entirely
							scroller.scrollLeft = 0;
						}else{
							scroller.classList.remove('centered');
						}
					} catch(e){ /* silent */ }
				};
				requestAnimationFrame(()=>{ tryCenter(); setTimeout(tryCenter, 150); });
				window.addEventListener('resize', tryCenter);
				if(document.fonts && document.fonts.ready){ document.fonts.ready.then(()=> tryCenter()); }
			}
			const setActive = (name)=>{
				scroller.querySelectorAll('.top-banner-nav__item').forEach(btn=>{
					const active = btn.textContent===name;
					btn.classList.toggle('is-active', active);
					btn.setAttribute('aria-selected', active? 'true':'false');
					btn.setAttribute('tabindex', active? '0':'-1');
				});
			};
			setActive('Fitness'); // default
			// (Optional) gradient edge support: add class 'edge-fade' on nav then auto-manage fades
			const updateEdgeFades = ()=>{
				if(!nav.classList.contains('edge-fade')) return;
				const atStart = scroller.scrollLeft <= 2;
				const atEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 2;
				nav.classList.toggle('fade-left', !atStart);
				nav.classList.toggle('fade-right', !atEnd);
			};
			scroller.addEventListener('scroll', updateEdgeFades, { passive:true });
			requestAnimationFrame(updateEdgeFades);
			this._topBannerInit = true;
			console.log('[top-banner] initialized');
			// Recompute chrome insets now that banner exists & has measured height
			this.computeChromeInsets && this.computeChromeInsets(true);
			setTimeout(()=> this.computeChromeInsets && this.computeChromeInsets(), 60);
			console.log('[top-banner] initialized');
		} catch(err){ console.warn('[top-banner] init failed', err); }
	}

	// Strength Drawer (similar style to Account drawer but focused on Strength modalities)
	// Fitness Drawer: top-level Fitness categories with subpanels (Strength, Cardio, Flex & Mobility, Balance & Stability)
	ensureFitnessDrawer(){
		if(document.getElementById('fitness-drawer')) return;
		try {
			const drawer = document.createElement('div');
			drawer.id='fitness-drawer';
			drawer.innerHTML = `
				<div class="fitness-drawer__inner">
					<button type="button" class="fitness-drawer__close" aria-label="Close fitness panel">✕</button>
					<header class="fitness-drawer__header"><h1 class="fitness-title">Fitness</h1></header>
					<nav class="fitness-drawer__nav" aria-label="Fitness categories">
						<ul class="fitness-drawer__list" id="fitnessDrawerList">
							<li class="fitness-drawer__item"><!-- Strength first -->
								<button type="button" class="fitness-drawer__link" data-fitness-item="strength">
									<span>Strength</span>
									<svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
								</button>
							</li>
							<li class="fitness-drawer__item">
								<button type="button" class="fitness-drawer__link" data-fitness-item="cardio">
									<span>Cardio</span>
									<svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
								</button>
							</li>
							<li class="fitness-drawer__item">
								<button type="button" class="fitness-drawer__link" data-fitness-item="flex-mobility">
									<span>Flex &amp; Mobility</span>
									<svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
								</button>
							</li>
							<li class="fitness-drawer__item">
								<button type="button" class="fitness-drawer__link" data-fitness-item="balance-stability">
									<span>Balance &amp; Stability</span>
									<svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
								</button>
							</li>
						</ul>
					</nav>
					<!-- Strength Subpanel -->
					<div class="fitness-subpanel" id="fitnessStrengthPanel" aria-label="Strength" role="region">
						<header class="subpanel-header">
							<button type="button" class="subpanel-back" aria-label="Back to Fitness menu" data-fitness-subpanel-back>
								<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
							</button>
							<h2>Strength</h2>
						</header>
						<nav aria-label="Strength modalities">
							<ul class="subpanel-list">
								<li class="subpanel-item"><button type="button" class="subpanel-link" data-strength-item="pilates">Pilates <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="subpanel-item"><button type="button" class="subpanel-link" data-strength-item="barre">Barre <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="subpanel-item"><button type="button" class="subpanel-link" data-strength-item="yoga">Yoga <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="subpanel-item"><button type="button" class="subpanel-link" data-strength-item="functional-strength">Functional Strength <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="subpanel-item"><button type="button" class="subpanel-link" data-strength-item="circuit">Circuit <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="subpanel-item"><button type="button" class="subpanel-link" data-strength-item="traditional-weights">Traditional Weights <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="subpanel-item"><button type="button" class="subpanel-link" data-strength-item="high-intensity">High Intensity <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="subpanel-item"><button type="button" class="subpanel-link" data-strength-item="ageless-booty-camp">Ageless Booty 'Camp' <svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
							</ul>
						</nav>
					</div>
					<!-- Cardio Subpanel -->
					<div class="fitness-subpanel" id="fitnessCardioPanel" aria-label="Cardio" role="region">
						<header class="subpanel-header">
							<button type="button" class="subpanel-back" aria-label="Back to Fitness menu" data-fitness-subpanel-back>
								<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
							</button>
							<h2>Cardio</h2>
						</header>
						<div class="fitness-panel-placeholder" style="padding:14px 20px;font-size:15px;">Cardio programming coming soon.</div>
					</div>
					<!-- Flex & Mobility Subpanel -->
					<div class="fitness-subpanel" id="fitnessFlexMobilityPanel" aria-label="Flex & Mobility" role="region">
						<header class="subpanel-header">
							<button type="button" class="subpanel-back" aria-label="Back to Fitness menu" data-fitness-subpanel-back>
								<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
							</button>
							<h2>Flex &amp; Mobility</h2>
						</header>
						<div class="fitness-panel-placeholder" style="padding:14px 20px;font-size:15px;">Flexibility & mobility content coming soon.</div>
					</div>
					<!-- Balance & Stability Subpanel -->
					<div class="fitness-subpanel" id="fitnessBalancePanel" aria-label="Balance & Stability" role="region">
						<header class="subpanel-header">
							<button type="button" class="subpanel-back" aria-label="Back to Fitness menu" data-fitness-subpanel-back>
								<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
							</button>
							<h2>Balance &amp; Stability</h2>
						</header>
						<div class="fitness-panel-placeholder" style="padding:14px 20px;font-size:15px;">Balance & stability content coming soon.</div>
					</div>
				</div>`;
			document.body.appendChild(drawer);
			const closeBtn = drawer.querySelector('.fitness-drawer__close');
			closeBtn?.addEventListener('click', ()=> this.closeFitnessDrawer());
			// Wire top-level list
			const map = {
				strength: '#fitnessStrengthPanel',
				cardio: '#fitnessCardioPanel',
				'flex-mobility': '#fitnessFlexMobilityPanel',
				'balance-stability': '#fitnessBalancePanel'
			};
			const listEl = drawer.querySelector('#fitnessDrawerList');
			listEl.querySelectorAll('[data-fitness-item]').forEach(btn=>{
				btn.addEventListener('click', ()=>{
					// Close any open subpanel first
					Object.values(map).forEach(sel=> drawer.querySelector(sel)?.classList.remove('open'));
					const key = btn.getAttribute('data-fitness-item');
					const panelSel = map[key];
					if(panelSel){
						const p = drawer.querySelector(panelSel);
						p?.classList.add('open');
						setTimeout(()=> p?.querySelector('.subpanel-back')?.focus(), 30);
					}
				});
			});
			// Back buttons for subpanels
			const backButtons = drawer.querySelectorAll('[data-fitness-subpanel-back]');
			backButtons.forEach(b=> b.addEventListener('click', ()=>{
				Object.values(map).forEach(sel=> drawer.querySelector(sel)?.classList.remove('open'));
				// Return focus to first list item
				drawer.querySelector('.fitness-drawer__link')?.focus();
			}));
		} catch(err){ console.warn('ensureFitnessDrawer failed', err); }
	}

	// My Body Drawer (replicates legacy fitness-submenu items: Weight, History, Summary, Aerobic.. etc.)
	ensureMyBodyDrawer(){
		if(document.getElementById('mybody-drawer')) return;
		try {
			const drawer = document.createElement('div');
			drawer.id='mybody-drawer';
			drawer.innerHTML=`<div class="mybody-drawer__inner">
				<button type="button" class="mybody-drawer__close" aria-label="Close My Body panel">✕</button>
				<header class="mybody-drawer__header"><h1 class="mybody-title">My Body</h1></header>
				<div class="mybody-drawer__content" aria-label="My Body entries" role="region">
					<div class="mybody-section mybody-weight-block">
						<label for="mybody-weight" class="mybody-weight-label">Weight</label>
						<input id="mybody-weight" type="number" inputmode="decimal" placeholder="Enter weight" class="mybody-weight-input" />
					</div>
					<nav class="mybody-nav" aria-label="My Body menu">
						<ul class="mybody-list" id="mybodyList">
							<li class="mybody-item"><button type="button" class="mybody-link" data-mybody-action="history">History<svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
							<li class="mybody-item"><button type="button" class="mybody-link" data-mybody-action="summary">Summary<svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
							<li class="mybody-item disabled"><button type="button" class="mybody-link" data-disabled="true">Aerobic (Coming Soon)</button></li>
							<li class="mybody-item disabled"><button type="button" class="mybody-link" data-disabled="true">Strength (Coming Soon)</button></li>
							<li class="mybody-item disabled"><button type="button" class="mybody-link" data-disabled="true">Balance & Flex (Coming Soon)</button></li>
							<li class="mybody-item disabled"><button type="button" class="mybody-link" data-disabled="true">Stretch (Coming Soon)</button></li>
							<li class="mybody-item disabled"><button type="button" class="mybody-link" data-disabled="true">Custom (Coming Soon)</button></li>
							<li class="mybody-item disabled"><button type="button" class="mybody-link" data-disabled="true">Assessments (Coming Soon)</button></li>
							<li class="mybody-item disabled"><button type="button" class="mybody-link" data-disabled="true">Goals (Coming Soon)</button></li>
							<li class="mybody-item disabled"><button type="button" class="mybody-link" data-disabled="true">Progress (Coming Soon)</button></li>
							<li class="mybody-item disabled"><button type="button" class="mybody-link" data-disabled="true">Rewards (Coming Soon)</button></li>
						</ul>
					</nav>
				</div>
			</div>`;
			document.body.appendChild(drawer);
			// Close btn
			const closeBtn = drawer.querySelector('.mybody-drawer__close');
			closeBtn?.addEventListener('click', ()=> this.closeMyBodyDrawer());
			// Bind list actions
			const list = drawer.querySelector('#mybodyList');
			if(list && !list._bound){
				list.addEventListener('click', e=>{
					const btn = e.target.closest('button.mybody-link');
					if(!btn || btn.dataset.disabled==='true') return;
					const action = btn.getAttribute('data-mybody-action');
					// Close drawer first so modal appears immediately above content
					if(action==='history'){
						this.closeMyBodyDrawer();
						const hm=document.getElementById('history-modal'); if(hm) hm.style.display='flex';
						this.showHistory && this.showHistory();
					}
					else if(action==='summary'){
						this.closeMyBodyDrawer();
						const sm=document.getElementById('summary-modal'); if(sm) sm.style.display='flex';
						this.showSummary && this.showSummary();
					}
				});
				list._bound=true;
			}
			// Sync weight input with existing weight field if present
			try {
				const existing = document.getElementById('weight');
				const myInput = document.getElementById('mybody-weight');
				if(existing && myInput){
					myInput.value = existing.value;
					const sync = ()=>{
						if(existing.value!==myInput.value) { existing.value = myInput.value; existing.dispatchEvent(new Event('input',{bubbles:true})); }
						try { localStorage.setItem('mbh_lastWeight', myInput.value||''); } catch{}
					};
					myInput.addEventListener('input', sync);
					// Load persisted weight if empty
					if(!myInput.value){ try { const lw=localStorage.getItem('mbh_lastWeight'); if(lw){ myInput.value=lw; existing.value=lw; existing.dispatchEvent(new Event('input',{bubbles:true})); } } catch{} }
				}
			} catch{}
		} catch(err){ console.warn('ensureMyBodyDrawer failed', err); }
	}
	openMyBodyDrawer(){
		this.ensureMyBodyDrawer();
		this.computeChromeInsets && this.computeChromeInsets(true);
			// Mutual exclusivity: close others
			this.closeAllDrawers && this.closeAllDrawers();
		const d=document.getElementById('mybody-drawer'); if(!d) return;
		d.classList.add('open');
		// Mark body state for global CSS suppression of legacy panels
		try { document.body.classList.add('drawer-open','drawer-mybody-open'); document.body.classList.remove('drawer-fitness-open','drawer-food-open','drawer-mind-open','drawer-sleep-open'); } catch{}
		if(this.isPwaContext && this.isPwaContext()){
			['account-page','stations-container','history-section','summary-section','dropdown-menu'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
		}
		setTimeout(()=>{ d.querySelector('.mybody-weight-input')?.focus(); }, 50);
		// Schedule a delayed inset verification after potential font/layout shifts
		setTimeout(()=> this.computeChromeInsets && this.computeChromeInsets(), 260);
		setTimeout(()=> this.computeChromeInsets && this.computeChromeInsets(), 900);
	}
	closeMyBodyDrawer(){ const d=document.getElementById('mybody-drawer'); if(d) d.classList.remove('open'); }
	openFitnessDrawer(){
		this.ensureFitnessDrawer();
		this.computeChromeInsets && this.computeChromeInsets(true);
			this.closeAllDrawers && this.closeAllDrawers();
		const d=document.getElementById('fitness-drawer');
		if(d){
			d.classList.add('open');
			// Mark body state
			try { document.body.classList.add('drawer-open','drawer-fitness-open'); document.body.classList.remove('drawer-mybody-open','drawer-food-open','drawer-mind-open','drawer-sleep-open'); } catch{}
			// Hide legacy non-PWA panels that may visually clash (weight/summary etc.) in PWA context
			if(this.isPwaContext && this.isPwaContext()){
				['account-page','stations-container','history-section','summary-section','dropdown-menu'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
				// Ensure global CSS helper present once
				if(!document.getElementById('drawer-legacy-hide-style')){
					const st=document.createElement('style'); st.id='drawer-legacy-hide-style';
					st.textContent=`body.is-pwa.drawer-open #dropdown-menu,body.is-pwa.drawer-open #stations-container,body.is-pwa.drawer-open #menu-icon{display:none !important;}`;
					document.head.appendChild(st);
				}
			}
			setTimeout(()=> d.querySelector('.fitness-drawer__link')?.focus(), 30);
			// Delayed inset verification passes
			setTimeout(()=> this.computeChromeInsets && this.computeChromeInsets(), 240);
			setTimeout(()=> this.computeChromeInsets && this.computeChromeInsets(), 880);
		}
	}
	closeFitnessDrawer(){ const d=document.getElementById('fitness-drawer'); if(d) d.classList.remove('open'); }

		// Food Drawer: simple list of Food categories
		ensureFoodDrawer(){
			if(document.getElementById('food-drawer')) return;
			try {
				const drawer = document.createElement('div');
				drawer.id='food-drawer';
				drawer.innerHTML = `
					<div class="fitness-drawer__inner">
						<button type="button" class="fitness-drawer__close" aria-label="Close food panel">✕</button>
						<header class="fitness-drawer__header"><h1 class="fitness-title">From the Farm</h1></header>
						<nav class="fitness-drawer__nav" aria-label="Food categories">
							<ul class="fitness-drawer__list" id="foodDrawerList">
								<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-food-item="prepared-meals"><span>Prepared Meals</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-food-item="fruits-veggies"><span>Fruits & Veggies</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-food-item="dairy-eggs"><span>Dairy & Eggs</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-food-item="meat-poultry-seafood"><span>Meat, Poultry Seafood</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-food-item="from-the-freezer"><span>From the Freezer</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-food-item="subscription"><span>Subscription</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-food-item="recipies"><span>Recipies</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-food-item="nutrition"><span>Nutrition</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-food-item="our-farmers"><span>Our Farmers</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
							</ul>
						</nav>
					</div>`;
				document.body.appendChild(drawer);
				const closeBtn = drawer.querySelector('.fitness-drawer__close');
				closeBtn?.addEventListener('click', ()=> this.closeFoodDrawer());
				const listEl = drawer.querySelector('#foodDrawerList');
				if(listEl && !listEl._bound){
					listEl.addEventListener('click', (e)=>{
						const btn = e.target.closest('button.fitness-drawer__link');
						if(!btn) return;
						const key = btn.getAttribute('data-food-item');
						console.log('[food] select', key);
						// TODO: hook into routing when available
					});
					listEl._bound = true;
				}
			} catch(err){ console.warn('ensureFoodDrawer failed', err); }
		}
		openFoodDrawer(){
			this.ensureFoodDrawer();
			this.computeChromeInsets && this.computeChromeInsets(true);
			this.closeAllDrawers && this.closeAllDrawers();
			const d=document.getElementById('food-drawer');
			if(!d) return;
			d.classList.add('open');
			try { document.body.classList.add('drawer-open','drawer-food-open'); document.body.classList.remove('drawer-fitness-open','drawer-mybody-open','drawer-mind-open','drawer-sleep-open'); } catch{}
			if(this.isPwaContext && this.isPwaContext()){
				['account-page','stations-container','history-section','summary-section','dropdown-menu'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
			}
			setTimeout(()=> d.querySelector('.fitness-drawer__link')?.focus(), 30);
			setTimeout(()=> this.computeChromeInsets && this.computeChromeInsets(), 240);
			setTimeout(()=> this.computeChromeInsets && this.computeChromeInsets(), 880);
		}
		closeFoodDrawer(){ const d=document.getElementById('food-drawer'); if(d) d.classList.remove('open'); }

			// Sleep Drawer: simple list of Sleep topics
			ensureSleepDrawer(){
				if(document.getElementById('sleep-drawer')) return;
				try {
					const drawer = document.createElement('div');
					drawer.id='sleep-drawer';
					drawer.innerHTML = `
						<div class="fitness-drawer__inner">
							<button type="button" class="fitness-drawer__close" aria-label="Close sleep panel">✕</button>
							<header class="fitness-drawer__header"><h1 class="fitness-title">Sleep</h1></header>
							<nav class="fitness-drawer__nav" aria-label="Sleep topics">
								<ul class="fitness-drawer__list" id="sleepDrawerList">
									<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-sleep-item="cbti"><span>Cognitive Behavioral Therapy for Insomnia (CBT-I)</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
									<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-sleep-item="relaxation"><span>Relaxation Techniques</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
									<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-sleep-item="mindfulness"><span>Mindfulness and Meditation</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								</ul>
							</nav>
						</div>`;
					document.body.appendChild(drawer);
					const closeBtn = drawer.querySelector('.fitness-drawer__close');
					closeBtn?.addEventListener('click', ()=> this.closeSleepDrawer());
					const listEl = drawer.querySelector('#sleepDrawerList');
					if(listEl && !listEl._bound){
						listEl.addEventListener('click', (e)=>{
							const btn = e.target.closest('button.fitness-drawer__link');
							if(!btn) return;
							const key = btn.getAttribute('data-sleep-item');
							console.log('[sleep] select', key);
							// TODO: hook into routing when available
						});
						listEl._bound = true;
					}
				} catch(err){ console.warn('ensureSleepDrawer failed', err); }
			}
			openSleepDrawer(){
				this.ensureSleepDrawer();
				this.computeChromeInsets && this.computeChromeInsets(true);
				this.closeAllDrawers && this.closeAllDrawers();
				const d=document.getElementById('sleep-drawer');
				if(!d) return;
				d.classList.add('open');
				try { document.body.classList.add('drawer-open','drawer-sleep-open'); document.body.classList.remove('drawer-fitness-open','drawer-mybody-open','drawer-food-open','drawer-mind-open'); } catch{}
				if(this.isPwaContext && this.isPwaContext()){
					['account-page','stations-container','history-section','summary-section','dropdown-menu'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
				}
				setTimeout(()=> d.querySelector('.fitness-drawer__link')?.focus(), 30);
				setTimeout(()=> this.computeChromeInsets && this.computeChromeInsets(), 240);
				setTimeout(()=> this.computeChromeInsets && this.computeChromeInsets(), 880);
			}
			closeSleepDrawer(){ const d=document.getElementById('sleep-drawer'); if(d) d.classList.remove('open'); }

			// Mind Drawer: simple list of Mind categories
			ensureMindDrawer(){
				if(document.getElementById('mind-drawer')) return;
				try {
					const drawer = document.createElement('div');
					drawer.id='mind-drawer';
					drawer.innerHTML = `
						<div class="fitness-drawer__inner">
							<button type="button" class="fitness-drawer__close" aria-label="Close mind panel">✕</button>
							<header class="fitness-drawer__header"><h1 class="fitness-title">Mind</h1></header>
							<nav class="fitness-drawer__nav" aria-label="Mind categories">
								<ul class="fitness-drawer__list" id="mindDrawerList">
									<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-mind-item="meditation"><span>Meditation</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
									<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-mind-item="memory"><span>Memory</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
									<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-mind-item="puzzles"><span>Puzzles</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
									<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-mind-item="learning"><span>Learning</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
									<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-mind-item="imagine"><span>Imagine</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
									<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-mind-item="logic"><span>Logic</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
									<li class="fitness-drawer__item"><button type="button" class="fitness-drawer__link" data-mind-item="strategy"><span>Strategy</span><svg class="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>
								</ul>
							</nav>
						</div>`;
					document.body.appendChild(drawer);
					const closeBtn = drawer.querySelector('.fitness-drawer__close');
					closeBtn?.addEventListener('click', ()=> this.closeMindDrawer());
					const listEl = drawer.querySelector('#mindDrawerList');
					if(listEl && !listEl._bound){
						listEl.addEventListener('click', (e)=>{
							const btn = e.target.closest('button.fitness-drawer__link');
							if(!btn) return;
							const key = btn.getAttribute('data-mind-item');
							console.log('[mind] select', key);
							// TODO: hook into routing when available
						});
						listEl._bound = true;
					}
				} catch(err){ console.warn('ensureMindDrawer failed', err); }
			}
			openMindDrawer(){
				this.ensureMindDrawer();
				this.computeChromeInsets && this.computeChromeInsets(true);
				this.closeAllDrawers && this.closeAllDrawers();
				const d=document.getElementById('mind-drawer');
				if(!d) return;
				d.classList.add('open');
				try { document.body.classList.add('drawer-open','drawer-mind-open'); document.body.classList.remove('drawer-fitness-open','drawer-mybody-open','drawer-food-open','drawer-sleep-open'); } catch{}
				if(this.isPwaContext && this.isPwaContext()){
					['account-page','stations-container','history-section','summary-section','dropdown-menu'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
				}
				setTimeout(()=> d.querySelector('.fitness-drawer__link')?.focus(), 30);
				setTimeout(()=> this.computeChromeInsets && this.computeChromeInsets(), 240);
				setTimeout(()=> this.computeChromeInsets && this.computeChromeInsets(), 880);
			}
			closeMindDrawer(){ const d=document.getElementById('mind-drawer'); if(d) d.classList.remove('open'); }

	// Flyout panels (always enabled for top banner; hamburger only hidden in PWA)
	initTopFlyoutsIfPwa(){
		if(this._flyoutsInit) return;
		const isPwa = this.isPwaContext();
		this.buildFlyoutInfra();
		if(isPwa){
			const menuContainer = document.querySelector('.menu-container');
			if(menuContainer){ menuContainer.style.display='none'; }
			console.log('[flyouts] PWA context: hamburger hidden');
		} else {
			console.log('[flyouts] Non-PWA context: hamburger retained');
		}
		// Late detection re-checks: if display-mode flips after initial load, re-hide hamburger & clean Account tab
		[600,1500].forEach(delay=> setTimeout(()=>{
			try {
				if(this.isPwaContext && this.isPwaContext()){
					const menuContainer = document.querySelector('.menu-container');
					if(menuContainer && menuContainer.style.display!=='none'){
						menuContainer.style.display='none';
						console.log('[flyouts] late PWA detection: hamburger now hidden');
					}
					this.removeAccountTabIfPresent && this.removeAccountTabIfPresent();
				}
			} catch{}
		}, delay));
		this._flyoutsInit = true;
	}

	// Utility: remove Account tab dynamically if still present (e.g., detection became true later)
	removeAccountTabIfPresent(){
		try {
			if(!(this.isPwaContext && this.isPwaContext())) return;
			const banner = document.getElementById('top-banner-nav'); if(!banner) return;
			const btn = Array.from(banner.querySelectorAll('.top-banner-nav__item')).find(b=> b.textContent.trim()==='Account');
			if(btn){ btn.remove(); console.log('[top-banner] Account tab removed (late) for PWA'); }
		} catch{}
	}
	isPwaContext(){
		try {
			// Allow explicit overrides for testing: ?forcePwa=1 (persists) or localStorage.setItem('forcePwa','1')
			try { if(/[?&]forcePwa=1/.test(location.search)) localStorage.setItem('forcePwa','1'); } catch{}
			const forced = localStorage.getItem('forcePwa')==='1';
			return (
				forced ||
				(window.matchMedia && (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: minimal-ui)').matches)) ||
				(window.navigator && window.navigator.standalone === true) ||
				localStorage.getItem('forceFlyouts')==='1'
			);
		} catch { return false; }
	}
	buildFlyoutInfra(){
		const banner = document.getElementById('top-banner-nav');
		if(!banner){ console.warn('[flyouts] banner missing'); return; }
		// Data model
		this.MENU_STRUCTURE = this.MENU_STRUCTURE || {
			Fitness: {
				prebuild: true,
				items: [
					{ type:'weight' },
					{ type:'divider' },
					{ id:'menu-history', label:'History', disabled:false },
					{ id:'menu-summary', label:'Summary', disabled:false },
					{ id:'menu-aerobic', label:'Aerobic (Coming Soon)', disabled:true },
					{ id:'menu-strength', label:'Strength (Coming Soon)', disabled:true },
					{ id:'menu-balance-flex', label:'Balance & Flex (Coming Soon)', disabled:true },
					{ id:'menu-stretch', label:'Stretch (Coming Soon)', disabled:true },
					{ id:'menu-custom', label:'Custom (Coming Soon)', disabled:true },
					{ id:'menu-assessments', label:'Assessments (Coming Soon)', disabled:true },
					{ id:'menu-goals', label:'Goals (Coming Soon)', disabled:true },
					{ id:'menu-progress', label:'Progress (Coming Soon)', disabled:true },
					{ id:'menu-rewards', label:'Rewards (Coming Soon)', disabled:true }
				]
			},
			Food: { items:[
				{ id:'menu-prepared-meals', label:'Prepared Meals (Coming Soon)', disabled:true },
				{ id:'menu-farm-fresh', label:'Farm Fresh (Coming Soon)', disabled:true },
				{ id:'menu-subscription', label:'Subscription (Coming Soon)', disabled:true },
				{ id:'menu-our-farmers', label:'Our Farmers (Coming Soon)', disabled:true },
				{ id:'menu-nutrition', label:'Nutrition (Coming Soon)', disabled:true }
			]},
			Beauty:{ items:[ { id:'menu-skin-root', label:'Skin (Coming Soon)', disabled:true } ]},
			Mind:{ items:[
				{ id:'menu-mind-sleep', label:'Sleep (Coming Soon)', disabled:true },
				{ id:'menu-mind-destress', label:'De-stress (Coming Soon)', disabled:true },
				{ id:'menu-mind-memory', label:'Memory (Coming Soon)', disabled:true },
				{ id:'menu-mind-puzzles', label:'Puzzles (Coming Soon)', disabled:true },
				{ id:'menu-mind-learning', label:'Learning (Coming Soon)', disabled:true },
				{ id:'menu-mind-imagine', label:'Imagine (Coming Soon)', disabled:true },
				{ id:'menu-mind-logic', label:'Logic (Coming Soon)', disabled:true },
				{ id:'menu-mind-strategy', label:'Strategy (Coming Soon)', disabled:true }
			]},
			Sleep:{ items:[ { id:'menu-sleep', label:'Sleep (Coming Soon)', disabled:true } ]},
			Social:{ items:[ { id:'menu-social', label:'Social (Coming Soon)', disabled:true } ]},
			Scholars:{ items:[ { id:'menu-scholars', label:'Scholars (Coming Soon)', disabled:true } ]},
			Competition:{ items:[ { id:'menu-competition', label:'Competition (Coming Soon)', disabled:true } ]},
			Membership:{ items:[ { id:'menu-membership', label:'Membership (Coming Soon)', disabled:true } ]},
			Account:{ items:[ { id:'menu-account', label:'Account (Coming Soon)', disabled:true } ]},
			About:{ items:[ { id:'menu-about', label:'About (Coming Soon)', disabled:true } ]}
		};
		this._flyoutPanels = {};
		// Tab click hooking (augment existing banner buttons)
		const tabs = banner.querySelectorAll('.top-banner-nav__item');
		tabs.forEach(tab=>{
			const label = tab.textContent.trim();
			tab.addEventListener('click', (e)=>{
				// In PWA, do not open flyouts for Fitness (drawer handles it) and suppress Food/Mind/Sleep
				if((label==='Fitness' || label==='Food' || label==='Mind' || label==='Sleep') && this.isPwaContext && this.isPwaContext()){
					e?.preventDefault?.();
					return;
				}
				this.toggleFlyout(label);
			});
		});
		// Build prebuild panels (Fitness)
		Object.entries(this.MENU_STRUCTURE).forEach(([name,def])=>{ if(def.prebuild) this.ensureFlyout(name); });
		// Close on outside click / escape
		document.addEventListener('click', (e)=>{
			const open = this._openFlyoutName; if(!open) return;
			const panel = this._flyoutPanels[open];
			if(!panel) return;
			if(panel.contains(e.target) || e.target.closest('.top-banner-nav')) return;
			this.closeFlyouts();
		});
		window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') this.closeFlyouts(); });
		// Delegated action handling (maintain original functionality)
		document.addEventListener('click', (e)=>{
			const targetBtn = e.target.closest('.top-flyout-panel.open .top-flyout-panel__label');
			if(!targetBtn) return;
			if(targetBtn.getAttribute('aria-disabled')==='true') return;
			switch(targetBtn.id){
				case 'menu-history': e.preventDefault(); this.closeFlyouts(); this.showHistory(); break;
				case 'menu-summary': e.preventDefault(); this.closeFlyouts(); this.showSummary(); break;
				case 'menu-logout': e.preventDefault(); this.closeFlyouts(); this.logout && this.logout(); break;
				default: break; // Coming soon items do nothing
			}
		});
		console.log('[flyouts] infra ready');
	}
	ensureFlyout(name){
		if(this._flyoutPanels[name]) return this._flyoutPanels[name];
		const def = this.MENU_STRUCTURE[name]; if(!def){ return null; }
		const panel = document.createElement('div');
		panel.className='top-flyout-panel';
		panel.setAttribute('role','tabpanel');
		panel.setAttribute('aria-label', name+' panel');
		panel.dataset.panel=name;
		panel.innerHTML = this.renderFlyoutContent(def.items||[]);
		document.body.appendChild(panel);
		this._flyoutPanels[name]=panel;
		return panel;
	}
	renderFlyoutContent(items){
		let html='';
		items.forEach(item=>{
			if(item.type==='divider'){ html+='<hr />'; return; }
			if(item.type==='weight'){
				html+=`<div class="top-flyout-weight"><label for="weight">Weight</label><input id="weight" type="number" placeholder="Enter weight" /></div>`; return;
			}
			const disabledAttr = item.disabled? ' aria-disabled="true" tabindex="-1"': '';
			html+=`<button class="top-flyout-panel__label" id="${item.id}"${disabledAttr}>${item.label}</button>`;
		});
		return html;
	}
	positionFlyout(name){
		const panel = this._flyoutPanels[name]; if(!panel) return;
		const banner = document.getElementById('top-banner-nav'); if(!banner) return;
		const tab = Array.from(banner.querySelectorAll('.top-banner-nav__item')).find(t=> t.textContent.trim()===name);
		if(!tab) return;
		const rect = tab.getBoundingClientRect();
		// Place panel below banner near tab; clamp within viewport
		const top = banner.getBoundingClientRect().bottom + window.scrollY + 4;
		let left = rect.left + window.scrollX;
		const panelWidth = 250; // matches CSS default
		if(left + panelWidth > window.scrollX + window.innerWidth - 8){ left = window.scrollX + window.innerWidth - panelWidth - 8; }
		panel.style.top = top+'px';
		panel.style.left = left+'px';
	}
	openFlyout(name){
			// Safety: In PWA, suppress Fitness/Food/Mind/Sleep flyouts entirely
			if((name==='Fitness' || name==='Food' || name==='Mind' || name==='Sleep') && this.isPwaContext && this.isPwaContext()){
				return;
			}
		const panel = this.ensureFlyout(name); if(!panel) return;
		this.closeFlyouts();
		panel.classList.add('open');
		this._openFlyoutName = name;
		this.positionFlyout(name);
		// Focus first interactive element
		const focusable = panel.querySelector('button:not([aria-disabled="true"]) , input');
		if(focusable) focusable.focus({ preventScroll:true });
	}
	closeFlyouts(){
		Object.values(this._flyoutPanels||{}).forEach(p=> p.classList.remove('open'));
		this._openFlyoutName = null;
	}
	toggleFlyout(name){
			// Safety: In PWA, suppress Fitness/Food/Mind/Sleep flyouts entirely
			if((name==='Fitness' || name==='Food' || name==='Mind' || name==='Sleep') && this.isPwaContext && this.isPwaContext()){
				return;
			}
		if(this._openFlyoutName === name){ this.closeFlyouts(); return; }
		this.openFlyout(name);
	}

	// Attempt to reconcile any locally stored workout state or queued operations post-auth.
	async checkForDataRecovery(){
		try {
			// Reuse existing "current-workout" snapshot if today's data not already loaded.
			const todayKey = this.getLocalDateKey();
			const stored = localStorage.getItem('current-workout');
			if(stored){
				const parsed = JSON.parse(stored);
				if(parsed && parsed.date === todayKey){
					console.log('[recovery] Found local current-workout snapshot for today; ensuring UI reflects it');
					this.restoreWorkoutState({ date: todayKey, weight: parsed.weight, state: parsed.state||{} });
				}
			}
			// Placeholder for future offline queue replay (none implemented in this build)
			console.log('[recovery] check complete');
		} catch(err){ console.warn('[recovery] error', err); }
	}

	// Centered welcome banner
	showWelcomeBanner(text){
		// Remove any prior instance
		const prior = document.getElementById('welcome-banner');
		if(prior) prior.remove();
		const banner = document.createElement('div');
		banner.id = 'welcome-banner';
		banner.textContent = text;
		let attempts = 0;
		const maxAttempts = 6; // ~900ms worst-case
		const tryInsert = () => {
			const progressSpan = document.getElementById('overall-progress');
			if(progressSpan && progressSpan.parentElement){
				progressSpan.parentElement.insertAdjacentElement('afterend', banner);
				requestAnimationFrame(()=> banner.classList.add('show'));
				const visibleMs = UI_TIMING.WELCOME_BANNER_VISIBLE;
				setTimeout(()=>{
					banner.classList.remove('show');
					setTimeout(()=> banner.remove(), UI_TIMING.BANNER_FADE_MS + 120);
				}, visibleMs);
			}else if(attempts < maxAttempts){
				attempts++; setTimeout(tryInsert, 150);
			}else{
				// Give up silently (avoid intrusive fixed overlay clutter)
				console.warn('[welcome-banner] insertion failed after retries');
			}
		};
		tryInsert();
	}
	saveCurrentWorkout() {
		const dateKey = this.getLocalDateKey();
		const workoutState = {}; let hasData = false;
		this.exercises.forEach(exercise => { const countEl = document.getElementById(`count-${exercise.name}`); if (countEl) { const count = parseInt(countEl.textContent) || 0; workoutState[exercise.name] = count; if (count > 0) hasData = true; } });
		const weight = document.getElementById('weight')?.value || null; if (weight) hasData = true;
		if (hasData) { const workoutData = { date: dateKey, state: workoutState, weight: weight, timestamp: new Date().toISOString(), userId: this.authToken?.slice(0, 10) || 'anonymous' }; localStorage.setItem('current-workout', JSON.stringify(workoutData)); console.log('Workout state saved locally:', workoutData); } else { console.log('No workout data to save (all counts are 0)'); }
	}
	async loadCurrentWorkout() {
		try { const stored = localStorage.getItem('current-workout'); if (stored) { const workoutData = JSON.parse(stored); const today = this.getLocalDateKey(); if (workoutData.date === today) { console.log('Loading today\'s workout data from localStorage:', workoutData); this.restoreWorkoutState(workoutData); return true; } else { console.log('Stored workout is not for today, clearing old data'); this.clearWorkoutState(); } } else { console.log('No stored workout data found in localStorage'); } await this.loadTodaysDataFromHistory(); return false; } catch (error) { console.error('Error loading workout:', error); return false; }
	}
	async loadTodaysDataFromHistory() {
		try {
			const today = this.getLocalDateKey();
			console.log('Attempting to load today\'s data from history for date:', today);
			const headers = {}; if (this.authToken) headers['Authorization'] = `Bearer ${this.authToken}`;
			const response = await fetch('/api/entries', { headers });
			if (response.ok) {
				const entries = await response.json();
				const todaysEntry = entries.find(entry => {
					const raw = entry.entry_date || '';
					const key = raw.includes('T') ? raw.slice(0,10) : raw;
					return key === today;
				});
				if (todaysEntry && todaysEntry.fitness_data) {
					console.log('Found today\'s data in history:', todaysEntry);
					const workoutData = { date: today, weight: todaysEntry.weight, state: todaysEntry.fitness_data };
					this.restoreWorkoutState(workoutData);
					return true;
				} else { console.log('No entry found for today in history'); }
			} else { console.log('Could not fetch history data:', response.status); }
		} catch (error) { console.log('Could not load today\'s data from history:', error); }
		return false;
	}
	restoreWorkoutState(workoutData) {
		this.exercises.forEach(exercise => { const countEl = document.getElementById(`count-${exercise.name}`); const setsEl = document.getElementById(`sets-${exercise.name}`); if (countEl && workoutData.state[exercise.name]) { const count = workoutData.state[exercise.name]; countEl.textContent = count; if (setsEl) setsEl.textContent = Math.min(count, this.maxSets); this.updateButtonStates(exercise.name, count); } }); if (workoutData.weight) { const weightEl = document.getElementById('weight'); if (weightEl) weightEl.value = workoutData.weight; } this.updateProgress(); console.log('Workout state restored successfully'); }
	clearWorkoutState() { localStorage.removeItem('current-workout'); }
	startAutoSave() { this.stopAutoSave(); this.autoSaveInterval = setInterval(() => { if (this.hasUnsavedChanges) { this.saveCurrentWorkout(); this.autoSaveToDatabase(); } }, 30000); console.log('Auto-save started (30-second intervals) - running silently'); }
	stopAutoSave() { if (this.autoSaveInterval) { clearInterval(this.autoSaveInterval); this.autoSaveInterval = null; console.log('Auto-save stopped'); } }
	syncLocalDataToDatabase(){ /* no offline queue presently */ return Promise.resolve(); }
	async autoSaveToDatabase() { try { await this.saveProgress(true); this.hasUnsavedChanges = false; this.lastSaveTime = new Date(); console.log('Auto-save to database completed silently'); } catch (error) { console.error('Auto-save to database failed:', error); } }
	markAsChanged() { this.hasUnsavedChanges = true; this.saveCurrentWorkout(); }
	buildStations() { 
		console.log('Building stations...'); 
		const stationsGrid = document.getElementById('stations-grid'); 
		stationsGrid.innerHTML = ''; 
		this._lastButtonTap = {}; // map of button key -> timestamp
		this.exercises.forEach(exercise => { 
			const station = document.createElement('div'); 
			station.className = 'station'; 
			station.id = `station-${exercise.name}`; 
			station.innerHTML = `\n\t\t\t\t<div class="station-name">${exercise.name}</div>\n\t\t\t\t<div class="station-info">Sets: <span id="sets-${exercise.name}">0</span> / ${this.maxSets} | ${exercise.unit}: ${exercise.reps}</div>\n\t\t\t\t<div class="station-controls">\n\t\t\t\t\t<button class="btn" data-name="${exercise.name}" data-delta="-1" disabled>-</button>\n\t\t\t\t\t<span class="count" id="count-${exercise.name}">0</span>\n\t\t\t\t\t<button class="btn" data-name="${exercise.name}" data-delta="1">+</button>\n\t\t\t\t</div>\n\t\t\t` ; 
			stationsGrid.appendChild(station); 
		}); 
		// Unified guarded click handler
		stationsGrid.addEventListener('click', (e) => { 
			const target = e.target; 
			if (target && target.classList.contains('btn')) { 
				const name = target.getAttribute('data-name'); 
				const deltaAttr = target.getAttribute('data-delta'); 
				if(!name || !deltaAttr) return; 
				const delta = parseInt(deltaAttr); 
				// Guard: prevent rapid double-fire within 130ms per exercise+direction
				const key = name + ':' + delta; 
				const now = performance.now(); 
				const last = this._lastButtonTap[key] || 0; 
				if (now - last < 130) { return; } 
				this._lastButtonTap[key] = now; 
				this.updateCount(name, delta); 
			}
		}); 
		console.log('Stations built successfully!'); 
	}
	setupButtonHandlers(){
		const historyBtn = document.getElementById('menu-history');
	historyBtn && historyBtn.addEventListener('click', (e)=>{ e.preventDefault(); console.log('[menu] history click'); this.showHistory(); this.closeMenu(); });
		const summaryBtn = document.getElementById('menu-summary');
	summaryBtn && summaryBtn.addEventListener('click', (e)=>{ e.preventDefault(); console.log('[menu] summary click'); this.showSummary(); this.closeMenu(); });
		const logoutBtn = document.getElementById('menu-logout');
	logoutBtn && logoutBtn.addEventListener('click', (e)=>{ e.preventDefault(); console.log('[menu] logout click'); this.logout(); this.closeMenu(); });
		// Modal close buttons
		const hClose = document.getElementById('history-close-btn');
		if(hClose) hClose.onclick = (e)=>{ e.preventDefault(); document.getElementById('history-modal').style.display='none'; };
		const sClose = document.getElementById('summary-close-btn');
		if(sClose) sClose.onclick = (e)=>{ e.preventDefault(); document.getElementById('summary-modal').style.display='none'; };
		// Also allow clicking backdrop to close
		['history-modal','summary-modal'].forEach(id=>{
			const modal = document.getElementById(id);
			if(modal){
				modal.addEventListener('click',(ev)=>{ if(ev.target===modal){ modal.style.display='none'; }});
			}
		});
	}
	closeMenu(){ const menu=document.getElementById('dropdown-menu'); const icon=document.getElementById('menu-icon'); if(menu) menu.classList.remove('show'); if(icon) icon.classList.remove('active'); }
	// Literal date mm/dd/yy without timezone shift
	formatDateLiteral(ymd){ if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(ymd)) return ymd; const [Y,M,D]=ymd.split('-'); return `${M}/${D}/${Y.slice(-2)}`; }
	formatDisplayDate(date){ return this.formatDateLiteral(date); }
	async showHistory(){
		try {
			const tbodyPre = document.getElementById('history-table');
			if(tbodyPre){
				// show loading placeholder if empty
				if(!tbodyPre.children.length){
					const tr=document.createElement('tr');
					tr.innerHTML = '<td colspan="5" style="padding:16px;text-align:center;color:#666;font-size:13px;">Loading history…</td>';
					tbodyPre.appendChild(tr);
				}
			}
			const headers = this.authToken? { 'Authorization':`Bearer ${this.authToken}` }: {};
			const resp = await fetch('/api/entries', { headers });
			if(!resp.ok) throw new Error('Failed history');
			let entries = await resp.json();
			entries = (entries||[]).filter(e=>e && e.entry_date);
			if(this._historyDescending !== false){ entries.sort((a,b)=> b.entry_date.localeCompare(a.entry_date)); } else { entries.sort((a,b)=> a.entry_date.localeCompare(b.entry_date)); }
			const tbody = document.getElementById('history-table'); if(!tbody) return; tbody.innerHTML='';
			entries.forEach(e=>{
				const tr=document.createElement('tr');
				const rawDate = e.entry_date || '';
				const dateKey = rawDate.includes('T') ? rawDate.slice(0,10) : rawDate; // hide timestamp component
				tr.dataset.entryDate = dateKey;
				// Count an exercise as completed ONLY when it reaches the goal (== this.maxSets)
				const completed = Object.values(e.fitness_data||{}).filter(v=> parseInt(v,10) === this.maxSets).length;
				const detailLines = Object.entries(e.fitness_data||{}).map(([k,v])=>`<div class='ex-line'><span class='ex-name'>${k}</span><span class='ex-val'>${v}</span></div>`).join('');
				tr.innerHTML = `<td>${this.formatDisplayDate(dateKey)}</td><td class="num-right weight-col">${e.weight??''}</td><td class="num-right completed-col">${completed}/${this.exercises.length}</td><td class="exercise-details">${detailLines}</td><td><button class="history-edit-btn" data-date="${dateKey}" title="Edit">✏️</button><button class="history-delete-btn" data-date="${dateKey}" title="Delete">🗑️</button></td>`;
				tbody.appendChild(tr);
			});
			document.getElementById('history-modal').style.display='flex';
			this.ensureHistoryTableHandlers();
			this.attachHistoryHeaderSort();
		} catch(err){
			this.showMessage('❌ '+err.message,'error', UI_TIMING.TOAST_ERROR);
			const tbody = document.getElementById('history-table');
			if(tbody && !tbody.children.length){
				const tr=document.createElement('tr');
				tr.innerHTML = '<td colspan="5" style="padding:14px;text-align:center;color:#b71c1c;font-size:13px;">Failed to load history. Retry later.</td>';
				tbody.appendChild(tr);
			}
		}
	}
	async showSummary(){
		try {
			const tbodyPre = document.getElementById('summary-table');
			if(tbodyPre){
				if(!tbodyPre.children.length){
					const tr=document.createElement('tr');
					tr.innerHTML = '<td colspan="14" style="padding:16px;text-align:center;color:#666;font-size:13px;">Loading weekly summary…</td>';
					tbodyPre.appendChild(tr);
				}
			}
			const headers = this.authToken? { 'Authorization':`Bearer ${this.authToken}` }: {};
			const resp = await fetch('/api/summary', { headers });
			if(!resp.ok) throw new Error('Failed summary');
			const weeks = await resp.json();
			const tbody=document.getElementById('summary-table'); if(!tbody) return; tbody.innerHTML='';
			if(!weeks.length){ const tr=document.createElement('tr'); tr.innerHTML='<td colspan="14" style="text-align:center;padding:16px;color:#666;">No data yet.</td>'; tbody.appendChild(tr); }
			weeks.forEach(w=>{
				const totals=w.totals||{}; const totalSets = Object.values(totals).reduce((a,b)=>a+parseInt(b||0),0);
				const tr=document.createElement('tr');
				// Strip timestamp from week_of_sunday if present
				const weekDateRaw = (w.week_of_sunday||'').toString();
				const weekDate = weekDateRaw.includes('T') ? weekDateRaw.slice(0,10) : weekDateRaw;
				tr.innerHTML = `<td>${this.formatDisplayDate(weekDate)}</td><td class="num-right">${w.weight_avg??''}</td>${['Bike','Abs','Chest Press','Leg Press','Lat','Military','Crunch','Bicep Curls','Triceps','Overhead Pull','Row'].map(n=>`<td class='num-right'>${totals[n]||0}</td>`).join('')}<td class='num-right'><strong>${totalSets}</strong></td>`;
				tbody.appendChild(tr);
			});
			document.getElementById('summary-modal').style.display='flex';
		}catch(err){
			this.showMessage('❌ '+err.message,'error', UI_TIMING.TOAST_ERROR);
			const tbody=document.getElementById('summary-table');
			if(tbody && !tbody.children.length){
				const tr=document.createElement('tr');
				tr.innerHTML='<td colspan="14" style="padding:14px;text-align:center;color:#b71c1c;font-size:13px;">Failed to load summary. Retry later.</td>';
				tbody.appendChild(tr);
			}
		}
	}
	async registerNewUser(){
		const emailInput = document.getElementById('email');
		const passwordInput = document.getElementById('password');
		const email = emailInput?.value?.trim();
		const password = passwordInput?.value;
		if(!email){ this.showMessage('Email required','error'); emailInput?.focus(); return; }
		if(!password){ this.showMessage('Password required','error'); passwordInput?.focus(); return; }
		// Collect multiple goals (checkboxes name="goal[]")
		const goalNodes = document.querySelectorAll('input[name="goal[]"]:checked');
		let goal = null;
		if(goalNodes.length){ goal = Array.from(goalNodes).map(n=> n.value); }
		try {
				console.log('[register] submitting registration request');
				const resp = await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,goal})});
			if(!resp.ok){
				let msg='Registration failed';
				try { const j=await resp.json(); msg = j.error || msg; } catch{}
				throw new Error(msg);
			}
			const data = await resp.json();
			// Do NOT auto-login; show inline neutral notice instructing to login
			// Clear any existing token to avoid unintended authenticated state
			this.authToken = null;
			localStorage.removeItem('fitness-tracker-token');
			// Insert inline message below the Save user ID checkbox, above buttons
			const formContent = document.getElementById('formContent');
			let anchor = document.querySelector('.checkbox-group');
			let note = document.getElementById('registration-inline-success');
			if(!note){
				note = document.createElement('div');
				note.id='registration-inline-success';
				note.style.cssText='margin:7px 0 -2px 0;text-align:center;font-size:12.5px;color:#666;font-weight:500;opacity:0;transition:opacity .5s ease;';
				if(anchor && anchor.parentNode){ anchor.parentNode.insertBefore(note, anchor.nextSibling); }
				else formContent?.appendChild(note);
			}
			note.textContent = 'Registration successful. Now please login';
			requestAnimationFrame(()=>{ note.style.opacity='1'; });
			setTimeout(()=>{ note.style.opacity='0'; setTimeout(()=> note.remove(), 800); }, 3500);
			// Optional: clear password for security
			if(passwordInput) passwordInput.value='';
			// Reset goal checkboxes so user sees fresh state on next registration attempt
			document.querySelectorAll('input[name="goal[]"]:checked').forEach(cb=> cb.checked=false);
			// Collapse goals after success
			const g=document.getElementById('goalsGroup'); if(g) g.style.display='none';
			// Reset register button state (two-step) so next time first click shows goals again
			const registerBtn=document.getElementById('registerButton');
			if(registerBtn){ delete registerBtn.dataset.step; registerBtn.disabled=false; registerBtn.textContent='Register'; }
		}catch(e){ this.showMessage('❌ '+e.message,'error'); }
	}
	updateCount(exerciseName, delta){
		const countEl = document.getElementById(`count-${exerciseName}`);
		const setsEl = document.getElementById(`sets-${exerciseName}`);
		let currentCount = parseInt(countEl.textContent);
		let newCount = Math.max(0, Math.min(currentCount + delta, this.maxSets));
		countEl.textContent = newCount; setsEl.textContent = newCount;
		const minusBtn = document.querySelector(`[data-name="${exerciseName}"][data-delta="-1"]`);
		const plusBtn = document.querySelector(`[data-name="${exerciseName}"][data-delta="1"]`);
		minusBtn.disabled = newCount <= 0; plusBtn.disabled = newCount >= this.maxSets;
		if (newCount === this.maxSets) document.getElementById(`station-${exerciseName}`)?.classList.add('completed'); else document.getElementById(`station-${exerciseName}`)?.classList.remove('completed');
		this.updateProgress(); this.markAsChanged(); if(this.isAuthenticated) this.debouncedImmediateSave();
	}
	debouncedImmediateSave(){
		clearTimeout(this._immediateSaveTimer);
		this._immediateSaveTimer = setTimeout(()=>{ this.saveProgress(true).then(()=>{ if(document.getElementById('summary-modal')?.style.display==='flex') this.showSummary(); }); }, UI_TIMING.IMMEDIATE_SAVE_DEBOUNCE);
	}
	attachHistoryHeaderSort(){
		const thead = document.querySelector('#history-content thead');
		if(!thead || this._historySortBound) return; this._historySortBound=true;
		const dateTh = thead.querySelector('th:first-child');
		if(dateTh){
			dateTh.style.cursor='pointer';
			dateTh.title='Toggle sort order';
			dateTh.addEventListener('click',()=>{ this._historyDescending = this._historyDescending===false ? true : false; this.showHistory(); });
		}
	}
	// Add listener for weight immediate persistence
	initWeightImmediateSave(){
		const weightInput = document.getElementById('weight');
		if(!weightInput || this._weightImmediateBound) return; this._weightImmediateBound=true;
		let debounce;
		const handler = ()=>{
			clearTimeout(debounce);
			debounce = setTimeout(()=>{
				this.markAsChanged();
				this.saveProgress(true).then(()=>{
					// Update history row for today if open
					const today = this.getLocalDateKey();
					const row = document.querySelector(`#history-table tr[data-entry-date='${today}']`);
					if(row){ const weightCell=row.children[1]; if(weightCell) weightCell.textContent=weightInput.value; }
					// If summary modal visible, refresh summary to reflect new avg
					if(document.getElementById('summary-modal')?.style.display==='flex') this.showSummary();
				});
			},UI_TIMING.WEIGHT_SAVE_DEBOUNCE);
		};
		['input','change'].forEach(ev=> weightInput.addEventListener(ev, handler));
	}
	updateButtonStates(exerciseName, count){
		const minusBtn = document.querySelector(`[data-name="${exerciseName}"][data-delta="-1"]`);
		const plusBtn = document.querySelector(`[data-name="${exerciseName}"][data-delta="1"]`);
		if(minusBtn) minusBtn.disabled = count <= 0;
		if(plusBtn) plusBtn.disabled = count >= this.maxSets;
	}
	updateProgress(){
		// Show number of stations with any progress (>0) so user sees partial completion instead of staying at 0/11
		let started = 0;
		this.exercises.forEach(ex => {
			const countEl = document.getElementById(`count-${ex.name}`);
			const count = parseInt(countEl?.textContent)||0;
			if(count > 0) started++;
		});
		const progressEl = document.getElementById('overall-progress');
		if(progressEl){ progressEl.textContent = `${started}/${this.exercises.length}`; }
	}
	showMessage(message, type='info', duration=UI_TIMING.TOAST_DEFAULT){
		// Suppress non-error toasts during silent window (e.g., right after login) to avoid redundant banners
		if(this.silentUntil && Date.now() < this.silentUntil && type !== 'error') return;
		let container = document.getElementById('toast-container');
		if(!container){
			container = document.createElement('div');
			container.id = 'toast-container';
			container.style.cssText = 'position:fixed;top:10px;right:10px;display:flex;flex-direction:column;gap:6px;z-index:20000;pointer-events:none;';
			document.body.appendChild(container);
		}
		const toast = document.createElement('div');
		toast.textContent = message;
		toast.style.cssText = 'background:#333;color:#fff;padding:8px 12px;border-radius:4px;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.3);opacity:0;transform:translateY(-4px);transition:all .25s;font-weight:500;';
		if(type==='success') toast.style.background = '#2e7d32';
		// Replace success color (green) with brand red
		if(type==='success') toast.style.background = '#C5282F';
		if(type==='error') toast.style.background = '#c62828';
		if(type==='info') toast.style.background = '#1565c0';
		container.appendChild(toast);
		requestAnimationFrame(()=>{ toast.style.opacity='1'; toast.style.transform='translateY(0)'; });
		setTimeout(()=>{
			toast.style.opacity='0'; toast.style.transform='translateY(-4px)';
			setTimeout(()=> toast.remove(), 300);
		}, duration);
	}
	logout() {
		this.isAuthenticated = false;
		const overlayEl = document.getElementById('loginOverlay');
		if(overlayEl){ overlayEl.classList.remove('hidden'); overlayEl.style.display='flex'; }
		const appEl = document.getElementById('app-container'); if(appEl) appEl.style.display='none';
		// Clear auth token & any transient state
		try{ localStorage.removeItem('fitness-tracker-token'); }catch(_){ }
		this.authToken=null;
		// Collapse any open menus
		try{ const menu=document.getElementById('dropdown-menu'); if(menu) menu.classList.remove('show'); const icon=document.getElementById('menu-icon'); if(icon) icon.classList.remove('active'); }catch(_){ }
		const menuContainer = document.querySelector('.menu-container');
		if(menuContainer) menuContainer.classList.add('hidden');
		const formContent = document.getElementById('formContent');
		const signInHeader = document.getElementById('signInHeader');
		const forgotSection = document.getElementById('forgotSection');
		if (formContent) formContent.classList.remove('show');
		if (signInHeader) signInHeader.classList.remove('expanded');
		if (forgotSection) forgotSection.classList.remove('show');
		// Reset first panel expanded state for clarity
		if(signInHeader){ signInHeader.classList.add('expanded'); const fc=document.getElementById('formContent'); if(fc) fc.classList.add('show'); }
		// Focus first input for immediate re-login
		setTimeout(()=>{ document.getElementById('username')?.focus(); },50);
		console.log('Logged out');
	}
	// Replace saveProgress to allow editingDate override
	async saveProgress(silent = false, dateOverride = null) {
		if (!silent) this.showMessage('💾 Saving...', 'info', 1000);
		this.saveCurrentWorkout();
		if (!silent) {
			const saveMessage = document.getElementById('save-message');
			if (saveMessage) {
				saveMessage.style.display = 'block';
				setTimeout(() => { saveMessage.style.display = 'none'; }, 3000);
			}
		}
		try {
			const dateKey = dateOverride || this.editingDate || this.getLocalDateKey();
			const weight = document.getElementById('weight')?.value || null;
			const fitnessData = {};
			this.exercises.forEach(exercise => {
				const countEl = document.getElementById(`count-${exercise.name}`);
				fitnessData[exercise.name] = parseInt(countEl?.textContent) || 0;
			});
			// Always persist attempted save locally for recovery (overwrites same date)
			this.queuePendingEntry({ date: dateKey, weight, fitnessData });
			const headers = { 'Content-Type': 'application/json' };
			if (this.authToken) headers['Authorization'] = `Bearer ${this.authToken}`;
			if(!navigator.onLine){
				if(!silent) this.showMessage('Offline: queued locally','info',1800);
				this.hasUnsavedChanges = false; // state captured
				return { queued:true };
			}
			const response = await fetch('/api/entries', {
				method: 'POST',
				headers,
				body: JSON.stringify({ date: dateKey, weight, fitnessData })
			});
			if (response.ok) {
				const data = await response.json();
				this.hasUnsavedChanges = false;
				this.lastSaveTime = new Date();
				// Remove from queue since server accepted it
				try {
					const raw = localStorage.getItem(this.outboxKey); if(raw){
						const list = JSON.parse(raw).filter(e=> e.date !== dateKey);
						if(list.length) localStorage.setItem(this.outboxKey, JSON.stringify(list)); else localStorage.removeItem(this.outboxKey);
					}
				} catch{}
				if (!silent) this.showMessage(`✅ Saved ${this.editingDate ? 'edited' : 'today'} entry`, 'success', 1200);
				// Auto-refresh history/summary if modals open
				if(document.getElementById('history-modal').style.display==='flex') this.showHistory();
				if(document.getElementById('summary-modal').style.display==='flex') this.showSummary();
				// Try flushing any other queued items opportunistically
				this.flushPendingEntries(true);
				return data;
			} else {
				const errorText = await response.text();
				throw new Error(`HTTP ${response.status}: ${errorText}`);
			}
		} catch (error) {
			console.error('Error saving to database:', error);
			if (!silent) {
				this.showMessage(`❌ Save failed: ${error.message}. Retained locally & will retry.`, 'error', 5000);
				setTimeout(() => { if (confirm('Retry saving?')) this.saveProgress(false, dateOverride); }, 1000);
			}
			throw error;
		}
	}
	enterEditMode(date, entry) {
		if (date === this.getLocalDateKey()) {
			// Editing today just resets any prior edit state
			this.editingDate = null;
			this.removeEditBanner();
			return;
		}
		if (!this._todayBackup) {
			// Capture current today state for restoration
			const stored = localStorage.getItem('current-workout');
			if (stored) this._todayBackup = JSON.parse(stored);
		}
		this.editingDate = date;
		// Build workoutData shape expected by restoreWorkoutState
		const workoutData = { date, weight: entry?.weight, state: entry?.fitness_data || entry?.state || {} };
		this.restoreWorkoutState(workoutData);
		this.updateEditingBanner();
		this.showMessage(`✏️ Editing ${this.formatDisplayDate(date)} entry`, 'info', 2500);
	}
	exitEditMode() {
		if (!this.editingDate) return;
		this.editingDate = null;
		if (this._todayBackup && this._todayBackup.date === this.getLocalDateKey()) {
			this.restoreWorkoutState({ date: this._todayBackup.date, weight: this._todayBackup.weight, state: this._todayBackup.state });
		}
		this.removeEditBanner();
		this.showMessage('↩️ Returned to Today', 'info', 1500);
	}
	updateEditingBanner() {
		let banner = document.getElementById('edit-banner');
		if (!this.editingDate) { if (banner) banner.remove(); return; }
		if (!banner) {
			banner = document.createElement('div');
			banner.id = 'edit-banner';
			banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#1565c0;color:#fff;padding:8px 12px;font-size:14px;display:flex;align-items:center;gap:12px;z-index:5000;box-shadow:0 2px 4px rgba(0,0,0,.2)';
			document.body.appendChild(banner);
		}
		banner.innerHTML = `Editing: <strong>${this.formatDisplayDate(this.editingDate)}</strong><span style="flex:1"></span><button id="exit-edit-btn" style="background:#fff;color:#1565c0;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;font-weight:600;">Return to Today</button>`;
		banner.querySelector('#exit-edit-btn').onclick = () => this.exitEditMode();
	}
	removeEditBanner(){ const b=document.getElementById('edit-banner'); if(b) b.remove(); }
	deleteEntry(date){
		if(!confirm(`Delete entry for ${this.formatDisplayDate(date)}? This cannot be undone.`)) return;
		fetch(`/api/entries/${date}`, { method:'DELETE', headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {} })
			.then(r=>{ if(!r.ok) throw new Error('Delete failed'); return r.json(); })
			.then(()=>{ this.showMessage('🗑️ Entry deleted','success'); if(this.editingDate === date) this.exitEditMode(); this.showHistory(); })
			.catch(e=> this.showMessage('❌ '+e.message,'error'));
	}
	// Enhance history table handlers for edit/delete
	ensureHistoryTableHandlers() {
		if (this._historyHandlersAttached) return;
		const table = document.getElementById('history-table');
		if (!table) return;
		table.addEventListener('click', (e) => {
			const editBtn = e.target.closest('.history-edit-btn');
			const deleteBtn = e.target.closest('.history-delete-btn');
			if (editBtn) {
				const row = editBtn.closest('tr');
				const date = row?.dataset.entryDate || editBtn.getAttribute('data-date');
				if(!date) return;
				this.openEditEntry(date);
			}
			if (deleteBtn) {
				const date = deleteBtn.getAttribute('data-date') || deleteBtn.closest('tr')?.dataset.entryDate;
				if(date) this.deleteEntry(date);
			}
		});
		this._historyHandlersAttached = true;
	}
	// Open an existing entry for editing (loads into workout UI)
	openEditEntry(date){
		// If already editing this date toggle back to today
		if(this.editingDate === date){ this.exitEditMode(); return; }
		// Find row data from currently loaded table (fast path) -> build entry object
		const row = document.querySelector(`#history-table tr[data-entry-date='${date}']`);
		let entry = null;
		if(row){
			// Reconstruct from DOM cells (weight in second cell, details in 4th)
			const cells = row.children;
			const weight = cells[1]?.textContent?.trim() || null;
			const detailCell = cells[3];
			const fitness_data = {};
			if(detailCell){
				const lines = detailCell.querySelectorAll('.ex-line');
				lines.forEach(div=>{
					const name = div.querySelector('.ex-name')?.textContent?.trim();
					const val = parseInt(div.querySelector('.ex-val')?.textContent?.trim()||'0',10);
					if(name) fitness_data[name]=val;
				});
			}
			entry = { entry_date: date, weight, fitness_data };
		}
		if(!entry){
			// Fallback fetch single entry if not in DOM (future optimization)
			fetch(`/api/entries/${date}`, { headers: this.authToken? { 'Authorization':`Bearer ${this.authToken}` }: {} })
				.then(r=> r.ok ? r.json(): Promise.reject(new Error('Load failed')))
				.then(data=> this.enterEditMode(date, data))
				.catch(err=> this.showMessage('❌ '+err.message,'error'));
			return;
		}
		this.enterEditMode(date, entry);
		// Close history modal so user can edit
		const hm = document.getElementById('history-modal'); if(hm) hm.style.display='none';
	}
	initMenu(){
		if(this._menuInit) return; this._menuInit=true;
		const icon = document.getElementById('menu-icon');
		const menu = document.getElementById('dropdown-menu');
		const fitnessSub = null; // legacy fitness-submenu removed in PWA context
		const foodSub = document.getElementById('food-submenu');
		const beautySub = document.getElementById('beauty-submenu');
		const mindSub = document.getElementById('mind-submenu');
		const skinSub = document.getElementById('skin-submenu');
		if(!icon || !menu) return;
		const PREVIEW_DATA = {
			'menu-assessments': { title:'Assessments', desc:'Record baseline and periodic assessment metrics (feature coming soon).', sub: [ { id:'assess-bodycomp', label:'Body Composition', note:'TBD' }, { id:'assess-strength', label:'Strength Test', note:'TBD' } ] },
			'menu-goals': { title:'Goals', desc:'Define and track personalized goals across Mind, Body, Heart segments.', sub: [ { id:'goal-new', label:'New Goal Wizard', note:'Future' } ] },
			'menu-progress': { title:'Progress', desc:'Visual trends and charts summarizing your consistency & performance.', sub: [] },
			'menu-rewards': { title:'Rewards', desc:'Earn streak badges & milestone achievements (gamification queue).', sub: [ { id:'reward-streaks', label:'Streak Badges', note:'Planned' } ] },
			'menu-history': { title:'History', desc:'Full log of all past workout entries with edit & delete tools.', sub: [] },
			'menu-summary': { title:'Weekly Summary', desc:'Aggregated weekly sets and weight averages for quick review.', sub: [] },
			'menu-aerobic': { title:'Aerobic', desc:'Cardio sessions tracking (duration, intensity, heart rate zones). (Coming soon)', sub: [] },
			'menu-strength': { title:'Strength', desc:'Structured resistance workouts & progressive overload tracking. (Coming soon)', sub: [] },
			'menu-balance-flex': { title:'Balance & Flex', desc:'Balance drills & flexibility mobility routines. (Coming soon)', sub: [] },
			'menu-stretch': { title:'Stretch', desc:'Targeted stretching sequences & recovery sessions. (Coming soon)', sub: [] },
			'menu-custom': { title:'Custom', desc:'Create and organize personalized workout templates. (Coming soon)', sub: [] },
			'menu-logout': { title:'Logout', desc:'End your current session and return to sign-in.', sub: [] },
			'menu-prepared-meals': { title:'Prepared Meals', desc:'Chef-crafted ready meals delivered fresh. (Coming soon)', sub: [] },
			'menu-farm-fresh': { title:'Farm Fresh', desc:'Seasonal produce directly from partner farms. (Coming soon)', sub: [] },
			'menu-subscription': { title:'Subscription', desc:'Automated weekly meal & produce delivery plans. (Coming soon)', sub: [] },
			'menu-our-farmers': { title:'Our Farmers', desc:'Stories and practices of our partner growers. (Coming soon)', sub: [] },
			'menu-nutrition': { title:'Nutrition', desc:'Guided meal plans & macro insights. (Coming soon)', sub: [] },
			// Beauty & nested Skin
			'menu-beauty-root': { title:'Beauty', desc:'Holistic skin & self-care (exploratory section).', sub: [ { id:'menu-skin-root', label:'Skin', note:'Nested' } ] },
			'menu-skin-root': { title:'Skin', desc:'Skin health, routines & future service integrations.', sub: [ { id:'menu-k-skin', label:'K-Skin', note:'Soon' }, { id:'menu-spa', label:'Spa', note:'Soon' }, { id:'menu-dermatology', label:'Derm', note:'Soon' }, { id:'menu-shop', label:'Shop', note:'Soon' } ] },
			'menu-sleep': { title:'Sleep', desc:'Track and improve sleep duration, consistency, and quality metrics. (Coming soon)', sub: [] },
			'menu-k-skin': { title:'K-Skin', desc:'K-beauty inspired curated routines. (Coming soon)', sub: [] },
			'menu-spa': { title:'Spa', desc:'Relaxation & recovery experiences. (Coming soon)', sub: [] },
			'menu-dermatology': { title:'Dermatology', desc:'Professional skin health guidance. (Coming soon)', sub: [] },
			'menu-shop': { title:'Shop', desc:'Curated products marketplace. (Coming soon)', sub: [] },
			// Mind
			'menu-mind-root': { title:'Mind', desc:'Cognitive wellness & mental performance domains.', sub: [ { id:'menu-mind-sleep', label:'Sleep', note:'Soon' }, { id:'menu-mind-destress', label:'De-stress', note:'Soon' }, { id:'menu-mind-memory', label:'Memory', note:'Soon' } ] },
			'menu-mind-sleep': { title:'Sleep', desc:'Sleep hygiene tracking & guidance. (Coming soon)', sub: [] },
			'menu-mind-destress': { title:'De-stress', desc:'Mindfulness and relaxation exercises. (Coming soon)', sub: [] },
			'menu-mind-memory': { title:'Memory', desc:'Memory training games & retention metrics. (Coming soon)', sub: [] },
			'menu-mind-puzzles': { title:'Puzzles', desc:'Brain teasers to sharpen logic. (Coming soon)', sub: [] },
			'menu-mind-learning': { title:'Learning', desc:'Continuous learning planner. (Coming soon)', sub: [] },
			'menu-mind-imagine': { title:'Imagine', desc:'Creativity & ideation exercises. (Coming soon)', sub: [] },
			'menu-mind-logic': { title:'Logic', desc:'Deductive reasoning challenges. (Coming soon)', sub: [] },
			'menu-mind-strategy': { title:'Strategy', desc:'Long-form strategic thinking drills. (Coming soon)', sub: [] }
		};
		let flyout = document.getElementById('menu-flyout-preview');
		const PMA_MODE = ('ontouchstart' in window) || navigator.maxTouchPoints>0;
		if(!flyout){ flyout=document.createElement('div'); flyout.id='menu-flyout-preview'; flyout.className='menu-flyout-preview'; flyout.innerHTML='<div class="menu-flyout-inner"></div>'; document.body.appendChild(flyout);} 
		const inner = flyout.querySelector('.menu-flyout-inner');
		let hideTimer=null;
		// A11y roles
		menu.setAttribute('role','menu');
		icon.setAttribute('aria-haspopup','true');
		icon.setAttribute('aria-expanded','false');
		[...menu.querySelectorAll('button.dropdown-item')].forEach(btn=>{
			btn.setAttribute('role','menuitem');
			if(['menu-fitness-root','menu-food','menu-beauty-root','menu-mind-root','menu-skin-root'].includes(btn.id)){
				btn.setAttribute('aria-haspopup','true');
				btn.setAttribute('aria-expanded','false');
			}
		});
		const showPreview = (btn)=>{ if(!btn) return; const data=PREVIEW_DATA[btn.id]; if(!data){ hideImmediate(); return;} inner.innerHTML=''; const title=document.createElement('h4'); title.className='menu-flyout-title'; title.textContent=data.title||btn.textContent.trim(); inner.appendChild(title); if(data.desc){ const p=document.createElement('p'); p.className='menu-flyout-desc'; p.textContent=data.desc; inner.appendChild(p);} if(data.sub&&data.sub.length){ const sh=document.createElement('div'); sh.className='menu-flyout-subhead'; sh.textContent='Sub Items'; inner.appendChild(sh); const list=document.createElement('div'); list.className='menu-flyout-subitems'; data.sub.forEach(s=>{ const item=document.createElement('div'); item.className='menu-flyout-subitem disabled'; item.dataset.subId=s.id; item.innerHTML=`<span class=\"label\">${s.label}</span><span class=\"note\">${s.note||''}</span>`; list.appendChild(item); }); inner.appendChild(list);} const rect=btn.getBoundingClientRect(); const gap=10; const flyoutWidth=260; let useLeft=false; if(rect.right+gap+flyoutWidth>window.innerWidth-8) useLeft=true; flyout.classList.remove('left','right'); if(useLeft){ const leftPos=Math.max(8, rect.left-gap-flyoutWidth); flyout.style.left=leftPos+'px'; flyout.classList.add('left'); } else { flyout.style.left=Math.min(rect.right+gap, window.innerWidth - flyoutWidth - 8)+'px'; flyout.classList.add('right'); } const top=Math.min(window.innerHeight-20, rect.top + rect.height/2); flyout.style.top=Math.max(12, top-60)+'px'; clearTimeout(hideTimer); flyout.classList.add('visible'); };
		const scheduleHide=()=>{ clearTimeout(hideTimer); hideTimer=setTimeout(()=> flyout.classList.remove('visible'), UI_TIMING.FLYOUT_HIDE_DELAY); };
		const hideImmediate=()=>{ clearTimeout(hideTimer); flyout.classList.remove('visible'); };
		menu.addEventListener('pointerleave', scheduleHide); flyout.addEventListener('pointerenter', ()=>clearTimeout(hideTimer)); flyout.addEventListener('pointerleave', scheduleHide);
		[...menu.querySelectorAll('button.dropdown-item')].forEach(btn=>{ const isAction = btn.id==='menu-history'||btn.id==='menu-summary'||btn.id==='menu-logout'; const isSubRoot=['menu-fitness-root','menu-food','menu-beauty-root','menu-mind-root','menu-skin-root'].includes(btn.id); if(btn.id==='menu-fitness-root'){ btn.addEventListener('pointerenter', ()=>openFitnessSub()); btn.addEventListener('focus', ()=>openFitnessSub()); } if(btn.id==='menu-food'){ btn.addEventListener('pointerenter', ()=>openFoodSub()); btn.addEventListener('focus', ()=>openFoodSub()); } btn.addEventListener('pointerenter', ()=>{ if(!isSubRoot && (!PMA_MODE || !isAction)) showPreview(btn); }); btn.addEventListener('focus', ()=>{ if(!isSubRoot && (!PMA_MODE || !isAction)) showPreview(btn); }); btn.addEventListener('pointerleave', scheduleHide); btn.addEventListener('click', (e)=>{ if(btn.dataset.disabled==='true'){ e.preventDefault(); e.stopPropagation(); return; } if(isAction && PMA_MODE){ if(btn.id==='menu-logout'){ this.logout(); closeMenu(); } } }); });
		[...menu.querySelectorAll('button.dropdown-item')].forEach(btn=>{
			if(btn.id==='menu-beauty-root'){ ['pointerenter','focus'].forEach(ev=> btn.addEventListener(ev, ()=> openBeautySub())); ['click','pointerdown'].forEach(ev=> btn.addEventListener(ev, ()=>{ openBeautySub(); openSkinSub(true); })); }
			if(btn.id==='menu-mind-root'){ btn.addEventListener('pointerenter', ()=>openMindSub()); btn.addEventListener('focus', ()=>openMindSub()); }
		});
		if(fitnessSub){ [...fitnessSub.querySelectorAll('button.dropdown-item')].forEach(btn=>{ const isAction=btn.id==='menu-history'||btn.id==='menu-summary'; btn.addEventListener('pointerenter', ()=>{ if(!PMA_MODE||!isAction) showPreview(btn); }); btn.addEventListener('focus', ()=>{ if(!PMA_MODE||!isAction) showPreview(btn); }); btn.addEventListener('pointerleave', scheduleHide); btn.addEventListener('click',(e)=>{ if(btn.dataset.disabled==='true'){ e.preventDefault(); e.stopPropagation(); return;} if(isAction){ if(btn.id==='menu-history'){ closeMenu(); const hm=document.getElementById('history-modal'); if(hm) hm.style.display='flex'; this.showHistory(); } else if(btn.id==='menu-summary'){ closeMenu(); const sm=document.getElementById('summary-modal'); if(sm) sm.style.display='flex'; this.showSummary(); } } }); }); }
		if(foodSub){ [...foodSub.querySelectorAll('button.dropdown-item')].forEach(btn=>{ const isAction=btn.id==='menu-history'||btn.id==='menu-summary'; btn.addEventListener('pointerenter', ()=>{ if(!PMA_MODE||!isAction) showPreview(btn); }); btn.addEventListener('focus', ()=>{ if(!PMA_MODE||!isAction) showPreview(btn); }); btn.addEventListener('pointerleave', scheduleHide); btn.addEventListener('click',(e)=>{ if(btn.dataset.disabled==='true'){ e.preventDefault(); e.stopPropagation(); return;} if(isAction){ if(btn.id==='menu-history'){ closeMenu(); const hm=document.getElementById('history-modal'); if(hm) hm.style.display='flex'; this.showHistory(); } else if(btn.id==='menu-summary'){ closeMenu(); const sm=document.getElementById('summary-modal'); if(sm) sm.style.display='flex'; this.showSummary(); } } }); }); }
		// Attach listeners for Skin nested root inside Beauty submenu (include key navigation)
		if(beautySub){ const skinRootBtn = beautySub.querySelector('#menu-skin-root'); if(skinRootBtn && !skinRootBtn.dataset._skinBound){ skinRootBtn.dataset._skinBound='1'; ['pointerenter','focus','click','pointerdown'].forEach(ev=> skinRootBtn.addEventListener(ev, ()=> openSkinSub())); skinRootBtn.addEventListener('keydown', e=>{ if(['ArrowRight','Enter',' '].includes(e.key)){ e.preventDefault(); openSkinSub(); setTimeout(()=> skinSub?.querySelector('button.dropdown-item')?.focus(),0); } }); }
			// Delegated safety net in case direct bindings missed (hyper-lightweight)
			beautySub.addEventListener('pointerenter', e=>{ if(e.target && e.target.id==='menu-skin-root') openSkinSub(); }); }
		const reposition=()=>{ if(!menu.classList.contains('show')) return; menu.style.left=''; menu.style.right='0'; const rect=menu.getBoundingClientRect(); if(rect.right>window.innerWidth){ menu.style.right=''; menu.style.left=Math.max(8, window.innerWidth - rect.width - 12)+'px'; } const overflowY = rect.bottom - window.innerHeight; if(overflowY>0){ const top=Math.max(8, (window.innerHeight - rect.height) - 8); menu.style.top=top+'px'; } else { menu.style.top='44px'; } };
		const openMenu=()=>{ if(menu.classList.contains('show')) return; menu.classList.add('show'); icon.classList.add('active'); icon.setAttribute('aria-expanded','true'); setTimeout(reposition,0); };
		// ensureSkinVisible removed to prevent unsolicited opening
		function closeAllExcept(ex){ if(ex!=='fitness') closeFitnessSub(); if(ex!=='food') closeFoodSub(); if(ex!=='beauty'){ closeBeautySub(); } if(ex!=='mind') closeMindSub(); }
		const closeAllTop=()=>{ closeAllExcept(null); };
		function openFitnessSub(){ if(!menu.classList.contains('show')) openMenu(); closeAllExcept('fitness'); if(fitnessSub && !fitnessSub.classList.contains('show')){ fitnessSub.classList.add('show'); fitnessSub.style.display='block'; fitnessSub.classList.add('scrollable'); repositionSubmenu(fitnessSub); document.getElementById('menu-fitness-root')?.setAttribute('aria-expanded','true'); } }
		function openFoodSub(){
			// Suppress Food submenu in PWA
			if(this.isPwaContext && this.isPwaContext()) { closeAllExcept(null); if(foodSub){ foodSub.classList.remove('show'); foodSub.style.display='none'; } return; }
			if(!menu.classList.contains('show')) openMenu(); closeAllExcept('food'); if(foodSub && !foodSub.classList.contains('show')){ foodSub.classList.add('show'); foodSub.style.display='block'; foodSub.classList.add('scrollable'); repositionSubmenu(foodSub); document.getElementById('menu-food')?.setAttribute('aria-expanded','true'); }
		}
		let __openingBeauty=false;
		let __skinAutoTimer=null; // timer for delayed Skin auto-open
		function openBeautySub(){ if(__openingBeauty) return; __openingBeauty=true; try { if(!menu.classList.contains('show')) openMenu(); closeAllExcept('beauty'); if(beautySub && !beautySub.classList.contains('show')){ beautySub.classList.add('show'); beautySub.style.display='block'; beautySub.classList.add('scrollable'); repositionSubmenu(beautySub); document.getElementById('menu-beauty-root')?.setAttribute('aria-expanded','true'); }
			// Delayed auto-open (500ms) of Skin submenu; cancel if Beauty closed or user manually opens Skin sooner
			try { if(__skinAutoTimer){ clearTimeout(__skinAutoTimer); __skinAutoTimer=null; } if(skinSub && !skinSub.classList.contains('show')) { __skinAutoTimer=setTimeout(()=>{ __skinAutoTimer=null; if(beautySub?.classList.contains('show') && !skinSub.classList.contains('show')) openSkinSub(true); }, 500); } } catch{};
		} finally { __openingBeauty=false; } }
		// Expose for console diagnostics
		if(!window.openBeautySub) window.openBeautySub = openBeautySub;
		if(!window.mbhInspectSkin){ window.mbhInspectSkin=()=>{ const s=document.getElementById('skin-submenu'); if(!s){ console.log('[skin] submenu element not found'); return;} const r=s.getBoundingClientRect(); console.log('[skin] visible=', s.classList.contains('show'), 'display=', s.style.display, 'classes=', s.className, 'rect=', {left:r.left, top:r.top, width:r.width, height:r.height}); }; }
		function openMindSub(){
			// Suppress Mind submenu in PWA
			if(this.isPwaContext && this.isPwaContext()) { closeAllExcept(null); if(mindSub){ mindSub.classList.remove('show'); mindSub.style.display='none'; } return; }
			if(!menu.classList.contains('show')) openMenu(); closeAllExcept('mind'); if(mindSub && !mindSub.classList.contains('show')){ mindSub.classList.add('show'); mindSub.style.display='block'; mindSub.classList.add('scrollable'); repositionSubmenu(mindSub); document.getElementById('menu-mind-root')?.setAttribute('aria-expanded','true'); }
		}
		function openSkinSub(_internal){ if(!menu.classList.contains('show')) openMenu(); if(__skinAutoTimer){ clearTimeout(__skinAutoTimer); __skinAutoTimer=null; } if(!beautySub?.classList.contains('show') && !_internal) openBeautySub(); if(skinSub && !skinSub.classList.contains('show')){ skinSub.classList.add('show'); skinSub.style.display='block'; skinSub.classList.add('scrollable');
			// Elevate & ensure not clipped inside menu container (must exceed menu-container z-index 1500)
			try { skinSub.style.zIndex='2000'; if(skinSub.parentElement!==document.body){ document.body.appendChild(skinSub); } } catch{}
			repositionSubmenu(skinSub,true); document.getElementById('menu-skin-root')?.setAttribute('aria-expanded','true'); } }
		// Minimal diagnostic (can be removed later)
		if(!window.__mbh_skinDebug){ window.__mbh_skinDebug=true; const _orig=openSkinSub; window.openSkinSub=function(){ _orig(); try{ console.debug('[skin] openSkinSub children=', skinSub?.children?.length); }catch(_){} }; }
		// Defensive: expose for any asynchronous references
		if(!window.openSkinSub) window.openSkinSub = openSkinSub;
		const closeFitnessSub=()=>{ if(fitnessSub){ fitnessSub.classList.remove('show'); fitnessSub.style.display='none'; } };
		const closeFoodSub=()=>{ if(foodSub){ foodSub.classList.remove('show'); foodSub.style.display='none'; } };
		const closeBeautySub=()=>{ if(__skinAutoTimer){ clearTimeout(__skinAutoTimer); __skinAutoTimer=null; } if(beautySub){ beautySub.classList.remove('show'); beautySub.style.display='none'; closeSkinSub(); } };
		const closeMindSub=()=>{ if(mindSub){ mindSub.classList.remove('show'); mindSub.style.display='none'; } };
		const closeSkinSub=()=>{ if(skinSub){ skinSub.classList.remove('show'); skinSub.style.display='none'; } };
		const closeMenu=()=>{ if(!menu.classList.contains('show')) return; menu.classList.remove('show'); icon.classList.remove('active'); icon.setAttribute('aria-expanded','false'); closeFitnessSub(); closeFoodSub(); closeBeautySub(); closeMindSub(); };
		const toggle=(e)=>{ e&&e.stopPropagation(); (menu.classList.contains('show')? closeMenu: openMenu)(); };
		icon.addEventListener('click', toggle);
		let hideMenuTimer=null;
		const regionContainsPointer=()=>{ const hovered=document.querySelectorAll(':hover'); for(const el of hovered){ if(el===icon||el===menu||el===flyout||el===fitnessSub||el===foodSub||el===beautySub||el===mindSub||el===skinSub||menu.contains(el)||flyout.contains(el)||(fitnessSub&&fitnessSub.contains(el))||(foodSub&&foodSub.contains(el))||(beautySub&&beautySub.contains(el))||(mindSub&&mindSub.contains(el))||(skinSub&&skinSub.contains(el))) return true; } return false; };
		const scheduleMenuHide=()=>{ clearTimeout(hideMenuTimer); hideMenuTimer=setTimeout(()=>{ if(!regionContainsPointer()) closeMenu(); }, UI_TIMING.MENU_HIDE_DELAY); };
		['mouseenter','focusin','pointerenter'].forEach(ev=> icon.addEventListener(ev, ()=>{ clearTimeout(hideMenuTimer); openMenu(); }));
		['mouseenter','focusin','pointerenter'].forEach(ev=> menu.addEventListener(ev, ()=> clearTimeout(hideMenuTimer)));
		if(fitnessSub){ ['mouseenter','focusin','pointerenter'].forEach(ev=> fitnessSub.addEventListener(ev, ()=> clearTimeout(hideMenuTimer))); }
		if(foodSub){ ['mouseenter','focusin','pointerenter'].forEach(ev=> foodSub.addEventListener(ev, ()=> clearTimeout(hideMenuTimer))); }
		if(beautySub){ ['mouseenter','focusin','pointerenter'].forEach(ev=> beautySub.addEventListener(ev, ()=> clearTimeout(hideMenuTimer))); }
		if(mindSub){ ['mouseenter','focusin','pointerenter'].forEach(ev=> mindSub.addEventListener(ev, ()=> clearTimeout(hideMenuTimer))); }
		['mouseleave','pointerleave'].forEach(ev=> icon.addEventListener(ev, scheduleMenuHide));
		['mouseleave','pointerleave'].forEach(ev=> menu.addEventListener(ev, scheduleMenuHide));
		if(fitnessSub){ ['mouseleave','pointerleave'].forEach(ev=> fitnessSub.addEventListener(ev, scheduleMenuHide)); }
		if(foodSub){ ['mouseleave','pointerleave'].forEach(ev=> foodSub.addEventListener(ev, scheduleMenuHide)); }
		if(beautySub){ ['mouseleave','pointerleave'].forEach(ev=> beautySub.addEventListener(ev, scheduleMenuHide)); }
		if(mindSub){ ['mouseleave','pointerleave'].forEach(ev=> mindSub.addEventListener(ev, scheduleMenuHide)); }
		['mouseenter','pointerenter'].forEach(ev=> flyout.addEventListener(ev, ()=> clearTimeout(hideMenuTimer)));
		['mouseleave','pointerleave'].forEach(ev=> flyout.addEventListener(ev, scheduleMenuHide));
		// Touch scroll persistence so submenu stays open while finger scrolling (restored from pre-refactor behavior)
		const attachTouchPersistence = (el)=>{ if(!el) return; el.addEventListener('touchstart', ()=> clearTimeout(hideMenuTimer), {passive:true}); el.addEventListener('touchmove', ()=> clearTimeout(hideMenuTimer), {passive:true}); el.addEventListener('touchend', ()=> scheduleMenuHide(), {passive:true}); };
		attachTouchPersistence(fitnessSub); attachTouchPersistence(foodSub);
		attachTouchPersistence(beautySub); attachTouchPersistence(mindSub); attachTouchPersistence(skinSub);
		// Close when clicking outside (extended to all submenus)
		document.addEventListener('pointerdown', (e)=>{ if(!icon.contains(e.target) && !menu.contains(e.target) && !(fitnessSub&&fitnessSub.contains(e.target)) && !(foodSub&&foodSub.contains(e.target)) && !(beautySub&&beautySub.contains(e.target)) && !(mindSub&&mindSub.contains(e.target)) && !(skinSub&&skinSub.contains(e.target)) && !flyout.contains(e.target)) closeMenu(); });
		// Removed legacy duplicate 'click' outside listener; unified pointerdown handler above handles all pointers.
		if(fitnessSub){ fitnessSub.addEventListener('click', (e)=>{ const btn=e.target.closest('button.dropdown-item'); if(!btn) return; if(btn.dataset.disabled==='true'){ e.preventDefault(); return;} if(btn.id==='menu-history'){ closeMenu(); const hm=document.getElementById('history-modal'); if(hm) hm.style.display='flex'; this.showHistory(); } else if(btn.id==='menu-summary'){ closeMenu(); const sm=document.getElementById('summary-modal'); if(sm) sm.style.display='flex'; this.showSummary(); } }); }
		if(foodSub){ foodSub.addEventListener('click', (e)=>{ const btn=e.target.closest('button.dropdown-item'); if(!btn) return; if(btn.dataset.disabled==='true'){ e.preventDefault(); return;} if(btn.id==='menu-history'){ closeMenu(); const hm=document.getElementById('history-modal'); if(hm) hm.style.display='flex'; this.showHistory(); } else if(btn.id==='menu-summary'){ closeMenu(); const sm=document.getElementById('summary-modal'); if(sm) sm.style.display='flex'; this.showSummary(); } }); }
		window.addEventListener('resize', reposition);
		function repositionSubmenu(sub, nested){ if(!sub) return; // vertical fit
			const rect=sub.getBoundingClientRect(); if(rect.bottom>window.innerHeight-8 || rect.top<0){ const maxHeight=Math.min(rect.height, window.innerHeight-16); sub.style.maxHeight=maxHeight+'px'; sub.classList.add('scrollable'); }
			if(nested){ // dynamic horizontal cascade for skin submenu
				const skinRootBtn=document.getElementById('menu-skin-root');
				if(skinRootBtn){ const btnRect=skinRootBtn.getBoundingClientRect(); const beautyRect=beautySub?.getBoundingClientRect();
					// Defensive: if still inside original container, move to body now (prevents overflow:hidden clipping)
					if(sub.parentElement!==document.body){ try { document.body.appendChild(sub); } catch{} }
					// Explicitly override base menu right alignment
					sub.style.right='auto'; sub.style.left='';
					const desiredWidth=240; const gap=12;
					// Prefer cascading from the right edge of the Beauty submenu panel for true adjacency
					let anchorRight = (beautyRect && beautyRect.width>0) ? beautyRect.right : btnRect.right;
					let leftPos = anchorRight + gap; let placeRight=true;
					if(leftPos + desiredWidth > window.innerWidth - 8){ // overflow -> flip to left side of Beauty panel / button
						leftPos = Math.max(8, (beautyRect ? beautyRect.left : btnRect.left) - desiredWidth - gap);
						placeRight=false;
					}
					sub.style.width=desiredWidth+'px'; sub.style.left=leftPos+'px';
					// Vertical: align near triggering button, respecting viewport
					const idealTop = btnRect.top - 8; const maxTop = window.innerHeight - (sub.offsetHeight + 8); sub.style.top = Math.max(44, Math.min(maxTop, idealTop)) + 'px';
					sub.classList.toggle('cascade-right', placeRight); sub.classList.toggle('cascade-left', !placeRight);
					// Ensure z-index dominance above menu-container (1500)
					sub.style.zIndex='2000';
				}
			}
		}
		// Keyboard navigation
		const focusable=()=>[...menu.querySelectorAll('button.dropdown-item')];
		function moveFocus(d){ const items=focusable(); if(!items.length) return; const idx=items.indexOf(document.activeElement); let t=idx+d; if(idx===-1) t=d>0?0:items.length-1; if(t<0) t=items.length-1; if(t>=items.length) t=0; items[t].focus(); }
		function focusFirst(){ const items=focusable(); if(items.length) items[0].focus(); }
		function focusLast(){ const items=focusable(); if(items.length) items[items.length-1].focus(); }
		menu.addEventListener('keydown', e=>{ switch(e.key){ case 'ArrowDown': e.preventDefault(); moveFocus(1); break; case 'ArrowUp': e.preventDefault(); moveFocus(-1); break; case 'Home': e.preventDefault(); focusFirst(); break; case 'End': e.preventDefault(); focusLast(); break; case 'Escape': closeMenu(); icon.focus(); break; case 'ArrowRight': if(document.activeElement?.id==='menu-fitness-root'){ openFitnessSub(); setTimeout(()=>fitnessSub?.querySelector('button.dropdown-item')?.focus(),0);} else if(document.activeElement?.id==='menu-food'){ openFoodSub(); setTimeout(()=>foodSub?.querySelector('button.dropdown-item')?.focus(),0);} break; case 'ArrowLeft': if(fitnessSub?.classList.contains('show') && fitnessSub.contains(document.activeElement)){ closeFitnessSub(); document.getElementById('menu-fitness-root')?.focus(); } else if(foodSub?.classList.contains('show') && foodSub.contains(document.activeElement)){ closeFoodSub(); document.getElementById('menu-food')?.focus(); } break; } });
		menu.addEventListener('keydown', e=>{ switch(e.key){ case 'ArrowRight': {
			const id=document.activeElement?.id; if(id==='menu-beauty-root'){ openBeautySub(); setTimeout(()=>beautySub?.querySelector('button.dropdown-item')?.focus(),0);} else if(id==='menu-mind-root'){ openMindSub(); setTimeout(()=>mindSub?.querySelector('button.dropdown-item')?.focus(),0);} else if(id==='menu-skin-root'){ openSkinSub(); setTimeout(()=>skinSub?.querySelector('button.dropdown-item')?.focus(),0);} break; }
			case 'ArrowLeft': {
				if(skinSub?.classList.contains('show') && skinSub.contains(document.activeElement)){ closeSkinSub(); document.getElementById('menu-skin-root')?.focus(); }
				else if(beautySub?.classList.contains('show') && beautySub.contains(document.activeElement) && document.activeElement?.id!=='menu-skin-root'){ closeBeautySub(); document.getElementById('menu-beauty-root')?.focus(); }
				else if(mindSub?.classList.contains('show') && mindSub.contains(document.activeElement)){ closeMindSub(); document.getElementById('menu-mind-root')?.focus(); }
				break; }
		}
		});
		icon.addEventListener('keydown', e=>{ if(['ArrowDown','Enter',' '].includes(e.key)){ e.preventDefault(); openMenu(); focusFirst(); } if(e.key==='Escape'){ closeMenu(); } });
	}
	// Removed duplicate late definitions of history/summary; earlier ones retained
}

// Bootstrapping
if(!window.fitnessTracker){
	document.addEventListener('DOMContentLoaded', () => {
		const splash = document.getElementById('splash-screen');
		const login = document.getElementById('loginOverlay');
		// Activity tracking to decide future splash skips
		let lastWrite = 0;
		const ACTIVITY_KEY = 'mbh_lastActive';
		const now = Date.now();
		// Determine if we should skip: existing activity within last 2 minutes
		let skipSplash = false;
		try {
			const prev = parseInt(localStorage.getItem(ACTIVITY_KEY)||'0',10);
			if(prev && (now - prev) < 120000) skipSplash = true; // < 2 minutes idle (normal condition)
		} catch{ /* ignore */ }
		// --- Testing Override -------------------------------------------------
		// To ALWAYS show splash during test sessions set one of:
		//  1) In browser console: localStorage.setItem('forceSplash','1')
		//  2) Add ?forceSplash=1 to URL once (writes flag) or ?forceSplash=0 to remove
		//  3) Set window.__FORCE_SPLASH = true before this script runs
		// This makes behavior reversible without code edits.
		try {
			const urlParams = new URLSearchParams(location.search);
			if(urlParams.has('forceSplash')){
				if(urlParams.get('forceSplash')==='1') localStorage.setItem('forceSplash','1');
				else localStorage.removeItem('forceSplash');
			}
		} catch {}
		if(window.__FORCE_SPLASH === true || localStorage.getItem('forceSplash')==='1'){
			skipSplash = false; // force show
		}
		// TEMP TEST FLAG: force splash every load regardless of recent activity.
		// Set to false or remove this block when initial testing is complete.
		const TEMP_ALWAYS_SHOW_SPLASH = true;
		if(TEMP_ALWAYS_SHOW_SPLASH){ skipSplash = false; }
		// ----------------------------------------------------------------------
		// Register lightweight activity listeners (throttled writes)
		const record = () => {
			const t = Date.now();
			if(t - lastWrite > 5000){
				lastWrite = t;
				try { localStorage.setItem(ACTIVITY_KEY, String(t)); } catch{/* ignore */}
			}
		};
		['click','keydown','mousemove','touchstart','pointerdown','focus'].forEach(ev=>window.addEventListener(ev, record, { passive:true }));
		// Immediately mark current load as activity
		record();
		// Splash logic
		if(skipSplash){
			if(login) login.style.display='block';
			if(splash) splash.remove();
		} else {
			// Pre-render login behind splash (hidden) so swap is instantaneous (4s animation)
			if(login){
				login.style.display='block';
				login.style.visibility='hidden';
			}
			// Keep splash for full 3.5s fade-in animation, then atomic reveal
			setTimeout(()=>{
				if(login) login.style.visibility='visible';
				if(splash) splash.remove();
			},3500); // matches splash animation duration
		}

		// Password reveal eye toggle (accessible) --------------------------------------------------
		try {
			const pwd = document.getElementById('password');
			const eye = document.getElementById('passwordEye');
			if(pwd && eye){
				// ARIA / a11y enhancements without altering snapshot styling
				if(!eye.hasAttribute('role')) eye.setAttribute('role','button');
				if(!eye.hasAttribute('tabindex')) eye.setAttribute('tabindex','0');
				eye.setAttribute('aria-label','Show password');
				eye.setAttribute('aria-pressed','false');
				const toggle = () => {
					const showing = pwd.type === 'text';
					pwd.type = showing ? 'password' : 'text';
					// Swap icon subtly to indicate state (falls back gracefully if emoji unsupported)
					eye.textContent = showing ? '👁' : '🙈';
					eye.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
					eye.setAttribute('aria-pressed', showing ? 'false' : 'true');
					// Keep focus on eye for keyboard users
					eye.focus();
				};
				eye.addEventListener('click', toggle);
				eye.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggle(); }});
			}
		} catch(err){ console.warn('[password-eye]', err); }
		// -------------------------------------------------------------------------------------------
		window.fitnessTracker = new FitnessTracker();
	});
}
// Global load pass to ensure final banner/header heights captured
window.addEventListener('load', ()=>{
	try { if(window.fitnessTracker && typeof window.fitnessTracker.computeChromeInsets==='function'){ window.fitnessTracker.computeChromeInsets(true); setTimeout(()=> window.fitnessTracker.computeChromeInsets(true), 80); } } catch{}
});
// Preserve existing modal click handlers if any

// Service Worker update helper: show version + auto refresh when new activated
if('serviceWorker' in navigator){
	navigator.serviceWorker.addEventListener('message', (e)=>{
		if(e.data?.type==='SW_ACTIVATED'){
			const ver = e.data.version;
			const tagId='sw-version-tag';
			let tag=document.getElementById(tagId);
			if(!tag){ tag=document.createElement('div'); tag.id=tagId; tag.style.cssText='position:fixed;bottom:6px;right:8px;background:rgba(0,0,0,.55);color:#fff;font-size:11px;padding:3px 6px;border-radius:4px;z-index:9999;font-family:system-ui'; document.body.appendChild(tag); }
			tag.textContent='SW '+ver;
		}
	});
	// Trigger waiting SW to activate immediately if present
	navigator.serviceWorker.getRegistration().then(reg=>{
		if(reg && reg.waiting){ reg.waiting.postMessage({type:'SKIP_WAITING'}); }
	});
	// Ensure registration (extras.js not included in this HTML now)
	window.addEventListener('load', ()=>{
		// placeholder for any SW-loaded UI hooks
	});
}

// --- Defensive Patch: Ensure checkForDataRecovery exists even if older cached bundle missing method loads ---
try {
	if (window.FitnessTracker && !FitnessTracker.prototype.checkForDataRecovery) {
		console.warn('[patch] Adding missing checkForDataRecovery stub (cached older script)');
		FitnessTracker.prototype.checkForDataRecovery = async function(){ /* no-op fallback */ };
	}
} catch(_) {}
