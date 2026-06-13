-- 工作室資訊設定（singleton 單筆資料）
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

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "公開讀取工作室設定" ON site_settings;
CREATE POLICY "公開讀取工作室設定" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "後台更新工作室設定" ON site_settings;
CREATE POLICY "後台更新工作室設定" ON site_settings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "後台新增工作室設定" ON site_settings;
CREATE POLICY "後台新增工作室設定" ON site_settings FOR INSERT WITH CHECK (true);
