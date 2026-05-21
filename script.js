/*
 * Improved JS: defensive checks, ARIA updates, consolidated handlers,
 * and focus management for the exit-intent popup.
 */

let exitIntentShown = false;
let lastFocusedElement = null;
let hamburger = null;
let mobileMenu = null;
let body = null;
const ATTRIBUTION_STORAGE_KEY = 'kuzanaAttributionParamsV2';

/**
 * Returns true when the provided hostname belongs to Kuzana properties.
 * @param {string} hostname - Hostname to evaluate.
 * @returns {boolean}
 */
function isKuzanaHostname(hostname) {
    if (!hostname) return false;
    return hostname === 'kuzana.co' || hostname.endsWith('.kuzana.co');
}

/**
 * Filters search parameters to attribution-related keys we want to persist.
 * @param {URLSearchParams} searchParams - Input query parameters.
 * @returns {Object<string, string>}
 */
function getAttributionParams(searchParams) {
    const explicitKeys = new Set([
        'source',
        'campaign',
        'gclid',
        'fbclid',
        'ttclid',
        'msclkid'
    ]);
    const result = {};
    searchParams.forEach(function(value, key) {
        const normalizedKey = String(key || '').toLowerCase();
        const isUtm = normalizedKey.indexOf('utm_') === 0;
        if (!isUtm && !explicitKeys.has(normalizedKey)) return;
        if (value == null || value === '') return;
        result[key] = value;
    });
    return result;
}

/**
 * Reads persisted attribution parameters from localStorage.
 * @returns {Object<string, string>}
 */
function getStoredAttributionParams() {
    try {
        const rawValue = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
        if (!rawValue) return {};
        const parsedValue = JSON.parse(rawValue);
        if (!parsedValue || typeof parsedValue !== 'object') return {};
        return stripReferrerQueryParams(parsedValue);
    } catch (error) {
        return {};
    }
}

/**
 * Removes legacy `referrer` query propagation (e.g. WhatsApp wagroup) from attribution maps.
 * @param {Object<string, string>} params - Parsed attribution object.
 * @returns {Object<string, string>}
 */
function stripReferrerQueryParams(params) {
    const next = Object.assign({}, params);
    Object.keys(next).forEach(function(key) {
        if (String(key || '').toLowerCase() === 'referrer') delete next[key];
    });
    return next;
}

/**
 * Stores the current page attribution params, merging into existing values.
 */
function storeAttributionParamsFromLocation() {
    const currentParams = getAttributionParams(new URLSearchParams(window.location.search || ''));
    const currentKeys = Object.keys(currentParams);
    if (!currentKeys.length) return;
    const existingParams = getStoredAttributionParams();
    const mergedParams = stripReferrerQueryParams(
        Object.assign({}, existingParams, currentParams)
    );
    try {
        localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(mergedParams));
    } catch (error) {
        // no-op; attribution still works within current page load where possible
    }
}

/**
 * Appends persisted attribution params to eligible links if missing.
 * Applies to internal Kuzana links and form.kuzana.co application links.
 * @param {string} href - Candidate anchor href.
 * @param {Object<string, string>} storedParams - Persisted attribution map.
 * @returns {string}
 */
function withAttributionParams(href, storedParams) {
    if (!href) return href;
    const trimmedHref = href.trim();
    if (!trimmedHref) return href;
    if (trimmedHref.charAt(0) === '#') return href;
    if (/^(mailto:|tel:|javascript:)/i.test(trimmedHref)) return href;

    let parsedUrl;
    try {
        parsedUrl = new URL(trimmedHref, window.location.origin);
    } catch (error) {
        return href;
    }

    const isAbsolute = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmedHref);
    const isSameOrigin = parsedUrl.origin === window.location.origin;
    const isKuzanaLink = isKuzanaHostname(parsedUrl.hostname);
    const shouldDecorate = !isAbsolute || isSameOrigin || isKuzanaLink;
    if (!shouldDecorate) return href;

    Object.keys(storedParams).forEach(function(key) {
        if (!parsedUrl.searchParams.has(key)) parsedUrl.searchParams.set(key, storedParams[key]);
    });

    if (!isAbsolute) return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
    return parsedUrl.toString();
}

/**
 * Updates navigation and CTA links with stored attribution parameters.
 * @param {Object<string, string>} storedParams - Persisted attribution map.
 */
function decorateAnchorsWithAttribution(storedParams) {
    if (!storedParams || !Object.keys(storedParams).length) return;
    const anchors = document.querySelectorAll('a[href]');
    anchors.forEach(function(anchor) {
        const originalHref = anchor.getAttribute('href');
        if (!originalHref) return;
        const updatedHref = withAttributionParams(originalHref, storedParams);
        if (updatedHref && updatedHref !== originalHref) anchor.setAttribute('href', updatedHref);
    });
}

function closeMenu() {
    if (!hamburger || !mobileMenu || !body) return;
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    body.classList.remove('menu-open');
    body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
}

function openMenu() {
    if (!hamburger || !mobileMenu || !body) return;
    hamburger.classList.add('active');
    mobileMenu.classList.add('active');
    body.classList.add('menu-open');
    body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
}

document.addEventListener('DOMContentLoaded', function() {
    storeAttributionParamsFromLocation();
    const storedAttributionParams = getStoredAttributionParams();
    decorateAnchorsWithAttribution(storedAttributionParams);

    body = document.body;
    hamburger = document.querySelector('.menu-toggle');
    mobileMenu = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'main-navigation');
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            if (mobileMenu && mobileMenu.classList.contains('active')) closeMenu();
            else openMenu();
        });
    }

    if (mobileMenu) {
        const navLinks = mobileMenu.querySelectorAll('a');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });
    }

    // Ensure clicking the top-left Kuzana logo goes to the normal homepage without redirect
    try {
        var logoAnchor = document.querySelector('.logo a');
        if (logoAnchor) {
            var logoHref = withAttributionParams('/?no_redirect=1', storedAttributionParams);
            logoAnchor.setAttribute('href', logoHref);
        }
    } catch (e) {}
});

function closePopup() {
    const popup = document.getElementById('exitPopup');
    if (popup) {
        popup.classList.remove('active');
        document.body.style.overflow = '';
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
    }
}

function showPopup() {
    const popup = document.getElementById('exitPopup');
    if (popup && !exitIntentShown) {
        lastFocusedElement = document.activeElement;
        popup.classList.add('active');
        document.body.style.overflow = 'hidden';
        exitIntentShown = true;
        // Move focus to the close button for accessibility
        const closeBtn = popup.querySelector('.close-x');
        if (closeBtn) closeBtn.focus();
    }
}

// Exit-intent: desktop only, fire once
document.addEventListener('mouseleave', function(e) {
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile && e.clientY <= 0 && !exitIntentShown) {
        showPopup();
    }
});

// Global click handler to close menu when clicking outside
document.addEventListener('click', function(event) {
    if (mobileMenu && mobileMenu.classList.contains('active')) {
        if (!hamburger || !mobileMenu) return;
        if (!hamburger.contains(event.target) && !mobileMenu.contains(event.target)) {
            closeMenu();
        }
    }
});

// Unified Escape key handler: close popup first, then menu
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const popup = document.getElementById('exitPopup');
        if (popup && popup.classList.contains('active')) {
            closePopup();
            return;
        }
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    }
});