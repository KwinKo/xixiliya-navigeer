import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// 管理用户 API 端点
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查是否为管理员
    const userResult = await sql(`
      SELECT role 
      FROM users 
      WHERE id = $1
    `, [decoded.userId]);

    if (userResult.length === 0 || userResult[0].role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 获取所有用户数据
    const users = await sql(`
      SELECT id, username, email, password, role, "bookmarkLimit", disabled, "createdAt", "updatedAt" 
      FROM users 
      ORDER BY id ASC
    `);

    return Response.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 验证管理员权限
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查是否为管理员
    const userResult = await sql(`
      SELECT role 
      FROM users 
      WHERE id = $1
    `, [decoded.userId]);

    if (userResult.length === 0 || userResult[0].role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 解析请求体
    const body = await request.json();
    const { id, username, email, role, bookmarkLimit, disabled } = body;

    if (!id || !username) {
      return Response.json({ error: 'ID and username are required' }, { status: 400 });
    }

    // 更新用户数据
    const result = await sql(`
      UPDATE users 
      SET username = $1, email = $2, role = $3, "bookmarkLimit" = $4, disabled = $5 
      WHERE id = $6 
      RETURNING id, username, email, password, role, "bookmarkLimit", disabled, "createdAt", "updatedAt"
    `, [username, email, role, bookmarkLimit, disabled, id]);

    if (result.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ user: result[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('=== DELETE 请求开始 ===');
    
    // 验证管理员权限
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('No token found');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('Token verification failed');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查是否为管理员
    const userResult = await sql(`
      SELECT role 
      FROM users 
      WHERE id = $1
    `, [decoded.userId]);

    if (userResult.length === 0 || userResult[0].role !== 'admin') {
      console.log('User is not admin');
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 从请求体中获取用户 ID
    const body = await request.json().catch(() => ({}));
    const userId = body.id;
    
    console.log('User ID to delete:', userId);
    
    if (!userId || isNaN(userId)) {
      console.log('Invalid user ID');
      return Response.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // 防止删除自己
    if (userId === decoded.userId) {
      console.log('Cannot delete yourself');
      return Response.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    // 防止删除其他管理员
    const targetUserResult = await sql(`
      SELECT role 
      FROM users 
      WHERE id = $1
    `, [userId]);

    if (targetUserResult.length > 0 && targetUserResult[0].role === 'admin') {
      console.log('Cannot delete another admin');
      return Response.json({ error: 'Cannot delete another admin' }, { status: 400 });
    }

    // 删除用户
    const result = await sql(`
      DELETE FROM users 
      WHERE id = $1 
      RETURNING id
    `, [userId]);

    if (result.length === 0) {
      console.log('User not found');
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User deleted successfully');
    return Response.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}