$(document).ready(function () {

    $(window).scroll(function () {
        if ($(document).scrollTop() > 160) {
            $('.topbar').addClass('fixed');
        } else {
            $('.topbar').removeClass('fixed');
        }
    }).scroll();

    $(".owl-carousel").owlCarousel({
        items: 1,
        loop: true,
        autoplay: true,
        margin: 50,
        dotsContainer: '.reviews-carousel-dots',
        responsive : {
            992 : {
                items : 2
            }
        }
    });

    $('.topbar').after('<div class="mobile-menu d-xl-none">');
    $('#mobile-menu-parent').clone().appendTo('.mobile-menu');

    $('.topbar__mobile-menu-burger').click(function() {
        $(this).toggleClass('active');
        $('.mobile-menu').slideToggle();
    });

    $(".second-section-tab__item").not(":first").hide();
    $(".second-section-tabs-wrapper .tab").click(function() {
        $(".second-section-tabs-wrapper .tab").removeClass("active").eq($(this).index()).addClass("active");
        $(".second-section-tab__item").hide().eq($(this).index()).fadeIn()
    }).eq(0).addClass("active");

    $(".publications-tab_item").not(":first").hide();
    $(".publications-tabs-wrapper .tab").click(function() {
        $(".publications-tabs-wrapper .tab").removeClass("active").eq($(this).index()).addClass("active");
        $(".publications-tab_item").hide().eq($(this).index()).fadeIn()
    }).eq(0).addClass("active");

    $(".answers-tab_item").not(":first").hide();
    $(".answers-tabs-wrapper .tab").click(function() {
        $(".answers-tabs-wrapper .tab").removeClass("active").eq($(this).index()).addClass("active");
        $(".answers-tab_item").hide().eq($(this).index()).fadeIn()
    }).eq(0).addClass("active");

    $('.feedback-form-popup-btn').magnificPopup({
        type:'inline'
    });

});