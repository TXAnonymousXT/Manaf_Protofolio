/**
 * MYCELIAL NETWORK — Portfolio Interactions
 * Loading, Cursor, Void Canvas, Big Bang, Hero Canvases, Scroll Reveals,
 * Morphing Animations, Page Transitions, Hamburger Menu, Contact Form
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initCursor();
  initVoidCanvas();
  initBigBang();
  initHeroCanvases();
  initScrollReveal();
  initMorphAnimations();
  initPageTransitions();
  initSmoothScroll();
  initHamburgerMenu();
  initContactForm();
});

/* ══════════════════════════════════════════════════════════════
   CURSOR
══════════════════════════════════════════════════════════════ */
function initCursor() {
  const cur = document.getElementById('cursor');
  const curRing = document.getElementById('cursor-ring');
  if (!cur || !curRing) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    curRing.style.left = rx + 'px';
    curRing.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  // Scale cursor on interactive elements
  document.querySelectorAll('a, button, .project-card, .skill-row, .stat-box, .contact-card, .service-card, .sec-panel').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cur.style.transform = 'translate(-14px,-14px) scale(1.6)';
      curRing.style.opacity = '0.4';
    });
    el.addEventListener('mouseleave', () => {
      cur.style.transform = 'translate(-14px,-14px) scale(1)';
      curRing.style.opacity = '1';
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   VOID CANVAS — Kimi-style Tiny Floating Dots + Connection Lines
   Clean, subtle particles — NO blobs, NO smearing
══════════════════════════════════════════════════════════════ */
function initVoidCanvas() {
  const vc = document.getElementById('void-canvas');
  if (!vc) return;
  const ctx = vc.getContext('2d');

  // Mouse tracking for particle interaction
  let mouseX = -999, mouseY = -999;
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  // Particle pool
  const MAX_PARTICLES = 120;
  let particles = [];

  // Color palette matching Kimi design
  const COLORS = [
    { color: '#00ffd1', weight: 0.45 },  // biolum-cyan (dominant)
    { color: '#00b8a9', weight: 0.20 },  // biolum-teal
    { color: '#ffb700', weight: 0.15 },  // nutrient-gold
    { color: '#ff2a2a', weight: 0.08 },  // parasite-crimson
    { color: '#d4c5b0', weight: 0.12 },  // hyphae
  ];

  function pickColor() {
    let r = Math.random(), cumulative = 0;
    for (const c of COLORS) {
      cumulative += c.weight;
      if (r <= cumulative) return c.color;
    }
    return '#00ffd1';
  }

  function createParticle(x, y) {
    return {
      x: x !== undefined ? x : Math.random() * vc.width,
      y: y !== undefined ? y : Math.random() * vc.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.2 + 0.4,   // tiny: 0.4 – 1.6 px
      color: pickColor(),
      alpha: Math.random() * 0.5 + 0.3,  // 0.3 – 0.8
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02
    };
  }

  function resizeVC() {
    vc.width = window.innerWidth;
    vc.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < MAX_PARTICLES; i++) particles.push(createParticle());
  }

  function draw() {
    // Full clear every frame — no trail, no smearing, no blobs
    ctx.clearRect(0, 0, vc.width, vc.height);

    // Update + draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Mouse interaction: gentle repulsion
      const dmx = p.x - mouseX, dmy = p.y - mouseY;
      const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);
      if (mouseDist < 100 && mouseDist > 0) {
        const force = (100 - mouseDist) / 100 * 0.15;
        p.vx += (dmx / mouseDist) * force;
        p.vy += (dmy / mouseDist) * force;
      }

      // Gentle drift with slight organic wobble
      p.pulse += p.pulseSpeed;
      p.x += p.vx + Math.sin(p.pulse) * 0.1;
      p.y += p.vy + Math.cos(p.pulse * 0.7) * 0.1;

      // Friction
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Wrap around at edges
      if (p.x < -5) p.x = vc.width + 5;
      if (p.x > vc.width + 5) p.x = -5;
      if (p.y < -5) p.y = vc.height + 5;
      if (p.y > vc.height + 5) p.y = -5;

      // Draw tiny dot with small soft glow
      const a = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.shadowBlur = 4;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Connection lines between nearby particles (hyphae threads)
    ctx.save();
    ctx.lineWidth = 0.4;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const lineAlpha = (1 - dist / 80) * 0.12;
          ctx.globalAlpha = lineAlpha;
          ctx.strokeStyle = 'rgba(212, 197, 176, 0.5)';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resizeVC);
  resizeVC();
  draw();
}

