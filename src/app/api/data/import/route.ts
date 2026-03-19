import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

interface JwtPayload {
  userId: number;
  username: string;
  email: string;
}

// 验证JWT中间件
const verifyToken = async (request: NextRequest) => {
  const authHeader = request.headers.get('Authorization');
  let token = '';

  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  } else {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    if (!data.categories || !data.bookmarks) {
      return Response.json({ error: 'Invalid backup data format' }, { status: 400 });
    }

    let importedCategories = 0;
    let importedBookmarks = 0;

    // 导入分类
    const existingCategories = await sql(
      'SELECT name FROM categories WHERE user_id = $1',
      [decoded.userId]
    );
      const existingNames = new Set(existingCategories.map(row => row.name));

      for (const category of data.categories) {
        // 检查是否已存在同名分类
        if (!existingNames.has(category.name)) {
          await sql(
            'INSERT INTO categories(name, description, user_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5)',
            [category.name, category.description, decoded.userId, category.created_at, category.updated_at]
          );
          importedCategories++;
        }
      }

      // 获取当前用户的所有分类，用于映射
      const allCategories = await sql(
        'SELECT id, name FROM categories WHERE user_id = $1',
        [decoded.userId]
      );
      const categoryMap = new Map(allCategories.map(cat => [cat.name, cat.id]));

      // 导入书签
      for (const bookmark of data.bookmarks) {
        // 查找对应的分类ID
        let categoryId = null;
        if (bookmark.category_id && bookmark.category_name) {
          categoryId = categoryMap.get(bookmark.category_name);
        }

        // 检查是否已存在相同的书签
        const existingBookmark = await sql(
          'SELECT id FROM bookmarks WHERE url = $1 AND user_id = $2',
          [bookmark.url, decoded.userId]
        );

        if (existingBookmark.length === 0) {
          await sql(
            `INSERT INTO bookmarks(title, url, description, category_id, user_id, is_public, created_at, updated_at) 
             VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              bookmark.title,
              bookmark.url,
              bookmark.description || '',
              categoryId,
              decoded.userId,
              bookmark.is_public || false,
              bookmark.created_at,
              bookmark.updated_at
            ]
          );
          importedBookmarks++;
        }
      }


    return Response.json({
      success: true,
      message: 'Data imported successfully',
      data: {
        importedCategories,
        importedBookmarks
      }
    });
  } catch (error) {
    console.error('Import data error:', error);
    return Response.json({ error: 'Failed to import data' }, { status: 500 });
  }
}