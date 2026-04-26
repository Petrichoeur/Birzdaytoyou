/* ============================================================
   GOTHIC BIRTHDAY — ANGÉLIQUE
   script.js — Enhanced with dynamic video discovery
   ============================================================ */

'use strict';

// ============================================================
// 1. DYNAMIC VIDEO DISCOVERY
// ============================================================
const VIDEO_DIR = 'vidéo';

// Gothic descriptions for cards (shared across all video indices)
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

// Supported video extensions (for directory listing fallback)
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'ogv', 'mov', 'avi', 'mkv', 'm4v', '3gp', 'flv', 'wmv', 'ts', 'mts'];

// Probe a video file using <video> element (no CORS issues on file://)
function probeVideoSrc(src) {
  return new Promise(resolve => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    const timer = setTimeout(() => {
      v.src = '';
      v.load();
      resolve(null);
    }, 3000);
    v.addEventListener('loadedmetadata', () => {
      clearTimeout(timer);
      v.src = '';
      v.load();
      resolve(src);
    });
    v.addEventListener('error', () => {
      clearTimeout(timer);
      v.src = '';
      v.load();
      resolve(null);
    });
    v.src = src;
  });
}

// Metedata helper
// Metadata helper

function makeVideoEntry(src, filename, index) {
  const meta = GOTHIC_DESCRIPTIONS[index % GOTHIC_DESCRIPTIONS.length];
  return {
    src,
    filename,
    label: `Âme ${String(index + 1).padStart(2, '0')}`,
    title: meta.title,
    desc: meta.desc,
    readableName: filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim(),
  };
}

async function discoverVideos() {
  // === STRATEGY 1 (http:// only): manifest.json ===
  if (window.location.protocol !== 'file:') {
    try {
      const r = await fetch(`${VIDEO_DIR}/manifest.json`);
      if (r.ok) {
        const m = await r.json();
        if (Array.isArray(m.videos) && m.videos.length) {
          return m.videos.map((v, i) => makeVideoEntry(`${VIDEO_DIR}/${v.filename}`, v.filename, i));
        }
      }
    } catch (_) {}

    // === STRATEGY 2 (http:// only): Directory listing ===
    try {
      const r = await fetch(`${VIDEO_DIR}/`);
      if (r.ok) {
        const t = await r.text();
        const doc = new DOMParser().parseFromString(t, 'text/html');
        const vids = [];
        doc.querySelectorAll('a[href]').forEach(a => {
          const href = decodeURIComponent(a.getAttribute('href'));
          const ext = href.split('.').pop().toLowerCase();
          if (VIDEO_EXTENSIONS.includes(ext)) {
            const fn = href.split('/').pop();
            vids.push(makeVideoEntry(`${VIDEO_DIR}/${fn}`, fn, vids.length));
          }
        });
        if (vids.length) return vids;
      }
    } catch (_) {}
  }

  // === STRATEGY 3 (all protocols): <video> element probing ===
  const probes = [];
  const prefixes = ['video', 'message', 'msg'];
  const exts = ['mp4', 'webm', 'mov'];
  const testFiles = [];

  for (const prefix of prefixes) {
    for (let i = 1; i <= 20; i++) {
        for (const ext of exts) {
          testFiles.push(`${prefix}_${i}.${ext}`);
          testFiles.push(`${prefix}${i}.${ext}`);
          testFiles.push(`${prefix}_${String(i).padStart(2, '0')}.${ext}`);
        }
    }
  }
  const singleNames = ['intro.mp4', 'surprise.mp4'];
  testFiles.push(...singleNames);

  // We only care about unique filenames, but they can be duplicates in the array above
  const uniqueTests = [...new Set(testFiles)];

  for (const fn of uniqueTests) {
    const src = `${VIDEO_DIR}/${fn}`;
    probes.push(
      probeVideoSrc(src).then(found => found ? {src, filename: fn} : null)
    );
  }
  const results = await Promise.all(probes);
  const foundVids = results.filter(Boolean);
  
  // Deduplicate and enrich
  const finalVids = [];
  const seenSrc = new Set();
  for (const v of foundVids) {
    if (!seenSrc.has(v.src)) {
      seenSrc.add(v.src);
      finalVids.push(v);
    }
  }
  
  return finalVids.map((v, i) => makeVideoEntry(v.src, v.filename, i));
}

