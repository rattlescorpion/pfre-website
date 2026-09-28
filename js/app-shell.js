/* ══════════════════════════════════════════════════════════════
   PFRE App Shell — shared cross-module features for admin-side pages
   Keyboard shortcuts (Shift+/) · Breadcrumbs · Auto-logout warning
   Activity log timeline · Voice navigation (Web Speech API)
   Single drop-in: <script src="js/app-shell.js"></script>
   Injects its own CSS at runtime — no separate stylesheet needed.
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Page registry: drives breadcrumbs + voice nav + Alt-key shortcuts ── */
  const MODULES = {
    'admin.html':      { label: 'Dashboard',  section: 'Overview', alt: 'd', voice: ['dashboard', 'admin', 'home', 'overview'] },
    'crm.html':        { label: 'CRM',        section: 'Sales',    alt: 'c', voice: ['crm', 'leads', 'pipeline', 'sales'] },
    'hrms.html':       { label: 'HRMS',       section: 'People',   alt: 'h', voice: ['hrms', 'hr', 'employees', 'payroll', 'people'] },
    'analytics.html':  { label: 'Analytics',  section: 'Insights', alt: 'a', voice: ['analytics', 'reports', 'insights', 'stats'] },
    'properties.html': { label: 'Properties', section: 'Listings', alt: 'p', voice: ['properties', 'listings', 'inventory listings'] },
    'cms.html':        { label: 'CMS',        section: 'Content',  alt: 'm', voice: ['cms', 'content', 'blog'] },
    'reminders.html':  { label: 'Reminders',  section: 'Tasks',    alt: 'r', voice: ['reminders', 'tasks', 'followups', 'follow ups'] },
    'compare.html':    { label: 'Compare',    section: 'Listings', voice: ['compare', 'comparison'] },
    'card.html':       { label: 'My Card',    section: 'Account',  voice: ['card', 'profile'] },
    'finance.html':    { label: 'Finance',    section: 'ERP',      alt: 'f', voice: ['finance', 'accounting', 'money', 'erp finance'] },
    'legal.html':      { label: 'Legal',      section: 'ERP',      alt: 'l', voice: ['legal', 'agreements', 'wills', 'legal center'] },
    'inventory.html':  { label: 'Inventory',  section: 'ERP',      alt: 'i', voice: ['inventory', 'stock', 'assets', 'rems'] },
    'schedule.html':   { label: "Today's Schedule", section: 'Workspace', alt: 's', voice: ['schedule', 'today', 'visits', 'appointments'] },
  };
  const CURRENT_FILE = (location.pathname.split('/').pop() || 'index.html');
  const CURRENT = MODULES[CURRENT_FILE] || { label: 'Home', section: '' };

  /* ── Shared CSS, injected once ── */
  const style = document.createElement('style');
  style.textContent = `
    #pfre-shell-breadcrumb{display:flex;align-items:center;gap:6px;padding:8px 24px;font-size:12px;
      color:var(--text-muted,#94A3B8);background:var(--card,#0F1729);border-bottom:1px solid var(--border,#1A2744);
      position:sticky;top:0;z-index:40;flex-wrap:wrap}
    #pfre-shell-breadcrumb a{color:inherit;text-decoration:none}
    #pfre-shell-breadcrumb a:hover{color:var(--blue,#3B82F6)}
    #pfre-shell-breadcrumb .sep{opacity:.5}
    #pfre-shell-breadcrumb .current{color:var(--text,#E2E8F0);font-weight:600}

    .pfre-shell-fab-row{position:fixed;bottom:20px;right:20px;z-index:900;display:flex;flex-direction:column;gap:10px;align-items:flex-end}
    .pfre-shell-fab{width:46px;height:46px;border-radius:50%;background:var(--blue,#3B82F6);color:#fff;border:none;
      box-shadow:0 6px 20px rgba(0,0,0,.25);cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;
      transition:transform .15s}
    .pfre-shell-fab:hover{transform:scale(1.08)}
    .pfre-shell-fab.listening{background:#EF4444;animation:pfre-pulse 1.2s infinite}
    @keyframes pfre-pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.5)}50%{box-shadow:0 0 0 10px rgba(239,68,68,0)}}
    .pfre-shell-fab-label{position:fixed;bottom:0;right:0;background:#111;color:#fff;font-size:11px;padding:4px 8px;
      border-radius:6px;opacity:0;pointer-events:none;transition:opacity .15s;white-space:nowrap}

    .pfre-shell-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:none;
      align-items:center;justify-content:center;padding:20px}
    .pfre-shell-overlay.open{display:flex}
    .pfre-shell-panel{background:var(--card,#0F1729);color:var(--text,#E2E8F0);border-radius:14px;max-width:520px;width:100%;
      max-height:80vh;overflow-y:auto;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.4);border:1px solid var(--border,#1A2744)}
    .pfre-shell-panel h3{font-size:16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between}
    .pfre-shell-panel .close-x{cursor:pointer;font-size:18px;color:var(--text-muted,#94A3B8);background:none;border:none}
    .pfre-shell-shortcut-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;
      border-bottom:1px solid rgba(255,255,255,.06);font-size:13px}
    .pfre-shell-kbd{background:rgba(255,255,255,.08);border:1px solid var(--border,#1A2744);border-radius:5px;
      padding:2px 8px;font-family:monospace;font-size:11px}

    .pfre-shell-timeline-item{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:12.5px}
    .pfre-shell-timeline-dot{width:8px;height:8px;border-radius:50%;background:var(--blue,#3B82F6);margin-top:5px;flex-shrink:0}
    .pfre-shell-timeline-mod{display:inline-block;font-size:10px;font-weight:700;padding:1px 7px;border-radius:100px;
      background:rgba(59,130,246,.15);color:var(--blue,#3B82F6);margin-right:6px}

    .pfre-idle-warning{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:1200;display:none;
      align-items:center;justify-content:center}
    .pfre-idle-warning.open{display:flex}
    .pfre-idle-box{background:var(--card,#0F1729);color:var(--text,#E2E8F0);border-radius:14px;padding:28px;
      max-width:380px;text-align:center;border:1px solid var(--border,#1A2744)}
    .pfre-idle-box .count{font-size:32px;font-weight:800;color:#EF4444;margin:10px 0}
    .pfre-idle-actions{display:flex;gap:10px;margin-top:16px}
    .pfre-idle-actions button{flex:1;padding:10px;border-radius:8px;border:none;cursor:pointer;font-weight:600;font-size:13px}
    .pfre-idle-stay{background:var(--blue,#3B82F6);color:#fff}
    .pfre-idle-out{background:rgba(255,255,255,.08);color:var(--text,#E2E8F0)}
  `;
  document.head.appendChild(style);

  /* ══════════════════════════════════════════════
     1. BREADCRUMB NAVIGATION
  ═══════════════════════════════════════════════ */
  function renderBreadcrumb() {
    const bar = document.createElement('div');
    bar.id = 'pfre-shell-breadcrumb';
    bar.setAttribute('role', 'navigation');
    bar.setAttribute('aria-label', 'Breadcrumb');
    bar.innerHTML = `
      <a href="admin.html">🏠 Home</a>
      ${CURRENT.section ? `<span class="sep">/</span><span>${CURRENT.section}</span>` : ''}
      <span class="sep">/</span><span class="current">${CURRENT.label}</span>
    `;
    document.body.insertBefore(bar, document.body.firstChild);
  }

  /* ══════════════════════════════════════════════
     2. KEYBOARD SHORTCUTS MODAL (Shift + /)
  ═══════════════════════════════════════════════ */
  const SHORTCUTS = [
    { keys: 'Shift + /', desc: 'Show this shortcuts panel' },
    { keys: 'Esc',       desc: 'Close any open modal or panel' },
    { keys: 'Alt + D',   desc: 'Go to Dashboard' },
    { keys: 'Alt + C',   desc: 'Go to CRM' },
    { keys: 'Alt + H',   desc: 'Go to HRMS' },
    { keys: 'Alt + A',   desc: 'Go to Analytics' },
    { keys: 'Alt + P',   desc: 'Go to Properties' },
    { keys: 'Alt + R',   desc: 'Go to Reminders' },
  ];

  function buildOverlay(id, panelHtml) {
    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'pfre-shell-overlay';
    overlay.innerHTML = `<div class="pfre-shell-panel">${panelHtml}</div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
    document.body.appendChild(overlay);
    return overlay;
  }

  const shortcutsOverlay = buildOverlay('pfre-shortcuts-modal', `
    <h3>⌨️ Keyboard Shortcuts <button class="close-x" onclick="document.getElementById('pfre-shortcuts-modal').classList.remove('open')">✕</button></h3>
    ${SHORTCUTS.map(s => `<div class="pfre-shell-shortcut-row"><span>${s.desc}</span><span class="pfre-shell-kbd">${s.keys}</span></div>`).join('')}
    <p style="margin-top:14px;font-size:11px;color:var(--text-muted,#94A3B8)">Press <span class="pfre-shell-kbd">Shift + /</span> anywhere to reopen this panel.</p>
  `);

  /* ══════════════════════════════════════════════
     3. AUTO-LOGOUT WARNING (30 min inactivity)
  ═══════════════════════════════════════════════ */
  const IDLE_LIMIT_MS = 30 * 60 * 1000;
  const WARN_BEFORE_MS = 60 * 1000; // show the warning 60s before auto-logout fires
  let idleTimer, warnTimer, countdownInterval;

  const idleOverlay = document.createElement('div');
  idleOverlay.className = 'pfre-idle-warning';
  idleOverlay.innerHTML = `
    <div class="pfre-idle-box">
      <div style="font-size:32px">⏱️</div>
      <h3 style="margin:8px 0 0">You've been idle</h3>
      <p style="font-size:13px;color:var(--text-muted,#94A3B8);margin-top:6px">For your security, you'll be signed out in</p>
      <div class="count" id="pfre-idle-count">60</div>
      <div class="pfre-idle-actions">
        <button class="pfre-idle-stay" id="pfre-idle-stay-btn">Stay Signed In</button>
        <button class="pfre-idle-out" id="pfre-idle-out-btn">Log Out Now</button>
      </div>
    </div>`;
  document.body.appendChild(idleOverlay);

  function showIdleWarning() {
    idleOverlay.classList.add('open');
    let remaining = Math.floor(WARN_BEFORE_MS / 1000);
    document.getElementById('pfre-idle-count').textContent = remaining;
    countdownInterval = setInterval(() => {
      remaining -= 1;
      const el = document.getElementById('pfre-idle-count');
      if (el) el.textContent = Math.max(0, remaining);
      if (remaining <= 0) { clearInterval(countdownInterval); performLogout(); }
    }, 1000);
  }

  function performLogout() {
    clearInterval(countdownInterval);
    idleOverlay.classList.remove('open');
    // Demo-scope note: this app doesn't have a connected auth/session backend on the
    // frontend yet (the Laravel API's RBAC is separate — see security note in code review),
    // so "logging out" here clears local session-ish flags and returns to the public site
    // rather than hitting a real /logout endpoint.
    try {
      Object.keys(localStorage).filter(k => k.startsWith('pfre_session')).forEach(k => localStorage.removeItem(k));
    } catch (_) {}
    window.location.href = 'index.html';
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    clearTimeout(warnTimer);
    clearInterval(countdownInterval);
    idleOverlay.classList.remove('open');
    warnTimer = setTimeout(showIdleWarning, IDLE_LIMIT_MS - WARN_BEFORE_MS);
    idleTimer = setTimeout(performLogout, IDLE_LIMIT_MS);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('pfre-idle-stay-btn').addEventListener('click', resetIdleTimer);
    document.getElementById('pfre-idle-out-btn').addEventListener('click', performLogout);
  });
  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt =>
    document.addEventListener(evt, resetIdleTimer, { passive: true })
  );

  /* ══════════════════════════════════════════════
     4. ACTIVITY LOG TIMELINE (aggregated across modules)
  ═══════════════════════════════════════════════ */
  function collectActivity() {
    const items = [];
    const safeGet = k => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (_) { return []; } };

    // CRM: lead-level activity trail (call/whatsapp/note/visit/stage_change)
    safeGet('pfre_crm_leads').forEach(lead => {
      (lead.activities || []).forEach(a => items.push({
        module: 'CRM', ts: a.ts, text: `${lead.name || 'Lead'} — ${a.note || a.type}`,
      }));
    });
    // CRM: standalone activity log tab, if present
    safeGet('pfre_crm_activities').forEach(a => items.push({
      module: 'CRM', ts: a.ts || a.created_at, text: a.note || a.text || a.type || 'Activity',
    }));
    // Web enquiries landing in the CRM
    safeGet('pfre_enquiries').forEach(e => items.push({
      module: 'Website', ts: e.ts, text: `New enquiry: ${e.name || '—'} (${e.source || 'web'})`,
    }));
    // HRMS: employee advances double as a lightweight audit trail
    safeGet('hrms_advances').forEach(a => items.push({
      module: 'HRMS', ts: a.logged_on ? `${a.logged_on}T00:00:00` : a.date, text: `Advance logged: ₹${a.amount} (${a.method})`,
    }));

    return items.filter(i => i.ts).sort((a, b) => new Date(b.ts) - new Date(a.ts)).slice(0, 30);
  }

  const activityOverlay = buildOverlay('pfre-activity-modal', `
    <h3>📋 Activity Log <button class="close-x" onclick="document.getElementById('pfre-activity-modal').classList.remove('open')">✕</button></h3>
    <div id="pfre-activity-list"></div>
  `);

  function openActivityLog() {
    const items = collectActivity();
    const list = document.getElementById('pfre-activity-list');
    list.innerHTML = items.length ? items.map(i => `
      <div class="pfre-shell-timeline-item">
        <div class="pfre-shell-timeline-dot"></div>
        <div><span class="pfre-shell-timeline-mod">${i.module}</span>${i.text}
          <div style="color:var(--text-muted,#94A3B8);font-size:11px;margin-top:2px">${new Date(i.ts).toLocaleString('en-IN')}</div>
        </div>
      </div>`).join('')
      : `<p style="color:var(--text-muted,#94A3B8);font-size:13px;text-align:center;padding:20px 0">No recent activity recorded yet.</p>`;
    activityOverlay.classList.add('open');
  }

  /* ══════════════════════════════════════════════
     5. VOICE NAVIGATION (Web Speech API)
  ═══════════════════════════════════════════════ */
  const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognizer = null, listening = false;

  function matchVoiceCommand(transcript) {
    const t = transcript.toLowerCase();
    for (const [file, info] of Object.entries(MODULES)) {
      if ((info.voice || []).some(phrase => t.includes(phrase))) return file;
    }
    return null;
  }

  function initVoiceNav() {
    if (!SpeechRecognitionImpl) return; // graceful no-op on unsupported browsers (e.g. Firefox)

    recognizer = new SpeechRecognitionImpl();
    recognizer.continuous = false;
    recognizer.interimResults = false;
    recognizer.lang = 'en-IN';

    recognizer.onresult = (e) => {
      const said = e.results[0][0].transcript;
      const targetFile = matchVoiceCommand(said);
      showVoiceFeedback(said, targetFile);
      if (targetFile && targetFile !== CURRENT_FILE) {
        setTimeout(() => { window.location.href = targetFile; }, 700);
      }
    };
    recognizer.onerror = () => stopListening();
    recognizer.onend = () => stopListening();
  }

  function showVoiceFeedback(heard, matched) {
    const label = document.getElementById('pfre-voice-label');
    if (!label) return;
    label.textContent = matched ? `Going to ${MODULES[matched].label}…` : `Didn't recognize "${heard}"`;
    label.style.opacity = '1';
    setTimeout(() => { label.style.opacity = '0'; }, 2200);
  }

  function startListening() {
    if (!recognizer) return;
    listening = true;
    document.getElementById('pfre-voice-fab')?.classList.add('listening');
    try { recognizer.start(); } catch (_) {}
  }
  function stopListening() {
    listening = false;
    document.getElementById('pfre-voice-fab')?.classList.remove('listening');
  }
  function toggleListening() { listening ? recognizer.stop() : startListening(); }

  /* ══════════════════════════════════════════════
     Floating action buttons (voice / activity / shortcuts)
  ═══════════════════════════════════════════════ */
  function injectFabRow() {
    const row = document.createElement('div');
    row.className = 'pfre-shell-fab-row';
    row.innerHTML = `
      <span id="pfre-voice-label" style="background:#111;color:#fff;font-size:11px;padding:5px 10px;border-radius:8px;opacity:0;transition:opacity .2s;white-space:nowrap"></span>
      ${SpeechRecognitionImpl ? `<button class="pfre-shell-fab" id="pfre-voice-fab" title="Voice navigation — try 'Go to Finance'" onclick="window.__pfreShell.toggleListening()">🎙️</button>` : ''}
      <button class="pfre-shell-fab" title="Activity log" onclick="window.__pfreShell.openActivityLog()">📋</button>
      <button class="pfre-shell-fab" title="Keyboard shortcuts (Shift + /)" onclick="document.getElementById('pfre-shortcuts-modal').classList.add('open')">⌨️</button>
    `;
    document.body.appendChild(row);
  }

  /* ══════════════════════════════════════════════
     Global key listener — Shift+/, Esc, Alt+letter nav
  ═══════════════════════════════════════════════ */
  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === '?') {
      e.preventDefault();
      shortcutsOverlay.classList.toggle('open');
      return;
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.pfre-shell-overlay.open').forEach(o => o.classList.remove('open'));
      return;
    }
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      const target = Object.entries(MODULES).find(([, info]) => info.alt === e.key.toLowerCase());
      if (target) { e.preventDefault(); window.location.href = target[0]; }
    }
  });

  /* Expose the minimal surface the inline onclick handlers above need. */
  window.__pfreShell = { toggleListening, openActivityLog };

  document.addEventListener('DOMContentLoaded', () => {
    renderBreadcrumb();
    injectFabRow();
    initVoiceNav();
    resetIdleTimer();
    enforceRoleGate();
    injectQuickHelp();
  });

  /* ══════════════════════════════════════════════
     6. ROLE-BASED PAGE GATE — DEMO SCOPE ONLY, READ THIS:
     This frontend has no connected login/session backend, so there is no
     real identity to check here — only a role picked from a dropdown and
     stored in localStorage, which anyone can edit in devtools. This block
     exists to demonstrate and test the intended UX (what a restricted user
     sees), NOT as an access-control boundary. The Laravel backend built
     earlier in this project (RolePermissionMiddleware + Policy classes per
     model) is where real enforcement lives — every restricted endpoint
     there checks the authenticated user's role server-side, which this
     client-side check cannot substitute for.

     UPDATE: login.html now exists and, when LIVE_AUTH is on, authenticates
     for real against POST /api/v1/auth/login and stores the server's
     returned role in pfre_session. When a real session is present this
     block uses THAT role — the dropdown below only appears as a fallback
     when nobody is logged in, purely for previewing the UI. A real session
     is still just a JSON blob in localStorage from this frontend's point
     of view (the actual enforcement is the Laravel API rejecting requests
     without a valid token) — so treat this as UX polish, not the boundary.
  ═══════════════════════════════════════════════ */
  const ROLES = ['owner', 'admin', 'staff', 'viewer'];
  const RESTRICTED_PAGES = {
    'hrms.html':    { allow: ['owner', 'admin'], label: 'HRMS / Employees' },
    'finance.html': { allow: ['owner', 'admin'], label: 'Finance' },
    'legal.html':   { allow: ['owner', 'admin'], label: 'Legal Agreement Center' },
  };

  function getSession() {
    try {
      const s = JSON.parse(localStorage.getItem('pfre_session') || 'null');
      return (s && s.expiresAt > Date.now()) ? s : null;
    } catch (_) { return null; }
  }

  function currentRole() {
    const session = getSession();
    return session ? session.role : (localStorage.getItem('pfre_demo_role') || 'staff');
  }

  function injectRoleSwitcher() {
    const bar = document.getElementById('pfre-shell-breadcrumb');
    if (!bar) return;
    const session = getSession();
    const wrap = document.createElement('span');
    wrap.style.cssText = 'margin-left:auto;display:flex;align-items:center;gap:6px;font-size:11px';

    if (session) {
      wrap.innerHTML = `
        <span>👤 ${session.name} <span style="opacity:.6">(${session.role})</span></span>
        <button id="pfre-logout-btn" style="background:rgba(239,68,68,.15);color:#EF4444;border:1px solid rgba(239,68,68,.3);border-radius:6px;padding:2px 8px;font-size:11px;cursor:pointer">Log out</button>`;
      bar.appendChild(wrap);
      document.getElementById('pfre-logout-btn').addEventListener('click', () => {
        localStorage.removeItem('pfre_session');
        window.location.href = 'login.html';
      });
    } else {
      wrap.innerHTML = `
        <span title="Not signed in — demo role preview only. Sign in for a real session.">🎭 Previewing as</span>
        <select id="pfre-role-select" style="background:rgba(255,255,255,.06);color:inherit;border:1px solid var(--border,#1A2744);border-radius:6px;padding:2px 6px;font-size:11px">
          ${ROLES.map(r => `<option value="${r}" ${r === currentRole() ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
        <a href="login.html" style="color:var(--blue,#3B82F6);font-size:11px">Sign in →</a>`;
      bar.appendChild(wrap);
      document.getElementById('pfre-role-select').addEventListener('change', (e) => {
        localStorage.setItem('pfre_demo_role', e.target.value);
        enforceRoleGate();
      });
    }
  }

  function enforceRoleGate() {
    injectRoleSwitcher();
    const rule = RESTRICTED_PAGES[CURRENT_FILE];
    const existing = document.getElementById('pfre-role-blocked');
    if (existing) existing.remove();
    if (!rule || rule.allow.includes(currentRole())) return;

    const blocker = document.createElement('div');
    blocker.id = 'pfre-role-blocked';
    blocker.className = 'pfre-idle-warning open';
    blocker.style.zIndex = '1500';
    blocker.innerHTML = `
      <div class="pfre-idle-box">
        <div style="font-size:32px">🔒</div>
        <h3 style="margin:8px 0 0">Access Restricted</h3>
        <p style="font-size:13px;color:var(--text-muted,#94A3B8);margin-top:6px">
          ${rule.label} is limited to: ${rule.allow.join(', ')}. You're viewing as <strong>${currentRole()}</strong>.
        </p>
        <div class="pfre-idle-actions">
          <a href="admin.html" class="pfre-idle-stay" style="text-decoration:none;padding:10px;border-radius:8px;flex:1;display:block">← Back to Dashboard</a>
        </div>
      </div>`;
    document.body.appendChild(blocker);
  }

  /* ══════════════════════════════════════════════
     7. QUICK HELP PANEL — context-aware tips per page.
     These are curated, pre-written tips keyed by page (and where noted, by
     active tab) — NOT a live AI call. Labeling this as real-time AI-generated
     help without an actual model behind it would be misleading, so it's
     framed plainly as contextual help.
  ═══════════════════════════════════════════════ */
  const HELP_TIPS = {
    'admin.html':     ['Click any KPI card to jump to that module.', 'Use "Customize" (top right) to reorder or hide dashboard sections.', 'The sparkline on each card shows the last 8 data points.'],
    'schedule.html':  ['This mirrors the same visit data as CRM\'s Visits tab — nothing new to enter here.', 'Consultant load uses each lead\'s real Assigned Agent when set in CRM, falling back to a guess only for older unassigned leads.'],
    'crm.html':       ['Drag lead cards between pipeline columns to update their stage.', 'Click the 🎙️ icon in the activity timeline to dictate a note instead of typing.', 'Score badges (🔥/🌡️/❄️) update automatically from budget, stage, and recency.'],
    'hrms.html':      ['Use "➕ Log Advance" on a payslip to record a mid-month payment — it auto-deducts from that month\'s net pay.', 'Mark attendance in bulk from the Attendance tab grid.'],
    'analytics.html': ['Switch the period selector to compare weekly vs monthly trends.', 'The leaderboard ranks by a blend of conversion rate and deal volume — hover a badge to see why.'],
    'finance.html':   ['Journal entries must balance — the form won\'t submit until debits equal credits.', 'P&L and Balance Sheet are computed live from posted journal entries, never hand-typed.', 'Use the currency converter for quick NRI-investor quotes.'],
    'legal.html':     ['Build the family tree before drafting a Will — beneficiaries are picked from recorded relationships.', 'Heir suggestions are candidates for a lawyer to review, not a legal determination — see the disclaimer on that panel.', 'Every generated PDF carries a watermark with your name and the generation time.'],
    'inventory.html': ['Print a SKU\'s QR code and stick it on the physical asset — scanning it later opens that item directly.', 'Items at or below their reorder level are flagged in the Low Stock tab.'],
  };

  function injectQuickHelp() {
    const tips = HELP_TIPS[CURRENT_FILE];
    if (!tips || !tips.length) return;

    const row = document.querySelector('.pfre-shell-fab-row');
    if (!row) return;
    const btn = document.createElement('button');
    btn.className = 'pfre-shell-fab';
    btn.title = 'Quick help for this page';
    btn.textContent = '💡';
    btn.onclick = () => document.getElementById('pfre-help-modal').classList.toggle('open');
    row.insertBefore(btn, row.firstChild);

    buildOverlay('pfre-help-modal', `
      <h3>💡 Quick Help <button class="close-x" onclick="document.getElementById('pfre-help-modal').classList.remove('open')">✕</button></h3>
      <p style="font-size:11px;color:var(--text-muted,#94A3B8);margin-bottom:12px">Contextual tips for ${CURRENT.label} — not AI-generated, just curated pointers.</p>
      ${tips.map(t => `<div class="pfre-shell-shortcut-row" style="display:block"><span>💡 ${t}</span></div>`).join('')}
    `);
  }
})();