/* ══════════════════════════════════════════════════════════════
   BIG BANG + BOOT SEQUENCE (index.html only)
══════════════════════════════════════════════════════════════ */
function initBigBang() {
  const bb = document.getElementById('bigbang');
  const bbc = document.getElementById('bigbang-canvas');
  if (!bb || !bbc) return;

  const bbctx = bbc.getContext('2d');
  bbc.width = window.innerWidth; bbc.height = window.innerHeight;
  const BCX = bbc.width / 2, BCY = bbc.height / 2;
  let bbP = [], bbStart = null;

  for (let i = 0; i < 700; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 1.5 + Math.random() * 20;
    const col = Math.random() < 0.2 ? '#00ffd1' : Math.random() < 0.15 ? '#e8a838' : Math.random() < 0.1 ? '#4da8da' : '#f0ece4';
    bbP.push({
      x: BCX, y: BCY,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      r: 0.4 + Math.random() * 2.2, a: 1,
      col, decay: 0.006 + Math.random() * 0.014
    });
  }

  function animBB(ts) {
    if (!bbStart) bbStart = ts;
    const el = (ts - bbStart) / 1000;
    bbctx.clearRect(0, 0, bbc.width, bbc.height);
    bbctx.fillStyle = '#0d0a08'; bbctx.fillRect(0, 0, bbc.width, bbc.height);

    // Flash
    if (el < 0.35) {
      const int = el < 0.17 ? el / 0.17 : 1 - (el - 0.17) / 0.18;
      const g = bbctx.createRadialGradient(BCX, BCY, 0, BCX, BCY, bbc.width * 0.5);
      g.addColorStop(0, `rgba(0,255,209,${int * 0.6})`);
      g.addColorStop(0.2, `rgba(232,168,56,${int * 0.25})`);
      g.addColorStop(1, 'rgba(4,7,15,0)');
      bbctx.fillStyle = g; bbctx.fillRect(0, 0, bbc.width, bbc.height);
    }

    let alive = 0;
    bbP.forEach(p => {
      if (p.a <= 0) return;
      const slow = 1 - Math.min(el, 1) * 0.85;
      p.x += p.vx * slow; p.y += p.vy * slow;
      p.a -= p.decay; if (p.a < 0) p.a = 0; else alive++;
      bbctx.beginPath(); bbctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      bbctx.fillStyle = p.col; bbctx.globalAlpha = p.a; bbctx.fill();
    });
    bbctx.globalAlpha = 1;

    if (el < 3 && alive > 0) { requestAnimationFrame(animBB); }
    else {
      bb.classList.add('fade-out');
      setTimeout(() => { bb.style.display = 'none'; }, 1800);
    }
  }
  requestAnimationFrame(animBB);
}

