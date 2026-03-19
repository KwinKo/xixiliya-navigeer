import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // 获取 token
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '') ||
                '';

  // 定义需要认证的路径
  const protectedPaths = ['/dashboard', '/settings', '/admin', '/changepassword', '/deleteaccount'];

  // 如果是受保护路径且没有 token，则重定向到登录页
  if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path)) && !token) {
    // 如果当前已经在登录或注册页面，不重定向
    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 允许所有用户访问登录和注册页面，无论是否已登录
  // 移除已登录用户访问登录/注册页面的重定向逻辑

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 只匹配需要认证的页面路径
    '/dashboard/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/changepassword',
    '/deleteaccount',
    '/login',
    '/register',
  ],
};