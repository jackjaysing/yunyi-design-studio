function escapeSiteText(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function mergeSiteSettings(settings) {
    const defaults = typeof DEFAULT_SITE_SETTINGS !== 'undefined'
        ? DEFAULT_SITE_SETTINGS
        : {};

    return { ...defaults, ...settings };
}

function applySiteSettings(settings) {
    const data = mergeSiteSettings(settings);

    document.querySelectorAll('[data-setting]').forEach((element) => {
        const key = element.dataset.setting;
        const value = data[key];
        if (value == null || value === '') {
            return;
        }

        if (key === 'serviceScope' && element.tagName === 'UL') {
            element.innerHTML = value
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean)
                .map((item) => `<li>${escapeSiteText(item)}</li>`)
                .join('');
            return;
        }

        element.textContent = value;
    });

    document.querySelectorAll('[data-setting-aria]').forEach((element) => {
        const key = element.dataset.settingAria;
        const name = data.siteName || '';
        const nameEn = data.siteNameEn || '';
        if (name || nameEn) {
            element.setAttribute('aria-label', `${name} ${nameEn}`.trim());
        }
    });

    if (data.siteNameEn) {
        document.querySelectorAll('[data-setting-en]').forEach((element) => {
            element.textContent = data.siteNameEn;
        });
    }
}

async function loadSiteSettings() {
    if (typeof isSupabaseConfigured !== 'function' || !isSupabaseConfigured()) {
        return mergeSiteSettings({});
    }

    try {
        return await fetchSiteSettings();
    } catch (error) {
        console.warn('載入工作室設定失敗，使用預設值。', error);
        return mergeSiteSettings({});
    }
}

async function initSiteLayout() {
    const pageId = document.body.dataset.page;
    const currentPage = pageId === 'work-detail' ? 'works' : pageId;
    const solidNav = document.body.dataset.solidNav === 'true';
    const settings = await loadSiteSettings();

    renderNav(currentPage, solidNav, settings);
    renderFooter(settings);
    applySiteSettings(settings);
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof renderNav !== 'function' || typeof renderFooter !== 'function') {
        return;
    }

    initSiteLayout();
});
