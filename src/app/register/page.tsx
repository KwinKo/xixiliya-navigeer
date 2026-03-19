'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TRANSLATIONS } from '@/i18n/index';
import type { Translations } from '@/i18n/index';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface RegisterProps {
  t: Translations;
  onRegister: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string; user?: any; tokens?: any; code?: string }>;
  onSendCode: (email: string) => Promise<{ sent: boolean; code?: string }>;
  onVerifyCode: (email: string, code: string) => Promise<{ success: boolean; message?: string }>;
  onShowToast: (type: 'success' | 'error', icon: string, message: string) => void;
}

const RegisterComponent = ({
  t,
  onRegister,
  onSendCode,
  onVerifyCode,
  onShowToast,
}: RegisterProps) => {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 当语言变化时，清除错误和成功提示，确保下次显示正确的语言
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [t]);



  const getErrorMessage = (code?: string) => {
    switch (code) {
      case 'USERNAME_ALREADY_EXISTS':
        return t.userExists;
      case 'EMAIL_ALREADY_EXISTS':
        return t.emailExists;
      case 'INVALID_EMAIL':
        return t.invalidEmail;
      case 'NETWORK_ERROR':
        return t.networkError;
      default:
        return t.registerFail;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    // 验证用户名
    if (!form.username) {
      setError(t.usernameRequired || '请输入用户名');
      setIsSubmitting(false);
      return;
    }
    if (form.username.length < 3) {
      setError(t.usernameTooShort || '用户名长度不能少于3位');
      setIsSubmitting(false);
      return;
    }
    
    // 验证email（现在是必需的）
    if (!form.email) {
      setError(t.emailRequired);
      setIsSubmitting(false);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError(t.invalidEmail);
      setIsSubmitting(false);
      return;
    }
    
    // 验证密码
    if (!form.password) {
      setError(t.passwordRequired || '请输入密码');
      setIsSubmitting(false);
      return;
    }
    if (form.password.length < 8) {
      setError(t.passwordTooShort || '密码长度不能少于8位');
      setIsSubmitting(false);
      return;
    }
    
    // 验证密码复杂度
    const hasUpperCase = /[A-Z]/.test(form.password);
    const hasLowerCase = /[a-z]/.test(form.password);
    const hasNumbers = /\d/.test(form.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);
    
    console.log('Frontend password validation:', {
      password: form.password,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    });
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      setError(t.passwordComplexity || '密码必须包含大小写字母、数字和特殊字符');
      setIsSubmitting(false);
      return;
    }
    
    // 验证验证码（如果启用了验证码功能）
    if (false) { // 暂时禁用验证码功能，简化注册流程
      if (!form.verificationCode) {
        setError(t.codeRequired);
        setIsSubmitting(false);
        return;
      }
      const verifyResult = await onVerifyCode(form.email, form.verificationCode);
      if (!verifyResult.success) {
        setError(verifyResult.message || t.codeIncorrect);
        setIsSubmitting(false);
        return;
      }
    }
    
    if (form.password !== form.confirmPassword) {
      setError(t.passwordMismatch);
      setIsSubmitting(false);
      return;
    }
    
    const result = await onRegister(form.username, form.email, form.password);
    if (result.success && result.tokens?.accessToken) {
      // 保存token并重定向到dashboard (使用与API服务一致的键名)
      localStorage.setItem('navigeer_access_token', result.tokens.accessToken);
      // 保存refresh token
      if (result.tokens.refreshToken) {
        localStorage.setItem('navigeer_refresh_token', result.tokens.refreshToken);
      }
      // 保存用户信息到localStorage
      if (result.user) {
        localStorage.setItem('navigeer_current_user', JSON.stringify(result.user));
      }
      // 立即重定向
      window.location.href = '/dashboard';
    } else {
      const errorMessage = getErrorMessage((result as any).code);
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="glass-card p-8 w-full max-w-md transform transition-all hover:shadow-2xl animate-fadeIn">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {t.registerTitle}
          </h2>
          <p className="text-gray-500">{t.registerSubtitle}</p>
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
            <Label className="block text-sm font-medium text-gray-700">
              {t.email}
            </Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder={t.enterEmail}
              required
            />
          </div>
          {/* 移除验证码部分，简化注册流程 */}
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
            <p className="text-xs text-gray-500 mt-1">
              {t.passwordRequirements}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">{t.confirmPassword}</Label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder={t.confirmPassword}
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            {isSubmitting ? t.registering : t.registerBtn}
          </Button>
        </form>
        <p className="text-center mt-8 text-gray-600">
          {t.hasAccount}{' '}
          <Link href="/login" className="text-purple-600 font-bold hover:text-purple-800 transition-colors">
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
};

// 模拟的API调用函数
const registerUser = async (username: string, email: string, password: string): Promise<{ success: boolean; message?: string; token?: string; user?: any; tokens?: any; code?: string }> => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    console.log('Register API response:', { response: data, ok: response.ok });

    if (response.ok) {
      return { 
        success: true, 
        token: data.data.tokens.accessToken,
        tokens: data.data.tokens,
        user: data.data.user
      };
    } else {
      return { success: false, code: data.error || 'REGISTRATION_FAILED' };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, code: 'NETWORK_ERROR' };
  }
};

const sendVerificationCode = async (email: string) => {
  // 这里可以实现真实的验证码发送逻辑
  // 目前先返回模拟结果
  return { sent: true };
};

const verifyVerificationCode = async (email: string, code: string) => {
  // 这里可以实现真实的验证码验证逻辑
  // 目前先返回模拟结果
  return { success: true };
};

const showToast = (type: 'success' | 'error', icon: string, message: string) => {
  if (type === 'success') {
    toast.success(message);
  } else {
    toast.error(message);
  }
};

export default function RegisterPage() {
  const { lang } = useLanguage();
  const [t, setT] = useState(TRANSLATIONS.zh);

  // 根据语言参数设置翻译
  useEffect(() => {
    const translations = TRANSLATIONS[lang === 'zh' ? 'zh' : 'en'];
    setT(translations);
  }, [lang]);

  const handleRegister = async (username: string, email: string, password: string): Promise<{ success: boolean; message?: string; token?: string; code?: string }> => {
    return await registerUser(username, email, password);
  };

  const handleSendCode = async (email: string) => {
    return await sendVerificationCode(email);
  };

  const handleVerifyCode = async (email: string, code: string) => {
    return await verifyVerificationCode(email, code);
  };

  const handleShowToast = (type: 'success' | 'error', icon: string, message: string) => {
    showToast(type, icon, message);
  };

  return (
    <RegisterComponent 
      t={t}
      onRegister={handleRegister}
      onSendCode={handleSendCode}
      onVerifyCode={handleVerifyCode}
      onShowToast={handleShowToast}
    />
  );
}