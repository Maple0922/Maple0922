import Vue from 'vue/dist/vue.esm.js';

export const app = new Vue({
  el: '#app',
  data: {
    menus: [
      {
        enName: 'Profile',
        jaName: 'プロフィール'
      },
      {
        enName: 'Skills',
        jaName: 'スキル'
      },
      {
        enName: 'Portfolio',
        jaName: '制作実績'
      },
      {
        enName: 'Contact',
        jaName: 'お問い合わせはこちらから'
      }
    ],
    skills: [
      {
        category: '言語',
        items: [
          {
            name: 'HTML5',
            star: 4,
            ex: true
          },
          {
            name: 'CSS3',
            star: 4,
            ex: true
          },
          {
            name: 'JavaScript',
            star: 4,
            ex: true
          },
          {
            name: 'PHP',
            star: 4,
            ex: true
          }
        ]
      },
      {
        category: 'フレームワーク',
        items: [
          {
            name: 'Sass(SCSS)',
            star: 3,
            ex: false
          },
          {
            name: 'Vue.js',
            star: 3,
            ex: false
          },
          {
            name: 'jQuery',
            star: 3,
            ex: false
          },
          {
            name: 'Angular',
            star: 3,
            ex: false
          },
          {
            name: 'Laravel',
            star: 3,
            ex: false
          },
        ]
      },
      {
        category: 'ツール',
        items: [
          {
            name: 'Git(Github)',
            star: 3,
            ex: false
          },
          {
            name: 'Gulp',
            star: 3,
            ex: false
          },
          {
            name: 'Webpack',
            star: 3,
            ex: false
          },
          {
            name: 'Wordpress',
            star: 3,
            ex: false
          },
          {
            name: 'MySQL',
            star: 3,
            ex: false
          },
          {
            name: 'SQLite',
            star: 3,
            ex: false
          }
        ]
      },
      {
        category: 'その他',
        items: [
          {
            name: 'Atom',
            star: 3,
            ex: false
          },
          {
            name: 'Figma',
            star: 3,
            ex: false
          },
          {
            name: 'Slack',
            star: 3,
            ex: false
          },
          {
            name: 'Chatwork',
            star: 3,
            ex: false
          },
          {
            name: 'Asana',
            star: 3,
            ex: false
          },
          {
            name: 'Trello',
            star: 3,
            ex: false
          },
          {
            name: 'XSERVER',
            star: 3,
            ex: false
          }
        ]
      }
    ],
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
