// ================ SVG ICONS ================
const ICONS = {
  about:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  projects:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
  skills:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  security:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  terminal:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  contact:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
};

const APPS = [
  {id:'about',name:'About Me',ic:'about',icClass:'ic-about',color:'#df0139'},
  {id:'projects',name:'Projects',ic:'projects',icClass:'ic-projects',color:'#3b82f6'},
  {id:'skills',name:'Skills',ic:'skills',icClass:'ic-skills',color:'#f59e0b'},
  {id:'security',name:'Security',ic:'security',icClass:'ic-security',color:'#b91c1c'},
  {id:'terminal',name:'Terminal',ic:'terminal',icClass:'ic-terminal',color:'#334155'},
  {id:'contact',name:'Contact',ic:'contact',icClass:'ic-contact',color:'#8b5cf6'},
];

// ================ STATE ================
const S = { windows:[], nextZ:200, focused:null, startOpen:false, winCtr:0, drag:null };

// ================ PERSONALIZED NETWORK TOPOLOGY BACKGROUND ================
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
resizeCanvas();window.addEventListener('resize',resizeCanvas);

// Skill nodes with labels — representing Manaf's expertise
const SKILL_NODES = [
  { label:'Networking',   color:'#df0139', size:6 },
  { label:'Security',     color:'#1e1e27', size:6 },
  { label:'Embedded',     color:'#d97706', size:5 },
  { label:'Python',       color:'#2563eb', size:5 },
  { label:'Web Dev',      color:'#7c3aed', size:4 },
  { label:'IoT',          color:'#059669', size:4 },
  { label:'Cloud',        color:'#0891b2', size:4 },
  { label:'Robotics',     color:'#db2777', size:4 },
  { label:'Linux',        color:'#1e1e27', size:5 },
  { label:'Firewall',     color:'#df0139', size:5 },
];

// Protocol labels that float across the background
const PROTOCOL_LABELS = [
  'BGP','OSPF','TCP/IP','VLAN','ACL','nftables','SSH','TLS',
  'DNS','DHCP','NAT','QoS','SNMP','ICMP','ARP','IPsec',
  'Suricata','Snort','SIEM','Zero Trust','ESP32','RPi'
];

// Hexagonal grid parameters
const HEX_SIZE = 45;
const HEX_GAP = 4;

class SkillNode {
  constructor(data, index) {
    this.label = data.label;
    this.color = data.color;
    this.baseSize = data.size;
    this.x = 0.1 * canvas.width + Math.random() * 0.8 * canvas.width;
    this.y = 0.1 * canvas.height + Math.random() * 0.8 * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.15;
    this.vy = (Math.random() - 0.5) * 0.15;
    this.pulse = Math.random() * Math.PI * 2;
    this.index = index;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.pulse += 0.015;
    // Bounce off edges with padding
    const pad = 80;
    if (this.x < pad) { this.x = pad; this.vx *= -1; }
    if (this.x > canvas.width - pad) { this.x = canvas.width - pad; this.vx *= -1; }
    if (this.y < pad) { this.y = pad; this.vy *= -1; }
    if (this.y > canvas.height - pad) { this.y = canvas.height - pad; this.vy *= -1; }
  }
  draw() {
    const s = this.baseSize + Math.sin(this.pulse) * 1.5;
    // Outer glow
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, s * 6);
    grad.addColorStop(0, this.color + '30');
    grad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(this.x, this.y, s * 6, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    // Core
    ctx.beginPath();
    ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
    // Label
    ctx.font = '500 9px "Outfit", sans-serif';
    ctx.fillStyle = this.color + 'CC';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, this.x, this.y + s + 14);
  }
}

