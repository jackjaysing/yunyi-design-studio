const WATERMARK_LOGO_URL = 'assets/watermark-logo.png';
const WATERMARK_OPACITY = 0.45;
const WATERMARK_SCALE = 0.24;
const WATERMARK_PADDING = 0.03;

let logoImagePromise = null;

function setupHighQualityContext(context) {
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
}

function loadWatermarkLogo() {
    if (!logoImagePromise) {
        logoImagePromise = new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('浮水印 Logo 載入失敗'));
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

function getWatermarkSize(canvas, logo) {
    const desiredWidth = canvas.width * WATERMARK_SCALE;
    const logoWidth = Math.min(desiredWidth, logo.width);
    const logoHeight = (logo.height / logo.width) * logoWidth;

    return {
        width: logoWidth,
        height: logoHeight
    };
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
    setupHighQualityContext(context);
    context.drawImage(bitmap, 0, 0);

    if (typeof bitmap.close === 'function') {
        bitmap.close();
    }

    const { width: logoWidth, height: logoHeight } = getWatermarkSize(canvas, logo);
    const paddingX = canvas.width * WATERMARK_PADDING;
    const paddingY = canvas.height * WATERMARK_PADDING;
    const x = canvas.width - logoWidth - paddingX;
    const y = canvas.height - logoHeight - paddingY;

    context.globalAlpha = WATERMARK_OPACITY;
    context.drawImage(logo, x, y, logoWidth, logoHeight);
    context.globalAlpha = 1;

    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const quality = outputType === 'image/jpeg' ? 0.95 : undefined;
    const blob = await canvasToBlob(canvas, outputType, quality);
    const extension = outputType === 'image/png' ? 'png' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';

    return new File([blob], `${baseName}.${extension}`, {
        type: outputType,
        lastModified: Date.now()
    });
}
