/* eslint-disable no-console */

// Analytics tracking functions
function trackEvent(category, action, label = null, value = null) {
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      custom_parameter_1: 'waste_schedule',
      custom_parameter_2: 'javea_xabia'
    });
  }
}

function trackPageView(pageTitle = null) {
  if (typeof gtag !== 'undefined') {
    gtag('config', 'G-XXXXXXXXXX', {
      page_title: pageTitle || 'Xàbia Waste Schedule',
      page_location: window.location.href,
      custom_map: {
        'custom_parameter_1': 'waste_schedule',
        'custom_parameter_2': 'javea_xabia'
      }
    });
  }
}

// Track language changes
function trackLanguageChange(language) {
  trackEvent('Language', 'change', language);
}

// Track time slider usage
function trackTimeSliderUsage(value) {
  trackEvent('TimeSlider', 'adjust', `slider_value_${value}`);
}

// Track waste status views
function trackWasteStatusView(status, wasteType) {
  trackEvent('WasteStatus', 'view', `${wasteType}_${status}`);
}

// Track PWA install attempts
function trackInstallAttempt(outcome) {
  trackEvent('PWA', 'install_attempt', outcome);
}

// Track chat usage
function trackChatUsage(command) {
  trackEvent('Chat', 'command', command);
}

// SEO: Update page title and meta description dynamically
function updatePageSEO(timeInfo, language) {
  const timeStr = formatTimeHHMM(timeInfo);
  const dateStr = formatDate(timeInfo);
  
  // Update page title
  const title = `Xàbia Waste Schedule - ${timeStr} ${dateStr} | Javea Rubbish Collection`;
  document.title = title;
  
  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = `Check what waste you can throw away in Xàbia/Javea at ${timeStr} on ${dateStr}. Real-time rubbish collection schedule and recycling times.`;
  }
  
  // Track page view with updated title
  trackPageView(title);
}

// PWA install prompt handling
let deferredPrompt = null;
let installButton = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installButton = document.getElementById('btn-install');
  if (installButton) {
    installButton.style.display = 'flex';
    installButton.addEventListener('click', handleInstallClick);
  }
  
  // Track install prompt
  trackEvent('PWA', 'install_prompt_shown');
});

// Handle iOS Safari install
function handleIOSInstall() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  
  if (isIOS && isSafari) {
    showIOSInstallPrompt();
  }
}

function showIOSInstallPrompt() {
  const prompt = document.createElement('div');
  prompt.className = 'ios-install-prompt';
  prompt.innerHTML = `
    <div class="ios-install-content">
      <div class="ios-install-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2v10.6l3.3-3.3l1.4 1.4L12 16.4L7.3 10.7l1.4-1.4L12 12.6V2h0ZM5 20h14v2H5v-2Z"/>
        </svg>
      </div>
      <h3>Add to Home Screen</h3>
      <p>Tap the share button <span class="share-icon">⎋</span> then "Add to Home Screen"</p>
      <button class="ios-install-close">Got it</button>
    </div>
  `;
  
  document.body.appendChild(prompt);
  
  // Animate in
  setTimeout(() => prompt.classList.add('show'), 100);
  
  // Close button
  prompt.querySelector('.ios-install-close').addEventListener('click', () => {
    prompt.classList.remove('show');
    setTimeout(() => prompt.remove(), 300);
  });
  
  // Auto-hide after 8 seconds
  setTimeout(() => {
    if (prompt.parentNode) {
      prompt.classList.remove('show');
      setTimeout(() => prompt.remove(), 300);
    }
  }, 8000);
}

async function handleInstallClick() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
    if (installButton) installButton.style.display = 'none';
  } else {
    // Fallback for iOS Safari
    handleIOSInstall();
  }
}

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(console.error);
  });
}

