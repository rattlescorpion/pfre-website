/* =====================================================
   PROPERTY FINDER RE — Unified Interactive Widgets v3.2
   Chat Assistant · Toast Engine · Compare Bar · Lightbox
   Calculators · PWA Prompt · Cookie Manager · Scroll UI
   ===================================================== */
(() => {
  'use strict';

  /* ── 1. DOM & UTILITY HELPERS ── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const store = {
    get(k)     { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v)  { try { localStorage.setItem(k, v); } catch { /* noop */ } },
    getJSON(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } },
    setJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* noop */ } }
  };

  const esc = (val) => {
    const str = String(val ?? '');
    if (typeof window.safeHTML === 'function') return window.safeHTML(str);
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  };

  const throttle = (fn, ms = 100) => {
    let t = 0;
    return (...a) => {
      const n = Date.now();
      if (n - t >= ms) {
        t = n;
        fn(...a);
      }
    };
  };

  const noMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════════════════════════════════════════
     2. UNIFIED TOAST ENGINE (window.showToast)
  ═══════════════════════════════════════════════ */
  window.showToast = (msg, type = 'info', dur = 3500) => {
    let box = qs('#toastContainer');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toastContainer';
      box.style.cssText = 'position:fixed;top:90px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
      document.body.appendChild(box);
    }

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const normalizedType = type === '' ? 'info' : type;

    const t = document.createElement('div');
    t.className = `pfre-toast toast ${normalizedType}`;
    t.style.cssText = 'background:#ffffff;border-left:4px solid #2563EB;border-radius:10px;padding:12px 18px;box-shadow:0 8px 24px rgba(0,0,0,.15);font-size:14px;color:#0F172A;max-width:320px;display:flex;align-items:flex-start;gap:10px;pointer-events:auto;animation:toastIn .3s ease;transition:all .3s ease;';

    if (normalizedType === 'success') t.style.borderLeftColor = '#10B981';
    if (normalizedType === 'error')   t.style.borderLeftColor = '#EF4444';
    if (normalizedType === 'warning') t.style.borderLeftColor = '#F59E0B';

    t.innerHTML = `
      <span class="toast-icon">${icons[normalizedType] || 'ℹ️'}</span>
      <span class="toast-msg" style="flex:1;line-height:1.4">${esc(msg)}</span>
      <button class="toast-close" aria-label="Close" style="background:none;border:none;cursor:pointer;font-size:18px;color:#94A3B8;padding:0;line-height:1">&times;</button>
    `;

    box.appendChild(t);

    const close = () => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(20px)';
      setTimeout(() => t.remove(), 300);
    };

    t.querySelector('.toast-close').addEventListener('click', close);
    setTimeout(close, dur);
  };

  /* ══════════════════════════════════════════════
     3. SCROLL PROGRESS BAR & BACK TO TOP
  ═══════════════════════════════════════════════ */
  function initScrollWidgets() {
    const bar = qs('#progressBar');
    const btt = qs('#backToTop');
    const stickyBar = qs('#stickyEnquiry');

    const onScroll = throttle(() => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - window.innerHeight;

      if (bar) {
        bar.style.width = h > 0 ? Math.min((scrollY / h) * 100, 100) + '%' : '0%';
      }
      if (btt) {
        btt.classList.toggle('visible', scrollY > 380);
      }
      if (stickyBar) {
        stickyBar.classList.toggle('show', scrollY > 600);
      }
    }, 20);

    window.addEventListener('scroll', onScroll, { passive: true });

    if (btt) {
      btt.setAttribute('aria-label', 'Back to top');
      btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }

  /* ══════════════════════════════════════════════
     4. MOBILE NAVIGATION & HAMBURGER
  ═══════════════════════════════════════════════ */
  function initMobileMenu() {
    const ham = qs('#hamburger');
    const mob = qs('#mobileMenu');
    if (!ham || !mob) return;

    ham.setAttribute('aria-label', 'Toggle navigation');
    ham.setAttribute('aria-expanded', 'false');
    ham.setAttribute('role', 'button');

    const toggle = (forceClose = false) => {
      const open = forceClose ? false : !mob.classList.contains('open');
      ham.classList.toggle('active', open);
      mob.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';

      const spans = qsa('span', ham);
      if (spans.length >= 3) {
        spans[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
        spans[1].style.opacity   = open ? '0' : '1';
        spans[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
      }
    };

    ham.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    qsa('a', mob).forEach(link => {
      link.addEventListener('click', () => toggle(true));
    });

    document.addEventListener('click', (e) => {
      if (mob.classList.contains('open') && !mob.contains(e.target) && !ham.contains(e.target)) {
        toggle(true);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mob.classList.contains('open')) {
        toggle(true);
      }
    });
  }

  /* ══════════════════════════════════════════════
     5. SCROLL REVEAL OBSERVER
  ═══════════════════════════════════════════════ */
  function initScrollReveal() {
    const revEls = qsa('.reveal');
    if (!revEls.length) return;

    if (noMotion) {
      revEls.forEach(el => el.classList.add('revealed'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('revealed'), i * 60);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    revEls.forEach(el => obs.observe(el));
  }

  /* ══════════════════════════════════════════════
     6. FAVORITE TOGGLE (WISHLIST)
  ═══════════════════════════════════════════════ */
  function initWishlist() {
    qsa('.prop-fav').forEach(btn => {
      btn.setAttribute('aria-label', 'Add to wishlist');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const active = btn.dataset.active === 'true';
        btn.dataset.active = String(!active);
        btn.textContent = active ? '🤍' : '❤️';
        btn.setAttribute('aria-pressed', String(!active));
        window.showToast(active ? '🤍 Removed from wishlist' : '❤️ Saved to wishlist!', active ? 'info' : 'success');
      });
    });
  }

  /* ══════════════════════════════════════════════
     7. PROPERTY COMPARISON BAR (DUAL-API SUPPORT)
  ═══════════════════════════════════════════════ */
  let compareList = store.getJSON('pfre_compare') || [];

  function updateCompareUI() {
    const bar = qs('#compareBar');
    if (!bar) return;

    bar.classList.toggle('show', compareList.length > 0);
    const slots = qsa('.compare-slot', bar);

    slots.forEach((slot, i) => {
      const item = compareList[i];
      if (item) {
        slot.classList.add('filled');
        slot.innerHTML = `
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(item.name || 'Property')}</span>
          <button class="remove-slot" onclick="window.removeFromCompare(${i})" aria-label="Remove" style="background:none;border:none;cursor:pointer;margin-left:6px;font-size:16px;color:#EF4444">&times;</button>
        `;
      } else {
        slot.classList.remove('filled');
        slot.innerHTML = '+ Add Property';
      }
    });
  }

  window.addToCompare = (nameOrObj, price = '') => {
    if (compareList.length >= 3) {
      window.showToast('⚠️ Maximum 3 properties can be compared.', 'warning');
      return;
    }

    const item = typeof nameOrObj === 'object' && nameOrObj !== null
      ? { id: nameOrObj.id || String(Date.now()), name: nameOrObj.name || 'Property', price: nameOrObj.price || '' }
      : { id: String(Date.now()), name: String(nameOrObj), price: String(price) };

    if (compareList.some(p => p.name === item.name || (item.id && p.id === item.id))) {
      window.showToast('Already added to comparison.', 'info');
      return;
    }

    compareList.push(item);
    store.setJSON('pfre_compare', compareList);
    updateCompareUI();
    window.showToast(`✅ "${item.name}" added to comparison`, 'success');
  };

  window.removeFromCompare = (idxOrId) => {
    if (typeof idxOrId === 'number') {
      compareList.splice(idxOrId, 1);
    } else {
      compareList = compareList.filter(p => p.id !== idxOrId);
    }
    store.setJSON('pfre_compare', compareList);
    updateCompareUI();
  };

  window.clearCompare = () => {
    compareList = [];
    store.setJSON('pfre_compare', []);
    updateCompareUI();
  };

  window.PFRECompare = {
    items: compareList,
    add: (prop) => window.addToCompare(prop),
    remove: (id) => window.removeFromCompare(id),
    clear: () => window.clearCompare(),
    render: updateCompareUI
  };

  function initCompareEvents() {
    updateCompareUI();
    qs('#compareBar .compare-btn.secondary')?.addEventListener('click', window.clearCompare);
    qs('#compareBar .compare-btn.primary')?.addEventListener('click', () => {
      window.location.href = 'compare.html';
    });
  }

  /* ══════════════════════════════════════════════
     8. IMAGE LIGHTBOX
  ═══════════════════════════════════════════════ */
  let lbImgs = [], lbIdx = 0;

  function renderLightbox() {
    const imgEl = qs('#lbImage');
    const ctrEl = qs('#lbCounter');
    if (!lbImgs.length) return;

    if (imgEl) {
      const src = lbImgs[lbIdx];
      if (src && (src.startsWith('http') || src.startsWith('images/') || src.endsWith('.jpg') || src.endsWith('.png'))) {
        imgEl.innerHTML = `<img src="${esc(src)}" alt="Property view" style="max-width:100%;max-height:80vh;border-radius:12px;object-fit:contain">`;
      } else {
        imgEl.textContent = src || '🏠';
      }
    }
    if (ctrEl) ctrEl.textContent = `${lbIdx + 1} / ${lbImgs.length}`;
  }

  window.openLightbox = (imgs, idx = 0) => {
    lbImgs = Array.isArray(imgs) ? imgs : [imgs];
    lbIdx = Math.max(0, Math.min(idx, lbImgs.length - 1));
    const lb = qs('#lightbox');
    if (!lb) return;

    lb.classList.add('open');
    renderLightbox();
    document.body.style.overflow = 'hidden';
    lb.setAttribute('aria-hidden', 'false');
  };

  window.closeLightbox = () => {
    const lb = qs('#lightbox');
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lb.setAttribute('aria-hidden', 'true');
  };

  function initLightboxEvents() {
    qs('#lbPrev')?.addEventListener('click', () => {
      lbIdx = (lbIdx - 1 + lbImgs.length) % lbImgs.length;
      renderLightbox();
    });
    qs('#lbNext')?.addEventListener('click', () => {
      lbIdx = (lbIdx + 1) % lbImgs.length;
      renderLightbox();
    });
    qs('#lbClose')?.addEventListener('click', window.closeLightbox);

    qs('#lightbox')?.addEventListener('click', (e) => {
      if (e.target.id === 'lightbox') window.closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      const lb = qs('#lightbox');
      if (!lb?.classList.contains('open')) return;
      if (e.key === 'Escape') window.closeLightbox();
      if (e.key === 'ArrowLeft') {
        lbIdx = (lbIdx - 1 + lbImgs.length) % lbImgs.length;
        renderLightbox();
      }
      if (e.key === 'ArrowRight') {
        lbIdx = (lbIdx + 1) % lbImgs.length;
        renderLightbox();
      }
    });
  }

  /* ══════════════════════════════════════════════
     9. SEARCH SUGGESTIONS
  ═══════════════════════════════════════════════ */
  const SUGGESTIONS = [
    'Malad West', 'Malad East', 'Goregaon West', 'Goregaon East',
    'Andheri West', 'Andheri East', 'Borivali West', 'Borivali East',
    'Kandivali', 'Dahisar', 'Mira Road', 'Bandra',
    '1 BHK Flat', '2 BHK Flat', '3 BHK Apartment',
    'Commercial Office', 'Plot / Land', 'Row House'
  ];

  function initSearchSuggestions() {
    qsa('.search-input-wrap input').forEach(inp => {
      const wrap = inp.closest('.search-input-wrap');
      if (!wrap || wrap.querySelector('.search-suggestions')) return;

      const sugBox = document.createElement('div');
      sugBox.className = 'search-suggestions';
      wrap.style.position = 'relative';
      wrap.appendChild(sugBox);
      inp.setAttribute('autocomplete', 'off');

      inp.addEventListener('input', () => {
        const q = inp.value.toLowerCase().trim();
        if (!q) {
          sugBox.classList.remove('open');
          return;
        }

        const hits = SUGGESTIONS.filter(s => s.toLowerCase().includes(q)).slice(0, 6);
        if (!hits.length) {
          sugBox.classList.remove('open');
          return;
        }

        sugBox.innerHTML = hits.map(s => `
          <div class="suggestion-item" role="option" tabindex="0" style="padding:8px 12px;cursor:pointer;display:flex;align-items:center;gap:8px">
            <span class="sug-icon">📍</span><span>${esc(s)}</span>
          </div>
        `).join('');

        sugBox.querySelectorAll('.suggestion-item').forEach(el => {
          const selectItem = () => {
            inp.value = el.querySelector('span:last-child').textContent;
            sugBox.classList.remove('open');
            inp.dispatchEvent(new Event('input', { bubbles: true }));
          };
          el.addEventListener('click', selectItem);
          el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') selectItem();
          });
        });

        sugBox.classList.add('open');
      });

      document.addEventListener('click', (e) => {
        if (!wrap.contains(e.target)) sugBox.classList.remove('open');
      });
    });
  }

  /* ══════════════════════════════════════════════
     10. PWA INSTALL PROMPT
  ═══════════════════════════════════════════════ */
  function initPWA() {
    let deferredPrompt = null;
    const banner = qs('#pwaInstall');
    const installBtn = qs('#pwaInstallBtn');
    const dismissBtn = qs('#pwaDismiss');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (banner && !store.get('pfre_pwa_dismissed')) {
        setTimeout(() => banner.classList.add('show'), 3500);
      }
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        banner?.classList.remove('show');
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          deferredPrompt = null;
          if (outcome === 'accepted') window.showToast('🎉 App installation started!', 'success');
        }
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        banner?.classList.remove('show');
        store.set('pfre_pwa_dismissed', 'true');
      });
    }
  }

  /* ══════════════════════════════════════════════
     11. AI CHAT ASSISTANT
  ═══════════════════════════════════════════════ */
  const KB = {
    greeting: {
      p: ['hi', 'hello', 'hey', 'namaste', 'hii', 'start'],
      r: "Namaste! 👋 Welcome to **Property Finder Real Estate** — Mumbai's trusted consultants since 2018.\n\nHow can I help you today?"
    },
    buy: {
      p: ['buy', 'purchase', 'want flat', 'looking to buy', 'sale'],
      r: "We have **2,400+ verified properties** for sale across Mumbai.\n\n📍 Areas: Malad West, Goregaon, Andheri, Borivali, Kandivali\n💰 Budget: ₹40L – ₹10Cr+\n\nWhich area and configuration (1, 2, or 3 BHK) are you looking for?"
    },
    rent: {
      p: ['rent', 'rental', 'on rent', 'tenant', 'lease'],
      r: "We have verified rental listings with police verification support! 🔑\n\n• 1 BHK: ₹15,000–₹30,000/mo\n• 2 BHK: ₹30,000–₹60,000/mo\n• 3 BHK: ₹55,000–₹1,20,000/mo\n\nWhich locality would you prefer?"
    },
    sell: {
      p: ['sell', 'selling', 'list my property', 'post property'],
      r: "We help owners sell faster at **fair market value**! 📈\n\n✅ Free Property Valuation\n✅ Professional Photography\n✅ Portal Distribution\n✅ End-to-end Legal Support\n\nCall our desk at **+91 93269 90050**"
    },
    loan: {
      p: ['loan', 'home loan', 'emi', 'finance', 'interest'],
      r: "We provide **Home Loan Assistance** across 15+ partner banks! 🏦\n\n• Competitive interest rates\n• Up to 80-85% LTV\n• Quick sanction in 3–5 working days\n\nUse our Tools > EMI Calculator for quick planning."
    },
    rera: {
      p: ['rera', 'maharera', 'legal', 'registration', 'stamp duty'],
      r: "Transparency first! ⚖️ Every project we recommend is verified on MahaRERA.\n\nStamp duty guidelines in Maharashtra: 5% for male buyers, 4% for female buyers, plus 1% registration fee."
    },
    contact: {
      p: ['contact', 'call', 'phone', 'address', 'office', 'number'],
      r: "📍 **Office:** Shop No. 9, Ground Floor, Building No. 3, Deepanjali CHS, Malad West, Mumbai 400095\n📞 **Phone:** +91 93269 90050\n✉️ **Email:** propertyfinderre@gmail.com\n\nOffice hours: 10:00 AM – 7:00 PM (Monday – Saturday)"
    }
  };

  function initChatWidget() {
    const chatWidget = qs('#chatWidget');
    const chatToggle = qs('#chatToggle');
    const chatClose  = qs('#chatClose');
    const chatSend   = qs('#chatSend');
    const chatInput  = qs('#chatInput');
    const chatBody   = qs('#chatBody');
    const quickReplies = qs('#quickReplies');

    if (!chatWidget || !chatToggle) return;

    function formatText(t) {
      return esc(t)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    }

    function addMessage(text, sender = 'bot') {
      if (!chatBody) return;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const wrap = document.createElement('div');
      wrap.className = `chat-msg ${sender === 'bot' ? 'chat-msg-bot' : 'chat-msg-user'}`;
      wrap.innerHTML = `
        <div class="chat-bubble" style="padding:10px 14px;border-radius:12px;max-width:85%;line-height:1.45;font-size:13.5px;${sender === 'bot' ? 'background:#F1F5F9;color:#0F172A;' : 'background:#2563EB;color:#fff;margin-left:auto;'}">
          ${sender === 'bot' ? formatText(text) : esc(text)}
        </div>
        <div class="chat-time" style="font-size:10px;color:#94A3B8;margin-top:3px;${sender === 'user' ? 'text-align:right' : ''}">${now}</div>
      `;
      chatBody.appendChild(wrap);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function setQuickReplies(replies) {
      if (!quickReplies) return;
      quickReplies.innerHTML = replies.map(r => `
        <button class="quick-reply-btn" style="padding:6px 12px;border:1px solid #CBD5E1;border-radius:100px;background:#fff;font-size:12px;cursor:pointer;margin:3px">${esc(r)}</button>
      `).join('');

      qsa('.quick-reply-btn', quickReplies).forEach(btn => {
        btn.addEventListener('click', () => handleUserInput(btn.textContent.trim()));
      });
    }

    function handleUserInput(inputTxt) {
      if (!inputTxt.trim()) return;
      addMessage(inputTxt, 'user');
      if (chatInput) chatInput.value = '';
      if (quickReplies) quickReplies.innerHTML = '';

      const query = inputTxt.toLowerCase().replace(/[^\w\s]/g, '');
      let botResponse = "I'm here to help! Feel free to ask about property buying, renting, home loans, or contact our Malad West desk at +91 93269 90050.";

      for (const k in KB) {
        if (KB[k].p.some(term => query.includes(term))) {
          botResponse = KB[k].r;
          break;
        }
      }

      setTimeout(() => {
        addMessage(botResponse, 'bot');
        setQuickReplies(['🏠 Buy Property', '🔑 Rent 2 BHK', '💰 Home Loan', '📞 Contact Agent']);
      }, 450);
    }

    chatToggle.addEventListener('click', () => {
      const open = chatWidget.classList.toggle('open');
      chatWidget.setAttribute('aria-hidden', String(!open));
      if (open && chatBody && chatBody.children.length === 0) {
        addMessage(KB.greeting.r, 'bot');
        setQuickReplies(['🏠 Buy Property', '🔑 Rent 2 BHK', '💰 Home Loan', '📞 Contact Desk']);
        qs('.chat-badge', chatToggle)?.remove();
      }
    });

    chatClose?.addEventListener('click', () => {
      chatWidget.classList.remove('open');
      chatWidget.setAttribute('aria-hidden', 'true');
    });

    chatSend?.addEventListener('click', () => {
      handleUserInput(chatInput?.value || '');
    });

    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUserInput(chatInput.value);
      }
    });
  }

  /* ══════════════════════════════════════════════
     12. CALCULATORS (SYNTAX-RECTIFIED)
  ═══════════════════════════════════════════════ */
  const fmtINR = (val) => '₹' + Math.round(val).toLocaleString('en-IN');

  window.calcEMI = () => {
    const p = parseFloat(qs('#emiPrincipal')?.value) || 0;
    const r = (parseFloat(qs('#emiRate')?.value) / 12) / 100 || 0;
    const n = (parseFloat(qs('#emiTenure')?.value) * 12) || 0;
    if (!p || !r || !n) return;

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;

    if (qs('#emiResult'))   qs('#emiResult').textContent   = fmtINR(emi);
    if (qs('#emiTotal'))    qs('#emiTotal').textContent    = fmtINR(total);
    if (qs('#emiInterest')) qs('#emiInterest').textContent = fmtINR(total - p);
  };

  window.calcStamp = () => {
    const val = parseFloat(qs('#sdValue')?.value) || 0;
    const g   = qs('#sdGender')?.value || 'male';
    const rate = g === 'female' ? 0.04 : g === 'joint' ? 0.045 : 0.05;
    const stamp = val * rate;
    const reg   = val * 0.01;

    if (qs('#sdStamp')) qs('#sdStamp').textContent = fmtINR(stamp);
    if (qs('#sdReg'))   qs('#sdReg').textContent   = fmtINR(reg);
    if (qs('#sdTotal')) qs('#sdTotal').textContent = fmtINR(stamp + reg);
  };

  window.calcAfford = () => {
    const income = parseFloat(qs('#afIncome')?.value) || 0;
    const exist  = parseFloat(qs('#afExisting')?.value) || 0;
    const rate   = (parseFloat(qs('#afRate')?.value) / 12) / 100 || 0;
    const n      = (parseFloat(qs('#afTenure')?.value) * 12) || 0;

    const maxEMI = (income * 0.45) - exist;
    if (maxEMI <= 0 || !rate || !n) return;

    const loan = maxEMI * (Math.pow(1 + rate, n) - 1) / (rate * Math.pow(1 + rate, n));
    if (qs('#afLoan')) qs('#afLoan').textContent = fmtINR(loan);
    if (qs('#afProp')) qs('#afProp').textContent = fmtINR(loan / 0.8);
    if (qs('#afEMI'))  qs('#afEMI').textContent  = fmtINR(maxEMI);
  };

  window.calcYield = () => {
    const val = parseFloat(qs('#ryPropVal')?.value) || 0;
    const mo  = parseFloat(qs('#ryMonthly')?.value) || 0;
    if (!val || !mo) return;

    const annual = mo * 12;
    const gross  = (annual / val) * 100;
    if (qs('#ryGross'))  qs('#ryGross').textContent  = gross.toFixed(2) + '%';
    if (qs('#ryNet'))    qs('#ryNet').textContent    = (gross - 0.5).toFixed(2) + '%';
    if (qs('#ryAnnual')) qs('#ryAnnual').textContent = fmtINR(annual);
  };

  function initCalculatorTabs() {
    qsa('.calc-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const parent = tab.closest('.calc-widget');
        if (!parent) return;
        qsa('.calc-tab', parent).forEach(t => t.classList.remove('active'));
        qsa('.calc-panel', parent).forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = qs('#' + tab.dataset.panel, parent);
        if (panel) panel.classList.add('active');
      });
    });

    // Auto-calculate on input
    ['#emiPrincipal', '#emiRate', '#emiTenure'].forEach(id => {
      qs(id)?.addEventListener('input', window.calcEMI);
    });
    ['#sdValue', '#sdGender'].forEach(id => {
      qs(id)?.addEventListener('input', window.calcStamp);
    });
  }

  /* ══════════════════════════════════════════════
     13. UNIFIED COOKIE CONSENT
  ═══════════════════════════════════════════════ */
  function initCookieSystem() {
    const CKEY = 'pfre_cookie_prefs';
    const banner = qs('#cookieBanner');
    const saved = store.getJSON(CKEY);

    if (saved) return; // Consent already registered

    if (banner) {
      banner.classList.add('show');
      qs('#cookieAccept', banner)?.addEventListener('click', () => {
        store.setJSON(CKEY, { necessary: true, analytics: true, functional: true, ts: Date.now() });
        banner.classList.remove('show');
        window.showToast('Preferences saved.', 'success');
      });

      qs('#cookieDecline', banner)?.addEventListener('click', () => {
        store.setJSON(CKEY, { necessary: true, analytics: false, functional: false, ts: Date.now() });
        banner.classList.remove('show');
      });
    }
  }

  /* ══════════════════════════════════════════════
     14. BOOTSTRAP INITIALIZATION
  ═══════════════════════════════════════════════ */
  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  onReady(() => {
    initScrollWidgets();
    initMobileMenu();
    initScrollReveal();
    initWishlist();
    initCompareEvents();
    initLightboxEvents();
    initSearchSuggestions();
    initPWA();
    initChatWidget();
    initCalculatorTabs();
    initCookieSystem();
  });
})();