// Mobile Menu
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
        document.body.classList.toggle("menu-open");
    });
}

// Faq code
 const plusIcon = "../assets/images/icon-plus.png";
        const minusIcon = "../assets/images/icon-minus.png";

        document.querySelectorAll(".faq-question").forEach((question) => {

            question.addEventListener("click", () => {

                const item = question.parentElement;
                const answer = item.querySelector(".faq-answer");
                const img = item.querySelector(".faq-icon img");

                const isActive = item.classList.contains("active");

                document.querySelectorAll(".faq-item").forEach((faq) => {

                    faq.classList.remove("active");

                    faq.querySelector(".faq-answer").style.maxHeight = null;

                    faq.querySelector(".faq-icon img").src = plusIcon;

                });

                if (!isActive) {

                    item.classList.add("active");

                    answer.style.maxHeight = answer.scrollHeight + "px";

                    img.src = minusIcon;

                }

            });

        });


        window.addEventListener("load", () => {

            const active = document.querySelector(".faq-item.active");

            if (active) {

                active.querySelector(".faq-answer").style.maxHeight =
                    active.querySelector(".faq-answer").scrollHeight + "px";

            }

        });




// Video Player
const videoWrapper = document.querySelector(".video-wrapper");

if (videoWrapper) {
    videoWrapper.addEventListener("click", function () {

        const videoId = this.getAttribute("data-video-id");
        const iframeContainer = this.querySelector(".iframe-container");

        if (!this.classList.contains("video-active")) {

            iframeContainer.innerHTML =
                '<iframe src="https://www.youtube.com/embed/' +
                videoId +
                '?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';

            this.classList.add("video-active");
        }
    });
}


// Sticky Header
window.addEventListener("scroll", function () {

    const header = document.querySelector(".header");

    if (!header) return;

    if (window.scrollY > 80) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
});

<!-- header js -->
 const dropdowns = document.querySelectorAll(".dropdown");

dropdowns.forEach(dropdown => {

    const toggle = dropdown.querySelector(".dropdown-toggle");

    toggle.addEventListener("click", function(e){

        if(window.innerWidth <= 991){

            e.preventDefault();

            dropdown.classList.toggle("active");

        }

    });

});

// Slick Slider
document.addEventListener("DOMContentLoaded", function () {
    const founderSlider = document.querySelector(".founder_slider");

    if (founderSlider) {
        jQuery(founderSlider).slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            infinite: false,
            arrows: true,
            dots: false,
            adaptiveHeight: false,

            prevArrow: document.querySelector(".founder-prev"),
            nextArrow: document.querySelector(".founder-next"),

            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 3
                    }
                },
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }
});

document.addEventListener('click', function (event) {

    const button = event.target.closest('.youtube-play');

    if (!button) {
        return;
    }

    const container = button.closest('.youtube-lazy');
    const videoId = container.dataset.videoId;

    const iframe = document.createElement('iframe');

    iframe.src =
        'https://www.youtube.com/embed/' +
        encodeURIComponent(videoId) +
        '?autoplay=1&rel=0';

    iframe.title = 'YouTube video player';

    iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;

    container.innerHTML = '';
    container.appendChild(iframe);
});

