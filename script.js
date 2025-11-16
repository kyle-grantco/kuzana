document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.nav-links');
    const body = document.body;

    function closeMenu() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        body.classList.remove('menu-open');
        body.style.overflow = ''; // Restore scrolling
    }

    function openMenu() {
        hamburger.classList.add('active');
        mobileMenu.classList.add('active');
        body.classList.add('menu-open');
        body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        if (mobileMenu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu when clicking on nav links
    const navLinks = mobileMenu.querySelectorAll('a');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });

    // Close menu when clicking outside (on overlay/background)
    document.addEventListener('click', function(event) {
        if (mobileMenu.classList.contains('active')) {
            if (!hamburger.contains(event.target) && !mobileMenu.contains(event.target)) {
                closeMenu();
            }
        }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // Allow signup/apply links to navigate normally; no popup interception
});

function closePopup() {
    const popup = document.getElementById('exitPopup');
    if (popup) {
        popup.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

function showPopup() {
    const popup = document.getElementById('exitPopup');
    if (popup) {
        popup.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        // Mark as shown so exit-intent won't fire again
        exitIntentShown = true;
    }
}

// Allow exit-intent (show once)
let exitIntentShown = false;

// Exit-intent: desktop only, fire once
document.addEventListener('mouseleave', function(e) {
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile && e.clientY <= 0 && !exitIntentShown) {
        showPopup();
    }
});

// Close popup on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closePopup();
    }
}); 

// Ensure clicking the top-left Kuzana logo goes to the normal homepage without redirect
// by appending ?no_redirect=1 to the root link. Applied site-wide.
document.addEventListener('DOMContentLoaded', function() {
    try {
        var logoAnchor = document.querySelector('.logo a');
        if (logoAnchor) logoAnchor.setAttribute('href', '/?no_redirect=1');
    } catch (e) {}
});