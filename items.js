// =================================================================
// The items from the live portfolio, in this room: About Me, Projects,
// Skills, Security, Terminal, Contact and the Packet Inspector, each
// opening as a calm sheet of paper over the scene.
// =================================================================

/* ---------- small helpers the Packet Inspector also uses ---------- */
const FX = (() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDark = () => document.documentElement.dataset.theme === 'night';
  const tok = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  async function measureRtt() {
    if (location.protocol === 'file:') return null;
    const t0 = performance.now();
    try {
      await fetch(`assets/photo.webp?icmp=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
      return performance.now() - t0;
    } catch (e) { return null; }
  }
  let pingSeq = 0, lastPing = 0;
  // a real round trip to this server; opened from disk there is no server, and it says so
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
    if (window.NetScene) NetScene.ping(x, y);
    Inspector.capture({ kind: 'icmp', dir: 'req', seq, target: 'manaf' });
    const rtt = await measureRtt();
    const real = rtt != null, time = real ? rtt : 0.3 + Math.random() * 2;
    await sleep(Math.max(0, 380 - (performance.now() - now)));
    const tag = document.createElement('div');
    tag.className = 'ping-reply';
    tag.innerHTML = `64 bytes from <b>manaf</b>: icmp_seq=${seq} ttl=63 time=<em>${time.toFixed(1)} ms</em>${real ? '' : ' <i>(sim)</i>'}`;
    tag.style.left = Math.max(8, Math.min(x, innerWidth - 340)) + 'px'; tag.style.top = Math.max(8, y - 18) + 'px';
    document.body.appendChild(tag);
    setTimeout(() => tag.remove(), 2600);
    Inspector.capture({ kind: 'icmp', dir: 'rep', seq, target: 'manaf', ttl: 63, time, real });
  }
  function type(el, text, cps = 70, onTick) {
    if (reduced) { el.textContent = text; return Promise.resolve(); }
    return new Promise((resolve) => {
      let i = 0, skip = false;
      el.addEventListener('click', () => { skip = true; }, { once: true });
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
  return { reduced, isDark, tok, sleep, esc, measureRtt, ping, type };
})();

/* ---------- the items ---------- */
const APPS = [
  { id: 'about', name: 'About Me', line: 'Who I am, in short' },
  { id: 'experience', name: 'Experience', line: 'The whole route, hop by hop' },
  { id: 'projects', name: 'Projects', line: 'From hardware prototypes to full-stack apps' },
  { id: 'skills', name: 'Skills', line: 'A live spectrum of what I work with' },
  { id: 'security', name: 'Security', line: 'Defense in depth' },
  { id: 'credentials', name: 'Credentials', line: 'Fired, and still in the kiln' },
  { id: 'terminal', name: 'Terminal', line: 'Try nmap manaf' },
  { id: 'contact', name: 'Contact', line: 'Email, LinkedIn, GitHub' },
  { id: 'inspector', name: 'Packet Inspector', line: 'Filter my career like Wireshark' },
];
const SKILLS = [
  { n: 'Networking', k: 'NET', p: 85, tools: 'OSPF · EIGRP · BGP · VLANs · DHCP/DNS · SNMP · syslog · Cisco · Juniper · MikroTik' },
  { n: 'Security', k: 'SEC', p: 80, tools: 'Firewalls · ACLs · VPN · Suricata · Snort · nftables · Metasploit' },
  { n: 'Embedded Systems', k: 'EMB', p: 82, tools: 'ESP32 · Arduino · Raspberry Pi · IMUs · biosensors · servos · 3D printing' },
  { n: 'Python / Scripting', k: 'PY', p: 78, tools: 'Python · Bash · C++ · Java' },
  { n: 'Web Development', k: 'WEB', p: 75, tools: 'React · Three.js · Webflow' },
  { n: 'IoT & Blynk', k: 'IOT', p: 77, tools: 'Blynk · sensor integration · real-time data pipelines' },
  { n: 'Cloud & DevOps', k: 'OPS', p: 60, tools: 'Linux · VMware · Windows Server · Active Directory' },
  { n: 'UI/UX Design', k: 'UX', p: 70, tools: 'Interface and motion design (this page, for one)' },
];
const HOPS = [
  { host: 'qatar-univ', role: 'B.Sc. Computer Engineering', org: 'Qatar University', from: [2018, 9], to: [2024, 5] },
  { host: 'applab', role: 'IT Business Analyst', org: 'Applab', from: [2024, 8], to: [2024, 10] },
  { host: 'meeza', role: 'NOC Engineer', org: 'Meeza', from: [2024, 11], to: [2025, 12] },
  { host: 'kraftxlab', role: 'Network Engineer', org: 'KraftxLab', from: [2025, 12], to: null },
];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ym = ([y, m]) => `${MON[m - 1]} ${y}`;
function span(from, to) {
  const now = new Date(), [y2, m2] = to || [now.getFullYear(), now.getMonth() + 1];
  const m = (y2 - from[0]) * 12 + (m2 - from[1]) + 1;
  return m >= 12 ? `${Math.floor(m / 12)}y ${m % 12}m` : `${m}m`;
}
const PROJECT_LIST = () => Inspector.CAREER.filter((p) => p.type === 'project' && !p.hidden);

/* ---------- the sheet ---------- */
const sheet = { el: null, main: null, title: null, id: null };
function openApp(id) {
  const a = APPS.find((x) => x.id === id);
  if (!a && id !== 'menu') return;
  if (!sheet.el) return;
  const was = sheet.id;
  if (was === id && sheet.el.open) return;
  if (was && sheet.el.open && was !== 'menu') Inspector.capture({ kind: 'close', app: was });
  sheet.id = id;
  sheet.main.innerHTML = '';
  sheet.main.dataset.app = id;
  sheet.main.scrollTop = 0;
  sheet.el.classList.toggle('wide', id === 'inspector');
  sheet.el.classList.toggle('tall', id === 'terminal' || id === 'inspector');
  sheet.title.textContent = id === 'menu' ? 'What are you looking for?' : a.name;
  if (id === 'menu') sheet.main.innerHTML = menuHtml();
  else if (id === 'inspector') { sheet.main.innerHTML = Inspector.html(); Inspector.mount(sheet.main.querySelector('.insp')); }
  else if (id === 'terminal') mountTerminal();
  else {
    const src = document.querySelector(`#c-${id} .sheet-body`);
    if (src) sheet.main.appendChild(src.cloneNode(true));
    if (id === 'about') extendAbout(sheet.main.querySelector('.sheet-body'));
    if (id === 'skills') mountSkills(sheet.main);
    if (id === 'security') mountSecurity(sheet.main);
    paintLive(sheet.main);
  }
  if (!sheet.el.open) sheet.el.showModal();
  if (id !== 'menu') Inspector.capture({ kind: 'open', app: id, size: sheet.main.textContent.length });
  const focus = sheet.main.querySelector('#t-input');
  if (focus) focus.focus();
}
function closeSheet() { if (sheet.el && sheet.el.open) sheet.el.close(); }
// As on the live site, About also shows the route and the certificates. They are copied from their own entries.
function extendAbout(body) {
  [['Experience', '#c-experience .route'], ['Certifications', '#c-credentials .creds']].forEach(([title, from]) => {
    const part = document.querySelector(from);
    if (!body || !part) return;
    const head = document.createElement('h4');
    head.className = 'sub';
    head.textContent = title;
    body.append(head, part.cloneNode(true));
  });
}
function menuHtml() {
  return `<div class="menu-head"><img src="assets/photo.webp" width="64" height="64" alt=""><div><b>Manaf Abduljabbar</b><span>Network Engineer · Doha, QA</span></div></div>
  <ul class="menu-list">${APPS.map((a) => `<li><button data-open="${a.id}"><b>${FX.esc(a.name)}</b><span>${FX.esc(a.line)}</span></button></li>`).join('')}</ul>
  <p class="menu-foot"><a href="#catalogue" data-close>Or read everything, in order</a><a href="assets/cv.pdf" download>Download CV</a></p>`;
}

/* ---------- small live values ---------- */
function dohaNow() { return new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Qatar', hour: '2-digit', minute: '2-digit' }); }
function paintLive(root = document) {
  root.querySelectorAll('[data-doha]').forEach((e) => { e.textContent = dohaNow(); });
  root.querySelectorAll('[data-span]').forEach((e) => {
    const [a, b] = e.dataset.span.split('>');
    const p = (s) => (s === 'now' ? null : s.split('-').map(Number));
    e.textContent = span(p(a), p(b));
  });
  root.querySelectorAll('[data-pkts]').forEach((e) => { e.textContent = Inspector.count(); });
}

/* ---------- toast ---------- */
function showToast(title, msg) {
  const box = document.querySelector('.toasts');
  if (!box) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<b>${title}</b><span>${msg}</span>`;
  (sheet.el && sheet.el.open ? sheet.el : document.body).appendChild(box);
  box.appendChild(t);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 2800);
}

/* ---------- terminal ---------- */
const TERM = { hist: [], hi: 0 };
const CMDS = ['help', 'about', 'skills', 'projects', 'contact', 'whoami', 'neofetch', 'uptime', 'date', 'clear', 'ping', 'traceroute', 'nmap', 'tcpdump', 'wireshark', 'inspect', 'sudo', 'cv', 'open', 'theme', 'exit'];
const esc = FX.esc;
function mountTerminal() {
  sheet.main.innerHTML = `<div class="term">
    <div class="t-body"><div id="t-out"><div><span class="t-out">Terminal · ssh session to manaf.local (encrypted, and captured)</span></div><div><span class="t-out">Type <span class="t-hl">help</span> for commands. Try <span class="t-hl">nmap manaf</span> or <span class="t-hl">traceroute manaf</span>.</span></div><div><span class="t-out t-dim">───────────────────────</span></div></div></div>
    <div class="t-in-line"><label class="t-prompt" for="t-input">manaf@os:~$&nbsp;</label><input class="t-input" id="t-input" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Terminal input"></div>
  </div>`;
  sheet.main.querySelector('#t-input').addEventListener('keydown', handleTerm);
}
function termPrint(html, cls = 't-out') {
  const out = document.getElementById('t-out');
  if (!out) return false;
  const d = document.createElement('div');
  d.innerHTML = `<span class="${cls}">${html}</span>`;
  out.appendChild(d);
  const b = out.parentElement;
  b.scrollTop = b.scrollHeight;
  return true;
}
function handleTerm(e) {
  const inp = e.target;
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    if (!TERM.hist.length) return;
    TERM.hi = Math.max(0, Math.min(TERM.hist.length, TERM.hi + (e.key === 'ArrowUp' ? -1 : 1)));
    inp.value = TERM.hist[TERM.hi] || '';
    return;
  }
  if (e.key === 'Tab') {
    e.preventDefault();
    const v = inp.value.trim().toLowerCase();
    if (!v) return;
    const m = CMDS.filter((c) => c.startsWith(v));
    if (m.length === 1) inp.value = m[0] + ' ';
    else if (m.length) termPrint(m.join('  '), 't-out t-dim');
    return;
  }
  if (e.key !== 'Enter') return;
  const v = inp.value.trim();
  inp.value = '';
  if (!v) return;
  TERM.hist.push(v);
  TERM.hi = TERM.hist.length;
  termPrint(`<span class="t-prompt">manaf@os:~$</span> <span class="t-cmd">${esc(v)}</span>`, 't-line');
  Inspector.capture({ kind: 'ssh', cmd: v });
  const r = runCmd(v);
  if (r) termPrint(r);
}
function runCmd(c) {
  const [cmd, ...args] = c.trim().split(/\s+/);
  const l = cmd.toLowerCase(), arg = args.join(' ');
  if (l === 'help') return `<span class="t-hl">about</span> profile · <span class="t-hl">skills</span> · <span class="t-hl">projects</span> · <span class="t-hl">contact</span> · <span class="t-hl">cv</span><br><span class="t-hl">ping</span> [host] real RTT · <span class="t-hl">traceroute</span> manaf · <span class="t-hl">nmap</span> manaf<br><span class="t-hl">tcpdump</span> live capture · <span class="t-hl">open</span> &lt;item&gt; · <span class="t-hl">theme</span> [dark|light] · <span class="t-hl">whoami</span> · <span class="t-hl">neofetch</span> · <span class="t-hl">uptime</span> · <span class="t-hl">date</span> · <span class="t-hl">clear</span> · <span class="t-hl">exit</span><br><span class="t-dim">↑/↓ history · Tab completes</span>`;
  if (l === 'about') return `Manaf Abduljabbar — Network Engineer @ KraftxLab<br>Network Security · Embedded Systems<br>Qatar University '24 · Doha, Qatar`;
  if (l === 'skills') return SKILLS.map((s) => `[${'█'.repeat(Math.round(s.p / 10))}${'░'.repeat(10 - Math.round(s.p / 10))}] ${s.n} ${s.p}%`).join('<br>');
  if (l === 'projects') return PROJECT_LIST().map((p, i) => `${String(i + 1).padStart(2, '0')} ${esc(p.title)} — <span class="t-dim">${esc(p.skills.slice(0, 2).join(', '))}</span>`).join('<br>') + `<br><span class="t-dim">all of them are in the capture: </span><span class="t-hl">tcpdump</span>`;
  if (l === 'contact') return `email     man.abduljabbar@gmail.com<br>linkedin  linkedin.com/in/manaf101<br>github    github.com/txanonymousxt`;
  if (l === 'whoami') return `visitor — guest@manaf (clearance: READ-ONLY)<br><span class="t-dim">the owner is manaf — network-engineer (clearance: FULL)</span>`;
  if (l === 'neofetch') return `<b>manaf</b>@os<br>OS: ManafOS v6 (Mended)<br>Host: Doha, Qatar · Kernel: network-eng-2025.12<br>Shell: ssh (captured) · GPU: WebGL ${window.NetScene && NetScene.ready ? 'online' : 'offline'}<br>Packets this session: ${Inspector.count()} · CPU: Networking@85%`;
  if (l === 'uptime') { const s = Math.round(performance.now() / 1000); return `up ${Math.floor(s / 60)}m ${s % 60}s (this session), load: 0.42, 0.31, 0.28`; }
  if (l === 'date') return new Date().toString() + `<br><span class="t-dim">Doha: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Qatar' })}</span>`;
  if (l === 'clear') { document.getElementById('t-out').innerHTML = ''; return ''; }
  if (l === 'ping') { termPing(arg || 'manaf'); return ''; }
  if (l === 'traceroute' || l === 'tracert') { termTrace(); return ''; }
  if (l === 'nmap') { termNmap(arg || 'manaf'); return ''; }
  if (l === 'tcpdump' || l === 'wireshark' || l === 'inspect') { setTimeout(() => Inspector.open({ tab: 'live' }), 300); return `tcpdump: listening on manaf0, link-type EN10MB (Ethernet)<br><span class="t-dim">${Inspector.count()} packets captured so far · opening Packet Inspector…</span>`; }
  if (l === 'sudo') { setTimeout(() => showToast('Incident', 'visitor tried sudo · reported to manaf (just kidding)'), 400); return `[sudo] password for visitor: <span class="t-dim">********</span><br><span class="t-err">visitor is not in the sudoers file. This incident will be reported.</span>`; }
  if (l === 'cv') { window.open('assets/cv.pdf', '_blank', 'noopener'); return 'Opening cv.pdf…'; }
  if (l === 'open') {
    const a = APPS.find((x) => x.id === arg.toLowerCase() || x.name.toLowerCase() === arg.toLowerCase());
    if (a) { setTimeout(() => openApp(a.id), 200); return `opening ${esc(a.name)}…`; }
    return `open: unknown item. Try: ${APPS.map((x) => x.id).join(', ')}`;
  }
  if (l === 'theme') {
    const want = arg.toLowerCase();
    const t = want === 'dark' || want === 'light' ? want : (FX.isDark() ? 'light' : 'dark');
    if ((t === 'dark') !== FX.isDark()) { const b = document.getElementById('lights'); if (b) setTimeout(() => b.click(), 150); }
    return `theme → <span class="t-hl">${t}</span>`;
  }
  if (l === 'exit') { setTimeout(closeSheet, 200); return 'logout · Connection to manaf.local closed.'; }
  return `Command not found: ${esc(c)}. Type <span class="t-hl">help</span>.`;
}
async function termPing(host) {
  host = esc(host);
  termPrint(`PING ${host} (10.24.0.1) 56(84) bytes of data.`);
  const times = [];
  let real = false;
  for (let i = 1; i <= 4; i++) {
    const rtt = await FX.measureRtt();
    real = rtt != null;
    const t = real ? rtt : 0.3 + Math.random();
    times.push(t);
    Inspector.capture({ kind: 'icmp', dir: 'req', seq: i, target: host });
    Inspector.capture({ kind: 'icmp', dir: 'rep', seq: i, target: host, ttl: 64, time: t, real });
    if (!termPrint(`64 bytes from ${host} (10.24.0.1): icmp_seq=${i} ttl=64 time=${t.toFixed(1)} ms`)) return;
    await FX.sleep(600);
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  termPrint(`--- ${host} ping statistics ---<br>4 packets transmitted, 4 received, 0% packet loss<br>rtt min/avg/max = ${Math.min(...times).toFixed(1)}/${avg.toFixed(1)}/${Math.max(...times).toFixed(1)} ms <span class="t-dim">${real ? '(real HTTP round trips to ' + esc(location.hostname) + ')' : '(simulated: no server)'}</span>`);
}
async function termTrace() {
  termPrint('traceroute to manaf (10.24.0.1), 30 hops max, 60 byte packets');
  for (let i = 0; i < HOPS.length; i++) {
    await FX.sleep(380);
    const h = HOPS[i];
    if (!termPrint(`${String(i + 1).padStart(2)}  <span class="t-hl">${h.host.padEnd(11).replace(/ /g, '&nbsp;')}</span> ${h.role} · ${h.org}  <span class="t-dim">${ym(h.from)} → ${h.to ? ym(h.to) : 'now'} (${span(h.from, h.to)})</span>${h.to ? '' : ' <span class="t-ok">★ you are here</span>'}`)) return;
  }
}
const NMAP_PORTS = [['22/tcp', 'open', 'ssh', 'Linux · Ubuntu · Kali · Debian'], ['53/udp', 'open', 'domain', 'DNS · DHCP troubleshooting'], ['161/udp', 'open', 'snmp', 'SNMP · syslog monitoring'], ['179/tcp', 'open', 'bgp', 'BGP · OSPF (multi-area) · EIGRP'], ['443/tcp', 'open', 'https', 'React · Three.js · Webflow'], ['500/udp', 'open', 'isakmp', 'VPN: site-to-site & remote access'], ['1883/tcp', 'open', 'mqtt', 'ESP32 · Arduino · Raspberry Pi'], ['8501/tcp', 'open', 'tf-serving', 'TensorFlow Lite · MobileNetV2'], ['3389/tcp', 'filtered', 'ms-wbt', 'Active Directory · Windows Server']];
async function termNmap(target) {
  termPrint(`Starting Nmap 7.95 · scanning ${esc(target)} (10.24.0.1)<br>Host is up (0.0004s latency).<br><span class="t-dim">PORT      STATE    SERVICE     VERSION</span>`);
  for (const [p, s, sv, v] of NMAP_PORTS) {
    await FX.sleep(140);
    if (!termPrint(`${p.padEnd(10).replace(/ /g, '&nbsp;')}<span class="${s === 'open' ? 't-ok' : 't-dim'}">${s.padEnd(9).replace(/ /g, '&nbsp;')}</span>${sv.padEnd(12).replace(/ /g, '&nbsp;')}${v}`)) return;
  }
  termPrint(`<span class="t-dim">Nmap done: 1 IP address (1 host up) scanned in 1.31 seconds</span>`);
}

/* ---------- skills: a spectrum analyzer, with The Signal running above it ---------- */
function mountSkills(el) {
  const cv = el.querySelector('.spec-c'), tip = el.querySelector('.spec-tip');
  if (!cv) return;
  const g = cv.getContext('2d'), d = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  const fit = () => { const r = cv.parentElement.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); };
  const ro = new ResizeObserver(fit);
  ro.observe(cv.parentElement);
  fit();
  const lv = SKILLS.map(() => 0), pk = SKILLS.map(() => 0), start = performance.now();
  let hover = -1;
  const geo = () => { const pad = 14, gap = W < 460 ? 6 : 10, bw = (W - pad * 2 - gap * (SKILLS.length - 1)) / SKILLS.length; return { pad, gap, bw }; };
  cv.addEventListener('mousemove', (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, { pad, gap, bw } = geo();
    const i = Math.floor((x - pad) / (bw + gap));
    hover = i >= 0 && i < SKILLS.length ? i : -1;
    if (hover < 0) { tip.classList.remove('on'); return; }
    const s = SKILLS[hover];
    tip.innerHTML = `<b>${esc(s.n)} · ${s.p}%</b><span>${esc(s.tools)}</span>`;
    tip.style.left = Math.min(Math.max(8, x - 110), W - 238) + 'px';
    tip.classList.add('on');
  });
  cv.addEventListener('mouseleave', () => { hover = -1; tip.classList.remove('on'); });
  const M = (u) => (Math.abs(u) > 1.2 ? 0 : Math.exp(-((u + 0.42) ** 2) * 26) + Math.exp(-((u - 0.42) ** 2) * 26) - 0.75 * Math.exp(-(u ** 2) * 34));
  function frame(now) {
    if (!cv.isConnected) { ro.disconnect(); return; }
    requestAnimationFrame(frame);
    if (!cv.offsetParent || !W) return;
    const t = FX.reduced ? 99 : (now - start) / 1000;
    const ink = FX.tok('--ink'), gold = FX.tok('--gold'), faint = FX.tok('--ink-3'), grid = FX.tok('--canvas-grid'), off = FX.tok('--canvas-off');
    g.clearRect(0, 0, W, H);
    const scopeH = Math.round(H * 0.3), top = scopeH + 18, bottom = H - 24, area = bottom - top;
    g.strokeStyle = grid; g.lineWidth = 1;
    for (let x = 0; x <= W; x += W / 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, scopeH); g.stroke(); }
    for (let y = 0; y <= scopeH; y += scopeH / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    const mid = scopeH / 2, A = scopeH * 0.34, px = ((t * 0.32) % 1.4) * W * 1.1 - W * 0.2;
    g.beginPath();
    for (let x = 0; x <= W; x += 2) {
      const y = mid - A * (0.16 * Math.sin(x * 0.045 - t * 3) + 0.08 * Math.sin(x * 0.13 + t * 1.7) + 1.1 * M((x - px) / 52));
      if (x) g.lineTo(x, y); else g.moveTo(x, y);
    }
    g.strokeStyle = gold; g.lineWidth = 2; g.stroke();
    g.fillStyle = faint; g.font = '9px ui-monospace, Consolas, monospace'; g.fillText('CH1  THE SIGNAL  200mV/div', 8, scopeH - 6);
    const { pad, gap, bw } = geo(), SEG = 20, segH = area / SEG;
    SKILLS.forEach((s, i) => {
      const intro = Math.min(1, Math.max(0, (t - 0.15 - i * 0.07) / 0.9)), ease = 1 - Math.pow(1 - intro, 3);
      const jit = FX.reduced ? 0 : (Math.sin(t * 2.3 + i * 1.7) * 0.02 + Math.sin(t * 5.3 + i) * 0.012);
      lv[i] = Math.max(0, (s.p / 100 + jit) * ease);
      pk[i] = Math.max(lv[i], pk[i] - 0.0022);
      const x = pad + i * (bw + gap), lit = Math.round(lv[i] * SEG), on = hover === i;
      for (let k = 0; k < SEG; k++) {
        const y = bottom - (k + 1) * segH + 1.5;
        g.fillStyle = k < lit ? (k >= SEG * 0.85 ? gold : ink) : off;
        g.globalAlpha = k < lit ? (on ? 1 : 0.7 + 0.3 * (k / SEG)) : 1;
        g.fillRect(x, y, bw, segH - 3);
      }
      g.globalAlpha = 1;
      const py = bottom - pk[i] * area;
      g.fillStyle = gold; g.fillRect(x, py - 2, bw, 2);
      g.fillStyle = on ? ink : faint; g.font = `600 ${W < 460 ? 9 : 10}px ui-monospace, Consolas, monospace`; g.textAlign = 'center';
      g.fillText(s.k, x + bw / 2, H - 8);
      g.fillStyle = ink; g.fillText(Math.round(lv[i] * 100) + '%', x + bw / 2, py - 7);
      g.textAlign = 'left';
    });
  }
  requestAnimationFrame(frame);
}

/* ---------- security: simulated probes are dropped at a layer of the defense ---------- */
function mountSecurity(el) {
  const svg = el.querySelector('.dd-svg');
  if (!svg) return;
  const layer = svg.querySelector('.dd-pk'), count = el.querySelector('.dd-count'), NS = 'http://www.w3.org/2000/svg';
  let dropped = 0;
  el.querySelectorAll('[data-ring]').forEach((c) => {
    c.addEventListener('mouseenter', () => { svg.dataset.hl = c.dataset.ring; });
    c.addEventListener('mouseleave', () => { delete svg.dataset.hl; });
  });
  if (FX.reduced) return;
  const RINGS = [120, 90, 60];
  const spawn = () => {
    if (!svg.isConnected) { clearInterval(timer); return; }
    if (!svg.getBoundingClientRect().width) return;
    const a = Math.random() * Math.PI * 2, stopAt = RINGS[Math.random() < 0.62 ? 0 : Math.random() < 0.8 ? 1 : 2];
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('r', '3.2'); dot.setAttribute('class', 'dd-atk');
    layer.appendChild(dot);
    const t0 = performance.now(), R0 = 150, dur = 900 + Math.random() * 500;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur), r = R0 - (R0 - stopAt) * p;
      dot.setAttribute('cx', 140 + Math.cos(a) * r); dot.setAttribute('cy', 140 + Math.sin(a) * r);
      if (p < 1) { requestAnimationFrame(step); return; }
      dot.remove();
      const x = 140 + Math.cos(a) * stopAt, y = 140 + Math.sin(a) * stopAt;
      const fl = document.createElementNS(NS, 'circle');
      fl.setAttribute('cx', x); fl.setAttribute('cy', y); fl.setAttribute('r', '3'); fl.setAttribute('class', 'dd-hit');
      layer.appendChild(fl);
      const tx = document.createElementNS(NS, 'text');
      tx.setAttribute('x', x); tx.setAttribute('y', y - 8); tx.setAttribute('class', 'dd-drop');
      tx.textContent = 'DROP';
      layer.appendChild(tx);
      setTimeout(() => { fl.remove(); tx.remove(); }, 900);
      count.textContent = ++dropped;
    };
    requestAnimationFrame(step);
  };
  const timer = setInterval(spawn, 850);
  spawn();
}

/* ---------- wiring ---------- */
document.addEventListener('DOMContentLoaded', () => {
  sheet.el = document.getElementById('sheet');
  if (!sheet.el) return;
  sheet.main = sheet.el.querySelector('.sheet-main');
  sheet.title = sheet.el.querySelector('#sheet-title');
  sheet.el.querySelector('.sheet-x').addEventListener('click', closeSheet);
  sheet.el.addEventListener('close', () => {
    // the event arrives late; if another item has opened by then, leave it alone
    if (sheet.el.open) return;
    if (sheet.id && sheet.id !== 'menu') Inspector.capture({ kind: 'close', app: sheet.id });
    sheet.id = null;
    sheet.main.innerHTML = '';
  });
  // a click on the shade around the sheet closes it; the page behind stays where it was
  sheet.el.addEventListener('click', (e) => { if (e.target === sheet.el) closeSheet(); });
  sheet.el.addEventListener('wheel', (e) => { if (e.target === sheet.el) e.preventDefault(); }, { passive: false });
  paintLive();
  setInterval(() => paintLive(), 20000);

  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target;
    if (!t) return;
    const open = t.closest('[data-open]');
    if (open) { e.preventDefault(); openApp(open.dataset.open); return; }
    if (t.closest('[data-close]')) { closeSheet(); return; }
    const pid = t.closest('[data-inspect-id]');
    if (pid) {
      const p = Inspector.find(pid.dataset.inspectId);
      if (p) Inspector.open({ tab: 'career', filter: `title == "${p.title}"`, select: p.id });
      return;
    }
    const f = t.closest('[data-inspect]');
    if (f) { Inspector.open({ tab: 'career', filter: f.dataset.inspect }); return; }
    const hop = t.closest('[data-hop]');
    if (hop) { Inspector.open({ tab: 'career', filter: `org == "${hop.dataset.org}"`, select: hop.dataset.hop }); return; }
    const live = t.closest('[data-live]');
    if (live) { Inspector.open({ tab: 'live' }); return; }
    // anywhere else in the room: ping the network
    const page = document.documentElement.classList;
    if ((page.contains('live') || page.contains('no-gl')) && !t.closest('a,button,input,label,dialog,.col,.intro,.wall-hero,.nav,.seek,.catalogue,.foot')) {
      const sel = getSelection();
      if (sel && !sel.isCollapsed) return;
      FX.ping(e.clientX, e.clientY);
    }
  });
});
