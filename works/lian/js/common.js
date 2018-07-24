$(document).ready(function () {

  $(window).scroll(function () {
    if ($(document).scrollTop() > 101) {
      $('.topbar').addClass('fixed');
    } else {
      $('.topbar').removeClass('fixed');
    }
  }).scroll();

  $('.owl-carousel').owlCarousel({
    items: 1,
    loop: true,
    nav: true,
    autoplayHoverPause: true,
    navText: ['','']
  });

  $('.grid').masonry();

});