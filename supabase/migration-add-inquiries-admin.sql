-- 讓後台可以讀取與刪除預約資料
-- 於 Supabase SQL Editor 執行

DROP POLICY IF EXISTS "後台讀取預約" ON inquiries;
CREATE POLICY "後台讀取預約" ON inquiries FOR SELECT USING (true);

DROP POLICY IF EXISTS "後台刪除預約" ON inquiries;
CREATE POLICY "後台刪除預約" ON inquiries FOR DELETE USING (true);
