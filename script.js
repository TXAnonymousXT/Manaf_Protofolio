/**
 * MYCELIAL NETWORK — Portfolio Interactions
 * Loading, Cursor, Big Bang, Scroll Reveals,
 * Morphing Animations, Page Transitions, Hamburger Menu, Contact Form
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initCursor();
  initBigBang();
  initScrollReveal();
  initMorphAnimations();
  initPageTransitions();
  initSmoothScroll();
  initHamburgerMenu();
  initContactForm();
});

/* ══════════════════════════════════════════════════════════════
   CURSOR — Trailing glow dot
══════════════════════════════════════════════════════════════ */
function initCursor() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  let mx = 0, my = 0, gx = 0, gy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
  });

  // Smooth trailing glow follows with easing
  (function animGlow() {
    gx += (mx - gx) * 0.15;
    gy += (my - gy) * 0.15;
    glow.style.left = gx + 'px';
    glow.style.top = gy + 'px';
    requestAnimationFrame(animGlow);
  })();

  // Expand glow on interactive elements
  document.querySelectorAll('a, button, .skill-row, .stat-box, .contact-card, .service-card, .sec-panel, .hamburger-menu').forEach(el => {
    el.addEventListener('mouseenter', () => glow.classList.add('hover'));
    el.addEventListener('mouseleave', () => glow.classList.remove('hover'));
  });
}

/* Void canvas removed — plain background from CSS only */

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

/* Hero canvases removed — plain background */

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
