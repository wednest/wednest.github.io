$(document).ready(function () {

  $('.owl-carousel').owlCarousel({
    items: 1,
    dots: false,
    navText: ['', ''],
    loop: true,
    nav: true
  });

  $(document).ready(function () {
    $('.image-link').magnificPopup({ type: 'image' });
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
  var CartPlusMinus = $('.quantity');
  CartPlusMinus.prepend('<div class="dec">-</div>');
  CartPlusMinus.append('<div class="inc">+</div>');
  $(".dec, .inc").on("click", function () {
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

  // Выделение ёмкости
  $('#five, #fifteen, #thirty').click(function () {
    $(this).toggleClass('active');
  });
  // Выделение ёмкости Конец

  // Маска для ввода телефона
  $("#phone").inputmask({ "mask": "(999) 999-9999" });
  // Маска для ввода телефона Конец

  // Стилизация выпадающих списков
  $('select').each(function () {
    var $this = $(this), numberOfOptions = $(this).children('option').length;

    $this.addClass('select-hidden');
    $this.wrap('<div class="select"></div>');
    $this.after('<div class="select-styled"></div>');

    var $styledSelect = $this.next('div.select-styled');
    $styledSelect.text($this.children('option').eq(0).text());

    var $list = $('<ul />', {
      'class': 'select-options'
    }).insertAfter($styledSelect);

    for (var i = 0; i < numberOfOptions; i++) {
      $('<li />', {
        text: $this.children('option').eq(i).text(),
        rel: $this.children('option').eq(i).val()
      }).appendTo($list);
    }

    var $listItems = $list.children('li');

    $styledSelect.click(function (e) {
      e.stopPropagation();
      $('div.select-styled.active').not(this).each(function () {
        $(this).removeClass('active').next('ul.select-options').hide();
      });
      $(this).toggleClass('active').next('ul.select-options').toggle();
    });

    $listItems.click(function (e) {
      e.stopPropagation();
      $styledSelect.text($(this).text()).removeClass('active');
      $this.val($(this).attr('rel'));
      $list.hide();
      //console.log($this.val());
    });

    $(document).click(function () {
      $styledSelect.removeClass('active');
      $list.hide();
    });

  });
  // Стилизация выпадающих списков Конец

  

});