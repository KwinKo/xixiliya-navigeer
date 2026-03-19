import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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
    const { bookmarkId, tagId } = body;

    if (!bookmarkId || !tagId) {
      return Response.json({ error: 'Bookmark ID and Tag ID are required' }, { status: 400 });
    }

    // 验证书签是否属于当前用户
    const bookmarkCheck = await sql(`
      SELECT id FROM bookmarks WHERE id = $1 AND userId = $2
    `, [bookmarkId, decoded.userId]);

    if (bookmarkCheck.length === 0) {
      return Response.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    // 验证标签是否属于当前用户
    const tagCheck = await sql(`
      SELECT id FROM tags WHERE id = $1 AND userId = $2
    `, [tagId, decoded.userId]);

    if (tagCheck.length === 0) {
      return Response.json({ error: 'Tag not found' }, { status: 404 });
    }

    // 检查关联是否已存在
    const existingRelation = await sql(`
      SELECT bookmarkId, tagId FROM bookmark_tags WHERE bookmarkId = $1 AND tagId = $2
    `, [bookmarkId, tagId]);

    if (existingRelation.length > 0) {
      return Response.json({ error: 'Relation already exists' }, { status: 409 });
    }

    // 创建关联
    await sql(`
      INSERT INTO bookmark_tags (bookmarkId, tagId) 
      VALUES ($1, $2)
    `, [bookmarkId, tagId]);

    return Response.json({ message: 'Tag added to bookmark successfully' });
  } catch (error) {
    console.error('Error adding tag to bookmark:', error);
    return Response.json({ error: 'Failed to add tag to bookmark' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
    const { bookmarkId, tagId } = body;

    if (!bookmarkId || !tagId) {
      return Response.json({ error: 'Bookmark ID and Tag ID are required' }, { status: 400 });
    }

    // 验证书签是否属于当前用户
    const bookmarkCheck = await sql(`
      SELECT id FROM bookmarks WHERE id = $1 AND userId = $2
    `, [bookmarkId, decoded.userId]);

    if (bookmarkCheck.length === 0) {
      return Response.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    // 删除关联
    await sql(`
      DELETE FROM bookmark_tags WHERE bookmarkId = $1 AND tagId = $2
    `, [bookmarkId, tagId]);

    return Response.json({ message: 'Tag removed from bookmark successfully' });
  } catch (error) {
    console.error('Error removing tag from bookmark:', error);
    return Response.json({ error: 'Failed to remove tag from bookmark' }, { status: 500 });
  }
}
