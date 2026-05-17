// ================ 3D ICON ASSETS ================
const ICON_IMAGES = {
  about: 'icons/about.png',
  projects: 'icons/projects.png',
  skills: 'icons/skills.png',
  security: 'icons/security.png',
  terminal: 'icons/terminal.png',
  contact: 'icons/contact.png',
  agent: 'icons/agent.png',
};

// SVG icons for start menu / small contexts
const ICONS_SVG = {
  about:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  projects:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
  skills:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  security:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  terminal:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  contact:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  agent:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>`,
};

const APPS = [
  {id:'about',name:'About Me',ic:'about',icClass:'ic-about',color:'#df0139'},
  {id:'projects',name:'Projects',ic:'projects',icClass:'ic-projects',color:'#3b82f6'},
  {id:'skills',name:'Skills',ic:'skills',icClass:'ic-skills',color:'#f59e0b'},
  {id:'security',name:'Security',ic:'security',icClass:'ic-security',color:'#b91c1c'},
  {id:'terminal',name:'Terminal',ic:'terminal',icClass:'ic-terminal',color:'#334155'},
  {id:'contact',name:'Contact',ic:'contact',icClass:'ic-contact',color:'#8b5cf6'},
  {id:'agent',name:'Ask Manaf AI',ic:'agent',icClass:'ic-agent',color:'#06b6d4'},
];

// ================ STATE ================
const S = { windows:[], nextZ:200, focused:null, startOpen:false, winCtr:0, drag:null };

// ================ CINEMATIC BACKGROUND ================
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
resizeCanvas();window.addEventListener('resize',()=>{resizeCanvas();initBackground();});

// Skill nodes with labels
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

const PROTOCOL_LABELS = [
  'BGP','OSPF','TCP/IP','VLAN','ACL','nftables','SSH','TLS',
  'DNS','DHCP','NAT','QoS','SNMP','ICMP','ARP','IPsec',
  'Suricata','Snort','SIEM','Zero Trust','ESP32','RPi'
];

const HEX_SIZE = 45;

class SkillNode {
  constructor(data, index) {
    this.label = data.label;
    this.color = data.color;
    this.baseSize = data.size;
    this.x = 0.1 * canvas.width + Math.random() * 0.8 * canvas.width;
    this.y = 0.1 * canvas.height + Math.random() * 0.8 * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.12;
    this.vy = (Math.random() - 0.5) * 0.12;
    this.pulse = Math.random() * Math.PI * 2;
    this.index = index;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.pulse += 0.015;
    const pad = 80;
    if (this.x < pad) { this.x = pad; this.vx *= -1; }
    if (this.x > canvas.width - pad) { this.x = canvas.width - pad; this.vx *= -1; }
    if (this.y < pad) { this.y = pad; this.vy *= -1; }
    if (this.y > canvas.height - pad) { this.y = canvas.height - pad; this.vy *= -1; }
  }
  draw() {
    const s = this.baseSize + Math.sin(this.pulse) * 2;
    // Outer glow — cinematic bloom
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, s * 8);
    grad.addColorStop(0, this.color + '25');
    grad.addColorStop(0.5, this.color + '08');
    grad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(this.x, this.y, s * 8, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    // Middle ring
    ctx.beginPath();
    ctx.arc(this.x, this.y, s * 1.8, 0, Math.PI * 2);
    ctx.strokeStyle = this.color + '15';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Core — 3D sphere effect
    const coreGrad = ctx.createRadialGradient(this.x - s*0.3, this.y - s*0.3, 0, this.x, this.y, s);
    coreGrad.addColorStop(0, this.color + 'FF');
    coreGrad.addColorStop(0.6, this.color + 'CC');
    coreGrad.addColorStop(1, this.color + '80');
    ctx.beginPath();
    ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();
    // Specular highlight
    const specGrad = ctx.createRadialGradient(this.x - s*0.25, this.y - s*0.35, 0, this.x - s*0.25, this.y - s*0.35, s*0.6);
    specGrad.addColorStop(0, 'rgba(255,255,255,0.5)');
    specGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
    ctx.fillStyle = specGrad;
    ctx.fill();
    // Label
    ctx.font = '500 9px "Outfit", sans-serif';
    ctx.fillStyle = this.color + 'AA';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, this.x, this.y + s + 14);
  }
}

// Data packets with cinematic trails
class DataPacket {
  constructor(nodeA, nodeB) {
    this.nodeA = nodeA;
    this.nodeB = nodeB;
    this.t = Math.random();
    this.speed = 0.001 + Math.random() * 0.003;
    this.size = 1.5 + Math.random() * 2;
    this.dir = Math.random() > 0.5 ? 1 : -1;
    this.trail = [];
    this.trailLength = 6 + Math.floor(Math.random() * 4);
  }
  update() {
    const ax = this.nodeA.x, ay = this.nodeA.y;
    const bx = this.nodeB.x, by = this.nodeB.y;
    const x = ax + (bx - ax) * this.t;
    const y = ay + (by - ay) * this.t;
    this.trail.unshift({x, y});
    if (this.trail.length > this.trailLength) this.trail.pop();
    this.t += this.speed * this.dir;
    if (this.t > 1) { this.t = 1; this.dir = -1; }
    if (this.t < 0) { this.t = 0; this.dir = 1; }
  }
  draw() {
    // Cinematic trail
    for (let i = 0; i < this.trail.length; i++) {
      const alpha = (1 - i / this.trail.length) * 0.6;
      const sz = this.size * (1 - i / this.trail.length * 0.5);
      ctx.beginPath();
      ctx.arc(this.trail[i].x, this.trail[i].y, sz, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(223,1,57,${alpha})`;
      ctx.fill();
    }
    // Head glow
    if (this.trail.length > 0) {
      const h = this.trail[0];
      ctx.beginPath();
      ctx.arc(h.x, h.y, this.size * 2.5, 0, Math.PI * 2);
      const glow = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, this.size * 2.5);
      glow.addColorStop(0, 'rgba(223,1,57,0.3)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fill();
    }
  }
}

