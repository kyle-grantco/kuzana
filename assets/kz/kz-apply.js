/* Embed the existing custom-domain Tally application, preserving its whole workflow. */
(function () {
  'use strict';
  var frame = document.getElementById('apply-tally');
  if (!frame) return;
  var notes = document.getElementById('apply-notes');
  if (notes && window.matchMedia('(max-width: 879.98px)').matches) notes.open = false;
  // Apply controls on this page scroll to the form without reloading entered answers.
  document.querySelectorAll('a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    var url = new URL(link.href);
    if (url.origin === window.location.origin && /^\/apply\/?$/.test(url.pathname)) {
      link.href = window.location.pathname + window.location.search + '#application';
    }
  });
  var direct = new URL('https://form.kuzana.co/apply');
  new URLSearchParams(window.location.search).forEach(function (value, key) {
    if (value) direct.searchParams.set(key, value);
  });
  if (window.KuzanaAttribution) direct = new URL(window.KuzanaAttribution.buildApplyUrl(direct.toString()));
  document.querySelectorAll('[data-apply-form-link]').forEach(function (link) { link.href = direct.toString(); });

  var embedded = new URL(direct);
  embedded.searchParams.set('embed', '1');
  embedded.searchParams.set('alignLeft', '1');
  embedded.searchParams.set('hideTitle', '1');
  embedded.searchParams.set('transparentBackground', '1');
  embedded.searchParams.set('dynamicHeight', '1');
  // An existing src without data-tally-src lets the official widget attach its resizer.
  frame.removeAttribute('data-tally-src');
  frame.src = embedded.toString();

  function resize() {
    if (window.Tally && typeof window.Tally.loadEmbeds === 'function') window.Tally.loadEmbeds();
  }
  if (window.Tally) resize();
  else {
    var script = document.createElement('script');
    script.src = 'https://tally.so/widgets/embed.js';
    script.onload = resize;
    document.head.appendChild(script);
  }
}());
