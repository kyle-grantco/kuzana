/* Preserve class attribution and load the real Tally form with a direct fallback. */
(function () {
  'use strict';
  var frame = document.getElementById('class-tally');
  if (!frame) return;
  var direct = new URL('https://tally.so/r/BE4OpA');
  var incoming = new URLSearchParams(window.location.search);
  incoming.forEach(function (value, key) {
    if (value) direct.searchParams.set(key, value);
  });
  var attribution = window.KuzanaAttribution;
  if (attribution) {
    var stored = attribution.getEffectiveFormAttribution();
    Object.keys(stored).forEach(function (key) {
      if (!direct.searchParams.has(key) && stored[key]) direct.searchParams.set(key, stored[key]);
    });
    var referral = attribution.getStoredReferralCode();
    if (!direct.searchParams.has('referral') && referral) direct.searchParams.set('referral', referral);
  }
  // Establish the full URL before either the iframe or the widget can load it.
  document.querySelectorAll('[data-class-form-link]').forEach(function (link) {
    link.href = direct.toString();
  });
  var embedded = new URL(direct);
  embedded.pathname = '/embed/BE4OpA';
  embedded.searchParams.set('alignLeft', '1');
  embedded.searchParams.set('hideTitle', '1');
  embedded.searchParams.set('transparentBackground', '1');
  embedded.searchParams.set('dynamicHeight', '1');
  embedded.searchParams.set('formEventsForwarding', '1');
  // The official widget resizes an existing src only without data-tally-src.
  frame.removeAttribute('data-tally-src');
  frame.src = embedded.toString();
  if (window.Tally && typeof window.Tally.loadEmbeds === 'function') window.Tally.loadEmbeds();
}());
