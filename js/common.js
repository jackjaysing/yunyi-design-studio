const NAV_ITEMS = [
    { href: 'index.html', label: '首頁', id: 'home' },
    { href: 'about.html', label: '關於我們', id: 'about' },
    { href: 'works.html', label: '設計作品', id: 'works' },
    { href: 'process.html', label: '服務流程', id: 'process' },
    { href: 'contact.html', label: '聯絡預約', id: 'contact' }
];

function escapeSiteHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getLayoutSettings(settings) {
    if (settings) {
        return settings;
    }

    if (typeof DEFAULT_SITE_SETTINGS !== 'undefined') {
        return DEFAULT_SITE_SETTINGS;
    }

    return {
        siteName: '允藝設計工作室',
        siteNameEn: 'Yun Yi Design Studio',
        footerDesc: '引領空間美學與法規安全的完美平衡'
    };
}

function renderNav(currentPage, solid = false, settings = null) {
    const placeholder = document.querySelector('[data-site-nav]');
    if (!placeholder) return;

    const layout = getLayoutSettings(settings);
    const navClass = solid ? 'navbar navbar--solid' : 'navbar';
    const links = NAV_ITEMS.map((item) => {
        const activeClass = item.id === currentPage ? ' class="active"' : '';
        return `<li><a href="${item.href}"${activeClass}>${item.label}</a></li>`;
    }).join('');

    placeholder.innerHTML = `
        <nav class="${navClass}">
            <a href="index.html" class="logo" data-setting-aria="logo" aria-label="${escapeSiteHtml(layout.siteName)} ${escapeSiteHtml(layout.siteNameEn)}">
                <img src="assets/logo.png" alt="">
                <span class="logo-text">${escapeSiteHtml(layout.siteName)}</span>
            </a>
            <button class="nav-toggle" type="button" aria-label="開啟選單" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="nav-links">
                ${links}
            </ul>
        </nav>
    `;

    initMobileNav();
}

function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!navToggle || !navLinks) return;

    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

function renderFooter(settings = null) {
    const placeholder = document.querySelector('[data-site-footer]');
    if (!placeholder) return;

    const layout = getLayoutSettings(settings);

    placeholder.innerHTML = `
        <footer class="site-footer">
            <div class="container footer-inner">
                <div>
                    <p class="footer-brand">${escapeSiteHtml(layout.siteName)}</p>
                    <p class="footer-desc">${escapeSiteHtml(layout.footerDesc)}</p>
                </div>
                <div class="footer-links">
                    <a href="about.html">關於我們</a>
                    <a href="works.html">設計作品</a>
                    <a href="process.html">服務流程</a>
                    <a href="contact.html">聯絡預約</a>
                </div>
                <p class="footer-copy">© ${new Date().getFullYear()} <span data-setting-en="siteNameEn">${escapeSiteHtml(layout.siteNameEn)}</span>. All rights reserved.</p>
            </div>
        </footer>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof initSiteLayout === 'function') {
        return;
    }

    const pageId = document.body.dataset.page;
    const currentPage = pageId === 'work-detail' ? 'works' : pageId;
    const solidNav = document.body.dataset.solidNav === 'true';
    renderNav(currentPage, solidNav);
    renderFooter();
});
