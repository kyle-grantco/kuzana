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

/* Qualified-application conversion for TikTok (and GTM).
   When the embedded Tally application is submitted, read "Last month's revenue".
   If it is KSh 500,000 or more, fire TikTok's SubmitApplication event and a GTM event.
   Everyone else is not sent to TikTok as a conversion. */
(function () {
  'use strict';
  var PIXEL = 'D4BFOPJC77U5N735VIC0';
  var THRESHOLD = 500000;
  var fired = {};

  function ensurePixel() {
    var w = window;
    if (w.ttq && w.ttq._i && w.ttq._i[PIXEL]) return w.ttq;
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
      ttq.methods = ['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];
      ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e; };
      ttq.load = function (e, n) { var i = 'https://analytics.tiktok.com/i18n/pixel/events.js'; ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i; ttq._t = ttq._t || {}; ttq._t[e] = +new Date; ttq._o = ttq._o || {}; ttq._o[e] = n || {}; n = d.createElement('script'); n.type = 'text/javascript'; n.async = !0; n.src = i + '?sdkid=' + e + '&lib=' + t; e = d.getElementsByTagName('script')[0]; e.parentNode.insertBefore(n, e); };
      ttq.load(PIXEL);
    }(w, document, 'ttq');
    return w.ttq;
  }

  function toNumber(v) {
    if (v && typeof v === 'object') v = v.value !== undefined ? v.value : v.raw;
    if (Array.isArray(v)) v = v[0];
    var n = parseFloat(String(v === undefined || v === null ? '' : v).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? null : n;
  }

  function lastMonthRevenue(payload) {
    var fields = (payload && payload.fields) || [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i] || {};
      var title = String(f.title || f.label || '').toLowerCase();
      if (title.indexOf('last month') !== -1 && title.indexOf('revenue') !== -1) {
        return toNumber(f.answer !== undefined ? f.answer : f.value);
      }
    }
    return null;
  }

  window.addEventListener('message', function (e) {
    if (!/^https:\/\/(form\.kuzana\.co|tally\.so)$/.test(e.origin)) return;
    var data = e.data;
    if (typeof data === 'string') {
      if (data.indexOf('Tally.FormSubmitted') === -1) return;
      try { data = JSON.parse(data); } catch (err) { return; }
    } else if (!data || data.event !== 'Tally.FormSubmitted') {
      return;
    }
    if (!data) return;
    var payload = data.payload || {};
    var id = payload.id || payload.respondentId || 'submission';
    if (fired[id]) return;
    fired[id] = true;

    var revenue = lastMonthRevenue(payload);
    var qualified = revenue !== null && revenue >= THRESHOLD;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: qualified ? 'kz_qualified_application' : 'kz_application_submitted', kz_last_month_revenue: revenue });
    if (!qualified) return;
    try {
      ensurePixel().track('SubmitApplication', {
        content_name: 'Batch 5 qualified application',
        value: revenue,
        currency: 'KES'
      }, { event_id: 'kzq_' + id });
    } catch (err) { /* tracking must never break the page */ }
  });
}());
