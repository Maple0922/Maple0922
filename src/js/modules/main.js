// main

import $ from './jquery';

export default function main(){
  $('h1').click(function(){
    $(this).fadeOut();
  });
}
