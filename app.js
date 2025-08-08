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
      <h3 data-i18n="add_to_home">Add to Home Screen</h3>
      <p data-i18n="ios_install_hint">Get the full experience with offline access, instant updates, and quick access to waste schedules. Tap the share button <svg class="share-icon" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zM20 10v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/></svg> then "Add to Home Screen"</p>
      <button class="ios-install-close" data-i18n="got_it">Got it</button>
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
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  
  if (isIOS && isSafari) {
    // iOS Safari - show custom prompt
    showIOSInstallPrompt();
  } else if (deferredPrompt) {
    // Android/Desktop - use native prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
    if (installButton) installButton.style.display = 'none';
  } else {
    // Fallback for other browsers
    showIOSInstallPrompt();
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
    ios_install_hint: 'Get the full experience with offline access, instant updates, and quick access to waste schedules. Tap the share button then "Add to Home Screen"',
    got_it: 'Got it',
    hero_title: 'Smart Waste Management for Xàbia/Javea',
    hero_description: 'Never miss your waste disposal times again. This app provides real-time information about when you can put different types of waste in their respective communal bins in Xàbia/Javea, helping you avoid fines and contribute to a cleaner environment.',
    check_waste_times: 'Check Waste Times Now',
    learn_waste_types: 'Learn About Waste Types',
    real_time_schedule: 'Real-Time Schedule',
    real_time_schedule_desc: 'Check current waste disposal times instantly, with seasonal adjustments for summer and winter schedules.',
    proper_recycling: 'Proper Recycling',
    proper_recycling_desc: 'Learn about different waste types and their specific disposal times to ensure proper recycling.',
    avoid_fines: 'Avoid Fines',
    avoid_fines_desc: 'Municipal regulations require specific timing for waste disposal. This app helps you comply and avoid penalties.',
    waste_disposal_types: 'Waste Disposal Types',
    organic_waste: 'Organic Waste',
    organic_waste_desc: 'Food scraps, garden waste, and biodegradable materials. Collected bi-weekly with specific time windows.',
    general_waste: 'General Waste',
    general_waste_desc: 'Non-recyclable household waste. Daily collection with evening time restrictions.',
    glass_containers: 'Glass Containers',
    glass_containers_desc: 'Glass bottles and jars. Available 24/7 except during quiet hours (23:00-08:00).',
    recyclables: 'Recyclables',
    recyclables_desc: 'Paper, cardboard, plastic, and metal containers. Available anytime for your convenience.',
    bulky_items: 'Bulky Items',
    bulky_items_desc: 'Large items, furniture, and electronics. Must be taken to Ecoparc during operating hours.',
    about_xabia: 'About Xàbia/Javea',
    about_xabia_desc: 'Xàbia (Valencian) or Javea (Spanish) is a coastal municipality in the Marina Alta region of Alicante, Spain. With a population of over 27,000 residents and a significant international community, the town has implemented strict waste management regulations to maintain its beautiful Mediterranean environment and comply with EU recycling targets.',
    about_xabia_expanded: 'The municipality operates an advanced waste collection system with specific timing requirements to minimize environmental impact and ensure efficient collection services for residents and visitors alike.',
    show_more: 'Show more',
    show_less: 'Show less',
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
    ios_install_hint: 'Obtén la experiencia completa con acceso offline, actualizaciones instantáneas y acceso rápido a los horarios de residuos. Toca el botón compartir y luego "Añadir a Pantalla de Inicio"',
    got_it: 'Entendido',
    hero_title: 'Gestión Inteligente de Residuos para Xàbia/Javea',
    hero_description: 'Nunca más te pierdas los horarios de eliminación de residuos. Esta aplicación proporciona información en tiempo real sobre cuándo puedes depositar diferentes tipos de residuos en sus respectivos contenedores comunales en Xàbia/Javea, ayudándote a evitar multas y contribuir a un medio ambiente más limpio.',
    check_waste_times: 'Verificar Horarios de Residuos Ahora',
    learn_waste_types: 'Aprender Sobre Tipos de Residuos',
    real_time_schedule: 'Horario en Tiempo Real',
    real_time_schedule_desc: 'Verifica los horarios de eliminación de residuos actuales al instante, con ajustes estacionales para horarios de verano e invierno.',
    proper_recycling: 'Reciclaje Adecuado',
    proper_recycling_desc: 'Aprende sobre diferentes tipos de residuos y sus horarios específicos de eliminación para asegurar un reciclaje adecuado.',
    avoid_fines: 'Evitar Multas',
    avoid_fines_desc: 'Las regulaciones municipales requieren horarios específicos para la eliminación de residuos. Esta aplicación te ayuda a cumplir y evitar sanciones.',
    waste_disposal_types: 'Tipos de Eliminación de Residuos',
    organic_waste: 'Residuos Orgánicos',
    organic_waste_desc: 'Restos de comida, residuos de jardín y materiales biodegradables. Recogida quincenal con ventanas de tiempo específicas.',
    general_waste: 'Residuos Generales',
    general_waste_desc: 'Residuos domésticos no reciclables. Recogida diaria con restricciones de horario nocturno.',
    glass_containers: 'Contenedores de Vidrio',
    glass_containers_desc: 'Botellas y frascos de vidrio. Disponible 24/7 excepto durante las horas de silencio (23:00-08:00).',
    recyclables: 'Reciclables',
    recyclables_desc: 'Papel, cartón, plástico y contenedores metálicos. Disponible en cualquier momento para tu conveniencia.',
    bulky_items: 'Objetos Voluminosos',
    bulky_items_desc: 'Objetos grandes, muebles y electrónicos. Deben llevarse al Ecoparc durante las horas de funcionamiento.',
    about_xabia: 'Sobre Xàbia/Javea',
    about_xabia_desc: 'Xàbia (Valenciano) o Javea (Español) es un municipio costero en la región de la Marina Alta de Alicante, España. Con una población de más de 27,000 residentes y una comunidad internacional significativa, la ciudad ha implementado estrictas regulaciones de gestión de residuos para mantener su hermoso entorno mediterráneo y cumplir con los objetivos de reciclaje de la UE.',
    about_xabia_expanded: 'El municipio opera un sistema avanzado de recogida de residuos con requisitos de horario específicos para minimizar el impacto ambiental y asegurar servicios de recogida eficientes para residentes y visitantes por igual.',
    show_more: 'Mostrar más',
    show_less: 'Mostrar menos',
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
    ios_install_hint: 'Obten l\'experiència completa amb accés offline, actualitzacions instantànies i accés ràpid als horaris de residus. Toca el botó compartir i després "Afegir a Pantalla d\'Inici"',
    got_it: 'Entès',
    hero_title: 'Gestió Intel·ligent de Residus per a Xàbia/Javea',
    hero_description: 'Mai més et perdis els horaris d\'eliminació de residus. Aquesta aplicació proporciona informació en temps real sobre quan pots dipositar diferents tipus de residus en les seues respectives contenidors comunals a Xàbia/Javea, ajudant-te a evitar multes i contribuir a un medi ambient més net.',
    check_waste_times: 'Verificar Horaris de Residus Ara',
    learn_waste_types: 'Aprendre Sobre Tipus de Residus',
    real_time_schedule: 'Horari en Temps Real',
    real_time_schedule_desc: 'Verifica els horaris d\'eliminació de residus actuals a l\'instant, amb ajustos estacionals per a horaris d\'estiu i hivern.',
    proper_recycling: 'Reciclatge Adequat',
    proper_recycling_desc: 'Aprèn sobre diferents tipus de residus i els seus horaris específics d\'eliminació per a assegurar un reciclatge adequat.',
    avoid_fines: 'Evitar Multes',
    avoid_fines_desc: 'Les regulacions municipals requereixen horaris específics per a l\'eliminació de residus. Aquesta aplicació t\'ajuda a complir i evitar sancions.',
    waste_disposal_types: 'Tipus d\'Eliminació de Residus',
    organic_waste: 'Residus Orgànics',
    organic_waste_desc: 'Rests de menjar, residus de jardí i materials biodegradables. Recollida quinzenal amb finestres de temps específiques.',
    general_waste: 'Residus Generals',
    general_waste_desc: 'Residus domèstics no reciclables. Recollida diària amb restriccions d\'horari nocturn.',
    glass_containers: 'Contenidors de Vidre',
    glass_containers_desc: 'Botelles i gerres de vidre. Disponible 24/7 excepte durant les hores de silenci (23:00-08:00).',
    recyclables: 'Reciclables',
    recyclables_desc: 'Paper, cartró, plàstic i contenidors metàl·lics. Disponible en qualsevol moment per a la teua conveniència.',
    bulky_items: 'Objectes Voluminosos',
    bulky_items_desc: 'Objectes grans, mobles i electrònics. Han de portar-se a l\'Ecoparc durant les hores de funcionament.',
    about_xabia: 'Sobre Xàbia/Javea',
    about_xabia_desc: 'Xàbia (Valencià) o Javea (Espanyol) és un municipi costaner a la regió de la Marina Alta d\'Alacant, Espanya. Amb una població de més de 27,000 residents i una comunitat internacional significativa, la ciutat ha implementat estrictes regulacions de gestió de residus per a mantenir el seu bell entorn mediterrani i complir amb els objectius de reciclatge de la UE.',
    about_xabia_expanded: 'El municipi opera un sistema avançat de recollida de residus amb requisits d\'horari específics per a minimitzar l\'impacte ambiental i assegurar serveis de recollida eficients per a residents i visitants per igual.',
    show_more: 'Mostrar més',
    show_less: 'Mostrar menys',
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
    ios_install_hint: 'Erhalten Sie die vollständige Erfahrung mit Offline-Zugang, sofortigen Updates und schnellem Zugriff auf Abfallpläne. Tippen Sie auf die Teilen-Schaltfläche und dann "Zum Startbildschirm hinzufügen"',
    got_it: 'Verstanden',
    hero_title: 'Intelligente Abfallbewirtschaftung für Xàbia/Javea',
    hero_description: 'Verpassen Sie nie wieder die Abfallentsorgungszeiten. Diese App bietet Echtzeit-Informationen darüber, wann Sie verschiedene Arten von Abfall in ihre jeweiligen Gemeinschaftsbehälter in Xàbia/Javea entsorgen können, um Ihnen zu helfen, Bußgelder zu vermeiden und zu einer saubereren Umwelt beizutragen.',
    check_waste_times: 'Abfallzeiten jetzt prüfen',
    learn_waste_types: 'Über Abfallarten lernen',
    real_time_schedule: 'Echtzeit-Zeitplan',
    real_time_schedule_desc: 'Prüfen Sie aktuelle Abfallentsorgungszeiten sofort mit saisonalen Anpassungen für Sommer- und Winterzeitpläne.',
    proper_recycling: 'Richtiges Recycling',
    proper_recycling_desc: 'Lernen Sie über verschiedene Abfallarten und ihre spezifischen Entsorgungszeiten, um ein ordnungsgemäßes Recycling zu gewährleisten.',
    avoid_fines: 'Bußgelder vermeiden',
    avoid_fines_desc: 'Kommunale Vorschriften erfordern spezifische Zeiten für die Abfallentsorgung. Diese App hilft Ihnen, konform zu sein und Strafen zu vermeiden.',
    waste_disposal_types: 'Abfallentsorgungstypen',
    organic_waste: 'Bioabfall',
    organic_waste_desc: 'Lebensmittelreste, Gartenabfälle und biologisch abbaubare Materialien. Zweiwöchentliche Sammlung mit spezifischen Zeitfenstern.',
    general_waste: 'Restmüll',
    general_waste_desc: 'Nicht recycelbare Haushaltsabfälle. Tägliche Sammlung mit abendlichen Zeitbeschränkungen.',
    glass_containers: 'Glasbehälter',
    glass_containers_desc: 'Glasflaschen und -gläser. 24/7 verfügbar außer während der Ruhezeiten (23:00-08:00).',
    recyclables: 'Recycelbare Materialien',
    recyclables_desc: 'Papier, Pappe, Plastik und Metallbehälter. Jederzeit für Ihre Bequemlichkeit verfügbar.',
    bulky_items: 'Sperrmüll',
    bulky_items_desc: 'Große Gegenstände, Möbel und Elektronik. Muss während der Betriebszeiten zum Ecoparc gebracht werden.',
    about_xabia: 'Über Xàbia/Javea',
    about_xabia_desc: 'Xàbia (Valencianisch) oder Javea (Spanisch) ist eine Küstengemeinde in der Marina Alta Region von Alicante, Spanien. Mit einer Bevölkerung von über 27.000 Einwohnern und einer bedeutenden internationalen Gemeinschaft hat die Stadt strenge Abfallbewirtschaftungsvorschriften implementiert, um ihre schöne mediterrane Umwelt zu erhalten und die EU-Recyclingziele zu erreichen.',
    about_xabia_expanded: 'Die Gemeinde betreibt ein fortschrittliches Abfallsammelsystem mit spezifischen Zeitanforderungen, um die Umweltauswirkungen zu minimieren und effiziente Sammeldienste für Einwohner und Besucher gleichermaßen zu gewährleisten.',
    show_more: 'Mehr anzeigen',
    show_less: 'Weniger anzeigen',
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
    ios_install_hint: 'Obtenez l\'expérience complète avec accès hors ligne, mises à jour instantanées et accès rapide aux horaires de déchets. Appuyez sur le bouton partager puis "Ajouter à l\'écran d\'accueil"',
    got_it: 'Compris',
    hero_title: 'Gestion Intelligente des Déchets pour Xàbia/Javea',
    hero_description: 'Ne manquez plus jamais les horaires d\'élimination des déchets. Cette application fournit des informations en temps réel sur quand vous pouvez déposer différents types de déchets dans leurs conteneurs communaux respectifs à Xàbia/Javea, vous aidant à éviter les amendes et à contribuer à un environnement plus propre.',
    check_waste_times: 'Vérifier les Horaires de Déchets Maintenant',
    learn_waste_types: 'Apprendre sur les Types de Déchets',
    real_time_schedule: 'Horaire en Temps Réel',
    real_time_schedule_desc: 'Vérifiez les horaires d\'élimination des déchets actuels instantanément, avec des ajustements saisonniers pour les horaires d\'été et d\'hiver.',
    proper_recycling: 'Recyclage Approprié',
    proper_recycling_desc: 'Apprenez sur différents types de déchets et leurs horaires d\'élimination spécifiques pour assurer un recyclage approprié.',
    avoid_fines: 'Éviter les Amendes',
    avoid_fines_desc: 'Les réglementations municipales exigent des horaires spécifiques pour l\'élimination des déchets. Cette application vous aide à vous conformer et à éviter les pénalités.',
    waste_disposal_types: 'Types d\'Élimination des Déchets',
    organic_waste: 'Déchets Organiques',
    organic_waste_desc: 'Restes de nourriture, déchets de jardin et matériaux biodégradables. Collecte bi-hebdomadaire avec des fenêtres de temps spécifiques.',
    general_waste: 'Déchets Généraux',
    general_waste_desc: 'Déchets ménagers non recyclables. Collecte quotidienne avec restrictions d\'horaire nocturne.',
    glass_containers: 'Conteneurs de Verre',
    glass_containers_desc: 'Bouteilles et bocaux en verre. Disponible 24/7 sauf pendant les heures de silence (23:00-08:00).',
    recyclables: 'Recyclables',
    recyclables_desc: 'Papier, carton, plastique et conteneurs métalliques. Disponible à tout moment pour votre commodité.',
    bulky_items: 'Objets Encombrants',
    bulky_items_desc: 'Objets volumineux, meubles et électronique. Doivent être apportés à l\'Ecoparc pendant les heures d\'ouverture.',
    about_xabia: 'À Propos de Xàbia/Javea',
    about_xabia_desc: 'Xàbia (Valencien) ou Javea (Espagnol) est une municipalité côtière dans la région de Marina Alta d\'Alicante, Espagne. Avec une population de plus de 27 000 résidents et une communauté internationale significative, la ville a mis en place des réglementations strictes de gestion des déchets pour maintenir son bel environnement méditerranéen et respecter les objectifs de recyclage de l\'UE.',
    about_xabia_expanded: 'La municipalité exploite un système de collecte de déchets avancé avec des exigences de timing spécifiques pour minimiser l\'impact environnemental et assurer des services de collecte efficaces pour les résidents et les visiteurs.',
    show_more: 'Afficher plus',
    show_less: 'Afficher moins',
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
    ios_install_hint: 'Krijg de volledige ervaring met offline toegang, directe updates en snelle toegang tot afvalroosters. Tik op de deel-knop en dan "Toevoegen aan startscherm"',
    got_it: 'Begrepen',
    hero_title: 'Slimme Afvalbeheer voor Xàbia/Javea',
    hero_description: 'Mis nooit meer de afvalverwijderingstijden. Deze app biedt real-time informatie over wanneer u verschillende soorten afval kunt deponeren in hun respectievelijke gemeenschappelijke containers in Xàbia/Javea, om u te helpen boetes te vermijden en bij te dragen aan een schonere omgeving.',
    check_waste_times: 'Controleer Afvaltijden Nu',
    learn_waste_types: 'Leer Over Afvalsoorten',
    real_time_schedule: 'Real-time Schema',
    real_time_schedule_desc: 'Controleer huidige afvalverwijderingstijden direct, met seizoensaanpassingen voor zomer- en winterschema\'s.',
    proper_recycling: 'Correcte Recycling',
    proper_recycling_desc: 'Leer over verschillende afvalsoorten en hun specifieke verwijderingstijden om correcte recycling te waarborgen.',
    avoid_fines: 'Boetes Vermijden',
    avoid_fines_desc: 'Gemeentelijke voorschriften vereisen specifieke tijden voor afvalverwijdering. Deze app helpt u om compliant te zijn en straffen te vermijden.',
    waste_disposal_types: 'Afvalverwijderingstypen',
    organic_waste: 'GFT',
    organic_waste_desc: 'Voedselresten, tuinafval en biologisch afbreekbare materialen. Tweewekelijkse inzameling met specifieke tijdvensters.',
    general_waste: 'Restafval',
    general_waste_desc: 'Niet-recycleerbaar huishoudelijk afval. Dagelijkse inzameling met avondtijdbeperkingen.',
    glass_containers: 'Glascontainers',
    glass_containers_desc: 'Glasflessen en -potten. 24/7 beschikbaar behalve tijdens stille uren (23:00-08:00).',
    recyclables: 'Recycleerbare Materialen',
    recyclables_desc: 'Papier, karton, plastic en metalen containers. Altijd beschikbaar voor uw gemak.',
    bulky_items: 'Grofvuil',
    bulky_items_desc: 'Grote items, meubels en elektronica. Moet naar Ecoparc worden gebracht tijdens openingstijden.',
    about_xabia: 'Over Xàbia/Javea',
    about_xabia_desc: 'Xàbia (Valenciaans) of Javea (Spaans) is een kustgemeente in de Marina Alta regio van Alicante, Spanje. Met een bevolking van meer dan 27.000 inwoners en een aanzienlijke internationale gemeenschap heeft de stad strenge afvalbeheervoorschriften geïmplementeerd om haar prachtige mediterrane omgeving te behouden en te voldoen aan EU-recyclingdoelen.',
    about_xabia_expanded: 'De gemeente exploiteert een geavanceerd afvalinzamelingssysteem met specifieke timingvereisten om milieueffecten te minimaliseren en efficiënte inzamelingsdiensten te waarborgen voor zowel bewoners als bezoekers.',
    show_more: 'Meer tonen',
    show_less: 'Minder tonen',
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

// Show iOS install prompt on every load
function checkIOSInstall() {
  setTimeout(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    if (isIOS && isSafari) {
      showIOSInstallPrompt();
    }
  }, 2000); // Show after 2 seconds
}

