/**
 * 增强型数据库连接管理器 - 专为 Vercel Serverless Functions 优化
 * 包含自动表创建和错误处理功能
 */

import { sequelize } from './config.js';
import { User, Bookmark, Category } from './models.js';

// 检查表是否存在的工具函数
const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    await sequelize.getQueryInterface().describeTable(tableName);
    return true;
  } catch (error: any) {
    if (error.parent?.code === '42P01') { // 表不存在错误
      return false;
    }
    throw error;
  }
};

// 创建所有必需的表
const createRequiredTables = async (): Promise<void> => {
  console.log('检查数据库表结构...');
  
  // 检查并创建用户表
  const usersTableExists = await checkTableExists('users');
  if (!usersTableExists) {
    console.log('用户表不存在，正在创建...');
    await User.sync({ force: false });
    console.log('用户表创建成功');
  }
  
  // 检查并创建分类表
  const categoriesTableExists = await checkTableExists('categories');
  if (!categoriesTableExists) {
    console.log('分类表不存在，正在创建...');
    await Category.sync({ force: false });
    console.log('分类表创建成功');
  }
  
  // 检查并创建书签表
  const bookmarksTableExists = await checkTableExists('bookmarks');
  if (!bookmarksTableExists) {
    console.log('书签表不存在，正在创建...');
    await Bookmark.sync({ force: false });
    console.log('书签表创建成功');
  }
  
  console.log('数据库表结构检查完成');
};

// 重试机制
const withRetry = async <T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.log(`数据库操作尝试 ${attempt} 失败:`, error);
      
      if (attempt < maxRetries) {
        // 指数退避
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
  }
  
  throw lastError;
};

// 在操作前自动创建缺失的表
const withTableAutoCreate = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    // 检查并创建缺失的表
    await createRequiredTables();
    
    // 执行原始操作
    return await operation();
  } catch (error: any) {
    // 如果是表不存在错误，尝试重新创建表后重试
    if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42P01') {
      console.log('检测到表不存在错误，正在重新创建表...');
      await createRequiredTables();
      return await operation();
    }
    
    throw error;
  }
};

// 安全的数据库操作包装器（包含自动表创建和重试）
const safeDbOperation = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    return await withRetry(async () => {
      return await withTableAutoCreate(operation);
    }, 3);
  } catch (error) {
    console.error('数据库操作失败:', error);
    throw error;
  }
};

// 初始化数据库连接（主要用于部署时调用）
const initializeDb = async () => {
  try {
    // 测试连接
    await sequelize.authenticate();
    console.log('数据库连接建立成功');
    
    // 创建所有必需的表
    await createRequiredTables();
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

// 预连接数据库（有助于减少冷启动时间）
const connectDb = async () => {
  try {
    // 确保连接池已初始化
    await sequelize.authenticate();
  } catch (error) {
    console.error('数据库连接失败:', error);
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