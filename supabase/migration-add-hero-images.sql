-- 首頁三張拼貼圖
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_image_large TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_image_small_1 TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=500&q=80';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_image_small_2 TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=500&q=80';
