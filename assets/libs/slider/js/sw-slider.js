jQuery(document).ready(function ($) {
  $(".testimonial_rotator_wrap").slick({
    infinite: true,
    slidesToShow: 2.2,
    slide: ".testimonial_rotator_wrap .slide",
    focusOnSelect: true,
    initialSlide: 0,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          initialSlide: 0,
          slidesToShow: 2.2,
        },
      },
      {
        breakpoint: 720,
        settings: {
          initialSlide: 0,
          slidesToShow: 1.3,
        },
      },
    ],
  });
});
