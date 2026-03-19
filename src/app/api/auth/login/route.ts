import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequestBody = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 同时通过username或email查找用户
    const result = await sql(`
      SELECT id, username, email, password, role, "bookmarkLimit" 
      FROM users 
      WHERE email = $1 OR username = $1
    `, [email]);
    
    if (result.length === 0) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = result[0];
    
    // 灵活的密码验证：先尝试bcrypt，失败则尝试直接比较
    let isValidPassword = false;
    try {
      isValidPassword = await bcryptjs.compare(password, user.password);
    } catch (error) {
      // 如果bcrypt验证失败，尝试直接比较（可能是明文密码）
      isValidPassword = user.password === password;
    }

    if (!isValidPassword) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 生成 JWT token (访问令牌)
    const accessToken = jwt.sign(
      { userId: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 生成刷新令牌
    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return Response.json({ 
      message: 'Login successful', 
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          bookmarkLimit: user.bookmarkLimit
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Failed to login' }, { status: 500 });
  }
}