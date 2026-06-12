const NAV_ITEMS = [
    { href: 'index.html', label: '首頁', id: 'home' },
    { href: 'about.html', label: '關於我們', id: 'about' },
    { href: 'works.html', label: '設計作品', id: 'works' },
    { href: 'process.html', label: '服務流程', id: 'process' },
    { href: 'contact.html', label: '聯絡預約', id: 'contact' }
];

function renderNav(currentPage, solid = false) {
    const placeholder = document.querySelector('[data-site-nav]');
    if (!placeholder) return;

    const navClass = solid ? 'navbar navbar--solid' : 'navbar';
    const links = NAV_ITEMS.map((item) => {
        const activeClass = item.id === currentPage ? ' class="active"' : '';
        return `<li><a href="${item.href}"${activeClass}>${item.label}</a></li>`;
    }).join('');

    placeholder.innerHTML = `
        <nav class="${navClass}">
            <a href="index.html" class="logo" aria-label="允藝設計工作室 Yun Yi Design Studio">
                <img src="assets/logo.png" alt="">
                <span class="logo-text">允藝設計工作室</span>
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

function renderFooter() {
    const placeholder = document.querySelector('[data-site-footer]');
    if (!placeholder) return;

    placeholder.innerHTML = `
        <footer class="site-footer">
            <div class="container footer-inner">
                <div>
                    <p class="footer-brand">允藝設計工作室</p>
                    <p class="footer-desc">引領空間美學與法規安全的完美平衡</p>
                </div>
                <div class="footer-links">
                    <a href="about.html">關於我們</a>
                    <a href="works.html">設計作品</a>
                    <a href="process.html">服務流程</a>
                    <a href="contact.html">聯絡預約</a>
                </div>
                <p class="footer-copy">© ${new Date().getFullYear()} Yun Yi Design Studio. All rights reserved.</p>
            </div>
        </footer>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.dataset.page;
    const solidNav = document.body.dataset.solidNav === 'true';
    renderNav(currentPage, solidNav);
    renderFooter();
});
