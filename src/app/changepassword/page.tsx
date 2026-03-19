'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TRANSLATIONS } from '@/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang === 'zh' ? 'zh' : 'en'];
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
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
    } else {
      setIsAuthenticated(true);
    }
  }, [router, isMounted]);

  const showToast = (type: 'success' | 'error', icon: string, message: string) => {
    console.log(`${icon} ${message}`);
  };

  const changePassword = async (oldPassword: string, newPassword: string, confirmNewPassword: string) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('navigeer_access_token')}`
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmNewPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, message: data.error || t.changePasswordFailed };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: t.networkError };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmNewPassword) {
      showToast('error', 'AlertCircle', t.passwordMismatch);
      return;
    }
    
    if (formData.newPassword.length < 6) {
      showToast('error', 'AlertCircle', t.passwordTooShort);
      return;
    }
    
    const result = await changePassword(
      formData.oldPassword,
      formData.newPassword,
      formData.confirmNewPassword
    );
    
    if (result.success) {
      showToast('success', 'CheckCircle', t.passwordChangedSuccessfully);
      setFormData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else {
      showToast('error', 'AlertCircle', result.message || t.changePasswordFailed);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 bg-transparent">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all hover:shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {t.changePassword}
          </h2>
          <p className="text-gray-500">{t.changePasswordDesc}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">{t.currentPassword}</Label>
            <Input
              type="password"
              value={formData.oldPassword}
              onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder={t.currentPasswordPlaceholder}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">{t.newPassword}</Label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder={t.newPasswordPlaceholder}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">{t.confirmNewPassword}</Label>
            <Input
              type="password"
              value={formData.confirmNewPassword}
              onChange={(e) => setFormData({...formData, confirmNewPassword: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder={t.confirmNewPasswordPlaceholder}
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="submit"
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              {t.changePassword}
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

