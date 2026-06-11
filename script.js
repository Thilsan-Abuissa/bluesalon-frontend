/* ============================================================
   BLUE SALON — Homepage Script
============================================================ */

/* ----------------------------------------
   Sticky Header
---------------------------------------- */
const header     = document.getElementById('siteHeader');
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 32);
  scrollTopBtn.classList.toggle('is-visible', window.scrollY > 480);
}, { passive: true });


/* ----------------------------------------
   Search Overlay
---------------------------------------- */
function toggleSearch() {
  const overlay = document.getElementById('searchOverlay');
  const isOpen  = overlay.classList.toggle('is-open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if (isOpen) setTimeout(() => overlay.querySelector('.search-input').focus(), 80);
}

document.getElementById('searchOverlay').addEventListener('click', function(e) {
  if (e.target === this) toggleSearch();
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (document.getElementById('searchOverlay').classList.contains('is-open')) toggleSearch();
  if (document.getElementById('mobileNav').classList.contains('is-open')) closeMobileNav();
});


/* ----------------------------------------
   Mobile Navigation
---------------------------------------- */
const mobileNav     = document.getElementById('mobileNav');
const mobileOverlay = document.getElementById('mobileNavOverlay');
const menuBtn       = document.getElementById('mobileMenuBtn');

function openMobileNav() {
  mobileNav.classList.add('is-open');
  mobileNav.setAttribute('aria-hidden', 'false');
  mobileOverlay.classList.add('is-open');
  menuBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  mobileNav.classList.remove('is-open');
  mobileNav.setAttribute('aria-hidden', 'true');
  mobileOverlay.classList.remove('is-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

menuBtn.addEventListener('click', openMobileNav);
document.getElementById('mobileNavClose').addEventListener('click', closeMobileNav);
mobileOverlay.addEventListener('click', closeMobileNav);


/* ----------------------------------------
   Language / Region Dropdown
---------------------------------------- */
(function initLangDropdown() {
  const wrapper = document.getElementById('headerLang');
  if (!wrapper) return;
  const trigger = wrapper.querySelector('.header-lang-trigger');

  function open()  {
    wrapper.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
  }
  function close() {
    wrapper.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  }
  function toggle() { wrapper.classList.contains('is-open') ? close() : open(); }

  trigger.addEventListener('click', e => { e.stopPropagation(); toggle(); });

  /* Country selection */
  wrapper.querySelectorAll('.lang-country-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      wrapper.querySelectorAll('.lang-country-btn').forEach(b => b.classList.remove('lang-country-btn--active'));
      this.classList.add('lang-country-btn--active');
    });
  });

  /* Language toggle (EN / AR) */
  wrapper.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      wrapper.querySelectorAll('.lang-toggle-btn').forEach(b => {
        b.classList.remove('lang-toggle-btn--active');
        b.setAttribute('aria-pressed', 'false');
      });
      this.classList.add('lang-toggle-btn--active');
      this.setAttribute('aria-pressed', 'true');
      const isAr = this.dataset.lang === 'ar';
      document.documentElement.setAttribute('dir',  isAr ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', isAr ? 'ar'  : 'en');
      close();
    });
  });

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (!wrapper.contains(e.target)) close();
  });

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
})();


/* ----------------------------------------
   Hero Slider
---------------------------------------- */
(function initHeroSlider() {

  const slides     = Array.from(document.querySelectorAll('.hs-slide'));
  const dots       = Array.from(document.querySelectorAll('.hs-dot'));
  const prevBtn    = document.getElementById('hsPrev');
  const nextBtn    = document.getElementById('hsNext');
  const counter    = document.getElementById('hsCounter');
  const progressFill = document.getElementById('hsProgressFill');

  const TOTAL      = slides.length;
  const AUTO_MS    = 6000;           // 6 s per slide
  let   current    = 0;
  let   timer      = null;
  let   progTimer  = null;
  let   isAnimating = false;

  /* Pad number helper */
  const pad = n => String(n + 1).padStart(2, '0');

  /* Go to a specific slide */
  function goTo(index, dir = 1) {
    if (isAnimating || index === current) return;
    isAnimating = true;

    /* Deactivate current */
    slides[current].classList.remove('hs-slide--active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('hs-dot--active');
    dots[current].setAttribute('aria-selected', 'false');

    current = (index + TOTAL) % TOTAL;

    /* Activate new */
    slides[current].classList.add('hs-slide--active');
    slides[current].setAttribute('aria-hidden', 'false');
    dots[current].classList.add('hs-dot--active');
    dots[current].setAttribute('aria-selected', 'true');
    counter.textContent = `${pad(current)} / ${pad(TOTAL - 1)}`;

    /* Allow next transition after CSS duration (900ms) */
    setTimeout(() => { isAnimating = false; }, 950);

    restartProgress();
  }

  function next() { goTo(current + 1,  1); }
  function prev() { goTo(current - 1, -1); }

  /* Auto-play */
  function startAuto() {
    clearInterval(timer);
    timer = setInterval(next, AUTO_MS);
  }
  function stopAuto() { clearInterval(timer); }

  /* Progress bar */
  function restartProgress() {
    clearTimeout(progTimer);
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';

    /* Force reflow then animate */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressFill.style.transition = `width ${AUTO_MS}ms linear`;
        progressFill.style.width = '100%';
      });
    });
  }

  /* Event listeners */
  nextBtn.addEventListener('click', () => { next(); startAuto(); });
  prevBtn.addEventListener('click', () => { prev(); startAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startAuto(); });
  });

  /* Pause on hover */
  const sliderEl = document.getElementById('heroSlider');
  sliderEl.addEventListener('mouseenter', stopAuto);
  sliderEl.addEventListener('mouseleave', startAuto);

  /* Touch swipe */
  let touchStartX = 0;
  sliderEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  sliderEl.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 48) { dx < 0 ? next() : prev(); startAuto(); }
  });

  /* Keyboard (when slider is focused) */
  sliderEl.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { next(); startAuto(); }
    if (e.key === 'ArrowLeft')  { prev(); startAuto(); }
  });

  /* Boot */
  startAuto();
  restartProgress();

})();


