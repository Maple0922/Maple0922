import './sass/style.scss';
import app from './js/vue';
import insertImage from './js/insertImage';
import scrollImage from './js/scrollImage';
import fadeMenu from './js/fadeMenu';
import scrollWindow from './js/scrollWindow';

import headerImage from './images/header.jpg';
import profileImage from './images/profile.jpg';

window.addEventListener("scroll", scrollImage, false);

insertImage('profile__image',profileImage);
