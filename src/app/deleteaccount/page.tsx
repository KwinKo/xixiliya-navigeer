'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TRANSLATIONS } from '@/i18n';

export default function DeleteAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'zh';
  const [t, setT] = useState(TRANSLATIONS[lang === 'zh' ? 'zh' : 'en']);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const token = localStorage.getItem('navigeer_access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // 更新语言
    const translations = TRANSLATIONS[lang === 'zh' ? 'zh' : 'en'];
    setT(translations);
    setIsAuthenticated(true);
  }, [router, lang, isMounted]);

  const showToast = (type: 'success' | 'error', icon: string, message: string) => {
    console.log(`${icon} ${message}`);
  };

  const logout = () => {
    localStorage.removeItem('navigeer_access_token');
    router.push('/login');
  };

  const deleteAccount = async (password: string) => {
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('navigeer_access_token')}`
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, message: data.error || t.loginFail };
      }
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, message: t.networkError };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const expectedConfirmText = lang === 'zh' ? '删除我的账户' : 'Delete my account';
    if (confirmText !== expectedConfirmText) {
      showToast('error', 'AlertCircle', t.passwordIncorrect);
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const result = await deleteAccount(password);
      
      if (result.success) {
        showToast('success', 'CheckCircle', t.accountDeleted);
        setTimeout(() => {
          logout();
          router.push('/');
        }, 2000);
      } else {
        showToast('error', 'AlertCircle', result.message || t.loginFail);
      }
    } catch (error) {
      showToast('error', 'AlertCircle', t.loginFail);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 bg-transparent">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all hover:shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-pink-600">
            {t.deleteAccount}
          </h2>
          <p className="text-gray-500">{t.deleteAccountWarning}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">{t.password}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-red-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
              placeholder={t.enterPassword}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">
              {lang === 'zh' ? '请输入 "删除我的账户" 以确认删除?' : 'Please enter "Delete my account" to confirm?'}
            </Label>
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-red-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
              placeholder={lang === 'zh' ? '请输入确认文本' : 'Enter confirmation text'}
              required
            />
          </div>
          
          <p className="text-red-500 text-sm">{t.deleteAccountWarning}</p>
          
          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={isDeleting}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              {isDeleting ? (lang === 'zh' ? '删除中...' : 'Deleting...') : t.deleteAccount}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="flex-1 py-3 px-6 font-medium rounded-lg shadow transition-all duration-300"
              onClick={() => router.push('/settings')}
            >
              {t.cancel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}