// ============================================================
// 2. PARTICLE SYSTEM — Ashes, embers, dark petals
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

  const PARTICLE_COUNT = 100;
  const particles = [];

  const SHAPES = ['ash', 'ember', 'petal', 'spark', 'rune', 'rosePetal'];

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
           : shape === 'rosePetal' ? `hsl(${rand(350, 370)}, ${rand(70,100)}%, ${rand(5,15)}%)`
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
      ctx.moveTo(0, -p.size);
      ctx.lineTo(0, p.size);
      ctx.moveTo(-p.size * 0.5, -p.size * 0.3);
      ctx.lineTo(p.size * 0.5, -p.size * 0.3);
      ctx.stroke();
    } else if (p.shape === 'rosePetal') {
      ctx.save();
      ctx.globalAlpha = p.alpha * p.life * 0.8;
      ctx.fillStyle = p.hue;
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 1.5);
      ctx.bezierCurveTo(p.size * 0.8, -p.size, p.size, p.size * 0.5, 0, p.size * 1.2);
      ctx.bezierCurveTo(-p.size, p.size * 0.5, -p.size * 0.8, -p.size, 0, -p.size * 1.5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(80,0,20,0.2)';
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(0, p.size * 0.8);
      ctx.stroke();
      ctx.restore();
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
      
      // Rose petals drift more slowly and sway more
      if (p.shape === 'rosePetal') {
        p.x     += Math.sin(time * 0.5 + p.y * 0.003) * 0.5;
        p.y     += p.vy * 0.6; // slower fall
        p.angle += p.spin * 0.3; // gentler rotation
      } else {
        p.y     += p.vy;
        p.angle += p.spin;
      }

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
    videos = discovered;
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
        <div class="thumb-gothic-pattern"></div>
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
const videoErrorMsg = document.getElementById('videoErrorMsg');

let videoLoadingTimeout = null;
let videoIsReady = false;

function openVideo(src, title) {
  if (!lightbox || !lightboxVideo) return;
  lightboxTitle.textContent = title;
  
  if (videoErrorMsg) videoErrorMsg.style.display = 'none';
  if (videoLoadingTimeout) clearTimeout(videoLoadingTimeout);
  videoIsReady = false;
  
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  
  lightboxVideo.src = src;
  lightboxVideo.load();
  
  // Start our timeout exactly when we command the video to open
  videoLoadingTimeout = setTimeout(() => {
    if (!videoIsReady && videoErrorMsg) videoErrorMsg.style.display = 'flex';
  }, 5000);
  
  // Try playing immediately (required by some browsers to start buffer)
  const playPromise = lightboxVideo.play();
  if (playPromise !== undefined) {
    playPromise.catch(e => {
      // Autoplay might be blocked, but the loading continues
      console.warn('Autoplay prevented:', e);
    });
  }
}

lightboxVideo?.addEventListener('playing', () => {
  videoIsReady = true;
  if (videoLoadingTimeout) { clearTimeout(videoLoadingTimeout); videoLoadingTimeout = null; }
  if (videoErrorMsg) videoErrorMsg.style.display = 'none';
});

lightboxVideo?.addEventListener('canplay', () => {
  videoIsReady = true;
  if (videoLoadingTimeout) { clearTimeout(videoLoadingTimeout); videoLoadingTimeout = null; }
  if (videoErrorMsg) videoErrorMsg.style.display = 'none';
});

lightboxVideo?.addEventListener('error', () => {
  if (lightbox?.classList.contains('open')) {
    if (videoLoadingTimeout) { clearTimeout(videoLoadingTimeout); videoLoadingTimeout = null; }
    if (videoErrorMsg) videoErrorMsg.style.display = 'flex';
  }
});

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  if (videoLoadingTimeout) { clearTimeout(videoLoadingTimeout); videoLoadingTimeout = null; }
  videoIsReady = false;
  lightboxVideo.pause();
  lightboxVideo.removeAttribute('src');
  lightboxVideo.load();
  if (videoErrorMsg) videoErrorMsg.style.display = 'none';
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

const WHISPER_TEXTS = [
  "Au milieu des ténèbres, une lumière naît…",
  "Les ombres murmurent ton nom ce soir",
  "Tu es la rose qui fleurit dans l'abîme",
  "Que la nuit soit douce sur ta peau",
  "Les étoiles dansent pour ton arrivée",
  "Chaque instant est une offrande d'amour",
  "Les cierges brûlent en ton nom",
  "Tu illumines les ténèbres de ta présence",
  "Que ce jour soit béni par les anciennes lumières"
];

let whisperIndex = 0;
const whisperEl = document.getElementById('whisperText');

function updateWhisper() {
  if (whisperEl) {
    whisperEl.textContent = WHISPER_TEXTS[whisperIndex];
    whisperEl.style.top = `calc(50% + ${Math.sin(Date.now() * 0.0005) * 10}px)`;
    whisperIndex = (whisperIndex + 1) % WHISPER_TEXTS.length;
  }
}

setInterval(updateWhisper, 10000);
updateWhisper();

// Floating orbs
function createOrb() {
  const orb = document.createElement('div');
  orb.className = 'orb';
  const size = Math.random() * 60 + 20;
  orb.style.width = size + 'px';
  orb.style.height = size + 'px';
  orb.style.left = Math.random() * 100 + '%';
  orb.style.animationDuration = (Math.random() * 15 + 20) + 's';
  orb.style.animationDelay = (Math.random() * 5) + 's';
  return orb;
}

const orbsContainer = document.getElementById('floatingOrbs');
if (orbsContainer) {
  for (let i = 0; i < 8; i++) {
    orbsContainer.appendChild(createOrb());
  }
}

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
