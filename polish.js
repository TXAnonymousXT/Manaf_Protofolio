// The small things that make a page feel made: a loader that counts, words that arrive, and a cursor that says what a click will do.
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the loader ---------- */
  const loader = document.getElementById('loader');
  const bar = loader && loader.querySelector('.ld-bar i'), pct = loader && loader.querySelector('.ld-pct');
  const t0 = performance.now();
  let shown = 0, done = false, fake = null;
  const paint = (p) => { shown = Math.max(shown, Math.min(p, 1)); if (bar) bar.style.transform = `scaleX(${shown.toFixed(3)})`; if (pct) pct.textContent = Math.round(shown * 100) + '%'; };
  window.__loaderProgress = (p) => { if (fake) { clearInterval(fake); fake = null; } paint(p * 0.92); };
  // from disk there is no count to read; the bar walks on its own until the page says it is ready
  fake = setInterval(() => { if (!done) paint(shown + (0.9 - shown) * 0.06); }, 120);
  window.__loaderDone = () => {
    if (done) return;
    done = true;
    if (fake) clearInterval(fake);
    paint(1);
    const wait = Math.max(0, 900 - (performance.now() - t0));
    setTimeout(() => { if (loader) loader.classList.add('gone'); root.classList.add('ready'); setTimeout(() => loader && loader.remove(), 900); }, wait);
  };
  setTimeout(window.__loaderDone, 14000);

  /* ---------- words that arrive one after another ---------- */
  if (!reduced) {
    document.querySelectorAll('.panel h2, .panel .thesis').forEach((el) => {
      if (el.querySelector('*')) return;      // leave anything with markup inside alone
      const words = el.textContent.trim().split(/\s+/);
      el.setAttribute('aria-label', el.textContent.trim());
      el.innerHTML = words.map((w, i) => `<span class="w" style="--i:${i}" aria-hidden="true">${w}</span>`).join(' ');
    });
    document.querySelectorAll('.panel .who, .panel .body, .panel .facts, .panel .acts, .panel .wall, .panel .kiln, .panel .reach, .panel .role, .panel .hint, .panel .levels').forEach((el, i) => { el.classList.add('late'); el.style.setProperty('--d', (i % 4) + ''); });
  }

  /* ---------- the cursor ---------- */
  if (!matchMedia('(pointer: fine)').matches || reduced) return;
  const cur = document.createElement('div');
  cur.id = 'cur'; cur.setAttribute('aria-hidden', 'true');
  cur.innerHTML = '<i></i><b>ping</b>';
  document.body.appendChild(cur);
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, seen = false;
  const what = (e) => {
    const t = e.target;
    if (!t || !t.closest) return '';
    if (t.closest('dialog')) return 'none';
    if (t.closest('a, button, [data-open], [data-inspect], [data-inspect-id], [data-hop], input, .hop')) return 'link';
    if (t.closest('.col, .intro, .wall-hero, .nav, .seek, .catalogue, .foot, .hint')) return 'text';
    if (root.classList.contains('live') && t.closest('.panel, #scene, .chapter, main') && !t.closest('.catalogue')) return 'ping';
    return '';
  };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX; ty = e.clientY;
    if (!seen) { x = tx; y = ty; seen = true; root.classList.add('cur-on'); }
    const w = what(e);
    cur.className = w ? 'is-' + w : '';
  }, { passive: true });
  addEventListener('pointerdown', () => cur.classList.add('down'));
  addEventListener('pointerup', () => cur.classList.remove('down'));
  document.addEventListener('mouseleave', () => cur.classList.add('out'));
  document.addEventListener('mouseenter', () => cur.classList.remove('out'));
  const tick = () => { x += (tx - x) * 0.22; y += (ty - y) * 0.22; cur.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
})();
