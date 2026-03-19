-- 标准数据库 schema 脚本
-- 适用于 XiXiLiYa Navigeer Next.js 应用
-- 注意：执行前请确保已连接到正确的 Neon 数据库

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS bookmark_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS users;

-- 1. 用户表（核心信息）
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  bookmarkLimit INTEGER DEFAULT 99,
  disabled BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 用户设置表（分离外观设置）
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  userId INTEGER UNIQUE NOT NULL,
  siteName VARCHAR(100) DEFAULT 'My Navigation',
  siteDesc TEXT DEFAULT 'Personal bookmark collection',
  bgMode VARCHAR(20) DEFAULT 'gradient',
  bgColor VARCHAR(20) DEFAULT '#667eea',
  bgImage TEXT,
  enableParticles BOOLEAN DEFAULT false,
  particleStyle VARCHAR(20) DEFAULT 'stars',
  particleColor VARCHAR(20) DEFAULT '#ffffff',
  cardColor VARCHAR(20) DEFAULT '#ffffff',
  cardOpacity INTEGER DEFAULT 85,
  cardTextColor VARCHAR(20) DEFAULT '#333333',
  enableMinimalMode BOOLEAN DEFAULT false,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. 分类表（保持不变）
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL,
  name VARCHAR(50) NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. 书签表（增强功能）
CREATE TABLE IF NOT EXISTS bookmarks (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon VARCHAR(10) DEFAULT '🔗',
  categoryId INTEGER,
  isPublic BOOLEAN DEFAULT false,
  clickCount INTEGER DEFAULT 0,
  lastAccessed TIMESTAMP WITH TIME ZONE,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
);

-- 5. 标签表（新增）
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL,
  name VARCHAR(30) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. 书签-标签关联表（新增）
CREATE TABLE IF NOT EXISTS bookmark_tags (
  bookmarkId INTEGER NOT NULL,
  tagId INTEGER NOT NULL,
  PRIMARY KEY (bookmarkId, tagId),
  FOREIGN KEY (bookmarkId) REFERENCES bookmarks(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

-- 在 categories 表上创建唯一索引，确保每个用户不能有同名分类
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_category ON categories (userId, name);

-- 在 tags 表上创建唯一索引，确保每个用户不能有同名标签
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_tag ON tags (userId, name);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks (userId);
CREATE INDEX IF NOT EXISTS idx_bookmarks_category_id ON bookmarks (categoryId);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories (userId);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags (userId);
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_bookmark_id ON bookmark_tags (bookmarkId);
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_tag_id ON bookmark_tags (tagId);

-- 创建触发器函数来自动更新 updatedAt 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表创建更新触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookmarks_updated_at BEFORE UPDATE ON bookmarks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入管理员用户 (用户名: KwinKo, 密码: password123)
-- 注意：使用 bcrypt 哈希值，由 bcrypt.hash('password123', 12) 生成
INSERT INTO users (username, email, password, role, bookmarkLimit)
SELECT 'KwinKo', 'admin@xixiliya-navigeer.com', '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin', 999
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'KwinKo');

-- 为管理员用户创建用户设置
INSERT INTO user_settings (userId, siteName, siteDesc)
SELECT u.id, 'XiXiLiYa Navigeer', 'Personal bookmark collection for admin'
FROM users u
WHERE u.username = 'KwinKo' AND NOT EXISTS (SELECT 1 FROM user_settings WHERE userId = u.id);

-- 插入测试用户
INSERT INTO users (username, email, password, role)
SELECT 'testuser', 'test@example.com', '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'user'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'testuser');

-- 为测试用户创建用户设置
INSERT INTO user_settings (userId)
SELECT u.id
FROM users u
WHERE u.username = 'testuser' AND NOT EXISTS (SELECT 1 FROM user_settings WHERE userId = u.id);

-- 为管理员用户创建默认分类
INSERT INTO categories (userId, name)
SELECT u.id, '工作'
FROM users u
WHERE u.username = 'KwinKo' AND NOT EXISTS (SELECT 1 FROM categories WHERE userId = u.id AND name = '工作');

INSERT INTO categories (userId, name)
SELECT u.id, '个人'
FROM users u
WHERE u.username = 'KwinKo' AND NOT EXISTS (SELECT 1 FROM categories WHERE userId = u.id AND name = '个人');

INSERT INTO categories (userId, name)
SELECT u.id, '学习'
FROM users u
WHERE u.username = 'KwinKo' AND NOT EXISTS (SELECT 1 FROM categories WHERE userId = u.id AND name = '学习');

-- 为管理员用户创建示例书签
INSERT INTO bookmarks (userId, title, url, description, icon, categoryId, isPublic)
SELECT 
  u.id, 
  'Google', 
  'https://www.google.com', 
  '全球最大的搜索引擎', 
  '🔍', 
  c.id, 
  true
FROM users u
JOIN categories c ON u.id = c.userId
WHERE u.username = 'KwinKo' AND c.name = '工作'
AND NOT EXISTS (SELECT 1 FROM bookmarks WHERE userId = u.id AND url = 'https://www.google.com');

INSERT INTO bookmarks (userId, title, url, description, icon, categoryId, isPublic)
SELECT 
  u.id, 
  'GitHub', 
  'https://github.com', 
  '代码托管平台', 
  '💻', 
  c.id, 
  true
FROM users u
JOIN categories c ON u.id = c.userId
WHERE u.username = 'KwinKo' AND c.name = '工作'
AND NOT EXISTS (SELECT 1 FROM bookmarks WHERE userId = u.id AND url = 'https://github.com');

INSERT INTO bookmarks (userId, title, url, description, icon, categoryId, isPublic)
SELECT 
  u.id, 
  'YouTube', 
  'https://www.youtube.com', 
  '视频分享平台', 
  '🎬', 
  c.id, 
  false
FROM users u
JOIN categories c ON u.id = c.userId
WHERE u.username = 'KwinKo' AND c.name = '个人'
AND NOT EXISTS (SELECT 1 FROM bookmarks WHERE userId = u.id AND url = 'https://www.youtube.com');

-- 为管理员用户创建示例标签
INSERT INTO tags (userId, name)
SELECT u.id, '重要'
FROM users u
WHERE u.username = 'KwinKo' AND NOT EXISTS (SELECT 1 FROM tags WHERE userId = u.id AND name = '重要');

INSERT INTO tags (userId, name)
SELECT u.id, '常用'
FROM users u
WHERE u.username = 'KwinKo' AND NOT EXISTS (SELECT 1 FROM tags WHERE userId = u.id AND name = '常用');

-- 查看创建结果
SELECT 'Users created:' AS message, COUNT(*) AS count FROM users;
SELECT 'User settings created:' AS message, COUNT(*) AS count FROM user_settings;
SELECT 'Categories created:' AS message, COUNT(*) AS count FROM categories;
SELECT 'Bookmarks created:' AS message, COUNT(*) AS count FROM bookmarks;
SELECT 'Tags created:' AS message, COUNT(*) AS count FROM tags;

-- 查看管理员用户
SELECT id, username, email, role, bookmarkLimit FROM users WHERE username = 'KwinKo';
