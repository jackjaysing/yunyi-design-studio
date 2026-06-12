function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function parseGalleryInput(value) {
    return String(value || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
}
