/* =====================================================
   AK COMFORTZONE — MAIN.JS
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll shrink ─────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ── Scroll reveal (IntersectionObserver) ──────── */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback for old browsers
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ── Active nav link ────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-drawer nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) link.classList.add('active');
  });

  /* ── Mobile drawer toggle ───────────────────────── */
  const hamburger    = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const overlay      = document.getElementById('drawerOverlay');

  function openDrawer() {
    mobileDrawer?.classList.add('open');
    hamburger?.classList.add('open');
    if (overlay) overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    hamburger?.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    mobileDrawer?.classList.remove('open');
    hamburger?.classList.remove('open');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
    hamburger?.setAttribute('aria-expanded', 'false');
  }

  hamburger?.addEventListener('click', () => {
    mobileDrawer?.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  overlay?.addEventListener('click', closeDrawer);

  // Close drawer on link click
  document.querySelectorAll('.mobile-drawer nav a').forEach(a => {
    a.addEventListener('click', closeDrawer);
  });

  /* ── Smooth scroll for anchor links ─────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Secure external links ───────────────────────── */
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (!link.rel.includes('noopener')) link.rel = 'noopener noreferrer';
  });

  /* ── Generic scroll-carousel dot sync ──────────────
     Works for both testimonials and services carousels
  ────────────────────────────────────────────────── */
  function initScrollCarousel(scrollEl, dotSelector, gap = 14) {
    if (!scrollEl) return;
    const dots = document.querySelectorAll(dotSelector);
    if (!dots.length) return;

    function updateDots() {
      const cards = scrollEl.querySelectorAll('[data-index], .testi-card, .svc-card');
      if (!cards.length) return;
      const cardWidth   = cards[0].offsetWidth + gap;
      const activeIndex = Math.round(scrollEl.scrollLeft / cardWidth);
      dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
    }

    scrollEl.addEventListener('scroll', updateDots, { passive: true });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx   = parseInt(dot.dataset.index, 10);
        const cards = scrollEl.querySelectorAll('[data-index], .testi-card, .svc-card');
        if (cards[idx]) {
          scrollEl.scrollTo({ left: cards[idx].offsetLeft - 20, behavior: 'smooth' });
        }
      });
    });
  }

  // Testimonials carousel
  initScrollCarousel(
    document.querySelector('.testimonials-scroll'),
    '#testiDots .testi-dot',
    14
  );

  // Services carousel (only active when mobile CSS kicks in)
  initScrollCarousel(
    document.querySelector('.services-scroll'),
    '#svcDots .svc-dot',
    14
  );

  /* ── Sticky CTA bar hide/show on scroll ─────────────
     Hides briefly on fast downward scroll, reappears on upward
  ────────────────────────────────────────────────── */
  const stickyCTA = document.getElementById('stickyCTABar');
  if (stickyCTA) {
    let lastY = 0;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          // Show bar after scrolling 50px past top
          if (currentY < 50) {
            stickyCTA.style.transform = 'translateY(100%)';
            stickyCTA.style.opacity   = '0';
          } else {
            stickyCTA.style.transform = 'translateY(0)';
            stickyCTA.style.opacity   = '1';
          }
          lastY   = currentY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initially hidden if at top
    stickyCTA.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    stickyCTA.style.transform  = 'translateY(100%)';
    stickyCTA.style.opacity    = '0';
  }

});
