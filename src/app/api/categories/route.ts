import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// 分类数据缓存 - 15小时
export const revalidate = 54000;

// 缓存监控函数
function logCacheOperation(operation: string, key: string, duration: number) {
  console.log(`[Cache Monitoring] ${operation} - Key: ${key} - Duration: ${duration}ms`);
}

// 缓存分类数据的函数
const fetchCategories = async (userId: number) => {
  const startTime = Date.now();
  const categories = await sql(`
    SELECT id, "userId", name, "createdAt", "updatedAt" 
    FROM categories 
    WHERE "userId" = $1 
    ORDER BY "createdAt" ASC
  `, [userId]);
  const duration = Date.now() - startTime;
  logCacheOperation('Cache Miss - DB Query', `categories-${userId}`, duration);
  return categories;
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
    const categories = await fetchCategories(decoded.userId);
    const duration = Date.now() - startTime;
    logCacheOperation('Cache Operation', `categories-${decoded.userId}`, duration);

    return Response.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 });
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
    const { name } = body;

    if (!name || name.trim() === '') {
      return Response.json({ error: 'Category name is required' }, { status: 400 });
    }

    // 检查分类名是否已存在
    const existingCategory = await sql(`
      SELECT id FROM categories WHERE "userId" = $1 AND name = $2
    `, [decoded.userId, name]);

    if (existingCategory.length > 0) {
      return Response.json({ error: 'Category name already exists' }, { status: 409 });
    }

    const result = await sql(`
      INSERT INTO categories ("userId", name, "createdAt", "updatedAt") 
      VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
      RETURNING id, "userId", name, "createdAt", "updatedAt"
    `, [decoded.userId, name]);

    // 清除分类数据缓存
    revalidatePath('/api/categories');
    
    return Response.json({ category: result[0] });
  } catch (error) {
    console.error('Error creating category:', error);
    return Response.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
