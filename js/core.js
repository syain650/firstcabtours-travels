/**
 * FIRST CAB — CORE.JS  (bug-fixed)
 * Removed: custom cursor entirely.
 * All other features intact.
 */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const isTouch = () => window.matchMedia('(pointer: coarse)').matches;

  /* ─── NAVBAR ─── */
  function initNavbar() {
    const nav = $('.fc-nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const page = location.pathname.split('/').pop() || 'index.html';
    $$('.fc-nav-links a, .fc-mobile-nav a').forEach(a => {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });
  }

  /* ─── HAMBURGER & MOBILE NAV ─── */
  function initHamburger() {
    const btn  = $('#fc-hamburger');
    const menu = $('#fc-mobile-nav');
    const overlay = $('#fc-nav-overlay');
    if (!btn || !menu) return;

    const open  = () => { 
      menu.classList.add('open'); 
      if (overlay) overlay.classList.add('open');
      btn.setAttribute('aria-expanded', 'true'); 
      document.body.style.overflow = 'hidden'; // prevent bg scroll
    };
    const close = () => { 
      menu.classList.remove('open'); 
      if (overlay) overlay.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false'); 
      document.body.style.overflow = ''; 
    };
    const toggle = () => menu.classList.contains('open') ? close() : open();
    
    btn.addEventListener('click', toggle);
    btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    $$('a', menu).forEach(a => a.addEventListener('click', close));
    
    if (overlay) overlay.addEventListener('click', close);

    document.addEventListener('click', e => {
      if (!menu.contains(e.target) && !btn.contains(e.target) && (!overlay || !overlay.contains(e.target))) close();
    });
  }

  /* ─── SCROLL REVEAL ─── */
  function initScrollReveal() {
    const els = $$('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const delay = parseInt(entry.target.dataset.delay || '0', 10);
        setTimeout(() => entry.target.classList.add('active'), delay);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
    $$('.stagger-children').forEach(parent => {
      $$('.reveal, .reveal-up', parent).forEach((child, i) => {
        if (!child.dataset.delay) child.dataset.delay = i * 85;
      });
    });
    els.forEach(el => obs.observe(el));
  }

  /* ─── COUNTER ANIMATION ─── */
  function initCounters() {
    const counters = $$('.fc-counter');
    if (!counters.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.target.dataset.done) return;
        entry.target.dataset.done = '1';
        const target   = parseFloat(entry.target.dataset.target || '0');
        const suffix   = entry.target.dataset.suffix || '';
        const prefix   = entry.target.dataset.prefix || '';
        const decimal  = target % 1 !== 0;
        const duration = 1800;
        const start    = performance.now();
        const ease     = t => 1 - Math.pow(1 - t, 3);
        const step = now => {
          const p = Math.min((now - start) / duration, 1);
          entry.target.textContent = prefix + (decimal ? (target * ease(p)).toFixed(1) : Math.floor(target * ease(p))) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
  }

  /* ─── RIPPLE ─── */
  function initRipple() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const r = document.createElement('span');
      r.className = 'ripple';
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;`;
      btn.appendChild(r);
      setTimeout(() => r.remove(), 560);
    });
  }

  /* ─── BACK TO TOP ─── */
  function initBackToTop() {
    const btn = $('.fc-back-top');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ─── FLOATING GROUP OVERLAP CONTROL ─── */
  function initFloatingGroup() {
    const group = $('.fc-floating-group');
    const blockers = $$('.fc-qb-bar, .fc-cta-sec, .fc-footer');
    if (!group || !blockers.length) return;

    const mobileQuery = window.matchMedia('(max-width: 768px)');
    let rafId = 0;

    const updatePosition = () => {
      rafId = 0;

      if (mobileQuery.matches) {
        group.style.transform = 'none';
        return;
      }

      const groupBottomOffset = parseFloat(window.getComputedStyle(group).bottom) || 120;
      const groupBottomEdge = window.innerHeight - groupBottomOffset;
      const safeMargin = 20;
      let nearestBlockerTop = Infinity;

      blockers.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          nearestBlockerTop = Math.min(nearestBlockerTop, rect.top);
        }
      });

      if (nearestBlockerTop < Infinity && nearestBlockerTop < groupBottomEdge + safeMargin) {
        const shift = Math.ceil((groupBottomEdge + safeMargin) - nearestBlockerTop);
        group.style.transform = `translateY(-${shift}px)`;
      } else {
        group.style.transform = 'none';
      }
    };

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updatePosition);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    mobileQuery.addEventListener?.('change', scheduleUpdate);
    scheduleUpdate();
  }


  /* ─── PARTICLES ─── */
  function initParticles() {
    const container = $('#fc-particles');
    if (!container || isTouch()) return;
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.className = 'fc-particle';
      const size = 1 + Math.random() * 2;
      p.style.cssText = `left:${Math.random() * 100}%;bottom:${Math.random() * 25}%;width:${size}px;height:${size}px;--tx:${(Math.random() - 0.5) * 160}px;--dur:${6 + Math.random() * 10}s;--delay:${Math.random() * 9}s;--op:${0.4 + Math.random() * 0.5};`;
      container.appendChild(p);
    }
  }

  /* ─── ROAD ANIMATION ─── */
  function initRoad() {
    const track = $('#fc-road-track');
    if (!track) return;
    for (let i = 0; i < 28; i++) {
      const d = document.createElement('div');
      d.className = 'fc-road-dash';
      track.appendChild(d);
    }
  }

  /* ─── CHATBOT ─── */
  function initChatbot() {
    const toggle  = $('.fc-chat-toggle');
    const box     = $('.fc-chat-box');
    const closeBtn= $('.fc-chat-close');
    const msgs    = $('.fc-chat-msgs');
    const input   = $('.fc-chat-input');
    const sendBtn = $('.fc-chat-send');
    if (!toggle || !box) return;

    const open  = () => { box.classList.add('open'); box.setAttribute('aria-hidden', 'false'); toggle.setAttribute('aria-expanded', 'true'); input?.focus(); };
    const close = () => { box.classList.remove('open'); box.setAttribute('aria-hidden', 'true'); toggle.setAttribute('aria-expanded', 'false'); };

    toggle.addEventListener('click', () => box.classList.contains('open') ? close() : open());
    toggle.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); box.classList.contains('open') ? close() : open(); } });
    closeBtn?.addEventListener('click', close);
    document.addEventListener('click', e => { if (!box.contains(e.target) && !toggle.contains(e.target)) close(); });

    function addMsg(html, sender = 'bot') {
      if (!msgs) return;
      const now  = new Date();
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      const el   = document.createElement('div');
      el.className = `fc-chat-msg fc-msg-${sender}`;
      el.innerHTML = `<div class="fc-msg-bubble">${html}</div><div class="fc-msg-time">${time}</div>`;
      msgs.appendChild(el);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function getReply(text) {
      const m = (text || '').toLowerCase();
      if (m.match(/airport|flight|pickup/))          return '✈️ Airport transfers available 24/7 with flight tracking. Call <strong>+91 98849 57791</strong> to book instantly.';
      if (m.match(/outstation|pondicherry|tirupati/)) return '🛣 Outstation trips to Pondicherry, Tirupati, Mahabalipuram & more. Call <strong>+91 98849 57791</strong>.';
      if (m.match(/package|hour/))                   return '📦 4-hour and 8-hour packages for Sedan, Innova & Crysta. Call <strong>+91 98849 57791</strong> for rates.';
      if (m.match(/price|rate|cost|fare|how much/))  return '💰 Rates depend on vehicle & distance. Call <strong>+91 98849 57791</strong> for an instant quote.';
      if (m.match(/service|offer/))                  return '🚗 Airport Transfers, City Rides, Outstation & Hourly Packages. <a href="services.html" style="color:#F5B400">See all →</a>';
      if (m.match(/hi|hello|hey/))                   return '👋 Hello! Ask me about our services or call <strong>+91 98849 57791</strong> — we\'re available 24/7.';
      if (m.match(/contact|call|book/))              return '📞 Call or WhatsApp anytime: <strong>+91 98849 57791</strong> — 24/7!';
      if (m.match(/whatsapp/))                       return '💬 WhatsApp: <a href="https://wa.me/919884957791" style="color:#F5B400;font-weight:700" target="_blank">+91 98849 57791</a>';
      return '🙏 For the fastest help, call or WhatsApp <strong>+91 98849 57791</strong> — available 24/7.';
    }

    $$('.fc-chat-qr').forEach(btn => {
      btn.addEventListener('click', () => {
        addMsg(btn.textContent.trim(), 'user');
        setTimeout(() => addMsg(getReply(btn.dataset.q || btn.textContent), 'bot'), 650);
      });
    });

    const sendMsg = () => {
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;
      addMsg(text, 'user');
      input.value = '';
      setTimeout(() => addMsg(getReply(text), 'bot'), 700);
    };
    sendBtn?.addEventListener('click', sendMsg);
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') sendMsg(); });
  }

  /* ─── CONTACT FORM ─── */
  function initContactForm() {
    const form  = $('#fc-contact-form');
    const msgEl = $('#fc-form-msg');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn      = form.querySelector('[type="submit"]');
      const origHTML = btn.innerHTML;
      btn.innerHTML  = '<i class="fas fa-spinner fa-spin"></i> Sending…';
      btn.disabled   = true;
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (res.ok) {
          if (msgEl) { msgEl.className = 'fc-form-msg success'; msgEl.innerHTML = '<i class="fas fa-check-circle"></i> Message sent! We\'ll be in touch shortly.'; }
          form.reset();
        } else { throw new Error(); }
      } catch {
        if (msgEl) { msgEl.className = 'fc-form-msg error'; msgEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Something went wrong — please call +91 98849 57791.'; }
      } finally {
        btn.innerHTML = origHTML;
        btn.disabled  = false;
      }
    });
  }

  /* ─── TESTIMONIAL SLIDER ─── */
  function initTestimonialSlider() {
    const slider = $('.fc-testi-slider');
    const cards = $$('.fc-testi-card');
    if (!slider || !cards.length) return;

    cards[0].classList.add('active');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            cards.forEach(c => c.classList.remove('active'));
            entry.target.classList.add('active');
          }
        });
      }, {
        root: slider,
        threshold: 0.6,
        rootMargin: '0px -20% 0px -20%'
      });
      cards.forEach(card => observer.observe(card));
    }
  }

  /* ─── PREMIUM SLASH CURSOR (Desktop only) ─── */
  function initPremiumCursor() {
    // Only for fine-pointer devices (non-touch desktop)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    // Inject cursor elements
    const outer = document.createElement('div');
    const dot   = document.createElement('div');
    const slash = document.createElement('div');
    outer.className = 'fc-cursor-outer';
    dot.className   = 'fc-cursor-dot';
    slash.className = 'fc-cursor-slash';
    slash.textContent = '/';
    document.body.append(outer, dot, slash);

    let mouseX = -200, mouseY = -200;
    let outerX = -200, outerY = -200;
    let raf;

    // Snap dot to cursor instantly
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
      slash.style.left = mouseX + 'px';
      slash.style.top  = mouseY + 'px';
    });

    // Outer ring lags with lerp for magnetic feel
    function lerp(a, b, t) { return a + (b - a) * t; }
    function animateOuter() {
      outerX = lerp(outerX, mouseX, 0.14);
      outerY = lerp(outerY, mouseY, 0.14);
      outer.style.left = outerX + 'px';
      outer.style.top  = outerY + 'px';
      raf = requestAnimationFrame(animateOuter);
    }
    animateOuter();

    // Interactive elements — expand ring, show slash
    const interactiveSelector = 'a, button, [role="button"], input, textarea, select, label, .fc-fleet-card, .fc-testi-card, .fc-journey-tab';
    function onEnterInteractive() {
      outer.classList.add('hovered');
      dot.classList.add('hovered');
      slash.classList.add('hovered');
    }
    function onLeaveInteractive() {
      outer.classList.remove('hovered');
      dot.classList.remove('hovered');
      slash.classList.remove('hovered');
    }

    document.addEventListener('mouseover', e => {
      if (e.target.closest(interactiveSelector)) onEnterInteractive();
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(interactiveSelector)) onLeaveInteractive();
    });

    // Click burst
    document.addEventListener('mousedown', () => {
      outer.classList.add('clicked');
    });
    document.addEventListener('mouseup', () => {
      setTimeout(() => outer.classList.remove('clicked'), 200);
    });

    // Hide when cursor leaves window
    document.addEventListener('mouseleave', () => { outer.style.opacity = '0'; dot.style.opacity = '0'; slash.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { outer.style.opacity = '1'; dot.style.opacity = '1'; });
  }

  /* ─── JOURNEY–VEHICLE TAB FILTER ─── */
  function initJourneyTabs() {
    const tabs  = $$('.fc-journey-tab');
    const cards = $$('.fc-fleet-card[data-journeys]');
    if (!tabs.length || !cards.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const journey = tab.dataset.journey;

        // Update tab active state
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Filter cards
        cards.forEach(card => {
          const journeys = card.dataset.journeys || 'all';
          if (journey === 'all' || journeys.includes(journey)) {
            card.classList.remove('journey-dimmed');
            card.classList.add('journey-highlighted');
            // Remove highlight after 1.2s so they all look normal again
            setTimeout(() => card.classList.remove('journey-highlighted'), 1200);
          } else {
            card.classList.remove('journey-highlighted');
            card.classList.add('journey-dimmed');
          }
          // Reset if 'all' selected
          if (journey === 'all') {
            setTimeout(() => card.classList.remove('journey-dimmed'), 50);
          }
        });
      });
    });
  }

  /* ─── INIT ─── */
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initHamburger();
    initScrollReveal();
    initCounters();
    initRipple();
    initBackToTop();
    initParticles();
    initRoad();
    initChatbot();
    initFloatingGroup();
    initContactForm();
    initTestimonialSlider();
    initPremiumCursor();
    initJourneyTabs();
    initFleetCarousel();
    initPremiumServicesCarousel();
  });

  /* ─── FLEET CAROUSEL ─── */
  function initFleetCarousel() {
    const carousel   = $('#fc-carousel');
    const track      = $('#fc-carousel-track');
    const slides     = track ? [...track.querySelectorAll('.fc-carousel-slide')] : [];
    const dots       = $$('.fc-carousel-dot');
    const prevBtn    = $('#fc-carousel-prev');
    const nextBtn    = $('#fc-carousel-next');

    if (!carousel || !track || slides.length === 0) return;

    let current     = 0;
    let autoTimer   = null;
    let isPaused    = false;
    let isDesktop   = window.matchMedia('(min-width: 1024px)').matches;
    let perView     = isDesktop ? 3 : (window.matchMedia('(min-width: 640px)').matches ? 2 : 1);
    let total       = slides.length;
    let maxIndex    = Math.max(0, total - perView);

    // ── Helpers ──
    function getSlideWidth() {
      return slides[0] ? slides[0].getBoundingClientRect().width : 0;
    }

    function goTo(index, animate = true) {
      if (!animate) track.style.transition = 'none';
      else          track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

      current = Math.max(0, Math.min(index, maxIndex));
      track.style.transform = `translateX(-${current * getSlideWidth()}px)`;

      // Sync dots
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-selected', String(i === current));
      });

      if (!animate) {
        // Force reflow then re-enable transition
        track.getBoundingClientRect();
        track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      }
    }

    function next() { goTo(current >= maxIndex ? 0 : current + 1); }
    function prev() { goTo(current <= 0 ? maxIndex : current - 1); }

    // ── Auto-slide ──
    function startAuto() {
      clearInterval(autoTimer);
      if (isPaused) return;
      autoTimer = setInterval(next, 3000);
    }
    function stopAuto() { clearInterval(autoTimer); }

    // ── Pause on hover (desktop) ──
    carousel.addEventListener('mouseenter', () => { isPaused = true; stopAuto(); });
    carousel.addEventListener('mouseleave', () => { isPaused = false; startAuto(); });

    // ── Arrows ──
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });

    // ── Dots ──
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.dataset.slide, 10));
        startAuto();
      });
    });

    // ── Touch / Mouse drag ──
    let startX = 0, startY = 0, dragDeltaX = 0, isDragging = false, startTranslate = 0;

    function getEventX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
    function getEventY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }

    function onDragStart(e) {
      isDragging = true;
      startX     = getEventX(e);
      startY     = getEventY(e);
      startTranslate = current * getSlideWidth();
      track.classList.add('dragging');
      stopAuto();
    }

    function onDragMove(e) {
      if (!isDragging) return;
      const dx = getEventX(e) - startX;
      const dy = getEventY(e) - startY;

      // If more vertical than horizontal scroll, abort
      if (Math.abs(dy) > Math.abs(dx) + 5) { isDragging = false; return; }
      e.preventDefault();
      dragDeltaX = dx;
      track.style.transform = `translateX(${-(startTranslate - dx)}px)`;
    }

    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('dragging');
      const threshold = getSlideWidth() * 0.25;
      if (dragDeltaX < -threshold) next();
      else if (dragDeltaX > threshold) prev();
      else goTo(current);
      startAuto();
    }

    // Touch events
    track.addEventListener('touchstart',  onDragStart, { passive: true });
    track.addEventListener('touchmove',   onDragMove,  { passive: false });
    track.addEventListener('touchend',    onDragEnd);
    track.addEventListener('touchcancel', onDragEnd);

    // Mouse drag events
    track.addEventListener('mousedown',  onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup',   onDragEnd);

    // ── Responsive recalculate ──
    window.addEventListener('resize', () => {
      isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      perView   = isDesktop ? 3 : (window.matchMedia('(min-width: 640px)').matches ? 2 : 1);
      maxIndex  = Math.max(0, total - perView);
      goTo(Math.min(current, maxIndex), false);
      stopAuto();
      startAuto();
    });

    // ── Keyboard accessibility ──
    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { prev(); startAuto(); }
      if (e.key === 'ArrowRight') { next(); startAuto(); }
    });

    // ── Journey filter: sync carousel ──
    $$('.fc-journey-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const journey = tab.dataset.journey;
        slides.forEach((slide, i) => {
          const journeys = slide.dataset.journeys || 'all';
          const matches  = journey === 'all' || journeys.includes(journey);
          slide.style.opacity  = matches ? '1' : '0.3';
          slide.style.filter   = matches ? 'none' : 'grayscale(0.5)';
          slide.style.transform = matches ? '' : 'scale(0.97)';
        });
        // Snap to first matching slide
        const firstMatch = slides.findIndex(s => {
          const j = s.dataset.journeys || 'all';
          return journey === 'all' || j.includes(journey);
        });
        if (firstMatch >= 0) goTo(Math.min(firstMatch, maxIndex));
        startAuto();
      });
    });

    // ── Start ──
    goTo(0, false);
    startAuto();
  }

  /* ─── PREMIUM SERVICES CAROUSEL ─── */
  function initPremiumServicesCarousel() {
    makeCarousel({
      carouselId : 'fc-ps-carousel',
      trackId    : 'fc-ps-track',
      dotsId     : 'fc-ps-dots',
      prevId     : 'fc-ps-prev',
      nextId     : 'fc-ps-next',
      slideClass : 'fc-ps-slide',
      interval   : 2800,
    });
  }

  /**
   * Generic carousel factory — works for any carousel on the page.
   * Supports: auto-play, touch drag, mouse drag, dots, arrows,
   *           pause on hover, keyboard nav, responsive perView.
   */
  function makeCarousel(opts) {
    const carousel = document.getElementById(opts.carouselId);
    const track    = document.getElementById(opts.trackId);
    const slides   = track ? [...track.querySelectorAll('.' + opts.slideClass)] : [];
    const dots     = document.querySelectorAll(`#${opts.dotsId} .fc-carousel-dot`);
    const prevBtn  = document.getElementById(opts.prevId);
    const nextBtn  = document.getElementById(opts.nextId);

    if (!carousel || !track || slides.length === 0) return;

    let current   = 0;
    let autoTimer = null;
    let isPaused  = false;
    let isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    let perView   = isDesktop ? 3 : (window.matchMedia('(min-width: 640px)').matches ? 2 : 1);
    let maxIndex  = Math.max(0, slides.length - perView);

    function getSlideWidth() {
      return slides[0] ? slides[0].getBoundingClientRect().width : 0;
    }

    function goTo(index, animate) {
      if (animate === false) track.style.transition = 'none';
      else track.style.transition = 'transform 0.48s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      current = Math.max(0, Math.min(index, maxIndex));
      track.style.transform = `translateX(-${current * getSlideWidth()}px)`;
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-selected', String(i === current));
      });
      if (animate === false) {
        track.getBoundingClientRect();
        track.style.transition = 'transform 0.48s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      }
    }

    function next() { goTo(current >= maxIndex ? 0 : current + 1); }
    function prev() { goTo(current <= 0 ? maxIndex : current - 1); }

    function startAuto() {
      clearInterval(autoTimer);
      if (isPaused) return;
      autoTimer = setInterval(next, opts.interval || 3000);
    }
    function stopAuto() { clearInterval(autoTimer); }

    // Hover pause
    carousel.addEventListener('mouseenter', () => { isPaused = true;  stopAuto(); });
    carousel.addEventListener('mouseleave', () => { isPaused = false; startAuto(); });

    // Arrows
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });

    // Dots
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.dataset.slide, 10));
        startAuto();
      });
    });

    // Drag / Swipe
    let startX = 0, startY = 0, deltaX = 0, dragging = false, startT = 0;

    function getX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
    function getY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }

    function onStart(e) {
      dragging   = true;
      startX     = getX(e);
      startY     = getY(e);
      startT     = current * getSlideWidth();
      deltaX     = 0;
      track.classList.add('dragging');
      stopAuto();
    }

    function onMove(e) {
      if (!dragging) return;
      const dx = getX(e) - startX;
      const dy = getY(e) - startY;
      if (Math.abs(dy) > Math.abs(dx) + 5) { dragging = false; return; }
      if (e.cancelable) e.preventDefault();
      deltaX = dx;
      track.style.transform = `translateX(${-(startT - dx)}px)`;
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('dragging');
      const thresh = getSlideWidth() * 0.25;
      if (deltaX < -thresh) next();
      else if (deltaX > thresh) prev();
      else goTo(current);
      startAuto();
    }

    track.addEventListener('touchstart',  onStart, { passive: true });
    track.addEventListener('touchmove',   onMove,  { passive: false });
    track.addEventListener('touchend',    onEnd);
    track.addEventListener('touchcancel', onEnd);
    track.addEventListener('mousedown',   onStart);
    window.addEventListener('mousemove',  onMove);
    window.addEventListener('mouseup',    onEnd);

    // Responsive
    window.addEventListener('resize', () => {
      isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      perView   = isDesktop ? 3 : (window.matchMedia('(min-width: 640px)').matches ? 2 : 1);
      maxIndex  = Math.max(0, slides.length - perView);
      goTo(Math.min(current, maxIndex), false);
    });

    // Keyboard
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { prev(); startAuto(); }
      if (e.key === 'ArrowRight') { next(); startAuto(); }
    });

    goTo(0, false);
    startAuto();
  }

})();



