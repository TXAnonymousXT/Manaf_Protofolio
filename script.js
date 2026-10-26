// ================ ICON ASSETS ================
const ICON_IMAGES = {
  about: 'icons/about.webp',
  projects: 'icons/projects.webp',
  skills: 'icons/skills.webp',
  security: 'icons/security.webp',
  terminal: 'icons/terminal.webp',
  contact: 'icons/contact.webp',
  inspector: 'icons/inspector.svg',
};

const APPS = [
  {id:'about',name:'About Me',ic:'about',color:'var(--c-about)'},
  {id:'projects',name:'Projects',ic:'projects',color:'var(--c-projects)'},
  {id:'skills',name:'Skills',ic:'skills',color:'var(--c-skills)'},
  {id:'security',name:'Security',ic:'security',color:'var(--c-security)'},
  {id:'terminal',name:'Terminal',ic:'terminal',color:'var(--c-terminal)'},
  {id:'contact',name:'Contact',ic:'contact',color:'var(--c-contact)'},
  {id:'inspector',name:'Packet Inspector',ic:'inspector',color:'var(--c-inspector)'},
];

// ================ STATE ================
const S = { windows:[], nextZ:200, focused:null, startOpen:false, winCtr:0, drag:null };
const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
const TASKBAR_H = isMobile ? 58 : 64;
const esc = FX.esc;

// ================ DATA ================
const SKILLS = [
  {n:'Networking',k:'NET',p:85,c:'#4fd8ff',l:'#0b8fb0',tools:'OSPF · EIGRP · BGP · VLANs · DHCP/DNS · SNMP · syslog · Cisco · Juniper · MikroTik'},
  {n:'Security',k:'SEC',p:80,c:'#ff2d55',l:'#e11d48',tools:'Firewalls · ACLs · VPN · Suricata · Snort · nftables · Metasploit'},
  {n:'Embedded Systems',k:'EMB',p:82,c:'#f5a524',l:'#d97706',tools:'ESP32 · Arduino · Raspberry Pi · IMUs · biosensors · servos · 3D printing'},
  {n:'Python / Scripting',k:'PY',p:78,c:'#3b82f6',l:'#2563eb',tools:'Python · Bash · C++ · Java'},
  {n:'Web Development',k:'WEB',p:75,c:'#a78bfa',l:'#7c3aed',tools:'React · Three.js · Webflow'},
  {n:'IoT & Blynk',k:'IOT',p:77,c:'#22c55e',l:'#16a34a',tools:'Blynk · sensor integration · real-time data pipelines'},
  {n:'Cloud & DevOps',k:'OPS',p:60,c:'#06b6d4',l:'#0891b2',tools:'Linux · VMware · Windows Server · Active Directory'},
  {n:'UI/UX Design',k:'UX',p:70,c:'#f472b6',l:'#db2777',tools:'Interface and motion design (this OS, for one)'},
];

const HOPS = [
  {id:'qu',host:'qatar-univ',role:'B.Sc. Computer Engineering',org:'Qatar University',from:[2018,9],to:[2024,5]},
  {id:'applab',host:'applab',role:'IT Business Analyst',org:'Applab',from:[2024,8],to:[2024,10]},
  {id:'meeza',host:'meeza',role:'NOC Engineer',org:'Meeza',from:[2024,11],to:[2025,12]},
  {id:'kraftxlab',host:'kraftxlab',role:'Network Engineer',org:'KraftxLab',from:[2025,12],to:null},
];
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ym = ([y,m]) => `${MON[m-1]} ${y}`;
function span(from,to){
  const now=new Date(); const [y2,m2]=to||[now.getFullYear(),now.getMonth()+1];
  const m=(y2-from[0])*12+(m2-from[1])+1;
  return m>=12?`${Math.floor(m/12)}y ${m%12}m`:`${m}m`;
}

const PROJECTS = [
  {id:'redoubt',proto:'SEC',c:'var(--c-security)',status:'ongoing · flagship',title:'Redoubt',wide:true,
   desc:'Full-scale network security platform built from scratch: traffic monitoring, alerting, anomaly detection, policy enforcement and security event correlation. V2.0 spec mapped to SSCP and CCNA domains, on a six-phase, 18-month roadmap.',
   tags:['Network Security','Anomaly Detection','Event Correlation','SSCP']},
  {id:'udst',proto:'NET',c:'var(--cyan)',status:'completed',title:'UDST Four-Campus Network',
   desc:'Enterprise capstone in Cisco Packet Tracer: Doha, Al Khor, Al Wakra and Dukhan with hierarchical IP addressing, VLANs, multi-area OSPF, DHCP relay and Cisco CME VoIP.',
   tags:['OSPF','VLANs','VoIP']},
  {id:'firewall',proto:'SEC',c:'var(--c-security)',status:'built',title:'Linux Firewall Appliance',
   desc:'Custom mini PC with Intel i226-V NICs, running IPFire / Debian + nftables + Suricata.',
   tags:['Suricata','nftables','Linux']},
  {id:'dispatch',proto:'OPT',c:'var(--amber)',status:'Snoonu Hackathon 2026',title:'Smart Dispatch',
   desc:'Order batching and route optimization using OSRM for real Doha road routing.',
   tags:['Python','OSRM','Optimization']},
  {id:'spoon',proto:'EMB',c:'var(--amber)',status:'built',title:'Tremor-Stabilizing Spoon',
   desc:"Parkinson's device: ESP32-C6, MPU6050 and SG90 servos with a PD controller.",
   tags:['ESP32-C6','PD Control','IMU']},
  {id:'mecanum',proto:'EMB',c:'var(--amber)',status:'built',title:'4-Wheel Mecanum Robot',
   desc:'Raspberry Pi omnidirectional robot with L298N drivers. Circular and geometric movements.',
   tags:['Raspberry Pi','Python','L298N']},
  {id:'catdetector',proto:'ML',c:'var(--violet)',status:'built',title:'Cat / Turtle Detector',
   desc:'Edge ML on Raspberry Pi: MobileNetV2 + TF Lite with GPIO alarms and Blynk.',
   tags:['TF Lite','MobileNetV2','Blynk']},
  {id:'water',proto:'IOT',c:'var(--green)',status:'built',title:'Water Quality Monitor',
   desc:'ESP32 + TDS/pH sensors, UV LED, L298N pump and a Blynk dashboard with offline fallback.',
   tags:['ESP32','Sensors','Blynk']},
];

