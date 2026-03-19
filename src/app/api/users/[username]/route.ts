import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    
    if (!username) {
      return Response.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    const user = await sql(`
      SELECT id, username, email, role, "bookmarkLimit", disabled, 
             "siteName", "siteDesc", "bgMode", "bgColor", "bgImage", 
             "enableParticles", "particleStyle", "particleColor", 
             "cardColor", "cardOpacity", "cardTextColor", "enableMinimalMode", 
             "createdAt", "updatedAt" 
      FROM users 
      WHERE username = $1 AND disabled = false
    `, [username]);

    if (user.length === 0) {
      return Response.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const userData = user[0];

    return Response.json({ success: true, data: userData });
  } catch (error) {
    console.error('Error fetching public user:', error);
    return Response.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}
