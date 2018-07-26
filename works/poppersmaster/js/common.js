$(document).ready(function () {

  $('.owl-carousel').owlCarousel({
    items: 1,
    dots: false,
    navText: ['', ''],
    loop: true,
    nav: true
  });

  // Добавление тени меню
  $(window).scroll(function () {
    if ($(document).scrollTop() > 84) {
      $('.topbar').addClass('active');
    } else {
      $('.topbar').removeClass('active');
    }
  }).scroll();
  // Добавление тени меню конец

  // Поворот изображения в слайдере
  $(window).scroll(function () {
    var st = $(this).scrollTop();
    $('.item-img').css({
      "transform": "rotate(-" + st / 16 + "deg)"
    })
  })
  // Поворот изображения в слайдере конец

  // Скроллы
  var offset = -50;
  $("a[href='#goods']").click(function () {
    $('html, body').animate({
      scrollTop: $("#goods").offset().top + offset
    }, 500)
  });

  $("a[href='#discounts']").click(function () {
    $('html, body').animate({
      scrollTop: $("#discounts").offset().top + offset
    }, 500)
  });

  $("a[href='#delivery']").click(function () {
    $('html, body').animate({
      scrollTop: $("#delivery").offset().top + offset
    }, 500)
  });

  $("a[href='#contacts']").click(function () {
    $('html, body').animate({
      scrollTop: $("#contacts").offset().top + offset
    }, 500)
  });

  $("a[href='#top']").click(function () {
    $('html, body').animate({
      scrollTop: $("html, body").offset().top
    }, 500)
  });
  // Скроллы конец

  // Увеличение уменьшение кол-ва товаров
  var CartPlusMinus = $('.cart-plus-minus-box');
  CartPlusMinus.prepend('<div class="dec qtybutton">-</div>');
  CartPlusMinus.append('<div class="inc qtybutton">+</div>');
  $(".qtybutton").on("click", function () {
    var $button = $(this);
    var oldValue = $button.parent().find("input").val();
    if ($button.text() === "+") {
      var newVal = parseFloat(oldValue) + 1;
    } else {
      if (oldValue > 1) {
        var newVal = parseFloat(oldValue) - 1;
      } else {
        newVal = 1;
      }
    }
    $button.parent().find("input").val(newVal);
  });

  $('.topbar-cart, .cart-section-header').click(function () {
    $('.cart-section').toggleClass('on');
  });
  // Увеличение уменьшение кол-ва товаров конец

});