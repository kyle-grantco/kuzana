/* Homepage photos only. All existing calls to action keep their connections. */
(function () {
  'use strict';
  var hero = document.querySelector('[data-screen-label="Hero"]');
  if (!hero) return;
  var containers = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-gallery]'));
  if (!containers.length) return;

  var photos = [
    {
      src: '/assets/kz/founder-strategy-session.webp',
      alt: 'A Kuzana strategy session with founders around a table and a facilitator at the whiteboard',
      width: 1682, height: 924, desktop: '76% 50%', mobile: '68% 50%'
    },
    {
      src: '/assets/kz/founder-roundtable.webp',
      alt: 'Kuzana founders discussing their businesses together around a coffee table',
      width: 1280, height: 960, desktop: '67% 50%', mobile: '54% 50%'
    },
    {
      src: '/assets/kz/founder-workshop.webp',
      alt: 'Founders seated in a circle for a Kuzana group workshop',
      width: 1200, height: 718, desktop: '68% 50%', mobile: '58% 50%'
    }
  ];
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var visible = !('IntersectionObserver' in window);
  var current = 0;
  var timer = null;
  var galleries = [];

  // Keep the first photo as a static fallback. Load the others near the hero.
  function prepare() {
    if (galleries.length) return;
    galleries = containers.map(function (container) {
      var first = container.querySelector('.kz-hero-slide');
      var variant = container.getAttribute('data-hero-gallery');
      var slides = [first];
      photos.slice(1).forEach(function (photo) {
        var img = document.createElement('img');
        img.className = 'kz-hero-slide';
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        img.width = photo.width;
        img.height = photo.height;
        img.decoding = 'async';
        img.style.objectPosition = photo[variant];
        img.src = photo.src;
        container.insertBefore(img, first.nextSibling);
        slides.push(img);
      });
      return slides;
    });
  }

  function advance() {
    // Skip an unavailable photo while keeping the last successful image visible.
    for (var offset = 1; offset < photos.length; offset++) {
      var next = (current + offset) % photos.length;
      if (!galleries.every(function (slides) { return slides[next].complete && slides[next].naturalWidth > 0; })) continue;
      galleries.forEach(function (slides) {
        slides[current].classList.remove('is-active');
        slides[current].alt = '';
        slides[current].setAttribute('aria-hidden', 'true');
        slides[next].alt = photos[next].alt;
        slides[next].removeAttribute('aria-hidden');
        slides[next].classList.add('is-active');
      });
      current = next;
      return;
    }
  }

  function sync() {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    var playing = !motion.matches && visible && !document.hidden;
    hero.classList.toggle('kz-gallery-playing', playing);
    if (playing) {
      prepare();
      timer = window.setInterval(advance, 3000);
    }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  window.addEventListener('pagehide', function () {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  });
  window.addEventListener('pageshow', sync);
  sync();
}());
