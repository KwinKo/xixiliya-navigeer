import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { User } from '@/types';

interface PublicMenuButtonProps {
  lang: string;
  onToggleLang: () => void;
  isMinimalMode: boolean;
  user: User | null;
  onLogout: () => void;
}

const PublicMenuButton: React.FC<PublicMenuButtonProps> = ({ lang, onToggleLang, isMinimalMode, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuStyle = useMemo(() => {
    return {
      backgroundColor: isMinimalMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderColor: isMinimalMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)',
      color: isMinimalMode ? '#333' : '#fff',
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

  return (
    <div className="fixed top-6 right-6 z-50">
      {/* Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={menuStyle}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 hover:scale-105 active:scale-95"
        aria-label="Menu"
      >
        <FontAwesomeIcon 
          icon={isMenuOpen ? "times" : "bars"} 
          size="lg" 
          className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`} 
        />
      </button>

      {/* Menu Items */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 rounded-xl overflow-hidden shadow-2xl animate-fadeIn">
          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            style={menuItemStyle}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 border-b last:border-b-0 transform hover:translate-x-1"
          >
            <FontAwesomeIcon icon="globe" size="sm" className="transition-transform duration-200 hover:rotate-12" />
            <span>{lang === 'zh' ? 'English' : '中文'}</span>
          </button>

          {/* Back to Home */}
          <a
            href="/#/"
            style={menuItemStyle}
            className="block w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 border-b last:border-b-0 transform hover:translate-x-1"
          >
            <FontAwesomeIcon icon="home" size="sm" className="transition-transform duration-200 hover:scale-110" />
            <span>首页</span>
          </a>

          {/* User-specific menu items */}
          {user ? (
            <>
              {/* Dashboard */}
              <a
                href="/#/dashboard"
                style={menuItemStyle}
                className="block w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 border-b last:border-b-0 transform hover:translate-x-1"
              >
                <FontAwesomeIcon icon="tachometer-alt" size="sm" className="transition-transform duration-200 hover:scale-110" />
                <span>仪表盘</span>
              </a>

              {/* Settings */}
              <a
                href="/#/settings"
                style={menuItemStyle}
                className="block w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 border-b last:border-b-0 transform hover:translate-x-1"
              >
                <FontAwesomeIcon icon="cog" size="sm" className="transition-transform duration-200 hover:rotate-12" />
                <span>设置</span>
              </a>

              {/* Admin Panel */}
              {user.username === 'KwinKo' && (
                <a
                  href="/#/admin"
                  style={menuItemStyle}
                  className="block w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 border-b last:border-b-0 transform hover:translate-x-1"
                >
                  <FontAwesomeIcon icon="user-cog" size="sm" className="transition-transform duration-200 hover:rotate-12" />
                  <span>管理后台</span>
                </a>
              )}

              {/* Logout */}
              <button
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }}
                style={menuItemStyle}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 transform hover:translate-x-1"
              >
                <FontAwesomeIcon icon="sign-out-alt" size="sm" className="transition-transform duration-200 hover:rotate-5" />
                <span>退出</span>
              </button>
            </>
          ) : (
            /* Login */
            <a
              href="/#/login"
              style={menuItemStyle}
              className="block w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-200 transform hover:translate-x-1"
            >
              <FontAwesomeIcon icon="sign-in-alt" size="sm" className="transition-transform duration-200 hover:rotate-5" />
              <span>登录</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicMenuButton;