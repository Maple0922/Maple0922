// insert image

export default function insertImage(className,url){
  const img = document.querySelector('.' + className);
  img.src = url;
}
