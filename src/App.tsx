import { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';
import Particles from '@/components/particles';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import ChangePassword from '@/pages/ChangePassword';
import DeleteAccount from '@/pages/DeleteAccount';
import Admin from '@/pages/Admin';
import Public from '@/pages/Public';
import { getTranslation } from '@/i18n';
import type { Lang, User, Bookmark, Category, Toast as ToastType } from '@/types';
import { apiService } from '@/services/api';
import './App.css';

function AppContent() {
  const location = useLocation();
  const [lang, setLang] = useState<Lang>(localStorage.getItem('navigeer_lang') as Lang || 'zh');
  
  // Initialize user state with token validation
  const initializeUserState = () => {
    const user = apiService.getStoredUser();
    if (!user) {
      // Clear any old tokens if user is not valid
      apiService.clearTokens();
    }
    return user;
  };
  
  const [currentUser, setCurrentUserState] = useState<User | null>(initializeUserState());
  const [users, setUsers] = useState<User[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // const [loading, setLoading] = useState(false); // Used for loading state
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastType>({
    show: false,
    icon: '',
    message: '',
    color: '#48bb78',
  });

  const t = useMemo(() => getTranslation(lang), [lang]);

  const isPublicPage = useMemo(() => {
    // In HashRouter, we need to check the hash part
    const hash = location.hash.replace('#', '') || '/';
    const path = hash.split('?')[0];
    
    // List of non-public paths
    const nonPublicPaths = ['/', '/login', '/register', '/dashboard', '/settings', '/admin', '/change-password', '/delete-account'];
    
    // Check if path is a single segment (like /username) and not in non-public list
    const segments = path.split('/').filter(Boolean);
    const isPublic = segments.length === 1 && !nonPublicPaths.includes(path);
    
    // Debug logging
    console.log('isPublicPage check:', {
      hash,
      path,
      segments,
      isPublic
    });
    
    return isPublic;
  }, [location.hash]);

  const settings = useMemo(() => {
    if (!currentUser) {
      return {
        bgMode: 'gradient' as const,
        bgColor: '#667eea',
        bgImage: '',
        enableParticles: false,
        particleStyle: 'stars' as const,
        particleColor: '#ffffff',
        cardColor: '#ffffff',
        cardOpacity: 85,
        cardTextColor: '#333333',
      };
    }
    return {
      bgMode: currentUser.bgMode || 'gradient',
      bgColor: currentUser.bgColor || '#667eea',
      bgImage: currentUser.bgImage || '',
      enableParticles: currentUser.enableParticles || false,
      particleStyle: currentUser.particleStyle || 'stars',
      particleColor: currentUser.particleColor || '#ffffff',
      cardColor: currentUser.cardColor || '#ffffff',
      cardOpacity: currentUser.cardOpacity || 85,
      cardTextColor: currentUser.cardTextColor || '#333333',
    };
  }, [currentUser]);

  const showToast = useCallback((type: 'success' | 'error' | 'warning', icon: string, message: string) => {
    setToast({
      show: true,
      icon,
      message,
      color: type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#ed8936',
    });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const toggleLang = useCallback(() => {
    const newLang = lang === 'zh' ? 'en' : 'zh';
    setLang(newLang);
    localStorage.setItem('navigeer_lang', newLang);
  }, [lang]);

  const handleLogin = useCallback(
    async (username: string, password: string): Promise<{ success: boolean; code?: string }> => {
      const response = await apiService.login(username, password);
      if (response.success && response.data) {
        setCurrentUserState(response.data.user as User);
        showToast('success', '✅', t.loginSuccess);
        return { success: true };
      } else {
        showToast('error', '❌', response.message || t.loginFail);
        return { success: false, code: 'LOGIN_FAILED' };
      }
    },
    [t, showToast]
  );

  const handleRegister = useCallback(
    async (username: string, email: string | null, password: string): Promise<{ success: boolean; message?: string }> => {
      const response = await apiService.register(username, email || '', password);
      if (response.success && response.data) {
        setCurrentUserState(response.data.user as User);
        showToast('success', '✅', t.registerSuccess);
        return { success: true };
      } else {
        showToast('error', '❌', response.message || '注册失败');
        return { success: false, message: response.message };
      }
    },
    [t, showToast]
  );

  const handleSendCode = useCallback(async (email: string): Promise<{ sent: boolean; code?: string }> => {
    const response = await apiService.forgotPassword(email);
    if (response.success) {
      showToast('success', '✅', t.codeSent);
      return { sent: true };
    } else {
      showToast('error', '❌', response.message || '发送验证码失败');
      return { sent: false };
    }
  }, [t, showToast]);

  const handleVerifyCode = useCallback(async (_email: string, _code: string) => {
    // In production, this would verify with the server
    return { success: true };
  }, []);

  const handleLogout = useCallback(async () => {
    await apiService.logout();
    setCurrentUserState(null);
    setUsers([]);
    setBookmarks([]);
    setCategories([]);
    showToast('success', '✅', t.logoutSuccess);
  }, [showToast, t.logoutSuccess]);

  const handleAddBookmark = useCallback(
    async (data: Omit<Bookmark, 'id' | 'createdAt'>) => {
      const response = await apiService.addBookmark(data);
      if (response.success && response.data) {
      setBookmarks((prev) => [...prev, response.data as Bookmark]);
      showToast('success', '✅', t.addBookmarkSuccess);
    } else {
      showToast('error', '❌', response.message || t.addBookmarkFail);
    }
    },
    [showToast, t]
  );

  const handleUpdateBookmark = useCallback(async (id: number, data: Partial<Bookmark>) => {
    const response = await apiService.updateBookmark(id, data);
    if (response.success) {
      setBookmarks((prev) => prev.map(bookmark => bookmark.id === id ? response.data! : bookmark));
      showToast('success', '✅', t.updateBookmarkSuccess);
    } else {
      showToast('error', '❌', response.message || t.updateBookmarkFail);
    }
  }, [showToast, t]);

  const handleDeleteBookmark = useCallback(async (id: number) => {
    const response = await apiService.deleteBookmark(id);
    if (response.success) {
      setBookmarks((prev) => prev.filter(bookmark => bookmark.id !== id));
      showToast('success', '✅', t.deleteBookmarkSuccess);
    } else {
      showToast('error', '❌', response.message || t.deleteBookmarkFail);
    }
  }, [showToast, t]);

  const handleAddCategory = useCallback(async (name: string) => {
    if (!currentUser) return;
    const response = await apiService.addCategory(name);
    if (response.success && response.data) {
      setCategories((prev) => [...prev, response.data as Category]);
      showToast('success', '✅', t.addCategorySuccess);
    } else {
      showToast('error', '❌', response.message || t.addCategoryFail);
    }
  }, [currentUser, showToast, t]);

  const handleDeleteCategory = useCallback(async (id: number) => {
    const response = await apiService.deleteCategory(id);
    if (response.success) {
      setCategories((prev) => prev.filter(category => category.id !== id));
      showToast('success', '✅', t.deleteCategorySuccess);
    } else {
      showToast('error', '❌', response.message || t.deleteCategoryFail);
    }
  }, [showToast, t]);

  const handleExport = useCallback(async () => {
    const response = await apiService.exportData();
    if (response.success && response.data) {
      const blob = new Blob([JSON.stringify(response.data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'navigeer-backup.json';
      a.click();
      showToast('success', '✅', t.exportSuccess);
    } else {
      showToast('error', '❌', response.message || t.exportFail);
    }
  }, [showToast, t]);

  const handleImport = useCallback(
    async (data: string) => {
      const response = await apiService.importData(JSON.parse(data));
      if (response.success) {
        // Refresh data from server
        await fetchUserData();
        showToast('success', '✅', t.importSuccess);
      } else {
        showToast('error', '❌', response.message || t.importFail);
      }
      return response;
    },
    [showToast, t]
  );

  const handleUpdateSettings = useCallback(
    async (newSettings: Partial<User>) => {
      if (!currentUser) return;
      const response = await apiService.updateUserInfo(newSettings);
      if (response.success && response.data) {
        setCurrentUserState(response.data);
        showToast('success', '✅', t.updateSettingsSuccess);
      } else {
        showToast('error', '❌', response.message || t.updateSettingsFail);
      }
    },
    [currentUser, showToast, t]
  );

  const handleUpdateUser = useCallback(async (user: User) => {
    // 对于当前用户，使用updateUserInfo
    if (currentUser && currentUser.id === user.id) {
      const response = await apiService.updateUserInfo(user);
      if (response.success && response.data) {
        setCurrentUserState(response.data);
        showToast('success', '✅', t.updateUserSuccess);
      } else {
        showToast('error', '❌', response.message || t.updateUserFail);
      }
    } else {
      // 对于其他用户，这里可能需要添加管理员更新用户的API方法
      showToast('error', '❌', '管理员更新用户功能尚未实现');
    }
  }, [currentUser, showToast, t]);

  const handleDeleteUser = useCallback(async (userId: number) => {
    // 对于当前用户，使用deleteAccount
    if (currentUser && currentUser.id === userId) {
      const response = await apiService.deleteAccount();
      if (response.success) {
        handleLogout();
        showToast('success', '✅', t.deleteUserSuccess);
      } else {
        showToast('error', '❌', response.message || t.deleteUserFail);
      }
    } else {
      // 对于其他用户，使用管理员删除用户API
      const response = await apiService.deleteUser(userId);
      if (response.success) {
        setUsers((prev) => prev.filter(user => user.id !== userId));
        showToast('success', '✅', t.deleteUserSuccess);
      } else {
        showToast('error', '❌', response.message || t.deleteUserFail);
      }
    }
  }, [currentUser, handleLogout, showToast, t]);

  // Fetch user data when user logs in or component mounts
  const fetchUserData = useCallback(async () => {
    // Double check: only proceed if both currentUser exists and user is authenticated
    if (!currentUser) {
      console.log('No current user, skipping data fetch');
      return;
    }
    
    if (!apiService.isAuthenticated()) {
      console.log('User not authenticated, skipping data fetch');
      setCurrentUserState(null);
      return;
    }
    
    console.log('Fetching user data...');
    // 暂时注释掉setLoading，因为loading变量已被注释
    // setLoading(true);
    try {
      // Fetch user profile
      const userResponse = await apiService.getCurrentUserInfo();
      if (userResponse.success && userResponse.data) {
        setCurrentUserState(userResponse.data);
      } else {
        console.log('Failed to fetch user profile:', userResponse.message);
        setCurrentUserState(null);
        return;
      }

      // Fetch bookmarks
      const bookmarksResponse = await apiService.getBookmarks();
      if (bookmarksResponse.success && bookmarksResponse.data) {
        // 适配后端响应格式 - 直接使用data作为bookmarks数组
        setBookmarks(Array.isArray(bookmarksResponse.data) ? bookmarksResponse.data : bookmarksResponse.data.bookmarks || []);
      }

      // Fetch categories
      const categoriesResponse = await apiService.getCategories();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

      // Fetch users (for admin)
      // 暂时注释掉管理员检查，需要在User类型中添加role属性
      // if (currentUser.role === 'admin') {
        const usersResponse = await apiService.getUsers();
        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data.users || []);
        }
      // }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If API request fails, clear user state
      setCurrentUserState(null);
    } finally {
      // 暂时注释掉setLoading，因为loading变量已被注释
      // setLoading(false);
    }
  }, [currentUser]);

  // Fetch data when user changes
  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    } else {
      // Clear data when user logs out
      setUsers([]);
      setBookmarks([]);
      setCategories([]);
    }
  }, [currentUser, fetchUserData]);

  // Refresh data periodically
  useEffect(() => {
    if (!currentUser || !apiService.isAuthenticated()) return;

    const interval = setInterval(() => {
      fetchUserData();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [currentUser, fetchUserData]);



  const bgStyle = useMemo(() => {
    const bgMode = settings.bgMode || 'gradient';
    const bgColor = settings.bgColor || '#667eea';
    const bgImage = settings.bgImage || '';
    
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
  }, [settings]);

  return (
    <div className="min-h-screen">
      {/* Background */}
      {!isPublicPage && (
        <div className="fixed inset-0 z-0" style={bgStyle} />
      )}

      {/* Particles */}
      {settings.enableParticles && !isPublicPage && !(currentUser?.enableMinimalMode) && (
        <Particles style={settings.particleStyle} color={settings.particleColor} />
      )}

      {/* Navbar - Only show on non-public pages */}
  {!isPublicPage && (
        <Navbar
          user={currentUser}
          lang={lang}
          t={t}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleLang={toggleLang}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content */}
      <main className={`${isPublicPage ? '' : 'relative z-10 pt-8 px-6 pb-12'}`}>
        <Routes>
          {/* 具体路由 */}
          <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route
                      path="/login"
                      element={
                        currentUser ? (
                          <Navigate to="/dashboard" replace />
                        ) : (
                          <Login
                            t={t}
                            onLogin={handleLogin}
                            onShowToast={showToast}
                          />
                        )
                      }
                    />
          <Route
            path="/register"
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register
                  t={t}
                  onRegister={handleRegister}
                  onSendCode={handleSendCode}
                  onVerifyCode={handleVerifyCode}
                  onShowToast={showToast}
                />
              )
            }
          />
          <Route
            path="/forgot-password"
            element={
              <ForgotPassword
                t={t}
                users={users}
                onSendCode={handleSendCode}
                onVerifyCode={handleVerifyCode}
                onUpdateUser={handleUpdateUser}
                onShowToast={showToast}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={currentUser}>
                <Dashboard
                  t={t}
                  user={currentUser!}
                  bookmarks={bookmarks}
                  categories={categories}
                  settings={settings}
                  searchQuery={searchQuery}
                  onAddBookmark={handleAddBookmark}
                  onUpdateBookmark={handleUpdateBookmark}
                  onDeleteBookmark={handleDeleteBookmark}
                  onAddCategory={handleAddCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onExport={handleExport}
                  onImport={handleImport}
                  onShowToast={showToast}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute user={currentUser}>
                <Settings
                  t={t}
                  user={currentUser!}
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onSendCode={handleSendCode}
                  onVerifyCode={(email, code) => { handleVerifyCode(email, code); return { success: false }; }}
                  onShowToast={showToast}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute user={currentUser}>
                <ChangePassword
                  t={t}
                  user={currentUser!}
                  onUpdateUser={handleUpdateUser}
                  onShowToast={showToast}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delete-account"
            element={
              <ProtectedRoute user={currentUser}>
                <DeleteAccount
                  t={t}
                  user={currentUser!}
                  onUpdateUser={handleUpdateUser}
                  onLogout={handleLogout}
                  onShowToast={showToast}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={currentUser} requireAdmin>
                <Admin
                  t={t}
                  users={users}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  onShowToast={showToast}
                />
              </ProtectedRoute>
            }
          />
          {/* 动态路由 - 必须放在最后 */}
          <Route
            path="/:username"
            element={
              <Public
                t={t}
                lang={lang}
                searchQuery={searchQuery}
                onToggleLang={toggleLang}
                user={currentUser}
                onLogout={handleLogout}
              />
            }
          />
        </Routes>
      </main>

      {/* Toast */}
      <Toast toast={toast} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;