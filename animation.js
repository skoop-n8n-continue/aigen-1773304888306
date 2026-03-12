/* ═══════════════════════════════════════════════════════════════════
   QUALITY ROOTS — DEAL DROPS ANIMATION ENGINE
   "The Deal Court" — Bold sports-broadcast energy meets premium cannabis
   ═══════════════════════════════════════════════════════════════════ */

// ─── REGISTER PLUGINS ────────────────────────────────────────────
gsap.registerPlugin(SplitText, CustomEase, MotionPathPlugin, DrawSVGPlugin);

// ─── CUSTOM EASES ─────────────────────────────────────────────────
CustomEase.create('slamIn', 'M0,0 C0.1,0 0.22,1.25 0.5,1.05 C0.72,0.9 0.9,1 1,1');

// ─── CONSTANTS ────────────────────────────────────────────────────
const PRODUCTS_PER_CYCLE = 1;    // dramatic one-at-a-time spotlight
const CYCLE_TOTAL        = 11.5; // seconds per product

// ─── STATE ────────────────────────────────────────────────────────
let PRODUCTS        = [];
let currentBatch    = 0;
let particleCtx     = null;
let particles       = [];
let burstLines      = [];
let livingTweens    = [];        // tweens to kill on exit

// ─── HELPERS ─────────────────────────────────────────────────────
function formatPrice(price) {
  const n = parseFloat(price);
  if (isNaN(n)) return '$0';
  return n % 1 === 0 ? `$${n.toFixed(0)}` : `$${n.toFixed(2)}`;
}

function getDiscountPercent(product) {
  const orig = parseFloat(product.price);
  const disc = parseFloat(product.discounted_price);
  if (!orig || orig <= 0) return 50;
  return Math.round((1 - disc / orig) * 100);
}

function getStrainClass(product) {
  const s = (product.strain_type || product.strain || '').toLowerCase();
  if (s.includes('indica')) return 'strain-indica';
  if (s.includes('sativa')) return 'strain-sativa';
  return 'strain-hybrid';
}

// ─── PRODUCT DATA → DOM ──────────────────────────────────────────
function renderProduct(product) {
  const img  = document.getElementById('product-image');
  img.src    = product.image_url || '';
  img.alt    = product.name || 'Product';

  document.getElementById('product-name').textContent =
    product.name || 'Product';

  document.getElementById('product-brand').textContent =
    (product.brand || '').toUpperCase();

  document.getElementById('category-text').textContent =
    (product.category || '').toUpperCase();

  const strainWrapper = document.getElementById('strain-badge-wrapper');
  strainWrapper.className = 'strain-badge ' + getStrainClass(product);
  document.getElementById('strain-text').textContent =
    (product.strain_type || product.strain || 'HYBRID').toUpperCase();

  document.getElementById('original-price').textContent =
    formatPrice(product.price);
  document.getElementById('sale-price').textContent =
    formatPrice(product.discounted_price);

  const pct = getDiscountPercent(product);
  // split onto two lines via innerHTML
  document.getElementById('discount-percent').innerHTML =
    `${pct}%<br>OFF`;
}

// ─── BURST SVG LINES ─────────────────────────────────────────────
function buildBurstLines() {
  const svg   = document.getElementById('burst-svg');
  const cx    = 400;
  const cy    = 400;
  const total = 32;
  const lens  = [380, 260, 340, 220, 300, 250, 360, 180];

  while (svg.firstChild) svg.removeChild(svg.firstChild);
  burstLines = [];

  for (let i = 0; i < total; i++) {
    const angle = (i / total) * 360;
    const rad   = (angle * Math.PI) / 180;
    const len   = lens[i % lens.length];
    const x2    = cx + Math.cos(rad) * len;
    const y2    = cy + Math.sin(rad) * len;

    const line  = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', i % 4 === 0 ? '#a8f063' : '#7ed856');
    line.setAttribute('stroke-width', i % 3 === 0 ? '3' : '1.5');

    svg.appendChild(line);
    burstLines.push(line);
  }

  gsap.set(burstLines, { drawSVG: '0%' });
}

// ─── PARTICLE SYSTEM ─────────────────────────────────────────────
function initParticles() {
  const canvas    = document.getElementById('particle-canvas');
  canvas.width    = 1920;
  canvas.height   = 1080;
  particleCtx     = canvas.getContext('2d');
  particles       = [];

  for (let i = 0; i < 55; i++) particles.push(spawnParticle(true));

  (function loop() {
    if (!particleCtx) return;
    particleCtx.clearRect(0, 0, 1920, 1080);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) { particles[i] = spawnParticle(false); continue; }

      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      particleCtx.fillStyle  = p.color;
      particleCtx.globalAlpha = p.life * 0.55;
      particleCtx.fill();
    }
    particleCtx.globalAlpha = 1;
    requestAnimationFrame(loop);
  })();
}

