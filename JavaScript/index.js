'use strict';

// Global state management
const AppState = {
    theme: localStorage.getItem('theme') || 'light',
    isLoaded: false,
    isMobile: window.innerWidth <= 768,
    animations: {
        enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        queue: new Map()
    },
    performance: {
        intersectionObserver: null,
        resizeObserver: null,
        scrollTicking: false
    }
};

// Utility functions
const Utils = {
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    randomDelay(min = 50, max = 200) {
        return Math.random() * (max - min) + min;
    },

    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
};

// ============================================
//           ADVANCED THEME SYSTEM
// ============================================

class ModernThemeManager {
    constructor() {
        this.themeSwitch = document.getElementById('theme-switch');
        this.root = document.documentElement;
        this.transitionDuration = 300;
        this.init();
    }

    init() {
        this.applyTheme(AppState.theme, false);
        this.setupEventListeners();
        this.watchSystemTheme();
    }

    setupEventListeners() {
        if (this.themeSwitch) {
            this.themeSwitch.checked = AppState.theme === 'dark';
            this.themeSwitch.addEventListener('change', () => this.toggleTheme());
        }

        // Keyboard shortcut for theme toggle
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addListener((e) => {
            if (!localStorage.getItem('theme')) {
                const systemTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(systemTheme, true);
            }
        });
    }

    toggleTheme() {
        const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme, true);
        this.saveTheme(newTheme);
    }

    applyTheme(theme, animate = false) {
        AppState.theme = theme;
        
        if (animate) {
            document.body.style.transition = `all ${this.transitionDuration}ms var(--ease-out)`;
        }

        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Update theme-color meta tag
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.content = theme === 'dark' ? '#1e1e1e' : '#3b82f6';
        }

        if (animate) {
            setTimeout(() => {
                document.body.style.transition = '';
            }, this.transitionDuration);
        }

        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    saveTheme(theme) {
        localStorage.setItem('theme', theme);
        if (this.themeSwitch) {
            this.themeSwitch.checked = theme === 'dark';
        }
    }
}

// ============================================
//        ADVANCED SCROLL ANIMATIONS
// ============================================

class AdvancedScrollAnimations {
    constructor() {
        this.animatedElements = new Set();
        this.observerOptions = {
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
            rootMargin: '-10% 0px -10% 0px'
        };
        this.init();
    }

    init() {
        if (!AppState.animations.enabled) return;
        
        this.createObserver();
        this.observeElements();
        this.setupParallax();
    }

    createObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => this.handleIntersection(entry));
        }, this.observerOptions);

        AppState.performance.intersectionObserver = this.observer;
    }

    observeElements() {
        // Main animated elements
        const selectors = [
            '.animate-on-scroll',
            '.research-item',
            '.info-card',
            '.section-header',
            '.hero-content',
            '.hero-visual',
            '.about-content > div',
            '.faq-item'
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (!this.animatedElements.has(el)) {
                    this.observer.observe(el);
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(30px)';
                }
            });
        });
        
        // Special handling for research icons
        this.observeResearchIcons();
    }
    
    observeResearchIcons() {
        const researchIcons = document.querySelectorAll('.research-icon');
        researchIcons.forEach((icon, index) => {
            if (!this.animatedElements.has(icon)) {
                this.observer.observe(icon);
                // Icons start hidden and scaled down
                icon.style.opacity = '0';
                icon.style.transform = 'scale(0.8)';
                icon.style.transition = 'all 0.6s var(--ease-bounce)';
            }
        });
    }

    handleIntersection(entry) {
        const element = entry.target;
        
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
            this.animateElement(element);
            this.animatedElements.add(element);
            this.observer.unobserve(element);
        }
    }

    animateElement(element) {
        const delay = this.getAnimationDelay(element);
        const animationType = this.getAnimationType(element);
        
        setTimeout(() => {
            // Special handling for research icons
            if (element.classList.contains('research-icon')) {
                element.style.transition = 'all 0.6s var(--ease-bounce)';
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
                element.classList.add('animate');
            } else {
                element.style.transition = 'all 0.8s var(--ease-out)';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
            
            element.classList.add('animated', animationType);

            // Add special effects for certain elements
            this.addSpecialEffects(element);
        }, delay);
    }

    getAnimationDelay(element) {
        if (element.classList.contains('stagger-1')) return 100;
        if (element.classList.contains('stagger-2')) return 200;
        if (element.classList.contains('stagger-3')) return 300;
        if (element.classList.contains('stagger-4')) return 400;
        if (element.classList.contains('stagger-5')) return 500;
        if (element.classList.contains('stagger-6')) return 600;
        return Utils.randomDelay(0, 150);
    }

    getAnimationType(element) {
        if (element.classList.contains('research-item')) return 'scale-in';
        if (element.classList.contains('info-card')) return 'slide-up';
        if (element.classList.contains('hero-content')) return 'slide-right';
        if (element.classList.contains('hero-visual')) return 'slide-left';
        return 'fade-up';
    }

    addSpecialEffects(element) {
        // Add floating animation to certain elements
        if (element.classList.contains('research-icon')) {
            setTimeout(() => {
                element.classList.add('floating');
            }, 500);
        }

        // Add section divider animation
        if (element.classList.contains('section-header')) {
            const divider = element.querySelector('.section-divider');
            if (divider) {
                setTimeout(() => {
                    divider.style.transform = 'scaleX(1)';
                    divider.style.transformOrigin = 'left';
                }, 300);
            }
        }
    }

    setupParallax() {
        if (AppState.isMobile) return;

        const parallaxElements = document.querySelectorAll('.hero-image, .research-icon');
        
        window.addEventListener('scroll', Utils.throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            
            parallaxElements.forEach(el => {
                el.style.transform = `translateY(${rate}px)`;
            });
        }, 16));
    }
}

