import type { User, Bookmark, Category, VerificationCode, Lang } from '@/types';

const STORAGE_KEYS = {
  USERS: 'navigeer_users',
  BOOKMARKS: 'navigeer_bookmarks',
  CATEGORIES: 'navigeer_categories',
  CURRENT_USER: 'navigeer_currentUser',
  VERIFICATION_CODES: 'navigeer_verification_codes',
  LANG: 'navigeer_lang',
};

// Initialize default data
export function initStorage(): void {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!users) {
    const defaultUsers: User[] = [
      {
        id: 1,
        username: 'KwinKo',
        password: 'KwinKo99',
        email: 'admin@xixiliya.com',
        bookmarkLimit: 9999,
        disabled: false,
        siteName: "KwinKo的导航",
        siteDesc: '个人书签收藏',
        bgMode: 'gradient',
        bgColor: '#667eea',
        bgImage: '',
        enableParticles: false,
        particleStyle: 'stars',
        particleColor: '#ffffff',
        cardColor: '#ffffff',
        cardOpacity: 85,
        cardTextColor: '#333333',
        enableMinimalMode: false,
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
}

// Users
export function getUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function updateUser(updatedUser: User): void {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    saveUsers(users);
  }
}

export function deleteUser(userId: number): void {
  const users = getUsers().filter((u) => u.id !== userId);
  saveUsers(users);
  // Also delete user's bookmarks and categories
  const bookmarks = getBookmarks().filter((b) => b.userId !== userId);
  const categories = getCategories().filter((c) => c.userId !== userId);
  saveBookmarks(bookmarks);
  saveCategories(categories);
}

// Bookmarks
export function getBookmarks(): Bookmark[] {
  const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
  return data ? JSON.parse(data) : [];
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
}

export function addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark {
  const bookmarks = getBookmarks();
  const newBookmark: Bookmark = {
    ...bookmark,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  bookmarks.push(newBookmark);
  saveBookmarks(bookmarks);
  return newBookmark;
}

export function updateBookmark(id: number, data: Partial<Bookmark>): void {
  const bookmarks = getBookmarks();
  const index = bookmarks.findIndex((b) => b.id === id);
  if (index !== -1) {
    bookmarks[index] = { ...bookmarks[index], ...data };
    saveBookmarks(bookmarks);
  }
}

export function deleteBookmark(id: number): void {
  const bookmarks = getBookmarks().filter((b) => b.id !== id);
  saveBookmarks(bookmarks);
}

// Categories
export function getCategories(): Category[] {
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  return data ? JSON.parse(data) : [];
}

export function saveCategories(categories: Category[]): void {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function addCategory(category: Omit<Category, 'id'>): Category {
  const categories = getCategories();
  const newCategory: Category = {
    ...category,
    id: Date.now(),
  };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

export function deleteCategory(id: number): void {
  const categories = getCategories().filter((c) => c.id !== id);
  saveCategories(categories);
}

// Current User
export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// Verification Codes
export function getVerificationCodes(): Record<string, VerificationCode> {
  const data = localStorage.getItem(STORAGE_KEYS.VERIFICATION_CODES);
  return data ? JSON.parse(data) : {};
}

export function saveVerificationCode(email: string, code: string): void {
  const codes = getVerificationCodes();
  codes[email] = { code, timestamp: Date.now() };
  localStorage.setItem(STORAGE_KEYS.VERIFICATION_CODES, JSON.stringify(codes));
}

export function verifyCode(email: string, code: string): { success: boolean; message?: string } {
  const codes = getVerificationCodes();
  const record = codes[email];
  
  if (!record) {
    return { success: false, message: 'codeIncorrect' };
  }
  
  // 5 minutes expiry
  if (Date.now() - record.timestamp > 5 * 60 * 1000) {
    delete codes[email];
    localStorage.setItem(STORAGE_KEYS.VERIFICATION_CODES, JSON.stringify(codes));
    return { success: false, message: 'codeExpired' };
  }
  
  if (record.code !== code) {
    return { success: false, message: 'codeIncorrect' };
  }
  
  // Remove used code
  delete codes[email];
  localStorage.setItem(STORAGE_KEYS.VERIFICATION_CODES, JSON.stringify(codes));
  return { success: true };
}

// Language
export function getLanguage(): Lang {
  const data = localStorage.getItem(STORAGE_KEYS.LANG);
  return (data as Lang) || 'zh';
}

export function setLanguage(lang: Lang): void {
  localStorage.setItem(STORAGE_KEYS.LANG, lang);
}

// Export/Import
export function exportData(): string {
  const data = {
    bookmarks: getBookmarks(),
    categories: getCategories(),
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonData: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonData);
    if (data.bookmarks) {
      saveBookmarks(data.bookmarks);
    }
    if (data.categories) {
      saveCategories(data.categories);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Invalid JSON format' };
  }
}

// Get user settings
export function getUserSettings(user: User | null) {
  if (!user) {
    return {
      bgMode: 'gradient' as const,
      bgColor: '#667eea',
      bgImage: '',
      enableParticles: false,
      particleStyle: 'stars' as const,
      particleColor: '#ffffff',
      cardColor: '#ffffff',
      cardTextColor: '#ffffff',
      cardOpacity: 85,
    };
  }
  return {
    bgMode: user.bgMode || 'gradient',
    bgColor: user.bgColor || '#667eea',
    bgImage: user.bgImage || '',
    enableParticles: user.enableParticles || false,
    particleStyle: user.particleStyle || 'stars',
    particleColor: user.particleColor || '#ffffff',
    cardColor: user.cardColor || '#ffffff',
    cardTextColor: user.cardTextColor || '#ffffff',
    cardOpacity: user.cardOpacity || 85,
  };
}