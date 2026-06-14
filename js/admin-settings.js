const settingsForm = document.getElementById('settings-form');
const settingsUpdatedAt = document.getElementById('settings-updated-at');

const FIELD_IDS = [
    'siteName',
    'siteNameEn',
    'tagline',
    'footerDesc',
    'serviceHours',
    'serviceArea',
    'phone',
    'email',
    'lineId',
    'contactIntro',
    'aboutIntro',
    'philosophy1',
    'philosophy2',
    'serviceScope',
    'statYears',
    'statProjects',
    'statCompliance',
    'heroImageLarge',
    'heroImageSmall1',
    'heroImageSmall2'
];

const HERO_IMAGE_FIELDS = [
    {
        urlId: 'heroImageLarge',
        fileId: 'heroImageLargeFile',
        previewId: 'heroImageLargePreview',
        label: '主圖'
    },
    {
        urlId: 'heroImageSmall1',
        fileId: 'heroImageSmall1File',
        previewId: 'heroImageSmall1Preview',
        label: '右上小圖'
    },
    {
        urlId: 'heroImageSmall2',
        fileId: 'heroImageSmall2File',
        previewId: 'heroImageSmall2Preview',
        label: '右下小圖'
    }
];

function updateHeroPreview({ urlId, previewId, label }, message = '目前圖片') {
    const urlInput = document.getElementById(urlId);
    const preview = document.getElementById(previewId);
    const url = urlInput?.value.trim() || '';

    if (!preview) {
        return;
    }

    if (!url) {
        preview.hidden = true;
        preview.innerHTML = '';
        return;
    }

    preview.hidden = false;
    preview.innerHTML = `
        <img src="${escapeHtml(url)}" alt="${escapeHtml(label)}">
        <span>${escapeHtml(message)}</span>
    `;
}

function fillSettingsForm(settings) {
    FIELD_IDS.forEach((fieldId) => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.value = settings[fieldId] ?? '';
        }
    });

    HERO_IMAGE_FIELDS.forEach((field) => {
        updateHeroPreview(field, '目前圖片');
    });

    if (settings.updatedAt && settingsUpdatedAt) {
        settingsUpdatedAt.hidden = false;
        settingsUpdatedAt.textContent = `上次更新：${formatDateTime(settings.updatedAt)}`;
    }
}

function readSettingsForm() {
    const payload = {};

    FIELD_IDS.forEach((fieldId) => {
        const input = document.getElementById(fieldId);
        payload[fieldId] = input ? input.value.trim() : '';
    });

    return payload;
}

function bindHeroImageUpload(field) {
    const fileInput = document.getElementById(field.fileId);
    if (!fileInput) {
        return;
    }

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) {
            return;
        }

        hideAdminMessage();
        updateHeroPreview(field, `${field.label}上傳中…`);
        fileInput.disabled = true;

        try {
            const url = await uploadWorkImage(file);
            document.getElementById(field.urlId).value = url;
            updateHeroPreview(field, '已上傳圖片');

            const updated = await updateSiteSettings(readSettingsForm());
            fillSettingsForm(updated);
            showAdminMessage(`${field.label}已儲存，請重新整理首頁查看`);
            fileInput.value = '';
        } catch (error) {
            updateHeroPreview(field);
            showAdminMessage(error.message, 'error');
        } finally {
            fileInput.disabled = false;
        }
    });
}

async function loadSettingsForm() {
    const settings = await fetchSiteSettings();
    fillSettingsForm(settings);
    return settings;
}

HERO_IMAGE_FIELDS.forEach(bindHeroImageUpload);

settingsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAdminMessage();

    try {
        const updated = await updateSiteSettings(readSettingsForm());
        fillSettingsForm(updated);
        showAdminMessage('設定已儲存，請重新整理首頁或聯絡頁查看更新');
    } catch (error) {
        showAdminMessage(error.message, 'error');
    }
});

initAdminAuth({
    currentPage: 'settings',
    onLoggedIn: loadSettingsForm
});