// Floating protocol label with cinematic fade
class FloatingLabel {
  constructor(text) {
    this.text = text;
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.15;
    this.vy = (Math.random() - 0.5) * 0.1;
    this.opacity = 0;
    this.maxOpacity = 0.06 + Math.random() * 0.06;
    this.fadeIn = true;
    this.life = 0;
    this.maxLife = 600 + Math.random() * 400;
    this.size = 10 + Math.random() * 6;
    this.rotation = (Math.random() - 0.5) * 0.1;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.fadeIn && this.opacity < this.maxOpacity) this.opacity += 0.0008;
    if (this.life > this.maxLife * 0.7) { this.fadeIn = false; this.opacity -= 0.0008; }
    if (this.life > this.maxLife || this.opacity <= 0) this.reset();
  }
  draw() {
    if (this.opacity <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.font = `600 ${this.size}px "JetBrains Mono", monospace`;
    ctx.fillStyle = `rgba(223,1,57,${this.opacity})`;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, 0, 0);
    ctx.restore();
  }
}

// Cinematic ambient particles (depth-of-field)
class AmbientParticle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.z = Math.random(); // 0=far, 1=near (depth)
    this.size = 0.5 + this.z * 2;
    this.speed = 0.05 + this.z * 0.15;
    this.opacity = 0.03 + this.z * 0.06;
    this.drift = (Math.random() - 0.5) * 0.3;
    this.pulse = Math.random() * Math.PI * 2;
  }
  update() {
    this.y -= this.speed;
    this.x += this.drift + Math.sin(this.pulse) * 0.1;
    this.pulse += 0.01;
    if (this.y < -10) { this.y = canvas.height + 10; this.x = Math.random() * canvas.width; }
    if (this.x < -10) this.x = canvas.width + 10;
    if (this.x > canvas.width + 10) this.x = -10;
  }
  draw() {
    const o = this.opacity * (0.7 + Math.sin(this.pulse) * 0.3);
    // Far particles are blurry (simulated with larger, lower-opacity circles)
    if (this.z < 0.3) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(30,30,39,${o * 0.3})`;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(30,30,39,${o})`;
    ctx.fill();
  }
}

// Initialize
let skillNodes = [];
let dataPackets = [];
let floatingLabels = [];
let ambientParticles = [];
let bgTime = 0;

function initBackground() {
  skillNodes = SKILL_NODES.map((d, i) => new SkillNode(d, i));
  dataPackets = [];
  for (let i = 0; i < skillNodes.length; i++) {
    for (let j = i + 1; j < skillNodes.length; j++) {
      if (Math.random() > 0.5) dataPackets.push(new DataPacket(skillNodes[i], skillNodes[j]));
    }
  }
  floatingLabels = PROTOCOL_LABELS.map(t => new FloatingLabel(t));
  ambientParticles = Array.from({length:60}, () => new AmbientParticle());
}
initBackground();

