/**
 * 简单的数据库连接测试脚本
 * 验证数据库连接是否正常工作
 */

import { Sequelize } from 'sequelize';
import pg from 'pg';

// 使用与 Vercel 函数中相同的数据库配置逻辑
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.log('提示：未设置 DATABASE_URL 环境变量');
  console.log('使用默认本地连接字符串进行测试...');
  // 使用 backend 目录中的 .env 文件中的值
  process.env.DATABASE_URL = "postgresql://postgres:kwinko@localhost:5432/navigeer?schema=public";
}

const currentDbUrl = process.env.DATABASE_URL;

// 确保 DATABASE_URL 包含正确的 SSL 模式
const getDatabaseUrl = (dbUrl: string) => {
  if (!dbUrl) return dbUrl;
  
  // 检查 URL 是否已包含 sslmode 参数
  const hasSslMode = dbUrl.includes('sslmode=') || dbUrl.includes('ssl-mode=');
  if (!hasSslMode) {
    // 如果没有 sslmode 参数，添加 verify-full（更安全的选项）
    return `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}sslmode=verify-full`;
  }
  
  return dbUrl;
};

console.log('数据库URL:', getDatabaseUrl(currentDbUrl).replace(/:([^:@]+)@/, ':***@')); // 隐藏密码

// 数据库配置 - 与 Vercel 函数中相同的配置
const sequelize = new Sequelize(getDatabaseUrl(currentDbUrl), {
  dialect: 'postgres',
  dialectModule: pg,
  logging: false, // 关闭日志以减少输出
  pool: {
    max: 1, // Serverless 环境优化：减少连接池大小
    min: 0,
    acquire: 60000, // 增加获取连接的超时时间
    idle: 60000    // 增加空闲连接的超时时间
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true // 更安全的设置
    }
  }
});

const testConnection = async () => {
  try {
    console.log('正在测试数据库连接...');
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功！');
    
    // 检查表是否存在
    console.log('正在检查表结构...');
    
    const tables = ['users', 'bookmarks', 'categories'];
    for (const tableName of tables) {
      try {
        const tableInfo = await sequelize.getQueryInterface().describeTable(tableName);
        console.log(`✓ 表 '${tableName}' 存在 (${Object.keys(tableInfo).length} 个字段)`);
      } catch (error) {
        console.log(`⚠ 表 '${tableName}' 不存在或无法访问`);
      }
    }
    
    console.log('\n✓ 数据库连接测试完成！');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ 数据库连接失败:', error.message);
    
    if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42P01') {
      console.error('  这意味着数据库表不存在 - 需要先运行数据库初始化');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('  这意味着数据库服务器无法连接 - 检查数据库服务是否运行');
    }
    
    await sequelize.close();
    process.exit(1);
  }
};

testConnection();