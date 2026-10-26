// ================ LIVING TOPOLOGY — WebGL wallpaper ================
// Manaf's skills as a 3D network. Packets are animated on the GPU; bursts,
// pings and highlights are driven from the OS through window.NetScene.
// Two looks: light (soft pastel aurora, normal blending) and dark (additive glow).
import * as THREE from 'three';

const canvas = document.getElementById('net-canvas');
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Deterministic layout so the network looks the same on every visit
function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
const rand = rng(1604);

const HUB = { name: 'MANAF', color: '#ff1a4d', light: '#df0139', app: 'about' };
const CLUSTERS = [
  { id: 'net', name: 'NETWORKING', color: '#4fd8ff', light: '#0b8fb0', app: 'inspector', pos: [-330, 120, -40],
    leaves: ['OSPF', 'BGP', 'EIGRP', 'VLAN', 'STP', 'EtherChannel', 'DHCP', 'DNS', 'NAT/PAT', 'TCP/IP', 'SNMP', 'syslog', 'Packet Tracer', 'Cisco CME'] },
  { id: 'sec', name: 'SECURITY', color: '#ff2d55', light: '#e11d48', app: 'security', pos: [320, 150, -120],
    leaves: ['nftables', 'Suricata', 'Snort', 'Firewalls', 'ACLs', 'VPN', 'IDS/IPS', 'SIEM', 'Zero Trust', 'SSCP', 'Redoubt', 'Nmap'] },
  { id: 'emb', name: 'EMBEDDED', color: '#f5a524', light: '#d97706', app: 'projects', pos: [-270, -180, 70],
    leaves: ['ESP32-C6', 'Arduino', 'Raspberry Pi', 'MPU6050', 'MAX30102', 'L298N', 'Servos', 'PD Control', 'Firmware', '3D Printing', 'Sensors'] },
  { id: 'ml', name: 'EDGE AI', color: '#a78bfa', light: '#7c3aed', app: 'skills', pos: [330, -160, 20],
    leaves: ['TF Lite', 'MobileNetV2', 'Deep Learning', 'Python', 'OpenCV', 'Inference', 'Data Pipelines'] },
  { id: 'web', name: 'WEB', color: '#3b82f6', light: '#2563eb', app: 'contact', pos: [40, 270, -280],
    leaves: ['React', 'Three.js', 'Webflow', 'JavaScript', 'UI/UX', 'WebGL'] },
  { id: 'infra', name: 'INFRA', color: '#22c55e', light: '#16a34a', app: 'terminal', pos: [20, -280, -240],
    leaves: ['Linux', 'Debian', 'Kali', 'VMware', 'Active Directory', 'Windows Server', 'M365', 'Bash'] },
];
const CROSS = [
  ['nftables', 'Linux'], ['Suricata', 'Debian'], ['ESP32-C6', 'TF Lite'], ['Raspberry Pi', 'MobileNetV2'],
  ['SNMP', 'Linux'], ['VPN', 'TCP/IP'], ['Python', 'Raspberry Pi'], ['Redoubt', 'OSPF'], ['Sensors', 'Inference'],
  ['VLAN', 'Firewalls'], ['DNS', 'Active Directory'], ['Three.js', 'Firmware'], ['Bash', 'Python'], ['ACLs', 'NAT/PAT'],
];
const CORE_LINKS = [['net', 'sec'], ['sec', 'ml'], ['ml', 'emb'], ['emb', 'net'], ['web', 'net'], ['web', 'sec'], ['infra', 'emb'], ['infra', 'ml']];
const clusterInfo = () => CLUSTERS.map(({ id, name, color, light, app }) => ({ id, name, color, light, app }));

try {
  build();
} catch (err) {
  console.warn('[NetScene] WebGL unavailable, using static wallpaper.', err);
  document.body.classList.add('no-webgl');
  window.NetScene = { ready: false, highlight() {}, burst() {}, flash() {}, setTheme() {}, ping: () => null, stats: { nodes: 0, links: 0 }, clusters: clusterInfo() };
  window.dispatchEvent(new CustomEvent('netscene:ready'));
}

