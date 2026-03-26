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
  const hamburger     = document.getElementById('hamburger');
  const mobileDrawer  = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');

  /* Force-inject base drawer styles via JS so no CSS conflict can block them */
  if (mobileDrawer) {
    Object.assign(mobileDrawer.style, {
      position:       'fixed',
      left:           '12px',
      right:          '12px',
      bottom:         '-110%',
      top:            'auto',
      height:         'auto',
      maxHeight:      '85vh',
      overflowY:      'auto',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'flex-start',
      background:     'linear-gradient(145deg, #0D1E38, #0A1628)',
      borderRadius:   '24px 24px 0 0',
      padding:        '20px 24px 48px',
      zIndex:         '1001',
      borderTop:      '1px solid rgba(201,169,110,0.2)',
      boxShadow:      '0 -8px 40px rgba(0,0,0,0.5)',
      transition:     'bottom 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)',
      opacity:        '1',
      pointerEvents:  'none',
      boxSizing:      'border-box',
      inset:          'auto',          /* reset any CSS inset:0 */
    });
  }

  let drawerOpen = false;

  function openDrawer() {
    if (!mobileDrawer) return;
    drawerOpen = true;
    mobileDrawer.style.bottom       = '0';
    mobileDrawer.style.pointerEvents = 'auto';
    if (drawerOverlay) {
      drawerOverlay.style.display = 'block';
      drawerOverlay.style.opacity = '1';
    }
    document.body.style.overflow = 'hidden';
    if (hamburger) {
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
    }
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    drawerOpen = false;
    mobileDrawer.style.bottom       = '-110%';
    mobileDrawer.style.pointerEvents = 'none';
    if (drawerOverlay) {
      drawerOverlay.style.display = 'none';
    }
    document.body.style.overflow = '';
    if (hamburger) {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.hamburger');
    if (btn) {
      e.stopPropagation();
      e.preventDefault();
      drawerOpen ? closeDrawer() : openDrawer();
    }
  });

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeDrawer);
  }

  // Close drawer when any nav link is clicked
  if (mobileDrawer) {
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        setTimeout(closeDrawer, 150);
      });
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
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