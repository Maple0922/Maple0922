// insert svg

// export default function insertSvg(parentClassName,svg,isFirstChild){
//   const parent = document.querySelector('.' + parentClassName);
//   console.log(svg);
//   switch (isFirstChild) {
//     case true:
//     parent.innerHTML = svg + parent.innerHTML;
//     break;
//     case false:
//     parent.innerHTML += svg;
//     break;
//     default:
//     console.error('function insertImage()の第3引数はboolです');
//   }
// }

// insert image

export default function insertSvg(className,url){
  const img = document.querySelector('.' + className);
  img.src = url;
}
