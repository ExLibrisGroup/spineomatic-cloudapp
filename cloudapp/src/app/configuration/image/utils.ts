export function resizeImage(file: File, maxSize: number) {
  const reader = new FileReader();
  const image = new Image();
  const canvas = document.createElement('canvas');
  const resize = () => {
    let width = image.width;
    let height = image.height;

    if (width > height) {
      if (width > maxSize) {
        height *= maxSize / width;
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width *= maxSize / height;
        height = maxSize;
      }
    }
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/png');
  };

  return new Promise((resolve: (result: string) => void, reject) => {
    if (!file.type.match(/image.*/)) {
      reject(new Error("Not an image"));
      return;
    }
    reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
      image.onload = () => resolve(resize());
      image.src = readerEvent.target.result.toString();
    };
    reader.readAsDataURL(file);
  })    
};