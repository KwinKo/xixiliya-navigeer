'use client';

import type { User } from '@/types';
import type { Translations } from '@/i18n';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicMenuButton from '@/components/PublicMenuButton';

import { TRANSLATIONS } from '@/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

export interface NavbarProps {
  // 移除 props，让组件自己管理状态
}

export default function Navbar({}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  const [SearchIcon, setSearchIcon] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const translations: Translations = TRANSLATIONS[lang === 'zh' ? 'zh' : 'en'];
  
  const handleLangChange = (value: 'zh' | 'en') => {
    setLang(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 执行搜索功能
      console.log('Searching for:', searchQuery);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // 获取当前路径，用于高亮菜单项
  const isActive = (path: string) => pathname === path;

  // 初始化为false，避免hydration错误
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // 检测是否在登录或注册页面
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  
  // 从 localStorage 获取 token 并获取用户信息
  const fetchUser = async (skipCache: boolean = false) => {
    if (typeof window !== 'undefined' && !isFetching && !isAuthPage) {
      const token = localStorage.getItem('navigeer_access_token');
      if (!token) {
        setUser(null);
        return;
      }

      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 创建新的 AbortController
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsFetching(true);
      try {
        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else if (response.status === 401) {
          // Token 无效，清除 localStorage 中的 token
          localStorage.removeItem('navigeer_access_token');
          localStorage.removeItem('navigeer_current_user');
          setUser(null);
        }
      } catch (error) {
        // 忽略 AbortError（请求被取消）
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Fetch request was aborted');
          return;
        }
        // 忽略网络错误（可能是页面切换导致的）
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.log('Network error, possibly due to page navigation');
          return;
        }
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setIsFetching(false);
      }
    }
  };

  // 组件挂载时获取用户信息
  useEffect(() => {
    setIsMounted(true);
    fetchUser();

    // 清理函数：组件卸载时取消所有请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    import('lucide-react').then((module) => {
      setSearchIcon(() => module.Search);
    });
  }, []);

  // 监听 localStorage 变化，确保登录后 user 状态能及时更新
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'navigeer_current_user' || e.key === 'navigeer_access_token') {
        fetchUser();
      }
    };

    // 添加存储事件监听器
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);

      // 清理监听器
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  // 登出函数
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // 清除所有可能的 token 存储
      localStorage.removeItem('token');
      localStorage.removeItem('navigeer_access_token');
      localStorage.removeItem('navigeer_refresh_token');
      localStorage.removeItem('navigeer_current_user');
      
      // 清除 cookie 中的 token（多种方式确保清除）
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'navigeer_access_token=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'navigeer_refresh_token=; path=/; max-age=0; SameSite=Lax';
      
      // 设置用户为 null
      setUser(null);
      
      // 使用 replace 跳转，避免用户可以通过浏览器返回按钮回到登录状态
      window.location.replace('/login');
    }
  };

  // 在客户端挂载后检测设备
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      
      // 添加窗口大小变化监听
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <nav className="custom-navbar fixed top-0 left-0 right-0 h-16 bg-transparent backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                XiXiLiYa
              </span>
              <span className="text-white/70 text-sm">Navigeer</span>
            </Link>
          </div>

          
          {/* 搜索框和语言选择器 */}
          <div className="flex items-center gap-4">
            {/* 语言切换按钮 */}
            <button
              onClick={() => handleLangChange(lang === 'zh' ? 'en' : 'zh')}
              className="text-white/80 hover:text-white font-medium px-3 py-2 flex items-center gap-2 transition-colors"
              title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4 opacity-80" />
                <span className="font-medium">{lang === 'zh' ? 'CN' : 'EN'}</span>
              </div>
            </button>

            {/* 桌面端 PublicMenuButton */}
            {!isMobile && (
              <PublicMenuButton 
                isMinimalMode={false} 
                user={user}
                onLogout={handleLogout}
              />
            )}

            {/* 移动端菜单按钮 */}
            {isMobile && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={toggleMobileMenu}
                className="text-white md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6 text-white" aria-hidden="true" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMobile && mobileMenuOpen && (
          <div className="md:hidden">
            <div className="glass-card py-3 px-4 flex flex-col gap-3 shadow-lg rounded-b-xl">

              {user ? (
                <>
                  {user.role === 'admin' && user.username === 'KwinKo' && (
                    <Link
                      href="/admin"
                      className="text-gray-900 hover:text-purple-600 hover:bg-gray-100 font-medium transition-colors py-2 px-3 rounded-lg"
                    >
                      {translations.admin}
                    </Link>
                  )}
                  <Link
                    href={`/${user.username}`}
                    className="text-gray-900 hover:text-purple-600 hover:bg-gray-100 font-medium transition-colors py-2 px-3 rounded-lg"
                  >
                    {translations.public}
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-gray-900 hover:text-purple-600 hover:bg-gray-100 font-medium transition-colors py-2 px-3 rounded-lg"
                  >
                    {translations.dashboard}
                  </Link>
                  <Link
                    href="/settings"
                    className="text-gray-900 hover:text-purple-600 hover:bg-gray-100 font-medium transition-colors py-2 px-3 rounded-lg"
                  >
                    {translations.settings}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);       
                    }}
                    className="text-gray-900 hover:text-purple-600 hover:bg-gray-100 font-medium transition-colors py-2 px-3 rounded-lg text-left w-full"
                  >
                    {translations.logout}
                  </button>
                  
                  {/* 用户信息显示 */}
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600">当前用户: {user.username}</p>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-900 hover:text-purple-600 hover:bg-gray-100 font-medium transition-colors py-2 px-3 rounded-lg"
                  >
                    {translations.login}
                  </Link>
                  <Link href="/register">
                    <Button className="w-full py-2 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700">
                      {translations.register}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}