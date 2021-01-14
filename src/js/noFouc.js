// no fouc

import $ from './jquery';

document.documentElement.className = 'no-fouc';
$(document).ready(function () {
    $('.no-fouc').removeClass('no-fouc');
})
