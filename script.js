/**
 * Portfolio — Interactive Features
 * Floating Nodes, Floating Nav (draggable), 3D Cards,
 * Scroll Progress, Scroll Animations, Contact Form
 */

document.addEventListener("DOMContentLoaded", () => {
  initFloatingNodes();
  initFloatingNav();
  initMobileMenu();
  initCard3D();
  initScrollProgress();
  initScrollAnimations();
  initContactForm();
  initProgressBars();
});

/* ══════════════════════════════════════
   FLOATING NODES BACKGROUND
══════════════════════════════════════ */
function initFloatingNodes() {
  const container = document.getElementById("floating-nodes");
  const svg = document.getElementById("node-lines");
  if (!container || !svg) return;

  const nodes = [];
  const NODE_COUNT = 20;

  // Create nodes
  for (let i = 0; i < NODE_COUNT; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 8 + 4;
    const delay = Math.random() * 5;
    const duration = Math.random() * 10 + 15;
    const isAccent = i % 3 === 0;

    const dot = document.createElement("div");
    dot.className = "fnode";
    dot.style.cssText = `
      left:${x}%;top:${y}%;width:${size}px;height:${size}px;
      background:radial-gradient(circle,${isAccent ? "rgba(223,1,57,0.6)" : "rgba(30,30,39,0.4)"},transparent);
      box-shadow:0 0 ${isAccent ? 20 : 15}px ${isAccent ? "rgba(223,1,57,0.3)" : "rgba(30,30,39,0.2)"};
      animation:fnode-float ${duration}s ${delay}s ease-in-out infinite;
    `;
    container.appendChild(dot);
    nodes.push({ x, y, el: dot });
  }

  // Create connection lines
  const NS = "http://www.w3.org/2000/svg";
  const defs = document.createElementNS(NS, "defs");
  const grad = document.createElementNS(NS, "linearGradient");
  grad.id = "lineGrad";
  grad.setAttribute("x1", "0%"); grad.setAttribute("y1", "0%");
  grad.setAttribute("x2", "100%"); grad.setAttribute("y2", "100%");
  ["0", "50", "100"].forEach((off, i) => {
    const stop = document.createElementNS(NS, "stop");
    stop.setAttribute("offset", off + "%");
    stop.setAttribute("stop-color", "#df0139");
    stop.setAttribute("stop-opacity", i === 1 ? "0.5" : "0");
    grad.appendChild(stop);
  });
  defs.appendChild(grad);
  svg.appendChild(defs);

  for (let i = 0; i < 15; i++) {
    const n1 = nodes[i];
    const n2 = nodes[(i + 5) % nodes.length];
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", n1.x + "%");
    line.setAttribute("y1", n1.y + "%");
    line.setAttribute("x2", n2.x + "%");
    line.setAttribute("y2", n2.y + "%");
    line.setAttribute("stroke", "url(#lineGrad)");
    line.setAttribute("stroke-width", "1");
    line.style.cssText = `opacity:0;animation:line-fade 8s ${i * 0.3}s infinite`;
    svg.appendChild(line);
  }

  // Data packets
  for (let i = 0; i < 8; i++) {
    const n = nodes[i];
    const pkt = document.createElement("div");
    pkt.className = "data-packet";
    const dir = i % 2 === 0 ? 1 : -1;
    pkt.style.cssText = `
      left:${n.x}%;top:${n.y}%;
      animation:packet-move-${i % 2 === 0 ? "a" : "b"} 4s ${i * 0.5}s linear infinite;
    `;
    container.appendChild(pkt);
  }
}

