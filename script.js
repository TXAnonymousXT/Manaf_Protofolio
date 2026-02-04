/**
 * CYBERPUNK 2077 PORTFOLIO - Loading & Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initLoadingSequence();
    initHamburgerMenu();
});

/**
 * Initialize the boot sequence loading screen
 */
function initLoadingSequence() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    const progressBar = document.querySelector('.loading-progress');
    const percentText = document.querySelector('.loading-percent');
    const bootLines = document.querySelectorAll('.boot-line');

    // Boot sequence timing
    const bootTimings = [200, 500, 900, 1400]; // When each boot line appears
    const totalDuration = 2000; // Total loading time in ms

    let startTime = null;
    let animationFrame = null;

    // Show boot lines at specific times
    bootTimings.forEach((time, index) => {
        setTimeout(() => {
            bootLines[index].classList.add('visible');
        }, time);
    });

    // Animate progress bar
    function animateProgress(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min((elapsed / totalDuration) * 100, 100);

        progressBar.style.width = `${progress}%`;
        percentText.textContent = `${Math.floor(progress)}%`;

        if (elapsed < totalDuration) {
            animationFrame = requestAnimationFrame(animateProgress);
        } else {
            // Loading complete
            completeLoading();
        }
    }

    function completeLoading() {
        // Add glitch effect before transition
        const glitchLogo = document.querySelector('.glitch-logo');
        glitchLogo.style.animation = 'glitch 0.1s infinite';

        setTimeout(() => {
            // Fade out loading screen
            loadingScreen.classList.add('fade-out');

            // Show main content
            mainContent.classList.remove('hidden');

            // Initialize main content animations
            initMainContentAnimations();

            // Remove loading screen from DOM after transition
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 200);
    }

    // Start the animation
    requestAnimationFrame(animateProgress);
}

/**
 * Initialize animations for main content
 */
function initMainContentAnimations() {
    // Animate skill bars on scroll
    const skillCards = document.querySelectorAll('.skill-card');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.skill-progress');
                if (progressBar) {
                    progressBar.style.width = progressBar.style.getPropertyValue('--progress');
                }
            }
        });
    }, observerOptions);

    skillCards.forEach(card => {
        // Initially set progress to 0
        const progressBar = card.querySelector('.skill-progress');
        if (progressBar) {
            const targetProgress = progressBar.style.getPropertyValue('--progress');
            progressBar.style.setProperty('--progress', targetProgress);
            progressBar.style.width = '0%';
        }
        skillObserver.observe(card);
    });

    // Add glitch effect on hover for elements with .glitch class
    const glitchElements = document.querySelectorAll('.glitch');
    glitchElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.animation = 'glitch 0.15s infinite';
        });
        el.addEventListener('mouseleave', () => {
            el.style.animation = '';
        });
    });

    // Typing effect for hero subtitle (optional enhancement)
    initTypingEffect();
}

/**
 * Typing effect for the hero subtitle
 */
function initTypingEffect() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;

    const originalText = typingElement.textContent;
    const statements = [
        'I build. I secure. I solve.',
        'Networks are my playground.',
        'Security is my mindset.',
        'Code is my language.'
    ];

    let currentIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const current = statements[currentIndex];

        if (isDeleting) {
            typingElement.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === current.length) {
            // Pause at end
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            currentIndex = (currentIndex + 1) % statements.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    // Start typing after a delay
    setTimeout(type, 1000);
}

/**
 * Add random glitch effects periodically
 */
function addRandomGlitch() {
    const glitchTargets = document.querySelectorAll('.hero-title, .nav-logo');

    setInterval(() => {
        const randomTarget = glitchTargets[Math.floor(Math.random() * glitchTargets.length)];
        randomTarget.style.animation = 'glitch 0.1s infinite';

        setTimeout(() => {
            randomTarget.style.animation = '';
        }, 200);
    }, 5000);
}

