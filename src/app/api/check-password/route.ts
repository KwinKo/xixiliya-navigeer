import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import bcryptjs from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return Response.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // 查找用户
    const result = await sql('SELECT id, username, password FROM users WHERE username = $1', [username]);
    
    if (result.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result[0];
    
    // 检查密码长度，判断是否是哈希值
    const isHashed = user.password.length > 60; // bcrypt哈希通常很长
    
    // 尝试验证密码
    let isValidPassword = false;
    try {
      isValidPassword = await bcryptjs.compare(password, user.password);
    } catch (error) {
      // 如果bcrypt验证失败，可能是明文密码
      isValidPassword = user.password === password;
    }

    return Response.json({
      user: {
        id: user.id,
        username: user.username
      },
      passwordInfo: {
        isHashed,
        passwordLength: user.password.length,
        isValidPassword,
        passwordPreview: user.password.substring(0, 20) + (user.password.length > 20 ? '...' : '')
      }
    });
  } catch (error) {
    console.error('Check password error:', error);
    return Response.json({ error: 'Failed to check password' }, { status: 500 });
  }
}