// Data packets that travel along connections
class DataPacket {
  constructor(nodeA, nodeB) {
    this.nodeA = nodeA;
    this.nodeB = nodeB;
    this.t = Math.random(); // position along line 0-1
    this.speed = 0.002 + Math.random() * 0.003;
    this.size = 2 + Math.random() * 2;
    this.dir = Math.random() > 0.5 ? 1 : -1;
  }
  update() {
    this.t += this.speed * this.dir;
    if (this.t > 1) { this.t = 1; this.dir = -1; }
    if (this.t < 0) { this.t = 0; this.dir = 1; }
  }
  draw() {
    const ax = this.nodeA.x, ay = this.nodeA.y;
    const bx = this.nodeB.x, by = this.nodeB.y;
    const x = ax + (bx - ax) * this.t;
    const y = ay + (by - ay) * this.t;
    ctx.beginPath();
    ctx.arc(x, y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = '#df0139';
    ctx.shadowColor = '#df0139';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    // Trailing glow
    const tx = ax + (bx - ax) * (this.t - 0.05 * this.dir);
    const ty = ay + (by - ay) * (this.t - 0.05 * this.dir);
    ctx.beginPath();
    ctx.arc(tx, ty, this.size * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(223,1,57,0.25)';
    ctx.fill();
  }
}

// Floating protocol label
class FloatingLabel {
  constructor(text) {
    this.text = text;
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.2;
    this.vy = (Math.random() - 0.5) * 0.15;
    this.opacity = 0;
    this.maxOpacity = 0.08 + Math.random() * 0.07;
    this.fadeIn = true;
    this.life = 0;
    this.maxLife = 600 + Math.random() * 400;
    this.size = 10 + Math.random() * 6;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.fadeIn && this.opacity < this.maxOpacity) {
      this.opacity += 0.001;
    }
    if (this.life > this.maxLife * 0.7) {
      this.fadeIn = false;
      this.opacity -= 0.001;
    }
    if (this.life > this.maxLife || this.opacity <= 0) {
      this.reset();
    }
  }
  draw() {
    if (this.opacity <= 0) return;
    ctx.font = `600 ${this.size}px "JetBrains Mono", monospace`;
    ctx.fillStyle = `rgba(223,1,57,${this.opacity})`;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
  }
}

// Initialize background elements
let skillNodes = [];
let dataPackets = [];
let floatingLabels = [];
let bgTime = 0;

function initBackground() {
  skillNodes = SKILL_NODES.map((d, i) => new SkillNode(d, i));
  dataPackets = [];
  // Create packets for nearby node pairs
  for (let i = 0; i < skillNodes.length; i++) {
    for (let j = i + 1; j < skillNodes.length; j++) {
      if (Math.random() > 0.5) {
        dataPackets.push(new DataPacket(skillNodes[i], skillNodes[j]));
      }
    }
  }
  // Floating protocol labels
  floatingLabels = PROTOCOL_LABELS.map(t => new FloatingLabel(t));
}
initBackground();

// Draw hexagonal grid
function drawHexGrid() {
  const w = HEX_SIZE;
  const h = w * Math.sqrt(3) / 2;
  ctx.strokeStyle = 'rgba(30,30,39,0.04)';
  ctx.lineWidth = 0.5;
  const cols = Math.ceil(canvas.width / (w * 1.5)) + 2;
  const rows = Math.ceil(canvas.height / (h * 2)) + 2;
  const offsetX = (bgTime * 0.1) % (w * 1.5);
  const offsetY = (bgTime * 0.05) % (h * 2);

  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const cx = col * w * 1.5 + offsetX;
      const cy = row * h * 2 + (col % 2) * h + offsetY;
      drawHex(cx, cy, w / 2);
    }
  }
}

