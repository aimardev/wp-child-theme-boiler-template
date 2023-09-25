jQuery(".header .menu-item-has-children").on("click", function (e) {
  if (e.target == this) {
    jQuery(this).toggleClass("active");
  }
});
jQuery("#hamburger-menu").on("click", function (e) {
  jQuery("#header-mobile__menu").toggleClass("open");
});