// ================ THEME ================
// Light is the main look; dark is one click away. The choice is remembered per visitor.
const THEME_ICON=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><mask id="moon-mask"><rect x="-4" y="-4" width="32" height="32" fill="#fff"/><circle class="moon-cut" cx="30" cy="-6" r="7" fill="#000"/></mask><circle class="sun-core" cx="12" cy="12" r="4.5" fill="currentColor" stroke="none" mask="url(#moon-mask)"/><g class="sun-rays"><line x1="12" y1="1.5" x2="12" y2="3.5"/><line x1="12" y1="20.5" x2="12" y2="22.5"/><line x1="1.5" y1="12" x2="3.5" y2="12"/><line x1="20.5" y1="12" x2="22.5" y2="12"/><line x1="4.6" y1="4.6" x2="6" y2="6"/><line x1="18" y1="18" x2="19.4" y2="19.4"/><line x1="4.6" y1="19.4" x2="6" y2="18"/><line x1="18" y1="6" x2="19.4" y2="4.6"/></g></svg>`;
const isDark=()=>document.documentElement.dataset.theme==='dark';
function applyTheme(t){
  document.documentElement.dataset.theme=t;
  try{localStorage.setItem('manafos-theme',t);}catch(e){}
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=t==='dark'?'#06070b':'#f6f4f0';
  if(window.NetScene&&NetScene.setTheme)NetScene.setTheme(t);
  const b=document.getElementById('theme-btn');if(b)b.title=t==='dark'?'Switch to light mode':'Switch to dark mode';
  document.dispatchEvent(new CustomEvent('themechange',{detail:t}));
}
function toggleTheme(btn,at){
  const next=isDark()?'light':'dark';
  const r=btn&&btn.getBoundingClientRect?btn.getBoundingClientRect():null;
  const x=at?at.x:r?r.left+r.width/2:innerWidth-60,y=at?at.y:r?r.top+r.height/2:innerHeight-30;
  if(!document.startViewTransition||FX.reduced){applyTheme(next);return;}
  const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
  const vt=document.startViewTransition(()=>applyTheme(next));
  setTimeout(()=>{try{vt.skipTransition();}catch(e){}},1400);   // never leave the page frozen on a snapshot
  vt.ready.then(()=>document.documentElement.animate(
    {clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${radius}px at ${x}px ${y}px)`]},
    {duration:750,easing:'cubic-bezier(.65,0,.25,1)',pseudoElement:'::view-transition-new(root)'})).catch(()=>{});
}

// ================ DESKTOP ICONS ================
function renderIcons(){
  document.getElementById('desk-icons').innerHTML=APPS.map((a,i)=>`
    <div class="d-icon" data-app="${a.id}" onclick="openApp('${a.id}')" style="--i:${i};--c:${a.color}" title="${a.name}">
      <div class="d-icon-img"><span class="d-glow"></span><img src="${ICON_IMAGES[a.ic]}" alt="" class="d-icon-asset" draggable="false"></div>
      <div class="d-icon-label">${a.name}</div>
    </div>
  `).join('');
}

function revealIcons(){
  const delay = isMobile ? 50 : 90;
  document.querySelectorAll('.d-icon').forEach((ic,i)=>{
    ic.classList.remove('show');
    setTimeout(()=>ic.classList.add('show'), i * delay + (isMobile ? 50 : 160));
  });
}

const desk = document.getElementById('desk-icons');
desk.addEventListener('mouseover',e=>{const ic=e.target.closest('.d-icon');if(ic&&window.NetScene)NetScene.highlight(ic.dataset.app);});
desk.addEventListener('mouseleave',()=>{if(window.NetScene)NetScene.highlight(null);});

// ================ HUD ================
function renderHud(){
  const hud=document.getElementById('hud');
  const ns=window.NetScene;
  const clusters=(ns&&ns.clusters)||[];
  hud.innerHTML=`
    <div class="hud-title"><span class="live-dot"></span>LIVE TOPOLOGY<span class="hud-dim">${ns&&ns.ready?'webgl':'static'}</span></div>
    <div class="hud-legend">${clusters.map(c=>`<button class="dual" data-app="${c.app}" style="--cd:${c.color};--cl:${c.light||c.color}"><i></i>${c.name.charAt(0)+c.name.slice(1).toLowerCase()}</button>`).join('')}</div>
    <div class="hud-stats"><span><b>${ns&&ns.stats?ns.stats.nodes:'—'}</b> nodes</span><span><b>${ns&&ns.stats?ns.stats.links:'—'}</b> links</span><span><b data-pkts>${Inspector.count()}</b> pkts</span></div>
    <div class="hud-hint">click empty space to ping · right-click for more</div>`;
}
const hudEl=document.getElementById('hud');
hudEl.addEventListener('mouseover',e=>{const b=e.target.closest('[data-app]');if(b&&window.NetScene)NetScene.highlight(b.dataset.app);});
hudEl.addEventListener('mouseleave',()=>{if(window.NetScene)NetScene.highlight(null);});
hudEl.addEventListener('click',e=>{const b=e.target.closest('[data-app]');if(b)openApp(b.dataset.app,b.getBoundingClientRect());});
window.addEventListener('netscene:ready',renderHud);
document.addEventListener('themechange',()=>{renderHud();renderTaskbar();});

// ================ TASKBAR ================
function renderTaskbar(){
  const tb=document.getElementById('taskbar');
  const apps=S.windows.filter(w=>!w._removed).map(w=>`
    <button class="tb-app ${w.id===S.focused&&!w.minimized?'active':''} ${w.minimized?'min':''}" data-win="${w.id}" onclick="toggleWin('${w.id}')" title="${w.name}">
      <img src="${ICON_IMAGES[w.appId]}" alt="" class="tb-ic"><span class="tb-name">${w.name}</span>
    </button>
  `).join('');
  const now=new Date();
  const time=now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});
  const doh=now.toLocaleTimeString('en-GB',{timeZone:'Asia/Qatar',hour:'2-digit',minute:'2-digit'});
  const day=now.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  tb.innerHTML=`
    <button class="start-btn" onclick="toggleStart()" title="Start"><img src="logo.webp" class="start-logo" alt="Start"></button>
    <div class="tb-div"></div>
    <div class="tb-apps">${apps}</div>
    <div class="sys-tray">
      <button class="theme-btn" id="theme-btn" onclick="toggleTheme(this)" title="${isDark()?'Switch to light mode':'Switch to dark mode'}" aria-label="Toggle dark mode">${THEME_ICON}</button>
      <button class="tray-pkts" id="tray-pkts" onclick="Inspector.open({tab:'live'})" title="Live capture: open Packet Inspector"><span class="rec-dot"></span><b data-pkts>${Inspector.count()}</b><span class="tray-lbl">pkts</span></button>
      <span class="tray-item tray-doh" title="Manaf's local time (Doha)">DOH ${doh}</span>
      <span class="tray-item tray-clock">${time}</span>
      <span class="tray-item tray-date">${day}</span>
    </div>
  `;
}

// ================ START MENU ================
function renderStart(){
  const sm=document.getElementById('start-menu');
  sm.className='start-menu'+(S.startOpen?' open':'');
  sm.innerHTML=`
    <div class="sm-header">
      <div class="sm-avatar"><img src="photo.webp" alt="Manaf" class="sm-avatar-img" onerror="this.style.display='none';this.parentElement.innerHTML='MA'"></div>
      <div><h3>Manaf Abduljabbar</h3><p>Network Engineer · Doha, QA</p></div>
    </div>
    <div class="sm-list">
    ${APPS.map(a=>`
      <div class="sm-item" onclick="openApp('${a.id}',this.getBoundingClientRect());toggleStart();" style="--c:${a.color}">
        <div class="smi-ic"><img src="${ICON_IMAGES[a.ic]}" alt="" class="smi-ic-img"></div>
        <div class="smi-name">${a.name}</div>
      </div>
    `).join('')}
    </div>
    <div class="sm-footer"><span>manaf@os:~$</span><span>v5.0.0</span></div>
  `;
}