// ============================================
//           SMART HEADER SYSTEM
// ============================================

class SmartHeader {
    constructor() {
        this.header = document.querySelector('.header');
        this.logo = document.querySelector('.logo');
        this.lastScrollY = 0;
        this.scrollThreshold = 100;
        this.hideThreshold = 200;
        this.isHidden = false;
        this.init();
    }

    init() {
        if (!this.header) return;
        
        this.setupScrollHandler();
        this.setupLogoInteraction();
        this.setupMobileToggle();
    }

    setupScrollHandler() {
        window.addEventListener('scroll', Utils.throttle(() => {
            this.handleScroll();
        }, 16));
    }

    handleScroll() {
        const currentScrollY = window.pageYOffset;
        const scrollingDown = currentScrollY > this.lastScrollY;
        const scrolledPastThreshold = currentScrollY > this.scrollThreshold;
        
        // Add/remove scrolled class with smooth transitions
        if (scrolledPastThreshold && !this.header.classList.contains('scrolled')) {
            this.header.classList.add('scrolled');
        } else if (!scrolledPastThreshold && this.header.classList.contains('scrolled')) {
            this.header.classList.remove('scrolled');
        }
        
        // Hide/show header on mobile only, and with better conditions
        if (AppState.isMobile && Math.abs(currentScrollY - this.lastScrollY) > 5) {
            if (scrollingDown && currentScrollY > this.hideThreshold && !this.isHidden) {
                this.hideHeader();
            } else if (!scrollingDown && this.isHidden && currentScrollY < this.hideThreshold * 0.8) {
                this.showHeader();
            }
        }
        
        this.lastScrollY = currentScrollY;
    }

    hideHeader() {
        this.header.classList.add('header-hidden');
        this.isHidden = true;
    }

    showHeader() {
        this.header.classList.remove('header-hidden');
        this.isHidden = false;
    }

