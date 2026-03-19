import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const SALT_ROUNDS = 10;

interface RegisterRequestBody {
  username: string;
  email?: string; // 可选字段
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { username, email, password } = body;

    // 验证输入
    if (!username || !password) {
      return Response.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // 如果提供了邮箱，验证邮箱格式
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return Response.json({ error: 'Invalid email format' }, { status: 400 });
      }
    } else {
      // 邮箱现在是必填字段
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // 验证密码强度（至少8位，包含大小写字母、数字和特殊字符）
    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    console.log('Password validation:', {
      password,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    });
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return Response.json({ error: 'Password must contain uppercase, lowercase, numbers and special characters' }, { status: 400 });
    }

    // 检查用户名是否已存在
    const existingUserResult = await sql(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUserResult.length > 0) {
      return Response.json({ error: 'Username already exists' }, { status: 409 });
    }

    // 检查邮箱是否已存在
    const existingEmailResult = await sql(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingEmailResult.length > 0) {
      return Response.json({ error: 'Email already exists' }, { status: 409 });
    }

    // 加密密码
    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);

    // 创建用户
    const result = await sql(`
      INSERT INTO users(username, email, password, "createdAt", "updatedAt") 
      VALUES($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
      RETURNING id, username, email, role, "bookmarkLimit"`,
      [username, email, hashedPassword]
    );

    const user = result[0];

    // 注意：当前数据库结构将所有设置存储在 users 表中，不需要单独的 user_settings 表
    // 注意：categories 表也不存在，后续需要根据实际需求创建

    // 生成JWT token (访问令牌)
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
      message: 'Registration successful',
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
    console.error('Registration error:', error);
    return Response.json({ error: 'Failed to register' }, { status: 500 });
  }
}