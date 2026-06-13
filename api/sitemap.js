const SITE_URL = 'https://yunyi-design-studio.vercel.app';

const PATHS = [
    '/',
    '/about.html',
    '/works.html',
    '/process.html',
    '/contact.html'
];

module.exports = (req, res) => {
    const lastmod = new Date().toISOString().slice(0, 10);
    const urls = PATHS.map((path) => [
        '  <url>',
        `    <loc>${SITE_URL}${path}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        '  </url>'
    ].join('\n')).join('\n');

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        urls,
        '</urlset>'
    ].join('\n');

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
    res.status(200).send(xml);
};
