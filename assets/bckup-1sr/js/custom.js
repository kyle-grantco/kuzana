const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", function () {

  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");


  /* Body Scroll Stop */
  document.body.classList.toggle("menu-open");
});


    window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    
    if (window.scrollY > 100) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }
});