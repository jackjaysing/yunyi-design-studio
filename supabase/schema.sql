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
  year TEXT DEFAULT '',
  area TEXT DEFAULT '',
  location TEXT DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  service TEXT DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO storage.buckets (id, name, public)
VALUES ('work-images', 'work-images', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "公開讀取作品" ON works;
CREATE POLICY "公開讀取作品" ON works FOR SELECT USING (true);

DROP POLICY IF EXISTS "新增作品" ON works;
CREATE POLICY "新增作品" ON works FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "更新作品" ON works;
CREATE POLICY "更新作品" ON works FOR UPDATE USING (true);

DROP POLICY IF EXISTS "刪除作品" ON works;
CREATE POLICY "刪除作品" ON works FOR DELETE USING (true);

DROP POLICY IF EXISTS "公開新增預約" ON inquiries;
CREATE POLICY "公開新增預約" ON inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "後台讀取預約" ON inquiries;
CREATE POLICY "後台讀取預約" ON inquiries FOR SELECT USING (true);

DROP POLICY IF EXISTS "後台刪除預約" ON inquiries;
CREATE POLICY "後台刪除預約" ON inquiries FOR DELETE USING (true);

DROP POLICY IF EXISTS "公開讀取作品圖" ON storage.objects;
CREATE POLICY "公開讀取作品圖" ON storage.objects
FOR SELECT USING (bucket_id = 'work-images');

DROP POLICY IF EXISTS "允許上傳作品圖" ON storage.objects;
CREATE POLICY "允許上傳作品圖" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'work-images');

INSERT INTO works (title, category, description, image_url, year, area, location, featured)
SELECT * FROM (VALUES
  (
    '靜謐都會宅',
    '室內設計',
    '以木質與灰調奠定沉穩基調，在有限坪數中創造開闊感與完整收納動線。',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
    '2025',
    '28 坪',
    '台北市',
    true
  ),
  (
    '光之廊道',
    '公設設計',
    '利用自然採光與材質層次，打造兼具品牌識別與停留感的公共展示空間。',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
    '2024',
    '45 坪',
    '新北市',
    true
  ),
  (
    '庭園序曲',
    '景觀設計',
    '以低維護植栽與石材動線，串連建築與戶外，營造沉靜內斂的景觀層次。',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
    '2024',
    '120 坪',
    '桃園市',
    false
  )
) AS seed(title, category, description, image_url, year, area, location, featured)
WHERE NOT EXISTS (SELECT 1 FROM works LIMIT 1);