function spawnParticle(anywhere) {
  return {
    x:     anywhere ? Math.random() * 1920 : 500 + Math.random() * 900,
    y:     anywhere ? Math.random() * 1080 : 200 + Math.random() * 680,
    vx:    (Math.random() - 0.5) * 0.9,
    vy:    -(Math.random() * 1.1 + 0.2),
    r:     Math.random() * 3 + 1,
    color: Math.random() > 0.5 ? '#7ed856' : '#f0c429',
    life:  1,
    decay: Math.random() * 0.003 + 0.0015
  };
}

// ─── TICKER ──────────────────────────────────────────────────────
function buildTicker() {
  const inner = document.getElementById('ticker-inner');
  inner.innerHTML = '';

  const words = [
    'QUALITY ROOTS','•','50% OFF','•','DEAL DROPS','•',
    'LIMITED TIME','•','QUALITY ROOTS','•','50% OFF','•',
    'DEAL DROPS','•','SHOP NOW','•',
    'QUALITY ROOTS','•','50% OFF','•','DEAL DROPS','•',
    'LIMITED TIME','•','QUALITY ROOTS','•','50% OFF','•',
    'DEAL DROPS','•','SHOP NOW','•'
  ];

  [1, 2, 3].forEach(() => {
    const seg = document.createElement('span');
    seg.className = 'ticker-segment';
    words.forEach(w => {
      const el = document.createElement('span');
      if (w === '•') {
        el.className  = 'ticker-dot';
      } else {
        el.className  = 'ticker-word';
        el.textContent = w;
      }
      seg.appendChild(el);
    });
    inner.appendChild(seg);
  });

  requestAnimationFrame(() => {
    const segW = inner.querySelector('.ticker-segment').offsetWidth || 3200;
    gsap.set(inner, { x: 0 });
    gsap.to(inner, {
      x: -segW,
      duration: 20,
      ease: 'none',
      repeat: -1,
      repeatDelay: 0
    });
  });
}

// ─── SCENE INIT (one-time) ────────────────────────────────────────
function initScene() {
  buildBurstLines();
  initParticles();
  buildTicker();

  // Corner accents appear once
  gsap.to('#corner-accents', { opacity: 1, duration: 1, delay: 0.3 });

  // Hex lines initially hidden
  gsap.set(['#hex-poly', '#hex-poly-inner'], { drawSVG: '0%' });
  gsap.set('#separator-line',   { drawSVG: '0%' });
  gsap.set('#strikethrough-line', { drawSVG: '0%' });
}

// ─── KILL LIVING TWEENS ───────────────────────────────────────────
function killLivingTweens() {
  livingTweens.forEach(t => t && t.kill());
  livingTweens = [];
}

// ─── RESET ALL ELEMENTS ──────────────────────────────────────────
function resetAll(split) {
  killLivingTweens();

  gsap.set('#left-panel',           { x: 0, opacity: 1 });
  gsap.set('#product-image-wrapper',{ opacity: 0, x: -80, y: 30, rotation: -6, scale: 0.85 });
  gsap.set('#product-image',        { y: 0 });
  gsap.set('#hex-frame',            { opacity: 0, scale: 0.7, rotation: -15 });
  gsap.set(['#hex-poly','#hex-poly-inner'], { drawSVG: '0%' });
  gsap.set('#category-pill',        { opacity: 0, y: -20, scale: 0.8 });
  gsap.set('#strain-badge-wrapper', { opacity: 0, y: 20 });
  gsap.set('#burst-container',      { opacity: 0, scale: 0.5, rotation: -10 });
  gsap.set(burstLines,              { drawSVG: '0%' });
  gsap.set('#qr-logo',              { opacity: 0, y: -20 });
  gsap.set('#product-brand-wrapper',{ opacity: 0, x: 40 });
  gsap.set('#separator-line',       { drawSVG: '0%' });
  gsap.set('#separator-svg',        { opacity: 1 });
  gsap.set('#was-block',            { opacity: 0, x: -30 });
  gsap.set('#strikethrough-line',   { drawSVG: '0%' });
  gsap.set('#deal-row',             { opacity: 0, y: 40, scale: 0.85 });
  gsap.set('#badge-wrapper',        { scale: 0, rotation: 30, opacity: 0 });
  gsap.set('#sale-price',           { opacity: 0, scale: 0.5, y: 20,
                                      textShadow: '0 0 30px rgba(240,196,41,0.6)' });
  gsap.set('#flash-overlay',        { opacity: 0 });
  gsap.set('#impact-overlay',       { opacity: 0 });

  if (split && split.words) {
    gsap.set(split.words, { opacity: 0, y: 80, skewX: 10 });
  }
}