function drawHex(cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

// Draw connection lines between skill nodes
function drawConnections() {
  for (let i = 0; i < skillNodes.length; i++) {
    for (let j = i + 1; j < skillNodes.length; j++) {
      const a = skillNodes[i], b = skillNodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 350) {
        const alpha = 0.08 * (1 - dist / 350);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(223,1,57,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }
}

// Draw circuit board traces
function drawCircuitTraces() {
  const traceCount = 8;
  ctx.strokeStyle = 'rgba(30,30,39,0.035)';
  ctx.lineWidth = 1;
  for (let i = 0; i < traceCount; i++) {
    const baseX = (canvas.width / traceCount) * i + 50;
    const baseY = 50 + (i * 137) % canvas.height;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    // Draw right-angle circuit-style traces
    let cx = baseX, cy = baseY;
    for (let s = 0; s < 5; s++) {
      const seg = 30 + Math.sin(bgTime * 0.01 + i + s) * 20;
      if (s % 2 === 0) { cx += seg; }
      else { cy += seg; }
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    // Node dot at junctions
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(223,1,57,0.1)';
    ctx.fill();
  }
}

// Main render loop
function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bgTime++;

  // Layer 1: Hexagonal grid
  drawHexGrid();

  // Layer 2: Circuit traces
  drawCircuitTraces();

  // Layer 3: Floating protocol labels
  floatingLabels.forEach(l => { l.update(); l.draw(); });

  // Layer 4: Connection lines
  drawConnections();

  // Layer 5: Data packets
  dataPackets.forEach(p => { p.update(); p.draw(); });

  // Layer 6: Skill nodes
  skillNodes.forEach(n => { n.update(); n.draw(); });

  requestAnimationFrame(drawBackground);
}
drawBackground();

// ================ BOOT ================
const bootMsgs=[
  {t:'ManafOS v3.0.0 — initializing kernel...',d:0},
  {t:'<span class="hl">[  OK  ]</span> Loaded neural-network.module',d:400},
  {t:'<span class="hl">[  OK  ]</span> Mounted /sys/security-ops',d:750},
  {t:'<span class="hl">[  OK  ]</span> Started embedded-systems.service',d:1050},
  {t:'<span class="hl">[  OK  ]</span> Network interfaces: eth0, wlan0',d:1400},
  {t:'<span class="hl">[  OK  ]</span> Firewall rules loaded (nftables)',d:1700},
  {t:'<span class="hl">[  OK  ]</span> Portfolio server online — welcome.',d:2200},
];

function runBoot(){
  const box=document.getElementById('boot-lines');
  const fill=document.getElementById('boot-fill');
  bootMsgs.forEach(({t,d},i)=>{
    setTimeout(()=>{
      const div=document.createElement('div');div.innerHTML=t;box.appendChild(div);
      requestAnimationFrame(()=>div.classList.add('show'));
      fill.style.width=((i+1)/bootMsgs.length*100)+'%';
    },d);
  });
  setTimeout(()=>{
    document.getElementById('boot').classList.add('out');
    document.getElementById('desktop').classList.add('on');
    revealIcons();
    // Welcome notification
    setTimeout(()=>showToast('Welcome','ManafOS v3.0 — All systems ready.','var(--accent)'),800);
  },3400);
}

// ================ DESKTOP ICONS ================
function renderIcons(){
  document.getElementById('desk-icons').innerHTML=APPS.map(a=>`
    <div class="d-icon ${a.icClass}" onclick="openApp('${a.id}')">
      <div class="d-icon-img">${ICONS[a.ic]}</div>
      <div class="d-icon-label">${a.name}</div>
    </div>
  `).join('');
}

function revealIcons(){
  document.querySelectorAll('.d-icon').forEach((ic,i)=>{
    setTimeout(()=>ic.classList.add('show'),i*80+200);
  });
}

// ================ TASKBAR ================
function renderTaskbar(){
  const tb=document.getElementById('taskbar');
  const apps=S.windows.filter(w=>!w._removed).map(w=>`
    <button class="tb-app ${w.id===S.focused?'active':''}" onclick="toggleWin('${w.id}')">
      <span class="app-dot" style="background:${w.color}"></span>${w.name}
    </button>
  `).join('');
  const now=new Date();
  const time=now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});
  const day=now.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  tb.innerHTML=`
    <button class="start-btn" onclick="toggleStart()" title="Start"><img src="logo.png" class="start-logo" alt="Start"></button>
    <div class="tb-div"></div>
    <div class="tb-apps">${apps}</div>
    <div class="sys-tray">
      <div class="tray-badge"><span class="pulse-dot"></span> Online</div>
      <span class="tray-item tray-clock">${time}</span>
      <span class="tray-item">${day}</span>
    </div>
  `;
}

// ================ START MENU ================
function renderStart(){
  const sm=document.getElementById('start-menu');
  sm.className='start-menu'+(S.startOpen?' open':'');
  sm.innerHTML=`
    <div class="sm-header">
      <div class="sm-avatar">MA</div>
      <div><h3>Manaf Abduljabbar</h3><p>Computer Engineer · Doha, QA</p></div>
    </div>
    ${APPS.map(a=>`
      <div class="sm-item" onclick="openApp('${a.id}');toggleStart();">
        <div class="smi-ic" style="background:${a.color}25"><svg viewBox="0 0 24 24" fill="none" stroke="${a.color}" stroke-width="2" stroke-linecap="round">${ICONS[a.ic].replace(/<svg[^>]*>|<\/svg>/g,'')}</svg></div>
        <div><div class="smi-name">${a.name}</div></div>
      </div>
    `).join('')}
    <div class="sm-footer"><span>manaf@os:~$</span><span>v3.0.0</span></div>
  `;
}

function toggleStart(){S.startOpen=!S.startOpen;renderStart();}

// ================ WINDOW CONTENT ================
function getContent(id){
  switch(id){
    case 'about':return `
      <div class="app-hdr"><h2>Manaf Abduljabbar</h2><p>Computer Engineer based in Doha, Qatar — specializing in network infrastructure, security architecture, and embedded systems. Building robust, secure systems from silicon to cloud.</p></div>
      <div class="i-row"><div class="i-card"><div class="ic-l">Education</div><div class="ic-v">B.Sc. Computer Eng.</div></div><div class="i-card"><div class="ic-l">University</div><div class="ic-v">Qatar University '24</div></div><div class="i-card"><div class="ic-l">Location</div><div class="ic-v">Doha, Qatar</div></div></div>
      <div class="app-sec"><h3>Experience</h3>
        <div class="exp-item"><div class="e-role">Software Engineer</div><div class="e-co">KraftxLab</div><div class="e-date">2025 — Present</div></div>
        <div class="exp-item"><div class="e-role">IT Support Engineer</div><div class="e-co">Meeza</div><div class="e-date">2024 — 2025</div></div>
      </div>
      <div class="app-sec"><h3>Certifications</h3><span class="tag tag-g">CCNA</span><span class="tag tag-b">SSCP (In Progress)</span><span class="tag tag-r">CDSA — HTB (In Progress)</span></div>`;
    case 'projects':return `
      <div class="app-hdr"><h2>Projects</h2><p>Selected builds — from hardware prototypes to full-stack apps.</p></div>
      <div class="proj-card"><h4>🚀 Smart Dispatch — Snoonu Hackathon 2026</h4><p>Order batching & route optimization using OSRM for real Doha road routing.</p><span class="tag tag-g">Python</span><span class="tag tag-b">OSRM</span><span class="tag tag-y">Optimization</span></div>
      <div class="proj-card"><h4>🤖 4-Wheel Mecanum Robot</h4><p>RPi-controlled omnidirectional robot with L298N drivers. Circular & geometric movements.</p><span class="tag tag-g">Raspberry Pi</span><span class="tag tag-p">Python</span><span class="tag tag-b">L298N</span></div>
      <div class="proj-card"><h4>🥄 Tremor-Stabilizing Spoon</h4><p>Parkinson's device — ESP32-C6, MPU6050, SG90 servos with PD controller.</p><span class="tag tag-r">ESP32-C6</span><span class="tag tag-y">PD Control</span><span class="tag tag-g">IMU</span></div>
      <div class="proj-card"><h4>🐱 Cat / Turtle Detector</h4><p>Edge ML on Raspberry Pi — MobileNetV2 + TF Lite with GPIO alarms, Blynk.</p><span class="tag tag-b">TF Lite</span><span class="tag tag-g">MobileNetV2</span><span class="tag tag-p">Blynk</span></div>
      <div class="proj-card"><h4>💧 Water Quality Monitor</h4><p>ESP32 + TDS/pH sensors, UV LED, L298N pump, Blynk dashboard with offline fallback.</p><span class="tag tag-g">ESP32</span><span class="tag tag-y">Sensors</span><span class="tag tag-b">Blynk</span></div>
      <div class="proj-card"><h4>🔥 Linux Firewall Appliance</h4><p>Custom mini PC — Intel i226-V NICs, IPFire / Debian + nftables + Suricata.</p><span class="tag tag-r">Suricata</span><span class="tag tag-g">nftables</span><span class="tag tag-b">Linux</span></div>`;
    case 'skills':return `
      <div class="app-hdr"><h2>Skills & Expertise</h2><p>Technical proficiency across networking, security, embedded systems, and dev.</p></div>
      ${[{n:'Networking (BGP, OSPF)',p:85,c:'#00e5a0'},{n:'Security (IDS/IPS)',p:80,c:'#ef4444'},{n:'Embedded Systems',p:82,c:'#f59e0b'},{n:'Python / Scripting',p:78,c:'#3b82f6'},{n:'Web Development',p:75,c:'#8b5cf6'},{n:'IoT & Blynk',p:77,c:'#10b981'},{n:'Cloud & DevOps',p:60,c:'#06b6d4'},{n:'UI/UX Design',p:70,c:'#f472b6'}].map(s=>`
        <div class="sk-row"><div class="sk-top"><span>${s.n}</span><span style="color:${s.c}">${s.p}%</span></div><div class="sk-bar"><div class="sk-fill" style="width:${s.p}%;background:${s.c}"></div></div></div>
      `).join('')}
      <div class="app-sec" style="margin-top:18px"><h3>Tools & Technologies</h3>
      <span class="tag tag-g">Cisco</span><span class="tag tag-g">Juniper</span><span class="tag tag-g">MikroTik</span>
      <span class="tag tag-r">Suricata</span><span class="tag tag-r">Snort</span><span class="tag tag-r">Metasploit</span>
      <span class="tag tag-b">Arduino</span><span class="tag tag-b">ESP32</span><span class="tag tag-b">RPi</span>
      <span class="tag tag-y">TF Lite</span><span class="tag tag-y">OpenCV</span>
      <span class="tag tag-p">React</span><span class="tag tag-p">Python</span><span class="tag tag-p">Linux</span></div>`;
    case 'security':return `
      <div class="app-hdr"><h2>Security Operations</h2><p>Defense-in-depth strategies and hands-on security engineering.</p></div>
      <div class="sec-card"><h4><span class="sec-dot"></span> Network Infrastructure</h4><p>BGP, OSPF, EIGRP. VLAN segmentation, QoS, ACL hardening. Cisco, Juniper, MikroTik.</p><div style="margin-top:8px"><span class="tag tag-g">BGP</span><span class="tag tag-g">OSPF</span><span class="tag tag-g">ACL</span><span class="tag tag-g">NAT</span></div></div>
      <div class="sec-card"><h4><span class="sec-dot" style="background:#00c8ff"></span> Network Defense</h4><p>IDS/IPS: Snort & Suricata. SIEM: Splunk, ELK. WAF, VPN, Zero Trust architecture.</p><div style="margin-top:8px"><span class="tag tag-r">Snort</span><span class="tag tag-r">Suricata</span><span class="tag tag-b">Splunk</span><span class="tag tag-b">ELK</span></div></div>
      <div class="sec-card"><h4><span class="sec-dot" style="background:#f59e0b"></span> Offensive Security</h4><p>Pentesting: Metasploit, Burp Suite. Recon: Nmap, OSINT, Shodan. CTF, red team, WiFi auditing.</p><div style="margin-top:8px"><span class="tag tag-y">Metasploit</span><span class="tag tag-y">Burp Suite</span><span class="tag tag-y">Nmap</span></div></div>
      <div class="sec-card"><h4><span class="sec-dot"></span> Defensive Security</h4><p>SOC monitoring, IR planning. ISO 27001, NIST. Hardening, forensics, auditing.</p><div style="margin-top:8px"><span class="tag tag-p">ISO 27001</span><span class="tag tag-p">NIST</span><span class="tag tag-p">IR</span></div></div>`;
    case 'terminal':return `
      <div class="t-body" id="t-out"><div><span class="t-out">ManafOS Terminal v3.0.0</span></div><div><span class="t-out">Type <span class="t-hl">'help'</span> for commands.</span></div><div><span class="t-out">───────────────────────</span></div></div>
      <div class="t-in-line"><span class="t-prompt">manaf@os:~$&nbsp;</span><input class="t-input" id="t-input" type="text" autofocus spellcheck="false" autocomplete="off"></div>`;
    case 'contact':return `
      <div class="app-hdr"><h2>Get In Touch</h2><p>Ready to discuss infrastructure, security, or your next project? Let's connect.</p></div>
      <a href="mailto:man.abduljabbar@gmail.com" class="contact-link" target="_blank"><div class="cl-ic" style="background:var(--accent-dim)"><svg viewBox="0 0 24 24" fill="none" stroke="#df0139" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><div><div class="cl-label">Email</div><div class="cl-val">man.abduljabbar@gmail.com</div></div></a>
      <a href="https://qa.linkedin.com/in/manaf101" class="contact-link" target="_blank"><div class="cl-ic" style="background:rgba(59,130,246,0.1)"><svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></div><div><div class="cl-label">LinkedIn</div><div class="cl-val">linkedin.com/in/manaf101</div></div></a>
      <a href="https://github.com/txanonymousxt" class="contact-link" target="_blank"><div class="cl-ic" style="background:rgba(30,30,39,0.06)"><svg viewBox="0 0 24 24" fill="none" stroke="#1e1e27" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg></div><div><div class="cl-label">GitHub</div><div class="cl-val">github.com/txanonymousxt</div></div></a>
      <div style="margin-top:20px;padding:18px;border-radius:var(--radius-sm);background:var(--accent-dim);border:1px solid rgba(223,1,57,0.12);"><div style="font-size:13px;font-weight:600;color:var(--accent);margin-bottom:4px;">📍 Doha, Qatar</div><div style="font-size:11px;color:var(--text-dim);">Available for freelance · consulting · full-time</div></div>`;
  }
}

// ================ WINDOW MANAGEMENT ================
function openApp(appId){
  const ex=S.windows.find(w=>w.appId===appId&&!w._removed);
  if(ex){ex.minimized=false;focusWin(ex.id);render();return;}
  const app=APPS.find(a=>a.id===appId);
  const id='w-'+(++S.winCtr);
  const mob=window.innerWidth<600;
  const w=mob?window.innerWidth-16:Math.min(600,window.innerWidth-80);
  const h=mob?window.innerHeight-100:Math.min(500,window.innerHeight-100);
  const idx=S.windows.filter(w=>!w._removed).length;
  const x=mob?8:100+(idx%5)*28;
  const y=mob?8:50+(idx%5)*28;
  S.windows.push({id,appId,name:app.name,color:app.color,x,y,w,h,minimized:false,maximized:false,_removed:false});
  focusWin(id);render();
  if(appId==='terminal')setTimeout(()=>{const inp=document.getElementById('t-input');if(inp)inp.focus();},200);
  showToast(app.name,'Application launched',app.color);
}

function closeWin(id){
  const el=document.getElementById(id);
  if(el){
    el.classList.add('closing');
    setTimeout(()=>{
      const w=S.windows.find(w=>w.id===id);
      if(w)w._removed=true;
      if(S.focused===id)S.focused=null;
      render();
    },250);
  }
}
function minimizeWin(id){const w=S.windows.find(w=>w.id===id);if(w){w.minimized=true;S.focused=null;render();}}
function maximizeWin(id){const w=S.windows.find(w=>w.id===id);if(w){w.maximized=!w.maximized;render();}}
function toggleWin(id){
  const w=S.windows.find(w=>w.id===id);if(!w)return;
  if(w.minimized){w.minimized=false;focusWin(id);}
  else if(S.focused===id){w.minimized=true;S.focused=null;}
  else focusWin(id);
  render();
}
function focusWin(id){S.focused=id;S.nextZ++;}

// Focus without full re-render — just update z-index and classes
function softFocusWin(id){
  if(S.focused===id)return;
  S.focused=id;S.nextZ++;
  document.querySelectorAll('.os-win').forEach(el=>{
    el.classList.remove('focused');
    el.style.zIndex=100;
  });
  const el=document.getElementById(id);
  if(el){el.classList.add('focused');el.style.zIndex=S.nextZ;}
  renderTaskbar();
}

// ================ DRAG ================
function startDrag(e,wid){
  if(e.target.closest('.tl')||e.target.closest('.traffic'))return;
  const w=S.windows.find(w=>w.id===wid);
  if(!w||w.maximized)return;
  softFocusWin(wid);
  const cx=e.touches?e.touches[0].clientX:e.clientX;
  const cy=e.touches?e.touches[0].clientY:e.clientY;
  S.drag={wid,ox:cx-w.x,oy:cy-w.y};
  const onMove=ev=>{
    if(!S.drag)return;
    const mx=ev.touches?ev.touches[0].clientX:ev.clientX;
    const my=ev.touches?ev.touches[0].clientY:ev.clientY;
    w.x=mx-S.drag.ox;w.y=Math.max(0,my-S.drag.oy);
    const el=document.getElementById(wid);
    if(el){el.style.left=w.x+'px';el.style.top=w.y+'px';}
  };
  const onUp=()=>{S.drag=null;document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);document.removeEventListener('touchmove',onMove);document.removeEventListener('touchend',onUp);};
  document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
  document.addEventListener('touchmove',onMove,{passive:false});document.addEventListener('touchend',onUp);
}

