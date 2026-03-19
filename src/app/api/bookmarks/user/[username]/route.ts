import { NextRequest } from 'next/server';
import sql from '@/lib/db';

// 缓存监控函数
function logCacheOperation(operation: string, key: string, duration: number) {
  console.log(`[Cache Monitoring] ${operation} - Key: ${key} - Duration: ${duration}ms`);
}

// 公开书签数据缓存 - 1小时
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

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    let query = `
      SELECT b.id, b."userId", b.title, b.url, b.description, b.icon, b."categoryId", b."isPublic", 
             b."createdAt", b."updatedAt", c.name as categoryName
      FROM bookmarks b
      LEFT JOIN categories c ON b."categoryId" = c.id
      WHERE b."userId" = $1 AND b."isPublic" = true
    `;
    
    const queryParams: any[] = [userId];
    let paramIndex = 2;

    if (categoryId) {
      query += ` AND b."categoryId" = $${paramIndex++}`;
      queryParams.push(parseInt(categoryId));
    }

    if (search) {
      query += ` AND (b.title ILIKE $${paramIndex++} OR b.url ILIKE $${paramIndex++} OR b.description ILIKE $${paramIndex++})`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY b."createdAt" DESC`;

    const bookmarksStartTime = Date.now();
    const bookmarks = await sql(query, queryParams);
    const bookmarksQueryDuration = Date.now() - bookmarksStartTime;
    logCacheOperation('Public Page - Bookmarks Query', `public-bookmarks-${username}`, bookmarksQueryDuration);

    const totalDuration = Date.now() - startTime;
    logCacheOperation('Public Page - Total', `public-page-${username}`, totalDuration);

    return Response.json({ success: true, data: bookmarks });
  } catch (error) {
    console.error('Error fetching public bookmarks:', error);
    return Response.json({ success: false, error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}
