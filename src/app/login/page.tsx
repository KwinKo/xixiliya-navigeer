'use client';

import type { Translations } from '@/i18n/index';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { TRANSLATIONS } from '@/i18n/index';
import { useLanguage } from '@/contexts/LanguageContext';

// 真实的登录函数
const loginUser = async (username: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: username, password }), // 注意：API使用email字段
    });

    const data = await response.json();
    console.log('Login API response:', { response: data, ok: response.ok });

    if (response.ok) {
      if (data.data && data.data.tokens && data.data.tokens.accessToken) {
        return { 
          success: true, 
          token: data.data.tokens.accessToken,
          tokens: data.data.tokens,
          user: data.data.user 
        };
      } else {
        console.error('Login API error: Missing tokens in response');
        return { success: false, code: 'MISSING_TOKEN' };
      }
    } else {
      return { success: false, code: data.error || 'LOGIN_FAILED' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, code: 'NETWORK_ERROR' };
  }
};

// Toast 提示函数
const showToast = (type: 'success' | 'error', icon: string, message: string) => {
  if (type === 'success') {
    toast.success(message);
  } else {
    toast.error(message);
  }
};

export default function Page() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [t, setT] = useState(TRANSLATIONS.zh);
  const [form, setForm] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const translations = TRANSLATIONS[lang === 'zh' ? 'zh' : 'en'];
    setT(translations);
    // 当语言变化时，清除错误和成功提示，确保下次显示正确的语言
    setError(null);
    setSuccess(null);
  }, [lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    console.log('=== Login form submitted ===');
    console.log('Form data:', form);
    
    try {
      const result = await loginUser(form.username, form.password);
      console.log('Login result:', result);
      
      if (result.success && result.token) {
        console.log('=== Login successful ===');
        console.log('Token:', result.token);
        console.log('User:', result.user);
        
        // 保存token到localStorage (使用与API服务一致的键名)
        localStorage.setItem('navigeer_access_token', result.token);
        console.log('Token saved to localStorage:', localStorage.getItem('navigeer_access_token'));
        
        // 保存refresh token
        if (result.tokens?.refreshToken) {
          localStorage.setItem('navigeer_refresh_token', result.tokens.refreshToken);
          console.log('Refresh token saved to localStorage');
        }
        
        // 保存用户信息到localStorage
        if (result.user) {
          localStorage.setItem('navigeer_current_user', JSON.stringify(result.user));
          console.log('User saved to localStorage:', localStorage.getItem('navigeer_current_user'));
        }
        
        // 同时设置token到cookie，以便middleware能够看到
        document.cookie = `token=${result.token}; path=/; max-age=86400; SameSite=Lax`;
        console.log('Token saved to cookie');
        console.log('Cookie:', document.cookie);
        
        // 立即重定向到dashboard
        console.log('=== Redirecting to /dashboard ===');
        window.location.href = '/dashboard';
      } else {
        console.log('=== Login failed ===');
        console.log('Error code:', result.code);
        const errorMessage = getErrorMessage(result.code);
        setError(errorMessage);
        console.log('Error message set:', errorMessage);
      }
    } catch (error) {
      console.error('=== Login error ===', error);
      setError('登录过程中发生错误');
    } finally {
      setIsSubmitting(false);
      console.log('Form submission completed');
    }
  };

  const getErrorMessage = (code?: string) => {
    switch (code) {
      case 'Invalid credentials':
        return t.passwordIncorrect;
      case 'USER_NOT_FOUND':
        return t.usernameNotFound;
      case 'ACCOUNT_DISABLED':
        return t.userDisabled;
      default:
        return t.loginFail;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="glass-card p-8 w-full max-w-md transform transition-all hover:shadow-2xl animate-fadeIn">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {t.loginTitle}
          </h2>
          <p className="text-gray-500">{t.welcomeBack}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* 错误和成功信息显示 */}
          {error && (
            <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.01]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-red-100/30 rounded-full backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span className="text-red-700 font-medium text-sm leading-relaxed">{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.01]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-green-100/30 rounded-full backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-green-700 font-medium text-sm leading-relaxed">{success}</span>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">{t.username}</Label>
            <Input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder={t.enterUsername}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">{t.password}</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder={t.enterPassword}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-800">
              {t.forgotPassword}
            </Link>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            {isSubmitting ? t.login : t.loginBtn}
          </Button>
        </form>
        <p className="text-center mt-8 text-gray-600">
          {t.noAccount}{' '}
          <Link href="/register" className="text-purple-600 font-bold hover:text-purple-800 transition-colors">
            {t.register}
          </Link>
        </p>
      </div>
    </div>
  );
}