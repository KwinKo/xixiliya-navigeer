import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { unstable_cache } from 'next/cache';

// 用户信息缓存 - 10小时
export const revalidate = 36000;

// 缓存监控函数
function logCacheOperation(operation: string, key: string, duration: number) {
  console.log(`[Cache Monitoring] ${operation} - Key: ${key} - Duration: ${duration}ms`);
}

// 缓存用户信息的函数
const fetchUserInfo = async (userId: number) => {
  const startTime = Date.now();
  const users = await sql(`
    SELECT id, username, email, role, "bookmarkLimit", disabled, 
           "siteName", "siteDesc", "bgMode", "bgColor", "bgImage", 
           "enableParticles", "particleStyle", "particleColor", 
           "cardColor", "cardOpacity", "cardTextColor", "enableMinimalMode", 
           "createdAt", "updatedAt" 
    FROM users 
    WHERE id = $1
  `, [userId]);
  const duration = Date.now() - startTime;
  logCacheOperation('Cache Miss - DB Query', `user-info-${userId}`, duration);
  return users[0];
};

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();
    const user = await fetchUserInfo(decoded.userId);
    const duration = Date.now() - startTime;
    logCacheOperation('Cache Operation', `user-info-${decoded.userId}`, duration);

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