/* ----------------------------------------
   Scroll Reveal
---------------------------------------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ----------------------------------------
   Wishlist Toggle
---------------------------------------- */
document.querySelectorAll('.wishlist-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    const active = this.classList.toggle('is-active');
    this.setAttribute('aria-label', active ? 'Remove from Wishlist' : 'Add to Wishlist');
    this.style.transform = 'scale(1.22)';
    setTimeout(() => { this.style.transform = ''; }, 200);
  });
});


/* ----------------------------------------
   Newsletter Form
---------------------------------------- */
document.getElementById('newsletterForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const input = this.querySelector('.newsletter-input');
  const btn   = this.querySelector('.newsletter-btn');
  const email = input.value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!valid) {
    input.style.borderColor = 'rgba(196,30,58,0.55)';
    input.focus();
    setTimeout(() => { input.style.borderColor = ''; }, 2200);
    return;
  }

  btn.textContent = 'Subscribed ✓';
  btn.style.background = '#BFC5CC';
  input.value = '';
  input.disabled = btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Subscribe';
    btn.style.background = '';
    input.disabled = btn.disabled = false;
  }, 4500);
});


/* ----------------------------------------
   Search Tags
---------------------------------------- */
document.querySelectorAll('.search-tag').forEach(tag => {
  tag.addEventListener('click', function() {
    const input = document.querySelector('.search-input');
    input.value = this.textContent;
    input.focus();
  });
});


/* ----------------------------------------
   Announcement Bar Slider
---------------------------------------- */
(function initAnnSlider() {
  const slides = Array.from(document.querySelectorAll('.ann-slide'));
  if (slides.length < 2) return;
  let current = 0;
  const INTERVAL = 3500;

  setInterval(() => {
    const outgoing = slides[current];
    outgoing.classList.add('ann-slide--exit');
    outgoing.classList.remove('ann-slide--active');

    current = (current + 1) % slides.length;
    slides[current].classList.add('ann-slide--active');

    setTimeout(() => outgoing.classList.remove('ann-slide--exit'), 480);
  }, INTERVAL);
})();


/* ----------------------------------------
   Full-Width Mega Panels
---------------------------------------- */
(function initMegaMenus() {

  const header    = document.getElementById('siteHeader');
  const navItems  = Array.from(document.querySelectorAll('[data-mega]'));
  let   closeTimer = null;

  function openPanel(key) {
    clearTimeout(closeTimer);
    /* Close all first */
    document.querySelectorAll('.fw-mega').forEach(p => p.classList.remove('is-open'));
    document.querySelectorAll('[data-mega] .nav-link').forEach(l => l.setAttribute('aria-expanded', 'false'));

    const panel = document.getElementById('mega-' + key);
    const link  = document.querySelector('[data-mega="' + key + '"] .nav-link');
    if (!panel) return;
    panel.classList.add('is-open');
    if (link) link.setAttribute('aria-expanded', 'true');
    header.classList.add('mega-open');
  }

  function scheduleClose() {
    closeTimer = setTimeout(() => {
      document.querySelectorAll('.fw-mega').forEach(p => p.classList.remove('is-open'));
      document.querySelectorAll('[data-mega] .nav-link').forEach(l => l.setAttribute('aria-expanded', 'false'));
      header.classList.remove('mega-open');
    }, 120);
  }

  navItems.forEach(item => {
    const key = item.dataset.mega;

    item.addEventListener('mouseenter', () => openPanel(key));
    item.addEventListener('mouseleave', scheduleClose);
  });

  /* Keep panel open when mouse moves into it */
  document.querySelectorAll('.fw-mega').forEach(panel => {
    panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    panel.addEventListener('mouseleave', scheduleClose);
  });

  /* Tab switching within panels — on hover */
  document.querySelectorAll('.fw-tab').forEach(tab => {
    tab.addEventListener('mouseenter', function () {
      const panelId = this.dataset.panel;
      const mega    = this.closest('.fw-mega');

      /* Update tabs */
      mega.querySelectorAll('.fw-tab').forEach(t => t.classList.remove('fw-tab--active'));
      this.classList.add('fw-tab--active');

      /* Update panels */
      mega.querySelectorAll('.fw-panel').forEach(p => p.classList.remove('fw-panel--active'));
      const target = document.getElementById(panelId);
      if (target) target.classList.add('fw-panel--active');
    });
  });

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.fw-mega').forEach(p => p.classList.remove('is-open'));
      document.querySelectorAll('[data-mega] .nav-link').forEach(l => l.setAttribute('aria-expanded', 'false'));
      header.classList.remove('mega-open');
    }
  });

})();


/* ----------------------------------------
   Reduced Motion
---------------------------------------- */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const root = document.documentElement;
  root.style.setProperty('--slow', '0.01ms');
  root.style.setProperty('--mid',  '0.01ms');
  root.style.setProperty('--fast', '0.01ms');
}
