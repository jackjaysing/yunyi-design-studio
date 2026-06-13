const IMAGE_MAX_DIMENSION = 2000;
const IMAGE_JPEG_QUALITY = 0.85;

async function compressImageFile(file) {
    if (!file?.type?.startsWith('image/')) {
        return file;
    }

    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    const maxDimension = IMAGE_MAX_DIMENSION;

    if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
        } else {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
        }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, width, height);

    if (typeof bitmap.close === 'function') {
        bitmap.close();
    }

    const usePng = file.type === 'image/png';
    const outputType = usePng ? 'image/png' : 'image/jpeg';
    const quality = usePng ? undefined : IMAGE_JPEG_QUALITY;
    const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
            if (result) {
                resolve(result);
                return;
            }

            reject(new Error('圖片壓縮失敗'));
        }, outputType, quality);
    });

    const extension = usePng ? 'png' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';

    return new File([blob], `${baseName}.${extension}`, {
        type: outputType,
        lastModified: Date.now()
    });
}
