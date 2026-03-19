import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import sql from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

interface JwtPayload {
  userId: number;
  username: string;
  email: string;
}

// 用户信息缓存 - 10小时
export const revalidate = 36000;

export async function GET(request: NextRequest) {
  try {
    // 从请求头获取 token
    const authHeader = request.headers.get('Authorization');
    let token = '';

    if (authHeader) {
      token = authHeader.replace('Bearer ', '');
    } else {
      // 尝试从 cookies 获取
      token = request.cookies.get('token')?.value || '';
    }

    if (!token) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      // 验证 token
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      // 从数据库获取用户信息
      const result = await sql(
        'SELECT id, username, email, "bookmarkLimit", "siteName", "siteDesc", "bgMode", "bgColor", "bgImage", "enableParticles", "particleStyle", "particleColor", "cardColor", "cardOpacity", "cardTextColor", "enableMinimalMode", "createdAt", "updatedAt" FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.length === 0) {
        return Response.json({ error: 'User not found' }, { status: 404 });
      }

      const user = result[0];
      return Response.json(user);
    } catch (err) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
      console.error('Error fetching user:', error);
      return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}