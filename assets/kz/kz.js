/* Kuzana 2026 site runtime. Vanilla port of the design prototype's behaviour:
   entrance animations, mobile menu, sticky Apply bar, scroll spy, tabs,
   checklists, filter chips, carousels and the footer Substack form.
   Page-specific lead forms keep their own inline scripts. */
(function () {
  'use strict';
  var EASE = 'cubic-bezier(.2,.7,.1,1)';
  var motionQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = !!(motionQuery && motionQuery.matches);
  var activeMotion = new Set();
  var body = document.body;

  function motion(el, frames, options) {
    if (reduced || !el || !el.animate) return null;
    var animation = el.animate(frames, options);
    activeMotion.add(animation);
    animation.finished.then(function () { activeMotion.delete(animation); }, function () { activeMotion.delete(animation); });
    return animation;
  }
  function motionPreference() {
    reduced = motionQuery.matches;
    if (reduced) activeMotion.forEach(function (animation) {
      if (animation.effect.getTiming().iterations === Infinity) animation.cancel();
      else { try { animation.finish(); } catch (err) { animation.cancel(); } }
    });
    if (refreshEntrances) refreshEntrances();
  }
  if (motionQuery) {
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', motionPreference);
    else if (motionQuery.addListener) motionQuery.addListener(motionPreference);
  }

  /* ---------- Apply click -> dataLayer `apply_click` (GTM trigger; same payload as the old homepage handler) ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || !window.KuzanaAttribution || typeof window.KuzanaAttribution.isApplyUrl !== 'function' || !window.KuzanaAttribution.isApplyUrl(a.href)) return;
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'apply_click', apply_url: a.href, apply_value: 1.0, apply_currency: 'USD' });
    } catch (err) { /* navigation must continue */ }
  });

  /* ---------- Resources dropdowns: native disclosures retain a no-JS fallback ---------- */
  var resourceMenus = document.querySelectorAll('[data-kz-resources]');
  var desktopHover = window.matchMedia('(min-width: 880px) and (hover: hover) and (pointer: fine)');
  resourceMenus.forEach(function (details) {
    var summary = details.querySelector('summary'), leaveTimer, openedByHover = false;
    details.addEventListener('pointerenter', function (e) {
      clearTimeout(leaveTimer);
      if (desktopHover.matches && e.pointerType === 'mouse' && !details.open) {
        openedByHover = true;
        details.open = true;
      }
    });
    summary.addEventListener('click', function (e) {
      // The first mouse click keeps a just-hovered menu open; keyboard stays native.
      if (openedByHover && details.open && e.detail > 0) e.preventDefault();
      openedByHover = false;
    });
    details.addEventListener('pointerleave', function () {
      if (!desktopHover.matches) return;
      leaveTimer = setTimeout(function () {
        if (!details.contains(document.activeElement)) details.open = false;
      }, 160);
    });
    details.addEventListener('focusout', function () {
      setTimeout(function () {
        // Safari may blur the summary before a pointer click reaches its link.
        if (!details.contains(document.activeElement) && !details.matches(':hover')) details.open = false;
      }, 0);
    });
    details.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && details.open) {
        e.preventDefault();
        details.open = false;
        summary.focus();
      }
      if (e.key === 'ArrowDown' && e.target === summary) {
        e.preventDefault();
        details.open = true;
        details.querySelector('a').focus();
      }
    });
    details.querySelectorAll('a').forEach(function (a) {
      // Let the browser follow the link before hiding its disclosure (WebKit).
      a.addEventListener('click', function () { setTimeout(function () { details.open = false; }, 0); });
    });
  });
  document.addEventListener('click', function (e) {
    resourceMenus.forEach(function (details) {
      if (!details.contains(e.target)) details.open = false;
    });
  });
  window.addEventListener('resize', function () {
    resourceMenus.forEach(function (details) {
      if (!details.getClientRects().length) details.open = false;
    });
  });

  /* ---------- Mobile menu ---------- */
  var menuButtons = document.querySelectorAll('[data-kz-menu-toggle]');
  var menu = document.getElementById('kz-mobile-menu');
  var menuOpen = false, menuAnimation = null, menuVersion = 0;
  if (menu) menu.inert = true;
  function setMenu(open, returnFocus, immediate) {
    if (open === menuOpen && !menuAnimation) return;
    var version = ++menuVersion;
    var wasVisible = body.classList.contains('kz-menu-open');
    var opacity = menu && wasVisible ? getComputedStyle(menu).opacity : '0';
    var transform = menu && wasVisible ? getComputedStyle(menu).transform : 'translateY(-12px)';
    if (menuAnimation) menuAnimation.cancel();
    menuOpen = open;
    if (!open && menu) menu.querySelectorAll('[data-kz-resources]').forEach(function (details) { details.open = false; });
    body.classList.toggle('kz-menu-open', open || (!immediate && !reduced && wasVisible));
    if (menu) menu.inert = !open;
    menuButtons.forEach(function (btn) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    menuAnimation = immediate ? null : motion(menu, [
      { opacity: opacity, transform: transform },
      { opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(-12px)' }
    ], { duration: 220, easing: EASE });
    if (menuAnimation) menuAnimation.finished.then(function () {
      if (version !== menuVersion) return;
      body.classList.toggle('kz-menu-open', open);
      menuAnimation = null;
    }, function () {});
    else body.classList.toggle('kz-menu-open', open);
    if (!open && returnFocus && menuButtons.length) menuButtons[0].focus();
  }
  menuButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setMenu(!menuOpen, false);
    });
  });
  document.querySelectorAll('.kz-menu a').forEach(function (a) {
    a.addEventListener('click', function () { setTimeout(function () { setMenu(false, false); }, 0); });
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 880) setMenu(false, false, true);
  });
  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented) return;
    if (e.key === 'Escape') {
      var openResource = Array.prototype.find.call(resourceMenus, function (details) { return details.open; });
      if (openResource) {
        openResource.open = false;
        e.preventDefault();
        return;
      }
    }
    if (e.key === 'Escape' && menuOpen) setMenu(false, true);
    if (e.key === 'Tab' && menuOpen) {
      var links = Array.prototype.slice.call(document.querySelectorAll('[data-kz-menu-toggle], .kz-menu a[href], .kz-menu summary')).filter(function (el) { return el.getClientRects().length > 0; });
      var index = links.indexOf(document.activeElement);
      if (e.shiftKey && index <= 0) { e.preventDefault(); links[links.length - 1].focus(); }
      else if (!e.shiftKey && (index === -1 || index === links.length - 1)) { e.preventDefault(); links[0].focus(); }
    }
  });

  /* ---------- Sticky Apply bar: after the hero, hidden over the final CTA ---------- */
  var finalCta = document.querySelector('[data-kz-final]');
  function onScroll() {
    var past = window.scrollY > 640;
    var overFinal = false;
    if (finalCta) {
      var r = finalCta.getBoundingClientRect();
      overFinal = r.top < window.innerHeight && r.bottom > 0;
    }
    body.classList.toggle('kz-scrolled', past && !overFinal);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll spy for in-page nav ---------- */
  var spyLinks = document.querySelectorAll('[data-spy-link]');
  if (spyLinks.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        spyLinks.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('data-spy-link') === e.target.id); });
      });
    }, { rootMargin: '-30% 0px -65% 0px' });
    spyLinks.forEach(function (l) {
      var el = document.getElementById(l.getAttribute('data-spy-link'));
      if (el) spy.observe(el);
    });
  }

  /* ---------- Tabs: [data-tabs] > [data-tab="i"] buttons + [data-panel="i"] ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (root, rootIndex) {
    var tabs = root.querySelectorAll('[data-tab]');
    var panels = root.querySelectorAll('[data-panel]');
    var onColor = root.getAttribute('data-tab-on') || '#FE7272';
    var offColor = root.getAttribute('data-tab-off') || 'rgba(251,247,239,.18)';
    if (!tabs.length || !panels.length) return;
    var stage = document.createElement('div');
    stage.className = 'kz-tab-panels';
    panels[0].before(stage);
    panels.forEach(function (panel) { stage.appendChild(panel); });
    var tabList = tabs[0].parentElement;
    tabList.setAttribute('role', 'tablist');
    tabList.setAttribute('aria-label', 'Founder testimonials');
    var selected = null, animations = [], version = 0;
    tabs.forEach(function (tab, index) {
      var panel = Array.prototype.find.call(panels, function (p) { return p.getAttribute('data-panel') === tab.getAttribute('data-tab'); });
      if (!panel) return;
      tab.id = tab.id || 'kz-tab-' + rootIndex + '-' + index;
      panel.id = panel.id || 'kz-panel-' + rootIndex + '-' + index;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
    });
    function pick(i) {
      var next = Array.prototype.find.call(panels, function (p) { return p.getAttribute('data-panel') === i; });
      if (!next || next === selected) return;
      var previous = selected, oldHeight = stage.getBoundingClientRect().height;
      var turn = ++version;
      animations.forEach(function (a) { a.cancel(); });
      animations = [];
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        t.style.borderTopColor = on ? onColor : offColor;
        t.style.opacity = on ? '1' : '0.6';
      });
      panels.forEach(function (p) {
        p.hidden = p !== next;
        p.inert = p !== next;
        p.setAttribute('aria-hidden', p === next ? 'false' : 'true');
        p.style.position = '';
        p.style.inset = '';
        p.style.width = '';
      });
      selected = next;
      stage.style.height = '';
      if (!previous || reduced || !stage.animate) return;
      var newHeight = next.getBoundingClientRect().height;
      previous.hidden = false;
      previous.style.position = 'absolute';
      previous.style.inset = '0 auto auto 0';
      previous.style.width = '100%';
      stage.style.height = newHeight + 'px';
      animations = [
        motion(stage, [{ height: oldHeight + 'px' }, { height: newHeight + 'px' }], { duration: 360, easing: EASE }),
        motion(previous, [{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: 'ease-out', fill: 'forwards' }),
        motion(next, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300, delay: 80, easing: EASE, fill: 'backwards' })
      ].filter(Boolean);
      Promise.all(animations.map(function (a) { return a.finished.catch(function () {}); })).then(function () {
        if (turn !== version) return;
        previous.hidden = true;
        previous.style.position = previous.style.inset = previous.style.width = '';
        animations.forEach(function (a) { a.cancel(); });
        animations = [];
        stage.style.height = '';
      });
    }
    tabs.forEach(function (t, index) {
      t.addEventListener('click', function () { pick(t.getAttribute('data-tab')); });
      t.addEventListener('keydown', function (event) {
        var next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        tabs[next].focus();
        pick(tabs[next].getAttribute('data-tab'));
      });
    });
    if (tabs.length) pick(tabs[0].getAttribute('data-tab'));
  });

  /* ---------- FAQ disclosures: native details with smooth, interruptible height ---------- */
  document.querySelectorAll('main details').forEach(function (details) {
    var summary = details.querySelector('summary');
    if (!summary) return;
    var animation = null, intended = details.open;
    var overflow = details.style.overflow;
    summary.setAttribute('aria-expanded', String(details.open));
    details.addEventListener('toggle', function () {
      if (!animation) {
        intended = details.open;
        summary.setAttribute('aria-expanded', String(details.open));
      }
    });
    summary.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.target.closest('a') || reduced || !details.animate) return;
      event.preventDefault();
      var start = details.getBoundingClientRect().height;
      if (animation) animation.cancel();
      intended = !intended;
      summary.setAttribute('aria-expanded', String(intended));
      // Measure both native states, retaining the answer during its closing animation.
      details.open = false;
      var closedHeight = details.getBoundingClientRect().height;
      details.open = true;
      var openHeight = details.getBoundingClientRect().height;
      details.style.overflow = 'hidden';
      var next = motion(details, [{ height: start + 'px' }, { height: (intended ? openHeight : closedHeight) + 'px' }], { duration: 300, easing: EASE });
      animation = next;
      next.finished.then(function () {
        if (animation !== next) return;
        details.open = intended;
        details.style.overflow = overflow;
        animation = null;
      }, function () {});
    });
  });

  /* ---------- Self-check list: [data-checklist] with [data-check] buttons ---------- */
  document.querySelectorAll('[data-checklist]').forEach(function (root) {
    var items = root.querySelectorAll('[data-check]');
    var count = root.querySelector('[data-check-count]');
    var ready = root.querySelector('[data-check-ready]');
    var notReady = root.querySelector('[data-check-notready]');
    function update() {
      var n = 0;
      items.forEach(function (it) { if (it.getAttribute('aria-pressed') === 'true') n++; });
      if (count) count.textContent = n + ' of ' + items.length;
      var all = n === items.length;
      if (ready) ready.hidden = !all;
      if (notReady) notReady.hidden = all;
    }
    items.forEach(function (it) {
      it.setAttribute('aria-pressed', 'false');
      it.addEventListener('click', function () {
        var on = it.getAttribute('aria-pressed') !== 'true';
        it.setAttribute('aria-pressed', on ? 'true' : 'false');
        var box = it.querySelector('[data-check-box]');
        if (box) {
          box.style.background = on ? '#FDC469' : 'transparent'; box.textContent = on ? '✓' : '';
          motion(box, [{ transform: 'scale(.82)' }, { transform: 'scale(1)' }], { duration: 200, easing: EASE });
        }
        update();
      });
    });
    update();
  });

  /* ---------- Filter chips: [data-filter] root, [data-filter-key] chips, [data-filter-tags] items ---------- */
  document.querySelectorAll('[data-filter]').forEach(function (root) {
    var chips = root.querySelectorAll('[data-filter-key]');
    var items = root.querySelectorAll('[data-filter-tags]');
    var activeKey = null, filterAnimations = [];
    function pick(key) {
      filterAnimations.forEach(function (animation) { animation.cancel(); });
      filterAnimations = [];
      var changed = activeKey !== null && activeKey !== key;
      activeKey = key;
      chips.forEach(function (c) {
        var on = c.getAttribute('data-filter-key') === key;
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
        c.style.background = on ? (c.getAttribute('data-on-bg') || '#18202F') : 'transparent';
        c.style.color = on ? (c.getAttribute('data-on-fg') || '#FBF7EF') : (c.getAttribute('data-off-fg') || '#18202F');
        c.style.borderColor = on ? (c.getAttribute('data-on-bg') || '#18202F') : (c.getAttribute('data-off-bd') || 'rgba(24,32,47,.3)');
      });
      var visibleIndex = 0;
      items.forEach(function (it) {
        var tags = (it.getAttribute('data-filter-tags') || '').split(/\s+/);
        it.hidden = !(key === 'all' || tags.indexOf(key) !== -1);
        if (!it.hidden && changed) {
          var animation = motion(it, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280, delay: Math.min(visibleIndex++ * 25, 125), easing: EASE, fill: 'backwards' });
          if (animation) filterAnimations.push(animation);
        }
      });
      root.dispatchEvent(new CustomEvent('kz:filter', { detail: key }));
    }
    chips.forEach(function (c) { c.addEventListener('click', function () { pick(c.getAttribute('data-filter-key')); }); });
    var start = root.querySelector('[data-filter-key][data-default]') || chips[0];
    if (start) pick(start.getAttribute('data-filter-key'));
  });

  /* ---------- Carousel arrows: [data-carousel-prev|next="id"] ---------- */
  document.querySelectorAll('[data-carousel-prev],[data-carousel-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-carousel-prev') || btn.getAttribute('data-carousel-next');
      var el = document.getElementById(id);
      if (!el) return;
      var dir = btn.hasAttribute('data-carousel-prev') ? -1 : 1;
      el.scrollBy({ left: dir * Math.min(360, el.clientWidth * 0.8), behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Footer / blog Substack signup: opens Substack's confirm page ---------- */
  document.querySelectorAll('[data-substack-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var em = (new FormData(form).get('email') || '').toString().trim();
      if (!em) return;
      var subscribeUrl = 'https://kuzana.substack.com/subscribe?email=' + encodeURIComponent(em);
      var done = form.parentNode.querySelector('[data-substack-done]');
      var fallback = done && done.querySelector('[data-substack-continue]');
      if (fallback) fallback.href = subscribeUrl;
      window.open(subscribeUrl, '_blank', 'noopener');
      form.hidden = true;
      if (done) done.hidden = false;
    });
  });

  /* ---------- Journey timeline (about page) ---------- */
  var journey = document.querySelector('[data-journey]');
  if (journey) {
    var jLine = journey.querySelector('[data-jline]');
    var jSun = journey.querySelector('[data-jsun]');
    var jSteps = journey.querySelectorAll('[data-jstep]');
    var onJourney = function () {
      var r = journey.getBoundingClientRect(), mark = window.innerHeight * 0.55;
      var p = Math.max(0, Math.min(1, (mark - r.top - 8) / Math.max(1, r.height - 16)));
      if (jLine) jLine.style.transform = 'scaleY(' + p + ')';
      if (jSun) { jSun.style.transform = 'translateY(' + (8 + p * (r.height - 16) - 12) + 'px)'; jSun.style.opacity = p > 0 && p < 1 ? '1' : (p >= 1 ? '0.9' : '0'); }
      var active = -1;
      jSteps.forEach(function (st, i) { if (st.getBoundingClientRect().top < mark) active = i; });
      jSteps.forEach(function (st, i) {
        st.style.opacity = i === active ? '1' : (i < active ? '0.55' : '0.3');
        var d = st.querySelector('[data-jdot]');
        if (d) { var on = i <= active; d.style.background = on ? d.getAttribute('data-jdot') : '#101A2E'; d.style.transform = i === active ? 'scale(1.35)' : 'scale(1)'; }
      });
    };
    window.addEventListener('scroll', onJourney, { passive: true });
    window.addEventListener('resize', onJourney);
    onJourney();
  }

  /* ---------- Animate on entry, including mobile and initially hidden variants ---------- */
  var refreshEntrances;
  var counterLabels = new WeakMap();
  var counterRuns = new WeakMap();
  function playEntrance(el) {
    var phone = window.matchMedia('(max-width: 879.98px)').matches;
    var delay = Math.min(+(el.getAttribute('data-delay') || 0), phone ? 160 : 360);
    var duration = phone ? 680 : 700;
    var animations = [];
    function add(frames, options) {
      var animation = motion(el, frames, options);
      if (animation) animations.push(animation);
    }
    if (el.hasAttribute('data-reveal')) add([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: duration, delay: delay, easing: EASE, fill: 'backwards' });
    if (el.hasAttribute('data-wipe')) add([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { duration: 900, delay: delay, easing: EASE, fill: 'backwards' });
    if (el.hasAttribute('data-grow')) add([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: duration, delay: delay, easing: EASE, fill: 'backwards' });
    if (el.hasAttribute('data-draw') && el.getTotalLength) {
      var length = el.getTotalLength();
      el.style.strokeDasharray = length;
      add([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], { duration: 1200, delay: delay, easing: EASE, fill: 'backwards' });
    }
    if (el.hasAttribute('data-count')) {
      var target = parseFloat(el.getAttribute('data-count'));
      var prefix = el.getAttribute('data-pre') || '', suffix = el.getAttribute('data-suf') || '';
      var finalText = counterLabels.get(el) || el.textContent, start = performance.now() + delay;
      var run = {};
      counterLabels.set(el, finalText);
      counterRuns.set(el, run);
      function count(now) {
        if (counterRuns.get(el) !== run) return;
        if (reduced) { el.textContent = finalText; return; }
        var progress = Math.min(1, Math.max(0, (now - start) / 1100));
        el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - progress, 3))) + suffix;
        if (progress < 1) requestAnimationFrame(count);
        else el.textContent = finalText;
      }
      if (Number.isFinite(target)) requestAnimationFrame(count);
    }
    if (el.hasAttribute('data-zoom')) add([{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 7000, easing: EASE });
    if (el.hasAttribute('data-rise')) add([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1200, delay: 120, easing: EASE, fill: 'backwards' });
    if (el.hasAttribute('data-sun')) add([{ transform: 'translateY(120px)' }, { transform: 'translateY(0)' }], { duration: 1600, easing: EASE });
    if (el.hasAttribute('data-ring')) add([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: delay, fill: 'backwards' });
    if (el.hasAttribute('data-hero-curve') && el.getTotalLength) {
      var curveLength = el.getTotalLength();
      el.style.strokeDasharray = curveLength;
      add([{ strokeDashoffset: curveLength }, { strokeDashoffset: 0 }], { duration: 1400, delay: delay, easing: EASE, fill: 'backwards' });
    }
    if (el.hasAttribute('data-drift')) add([{ transform: 'translateX(-16px)' }, { transform: 'translateX(16px)' }], { duration: 6500, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
    if (el.hasAttribute('data-pulse')) add([{ opacity: .08 }, { opacity: .5 }], { duration: 2400, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
    if (el.hasAttribute('data-marquee')) add([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 75000, iterations: Infinity });
    return animations;
  }
  function setupEntrances() {
    if (!Element.prototype.animate || !('IntersectionObserver' in window)) return;
    // Give every redesigned page an entrance, including headings without prototype hooks.
    document.querySelectorAll('main h1,main h2').forEach(function (heading) {
      if (!heading.closest('[data-reveal]')) heading.setAttribute('data-reveal', '');
    });
    var selector = '[data-reveal],[data-wipe],[data-draw],[data-count],[data-grow],[data-zoom],[data-rise],[data-sun],[data-ring],[data-hero-curve],[data-drift],[data-pulse],[data-marquee]';
    var states = new Map();
    function update(state) {
      var run = state.visible && !state.hovered && !document.hidden && !reduced;
      if (run && (!state.seen || (state.loop && state.animations.every(function (a) { return a.playState === 'idle'; })))) {
        state.animations = playEntrance(state.el);
        state.seen = true;
      } else if (state.loop) state.animations.forEach(function (animation) {
        if (animation.playState === 'idle') return;
        if (run) animation.play();
        else animation.pause();
      });
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var state = states.get(entry.target);
        state.visible = entry.isIntersecting;
        update(state);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });
    document.querySelectorAll(selector).forEach(function (el) {
      var state = { el: el, visible: false, seen: false, hovered: false, animations: [], loop: el.matches('[data-drift],[data-pulse],[data-marquee]') };
      states.set(el, state);
      observer.observe(el);
      if (el.hasAttribute('data-marquee') && window.matchMedia('(hover: hover)').matches) {
        el.addEventListener('mouseenter', function () { state.hovered = true; update(state); });
        el.addEventListener('mouseleave', function () { state.hovered = false; update(state); });
      }
    });
    refreshEntrances = function () { states.forEach(update); };
    document.addEventListener('visibilitychange', refreshEntrances);
    function layout() { return window.innerWidth < 880 ? 'phone' : (window.innerWidth < 1180 ? 'tablet' : 'desktop'); }
    var previousLayout = layout();
    window.addEventListener('resize', function () {
      var nextLayout = layout();
      if (nextLayout === previousLayout) return;
      previousLayout = nextLayout;
      // A new responsive layout gets its own entrance. Address-bar height changes don't replay it.
      states.forEach(function (state) {
        state.animations.forEach(function (animation) { animation.cancel(); });
        state.animations = [];
        state.seen = false;
        if (counterLabels.has(state.el)) {
          counterRuns.delete(state.el);
          state.el.textContent = counterLabels.get(state.el);
        }
        var rect = state.el.getBoundingClientRect();
        state.visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight * .95 && rect.right > 0 && rect.left < window.innerWidth;
        update(state);
      });
    });
  }
  setupEntrances();
}());