function toggleStart(){S.startOpen=!S.startOpen;renderStart();}

// ================ WINDOW CONTENT ================
function getContent(id){
  switch(id){
    case 'about':return `
      <div class="about-hero">
        <div class="about-photo-wrap">
          <img src="photo.webp" alt="Manaf Abduljabbar" class="about-photo" onerror="this.src='photo.jpg'">
          <span class="about-scan"></span>
        </div>
        <div class="about-hero-info">
          <div class="kicker"><span class="live-dot"></span>ESTABLISHED · Doha, Qatar</div>
          <h2>Manaf Abduljabbar</h2>
          <p class="about-tagline">Computer Engineer · Network Security · Embedded Systems</p>
          <div class="about-actions">
            <a href="cv.pdf" download class="cv-btn" title="Download CV"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download CV</a>
            <button class="ghost-btn" data-inspect="">Inspect my career <span>→</span></button>
          </div>
        </div>
      </div>
      <div class="about-bio">Computer Engineer based in Doha, Qatar — specializing in network infrastructure, security architecture, and embedded systems. Building robust, secure systems from silicon to cloud.</div>
      <div class="i-row"><div class="i-card"><div class="ic-l">Education</div><div class="ic-v">B.Sc. Computer Eng.</div></div><div class="i-card"><div class="ic-l">University</div><div class="ic-v">Qatar University '24</div></div><div class="i-card"><div class="ic-l">Location</div><div class="ic-v">Doha, Qatar</div></div></div>
      <div class="app-sec"><h3>Experience</h3>
        <div class="trace">
          <div class="trace-head">traceroute to <b>manaf</b> (kraftxlab), 30 hops max, 60 byte packets</div>
          ${HOPS.map((h,i)=>`
          <button class="hop${h.to?'':' here'}" data-hop="${h.id}" data-org="${esc(h.org)}" style="--i:${i}" title="Inspect this hop">
            <span class="hop-n">${i+1}</span>
            <span class="hop-host">${h.host}</span>
            <span class="hop-role"><b>${h.role}</b><em>${h.org}</em></span>
            <span class="hop-when">${ym(h.from)} → ${h.to?ym(h.to):'now'}</span>
            <span class="hop-ms">${span(h.from,h.to)}</span>
          </button>`).join('')}
        </div>
      </div>
      <div class="app-sec"><h3>Certifications</h3><span class="tag tag-g">CCNA</span><span class="tag tag-b">SSCP (In Progress)</span><span class="tag tag-b">CCNP SCOR (In Progress)</span><span class="tag tag-r">CDSA — HTB (In Progress)</span><span class="tag tag-y">QU Outstanding Project Award · Robotics</span></div>`;
    case 'projects':return `
      <div class="app-hdr"><h2>Projects</h2><p>Selected builds — from hardware prototypes to full-stack apps. <button class="link-btn" data-inspect='type == "project"'>All of them are in the capture →</button></p></div>
      <div class="proj-grid">
        ${PROJECTS.map(p=>`
        <article class="proj-card${p.wide?' wide':''}" data-tilt style="--c:${p.c}">
          <div class="pc-top"><span class="pc-proto">${p.proto}</span><span class="pc-status">${p.status}</span></div>
          <h4>${p.title}</h4>
          <p>${p.desc}</p>
          <div class="pc-foot"><div class="pc-tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div><button class="pc-inspect" data-inspect-id="${p.id}">Inspect packet ›</button></div>
        </article>`).join('')}
      </div>`;
    case 'skills':return `
      <div class="app-hdr"><h2>Skills & Expertise</h2><p>A live spectrum of what I work with. Hover a channel to see the tools behind it.</p></div>
      <div class="spec"><canvas class="spec-c"></canvas><div class="spec-tip"></div></div>
      <div class="spec-legend">${SKILLS.map(s=>`<span class="dual" style="--cd:${s.c};--cl:${s.l}"><i></i>${s.n}<b>${s.p}%</b></span>`).join('')}</div>
      <div class="app-sec" style="margin-top:20px"><h3>Tools & Technologies</h3>
      <span class="tag tag-g">Cisco</span><span class="tag tag-g">Juniper</span><span class="tag tag-g">MikroTik</span><span class="tag tag-g">OSPF · EIGRP · BGP</span>
      <span class="tag tag-r">Suricata</span><span class="tag tag-r">Snort</span><span class="tag tag-r">nftables</span><span class="tag tag-r">Metasploit</span>
      <span class="tag tag-b">Arduino</span><span class="tag tag-b">ESP32</span><span class="tag tag-b">RPi</span>
      <span class="tag tag-y">TF Lite</span><span class="tag tag-y">OpenCV</span>
      <span class="tag tag-p">React</span><span class="tag tag-p">Three.js</span><span class="tag tag-p">Python</span><span class="tag tag-p">Bash</span><span class="tag tag-p">C++</span><span class="tag tag-p">Java</span>
      <span class="tag tag-c">Linux</span><span class="tag tag-c">Active Directory</span><span class="tag tag-c">VMware</span><span class="tag tag-c">Microsoft 365</span></div>`;
    case 'security':return `
      <div class="app-hdr"><h2>Security Operations</h2><p>Defense-in-depth strategies and hands-on security engineering.</p></div>
      <div class="sec-layout">
        <div class="dd">
          <svg class="dd-svg" viewBox="0 0 280 280" aria-label="Defense in depth diagram">
            <defs><radialGradient id="ddCore"><stop offset="0" stop-color="#ff1a4d" stop-opacity=".55"/><stop offset="1" stop-color="#ff1a4d" stop-opacity="0"/></radialGradient></defs>
            <circle class="dd-ring r0" cx="140" cy="140" r="120"/><circle class="dd-ring r1" cx="140" cy="140" r="90"/><circle class="dd-ring r2" cx="140" cy="140" r="60"/>
            <circle cx="140" cy="140" r="34" fill="url(#ddCore)"/><circle class="dd-core" cx="140" cy="140" r="16"/>
            <text class="dd-lbl" x="140" y="16">PERIMETER · INFRA</text><text class="dd-lbl" x="140" y="46">IDS / IPS · DEFENSE</text><text class="dd-lbl" x="140" y="76">SOC · RESPONSE</text>
            <text class="dd-lbl core" x="140" y="143">ASSETS</text>
            <g class="dd-pk"></g>
          </svg>
          <div class="dd-cap"><span class="live-dot"></span>simulated probes dropped: <b class="dd-count">0</b></div>
        </div>
        <div class="sec-cards">
          <div class="sec-card" data-ring="0"><h4><span class="sec-dot" style="--c:var(--cyan)"></span> Network Infrastructure</h4><p>BGP, OSPF, EIGRP. VLAN segmentation, QoS, ACL hardening. Cisco, Juniper, MikroTik.</p><div><span class="tag tag-g">BGP</span><span class="tag tag-g">OSPF</span><span class="tag tag-g">ACL</span><span class="tag tag-g">NAT</span></div></div>
          <div class="sec-card" data-ring="1"><h4><span class="sec-dot" style="--c:var(--violet)"></span> Network Defense</h4><p>IDS/IPS: Snort & Suricata. SIEM: Splunk, ELK. WAF, VPN, Zero Trust architecture.</p><div><span class="tag tag-r">Snort</span><span class="tag tag-r">Suricata</span><span class="tag tag-b">Splunk</span><span class="tag tag-b">ELK</span></div></div>
          <div class="sec-card" data-ring="atk"><h4><span class="sec-dot" style="--c:var(--amber)"></span> Offensive Security</h4><p>Pentesting: Metasploit, Burp Suite. Recon: Nmap, OSINT, Shodan. CTF, red team, WiFi auditing.</p><div><span class="tag tag-y">Metasploit</span><span class="tag tag-y">Burp Suite</span><span class="tag tag-y">Nmap</span></div></div>
          <div class="sec-card" data-ring="2"><h4><span class="sec-dot" style="--c:var(--accent)"></span> Defensive Security</h4><p>SOC monitoring, IR planning. ISO 27001, NIST. Hardening, forensics, auditing.</p><div><span class="tag tag-p">ISO 27001</span><span class="tag tag-p">NIST</span><span class="tag tag-p">IR</span></div></div>
        </div>
      </div>`;
    case 'terminal':return `
      <div class="t-body" id="t-out"><div><span class="t-out">ManafOS Terminal v5.0.0 · ssh session to manafos.local (encrypted, and captured)</span></div><div><span class="t-out">Type <span class="t-hl">'help'</span> for commands. Try <span class="t-hl">nmap manaf</span> or <span class="t-hl">traceroute manaf</span>.</span></div><div><span class="t-out t-dim">───────────────────────</span></div></div>
      <div class="t-in-line"><span class="t-prompt">manaf@os:~$&nbsp;</span><input class="t-input" id="t-input" type="text" autofocus spellcheck="false" autocomplete="off" aria-label="Terminal input"></div>`;
    case 'contact':return `
      <div class="app-hdr"><h2>Get In Touch</h2><p>Ready to discuss infrastructure, security, or your next project? Let's connect.</p></div>
      <a href="mailto:man.abduljabbar@gmail.com" class="contact-link" target="_blank" style="--c:var(--accent)"><div class="cl-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><div><div class="cl-label">Email</div><div class="cl-val">man.abduljabbar@gmail.com</div></div><span class="cl-port">:25</span></a>
      <a href="https://qa.linkedin.com/in/manaf101" class="contact-link" target="_blank" style="--c:var(--blue)"><div class="cl-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></div><div><div class="cl-label">LinkedIn</div><div class="cl-val">linkedin.com/in/manaf101</div></div><span class="cl-port">:443</span></a>
      <a href="https://github.com/txanonymousxt" class="contact-link" target="_blank" style="--c:var(--text)"><div class="cl-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg></div><div><div class="cl-label">GitHub</div><div class="cl-val">github.com/txanonymousxt</div></div><span class="cl-port">:22</span></a>
      <div class="contact-loc"><div class="cloc-t">📍 Doha, Qatar <span class="cloc-time" data-doha></span></div><div class="cloc-s">Available for freelance · consulting · full-time</div></div>`;
    case 'inspector':return Inspector.html();
  }
}

