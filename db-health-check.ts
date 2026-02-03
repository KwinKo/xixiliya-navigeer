/**
 * 数据库健康检查脚本
 * 用于验证数据库连接和表结构是否正常
 */

import { sequelize } from './api/_lib/config.js';
import { User, Bookmark, Category } from './api/_lib/models.js';

const checkDatabaseHealth = async () => {
  try {
    console.log('开始检查数据库健康状态...');
    
    // 1. 测试数据库连接
    console.log('1. 测试数据库连接...');
    await sequelize.authenticate();
    console.log('   ✓ 数据库连接正常');
    
    // 2. 检查表是否存在
    console.log('2. 检查表结构...');
    
    const tablesToCheck = ['users', 'bookmarks', 'categories'];
    for (const tableName of tablesToCheck) {
      try {
        const tableInfo = await sequelize.getQueryInterface().describeTable(tableName);
        console.log(`   ✓ 表 '${tableName}' 存在，包含 ${Object.keys(tableInfo).length} 个字段`);
      } catch (error) {
        console.log(`   ✗ 表 '${tableName}' 不存在或无法访问`);
        throw error;
      }
    }
    
    // 3. 测试基本的数据库操作
    console.log('3. 测试数据库读写操作...');
    
    // 检查用户表是否可以查询
    const userCount = await User.count();
    console.log(`   ✓ 用户表查询正常，当前有 ${userCount} 个用户`);
    
    // 检查书签表是否可以查询
    const bookmarkCount = await Bookmark.count();
    console.log(`   ✓ 书签表查询正常，当前有 ${bookmarkCount} 个书签`);
    
    // 检查分类表是否可以查询
    const categoryCount = await Category.count();
    console.log(`   ✓ 分类表查询正常，当前有 ${categoryCount} 个分类`);
    
    console.log('\n✓ 数据库健康检查通过！');
    console.log('   所有表结构存在，数据库连接正常');
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ 数据库健康检查失败:', error.message);
    
    if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42P01') {
      console.error('\n错误详情：');
      console.error('表不存在错误。请先运行数据库初始化脚本：');
      console.error('npm run db:init');
    }
    
    process.exit(1);
  }
};

// 只在直接运行此脚本时执行
if (typeof require !== 'undefined' && require.main === module) {
  checkDatabaseHealth().catch(error => {
    console.error('健康检查过程出错:', error);
    process.exit(1);
  });
}

export { checkDatabaseHealth };
