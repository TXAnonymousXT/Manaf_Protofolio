// ================ PACKET INSPECTOR ================
// Manaf's career as a packet capture, plus a live capture of the visitor's own session.
// Everything is computed in the browser; nothing is sent anywhere.
const Inspector = (() => {
  const esc = FX.esc;
  const NOW_YEAR = new Date().getFullYear();

  // ---------- career.pcapng ----------
  // Facts come from Manaf's CV and his own portfolio copy. No phone number, no invented details.
  const CAREER = [
    { id: 'qu', type: 'education', proto: 'EDU', when: '2018-09', title: 'B.Sc. Computer Engineering', org: 'Qatar University', host: 'qatar-univ',
      period: 'Sep 2018 - May 2024', years: [2018, 2024], status: 'completed', tags: ['education', 'engineering', 'robotics'],
      skills: ['Digital Logic', 'Computer Architecture', 'Microprocessors', 'Embedded Systems', 'VLSI', 'Signals', 'Data Structures', 'Algorithms', 'Operating Systems', 'Networking'],
      hl: ['College of Engineering, Doha', 'Full stack of computer engineering: digital logic and VLSI up to OS, networking and software engineering', 'QU Computing Club: Outstanding Project Award, Robotics Track'],
      stream: [
        ['c', 'Where did it all start?'],
        ['s', 'Qatar University, College of Engineering, 2018 to 2024. Computer Engineering covered the whole stack for me: digital logic, computer architecture, microprocessors, embedded systems and VLSI, all the way up to operating systems, networking and software engineering.'],
        ['c', 'Anything you are proud of from those years?'],
        ['s', 'Oh yeah! I picked up the Outstanding Project Award from the QU Computing Club in the Robotics Track. That one still makes me smile.'],
      ] },
    { id: 'ccna', type: 'cert', proto: 'CERT', when: '2021', title: 'CCNA: Cisco Certified Network Associate', org: 'Cisco', host: 'cisco',
      period: '2021', years: [2021, 2021], status: 'certified', tags: ['networking', 'cert'],
      skills: ['Routing', 'Switching', 'OSPF', 'VLANs', 'ACLs', 'NAT'],
      hl: ['Earned in 2021', 'Applied every day at work, not a paper cert'],
      stream: [
        ['c', 'Is the CCNA just a line on the CV?'],
        ['s', "Haha nope! I got it in 2021 and I use it every single day: routing, switching, VLANs, ACLs. It's basically my day job now."],
      ] },
    { id: 'applab', type: 'job', proto: 'JOB', when: '2024-08', title: 'IT Business Analyst', org: 'Applab', host: 'applab',
      period: 'Aug 2024 - Oct 2024', years: [2024, 2024], status: 'completed', tags: ['analysis', 'web'],
      skills: ['Requirements Analysis', 'Technical Specs', 'Stakeholder Liaison', 'Feature Testing'],
      hl: ['Requirements for 3 government web projects: MSDF, Qatar Rail and Qlife', 'Liaison between stakeholders and development teams', 'Coordinated frontend and backend releases', 'Tested and validated features before deployment'],
      stream: [
        ['c', 'Business analyst? That sounds different.'],
        ['s', 'It was, and I loved that! At Applab I analysed and documented requirements for three government web projects: MSDF, Qatar Rail and Qlife. I sat between the stakeholders and the developers and turned business needs into technical specs.'],
        ['c', 'Did you touch the tech side?'],
        ['s', 'Yep. I coordinated with the frontend and backend devs on releases, and I tested and validated new features before they shipped.'],
      ] },
    { id: 'meeza', type: 'job', proto: 'JOB', when: '2024-11', title: 'NOC Engineer', org: 'Meeza', host: 'meeza',
      period: 'Nov 2024 - Dec 2025', years: [2024, 2025], status: 'completed', tags: ['networking', 'security', 'noc', 'ops'],
      skills: ['Firewall Policy', 'ITSM', 'Active Directory', 'Microsoft 365', 'VPN', 'Windows', 'Virtual Machines'],
      hl: ['5,000+ ITSM tickets resolved within SLA', '600+ advanced cases: VMs, system performance, network connectivity', '2-month TechOps rotation: firewall operations and connectivity troubleshooting', 'Active Directory accounts, permissions and group policy', 'Tier 2/3 escalations with clear documentation; knowledge base articles'],
      stream: [
        ['c', 'What was the NOC like?'],
        ['s', 'Intense, in the best way! At Meeza I resolved 5,000+ ITSM tickets while hitting SLA, plus 600+ advanced cases involving VMs, system performance and network connectivity.'],
        ['c', 'Any security work in there?'],
        ['s', 'Yes! I did a 2-month TechOps rotation on firewall operations: reviewing firewall policies, processing access changes for enterprise clients and troubleshooting connectivity.'],
      ] },
    { id: 'kraftxlab', type: 'job', proto: 'JOB', when: '2025-12', title: 'Network Engineer', org: 'KraftxLab', host: 'kraftxlab',
      period: 'Dec 2025 - Present', years: [2025, NOW_YEAR], status: 'current', tags: ['networking', 'security', 'iot'],
      skills: ['Routers', 'Switches', 'Firewalls', 'Wireless APs', 'OSPF', 'VLANs', 'Inter-VLAN Routing', 'ACLs', 'VPN', 'SNMP', 'syslog'],
      hl: ['Routers, switches, firewalls and wireless APs across multiple client deployments', 'VLANs, inter-VLAN routing and OSPF to segment traffic and optimise flow', 'Firewall rules, ACLs and VPN tunnels for security policy and secure remote access', 'Monitoring with SNMP, syslog and traffic analysis; Layer 2/3 troubleshooting', 'Topology diagrams and standard configuration baselines', 'Network connectivity for IoT and edge solutions with the embedded team'],
      stream: [
        ['c', 'So what do you do at KraftxLab?'],
        ['s', "Glad you asked! I'm the network engineer: routers, switches, firewalls and access points across multiple client deployments. VLANs, inter-VLAN routing and OSPF keep the traffic segmented and flowing."],
        ['c', 'And the security side?'],
        ['s', "Firewall rules, ACLs and VPN tunnels for secure remote access. I monitor with SNMP and syslog, and when something breaks at Layer 2 or 3, I'm the one hunting it down."],
        ['c', 'Best part of the job?'],
        ['s', 'Working with the embedded team to get IoT and edge devices online. Networking meets hardware: my two favourite worlds.'],
      ] },
    { id: 'dispatch', type: 'project', proto: 'OPT', when: '2026', title: 'Smart Dispatch', org: 'Snoonu Hackathon 2026', host: 'snoonu',
      years: [2026, 2026], status: 'hackathon', tags: ['optimization', 'hackathon'],
      skills: ['Python', 'OSRM', 'Optimization', 'Order Batching', 'Route Planning'],
      hl: ["Order batching and route optimisation for Snoonu's delivery fleet", 'OSRM for real Doha road routing', 'Delivery windows, driver locations, traffic and order priorities', 'Built under hackathon time pressure'],
      stream: [
        ['c', 'What did you build at the Snoonu hackathon?'],
        ['s', "Smart Dispatch! Order batching and route optimisation for Snoonu's delivery fleet, with OSRM doing real Doha road routing."],
        ['c', 'Hardest part?'],
        ['s', 'Real-world constraints: delivery windows, driver locations, traffic and order priorities, all under hackathon time pressure. So much fun.'],
      ] },
    { id: 'redoubt', type: 'project', proto: 'SEC', when: 'ongoing', title: 'Redoubt', org: 'Flagship · in development', host: 'redoubt.lab',
      status: 'ongoing', tags: ['security', 'networking', 'flagship'],
      skills: ['Traffic Monitoring', 'Alerting', 'Anomaly Detection', 'Policy Enforcement', 'Event Correlation'],
      hl: ['Full-scale network security platform built from scratch', 'V2.0 spec mapped to SSCP and CCNA domains', 'Six-phase, 18-month roadmap', 'Traffic monitoring, alerting, anomaly detection, policy enforcement and security event correlation'],
      stream: [
        ['c', 'What is Redoubt?'],
        ['s', "My flagship, and honestly my baby. It's a full network security platform I'm building from scratch: traffic monitoring, alerting, anomaly detection, policy enforcement and security event correlation."],
        ['c', 'How serious is it?'],
        ['s', 'Very! The V2.0 spec is mapped to SSCP and CCNA domains, with a six-phase, 18-month roadmap. Production-grade architecture, no shortcuts.'],
      ] },
    { id: 'udst', type: 'project', proto: 'NET', when: '—', title: 'UDST Four-Campus Network', org: 'Enterprise networking capstone', host: 'udst-campus',
      status: 'completed', tags: ['networking'],
      skills: ['Cisco Packet Tracer', 'Multi-area OSPF', 'VLANs', 'DHCP Relay', 'Cisco CME', 'VoIP', 'IP Addressing'],
      hl: ['Four campuses: Doha, Al Khor, Al Wakra and Dukhan', 'Hierarchical IP addressing and VLAN segmentation', 'Multi-area OSPF and DHCP with relay agents', 'Cisco CME VoIP telephony', 'Debugged iteratively, device by device'],
      stream: [
        ['c', 'Tell me about the four-campus network.'],
        ['s', 'That was an enterprise networking capstone: four campuses (Doha, Al Khor, Al Wakra and Dukhan) built in Cisco Packet Tracer.'],
        ['c', "What's inside it?"],
        ['s', 'Hierarchical IP addressing, VLAN segmentation, multi-area OSPF, DHCP with relay agents and Cisco CME VoIP telephony. I debugged it iteratively, device by device.'],
      ] },
    { id: 'firewall', type: 'project', proto: 'SEC', when: '—', title: 'Linux Firewall Appliance', org: 'Custom hardware', host: 'fw01.lab',
      status: 'built', tags: ['security', 'networking', 'linux', 'hardware'],
      skills: ['Debian', 'IPFire', 'nftables', 'Suricata', 'Intel i226-V'],
      hl: ['Custom mini PC with Intel i226-V 2.5GbE NICs', 'IPFire / Debian + nftables + Suricata IDS/IPS', 'Feeds into Redoubt'],
      stream: [
        ['c', 'You built your own firewall?'],
        ['s', 'Haha yes! A mini PC with Intel i226-V 2.5GbE NICs running Debian with nftables and Suricata. It also feeds into Redoubt.'],
      ] },
    { id: 'spoon', type: 'project', proto: 'EMB', when: '—', title: 'Tremor-Stabilizing Spoon', org: "Assistive device for Parkinson's", host: 'esp32-c6.lab',
      status: 'built', tags: ['embedded', 'health'],
      skills: ['ESP32-C6', 'MPU6050', 'SG90 Servos', 'PD Control', 'Real-time Firmware'],
      hl: ['ESP32-C6 + MPU6050 6-axis IMU + SG90 servos', 'PD controller tuned for Parkinsonian tremor (4-6 Hz)', 'Real-time counter-tremor corrections with sub-millisecond timing'],
      stream: [
        ['c', 'A spoon that stabilises itself?'],
        ['s', "Yes! It's for people with Parkinson's. An ESP32-C6 reads an MPU6050 6-axis IMU and drives servos to cancel the shake in real time."],
        ['c', 'How do you tune something like that?'],
        ['s', "A PD controller tuned for Parkinsonian tremor at 4-6 Hz, making sub-millisecond corrections on the ESP32's real-time core. Honestly one of my favourites."],
      ] },
    { id: 'mecanum', type: 'project', proto: 'EMB', when: '—', title: 'Mecanum Wheel Robot', org: 'Omnidirectional robot', host: 'rpi-mecanum.lab',
      status: 'built', tags: ['embedded', 'robotics'],
      skills: ['Raspberry Pi', 'Python', 'L298N', 'Inverse Kinematics', 'Mecanum Wheels'],
      hl: ['Raspberry Pi + L298N H-bridge drivers + 4 mecanum wheels', 'Inverse kinematics: (Vx, Vy, w) to individual wheel speeds', 'Omnidirectional, circular and geometric movement'],
      stream: [
        ['c', 'How does a robot drive sideways?'],
        ['s', 'Mecanum wheels! A Raspberry Pi with L298N drivers, plus inverse kinematics that turn (Vx, Vy, ω) into four individual wheel speeds. It moves in any direction, including circles and geometric patterns.'],
      ] },
    { id: 'catdetector', type: 'project', proto: 'ML', when: '—', title: 'Cat / Turtle Detector', org: 'Edge ML on Raspberry Pi', host: 'rpi-edge.lab',
      status: 'built', tags: ['ml', 'embedded'],
      skills: ['TF Lite', 'MobileNetV2', 'Raspberry Pi', 'GPIO', 'Blynk'],
      hl: ['MobileNetV2 quantised to TensorFlow Lite', 'Real-time on-device inference, no cloud dependency', 'GPIO alarms + Blynk notifications'],
      stream: [
        ['c', 'Cats AND turtles?'],
        ['s', 'Haha yes! MobileNetV2 quantised to TensorFlow Lite, running on a Raspberry Pi. Real-time inference right on the device, no cloud, with GPIO alarms and Blynk.'],
      ] },
    { id: 'water', type: 'project', proto: 'IOT', when: '—', title: 'IoT Water Quality Monitor', org: 'Unattended sensing', host: 'esp32-water.lab',
      status: 'built', tags: ['iot', 'embedded'],
      skills: ['ESP32', 'TDS Sensor', 'pH Sensor', 'UV LED', 'L298N Pump', 'Blynk'],
      hl: ['ESP32 with TDS and pH sensors', 'UV LED and an L298N-driven pump', 'Blynk dashboard with offline fallback', 'Continuous unattended operation: handles sensor drift and connectivity drops'],
      stream: [
        ['c', 'What does the water monitor do?'],
        ['s', 'An ESP32 with TDS and pH sensors, a UV LED and an L298N-driven pump, all reporting to a Blynk dashboard.'],
        ['c', 'What if the Wi-Fi dies?'],
        ['s', "It has an offline fallback. It's built to run unattended, so it copes with sensor drift and connectivity drops on its own."],
      ] },
    { id: 'emotion', type: 'project', proto: 'EMB', when: '—', title: 'Wearable Emotion Sensor', org: 'Biosignal wearable', host: 'beetle-c6.lab',
      status: 'built', tags: ['embedded', 'ml', 'health', 'wearable'],
      skills: ['Beetle ESP32-C6', 'MAX30102', 'GSR Sensor', 'Signal Filtering', 'Classification'],
      hl: ['Beetle ESP32-C6 + MAX30102 (heart rate / SpO2) + GSR sensor', 'Signal filtering, feature extraction and emotion classification', 'Designed around wearable power constraints'],
      stream: [
        ['c', 'A sensor that reads emotions?'],
        ['s', 'Sort of! A Beetle ESP32-C6 with a MAX30102 for heart rate and SpO2, plus a GSR sensor. I filter the signals, extract features and classify the emotional state, all within wearable power limits.'],
      ] },
    { id: 'dispenser', type: 'project', proto: 'EMB', when: '—', title: 'Automated Medication Dispenser', org: 'Reliability-first firmware', host: 'dispenser.lab',
      status: 'built', tags: ['embedded', 'health'],
      skills: ['Firmware', 'Scheduling', 'Mechanical Dispensing'],
      hl: ['Firmware scheduling logic', 'Mechanical dispensing mechanism', 'Reliability first: no silent failures'],
      stream: [
        ['c', 'A medication dispenser?'],
        ['s', 'Firmware scheduling plus a mechanical dispensing mechanism. The rule was reliability first: it must never fail silently.'],
      ] },
    { id: 'charity', type: 'project', proto: 'EMB', when: '—', title: 'Charity Donation Box', org: 'With Arabic audio', host: 'donation-box.lab',
      status: 'built', tags: ['embedded'],
      skills: ['Sensors', 'Audio Playback', 'Embedded Hardware'],
      hl: ['Embedded hardware with sensor-triggered Arabic audio playback'],
      stream: [
        ['c', 'A talking donation box?'],
        ['s', 'Haha, kind of! When its sensor is triggered, the box plays an Arabic audio message. Simple, and a lot of fun to build.'],
      ] },
    { id: 'kraftsite', type: 'project', proto: 'WEB', when: '—', title: 'KraftxLab Website', org: 'KraftxLab', host: 'kraftxlab-web',
      status: 'shipped', tags: ['web', '3d'],
      skills: ['Three.js', 'WebGL', 'Interactive 3D'],
      hl: ['Drove the website redesign', 'Three.js interactive workbench with real 3D electronic components', 'ESP32 modules, relay boards, capacitors and resistors', 'The breakthrough came after rejecting generic templates'],
      stream: [
        ['c', 'You did the KraftxLab website too?'],
        ['s', 'I drove the redesign! We rejected the generic templates and built a Three.js interactive workbench full of real 3D electronic components: ESP32 modules, relay boards, capacitors and resistors.'],
      ] },
    { id: 'portfolio', type: 'project', proto: 'WEB', when: 'live', title: 'ManafOS (this portfolio)', org: 'txanonymousxt.github.io', host: 'github.io',
      status: 'ongoing', tags: ['web', '3d'],
      skills: ['JavaScript', 'WebGL', 'Three.js', 'UI/UX'],
      hl: ['Several iterations: React, Magic Patterns, Webflow and now ManafOS', 'Logo "The Signal": an M-shaped oscilloscope waveform', 'v5: the whole site is a network, and this capture is part of it'],
      stream: [
        ['c', 'Wait, is this portfolio a project too?'],
        ['s', 'Of course! It has been through React, Magic Patterns and Webflow versions. The logo is "The Signal", an M-shaped oscilloscope waveform. And now it\'s a whole OS where everything is a packet, including this conversation.'],
      ] },
    { id: 'sscp', type: 'cert', proto: 'CERT', when: 'now', title: 'ISC2 SSCP', org: 'ISC2', host: 'isc2',
      status: 'in-progress', tags: ['security', 'cert'],
      skills: ['Security Operations', 'Access Controls', 'Risk', 'Incident Response', 'Cryptography'],
      hl: ['Systems Security Certified Practitioner, in progress', 'Its domains map straight onto Redoubt'],
      stream: [
        ['c', 'What are you studying right now?'],
        ['s', "ISC2 SSCP. Redoubt's spec is mapped to the SSCP domains, so I get theory and practice at the same time."],
      ] },
    { id: 'scor', type: 'cert', proto: 'CERT', when: 'now', title: 'CCNP SCOR (350-701)', org: 'Cisco', host: 'cisco',
      status: 'in-progress', tags: ['security', 'networking', 'cert'],
      skills: ['Security Core', 'Network Security', 'Secure Access', 'VPN'],
      hl: ['CCNP Security Core exam, in progress', 'The next step after the CCNA, with a security focus'],
      stream: [
        ['c', 'CCNP as well?'],
        ['s', "Yep, the SCOR exam (350-701, Security Core). It's the natural next step after the CCNA, this time with a security focus."],
      ] },
    { id: 'cdsa', type: 'cert', proto: 'CERT', when: 'now', title: 'HTB CDSA', org: 'Hack The Box', host: 'hackthebox',
      status: 'in-progress', tags: ['security', 'soc', 'cert'],
      skills: ['SOC Analysis', 'Detection', 'Defensive Security'],
      hl: ['Certified Defensive Security Analyst, in progress', 'Building toward network security and SOC operations'],
      stream: [
        ['c', 'And the blue-team side?'],
        ['s', "HTB's Certified Defensive Security Analyst. I'm building toward network security and SOC operations, so defensive analysis is exactly where I want to get sharper."],
      ] },
    // Shown only when a filter asks for it explicitly.
    { id: 'senior', type: 'project', proto: 'ML', when: '2024', title: 'Li-ion Battery SoH Forecasting', org: 'Graduation project · Qatar University', host: 'qatar-univ',
      years: [2024, 2024], status: 'completed', tags: ['ml', 'senior', 'graduation'], hidden: true,
      skills: ['Deep Learning', 'ResNet-LSTM', 'NASA Li-ion Dataset', 'Arduino Uno', 'Raspberry Pi 4'],
      hl: ['Deep learning approaches to forecasting the State of Health (SoH) of lithium-ion batteries', 'ResNet-LSTM: spatial feature extraction + sequential modelling', 'NASA Li-ion Battery Data Set + custom rig: TP4056, 4-ch relay, MAX471, DS18B20, Arduino Uno, Raspberry Pi 4', 'RMSE 0.69 · MAE 0.49 · R2 99.51%', 'Outperformed Linear Regression, Random Forest, LSTM, GRU, TCN and Transformer baselines', 'Team: Ezeddin, Obada, Mahmoud · Supervisor: Dr. Mohamed Hashim Al-Meer'],
      stream: [
        ['c', 'What was your graduation project?'],
        ['s', 'Deep learning for forecasting the State of Health of lithium-ion batteries. We built a ResNet-LSTM model that combines spatial feature extraction with sequential modelling, using the NASA Li-ion dataset plus our own hardware rig.'],
        ['c', 'Did it work?'],
        ['s', 'RMSE 0.69, MAE 0.49 and R² of 99.51%, beating Linear Regression, Random Forest, LSTM, GRU, TCN and Transformer baselines. A real team effort with Ezeddin, Obada and Mahmoud, supervised by Dr. Mohamed Hashim Al-Meer.'],
      ] },
  ];
  const SENIOR_RX = /senior|graduat|soh\b|battery|lithium|li-ion/i;

  // ---------- bytes ----------
  const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h; };
  const ascii = (s) => String(s).replace(/[–—]/g, '-').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/→/g, '->').replace(/ω/g, 'w').replace(/²/g, '2').replace(/·/g, '|').replace(/[^\t\n\r\x20-\x7e]/g, '?');
  const MAC = {
    manaf: [0x02, 0x4d, 0x41, 0x4e, 0x41, 0x46],   // "MANAF"
    you: [0x02, 0x79, 0x6f, 0x75, 0x00, 0x01],     // "you"
    gw: [0x02, 0x67, 0x77, 0x00, 0x00, 0x01],      // "gw"
  };
  const macFor = (name) => { const h = fnv(name); return [0x02, h >>> 24 & 255, h >>> 16 & 255, h >>> 8 & 255, h & 255, 0x2a]; };
  const macStr = (m) => m.map((b) => b.toString(16).padStart(2, '0')).join(':');
  const ipStr = (ip) => ip.join('.');
  const hex = (v, n = 4) => '0x' + v.toString(16).padStart(n, '0');

  function Bytes() {
    const a = [];
    return {
      a, get pos() { return a.length; },
      u8(v) { a.push(v & 255); }, u16(v) { a.push(v >> 8 & 255, v & 255); },
      u32(v) { a.push(v >>> 24 & 255, v >>> 16 & 255, v >>> 8 & 255, v & 255); },
      raw(arr) { for (const x of arr) a.push(x & 255); }, str(s) { for (const ch of ascii(s)) a.push(ch.charCodeAt(0)); },
    };
  }
  const sum16 = (arr, from, to, init = 0) => { let s = init; for (let i = from; i < to; i += 2) s += (arr[i] << 8) + (i + 1 < to ? arr[i + 1] : 0); while (s >> 16) s = (s & 0xffff) + (s >> 16); return s; };
  const field = (t, from, to, kids) => ({ t, r: from != null ? [from, to] : null, kids: kids || null });

  // Build a full Ethernet/IPv4/(TCP|UDP|ICMP) frame around an application payload.
  // payload(b) appends bytes and returns a tree node with absolute byte ranges.
  function frame({ srcMac, dstMac, srcName, dstName, srcIp, dstIp, l4, sport = 0, dport = 0, seq = 1, ack = 1, flags = 0x18, win = 64240, icmp, ttl = 64, stream, payload }) {
    // payload first, to learn its length
    const pb = Bytes();
    const pnode = payload ? payload(pb) : null;
    const plen = pb.a.length;
    const l4len = l4 === 'tcp' ? 20 : l4 === 'udp' ? 8 : 8;
    const b = Bytes();
    const tree = [];

    let s = b.pos;
    b.raw(dstMac); b.raw(srcMac); b.u16(0x0800);
    tree.push(field(`Ethernet II, Src: ${srcName} (${macStr(srcMac)}), Dst: ${dstName} (${macStr(dstMac)})`, s, b.pos, [
      field(`Destination: ${dstName} (${macStr(dstMac)})`, s, s + 6),
      field(`Source: ${srcName} (${macStr(srcMac)})`, s + 6, s + 12),
      field('Type: IPv4 (0x0800)', s + 12, s + 14),
    ]));

    s = b.pos;
    const total = 20 + l4len + plen, ident = fnv(srcName + dstName + seq) & 0xffff;
    const proto = l4 === 'tcp' ? 6 : l4 === 'udp' ? 17 : 1;
    b.u8(0x45); b.u8(0); b.u16(total); b.u16(ident); b.u16(0x4000); b.u8(ttl); b.u8(proto); b.u16(0); b.raw(srcIp); b.raw(dstIp);
    const ck = ~sum16(b.a, s, s + 20) & 0xffff; b.a[s + 10] = ck >> 8; b.a[s + 11] = ck & 255;
    tree.push(field(`Internet Protocol Version 4, Src: ${ipStr(srcIp)}, Dst: ${ipStr(dstIp)}`, s, s + 20, [
      field('0100 .... = Version: 4', s, s + 1), field('.... 0101 = Header Length: 20 bytes (5)', s, s + 1),
      field('Differentiated Services Field: 0x00 (DSCP: CS0, ECN: Not-ECT)', s + 1, s + 2),
      field(`Total Length: ${total}`, s + 2, s + 4), field(`Identification: ${hex(ident)} (${ident})`, s + 4, s + 6),
      field("Flags: 0x2, Don't fragment", s + 6, s + 8), field(`Time to Live: ${ttl}`, s + 8, s + 9),
      field(`Protocol: ${l4 === 'tcp' ? 'TCP' : l4 === 'udp' ? 'UDP' : 'ICMP'} (${proto})`, s + 9, s + 10),
      field(`Header Checksum: ${hex(ck)} [validation disabled]`, s + 10, s + 12),
      field(`Source Address: ${ipStr(srcIp)}`, s + 12, s + 16), field(`Destination Address: ${ipStr(dstIp)}`, s + 16, s + 20),
    ]));

    s = b.pos;
    const pseudo = sum16([...srcIp, ...dstIp, 0, proto, (l4len + plen) >> 8, (l4len + plen) & 255], 0, 12);
    if (l4 === 'tcp') {
      b.u16(sport); b.u16(dport); b.u32(seq); b.u32(ack); b.u8(0x50); b.u8(flags); b.u16(win); b.u16(0); b.u16(0);
      const tmp = b.a.slice(s).concat(pb.a);
      const tck = ~sum16(tmp, 0, tmp.length, pseudo) & 0xffff; b.a[s + 16] = tck >> 8; b.a[s + 17] = tck & 255;
      const fl = [['FIN', 1], ['SYN', 2], ['RST', 4], ['PSH', 8], ['ACK', 16]].filter(([, m]) => flags & m).map(([n]) => n).join(', ');
      tree.push(field(`Transmission Control Protocol, Src Port: ${sport}, Dst Port: ${dport}, Seq: ${flags & 2 ? 0 : 1}, Ack: ${flags & 16 ? 1 : 0}, Len: ${plen}`, s, s + 20, [
        field(`Source Port: ${sport}`, s, s + 2), field(`Destination Port: ${dport}`, s + 2, s + 4),
        field(`Sequence Number: ${flags & 2 ? 0 : 1}    (relative sequence number)`, s + 4, s + 8),
        field(`Sequence Number (raw): ${seq >>> 0}`, s + 4, s + 8),
        field(`Acknowledgment Number: ${flags & 16 ? 1 : 0}    (relative ack number)`, s + 8, s + 12),
        field('0101 .... = Header Length: 20 bytes (5)', s + 12, s + 13),
        field(`Flags: ${hex(flags, 3)} (${fl})`, s + 13, s + 14),
        field(`Window: ${win}${win === 0 ? '  [TCP ZeroWindow]' : ''}`, s + 14, s + 16),
        field(`Checksum: ${hex(tck)} [correct]`, s + 16, s + 18), field('Urgent Pointer: 0', s + 18, s + 20),
        ...(stream != null ? [field(`[Stream index: ${stream}]`)] : []),
      ]));
    } else if (l4 === 'udp') {
      b.u16(sport); b.u16(dport); b.u16(8 + plen); b.u16(0);
      const tmp = b.a.slice(s).concat(pb.a);
      const uck = ~sum16(tmp, 0, tmp.length, pseudo) & 0xffff; b.a[s + 6] = uck >> 8; b.a[s + 7] = uck & 255;
      tree.push(field(`User Datagram Protocol, Src Port: ${sport}, Dst Port: ${dport}`, s, s + 8, [
        field(`Source Port: ${sport}`, s, s + 2), field(`Destination Port: ${dport}`, s + 2, s + 4),
        field(`Length: ${8 + plen}`, s + 4, s + 6), field(`Checksum: ${hex(uck)} [correct]`, s + 6, s + 8),
      ]));
    } else {
      b.u8(icmp.type); b.u8(0); b.u16(0); b.u16(icmp.id); b.u16(icmp.seq);
      const tmp = b.a.slice(s).concat(pb.a);
      const ick = ~sum16(tmp, 0, tmp.length) & 0xffff; b.a[s + 2] = ick >> 8; b.a[s + 3] = ick & 255;
      tree.push(field('Internet Control Message Protocol', s, b.pos + plen, [
        field(`Type: ${icmp.type} (${icmp.type === 8 ? 'Echo (ping) request' : 'Echo (ping) reply'})`, s, s + 1),
        field('Code: 0', s + 1, s + 2), field(`Checksum: ${hex(ick)} [correct]`, s + 2, s + 4),
        field(`Identifier (BE): ${icmp.id} (${hex(icmp.id)})`, s + 4, s + 6), field(`Sequence Number (BE): ${icmp.seq}`, s + 6, s + 8),
        ...(icmp.extra || []).map((t) => field(t)),
        field(`Data (${plen} bytes)`, s + 8, s + 8 + plen),
      ]));
    }

    const off = b.pos;
    b.raw(pb.a);
    const shift = (n) => { if (n.r) n.r = [n.r[0] + off, n.r[1] + off]; if (n.kids) n.kids.forEach(shift); };
    if (pnode) { shift(pnode); tree.push(pnode); }
    const bytes = Uint8Array.from(b.a);
    tree.unshift(field(`Frame: ${bytes.length} bytes on wire (${bytes.length * 8} bits), ${bytes.length} bytes captured`, 0, bytes.length, [
      field('Encapsulation type: Ethernet (1)'), field(`Frame Length: ${bytes.length} bytes`), field('[Coloring Rule Name: ManafOS]'),
    ]));
    return { bytes, tree };
  }

  // Text payload whose lines (and comma-separated items) become tree fields
  function textPayload(title, lines, generated = []) {
    return (b) => {
      const start = b.pos;
      const kids = [];
      lines.forEach((ln) => {
        if (ln.items) {
          const ls = b.pos; const prefix = `${ln.key}: `;
          b.str(prefix);
          const sub = [];
          ln.items.forEach((it, i) => { const p = b.pos; b.str(it); sub.push(field(ascii(it), p, b.pos)); if (i < ln.items.length - 1) b.str(', '); });
          b.str('\r\n');
          kids.push(field(`${ln.label || ln.key} (${ln.items.length})`, ls, b.pos, sub));
        } else if (ln.group) {
          const gs = b.pos; const sub = [];
          ln.group.forEach((g) => { const p = b.pos; b.str(`${ln.key}: ${g}\r\n`); sub.push(field(ascii(g), p, b.pos)); });
          kids.push(field(`${ln.label} (${ln.group.length})`, gs, b.pos, sub));
        } else {
          const p = b.pos; b.str(ln.raw != null ? ln.raw : `${ln.key}: ${ln.val}\r\n`);
          kids.push(field(ln.label ? `${ln.label}: ${ln.val}` : ascii(ln.raw).replace(/\r\n$/, ''), p, b.pos));
        }
      });
      generated.forEach((g) => kids.push(field(g)));
      return Object.assign(field(title, start, b.pos, kids), { open: true });
    };
  }

  // ---------- career frames ----------
  const PORTS = { EDU: 80, JOB: 443, CERT: 636, NET: 179, SEC: 8443, EMB: 1883, IOT: 1883, ML: 8501, WEB: 443, OPT: 5000 };
  const ROWCLS = { EDU: 'edu', JOB: 'job', CERT: 'cert', NET: 'net', SEC: 'sec', EMB: 'emb', IOT: 'iot', ML: 'ml', WEB: 'web', OPT: 'opt' };
  const careerFrames = CAREER.map((p, i) => {
    const no = i + 1;
    const h = fnv(p.id);
    const years = p.years ? Array.from({ length: p.years[1] - p.years[0] + 1 }, (_, k) => p.years[0] + k) : [];
    const lines = [
      { raw: `MANAF-CAREER/5.0 ${p.proto}\r\n` },
      { key: 'Title', label: 'Title', val: p.title },
      { key: 'Org', label: 'Organization', val: p.org },
      ...(p.period ? [{ key: 'Period', label: 'Period', val: p.period }] : []),
      { key: 'Status', label: 'Status', val: p.status },
      { key: 'Stack', label: 'Stack', items: p.skills },
      { key: 'HL', label: 'Highlights', group: p.hl },
      { key: 'Tags', label: 'Tags', items: p.tags },
      { raw: '\r\n' },
    ];
    const built = frame({
      srcMac: MAC.manaf, dstMac: macFor(p.host), srcName: 'manaf', dstName: p.host,
      srcIp: [10, 24, 0, 1], dstIp: [10, 20 + (h & 15), h >>> 8 & 255, (h >>> 16 & 253) + 1],
      l4: 'tcp', sport: 49152 + (h % 16000), dport: PORTS[p.proto] || 443, seq: h, ack: fnv(p.host), flags: 0x18, stream: i,
      payload: textPayload(`Manaf Career Protocol (${p.proto})`, lines, ['[Double-click the packet to Follow its stream]']),
    });
    const flagsNote = p.status === 'in-progress' ? '  [TCP segment of a reassembled PDU]' : p.status === 'current' ? '  [PSH, ACK] · live' : '';
    return {
      no, p, time: p.when, src: 'manaf', dst: p.host, proto: p.proto, cls: ROWCLS[p.proto], len: built.bytes.length,
      info: `${p.title} · ${p.org}${p.period ? ' · ' + p.period : ''}${flagsNote}`,
      bytes: built.bytes, tree: built.tree, stream: p.stream, hidden: !!p.hidden,
      rec: {
        proto: p.proto.toLowerCase(), type: p.type, title: p.title.toLowerCase(), role: p.title.toLowerCase(), org: p.org.toLowerCase(),
        year: years, skill: p.skills.map((s) => s.toLowerCase()), tag: p.tags, status: p.status, host: p.host, len: built.bytes.length,
        when: p.when, info: p.title.toLowerCase(), id: p.id,
        layers: ['eth', 'ip', 'tcp', 'career', p.proto.toLowerCase(), p.type, p.type + 's'],
        frame: [p.title, p.org, p.period, p.status, p.host, p.proto, p.type, ...p.skills, ...p.hl, ...p.tags, ...p.stream.map((s) => s[1])].join(' ').toLowerCase(),
      },
    };
  });

  // ---------- live capture ----------
  const LIVE = [];
  const t0 = () => performance.now();
  const YOU_IP = [192, 0, 2, 24];          // documentation range: addresses are placeholders
  const ipFor = (host) => host === 'manafos.local' ? [10, 24, 0, 1] : host === 'resolver' ? [192, 0, 2, 53] : (() => { const h = fnv(host); return [198, 51, 100, (h % 250) + 2]; })();
  const ctype = (path, initiator, host = '') => { const e = (path.split('?')[0].split('.').pop() || '').toLowerCase(); if (!/\./.test(path.split('/').pop())) { if (/fonts\.googleapis/.test(host) || initiator === 'link') return 'text/css'; if (/gstatic/.test(host) || initiator === 'css') return 'font/woff2'; if (initiator === 'script') return 'text/javascript'; if (initiator === 'img') return 'image/*'; } return ({ css: 'text/css', js: 'text/javascript', webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml', woff2: 'font/woff2', pdf: 'application/pdf', json: 'application/json' })[e] || (path.endsWith('/') ? 'text/html' : 'application/octet-stream'); };
  let seeded = false, ports = 51000;
  const hostPort = new Map(), SRV = new Map();
  const portFor = (host) => { if (!hostPort.has(host)) hostPort.set(host, ports += 7); return hostPort.get(host); };
  const srvPort = (host) => SRV.get(host) || 443;

  function liveSummary(ev) {
    const host = ev.host || 'manafos.local';
    const fwd = !(ev.dir === 'r' || ev.dir === 'res' || ev.dir === 'rep' || ev.dir === 's' || ev.back);
    const [src, dst] = fwd ? ['you', host] : [host, 'you'];
    let proto = 'TCP', info = '', layers = ['eth', 'ip'];
    const sp = portFor(host), dp = ev.kind === 'dns' ? 53 : srvPort(host);
    const ports = fwd ? `${sp} → ${dp}` : `${dp} → ${sp}`;
    switch (ev.kind) {
      case 'dns':
        proto = 'DNS'; layers.push('udp', 'dns');
        info = ev.dir === 'q' ? `Standard query ${hex(ev.id)} A ${ev.qname}` : `Standard query response ${hex(ev.id)} A ${ev.qname}  [${ev.dur.toFixed(1)} ms]`;
        return { src: ev.dir === 'q' ? 'you' : 'resolver', dst: ev.dir === 'q' ? 'resolver' : 'you', proto, info, layers, cls: 'dns' };
      case 'tcp': {
        layers.push('tcp'); const f = ev.flags;
        const name = f === 'SYN' ? '[SYN]' : f === 'SYNACK' ? '[SYN, ACK]' : f === 'ACK' ? '[ACK]' : f === 'FIN' ? '[FIN, ACK]' : '[ACK]';
        let cls = 'tcp';
        if (ev.note === 'zero') { info = `[TCP ZeroWindow] ${ports} ${name} Win=0  (${ev.app} minimized)`; cls = 'bad'; }
        else if (ev.note === 'update') { info = `[TCP Window Update] ${ports} ${name} Win=${ev.win || 65535}  (${ev.what})`; }
        else if (f === 'FIN') { info = `${ports} [FIN, ACK] Seq=1 Ack=1  (${ev.app} closed)`; cls = 'fin'; }
        else info = `${ports} ${name} Seq=${f === 'SYN' || f === 'SYNACK' ? 0 : 1} ${f !== 'SYN' ? 'Ack=1 ' : ''}Win=64240 Len=0${ev.dur ? `  [connect: ${ev.dur.toFixed(1)} ms]` : ''}`;
        return { src, dst, proto, info, layers, cls };
      }
      case 'quic':
        proto = 'QUIC'; layers.push('udp', 'quic');
        info = ev.dir === 'req' ? `Initial, DCID=${ev.cid}, CRYPTO (Client Hello, SNI=${host})` : `Handshake, SCID=${ev.cid}  [handshake: ${ev.dur.toFixed(1)} ms]`;
        return { src, dst, proto, info, layers, cls: 'tls' };
      case 'tls':
        proto = 'TLS'; layers.push('tcp', 'tls');
        info = ev.dir === 'req' ? `Client Hello (SNI=${host})` : `Server Hello, Change Cipher Spec, Application Data  [handshake: ${ev.dur.toFixed(1)} ms]`;
        return { src, dst, proto, info, layers, cls: 'tls' };
      case 'http': {
        const v = ev.alpn === 'h3' ? 'HTTP3' : ev.alpn === 'h2' ? 'HTTP2' : 'HTTP';
        proto = v; layers.push(ev.alpn === 'h3' ? 'udp' : 'tcp', 'http', v.toLowerCase()); if (ev.app) layers.push('app');
        const short = ev.path.length > 46 ? ev.path.slice(0, 43) + '…' : ev.path;
        if (ev.dir === 'req') info = v === 'HTTP' ? `GET ${short} HTTP/1.1` : `HEADERS[1]: GET ${short}`;
        else {
          const size = ev.size ? `${(ev.size / 1024).toFixed(1)} kB` : ev.tao ? 'from cache' : 'size withheld';
          info = (v === 'HTTP' ? `HTTP/1.1 ${ev.status} OK (${ev.type})` : `HEADERS[1]: ${ev.status} OK, DATA[1] (${ev.type})`) + `  [${size}${ev.dur ? ` · ${ev.dur.toFixed(1)} ms` : ''}${ev.tao ? '' : ' · timing withheld (TAO)'}]`;
        }
        return { src, dst, proto, info, layers, cls: ev.app ? 'app' : 'http' };
      }
      case 'ssh':
        proto = 'SSH'; layers.push('tcp', 'ssh');
        return { src, dst, proto, info: `${fwd ? 'Client' : 'Server'}: Encrypted packet (len=${ev.len})`, layers, cls: 'ssh' };
      case 'icmp':
        proto = 'ICMP'; layers.push('icmp');
        return {
          src: ev.dir === 'req' ? 'you' : ev.target, dst: ev.dir === 'req' ? ev.target : 'you', proto, layers, cls: 'icmp',
          info: ev.dir === 'req' ? `Echo (ping) request  id=0x4d41, seq=${ev.seq}/${ev.seq << 8}, ttl=64` : `Echo (ping) reply    id=0x4d41, seq=${ev.seq}/${ev.seq << 8}, ttl=${ev.ttl}  time=${ev.time.toFixed(1)} ms${ev.real ? '' : ' (sim)'}`,
        };
    }
    return { src, dst, proto, info, layers, cls: 'tcp' };
  }

  function liveBuild(F) {
    if (F.bytes) return F;
    const ev = F.ev, host = ev.host || 'manafos.local';
    const fwd = F.src === 'you';
    const you = { mac: MAC.you, name: 'you', ip: YOU_IP };
    const peerHost = ev.kind === 'dns' ? 'resolver' : ev.kind === 'icmp' ? 'manafos.local' : host;
    const peer = { mac: peerHost === 'manafos.local' ? MAC.manaf : MAC.gw, name: peerHost === 'manafos.local' ? 'manaf' : 'gateway', ip: ipFor(peerHost) };
    const [S, D] = fwd ? [you, peer] : [peer, you];
    const sp = portFor(host), dp = srvPort(host);
    const base = { srcMac: S.mac, dstMac: D.mac, srcName: S.name, dstName: D.name, srcIp: S.ip, dstIp: D.ip };
    const realNote = '[Timings are real, measured by your browser · addresses are placeholders]';
    let built;
    switch (ev.kind) {
      case 'dns': {
        const q = ev.dir === 'q';
        built = frame({ ...base, l4: 'udp', sport: q ? sp : 53, dport: q ? 53 : sp, payload: (b) => {
          const s = b.pos; const kids = [];
          b.u16(ev.id); kids.push(field(`Transaction ID: ${hex(ev.id)}`, s, s + 2));
          b.u16(q ? 0x0100 : 0x8180); kids.push(field(`Flags: ${q ? '0x0100 Standard query' : '0x8180 Standard query response, No error'}`, s + 2, s + 4));
          b.u16(1); b.u16(0); b.u16(0); b.u16(0);
          kids.push(field('Questions: 1', s + 4, s + 6), field('Answer RRs: 0', s + 6, s + 8), field('Authority RRs: 0', s + 8, s + 10), field('Additional RRs: 0', s + 10, s + 12));
          const qs = b.pos;
          ev.qname.split('.').forEach((l) => { b.u8(l.length); b.str(l); }); b.u8(0); b.u16(1); b.u16(1);
          kids.push(field('Queries', qs, b.pos, [field(`${ev.qname}: type A, class IN`, qs, b.pos)]));
          if (!q) kids.push(field(`[Time: ${ev.dur.toFixed(3)} ms]`), field("[Answer withheld: browsers don't expose resolved addresses to pages]"));
          kids.push(field(realNote));
          return Object.assign(field(`Domain Name System (${q ? 'query' : 'response'})`, s, b.pos, kids), { open: true });
        } });
        break;
      }
      case 'tcp': {
        const f = ev.flags;
        const flags = f === 'SYN' ? 0x02 : f === 'SYNACK' ? 0x12 : f === 'FIN' ? 0x11 : 0x10;
        const win = ev.note === 'zero' ? 0 : ev.note === 'update' ? (ev.win || 65535) : 64240;
        built = frame({ ...base, l4: 'tcp', sport: fwd ? sp : dp, dport: fwd ? dp : sp, seq: fnv(host + f + F.no), flags, win, payload: ev.dur || ev.note || f === 'FIN' ? (b) => {
          const kids = [];
          if (ev.dur) kids.push(field(`[Connect time: ${ev.dur.toFixed(3)} ms]`), field(realNote));
          if (ev.note === 'zero') kids.push(field(`[Window ${ev.app} minimized: receiver advertises a zero window]`));
          if (ev.note === 'update') kids.push(field(`[Window Update: ${ev.what}]`));
          if (f === 'FIN') kids.push(field(`[Connection to ${ev.app} closed gracefully]`));
          return Object.assign(field('[SEQ/ACK analysis]', null, null, kids), { open: true });
        } : null });
        break;
      }
      case 'tls': case 'quic': {
        const req = ev.dir === 'req';
        const fn = (b) => {
          const s = b.pos; const kids = [];
          b.u8(0x16); b.u16(0x0303); const lp = b.pos; b.u16(0); b.u8(req ? 1 : 2); b.u8(0); b.u16(0);
          kids.push(field('Content Type: Handshake (22)', s, s + 1), field('Version: 0x0303', s + 1, s + 3));
          const hs = b.pos;
          if (req) { b.str(`sni=${host};alpn=${ev.alpn || 'h2'};`); kids.push(field(`Server Name: ${host}`, hs, hs + 4 + host.length), field(`ALPN Next Protocol: ${ev.alpn || 'h2'}`, hs + 5 + host.length, b.pos)); }
          else { b.str(`alpn=${ev.alpn || 'h2'};`); kids.push(field(`ALPN Next Protocol: ${ev.alpn || 'h2'}`, hs, b.pos), field(`[Handshake time: ${ev.dur.toFixed(3)} ms]`)); }
          const len = b.pos - lp - 2; b.a[lp] = len >> 8; b.a[lp + 1] = len & 255;
          kids.push(field("[TLS version isn't exposed to pages]"), field(realNote));
          return Object.assign(field(`${ev.kind === 'quic' ? 'QUIC IETF · ' : ''}Transport Layer Security: Handshake Protocol: ${req ? 'Client Hello' : 'Server Hello'}`, s, b.pos, kids), { open: true });
        };
        built = ev.kind === 'quic' ? frame({ ...base, l4: 'udp', sport: fwd ? sp : dp, dport: fwd ? dp : sp, payload: fn })
          : frame({ ...base, l4: 'tcp', sport: fwd ? sp : dp, dport: fwd ? dp : sp, seq: fnv(host + 'tls' + F.no), payload: fn });
        break;
      }
      case 'http': {
        const req = ev.dir === 'req', h2 = ev.alpn === 'h2' || ev.alpn === 'h3';
        const lines = req
          ? (h2 ? [':method: GET', `:path: ${ev.path}`, `:authority: ${host}`, ':scheme: https', `accept: ${ev.app ? 'application/x-manafos-app' : '*/*'}`] : [`GET ${ev.path} HTTP/1.1`, `Host: ${host}`, 'Accept: */*'])
          : (h2 ? [`:status: ${ev.status}`, `content-type: ${ev.type}`, ...(ev.size ? [`content-length: ${ev.size}`] : [])] : [`HTTP/1.1 ${ev.status} OK`, `Content-Type: ${ev.type}`, ...(ev.size ? [`Content-Length: ${ev.size}`] : [])]);
        const gen = [];
        if (!req && ev.dur) gen.push(`[Time since request: ${ev.dur.toFixed(3)} ms]`);
        if (!req) gen.push(ev.size ? `[Transfer size: ${ev.size} bytes]` : ev.tao ? '[Served from browser cache]' : '[Transfer size withheld by server]');
        if (!req && !ev.tao) gen.push('[Detailed timing withheld by server: no Timing-Allow-Origin]');
        if (ev.app) gen.push(`[ManafOS app: ${ev.app}]`); else gen.push(realNote);
        const pl = textPayload(h2 ? (ev.alpn === 'h3' ? 'HyperText Transfer Protocol 3' : 'HyperText Transfer Protocol 2') : 'Hypertext Transfer Protocol', [...lines.map((l) => ({ raw: l + '\r\n' })), { raw: '\r\n' }], gen);
        built = ev.alpn === 'h3' ? frame({ ...base, l4: 'udp', sport: fwd ? sp : dp, dport: fwd ? dp : sp, payload: pl })
          : frame({ ...base, l4: 'tcp', sport: fwd ? sp : dp, dport: fwd ? dp : sp, seq: fnv(host + ev.path + F.no), payload: pl });
        break;
      }
      case 'ssh': {
        built = frame({ ...base, l4: 'tcp', sport: fwd ? sp : 22, dport: fwd ? 22 : sp, seq: fnv('ssh' + F.no), payload: (b) => {
          const s = b.pos; const r = new Uint8Array(ev.len); crypto.getRandomValues(r); b.u32(ev.len); b.raw(r);
          return Object.assign(field('SSH Protocol', s, b.pos, [field(`Packet Length (encrypted): ${ev.len}`, s, s + 4), field(`Encrypted Packet: ${[...r.slice(0, 8)].map((x) => x.toString(16).padStart(2, '0')).join('')}…`, s + 4, b.pos), field('[Direction: ' + (fwd ? 'client-to-server' : 'server-to-client') + ']'), field('[The content is encrypted. That is the point.]')]), { open: true });
        } });
        break;
      }
      case 'icmp': {
        const req = ev.dir === 'req';
        const extra = req ? [] : [`[Response time: ${ev.time.toFixed(3)} ms]`, ev.real ? `[Measured: real HTTP HEAD round trip to ${location.hostname}]` : '[Simulated: page opened without a server]'];
        built = frame({ ...base, l4: 'icmp', ttl: req ? 64 : ev.ttl, icmp: { type: req ? 8 : 0, id: 0x4d41, seq: ev.seq, extra }, payload: (b) => { b.str(`ManafOS ping -> ${ev.target} `.padEnd(48, '.')); return null; } });
        break;
      }
    }
    F.bytes = built.bytes; F.tree = built.tree; F.len = built.bytes.length;
    return F;
  }

  function pushLive(ev) {
    ev.t = ev.t != null ? ev.t : t0();
    const s = liveSummary(ev);
    const F = { ev, time: (ev.t / 1000).toFixed(6), ...s, len: 0, no: 0 };
    liveBuild(F);
    F.rec = {
      proto: s.proto.toLowerCase(), host: (ev.host || (ev.kind === 'icmp' ? ev.target : 'manafos.local')).toLowerCase(), src: s.src.toLowerCase(), dst: s.dst.toLowerCase(),
      info: s.info.toLowerCase(), len: F.len, time: ev.t / 1000, path: (ev.path || '').toLowerCase(), status: ev.status || null, app: ev.app || null,
      layers: s.layers, frame: [s.src, s.dst, s.proto, s.info, ev.host, ev.path, ev.app, ev.cmd].filter(Boolean).join(' ').toLowerCase(),
    };
    // keep the capture time-ordered (late resource entries can arrive out of order)
    let i = LIVE.length;
    while (i > 0 && LIVE[i - 1].ev.t > ev.t) i--;
    LIVE.splice(i, 0, F);
    if (LIVE.length > 1500) LIVE.shift();
    LIVE.forEach((f, k) => { f.no = k + 1; });
    return F;
  }

  function seedFromTimings() {
    if (seeded) return; seeded = true;
    const seen = new Set();
    const add = (entry, path, isNav) => {
      let url; try { url = new URL(entry.name, location.href); } catch (e) { return; }
      if (url.searchParams.has('icmp')) return;   // our own ping probes are shown as ICMP
      const host = url.hostname || 'localhost';
      SRV.set(host, url.port ? +url.port : url.protocol === 'https:' ? 443 : 80);
      const alpn = entry.nextHopProtocol === 'h3' ? 'h3' : entry.nextHopProtocol === 'h2' ? 'h2' : 'http/1.1';
      const tao = entry.connectEnd > 0 || entry.requestStart > 0 || isNav;
      if (!seen.has(host)) {
        seen.add(host);
        if (entry.domainLookupEnd > entry.domainLookupStart) {
          const id = fnv(host) & 0xffff;
          pushLive({ kind: 'dns', dir: 'q', id, qname: host, host, t: entry.domainLookupStart });
          pushLive({ kind: 'dns', dir: 'r', id, qname: host, host, t: entry.domainLookupEnd, dur: entry.domainLookupEnd - entry.domainLookupStart });
        }
        if (entry.connectEnd > entry.connectStart) {
          const tlsAt = entry.secureConnectionStart > 0 ? entry.secureConnectionStart : entry.connectEnd;
          if (alpn === 'h3') {
            const cid = (fnv(host) >>> 0).toString(16).slice(0, 8);
            pushLive({ kind: 'quic', dir: 'req', host, cid, alpn, t: entry.connectStart });
            pushLive({ kind: 'quic', dir: 'res', host, cid, alpn, t: entry.connectEnd, dur: entry.connectEnd - entry.connectStart });
          } else {
            pushLive({ kind: 'tcp', flags: 'SYN', host, t: entry.connectStart });
            pushLive({ kind: 'tcp', flags: 'SYNACK', host, back: true, t: tlsAt - 0.01, dur: tlsAt - entry.connectStart });
            pushLive({ kind: 'tcp', flags: 'ACK', host, t: tlsAt });
            if (entry.secureConnectionStart > 0) {
              pushLive({ kind: 'tls', dir: 'req', host, alpn, t: entry.secureConnectionStart + 0.01 });
              pushLive({ kind: 'tls', dir: 'res', host, alpn, t: entry.connectEnd, dur: entry.connectEnd - entry.secureConnectionStart });
            }
          }
        }
      }
      const reqAt = entry.requestStart > 0 ? entry.requestStart : entry.startTime;
      const end = entry.responseEnd > 0 ? entry.responseEnd : entry.startTime + entry.duration;
      pushLive({ kind: 'http', dir: 'req', host, path, alpn, t: reqAt });
      pushLive({ kind: 'http', dir: 'res', host, path, alpn, t: Math.max(end, reqAt + 0.01), status: entry.responseStatus || 200, type: isNav ? 'text/html' : ctype(url.pathname, entry.initiatorType, host), size: entry.transferSize || 0, dur: end - reqAt, tao });
    };
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) add(nav, location.pathname, true);
    performance.getEntriesByType('resource').forEach((r) => { try { add(r, new URL(r.name).pathname, false); } catch (e) {} });
    if ('PerformanceObserver' in window) {
      try { new PerformanceObserver((list) => { list.getEntries().forEach((r) => { try { add(r, new URL(r.name).pathname, false); } catch (e) {} }); onLive(); }).observe({ type: 'resource', buffered: false }); } catch (e) {}
    }
    onLive();
  }
  if (document.readyState === 'complete') setTimeout(seedFromTimings, 0); else addEventListener('load', () => setTimeout(seedFromTimings, 0));

  // OS events → packets
  function capture(e) {
    const appName = (id) => (typeof APPS !== 'undefined' && (APPS.find((a) => a.id === id) || {}).name) || id;
    switch (e.kind) {
      case 'open':
        pushLive({ kind: 'http', dir: 'req', host: 'manafos.local', path: `/apps/${e.app}`, alpn: 'h2', app: appName(e.app) });
        pushLive({ kind: 'http', dir: 'res', host: 'manafos.local', path: `/apps/${e.app}`, alpn: 'h2', app: appName(e.app), status: 200, type: 'application/x-manafos-app', size: e.size || 0, dur: 0.4 + Math.random(), tao: true, t: t0() + 0.4 });
        break;
      case 'close': pushLive({ kind: 'tcp', flags: 'FIN', host: 'manafos.local', app: appName(e.app) }); break;
      case 'min': pushLive({ kind: 'tcp', flags: 'ACK', host: 'manafos.local', back: true, note: 'zero', app: appName(e.app) }); break;
      case 'restore': pushLive({ kind: 'tcp', flags: 'ACK', host: 'manafos.local', back: true, note: 'update', win: 64240, what: `${appName(e.app)} restored` }); break;
      case 'max': pushLive({ kind: 'tcp', flags: 'ACK', host: 'manafos.local', back: true, note: 'update', win: 65535, what: `${appName(e.app)} ${e.on ? 'maximized' : 'unmaximized'}` }); break;
      case 'move': pushLive({ kind: 'tcp', flags: 'ACK', host: 'manafos.local', back: true, note: 'update', win: 64240, what: `${appName(e.app)} moved to ${e.x},${e.y}` }); break;
      case 'ssh': {
        const len = 32 + Math.ceil((e.cmd.length + 5) / 16) * 16;
        pushLive({ kind: 'ssh', host: 'manafos.local', len, cmd: e.cmd });
        pushLive({ kind: 'ssh', host: 'manafos.local', back: true, dir: 's', len: len + 48 + Math.floor(Math.random() * 6) * 16, t: t0() + 0.6 });
        break;
      }
      case 'icmp': pushLive({ kind: 'icmp', dir: e.dir, seq: e.seq, target: e.target, ttl: e.ttl, time: e.time, real: e.real, host: e.target }); break;
    }
    if (window.NetScene && e.kind !== 'icmp') NetScene.flash(0.12);
    onLive();
  }

  // ---------- display filters ----------
  const FIELDS = {
    career: { proto: 'Protocol (EDU, JOB, CERT, NET, SEC, EMB, IOT, ML, WEB, OPT)', type: 'education · job · cert · project', title: 'Role or project title', org: 'Organization', year: 'Any year the item was active', skill: 'An item in the stack', tag: 'networking, security, embedded, ml, web, iot…', status: 'current · completed · ongoing · in-progress', host: 'Destination host', len: 'Frame length', frame: 'Whole frame text' },
    live: { proto: 'DNS, TCP, TLS, QUIC, HTTP2, HTTP3, ICMP, SSH', host: 'Remote host', src: 'Source', dst: 'Destination', path: 'HTTP path', status: 'HTTP status', len: 'Frame length', time: 'Seconds since page load', info: 'Info column', app: 'ManafOS app', frame: 'Whole frame text' },
  };
  const ALIAS = { role: 'title', name: 'title', company: 'org', organization: 'org', skills: 'skill', tags: 'tag', date: 'year', 'frame.len': 'len', 'ip.dst': 'host', 'ip.addr': 'host', 'ip.src': 'src', 'http.request.uri': 'path', 'http.response.code': 'status', 'frame.time_relative': 'time' };
  const LAYERS = {
    career: ['eth', 'ip', 'tcp', 'career', 'edu', 'cert', 'job', 'net', 'sec', 'emb', 'iot', 'ml', 'web', 'opt', 'education', 'project', 'projects', 'jobs', 'certs'],
    live: ['eth', 'ip', 'tcp', 'udp', 'dns', 'tls', 'quic', 'http', 'http2', 'http3', 'icmp', 'ssh', 'app'],
  };
  const OPW = { eq: '==', ne: '!=', gt: '>', ge: '>=', lt: '<', le: '<=', contains: 'contains', matches: 'matches', '~': 'matches' };

  function FErr(msg) { const e = new Error(msg); e.filter = true; return e; }
  function tokenize(s) {
    const out = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '"' || c === "'") {
        let j = i + 1, v = '';
        while (j < s.length && s[j] !== c) { v += s[j] === '\\' && j + 1 < s.length ? s[++j] : s[j]; j++; }
        if (j >= s.length) throw FErr('Unterminated string');
        out.push({ t: 'str', v }); i = j + 1; continue;
      }
      const two = s.slice(i, i + 2);
      if (['==', '!=', '>=', '<=', '&&', '||'].includes(two)) { out.push({ t: 'op', v: two }); i += 2; continue; }
      if ('<>!()~='.includes(c)) { out.push({ t: 'op', v: c === '=' ? '==' : c }); i++; continue; }
      const m = s.slice(i).match(/^[A-Za-z0-9_.\-\/+#:]+/);
      if (m) { const w = m[0]; out.push(/^\d+(\.\d+)?$/.test(w) ? { t: 'num', v: parseFloat(w), raw: w } : { t: 'word', v: w }); i += w.length; continue; }
      throw FErr(`Unexpected "${c}"`);
    }
    return out;
  }
  function cmp1(v, op, val) {
    if (v == null) return op === '!=';
    if (op === 'contains') return String(v).toLowerCase().includes(String(val).toLowerCase());
    if (op === 'matches') { try { return new RegExp(val, 'i').test(String(v)); } catch (e) { return false; } }
    const nv = Number(v), nx = Number(val);
    const numeric = typeof v !== 'boolean' && String(v).trim() !== '' && !isNaN(nv) && !isNaN(nx);
    if (['>', '>=', '<', '<='].includes(op)) return numeric && (op === '>' ? nv > nx : op === '>=' ? nv >= nx : op === '<' ? nv < nx : nv <= nx);
    const eq = numeric ? nv === nx : String(v).toLowerCase() === String(val).toLowerCase();
    return op === '==' ? eq : !eq;
  }
  const compare = (v, op, val) => Array.isArray(v) ? (op === '!=' ? !v.some((e) => cmp1(e, '==', val)) : v.some((e) => cmp1(e, op, val))) : cmp1(v, op, val);

  function compile(src, mode) {
    const toks = tokenize(src);
    if (!toks.length) return null;
    const fields = Object.keys(FIELDS[mode]), layers = LAYERS[mode];
    let i = 0;
    const peek = () => toks[i], next = () => toks[i++];
    const kw = (t, ...ks) => t && ((t.t === 'op' && ks.includes(t.v)) || (t.t === 'word' && ks.includes(t.v.toLowerCase())));
    const orE = () => { let l = andE(); while (kw(peek(), '||', 'or')) { next(); const a = l, r = andE(); l = (x) => a(x) || r(x); } return l; };
    const andE = () => { let l = notE(); while (kw(peek(), '&&', 'and')) { next(); const a = l, r = notE(); l = (x) => a(x) && r(x); } return l; };
    const notE = () => { if (kw(peek(), '!', 'not')) { next(); const e = notE(); return (x) => !e(x); } return prim(); };
    const prim = () => {
      const t = next();
      if (!t) throw FErr('Expression expected');
      if (t.t === 'op' && t.v === '(') { const e = orE(); const c = next(); if (!c || c.v !== ')') throw FErr('Missing ")"'); return e; }
      if (t.t === 'str' || t.t === 'num') { const v = String(t.t === 'num' ? t.raw : t.v).toLowerCase(); return (x) => x.frame.includes(v); }
      if (t.t !== 'word') throw FErr(`Unexpected "${t.v}"`);
      const name = t.v.toLowerCase(), f = ALIAS[name] || name;
      const o = peek();
      const opv = o && (o.t === 'op' && ['==', '!=', '>=', '<=', '>', '<', '~'].includes(o.v) ? OPW[o.v] || o.v : o.t === 'word' ? OPW[o.v.toLowerCase()] : null);
      if (opv) {
        if (!fields.includes(f)) throw FErr(`"${t.v}" is neither a field nor a protocol name`);
        next();
        const vt = next();
        if (!vt || !['str', 'num', 'word'].includes(vt.t)) throw FErr(`A value is expected after "${o.v}"`);
        const val = vt.t === 'num' ? vt.raw : vt.v;
        if (opv === 'matches') { try { new RegExp(val, 'i'); } catch (e) { throw FErr('Invalid regular expression'); } }
        return (x) => compare(x[f], opv, val);
      }
      if (layers.includes(name)) return (x) => x.layers.includes(name);
      if (fields.includes(f)) return (x) => { const v = x[f]; return Array.isArray(v) ? v.length > 0 : v != null && v !== ''; };
      if (/^[a-z]+\.[a-z_.]+$/.test(name)) throw FErr(`"${t.v}" is neither a field nor a protocol name`);
      return (x) => x.frame.includes(name);
    };
    const fn = orE();
    if (i < toks.length) throw FErr(`Unexpected "${toks[i].v}"`);
    return fn;
  }

  // Plain-English questions become filters (shown in yellow, like Wireshark's "questionable" state)
  const STOP = new Set('a an the and or of to in on at for with about your yours you me my i is are was were be been do does did what which who whom how where when why tell show list give all any have has had can could would should will please manaf his he him some more info anything something stuff things thing kind kinds type types ever really most best favourite favorite know like using use used'.split(' '));
  const NL_TYPE = [[/^(jobs?|work(ed|s|ing)?|experience|career|compan(y|ies)|employ\w*|roles?|positions?)$/, 'type == "job"'], [/^(projects?|built|build|making|made|hacks?|hackathon)$/, 'type == "project"'], [/^(certs?|certifications?|certified|certificates?|exams?|studying)$/, 'type == "cert"'], [/^(education|stud(y|ied)|university|degree|college|school|uni|graduat\w*)$/, 'type == "education"']];
  const NL_TAG = [[/^(network(ing|s)?|routing|switching|cisco)$/, 'tag == "networking"'], [/^(security|cyber\w*|firewalls?|soc|defen[cs]e|hacking)$/, 'tag == "security"'], [/^(embedded|electronics|hardware|robots?|robotics|firmware|microcontrollers?)$/, 'tag == "embedded" || tag == "robotics"'], [/^(ai|ml|machine|learning|deep|vision)$/, 'tag == "ml"'], [/^(web|websites?|frontend|3d)$/, 'tag == "web"'], [/^(iot|sensors?)$/, 'tag == "iot" || frame contains "sensor"'], [/^(now|current(ly)?|today|latest|recent(ly)?)$/, 'status == "current" || status == "in-progress" || status == "ongoing"'], [/^(health|medical|parkinson'?s?)$/, 'tag == "health"']];
  const NL_CONTACT = /^(contact|email|mail|hire|reach|phone|linkedin|github|call|message)$/;
  function interpret(text) {
    const words = text.toLowerCase().replace(/[?!.,;:]/g, ' ').split(/\s+/).filter(Boolean);
    if (!words.length || /[=<>&|()"]/.test(text)) return null;
    const types = [], tags = [], kws = []; let contact = false;
    words.forEach((w) => {
      if (NL_CONTACT.test(w)) { contact = true; return; }
      const ty = NL_TYPE.find(([rx]) => rx.test(w)); if (ty) { if (!types.includes(ty[1])) types.push(ty[1]); if (/graduat/.test(w)) kws.push('graduation'); return; }
      const tg = NL_TAG.find(([rx]) => rx.test(w)); if (tg) { if (!tags.includes(tg[1])) tags.push(tg[1]); return; }
      if (/^skills?$|^stack$|^tech\w*$|^tools?$|^languages?$/.test(w)) { if (!kws.includes('skill')) kws.push('skill'); return; }
      if (STOP.has(w) || w.length < 2) return;
      kws.push(w);
    });
    const group = (arr) => arr.length > 1 ? '(' + arr.join(' || ') + ')' : arr[0];
    const parts = [];
    if (types.length) parts.push(group(types));
    if (tags.length) parts.push(group(tags.map((t) => t.includes('||') ? `(${t})` : t)));
    const kw = kws.map((w) => (w === 'skill' ? 'skill' : `frame contains "${w.replace(/"/g, '')}"`));
    if (kw.length) parts.push(group(kw));
    if (!parts.length) return contact ? { filter: '', contact } : null;
    return { filter: parts.join(' && '), contact };
  }

  // ---------- UI state ----------
  const st = {
    tab: 'career', root: null,
    filter: { career: '', live: '' }, fn: { career: null, live: null }, state: { career: 'empty', live: 'empty' }, note: { career: '', live: '' },
    sel: { career: null, live: null }, open: new Set(),
    hl: null, overlay: null, contactCta: false,
  };
  const frames = () => (st.tab === 'career' ? careerFrames : LIVE);
  const visible = () => {
    const fn = st.fn[st.tab], txt = st.filter[st.tab];
    return frames().filter((F) => (!F.hidden || (fn && SENIOR_RX.test(txt))) && (!fn || fn(F.rec)));
  };
  const total = () => (st.tab === 'career' ? careerFrames.filter((f) => !f.hidden).length : LIVE.length);

  const CHIPS = {
    career: [['Jobs', 'type == "job"'], ['Projects', 'type == "project"'], ['Certs', 'type == "cert"'], ['Networking', 'tag == "networking"'], ['Security', 'tag == "security"'], ['Embedded', 'tag == "embedded"'], ['Since 2024', 'year >= 2024'], ['Python', 'skill == "python"']],
    live: [['HTTP', 'http'], ['DNS', 'dns'], ['TLS', 'tls || quic'], ['Handshakes', 'tcp && info contains "syn"'], ['ICMP', 'icmp'], ['SSH', 'ssh'], ['My clicks', 'host == "manafos.local"'], ['Big frames', 'len > 400']],
  };
  const EXAMPLES = ['skill == "python"', 'year >= 2024 && proto == JOB', 'esp32', 'tag == "security" && type == "project"', 'org contains "meeza"', 'what did you build with esp32?'];

  function html() {
    return `
    <div class="insp" data-tab="${st.tab}">
      <div class="insp-bar">
        <div class="insp-tabs" role="tablist">
          <button class="insp-tab" data-tab="career" role="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>career.pcapng</button>
          <button class="insp-tab" data-tab="live" role="tab"><span class="rec"></span>live: you <span class="insp-count" data-pkts>${LIVE.length}</span></button>
        </div>
        <div class="insp-tools">
          <button data-act="follow" title="Follow stream (double-click a packet)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h10M4 18h16"/></svg><span>Follow Stream</span></button>
          <button data-act="io" title="Statistics: I/O Graph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 17 9 11 13 15 21 7"/></svg><span>I/O Graph</span></button>
          <button data-act="expand" title="Expand or collapse all subtrees"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 9l4-4 4 4M16 15l-4 4-4-4"/></svg><span>Expand</span></button>
        </div>
      </div>
      <div class="insp-filter">
        <div class="insp-fwrap">
          <svg class="insp-bm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          <input class="insp-input" type="text" spellcheck="false" autocomplete="off" aria-label="Display filter">
          <button class="insp-clear" title="Clear filter" aria-label="Clear filter">×</button>
          <button class="insp-apply" title="Apply (Enter)" aria-label="Apply filter">→</button>
          <div class="insp-ac" role="listbox"></div>
        </div>
        <div class="insp-chips"></div>
        <div class="insp-hint"></div>
      </div>
      <div class="insp-panes">
        <div class="insp-list" tabindex="0">
          <table><thead><tr><th class="c-no">No.</th><th class="c-time">Time</th><th class="c-src">Source</th><th class="c-dst">Destination</th><th class="c-proto">Protocol</th><th class="c-len">Length</th><th class="c-info">Info</th></tr></thead><tbody></tbody></table>
          <div class="insp-empty"></div>
        </div>
        <div class="insp-tree"></div>
        <div class="insp-hex"></div>
      </div>
      <div class="insp-status"><span class="st-file"></span><span class="st-count"></span><span class="st-note"></span></div>
      <div class="insp-overlay" hidden></div>
      <div class="insp-ctx" hidden></div>
    </div>`;
  }

  function mount(root) {
    st.root = root;
    const $ = (s) => root.querySelector(s);
    const input = $('.insp-input');

    root.addEventListener('click', (e) => {
      const tab = e.target.closest('.insp-tab'); if (tab) { switchTab(tab.dataset.tab); return; }
      const chip = e.target.closest('.insp-chip'); if (chip) { setFilter(chip.dataset.f, true); return; }
      const ex = e.target.closest('[data-ex]'); if (ex) { setFilter(ex.dataset.ex, true); return; }
      const act = e.target.closest('[data-act]');
      if (act) {
        const a = act.dataset.act;
        if (a === 'follow') follow(); else if (a === 'io') ioGraph(); else if (a === 'expand') expandAll();
        else if (a === 'close-ov') closeOverlay(); else if (a === 'contact' && typeof openApp === 'function') openApp('contact');
        return;
      }
      const row = e.target.closest('.insp-list tbody tr'); if (row) { select(+row.dataset.no); return; }
      const tn = e.target.closest('.tn'); if (tn) { toggleNode(tn); return; }
      const hb = e.target.closest('[data-i]'); if (hb) { const n = deepest(+hb.dataset.i); if (n) { st.hl = n.k; paintHl(n); } return; }
      if (!e.target.closest('.insp-ctx')) hideCtx();
    });
    $('.insp-list').addEventListener('dblclick', (e) => { const row = e.target.closest('tbody tr'); if (row) { select(+row.dataset.no); follow(); } });
    $('.insp-list').addEventListener('contextmenu', (e) => {
      const row = e.target.closest('tbody tr'); if (!row) return;
      e.preventDefault(); select(+row.dataset.no); showCtx(e);
    });
    $('.insp-list').addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); step(e.key === 'ArrowDown' ? 1 : -1); }
      else if (e.key === 'Enter') follow();
    });
    root.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') { e.preventDefault(); input.focus(); input.select(); }
      if (e.key === 'Escape' && st.overlay) closeOverlay();
    });
    $('.insp-tree').addEventListener('mouseover', (e) => { const tn = e.target.closest('.tn'); if (tn) paintHl(findNode(tn.dataset.k), true); });
    $('.insp-tree').addEventListener('mouseleave', () => paintHl(st.hl ? findNode(st.hl) : null));
    $('.insp-hex').addEventListener('mouseover', (e) => { const b = e.target.closest('[data-i]'); if (b) paintHl(deepest(+b.dataset.i), true); });
    $('.insp-hex').addEventListener('mouseleave', () => paintHl(st.hl ? findNode(st.hl) : null));

    // filter input with autocomplete
    let acIdx = -1, acItems = [], debounce = 0;
    const ac = $('.insp-ac');
    const closeAc = () => { ac.classList.remove('on'); acIdx = -1; acItems = []; };
    const showAc = () => {
      const v = input.value.slice(0, input.selectionStart);
      const m = v.match(/([A-Za-z_.]+)$/);
      const prev = v.slice(0, m ? v.length - m[1].length : v.length).trim();
      if (!m || (prev && !/(\(|&&|\|\||!|\band|\bor|\bnot)$/.test(prev))) { closeAc(); return; }
      const w = m[1].toLowerCase();
      const opts = [...Object.entries(FIELDS[st.tab]).map(([k, d]) => [k, d, 'field']), ...LAYERS[st.tab].map((l) => [l, 'protocol', 'proto'])]
        .filter(([k]) => k.startsWith(w) && k !== w).slice(0, 7);
      if (!opts.length) { closeAc(); return; }
      acItems = opts; acIdx = 0;
      ac.innerHTML = opts.map(([k, d, kind], i) => `<div class="ac-it${i === 0 ? ' on' : ''}" data-k="${k}"><b>${k}</b><span>${esc(d)}</span><i>${kind}</i></div>`).join('');
      ac.classList.add('on');
    };
    const acceptAc = (k) => {
      const pos = input.selectionStart, v = input.value;
      const before = v.slice(0, pos).replace(/([A-Za-z_.]+)$/, k + (FIELDS[st.tab][k] ? ' ' : ''));
      input.value = before + v.slice(pos);
      input.setSelectionRange(before.length, before.length);
      closeAc(); onInput();
    };
    ac.addEventListener('mousedown', (e) => { const it = e.target.closest('.ac-it'); if (it) { e.preventDefault(); acceptAc(it.dataset.k); } });
    const onInput = () => {
      clearTimeout(debounce);
      const txt = input.value;
      validate(txt);
      debounce = setTimeout(() => { if (st.state[st.tab] !== 'bad') applyFilter(); }, 220);
    };
    input.addEventListener('input', () => { onInput(); showAc(); });
    input.addEventListener('keydown', (e) => {
      if (ac.classList.contains('on')) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); acIdx = (acIdx + (e.key === 'ArrowDown' ? 1 : -1) + acItems.length) % acItems.length; ac.querySelectorAll('.ac-it').forEach((x, i) => x.classList.toggle('on', i === acIdx)); return; }
        if (e.key === 'Tab' || (e.key === 'Enter' && acIdx >= 0)) { e.preventDefault(); acceptAc(acItems[acIdx][0]); return; }
        if (e.key === 'Escape') { closeAc(); return; }
      }
      if (e.key === 'Enter') { e.preventDefault(); clearTimeout(debounce); applyFilter(); }
    });
    input.addEventListener('blur', () => setTimeout(closeAc, 120));
    $('.insp-clear').addEventListener('click', () => setFilter('', true));
    $('.insp-apply').addEventListener('click', () => applyFilter());

    switchTab(st.tab, true);
  }

  // ---------- filter state ----------
  function validate(txt) {
    const mode = st.tab;
    st.filter[mode] = txt; st.note[mode] = ''; st.contactCta = false;
    if (!txt.trim()) { st.fn[mode] = null; st.state[mode] = 'empty'; return paintFilterState(); }
    try {
      st.fn[mode] = compile(txt, mode); st.state[mode] = 'ok';
    } catch (err) {
      const nl = mode === 'career' ? interpret(txt) : null;
      if (nl) {
        st.contactCta = nl.contact;
        if (nl.filter) {
          st.fn[mode] = compile(nl.filter + (SENIOR_RX.test(txt) ? ' || frame contains "graduation"' : ''), mode);
          st.state[mode] = 'nl'; st.note[mode] = `Interpreted as: <code>${esc(nl.filter)}</code>`;
        } else { st.fn[mode] = () => false; st.state[mode] = 'nl'; st.note[mode] = 'Looking to reach me?'; }
      } else { st.fn[mode] = null; st.state[mode] = 'bad'; st.note[mode] = esc(err.filter ? err.message : 'Invalid filter'); }
    }
    paintFilterState();
  }
  function paintFilterState() {
    if (!st.root) return;
    const input = st.root.querySelector('.insp-input'), hint = st.root.querySelector('.insp-hint');
    input.classList.remove('ok', 'bad', 'nl');
    if (st.state[st.tab] !== 'empty') input.classList.add(st.state[st.tab]);
    hint.innerHTML = st.note[st.tab] ? `<span class="h-${st.state[st.tab]}">${st.note[st.tab]}</span>${st.contactCta ? ' <button class="insp-cta" data-act="contact">Open Contact →</button>' : ''}` : '';
    hint.classList.toggle('on', !!st.note[st.tab]);
  }
  function setFilter(txt, apply) {
    if (!st.root) { st.filter[st.tab] = txt; return; }
    const input = st.root.querySelector('.insp-input');
    input.value = txt; validate(txt);
    if (apply) applyFilter();
  }
  function applyFilter() {
    if (st.state[st.tab] === 'bad') { st.root.querySelector('.insp-input').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 220 }); return; }
    renderList();
    const vis = visible();
    const cur = st.sel[st.tab];
    if (!vis.some((F) => F.no === cur)) select(vis.length ? vis[0].no : null); else renderDetail();
  }

  function switchTab(tab, first) {
    st.tab = tab;
    const r = st.root; if (!r) return;
    r.dataset.tab = tab;
    r.querySelectorAll('.insp-tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    const input = r.querySelector('.insp-input');
    input.placeholder = tab === 'career' ? 'Apply a display filter … try: skill == "python"   or ask: what did you build with esp32?' : 'Apply a display filter … try: http2   or   dns   or   len > 400';
    input.value = st.filter[tab];
    r.querySelector('.insp-chips').innerHTML = CHIPS[tab].map(([l, f]) => `<button class="insp-chip" data-f="${esc(f)}" title="${esc(f)}">${l}</button>`).join('');
    r.querySelector('.st-file').innerHTML = tab === 'career' ? '<i class="dot"></i>career.pcapng' : '<i class="dot rec"></i>live: you · capturing';
    r.querySelector('.st-note').textContent = tab === 'career' ? 'Illustrative capture: my career encoded as packets' : 'Timings are real · addresses are placeholders · nothing leaves your browser';
    validate(st.filter[tab]);
    if (tab === 'live') seedFromTimings();
    renderList();
    const vis = visible();
    if (st.sel[tab] == null || !vis.some((F) => F.no === st.sel[tab])) st.sel[tab] = vis.length ? vis[0].no : null;
    renderDetail();
    if (tab === 'live' && !first) { const l = r.querySelector('.insp-list'); l.scrollTop = l.scrollHeight; }
    closeOverlay();
  }

  // ---------- packet list ----------
  const rowHtml = (F) => `<tr data-no="${F.no}" class="r-${F.cls}${F.no === st.sel[st.tab] ? ' sel' : ''}"><td class="c-no">${F.no}</td><td class="c-time">${esc(F.time)}</td><td class="c-src">${esc(F.src)}</td><td class="c-dst">${esc(F.dst)}</td><td class="c-proto">${esc(F.proto)}</td><td class="c-len">${F.len}</td><td class="c-info">${esc(F.info)}</td></tr>`;
  function renderList() {
    if (!st.root) return;
    const vis = visible();
    st.root.querySelector('.insp-list tbody').innerHTML = vis.map(rowHtml).join('');
    const empty = st.root.querySelector('.insp-empty');
    empty.innerHTML = vis.length ? '' : (st.tab === 'live' && !LIVE.length ? 'Waiting for packets…' : `No packets match. Try ${EXAMPLES.slice(0, 3).map((x) => `<button data-ex="${esc(x)}">${esc(x)}</button>`).join(' ')}`);
    renderStatus(vis.length);
  }
  function renderStatus(n) {
    const tot = total();
    const shown = n != null ? n : visible().length;
    st.root.querySelector('.st-count').textContent = `Packets: ${tot} · Displayed: ${shown} (${tot ? (shown / tot * 100).toFixed(1) : '0.0'}%)`;
  }
  function select(no) {
    st.sel[st.tab] = no; st.hl = null;
    if (!st.root) return;
    st.root.querySelectorAll('.insp-list tbody tr.sel').forEach((r) => r.classList.remove('sel'));
    const row = st.root.querySelector(`.insp-list tbody tr[data-no="${no}"]`);
    if (row) { row.classList.add('sel'); const l = st.root.querySelector('.insp-list'); const rt = row.offsetTop, rb = rt + row.offsetHeight; if (rt < l.scrollTop + 26) l.scrollTop = rt - 26; else if (rb > l.scrollTop + l.clientHeight) l.scrollTop = rb - l.clientHeight; }
    renderDetail();
  }
  function step(d) {
    const vis = visible(); if (!vis.length) return;
    const i = vis.findIndex((F) => F.no === st.sel[st.tab]);
    select(vis[Math.max(0, Math.min(vis.length - 1, (i < 0 ? 0 : i + d)))].no);
  }
  const current = () => frames().find((F) => F.no === st.sel[st.tab]) || null;

  // ---------- detail tree + hex ----------
  let flat = [];   // [{k, node, depth}]
  let hexEls = [];
  function renderDetail() {
    if (!st.root) return;
    const F = current();
    const tree = st.root.querySelector('.insp-tree'), hx = st.root.querySelector('.insp-hex');
    if (!F) {
      tree.innerHTML = `<div class="insp-intro"><b>${st.tab === 'career' ? 'My career, as a packet capture.' : 'Your session, captured live.'}</b>${st.tab === 'career'
        ? `Type a Wireshark display filter, or just ask a question.<div class="ex">${EXAMPLES.map((x) => `<button data-ex="${esc(x)}">${esc(x)}</button>`).join('')}</div>Double-click any packet to <em>Follow</em> its stream.`
        : 'Every DNS lookup, TCP handshake and TLS hello your browser made to load this page, with real timings. Open apps, run terminal commands or click the desktop to ping, and watch them land here.'}</div>`;
      hx.innerHTML = ''; flat = []; hexEls = []; return;
    }
    liveBuild(F);
    flat = [];
    const walk = (nodes, depth, path) => nodes.forEach((n, i) => {
      const k = path + '.' + i; n.k = k;
      flat.push({ k, n, depth });
      if (n.kids && isOpen(n, k)) walk(n.kids, depth + 1, k);
    });
    walk(F.tree, 0, 'n');
    tree.innerHTML = flat.map(({ k, n, depth }) => {
      const open = n.kids && isOpen(n, k);
      return `<div class="tn${n.r ? '' : ' gen'}${n.kids ? ' has' : ''}${open ? ' open' : ''}" data-k="${k}" style="--d:${depth}"><span class="tw">${n.kids ? '›' : ''}</span>${esc(n.t)}</div>`;
    }).join('');
    // hex dump
    const b = F.bytes; let out = '';
    for (let o = 0; o < b.length; o += 16) {
      let h = '', a = '';
      for (let j = 0; j < 16; j++) {
        const i = o + j;
        if (i < b.length) {
          h += `<span data-i="${i}">${b[i].toString(16).padStart(2, '0')}</span>${j === 7 ? '<s> </s>' : ''}`;
          const c = b[i]; a += `<span data-i="${i}">${c >= 32 && c < 127 ? esc(String.fromCharCode(c)) : '·'}</span>`;
        } else h += '<span class="pad">  </span>' + (j === 7 ? '<s> </s>' : '');
      }
      out += `<div class="hx-row"><span class="hx-off">${o.toString(16).padStart(4, '0')}</span><span class="hx-b">${h}</span><span class="hx-a">${a}</span></div>`;
    }
    hx.innerHTML = out;
    hexEls = []; hx.querySelectorAll('[data-i]').forEach((el) => { const i = +el.dataset.i; (hexEls[i] = hexEls[i] || []).push(el); });
    // default highlight: the application layer
    const app = flat.filter((f) => f.depth === 0 && f.n.r).pop();
    paintHl(st.hl ? findNode(st.hl) : app ? app.n : null);
  }
  // Subtrees stay expanded per position, like Wireshark remembering expanded protocol trees
  const isOpen = (n, k) => !st.open.has('!' + k) && (st.open.has(k) || !!n.open);
  const findNode = (k) => (flat.find((f) => f.k === k) || {}).n || null;
  function deepest(i) {
    let best = null, bd = -1;
    flat.forEach(({ n, depth }) => { if (n.r && i >= n.r[0] && i < n.r[1] && depth >= bd) { best = n; bd = depth; } });
    return best;
  }
  let painted = [];
  function paintHl(n, hover) {
    painted.forEach((el) => el.classList.remove('hl'));
    painted = [];
    if (!st.root) return;
    st.root.querySelectorAll('.tn.hl').forEach((e) => e.classList.remove('hl'));
    if (!n) return;
    const row = st.root.querySelector(`.tn[data-k="${n.k}"]`);
    if (row) row.classList.add('hl');
    if (n.r) {
      for (let i = n.r[0]; i < n.r[1]; i++) (hexEls[i] || []).forEach((el) => { el.classList.add('hl'); painted.push(el); });
      if (!hover && painted[0]) { const hx = st.root.querySelector('.insp-hex'); const top = painted[0].parentElement.parentElement.offsetTop; if (top < hx.scrollTop || top > hx.scrollTop + hx.clientHeight - 20) hx.scrollTop = top - 20; }
    }
  }
  function toggleNode(tn) {
    const k = tn.dataset.k, n = findNode(k);
    if (!n) return;
    st.hl = k;
    if (n.kids) {
      if (isOpen(n, k)) { st.open.delete(k); st.open.add('!' + k); } else { st.open.delete('!' + k); st.open.add(k); }
      renderDetail();
    } else paintHl(n);
  }
  function expandAll() {
    const F = current(); if (!F) return;
    const all = [];
    const key = (nodes, p) => nodes.forEach((n, i) => { const k = p + '.' + i; if (n.kids) { all.push([n, k]); key(n.kids, k); } });
    key(F.tree, 'n');
    const expand = all.some(([n, k]) => !isOpen(n, k));
    all.forEach(([, k]) => { st.open.delete(expand ? '!' + k : k); st.open.add(expand ? k : '!' + k); });
    renderDetail();
  }

  // ---------- context menu ----------
  function showCtx(e) {
    const F = current(); if (!F) return;
    const m = st.root.querySelector('.insp-ctx'), rr = st.root.getBoundingClientRect();
    const byOrg = st.tab === 'career' ? `org == "${F.p.org}"` : `host == "${F.rec.host}"`;
    m.innerHTML = `
      <div data-c="follow">Follow ▸ ${st.tab === 'career' || F.ev.kind === 'http' || F.ev.kind === 'ssh' ? 'TCP Stream' : 'Stream'}</div>
      <div data-c="f1">Apply as Filter ▸ <code>${esc(st.tab === 'career' ? `proto == ${F.proto}` : F.proto.toLowerCase())}</code></div>
      <div data-c="f2">Apply as Filter ▸ <code>${esc(byOrg)}</code></div>
      <div data-c="nf">Prepare as Filter ▸ <code>!(${esc(byOrg)})</code></div>
      <hr><div data-c="copy">Copy ▸ Summary as Text</div>`;
    m.hidden = false;
    m.style.left = Math.min(e.clientX - rr.left, rr.width - 280) + 'px'; m.style.top = Math.min(e.clientY - rr.top, rr.height - 160) + 'px';
    m.onclick = (ev) => {
      const c = ev.target.closest('[data-c]'); if (!c) return;
      hideCtx();
      if (c.dataset.c === 'follow') follow();
      if (c.dataset.c === 'f1') setFilter(st.tab === 'career' ? `proto == ${F.proto}` : F.proto.toLowerCase(), true);
      if (c.dataset.c === 'f2') setFilter(byOrg, true);
      if (c.dataset.c === 'nf') { setFilter(`!(${byOrg})`, false); st.root.querySelector('.insp-input').focus(); }
      if (c.dataset.c === 'copy') { const t = `${F.no}\t${F.time}\t${F.src}\t${F.dst}\t${F.proto}\t${F.len}\t${F.info}`; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => typeof showToast === 'function' && showToast('Copied', 'Packet summary copied', 'var(--cyan)')).catch(() => {}); }
    };
  }
  function hideCtx() { const m = st.root && st.root.querySelector('.insp-ctx'); if (m) m.hidden = true; }

  // ---------- overlays: Follow Stream, I/O Graph ----------
  function overlay(htmlStr, kind) {
    const ov = st.root.querySelector('.insp-overlay');
    ov.innerHTML = htmlStr; ov.hidden = false; ov.dataset.kind = kind; st.overlay = kind;
    ov.animate([{ opacity: 0, transform: 'translateY(8px) scale(.99)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' });
    return ov;
  }
  function closeOverlay() { const ov = st.root && st.root.querySelector('.insp-overlay'); if (ov) { ov.hidden = true; ov.innerHTML = ''; } st.overlay = null; }

  let followToken = 0;
  function follow() {
    const F = current(); if (!F || !st.root) return;
    const token = ++followToken;
    let msgs, title;
    if (st.tab === 'career') {
      msgs = F.stream; title = `Follow TCP Stream (tcp.stream eq ${F.no - 1}) · ${esc(F.p.title)}`;
    } else if (F.ev.kind === 'ssh') {
      const gib = (n) => { const r = new Uint8Array(n); crypto.getRandomValues(r); return [...r].map((x) => String.fromCharCode(33 + (x % 90))).join(''); };
      msgs = [['c', gib(48)], ['s', gib(96)], ['c', gib(32)], ['s', '[The content is encrypted. That is the point. Try the Terminal instead.]']];
      title = 'Follow TCP Stream · ssh manafos.local';
    } else if (F.ev.kind === 'http') {
      const req = LIVE.find((x) => x.ev.kind === 'http' && x.ev.dir === 'req' && x.ev.path === F.ev.path && x.ev.host === F.ev.host);
      const res = LIVE.find((x) => x.ev.kind === 'http' && x.ev.dir === 'res' && x.ev.path === F.ev.path && x.ev.host === F.ev.host);
      const txt = (x) => { if (!x) return ''; liveBuild(x); const s = x.tree[x.tree.length - 1]; return (s.kids || []).filter((k) => k.r).map((k) => k.t).join('\n'); };
      msgs = [['c', txt(req)], ['s', txt(res)]].filter((m) => m[1]);
      title = `Follow ${esc(F.proto)} Stream · ${esc(F.ev.host)}${esc(F.ev.path)}`;
    } else {
      msgs = [['c', F.info], ['s', 'This packet has no application stream. Select an HTTP or SSH packet, or switch to career.pcapng.']];
      title = 'Follow Stream';
    }
    const bytes = msgs.reduce((s, m) => s + m[1].length, 0);
    const ov = overlay(`
      <div class="fs">
        <div class="ov-head"><span>${title}</span><button data-act="close-ov" title="Close (Esc)">×</button></div>
        <div class="fs-body"></div>
        <div class="ov-foot"><span>Entire conversation (${bytes} bytes)</span><span class="fs-legend"><i class="c"></i>you → manaf <i class="s"></i>manaf → you</span>
          ${st.tab === 'career' ? '<button data-fs="prev">◂ Prev stream</button><button data-fs="next">Next stream ▸</button>' : ''}</div>
      </div>`, 'follow');
    ov.querySelectorAll('[data-fs]').forEach((b) => b.addEventListener('click', () => { step(b.dataset.fs === 'next' ? 1 : -1); follow(); }));
    const body = ov.querySelector('.fs-body');
    let skip = false;
    body.addEventListener('click', () => { skip = true; });
    (async () => {
      for (const [who, text] of msgs) {
        if (token !== followToken || !body.isConnected) return;
        const div = document.createElement('div'); div.className = 'fs-' + who; body.appendChild(div);
        if (who === 'c' || skip || FX.reduced) { div.textContent = text; if (!skip) await FX.sleep(220); }
        else { div.classList.add('typing'); await FX.type(div, text, 110, () => { body.scrollTop = body.scrollHeight; }); div.classList.remove('typing'); }
        body.scrollTop = body.scrollHeight;
      }
    })();
  }

  function ioGraph() {
    if (!st.root) return;
    const ov = overlay(`
      <div class="io">
        <div class="ov-head"><span>Statistics ▸ I/O Graph · ${st.tab === 'career' ? 'career.pcapng (items active per year)' : 'live: you (packets per second)'}</span><button data-act="close-ov" title="Close (Esc)">×</button></div>
        <div class="io-wrap"><canvas class="io-c"></canvas></div>
        <div class="ov-foot"><span class="io-leg"><i style="background:var(--accent)"></i>All packets <i style="background:var(--cyan)"></i>Displayed${st.filter[st.tab] ? `: <code>${esc(st.filter[st.tab])}</code>` : ''}</span></div>
      </div>`, 'io');
    const cv = ov.querySelector('.io-c');
    const vis = new Set(visible().map((F) => F.no));
    let xs = [], all = [], disp = [], xl = (x) => x;
    if (st.tab === 'career') {
      for (let y = 2018; y <= NOW_YEAR; y++) xs.push(y);
      const active = (F, y) => F.rec.year.includes(y);
      all = xs.map((y) => careerFrames.filter((F) => !F.hidden && active(F, y)).length);
      disp = xs.map((y) => careerFrames.filter((F) => vis.has(F.no) && active(F, y)).length);
      xl = (x) => String(x);
    } else {
      const end = Math.max(1, Math.ceil((LIVE.length ? LIVE[LIVE.length - 1].ev.t : 1000) / 1000));
      const bucket = Math.max(1, Math.ceil(end / 60));
      for (let s = 0; s <= end; s += bucket) xs.push(s);
      all = xs.map((s) => LIVE.filter((F) => F.ev.t / 1000 >= s && F.ev.t / 1000 < s + bucket).length);
      disp = xs.map((s) => LIVE.filter((F) => vis.has(F.no) && F.ev.t / 1000 >= s && F.ev.t / 1000 < s + bucket).length);
      xl = (x) => x + 's';
    }
    const draw = (p) => {
      const r = cv.parentElement.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      cv.width = r.width * d; cv.height = r.height * d; const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0);
      const W = r.width, H = r.height, L = 40, R = 14, T = 16, B = 30;
      const max = Math.max(4, Math.ceil(Math.max(...all) / 4) * 4), sx = (i) => L + (W - L - R) * (xs.length > 1 ? i / (xs.length - 1) : 0.5), sy = (v) => H - B - (H - T - B) * v / max;
      g.font = '10px "JetBrains Mono", monospace'; g.fillStyle = FX.tok('--text-faint'); g.strokeStyle = FX.tok('--canvas-grid'); g.lineWidth = 1;
      for (let k = 0; k <= 4; k++) { const v = max * k / 4, y = sy(v); g.beginPath(); g.moveTo(L, y); g.lineTo(W - R, y); g.stroke(); g.fillText(v % 1 ? v.toFixed(1) : String(v), 6, y + 3); }
      const every = Math.ceil(xs.length / 10);
      xs.forEach((x, i) => { if (i % every === 0) g.fillText(xl(x), sx(i) - 12, H - 10); });
      const line = (arr, col, fill) => {
        const n = Math.max(1, Math.round(arr.length * p));
        g.beginPath(); arr.slice(0, n).forEach((v, i) => (i ? g.lineTo(sx(i), sy(v)) : g.moveTo(sx(i), sy(v))));
        g.strokeStyle = col; g.lineWidth = 2; g.shadowColor = col; g.shadowBlur = FX.isDark() ? 10 : 4; g.stroke(); g.shadowBlur = 0;
        if (fill) { g.lineTo(sx(n - 1), sy(0)); g.lineTo(sx(0), sy(0)); g.closePath(); const gr = g.createLinearGradient(0, T, 0, H - B); gr.addColorStop(0, col + '55'); gr.addColorStop(1, col + '00'); g.fillStyle = gr; g.fill(); }
        arr.slice(0, n).forEach((v, i) => { g.beginPath(); g.arc(sx(i), sy(v), 2.6, 0, 7); g.fillStyle = col; g.fill(); });
      };
      line(all, FX.tok('--accent'), true); line(disp, FX.tok('--cyan'), false);
    };
    const t1 = performance.now();
    const anim = (now) => { const p = FX.reduced ? 1 : Math.min(1, (now - t1) / 700); if (!cv.isConnected) return; draw(p); if (p < 1) requestAnimationFrame(anim); };
    requestAnimationFrame(anim);
  }

  // ---------- live updates ----------
  let liveRaf = 0;
  function onLive() {
    document.querySelectorAll('[data-pkts]').forEach((e) => { e.textContent = LIVE.length; });
    const tray = document.getElementById('tray-pkts');
    if (tray) { tray.classList.remove('bump'); void tray.offsetWidth; tray.classList.add('bump'); }
    if (!st.root || !st.root.isConnected || st.tab !== 'live' || liveRaf) return;
    liveRaf = requestAnimationFrame(() => {
      liveRaf = 0;
      const l = st.root.querySelector('.insp-list');
      const atBottom = l.scrollTop + l.clientHeight >= l.scrollHeight - 40;
      renderList();
      if (st.sel.live == null) { const v = visible(); if (v.length) select(v[0].no); }
      else st.root.querySelectorAll('.insp-list tbody tr').forEach((r) => r.classList.toggle('sel', +r.dataset.no === st.sel.live));
      if (atBottom) l.scrollTop = l.scrollHeight;
    });
  }

  // ---------- public ----------
  function open(o = {}) {
    if (o.tab) st.tab = o.tab;
    if (o.filter != null) st.filter[st.tab] = o.filter;
    const wasOpen = st.root && st.root.isConnected;
    if (typeof openApp === 'function') openApp('inspector', o.from);
    if (wasOpen || (st.root && st.root.isConnected)) {
      switchTab(st.tab);
      if (o.filter != null) setFilter(o.filter, true);
      if (o.select) { const F = careerFrames.find((f) => f.p.id === o.select); if (F) select(F.no); }
    }
  }
  const find = (id) => CAREER.find((p) => p.id === id);

  return { html, mount, capture, open, find, CAREER, count: () => LIVE.length };
})();
