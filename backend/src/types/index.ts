// User types
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  bookmarkLimit: number;
  disabled: boolean;
  siteName: string;
  siteDesc: string;
  bgMode: string;
  bgColor: string;
  bgImage?: string;
  enableParticles: boolean;
  particleStyle: string;
  particleColor: string;
  cardColor: string;
  cardOpacity: number;
  cardTextColor: string;
  enableMinimalMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export interface UserUpdate {
  siteName?: string;
  siteDesc?: string;
  bgMode?: string;
  bgColor?: string;
  bgImage?: string;
  enableParticles?: boolean;
  particleStyle?: string;
  particleColor?: string;
  cardColor?: string;
  cardOpacity?: number;
  cardTextColor?: string;
  enableMinimalMode?: boolean;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserPasswordChange {
  currentPassword: string;
  newPassword: string;
}

export interface UserForgotPassword {
  email: string;
}

export interface UserResetPassword {
  email: string;
  code: string;
  newPassword: string;
}

// Bookmark types
export interface Bookmark {
  id: number;
  userId: number;
  title: string;
  url: string;
  description?: string;
  icon: string;
  categoryId?: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookmarkCreate {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  categoryId?: number;
  isPublic?: boolean;
}

export interface BookmarkUpdate {
  title?: string;
  url?: string;
  description?: string;
  icon?: string;
  categoryId?: number;
  isPublic?: boolean;
}

// Category types
export interface Category {
  id: number;
  userId: number;
  name: string;
  createdAt: Date;
}

export interface CategoryCreate {
  name: string;
}

// Auth types
export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: Omit<User, 'password'>;
    token: string;
    refreshToken: string;
  };
  error?: string;
}

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Data import/export types
export interface ExportData {
  user: Omit<User, 'password'>;
  bookmarks: Bookmark[];
  categories: Category[];
}

export interface ImportData {
  bookmarks: Omit<Bookmark, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[];
  categories: Omit<Category, 'id' | 'userId' | 'createdAt'>[];
}