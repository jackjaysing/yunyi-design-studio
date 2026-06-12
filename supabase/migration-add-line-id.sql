-- 預約表單：電話改選填、新增 Line ID
-- 於 Supabase SQL Editor 執行

ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS line_id TEXT DEFAULT '';
ALTER TABLE inquiries ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE inquiries ALTER COLUMN phone SET DEFAULT '';
