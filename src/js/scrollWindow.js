// scroll window

import $ from './jquery';

$('a[href^=#]').click(function() {
  var speed = 400;
  var href= $(this).attr("href");
  var target = $(href == "#" || href == "" ? 'html' : href);
  var position = target.offset().top;
  $('body,html').animate({scrollTop:position}, speed, 'swing');
  $('.hamburger').removeClass('hamburger--active');
  $('.hamburger-menu').stop().fadeOut(200);
  return false;
});
