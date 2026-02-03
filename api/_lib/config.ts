import { Sequelize } from 'sequelize';
import pg from 'pg';

// 数据库配置 - 优化用于 Vercel 和 Neon
const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  dialectModule: pg,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 1, // Serverless 环境优化：减少连接池大小
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

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    // 在生产环境中，不抛出错误以避免影响其他功能
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
  }
};

// 环境变量配置
const config = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5174'
};

export { sequelize, testConnection, config };
export default sequelize;