// ================ TERMINAL ================
function handleTerm(e){
  if(e.key!=='Enter')return;
  const v=e.target.value.trim();e.target.value='';if(!v)return;
  const out=document.getElementById('t-out');
  out.innerHTML+=`<div><span class="t-prompt">manaf@os:~$</span> <span class="t-cmd">${esc(v)}</span></div>`;
  const r=runCmd(v);if(r)out.innerHTML+=`<div><span class="t-out">${r}</span></div>`;
  out.parentElement.scrollTop=out.parentElement.scrollHeight;
}
function runCmd(c){
  const l=c.toLowerCase().trim();
  if(l==='help')return`<span class="t-hl">about</span> — Profile &nbsp;|&nbsp; <span class="t-hl">skills</span> — Skills &nbsp;|&nbsp; <span class="t-hl">projects</span> — Projects<br><span class="t-hl">contact</span> — Info &nbsp;|&nbsp; <span class="t-hl">whoami</span> — User &nbsp;|&nbsp; <span class="t-hl">neofetch</span> — System<br><span class="t-hl">uptime</span> — Uptime &nbsp;|&nbsp; <span class="t-hl">clear</span> — Clear &nbsp;|&nbsp; <span class="t-hl">date</span> — Date`;
  if(l==='about')return`Manaf Abduljabbar — Computer Engineer<br>Network Security · Embedded Systems<br>Qatar University '24 · Doha, Qatar`;
  if(l==='skills')return`[████████░░] Networking 85%<br>[████████░░] Security 80%<br>[████████░░] Embedded 82%<br>[███████░░░] Python 78%<br>[███████░░░] Web Dev 75%`;
  if(l==='projects')return`01 Smart Dispatch — Snoonu Hackathon<br>02 Mecanum Robot — Raspberry Pi<br>03 Tremor Spoon — ESP32-C6<br>04 Cat/Turtle Detector — TF Lite<br>05 Water Quality Monitor — ESP32<br>06 Linux Firewall — Suricata`;
  if(l==='contact')return`📧 man.abduljabbar@gmail.com<br>💼 linkedin.com/in/manaf101<br>🐙 github.com/txanonymousxt`;
  if(l==='whoami')return`manaf — computer-engineer (clearance: FULL)`;
  if(l==='neofetch')return`<span class="t-hl">ManafOS</span> v3.0.0 · Kernel: engineer-6.2<br>Host: Doha, Qatar · Shell: portfolio-sh<br>CPU: Networking@85% · GPU: Security@80%<br>Memory: 6 projects loaded · Uptime: ${Math.floor(Math.random()*300+50)}d`;
  if(l==='uptime')return`ManafOS up ${Math.floor(Math.random()*300+100)}d, load: 0.42, 0.31, 0.28`;
  if(l==='date')return new Date().toString();
  if(l==='clear'){document.getElementById('t-out').innerHTML='';return'';}
  return`Command not found: ${esc(c)}. Type <span class="t-hl">'help'</span>.`;
}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// ================ NOTIFICATIONS ================
function showToast(title,msg,color){
  const c=document.getElementById('toasts');
  const t=document.createElement('div');t.className='toast';
  t.innerHTML=`<div class="toast-icon" style="background:${color||'var(--accent)'}22"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="${color||'var(--accent)'}" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="toast-text"><div class="tt-title">${title}</div><div class="tt-msg">${msg}</div></div>`;
  c.appendChild(t);
  setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),300);},3000);
}

