import type { User, Bookmark, Category } from '@/types';

// API base URL
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

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
  token: string;
  refreshToken: string;
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
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    const token = this.getAccessToken();
    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle network errors
      if (!response.ok) {
        // Handle 401 error (token expired or invalid)
        if (response.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the original request
            const retryHeaders = {
              ...headers,
              'Authorization': `Bearer ${this.getAccessToken()}`,
            };
            
            const retryResponse = await fetch(url, {
              ...options,
              headers: retryHeaders,
            });
            
            const retryData = await retryResponse.json();
            return retryData;
          } else {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            // Don't redirect if it's a public API call
            if (!endpoint.includes('/public')) {
              window.location.href = '/login';
            }
            throw new Error('Authentication failed');
          }
        } else {
          // Other error statuses
          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            message: errorData.message || `请求失败: ${response.status}`,
          };
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      // If error is related to authentication, clear tokens
      if (error instanceof Error && error.message.includes('Authentication')) {
        this.clearTokens();
      }
      return {
        success: false,
        message: '网络请求失败，请检查网络连接',
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
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
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
      // 适配后端响应格式 - 直接使用token和refreshToken字段
      const accessToken = response.data.token;
      const refreshToken = response.data.refreshToken;
      
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
      // 适配后端响应格式 - 直接使用token和refreshToken字段
      const accessToken = response.data.token;
      const refreshToken = response.data.refreshToken;
      
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
    return this.request<User>('/users/me');
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
    return this.request<User>(`/users/${username}`);
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

    return this.request<any>(endpoint);
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

    return this.request<any>(endpoint);
  }

  // Category API
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>('/categories');
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
    return this.request<Category[]>(`/categories/user/${username}`);
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
export const apiService = new ApiService();
export default apiService;
