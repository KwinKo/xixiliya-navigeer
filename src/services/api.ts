import type { User, Bookmark, Category } from '@/types';

// API 服务层，用于处理客户端请求
import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('navigeer_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 清除无效的 token
      localStorage.removeItem('token');
      // 可选：重定向到登录页
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 导出 axios 实例
export default apiClient;

// Response types
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'navigeer_access_token',
  REFRESH_TOKEN: 'navigeer_refresh_token',
  CURRENT_USER: 'navigeer_current_user',
};

class ApiService {
  // Get token from storage
  private getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  public clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  private getCurrentUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `/api${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getAccessToken();
    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // 区分不同类型的错误
        if (response.status === 401) {
          this.clearTokens();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }

        return {
          success: false,
          message: errorData.message || `请求失败: ${response.status}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);

      // 处理网络异常
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: '网络连接失败，请检查网络设置',
        };
      }

      return {
        success: false,
        message: '未知错误，请稍后重试',
      };
    }
  }

  // Refresh token
  private async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      
      if (data.success && data.data?.tokens) {
        this.setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Auth API
  async login(username: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.data) {
      // 适配后端响应格式 - 支持嵌套tokens对象
      const accessToken = response.data.tokens?.accessToken;
      const refreshToken = response.data.tokens?.refreshToken;
      
      if (accessToken && refreshToken) {
        this.setTokens(accessToken, refreshToken);
        this.setCurrentUser(response.data.user as User);
      }
    }

    return response;
  }

  async register(username: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (response.success && response.data) {
      // 适配后端响应格式 - 支持嵌套tokens对象
      const accessToken = response.data.tokens?.accessToken;
      const refreshToken = response.data.tokens?.refreshToken;
      
      if (accessToken && refreshToken) {
        this.setTokens(accessToken, refreshToken);
        this.setCurrentUser(response.data.user as User);
      }
    }

    return response;
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', {
      method: 'POST',
    });
    this.clearTokens();
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    });
  }

  // User API
  async getCurrentUserInfo(): Promise<ApiResponse<User>> {
    const response = await this.request<any>('/users/me');
    // 后端返回直接的用户对象，包装成 ApiResponse 格式
    if (response && (typeof response === 'object') && ('id' in response || 'username' in response)) {
      return { success: true, data: response as unknown as User };
    }
    return response;
  }

  async updateUserInfo(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async deleteAccount(): Promise<ApiResponse<void>> {
    const response = await this.request<void>('/users/me', {
      method: 'DELETE',
    });

    if (response.success) {
      this.clearTokens();
    }

    return response;
  }

  async getPublicUser(username: string): Promise<ApiResponse<User>> {
    const response = await this.request<any>(`/users/${username}`);
    // 后端返回直接的用户对象，包装成 ApiResponse 格式
    if (response && typeof response === 'object' && ('id' in response || 'username' in response)) {
      return { success: true, data: response as unknown as User };
    }
    return response;
  }

  // Bookmark API
  async getBookmarks(params?: { categoryId?: number; search?: string; page?: number; limit?: number }): Promise<ApiResponse<{
    bookmarks: Bookmark[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.categoryId) queryParams.append('categoryId', params.categoryId.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/bookmarks${queryString ? `?${queryString}` : ''}`;

    const response = await this.request<any>(endpoint);
    // 后端返回直接的 { bookmarks } 格式，包装成 ApiResponse 格式
    if (response && typeof response === 'object' && 'bookmarks' in response) {
      const bookmarksData = response as any;
      return { 
        success: true, 
        data: {
          bookmarks: bookmarksData.bookmarks,
          pagination: bookmarksData.pagination || { page: 1, limit: 10, total: bookmarksData.bookmarks.length, pages: 1 }
        }
      };
    }
    return response;
  }

  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Bookmark>> {
    return this.request<Bookmark>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify(bookmark),
    });
  }

  async updateBookmark(id: number, data: Partial<Bookmark>): Promise<ApiResponse<Bookmark>> {
    return this.request<Bookmark>(`/bookmarks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBookmark(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/bookmarks/${id}`, {
      method: 'DELETE',
    });
  }

  async getPublicBookmarks(username: string, params?: { categoryId?: number; search?: string }): Promise<ApiResponse<{
    bookmarks: Bookmark[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.categoryId) queryParams.append('categoryId', params.categoryId.toString());
      if (params.search) queryParams.append('search', params.search);
    }

    const queryString = queryParams.toString();
    const endpoint = `/bookmarks/user/${username}${queryString ? `?${queryString}` : ''}`;

    const response = await this.request<any>(endpoint);
    // 后端返回直接的 { bookmarks } 或直接数组格式，包装成 ApiResponse 格式
    if (response && typeof response === 'object') {
      const bookmarksData = response as any;
      if ('bookmarks' in bookmarksData) {
        return { 
          success: true, 
          data: {
            bookmarks: bookmarksData.bookmarks,
            pagination: bookmarksData.pagination || { page: 1, limit: 10, total: bookmarksData.bookmarks.length, pages: 1 }
          }
        };
      } else if (Array.isArray(bookmarksData)) {
        return { 
          success: true, 
          data: {
            bookmarks: bookmarksData,
            pagination: { page: 1, limit: 10, total: bookmarksData.length, pages: 1 }
          }
        };
      }
    }
    return response;
  }

  // Category API
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await this.request<any>('/categories');
    // 后端返回直接的 { categories } 格式，包装成 ApiResponse 格式
    if (response && typeof response === 'object' && 'categories' in response) {
      return { success: true, data: (response as any).categories };
    }
    return response;
  }

  async addCategory(name: string): Promise<ApiResponse<Category>> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategoryStats(): Promise<ApiResponse<{
    categories: Array<{
      id: number;
      name: string;
      _count: {
        bookmarks: number;
      };
    }>;
    uncategorized: number;
    total: number;
  }>> {
    return this.request<any>('/categories/stats');
  }

  async getPublicCategories(username: string): Promise<ApiResponse<Category[]>> {
    const response = await this.request<any>(`/categories/user/${username}`);
    // 后端返回直接的 { categories } 或直接数组格式，包装成 ApiResponse 格式
    if (response && typeof response === 'object') {
      const categoriesData = response as any;
      if ('categories' in categoriesData) {
        return { success: true, data: categoriesData.categories };
      } else if (Array.isArray(categoriesData)) {
        return { success: true, data: categoriesData };
      }
    }
    return response;
  }

  // Data API
  async exportData(): Promise<ApiResponse<any>> {
    return this.request<any>('/data/export');
  }

  async importData(data: any): Promise<ApiResponse<{
    importedCategories: number;
    importedBookmarks: number;
  }>> {
    return this.request<any>('/data/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserStats(): Promise<ApiResponse<{
    totalBookmarks: number;
    totalCategories: number;
    publicBookmarks: number;
    privateBookmarks: number;
  }>> {
    return this.request<any>('/data/stats');
  }

  // Admin API
  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<{
    users: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
    }

    const queryString = queryParams.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;

    return this.request<any>(endpoint);
  }

  async updateUser(id: number, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getSystemStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/stats');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    
    // Basic token validation (check if it's not expired)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      // Token is invalid, clear it
      this.clearTokens();
      return false;
    }
  }

  // Get current user from storage
  getStoredUser(): User | null {
    // Only return user if access token exists and is valid
    if (!this.isAuthenticated()) {
      return null;
    }
    return this.getCurrentUser();
  }
}

// Export singleton instance
export const apiService = new ApiService;