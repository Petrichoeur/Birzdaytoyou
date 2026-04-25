/* ============================================================
   GOTHIC BIRTHDAY — ANGÉLIQUE
   script.js
   ============================================================ */

'use strict';

// ============================================================
// 1. VIDEO DATA — Ajoute autant d'entrées que tu veux
//    src: chemin relatif vers le fichier vidéo
//    label: nom affiché en badge (ex: "Vidéo 01")
//    title: titre de la carte
//    desc: courte description sous le titre
// ============================================================
const VIDEOS = [
  {
    src:   'video/video1.mp4',
    label: 'Vidéo 01',
    title: 'Un message du fond du cœur',
    desc:  'Un être cher traverse les ténèbres pour toi…',
  },
  {
    src:   'video/video2.mp4',
    label: 'Vidéo 02',
    title: 'Mots gravés dans l\'ombre',
    desc:  'Des souvenirs que le temps n\'efface pas.',
  },
  {
    src:   'video/video3.mp4',
    label: 'Vidéo 03',
    title: 'Voix venue de loin',
    desc:  'La distance n\'arrête pas l\'amour.',
  },
  {
    src:   'video/video4.mp4',
    label: 'Vidéo 04',
    title: 'Un secret murmuré',
    desc:  'Rien que pour tes oreilles…',
  },
  {
    src:   'video/video5.mp4',
    label: 'Vidéo 05',
    title: 'Lumière dans les ténèbres',
    desc:  'Tu illumines tout ce que tu touches.',
  },
  {
    src:   'video/video6.mp4',
    label: 'Vidéo 06',
    title: 'L\'hommage final',
    desc:  'Parce que tu mérites tout l\'amour du monde.',
  },
];

// ============================================================
// 2. PARTICLE SYSTEM — Cendres / pétales tombants
// ============================================================
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  let animFrame;

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const PARTICLE_COUNT = 55;
  const particles = [];

  const SHAPES = ['ash', 'petal', 'spark'];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createParticle() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
      x:     rand(0, W),
      y:     rand(-20, -100),
      vx:    rand(-0.5, 0.5),
      vy:    rand(0.3, 1.1),
      alpha: rand(0.1, 0.55),
      size:  rand(1.5, 4.5),
      angle: rand(0, Math.PI * 2),
      spin:  rand(-0.02, 0.02),
      shape,
      hue:   shape === 'spark' ? '#c9a84c' : shape === 'petal' ? '#5a0020' : '#666',
    };
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = createParticle();
    p.y = rand(0, H); // start spread across screen
    particles.push(p);
  }

  function drawParticle(p) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    if (p.shape === 'ash') {
      ctx.fillStyle = p.hue;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'petal') {
      ctx.fillStyle = p.hue;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo( p.size, -p.size * 0.5,  p.size * 0.8, p.size * 0.5, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.5, -p.size, -p.size * 0.5, 0, -p.size);
      ctx.fill();
    } else {
      // spark — tiny glowing dot
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
    for (const p of particles) {
      p.x     += p.vx + Math.sin(Date.now() * 0.001 + p.y * 0.01) * 0.3;
      p.y     += p.vy;
      p.angle += p.spin;

      if (p.y > H + 20) {
        Object.assign(p, createParticle());
      }
      drawParticle(p);
    }
    animFrame = requestAnimationFrame(tick);
  }

  tick();
})();

// ============================================================
// 3. CUSTOM CURSOR
// ============================================================
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursorTrail');
  if (!cursor || !trail) return;

  let mx = 0, my = 0;
  let tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animTrail() {
    tx += (mx - tx) * 0.14;
    ty += (my - ty) * 0.14;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animTrail);
  }
  animTrail();

  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1.8)';
  });
  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
  });

  // Scale trail on hoverable elements
  const hoverables = 'a, button, .video-card';
  document.body.addEventListener('mouseover', e => {
    if (e.target.closest(hoverables)) {
      trail.style.width  = '46px';
      trail.style.height = '46px';
      trail.style.borderColor = 'rgba(139,0,0,0.7)';
    }
  });
  document.body.addEventListener('mouseout', e => {
    if (e.target.closest(hoverables)) {
      trail.style.width  = '28px';
      trail.style.height = '28px';
      trail.style.borderColor = 'rgba(139,0,0,0.4)';
    }
  });
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
        }, i * 120);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => obs.observe(el));
})();

// ============================================================
// 5. BUILD VIDEO CARDS
// ============================================================
(function buildVideoCards() {
  const grid = document.getElementById('videosGrid');
  if (!grid) return;

  VIDEOS.forEach((v, i) => {
    const delay = i * 0.08;

    const card = document.createElement('article');
    card.className = 'video-card';
    card.style.animationDelay = `${delay}s`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Regarder ${v.title}`);

    card.innerHTML = `
      <div class="shimmer"></div>
      <div class="video-thumb">
        <div class="thumb-deco"></div>
        <div class="video-thumb-overlay"></div>
        <span class="video-number">${v.label}</span>
        <div class="play-btn" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <polygon points="5,3 19,12 5,21"/>
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
  lightboxTitle.textContent = title;
  lightboxVideo.src = src;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxVideo.play().catch(() => {/* autoplay blocked — user will press play */});
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxVideo.pause();
  lightboxVideo.src = '';
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
    setTimeout(() => el.classList.add('visible'), 400 + i * 200);
  });
});