// ================ CONTEXT MENU ================
document.addEventListener('contextmenu',e=>{
  if(e.target.closest('.os-win')||e.target.closest('.taskbar')||e.target.closest('.start-menu'))return;
  e.preventDefault();
  const m=document.getElementById('ctx-menu');
  m.style.left=Math.min(e.clientX,window.innerWidth-200)+'px';
  m.style.top=Math.min(e.clientY,window.innerHeight-200)+'px';
  m.classList.add('show');
});
document.addEventListener('click',()=>document.getElementById('ctx-menu').classList.remove('show'));
function ctxAction(a){
  document.getElementById('ctx-menu').classList.remove('show');
  if(a==='terminal')openApp('terminal');
  if(a==='about')showToast('ManafOS v3.0','Built by Manaf Abduljabbar · Doha, Qatar','var(--accent)');
  if(a==='refresh'){showToast('Desktop','Refreshing...','var(--accent2)');revealIcons();}
  if(a==='wall')showToast('Wallpaper','Network topology mode active.','var(--accent)');
}

// ================ RENDER ================
function render(){
  renderTaskbar();renderStart();renderWindows();
}

function renderWindows(){
  const c=document.getElementById('win-container');
  const activeIds=new Set();

  S.windows.filter(w=>!w._removed).forEach(w=>{
    activeIds.add(w.id);
    let el=document.getElementById(w.id);

    if(!el){
      // Create new window element
      el=document.createElement('div');
      el.id=w.id;
      el.dataset.wid=w.id;
      el.innerHTML=`
        <div class="win-bar" onmousedown="startDrag(event,'${w.id}')" ontouchstart="startDrag(event,'${w.id}')">
          <div class="traffic"><button class="tl tl-c" data-action="close" data-win="${w.id}"></button><button class="tl tl-m" data-action="minimize" data-win="${w.id}"></button><button class="tl tl-x" data-action="maximize" data-win="${w.id}"></button></div>
          <div class="win-title">${w.name}</div>
        </div>
        <div class="win-body">${getContent(w.appId)}</div>`;
      c.appendChild(el);
      // Bind terminal
      if(w.appId==='terminal'){
        const ti=el.querySelector('#t-input');
        if(ti)ti.addEventListener('keydown',handleTerm);
      }
    }

    // Update classes
    const cls=['os-win'];
    if(w.id===S.focused)cls.push('focused');
    if(w.minimized)cls.push('minimized');
    if(w.maximized)cls.push('maximized');
    el.className=cls.join(' ');

    // Update position/size
    el.style.left=w.x+'px';
    el.style.top=w.y+'px';
    el.style.width=w.w+'px';
    el.style.height=w.h+'px';
    el.style.zIndex=w.id===S.focused?S.nextZ:100;
  });

  // Remove windows no longer in the list
  c.querySelectorAll('.os-win').forEach(el=>{
    if(!activeIds.has(el.id))el.remove();
  });

  // Focus terminal input
  if(S.focused){
    const fw=S.windows.find(w=>w.id===S.focused&&w.appId==='terminal');
    if(fw){const ti=document.getElementById('t-input');if(ti)ti.focus();}
  }
}

// ================ EVENT DELEGATION ================
// Handle traffic light buttons via mousedown delegation
// Must use mousedown (not click) because the win-bar's onmousedown fires first
document.getElementById('win-container').addEventListener('mousedown',e=>{
  const btn=e.target.closest('.tl[data-action]');
  if(btn){
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
    const wid=btn.dataset.win;
    const action=btn.dataset.action;
    if(action==='close')closeWin(wid);
    else if(action==='minimize')minimizeWin(wid);
    else if(action==='maximize')maximizeWin(wid);
    return;
  }
  // Focus window on mousedown (but not on button clicks)
  const win=e.target.closest('.os-win[data-wid]');
  if(win)softFocusWin(win.dataset.wid);
},true); // useCapture=true to fire before inline onmousedown

// Close start on outside click
document.addEventListener('click',e=>{
  if(S.startOpen&&!e.target.closest('.start-menu')&&!e.target.closest('.start-btn')){S.startOpen=false;renderStart();}
});

// Clock
setInterval(renderTaskbar,30000);

// ================ INIT ================
renderIcons();
runBoot();
setTimeout(render,3500);