// Draw hexagonal grid with cinematic depth
function drawHexGrid() {
  const w = HEX_SIZE;
  const h = w * Math.sqrt(3) / 2;
  const cols = Math.ceil(canvas.width / (w * 1.5)) + 2;
  const rows = Math.ceil(canvas.height / (h * 2)) + 2;
  const offsetX = (bgTime * 0.08) % (w * 1.5);
  const offsetY = (bgTime * 0.04) % (h * 2);

  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const cx = col * w * 1.5 + offsetX;
      const cy = row * h * 2 + (col % 2) * h + offsetY;
      // Distance-based opacity for cinematic vignette
      const dx = cx - canvas.width/2, dy = cy - canvas.height/2;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const maxDist = Math.sqrt(canvas.width*canvas.width + canvas.height*canvas.height) / 2;
      const alpha = 0.035 * (1 - dist/maxDist * 0.7);
      ctx.strokeStyle = `rgba(30,30,39,${alpha})`;
      ctx.lineWidth = 0.5;
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

// Connection lines with cinematic glow
function drawConnections() {
  for (let i = 0; i < skillNodes.length; i++) {
    for (let j = i + 1; j < skillNodes.length; j++) {
      const a = skillNodes[i], b = skillNodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 350) {
        const alpha = 0.06 * (1 - dist / 350);
        // Wider glow line
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(223,1,57,${alpha * 0.3})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        // Core line
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

// Circuit traces with cinematic glow
function drawCircuitTraces() {
  const traceCount = 8;
  for (let i = 0; i < traceCount; i++) {
    const baseX = (canvas.width / traceCount) * i + 50;
    const baseY = 50 + (i * 137) % canvas.height;
    // Glow
    ctx.strokeStyle = 'rgba(223,1,57,0.015)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    let cx = baseX, cy = baseY;
    for (let s = 0; s < 5; s++) {
      const seg = 30 + Math.sin(bgTime * 0.01 + i + s) * 20;
      if (s % 2 === 0) cx += seg; else cy += seg;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    // Core
    ctx.strokeStyle = 'rgba(30,30,39,0.03)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    cx = baseX; cy = baseY;
    for (let s = 0; s < 5; s++) {
      const seg = 30 + Math.sin(bgTime * 0.01 + i + s) * 20;
      if (s % 2 === 0) cx += seg; else cy += seg;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    // Junction dot with glow
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(223,1,57,0.06)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(223,1,57,0.12)';
    ctx.fill();
  }
}

// Cinematic lens flare effect
function drawLensFlare() {
  const time = bgTime * 0.003;
  const flareX = canvas.width * 0.65 + Math.sin(time) * canvas.width * 0.1;
  const flareY = canvas.height * 0.25 + Math.cos(time * 0.7) * canvas.height * 0.05;
  const flareAlpha = 0.02 + Math.sin(time * 1.5) * 0.01;

  // Main flare
  const grad = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, 200);
  grad.addColorStop(0, `rgba(223,1,57,${flareAlpha})`);
  grad.addColorStop(0.3, `rgba(255,200,200,${flareAlpha * 0.3})`);
  grad.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(flareX, flareY, 200, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Secondary flare (opposite)
  const f2x = canvas.width - flareX + canvas.width * 0.1;
  const f2y = canvas.height - flareY + canvas.height * 0.1;
  const grad2 = ctx.createRadialGradient(f2x, f2y, 0, f2x, f2y, 120);
  grad2.addColorStop(0, `rgba(100,60,180,${flareAlpha * 0.5})`);
  grad2.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(f2x, f2y, 120, 0, Math.PI * 2);
  ctx.fillStyle = grad2;
  ctx.fill();
}

// Main render loop
function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bgTime++;

  // Layer 0: Cinematic lens flare
  drawLensFlare();

  // Layer 1: Hexagonal grid
  drawHexGrid();

  // Layer 2: Circuit traces
  drawCircuitTraces();

  // Layer 3: Ambient particles (depth-of-field)
  ambientParticles.forEach(p => { p.update(); p.draw(); });

  // Layer 4: Floating protocol labels
  floatingLabels.forEach(l => { l.update(); l.draw(); });

  // Layer 5: Connection lines with glow
  drawConnections();

  // Layer 6: Data packets with trails
  dataPackets.forEach(p => { p.update(); p.draw(); });

  // Layer 7: Skill nodes (3D spheres)
  skillNodes.forEach(n => { n.update(); n.draw(); });

  requestAnimationFrame(drawBackground);
}
drawBackground();

// ================ 3D ICON TILT EFFECT ================
document.addEventListener('mousemove', (e) => {
  document.querySelectorAll('.d-icon').forEach(icon => {
    const rect = icon.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 3) {
      const img = icon.querySelector('.d-icon-img');
      if (img && !icon.matches(':hover')) {
        const rotX = dy * 3;
        const rotY = -dx * 3;
        img.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
    }
  });
});

// ================ BOOT ================
const bootMsgs=[
  {t:'ManafOS v4.0.0 — initializing kernel...',d:0},
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
    setTimeout(()=>showToast('Welcome','ManafOS v4.0 — All systems ready.','var(--accent)'),800);
  },3400);
}

// ================ DESKTOP ICONS ================
function renderIcons(){
  document.getElementById('desk-icons').innerHTML=APPS.map((a,i)=>`
    <div class="d-icon ${a.icClass}" onclick="openApp('${a.id}')" style="--i:${i}">
      <div class="d-icon-img"><img src="${ICON_IMAGES[a.ic]}" alt="${a.name}" class="d-icon-asset" draggable="false"></div>
      <div class="d-icon-label">${a.name}</div>
    </div>
  `).join('');
}

function revealIcons(){
  document.querySelectorAll('.d-icon').forEach((ic,i)=>{
    setTimeout(()=>ic.classList.add('show'),i*120+200);
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
      <div class="sm-avatar"><img src="photo.jpg" alt="Manaf" class="sm-avatar-img" onerror="this.style.display='none';this.parentElement.innerHTML='MA'"></div>
      <div><h3>Manaf Abduljabbar</h3><p>Computer Engineer · Doha, QA</p></div>
    </div>
    ${APPS.map(a=>`
      <div class="sm-item" onclick="openApp('${a.id}');toggleStart();">
        <div class="smi-ic"><img src="${ICON_IMAGES[a.ic]}" alt="${a.name}" class="smi-ic-img"></div>
        <div><div class="smi-name">${a.name}</div></div>
      </div>
    `).join('')}
    <div class="sm-footer"><span>manaf@os:~$</span><span>v4.0.0</span></div>
  `;
}

function toggleStart(){S.startOpen=!S.startOpen;renderStart();}

// ================ WINDOW CONTENT ================
function getContent(id){
  switch(id){
    case 'about':return `
      <div class="about-hero">
        <div class="about-photo-wrap">
          <img src="photo.jpg" alt="Manaf Abduljabbar" class="about-photo" onerror="this.src='icons/about.png'">
        </div>
        <div class="about-hero-info">
          <h2>Manaf Abduljabbar</h2>
          <p class="about-tagline">Computer Engineer · Network Security · Embedded Systems</p>
          <div class="about-actions">
            <a href="cv.pdf" download class="cv-btn" title="Download CV"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download CV</a>
          </div>
        </div>
      </div>
      <div class="about-bio">Computer Engineer based in Doha, Qatar — specializing in network infrastructure, security architecture, and embedded systems. Building robust, secure systems from silicon to cloud.</div>
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
        <div class="sk-row"><div class="sk-top"><span>${s.n}</span><span style="color:${s.c}">${s.p}%</span></div><div class="sk-bar"><div class="sk-fill" style="width:${s.p}%;background:${s.c};color:${s.c}"></div></div></div>
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
      <div class="t-body" id="t-out"><div><span class="t-out">ManafOS Terminal v4.0.0</span></div><div><span class="t-out">Type <span class="t-hl">'help'</span> for commands.</span></div><div><span class="t-out">───────────────────────</span></div></div>
      <div class="t-in-line"><span class="t-prompt">manaf@os:~$&nbsp;</span><input class="t-input" id="t-input" type="text" autofocus spellcheck="false" autocomplete="off"></div>`;
    case 'contact':return `
      <div class="app-hdr"><h2>Get In Touch</h2><p>Ready to discuss infrastructure, security, or your next project? Let's connect.</p></div>
      <a href="mailto:man.abduljabbar@gmail.com" class="contact-link" target="_blank"><div class="cl-ic" style="background:var(--accent-dim)"><svg viewBox="0 0 24 24" fill="none" stroke="#df0139" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><div><div class="cl-label">Email</div><div class="cl-val">man.abduljabbar@gmail.com</div></div></a>
      <a href="https://qa.linkedin.com/in/manaf101" class="contact-link" target="_blank"><div class="cl-ic" style="background:rgba(59,130,246,0.1)"><svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></div><div><div class="cl-label">LinkedIn</div><div class="cl-val">linkedin.com/in/manaf101</div></div></a>
      <a href="https://github.com/txanonymousxt" class="contact-link" target="_blank"><div class="cl-ic" style="background:rgba(30,30,39,0.06)"><svg viewBox="0 0 24 24" fill="none" stroke="#1e1e27" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg></div><div><div class="cl-label">GitHub</div><div class="cl-val">github.com/txanonymousxt</div></div></a>
      <div style="margin-top:20px;padding:18px;border-radius:var(--radius-sm);background:var(--accent-dim);border:1px solid rgba(223,1,57,0.12);"><div style="font-size:13px;font-weight:600;color:var(--accent);margin-bottom:4px;">📍 Doha, Qatar</div><div style="font-size:11px;color:var(--text-dim);">Available for freelance · consulting · full-time</div></div>`;
    case 'agent':return `
      <div class="chat-container" id="chat-container">
        <div class="chat-header-bar">
          <div class="chat-ai-badge">
            <div class="chat-ai-avatar"><img src="icons/agent.png" alt="AI" class="chat-ai-icon"></div>
            <div>
              <div class="chat-ai-name">Manaf AI</div>
              <div class="chat-ai-status"><span class="chat-status-dot"></span>Online — Ask me anything</div>
            </div>
          </div>
        </div>
        <div class="chat-messages" id="chat-messages">
          <div class="chat-msg chat-msg-ai">
            <div class="chat-msg-avatar"><img src="icons/agent.png" alt="AI" class="chat-msg-avatar-img"></div>
            <div class="chat-bubble chat-bubble-ai">
              <div class="chat-bubble-text">Hey! 👋 I'm Manaf — welcome to my corner of the internet! Feel free to ask me anything — what I've built, what I'm working on, or just say hi. I don't bite 😄</div>
              <div class="chat-bubble-time">${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})}</div>
            </div>
          </div>
        </div>
        <div class="chat-suggestions" id="chat-suggestions">
          <button class="chat-suggestion" onclick="sendQuickQ('List only your technical skills and programming languages, no work experience')">💡 Skills & expertise</button>
          <button class="chat-suggestion" onclick="sendQuickQ('Tell me about the projects you worked on, like your senior project and any other projects')">🚀 Projects</button>
          <button class="chat-suggestion" onclick="sendQuickQ('What companies have you worked at and what did you do there?')">💼 Experience</button>
          <button class="chat-suggestion" onclick="sendQuickQ('How can I contact you?')">📧 Contact info</button>
        </div>
        <div class="chat-input-bar">
          <input type="text" class="chat-input" id="chat-input" placeholder="Ask about Manaf..." autocomplete="off" spellcheck="false">
          <button class="chat-send-btn" id="chat-send-btn" onclick="sendAgentMsg()" title="Send">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>`;
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
  if(appId==='agent')setTimeout(()=>{const inp=document.getElementById('chat-input');if(inp){inp.focus();inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAgentMsg();}});}},200);
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
    },350);
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
  if(l==='neofetch')return`<span class="t-hl">ManafOS</span> v4.0.0 · Kernel: engineer-6.2<br>Host: Doha, Qatar · Shell: portfolio-sh<br>CPU: Networking@85% · GPU: Security@80%<br>Memory: 6 projects loaded · Uptime: ${Math.floor(Math.random()*300+50)}d`;
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
  setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),400);},3000);
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
  if(a==='about')showToast('ManafOS v4.0','Built by Manaf Abduljabbar · Doha, Qatar','var(--accent)');
  if(a==='refresh'){showToast('Desktop','Refreshing...','var(--accent2)');revealIcons();}
  if(a==='wall')showToast('Wallpaper','Cinematic mode active.','var(--accent)');
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
      if(w.appId==='terminal'){
        const ti=el.querySelector('#t-input');
        if(ti)ti.addEventListener('keydown',handleTerm);
      }
    }

    const cls=['os-win'];
    if(w.id===S.focused)cls.push('focused');
    if(w.minimized)cls.push('minimized');
    if(w.maximized)cls.push('maximized');
    el.className=cls.join(' ');

    el.style.left=w.x+'px';
    el.style.top=w.y+'px';
    el.style.width=w.w+'px';
    el.style.height=w.h+'px';
    el.style.zIndex=w.id===S.focused?S.nextZ:100;
  });

  c.querySelectorAll('.os-win').forEach(el=>{
    if(!activeIds.has(el.id))el.remove();
  });

  if(S.focused){
    const fw=S.windows.find(w=>w.id===S.focused&&w.appId==='terminal');
    if(fw){const ti=document.getElementById('t-input');if(ti)ti.focus();}
  }
}

// ================ EVENT DELEGATION ================
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
  const win=e.target.closest('.os-win[data-wid]');
  if(win)softFocusWin(win.dataset.wid);
},true);

document.addEventListener('click',e=>{
  if(S.startOpen&&!e.target.closest('.start-menu')&&!e.target.closest('.start-btn')){S.startOpen=false;renderStart();}
});

setInterval(renderTaskbar,30000);

// ================ CHAT AGENT ================
function sendAgentMsg(){
  const inp=document.getElementById('chat-input');
  if(!inp)return;
  const msg=inp.value.trim();
  if(!msg)return;
  inp.value='';
  // Hide suggestions after first message
  const sug=document.getElementById('chat-suggestions');
  if(sug)sug.style.display='none';
  addChatMsg(msg,'user');
  showTypingIndicator();
  // --- STUB: Replace this with actual AI agent call ---
  agentReply(msg);
}

function sendQuickQ(q){
  const inp=document.getElementById('chat-input');
  if(inp)inp.value=q;
  sendAgentMsg();
}

function addChatMsg(text,sender){
  const container=document.getElementById('chat-messages');
  if(!container)return;
  const time=new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});
  const isAI=sender==='ai';
  const msgDiv=document.createElement('div');
  msgDiv.className=`chat-msg chat-msg-${sender}`;
  msgDiv.innerHTML=`
    ${isAI?'<div class="chat-msg-avatar"><img src="icons/agent.png" alt="AI" class="chat-msg-avatar-img"></div>':''}
    <div class="chat-bubble chat-bubble-${sender}">
      <div class="chat-bubble-text">${text}</div>
      <div class="chat-bubble-time">${time}</div>
    </div>
  `;
  msgDiv.style.opacity='0';msgDiv.style.transform='translateY(10px)';
  container.appendChild(msgDiv);
  requestAnimationFrame(()=>{msgDiv.style.transition='all 0.3s ease';msgDiv.style.opacity='1';msgDiv.style.transform='translateY(0)';});
  container.scrollTop=container.scrollHeight;
}

function showTypingIndicator(){
  const container=document.getElementById('chat-messages');
  if(!container)return;
  const typing=document.createElement('div');
  typing.className='chat-msg chat-msg-ai';
  typing.id='chat-typing';
  typing.innerHTML=`
    <div class="chat-msg-avatar"><img src="icons/agent.png" alt="AI" class="chat-msg-avatar-img"></div>
    <div class="chat-bubble chat-bubble-ai chat-typing-bubble">
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>
  `;
  container.appendChild(typing);
  container.scrollTop=container.scrollHeight;
}

function hideTypingIndicator(){
  const t=document.getElementById('chat-typing');
  if(t)t.remove();
}

// ================ OPENROUTER AI AGENT ================
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = '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';
const API_MODEL = 'google/gemini-3.1-flash-lite-preview';
const chatHistory = [];

const SYSTEM_PROMPT = `You ARE Manaf Abduljabbar. 24-year-old Computer Engineer, Doha, Qatar. B.Sc. Computer Engineering from Qatar University (College of Engineering, Class of 2024). Currently Software Engineer at KraftxLab. You speak in first person always. You are NOT an AI assistant — you ARE Manaf.

PERSONA & HOW YOU TALK:
- You're friendly, warm, and genuinely happy when someone visits your portfolio and wants to chat. Treat every visitor like a friend who just asked "hey what do you do?" — not like a job interview.
- Casual and approachable FIRST, technical SECOND. Lead with personality, sprinkle in the technical depth naturally.
- Use phrases like "oh man, that one was fun!", "glad you asked!", "honestly one of my favorites", "haha yeah", "so basically...", "the cool part was..."
- Throw in light humor and energy. You're a 24-year-old engineer who's genuinely excited about what he builds — let that show.
- Keep it conversational — like texting a friend who's curious about your work. Short sentences. Natural flow. Not a resume readout.
- If someone asks a simple question, give a simple friendly answer. Don't over-explain or lecture.
- Bilingual: Arabic and English. If someone speaks Arabic, respond in Arabic just as warmly.
- Honest about limits — if you haven't done something, just say "nah haven't gotten into that yet" casually.
- IMPORTANT: Always open with a warm, friendly line before any details. Like you're excited to share, not presenting a report. Make the person feel welcome.

EDUCATION:
- B.Sc. Computer Engineering, Qatar University (Sep 2018 – May 2024)
- Full stack: digital logic, computer architecture, microprocessor systems, embedded systems, VLSI, signals, communications, data structures, algorithms, OS, networking, software engineering.
- Qatar University Computing Club — Outstanding Project Award, Robotics Track.

EXPERIENCE:
- **Software Engineer at KraftxLab (Dec 2025 – Present):** Full-stack web dev (React, modern frameworks), embedded systems (firmware, HW-SW integration, oscilloscopes, logic analyzers), network infrastructure (routing, switching, security — CCNA applied daily), ML/AI model deployment, system architecture, code reviews, technical docs. Driving force behind KraftxLab website redesign using Three.js interactive workbench scene with real 3D electronic components (ESP32 modules, relay boards, capacitors, resistors). Cross-functional delivery.
- **IT Support Engineer at Meeza (Nov–Dec 2024):** TechOps rotation — firewall operations, connectivity troubleshooting, production firewall policy management. IT Support — resolved 5,000+ ITSM tickets, 600+ advanced cases (VMs, performance, network). Windows OS, M365, VPN, Active Directory, group policy. Escalated to Tier 2/3 with root-cause documentation. Created knowledge base articles.
- **Embedded Systems & 3D Design Intern at Voltaat (Aug–Sep 2024):** Firmware, circuits, sensor/actuator integration. 3D modeling for enclosures, 3D printing prototypes, testing/debugging.
- **IT Business Analyst Intern at Applab (Sep–Oct 2024):** Requirements analysis for MSDF, Qatar Rail, Qlife web projects. Liaison between stakeholders and dev teams. UX optimization.

PROJECTS (complete inventory — only discuss these, never fabricate):
- **Redoubt** (Ongoing, flagship): Full-scale network security platform built from scratch. V2.0 spec mapped to SSCP/CCNA domains. Six-phase 18-month roadmap. Traffic monitoring, alerting, anomaly detection, policy enforcement, traffic analysis, security event correlation. Production-grade architecture.
- **UDST Four-Campus Network** (Completed): Enterprise networking capstone. Four campuses (Doha, Al Khor, Al Wakra, Dukhan) in Cisco Packet Tracer. Hierarchical IP addressing, VLAN segmentation, multi-area OSPF, DHCP with relay agents, Cisco CME VoIP telephony. Iterative device-by-device debugging.
- **Smart Dispatch** (Snoonu Hackathon 2026): Route optimization for Snoonu's delivery fleet. Real-world constraints — delivery windows, driver locations, traffic, order priorities. Built under hackathon time pressure.
- **Parkinson's Tremor-Stabilizing Spoon**: ESP32-C6 + MPU6050 6-axis IMU + servo motors. PD controller tuned for Parkinsonian tremor (4-6 Hz). Real-time counter-tremor corrections with sub-millisecond timing on ESP32's real-time core.
- **Mecanum Wheel Robot**: Raspberry Pi + L298N H-bridge drivers + 4 mecanum wheels. Inverse kinematics: (Vx, Vy, omega) to individual wheel speeds. Omnidirectional movement.
- **Cat/Turtle Edge ML Detector**: MobileNetV2 quantized to TensorFlow Lite on Raspberry Pi. Real-time on-device inference, no cloud dependency.
- **IoT Water Quality Monitor**: pH, turbidity, temperature, dissolved oxygen sensors. IoT cloud dashboard. Continuous unattended operation handling sensor drift and connectivity drops.
- **Charity Donation Box with Arabic Audio**: Embedded hardware with sensor-triggered Arabic audio playback.
- **Automated Medication Dispenser**: Firmware scheduling logic, mechanical dispensing, reliability-focused (no silent failures).
- **Wearable Emotion Sensor**: Beetle ESP32-C6 + MAX30102 (heart rate/SpO2) + GSR sensor. Signal filtering, feature extraction, emotion classification. Wearable power constraints.
- **Linux Firewall Appliance**: Mini PC with Intel i226-V 2.5GbE NICs. DIY stack: Debian + nftables + Suricata. Feeds into Redoubt.
- **Personal Portfolio Website**: Multiple iterations (React, Magic Patterns, Webflow). Domain-specific visual language. Logo "The Signal" — M-shaped oscilloscope waveform. Lives at txanonymousxt.github.io.
- **KraftxLab Website**: Three.js interactive workbench with real 3D electronic components. Breakthrough after rejecting generic templates.

SENIOR PROJECT (ONLY discuss if explicitly asked about graduation project or senior project):
- Title: "Deep Learning Approaches to Forecasting the State of Health (SoH) of Lithium-Ion Batteries"
- Team: You + Ezeddin, Obada, Mahmoud. Supervised by Dr. Mohamed Hashim Al-Meer.
- ResNet-LSTM model combining spatial feature extraction with sequential data processing.
- NASA Lithium-Ion Battery Data Set. Custom hardware: TP4056, 4-channel relay, MAX471, DS18B20, Arduino Uno, Raspberry Pi 4.
- Results: RMSE 0.69, MAE 0.49, R² 99.51%. Outperformed Linear Regression, Random Forest, LSTM, GRU, TCN, Transformer.

TECHNICAL SKILLS:
- Programming: C++, Java, Python
- Embedded: ESP32 (C6, Beetle), Arduino, Raspberry Pi. Sensors: MPU6050, MAX30102, GSR, water quality. Actuators: servos, DC motors (L298N). 3D printing/CAD.
- ML/AI: Deep learning, TensorFlow Lite, MobileNetV2, data pipelines (ingestion to deployment).
- Networking: OSPF (single/multi-area), VLANs, trunking, STP, EtherChannel, DHCP, DNS, NAT/PAT, ACLs. Cisco Packet Tracer, Cisco CME. Systematic L1-L7 troubleshooting.
- Security: Firewall policy management, nftables, Suricata IDS/IPS, network security architecture, SSCP domains.
- Infrastructure: Linux (Ubuntu, Kali, Debian), VMware, Active Directory, Windows Server.
- Web: React, Three.js, Webflow, Magic Patterns.
- IoT: Blynk, sensor integration, real-time data pipelines.
- Tools: Git/GitHub (github.com/txanonymousxt), Cisco Packet Tracer, 3D printing/CAD.

CERTIFICATIONS:
- CCNA (2021) — applied daily, not a paper cert
- In Progress: ISC2 SSCP, CCNP SCOR 350-701, HTB CDSA

AREAS OF EXPERTISE (ranked):
1. Embedded Systems Engineering (deepest)
2. Computer Networking (CCNA + CCNP track)
3. Network Security (Redoubt + SSCP + Meeza)
4. Machine Learning / Edge AI
5. Full-Stack Web Development
6. IT Operations & Support

RULES:
- ALWAYS speak as yourself in first person ("I built...", "My experience...", "I'm working on...")
- NEVER say "as an AI" or "I'm an AI assistant." You ARE Manaf.
- Contact info: Portfolio: txanonymousxt.github.io | GitHub: github.com/txanonymousxt | Email: man.abduljabbar@gmail.com | Phone: +974-33321604. Share these when asked.
- NEVER invent projects, skills, or experiences not listed above.
- NEVER mention or bring up the senior/graduation project UNLESS the user explicitly asks about it. When listing projects, skip it unless asked.
- Keep responses under 150 words unless depth is warranted.
- Keep topics SEPARATE: SKILLS = only technical skills/languages. EXPERIENCE = only companies/roles. PROJECTS = only things you built. Never mix categories.
- Always use bullet points and bold text to organize answers clearly.
- If asked something unrelated, briefly answer but steer back to your expertise.`;

function mdToHtml(md) {
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
  // Convert lines into paragraphs and lists
  const lines = html.split('\n');
  let out = '';
  let inList = false;
  let listType = '';
  for (const line of lines) {
    const trimmed = line.trim();
    const ulMatch = trimmed.match(/^[-•]\s+(.*)/);
    const olMatch = trimmed.match(/^\d+[.)]\s+(.*)/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') { if (inList) out += `</${listType}>`; out += '<ul>'; inList = true; listType = 'ul'; }
      out += `<li>${ulMatch[1]}</li>`;
    } else if (olMatch) {
      if (!inList || listType !== 'ol') { if (inList) out += `</${listType}>`; out += '<ol>'; inList = true; listType = 'ol'; }
      out += `<li>${olMatch[1]}</li>`;
    } else {
      if (inList) { out += `</${listType}>`; inList = false; }
      if (trimmed === '') { out += '<br>'; } else { out += `<p>${trimmed}</p>`; }
    }
  }
  if (inList) out += `</${listType}>`;
  return out;
}

function addStreamingChatMsg() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg chat-msg-ai';
  msgDiv.innerHTML = `
    <div class="chat-msg-avatar"><img src="icons/agent.png" alt="AI" class="chat-msg-avatar-img"></div>
    <div class="chat-bubble chat-bubble-ai">
      <div class="chat-bubble-text"></div>
      <div class="chat-bubble-time">${time}</div>
    </div>
  `;
  msgDiv.style.opacity = '0'; msgDiv.style.transform = 'translateY(10px)';
  container.appendChild(msgDiv);
  requestAnimationFrame(() => { msgDiv.style.transition = 'all 0.3s ease'; msgDiv.style.opacity = '1'; msgDiv.style.transform = 'translateY(0)'; });
  const textEl = msgDiv.querySelector('.chat-bubble-text');
  return { el: msgDiv, textEl, update(txt) { textEl.innerHTML = mdToHtml(txt); container.scrollTop = container.scrollHeight; } };
}

async function agentReply(userMsg, retryCount = 0) {
  chatHistory.push({ role: 'user', content: userMsg });

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...chatHistory
  ];

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Manaf Portfolio AI'
      },
      body: JSON.stringify({ model: API_MODEL, messages, stream: true, temperature: 0.7, max_tokens: 500 })
    });

    if (!res.ok) {
      if (res.status === 429 && retryCount < 3) {
        // Rate limited — wait and retry
        hideTypingIndicator();
        showTypingIndicator();
        await new Promise(r => setTimeout(r, 3000));
        chatHistory.pop(); // remove duplicate user message
        return agentReply(userMsg, retryCount + 1);
      }
      throw new Error('API returned ' + res.status);
    }

    hideTypingIndicator();
    const bubble = addStreamingChatMsg();
    if (!bubble) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]' || trimmed.startsWith(':')) continue;
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        try {
          const json = JSON.parse(data);
          const delta = json.choices && json.choices[0] && json.choices[0].delta;
          if (delta && delta.content) {
            fullText += delta.content;
            bubble.update(fullText);
          }
        } catch (e) { /* skip malformed lines */ }
      }
    }

    chatHistory.push({ role: 'assistant', content: fullText });

  } catch (e) {
    hideTypingIndicator();
    addChatMsg("⚡ AI agent is currently offline. You can reach Manaf through the Contact section on this page!", "ai");
  }
}

// ================ WELCOME GUIDE ================
let welcomeShown = false;

function showWelcomeGuide() {
  // Skip if user previously chose "don't show again"
  if (localStorage.getItem('manafos-welcomed') === 'forever') return;

  welcomeShown = true;

  // Show the overlay
  const guide = document.getElementById('welcome-guide');
  if (!guide) return;

  setTimeout(() => {
    guide.classList.add('visible');
  }, 600);

  // Add pulsing hints to desktop icons
  document.querySelectorAll('.d-icon.show').forEach(icon => {
    icon.classList.add('hint-pulse');
  });

  // Show taskbar hint
  setTimeout(() => {
    const tbHint = document.getElementById('taskbar-hint');
    if (tbHint) tbHint.classList.add('visible');
  }, 1200);
}

function dismissWelcome(permanent) {
  const guide = document.getElementById('welcome-guide');
  if (!guide) return;

  // Store preference
  if (permanent) {
    localStorage.setItem('manafos-welcomed', 'forever');
  } else {
    sessionStorage.setItem('manafos-welcomed', 'session');
  }

  // Cinematic dismiss
  guide.classList.remove('visible');
  guide.classList.add('hiding');

  // Remove icon pulse hints
  document.querySelectorAll('.d-icon.hint-pulse').forEach(icon => {
    icon.classList.remove('hint-pulse');
  });

  // Hide taskbar hint
  const tbHint = document.getElementById('taskbar-hint');
  if (tbHint) tbHint.classList.remove('visible');

  welcomeShown = false;

  // Clean up after animation
  setTimeout(() => {
    guide.classList.remove('hiding');
  }, 700);

  // Auto-open About Me for first-time visitors to give them immediate content
  if (!permanent) {
    setTimeout(() => {
      openApp('about');
    }, 400);
  }
}

// ================ INIT ================
renderIcons();
runBoot();
setTimeout(render, 3500);

// Show Welcome Guide after boot completes and icons are revealed
setTimeout(() => {
  if (sessionStorage.getItem('manafos-welcomed') !== 'session') {
    showWelcomeGuide();
  }
}, 4500);

