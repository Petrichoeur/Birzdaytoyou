/* ============================================================
   GOTHIC BIRTHDAY — ANGÉLIQUE
   script.js — Enhanced with dynamic video discovery
   ============================================================ */

'use strict';

// ============================================================
// CONFIG
// ============================================================
const VIDEO_DIR = 'vidéo';

// Supported video extensions
const VIDEO_EXTENSIONS = [
  'mp4', 'webm', 'ogg', 'ogv', 'mov', 'avi', 'mkv',
  'm4v', '3gp', 'flv', 'wmv', 'ts', 'mts'
];

// Gothic descriptions for cards
const GOTHIC_DESCRIPTIONS = [
  { title: "Un message du fond du cœur",         desc: "Un être cher traverse les ténèbres pour toi…" },
  { title: "Mots gravés dans l'ombre",            desc: "Des souvenirs que le temps n'efface pas." },
  { title: "Voix venue de loin",                   desc: "La distance n'arrête pas l'amour." },
  { title: "Un secret murmuré",                    desc: "Rien que pour tes oreilles…" },
  { title: "Lumière dans les ténèbres",            desc: "Tu illumines tout ce que tu touches." },
  { title: "L'hommage final",                      desc: "Parce que tu mérites tout l'amour du monde." },
  { title: "Écho d'une âme errante",               desc: "Les morts ne t'oublient jamais." },
  { title: "Incantation nocturne",                 desc: "Un sort d'amour jeté depuis l'au-delà." },
  { title: "Ombre bienveillante",                  desc: "Même l'obscurité peut être douce." },
  { title: "Dernier souffle d'amour",              desc: "Un murmure éternel porté par le vent." },
  { title: "Pacte de sang",                         desc: "Un lien que rien ne peut briser." },
  { title: "Rose des abysses",                     desc: "La beauté qui éclot dans les ténèbres." },
  { title: "Chant funèbre",                        desc: "Un hymne dédié à ta grandeur." },
  { title: "Le calice d'obsidienne",               desc: "Bois à la source de l'éternité." },
  { title: "Cathédrale de souvenirs",              desc: "Chaque pierre est un instant avec toi." },
  { title: "Nuit sans fin",                         desc: "Là où les rêves deviennent réalité." },
  { title: "Le voile se lève",                     desc: "Découvre ce que l'ombre cachait." },
  { title: "Danse macabre",                        desc: "Le monde danse pour toi ce soir." },
  { title: "Encre et velours",                     desc: "Des mots écrits avec l'âme." },
  { title: "L'appel du crépuscule",                desc: "Le soir murmure ton nom." },
];

// ============================================================
// 1. DYNAMIC VIDEO DISCOVERY
// ============================================================
async function discoverVideos() {
  const videos = [];

  // Strategy 1: Try to fetch a directory listing (works when served by a file server)
  try {
    const response = await fetch(VIDEO_DIR + '/');
    if (response.ok) {
      const text = await response.text();
      // Parse HTML directory listing
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const links = doc.querySelectorAll('a[href]');

      links.forEach(link => {
        const href = decodeURIComponent(link.getAttribute('href'));
        const ext = href.split('.').pop().toLowerCase();
        if (VIDEO_EXTENSIONS.includes(ext)) {
          // Clean up the href - remove any leading path prefixes
          const filename = href.split('/').pop();
          videos.push({
            src: VIDEO_DIR + '/' + filename,
            filename: filename,
          });
        }
      });

      if (videos.length > 0) return videos;
    }
  } catch (e) {
    // Directory listing not available — fall through to Strategy 2
  }

  // Strategy 2: Probe common filenames
  const probePrefixes = [
    'video', 'Video', 'VIDEO',
    'vidéo', 'Vidéo', 'VIDÉO',
    'msg', 'message', 'Message',
    'bday', 'birthday', 'anniv',
    'clip', 'Clip',
  ];

  const probePromises = [];

  // Probe numbered files (video1.mp4, video_1.mp4, etc.)
  for (let i = 1; i <= 30; i++) {
    for (const prefix of probePrefixes) {
      for (const ext of ['mp4', 'webm', 'mov', 'ogg', 'ogv', 'm4v', 'avi', 'mkv']) {
        // Patterns: video1, video_1, video-1, video01, video_01
        const patterns = [
          `${prefix}${i}`,
          `${prefix}_${i}`,
          `${prefix}-${i}`,
          `${prefix}${String(i).padStart(2, '0')}`,
          `${prefix}_${String(i).padStart(2, '0')}`,
          `${prefix}-${String(i).padStart(2, '0')}`,
        ];

        for (const name of patterns) {
          const path = `${VIDEO_DIR}/${name}.${ext}`;
          probePromises.push(
            fetch(path, { method: 'HEAD' })
              .then(r => {
                if (r.ok) {
                  return { src: path, filename: `${name}.${ext}` };
                }
                return null;
              })
              .catch(() => null)
          );
        }
      }
    }
  }

  // Also probe single-name files
  for (const ext of ['mp4', 'webm', 'mov', 'ogg', 'ogv', 'm4v', 'avi', 'mkv']) {
    const singleNames = [
      'intro', 'final', 'surprise', 'happy_birthday', 'joyeux_anniversaire',
      'happy-birthday', 'joyeux-anniversaire', 'HappyBirthday', 'JoyeuxAnniversaire',
    ];
    for (const name of singleNames) {
      const path = `${VIDEO_DIR}/${name}.${ext}`;
      probePromises.push(
        fetch(path, { method: 'HEAD' })
          .then(r => r.ok ? { src: path, filename: `${name}.${ext}` } : null)
          .catch(() => null)
      );
    }
  }

  const results = await Promise.all(probePromises);
  const found = results.filter(Boolean);

  // Deduplicate by src
  const seen = new Set();
  for (const v of found) {
    if (!seen.has(v.src)) {
      seen.add(v.src);
      videos.push(v);
    }
  }

  // Sort naturally by filename
  videos.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));

  return videos;
}

