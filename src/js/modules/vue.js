import Vue from 'vue/dist/vue.esm.js';

export const app = new Vue({
  el: '.pages',
  data: {
    items: [
      {
        name: 'Gamble Calculator',
        url: 'gamble-calculator'
      },
      {
        name: 'Image PDF Converter',
        url: 'image-pdf-converter'
      },
      {
        name: 'Vue Gamble Calculator',
        url: 'vue-gamble-calculator'
      },
      {
        name: 'JS Animation',
        url: 'js-animation'
      },
      {
        name: 'Time Table Maker',
        url: 'time-table-maker'
      },
      {
        name: 'Gamble Payment',
        url: 'http://maple0922.php.xdomain.jp'
      }
    ]
  }
});
