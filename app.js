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

// Amazon Associates Integration
class AmazonAssociates {
  constructor() {
    this.associateTag = 'ollyj0a-21'; // Amazon.es Associates ID
    this.products = this.getRelevantProducts();
    this.init();
  }

  init() {
    this.renderProductRecommendations();
  }

  getRelevantProducts() {
    return {
      organic: [
        {
          name: 'Bokashi Composting Bin',
          asin: 'B08XXXXX',
          price: '€89.99',
          image: 'https://m.media-amazon.com/images/I/71...',
          description: 'Perfect for kitchen composting'
        },
        {
          name: 'Kitchen Compost Bin',
          asin: 'B08YYYYY',
          price: '€45.99',
          image: 'https://m.media-amazon.com/images/I/72...',
          description: 'Small countertop composting'
        }
      ],
      recyclables: [
        {
          name: 'Recycling Sorting System',
          asin: 'B08ZZZZZ',
          price: '€65.99',
          image: 'https://m.media-amazon.com/images/I/73...',
          description: 'Organize your recycling easily'
        }
      ],
      general: [
        {
          name: 'Waste Reduction Guide',
          asin: 'B09AAAAA',
          price: '€12.99',
          image: 'https://m.media-amazon.com/images/I/74...',
          description: 'Learn to reduce household waste'
        }
      ]
    };
  }

  renderProductRecommendations() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    // Show relevant products based on current waste status
    const wasteItems = document.querySelectorAll('.waste-item');
    const relevantProducts = [];

    wasteItems.forEach(item => {
      const wasteType = this.getWasteType(item);
      const products = this.products[wasteType] || this.products.general;
      relevantProducts.push(...products);
    });

    // Remove duplicates and show top 3 products
    const uniqueProducts = [...new Set(relevantProducts.map(p => p.asin))].map(asin => 
      relevantProducts.find(p => p.asin === asin)
    ).slice(0, 3);

