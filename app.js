/* Simple SPA logic + demo data */
(function(){
  const API_BASE_URL = 'http://localhost:4000/api';
  const $ = (q, root=document) => root.querySelector(q);
  const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));

  // Splash is a persistent hero at the top; no auto-hide

// Basic state
  const state = {
    user: JSON.parse(localStorage.getItem('doctorUser')) || null,
    token: localStorage.getItem('doctorToken') || null,
    patients: [], // Will be loaded from API
    firstLoad: true,
    currentPatientId: null,
    currentVitalId: null,
  };

  const splash = document.getElementById('splash');
  const loginView = $('#login-view');
  const dashView = $('#dashboard-view');
  const patientView = $('#patient-view');
  const profileView = $('#profile-view');
  const aboutView = $('#about-view');
  const scrollNextBtn = $('#scrollNext');
  const addPatientBtn = $('#addPatientBtn');
  const addPatientModal = $('#addPatientModal');
  const addPatientForm = $('#addPatientForm');
  const closeAddPatient = $('#closeAddPatient');
  const cancelAddPatient = $('#cancelAddPatient');
  const addPatientBackdrop = $('#addPatientBackdrop');

  // Smooth scroll from splash CTA to login form
  if (scrollNextBtn) {
    scrollNextBtn.addEventListener('click', () => {
      const loginSection = document.getElementById('login-view');
      if (loginSection) {
        loginSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Also focus the email field for faster login
      const emailInput = document.getElementById('email');
      if (emailInput) {
        emailInput.focus();
      }
    });
  }

  // Add Patient modal controls
  function showAddPatientModal(){
    if (!addPatientModal) return;
    addPatientModal.classList.remove('hidden');
  }

  function hideAddPatientModal(){
    if (!addPatientModal) return;
    addPatientModal.classList.add('hidden');
  }

  if (addPatientBtn) {
    addPatientBtn.addEventListener('click', () => {
      if (!state.token) {
        window.location.hash = '#/login';
        return;
      }
      showAddPatientModal();
    });
  }

  [closeAddPatient, cancelAddPatient, addPatientBackdrop].forEach(el => {
    if (el) el.addEventListener('click', hideAddPatientModal);
  });

  // Login handling (real auth)
  async function handleLogin(e){
    if(e) e.preventDefault();
    const email = $('#email').value.trim();
    const password = $('#password').value;
    if(!email || !password){ return false; }
    const btn = $('#loginBtn');
    if(!btn) return false;
    
    btn.classList.add('loading');
    const prev = btn.textContent; btn.textContent = 'Signing in…';
    btn.disabled = true;
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
  
      // Assuming backend sends { token, user: { name, email, ... } }
      state.user = data.user;
      state.token = data.token;
      localStorage.setItem('doctorUser', JSON.stringify(data.user));
      localStorage.setItem('doctorToken', data.token);
  
      updateHeader();
      window.location.hash = '#/dashboard';
    } catch (err) {
      console.error(err);
      alert(err.message); // Simple error feedback
    } finally {
      btn.disabled = false; btn.classList.remove('loading'); btn.textContent = prev;
    }
    return false;
  }
  
  async function fetchPatients() {
    if (!state.token) {
      return showView('login'); // Redirect to login if no token
    }
    try {
      const res = await fetch(`${API_BASE_URL}/patients`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });

      if (res.status === 401) {
         $('#logoutBtn').click(); // Token expired or invalid
         return;
      }
      if (!res.ok) {
         throw new Error('Failed to fetch patients');
      }
      
      state.patients = await res.json(); // Expects an array of patients
      renderDashboard(); // Now render with the fetched data
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  const lf = $('#loginForm');
  if(lf){ lf.addEventListener('submit', handleLogin); }
  const lb = $('#loginBtn');
  if(lb){ lb.addEventListener('click', handleLogin); }

  if (addPatientForm) {
    addPatientForm.addEventListener('submit', handleAddPatientSubmit);
  }

  $('#logoutBtn').addEventListener('click', ()=>{
    state.user = null;
    state.token = null;
    localStorage.removeItem('doctorUser');
    localStorage.removeItem('doctorToken');
    updateHeader();
    if (splash) splash.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.location.hash = '#/login';
  });

  function updateHeader(){
    $('#doctorName').textContent = state.user ? state.user.name : '';
    $('#profileName').textContent = state.user ? state.user.name : '—';
    $('#profileEmail').textContent = state.user ? state.user.email : '—';
  }

  // Router (hash)
  window.addEventListener('hashchange', route);
  function route(){
    const hash = window.location.hash || '';
    const [_, page, id] = hash.split('/');
    showView(page, id);
    setActiveTab(page);
    if (state.user) {
      updateHeader();
    }
    state.firstLoad = false;
  }

  function showView(page, id){
    const authed = !!state.token;
    // Hide all views first
    loginView && loginView.classList.add('hidden');
    aboutView && aboutView.classList.add('hidden');
    dashView.classList.add('hidden');
    patientView.classList.add('hidden');
    profileView.classList.add('hidden');

    if(!authed){
      // Unauthenticated: show login + splash
      if (splash) splash.style.display = 'block';
      loginView.classList.remove('hidden'); 
      initLoginBot();
      if(page === 'about'){ aboutView.classList.remove('hidden'); }
      return;
    }

    // Authenticated: hide login view and splash hero
    loginView && loginView.classList.add('hidden');
    if (splash) splash.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'auto' });

    switch(page){
      case 'dashboard':
        dashView.classList.remove('hidden');
        fetchPatients();
        break;
      case 'patient':
        patientView.classList.remove('hidden');
        renderPatient(id);
        break;
      case 'profile':
        profileView.classList.remove('hidden');
        break;
      case 'about':
        aboutView && aboutView.classList.remove('hidden');
        break;
      default:
        dashView.classList.remove('hidden');
        window.location.hash = '#/dashboard';
    }
  }

  // Initial route
  route();

  // Dashboard rendering
  $('#search').addEventListener('input', renderDashboard);
  function renderDashboard(){
    const query = $('#search').value?.toLowerCase() || '';
    const grid = $('#patientsGrid');
    grid.innerHTML = '';

    state.patients
      .filter(p => p.name.toLowerCase().includes(query) || (p._id && p._id.toLowerCase().includes(query)))
      .forEach(p => grid.appendChild(patientCard(p)));
  }

  function patientCard(p){
    const el = document.createElement('div');
    el.className = 'card pcard';

    el.innerHTML = `
      <div class="row">
        <div>
          <div style="font-weight:700">${p.name}</div>
          <div class="small">MRN: ${p._id}</div>
        </div>
        <span class="pill status-pill">
          <span class="dot"></span>
          <span class="label">—</span>
        </span>
      </div>
      <div class="metric-grid" style="min-height: 80px; align-content: center; padding: 1.25rem 0;">
        <div class="metric">
          <div class="label">BP</div>
          <div class="value"><span data-bp>—</span></div>
          <div class="unit">mmHg</div>
        </div>
        <div class="metric">
          <div class="label">Sugar</div>
          <div class="value"><span data-sugar>—</span></div>
          <div class="unit">mg/dL</div>
        </div>
        <div class="metric">
          <div class="label">Pulse</div>
          <div class="value"><span data-pulse>—</span></div>
          <div class="unit">bpm</div>
        </div>
      </div>
      <div class="card-foot small" data-updated>Updated —</div>
    `;

    // Async load of latest vitals for this patient
    loadLatestVitalForCard(p, el);

    el.style.cursor = 'pointer';
    el.addEventListener('click', ()=>{
      window.location.hash = `#/patient/${p._id}`;
    });
    return el;
  }

  async function loadLatestVitalForCard(patient, cardEl){
    if (!state.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/vitals/patient/${patient._id}?limit=1`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      if (!res.ok) {
        // Leave placeholders if vitals cannot be loaded
        return;
      }
      const arr = await res.json();
      if (!Array.isArray(arr) || arr.length === 0) {
        const upd = cardEl.querySelector('[data-updated]');
        if (upd) upd.textContent = 'No vitals yet';
        const pill = cardEl.querySelector('.status-pill');
        const labelEl = pill && pill.querySelector('.label');
        if (pill && labelEl) {
          pill.className = 'pill status-pill warn';
          labelEl.textContent = 'No data';
        }
        return;
      }

      const v = arr[0];
      const read = {
        bp: {
          sys: v.bloodPressure?.systolic ?? null,
          dia: v.bloodPressure?.diastolic ?? null,
        },
        sugar: v.sugarMgDl ?? null,
        pulse: v.pulse ?? null,
      };

      const bpSpan = cardEl.querySelector('[data-bp]');
      const sugarSpan = cardEl.querySelector('[data-sugar]');
      const pulseSpan = cardEl.querySelector('[data-pulse]');
      if (bpSpan) {
        bpSpan.textContent =
          read.bp.sys != null && read.bp.dia != null
            ? `${read.bp.sys}/${read.bp.dia}`
            : '—';
      }
      if (sugarSpan) sugarSpan.textContent = read.sugar != null ? read.sugar : '—';
      if (pulseSpan) pulseSpan.textContent = read.pulse != null ? read.pulse : '—';

      const level = alertLevel(read); // 'ok' | 'warn' | 'crit'
      const pill = cardEl.querySelector('.status-pill');
      const labelEl = pill && pill.querySelector('.label');
      if (pill && labelEl) {
        pill.className = `pill status-pill ${level}`;
        labelEl.textContent = levelLabel(level);
      }

      const updatedEl = cardEl.querySelector('[data-updated]');
      if (updatedEl && v.timestamp) {
        const d = new Date(v.timestamp);
        updatedEl.textContent = timeAgoLabel(d);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Patient view
  let vitalFormInited = false;
  async function renderPatient(id){
    if (!state.token) {
      return showView('login');
    }
  
    state.currentPatientId = id;

    // Ensure form handler is wired once
    initVitalForm();

    // Clear previous patient's state
    $('#alerts').innerHTML = '';
    $('#currentReadings').innerHTML = '';

    try {
      // 1. Fetch patient details
      const patientRes = await fetch(`${API_BASE_URL}/patients/${id}`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      if (patientRes.status === 401) return $('#logoutBtn').click();
      if (!patientRes.ok) throw new Error('Failed to load patient details.');
      const p = await patientRes.json();
  
      // 2. Fetch patient vitals
      const vitalsRes = await fetch(`${API_BASE_URL}/vitals/patient/${id}`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      if (vitalsRes.status === 401) return $('#logoutBtn').click();
      if (!vitalsRes.ok) throw new Error('Failed to load patient vitals.');
      const backendVitals = await vitalsRes.json();

      // Track latest vital for update form
      state.currentVitalId = backendVitals.length ? backendVitals[0]._id : null;
  
      // 3. Map backend vitals to frontend history format
      // Backend: { timestamp, bloodPressure: { systolic, diastolic }, sugarMgDl, pulse }
      // Frontend: { time, bp: { sys, dia }, sugar, pulse }
      const history = backendVitals.map(v => ({
        id: v._id,
        time: v.timestamp,
        bp: { 
          sys: v.bloodPressure?.systolic, 
          dia: v.bloodPressure?.diastolic 
        },
        sugar: v.sugarMgDl,
        pulse: v.pulse,
        notes: v.notes
      })).sort((a, b) => new Date(a.time) - new Date(b.time)); // Ensure sorted
  
      // 4. Start rendering
      $('#patientHeader').innerHTML = `<div><h2>${p.name}</h2><div class="small">MRN: ${p._id}</div></div><span id="patientStatusPill" class="pill"><span class="dot"></span><span class="label"></span></span>`;

      if (!history.length) {
         $('#alerts').appendChild(alert('No vitals recorded for this patient yet.', 'warn'));
         return;
      }
  
      // 5. Continue with existing render logic, using fetched data
      const latest = history[history.length-1];

      // Status pill in header based on latest reading
      const level = alertLevel(latest);
      const pill = document.getElementById('patientStatusPill');
      if (pill) {
        pill.className = `pill ${level}`;
        const labelEl = pill.querySelector('.label');
        const dotEl = pill.querySelector('.dot');
        if (labelEl) labelEl.textContent = levelLabel(level);
        if (dotEl) dotEl.className = `dot ${level}`;
      }

      // Current vitals card
      $('#currentReadings').innerHTML = `
        ${stat('Blood Pressure', `${latest.bp.sys || 'N/A'}/${latest.bp.dia || 'N/A'} mmHg`)}
        ${stat('Sugar', `${latest.sugar || 'N/A'} mg/dL`)}
        ${stat('Pulse', `${latest.pulse || 'N/A'} bpm`)}
      `;

      // Prefill form with latest readings so doctor can update
      prefillVitalFormFromLatest(backendVitals[0]);
  
      // Alerts
      const msgs = detectAlerts(history);
      const alerts = $('#alerts');
      if(msgs.length === 0){
        alerts.appendChild(alert('All vitals in acceptable range.', 'ok'));
      } else {
        msgs.forEach(m => alerts.appendChild(alert(m.message, m.level)));
      }

    } catch (err) {
       console.error(err);
       alert(err.message);
    }
  }

  function initVitalForm(){
    if (vitalFormInited) return;
    const form = document.getElementById('vitalForm');
    if (!form) return;
    vitalFormInited = true;
    form.addEventListener('submit', handleVitalSubmit);
    const updateBtn = document.getElementById('updateVitalBtn');
    if (updateBtn) updateBtn.addEventListener('click', handleVitalUpdate);
  }

  async function handleVitalSubmit(e){
    e.preventDefault();
    if (!state.token || !state.currentPatientId) {
      alert('Please log in again.');
      return;
    }
    const sysEl = document.getElementById('vital_sys');
    const diaEl = document.getElementById('vital_dia');
    const sugarEl = document.getElementById('vital_sugar');
    const pulseEl = document.getElementById('vital_pulse');
    const notesEl = document.getElementById('vital_notes');
    const btn = document.getElementById('saveVitalBtn');

    const bpSys = sysEl.value ? Number(sysEl.value) : undefined;
    const bpDia = diaEl.value ? Number(diaEl.value) : undefined;
    const sugar = sugarEl.value ? Number(sugarEl.value) : undefined;
    const pulse = pulseEl.value ? Number(pulseEl.value) : undefined;
    const notes = notesEl.value.trim() || undefined;

    if (bpSys == null && bpDia == null && sugar == null && pulse == null) {
      alert('Enter at least one vital value to save.');
      return;
    }

    const payload = {
      patient: state.currentPatientId,
      bloodPressure: {
        ...(bpSys != null ? { systolic: bpSys } : {}),
        ...(bpDia != null ? { diastolic: bpDia } : {}),
      },
      ...(sugar != null ? { sugarMgDl: sugar } : {}),
      ...(pulse != null ? { pulse } : {}),
      ...(notes ? { notes } : {}),
    };

    try {
      btn.classList.add('loading');
      const res = await fetch(`${API_BASE_URL}/vitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (data.errors && data.errors.join(', ')) || 'Failed to save vital');
      }

      // Clear inputs for next entry
      sysEl.value = '';
      diaEl.value = '';
      sugarEl.value = '';
      pulseEl.value = '';
      notesEl.value = '';

      // Re-render patient to pull updated vitals & charts
      renderPatient(state.currentPatientId);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      btn.classList.remove('loading');
    }
  }

  async function handleVitalUpdate(){
    if (!state.token || !state.currentPatientId || !state.currentVitalId) {
      alert('No current reading to update. Please add a reading first.');
      return;
    }

    const sysEl = document.getElementById('vital_sys');
    const diaEl = document.getElementById('vital_dia');
    const sugarEl = document.getElementById('vital_sugar');
    const pulseEl = document.getElementById('vital_pulse');
    const notesEl = document.getElementById('vital_notes');
    const btn = document.getElementById('updateVitalBtn');

    const bpSys = sysEl.value ? Number(sysEl.value) : undefined;
    const bpDia = diaEl.value ? Number(diaEl.value) : undefined;
    const sugar = sugarEl.value ? Number(sugarEl.value) : undefined;
    const pulse = pulseEl.value ? Number(pulseEl.value) : undefined;
    const notes = notesEl.value.trim() || undefined;

    if (bpSys == null && bpDia == null && sugar == null && pulse == null && !notes) {
      alert('Enter at least one value to update.');
      return;
    }

    const payload = {
      bloodPressure: {
        ...(bpSys != null ? { systolic: bpSys } : {}),
        ...(bpDia != null ? { diastolic: bpDia } : {}),
      },
      ...(sugar != null ? { sugarMgDl: sugar } : {}),
      ...(pulse != null ? { pulse } : {}),
      ...(notes ? { notes } : {}),
    };

    try {
      btn.classList.add('loading');
      const res = await fetch(`${API_BASE_URL}/vitals/${state.currentVitalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (data.errors && data.errors.join(', ')) || 'Failed to update vital');
      }

      // Refresh detail view
      renderPatient(state.currentPatientId);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      btn.classList.remove('loading');
    }
  }

  function prefillVitalFormFromLatest(v){
    const sysEl = document.getElementById('vital_sys');
    const diaEl = document.getElementById('vital_dia');
    const sugarEl = document.getElementById('vital_sugar');
    const pulseEl = document.getElementById('vital_pulse');
    const notesEl = document.getElementById('vital_notes');
    if (!sysEl || !diaEl || !sugarEl || !pulseEl || !notesEl) return;

    if (!v) {
      sysEl.value = '';
      diaEl.value = '';
      sugarEl.value = '';
      pulseEl.value = '';
      notesEl.value = '';
      return;
    }

    sysEl.value = v.bloodPressure?.systolic ?? '';
    diaEl.value = v.bloodPressure?.diastolic ?? '';
    sugarEl.value = v.sugarMgDl ?? '';
    pulseEl.value = v.pulse ?? '';
    notesEl.value = v.notes ?? '';
  }

  function setActiveTab(page){
    $$('.tabs a').forEach(a=>{
      if(a.dataset.tab === page) a.classList.add('active');
      else a.classList.remove('active');
    });
  }

  function initLoginBot(){
    if(state._loginBotInited) return; state._loginBotInited = true;
    const bot = document.getElementById('loginBot');
    const emailInput = document.getElementById('email');
    const pwdInput = document.getElementById('password');
    const btn = document.getElementById('loginBtn');
    if(!bot || !emailInput || !pwdInput || !btn) return;
    emailInput.addEventListener('focus', ()=> bot.classList.add('wave'));
    emailInput.addEventListener('blur', ()=> bot.classList.remove('wave'));
    pwdInput.addEventListener('focus', ()=> bot.classList.add('cover-eyes'));
    pwdInput.addEventListener('blur', ()=> bot.classList.remove('cover-eyes'));
    btn.addEventListener('click', ()=>{
      bot.classList.add('thumbs-up');
      setTimeout(()=> bot.classList.remove('thumbs-up'), 1200);
    });
  }

  function baseChartOptions(gridColor, refLines){
    return {
      responsive: true,
      scales: {
        x: { grid: { color: gridColor } },
        y: { grid: { color: gridColor } }
      },
      plugins: {
        legend: { display: true, labels: { boxWidth: 10 } },
        annotation: refLines ? {
          annotations: {}
        } : undefined
      }
    };
  }

  async function handleAddPatientSubmit(e){
    e.preventDefault();
    if (!state.token) {
      alert('Please log in again.');
      return;
    }

    const nameEl = document.getElementById('ap_name');
    const dobEl = document.getElementById('ap_dob');
    const genderEl = document.getElementById('ap_gender');
    const contactEl = document.getElementById('ap_contact');
    const mrnEl = document.getElementById('ap_mrn');

    const name = nameEl.value.trim();
    const dob = dobEl.value;
    const gender = genderEl.value;
    const contact = contactEl.value.trim();
    const mrn = mrnEl.value.trim();

    if (!name) {
      alert('Name is required');
      return;
    }

    const payload = {
      name,
      ...(dob ? { dob } : {}),
      ...(gender ? { gender } : {}),
      ...(contact ? { contact } : {}),
      ...(mrn ? { meta: { mrn } } : {}),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (data.errors && data.errors.join(', ')) || 'Failed to create patient');
      }

      hideAddPatientModal();
      // Clear fields
      nameEl.value = '';
      dobEl.value = '';
      genderEl.value = '';
      contactEl.value = '';
      mrnEl.value = '';

      // Refresh dashboard list
      fetchPatients();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  function stat(label, value){
    return `<div class="stat"><div class="small">${label}</div><div style="font-weight:600">${value}</div></div>`;
  }

  function alert(text, level){
    const el = document.createElement('div');
    el.className = `alert ${level}`;
    el.textContent = text;
    return el;
  }

  function levelLabel(l){
    return l === 'ok' ? 'Normal' : l === 'warn' ? 'Warning' : 'Critical';
  }

  function alertLevel(read){
    let score = 0;
    if(read.bp.sys >= 140 || read.bp.dia >= 90) score += 2;
    else if(read.bp.sys >= 130 || read.bp.dia >= 85) score += 1;

    if(read.sugar >= 200 || read.sugar <= 60) score += 2;
    else if(read.sugar >= 160 || read.sugar <= 70) score += 1;

    if(read.pulse >= 120 || read.pulse <= 45) score += 2;
    else if(read.pulse >= 100 || read.pulse <= 55) score += 1;

    return score >= 3 ? 'crit' : score >= 1 ? 'warn' : 'ok';
  }

  function detectAlerts(history){
    const last = history[history.length-1];
    const alerts = [];
    const level = alertLevel(last);
    if(level === 'crit') alerts.push({ level, message: 'Critical readings detected. Immediate attention recommended.'});
    if(level === 'warn') alerts.push({ level, message: 'Some readings outside ideal range. Monitor closely.'});

    // Simple trend detection: last 5 points rising for sugar or pulse
    const win = history.slice(-5);
    if(win.length >= 4){
      const rising = (arr) => arr.every((v,i,src)=> i===0 || v >= src[i-1]);
      const sugarRise = rising(win.map(h=>h.sugar));
      const pulseRise = rising(win.map(h=>h.pulse));
      if(sugarRise) alerts.push({ level:'warn', message:'Upward trend in glucose over recent checks.'});
      if(pulseRise) alerts.push({ level:'warn', message:'Gradual increase in pulse detected.'});
    }
    return alerts;
  }

  function timeAgoLabel(date){
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60 * 1000) return 'Updated just now';
    const mins = Math.round(diffMs / (60 * 1000));
    if (mins < 60) return `Updated ${mins} minute${mins === 1 ? '' : 's'} ago`;
    const hours = Math.round(mins / 60);
    return `Updated about ${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  
})();
