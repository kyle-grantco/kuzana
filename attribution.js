/**
 * Kuzana form attribution: source, campaign, referrer (+ referral program code).
 * Persists across pages and decorates Apply links to form.kuzana.co/apply.
 */
(function (global) {
    var FORM_ATTRIBUTION_STORAGE_KEY = 'kuzanaFormAttributionV1';
    var REFERRAL_STORAGE_KEY = 'kuzanaReferralCode';
    var FORM_PARAM_KEYS = ['source', 'campaign', 'referrer'];
    var APPLY_HOST_PATTERN = /form\.kuzana\.co\/apply|kuzana\.co\/apply/;

    /**
     * @returns {boolean}
     */
    function isKuzanaHostname(hostname) {
        if (!hostname) return false;
        return hostname === 'kuzana.co' || hostname.endsWith('.kuzana.co');
    }

    /**
     * @param {string} referrer
     * @returns {boolean}
     */
    function isGoogleSearchReferrer(referrer) {
        if (!referrer) return false;
        try {
            var host = new URL(referrer).hostname.toLowerCase();
            return host === 'google.com' || host.indexOf('.google.') !== -1;
        } catch (error) {
            return false;
        }
    }

    /**
     * @returns {Object<string, string>}
     */
    function getStoredFormAttribution() {
        try {
            var raw = localStorage.getItem(FORM_ATTRIBUTION_STORAGE_KEY);
            if (!raw) return {};
            var parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (error) {
            return {};
        }
    }

    /**
     * @param {Object<string, string>} next
     */
    function saveFormAttribution(next) {
        try {
            localStorage.setItem(FORM_ATTRIBUTION_STORAGE_KEY, JSON.stringify(next));
        } catch (error) {
            // no-op
        }
    }

    /**
     * @param {URLSearchParams} searchParams
     * @returns {Object<string, string>}
     */
    function getFormAttributionFromSearchParams(searchParams) {
        var result = {};
        FORM_PARAM_KEYS.forEach(function (key) {
            var value = searchParams.get(key);
            if (value) result[key] = value;
        });
        return result;
    }

    /**
     * @param {URLSearchParams} searchParams
     * @returns {string}
     */
    function getReferralFromSearchParams(searchParams) {
        var referral = searchParams.get('referral');
        if (referral) return referral.trim();
        var legacy = searchParams.get('referrer');
        if (!legacy) return '';
        legacy = legacy.trim();
        if (/^https?:\/\//i.test(legacy)) return '';
        return legacy;
    }

    /**
     * Merges URL form attribution into localStorage.
     */
    function storeFormAttributionFromLocation() {
        var fromUrl = getFormAttributionFromSearchParams(
            new URLSearchParams(global.location.search || '')
        );
        if (!Object.keys(fromUrl).length) return;
        saveFormAttribution(Object.assign({}, getStoredFormAttribution(), fromUrl));
    }

    /**
     * Stores referral program code separately from form referrer field.
     */
    function storeReferralFromLocation() {
        var referral = getReferralFromSearchParams(
            new URLSearchParams(global.location.search || '')
        );
        if (!referral) return;
        try {
            localStorage.setItem(REFERRAL_STORAGE_KEY, referral);
        } catch (error) {
            // no-op
        }
    }

    /**
     * @returns {string}
     */
    function getStoredReferralCode() {
        try {
            return (localStorage.getItem(REFERRAL_STORAGE_KEY) || '').trim();
        } catch (error) {
            return '';
        }
    }

    /**
     * Tags organic Google search visits when no explicit source is already set.
     */
    function tagGoogleSearchVisit() {
        var searchParams = new URLSearchParams(global.location.search || '');
        if (searchParams.get('source')) return;

        var stored = getStoredFormAttribution();
        if (stored.source) return;

        var documentReferrer = global.document.referrer || '';
        if (!isGoogleSearchReferrer(documentReferrer)) return;

        var attribution = {
            source: 'googlesearch',
            campaign: 'organic',
            referrer: documentReferrer
        };
        saveFormAttribution(Object.assign({}, stored, attribution));
        syncAttributionToUrl(attribution);
    }

    /**
     * Adds attribution params to the current URL without reloading.
     * @param {Object<string, string>} attribution
     */
    function syncAttributionToUrl(attribution) {
        if (!global.history || !global.history.replaceState) return;
        try {
            var url = new URL(global.location.href);
            FORM_PARAM_KEYS.forEach(function (key) {
                if (attribution[key] && !url.searchParams.has(key)) {
                    url.searchParams.set(key, attribution[key]);
                }
            });
            global.history.replaceState(null, '', url.pathname + url.search + url.hash);
        } catch (error) {
            // no-op
        }
    }

    /**
     * @returns {Object<string, string>}
     */
    function getEffectiveFormAttribution() {
        var fromUrl = getFormAttributionFromSearchParams(
            new URLSearchParams(global.location.search || '')
        );
        return Object.assign({}, getStoredFormAttribution(), fromUrl);
    }

    /**
     * @param {string} href
     * @param {Object<string, string>} formAttribution
     * @param {string} referralCode
     * @returns {string}
     */
    function withApplyAttribution(href, formAttribution, referralCode) {
        if (!href) return href;
        var trimmedHref = href.trim();
        if (!trimmedHref || !APPLY_HOST_PATTERN.test(trimmedHref)) return href;

        try {
            var parsedUrl = new URL(trimmedHref, global.location.origin);
            FORM_PARAM_KEYS.forEach(function (key) {
                if (formAttribution[key] && !parsedUrl.searchParams.has(key)) {
                    parsedUrl.searchParams.set(key, formAttribution[key]);
                }
            });
            if (referralCode && !parsedUrl.searchParams.has('referral')) {
                parsedUrl.searchParams.set('referral', referralCode);
            }
            return parsedUrl.toString();
        } catch (error) {
            return href;
        }
    }

    /**
     * @param {string} baseUrl
     * @returns {string}
     */
    function buildApplyUrl(baseUrl) {
        var referral = getReferralFromSearchParams(
            new URLSearchParams(global.location.search || '')
        ) || getStoredReferralCode();
        return withApplyAttribution(
            baseUrl || 'https://form.kuzana.co/apply',
            getEffectiveFormAttribution(),
            referral
        );
    }

    /**
     * Decorates Apply anchors with stored form attribution and referral code.
     */
    function decorateApplyLinks() {
        var formAttribution = getEffectiveFormAttribution();
        var referralCode = getReferralFromSearchParams(
            new URLSearchParams(global.location.search || '')
        ) || getStoredReferralCode();

        if (!Object.keys(formAttribution).length && !referralCode) return;

        global.document.querySelectorAll('a[href]').forEach(function (anchor) {
            var originalHref = anchor.getAttribute('href');
            if (!originalHref || !APPLY_HOST_PATTERN.test(originalHref)) return;
            var updatedHref = withApplyAttribution(originalHref, formAttribution, referralCode);
            if (updatedHref && updatedHref !== originalHref) {
                anchor.setAttribute('href', updatedHref);
            }
        });
    }

    /**
     * Initializes attribution capture and link decoration.
     */
    function init() {
        tagGoogleSearchVisit();
        storeFormAttributionFromLocation();
        storeReferralFromLocation();
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', decorateApplyLinks);
        } else {
            decorateApplyLinks();
        }
    }

    global.KuzanaAttribution = {
        init: init,
        buildApplyUrl: buildApplyUrl,
        decorateApplyLinks: decorateApplyLinks,
        getEffectiveFormAttribution: getEffectiveFormAttribution
    };

    init();
}(window));
