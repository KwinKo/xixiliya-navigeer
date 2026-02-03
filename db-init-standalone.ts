/**
 * 数据库初始化脚本（独立版本）
 * 用于在 Neon 数据库中创建必要的表结构
 * 此版本直接使用环境变量，不依赖其他配置文件
 */

import { Sequelize } from 'sequelize';
import pg from 'pg';

// 从环境变量获取数据库 URL，如果没有则使用默认值用于测试
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('错误：未设置 DATABASE_URL 环境变量');
  console.log('请确保已创建 .env 文件并包含 DATABASE_URL 配置');
  process.exit(1);
}

// 确保 DATABASE_URL 包含正确的 SSL 模式
const getDatabaseUrl = (dbUrl: string) => {
  if (!dbUrl) return dbUrl;
  
  // 检查 URL 是否已包含 sslmode 参数
  const hasSslMode = dbUrl.includes('sslmode=') || dbUrl.includes('ssl-mode=');
  if (!hasSslMode) {
    // 如果没有 sslmode 参数，添加 verify-full（更安全的选项）
    return `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}sslmode=verify-full`;
  }
  
  return dbUrl;
};

// 数据库配置
const sequelize = new Sequelize(getDatabaseUrl(DATABASE_URL), {
  dialect: 'postgres',
  dialectModule: pg,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 1, // Serverless 环境优化：减少连接池大小
    min: 0,
    acquire: 60000, // 增加获取连接的超时时间
    idle: 60000    // 增加空闲连接的超时时间
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true // 更安全的设置
    }
  }
});

// 导入模型定义
import { DataTypes, Model } from 'sequelize';

// User model
class User extends Model {}
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: 'user',
    },
    bookmarkLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 99,
    },
    disabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    siteName: {
      type: DataTypes.STRING(100),
      defaultValue: 'My Navigation',
    },
    siteDesc: {
      type: DataTypes.TEXT,
      defaultValue: 'Personal bookmark collection',
    },
    bgMode: {
      type: DataTypes.STRING(20),
      defaultValue: 'gradient',
    },
    bgColor: {
      type: DataTypes.STRING(20),
      defaultValue: '#667eea',
    },
    bgImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    enableParticles: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    particleStyle: {
      type: DataTypes.STRING(20),
      defaultValue: 'stars',
    },
    particleColor: {
      type: DataTypes.STRING(20),
      defaultValue: '#ffffff',
    },
    cardColor: {
      type: DataTypes.STRING(20),
      defaultValue: '#ffffff',
    },
    cardOpacity: {
      type: DataTypes.INTEGER,
      defaultValue: 85,
    },
    cardTextColor: {
      type: DataTypes.STRING(20),
      defaultValue: '#333333',
    },
    enableMinimalMode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

// Bookmark model
class Bookmark extends Model {}
Bookmark.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(10),
      defaultValue: '🔗',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'bookmarks',
  }
);

// Category model
class Category extends Model {}
Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'categories',
    indexes: [
      { unique: true, fields: ['userId', 'name'] }
    ]
  }
);

// Set up associations
User.hasMany(Bookmark, { foreignKey: 'userId' });
Bookmark.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Category, { foreignKey: 'userId' });
Category.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(Bookmark, { foreignKey: 'categoryId' });
Bookmark.belongsTo(Category, { foreignKey: 'categoryId' });

const initializeDatabase = async () => {
  try {
    console.log('开始同步数据库表结构...');
    console.log('数据库URL:', DATABASE_URL.replace(/:([^:@]+)@/, ':***@')); // 隐藏密码
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功');
    
    // 同步模型（创建或更新表结构）
    console.log('正在同步表结构...');
    await sequelize.sync({
      alter: true, // 自动更新表结构，但保留现有数据
    });
    
    console.log('✓ 数据库表结构同步完成');
    
    // 验证表是否创建成功
    try {
      const userTable = await sequelize.getQueryInterface().describeTable('users');
      const bookmarkTable = await sequelize.getQueryInterface().describeTable('bookmarks');
      const categoryTable = await sequelize.getQueryInterface().describeTable('categories');
      
      console.log(`✓ 用户表结构: ${Object.keys(userTable).length} 个字段`);
      console.log(`✓ 书签表结构: ${Object.keys(bookmarkTable).length} 个字段`);
      console.log(`✓ 分类表结构: ${Object.keys(categoryTable).length} 个字段`);
    } catch (verificationError) {
      console.warn('⚠ 无法验证表结构:', verificationError.message);
    }
    
    console.log('\n✓ 数据库初始化成功！');
    
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
        console.log('✓ 创建默认管理员用户: admin');
      }
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ 数据库初始化失败:', error.message);
    
    if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42P01') {
      console.error('\n错误详情：');
      console.error('这通常是因为数据库连接URL中指定的数据库不存在或表结构未创建。');
      console.error('请检查以下几点：');
      console.error('1. 确认 DATABASE_URL 中的数据库名称是否正确');
      console.error('2. 确认数据库用户是否有创建表的权限');
      console.error('3. 确认 PostgreSQL 服务是否正在运行');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n错误详情：');
      console.error('无法连接到数据库服务器，请确认：');
      console.error('1. 数据库服务器是否正在运行');
      console.error('2. 连接地址和端口是否正确');
      console.error('3. 网络连接是否正常');
    }
    
    await sequelize.close();
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

export { initializeDatabase, User, Bookmark, Category };