/* ══════════════════════════════════════
   FLOATING NAV (DRAGGABLE)
══════════════════════════════════════ */
function initFloatingNav() {
  const nav = document.getElementById("floating-nav");
  const expanded = document.getElementById("nav-expanded");
  const collapsed = document.getElementById("nav-collapsed");
  const collapseBtn = document.getElementById("nav-collapse-btn");
  const dragHandle = document.getElementById("nav-drag-handle");
  if (!nav) return;

  let isDragging = false;
  let hasMoved = false;
  let isCollapsed = false;
  let edgeSide = null;
  let startX = 0, startY = 0;
  let offsetX = 0, offsetY = 0;
  const EDGE_THRESHOLD = 100;

  const sections = ["home", "about", "skills", "security", "contact"];
  const navLinks = nav.querySelectorAll(".nav-link");

  // Active section tracking
  function updateActiveSection() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    let active = "home";
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el && el.getBoundingClientRect().top <= 200) {
        active = sections[i];
        break;
      }
    }
    navLinks.forEach(link => {
      link.classList.toggle("active", link.dataset.section === active);
    });
  }
  const snapC = document.querySelector(".snap-container");
  if (snapC) snapC.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("scroll", updateActiveSection, { passive: true });

  // Smooth scroll helper — works with both snap-container and normal scroll
  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;
    const snapC = document.querySelector(".snap-container");
    if (snapC && snapC.scrollHeight > snapC.clientHeight) {
      // Snap container is the scrollable element
      const containerTop = snapC.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      snapC.scrollTo({ top: snapC.scrollTop + (targetTop - containerTop), behavior: "smooth" });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Smooth scroll on nav link click
  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      if (hasMoved) { e.preventDefault(); return; }
      e.preventDefault();
      scrollToSection(link.dataset.section);
    });
  });

  // CTA link
  nav.querySelectorAll(".nav-cta").forEach(cta => {
    cta.addEventListener("click", e => {
      if (hasMoved) { e.preventDefault(); return; }
      e.preventDefault();
      scrollToSection("contact");
    });
  });

  // Collapse/expand
  function collapseNav(side) {
    isCollapsed = true;
    edgeSide = side;
    expanded.style.display = "none";
    collapsed.style.display = "flex";
    collapsed.style.flexDirection = side === "left" ? "column" : "row";
    nav.style.transition = "all 0.3s ease";
    if (side === "left") {
      nav.style.left = "24px";
      nav.style.top = "50%";
      nav.style.transform = "translateY(-50%)";
      nav.style.right = "auto";
    } else {
      nav.style.right = "24px";
      nav.style.left = "auto";
      nav.style.top = "50%";
      nav.style.transform = "translateY(-50%)";
    }
  }

  function expandNav() {
    isCollapsed = false;
    collapsed.style.display = "none";
    expanded.style.display = "flex";
    nav.style.transition = "all 0.3s ease";
    if (edgeSide === "left") {
      nav.style.left = "50%";
      nav.style.right = "auto";
      nav.style.top = "24px";
      nav.style.transform = "translateX(-50%)";
    } else if (edgeSide === "right") {
      nav.style.left = "50%";
      nav.style.right = "auto";
      nav.style.top = "24px";
      nav.style.transform = "translateX(-50%)";
    }
    edgeSide = null;
  }

  collapsed.addEventListener("click", expandNav);

  if (collapseBtn) {
    collapseBtn.addEventListener("click", e => {
      e.stopPropagation();
      const rect = nav.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const mid = window.innerWidth / 2;
      collapseNav(cx < mid - 100 ? "left" : "right");
    });
  }

  // Drag
  function onDragStart(clientX, clientY) {
    if (isCollapsed) return;
    isDragging = true;
    hasMoved = false;
    const rect = nav.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    nav.style.transition = "none";
    nav.style.cursor = "grabbing";
  }

  function onDragMove(clientX, clientY) {
    if (!isDragging) return;
    hasMoved = true;
    let newLeft = clientX - offsetX;
    let newTop = clientY - offsetY;
    const navW = nav.offsetWidth;
    const navH = nav.offsetHeight;
    newLeft = Math.max(10, Math.min(window.innerWidth - navW - 10, newLeft));
    newTop = Math.max(10, Math.min(window.innerHeight - navH - 10, newTop));
    nav.style.left = newLeft + "px";
    nav.style.top = newTop + "px";
    nav.style.transform = "none";
    nav.style.right = "auto";

    // Edge detection
    if (clientX < EDGE_THRESHOLD) {
      collapseNav("left");
      isDragging = false;
    } else if (clientX > window.innerWidth - EDGE_THRESHOLD) {
      collapseNav("right");
      isDragging = false;
    }
  }

  function onDragEnd() {
    isDragging = false;
    nav.style.cursor = "";
    setTimeout(() => { hasMoved = false; }, 50);
  }

  // Mouse events
  dragHandle.addEventListener("mousedown", e => onDragStart(e.clientX, e.clientY));
  window.addEventListener("mousemove", e => onDragMove(e.clientX, e.clientY));
  window.addEventListener("mouseup", onDragEnd);

  // Touch events
  dragHandle.addEventListener("touchstart", e => {
    const t = e.touches[0];
    onDragStart(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener("touchmove", e => {
    if (!isDragging) return;
    const t = e.touches[0];
    onDragMove(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener("touchend", onDragEnd);
}

/* ══════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════ */
function initMobileMenu() {
  const hamburger = document.getElementById("nav-hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  if (!hamburger || !mobileMenu) return;

  const links = mobileMenu.querySelectorAll(".mobile-menu-link, .mobile-menu-cta");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
    document.body.style.overflow = mobileMenu.classList.contains("open") ? "hidden" : "";
  });

  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const section = link.dataset.section || "contact";
      hamburger.classList.remove("open");
      mobileMenu.classList.remove("open");
      document.body.style.overflow = "";
      const target = document.getElementById(section);
      if (!target) return;
      const snapC = document.querySelector(".snap-container");
      if (snapC && snapC.scrollHeight > snapC.clientHeight) {
        const containerTop = snapC.getBoundingClientRect().top;
        const targetTop = target.getBoundingClientRect().top;
        snapC.scrollTo({ top: snapC.scrollTop + (targetTop - containerTop), behavior: "smooth" });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

/* ══════════════════════════════════════
   3D CARD TILT
══════════════════════════════════════ */
function initCard3D() {
  document.querySelectorAll(".card-3d").forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = (y - cy) / 10;
      const rotateY = (cx - x) / 10;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
      card.style.transition = "transform 0.4s ease";
      setTimeout(() => card.style.transition = "", 400);
    });
  });
}

/* ══════════════════════════════════════
   SCROLL PROGRESS (RIGHT SIDE DOTS)
══════════════════════════════════════ */
function initScrollProgress() {
  const dots = document.querySelectorAll(".sp-dot");
  const sectionIds = ["home", "about", "skills", "security", "contact"];
  const snapContainer = document.querySelector(".snap-container");

  function update() {
    let activeIdx = 0;
    for (let i = sectionIds.length - 1; i >= 0; i--) {
      const el = document.getElementById(sectionIds[i]);
      if (el && el.getBoundingClientRect().top <= window.innerHeight / 2) {
        activeIdx = i;
        break;
      }
    }
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === activeIdx);
      dot.classList.toggle("past", i < activeIdx);
    });
  }

  if (snapContainer) {
    snapContainer.addEventListener("scroll", update, { passive: true });
  }
  window.addEventListener("scroll", update, { passive: true });
  update();

  // Click to scroll
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      const el = document.getElementById(sectionIds[i]);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
  });
}