/* ══════════════════════════════════════════════════════════════
   HERO CANVASES — Mycelium + Particles (index.html only)
══════════════════════════════════════════════════════════════ */
function initHeroCanvases() {
  const hm = document.getElementById('hero-mycelial');
  const hp = document.getElementById('hero-particles');
  if (!hm || !hp) return;

  const hmctx = hm.getContext('2d');
  const hpctx = hp.getContext('2d');

  function resizeHero() {
    hm.width = hp.width = window.innerWidth;
    hm.height = hp.height = window.innerHeight;
  }
  resizeHero();
  window.addEventListener('resize', resizeHero);

  // Hero mycelium nodes
  let heroNodes = Array.from({ length: 25 }, () => ({
    x: Math.random() * hm.width, y: Math.random() * hm.height,
    vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
    r: 2 + Math.random() * 3, pulse: Math.random() * Math.PI * 2,
    type: Math.random() < 0.7 ? 'cyan' : Math.random() < 0.5 ? 'gold' : 'aurora'
  }));

  let hTime = 0, hmx = window.innerWidth / 2, hmy = window.innerHeight / 2;
  const heroEl = document.getElementById('hero');
  if (heroEl) heroEl.addEventListener('mousemove', e => { hmx = e.clientX; hmy = e.clientY; });

  const hcols = { 'cyan': '#00ffd1', 'gold': '#e8a838', 'aurora': '#38e8a8' };

  // Floating particles
  let heroPars = Array.from({ length: 70 }, () => ({
    x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.25, vy: -0.15 - Math.random() * 0.35,
    r: Math.random() * 1.4, a: Math.random() * 0.5 + 0.1,
    col: Math.random() < 0.4 ? '#00ffd1' : Math.random() < 0.25 ? '#e8a838' : '#f0ece4'
  }));

  function drawHero() {
    hmctx.clearRect(0, 0, hm.width, hm.height);
    hpctx.clearRect(0, 0, hp.width, hp.height);
    hTime += 0.005;

    heroNodes.forEach(n => {
      n.x += n.vx; n.y += n.vy; n.pulse += 0.022;
      if (n.x < 0 || n.x > hm.width) n.vx *= -1;
      if (n.y < 0 || n.y > hm.height) n.vy *= -1;
      const dx = hmx - n.x, dy = hmy - n.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 200) { n.x += dx / d * 0.3; n.y += dy / d * 0.3; }
    });

    // Connections
    for (let i = 0; i < heroNodes.length; i++) {
      for (let j = i + 1; j < heroNodes.length; j++) {
        const a = heroNodes[i], b = heroNodes[j];
        const dx = b.x - a.x, dy = b.y - a.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const alpha = (1 - dist / 160) * 0.5;
          hmctx.beginPath(); hmctx.moveTo(a.x, a.y);
          const mx2 = (a.x + b.x) / 2 + Math.sin(hTime + i) * 18;
          const my2 = (a.y + b.y) / 2 + Math.cos(hTime + j) * 18;
          hmctx.quadraticCurveTo(mx2, my2, b.x, b.y);
          hmctx.strokeStyle = '#00ffd1'; hmctx.globalAlpha = alpha; hmctx.lineWidth = 0.8; hmctx.stroke();
        }
      }
    }
    hmctx.globalAlpha = 1;

    // Draw nodes
    heroNodes.forEach(n => {
      const col = hcols[n.type];
      const p = Math.sin(n.pulse) * 0.4 + 0.6;
      hmctx.globalAlpha = p * 0.85;
      hmctx.beginPath(); hmctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); hmctx.fillStyle = col; hmctx.fill();
      hmctx.globalAlpha = p * 0.15;
      hmctx.beginPath(); hmctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2); hmctx.fillStyle = col; hmctx.fill();
    });
    hmctx.globalAlpha = 1;

    // Floating particles
    heroPars.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -5) { p.y = hp.height + 5; p.x = Math.random() * hp.width; }
      if (p.x < -5) p.x = hp.width + 5; if (p.x > hp.width + 5) p.x = -5;
      const ddx = p.x - hmx, ddy = p.y - hmy, dd = Math.sqrt(ddx * ddx + ddy * ddy);
      if (dd < 80) { p.x += ddx / dd * 0.6; p.y += ddy / dd * 0.6; }
      hpctx.beginPath(); hpctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      hpctx.fillStyle = p.col; hpctx.globalAlpha = p.a * 0.45; hpctx.fill();
    });
    hpctx.globalAlpha = 1;

    requestAnimationFrame(drawHero);
  }
  drawHero();
}

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL + SKILL BAR ANIMATION
══════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // Animate skill bars inside
        e.target.querySelectorAll('.sk-bar-fill').forEach((bar, i) => {
          const w = bar.dataset.w || '70';
          setTimeout(() => { bar.style.width = w + '%'; }, i * 130 + 200);
        });
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => io.observe(el));

  // Stat-boxes individually staggered
  document.querySelectorAll('.stat-box').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
    el.classList.add('reveal');
    io.observe(el);
  });
}

