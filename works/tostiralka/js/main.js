$(function() {
  'use strict';

  // Swipe menu
  var swipeMenu = new Slideout({
    'panel': document.getElementById('panel'),
    'menu': document.getElementById('menu'),
    'padding': 256,
    'tolerance': 70
  });

  $('.swipe-btn').click(function() {
    swipeMenu.toggle();
  });


  // Phone mask
  $('input[type="tel"]').mask('+7 (999) 999-99-99');


  // FAQ
  $('.faq__item').each(function() {
    var title = $('.faq__title', this),
        content = $('.faq__content', this);

    title.click(function() {
      title.toggleClass('faq__title_active');
      content.slideToggle();
    });
  });


  // Contacts
  $('.contacts__link').click(function(e) {
    e.preventDefault;

    var id = $(this).attr('href');

    $('.contacts__link').removeClass('contacts__link_active');
    $(this).addClass('contacts__link_active');
    
    $('.contacts__tab').hide();
    $(id).show();
  });

});