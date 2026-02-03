/**
 * 数据库连接管理器 - 专为 Vercel Serverless Functions 优化
 * 解决连接超时和未处理的拒绝错误
 */

import { sequelize } from './config.js';
import { User, Bookmark, Category } from './models.js';

// 重试机制
const withRetry = async <T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.log(`Database operation attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // 指数退避
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
  }
  
  throw lastError;
};

// 安全的数据库操作包装器
const safeDbOperation = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    return await withRetry(operation, 3);
  } catch (error) {
    console.error('Database operation failed after retries:', error);
    throw error;
  }
};

// 初始化数据库连接
const initializeDb = async () => {
  try {
    // 测试连接
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // 同步模型（在生产环境中谨慎使用）
    // await sequelize.sync({ alter: true });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// 预连接数据库（有助于减少冷启动时间）
const connectDb = async () => {
  try {
    // 确保连接池已初始化
    await sequelize.authenticate();
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

// 导出工具函数
export {
  safeDbOperation,
  initializeDb,
  connectDb,
  User,
  Bookmark,
  Category
};

// 导出默认的 sequelize 实例
export default sequelize;