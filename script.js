/**
 * ENHANCED CYBERPUNK PORTFOLIO
 * Premium Animations & Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initParticles();
    initNavigation();
    initScrollAnimations();
    initSkillBars();
    initActiveNav();
    initMorphAnimations();
    initPageTransitions();
});

/**
 * Loading Screen
 */
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');

    if (!loadingScreen) return;

    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 800);
    }, 2500);
}

/**
 * Particle System
 */
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = window.innerWidth < 768 ? 25 : 50;
    const colors = ['#ff003c', '#00f0ff', '#ff2a6d'];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random positioning
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';

        // Random color
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.boxShadow = `0 0 10px ${color}`;

        // Random size
        const size = 2 + Math.random() * 3;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        container.appendChild(particle);
    }
}

/**
 * Navigation
 */
function initNavigation() {
    const hamburger = document.getElementById('hamburger-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('menu-overlay');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            if (menuOverlay) {
                menuOverlay.classList.toggle('active');
            }
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                if (menuOverlay) {
                    menuOverlay.classList.remove('active');
                }
            });
        });

        // Close menu when clicking on overlay
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                menuOverlay.classList.remove('active');
            });
        }
    }

    // Navbar background on scroll
    const navBar = document.querySelector('.nav-bar');
    if (navBar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navBar.style.background = 'rgba(2, 2, 3, 0.95)';
                navBar.style.backdropFilter = 'blur(20px)';
            } else {
                navBar.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%)';
                navBar.style.backdropFilter = 'none';
            }
        });
    }
}

/**
 * Scroll Animations
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.info-card, .skill-card, .security-card');

    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    animatedElements.forEach(el => observer.observe(el));
}

/**
 * Skill Bars Animation
 */
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');

    if (skillBars.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const progress = bar.getAttribute('data-progress');
                if (progress) {
                    setTimeout(() => {
                        bar.style.width = progress;
                    }, 300);
                }
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => observer.observe(bar));
}

/**
 * Active Navigation State
 */
function initActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-tab').forEach(tab => {
        const tabHref = tab.getAttribute('href');
        if (tabHref === currentPage || (currentPage === '' && tabHref === 'index.html')) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

/**
 * Morph Animations — Clip-path reveals + Staggered entrances
 */
function initMorphAnimations() {
    // Morph reveal observer (clip-path morph on scroll)
    const morphIO = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                morphIO.unobserve(e.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.morph-reveal').forEach(el => morphIO.observe(el));

    // Morph stagger observer
    const staggerIO = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                staggerIO.unobserve(e.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.morph-stagger').forEach(el => staggerIO.observe(el));
}

/**
 * Page Transitions — Circle morph wipe between pages
 */
function initPageTransitions() {
    const transition = document.getElementById('page-transition');
    if (!transition) return;

    // Intercept internal nav links for morphing page transition
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        // Skip external links
        if (link.hostname && link.hostname !== window.location.hostname) return;

        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            // Don't transition to current page
            if (href === window.location.pathname.split('/').pop()) return;

            e.preventDefault();
            transition.classList.add('active');

            setTimeout(() => {
                window.location.href = href;
            }, 600);
        });
    });

    // Reverse transition on page load (shrink circle out)
    if (sessionStorage.getItem('pageTransition')) {
        transition.classList.add('active');
        transition.style.transition = 'none';
        requestAnimationFrame(() => {
            transition.style.transition = '';
            transition.classList.remove('active');
        });
        sessionStorage.removeItem('pageTransition');
    }

    // Mark that we're transitioning
    window.addEventListener('beforeunload', () => {
        if (transition.classList.contains('active')) {
            sessionStorage.setItem('pageTransition', '1');
        }
    });
}

/**
 * Contact Form
 */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm)
            });

            const result = await response.json();

            if (result.success) {
                submitBtn.textContent = 'Message Sent!';
                submitBtn.style.background = '#39ff14';
                contactForm.reset();

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            submitBtn.textContent = 'Error - Try Again';
            submitBtn.disabled = false;

            setTimeout(() => {
                submitBtn.textContent = originalText;
            }, 3000);
        }
    });
}

/**
 * Mouse Parallax Effect for Hero
 */
document.addEventListener('mousemove', (e) => {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg || window.innerWidth < 1024) return;

    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;

    heroBg.style.transform = `scale(1.05) translate(${x}px, ${y}px)`;
});

/**
 * Glitch Effect on Random Elements
 */
setInterval(() => {
    const glitchElements = document.querySelectorAll('.page-title');
    const randomEl = glitchElements[Math.floor(Math.random() * glitchElements.length)];

    if (randomEl && Math.random() > 0.7) {
        randomEl.style.animation = 'glitchReveal 0.3s ease';
        setTimeout(() => {
            randomEl.style.animation = '';
        }, 300);
    }
}, 5000);
