# Navigeer - 个人书签导航系统

<p align="center">
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20bookmark%20navigation%20app%20interface%20with%20gradient%20background%20and%20glass%20cards&image_size=landscape_16_9" alt="Navigeer 界面展示" width="800">
</p>

## 项目介绍

Navigeer 是一个现代化的个人书签导航系统，帮助用户管理和分享个人书签，支持自定义主题、分类管理、公开分享等功能。

### 核心功能

- 📁 **书签管理**：添加、编辑、删除书签，支持分类管理
- 🔗 **公开分享**：生成个人公开页面，分享书签给他人
- 🎨 **自定义主题**：支持渐变、纯色、图片背景，自定义卡片样式和字体颜色
- 🌟 **粒子效果**：多种粒子动画效果，提升视觉体验
- 🌐 **多语言支持**：中英文切换
- 🔒 **用户认证**：JWT 认证，安全可靠
- 📱 **响应式设计**：适配桌面和移动设备
- 💾 **数据导入导出**：支持 JSON 格式备份和恢复

## 技术栈

### 前端
- React 19.2.0 + TypeScript
- Vite 7.2.4
- Tailwind CSS
- React Router
- Font Awesome

### 后端
- Node.js 18 + Express 4.19.2
- TypeScript
- PostgreSQL
- Sequelize 6.35.2
- JWT 认证

## 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 14+
- npm 或 yarn

### 安装步骤

#### 1. 克隆项目
```bash
git clone https://github.com/xixiliya/navigeer.git
cd navigeer
```

#### 2. 配置数据库
- 启动 PostgreSQL 服务
- 创建数据库和用户
```sql
CREATE DATABASE navigeer_db;
CREATE USER navigeer_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE navigeer_db TO navigeer_user;
ALTER USER navigeer_user WITH SUPERUSER;
```

#### 3. 后端设置
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填写数据库连接信息和端口设置
# PORT=3001
# DATABASE_URL=postgresql://navigeer_user:your_secure_password@localhost:5432/navigeer_db

# 编译 TypeScript
npm run build

# 启动开发服务器
npm run dev
```

#### 4. 前端设置
```bash
# 回到项目根目录
cd ..

# 安装依赖
npm install

# 启动开发服务器
npm run dev:frontend
```

### 访问项目
- 前端：http://localhost:5174
- 后端 API：http://localhost:3001/api
- 健康检查：http://localhost:3001/api/health

## 项目结构

### 前端
```
src/
├── components/       # 通用组件
│   ├── particles/    # 粒子效果组件
│   └── ui/           # UI 组件
├── hooks/            # 自定义 hooks
├── i18n/             # 国际化
├── lib/              # 工具库
├── pages/            # 页面组件
├── services/         # API 服务
├── types/            # TypeScript 类型
├── App.css           # 应用样式
├── App.tsx           # 应用主组件
├── index.css         # 全局样式
└── main.tsx          # 应用入口
```

### 后端
```
backend/
├── dist/             # 编译输出目录
├── src/              # 源代码目录
│   ├── config/       # 配置文件
│   ├── controllers/  # 控制器
│   ├── middlewares/  # 中间件
│   ├── models/       # Sequelize 模型
│   ├── routes/       # 路由
│   ├── types/        # TypeScript 类型
│   ├── utils/        # 工具函数
│   ├── app.ts        # Express 应用
│   ├── seed.ts       # 数据库种子
│   └── server.ts     # 服务器入口
├── .env              # 环境变量
├── package.json      # 后端依赖
└── tsconfig.json     # TypeScript 配置
```

## 核心功能使用

### 1. 书签管理
- **添加书签**：点击 "添加书签" 按钮，填写标题、URL、描述等信息
- **编辑书签**：点击书签卡片上的编辑按钮，修改信息后保存
- **删除书签**：点击书签卡片上的删除按钮，确认后删除
- **分类管理**：点击 "添加分类" 按钮创建分类，编辑书签时选择分类

### 2. 公开分享
- 每个用户自动生成唯一的公开页面 URL：`http://localhost:5174/public/:username`
- 在书签编辑页面，勾选 "公开" 选项，该书签会显示在公开页面
- 公开页面支持搜索和分类筛选

### 3. 主题设置
- 进入 "设置" 页面，选择背景模式（渐变、纯色、图片）
- 调整卡片颜色、透明度和字体颜色
- 开启粒子效果，选择粒子样式和颜色
- 支持 "极简模式"，提供简洁的白色主题

