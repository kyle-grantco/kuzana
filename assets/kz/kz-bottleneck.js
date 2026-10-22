/* Present the existing Tally form; preserve incoming parameters and email prefill. */
(function () {
  'use strict';
  var frame = document.getElementById('bottleneck-tally');
  if (!frame) return;

  var direct = new URL('https://tally.so/r/jakW49');
  new URLSearchParams(window.location.search).forEach(function (value, key) {
    if (value) direct.searchParams.set(key, value);
  });
  document.querySelectorAll('[data-bottleneck-form-link]').forEach(function (link) {
    link.href = direct.toString();
  });

  var embedded = new URL(direct);
  embedded.pathname = '/embed/jakW49';
  embedded.searchParams.set('alignLeft', '1');
  embedded.searchParams.set('hideTitle', '1');
  embedded.searchParams.set('transparentBackground', '1');
  embedded.searchParams.set('dynamicHeight', '1');
  // Set the complete URL before loading the widget; no initial unprefilled request.
  // The widget only resizes an existing src when data-tally-src is absent.
  frame.removeAttribute('data-tally-src');
  frame.src = embedded.toString();

  function resizeEmbeds() {
    if (window.Tally && typeof window.Tally.loadEmbeds === 'function') window.Tally.loadEmbeds();
  }
  if (window.Tally) resizeEmbeds();
  else {
    var widget = document.createElement('script');
    widget.src = 'https://tally.so/widgets/embed.js';
    widget.onload = resizeEmbeds;
    document.head.appendChild(widget);
  }
}());
