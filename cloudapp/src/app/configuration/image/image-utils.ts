export interface resizeResult {
  data: string;
  width: number;
  height: number;
}

export function resizeImage(file: File | string, maxSize: number) {
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
    return { data: canvas.toDataURL('image/png'), width: width, height: height };
  };

  return new Promise((resolve: (result: resizeResult) => void, reject) => {
    image.onload = () => resolve(resize());
    if (typeof file == 'string') {
      image.src = file;
      return;
    }
    if (!file.type.match(/image.*/)) {
      reject(new Error("Not an image"));
      return;
    }
    reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
      image.src = readerEvent.target.result.toString();
    };
    reader.onerror = ( readerEvent: ProgressEvent<FileReader>) => {
      return reject(new Error(readerEvent.target.error.message));
    }
    reader.readAsDataURL(file);
  })    
};