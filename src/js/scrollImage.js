// scroll image

export default function scrollImage(){
  const scroll = window.pageYOffset;
  const width = window.innerWidth;
  const height = window.innerHeight;
  let ratio = scroll / height * 10000;
  const isSP = width <= 900;
  const isPC = width >= 1150;
  if(isPC){
    ratio /= 80;
  }
  else if(isSP){
    ratio /= 35;
  }
  else {
    ratio /= 55;
  }
  const header = document.querySelector('.header');
  header.style.backgroundPosition = 'center ' + ratio + '%';
}
