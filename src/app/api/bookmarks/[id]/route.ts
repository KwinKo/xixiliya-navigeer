import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const bookmarkId = parseInt(id);
    if (isNaN(bookmarkId)) {
      return Response.json({ error: 'Invalid bookmark ID' }, { status: 400 });
    }

    // 验证书签是否属于当前用户
    const bookmarkCheck = await sql(`
      SELECT id FROM bookmarks WHERE id = $1 AND "userId" = $2
    `, [bookmarkId, decoded.userId]);

    if (bookmarkCheck.length === 0) {
      return Response.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, url, description, icon, categoryId, isPublic } = body;

    const result = await sql(`
      UPDATE bookmarks 
      SET title = $1, url = $2, description = $3, icon = $4, "categoryId" = $5, "isPublic" = $6, "updatedAt" = CURRENT_TIMESTAMP 
      WHERE id = $7 AND "userId" = $8 
      RETURNING id, "userId", title, url, description, icon, "categoryId", "isPublic", "createdAt", "updatedAt"
    `, [title, url, description, icon, categoryId, isPublic, bookmarkId, decoded.userId]);

    return Response.json({ bookmark: result[0] });
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return Response.json({ error: 'Failed to update bookmark' }, { status: 500 });
  }
}

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
    const bookmarkId = parseInt(id);
    if (isNaN(bookmarkId)) {
      return Response.json({ error: 'Invalid bookmark ID' }, { status: 400 });
    }

    // 验证书签是否属于当前用户
    const bookmarkCheck = await sql(`
      SELECT id FROM bookmarks WHERE id = $1 AND "userId" = $2
    `, [bookmarkId, decoded.userId]);

    if (bookmarkCheck.length === 0) {
      return Response.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    await sql(`DELETE FROM bookmarks WHERE id = $1 AND "userId" = $2`, [bookmarkId, decoded.userId]);

    return Response.json({ message: 'Bookmark deleted successfully' });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return Response.json({ error: 'Failed to delete bookmark' }, { status: 500 });
  }
}
