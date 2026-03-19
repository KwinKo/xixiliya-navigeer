# Xixiliya Navigeer

一个现代化的个人书签导航应用程序，使用 Next.js App Router 和 Neon PostgreSQL 数据库构建，支持个性化设置、公开页面分享等功能。

## 技术栈

- **框架**: Next.js 16.1.6 (App Router)
- **数据库**: Neon (PostgreSQL) / pg
- **样式**: Tailwind CSS 3.4.1
- **UI 组件**: Radix UI
- **图标**: Lucide React, FontAwesome
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **部署**: Vercel

## 功能特性

- 用户认证（注册、登录、登出、密码重置）
- 书签管理（添加、编辑、删除、搜索）
- 分类管理（创建、删除、筛选）
- 公开页面分享（支持自定义域名）
- 个性化设置（背景、粒子效果、卡片样式）
- 数据管理（导出、导入）
- 多语言支持（中文/英文）
- 响应式设计（桌面/移动端）
- 管理员面板

## 项目结构

```
xixiliya-navigeer-deploy/
├── .env.example                    # 环境变量示例
├── .env.local                      # 本地环境变量（不提交到git）
├── .gitignore                      # Git忽略文件
├── next.config.ts                  # Next.js配置
├── package.json                    # 项目依赖和脚本
├── postcss.config.ts               # PostCSS配置
├── tailwind.config.ts              # Tailwind CSS配置
├── tsconfig.json                   # TypeScript配置
├── README.md                       # 项目说明文档
│
├── src/
│   ├── app/                        # Next.js App Router目录
│   │   ├── [username]/             # 动态用户公开页面
│   │   │   └── page.tsx            # 公开页面组件
│   │   │
│   │   ├── admin/                  # 管理员面板
│   │   │   └── page.tsx            # 管理员页面
│   │   │
│   │   ├── api/                    # API路由
│   │   │   ├── admin/
│   │   │   │   └── users/
│   │   │   │       └── route.ts    # 管理员用户管理API
│   │   │   │
│   │   │   ├── auth/               # 认证相关API
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts    # 用户登录API
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.ts    # 用户登出API
│   │   │   │   ├── refresh/
│   │   │   │   │   └── route.ts    # Token刷新API
│   │   │   │   └── register/
│   │   │   │       └── route.ts    # 用户注册API
│   │   │   │
│   │   │   ├── bookmark-tags/      # 书签标签API
│   │   │   │   └── route.ts
│   │   │   │
│   │   │   ├── bookmarks/          # 书签管理API
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts    # 单个书签操作API
│   │   │   │   ├── user/
│   │   │   │   │   └── [username]/
│   │   │   │   │       └── route.ts # 用户书签API
│   │   │   │   └── route.ts        # 书签列表API
│   │   │   │
│   │   │   ├── categories/         # 分类管理API
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts    # 单个分类操作API
│   │   │   │   ├── user/
│   │   │   │   │   └── [username]/
│   │   │   │   │       └── route.ts # 用户分类API
│   │   │   │   └── route.ts        # 分类列表API
│   │   │   │
│   │   │   ├── check-password/     # 密码检查API
│   │   │   │   └── route.ts
│   │   │   │
│   │   │   ├── data/               # 数据管理API
│   │   │   │   ├── export/
│   │   │   │   │   └── route.ts    # 数据导出API
│   │   │   │   ├── import/
│   │   │   │   │   └── route.ts    # 数据导入API
│   │   │   │   └── stats/
│   │   │   │       └── route.ts    # 统计数据API
│   │   │   │
│   │   │   ├── db-test/            # 数据库测试API
│   │   │   │   └── route.ts
│   │   │   │
│   │   │   ├── tags/               # 标签管理API
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   │
│   │   │   ├── test-users/         # 测试用户API
│   │   │   │   └── route.ts
│   │   │   │
│   │   │   └── users/              # 用户管理API
│   │   │       ├── [username]/
│   │   │       │   └── route.ts    # 用户信息API
│   │   │       ├── me/
│   │   │       │   └── route.ts    # 当前用户信息API
│   │   │       └── route.ts        # 用户列表API
│   │   │
│   │   ├── changepassword/         # 修改密码页面
│   │   │   └── page.tsx
│   │   │
│   │   ├── dashboard/              # 仪表盘页面
│   │   │   └── page.tsx            # 主仪表盘组件
│   │   │
│   │   ├── db-test/                # 数据库测试页面
│   │   │   └── page.tsx
│   │   │
│   │   ├── deleteaccount/          # 删除账户页面
│   │   │   └── page.tsx
│   │   │
│   │   ├── forgotpassword/         # 忘记密码页面
│   │   │   └── page.tsx
│   │   │
│   │   ├── login/                  # 登录页面
│   │   │   └── page.tsx
│   │   │
│   │   ├── public/                 # 公开页面
│   │   │   └── page.tsx            # 公开页面组件
│   │   │
│   │   ├── register/               # 注册页面
│   │   │   └── page.tsx
│   │   │
│   │   ├── settings/               # 设置页面
│   │   │   ├── actions.ts          # 设置相关操作
│   │   │   └── page.tsx            # 设置页面组件
│   │   │
│   │   ├── Providers.tsx           # React Context提供者
│   │   ├── error.tsx               # 错误页面
│   │   ├── globals.css             # 全局样式
│   │   ├── layout.tsx              # 根布局
│   │   ├── loading.tsx             # 加载页面
│   │   ├── metadata.ts             # 元数据配置
│   │   ├── middleware.ts           # 中间件
│   │   └── page.tsx                # 首页
│   │
│   ├── components/                 # React组件
│   │   ├── particles/              # 粒子效果组件
│   │   │   └── index.tsx
│   │   │
│   │   ├── ui/                     # UI基础组件
│   │   │   ├── alert-dialog-example.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   │
│   │   ├── BackToTopButton.tsx     # 返回顶部按钮
│   │   ├── Navbar.tsx              # 导航栏组件
│   │   └── PublicMenuButton.tsx    # 公开菜单按钮
│   │
│   ├── contexts/                   # React Context
│   │   └── LanguageContext.tsx     # 语言切换上下文
│   │
│   ├── hooks/                      # 自定义Hooks
│   │   └── use-mobile.ts           # 移动端检测Hook
│   │
│   ├── i18n/                       # 国际化
│   │   └── index.ts                # 语言翻译文件
│   │
│   ├── lib/                        # 工具库
│   │   ├── auth.ts                 # 认证工具
│   │   ├── db.ts                   # 数据库连接
│   │   ├── migration-add-columns.sql # 数据库迁移脚本
│   │   ├── run-migration.ts        # 运行迁移脚本
│   │   ├── standard-schema.sql     # 标准数据库结构
│   │   └── utils.ts                # 通用工具函数
│   │
│   ├── services/                   # 服务层
│   │   └── api.ts                  # API服务封装
│   │
│   └── types/                      # TypeScript类型定义
│       └── index.ts                # 类型定义文件
│
├── public/                         # 静态资源目录
└── node_modules/                   # 依赖包（不提交到git）
```

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local` 并填入实际值：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：

```env
# 数据库连接
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/navigeer?schema=public"

