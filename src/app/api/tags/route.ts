import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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

    const tags = await sql(`
      SELECT id, userId, name 
      FROM tags 
      WHERE userId = $1 
      ORDER BY name ASC
    `, [decoded.userId]);

    return Response.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return Response.json({ error: 'Failed to fetch tags' }, { status: 500 });
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
      return Response.json({ error: 'Tag name is required' }, { status: 400 });
    }

    // 检查标签名是否已存在
    const existingTag = await sql(`
      SELECT id FROM tags WHERE userId = $1 AND name = $2
    `, [decoded.userId, name]);

    if (existingTag.length > 0) {
      return Response.json({ error: 'Tag name already exists' }, { status: 409 });
    }

    const result = await sql(`
      INSERT INTO tags (userId, name) 
      VALUES ($1, $2) 
      RETURNING id, userId, name
    `, [decoded.userId, name]);

    return Response.json({ tag: result[0] });
  } catch (error) {
    console.error('Error creating tag:', error);
    return Response.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