// Assign gothic metadata to discovered videos
function enrichVideos(videos) {
  return videos.map((v, i) => {
    const meta = GOTHIC_DESCRIPTIONS[i % GOTHIC_DESCRIPTIONS.length];
    // Extract a readable name from filename
    const baseName = v.filename.replace(/\.[^.]+$/, ''); // remove extension
    const readableName = baseName
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();

    return {
      ...v,
      label: `Âme ${String(i + 1).padStart(2, '0')}`,
      title: meta.title,
      desc: meta.desc,
      readableName,
    };
  });
}

// ============================================================
// 2. PARTICLE SYSTEM — Ashes, embers, dark petals
// ============================================================
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const PARTICLE_COUNT = 70;
  const particles = [];

  const SHAPES = ['ash', 'ember', 'petal', 'spark', 'rune'];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createParticle() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
      x:     rand(0, W),
      y:     rand(-30, -120),
      vx:    rand(-0.4, 0.4),
      vy:    rand(0.25, 0.95),
      alpha: rand(0.08, 0.45),
      size:  rand(1.5, shape === 'rune' ? 6 : 4.5),
      angle: rand(0, Math.PI * 2),
      spin:  rand(-0.015, 0.015),
      shape,
      life:  rand(0.5, 1),
      hue:   shape === 'ember' ? `hsl(${rand(0, 25)}, 100%, ${rand(40, 60)}%)`
           : shape === 'spark' ? '#c9a84c'
           : shape === 'petal' ? `hsl(${rand(340, 360)}, ${rand(60,100)}%, ${rand(10,25)}%)`
           : shape === 'rune'  ? 'rgba(139,0,0,0.3)'
           : `hsl(0, 0%, ${rand(25, 45)}%)`,
    };
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = createParticle();
    p.y = rand(0, H);
    particles.push(p);
  }

  function drawParticle(p) {
    ctx.save();
    ctx.globalAlpha = p.alpha * p.life;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    if (p.shape === 'ash') {
      ctx.fillStyle = p.hue;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'ember') {
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.5);
      grad.addColorStop(0, p.hue);
      grad.addColorStop(0.6, 'rgba(180,0,0,0.2)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'petal') {
      ctx.fillStyle = p.hue;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size, -p.size * 0.5, p.size * 0.8, p.size * 0.5, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.5, -p.size, -p.size * 0.5, 0, -p.size);
      ctx.fill();
    } else if (p.shape === 'rune') {
      ctx.strokeStyle = p.hue;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      // Simple gothic cross shape
      ctx.moveTo(0, -p.size);
      ctx.lineTo(0, p.size);
      ctx.moveTo(-p.size * 0.5, -p.size * 0.3);
      ctx.lineTo(p.size * 0.5, -p.size * 0.3);
      ctx.stroke();
    } else {
      // spark
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
      grad.addColorStop(0, p.hue);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    const time = Date.now() * 0.001;

    for (const p of particles) {
      // Sinusoidal drift
      p.x     += p.vx + Math.sin(time + p.y * 0.008) * 0.25;
      p.y     += p.vy;
      p.angle += p.spin;

      // Embers flicker
      if (p.shape === 'ember') {
        p.life = 0.5 + Math.sin(time * 3 + p.x) * 0.5;
      }

      if (p.y > H + 30) {
        Object.assign(p, createParticle());
      }
      drawParticle(p);
    }
    requestAnimationFrame(tick);
  }

  tick();
})();

