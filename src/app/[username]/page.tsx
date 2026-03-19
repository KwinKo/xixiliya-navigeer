'use client';

import { useParams } from 'next/navigation';
import PublicComponent from '../public/page';

// 这里只是一个代理页面，实际实现位于父目录的page.tsx中
// 动态路由参数通过上下文传递给PublicComponent
export default function PublicUserPage() {
  return <PublicComponent />;
}
