'use client';

import { useState, useMemo, useEffect } from 'react';
import { Menu, X, Home, LayoutDashboard, Settings, UserCog, LogOut, LogIn, UserPlus, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { User } from '@/types';
import { TRANSLATIONS } from '@/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

interface PublicMenuButtonProps {
  isMinimalMode: boolean;
  user?: User | null;
  onLogout?: () => void;
}

const PublicMenuButton: React.FC<PublicMenuButtonProps> = ({ isMinimalMode, user: propUser, onLogout: propOnLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(propUser || null);
  const [isMounted, setIsMounted] = useState(false);
  const { lang } = useLanguage();
  const pathname = usePathname();
  
  // 检测是否在公开页面
  const isPublicPage = pathname.startsWith('/public') || pathname.match(/^\/[^\/]+$/);

  // 检测是否在登录或注册页面
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // 获取翻译
  const t = TRANSLATIONS[lang === 'zh' ? 'zh' : 'en'];

  // 从localStorage获取当前用户
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isAuthPage) return;
    
    if (typeof window !== 'undefined') {
      const fetchUser = () => {
        const userStr = localStorage.getItem('navigeer_current_user');
        const token = localStorage.getItem('navigeer_access_token');
        
        if (token && userStr) {
          try {
            const currentUser = JSON.parse(userStr);
            setUser(currentUser);
          } catch (error) {
            console.error('Failed to parse user from localStorage:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      };

      // 立即获取一次
      fetchUser();

      // 监听storage事件
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'navigeer_current_user' || e.key === 'token') {
          fetchUser();
        }
      };

      window.addEventListener('storage', handleStorageChange);

      // 定期检查机制，确保用户状态及时更新（降低频率到 5 秒）
      const intervalId = setInterval(fetchUser, 5000);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(intervalId);
      };
    }
  }, [isMounted, isAuthPage]);

  // 退出登录处理
  const handleLogout = () => {
    if (propOnLogout !== undefined && propOnLogout !== null) {
      propOnLogout();
    } else if (typeof window !== 'undefined') {
      // 默认退出登录逻辑
      localStorage.removeItem('navigeer_access_token');
      localStorage.removeItem('navigeer_refresh_token');
      localStorage.removeItem('navigeer_current_user');
      setUser(null);
      window.location.href = '/login';
    }
    setIsMenuOpen(false);
  };

  const menuStyle = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      backdropFilter: 'none',
      borderColor: 'transparent',
      color: isMinimalMode ? '#333' : '#fff',
      boxShadow: 'none',
    };
  }, [isMinimalMode]);

  const menuItemStyle = useMemo(() => {
    return {
      backgroundColor: isMinimalMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      borderColor: isMinimalMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)',
      color: isMinimalMode ? '#333' : '#fff',
    };
  }, [isMinimalMode]);

  // 处理菜单项点击，关闭菜单
  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="relative z-50">
      {/* Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={menuStyle}
        className="text-white/80 hover:text-white font-medium px-3 py-2 flex items-center gap-2 transition-colors"
        aria-label="Menu"
      >
        {isMenuOpen ? (
          <X size={20} className="transition-transform duration-300 rotate-90" />
        ) : (
          <Menu size={20} className="transition-transform duration-300" />
        )}
      </button>

      {/* Menu Items */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 rounded-xl overflow-hidden shadow-2xl animate-fadeIn z-50">
          {/* Back to Home */}
          <a
            href="/"
            onClick={handleMenuItemClick}
            style={menuItemStyle}
            className="block w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 border-b last:border-b-0 transform hover:translate-x-1"
          >
            <Home size={16} className="transition-transform duration-200 hover:scale-110" />
            <span>{t.nav.home}</span>
          </a>

          {/* User-specific menu items */}
          {user ? (
            <>
              {/* Public Page */}
              <a
                href={`/${user.username}`}
                onClick={handleMenuItemClick}
                style={menuItemStyle}
                className="block w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 border-b last:border-b-0 transform hover:translate-x-1"
              >
                <Globe size={16} className="transition-transform duration-200 hover:rotate-12" />
                <span>{t.nav.public}</span>
              </a>

              {/* Dashboard */}
              <a
                href="/dashboard"
                onClick={handleMenuItemClick}
                style={menuItemStyle}
                className="block w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 border-b last:border-b-0 transform hover:translate-x-1"
              >
                <LayoutDashboard size={16} className="transition-transform duration-200 hover:scale-110" />
                <span>{t.nav.dashboard}</span>
              </a>

              {/* Settings */}
              <a
                href="/settings"
                onClick={handleMenuItemClick}
                style={menuItemStyle}
                className="block w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 border-b last:border-b-0 transform hover:translate-x-1"
              >
                <Settings size={16} className="transition-transform duration-200 hover:rotate-12" />
                <span>{t.nav.settings}</span>
              </a>

              {/* Admin Panel */}
              {user.username === 'KwinKo' && (
                <a
                  href="/admin"
                  onClick={handleMenuItemClick}
                  style={menuItemStyle}
                  className="block w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 border-b last:border-b-0 transform hover:translate-x-1"
                >
                  <UserCog size={16} className="transition-transform duration-200 hover:rotate-12" />
                  <span>{t.nav.admin}</span>
                </a>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={menuItemStyle}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 transform hover:translate-x-1"
              >
                <LogOut size={16} className="transition-transform duration-200 hover:rotate-5" />
                <span>{t.nav.logout}</span>
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <a
                href="/login"
                onClick={handleMenuItemClick}
                style={menuItemStyle}
                className="block w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 border-b last:border-b-0 transform hover:translate-x-1"
              >
                <LogIn size={16} className="transition-transform duration-200 hover:rotate-5" />
                <span>{t.nav.login}</span>
              </a>
              
              {/* Register */}
              <a
                href="/register"
                onClick={handleMenuItemClick}
                style={menuItemStyle}
                className="block w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 transform hover:translate-x-1"
              >
                <UserPlus size={16} className="transition-transform duration-200 hover:rotate-5" />
                <span>{t.nav.register}</span>
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicMenuButton;