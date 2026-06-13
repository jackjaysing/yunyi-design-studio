-- 後台登入改為 Supabase Auth，收緊 RLS 權限
-- 於 Supabase SQL Editor 執行
--
-- 執行前請先在 Dashboard → Authentication → Users 建立管理員帳號
-- 並在 Authentication → Providers → Email 關閉「Enable sign ups」

-- works：前台唯讀，後台（已登入）可寫
DROP POLICY IF EXISTS "新增作品" ON works;
DROP POLICY IF EXISTS "更新作品" ON works;
DROP POLICY IF EXISTS "刪除作品" ON works;

DROP POLICY IF EXISTS "後台新增作品" ON works;
CREATE POLICY "後台新增作品" ON works
FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "後台更新作品" ON works;
CREATE POLICY "後台更新作品" ON works
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "後台刪除作品" ON works;
CREATE POLICY "後台刪除作品" ON works
FOR DELETE TO authenticated
USING (true);

-- inquiries：前台可新增，後台可讀可刪
DROP POLICY IF EXISTS "後台讀取預約" ON inquiries;
CREATE POLICY "後台讀取預約" ON inquiries
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "後台刪除預約" ON inquiries;
CREATE POLICY "後台刪除預約" ON inquiries
FOR DELETE TO authenticated
USING (true);

-- storage：前台可讀圖，後台可上傳刪除
DROP POLICY IF EXISTS "允許上傳作品圖" ON storage.objects;
DROP POLICY IF EXISTS "後台上傳作品圖" ON storage.objects;
CREATE POLICY "後台上傳作品圖" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'work-images');

DROP POLICY IF EXISTS "允許刪除作品圖" ON storage.objects;
DROP POLICY IF EXISTS "後台刪除作品圖" ON storage.objects;
CREATE POLICY "後台刪除作品圖" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'work-images');