// ─── LIVING MOMENT TWEENS (called via timeline callback) ──────────
function startLivingTweens() {
  killLivingTweens();

  livingTweens.push(
    // Product floats gently
    gsap.to('#product-image', {
      y: -20, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1
    }),
    // Hex frame slow drift rotation
    gsap.to('#hex-frame', {
      rotation: '+=60', duration: 18, ease: 'none', repeat: -1
    }),
    // Badge gentle pulse
    gsap.to('#badge-wrapper', {
      scale: 1.09, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1
    }),
    // Sale price golden glow breathes
    gsap.to('#sale-price', {
      textShadow: '0 0 60px rgba(240,196,41,0.95), 0 0 120px rgba(240,196,41,0.45)',
      duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1
    }),
    // Burst container very slow rotation
    gsap.to('#burst-container', {
      rotation: '+=180', duration: 25, ease: 'none', repeat: -1
    })
  );
}

// ─── MAIN CYCLE ──────────────────────────────────────────────────
function animateCycle(batchIndex) {
  const batch = getBatch(batchIndex);

  if (batch.length === 0) {
    gsap.delayedCall(0.5, () => animateCycle(batchIndex + 1));
    return;
  }

  const product = batch[0];
  renderProduct(product);

  // Re-split text after content changes
  const nameEl = document.getElementById('product-name');
  // Auto-scale font based on name length
  const len = (product.name || '').length;
  nameEl.style.fontSize =
    len > 60 ? '52px' :
    len > 45 ? '62px' :
    len > 30 ? '72px' : '82px';

  const split = SplitText.create(nameEl, {
    type: 'lines,words',
    linesClass: 'line-wrap'
  });

  resetAll(split);

  const tl = gsap.timeline({
    onComplete: () => {
      if (split && typeof split.revert === 'function') split.revert();
      animateCycle(batchIndex + 1);
    }
  });

  // ── ACT 1 · ENTRANCE FLASH (0 – 0.5s) ────────────────────────
  tl.to('#flash-overlay', { opacity: 0.9, duration: 0.07, ease: 'none' }, 0)
    .to('#flash-overlay', { opacity: 0, duration: 0.4, ease: 'power3.out' }, 0.07)
    .to('#impact-overlay', { opacity: 0.5, duration: 0.15, ease: 'none' }, 0.05)
    .to('#impact-overlay', { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.2)

  // ── ACT 2 · BURST REVEAL (0.1 – 1.0s) ───────────────────────
    .to('#burst-container', {
      opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'power3.out'
    }, 0.1)
    .to(burstLines, {
      drawSVG: '100%', duration: 0.7,
      stagger: { each: 0.012, from: 'random' },
      ease: 'power2.out'
    }, 0.12)

  // ── ACT 3 · HEX FRAME + PRODUCT IMAGE (0.25 – 1.5s) ─────────
    .to('#hex-frame', {
      opacity: 1, scale: 1, rotation: 0, duration: 0.75, ease: 'back.out(1.4)'
    }, 0.25)
    .to(['#hex-poly', '#hex-poly-inner'], {
      drawSVG: '100%', duration: 1.0, ease: 'power3.inOut'
    }, 0.25)
    .to('#product-image-wrapper', {
      opacity: 1, x: 0, y: 0, rotation: 0, scale: 1,
      duration: 0.85, ease: 'slamIn'
    }, 0.38)
    .to('#category-pill', {
      opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(2.2)'
    }, 0.75)
    .to('#strain-badge-wrapper', {
      opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.8)'
    }, 0.9)

  // ── ACT 4 · TEXT CASCADE (0.45 – 2.4s) ──────────────────────
    .to('#qr-logo', {
      opacity: 1, y: 0, duration: 0.45, ease: 'power3.out'
    }, 0.45)
    .to('#product-brand-wrapper', {
      opacity: 1, x: 0, duration: 0.45, ease: 'power3.out'
    }, 0.6)
    .to(split.words, {
      opacity: 1, y: 0, skewX: 0,
      duration: 0.5,
      stagger: { each: 0.035, from: 'start' },
      ease: 'power4.out'
    }, 0.75)
    .to('#separator-line', {
      drawSVG: '100%', duration: 0.65, ease: 'power3.inOut'
    }, 1.3)

  // ── ACT 5 · PRICE REVEAL (1.9 – 3.6s) ───────────────────────
    .to('#was-block', {
      opacity: 1, x: 0, duration: 0.45, ease: 'power3.out'
    }, 1.9)
    .to('#strikethrough-line', {
      drawSVG: '100%', duration: 0.4, ease: 'power3.inOut'
    }, 2.4)
    .to('#deal-row', {
      opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out'
    }, 2.65)
    .to('#badge-wrapper', {
      scale: 1, rotation: 0, opacity: 1,
      duration: 0.75, ease: 'elastic.out(1, 0.5)'
    }, 2.7)
    .to('#sale-price', {
      opacity: 1, scale: 1.18, y: 0, duration: 0.3, ease: 'power4.out'
    }, 3.2)
    .to('#sale-price', {
      scale: 1, duration: 0.22, ease: 'power2.inOut'
    }, 3.5)
    // Micro screen shake on price land
    .to('#scene', { x: 9,  duration: 0.04, ease: 'none' }, 3.2)
    .to('#scene', { x: -9, duration: 0.04, ease: 'none' }, 3.24)
    .to('#scene', { x: 5,  duration: 0.04, ease: 'none' }, 3.28)
    .to('#scene', { x: -5, duration: 0.04, ease: 'none' }, 3.32)
    .to('#scene', { x: 0,  duration: 0.04, ease: 'none' }, 3.36)

  // ── ACT 6 · LIVING MOMENT (3.7 – 9.0s) ─────────────────────
    .call(startLivingTweens, [], 3.7)

  // ── ACT 7 · EXIT (9.0 – 10.8s) ──────────────────────────────
    .call(killLivingTweens, [], 9.0)
    // Flash on exit
    .to('#flash-overlay', { opacity: 0.6, duration: 0.1, ease: 'none' }, 9.0)
    .to('#flash-overlay', { opacity: 0, duration: 0.5, ease: 'power2.out' }, 9.1)
    // Left panel off-screen left
    .to('#left-panel', {
      x: -820, opacity: 0, duration: 0.65, ease: 'power3.in'
    }, 9.05)
    // Right panel — logo + brand sweep right
    .to(['#qr-logo', '#product-brand-wrapper'], {
      x: 120, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power3.in'
    }, 9.05)
    // Product name words scatter upward
    .to(split.words, {
      opacity: 0, y: -60, skewX: -8,
      duration: 0.38,
      stagger: { each: 0.022, from: 'end' },
      ease: 'power3.in'
    }, 9.1)
    // Separator wipe out
    .to('#separator-svg', {
      opacity: 0, duration: 0.3, ease: 'power2.in'
    }, 9.1)
    // Price blocks drop away
    .to('#was-block', {
      opacity: 0, y: 50, duration: 0.35, ease: 'power3.in'
    }, 9.1)
    .to('#deal-row', {
      opacity: 0, y: 60, scale: 0.8, duration: 0.4, ease: 'power3.in'
    }, 9.2)
    // Burst fades
    .to('#burst-container', {
      opacity: 0, scale: 0.55, duration: 0.5, ease: 'power2.in'
    }, 9.0)

  // ── HOLD: push timeline to full CYCLE_TOTAL duration ─────────
    .set('#flash-overlay', { opacity: 0 }, CYCLE_TOTAL);

  return tl;
}

