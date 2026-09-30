// Mobile nav toggle (vanilla JS)
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => nav.classList.remove('open'))
  );
});

// Auto-collapse: if ANY nav item wraps below another, switch to the
// hamburger menu at any viewport width. The <=1024px CSS media query owns
// the collapsed state there; this only measures above that breakpoint.
(function () {
  const mq = window.matchMedia('(max-width: 1024px)');
  let raf = null;

  function closeMenu(header, nav) {
    nav.classList.remove('open');
    const toggle = header.querySelector('.nav-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function updateNavState() {
    const header = document.querySelector('.site-header');
    const nav = header ? header.querySelector('.site-nav') : null;
    const ul = nav ? nav.querySelector('ul') : null;
    if (!header || !nav || !ul) return;

    if (mq.matches) {
      // CSS media query handles it from here; drop the JS class if present.
      if (header.classList.contains('nav-collapsed')) {
        header.classList.remove('nav-collapsed');
        closeMenu(header, nav);
      }
      return;
    }

    // Measure in the natural inline layout: remove the class, read, restore.
    // Reading offsetTop forces a synchronous reflow, so values are current.
    header.classList.remove('nav-collapsed');
    const items = ul.querySelectorAll('li');
    let wrapped = false;
    if (items.length > 1) {
      const firstTop = items[0].offsetTop;
      for (let i = 1; i < items.length; i++) {
        if (items[i].offsetTop !== firstTop) { wrapped = true; break; }
      }
    }
    if (wrapped) {
      header.classList.add('nav-collapsed');
    } else {
      closeMenu(header, nav);
    }
  }

  function scheduleUpdate() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateNavState);
  }

  // This script is parser-blocking at end of <body>, so the header DOM is
  // ready now — run immediately to avoid a flash of the wrapped nav.
  updateNavState();
  // Re-check once webfonts settle (they change link widths).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateNavState);
  }
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('orientationchange', scheduleUpdate);
})();
