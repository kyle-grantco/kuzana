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


// Slick Slider
$(function () {

    if ($(".founder_slider").length) {

        $(".founder_slider").slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            infinite: false,
            arrows: true,
            dots: false,
            adaptiveHeight: false,

            prevArrow: $(".founder-prev"),
            nextArrow: $(".founder-next"),

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