// ================ APP MOUNTS ================
function mountApp(id,el){
  if(id==='terminal'){const ti=el.querySelector('#t-input');if(ti)ti.addEventListener('keydown',handleTerm);}
  if(id==='inspector')Inspector.mount(el.querySelector('.insp'));
  if(id==='skills')mountSkills(el);
  if(id==='security')mountSecurity(el);
  if(id==='contact'){const d=el.querySelector('[data-doha]');if(d)d.textContent='· '+new Date().toLocaleTimeString('en-GB',{timeZone:'Asia/Qatar',hour:'2-digit',minute:'2-digit'})+' local';}
  el.querySelectorAll('[data-inspect-id]').forEach(b=>b.addEventListener('click',()=>{
    const p=Inspector.find(b.dataset.inspectId);
    Inspector.open({tab:'career',filter:`title == "${p.title}"`,select:p.id,from:b.getBoundingClientRect()});
  }));
  el.querySelectorAll('[data-inspect]').forEach(b=>b.addEventListener('click',()=>Inspector.open({tab:'career',filter:b.dataset.inspect,from:b.getBoundingClientRect()})));
  el.querySelectorAll('[data-hop]').forEach(b=>b.addEventListener('click',()=>Inspector.open({tab:'career',filter:`org == "${b.dataset.org}"`,select:b.dataset.hop,from:b.getBoundingClientRect()})));
}

