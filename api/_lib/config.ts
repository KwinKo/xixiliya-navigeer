import { Sequelize } from 'sequelize';
import pg from 'pg';

// 数据库配置
const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  dialectModule: pg,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 1, // Serverless 环境下建议设为 1，避免连接数爆炸
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

// 环境变量配置
const config = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

export { sequelize, testConnection, config };
export default sequelize;