    setupLogoInteraction() {
        if (this.logo) {
            this.logo.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    setupMobileToggle() {
        // Mobile navigation toggle would go here
        // For now, we'll add a simple responsive handler
        window.addEventListener('resize', Utils.debounce(() => {
            AppState.isMobile = window.innerWidth <= 768;
            if (!AppState.isMobile && this.isHidden) {
                this.showHeader();
            }
        }, 250));
    }
}

// ============================================
//           ENHANCED HERO SYSTEM
// ============================================

class EnhancedHero {
    constructor() {
        this.heroSection = document.querySelector('.hero-section');
        this.heroTitle = document.querySelector('.hero-title');
        this.heroSubtitle = document.querySelector('.hero-subtitle');
        this.heroButtons = document.querySelectorAll('.hero-cta .btn');
        this.heroImage = document.querySelector('.hero-image');
        this.init();
    }

    init() {
        if (!this.heroSection) return;
        
        this.setupInitialState();
        this.animateHeroSequence();
        this.setupImageLoader();
    }

    setupInitialState() {
        // Set initial states for animations
        if (this.heroTitle) {
            this.heroTitle.style.opacity = '0';
            this.heroTitle.style.transform = 'translateY(50px)';
        }
        
        if (this.heroSubtitle) {
            this.heroSubtitle.style.opacity = '0';
            this.heroSubtitle.style.transform = 'translateY(30px)';
        }
        
        this.heroButtons.forEach(btn => {
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(20px)';
        });
        
        if (this.heroImage) {
            this.heroImage.style.opacity = '0';
            this.heroImage.style.transform = 'scale(0.9) translateY(30px)';
        }
    }

    animateHeroSequence() {
        const timeline = [
            { element: this.heroTitle, delay: 300 },
            { element: this.heroSubtitle, delay: 600 },
            { element: this.heroImage, delay: 900 }
        ];
        
        timeline.forEach(({ element, delay }) => {
            if (element) {
                setTimeout(() => {
                    element.style.transition = 'all 0.8s var(--ease-out)';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0) scale(1)';
                }, delay);
            }
        });
        
        // Animate buttons with stagger
        this.heroButtons.forEach((btn, index) => {
            setTimeout(() => {
                btn.style.transition = 'all 0.6s var(--ease-bounce)';
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0)';
            }, 1200 + (index * 150));
        });
    }

    setupImageLoader() {
        if (this.heroImage) {
            this.heroImage.addEventListener('load', () => {
                this.heroImage.classList.add('loaded');
            });
        }
    }
}

// ============================================
//           INTELLIGENT NAVIGATION
// ============================================

class IntelligentNavigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');
        this.currentSection = '';
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
        this.setupKeyboardShortcuts();
    }

    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            if (link.getAttribute('href').startsWith('#')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        this.smoothScrollTo(targetElement);
                        this.updateURL(targetId);
                    }
                });
            }
        });
    }

    smoothScrollTo(element) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = element.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    updateURL(hash) {
        if (history.pushState) {
            history.pushState(null, null, hash);
        }
    }

    setupActiveNavigation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActiveNavItem(entry.target.id);
                }
            });
        }, {
            rootMargin: '-20% 0px -80% 0px'
        });

        this.sections.forEach(section => observer.observe(section));
    }

    setActiveNavItem(sectionId) {
        this.navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${sectionId}`;
            link.classList.toggle('active', isActive);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                const shortcuts = {
                    '1': '#home',
                    '2': '#about',
                    '3': '#research',
                    '4': '#contact_us'
                };
                
                const target = shortcuts[e.key];
                if (target) {
                    e.preventDefault();
                    const element = document.querySelector(target);
                    if (element) this.smoothScrollTo(element);
                }
            }
        });
    }
}

// ============================================
//              ADVANCED FAQ SYSTEM
// ============================================

class AdvancedFAQ {
    constructor() {
        this.faqContainer = document.querySelector('.faq-container');
        this.faqItems = document.querySelectorAll('.faq-item');
        this.init();
    }

    init() {
        if (!this.faqContainer) return;
        
        this.setupFAQInteractions();
        this.setupKeyboardNavigation();
    }

    setupFAQInteractions() {
        this.faqItems.forEach((item, index) => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('.toggle-icon');
            
            question.addEventListener('click', () => {
                this.toggleFAQ(item, answer, icon);
            });
            
            // Add ARIA attributes
            question.setAttribute('aria-expanded', 'false');
            question.setAttribute('aria-controls', `faq-answer-${index}`);
            answer.setAttribute('id', `faq-answer-${index}`);
        });
    }

    toggleFAQ(item, answer, icon) {
        const isActive = item.classList.contains('active');
        const question = item.querySelector('.faq-question');
        
        // Close all other FAQs
        this.faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
                const otherQuestion = otherItem.querySelector('.faq-question');
                const otherIcon = otherItem.querySelector('.toggle-icon');
                otherQuestion.setAttribute('aria-expanded', 'false');
                otherIcon.style.transform = 'rotate(0deg)';
            }
        });
        
        // Toggle current FAQ
        if (!isActive) {
            item.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
            icon.style.transform = 'rotate(45deg)';
            
            // Smooth scroll to FAQ if needed
            setTimeout(() => {
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 300);
        } else {
            item.classList.remove('active');
            question.setAttribute('aria-expanded', 'false');
            icon.style.transform = 'rotate(0deg)';
        }
    }

    setupKeyboardNavigation() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });
        });
    }
}

// ============================================
//           PREMIUM MICRO-INTERACTIONS
// ============================================

class PremiumMicroInteractions {
    constructor() {
        this.interactiveElements = new Map();
        this.init();
    }

    init() {
        this.setupButtonEffects();
        this.setupCardEffects();
        this.setupLinkEffects();
        this.setupFormEffects();
        this.setupImageEffects();
    }

    setupButtonEffects() {
        document.querySelectorAll('.btn').forEach(btn => {
            this.addRippleEffect(btn);
            this.addHoverEffects(btn);
            this.addActiveEffects(btn);
        });
    }

    addRippleEffect(element) {
        element.addEventListener('click', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            element.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    addHoverEffects(element) {
        let hoverTimeout;
        
        element.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            element.style.transform = 'translateY(-2px) scale(1.02)';
            element.style.boxShadow = 'var(--shadow-lg)';
        });
        
        element.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                element.style.transform = 'translateY(0) scale(1)';
                element.style.boxShadow = '';
            }, 100);
        });
    }

    addActiveEffects(element) {
        element.addEventListener('mousedown', () => {
            element.style.transform = 'translateY(1px) scale(0.98)';
        });
        
        element.addEventListener('mouseup', () => {
            element.style.transform = 'translateY(-2px) scale(1.02)';
        });
    }

    setupCardEffects() {
        document.querySelectorAll('.research-item, .info-card, .project-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
                
                // Add glow effect
                const icon = card.querySelector('.research-icon, .icon-wrapper');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                
                const icon = card.querySelector('.research-icon, .icon-wrapper');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }

    setupLinkEffects() {
        document.querySelectorAll('.nav-link, .social-icon, a').forEach(link => {
            if (!link.classList.contains('btn')) {
                link.addEventListener('mouseenter', () => {
                    link.style.transform = 'translateY(-1px)';
                });
                
                link.addEventListener('mouseleave', () => {
                    link.style.transform = 'translateY(0)';
                });
            }
        });
    }

    setupFormEffects() {
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('focus', () => {
                input.style.transform = 'scale(1.02)';
                input.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            });
            
            input.addEventListener('blur', () => {
                input.style.transform = 'scale(1)';
                input.style.boxShadow = '';
            });
        });
    }

    setupImageEffects() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
                img.style.transform = 'scale(1)';
            });
            
            img.addEventListener('error', () => {
                img.style.opacity = '0.5';
                img.alt = 'Image failed to load';
            });
        });
    }
}

// ============================================
//           PERFORMANCE OPTIMIZATION
// ============================================

class PerformanceOptimizer {
    constructor() {
        this.observedImages = new Set();
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.optimizeScrollEvents();
        this.preloadCriticalResources();
    }

    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '50px 0px' });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    loadImage(img) {
        img.src = img.dataset.src;
        img.classList.add('loading');
        
        img.onload = () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
        };
        
        img.onerror = () => {
            img.classList.add('error');
        };
    }

    optimizeScrollEvents() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            if (!AppState.performance.scrollTicking) {
                requestAnimationFrame(() => {
                    AppState.performance.scrollTicking = false;
                });
                AppState.performance.scrollTicking = true;
            }
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.onScrollEnd();
            }, 150);
        }, { passive: true });
    }

    onScrollEnd() {
        // Update URL based on current section
        // Lazy load more content if needed
        // Update reading progress
    }

    preloadCriticalResources() {
        const criticalResources = [
            { href: './eids_logo.png', as: 'image' },
            { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap', as: 'style' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'style') {
                link.onload = () => {
                    link.rel = 'stylesheet';
                };
            }
            document.head.appendChild(link);
        });
    }
}

// ============================================
//           ACCESSIBILITY MANAGER
// ============================================

class AccessibilityManager {
    constructor() {
        this.focusOutlineEnabled = false;
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
        this.setupReducedMotionSupport();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.focusOutlineEnabled = true;
                document.body.classList.add('keyboard-navigation');
            }
            
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        document.addEventListener('mousedown', () => {
            this.focusOutlineEnabled = false;
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupFocusManagement() {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    setupScreenReaderSupport() {
        // Add ARIA labels and roles
        document.querySelectorAll('nav').forEach(nav => {
            if (!nav.getAttribute('role')) {
                nav.setAttribute('role', 'navigation');
            }
        });
        
        document.querySelectorAll('main').forEach(main => {
            if (!main.getAttribute('role')) {
                main.setAttribute('role', 'main');
            }
        });
        
        // Live region for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
    }

    setupReducedMotionSupport() {
        if (Utils.prefersReducedMotion()) {
            document.documentElement.style.setProperty('--duration-75', '0ms');
            document.documentElement.style.setProperty('--duration-100', '0ms');
            document.documentElement.style.setProperty('--duration-150', '0ms');
            document.documentElement.style.setProperty('--duration-200', '0ms');
            document.documentElement.style.setProperty('--duration-300', '0ms');
            document.documentElement.style.setProperty('--duration-500', '0ms');
            
            AppState.animations.enabled = false;
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
}

// ============================================
//              ERROR HANDLING
// ============================================

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.init();
    }

    init() {
        window.addEventListener('error', (e) => {
            this.logError(e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            this.logError(e.reason);
        });
    }

    logError(error) {
        this.errors.push({
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });
        
        // In production, send to error tracking service
        console.error('Application error:', error);
    }

    getErrorReport() {
        return this.errors;
    }
}

// ============================================
//              MAIN APPLICATION
// ============================================

class ModernWebsiteApp {
    constructor() {
        this.modules = new Map();
        this.init();
    }

    init() {
        // Prevent flash of unstyled content
        document.body.classList.add('preload');
        
        // Initialize error handling first
        this.modules.set('errorHandler', new ErrorHandler());
        
        // Initialize core modules
        this.initializeModules();
        
        // Setup global event listeners
        this.setupGlobalEvents();
        
        // Mark app as loaded
        this.markAsLoaded();
    }

    initializeModules() {
        const moduleInitializers = [
            ['themeManager', ModernThemeManager],
            ['scrollAnimations', AdvancedScrollAnimations],
            // Header handled by component
            ['hero', EnhancedHero],
            ['navigation', IntelligentNavigation],
            ['faq', AdvancedFAQ],
            ['microInteractions', PremiumMicroInteractions],
            ['performance', PerformanceOptimizer],
            ['accessibility', AccessibilityManager]
        ];
        
        moduleInitializers.forEach(([name, ModuleClass]) => {
            try {
                this.modules.set(name, new ModuleClass());
            } catch (error) {
                console.error(`Failed to initialize ${name}:`, error);
            }
        });
    }

    setupGlobalEvents() {
        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
        
        // Window resize
        window.addEventListener('resize', Utils.debounce(() => {
            AppState.isMobile = window.innerWidth <= 768;
            this.handleResize();
        }, 250));
        
        // Before unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    pauseAnimations() {
        document.body.classList.add('animations-paused');
    }

    resumeAnimations() {
        document.body.classList.remove('animations-paused');
    }

    handleResize() {
        // Recalculate layouts, update mobile-specific features
        this.modules.forEach(module => {
            if (module.handleResize) {
                module.handleResize();
            }
        });
    }

    markAsLoaded() {
        setTimeout(() => {
            document.body.classList.remove('preload');
            document.body.classList.add('loaded');
            AppState.isLoaded = true;
            
            // Dispatch app loaded event
            window.dispatchEvent(new CustomEvent('appLoaded'));
        }, 100);
    }

    cleanup() {
        // Clean up event listeners, observers, etc.
        this.modules.forEach(module => {
            if (module.destroy) {
                module.destroy();
            }
        });
    }

    getModule(name) {
        return this.modules.get(name);
    }
}

// ============================================
//              INITIALIZATION
// ============================================

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ModernApp = new ModernWebsiteApp();
    });
} else {
    window.ModernApp = new ModernWebsiteApp();
}

// Export for external access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModernWebsiteApp, AppState, Utils };
}
