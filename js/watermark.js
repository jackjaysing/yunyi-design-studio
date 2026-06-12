const WATERMARK_LOGO_URL = 'assets/logo.png';
const WATERMARK_OPACITY = 0.45;
const WATERMARK_SCALE = 0.24;

let logoImagePromise = null;

function loadWatermarkLogo() {
    if (!logoImagePromise) {
        logoImagePromise = new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Logo 載入失敗，無法加入浮水印'));
            image.src = WATERMARK_LOGO_URL;
        });
    }

    return logoImagePromise;
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
                return;
            }

            reject(new Error('浮水印處理失敗'));
        }, type, quality);
    });
}

async function applyLogoWatermark(file) {
    if (!file?.type?.startsWith('image/')) {
        return file;
    }

    const [logo, bitmap] = await Promise.all([
        loadWatermarkLogo(),
        createImageBitmap(file)
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const context = canvas.getContext('2d');
    context.drawImage(bitmap, 0, 0);

    if (typeof bitmap.close === 'function') {
        bitmap.close();
    }

    const logoWidth = canvas.width * WATERMARK_SCALE;
    const logoHeight = (logo.height / logo.width) * logoWidth;
    const logoCanvas = document.createElement('canvas');
    logoCanvas.width = Math.round(logoWidth);
    logoCanvas.height = Math.round(logoHeight);

    const logoContext = logoCanvas.getContext('2d');
    logoContext.drawImage(logo, 0, 0, logoCanvas.width, logoCanvas.height);
    logoContext.globalCompositeOperation = 'source-in';
    logoContext.fillStyle = `rgba(255, 255, 255, ${WATERMARK_OPACITY})`;
    logoContext.fillRect(0, 0, logoCanvas.width, logoCanvas.height);

    const x = (canvas.width - logoCanvas.width) / 2;
    const y = (canvas.height - logoCanvas.height) / 2;
    context.drawImage(logoCanvas, x, y);

    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const quality = outputType === 'image/jpeg' ? 0.92 : undefined;
    const blob = await canvasToBlob(canvas, outputType, quality);
    const extension = outputType === 'image/png' ? 'png' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';

    return new File([blob], `${baseName}.${extension}`, {
        type: outputType,
        lastModified: Date.now()
    });
}