    uniqueProducts.forEach(product => {
      this.addProductCard(productGrid, product);
    });
  }

  getWasteType(item) {
    const text = item.textContent.toLowerCase();
    if (text.includes('organic') || text.includes('orgánica')) return 'organic';
    if (text.includes('recycl') || text.includes('recicl')) return 'recyclables';
    return 'general';
  }

  addProductCard(container, product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-info">
        <h4>${product.name}</h4>
        <p>${product.description}</p>
        <div class="product-price">${product.price}</div>
        <a href="https://amazon.es/dp/${product.asin}?tag=${this.associateTag}" 
           class="product-btn" target="_blank" rel="noopener">
          View on Amazon
        </a>
      </div>
    `;
    
    // Track affiliate clicks
    productCard.querySelector('.product-btn').addEventListener('click', () => {
      trackEvent('Affiliate', 'amazon_click', product.asin);
    });
    
    container.appendChild(productCard);
  }
}

// Revenue Tracking
class RevenueTracker {
  constructor() {
    this.stats = {
      pageViews: 0,
      adClicks: 0,
      affiliateClicks: 0,
      estimatedRevenue: 0
    };
    this.init();
  }

  init() {
    this.trackPageViews();
    this.trackAdClicks();
    this.trackAffiliateClicks();
  }

  trackPageViews() {
    this.stats.pageViews++;
    trackEvent('Revenue', 'page_view', this.stats.pageViews);
  }

  trackAdClicks() {
    // Track AdSense clicks
    if (typeof gtag !== 'undefined') {
      gtag('event', 'ad_click', {
        event_category: 'Revenue',
        event_label: 'adsense'
      });
    }
  }

  trackAffiliateClicks() {
    document.querySelectorAll('.product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.stats.affiliateClicks++;
        trackEvent('Revenue', 'affiliate_click', this.stats.affiliateClicks);
      });
    });
  }

  calculateRevenue() {
    const adRevenue = this.stats.pageViews * 0.003; // €3 per 1000 views
    const affiliateRevenue = this.stats.affiliateClicks * 5; // €5 per click
    
    this.stats.estimatedRevenue = adRevenue + affiliateRevenue;
    
    console.log('Revenue Stats:', {
      pageViews: this.stats.pageViews,
      adRevenue: adRevenue.toFixed(2),
      affiliateRevenue: affiliateRevenue.toFixed(2),
      total: this.stats.estimatedRevenue.toFixed(2)
    });
    
    return this.stats.estimatedRevenue;
  }
}

// Initialize revenue tracking
const revenueTracker = new RevenueTracker();

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
  },
  de: {
    install: 'Installieren',
    now: 'Jetzt',
    legal: 'Respektieren Sie die kommunalen Vorschriften. Verstöße werden mit Bußgeldern geahndet.',
    sources: 'Quellen',
    season_summer: 'Sommer',
    season_winter: 'Winter',
    status_allowed: 'Erlaubt',
    status_not_allowed: 'Verboten',
    status_check: 'Prüfen',
    status_always: 'Immer',
    preview: 'Vorschau',
    more_details: 'Details',
    today_label: 'Heute',
    tomorrow_label: 'Morgen',
    yesterday_label: 'Gestern',
    add_to_home: 'Zum Startbildschirm hinzufügen',
    ios_install_hint: 'Tippen Sie auf die Teilen-Schaltfläche und dann "Zum Startbildschirm hinzufügen"',
    got_it: 'Verstanden',
  },
  fr: {
    install: 'Installer',
    now: 'Maintenant',
    legal: 'Respectez les règles municipales. Les infractions sont passibles d\'amendes.',
    sources: 'Sources',
    season_summer: 'Été',
    season_winter: 'Hiver',
    status_allowed: 'Autorisé',
    status_not_allowed: 'Interdit',
    status_check: 'Vérifier',
    status_always: 'Toujours',
    preview: 'Aperçu',
    more_details: 'Détails',
    today_label: 'Aujourd\'hui',
    tomorrow_label: 'Demain',
    yesterday_label: 'Hier',
    add_to_home: 'Ajouter à l\'écran d\'accueil',
    ios_install_hint: 'Appuyez sur le bouton partager puis "Ajouter à l\'écran d\'accueil"',
    got_it: 'Compris',
  },
  nl: {
    install: 'Installeren',
    now: 'Nu',
    legal: 'Respecteer de gemeentelijke regels. Overtredingen worden beboet.',
    sources: 'Bronnen',
    season_summer: 'Zomer',
    season_winter: 'Winter',
    status_allowed: 'Toegestaan',
    status_not_allowed: 'Verboden',
    status_check: 'Controleren',
    status_always: 'Altijd',
    preview: 'Voorvertoning',
    more_details: 'Details',
    today_label: 'Vandaag',
    tomorrow_label: 'Morgen',
    yesterday_label: 'Gisteren',
    add_to_home: 'Toevoegen aan startscherm',
    ios_install_hint: 'Tik op de deel-knop en dan "Toevoegen aan startscherm"',
    got_it: 'Begrepen',
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

function addInfoIcon(ul) {
  // Remove existing info icon if it exists
  const existingInfo = ul.parentNode.querySelector('.info-icon-container');
  if (existingInfo) {
    existingInfo.remove();
  }
  
  // Create info icon container
  const infoContainer = document.createElement('div');
  infoContainer.className = 'info-icon-container';
  infoContainer.innerHTML = `
    <a href="https://www.javea.com/en/xabia-actualiza-los-horarios-para-tirar-la-basura-y-advierte-habra-sanciones/" 
       target="_blank" rel="noopener noreferrer" class="info-icon-link">
      <svg class="info-icon" aria-hidden="true" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>
      <span class="info-text">${t('more_details')}</span>
    </a>
  `;
  
  // Insert after the waste list
  ul.parentNode.appendChild(infoContainer);
}

function t(key) {
  const translation = I18N[state.lang]?.[key] || I18N['en']?.[key] || key;
  console.log(`Translation for "${key}" in "${state.lang}":`, translation);
  return translation;
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
    de: {
      Organic: 'Bioabfall',
      'Other Waste': 'Restmüll',
      Glass: 'Glas',
      Recyclables: 'Recycelbar',
      'Bulky Items': 'Sperrmüll/Ecoparc',
    },
    fr: {
      Organic: 'Organique',
      'Other Waste': 'Déchets résiduels',
      Glass: 'Verre',
      Recyclables: 'Recyclables',
      'Bulky Items': 'Encombrants/Ecoparc',
    },
    nl: {
      Organic: 'GFT',
      'Other Waste': 'Restafval',
      Glass: 'Glas',
      Recyclables: 'Recyclebaar',
      'Bulky Items': 'Grofvuil/Ecoparc',
    },
  };
  return map[lang]?.[label] || map['en']?.[label] || label;
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
  console.log('renderWasteList called with time:', at);
  const { summer, statuses } = getStatuses(at);
  console.log('Summer season:', summer);
  console.log('Waste statuses:', statuses);
  
  renderSeasonBadge(summer);
  
  const ul = document.getElementById('waste-list');
  if (!ul) {
    console.error('Waste list element not found');
    return;
  }
  
  ul.innerHTML = '';
  
  for (const s of statuses) {
    const { cls, label } = statusBadgeProps(s);
    console.log('Rendering waste item:', s.type, 'with status:', label);
    
    const li = document.createElement('li');
    li.className = 'waste-item';
    li.innerHTML = `
      <div class="item-left">
        <svg class="icon" aria-hidden="true"><use href="#${wasteIconId(s.type)}"></use></svg>
        <span class="waste-name">${translateWasteLabel(wasteLabel(s.type))}</span>
      </div>
      <span class="badge-status ${cls}">${label}</span>
    `;
    ul.appendChild(li);
    
    // Track waste status view
    trackWasteStatusView(label, s.type);
  }
  
  console.log('Waste list rendered with', statuses.length, 'items');
  
  // Add info icon under the waste list
  this.addInfoIcon(ul);
  
  // Re-render product recommendations after waste list updates
  if (window.amazonAssociates) {
    window.amazonAssociates.renderProductRecommendations();
  }
}

function updateTimeDisplay(at) {
  const timeElement = document.getElementById('current-time');
  const dateElement = document.getElementById('current-date');
  
  if (timeElement && dateElement) {
    timeElement.textContent = formatTimeHHMM(at);
    dateElement.textContent = formatDate(at);
  }
}

function getCurrentTimeFromSlider() {
  const slider = document.getElementById('time-slider');
  if (!slider) return new Date();
  
  const sliderValue = Number(slider.value);
  const now = new Date();
  // Each step is 15 minutes, so multiply by 15 * 60 * 1000 milliseconds
  return new Date(now.getTime() + sliderValue * 15 * 60 * 1000);
}

function updateAll() {
  console.log('updateAll called');
  const currentTime = getCurrentTimeFromSlider();
  console.log('Current time from slider:', currentTime);
  console.log('Formatted time:', formatTimeHHMM(currentTime));
  console.log('Formatted date:', formatDate(currentTime));
  
  updateTimeDisplay(currentTime);
  renderWasteList(currentTime);
  
  // Track time slider usage
  const slider = document.getElementById('time-slider');
  if (slider) {
    trackTimeSliderUsage(slider.value);
  }
}

const state = {
  lang: (localStorage.getItem('lang') || (navigator.language?.slice(0,2) ?? 'en')).replace(/^(en|es|va|de|fr|nl).*/, '$1') || 'en',
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
    
    // Track language change
    trackLanguageChange(lang);
    
    applyI18n();
  });
});

// Time slider event listener
const timeSlider = document.getElementById('time-slider');
if (timeSlider) {
  console.log('Time slider found, attaching event listener...');
  timeSlider.addEventListener('input', function() {
    console.log('Slider value changed to:', this.value);
    updateAll();
  });
  console.log('Time slider event listener attached');
} else {
  console.error('Time slider element not found');
}

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

// Initialize Amazon Associates
window.amazonAssociates = new AmazonAssociates();

// Simple initialization that runs immediately
function initializeApp() {
  console.log('Starting app initialization...');
  
  // Check if elements exist
  const timeElement = document.getElementById('current-time');
  const dateElement = document.getElementById('current-date');
  const sliderElement = document.getElementById('time-slider');
  const wasteListElement = document.getElementById('waste-list');
  
  console.log('Elements found:', {
    timeElement: !!timeElement,
    dateElement: !!dateElement,
    sliderElement: !!sliderElement,
    wasteListElement: !!wasteListElement
  });
  
  if (timeElement && dateElement && sliderElement && wasteListElement) {
    applyI18n();
    updateAll();
    checkFirstVisit();
    console.log('Initialization complete');
  } else {
    console.error('Some elements not found, retrying in 100ms...');
    setTimeout(initializeApp, 100);
  }
}

// Run initialization
initializeApp();


