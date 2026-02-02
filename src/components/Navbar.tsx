import type { User, Lang } from '@/types';
import type { Translations } from '@/i18n';
import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Globe, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavbarProps {
  user: User | null;
  lang: Lang;
  t: Translations;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onToggleLang: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  user,
  lang,
  t,
  searchQuery,
  onSearchChange,
  onToggleLang,
  onLogout,
}) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [isHovered, setIsHovered] = useState(false);

  const isAuthPage = useMemo(() => {
    // In HashRouter, we need to check the hash part
    const hash = location.hash.replace('#', '') || '/';
    const path = hash.split('?')[0];
    return path === '/login' || path === '/register';
  }, [location.hash]);

  // 导航栏显示由App.tsx控制，不再需要单独的公开页面检查

  return (
    <div 
      className="relative w-full"
    >
      <nav 
        className="navbar px-4 py-3 md:px-6 md:py-4 bg-white/80 backdrop-blur-md border-b border-gray-200/30 shadow-sm transition-all duration-300 ease-in-out opacity-100 scale-y-1 translate-y-0 pointer-events-auto"
      >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 group-hover:from-purple-700 group-hover:to-pink-700 transition-all duration-300">
            XiXiLiYa
          </span>
          <span className="text-gray-700 group-hover:text-gray-900 text-xs md:text-sm transition-colors">Navigeer</span>
        </Link>

        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        {/* Desktop Navigation */}
        <div className={`flex items-center gap-3 md:gap-4 ${isMobile && !isMenuOpen ? 'hidden' : 'flex'}`}>
          {!isAuthPage && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-48 md:w-72 bg-white/20 border-white/30 text-gray-900 placeholder-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          )}

          <button
            onClick={onToggleLang}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white/20 hover:bg-white/30 text-gray-900 rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            <Globe className="w-4 h-4 text-gray-700" />
            <span className="text-xs md:text-sm font-medium">{lang === 'zh' ? '中文' : 'EN'}</span>
          </button>

          {/* Mobile Navigation Menu */}
          {isMobile && isMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border-b border-gray-200/50 py-3 px-4 flex flex-col gap-3 shadow-lg rounded-b-xl">
              {!isAuthPage && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 w-full bg-white border-gray-200 text-gray-900 placeholder-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}
              
              {user ? (
                <>
                  {user.username === 'KwinKo' && (
                    <Link
                      to="/admin"
                      className="text-gray-900 hover:text-purple-600 hover:bg-gray-100 font-medium transition-colors py-2 px-3 rounded-lg"
                    >
                      {t.admin}
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className="text-gray-900 hover:text-purple-600 hover:bg-gray-100 font-medium transition-colors py-2 px-3 rounded-lg"
                  >
                    {t.dashboard}
                  </Link>
                  <Link
                    to="/settings"
                    className="text-gray-900 hover:text-purple-600 hover:bg-gray-100 font-medium transition-colors py-2 px-3 rounded-lg"
                  >
                    {t.settings}
                  </Link>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-900 hover:text-purple-600 hover:bg-gray-100 font-medium transition-colors py-2 px-3 rounded-lg text-left"
                  >
                    {t.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-900 hover:text-purple-600 hover:bg-gray-100 font-medium transition-colors py-2 px-3 rounded-lg"
                  >
                    {t.login}
                  </Link>
                  <Link to="/register">
                    <Button className="w-full py-2 shadow-md hover:shadow-lg transition-all bg-gray-900 text-white hover:bg-gray-800">{t.register}</Button>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Desktop Navigation Links */}
          {!isMobile && user && (
            <>
              {user.username === 'KwinKo' && (
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-purple-600 hover:bg-gray-50 font-medium transition-colors px-3 py-2 rounded-lg"
                >
                  {t.admin}
                </Link>
              )}
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-purple-600 hover:bg-gray-50 font-medium transition-colors px-3 py-2 rounded-lg"
              >
                {t.dashboard}
              </Link>
              <Link
                to="/settings"
                className="text-gray-700 hover:text-purple-600 hover:bg-gray-50 font-medium transition-colors px-3 py-2 rounded-lg"
              >
                {t.settings}
              </Link>
              <button
                onClick={onLogout}
                className="text-gray-700 hover:text-purple-600 hover:bg-gray-50 font-medium transition-colors px-3 py-2 rounded-lg"
              >
                {t.logout}
              </button>
            </>
          )}

          {/* Desktop Auth Links */}
          {!isMobile && !user && (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-purple-600 hover:bg-gray-50 font-medium transition-colors px-3 py-2 rounded-lg"
              >
                {t.login}
              </Link>
              <Link to="/register">
                <Button className="py-2 shadow-md hover:shadow-lg transition-all btn-primary">{t.register}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
      </nav>
    </div>
  );
};

export default Navbar;
