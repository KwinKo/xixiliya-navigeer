import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL 连接配置
const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// 测试数据库连接
const testConnection = async () => {
  try {
    console.log('Attempting to connect to database...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Provided' : 'Not provided');
    
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    console.log('Connection failed. Starting server without database connection...');
    // 不退出进程，让服务器继续运行
  }
};

export { sequelize, testConnection };
export default sequelize;