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

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户的所有书签和分类数据
    const bookmarksResult = await sql(
      'SELECT * FROM bookmarks WHERE user_id = $1 ORDER BY created_at ASC',
      [decoded.userId]
    );

    const categoriesResult = await sql(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at ASC',
      [decoded.userId]
    );

    // 构建导出数据
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        userId: decoded.userId,
        username: decoded.username,
      },
      categories: categoriesResult,
      bookmarks: bookmarksResult,
    };

    // 返回JSON数据
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=navigeer-backup.json',
      },
    });
  } catch (error) {
    console.error('Export data error:', error);
    return Response.json({ error: 'Failed to export data' }, { status: 500 });
  }
}