// Skills: a spectrum analyzer with peak-hold and an oscilloscope trace ("The Signal")
function mountSkills(el){
  const cv=el.querySelector('.spec-c'),tip=el.querySelector('.spec-tip'),g=cv.getContext('2d');
  const d=Math.min(devicePixelRatio||1,2);let W=0,H=0;
  const fit=()=>{const r=cv.parentElement.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;g.setTransform(d,0,0,d,0,0);};
  const ro=new ResizeObserver(fit);ro.observe(cv.parentElement);fit();
  const lv=SKILLS.map(()=>0),pk=SKILLS.map(()=>0),start=performance.now();
  let hover=-1;
  const col=s=>isDark()?s.c:s.l;
  const geo=()=>{const pad=14,gap=W<460?6:10,bw=(W-pad*2-gap*(SKILLS.length-1))/SKILLS.length;return{pad,gap,bw};};
  cv.addEventListener('mousemove',e=>{
    const r=cv.getBoundingClientRect(),x=e.clientX-r.left,{pad,gap,bw}=geo();
    const i=Math.floor((x-pad)/(bw+gap));
    hover=i>=0&&i<SKILLS.length?i:-1;
    if(hover<0){tip.classList.remove('on');return;}
    const s=SKILLS[hover];
    tip.innerHTML=`<b style="color:${col(s)}">${s.n} · ${s.p}%</b><span>${s.tools}</span>`;
    tip.style.left=Math.min(Math.max(8,x-110),W-238)+'px';tip.classList.add('on');
  });
  cv.addEventListener('mouseleave',()=>{hover=-1;tip.classList.remove('on');});
  const M=u=>Math.abs(u)>1.2?0:Math.exp(-((u+0.42)**2)*26)+Math.exp(-((u-0.42)**2)*26)-0.75*Math.exp(-(u**2)*34);
  function frame(now){
    if(!cv.isConnected){ro.disconnect();return;}
    requestAnimationFrame(frame);
    if(!cv.offsetParent||!W)return;
    const t=FX.reduced?99:(now-start)/1000;
    g.clearRect(0,0,W,H);
    const scopeH=Math.round(H*0.3),top=scopeH+18,bottom=H-24,area=bottom-top;
    // scope graticule
    g.strokeStyle=FX.tok('--canvas-grid');g.lineWidth=1;
    for(let x=0;x<=W;x+=W/12){g.beginPath();g.moveTo(x,0);g.lineTo(x,scopeH);g.stroke();}
    for(let y=0;y<=scopeH;y+=scopeH/4){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
    // trace: carrier + the travelling M-pulse
    const mid=scopeH/2,A=scopeH*0.34,px=((t*0.32)%1.4)*W*1.1-W*0.2;
    g.beginPath();
    for(let x=0;x<=W;x+=2){
      const y=mid-A*(0.16*Math.sin(x*0.045-t*3)+0.08*Math.sin(x*0.13+t*1.7)+1.1*M((x-px)/52));
      x?g.lineTo(x,y):g.moveTo(x,y);
    }
    const red=FX.tok('--accent');
    g.strokeStyle=red;g.lineWidth=2;g.shadowColor=red;g.shadowBlur=isDark()?14:6;g.stroke();
    g.shadowBlur=0;g.strokeStyle=FX.tok('--trace-core');g.lineWidth=0.8;g.stroke();
    g.fillStyle=FX.tok('--text-faint');g.font='9px "JetBrains Mono", monospace';g.fillText('CH1  THE SIGNAL  200mV/div',8,scopeH-6);
    // bars
    const {pad,gap,bw}=geo(),SEG=20,segH=area/SEG;
    SKILLS.forEach((s,i)=>{
      const intro=Math.min(1,Math.max(0,(t-0.15-i*0.07)/0.9)),ease=1-Math.pow(1-intro,3);
      const jit=FX.reduced?0:(Math.sin(t*2.3+i*1.7)*0.02+Math.sin(t*5.3+i)*0.012);
      lv[i]=Math.max(0,(s.p/100+jit)*ease);
      pk[i]=Math.max(lv[i],pk[i]-0.0022);
      const x=pad+i*(bw+gap),lit=Math.round(lv[i]*SEG),on=hover===i;
      for(let k=0;k<SEG;k++){
        const y=bottom-(k+1)*segH+1.5;
        const hot=k>=SEG*0.85;
        g.fillStyle=k<lit?(hot?red:col(s)):FX.tok('--canvas-off');
        g.globalAlpha=k<lit?(on?1:0.62+0.38*(k/SEG)):1;
        if(k<lit&&on){g.shadowColor=col(s);g.shadowBlur=10;}
        g.fillRect(x,y,bw,segH-3);g.shadowBlur=0;
      }
      g.globalAlpha=1;
      const py=bottom-pk[i]*area;
      g.fillStyle=FX.tok('--peak');g.fillRect(x,py-2,bw,2);
      g.fillStyle=on?FX.tok('--text'):FX.tok('--text-dim');g.font=`600 ${W<460?9:10}px "JetBrains Mono", monospace`;g.textAlign='center';
      g.fillText(s.k,x+bw/2,H-8);
      g.fillStyle=col(s);g.fillText(Math.round(lv[i]*100)+'%',x+bw/2,py-7);
      g.textAlign='left';
    });
  }
  requestAnimationFrame(frame);
}

// Security: simulated probes are dropped at a layer of the defense
function mountSecurity(el){
  const svg=el.querySelector('.dd-svg'),layer=svg.querySelector('.dd-pk'),count=el.querySelector('.dd-count');
  const NS='http://www.w3.org/2000/svg';let dropped=0;
  el.querySelectorAll('[data-ring]').forEach(c=>{
    c.addEventListener('mouseenter',()=>svg.dataset.hl=c.dataset.ring);
    c.addEventListener('mouseleave',()=>delete svg.dataset.hl);
  });
  if(FX.reduced)return;
  const RINGS=[120,90,60];
  const spawn=()=>{
    if(!svg.isConnected)return clearInterval(timer);
    if(!svg.getBoundingClientRect().width)return;
    const a=Math.random()*Math.PI*2,stopAt=RINGS[Math.random()<0.62?0:Math.random()<0.8?1:2];
    const dot=document.createElementNS(NS,'circle');dot.setAttribute('r','3.2');dot.setAttribute('class','dd-atk');layer.appendChild(dot);
    const t0=performance.now(),R0=150,dur=900+Math.random()*500;
    const step=now=>{
      const p=Math.min(1,(now-t0)/dur),r=R0-(R0-stopAt)*p;
      dot.setAttribute('cx',140+Math.cos(a)*r);dot.setAttribute('cy',140+Math.sin(a)*r);
      if(p<1)return requestAnimationFrame(step);
      dot.remove();
      const x=140+Math.cos(a)*stopAt,y=140+Math.sin(a)*stopAt;
      const fl=document.createElementNS(NS,'circle');fl.setAttribute('cx',x);fl.setAttribute('cy',y);fl.setAttribute('r','3');fl.setAttribute('class','dd-hit');layer.appendChild(fl);
      const tx=document.createElementNS(NS,'text');tx.setAttribute('x',x);tx.setAttribute('y',y-8);tx.setAttribute('class','dd-drop');tx.textContent='DROP';layer.appendChild(tx);
      setTimeout(()=>{fl.remove();tx.remove();},900);
      count.textContent=++dropped;
    };
    requestAnimationFrame(step);
  };
  const timer=setInterval(spawn,850);spawn();
}

// ================ WINDOW MANAGEMENT ================
function winGeom(appId){
  const vw=window.innerWidth,vh=window.innerHeight-TASKBAR_H;
  if(vw<700)return{w:vw-12,h:vh-12,x:6,y:6};
  const pref={about:[680,620],projects:[800,640],skills:[720,620],security:[800,600],terminal:[680,460],contact:[560,560],inspector:[1040,660]}[appId]||[640,520];
  const w=Math.min(pref[0],vw-150),h=Math.min(pref[1],vh-32);
  const idx=S.windows.filter(w=>!w._removed).length;
  const x=Math.max(124,Math.round((vw-w)/2+40))+(idx%5)*26;
  const y=Math.max(14,Math.round((vh-h)/2-6))+(idx%5)*22;
  return{w,h,x:Math.min(x,vw-w-8),y:Math.min(y,vh-h-8)};
}
function iconRect(appId){const ic=document.querySelector(`.d-icon[data-app="${appId}"]`);return ic&&ic.offsetParent?ic.getBoundingClientRect():null;}
function tbRect(wid){const b=document.querySelector(`.tb-app[data-win="${wid}"]`);return b?b.getBoundingClientRect():null;}

function openApp(appId,from){
  const ex=S.windows.find(w=>w.appId===appId&&!w._removed);
  if(ex){
    if(ex.minimized){ex.minimized=false;focusWin(ex.id);render();FX.assemble(document.getElementById(ex.id),tbRect(ex.id));Inspector.capture({kind:'restore',app:appId});}
    else{focusWin(ex.id);render();}
    return;
  }
  const app=APPS.find(a=>a.id===appId);
  const id='w-'+(++S.winCtr);
  const g=winGeom(appId);
  S.windows.push({id,appId,name:app.name,color:app.color,x:g.x,y:g.y,w:g.w,h:g.h,minimized:false,maximized:false,_removed:false});
  focusWin(id);render();
  const el=document.getElementById(id);
  const src=from&&from.width!=null?from:iconRect(appId);
  FX.assemble(el,src).then(()=>{
    if(appId==='terminal'){const inp=document.getElementById('t-input');if(inp&&!isMobile)inp.focus();}
  });
  if(window.NetScene)NetScene.burst(appId,g.x+g.w/2,g.y+g.h/2);
  Inspector.capture({kind:'open',app:appId,size:(el&&el.innerHTML.length)||0});
  showToast(app.name,'GET /apps/'+appId+' → 200 OK',app.color);
}

function closeWin(id){
  const el=document.getElementById(id),w=S.windows.find(w=>w.id===id);
  if(!el||!w||el.dataset.closing)return;
  el.dataset.closing='1';
  Inspector.capture({kind:'close',app:w.appId});
  FX.disassemble(el,iconRect(w.appId)).then(()=>{
    w._removed=true;
    if(S.focused===id)S.focused=null;
    render();
  });
}
function minimizeWin(id){
  const w=S.windows.find(w=>w.id===id),el=document.getElementById(id);if(!w||!el||w.minimized)return;
  Inspector.capture({kind:'min',app:w.appId});
  FX.disassemble(el,tbRect(id)).then(()=>{w.minimized=true;el.style.visibility='';if(S.focused===id)S.focused=null;render();});
}
function maximizeWin(id){const w=S.windows.find(w=>w.id===id);if(w){w.maximized=!w.maximized;Inspector.capture({kind:'max',app:w.appId,on:w.maximized});render();}}
function toggleWin(id){
  const w=S.windows.find(w=>w.id===id);if(!w)return;
  if(w.minimized){openApp(w.appId);return;}
  if(S.focused===id){minimizeWin(id);return;}
  focusWin(id);render();
}
function focusWin(id){S.focused=id;S.nextZ++;}

function softFocusWin(id){
  if(S.focused===id)return;
  S.focused=id;S.nextZ++;
  document.querySelectorAll('#win-container .os-win').forEach(el=>{el.classList.remove('focused');el.style.zIndex=100;});
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
  S.drag={wid,ox:cx-w.x,oy:cy-w.y,moved:false};
  const onMove=ev=>{
    if(!S.drag)return;
    const mx=ev.touches?ev.touches[0].clientX:ev.clientX;
    const my=ev.touches?ev.touches[0].clientY:ev.clientY;
    w.x=Math.min(Math.max(mx-S.drag.ox,-w.w+80),window.innerWidth-80);w.y=Math.min(Math.max(0,my-S.drag.oy),window.innerHeight-TASKBAR_H-36);
    S.drag.moved=true;
    const el=document.getElementById(wid);
    if(el){el.style.left=w.x+'px';el.style.top=w.y+'px';}
  };
  const onUp=()=>{
    if(S.drag&&S.drag.moved)Inspector.capture({kind:'move',app:w.appId,x:Math.round(w.x),y:Math.round(w.y)});
    S.drag=null;document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);document.removeEventListener('touchmove',onMove);document.removeEventListener('touchend',onUp);
  };
  document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
  document.addEventListener('touchmove',onMove,{passive:false});document.addEventListener('touchend',onUp);
}

