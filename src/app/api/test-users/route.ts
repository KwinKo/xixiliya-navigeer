import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // 获取所有用户
    const users = await sql('SELECT id, username, email FROM users');
    
    // 检查是否有KwinKo用户
    const kwinKoUser = users.find((user: any) => user.username === 'KwinKo');
    
    return Response.json({
      totalUsers: users.length,
      users: users,
      hasKwinKoUser: !!kwinKoUser,
      kwinKoUser: kwinKoUser
    });
  } catch (error) {
    console.error('Test users error:', error);
    return Response.json({ error: 'Failed to get users' }, { status: 500 });
  }
}
