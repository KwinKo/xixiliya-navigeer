'use client';

import type { Translations } from '@/i18n';
import type { User, Bookmark, Category } from '@/types';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Particles from '@/components/particles';
import BackToTopButton from '@/components/BackToTopButton';
import { Link as LinkIcon, Star, Bookmark as BookmarkIcon, Heart, Globe, Home, ExternalLink, CheckCircle, MessageSquare, Mail, Share, Phone, Calendar, Clock, MapPin, Code, Database, Server, Cloud, Wifi, Smartphone, Laptop, Monitor, Image, Music, Video, FileText, Gamepad2, Download, Upload, Settings, Lock, Zap, TrendingUp, Award, Target, Info, HelpCircle, AlertCircle, ChevronRight, ChevronDown, ArrowUp, ArrowDown, RefreshCw, Copy, Folder } from 'lucide-react';
import { TRANSLATIONS } from '@/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/services/api';

// 图标组件映射
const iconMap: { [key: string]: any } = {
  LinkIcon, Star, BookmarkIcon, Heart, Globe, Home, ExternalLink, CheckCircle,
  MessageSquare, Mail, Share, Phone, Calendar, Clock, MapPin,
  Code, Database, Server, Cloud, Wifi, Smartphone, Laptop, Monitor,
  Image, Music, Video, FileText, Gamepad2, Download, Upload,
  Settings, Lock, Zap, TrendingUp, Award, Target, Info,
  HelpCircle, AlertCircle, ChevronRight, ChevronDown, ArrowUp, ArrowDown, RefreshCw, Copy, Folder,
};



interface PublicProps {
  t?: Translations;
  searchQuery?: string;
}

