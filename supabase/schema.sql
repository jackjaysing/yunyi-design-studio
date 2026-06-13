-- ============================================================
-- 允藝設計工作室 · Supabase 資料庫結構
-- 於 Supabase Dashboard → SQL Editor 執行（可重複執行）
-- ============================================================

CREATE TABLE IF NOT EXISTS works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '室內設計',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  gallery_urls TEXT[] NOT NULL DEFAULT '{}',
  year TEXT DEFAULT '',
  area TEXT DEFAULT '',
  location TEXT DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  line_id TEXT DEFAULT '',
  service TEXT DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_name TEXT NOT NULL DEFAULT '允藝設計工作室',
  site_name_en TEXT NOT NULL DEFAULT 'Yun Yi Design Studio',
  tagline TEXT NOT NULL DEFAULT '允執厥中，匠心獨藝',
  footer_desc TEXT NOT NULL DEFAULT '引領空間美學與法規安全的完美平衡',
  service_hours TEXT NOT NULL DEFAULT '週一至週五 10:00 - 18:00',
  service_area TEXT NOT NULL DEFAULT '大台北、桃園、新竹',
  phone TEXT NOT NULL DEFAULT '02-1234-5678',
  email TEXT NOT NULL DEFAULT 'hello@yunyidesign.com',
  line_id TEXT NOT NULL DEFAULT '@yunyidesign',
  contact_intro TEXT NOT NULL DEFAULT '歡迎留下您的需求，我們將於 1-2 個工作天內與您聯繫。',
  about_intro TEXT NOT NULL DEFAULT '我們相信，好的空間不只是好看，更應該在日常中穩定運作，並符合法規與安全。',
  philosophy_1 TEXT NOT NULL DEFAULT '允藝設計工作室以「允執厥中，匠心獨藝」為核心，結合室內美學與工程審查專業，協助客戶在設計理想與法規要求之間取得最佳平衡。',
  philosophy_2 TEXT NOT NULL DEFAULT '我們不追求浮華堆砌，而是透過比例、材質、光線與動線，讓空間回到生活本身，成為能長久使用的場域。',
  service_scope TEXT NOT NULL DEFAULT E'住宅室內設計與裝修規劃\n商業空間與展示設計\n室內裝修許可與送審協助\n工程法規諮詢與圖面審查\n施工監造與材料搭配建議',
  stat_years TEXT NOT NULL DEFAULT '10+',
  stat_projects TEXT NOT NULL DEFAULT '120+',
  stat_compliance TEXT NOT NULL DEFAULT '100%',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO site_settings (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('work-images', 'work-images', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "公開讀取作品" ON works;
CREATE POLICY "公開讀取作品" ON works FOR SELECT USING (true);

DROP POLICY IF EXISTS "新增作品" ON works;
DROP POLICY IF EXISTS "後台新增作品" ON works;
CREATE POLICY "新增作品" ON works FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "更新作品" ON works;
DROP POLICY IF EXISTS "後台更新作品" ON works;
CREATE POLICY "更新作品" ON works FOR UPDATE USING (true);

DROP POLICY IF EXISTS "刪除作品" ON works;
DROP POLICY IF EXISTS "後台刪除作品" ON works;
CREATE POLICY "刪除作品" ON works FOR DELETE USING (true);

DROP POLICY IF EXISTS "公開新增預約" ON inquiries;
CREATE POLICY "公開新增預約" ON inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "後台讀取預約" ON inquiries;
CREATE POLICY "後台讀取預約" ON inquiries FOR SELECT USING (true);

DROP POLICY IF EXISTS "後台刪除預約" ON inquiries;
CREATE POLICY "後台刪除預約" ON inquiries FOR DELETE USING (true);

DROP POLICY IF EXISTS "公開讀取工作室設定" ON site_settings;
CREATE POLICY "公開讀取工作室設定" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "後台更新工作室設定" ON site_settings;
CREATE POLICY "後台更新工作室設定" ON site_settings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "後台新增工作室設定" ON site_settings;
CREATE POLICY "後台新增工作室設定" ON site_settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "公開讀取作品圖" ON storage.objects;
CREATE POLICY "公開讀取作品圖" ON storage.objects
FOR SELECT USING (bucket_id = 'work-images');

DROP POLICY IF EXISTS "允許上傳作品圖" ON storage.objects;
DROP POLICY IF EXISTS "後台上傳作品圖" ON storage.objects;
CREATE POLICY "允許上傳作品圖" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'work-images');

DROP POLICY IF EXISTS "允許刪除作品圖" ON storage.objects;
DROP POLICY IF EXISTS "後台刪除作品圖" ON storage.objects;
CREATE POLICY "允許刪除作品圖" ON storage.objects
FOR DELETE USING (bucket_id = 'work-images');

INSERT INTO works (title, category, description, image_url, gallery_urls, year, area, location, featured)
SELECT * FROM (VALUES
  (
    '靜謐都會宅',
    '室內設計',
    '以木質與灰調奠定沉穩基調，在有限坪數中創造開闊感與完整收納動線。',
    '/assets/works/jingmi-cover.png',
    ARRAY['/assets/works/jingmi-gallery-1.png', '/assets/works/jingmi-gallery-2.png'],
    '2025',
    '28 坪',
    '台北市',
    true
  ),
  (
    '光之廊道',
    '公設設計',
    '利用自然採光與材質層次，打造兼具品牌識別與停留感的公共展示空間。',
    '/assets/works/guangzhi-cover.png',
    ARRAY['/assets/works/guangzhi-gallery-1.png', '/assets/works/guangzhi-gallery-2.png'],
    '2024',
    '45 坪',
    '新北市',
    true
  ),
  (
    '庭園序曲',
    '景觀設計',
    '以低維護植栽與石材動線，串連建築與戶外，營造沉靜內斂的景觀層次。',
    '/assets/works/tingyuan-cover.png',
    ARRAY['/assets/works/tingyuan-gallery-1.png', '/assets/works/tingyuan-gallery-2.png'],
    '2024',
    '120 坪',
    '桃園市',
    false
  ),
  (
    '晨光提案',
    '彩色配置圖',
    '以暖色與木質為主軸的住宅配色方案，呈現空間氛圍與材質層次，協助業主在施工前確認整體色調。',
    '/assets/works/caise-cover.png',
    ARRAY['/assets/works/caise-gallery-1.png', '/assets/works/caise-gallery-2.png'],
    '2025',
    '30 坪',
    '台北市',
    false
  )
) AS seed(title, category, description, image_url, gallery_urls, year, area, location, featured)
WHERE NOT EXISTS (SELECT 1 FROM works LIMIT 1);