# JWT 密钥
JWT_SECRET="your_jwt_secret_here"

# 环境标识
NODE_ENV="development"
```

### 3. 配置数据库

确保你已经创建了 PostgreSQL 数据库，然后运行数据库迁移：

```bash
# 如果使用本地PostgreSQL
psql -U postgres -c "CREATE DATABASE navigeer;"

# 运行标准数据库结构
psql -U postgres -d navigeer -f src/lib/standard-schema.sql

# 运行迁移脚本（如果需要）
psql -U postgres -d navigeer -f src/lib/migration-add-columns.sql
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 访问应用

打开浏览器访问：`http://localhost:3000`

## 环境变量说明

| 变量名 | 说明 | 必需 | 示例 |
|--------|------|------|------|
| `DATABASE_URL` | PostgreSQL数据库连接字符串 | 是 | `postgresql://postgres:password@localhost:5432/navigeer` |
| `JWT_SECRET` | JWT签名密钥 | 是 | `your_secret_key_here` |
| `NODE_ENV` | 运行环境 | 否 | `development` / `production` |

## 数据库结构

### users 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| username | text | 用户名（唯一） |
| email | text | 邮箱（唯一） |
| password | text | 密码（bcrypt加密） |
| role | text | 角色（user/admin） |
| bookmarkLimit | integer | 书签上限 |
| disabled | boolean | 是否禁用 |
| siteName | text | 站点名称 |
| siteDesc | text | 站点描述 |
| bgMode | text | 背景模式（gradient/color/image） |
| bgColor | text | 背景颜色 |
| bgImage | text | 背景图片URL |
| enableParticles | boolean | 是否启用粒子效果 |
| particleStyle | text | 粒子样式 |
| particleColor | text | 粒子颜色 |
| cardColor | text | 卡片颜色 |
| cardOpacity | integer | 卡片透明度 |
| cardTextColor | text | 卡片文字颜色 |
| enableMinimalMode | boolean | 是否启用极简模式 |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |

