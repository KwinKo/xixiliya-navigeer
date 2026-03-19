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

    // 获取用户统计信息
    const statsResult = await sql(`
      SELECT 
        (SELECT COUNT(*) FROM bookmarks WHERE user_id = $1) AS total_bookmarks,
        (SELECT COUNT(*) FROM categories WHERE user_id = $1) AS total_categories,
        (SELECT COUNT(*) FROM bookmarks WHERE user_id = $1 AND is_public = true) AS public_bookmarks,
        (SELECT COUNT(*) FROM bookmarks WHERE user_id = $1 AND is_public = false) AS private_bookmarks
    `, [decoded.userId]);

    const stats = statsResult[0];

    return Response.json({
      success: true,
      data: {
        totalBookmarks: parseInt(stats.total_bookmarks),
        totalCategories: parseInt(stats.total_categories),
        publicBookmarks: parseInt(stats.public_bookmarks),
        privateBookmarks: parseInt(stats.private_bookmarks),
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return Response.json({ error: 'Failed to get user stats' }, { status: 500 });
  }
}