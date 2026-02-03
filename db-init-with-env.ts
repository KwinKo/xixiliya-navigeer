/**
 * 环境变量加载器和数据库初始化脚本
 * 使用 dotenv 加载 .env 文件中的环境变量
 */

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db-init-standalone.js';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
const result = config({ path: path.resolve(__dirname, '.env') });

console.log('环境变量加载结果:', result.error ? '失败' : '成功');
console.log('DATABASE_URL 存在:', !!process.env.DATABASE_URL);

if (result.error) {
  console.log('尝试加载 .env 文件...');
  // 尝试从项目根目录加载
  config({ path: path.resolve(__dirname, '../.env') });
}

console.log('最终 DATABASE_URL 存在:', !!process.env.DATABASE_URL);

// 运行数据库初始化
initializeDatabase();