// Initialize Amazon Associates
window.amazonAssociates = new AmazonAssociates();

// Accordion functionality
function initAccordion() {
  const accordionItems = document.querySelectorAll('.accordion-item');
  
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      accordionItems.forEach(otherItem => {
        otherItem.classList.remove('active');
      });
      
      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// Show more functionality for location info
function toggleLocationInfo() {
  const locationInfo = document.querySelector('.location-info');
  const expandedContent = document.querySelector('.location-expanded');
  const showMoreBtn = document.querySelector('.show-more-btn');
  const showMoreText = document.querySelector('.show-more-text');
  const showMoreArrow = document.querySelector('.show-more-arrow');
  
  const isExpanded = locationInfo.classList.contains('expanded');
  
  if (isExpanded) {
    locationInfo.classList.remove('expanded');
    expandedContent.style.display = 'none';
    showMoreText.textContent = 'Show more';
  } else {
    locationInfo.classList.add('expanded');
    expandedContent.style.display = 'block';
    showMoreText.textContent = 'Show less';
  }
}

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
    checkIOSInstall();
    initAccordion();
    console.log('Initialization complete');
  } else {
    console.error('Some elements not found, retrying in 100ms...');
    setTimeout(initializeApp, 100);
  }
}

// Run initialization
initializeApp();


