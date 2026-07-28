/* Smash Club Monaco — shared behaviour: language toggle, year stamp, Lenis smooth scroll.
   localStorage key "scm-lang" holds "fr" | "en". FR is the default. */
(function () {
  'use strict';

  /* ---------- language ---------- */
  var KEY = 'scm-lang';
  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  /* Hydrate: the translated string lives in the data-fr / data-en attribute.
     FR spans also carry literal text so the page reads correctly with JS off;
     EN spans are empty in the markup and get filled here. */
  ['fr', 'en'].forEach(function (l) {
    document.querySelectorAll('[data-' + l + ']').forEach(function (el) {
      var v = el.getAttribute('data-' + l);
      if (v && !el.textContent.trim()) el.textContent = v;
    });
  });
  function apply(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    document.querySelectorAll('[data-alt-fr]').forEach(function (el) {
      el.setAttribute('alt', lang === 'en' ? el.dataset.altEn : el.dataset.altFr);
    });
    document.querySelectorAll('[data-label-fr]').forEach(function (el) {
      el.setAttribute('aria-label', lang === 'en' ? el.dataset.labelEn : el.dataset.labelFr);
    });
    try { localStorage.setItem(KEY, lang); } catch (e) { /* private mode */ }
  }
  var initial = stored();
  if (!initial) initial = /^en\b/i.test(navigator.language || '') ? 'en' : 'fr';
  apply(initial);

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.lang button');
    if (b) apply(b.dataset.lang);
  });

  /* ---------- year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- smooth scroll ---------- */
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function initLenis() {
    if (reduced || !window.Lenis || window.__lenis) return;
    var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    window.__lenis = lenis;
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
  }
  if (window.Lenis) initLenis(); else window.addEventListener('load', initLenis);

  /* in-page links route through Lenis (capture phase) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href.length < 2) return;
    var el = document.querySelector(href);
    if (!el) return;
    e.preventDefault();
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -8 });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', href);
  }, true);

  /* ---------- reveal on scroll ---------- */
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
  }
})();
