document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.nav-links');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!hamburger.contains(event.target) && !mobileMenu.contains(event.target)) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
    });
});

function closePopup() {
    document.getElementById('exitPopup').style.display = 'none';
}

function showPopup() {
    document.getElementById('exitPopup').style.display = 'block';
}

let exitIntentShown = false;

document.addEventListener('mouseleave', function(e) {
    if (e.clientY < 0 && !exitIntentShown) {
        showPopup();
        exitIntentShown = true;
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