// ================ TERMINAL ================
const TERM={hist:[],hi:0};
const CMDS=['help','about','skills','projects','contact','whoami','neofetch','uptime','date','clear','ping','traceroute','nmap','tcpdump','wireshark','inspect','sudo','cv','open','theme','exit'];
function termPrint(html,cls='t-out'){
  const out=document.getElementById('t-out');if(!out)return false;
  const d=document.createElement('div');d.innerHTML=`<span class="${cls}">${html}</span>`;out.appendChild(d);
  out.parentElement.scrollTop=out.parentElement.scrollHeight;return true;
}
function handleTerm(e){
  const inp=e.target;
  if(e.key==='ArrowUp'||e.key==='ArrowDown'){
    e.preventDefault();if(!TERM.hist.length)return;
    TERM.hi=Math.max(0,Math.min(TERM.hist.length,TERM.hi+(e.key==='ArrowUp'?-1:1)));
    inp.value=TERM.hist[TERM.hi]||'';return;
  }
  if(e.key==='Tab'){
    e.preventDefault();const v=inp.value.trim().toLowerCase();if(!v)return;
    const m=CMDS.filter(c=>c.startsWith(v));
    if(m.length===1)inp.value=m[0]+' ';else if(m.length)termPrint(m.join('  '),'t-out t-dim');
    return;
  }
  if(e.key!=='Enter')return;
  const v=inp.value.trim();inp.value='';if(!v)return;
  TERM.hist.push(v);TERM.hi=TERM.hist.length;
  termPrint(`<span class="t-prompt">manaf@os:~$</span> <span class="t-cmd">${esc(v)}</span>`,'t-line');
  Inspector.capture({kind:'ssh',cmd:v});
  const r=runCmd(v);if(r)termPrint(r);
}
function runCmd(c){
  const [cmd,...args]=c.trim().split(/\s+/);const l=cmd.toLowerCase();const arg=args.join(' ');
  if(l==='help')return`<span class="t-hl">about</span> profile · <span class="t-hl">skills</span> · <span class="t-hl">projects</span> · <span class="t-hl">contact</span> · <span class="t-hl">cv</span><br><span class="t-hl">ping</span> [host] real RTT · <span class="t-hl">traceroute</span> manaf · <span class="t-hl">nmap</span> manaf<br><span class="t-hl">tcpdump</span> live capture · <span class="t-hl">open</span> &lt;app&gt; · <span class="t-hl">theme</span> [dark|light] · <span class="t-hl">whoami</span> · <span class="t-hl">neofetch</span> · <span class="t-hl">uptime</span> · <span class="t-hl">date</span> · <span class="t-hl">clear</span> · <span class="t-hl">exit</span><br><span class="t-dim">↑/↓ history · Tab completes</span>`;
  if(l==='about')return`Manaf Abduljabbar — Network Engineer @ KraftxLab<br>Network Security · Embedded Systems<br>Qatar University '24 · Doha, Qatar`;
  if(l==='skills')return SKILLS.map(s=>`[${'█'.repeat(Math.round(s.p/10))}${'░'.repeat(10-Math.round(s.p/10))}] ${s.n} ${s.p}%`).join('<br>');
  if(l==='projects')return PROJECTS.map((p,i)=>`${String(i+1).padStart(2,'0')} ${p.title} — <span class="t-dim">${p.tags.slice(0,2).join(', ')}</span>`).join('<br>')+`<br><span class="t-dim">+ more in the capture: </span><span class="t-hl">tcpdump</span>`;
  if(l==='contact')return`📧 man.abduljabbar@gmail.com<br>💼 linkedin.com/in/manaf101<br>🐙 github.com/txanonymousxt`;
  if(l==='whoami')return`visitor — guest@manafos (clearance: READ-ONLY)<br><span class="t-dim">the owner is manaf — network-engineer (clearance: FULL)</span>`;
  if(l==='neofetch')return`<span class="t-hl">   ╱╲  ╱╲     </span> <b>manaf</b>@manafos<br><span class="t-hl">  ╱  ╲╱  ╲    </span> OS: ManafOS v5.0 (packet-level)<br><span class="t-hl"> ╱        ╲   </span> Host: Doha, Qatar · Kernel: network-eng-2025.12<br><span class="t-hl">            </span>   Shell: ssh (captured) · GPU: WebGL ${window.NetScene&&NetScene.ready?'online':'offline'}<br><span class="t-hl">            </span>   Packets this session: ${Inspector.count()} · CPU: Networking@85%`;
  if(l==='uptime'){const s=Math.round(performance.now()/1000);return`ManafOS up ${Math.floor(s/60)}m ${s%60}s (this session), load: 0.42, 0.31, 0.28`;}
  if(l==='date')return new Date().toString()+`<br><span class="t-dim">Doha: ${new Date().toLocaleString('en-GB',{timeZone:'Asia/Qatar'})}</span>`;
  if(l==='clear'){document.getElementById('t-out').innerHTML='';return'';}
  if(l==='ping'){termPing(arg||'manaf');return'';}
  if(l==='traceroute'||l==='tracert'){termTrace();return'';}
  if(l==='nmap'){termNmap(arg||'manaf');return'';}
  if(l==='tcpdump'||l==='wireshark'||l==='inspect'){setTimeout(()=>Inspector.open({tab:'live'}),300);return`tcpdump: listening on manafos0, link-type EN10MB (Ethernet)<br><span class="t-dim">${Inspector.count()} packets captured so far · opening Packet Inspector…</span>`;}
  if(l==='sudo'){setTimeout(()=>showToast('Incident','visitor tried sudo · reported to manaf (just kidding)','var(--accent)'),400);return`[sudo] password for visitor: <span class="t-dim">********</span><br><span class="t-err">visitor is not in the sudoers file. This incident will be reported.</span>`;}
  if(l==='cv'){window.open('cv.pdf','_blank','noopener');return'Opening cv.pdf…';}
  if(l==='open'){const a=APPS.find(a=>a.id===arg.toLowerCase()||a.name.toLowerCase()===arg.toLowerCase());if(a){setTimeout(()=>openApp(a.id),200);return`opening ${a.name}…`;}return`open: unknown app. Try: ${APPS.map(a=>a.id).join(', ')}`;}
  if(l==='theme'){const want=arg.toLowerCase();const t=want==='dark'||want==='light'?want:(isDark()?'light':'dark');if((t==='dark')!==isDark())setTimeout(()=>toggleTheme(),150);return`theme → <span class="t-hl">${t}</span>`;}
  if(l==='exit'){const w=S.windows.find(w=>w.appId==='terminal'&&!w._removed);if(w)setTimeout(()=>closeWin(w.id),200);return'logout · Connection to manafos.local closed.';}
  return`Command not found: ${esc(c)}. Type <span class="t-hl">'help'</span>.`;
}
async function termPing(host){
  host=esc(host);
  termPrint(`PING ${host} (10.24.0.1) 56(84) bytes of data.`);
  const times=[];let real=false;
  for(let i=1;i<=4;i++){
    const rtt=await FX.measureRtt();real=rtt!=null;const t=real?rtt:0.3+Math.random();times.push(t);
    Inspector.capture({kind:'icmp',dir:'req',seq:i,target:host});
    Inspector.capture({kind:'icmp',dir:'rep',seq:i,target:host,ttl:64,time:t,real});
    if(!termPrint(`64 bytes from ${host} (10.24.0.1): icmp_seq=${i} ttl=64 time=${t.toFixed(1)} ms`))return;
    await FX.sleep(600);
  }
  const avg=times.reduce((a,b)=>a+b,0)/times.length;
  termPrint(`--- ${host} ping statistics ---<br>4 packets transmitted, 4 received, 0% packet loss<br>rtt min/avg/max = ${Math.min(...times).toFixed(1)}/${avg.toFixed(1)}/${Math.max(...times).toFixed(1)} ms <span class="t-dim">${real?'(real HTTP round trips to '+esc(location.hostname)+')':'(simulated: no server)'}</span>`);
}
async function termTrace(){
  termPrint('traceroute to manaf (10.24.0.1), 30 hops max, 60 byte packets');
  for(let i=0;i<HOPS.length;i++){
    await FX.sleep(380);
    const h=HOPS[i];
    if(!termPrint(`${String(i+1).padStart(2)}  <span class="t-hl">${h.host.padEnd(11).replace(/ /g,'&nbsp;')}</span> ${h.role} · ${h.org}  <span class="t-dim">${ym(h.from)} → ${h.to?ym(h.to):'now'} (${span(h.from,h.to)})</span>${h.to?'':' <span class="t-ok">★ you are here</span>'}`))return;
  }
}
async function termNmap(target){
  const ports=[['22/tcp','open','ssh','Linux · Ubuntu · Kali · Debian'],['53/udp','open','domain','DNS · DHCP troubleshooting'],['161/udp','open','snmp','SNMP · syslog monitoring'],['179/tcp','open','bgp','BGP · OSPF (multi-area) · EIGRP'],['443/tcp','open','https','React · Three.js · Webflow'],['500/udp','open','isakmp','VPN: site-to-site & remote access'],['1883/tcp','open','mqtt','ESP32 · Arduino · Raspberry Pi'],['8501/tcp','open','tf-serving','TensorFlow Lite · MobileNetV2'],['3389/tcp','filtered','ms-wbt','Active Directory · Windows Server']];
  termPrint(`Starting Nmap 7.95 · scanning ${esc(target)} (10.24.0.1)<br>Host is up (0.0004s latency).<br><span class="t-dim">PORT      STATE    SERVICE     VERSION</span>`);
  for(const [p,s,sv,v] of ports){
    await FX.sleep(140);
    if(!termPrint(`${p.padEnd(10).replace(/ /g,'&nbsp;')}<span class="${s==='open'?'t-ok':'t-dim'}">${s.padEnd(9).replace(/ /g,'&nbsp;')}</span>${sv.padEnd(12).replace(/ /g,'&nbsp;')}${v}`))return;
  }
  termPrint(`<span class="t-dim">Nmap done: 1 IP address (1 host up) scanned in 1.31 seconds</span>`);
}

