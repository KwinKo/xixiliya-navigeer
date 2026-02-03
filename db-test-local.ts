/**
 * 数据库连接测试脚本（本地开发友好版）
 * 根据环境自动调整 SSL 设置
 */

import { Sequelize } from 'sequelize';
import pg from 'pg';

// 使用与 Vercel 函数中相同的数据库配置逻辑
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:kwinko@localhost:5432/navigeer?schema=public";

// 根据数据库 URL 决定是否使用 SSL
const isNeonDB = DATABASE_URL.includes('neon.tech');
const isLocalhost = DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1');

console.log('数据库URL:', DATABASE_URL.replace(/:([^:@]+)@/, ':***@')); // 隐藏密码
console.log('是否为 Neon 数据库:', isNeonDB);
console.log('是否为本地数据库:', isLocalhost);

// 数据库配置 - 根据环境调整 SSL 设置
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: false, // 关闭日志以减少输出
  pool: {
    max: 1, // Serverless 环境优化：减少连接池大小
    min: 0,
    acquire: 60000, // 增加获取连接的超时时间
    idle: 60000    // 增加空闲连接的超时时间
  },
  dialectOptions: isLocalhost ? {} : { // 本地环境不使用 SSL，生产环境（如 Neon）使用 SSL
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