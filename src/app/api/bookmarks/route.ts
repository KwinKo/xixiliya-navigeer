import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// 书签数据缓存 - 禁用缓存以调试问题
export const revalidate = 0;

// 缓存监控函数
function logCacheOperation(operation: string, key: string, duration: number) {
  console.log(`[Cache Monitoring] ${operation} - Key: ${key} - Duration: ${duration}ms`);
}

// 缓存书签数据的函数
const fetchBookmarks = async (userId: number) => {
  const startTime = Date.now();
  const bookmarks = await sql(`
    SELECT id, "userId", title, url, description, icon, "categoryId", "isPublic", "createdAt", "updatedAt" 
    FROM bookmarks 
    WHERE "userId" = $1 
    ORDER BY "createdAt" DESC
  `, [userId]);
  const duration = Date.now() - startTime;
  logCacheOperation('Cache Miss - DB Query', `bookmarks-${userId}`, duration);
  return bookmarks;
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
    const bookmarks = await fetchBookmarks(decoded.userId);
    const duration = Date.now() - startTime;
    logCacheOperation('Cache Operation', `bookmarks-${decoded.userId}`, duration);

    return Response.json({ bookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return Response.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, url, description, icon, categoryId, isPublic } = body;

    if (!title || !url) {
      return Response.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    const result = await sql(`
      INSERT INTO bookmarks ("userId", title, url, description, icon, "categoryId", "isPublic", "createdAt", "updatedAt") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
      RETURNING id, "userId", title, url, description, icon, "categoryId", "isPublic", "createdAt", "updatedAt"
    `, [decoded.userId, title, url, description, icon, categoryId, isPublic]);

    // 清除书签数据缓存
    revalidatePath('/api/bookmarks');
    
    return Response.json({ bookmark: result[0] });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return Response.json({ error: 'Failed to create bookmark' }, { status: 500 });
  }
}
