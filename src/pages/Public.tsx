import type { Translations } from '@/i18n';
import type { User, Bookmark, Category } from '@/types';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Particles from '@/components/particles';
import PublicMenuButton from '@/components/PublicMenuButton';
import BackToTopButton from '@/components/BackToTopButton';
import { apiService } from '@/services/api';
import { Search } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface PublicProps {
  t: Translations;
  lang: string;
  searchQuery: string;
  onToggleLang: () => void;
  user: User | null;
  onLogout: () => void;
}

const Public: React.FC<PublicProps> = ({ t, lang, searchQuery: propsSearchQuery, onToggleLang, user, onLogout }) => {
  // const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  // Check if meta parameter is present in URL to hide navigation
  const shouldHideNavigation = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('meta') === 'hide_nav';
  }, []);

  useEffect(() => {
    const fetchPublicData = async () => {
      if (!username) return;
      
      // 暂时注释掉setLoading，因为loading变量已被注释
      // setLoading(true);
      try {
        // 获取用户信息
        const userResponse = await apiService.getPublicUser(username);
        if (userResponse.success && userResponse.data) {
          setTargetUser(userResponse.data);
          
          // 获取公开书签
          const bookmarksResponse = await apiService.getPublicBookmarks(username);
          if (bookmarksResponse.success && bookmarksResponse.data) {
            setBookmarks(Array.isArray(bookmarksResponse.data) ? bookmarksResponse.data : bookmarksResponse.data.bookmarks || []);
          }
          
          // 获取用户公开分类
          const categoriesResponse = await apiService.getPublicCategories(username);
          if (categoriesResponse.success && categoriesResponse.data) {
            setCategories(categoriesResponse.data);
          }
        } else {
          // 用户不存在或API失败
          setTargetUser(null);
        }
      } catch (error) {
        console.error('Error fetching public data:', error);
        // 网络错误时也显示404
        setTargetUser(null);
      } finally {
        // 暂时注释掉setLoading，因为loading变量已被注释
        // setLoading(false);
      }
    };
    
    fetchPublicData();
  }, [username]);

  // 设置浏览器标题
  useEffect(() => {
    if (targetUser) {
      document.title = targetUser.siteName || `${username}${lang === 'zh' ? t.defaultNavName : t.defaultNavName}`;
    } else if (username) {
      document.title = `${username}${lang === 'zh' ? t.defaultNavName : t.defaultNavName}`;
    }
  }, [targetUser, username, lang, t.defaultNavName]);

  const userCategories = useMemo(() => {
    return categories;
  }, [categories]);

  const publicBookmarks = useMemo(() => {
    let result = bookmarks;

    if (selectedCategory !== null) {
      result = result.filter((b) => b.categoryId === selectedCategory);
    }

    const query = (propsSearchQuery || localSearchQuery).toLowerCase();
    if (query.trim()) {
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query) ||
          (b.description && b.description.toLowerCase().includes(query))
      );
    }

    return result;
  }, [bookmarks, selectedCategory, propsSearchQuery, localSearchQuery]);

  const cardStyle = useMemo(() => {
    if (!targetUser) return {};
    const color = targetUser.cardColor || '#ffffff';
    const opacity = (targetUser.cardOpacity || 85) / 100;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`,
    };
  }, [targetUser]);

  // const textStyle = useMemo(() => {
  //   if (!targetUser) return {};
  //   const isMinimalMode = targetUser?.enableMinimalMode || false;
  //   return {
  //     color: targetUser.cardTextColor || (isMinimalMode ? '#333333' : '#ffffff'),
  //   };
  // }, [targetUser]);

  const backgroundStyle = useMemo(() => {
    if (!targetUser) return {};
    const bgMode = targetUser.bgMode || 'gradient';
    const bgColor = targetUser.bgColor || '#667eea';
    const bgImage = targetUser.bgImage || '';

    let styles: React.CSSProperties = {};

    if (bgMode === 'gradient') {
      styles.background = 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)';
      styles.backgroundSize = '400% 400%';
      styles.animation = 'gradientFlow 15s ease infinite';
    } else if (bgMode === 'color') {
      styles.background = bgColor;
    } else if (bgMode === 'image' && bgImage) {
      styles.background = `url(${bgImage}) center/cover no-repeat`;
    }

    return styles;
  }, [targetUser]);

  if (!targetUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl mb-4">404</h1>
          <p>User not found</p>
        </div>
      </div>
    );
  }

  // 根据用户设置决定使用哪种布局
  const isMinimalMode = targetUser?.enableMinimalMode || false;

  return (
    <div className="min-h-screen">
      {/* 使用用户设置的背景 */}
      {isMinimalMode ? (
        // 极简模式背景
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200" />
      ) : (
        // 用户自定义背景
        <div className="fixed inset-0 z-0" style={backgroundStyle} />
      )}

      {/* Particles - 非极简模式显示 */}
      {!isMinimalMode && targetUser?.enableParticles && (
        <Particles
          style={targetUser.particleStyle as 'stars' | 'falling' | 'pulse' | 'float' | 'mixed'}
          color={targetUser.particleColor || '#ffffff'}
        />
      )}

      {/* Public Menu Button */}
      {!shouldHideNavigation && (
        <PublicMenuButton 
          lang={lang} 
          onToggleLang={onToggleLang} 
          isMinimalMode={isMinimalMode} 
          user={user}
          onLogout={onLogout}
        />
      )}

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header - Conditional Display */}
        {!shouldHideNavigation && (
          isMinimalMode ? (
            // 极简模式不显示头部
            <div className="py-8 px-4 sm:px-6 lg:px-8" />
          ) : (
            // 标准模式头部 - 完全透明
            <header className="py-12 px-4 sm:px-6 lg:px-8 transition-all duration-300">
              <div className="max-w-5xl mx-auto text-center">
                <h1 className="text-2xl md:text-3xl font-light text-white mb-3 tracking-tight">
                  {targetUser?.siteName || `${username}${lang === 'zh' ? t.defaultNavName : t.defaultNavName}`}
                </h1>
                {targetUser?.siteDesc && (
                  <p className="text-sm md:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
                    {targetUser.siteDesc}
                  </p>
                )}
              </div>
            </header>
          )
        )}

        {/* Search Bar */}
        {!shouldHideNavigation && (
          <div className="px-4 sm:px-6 lg:px-8 mb-16">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isMinimalMode ? 'text-gray-400' : 'text-white/60'}`} />
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  placeholder="搜索书签..."
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${isMinimalMode ? 'bg-white border-gray-200 shadow-sm focus:ring-blue-400' : 'bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-white/60 focus:ring-purple-500'}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        {!shouldHideNavigation && (
          <div className="px-4 sm:px-6 lg:px-8 mb-16">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border-transparent ${isMinimalMode ? (!selectedCategory ? 'bg-gray-900 text-white shadow-sm' : 'bg-white/20 text-gray-700 hover:bg-white/30') : (!selectedCategory ? 'bg-white/20 text-white shadow-sm' : 'bg-white/20 text-white hover:bg-white/30')}`}
                >
                  {t.all}
                </button>
                {userCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border-transparent ${isMinimalMode ? (selectedCategory === cat.id ? 'bg-gray-900 text-white shadow-sm' : 'bg-white/20 text-gray-700 hover:bg-white/30') : (selectedCategory === cat.id ? 'bg-white/20 text-white shadow-sm' : 'bg-white/20 text-white hover:bg-white/30')}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bookmarks Grid */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-5xl mx-auto">
            {publicBookmarks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {publicBookmarks.map((b) => (
                  <a
                    key={b.id}
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 ${isMinimalMode ? 'shadow-sm' : 'backdrop-blur-sm shadow-sm'}`}
                    style={cardStyle}
                  >
                    <div className="p-6">
                      <div className="w-12 h-12 flex items-center justify-center text-2xl mb-4">
                        {b.icon || <FontAwesomeIcon icon="link" size="lg" />}
                      </div>
                      <h3 className="font-medium mb-2 truncate" style={{ color: targetUser?.cardTextColor || (isMinimalMode ? '#333333' : '#ffffff') }}>
                        {b.title}
                      </h3>
                      <p className="text-sm mb-3 truncate" style={{ color: (targetUser?.cardTextColor || (isMinimalMode ? '#333333' : '#ffffff')) + (isMinimalMode ? '80' : '80') }}>
                        {b.url}
                      </p>
                      {b.description && (
                        <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: (targetUser?.cardTextColor || (isMinimalMode ? '#333333' : '#ffffff')) + (isMinimalMode ? '60' : '60') }}>
                          {b.description}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center py-24 px-4 rounded-2xl ${isMinimalMode ? 'bg-white border border-gray-100 shadow-sm' : 'bg-white/10 backdrop-blur-sm'}`}>
                <div className="text-6xl mb-6"><FontAwesomeIcon icon="envelope" size="5x" /></div>
                <h3 className={`text-xl font-light mb-3 ${isMinimalMode ? 'text-gray-700' : 'text-white'}`}>
                  {t.noPublicBookmarks}
                </h3>
                <p className={`mb-8 text-center max-w-md ${isMinimalMode ? 'text-gray-500' : 'text-white/70'}`}>
                  暂无公开书签
                </p>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${isMinimalMode ? 'bg-white text-gray-800 border border-gray-200 shadow-sm hover:shadow-md' : 'bg-white text-gray-800 shadow-sm hover:shadow-md'}`}
                  >
                    查看全部书签
                  </button>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        {!shouldHideNavigation && (
          <footer className={`py-8 px-4 sm:px-6 lg:px-8 ${isMinimalMode ? 'border-t border-gray-200' : 'border-t border-white/10 backdrop-blur-sm'}`}>
            <div className="max-w-5xl mx-auto text-center">
              <p className={`text-sm ${isMinimalMode ? 'text-gray-500' : 'text-white/60'}`}>
                © {new Date().getFullYear()} {targetUser?.siteName || username}
              </p>
              <p className={`text-xs mt-1 ${isMinimalMode ? 'text-gray-400' : 'text-white/40'}`}>
                个人书签导航
              </p>
            </div>
          </footer>
        )}

        {/* Back to Top Button */}
        {!shouldHideNavigation && (
          <BackToTopButton isMinimalMode={isMinimalMode} />
        )}
      </div>
    </div>
  );
};

export default Public;