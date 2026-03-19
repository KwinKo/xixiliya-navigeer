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
    const tagId = parseInt(id);
    if (isNaN(tagId)) {
      return Response.json({ error: 'Invalid tag ID' }, { status: 400 });
    }

    // 验证标签是否属于当前用户
    const tagCheck = await sql(`
      SELECT id FROM tags WHERE id = $1 AND userId = $2
    `, [tagId, decoded.userId]);

    if (tagCheck.length === 0) {
      return Response.json({ error: 'Tag not found' }, { status: 404 });
    }

    // 开始事务
    await sql('BEGIN');

    try {
      // 删除标签与书签的关联
      await sql(`DELETE FROM bookmark_tags WHERE tagId = $1`, [tagId]);

      // 删除标签
      await sql(`DELETE FROM tags WHERE id = $1 AND userId = $2`, [tagId, decoded.userId]);

      // 提交事务
      await sql('COMMIT');

      return Response.json({ message: 'Tag deleted successfully' });
    } catch (error) {
      // 回滚事务
      await sql('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting tag:', error);
    return Response.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
