const WATERMARK_LOGO_URL = 'assets/watermark-logo.jpg';
const WATERMARK_OPACITY = 0.4;
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

function buildWatermarkCanvas(logo, width, height) {
    const logoCanvas = document.createElement('canvas');
    logoCanvas.width = Math.round(width);
    logoCanvas.height = Math.round(height);

    const logoContext = logoCanvas.getContext('2d');
    setupHighQualityContext(logoContext);
    logoContext.drawImage(logo, 0, 0, logoCanvas.width, logoCanvas.height);

    const imageData = logoContext.getImageData(0, 0, logoCanvas.width, logoCanvas.height);
    const pixels = imageData.data;

    for (let index = 0; index < pixels.length; index += 4) {
        const luminance = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
        pixels[index] = 255;
        pixels[index + 1] = 255;
        pixels[index + 2] = 255;
        pixels[index + 3] = Math.round((luminance / 255) * WATERMARK_OPACITY * 255);
    }

    logoContext.putImageData(imageData, 0, 0);
    return logoCanvas;
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
    const logoCanvas = buildWatermarkCanvas(logo, logoWidth, logoHeight);
    const paddingX = canvas.width * WATERMARK_PADDING;
    const paddingY = canvas.height * WATERMARK_PADDING;
    const x = canvas.width - logoWidth - paddingX;
    const y = canvas.height - logoHeight - paddingY;

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
