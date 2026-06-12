-- 更新作品封面與詳情圖（使用網站 assets 靜態路徑）
-- 於 Supabase SQL Editor 執行

UPDATE works
SET
  image_url = '/assets/works/jingmi-cover.png',
  gallery_urls = ARRAY[
    '/assets/works/jingmi-gallery-1.png',
    '/assets/works/jingmi-gallery-2.png'
  ]
WHERE title = '靜謐都會宅';

UPDATE works
SET
  image_url = '/assets/works/guangzhi-cover.png',
  gallery_urls = ARRAY[
    '/assets/works/guangzhi-gallery-1.png',
    '/assets/works/guangzhi-gallery-2.png'
  ]
WHERE title = '光之廊道';

UPDATE works
SET
  image_url = '/assets/works/tingyuan-cover.png',
  gallery_urls = ARRAY[
    '/assets/works/tingyuan-gallery-1.png',
    '/assets/works/tingyuan-gallery-2.png'
  ]
WHERE title = '庭園序曲';

INSERT INTO works (title, category, description, image_url, gallery_urls, year, area, location, featured)
SELECT
  '晨光提案',
  '彩色配置圖',
  '以暖色與木質為主軸的住宅配色方案，呈現空間氛圍與材質層次，協助業主在施工前確認整體色調。',
  '/assets/works/caise-cover.png',
  ARRAY[
    '/assets/works/caise-gallery-1.png',
    '/assets/works/caise-gallery-2.png'
  ],
  '2025',
  '30 坪',
  '台北市',
  false
WHERE NOT EXISTS (SELECT 1 FROM works WHERE title = '晨光提案');
