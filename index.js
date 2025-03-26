document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode Toggle
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;

    // Check user's previous theme preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        body.classList.add(currentTheme);
        themeSwitch.checked = currentTheme === 'dark-mode';
    }

    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
        } else {
            body.classList.remove('dark-mode');
            localStorage.removeItem('theme');
        }
    });

    // Smooth Scrolling
    // const navLinks = document.querySelectorAll('.nav-link');
    // navLinks.forEach(link => {
    //     link.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         const targetId = link.getAttribute('href');
    //         const targetSection = document.querySelector(targetId);
            
    //         targetSection.scrollIntoView({
    //             behavior: 'smooth'
    //         });
    //     });
    // });

    // Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.hero-section, .about-section, .project-highlights');
    
    const revealOnScroll = () => {
        revealElements.forEach(element => {
            const windowHeight = window.innerHeight;
            const revealTop = element.getBoundingClientRect().top;
            const revealPoint = 150;

            if (revealTop < windowHeight - revealPoint) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
});