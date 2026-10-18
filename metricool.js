/**
 * Kuzana Metricool site tracker.
 * Loaded once from shared scripts (custom.js / script.js) or a direct <script src="/metricool.js">.
 * Hash: 25353a8459e6cfc3b520d4ffdacd578b
 */
(function () {
  if (window.__kuzanaMetricoolLoaded) return;
  window.__kuzanaMetricoolLoaded = true;

  /**
   * Loads an external script then runs onload.
   * @param {function(): void} onload
   */
  function loadScript(onload) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://tracker.metricool.com/resources/be.js';
    script.onreadystatechange = onload;
    script.onload = onload;
    head.appendChild(script);
  }

  loadScript(function () {
    if (typeof beTracker !== 'undefined' && beTracker.t) {
      beTracker.t({ hash: '25353a8459e6cfc3b520d4ffdacd578b' });
    }
  });
})();
