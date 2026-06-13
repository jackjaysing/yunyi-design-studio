-- 允許刪除 Storage 作品圖（刪除作品時一併清圖）
-- 於 Supabase SQL Editor 執行

DROP POLICY IF EXISTS "允許刪除作品圖" ON storage.objects;
CREATE POLICY "允許刪除作品圖" ON storage.objects
FOR DELETE USING (bucket_id = 'work-images');
