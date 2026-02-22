/**
 * VANYADOING-STYLE PORTFOLIO
 * Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initNavigation();
    initSkillBars();
    initScrollAnimations();
});

/**
 * Loading Screen Animation
 */
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('loading-progress');

    if (!loadingScreen || !progressBar) return;

    let progress = 0;
    const duration = 2000;
    const interval = 20;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
        progress += increment;
        progressBar.style.width = Math.min(progress, 100) + '%';

        if (progress >= 100) {
            clearInterval(timer);
            setTimeout(() => {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 600);
            }, 300);
        }
    }, interval);
}

/**
 * Navigation & Mobile Menu
 */
function initNavigation() {
    const hamburger = document.getElementById('hamburger-menu');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }

    // Navbar background on scroll
    const navBar = document.querySelector('.nav-bar');
    if (navBar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navBar.style.background = 'rgba(5, 5, 8, 0.95)';
                navBar.style.backdropFilter = 'blur(20px)';
            } else {
                navBar.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)';
                navBar.style.backdropFilter = 'none';
            }
        });
    }
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
                    }, 200);
                }
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => observer.observe(bar));
}

/**
 * Scroll Animations
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.info-card, .skill-card, .security-card');

    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

/**
 * Glitch Effect on Hover
 */
document.querySelectorAll('.glitch').forEach(el => {
    el.addEventListener('mouseenter', () => {
        el.style.animation = 'glitchIn 0.3s ease';
    });

    el.addEventListener('mouseleave', () => {
        el.style.animation = '';
    });
});

/**
 * Contact Form Handling
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