function PublicComponent({ t: propTranslations, searchQuery: propsSearchQuery }: { t?: Translations; searchQuery?: string }) {
  // const navigate = useNavigate();
  const params = useParams<{ username: string }>();
  const username = params?.username;
  const { lang } = useLanguage();
  
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [translations, setTranslations] = useState<Translations>(TRANSLATIONS.zh);
  const [isMounted, setIsMounted] = useState(false);
  const [SearchIcon, setSearchIcon] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    import('lucide-react').then((module) => {
      setSearchIcon(() => module.Search);
    });
  }, []);

  // 监听localStorage变化，当用户登录或退出时重新获取数据
  useEffect(() => {
    if (!isMounted) return;
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'navigeer_current_user' || event.key === 'navigeer_access_token' || event.key === 'navigeer_refresh_token') {
        console.log('Storage changed, reloading data...');
        // 重新获取数据
        const fetchDataAgain = async () => {
          if (!username) return;

          try {
            // 获取用户信息
            const userResponse = await apiService.getPublicUser(username);
            if (userResponse.success && userResponse.data) {
              setTargetUser(userResponse.data);

              // 检查当前登录用户是否是页面所有者
              const currentUser = apiService.getStoredUser();
              const isOwner = currentUser && currentUser.username === username;

              // 根据是否是所有者获取不同的书签数据
              let bookmarksResponse;
              if (isOwner) {
                bookmarksResponse = await apiService.getBookmarks();
              } else {
                bookmarksResponse = await apiService.getPublicBookmarks(username);
              }
              
              if (bookmarksResponse.success && bookmarksResponse.data) {
                const bookmarksData = Array.isArray(bookmarksResponse.data) ? bookmarksResponse.data : bookmarksResponse.data.bookmarks || [];
                setBookmarks(bookmarksData);
              }

              // 根据是否是所有者获取不同的分类数据
              let categoriesResponse;
              if (isOwner) {
                categoriesResponse = await apiService.getCategories();
              } else {
                categoriesResponse = await apiService.getPublicCategories(username);
              }
              
              if (categoriesResponse.success && categoriesResponse.data) {
                setCategories(categoriesResponse.data);
              }
            }
          } catch (error) {
            console.error('Error reloading data:', error);
          }
        };

        fetchDataAgain();
      }
    };

    // 添加事件监听器
    window.addEventListener('storage', handleStorageChange);

    // 清理事件监听器
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [username, isMounted]);



  // 更新翻译文本
  useEffect(() => {
    // 如果父组件提供了翻译，则使用它
    if (propTranslations) {
      setTranslations(prev => ({ ...prev, ...propTranslations }));
    } else {
      // 否则根据当前语言使用完整的翻译数据
      setTranslations(TRANSLATIONS[lang === 'zh' ? 'zh' : 'en']);
    }
  }, [propTranslations, lang]);

  // Check if meta parameter is present in URL to hide navigation
  const shouldHideNavigation = useMemo(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('meta') === 'hide_nav';
    }
    return false;
  }, []);

  useEffect(() => {
    const fetchPublicData = async () => {
      if (!username) return;

      try {
        console.log('Fetching public data for username:', username);
        
        // 获取用户信息
        const userResponse = await apiService.getPublicUser(username);
        console.log('User response:', userResponse);
        
        if (userResponse.success && userResponse.data) {
          console.log('Setting target user:', userResponse.data);
          setTargetUser(userResponse.data);

          // 检查当前登录用户是否是页面所有者
          const currentUser = apiService.getStoredUser();
          const isOwner = currentUser && currentUser.username === username;
          console.log('Is current user the owner:', isOwner);

          // 根据是否是所有者获取不同的书签数据
          let bookmarksResponse;
          if (isOwner) {
            // 所有者可以看到所有书签（包括私有）
            console.log('Fetching all bookmarks for owner');
            bookmarksResponse = await apiService.getBookmarks();
          } else {
            // 非所有者只能看到公开书签
            console.log('Fetching public bookmarks for visitor');
            bookmarksResponse = await apiService.getPublicBookmarks(username);
          }
          
          console.log('Bookmarks response:', bookmarksResponse);
          if (bookmarksResponse.success && bookmarksResponse.data) {
            const bookmarksData = Array.isArray(bookmarksResponse.data) ? bookmarksResponse.data : bookmarksResponse.data.bookmarks || [];
            console.log('Setting bookmarks:', bookmarksData);
            setBookmarks(bookmarksData);
          }

          // 根据是否是所有者获取不同的分类数据
          let categoriesResponse;
          if (isOwner) {
            // 所有者可以看到所有分类
            console.log('Fetching all categories for owner');
            categoriesResponse = await apiService.getCategories();
          } else {
            // 非所有者只能看到公开分类
            console.log('Fetching public categories for visitor');
            categoriesResponse = await apiService.getPublicCategories(username);
          }
          
          console.log('Categories response:', categoriesResponse);
          if (categoriesResponse.success && categoriesResponse.data) {
            console.log('Setting categories:', categoriesResponse.data);
            setCategories(categoriesResponse.data);
          }
        } else {
          console.log('User not found or API failed');
          // 用户不存在或API失败
          setTargetUser(null);
        }
      } catch (error) {
        console.error('Error fetching public data:', error);
        // 网络错误时也显示404
        setTargetUser(null);
      }
    };

    fetchPublicData();
  }, [username]);

  // 设置浏览器标题
  useEffect(() => {
    if (targetUser) {
      document.title = targetUser.siteName || `${username}${lang === 'zh' ? translations.defaultNavName : translations.defaultNavName}`;
    } else if (username) {
      document.title = `${username}${lang === 'zh' ? translations.defaultNavName : translations.defaultNavName}`;
    }
  }, [targetUser, username, lang, translations.defaultNavName]);

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
                  {targetUser?.siteName || `${username}${lang === 'zh' ? translations.defaultNavName : translations.defaultNavName}`}
                </h1>
                {targetUser?.siteDesc && (
                  <p className="text-sm md:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
                    {targetUser.siteDesc || (lang === 'zh' ? '个人书签导航' : 'Personal Bookmarks')}
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
                {SearchIcon && <SearchIcon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isMinimalMode ? 'text-gray-400' : 'text-white/60'}`} />}
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  placeholder={lang === 'zh' ? '搜索书签...' : 'Search bookmarks...'}
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
                  {translations.all}
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
                        {b.icon && iconMap[b.icon] ? (
                          (() => {
                            const IconComponent = iconMap[b.icon];
                            return <IconComponent size={32} style={{ color: targetUser?.cardTextColor || (isMinimalMode ? '#333333' : '#ffffff') }} />;
                          })()
                        ) : b.icon ? (
                          <span className="text-2xl">{b.icon}</span>
                        ) : (
                          <LinkIcon size={32} style={{ color: targetUser?.cardTextColor || (isMinimalMode ? '#333333' : '#ffffff') }} />
                        )}
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
                <div className="text-6xl mb-6" style={{ color: isMinimalMode ? '#9ca3af' : 'rgba(255,255,255,0.7)' }}>
                  <Folder size={64} />
                </div>
                <h3 className={`text-xl font-light mb-3 ${isMinimalMode ? 'text-gray-700' : 'text-white'}`}>
                  {translations.noPublicBookmarks}
                </h3>
                <p className={`mb-8 text-center max-w-md ${isMinimalMode ? 'text-gray-500' : 'text-white/70'}`}>
                  {lang === 'zh' ? '暂无公开书签' : 'No public bookmarks available'}
                </p>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${isMinimalMode ? 'bg-white text-gray-800 border border-gray-200 shadow-sm hover:shadow-md' : 'bg-white text-gray-800 shadow-sm hover:shadow-md'}`}
                  >
                    {lang === 'zh' ? '查看全部书签' : 'View all bookmarks'}
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
                {lang === 'zh' ? '个人书签导航' : 'Personal Bookmarks'}
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

export default PublicComponent;