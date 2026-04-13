/* ============================================
   GOLDEN BLADE — script.js
   ============================================ */

const WA_NUMBER = '17862618924';

// ── MENÚ HAMBURGUESA ──
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}
function closeMenu() {
  document.getElementById('navLinks').classList.remove('open');
}


// ── WHATSAPP DINÁMICO ──────────────────────────────────────────────────
/*
  Cómo funciona:
  - Cada link de WhatsApp en el HTML tiene clase "wa-link".
  - En lugar de un href fijo, tiene dos atributos:
      data-msg-es  →  mensaje en español
      data-msg-en  →  mensaje en inglés
  - Esta función recorre todos esos links y arma el href correcto
    según el idioma activo en ese momento.
  - Se llama al cargar la página y cada vez que el usuario cambia idioma.

  Para agregar un nuevo link de WhatsApp con mensaje propio:
  1. Poné class="wa-link" en el <a>
  2. Quitá el href o poné href="#"
  3. Agregá data-msg-es="tu mensaje" y data-msg-en="your message"
  4. Listo — este script lo maneja automáticamente.
*/
function updateWaLinks(lang) {
  document.querySelectorAll('.wa-link').forEach(link => {
    const msg = lang === 'en'
      ? (link.dataset.msgEn || link.dataset.msgEs || '')
      : (link.dataset.msgEs || '');
    const encoded = encodeURIComponent(msg);
    link.href = `https://wa.me/${WA_NUMBER}?text=${encoded}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
}


// ── SELECTOR DE IDIOMA ─────────────────────────────────────────────────
/*
  Para traducir cualquier elemento nuevo:
  Agregar data-es="..." y data-en="..." en el HTML.
  Este script lo traduce automáticamente — no tocar el JS.
*/
let currentLang = localStorage.getItem('gb-lang') || 'es';

function applyLang(lang) {
  // 1. Traducir textos
  document.querySelectorAll('[data-es][data-en]').forEach(el => {
    const text = lang === 'en' ? el.dataset.en : el.dataset.es;
    if (text && text.includes('<')) {
      el.innerHTML = text;
    } else if (text) {
      el.textContent = text;
    }
  });

  // 2. Actualizar todos los links de WhatsApp con el idioma nuevo
  updateWaLinks(lang);

  // 3. Atributo lang del <html> (SEO)
  document.getElementById('html-root').setAttribute('lang', lang);

  // 4. Botón muestra el idioma al que vas a cambiar
  document.getElementById('langBtn').textContent = lang === 'en' ? 'ES' : 'EN';

  // 5. Guardar preferencia
  localStorage.setItem('gb-lang', lang);
  currentLang = lang;
}

function toggleLang() {
  applyLang(currentLang === 'es' ? 'en' : 'es');
}

// Aplicar al cargar
applyLang(currentLang);


// ── CONTADORES ANIMADOS ────────────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = target >= 3000 ? '+' : target === 98 ? '%' : '+';
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString() + suffix;
  }, 20);
}

const statsObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach(animateCounter);
      statsObs.disconnect();
    }
  });
}, { threshold: 0.4 });

const statsEl = document.querySelector('.stats');
if (statsEl) statsObs.observe(statsEl);