### 4. 数据管理
- **导出数据**：点击 "导出" 按钮，下载 JSON 格式的备份文件
- **导入数据**：点击 "导入" 按钮，选择备份文件恢复数据

## API 文档

### 认证相关
- `POST /api/auth/register` - 注册新用户
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新令牌
- `POST /api/auth/forgot-password` - 忘记密码
- `POST /api/auth/reset-password` - 重置密码

### 用户相关
- `GET /api/users/me` - 获取当前用户信息
- `PUT /api/users/me` - 更新用户信息
- `PUT /api/users/me/password` - 修改密码
- `DELETE /api/users/me` - 删除账户

### 书签相关
- `GET /api/bookmarks` - 获取用户书签
- `POST /api/bookmarks` - 创建新书签
- `PUT /api/bookmarks/:id` - 更新书签
- `DELETE /api/bookmarks/:id` - 删除书签
- `GET /api/bookmarks/public/:username` - 获取用户公开书签

### 分类相关
- `GET /api/categories` - 获取用户分类
- `POST /api/categories` - 创建新分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类
- `GET /api/categories/public/:username` - 获取用户公开分类

### 数据相关
- `GET /api/data/export` - 导出用户数据
- `POST /api/data/import` - 导入用户数据
- `GET /api/data/stats` - 获取用户统计信息

### 管理相关
- `GET /api/admin/users` - 获取所有用户（管理员）
- `PUT /api/admin/users/:id` - 更新用户状态（管理员）
- `DELETE /api/admin/users/:id` - 删除用户（管理员）

## 部署指南

### 1. Vercel 部署

#### 前端部署
1. 登录 Vercel 账户
2. 点击 "New Project"，选择从 GitHub 导入
3. 选择 `xixiliya/navigeer` 仓库
4. 配置构建选项：
   - Framework: React
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: 添加 `API_BASE_URL` 指向后端 API 地址
5. 点击 "Deploy" 部署前端

#### 后端部署（Serverless Functions）
1. 在项目根目录创建 `api` 文件夹
2. 复制后端代码到 `api` 目录
3. 配置 `vercel.json` 文件：
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```
4. 配置环境变量，包括数据库连接信息
5. 部署到 Vercel

### 2. Neon 数据库配置

1. 访问 Neon 官网，创建新的数据库项目
2. 获取数据库连接字符串
3. 在后端环境变量中配置：
```
DATABASE_URL=postgresql://username:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/navigeer_db
```
4. 确保 Sequelize 配置正确处理 SSL 连接

### 3. 传统部署

#### 使用 Caddy 作为 Web 服务器
```caddyfile
# Caddyfile 配置
your-domain.com {
    root * /path/to/frontend/dist
    file_server
    try_files {path} /index.html
}

api.your-domain.com {
    reverse_proxy localhost:3001
}
```

#### 使用 systemd 管理后端服务
```ini
# /etc/systemd/system/navigeer-backend.service
[Unit]
Description=Navigeer Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend
ExecStart=/usr/bin/node dist/server.js
Environment=NODE_ENV=production
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

#### 启动服务
```bash
sudo systemctl daemon-reload
sudo systemctl start navigeer-backend
sudo systemctl enable navigeer-backend
sudo systemctl restart caddy
```

## 开发指南

### 代码规范
- 使用 TypeScript 类型定义
- 遵循 ESLint 规则
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case

### 提交规范
- `feat`：新功能
- `fix`：修复 bug
- `docs`：文档更新
- `style`：代码风格调整
- `refactor`：代码重构
- `test`：测试相关
- `chore`：构建或依赖更新

### 开发命令
- `npm run dev:frontend` - 启动前端开发服务器
- `npm run dev:backend` - 启动后端开发服务器
- `npm run build` - 构建生产版本
- `npm run lint` - 代码 lint 检查
- `npm run typecheck` - TypeScript 类型检查

## 安全注意事项

- 生产环境中修改 JWT 密钥
- 生产环境中限制数据库用户权限
- 生产环境中使用 HTTPS
- 定期备份数据库
- 使用环境变量存储敏感信息，不要硬编码

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 联系方式

- 作者：KwinKo
- 邮箱：admin@navigeer.com
- 项目地址：https://github.com/xixiliya/navigeer

---

<p align="center">
  <small>Made with ❤️ by KwinKo</small>
</p>