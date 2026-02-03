/**
 * 为 Vercel Serverless Functions 优化的数据库配置
 * 使用 Neon 数据库连接的最佳实践
 */

import { Sequelize } from 'sequelize';
import pg from 'pg';

// 创建数据库连接实例
const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  dialectModule: pg,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 1, // Serverless 环境下减少连接池，避免连接过多
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Neon 数据库必需设置
    }
  }
});

// 测试数据库连接的函数
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Neon 数据库连接成功');
  } catch (error) {
    console.error('Neon 数据库连接失败:', error);
    throw error;
  }
};

// 导出配置
const config = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5174'
};

export { sequelize, testConnection, config };
export default sequelize;