$(document).ready(function () {

  $(window).scroll(function () {
    if ($(document).scrollTop() > 170) {
      $('.topbar').addClass('fixed');
    } else {
      $('.topbar').removeClass('fixed');
    }
  }).scroll();

  $(".topbar-burger").on('click', function () {
    $(this).toggleClass("on");
    $('.menu-section').toggleClass("on");
  });

  $('a[href^="#"]').click(function (event) {
    var id_clicked_element = $(this).attr('href');
    var destination = $(id_clicked_element).offset().top;
    $('.topbar-burger').removeClass("on");
    $('.menu-section').removeClass("on");
    $('html, body').animate({ scrollTop: destination }, 500);
    return false;
  });

});