/* ══════════════════════════════════════════════════════════════
   SMOOTH SCROLL (hash links)
══════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   HAMBURGER MENU
══════════════════════════════════════════════════════════════ */
function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburger-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  // Create overlay
  let overlay = document.querySelector('.mobile-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);
  }

  function toggleMenu() {
    const isOpen = mobileMenu.classList.contains('active');
    mobileMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      toggleMenu();
    }
  });

  // Close after clicking a link
  mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu.classList.contains('active')) {
        toggleMenu();
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════════════════════════════ */
function initLoadingScreen() {
  const loader = document.querySelector('.loading-screen');
  if (!loader) return;

  const barFill = loader.querySelector('.loading-bar-fill');
  const loadText = loader.querySelector('.loading-text');

  // Check if this is the index page (has Big Bang = slow intro)
  const isIndex = !!document.getElementById('bigbang');

  const messages = [
    'Initializing substrate...',
    'Mapping mycelial network...',
    'Calibrating bioluminescence...',
    'Establishing neural links...',
    'System online_'
  ];

  let progress = 0;
  let msgIdx = 0;

  if (isIndex) {
    // SLOW loading for index — full cinematic intro
    function tick() {
      progress += Math.random() * 18 + 5;
      if (progress > 100) progress = 100;

      if (barFill) barFill.style.width = progress + '%';

      if (progress > (msgIdx + 1) * 20 && msgIdx < messages.length - 1) {
        msgIdx++;
        if (loadText) loadText.textContent = messages[msgIdx];
      }

      if (progress < 100) {
        setTimeout(tick, 120 + Math.random() * 180);
      } else {
        setTimeout(() => {
          loader.classList.add('hidden');
          setTimeout(() => { loader.remove(); }, 800);
        }, 400);
      }
    }
    if (loadText) loadText.textContent = messages[0];
    setTimeout(tick, 200);
  } else {
    // FAST loading for subpages — quick flash then go
    if (loadText) loadText.textContent = 'Loading...';
    if (barFill) barFill.style.transition = 'width 0.3s ease';

    setTimeout(() => {
      if (barFill) barFill.style.width = '100%';
    }, 50);

    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => { loader.remove(); }, 800);
    }, 400);
  }
}

/* ══════════════════════════════════════════════════════════════
   MORPHING ANIMATIONS — IntersectionObserver for morph classes
══════════════════════════════════════════════════════════════ */
function initMorphAnimations() {
  // morph-reveal + morph-stagger use 'visible' class on intersection
  const morphIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.morph-reveal, .morph-stagger').forEach(el => morphIO.observe(el));
}

/* ══════════════════════════════════════════════════════════════
   PAGE TRANSITIONS — Circle-wipe between pages
══════════════════════════════════════════════════════════════ */
function initPageTransitions() {
  const transition = document.querySelector('.page-transition');
  if (!transition) return;

  // Intercept nav links for smooth page transitions
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      // Skip if same page or external
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;

      e.preventDefault();
      transition.classList.add('active');

      setTimeout(() => {
        window.location.href = href;
      }, 500);
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   CONTACT FORM (Web3Forms)
══════════════════════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const successEl = document.getElementById('form-success');
  if (!form || !successEl) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        form.style.display = 'none';
        successEl.classList.remove('hidden');
        setTimeout(() => {
          form.style.display = '';
          successEl.classList.add('hidden');
          form.reset();
        }, 4000);
      }
    } catch (err) {
      // Silent fail — form falls back to default action
    }
  });
}