function build() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false, powerPreference: 'high-performance' });
  if (!renderer.getContext()) throw new Error('no context');
  const DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);
  renderer.setPixelRatio(DPR);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 1, 5000);
  camera.position.set(0, 0, isMobile ? 980 : 760);
  const group = new THREE.Group();
  scene.add(group);
  let light = document.documentElement.dataset.theme !== 'dark';

  // ---------- graph ----------
  const nodes = [];   // {name, cluster, pos, size, relay, core}
  const edges = [];   // [a, b, clusterIndex]
  const byName = new Map();
  const addNode = (n) => { n.i = nodes.length; nodes.push(n); if (n.name) byName.set(n.name, n.i); return n.i; };
  const color = (hex) => new THREE.Color(hex);

  const hub = addNode({ name: HUB.name, cluster: -1, pos: new THREE.Vector3(0, 0, 0), size: 30, core: true, app: HUB.app });
  const leafCount = isMobile ? 7 : 99;
  CLUSTERS.forEach((c, ci) => {
    const center = new THREE.Vector3(...c.pos);
    if (isMobile) center.multiply(new THREE.Vector3(0.55, 1.15, 1));
    c.core = addNode({ name: c.name, cluster: ci, pos: center, size: 24, core: true, app: c.app });
    edges.push([hub, c.core, ci]);
    const leaves = [];
    c.leaves.slice(0, leafCount).forEach((name) => {
      const dir = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize();
      const p = center.clone().add(dir.multiplyScalar(70 + rand() * 95));
      const li = addNode({ name, cluster: ci, pos: p, size: 9 + rand() * 5, core: false });
      leaves.push(li);
      edges.push([c.core, li, ci]);
    });
    // unnamed relay nodes give the mesh texture
    for (let k = 0; k < (isMobile ? 2 : 5); k++) {
      const dir = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize();
      const p = center.clone().add(dir.multiplyScalar(140 + rand() * 90));
      const ri = addNode({ name: '', cluster: ci, pos: p, size: 4 + rand() * 3, core: false, relay: true });
      const a = leaves[Math.floor(rand() * leaves.length)];
      edges.push([a, ri, ci]);
      leaves.push(ri);
    }
    // nearest-neighbour links inside the cluster
    leaves.forEach((li) => {
      let best = -1, bd = Infinity;
      leaves.forEach((lj) => { if (lj === li) return; const d = nodes[li].pos.distanceToSquared(nodes[lj].pos); if (d < bd) { bd = d; best = lj; } });
      if (best >= 0 && !edges.some(([a, b]) => (a === li && b === best) || (a === best && b === li))) edges.push([li, best, ci]);
    });
  });
  CORE_LINKS.forEach(([a, b]) => {
    const A = CLUSTERS.find((c) => c.id === a), B = CLUSTERS.find((c) => c.id === b);
    edges.push([A.core, B.core, -1]);
  });
  CROSS.forEach(([a, b]) => { if (byName.has(a) && byName.has(b)) edges.push([byName.get(a), byName.get(b), -1]); });

  const adj = nodes.map(() => []);
  edges.forEach(([a, b], ei) => { adj[a].push([b, ei]); adj[b].push([a, ei]); });

  // theme-aware colours
  const hexOf = (ci) => (ci < 0 ? (light ? HUB.light : HUB.color) : (light ? CLUSTERS[ci].light : CLUSTERS[ci].color));
  const nodeColor = (n) => { const c = color(hexOf(n.cluster)); return n.relay ? c.lerp(color(light ? '#8b90a6' : '#ffffff'), 0.3) : c; };

  // ---------- shared uniforms ----------
  const U = {
    uTime: { value: 0 }, uPR: { value: DPR }, uHL: { value: -1 }, uHLAmt: { value: 0 }, uBoost: { value: 0 },
    uFar: { value: 2000 }, uNear: { value: 380 }, uLight: { value: light ? 1 : 0 }, uRes: { value: new THREE.Vector2(1, 1) },
  };
  const glowMats = [];
  const mat = (opts) => { const m = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, ...opts }); glowMats.push(m); return m; };

  // ---------- aurora background (full-screen quad) ----------
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: U, depthTest: false, depthWrite: false,
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      uniform float uTime, uLight; uniform vec2 uRes;
      float blob(vec2 uv, vec2 c, float r){ vec2 d = (uv - c) * vec2(uRes.x / uRes.y, 1.0); return exp(-dot(d, d) / (r * r)); }
      void main(){
        vec2 uv = gl_FragCoord.xy / uRes;
        float t = uTime * 0.05;
        vec2 p1 = vec2(0.12 + 0.08 * sin(t * 1.3), 0.18 + 0.06 * cos(t));
        vec2 p2 = vec2(0.86 + 0.06 * cos(t * 0.9), 0.82 + 0.07 * sin(t * 1.1));
        vec2 p3 = vec2(0.62 + 0.10 * sin(t * 0.7 + 1.0), 0.42 + 0.08 * cos(t * 1.4));
        vec2 p4 = vec2(0.30 + 0.07 * cos(t * 1.2 + 2.0), 0.88 + 0.05 * sin(t * 0.8));
        vec3 col;
        if (uLight > 0.5) {
          col = mix(vec3(0.976, 0.965, 0.949), vec3(0.957, 0.953, 0.968), uv.y);
          col = mix(col, vec3(1.0, 0.855, 0.800), 0.55 * blob(uv, p1, 0.42));   // peach
          col = mix(col, vec3(0.815, 0.905, 1.0), 0.60 * blob(uv, p2, 0.46));   // sky
          col = mix(col, vec3(0.895, 0.870, 1.0), 0.45 * blob(uv, p3, 0.38));   // lavender
          col = mix(col, vec3(0.850, 0.960, 0.905), 0.45 * blob(uv, p4, 0.34)); // mint
        } else {
          col = vec3(0.024, 0.027, 0.043);
          col += vec3(0.20, 0.01, 0.05) * blob(uv, p1, 0.45);
          col += vec3(0.00, 0.09, 0.13) * blob(uv, p2, 0.50);
          col += vec3(0.06, 0.03, 0.12) * blob(uv, p3, 0.35);
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
  }));
  bg.frustumCulled = false; bg.renderOrder = -10;
  scene.add(bg);

  // ---------- node points ----------
  const N = nodes.length;
  const nPos = new Float32Array(N * 3), nCol = new Float32Array(N * 3), nSize = new Float32Array(N),
    nClu = new Float32Array(N), nPhase = new Float32Array(N), nFlash = new Float32Array(N);
  nodes.forEach((n, i) => { n.pos.toArray(nPos, i * 3); nSize[i] = n.size; nClu[i] = n.cluster; nPhase[i] = rand() * 6.28; });
  const nGeo = new THREE.BufferGeometry();
  nGeo.setAttribute('position', new THREE.BufferAttribute(nPos, 3));
  const nColAttr = new THREE.BufferAttribute(nCol, 3);
  nGeo.setAttribute('aColor', nColAttr);
  nGeo.setAttribute('aSize', new THREE.BufferAttribute(nSize, 1));
  nGeo.setAttribute('aCluster', new THREE.BufferAttribute(nClu, 1));
  nGeo.setAttribute('aPhase', new THREE.BufferAttribute(nPhase, 1));
  const nFlashAttr = new THREE.BufferAttribute(nFlash, 1); nFlashAttr.setUsage(THREE.DynamicDrawUsage);
  nGeo.setAttribute('aFlash', nFlashAttr);
  group.add(new THREE.Points(nGeo, mat({
    vertexShader: `
      attribute vec3 aColor; attribute float aSize; attribute float aCluster; attribute float aPhase; attribute float aFlash;
      uniform float uTime, uPR, uHL, uHLAmt, uBoost, uFar, uNear;
      varying vec3 vColor; varying float vAlpha; varying float vFlash;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float on = (uHL > -0.5 && abs(aCluster - uHL) < 0.5) ? uHLAmt : 0.0;
        float dim = (uHL > -0.5 && on == 0.0 && aCluster > -0.5) ? (1.0 - 0.6 * uHLAmt) : 1.0;
        float pulse = 0.86 + 0.14 * sin(uTime * 1.7 + aPhase);
        float s = aSize * pulse * (1.0 + on * 0.55 + aFlash * 1.3 + uBoost * 0.25);
        gl_PointSize = s * uPR * (480.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
        vColor = aColor;
        vAlpha = smoothstep(uFar, uNear, -mv.z) * dim * (0.8 + on * 0.6);
        vFlash = aFlash;
      }`,
    fragmentShader: `
      uniform float uLight;
      varying vec3 vColor; varying float vAlpha; varying float vFlash;
      void main(){
        vec2 c = gl_PointCoord - 0.5; float d = length(c);
        float core = smoothstep(0.11, 0.0, d);
        float halo = exp(-d * d * 30.0) * 0.6;
        float ring = smoothstep(0.018, 0.0, abs(d - 0.34)) * 0.22;
        if (uLight > 0.5) {
          float a = (core * 0.95 + halo * 0.55 + ring * 1.6 + vFlash * halo * 0.8) * vAlpha;
          if (a < 0.004) discard;
          vec3 col = mix(vColor, vec3(1.0), smoothstep(0.05, 0.0, d) * 0.55);
          gl_FragColor = vec4(col, min(a, 1.0));
          return;
        }
        vec3 col = vColor * (halo + ring) * 1.2 + vec3(1.0) * core * 0.95 + vec3(1.0) * vFlash * halo * 1.4;
        float a = (core + halo + ring) * vAlpha;
        if (a < 0.004) discard;
        gl_FragColor = vec4(col * vAlpha, a);
      }`,
  })));

  // ---------- edges with GPU comets ----------
  const E = edges.length;
  const ePos = new Float32Array(E * 6), eT = new Float32Array(E * 2), eSeed = new Float32Array(E * 2),
    eClu = new Float32Array(E * 2), eCol = new Float32Array(E * 6), eFlash = new Float32Array(E * 2);
  const edgeSeed = [];
  edges.forEach(([a, b, ci], i) => {
    nodes[a].pos.toArray(ePos, i * 6); nodes[b].pos.toArray(ePos, i * 6 + 3);
    eT[i * 2] = 0; eT[i * 2 + 1] = 1;
    const s = rand(); edgeSeed.push(s);
    eSeed[i * 2] = eSeed[i * 2 + 1] = s;
    eClu[i * 2] = eClu[i * 2 + 1] = ci;
  });
  const eGeo = new THREE.BufferGeometry();
  eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  eGeo.setAttribute('aT', new THREE.BufferAttribute(eT, 1));
  eGeo.setAttribute('aSeed', new THREE.BufferAttribute(eSeed, 1));
  eGeo.setAttribute('aCluster', new THREE.BufferAttribute(eClu, 1));
  const eColAttr = new THREE.BufferAttribute(eCol, 3);
  eGeo.setAttribute('aColor', eColAttr);
  const eFlashAttr = new THREE.BufferAttribute(eFlash, 1); eFlashAttr.setUsage(THREE.DynamicDrawUsage);
  eGeo.setAttribute('aFlash', eFlashAttr);
  // packet position along an edge — shared by the line comet and the packet head
  const PKT_GLSL = `
    float pktPhase(float seed, float t){ return fract(t * (0.07 + seed * 0.15) + seed * 7.31); }
    float pktDir(float seed, float x){ return seed > 0.5 ? x : 1.0 - x; }`;
  group.add(new THREE.LineSegments(eGeo, mat({
    vertexShader: `
      attribute float aT; attribute float aSeed; attribute float aCluster; attribute vec3 aColor; attribute float aFlash;
      uniform float uHL, uHLAmt, uFar, uNear;
      varying float vT; varying float vSeed; varying float vOn; varying float vDim; varying float vDepth; varying vec3 vColor; varying float vFlash;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        vT = aT; vSeed = aSeed; vColor = aColor; vFlash = aFlash;
        vOn = (uHL > -0.5 && abs(aCluster - uHL) < 0.5) ? uHLAmt : 0.0;
        vDim = (uHL > -0.5 && vOn == 0.0) ? (1.0 - 0.6 * uHLAmt) : 1.0;
        vDepth = smoothstep(uFar + 100.0, uNear - 80.0, -mv.z);
      }`,
    fragmentShader: `
      uniform float uTime, uBoost, uLight;
      varying float vT; varying float vSeed; varying float vOn; varying float vDim; varying float vDepth; varying vec3 vColor; varying float vFlash;
      ${PKT_GLSL}
      void main(){
        float speedUp = 1.0 + vOn * 1.6;
        float p = pktPhase(vSeed, uTime * speedUp);
        float x = pktDir(vSeed, vT);
        float behind = p - x;
        float tail = behind >= 0.0 ? exp(-behind * 16.0) : 0.0;
        if (uLight > 0.5) {
          float a = (0.13 + vOn * 0.3 + uBoost * 0.1 + tail * (0.7 + vOn * 0.3) + vFlash) * vDepth * vDim;
          gl_FragColor = vec4(vColor, min(a, 1.0));
          return;
        }
        float base = 0.075 + vOn * 0.2 + uBoost * 0.12;
        vec3 col = vColor * (base + tail * (0.65 + vOn)) + vec3(1.0) * pow(tail, 8.0) * 0.4 + vColor * vFlash * 1.1;
        gl_FragColor = vec4(col * vDepth * vDim, 1.0);
      }`,
  })));

  // packet heads (glowing dots riding the comets)
  const pA = new Float32Array(E * 3), pB = new Float32Array(E * 3), pSeed = new Float32Array(E), pCol = new Float32Array(E * 3), pClu = new Float32Array(E);
  edges.forEach(([a, b, ci], i) => { nodes[a].pos.toArray(pA, i * 3); nodes[b].pos.toArray(pB, i * 3); pSeed[i] = edgeSeed[i]; pClu[i] = ci; });
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pA, 3));
  pGeo.setAttribute('aB', new THREE.BufferAttribute(pB, 3));
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(pSeed, 1));
  const pColAttr = new THREE.BufferAttribute(pCol, 3);
  pGeo.setAttribute('aColor', pColAttr);
  pGeo.setAttribute('aCluster', new THREE.BufferAttribute(pClu, 1));
  const pkts = new THREE.Points(pGeo, mat({
    vertexShader: `
      attribute vec3 aB; attribute float aSeed; attribute vec3 aColor; attribute float aCluster;
      uniform float uTime, uPR, uHL, uHLAmt, uFar, uNear;
      varying vec3 vColor; varying float vA;
      ${PKT_GLSL}
      void main(){
        float on = (uHL > -0.5 && abs(aCluster - uHL) < 0.5) ? uHLAmt : 0.0;
        float p = pktPhase(aSeed, uTime * (1.0 + on * 1.6));
        float x = aSeed > 0.5 ? p : 1.0 - p;
        vec3 pos = mix(position, aB, x);
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (5.5 + on * 4.0) * uPR * (480.0 / -mv.z);
        float dim = (uHL > -0.5 && on == 0.0) ? (1.0 - 0.6 * uHLAmt) : 1.0;
        vColor = aColor; vA = smoothstep(uFar + 100.0, uNear - 80.0, -mv.z) * dim;
      }`,
    fragmentShader: `
      uniform float uLight;
      varying vec3 vColor; varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float g = exp(-d * d * 22.0);
        if (g < 0.01) discard;
        if (uLight > 0.5) { gl_FragColor = vec4(vColor, smoothstep(0.5, 0.15, d) * vA); return; }
        gl_FragColor = vec4((vColor * 0.9 + vec3(0.6) * smoothstep(0.15, 0.0, d)) * g * vA, g);
      }`,
  }));
  pkts.frustumCulled = false;
  group.add(pkts);

  // ---------- orbit rings around the hub ----------
  const orbitMats = [];
  [[260, 0.9, 0.2], [420, 1.25, -0.35]].forEach(([r, tilt, spin]) => {
    const pts = [];
    for (let k = 0; k <= 160; k++) { const a = k / 160 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
    const m = new THREE.LineBasicMaterial({ transparent: true, depthWrite: false });
    orbitMats.push(m);
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), m);
    ring.rotation.x = tilt; ring.userData.spin = spin;
    group.add(ring);
  });

  // ---------- dust ----------
  const D = isMobile ? 450 : 1400;
  const dPos = new Float32Array(D * 3), dSeed = new Float32Array(D);
  for (let i = 0; i < D; i++) {
    dPos[i * 3] = (rand() * 2 - 1) * 1600; dPos[i * 3 + 1] = (rand() * 2 - 1) * 1000; dPos[i * 3 + 2] = -1700 + rand() * 2200;
    dSeed[i] = rand();
  }
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dGeo.setAttribute('aSeed', new THREE.BufferAttribute(dSeed, 1));
  const dust = new THREE.Points(dGeo, mat({
    vertexShader: `
      attribute float aSeed; uniform float uTime, uPR, uFar, uNear; varying float vA;
      void main(){
        vec3 p = position; p.y = mod(position.y + 1000.0 + uTime * (6.0 + aSeed * 10.0), 2000.0) - 1000.0;
        p.x += sin(uTime * 0.2 + aSeed * 40.0) * 20.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.0 + aSeed * 2.2) * uPR * (500.0 / -mv.z);
        vA = smoothstep(uFar + 400.0, uNear - 180.0, -mv.z) * smoothstep(1000.0, 850.0, abs(p.y)) * (0.45 + 0.17 * sin(uTime + aSeed * 30.0));
      }`,
    fragmentShader: `
      uniform float uLight; varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5); float g = smoothstep(0.5, 0.0, d);
        if (uLight > 0.5) { gl_FragColor = vec4(vec3(0.45, 0.47, 0.6), g * vA * 0.5); return; }
        gl_FragColor = vec4(vec3(0.62, 0.68, 0.85) * g * vA, g);
      }`,
  }));
  dust.frustumCulled = false;
  scene.add(dust);

  // ---------- labels ----------
  function labelSprite(text, hex, px, opacity) {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    const font = `600 ${px}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.font = font;
    const w = Math.ceil(ctx.measureText(text).width + px * 1.4), h = Math.ceil(px * 1.9);
    c.width = w; c.height = h;
    ctx.font = font; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    if (light) {
      ctx.lineWidth = px * 0.28; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.strokeText(text, w / 2, h / 2);
      ctx.fillStyle = hex; ctx.fillText(text, w / 2, h / 2);
    } else {
      ctx.shadowColor = hex; ctx.shadowBlur = px * 0.6;
      ctx.fillStyle = hex; ctx.fillText(text, w / 2, h / 2);
      ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fillText(text, w / 2, h / 2);
    }
    const tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter; tex.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity, depthWrite: false }));
    const k = px === 30 ? 0.62 : 0.5;
    s.scale.set(w * k, h * k, 1);
    return s;
  }
  let coreLabels = [], leafLabels = [], fontsReady = false;
  const mkLabels = () => {
    [...coreLabels, ...leafLabels].forEach((s) => { group.remove(s); s.material.map.dispose(); s.material.dispose(); });
    coreLabels = []; leafLabels = [];
    nodes.forEach((n) => {
      if (!n.name) return;
      if (n.core) {
        const s = labelSprite(n.name, hexOf(n.cluster), 30, 0.78);
        s.position.copy(n.pos).add(new THREE.Vector3(0, n.size + 16, 0));
        s.userData.cluster = n.cluster; group.add(s); coreLabels.push(s);
      } else if (!isMobile) {
        const s = labelSprite(n.name, hexOf(n.cluster), 22, 0);
        s.position.copy(n.pos).add(new THREE.Vector3(0, n.size + 10, 0));
        s.userData.cluster = n.cluster; s.userData.node = n.i; group.add(s); leafLabels.push(s);
      }
    });
  };
  // wait for the mono font so canvas labels don't fall back to a system face
  (document.fonts && document.fonts.load ? document.fonts.load('600 30px "JetBrains Mono"').catch(() => {}) : Promise.resolve()).then(() => { fontsReady = true; mkLabels(); kick(); });

  // ---------- bursts & shockwaves (CPU-driven, pooled) ----------
  const MAXB = 6, TRAIL = 18;
  const bPos = new Float32Array(MAXB * TRAIL * 3), bAlpha = new Float32Array(MAXB * TRAIL), bCol = new Float32Array(MAXB * TRAIL * 3);
  const bGeo = new THREE.BufferGeometry();
  const bPosAttr = new THREE.BufferAttribute(bPos, 3).setUsage(THREE.DynamicDrawUsage);
  const bAlphaAttr = new THREE.BufferAttribute(bAlpha, 1).setUsage(THREE.DynamicDrawUsage);
  const bColAttr = new THREE.BufferAttribute(bCol, 3).setUsage(THREE.DynamicDrawUsage);
  bGeo.setAttribute('position', bPosAttr); bGeo.setAttribute('aAlpha', bAlphaAttr); bGeo.setAttribute('aColor', bColAttr);
  const bPts = new THREE.Points(bGeo, mat({
    vertexShader: `attribute float aAlpha; attribute vec3 aColor; uniform float uPR; varying float vA; varying vec3 vC;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = (6.0 + aAlpha * 18.0) * uPR * (420.0 / -mv.z); vA = aAlpha; vC = aColor; }`,
    fragmentShader: `uniform float uLight; varying float vA; varying vec3 vC;
      void main(){ float d = length(gl_PointCoord-0.5); float g = exp(-d*d*20.0); if(g<0.01||vA<0.01) discard;
        if (uLight > 0.5) { gl_FragColor = vec4(vC, g * vA); return; }
        gl_FragColor = vec4((vC + vec3(0.5)*smoothstep(0.2,0.0,d)) * g * vA, g); }`,
  }));
  bPts.frustumCulled = false;
  scene.add(bPts);
  const bursts = [];
  const rings = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 72), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    m.visible = false; m.userData = { t0: 0, life: 0, max: 1 }; scene.add(m); rings.push(m);
  }
  const spawnRing = (pos, col, maxR = 160) => {
    const r = rings.find((m) => !m.visible) || rings[0];
    r.position.copy(pos); r.material.color.set(col); r.visible = true;
    r.userData = { t0: clock, life: 1.1, max: maxR };
  };

  // ---------- theme ----------
  function paint() {
    renderer.setClearColor(light ? 0xf6f4f0 : 0x06070b, 1);
    U.uLight.value = light ? 1 : 0;
    const blend = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    [...glowMats, ...rings.map((r) => r.material), ...orbitMats].forEach((m) => { m.blending = blend; m.needsUpdate = true; });
    orbitMats.forEach((m) => { m.color.set(light ? '#df0139' : '#ff1a4d'); m.opacity = light ? 0.12 : 0.07; });
    nodes.forEach((n, i) => nodeColor(n).toArray(nCol, i * 3));
    nColAttr.needsUpdate = true;
    const red = color(light ? '#df0139' : '#ff1a4d');
    edges.forEach(([, , ci], i) => {
      const c = ci >= 0 ? color(hexOf(ci)) : red.clone();
      if (ci >= 0 && edgeSeed[i] > 0.72) c.lerp(red, 0.7);
      c.toArray(eCol, i * 6); c.toArray(eCol, i * 6 + 3); c.toArray(pCol, i * 3);
    });
    eColAttr.needsUpdate = true; pColAttr.needsUpdate = true;
    if (fontsReady) mkLabels();
  }
  paint();

  // ---------- helpers ----------
  const tmp = new THREE.Vector3();
  const worldPos = (i, out = new THREE.Vector3()) => out.copy(nodes[i].pos).applyMatrix4(group.matrixWorld);
  const toScreen = (v) => { tmp.copy(v).project(camera); return { x: (tmp.x + 1) / 2 * innerWidth, y: (1 - tmp.y) / 2 * innerHeight, z: tmp.z }; };
  const fromScreen = (x, y, dist) => {
    const ndc = new THREE.Vector3(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1, 0.5).unproject(camera);
    return ndc.sub(camera.position).normalize().multiplyScalar(dist).add(camera.position);
  };
  const clusterOf = (key) => {
    if (key == null) return null;
    if (key === 'about' || key === 'hub') return -2;
    const ci = CLUSTERS.findIndex((c) => c.id === key || c.app === key);
    return ci >= 0 ? ci : null;
  };

  // ---------- state ----------
  let clock = 0, last = performance.now(), hlTarget = -1, hlAmt = 0, hlIdx = -1, boost = 0;
  let mx = 0, my = 0, cx = 0, cy = 0;
  const flashQueue = [];
  const lookAt = new THREE.Vector3(), lookTarget = new THREE.Vector3();
  addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; kick(); }, { passive: true });

  let running = false, idleUntil = 0;
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    renderer.getDrawingBufferSize(U.uRes.value);
    camera.aspect = w / h;
    camera.position.z = w < 768 ? 1150 : 760 * Math.max(1, 1.3 / camera.aspect);
    U.uFar.value = camera.position.z + 1250; U.uNear.value = camera.position.z - 400;
    camera.updateProjectionMatrix();
    kick();
  }
  addEventListener('resize', resize);
  resize();

  // ---------- loop ----------
  function kick(ms = 800) { idleUntil = Math.max(idleUntil, performance.now() + ms); if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (!reduced) clock += dt;
    U.uTime.value = clock;

    // highlight easing (hub highlight = everything brightens slightly)
    const want = hlTarget === -2 ? -1 : hlTarget;
    if (want !== hlIdx && hlAmt <= 0.02) { hlIdx = want; }
    const goal = (want === hlIdx && want >= 0) ? 1 : 0;
    hlAmt += (goal - hlAmt) * Math.min(1, dt * 6);
    U.uHL.value = hlIdx; U.uHLAmt.value = hlAmt;
    boost += ((hlTarget === -2 ? 0.8 : 0) - boost) * Math.min(1, dt * 3);
    U.uBoost.value = boost;

    leafLabels.forEach((s) => { const on = s.userData.cluster === hlIdx ? hlAmt : 0; s.material.opacity += (on * 0.9 + nFlash[s.userData.node] * 0.9 - s.material.opacity) * Math.min(1, dt * 8); });
    coreLabels.forEach((s) => { const dim = hlIdx >= 0 && s.userData.cluster !== hlIdx && s.userData.cluster >= 0 ? 0.35 : (light ? 0.9 : 0.8); s.material.opacity += (dim - s.material.opacity) * Math.min(1, dt * 6); });

    // camera: slow orbit of the graph + pointer parallax + lean toward highlighted cluster
    if (!reduced) {
      group.rotation.y = Math.sin(clock * 0.045) * 0.55;
      group.rotation.x = Math.sin(clock * 0.031) * 0.08;
      cx += (mx - cx) * Math.min(1, dt * 2.2); cy += (my - cy) * Math.min(1, dt * 2.2);
      group.children.forEach((o) => { if (o.userData && o.userData.spin) o.rotation.z += o.userData.spin * dt * 0.2; });
    }
    camera.position.x = cx * 70; camera.position.y = -cy * 45;
    if (hlIdx >= 0 && hlAmt > 0.01) worldPos(CLUSTERS[hlIdx].core, lookTarget).multiplyScalar(0.22 * hlAmt); else lookTarget.set(0, 0, 0);
    lookAt.lerp(lookTarget, Math.min(1, dt * 3));
    camera.lookAt(lookAt);
    group.updateMatrixWorld();

    // ping ripples
    for (let q = flashQueue.length - 1; q >= 0; q--) {
      const f = flashQueue[q];
      if (clock * 1000 >= f.at || reduced) {
        nFlash[f.node] = 1; if (f.edge >= 0) { eFlash[f.edge * 2] = eFlash[f.edge * 2 + 1] = 1; }
        flashQueue.splice(q, 1);
      }
    }
    let flashing = flashQueue.length > 0;
    const decay = Math.exp(-dt * 3.2);
    for (let i = 0; i < N; i++) if (nFlash[i] > 0.001) { nFlash[i] *= decay; flashing = true; } else nFlash[i] = 0;
    for (let i = 0; i < E * 2; i++) if (eFlash[i] > 0.001) { eFlash[i] *= decay; flashing = true; } else eFlash[i] = 0;
    nFlashAttr.needsUpdate = true; eFlashAttr.needsUpdate = true;

    // bursts
    bAlpha.fill(0);
    for (let b = bursts.length - 1; b >= 0; b--) {
      const B = bursts[b], t = (clock - B.t0) / B.dur;
      if (t > 1.35) { bursts.splice(b, 1); continue; }
      for (let k = 0; k < TRAIL; k++) {
        const tk = Math.min(1, Math.max(0, t - k * 0.018));
        const u = 1 - tk;
        const x = u * u * B.a.x + 2 * u * tk * B.c.x + tk * tk * B.b.x;
        const y = u * u * B.a.y + 2 * u * tk * B.c.y + tk * tk * B.b.y;
        const z = u * u * B.a.z + 2 * u * tk * B.c.z + tk * tk * B.b.z;
        const idx = b * TRAIL + k;
        bPos[idx * 3] = x; bPos[idx * 3 + 1] = y; bPos[idx * 3 + 2] = z;
        bAlpha[idx] = (1 - k / TRAIL) * (t > 1 ? Math.max(0, 1 - (t - 1) / 0.35) : 1);
        B.col.toArray(bCol, idx * 3);
      }
      if (!B.landed && t >= 1) { B.landed = true; spawnRing(B.b, B.col, 90); }
    }
    bPosAttr.needsUpdate = bAlphaAttr.needsUpdate = bColAttr.needsUpdate = true;

    rings.forEach((r) => {
      if (!r.visible) return;
      const t = (clock - r.userData.t0) / r.userData.life;
      if (t >= 1 || reduced) { r.visible = false; return; }
      const s = 8 + r.userData.max * (1 - Math.pow(1 - t, 3));
      r.scale.set(s, s, s); r.material.opacity = (1 - t) * (light ? 0.55 : 0.7); r.quaternion.copy(camera.quaternion);
    });

    renderer.render(scene, camera);

    const busy = bursts.length || rings.some((r) => r.visible) || flashing || hlAmt > 0.01 && hlAmt < 0.99;
    if (document.hidden || (reduced && !busy && now > idleUntil)) { running = false; return; }
    requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  kick();

  // ---------- public API ----------
  window.NetScene = {
    ready: true,
    stats: { nodes: N, links: E },
    clusters: clusterInfo(),
    highlight(key) { const c = clusterOf(key); hlTarget = c == null ? -1 : c; kick(1200); },
    burst(key, x, y) {
      if (reduced) return;
      const c = clusterOf(key);
      const from = c == null || c === -2 ? worldPos(hub) : worldPos(CLUSTERS[c].core);
      const to = fromScreen(x, y, camera.position.length() * 0.55);
      const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 140, 60));
      const col = color(hexOf(c == null || c === -2 ? -1 : c));
      bursts.push({ a: from, b: to, c: mid, t0: clock, dur: 0.62, col, landed: false });
      if (bursts.length > MAXB) bursts.shift();
      spawnRing(from, col, 150);
      kick(1600);
    },
    ping(x, y) {
      // nearest node on screen to the click, then an ICMP ripple through the graph
      let best = hub, bd = Infinity;
      for (let i = 0; i < N; i++) {
        const s = toScreen(worldPos(i, tmp.clone()));
        if (s.z > 1) continue;
        const d = (s.x - x) ** 2 + (s.y - y) ** 2;
        if (d < bd) { bd = d; best = i; }
      }
      const depth = new Map([[best, 0]]);
      const queue = [best];
      flashQueue.push({ node: best, edge: -1, at: clock * 1000 });
      while (queue.length) {
        const u = queue.shift();
        adj[u].forEach(([v, ei]) => {
          if (depth.has(v)) return;
          const d = depth.get(u) + 1; depth.set(v, d);
          if (d <= 4) { flashQueue.push({ node: v, edge: ei, at: clock * 1000 + d * 150 }); queue.push(v); }
        });
      }
      spawnRing(worldPos(best), color(hexOf(nodes[best].cluster)), 120);
      kick(2500);
      let name = nodes[best].name;
      if (!name) { const named = adj[best].map(([v]) => nodes[v].name).find(Boolean); name = named ? named + '-relay' : 'relay'; }
      return { name: name.toLowerCase().replace(/[^a-z0-9.\-/]+/g, '-'), hops: Math.min(4, Math.max(...depth.values())), reached: Math.min(depth.size, [...depth.values()].filter((d) => d <= 4).length) };
    },
    flash(strength = 0.5) { boost = Math.min(1.2, boost + strength); kick(900); },
    // render synchronously so a view transition captures the new look
    setTheme(t) { light = t !== 'dark'; paint(); renderer.render(scene, camera); kick(600); },
  };
  window.dispatchEvent(new CustomEvent('netscene:ready'));
  document.body.classList.add('webgl-on');
}
