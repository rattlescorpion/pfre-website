
/* =====================================================
   PROPERTY FINDER RE — Optimized Global JS v3.1
   Production-Ready · Code-Review Applied
   All widgets consolidated · No shared.js needed

   NOTE: Theme management lives exclusively in js/theme.js
   (loaded standalone, first script in <head>). Do not
   re-add theme logic here — a duplicate PFRETheme IIFE
   and a second inline toggle handler previously caused
   THREE competing click listeners on #themeToggle, which
   made the toggle flicker / require multiple clicks to
   take visible effect. Removed in v3.1.
   ===================================================== */
(() => {
  'use strict';

  /* ─── UTILITIES ─── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* Safe localStorage wrapper — handles private browsing */
  const store = {
    get(k)    { try { return localStorage.getItem(k); }        catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); }            catch { /* noop */ } },
    getJSON(k){ try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } },
    setJSON(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* noop */ } }
  };

  /* HTML-escape any value before interpolating it into innerHTML.
     Prefers window.safeHTML (security.js) when present, falls back
     to a local DOM-based escape so this never hard-depends on load order. */
  const esc = (val) => {
    const str = String(val ?? '');
    if (typeof window.safeHTML === 'function') return window.safeHTML(str);
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  };

  /* Throttle — prevent scroll handler CPU overload */
  const throttle = (fn, ms = 100) => {
    let t = 0;
    return (...a) => { const n = Date.now(); if (n - t >= ms) { t = n; fn(...a); } };
  };

  /* Prefers-reduced-motion check */
  const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme toggle handling lives in js/theme.js — intentionally not duplicated here */

  /* ─── MOBILE HAMBURGER ─── */
  const ham = qs('#hamburger');
  const mob = qs('#mobileMenu');
  if (ham && mob) {
    ham.setAttribute('aria-label', 'Toggle navigation');
    ham.setAttribute('aria-expanded', 'false');
    ham.setAttribute('role', 'button');
    ham.addEventListener('click', () => {
      const open = mob.classList.toggle('open');
      ham.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      const spans = qsa('span', ham);
      if (spans.length >= 3) {
        spans[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
        spans[1].style.opacity   = open ? '0' : '1';
        spans[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
      }
    });
    /* Close on link click */
    qsa('a', mob).forEach(a => a.addEventListener('click', () => {
      mob.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));
    /* Close on Escape key */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mob.classList.contains('open')) {
        mob.classList.remove('open');
        ham.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ─── PAGE PROGRESS BAR ─── */
  const progressBar = qs('#progressBar');
  if (progressBar) {
    const updateBar = throttle(() => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = h > 0 ? Math.min((window.scrollY / h) * 100, 100) + '%' : '0%';
    }, 16);
    window.addEventListener('scroll', updateBar, { passive: true });
  }

  /* ─── BACK TO TOP ─── */
  const btt = qs('#backToTop');
  if (btt) {
    btt.setAttribute('aria-label', 'Back to top');
    const toggleBTT = throttle(() => btt.classList.toggle('visible', window.scrollY > 400), 100);
    window.addEventListener('scroll', toggleBTT, { passive: true });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ─── SCROLL REVEAL ─── */
  const revEls = qsa('.reveal');
  if (revEls.length) {
    if (noMotion) {
      revEls.forEach(el => el.classList.add('revealed'));
    } else {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('revealed'), i * 75);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.08 });
      revEls.forEach(el => obs.observe(el));
    }
  }

  /* ─── TOAST NOTIFICATIONS ─── */
  window.showToast = (msg, type = '', dur = 3500) => {
    let box = qs('#toastContainer');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toastContainer';
      box.style.cssText = 'position:fixed;top:90px;right:20px;z-index:1100;display:flex;flex-direction:column;gap:10px;pointer-events:none';
      document.body.appendChild(box);
    }
    const icons = { success: '✅', error: '❌', '': 'ℹ️' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-msg">${esc(msg)}</span><button class="toast-close" aria-label="Close">×</button>`;
    t.style.cssText = 'background:white;border-left:4px solid #2563EB;border-radius:10px;padding:14px 18px;box-shadow:0 8px 28px rgba(0,0,0,.12);font-size:14px;color:#111827;max-width:300px;display:flex;align-items:flex-start;gap:10px;pointer-events:auto;animation:toastIn .35s ease';
    if (type === 'success') t.style.borderLeftColor = '#10B981';
    if (type === 'error') t.style.borderLeftColor = '#EF4444';
    box.appendChild(t);
    t.querySelector('.toast-close').addEventListener('click', () => t.remove());
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; t.style.transition = 'all .3s'; setTimeout(() => t.remove(), 300); }, dur);
  };

  /* ─── FAVOURITE TOGGLE ─── */
  qsa('.prop-fav').forEach(btn => {
    btn.setAttribute('aria-label', 'Add to wishlist');
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const active = btn.dataset.active === 'true';
      btn.dataset.active = !active;
      btn.textContent = active ? '🤍' : '❤️';
      btn.setAttribute('aria-pressed', String(!active));
      showToast(active ? '🤍 Removed from wishlist' : '❤️ Added to wishlist!', active ? '' : 'success');
    });
  });

  /* ─── FILTER & SEARCH TABS ─── */
  qsa('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const parent = tab.closest('.filter-tabs');
      if (!parent) return;
      qsa('.filter-tab', parent).forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      tab.classList.add('active'); tab.setAttribute('aria-selected','true');
    });
  });
  qsa('.search-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      qsa('.search-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  /* ─── COMPARISON BAR ─── */
  let compareList = store.getJSON('pfre_compare') || [];
  window.addToCompare = (name, price) => {
    if (compareList.length >= 3) { showToast('⚠️ Max 3 properties', 'error'); return; }
    if (compareList.find(p => p.name === name)) { showToast('Already in comparison', ''); return; }
    compareList.push({ name, price });
    store.setJSON('pfre_compare', compareList);
    updateCompareBar(); showToast(`✅ "${name}" added to comparison`, 'success');
  };
  window.removeFromCompare = idx => {
    compareList.splice(idx, 1); store.setJSON('pfre_compare', compareList); updateCompareBar();
  };
  function updateCompareBar() {
    const bar = qs('#compareBar'); if (!bar) return;
    bar.classList.toggle('show', compareList.length > 0);
    qsa('.compare-slot', bar).forEach((slot, i) => {
      if (compareList[i]) {
        slot.classList.add('filled');
        slot.innerHTML = `<span>${esc(compareList[i].name)}</span><button class="remove-slot" onclick="removeFromCompare(${i})" aria-label="Remove">×</button>`;
      } else { slot.classList.remove('filled'); slot.innerHTML = '+ Add Property'; }
    });
  }
  updateCompareBar();
  /* Clear compare bar */
  qs('#compareBar .compare-btn.secondary')?.addEventListener('click', () => {
    compareList = []; store.setJSON('pfre_compare', []); updateCompareBar();
  });

  /* ─── LIGHTBOX ─── */
  let lbImgs = [], lbIdx = 0;
  window.openLightbox = (imgs, idx = 0) => {
    lbImgs = imgs; lbIdx = idx;
    const lb = qs('#lightbox'); if (!lb) return;
    lb.classList.add('open'); renderLightbox();
    document.body.style.overflow = 'hidden';
    lb.setAttribute('aria-hidden', 'false');
  };
  window.closeLightbox = () => {
    const lb = qs('#lightbox'); if (!lb) return;
    lb.classList.remove('open'); document.body.style.overflow = '';
    lb.setAttribute('aria-hidden', 'true');
  };
  function renderLightbox() {
    const img = qs('#lbImage'), ctr = qs('#lbCounter');
    if (img) img.textContent = lbImgs[lbIdx] || '🏠';
    if (ctr) ctr.textContent = `${lbIdx + 1} / ${lbImgs.length}`;
  }
  qs('#lbPrev')?.addEventListener('click', () => { lbIdx = (lbIdx - 1 + lbImgs.length) % lbImgs.length; renderLightbox(); });
  qs('#lbNext')?.addEventListener('click', () => { lbIdx = (lbIdx + 1) % lbImgs.length; renderLightbox(); });
  qs('#lbClose')?.addEventListener('click', closeLightbox);
  qs('#lightbox')?.addEventListener('click', e => { if (e.target.id === 'lightbox') closeLightbox(); });
  document.addEventListener('keydown', e => {
    const lb = qs('#lightbox');
    if (!lb?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { lbIdx = (lbIdx - 1 + lbImgs.length) % lbImgs.length; renderLightbox(); }
    if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % lbImgs.length; renderLightbox(); }
  });

  /* ─── STICKY ENQUIRY BAR ─── */
  const stickyBar = qs('#stickyEnquiry');
  if (stickyBar) {
    const toggleSticky = throttle(() => stickyBar.classList.toggle('show', window.scrollY > 600), 100);
    window.addEventListener('scroll', toggleSticky, { passive: true });
  }

  /* ─── SEARCH SUGGESTIONS ─── */
  const SUGGESTIONS = ['Malad West','Malad East','Goregaon West','Goregaon East','Andheri West','Andheri East','Borivali West','Borivali East','Kandivali','Dahisar','Mira Road','Bandra','2 BHK Flat','3 BHK Apartment','Commercial Office','Plot / Land','Row House'];
  qsa('.search-input-wrap input').forEach(inp => {
    const wrap = inp.closest('.search-input-wrap');
    if (!wrap) return;
    let sugBox = document.createElement('div');
    sugBox.className = 'search-suggestions';
    wrap.style.position = 'relative';
    wrap.appendChild(sugBox);
    inp.setAttribute('autocomplete', 'off');
    inp.addEventListener('input', () => {
      const q = inp.value.toLowerCase().trim();
      if (!q) { sugBox.classList.remove('open'); return; }
      const hits = SUGGESTIONS.filter(s => s.toLowerCase().includes(q)).slice(0, 6);
      if (!hits.length) { sugBox.classList.remove('open'); return; }
      sugBox.innerHTML = hits.map(s => `<div class="suggestion-item" role="option" tabindex="0"><span class="sug-icon">📍</span><span>${esc(s)}</span></div>`).join('');
      sugBox.querySelectorAll('.suggestion-item').forEach(el => {
        el.addEventListener('click', () => { inp.value = el.querySelector('span:last-child').textContent; sugBox.classList.remove('open'); });
        el.addEventListener('keydown', e => { if (e.key === 'Enter') el.click(); });
      });
      sugBox.classList.add('open');
    });
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) sugBox.classList.remove('open'); });
  });

  /* ─── PWA INSTALL PROMPT ─── */
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferredPrompt = e;
    setTimeout(() => qs('#pwaInstall')?.classList.add('show'), 5000);
  });
  qs('#pwaInstallBtn')?.addEventListener('click', async () => {
    qs('#pwaInstall')?.classList.remove('show');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (outcome === 'accepted') showToast('🎉 App installed!', 'success');
    }
  });
  qs('#pwaDismiss')?.addEventListener('click', () => qs('#pwaInstall')?.classList.remove('show'));

  /* ─── AI CHATBOT ─── */
  const chatWidget = qs('#chatWidget');
  const chatToggle = qs('#chatToggle');
  const chatClose  = qs('#chatClose');
  const chatSend   = qs('#chatSend');
  const chatInput  = qs('#chatInput');
  const chatBody   = qs('#chatBody');
  const quickReplies = qs('#quickReplies');

  const KB = {
    greeting:     { p:['hi','hello','hey','namaste','hii'],           r:"Namaste! 👋 Welcome to **Property Finder Real Estate** — Mumbai's trusted consultants since 2018.\n\nHow can I help you today?" },
    buy:          { p:['buy','purchase','want flat','looking to buy'], r:"We have **2,400+ verified properties** for sale across Mumbai.\n\n📍 Areas: Malad West, Goregaon, Andheri, Borivali, Kandivali\n💰 Budget: ₹40L – ₹10Cr+\n\nWhich area and BHK configuration are you looking for?" },
    rent:         { p:['rent','rental','on rent','tenant'],            r:"We have excellent rental options! 🔑\n\n• 1 BHK: ₹12,000–₹30,000/mo\n• 2 BHK: ₹25,000–₹55,000/mo\n• 3 BHK: ₹45,000–₹90,000/mo\n\nWhich area and budget?" },
    sell:         { p:['sell','selling','list my property'],           r:"We help sell your property at the **best market price**! 📈\n\n✅ Free valuation\n✅ Professional photography\n✅ 10+ portal listing\n✅ Verified buyer network\n\nCall us at **+91 93269 90050**" },
    loan:         { p:['loan','home loan','emi','finance'],            r:"We offer **free home loan assistance** with 15+ bank tie-ups! 🏦\n\n• Rates from 8.5% p.a.\n• Up to 80% LTV\n• Quick approval in 3–7 days\n\nCheck our [EMI Calculator](/calculators.html)" },
    rera:         { p:['rera','maharera','legal','registration'],      r:"RERA guidance included in all our services! ⚖️\n\nWe verify all MahaRERA registrations before recommending any project. Stamp duty: 5% (Male), 4% (Female)." },
    price:        { p:['price','rate','cost','how much','valuation'], r:"**Mumbai Price Guide 2025:**\n\n• Malad West: ₹15K–₹22K/sq.ft\n• Goregaon: ₹16K–₹26K/sq.ft\n• Andheri: ₹18K–₹35K/sq.ft\n• Borivali: ₹13K–₹20K/sq.ft\n\nNeed a free valuation?" },
    contact:      { p:['contact','call','phone','address','office'],   r:"**Our Contact Details:**\n\n📍 Shop No. 9, Ground Floor, Building No. 3, Deepanjali CHS, Malad West, Mumbai 400095\n📞 +91 93269 90050\n✉️ propertyfinderre@gmail.com\n\n🕐 Mon–Sat: 10AM–7PM" },
    nri:          { p:['nri','abroad','dubai','usa','uk'],             r:"We have a **dedicated NRI desk**! 🌍\n\n✅ Virtual property tours\n✅ POA assistance\n✅ FEMA-compliant transactions\n✅ NRI home loans\n\nVisit our [NRI Corner](/nri.html)" },
    thanks:       { p:['thank','thanks','great','perfect','helpful'],  r:"You're most welcome! 😊\n\nFeel free to ask anything else. We're here 7 days a week!\n\n📞 **+91 93269 90050**" },
    services:     { p:['service','what do you','what can you'],        r:"**Our Complete Services:**\n\n🏠 Residential Sales & Purchase\n🔑 Rental & Leasing\n🏢 Commercial Properties\n🛡️ Property Management\n💰 Home Loan Assistance\n📊 Property Valuation\n📄 Legal & Documentation\n🗺️ Investment Advisory" },
    insurance:    { p:['insurance','insure','protect'],                r:"We offer **Property Insurance** assistance! 🛡️\n\n• Home Structure Insurance\n• Contents Insurance\n• Tenant Insurance\n• Commercial Insurance\n\nGet a free quote at [Insurance](/insurance.html)" },
    tds:          { p:['tds','tax','194','deduct'],                    r:"We have **TDS Calculators** for all property transactions! 📋\n\n• Section 194-IA (Resident Seller)\n• Section 195 (NRI Seller)\n• Section 194-IB (Individual Rent)\n• Section 194-I (Business Rent)\n\nVisit [TDS Calculators](/tds-calculators.html)" }
  };

  function fmt(t) { return t.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>'); }
  function addMsg(txt, from='bot') {
    if (!chatBody) return;
    const now = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    const d = document.createElement('div');
    d.className = `chat-msg ${from}`;
    d.innerHTML = `<div class="chat-bubble">${from==='bot'?fmt(txt):esc(txt)}</div><div class="chat-time">${now}</div>`;
    chatBody.appendChild(d); chatBody.scrollTop = chatBody.scrollHeight;
  }
  function showTyping() {
    const t = document.createElement('div'); t.id='typingIndicator'; t.className='chat-msg bot';
    t.innerHTML='<div class="chat-typing"><span></span><span></span><span></span></div>';
    chatBody.appendChild(t); chatBody.scrollTop = chatBody.scrollHeight;
  }
  function getReply(inp) {
    const q = inp.toLowerCase().replace(/[^\w\s]/g,'');
    for (const k in KB) if (KB[k].p.some(p => q.includes(p))) return KB[k].r;
    return "I'm here to help! 😊 Ask me about:\n\n• **Properties** to buy or rent in Mumbai\n• **Home loans** and finance\n• **Legal / RERA** guidance\n• **Contacting** our team\n\n📞 **+91 93269 90050**";
  }
  function handleChat(txt) {
    if (!txt.trim()) return;
    addMsg(txt,'user'); if (chatInput) chatInput.value = '';
    if (quickReplies) quickReplies.innerHTML = '';
    showTyping();
    setTimeout(() => { qs('#typingIndicator')?.remove(); addMsg(getReply(txt),'bot'); setQR(['🏠 Buy Property','🔑 Rent','📞 Contact Us','💰 Home Loan']); }, 650);
  }
  function setQR(replies) {
    if (!quickReplies) return;
    quickReplies.innerHTML = replies.map(r=>`<button class="qr-btn">${esc(r)}</button>`).join('');
    qsa('.qr-btn',quickReplies).forEach(b => b.addEventListener('click',()=>handleChat(b.textContent)));
  }
  if (chatToggle && chatWidget) {
    chatToggle.setAttribute('aria-label','Open chat assistant');
    chatToggle.addEventListener('click', () => {
      const open = chatWidget.classList.toggle('open');
      chatWidget.setAttribute('aria-hidden', String(!open));
      if (open && chatBody && chatBody.children.length === 0) {
        setTimeout(() => {
          addMsg(KB.greeting.r,'bot');
          setQR(['🏠 Buy Property','🔑 Rent Property','🏢 Commercial','💰 Home Loan','📞 Contact Us']);
          qs('.chat-badge',chatToggle)?.remove();
        }, 300);
      }
    });
    chatClose?.addEventListener('click', () => { chatWidget.classList.remove('open'); chatWidget.setAttribute('aria-hidden','true'); });
    chatSend?.addEventListener('click', () => handleChat(chatInput?.value?.trim() || ''));
    chatInput?.addEventListener('keydown', e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleChat(chatInput.value.trim()); }});
  }

  /* ─── CALC TABS ─── */
  qsa('.calc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const parent = tab.closest('.calc-widget');
      if (!parent) return;
      qsa('.calc-tab',parent).forEach(t => t.classList.remove('active'));
      qsa('.calc-panel',parent).forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = qs('#' + tab.dataset.panel, parent);
      if (panel) panel.classList.add('active');
    });
  });

  /* ─── EMI CALCULATOR ─── */
  window.calcEMI = () => {
    const p = parseFloat(qs('#emiPrincipal')?.value)||0;
    const r = parseFloat(qs('#emiRate')?.value)/12/100||0;
    const n = parseFloat(qs('#emiTenure')?.value)*12||0;
    if (!p||!r||!n) return;
    const emi = p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
    const total = emi*n;
    const fmtINR = v => '₹'+Math.round(v).toLocaleString('en-IN');
    if (qs('#emiResult'))   qs('#emiResult').textContent   = fmtINR(emi);
    if (qs('#emiTotal'))    qs('#emiTotal').textContent     = fmtINR(total);
    if (qs('#emiInterest')) qs('#emiInterest').textContent  = fmtINR(total-p);
  };

  /* ─── STAMP DUTY CALCULATOR ─── */
  window.calcStamp = () => {
    const val = parseFloat(qs('#sdValue')?.value)||0;
    const g = qs('#sdGender')?.value||'male';
    const rate = g==='female'?0.04:g==='joint'?0.045:0.05;
    const stamp=val*rate, reg=val*0.01;
    const f = v => '₹'+Math.round(v).toLocaleString('en-IN');
    if (qs('#sdStamp')) qs('#sdStamp').textContent = f(stamp);
    if (qs('#sdReg'))   qs('#sdReg').textContent   = f(reg);
    if (qs('#sdTotal')) qs('#sdTotal').textContent  = f(stamp+reg);
  };

  /* ─── AFFORDABILITY CALCULATOR ─── */
  window.calcAfford = () => {
    const income=parseFloat(qs('#afIncome')?.value)||0;
    const exist =parseFloat(qs('#afExisting')?.value)||0;
    const rate  =parseFloat(qs('#afRate')?.value)/12/100||0;
    const n     =parseFloat(qs('#afTenure')?.value)*12||0;
    const maxEMI=income*0.4-exist; if(maxEMI<=0||!rate||!n) return;
    const loan=maxEMI*(Math.pow(1+rate,n)-1)/(rate*Math.pow(1+rate,n));
    const f = v => '₹'+Math.round(v).toLocaleString('en-IN');
    if (qs('#afLoan')) qs('#afLoan').textContent = f(loan);
    if (qs('#afProp')) qs('#afProp').textContent = f(loan/0.8);
    if (qs('#afEMI'))  qs('#afEMI').textContent  = f(maxEMI);
  };

  /* ─── RENTAL YIELD CALCULATOR ─── */
  window.calcYield = () => {
    const val=parseFloat(qs('#ryPropVal')?.value)||0;
    const mo =parseFloat(qs('#ryMonthly')?.value)||0;
    if(!val||!mo) return;
    const annual=mo*12, gross=(annual/val)*100;
    if (qs('#ryGross'))  qs('#ryGross').textContent  = gross.toFixed(2)+'%';
    if (qs('#ryNet'))    qs('#ryNet').textContent    = (gross-0.5).toFixed(2)+'%';
    if (qs('#ryAnnual')) qs('#ryAnnual').textContent = '₹'+Math.round(annual).toLocaleString('en-IN');
  };

  /* ─── ENHANCED COOKIE CONSENT ─── */
  (() => {
    const CKEY = 'pfre_cookie_prefs';
    const saved = store.getJSON(CKEY);

    function injectCookieUI() {
      if (qs('#cookieModal')) return;
      const modal = document.createElement('div');
      modal.id = 'cookieModal';
      modal.setAttribute('role','dialog');
      modal.setAttribute('aria-modal','true');
      modal.setAttribute('aria-label','Cookie Preferences');
      modal.innerHTML = `<div class="cookie-modal-box">
        <div class="cookie-modal-head">
          <div><h3>🍪 Cookie Preferences</h3>
          <p>We use cookies to enhance your experience, analyse traffic, and personalise property recommendations. Choose your preferences below.</p></div>
          <button class="cookie-modal-close" aria-label="Close cookie settings" onclick="closeCookieModal()">×</button>
        </div>
        <div class="cookie-categories">
          <div class="cookie-cat"><div class="cookie-cat-info"><h4>Necessary <span class="cookie-required-tag">ALWAYS ON</span></h4><p>Essential functionality — theme, sessions, security. Cannot be disabled.</p></div><label class="cookie-toggle"><input type="checkbox" id="cNec" checked disabled><span class="cookie-slider"></span></label></div>
          <div class="cookie-cat"><div class="cookie-cat-info"><h4>📊 Analytics</h4><p>Help us understand how you use the site — pages visited, time spent (Google Analytics).</p></div><label class="cookie-toggle"><input type="checkbox" id="cAna"><span class="cookie-slider"></span></label></div>
          <div class="cookie-cat"><div class="cookie-cat-info"><h4>📣 Marketing</h4><p>Show you relevant property ads on Google, Facebook after your visit (Meta Pixel, Google Ads).</p></div><label class="cookie-toggle"><input type="checkbox" id="cMkt"><span class="cookie-slider"></span></label></div>
          <div class="cookie-cat"><div class="cookie-cat-info"><h4>⚙️ Functional</h4><p>Saved searches, recently viewed properties, chatbot history, map preferences.</p></div><label class="cookie-toggle"><input type="checkbox" id="cFun" checked><span class="cookie-slider"></span></label></div>
        </div>
        <div class="cookie-modal-btns">
          <button class="cookie-modal-btn accept-all" onclick="acceptAllCookies()">✅ Accept All</button>
          <button class="cookie-modal-btn save" onclick="savePreferences()">💾 Save Preferences</button>
          <button class="cookie-modal-btn reject" onclick="rejectAllCookies()">❌ Reject Non-Essential</button>
        </div>
        <p class="cookie-policy-link">Read our <a href="privacy-policy.html">Privacy Policy</a> · <a href="#" onclick="openCookieModal();return false">Manage Cookies</a></p>
      </div>`;
      document.body.appendChild(modal);

      const pill = document.createElement('button');
      pill.id='cookiePill'; pill.className='cookie-pill'; pill.setAttribute('aria-label','Cookie settings');
      pill.innerHTML='🍪 Cookie Settings'; pill.onclick=openCookieModal;
      document.body.appendChild(pill);

      if (saved) {
        qs('#cAna').checked = !!saved.analytics;
        qs('#cMkt').checked = !!saved.marketing;
        qs('#cFun').checked = !!saved.functional;
        pill.classList.add('show');
      }
    }

    window.openCookieModal = () => { injectCookieUI(); qs('#cookieModal')?.classList.add('open'); document.body.style.overflow='hidden'; };
    window.closeCookieModal = () => { qs('#cookieModal')?.classList.remove('open'); document.body.style.overflow=''; qs('#cookiePill')?.classList.add('show'); };
    window.acceptAllCookies = () => { saveCookies(true,true,true); closeCookieModal(); showToast('🍪 All cookies accepted!','success'); };
    window.rejectAllCookies = () => { saveCookies(false,false,false); closeCookieModal(); showToast('🚫 Non-essential cookies rejected.',''); };
    window.savePreferences  = () => { saveCookies(qs('#cAna')?.checked||false,qs('#cMkt')?.checked||false,qs('#cFun')?.checked||false); closeCookieModal(); showToast('✅ Preferences saved!','success'); };

    function saveCookies(ana, mkt, fun) {
      store.setJSON(CKEY,{analytics:ana,marketing:mkt,functional:fun,ts:Date.now()});
      store.set('pfre_cookie','set');
      /* Hide old simple banner */
      qs('#cookieBanner')?.classList.remove('show');
    }

    injectCookieUI();
    if (!store.get(CKEY)) {
      setTimeout(() => openCookieModal(), 2200);
    }
  })();

})(); /* end IIFE */
