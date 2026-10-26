// ================ FX — boot handshake, packet reassembly, ambient motion ================
const FX = (() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  const fine = matchMedia('(pointer: fine)').matches;
  const hex4 = () => (Math.random() * 0xffff | 0).toString(16).padStart(4, '0');
  const isDark = () => document.documentElement.dataset.theme === 'dark';

  // design tokens for canvas drawing, re-read whenever the theme changes
  let tokCache = {};
  function tok(name) {
    if (!(name in tokCache)) tokCache[name] = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return tokCache[name];
  }
  document.addEventListener('themechange', () => { tokCache = {}; });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------- real timings from the visitor's own browser ----------
  function navTimings() {
    const n = performance.getEntriesByType('navigation')[0] || {};
    const d = (a, b) => (a > 0 && b > 0 && b >= a ? b - a : 0);
    const tlsStart = n.secureConnectionStart || 0;
    const conn = navigator.connection || null;
    return {
      host: location.hostname || 'localhost',
      https: location.protocol === 'https:',
      dns: d(n.domainLookupStart, n.domainLookupEnd),
      tcp: tlsStart > 0 ? d(n.connectStart, tlsStart) : d(n.connectStart, n.connectEnd),
      tls: tlsStart > 0 ? d(tlsStart, n.connectEnd) : 0,
      ttfb: d(n.requestStart, n.responseStart),
      proto: n.nextHopProtocol || 'http/1.1',
      bytes: n.transferSize || n.encodedBodySize || 0,
      status: n.responseStatus || 200,
      rtt: conn && conn.rtt ? conn.rtt : 0,
      link: conn ? conn.effectiveType : '',
      downlink: conn ? conn.downlink : 0,
      tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || 'Earth').split('/').pop().replace(/_/g, ' '),
    };
  }
  const ms = (v) => v.toFixed(1) + ' ms';

  // ---------- BOOT ----------
  function boot(done) {
    const T = navTimings();
    const box = document.getElementById('boot-lines');
    const fill = document.getElementById('boot-fill');
    const hs = document.getElementById('hs');
    let finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      removeEventListener('keydown', finish); document.getElementById('boot').removeEventListener('click', finish);
      done(T);
    };
    addEventListener('keydown', finish);
    document.getElementById('boot').addEventListener('click', finish);

    hs.innerHTML = `
      <div class="hs-end hs-you"><div class="hs-dot"></div><b>YOU</b><span>${esc(T.tz)}</span></div>
      <div class="hs-track"><div class="hs-wire"></div><div class="hs-rtt" id="hs-rtt"></div></div>
      <div class="hs-end hs-me"><div class="hs-dot"></div><b>MANAF</b><span>Doha, QA</span></div>`;
    const track = hs.querySelector('.hs-track');

    const ok = '<b class="ok">[  OK  ]</b>';
    const info = '<b class="inf">[ INFO ]</b>';
    const lines = [
      `${ok} DNS   ${esc(T.host)} ${T.dns > 0.05 ? `resolved in <em>${ms(T.dns)}</em>` : '<i>answered from cache</i>'}`,
      `${ok} TCP   SYN → SYN/ACK → ACK ${T.tcp > 0.05 ? `in <em>${ms(T.tcp)}</em>` : '<i>connection reused (keep-alive)</i>'}`,
      T.https ? `${ok} TLS   handshake ${T.tls > 0.05 ? `<em>${ms(T.tls)}</em>` : '<i>resumed session</i>'} · ALPN <em>${esc(T.proto)}</em>`
              : `${info} TLS   skipped: plain HTTP on ${esc(T.host)} · ALPN <em>${esc(T.proto)}</em>`,
      `${ok} HTTP  GET ${esc(location.pathname)} → <em>${T.status}</em> · TTFB <em>${ms(T.ttfb)}</em>${T.bytes ? ` · ${(T.bytes / 1024).toFixed(1)} kB` : ''}`,
      T.link ? `${ok} LINK  ${esc(T.link)} · rtt≈<em>${T.rtt} ms</em> · ${T.downlink} Mb/s` : `${info} LINK  ${navigator.hardwareConcurrency || '?'} cores · ${screen.width}×${screen.height} display`,
      `${ok} MOUNT /apps (7) · live capture armed`,
      `${ok} Session established. Every click from here on is a packet.`,
    ];
    const addLine = (i) => {
      if (finished || !lines[i]) return;
      const div = document.createElement('div'); div.innerHTML = lines[i]; box.appendChild(div);
      requestAnimationFrame(() => div.classList.add('show'));
      fill.style.width = ((i + 1) / lines.length * 100) + '%';
    };

    if (reduced) { lines.forEach((_, i) => addLine(i)); setTimeout(finish, 1400); return; }

    // packets cross the wire at a speed scaled from the visitor's real RTT
    const real = T.rtt || (T.tcp + T.tls) || 40;
    const hop = Math.max(170, Math.min(420, 150 + real * 2.2));
    document.getElementById('hs-rtt').textContent = `${real.toFixed(0)} ms rtt`;
    const seq = [
      ['SYN', 1, -1], ['SYN/ACK', -1, -1], ['ACK', 1, 1],
      ['ClientHello', 1, -1], ['ServerHello', -1, 2],
      ['GET /', 1, -1], ['200 OK', -1, 3],
    ];
    addLine(0);
    let t = 120;
    seq.forEach(([label, dir, line]) => {
      setTimeout(() => {
        if (finished) return;
        const p = document.createElement('div');
        p.className = 'hs-pkt' + (dir < 0 ? ' back' : '');
        p.textContent = label;
        track.appendChild(p);
        p.animate([{ left: dir > 0 ? '0%' : '100%', opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.85 }, { left: dir > 0 ? '100%' : '0%', opacity: 0 }],
          { duration: hop, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'forwards' });
        // timers, not animation promises: a backgrounded tab throttles animations
        setTimeout(() => {
          p.remove();
          hs.querySelector(dir > 0 ? '.hs-me' : '.hs-you').classList.add('blink');
          setTimeout(() => hs.querySelectorAll('.blink').forEach((e) => e.classList.remove('blink')), 160);
          if (line >= 0) addLine(line);
        }, hop);
      }, t);
      t += hop + 40;
    });
    setTimeout(() => addLine(4), t + 60);
    setTimeout(() => addLine(5), t + 260);
    setTimeout(() => addLine(6), t + 480);
    setTimeout(finish, t + 1150);
  }

  // ---------- CRT power-on for the desktop ----------
  // Driven from JS with a safety cancel: the desktop must end up visible even if animations never run.
  function powerOn(el) {
    if (reduced || !el.animate) return;
    const frames = mobile
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [{ clipPath: 'inset(50% 0 50% 0)', filter: 'brightness(3)' }, { clipPath: 'inset(49.6% 0 49.6% 0)', filter: 'brightness(2.2)', offset: 0.35 }, { clipPath: 'inset(0 0 0 0)', filter: 'brightness(1.4)', offset: 0.7 }, { clipPath: 'inset(0 0 0 0)', filter: 'none' }];
    const a = el.animate(frames, { duration: mobile ? 500 : 900, easing: 'cubic-bezier(.2,.8,.2,1)' });
    setTimeout(() => a.cancel(), 1400);
  }

  // ---------- TCP REASSEMBLY window transitions ----------
  const layer = () => document.getElementById('fx-layer');
  function centerOf(r) { return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: innerWidth / 2, y: innerHeight - 30 }; }

  function makeTiles(el, flag) {
    const r = el.getBoundingClientRect();
    const cols = mobile ? 3 : 4, rows = mobile ? 2 : 3;
    const base = el.cloneNode(true);
    base.removeAttribute('id');
    base.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    base.classList.add('fx-clone');
    base.classList.remove('minimized');
    base.setAttribute('inert', '');
    const tiles = [];
    let seq = (Math.random() * 0xffff) | 0;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x0 = Math.round(r.width * i / cols), x1 = Math.round(r.width * (i + 1) / cols);
        const y0 = Math.round(r.height * j / rows), y1 = Math.round(r.height * (j + 1) / rows);
        const t = base.cloneNode(true);
        Object.assign(t.style, {
          position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px',
          margin: '0', zIndex: '1', clipPath: `inset(${y0}px ${r.width - x1}px ${r.height - y1}px ${x0}px)`,
          transformOrigin: `${(x0 + x1) / 2}px ${(y0 + y1) / 2}px`, visibility: 'visible',
        });
        const tag = document.createElement('div');
        tag.className = 'fx-seq';
        seq = (seq + 1448) & 0xffff;
        tag.textContent = `${flag} 0x${seq.toString(16).padStart(4, '0')}`;
        tag.style.left = x0 + 8 + 'px'; tag.style.top = y0 + 8 + 'px';
        const tint = document.createElement('div');
        tint.className = 'fx-tint';
        tint.style.cssText = `left:${x0}px;top:${y0}px;width:${x1 - x0}px;height:${y1 - y0}px`;
        t.append(tint, tag);
        layer().appendChild(t);
        tiles.push({ t, tag, tint, cx: r.left + (x0 + x1) / 2, cy: r.top + (y0 + y1) / 2, k: tiles.length });
      }
    }
    return tiles;
  }

  function assemble(el, fromRect) {
    if (!el || !el.animate || el.dataset.fx) return Promise.resolve();
    if (reduced) return el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 }).finished.catch(() => {});
    el.dataset.fx = 'in';
    const src = centerOf(fromRect);
    el.style.visibility = 'hidden';
    const tiles = makeTiles(el, 'SEQ');
    const anims = tiles.map(({ t, tag, tint, cx, cy, k }) => {
      const dx = src.x - cx, dy = src.y - cy, len = Math.hypot(dx, dy) || 1;
      const bend = (Math.random() - 0.5) * Math.min(220, len * 0.5);
      const px = -dy / len * bend, py = dx / len * bend;
      const rot = (Math.random() - 0.5) * 50;
      const delay = k * 22 + Math.random() * 60;
      const opts = { duration: 560, delay, easing: 'cubic-bezier(.22,.75,.2,1)', fill: 'both' };
      tag.animate([{ opacity: 1 }, { opacity: 1, offset: 0.72 }, { opacity: 0 }], opts);
      tint.animate([{ opacity: 0.9 }, { opacity: 0.6, offset: 0.6 }, { opacity: 0 }], opts);
      return t.animate([
        { transform: `translate(${dx}px,${dy}px) scale(.06) rotate(${rot}deg)`, opacity: 0 },
        { transform: `translate(${dx * 0.42 + px}px,${dy * 0.42 + py}px) scale(.5) rotate(${rot * 0.35}deg)`, opacity: 1, offset: 0.42 },
        { transform: 'translate(0,0) scale(1.025)', opacity: 1, offset: 0.86 },
        { transform: 'none', opacity: 1 },
      ], opts).finished;
    });
    // throttled (background) tabs may never finish the animations, so cap the wait
    return Promise.race([Promise.all(anims), sleep(1500)]).catch(() => {}).then(() => {
      tiles.forEach(({ t }) => t.remove());
      el.style.visibility = '';
      delete el.dataset.fx;
      el.classList.remove('ack'); void el.offsetWidth; el.classList.add('ack');
      setTimeout(() => el.classList.remove('ack'), 900);
    });
  }

  function disassemble(el, toRect) {
    if (!el || !el.animate) return Promise.resolve();
    if (el.dataset.fx) { delete el.dataset.fx; layer().innerHTML = ''; return Promise.resolve(); }
    if (reduced) return el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' }).finished.catch(() => {});
    el.dataset.fx = 'out';
    const dst = centerOf(toRect);
    const tiles = makeTiles(el, 'FIN');
    el.style.visibility = 'hidden';
    const anims = tiles.map(({ t, tag, tint, cx, cy, k }) => {
      const dx = dst.x - cx, dy = dst.y - cy, len = Math.hypot(dx, dy) || 1;
      const bend = (Math.random() - 0.5) * Math.min(180, len * 0.4);
      const px = -dy / len * bend, py = dx / len * bend;
      const rot = (Math.random() - 0.5) * 60;
      const opts = { duration: 470, delay: (tiles.length - k) * 16 + Math.random() * 50, easing: 'cubic-bezier(.6,0,.75,.3)', fill: 'both' };
      tag.animate([{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1 }], opts);
      tint.animate([{ opacity: 0 }, { opacity: 0.8, offset: 0.3 }, { opacity: 0.8 }], opts);
      return t.animate([
        { transform: 'none', opacity: 1 },
        { transform: `translate(${(Math.random() - 0.5) * 30}px,${-8 - Math.random() * 14}px) scale(.96)`, opacity: 1, offset: 0.18 },
        { transform: `translate(${dx * 0.55 + px}px,${dy * 0.55 + py}px) scale(.42) rotate(${rot * 0.5}deg)`, opacity: 0.9, offset: 0.6 },
        { transform: `translate(${dx}px,${dy}px) scale(.05) rotate(${rot}deg)`, opacity: 0 },
      ], opts).finished;
    });
    return Promise.race([Promise.all(anims), sleep(1400)]).catch(() => {}).then(() => {
      tiles.forEach(({ t }) => t.remove());
      delete el.dataset.fx;
    });
  }

  // ---------- fiber-optic cursor trail ----------
  function initTrail() {
    const c = document.getElementById('trail');
    if (!c || !fine || reduced) { if (c) c.remove(); return; }
    const ctx = c.getContext('2d');
    const pts = [];
    let raf = 0;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); c.width = innerWidth * d; c.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    size(); addEventListener('resize', size);
    addEventListener('pointermove', (e) => {
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (!raf) raf = requestAnimationFrame(draw);
    }, { passive: true });
    function draw(now) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      while (pts.length && now - pts[0].t > 260) pts.shift();
      if (pts.length > 1) {
        const dark = isDark();
        ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1], b = pts[i];
          const life = 1 - (now - b.t) / 260;
          const k = i / pts.length;
          ctx.strokeStyle = dark
            ? `rgba(${Math.round(255 - k * 176)},${Math.round(26 + k * 190)},${Math.round(77 + k * 178)},${life * 0.55})`
            : `rgba(${Math.round(223 - k * 212)},${Math.round(1 + k * 142)},${Math.round(57 + k * 119)},${life * 0.35})`;
          ctx.lineWidth = 0.6 + life * 2.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        const h = pts[pts.length - 1];
        const g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, 14);
        if (dark) { g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(0.4, 'rgba(79,216,255,0.18)'); g.addColorStop(1, 'rgba(79,216,255,0)'); }
        else { g.addColorStop(0, 'rgba(11,143,176,0.18)'); g.addColorStop(1, 'rgba(11,143,176,0)'); }
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(h.x, h.y, 14, 0, Math.PI * 2); ctx.fill();
      }
      raf = pts.length ? requestAnimationFrame(draw) : 0;
      if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
  }

  // ---------- magnetic desktop icons + generic [data-tilt] ----------
  function initMagnet() {
    if (!fine || reduced) return;
    let raf = 0, ev = null;
    addEventListener('pointermove', (e) => {
      ev = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        document.querySelectorAll('.d-icon.show').forEach((icon) => {
          const r = icon.getBoundingClientRect();
          const dx = ev.clientX - (r.left + r.width / 2), dy = ev.clientY - (r.top + r.height / 2);
          const d = Math.hypot(dx, dy);
          const img = icon.querySelector('.d-icon-img');
          if (d < 130) {
            const f = 1 - d / 130;
            img.style.setProperty('--mx', (dx * 0.16 * f).toFixed(1) + 'px');
            img.style.setProperty('--my', (dy * 0.16 * f).toFixed(1) + 'px');
            img.style.setProperty('--rx', (-dy * 0.12 * f).toFixed(1) + 'deg');
            img.style.setProperty('--ry', (dx * 0.12 * f).toFixed(1) + 'deg');
          } else if (img.style.getPropertyValue('--mx')) {
            ['--mx', '--my', '--rx', '--ry'].forEach((p) => img.style.removeProperty(p));
          }
        });
        const tilt = ev.target.closest && ev.target.closest('[data-tilt]');
        document.querySelectorAll('[data-tilt].tilting').forEach((t) => { if (t !== tilt) { t.classList.remove('tilting'); t.style.removeProperty('--tx'); t.style.removeProperty('--ty'); } });
        if (tilt) {
          const r = tilt.getBoundingClientRect();
          const x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
          tilt.classList.add('tilting');
          tilt.style.setProperty('--tx', (x * 7).toFixed(2) + 'deg');
          tilt.style.setProperty('--ty', (-y * 7).toFixed(2) + 'deg');
          tilt.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(1) + '%');
          tilt.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(1) + '%');
        }
      });
    }, { passive: true });
  }

  // ---------- ICMP ping: a real round trip to this server ----------
  let pingSeq = 0, lastPing = 0;
  async function measureRtt() {
    if (location.protocol === 'file:') return null;
    const t0 = performance.now();
    try {
      await fetch(`logo.webp?icmp=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
      return performance.now() - t0;
    } catch (e) { return null; }
  }

  async function ping(x, y) {
    const now = performance.now();
    if (now - lastPing < 350) return;
    lastPing = now;
    const seq = ++pingSeq;
    const ring = document.createElement('div');
    ring.className = 'ping-ring';
    ring.style.left = x + 'px'; ring.style.top = y + 'px';
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 1300);
    const hit = (window.NetScene && window.NetScene.ping(x, y)) || { name: 'manaf', hops: 1 };
    if (typeof Inspector !== 'undefined') Inspector.capture({ kind: 'icmp', dir: 'req', seq, target: hit.name });
    const rtt = await measureRtt();
    const real = rtt != null;
    const time = real ? rtt : 0.3 + Math.random() * 2;
    const ttl = 64 - hit.hops;
    await sleep(Math.max(0, 260 + hit.hops * 120 - (performance.now() - now)));
    const tag = document.createElement('div');
    tag.className = 'ping-reply';
    tag.innerHTML = `64 bytes from <b>${esc(hit.name)}</b>: icmp_seq=${seq} ttl=${ttl} time=<em>${time.toFixed(1)} ms</em>${real ? '' : ' <i>(sim)</i>'}`;
    tag.style.left = Math.min(x, innerWidth - 330) + 'px'; tag.style.top = (y - 18) + 'px';
    document.body.appendChild(tag);
    setTimeout(() => tag.remove(), 2600);
    if (typeof Inspector !== 'undefined') Inspector.capture({ kind: 'icmp', dir: 'rep', seq, target: hit.name, ttl, time, real });
  }

  // ---------- typewriter ----------
  function type(el, text, cps = 70, onTick) {
    if (reduced) { el.textContent = text; return Promise.resolve(); }
    return new Promise((resolve) => {
      let i = 0, skip = false;
      const stop = () => { skip = true; };
      el.addEventListener('click', stop, { once: true });
      const tick = () => {
        if (!el.isConnected) return resolve();
        i = skip ? text.length : Math.min(text.length, i + Math.max(1, Math.round(cps / 30)));
        el.textContent = text.slice(0, i);
        if (onTick) onTick();
        if (i >= text.length) return resolve();
        setTimeout(tick, 1000 / 30);
      };
      tick();
    });
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function init() { initTrail(); initMagnet(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  return { reduced, mobile, fine, tok, isDark, boot, powerOn, assemble, disassemble, ping, measureRtt, type, navTimings, esc, hex4, sleep };
})();
