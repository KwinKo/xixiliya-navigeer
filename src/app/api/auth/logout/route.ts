import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  // 清除用户信息缓存
  revalidatePath('/api/users');
  
  // 在无状态JWT认证中，登出通常只是客户端清除token
  // 服务器端不需要做任何操作
  return Response.json({ message: 'Logout successful' });
}