// ============================================================
// 3. PARALLAX ON HERO + CATHEDRAL ELEMENTS
// ============================================================
(function initParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const layers = hero.querySelectorAll('.bg-layer');
  const candelabras = hero.querySelector('.candelabra-scene');
  const roseWindow = hero.querySelector('.rose-window');
  const cathedralFrame = hero.querySelector('.cathedral-frame');

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.pageYOffset;
        const heroH = hero.offsetHeight;
        if (scrollY < heroH * 1.5) {
          const ratio = scrollY / heroH;
          layers[0].style.transform = `translateY(${scrollY * 0.08}px)`;
          layers[1].style.transform = `translateY(${scrollY * 0.04}px)`;
          layers[2].style.transform = `translateY(${scrollY * 0.12}px)`;
          if (candelabras) {
            candelabras.style.transform = `translateX(-50%) translateY(${scrollY * 0.25}px)`;
            candelabras.style.opacity = Math.max(0, 1 - ratio * 1.8);
          }
          if (roseWindow) {
            roseWindow.style.transform = `translateX(-50%) translateY(${scrollY * -0.15}px)`;
            roseWindow.style.opacity = Math.max(0, 0.6 - ratio * 1.5);
          }
          if (cathedralFrame) {
            cathedralFrame.style.opacity = Math.max(0, 0.6 - ratio * 1.2);
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// ============================================================
// 3b. CANDLE SMOKE PARTICLE SYSTEM
// ============================================================
(function initCandleSmoke() {
  const canvas = document.getElementById('smokeCanvas');
  const hero = document.getElementById('hero');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Find all flame positions for smoke source points
  function getSmokeOrigins() {
    const origins = [];
    const flames = hero.querySelectorAll('.flame-wrap');
    const heroRect = hero.getBoundingClientRect();
    flames.forEach(f => {
      const rect = f.getBoundingClientRect();
      origins.push({
        x: rect.left + rect.width / 2 - heroRect.left,
        y: rect.top - heroRect.top,
      });
    });
    return origins;
  }

  const SMOKE_PER_ORIGIN = 3;
  let smokeParticles = [];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createSmoke(ox, oy) {
    return {
      x: ox + rand(-3, 3),
      y: oy,
      vx: rand(-0.3, 0.3),
      vy: rand(-0.3, -0.8),
      size: rand(2, 5),
      alpha: rand(0.06, 0.15),
      life: 1,
      decay: rand(0.003, 0.008),
      wobbleAmp: rand(8, 20),
      wobbleFreq: rand(0.01, 0.03),
      phase: rand(0, Math.PI * 2),
    };
  }

  function initSmoke() {
    const origins = getSmokeOrigins();
    smokeParticles = [];
    origins.forEach(o => {
      for (let i = 0; i < SMOKE_PER_ORIGIN; i++) {
        const p = createSmoke(o.x, o.y);
        p.life = rand(0, 1); // Stagger initial life
        p.y = o.y - rand(0, 80);
        smokeParticles.push({ ...p, originX: o.x, originY: o.y });
      }
    });
  }

  // Debounce origin recalc
  let originsCache = [];
  let lastRecalc = 0;

  function tick() {
    const now = Date.now();
    if (now - lastRecalc > 2000) {
      originsCache = getSmokeOrigins();
      lastRecalc = now;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = now * 0.001;

    for (const p of smokeParticles) {
      p.life -= p.decay;
      if (p.life <= 0) {
        // Respawn at origin
        const oi = Math.floor(rand(0, originsCache.length));
        const o = originsCache[oi] || { x: p.originX, y: p.originY };
        Object.assign(p, createSmoke(o.x, o.y));
        p.originX = o.x;
        p.originY = o.y;
        continue;
      }

      // Move with organic drift
      p.x += p.vx + Math.sin(time * 2 + p.phase + p.y * p.wobbleFreq) * 0.4;
      p.y += p.vy;
      p.size += 0.03; // Expand as they rise

      const alpha = p.alpha * p.life * p.life; // Quadratic fade
      if (alpha < 0.002) continue;

      ctx.save();
      ctx.globalAlpha = alpha;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      grad.addColorStop(0, 'rgba(180,160,130,0.4)');
      grad.addColorStop(0.4, 'rgba(150,130,110,0.15)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(tick);
  }

  // Wait for layout then start
  setTimeout(() => {
    originsCache = getSmokeOrigins();
    initSmoke();
    tick();
  }, 500);
})();

// ============================================================
// 4. SCROLL REVEAL
// ============================================================
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 150);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  items.forEach(el => obs.observe(el));
})();

// ============================================================
// 5. BUILD VIDEO CARDS (DYNAMIC)
// ============================================================
(async function buildVideoCards() {
  const grid = document.getElementById('videosGrid');
  const loading = document.getElementById('loadingIndicator');
  if (!grid) return;

  let videos;

  try {
    const discovered = await discoverVideos();
    videos = enrichVideos(discovered);
  } catch (e) {
    console.warn('Video discovery failed:', e);
    videos = [];
  }

  // Remove loading indicator
  if (loading) loading.remove();

  // No videos found
  if (videos.length === 0) {
    grid.innerHTML = `
      <div class="no-videos-message">
        <div class="gothic-icon">🕯️</div>
        <h3>Le silence des tombes</h3>
        <p>Aucune vidéo n'a encore été déposée dans le sanctuaire. Place tes offrandes dans le dossier <strong>${VIDEO_DIR}/</strong></p>
      </div>
    `;
    return;
  }

  videos.forEach((v, i) => {
    const delay = i * 0.1;

    const card = document.createElement('article');
    card.className = 'video-card';
    card.style.animationDelay = `${delay}s`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Regarder ${v.title}`);
    card.id = `video-card-${i}`;

    card.innerHTML = `
      <div class="shimmer"></div>
      <div class="card-blood-line"></div>
      <div class="video-thumb">
        <div class="thumb-deco"></div>
        <div class="video-thumb-overlay"></div>
        <span class="video-number">${v.label}</span>
        <div class="play-btn" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <polygon points="6,3 20,12 6,21"/>
          </svg>
        </div>
      </div>
      <div class="video-info">
        <div class="video-title">${v.title}</div>
        <div class="video-desc">${v.desc}</div>
      </div>
    `;

    const openLightbox = () => openVideo(v.src, v.title);
    card.addEventListener('click', openLightbox);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); }
    });

    grid.appendChild(card);
  });

  // Add scroll reveal to cards
  const cards = grid.querySelectorAll('.video-card');
  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        cardObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.animationPlayState = 'paused';
    cardObs.observe(card);
  });
})();

// ============================================================
// 6. LIGHTBOX
// ============================================================
const lightbox      = document.getElementById('lightbox');
const lightboxVideo = document.getElementById('lightboxVideo');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxOvly  = document.getElementById('lightboxOverlay');

function openVideo(src, title) {
  if (!lightbox || !lightboxVideo) return;
  lightboxTitle.textContent = title;
  lightboxVideo.src = src;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxVideo.play().catch(() => { /* autoplay blocked */ });
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightboxVideo.pause();
  lightboxVideo.removeAttribute('src');
  lightboxVideo.load(); // Reset
  document.body.style.overflow = '';
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxOvly)  lightboxOvly.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && lightbox?.classList.contains('open')) closeLightbox();
});

// ============================================================
// 7. HERO STAGGERED REVEAL ON LOAD
// ============================================================
window.addEventListener('load', () => {
  const heroItems = document.querySelectorAll('.hero-content .reveal');
  heroItems.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 500 + i * 250);
  });
});

// ============================================================
// 8. SMOOTH SCROLL WITH EASING
// ============================================================
(function initSmoothScroll() {
  const cta = document.getElementById('scrollCta');
  if (!cta) return;

  cta.addEventListener('click', e => {
    e.preventDefault();
    const target = document.getElementById('messages');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();