/* ══════════════════════════════════════
   SCROLL ANIMATIONS (IntersectionObserver)
══════════════════════════════════════ */
function initScrollAnimations() {
  const animEls = document.querySelectorAll(".anim-fade-up, .anim-fade-left, .anim-fade-right");
  if (!animEls.length) return;

  const root = document.querySelector(".snap-container");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("anim-visible");
      }
    });
  }, { root: root, threshold: 0.1, rootMargin: "0px 0px -30px 0px" });

  animEls.forEach(el => {
    // Immediately show elements in the first section (hero)
    const section = el.closest('.snap-section');
    if (section && section.id === 'home') {
      // Stagger hero animations
      const delay = el.classList.contains('anim-fade-left') ? 200 : 500;
      setTimeout(() => el.classList.add("anim-visible"), delay);
    } else {
      observer.observe(el);
    }
  });
}

/* ══════════════════════════════════════
   PROGRESS BARS (Animate on scroll)
══════════════════════════════════════ */
function initProgressBars() {
  const bars = document.querySelectorAll(".skill-bar-fill, .progress-fill");
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.dataset.width;
        if (width) {
          entry.target.style.width = width + "%";
        }
        observer.unobserve(entry.target);
      }
    });
  }, { root: document.querySelector(".snap-container"), threshold: 0.3 });

  bars.forEach(bar => {
    bar.style.width = "0%";
    bar.style.transition = "width 1s ease-out";
    observer.observe(bar);
  });
}

/* ══════════════════════════════════════
   CONTACT FORM (Web3Forms)
══════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById("contact-form");
  const success = document.getElementById("form-success");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector(".form-submit");
    const originalText = btn.innerHTML;
    btn.innerHTML = "Sending...";
    btn.disabled = true;

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: new FormData(form),
      });
      if (res.ok) {
        form.style.display = "none";
        success.style.display = "flex";
      } else {
        btn.innerHTML = "Error — Try Again";
        btn.disabled = false;
        setTimeout(() => { btn.innerHTML = originalText; }, 3000);
      }
    } catch {
      btn.innerHTML = "Error — Try Again";
      btn.disabled = false;
      setTimeout(() => { btn.innerHTML = originalText; }, 3000);
    }
  });
}
