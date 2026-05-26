// ── TOOLTIP PORTAL ──
// Один глобальный бабл в <body> — за пределами любых transform-контейнеров.
// Это решает проблему: position:fixed внутри элемента с transform
// перестаёт быть относительно viewport и обрезается overflow:hidden у родителя.
(function () {
  var GAP = 10;
  var W   = 300;

  // Создаём один бабл прямо в body
  var portal = document.createElement('div');
  portal.className = 'tooltip__bubble';
  document.body.appendChild(portal);

  function show(icon, html) {
    portal.innerHTML = html;

    var r  = icon.getBoundingClientRect();
    var bh = portal.offsetHeight || 120;

    var top  = r.top - bh - GAP;
    var left = r.left + r.width / 2 - W / 2;

    if (left < 8) left = 8;
    if (left + W > window.innerWidth - 8) left = window.innerWidth - W - 8;

    if (top < 8) {
      top = r.bottom + GAP;
      portal.classList.add('is-below');
    } else {
      portal.classList.remove('is-below');
    }

    portal.style.top  = top  + 'px';
    portal.style.left = left + 'px';
    portal.classList.add('is-visible');
  }

  function hide() {
    portal.classList.remove('is-visible', 'is-below');
  }

  document.addEventListener('mouseenter', function (e) {
    if (!(e.target instanceof Element)) return;
    var tip = e.target.closest('.tooltip');
    if (!tip) return;
    var src = tip.querySelector('.tooltip__bubble');
    var icon = tip.querySelector('.tooltip__icon') || tip;
    if (!src) return;
    show(icon, src.innerHTML);
  }, true);

  document.addEventListener('mouseleave', function (e) {
    if (!(e.target instanceof Element)) return;
    if (e.target.closest('.tooltip')) hide();
  }, true);
})();

// ── SCROLL TO ──
function scrollToEl(sel) { document.querySelector(sel).scrollIntoView({ behavior: 'smooth' }); }

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── NAV SCROLL ──
window.addEventListener('scroll', () => {
  const shadow = window.scrollY > 50 ? '0 4px 32px rgba(0,0,0,0.5)' : '';
  const nav = document.querySelector('.header-nav-shad');
  if (nav) nav.style.boxShadow = shadow;
  const subNav = document.querySelector('.subnav-shad');
  if (subNav) subNav.style.boxShadow = shadow;
}, { passive: true });

// ── SCROLL RESTORATION ──
// Отключаем автоматическое восстановление скролла браузером — иначе nav дёргается
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ── PAGE TRANSITIONS ──
(function () {
  function getContent() { return document.getElementById('page-content'); }

  // При обычной загрузке — #page-content плавно появляется
  window.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const c = getContent();
        if (c) c.classList.add('page-visible');
      });
    });
  });

  // При восстановлении из кэша браузера (кнопки назад/вперёд) — тоже показываем контент
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      const c = getContent();
      if (c) c.classList.add('page-visible');
    }
  });

  // Перехват ссылок — #page-content гаснет, затем переход
  function doNavigate(url) {
    const c = getContent();
    if (c) c.classList.remove('page-visible');
    setTimeout(() => { window.location.href = url; }, 450);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript') || link.target === '_blank') return;
    if (href.startsWith('http') || href.startsWith('//')) return;
    e.preventDefault();
    doNavigate(href);
  });

  window._navigateTo = doNavigate;
})();

// Функция для кнопок с onclick
function navigateTo(url) { window._navigateTo(url); }

// ── NAV MEGA-MENU DROPDOWN ──
(function () {
  function initDropdowns() {
    var items   = document.querySelectorAll('.nav-item--has-dropdown');
    var overlay = document.querySelector('.nav-dd-overlay');

    function closeAll() {
      items.forEach(function (item) {
        var t = item.querySelector('.nav-dd-trigger');
        var d = item.querySelector('.nav-dropdown');
        if (t) { t.setAttribute('aria-expanded', 'false'); t.classList.remove('is-open'); }
        if (d) { d.classList.remove('is-open'); }
      });
      if (overlay) overlay.classList.remove('is-open');
    }

    items.forEach(function (item) {
      var trigger  = item.querySelector('.nav-dd-trigger');
      var dropdown = item.querySelector('.nav-dropdown');
      if (!trigger || !dropdown) return;

      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = dropdown.classList.contains('is-open');
        closeAll();
        if (!isOpen) {
          trigger.setAttribute('aria-expanded', 'true');
          trigger.classList.add('is-open');
          dropdown.classList.add('is-open');
          if (overlay) overlay.classList.add('is-open');
        }
      });
    });

    if (overlay) overlay.addEventListener('click', closeAll);

    document.addEventListener('click', function (e) {
      if (!(e.target instanceof Element)) return;
      if (!e.target.closest('.nav-item--has-dropdown')) closeAll();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });

    window.addEventListener('beforeunload', closeAll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdowns);
  } else {
    initDropdowns();
  }
})();
