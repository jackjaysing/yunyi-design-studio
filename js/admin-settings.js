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
    'statCompliance'
];

function fillSettingsForm(settings) {
    FIELD_IDS.forEach((fieldId) => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.value = settings[fieldId] ?? '';
        }
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

async function loadSettingsForm() {
    const settings = await fetchSiteSettings();
    fillSettingsForm(settings);
    return settings;
}

settingsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAdminMessage();

    try {
        const updated = await updateSiteSettings(readSettingsForm());
        fillSettingsForm(updated);
        showAdminMessage('工作室設定已儲存');
    } catch (error) {
        showAdminMessage(error.message, 'error');
    }
});

initAdminAuth({
    currentPage: 'settings',
    onLoggedIn: loadSettingsForm
});
