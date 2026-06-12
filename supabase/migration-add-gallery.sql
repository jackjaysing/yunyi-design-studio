-- 作品詳情多圖
-- 於 Supabase SQL Editor 執行

ALTER TABLE works ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] NOT NULL DEFAULT '{}';

-- 若尚未更新作品圖片，請改執行 migration-update-work-images.sql
