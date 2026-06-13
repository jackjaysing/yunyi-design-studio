-- 還原密碼後台模式所需的 RLS（若曾執行 migration-admin-auth-rls.sql）
-- 於 Supabase SQL Editor 執行
--
-- ⚠️ 若出現 relation "works" does not exist：
--    請先執行 supabase/schema.sql 建立資料表，再跑此檔。
--    全新專案只需執行 schema.sql 即可，不必執行本檔。

DROP POLICY IF EXISTS "後台新增作品" ON works;
DROP POLICY IF EXISTS "後台更新作品" ON works;
DROP POLICY IF EXISTS "後台刪除作品" ON works;
DROP POLICY IF EXISTS "新增作品" ON works;
CREATE POLICY "新增作品" ON works FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "更新作品" ON works;
CREATE POLICY "更新作品" ON works FOR UPDATE USING (true);
DROP POLICY IF EXISTS "刪除作品" ON works;
CREATE POLICY "刪除作品" ON works FOR DELETE USING (true);

DROP POLICY IF EXISTS "後台讀取預約" ON inquiries;
CREATE POLICY "後台讀取預約" ON inquiries FOR SELECT USING (true);
DROP POLICY IF EXISTS "後台刪除預約" ON inquiries;
CREATE POLICY "後台刪除預約" ON inquiries FOR DELETE USING (true);

DROP POLICY IF EXISTS "後台上傳作品圖" ON storage.objects;
DROP POLICY IF EXISTS "允許上傳作品圖" ON storage.objects;
CREATE POLICY "允許上傳作品圖" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'work-images');
DROP POLICY IF EXISTS "後台刪除作品圖" ON storage.objects;
DROP POLICY IF EXISTS "允許刪除作品圖" ON storage.objects;
CREATE POLICY "允許刪除作品圖" ON storage.objects
FOR DELETE USING (bucket_id = 'work-images');
