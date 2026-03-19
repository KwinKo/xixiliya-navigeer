import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import sql from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

interface RefreshTokenPayload {
  userId: number;
  iat: number;
  exp: number;
}

export async function POST(request: NextRequest) {
  try {
    // 从请求体获取刷新令牌
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return Response.json({ error: 'Refresh token required' }, { status: 401 });
    }

    // 验证刷新令牌
    let decodedToken: RefreshTokenPayload;
    try {
      decodedToken = jwt.verify(refreshToken, JWT_SECRET) as RefreshTokenPayload;
    } catch (err) {
      return Response.json({ error: 'Invalid refresh token' }, { status: 403 });
    }

    // 从数据库获取用户信息
    const result = await sql(
      'SELECT id, username, email FROM users WHERE id = $1',
      [decodedToken.userId]
    );

    if (result.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result[0];

    // 生成新的访问令牌
    const newToken = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 生成新的刷新令牌
    const newRefreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return Response.json({ 
      message: 'Token refreshed successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        tokens: {
          accessToken: newToken,
          refreshToken: newRefreshToken
        }
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return Response.json({ error: 'Failed to refresh token' }, { status: 500 });
  }
}