# Vercel + Neon 数据库部署指南

本指南将帮助您解决 Vercel 部署后 API 和 Neon 数据库联动的问题。

## 问题原因分析

### 1. 双后端架构
项目同时包含：
- `backend/`：传统 Express 服务器（本地开发用）
- `api/`：Vercel Serverless Functions（生产部署用）

### 2. 数据库连接问题
- Serverless 环境下的数据库连接池管理
- 环境变量配置不正确
- SSL 连接设置
- 未处理的拒绝错误

### 3. API 路径映射
- 前端 API 调用路径与 Vercel 函数路径不匹配

## 解决方案

### 1. 配置 Vercel 环境变量

在 Vercel 项目设置中添加以下环境变量：

```bash
# Neon 数据库连接字符串 (确保使用 sslmode=verify-full 以获得更强的安全性)
DATABASE_URL="postgresql://[username]:[password]@[region].aws.neon.tech/navigeer?sslmode=verify-full"

# JWT 密钥（请使用强密钥）
JWT_SECRET="your-very-secure-jwt-secret-key-change-this-in-production"

# CORS 配置
CORS_ORIGIN="https://your-project-name.vercel.app"

# 节点环境
NODE_ENV="production"
```

### 2. 确保数据库表结构同步

由于 Serverless 函数每次请求都是独立的，需要确保数据库表已存在。可以考虑以下方法：

#### 方法一：在函数启动时同步（不推荐用于生产）
在 `_lib/models.ts` 中添加表同步逻辑（仅用于开发）

#### 方法二：使用 Vercel 部署钩子
在部署后运行数据库同步脚本

### 3. 优化数据库连接 (已更新)

项目已更新 `api/_lib/config.ts` 以优化 Serverless 环境下的数据库连接：

```typescript
// 确保 DATABASE_URL 包含正确的 SSL 模式
const getDatabaseUrl = () => {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl) return dbUrl;
  
  // 检查 URL 是否已包含 sslmode 参数
  const hasSslMode = dbUrl.includes('sslmode=') || dbUrl.includes('ssl-mode=');
  if (!hasSslMode) {
    // 如果没有 sslmode 参数，添加 verify-full（更安全的选项）
    return `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}sslmode=verify-full`;
  }
  
  return dbUrl;
};

const sequelize = new Sequelize(getDatabaseUrl(), {
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
```

### 4. 修复未处理的拒绝错误 (已更新)

项目已更新 `api/auth/login.ts` 和 `api/auth/register.ts` 以修复未处理的拒绝错误：

- 使用 `safeDbOperation` 包装数据库操作
- 改进错误处理机制
- 添加重试逻辑

### 4. Vercel 配置优化

确保 `vercel.json` 文件配置正确：

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@5.5.28"
    }
  }
}
```

### 5. 部署步骤

1. **准备阶段**
   - 确保本地代码已提交到 GitHub
   - 在 Neon 控制台获取数据库连接字符串

2. **Vercel 项目配置**
   - 导入 GitHub 仓库到 Vercel
   - 设置环境变量
   - 确保构建命令正确：
     - Build Command: `npm run build` 
     - Output Directory: `dist` (如果前端构建需要)

3. **数据库初始化**
   - 首次部署后，可能需要手动在 Neon 中运行数据库迁移
   - 或者使用 Prisma/Sequelize 的迁移功能

4. **测试阶段**
   - 部署完成后测试注册/登录功能
   - 验证数据库读写操作

## 常见问题排查

### 1. 数据库连接超时
- 检查 `DATABASE_URL` 是否正确
- 确认 Neon 数据库的 SSL 设置

### 2. CORS 错误
- 检查 `CORS_ORIGIN` 环境变量
- 确保前端使用正确的 API 基础 URL

### 3. JWT 认证失败
- 验证 `JWT_SECRET` 是否一致
- 检查令牌生成和验证逻辑

### 4. API 路由 404 错误
- 确认 `vercel.json` 重写规则
- 检查函数文件命名和路径

### 5. 部署错误
- 检查 Runtime 版本是否正确（@vercel/node@5.5.28）
- 确认函数模式匹配正确

### 6. SSL 模式警告
- 确保 `DATABASE_URL` 包含 `sslmode=verify-full`
- 使用更安全的 `rejectUnauthorized: true` 设置

### 7. 未处理的拒绝错误
- 确认数据库操作被适当的错误处理包装
- 使用 `safeDbOperation` 包装所有数据库查询
- 检查登录和注册 API 的错误处理逻辑

## 性能优化建议

1. **数据库连接优化**
   - 使用连接池管理
   - 在 Serverless 环境中使用较小的连接池（max: 1）

2. **缓存策略**
   - 对于频繁读取的数据使用缓存
   - 考虑使用 Vercel KV 或其他缓存服务

3. **函数优化**
   - 减少冷启动时间
   - 优化依赖包大小

## 部署验证清单

- [ ] 数据库连接字符串正确配置（包含 sslmode=verify-full）
- [ ] JWT 密钥设置正确
- [ ] CORS 配置正确
- [ ] API 路由重写正常
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 数据库读写正常
- [ ] 前端与后端通信正常
- [ ] Neon SSL 连接设置正确
- [ ] Serverless 函数运行时版本正确
- [ ] 数据库连接池大小优化
- [ ] 未处理的拒绝错误已修复
- [ ] 所有 API routes 有适当的错误处理
- [ ] 数据库操作使用安全包装器