// I18n dictionaries
const I18N = {
  en: {
    install: 'Install',
    now: 'Now',
    legal: 'Respect municipal rules. Fines apply for violations.',
    sources: 'Sources',
    chat_title: 'Chat',
    chat_hint: 'Try: now, +3h, at 21:00, on 2025-09-15 22:30, lang es',
    season_summer: 'Summer',
    season_winter: 'Winter',
    status_allowed: 'Allowed',
    status_not_allowed: 'Not Allowed',
    status_check: 'Check Hours',
    status_always: 'Always Allowed',
    preview: 'Preview',
    more_details: 'More details',
    today_label: 'Today',
    tomorrow_label: 'Tomorrow',
    yesterday_label: 'Yesterday',
    add_to_home: 'Add to Home Screen',
    ios_install_hint: 'Tap the share button then "Add to Home Screen"',
    got_it: 'Got it',
  },
  es: {
    install: 'Instalar',
    now: 'Ahora',
    legal: 'Respete las normas municipales. Las infracciones conllevan multas.',
    sources: 'Fuentes',
    chat_title: 'Chat',
    chat_hint: 'Prueba: ahora, +3h, a las 21:00, el 2025-09-15 22:30, lang en',
    season_summer: 'Verano',
    season_winter: 'Invierno',
    status_allowed: 'Permitido',
    status_not_allowed: 'No permitido',
    status_check: 'Consultar horario',
    status_always: 'Siempre permitido',
    preview: 'Previsualización',
    more_details: 'Más detalles',
    today_label: 'Hoy',
    tomorrow_label: 'Mañana',
    yesterday_label: 'Ayer',
    add_to_home: 'Añadir a Pantalla de Inicio',
    ios_install_hint: 'Toca el botón compartir y luego "Añadir a Pantalla de Inicio"',
    got_it: 'Entendido',
  },
  va: {
    install: 'Instal·lar',
    now: 'Ara',
    legal: "Respecteu les normes municipals. Les infraccions comporten multes.",
    sources: 'Fonts',
    chat_title: 'Xat',
    chat_hint: 'Prova: ara, +3h, a les 21:00, el 2025-09-15 22:30, lang es',
    season_summer: 'Estiu',
    season_winter: 'Hivern',
    status_allowed: 'Permés',
    status_not_allowed: 'No permés',
    status_check: 'Comproveu horari',
    status_always: 'Sempre permés',
    preview: 'Previsualització',
    more_details: 'Més detalls',
    today_label: 'Hui',
    tomorrow_label: 'Demà',
    yesterday_label: 'Ahir',
    add_to_home: 'Afegir a Pantalla d\'Inici',
    ios_install_hint: 'Toca el botó compartir i després "Afegir a Pantalla d\'Inici"',
    got_it: 'Entès',
  }
};

// Rule engine
const WasteType = {
  ORGANIC: 'organic',
  OTHER: 'other',
  GLASS: 'glass',
  RECYCLABLES: 'recyclables',
  BULKY: 'bulky',
};

function isSummer(date) {
  const year = date.getFullYear();
  const start = new Date(year, 4, 1, 0, 0, 0); // May 1
  const end = new Date(year, 8, 30, 23, 59, 59); // Sep 30 inclusive
  return date >= start && date <= end;
}

function isWithin(time, startH, startM, endH, endM) {
  const t = time.getHours() * 60 + time.getMinutes();
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  if (end >= start) return t >= start && t <= end;
  // wraps over midnight
  return t >= start || t <= end;
}

function getStatuses(at) {
  const summer = isSummer(at);
  const statuses = [];

  // Organic & Other - DIFFERENT RULES FOR SUMMER vs WINTER
  if (summer) {
    // Summer: May 1 - Sep 30: 21:00-24:00
    const allowed = isWithin(at, 21, 0, 24, 0);
    statuses.push({ type: WasteType.ORGANIC, allowed, mode: 'window', season: 'summer' });
    statuses.push({ type: WasteType.OTHER, allowed, mode: 'window', season: 'summer' });
  } else {
    // Winter: Oct 1 - Apr 30: 19:00-24:00
    const allowed = isWithin(at, 19, 0, 24, 0);
    statuses.push({ type: WasteType.ORGANIC, allowed, mode: 'window', season: 'winter' });
    statuses.push({ type: WasteType.OTHER, allowed, mode: 'window', season: 'winter' });
  }

  // Glass: not allowed 23:00–08:00 (same all year)
  const glassAllowed = !isWithin(at, 23, 0, 8, 0);
  statuses.push({ type: WasteType.GLASS, allowed: glassAllowed, mode: 'curfew' });

  // Recyclables anytime (same all year)
  statuses.push({ type: WasteType.RECYCLABLES, allowed: true, mode: 'always' });

  // Bulky: check (ecoparc hours vary by season)
  statuses.push({ type: WasteType.BULKY, allowed: false, mode: 'check', season: summer ? 'summer' : 'winter' });

  return { summer, statuses };
}

function t(key) {
  return I18N[state.lang][key] || key;
}

