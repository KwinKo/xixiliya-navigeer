'use client';
 
export default function Loading() {
  // 当页面正在加载时显示的组件
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      <span className="ml-3 text-lg text-gray-700">加载中...</span>
    </div>
  );
}