// ─── BATCH HELPERS ────────────────────────────────────────────────
function getBatch(batchIndex) {
  if (PRODUCTS.length === 0) return [];
  return [PRODUCTS[batchIndex % PRODUCTS.length]];
}

// ─── LOAD PRODUCTS ────────────────────────────────────────────────
async function loadProducts() {
  try {
    const res  = await fetch('./products.json', { cache: 'no-store' });
    const data = await res.json();
    PRODUCTS   = data.products || [];
  } catch (err) {
    console.warn('[QR] products.json not found — using demo data');
    PRODUCTS = getDemoProducts();
  }

  initScene();
  animateCycle(0);
}

// ─── DEMO / FALLBACK PRODUCTS ────────────────────────────────────
function getDemoProducts() {
  return [
    {
      name: 'Savvy Blue Magic Guap Gummy 25mg 1-Pack',
      brand: 'Savvy',
      category: 'Gummies',
      strain_type: 'Indica',
      price: '7',
      discounted_price: 3.5,
      image_url: 'https://skoop-general.s3.us-east-1.amazonaws.com/n8n_image_gen%2Fundefined-1773196700024.png'
    },
    {
      name: 'Lost Farm Juicy Peach x GSC Sherbet Live Resin Gummies 10mg x 10-Pack',
      brand: 'Lost Farm',
      category: 'Gummies',
      strain_type: 'Hybrid',
      price: '30',
      discounted_price: 15,
      image_url: 'https://skoop-general.s3.us-east-1.amazonaws.com/n8n_image_gen%2Fundefined-1773196879298.png'
    },
    {
      name: 'Orange Malt Flower 7g',
      brand: 'URBNJ',
      category: 'Whole Flower',
      strain_type: 'Hybrid',
      price: '65',
      discounted_price: 32.5,
      image_url: 'https://leaflogixmedia.blob.core.windows.net/product-image/ce1aabe2-d086-4462-91ad-8f70ef4c5913.jpg'
    }
  ];
}

// ─── BOOT ─────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', loadProducts);
