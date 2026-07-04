/*
 * Improved JS: defensive checks, ARIA updates, consolidated handlers,
 * and focus management for the exit-intent popup.
 */

let exitIntentShown = false;
let lastFocusedElement = null;
//let hamburger = null;
let mobileMenu = null;
let body = null;

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
    if (window.KuzanaAttribution) {
        window.KuzanaAttribution.decorateApplyLinks();
    }

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
            logoAnchor.setAttribute('href', '/?no_redirect=1');
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