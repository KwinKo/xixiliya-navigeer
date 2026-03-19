import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return Response.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    // 验证书签是否属于当前用户
    const categoryCheck = await sql(`
      SELECT id FROM categories WHERE id = $1 AND "userId" = $2
    `, [categoryId, decoded.userId]);

    if (categoryCheck.length === 0) {
      return Response.json({ error: 'Category not found' }, { status: 404 });
    }

    // 检查是否有书签使用了这个分类
    const bookmarkCheck = await sql(`
      SELECT id FROM bookmarks WHERE "categoryId" = $1 AND "userId" = $2
    `, [categoryId, decoded.userId]);

    if (bookmarkCheck.length > 0) {
      return Response.json({ error: 'Category has bookmarks', status: 400 });
    }

    await sql(`DELETE FROM categories WHERE id = $1 AND "userId" = $2`, [categoryId, decoded.userId]);

    return Response.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return Response.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
