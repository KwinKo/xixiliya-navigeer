import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // 测试基本连接
    const result = await sql('SELECT NOW() as current_time');
    
    // 检查users表是否存在
    const usersCheck = await sql(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);
    
    const hasUsersTable = usersCheck.length > 0;
    
    // 如果users表存在，获取一些基本信息
    let userData = null;
    let tableStructure = null;
    
    if (hasUsersTable) {
      // 获取users表结构
      const columns = await sql(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
        ORDER BY ordinal_position
      `);
      
      tableStructure = columns;
      
      // 获取用户数量
      const userCount = await sql('SELECT COUNT(*) as count FROM users');
      userData = {
        totalUsers: parseInt(userCount[0].count),
      };
    }
    
    return Response.json({
      success: true,
      currentTime: result[0].current_time,
      hasUsersTable,
      tableStructure,
      userData
    });
  } catch (error) {
    console.error('Database test error:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    }, { status: 500 });
  }
}