const SITE_URL = 'https://yunyi-design-studio.vercel.app';
const SITE_NAME = '允藝設計工作室';

const SEO_PAGES = {
    home: {
        title: '允藝設計工作室 | YUN YI DESIGN',
        description: '允藝設計工作室提供室內設計、公設設計、景觀設計與室裝跑照服務，引領空間美學與法規安全的完美平衡。',
        path: '/'
    },
    about: {
        title: '關於我們 | 允藝設計工作室',
        description: '了解允藝設計工作室的設計理念、團隊背景與服務項目，為您打造兼具美感與機能的空間。',
        path: '/about.html'
    },
    works: {
        title: '設計作品 | 允藝設計工作室',
        description: '瀏覽允藝設計工作室的室內設計、公設設計、景觀設計與彩色配置圖作品案例。',
        path: '/works.html'
    },
    process: {
        title: '服務流程 | 允藝設計工作室',
        description: '從初步諮詢、設計規劃到施工協力的完整服務流程，了解允藝設計工作室如何完成每個專案。',
        path: '/process.html'
    },
    contact: {
        title: '聯絡預約 | 允藝設計工作室',
        description: '線上預約室內設計、公設設計、景觀設計或室裝跑照諮詢，允藝設計工作室將盡快與您聯繫。',
        path: '/contact.html'
    }
};

function upsertMeta(name, content, attribute = 'name') {
    if (!content) return;

    let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
    }

    element.setAttribute('content', content);
}

function upsertLink(rel, href) {
    if (!href) return;

    let element = document.head.querySelector(`link[rel="${rel}"]`);
    if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
    }

    element.setAttribute('href', href);
}

function applySeoMeta({ title, description, path, noindex = false }) {
    if (title) {
        document.title = title;
    }

    upsertMeta('description', description);
    upsertMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertLink('canonical', `${SITE_URL}${path}`);

    upsertMeta('og:type', 'website', 'property');
    upsertMeta('og:site_name', SITE_NAME, 'property');
    upsertMeta('og:title', title, 'property');
    upsertMeta('og:description', description, 'property');
    upsertMeta('og:url', `${SITE_URL}${path}`, 'property');
    upsertMeta('og:locale', 'zh_TW', 'property');
    upsertMeta('og:image', `${SITE_URL}/assets/logo.png`, 'property');
}

function initPublicSeo() {
    const page = document.body.dataset.page;
    const config = SEO_PAGES[page];

    if (!config) {
        return;
    }

    applySeoMeta(config);
}

function applyWorkDetailSeo(work) {
    const title = `${work.title} | 允藝設計工作室`;
    const description = `${work.category}${work.location ? ` · ${work.location}` : ''} — ${work.description || '允藝設計工作室作品案例'}`;
    const path = `/work-detail.html?id=${encodeURIComponent(work.id)}`;

    applySeoMeta({
        title,
        description: description.slice(0, 160),
        path
    });
}

initPublicSeo();