### bookmarks 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| userId | integer | 用户ID（外键） |
| title | text | 书签标题 |
| url | text | 书签URL |
| description | text | 书签描述 |
| icon | text | 图标（emoji或图标名） |
| categoryId | integer | 分类ID（外键） |
| isPublic | boolean | 是否公开 |
| createdAt | timestamp | 创建时间 |

### categories 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| userId | integer | 用户ID（外键） |
| name | text | 分类名称 |

## API 路由

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新Token

### 用户相关

- `GET /api/users` - 获取所有用户（管理员）
- `GET /api/users/me` - 获取当前用户信息
- `GET /api/users/[username]` - 获取指定用户信息

### 书签相关

- `GET /api/bookmarks` - 获取书签列表
- `POST /api/bookmarks` - 创建书签
- `GET /api/bookmarks/[id]` - 获取单个书签
- `PUT /api/bookmarks/[id]` - 更新书签
- `DELETE /api/bookmarks/[id]` - 删除书签
- `GET /api/bookmarks/user/[username]` - 获取用户书签（公开）

### 分类相关

- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `GET /api/categories/[id]` - 获取单个分类
- `PUT /api/categories/[id]` - 更新分类
- `DELETE /api/categories/[id]` - 删除分类
- `GET /api/categories/user/[username]` - 获取用户分类（公开）

### 数据管理

- `GET /api/data/export` - 导出数据
- `POST /api/data/import` - 导入数据
- `GET /api/data/stats` - 获取统计数据

### 管理员

- `GET /api/admin/users` - 获取所有用户（管理员）
- `PUT /api/admin/users` - 更新用户信息（管理员）

## 页面路由

| 路由 | 说明 | 认证 |
|------|------|------|
| `/` | 首页 | 否 |
| `/login` | 登录页面 | 否 |
| `/register` | 注册页面 | 否 |
| `/dashboard` | 仪表盘 | 是 |
| `/settings` | 设置页面 | 是 |
| `/admin` | 管理员面板 | 是（管理员） |
| `/[username]` | 用户公开页面 | 否 |
| `/changepassword` | 修改密码 | 是 |
| `/forgotpassword` | 忘记密码 | 否 |
| `/deleteaccount` | 删除账户 | 是 |

## 部署到 Vercel

### 方法一：一键部署

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/xixiliya-navigeer)

### 方法二：手动部署

1. 安装 Vercel CLI：

```bash
npm i -g vercel
```

2. 登录 Vercel：

```bash
vercel login
```

3. 部署项目：

```bash
vercel
```

4. 在 Vercel 项目设置中配置环境变量：
   - `DATABASE_URL`: Neon 数据库连接字符串
   - `JWT_SECRET`: 用于 JWT 签名的密钥

## 开发脚本

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 运行代码检查
npm run lint
```

## 常见问题

### 1. 数据库连接失败

确保 `DATABASE_URL` 环境变量正确配置，并且数据库服务正在运行。

### 2. JWT 错误

确保 `JWT_SECRET` 环境变量已设置，并且在生产环境中使用强密钥。

### 3. 样式不生效

确保已安装所有依赖，并且 Tailwind CSS 配置正确。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
