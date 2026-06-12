-- 更新既有作品分類為：景觀設計、公設設計、室內設計
-- 於 Supabase SQL Editor 執行

UPDATE works SET category = '室內設計' WHERE category = '住宅設計';
UPDATE works SET category = '公設設計' WHERE category = '商業空間';
UPDATE works SET category = '室內設計' WHERE category IN ('辦公空間', '其他');

UPDATE works SET category = '室內設計' WHERE title = '靜謐都會宅';
UPDATE works SET category = '公設設計' WHERE title = '光之廊道';

UPDATE works
SET
  title = '庭園序曲',
  category = '景觀設計',
  description = '以低維護植栽與石材動線，串連建築與戶外，營造沉靜內斂的景觀層次。',
  area = '120 坪'
WHERE title = '暖木日常';

ALTER TABLE works ALTER COLUMN category SET DEFAULT '室內設計';