// ================ NOTIFICATIONS ================
function showToast(title,msg,color){
  const c=document.getElementById('toasts');
  const t=document.createElement('div');t.className='toast';t.style.setProperty('--c',color||'var(--accent)');
  t.innerHTML=`<div class="toast-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h4l2-6 4 12 2-6h6"/></svg></div><div class="toast-text"><div class="tt-title">${title}</div><div class="tt-msg">${msg}</div></div>`;
  c.appendChild(t);
  while(c.children.length>3)c.firstChild.remove();
  setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),400);},2800);
}

// ================ CONTEXT MENU ================
let ctxAt={x:0,y:0};
document.addEventListener('contextmenu',e=>{
  if(e.target.closest('.os-win')||e.target.closest('.taskbar')||e.target.closest('.start-menu'))return;
  e.preventDefault();
  ctxAt={x:e.clientX,y:e.clientY};
  document.getElementById('ctx-theme-label').textContent=isDark()?'Switch to light mode':'Switch to dark mode';
  const m=document.getElementById('ctx-menu');
  m.style.left=Math.min(e.clientX,window.innerWidth-220)+'px';
  m.style.top=Math.min(e.clientY,window.innerHeight-230)+'px';
  m.classList.add('show');
});
document.addEventListener('click',()=>document.getElementById('ctx-menu').classList.remove('show'));
function ctxAction(a){
  document.getElementById('ctx-menu').classList.remove('show');
  if(a==='terminal')openApp('terminal');
  if(a==='inspector')openApp('inspector');
  if(a==='ping')FX.ping(ctxAt.x,ctxAt.y);
  if(a==='about')showToast('ManafOS v5.0','Built by Manaf Abduljabbar · Doha, Qatar','var(--accent)');
  if(a==='theme')toggleTheme(null,ctxAt);
  if(a==='refresh'){showToast('Desktop','Re-announcing routes…','var(--cyan)');revealIcons();}
}

