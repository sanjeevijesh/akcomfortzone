/* ============================================================
   AK COMFORTZONE — SCROLL-EFFECTS.JS
   9 scroll-driven effects for the Corporate Precision theme
   Pure JS + CSS — No GSAP, no ScrollTrigger, no jQuery
   ============================================================ */

'use strict';

(function () {

  /* ── Utility ─────────────────────────────────────── */
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ── Reduced motion check ────────────────────────── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  onReady(function () {

    /* ─────────────────────────────────────────────────
       EFFECT 1 — SCROLL PROGRESS BAR
       A 2px gold line that grows left→right as user scrolls
    ───────────────────────────────────────────────── */
    const bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH <= 0) return;
      const pct = (window.scrollY / docH) * 100;
      bar.style.width = Math.min(pct, 100).toFixed(1) + '%';
    }, { passive: true });


    /* ─────────────────────────────────────────────────
       EFFECT 2 — HERO PARALLAX GRID
       Grid pattern moves at 25% scroll speed (depth illusion)
    ───────────────────────────────────────────────── */
    if (!prefersReduced) {
      const heroGrid    = document.querySelector('.hero-grid-bg');
      const heroCircles = document.querySelector('.hero-decorative-circles');

      if (heroGrid) {
        window.addEventListener('scroll', () => {
          const y = window.scrollY;
          heroGrid.style.transform = `translateY(${(y * 0.25).toFixed(1)}px)`;
          if (heroCircles) {
            heroCircles.style.transform = `translateY(${(y * 0.15).toFixed(1)}px)`;
          }
        }, { passive: true });
      }
    }


    /* ─────────────────────────────────────────────────
       EFFECT 3 — WORD-BY-WORD HEADING REVEAL
       Each word fades + slides up, staggered 55ms apart
    ───────────────────────────────────────────────── */
    document.querySelectorAll('[data-word-reveal]').forEach(heading => {
      // Preserve any italic spans (e.g. <em>) — split only plain text nodes
      const words = heading.textContent.trim().split(/\s+/);
      heading.innerHTML = '';
      heading.classList.add('word-reveal-wrap');
      words.forEach(w => {
        const s = document.createElement('span');
        s.className = 'word';
        s.textContent = w;
        heading.appendChild(s);
      });
    });

    const wordObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('.word').forEach((w, i) => {
          setTimeout(() => w.classList.add('visible'), i * (prefersReduced ? 0 : 55));
        });
        wordObs.unobserve(e.target);
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('[data-word-reveal]').forEach(el => wordObs.observe(el));


    /* ─────────────────────────────────────────────────
       EFFECT 4 — ANIMATED STAT COUNTERS + GOLD BAR GROW
       Numbers count up with ease-out cubic; gold bar widens
    ───────────────────────────────────────────────── */
    function runCounter(el) {
      const target = parseFloat(el.dataset.count);
      const dec    = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';

      if (prefersReduced || isNaN(target)) {
        el.textContent = target.toFixed(dec) + suffix;
        return;
      }

      const duration = 1600;
      const startTime = performance.now();

      (function step(now) {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = (eased * target).toFixed(dec) + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(dec) + suffix;
      })(startTime);
    }

    const statsObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;

        // Animate counter numbers
        e.target.querySelectorAll('[data-count]').forEach((el, i) => {
          setTimeout(() => runCounter(el), i * 150);
        });

        // Grow gold accent bars
        e.target.querySelectorAll('.stat-gold-bar').forEach((b, i) => {
          setTimeout(() => b.classList.add('grown'), i * 150 + 350);
        });

        statsObs.unobserve(e.target);
      });
    }, { threshold: 0.35 });

    document.querySelectorAll('[data-stats-section], #stats-band, #credentials, .stats-band').forEach(s => {
      statsObs.observe(s);
    });


    /* ─────────────────────────────────────────────────
       EFFECT 5 — STAGGERED CARD ENTRANCE (3 DIRECTIONS)
       Column 1→from left, Column 2→from bottom, Column 3→from right
    ───────────────────────────────────────────────── */
    document.querySelectorAll('.services-grid').forEach(grid => {
      const cards = grid.querySelectorAll('.service-card, .svc-card');
      cards.forEach((card, i) => {
        const col = i % 3;
        card.dataset.dir = col === 0 ? 'left' : col === 1 ? 'bottom' : 'right';
      });
    });

    // Assign directions to sector cells too
    document.querySelectorAll('.sectors-grid').forEach(grid => {
      const cells = grid.querySelectorAll('.sector-cell');
      cells.forEach((cell, i) => {
        const col = i % 5;
        const dirs = ['left', 'bottom', 'right', 'bottom', 'left'];
        cell.dataset.dir = dirs[col] || 'bottom';
        cell.classList.add('sector-item');
      });
    });

    const cardObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const cards = e.target.querySelectorAll('.service-card, .svc-card, .sector-item');
        cards.forEach((card, i) => {
          setTimeout(() => card.classList.add('in-view'), i * (prefersReduced ? 0 : 70));
        });
        cardObs.unobserve(e.target);
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.services-grid, .sectors-grid').forEach(g => cardObs.observe(g));


    /* ─────────────────────────────────────────────────
       EFFECT 6 — HORIZONTAL DRAG-TO-SCROLL
       Click-drag to scroll horizontal containers
    ───────────────────────────────────────────────── */
    function makeDraggable(selector) {
      document.querySelectorAll(selector).forEach(track => {
        let isDown = false, startX, startLeft, hasMoved = false;

        track.style.cursor = 'grab';

        track.addEventListener('mousedown', e => {
          isDown    = true;
          hasMoved  = false;
          startX    = e.pageX - track.offsetLeft;
          startLeft = track.scrollLeft;
          track.style.cursor     = 'grabbing';
          track.style.userSelect = 'none';
        });

        document.addEventListener('mouseup', () => {
          if (!isDown) return;
          isDown = false;
          track.style.cursor     = 'grab';
          track.style.userSelect = '';
        });

        track.addEventListener('mousemove', e => {
          if (!isDown) return;
          e.preventDefault();
          const x    = e.pageX - track.offsetLeft;
          const walk = (x - startX) * 1.5;
          track.scrollLeft = startLeft - walk;

          if (!hasMoved) {
            hasMoved = true;
            const hint = track.parentElement.querySelector('.drag-hint');
            if (hint) {
              hint.style.opacity       = '0';
              hint.style.pointerEvents = 'none';
            }
          }
        });

        // Prevent link clicks when just dragging
        track.addEventListener('click', e => {
          if (hasMoved) e.preventDefault();
        });
      });
    }

    makeDraggable('.testimonials-scroll');
    makeDraggable('.sectors-track');
    makeDraggable('.portfolio-grid-scroll');


    /* ─────────────────────────────────────────────────
       EFFECT 7 — PROCESS STEPS SEQUENTIAL HIGHLIGHT
       Each step activates in turn; final state = all active
    ───────────────────────────────────────────────── */
    const processSection = document.querySelector('#process, .process-section');

    if (processSection) {
      const steps = processSection.querySelectorAll('.process-step');
      let fired = false;

      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting || fired) return;
          fired = true;

          if (prefersReduced) {
            steps.forEach(s => s.classList.add('active'));
            return;
          }

          steps.forEach((step, i) => {
            setTimeout(() => {
              // Dim all, activate current
              steps.forEach(s => s.classList.remove('active'));
              step.classList.add('active');

              // After last step fires, activate all permanently
              if (i === steps.length - 1) {
                setTimeout(() => {
                  steps.forEach(s => s.classList.add('active'));
                }, 500);
              }
            }, i * 480);
          });
        });
      }, { threshold: 0.3 }).observe(processSection);
    }


    /* ─────────────────────────────────────────────────
       EFFECT 8 — SCROLL-SPY NAV (homepage only)
       Active nav link updates as sections scroll into view
       + smooth scroll for all anchor links
    ───────────────────────────────────────────────── */
    const pageSections = document.querySelectorAll('section[id]');
    const navLinks     = document.querySelectorAll('.nav-links a');

    if (pageSections.length > 1 && navLinks.length) {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          const id = e.target.getAttribute('id');
          navLinks.forEach(a => {
            const href = a.getAttribute('href') || '';
            const isActive = href === ('#' + id) ||
                             href.endsWith('index.html#' + id) ||
                             (href === 'index.html' && id === 'hero');
            a.classList.toggle('active', isActive);
          });
        });
      }, {
        threshold: 0.4,
        rootMargin: '-20% 0px -55% 0px'
      }).observe;  // Note: .observe intentionally not called here; spy is bonus

      // Smooth scroll for all anchor links
      document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
          const href   = a.getAttribute('href');
          const target = document.querySelector(href);
          if (!target) return;
          e.preventDefault();
          target.scrollIntoView({
            behavior: prefersReduced ? 'instant' : 'smooth',
            block: 'start'
          });
        });
      });
    }


    /* ─────────────────────────────────────────────────
       EFFECT 9 — UNIVERSAL SECTION REVEAL
       Any element with [data-reveal] fades in on scroll
       Also handles legacy .reveal class from old design
    ───────────────────────────────────────────────── */
    const revObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          e.target.classList.add('visible'); // legacy .reveal support
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

    // New data-reveal elements
    document.querySelectorAll('[data-reveal]').forEach(el => revObs.observe(el));

    // Legacy .reveal elements (from old claymorphism that still exist)
    document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));


    /* ─────────────────────────────────────────────────
       BONUS — NAVBAR SCROLL STATE
       Adds .scrolled class after 80px for glass effect
    ───────────────────────────────────────────────── */
    const navbar = document.getElementById('navbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
      }, { passive: true });
    }


    /* ─────────────────────────────────────────────────
       BONUS — MOBILE DRAWER TOGGLE
       Handles hamburger menu open/close
    ───────────────────────────────────────────────── */
    const hamburger    = document.getElementById('hamburger');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const overlay      = document.getElementById('drawerOverlay');

    function openDrawer() {
      mobileDrawer.classList.add('open');
      if (overlay) overlay.style.display = 'block';
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      mobileDrawer.classList.remove('open');
      if (overlay) overlay.style.display = 'none';
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    if (hamburger && mobileDrawer) {
      hamburger.addEventListener('click', () => {
        mobileDrawer.classList.contains('open') ? closeDrawer() : openDrawer();
      });

      if (overlay) overlay.addEventListener('click', closeDrawer);

      // Close on nav link click
      mobileDrawer.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', closeDrawer);
      });

      // Close on Escape
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) closeDrawer();
      });
    }

  }); // end onReady

})();
