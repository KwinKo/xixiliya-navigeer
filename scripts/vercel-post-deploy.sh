#!/bin/bash
# Vercel 部署后执行的脚本 - 初始化数据库

echo "开始执行 Vercel 部署后初始化脚本..."

# 检查是否在 Vercel 环境中
if [ "$VERCEL_ENV" != "" ]; then
    echo "检测到 Vercel 环境: $VERCEL_ENV"
    
    # 安装依赖（如果需要）
    echo "安装项目依赖..."
    npm install
    
    # 运行数据库初始化
    echo "初始化数据库表结构..."
    
    # 编译 TypeScript
    npx tsc scripts/vercel-deploy-hook.ts --outDir dist/scripts --target es2020 --module commonjs
    
    # 运行初始化脚本
    node dist/scripts/vercel-deploy-hook.js
    
    if [ $? -eq 0 ]; then
        echo "数据库初始化成功！"
    else
        echo "数据库初始化失败，继续部署..."
        # 即使初始化失败也继续，因为这可能只是首次部署的问题
    fi
else
    echo "非 Vercel 环境，跳过数据库初始化"
fi

echo "Vercel 部署后初始化脚本执行完成"