// ================ PING THE NETWORK ================
document.getElementById('desktop').addEventListener('click',e=>{
  if(e.target.closest('.os-win,.taskbar,.start-menu,.d-icon,.hud,.desktop-tips'))return;
  if(S.startOpen||document.getElementById('ctx-menu').classList.contains('show'))return;
  FX.ping(e.clientX,e.clientY);
});

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
      el.dataset.app=w.appId;
      el.style.setProperty('--c',w.color);
      el.innerHTML=`
        <div class="win-bar" onmousedown="startDrag(event,'${w.id}')" ontouchstart="startDrag(event,'${w.id}')" ondblclick="if(!event.target.closest('.traffic'))maximizeWin('${w.id}')">
          <div class="traffic"><button class="tl tl-c" data-action="close" data-win="${w.id}" aria-label="Close"></button><button class="tl tl-m" data-action="minimize" data-win="${w.id}" aria-label="Minimize"></button><button class="tl tl-x" data-action="maximize" data-win="${w.id}" aria-label="Maximize"></button></div>
          <div class="win-title"><span class="wt-name">${w.name}</span><span class="wt-state"><i></i><b class="st-est">ESTABLISHED</b><b class="st-ack">ACK · REASSEMBLED</b></span></div>
          <svg class="wt-sig" viewBox="0 0 64 16" aria-hidden="true"><polyline points="0,8 8,8 12,3 16,13 20,2 24,14 28,5 32,8 40,8 44,3 48,13 52,2 56,14 60,5 64,8"/></svg>
        </div>
        <div class="win-body${w.appId==='inspector'||w.appId==='terminal'?' flush':''}${w.appId==='terminal'?' term':''}">${getContent(w.appId)}</div>`;
      c.appendChild(el);
      mountApp(w.appId,el);
    }

    const cls=['os-win'];
    if(w.id===S.focused)cls.push('focused');
    if(w.minimized)cls.push('minimized');
    if(w.maximized)cls.push('maximized');
    if(el.classList.contains('ack'))cls.push('ack');
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

  if(S.focused&&!isMobile){
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
// touch screens fire click without mousedown on some browsers
document.getElementById('win-container').addEventListener('click',e=>{
  const btn=e.target.closest('.tl[data-action]');
  if(btn&&e.detail===0){const wid=btn.dataset.win,a=btn.dataset.action;if(a==='close')closeWin(wid);else if(a==='minimize')minimizeWin(wid);else maximizeWin(wid);}
});

document.addEventListener('click',e=>{
  if(S.startOpen&&!e.target.closest('.start-menu')&&!e.target.closest('.start-btn')){S.startOpen=false;renderStart();}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(S.startOpen){S.startOpen=false;renderStart();}document.getElementById('ctx-menu').classList.remove('show');}
});

setInterval(renderTaskbar,30000);

// keep windows inside the viewport when the browser is resized
let fitT=0;
window.addEventListener('resize',()=>{clearTimeout(fitT);fitT=setTimeout(()=>{
  const vw=window.innerWidth,vh=window.innerHeight-TASKBAR_H;
  S.windows.filter(w=>!w._removed).forEach(w=>{
    const g=winGeom(w.appId);
    if(vw<700){Object.assign(w,{x:g.x,y:g.y,w:g.w,h:g.h});return;}
    if(w.w<g.w*0.75||w.w>vw-12){w.w=g.w;w.h=g.h;}
    w.h=Math.min(w.h,vh-12);
    w.x=Math.min(Math.max(w.x,0),Math.max(0,vw-w.w-6));
    w.y=Math.min(Math.max(w.y,0),Math.max(0,vh-w.h-6));
  });
  renderWindows();
},150);});

// ================ WELCOME GUIDE ================
let welcomeShown = false;

function showWelcomeGuide() {
  welcomeShown = true;
  const guide = document.getElementById('welcome-guide');
  if (!guide) return;
  setTimeout(() => guide.classList.add('visible'), 500);
  document.querySelectorAll('.d-icon.show').forEach(icon => icon.classList.add('hint-pulse'));
  setTimeout(() => {
    const tbHint = document.getElementById('taskbar-hint');
    if (tbHint && welcomeShown) tbHint.classList.add('visible');
  }, 1100);
}

function dismissWelcome() {
  const guide = document.getElementById('welcome-guide');
  if (!guide) return;
  guide.classList.remove('visible');
  guide.classList.add('hiding');
  document.querySelectorAll('.d-icon.hint-pulse').forEach(icon => icon.classList.remove('hint-pulse'));
  const tbHint = document.getElementById('taskbar-hint');
  if (tbHint) tbHint.classList.remove('visible');
  welcomeShown = false;
  setTimeout(() => guide.classList.remove('hiding'), 700);
  setTimeout(showDesktopTips, 900);
  // Auto-open About Me to give immediate content
  setTimeout(() => { openApp('about'); }, 380);
}

// ================ PERSISTENT DESKTOP TIPS ================
function showDesktopTips() {
  if (document.getElementById('desktop-tips')) return;
  const tips = document.createElement('div');
  tips.id = 'desktop-tips';
  tips.className = 'desktop-tips';
  tips.innerHTML = `
    <div class="desktop-tip" style="--delay:0s"><span class="tip-k">click</span><span>empty space to ping</span></div>
    <div class="tip-divider">·</div>
    <div class="desktop-tip" style="--delay:0.1s"><span class="tip-k">filter</span><span>my career in Packet Inspector</span></div>
    <div class="tip-divider">·</div>
    <div class="desktop-tip" style="--delay:0.2s"><span class="tip-k">nmap</span><span>me from the Terminal</span></div>
    <button class="tips-close" onclick="hideDesktopTips()" title="Hide tips">✕</button>
  `;
  document.getElementById('desktop').appendChild(tips);
  requestAnimationFrame(() => tips.classList.add('visible'));
  setTimeout(() => { if (tips.classList.contains('visible')) hideDesktopTips(); }, 15000);
}

function hideDesktopTips() {
  const tips = document.getElementById('desktop-tips');
  if (tips) {
    tips.classList.remove('visible');
    tips.classList.add('hiding');
    setTimeout(() => tips.remove(), 600);
  }
}

// ================ INIT ================
renderIcons();
renderHud();
render();
FX.boot(() => {
  document.getElementById('boot').classList.add('out');
  document.getElementById('desktop').classList.add('on');
  FX.powerOn(document.getElementById('desktop'));
  setTimeout(() => document.getElementById('boot').remove(), 900);
  revealIcons();
  setTimeout(() => showToast('Session established', 'Every click is now a packet. Inspect them anytime.', 'var(--cyan)'), 700);
  // Show Welcome Guide after boot — every time
  setTimeout(showWelcomeGuide, 900);
});
