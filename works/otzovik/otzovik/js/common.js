$(document).ready(function () {

    $('.topbar__burger').click(function() {
        $('.mobile-menu').stop().slideToggle();
    });

    $('.topbar').after('<div class="mobile-menu">');
    $('.topbar .main-nav').children().clone().appendTo('.mobile-menu');
});