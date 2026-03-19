-- 数据库迁移脚本：添加缺失的列
-- 执行此脚本来更新现有的数据库表结构

-- 检查并添加 clickCount 列到 bookmarks 表
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bookmarks' 
        AND column_name = 'clickCount'
    ) THEN
        ALTER TABLE bookmarks ADD COLUMN clickCount INTEGER DEFAULT 0;
        RAISE NOTICE 'Added clickCount column to bookmarks table';
    ELSE
        RAISE NOTICE 'clickCount column already exists in bookmarks table';
    END IF;
END $$;

-- 检查并添加 lastAccessed 列到 bookmarks 表
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bookmarks' 
        AND column_name = 'lastAccessed'
    ) THEN
        ALTER TABLE bookmarks ADD COLUMN lastAccessed TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added lastAccessed column to bookmarks table';
    ELSE
        RAISE NOTICE 'lastAccessed column already exists in bookmarks table';
    END IF;
END $$;

-- 验证列是否已添加
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookmarks' 
AND column_name IN ('clickCount', 'lastAccessed')
ORDER BY column_name;