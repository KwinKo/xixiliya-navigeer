import { NextRequest } from 'next/server';
import sql from '@/lib/db';

// 缓存监控函数
function logCacheOperation(operation: string, key: string, duration: number) {
  console.log(`[Cache Monitoring] ${operation} - Key: ${key} - Duration: ${duration}ms`);
}

// 公开分类数据缓存 - 1小时
export const revalidate = 3600;

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    
    if (!username) {
      return Response.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    const startTime = Date.now();
    const user = await sql(`
      SELECT id FROM users WHERE username = $1 AND disabled = false
    `, [username]);
    const userQueryDuration = Date.now() - startTime;
    logCacheOperation('Public Page - User Query', `user-${username}`, userQueryDuration);

    if (user.length === 0) {
      return Response.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const userId = user[0].id;

    const categoriesStartTime = Date.now();
    const categories = await sql(`
      SELECT c.id, c."userId", c.name, c."createdAt", c."updatedAt",
             COUNT(b.id) as bookmarkCount
      FROM categories c
      LEFT JOIN bookmarks b ON c.id = b."categoryId" AND b."isPublic" = true
      WHERE c."userId" = $1
      GROUP BY c.id, c."userId", c.name, c."createdAt", c."updatedAt"
      ORDER BY c."createdAt" DESC
    `, [userId]);
    const categoriesQueryDuration = Date.now() - categoriesStartTime;
    logCacheOperation('Public Page - Categories Query', `public-categories-${username}`, categoriesQueryDuration);

    const totalDuration = Date.now() - startTime;
    logCacheOperation('Public Page - Total', `public-page-${username}`, totalDuration);

    return Response.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching public categories:', error);
    return Response.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}
