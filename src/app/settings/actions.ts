'use server';

import { cookies } from 'next/headers';
import sql from '@/lib/db';
import jwt from 'jsonwebtoken';
import type { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

interface JwtPayload {
  userId: number;
  username: string;
  email: string;
}

async function getCurrentUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || '';
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function getUser(): Promise<User | null> {
  const decoded = await getCurrentUser();
  if (!decoded) {
    return null;
  }

  try {
    const users = await sql(`
      SELECT id, username, email, role, "bookmarkLimit", disabled, 
             "siteName", "siteDesc", "bgMode", "bgColor", "bgImage", 
             "enableParticles", "particleStyle", "particleColor", 
             "cardColor", "cardOpacity", "cardTextColor", "enableMinimalMode", 
             "createdAt", "updatedAt" 
      FROM users 
      WHERE id = $1
    `, [decoded.userId]);

    if (users.length === 0) {
      return null;
    }

    return users[0] as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function updateUserSettings(settings: Partial<User>): Promise<{ success: boolean; error?: string }> {
  const decoded = await getCurrentUser();
  if (!decoded) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (settings.siteName !== undefined) {
      updates.push(`"siteName" = $${paramIndex++}`);
      values.push(settings.siteName);
    }
    if (settings.siteDesc !== undefined) {
      updates.push(`"siteDesc" = $${paramIndex++}`);
      values.push(settings.siteDesc);
    }
    if (settings.bgMode !== undefined) {
      updates.push(`"bgMode" = $${paramIndex++}`);
      values.push(settings.bgMode);
    }
    if (settings.bgColor !== undefined) {
      updates.push(`"bgColor" = $${paramIndex++}`);
      values.push(settings.bgColor);
    }
    if (settings.bgImage !== undefined) {
      updates.push(`"bgImage" = $${paramIndex++}`);
      values.push(settings.bgImage);
    }
    if (settings.enableParticles !== undefined) {
      updates.push(`"enableParticles" = $${paramIndex++}`);
      values.push(settings.enableParticles);
    }
    if (settings.particleStyle !== undefined) {
      updates.push(`"particleStyle" = $${paramIndex++}`);
      values.push(settings.particleStyle);
    }
    if (settings.particleColor !== undefined) {
      updates.push(`"particleColor" = $${paramIndex++}`);
      values.push(settings.particleColor);
    }
    if (settings.cardColor !== undefined) {
      updates.push(`"cardColor" = $${paramIndex++}`);
      values.push(settings.cardColor);
    }
    if (settings.cardOpacity !== undefined) {
      updates.push(`"cardOpacity" = $${paramIndex++}`);
      values.push(settings.cardOpacity);
    }
    if (settings.cardTextColor !== undefined) {
      updates.push(`"cardTextColor" = $${paramIndex++}`);
      values.push(settings.cardTextColor);
    }
    if (settings.enableMinimalMode !== undefined) {
      updates.push(`"enableMinimalMode" = $${paramIndex++}`);
      values.push(settings.enableMinimalMode);
    }
    if (settings.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(settings.email);
    }

    if (updates.length === 0) {
      return { success: false, error: 'No fields to update' };
    }

    updates.push(`"updatedAt" = $${paramIndex++}`);
    values.push(new Date());
    values.push(decoded.userId);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex}
    `;

    await sql(query, values);

    return { success: true };
  } catch (error) {
    console.error('Error updating user settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}

export async function exportData(): Promise<{ success: boolean; data?: any; error?: string }> {
  const decoded = await getCurrentUser();
  if (!decoded) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const bookmarks = await sql(
      'SELECT * FROM bookmarks WHERE user_id = $1 ORDER BY created_at ASC',
      [decoded.userId]
    );

    const categories = await sql(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at ASC',
      [decoded.userId]
    );

    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        userId: decoded.userId,
        username: decoded.username,
      },
      categories,
      bookmarks,
    };

    return { success: true, data: exportData };
  } catch (error) {
    console.error('Export data error:', error);
    return { success: false, error: 'Failed to export data' };
  }
}

export async function importData(data: any): Promise<{ success: boolean; importedBookmarks?: number; importedCategories?: number; error?: string }> {
  const decoded = await getCurrentUser();
  if (!decoded) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    if (!data.categories || !data.bookmarks) {
      return { success: false, error: 'Invalid backup data format' };
    }

    let importedCategories = 0;
    let importedBookmarks = 0;

    const existingCategories = await sql(
      'SELECT name FROM categories WHERE user_id = $1',
      [decoded.userId]
    );
    const existingNames = new Set(existingCategories.map((row: any) => row.name));

    for (const category of data.categories) {
      if (!existingNames.has(category.name)) {
        await sql(
          'INSERT INTO categories(name, description, user_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5)',
          [category.name, category.description, decoded.userId, category.created_at, category.updated_at]
        );
        importedCategories++;
      }
    }

    const allCategories = await sql(
      'SELECT id, name FROM categories WHERE user_id = $1',
      [decoded.userId]
    );
    const categoryMap = new Map(allCategories.map((cat: any) => [cat.name, cat.id]));

    for (const bookmark of data.bookmarks) {
      let categoryId = null;
      if (bookmark.category_id && bookmark.category_name) {
        categoryId = categoryMap.get(bookmark.category_name);
      }

      const existingBookmark = await sql(
        'SELECT id FROM bookmarks WHERE url = $1 AND user_id = $2',
        [bookmark.url, decoded.userId]
      );

      if (existingBookmark.length === 0) {
        await sql(
          `INSERT INTO bookmarks(title, url, description, category_id, user_id, is_public, created_at, updated_at) 
           VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            bookmark.title,
            bookmark.url,
            bookmark.description || '',
            categoryId,
            decoded.userId,
            bookmark.is_public || false,
            bookmark.created_at,
            bookmark.updated_at
          ]
        );
        importedBookmarks++;
      }
    }

    return { success: true, importedBookmarks, importedCategories };
  } catch (error) {
    console.error('Import data error:', error);
    return { success: false, error: 'Failed to import data' };
  }
}
