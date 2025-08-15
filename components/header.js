/* ========================================
   HEADER COMPONENT JAVASCRIPT
   ======================================== */

'use strict';

// Utility functions
const HeaderUtils = {
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
    }
};

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
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        if (!this.header) return;
        
        this.setupScrollHandler();
        this.setupLogoInteraction();
        this.setupResizeHandler();
        this.setupNavigation();
    }

    setupScrollHandler() {
        window.addEventListener('scroll', HeaderUtils.throttle(() => {
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
        if (this.isMobile && Math.abs(currentScrollY - this.lastScrollY) > 5) {
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

    setupResizeHandler() {
        window.addEventListener('resize', HeaderUtils.debounce(() => {
            this.isMobile = window.innerWidth <= 768;
            if (!this.isMobile && this.isHidden) {
                this.showHeader();
            }
        }, 250));
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id], main[id]');
        
        // Setup smooth scrolling for internal links
        navLinks.forEach(link => {
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

        // Setup active navigation highlighting
        if (sections.length > 0) {
            this.setupActiveNavigation(navLinks, sections);
        }
    }

    smoothScrollTo(element) {
        const headerHeight = this.header.offsetHeight;
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

    setupActiveNavigation(navLinks, sections) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActiveNavItem(navLinks, entry.target.id);
                }
            });
        }, {
            rootMargin: '-20% 0px -80% 0px'
        });

        sections.forEach(section => observer.observe(section));
    }

    setActiveNavItem(navLinks, sectionId) {
        navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${sectionId}`;
            link.classList.toggle('active', isActive);
        });
    }

    // Method to destroy the header instance and clean up event listeners
    destroy() {
        // This would be called when cleaning up the component
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        if (this.logo) {
            this.logo.removeEventListener('click', this.logoClickHandler);
        }
    }
}

// ============================================
//              HEADER LOADER
// ============================================

class HeaderLoader {
    constructor() {
        this.componentPath = './components/header.html';
        this.cssPath = './components/header.css';
        this.pathConfig = {
            logo: '',
            home: '',
            members: '',
            projects: '',
            publications: '',
            opportunities: ''
        };
    }

    // Set path configuration based on current page location
    configurePaths() {
        const currentPath = window.location.pathname;
        const isInSubfolder = currentPath.includes('/HTML/');
        
        if (isInSubfolder) {
            // We're in a subfolder, paths need to go up one level
            this.componentPath = '../components/header.html';
            this.cssPath = '../components/header.css';
            this.pathConfig = {
                logo: '../eids_logo.png',
                home: '../index.html',
                members: './team_members.html',
                projects: './projects.html',
                publications: './publications.html',
                opportunities: './opportunities.html'
            };
        } else {
            // We're in the root directory
            this.componentPath = './components/header.html';
            this.cssPath = './components/header.css';
            this.pathConfig = {
                logo: './eids_logo.png',
                home: './index.html',
                members: './HTML/team_members.html',
                projects: './HTML/projects.html',
                publications: './HTML/publications.html',
                opportunities: './HTML/opportunities.html'
            };
        }
    }

    // Load and inject the header component
    async loadHeader() {
        try {
            this.configurePaths();
            
            // Load the header HTML
            const response = await fetch(this.componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load header: ${response.status}`);
            }
            
            let headerHTML = await response.text();
            
            // Replace placeholders with actual paths
            headerHTML = headerHTML
                .replace('{{LOGO_PATH}}', this.pathConfig.logo)
                .replace('{{HOME_PATH}}', this.pathConfig.home)
                .replace('{{MEMBERS_PATH}}', this.pathConfig.members)
                .replace('{{PROJECTS_PATH}}', this.pathConfig.projects)
                .replace('{{PUBLICATIONS_PATH}}', this.pathConfig.publications)
                .replace('{{OPPORTUNITIES_PATH}}', this.pathConfig.opportunities);
            
            // Find the header placeholder and replace it
            const headerPlaceholder = document.querySelector('#header-component');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = headerHTML;
            } else {
                // Fallback: inject at the beginning of body
                document.body.insertAdjacentHTML('afterbegin', headerHTML);
            }
            
            // Load the CSS
            await this.loadCSS();
            
            // Initialize the SmartHeader
            new SmartHeader();
            
            return true;
        } catch (error) {
            console.error('Error loading header component:', error);
            return false;
        }
    }

    // Load the header CSS
    async loadCSS() {
        return new Promise((resolve, reject) => {
            // Check if CSS is already loaded
            if (document.querySelector('link[href*="header.css"]')) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = this.cssPath;
            link.onload = resolve;
            link.onerror = () => reject(new Error('Failed to load header CSS'));
            
            document.head.appendChild(link);
        });
    }
}

// ============================================
//              INITIALIZATION
// ============================================

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const headerLoader = new HeaderLoader();
        headerLoader.loadHeader();
    });
} else {
    const headerLoader = new HeaderLoader();
    headerLoader.loadHeader();
}

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SmartHeader, HeaderLoader };
}
