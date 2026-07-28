/* Smash Club Monaco — shared behaviour: language toggle, year stamp, scroll reveals.
   No smooth-scroll library and no scroll-scrub: native scrolling is crisper and
   never fights the user's trackpad. localStorage key "scm-lang" holds "fr" | "en". */
(function () {
  'use strict';

  var KEY = 'scm-lang';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- language ----------
     Translated strings live in data-fr / data-en attributes. FR spans also carry
     literal text so the page reads with JS off; EN spans are empty and filled here. */
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
    try { localStorage.setItem(KEY, lang); } catch (e) { /* private mode */ }
  }

  var initial;
  try { initial = localStorage.getItem(KEY); } catch (e) { initial = null; }
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

  /* ---------- reveal on scroll ----------
     Only opacity + transform. Never clip-path on the observed node: a clipped
     element reports zero intersection area and the reveal deadlocks. */
  var items = document.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var sibs = en.target.parentElement ? en.target.parentElement.children : [en.target];
        var g = [].indexOf.call(sibs, en.target);
        en.target.style.transitionDelay = Math.min(g, 4) * 70 + 'ms';
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- nav shade ---------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('stuck', window.scrollY > 30); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
