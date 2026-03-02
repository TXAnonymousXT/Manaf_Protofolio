/**
 * NEURAL VOID — Portfolio Interactions
 * Cursor, Void Canvas, Big Bang, Hero Canvases, Scroll Reveals, Hamburger Menu, Contact Form
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initCursor();
  initVoidCanvas();
  initBigBang();
  initHeroCanvases();
  initScrollReveal();
  initMorphAnimations();
  initSmoothScroll();
  initHamburgerMenu();
  initContactForm();
  initPageTransitions();
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
   VOID CANVAS — Stars + Cartographic Grid + Mycelial Network
══════════════════════════════════════════════════════════════ */
function initVoidCanvas() {
  const vc = document.getElementById('void-canvas');
  if (!vc) return;
  const vctx = vc.getContext('2d');
  let stars = [], mycelNodes = [], mycelTime = 0;

  function resizeVC() {
    vc.width = window.innerWidth;
    vc.height = window.innerHeight;
    buildStars();
    buildMycelium();
  }

  function buildStars() {
    const n = Math.floor(vc.width * vc.height / 1600);
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * vc.width, y: Math.random() * vc.height,
      r: Math.random() * 1.3, a: Math.random(),
      flicker: Math.random() * Math.PI * 2,
      fs: 0.004 + Math.random() * 0.018,
      col: Math.random() < 0.1 ? '#e8a838' : Math.random() < 0.1 ? '#4da8da' : '#f0ece4'
    }));
  }

  function buildMycelium() {
    const n = Math.max(Math.floor(vc.width * vc.height / 22000), 14);
    mycelNodes = Array.from({ length: n }, () => ({
      x: Math.random() * vc.width, y: Math.random() * vc.height,
      vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
      r: 1.5 + Math.random() * 2, pulse: Math.random() * Math.PI * 2,
      type: Math.random() < 0.08 ? 'gold' : Math.random() < 0.06 ? 'crimson' : 'cyan'
    }));
  }

  function drawVoid() {
    vctx.clearRect(0, 0, vc.width, vc.height);
    mycelTime += 0.003;

    // Cartographic grid (breathing)
    const cols = 10, rows = 7;
    for (let i = 0; i <= cols; i++) {
      const x = (vc.width / cols) * i;
      vctx.beginPath();
      for (let y2 = 0; y2 <= vc.height; y2 += 3) {
        const wx = x + Math.sin(y2 * 0.006 + mycelTime * 0.4 + i * 0.5) * 1.5;
        y2 === 0 ? vctx.moveTo(wx, y2) : vctx.lineTo(wx, y2);
      }
      vctx.strokeStyle = 'rgba(200,185,154,0.035)'; vctx.lineWidth = 0.8; vctx.stroke();
    }
    for (let j = 0; j <= rows; j++) {
      const y = (vc.height / rows) * j;
      vctx.beginPath();
      for (let x2 = 0; x2 <= vc.width; x2 += 3) {
        const wy = y + Math.sin(x2 * 0.006 + mycelTime * 0.3 + j * 0.5) * 1.5;
        x2 === 0 ? vctx.moveTo(x2, wy) : vctx.lineTo(x2, wy);
      }
      vctx.strokeStyle = 'rgba(200,185,154,0.025)'; vctx.lineWidth = 0.8; vctx.stroke();
    }

    // Update mycelium nodes
    mycelNodes.forEach(n => {
      n.x += n.vx; n.y += n.vy; n.pulse += 0.018;
      if (n.x < 0 || n.x > vc.width) n.vx *= -1;
      if (n.y < 0 || n.y > vc.height) n.vy *= -1;
    });

    // Mycelium connections
    const cmap = { 'cyan': '#00ffd1', 'gold': '#e8a838', 'crimson': '#ff2a2a' };
    for (let i = 0; i < mycelNodes.length; i++) {
      for (let j = i + 1; j < mycelNodes.length; j++) {
        const a = mycelNodes[i], b = mycelNodes[j];
        const dx = b.x - a.x, dy = b.y - a.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 190) {
          const alpha = (1 - dist / 190) * 0.35;
          const col = a.type === 'cyan' && b.type === 'cyan' ? '#00ffd1' : '#c8b99a';
          vctx.beginPath();
          vctx.moveTo(a.x, a.y);
          const mx2 = (a.x + b.x) / 2 + Math.sin(mycelTime + i) * 12;
          const my2 = (a.y + b.y) / 2 + Math.cos(mycelTime + j) * 12;
          vctx.quadraticCurveTo(mx2, my2, b.x, b.y);
          vctx.strokeStyle = col; vctx.globalAlpha = alpha; vctx.lineWidth = 0.6; vctx.stroke();
        }
      }
    }
    vctx.globalAlpha = 1;

    // Mycelium nodes
    mycelNodes.forEach(n => {
      const col = cmap[n.type];
      const p = Math.sin(n.pulse) * 0.35 + 0.65;
      vctx.globalAlpha = p * 0.7;
      vctx.beginPath(); vctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      vctx.fillStyle = col; vctx.fill();
      vctx.globalAlpha = p * 0.12;
      vctx.beginPath(); vctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
      vctx.fillStyle = col; vctx.fill();
    });
    vctx.globalAlpha = 1;

    // Stars (on top)
    stars.forEach(s => {
      s.flicker += s.fs;
      const alpha = s.a * (0.55 + 0.45 * Math.sin(s.flicker));
      vctx.beginPath(); vctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      vctx.fillStyle = s.col; vctx.globalAlpha = alpha; vctx.fill();
      if (s.r > 0.85) {
        const hex = s.col.replace('#', '');
        const rr = parseInt(hex.substring(0, 2), 16);
        const gg = parseInt(hex.substring(2, 4), 16);
        const bb = parseInt(hex.substring(4, 6), 16);
        vctx.beginPath(); vctx.arc(s.x, s.y, s.r * 3.5, 0, Math.PI * 2);
        const grd = vctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3.5);
        grd.addColorStop(0, `rgba(${rr},${gg},${bb},${alpha * 0.25})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        vctx.fillStyle = grd; vctx.fill();
      }
    });
    vctx.globalAlpha = 1;

    // Compass rose (subtle, bottom-right)
    const cx = vc.width - 70, cy = vc.height - 70, cr = 35;
    vctx.globalAlpha = 0.07;
    for (let d = 0; d < 8; d++) {
      const ang = (d * Math.PI / 4) + mycelTime * 0.04;
      const len = d % 2 === 0 ? cr : cr * 0.55;
      vctx.beginPath(); vctx.moveTo(cx, cy); vctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
      vctx.strokeStyle = '#c8b99a'; vctx.lineWidth = d % 2 === 0 ? 1.2 : 0.7; vctx.stroke();
    }
    vctx.beginPath(); vctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    vctx.fillStyle = '#c8b99a'; vctx.fill();
    vctx.globalAlpha = 1;

    requestAnimationFrame(drawVoid);
  }

  window.addEventListener('resize', resizeVC);
  resizeVC();
  drawVoid();
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
    bbctx.fillStyle = '#04070f'; bbctx.fillRect(0, 0, bbc.width, bbc.height);

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

/* ══════════════════════════════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════════════════════════════ */
function initLoadingScreen() {
  const ls = document.getElementById('loading-screen');
  if (!ls) return;

  // Fade out after bar animation completes
  setTimeout(() => {
    ls.classList.add('fade-out');
    setTimeout(() => { ls.style.display = 'none'; }, 1000);
  }, 2400);
}

/* ══════════════════════════════════════════════════════════════
   MORPH ANIMATIONS — Clip-path reveals + Staggered entrances
══════════════════════════════════════════════════════════════ */
function initMorphAnimations() {
  // Morph reveal observer (clip-path morph on scroll)
  const morphIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        morphIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.morph-reveal').forEach(el => morphIO.observe(el));

  // Morph stagger observer
  const staggerIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        staggerIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.morph-stagger').forEach(el => staggerIO.observe(el));
}

/* ══════════════════════════════════════════════════════════════
   PAGE TRANSITIONS — Circle morph wipe between pages
══════════════════════════════════════════════════════════════ */
function initPageTransitions() {
  const transition = document.getElementById('page-transition');
  if (!transition) return;

  // Intercept internal nav links for morphing page transition
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    // Skip external links
    if (link.hostname && link.hostname !== window.location.hostname) return;

    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      // Don't transition to current page
      if (href === window.location.pathname.split('/').pop()) return;

      e.preventDefault();
      transition.classList.add('active');

      setTimeout(() => {
        window.location.href = href;
      }, 600);
    });
  });

  // Reverse transition on page load (shrink circle out)
  if (sessionStorage.getItem('pageTransition')) {
    transition.classList.add('active');
    transition.style.transition = 'none';
    requestAnimationFrame(() => {
      transition.style.transition = '';
      transition.classList.remove('active');
    });
    sessionStorage.removeItem('pageTransition');
  }

  // Mark that we're transitioning
  window.addEventListener('beforeunload', () => {
    if (transition.classList.contains('active')) {
      sessionStorage.setItem('pageTransition', '1');
    }
  });
}