function formatTimeHHMM(d) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(d) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  if (target.getTime() === today.getTime()) {
    return t('today_label');
  }
  
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return t('tomorrow_label');
  if (diffDays === -1) return t('yesterday_label');
  
  return d.toLocaleDateString([], { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

function renderSeasonBadge(summer) {
  const el = document.getElementById('season-badge');
  el.textContent = summer ? t('season_summer') : t('season_winter');
}

function statusBadgeProps(item) {
  if (item.mode === 'always') return { cls: 's-always', label: t('status_always') };
  if (item.mode === 'check') return { cls: 's-check', label: t('status_check') };
  return item.allowed ? { cls: 's-ok', label: t('status_allowed') } : { cls: 's-no', label: t('status_not_allowed') };
}

function wasteIconId(type) {
  switch (type) {
    case WasteType.ORGANIC: return 'i-organic';
    case WasteType.OTHER: return 'i-other';
    case WasteType.GLASS: return 'i-glass';
    case WasteType.RECYCLABLES: return 'i-recycle';
    case WasteType.BULKY: return 'i-bulky';
    default: return 'i-other';
  }
}

function wasteLabel(type) {
  switch (type) {
    case WasteType.ORGANIC: return 'Organic';
    case WasteType.OTHER: return 'Other Waste';
    case WasteType.GLASS: return 'Glass';
    case WasteType.RECYCLABLES: return 'Recyclables';
    case WasteType.BULKY: return 'Bulky Items';
    default: return type;
  }
}

function translateWasteLabel(label) {
  const lang = state.lang;
  const map = {
    en: {
      Organic: 'Organic',
      'Other Waste': 'Other Waste',
      Glass: 'Glass',
      Recyclables: 'Recyclables',
      'Bulky Items': 'Bulky Items',
    },
    es: {
      Organic: 'Orgánica',
      'Other Waste': 'Resto',
      Glass: 'Vidrio',
      Recyclables: 'Reciclables',
      'Bulky Items': 'Voluminosos/Ecoparc',
    },
    va: {
      Organic: 'Orgànica',
      'Other Waste': 'Resta',
      Glass: 'Vidre',
      Recyclables: 'Reciclables',
      'Bulky Items': 'Voluminosos/Ecoparc',
    },
  };
  return map[lang][label] || label;
}

// Official source links for details per waste type
const DETAILS_URL = {
  [WasteType.ORGANIC]: 'https://www.javea.com/en/xabia-actualiza-los-horarios-para-tirar-la-basura-y-advierte-habra-sanciones/',
  [WasteType.OTHER]: 'https://www.javea.com/en/xabia-actualiza-los-horarios-para-tirar-la-basura-y-advierte-habra-sanciones/',
  [WasteType.GLASS]: 'https://www.javea.com/en/xabia-actualiza-los-horarios-para-tirar-la-basura-y-advierte-habra-sanciones/',
  [WasteType.RECYCLABLES]: 'https://www.javea.com/en/xabia-actualiza-los-horarios-para-tirar-la-basura-y-advierte-habra-sanciones/',
  [WasteType.BULKY]: 'https://www.ajxabia.com/ver/1282/ecoparc.html',
};

function renderWasteList(at) {
  const { summer, statuses } = getStatuses(at);
  renderSeasonBadge(summer);
  
  const ul = document.getElementById('waste-list');
  ul.innerHTML = '';
  
  for (const s of statuses) {
    const { cls, label } = statusBadgeProps(s);
    const li = document.createElement('li');
    li.className = 'waste-item';
    li.innerHTML = `
      <div class="item-left">
        <svg class="icon" aria-hidden="true"><use href="#${wasteIconId(s.type)}"></use></svg>
        <span class="waste-name">${translateWasteLabel(wasteLabel(s.type))}</span>
        <a class="details-link" href="${DETAILS_URL[s.type]}" target="_blank" rel="noopener noreferrer">${t('more_details')}</a>
      </div>
      <span class="badge-status ${cls}">${label}</span>
    `;
    ul.appendChild(li);
  }
}

function updateTimeDisplay(at) {
  document.getElementById('current-time').textContent = formatTimeHHMM(at);
  document.getElementById('current-date').textContent = formatDate(at);
}

function getCurrentTimeFromSlider() {
  const sliderValue = Number(document.getElementById('time-slider').value);
  const now = new Date();
  // Each step is 15 minutes, so multiply by 15 * 60 * 1000 milliseconds
  return new Date(now.getTime() + sliderValue * 15 * 60 * 1000);
}

function updateAll() {
  const currentTime = getCurrentTimeFromSlider();
  updateTimeDisplay(currentTime);
  renderWasteList(currentTime);
}

const state = {
  lang: (localStorage.getItem('lang') || (navigator.language?.slice(0,2) ?? 'en')).replace(/^(en|es|va).*/, '$1'),
};

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  // Update chip pressed state
  document.querySelectorAll('.lang-toggle .chip').forEach((btn) => {
    const active = btn.getAttribute('data-lang') === state.lang;
    btn.setAttribute('aria-pressed', String(active));
    btn.classList.toggle('active', active);
  });
  updateAll();
}

document.querySelectorAll('.lang-toggle .chip').forEach((btn) => {
  btn.addEventListener('click', () => {
    const lang = btn.getAttribute('data-lang');
    state.lang = lang;
    localStorage.setItem('lang', lang);
    applyI18n();
  });
});

document.getElementById('time-slider').addEventListener('input', updateAll);

// Chat logic
function chatPost(role, textOrHtml, isHtml = false) {
  const out = document.getElementById('chat-output');
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  if (isHtml) div.innerHTML = textOrHtml; else div.textContent = textOrHtml;
  out.appendChild(div);
  out.scrollTop = out.scrollHeight;
}

function formatStatuses(at) {
  const { statuses } = getStatuses(at);
  const parts = statuses.map((s) => {
    const { label } = statusBadgeProps(s);
    return `${translateWasteLabel(wasteLabel(s.type))}: ${label}`;
  });
  return `${at.toLocaleString()}\n` + parts.join('\n');
}

function formatStatusesHtml(at) {
  const { statuses } = getStatuses(at);
  const rows = statuses.map((s) => {
    const { label } = statusBadgeProps(s);
    const name = translateWasteLabel(wasteLabel(s.type));
    const url = DETAILS_URL[s.type];
    return `<div><strong>${name}</strong>: ${label} — <a href="${url}" target="_blank" rel="noopener noreferrer">${t('more_details')}</a></div>`;
  }).join('');
  return `<div><div>${at.toLocaleString()}</div>${rows}</div>`;
}

function parseCommand(input) {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === 'help' || trimmed === '?') {
    return { type: 'help' };
  }
  if (trimmed === 'now') return { type: 'at', date: new Date() };
  if (/^\+\d+h$/.test(trimmed)) {
    const hours = parseInt(trimmed.slice(1), 10);
    return { type: 'at', date: new Date(Date.now() + hours * 3600_000) };
  }
  if (/^at\s+\d{1,2}:\d{2}$/.test(trimmed)) {
    const [, hhmm] = trimmed.split(/\s+/);
    const [h, m] = hhmm.split(':').map(Number);
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    return { type: 'at', date: d };
  }
  if (/^on\s+\d{4}-\d{2}-\d{2}(\s+\d{2}:\d{2})?$/.test(trimmed)) {
    const dt = trimmed.replace(/^on\s+/, '');
    const d = new Date(dt.replace(' ', 'T'));
    if (!isNaN(d.getTime())) return { type: 'at', date: d };
  }
  if (/^lang\s+(en|es|va)$/.test(trimmed)) {
    const lang = trimmed.split(/\s+/)[1];
    return { type: 'lang', lang };
  }
  return { type: 'unknown' };
}

document.getElementById('chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  chatPost('user', text);
  const cmd = parseCommand(text);
  if (cmd.type === 'help') {
    chatPost('bot', 'Commands: now | +3h | at 21:00 | on 2025-09-15 22:30 | lang es');
  } else if (cmd.type === 'lang') {
    state.lang = cmd.lang; localStorage.setItem('lang', cmd.lang); applyI18n();
    chatPost('bot', `Lang: ${cmd.lang}`);
  } else if (cmd.type === 'at') {
    chatPost('bot', formatStatusesHtml(cmd.date), true);
  } else {
    chatPost('bot', 'Unknown. Type help');
  }
  input.value = '';
});

// Show iOS install prompt on first visit
function checkFirstVisit() {
  const hasVisited = localStorage.getItem('hasVisited');
  if (!hasVisited) {
    localStorage.setItem('hasVisited', 'true');
    setTimeout(() => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      if (isIOS && isSafari) {
        showIOSInstallPrompt();
      }
    }, 2000); // Show after 2 seconds
  }
}

// Initial
applyI18n();
updateAll();
checkFirstVisit();


