'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TRANSLATIONS } from '@/i18n';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'zh';
  const [t, setT] = useState(TRANSLATIONS[lang === 'zh' ? 'zh' : 'en']);
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // 更新语言
    const translations = TRANSLATIONS[lang === 'zh' ? 'zh' : 'en'];
    setT(translations);
  }, [lang]);

  const showToast = (type: 'success' | 'error', icon: string, message: string) => {
    console.log(`${icon} ${message}`);
  };

  const sendResetCode = async (emailOrUsername: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrUsername }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, message: data.error || t.loginFail };
      }
    } catch (error) {
      console.error('Send reset code error:', error);
      return { success: false, message: t.networkError };
    }
  };

  const resetPassword = async (emailOrUsername: string, code: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/reset-password/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrUsername, code, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, message: data.error || t.loginFail };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: t.networkError };
    }
  };

  const handleSendCode = async () => {
    if (!emailOrUsername) {
      showToast('error', 'AlertCircle', t.emailRequired);
      return;
    }

    const result = await sendResetCode(emailOrUsername);
    if (result.success) {
      showToast('success', 'CheckCircle', t.codeSent);
      setStep('reset');
    } else {
      showToast('error', 'AlertCircle', result.message || t.loginFail);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      showToast('error', 'AlertCircle', t.passwordMismatch);
      return;
    }

    if (newPassword.length < 6) {
      showToast('error', 'AlertCircle', t.passwordTooShort);
      return;
    }

    const result = await resetPassword(emailOrUsername, code, newPassword);
    if (result.success) {
      showToast('success', 'CheckCircle', t.resetSuccess);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      showToast('error', 'AlertCircle', result.message || t.loginFail);
    }
  };

  const handleResendCode = async () => {
    if(countdown > 0) return;
    
    if (!emailOrUsername) {
      showToast('error', 'AlertCircle', t.emailRequired);
      return;
    }

    const result = await sendResetCode(emailOrUsername);
    if (result.success) {
      showToast('success', '✅', t.codeSent);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if(prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      showToast('error', '❌', result.message || t.loginFail);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 bg-transparent">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all hover:shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {t.forgotPassword}
          </h2>
          <p className="text-gray-500">{lang === 'zh' ? '请输入您的邮箱或用户名以重置密码' : 'Please enter your email or username to reset password'}</p>
        </div>
        
        {step === 'email' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">{lang === 'zh' ? '邮箱或用户名' : 'Email or Username'}</Label>
              <Input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder={lang === 'zh' ? '请输入邮箱或用户名' : 'Enter email or username'}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleSendCode}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                {t.sendCode}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="flex-1 py-3 px-6 font-medium rounded-lg shadow transition-all duration-300"
                onClick={() => router.push('/login')}
              >
                {t.cancel}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">{lang === 'zh' ? '邮箱或用户名' : 'Email or Username'}</Label>
              <Input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder={lang === 'zh' ? '请输入邮箱或用户名' : 'Enter email or username'}
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">{t.verificationCode}</Label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder={t.enterCode}
                maxLength={6}
              />
              <div className="flex justify-between">
                <Button
                  onClick={handleResendCode}
                  variant="outline"
                  disabled={countdown > 0}
                  className="px-4 py-2 text-sm"
                >
                  {countdown > 0 ? `${countdown}s ${lang === 'zh' ? '重发' : 'Resend'}` : t.resendCode}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">{t.newPassword}</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder={t.newPasswordPlaceholder}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">{t.confirmNewPassword}</Label>
              <Input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder={t.confirmNewPasswordPlaceholder}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleResetPassword}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                {t.resetPassword}
              </Button>
              
              <Button
                onClick={() => setStep('email')}
                variant="outline"
                className="flex-1 py-3 px-6 font-medium rounded-lg shadow transition-all duration-300"
              >
                {lang === 'zh' ? '返回' : 'Back'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}