// Initialize random glitch after page loads
setTimeout(addRandomGlitch, 3000);

/**
 * Initialize navigation tabs highlighting on scroll
 */
function initNavTabs() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('section[id]');

    // Only add scroll behavior for hash links (same-page navigation)
    navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const href = tab.getAttribute('href');
            // Only prevent default for hash links (e.g., #about), not page links (e.g., about.html)
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (href && href.endsWith('.html')) {
                // Epic page transition for page links
                e.preventDefault();
                triggerPageTransition(href);
            }
            // For .html links, let the browser navigate normally
        });
    });

    // Highlight active tab on scroll (only for same-page sections)
    if (sections.length > 0) {
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '-100px 0px -50% 0px'
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('id');
                    navTabs.forEach(tab => {
                        tab.classList.remove('active');
                        if (tab.getAttribute('href') === `#${sectionId}`) {
                            tab.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => sectionObserver.observe(section));
    }
}

/**
 * Initialize contact form handling
 */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMessage = document.getElementById('form-success');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);

        // Submit to Web3Forms
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Show success animation
                form.style.display = 'none';
                successMessage.classList.remove('hidden');
                successMessage.style.animation = 'flicker 0.5s';

                // Reset after 5 seconds
                setTimeout(() => {
                    form.reset();
                    form.style.display = 'flex';
                    successMessage.classList.add('hidden');
                }, 5000);
            } else {
                alert('There was an error sending your message. Please try again.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            alert('There was an error sending your message. Please try again.');
        }
    });

    // Add focus effects to form inputs
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.querySelector('.form-label').style.color = 'var(--neon-pink)';
        });
        input.addEventListener('blur', () => {
            input.parentElement.querySelector('.form-label').style.color = 'var(--neon-cyan)';
        });
    });
}

// Initialize nav tabs and contact form after main content loads
document.addEventListener('DOMContentLoaded', () => {
    const hasLoadingScreen = document.getElementById('loading-screen');

    if (hasLoadingScreen) {
        // Wait for loading screen to finish on index page
        setTimeout(() => {
            initNavTabs();
            initContactForm();
        }, 2500);
    } else {
        // Initialize immediately on sub-pages
        initNavTabs();
        initContactForm();
    }
});

/**
 * Epic cyberpunk page transition effect
 */
function triggerPageTransition(targetUrl) {
    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.innerHTML = `
        <div class="transition-glitch-lines"></div>
        <div class="transition-scan-line"></div>
        <div class="transition-text">LOADING...</div>
    `;
    document.body.appendChild(overlay);

    // Trigger the animation
    requestAnimationFrame(() => {
        overlay.classList.add('active');

        // Add glitch to current content
        document.body.style.animation = 'pageGlitchOut 0.3s ease-out';

        // Navigate after animation
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 600);
    });
}

/**
 * Page enter animation (call on page load)
 */
function initPageEnterAnimation() {
    document.body.classList.add('page-entering');

    setTimeout(() => {
        document.body.classList.remove('page-entering');
        document.body.classList.add('page-entered');
    }, 500);
}

// Run page enter animation if not loading screen
document.addEventListener('DOMContentLoaded', () => {
    const hasLoadingScreen = document.getElementById('loading-screen');
    if (!hasLoadingScreen) {
        initPageEnterAnimation();
    }
});

/**
 * Initialize Cyberpunk Hamburger Menu
 */
function initHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuClose = document.getElementById('menu-close');

    if (!hamburgerBtn || !mobileMenu) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    // Toggle menu on hamburger click
    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');

        // Reset animation on re-open so it replays
        if (mobileMenu.classList.contains('active')) {
            mobileMenu.style.animation = 'none';
            mobileMenu.offsetHeight; // trigger reflow
            mobileMenu.style.animation = '';
        }
    });

    // Close menu on close button click
    if (menuClose) {
        menuClose.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Close menu on overlay click
    overlay.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            hamburgerBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
        }
    });
}
