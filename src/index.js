import './sass/style.scss';
import app from './js/vue';
import insertImage from './js/insertImage';
import insertSvg from './js/insertSvg';
import scrollImage from './js/scrollImage';
import fadeMenu from './js/fadeMenu';
import scrollWindow from './js/scrollWindow';

import headerImage from './images/header.jpg';
import profileImage from './images/profile.jpg';
import userSvg from './images/user.svg';
import pinSvg from './images/pin.svg';
import univSvg from './images/univ.svg';
import commentSvg from './images/comment.svg';
import twitterSvg from './images/twitter.svg';
import githubSvg from './images/github.svg';



window.addEventListener("scroll", scrollImage, false);

insertImage('profile__image',profileImage);

insertSvg('user', userSvg);
insertSvg('pin', pinSvg);
insertSvg('univ', univSvg);
insertSvg('comment', commentSvg);
insertSvg('github', githubSvg);
insertSvg('twitter', twitterSvg);
