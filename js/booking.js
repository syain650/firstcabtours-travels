/**
 * FIRST CAB — SMART BOOKING SYSTEM  (booking.js)
 * Simple Professional Version
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────
     VEHICLE OPTIONS
  ───────────────────────────────────────── */
  const VEHICLES = [
    { v: '',                       label: 'Select vehicle…' },
    { v: 'Mini',                   label: 'Mini' },
    { v: 'Sedan',                  label: 'Sedan' },
    { v: 'Innova',                 label: 'Innova' },
    { v: 'Innova Crysta',          label: 'Innova Crysta' },
    { v: 'Innova Hycross',         label: 'Innova Hycross' },
    { v: 'Tempo Traveller',        label: 'Tempo Traveller' },
  ];

  const AIRLINES = [
    '', 'IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'GoFirst', 'AirAsia India',
    'Blue Dart Aviation', 'Emirates', 'Qatar Airways', 'Singapore Airlines', 'Etihad',
    'Lufthansa', 'British Airways', 'Oman Air', 'Malaysian Airlines', 'Other'
  ];

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const today = () => new Date().toISOString().split('T')[0];

  function sel(opts, id, cls = 'fcb-select', req = true) {
    return `<div class="fcb-sel-wrap"><select id="${id}" class="${cls}"${req ? ' aria-required="true"' : ''}>
      ${opts.map(o => typeof o === 'string'
        ? `<option value="${o}">${o || 'Select…'}</option>`
        : `<option value="${o.v}">${o.label}</option>`
      ).join('')}
    </select></div>`;
  }

  function inp(type, id, placeholder = '', extra = '', req = true) {
    const isPickup = id.includes('pickup');
    const locateBtn = isPickup ? `<button type="button" class="fc-locate-btn" aria-label="Locate me" onclick="locateUser(this, '${id}')"><i class="fas fa-crosshairs"></i></button>` : '';
    return `<div class="fc-input-wrap">
      <input type="${type}" id="${id}" class="fcb-input" placeholder="${placeholder}"
      ${req ? 'aria-required="true"' : ''} ${extra}>
      ${locateBtn}
    </div>`;
  }

  function field(labelText, content, errId = '') {
    return `<div class="fcb-field">
      <label>${labelText} <span class="fcb-req">*</span></label>
      ${content}
      ${errId ? `<span class="fcb-err-msg" id="${errId}"></span>` : ''}
    </div>`;
  }

  function row(...fields) {
    return `<div class="fcb-row">${fields.join('')}</div>`;
  }

  function vehicleField(id) {
    return field('<i class="fas fa-car"></i> Vehicle Type', sel(VEHICLES, id, 'fcb-select'), id + '-err');
  }

  function customerFields(prefix) {
    return row(
      field('<i class="fas fa-user"></i> Your Name',
        inp('text', prefix + '-name', 'Full name', 'autocomplete="name"'),
        prefix + '-name-err'),
      field('<i class="fas fa-mobile-alt"></i> Mobile Number',
        inp('tel', prefix + '-phone', '+91 9XXXXXXXXX', 'autocomplete="tel" maxlength="15"'),
        prefix + '-phone-err')
    );
  }

  function divider() { return '<hr class="fcb-divider">'; }

  /* ─────────────────────────────────────────
     PANEL BUILDERS
  ───────────────────────────────────────── */

  // ── AIRPORT ──────────────────────────────
  function buildAirport() {
    return `
    ${row(
      field('<i class="fas fa-map-marker-alt"></i> Pickup Location',
        inp('text', 'apt-pickup', 'Hotel / Home / Office address…'),
        'apt-pickup-err'),
      field('<i class="fas fa-location-dot"></i> Drop Location',
        inp('text', 'apt-drop', 'Destination address…'),
        'apt-drop-err')
    )}

    ${row(
      field('<i class="fas fa-calendar"></i> Travel Date',
        `<input type="date" id="apt-date" class="fcb-input" aria-required="true">`,
        'apt-date-err'),
      field('<i class="fas fa-clock"></i> Pickup Time',
        `<input type="time" id="apt-time" class="fcb-input" aria-required="true">`,
        'apt-time-err')
    )}

    ${divider()}

    ${row(
      field('<i class="fas fa-plane"></i> Flight Number',
        inp('text', 'apt-flight', 'e.g. 6E2345, AI541', 'maxlength="10" style="text-transform:uppercase"'),
        'apt-flight-err'),
      field('<i class="fas fa-plane-departure"></i> Airline',
        sel(AIRLINES, 'apt-airline'),
        'apt-airline-err')
    )}

    ${divider()}

    ${vehicleField('apt-vehicle')}
    ${customerFields('apt')}
    `;
  }

  // ── RAILWAY ───────────────────────────────
  function buildRailway() {
    return `
    ${row(
      field('<i class="fas fa-train"></i> Pickup Station',
        inp('text', 'rly-station', 'e.g. Chennai Central, Egmore…'),
        'rly-station-err'),
      field('<i class="fas fa-location-dot"></i> Drop Location',
        inp('text', 'rly-drop', 'Destination address…'),
        'rly-drop-err')
    )}

    ${row(
      field('<i class="fas fa-calendar"></i> Travel Date',
        `<input type="date" id="rly-date" class="fcb-input" aria-required="true">`,
        'rly-date-err'),
      field('<i class="fas fa-clock"></i> Pickup Time',
        `<input type="time" id="rly-time" class="fcb-input" aria-required="true">`,
        'rly-time-err')
    )}

    ${divider()}

    <div class="fcb-row" style="grid-template-columns: 1fr;">
      ${field('<i class="fas fa-hashtag"></i> Train Number',
        inp('text', 'rly-train-no', 'e.g. 12001, 22621', 'maxlength="8"'),
        'rly-train-no-err')}
    </div>

    ${divider()}

    ${vehicleField('rly-vehicle')}
    ${customerFields('rly')}
    `;
  }

  // ── CITY RIDE ─────────────────────────────
  function buildCity() {
    return `
    ${row(
      field('<i class="fas fa-map-marker-alt"></i> Pickup Address',
        inp('text', 'cty-pickup', 'Enter pickup address…'),
        'cty-pickup-err'),
      field('<i class="fas fa-location-dot"></i> Destination',
        inp('text', 'cty-drop', 'Enter destination…'),
        'cty-drop-err')
    )}

    ${row(
      field('<i class="fas fa-calendar"></i> Travel Date',
        `<input type="date" id="cty-date" class="fcb-input" aria-required="true">`,
        'cty-date-err'),
      field('<i class="fas fa-clock"></i> Pickup Time',
        `<input type="time" id="cty-time" class="fcb-input" aria-required="true">`,
        'cty-time-err')
    )}

    ${divider()}

    ${vehicleField('cty-vehicle')}
    ${customerFields('cty')}
    `;
  }

  // ── OUTSTATION ────────────────────────────
  function buildOutstation() {
    return `
    ${row(
      field('<i class="fas fa-map-marker-alt"></i> Pickup Location',
        inp('text', 'out-pickup', 'Departure city / address…'),
        'out-pickup-err'),
      field('<i class="fas fa-location-dot"></i> Destination',
        inp('text', 'out-drop', 'Destination city / address…'),
        'out-drop-err')
    )}

    ${row(
      field('<i class="fas fa-calendar"></i> Travel Date',
        `<input type="date" id="out-date" class="fcb-input" aria-required="true">`,
        'out-date-err'),
      field('<i class="fas fa-clock"></i> Pickup Time',
        `<input type="time" id="out-time" class="fcb-input" aria-required="true">`,
        'out-time-err')
    )}

    ${divider()}

    ${vehicleField('out-vehicle')}
    ${customerFields('out')}
    `;
  }

  /* ─────────────────────────────────────────
     MOUNT PANELS INTO DOM
  ───────────────────────────────────────── */
  const PANELS = {
    airport:    { label: '✈️ Airport',   build: buildAirport },
    railway:    { label: '🚆 Railway',   build: buildRailway },
    city:       { label: '🚖 City Ride', build: buildCity },
    outstation: { label: '🛣️ Outstation', build: buildOutstation },
  };

  function mountPanels(container) {
    Object.entries(PANELS).forEach(([key, cfg]) => {
      const panel = document.createElement('div');
      panel.className = 'fcb-panel';
      panel.id = 'fcb-panel-' + key;
      panel.innerHTML = cfg.build();
      container.appendChild(panel);
    });
  }

  /* ─────────────────────────────────────────
     VALIDATION
  ───────────────────────────────────────── */
  const RULES = {
    airport: [
      { id: 'apt-pickup',      msg: 'Please enter pickup location.' },
      { id: 'apt-drop',        msg: 'Please enter drop location.' },
      { id: 'apt-date',        msg: 'Please select travel date.' },
      { id: 'apt-time',        msg: 'Please select pickup time.' },
      { id: 'apt-flight',      msg: 'Please enter flight number.', pattern: /^[A-Z0-9]{3,8}$/i },
      { id: 'apt-airline',     msg: 'Please select airline.' },
      { id: 'apt-vehicle',     msg: 'Please select a vehicle.' },
      { id: 'apt-name',        msg: 'Please enter your name.' },
      { id: 'apt-phone',       msg: 'Please enter a valid 10-digit mobile number.', pattern: /^(?:\+91|91|0)?[6-9]\d{9}$/ },
    ],
    railway: [
      { id: 'rly-station',      msg: 'Please enter pickup station.' },
      { id: 'rly-drop',         msg: 'Please enter drop location.' },
      { id: 'rly-date',         msg: 'Please select travel date.' },
      { id: 'rly-time',         msg: 'Please select pickup time.' },
      { id: 'rly-train-no',     msg: 'Please enter train number.', pattern: /^\d{4,6}$/ },
      { id: 'rly-vehicle',      msg: 'Please select a vehicle.' },
      { id: 'rly-name',         msg: 'Please enter your name.' },
      { id: 'rly-phone',        msg: 'Please enter a valid 10-digit mobile number.', pattern: /^(?:\+91|91|0)?[6-9]\d{9}$/ },
    ],
    city: [
      { id: 'cty-pickup',  msg: 'Please enter pickup address.' },
      { id: 'cty-drop',    msg: 'Please enter destination.' },
      { id: 'cty-date',    msg: 'Please select date.' },
      { id: 'cty-time',    msg: 'Please select pickup time.' },
      { id: 'cty-vehicle', msg: 'Please select a vehicle.' },
      { id: 'cty-name',    msg: 'Please enter your name.' },
      { id: 'cty-phone',   msg: 'Please enter a valid 10-digit mobile number.', pattern: /^(?:\+91|91|0)?[6-9]\d{9}$/ },
    ],
    outstation: [
      { id: 'out-pickup',  msg: 'Please enter pickup location.' },
      { id: 'out-drop',    msg: 'Please enter destination.' },
      { id: 'out-date',    msg: 'Please select travel date.' },
      { id: 'out-time',    msg: 'Please select pickup time.' },
      { id: 'out-vehicle', msg: 'Please select a vehicle.' },
      { id: 'out-name',    msg: 'Please enter your name.' },
      { id: 'out-phone',   msg: 'Please enter a valid 10-digit mobile number.', pattern: /^(?:\+91|91|0)?[6-9]\d{9}$/ },
    ],
  };

  function clearErrors(svc) {
    (RULES[svc] || []).forEach(r => {
      const el = $(r.id);
      if (!el) return;
      el.classList.remove('fcb-err');
      const errSpan = $(r.id + '-err');
      if (errSpan) { errSpan.textContent = ''; errSpan.classList.remove('visible'); }
    });
  }

  function validate(svc) {
    let firstInvalid = null;
    let valid = true;
    (RULES[svc] || []).forEach(r => {
      const el = $(r.id);
      if (!el) return;
      const val = (el.value || '').trim();
      let err = '';
      if (!val) {
        err = r.msg;
      } else if (r.pattern && !r.pattern.test(val)) {
        err = r.msg;
      }
      const errSpan = $(r.id + '-err');
      if (err) {
        el.classList.add('fcb-err');
        if (errSpan) { errSpan.textContent = err; errSpan.classList.add('visible'); }
        valid = false;
        if (!firstInvalid) firstInvalid = el;
      } else {
        el.classList.remove('fcb-err');
        if (errSpan) { errSpan.textContent = ''; errSpan.classList.remove('visible'); }
      }
    });
    if (!valid && firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return valid;
  }

  /* ─────────────────────────────────────────
     SECURITY & SANITIZATION
  ───────────────────────────────────────── */
  function sanitizeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  /* ─────────────────────────────────────────
     WHATSAPP MESSAGE BUILDERS
  ───────────────────────────────────────── */
  function v(id) { 
    const el = $(id);
    return (el && el.value.trim()) ? sanitizeHTML(el.value.trim()) : '—'; 
  }

  function formatDate(id) {
    const raw = $(id)?.value;
    if (!raw) return '—';
    return new Date(raw).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function formatTime(id) {
    const raw = $(id)?.value;
    if (!raw) return '—';
    const [h, m] = raw.split(':');
    const hr = parseInt(h, 10);
    return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  }

  function buildAirportMsg() {
    return `🚖 *FIRST CAB Booking Request*

*Booking Type:* Airport Transfer

*Customer:* ${v('apt-name')}
*Phone:* ${v('apt-phone')}

*Pickup:* ${v('apt-pickup')}
*Destination:* ${v('apt-drop')}

*Travel Date:* ${formatDate('apt-date')}
*Pickup Time:* ${formatTime('apt-time')}

*Flight Number:* ${v('apt-flight').toUpperCase()}
*Airline:* ${v('apt-airline')}

*Vehicle:* ${v('apt-vehicle')}

Kindly share the fare and confirm my booking.

Thank you.`;
  }

  function buildRailwayMsg() {
    return `🚖 *FIRST CAB Booking Request*

*Booking Type:* Railway Station Transfer

*Customer:* ${v('rly-name')}
*Phone:* ${v('rly-phone')}

*Pickup Station:* ${v('rly-station')}
*Destination:* ${v('rly-drop')}

*Travel Date:* ${formatDate('rly-date')}
*Pickup Time:* ${formatTime('rly-time')}

*Train Number:* ${v('rly-train-no')}

*Vehicle:* ${v('rly-vehicle')}

Kindly share the fare and confirm my booking.

Thank you.`;
  }

  function buildCityMsg() {
    return `🚖 *FIRST CAB Booking Request*

*Booking Type:* City Ride

*Customer:* ${v('cty-name')}
*Phone:* ${v('cty-phone')}

*Pickup:* ${v('cty-pickup')}
*Destination:* ${v('cty-drop')}

*Travel Date:* ${formatDate('cty-date')}
*Pickup Time:* ${formatTime('cty-time')}

*Vehicle:* ${v('cty-vehicle')}

Kindly share the fare and confirm my booking.

Thank you.`;
  }

  function buildOutstationMsg() {
    return `🚖 *FIRST CAB Booking Request*

*Booking Type:* Outstation Trip

*Customer:* ${v('out-name')}
*Phone:* ${v('out-phone')}

*Pickup:* ${v('out-pickup')}
*Destination:* ${v('out-drop')}

*Travel Date:* ${formatDate('out-date')}
*Pickup Time:* ${formatTime('out-time')}

*Vehicle:* ${v('out-vehicle')}

Kindly share the fare and confirm my booking.

Thank you.`;
  }


  /* ─────────────────────────────────────────
     REAL-TIME CLEAR ERRORS ON INPUT
  ───────────────────────────────────────── */
  function initClearOnInput(container, svc) {
    (RULES[svc] || []).forEach(r => {
      const el = $(r.id);
      if (!el) return;
      const evt = (el.tagName === 'SELECT') ? 'change' : 'input';
      el.addEventListener(evt, () => {
        el.classList.remove('fcb-err');
        const errSpan = $(r.id + '-err');
        if (errSpan) { errSpan.textContent = ''; errSpan.classList.remove('visible'); }
      }, { passive: true });
    });
  }

  /* ─────────────────────────────────────────
     DATE DEFAULTS
  ───────────────────────────────────────── */
  function setDateDefaults() {
    const t = today();
    ['apt-date','rly-date','cty-date','out-date'].forEach(id => {
      const el = $(id);
      if (el) { el.min = t; el.value = t; }
    });
  }

  /* ─────────────────────────────────────────
     SERVICE SWITCHER
  ───────────────────────────────────────── */
  function initServiceTabs(svcTabsEl, fieldsContainer) {
    let currentSvc = 'airport';

    const showPanel = svc => {
      currentSvc = svc;
      fieldsContainer.querySelectorAll('.fcb-panel').forEach(p => p.classList.remove('active'));
      const panel = $('fcb-panel-' + svc);
      if (panel) panel.classList.add('active');

      // Wire up dynamic behaviours for this panel
      clearErrors(svc);
      initClearOnInput(panel, svc);
      setDateDefaults();
    };

    svcTabsEl.querySelectorAll('.fcb-svc-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        svcTabsEl.querySelectorAll('.fcb-svc-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        showPanel(tab.dataset.svc);
      });
    });

    // Init first panel
    showPanel('airport');
    return () => currentSvc;
  }

  /* ─────────────────────────────────────────
     SUBMIT HANDLER & SPAM PROTECTION
  ───────────────────────────────────────── */
  let isSubmitting = false;

  function initSubmit(submitBtn, getCurrentSvc) {
    submitBtn.addEventListener('click', () => {
      // 1. Debounce / Prevent double clicks
      if (isSubmitting) return;

      // 2. Honeypot check for bots
      const honeypot = $('fcb-honeypot');
      if (honeypot && honeypot.value.trim() !== '') {
        console.warn('Bot detected.');
        return; // Silently reject
      }

      // 3. Validate form
      const svc = getCurrentSvc();
      if (!validate(svc)) return;

      // Loading & cooldown state
      isSubmitting = true;
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;


      setTimeout(() => {
        let msg = '';
        if (svc === 'airport')    msg = buildAirportMsg();
        if (svc === 'railway')    msg = buildRailwayMsg();
        if (svc === 'city')       msg = buildCityMsg();
        if (svc === 'outstation') msg = buildOutstationMsg();

        const url = `https://wa.me/919884957791?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank', 'noopener,noreferrer');

        submitBtn.classList.remove('loading');
        
        // Cooldown period (5 seconds) to prevent duplicate WhatsApp spam
        setTimeout(() => {
          isSubmitting = false;
          submitBtn.disabled = false;
        }, 5000);
      }, 950);
    });
  }

  /* ─────────────────────────────────────────
     MAIN INIT
  ───────────────────────────────────────── */
  function init() {
    const root = document.getElementById('fcb-root');
    if (!root) return;

    // Build service tabs
    const svcTabsEl = root.querySelector('.fcb-svc-tabs');

    // Build + mount panels
    const fieldsContainer = root.querySelector('.fcb-panels');
    mountPanels(fieldsContainer);

    // Wire service switcher
    const getCurrentSvc = initServiceTabs(svcTabsEl, fieldsContainer);

    // Wire submit button
    const submitBtn = root.querySelector('.fcb-submit');
    if (submitBtn) initSubmit(submitBtn, getCurrentSvc);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


window.locateUser = function(btn, inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  btn.classList.add('loading');
  input.value = "Locating you...";

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
          headers: { 'Accept-Language': 'en' }
        });
        const data = await res.json();
        
        if (data && data.display_name) {
          const parts = data.display_name.split(', ');
          input.value = parts.slice(0, 3).join(', ');
        } else {
          input.value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        }
      } catch (e) {
        input.value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      }
      btn.classList.remove('loading');
    },
    (err) => {
      btn.classList.remove('loading');
      input.value = "";
      if (err.code === 1) alert("Location access denied. Please enable it in your browser settings.");
      else alert("Failed to detect location. Please try again.");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
};

window.locateUser = function(btn, inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  btn.classList.add('loading');
  input.value = "Locating you...";

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
          headers: { 'Accept-Language': 'en' }
        });
        const data = await res.json();
        
        if (data && data.display_name) {
          const parts = data.display_name.split(', ');
          input.value = parts.slice(0, 3).join(', ');
        } else {
          input.value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        }
      } catch (e) {
        input.value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      }
      btn.classList.remove('loading');
    },
    (err) => {
      btn.classList.remove('loading');
      input.value = "";
      if (err.code === 1) alert("Location access denied. Please enable it in your browser settings.");
      else alert("Failed to detect location. Please try again.");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
};
