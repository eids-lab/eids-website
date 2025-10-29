'use strict';

/* -------------------------------------------------
   1. FAQ – only the code that the page actually uses
   ------------------------------------------------- */
document.querySelectorAll('.faq-item').forEach((item, idx) => {
  const q   = item.querySelector('.faq-question');
  const a   = item.querySelector('.faq-answer');
  const ico = item.querySelector('.toggle-icon');

  if (!q || !a || !ico) return;               // safety

  const toggle = () => {
    const open = item.classList.toggle('active');
    ico.textContent = open ? '-' : '+';
    q.setAttribute('aria-expanded', open);
  };

  q.addEventListener('click', toggle);
  ico.addEventListener('click', e => { e.stopPropagation(); toggle(); });

  // ARIA
  q.setAttribute('aria-expanded', 'false');
  q.setAttribute('aria-controls', `faq-${idx}`);
  a.setAttribute('id', `faq-${idx}`);
});

/* -------------------------------------------------
   2. Smooth scroll for internal #links (used by nav)
   ------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const header = document.querySelector('.header');
      const offset = (header ? header.offsetHeight : 0) + 20;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});

/* -------------------------------------------------
   3. Simple “skip to main” link (accessibility)
   ------------------------------------------------- */
if (!document.querySelector('.skip-link')) {
  const skip = document.createElement('a');
  skip.href = '#main';
  skip.textContent = 'Skip to main content';
  skip.className = 'skip-link';
  document.body.insertBefore(skip, document.body.firstChild);
}

/* -------------------------------------------------
   4. Remove FOUC (flash of unstyled content)
   ------------------------------------------------- */
document.documentElement.classList.remove('preload');