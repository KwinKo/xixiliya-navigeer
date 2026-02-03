/**
 * 数据库初始化脚本
 * 用于在 Neon 数据库中创建必要的表结构
 */

import { sequelize } from './api/_lib/config.js';
import { User, Bookmark, Category } from './api/_lib/models.js';

const initializeDatabase = async () => {
  try {
    console.log('开始同步数据库表结构...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 同步模型（创建或更新表结构）
    // 注意：在生产环境中使用 alter: true 是安全的，它会保留现有数据并只修改结构
    await sequelize.sync({
      alter: true, // 自动更新表结构，但保留现有数据
      // 注意：在生产环境中谨慎使用 force: true，因为它会删除现有数据
    });
    
    console.log('数据库表结构同步完成');
    
    // 验证表是否创建成功
    try {
      const userTable = await sequelize.getQueryInterface().describeTable('users');
      const bookmarkTable = await sequelize.getQueryInterface().describeTable('bookmarks');
      const categoryTable = await sequelize.getQueryInterface().describeTable('categories');
      
      console.log('用户表结构:', Object.keys(userTable));
      console.log('书签表结构:', Object.keys(bookmarkTable));
      console.log('分类表结构:', Object.keys(categoryTable));
    } catch (verificationError) {
      console.warn('无法验证表结构，可能是因为表尚未完全创建:', verificationError.message);
    }
    
    console.log('数据库初始化成功！');
    
    // 可选：创建默认用户（仅在开发环境中）
    if (process.env.NODE_ENV !== 'production') {
      const adminUser = await User.findOne({ where: { username: 'admin' } });
      if (!adminUser) {
        await User.create({
          username: 'admin',
          email: 'admin@example.com',
          password: 'Admin123!',
          role: 'admin'
        });
        console.log('创建默认管理员用户: admin');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    
    // 提供更详细的错误信息
    if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42P01') {
      console.error('\n错误详情：');
      console.error('这通常是因为数据库连接URL中指定的数据库不存在或表结构未创建。');
      console.error('请检查以下几点：');
      console.error('1. 确认 DATABASE_URL 中的数据库名称是否正确');
      console.error('2. 确认数据库用户是否有创建表的权限');
      console.error('3. 确认是否已正确运行此初始化脚本');
    }
    
    process.exit(1);
  }
};

// 只在直接运行此脚本时执行
if (typeof require !== 'undefined' && require.main === module) {
  initializeDatabase().catch(error => {
    console.error('初始化过程出错:', error);
    process.exit(1);
  });
}

export { initializeDatabase };