/**
 * Vercel 部署钩子 - 用于初始化数据库表结构
 * 此脚本在部署后运行，确保数据库表结构正确
 */

import { sequelize } from '../api/_lib/config.js';
import { User, Bookmark, Category } from '../api/_lib/models.js';

async function initializeDatabase() {
  try {
    console.log('开始同步数据库表结构...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 同步模型（创建或更新表结构）
    await sequelize.sync({
      alter: true, // 自动更新表结构，但保留现有数据
      // 注意：在生产环境中谨慎使用 force: true，因为它会删除现有数据
    });
    
    console.log('数据库表结构同步完成');
    
    // 验证表是否创建成功
    const userTable = await sequelize.getQueryInterface().describeTable('users');
    const bookmarkTable = await sequelize.getQueryInterface().describeTable('bookmarks');
    const categoryTable = await sequelize.getQueryInterface().describeTable('categories');
    
    console.log('用户表结构:', Object.keys(userTable));
    console.log('书签表结构:', Object.keys(bookmarkTable));
    console.log('分类表结构:', Object.keys(categoryTable));
    
    console.log('数据库初始化成功！');
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

// 只在直接运行此脚本时执行
if (typeof require !== 'undefined' && require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };