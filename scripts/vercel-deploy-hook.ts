/**
 * Vercel 部署钩子 - 用于初始化数据库表结构
 * 此脚本在部署后运行，确保数据库表结构正确
 */

import { initializeDb } from '../api/_lib/db-manager.js';

async function initializeDatabase() {
  try {
    console.log('开始同步数据库表结构...');
    
    // 使用增强的数据库初始化函数
    await initializeDb();
    
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