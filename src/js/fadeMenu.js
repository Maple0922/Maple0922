// fade menu

import $ from './jquery';

$('.hamburger').click(function(){
  $(this).toggleClass('hamburger--active');
  let isActive = $(this).hasClass('hamburger--active');
  if(isActive){
    $('.hamburger-menu').stop().fadeIn(200);
  }else{
    $('.hamburger-menu').stop().fadeOut(200);
  }
});
